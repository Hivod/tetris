const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.scale(40, 40);
ctx.fillStyle = "black"
ctx.fillRect(0,0,canvas.width/40,canvas.height/40);

function drawBlock(x,y, color) {
  if(color == 1) { //red
    c1 = "rgb(255, 0, 0)";
    c2 = "rgb(64, 0, 0)";
    c3 = "rgb(204, 0, 0)";
  } else if (color == 2) { //green
    c1 = "rgb(0, 255, 0)";
    c2 = "rgb(0, 64, 0)";
    c3 = "rgb(0, 204, 0)";
  } else if (color == 3) { //yellow
    c1 = "rgb(255, 255, 0)";
    c2 = "rgb(64, 64, 0)";
    c3 = "rgb(204, 204, 0)";
  } else if (color == 4) { //blue
    c1 = "rgb(0, 0, 255)";
    c2 = "rgb(0, 0, 64)";
    c3 = "rgb(0, 0, 204)";
  } else if (color == 5) { //pink
    c1 = "rgb(255, 0, 255)";
    c2 = "rgb(64, 0, 64)";
    c3 = "rgb(204, 0, 204)";
  } else if (color == 6) { //orange
    c1 = "rgb(255, 127, 0)";
    c2 = "rgb(64, 32, 0)";
    c3 = "rgb(204, 102, 0)";
  } else { //purple
    c1 = "rgb(127, 0, 255)";
    c2 = "rgb(32, 0, 64)";
    c3 = "rgb(102, 0, 204)";
  }
  ctx.fillStyle = c1;
  ctx.fillRect(x,y,1,1)
  ctx.scale(.2,.2);
  ctx.fillStyle = c2;
  ctx.fillRect(x*5+4,y*5+1,1,4);
  ctx.fillRect(x*5+1,y*5+4,4,1);
  ctx.fillStyle = "#fff";
  ctx.fillRect(x*5,y*5,4,1);
  ctx.fillRect(x*5,y*5,1,4);
  ctx.fillStyle = c3;
  ctx.fillRect(x*5+4,y*5,1,1);
  ctx.fillRect(x*5,y*5+4,1,1);
  ctx.scale(5,5);
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
  color: rand+1
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
  if(key.keyCode == 38) {
    player.tetro = rotate(player.tetro);
    if (checkCollision(arena, player)) {
      for(var i = 0; i < 3; i++) {
        player.tetro = rotate(player.tetro);
      }
    }
  }
  if (key.keyCode == 40) moveDown();
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
    player.color = rand+1;
  }
}

function clearLine(arr) {
  for(var i = 0; i < arr.length; i++) {
    if (arr[i] == 0) return false;
  }
  return true;
}

var dropCounter = 0;
var dropInterval = 800;

var lastTime = 0;

function gameOver() {
  for(var i = 0; i < arena[0].length; i++) {
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
  for(var i = 0; i < arena.length-1; i++) {
    if(clearLine(arena[i])) {
      arena.splice(i, 1);
      arena.splice(0, 0, new Array(10).fill(0));
      document.getElementById("score").textContent = "SCORE: " + ++score;
      dropInterval -= 10;
    }
  }
  draw();
  if(!gameOver()) {
    requestAnimationFrame(update);
  } else {
    endGame();
  }
}

update();