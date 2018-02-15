const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.scale(20, 20);

const tetrominos = [
  //L tetro
 [[1, 1, 1],
  [1, 0, 0],
  [0, 0, 0]],
  // J tetro
 [[1, 1, 1],
  [0, 0, 1],
  [0, 0, 0]],
  // T tetro
 [[1, 1, 1],
  [0, 1, 0],
  [0, 0, 0]],
  // S tetro
 [[0, 1, 1],
  [1, 1, 0],
  [0, 0, 0]],
  // Z tetro
 [[1, 1, 0],
  [0, 1, 1],
  [0, 0, 0]],
  // Line (I) tetro
 [[1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]],
  // Square (O) tetro
 [[1, 1],
  [1, 1]]
];

var player = {
  x: 4,
  y: 0,
  tetro: tetrominos[Math.floor(Math.random() * 7)]
}

function createMatrix(width, height) {
  var matrix = [];
  while (height--) {
    matrix.push(new Array(width).fill(0));
  }
  matrix.push(new Array(width).fill(1));
  return matrix;
}

function drawTetro(tetro, x, y) {
  for (var row = 0; row < tetro.length; row++) {
    for (var i = 0; i < tetro[row].length; i++) {
      if (tetro[row][i] == 1) {
        ctx.fillRect(i + x, row + y, 1, 1);
      }
    }
  }
}


function drawFrame() {
  //ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "red";
  drawTetro(player.tetro, player.x, player.y);
  ctx.fillStyle = "blue";
  drawTetro(arena, 0, 0);
}

/* controls (left + right) */
document.body.addEventListener("keydown", function (key) {
  if (key.keyCode == 37) player.x--;
  if (key.keyCode == 39) player.x++;
  // if(key.keyCode == 38) rotate();
  if (key.keyCode == 40) moveDown();
});

var arena = createMatrix(10, 21);
console.table(arena);

function placeTetro(arena, player) {
  for (var y = 0; y < player.tetro.length; y++) {
    for (var x = 0; x < player.tetro[y].length; x++) {
      if (player.tetro[y][x] == 1) {
        arena[player.y + y][player.x + x] = 1;
      }
    }
  }
}

function checkCollision(arena, player) {
  for (var y = 0; y < player.tetro.length; y++) {
    for (var x = 0; x < player.tetro[y].length; x++) {
      if (player.tetro[y][x] == 1 && arena[player.y + y][player.x + x] == 1) {
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
    console.table(arena);
    player.y = 0;
    player.x = 4;
  }
}

var dropCounter = 0;
var dropInterval = 1000;

var lastTime = 0;

function update(time = 0) {
  var deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  checkCollision(arena, player);
  if (dropCounter > dropInterval) {
    moveDown();
  }
  drawFrame();
  requestAnimationFrame(update);
}

update();
