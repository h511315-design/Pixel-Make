import React, { useState, useEffect } from 'react';
import { X, Save, PlusCircle, Check, Sparkles } from 'lucide-react';
import { Grid, SavedProject } from '../types/pixel';
import { generateProjectThumbnail } from '../utils/pixelMath';

interface SaveProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  grid: Grid;
  width: number;
  height: number;
  currentProjectId: string | null;
  currentTitle: string;
  onSave: (title: string, saveAsNew: boolean) => void;
}

export const SaveProjectModal: React.FC<SaveProjectModalProps> = ({
  isOpen,
  onClose,
  grid,
  width,
  height,
  currentProjectId,
  currentTitle,
  onSave,
}) => {
  const [title, setTitle] = useState(currentTitle || '我的像素畫');
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle || '我的像素畫');
      setSaveAsNew(false);
      const thumb = generateProjectThumbnail(grid, 120);
      setThumbnailUrl(thumb);
    }
  }, [isOpen, currentTitle, grid]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), currentProjectId ? saveAsNew : true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">儲存作品</h2>
              <p className="text-xs text-slate-400">將目前的畫布內容保存至「我的作品庫」</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">
          {/* Preview & Info */}
          <div className="flex items-center gap-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
            <div className="w-20 h-20 bg-slate-900 border border-slate-850 rounded-lg flex items-center justify-center overflow-hidden shrink-0 relative">
              {/* Checkerboard bg */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #334155 25%, transparent 25%), linear-gradient(-45deg, #334155 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #334155 75%), linear-gradient(-45deg, transparent 75%, #334155 75%)',
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                }}
              />
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="預覽"
                  className="max-w-full max-h-full object-contain relative z-10 [image-rendering:pixelated]"
                />
              ) : (
                <div className="text-[10px] text-slate-500 z-10">無像素</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-300">畫布規格</div>
              <div className="text-sm font-semibold text-white mt-0.5">
                {width} × {height} <span className="text-xs font-normal text-slate-400">像素</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>儲存於瀏覽器本地，隨時可載入</span>
              </div>
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              作品名稱 <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="例如：復古勇者角色、愛心勳章、魔法藥水..."
              autoFocus
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* If already has an existing saved ID, give option to update or save as new copy */}
          {currentProjectId && (
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <div className="text-xs font-medium text-slate-300 mb-1">儲存模式</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSaveAsNew(false)}
                  className={`p-2.5 text-left rounded-lg border text-xs font-medium transition-all ${
                    !saveAsNew
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold mb-0.5 flex items-center gap-1">
                    <Save className="w-3.5 h-3.5" />
                    覆寫目前作品
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    更新現有的「{currentTitle}」
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSaveAsNew(true)}
                  className={`p-2.5 text-left rounded-lg border text-xs font-medium transition-all ${
                    saveAsNew
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="font-semibold mb-0.5 flex items-center gap-1">
                    <PlusCircle className="w-3.5 h-3.5" />
                    另存為新作品
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    建立一份全新的獨立存檔
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Shortcut hint */}
          <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>小技巧：在畫布繪圖時，可隨時按快捷鍵 <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-200 rounded border border-slate-700 font-mono text-[10px]">Ctrl + S</kbd> 快速儲存！</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-40 rounded-lg shadow-md transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saveAsNew ? '另存為新作品' : '確定儲存'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
