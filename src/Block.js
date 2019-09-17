export const COLOURS = ['red', 'green', 'blue', 'yellow'];

class Block {
  constructor(
    x,
    y,
    colour = COLOURS[Math.floor(Math.random() * COLOURS.length)]
  ) {
    this.x = x;
    this.y = y;
    this.colour = colour;
    this.display = true;
  }

  remove() {
    this.display = false;
  }

  setCoordinates(x, y) {
    (this.x = x), (this.y = y);
  }
}

export default Block;
