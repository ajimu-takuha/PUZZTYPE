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

    // 攻撃イベントの処理を追加
    socket.on('attack', (data) => {

        console.log(`Attack received from ${socket.id} with value:`, data);
   
      const room = Array.from(socket.rooms)[1];
      if (room) {
        const gameRoom = rooms.get(room);
        if (gameRoom) {
          // 攻撃を受けるプレイヤーにイベントを送信
          const targetSocket = socket.id === gameRoom.player1.id ? gameRoom.player2 : gameRoom.player1;
          
          console.log(`Target for attack is ${targetSocket.id}`);
          
          targetSocket.emit('receiveAttack', {
            attackValue: data.attackValue
          });
        }
      }
    });

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
    socket.on('highlightReset', () => {
      const room = Array.from(socket.rooms)[1];
      if (room) {
        socket.to(room).emit('highlightResetSync');
      }
    });

  }

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