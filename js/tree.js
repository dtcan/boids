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
                let elems = [];
                if(this.left) {
                    elems = this.left.inRange(x, range, (dim+1) % 3);
                }
                if(this.right) {
                    let rightElems = this.right.inRange(x, range, (dim+1) % 3);
                    if(elems.length > 0) {
                        // Merge lists
                        let newElems = [];
                        let i = 0;
                        let j = 0;
                        while(i < elems.length && j < rightElems.length) {
                            if(elems[i][1] < rightElems[j][1]) {
                                newElems.push(elems[i]);
                                i++;
                            }else {
                                newElems.push(rightElems[j]);
                                j++;
                            }
                        }
                        while(i < elems.length) {
                            newElems.push(elems[i]);
                            i++;
                        }
                        while(j < rightElems.length) {
                            newElems.push(rightElems[j]);
                            j++;
                        }
                        elems = newElems;
                    }else {
                        elems = rightElems;
                    }
                }

                // Insert this node
                let a = 0;
                let b = elems.length;
                while(a < b) {
                    let m = Math.floor((a + b) / 2);
                    if(elems[m][1] == dist) {
                        break;
                    }else if(elems[m][1] < dist) {
                        a = m + 1;
                    }else {
                        b = m;
                    }
                }
                elems.splice(a, 0, [this.x, dist]);
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
