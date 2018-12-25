// npm install express socket.io nodemon

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const Board = require('./Board.js');
const util = require('./utils/methods');

const port = 3000 || process.env.PORT;

app.use('/static', express.static(`${__dirname}/static`));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Start server
server.listen(port, () => console.log(`Listening on port ${port}`));

// Handle Player Movement
const WIDTH = 5000;
const HEIGHT = 2500;
const board = new Board(2000, 1000);

for(let i = 0; i < 1; i++) {
    board.addPlayer(`${i}`);
}

io.on('connection', (socket) => {
    // New Player
    socket.on('new player', () => {
        board.addPlayer(socket.id);
    });

    // Save move direction
    socket.on('movement', (data) => {
        board.changePlayerDirection(socket.id, data);
    });
});

// Update client screen
setInterval(() => {
    board.updateAllPlayerPositions();

    io.sockets.emit('state', board.players, board.food);
}, 1000 / 60);

// Update Player Quadtree
setInterval(() => {
    board.updatePlayersQuadTree();
}, 1000 / 8);

// Add Food
setTimeout(() => {
    board.addFood();

    // console.log(Object.keys(board.food).length);
}, 1000);