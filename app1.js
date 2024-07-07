const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 80;
const gridSize = 10;

// Массив с цветными клетками
const colorCells = [
  { index: 0, color: '#92c5f5' },
  { index: 21, color: '#e76fa9' },
  { index: 24, color: '#e76fa9' },
  { index: 36, color: '#d0f187' },
  { index: 39, color: '#92c5f5' },
  { index: 40, color: '#ba99fc' },
  { index: 41, color: '#75df98' },
  { index: 42, color: '#d0f187' },
  { index: 49, color: '#ED3CCA	' },
  { index: 50, color: '#f3a273' },
  { index: 51, color: '#fefc8e' },
  { index: 61, color: '#75df98' },
  { index: 66, color: '#fefc8e' },
  { index: 68, color: '#ba99fc' },
  { index: 74, color: '#f3a273' },
  { index: 80, color: '#eb6e7b' },
  { index: 81, color: '#ED3CCA	' },
  { index: 89, color: '#eb6e7b' },
];

// Рисуем сетку и клетки
drawGrid();
drawCells(colorCells);

let isDrawing = false;
let currentCell = null;
let currentWireColor = null;
let isWireConnected = false;

const sign = document.getElementById("sign");
const restartButton = document.getElementById("restartButton");

restartButton.addEventListener('click', restartGame);

// Массив для хранения линий
let lines = [];

// Обработчики событий для мыши
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', drawWire);
canvas.addEventListener('mouseup', stopDrawing);

// Обработчики событий для касания
canvas.addEventListener('touchstart', startDrawingTouch);
canvas.addEventListener('touchmove', drawWireTouch);
canvas.addEventListener('touchend', stopDrawingTouch);

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

// Рисуем клетки из массива
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
      // Проверка пересечения *перед* рисованием
      if (checkWireIntersection(currentCell, newCell)) {
        restartGame();
        return; 
      }

      const x1 = (currentCell % gridSize) * cellSize + cellSize / 2;
      const y1 = (Math.floor(currentCell / gridSize)) * cellSize + cellSize / 2;
      const x2 = (newCell % gridSize) * cellSize + cellSize / 2;
      const y2 = (Math.floor(newCell / gridSize)) * cellSize + cellSize / 2;

      // Добавляем линию в массив
      lines.push({ start: currentCell, end: newCell, color: currentWireColor });

      // Рисуем линию
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);

      ctx.strokeStyle = currentWireColor;
      ctx.lineWidth = 9;
      ctx.stroke();

      currentCell = newCell;

      // Проверяем подключение к цветным клеткам
      if (colorCells.some(cell => cell.index === newCell)) {
        isWireConnected = true;
        isDrawing = false; // Прекращаем рисование
      }
    }
  }
}

function stopDrawing() {
  isDrawing = false;

  if (isWireConnected) {
    const connected = isConnected();
    if (connected) {
      sign.classList.add("lit");
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

  lines = [];

  drawGrid();
  drawCells(colorCells);
}

// Функция проверки пересечения линий
function checkWireIntersection(startCell, endCell) {
  // Проверка пересечения с линиями сетки
  if (startCell % gridSize === endCell % gridSize) {
    // Линии вертикальны
    for (let i = 0; i <= gridSize; i++) {
      if (i * cellSize === (startCell % gridSize) * cellSize) {
        continue; // Пропускаем линию сетки, через которую проходит линия
      }
      // Проверка пересечения
      if (linesIntersect(
        (startCell % gridSize) * cellSize, 0,
        (startCell % gridSize) * cellSize, gridSize * cellSize,
        (startCell % gridSize) * cellSize, (Math.floor(startCell / gridSize)) * cellSize,
        (startCell % gridSize) * cellSize, (Math.floor(endCell / gridSize)) * cellSize
      )) {
        return true;
      }
    }
  } else if (Math.floor(startCell / gridSize) === Math.floor(endCell / gridSize)) {
    // Линии горизонтальны
    for (let i = 0; i <= gridSize; i++) {
      if (i * cellSize === (Math.floor(startCell / gridSize)) * cellSize) {
        continue; // Пропускаем линию сетки, через которую проходит линия
      }
      // Проверка пересечения
      if (linesIntersect(
        0, (Math.floor(startCell / gridSize)) * cellSize,
        gridSize * cellSize, (Math.floor(startCell / gridSize)) * cellSize,
        (startCell % gridSize) * cellSize, (Math.floor(startCell / gridSize)) * cellSize,
        (endCell % gridSize) * cellSize, (Math.floor(startCell / gridSize)) * cellSize
      )) {
        return true;
      }
    }
  }

  // Проверка пересечения с другими линиями (исключая последнюю)
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

// Проверка пересечения отрезков
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

// Обработчики событий для касаний
function startDrawingTouch(e) {
  const touch = e.touches[0];
  const cellIndex = getCellIndex(touch.clientX, touch.clientY);
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
  drawWire({ offsetX: touch.clientX, offsetY: touch.clientY });
}

function stopDrawingTouch() {
  isDrawing = false;
  if (isWireConnected) {
    const connected = isConnected();
    if (connected) {
      sign.classList.add("lit");
    }
  }
}