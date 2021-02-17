const params = {
    ability: {
        maneuver: { min: 0.4, max: 1.0, paramMin: 0.0, paramMax: 1.0, paramStep: 0.01 },
        speed: { min: 15.0, max: 30.0, paramMin: 0.0, paramMax: 100.0, paramStep: 0.1 },
        sightRange: { min: 10.0, max: 15.0, paramMin: 0.0, paramMax: 100.0, paramStep: 1.0 },
        avoidRange: { min: 4.0, max: 4.0, paramMin: 0.0, paramMax: 10.0, paramStep: 1.0 },
        matchRange: { min: 5.0, max: 5.0, paramMin: 0.0, paramMax: 10.0, paramStep: 1.0 },
    },
    priorities: {
        stayClose: 0.5,
        toCenter: 0.12,
        awayFromOthers: 0.14,
        matchVelocity: 0.10,
        noise: 0.14
    },
    scale: {
        spawn: {
            count: 1200,
            range: 100
        },
        roamDistance: 50.0,
        cameraDistance: 50,
        sightLimit: 100
    }
}

