import React, { useState, useEffect, useRef } from 'react';
import { X, Download, Copy, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Grid } from '../types/pixel';
import { renderGridToCanvas, downloadCanvasAsPNG, copyCanvasToClipboard } from '../utils/pixelMath';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  grid: Grid;
  defaultName?: string;
  canvasZoom?: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  grid,
  defaultName = 'pixel-art',
  canvasZoom = 1.8,
}) => {
  // Screen canvas pixel size calculation (16px * zoom)
  const screenPixelSize = Math.round(16 * canvasZoom);

  // Default to screen scale so it matches the canvas on screen at 1:1 visual size!
  const [scale, setScale] = useState<number>(() => Math.max(16, screenPixelSize));
  const [backgroundMode, setBackgroundMode] = useState<'transparent' | 'solid'>('transparent');
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [includeGrid, setIncludeGrid] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>(defaultName);
  const [copied, setCopied] = useState<boolean>(false);
  const [cropToContent, setCropToContent] = useState<boolean>(false);

  // Button-specific features requested by user
  const [cornerRadius, setCornerRadius] = useState<number>(0);
  const [shadowEnabled, setShadowEnabled] = useState<boolean>(false);
  const [shadowOffset, setShadowOffset] = useState<number>(2);
  const [shadowColor, setShadowColor] = useState<string>('#1a1c2c');

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const origHeight = grid.length;
  const origWidth = origHeight > 0 ? grid[0].length : 0;

  // Calculate content bounds if cropped
  let contentWidth = origWidth;
  let contentHeight = origHeight;
  if (cropToContent) {
    let bMinX = origWidth, bMinY = origHeight, bMaxX = -1, bMaxY = -1;
    let found = false;
    for (let y = 0; y < origHeight; y++) {
      for (let x = 0; x < origWidth; x++) {
        if (grid[y][x] && grid[y][x].trim() !== '') {
          found = true;
          if (x < bMinX) bMinX = x;
          if (x > bMaxX) bMaxX = x;
          if (y < bMinY) bMinY = y;
          if (y > bMaxY) bMaxY = y;
        }
      }
    }
    if (found) {
      contentWidth = bMaxX - bMinX + 1;
      contentHeight = bMaxY - bMinY + 1;
    }
  }

  const baseWidth = cropToContent ? contentWidth : origWidth;
  const baseHeight = cropToContent ? contentHeight : origHeight;
  const extraPadX = shadowEnabled ? shadowOffset : 0;
  const extraPadY = shadowEnabled ? shadowOffset : 0;
  const outputWidth = (baseWidth + extraPadX) * scale;
  const outputHeight = (baseHeight + extraPadY) * scale;

  // Render preview canvas whenever options change
  useEffect(() => {
    if (!isOpen || !previewCanvasRef.current) return;

    const sourceCanvas = renderGridToCanvas(grid, scale, {
      backgroundMode,
      backgroundColor,
      includeGrid,
      gridColor: 'rgba(0, 0, 0, 0.15)',
      cornerRadius,
      shadowEnabled,
      shadowOffsetX: shadowOffset,
      shadowOffsetY: shadowOffset,
      shadowColor,
      cropToContent,
    });

    const previewCanvas = previewCanvasRef.current;
    previewCanvas.width = sourceCanvas.width;
    previewCanvas.height = sourceCanvas.height;

    const ctx = previewCanvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      ctx.drawImage(sourceCanvas, 0, 0);
    }
  }, [
    isOpen,
    grid,
    scale,
    backgroundMode,
    backgroundColor,
    includeGrid,
    cornerRadius,
    shadowEnabled,
    shadowOffset,
    shadowColor,
    cropToContent,
  ]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const canvas = renderGridToCanvas(grid, scale, {
      backgroundMode,
      backgroundColor,
      includeGrid,
      gridColor: 'rgba(0, 0, 0, 0.15)',
      cornerRadius,
      shadowEnabled,
      shadowOffsetX: shadowOffset,
      shadowOffsetY: shadowOffset,
      shadowColor,
      cropToContent,
    });
    const finalFileName = fileName.trim() || 'pixel-art';
    downloadCanvasAsPNG(canvas, `${finalFileName}-${outputWidth}x${outputHeight}`);
  };

  const handleCopyClipboard = async () => {
    const canvas = renderGridToCanvas(grid, scale, {
      backgroundMode,
      backgroundColor,
      includeGrid,
      gridColor: 'rgba(0, 0, 0, 0.15)',
      cornerRadius,
      shadowEnabled,
      shadowOffsetX: shadowOffset,
      shadowOffsetY: shadowOffset,
      shadowColor,
      cropToContent,
    });
    const success = await copyCanvasToClipboard(canvas);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scalePresets = [
    { label: '1:1 畫面同大 (高清)', val: screenPixelSize, desc: `跟畫布畫面上視覺一樣大 (${outputWidth}×${outputHeight}px)` },
    { label: '16× 標準高清', val: 16, desc: `${(baseWidth + extraPadX) * 16}×${(baseHeight + extraPadY) * 16}px` },
    { label: '24× 大圖高清', val: 24, desc: `${(baseWidth + extraPadX) * 24}×${(baseHeight + extraPadY) * 24}px` },
    { label: '32× 超高清 4K 級', val: 32, desc: `${(baseWidth + extraPadX) * 32}×${(baseHeight + extraPadY) * 32}px` },
    { label: '8× 中尺寸', val: 8, desc: `${(baseWidth + extraPadX) * 8}×${(baseHeight + extraPadY) * 8}px` },
    { label: '1× 點陣單像素 (遊戲 Sprite)', val: 1, desc: `${baseWidth + extraPadX}×${baseHeight + extraPadY}px (無放大)` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-indigo-600/20 text-indigo-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-white">匯出 PNG 圖片</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex flex-col md:flex-row gap-6">
          {/* Left: Live Preview */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <span className="text-xs text-slate-400 mb-2 font-medium">即時輸出預覽</span>
            <div className="w-full aspect-square max-w-[280px] rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center relative p-2 shadow-inner pixel-bg-checkerboard">
              <canvas
                ref={previewCanvasRef}
                className="max-w-full max-h-full object-contain pixelated shadow-md rounded"
              />
            </div>
            <div className="mt-2 text-xs font-mono text-slate-400 flex flex-wrap items-center justify-center gap-2">
              <span>
                輸出解析度: <span className="text-white font-bold">{outputWidth} × {outputHeight}</span> px
              </span>
              <span className="text-slate-600">·</span>
              <span>
                {scale === screenPixelSize ? (
                  <span className="text-emerald-400 font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/80">
                    高清大圖 (畫面 1:1 同等大小)
                  </span>
                ) : scale === 1 ? (
                  <span className="text-amber-400 font-semibold bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800/80">
                    點陣原粒 (1:1 單像素)
                  </span>
                ) : (
                  <span>放大 {scale} 倍</span>
                )}
              </span>
              {cropToContent && (
                <span className="text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/80">
                  已自動裁切留白 ({contentWidth}×{contentHeight})
                </span>
              )}
            </div>
          </div>

          {/* Right: Export Settings */}
          <div className="flex-1 flex flex-col gap-4 text-xs">
            {/* Quick 1:1 Dual Mode Options */}
            <div className="p-3 rounded-lg border border-indigo-500/40 bg-indigo-950/20 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <span>常用「原尺寸」快捷切換</span>
                  <span className="text-[10px] text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.2 rounded font-medium">清晰無失真</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setScale(screenPixelSize)}
                  className={`p-2.5 rounded-lg text-left transition-all border flex flex-col gap-1 ${
                    scale === screenPixelSize
                      ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md ring-1 ring-indigo-400'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-indigo-300">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>跟螢幕畫布一樣大</span>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    高清視覺 1:1，放大至 {outputWidth}×{outputHeight}px，不會縮小成米粒！
                  </span>
                </button>

                <button
                  onClick={() => setScale(1)}
                  className={`p-2.5 rounded-lg text-left transition-all border flex flex-col gap-1 ${
                    scale === 1
                      ? 'bg-amber-600/30 border-amber-400 text-white shadow-md ring-1 ring-amber-400'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-300">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>點陣原像素 (1 格 = 1 px)</span>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    無放大 ({baseWidth + extraPadX}×{baseHeight + extraPadY}px)，專供 Unity/Godot 遊戲精靈圖
                  </span>
                </button>
              </div>
            </div>

            {/* Resolution Scaling Presets */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200">像素高清倍率選擇</label>
                <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <span>自訂:</span>
                  <input
                    type="number"
                    min="1"
                    max="64"
                    value={scale}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1 && val <= 64) {
                        setScale(val);
                      }
                    }}
                    className="w-12 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-white font-mono text-center outline-none focus:border-indigo-500"
                  />
                  <span>倍</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {scalePresets.map(preset => (
                  <button
                    key={preset.label}
                    onClick={() => setScale(preset.val)}
                    className={`py-2 px-2 rounded font-mono text-xs transition-colors border flex flex-col items-center justify-center gap-0.5 text-center ${
                      scale === preset.val
                        ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-sm'
                        : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <span className="font-semibold">{preset.label}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {preset.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Crop to Content Sprite Option */}
            <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg border border-slate-800">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-200">自動裁切周圍透明留白</span>
                  <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-1 rounded">精靈圖</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  僅匯出有繪製內容的最小邊界 ({contentWidth}×{contentHeight} 像素)
                </span>
              </div>
              <input
                type="checkbox"
                checked={cropToContent}
                onChange={e => setCropToContent(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Background Mode */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-200">背景樣式</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBackgroundMode('transparent')}
                  className={`flex-1 py-1.5 px-3 rounded border text-xs font-medium transition-colors ${
                    backgroundMode === 'transparent'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  透明背景 (PNG)
                </button>
                <button
                  onClick={() => setBackgroundMode('solid')}
                  className={`flex-1 py-1.5 px-3 rounded border text-xs font-medium transition-colors ${
                    backgroundMode === 'solid'
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  純色填底
                </button>
              </div>

              {backgroundMode === 'solid' && (
                <div className="flex items-center gap-2 mt-1 p-2 bg-slate-800/50 rounded border border-slate-800">
                  <span className="text-slate-400">底色:</span>
                  <div className="flex items-center gap-1.5">
                    {['#ffffff', '#000000', '#0f172a', '#fee761'].map(c => (
                      <button
                        key={c}
                        onClick={() => setBackgroundColor(c)}
                        className={`w-5 h-5 rounded-full border ${
                          backgroundColor === c ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900' : 'border-slate-600'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={e => setBackgroundColor(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer ml-1"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Game Button Rounding & Shadow section */}
            <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-800 flex flex-col gap-3">
              {/* Corner Radius */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <span>遊戲按鈕圓角</span>
                    <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-1.5 py-0.5 rounded">NEW</span>
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {cornerRadius === 0 ? '無圓角 (直角)' : `${cornerRadius} 格圓角`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { r: 0, label: '無 (直角)' },
                    { r: 1, label: '微圓 (1格)' },
                    { r: 2, label: '標準 (2格)' },
                    { r: 3, label: '大圓 (3格)' },
                  ].map(item => (
                    <button
                      key={item.r}
                      onClick={() => setCornerRadius(item.r)}
                      className={`py-1 px-1.5 rounded font-mono text-[11px] border transition-colors ${
                        cornerRadius === item.r
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                          : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-750'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Block Shadow */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                      <span>方塊立體陰影 (Block Shadow)</span>
                      <span className="text-[10px] text-indigo-400/80 bg-indigo-400/10 px-1.5 py-0.5 rounded">按鈕專用</span>
                    </span>
                    <span className="text-[11px] text-slate-400">在按鈕下方投射經典像素立體方塊陰影</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shadowEnabled}
                    onChange={e => setShadowEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                  />
                </div>

                {shadowEnabled && (
                  <div className="flex flex-col gap-2 p-2 bg-slate-900/60 rounded border border-slate-800 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">陰影偏移距離:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4].map(offset => (
                          <button
                            key={offset}
                            onClick={() => setShadowOffset(offset)}
                            className={`px-2 py-0.5 rounded font-mono text-xs border ${
                              shadowOffset === offset
                                ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            }`}
                          >
                            +{offset}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">陰影顏色:</span>
                      <div className="flex items-center gap-1.5">
                        {['#1a1c2c', '#000000', '#2b1810', '#1d2b53', '#3e2731'].map(c => (
                          <button
                            key={c}
                            onClick={() => setShadowColor(c)}
                            className={`w-4 h-4 rounded-sm border ${
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
                          className="w-4 h-4 rounded cursor-pointer ml-1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Include Pixel Grid Option */}
            <div className="flex items-center justify-between p-2.5 bg-slate-800/50 rounded-lg border border-slate-800">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-200">保留像素網格框線</span>
                <span className="text-[11px] text-slate-400">在匯出的 PNG 圖像上保留精細格線</span>
              </div>
              <input
                type="checkbox"
                checked={includeGrid}
                onChange={e => setIncludeGrid(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* File Name Input */}
            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-200">檔案名稱</label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  placeholder="pixel-art"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-xs outline-none focus:border-indigo-500"
                />
                <span className="text-slate-500 font-mono">.png</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={handleCopyClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-md transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">已複製到剪貼簿！</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>複製圖片</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-md shadow-md shadow-indigo-600/30 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>立即下載 PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
