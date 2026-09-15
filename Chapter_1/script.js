let audioContext = null;

let analyser = null;

let microphone = null;

let microphoneStream = null;

let listening = false;


const speechText =
    document.getElementById(
        "speechText"
    );


const speechArea =
    document.getElementById(
        "speechArea"
    );


/* ==========================================
   SPEECH RECOGNITION
========================================== */

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition = null;


let finalText = "";

let interimText = "";


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-IN";


    /*
        Keep listening after pauses.
    */

    recognition.onend =
        function() {

            if (listening) {

                try {

                    recognition.start();

                } catch (error) {

                    console.log(
                        "Recognition restarting..."
                    );
                }
            }
        };


    /*
        Speech result.
    */

    recognition.onresult =
        function(event) {

            interimText = "";


            for (
                let i =
                    event.resultIndex;

                i <
                event.results.length;

                i++
            ) {

                const result =
                    event.results[i];


                const text =
                    result[0].transcript;


                if (
                    result.isFinal
                ) {

                    finalText +=
                        text + " ";

                }

                else {

                    interimText +=
                        text;
                }
            }


            /*
                Display final +
                currently spoken words.
            */

            const displayText =
                (
                    finalText +
                    interimText
                ).trim();


            if (displayText.length > 0) {

                speechText.textContent =
                    displayText;

                speechText.classList.remove(
                    "placeholder"
                );
            }
        };


    recognition.onerror =
        function(event) {

            console.log(
                "Speech recognition:",
                event.error
            );
        };

}


/* ==========================================
   START MICROPHONE
========================================== */

async function startListening() {

    try {

        microphoneStream =
            await navigator.mediaDevices
                .getUserMedia({

                    audio: {

                        echoCancellation: true,

                        noiseSuppression: true,

                        autoGainControl: true
                    }

                });


        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        analyser =
            audioContext.createAnalyser();


        analyser.fftSize =
            512;


        analyser.smoothingTimeConstant =
            0.75;


        microphone =
            audioContext
                .createMediaStreamSource(
                    microphoneStream
                );


        microphone.connect(
            analyser
        );


        listening = true;


        speechArea.classList.add(
            "active"
        );


        /*
            Start speech recognition.
        */

        if (recognition) {

            finalText = "";

            interimText = "";


            speechText.textContent =
                "Listening...";


            speechText.classList.add(
                "placeholder"
            );


            try {

                recognition.start();

            } catch (error) {

                console.log(
                    "Recognition already running."
                );
            }
        }


        analyseVoice();


    } catch (error) {

        console.error(
            "Microphone error:",
            error
        );


        speechText.textContent =
            "Microphone permission required.";

    }
}


/* ==========================================
   VOICE ANALYSIS
========================================== */

function analyseVoice() {

    if (
        !listening ||
        !analyser
    ) {

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


    for (
        let i = 0;
        i < data.length;
        i++
    ) {

        const value =
            (
                data[i] -
                128
            ) / 128;


        sum +=
            value * value;
    }


    const rms =
        Math.sqrt(
            sum /
            data.length
        );


    /*
        Microphone noise gate.
    */

    const noiseGate =
        0.018;


    let level = 0;


    if (
        rms >
        noiseGate
    ) {

        level =
            (
                rms -
                noiseGate
            ) / 0.22;


        level =
            Math.min(
                Math.max(
                    level,
                    0
                ),
                1
            );
    }


    /*
        Make speech response
        smooth and natural.
    */

    level =
        Math.pow(
            level,
            0.58
        );


    if (
        typeof window.setSpeechPower ===
        "function"
    ) {

        window.setSpeechPower(
            level
        );
    }


    requestAnimationFrame(
        analyseVoice
    );
}


/* ==========================================
   START WHEN USER CLICKS
========================================== */

document.addEventListener(
    "click",
    function startOnce() {

        if (!listening) {

            startListening();

        }

    },
    {
        once: true
    }
);