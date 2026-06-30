import { $, $$, html } from "../core/dom.js";
import { api } from "../core/api.js";

let currentPage = 1;
let currentTotalPages = 1;

const filters = {
    type: "",
    actor: "",
    subject: "",
    guildId: "",
    from: "",
    to: ""
};

document.addEventListener("DOMContentLoaded", () => {
    $("#filterType").addEventListener("change", e => {
        filters.type = e.target.value;
        currentPage = 1;
        loadLogs();
    });

    $("#filterGuild").addEventListener("change", e => {
        filters.guildId = e.target.value;
        currentPage = 1;
        loadLogs();
    });

    $("#filterActor").addEventListener("input", debounce(e => {
        filters.actor = e.target.value.trim();
        currentPage = 1;
        loadLogs();
    }, 250));

    $("#filterSubject").addEventListener("input", debounce(e => {
        filters.subject = e.target.value.trim();
        currentPage = 1;
        loadLogs();
    }, 250));

    $("#filterFrom").addEventListener("change", e => {
        filters.from = e.target.value;
        currentPage = 1;
        loadLogs();
    });

    $("#filterTo").addEventListener("change", e => {
        filters.to = e.target.value;
        currentPage = 1;
        loadLogs();
    });

    $("#clearFiltersBtn").addEventListener("click", () => {
        filters.type = "";
        filters.actor = "";
        filters.subject = "";
        filters.guildId = "";
        filters.from = "";
        filters.to = "";

        $("#filterType").value = "";
        $("#filterGuild").value = "";
        $("#filterActor").value = "";
        $("#filterSubject").value = "";
        $("#filterFrom").value = "";
        $("#filterTo").value = "";

        currentPage = 1;
        loadLogs();
    });

    loadLogs();
});

function debounce(fn, delay) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

function buildQuery() {
    const params = new URLSearchParams();

    if (filters.type) params.set("type", filters.type);
    if (filters.guildId) params.set("guildId", filters.guildId);
    if (filters.actor) params.set("actor", filters.actor);
    if (filters.subject) params.set("subject", filters.subject);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);

    params.set("page", currentPage);
    params.set("limit", 50);

    return params.toString();
}

async function loadLogs() {
    html($("#logTable"), `<p class="small">Loading...</p>`);

    const res = await api(`/auditlog/data?${buildQuery()}`);

    currentTotalPages = res.totalPages;
    populateTypeOptions(res.types);
    populateGuildOptions(res.guilds);
    renderResultCount(res.total);
    renderTable(res.entries);
    renderPagination(res.page, res.totalPages);
}

function populateTypeOptions(types) {
    const select = $("#filterType");
    const existing = new Set(
        Array.from(select.options).map(o => o.value)
    );

    types.forEach(t => {
        if (!existing.has(t)) {
            const opt = document.createElement("option");
            opt.value = t;
            opt.textContent = labelize(t);
            select.appendChild(opt);
        }
    });

    select.value = filters.type;
}

function populateGuildOptions(guilds = []) {
    const select = $("#filterGuild");
    const existing = new Set(
        Array.from(select.options).map(o => o.value)
    );

    guilds.forEach(g => {
        if (!existing.has(g.id)) {
            const opt = document.createElement("option");
            opt.value = g.id;
            opt.textContent = g.name;
            select.appendChild(opt);
        }
    });

    select.value = filters.guildId;
}

function labelize(type) {
    return type
        .split("_")
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

function renderResultCount(total) {
    $("#resultCount").textContent = total === 1 ? "1 entry" : `${total} entries`;
}

function renderTable(entries) {
    if (!entries.length) {
        html($("#logTable"), `<p class="small">No log entries match these filters.</p>`);
        return;
    }

    html(
        $("#logTable"),
        `
        <table class="log-table">
            <tr>
                <th>When</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Summary</th>
                <th></th>
            </tr>
            ${entries.map(rowHtml).join("")}
        </table>
    `
    );

    $$(".log-details-toggle").forEach(el => {
        el.addEventListener("click", () => {
            const row = $(`.log-details-row[data-for="${el.dataset.for}"]`);
            if (!row) return;
            row.style.display = row.style.display === "table-row" ? "none" : "table-row";
            el.textContent = row.style.display === "table-row" ? "Hide" : "View";
        });
    });
}

function rowHtml(entry) {
    const id = `${entry.ts}-${entry.type}`;
    const date = new Date(entry.ts);
    const when = date.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });

    return `
        <tr class="log-row log-row-${entry.type}">
            <td class="log-when" title="${date.toISOString()}">${when}</td>
            <td><span class="log-badge log-badge-${entry.type}">${escapeHtml(entry.label)}</span></td>
            <td>${escapeHtml(entry.actorName)}</td>
            <td class="log-summary">${escapeHtml(entry.summary)}</td>
            <td>${entry.hasDetails ? `<button class="ghost log-details-toggle" data-for="${id}">View</button>` : ""}</td>
        </tr>
        ${entry.hasDetails ? `
        <tr class="log-details-row" data-for="${id}" style="display:none">
            <td colspan="5">
                ${detailsHtml(entry.details)}
            </td>
        </tr>` : ""}
    `;
}

function detailsHtml(details) {
    if (!details || !details.length) {
        return `<p class="small">No additional details.</p>`;
    }

    return `
        <dl class="log-details-list">
            ${details.map(d => `
                <dt>${escapeHtml(d.label)}</dt>
                <dd>${escapeHtml(String(d.value))}</dd>
            `).join("")}
        </dl>
    `;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function renderPagination(page, totalPages) {
    if (totalPages <= 1) {
        html($("#logPagination"), "");
        return;
    }

    html(
        $("#logPagination"),
        `
        <button class="ghost" id="prevPageBtn" ${page <= 1 ? "disabled" : ""}>← Prev</button>
        <span class="small">Page ${page} of ${totalPages}</span>
        <button class="ghost" id="nextPageBtn" ${page >= totalPages ? "disabled" : ""}>Next →</button>
    `
    );

    const prevBtn = $("#prevPageBtn");
    const nextBtn = $("#nextPageBtn");

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                loadLogs();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            if (currentPage < currentTotalPages) {
                currentPage++;
                loadLogs();
            }
        });
    }
}