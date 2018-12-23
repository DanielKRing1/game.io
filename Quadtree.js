const Rect = require('./Rect');

const MAX_OBJECTS = 10;
const MAX_LEVELS = 4;

let Quadtree = class {
    constructor(level, bounds) {
        this.level = level;
        this.bounds = bounds;
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

    getQuads(player) {
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
        if(player.pos.x - player.radius <= midX) sides.l = true;
        if(player.pos.x + player.radius >= midX) sides.r = true;
        if(player.pos.y - player.radius <= midY) sides.u = true;
        if(player.pos.y + player.radius >= midY) sides.d = true;

        // Determine corresponding quadrant
        if(sides.l && sides.u) quads.push(0);
        if(sides.l && sides.d) quads.push(1);
        if(sides.r && sides.d) quads.push(2);
        if(sides.r && sides.u) quads.push(3);

        return quads;
    }

    insert(player) {
        // If quad has already split
        if(this.nodes[0]) {
            const quads = this.getQuads(player);

            quads.forEach(quad => {
                this.nodes[quad].insert(player);
            });

            return;
        }

        this.objects.push(player);

        // Too many players in quad, split
        if(this.objects.length > MAX_OBJECTS && this.level < MAX_LEVELS) {
            this.split();

            while(this.objects.length > 0){
                const poppedPlayer = this.objects.pop();
                const quads = this.getQuads(poppedPlayer);

                quads.forEach(quad => {
                    this.nodes[quad].insert(poppedPlayer);
                });
            }
        }
    }

    retrieve(player) {
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

        const quads = this.getQuads(player);

        // if(this.nodes[0]) {
            quads.forEach(quad => {
                const list = this.nodes[quad].retrieve(player);
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