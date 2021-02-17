class Tree {
    constructor(lessThan, getDist) {
        this.x = null;
        this.left = null;
        this.right = null;
        this.lessThan = lessThan;
        this.getDist = getDist;
    }

    insert(x, dim=0) {
        if(this.x == null) {
            this.x = x;
        }else if(this.lessThan(x, this.x, dim)) {
            if(this.left == null) {
                this.left = new Tree(this.lessThan, this.getDist);
            }
            this.left.insert(x, (dim+1) % 3);
        }else {
            if(this.right == null) {
                this.right = new Tree(this.lessThan, this.getDist);
            }
            this.right.insert(x, (dim+1) % 3);
        }
    }

    inRange(x, range, dim=0) {
        if(this.x != null) {
            let less = this.lessThan(x, this.x, dim);
            let dist = this.getDist(this.x, x);
            if(dist <= range) {
                let elems = [[this.x, dist]];
                if(this.left) {
                    Array.prototype.push.apply(elems, this.left.inRange(x, range, (dim+1) % 3));
                }
                if(this.right) {
                    Array.prototype.push.apply(elems, this.right.inRange(x, range, (dim+1) % 3));
                }
                return elems;
            }else if(this.left && less) {
                return this.left.inRange(x, range, (dim+1) % 3);
            }else if(this.right && !less) {
                return this.right.inRange(x, range, (dim+1) % 3);
            }
        }
        return [];
    }

    forEach(func) {
        if(this.x) {
            func(this.x);
        }
        if(this.left) {
            this.left.forEach(func);
        }
        if(this.right) {
            this.right.forEach(func);
        }
    }
}