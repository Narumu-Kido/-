let matches = [];
let myCharts = {};

const matchForm = document.getElementById('match-form');
const submitButton = document.querySelector('#match-form button[type="submit"]');
// --- 変更点1：recordsContainerをここで取得 ---
const recordsContainer = document.getElementById('records-container');


// (saveMatches, updateStatistics, deleteMatch関数は変更なし)
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
    if (confirm('この記録を本当に削除してもよろしいですか？')) {
        matches.splice(index, 1);
        displayMatches();
        updateStatistics();
        saveMatches();
        renderCharts();
    }
}

/**
 * 対戦記録をデッキごとにグループ化してアコーディオン表示する関数
 */
function displayMatches() {
    recordsContainer.innerHTML = '';

    const groupedByDeck = matches.reduce((acc, match) => {
        const deckName = match.myDeck;
        if (!acc[deckName]) {
            acc[deckName] = [];
        }
        acc[deckName].push(match);
        return acc;
    }, {});

    for (const deckName in groupedByDeck) {
        const deckMatches = groupedByDeck[deckName];

        const groupDiv = document.createElement('div');
        groupDiv.className = 'deck-group';

        const headerButton = document.createElement('button');
        headerButton.className = 'deck-header';

        const wins = deckMatches.filter(match => match.result === 'win').length;
        const losses = deckMatches.length - wins;
        const winRate = deckMatches.length > 0 ? ((wins / deckMatches.length) * 100).toFixed(1) : 0;
        headerButton.textContent = `${deckName} (${deckMatches.length}戦 / ${wins}勝 ${losses}敗 / 勝率: ${winRate}%)`;

        const panelDiv = document.createElement('div');
        panelDiv.className = 'match-list-panel';

        // --- ↓↓↓ここからが今回の修正箇所↓↓↓ ---
        deckMatches.forEach(match => {
            // 1. この対戦記録(match)が、元のmatches配列の何番目にあるかを探す
            const originalIndex = matches.findIndex(originalMatch => originalMatch === match);

            const listItem = document.createElement('div');
            listItem.className = 'match-record-item';

            // 2. 削除ボタンを復活させ、見つけ出した正しいインデックスを渡す
            listItem.innerHTML = `
                <p><strong>日付:</strong> ${match.date}</p>
                <p><strong>相手デッキ:</strong> ${match.opponentDeck}</p>
                <p><strong>結果:</strong> ${match.result}</p>
                <p><strong>ターン数:</strong> ${match.turns ? match.turns : 'N/A'}</p>
                <p style="flex-basis: 100%;"><strong>メモ:</strong> ${match.notes ? match.notes : 'なし'}</p>
                <div class="actions">
                    <button onclick="deleteMatch(${originalIndex})">削除</button>
                </div>
            `;
            panelDiv.appendChild(listItem);
        });
        // --- ↑↑↑ここまでが修正箇所↑↑↑ ---

        groupDiv.appendChild(headerButton);
        groupDiv.appendChild(panelDiv);
        recordsContainer.appendChild(groupDiv);
    }
}


// --- 変更点3：アコーディオンの開閉を管理する処理を追加 ---
recordsContainer.addEventListener('click', function (event) {
    // クリックされたのがクラス名に'deck-header'を持つ要素かチェック
    if (event.target.classList.contains('deck-header')) {
        const panel = event.target.nextElementSibling; // クリックされたヘッダーのすぐ次の要素（パネル）を取得

        // パネルの表示・非表示を切り替える
        if (panel.style.display === 'block') {
            panel.style.display = 'none';
        } else {
            panel.style.display = 'block';
        }
    }
});


// (submitButton.addEventListenerとDOMContentLoadedは、削除ボタンの簡略化以外はほぼ同じ)
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
    renderCharts();

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
    renderCharts();
});
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

    // 対戦記録がなければここで処理を終了
    if (matches.length === 0) {
        return;
    }

    // ユニークな自分のデッキ名を取得する
    const myDecks = [...new Set(matches.map(match => match.myDeck))];

    // デッキごとにグラフを作成する
    myDecks.forEach(myDeckName => {
        const filteredMatches = matches.filter(match => match.myDeck === myDeckName);
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

        const labels = Object.keys(opponentDeckStats);
        const data = labels.map(label => {
            const stats = opponentDeckStats[label];
            return (stats.wins / stats.total) * 100;
        });

        if (labels.length === 0) return;

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

// 削除機能はグループ化によって複雑になるため、次のステップで再度実装します。
// そのため、deleteMatch関数は一旦使われなくなります。