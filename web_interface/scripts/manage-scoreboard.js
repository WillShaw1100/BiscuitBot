let data = null;
let chart = null;
let currentSeason = 1;
let currentGame = 0;
let allSeasons = [];

// Load latest season by default
async function load(){
    const res = await fetch('/scoreboard');
    data = await res.json();
    currentSeason = data.season || 1;

    await loadSeasons();

    renderSeasonTabs();
    renderPlayers();
    renderBestPlayer();
    renderTopThree();
    renderChart();
    renderHeatmap();
    renderGameTabs();
    renderGameTable();
}

async function loadSeasons(){
    const res = await fetch('/scoreboard/seasons');
    allSeasons = await res.json(); // [1,2,3,...]
}

function renderSeasonTabs(){
    document.getElementById('seasonTabs').innerHTML =
        allSeasons.map(season => `
            <div class="tab ${season === currentSeason ? 'active' : ''}"
                 onclick="switchSeason(${season})">
                Season ${season}
            </div>
        `).join('');
}

async function switchSeason(season){
    const res = await fetch('/scoreboard?season=' + season);
    data = await res.json();
    currentSeason = data.season || season;

    renderSeasonTabs();
    renderPlayers();
    renderBestPlayer();
    renderTopThree();
    renderChart();
    renderHeatmap();
    renderGameTabs();
    renderGameTable();
}

function renderGameTabs(){
    const maxGames = Math.max(0, ...data.players.map(p => (p.games||[]).length));
    currentGame = Math.min(currentGame, Math.max(0, maxGames - 1));

    if (maxGames === 0) {
        document.getElementById('gameTabs').innerHTML = '';
        document.getElementById('gameTable').innerHTML = '<p>No games yet this season.</p>';
        return;
    }

    document.getElementById('gameTabs').innerHTML =
        Array.from({length:maxGames}).map((_,i)=>`
            <div class="tab ${i===currentGame?'active':''}" onclick="selectGame(${i})">
                Game ${i+1}
            </div>
        `).join('');
}

function selectGame(i){
    currentGame = i;
    document.querySelectorAll('#gameTabs .tab').forEach((t,idx)=>{
        t.classList.toggle('active', idx===i);
    });
    renderGameTable();
}

function renderGameTable(){
    const rows = data.players
        .map(p=>({
            username:p.username,
            avatar:p.avatar,
            score:(p.games||[])[currentGame],
            points:(p.points||[])[currentGame]
        }))
        .filter(r=>r.score != null)
        .sort((a,b)=>b.score - a.score);

    if (!rows.length) {
        document.getElementById('gameTable').innerHTML = '<p>No data for this game.</p>';
        return;
    }

    document.getElementById('gameTable').innerHTML = `
        <table>
            <tr>
                <th>Player</th>
                <th>Score</th>
                <th>Points</th>
            </tr>
            ${rows.map(r=>`
                <tr>
                    <td><img src="${r.avatar}" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:6px;"> ${r.username}</td>
                    <td>${r.score}</td>
                    <td>${r.points ?? 0}</td>
                </tr>
            `).join('')}
        </table>
    `;
}

function renderPlayers(){
    const maxGames = Math.max(0, ...data.players.map(p => (p.games||[]).length));

    document.getElementById('players').innerHTML =
    data.players.map(p => {
        const gamesPlayed = (p.games||[]).filter(g=>g!==null && g!==undefined).length;
        const totalScore = (p.games||[]).reduce((a,b)=>a+(b||0),0);
        const avgScore = gamesPlayed > 0 ? (totalScore / gamesPlayed).toFixed(2) : "0.00";
        const points = (p.points||[]).reduce((a,b)=>a+(b||0),0);

        return `
        <div class="player" onclick="openProfile('${p.userId}')">
            <img src="${p.avatar}">
            <div style="flex:1">
                <b>${p.username}</b>
                <div class="small">
                    Games Played: ${gamesPlayed} |
                    Total Score: ${totalScore} |
                    Avg Score: ${avgScore} |
                    Points: ${points}
                </div>
            </div>

            <div class="games" onclick="event.stopPropagation();">
                ${Array.from({length:maxGames}).map((_,i)=>{
                    const g = p.games?.[i];
                    const medal = getMedal(i, p.userId);

                    return `
                    <div class="game">
                        <div class="medal">${medal}</div>
                        Game ${i+1}
                        ${
                            g == null
                            ? `<div class="na">N/A</div>`
                            : `
                                <div style="margin-top:6px;">
                                    <input type="number"
                                        value="${g}"
                                        onchange="updateScore('${p.userId}',${i},this.value)"
                                        style="width:70px;">
                                </div>
                            `
                        }
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    }).join('');
}

function renderBestPlayer(){
    if (!data.players.length) return;

    const best = [...data.players].sort((a,b)=>{
        const aPoints = (a.points||[]).reduce((x,y)=>x+(y||0),0);
        const bPoints = (b.points||[]).reduce((x,y)=>x+(y||0),0);
        return bPoints - aPoints;
    })[0];

    const totalPoints = (best.points||[]).reduce((a,b)=>a+(b||0),0);

    document.getElementById('bestPlayer').innerHTML = `
        <div class="leader-card">
            <div class="crown">👑</div>
            <img src="${best.avatar}">
            <div>
                <b>${best.username}</b><br>
                <span style="font-size:13px;color:var(--muted);">
                    Best Overall Player<br>
                    Total Points: ${totalPoints}
                </span>
            </div>
        </div>
    `;
}

function renderTopThree(){
    const sorted = [...data.players].sort((a,b)=>{
        const aPoints = (a.points||[]).reduce((x,y)=>x+(y||0),0);
        const bPoints = (b.points||[]).reduce((x,y)=>x+(y||0),0);
        return bPoints - aPoints;
    });

    const top = sorted.slice(0,3);

    document.getElementById('topThree').innerHTML = top.map((p,i)=>`
        <div class="leader-card" style="opacity:${i===0?1:0.85}">
            <div style="font-size:22px;">
                ${i===0?'🥇':i===1?'🥈':'🥉'}
            </div>
            <img src="${p.avatar}">
            <div>
                <b>${p.username}</b><br>
                <span style="font-size:13px;color:var(--muted);">
                    ${(p.points||[]).reduce((a,b)=>a+(b||0),0)} pts
                </span>
            </div>
        </div>
    `).join('');
}

function renderChart(){
    const ctx = document.getElementById('statsChart');

    const labels = data.players.map(p => p.username);
    const totalScores = data.players.map(p => (p.games||[]).reduce((a,b)=>a+(b||0),0));
    const avgScores = data.players.map(p => {
        const gp = (p.games||[]).filter(g=>g!==null && g!==undefined).length;
        const ts = (p.games||[]).reduce((a,b)=>a+(b||0),0);
        return gp > 0 ? (ts/gp).toFixed(2) : 0;
    });

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Total Score',
                    data: totalScores,
                    backgroundColor: 'rgba(88,101,242,0.6)',
                    borderColor: 'rgba(88,101,242,1)',
                    borderWidth: 1
                },
                {
                    label: 'Average Score',
                    data: avgScores,
                    type: 'line',
                    borderColor: '#facc15',
                    backgroundColor: '#facc15',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: { drawOnChartArea: false }
                }
            }
        }
    });
}

function renderHeatmap(){
    const maxGames = Math.max(0, ...data.players.map(p => (p.games||[]).length));

    let html = `<h3 style="margin:10px 0;">Participation</h3>`;
    html += `<div style="display:grid;grid-template-columns:repeat(${maxGames+1},1fr);gap:4px;font-size:11px;">`;

    html += `<div></div>`;
    for (let i=0;i<maxGames;i++){
        html += `<div style="text-align:center;">G${i+1}</div>`;
    }

    data.players.forEach(p=>{
        html += `<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.username}</div>`;

        for (let i=0;i<maxGames;i++){
            const g = (p.games||[])[i];

            const color = g == null 
                ? '#b91c1c'
                : '#16a34a';

            html += `<div style="height:16px;background:${color};border-radius:4px;"></div>`;
        }
    });

    html += `</div>`;

    document.getElementById('heatmap').innerHTML = html;
}

// PROFILE PANEL
function openProfile(userId){
    const p = data.players.find(x=>x.userId === userId);
    if (!p) return;

    const gamesPlayed = (p.games||[]).filter(g=>g!==null && g!==undefined).length;
    const totalScore = (p.games||[]).reduce((a,b)=>a+(b||0),0);
    const avgScore = gamesPlayed ? (totalScore/gamesPlayed).toFixed(2) : 0;
    const totalPoints = (p.points||[]).reduce((a,b)=>a+(b||0),0);

    const breakdown = (p.games||[]).map((g,i)=>`
        <div style="font-size:13px;margin:2px 0;">
            Game ${i+1}: ${g ?? 'N/A'} (Points: ${(p.points||[])[i] ?? 0})
        </div>
    `).join('');

    document.getElementById('profilePanel').innerHTML = `
        <button onclick="closeProfile()" style="float:right;">Close</button>
        <h2>${p.username}</h2>
        <img src="${p.avatar}" style="width:80px;height:80px;border-radius:50%;margin-bottom:10px;">
        <p>Total Score: ${totalScore}</p>
        <p>Average Score: ${avgScore}</p>
        <p>Total Points: ${totalPoints}</p>
        <h3>Game Breakdown</h3>
        ${breakdown}
    `;

    document.getElementById('profilePanel').style.right = "0";
}

function closeProfile(){
    document.getElementById('profilePanel').style.right = "-420px";
}

// MEDALS
function getMedal(gameIndex, userId){
    const arr = data.players.map(p=>({
        id:p.userId,
        score:(p.games||[])[gameIndex]
    })).filter(x=>x.score!=null)
      .sort((a,b)=>b.score-a.score);

    let rank=0,last=null;

    for(let i=0;i<arr.length;i++){
        if(arr[i].score!==last){
            rank=i+1;
            last=arr[i].score;
        }
        if(arr[i].id===userId){
            if(rank===1) return '🥇';
            if(rank===2) return '🥈';
            if(rank===3) return '🥉';
        }
    }
    return '';
}

// UPDATE SCORE
async function updateScore(userId, gameIndex, value){
    await fetch('/scoreboard/updateGame',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({userId,gameIndex,value})
    });

    load();
}

// SEARCH
let t;
async function searchUsers(){
    clearTimeout(t);
    const q=document.getElementById('search').value.trim();

    if(!q){
        document.getElementById('results').innerHTML='';
        return;
    }

    t=setTimeout(async()=>{
        const res=await fetch('/scoreboard/search?q='+encodeURIComponent(q));
        const users=await res.json();

        document.getElementById('results').innerHTML=
        users.map(u=>`
            <div class="result-item" onclick="addUser('${u.id}')">
                <img src="${u.avatar}">
                <div>${u.username}</div>
            </div>
        `).join('');
    },150);
}

// ADD USER
async function addUser(id){
    const res = await fetch('/scoreboard/add',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ userId:id })
    });

    if (res.status === 409) {
        alert('User already exists');
        return;
    }

    document.getElementById('search').value='';
    document.getElementById('results').innerHTML='';
    load();
}

// MODAL: ADD GAME
function openModal(){
    document.getElementById('modal').style.display='flex';

    document.getElementById('modalPlayers').innerHTML =
    data.players.map(p=>`
        <div class="row">
            <input type="checkbox" id="c-${p.userId}" style="transform:scale(1.3);">
            <img src="${p.avatar}">
            <div style="font-size:15px;">${p.username}</div>
            <input type="number" id="s-${p.userId}" style="width:90px;padding:6px;">
        </div>
    `).join('');
}

function closeModal(){
    document.getElementById('modal').style.display='none';
}

// SUBMIT GAME
async function submitGame(){
    const results=[];

    data.players.forEach(p=>{
        const c=document.getElementById('c-'+p.userId);
        const s=document.getElementById('s-'+p.userId);

        if(c.checked){
            results.push({
                userId:p.userId,
                score:Number(s.value||0)
            });
        }
    });

    await fetch('/scoreboard/addGameWithScores',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({results})
    });

    closeModal();
    load();
}

// SEASON RESET
function openSeasonReset(){
    document.getElementById('seasonModal').style.display = 'flex';
}

function closeSeasonReset(){
    document.getElementById('seasonModal').style.display = 'none';
}

async function confirmSeasonReset(){
    const res = await fetch('/scoreboard/resetSeason', { method:'POST' });
    const json = await res.json();

    closeSeasonReset();

    // Reload latest season
    const latest = await fetch('/scoreboard');
    data = await latest.json();
    currentSeason = data.season || json.season;

    await loadSeasons();
    renderSeasonTabs();
    renderPlayers();
    renderBestPlayer();
    renderTopThree();
    renderChart();
    renderHeatmap();
    renderGameTabs();
    renderGameTable();
}

function exportExcel(){
    window.location='/scoreboard/export';
}

load();