import { $, $$, html } from "../core/dom.js";
import { api } from "../core/api.js";
import { initGuildSelector } from "../core/guilds.js";

// ====================== STATE ======================
let cachedPermissionedUsers = null;

// ====================== UTILS ======================
function debounce(fn, delay) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function showStatus(message, isError = false) {
    const existing = $("#statusMsg");
    if (existing) existing.remove();

    const el = document.createElement("div");
    el.id = "statusMsg";
    el.textContent = message;
    el.style.cssText = `
        padding: 8px 12px;
        margin-top: 8px;
        border-radius: 4px;
        font-size: 0.875rem;
        background: ${isError ? "#fee2e2" : "#dcfce7"};
        color: ${isError ? "#991b1b" : "#166534"};
        border: 1px solid ${isError ? "#fca5a5" : "#86efac"};
    `;

    const btn = $("#savePermsBtn");
    if (btn) btn.insertAdjacentElement("afterend", el);

    setTimeout(() => el.remove(), 3000);
}

// ====================== INIT ======================
document.addEventListener("DOMContentLoaded", () => {
    initGuildSelector($("#guildName"), window.guilds, window.selectedGuild);
    $("#search").addEventListener("input", debounce(searchUsers, 150));
    loadExistingPermissions();
});

// ====================== SEARCH ======================
async function searchUsers() {
    const q = $("#search").value.trim();
    if (!q) {
        if (cachedPermissionedUsers) {
            renderResults(cachedPermissionedUsers);
        } else {
            await loadExistingPermissions();
        }
        return;
    }

    try {
        const users = await api(`/permissions/search?q=${encodeURIComponent(q)}`);
        renderResults(users);
    } catch (err) {
        console.error("User search failed:", err);
        html($("#results"), `<div class="error-msg">Search failed. Please try again.</div>`);
    }
}

// ====================== LOAD EXISTING PERMISSIONED USERS ======================
async function loadExistingPermissions() {
    try {
        const users = await api("/permissions/list");
        cachedPermissionedUsers = users;
        renderResults(users);
    } catch (err) {
        console.error("Failed to load permissions list:", err);
        html($("#results"), `<div class="error-msg">Failed to load users. Please refresh.</div>`);
    }
}

// ====================== RENDER USER LIST ======================
function renderResults(users) {
    if (!users || users.length === 0) {
        html($("#results"), `<div class="empty-msg">No users found.</div>`);
        return;
    }

    html($("#results"), users.map(u => `
        <div class="result-item" data-id="${escapeHtml(u.id)}">
            <img src="${escapeHtml(u.avatar)}" alt="${escapeHtml(u.username)}">
            <div>${escapeHtml(u.username)}</div>
        </div>
    `).join(""));

    $$("#results .result-item").forEach(el => {
        el.addEventListener("click", () => openUser(el.dataset.id));
    });
}

// ====================== OPEN USER PERMISSION PANEL ======================
async function openUser(userId) {
    let data;
    try {
        data = await api(`/permissions/${encodeURIComponent(userId)}`);
    } catch (err) {
        console.error("Failed to load user permissions:", err);
        html($("#permPanel"), `<div class="error-msg">Failed to load permissions for this user.</div>`);
        return;
    }

    if (!data || !data.permissions) {
        console.error("Invalid permissions object:", data);
        html($("#permPanel"), `<div class="error-msg">Received invalid data for this user.</div>`);
        return;
    }

    const isOwner = window.owners?.includes(data.userId);

    html($("#permPanel"), `
        <div class="perm-card">
            <div class="perm-header">
                <img src="${escapeHtml(data.avatar)}" class="avatar" alt="${escapeHtml(data.username)}">
                <div>
                    <b>${escapeHtml(data.username)}</b><br>
                    <span class="muted small">${escapeHtml(data.userId)}</span>
                </div>
            </div>

            <div class="perm-grid">
                ${Object.keys(data.permissions).map(key => {
                    const locked = isOwner && key === "canManagePermissions";
                    return `
                        <label class="perm-row">
                            <span>${escapeHtml(key)} ${locked ? "🔒" : ""}</span>
                            <input 
                                type="checkbox" 
                                data-key="${escapeHtml(key)}"
                                ${data.permissions[key] ? "checked" : ""}
                                ${locked ? "disabled" : ""}
                            >
                        </label>
                    `;
                }).join("")}
            </div>

            <button id="savePermsBtn">Save Permissions</button>
        </div>
    `);

    $("#savePermsBtn").addEventListener("click", () => savePermissions(data.userId));
}

// ====================== SAVE PERMISSIONS ======================
async function savePermissions(userId) {
    const updated = {};
    $$("#permPanel input[type='checkbox']").forEach(cb => {
        updated[cb.dataset.key] = cb.checked;
    });

    const btn = $("#savePermsBtn");
    btn.disabled = true;
    btn.textContent = "Saving...";

    try {
        await api(`/permissions/${encodeURIComponent(userId)}`, {
            method: "POST",
            body: JSON.stringify(updated)
        });
        showStatus("Permissions updated successfully.");
    } catch (err) {
        console.error("Failed to save permissions:", err);
        showStatus("Failed to save permissions. Please try again.", true);
    } finally {
        btn.disabled = false;
        btn.textContent = "Save Permissions";
    }
}