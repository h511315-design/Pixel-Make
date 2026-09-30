import React, { useState } from 'react';
import { X, Sparkles, Layers, Box, Check, CornerDownRight } from 'lucide-react';
import { Grid } from '../types/pixel';
import { applyCornerRadius, applyBlockShadow, applyButton3DBevel } from '../utils/pixelMath';

interface ButtonFxModalProps {
  isOpen: boolean;
  onClose: () => void;
  grid: Grid;
  onApplyGrid: (newGrid: Grid) => void;
}

export const ButtonFxModal: React.FC<ButtonFxModalProps> = ({
  isOpen,
  onClose,
  grid,
  onApplyGrid,
}) => {
  const [cornerRadius, setCornerRadius] = useState<number>(2);
  const [shadowOffset, setShadowOffset] = useState<number>(2);
  const [shadowColor, setShadowColor] = useState<string>('#1a1c2c');
  const [highlightColor, setHighlightColor] = useState<string>('#ffffff');
  const [bevelShadowColor, setBevelShadowColor] = useState<string>('#000000');
  const [appliedFeedback, setAppliedFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setAppliedFeedback(msg);
    setTimeout(() => setAppliedFeedback(null), 2000);
  };

  // 1. Apply Corner Radius
  const handleApplyCornerRadius = () => {
    const updated = applyCornerRadius(grid, cornerRadius);
    onApplyGrid(updated);
    showFeedback(`已套用 ${cornerRadius} 格圓角裁切！`);
  };

  // 2. Apply Block Drop Shadow
  const handleApplyBlockShadow = () => {
    const updated = applyBlockShadow(grid, shadowOffset, shadowOffset, shadowColor);
    onApplyGrid(updated);
    showFeedback(`已新增 +${shadowOffset} 格立體方塊陰影！`);
  };

  // 3. Apply 3D Bevel
  const handleApply3DBevel = () => {
    const updated = applyButton3DBevel(grid, highlightColor, bevelShadowColor);
    onApplyGrid(updated);
    showFeedback('已套用立體按鈕高光與暗部邊框！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">遊戲按鈕魔術師</h2>
              <p className="text-[11px] text-slate-400">一鍵套用圓角裁切、立體浮雕邊框與經典像素方塊陰影</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Applied banner */}
        {appliedFeedback && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs px-4 py-2 flex items-center gap-2 justify-center font-medium animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{appliedFeedback}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto max-h-[75vh]">
          {/* Section 1: 圓角裁切 */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-slate-200">1. 像素按鈕圓角化</span>
              </div>
              <span className="text-xs text-amber-400/90 font-mono">{cornerRadius} 格圓角</span>
            </div>
            <p className="text-xs text-slate-400">
              自動去除內容的 4 個尖角像素，使其呈現平滑或復古階梯狀的圓角外觀。
            </p>

            <div className="flex items-center gap-2">
              {[
                { r: 1, label: '微圓 (1格)' },
                { r: 2, label: '標準 (2格)' },
                { r: 3, label: '大圓 (3格)' },
                { r: 4, label: '特大 (4格)' },
              ].map(opt => (
                <button
                  key={opt.r}
                  onClick={() => setCornerRadius(opt.r)}
                  className={`flex-1 py-1.5 rounded text-xs font-mono border transition-all ${
                    cornerRadius === opt.r
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleApplyCornerRadius}
              className="mt-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>套用圓角到當前畫布</span>
            </button>
          </div>

          {/* Section 2: 方塊陰影 */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-slate-200">2. 方塊立體陰影 (Block Shadow)</span>
              </div>
              <span className="text-xs text-indigo-400/90 font-mono">+{shadowOffset} 格偏移</span>
            </div>
            <p className="text-xs text-slate-400">
              在所有非透明像素右下方投射經典復古的方塊陰影，營造卡牌與遊戲按鈕的厚度感。
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">陰影偏移距離:</span>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map(off => (
                  <button
                    key={off}
                    onClick={() => setShadowOffset(off)}
                    className={`px-3 py-1 rounded text-xs font-mono border ${
                      shadowOffset === off
                        ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    +{off}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">陰影顏色:</span>
              <div className="flex items-center gap-1.5">
                {['#1a1c2c', '#000000', '#2b1810', '#1d2b53', '#3e2731'].map(c => (
                  <button
                    key={c}
                    onClick={() => setShadowColor(c)}
                    className={`w-5 h-5 rounded-sm border ${
                      shadowColor === c
                        ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900'
                        : 'border-slate-600'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={shadowColor}
                  onChange={e => setShadowColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer ml-1"
                />
              </div>
            </div>

            <button
              onClick={handleApplyBlockShadow}
              className="mt-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>新增方塊陰影到畫布</span>
            </button>
          </div>

          {/* Section 3: 3D 浮雕高光與暗部 */}
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-slate-200">3. 立體 3D 浮雕邊框 (Bevel)</span>
            </div>
            <p className="text-xs text-slate-400">
              將外框邊緣轉化為「左上高光 + 右下暗面」，打造 90 年代街機按鈕的按壓感。
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400">左上高光:</span>
                <input
                  type="color"
                  value={highlightColor}
                  onChange={e => setHighlightColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                <span className="text-slate-400">右下暗部:</span>
                <input
                  type="color"
                  value={bevelShadowColor}
                  onChange={e => setBevelShadowColor(e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={handleApply3DBevel}
              className="mt-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span>套用 3D 浮雕邊框到畫布</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">所有操作皆可使用 Ctrl+Z 隨時復原</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
