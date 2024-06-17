const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.CALLBACK_URL;

const login = (req, res) => {
    const params = querystring.stringify({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'identify guilds'
    });

    res.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
};

const callback = async (req, res) => {
    const code = req.query.code;

    try {
        const tokenParams = {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: REDIRECT_URI,
            scope: 'identify guilds guilds.members.read'
        };

        const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', querystring.stringify(tokenParams), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const tokenData = tokenResponse.data;
        const accessToken = tokenData.access_token;

        // Save the access token to sessionStorage
        req.session.accessToken = accessToken;

        // Redirect to guilds.html
        res.redirect('/guilds.html');
    } catch (error) {
        console.error('Error during token exchange:', error);
        res.status(500).json({ error: 'Failed to exchange code for access token' });
    }
};

module.exports = { login, callback };
