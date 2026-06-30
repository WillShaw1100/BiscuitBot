const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const refreshUserPermissions = require('../middleware/refreshUserPermissions');
const requirePermission = require('../middleware/requirePermission');

const auditLogController = require('../controllers/auditLog.controller');

router.use(ensureAuthenticated, refreshUserPermissions);

router.get(
    '/data',
    requirePermission('canViewAuditLog'),
    auditLogController.getLogs
);

router.get('/', requirePermission('canViewAuditLog'), (req, res) => {
    const html = fs.readFileSync(
        path.join(__dirname, '../views/auditlog.html'),
        'utf8'
    );
    res.send(html);
});

module.exports = router;