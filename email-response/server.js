require("dotenv").config();
const express = require("express");
const ngrok = require("ngrok");
const { google } = require('googleapis');
const mongoose = require('mongoose');
const Mailbox = require("./models/Mailbox");
const Email = require("./models/Email");

const { generateReplyContent } = require('./services/openRouterService');

const app = express();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Gmail API client setup with OAuth2
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

const gmail = google.gmail('v1');

// Helper function to get refresh token from MongoDB
async function getRefreshToken(googleEmail) {
    try {
        
        console.log('Looking up refresh token for googleEmail:', googleEmail);
        const mailbox = await Mailbox.findOne({ googleEmail });

        if (!mailbox || !mailbox.refreshToken) {
            throw new Error('Refresh token not found for user');
        }
        return mailbox.refreshToken;
    } catch (error) {
        console.error('Error getting refresh token:', error);
        throw error;
    }
}

// Helper function to set up authentication with refresh token
async function setupAuth(googleEmail) {
    const refreshToken = await getRefreshToken(googleEmail);
    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });
    return oauth2Client;
}

// Middleware for JSON and URL encoding
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route to test the server
app.get("/", (req, res) => {
    res.send("Server is running!");
});

// Dynamic route handling for multiple users
// Helper function to decode base64 URL-safe strings
function base64UrlDecode(input) {
    // Replace URL-safe characters
    input = input.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const pad = input.length % 4;
    if (pad) {
        input += new Array(5 - pad).join('=');
    }
    return Buffer.from(input, 'base64').toString('utf8');
}

// Helper function to extract email address from a header string
function extractEmail(headerValue) {
    const matches = headerValue.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return matches ? matches[0] : null;
}

// Helper function to parse email message
function parseMessage(message, userEmail) {
    const headers = {};
    let body = '';

    if (message.payload) {
        // Get headers
        message.payload.headers.forEach(header => {
            headers[header.name.toLowerCase()] = header.value;
        });

        // Get body
        if (message.payload.body.data) {
            body = base64UrlDecode(message.payload.body.data);
        } else if (message.payload.parts) {
            // Handle multipart messages
            message.payload.parts.forEach(part => {
                if (part.mimeType === 'text/plain' && part.body.data) {
                    body += base64UrlDecode(part.body.data);
                }
            });
        }
    }

    // Determine if email is inbound or outbound
    let direction = 'unknown';
    if (headers.from && headers.to) {
        const fromEmail = extractEmail(headers.from);
        const toEmails = headers.to.split(',').map(email => extractEmail(email)).filter(email => email);
        
        // Check if user's email is in the from field
        const isFromUser = fromEmail === userEmail;
        // Check if user's email is in any of the to fields
        const isToUser = toEmails.includes(userEmail);

        if (isFromUser && !isToUser) {
            direction = 'outbound';
        } else if (!isFromUser && isToUser) {
            direction = 'inbound';
        } else if (isFromUser && isToUser) {
            direction = 'self';  // Email to self
        }
    }

    return {
        id: message.id,
        threadId: message.threadId,
        headers,
        body,
        content: body, // Adding the email content
        snippet: message.snippet,
        direction,
        from: extractEmail(headers.from),
        to: headers.to ? headers.to.split(',').map(email => extractEmail(email)).filter(email => email) : []
    };
}

async function replyToEmail(content) {

    const finalBody = await generateReplyContent(content);
      
    // const emailResult = await emailService.sendEmail(req.user.id, user.email, email, subject, finalBody);
      
    console.log(finalBody);
    return finalBody; 

}


// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function saveEmail(userId, parsedMessage) {
    // Handle Message
    const mostRecentEmailInThread = await Email.findOne({ threadId: parsedMessage.threadId }).sort({ date: -1 });
    const parsedMessageAlreadyExists = await Email.findOne({ emailId: parsedMessage.id });

    if (mostRecentEmailInThread && !parsedMessageAlreadyExists) {
        console.log("EMAIL RES SAVED");
        await Email.create({
            userId: mongoose.Types.ObjectId.createFromHexString(userId),
            previousEmail: mostRecentEmailInThread._id,
            subject: parsedMessage.headers.subject,
            from: parsedMessage.from,
            to: parsedMessage.to,
            emailId: parsedMessage.id,
            threadId: parsedMessage.threadId,
            direction: parsedMessage.direction,
            content: parsedMessage.content
        });

        if(parsedMessage.direction == "inbound") {
            replyToEmail(parsedMessage.content);
        }
    }


}

// Helper function to fetch history with retries
async function fetchHistoryWithRetry(auth, historyId, maxRetries = 3, initialDelay = 1000) {
    let lastError;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await gmail.users.history.list({
                userId: 'me',
                startHistoryId: historyId,
                auth: auth
            });

            const history = response.data.history || [];
            if (history.length === 0 && attempt < maxRetries) {
                console.log(`Attempt ${attempt}: No history records found, waiting ${delay}ms before retry...`);
                await wait(delay);
                delay *= 2; // Exponential backoff
                continue;
            }
            return response;
        } catch (error) {
            lastError = error;
            if (error.response?.status === 404) {
                throw error; // Don't retry on 404
            }
            if (attempt < maxRetries) {
                console.log(`Attempt ${attempt}: Error fetching history, waiting ${delay}ms before retry...`);
                await wait(delay);
                delay *= 2; // Exponential backoff
            }
        }
    }
    throw lastError;
}

app.post("/email-response/webhook/", async (req, res) => {
    const message = req.body.message;
    if (!message || !message.data) {
        res.status(400).send("No message data");
        return;
    }

    const data = Buffer.from(message.data, "base64").toString("utf-8");
    const notification = JSON.parse(data);

    try {
        const googleEmail = notification.emailAddress;
        console.log('Processing notification for:', googleEmail, 'historyId:', notification.historyId);
        
        const auth = await setupAuth(googleEmail);

        // Get the current message list as a fallback
        const messages = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 1,
            auth: auth
        });

        // Log the latest historyId for comparison
        if (messages.data.messages && messages.data.messages.length > 0) {
            const latestMessage = await gmail.users.messages.get({
                userId: 'me',
                id: messages.data.messages[0].id,
                auth: auth
            });
            const latestHistoryId = latestMessage.data.historyId;
            console.log('Latest message historyId:', latestHistoryId);
            console.log('Notification historyId:', notification.historyId);
            
            // Check if notification historyId is too recent
            if (BigInt(notification.historyId) > BigInt(latestHistoryId)) {
                console.log('Notification historyId is more recent than latest message, will retry with delay');
            }
        }

        // Fetch history list using historyId with retry mechanism
        const response = await fetchHistoryWithRetry(auth, notification.historyId);
        
        const history = response.data.history || [];
        console.log('History records found:', history.length);
        
        if (history.length === 0) {
            // If no history records found, process the most recent message as fallback
            if (messages.data.messages && messages.data.messages.length > 0) {
                const messageId = messages.data.messages[0].id;
                try {
                    const messageDetails = await gmail.users.messages.get({
                        userId: 'me',
                        id: messageId,
                        format: 'full',
                        auth: auth
                    });

                    // Parse the message with user's email address
                    const parsedMessage = parseMessage(messageDetails.data, googleEmail);
                    console.log('Processed most recent message as fallback:', {
                        id: parsedMessage.id,
                        threadId: parsedMessage.threadId,
                        subject: parsedMessage.headers.subject,
                        from: parsedMessage.from,
                        to: parsedMessage.to,
                        direction: parsedMessage.direction
                    });

                    const mailbox = await Mailbox.findOne({ googleEmail: googleEmail });
                    await saveEmail(mailbox.userId.toHexString(), parsedMessage);
                } catch (messageError) {
                    console.error('Error processing fallback message:', messageError);
                }
            } else {
                console.log('No messages found in the inbox');
            }
            res.status(204).send();
            return;
        }
        
        // Process each history record
        for (const record of history) {
            if (record.messages) {
                for (const messageAdded of record.messages) {
                    const messageId = messageAdded.id;
                    
                    try {
                        // Fetch the full message details with auth
                        const messageDetails = await gmail.users.messages.get({
                            userId: 'me',
                            id: messageId,
                            format: 'full',
                            auth: auth
                        });
                        
                        // Parse the message with user's email address
                        const parsedMessage = parseMessage(messageDetails.data, googleEmail);
                        console.log('Successfully processed email:', {
                            id: parsedMessage.id,
                            threadId: parsedMessage.threadId,
                            subject: parsedMessage.headers.subject,
                            from: parsedMessage.headers.from,
                            to: parsedMessage.headers.to,
                            date: parsedMessage.headers.date,
                            direction: parsedMessage.direction
                        });

                        const mailbox = await Mailbox.findOne({ googleEmail: googleEmail });

                        await saveEmail(mailbox.userId.toHexString(), parsedMessage);

                    } catch (messageError) {
                        if (messageError.response && messageError.response.status === 404) {
                            console.log(`Message ${messageId} no longer available - likely deleted or moved. Skipping.`);
                            continue; // Skip this message and continue with the next one
                        }
                        // For other errors, log them but continue processing other messages
                        console.error('Error processing individual message:', {
                            messageId,
                            error: messageError.message,
                            status: messageError.response?.status,
                            statusText: messageError.response?.statusText
                        });
                        continue;
                    }
                }
            }
        }

        console.log('Processed history records:', history.length);
        
        // Successfully processed all available messages
        res.status(204).send();
        
    } catch (error) {
        console.error('Error processing Gmail notification:', {
            error: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            historyId: notification.historyId,
            email: notification.emailAddress
        });
        
        // If the historyId is invalid or too old, return 204 to acknowledge
        if (error.response?.status === 404) {
            console.log('History ID no longer available. Acknowledging webhook.');
            res.status(204).send();
            return;
        }
        
        res.status(500).send('Error processing notification');
    }
});

// Start server and Ngrok tunnel
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        // Start Express server
        app.listen(PORT, () => {
            console.log(`Express server is running on port ${PORT}`);
        });

        // Configure and start ngrok
        const url = await ngrok.connect({
            addr: PORT,
            authtoken: process.env.NGROK_AUTHTOKEN,
            region: "us",
            hostname: "grateful-daily-firefly.ngrok-free.app",
        });

        console.log(`Ngrok tunnel established at: ${url}`);
        console.log(`Webhook URL for all users: ${url}/email-response/webhook/`);
    } catch (error) {
        console.error("Error starting server:", error);
        process.exit(1);
    }
}

// Handle cleanup on server shutdown
process.on("SIGTERM", async () => {
    console.log("Shutting down server...");
    await ngrok.kill();
    process.exit(0);
});

startServer();
