require('dotenv').config();

// Configurações para OAuth 2.0 do Google
const googleOAuthConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID || '546036603143-scv9c0k6n8u4l3nhp78vtqthj8vc6qve.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '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',
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/oauth/google/callback',
  scope: ['profile', 'email']
};

module.exports = googleOAuthConfig;
