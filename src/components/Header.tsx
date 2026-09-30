import React from 'react';
import {
  Download,
  Sparkles,
  FolderOpen,
  RotateCcw,
  Keyboard,
  Box,
  Save,
  FolderKanban,
  FilePlus,
} from 'lucide-react';

interface HeaderProps {
  width: number;
  height: number;
  projectTitle: string;
  onChangeProjectTitle: (newTitle: string) => void;
  hasUnsavedChanges: boolean;
  savedProjectsCount: number;
  onQuickSave: () => void;
  onOpenSaveModal: () => void;
  onOpenProjectsModal: () => void;
  onOpenExport: () => void;
  onOpenTemplates: () => void;
  onOpenImport: () => void;
  onOpenShortcuts: () => void;
  onOpenButtonFx: () => void;
  onOpenResize?: () => void;
  onClearCanvas: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  width,
  height,
  projectTitle,
  onChangeProjectTitle,
  hasUnsavedChanges,
  savedProjectsCount,
  onQuickSave,
  onOpenSaveModal,
  onOpenProjectsModal,
  onOpenExport,
  onOpenTemplates,
  onOpenImport,
  onOpenShortcuts,
  onOpenButtonFx,
  onOpenResize,
  onClearCanvas,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 px-3 sm:px-5 flex items-center justify-between select-none shrink-0 z-20 gap-2">
      {/* Zone 1: Single text element Brand Zone & Canvas Title */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <a href="/" className="text-sm sm:text-base font-semibold tracking-tight text-white flex items-center gap-2">
          <span className="w-5 h-5 bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 rounded-sm inline-block shadow-sm"></span>
          <span className="hidden sm:inline">PixelCraft 像素畫工坊</span>
          <span className="sm:hidden">PixelCraft</span>
        </a>

        <button
          onClick={onOpenResize}
          title="點擊自訂畫布尺寸"
          className="flex items-center gap-1 text-xs text-slate-400 border-l border-slate-800 pl-2 sm:pl-3 hover:text-white group transition-colors cursor-pointer"
        >
          <span className="font-mono text-slate-300 font-medium group-hover:text-indigo-400 underline decoration-dotted underline-offset-4">{width}×{height}</span>
          <span className="text-slate-600 group-hover:text-slate-400 hidden md:inline">px (自訂)</span>
        </button>

        {/* Project Title inline editor */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 border border-slate-800 focus-within:border-emerald-500/80 transition-colors max-w-[170px]">
          <input
            type="text"
            value={projectTitle}
            onChange={e => onChangeProjectTitle(e.target.value)}
            title="點擊修改作品名稱"
            placeholder="作品名稱..."
            className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none w-full truncate"
          />
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              hasUnsavedChanges ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
            }`}
            title={hasUnsavedChanges ? '有未儲存的變更' : '最新進度已儲存'}
          />
        </div>
      </div>

      {/* Zone 2: Navigation / Functional Action links */}
      <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="復原 (Ctrl+Z)"
          aria-label="復原"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/80 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="重做 (Ctrl+Y)"
          aria-label="重做"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/80 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
        >
          <RotateCcw className="w-4 h-4 -scale-x-100" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block"></div>

        {/* Primary Save Action */}
        <div className="flex items-center">
          <button
            onClick={onQuickSave}
            title="儲存作品 (Ctrl+S)"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-all ${
              hasUnsavedChanges
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/50 shadow-sm shadow-emerald-950 animate-pulse'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
            }`}
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">儲存</span>
            <span className="sm:hidden">存</span>
          </button>
        </div>

        {/* My Projects Gallery button */}
        <button
          onClick={onOpenProjectsModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-md transition-colors"
          title="查看所有儲存的作品"
        >
          <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">我的作品</span>
          <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
            {savedProjectsCount}
          </span>
        </button>

        <button
          onClick={onOpenButtonFx}
          className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-md transition-colors shadow-sm"
          title="遊戲按鈕圓角與陰影特效"
        >
          <Box className="w-3.5 h-3.5 text-amber-400" />
          <span>按鈕圓角/陰影</span>
        </button>

        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-850 rounded transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">範本</span>
        </button>

        <button
          onClick={onOpenImport}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-850 rounded transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">匯入圖片</span>
        </button>

        <button
          onClick={onOpenShortcuts}
          title="快捷鍵說明"
          aria-label="快捷鍵說明"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      </nav>

      {/* Zone 3: Primary Action - Export */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onClearCanvas}
          className="hidden 2xl:inline-flex px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
        >
          清空畫布
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-md shadow-sm transition-all whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span>匯出 PNG</span>
        </button>
      </div>
    </header>
  );
};

