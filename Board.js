const uuid = require('uuid/v1');

const Rect = require('./Rect');
const QuadTree = require('./Quadtree.js');
const Player = require('./Player');
const Food = require('./Food');
const util = require('./utils/methods');

const MAX_FOOD = 500;

let Board = class {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.playersQuadTree = new QuadTree(0, new Rect(0, 0, this.width, this.height), 4, 4);
        this.players = {};
        this.playerCount = 0;

        this.foodQuadTree = new QuadTree(0, new Rect(0, 0, this.width, this.height), 10, 4);
        this.food = {};
        this.foodCount = 0;
    }

    addPlayer(playerId, pos, windowSize) {
        this.players[playerId] = new Player(playerId, pos, windowSize, util.getNow());
        this.playerCount++;
    }
    removePlayer(id) {
        const player = this.players[id];
        if(!player) return;

        this.playersQuadTree.remove(player.pos, player.radius, player.radius);
        
        delete this.players[id];
        this.playerCount--;
    }
    changePlayerDirection(id, dir) {
        const player = this.players[id];
        if(!player) return;

        player.direction.x = (dir.x === 0) ? 0 : (dir.x > 0) ? 1 : -1;
        player.direction.y = (dir.y === 0) ? 0 : (dir.y > 0) ? 1 : -1;
    }
    updateAllPlayerPositions() {
        Object.keys(this.players).forEach(key => {
            const player = this.players[key];
            if(!player) return;

            player.updatePos(util.getNow());
            // this.checkPlayerCollisions(player);
            // this.checkFoodCollisions(player);
        });
    }

    updatePlayersQuadTree() {
        this.playersQuadTree.clear();

        Object.keys(this.players).forEach(key => {
            const player = this.players[key];
            this.playersQuadTree.insert(player);
        });
    }
    // updateFoodQuadTree() {
    //     this.foodQuadTree.clear();

    //     Object.keys(this.food).forEach(key => {
    //         const bite = this.food[key];
    //         this.foodQuadTree.insert(bite);
    //     });
    // }

    // Verify that Client REALLY DID absorb food
    handleAbsorbedFood(player, absorbedFood) {
        absorbedFood.forEach(bite => {
            if(!bite.id) return;

            const distanceSqr = this.calcDistanceSqr(player.pos, bite.pos);
            // REALLY DID collide
            if(distanceSqr <= this.calcSqr(player.radius + bite.radius)) {
                // console.log('in')
                player.grow(bite.growRadius);
                // Delete food bite
                this.removeFood(bite.id);
            }
        });
    }
    // Verify that Client REALLY DID absorb players
    handleAbsorbedPlayers(player, absorbedPlayers) {
        absorbedPlayers.forEach(other => {
            if(!other.id) return;

            const distanceSqr = this.calcDistanceSqr(player.pos, other.pos);
            // REALLY DID collide
            if(distanceSqr <= this.calcSqr(other.radius) || distanceSqr <= this.calcSqr(player.radius)) {
                const area = this.calcArea(player.radius);
                const otherArea = this.calcArea(other.radius);

                // if(area >= 1.5*otherArea){
                    player.absorbPlayer(other.radius/4);
                    // Delete player
                    this.removePlayer(other.id);
                // }
            }
        });
    }

    removeDuplicates(list) {
        let obj = {};
        // To object
        list.forEach(el => obj[el.id] = el);
        // Back to list
        const newList = Object.keys(obj).map(key => obj[key]);

        return newList;
    }

    getNearbyFood(id, w, h) {
        const player = this.players[id];
        if(!player) return;

        const width = w ? w : player.radius;
        const height = h ? h : player.radius;

        const list = this.foodQuadTree.retrieve(player.pos, width, height);
        return this.removeDuplicates(list);
        
    }
    getNearbyPlayers(id, w, h) {
        const player = this.players[id];
        if(!player) return;

        const width = w ? w : player.radius;
        const height = h ? h : player.radius;

        const list = this.playersQuadTree.retrieve(player.pos, width, height);
        return this.removeDuplicates(list);
    }

    addFood() {
        const foodToAdd = 50;

        for(let i = 0; i < foodToAdd; i++){
            if(this.foodCount >= MAX_FOOD) return;
            // console.log(this.foodCount)
            const id = uuid();
            this.food[id] = new Food(id, this.getRandomPos());
            
            // Add to foodQuadTree
            this.foodQuadTree.insert(this.food[id])

            this.foodCount++;
        }
    }

    removeFood(id) {
        const food = this.food[id];
        if(!food) return;

        this.foodQuadTree.remove(food.pos, food.radius, food.radius);

        delete this.food[id];
        this.foodCount--;
    }

    getRandomPos() {
        return {
            x: Math.floor(Math.random() * this.width),
            y: Math.floor(Math.random() * this.height)
        }
    }

    restartBoard() {
        this.players = {};
        this.playersQuadTree.clear();
        this.playerCount = 0;

        this.food = {};
        this.foodQuadTree.clear();
        this.foodCount = 0;
    }

    calcArea(radius) {
        return Math.PI * radius * radius;
    }
    calcDistanceSqr(a, b) {
        const x = a.x - b.x;
        const y = a.y - b.y;
    
        return x*x + y*y;
    }
    calcSqr(a) {
        return a*a;
    }
}

module.exports = Board;