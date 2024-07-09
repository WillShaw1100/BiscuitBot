const axios = require('axios');

const getGuilds = async (req, res) => {
    const accessToken = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!accessToken) {
        return res.status(401).json({ error: 'No token found' });
    }

    try {
        // Fetch user's guilds (servers) using axios
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const guildsData = guildsResponse.data;
        console.log(guildsData);

        // Filter guilds where the user is an admin
        const adminGuilds = guildsData.filter(guild => {
            // Check if the permissions integer includes the administrator permission (ADMINISTRATOR bit)
            const isAdmin = (guild.permissions & 8) === 8;
            return isAdmin;
        });

        // Send admin guild data to client
        res.json(adminGuilds);
    } catch (error) {
        console.error('Error fetching guilds:', error);
        res.status(500).json({ error: 'Failed to fetch guilds' });
    }
};

module.exports = { getGuilds };
