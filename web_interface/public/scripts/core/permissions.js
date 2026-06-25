export function renderPermissionGroups(containers, user) {
    const groups = {
        scoreboard: [
            ["canViewManage", "Access Scoreboard"],
            ["canAddScores", "Add Scores / Games"],
            ["canResetSeason", "Reset Season"],
            ["canEditHistorical", "Edit Historical Scores"]
        ],
        moderation: [
            ["canViewBans", "View Bans"]
        ],
        admin: [
            ["canManagePermissions", "Manage Permissions"]
        ]
    };

    const render = (list, container) => {
        if (!container) return;
        
        container.innerHTML = list.map(([key, label]) => {
            const allowed = user[key] === "true" || user[key] === true;
            return `
                <li class="${allowed ? "perm-yes" : "perm-no"}">
                    <span>${label}</span>
                    <span>${allowed ? "✔" : "✖"}</span>
                </li>
            `;
        }).join("");
    };

    render(groups.scoreboard, containers.scoreboard);
    render(groups.moderation, containers.moderation);
    render(groups.admin, containers.admin);
}
