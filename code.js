const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("scoretext");
const screenText = document.getElementById("screentext");
const screenText2 = document.getElementById("screentext2")
const arenaSize = 10;
ctx.scale(canvas.height / ((arenaSize * 2.1 | 0) | 0), canvas.width / arenaSize);
const colors = ["rgb(14, 0, 88)", /* dark blue */
                "rgb(255, 0, 0)", /* red, L tetro */
                "rgb(0, 255, 0)", /* green, J tetro */
                "rgb(255, 127, 0)", /* orange, T tetro */
                "rgb(0, 0, 255)", /* blue, S tetro */
                "rgb(255, 0, 255)", /* pink, Z tetro */
                "rgb(255, 255, 0)", /* yellow, I tetro */
                "rgb(127, 0, 255)"]; /* purple, O tetro */
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
const playerTetrominoArrayLength = 5;

var startingSpeed = 800;
var dropCounter = 0;
var dropInterval = 0;
var maxSpeed = 80;
var lastTime = 0;
var score = 0;
var paused = false;
var player = {
  x: 0,
  y: 0,
  tetrominos: getRandomTetrominos(playerTetrominoArrayLength)
};
var downScale = 5;
var gameOverAnimation;

function drawBlock(x, y, color, contrast) {
  /* draw a stylized tetris block */
  if (contrast in window) contrast = 1;
  ctx.fillStyle = colors[color];
  ctx.fillRect(x, y, 1, 1)
  ctx.scale(1 / downScale, 1 / downScale);
  ctx.fillStyle = "rgba(0, 0, 0, " + contrast / 2 + ")";
  ctx.fillRect(x * downScale + downScale - 1, y * downScale + 1, 1, downScale - 1);
  ctx.fillRect(x * downScale + 1, y * downScale + downScale - 1, downScale - 1, 1);
  ctx.fillStyle = "rgba(255, 255, 255, " + contrast / 1.4286 + ")";
  ctx.fillRect(x * downScale, y * downScale, downScale - 1, 1);
  ctx.fillRect(x * downScale, y * downScale, 1, downScale - 1);
  ctx.fillStyle = "rgba(0, 0, 0, " + contrast / 5 + ")";
  ctx.fillRect(x * downScale + downScale - 1, y * downScale, 1, 1);
  ctx.fillRect(x * downScale, y * downScale + downScale - 1, 1, 1);
  ctx.scale(downScale, downScale);
}

function drawMatrix(matrix, x, y) {
  /* draw a matrix using drawBlock() */
  for (var row = 0; row < matrix.length; row++) {
    for (var i = 0; i < matrix[row].length; i++) {
      if (matrix[row][i] != 0) {
        drawBlock(i + x, row + y, matrix[row][i], 1);
      }
    }
  }
}

function createMatrix(width, height) {
  var matrix = [];
  while (height--) {
    matrix.push(new Array(width).fill(0));
  }
  return matrix;
}

var arena = createMatrix(arenaSize, (arenaSize * 2.1 | 0)); /* set up arena */
arena.push(new Array(arenaSize).fill(9));
var gameLost = true; /* game won't start as soon as the page loads */

function getRandomTetrominos(length) {
  /* returns array of tetrominos of given length */
  let arr = new Array(length).fill(0);
  arr.forEach(function(element, index, arr) {
    arr[index] = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  });
  return arr;
}

function rotate(tetromino) {
  /* returns tetromino rotated 90 degrees counter clockwise */
  var arr = new Array;
  for (var i = 0; i < tetromino.length; i++) {
    arr.push([]);
  }
  for (var y = 0; y < tetromino.length; y++) {
    for (var x = 0; x < tetromino[y].length; x++) {
      arr[y].push(tetromino[x][y]);
    }
  }
  arr.reverse();
  while (arr[0].every(function (val) {
      return val == 0;
    })) {
    arr.splice(0, 1);
    arr.push(new Array(arr[0].length).fill(0));
  }
  return arr;
}

function moveDown() {
  /* moves player down unless there is a collision */
  player.y++;
  dropCounter = 0;
  if (checkCollision(arena, player.tetrominos[0])) {
    player.y--;
    placeTetro(arena, player);
    newTetro();
  }
}

function sendDown() {
  /* moves player as far down as possible instantly */
  while (!checkCollision(arena, player.tetrominos[0])) {
    player.y++;
    dropCounter = dropInterval;
  }
  player.y--;
}

function move(direction) {
  /* move player's tetromino left (direction = -1) or right (direction = 1) */
  player.x += direction;
  if (checkCollision(arena, player.tetrominos[0])) {
    player.x -= direction;
  }
}

function checkCollision(matrix1, matrix2) {
  /* returns true if matrix1 and matrix2 overlaps (at player's position) */
  for (var y = 0; y < matrix2.length; y++) {
    for (var x = 0; x < matrix2[y].length; x++) {
      if (matrix2[y][x] != 0 && (matrix1[player.y + y] && matrix1[y + player.y][x + player.x] != 0)) {
        return true;
      }
    }
  }
  return false;
}

function placeTetro(arena, player) {
  /* adds player's tetromino to arena at player's current position */
  var color;
  player.tetrominos[0][0].forEach(function(element) {
    if (element != 0) color = element;
  })
  for (var y = 0; y < player.tetrominos[0].length; y++) {
    for (var x = 0; x < player.tetrominos[0][y].length; x++) {
      if (player.tetrominos[0][y][x] != 0) {
        try {
          arena[player.y + y][player.x + x] = color;
        } catch (err) {
          console.log(err);
        }
      }
    }
  }
}

function newTetro() {
  /* removes player's current tetromino, gives player a new tetromino, and resets position */
  player.tetrominos.splice(0, 1);
  player.tetrominos.push(getRandomTetrominos(1)[0]);
  player.x = Math.floor(arena[0].length / 2) - Math.floor(player.tetrominos[0][0].length / 2);
  player.y = 0;
}

function rowFull(arr) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == 0) return false;
  }
  return true;
}

function clearRows(arena) {
  /* clears any full rows and returns amount of cleared rows */
  var rows = 0;
  arena.forEach(function(element, index) {
    if (rowFull(element) && element[0] != 9) {
      arena.splice(index, 1);
      arena.splice(0, 0, new Array(arenaSize).fill(0));
      rows++;
    }
  });
  return rows;
}

function gameOver() {
  /* return true if blocks are touching top of arena */
  for (var i = 0; i < arena[0].length; i++) {
    if (arena[0][i] != 0) {
      return true;
    }
  }
  return false;
}

function startGame() {
  gameLost = false;
  arena = createMatrix(10, 21); /* reset arena */
  arena.push(new Array(arenaSize).fill(9));
  player.tetrominos = getRandomTetrominos(playerTetrominoArrayLength); /* reset player's tetromino array */
  player.x = Math.floor(arena[0].length / 2) - Math.floor(player.tetrominos[0][0].length / 2);
  player.y = 0;
  dropInterval = startingSpeed;
  //blockAmount -= 4;
  clearInterval(gameOverAnimation);
  score = 0;
  update();
}

function endGame() {
  screenText.textContent = "GAME OVER";
  screenText2.textContent = "SCORE: " + score;
  setTimeout(function () {
    screenText.textContent = "PRESS SPACE TO START";
  }, 5000);
  var index = 0;
  gameOverAnimation = setInterval(function () {
    if (index < arena.length * arena[0].length) {
      let x = index % arena[0].length;
      let y = (index - x) / arena[0].length;
      if (arena[y][x] != 0) {
        drawBlock(x, y, 0, 1.2);
      }
      index++;
    } else {
      clearInterval(gameOverAnimation);
    }
  }, 30);
}

function update(time = 0) {
  gameLost = gameOver();
  if (!paused) {
    var deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
      moveDown();
    }
    let clearedRows = clearRows(arena);
    score += clearedRows;
    dropInterval -= 20 * clearedRows;
    if (dropInterval < maxSpeed) dropInterval = maxSpeed;
    clearedRows = 0;
    scoreText.textContent = score;
    screenText.textContent = "";
    screenText2.textContent = "";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.height / ((arenaSize * 2.1 | 0) | 0), canvas.width / arenaSize);
    drawMatrix(arena, 0, 0);
    drawMatrix(player.tetrominos[0], player.x, player.y);
  } else {
    screenText.textContent = "PAUSED";
    screenText2.textContent = "PRESS SPACE TO RESUME";
  }
  if (!gameLost) {
    requestAnimationFrame(update);
  } else {
    endGame();
  }
}

document.addEventListener("keydown", function (key) {
  if (gameLost && key.keyCode == 32) {
    startGame();
  } else if (key.keyCode == 32) {
    paused = false;
  }
});

document.body.addEventListener("click", function (e) {
  if (!gameLost && !paused) {
    paused = true;
  }
});

document.body.addEventListener("keydown", function (key) {
  /* key listener for controls */
  if (!paused) {
    if (key.keyCode == 37) move(-1);
    if (key.keyCode == 39) move(1);
    if (key.keyCode == 38) {
      player.tetrominos[0] = rotate(player.tetrominos[0]);
      if (checkCollision(arena, player.tetrominos[0])) {
        for (var i = 0; i < 3; i++) {
          player.tetrominos[0] = rotate(player.tetrominos[0]);
        }
      }
    }
    if (key.keyCode == 40) moveDown();
    if (key.keyCode == 32) sendDown();
  }
});

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.height / ((arenaSize * 2.1 | 0) | 0), canvas.width / arenaSize);

function randomColor() {
  var val = 255 + 64;
  var red = Math.floor(Math.random() * 255);
  val -= red;
  if (val > 255) {
    var green = Math.floor(Math.random() * 255);
    val -= green;
  } else {
    var green = Math.floor(Math.random() * val);
    val -= green;
  }
  var blue = val;
  return "rgb(" + red + "," + green + "," + blue + ")";
}