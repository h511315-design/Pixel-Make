import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: '繪圖工具',
      shortcuts: [
        { key: 'P', label: '鉛筆畫筆工具' },
        { key: 'E', label: '橡皮擦工具' },
        { key: 'M', label: '選取移動工具 (框選移動方塊)' },
        { key: 'B', label: '油漆桶填色' },
        { key: 'I', label: '滴管取色' },
        { key: 'L', label: '直線繪製' },
        { key: 'U / Shift+U', label: '直角矩形 / 實心矩形' },
        { key: 'R / Shift+R', label: '圓角矩形 / 實心圓角 (按鈕框)' },
        { key: 'C / Shift+C', label: '圓形框線 / 實心圓形' },
      ],
    },
    {
      title: '選取與微調',
      shortcuts: [
        { key: '滑鼠拖曳', label: '框選方塊 / 拖曳已選取的方塊移動' },
        { key: '↑ ↓ ← →', label: '微調已選取的方塊位置 (每格 1 像素)' },
        { key: 'Enter', label: '完成定位並固定方塊' },
        { key: 'Esc', label: '取消選取' },
        { key: 'Delete / Backspace', label: '刪除選取方塊內容' },
      ],
    },
    {
      title: '操作與視角',
      shortcuts: [
        { key: 'Ctrl + S', label: '快速儲存目前作品' },
        { key: 'X', label: '切換主要顏色與次要顏色' },
        { key: 'G', label: '開啟 / 關閉像素格線' },
        { key: 'Ctrl + Z', label: '復原 (Undo)' },
        { key: 'Ctrl + Y / Ctrl+Shift+Z', label: '重做 (Redo)' },
        { key: '左鍵拖曳', label: '以主色點畫像素' },
        { key: '右鍵拖曳', label: '以次色點畫 (或擦除)' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-indigo-500/20 text-indigo-400">
              <Keyboard className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-white">鍵盤快捷鍵一覽</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-5 text-xs">
          {shortcutGroups.map(group => (
            <div key={group.title} className="flex flex-col gap-2">
              <span className="font-semibold text-slate-300 text-[13px]">{group.title}</span>
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 flex flex-col gap-1.5">
                {group.shortcuts.map(sc => (
                  <div key={sc.key} className="flex items-center justify-between py-1">
                    <span className="text-slate-400">{sc.label}</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono text-[11px] shadow-sm">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
          >
            了解
          </button>
        </div>
      </div>
    </div>
  );
};
