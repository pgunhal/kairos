require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const mongoClient = new MongoClient(process.env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoClient.connect();
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}
connectDB();

app.post('/send-email', async (req, res) => {
    console.log('Received request body:', req.body);
    
    try {
        const {
            userId,
            sender,
            to,
            subject,
            text,
            html
        } = req.body;

        if (!userId || !sender || !to || !subject) {
            throw new Error('Missing required fields');
        }

        // Get refresh token from MongoDB
        const db = mongoClient.db('test');
        const tokensCollection = db.collection('refreshtokens');
        
        console.log('Looking up refresh token for userId:', userId);
        const tokenDoc = await tokensCollection.findOne({ 
            userId: ObjectId.createFromHexString(userId)
        });

        if (!tokenDoc || !tokenDoc.refreshToken) {
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
            refresh_token: tokenDoc.refreshToken
        });

        try {
            // Create Gmail API client
            const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

            // Prepare email content
            const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
            const messageParts = [
                `From: ${sender}`,
                `To: ${to}`,
                'Content-Type: text/html; charset=utf-8',
                'MIME-Version: 1.0',
                `Subject: ${utf8Subject}`,
                '',
                html || text
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

// Graceful shutdown
process.on('SIGINT', async () => {
    await mongoClient.close();
    process.exit(0);
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