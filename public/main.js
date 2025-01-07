

let CELL_SIZE = 30;
// CELL_SIZE = calculateCellSize();

// セルサイズを計算する関数
function calculateCellSize() {
  const maxFieldWidth = window.innerWidth * 0.5; // 画面幅の40%をフィールドの最大幅に設定
  const maxFieldHeight = window.innerHeight * 0.7; // 画面高さの80%をフィールドの最大高さに設定

  // 各セルのサイズを決定（横方向と縦方向の比率を保つ）
  const cellWidth = maxFieldWidth / FIELD_WIDTH;
  const cellHeight = maxFieldHeight / FIELD_HEIGHT;

  // 最小値を採用してセルが画面内に収まるようにする
  return Math.min(cellWidth, cellHeight);
}

function setWordPool() {
  if (wordPool.length === 0) {
    for (let x = 0; x < 5; x++) {
      wordPool.push(getRandomWordForField(playerUsedLengths));
    }
    console.log(wordPool);
  } else {
    wordPool = [];
    for (let x = 0; x < 5; x++) {
      wordPool.push(getRandomWordForField(playerUsedLengths));
    }
  }
}

// moveWordToField関数を修正
function moveWordToField(fieldWords) {
  let toPutFieldWord = wordPool.shift();
  fieldWords.push(toPutFieldWord);
  wordPool.push(getRandomWordForField(playerUsedLengths));

  // FieldWords を文字数昇順で並び替え
  fieldWords.sort((a, b) => b.length - a.length);

  // Next表示を更新
  updateNextDisplay(wordPool);
}

const colors = ["rgba(255, 0, 0, 0.5)", "rgba(0, 0, 255, 0.5)", "rgba(0, 255, 0, 0.5)", "rgba(255, 255, 0, 0.5)", "rgba(255, 0, 255, 0.5)"];

// Next表示用の関数
function updateNextDisplay(words, isPlayer = true) {
  const prefix = isPlayer ? 'player' : 'opponent';

  // 一致する文字を取得
  const combinedWords = [...playerFieldWords, ...wordPool];
  const matchingChars = getMatchingStartAndEndLetters(combinedWords);

  // 5つのNextを表示
  for (let i = 1; i <= 5; i++) {
    const nextElement = document.getElementById(`${prefix}Next${i}`);
    const word = words[i - 1];

    // 一致する文字を基にスタイルを変更
    let styledWord = word.split("").map((char, index) => {
      let colorIndex = matchingChars.indexOf(char);

      // 先頭文字が一致かつ lastChar と同じ場合
      if (index === 0 && char === lastChar) {
        return `<span style="color: rgb(0, 0, 0); text-shadow: -1px -1px 0 rgb(255, 255, 255), 1px -1px 0 rgb(255, 255, 255), -1px 1px 0 rgb(255, 255, 255), 1px 1px 0 rgb(255, 255, 255);">${char}</span>`;
      }

      // 最初の文字が一致（lastChar のチェックはなし）
      if (index === 0 && colorIndex !== -1) {
        return `<span style="color: ${colors[colorIndex % colors.length]}">${char}</span>`;
      }

      // 最後の文字が一致
      if (index === word.length - 1 && colorIndex !== -1) {
        return `<span style="color: ${colors[colorIndex % colors.length]}">${char}</span>`;
      }

      return char;
    }).join("");

    nextElement.innerHTML = styledWord;
  }

  // プレイヤーの場合、相手に情報を送信
  if (isPlayer && socket) {
    // スタイル情報を生成
    const styledWords = words.map((word) => {
      if (!word) return "";
      return word.split("").map((char, index) => {
        let colorIndex = matchingChars.indexOf(char);
        const color = colorIndex !== -1 ? colors[colorIndex % colors.length] : "black";

        if (index === 0 && char === lastChar) {
          return `<span style="color: rgb(0, 0, 0); text-shadow: -2px -2px 0 rgb(255, 255, 255), 2px -2px 0 rgb(255, 255, 255), -2px 2px 0 rgb(255, 255, 255), 2px 2px 0 rgb(255, 255, 255);">${char}</span>`;
        }

        // 最初の文字が一致
        if (index === 0 && matchingChars.includes(char)) {
          return `<span style="color: ${color}">${char}</span>`;
        }

        // 最後の文字が一致
        if (index === word.length - 1 && matchingChars.includes(char)) {
          return `<span style="color: ${color}">${char}</span>`;
        }

        return char;
      }).join("");
    });

    updateAllNextGradients(wordPool, true);

    socket.emit('nextWordsUpdate', {
      words: words,
      styledWords: styledWords
    });
  }

}

// Next要素のグラデーション背景を更新する関数
function updateNextElementGradient(prefix, index, wordLength) {
  const nextElement = document.getElementById(`${prefix}Next${index}`);
  if (!nextElement || !wordLength) return;

  const lengthDiff = wordLength - memorizeLastAttackValue;
  let gradientStyle = '';

  if (lengthDiff === 1) {
    // 青色のグラデーション（1文字多い場合）
    gradientStyle = 'background: radial-gradient(circle at center, rgba(173, 216, 230, 0.02) 0%, rgba(173, 216, 230, 0.05) 50%, rgba(173, 216, 230, 0.3) 100%);';
  } else if (lengthDiff === -1) {
    // 緑色のグラデーション（1文字少ない場合）
    gradientStyle = 'background: radial-gradient(circle at center, rgba(144, 238, 144, 0.02) 0%, rgba(144, 238, 144, 0.05) 50%, rgba(144, 238, 144, 0.3) 100%);';
  } else {
    // 差分がない場合は背景をクリア
    gradientStyle = 'background: none;';
  }

  nextElement.style = gradientStyle;
  return gradientStyle;
}

// 全てのNext要素のグラデーションを更新し、相手画面と同期する関数
function updateAllNextGradients(words, isPlayer = true) {
  const prefix = isPlayer ? 'player' : 'opponent';
  const gradientStyles = [];

  // 自分の画面のNext要素を更新
  for (let i = 1; i <= 5; i++) {
    const word = words[i - 1];
    const gradientStyle = updateNextElementGradient(prefix, i, word?.length);
    gradientStyles.push(gradientStyle || '');
  }

  // プレイヤーの操作の場合のみ、相手画面の同期を行う
  if (isPlayer && socket) {
    // 相手画面のNext要素を更新するためのイベントを発行
    socket.emit('syncOpponentGradients', {
      gradientStyles: gradientStyles
    });
  }

  return gradientStyles;
}

// ソケット通信用のグラデーション更新関数


// checkAndRemoveWordからのみ呼び出され、単語を削除後、再描画する
function updateField(field, fieldWords) {
  console.log("updateField実行");
  if (gameState !== 'playing') return;
  clearField(field);

  let row = FIELD_HEIGHT - 1;
  for (const word of fieldWords) {
    let col = 0;
    for (const char of word) {
      if (col >= FIELD_WIDTH) {
        row--;
        col = 0;
      }
      field[row][col] = { word: char, isHighlighted: false };
      col++;
    }
    row--;
  }
  syncFieldUpdate(field);
}

function updateFieldAfterReceiveOffset(field, fieldWords) {
  console.log("updateFieldAfterReceiveOffset実行");
  console.log("与えた攻撃:" + playerAttackValueToOffset);
  console.log("受けた攻撃:" + playerReceiveValueToOffset);

  calcReceiveOffset();
  console.log("相殺後は:" + playerReceiveValueToOffset);

  for (let x = 0; x < playerReceiveValueToOffset.length; x++) {
    let addFieldWord = getRandomWordForAttack(playerReceiveValueToOffset[x]);
    fieldWords.push(addFieldWord);
    console.log("addFieldWordは:" + addFieldWord);
  }
  playerAttackValueToOffset = [];
  playerReceiveValueToOffset = [];
  calcReceiveOffsetToDisplay();
  drawStatusField(ctxPlayerStatus, true);

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
      if (row === 0) {
        field[row][col] = { word: char, isHighlighted: false };
        col++;
      } else if (row < 0) {
        drawField(ctxPlayer, playerField);

        console.log("描写する行が上限を突破したためdrawField");

        console.log("syncFieldUpdateして・handleGameOver処理");
        syncFieldUpdate();
        handleGameOver(true);

        socket.emit('gameOver', { loserId: playerId });

        return;

      } else {
        // console.log(word + "描画");
        field[row][col] = { word: char, isHighlighted: false };
        col++;
      }
    }
    row--; // 次の単語を下の行に配置
  }
  syncFieldUpdate();
}

// ひらがなの大文字・小文字を正規化する関数
function normalizeHiragana(char) {
  const smallToLargeMap = {
    "ぁ": "あ", "ぃ": "い", "ぅ": "う", "ぇ": "え", "ぉ": "お",
    "ゃ": "や", "ゅ": "ゆ", "ょ": "よ", "ゎ": "わ",
    "っ": "つ", "ゕ": "か", "ゖ": "け"
  };
  return smallToLargeMap[char] || char; // 小文字なら変換、大文字はそのまま
}


function getMatchingStartAndEndLetters(combinedWords) {
  const startMap = new Map(); // 各文字の先頭での出現位置を記録
  const endMap = new Map();   // 各文字の終了での出現位置を記録

  // 各単語の先頭文字と終了文字を収集
  combinedWords.forEach((word, index) => {
    if (word.length === 0) return; // 空文字列は無視
    const startChar = normalizeHiragana(word[0]); // 先頭文字を正規化
    const endChar = normalizeHiragana(word[word.length - 1]); // 終了文字を正規化

    // 先頭文字の出現位置を記録
    if (!startMap.has(startChar)) {
      startMap.set(startChar, []);
    }
    startMap.get(startChar).push(index);

    // 終了文字の出現位置を記録
    if (!endMap.has(endChar)) {
      endMap.set(endChar, []);
    }
    endMap.get(endChar).push(index);
  });

  const matchingChars = [];

  // 先頭文字と終了文字で一致している文字を探す
  for (const char of startMap.keys()) {
    if (endMap.has(char)) {
      const startIndices = startMap.get(char);
      const endIndices = endMap.get(char);

      // 合計出現回数が2の場合
      if (startIndices.length + endIndices.length === 2) {
        // 出現位置が同じかどうかを確認
        if (startIndices[0] === endIndices[0]) {
          // 出現位置が同じ場合は除外（何もしない）
          continue;
        }
      }

      // それ以外は matchingChars に追加
      matchingChars.push(char);
    }
  }

  return matchingChars;
}

// ゲームオーバー処理
function handleGameOver(isLoser) {
  if (gameState === 'ended') return; // 既にゲーム終了処理が行われている場合は何もしない
  console.log("handleGameOver実行");
  gameState = 'ended';
  isGameOver = true;

  // 結果表示
  drawGameOverUI(ctxPlayer, isLoser ? 'Lose' : 'Win'); // プレイヤー側
  drawGameOverUI(ctxOpponent, isLoser ? 'Win' : 'Lose'); // 対戦相手側

  // 少し待ってからリトライダイアログを表示
  setTimeout(() => {
    showRetryDialog();
  }, 1000);
}

// リトライレスポンス処理
function handleRetryResponse(response) {
  const buttons = retryDialog.querySelectorAll('button');
  buttons.forEach(button => button.disabled = true); // ボタンを無効化
  socket.emit('retryResponse', { response });
}

function drawGameOverUI(ctx, text) {
  const width = ctx.canvas.getBoundingClientRect().width;
  const height = ctx.canvas.getBoundingClientRect().height;
  ctx.save();
  // 半透明の背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, width, height);

  // 結果テキスト
  ctx.fillStyle = '#fff';
  ctx.font = `${CELL_SIZE * 2}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  ctx.restore();
}

function syncFieldUpdate() {
  if (gameStarted) {
    socket.emit('fieldUpdate', {
      field: playerField,
      fieldWords: playerFieldWords
    });
  }
  // console.log("syncFieldUpdateのplayerFieldWords" + playerFieldWords);
}

function calcReceiveOffset() {
  // 共通する値を削除
  for (let i = playerAttackValueToOffset.length - 1; i >= 0; i--) {
    const value = playerAttackValueToOffset[i];
    if (playerReceiveValueToOffset.includes(value)) {
      // playerAttackValueToOffset から削除
      playerAttackValueToOffset.splice(i, 1);
      // playerReceiveValueToOffset から削除
      playerReceiveValueToOffset.splice(playerReceiveValueToOffset.indexOf(value), 1);
    }
  }

  // 合算する
  let attackSum = playerAttackValueToOffset.reduce((sum, value) => sum + value, 0);

  // playerReceiveValueToOffset の最も大きい値から順に引いていく
  while (attackSum > 0 && playerReceiveValueToOffset.length > 0) {
    // 最大値を探す
    let maxIndex = playerReceiveValueToOffset.indexOf(Math.max(...playerReceiveValueToOffset));
    let maxValue = playerReceiveValueToOffset[maxIndex];

    if (attackSum >= maxValue) {
      // 合算値が最大値を超える場合、最大値を削除
      attackSum -= maxValue;
      playerReceiveValueToOffset.splice(maxIndex, 1);
    } else {
      // 合算値が最大値未満の場合、最大値を減らす
      playerReceiveValueToOffset[maxIndex] -= attackSum;
      attackSum = 0; // 合算値を使い切る

      // 残った値が2未満なら削除
      if (playerReceiveValueToOffset[maxIndex] < 2) {
        playerReceiveValueToOffset.splice(maxIndex, 1);
      }
    }
  }
}

let playerAttackValueToDisplay = [];
let playerReceiveValueToDisplay = [];

function calcReceiveOffsetToDisplay() {

  playerAttackValueToDisplay = [...playerAttackValueToOffset];
  playerReceiveValueToDisplay = [...playerReceiveValueToOffset];

  // 共通する値を削除
  for (let i = playerAttackValueToDisplay.length - 1; i >= 0; i--) {
    const value = playerAttackValueToDisplay[i];
    if (playerReceiveValueToDisplay.includes(value)) {
      // playerAttackValueToDisplay から削除
      playerAttackValueToDisplay.splice(i, 1);
      // playerReceiveValueToDisplay から削除
      playerReceiveValueToDisplay.splice(playerReceiveValueToDisplay.indexOf(value), 1);
    }
  }

  // 合算する
  let attackSum = playerAttackValueToDisplay.reduce((sum, value) => sum + value, 0);

  // playerReceiveValueToDisplay の最も大きい値から順に引いていく
  while (attackSum > 0 && playerReceiveValueToDisplay.length > 0) {
    // 最大値を探す
    let maxIndex = playerReceiveValueToDisplay.indexOf(Math.max(...playerReceiveValueToDisplay));
    let maxValue = playerReceiveValueToDisplay[maxIndex];

    if (attackSum >= maxValue) {
      // 合算値が最大値を超える場合、最大値を削除
      attackSum -= maxValue;
      playerReceiveValueToDisplay.splice(maxIndex, 1);
    } else {
      // 合算値が最大値未満の場合、最大値を減らす
      playerReceiveValueToDisplay[maxIndex] -= attackSum;
      attackSum = 0; // 合算値を使い切る

      // 残った値が2未満なら削除
      if (playerReceiveValueToDisplay[maxIndex] < 2) {
        playerReceiveValueToDisplay.splice(maxIndex, 1);
      }
    }
  }

  // 降順にソート
  playerAttackValueToDisplay.sort((a, b) => a - b);
  playerReceiveValueToDisplay.sort((a, b) => a - b);

  // console.log("playerReceiveValueToDisplay:" + playerReceiveValueToDisplay);
}

// グローバル変数の初期化
let playerOverlayCanvas;
let opponentOverlayCanvas;

// オーバーレイキャンバスの初期化関数
function initializeOverlayCanvases() {
  // プレイヤーのオーバーレイキャンバスを作成
  playerOverlayCanvas = document.createElement('canvas');
  playerOverlayCanvas.id = 'playerChainStyleOverlay';
  playerOverlayCanvas.style.position = 'absolute';
  playerOverlayCanvas.style.pointerEvents = 'none';
  const playerFieldWrapper = document.querySelector('#playerGameArea .field-wrapper');
  playerFieldWrapper.style.position = 'relative';
  playerFieldWrapper.appendChild(playerOverlayCanvas);

  // 相手のオーバーレイキャンバスを作成
  opponentOverlayCanvas = document.createElement('canvas');
  opponentOverlayCanvas.id = 'opponentChainStyleOverlay';
  opponentOverlayCanvas.style.position = 'absolute';
  opponentOverlayCanvas.style.pointerEvents = 'none';
  const opponentFieldWrapper = document.querySelector('#opponentGameArea .field-wrapper');
  opponentFieldWrapper.style.position = 'relative';
  opponentFieldWrapper.appendChild(opponentOverlayCanvas);

  // 両方のキャンバスをリサイズ
  resizeWarningOverlay(playerOverlayCanvas);
  resizeWarningOverlay(opponentOverlayCanvas);
}

// ハイライト処理関数を修正
function highlightMatchingCells(field, combinedWords) {
  let isPlayer = true;
  if (field === opponentField) {
    isPlayer = false;
  }
  const matchingChars = getMatchingStartAndEndLetters(combinedWords);

  // 文字と色の対応を保持
  const charColorMap = new Map();
  matchingChars.forEach((char, index) => {
    charColorMap.set(char, colors[index % colors.length]);
  });

  // 使用するオーバーレイキャンバスを選択
  const overlayCanvas = isPlayer ? playerOverlayCanvas : opponentOverlayCanvas;
  const overlayCtx = overlayCanvas.getContext('2d');

  // キャンバスをクリア
  overlayCtx.clearRect(0, 0, overlayCtx.canvas.getBoundingClientRect().width, overlayCtx.canvas.getBoundingClientRect().height);

  overlayCtx.lineWidth = 3;
  console.log(isPlayer);

  // 各行を上から順にチェック
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    // まず先頭(x=0)をチェック
    if (!field[y][0] || !field[y][0].word) {
      continue;
    }

    // 先頭の文字のチェック
    const startChar = field[y][0].word[0];
    if (isPlayer && startChar === lastChar) {
      // セルを白く点滅させたい
    }
    else if (charColorMap.has(startChar)) {
      overlayCtx.strokeStyle = charColorMap.get(startChar);
      overlayCtx.strokeRect(
        0 + overlayCtx.lineWidth / 2,
        y * CELL_SIZE + overlayCtx.lineWidth / 2,
        CELL_SIZE - overlayCtx.lineWidth,
        CELL_SIZE - overlayCtx.lineWidth
      );
    }

    // その行の最後尾を探してチェック
    for (let x = FIELD_WIDTH - 1; x > 0; x--) {
      if (field[y][x] && field[y][x].word) {
        const endChar = normalizeHiragana(field[y][x].word[field[y][x].word.length - 1]);
        if (charColorMap.has(endChar)) {
          overlayCtx.strokeStyle = charColorMap.get(endChar);
          overlayCtx.strokeRect(
            x * CELL_SIZE + overlayCtx.lineWidth / 2,
            y * CELL_SIZE + overlayCtx.lineWidth / 2,
            CELL_SIZE - overlayCtx.lineWidth,
            CELL_SIZE - overlayCtx.lineWidth
          );
        }
        break;  // 最後尾が見つかったらその行の探索終了
      }
    }
  }

  // プレイヤーの場合、相手に情報を送信
  if (isPlayer && socket) {
    // ハイライト情報の収集と送信処理...
    socket.emit('fieldHighlightUpdate', {
      combinedWords: combinedWords
    });
  }
}

function drawField(ctx, field) {
  if (gameState === 'ended') return;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.getBoundingClientRect().width, ctx.canvas.getBoundingClientRect().height);
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      const cell = field[y][x];
      if (cell) {
        const gradient = ctx.createRadialGradient(
          x * CELL_SIZE + CELL_SIZE / 2,
          y * CELL_SIZE + CELL_SIZE / 2,
          CELL_SIZE * 3,
          x * CELL_SIZE + CELL_SIZE / 2,
          y * CELL_SIZE + CELL_SIZE / 2,
          0
        );

        if (cell.isHighlighted) {
          gradient.addColorStop(0, 'rgb(0, 0, 0)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        // フォント設定
        ctx.font = `${CELL_SIZE * 0.7}px 'M PLUS Rounded 1c'`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        const centerX = x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = y * CELL_SIZE + CELL_SIZE / 2;

        if (cell.isHighlighted) {
          // ハイライト時は白い輪郭線と黒い文字
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 2;  // 輪郭線の太さ
          ctx.strokeText(cell.word, centerX, centerY);

          ctx.fillStyle = 'white';
          ctx.fillText(cell.word, centerX, centerY);
        } else {
          // 通常時は白い文字
          ctx.fillStyle = 'white';
          ctx.fillText(cell.word, centerX, centerY);
        }
      }
    }
  }
  drawGrid(ctx);
  // const combinedWords = [...playerFieldWords, ...wordPool];
  highlightMatchingCells(field, playerFieldWords);
}

function drawGrid(ctx) {
  ctx.strokeStyle = 'rgba(51, 51, 51)'; // グリッド線の色
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

// 既存のresizeAllCanvases関数に追加
function resizeAllCanvases() {
  // 既存のリサイズ処理
  resizeField(playerFieldElement);
  resizeField(opponentFieldElement);
  resizeInputField(playerInputField);
  resizeInputField(opponentInputField);

  // ステータスフィールドのリサイズ
  resizeStatusField(playerStatusElement);
  resizeStatusField(opponentStatusElement);

  // 全フィールドの再描画
  drawField(ctxPlayer, playerField);
  drawField(ctxOpponent, opponentField);
  drawInputField(ctxPlayerInput, playerInput, playerInputField);
  drawInputField(ctxOpponentInput, opponentInput, opponentInputField);
  drawStatusField(ctxPlayerStatus, true);
  drawStatusField(ctxOpponentStatus, false);

  // オーバーレイのリサイズ
  resizeWarningOverlay(overlayContexts.playerOverlay);
  resizeWarningOverlay(overlayContexts.opponentOverlay);

  resizeWarningOverlay(playerOverlayCanvas);
  resizeWarningOverlay(opponentOverlayCanvas);

  // 警告オーバーレイの再描画
  if (warningState.player.isVisible) {
    drawWarningOverlay(true);
  }
  if (warningState.opponent.isVisible) {
    drawWarningOverlay(false);
  }
}

// ウィンドウリサイズ時のイベントリスナー
window.addEventListener('resize', () => {
  resizeAllCanvases();
});

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

}

// ゲーム開始
// 初期化時の処理に追加
loadWordList().then(() => {
  initializeSocket();

  resizeField(playerFieldElement);
  resizeField(opponentFieldElement);
  resizeStatusField(playerStatusElement);
  resizeStatusField(opponentStatusElement);

  drawInputField(ctxPlayerInput, "", playerInputField);
  drawInputField(ctxOpponentInput, "", opponentInputField);
  drawStatusField(ctxPlayerStatus, true);
  drawStatusField(ctxOpponentStatus, false);

  drawGrid(ctxPlayer);
  drawGrid(ctxOpponent);

  initializeOverlayCanvases();
});

let interval = 5000; // 初期の間隔（ミリ秒）
const minInterval = 1000; // 最小の間隔（ミリ秒）

// startGame関数を修正
function startGame() {
  // if (gameState !== 'playing') return;
  setWordPool();
  drawInfo();

  function gameStep() {
    // if (gameState !== 'playing') return;
    moveWordToField(playerFieldWords);
    updateFieldAfterReceiveOffset(playerField, playerFieldWords);
    checkAndRemoveWord(playerField, playerFieldWords, playerInput);
    drawField(ctxPlayer, playerField);

    // インターバルを更新し、プログレスバーを開始
    interval = Math.max(minInterval, interval - 50);
    updateProgressBar(interval);
    // setTimeout(gameStep, interval);
  }

  gameStep();
}


// プログレスバーの制御用の変数とエレメント
const progressLineLeft = document.getElementById('progressLineLeft');
const progressLineRight = document.getElementById('progressLineRight');
let progressTimer = null;
let startTime = 0;

// プログレスバーのアニメーション制御関数
function updateProgressBar(currentInterval) {
  if (progressTimer) {
    clearInterval(progressTimer);
  }

  // アニメーションクラスを削除した状態でリセット
  progressLineLeft.classList.remove('animating');
  progressLineRight.classList.remove('animating');
  progressLineLeft.style.transform = 'scaleX(1)';
  progressLineRight.style.transform = 'scaleX(1)';

  // 少し遅延を入れてアニメーションクラスを追加
  setTimeout(() => {
    progressLineLeft.classList.add('animating');
    progressLineRight.classList.add('animating');
  }, 10);

  progressLineLeft.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  progressLineRight.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  progressLineLeft.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';
  progressLineRight.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.5)';

  startTime = Date.now();

  progressTimer = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const remaining = currentInterval - elapsed;
    const progress = remaining / currentInterval;

    if (remaining <= currentInterval / 3) {
      const redColor = 'rgba(255, 50, 50, 0.8)';
      const redShadow = '0 0 10px rgba(255, 50, 50, 0.5)';
      progressLineLeft.style.backgroundColor = redColor;
      progressLineRight.style.backgroundColor = redColor;
      progressLineLeft.style.boxShadow = redShadow;
      progressLineRight.style.boxShadow = redShadow;
    }

    if (progress <= 0) {
      progressLineLeft.style.transform = 'scaleX(0)';
      progressLineRight.style.transform = 'scaleX(0)';
      clearInterval(progressTimer);
    } else {
      progressLineLeft.style.transform = `scaleX(${progress})`;
      progressLineRight.style.transform = `scaleX(${progress})`;
    }
  }, 16);
}

// プログレスバーをクリアする関数
function clearProgressBar() {
  if (progressTimer) {
    clearInterval(progressTimer);
  }
  progressLineLeft.classList.remove('animating');
  progressLineRight.classList.remove('animating');
  progressLineLeft.style.transform = 'scaleX(0)';
  progressLineRight.style.transform = 'scaleX(0)';
}

// ランダムな単語を取得
function getRandomWordForField(usedLengths) {
  const words = wordList[selectedCategory]["test"];
  return words[Math.floor(Math.random() * words.length)];
  // if (!wordList || !wordList[selectedCategory]) return '';

  // const allLengths = Object.keys(wordList[selectedCategory]);
  // if (usedLengths.length === allLengths.length) {
  //   usedLengths.length = 0;
  // }

  // const availableLengths = allLengths.filter(length => !usedLengths.includes(length));
  // const randomLength = availableLengths[Math.floor(Math.random() * availableLengths.length)];
  // usedLengths.push(randomLength);

  // const words = wordList[selectedCategory][randomLength];
  // return words[Math.floor(Math.random() * words.length)];
}

// 攻撃用の単語を取得
function getRandomWordForAttack(characterCount) {
  const words = wordList[selectedCategory]["test"];
  return words[Math.floor(Math.random() * words.length)];
  // let character = ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  // if (!wordList || !wordList[selectedCategory]) return '';
  // const words = wordList[selectedCategory][character[characterCount - 2]];
  // return words[Math.floor(Math.random() * words.length)];
}

// キー入力リスナー
window.addEventListener("keydown", (e) => {
  // if (gameState !== 'playing') {
  //   return;
  // }
  const key = e.key;

  // selectedCategoryがhiraganaの場合、ローマ字をひらがなに変換
  if (selectedCategory === "hiragana") {
    let convertedInput = "";
    // 入力内容を更新
    if (key.length === 1) {
      playerKeyValueToKPM++;
      // 文字を追加
      playerInput += key;
      if (key === ' ') {
        moveWordToField(playerFieldWords);
        updateFieldAfterReceiveOffset(playerField, playerFieldWords);
        playerInput = playerInput.trim();
        convertedInput = wanakana.toHiragana(playerInput);

      } else if (key === "n") {
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
      if (convertedInput === "") {
        resetHighlight(playerField);
      }
    } else if (key === "Delete") {
      convertedInput = ""
      resetHighlight(playerField);
    }
    else if (key === "Enter") {
      startGame();
    }

    playerInput = convertedInput;
  }

  // 単語のチェックと削除
  checkAndRemoveWord(playerField, playerFieldWords, playerInput);
  // checkAndRemoveWord(opponentField, opponentFieldWords, opponentInput);

  // 入力状態を同期
  syncInputUpdate();

  // フィールドと入力内容を再描画
  drawField(ctxPlayer, playerField);
  // drawField(ctxOpponent, opponentField);

  drawInputField(ctxPlayerInput, playerInput, playerInputField);
  // drawInputField(ctxOpponentInput, opponentInput, opponentInputField);


});

function syncInputUpdate() {
  // 入力状態を同期
  if (gameStarted) {
    socket.emit('inputUpdate', {
      input: playerInput
    });
  }
}

function extractLeadingJapanese(input) {
  // 先頭から連続する日本語（ひらがな、カタカナ、漢字）を抽出する正規表現
  const match = input.match(/^[\u3040-\u30FF\u4E00-\u9FFF]+/);
  return match ? match[0] : ""; // 一致した部分を返す。なければ空文字を返す
}

function checkAndRemoveWord(field, fieldWords, input) {


  // 入力された単語が fieldWords に存在するか確認
  if (input.length !== 0) {

    // 入力文字の先頭から続く日本語部分を抽出して、フィールド内の単語と一致しているか確認
    const wordIndex = fieldWords.findIndex((word) => word === extractLeadingJapanese(input));

    if (wordIndex !== -1) {
      // 一致する単語を取得
      const matchedWord = fieldWords[wordIndex];
      // const wordLength = matchedWord.length; // 単語の文字数を取得
      fieldWords.splice(wordIndex, 1); // 単語リストから削除

      // フィールドから単語を削除して再描画
      removeWordFromField(field, matchedWord);

      calcAttackValue(matchedWord);

      updateField(field, fieldWords);

      updateAllNextGradients(wordPool, true);

      return;
    }

    const highLightWordIndex = fieldWords.findIndex((word) => word.startsWith(extractLeadingJapanese(input)));

    if (highLightWordIndex !== -1) {

      const matchedLength = extractLeadingJapanese(input).length; // 単語の文字数を取得

      highlightMatchWords(field, highLightWordIndex, matchedLength);

      return 0; // 一致しない場合は 0 を返す
    }

    resetHighlight(field);

    // プレイヤー入力時、部分一致、完全一致しなかった場合、攻撃を弱体化
    if (playerInput.length !== 0) {
      // console.log("playerInput" + playerInput);
      cancelChain();
      nerfAttackValue();
    }
    return 0; // 一致しない場合は 0 を返す
  }

}

function highlightMatchWords(field, highLightWordIndex, matchedLength) {
  resetHighlight(field);
  for (let x = 0; x < matchedLength; x++) {
    field[field.length - 1 - highLightWordIndex][x].isHighlighted = true;
  }
}

// resetHighlight関数を修正
function resetHighlight(field) {
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      if (field[y][x]) {
        field[y][x].isHighlighted = false;
      }
    }
  }
}

function removeWordFromField(field, word) {
  playerWordValueToWPM++;
  console.log(`単語「${word}」を消去`);
  let remainingWord = word;
  for (let y = FIELD_HEIGHT - 1; y >= 0; y--) { // 下から上へスキャン
    for (let x = 0; x < FIELD_WIDTH; x++) { // 左から右へスキャン
      if (field[y][x] && field[y][x].word === remainingWord[0]) {
        field[y][x] = null; // セルを空にする
        remainingWord = remainingWord.slice(1); // 残りの文字列を更新
        if (remainingWord.length === 0) {
          playerInput = ""; // 入力をリセット
          syncInputUpdate();
          resetHighlight(field);
          return;
        }
      }
    }
  }
}

// 画面フィールドをクリア
function clearField(field) {
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      field[y][x] = null;
    }
  }
}

function drawInputField(ctx, inputText, inputField) {
  // 入力文字を描画する領域をキャンバス内に設定
  const textY = CELL_SIZE; // キャンバス内に少し余裕を持たせた高さに描画
  ctx.clearRect(0, 0, inputField.getBoundingClientRect().width, inputField.getBoundingClientRect().height);
  ctx.fillStyle = '#fff'; // 白文字
  ctx.font = `${CELL_SIZE * 1}px 'M PLUS Rounded 1c'`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  // 入力文字をキャンバスの中央に描画
  ctx.fillText(inputText, inputField.getBoundingClientRect().width / 2, textY);

}

let memorizeLastAttackValue = 0;
function calcAttackValue(removeWord) {
  playerAttackValue = removeWord.length;
  memorizeLastAttackValue = playerAttackValue;
  console.log("removeWordの攻撃力は:" + playerAttackValue);
  // console.log("playerLastAttackValueは" + playerLastAttackValue);
  // console.log("playerAttackValueは" + playerAttackValue);

  // 現在の removeWord の最初の文字
  let firstChar = removeWord.charAt(0);

  // 特定の条件: 前回の最後の文字と今回の最初の文字が一致する場合
  if (lastChar === firstChar) {
    isWordChain = true;
    console.log("isWordChainはtrue")
  } else {
    isWordChain = false;
  }
  if (isWordChain) {
    connect();
  }
  else if (playerLastAttackValue - 1 == removeWord.length) {
    // console.log("upChain攻撃！ もとになる攻撃力は:" + playerAttackValue);
    isSameChar = false;
    isUpChain = true;
    upChainAttack();

  } else if (playerLastAttackValue + 1 == removeWord.length) {
    // console.log("downChain攻撃！ もとになる攻撃力は:" + playerAttackValue);
    isSameChar = false;
    isDownChain = true;
    downChainAttack();

  } else if (playerLastAttackValue == removeWord.length) {
    // console.log("sameChar攻撃！ もとになる攻撃力は:" + playerAttackValue);
    // cancelChain();
    isSameChar = true;
    sameCharAttack();

  } else {
    // console.log("通常攻撃！ 攻撃力は:" + playerAttackValue);
    cancelChain();
    attack(playerAttackValue);
  }
  playerLastAttackValue = memorizeLastAttackValue;

  // 現在の removeWord の最後の文字を記憶
  lastChar = normalizeHiragana(removeWord.charAt(removeWord.length - 1));
}

function cancelChain() {
  isUpChain = false;
  isDownChain = false;
  isSameChar = false;
  chainBonus = 0;
  updateChainInfoDisplay();
}


// 既存のattack関数を修正
function attack(attackValue) {
  if (gameStarted) {
    if (nerfValue !== 0) {
      // isNerf = true;
      let nerfAttackValue = attackValue - nerfValue;
      nerfValue = 0;

      if (nerfAttackValue < 2) {
        console.log("ナーフで攻撃無効 nerfAttackValue:" + nerfAttackValue);
        updateNerfInfoDisplay();

        updateAttackInfoDisplay();
        emitAttackInfo();
        return;

      } else {
        console.log("ナーフ攻撃 nerfAttackValue:" + nerfAttackValue);
        playerAttackValueToOffset.push(nerfAttackValue);
        playerAtteckValueToAPM += nerfAttackValue;
        socket.emit('attack', {
          attackValue: nerfAttackValue
        });
        updateAttackInfoDisplay();
        emitAttackInfo();
      }

      updateNerfInfoDisplay();

    } else {
      // isNerf = false;
      console.log("攻撃します攻撃力は:" + attackValue);
      playerAttackValueToOffset.push(attackValue);
      playerAtteckValueToAPM += attackValue;
      socket.emit('attack', {
        attackValue: attackValue
      });
      updateAttackInfoDisplay();
      emitAttackInfo();
    }

    calcReceiveOffsetToDisplay();
    drawStatusField(ctxPlayerStatus, true);
  }
}

function emitAttackInfo() {
  // 攻撃タイプの判定
  let attackType = 'Attack';
  if (isWordChain) {
    attackType = 'Connect!';
  } else if (isUpChain) {
    attackType = 'UpChain';
  } else if (isDownChain) {
    attackType = 'DownChain';
  } else if (isSameChar) {
    attackType = 'DoubleAttack';
  }

  let playerChainBonus = 0;
  if (chainBonus !== 0) {
    playerChainBonus = chainBonus;
  }

  socket.emit('sendAttackInfo', {
    attackType: attackType,
    chainBonus: playerChainBonus,
  });
}

// 攻撃情報の表示を更新する関数
function updateAttackInfoDisplay() {

  // 攻撃タイプの判定
  let attackType = 'Attack';
  if (isWordChain) {
    attackType = 'Connect!';
  } else if (isUpChain) {
    attackType = 'UpChain';
  } else if (isDownChain) {
    attackType = 'DownChain';
  } else if (isSameChar) {
    attackType = 'DoubleAttack';
  }

  // 表示の更新
  // playerAttackKind.textContent = attackType;
  animateAttackInfo(playerAttackKind, attackType);
  updateChainInfoDisplay();


  // playerChainBonus.textContent = chainBonus !== 0 ? `Chain: ${chainBonus}` : '';

}

function updateOpponentAttackInfoDisplay(attackType) {
  animateAttackInfo(opponentAttackKind, attackType);
}

// アニメーションを適用する関数
function animateAttackInfo(element, value) {
  // 値を設定
  element.textContent = value;

  // 既存のアニメーションをリセット
  element.classList.remove('animate');
  element.classList.add('reset-animation');

  // リフロー（強制的な再描画）をトリガー
  void element.offsetWidth;

  // リセットクラスを削除してアニメーションを開始
  element.classList.remove('reset-animation');
  element.classList.add('animate');
}

function updateChainInfoDisplay() {
  if (chainBonus !== 0) {
    animateAttackInfo(playerChainBonus, `Chain: ${chainBonus}`);
  } else {
    // フェードアウトアニメーションを適用
    playerChainBonus.classList.remove('animate');
    playerChainBonus.classList.add('fade-out');

    // アニメーション終了後に空文字列を設定
    setTimeout(() => {
      playerChainBonus.textContent = '';
      playerChainBonus.classList.remove('fade-out');
    }, 500); // フェードアウトアニメーションの時間と同じ
  }
  emitChainInfo();
}

function emitChainInfo() {
  socket.emit('sendChainInfo', {
    chainBonus: chainBonus,
  });
}

function updateOpponentChainInfoDisplay(chainBonus) {
  if (chainBonus !== 0) {
    animateAttackInfo(opponentChainBonus, `Chain: ${chainBonus}`);
  } else {
    // フェードアウトアニメーションを適用
    opponentChainBonus.classList.remove('animate');
    opponentChainBonus.classList.add('fade-out');

    // アニメーション終了後に空文字列を設定
    setTimeout(() => {
      opponentChainBonus.textContent = '';
      opponentChainBonus.classList.remove('fade-out');
    }, 500); // フェードアウトアニメーションの時間と同じ
  }
}

function updateNerfInfoDisplay() {
  // playerNerfValue.textContent = nerfValue !== 0 ? `Nerf: ${nerfValue}` : '';
  if (nerfValue !== 0) {
    animateAttackInfo(playerNerfValue, `Nerf: ${nerfValue}`);
  } else {
    // フェードアウトアニメーションを適用
    playerNerfValue.classList.remove('animate');
    playerNerfValue.classList.add('fade-out');

    // アニメーション終了後に空文字列を設定
    setTimeout(() => {
      playerNerfValue.textContent = '';
      playerNerfValue.classList.remove('fade-out');
    }, 500); // フェードアウトアニメーションの時間と同じ
  }
  emitNerfInfo();
}

function emitNerfInfo() {
  socket.emit('sendNerfInfo', {
    nerfValue: nerfValue,
  });
}

function updateOpponentNerfInfoDisplay(nerfValue) {
  opponentNerfValue.textContent = nerfValue !== 0 ? `Nerf: ${nerfValue}` : '';
  if (nerfValue !== 0) {
    animateAttackInfo(opponentNerfValue, `Nerf: ${nerfValue}`);
  } else {
    // フェードアウトアニメーションを適用
    opponentNerfValue.classList.remove('animate');
    opponentNerfValue.classList.add('fade-out');

    // アニメーション終了後に空文字列を設定
    setTimeout(() => {
      opponentNerfValue.textContent = '';
      opponentNerfValue.classList.remove('fade-out');
    }, 500); // フェードアウトアニメーションの時間と同じ
  }
}

function connect() {
  isUpChain = false;
  isDownChain = false;
  attack(playerAttackValue);
  if (chainBonus !== 0) {
    attack(chainBonus);
  }
}

function upChainAttack() {
  if (isDownChain === true) {
    isDownChain = false;
    chainBonus = 2;
    console.log("upChainAttackに切り替わったのでボーナスは2");
    console.log("isDownChainは" + isDownChain);
    console.log("isUpChainは" + isUpChain);
  }
  if (chainBonus === 0) {
    attack(playerAttackValue);
    attack(chainBonus);
    console.log("初めてのchainBonusは" + chainBonus);

  } else {
    chainBonus = chainBonus + 2;
    if (chainBonus >= 10) {
      attack(playerAttackValue);
      attack(10);
      attack(chainBonus % 10);
      console.log("chainBonusによる追加攻撃");
      console.log("連続chainBonusは" + chainBonus);
    } else {
      attack(playerAttackValue);
      attack(chainBonus);
      console.log("連続chainBonusは" + chainBonus);
    }
  }
}

function downChainAttack() {
  if (isUpChain === true) {
    isUpChain = false;
    chainBonus = 2;
    console.log("downChainAttackに切り替わったのでボーナスは2");
    console.log("isDownChainは" + isDownChain);
    console.log("isUpChainは" + isUpChain);
  }
  if (chainBonus === 0) {
    console.log("初めてのchainBonusは" + chainBonus);
    attack(playerAttackValue);
    attack(chainBonus);
  } else {
    chainBonus++;
    if (chainBonus >= 10) {
      attack(playerAttackValue);
      attack(10);
      attack(chainBonus % 10);
      console.log("chainBonusによる追加攻撃");
      console.log("連続chainBonusは" + chainBonus);
    } else {
      attack(playerAttackValue);
      attack(chainBonus);
      console.log("連続chainBonusは" + chainBonus);
    }
  }
}

function sameCharAttack() {
  playerAttackValue = playerAttackValue * 2
  console.log("sameCharAttack 攻撃力は:" + playerAttackValue + "に上昇");
  if (playerAttackValue === 20) {
    attack(10);
    const array = [2, 3, 4, 5, 6, 7, 8];
    const randomValue = array[Math.floor(Math.random() * array.length)];
    attack(randomValue);
    attack(10 - randomValue);

  } else if (playerAttackValue > 10) {
    attack(10);
    attack(playerAttackValue % 10);
  } else {
    attack(playerAttackValue);
  }
  console.log("sameCharAttack 攻撃力は:" + playerAttackValue);
}

function nerfAttackValue() {
  nerfValue = nerfValue + 1;
  updateNerfInfoDisplay();
}

// ゲームリセット関数
function resetGame() {
  // ゲーム状態のリセット
  gameState = 'waiting';
  isGameOver = false;
  interval = 5000; // 初期インターバルに戻す

  // プレイヤーデータのリセット
  playerField = Array(FIELD_HEIGHT).fill().map(() => Array(FIELD_WIDTH).fill(null));
  playerFieldWords = [];
  playerInput = '';
  playerUsedLengths = [];
  playerAttackValue = 0;
  playerLastAttackValue = 0;
  playerAttackValueToOffset = [];
  playerReceiveValueToOffset = [];
  playerAttackValueToDisplay = [];
  playerReceiveValueToDisplay = [];
  lastChar = "";
  isWordChain = false;
  nerfValue = 0;
  chainBonus = 0;
  isUpChain = false;
  isDownChain = false;

  // playerInfoをリセット
  playerKeyValueToKPM = 0;
  playerAtteckValueToAPM = 0;
  playerWordValueToWPM = 0;
  totalTime = 0;
  time = "0:00.0";

  // 相手のデータもリセット
  opponentField = Array(FIELD_HEIGHT).fill().map(() => Array(FIELD_WIDTH).fill(null));
  opponentFieldWords = [];
  opponentInput = '';

  // キャンバスをクリア
  clearField(playerField);
  clearField(opponentField);
  drawField(ctxPlayer, playerField);
  drawField(ctxOpponent, opponentField);
  drawInputField(ctxPlayerInput, '', playerInputField);
  drawInputField(ctxOpponentInput, '', opponentInputField);
  drawStatusField(ctxPlayerStatus, true);

  cleanupWarningAnimations();
}

// マッチング成功UI表示
function showMatchingSuccess() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 10px;
    font-size: 6vh;
    z-index: 1000;
  `;
  overlay.textContent = 'マッチングに成功しました';
  document.body.appendChild(overlay);

  setTimeout(() => {
    document.body.removeChild(overlay);
    startCountdown();
  }, 500);
}

// カウントダウン表示
function showCountdown(count) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font: Arial;
    font-size: 8vh;
    z-index: 1000;
  `;
  overlay.textContent = count;
  document.body.appendChild(overlay);

  setTimeout(() => document.body.removeChild(overlay), 100);
}

// カウントダウン処理
function startCountdown() {
  gameState = 'countdown';
  let count = 3;

  const countInterval = setInterval(() => {
    if (count >= 1) {
      showCountdown(count);
    }

    if (count < 1) {
      clearInterval(countInterval);
      gameState = 'playing';
      startGame();
    }
    count--;
  }, 100);
}

// リトライダイアログ表示
function showRetryDialog() {
  if (retryDialog) return; // 既に表示されている場合は何もしない

  retryDialog = document.createElement('div');
  retryDialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    z-index: 1000;
  `;

  retryDialog.innerHTML = `
    <div style="margin-bottom: 20px;">もう一度プレイしますか？</div>
    <button onclick="handleRetryResponse(true)" 
      style="margin: 0 10px; padding: 10px 20px; background: #4CAF50; border: none; border-radius: 5px; color: white; cursor: pointer;">
      Yes
    </button>
    <button onclick="handleRetryResponse(false)"
      style="margin: 0 10px; padding: 10px 20px; background: #f44336; border: none; border-radius: 5px; color: white; cursor: pointer;">
      No
    </button>
  `;

  document.body.appendChild(retryDialog);
}

// 追加のJavaScript
const playerStatusElement = document.getElementById('playerStatusField');
const opponentStatusElement = document.getElementById('opponentStatusField');
const ctxPlayerStatus = playerStatusElement.getContext('2d');
const ctxOpponentStatus = opponentStatusElement.getContext('2d');

// グローバル変数に追加
let opponentReceiveValueToDisplay = [];

// ステータスフィールドのサイズ設定関数
function resizeStatusField(canvas) {
  const dpr = window.devicePixelRatio || 1;
  CELL_SIZE = calculateCellSize();

  const width = CELL_SIZE / 2; // 幅はセルの半分
  const height = CELL_SIZE * FIELD_HEIGHT;

  canvas.width = width * dpr;
  canvas.height = height * dpr;

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
}

// オーバーレイのリサイズ関数を修正
function resizeWarningOverlay(overlayElement) {
  const dpr = window.devicePixelRatio || 1;
  const width = CELL_SIZE * FIELD_WIDTH + 3;
  const height = CELL_SIZE * FIELD_HEIGHT + 3;

  // 実際の解像度を高く設定
  overlayElement.width = width * dpr;
  overlayElement.height = height * dpr;

  // CSSスタイルとして見た目のサイズを設定
  overlayElement.style.width = `${width}px`;
  overlayElement.style.height = `${height}px`;

  // コンテキストをスケーリング
  const ctx = overlayElement.getContext('2d');
  ctx.scale(dpr, dpr);

  // statusFieldの幅を考慮して位置を調整
  overlayElement.style.top = `1.5px`;
  overlayElement.style.left = `${CELL_SIZE / 2 + 3.5}px`;
}


// setupWarningOverlay関数を修正
function setupWarningOverlay() {
  const playerWrapper = document.querySelector('#playerGameArea .field-wrapper');
  const opponentWrapper = document.querySelector('#opponentGameArea .field-wrapper');

  // プレイヤー側のオーバーレイ
  const playerOverlay = document.createElement('canvas');
  playerOverlay.id = 'playerWarningOverlay';
  playerOverlay.style.position = 'absolute';
  playerOverlay.style.pointerEvents = 'none';
  playerWrapper.style.position = 'relative';
  playerWrapper.appendChild(playerOverlay);

  // 対戦相手側のオーバーレイ
  const opponentOverlay = document.createElement('canvas');
  opponentOverlay.id = 'opponentWarningOverlay';
  opponentOverlay.style.position = 'absolute';
  opponentOverlay.style.pointerEvents = 'none';
  opponentWrapper.style.position = 'relative';
  opponentWrapper.appendChild(opponentOverlay);

  // 初期サイズを設定
  resizeWarningOverlay(playerOverlay);
  resizeWarningOverlay(opponentOverlay);

  return {
    playerCtx: playerOverlay.getContext('2d'),
    opponentCtx: opponentOverlay.getContext('2d'),
    playerOverlay,
    opponentOverlay
  };
}

// グローバル変数として追加したoverlayContextsの定義を修正
const overlayContexts = setupWarningOverlay();
const warningState = {
  player: {
    isVisible: false,
    interval: null
  },
  opponent: {
    isVisible: false,
    interval: null
  }
};

// 警告オーバーレイを描画する関数を修正
function drawWarningOverlay(isPlayer) {
  const ctx = isPlayer ? overlayContexts.playerCtx : overlayContexts.opponentCtx;
  const state = isPlayer ? warningState.player : warningState.opponent;

  // オーバーレイをクリア
  ctx.clearRect(0, 0, CELL_SIZE * FIELD_WIDTH, CELL_SIZE * FIELD_HEIGHT);

  if (state.isVisible) {
    // グラデーションの作成
    const centerX = CELL_SIZE * FIELD_WIDTH / 2;
    const centerY = CELL_SIZE * FIELD_HEIGHT / 2;

    // 対角線の長さを計算して、グラデーションの半径とする
    const radius = Math.sqrt(Math.pow(CELL_SIZE * FIELD_WIDTH, 2) + Math.pow(CELL_SIZE * FIELD_HEIGHT, 2)) / 2;

    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,          // 内側の円の中心座標とサイズ
      centerX, centerY, radius      // 外側の円の中心座標とサイズ
    );

    // グラデーションの色を設定
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.05)');   // 中心は薄く
    gradient.addColorStop(0.8, 'rgba(255, 0, 0, 0.15)'); // 中間
    gradient.addColorStop(1, 'rgba(255, 0, 0, 0.3)');   // 端は濃く

    // グラデーションを適用して描画
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CELL_SIZE * FIELD_WIDTH, CELL_SIZE * FIELD_HEIGHT);
  }
}

// drawStatusField関数を修正
function drawStatusField(ctx, isPlayer = true) {
  // 既存のステータス描画処理
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillRect(0, 0, CELL_SIZE / 2, CELL_SIZE * FIELD_HEIGHT);

  const displayValues = isPlayer ? playerReceiveValueToDisplay : opponentReceiveValueToDisplay;
  const fieldWords = isPlayer ? playerFieldWords : opponentFieldWords;
  const state = isPlayer ? warningState.player : warningState.opponent;

  // オーバーフロー状態の確認
  const isOverflowing = displayValues.length + fieldWords.length > FIELD_HEIGHT;

  // 警告アニメーションの管理
  if (isOverflowing && !state.interval) {
    // アニメーション開始
    state.interval = setInterval(() => {
      state.isVisible = !state.isVisible;
      drawWarningOverlay(isPlayer);
    }, 500);
  } else if (!isOverflowing && state.interval) {
    // オーバーフローが解消されたら該当プレイヤーのアニメーションのみを停止
    clearInterval(state.interval);
    state.interval = null;
    state.isVisible = false;
    drawWarningOverlay(isPlayer);
  }

  // 既存の値表示処理
  if (displayValues.length > 0) {
    const startY = CELL_SIZE * (FIELD_HEIGHT - displayValues.length);

    for (let i = 0; i < displayValues.length; i++) {
      const cellY = startY + (i * CELL_SIZE);

      ctx.fillStyle = "rgb(135, 0, 0)";
      ctx.fillRect(0, cellY, CELL_SIZE / 2, CELL_SIZE);

      ctx.fillStyle = "white";
      ctx.font = `${CELL_SIZE * 0.5}px 'M PLUS Rounded 1c'`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      const textX = CELL_SIZE / 4;
      const textY = cellY + (CELL_SIZE / 2);

      ctx.fillText(displayValues[i], textX, textY);
    }
  }

  // プレイヤーの状態を送信
  if (isPlayer && socket) {
    socket.emit('statusFieldUpdate', {
      receiveValues: playerReceiveValueToDisplay
    });
  }
}

// ゲーム終了時にクリーンアップを行う関数
function cleanupWarningAnimations() {
  // プレイヤー側のアニメーションをクリア
  if (warningState.player.interval) {
    clearInterval(warningState.player.interval);
    warningState.player.interval = null;
    warningState.player.isVisible = false;
  }

  // 対戦相手側のアニメーションをクリア
  if (warningState.opponent.interval) {
    clearInterval(warningState.opponent.interval);
    warningState.opponent.interval = null;
    warningState.opponent.isVisible = false;
  }

  // オーバーレイをクリア
  overlayContexts.playerCtx.clearRect(0, 0, CELL_SIZE * FIELD_WIDTH, CELL_SIZE * FIELD_HEIGHT);
  overlayContexts.opponentCtx.clearRect(0, 0, CELL_SIZE * FIELD_WIDTH, CELL_SIZE * FIELD_HEIGHT);
}

// inputFieldの高さを取得
const inputHeight = playerInputField.getBoundingClientRect().height;

// infoFieldWrapperの全ての要素を取得
const infoFieldWrappers = document.getElementsByClassName("infoFieldWrapper");

// 新しいマージンサイズを計算
const newMarginSize = `${inputHeight}px`;
console.log(newMarginSize);

const unitChair = "/M"

// 各infoFieldWrapperに対してCSS変数を設定
Array.from(infoFieldWrappers).forEach((wrapper) => {
  wrapper.style.setProperty('--base-size', newMarginSize);
});

// 値を描写する関数
function drawInfo() {
  setInterval(() => {
    // if (gameState !== 'playing') {
    //   return;
    // }

    // 0.1秒ごとに値を更新
    totalTime++; // 0.1秒追加

    // 秒と分を計算
    const minutes = Math.floor(totalTime / 600); // 600 = 60秒 * 10
    const seconds = Math.floor((totalTime % 600) / 10); // 秒部分
    const tenths = totalTime % 10; // 小数点第1位部分

    // 時間をフォーマット
    timeText = `${minutes}:${seconds.toString().padStart(2, "0")}.${tenths}`;

    // 値を動的に計算・更新（例: 適当に増加させる）
    playerKPMValue = playerKeyValueToKPM / totalTime * 600;
    playerAPMValue = playerAtteckValueToAPM / totalTime * 600;
    playerWPMValue = playerWordValueToWPM / totalTime * 600;

    // 各div要素に値を描画
    kpmText = `${playerKPMValue.toFixed(2)}/M`;
    apmText = `${playerAPMValue.toFixed(2)}/M`;
    wpmText = `${playerWPMValue.toFixed(2)}/M`;

    mainKPMText = kpmText.slice(0, -4);
    mainAPMText = apmText.slice(0, -4);
    mainWPMText = wpmText.slice(0, -4);
    mainTimeText = timeText.slice(0, -2);

    toSmallKPMChars = kpmText.slice(-4);
    toSmallAPMChars = apmText.slice(-4);
    toSmallWPMChars = wpmText.slice(-4);
    toSmallTimeText = timeText.slice(-2);

    kpmDiv.innerHTML = `${mainKPMText}<span class="smallText">${toSmallKPMChars}</span>`;
    apmDiv.innerHTML = `${mainAPMText}<span class="smallText">${toSmallAPMChars}</span>`;
    wpmDiv.innerHTML = `${mainWPMText}<span class="smallText">${toSmallWPMChars}</span>`;
    for (let timeDiv of timeDivs) {
      timeDiv.innerHTML = `${mainTimeText}<span class="smallText">${toSmallTimeText}</span>`;
    }

    // 相手に情報を送信
    socket.emit('playerInfoUpdate', {
      kpm: { main: mainKPMText, small: toSmallKPMChars },
      apm: { main: mainAPMText, small: toSmallAPMChars },
      wpm: { main: mainWPMText, small: toSmallWPMChars },
    });

  }, 100);
}



// main.jsに追加
function initializeSocket() {

  // ここからRender用追記
  const socketUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.origin

  console.log('接続先は' + window.location.origin);  // このログで URL を確認

  // ここまで
  socket = io(socketUrl);

  socket.on('waitingForPlayer', () => {
    console.log('対戦相手を待っています...');
  });

  // socket.on('gameStart', (data) => {
  //   playerId = socket.id;
  //   isPlayer1 = playerId === data.player1Id;
  //   opponentId = isPlayer1 ? data.player2Id : data.player1Id;
  //   gameStarted = true;

  //   startGame();
  //   console.log(`ゲーム開始: ${isPlayer1 ? 'プレイヤー1' : 'プレイヤー2'}`);
  // });

  // main.jsのsocket.on('gameStart')を修正
  socket.on('gameStart', (data) => {
    playerId = socket.id;
    isPlayer1 = playerId === data.player1Id;
    opponentId = isPlayer1 ? data.player2Id : data.player1Id;
    gameStarted = true;
    showMatchingSuccess();
    console.log(`ゲーム開始: ${isPlayer1 ? 'プレイヤー1' : 'プレイヤー2'}`);
  });

  // socket.on イベントハンドラを追加・修正
  socket.on('gameOver', (data) => {
    handleGameOver(data.loserId === socket.id);
  });

  socket.on('retryResponse', (data) => {
    if (data.bothPlayersAgreed) {
      if (retryDialog) {
        document.body.removeChild(retryDialog);
        retryDialog = null;
      }
      resetGame();
      showMatchingSuccess(); // カウントダウンから再開
    } else if (!data.canRetry) {
      if (retryDialog) {
        document.body.removeChild(retryDialog);
        retryDialog = null;
      }
      // ゲーム終了、必要に応じて追加の終了処理
    }
  });

  socket.on('highlightSync', (data) => {
    console.log('HighlightSync received:', data);

    resetHighlight(opponentField);
    const row = opponentField.length - 1 - data.highlightIndex;
    for (let x = 0; x < data.length; x++) {
      if (opponentField[row] && opponentField[row][x]) {
        opponentField[row][x].isHighlighted = true;
      }
    }
    drawField(ctxOpponent, opponentField);
  });

  socket.on('inputSync', (data) => {
    opponentInput = data.input;
    checkAndRemoveWord(opponentField, opponentFieldWords, opponentInput);
    drawField(ctxOpponent, opponentField);
    drawInputField(ctxOpponentInput, opponentInput, opponentInputField);
  });

  socket.on('fieldSync', (data) => {
    opponentFieldWords = data.fieldWords;
    opponentField = data.field;

    clearField(opponentField);

    // 単語をフィールドに左詰めで配置
    let row = FIELD_HEIGHT - 1; // 下から配置
    for (const word of opponentFieldWords) {
      let col = 0; // 左端から配置
      for (const char of word) {
        if (col >= FIELD_WIDTH) {
          row--; // 次の行に移動
          col = 0;
        }
        if (row === 0) {
          opponentField[row][col] = { word: char, isHighlighted: false };
          col++;
          console.log("相手のフィールド描画おわり");
        } else if (row < 0) {
          drawField(ctxOpponent, opponentField);

          console.log("drawFieldして処理終了");
          return;

        } else {
          // console.log(word + "描画");
          opponentField[row][col] = { word: char, isHighlighted: false };
          col++;
        }
      }
      row--; // 次の単語を下の行に配置
    }
    checkAndRemoveWord(opponentField, opponentFieldWords, opponentInput);
    drawField(ctxOpponent, opponentField);
    drawStatusField(ctxOpponentStatus, false);
  });

  socket.on('opponentDisconnected', () => {
    console.log('対戦相手が切断しました');
    gameStarted = false;
  });

  // socket.on('receiveAttack')を修正
  socket.on('receiveAttack', (data) => {
    playerReceiveValueToOffset.push(data.attackValue);
    console.log("playerAttackValueToOffset:" + playerAttackValueToOffset);
    console.log("playerReceiveValueToOffset:" + playerReceiveValueToOffset);

    calcReceiveOffsetToDisplay();
    drawStatusField(ctxPlayerStatus, true);

    console.log("攻撃を受けました:" + playerReceiveValueToOffset);
  });

  // クライアント側のコード（main.jsなど）
  socket.on('updateAttackInfo', (data) => {
    updateOpponentAttackInfoDisplay(data.attackType);
  });

  socket.on('updeteNerfInfo', (data) => {
    updateOpponentNerfInfoDisplay(data.nerfValue);
  });

  socket.on('updateChainInfo', (data) => {
    updateOpponentChainInfoDisplay(data.chainBonus);
  });

  // Socket.IOイベントハンドラ: 相手から受信したNextを表示
  socket.on('nextWordsSync', (data) => {
    const prefix = 'opponent'; // 相手のNextを更新
    for (let i = 1; i <= 5; i++) {
      const nextElement = document.getElementById(`${prefix}Next${i}`);
      nextElement.innerHTML = data.styledWords[i - 1] || ""; // スタイル付きで表示
    }
  });

  // クライアント側のSocket.IOイベントリスナー
  socket.on('syncOpponentGradients', (data) => {
    data.gradientStyles.forEach((style, index) => {
      const nextElement = document.getElementById(`opponentNext${index + 1}`);
      if (nextElement && style) {
        nextElement.style = style;
      }
    });
  });

  socket.on('fieldHighlightSync', (data) => {
    highlightMatchingCells(opponentField, data.combinedWords);
  });

  // Socket.IOのイベントハンドラを追加
  socket.on('statusFieldSync', (data) => {
    opponentReceiveValueToDisplay = data.receiveValues;
    // 対戦相手のステータスフィールドを更新
    drawStatusField(ctxOpponentStatus, false);
  });

  // クライアント側で相手の情報を受信して表示する処理を追加
  socket.on('opponentInfoSync', (data) => {
    // 相手の情報を更新
    opponentKpmDiv.innerHTML = `${data.kpm.main}<span class="smallText">${data.kpm.small}</span>`;
    opponentApmDiv.innerHTML = `${data.apm.main}<span class="smallText">${data.apm.small}</span>`;
    opponentWpmDiv.innerHTML = `${data.wpm.main}<span class="smallText">${data.wpm.small}</span>`;
  });

}