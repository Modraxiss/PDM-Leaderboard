const leaderboardBody = document.getElementById('leaderboard-body');
const regionButtons = document.querySelectorAll('.region-btn');
const showBlankBadgesCheckbox = document.getElementById('showBlankBadges');
const apiUrl = 'https://starblast.io/rankings.json';
let currentRegion;
let previousDataString = '';

async function fetchLeaderboardData() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const players = data.ratings[currentRegion];
        const newData = formatPlayerData(players);

        const newDataString = JSON.stringify(newData);
        if (newDataString !== previousDataString) {
            updateLeaderboard(newData);
            previousDataString = newDataString;
        }
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
    }
}

function formatPlayerData(players) {
    return players
        .filter(player => player.name && player.name.trim() !== '')
        .sort((a, b) => b.live_rating - a.live_rating)
        .slice(0, 100)
        .map(player => ({
            id: player.id,
            name: player.name,
            live_rating: Math.round(player.live_rating),
            ecp: player.custom
        }));
}

function updateLeaderboard(newData) {
    leaderboardBody.innerHTML = '';

    newData.forEach((player, index) => {
        const rank = index + 1;
        const leaderboardItem = createLeaderboardItem(player, rank);
        leaderboardBody.appendChild(leaderboardItem);
    });

    setTimeout(createParticles, 2000);
    updateIcons(newData);
}

function createLeaderboardItem(player, rank) {
    const leaderboardItem = document.createElement('div');
    leaderboardItem.classList.add('leaderboard-item');

    const color = getColorBasedOnECP(player.ecp.finish);
    const badgeClass = rank <= 3 ? 'badge-shadow' : '';
    const textClass = rank === 1 ? 'textParticle' : '';
    // const subspaceClass = player.id === '5a03846a0a6d212bf327f57b' ? 'subspace' : '';

    leaderboardItem.innerHTML = `
                <div class="playerName">
                    <img style="opacity: 0;${rank <= 3 ? `color: ${color};` : "filter: drop-shadow(2px 4px 6px #000);"}" class="ecpIcon no-select ${badgeClass}" src="" data-id="${player.id}">
                    <span class="${textClass}">${player.name}</span>
                </div>
                <div class="status">
                    <div class="${rank <= 3 ? `rank trophy no-select text-glow ${getRankClass(rank)}` : 'rank'}">
                        <span>${rank}</span>
                    </div>
                    <div class="live-score">${player.live_rating}</div>
                </div>
            `;
    return leaderboardItem;
}

function getColorBasedOnECP(finish) {
    switch (finish) {
        case "gold": return "#ffaa00";
        case "titanium": return "#999999";
        case "alloy": return "#e4e5e5";
        case "carbon": return "#464646";
        default: return "#ffffff";
    }
}

function getRankClass(rank) {
    switch (rank) {
        case 1: return 'first';
        case 2: return 'second';
        case 3: return 'third';
        default: return '';
    }
}

async function updateIcons(players) {
    if (players && Array.isArray(players)) {
        for (const player of players) {
            const imgElement = document.querySelector(`.ecpIcon[data-id="${player.id}"]`);
            if (imgElement) {
                imgElement.src = await getECPIcon(player.ecp);
                imgElement.style.opacity = "1";
            }
        }
    }
}

function createParticles() {
    const textParticle = document.querySelector(".textParticle");
    if (textParticle) {
        const particleCount = Math.floor(textParticle.offsetWidth / 50 * 12);
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.className = 'particle';
            const size = `${random(4, 8)}px`;
            particle.style.cssText = `
                        top: ${random(20, 80)}%;
                        left: ${random(0, 95)}%;
                        width: 1px;
                        height: ${size};
                        animation-delay: ${random(0, 3)}s;
                    `;
            textParticle.appendChild(particle);
        }
    }
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function setupRegionButtons() {
    const storedRegion = localStorage.getItem('region');

    currentRegion = storedRegion || 'Asia';

    regionButtons.forEach(button => {
        const region = button.getAttribute('data-region');

        if (region === currentRegion) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }

        button.addEventListener('click', function () {
            if (button.getAttribute('data-region') !== currentRegion) {
                regionButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentRegion = this.getAttribute('data-region');
                fetchLeaderboardData();

                localStorage.setItem('region', currentRegion);
            }
        });
    });
}

function handleBlankBadgesSetting() {
    const blanksSetting = localStorage.getItem('blank');
    showBlankBadgesCheckbox.checked = (blanksSetting === 'yes');

    showBlankBadgesCheckbox.addEventListener('change', () => {
        localStorage.setItem('blank', showBlankBadgesCheckbox.checked ? 'yes' : 'no');
        window.location.reload();
    });
}

function initialize() {
    setupRegionButtons();
    handleBlankBadgesSetting();

    fetchLeaderboardData();
    setInterval(fetchLeaderboardData, 3000);
}

initialize();