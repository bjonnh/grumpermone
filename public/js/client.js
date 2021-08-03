function setupSpeech(socket) {
    if ("webkitSpeechRecognition" in window) {
        let speechRecognition = new webkitSpeechRecognition();
        let final_transcript = "";

        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.lang = "en-US";

        speechRecognition.onstart = () => {
            document.querySelector("#status").textContent = "Listening";
        };
        speechRecognition.onerror = () => {
            document.querySelector("#status").textContent = "Sorry it failed";
            console.log("Speech Recognition Error");
        };
        speechRecognition.onend = () => {
            document.querySelector("#status").textContent = "Finished";
            console.log("Speech Recognition Ended");
            socket.emit('say', {text: final_transcript});
            final_transcript = "";
        };

        speechRecognition.onresult = (event) => {
            let interim_transcript = "";

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript += event.results[i][0].transcript;
                } else {
                    interim_transcript += event.results[i][0].transcript;
                }
            }
        };

        document.querySelector("#startBtn").onclick = () => {
            speechRecognition.start();
        };
        document.querySelector("#stopBtn").onclick = () => {
            speechRecognition.stop();
        };
    } else {
        console.log("Speech Recognition Not Available");
    }

}

function playOutput(arrayBuffer){
    let audioContext = new AudioContext();
    let outputSource;
    try {
        if(arrayBuffer.byteLength > 0){
            console.log(arrayBuffer.byteLength);
            audioContext.decodeAudioData(arrayBuffer,
                function(buffer){
                    audioContext.resume();
                    outputSource = audioContext.createBufferSource();
                    outputSource.connect(audioContext.destination);
                    outputSource.buffer = buffer;
                    outputSource.start(0);
                },
                function(){
                    console.log(arguments);
                });
        }
    } catch(e) {
        console.log(e);
    }
}

(function connect(){
    let socket = io.connect('http://localhost:8080')

    setupSpeech(socket);

    socket.on('audio', function (data) {
        console.log(data);
        playOutput(data);
    });

})()
