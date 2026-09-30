import React, { useState } from 'react';
import { ArrowLeftRight, Pipette, RefreshCw, Check } from 'lucide-react';
import { PALETTE_PRESETS } from '../constants/palettes';

interface ColorPanelProps {
  primaryColor: string;
  secondaryColor: string;
  onChangePrimaryColor: (color: string) => void;
  onChangeSecondaryColor: (color: string) => void;
  onSwapColors: () => void;
  usedColors: string[];
  onReplaceColorCanvas?: (targetColor: string, replaceWith: string) => void;
}

export const ColorPanel: React.FC<ColorPanelProps> = ({
  primaryColor,
  secondaryColor,
  onChangePrimaryColor,
  onChangeSecondaryColor,
  onSwapColors,
  usedColors,
  onReplaceColorCanvas,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('pico8');
  const [hexInput, setHexInput] = useState<string>(primaryColor);
  const [replaceMode, setReplaceMode] = useState<boolean>(false);
  const [colorToReplace, setColorToReplace] = useState<string | null>(null);

  const activePreset = PALETTE_PRESETS.find(p => p.id === selectedPresetId) || PALETTE_PRESETS[0];

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    setHexInput(val);
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      onChangePrimaryColor(val);
    }
  };

  const handleNativePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    onChangePrimaryColor(val);
  };

  const handleSelectColor = (color: string, isRightClick: boolean = false) => {
    if (replaceMode && onReplaceColorCanvas) {
      if (!colorToReplace) {
        setColorToReplace(color);
      } else {
        onReplaceColorCanvas(colorToReplace, color);
        setReplaceMode(false);
        setColorToReplace(null);
      }
      return;
    }

    if (isRightClick) {
      onChangeSecondaryColor(color);
    } else {
      onChangePrimaryColor(color);
      setHexInput(color);
    }
  };

  return (
    <div className="w-64 sm:w-72 bg-slate-925 border-l border-slate-800 flex flex-col p-4 select-none shrink-0 overflow-y-auto gap-4 text-slate-200">
      {/* Primary & Secondary Color Display */}
      <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center gap-3">
          {/* Dual Color Swatch Box */}
          <div className="relative w-12 h-12">
            {/* Secondary Color (underneath) */}
            <button
              onClick={() => onSwapColors()}
              title="次要顏色 (右鍵點選色票可設定，或按 X 交換)"
              aria-label="次要顏色"
              className="absolute bottom-0 right-0 w-8 h-8 rounded border-2 border-slate-700 shadow-md cursor-pointer transition-transform hover:scale-105"
              style={{ backgroundColor: secondaryColor }}
            />
            {/* Primary Color (on top) */}
            <label
              title="主要顏色 (左鍵點選色票，或點此自訂)"
              className="absolute top-0 left-0 w-8 h-8 rounded border-2 border-white shadow-lg cursor-pointer transition-transform hover:scale-105 z-10 overflow-hidden block"
              style={{ backgroundColor: primaryColor }}
            >
              <input
                type="color"
                value={primaryColor}
                onChange={handleNativePicker}
                className="opacity-0 w-full h-full cursor-pointer"
              />
            </label>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">主色 / 次色</span>
            <div className="flex items-center gap-1 font-mono text-xs text-slate-200 uppercase mt-0.5">
              <span>{primaryColor}</span>
            </div>
          </div>
        </div>

        {/* Swap Colors Button */}
        <button
          onClick={onSwapColors}
          title="交換主色與次色 (X)"
          aria-label="交換主色與次色"
          className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeftRight className="w-4 h-4" />
        </button>
      </div>

      {/* Hex and Native Color Picker Input */}
      <div className="flex items-center gap-2">
        <label className="relative flex items-center justify-center w-8 h-8 rounded border border-slate-700 cursor-pointer overflow-hidden shrink-0 bg-slate-900">
          <input
            type="color"
            value={primaryColor}
            onChange={handleNativePicker}
            className="w-10 h-10 -m-1 cursor-pointer"
          />
        </label>
        <div className="relative flex-1">
          <input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            placeholder="#000000"
            maxLength={7}
            className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded px-2.5 py-1.5 font-mono text-xs text-white uppercase outline-none"
          />
        </div>
      </div>

      {/* Palette Presets Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">復古調色盤</span>
          <select
            value={selectedPresetId}
            onChange={e => setSelectedPresetId(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-2 py-1 outline-none focus:border-indigo-500 cursor-pointer"
          >
            {PALETTE_PRESETS.map(preset => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swatch Grid */}
        <div className="grid grid-cols-8 gap-1.5 p-2 bg-slate-900/60 rounded-lg border border-slate-850">
          {activePreset.colors.map(color => {
            const isPrimary = primaryColor.toLowerCase() === color.toLowerCase();
            const isSecondary = secondaryColor.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                onClick={() => handleSelectColor(color, false)}
                onContextMenu={e => {
                  e.preventDefault();
                  handleSelectColor(color, true);
                }}
                title={`${color} (左鍵主色 / 右鍵次色)`}
                aria-label={`選擇顏色 ${color}`}
                className={`w-full aspect-square rounded-sm transition-transform hover:scale-110 relative flex items-center justify-center ${
                  isPrimary
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 z-10'
                    : isSecondary
                    ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900'
                    : 'border border-black/20'
                }`}
                style={{ backgroundColor: color }}
              >
                {isPrimary && <Check className="w-2.5 h-2.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Used Colors in Canvas */}
      {usedColors.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              畫布使用中的顏色 ({usedColors.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900/60 rounded-lg border border-slate-850 max-h-28 overflow-y-auto">
            {usedColors.map(color => {
              const isPrimary = primaryColor.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  onClick={() => handleSelectColor(color, false)}
                  onContextMenu={e => {
                    e.preventDefault();
                    handleSelectColor(color, true);
                  }}
                  title={`${color} (左鍵主色 / 右鍵次色)`}
                  aria-label={`選擇顏色 ${color}`}
                  className={`w-6 h-6 rounded-sm transition-transform hover:scale-110 relative flex items-center justify-center ${
                    isPrimary
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900 z-10'
                      : 'border border-black/30'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {isPrimary && (
                    <Check className="w-2.5 h-2.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color Replace Helper */}
      {onReplaceColorCanvas && usedColors.length > 0 && (
        <div className="mt-auto pt-2 border-t border-slate-800/80">
          {!replaceMode ? (
            <button
              onClick={() => {
                setReplaceMode(true);
                setColorToReplace(null);
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850 rounded border border-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>全域置換顏色</span>
            </button>
          ) : (
            <div className="bg-amber-950/40 border border-amber-600/40 rounded-lg p-2.5 text-xs flex flex-col gap-2">
              <div className="text-amber-300 font-medium">
                {!colorToReplace ? '步驟 1: 點選要被替換的原色' : '步驟 2: 點選要替換成的新色'}
              </div>
              {colorToReplace && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">原色:</span>
                  <div className="w-4 h-4 rounded border border-white/50" style={{ backgroundColor: colorToReplace }} />
                  <span className="font-mono text-[11px]">{colorToReplace}</span>
                </div>
              )}
              <button
                onClick={() => {
                  setReplaceMode(false);
                  setColorToReplace(null);
                }}
                className="text-xs text-slate-400 hover:text-white underline text-left mt-1"
              >
                取消置換
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
