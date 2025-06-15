let matches = [];
let myCharts = {}; // グラフのインスタンスを管理するためのオブジェクト

const matchForm = document.getElementById('match-form');
const submitButton = document.querySelector('#match-form button[type="submit"]');

// --- 変更点1：グラフ描画の専門の関数を追加 ---
/**
 * 全てのグラフを描画する関数
 */
function renderCharts() {
    const chartContainer = document.getElementById('chart-container');

    // 既存のグラフがあれば、まず全て破棄する（再描画のため）
    for (const chartId in myCharts) {
        if (myCharts[chartId]) {
            myCharts[chartId].destroy();
        }
    }
    myCharts = {};
    chartContainer.innerHTML = '<h2>デッキ別 対戦相手別勝率</h2>';

    // ユニークな自分のデッキ名を取得する
    const myDecks = [...new Set(matches.map(match => match.myDeck))];

    // デッキごとにグラフを作成する
    myDecks.forEach(myDeckName => {
        // そのデッキでの対戦記録だけをフィルタリング
        const filteredMatches = matches.filter(match => match.myDeck === myDeckName);

        // 対戦相手のデッキごとの勝敗を集計
        const opponentDeckStats = {};
        filteredMatches.forEach(match => {
            if (!opponentDeckStats[match.opponentDeck]) {
                opponentDeckStats[match.opponentDeck] = { wins: 0, total: 0 };
            }
            opponentDeckStats[match.opponentDeck].total++;
            if (match.result === 'win') {
                opponentDeckStats[match.opponentDeck].wins++;
            }
        });

        // グラフ用のデータ（ラベルと勝率）を作成
        const labels = Object.keys(opponentDeckStats);
        const data = labels.map(label => {
            const stats = opponentDeckStats[label];
            return (stats.wins / stats.total) * 100;
        });

        if (labels.length === 0) return; // 表示するデータがなければ何もしない

        // グラフを描画するための<canvas>要素を動的に作成
        const canvas = document.createElement('canvas');
        const chartId = `chart-${myDeckName.replace(/\s+/g, '-')}`;
        canvas.id = chartId;

        const wrapper = document.createElement('div');
        wrapper.className = 'deck-chart-wrapper';
        const title = document.createElement('h3');
        title.textContent = `【${myDeckName}】の相手別勝率`;
        wrapper.appendChild(title);
        wrapper.appendChild(canvas);
        chartContainer.appendChild(wrapper);

        // Chart.jsを使ってグラフを描画
        const ctx = canvas.getContext('2d');
        myCharts[chartId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '勝率 (%)',
                    data: data,
                    backgroundColor: 'rgba(204, 0, 0, 0.7)',
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    });
}


function saveMatches() {
    localStorage.setItem('cardGameMatches', JSON.stringify(matches));
}

function updateStatistics() {
    const statisticsDiv = document.getElementById('statistics');
    if (matches.length === 0) {
        statisticsDiv.innerHTML = '<p>まだ対戦記録がありません。</p>';
        return;
    }
    const totalMatches = matches.length;
    const wins = matches.filter(match => match.result === 'win').length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : 0;
    statisticsDiv.innerHTML = `
        <h3>全体統計</h3>
        <p><strong>総対戦数:</strong> ${totalMatches} 回</p>
        <p><strong>戦績:</strong> ${wins} 勝 ${losses} 敗</p>
        <p><strong>全体勝率:</strong> ${winRate} %</p>
    `;
}

function deleteMatch(index) {
    matches.splice(index, 1);
    displayMatches();
    updateStatistics();
    saveMatches();
    renderCharts(); // --- 変更点2：削除後にもグラフを更新 ---
}

function displayMatches() {
    const recordsContainer = document.getElementById('records-container');
    recordsContainer.innerHTML = '';
    matches.forEach(function (match, index) {
        const listItem = document.createElement('li');
        listItem.classList.add('match-record-item');
        listItem.innerHTML = `
            <p><strong>日付:</strong> ${match.date}</p>
            <p><strong>使用デッキ:</strong> ${match.myDeck}</p>
            <p><strong>相手デッキ:</strong> ${match.opponentDeck}</p>
            <p><strong>結果:</strong> ${match.result}</p>
            <div class="actions">
                <button onclick="deleteMatch(${index})">削除</button>
            </div>
        `;
        recordsContainer.appendChild(listItem);
    });
}

submitButton.addEventListener('click', function (event) {
    event.preventDefault();
    const dateInput = document.getElementById('matchDate');
    const myDeckInput = document.getElementById('myDeck');
    const opponentDeckInput = document.getElementById('opponentDeck');
    const resultInput = document.getElementById('result');
    const turnsInput = document.getElementById('turns');
    const notesInput = document.getElementById('notes');
    const matchData = {
        date: dateInput.value, myDeck: myDeckInput.value, opponentDeck: opponentDeckInput.value,
        result: resultInput.value, turns: turnsInput.value, notes: notesInput.value
    };
    matches.push(matchData);
    displayMatches();
    updateStatistics();
    saveMatches();
    renderCharts(); // --- 変更点3：追加後にもグラフを更新 ---

    opponentDeckInput.value = '';
    resultInput.value = 'win';
    turnsInput.value = '';
    notesInput.value = '';
});

document.addEventListener('DOMContentLoaded', function () {
    const storedMatches = localStorage.getItem('cardGameMatches');
    if (storedMatches) {
        matches = JSON.parse(storedMatches);
    }
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    document.getElementById('matchDate').value = formattedDate;

    updateStatistics();
    displayMatches();
    renderCharts(); // --- 変更点4：初期表示でもグラフを更新 ---
});