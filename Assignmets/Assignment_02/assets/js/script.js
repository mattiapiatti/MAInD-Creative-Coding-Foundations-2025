const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

const rootStyles = getComputedStyle(document.documentElement);
const colorRed = rootStyles.getPropertyValue('--color-red').trim();
const colorBeige = rootStyles.getPropertyValue('--color-beige').trim();
const colorGray = rootStyles.getPropertyValue('--color-gray').trim();
const colorBlack = rootStyles.getPropertyValue('--color-black').trim();

const jumpSound = document.getElementById('jumpSound');
const gameOverSound = document.getElementById('gameOverSound');
const selectSound = document.getElementById('selectSound');

let selectedAvatar = 'classic';
let gameRunning = false;
let score = 0;
let gameSpeed = 5;
let gravity = 0.6;
let controlsDisabled = false;

const character = {
    x: 80,
    y: 300,
    width: 32,
    height: 32,
    velocityY: 0,
    jumping: false,
    ducking: false
};

const ground = {
    y: 340,
    height: 60
};

let obstacles = [];
let clouds = [];
let frameCount = 0;
let obstacleFrequency = 150;

// Set canvas size
function setCanvasSize() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        canvas.width = 300;
        canvas.height = 500;
        character.x = 50;
        character.y = canvas.height - 100;
        ground.y = canvas.height - 60;
    } else {
        canvas.width = 800;
        canvas.height = 400;
        character.x = 80;
        character.y = canvas.height - 100;
        ground.y = canvas.height - 60;
    }

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

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

// Avatar selection
function initAvatarSelection() {
    const avatarBtns = document.querySelectorAll('.avatar-btn');

    avatarBtns.forEach((btn, index) => {
        const previewCanvas = btn.querySelector('.avatar-preview');
        const previewCtx = previewCanvas.getContext('2d');
        const avatarType = btn.dataset.avatar;

        // Set canvas size to match CSS dimensions
        const computedStyle = getComputedStyle(previewCanvas);
        const width = parseInt(computedStyle.width);
        const height = parseInt(computedStyle.height);
        previewCanvas.width = width;
        previewCanvas.height = height;

        drawAvatarPreview(previewCtx, avatarType);

        btn.addEventListener('click', () => {
            selectedAvatar = avatarType;
            playSound(selectSound);
            document.querySelector('.avatar-selection').classList.add('hidden');
            document.querySelector('.main-container').classList.remove('hidden');
            setCanvasSize();
        });
    });
}

// Draw avatar preview
function drawAvatarPreview(ctx, type) {
    const canvas = ctx.canvas;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const scale = Math.min(canvas.width, canvas.height) / 120; // Scale based on 120px reference

    ctx.strokeStyle = colorBlack;
    ctx.lineWidth = 3 * scale;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (type === 'classic') {
        ctx.beginPath();
        ctx.arc(centerX, centerY - 10 * scale, 20 * scale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + 10 * scale, centerY - 20 * scale);
        ctx.lineTo(centerX + 10 * scale, centerY - 10 * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + 5 * scale, centerY - 15 * scale);
        ctx.lineTo(centerX + 15 * scale, centerY - 15 * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - 10 * scale, centerY + 20 * scale);
        ctx.lineTo(centerX - 10 * scale, centerY + 35 * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + 10 * scale, centerY + 20 * scale);
        ctx.lineTo(centerX + 10 * scale, centerY + 35 * scale);
        ctx.stroke();
    } else if (type === 'round') {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25 * scale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX - 5 * scale, centerY - 5 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX + 5 * scale, centerY - 5 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY + 8 * scale, 10 * scale, 0, Math.PI);
        ctx.stroke();
    } else if (type === 'minimal') {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 20 * scale);
        ctx.lineTo(centerX, centerY + 20 * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - 15 * scale, centerY - 5 * scale);
        ctx.lineTo(centerX + 15 * scale, centerY - 5 * scale);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY - 20 * scale, 5 * scale, 0, Math.PI * 2);
        ctx.stroke();
    }
}// Draw character
function drawCharacter() {
    ctx.save();

    ctx.strokeStyle = colorBlack;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (selectedAvatar === 'classic') {
        if (character.ducking && !character.jumping) {
            ctx.beginPath();
            ctx.arc(character.x + 20, character.y + 20, 12, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(character.x + 32, character.y + 16);
            ctx.lineTo(character.x + 32, character.y + 24);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(character.x + 16, character.y + 16, 16, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(character.x + 24, character.y + 8);
            ctx.lineTo(character.x + 24, character.y + 16);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(character.x + 20, character.y + 12);
            ctx.lineTo(character.x + 28, character.y + 12);
            ctx.stroke();

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
    } else if (selectedAvatar === 'round') {
        const size = character.ducking ? 18 : 20;
        ctx.beginPath();
        ctx.arc(character.x + 16, character.y + size, size, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(character.x + 12, character.y + size - 5, 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(character.x + 20, character.y + size - 5, 2, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(character.x + 16, character.y + size + 5, 8, 0, Math.PI);
        ctx.stroke();
    } else if (selectedAvatar === 'minimal') {
        const height = character.ducking ? 25 : 35;
        ctx.beginPath();
        ctx.moveTo(character.x + 16, character.y + 5);
        ctx.lineTo(character.x + 16, character.y + height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(character.x + 5, character.y + 15);
        ctx.lineTo(character.x + 27, character.y + 15);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(character.x + 16, character.y + 5, 4, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

// Draw ground
function drawGround() {
    ctx.strokeStyle = colorBlack;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(0, ground.y);
    ctx.lineTo(canvas.width, ground.y);
    ctx.stroke();

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

// Create obstacle
function createObstacle() {
    const type = Math.random() > 0.5 ? 'pipe' : 'goomba';
    const obstacle = {
        x: canvas.width,
        width: type === 'pipe' ? 32 : 24,
        height: type === 'pipe' ? 48 : 24,
        y: type === 'pipe' ? ground.y - 48 : ground.y - 24,
        type: type
    };
    obstacles.push(obstacle);
}

// Draw obstacles
function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.save();

        ctx.strokeStyle = colorBlack;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (obstacle.type === 'pipe') {
            ctx.beginPath();
            ctx.roundRect(obstacle.x + 4, obstacle.y + 4, obstacle.width - 8, obstacle.height - 8, 8);
            ctx.stroke();

            ctx.beginPath();
            ctx.roundRect(obstacle.x + 12, obstacle.y + 12, obstacle.width - 24, obstacle.height - 24, 4);
            ctx.stroke();
        } else {
            const bounce = Math.sin(frameCount * 0.15) * 2;
            const y = obstacle.y + bounce;

            ctx.beginPath();
            ctx.arc(obstacle.x + obstacle.width / 2, y + obstacle.height / 2, obstacle.width / 2 - 2, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(obstacle.x + obstacle.width / 2 - 6, y + obstacle.height / 2 - 4, 2, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(obstacle.x + obstacle.width / 2 + 6, y + obstacle.height / 2 - 4, 2, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(obstacle.x + obstacle.width / 2, y + obstacle.height / 2 + 6, 6, 0, Math.PI);
            ctx.stroke();
        }

        ctx.restore();
    });
}

// Update obstacles
function updateObstacles() {
    if (gameRunning) {
        obstacles.forEach(obstacle => {
            obstacle.x -= gameSpeed;
        });

        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);

        if (frameCount % obstacleFrequency === 0) {
            createObstacle();
        }
    }
}

// Create cloud
function createCloud() {
    clouds.push({
        x: canvas.width,
        y: Math.random() * 80 + 20,
        width: 40,
        height: 20
    });
}

// Draw clouds
function drawClouds() {
    clouds.forEach(cloud => {
        ctx.save();

        ctx.strokeStyle = colorBlack;
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

// Update clouds
function updateClouds() {
    if (gameRunning) {
        clouds.forEach(cloud => {
            cloud.x -= gameSpeed * 0.5;
        });

        clouds = clouds.filter(cloud => cloud.x + cloud.width > 0);

        if (frameCount % 200 === 0) {
            createCloud();
        }
    }
}

// Jump
function jump() {
    if (!character.jumping && !character.ducking) {
        character.velocityY = -12;
        character.jumping = true;
        playSound(jumpSound);
    }
}

// Duck
function duck(isDucking) {
    if (!character.jumping) {
        character.ducking = isDucking;
    }
}

// Update character
function updateCharacter() {
    if (character.jumping) {
        character.velocityY += gravity;
        character.y += character.velocityY;

        const groundLevel = canvas.height - 100;
        if (character.y >= groundLevel) {
            character.y = groundLevel;
            character.velocityY = 0;
            character.jumping = false;
        }
    }
}

// Check collision
function checkCollision() {
    const characterBox = {
        x: character.x + 5,
        y: character.ducking ? character.y + 20 : character.y,
        width: character.width - 10,
        height: character.ducking ? character.height - 20 : character.height
    };

    for (let obstacle of obstacles) {
        if (characterBox.x < obstacle.x + obstacle.width &&
            characterBox.x + characterBox.width > obstacle.x &&
            characterBox.y < obstacle.y + obstacle.height &&
            characterBox.y + characterBox.height > obstacle.y) {
            return true;
        }
    }
    return false;
}

// Update score
function updateScore() {
    if (gameRunning) {
        const oldScore = Math.floor(score / 10);
        score++;
        const newScore = Math.floor(score / 10);
        scoreElement.textContent = newScore;

        if (score % 500 === 0) {
            gameSpeed += 0.5;
            obstacleFrequency = Math.max(100, obstacleFrequency - 5);
        }
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    controlsDisabled = true;
    gameOverElement.classList.remove('hidden');
    canvas.style.filter = 'brightness(0.5)';
    canvas.classList.add('shake');
    playSound(gameOverSound);
    setTimeout(() => canvas.classList.remove('shake'), 500);
    setTimeout(() => controlsDisabled = false, 1000);
}

// Play sound
function playSound(audio) {
    audio.currentTime = 0;
    audio.play().catch(e => console.log('Audio play failed:', e));
}

// Reset game
function resetGame() {
    gameRunning = true;
    score = 0;
    gameSpeed = 5;
    obstacleFrequency = 150;
    obstacles = [];
    clouds = [];
    frameCount = 0;

    character.y = canvas.height - 100;
    character.velocityY = 0;
    character.jumping = false;
    character.ducking = false;
    gameOverElement.classList.add('hidden');
    document.querySelector('.instructions').style.visibility = 'hidden';
    canvas.style.filter = '';
    scoreElement.textContent = '0';
}

// Game loop
function gameLoop() {
    ctx.fillStyle = colorRed;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawClouds();
    updateClouds();
    drawGround();
    drawCharacter();
    drawObstacles();

    if (gameRunning) {
        updateCharacter();
        updateObstacles();
        updateScore();
        frameCount++;

        if (checkCollision()) {
            gameOver();
        }
    }

    requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
        e.preventDefault();
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
        gameSpeed = 5;
        obstacleFrequency = 150;
        scoreElement.textContent = '0';
        character.y = canvas.height - 100;
        character.velocityY = 0;
        character.jumping = false;
        character.ducking = false;
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
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowDown') {
        e.preventDefault();
        duck(false);
    }
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (controlsDisabled) return;
    if (!gameRunning) {
        resetGame();
    } else {
        jump();
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
});

// Exit to avatar selection
document.getElementById('exit').addEventListener('click', () => {
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
    gameSpeed = 5;
    obstacleFrequency = 150;
    scoreElement.textContent = '0';
    character.y = canvas.height - 100;
    character.velocityY = 0;
    character.jumping = false;
    character.ducking = false;
});

// Initialize
initAvatarSelection();
gameLoop();
