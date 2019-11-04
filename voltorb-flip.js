const State = {
  LOADING: 0,
  READY: 1,
  IDLE: 2,
  GAMEOVER: 3,
}

class Game {
  constructor(x = 5, y = 5){
    this._x = x;
    this._y = y;
    this.points = 1;
    this.total_points = 0;
    this.state = State.LOADING;
    this.Board = new Board(x, y);
    this.level = 0;
  }

  get board(){
    return this.Board.board;
  }

  get level(){
    return this._level;
  }

  set level(level){
    this._level = level;
    this.Board.resetBoard(level);
    document.getElementById('next_level').style.display = 'none';
    this.state = State.READY;
  }

  get points(){
    return this._points || 0;
  }

  set points(points){
    this._points = +points;
    try{
      document.getElementById('points').innerText = points;
    }catch(O_o){}
  }

  get total_points(){
    return this._total_points || 0;
  }

  set total_points(points){
    this._total_points = +points;
    try{
      document.getElementById('total_points').innerText = this._total_points;
    }catch(O_o){}
  }

  checkTile(x, y){
    // Check if game is ready
    if (this.state != State.READY) return;

    // Check the tile
    const tile = this.Board.getTile(x, y);
    const { checked, value } = tile;

    // Have we have already checked this tile
    if (checked) return;

    // Mark the tile as checked
    tile.check();
    document.getElementById(`tile-${x}-${y}`).classList.add('checked');

    // Add the points
    this.points *= value;

    // End the game if it was a voltorb (0 points)
    if (value <= 0) this.end();
    if (this.isCompleted()) this.completeLevel();
  }

  end(){
    this.state = State.END_GAME;
  }

  newGame(){
    this.points = 1;
    this.total_points = 0;
    this.level = 0;
  }

  nextLevel(){
    this.level++;
    this.total_points += this.points;
    this.points = 1;
  }

  isCompleted(){
    return this.Board.isCompleted();
  }

  completeLevel(){
    this.state = State.IDLE;
    confetti.start(3000, 150, 300);
    document.getElementById('next_level').style.display = '';
  }
}

class Board {
  constructor(x = 5, y = 5){
    this._x = x;
    this._y = y;
    this.resetBoard();
  }

  get size() {
    return {
      x: this._x,
      y: this._y,
    };
  }

  get board(){
    const board = Array(this._x).fill(null).map((_x, x) => Array(this._y).fill(null).map((_y, y) => this.getTile(x, y)));
    return board;
  }

  coordToIndex(x, y){
    return (x * this._y) + (y % this._y);
  }

  getTile(x, y){
    return this._board[this.coordToIndex(x, y)];
  }

  isCompleted(){
    return !this._board.filter(tile=>!tile.checked).some(tile=>tile.value>1);
  }

  getInfoX(x){
    const values = {
        points: 0,
        voltorbs: 0,
      };

    const index = x * this._y;

    for (let i = 0; i < this._y; i++){
      const value = this._board[index + i].value;
      if (value <= 0) values.voltorbs++;
      else values.points += value;
    }

    return values;
  }

  getInfoY(y){
    const values = {
        points: 0,
        voltorbs: 0,
      };

    for (let x = 0; x < this._y; x++){
      const value = this._board[(x * this._y) + y].value;
      if (value <= 0) values.voltorbs++;
      else values.points += value;
    }

    return values;
  }

  resetBoard(level = 0){
    // assign each cell a number from 0 → 3
    this._board = new Array(this._x * this._y).fill(null).map(()=>new Tile());
    const table = document.getElementById('gameBoard');
    table.innerHTML = '';
    for(let x = 0; x <= this._x; x++){
      const row = document.createElement('tr');
      for (let y = 0; y <= this._y; y++){
        const col = document.createElement('td');
        if (y == this._y && x == this._x) {
        } else if (y < this._y && x < this._x) {
          col.classList.add('card');
          const value = this.board[x][y].value;
          col.innerHTML = `
            <div id="tile-${x}-${y}" class="flip-card" onclick="game.checkTile(${x}, ${y})">
              <div class="flip-card-inner">
                <div class="flip-card-front">
                  <span class="voltorb"></span>
                  <span class="one">1</span>
                  <span class="two">2</span>
                  <span class="three">3</span>
                </div>
                <div class="flip-card-back">
                  <span${value ? `>${value}` : ' class="voltorb">'}</span>
                </div>
              </div>
            </div>`;
          col.addEventListener("mouseover", ()=>{
            hovered_element = col;
          });
          col.addEventListener("mouseout", ()=>{
            hovered_element = undefined;
          });
        } else {
          col.classList.add('info');
          let values;
          if (x >= this._x) values = this.getInfoY(y);
          if (y >= this._y) values = this.getInfoX(x);
          col.innerHTML = `<span class="total_value">${values.points}</span>
                    <span class="total_voltorb">${values.voltorbs}</span>`;
        }
        row.appendChild(col);
      }
      table.appendChild(row);
    }
    return this._board;
  }
}

class Tile {
  constructor(){
    this.value = Math.floor(Math.random() * 3);
    this.checked = false;
  }

  check(){
    this.checked = true;
  }
}

let hovered_element;
const game = new Game();

// Apply the markers
document.addEventListener("keypress", function(event){
  if (hovered_element == undefined) return;
  switch (event.keyCode){
    case 48: // 0
    case 96: // `
      hovered_element.classList.toggle('show-0');
      break;
    case 49: // 1
      hovered_element.classList.toggle('show-1');
      break;
    case 50: // 2
      hovered_element.classList.toggle('show-2');
      break;
    case 51: // 3
      hovered_element.classList.toggle('show-3');
      break;
  }
});

// Show the values on hover once the game is over
function shiftHandler(event) {
    const shift = game.state !== State.READY && (event.shiftKey || event.ctrlKey);
    document.body.className = shift ? 'shift-pressed' : '';
};

window.addEventListener("keydown", shiftHandler, false);
window.addEventListener("keypress", shiftHandler, false);
window.addEventListener("keyup", shiftHandler, false);
