function randomDirection() {
    return new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
    ).normalize();
}

function getValueByPercent(range, percent) {
    return (percent * (range.max - range.min)) + range.min;
}

const boids = [];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = params.scale.cameraDistance;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geom = new THREE.ConeBufferGeometry(0.3,1.0,24);
const mat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

function addLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const direct = new THREE.DirectionalLight(0xffffff, 1.0);
    direct.position.set(0,0,0);
    direct.target.position.set(-1,-1,0);
    scene.add(direct);
    scene.add(direct.target);
}

function addBoids() {
    for(let i = 0; i < params.spawn.count; i++) {
        let boid = {
            body: new THREE.Mesh(geom, mat),
            velocity: new THREE.Vector3(),
            maneuverPercent: Math.random(),
            speedPercent: Math.random(),
            sightRangePercent: Math.random(),
            avoidRangePercent: Math.random(),
            matchRangePercent: Math.random()
        };
        boid.body.position.copy(randomDirection()).multiplyScalar(Math.random() * params.spawn.range);
        boid.velocity.copy(randomDirection()).multiplyScalar(getValueByPercent(params.ability.speed, boid.speedPercent));
        boids.push(boid);
        scene.add(boid.body);
    }
}

function getTargetVelocity(boid, boidsTree) {
    const epsilon = 1e-3;
    
    let seenBoids = boidsTree.inRange(boid, getValueByPercent(params.ability.sightRange, boid.sightRangePercent));
    let toCenter = new THREE.Vector3();
    let awayFromOthers = new THREE.Vector3();
    let matchVelocity = new THREE.Vector3();
    let matchTotal = 0;
    seenBoids.forEach(otherPair => {
        let other = otherPair[0];
        let d = otherPair[1];
        toCenter.add(other.body.position);
        if(d < getValueByPercent(params.ability.avoidRange, boid.avoidRangePercent)) {
            let pushVec = new THREE.Vector3()
                .add(boid.body.position)
                .sub(other.body.position)
                .normalize()
                .multiplyScalar(Math.exp(-d));
            awayFromOthers.add(pushVec);
        }
        if(d < getValueByPercent(params.ability.matchRange, boid.matchRangePercent)) {
            matchVelocity.add(other.velocity);
            matchTotal++;
        }
    });
    toCenter.divideScalar(seenBoids.length + epsilon).sub(boid.body.position).normalize();
    awayFromOthers.normalize();
    matchVelocity.divideScalar(matchTotal + epsilon).normalize();

    let stayClose = new THREE.Vector3();
    let dist = boid.body.position.length();
    if(dist > params.scale.roamDistance) {
        stayClose.sub(boid.body.position).normalize()
            .multiplyScalar(Math.min((dist - params.scale.roamDistance) / 10.0, 1.0));
    }
    
    return new THREE.Vector3()
        .addScaledVector(stayClose, 0.5)
        .addScaledVector(toCenter, 0.12)
        .addScaledVector(awayFromOthers, 0.14)
        .addScaledVector(matchVelocity, 0.10)
        .addScaledVector(randomDirection(), 0.14)
        .normalize().multiplyScalar(getValueByPercent(params.ability.speed, boid.speedPercent));
}

function update(delta) {
    delta = Math.min(delta, 0.1);

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
        let target = getTargetVelocity(boid, boidsTree);
        boid.velocity.lerp(target, delta * getValueByPercent(params.ability.maneuver, boid.maneuverPercent));
        boid.body.rotation.setFromQuaternion(
            new THREE.Quaternion().setFromAxisAngle(
                new THREE.Vector3(0.0,1.0,0.0).cross(boid.velocity).normalize(),
                new THREE.Vector3(0.0,1.0,0.0).angleTo(boid.velocity)
            )
        );
        boid.body.position.addScaledVector(boid.velocity, delta);
    });
}

function tick(prevTick) {
    let currTick = new Date();
	requestAnimationFrame(() => tick(currTick));
    update((currTick - prevTick) / 1000);
    camera.position.z = params.scale.cameraDistance;
	renderer.render(scene, camera);
}


addLights();
addBoids();
tick(new Date());
