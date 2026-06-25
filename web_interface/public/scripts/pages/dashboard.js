import { $, $$ } from "../core/dom.js";
import { User } from "../core/user.js";
import { initGuildSelector } from "../core/guilds.js";
import { renderPermissionList } from "../core/permissions.js";

document.addEventListener("DOMContentLoaded", () => {
    const user = User.get();

    $("#username").textContent = `Welcome ${user.username}`;
    $("#userid").textContent = user.id;
    $("#avatar").src = User.avatar();

    renderPermissionList($("#permList"), user);

    initGuildSelector(
        $("#guildSelect"),
        user.guilds,
        user.selectedGuild
    );

    $("#manageBtn").style.display = user.canViewManage === "true" ? "block" : "none";
    $("#managePermsBtn").style.display = user.canManagePermissions === "true" ? "block" : "none";
});
