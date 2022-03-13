const CELL_SIZE = 20;
// Set canvas size menjadi 600
const CANVAS_SIZE = 600;
const REDRAW_INTERVAL = 50;
const WIDTH = CANVAS_SIZE / CELL_SIZE;
const HEIGHT = CANVAS_SIZE / CELL_SIZE;
const DIRECTION = {
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3,
}

var moveInterval = 120;
var moveTimeout;

// Indikator untuk menunjukkan level
var currLevel = 1;

// Array untuk desain level
const levelDesign = [
    // Level 1
    [],
    // level 2
    [
        [
            100, 210, 500, 210
        ]
    ],
    // level 3
    [
        [
            100, 210, 500, 210
        ],
        [
            100, 310, 500, 310
        ]
    ],
    // level 4
    [
        [
            100, 210, 500, 210
        ],
        [
            100, 310, 500, 310
        ],
        [
            100, 410, 500, 410
        ]
    ],
    // level 5
    [
        [
            90, 60, 90, 540
        ],
        [
            510, 60, 510, 540
        ]
    ]
]

function changeLevelDisplay() {
    document.getElementById('curr-level').innerHTML = currLevel
    document.getElementById('curr-speed').innerHTML = moveInterval
}

function initPosition() {
    return {
        x: Math.floor(Math.random() * WIDTH),
        y: Math.floor(Math.random() * HEIGHT),
    }
}

function initHeadAndBody() {
    let head = initPosition();
    let body = [{
        x: head.x,
        y: head.y
    }];
    return {
        head: head,
        body: body,
    }
}

function initDirection() {
    return Math.floor(Math.random() * 4);
}

function initSnake(color) {
    return {
        color: color,
        ...initHeadAndBody(),
        direction: initDirection(),
        score: 0,
        lives: 3
    }
}
let snake1 = initSnake("purple");

let apples = [{
        color: "red",
        position: initPosition(),
    },
    {
        color: "green",
        position: initPosition(),
    }
]

let hearth = {
    position: initPosition(),
    isShowed: false,
    canBeEaten: false
}

function drawCell(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawHead(ctx, snake) {
    // LEFT: 0,
    // RIGHT: 1,
    // UP: 2,
    // DOWN: 3,
    var img = document.getElementById("head");
    var headCanvas = document.createElement('canvas');
    headCanvas.width = CELL_SIZE;
    headCanvas.height = CELL_SIZE;
    var headCtx = headCanvas.getContext('2d');
    headCtx.save();
    headCtx.translate(CELL_SIZE/2,CELL_SIZE/2);
    // LEFT
    if(snake.direction==0){
        headCtx.rotate(Math.PI/2);
    }
    // RIGHT
    else if(snake.direction==1){
        headCtx.rotate(-Math.PI/2);
    }
    // UP
    else if(snake.direction==2){
        headCtx.rotate(-Math.PI);
    }
    
    headCtx.translate(-CELL_SIZE/2,-CELL_SIZE/2);
    headCtx.drawImage(img, 0,0, CELL_SIZE, CELL_SIZE);
    headCtx.restore();

    ctx.drawImage(headCanvas, snake.head.x * CELL_SIZE, snake.head.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawBody(ctx, x, y) {
    var img = document.getElementById("body");
    ctx.drawImage(img, x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function drawScore(snake) {
    let scoreCanvas;
    if (snake.color == snake1.color) {
        scoreCanvas = document.getElementById("score1Board");
    }
    let scoreCtx = scoreCanvas.getContext("2d");

    scoreCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    scoreCtx.font = "30px Arial";
    scoreCtx.fillStyle = snake.color
    scoreCtx.fillText(snake.score, 10, scoreCanvas.scrollHeight / 2);
}

function drawObstacle(ctx) {
    ctx.beginPath();
    let levelDes = levelDesign[currLevel - 1];
    ctx.strokeStyle = 'black';
    for (let i = 0; i < levelDes.length; i++) {
        for (let j = 0; j < levelDes[i].length - 2; j += 2) {
            ctx.moveTo(levelDes[i][j], levelDes[i][j + 1]);
            ctx.lineTo(levelDes[i][j + 2], levelDes[i][j + 3]);
            ctx.lineWidth = CELL_SIZE;
            ctx.stroke();
        }
    }
}

function checkSnakeObstacleCol(snake) {
    let levelDes = levelDesign[currLevel - 1];
    for (let i = 0; i < levelDes.length; i++) {
        for (let j = 0; j < levelDes[i].length - 2; j += 2) {
            if (snake.head.x * CELL_SIZE + CELL_SIZE / 2 >= levelDes[i][j] &&
                snake.head.x * CELL_SIZE + CELL_SIZE / 2 <= levelDes[i][j + 2] &&
                snake.head.y * CELL_SIZE + CELL_SIZE / 2 >= levelDes[i][j + 1] &&
                snake.head.y * CELL_SIZE + CELL_SIZE / 2 <= levelDes[i][j + 3]) {
                reduseSnakeHealth(snake)
            }
        }
    }
}

// Kadang apel dan nyawa akan spawn di obstacle, maka dibuat function ini untuk mengecek lokasi apel dan nyawa apakah bertabrakan
function checkObjObstacleCol(apple) {
    let levelDes = levelDesign[currLevel - 1];
    for (let i = 0; i < levelDes.length; i++) {
        for (let j = 0; j < levelDes[i].length - 2; j += 2) {
            if (apple.position.x * CELL_SIZE + CELL_SIZE / 2 >= levelDes[i][j] &&
                apple.position.x * CELL_SIZE + CELL_SIZE / 2 <= levelDes[i][j + 2] &&
                apple.position.y * CELL_SIZE + CELL_SIZE / 2 >= levelDes[i][j + 1] &&
                apple.position.y * CELL_SIZE + CELL_SIZE / 2 <= levelDes[i][j + 3]) {
                return true
            }
        }
    }
    return false
}

function isPrime(number) {
    let isPrime = true;

    // check if number is equal to 1
    if (number === 1) {
        isPrime = false;
    }

    // check if number is greater than 1
    else if (number > 1) {
        // looping through 2 to number-1
        for (let i = 2; i < number; i++) {
            if (number % i == 0) {
                isPrime = false;
                break;
            }
        }
    }

    // check if number is less than 1
    else {
        isPrime = false;
    }

    return isPrime;
}

function hearthBlinking(snake) {

    // Di video pas bilangan primanya mulai dari 7
    if (snake.score > 7 && isPrime(snake.score - 1)) {
        if (checkObjObstacleCol(hearth)) {
            do {
                hearth.position = initPosition();
            } while (checkObjObstacleCol(hearth))
        }

        hearth.isShowed = !hearth.isShowed
        hearth.canBeEaten = true
    } else {
        hearth.isShowed = false
    }
}

function draw() {
    initGame();
    setInterval(function () {
        let snakeCanvas = document.getElementById("snakeBoard");
        let ctx = snakeCanvas.getContext("2d");

        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        drawObstacle(ctx);
        drawHead(ctx, snake1);
        for (let i = 1; i < snake1.body.length; i++) {
            drawBody(ctx, snake1.body[i].x, snake1.body[i].y);
        }


        for (let i = 0; i < apples.length; i++) {
            let apple = apples[i];

            var img = document.getElementById("apple");
            ctx.drawImage(img, apple.position.x * CELL_SIZE, apple.position.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }

        for (let i = 0; i < snake1.lives; i++) {
            var img = document.getElementById("lives");
            ctx.drawImage(img, i * CELL_SIZE, 0, CELL_SIZE, CELL_SIZE);
        }
        if (hearth.isShowed) {
            let hearthImg = document.getElementById("lives");
            ctx.drawImage(hearthImg, hearth.position.x * CELL_SIZE, hearth.position.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
        drawScore(snake1);
    }, REDRAW_INTERVAL);
}

function teleport(snake) {
    if (snake.head.x < 0) {
        snake.head.x = CANVAS_SIZE / CELL_SIZE - 1;
    }
    if (snake.head.x >= WIDTH) {
        snake.head.x = 0;
    }
    if (snake.head.y < 0) {
        snake.head.y = CANVAS_SIZE / CELL_SIZE - 1;
    }
    if (snake.head.y >= HEIGHT) {
        snake.head.y = 0;
    }
}

function eat(snake, apples) {
    for (let i = 0; i < apples.length; i++) {
        let apple = apples[i];
        if (snake.head.x == apple.position.x && snake.head.y == apple.position.y) {
            afterEat(snake)
            var audio = new Audio("assets/sound/eat-appel.wav");
            audio.play();
            apple.position = initPosition();

        }
        if (checkObjObstacleCol(apple)) {
            do {
                apple.position = initPosition();
            } while (checkObjObstacleCol(apple))
        }
    }

    if (snake.head.x == hearth.position.x && snake.head.y == hearth.position.y && hearth.canBeEaten) {
        afterEat(snake);
        snake.lives++;
        hearth.canBeEaten = false;
    }
}

function afterEat(snake) {
    snake.score++;
    snake.body.push({
        x: snake.head.x,
        y: snake.head.y
    });
    if (snake.score % 5 == 0 && currLevel < 5) {
        var audio = new Audio('assets/sound/level-up.mp3');
        audio.play();
        alert(`Level ${currLevel} complete`);
        currLevel++;
        moveInterval -= 20;
        changeLevelDisplay();
    }
}

function moveLeft(snake) {
    snake.head.x--;
    teleport(snake);
    eat(snake, apples);
}

function moveRight(snake) {
    snake.head.x++;
    teleport(snake);
    eat(snake, apples);
}

function moveDown(snake) {
    snake.head.y++;
    teleport(snake);
    eat(snake, apples);
}

function moveUp(snake) {
    snake.head.y--;
    teleport(snake);
    eat(snake, apples);
}

function checkCollision(snakes) {
    let isCollide = false;

    for (let k = 1; k < snakes.body.length; k++) {
        if (snakes.head.x == snakes.body[k].x && snakes.head.y == snakes.body[k].y) {
            isCollide = true;
        }
    }
    return isCollide;
}

function gameOver() {
    var audio = new Audio('assets/sound/game-over.mp3');
    audio.play();

    alert("Game over");
    snake1 = initSnake("purple");
    initGame();
}

function move(snake) {
    switch (snake.direction) {
        case DIRECTION.LEFT:
            moveLeft(snake);
            break;
        case DIRECTION.RIGHT:
            moveRight(snake);
            break;
        case DIRECTION.DOWN:
            moveDown(snake);
            break;
        case DIRECTION.UP:
            moveUp(snake);
            break;
    }
    moveBody(snake);
    hearthBlinking(snake);
    if (!checkCollision(snake)) {
        moveTimeout = setTimeout(function () {
            move(snake);
        }, moveInterval);
    } else {
        reduseSnakeHealth(snake)
    }
    checkSnakeObstacleCol(snake)
}

function moveBody(snake) {
    snake.body.unshift({
        x: snake.head.x,
        y: snake.head.y
    });
    snake.body.pop();
}

function turn(snake, direction) {
    const oppositeDirections = {
        [DIRECTION.LEFT]: DIRECTION.RIGHT,
        [DIRECTION.RIGHT]: DIRECTION.LEFT,
        [DIRECTION.DOWN]: DIRECTION.UP,
        [DIRECTION.UP]: DIRECTION.DOWN,
    }

    if (direction !== oppositeDirections[snake.direction]) {
        snake.direction = direction;
    }
}

document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
        turn(snake1, DIRECTION.LEFT);
    } else if (event.key === "ArrowRight") {
        turn(snake1, DIRECTION.RIGHT);
    } else if (event.key === "ArrowUp") {
        turn(snake1, DIRECTION.UP);
    } else if (event.key === "ArrowDown") {
        turn(snake1, DIRECTION.DOWN);
    }

})

function reduseSnakeHealth(snake) {
    clearTimeout(moveTimeout)
    let head = initPosition();
    snake.head = head;
    let body = [{
        x: head.x,
        y: head.y
    }];
    snake.body = body;
    snake.lives--;
    if (snake.lives < 1) {
        gameOver();
    } else {
        move(snake);
    }
}

function initGame() {
    move(snake1);
    moveInterval = 120;
    currLevel = 1;
    changeLevelDisplay();
}