const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const refreshUserPermissions = require('../middleware/refreshUserPermissions');
const dashboardController = require('../controllers/dashboard.controller');

router.get(
    '/',
    ensureAuthenticated,
    refreshUserPermissions,
    dashboardController.renderDashboard
);

module.exports = router;
