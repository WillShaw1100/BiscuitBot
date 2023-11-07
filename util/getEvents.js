const https = require('https');
const dotenv = require('dotenv').config();

module.exports = async function fetchData() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'discord.com',
      path: '/api/v9/guilds/589411374657175572/scheduled-events',
      method: 'GET',
      headers: {
        'Authorization': `Bot ${process.env.TEST_DISCORD_TOKEN}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log({ data: jsonData });
          resolve(jsonData);
        } catch (error) {
          console.error(error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(error);
      reject(error);
    });

    req.end();
  });
};