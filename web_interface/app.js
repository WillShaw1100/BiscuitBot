const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const guildRoutes = require('./routes/guildRoutes');
const scoreboardRoutes = require('./routes/scoreboardRoutes');

// Define middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/style', express.static(path.join(__dirname, 'style')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));

// Configure express-session middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Replace with your own secret key for session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Adjust as necessary based on your deployment environment
}));

// Use route handlers
app.use('/auth', authRoutes);
//app.use('/guilds', guildRoutes);
app.use('/scoreboard', scoreboardRoutes);
// Serve index.html on root path
app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.sendFile(
        path.join(__dirname, 'views', 'index.html')
    );
});
app.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/');

    const fs = require('fs');
    const file = path.join(__dirname, 'views', 'dashboard.html');

    let html = fs.readFileSync(file, 'utf8');

    // Build avatar URL
    const avatarURL = req.session.user.avatar
        ? `https://cdn.discordapp.com/avatars/${req.session.user.id}/${req.session.user.avatar}.png?size=256`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;

    html = html
        .replace('{{username}}', req.session.user.username)
        .replace('{{id}}', req.session.user.id)
        .replace('{{avatar}}', avatarURL)
        .replace('{{canEdit}}', req.session.canEdit ? 'true' : 'false');

    res.send(html);
});

app.get('/manage-scoreboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    if (!req.session.canEdit) {
        return res.status(403).send('Forbidden');
    }

    res.sendFile(
        path.join(__dirname, 'views', 'manage-scoreboard.html')
    );
});


module.exports = app;
