const fs = require('fs');
const path = require('path');
const asyncHandler = require('../middleware/asyncHandler');

const LOG_FILE = path.join(__dirname, '..', 'logs', 'scoreboard.log');

// Friendly labels for action types — extend this as you add new logAction() calls
const ACTION_LABELS = {
    reset_season: 'Season Reset',
    add_game: 'Game Added',
    update_game: 'Score Updated',
    add_user: 'Player Added',
    permissions_update: 'Permissions Updated',
    bans_viewed: 'Bans Viewed',
};

// Fallback for any type not in ACTION_LABELS
function humanize(type) {
    return type
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function humanizePermKey(key) {
    return key.replace(/^can/, '').replace(/([A-Z])/g, ' $1').trim();
}

// Builds a short, human-readable summary line per entry type so the table
// doesn't just show a badge
function summarize(entry) {
    const p = entry.payload || {};

    switch (entry.type) {
        case 'update_game':
            return `Game ${Number(p.gameIndex) + 1} score set to ${p.newValue ?? 'N/A'} for ${p.userName || p.userId}`;
        case 'add_game':
            return `Added game with ${(p.results || []).length} score(s)`;
        case 'reset_season':
            return `Started Season ${p.season}`;
        case 'add_user':
            return `Added ${p.username || p.userId} to the board`;
        case 'permissions_update': {
            const count = (p.changes || []).length;
            return `Updated permissions for ${p.targetUserName || p.targetUserId} (${count} changed)`;
        }
        case 'bans_viewed':
            return 'Viewed the ban list';
        default:
            return '';
    }
}

function buildDetails(entry) {
    const p = entry.payload || {};

    switch (entry.type) {
        case 'update_game':
            return [
                { label: 'Guild', value: p.guildName || p.guildId || '—' },
                { label: 'Season', value: p.season ?? '—' },
                { label: 'Player', value: p.userName || p.userId || '—' },
                { label: 'Game', value: `#${Number(p.gameIndex) + 1}` },
                { label: 'Score', value: `${p.oldValue ?? '—'} → ${p.newValue}` }
            ];

        case 'add_game':
            return [
                { label: 'Guild', value: p.guildName || p.guildId || '—' },
                { label: 'Season', value: p.season ?? '—' },
                {
                    label: 'Scores added',
                    value: (p.results || [])
                        .map(r => `${r.userName || r.username || r.userId}: ${r.value}`)
                        .join(', ') || '—'
                }
            ];

        case 'reset_season':
            return [
                { label: 'Guild', value: p.guildName || p.guildId || '—' },
                { label: 'New season', value: p.season ?? '—' }
            ];

        case 'add_user':
            return [
                { label: 'Guild', value: p.guildName || p.guildId || '—' },
                { label: 'Player added', value: p.username || p.userId || '—' }
            ];

        case 'permissions_update': {
            const changeRows = (p.changes || []).map(c => ({
                label: humanizePermKey(c.key),
                value: `${c.from ? 'Yes' : 'No'} → ${c.to ? 'Yes' : 'No'}`
            }));

            return [
                { label: 'Guild', value: p.guildName || p.guildId || '—' },
                { label: 'Player', value: p.targetUserName || p.targetUserId || '—' },
                ...(changeRows.length ? changeRows : [{ label: 'Changes', value: 'No fields changed' }])
            ];
        }

        default:
            return [];
    }
}

exports.getLogs = asyncHandler(async (req, res) => {
    const { type, actor, subject, guildId, from, to, page = 1, limit = 50 } = req.query;

    let raw;
    try {
        raw = await fs.promises.readFile(LOG_FILE, 'utf8');
    } catch (err) {
        if (err.code === 'ENOENT') {
            return res.json({ entries: [], total: 0, page: 1, totalPages: 0, types: [], guilds: [] });
        }
        throw err;
    }

    let entries = raw
        .split('\n')
        .filter(Boolean)
        .map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        })
        .filter(Boolean)
        .reverse(); // newest first

    // Collect all distinct types/guilds present, before filtering, for the dropdowns
    const types = [...new Set(entries.map(e => e.type))];

    const client = req.app.get('discordClient');
    const guildIds = [...new Set(entries.map(e => e.payload?.guildId).filter(Boolean))];
    const guilds = guildIds.map(id => ({
        id,
        name: client?.guilds.cache.get(id)?.name || id
    }));

    if (type) {
        entries = entries.filter(e => e.type === type);
    }

    if (guildId) {
        entries = entries.filter(e => e.payload?.guildId === guildId);
    }

    if (actor) {
        const q = actor.toLowerCase();
        entries = entries.filter(e =>
            (e.payload?.actorName || '').toLowerCase().includes(q)
        );
    }

    if (subject) {
        const q = subject.toLowerCase();
        entries = entries.filter(e => {
            const p = e.payload || {};
            const names = [p.targetUserName, p.userName, p.username]
                .filter(Boolean)
                .map(n => n.toLowerCase());
            return names.some(n => n.includes(q));
        });
    }

    if (from) {
        const fromTs = new Date(from).getTime();
        if (!Number.isNaN(fromTs)) {
            entries = entries.filter(e => e.ts >= fromTs);
        }
    }

    if (to) {
        const toTs = new Date(to).getTime();
        if (!Number.isNaN(toTs)) {
            entries = entries.filter(e => e.ts <= toTs);
        }
    }

    const total = entries.length;
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(200, Math.max(1, Number(limit) || 50));
    const totalPages = Math.max(1, Math.ceil(total / limitNum));
    const start = (pageNum - 1) * limitNum;

    const pageEntries = entries.slice(start, start + limitNum).map(e => {
        const hasDetails = !e.type.endsWith('_viewed');

        return {
            ts: e.ts,
            type: e.type,
            label: ACTION_LABELS[e.type] || humanize(e.type),
            summary: summarize(e),
            actorId: e.payload?.actorId || null,
            actorName: e.payload?.actorName || 'Unknown',
            guildId: e.payload?.guildId || null,
            hasDetails,
            details: hasDetails ? buildDetails(e) : []
        };
    });

    res.json({
        entries: pageEntries,
        total,
        page: pageNum,
        totalPages,
        types,
        guilds
    });
});