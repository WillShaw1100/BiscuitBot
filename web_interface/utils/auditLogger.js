const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'scoreboard.log');
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 90; // ~3 months

if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

function logAction(type, payload) {
    const entry = {
        ts: Date.now(),
        type,
        payload
    };

    fs.appendFile(LOG_FILE, JSON.stringify(entry) + '\n', (err) => {
        if (err) console.error('Log write error:', err);
    });
}

function cleanupLogs() {
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        if (err) return; // no file yet etc.

        const lines = data.split('\n').filter(Boolean);
        const now = Date.now();

        const kept = lines.filter(line => {
            try {
                const obj = JSON.parse(line);
                return now - obj.ts <= MAX_AGE_MS;
            } catch {
                return false;
            }
        });

        fs.writeFile(LOG_FILE, kept.join('\n') + (kept.length ? '\n' : ''), (err2) => {
            if (err2) console.error('Log cleanup error:', err2);
        });
    });
}

// run cleanup periodically
setInterval(cleanupLogs, 1000 * 60 * 60 * 24); // daily

module.exports = { logAction };
