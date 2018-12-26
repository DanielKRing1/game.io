const Rect = require('./Rect');

let Quadtree = class {
    constructor(level, bounds, maxObjects, maxLevels) {
        this.level = level;
        this.bounds = bounds;
        this.maxObjects = maxObjects;
        this.maxLevels = maxLevels;
        this.objects = [];
        this.nodes = [];
    }

    clear() {
        this.objects = [];

        this.nodes.forEach(node => {
            node.clear();
            node = undefined;
        });
    }

    // Populates 4 nodes with new Quadtrees
    split() {
        const x = this.bounds.x;
        const y = this.bounds.y;
        const halfWidth = this.bounds.width/2;
        const halfHeight = this.bounds.height/2;
        
        this.nodes[0] = new Quadtree(this.level+1, new Rect(x, y+halfHeight, halfWidth, halfHeight));
        this.nodes[1] = new Quadtree(this.level+1, new Rect(x, y, halfWidth, halfHeight));
        this.nodes[2] = new Quadtree(this.level+1, new Rect(x+halfWidth, y, halfWidth, halfHeight));
        this.nodes[3] = new Quadtree(this.level+1, new Rect(x+halfWidth, y+halfHeight, halfWidth, halfHeight));
    }

    getQuads(pos, width, height) {
        // Which quadrant player lies in
        let quads = [];
        let sides = {
            l: false,
            r: false,
            u: false,
            d: false
        }

        const midX = this.bounds.x + this.bounds.width/2;
        const midY = this.bounds.y + this.bounds.height/2;

        // Test sides player falls in pnly once
        if(pos.x - width <= midX) sides.l = true;
        if(pos.x + width >= midX) sides.r = true;
        if(pos.y - height <= midY) sides.u = true;
        if(pos.y + height >= midY) sides.d = true;

        // Determine corresponding quadrant
        if(sides.l && sides.u) quads.push(0);
        if(sides.l && sides.d) quads.push(1);
        if(sides.r && sides.d) quads.push(2);
        if(sides.r && sides.u) quads.push(3);

        return quads;
    }

    insert(obj) {
        // If quad has already split
        if(this.nodes[0]) {
            const quads = this.getQuads(obj.pos, obj.radius, obj.radius);

            quads.forEach(quad => {
                this.nodes[quad].insert(obj);
            });

            return;
        }

        this.objects.push(obj);

        // Too many players in quad, split
        if(this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            this.split();

            while(this.objects.length > 0){
                const poppedPlayer = this.objects.pop();
                const quads = this.getQuads(poppedPlayer.pos, poppedPlayer.radius, poppedPlayer.radius);

                quads.forEach(quad => {
                    this.nodes[quad].insert(poppedPlayer);
                });
            }
        }
    }

    remove(pos, width, height) {
        // If lowest level
        if(!this.nodes[0]) {
            this.objects = this.objects.filter(obj => {
                if(obj.pos.x === pos.x && obj.pos.y === pos.y) {
                    return false;
                }
                return true;
            });
            return;
        }

        const quads = this.getQuads(pos, width, height);
        quads.forEach(quad => {
            this.nodes[quad].remove(pos, width, height);
        });
    }

    retrieve(pos, width, height) {
        // if(this.nodes[0]) {
        //     const quads = this.getQuads(player);
        //     quads.forEach(quad => {
        //         retrievedObjects.concat(this.nodes[quad].retrieve(retrievedObjects, player));
        //     });
        // }

        // retrievedObjects = retrievedObjects.concat(this.objects);
        // if(this.level === 0) console.log(retrievedObjects)
        // return retrievedObjects;

        if(!this.nodes[0]) {
            return this.objects;
        }

        let retrievedObjects = [];

        const quads = this.getQuads(pos, width, height);
        // console.log(quads);

        // if(this.nodes[0]) {
            quads.forEach(quad => {
                const list = this.nodes[quad].retrieve(pos, width, height);
                retrievedObjects = retrievedObjects.concat(list);
            });
        // }

        return retrievedObjects;
    }

    print() {
        if(this.nodes[0]){
            this.nodes.forEach(node => {
                node.print();
            });

            return;
        }

        console.log(this.level);
        console.log(this.objects)
    }
}

module.exports = Quadtree;