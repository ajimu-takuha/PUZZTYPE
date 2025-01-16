
const font = new FontFace('PixelMplus', 'url(/fonts/Senobi-Gothic-Regular.ttf)');

(function ($) {
  // animated hex background
  $(document).ready(function () {
    $('.animated-background').each(function (index) {
      var cnv = $("<canvas></canvas>").attr("id", "can" + index);

      colorRange = ['rgba(255, 255, 255, 1)', 'rgba(0, 0, 0, 1)'],
        strokeColor = 'rgb(0, 0, 0)';
      // strokeColor = 'rgba(255, 255, 255, 1)';


      $(this).prepend(cnv);

      var can = document.getElementById("can" + index);
      var w = can.width = $(this).width(),
        h = can.height = $(this).height(),
        sum = w + h,
        ctx = can.getContext('2d'),

        opts = {

          side: 80,
          picksParTick: 0.2, //originally 5
          baseTime: 5500,
          addedTime: 5500,
          colors: colorRange,
          addedAlpha: 0.1,
          strokeColor: strokeColor,
          hueSpeed: 10,
          repaintAlpha: 1
        },

        difX = Math.sqrt(3) * opts.side / 2,
        difY = opts.side * 3 / 2,
        rad = Math.PI / 6,
        cos = Math.cos(rad) * opts.side,
        sin = Math.sin(rad) * opts.side,

        hexs = [],
        tick = 0;

      function loop() {

        window.requestAnimationFrame(loop);

        tick += opts.hueSpeed;

        ctx.shadowBlur = 0;

        var backColor;


        // backColor = 'rgba(19, 23, 44, 0.1)';
        // backColor = 'rgba(29, 154, 242, 1)';
        // backColor = 'rgba(0, 0, 0, 1)';
        backColor = 'rgba(255, 255, 255, 1)';


        ctx.fillStyle = backColor.replace('alp', opts.repaintAlpha);
        ctx.fillRect(0, 0, w, h);

        for (var i = 0; i < opts.picksParTick; ++i)
          if (Math.random() < opts.picksParTick) {
            // picksParTickが確率として機能するように変更
            hexs[(Math.random() * hexs.length) | 0].pick();
          }

        hexs.map(function (hex) {
          hex.step();
        });
      }

      function Hex(x, y) {

        this.x = x;
        this.y = y;
        this.sum = this.x + this.y;
        // change between false and true to animate from left to right, or all at once
        this.picked = false;
        this.time = 0;
        this.targetTime = 0;

        this.xs = [this.x + cos, this.x, this.x - cos, this.x - cos, this.x, this.x + cos];
        this.ys = [this.y - sin, this.y - opts.side, this.y - sin, this.y + sin, this.y + opts.side, this.y + sin];
      }
      Hex.prototype.pick = function () {

        this.color = opts.colors[(Math.random() * opts.colors.length) | 0];
        this.picked = true;
        this.time = this.time || 0;
        this.targetTime = this.targetTime || (opts.baseTime + opts.addedTime * Math.random()) | 0;
      }
      Hex.prototype.step = function () {

        var prop = this.time / this.targetTime;

        ctx.beginPath();
        ctx.lineWidth = 2; // この行を追加（数値を変更して太さを調整）
        ctx.moveTo(this.xs[0], this.ys[0]);
        for (var i = 1; i < this.xs.length; ++i)
          ctx.lineTo(this.xs[i], this.ys[i]);
        ctx.lineTo(this.xs[0], this.ys[0]);

        if (this.picked) {
          ++this.time;
          if (this.time >= this.targetTime) {
            this.time = 0;
            this.targetTime = 0;
            this.picked = false;
          }

          ctx.fillStyle = ctx.shadowColor = this.color.replace('alp', Math.sin(prop * Math.PI));
          ctx.fill();
        }
        ctx.strokeStyle = ctx.shadowColor = opts.strokeColor;
        ctx.stroke();
      }

      for (var x = 0; x < w; x += difX * 2) {
        var i = 0;

        for (var y = 0; y < h; y += difY) {
          ++i;
          hexs.push(new Hex(x + difX * (i % 2), y));

        }
      }
      loop();

      window.addEventListener('resize', function () {

        w = can.width = window.innerWidth;
        h = can.height = window.innerHeight;
        sum = w + h;

        if (can.width < window.innerWidth) {
          can.alpha = 0.5;
          can.opacity = 0.5;
        }

        hexs.length = 0;
        for (var x = 0; x < w; x += difX * 2) {
          var i = 0;

          for (var y = 0; y < h; y += difY) {
            ++i;
            hexs.push(new Hex(x + difX * (i % 2), y));

          }
        }
      });
    });
  });
})(jQuery);


window.document.onkeydown = function (evt) {
  if ((evt.which == 32)
  ) {
    evt.which = null;
    return false;
  }
}

let CELL_SIZE = 30;
// CELL_SIZE = calculateCellSize();

// セルサイズを計算する関数
function calculateCellSize() {
  const maxFieldWidth = window.innerWidth * 0.5; // 画面幅の40%をフィールドの最大幅に設定
  const maxFieldHeight = window.innerHeight * 0.65; // 画面高さの80%をフィールドの最大高さに設定

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

// フィールドに単語を追加する関数
// 攻撃を受けていた場合はその値を、そうでなければプールから追加するため
// updateFieldAfterReceiveOffset内で使用
function moveWordToField(fieldWords) {
  let toPutFieldWord = wordPool.shift();
  fieldWords.push(toPutFieldWord);
  wordPool.push(getRandomWordForField(playerUsedLengths));

  // FieldWords を文字数昇順で並び替え
  fieldWords.sort((a, b) => b.length - a.length);
}

const colors = [
  "rgba(255, 0, 0, 0.3)",    // Bright Red
  "rgba(0, 255, 0, 0.3)",    // Bright Green
  "rgba(80, 80, 255, 0.3)",    // Bright Blue
  "rgba(255, 255, 0, 0.3)",  // Bright Yellow
  "rgba(255, 0, 255, 0.3)",  // Bright Magenta
  "rgba(0, 255, 255, 0.3)",  // Bright Cyan
  "rgba(255, 165, 0, 0.3)",  // Bright Orange
  "rgba(128, 0, 128, 0.3)",  // Purple
  "rgba(128, 128, 0, 0.3)",  // Olive
  "rgba(128, 0, 0, 0.3)",    // Maroon
  "rgba(0, 128, 0, 0.3)",    // Dark Green
  "rgba(0, 128, 128, 0.3)",  // Teal
  "rgba(0, 0, 128, 0.3)",    // Navy Blue
  "rgba(220, 20, 60, 0.3)",  // Crimson
  "rgba(255, 69, 0, 0.3)",   // Red-Orange
  "rgba(60, 179, 113, 0.3)", // Medium Sea Green
  "rgba(106, 90, 205, 0.3)", // Slate Blue
  "rgba(75, 0, 130, 0.3)",   // Indigo
  "rgba(218, 112, 214, 0.3)",// Orchid
  "rgba(139, 69, 19, 0.3)"   // Saddle Brown
];


// 色キャッシュ用のMap
const charColorMap = new Map();

// 使用されている色を把握
const usedColors = new Set([...charColorMap.values()].map((color) => color.baseColor));

// 色付き文字を生成する関数
function generateStyledCharacters(word, matchingChars, lastChar) {
  return word.split("").map((char, index) => {
    // 正規化した文字を使用
    const normalizedChar = normalizeHiragana(char);

    let baseColor = "";
    let borderColor = "";

    // charColorMap に既存の色があればそれを使用
    if (charColorMap.has(normalizedChar)) {
      ({ baseColor, borderColor } = charColorMap.get(normalizedChar));
    } else {
      // 新しい色を計算し保存
      const colorIndex = matchingChars.indexOf(normalizedChar);
      if (colorIndex !== -1) {
        baseColor = colors[colorIndex % colors.length];
        const rgbaMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        const [r, g, b] = rgbaMatch.slice(1).map(Number);
        borderColor = `rgba(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)}, 0.6)`;

        // charColorMap に保存
        charColorMap.set(normalizedChar, { baseColor, borderColor });
      }
    }

    // 先頭文字が一致かつ lastChar と同じ場合
    if (index === 0 && normalizedChar === lastChar) {
      return `
      <div class="aura-container" style="--aura-color: rgba(255, 255, 255, 0.3); --aura-border-color: rgba(255, 255, 255, 1);">
        <span class="character">${char}</span>
      </div>
    `;
    }
    // 最初の文字が一致（lastChar のチェックはなし）
    if (index === 0 && baseColor) {
      return `
      <div class="aura-container" style="--aura-color: ${baseColor}; --aura-border-color: ${borderColor}">
        <span class="character">${char}</span>
      </div>
    `;
    }

    // 最後の文字が一致
    if (index === word.length - 1 && baseColor) {
      return `
      <div class="aura-container" style="--aura-color: ${baseColor}; --aura-border-color: ${borderColor}">
        <span class="character">${char}</span>
      </div>
    `;
    }

    // マッチしない文字は通常表示
    return `<span class="character">${char}</span>`;
  }).join("");
}

// 色インデックスを計算する関数（文字コードを基に計算）
function calculateColorIndex(char) {
  // 文字コードの合計を用いてインデックスを生成
  const charCodeSum = [...char].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return charCodeSum;
}

// Next表示用の関数
function updateNextDisplay(words, isPlayer = true) {
  const prefix = isPlayer ? 'player' : 'opponent';

  // 一致する文字を取得
  const combinedWords = [...playerFieldWords, ...wordPool];
  const matchingChars = getMatchingStartAndEndLetters(combinedWords).map(normalizeHiragana);

  // キャッシュを更新：前回のmatchingCharsを保持する
  matchingChars.forEach((char) => {
    if (!charColorMap.has(char)) {
      // 未使用の色を選択
      const availableColors = colors.filter((color) => !usedColors.has(color));
      const baseColor = availableColors[0] || colors[0]; // 未使用がなければ最初の色を再利用
      const rgbaMatch = baseColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
      const [r, g, b] = rgbaMatch.slice(1).map(Number);
      const borderColor = `rgba(${Math.max(r - 20, 0)}, ${Math.max(g - 20, 0)}, ${Math.max(b - 20, 0)}, 1)`;

      charColorMap.set(char, { baseColor, borderColor });
      usedColors.add(baseColor); // 新しく使用した色を追跡
    }
  });

  // charColorMap を更新：matchingChars に含まれない文字を削除
  for (const [key] of charColorMap) {
    if (!matchingChars.includes(key)) {
      charColorMap.delete(key);
    }
  }

  // 5つのNextを表示
  for (let i = 1; i <= 5; i++) {
    const nextElement = document.getElementById(`${prefix}Next${i}`);
    const word = words[i - 1];
    if (!word) continue;

    const styledWord = generateStyledCharacters(word, matchingChars, lastChar);
    nextElement.innerHTML = styledWord;
  }

  // プレイヤーの場合、相手に情報を送信
  if (isPlayer && socket) {
    const styledWords = words.map((word) => generateStyledCharacters(word, matchingChars, lastChar));
    updateAllNextGradients(wordPool, true);

    socket.emit('nextWordsUpdate', {
      words: words,
      styledWords: styledWords
    });
  }
}

// // グラデーションの色を定義
// const GRADIENT_COLORS = {
//   LONGER_WORD: {
//     r: 0,
//     g: 125,
//     b: 230  // 青色 (lightblue)
//   },
//   SHORTER_WORD: {
//     r: 144,
//     g: 238,
//     b: 144  // 緑色 (lightgreen)
//   }
// };

// // グラデーションの透明度を定義
// const GRADIENT_OPACITY = {
//   CENTER: 0.05,
//   MIDDLE: 0.1,
//   EDGE: 0.3
// };

// グローバル変数でグラデーションスタイルを管理
let playerGradientStyles = Array(5).fill('');
let opponentGradientStyles = Array(5).fill('');

// グラデーションスタイルを生成する関数（横長用）
// function createGradientStyle(colorType) {
//   const color = GRADIENT_COLORS[colorType];
//   const rgbaEdge = `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.EDGE})`;
//   const rgbaMiddle = `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.MIDDLE})`;
//   const rgbaCenter = `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.CENTER})`;

//   // 横長のグラデーションを作成
//   return `
//     background: linear-gradient(to right, 
//       ${rgbaEdge} 0%, 
//       ${rgbaMiddle} 10%, 
//       ${rgbaCenter} 50%, 
//       ${rgbaMiddle} 90%, 
//       ${rgbaEdge} 100%);
//   `;
// }


// Next要素のグラデーション背景を更新する関数
function updateNextElementGradient(prefix, index, wordLength) {
  const nextElement = document.getElementById(`${prefix}Next${index}`);
  if (!nextElement || !wordLength) return;

  const lengthDiff = wordLength - memorizeLastAttackValue;
  let gradientStyle = '';
  if (lengthDiff === 0) {
    // DownAttack攻撃
    gradientStyle = 'background-color: rgb(120, 120, 120);';
  } else if (lengthDiff === 1) {
    // gradientStyle = createGradientStyle('LONGER_WORD');
    // DownChain攻撃
    gradientStyle = 'background: rgba(120, 0, 120, 1)';
  } else if (lengthDiff === -1) {
    // gradientStyle = createGradientStyle('SHORTER_WORD');
    // UpChain攻撃
    gradientStyle = 'background: rgba(0, 120, 120, 1)';
  } else {
    gradientStyle = 'background-color: rgba(5, 7, 19, 0.7);';
  }

  nextElement.style = gradientStyle;
  // nextElement.style.border = 'solid 2px rgba(${color.r}, ${color.g}, ${color.b})'
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

  if (isPlayer) {
    playerGradientStyles = [...gradientStyles];
  } else {
    opponentGradientStyles = [...gradientStyles];
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

  if (playerReceiveValueToOffset.length === 0) {
    moveWordToField(fieldWords)
  }

  const soundCount = playerReceiveValueToOffset.length; // 再生する回数
  const delayBetweenSounds = 70; // 2回目以降の間隔 (ミリ秒)

  for (let i = 0; i < soundCount; i++) {
    setTimeout(() => {
      soundManager.playSound('receiveAttack', { volume: 0.5 });
    }, i * delayBetweenSounds);
  }

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
        drawField(ctxPlayer, playerField, memorizeLastAttackValue);

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

  // Next表示を更新
  updateNextDisplay(wordPool);
  highlightMatchingCells(playerField);

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
  drawGameOverUI(isLoser ? 'Lose' : 'Win');
  // drawGameOverUI(ctxOpponent, isLoser ? 'Win' : 'Lose'); 

  // 少し待ってからリトライダイアログを表示
  setTimeout(() => {
    showRetryDialog();
    resetGameAnimation();
  }, 2000);
}

// リトライレスポンス処理
function handleRetryResponse(response) {
  const buttons = retryDialog.querySelectorAll('button');
  buttons.forEach(button => button.disabled = true); // ボタンを無効化
  socket.emit('retryResponse', { response });
}

function showGameOverEffect(elementId, isLoser) {
  const overlay = document.getElementById(elementId);
  const resultElement = document.createElement('div');

  resultElement.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 8vh;
    z-index: 1000;
  `;
  if (isLoser) {
    resultElement.textContent = "Lose";
  } else {
    resultElement.textContent = "Win";
  }
  overlay.appendChild(resultElement);
}

function animateGameOver(isLoser) {
  // テキスト表示
  showGameOverEffect('playerChildEffectOverlay', isLoser);
  showGameOverEffect('opponentChildEffectOverlay', !isLoser);

  // スタイルシートの追加
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
  @keyframes fallDown {
    0% {
      transform: translateY(0) rotate(0deg);
    }
    100% {
      transform: translateY(100vh) rotate(80deg);
      opacity: 0;
    }
  }
  
  @keyframes winnerScale {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }
  
  @keyframes fadeOut {
    to { opacity: 0; }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
  document.head.appendChild(styleSheet);

  // 負けた側の要素をアニメーション
  const loserElement = document.getElementById(isLoser ? 'playerGameArea' : 'opponentGameArea');
  loserElement.style.animation = 'fallDown 1.5s cubic-bezier(.55, 0, .1, 1) forwards';

  // 勝った側の要素をアニメーション
  const winnerElement = document.getElementById(isLoser ? 'opponentGameArea' : 'playerGameArea');
  winnerElement.style.animation = 'winnerScale 2s ease-out forwards';
}

// フェードアウト用オーバーレイ
const fadeOverlay = document.createElement('div');
fadeOverlay.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  opacity: 0;
  z-index: 2000;
  pointer-events: none;
`;

// 新しいリセット関数を追加
function resetGameAnimation() {
  return new Promise((resolve) => {
    document.body.appendChild(fadeOverlay);
    
    // フェードアウト
    fadeOverlay.style.animation = 'fadeOut 0.5s forwards';
    
    setTimeout(() => {
      // アニメーション効果のリセット
      const playerArea = document.getElementById('playerGameArea');
      const opponentArea = document.getElementById('opponentGameArea');
      const playerOverlay = document.getElementById('playerChildEffectOverlay');
      const opponentOverlay = document.getElementById('opponentChildEffectOverlay');
      
      // アニメーションと変形をリセット
      playerArea.style.animation = '';
      opponentArea.style.animation = '';
      playerArea.style.transform = '';
      opponentArea.style.transform = '';
      
      // オーバーレイのテキストをクリア
      playerOverlay.innerHTML = '';
      opponentOverlay.innerHTML = '';
      
      // フェードイン
      fadeOverlay.style.animation = 'fadeIn 0.5s reverse forwards';
      
      setTimeout(() => {
        document.body.removeChild(fadeOverlay);
        resolve();
      }, 500);
    }, 500);
  });
}

function drawGameOverUI(text) {
  const width = ctxPlayer.canvas.getBoundingClientRect().width;
  const height = ctxPlayer.canvas.getBoundingClientRect().height;
  ctxPlayer.save();
  ctxOpponent.save();

  // 半透明の背景
  ctxPlayer.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctxPlayer.fillRect(0, 0, width, height);

  ctxOpponent.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctxOpponent.fillRect(0, 0, width, height);

  ctxPlayer.restore();
  ctxOpponent.restore();

  // アニメーション開始
  const isLoser = text === 'Lose';
  animateGameOver(isLoser);
}

function syncFieldUpdate() {
  if (gameStarted) {
    socket.emit('fieldUpdate', {
      field: playerField,
      fieldWords: playerFieldWords,
      memorizeLastAttackValue: memorizeLastAttackValue
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
let playerOverlayElement = document.getElementById("playerChainStyleOverlay");
let opponentOverlayElement = document.getElementById("opponentChainStyleOverlay");;

// オーバーレイキャンバスの初期化関数
function initializeOverlayDivElement() {

  // playerOverlayElement = document.createElement('div');
  // playerOverlayElement.id = 'playerChainStyleOverlay';
  playerOverlayElement.style.position = 'absolute';
  playerOverlayElement.style.pointerEvents = 'none';
  const playerFieldWrapper = document.querySelector('#playerGameArea .field-wrapper');
  playerFieldWrapper.appendChild(playerOverlayElement);


  // opponentOverlayElement = document.createElement('div');
  // opponentOverlayElement.id = 'opponentChainStyleOverlay';
  opponentOverlayElement.style.position = 'absolute';
  opponentOverlayElement.style.pointerEvents = 'none';
  const opponentFieldWrapper = document.querySelector('#opponentGameArea .field-wrapper');
  opponentFieldWrapper.appendChild(opponentOverlayElement);

  // 両方のキャンバスをリサイズ
  resizeOverlayDivElement(playerOverlayElement);
  resizeOverlayDivElement(opponentOverlayElement);
}

function resizeOverlayDivElement(divElement) {
  const dpr = window.devicePixelRatio || 1;
  CELL_SIZE = calculateCellSize(); // セルサイズを再計算

  // フィールド全体のサイズを計算
  const width = CELL_SIZE * FIELD_WIDTH;
  const height = CELL_SIZE * FIELD_HEIGHT;

  // キャンバスの実際のサイズを設定（高解像度対応）
  divElement.width = width * dpr;
  divElement.height = height * dpr;

  // 表示サイズを設定
  divElement.style.width = `${width}px`;
  divElement.style.height = `${height}px`;

  // statusFieldの幅を考慮して位置を調整
  divElement.style.top = `1.5px`;
  divElement.style.left = `${CELL_SIZE / 2 + 3.5}px`;

}


// ハイライト処理関数を修正
function highlightMatchingCells(field) {

  let isPlayer = true;
  if (field === opponentField) {
    isPlayer = false;
  }
  // 使用するオーバーレイキャンバスを選択
  const overlayDiv = isPlayer ? playerOverlayElement : opponentOverlayElement;

  removeAuraEffectFromOverlay(overlayDiv);

  // ハイライト情報を保持する配列
  const highlightData = [];


  // 各行を上から順にチェック
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    // まず先頭(x=0)をチェック
    if (!field[y][0] || !field[y][0].word) {
      continue;
    }

    // 先頭の文字のチェック
    const startChar = field[y][0].word[0];
    if (isPlayer && startChar === lastChar) {
      // 先頭文字が一致かつ lastChar と同じ場合
      // 先頭文字が一致かつ lastChar と同じ場合
      const colorObj = { baseColor: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(255, 255, 255)' }; // 白色を指定
      applyAuraEffectToCell(y, 0, colorObj, overlayDiv);
      highlightData.push({ x: 0, y, colorObj });
    }
    else if (charColorMap.has(startChar)) {
      // 最初の文字が一致（lastChar のチェックはなし）
      const colorObj = charColorMap.get(startChar);
      applyAuraEffectToCell(y, 0, colorObj, overlayDiv);
      highlightData.push({ x: 0, y, colorObj });
    }

    // その行の最後尾を探してチェック
    for (let x = FIELD_WIDTH - 1; x > 0; x--) {
      if (field[y][x] && field[y][x].word) {
        const endChar = normalizeHiragana(field[y][x].word[field[y][x].word.length - 1]);
        if (charColorMap.has(endChar)) {
          // 最後の文字が一致
          const colorObj = charColorMap.get(endChar);
          applyAuraEffectToCell(y, x, colorObj, overlayDiv);
          highlightData.push({ x, y, colorObj });
        }
        break;  // 最後尾が見つかったらその行の探索終了
      }
    }
  }

  // プレイヤーの場合、相手に情報を送信（同期用データ）
  if (isPlayer) {
    socket.emit('fieldHighlightUpdate', {
      highlightData: highlightData,
    });
  }
}

// auraElementをすべて削除するメソッド
function removeAuraEffectFromOverlay(overlayDiv) {
  // overlayDiv内のすべての子要素を削除
  while (overlayDiv.firstChild) {
    overlayDiv.removeChild(overlayDiv.firstChild);
  }
}

function applyAuraEffectToCell(y, x, colorObj, overlayDiv) {

  // セルの絶対位置を計算
  const cellX = x * CELL_SIZE;
  const cellY = y * CELL_SIZE;

  // アウラエフェクト用のコンテナを作成
  const auraElement = document.createElement('div');
  auraElement.className = 'field-aura-container';

  // 位置とサイズを設定
  auraElement.style.left = `${cellX}px`;
  auraElement.style.top = `${cellY}px`;
  auraElement.style.width = `${CELL_SIZE}px`;
  auraElement.style.height = `${CELL_SIZE}px`;

  // カラー変数を設定
  auraElement.style.setProperty('--aura-color', colorObj.baseColor);
  auraElement.style.setProperty('--aura-border-color', colorObj.borderColor);

  // オーバーレイに追加
  overlayDiv.appendChild(auraElement);
}

function drawField(ctx, field, receivedLastWordLength) {

  if (gameState === 'ended') return;
  ctx.clearRect(0, 0, ctx.canvas.getBoundingClientRect().width, ctx.canvas.getBoundingClientRect().height);

  ctx.fillStyle = "rgba(5, 7, 19, 0.7)";
  ctx.fillRect(0, 0, ctx.canvas.getBoundingClientRect().width, ctx.canvas.getBoundingClientRect().height);

  // console.log(receivedLastWordLength);

  if (receivedLastWordLength !== 0) {
    for (let y = 0; y < FIELD_HEIGHT; y++) {
      let hasContent = false;
      for (let x = 0; x < FIELD_WIDTH; x++) {
        if (field[y][x] && field[y][x].word) {
          hasContent = true;
          break;
        }
      }

      if (!hasContent) {
        continue;
      }

      // 行の文字を1つの単語として結合
      let rowWord = '';
      for (let x = 0; x < FIELD_WIDTH; x++) {
        if (field[y][x] && field[y][x].word) {
          rowWord += field[y][x].word;
        }
      }

      // console.log(rowWord);

      // 単語が存在する場合のみ処理
      if (rowWord.length > 0) {

        const position = y * CELL_SIZE;
        const width = FIELD_WIDTH * CELL_SIZE;
        const height = CELL_SIZE;

        const hasLongerWord = (receivedLastWordLength === 10 && rowWord.length === 9) ||
          (receivedLastWordLength === 2 && rowWord.length === 3) ||
          (rowWord.length === receivedLastWordLength + 1);

        const hasShorterWord = receivedLastWordLength !== 2 &&
          rowWord.length === receivedLastWordLength - 1;

        if (rowWord.length === receivedLastWordLength) {
          ctx.fillStyle = `rgba(255, 255, 255, 0.2)`;
          ctx.fillRect(0, position, width, height);
          ctx.strokeStyle = `rgba(255, 255, 255, 0.5)`;
          ctx.lineWidth = 2;
          ctx.strokeRect(0, position, width, height);

        } else if (hasLongerWord) {
          // drawHorizontalGradient(ctx, y, 'SHORTER_WORD');
          ctx.fillStyle = `rgba(255, 0, 255, 0.2)`;
          ctx.fillRect(0, position, width, height);
          ctx.strokeStyle = `rgba(255, 0, 255, 0.5)`;
          ctx.lineWidth = 2;
          ctx.strokeRect(0, position, width, height);

        } else if (hasShorterWord) {
          // drawHorizontalGradient(ctx, y, 'SHORTER_WORD');
          ctx.fillStyle = `rgba(0, 255, 255, 0.2)`;
          ctx.fillRect(0, position, width, height);
          ctx.strokeStyle = `rgba(0, 255, 255, 0.5)`;
          ctx.lineWidth = 2;
          ctx.strokeRect(0, position, width, height);
        }
      }
    }
  }

  // 以下のレンダリング処理は変更なし
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
          gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        // ctx.font = `${CELL_SIZE * 0.7}px 'M PLUS Rounded 1c'`;
        // ctx.font = `${CELL_SIZE * 0.6}px "DotGothic16", "M PLUS Rounded 1c", serif`;
        ctx.font = `${CELL_SIZE * 0.7}px "Ronde-B", "Senobi-Gothic-Regular", "M PLUS Rounded 1c", serif`;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.lineWidth = 0.5;

        const centerX = x * CELL_SIZE + CELL_SIZE / 2;
        const centerY = y * CELL_SIZE + CELL_SIZE / 2;

        if (cell.isHighlighted) {
          // ctx.strokeStyle = 'black';
          ctx.lineWidth = 2;
          // ctx.strokeText(cell.word, centerX, centerY);
          // ctx.fillStyle = 'white';
          ctx.fillStyle = 'rgb(0, 0, 0)';
          ctx.fillText(cell.word, centerX, centerY);
        } else {
          // すべての文字に黒い縁取りを追加
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.lineWidth = 2; // 縁取りの太さ
          ctx.strokeText(cell.word, centerX, centerY);
          ctx.fillStyle = 'white';
          ctx.fillText(cell.word, centerX, centerY);
        }
      }
    }
  }

  drawGrid(ctx);
}

// 横方向全体にグラデーションを描画する関数を修正
// function drawHorizontalGradient(ctx, row, colorType) {
//   const y = row * CELL_SIZE;
//   const width = FIELD_WIDTH * CELL_SIZE;
//   const height = CELL_SIZE;

//   const color = GRADIENT_COLORS[colorType];

//   // 左側のグラデーション
//   const gradientLeft = ctx.createLinearGradient(0, y + height / 2, width / 2, y + height / 2);
//   gradientLeft.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.EDGE})`);
//   gradientLeft.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.MIDDLE})`);
//   gradientLeft.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.CENTER})`);

//   // 右側のグラデーション
//   const gradientRight = ctx.createLinearGradient(width / 2, y + height / 2, width, y + height / 2);
//   gradientRight.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.CENTER})`);
//   gradientRight.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.MIDDLE})`);
//   gradientRight.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${GRADIENT_OPACITY.EDGE})`);

//   // 左半分を描画
//   ctx.fillStyle = gradientLeft;
//   ctx.fillRect(0, y, width / 2, height);

//   // 右半分を描画
//   ctx.fillStyle = gradientRight;
//   ctx.fillRect(width / 2, y, width / 2, height);

//   // 枠線の描画（新しく追加）
//   ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b})`;
//   ctx.lineWidth = 3;
//   ctx.strokeRect(0, y, width, height);
// }

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


// 親要素とspanを取得
// 全ての対象要素を取得
const inputFieldWrappers = document.querySelectorAll(".inputFieldWrapper");
const spans2 = document.querySelectorAll(".inputFieldWrapper span:nth-child(2)");
const spans4 = document.querySelectorAll(".inputFieldWrapper span:nth-child(4)");

// 親要素の高さを取得してspanのwidthに設定
function updateSpanSize() {
  inputFieldWrappers.forEach(wrapper => {
    wrapper.style.height = playerInputField.style.height;
    wrapper.style.width = playerInputField.style.width;
  });
  const updateHeight = window.getComputedStyle(playerInputField).height
  // 全てのspan2に対して処理
  spans2.forEach(span => {
    span.style.width = updateHeight;
  });

  // 全てのspan4に対して処理
  spans4.forEach(span => {
    span.style.width = updateHeight;
  });
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
  drawField(ctxPlayer, playerField, 0);
  drawField(ctxOpponent, opponentField, 0);

  drawInputField(ctxPlayerInput, playerInput, playerInputField);
  drawInputField(ctxOpponentInput, opponentInput, opponentInputField);
  drawStatusField(ctxPlayerStatus, true);
  drawStatusField(ctxOpponentStatus, false);

  // オーバーレイのリサイズ
  resizeWarningOverlay(overlayContexts.playerOverlay);
  resizeWarningOverlay(overlayContexts.opponentOverlay);

  resizeOverlayDivElement(playerOverlayElement);
  resizeOverlayDivElement(opponentOverlayElement);

  // 警告オーバーレイの再描画
  if (warningState.player.isVisible) {
    drawWarningOverlay(true);
  }
  if (warningState.opponent.isVisible) {
    drawWarningOverlay(false);
  }

  // 初期化
  updateSpanSize();

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

// 初期化
updateSpanSize();

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

  initializeOverlayDivElement();

  ctxPlayer.fillStyle = "rgba(5, 7, 19, 0.7)";
  ctxPlayer.fillRect(0, 0, ctxPlayer.canvas.getBoundingClientRect().width, ctxPlayer.canvas.getBoundingClientRect().height);

  ctxOpponent.fillStyle = "rgba(5, 7, 19, 0.7)";
  ctxOpponent.fillRect(0, 0, ctxOpponent.canvas.getBoundingClientRect().width, ctxOpponent.canvas.getBoundingClientRect().height);

});

let gameStepInterval = 10000; // 初期の間隔（ミリ秒）
const minInterval = 1000; // 最小の間隔（ミリ秒）

// startGame関数を修正
function startGame() {
  // if (gameState !== 'playing') return;
  setWordPool();
  drawInfo();

  function gameStep() {
    if (gameState !== 'playing') return;
    updateFieldAfterReceiveOffset(playerField, playerFieldWords);
    checkAndRemoveWord(playerField, playerFieldWords, playerInput);
    drawField(ctxPlayer, playerField, memorizeLastAttackValue);

    // インターバルを更新し、プログレスバーを開始
    gameStepInterval = Math.max(minInterval, gameStepInterval - 50);
    updateProgressBar(gameStepInterval);
    setTimeout(gameStep, gameStepInterval);
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
  // const words = wordList[selectedCategory]["test"];
  // return words[Math.floor(Math.random() * words.length)];
  if (!wordList || !wordList[selectedCategory]) return '';

  const allLengths = Object.keys(wordList[selectedCategory]);

  // すべての length が2回使用されていたらリセット
  if (Object.values(usedLengths).every(count => count >= 2)) {
    for (let length in usedLengths) {
      usedLengths[length] = 0;
    }
  }

  // 使用回数が2回未満のものを取得
  const availableLengths = allLengths.filter(length => (usedLengths[length] || 0) < 2);
  const randomLength = availableLengths[Math.floor(Math.random() * availableLengths.length)];

  // 使用回数を更新
  usedLengths[randomLength] = (usedLengths[randomLength] || 0) + 1;

  const words = wordList[selectedCategory][randomLength];
  return words[Math.floor(Math.random() * words.length)];
}

// 攻撃用の単語を取得
function getRandomWordForAttack(characterCount) {
  // const words = wordList[selectedCategory]["test"];
  // return words[Math.floor(Math.random() * words.length)];
  let character = ["two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
  if (!wordList || !wordList[selectedCategory]) return '';
  const words = wordList[selectedCategory][character[characterCount - 2]];
  return words[Math.floor(Math.random() * words.length)];
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

      if (key !== ' ') {
        animateInputField();
        soundManager.playSound('type4', { volume: 1 });
      }

      if (key === ' ') {
        // moveWordToField(playerFieldWords);
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

      // animateAttackInfo(playerAttackKind, 'Attack', 'attack-normal');
      soundManager.playSound('BGM1', { volume: 0.7, loop: true });
    } else if (key === 'ArrowUp') {
      soundManager.playSound('attackOP', { fade: 0.2, volume: 0.8 });

      // animateAttackInfo(playerAttackKind, 'UpChain', 'attack-upchain');
    } else if (key === "ArrowDown") {
      soundManager.playSound('attackWeak', { volume: 0.5 });
      // animateAttackInfo(playerAttackKind, 'DownChain', 'attack-downchain');
    } else if (key === "ArrowLeft") {
      soundManager.playSound('attackNormal', { volume: 0.9 });
      // animateAttackInfo(playerAttackKind, 'Connect', 'attack-connect');
    } else if (key === "ArrowRight") {
      soundManager.playSound('attackStrong', { volume: 0.8 });
      // animateAttackInfo(playerAttackKind, 'DoubleAttack', 'attack-double');
    }
    else if (key === "Enter") {
      // startGame();
      // startCountdown();
      handleGameOver(true);
    }

    playerInput = convertedInput;
  }

  // 単語のチェックと削除
  checkAndRemoveWord(playerField, playerFieldWords, playerInput);
  // checkAndRemoveWord(opponentField, opponentFieldWords, opponentInput);

  // 入力状態を同期
  syncInputUpdate();

  // フィールドと入力内容を再描画
  drawField(ctxPlayer, playerField, memorizeLastAttackValue);
  // drawField(ctxOpponent, opponentField, memorizeLastAttackValue);

  drawInputField(ctxPlayerInput, playerInput, playerInputField);
  // drawInputField(ctxOpponentInput, opponentInput, opponentInputField);


});

// アニメーションを開始する関数
function animateInputField() {
  const inputWrapper = document.querySelector('.inputFieldWrapper');

  // すでにアニメーション中の場合は一度クラスを除去
  inputWrapper.classList.remove('animate-input');

  // 次のフレームでアニメーションクラスを追加
  requestAnimationFrame(() => {
    inputWrapper.classList.add('animate-input');
  });
}

// アニメーションの終了時にクラスを削除
document.querySelector('.inputFieldWrapper').addEventListener('animationend', function () {
  this.classList.remove('animate-input');
});

function syncInputUpdate() {
  // 入力状態を同期
  if (gameStarted) {
    socket.emit('inputUpdate', {
      input: playerInput,
      memorizeLastAttackValue: memorizeLastAttackValue
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

      updateNextDisplay(wordPool);
      highlightMatchingCells(playerField);
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
      // cancelChain();
      if (chainBonus === 3) {
        chainBonus = 2
      } else if (chainBonus <= 2) {
        chainBonus = 0;
      } else {
        chainBonus = chainBonus - 2;
      }
      updateChainInfoDisplay();
      nerfAttackValue();
      soundManager.playSound('missType');
      triggerMissColorFlash(playerInputField);
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
  // ctx.font = `${CELL_SIZE * 1}px 'M PLUS Rounded 1c'`;
  ctx.font = `${CELL_SIZE * 1}px "Senobi-Gothic-Regular", "M PLUS Rounded 1c", serif`;
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

    let calculatedAttackVal = playerAttackValue;
    if (nerfValue !== 0) {
      calculatedAttackVal = playerAttackValue - nerfValue;
      if (calculatedAttackVal < 2) {
        calculatedAttackVal = 0
      }
    }
    onAttackShake(calculatedAttackVal);
    displayAttackValue(playerEffectOverlay, calculatedAttackVal);
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

// main.js
const MAX_SHAKE_DISTANCE = 30;
const MIN_SHAKE_DISTANCE = 5;

// 自分の画面を縦に揺らす
function triggerPlayerVerticalShake(attackValue) {

  const shakeDistance = Math.min(MAX_SHAKE_DISTANCE, Math.max(MIN_SHAKE_DISTANCE, attackValue));
  const shakeScale = shakeDistance / 200; // 例: shakeDistance=10ならscale=0.9

  playerGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
  playerGameArea.style.setProperty('--shake-scale', `${shakeScale}`); // scale値をCSSに渡す


  playerGameArea.classList.add('shake-vertical');
  setTimeout(() => playerGameArea.classList.remove('shake-vertical'), 300);
}

// 相手のフィールドを横に揺らす
function triggerOpponentHorizontalShake(attackValue) {
  const shakeDistance = Math.min(MAX_SHAKE_DISTANCE, Math.max(MIN_SHAKE_DISTANCE, attackValue));
  opponentGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
  opponentGameArea.classList.add('shake-horizontal');
  setTimeout(() => opponentGameArea.classList.remove('shake-horizontal'), 300);
}

// 攻撃を受けた時のシェイク（自分は横、相手は縦）
function triggerShakeOnReceive(data) {
  const { shakeDistance } = data;

  // 自分の画面を横に揺らす
  playerGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
  playerGameArea.classList.add('shake-horizontal');
  setTimeout(() => playerGameArea.classList.remove('shake-horizontal'), 300);

  // 相手の画面を縦に揺らす
  opponentGameArea.style.setProperty('--shake-distance', `${shakeDistance}px`);
  opponentGameArea.classList.add('shake-vertical');
  setTimeout(() => opponentGameArea.classList.remove('shake-vertical'), 300);
}

// 攻撃イベントの送信
function onAttackShake(attackValue) {
  socket.emit('attackShake', { attackValue }); // サーバーに攻撃値を送信
  triggerPlayerVerticalShake(attackValue);    // 自分の画面を縦に揺らす
  triggerOpponentHorizontalShake(attackValue); // 相手のフィールドを横に揺らす
}

function triggerColorFlash(element) {
  element.classList.add('flash-effect');
  setTimeout(() => element.classList.remove('flash-effect'), 300); // アニメーション後に削除
}

function triggerMissColorFlash(element, isPlayer = true) {
  element.classList.add('playerMissEffect');
  setTimeout(() => element.classList.remove('playerMissEffect'), 300); // アニメーション後に削除
  if (isPlayer) {
    socket.emit('sendPlayerMissEffect', {
    });
  }
}

const playerEffectOverlay = document.getElementById('playerEffectOverlay');
const opponentEffectOverlay = document.getElementById('opponentEffectOverlay');
resizeOverlayDivElement(playerEffectOverlay);
resizeOverlayDivElement(opponentEffectOverlay);

const playerchildEffectOverlay = document.getElementById('childEffectOverlay');
// playerchildEffectOverlay.classList.add('glowingEffect');

function displayAttackValue(element, number) {
  // 数値以外の入力をチェック
  if (typeof number !== 'number') {
    return;
  }
  if (number <= 10) {
    soundManager.playSound('attackWeak', { volume: 0.5 });
  } else if (number <= 15) {
    soundManager.playSound('attackNormal', { volume: 1 });
  } else if (number <= 20) {
    soundManager.playSound('attackStrong', { volume: 0.8 });
  } else {
    soundManager.playSound('attackOP', { fadeOut: 0.5, volume: 0.8 });
  }

  const containerRect = element.getBoundingClientRect();

  // フォントサイズの計算: CELL_SIZE * 2 + number
  const fontSize = (CELL_SIZE * 1.5) + number * 1.5;

  // 数値表示用の要素を作成
  const numberElement = document.createElement('span');
  numberElement.textContent = number;
  numberElement.className = 'displayAttackValue';
  numberElement.style.fontSize = `${fontSize}px`;

  // 色を設定 (numberの値によって変化)
  if (number < 10) {
    numberElement.style.color = 'rgba(0, 0, 0, 0.9)';
  } else if (number < 20) {
    numberElement.style.color = 'rgba(255, 125, 0, 0.9)';
  } else {
    numberElement.style.color = 'rgba(255, 0, 0, 0.9)';
  }

  // 固定位置の計算（上から25%、左から75%）
  const posX = containerRect.width * 0.75;
  const posY = containerRect.height * 0.25;

  // ランダムな角度を生成（135度から45度の間）
  const randomAngle = 45 + Math.random() * (-90);

  // ランダムな移動量を生成
  const randomTranslateX = Math.random() * 100 - 100; // -10px ～ 10px
  const randomTranslateY = Math.random() * 100 - 100; // -10px ～ 10px

  // 位置とアングルを設定
  numberElement.style.left = `${posX}px`;
  numberElement.style.top = `${posY}px`;
  numberElement.style.transform = `translate(-50%, -50%) rotate(${randomAngle}deg)`;

  // DOMに追加
  element.appendChild(numberElement);

  // アニメーションの適用
  requestAnimationFrame(() => {
    numberElement.style.transform += ` translate(${randomTranslateX}px, ${randomTranslateY}px) scale(1.2)`;
    numberElement.classList.add('fade-out');

    // アニメーション完了後に要素を削除
    setTimeout(() => {
      numberElement.remove();
    }, 1500);
  });

  // プレイヤーの攻撃値を相手に同期
  socket.emit('syncAttackValue', {
    number,
    color: numberElement.style.color,
    fontSize,
    transform: numberElement.style.transform,
  });
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
  let colorClass = 'attack-normal';
  if (isWordChain) {
    attackType = 'Connect!';
    colorClass = 'attack-connect';
  } else if (isUpChain) {
    attackType = 'UpChain';
    colorClass = 'attack-upchain';
  } else if (isDownChain) {
    attackType = 'DownChain';
    colorClass = 'attack-downchain';
  } else if (isSameChar) {
    attackType = 'DoubleAttack';
    colorClass = 'attack-double';
  }

  // 表示の更新
  // playerAttackKind.textContent = attackType;
  animateAttackInfo(playerAttackKind, attackType, colorClass);
  updateChainInfoDisplay();


  // playerChainBonus.textContent = chainBonus !== 0 ? `Chain: ${chainBonus}` : '';

}

function updateOpponentAttackInfoDisplay(attackType) {
  // 攻撃タイプに応じてcolorClassを設定
  let colorClass = 'attack-normal';
  switch (attackType) {
    case 'Connect!':
      colorClass = 'attack-connect';
      break;
    case 'UpChain':
      colorClass = 'attack-upchain';
      break;
    case 'DownChain':
      colorClass = 'attack-downchain';
      break;
    case 'DoubleAttack':
      colorClass = 'attack-double';
      break;
  }
  animateAttackInfo(opponentAttackKind, attackType, colorClass);
}

// アニメーションを適用する関数
function animateAttackInfo(element, value, colorClass) {

  // 既存のカラークラスをすべて削除
  element.classList.remove('attack-normal', 'attack-connect', 'attack-upchain', 'attack-downchain', 'attack-double');

  if (colorClass !== false) {
    // 新しいカラークラスを追加
    element.classList.add(colorClass);
  }
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
    animateAttackInfo(playerChainBonus, `Chain: ${chainBonus}`, false);
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
    animateAttackInfo(opponentChainBonus, `Chain: ${chainBonus}`, false);
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
  console.log("updateNerfInfoDisplay実行");
  // playerNerfValue.textContent = nerfValue !== 0 ? `Nerf: ${nerfValue}` : '';
  if (nerfValue !== 0) {
    animateAttackInfo(playerNerfValue, `Nerf: ${nerfValue}`, false);
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
    animateAttackInfo(opponentNerfValue, `Nerf: ${nerfValue}`, false);
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
  let calculatedAttackVal = playerAttackValue;
  if (nerfValue !== 0) {
    calculatedAttackVal = playerAttackValue - nerfValue;
    if (calculatedAttackVal < 2) {
      calculatedAttackVal = 0
    }
  }
  isUpChain = false;
  isDownChain = false;
  attack(playerAttackValue);

  if (chainBonus !== 0) {
    if (chainBonus > 10) {
      let toCalcChainBonusAttack = chainBonus;
      while (toCalcChainBonusAttack > 10) {
        attack(10); // 10を減らす
        toCalcChainBonusAttack -= 10;
      }
      attack(toCalcChainBonusAttack);
    } else {
      attack(chainBonus);
    }
  }
  calculatedAttackVal = calculatedAttackVal + chainBonus;
  onAttackShake(calculatedAttackVal);
  displayAttackValue(playerEffectOverlay, calculatedAttackVal);
}

function upChainAttack() {

  let calculatedAttackVal = playerAttackValue;
  if (nerfValue !== 0) {
    calculatedAttackVal = playerAttackValue - nerfValue;
    if (calculatedAttackVal < 2) {
      calculatedAttackVal = 0
    }
  }

  if (isDownChain === true) {
    isDownChain = false;
    chainBonus = 2;
    attack(playerAttackValue);
    attack(chainBonus);


    calculatedAttackVal = calculatedAttackVal + chainBonus;
    onAttackShake(calculatedAttackVal);
    displayAttackValue(playerEffectOverlay, calculatedAttackVal);

    console.log("upChainAttackに切り替わったのでchainBonusは2");
    console.log("isDownChainは" + isDownChain);
    console.log("isUpChainは" + isUpChain);
    return;
  }
  if (chainBonus === 0) {
    chainBonus = 2;
    attack(playerAttackValue);
    attack(chainBonus);
    console.log("初めてのchainBonusは" + chainBonus);
  } else {
    chainBonus = chainBonus + 2;
    if (chainBonus > 10) {
      attack(playerAttackValue);
      let toCalcChainBonusAttack = chainBonus;
      while (toCalcChainBonusAttack > 10) {
        attack(10); // 10を減らす
        toCalcChainBonusAttack -= 10;
      }
      attack(toCalcChainBonusAttack);

      console.log("chainBonusによる追加攻撃");
      console.log("連続chainBonusは" + chainBonus);
    } else {
      attack(playerAttackValue);
      attack(chainBonus);
      console.log("連続chainBonusは" + chainBonus);
    }
  }
  calculatedAttackVal = calculatedAttackVal + chainBonus;
  onAttackShake(calculatedAttackVal);
  displayAttackValue(playerEffectOverlay, calculatedAttackVal);
}

function downChainAttack() {

  let calculatedAttackVal = playerAttackValue;
  if (nerfValue !== 0) {
    calculatedAttackVal = playerAttackValue - nerfValue;
    if (calculatedAttackVal < 2) {
      calculatedAttackVal = 0
    }
  }

  if (isUpChain === true) {
    isUpChain = false;
    chainBonus = 2;
    attack(playerAttackValue);
    attack(chainBonus);

    calculatedAttackVal = calculatedAttackVal + chainBonus;
    onAttackShake(calculatedAttackVal);
    displayAttackValue(playerEffectOverlay, calculatedAttackVal);

    console.log("downChainAttackに切り替わったのでボーナスは2");
    console.log("isDownChainは" + isDownChain);
    console.log("isUpChainは" + isUpChain);
    return;
  }
  if (chainBonus === 0) {
    chainBonus = 2;
    console.log("初めてのchainBonusは" + chainBonus);
    attack(playerAttackValue);
    attack(chainBonus);
  } else {
    chainBonus++;
    if (chainBonus > 10) {

      attack(playerAttackValue);

      let toCalcChainBonusAttack = chainBonus;
      while (toCalcChainBonusAttack > 10) {
        attack(10); // 10を減らす
        toCalcChainBonusAttack -= 10;
      }
      attack(toCalcChainBonusAttack);

      console.log("chainBonusによる追加攻撃");
      console.log("連続chainBonusは" + chainBonus);

    } else {
      attack(playerAttackValue);
      attack(chainBonus);
      console.log("連続chainBonusは" + chainBonus);
    }
  }
  calculatedAttackVal = calculatedAttackVal + chainBonus;
  onAttackShake(calculatedAttackVal);
  displayAttackValue(playerEffectOverlay, calculatedAttackVal);
}

function sameCharAttack() {

  let calculatedAttackVal = playerAttackValue;
  if (nerfValue !== 0) {
    calculatedAttackVal = playerAttackValue - nerfValue;
    if (calculatedAttackVal < 2) {
      calculatedAttackVal = 0
    }
  }

  calculatedAttackVal = calculatedAttackVal + playerAttackValue + chainBonus * 2;
  onAttackShake(calculatedAttackVal);
  displayAttackValue(playerEffectOverlay, calculatedAttackVal);

  playerAttackValue = playerAttackValue * 2 + chainBonus * 2
  chainBonus = 0;
  console.log("DoubleAttack! 攻撃力は:" + playerAttackValue + "に上昇");
  if (playerAttackValue > 10) {
    while (playerAttackValue > 10) {
      attack(10); // 10を減らす
      playerAttackValue -= 10;
    }

    if (playerAttackValue === 10) {
      const array = [2, 3, 4, 5, 6, 7, 8];
      const randomValue = array[Math.floor(Math.random() * array.length)];
      attack(randomValue); // ランダム値を攻撃
      attack(10 - randomValue); // 残りの値を攻撃
    } else {
      attack(playerAttackValue); // 10未満の残りの値を攻撃
    }
  } else {
    attack(playerAttackValue);
  }
  console.log("DoubleAttack! 攻撃力は:" + playerAttackValue);
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

  cancelChain();

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
  drawField(ctxPlayer, playerField, memorizeLastAttackValue);
  drawField(ctxOpponent, opponentField, 0);
  drawInputField(ctxPlayerInput, '', playerInputField);
  drawInputField(ctxOpponentInput, '', opponentInputField);
  drawStatusField(ctxPlayerStatus, true);
  cleanupWarningAnimations();
}

// マッチング成功UI表示
// function showMatchingSuccess() {
//   const overlay = document.createElement('div');
//   overlay.style.cssText = `
//     position: fixed;
//     top: 50%;
//     left: 50%;
//     transform: translate(-50%, -50%);
//     background-color: rgba(0, 0, 0, 0.8);
//     color: white;
//     border-radius: 10px;
//     font-size: 6vh;
//     z-index: 1000;
//   `;
//   overlay.textContent = 'マッチングに成功しました';
//   document.body.appendChild(overlay);

//   setTimeout(() => {
//     document.body.removeChild(overlay);
//     startCountdown();
//   }, 500);
//   setTimeout(() => {
//     hideLoadingOverlay();
//   }, 500);
// }

// カウントダウン表示
function showCountdown(count, elementId) {
  const overlay = document.getElementById(elementId);
  const countElement = document.createElement('div');

  countElement.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 8vh;
    animation: countdownAnimation 0.9s ease-in forwards;
  `;

  // アニメーションのキーフレーム定義を追加
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes countdownAnimation {
      0% {
        transform: translate(-50%, -50%) scaleX(1);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scaleX(0);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);

  countElement.textContent = count;
  overlay.appendChild(countElement);

  // アニメーション終了後に要素を削除
  setTimeout(() => {
    overlay.removeChild(countElement);
    document.head.removeChild(styleSheet);
  }, 900);
}

function startCountdown() {
  gameState = 'countdown';
  let count = 3;

  const countInterval = setInterval(() => {
    if (count > 0) {
      // プレイヤーと相手両方の要素にカウントダウンを表示
      showCountdown(count, 'playerChildEffectOverlay');
      showCountdown(count, 'opponentChildEffectOverlay');
    } else if (count === 0) {
      // GOの表示
      showCountdown('GO!!', 'playerChildEffectOverlay');
      showCountdown('GO!!', 'opponentChildEffectOverlay');
    } else {
      clearInterval(countInterval);
      gameState = 'playing';
      startGame();
    }
    count--;
  }, 1000);
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
    background-color: rgba(0, 0, 0, 0);
    color: white;
    padding: 20px;
    border-radius: 10px;
    font-family: 'M PLUS Rounded 1c';
    font-size: 1.5vw;
    text-align: center;
    z-index: 1000;
  `;

  retryDialog.innerHTML = `
    <div class="retryDialog dialog-content">
      <h2>もう一度プレイしますか？</h2>
      <div class="dialog-buttons">
        <button id="yesButton" class="retryDialogButton" onclick="handleRetryResponse(true)">
          Yes
        </button>
        <button id="noButton" class="retryDialogButton" onclick="handleRetryResponse(false)">
          No
        </button>
      </div>
    </div>
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
  ctx.fillStyle = "#13172c";
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
      ctx.font = `${CELL_SIZE * 0.45}px 'M PLUS Rounded 1c'`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.letterSpacing = "-0.1em"

      const textX = CELL_SIZE / 5;
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
// console.log(newMarginSize);

const unitChair = "/M"

// 各infoFieldWrapperに対してCSS変数を設定
Array.from(infoFieldWrappers).forEach((wrapper) => {
  wrapper.style.setProperty('--base-size', newMarginSize);
});

// 値を描写する関数
function drawInfo() {
  let emitCounter = 0; // 送信タイミング制御用のカウンタ

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
    // カウンタをインクリメント
    emitCounter++;

    // 1秒ごとに情報を送信
    if (emitCounter >= 10) { // 10 * 0.1秒 = 1秒
      socket.emit('playerInfoUpdate', {
        kpm: { main: mainKPMText, small: toSmallKPMChars },
        apm: { main: mainAPMText, small: toSmallAPMChars },
        wpm: { main: mainWPMText, small: toSmallWPMChars },
      });

      emitCounter = 0; // カウンタをリセット
    }

  }, 100);
}


// ボタンのイベントリスナー設定
document.querySelector('.random-match').addEventListener('click', () => {
  startRandomMatch();
});

document.querySelector('.room-match').addEventListener('click', () => {
  showRoomMatchDialog();
});

// ランダムマッチング開始
function startRandomMatch() {
  if (!socket) {
    initializeSocket();
  }
  socket.emit('findMatch');
  showLoadingOverlay('対戦相手を探しています...');
}

// ルームマッチングダイアログ表示
function showRoomMatchDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'room-match-dialog';
  dialog.innerHTML = `
    <div class="dialog-content">
      <h2>ルーム番号を入力</h2>
      <input type="text" id="roomInput" maxlength="4" placeholder="4桁の番号を入力"
             pattern="[0-9]*" inputmode="numeric">
      <div class="dialog-buttons">
        <button id="connectButton">接続</button>
        <button id="cancelButton">キャンセル</button>
      </div>
    </div>
  `;
  document.body.appendChild(dialog);

  const roomInput = dialog.querySelector('#roomInput');
  const connectButton = dialog.querySelector('#connectButton');
  const cancelButton = dialog.querySelector('#cancelButton');

  roomInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    connectButton.disabled = e.target.value.length !== 4;
  });

  connectButton.addEventListener('click', () => {
    const roomNumber = roomInput.value;
    if (roomNumber.length === 4) {
      joinRoom(roomNumber);
      dialog.remove();
    }
  });

  cancelButton.addEventListener('click', () => {
    dialog.remove();
  });
}

// ルーム参加処理
function joinRoom(roomNumber) {
  if (!socket) {
    initializeSocket();
  }
  socket.emit('joinRoom', roomNumber);
  showLoadingOverlay('ルームに接続しています...');
}

// ローディングオーバーレイ表示/非表示
function showLoadingOverlay(message) {
  const overlay = document.querySelector('.overlay');
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="spinner"></div>
      <p>${message}</p>
    </div>
  `;
  overlay.style.display = 'flex';
}

function hideLoadingOverlay() {
  const overlay = document.querySelector('.overlay');
  overlay.style.display = 'none';
}

// マッチング成功時の表示
function showMatchingSuccess() {
  const overlay = document.querySelector('.overlay');
  overlay.innerHTML = `
    <div class="matching-success">
      <h2>対戦相手が見つかりました！</h2>
      <p>まもなくゲームが開始します...</p>
    </div>
  `;
  setTimeout(() => {
    hideLoadingOverlay();
    startCountdown();
  }, 2000);
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

  // ゲーム開始
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
    console.log(data.loserId === socket.id);
  });

  // ルーム関連のイベント
  socket.on('roomJoined', (roomNumber) => {
    currentRoom = roomNumber;
    showLoadingOverlay(`ルーム${roomNumber}で対戦相手を待っています...`);
  });

  socket.on('roomFull', () => {
    alert('指定されたルームは満室です');
    hideLoadingOverlay();
  });

  socket.on('invalidRoom', () => {
    alert('無効なルーム番号です');
    hideLoadingOverlay();
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

  socket.on('inputSync', (data) => {
    opponentInput = data.input;
    checkAndRemoveWord(opponentField, opponentFieldWords, opponentInput);
    drawField(ctxOpponent, opponentField, data.memorizeLastAttackValue);
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
          drawField(ctxOpponent, opponentField, data.memorizeLastAttackValue);

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
    drawField(ctxOpponent, opponentField, data.memorizeLastAttackValue);
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

  socket.on('syncAttackValue', (data) => {
    const containerRect = opponentEffectOverlay.getBoundingClientRect();
    const numberElement = document.createElement('span');
    numberElement.textContent = data.number;
    numberElement.className = 'displayAttackValue';
    numberElement.style.color = data.color;
    const posX = containerRect.width * 0.75;
    const posY = containerRect.height * 0.25;
    numberElement.style.left = `${posX}px`;
    numberElement.style.top = `${posY}px`;
    numberElement.style.fontSize = `${data.fontSize}px`;
    numberElement.style.transform = data.transform;

    opponentEffectOverlay.appendChild(numberElement);

    // アニメーションと削除
    requestAnimationFrame(() => {
      numberElement.classList.add('fade-out');
      setTimeout(() => {
        numberElement.remove();
      }, 1500);
    });
  });

  // 攻撃を受けた時のイベントリスナー
  socket.on('receiveAttackShake', (data) => {
    triggerShakeOnReceive(data); // シェイクを実行
    triggerColorFlash(playerFieldElement); // 色のフラッシュ効果を適用
  });

  // クライアント側のコード（main.jsなど）
  socket.on('updateAttackInfo', (data) => {
    updateOpponentAttackInfoDisplay(data.attackType);
  });

  socket.on('updeteNerfInfo', (data) => {
    updateOpponentNerfInfoDisplay(data.nerfValue);
  });

  socket.on('updetePlayerMissEffect', () => {
    triggerMissColorFlash(opponentInputField, false);
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
    // 受信したハイライトデータを使って opponentField を更新
    const overlayDiv = opponentOverlayElement;
    removeAuraEffectFromOverlay(overlayDiv);

    // データを基にハイライト処理
    data.highlightData.forEach(({ x, y, colorObj }) => {
      applyAuraEffectToCell(y, x, colorObj, overlayDiv);
    });
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
class SoundManager {
  constructor() {
    // クラス全体で単一のAudioContextを使用
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = new Map();
    this.masterVolume = 1.0;

    // マスターボリュームのゲインノード作成
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);
    this.masterGainNode.gain.value = this.masterVolume;
  }

  setMasterVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.masterGainNode.gain.value = this.masterVolume;
  }

  async loadSound(key, filepath) {
    try {
      const response = await fetch(filepath);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      this.sounds.set(key, {
        buffer: audioBuffer
      });

      console.log(`Loaded sound: ${key}`);
    } catch (error) {
      console.error(`Error loading sound ${key}:`, error);
    }
  }

  playSound(key, options = {}) {
    const sound = this.sounds.get(key);
    if (!sound) {
      console.error(`Sound not found: ${key}`);
      return null;
    }

    // 共通のaudioContextを使用してノードを作成
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    const {
      volume = 1.0,
      rate = 1.0,
      detune = 0,
      loop = false,
      loopStart = 0,
      loopEnd = 0,
      fadeIn = 0,
      fadeOut = 0,
    } = options;

    source.buffer = sound.buffer;
    source.playbackRate.value = rate;
    source.detune.value = detune;
    source.loop = loop;
    if (loop && loopEnd > 0) {
      source.loopStart = loopStart;
      source.loopEnd = loopEnd;
    }

    gainNode.gain.value = volume * this.masterVolume;

    if (fadeIn > 0) {
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        volume * this.masterVolume,
        this.audioContext.currentTime + fadeIn
      );
    }

    if (fadeOut > 0 && !loop) {
      const duration = sound.buffer.duration;
      gainNode.gain.setValueAtTime(
        volume * this.masterVolume,
        this.audioContext.currentTime + duration - fadeOut
      );
      gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + duration
      );
    }

    source.connect(gainNode);
    gainNode.connect(this.masterGainNode);

    // Chrome等のブラウザポリシーに対応
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    source.start(0);

    return {
      source,
      gainNode,
      stop: () => {
        try {
          source.stop();
        } catch (e) {
          console.warn('Sound already stopped');
        }
      },
      setVolume: (newVolume) => {
        gainNode.gain.value = Math.max(0, Math.min(1, newVolume)) * this.masterVolume;
      },
      setRate: (newRate) => {
        source.playbackRate.value = newRate;
      },
      setDetune: (newDetune) => {
        source.detune.value = newDetune;
      }
    };
  }
}

// グローバルなサウンドマネージャーのインスタンスを作成
const soundManager = new SoundManager();

// 画面ロード時に音声ファイルを読み込む
window.addEventListener('load', async () => {
  const soundFiles = {
    'BGM1': '/sounds/MusMus-CT-NV-23.mp3',
    'missType': '/sounds/ビープ音4.mp3',
    'type1': '/sounds/meka_ge_nokey_ent02.mp3',
    'type2': '/sounds/meka_ge_mouse_s02.mp3',
    'type3': '/sounds/カーソル移動2.mp3',
    'type4': '/sounds/9744__horn__typewriter.wav',
    'attackWeak': '/sounds/346918__julien_matthey__jm_noiz_laser-04.wav',
    'attackNormal': '/sounds/270548__littlerobotsoundfactory__laser_04.wav',
    'attackStrong': '/sounds/270551__littlerobotsoundfactory__laser_07.wav',
    'attackOP': '/sounds/547441__mango777__lazercannon.ogg',
    'buttonHover': '/sounds/533257__copyc4t__screen-lettering.wav',
    'receiveAttack': '/sounds/577423__morganpurkis__zip-laser.wav',

  };

  // すべての音声ファイルを読み込む
  for (const [key, filepath] of Object.entries(soundFiles)) {
    await soundManager.loadSound(key, filepath);
  }
});