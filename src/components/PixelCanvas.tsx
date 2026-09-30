import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  BoxSelect,
  Move,
  FlipHorizontal,
  FlipVertical,
  Copy,
  Trash2,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import {
  Grid,
  Tool,
  BrushSize,
  Point,
  SymmetryConfig,
  SelectionState
} from '../types/pixel';
import {
  isInBounds,
  getBresenhamLine,
  getRectanglePoints,
  getRoundedRectPoints,
  getCirclePoints,
  floodFill,
  getSymmetricPoints,
  expandBrush,
  cloneGrid,
  getContentBoundingBox,
  extractSubGrid,
  clearSubGrid,
  stampSubGrid
} from '../utils/pixelMath';

interface PixelCanvasProps {
  grid: Grid;
  width: number;
  height: number;
  currentTool: Tool;
  primaryColor: string;
  secondaryColor: string;
  brushSize: BrushSize;
  symmetry: SymmetryConfig;
  showGrid: boolean;
  checkerboardDark: boolean;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  onCommitGrid: (newGrid: Grid) => void;
  onPickColor: (color: string) => void;
  onHoverCoordsChange: (coords: Point | null) => void;
}

export const PixelCanvas: React.FC<PixelCanvasProps> = ({
  grid,
  width,
  height,
  currentTool,
  primaryColor,
  secondaryColor,
  brushSize,
  symmetry,
  showGrid,
  checkerboardDark,
  zoom,
  onZoomChange,
  onCommitGrid,
  onPickColor,
  onHoverCoordsChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Interaction State
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isRightButton, setIsRightButton] = useState<boolean>(false);

  // Selection & Move Tool State
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [isMovingSelection, setIsMovingSelection] = useState<boolean>(false);
  const [isSelectingBox, setIsSelectingBox] = useState<boolean>(false);
  const [selectBoxEnd, setSelectBoxEnd] = useState<Point | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);

  const selectStartPointRef = useRef<Point | null>(null);
  const moveStartRef = useRef<{
    startPt: Point;
    initialSelX: number;
    initialSelY: number;
  } | null>(null);

  // Drag tracking for continuous painting
  const lastDrawnPointRef = useRef<Point | null>(null);
  const dragStartPointRef = useRef<Point | null>(null);
  const workingGridRef = useRef<Grid>(cloneGrid(grid));

  // Sync workingGridRef whenever grid updates externally (undo, redo, template, clear)
  useEffect(() => {
    workingGridRef.current = cloneGrid(grid);
  }, [grid]);

  // Pixel display scale in CSS pixels
  const baseCellSize = 16; // 16px per pixel at 100% zoom
  const currentCellSize = Math.max(2, baseCellSize * zoom);
  const canvasWidth = width * currentCellSize;
  const canvasHeight = height * currentCellSize;

  // Render the main canvas (pixels)
  const drawMainCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const activeGrid = workingGridRef.current;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const color = activeGrid[y]?.[x];
        if (color && color.trim() !== '') {
          ctx.fillStyle = color;
          ctx.fillRect(
            x * currentCellSize,
            y * currentCellSize,
            currentCellSize,
            currentCellSize
          );
        }
      }
    }
  }, [width, height, canvasWidth, canvasHeight, currentCellSize]);

  // Commit current selection into canvas permanently
  const handleCommitSelection = useCallback(() => {
    if (!selection) return;
    if (selection.isFloating) {
      const stamped = stampSubGrid(
        workingGridRef.current,
        selection.pixels,
        selection.x,
        selection.y,
        false
      );
      workingGridRef.current = stamped;
      drawMainCanvas();
      onCommitGrid(cloneGrid(stamped));
    }
    setSelection(null);
  }, [selection, drawMainCanvas, onCommitGrid]);

  // Cancel selection (restores original canvas pixels if floating)
  const handleCancelSelection = useCallback(() => {
    if (!selection) return;
    if (selection.isFloating) {
      workingGridRef.current = cloneGrid(grid);
      drawMainCanvas();
    }
    setSelection(null);
  }, [selection, grid, drawMainCanvas]);

  // Delete selected block
  const handleDeleteSelection = useCallback(() => {
    if (!selection) return;
    if (!selection.isFloating) {
      const cleared = clearSubGrid(
        workingGridRef.current,
        selection.x,
        selection.y,
        selection.width,
        selection.height
      );
      workingGridRef.current = cleared;
      drawMainCanvas();
      onCommitGrid(cloneGrid(cleared));
    } else {
      onCommitGrid(cloneGrid(workingGridRef.current));
    }
    setSelection(null);
  }, [selection, drawMainCanvas, onCommitGrid]);

  // Flip selected block horizontally or vertically
  const handleFlipSelection = useCallback((direction: 'horizontal' | 'vertical') => {
    if (!selection) return;
    const flipped = direction === 'horizontal'
      ? selection.pixels.map(row => [...row].reverse())
      : [...selection.pixels].reverse().map(row => [...row]);

    if (!selection.isFloating) {
      workingGridRef.current = clearSubGrid(
        workingGridRef.current,
        selection.x,
        selection.y,
        selection.width,
        selection.height
      );
      drawMainCanvas();
    }

    setSelection(prev => prev ? {
      ...prev,
      pixels: flipped,
      isFloating: true,
    } : null);
  }, [selection, drawMainCanvas]);

  // Duplicate current selection block
  const handleDuplicateSelection = useCallback(() => {
    if (!selection) return;
    if (selection.isFloating) {
      const stamped = stampSubGrid(
        workingGridRef.current,
        selection.pixels,
        selection.x,
        selection.y,
        false
      );
      workingGridRef.current = stamped;
      drawMainCanvas();
    }
    setSelection(prev => prev ? {
      ...prev,
      x: Math.min(width - prev.width, prev.x + 1),
      y: Math.min(height - prev.height, prev.y + 1),
      isFloating: true,
    } : null);
  }, [selection, width, height, drawMainCanvas]);

  // Automatically select content bounding box
  const handleAutoSelectContent = useCallback(() => {
    if (selection?.isFloating) {
      handleCommitSelection();
    }
    const bbox = getContentBoundingBox(workingGridRef.current);
    if (!bbox) return;
    const sub = extractSubGrid(workingGridRef.current, bbox.x, bbox.y, bbox.width, bbox.height);
    setSelection({
      x: bbox.x,
      y: bbox.y,
      width: bbox.width,
      height: bbox.height,
      pixels: sub,
      isFloating: false,
    });
  }, [selection, handleCommitSelection]);

  // When switching away from 'select' tool, commit any active floating selection
  useEffect(() => {
    if (currentTool !== 'select' && selection) {
      if (selection.isFloating) {
        const stamped = stampSubGrid(
          workingGridRef.current,
          selection.pixels,
          selection.x,
          selection.y,
          false
        );
        workingGridRef.current = stamped;
        drawMainCanvas();
        onCommitGrid(cloneGrid(stamped));
      }
      setSelection(null);
    }
  }, [currentTool]);

  // Keyboard navigation for moving selection and committing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentTool !== 'select' || !selection) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleCommitSelection();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelSelection();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDeleteSelection();
        return;
      }

      let dx = 0;
      let dy = 0;
      if (e.key === 'ArrowUp') dy = -1;
      else if (e.key === 'ArrowDown') dy = 1;
      else if (e.key === 'ArrowLeft') dx = -1;
      else if (e.key === 'ArrowRight') dx = 1;

      if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        if (!selection.isFloating) {
          workingGridRef.current = clearSubGrid(
            workingGridRef.current,
            selection.x,
            selection.y,
            selection.width,
            selection.height
          );
          drawMainCanvas();
        }
        setSelection(prev => prev ? {
          ...prev,
          x: prev.x + dx,
          y: prev.y + dy,
          isFloating: true,
        } : null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTool, selection, handleCommitSelection, handleCancelSelection, handleDeleteSelection, drawMainCanvas]);

  // Render the overlay canvas (grid lines, symmetry guides, hover indicator, preview shapes, selection marquee)
  const drawOverlayCanvas = useCallback(
    (hoverPoint: Point | null, previewPoints: Point[] = [], previewColor: string = '') => {
      const canvas = overlayCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // 1. Draw Pixel Grid lines
      if (showGrid && currentCellSize >= 4) {
        ctx.strokeStyle = checkerboardDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= width; x++) {
          const posX = Math.round(x * currentCellSize) + 0.5;
          ctx.moveTo(posX, 0);
          ctx.lineTo(posX, canvasHeight);
        }
        for (let y = 0; y <= height; y++) {
          const posY = Math.round(y * currentCellSize) + 0.5;
          ctx.moveTo(0, posY);
          ctx.lineTo(canvasWidth, posY);
        }
        ctx.stroke();
      }

      // 2. Draw Symmetry Axes
      if (symmetry.horizontal) {
        const midX = Math.round((width / 2) * currentCellSize) + 0.5;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(midX, 0);
        ctx.lineTo(midX, canvasHeight);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      if (symmetry.vertical) {
        const midY = Math.round((height / 2) * currentCellSize) + 0.5;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(canvasWidth, midY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Draw Preview Points (while dragging shapes: Line, Rect, Circle)
      if (previewPoints.length > 0 && previewColor) {
        ctx.fillStyle = previewColor;
        for (const pt of previewPoints) {
          if (isInBounds(pt.x, pt.y, width, height)) {
            ctx.fillRect(
              pt.x * currentCellSize,
              pt.y * currentCellSize,
              currentCellSize,
              currentCellSize
            );
          }
        }
      }

      // 4. Selection Box Dragging Preview (creating new selection marquee)
      if (isSelectingBox && selectStartPointRef.current && selectBoxEnd) {
        const p1 = selectStartPointRef.current;
        const p2 = selectBoxEnd;
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);
        const bx = minX * currentCellSize;
        const by = minY * currentCellSize;
        const bw = (maxX - minX + 1) * currentCellSize;
        const bh = (maxY - minY + 1) * currentCellSize;

        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.fillRect(bx, by, bw, bh);

        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        ctx.setLineDash([]);
      }

      // 5. Active Selection Box & Floating Pixels
      if (selection) {
        // Draw floating pixels if lifted from canvas
        if (selection.isFloating) {
          for (let r = 0; r < selection.height; r++) {
            for (let c = 0; c < selection.width; c++) {
              const color = selection.pixels[r]?.[c];
              const px = selection.x + c;
              const py = selection.y + r;
              if (color && color.trim() !== '' && isInBounds(px, py, width, height)) {
                ctx.fillStyle = color;
                ctx.fillRect(
                  px * currentCellSize,
                  py * currentCellSize,
                  currentCellSize,
                  currentCellSize
                );
              }
            }
          }
        }

        // Draw Selection Outline & Border
        const sx = selection.x * currentCellSize;
        const sy = selection.y * currentCellSize;
        const sw = selection.width * currentCellSize;
        const sh = selection.height * currentCellSize;

        // Subtle tint
        ctx.fillStyle = 'rgba(99, 102, 241, 0.12)';
        ctx.fillRect(sx, sy, sw, sh);

        // Dashed marching border
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(sx + 0.5, sy + 0.5, sw - 1, sh - 1);

        ctx.strokeStyle = '#4f46e5';
        ctx.lineDashOffset = 4;
        ctx.strokeRect(sx + 0.5, sy + 0.5, sw - 1, sh - 1);
        ctx.setLineDash([]);
        ctx.lineDashOffset = 0;

        // Corner handles
        const handleSize = Math.min(8, Math.max(4, Math.floor(currentCellSize * 0.35)));
        const corners = [
          { x: sx, y: sy },
          { x: sx + sw, y: sy },
          { x: sx, y: sy + sh },
          { x: sx + sw, y: sy + sh },
        ];
        ctx.fillStyle = '#6366f1';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        for (const c of corners) {
          ctx.fillRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(c.x - handleSize / 2, c.y - handleSize / 2, handleSize, handleSize);
        }
      }

      // 6. Draw Hover Highlight Cursor (for pencil/eraser/eyedropper)
      if (
        hoverPoint &&
        isInBounds(hoverPoint.x, hoverPoint.y, width, height) &&
        !previewPoints.length &&
        !isSelectingBox &&
        currentTool !== 'select'
      ) {
        const brushPoints = expandBrush(
          hoverPoint,
          currentTool === 'pencil' || currentTool === 'eraser' ? brushSize : 1,
          width,
          height
        );
        const allHoverPoints: Point[] = [];
        for (const pt of brushPoints) {
          allHoverPoints.push(...getSymmetricPoints(pt, width, height, symmetry));
        }

        ctx.strokeStyle = currentTool === 'eraser' ? '#ef4444' : '#6366f1';
        ctx.lineWidth = 1.5;
        for (const pt of allHoverPoints) {
          ctx.strokeRect(
            pt.x * currentCellSize + 0.5,
            pt.y * currentCellSize + 0.5,
            currentCellSize - 1,
            currentCellSize - 1
          );
        }
      }
    },
    [
      canvasWidth,
      canvasHeight,
      currentCellSize,
      width,
      height,
      showGrid,
      checkerboardDark,
      symmetry,
      brushSize,
      currentTool,
      isSelectingBox,
      selectBoxEnd,
      selection,
    ]
  );

  // Redraw when grid or settings change
  useEffect(() => {
    drawMainCanvas();
    drawOverlayCanvas(hoveredPoint);
  }, [drawMainCanvas, drawOverlayCanvas, hoveredPoint]);

  // Helper to convert mouse event client coordinates to grid pixel coordinates
  const getGridCoordinates = (e: React.MouseEvent | MouseEvent): Point | null => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    ) {
      return null;
    }

    const x = Math.floor((clientX - rect.left) / currentCellSize);
    const y = Math.floor((clientY - rect.top) / currentCellSize);

    if (isInBounds(x, y, width, height)) {
      return { x, y };
    }
    return null;
  };

  // Helper to apply pixels to working grid with symmetry and brush size
  const applyPixelsToGrid = (points: Point[], color: string): void => {
    const updated = workingGridRef.current;
    for (const point of points) {
      const brushPts = expandBrush(point, brushSize, width, height);
      for (const bpt of brushPts) {
        const symPts = getSymmetricPoints(bpt, width, height, symmetry);
        for (const spt of symPts) {
          if (isInBounds(spt.x, spt.y, width, height)) {
            updated[spt.y][spt.x] = color;
          }
        }
      }
    }
  };

  // Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle button or Space key down for panning
    if (e.button === 1 || (e.altKey && currentTool !== 'select')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    const isRight = e.button === 2;
    setIsRightButton(isRight);

    const pt = getGridCoordinates(e);
    if (!pt) return;

    // Handle SELECT TOOL
    if (currentTool === 'select') {
      const isInside =
        selection &&
        pt.x >= selection.x &&
        pt.x < selection.x + selection.width &&
        pt.y >= selection.y &&
        pt.y < selection.y + selection.height;

      if (isInside) {
        // Moving existing selection
        if (!selection.isFloating) {
          // If alt key is pressed, duplicate! Otherwise lift/cut
          if (!e.altKey) {
            workingGridRef.current = clearSubGrid(
              workingGridRef.current,
              selection.x,
              selection.y,
              selection.width,
              selection.height
            );
            drawMainCanvas();
          }
          setSelection(prev => prev ? { ...prev, isFloating: true } : null);
        }
        setIsMovingSelection(true);
        moveStartRef.current = {
          startPt: pt,
          initialSelX: selection.x,
          initialSelY: selection.y,
        };
        return;
      } else {
        // Clicked outside existing selection
        if (selection && selection.isFloating) {
          const stamped = stampSubGrid(
            workingGridRef.current,
            selection.pixels,
            selection.x,
            selection.y,
            false
          );
          workingGridRef.current = stamped;
          drawMainCanvas();
          onCommitGrid(cloneGrid(stamped));
        }
        setSelection(null);

        // Start new box selection
        setIsSelectingBox(true);
        selectStartPointRef.current = pt;
        setSelectBoxEnd(pt);
        return;
      }
    }

    const paintColor =
      currentTool === 'eraser'
        ? ''
        : isRight
        ? secondaryColor
        : primaryColor;

    if (currentTool === 'eyedropper') {
      const picked = workingGridRef.current[pt.y][pt.x];
      if (picked) onPickColor(picked);
      return;
    }

    if (currentTool === 'bucket') {
      const newGrid = floodFill(workingGridRef.current, pt.x, pt.y, paintColor);
      workingGridRef.current = newGrid;
      drawMainCanvas();
      onCommitGrid(newGrid);
      return;
    }

    setIsDrawing(true);
    lastDrawnPointRef.current = pt;
    dragStartPointRef.current = pt;

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      applyPixelsToGrid([pt], paintColor);
      drawMainCanvas();
    }
  };

  // Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    // Panning
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    const pt = getGridCoordinates(e);
    setHoveredPoint(pt);
    onHoverCoordsChange(pt);

    // Moving Selection
    if (currentTool === 'select') {
      if (isMovingSelection && moveStartRef.current && selection && pt) {
        const dx = pt.x - moveStartRef.current.startPt.x;
        const dy = pt.y - moveStartRef.current.startPt.y;
        const nextX = moveStartRef.current.initialSelX + dx;
        const nextY = moveStartRef.current.initialSelY + dy;
        setSelection(prev => prev ? { ...prev, x: nextX, y: nextY } : null);
        return;
      }

      if (isSelectingBox && selectStartPointRef.current && pt) {
        setSelectBoxEnd(pt);
        return;
      }

      drawOverlayCanvas(pt);
      return;
    }

    if (!isDrawing || !pt) {
      drawOverlayCanvas(pt);
      return;
    }

    const paintColor =
      currentTool === 'eraser'
        ? ''
        : isRightButton
        ? secondaryColor
        : primaryColor;

    if (currentTool === 'pencil' || currentTool === 'eraser') {
      const lastPt = lastDrawnPointRef.current || pt;
      const interpolatedLine = getBresenhamLine(lastPt, pt);
      applyPixelsToGrid(interpolatedLine, paintColor);
      lastDrawnPointRef.current = pt;
      drawMainCanvas();
      drawOverlayCanvas(pt);
    } else if (
      currentTool === 'line' ||
      currentTool === 'rect' ||
      currentTool === 'rect-fill' ||
      currentTool === 'round-rect' ||
      currentTool === 'round-rect-fill' ||
      currentTool === 'circle' ||
      currentTool === 'circle-fill'
    ) {
      // Shape Preview
      const startPt = dragStartPointRef.current || pt;
      let rawPoints: Point[] = [];
      const defaultCornerRadius = Math.max(1, brushSize);

      if (currentTool === 'line') {
        rawPoints = getBresenhamLine(startPt, pt);
      } else if (currentTool === 'rect') {
        rawPoints = getRectanglePoints(startPt, pt, false);
      } else if (currentTool === 'rect-fill') {
        rawPoints = getRectanglePoints(startPt, pt, true);
      } else if (currentTool === 'round-rect') {
        rawPoints = getRoundedRectPoints(startPt, pt, defaultCornerRadius, false);
      } else if (currentTool === 'round-rect-fill') {
        rawPoints = getRoundedRectPoints(startPt, pt, defaultCornerRadius, true);
      } else if (currentTool === 'circle') {
        rawPoints = getCirclePoints(startPt, pt, false);
      } else if (currentTool === 'circle-fill') {
        rawPoints = getCirclePoints(startPt, pt, true);
      }

      // Expand symmetry for preview
      const previewPoints: Point[] = [];
      for (const p of rawPoints) {
        previewPoints.push(...getSymmetricPoints(p, width, height, symmetry));
      }

      drawOverlayCanvas(pt, previewPoints, paintColor || 'rgba(255,255,255,0.8)');
    }
  };

  // Mouse Up
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (currentTool === 'select') {
      if (isMovingSelection) {
        setIsMovingSelection(false);
        moveStartRef.current = null;
        return;
      }

      if (isSelectingBox && selectStartPointRef.current) {
        setIsSelectingBox(false);
        const p1 = selectStartPointRef.current;
        const p2 = getGridCoordinates(e) || selectBoxEnd || p1;
        const minX = Math.min(p1.x, p2.x);
        const maxX = Math.max(p1.x, p2.x);
        const minY = Math.min(p1.y, p2.y);
        const maxY = Math.max(p1.y, p2.y);
        const w = maxX - minX + 1;
        const h = maxY - minY + 1;

        const sub = extractSubGrid(workingGridRef.current, minX, minY, w, h);
        const hasContent = sub.some(row => row.some(cell => cell && cell.trim() !== ''));

        if (w === 1 && h === 1 && !hasContent) {
          setSelection(null);
        } else {
          setSelection({
            x: minX,
            y: minY,
            width: w,
            height: h,
            pixels: sub,
            isFloating: false,
          });
        }
        selectStartPointRef.current = null;
        setSelectBoxEnd(null);
        return;
      }
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const pt = getGridCoordinates(e) || lastDrawnPointRef.current;
    const startPt = dragStartPointRef.current;

    const paintColor =
      currentTool === 'eraser'
        ? ''
        : isRightButton
        ? secondaryColor
        : primaryColor;

    if (
      startPt &&
      pt &&
      (currentTool === 'line' ||
        currentTool === 'rect' ||
        currentTool === 'rect-fill' ||
        currentTool === 'round-rect' ||
        currentTool === 'round-rect-fill' ||
        currentTool === 'circle' ||
        currentTool === 'circle-fill')
    ) {
      let rawPoints: Point[] = [];
      const defaultCornerRadius = Math.max(1, brushSize);

      if (currentTool === 'line') {
        rawPoints = getBresenhamLine(startPt, pt);
      } else if (currentTool === 'rect') {
        rawPoints = getRectanglePoints(startPt, pt, false);
      } else if (currentTool === 'rect-fill') {
        rawPoints = getRectanglePoints(startPt, pt, true);
      } else if (currentTool === 'round-rect') {
        rawPoints = getRoundedRectPoints(startPt, pt, defaultCornerRadius, false);
      } else if (currentTool === 'round-rect-fill') {
        rawPoints = getRoundedRectPoints(startPt, pt, defaultCornerRadius, true);
      } else if (currentTool === 'circle') {
        rawPoints = getCirclePoints(startPt, pt, false);
      } else if (currentTool === 'circle-fill') {
        rawPoints = getCirclePoints(startPt, pt, true);
      }

      const allPoints: Point[] = [];
      for (const p of rawPoints) {
        allPoints.push(...getSymmetricPoints(p, width, height, symmetry));
      }
      applyPixelsToGrid(allPoints, paintColor);
      drawMainCanvas();
    }

    // Commit change to history
    onCommitGrid(cloneGrid(workingGridRef.current));

    dragStartPointRef.current = null;
    lastDrawnPointRef.current = null;
    drawOverlayCanvas(null);
  };

  // Mouse Leave
  const handleMouseLeave = () => {
    setHoveredPoint(null);
    onHoverCoordsChange(null);
    if (isPanning) setIsPanning(false);

    if (currentTool === 'select') {
      if (isMovingSelection) {
        setIsMovingSelection(false);
        moveStartRef.current = null;
      }
      if (isSelectingBox) {
        setIsSelectingBox(false);
        selectStartPointRef.current = null;
        setSelectBoxEnd(null);
      }
    } else if (isDrawing) {
      setIsDrawing(false);
      onCommitGrid(cloneGrid(workingGridRef.current));
      dragStartPointRef.current = null;
      lastDrawnPointRef.current = null;
    }
    drawOverlayCanvas(null);
  };

  // Wheel to Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    const newZoom = Math.min(24, Math.max(0.25, zoom + delta));
    onZoomChange(Number(newZoom.toFixed(2)));
  };

  // Calculate dynamic cursor
  const getCursorStyle = () => {
    if (isPanning) return 'cursor-grabbing';
    if (currentTool === 'select') {
      if (isMovingSelection) return 'cursor-grabbing';
      if (
        selection &&
        hoveredPoint &&
        hoveredPoint.x >= selection.x &&
        hoveredPoint.x < selection.x + selection.width &&
        hoveredPoint.y >= selection.y &&
        hoveredPoint.y < selection.y + selection.height
      ) {
        return 'cursor-move';
      }
      return 'cursor-crosshair';
    }
    if (currentTool === 'eyedropper') return 'cursor-pointer';
    return 'cursor-crosshair';
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onContextMenu={e => e.preventDefault()}
      className={`flex-1 w-full h-full overflow-hidden flex items-center justify-center relative bg-slate-950 select-none ${getCursorStyle()}`}
    >
      {/* Selection Floating Action Bar */}
      {currentTool === 'select' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 max-w-[95%] pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
          {selection ? (
            <div className="flex flex-wrap items-center gap-1.5 px-3 py-1.5 bg-slate-900/95 border border-indigo-500/50 shadow-2xl shadow-indigo-950/80 rounded-xl backdrop-blur-md text-xs text-white">
              <div className="flex items-center gap-1.5 pr-2 border-r border-slate-700/80 text-indigo-300 font-medium">
                <BoxSelect className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>已選取 {selection.width}×{selection.height}</span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  (X:{selection.x}, Y:{selection.y})
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleFlipSelection('horizontal')}
                  title="水平翻轉選取方塊"
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">水平翻轉</span>
                </button>

                <button
                  onClick={() => handleFlipSelection('vertical')}
                  title="垂直翻轉選取方塊"
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">垂直翻轉</span>
                </button>

                <button
                  onClick={handleDuplicateSelection}
                  title="複製此方塊"
                  className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">複製</span>
                </button>

                <button
                  onClick={handleDeleteSelection}
                  title="刪除選取方塊 (Delete / Backspace)"
                  className="px-2 py-1 rounded-md bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">刪除</span>
                </button>
              </div>

              <div className="h-4 w-px bg-slate-700 mx-0.5"></div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCommitSelection}
                  title="確認並定位此方塊 (Enter)"
                  className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm transition-colors flex items-center gap-1 text-[11px]"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>完成定位</span>
                </button>

                <button
                  onClick={handleCancelSelection}
                  title="取消選取 (Esc)"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-700/80 shadow-xl rounded-xl backdrop-blur-md text-xs text-slate-300">
              <BoxSelect className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="hidden sm:inline">拖曳框選方塊或點擊：</span>
              <button
                onClick={handleAutoSelectContent}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium transition-all flex items-center gap-1 text-[11px] shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>自動框選圖案內容</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Canvas Frame */}
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
        className={`relative shadow-2xl transition-transform duration-75 border-2 border-slate-700/80 rounded-sm ${
          checkerboardDark ? 'pixel-bg-checkerboard' : 'pixel-bg-checkerboard-light'
        }`}
      >
        {/* Main Pixel Canvas */}
        <canvas
          ref={canvasRef}
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
          className="absolute inset-0 pixelated"
        />

        {/* Interactive Overlay Canvas (Grid, Cursor, Symmetry, Live preview, Selection Marquee) */}
        <canvas
          ref={overlayCanvasRef}
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`absolute inset-0 z-10 ${getCursorStyle()}`}
        />
      </div>
    </div>
  );
};
