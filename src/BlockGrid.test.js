import BlockGrid from './BlockGrid';
import Block from './Block';

describe('BlockGrid', () => {
  beforeEach(() => {
    // Setup initial element for attaching blockgrid to
    const div = document.createElement('div');
    div.id = 'gridEl';
    document.body.appendChild(div);
  });

  afterEach(() => {
    //Teardown any state that was added so that HTML and event listeners are gone
    const gridEl = document.getElementById('gridEl');
    gridEl.parentElement.removeChild(gridEl);
  });

  it('constructor sets width and height', () => {
    const blockGrid = new BlockGrid(10, 10);

    expect(blockGrid.width).toBe(10);
    expect(blockGrid.height).toBe(10);

    const blockGrid2 = new BlockGrid(5, 8);

    expect(blockGrid2.width).toBe(5);
    expect(blockGrid2.height).toBe(8);
  });

  it('generateGrid fills a multidimensional array of Blocks as its grid, according to the given width and height', () => {
    const grid = BlockGrid.generateGrid(10, 10);

    expect(grid.length).toBe(10);

    grid.forEach(column => {
      expect(column.length).toBe(10);

      column.forEach(block => {
        expect(block).toBeInstanceOf(Block);
      });
    });

    const gridB = BlockGrid.generateGrid(3, 5);

    expect(gridB.length).toBe(3);

    gridB.forEach(column => {
      expect(column.length).toBe(5);
    });
  });

  it('constructor should render intial page', () => {
    new BlockGrid(3, 3);

    // Check the styling was rendered correctly
    const gridEl = document.getElementById('gridEl');
    expect(gridEl.style.gridTemplateColumns).toBe('1fr 1fr 1fr');

    // Check that we have the 3 columns
    const cols = document.getElementsByClassName('col');
    expect(cols.length).toBe(3);

    // Check that we have the 3 blocks in each column
    Array.from(cols).forEach(col => {
      const blocks = col.getElementsByClassName('block');
      expect(blocks.length).toBe(3);
    });
  });

  it('check removeDisabledBlocks removed blocks that have been disabled', () => {
    const initialGrid = BlockGrid.generateGrid(3, 3);
    const unmodifiedGrid = BlockGrid.removeDisabledBlocks(initialGrid);

    // Check we still have 3 columns
    expect(unmodifiedGrid.length).toBe(3);

    // Check we still have 3 blocks per column
    Array.from(unmodifiedGrid).forEach(col => {
      expect(col.length).toBe(3);
    });

    initialGrid[0][0].remove();
    initialGrid[1][1].remove();

    const modifiedGrid = BlockGrid.removeDisabledBlocks(initialGrid);

    // Check we still have 3 columns
    expect(modifiedGrid.length).toBe(3);

    // Check we only have removed only an item from 2 cols
    expect(modifiedGrid[0].length).toBe(2);
    expect(modifiedGrid[1].length).toBe(2);
    expect(modifiedGrid[2].length).toBe(3);

    // Check the blocks have shifted correctly
    expect(modifiedGrid[0][0].colour).toBe(initialGrid[0][1].colour);
    expect(modifiedGrid[0][1].colour).toBe(initialGrid[0][2].colour);
    expect(modifiedGrid[1][0].colour).toBe(initialGrid[1][0].colour);
    expect(modifiedGrid[1][1].colour).toBe(initialGrid[1][2].colour);
  });

  it('check disableLinkedBlocks updates the blocks that are linked', () => {
    let grid = BlockGrid.generateGrid(3, 3); // Using a generated grid as this is static function

    // Override the grid
    grid = grid.map(col => {
      return col.map(block => {
        block.colour = 'rebeccapurple';
        return block;
      });
    });

    grid[0][0].colour = 'red';
    grid[0][1].colour = 'red';
    grid[1][1].colour = 'red';

    // disable the linked blocks and return a modified grid
    const modifiedGrid = BlockGrid.disableLinkedBlocks(grid, [grid[0][0]]);

    modifiedGrid.forEach((col, x) => {
      col.forEach((block, y) => {
        // These three blocks should be marked as display false
        if (
          (x === 0 && y === 0) ||
          (x === 0 && y === 1) ||
          (x === 1 && y === 1)
        ) {
          expect(block.display).toBe(false);
        } else {
          expect(block.display).toBe(true);
        }
      });
    });
  });

  it('check blockClicked removes the clicked block and linked blocks', () => {
    let blockGrid = new BlockGrid(3, 3);

    // Override the grid
    blockGrid.grid = blockGrid.grid.map(col => {
      return col.map(block => {
        block.colour = 'rebeccapurple';
        return block;
      });
    });

    blockGrid.grid[0][0].colour = 'red';
    blockGrid.grid[0][1].colour = 'red';
    blockGrid.grid[1][1].colour = 'red';

    // Create a mock event which we can use for the click event
    const mockEvent = {
      srcElement: {
        className: 'block',
        dataset: {
          x: '0',
          y: '0',
        },
      },
    };

    // Run the click handler
    blockGrid.blockClicked(mockEvent);

    // Check the grid has been updated as expected
    expect(blockGrid.grid[0].length).toEqual(1);
    expect(blockGrid.grid[1].length).toEqual(2);
    expect(blockGrid.grid[2].length).toEqual(3);
  });
});
