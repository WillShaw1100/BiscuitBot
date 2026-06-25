const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.get('/login', authController.login);
router.get('/callback', authController.callback);
router.post("/setGuild", (req, res) => {
    const { guildId } = req.body;

    if (!req.session.user || !req.session.user.guilds) {
        return res.status(401).json({ error: "Not logged in" });
    }

    if (!req.session.user.guilds.some(g => g.id === guildId)) {
        return res.status(403).json({ error: "User not in that guild" });
    }

    req.session.guildId = guildId;
    res.json({ success: true });
});

module.exports = router;
