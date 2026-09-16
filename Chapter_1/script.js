const canvas =
    document.getElementById("orbCanvas");

const ctx =
    canvas.getContext("2d");


let W;
let H;
let DPR;

let cx;
let cy;

let radius;


/* ==========================================
   ORB SETTINGS
========================================== */

const LATITUDE_LINES = 68;

const DOTS_PER_LINE = 76;

const particles = [];

let rotation = 10;

let voiceLevel = 0;

let targetVoiceLevel = 0;


/* ==========================================
   RESIZE
========================================== */

function resize() {

    DPR =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );


    W =
        canvas.clientWidth;

    H =
        canvas.clientHeight;


    canvas.width =
        W * DPR;

    canvas.height =
        H * DPR;


    ctx.setTransform(
        DPR,
        0,
        0,
        DPR,
        0,
        0
    );


    cx =
        W / 2;

    cy =
        H / 2;


    /*
        SMALLER ORB

        Previously the orb was very large.
        Now it occupies around 55%
        of the orb area.
    */

    radius =
        Math.min(W, H) * 0.275;
}


window.addEventListener(
    "resize",
    resize
);

resize();


/* ==========================================
   CREATE PARTICLES
========================================== */

for (
    let lat = 0;
    lat < LATITUDE_LINES;
    lat++
) {

    const v =
        (lat + 0.5) /
        LATITUDE_LINES;


    const phi =
        Math.PI * v;


    const sinPhi =
        Math.sin(phi);


    const cosPhi =
        Math.cos(phi);


    for (
        let i = 0;
        i < DOTS_PER_LINE;
        i++
    ) {

        const u =
            i / DOTS_PER_LINE;


        const theta =
            u *
            Math.PI *
            2;


        particles.push({

            theta:
                theta +
                (Math.random() - 0.5)
                * 0.004,

            phi:
                phi +
                (Math.random() - 0.5)
                * 0.004,

            size:
                0.65 +
                Math.random() * 0.65,

            brightness:
                0.70 +
                Math.random() * 0.30,

            offset:
                Math.random() *
                Math.PI *
                2

        });
    }
}


/* ==========================================
   COLOR
========================================== */

function getColor(
    x,
    brightness
) {

    const t =
        (x + 1) / 2;


    let r;
    let g;
    let b;


    /*
        YELLOW
          ↓
        GREEN
          ↓
        CYAN
          ↓
        BLUE
    */


    if (t < 0.30) {

        const p =
            t / 0.30;


        r =
            255 -
            225 * p;


        g =
            235 +
            20 * p;


        b =
            10 +
            60 * p;

    }

    else if (t < 0.58) {

        const p =
            (t - 0.30) /
            0.28;


        r =
            30 -
            30 * p;


        g =
            255;


        b =
            70 +
            155 * p;

    }

    else {

        const p =
            (t - 0.58) /
            0.42;


        r =
            0;


        g =
            255 -
            180 * p;


        b =
            225 +
            30 * p;
    }


    r *= brightness;

    g *= brightness;

    b *= brightness;


    return `
        rgb(
            ${r},
            ${g},
            ${b}
        )
    `;
}


/* ==========================================
   DRAW ORB
========================================== */

function draw(time) {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    /* Smooth voice animation */

    voiceLevel +=
        (
            targetVoiceLevel -
            voiceLevel
        ) * 0.10;


    /* Slow rotation */

    rotation +=
        0.0022 +
        voiceLevel * 0.002;


    /*
        Speech makes the orb
        slightly larger.
    */

    const scale =
        1 +
        voiceLevel * 0.18;


    const currentRadius =
        radius * scale;


    /* ======================================
       PARTICLES
    ====================================== */

    for (const p of particles) {

        const theta =
            p.theta +
            rotation;


        const phi =
            p.phi;


        const sinPhi =
            Math.sin(phi);


        const cosPhi =
            Math.cos(phi);


        let x =
            sinPhi *
            Math.cos(theta);


        let y =
            cosPhi;


        let z =
            sinPhi *
            Math.sin(theta);


        /*
            Very subtle organic movement.
        */

        const movement =
            Math.sin(
                time * 0.0014 +
                p.offset
            ) * 0.004;


        x += movement;

        y +=
            movement * 0.4;


        /*
            Hide the back side.
        */

        if (z < -0.08) {

            continue;
        }


        /*
            Depth.
        */

        const depth =
            (z + 1) / 2;


        const perspective =
            0.82 +
            depth * 0.18;


        const screenX =
            cx +
            x *
            currentRadius *
            perspective;


        const screenY =
            cy +
            y *
            currentRadius *
            perspective;


        /*
            Edge brightness.
        */

        const distance =
            Math.sqrt(
                x * x +
                y * y
            );


        const edge =
            Math.pow(
                Math.min(
                    distance,
                    1
                ),
                2.1
            );


        /*
            Keep the center dark.
        */

        const centerBrightness =
            0.30 +
            edge * 0.70;


        const depthBrightness =
            0.42 +
            depth * 0.68;


        const brightness =
            p.brightness *
            centerBrightness *
            depthBrightness *
            (
                1 +
                voiceLevel * 0.5
            );


        /*
            Small dots.
        */

        const size =
            p.size *
            perspective *
            (
                1 +
                voiceLevel * 0.35
            );


        const color =
            getColor(
                x,
                Math.min(
                    brightness,
                    1.2
                )
            );


        /*
            Draw dot.
        */

        ctx.beginPath();


        ctx.fillStyle =
            color;


        ctx.shadowColor =
            color;


        ctx.shadowBlur =
            voiceLevel > 0.08
                ? 3
                : 1.5;


        ctx.arc(
            screenX,
            screenY,
            size,
            0,
            Math.PI * 2
        );


        ctx.fill();
    }


    ctx.shadowBlur = 0;


    requestAnimationFrame(
        draw
    );
}


requestAnimationFrame(
    draw
);


/* ==========================================
   VOICE POWER
========================================== */

window.setSpeechPower =
    function (power) {

        targetVoiceLevel =
            Math.max(
                0,
                Math.min(
                    1,
                    power
                )
            );
    };