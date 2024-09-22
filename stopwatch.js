let timer;
let elapsedTime = 0;
let startTime = 0;
let running = false;

// Start the stopwatch
function start() {
    if (!running) {
        startTime = Date.now() - elapsedTime; 
        timer = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            updateDisplay();
        }, 1000); 
        running = true;
    }
}

// Stop the stopwatch
function stop() {
    if (running) {
        clearInterval(timer);
        elapsedTime = Date.now() - startTime;
        running = false;
    }
}

function reset() {
    clearInterval(timer);
    elapsedTime = 0;
    running = false;
    updateDisplay();  
}

function updateDisplay() {
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    document.getElementById("display").innerHTML = 
        `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(unit) {
    return unit < 10 ? "0" + unit : unit;
}
