// npm install express socket.io nodemon

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');

const Board = require('./Board.js');
const constants = require('./utils/constants');
const util = require('./utils/methods');

const port = process.env.PORT || 3000;

app.use('/static', express.static(`${__dirname}/static`));

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Start server
server.listen(port, () => console.log(`Listening on port ${port}`));

// Handle Player Movement
const WIDTH = 5000;
const HEIGHT = 2500;
const board = new Board(5000, 2500);

io.on('connection', (socket) => {
    // New Player
    socket.on('new player', (windowSize) => {
        // board.restartBoard();
        for(let i = 0; i < 100; i++) {
            // board.addPlayer(`${i}`, board.getRandomPos(), {x: 0, y: 0}, util.getNow());
        }
        board.addPlayer(socket.id, {x:-100, y:-100}, windowSize, util.getNow());

        // socket.emit('new player-res', constants.width, constants.height);
    });

    // Save move data
    socket.on('movement', (data) => {
        board.changePlayerDirection(socket.id, data);
    });
    // Resize window
    socket.on('resize', (newDim) => {
        const player = board.players[socket.id];
        if(!player) return;
        
        player.windowSize = newDim;
    });

    // Verify collisions
    socket.on('collision check-res', (data) => {
        const player = board.players[socket.id];

        if(data.absorbedFood.length > 0) {
            board.handleAbsorbedFood(player, data.absorbedFood);
        }
        if(data.absorbedPlayers.length > 0) {
            board.handleAbsorbedPlayers(player, data.absorbedPlayers);
        }
    })

    socket.on('disconnect', () => {
        board.removePlayer(socket.id);
    });
});

// -------- CLIENT-SIDE --------
// Update client screen
setInterval(() => {
    board.updateAllPlayerPositions();

    // io.sockets.emit('state', board.players, board.food);
    Object.keys(io.sockets.sockets).forEach(id => {
        const player = board.players[id];
        if(!player) return;
        
        const screenWidth = player.windowSize.x/2;
        // console.log(player.windowSize.x)
        const screenHeight = player.windowSize.y/2;

        const nearbyFood = board.getNearbyFood(id, screenWidth, screenHeight);
        const nearbyPlayers = board.getNearbyPlayers(id, screenWidth, screenHeight);

        io.to(`${id}`).emit('state', player, nearbyFood, nearbyPlayers);
    });
}, 1000 / 30);

// -------- DELEGATE TASKS TO CLIENT-SIDE --------
// For each connected socket, ask for collision check
// against food and players
setInterval(() => {
    Object.keys(io.sockets.sockets).forEach(id => {
        const player = board.players[id];
        if(!player) return;

        const nearbyFood = board.getNearbyFood(id);
        const nearbyPlayers = board.getNearbyPlayers(id);
        io.to(`${id}`).emit('collision check-req', player, nearbyFood, nearbyPlayers);
    });
}, 1000 / 20);


// -------- SERVER-SIDE --------
// Update Player Quadtree
setInterval(() => {
    board.updatePlayersQuadTree();
}, 1000 / 4);
// Add Food
setInterval(() => {
    board.addFood();
}, 1000 / 4);
