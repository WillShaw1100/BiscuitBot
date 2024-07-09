const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const guildRoutes = require('./routes/guildRoutes');

// Define middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' and 'views' directories
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Configure express-session middleware
app.use(session({
    secret: 'your-secret-key', // Replace with your own secret key for session
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Adjust as necessary based on your deployment environment
}));

// Use route handlers
app.use('/auth', authRoutes);
app.use('/guilds', guildRoutes);

// Serve index.html on root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

module.exports = app;
