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
canvas.width = 1000; //0.9 * document.documentElement.clientWidth;
canvas.height = 500; //0.8 * document.documentElement.clientHeight;
const context = canvas.getContext('2d');
socket.on('state', (me, food, players) => {
    context.clearRect(0, 0, canvas.width, canvas.height);

    if(!me) return;
    console.log(me)
    if(!food) return;
    drawFood(me, food);
    if(!players) return;
    drawPlayers(me, players);

});
socket.on('collision check-req', (me, nearbyFood, nearbyPlayers) => {
    const absorbedFood = getAbsorbedFood(me, nearbyFood);
    const absorbedPlayers = getAbsorbedPlayers(me, nearbyPlayers);

    socket.emit('collision check-res', {
        absorbedFood,
        absorbedPlayers
    });
});

const drawFood = (me, food) => {
    food.forEach(bite => {
        context.beginPath();
        context.arc(bite.pos.x - me.pos.x + canvas.width/2, bite.pos.y - me.pos.y + canvas.height/2, bite.radius, 0, 2 * Math.PI);
        context.fillStyle = bite.color;
        context.fill();
    });
}
const drawPlayers = (me, players) => {
    players.forEach(player => {
        context.beginPath();
        context.arc(player.pos.x - me.pos.x + canvas.width/2, player.pos.y - me.pos.y + canvas.height/2, player.radius, 0, 2 * Math.PI);
        context.fillStyle = player.color;
        context.fill();
    });
}

const getAbsorbedFood = (me, potentialFood) => {
    let absorbedFood = [];

    potentialFood.forEach(bite => {
        const distanceSqr = calcDistanceSqr(me.pos, bite.pos);

        // Touching at least edge
        if(distanceSqr <= calcSqr(me.radius + bite.radius)) {
            absorbedFood.push(bite);
        }
    });

    return absorbedFood;
}
const getAbsorbedPlayers = (me, nearbyPlayers) => {
    let absorbedList = [];

        nearbyPlayers.forEach(other => {
            if(other.id === me.id) return;

            const distanceSqr = calcDistanceSqr(me.pos, other.pos);

            // Touching at least center
            if(distanceSqr <= calcSqr(other.radius) || distanceSqr <= calcSqr(me.radius)) {
                // If 1.5 times larger
                const area = calcArea(me.radius);
                const otherArea = calcArea(other.radius);
                
                if(area >= 1.5*otherArea){
                    absorbedList.push(other);
                }
            }
        });

        return absorbedList;
}

// Util
const calcArea = (radius) => {
    return Math.PI * radius * radius;
}
const calcDistanceSqr = (a, b) => {
    const x = a.x - b.x;
    const y = a.y - b.y;

    return x*x + y*y;
}
const calcSqr = (a) => {
    return a*a;
}