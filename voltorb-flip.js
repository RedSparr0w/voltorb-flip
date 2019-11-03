const State = {
  NONE: 0,
  NEW_GAME: 1,
  PLAYING: 2,
  END_GAME: 3,
}

const Game = {}

const resetBoard = () => {
  Game.board = Array(5).fill(null).map(() => Array(5).fill(null).map(() => Math.floor(Math.random() * 4)));
  Game.totals = {rows:{}, cols: {}};
  Game.board.forEach((row, row_index)=>{
    row.forEach((col, col_index)=>{
      if (!Game.totals.rows[row_index]) Game.totals.rows[row_index] = {count: 0, voltorbs: 0};
      if (!Game.totals.cols[col_index]) Game.totals.cols[col_index] = {count: 0, voltorbs: 0};
      if (col > 0) Game.totals.rows[row_index].count += col;
      else Game.totals.rows[row_index].voltorbs++;
      if (col > 0) Game.totals.cols[col_index].count += col;
      else Game.totals.cols[col_index].voltorbs++;
    });
  });
  console.table(Game.board);
}

const newGame = () => {
  resetBoard();
  Game.state = State.NEW_GAME;
  [...document.getElementsByClassName('card')].forEach((el, index)=>{
    row_index = Math.floor(index / 5);
    col_index = index % 5;
    value = Game.board[row_index][col_index];
    el.innerHTML = `
      <div class="flip-card" onclick="reveal(this, ${row_index}, ${col_index})"">
        <div class="flip-card-inner">
          <div class="flip-card-front">
          </div>
          <div class="flip-card-back">
            <span${value ? `>${value}` : ' class="voltorb">'}</span>
          </div>
        </div>
      </div>`;
  });
  [...document.getElementsByClassName('info')].forEach((el, index)=>{
    let value = 0;
    if (index < 5)
      value = Game.totals.rows[index];
    else
      value = Game.totals.cols[index -5];
    el.innerHTML = `<span class="total_value">${value.count}</span>
                    <span class="total_voltorb">${value.voltorbs}</span>`;
  });
}

const reveal = (e, x, y) => {
  if (Game.state == State.END_GAME) return;
  e.classList.add('revealed');
  // If you flipped a voltorb
  if (Game.board[x][y] == 0) {
    Game.state = State.END_GAME
    // restart game in 5 seconds
    setTimeout(()=>{
      newGame();
    }, 5000);
  }
  if (checkGameComplete()) alert('You win!');
}

const checkGameComplete = () => {
  return !Game.board.some(row=>row.some(val=>val > 1))
}

newGame();
