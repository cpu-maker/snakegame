class SnakeGame {
  constructor(canvasId, scoreId, statusId, appleCount = 3) {
    this.canvas = document.getElementById(canvasId);
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.ctx = this.canvas.getContext('2d');
    this.scoreEl = document.getElementById(scoreId);
    this.statusEl = document.getElementById(statusId);

    this.grid = 40;  // more cells since canvas is bigger
    this.cellSize = this.canvas.width / this.grid;

    this.snake = [];
    this.dir = {x:1, y:0};
    this.nextDir = {...this.dir};
    this.food = [];
    this.appleCount = appleCount;
    this.score = 0;
    this.running = false;
    this.tickMs = 150;
    this.timer = null;

    this.bindControls();
    this.reset();
  }

  reset() {
    this.snake = [{x: Math.floor(this.grid/2), y: Math.floor(this.grid/2)}];
    this.dir = {x:1, y:0};
    this.nextDir = {...this.dir};
    this.score = 0;
    this.tickMs = 150;
    this.food = [];
    for (let i = 0; i < this.appleCount; i++) this.placeFood();
    this.running = false;
    this.stop();
    this.updateStatus('Ready');
    this.updateScore();
    this.draw();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.updateStatus('Playing');
    this.timer = setInterval(()=>this.tick(), this.tickMs);
  }

  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.running = false;
  }

  updateStatus(msg) { this.statusEl.textContent = msg; }
  updateScore() { this.scoreEl.textContent = this.score; }

  placeFood() {
    while (true) {
      const f = {x: Math.floor(Math.random()*this.grid), y: Math.floor(Math.random()*this.grid)};
      if (!this.snake.some(s=>s.x===f.x && s.y===f.y) && !this.food.some(f2=>f2.x===f.x && f2.y===f.y)) {
        this.food.push(f); 
        break; 
      }
    }
  }

  tick() {
    if (this.nextDir.x !== -this.dir.x || this.nextDir.y !== -this.dir.y) this.dir = {...this.nextDir};
    const head = this.snake[0];
    let nx = head.x + this.dir.x;
    let ny = head.y + this.dir.y;

    // wrap-around
    if (nx < 0) nx = this.grid - 1;
    if (ny < 0) ny = this.grid - 1;
    if (nx >= this.grid) nx = 0;
    if (ny >= this.grid) ny = 0;

    const collided = this.snake.some((s,i)=>i!==0 && s.x===nx && s.y===ny);
    if (collided) { this.gameOver(); return; }

    this.snake.unshift({x:nx, y:ny});

    // eat food
    let ate = false;
    this.food.forEach((f,i)=>{
      if(f.x===nx && f.y===ny){
        ate = true;
        this.score++;
        this.updateScore();
        this.food.splice(i,1);
        this.placeFood();
      }
    });

    if(!ate) this.snake.pop();

    this.draw();
  }

  gameOver() {
    this.stop();
    this.updateStatus('Game Over — Press Restart');
  }

  draw() {
    const ctx = this.ctx;
    ctx.fillStyle = '#081421';
    ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

    // draw food
    this.food.forEach(f=>{
      ctx.fillStyle = '#ff5c5c';
      this.roundRect(ctx, f.x*this.cellSize, f.y*this.cellSize, this.cellSize, this.cellSize, 6);
      ctx.fill();
    });

    // draw snake
    for (let i=0;i<this.snake.length;i++){
      const s = this.snake[i];
      ctx.fillStyle = i===0 ? '#a7f3d0' : '#22c55e';
      this.roundRect(ctx, s.x*this.cellSize, s.y*this.cellSize, this.cellSize, this.cellSize, i===0?6:4);
      ctx.fill();
    }
  }

  roundRect(ctx,x,y,w,h,r){
    const radius = Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+radius, y);
    ctx.arcTo(x+w, y, x+w, y+h, radius);
    ctx.arcTo(x+w, y+h, x, y+h, radius);
    ctx.arcTo(x, y+h, x, y, radius);
    ctx.arcTo(x, y, x+w, y, radius);
    ctx.closePath();
  }

  bindControls() {
    window.addEventListener('keydown', (e)=>{
      const map = {
        ArrowUp:{x:0,y:-1}, ArrowDown:{x:0,y:1}, ArrowLeft:{x:-1,y:0}, ArrowRight:{x:1,y:0},
        w:{x:0,y:-1}, s:{x:0,y:1}, a:{x:-1,y:0}, d:{x:1,y:0},
        W:{x:0,y:-1}, S:{x:0,y:1}, A:{x:-1,y:0}, D:{x:1,y:0}
      };
      if (map[e.key]) this.nextDir = map[e.key];
      if (e.key===' ') this.running ? this.stop() : this.start();
      e.preventDefault();
    });
  }
}

const game = new SnakeGame('game','score','status', 5); // 5 apples at once
document.getElementById('start').onclick = ()=>game.start();
document.getElementById('pause').onclick = ()=>game.running ? game.stop() : game.start();
document.getElementById('restart').onclick = ()=>{game.reset(); game.start();};
