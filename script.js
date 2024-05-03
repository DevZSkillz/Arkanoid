// Select the canvas element from the DOM and its 2D context
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Select hidden images from the DOM
const $sprite = document.querySelector("#sprite");
const $bricks = document.querySelector("#bricks");

// Set canvas size
canvas.width = 448;
canvas.height = 400;

/* Game variables */

/* BALL VARIABLES */
const ballRadius = 3;
// ball position and velocity
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = -3;
let dy = -3;

/* PADDLE VARIABLES */
const PADDLE_SENSITIVITY = 8;

const paddleHeight = 10;
const paddleWidth = 50;

let paddleX = (canvas.width - paddleWidth) / 2;
let paddleY = canvas.height - paddleHeight - 10;

let rightPressed = false;
let leftPressed = false;

/* BRICK VARIABLES */
const brickRowCount = 6;
const brickColumnCount = 13;
const brickWidth = 32;
const brickHeight = 16;
const brickPadding = 0;
const brickOffsetTop = 80;
const brickOffsetLeft = 16;
const bricks = [];

const BRICK_STATUS = {
  ACTIVE: 1,
  DESTROYED: 0,
};

// Create brick matrix and assign positions and statuses
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
    const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
    const random = Math.floor(Math.random() * 8); // Random color
    bricks[c][r] = {
      x: brickX,
      y: brickY,
      status: BRICK_STATUS.ACTIVE,
      color: random,
    };
  }
}

// Draw the ball on the canvas
function drawBall() {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

// Draw the paddle on the canvas
function drawPaddle() {
  ctx.drawImage(
    $sprite,
    29,
    174,
    paddleWidth,
    paddleHeight,
    paddleX,
    paddleY,
    paddleWidth,
    paddleHeight
  );
}

// Draw bricks on the canvas
function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

      const clipX = currentBrick.color * 32;

      ctx.drawImage(
        $bricks,
        clipX,
        0,
        brickWidth,
        brickHeight,
        currentBrick.x,
        currentBrick.y,
        brickWidth,
        brickHeight
      );
    }
  }
}

// Draw user interface elements
function drawUI() {
  ctx.fillText(`FPS: ${framesPerSec}`, 5, 10);
}

// Detect collisions between the ball and bricks
function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      const currentBrick = bricks[c][r];
      if (currentBrick.status === BRICK_STATUS.DESTROYED) continue;

      const isBallSameXAsBrick =
        x > currentBrick.x && x < currentBrick.x + brickWidth;

      const isBallSameYAsBrick =
        y > currentBrick.y && y < currentBrick.y + brickHeight;

      if (isBallSameXAsBrick && isBallSameYAsBrick) {
        dy = -dy;
        currentBrick.status = BRICK_STATUS.DESTROYED;
      }
    }
  }
}

// Move the ball
function ballMovement() {
  // Bounce off the canvas edges
  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    dx = -dx;
  }

  // Bounce off the top of the canvas
  if (y + dy < ballRadius) {
    dy = -dy;
  }

  // Bounce off the paddle or detect game over
  const isBallSameXAsPaddle = x > paddleX && x < paddleX + paddleWidth;
  const isBallTouchingPaddle = y + dy > paddleY;

  if (isBallSameXAsPaddle && isBallTouchingPaddle) {
    dy = -dy;
  } else if (
    y + dy > canvas.height - ballRadius ||
    y + dy > paddleY + paddleHeight
  ) {
    console.log("Game Over");
    document.location.reload();
  }

  // Move the ball
  x += dx;
  y += dy;
}

// Move the paddle
function paddleMovement() {
  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += PADDLE_SENSITIVITY;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= PADDLE_SENSITIVITY;
  }
}

// Clear the canvas
function cleanCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Initialize keyboard events
function initEvents() {
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);

  function keyDownHandler(event) {
    const { key } = event;
    if (key === "Right" || key === "ArrowRight" || key.toLowerCase() === "d") {
      rightPressed = true;
    } else if (
      key === "Left" ||
      key === "ArrowLeft" ||
      key.toLowerCase() === "a"
    ) {
      leftPressed = true;
    }
  }

  function keyUpHandler(event) {
    const { key } = event;
    if (key === "Right" || key === "ArrowRight" || key.toLowerCase() === "d") {
      rightPressed = false;
    } else if (
      key === "Left" ||
      key === "ArrowLeft" ||
      key.toLowerCase() === "a"
    ) {
      leftPressed = false;
    }
  }
}

// Set frames per second
const fps = 60;
let msPrev = window.performance.now();
let msFPSPrev = window.performance.now() + 1000;
const msPerFrame = 1000 / fps;
let frames = 0;
let framesPerSec = fps;

// Main draw and game update function
function draw() {
  window.requestAnimationFrame(draw);

  const msNow = window.performance.now();
  const msPassed = msNow - msPrev;

  if (msPassed < msPerFrame) return;

  const excessTime = msPassed % msPerFrame;
  msPrev = msNow - excessTime;

  frames++;

  // Update frames per second count
  if (msFPSPrev < msNow) {
    msFPSPrev = window.performance.now() + 1000;
    framesPerSec = frames;
    frames = 0;
  }

  // Clear the canvas and draw game elements
  cleanCanvas();
  drawBall();
  drawPaddle();
  drawBricks();
  drawUI();

  // Detect collisions and update movements
  collisionDetection();
  ballMovement();
  paddleMovement();
}

// Start the game
draw();
initEvents();
