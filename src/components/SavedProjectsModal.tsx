import React, { useState, useRef } from 'react';
import {
  X,
  FolderKanban,
  Plus,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Edit2,
  Check,
  Search,
  Calendar,
  Layers,
  ArrowRight,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { SavedProject, Grid } from '../types/pixel';
import {
  downloadProjectFile,
  downloadAllProjectsBackup,
  parseImportedProjectFile,
} from '../utils/projectStorage';

interface SavedProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: SavedProject[];
  currentProjectId: string | null;
  currentGrid: Grid;
  currentWidth: number;
  currentHeight: number;
  onSelectProject: (project: SavedProject) => void;
  onSaveCurrentAsNew: () => void;
  onCreateNewBlank: (width: number, height: number) => void;
  onDuplicateProject: (id: string) => void;
  onRenameProject: (id: string, newTitle: string) => void;
  onDeleteProject: (id: string) => void;
  onImportProjects: (imported: SavedProject | SavedProject[]) => void;
}

export const SavedProjectsModal: React.FC<SavedProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentProjectId,
  currentGrid,
  currentWidth,
  currentHeight,
  onSelectProject,
  onSaveCurrentAsNew,
  onCreateNewBlank,
  onDuplicateProject,
  onRenameProject,
  onDeleteProject,
  onImportProjects,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newCanvasOpen, setNewCanvasOpen] = useState(false);
  const [newWidth, setNewWidth] = useState(16);
  const [newHeight, setNewHeight] = useState(16);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return '剛剛';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分鐘前`;
    if (diff < 8640000) return `${Math.floor(diff / 3600000)} 小時前`;
    const d = new Date(timestamp);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`;
  };

  const handleStartRename = (project: SavedProject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditingTitle(project.title);
  };

  const handleSaveRename = (id: string) => {
    if (editingTitle.trim()) {
      onRenameProject(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const parsed = parseImportedProjectFile(content);
      if (parsed) {
        if (parsed.type === 'single') {
          onImportProjects(parsed.project);
        } else {
          onImportProjects(parsed.projects);
        }
      } else {
        alert('無法解析此專案檔案，請確認格式是否正確。');
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">我的作品集</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {projects.length} 件作品
                </span>
              </div>
              <p className="text-xs text-slate-400">管理、載入、另存與匯出您的所有像素藝術創作</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search & Action Buttons */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜尋作品名稱..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onSaveCurrentAsNew}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="將目前正在編輯的畫布保存為新作品"
            >
              <Save className="w-3.5 h-3.5" />
              <span>另存當前畫布</span>
            </button>

            <button
              onClick={() => setNewCanvasOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 rounded-lg text-xs font-medium transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>新建空白畫布</span>
            </button>

            {/* Hidden file input for import */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".pixelcraft,.json"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all"
              title="匯入 .pixelcraft 或 .json 專案檔"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">匯入檔案</span>
            </button>

            <button
              onClick={() => downloadAllProjectsBackup(projects)}
              disabled={projects.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-750 disabled:opacity-30 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-all"
              title="備份所有作品為單一 JSON 檔案"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">全部備份</span>
            </button>
          </div>
        </div>

        {/* New Canvas Quick Popover Dialog */}
        {newCanvasOpen && (
          <div className="p-3 bg-indigo-950/40 border-b border-indigo-500/30 flex items-center justify-between flex-wrap gap-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-300">建立新畫布尺寸：</span>
              <div className="flex items-center gap-1.5">
                {[16, 24, 32, 48].map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      setNewWidth(size);
                      setNewHeight(size);
                    }}
                    className={`px-2 py-1 text-xs rounded font-mono ${
                      newWidth === size && newHeight === size
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    {size}×{size}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 text-xs font-mono ml-2">
                <input
                  type="number"
                  min="4"
                  max="128"
                  value={newWidth}
                  onChange={e => setNewWidth(Number(e.target.value))}
                  className="w-12 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-white"
                />
                <span className="text-slate-500">×</span>
                <input
                  type="number"
                  min="4"
                  max="128"
                  value={newHeight}
                  onChange={e => setNewHeight(Number(e.target.value))}
                  className="w-12 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-center text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setNewCanvasOpen(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onCreateNewBlank(newWidth, newHeight);
                  setNewCanvasOpen(false);
                  onClose();
                }}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md shadow"
              >
                立即建立
              </button>
            </div>
          </div>
        )}

        {/* Projects Grid Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-850 flex items-center justify-center text-slate-600 mb-3 border border-slate-800">
                <FolderKanban className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-slate-300 mb-1">
                {searchQuery ? '沒有符合搜尋的作品' : '作品集還是空的'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                {searchQuery
                  ? '試試不同的關鍵字搜尋'
                  : '您繪製的像素藝術可以儲存在這裡，點擊下方按鈕將當前畫布存入作品庫！'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onSaveCurrentAsNew}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>儲存當前畫布為新作品</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProjects.map(project => {
                const isActive = project.id === currentProjectId;
                const isDeleting = deleteConfirmId === project.id;
                const isEditing = editingId === project.id;

                return (
                  <div
                    key={project.id}
                    className={`group relative bg-slate-950/80 border rounded-xl overflow-hidden flex flex-col transition-all hover:shadow-xl ${
                      isActive
                        ? 'border-indigo-500 ring-1 ring-indigo-500/50'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Card Top: Preview Thumbnail Box */}
                    <div
                      onClick={() => {
                        onSelectProject(project);
                        onClose();
                      }}
                      className="h-36 bg-slate-900 border-b border-slate-850 flex items-center justify-center relative cursor-pointer group-hover:bg-slate-850/60 transition-colors overflow-hidden"
                    >
                      {/* Crisp Checkerboard Background */}
                      <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundImage:
                            'linear-gradient(45deg, #475569 25%, transparent 25%), linear-gradient(-45deg, #475569 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #475569 75%), linear-gradient(-45deg, transparent 75%, #475569 75%)',
                          backgroundSize: '16px 16px',
                          backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        }}
                      />

                      {/* Pixel Art Thumbnail */}
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="max-w-[70%] max-h-[70%] object-contain relative z-10 transition-transform duration-200 group-hover:scale-105 [image-rendering:pixelated] drop-shadow-md"
                        />
                      ) : (
                        <div className="text-xs text-slate-500 z-10">空白畫布</div>
                      )}

                      {/* Status Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
                        {isActive && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            目前編輯中
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-950/80 text-slate-300 rounded border border-slate-700/60 backdrop-blur-sm">
                          {project.width}×{project.height}
                        </span>
                      </div>

                      {/* Hover Overlay with "開啟" button */}
                      <div className="absolute inset-0 bg-indigo-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-20 backdrop-blur-[2px]">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          <span>開啟編輯</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Card Content: Title & Details */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title (editable or static) */}
                        {isEditing ? (
                          <div className="flex items-center gap-1 mb-1">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveRename(project.id);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="flex-1 px-2 py-1 bg-slate-900 border border-indigo-500 rounded text-xs text-white outline-none"
                            />
                            <button
                              onClick={() => handleSaveRename(project.id)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <h3
                              onClick={() => {
                                onSelectProject(project);
                                onClose();
                              }}
                              className="text-xs font-semibold text-white truncate cursor-pointer hover:text-indigo-400 transition-colors"
                              title={project.title}
                            >
                              {project.title}
                            </h3>
                            <button
                              onClick={e => handleStartRename(project, e)}
                              className="p-1 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="重命名作品"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Updated timestamp */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>更新於 {formatTime(project.updatedAt)}</span>
                        </div>
                      </div>

                      {/* Card Footer: Action bar */}
                      <div className="mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-between">
                        {isDeleting ? (
                          <div className="flex items-center justify-between w-full gap-2 text-xs">
                            <span className="text-[11px] text-rose-400 font-medium">確定刪除？</span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-0.5 text-[10px] text-slate-400 hover:text-white bg-slate-800 rounded"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => {
                                  onDeleteProject(project.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-0.5 text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-500 rounded shadow"
                              >
                                刪除
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onDuplicateProject(project.id);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded transition-colors"
                                title="複製一份作品"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  downloadProjectFile(project);
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded transition-colors"
                                title="下載專案檔案 (.pixelcraft)"
                              >
                                <FileCode className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setDeleteConfirmId(project.id);
                              }}
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                              title="刪除此作品"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer Tip */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>所有作品皆自動安全保存在瀏覽器，離線亦可使用</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium rounded-lg transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
