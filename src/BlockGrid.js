import Block from './Block';

class BlockGrid {
  constructor(
    width = 10,
    height = 10,
    element = document.getElementById('gridEl')
  ) {
    this.width = width;
    this.height = height;
    this.element = element;
    this.grid = BlockGrid.generateGrid(this.width, this.height);

    // Central event handler, prevents having 100+ event handlers for the page
    element.addEventListener('click', this.blockClicked.bind(this));

    // Allow the rendering to be dynamic and support infinite columns
    element.style.gridTemplateColumns = Array.apply(null, {
      length: this.width,
    })
      .map(() => '1fr')
      .join(' ');
  }

  set grid(grid) {
    this._grid = grid;
    this.render();
  }

  get grid() {
    return this._grid || [];
  }

  render() {
    // The rendering could be improved by doing DOM diffing and only updating the parts that changed
    // Right now their is noticable lag if you have 100 x 100 blocks
    this.element.innerHTML = '';

    this.grid.forEach((col, x) => {
      const id = 'col_' + x;
      const colEl = document.createElement('div');
      colEl.id = id;
      colEl.className = 'col';
      this.element.appendChild(colEl);

      col.forEach((row, y) => {
        const block = this.grid[x][y];
        const id = `block_${x}x${y}`;
        const blockEl = document.createElement('div');

        blockEl.id = id;
        blockEl.className = 'block';
        blockEl.style.background = block.colour;

        // Setting a custom height to allow infinite rows
        blockEl.style.height = `${100 / this.height}vh`;

        // Storing the x and y positions
        blockEl.dataset.x = x;
        blockEl.dataset.y = y;

        colEl.appendChild(blockEl);
      });
    });
  }

  blockClicked(event) {
    // Get the source element and retrieve its x, y co-ordinates
    const blockEl = event.srcElement;

    // Can only click on blocks
    if (blockEl.className !== 'block') {
      return;
    }

    // Dataset stores as strings so convert back to integers
    const x = parseInt(blockEl.dataset.x, 10);
    const y = parseInt(blockEl.dataset.y, 10);

    this.grid = BlockGrid.removeDisabledBlocks(
      BlockGrid.disableLinkedBlocks(this.grid, [this.grid[x][y]])
    );
  }

  static generateGrid(width, height) {
    const grid = [];

    for (let x = 0; x < width; x++) {
      const col = [];
      for (let y = 0; y < height; y++) {
        col.push(new Block(x, y));
      }

      grid.push(col);
    }

    return grid;
  }

  static disableLinkedBlocks(grid, blocks, inputColour = null) {
    const colour = inputColour || blocks[0].colour;
    let related = [];

    // Find all related blocks
    blocks.forEach(block => {
      const { x, y } = block;
      block.remove();

      const relatedBlocks = [
        grid[x][y + 1],
        grid[x][y - 1],
        grid[x + 1] && grid[x + 1][y],
        grid[x - 1] && grid[x - 1][y],
      ];

      related = related.concat(relatedBlocks);
    });

    // Create an array of all the matching blocks
    const matchingBlocks = [];

    related.forEach(block => {
      if (block && block.display && block.colour === colour) {
        block.remove();
        matchingBlocks.push(block);
      }
    });

    // If more matching blocks found we need to see if they have matching blocks
    if (matchingBlocks.length) {
      return BlockGrid.disableLinkedBlocks(grid, matchingBlocks, colour);
    } else {
      // Were done, return the updated grid
      return grid;
    }
  }

  static removeDisabledBlocks(grid) {
    return grid.map((col, x) => {
      return col
        .filter(block => {
          return block.display;
        })
        .map((block, y) => {
          block.setCoordinates(x, y);
          return block;
        });
    });
  }
}

export default BlockGrid;
