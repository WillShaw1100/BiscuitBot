document.addEventListener("DOMContentLoaded", () => {
    const user = window.user;

    document.getElementById("username").textContent =
        `Welcome ${user.username}`;

    document.getElementById("userid").textContent =
        user.id;

    document.getElementById("avatar").src =
        user.avatar;

    const tag = document.getElementById("roleTag");
    const manageBtn = document.getElementById("manageBtn");

    if (user.canEdit === "true") {
        tag.textContent = "Scoreboard Editor";
        tag.style.background = "#0c961e";
        tag.style.border = "1px solid #000000";
        tag.style.color = "#ffffff";

        manageBtn.style.display = "inline-block";
    } else {
        tag.textContent = "No Access";
        tag.style.background = "#881414";
        tag.style.border = "1px solid #000000";
        tag.style.color = "#ffffff";

        // Hide manage button for non-editors
        manageBtn.style.display = "none";
    }

    // Fallback avatar
    document.getElementById("avatar").addEventListener("error", () => {
        document.getElementById("avatar").src =
            "https://cdn.discordapp.com/embed/avatars/0.png";
    });
});