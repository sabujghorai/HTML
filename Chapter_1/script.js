const micButton =
    document.getElementById("micButton");

const statusText =
    document.getElementById("statusText");

const statusDot =
    document.getElementById("statusDot");


let audioContext = null;
let analyser = null;
let microphone = null;

let listening = false;


// --------------------------------------------------
// START MICROPHONE
// --------------------------------------------------

async function startMicrophone() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });


        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        analyser =
            audioContext.createAnalyser();


        analyser.fftSize = 512;

        analyser.smoothingTimeConstant = 0.75;


        microphone =
            audioContext.createMediaStreamSource(
                stream
            );


        microphone.connect(analyser);


        listening = true;


        micButton.textContent =
            "STOP LISTENING";


        statusText.textContent =
            "LISTENING";


        statusDot.classList.add(
            "active"
        );


        detectVoice();


    } catch (error) {

        console.error(error);

        statusText.textContent =
            "MICROPHONE BLOCKED";

        alert(
            "Microphone permission is required for voice animation."
        );
    }
}


// --------------------------------------------------
// STOP MICROPHONE
// --------------------------------------------------

function stopMicrophone() {

    listening = false;


    if (microphone) {

        microphone.disconnect();

        microphone = null;
    }


    if (audioContext) {

        audioContext.close();

        audioContext = null;
    }


    setSpeechPower(0);


    micButton.textContent =
        "START LISTENING";


    statusText.textContent =
        "MIRA READY";


    statusDot.classList.remove(
        "active"
    );
}


// --------------------------------------------------
// DETECT VOICE
// --------------------------------------------------

function detectVoice() {

    if (!listening || !analyser) {
        return;
    }


    const data =
        new Uint8Array(
            analyser.fftSize
        );


    analyser.getByteTimeDomainData(
        data
    );


    let sum = 0;


    for (let i = 0; i < data.length; i++) {

        const value =
            (data[i] - 128) / 128;

        sum += value * value;
    }


    const rms =
        Math.sqrt(
            sum / data.length
        );


    /*
        Noise gate.

        Small microphone noise
        won't make the orb move.
    */

    const noiseGate = 0.025;


    let voice = 0;


    if (rms > noiseGate) {

        voice =
            (rms - noiseGate) /
            (0.25 - noiseGate);

        voice =
            Math.min(Math.max(voice, 0), 1);
    }


    /*
        Make the response smoother.
    */

    voice =
        Math.pow(voice, 0.65);


    setSpeechPower(voice);


    if (voice > 0.08) {

        statusText.textContent =
            "MIRA LISTENING";

    } else {

        statusText.textContent =
            "LISTENING";
    }


    requestAnimationFrame(
        detectVoice
    );
}


// --------------------------------------------------
// BUTTON
// --------------------------------------------------

micButton.addEventListener(
    "click",
    () => {

        if (!listening) {

            startMicrophone();

        } else {

            stopMicrophone();
        }
    }
);