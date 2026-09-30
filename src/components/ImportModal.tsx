import React, { useState, useRef } from 'react';
import { X, Upload, FolderOpen, AlertCircle } from 'lucide-react';
import { Grid } from '../types/pixel';
import { importImageFileToGrid, renderGridToCanvas } from '../utils/pixelMath';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWidth: number;
  currentHeight: number;
  onImportGrid: (newGrid: Grid, width: number, height: number) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  currentWidth,
  currentHeight,
  onImportGrid,
}) => {
  const [selectedWidth, setSelectedWidth] = useState<number>(currentWidth);
  const [selectedHeight, setSelectedHeight] = useState<number>(currentHeight);
  const [importedGrid, setImportedGrid] = useState<Grid | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setError(null);
    setIsProcessing(true);
    setFileName(file.name);

    try {
      const grid = await importImageFileToGrid(file, selectedWidth, selectedHeight);
      setImportedGrid(grid);

      // Render to preview canvas
      setTimeout(() => {
        if (previewCanvasRef.current) {
          const canvas = renderGridToCanvas(grid, 8, { backgroundMode: 'transparent' });
          const preview = previewCanvasRef.current;
          preview.width = canvas.width;
          preview.height = canvas.height;
          const ctx = preview.getContext('2d');
          if (ctx) {
            ctx.imageSmoothingEnabled = false;
            ctx.clearRect(0, 0, preview.width, preview.height);
            ctx.drawImage(canvas, 0, 0);
          }
        }
      }, 50);
    } catch (err) {
      setError('圖片讀取失敗，請確認檔案格式是否為有效圖片（PNG、JPG、WEBP）');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (importedGrid) {
      onImportGrid(importedGrid, selectedWidth, selectedHeight);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-sky-500/20 text-sky-400">
              <Upload className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-white">匯入現有圖片為像素</h2>
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
          {/* Target Resolution */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-200">轉換目標像素規格</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[16, 24, 32, 48].map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedWidth(size);
                    setSelectedHeight(size);
                  }}
                  className={`py-1.5 px-2 rounded font-mono text-center border transition-colors ${
                    selectedWidth === size
                      ? 'bg-sky-600 border-sky-500 text-white font-semibold'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  {size}×{size}
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-sky-500/60 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/50 hover:bg-slate-900/60"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
            />
            {importedGrid ? (
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 pixel-bg-checkerboard rounded-lg border border-slate-700 flex items-center justify-center p-1 mb-2">
                  <canvas ref={previewCanvasRef} className="max-w-full max-h-full pixelated" />
                </div>
                <span className="font-mono text-[11px] text-sky-400 font-medium">{fileName}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">點擊可更換其他檔案</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sky-400 mb-2">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <span className="font-semibold text-slate-200">點選上傳或拖曳圖片至此</span>
                <span className="text-slate-500 mt-1">支援 PNG、JPG、WEBP</span>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-1.5 p-2 rounded bg-rose-950/50 border border-rose-800/60 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleApply}
            disabled={!importedGrid || isProcessing}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 rounded-md shadow-md transition-all"
          >
            <span>匯入畫布</span>
          </button>
        </div>
      </div>
    </div>
  );
};
