// npm install express socket.io nodemon

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const QuadTree = require('./Quadtree');
const Rect = require('./Rect');
const Board = require('./Board.js');
const Player = require('./Player.js');
const util = require('./utils/methods');

const port = 3000 || process.env.PORT;

app.use('/static', express.static(`${__dirname}/static`));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Start server
server.listen(port, () => console.log(`Listening on port ${port}`));

// Handle Player Movement
const WIDTH = 1000;
const HEIGHT = 500;

const board = new Board(WIDTH, HEIGHT);
const quadTree = new QuadTree(0, new Rect(0, 0, WIDTH, HEIGHT));
let players = {};

for(let i = 0; i < 1; i++) {
    players[i] = new Player(`${i}`, board.getRandomPos(), util.getNow());
}

io.on('connection', (socket) => {
    // New Player
    socket.on('new player', () => {
        players[socket.id] = new Player(socket.id, board.getRandomPos(), util.getNow());
    });

    // Save move direction
    socket.on('movement', (data) => {
        const player = players[socket.id];
        if(!player) return;

        player.direction.x = (data.x === 0) ? 0 : (data.x > 0) ? 1 : -1;
        player.direction.y = (data.y === 0) ? 0 : (data.y > 0) ? 1 : -1;
    });
});

// Update client screen
setInterval(() => {
    Object.keys(players).forEach(key => {
        const player = players[key];
        updatePlayerPos(player);
        checkPlayerCollisions(player);
        player.lastUpdateTime = now;

    });

    io.sockets.emit('state', players);
}, 1000 / 60);

// Update Quadtree
setInterval(() => {
    quadTree.clear();
    Object.keys(players).forEach(key => {
        const player = players[key];
        quadTree.insert(player);
    });

}, 1000 / 5);

const checkPlayerCollisions = (player) => {
    // Object.keys(players).forEach(key => {
        const list = quadTree.retrieve(player);
        player.checkCollision(list);
        // const other = players[key];
    // });
}

const updatePlayerPos = (player) => {
    now = util.getNow();
    player.updatePos(now);
}