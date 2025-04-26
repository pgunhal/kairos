const { google } = require('googleapis');
const Mailbox = require('../models/Mailbox');
require('dotenv').config();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Create URL for Gmail OAuth consent with offline access
exports.getAuthUrl = async (req, res) => {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      prompt: 'consent'
    });

    res.json({ url: authUrl });
  } catch (error) {
    console.error('Auth URL generation error:', error);
    res.status(500).json({
      message: 'Error generating auth URL',
      error: error.message
    });
  }
};

// Create or update mailbox connection
exports.connectMailbox = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        message: 'Authorization code is required',
        isConnected: false
      });
    }

    try {
      // Exchange the authorization code for tokens using googleapis
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Get user info using oauth2 v2 API
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      const googleEmail = userInfo.data.email;

      // Check for existing mailbox
      let mailbox = await Mailbox.findOne({ userId, googleEmail });

      if (mailbox) {
        // Update existing mailbox
        mailbox = await Mailbox.findOneAndUpdate(
          { userId },
          { 
            refreshToken: tokens.refresh_token,
            googleEmail,
            isConnected: true
          },
          { new: true }
        );
      } else {
        // Create new mailbox
        mailbox = await Mailbox.create({
          userId,
          refreshToken: tokens.refresh_token,
          googleEmail,
          isConnected: true
        });
      }

      res.status(201).json({
        message: 'Mailbox connected successfully',
        isConnected: true,
        email: googleEmail
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.status(400).json({
        message: 'Failed to exchange authorization code',
        error: error.message,
        isConnected: false
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error connecting mailbox',
      error: error.message,
      isConnected: false
    });
  }
};

// Check mailbox connection status
exports.checkConnection = async (req, res) => {
  try {
    const userId = req.user.id;

    const mailbox = await Mailbox.findOne({ userId });
    if (!mailbox) {
      return res.status(404).json({
        message: 'No mailbox found for this user',
        isConnected: false
      });
    }

    try {
      // Set credentials and verify token
      oauth2Client.setCredentials({
        refresh_token: mailbox.refreshToken
      });
      await oauth2Client.getAccessToken();
      
      res.json({
        isConnected: true
      });
    } catch (error) {
      // Token is invalid
      await Mailbox.findOneAndUpdate(
        { userId },
        { isConnected: false }
      );
      
      res.json({
        isConnected: false
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Error checking mailbox connection',
      error: error.message
    });
  }
};

// Revoke mailbox connection
exports.revokeConnection = async (req, res) => {
  try {
    const userId = req.user.id;

    const mailbox = await Mailbox.findOne({ userId });
    if (!mailbox) {
      return res.status(404).json({
        message: 'No mailbox found for this user',
        isConnected: false
      });
    }

    try {
      // Revoke using oauth2Client
      await oauth2Client.revokeToken(mailbox.refreshToken);
    } catch (error) {
      console.error('Error revoking token with Google:', error);
      // Continue with deletion even if Google revoke fails
    }

    // Remove the mailbox document
    await Mailbox.deleteOne({ userId });

    res.json({
      message: 'Mailbox connection revoked successfully',
      isConnected: false
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error revoking mailbox connection',
      error: error.message
    });
  }
};