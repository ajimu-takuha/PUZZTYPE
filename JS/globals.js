// globals.jsに追加
let socket;
let isPlayer1 = false;
let gameStarted = false;
let playerId = null;
let opponentId = null;

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

// 単語プール
let playerWordPool = [];
let opponentWordPool = [];

// 攻撃用単語プール
// let playerAttackWordPool = [];
// let opponentAttackWordPool = [];

// プレイヤー攻撃スコア
let playerAttackValue = 0;
let opponentAttackValue = 0;

// 攻撃スコア算出のため、最後に消去した文字数
let playerLastAttackValue = 0;
let opponentLastAttackValue = 0;

// チェイン攻撃用
let playerStockAttackValue = []
let opponentStockAttackValue = []

// キャンバス関連
const playerFieldElement = document.getElementById("playerField");
const opponentFieldElement = document.getElementById("opponentField");

const ctxPlayer = playerFieldElement.getContext("2d");
const ctxOpponent = opponentFieldElement.getContext("2d");

const playerInputField = document.getElementById("playerInputField");
const opponentInputField = document.getElementById("opponentInputField");

const ctxPlayerInput = playerInputField.getContext("2d");
const ctxOpponentInput = opponentInputField.getContext("2d");

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
  playerWordPool,
//   playerAttackWordPool,
//   opponentAttackWordPool,
  opponentWordPool,
  playerAttackValue,
  opponentAttackValue,
  playerLastAttackValue,
  opponentLastAttackValue,
  playerStockAttackValue,
  opponentStockAttackValue,
  ctxPlayer,
  ctxOpponent,
  ctxPlayerInput,
  ctxOpponentInput
};



