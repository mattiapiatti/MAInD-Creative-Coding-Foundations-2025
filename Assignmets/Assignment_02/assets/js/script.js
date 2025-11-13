// DOM Elements & Constants
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

const rootStyles = getComputedStyle(document.documentElement);
const COLORS = {
    red: rootStyles.getPropertyValue('--color-red').trim(),
    beige: rootStyles.getPropertyValue('--color-beige').trim(),
    gray: rootStyles.getPropertyValue('--color-gray').trim(),
    black: rootStyles.getPropertyValue('--color-black').trim()
};

const SOUNDS = {
    jump: document.getElementById('jumpSound'),
    gameOver: document.getElementById('gameOverSound'),
    select: document.getElementById('selectSound')
};

const GAME_CONFIG = {
    desktop: {
        width: 800,
        height: 400,
        characterX: 80,
        gameSpeed: 5,
        gravity: 0.6,
        obstacleFrequency: 150,
        jumpVelocity: -12,
        speedIncrement: 0.5,
        frequencyDecrement: 5,
        minFrequency: 100
    },
    mobile: {
        width: 300,
        height: 500,
        characterX: 50,
        gameSpeed: 3.5,
        gravity: 0.5,
        obstacleFrequency: 180,
        jumpVelocity: -11,
        speedIncrement: 0.3,
        frequencyDecrement: 3,
        minFrequency: 140
    }
};

// Game State
let selectedAvatar = 'classic';
let gameRunning = false;
let score = 0;
let gameSpeed = 5;
let gravity = 0.6;
let controlsDisabled = false;
let isMobile = false;
let frameCount = 0;
let obstacleFrequency = 150;

const character = {
    x: 80,
    y: 300,
    width: 32,
    height: 32,
    velocityY: 0,
    jumping: false,
    ducking: false,
    jumpsRemaining: 2,
    maxJumps: 2
};

const ground = {
    y: 340,
    height: 60
};

let obstacles = [];
let clouds = [];

// Initialization & Configuration
function setCanvasSize() {
    isMobile = window.innerWidth <= 768;
    const config = isMobile ? GAME_CONFIG.mobile : GAME_CONFIG.desktop;

    canvas.width = config.width;
    canvas.height = config.height;
    character.x = config.characterX;
    character.y = canvas.height - 100;
    ground.y = canvas.height - 60;
    
    gameSpeed = config.gameSpeed;
    gravity = config.gravity;
    obstacleFrequency = config.obstacleFrequency;

    updateInstructions();
}

function updateInstructions() {
    const instructions = document.querySelector('.instructions');
    const gameOverP = document.querySelector('#gameOver p');
    
    if (isMobile) {
        instructions.innerHTML = 'TAP to JUMP';
        gameOverP.innerHTML = 'TAP to restart';
    } else {
        instructions.innerHTML = 'Press SPACE to JUMP';
        gameOverP.innerHTML = 'Press SPACE to restart';
    }
}

function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

function exitToAvatarSelection() {
    document.querySelector('.main-container').classList.add('hidden');
    document.querySelector('.avatar-selection').classList.remove('hidden');
    gameRunning = false;
    controlsDisabled = false;
    gameOverElement.classList.add('hidden');
    canvas.style.filter = '';
    document.querySelector('.instructions').style.visibility = 'visible';
    
    obstacles = [];
    clouds = [];
    frameCount = 0;
    score = 0;
    scoreElement.textContent = '0';
    
    character.y = canvas.height - 100;
    character.velocityY = 0;
    character.jumping = false;
    character.ducking = false;
    character.jumpsRemaining = character.maxJumps;
    
    setCanvasSize();
}

// Avatar Selection
function initAvatarSelection() {
    const avatarBtns = document.querySelectorAll('.avatar-btn');

    avatarBtns.forEach(btn => {
        const previewCanvas = btn.querySelector('.avatar-preview');
        const previewCtx = previewCanvas.getContext('2d');
        const avatarType = btn.dataset.avatar;

        setupAvatarPreviewCanvas(previewCanvas);
        drawAvatarPreview(previewCtx, avatarType);

        btn.addEventListener('click', () => selectAvatar(avatarType));
    });
}

function setupAvatarPreviewCanvas(canvas) {
    const computedStyle = getComputedStyle(canvas);
    canvas.width = parseInt(computedStyle.width);
    canvas.height = parseInt(computedStyle.height);
}

function selectAvatar(avatarType) {
    selectedAvatar = avatarType;
    playSound(SOUNDS.select);
    document.querySelector('.avatar-selection').classList.add('hidden');
    document.querySelector('.main-container').classList.remove('hidden');
    setCanvasSize();
}

function drawAvatarPreview(ctx, type) {
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 120;

    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3 * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const avatarDrawers = {
        classic: () => drawClassicAvatar(ctx, centerX, centerY, scale),
        round: () => drawRoundAvatar(ctx, centerX, centerY, scale),
        minimal: () => drawMinimalAvatar(ctx, centerX, centerY, scale)
    };

    avatarDrawers[type]?.();
}

function drawClassicAvatar(ctx, centerX, centerY, scale) {
    // Head
    ctx.beginPath();
    ctx.arc(centerX, centerY - 10 * scale, 20 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Eye
    ctx.beginPath();
    ctx.moveTo(centerX + 10 * scale, centerY - 20 * scale);
    ctx.lineTo(centerX + 10 * scale, centerY - 10 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + 5 * scale, centerY - 15 * scale);
    ctx.lineTo(centerX + 15 * scale, centerY - 15 * scale);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(centerX - 10 * scale, centerY + 20 * scale);
    ctx.lineTo(centerX - 10 * scale, centerY + 35 * scale);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + 10 * scale, centerY + 20 * scale);
    ctx.lineTo(centerX + 10 * scale, centerY + 35 * scale);
    ctx.stroke();
}

function drawRoundAvatar(ctx, centerX, centerY, scale) {
    // Face
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes
    ctx.beginPath();
    ctx.arc(centerX - 5 * scale, centerY - 5 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX + 5 * scale, centerY - 5 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.stroke();

    // Smile
    ctx.beginPath();
    ctx.arc(centerX, centerY + 8 * scale, 10 * scale, 0, Math.PI);
    ctx.stroke();
}

function drawMinimalAvatar(ctx, centerX, centerY, scale) {
    // Body
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 20 * scale);
    ctx.lineTo(centerX, centerY + 20 * scale);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(centerX - 15 * scale, centerY - 5 * scale);
    ctx.lineTo(centerX + 15 * scale, centerY - 5 * scale);
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(centerX, centerY - 20 * scale, 5 * scale, 0, Math.PI * 2);
    ctx.stroke();
}

// Drawing Functions
function drawCharacter() {
    ctx.save();
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const characterDrawers = {
        classic: () => drawClassicCharacter(),
        round: () => drawRoundCharacter(),
        minimal: () => drawMinimalCharacter()
    };

    characterDrawers[selectedAvatar]?.();
    ctx.restore();
}

function drawClassicCharacter() {
    if (character.ducking && !character.jumping) {
        // Ducking pose
        ctx.beginPath();
        ctx.arc(character.x + 20, character.y + 20, 12, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(character.x + 32, character.y + 16);
        ctx.lineTo(character.x + 32, character.y + 24);
        ctx.stroke();
    } else {
        // Standing/jumping pose
        ctx.beginPath();
        ctx.arc(character.x + 16, character.y + 16, 16, 0, Math.PI * 2);
        ctx.stroke();

        // Eye
        ctx.beginPath();
        ctx.moveTo(character.x + 24, character.y + 8);
        ctx.lineTo(character.x + 24, character.y + 16);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(character.x + 20, character.y + 12);
        ctx.lineTo(character.x + 28, character.y + 12);
        ctx.stroke();

        // Animated legs
        const legOffset = Math.floor(frameCount / 8) % 2 === 0 ? 0 : 3;
        ctx.beginPath();
        ctx.moveTo(character.x + 8, character.y + 32);
        ctx.lineTo(character.x + 8, character.y + 42 + legOffset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(character.x + 24, character.y + 32);
        ctx.lineTo(character.x + 24, character.y + 42 - legOffset);
        ctx.stroke();
    }
}

function drawRoundCharacter() {
    const size = character.ducking ? 18 : 20;
    
    // Face
    ctx.beginPath();
    ctx.arc(character.x + 16, character.y + size, size, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes
    ctx.beginPath();
    ctx.arc(character.x + 12, character.y + size - 5, 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(character.x + 20, character.y + size - 5, 2, 0, Math.PI * 2);
    ctx.stroke();

    // Smile
    ctx.beginPath();
    ctx.arc(character.x + 16, character.y + size + 5, 8, 0, Math.PI);
    ctx.stroke();
}

function drawMinimalCharacter() {
    const height = character.ducking ? 25 : 35;
    
    // Body
    ctx.beginPath();
    ctx.moveTo(character.x + 16, character.y + 5);
    ctx.lineTo(character.x + 16, character.y + height);
    ctx.stroke();

    // Arms
    ctx.beginPath();
    ctx.moveTo(character.x + 5, character.y + 15);
    ctx.lineTo(character.x + 27, character.y + 15);
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(character.x + 16, character.y + 5, 4, 0, Math.PI * 2);
    ctx.stroke();
}

function drawGround() {
    ctx.strokeStyle = COLORS.black;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Main ground line
    ctx.beginPath();
    ctx.moveTo(0, ground.y);
    ctx.lineTo(canvas.width, ground.y);
    ctx.stroke();

    // Animated ground details
    const spacing = 60;
    const offset = (frameCount * gameSpeed) % spacing;

    for (let x = 0; x < canvas.width + spacing; x += spacing) {
        const posX = x - offset;

        ctx.beginPath();
        ctx.moveTo(posX, ground.y + 5);
        ctx.lineTo(posX, ground.y + 15);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(posX + spacing / 2, ground.y + 8);
        ctx.lineTo(posX + spacing / 2, ground.y + 12);
        ctx.stroke();
    }
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.save();
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (obstacle.type === 'pipe') {
            drawPipeObstacle(obstacle);
        } else {
            drawGoombaObstacle(obstacle);
        }

        ctx.restore();
    });
}

function drawPipeObstacle(obstacle) {
    ctx.beginPath();
    ctx.roundRect(obstacle.x + 4, obstacle.y + 4, obstacle.width - 8, obstacle.height - 8, 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(obstacle.x + 12, obstacle.y + 12, obstacle.width - 24, obstacle.height - 24, 4);
    ctx.stroke();
}

function drawGoombaObstacle(obstacle) {
    const bounce = Math.sin(frameCount * 0.15) * 2;
    const y = obstacle.y + bounce;
    const centerX = obstacle.x + obstacle.width / 2;
    const centerY = y + obstacle.height / 2;

    // Face
    ctx.beginPath();
    ctx.arc(centerX, centerY, obstacle.width / 2 - 2, 0, Math.PI * 2);
    ctx.stroke();

    // Eyes
    ctx.beginPath();
    ctx.arc(centerX - 6, centerY - 4, 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX + 6, centerY - 4, 2, 0, Math.PI * 2);
    ctx.stroke();

    // Frown
    ctx.beginPath();
    ctx.arc(centerX, centerY + 6, 6, 0, Math.PI);
    ctx.stroke();
}

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.save();
        ctx.strokeStyle = COLORS.black;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.arc(cloud.x + 15, cloud.y + 12, 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cloud.x + 32, cloud.y + 8, 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cloud.x + 48, cloud.y + 12, 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    });
}

// Update Functions
function createObstacle() {
    const type = Math.random() > 0.5 ? 'pipe' : 'goomba';
    obstacles.push({
        x: canvas.width,
        width: type === 'pipe' ? 32 : 24,
        height: type === 'pipe' ? 48 : 24,
        y: type === 'pipe' ? ground.y - 48 : ground.y - 24,
        type
    });
}

function updateObstacles() {
    if (!gameRunning) return;

    obstacles.forEach(obstacle => obstacle.x -= gameSpeed);
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

    if (frameCount % obstacleFrequency === 0) {
        createObstacle();
    }
}

function createCloud() {
    clouds.push({
        x: canvas.width,
        y: Math.random() * 80 + 20,
        width: 40,
        height: 20
    });
}

function updateClouds() {
    if (!gameRunning) return;

    clouds.forEach(cloud => cloud.x -= gameSpeed * 0.5);
    clouds = clouds.filter(cloud => cloud.x + cloud.width > 0);

    if (frameCount % 200 === 0) {
        createCloud();
    }
}

function updateCharacter() {
    if (!character.jumping) return;

    character.velocityY += gravity;
    character.y += character.velocityY;

    const groundLevel = canvas.height - 100;
    if (character.y >= groundLevel) {
        character.y = groundLevel;
        character.velocityY = 0;
        character.jumping = false;
        character.jumpsRemaining = character.maxJumps;
    }
}

// Character Actions
function jump() {
    if (character.ducking || character.jumpsRemaining <= 0) return;

    const config = isMobile ? GAME_CONFIG.mobile : GAME_CONFIG.desktop;
    character.velocityY = config.jumpVelocity;
    character.jumping = true;
    character.jumpsRemaining--;
    playSound(SOUNDS.jump);
}

function duck(isDucking) {
    if (!character.jumping) {
        character.ducking = isDucking;
    }
}

// Game Logic
function checkCollision() {
    const characterBox = {
        x: character.x + 5,
        y: character.ducking ? character.y + 20 : character.y,
        width: character.width - 10,
        height: character.ducking ? character.height - 20 : character.height
    };

    return obstacles.some(obstacle => 
        characterBox.x < obstacle.x + obstacle.width &&
        characterBox.x + characterBox.width > obstacle.x &&
        characterBox.y < obstacle.y + obstacle.height &&
        characterBox.y + characterBox.height > obstacle.y
    );
}

function updateScore() {
    if (!gameRunning) return;

    score++;
    scoreElement.textContent = Math.floor(score / 10);

    if (score % 500 === 0) {
        increaseDifficulty();
    }
}

function increaseDifficulty() {
    const config = isMobile ? GAME_CONFIG.mobile : GAME_CONFIG.desktop;
    gameSpeed += config.speedIncrement;
    obstacleFrequency = Math.max(config.minFrequency, obstacleFrequency - config.frequencyDecrement);
}

function gameOver() {
    gameRunning = false;
    controlsDisabled = true;
    gameOverElement.classList.remove('hidden');
    canvas.style.filter = 'brightness(0.5)';
    canvas.classList.add('shake');
    playSound(SOUNDS.gameOver);
    
    setTimeout(() => canvas.classList.remove('shake'), 500);
    setTimeout(() => controlsDisabled = false, 1000);
}

function resetGame() {
    gameRunning = true;
    score = 0;
    frameCount = 0;
    obstacles = [];
    clouds = [];
    
    const config = isMobile ? GAME_CONFIG.mobile : GAME_CONFIG.desktop;
    gameSpeed = config.gameSpeed;
    obstacleFrequency = config.obstacleFrequency;
    gravity = config.gravity;

    character.y = canvas.height - 100;
    character.velocityY = 0;
    character.jumping = false;
    character.ducking = false;
    character.jumpsRemaining = character.maxJumps;
    
    gameOverElement.classList.add('hidden');
    document.querySelector('.instructions').style.visibility = 'hidden';
    canvas.style.filter = '';
    scoreElement.textContent = '0';
}

// Game Loop
function gameLoop() {
    // Clear and draw background
    ctx.fillStyle = COLORS.red;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw scene
    drawClouds();
    drawGround();
    drawCharacter();
    drawObstacles();

    // Update game state
    if (gameRunning) {
        updateCharacter();
        updateClouds();
        updateObstacles();
        updateScore();
        frameCount++;

        if (checkCollision()) {
            gameOver();
        }
    }

    requestAnimationFrame(gameLoop);
}

// Event Handlers
function handleKeyDown(e) {
    if (e.code === 'Escape') {
        e.preventDefault();
        exitToAvatarSelection();
        return;
    }
    
    if (e.code === 'Space') {
        e.preventDefault();
        if (controlsDisabled) return;
        
        if (!gameRunning) {
            resetGame();
        } else {
            jump();
        }
    }
    
    if (e.code === 'ArrowDown') {
        e.preventDefault();
        duck(true);
    }
}

function handleKeyUp(e) {
    if (e.code === 'ArrowDown') {
        e.preventDefault();
        duck(false);
    }
}

function handleTouchStart(e) {
    e.preventDefault();
    if (controlsDisabled) return;
    
    if (!gameRunning) {
        resetGame();
    } else {
        jump();
    }
}

function handleTouchEnd(e) {
    e.preventDefault();
}

// Initialization
function init() {
    setCanvasSize();
    initAvatarSelection();
    
    // Event listeners
    window.addEventListener('resize', setCanvasSize);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchend', handleTouchEnd);
    document.getElementById('exit').addEventListener('click', exitToAvatarSelection);
    
    // Start game loop
    gameLoop();
}

// Start the game
init();
