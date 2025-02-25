const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);


const cors = require('cors');

const allowedOrigins = [
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'https://puzztype.onrender.com',
  'https://plicy.net',
  'https://html5.plicy.net'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true
}));

// Socket.IOサーバーの設定にCORSオプションを追加
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  }
});

app.use(express.static(__dirname + '/public'));

// const io = new Server(server);
const rooms = new Map();
const roomMatches = new Map(); // ルーム番号とプレイヤーの対応を管理
let waitingPlayer = null;

const https = require('https'); // httpではなくhttpsをインポート

function keepAlive() {
  const url = 'https://puzztype.onrender.com';
  https.get(url, (res) => {
    console.log('Self-ping sent. Status:', res.statusCode);
  }).on('error', (err) => {
    console.error('Self-ping error:', err.message);
  });
}

setInterval(keepAlive, 13 * 60 * 1000);

keepAlive();

io.on('connection', (socket) => {
  console.log(`ユーザー接続: ${socket.id}`);

  socket.on('cancelSearch', () => {
    console.log(`${socket.id} が募集をキャンセル`);
  });


  //   // WebRTC接続のためのシグナリングイベント
  //   socket.on('webrtc-offer', (data) => {
  //     // オファーを他のクライアントにブロードキャスト
  //     socket.broadcast.emit('webrtc-offer', data);
  // });

  // socket.on('webrtc-answer', (data) => {
  //     // アンサーを対象のクライアントに送信
  //     socket.broadcast.emit('webrtc-answer', data);
  // });

  // socket.on('ice-candidate', (candidate) => {
  //     // ICEカンディデートを対象のクライアントに送信
  //     socket.broadcast.emit('ice-candidate', candidate);
  // });


  socket.on('findMatch', () => {
    if (!waitingPlayer) {
      waitingPlayer = socket;
      socket.emit('waitingForPlayer');
      console.log(socket.id + " が待機中");
    } else {
      const room = `room_${Date.now()}`;
      waitingPlayer.join(room);
      socket.join(room);

      io.to(room).emit('gameStart', {
        player1Id: waitingPlayer.id,
        player2Id: socket.id
      });

      rooms.set(room, {
        player1: waitingPlayer,
        player2: socket,
        gameState: {
          player1Field: [],
          player2Field: [],
        }
      });
      console.log( room + 'で' + waitingPlayer.id + 'と' + socket.id + "が試合開始");
      waitingPlayer = null;
    }
  });

  socket.on('cancelMatch', () => {
    if (waitingPlayer === socket) {
      waitingPlayer = null;
      socket.emit('matchCancelled');
    }
  });

  // ルームマッチング用のイベントハンドラ
  socket.on('joinRoom', (roomNumber) => {
    if (!roomMatches.has(roomNumber)) {
      roomMatches.set(roomNumber, socket);
      socket.emit('roomJoined', roomNumber);
      console.log(socket.id + ' が ROOM ' + roomNumber + " で待機中");
    } else {
      const waitingSocket = roomMatches.get(roomNumber);

      if (waitingSocket.connected) {
        const room = `room_${roomNumber}`;
        waitingSocket.join(room);
        socket.join(room);

        io.to(room).emit('gameStart', {
          player1Id: waitingSocket.id,
          player2Id: socket.id
        });

        rooms.set(room, {
          player1: waitingSocket,
          player2: socket,
          gameState: {
            player1Field: [],
            player2Field: [],
          }
        });
        console.log( roomNumber + ' で ' + waitingSocket.id + ' と ' + socket.id + " が試合開始");
        roomMatches.delete(roomNumber);
      } else {
        socket.emit('invalidRoom');
        roomMatches.delete(roomNumber);
      }
    }
  });

  // ルームマッチングのキャンセル処理
  socket.on('cancelRoomMatch', () => {
    for (const [roomNumber, waitingSocket] of roomMatches.entries()) {
      if (waitingSocket.id === socket.id) {
        roomMatches.delete(roomNumber); // ルーム待機中のプレイヤーを解除
        socket.emit('roomMatchCancelled');
        break;
      }
    }
  });

  // if (!waitingPlayer) {
  //   waitingPlayer = socket;
  //   socket.emit('waitingForPlayer');
  // } else {
  //   const room = `room_${Date.now()}`;
  //   waitingPlayer.join(room);
  //   socket.join(room);

  //   // ゲーム開始を通知
  //   io.to(room).emit('gameStart', {
  //     player1Id: waitingPlayer.id,
  //     player2Id: socket.id
  //   });

  //   rooms.set(room, {
  //     player1: waitingPlayer,
  //     player2: socket,
  //     gameState: {
  //       player1Field: [],
  //       player2Field: [],
  //     }
  //   });

  //   waitingPlayer = null;

  // }

  // 攻撃イベントの処理を追加
  socket.on('attack', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('receiveAttack', {
          attackValue: data.attackValue
        });
      }
    }
  });

  // サーバー側で攻撃値を同期
  socket.on('syncAttackValue', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id
          ? gameRoom.player2
          : gameRoom.player1;

        targetSocket.emit('syncAttackValue', data);
      }
    }
  });


  // server.js
  socket.on('attackShake', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        // 攻撃を受けるプレイヤーにデータを送信
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('receiveAttackShake', {
          attackValue: data.attackValue, // 攻撃値
          shakeDistance: Math.min(15, Math.max(5, data.attackValue)) // 動的シェイク距離
        });
      }
    }
  });

  // フィールド状態の同期
  socket.on('fieldUpdate', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        // if (socket.id === gameRoom.player1.id) {
        //   gameRoom.gameState.player1Field = data.field;
        // } else {
        //   gameRoom.gameState.player2Field = data.field;
        // }
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        // socket.to(room).emit('fieldSync', {
        targetSocket.emit('fieldSync', {
          field: data.field,
          fieldWords: data.fieldWords,
          memorizeLastAttackValue: data.memorizeLastAttackValue
        });
      }
    }
  });

  socket.on('inputUpdate', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
      targetSocket.emit('inputSync', {
        input: data.input,
        memorizeLastAttackValue: data.memorizeLastAttackValue
      });
    }
  });

  // Socket.IOイベントハンドラをクライアント側に追加
  socket.on('nextWordsUpdate', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('nextWordsSync', {
          words: data.words,
          styledWords: data.styledWords
        });
      }
    }
  });

  // サーバーサイド
  socket.on('syncOpponentGradients', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id
          ? gameRoom.player2
          : gameRoom.player1;

        targetSocket.emit('syncOpponentGradients', {
          gradientStyles: data.gradientStyles
        });
      }
    }
  });

  // ソケットイベントの設定
  socket.on('fieldHighlightUpdate', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('fieldHighlightSync', {
          highlightData: data.highlightData,
        });
      }
    }
  });

  // サーバー側に追加するコード（server.js）
  socket.on('statusFieldUpdate', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        // 送信元以外のプレイヤーにデータを送信
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('statusFieldSync', {
          receiveValues: data.receiveValues
        });
      }
    }
  });

  socket.on('playerInfoUpdate', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('opponentInfoSync', data);
      }
    }
  });


  // サーバー側のコード（server.js）
  socket.on('sendAttackInfo', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('updateAttackInfo', data);
      }
    }
  });


  // サーバー側のコード（server.js）
  socket.on('sendNerfInfo', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('updeteNerfInfo', data);
      }
    }
  });

  socket.on('sendPlayerMissEffect', () => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('updetePlayerMissEffect');
      }
    }
  });

  // サーバー側のコード（server.js）
  socket.on('sendChainInfo', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('updateChainInfo', data);
      }
    }
  });

  // ゲームオーバー処理
  // socket.on('gameOver', (data) => {
  //   const room = Array.from(socket.rooms)[1];
  //   if (room) {
  //     const gameRoom = rooms.get(room);
  //     if (gameRoom) {
  //       // 両プレイヤーにゲームオーバーを通知
  //       io.to(room).emit('gameOver', {
  //         loserId: data.loserId
  //       });
  //     }
  //   }
  // });

  socket.on('gameOver', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('gameOver', {
          loserId: data.loserId
        });
      }
    }
  });

  // socket.on('gameOver', (data) => {
  //   const room = Array.from(socket.rooms)[1];
  //   if (room) {
  //     const gameRoom = rooms.get(room);
  //     if (gameRoom) {
  //       // 勝利数を管理
  //       gameRoom.wins = gameRoom.wins || { player1: 0, player2: 0 };

  //       // 勝者のIDを判定し、勝利数を加算
  //       if (data.loserId === gameRoom.player1.id) {
  //         gameRoom.wins.player2++;
  //       } else {
  //         gameRoom.wins.player1++;
  //       }

  //       // 2勝したプレイヤーがいるか確認
  //       const player1Wins = gameRoom.wins.player1;
  //       const player2Wins = gameRoom.wins.player2;

  //       if (player1Wins === 2 || player2Wins === 2) {
  //         // 最終的な勝者を通知
  //         io.to(room).emit('gameOver', {
  //           loserId: data.loserId,
  //           final: true, // 最終的なゲームオーバーを示す
  //           winnerId: player1Wins === 2 ? gameRoom.player1.id : gameRoom.player2.id
  //         });

  //         // 部屋をリセットまたは削除
  //         rooms.delete(room);
  //       } else {
  //         // 次のラウンドに進む通知
  //         io.to(room).emit('gameOver', {
  //           loserId: data.loserId,
  //           final: false // 最終的なゲームオーバーではない
  //         });
  //       }
  //     }
  //   }
  // });

  // リトライレスポンス処理
  // socket.on('retryResponse', (data) => {
  //   const room = Array.from(socket.rooms)[1];
  //   if (room) {
  //     const gameRoom = rooms.get(room);
  //     if (gameRoom) {
  //       if (!gameRoom.retryResponses) {
  //         gameRoom.retryResponses = new Map();
  //       }

  //       gameRoom.retryResponses.set(socket.id, data.response);

  //       if (gameRoom.retryResponses.size === 2) {
  //         const bothAgreed = Array.from(gameRoom.retryResponses.values()).every(response => response);

  //         io.to(room).emit('retryResponse', {
  //           bothPlayersAgreed: bothAgreed,
  //           // canRetry: bothAgreed
  //         });

  //         if (bothAgreed) {
  //           // ゲーム状態をリセット
  //           gameRoom.gameState = {
  //             player1Field: [],
  //             player2Field: []
  //           };
  //           gameRoom.retryResponses.clear();
  //         } else {
  //           rooms.delete(room);
  //           console.log("ルーム削除");
  //         }
  //       }
  //     }
  //   }
  // });

  socket.on('retryResponse', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        if (!gameRoom.retryResponses) {
          gameRoom.retryResponses = new Map();
        }

        gameRoom.retryResponses.set(socket.id, data.response);

        // どちらかのプレイヤーが「No」を選択した場合
        if (data.response === false) {

          // 両プレイヤーに通知を送信
          io.to(room).emit('retryResponse', {
            bothPlayersAgreed: false
          });

          // 両プレイヤーのソケットからルームを削除
          waitingPlayer = null;
          gameRoom.player1.leave(room);
          gameRoom.player2.leave(room);
          rooms.delete(room);
          console.log("ルーム削除");

          // roomMatchesからもルームを削除
          for (const [roomNumber, waitingSocket] of roomMatches.entries()) {
            if (waitingSocket.id === socket.id || waitingSocket.id === gameRoom.player1.id || waitingSocket.id === gameRoom.player2.id) {
              roomMatches.delete(roomNumber);
            }
          }

          return; // 処理を終了
        }

        // 両プレイヤーが応答した場合
        if (gameRoom.retryResponses.size === 2) {
          const bothAgreed = Array.from(gameRoom.retryResponses.values()).every(response => response);

          io.to(room).emit('retryResponse', {
            bothPlayersAgreed: bothAgreed
          });

          if (bothAgreed) {
            // ゲーム状態をリセット
            gameRoom.gameState = {
              player1Field: [],
              player2Field: []
            };
            gameRoom.retryResponses.clear();
          } else {

            // プレイヤーが合意しなかった場合、ルームを削除
            waitingPlayer = null;
            gameRoom.player1.leave(room);
            gameRoom.player2.leave(room);
            rooms.delete(room);

            rooms.delete(room);
            for (const [roomNumber, waitingSocket] of roomMatches.entries()) {
              if (waitingSocket.id === socket.id || waitingSocket.id === gameRoom.player1.id || waitingSocket.id === gameRoom.player2.id) {
                roomMatches.delete(roomNumber);
              }
            }
            console.log("ルーム削除");
          }
        }
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`ユーザー切断: ${socket.id}`);

    // waitingPlayerのクリア
    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }

    // すべてのルームをチェックして、切断したプレイヤーを探す
    rooms.forEach((gameRoom, roomKey) => {
      if (gameRoom.player1?.id === socket.id || gameRoom.player2?.id === socket.id) {
        // 切断を通知
        io.to(roomKey).emit('opponentDisconnected');

        // プレイヤーをルームから削除
        if (gameRoom.player1) gameRoom.player1.leave(roomKey);
        if (gameRoom.player2) gameRoom.player2.leave(roomKey);

        // ルームを削除
        rooms.delete(roomKey);
      }
    });

    // roomMatchesからの削除
    for (const [roomNumber, waitingSocket] of roomMatches.entries()) {
      if (waitingSocket.id === socket.id) {
        roomMatches.delete(roomNumber);
      }
    }
  });
});

const PORT = Number(!!process.env.PORT) || 3000;
server.listen(PORT, () => {
  // console.log(`Server is running on port ${PORT}`);
  // console.log("process.env.PORT" + process.env.PORT);
});
