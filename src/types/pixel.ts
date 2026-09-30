export type Tool = 
  | 'pencil' 
  | 'eraser' 
  | 'bucket' 
  | 'eyedropper' 
  | 'select'
  | 'line' 
  | 'rect' 
  | 'rect-fill' 
  | 'round-rect'
  | 'round-rect-fill'
  | 'circle' 
  | 'circle-fill';

export interface SelectionState {
  x: number;
  y: number;
  width: number;
  height: number;
  pixels: string[][];
  isFloating: boolean; // whether original position has been lifted from canvas
}

export type BrushSize = 1 | 2 | 3 | 4;

export interface Point {
  x: number;
  y: number;
}

export type Grid = string[][]; // 2D array of hex color strings or '' for transparent

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface SymmetryConfig {
  horizontal: boolean; // Mirror across vertical axis (left-right)
  vertical: boolean;   // Mirror across horizontal axis (top-bottom)
}

export interface PalettePreset {
  id: string;
  name: string;
  colors: string[];
}

export interface TemplateArt {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
  data: string[][];
}

export interface ExportConfig {
  scale: number;
  includeGrid: boolean;
  backgroundMode: 'transparent' | 'solid';
  backgroundColor: string;
  fileName: string;
  cornerRadius: number; // 0 (none), 1, 2, 3, 4
  shadowEnabled: boolean;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowColor: string;
}

export interface SavedProject {
  id: string;
  title: string;
  width: number;
  height: number;
  grid: Grid;
  thumbnail: string; // base64 / data URL
  createdAt: number;
  updatedAt: number;
}

