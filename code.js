const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const scale = 40;
var downScale = 5;
ctx.scale(scale, scale);
ctx.fillStyle = "black"
ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

function drawBlock(x, y, color) {
  if (color == 1) { //red
    color = "rgb(255, 0, 0)";
  } else if (color == 2) { //green
    color = "rgb(0, 255, 0)";
  } else if (color == 3) { //yellow
    color = "rgb(255, 255, 0)";
  } else if (color == 4) { //blue
    color = "rgb(0, 0, 255)";
  } else if (color == 5) { //pink
    color = "rgb(255, 0, 255)";
  } else if (color == 6) { //orange
    color = "rgb(255, 127, 0)";
  } else { //purple
    color = "rgb(127, 0, 255)";
  }
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1)
  ctx.scale(1/downScale, 1/downScale);
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(x * downScale + downScale - 1, y * downScale + 1, 1, downScale - 1);
  ctx.fillRect(x * downScale + 1, y * downScale + downScale - 1, downScale - 1, 1);
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.fillRect(x * downScale, y * downScale, downScale - 1, 1);
  ctx.fillRect(x * downScale, y * downScale, 1, downScale - 1);
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  ctx.fillRect(x * downScale + downScale - 1, y * downScale, 1, 1);
  ctx.fillRect(x * downScale, y * downScale + downScale - 1, 1, 1);
  ctx.scale(downScale, downScale);
}

const tetrominos = [
  //L tetro
 [[1, 1, 1],
  [1, 0, 0],
  [0, 0, 0]],
  // J tetro
 [[2, 2, 2],
  [0, 0, 2],
  [0, 0, 0]],
  // T tetro
 [[3, 3, 3],
  [0, 3, 0],
  [0, 0, 0]],
  // S tetro
 [[0, 4, 4],
  [4, 4, 0],
  [0, 0, 0]],
  // Z tetro
 [[5, 5, 0],
  [0, 5, 5],
  [0, 0, 0]],
  // Line (I) tetro
 [[6, 6, 6, 6],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]],
  // Square (O) tetro
 [[7, 7],
  [7, 7]]
];

var rand = Math.floor(Math.random() * 7);
var player = {
  x: 4,
  y: 0,
  tetro: tetrominos[rand],
  color: rand + 1
}

var score = 0;

function createMatrix(width, height) {
  var matrix = [];
  while (height--) {
    matrix.push(new Array(width).fill(0));
  }
  matrix.push(new Array(width).fill(1));
  return matrix;
}

function drawSprite(sprite, x, y) {
  for (var row = 0; row < sprite.length; row++) {
    for (var i = 0; i < sprite[row].length; i++) {
      if (sprite[row][i] != 0) {
        drawBlock(i + x, row + y, sprite[row][i]);
      }
    }
  }
}


function draw() {
  //ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";
  drawSprite(player.tetro, player.x, player.y);
  ctx.fillStyle = "blue";
  drawSprite(arena, 0, 0);
}

/* controls (left + right) */
function rotate() {
  var arr = new Array;
  for (var i = 0; i < player.tetro.length; i++) {
    arr.push([]);
  }
  for (var y = 0; y < player.tetro.length; y++) {
    for (var x = 0; x < player.tetro[y].length; x++) {
      arr[y].push(player.tetro[x][y]);
    }
  }
  arr.reverse();
  return arr;
}

function move(direction) {
  player.x += direction;
  if (checkCollision(arena, player)) {
    player.x -= direction;
  }
}

document.body.addEventListener("keydown", function (key) {
  if (key.keyCode == 37) move(-1);
  if (key.keyCode == 39) move(1);
  if (key.keyCode == 38) {
    player.tetro = rotate(player.tetro);
    if (checkCollision(arena, player)) {
      for (var i = 0; i < 3; i++) {
        player.tetro = rotate(player.tetro);
      }
    }
  }
  if (key.keyCode == 40) moveDown();
  if (key.keyCode == 32) sendDown();
});

var arena = createMatrix(10, 21);

function placeTetro(arena, player) {
  for (var y = 0; y < player.tetro.length; y++) {
    for (var x = 0; x < player.tetro[y].length; x++) {
      if (player.tetro[y][x] != 0) {
        arena[player.y + y][player.x + x] = player.color;
      }
    }
  }
}

function checkCollision(arena, player) {
  for (var y = 0; y < player.tetro.length; y++) {
    for (var x = 0; x < player.tetro[y].length; x++) {
      if (player.tetro[y][x] != 0 && (arena[player.y + y] && arena[y + player.y][x + player.x] != 0)) {
        return true;
      }
    }
  }
  return false;
}

function moveDown() {
  player.y++;
  dropCounter = 0;
  if (checkCollision(arena, player)) {
    player.y--;
    placeTetro(arena, player);
    player.y = 0;
    player.x = 4;
    rand = Math.floor(Math.random() * 7);
    player.tetro = tetrominos[rand];
    player.color = rand + 1;
  }
}

function sendDown() {
  while (!checkCollision(arena, player)) {
    player.y++;
    dropCounter = 1000;
  }
  player.y--;
}

function clearLine(arr) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == 0) return false;
  }
  return true;
}

var dropCounter = 0;
var dropInterval = 800;

var lastTime = 0;

function gameOver() {
  for (var i = 0; i < arena[0].length; i++) {
    if (arena[0][i] != 0) return true;
  }
  return false;
}

function endGame() {
  var gameOverText = document.createElement("p");
  gameOverText.id = "gameovertext";
  gameOverText.textContent = "GAME OVER";
  document.getElementById("main").appendChild(gameOverText);
}

function update(time = 0) {
  var deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  checkCollision(arena, player);
  if (dropCounter > dropInterval) {
    moveDown();
  }
  for (var i = 0; i < arena.length - 1; i++) {
    if (clearLine(arena[i])) {
      arena.splice(i, 1);
      arena.splice(0, 0, new Array(10).fill(0));
      document.getElementById("score").textContent = "SCORE: " + ++score;
      dropInterval -= 10;
    }
  }
  draw();
  if (!gameOver()) {
    requestAnimationFrame(update);
  } else {
    endGame();
  }
}

update();
