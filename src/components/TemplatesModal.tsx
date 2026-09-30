import React, { useRef, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { TEMPLATES } from '../constants/templates';
import { TemplateArt, Grid } from '../types/pixel';
import { renderGridToCanvas } from '../utils/pixelMath';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateArt) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-500/20 text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-base font-semibold text-white">精選像素範本</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-5 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TEMPLATES.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={() => {
                onSelectTemplate(template);
                onClose();
              }}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

const TemplateCard: React.FC<{
  template: TemplateArt;
  onSelect: () => void;
}> = ({ template, onSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = renderGridToCanvas(template.data, 8, {
      backgroundMode: 'transparent',
    });
    const target = canvasRef.current;
    target.width = canvas.width;
    target.height = canvas.height;
    const ctx = target.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, target.width, target.height);
      ctx.drawImage(canvas, 0, 0);
    }
  }, [template]);

  return (
    <div
      onClick={onSelect}
      className="group flex flex-col items-center bg-slate-950/70 border border-slate-800 hover:border-indigo-500/80 rounded-lg p-3 cursor-pointer transition-all hover:bg-slate-850 hover:shadow-lg hover:shadow-indigo-500/10 text-center"
    >
      <div className="w-24 h-24 rounded flex items-center justify-center pixel-bg-checkerboard p-1 mb-2 border border-slate-800/80 overflow-hidden">
        <canvas ref={canvasRef} className="max-w-full max-h-full pixelated group-hover:scale-105 transition-transform" />
      </div>
      <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">
        {template.name}
      </span>
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
        <span>{template.category}</span>
        <span>·</span>
        <span className="font-mono">{template.width}×{template.height}</span>
      </div>
    </div>
  );
};
