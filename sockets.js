const Board = require('./Board.js');
const constants = require('./utils/constants');
const util = require('./utils/methods');

const board = new Board(5000, 2500);
let io;

module.exports = {
    init: (server) => {
        io = require('socket.io')(server);
                        
        io.on('connection', (socket) => {
            // New Player
            socket.on('new player', (windowSize) => {
                // board.restartBoard();
                for(let i = 0; i < 100; i++) {
                    board.addPlayer(`${i}`, board.getRandomPos(), {x: 0, y: 0}, util.getNow());
                }
                board.addPlayer(socket.id, {x:-100, y:-100}, windowSize, util.getNow());
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

        updateClient();
        delegateToClient();
        updateServer();
    }
}

const updateClient = () => {
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
}
const delegateToClient = () => {
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
}
const updateServer = () => {
            // -------- SERVER-SIDE --------
        // Update Player Quadtree
        setInterval(() => {
            board.updatePlayersQuadTree();
        }, 1000 / 4);
        // Add Food
        setInterval(() => {
            board.addFood();
        }, 1000 / 4);
}