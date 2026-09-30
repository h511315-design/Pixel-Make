import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tool,
  BrushSize,
  Grid,
  SymmetryConfig,
  TemplateArt,
  Point,
  SavedProject,
} from './types/pixel';
import {
  createEmptyGrid,
  cloneGrid,
  flipHorizontal,
  flipVertical,
  rotate90Clockwise,
  shiftGrid,
  replaceColor,
  extractUsedColors,
  resizeGrid,
} from './utils/pixelMath';
import {
  loadSavedProjects,
  getActiveProjectId,
  setActiveProjectId,
  upsertProject,
  removeProject,
  duplicateProject,
  renameProject,
  saveProjectsToStorage,
} from './utils/projectStorage';
import { TEMPLATES } from './constants/templates';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { ColorPanel } from './components/ColorPanel';
import { PixelCanvas } from './components/PixelCanvas';
import { CanvasControls } from './components/CanvasControls';
import { ExportModal } from './components/ExportModal';
import { TemplatesModal } from './components/TemplatesModal';
import { ImportModal } from './components/ImportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ButtonFxModal } from './components/ButtonFxModal';
import { ResizeCanvasModal } from './components/ResizeCanvasModal';
import { SaveProjectModal } from './components/SaveProjectModal';
import { SavedProjectsModal } from './components/SavedProjectsModal';
import { Check } from 'lucide-react';

const MAX_HISTORY = 30;
const STORAGE_KEY_PREFIX = 'pixelcraft_saved_';

export default function App() {
  // Dimensions
  const [width, setWidth] = useState<number>(16);
  const [height, setHeight] = useState<number>(16);

  // Saved Projects List & Active Project State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>(() => loadSavedProjects());
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => getActiveProjectId());
  const [currentProjectTitle, setCurrentProjectTitle] = useState<string>(() => {
    const activeId = getActiveProjectId();
    if (activeId) {
      const all = loadSavedProjects();
      const found = all.find(p => p.id === activeId);
      if (found) return found.title;
    }
    return '像素愛心';
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Initialize with the active saved project or draft or Heart template
  const [grid, setGrid] = useState<Grid>(() => {
    try {
      const activeId = getActiveProjectId();
      if (activeId) {
        const all = loadSavedProjects();
        const found = all.find(p => p.id === activeId);
        if (found && Array.isArray(found.grid) && found.grid.length > 0) {
          return cloneGrid(found.grid);
        }
      }
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}grid`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore storage error
    }
    // Default starter: Heart template
    return cloneGrid(TEMPLATES[0].data);
  });

  // History for Undo & Redo
  const [history, setHistory] = useState<Grid[]>([]);
  const [future, setFuture] = useState<Grid[]>([]);

  // Tool & Color state
  const [currentTool, setCurrentTool] = useState<Tool>('pencil');
  const [primaryColor, setPrimaryColor] = useState<string>('#e43b44');
  const [secondaryColor, setSecondaryColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<BrushSize>(1);
  const [symmetry, setSymmetry] = useState<SymmetryConfig>({
    horizontal: false,
    vertical: false,
  });

  // Canvas visual settings
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [checkerboardDark, setCheckerboardDark] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.8);
  const [hoverCoords, setHoverCoords] = useState<Point | null>(null);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isButtonFxOpen, setIsButtonFxOpen] = useState<boolean>(false);
  const [isResizeOpen, setIsResizeOpen] = useState<boolean>(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState<boolean>(false);

  // Toast Notification
  const [toast, setToast] = useState<{ title: string; subtitle?: string } | null>(null);

  const showToast = useCallback((title: string, subtitle?: string) => {
    setToast({ title, subtitle });
    setTimeout(() => {
      setToast(prev => (prev?.title === title ? null : prev));
    }, 2800);
  }, []);

  // Synchronize dimensions when grid changes externally
  useEffect(() => {
    if (grid.length > 0 && grid[0].length > 0) {
      setHeight(grid.length);
      setWidth(grid[0].length);
    }
  }, [grid]);

  // Auto-save working draft to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}grid`, JSON.stringify(grid));
    } catch {
      // Ignore quota errors
    }
  }, [grid]);

  // Extract all unique colors currently used in the canvas
  const usedColors = useMemo(() => extractUsedColors(grid), [grid]);

  // Commit grid changes (adds previous state to history)
  const handleCommitGrid = useCallback(
    (newGrid: Grid) => {
      setHistory(prev => {
        const next = [...prev, cloneGrid(grid)];
        return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
      });
      setFuture([]);
      setGrid(newGrid);
      setHasUnsavedChanges(true);
    },
    [grid]
  );

  // Quick save current project (Ctrl+S or Save button)
  const handleQuickSave = useCallback(() => {
    const { savedProject, updatedList } = upsertProject(
      {
        id: currentProjectId || undefined,
        title: currentProjectTitle || '未命名作品',
        width,
        height,
        grid,
      },
      savedProjects
    );
    setSavedProjects(updatedList);
    setCurrentProjectId(savedProject.id);
    setCurrentProjectTitle(savedProject.title);
    setHasUnsavedChanges(false);
    showToast('作品已儲存！', `「${savedProject.title}」最新進度已更新`);
  }, [currentProjectId, currentProjectTitle, width, height, grid, savedProjects, showToast]);

  // Save Modal confirm
  const handleModalSave = useCallback(
    (title: string, saveAsNew: boolean) => {
      const { savedProject, updatedList } = upsertProject(
        {
          id: saveAsNew ? undefined : currentProjectId || undefined,
          title,
          width,
          height,
          grid,
        },
        savedProjects
      );
      setSavedProjects(updatedList);
      setCurrentProjectId(savedProject.id);
      setCurrentProjectTitle(savedProject.title);
      setHasUnsavedChanges(false);
      setIsSaveModalOpen(false);
      showToast('作品儲存成功！', `「${savedProject.title}」已加入作品庫`);
    },
    [currentProjectId, width, height, grid, savedProjects, showToast]
  );

  // Load project from gallery
  const handleLoadProject = useCallback(
    (project: SavedProject) => {
      setWidth(project.width);
      setHeight(project.height);
      setGrid(cloneGrid(project.grid));
      setCurrentProjectId(project.id);
      setCurrentProjectTitle(project.title);
      setActiveProjectId(project.id);
      setHistory([]);
      setFuture([]);
      setHasUnsavedChanges(false);
      showToast('作品載入成功！', `已開啟「${project.title}」`);
    },
    [showToast]
  );

  // Create new blank canvas
  const handleCreateNewBlank = useCallback(
    (newW: number, newH: number) => {
      const emptyGrid = createEmptyGrid(newW, newH);
      setWidth(newW);
      setHeight(newH);
      setGrid(emptyGrid);
      setCurrentProjectId(null);
      setCurrentProjectTitle('未命名新畫布');
      setActiveProjectId(null);
      setHistory([]);
      setFuture([]);
      setHasUnsavedChanges(false);
      showToast('已建立新畫布', `${newW} × ${newH} 像素空白畫布`);
    },
    [showToast]
  );

  // Duplicate a project
  const handleDuplicateProject = useCallback(
    (id: string) => {
      const result = duplicateProject(id, savedProjects);
      if (result) {
        setSavedProjects(result.updatedList);
        showToast('已複製作品', `「${result.newProject.title}」已加入作品集`);
      }
    },
    [savedProjects, showToast]
  );

  // Rename project in gallery
  const handleRenameProject = useCallback(
    (id: string, newTitle: string) => {
      const updated = renameProject(id, newTitle, savedProjects);
      setSavedProjects(updated);
      if (id === currentProjectId) {
        setCurrentProjectTitle(newTitle);
      }
      showToast('作品已重命名', `新名稱：「${newTitle}」`);
    },
    [currentProjectId, savedProjects, showToast]
  );

  // Delete project
  const handleDeleteProject = useCallback(
    (id: string) => {
      const updated = removeProject(id, savedProjects);
      setSavedProjects(updated);
      if (id === currentProjectId) {
        setCurrentProjectId(null);
        setActiveProjectId(null);
      }
      showToast('作品已刪除');
    },
    [currentProjectId, savedProjects, showToast]
  );

  // Import projects from JSON/.pixelcraft
  const handleImportProjects = useCallback(
    (imported: SavedProject | SavedProject[]) => {
      if (Array.isArray(imported)) {
        const merged = [...imported, ...savedProjects];
        saveProjectsToStorage(merged);
        setSavedProjects(merged);
        showToast('已匯入備份！', `成功匯入 ${imported.length} 件作品`);
      } else {
        const updated = [imported, ...savedProjects];
        saveProjectsToStorage(updated);
        setSavedProjects(updated);
        handleLoadProject(imported);
        showToast('專案檔已匯入！', `已開啟「${imported.title}」`);
      }
    },
    [savedProjects, handleLoadProject, showToast]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture(f => [cloneGrid(grid), ...f]);
    setHistory(h => h.slice(0, h.length - 1));
    setGrid(cloneGrid(prev));
    setHasUnsavedChanges(true);
  }, [history, grid]);

  // Redo
  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory(h => [...h, cloneGrid(grid)]);
    setFuture(f => f.slice(1));
    setGrid(cloneGrid(next));
    setHasUnsavedChanges(true);
  }, [future, grid]);

  // Swap primary and secondary colors
  const handleSwapColors = useCallback(() => {
    setPrimaryColor(secondaryColor);
    setSecondaryColor(primaryColor);
  }, [primaryColor, secondaryColor]);

  // Toggle symmetry mode
  const handleToggleSymmetry = (type: 'horizontal' | 'vertical') => {
    setSymmetry(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // Dimensions change (quick preset)
  const handleChangeDimensions = (newWidth: number, newHeight: number) => {
    if (newWidth === width && newHeight === height) return;
    const resized = resizeGrid(grid, newWidth, newHeight, 'top-left', false);
    handleCommitGrid(resized);
    setWidth(newWidth);
    setHeight(newHeight);

    // Adjust zoom smoothly for larger canvases
    if (newWidth >= 48) setZoom(0.8);
    else if (newWidth >= 32) setZoom(1.2);
    else if (newWidth >= 24) setZoom(1.5);
    else setZoom(1.8);
  };

  // Custom Dimensions change from modal (with preserve/scale and anchor choices)
  const handleApplyCustomResize = (
    newWidth: number,
    newHeight: number,
    mode: 'preserve' | 'scale',
    anchor: 'top-left' | 'center'
  ) => {
    if (newWidth === width && newHeight === height) return;
    const resized = resizeGrid(grid, newWidth, newHeight, anchor, mode === 'scale');
    handleCommitGrid(resized);
    setWidth(newWidth);
    setHeight(newHeight);

    // Adjust zoom smoothly for larger canvases
    if (newWidth >= 64 || newHeight >= 64) setZoom(0.6);
    else if (newWidth >= 48 || newHeight >= 48) setZoom(0.8);
    else if (newWidth >= 32 || newHeight >= 32) setZoom(1.2);
    else if (newWidth >= 24 || newHeight >= 24) setZoom(1.5);
    else setZoom(1.8);
  };

  // Transform actions
  const handleFlipHorizontal = () => handleCommitGrid(flipHorizontal(grid));
  const handleFlipVertical = () => handleCommitGrid(flipVertical(grid));
  const handleRotate90 = () => handleCommitGrid(rotate90Clockwise(grid));
  const handleShift = (dx: number, dy: number) => handleCommitGrid(shiftGrid(grid, dx, dy));

  // Replace color across canvas
  const handleReplaceColorCanvas = (targetColor: string, replaceWith: string) => {
    handleCommitGrid(replaceColor(grid, targetColor, replaceWith));
  };

  // Clear Canvas
  const handleClearCanvas = () => {
    handleCommitGrid(createEmptyGrid(width, height));
    setConfirmClearOpen(false);
  };

  // Load a template
  const handleSelectTemplate = (template: TemplateArt) => {
    setWidth(template.width);
    setHeight(template.height);
    handleCommitGrid(cloneGrid(template.data));
    setCurrentProjectTitle(template.name);
    setCurrentProjectId(null);
    showToast('已載入範本', `「${template.name}」已放置於畫布`);
  };

  // Import Image
  const handleImportGrid = (newGrid: Grid, newW: number, newH: number) => {
    setWidth(newW);
    setHeight(newH);
    handleCommitGrid(newGrid);
    setCurrentProjectTitle('匯入圖片作品');
    setCurrentProjectId(null);
    showToast('圖片匯入成功', `尺寸：${newW} × ${newH}`);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && key === 'S') {
        e.preventDefault();
        handleQuickSave();
        return;
      }

      if (isCtrlOrCmd && key === 'Z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      if (isCtrlOrCmd && key === 'Y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      switch (key) {
        case 'P':
          setCurrentTool('pencil');
          break;
        case 'E':
          setCurrentTool('eraser');
          break;
        case 'M':
          setCurrentTool('select');
          break;
        case 'B':
          setCurrentTool('bucket');
          break;
        case 'I':
          setCurrentTool('eyedropper');
          break;
        case 'L':
          setCurrentTool('line');
          break;
        case 'U':
          setCurrentTool(e.shiftKey ? 'rect-fill' : 'rect');
          break;
        case 'R':
          setCurrentTool(e.shiftKey ? 'round-rect-fill' : 'round-rect');
          break;
        case 'C':
          setCurrentTool(e.shiftKey ? 'circle-fill' : 'circle');
          break;
        case 'X':
          handleSwapColors();
          break;
        case 'G':
          setShowGrid(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleSwapColors, handleQuickSave]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Top Header */}
      <Header
        width={width}
        height={height}
        projectTitle={currentProjectTitle}
        onChangeProjectTitle={title => {
          setCurrentProjectTitle(title);
          setHasUnsavedChanges(true);
        }}
        hasUnsavedChanges={hasUnsavedChanges}
        savedProjectsCount={savedProjects.length}
        onQuickSave={handleQuickSave}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenProjectsModal={() => setIsProjectsModalOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenButtonFx={() => setIsButtonFxOpen(true)}
        onOpenResize={() => setIsResizeOpen(true)}
        onClearCanvas={() => setConfirmClearOpen(true)}
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {/* Main Workspace: Toolbar (Left) | Canvas (Center) | ColorPanel (Right) */}
      <div className="flex-1 flex overflow-hidden relative">
        <Toolbar
          currentTool={currentTool}
          onSelectTool={setCurrentTool}
          brushSize={brushSize}
          onChangeBrushSize={setBrushSize}
          symmetry={symmetry}
          onToggleSymmetry={handleToggleSymmetry}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(prev => !prev)}
          checkerboardDark={checkerboardDark}
          onToggleCheckerboard={() => setCheckerboardDark(prev => !prev)}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-slate-950">
          <PixelCanvas
            grid={grid}
            width={width}
            height={height}
            currentTool={currentTool}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            brushSize={brushSize}
            symmetry={symmetry}
            showGrid={showGrid}
            checkerboardDark={checkerboardDark}
            zoom={zoom}
            onZoomChange={setZoom}
            onCommitGrid={handleCommitGrid}
            onPickColor={setPrimaryColor}
            onHoverCoordsChange={setHoverCoords}
          />

          {/* Bottom Bar: Canvas Dimensions, Transforms & Zoom */}
          <CanvasControls
            width={width}
            height={height}
            onChangeDimensions={handleChangeDimensions}
            onOpenResizeModal={() => setIsResizeOpen(true)}
            zoom={zoom}
            onZoomIn={() => setZoom(z => Math.min(24, Number((z + 0.3).toFixed(2))))}
            onZoomOut={() => setZoom(z => Math.max(0.3, Number((z - 0.3).toFixed(2))))}
            onResetZoom={() => {
              if (width >= 48) setZoom(0.8);
              else if (width >= 32) setZoom(1.2);
              else if (width >= 24) setZoom(1.5);
              else setZoom(1.8);
            }}
            onFlipHorizontal={handleFlipHorizontal}
            onFlipVertical={handleFlipVertical}
            onRotate90={handleRotate90}
            onShift={handleShift}
            onClear={() => setConfirmClearOpen(true)}
            hoverCoords={hoverCoords}
          />
        </main>

        <ColorPanel
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          onChangePrimaryColor={setPrimaryColor}
          onChangeSecondaryColor={setSecondaryColor}
          onSwapColors={handleSwapColors}
          usedColors={usedColors}
          onReplaceColorCanvas={handleReplaceColorCanvas}
        />
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 bg-slate-900/95 border border-emerald-500/40 text-emerald-300 text-xs font-medium rounded-full shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.title}</span>
          {toast.subtitle && (
            <span className="text-slate-400 border-l border-slate-700 pl-2">
              {toast.subtitle}
            </span>
          )}
        </div>
      )}

      {/* Modals */}
      <SaveProjectModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        grid={grid}
        width={width}
        height={height}
        currentProjectId={currentProjectId}
        currentTitle={currentProjectTitle}
        onSave={handleModalSave}
      />

      <SavedProjectsModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        projects={savedProjects}
        currentProjectId={currentProjectId}
        currentGrid={grid}
        currentWidth={width}
        currentHeight={height}
        onSelectProject={handleLoadProject}
        onSaveCurrentAsNew={() => {
          setIsProjectsModalOpen(false);
          setIsSaveModalOpen(true);
        }}
        onCreateNewBlank={handleCreateNewBlank}
        onDuplicateProject={handleDuplicateProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
        onImportProjects={handleImportProjects}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        grid={grid}
        defaultName={currentProjectTitle || `pixel-art-${width}x${height}`}
        canvasZoom={zoom}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        currentWidth={width}
        currentHeight={height}
        onImportGrid={handleImportGrid}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ButtonFxModal
        isOpen={isButtonFxOpen}
        onClose={() => setIsButtonFxOpen(false)}
        grid={grid}
        onApplyGrid={handleCommitGrid}
      />

      <ResizeCanvasModal
        isOpen={isResizeOpen}
        onClose={() => setIsResizeOpen(false)}
        currentWidth={width}
        currentHeight={height}
        onApplyResize={handleApplyCustomResize}
      />

      {/* Clear Canvas Confirmation Dialog */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-5 max-w-sm w-full text-center">
            <h3 className="text-sm font-semibold text-white mb-2">確定要清空畫布嗎？</h3>
            <p className="text-xs text-slate-400 mb-5">
              此操作會清除當前所有的像素筆跡，你可以使用 Ctrl+Z 復原。
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-md transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearCanvas}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md shadow transition-colors"
              >
                確認清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

