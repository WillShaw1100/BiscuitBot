const axios = require('axios');
const client = require('../../core/client');
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
        };

        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            querystring.stringify(tokenParams),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = tokenResponse.data.access_token;

        // Fetch Discord user
        const userResponse = await axios.get(
            'https://discord.com/api/users/@me',
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        req.session.user = userResponse.data;
        req.session.accessToken = accessToken;

        // Ensure bot is ready
        if (!client.isReady()) {
            console.log("Discord client not ready yet");
            return res.status(503).send("Bot is still starting up");
        }

        // Fetch guild + member
        const guild = await client.guilds.fetch(process.env.MAIN_GUILD_ID);
        const member = await guild.members.fetch(req.session.user.id);

        // Check role
        req.session.canEdit = member.roles.cache.has(process.env.SCOREBOARD_ROLE);

        res.redirect('/dashboard');

    } catch (error) {
        console.error('Error during token exchange:', error);
        res.status(500).json({ error: 'Failed to exchange code for access token' });
    }
};

module.exports = { login, callback };
