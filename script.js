const matches = [];

// ---ここから新しい関数を追加---
/**
 * 対戦記録一覧を表示するための関数
 */
function displayMatches() {
    // 1. 記録一覧を表示する場所（ulタグ）を取得する
    const recordsContainer = document.getElementById('records-container');

    // 2. まず、表示エリアを空っぽにする（古い表示を消すため）
    recordsContainer.innerHTML = '';

    // 3. matches配列の中身を一つずつ取り出して、HTMLを作っていく
    matches.forEach(function (match) {
        // li要素（リストの1項目）を新しく作る
        const listItem = document.createElement('li');

        // 作ったli要素に、CSSで見栄えを整えるためのクラス名を追加する
        listItem.classList.add('match-record-item');

        // li要素の中に、対戦記録の情報をHTMLとして書き込む
        listItem.innerHTML = `
            <p><strong>日付:</strong> ${match.date}</p>
            <p><strong>相手:</strong> ${match.opponent}</p>
            <p><strong>使用デッキ:</strong> ${match.myDeck}</p>
            <p><strong>相手デッキ:</strong> ${match.opponentDeck}</p>
            <p><strong>結果:</strong> ${match.result}</p>
        `;

        // 4. 完成したli要素を、画面のulタグの中に追加する
        recordsContainer.appendChild(listItem);
    });
}

const submitButton = document.querySelector('#match-form button[type="submit"]');

submitButton.addEventListener('click', function (event) {
    event.preventDefault();

    const dateInput = document.getElementById('matchDate');
    const opponentInput = document.getElementById('opponent');
    const myDeckInput = document.getElementById('myDeck');
    const opponentDeckInput = document.getElementById('opponentDeck');
    const resultInput = document.getElementById('result');

    const matchData = {
        date: dateInput.value,
        opponent: opponentInput.value,
        myDeck: myDeckInput.value,
        opponentDeck: opponentDeckInput.value,
        result: resultInput.value
    };

    matches.push(matchData);

    // ---ここを変更---
    // コンソールに表示する代わりに、新しく作った表示用の関数を呼び出す！
    displayMatches();
    // ---ここまで---

    // ----ここから追加----
    // 入力が終わったらフォームを空にする
    matchForm.reset();
    // ----ここまで----
});

// `matchForm` の定義を追加するのを忘れないようにしましょう
const matchForm = document.getElementById('match-form');