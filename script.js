const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let grid = [];
let gridSize = parseInt(document.getElementById("gridSizeInput").value);
let cellSize = canvas.width / gridSize;
let simulationTimeout = null;
let running = false;

function getIntervalDelay() {
    const slider = document.getElementById("speedSlider");
    const minSpeed = parseInt(slider.min);
    const maxSpeed = parseInt(slider.max);
    const sliderValue = parseInt(slider.value);
    return maxSpeed + minSpeed - sliderValue;
}

function initGrid() {
    grid = [];
    for (let i = 0; i < gridSize; i++) {
        grid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            grid[i][j] = 0;
        }
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.fillStyle = grid[i][j] === 1 ? "#000" : "#fff";
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            ctx.strokeStyle = "#ccc";
            ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
}

function nextGeneration() {
    const newGrid = [];
    for (let i = 0; i < gridSize; i++) {
        newGrid[i] = [];
        for (let j = 0; j < gridSize; j++) {
            let aliveNeighbors = 0;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (x === 0 && y === 0) continue;
                    const ni = (i + x + gridSize) % gridSize;
                    const nj = (j + y + gridSize) % gridSize;
                    aliveNeighbors += grid[ni][nj];
                }
            }
            newGrid[i][j] = grid[i][j] === 1
                ? ((aliveNeighbors === 2 || aliveNeighbors === 3) ? 1 : 0)
                : (aliveNeighbors === 3 ? 1 : 0);
        }
    }
    grid = newGrid;
    drawGrid();
}

function simulationStep() {
    if (!running) return;
    nextGeneration();
    simulationTimeout = setTimeout(simulationStep, getIntervalDelay());
}

function startSimulation() {
    if (!running) {
        running = true;
        simulationStep();
    }
}

function stopSimulation() {
    running = false;
    clearTimeout(simulationTimeout);
    simulationTimeout = null;
}

function updateSpeed() {
    if (running) {
        clearTimeout(simulationTimeout);
        simulationTimeout = setTimeout(simulationStep, getIntervalDelay());
    }
}

function resetGrid() {
    stopSimulation();
    initGrid();
    drawGrid();
}

function resizeGrid() {
    stopSimulation();
    gridSize = parseInt(document.getElementById("gridSizeInput").value);
    cellSize = canvas.width / gridSize;
    initGrid();
    drawGrid();
}

function applyPattern() {
    resetGrid();
    const pattern = document.getElementById("patternSelect").value;
    const midRow = Math.floor(gridSize / 2);
    const midCol = Math.floor(gridSize / 2);
    if (pattern === "glider") {
        grid[midRow][midCol + 1] = 1;
        grid[midRow + 1][midCol + 2] = 1;
        grid[midRow + 2][midCol] = 1;
        grid[midRow + 2][midCol + 1] = 1;
        grid[midRow + 2][midCol + 2] = 1;
    } else if (pattern === "random") {
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                grid[i][j] = Math.random() > 0.8 ? 1 : 0;
            }
        }
    }
    drawGrid();
}

function toggleCell(e) {
    if (running) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const j = Math.floor(x / cellSize);
    const i = Math.floor(y / cellSize);
    if (i >= 0 && i < gridSize && j >= 0 && j < gridSize) {
        grid[i][j] = grid[i][j] ? 0 : 1;
        drawGrid();
    }
}

document.getElementById("startBtn").addEventListener("click", startSimulation);
document.getElementById("stopBtn").addEventListener("click", stopSimulation);
document.getElementById("resetBtn").addEventListener("click", resetGrid);
document.getElementById("resizeBtn").addEventListener("click", resizeGrid);
document.getElementById("applyPatternBtn").addEventListener("click", applyPattern);
canvas.addEventListener("click", toggleCell);
canvas.addEventListener("touchstart", function (e) {
    e.preventDefault();
    toggleCell(e);
});
document.getElementById("speedSlider").addEventListener("input", updateSpeed);

initGrid();
drawGrid();