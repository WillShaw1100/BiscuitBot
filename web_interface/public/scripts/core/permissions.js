export function renderPermissionList(container, user) {
    const perms = [
        ["canViewManage", "View Manage Scoreboard"],
        ["canAddScores", "Add Scores / Games"],
        ["canResetSeason", "Reset Season"],
        ["canEditHistorical", "Edit Historical Scores"],
        ["canManagePermissions", "Manage Permissions"]
    ];

    container.innerHTML = perms.map(([key, label]) => {
        const allowed = user[key] === "true" || user[key] === true;
        return `
            <li class="${allowed ? "perm-yes" : "perm-no"}">
                ${label}
            </li>
        `;
    }).join("");
}
