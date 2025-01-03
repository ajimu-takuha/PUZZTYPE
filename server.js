const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname + '/public'));

const rooms = new Map();
let waitingPlayer = null;

io.on('connection', (socket) => {
  console.log(`ユーザー接続: ${socket.id}`);

  if (!waitingPlayer) {
    waitingPlayer = socket;
    socket.emit('waitingForPlayer');
  } else {
    const room = `room_${Date.now()}`;
    waitingPlayer.join(room);
    socket.join(room);

    // ゲーム開始を通知
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

    waitingPlayer = null;

  }


  // ハイライト状態の同期
  // socket.on('highlightUpdate', (data) => {
  //   console.log('Server received highlightUpdate:', {
  //     socketId: socket.id,
  //     data
  //   });

  //   const gameRoom = rooms.get(room);
  //   if (gameRoom) {
  //     console.log('Emitting highlightSync to room:', room);
  //     const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
  //     targetSocket.emit('highlightSync', {
  //       highlightIndex: data.highlightIndex,
  //       length: data.length
  //     });
  //   }
  // });


  // ハイライトリセットの同期
  // socket.on('highlightReset', () => {
  //   const room = Array.from(socket.rooms)[1];
  //   if (room) {
  //     socket.to(room).emit('highlightResetSync');
  //   }
  // });


  // 攻撃イベントの処理を追加
  socket.on('attack', (data) => {

    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        // 攻撃を受けるプレイヤーにイベントを送信
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('receiveAttack', {
          attackValue: data.attackValue
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
        if (socket.id === gameRoom.player1.id) {
          gameRoom.gameState.player1Field = data.field;
        } else {
          gameRoom.gameState.player2Field = data.field;
        }
        socket.to(room).emit('fieldSync', {
          field: data.field,
          fieldWords: data.fieldWords
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
        input: data.input
      });
    }
  });

  // socket.on('inputEmptyUpdate', (data) => {
  //   const room = Array.from(socket.rooms)[1];
  //   if (room) {
  //     const gameRoom = rooms.get(room);
  //     const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
  //     targetSocket.emit('syncInputEmpty', {
  //       input: data.input
  //     });
  //   }
  // });

  // サーバー側のコードに追加 (server.js)
  socket.on('nextWordsUpdate', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
        targetSocket.emit('nextWordsSync', {
          words: data.words
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
  socket.on('gameOver', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        // 両プレイヤーにゲームオーバーを通知
        io.to(room).emit('gameOver', {
          loserId: data.loserId
        });
      }
    }
  });

  // リトライレスポンス処理
  socket.on('retryResponse', (data) => {
    const room = Array.from(socket.rooms)[1];
    if (room) {
      const gameRoom = rooms.get(room);
      if (gameRoom) {
        if (!gameRoom.retryResponses) {
          gameRoom.retryResponses = new Map();
        }

        gameRoom.retryResponses.set(socket.id, data.response);

        if (gameRoom.retryResponses.size === 2) {
          const bothAgreed = Array.from(gameRoom.retryResponses.values()).every(response => response);

          io.to(room).emit('retryResponse', {
            bothPlayersAgreed: bothAgreed,
            canRetry: bothAgreed
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
            rooms.delete(room);
            console.log("ルーム削除");
          }
        }
      }
    }
  });

  socket.on('disconnect', () => {
    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }
    rooms.forEach((value, key) => {
      if (value.player1 === socket || value.player2 === socket) {
        io.to(key).emit('opponentDisconnected');
        rooms.delete(key);
      }
    });
  });
});

const PORT = Number(!!process.env.PORT) || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("process.env.PORT" + process.env.PORT);
});

// server.listen(3000, () => {
//   console.log('サーバー起動: http://localhost:3000');
// });