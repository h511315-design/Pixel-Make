import { Grid, Point, SymmetryConfig } from '../types/pixel';

/**
 * Creates an empty grid filled with empty strings (transparent)
 */
export function createEmptyGrid(width: number, height: number): Grid {
  return Array.from({ length: height }, () => Array(width).fill(''));
}

/**
 * Clones a 2D grid array
 */
export function cloneGrid(grid: Grid): Grid {
  return grid.map(row => [...row]);
}

/**
 * Resizes a grid to new dimensions.
 * mode:
 * - 'crop-or-expand': preserves top-left or centered content, adding empty pixels or trimming edges
 * - 'scale': scales content with nearest-neighbor algorithm
 */
export function resizeGrid(
  sourceGrid: Grid,
  newWidth: number,
  newHeight: number,
  anchor: 'top-left' | 'center' = 'top-left',
  scaleContent: boolean = false
): Grid {
  const oldHeight = sourceGrid.length;
  const oldWidth = oldHeight > 0 ? sourceGrid[0].length : 0;

  if (oldWidth === 0 || oldHeight === 0) {
    return createEmptyGrid(newWidth, newHeight);
  }

  const newGrid = createEmptyGrid(newWidth, newHeight);

  if (scaleContent) {
    // Nearest-neighbor resampling
    for (let ny = 0; ny < newHeight; ny++) {
      const srcY = Math.min(oldHeight - 1, Math.floor((ny / newHeight) * oldHeight));
      for (let nx = 0; nx < newWidth; nx++) {
        const srcX = Math.min(oldWidth - 1, Math.floor((nx / newWidth) * oldWidth));
        newGrid[ny][nx] = sourceGrid[srcY][srcX] || '';
      }
    }
    return newGrid;
  }

  // Anchor offset
  let offsetX = 0;
  let offsetY = 0;
  if (anchor === 'center') {
    offsetX = Math.floor((newWidth - oldWidth) / 2);
    offsetY = Math.floor((newHeight - oldHeight) / 2);
  }

  for (let y = 0; y < oldHeight; y++) {
    for (let x = 0; x < oldWidth; x++) {
      const targetX = x + offsetX;
      const targetY = y + offsetY;
      if (targetX >= 0 && targetX < newWidth && targetY >= 0 && targetY < newHeight) {
        newGrid[targetY][targetX] = sourceGrid[y][x] || '';
      }
    }
  }

  return newGrid;
}

/**
 * Checks if coordinates are within grid bounds
 */
export function isInBounds(x: number, y: number, width: number, height: number): boolean {
  return x >= 0 && x < width && y >= 0 && y < height;
}

/**
 * Bresenham's Line Algorithm
 * Returns all points on the line between p1 and p2
 */
export function getBresenhamLine(p1: Point, p2: Point): Point[] {
  const points: Point[] = [];
  let x0 = Math.round(p1.x);
  let y0 = Math.round(p1.y);
  const x1 = Math.round(p2.x);
  const y1 = Math.round(p2.y);

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    points.push({ x: x0, y: y0 });
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return points;
}

/**
 * Returns rectangle points (outline or filled)
 */
export function getRectanglePoints(p1: Point, p2: Point, filled: boolean): Point[] {
  const points: Point[] = [];
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  if (filled) {
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        points.push({ x, y });
      }
    }
  } else {
    for (let x = minX; x <= maxX; x++) {
      points.push({ x, y: minY });
      points.push({ x, y: maxY });
    }
    for (let y = minY + 1; y < maxY; y++) {
      points.push({ x: minX, y });
      points.push({ x: maxX, y });
    }
  }
  return points;
}

/**
 * Returns pixel-art rounded rectangle points (outline or filled)
 */
export function getRoundedRectPoints(
  p1: Point,
  p2: Point,
  radius: number,
  filled: boolean
): Point[] {
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  const w = maxX - minX + 1;
  const h = maxY - minY + 1;
  const maxR = Math.max(1, Math.floor(Math.min(w, h) / 2));
  const r = Math.min(Math.max(1, radius), maxR);

  const insideMap = new Map<string, Point>();

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      let isInside = true;

      // Top-Left corner
      if (x < minX + r && y < minY + r) {
        const dx = (minX + r) - x;
        const dy = (minY + r) - y;
        if (dx * dx + dy * dy > (r + 0.4) * (r + 0.4)) {
          isInside = false;
        }
      }
      // Top-Right corner
      else if (x > maxX - r && y < minY + r) {
        const dx = x - (maxX - r);
        const dy = (minY + r) - y;
        if (dx * dx + dy * dy > (r + 0.4) * (r + 0.4)) {
          isInside = false;
        }
      }
      // Bottom-Left corner
      else if (x < minX + r && y > maxY - r) {
        const dx = (minX + r) - x;
        const dy = y - (maxY - r);
        if (dx * dx + dy * dy > (r + 0.4) * (r + 0.4)) {
          isInside = false;
        }
      }
      // Bottom-Right corner
      else if (x > maxX - r && y > maxY - r) {
        const dx = x - (maxX - r);
        const dy = y - (maxY - r);
        if (dx * dx + dy * dy > (r + 0.4) * (r + 0.4)) {
          isInside = false;
        }
      }

      if (isInside) {
        insideMap.set(`${x},${y}`, { x, y });
      }
    }
  }

  if (filled) {
    return Array.from(insideMap.values());
  }

  // Outline only
  const outlinePoints: Point[] = [];
  insideMap.forEach((pt, key) => {
    const { x, y } = pt;
    const neighbors = [
      `${x + 1},${y}`,
      `${x - 1},${y}`,
      `${x},${y + 1}`,
      `${x},${y - 1}`,
    ];
    const isEdge = neighbors.some(nKey => !insideMap.has(nKey));
    if (isEdge) {
      outlinePoints.push(pt);
    }
  });

  return outlinePoints;
}

/**
 * Apply Corner Radius (cut/round corners) to the bounding box of non-empty pixels or canvas
 */
export function applyCornerRadius(grid: Grid, radius: number): Grid {
  if (radius <= 0) return grid;
  const height = grid.length;
  if (height === 0) return grid;
  const width = grid[0].length;

  // Find bounding box of non-empty content
  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x]) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If entirely empty, default to full canvas
  if (maxX < minX) {
    minX = 0;
    maxX = width - 1;
    minY = 0;
    maxY = height - 1;
  }

  const r = Math.min(radius, Math.floor(Math.min(maxX - minX + 1, maxY - minY + 1) / 2));
  const newGrid = cloneGrid(grid);

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      let remove = false;
      if (x < minX + r && y < minY + r) {
        const dx = (minX + r) - x;
        const dy = (minY + r) - y;
        if (dx * dx + dy * dy > (r + 0.4) * (r + 0.4)) remove = true;
      } else if (x > maxX - r && y < minY + r) {
        const dx = x - (maxX - r);
        const dy = (minY + r) - y;
        if (dx * dx + dy * dy > (r + 0.4) * (r + 0.4)) remove = true;
      } else if (x < minX + r && y > maxY - r) {
        const dx = (minX + r) - x;
        const dy = y - (maxY - r);
        if (dx * dx + dy * dy > (r + 0.4) * (r + 0.4)) remove = true;
      } else if (x > maxX - r && y > maxY - r) {
        const dx = x - (maxX - r);
        const dy = y - (maxY - r);
        if (dx * dx + dy * dy > (r + 0.4) * (r + 0.4)) remove = true;
      }

      if (remove) {
        newGrid[y][x] = '';
      }
    }
  }

  return newGrid;
}

/**
 * Apply a Pixel Block Shadow behind existing opaque pixels
 */
export function applyBlockShadow(
  grid: Grid,
  offsetX: number = 2,
  offsetY: number = 2,
  shadowColor: string = '#1a1c2c'
): Grid {
  const height = grid.length;
  if (height === 0) return grid;
  const width = grid[0].length;

  const result = cloneGrid(grid);

  // Cast shadow
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x]) {
        const targetX = x + offsetX;
        const targetY = y + offsetY;
        if (isInBounds(targetX, targetY, width, height)) {
          // Only put shadow on empty cells or existing shadows
          if (!grid[targetY][targetX]) {
            result[targetY][targetX] = shadowColor;
          }
        }
      }
    }
  }

  return result;
}

/**
 * Apply 3D Button Bevel (Highlight Top/Left, Shadow Bottom/Right)
 */
export function applyButton3DBevel(
  grid: Grid,
  highlightColor: string = '#ffffff',
  shadowColor: string = '#000000'
): Grid {
  const height = grid.length;
  if (height === 0) return grid;
  const width = grid[0].length;

  const result = cloneGrid(grid);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const current = grid[y][x];
      if (!current) continue;

      const hasTopEmpty = y === 0 || !grid[y - 1][x];
      const hasLeftEmpty = x === 0 || !grid[y][x - 1];
      const hasBottomEmpty = y === height - 1 || !grid[y + 1][x];
      const hasRightEmpty = x === width - 1 || !grid[y][x + 1];

      // Top & Left borders -> Highlight
      if (hasTopEmpty || hasLeftEmpty) {
        result[y][x] = highlightColor;
      }
      // Bottom & Right borders -> Shadow (takes precedence on bottom-right corners)
      else if (hasBottomEmpty || hasRightEmpty) {
        result[y][x] = shadowColor;
      }
    }
  }

  return result;
}


/**
 * Bresenham's Midpoint Circle Algorithm (bounding box from p1 to p2)
 */
export function getCirclePoints(p1: Point, p2: Point, filled: boolean): Point[] {
  const minX = Math.min(p1.x, p2.x);
  const maxX = Math.max(p1.x, p2.x);
  const minY = Math.min(p1.y, p2.y);
  const maxY = Math.max(p1.y, p2.y);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const radiusX = Math.max(1, (maxX - minX) / 2);
  const radiusY = Math.max(1, (maxY - minY) / 2);

  const pointsMap = new Map<string, Point>();

  if (filled) {
    const startY = Math.floor(minY);
    const endY = Math.ceil(maxY);
    const startX = Math.floor(minX);
    const endX = Math.ceil(maxX);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const dx = (x - centerX) / radiusX;
        const dy = (y - centerY) / radiusY;
        if (dx * dx + dy * dy <= 1.0) {
          pointsMap.set(`${x},${y}`, { x, y });
        }
      }
    }
  } else {
    // Ellipse outline sampling
    const steps = Math.max(16, Math.round(2 * Math.PI * Math.max(radiusX, radiusY) * 2));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      const x = Math.round(centerX + radiusX * Math.cos(angle));
      const y = Math.round(centerY + radiusY * Math.sin(angle));
      pointsMap.set(`${x},${y}`, { x, y });
    }
  }

  return Array.from(pointsMap.values());
}

/**
 * 4-Way Breadth-First Flood Fill
 */
export function floodFill(
  grid: Grid,
  startX: number,
  startY: number,
  fillColor: string
): Grid {
  const height = grid.length;
  if (height === 0) return grid;
  const width = grid[0].length;

  if (!isInBounds(startX, startY, width, height)) return grid;

  const targetColor = grid[startY][startX];
  if (targetColor === fillColor) return grid;

  const newGrid = cloneGrid(grid);
  const queue: [number, number][] = [[startX, startY]];
  const visited = new Uint8Array(width * height);
  visited[startY * width + startX] = 1;

  while (queue.length > 0) {
    const [x, y] = queue.shift()!;
    newGrid[y][x] = fillColor;

    const neighbors: [number, number][] = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (isInBounds(nx, ny, width, height)) {
        const idx = ny * width + nx;
        if (!visited[idx] && newGrid[ny][nx] === targetColor) {
          visited[idx] = 1;
          queue.push([nx, ny]);
        }
      }
    }
  }

  return newGrid;
}

/**
 * Replace all occurrences of a color across the entire grid
 */
export function replaceColor(grid: Grid, oldColor: string, newColor: string): Grid {
  return grid.map(row => row.map(cell => (cell === oldColor ? newColor : cell)));
}

/**
 * Calculate symmetric mirror points based on configuration
 */
export function getSymmetricPoints(
  point: Point,
  width: number,
  height: number,
  symmetry: SymmetryConfig
): Point[] {
  const points: Point[] = [point];
  const { x, y } = point;

  const mirrorX = width - 1 - x;
  const mirrorY = height - 1 - y;

  if (symmetry.horizontal && mirrorX !== x) {
    points.push({ x: mirrorX, y });
  }

  if (symmetry.vertical && mirrorY !== y) {
    points.push({ x, y: mirrorY });
  }

  if (symmetry.horizontal && symmetry.vertical) {
    if (mirrorX !== x && mirrorY !== y) {
      points.push({ x: mirrorX, y: mirrorY });
    }
  }

  return points;
}

/**
 * Expand point by brush size (1, 2, 3, 4)
 */
export function expandBrush(
  center: Point,
  size: number,
  width: number,
  height: number
): Point[] {
  if (size <= 1) return [center];

  const points: Point[] = [];
  const offset = Math.floor(size / 2);

  for (let dy = -offset; dy < size - offset; dy++) {
    for (let dx = -offset; dx < size - offset; dx++) {
      const px = center.x + dx;
      const py = center.y + dy;
      if (isInBounds(px, py, width, height)) {
        points.push({ x: px, y: py });
      }
    }
  }
  return points;
}

/**
 * Grid Transformations
 */
export function flipHorizontal(grid: Grid): Grid {
  return grid.map(row => [...row].reverse());
}

export function flipVertical(grid: Grid): Grid {
  return [...grid].reverse().map(row => [...row]);
}

export function rotate90Clockwise(grid: Grid): Grid {
  const height = grid.length;
  if (height === 0) return grid;
  const width = grid[0].length;

  const result: Grid = Array.from({ length: width }, () => Array(height).fill(''));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      result[x][height - 1 - y] = grid[y][x];
    }
  }
  return result;
}

export function shiftGrid(grid: Grid, dx: number, dy: number): Grid {
  const height = grid.length;
  if (height === 0) return grid;
  const width = grid[0].length;

  const result = createEmptyGrid(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = x + dx;
      const ny = y + dy;
      if (isInBounds(nx, ny, width, height)) {
        result[ny][nx] = grid[y][x];
      }
    }
  }
  return result;
}

/**
 * Find bounding box of all non-empty pixels in the grid
 */
export function getContentBoundingBox(grid: Grid): { x: number; y: number; width: number; height: number } | null {
  const height = grid.length;
  if (height === 0) return null;
  const width = grid[0].length;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] && grid[y][x].trim() !== '') {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX === -1) return null;

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/**
 * Extracts a rectangular subgrid from the grid
 */
export function extractSubGrid(grid: Grid, x: number, y: number, width: number, height: number): string[][] {
  const sub: string[][] = [];
  const gridH = grid.length;
  const gridW = gridH > 0 ? grid[0].length : 0;

  for (let r = 0; r < height; r++) {
    const row: string[] = [];
    for (let c = 0; c < width; c++) {
      const gx = x + c;
      const gy = y + r;
      if (gy >= 0 && gy < gridH && gx >= 0 && gx < gridW) {
        row.push(grid[gy][gx] || '');
      } else {
        row.push('');
      }
    }
    sub.push(row);
  }
  return sub;
}

/**
 * Clears a rectangular region in the grid (fills with empty strings)
 */
export function clearSubGrid(grid: Grid, x: number, y: number, width: number, height: number): Grid {
  const newGrid = cloneGrid(grid);
  const gridH = newGrid.length;
  const gridW = gridH > 0 ? newGrid[0].length : 0;

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const gx = x + c;
      const gy = y + r;
      if (gy >= 0 && gy < gridH && gx >= 0 && gx < gridW) {
        newGrid[gy][gx] = '';
      }
    }
  }
  return newGrid;
}

/**
 * Stamps a subgrid onto a target grid at destX, destY
 */
export function stampSubGrid(
  targetGrid: Grid,
  subGrid: string[][],
  destX: number,
  destY: number,
  replaceTransparent: boolean = false
): Grid {
  const newGrid = cloneGrid(targetGrid);
  const gridH = newGrid.length;
  const gridW = gridH > 0 ? newGrid[0].length : 0;
  const subH = subGrid.length;
  const subW = subH > 0 ? subGrid[0].length : 0;

  for (let r = 0; r < subH; r++) {
    for (let c = 0; c < subW; c++) {
      const color = subGrid[r][c];
      const gx = destX + c;
      const gy = destY + r;
      if (gy >= 0 && gy < gridH && gx >= 0 && gx < gridW) {
        if (color !== '' || replaceTransparent) {
          newGrid[gy][gx] = color;
        }
      }
    }
  }
  return newGrid;
}

/**
 * Extract unique colors currently used in the grid
 */
export function extractUsedColors(grid: Grid): string[] {
  const colorSet = new Set<string>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell && cell.trim() !== '') {
        colorSet.add(cell.toLowerCase());
      }
    }
  }
  return Array.from(colorSet);
}

/**
 * Render grid to an HTMLCanvasElement with scaling and background options
 */
export function renderGridToCanvas(
  grid: Grid,
  scale: number,
  options: {
    backgroundMode: 'transparent' | 'solid';
    backgroundColor?: string;
    includeGrid?: boolean;
    gridColor?: string;
    cornerRadius?: number;
    shadowEnabled?: boolean;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    shadowColor?: string;
    cropToContent?: boolean;
  }
): HTMLCanvasElement {
  let processedGrid = options.cornerRadius && options.cornerRadius > 0
    ? applyCornerRadius(grid, options.cornerRadius)
    : grid;

  let origHeight = processedGrid.length;
  let origWidth = origHeight > 0 ? processedGrid[0].length : 0;

  // Optional: Crop to content bounding box
  let minX = 0, minY = 0, maxX = origWidth - 1, maxY = origHeight - 1;
  if (options.cropToContent) {
    let found = false;
    let bMinX = origWidth, bMinY = origHeight, bMaxX = -1, bMaxY = -1;
    for (let y = 0; y < origHeight; y++) {
      for (let x = 0; x < origWidth; x++) {
        if (processedGrid[y][x] && processedGrid[y][x].trim() !== '') {
          found = true;
          if (x < bMinX) bMinX = x;
          if (x > bMaxX) bMaxX = x;
          if (y < bMinY) bMinY = y;
          if (y > bMaxY) bMaxY = y;
        }
      }
    }
    if (found) {
      minX = bMinX;
      minY = bMinY;
      maxX = bMaxX;
      maxY = bMaxY;
    }
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  const shadowOffsetX = options.shadowEnabled ? (options.shadowOffsetX ?? 2) : 0;
  const shadowOffsetY = options.shadowEnabled ? (options.shadowOffsetY ?? 2) : 0;
  const shadowColor = options.shadowColor || '#1a1c2c';

  const extraPadX = Math.max(0, shadowOffsetX);
  const extraPadY = Math.max(0, shadowOffsetY);

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, (width + extraPadX) * scale);
  canvas.height = Math.max(1, (height + extraPadY) * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Crisp pixels
  ctx.imageSmoothingEnabled = false;

  // Solid background if selected
  if (options.backgroundMode === 'solid') {
    ctx.fillStyle = options.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 1. Draw Block Shadow underneath if enabled
  if (options.shadowEnabled && (shadowOffsetX !== 0 || shadowOffsetY !== 0)) {
    ctx.fillStyle = shadowColor;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const color = processedGrid[y][x];
        if (color && color.trim() !== '') {
          ctx.fillRect(
            (x - minX + shadowOffsetX) * scale,
            (y - minY + shadowOffsetY) * scale,
            scale,
            scale
          );
        }
      }
    }
  }

  // 2. Draw Main Pixel Cells
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const color = processedGrid[y][x];
      if (color && color.trim() !== '') {
        ctx.fillStyle = color;
        ctx.fillRect((x - minX) * scale, (y - minY) * scale, scale, scale);
      }
    }
  }

  // 3. Optional pixel grid overlay
  if (options.includeGrid && scale >= 3) {
    ctx.strokeStyle = options.gridColor || 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width + extraPadX; x++) {
      const posX = Math.round(x * scale) + 0.5;
      ctx.moveTo(posX, 0);
      ctx.lineTo(posX, canvas.height);
    }
    for (let y = 0; y <= height + extraPadY; y++) {
      const posY = Math.round(y * scale) + 0.5;
      ctx.moveTo(0, posY);
      ctx.lineTo(canvas.width, posY);
    }
    ctx.stroke();
  }

  return canvas;
}

/**
 * Trigger download of canvas as PNG file
 */
export function downloadCanvasAsPNG(canvas: HTMLCanvasElement, filename: string): void {
  const cleanName = filename.endsWith('.png') ? filename : `${filename}.png`;
  const link = document.createElement('a');
  link.download = cleanName;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copy canvas image to system clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    return new Promise(resolve => {
      canvas.toBlob(async blob => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch {
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
}

/**
 * Helper to convert RGB to HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Import and quantize any uploaded image file to grid dimensions
 */
export function importImageFileToGrid(
  file: File,
  targetWidth: number,
  targetHeight: number
): Promise<Grid> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const offscreen = document.createElement('canvas');
        offscreen.width = targetWidth;
        offscreen.height = targetHeight;
        const ctx = offscreen.getContext('2d');
        if (!ctx) {
          reject(new Error('Cannot get canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
        const newGrid = createEmptyGrid(targetWidth, targetHeight);

        for (let y = 0; y < targetHeight; y++) {
          for (let x = 0; x < targetWidth; x++) {
            const idx = (y * targetWidth + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];

            if (a < 32) {
              newGrid[y][x] = '';
            } else {
              newGrid[y][x] = rgbToHex(r, g, b);
            }
          }
        }
        resolve(newGrid);
      };
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate a crisp PNG DataURL thumbnail for a pixel grid
 */
export function generateProjectThumbnail(grid: Grid, targetSize: number = 96): string {
  try {
    const origHeight = grid.length;
    const origWidth = origHeight > 0 ? grid[0].length : 0;
    if (origWidth === 0 || origHeight === 0) return '';

    // Calculate scale so the largest dimension fits targetSize
    const maxDim = Math.max(origWidth, origHeight);
    const scale = Math.max(1, Math.floor(targetSize / maxDim));

    const canvas = renderGridToCanvas(grid, Math.max(scale, 2), {
      backgroundMode: 'transparent',
      cornerRadius: 0,
      shadowEnabled: false,
      cropToContent: false,
    });

    return canvas.toDataURL('image/png');
  } catch (err) {
    console.error('Failed to generate project thumbnail', err);
    return '';
  }
}
