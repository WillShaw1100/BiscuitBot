const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    canViewManage: { type: Boolean, default: false },
    canAddScores: { type: Boolean, default: false },
    canResetSeason: { type: Boolean, default: false },
    canEditHistorical: { type: Boolean, default: false },
    canManagePermissions: { type: Boolean, default: false },
}, { timestamps: true });

PermissionSchema.index({ guildId: 1, userId: 1 }, { unique: true });

module.exports =
    mongoose.models.Permission ||
    mongoose.model('Permission', PermissionSchema);
