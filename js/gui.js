const gui = new dat.GUI();

// Ability
let ability = gui.addFolder("Ability");
for(let a in params.ability) {
    ability.add(params.ability[a], "min", params.ability[a].paramMin, params.ability[a].paramMax, params.ability[a].paramStep).name(a+"Min");
    ability.add(params.ability[a], "max", params.ability[a].paramMin, params.ability[a].paramMax, params.ability[a].paramStep).name(a+"Max");
}

// Priorities
let priorities = gui.addFolder("Priorities");
for(let p in params.priorities) {
    priorities.add(params.priorities, p, 0.0, 1.0, 0.01);
}

// Scale
let scale = gui.addFolder("Scale");
scale.add(params.scale, "roamDistance", 10, 200, 1);
scale.add(params.scale, "cameraDistance", 0, 200, 1);
scale.add(params.scale, "sightLimit", 1, 500, 1);
scale.add(params.scale.spawn, "count", 1, 5000, 1).name("spawnCount");
scale.add(params.scale.spawn, "range", 10, 500, 1).name("spawnRange");

gui.add({ func: () => {
    resetBoids();
}}, "func").name("Reset Simulation");
