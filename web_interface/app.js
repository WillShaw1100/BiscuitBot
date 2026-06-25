const express = require('express');
const path = require('path');
const session = require('express-session');
const client = require('../core/client');

require('dotenv').config();

const app = express();

app.set("discordClient", client);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Sessions (simple version)
app.use(session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Static files
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/style', express.static(path.join(__dirname, 'public/style')));
app.use('/scripts', express.static(path.join(__dirname, 'public/scripts')));

// Routes
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const scoreboardRoutes = require('./routes/scoreboard.routes');
const permissionsRoutes = require('./routes/permissions.routes');
const bansRoutes = require('./routes/bans.routes');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/scoreboard', scoreboardRoutes);
app.use('/permissions', permissionsRoutes);
app.use('/bans', bansRoutes);

// Root → Dashboard if logged in
app.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/dashboard');
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

module.exports = app;
