const canvas = document.getElementById("orbCanvas");
const ctx = canvas.getContext("2d");

let width;
let height;

let centerX;
let centerY;

let baseRadius = 190;

let rotationX = 0;
let rotationY = 0;

let speechPower = 0;
let targetSpeechPower = 0;

const particles = [];

const PARTICLE_COUNT = 2200;


// --------------------------------------------------
// RESIZE
// --------------------------------------------------

function resizeCanvas() {

    width = window.innerWidth;
    height = window.innerHeight;

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    centerX = width / 2;
    centerY = height / 2 - 20;

    baseRadius = Math.min(width, height) * 0.19;
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


// --------------------------------------------------
// CREATE PARTICLES
// --------------------------------------------------

for (let i = 0; i < PARTICLE_COUNT; i++) {

    const theta = Math.random() * Math.PI * 2;

    const phi = Math.acos(
        1 - 2 * Math.random()
    );

    const x = Math.sin(phi) * Math.cos(theta);
    const y = Math.sin(phi) * Math.sin(theta);
    const z = Math.cos(phi);

    particles.push({

        x,
        y,
        z,

        theta,
        phi,

        size: 0.7 + Math.random() * 1.7,

        brightness: 0.45 + Math.random() * 0.55,

        speed:
            0.00015 +
            Math.random() * 0.00025,

        offset:
            Math.random() * Math.PI * 2

    });
}


// --------------------------------------------------
// COLOR
// --------------------------------------------------

function getParticleColor(x, z, brightness) {

    /*
        Left  = yellow/green
        Middle = cyan/green
        Right = cyan/blue
    */

    const normalizedX = (x + 1) / 2;

    let r;
    let g;
    let b;

    if (normalizedX < 0.45) {

        const t = normalizedX / 0.45;

        r = 255 * (1 - t) + 0 * t;
        g = 220 * (1 - t) + 255 * t;
        b = 20 * (1 - t) + 150 * t;

    } else {

        const t = (normalizedX - 0.45) / 0.55;

        r = 0;
        g = 255 * (1 - t) + 80 * t;
        b = 150 * (1 - t) + 255 * t;
    }

    r *= brightness;
    g *= brightness;
    b *= brightness;

    return `rgb(${r}, ${g}, ${b})`;
}


// --------------------------------------------------
// 3D ROTATION
// --------------------------------------------------

function rotatePoint(x, y, z, angleX, angleY) {

    // Rotate around Y

    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    let x1 = x * cosY - z * sinY;
    let z1 = x * sinY + z * cosY;

    // Rotate around X

    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);

    let y1 = y * cosX - z1 * sinX;
    let z2 = y * sinX + z1 * cosX;

    return {
        x: x1,
        y: y1,
        z: z2
    };
}


// --------------------------------------------------
// DRAW ORB
// --------------------------------------------------

function drawOrb(time) {

    ctx.clearRect(0, 0, width, height);

    // Slowly rotate

    rotationY += 0.0025;
    rotationX += 0.0007;


    // Smooth voice response

    speechPower +=
        (targetSpeechPower - speechPower) * 0.12;


    // Voice expansion

    const voiceScale =
        1 + speechPower * 0.30;


    const radius =
        baseRadius * voiceScale;


    // Draw particles

    for (const particle of particles) {

        const rotated = rotatePoint(
            particle.x,
            particle.y,
            particle.z,
            rotationX,
            rotationY
        );


        // Organic movement

        const wave =
            Math.sin(
                time * 0.0015 +
                particle.offset
            ) * 0.012;


        const px =
            rotated.x * (radius + wave * radius);


        const py =
            rotated.y * (radius + wave * radius);


        const depth =
            (rotated.z + 1) / 2;


        /*
            Perspective.
            Particles closer to camera appear larger.
        */

        const perspective =
            0.75 + depth * 0.55;


        const screenX =
            centerX + px * perspective;


        const screenY =
            centerY + py * perspective;


        // Hide particles behind the sphere

        if (rotated.z < -0.05) {
            continue;
        }


        // Voice makes dots brighter

        const brightness =
            particle.brightness *
            (0.55 + depth * 0.75) *
            (1 + speechPower * 1.5);


        const size =
            particle.size *
            perspective *
            (1 + speechPower * 0.9);


        const color =
            getParticleColor(
                rotated.x,
                rotated.z,
                Math.min(brightness, 1.5)
            );


        // Glow

        ctx.beginPath();

        ctx.fillStyle = color;

        ctx.shadowBlur =
            3 + speechPower * 8;

        ctx.shadowColor = color;

        ctx.arc(
            screenX,
            screenY,
            size,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }


    // Remove shadow after drawing

    ctx.shadowBlur = 0;


    // Soft outer glow

    const glowRadius =
        radius * 1.05;


    const gradient =
        ctx.createRadialGradient(
            centerX,
            centerY,
            radius * 0.5,

            centerX,
            centerY,
            glowRadius
        );


    gradient.addColorStop(
        0,
        "rgba(0, 210, 255, 0)"
    );

    gradient.addColorStop(
        0.75,
        `rgba(0, 200, 255, ${0.015 + speechPower * 0.04})`
    );

    gradient.addColorStop(
        1,
        `rgba(0, 140, 255, ${0.05 + speechPower * 0.12})`
    );


    ctx.beginPath();

    ctx.fillStyle = gradient;

    ctx.arc(
        centerX,
        centerY,
        glowRadius,
        0,
        Math.PI * 2
    );

    ctx.fill();


    requestAnimationFrame(drawOrb);
}


// Start animation

requestAnimationFrame(drawOrb);


// --------------------------------------------------
// VOICE CONTROL
// --------------------------------------------------

window.setSpeechPower = function(power) {

    targetSpeechPower =
        Math.min(Math.max(power, 0), 1);

};