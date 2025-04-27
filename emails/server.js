require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const mongoose = require('mongoose');
const Mailbox = require('./models/Mailbox');
const Email = require('./models/Email');

const app = express();
app.use(cors());
app.use(express.json());



const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Only saves emails sent outbound by API
async function saveEmail(userId, parsedMessage) {
    if (parsedMessage.direction === 'outbound') {
        // Handle outbound message
        console.log('Outbound message:', parsedMessage);
        const mostRecentEmailInThread = await Email.findOne({ threadId: parsedMessage.threadId }).sort({ date: -1 });

        console.log("EMAIL SAVED NEW");

        await Email.create({
            userId: mongoose.Types.ObjectId.createFromHexString(userId),
            previousEmail: mostRecentEmailInThread?._id ?? null,
            subject: parsedMessage.subject,
            from: parsedMessage.from,
            to: parsedMessage.to,
            emailId: parsedMessage.emailId,
            threadId: parsedMessage.threadId,
            direction: parsedMessage.direction,
            content: parsedMessage.content
        });
    }
}

function formatQuotedEmail(originalEmail) {
    // Convert integer date (days since Unix epoch) to readable date string
    const dateObj = new Date(originalEmail.createdAt); // days to milliseconds
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const dateStr = dateObj.toLocaleDateString('en-US', options);

    // Format time as "HH:mm" (24-hour)
    const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  
    // Format the quoted email text
    const quotedText = `\n\n\nOn ${dateStr}, at ${timeStr}, ${originalEmail.from} wrote:\n\n${originalEmail.content}`;
    return quotedText;
  }

app.post('/send-email', async (req, res) => {
    console.log('Received request body:', req.body);
    
    try {
        const {
            userId,
            sender,
            to,
            subject,
            text,
        } = req.body;

        if (!userId || !sender || !to || !subject) {
            throw new Error('Missing required fields');
        }

        // Get refresh token from MongoDB
        console.log('Looking up refresh token for userId:', userId);
        const mailbox = await Mailbox.findOne({ 
            userId: mongoose.Types.ObjectId.createFromHexString(userId)
        });

        if (!mailbox || !mailbox.refreshToken) {
            throw new Error('Refresh token not found for user');
        }

        console.log('Creating OAuth2 client...');
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        console.log('Setting credentials...');
        oauth2Client.setCredentials({
            refresh_token: mailbox.refreshToken
        });

        try {
            // Create Gmail API client
            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

            // Prepare email content
            const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
            const messageParts = [
                `From: ${sender}`,
                `To: ${to}`,
                'Content-Type: text/plain; charset=utf-8',
                'MIME-Version: 1.0',
                `Subject: ${utf8Subject}`,
                '',
                text
            ];
            const message = messageParts.join('\n');

            // Encode the message in base64url format
            const encodedMessage = Buffer.from(message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            console.log('Sending email via Gmail API...');
            const result = await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage,
                }
            });
            
            await saveEmail(userId, {
                subject,
                from: sender,
                to,
                emailId: result.data.id,
                threadId: result.data.threadId,
                direction: sender === to ? 'self' : 'outbound',
                content: text
            });

            console.log('Email sent successfully:', result.data);
            res.status(200).json({
                message: 'Email sent successfully',
                messageId: result.data.id
            });
        } catch (authError) {
            console.error('Detailed Auth Error:', {
                name: authError.name,
                message: authError.message,
                stack: authError.stack,
                response: authError.response?.data
            });
            res.status(401).json({
                message: 'Authentication failed',
                error: authError.message,
                details: authError.response?.data
            });
        }
    } catch (error) {
        console.error('General Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Failed to send email',
            error: error.message
        });
    }
});

app.post('/reply-email', async (req, res) => {
    console.log('Received request body:', req.body);

    try {
        const {
            userId,
            sender,
            to,
            subject,
            text,
            originalEmailId,
            originalThreadId
        } = req.body;

        if (!userId || !sender || !to || !subject || !text || !originalEmailId || !originalThreadId) {
            throw new Error('Missing required fields');
        }

        // Get refresh token from MongoDB
        console.log('Looking up refresh token for userId:', userId);
        const mailbox = await Mailbox.findOne({ 
            userId: mongoose.Types.ObjectId.createFromHexString(userId)
        });

        console.log('originalEmailId:', originalEmailId);
        console.log('originalThreadId:', originalThreadId);

        const originalEmail = await Email.findOne({ emailId: originalEmailId });
        let replyText = text;
        if (originalEmail) {
            replyText += formatQuotedEmail(originalEmail);
        }

        if (!mailbox || !mailbox.refreshToken) {
            throw new Error('Refresh token not found for user');
        }

        console.log('Creating OAuth2 client...');
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        console.log('Setting credentials...');
        oauth2Client.setCredentials({
            refresh_token: mailbox.refreshToken
        });

        try {
            // Create Gmail API client
            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

            // Prepare email content
            const utf8Subject = `=?utf-8?B?${Buffer.from("Re: " + subject).toString('base64')}?=`;
            const messageParts = [
                `From: ${sender}`,
                `To: ${to}`,
                'Content-Type: text/plain; charset=utf-8',
                'MIME-Version: 1.0',
                `Subject: ${utf8Subject}`,
                `In-Reply-To: <${originalEmailId}>`,
                `References: <${originalEmailId}>`,
                '',
                replyText
            ];
            const message = messageParts.join('\n');

            // Encode the message in base64url format
            const encodedMessage = Buffer.from(message)
                .toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            console.log('Sending reply email via Gmail API...');
            const result = await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage,
                    threadId: originalThreadId,
                }
            });
            
            await saveEmail(userId, {
                subject,
                from: sender,
                to,
                emailId: result.data.id,
                threadId: result.data.threadId,
                direction: sender === to ? 'self' : 'outbound',
                content: replyText
            });

            console.log('Reply email sent successfully:', result.data);
            res.status(200).json({
                message: 'Reply email sent successfully',
                messageId: result.data.id
            });
        } catch (authError) {
            console.error('Detailed Auth Error:', {
                name: authError.name,
                message: authError.message,
                stack: authError.stack,
                response: authError.response?.data
            });
            res.status(401).json({
                message: 'Authentication failed',
                error: authError.message,
                details: authError.response?.data
            });
        }
    } catch (error) {
        console.error('General Error:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            message: 'Failed to send reply email',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment variables loaded:', {
        clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
        redirectUri: process.env.GOOGLE_REDIRECT_URI ? 'Set' : 'Missing',
        mongoUri: process.env.MONGODB_URI ? 'Set' : 'Missing'
    });
});