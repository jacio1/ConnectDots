const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 80;
const gridSize = 10;

const colorCells = [
  { index: 12, color: '#f4adaf' },
  { index: 18, color: '#d0f187' },
  { index: 19, color: '#eb6e7b' },
  { index: 33, color: '#92c5f5' },
  { index: 35, color: '#e76fa9' },
  { index: 41, color: '#f4adaf' },
  { index: 46, color: '#9fd181' },
  { index: 57, color: '#9fd181' },
  { index: 62, color: '#ba99fc' },
  { index: 65, color: '#75df98' },
  { index: 67, color: '#e76fa9' },
  { index: 74, color: '#ba99fc' },
  { index: 75, color: '#f3a273' },
  { index: 76, color: '#d0f187' },
  { index: 77, color: '#92c5f5' },
  { index: 81, color: '#f3a273' },
  { index: 84, color: '#75df98' },
  { index: 86, color: '#fefc8e' },
  { index: 89, color: '#fefc8e' },
  { index: 90, color: '#eb6e7b' },
  { index: 97, color: '#68d3e1' },
  { index: 99, color: '#68d3e1' },
];

drawGrid();
drawCells(colorCells);

let isDrawing = false;
let currentCell = null;
let currentWireColor = null;
let isWireConnected = false;
let connectedCells = new Set(); 
let isImageChanged = false;

const sign = document.getElementById("sign");
const restartButton = document.getElementById("restartButton");
const imageElement = document.getElementById('myImage');
const nextLevelButton = document.getElementById('nextLevelButton'); 

restartButton.addEventListener('click', restartGame);

let lines = [];

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', drawWire);
canvas.addEventListener('mouseup', stopDrawing);

canvas.addEventListener('touchstart', startDrawingTouch);
canvas.addEventListener('touchmove', drawWireTouch);
canvas.addEventListener('touchend', stopDrawingTouch);

function getCanvasPosition() {
  const rect = canvas.getBoundingClientRect();
  return {
    left: rect.left + window.scrollX,
    top: rect.top + window.scrollY
  };
}

function drawGrid() {
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, gridSize * cellSize);
    ctx.stroke();
  }
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(gridSize * cellSize, i * cellSize);
    ctx.stroke();
  }
}

function drawCells(cells) {
  cells.forEach(cell => {
    drawCell(cell.index, cell.color);
  });
}

function drawCell(index, color) {
  const x = (index % gridSize) * cellSize;
  const y = (Math.floor(index / gridSize)) * cellSize;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, cellSize, cellSize);
}

function startDrawing(e) {
  const cellIndex = getCellIndex(e.offsetX, e.offsetY);
  const cellColor = getColorForCell(cellIndex);
  if (cellColor) {
    isDrawing = true;
    currentCell = cellIndex;
    currentWireColor = cellColor;
    isWireConnected = false;
  }
}

function drawWire(e) {
  if (!isDrawing) return;

  const newCell = getCellIndex(e.offsetX, e.offsetY);
  const newCellColor = getColorForCell(newCell);

  if (
    (newCell === currentCell + 1 && currentCell % gridSize !== gridSize - 1) ||
    (newCell === currentCell - 1 && currentCell % gridSize !== 0) ||
    (newCell === currentCell + gridSize) ||
    (newCell === currentCell - gridSize)
  ) {
    if (newCellColor === currentWireColor || newCellColor === null) {
      if (checkWireIntersection(currentCell, newCell)) {
        restartGame();
        return; 
      }

      const x1 = (currentCell % gridSize) * cellSize + cellSize / 2;
      const y1 = (Math.floor(currentCell / gridSize)) * cellSize + cellSize / 2;
      const x2 = (newCell % gridSize) * cellSize + cellSize / 2;
      const y2 = (Math.floor(newCell / gridSize)) * cellSize + cellSize / 2;

      lines.push({ start: currentCell, end: newCell, color: currentWireColor });

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      ctx.strokeStyle = currentWireColor;
      ctx.lineWidth = 21;
      ctx.stroke();

      currentCell = newCell;

      if (colorCells.some(cell => cell.index === newCell)) {
        isWireConnected = true;
        connectedCells.add(newCell);

        if (connectedCells.size >= 9 && !isImageChanged) {
          imageElement.src = './images/bonch-level3.png';
          isImageChanged = true; 
          nextLevelButton.style.display = 'block'; 
          myCanvas.style.opacity = '0'
        }
        isDrawing = false;
      }
    }
  }
}

function stopDrawing() {
  isDrawing = false;
  isImageChanged = false;

  if (isWireConnected) {
    if (isConnected()) {

      alert("Все линии соединены!");

      document.getElementById('nextLevelButton').style.display = 'block';
    }
  }
}

function getCellIndex(x, y) {
  return Math.floor(y / cellSize) * gridSize + Math.floor(x / cellSize);
}

function isConnected() {
  for (let i = 0; i < colorCells.length - 1; i++) {
    for (let j = i + 1; j < colorCells.length; j++) {
      if (!checkConnection(colorCells[i].index, colorCells[j].index)) {
        return false;
      }
    }
  }
  return true;
}

function checkConnection(cell1, cell2) {
  for (let i = 0; i < lines.length; i++) {
    if ((lines[i].start === cell1 && lines[i].end === cell2) || (lines[i].start === cell2 && lines[i].end === cell1)) {
      return true;
    }
  }
  return false;
}

function getColorForCell(cellIndex) {
  const cell = colorCells.find(c => c.index === cellIndex);
  return cell ? cell.color : null;
}

function restartGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  isDrawing = false;
  currentCell = null;
  currentWireColor = null;
  isWireConnected = false;
  connectedCells = new Set(); 
  isImageChanged = false; 

  imageElement.src = './images/bonch-blur2.png'; 
  nextLevelButton.style.display = 'none'; 
  myCanvas.style.opacity = '1'

  lines = [];

  drawGrid();
  drawCells(colorCells);
}

function checkWireIntersection(startCell, endCell) {
  if (startCell % gridSize === endCell % gridSize) {
    for (let i = 0; i <= gridSize; i++) {
      if (i * cellSize === (startCell % gridSize) * cellSize) {
        continue;
      }
      if (linesIntersect(
        (startCell % gridSize) * cellSize, 0,
        (startCell % gridSize) * cellSize, gridSize * cellSize,
        (startCell % gridSize) * cellSize, (Math.floor(startCell / gridSize)) * cellSize + cellSize / 2, 
        (startCell % gridSize) * cellSize, (Math.floor(endCell / gridSize)) * cellSize + cellSize / 2 
      )) {
        return true;
      }
    }
  } else if (Math.floor(startCell / gridSize) === Math.floor(endCell / gridSize)) {
    for (let i = 0; i <= gridSize; i++) {
      if (i * cellSize === (Math.floor(startCell / gridSize)) * cellSize) {
        continue; 
      }
      if (linesIntersect(
        0, (Math.floor(startCell / gridSize)) * cellSize,
        gridSize * cellSize, (Math.floor(startCell / gridSize)) * cellSize,
        (startCell % gridSize) * cellSize + cellSize / 2, (Math.floor(startCell / gridSize)) * cellSize, 
        (endCell % gridSize) * cellSize + cellSize / 2, (Math.floor(startCell / gridSize)) * cellSize 
      )) {
        return true;
      }
    }
  }

  for (let i = 0; i < lines.length - 1; i++) {
    if (
      (startCell === lines[i].start && endCell === lines[i].end) ||
      (startCell === lines[i].end && endCell === lines[i].start) ||
      (startCell === lines[i].start && endCell !== lines[i].end) ||
      (startCell === lines[i].end && endCell !== lines[i].start) ||
      (endCell === lines[i].start && startCell !== lines[i].start) ||
      (endCell === lines[i].end && startCell !== lines[i].end)
    ) {
      return true;
    }
  }

  return false;
}

function linesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (denominator === 0) {
    return false;
  }

  const numerator1 = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4);
  const numerator2 = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4);

  const ua = numerator1 / denominator;
  const ub = numerator2 / denominator;

  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

function startDrawingTouch(e) {
  const touch = e.touches[0];
  const canvasPos = getCanvasPosition();
  const x = touch.clientX - canvasPos.left;
  const y = touch.clientY - canvasPos.top;
  const cellIndex = getCellIndex(x, y); 
  const cellColor = getColorForCell(cellIndex);
  if (cellColor) {
    isDrawing = true;
    currentCell = cellIndex;
    currentWireColor = cellColor;
    isWireConnected = false;
  }
}

function drawWireTouch(e) {
  if (!isDrawing) return;
  e.preventDefault();
  const touch = e.touches[0];
  const canvasPos = getCanvasPosition(); 
  const x = touch.clientX - canvasPos.left; 
  const y = touch.clientY - canvasPos.top;
  drawWire({ offsetX: x, offsetY: y });
}

function stopDrawingTouch() {
  isDrawing = false;
  isImageChanged = false; 
  if (isWireConnected) {
    const connected = isConnected();
    if (connected) {
      document.getElementById('nextLevelButton').style.display = 'block';
    }
  }
}
