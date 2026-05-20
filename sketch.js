let playerImg;
let bgVid;

let platforms = [
  // { x, y, w, h }
  { x: 0, y: 410, w: 800, h: 40 }, // ground (full width floor)
  { x: 80, y: 310, w: 120, h: 16 }, // left low platform
  { x: 280, y: 240, w: 140, h: 16 }, // centre platform
  { x: 500, y: 170, w: 120, h: 16 }, // right high platform
  { x: 160, y: 150, w: 100, h: 16 }, // left high platform
  { x: 360, y: 320, w: 110, h: 16 }, // centre low platform
  { x: 620, y: 290, w: 130, h: 16 }, // far right platform
];

let player = {
  x: 200,
  y: 100,

  vx: 0,
  vy: 0,

  r: 24,
  facing: 1, // 1 = right, -1 = left

  // Movement tuning — change these to adjust how the game feels
  speed: 0.5,
  maxSpeed: 4,
  jumpForce: -12,
  friction: 0.8,

  onGround: false,
  onPlatform: false,
};

function preload() {
  playerImg = loadImage("assets/madeline.jpg");
  bgVid = createVideo("assets/coolbg.mp4");
  bgVid.hide();
}

const GRAVITY = 0.6;
const PLATFORM_COLOR = [15, 28, 110];

let floorY;

function setup() {
  createCanvas(800, 450);

  bgVid.volume(0);
  bgVid.loop();

  floorY = height - 40;
  player.y = floorY - player.r;
}

function draw() {
  image(bgVid, 0, 0, width, height);

  drawFloor();

  resolvePlatformCollisions();

  handleInput();
  applyPhysics();

  drawPlatforms();
  drawPlayer();
  drawHUD();
}

function handleInput() {
  let currentSpeed = player.onPlatform ? player.speed * 4 : player.speed;
  let currentMax = player.onPlatform ? player.maxSpeed * 2 : player.maxSpeed;

  // --- Horizontal movement ---
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    player.vx -= currentSpeed;
    player.facing = -1; // face left
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    player.vx += currentSpeed;
    player.facing = 1; // face right
  }

  player.vx = constrain(player.vx, -currentMax, currentMax);

  if (
    !keyIsDown(LEFT_ARROW) &&
    !keyIsDown(65) &&
    !keyIsDown(RIGHT_ARROW) &&
    !keyIsDown(68)
  ) {
    player.vx *= player.friction;
  }

  if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && player.onGround) {
    player.vy = player.jumpForce;
    player.onGround = false;
  }
}

function applyPhysics() {
  // 1. Apply gravity — pulls the player down every frame
  player.vy += GRAVITY;

  // 2. Move player by its current velocity
  player.x += player.vx;
  player.y += player.vy;

  // 3. Floor collision
  if (player.y + player.r >= floorY) {
    player.y = floorY - player.r; // snap to floor
    player.vy = 0; // stop falling
    player.onGround = true; // allow jumping again
  } else {
    player.onGround = false;
  }

  // 4. Wall collision — keep player inside canvas
  player.x = constrain(player.x, player.r, width - player.r);
}

function resolvePlatformCollisions() {
  player.onPlatform = false;

  for (let i = 1; i < platforms.length; i++) {
    let p = platforms[i];

    let playerLeft = player.x - player.r;
    let playerRight = player.x + player.r;
    let playerBottom = player.y + player.r;

    let platLeft = p.x;
    let platRight = p.x + p.w;
    let platTop = p.y;

    let overlapsHorizontally = playerRight > platLeft && playerLeft < platRight;

    let landingOnTop =
      player.vy >= 0 && playerBottom >= platTop && playerBottom <= platTop + 20;

    if (overlapsHorizontally && landingOnTop) {
      player.y = platTop - player.r;
      player.vy = 0;
      player.onGround = true;
      player.onPlatform = true;
    }
  }
}

// ------------------------------------------------------------
// drawPlatforms()
// Loops through the platforms array and draws each one.
// This is the same loop pattern used to draw any collection
// of objects — enemies, coins, tiles, etc.
// ------------------------------------------------------------
function drawPlatforms() {
  fill(PLATFORM_COLOR[0], PLATFORM_COLOR[1], PLATFORM_COLOR[2]);
  noStroke();

  for (let i = 0; i < platforms.length; i++) {
    let p = platforms[i];
    rect(p.x, p.y, p.w, p.h, 6); // rounded corners
  }
}

function drawPlayer() {
  push();
  imageMode(CENTER);
  let size = player.r * 2;

  translate(player.x, player.y);

  scale(player.facing, 1);
  image(playerImg, 0, 0, size, size);

  pop();
}

function drawFloor() {
  fill(131, 199, 254); // dark teal
  noStroke();
  rect(0, floorY, width, height - floorY);
}

function drawHUD() {
  fill(15, 28, 110);
  noStroke();
  textSize(20);
  textAlign(LEFT);

  text("Move: Arrow Keys or WASD   Jump: W or Up Arrow", 16, 30);
}
