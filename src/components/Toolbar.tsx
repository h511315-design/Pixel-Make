import React from 'react';
import {
  Pencil,
  Eraser,
  BoxSelect,
  PaintBucket,
  Pipette,
  Minus,
  Square,
  Circle,
  Grid as GridIcon,
  Columns,
  Rows,
  Sparkle,
  Paintbrush
} from 'lucide-react';
import { Tool, BrushSize, SymmetryConfig } from '../types/pixel';

interface ToolbarProps {
  currentTool: Tool;
  onSelectTool: (tool: Tool) => void;
  brushSize: BrushSize;
  onChangeBrushSize: (size: BrushSize) => void;
  symmetry: SymmetryConfig;
  onToggleSymmetry: (type: 'horizontal' | 'vertical') => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  checkerboardDark: boolean;
  onToggleCheckerboard: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onSelectTool,
  brushSize,
  onChangeBrushSize,
  symmetry,
  onToggleSymmetry,
  showGrid,
  onToggleGrid,
  checkerboardDark,
  onToggleCheckerboard,
}) => {
  const tools: { id: Tool; label: string; shortcut: string; icon: React.ReactNode }[] = [
    { id: 'pencil', label: '鉛筆畫筆', shortcut: 'P', icon: <Pencil className="w-4 h-4" /> },
    { id: 'eraser', label: '橡皮擦', shortcut: 'E', icon: <Eraser className="w-4 h-4" /> },
    { id: 'select', label: '選取移動工具 (框選移動方塊)', shortcut: 'M', icon: <BoxSelect className="w-4 h-4" /> },
    { id: 'bucket', label: '油漆桶填色', shortcut: 'B', icon: <PaintBucket className="w-4 h-4" /> },
    { id: 'eyedropper', label: '滴管取色', shortcut: 'I', icon: <Pipette className="w-4 h-4" /> },
    { id: 'line', label: '直線工具', shortcut: 'L', icon: <Minus className="w-4 h-4 -rotate-45" /> },
    { id: 'rect', label: '直角矩形', shortcut: 'U', icon: <Square className="w-4 h-4 stroke-[1.5]" /> },
    { id: 'rect-fill', label: '實心直角矩形', shortcut: 'Shift+U', icon: <Square className="w-4 h-4 fill-current stroke-[1.5]" /> },
    {
      id: 'round-rect',
      label: '圓角矩形 (按鈕框)',
      shortcut: 'R',
      icon: (
        <div className="w-3.5 h-3 rounded-[3px] border-[1.5px] border-current"></div>
      ),
    },
    {
      id: 'round-rect-fill',
      label: '實心圓角矩形 (按鈕底)',
      shortcut: 'Shift+R',
      icon: (
        <div className="w-3.5 h-3 rounded-[3px] bg-current"></div>
      ),
    },
    { id: 'circle', label: '圓形框線', shortcut: 'C', icon: <Circle className="w-4 h-4 stroke-[1.5]" /> },
    { id: 'circle-fill', label: '實心圓形', shortcut: 'Shift+C', icon: <Circle className="w-4 h-4 fill-current stroke-[1.5]" /> },
  ];

  return (
    <aside className="w-14 sm:w-16 bg-slate-925 border-r border-slate-800 flex flex-col items-center py-3 select-none shrink-0 gap-3 z-10 overflow-y-auto">
      {/* Drawing Tools Group */}
      <div className="flex flex-col gap-1 w-full px-2">
        <span className="text-[10px] text-slate-500 font-mono text-center mb-0.5 tracking-wider uppercase">工具</span>
        {tools.map(tool => {
          const isActive = currentTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              aria-label={tool.label}
              className={`w-10 h-10 sm:w-11 sm:h-11 mx-auto rounded-lg flex items-center justify-center transition-all relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
              }`}
            >
              {tool.icon}
              {isActive && (
                <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-400 rounded-r"></span>
              )}
            </button>
          );
        })}
      </div>

      <div className="w-8 h-px bg-slate-800 my-1"></div>

      {/* Brush Size (Only for pencil / eraser) */}
      <div className="flex flex-col items-center gap-1 w-full px-2">
        <span className="text-[10px] text-slate-500 font-mono text-center tracking-wider uppercase">筆刷</span>
        <div className="flex flex-col gap-1 w-full items-center">
          {([1, 2, 3, 4] as BrushSize[]).map(size => (
            <button
              key={size}
              onClick={() => onChangeBrushSize(size)}
              title={`筆刷尺寸: ${size}px`}
              aria-label={`筆刷尺寸: ${size}px`}
              className={`w-8 h-7 rounded flex items-center justify-center text-xs font-mono transition-all ${
                brushSize === size
                  ? 'bg-slate-700 text-amber-300 font-bold border border-amber-400/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span
                className="bg-current rounded-none"
                style={{ width: `${size * 2 + 1}px`, height: `${size * 2 + 1}px` }}
              ></span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-8 h-px bg-slate-800 my-1"></div>

      {/* Symmetry Modes */}
      <div className="flex flex-col items-center gap-1 w-full px-2">
        <span className="text-[10px] text-slate-500 font-mono text-center tracking-wider uppercase">對稱</span>
        <div className="flex flex-col gap-1 items-center">
          <button
            onClick={() => onToggleSymmetry('horizontal')}
            title="水平鏡像對稱 (左右對稱繪製)"
            aria-label="左右對稱"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              symmetry.horizontal
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Columns className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleSymmetry('vertical')}
            title="垂直鏡像對稱 (上下對稱繪製)"
            aria-label="上下對稱"
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              symmetry.vertical
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Rows className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="w-8 h-px bg-slate-800 my-1"></div>

      {/* View Options: Grid & Background */}
      <div className="flex flex-col items-center gap-1 w-full px-2 mt-auto">
        <button
          onClick={onToggleGrid}
          title={showGrid ? '隱藏網格 (G)' : '顯示網格 (G)'}
          aria-label="切換網格"
          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
            showGrid
              ? 'bg-slate-800 text-sky-400 border border-sky-400/30'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/60'
          }`}
        >
          <GridIcon className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleCheckerboard}
          title={checkerboardDark ? '切換為亮色透明棋盤底' : '切換為暗色透明棋盤底'}
          aria-label="切換畫布底色"
          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs"
        >
          <div
            className={`w-4 h-4 rounded-sm border border-slate-600 ${
              checkerboardDark ? 'bg-slate-800' : 'bg-slate-200'
            }`}
          ></div>
        </button>
      </div>
    </aside>
  );
};
