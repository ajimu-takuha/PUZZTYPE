// globals.jsに追加
let socket;
let isPlayer1 = false;
let gameStarted = false;
let playerId = null;
let opponentId = null;

// main.js に追加・修正
let gameState = 'waiting';
let isGameOver = false;
let retryDialog = null;

const FIELD_WIDTH = 10;
const FIELD_HEIGHT = 20;

// フィールドデータ
let playerField = Array.from({ length: FIELD_HEIGHT }, () =>
  Array(FIELD_WIDTH).fill(null)
);
let opponentField = Array.from({ length: FIELD_HEIGHT }, () =>
  Array(FIELD_WIDTH).fill(null)
);

// プレイヤーが選択したカテゴリ
let selectedCategory = "hiragana";

// 各プレイヤーのフィールド単語リスト
let playerFieldWords = [];
let opponentFieldWords = [];

// 2~10文字が繰り返し出現するための文字長を格納
let playerUsedLengths = [];
let opponentUsedLengths = [];

// プレイヤーの入力内容
let playerInput = "";
let opponentInput = "";

// プレイヤー攻撃スコア
let playerAttackValue = 0;
let opponentAttackValue = 0;
let nerfValue = 0;

// 攻撃スコア算出のため、最後に消去した文字数
let playerLastAttackValue = 0;
let opponentLastAttackValue = 0;

// 攻撃清算用
let playerAttackValueToOffset = [];
let playerReceiveValueToOffset = [];

let isUpChain = false;
let isDownChain = false;
let chainBonus = 0;

let playerKeyValueToKPM = 0;
let playerAtteckValueToAPM = 0;
let playerWordValueToWPM = 0;
let playerKPMValue = 0;
let playerAPMValue = 0;
let playerWPMValue = 0;
let time = "0:00.0";
let totalTime = 0;


// キャンバス関連
const playerFieldElement = document.getElementById("playerField");
const opponentFieldElement = document.getElementById("opponentField");

const ctxPlayer = playerFieldElement.getContext("2d");
const ctxOpponent = opponentFieldElement.getContext("2d");

const playerInputField = document.getElementById("playerInputField");
const opponentInputField = document.getElementById("opponentInputField");

const ctxPlayerInput = playerInputField.getContext("2d");
const ctxOpponentInput = opponentInputField.getContext("2d");


// 各info要素の取得
const kpmDiv = document.getElementById("kpmplayerInfo");
const apmDiv = document.getElementById("apmplayerInfo");
const wpmDiv = document.getElementById("wpmplayerInfo");
const timeDivs = document.getElementsByClassName("time");

// 相手の情報を表示するための要素を取得
const opponentKpmDiv = document.getElementById('kpmOpponentInfo');
const opponentApmDiv = document.getElementById('apmOpponentInfo');
const opponentWpmDiv = document.getElementById('wpmOpponentInfo');

// グローバル変数を登録
window.GameConfig = {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  playerField,
  opponentField,
  playerFieldWords,
  opponentFieldWords,
  playerInput,
  opponentInput,
  playerAttackValue,
  opponentAttackValue,
  nerfValue,
  playerLastAttackValue,
  opponentLastAttackValue,
  playerAttackValueToOffset,
  playerReceiveValueToOffset,
  playerKeyValueToKPM,
  playerAtteckValueToAPM,
  playerWordValueToWPM,
  playerKPMValue,
  playerAPMValue,
  playerWPMValue,
  time,
  totalTime,
  isUpChain,
  isDownChain,
  chainBonus,
  ctxPlayer,
  ctxOpponent,
  ctxPlayerInput,
  ctxOpponentInput,
  kpmDiv,
  apmDiv,
  wpmDiv,
  opponentKpmDiv,
  opponentApmDiv,
  opponentWpmDiv
};



