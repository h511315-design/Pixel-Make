import React, { useState } from 'react';
import { X, Check, Maximize2, Move, Minimize2, Sparkles, AlertCircle } from 'lucide-react';
import { Grid } from '../types/pixel';

interface ResizeCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWidth: number;
  currentHeight: number;
  onApplyResize: (newWidth: number, newHeight: number, mode: 'preserve' | 'scale', anchor: 'top-left' | 'center') => void;
}

export const ResizeCanvasModal: React.FC<ResizeCanvasModalProps> = ({
  isOpen,
  onClose,
  currentWidth,
  currentHeight,
  onApplyResize,
}) => {
  const [widthInput, setWidthInput] = useState<number>(currentWidth);
  const [heightInput, setHeightInput] = useState<number>(currentHeight);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(false);
  const [mode, setMode] = useState<'preserve' | 'scale'>('preserve');
  const [anchor, setAnchor] = useState<'center' | 'top-left'>('center');

  // Sync inputs when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setWidthInput(currentWidth);
      setHeightInput(currentHeight);
    }
  }, [isOpen, currentWidth, currentHeight]);

  if (!isOpen) return null;

  const handleWidthChange = (val: number) => {
    const clamped = Math.max(1, Math.min(128, val || 1));
    setWidthInput(clamped);
    if (lockAspectRatio && currentWidth > 0) {
      const ratio = currentHeight / currentWidth;
      setHeightInput(Math.max(1, Math.min(128, Math.round(clamped * ratio))));
    }
  };

  const handleHeightChange = (val: number) => {
    const clamped = Math.max(1, Math.min(128, val || 1));
    setHeightInput(clamped);
    if (lockAspectRatio && currentHeight > 0) {
      const ratio = currentWidth / currentHeight;
      setWidthInput(Math.max(1, Math.min(128, Math.round(clamped * ratio))));
    }
  };

  const handleApply = () => {
    onApplyResize(widthInput, heightInput, mode, anchor);
    onClose();
  };

  const presetSizes = [
    { w: 8, h: 8, label: '8×8 (小圖示)' },
    { w: 16, h: 16, label: '16×16 (經典)' },
    { w: 24, h: 16, label: '24×16 (遊戲按鈕)' },
    { w: 24, h: 24, label: '24×24 (標準)' },
    { w: 32, h: 16, label: '32×16 (長條按鈕)' },
    { w: 32, h: 32, label: '32×32 (高清精靈)' },
    { w: 48, h: 48, label: '48×48 (RPG 角色)' },
    { w: 64, h: 64, label: '64×64 (大地圖/場景)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-indigo-600/20 text-indigo-400">
              <Maximize2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">調整畫布尺寸</h2>
              <p className="text-[11px] text-slate-400">自訂幾成幾的畫布大小</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 text-xs">
          {/* Custom Width x Height Inputs */}
          <div className="p-3.5 bg-slate-800/40 rounded-lg border border-slate-800 flex flex-col gap-2.5">
            <span className="font-semibold text-slate-200 flex items-center justify-between">
              <span>自訂畫布大小 (寬 × 高)</span>
              <span className="font-mono text-[11px] text-indigo-400">
                目前: {currentWidth} × {currentHeight} 格
              </span>
            </span>

            <div className="flex items-center justify-center gap-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">寬度 (格數 / Width)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="128"
                    value={widthInput}
                    onChange={e => handleWidthChange(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-sm text-center focus:border-indigo-500 outline-none"
                  />
                  <span className="text-slate-500 font-mono">格</span>
                </div>
              </div>

              <div className="text-slate-500 text-lg font-bold pt-4">×</div>

              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[11px] text-slate-400">高度 (格數 / Height)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="128"
                    value={heightInput}
                    onChange={e => handleHeightChange(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-sm text-center focus:border-indigo-500 outline-none"
                  />
                  <span className="text-slate-500 font-mono">格</span>
                </div>
              </div>
            </div>

            {/* Quick +/- buttons */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <div className="flex items-center gap-1">
                <span className="text-slate-500 mr-1">微調:</span>
                <button
                  onClick={() => handleWidthChange(widthInput + 1)}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  寬+1
                </button>
                <button
                  onClick={() => handleWidthChange(widthInput - 1)}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  寬-1
                </button>
                <button
                  onClick={() => handleHeightChange(heightInput + 1)}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 ml-1"
                >
                  高+1
                </button>
                <button
                  onClick={() => handleHeightChange(heightInput - 1)}
                  className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  高-1
                </button>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={lockAspectRatio}
                  onChange={e => setLockAspectRatio(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                />
                <span>鎖定等比例</span>
              </label>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold text-slate-300">常用尺寸規格</span>
            <div className="grid grid-cols-4 gap-1.5">
              {presetSizes.map(item => (
                <button
                  key={`${item.w}x${item.h}`}
                  onClick={() => {
                    setWidthInput(item.w);
                    setHeightInput(item.h);
                  }}
                  className={`py-1.5 px-1 rounded text-center font-mono text-[11px] border transition-colors ${
                    widthInput === item.w && heightInput === item.h
                      ? 'bg-indigo-600 border-indigo-500 text-white font-semibold'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div>{item.w}×{item.h}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Handling Mode */}
          <div className="flex flex-col gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-800">
            <span className="font-semibold text-slate-200">現有像素內容處理方式</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('preserve')}
                className={`p-2 rounded text-left border transition-all ${
                  mode === 'preserve'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs text-indigo-300">保留原本像素 (推薦)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">畫布放大時周圍補空白，縮小時裁切多餘部分</div>
              </button>

              <button
                onClick={() => setMode('scale')}
                className={`p-2 rounded text-left border transition-all ${
                  mode === 'scale'
                    ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-xs text-indigo-300">等比例縮放像素</div>
                <div className="text-[10px] text-slate-400 mt-0.5">將現有圖畫重新採樣縮放到新尺寸中</div>
              </button>
            </div>

            {mode === 'preserve' && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 mt-1">
                <span className="text-[11px] text-slate-400">內容對齊錨點:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAnchor('center')}
                    className={`px-2 py-0.5 rounded text-[11px] border ${
                      anchor === 'center'
                        ? 'bg-indigo-600 border-indigo-500 text-white font-medium'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    居中對齊
                  </button>
                  <button
                    onClick={() => setAnchor('top-left')}
                    className={`px-2 py-0.5 rounded text-[11px] border ${
                      anchor === 'top-left'
                        ? 'bg-indigo-600 border-indigo-500 text-white font-medium'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    左上角對齊
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            即將改為: <strong className="text-white">{widthInput} × {heightInput}</strong> 格
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleApply}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded shadow-md shadow-indigo-600/30 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>確認調整尺寸</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
