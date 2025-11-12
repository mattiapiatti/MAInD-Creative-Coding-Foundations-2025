const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

canvas.width = 800;
canvas.height = 200;

let gameRunning = false;
let score = 0;
let gameSpeed = 5;
let gravity = 0.6;

const dino = {
    x: 50,
    y: canvas.height - 50,
    width: 40,
    height: 50,
    velocityY: 0,
    jumping: false,
    ducking: false
};

const ground = {
    y: canvas.height - 10,
    height: 10
};

let obstacles = [];
let clouds = [];
let frameCount = 0;
let obstacleFrequency = 150;

function drawDino() {
    ctx.fillStyle = '#535353';
    
    if (dino.ducking && !dino.jumping) {
        ctx.fillRect(dino.x, dino.y + 20, dino.width, dino.height - 20);
        ctx.fillRect(dino.x + 10, dino.y + 10, dino.width - 10, 10);
    } else {
        ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
        ctx.fillRect(dino.x + dino.width / 2 - 5, dino.y - 10, 10, 10);
        
        const legOffset = Math.floor(frameCount / 10) % 2 === 0 ? 0 : 5;
        ctx.fillRect(dino.x + 5, dino.y + dino.height, 8, 10 + legOffset);
        ctx.fillRect(dino.x + 25, dino.y + dino.height, 8, 10 - legOffset);
    }
}

function drawGround() {
    ctx.fillStyle = '#535353';
    ctx.fillRect(0, ground.y, canvas.width, ground.height);
    
    const lineSpacing = 20;
    for (let i = 0; i < canvas.width; i += lineSpacing) {
        const offset = (frameCount * gameSpeed) % lineSpacing;
        ctx.fillRect(i - offset, ground.y - 2, 10, 2);
    }
}

function createObstacle() {
    const type = Math.random() > 0.5 ? 'cactus' : 'bird';
    const obstacle = {
        x: canvas.width,
        width: type === 'cactus' ? 20 : 40,
        height: type === 'cactus' ? 40 : 30,
        y: type === 'cactus' ? ground.y - 40 : ground.y - 70,
        type: type
    };
    obstacles.push(obstacle);
}

function drawObstacles() {
    ctx.fillStyle = '#535353';
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'cactus') {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.fillRect(obstacle.x + 5, obstacle.y - 10, 10, 15);
        } else {
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height / 2);
            ctx.fillRect(obstacle.x + 10, obstacle.y + obstacle.height / 2, obstacle.width - 20, obstacle.height / 2);
        }
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
    });
    
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

function drawClouds() {
    ctx.fillStyle = '#d3d3d3';
    clouds.forEach(cloud => {
        ctx.fillRect(cloud.x, cloud.y, cloud.width, cloud.height);
        ctx.fillRect(cloud.x + 10, cloud.y - 10, 20, 10);
        ctx.fillRect(cloud.x + 20, cloud.y - 15, 15, 15);
    });
}

function updateClouds() {
    clouds.forEach(cloud => {
        cloud.x -= gameSpeed * 0.5;
    });
    
    clouds = clouds.filter(cloud => cloud.x + cloud.width > 0);
    
    if (frameCount % 200 === 0) {
        createCloud();
    }
}

function jump() {
    if (!dino.jumping && !dino.ducking) {
        dino.velocityY = -12;
        dino.jumping = true;
    }
}

function duck(isDucking) {
    if (!dino.jumping) {
        dino.ducking = isDucking;
    }
}

function updateDino() {
    if (dino.jumping) {
        dino.velocityY += gravity;
        dino.y += dino.velocityY;
        
        if (dino.y >= canvas.height - 50) {
            dino.y = canvas.height - 50;
            dino.velocityY = 0;
            dino.jumping = false;
        }
    }
}

function checkCollision() {
    const dinoBox = {
        x: dino.x + 5,
        y: dino.ducking ? dino.y + 20 : dino.y,
        width: dino.width - 10,
        height: dino.ducking ? dino.height - 20 : dino.height
    };
    
    for (let obstacle of obstacles) {
        if (dinoBox.x < obstacle.x + obstacle.width &&
            dinoBox.x + dinoBox.width > obstacle.x &&
            dinoBox.y < obstacle.y + obstacle.height &&
            dinoBox.y + dinoBox.height > obstacle.y) {
            return true;
        }
    }
    return false;
}

function updateScore() {
    if (gameRunning) {
        score++;
        scoreElement.textContent = Math.floor(score / 10);
        
        if (score % 500 === 0) {
            gameSpeed += 0.5;
            obstacleFrequency = Math.max(100, obstacleFrequency - 5);
        }
    }
}

function gameOver() {
    gameRunning = false;
    gameOverElement.classList.remove('hidden');
}

function resetGame() {
    gameRunning = true;
    score = 0;
    gameSpeed = 5;
    obstacleFrequency = 150;
    obstacles = [];
    clouds = [];
    frameCount = 0;
    dino.y = canvas.height - 50;
    dino.velocityY = 0;
    dino.jumping = false;
    dino.ducking = false;
    gameOverElement.classList.add('hidden');
    scoreElement.textContent = '0';
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawClouds();
    updateClouds();
    drawGround();
    drawDino();
    drawObstacles();
    
    if (gameRunning) {
        updateDino();
        updateObstacles();
        updateScore();
        frameCount++;
        
        if (checkCollision()) {
            gameOver();
        }
    }
    
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
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

gameLoop();
