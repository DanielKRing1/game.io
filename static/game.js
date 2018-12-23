const socket = io();

socket.emit('new player');

// Send Movement
setInterval(() => {
    socket.emit('movement', direction);
}, 1000 / 60);

// Player input
let direction = {
    x: 0,
    y: 0
};

document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
        case 65: // A
            direction.x = -1;
          break;
        case 87: // W
            direction.y = 1;
          break;
        case 68: // D
            direction.x = 1;
          break;
        case 83: // S
            direction.y = -1;
          break;
    }
});

document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 65: // A
            if(direction.x === -1) direction.x = 0;
            break;
        case 68: // D
            if(direction.x === 1) direction.x = 0;
            break;

        case 87: // W
            if(direction.y === 1) direction.y = 0;
            break;
        case 83: // S
            if(direction.y === -1) direction.y = 0;
            break;
    }
});

const canvas = document.getElementById('canvas');
canvas.width = 0.9 * document.documentElement.clientWidth;
canvas.height = 0.8 * document.documentElement.clientHeight;
const context = canvas.getContext('2d');
socket.on('state', (players) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    Object.keys(players).forEach(key => {
        const player = players[key];
        context.beginPath();
        context.arc(player.pos.x, player.pos.y, player.radius, 0, 2 * Math.PI);
        context.fillStyle = player.color;
        context.fill();
    });
});