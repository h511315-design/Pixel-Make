import React from 'react';
import {
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Sliders,
  Settings2
} from 'lucide-react';

interface CanvasControlsProps {
  width: number;
  height: number;
  onChangeDimensions: (w: number, h: number) => void;
  onOpenResizeModal: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
  onRotate90: () => void;
  onShift: (dx: number, dy: number) => void;
  onClear: () => void;
  hoverCoords: { x: number; y: number } | null;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  width,
  height,
  onChangeDimensions,
  onOpenResizeModal,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFlipHorizontal,
  onFlipVertical,
  onRotate90,
  onShift,
  onClear,
  hoverCoords,
}) => {
  const dimensionPresets = [
    { w: 8, h: 8, label: '8×8' },
    { w: 16, h: 16, label: '16×16' },
    { w: 24, h: 16, label: '24×16' },
    { w: 24, h: 24, label: '24×24' },
    { w: 32, h: 32, label: '32×32' },
    { w: 48, h: 48, label: '48×48' },
    { w: 64, h: 64, label: '64×64' },
  ];

  return (
    <div className="h-12 border-t border-slate-800 bg-slate-950 px-4 flex items-center justify-between select-none text-xs text-slate-400 shrink-0 gap-2 overflow-x-auto">
      {/* Left: Resolution Presets & Custom Size Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-slate-500 font-medium hidden md:inline">畫布尺寸:</span>
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-md p-0.5">
          {dimensionPresets.map(preset => {
            const isCurrent = width === preset.w && height === preset.h;
            return (
              <button
                key={preset.label}
                onClick={() => onChangeDimensions(preset.w, preset.h)}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  isCurrent
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            );
          })}

          {/* Custom Size Trigger Button */}
          <button
            onClick={onOpenResizeModal}
            className="flex items-center gap-1 px-2 py-1 ml-0.5 rounded text-[11px] font-medium text-indigo-400 bg-indigo-950/60 hover:bg-indigo-900/80 hover:text-indigo-200 border border-indigo-800/80 transition-colors"
            title="自訂任意畫布大小 (幾乘幾)"
          >
            <Settings2 className="w-3 h-3 text-indigo-400" />
            <span>自訂 {width}×{height}</span>
          </button>
        </div>
      </div>

      {/* Middle: Canvas Shift and Transforms */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-md p-0.5">
          <button
            onClick={() => onShift(0, -1)}
            title="向上平移 1 格"
            aria-label="向上平移"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onShift(0, 1)}
            title="向下平移 1 格"
            aria-label="向下平移"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onShift(-1, 0)}
            title="向左平移 1 格"
            aria-label="向左平移"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onShift(1, 0)}
            title="向右平移 1 格"
            aria-label="向右平移"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-0.5 bg-slate-900 border border-slate-800 rounded-md p-0.5">
          <button
            onClick={onFlipHorizontal}
            title="水平鏡像翻轉"
            aria-label="水平翻轉"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onFlipVertical}
            title="垂直鏡像翻轉"
            aria-label="垂直翻轉"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            <FlipVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onRotate90}
            title="順時針旋轉 90°"
            aria-label="順時針旋轉 90°"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClear}
            title="清空畫布"
            aria-label="清空畫布"
            className="p-1 hover:text-rose-400 hover:bg-rose-950/40 rounded text-slate-400"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Zoom controls and Coordinate display */}
      <div className="flex items-center gap-3 shrink-0">
        {hoverCoords && (
          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
            <span>X:{hoverCoords.x}</span>
            <span className="text-slate-600">,</span>
            <span>Y:{hoverCoords.y}</span>
          </div>
        )}

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-md p-0.5">
          <button
            onClick={onZoomOut}
            title="縮小"
            aria-label="縮小"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetZoom}
            title="重設縮放 (適應)"
            aria-label="重設縮放"
            className="px-1.5 py-0.5 text-[11px] font-mono hover:text-white hover:bg-slate-800 rounded"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            title="放大"
            aria-label="放大"
            className="p-1 hover:text-white hover:bg-slate-800 rounded"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
