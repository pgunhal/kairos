require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post('/send-email', async (req, res) => {
    console.log('Received request body:', req.body);
    
    try {
        const {
            refreshToken,
            sender,
            to,
            subject,
            text,
            html
        } = req.body;

        if (!refreshToken || !sender || !to || !subject) {
            throw new Error('Missing required fields');
        }

        console.log('Creating OAuth2 client...');
        const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        console.log('Setting credentials...');
        oauth2Client.setCredentials({
            refresh_token: refreshToken
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Environment variables loaded:', {
        clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
        redirectUri: process.env.GOOGLE_REDIRECT_URI ? 'Set' : 'Missing'
    });
});