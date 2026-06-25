const axios = require('axios');
const querystring = require('querystring');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.CALLBACK_URL;

exports.getDiscordAuthUrl = () => {
    const params = querystring.stringify({
        client_id: CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        response_type: 'code',
        scope: 'identify guilds'
    });

    return `https://discord.com/api/oauth2/authorize?${params}`;
};

exports.exchangeCodeForToken = async code => {
    const body = querystring.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
    });

    const res = await axios.post(
        'https://discord.com/api/oauth2/token',
        body,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return res.data.access_token;
};

exports.fetchDiscordUser = async accessToken => {
    const res = await axios.get(
        'https://discord.com/api/users/@me',
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return res.data;
};

exports.fetchDiscordGuilds = async accessToken => {
    const res = await axios.get(
        'https://discord.com/api/users/@me/guilds',
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return res.data;
};
