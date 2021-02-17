function randomDirection() {
    return new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
    ).normalize();
}

function randomRange(min, max) {
    return (Math.random() * (max - min)) + min;
}

const boids = [];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 80;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function addLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const direct = new THREE.DirectionalLight(0xffffff, 1.0);
    direct.position.set(0,0,0);
    direct.target.position.set(-1,-1,0);
    scene.add(direct);
    scene.add(direct.target);
}

function addBoids(n) {
    for(let i = 0; i < n; i++) {
        let boid = {
            body: new THREE.Mesh(
                new THREE.ConeGeometry(0.3,1.0,24),
                new THREE.MeshPhongMaterial( { color: 0x00ff00 } )
            ),
            velocity: new THREE.Vector3(),
            maneuver: randomRange(0.4, 1.0),
            maxSpeed: randomRange(5.0, 15.0),
            sightRange: randomRange(10.0, 15.0),
            avoidRange: 5.0,
            matchRange: 5.0
        };
        boid.body.position.copy(randomDirection()).multiplyScalar(Math.random() * 100.0);
        boid.velocity.copy(randomDirection()).multiplyScalar(boid.maxSpeed);
        boids.push(boid);
        scene.add(boid.body);
    }
}

function update(delta) {
    delta = Math.min(delta, 0.1);
    const epsilon = 1e-3;

    // Build tree
    let boidsTree = new Tree(
        (boid1, boid2, dim) => {
            let p1 = boid1.body.position;
            let p2 = boid2.body.position;
            let vals1 = [p1.x, p1.y, p1.z];
            let vals2 = [p2.x, p2.y, p2.z];
            return vals1[dim] < vals2[dim];
        },
        (boid1, boid2) => boid1.body.position.distanceTo(boid2.body.position)
    );
    boids.forEach(boid => boidsTree.insert(boid));

    // Update boids
    boidsTree.forEach(boid => {
        let seenBoids = boidsTree.inRange(boid, boid.sightRange);
        let toCenter = new THREE.Vector3();
        let awayFromOthers = new THREE.Vector3();
        let matchVelocity = new THREE.Vector3();
        let matchTotal = 0;
        seenBoids.forEach(other => {
            toCenter.add(other.body.position);
            let d = boid.body.position.distanceTo(other.body.position);
            if(d < boid.avoidRange) {
                let pushVec = new THREE.Vector3()
                    .add(boid.body.position)
                    .sub(other.body.position)
                    .normalize()
                    .multiplyScalar(Math.exp(-d));
                awayFromOthers.add(pushVec);
            }
            if(d < boid.matchRange) {
                matchVelocity.add(other.velocity);
                matchTotal++;
            }
        });
        toCenter.divideScalar(seenBoids.length + epsilon).sub(boid.body.position);
        matchVelocity.divideScalar(matchTotal + epsilon);

        let stayClose = new THREE.Vector3();
        if(boid.body.position.length() > 50.0) {
            stayClose.sub(boid.body.position).normalize();
        }
        
        let target = new THREE.Vector3()
            .addScaledVector(stayClose, 0.5)
            .addScaledVector(toCenter, 0.10)
            .addScaledVector(awayFromOthers, 0.10)
            .addScaledVector(matchVelocity, 0.10)
            .addScaledVector(randomDirection(), 0.20)
            .normalize().multiplyScalar(boid.maxSpeed);

        // Apply changes to model
        boid.velocity.lerp(target, delta * boid.maneuver);
        boid.body.rotation.setFromQuaternion(
            new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(0.0,1.0,0.0).cross(boid.velocity).normalize(),
                new THREE.Vector3(0.0,1.0,0.0).angleTo(boid.velocity)
            )
        );
        let speed = boid.velocity.length();
        if(speed > boid.maxSpeed) {
            boid.velocity.multiplyScalar(boid.maxSpeed / speed);
        }
        boid.body.position.addScaledVector(boid.velocity, delta);
    });
}

function tick(prevTick) {
    let currTick = new Date();
	requestAnimationFrame(() => tick(currTick));
    update((currTick - prevTick) / 1000);
	renderer.render(scene, camera);
}


addLights();
addBoids(1200);
tick(new Date());
