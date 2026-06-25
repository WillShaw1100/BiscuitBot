import { $, $$ } from "../core/dom.js";
import { User } from "../core/user.js";
import { initGuildSelector } from "../core/guilds.js";
import { renderPermissionGroups } from "../core/permissions.js";

document.addEventListener("DOMContentLoaded", () => {
    const user = User.get();

    // Basic profile
    $("#username").textContent = `Welcome ${user.username}`;
    $("#userid").textContent = user.id;
    $("#avatar").src = User.avatar();

    // Render grouped permissions
    renderPermissionGroups({
        scoreboard: $("#permScoreboard"),
        moderation: $("#permModeration"),
        admin: $("#permAdmin")
    }, user);

    // Guild selector
    initGuildSelector(
        $("#guildSelect"),
        user.guilds,
        user.selectedGuild
    );

    // Quick actions
    $("#actionScoreboard").onclick = () => {
        window.location = "/scoreboard/manage-scoreboard";
    };

    $("#actionPermissions").onclick = () => {
        window.location = "/permissions/manage-permissions";
    };

    $("#actionBans").onclick = () => {
        window.location = "/bans/manage-bans";
    };

    // Show/hide based on permissions

    if (user.canViewManage === "true") {
        $("#actionScoreboard").style.display = "flex";
    }
    
    if (user.canManagePermissions === "true") {
        $("#actionPermissions").style.display = "flex";
    }

    if (user.canViewBans === "true") {
        $("#actionBans").style.display = "flex";
    }
});
