import { PalettePreset } from '../types/pixel';

export const PALETTE_PRESETS: PalettePreset[] = [
  {
    id: 'pico8',
    name: 'PICO-8 經典 16 色',
    colors: [
      '#000000', '#1D2B53', '#7E2553', '#008751',
      '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
      '#FF004D', '#FFA300', '#FFEC27', '#00E436',
      '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA',
    ],
  },
  {
    id: 'sweetie16',
    name: 'Sweetie 16 復古柔和',
    colors: [
      '#1a1c2c', '#5d275d', '#b13e53', '#ef7d57',
      '#ffcd75', '#a7f070', '#38b764', '#257179',
      '#29366f', '#3b5dc9', '#41a6f6', '#73eff7',
      '#f4f4f4', '#94b0c2', '#566c86', '#333c57',
    ],
  },
  {
    id: 'gameboy',
    name: 'Game Boy 原版 4 階綠',
    colors: [
      '#0f380f', '#306230', '#8bac0f', '#9bbc0f',
    ],
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 賽博龐克',
    colors: [
      '#0d0221', '#0f084b', '#26408b', '#00ccbf',
      '#ff0055', '#ff509e', '#f3f3f3', '#ffe600',
      '#10002b', '#240046', '#3c096c', '#5a189a',
      '#7b2cbf', '#9d4edd', '#c77dff', '#e0aaff',
    ],
  },
  {
    id: 'nes',
    name: 'NES 紅白機精選',
    colors: [
      '#000000', '#2038ec', '#0058f8', '#3cbcfc',
      '#00a800', '#58d854', '#e45c10', '#fc9838',
      '#f83800', '#fc7460', '#d800cc', '#f878f8',
      '#fcfcfc', '#bcbcbc', '#747474', '#ac7c00',
    ],
  },
  {
    id: 'monochrome',
    name: '黑白與灰度 8 階',
    colors: [
      '#000000', '#262626', '#494949', '#6d6d6d',
      '#929292', '#b6b6b6', '#dbdbdb', '#ffffff',
    ],
  },
  {
    id: 'earthy',
    name: '奇幻大地冒險 RPG',
    colors: [
      '#181425', '#262b44', '#3a4466', '#5a6988',
      '#8b9bb4', '#c0cbdc', '#f4f4f4', '#7b5480',
      '#a67593', '#b86f50', '#733e39', '#3e2731',
      '#a22633', '#e43b44', '#f77622', '#feae34',
      '#fee761', '#63c74d', '#3e8948', '#265c42',
    ],
  },
];
