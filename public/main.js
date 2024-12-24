

let CELL_SIZE = 30;
// CELL_SIZE = calculateCellSize();

// セルサイズを計算する関数
function calculateCellSize() {
  const maxFieldWidth = window.innerWidth * 0.4; // 画面幅の40%をフィールドの最大幅に設定
  const maxFieldHeight = window.innerHeight * 0.6; // 画面高さの80%をフィールドの最大高さに設定

  // 各セルのサイズを決定（横方向と縦方向の比率を保つ）
  const cellWidth = maxFieldWidth / FIELD_WIDTH;
  const cellHeight = maxFieldHeight / FIELD_HEIGHT;

  // 最小値を採用してセルが画面内に収まるようにする
  return Math.min(cellWidth, cellHeight);
}

function moveWordToField(wordPool, fieldWords) {

  // TODO WordPoolが少なくなったら非同期的に単語を補充する
  if (wordPool.length < 500) {
    addWordPool(500, wordPool);
  } else if (wordPool.length === 0) {
    console.warn("プレイヤーの単語プールが空です！");
    return;
  }

  // 先頭の単語を切り取る
  const word = wordPool.shift();

  // FieldWords に追加
  fieldWords.push(word);

  // FieldWords を文字数昇順で並び替え
  fieldWords.sort((a, b) => b.length - a.length);

}


// 配列の単語をフィールドに反映する関数
function updateFieldFromWordPool(field, fieldWords) {

  clearField(field);

  // 単語をフィールドに左詰めで配置
  let row = FIELD_HEIGHT - 1; // 下から配置
  for (const word of fieldWords) {
    let col = 0; // 左端から配置
    for (const char of word) {
      if (col >= FIELD_WIDTH) {
        row--; // 次の行に移動
        col = 0;
      }
      if (row < 0) {
        console.warn('フィールドの容量を超えています');
        return;
      }
      field[row][col] = { word: char, isHighlighted: false };
      col++;
    }
    row--; // 次の単語を下の行に配置
  }

  checkAndRemoveWord(playerField, playerFieldWords, playerInput);
  checkAndRemoveWord(opponentField, opponentFieldWords, opponentInput);

  if (gameStarted && field === playerField) {
    socket.emit('fieldUpdate', {
      field: field,
      wordPool: playerWordPool,
      fieldWords: playerFieldWords
    });
  }

}

function updateFieldByAttack(field, fieldWords) {
  // FieldWords を文字数昇順で並び替え
  fieldWords.sort((a, b) => b.length - a.length);

  clearField(field);

  // 単語をフィールドに左詰めで配置
  let row = FIELD_HEIGHT - 1; // 下から配置
  for (const word of fieldWords) {
    let col = 0; // 左端から配置
    for (const char of word) {
      if (col >= FIELD_WIDTH) {
        row--; // 次の行に移動
        col = 0;
      }
      if (row < 0) {
        console.warn('フィールドの容量を超えています');
        return;
      }
      field[row][col] = { word: char, isHighlighted: false };
      col++;
    }
    row--; // 次の単語を下の行に配置
  }

}

function drawField(ctx, field) {
  ctx.fillStyle = "#333";
  // ctx.fillRect(0, 0, parseInt(playerFieldElement.style.width), parseInt(playerFieldElement.style.height, 10));
  ctx.fillRect(0, 0, ctx.canvas.getBoundingClientRect().width, ctx.canvas.getBoundingClientRect().height);
  drawGrid(ctx)
  // フィールドデータを描画
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      const cell = field[y][x];
      if (cell) {
        // セル内の文字を描画
        ctx.fillStyle = '#fff'; // 文字色
        ctx.font = (CELL_SIZE * 0.7) + "px Arial"; // フォント
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = cell.isHighlighted ? '#ffa500' : 'f222';
        ctx.fillText(
          cell.word,
          x * CELL_SIZE + CELL_SIZE / 2,
          y * CELL_SIZE + CELL_SIZE / 1.95
        );
      }
    }
  }
}

function drawGrid(ctx) {
  ctx.strokeStyle = '#333'; // グリッド線の色
  for (let x = 0; x <= FIELD_WIDTH; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL_SIZE, 0);
    ctx.lineTo(x * CELL_SIZE, FIELD_HEIGHT * CELL_SIZE);
    ctx.stroke();
  }
}


// キャンバスサイズをリサイズする関数
function resizeField(canvas) {

  const dpr = window.devicePixelRatio || 1; // デバイスピクセル比を取得
  CELL_SIZE = calculateCellSize(); // セルサイズを再計算

  const width = CELL_SIZE * FIELD_WIDTH; // 論理ピクセル幅
  const height = CELL_SIZE * FIELD_HEIGHT; // 論理ピクセル高さ

  // 実際の解像度を高く設定
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  // CSSスタイルとして見た目のサイズを設定
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  // コンテキストをスケーリング
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

}

function resizeInputField(canvas) {
  const dpr = window.devicePixelRatio || 1;
  CELL_SIZE = calculateCellSize(); // セルサイズを再計算

  const width = CELL_SIZE * FIELD_WIDTH; // 入力領域の幅
  const height = CELL_SIZE * 2; // 入力領域の高さを2セル分に設定

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr); // 高解像度スケーリング
}

function resizeAllCanvases() {
  // フィールドキャンバスをリサイズ
  resizeField(playerFieldElement);
  resizeField(opponentFieldElement);

  // // 入力フィールドキャンバスをリサイズ
  resizeInputField(playerInputField);
  resizeInputField(opponentInputField);

  // フィールドを再描画
  drawField(ctxPlayer, playerField);
  drawField(ctxOpponent, opponentField);

  // 入力フィールドを再描画
  drawInputField(ctxPlayerInput, playerInput, playerInputField);
  drawInputField(ctxOpponentInput, playerInput, opponentInputField);
}



// ウィンドウリサイズ時のイベントリスナー
window.addEventListener('resize', () => {
  resizeAllCanvases();
  // グリッドを描画
  drawGrid(ctxPlayer);
  drawGrid(ctxOpponent);
});


// TODO　グリッドを手前に描写して再描写しない
// グリッドを描画する関数
function drawGrid(ctx) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;

  // 水平線を描画
  for (let y = 0; y <= FIELD_HEIGHT; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL_SIZE);
    ctx.lineTo(FIELD_WIDTH * CELL_SIZE, y * CELL_SIZE);
    ctx.stroke();
  }

  // 垂直線を描画
  for (let x = 0; x <= FIELD_WIDTH; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL_SIZE, 0);
    ctx.lineTo(x * CELL_SIZE, FIELD_HEIGHT * CELL_SIZE);
    ctx.stroke();
  }
}


// 初期描画
resizeInputField(playerInputField);
resizeInputField(opponentInputField);

drawInputField(ctxPlayerInput, "", playerInputField);
drawInputField(ctxOpponentInput, "", opponentInputField);

// 単語リストの読み込み
let wordList = null;
async function loadWordList() {
  const response = await fetch('./words.json');
  wordList = await response.json();

  initializeWordPool(1000);
}

// 単語を取得して配列に格納する関数
function initializeWordPool(count) {

  playerWordPool = [];
  opponentWordPool = [];

  for (let i = 0; i < count; i++) {
    const word = getRandomWordForField(playerUsedLengths);
    playerWordPool.push(word); // プレイヤー配列に追加
  }

  // for (let i = 0; i < count; i++) {
  //   const word = getRandomWordForField(playerUsedLengths);
  //   playerAttackWordPool.push(word); // プレイヤー配列に追加
  // }

  for (let i = 0; i < count; i++) {
    const word = getRandomWordForField(opponentUsedLengths);
    opponentWordPool.push(word); // 対戦相手配列に追加
  }

  // for (let i = 0; i < count; i++) {
  //   const word = getRandomWordForField(opponentUsedLengths);
  //   opponentAttackWordPool.push(word); // 対戦相手配列に追加
  // }

}

function addWordPool(count, wordPool) {
  for (let i = 0; i < count; i++) {
    const word = getRandomWordForField(playerUsedLengths);
    wordPool.push(word); // プレイヤー配列に追加
  }
}

// ゲーム開始
loadWordList().then(() => {

  initializeSocket();

  resizeField(playerFieldElement);
  resizeField(opponentFieldElement);

  // 初期状態は空
  drawInputField(ctxPlayerInput, "", playerInputField);
  // 初期状態は空
  drawInputField(ctxOpponentInput, "", opponentInputField);

  // グリッドを描画
  drawGrid(ctxPlayer);
  drawGrid(ctxOpponent);

  // ゲームループ開始
  startGameLoop();
});

function startGameLoop() {
  if (!gameStarted) return;

  setInterval(() => {
    if (gameStarted) {
      moveWordToField(playerWordPool, playerFieldWords);
      updateFieldFromWordPool(playerField, playerFieldWords);
      drawField(ctxPlayer, playerField);
    }
  }, 2000);
}

// フィールドを更新して描画するループを開始する関数
// function startGameLoop() {
//   setInterval(() => {
//     moveWordToField(playerWordPool, playerFieldWords);
//     moveWordToField(opponentWordPool, opponentFieldWords);

//     // フィールドを更新
//     updateFieldFromWordPool(playerField, playerFieldWords);
//     updateFieldFromWordPool(opponentField, opponentFieldWords);

//     // 再描画
//     drawField(ctxPlayer, playerField);
//     drawField(ctxOpponent, opponentField);

//   }, 2000);
// }


// ランダムな単語を取得
function getRandomWordForField(usedLengths) {
  if (!wordList || !wordList[selectedCategory]) return '';

  const allLengths = Object.keys(wordList[selectedCategory]);
  if (usedLengths.length === allLengths.length) {
    usedLengths.length = 0;
  }

  const availableLengths = allLengths.filter(length => !usedLengths.includes(length));
  const randomLength = availableLengths[Math.floor(Math.random() * availableLengths.length)];
  usedLengths.push(randomLength);

  const words = wordList[selectedCategory][randomLength];
  return words[Math.floor(Math.random() * words.length)];
}

// 攻撃用の単語を取得
function getRandomWordForAttack(characterCount) {
  let character = ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  if (!wordList || !wordList[selectedCategory]) return '';
  const words = wordList[selectedCategory][character[characterCount - 2]];
  return words[Math.floor(Math.random() * words.length)];
}

// キー入力リスナー
window.addEventListener("keydown", (e) => {
  const key = e.key;

  // selectedCategoryがhiraganaの場合、ローマ字をひらがなに変換
  if (selectedCategory === "hiragana") {
    let convertedInput = "";
    // 入力内容を更新
    if (key.length === 1) {
      // 文字を追加
      playerInput += key;


      if (key === "n") {
        // 押下キーが「n」の場合、それ以外を日本語に変換
        convertedInput = wanakana.toHiragana(playerInput.slice(0, -1));

        // 「nn」を「ん」に置き換える処理
        if (playerInput.slice(-2) === "nn") {
          playerInput = playerInput.slice(0, -2) + "n";
          // playerInput = playerInput.slice(0, -2) + "n"; // 「nn」を「n」に一時置き換え
        } else {
          // それから末尾に「n」を加えて描画
          convertedInput = convertedInput + "n";
        }
      } else if (key === "y") {
        convertedInput = wanakana.toHiragana(playerInput);

        // 日本語変換後、に文字消去して「ny」を追加して描画
        if (playerInput.slice(-2) === "ny") {
          convertedInput = convertedInput.slice(0, -2) + "ny";
        }

      } else {
        convertedInput = wanakana.toHiragana(playerInput);
      }
    } else if (key === "Backspace") {

      convertedInput = playerInput.slice(0, -1); // バックスペースで最後の文字を削除

    }
    playerInput = convertedInput;
  }

  // 単語のチェックと削除
  checkAndRemoveWord(playerField, playerFieldWords, playerInput);
  checkAndRemoveWord(opponentField, opponentFieldWords, opponentInput);

  // フィールドと入力内容を再描画
  drawField(ctxPlayer, playerField);
  drawField(ctxOpponent, opponentField);

  drawInputField(ctxPlayerInput, playerInput, playerInputField);
  drawInputField(ctxOpponentInput, opponentInput, opponentInputField);


});

function extractLeadingJapanese(input) {
  // 先頭から連続する日本語（ひらがな、カタカナ、漢字）を抽出する正規表現
  const match = input.match(/^[\u3040-\u30FF\u4E00-\u9FFF]+/);
  return match ? match[0] : ""; // 一致した部分を返す。なければ空文字を返す
}

function checkAndRemoveWord(field, fieldWords, playerInput) {
  // 入力された単語が fieldWords に存在するか確認

  // 入力文字の先頭から続く日本語部分を抽出して、フィールド内の単語と一致しているか確認
  const wordIndex = fieldWords.findIndex((word) => word === extractLeadingJapanese(playerInput));

  if (wordIndex !== -1) {
    // 一致する単語を取得
    const matchedWord = fieldWords[wordIndex];
    const wordLength = matchedWord.length; // 単語の文字数を取得
    fieldWords.splice(wordIndex, 1); // 単語リストから削除

    // フィールドから単語を削除して再描画
    removeWordFromField(field, matchedWord);

    calcAttackValue(matchedWord, field);

    updateFieldFromWordPool(field, fieldWords);

    console.log(`単語「${matchedWord}」が一致しました！ 文字数: ${wordLength}`);
    return 0; // 単語の文字数を返す
  }

  const highLightWordIndex = fieldWords.findIndex((word) => word.startsWith(extractLeadingJapanese(playerInput)));

  if (highLightWordIndex !== -1) {

    // 一致する単語を取得
    // const matchedWord = fieldWords[highLightWordIndex];

    const matchedLength = extractLeadingJapanese(playerInput).length; // 単語の文字数を取得

    highlightMatchWords(field, highLightWordIndex, matchedLength);

    return 0; // 一致しない場合は 0 を返す
  }

  // 部分一致、完全一致しなかった場合、攻撃を弱体化
  nerfAttack();
  return 0; // 一致しない場合は 0 を返す
}

function highlightMatchWords(field, highLightWordIndex, matchedLength) {
  resetHighlight(field);
  for (let x = 0; x < matchedLength; x++) {
    field[field.length - 1 - highLightWordIndex][x].isHighlighted = true;
  }
}

function removeWordFromField(field, word) {
  let remainingWord = word;
  for (let y = FIELD_HEIGHT - 1; y >= 0; y--) { // 下から上へスキャン
    for (let x = 0; x < FIELD_WIDTH; x++) { // 左から右へスキャン
      if (field[y][x] && field[y][x].word === remainingWord[0]) {
        field[y][x] = null; // セルを空にする
        remainingWord = remainingWord.slice(1); // 残りの文字列を更新
        if (remainingWord.length === 0) {
          playerInput = ""; // 入力をリセット
          return;
        }
      }
    }
  }
  resetHighlight(field);
}

// 画面フィールドをクリア
function clearField(field) {
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      field[y][x] = null;
    }
  }
}

function resetHighlight(field) {
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      if (field[y][x]) {
        field[y][x].isHighlighted = false; // ハイライト状態をリセット
      }
    }
  }
}

function drawInputField(ctx, inputText, inputField) {
  // 入力文字を描画する領域をキャンバス内に設定
  const textY = CELL_SIZE; // キャンバス内に少し余裕を持たせた高さに描画
  ctx.clearRect(0, 0, inputField.getBoundingClientRect().width, inputField.getBoundingClientRect().height);
  ctx.fillStyle = '#fff'; // 白文字
  ctx.font = `${CELL_SIZE * 1.5}px Arial`; // フォントサイズを調整
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // 入力文字をキャンバスの中央に描画
  ctx.fillText(inputText, inputField.width / 2, textY);

}

function calcAttackValue(removeWord, field) {
  if (field === playerField) {
    playerAttackValue = removeWord.length;
    console.log(playerAttackValue);

    if (playerLastAttackValue + 1 == removeWord.length) {
      playerAttackValue = playerAttackValue + 1
      upStockAttackValue();

    } else if (playerLastAttackValue - 1 == removeWord.length) {
      downStockAttackValue();

    } else if (playerLastAttackValue == removeWord.length) {
      sameCharAttack();

    } else {
      attack(opponentField, opponentFieldWords, playerAttackValue);
    }
    playerLastAttackValue = playerAttackValue;

  } else {
    opponentAttackValue = removeWord.length;
  }

}


function attack(receiveField, receiveFieldWords, attackValue) {

  receiveFieldWords.push(getRandomWordForAttack(attackValue));
  updateFieldByAttack(receiveField, receiveFieldWords);

}

function upStockAttackValue() {

}

function downStockAttackValue() {

}

function sameCharAttack() {

}

function nerfAttack() {

}

// main.jsに追加
function initializeSocket() {
  
  // ここからRender用追記
  // const socketUrl = window.location.hostname === 'localhost'
  //   ? 'http://localhost:3000'
  //   : window.location.origin;

  console.log(window.location.origin);  // このログで URL を確認
  const socketUrl = window.location.origin;
  socket = io(socketUrl);

  // ここまで

  // socket = io();

  socket.on('waitingForPlayer', () => {
    console.log('対戦相手を待っています...');
  });

  socket.on('gameStart', (data) => {
    playerId = socket.id;
    isPlayer1 = playerId === data.player1Id;
    opponentId = isPlayer1 ? data.player2Id : data.player1Id;
    gameStarted = true;

    initializeWordPool(1000);
    startGameLoop();
    console.log(`ゲーム開始: ${isPlayer1 ? 'プレイヤー1' : 'プレイヤー2'}`);
  });

  socket.on('fieldSync', (data) => {
    opponentFieldWords = data.fieldWords;
    opponentWordPool = data.wordPool;
    updateFieldFromWordPool(opponentField, opponentFieldWords);
    drawField(ctxOpponent, opponentField);
  });

  socket.on('opponentDisconnected', () => {
    console.log('対戦相手が切断しました');
    gameStarted = false;
  });
}