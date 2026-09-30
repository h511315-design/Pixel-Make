import { TemplateArt } from '../types/pixel';

// Helper to create an empty 16x16 or 24x24 grid
function createEmptyGrid(w: number, h: number): string[][] {
  return Array.from({ length: h }, () => Array(w).fill(''));
}

// 1. 16x16 8-bit Heart
const heartGrid = createEmptyGrid(16, 16);
const heartMap = [
  '................',
  '................',
  '..####....####..',
  '.#RRRR#..#RRRR#.',
  '#RRWWRR##RRRRRR#',
  '#RWWWWRRRRRRRRR#',
  '#RRWWRRRRRRRRRR#',
  '#RRRRRRRRRRRRRR#',
  '.#RRRRRRRRRRRR#.',
  '..#RRRRRRRRRR#..',
  '...#RRRRRRRR#...',
  '....#RRRRRR#....',
  '.....#RRRR#.....',
  '......#RR#......',
  '.......##.......',
  '................',
];
const heartPalette: Record<string, string> = {
  '#': '#000000',
  'R': '#e43b44',
  'W': '#ffffff',
  '.': '',
};
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    heartGrid[y][x] = heartPalette[heartMap[y][x]] || '';
  }
}

// 2. 16x16 Retro Mushroom
const mushroomGrid = createEmptyGrid(16, 16);
const mushroomMap = [
  '.....######.....',
  '...##RRRRRR##...',
  '..#RRWWWRRRRR#..',
  '.#RRWWWWWRRRRR#.',
  '.#RRWWWWWRRRRR#.',
  '#RRRRWWWRRRRRRR#',
  '#RRRRRRRRRRWWWR#',
  '#RRRRRRRRRWWWWWR',
  '#RRRRRRRRRWWWWWR',
  '.#RRRRRRRRRWWWR.',
  '..###SSSSSS###..',
  '..#SSBSSSBSS#...',
  '..#SSBSSSBSS#...',
  '..#SSSSSSSSS#...',
  '...#########....',
  '................',
];
const mushroomPalette: Record<string, string> = {
  '#': '#1a1c2c',
  'R': '#ff004d',
  'W': '#ffffff',
  'S': '#ffccaa',
  'B': '#1a1c2c',
  '.': '',
};
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    mushroomGrid[y][x] = mushroomPalette[mushroomMap[y][x]] || '';
  }
}

// 3. 16x16 Pixel Sword
const swordGrid = createEmptyGrid(16, 16);
const swordMap = [
  '..............SS',
  '.............SWW',
  '............SWW.',
  '...........SWW..',
  '..........SWW...',
  '.........SWW....',
  '..G.....SWW.....',
  '..GG...SWW......',
  '...GGGSSW.......',
  '....GGGG........',
  '...G..GBB.......',
  '..G....GBB......',
  '.G......GBB.....',
  '.........GGB....',
  '..........GG....',
  '................',
];
const swordPalette: Record<string, string> = {
  'S': '#566c86',
  'W': '#c0cbdc',
  'G': '#fee761',
  'B': '#733e39',
  '.': '',
};
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    swordGrid[y][x] = swordPalette[swordMap[y][x]] || '';
  }
}

// 4. 16x16 Space Invader
const invaderGrid = createEmptyGrid(16, 16);
const invaderMap = [
  '................',
  '................',
  '....G......G....',
  '.....G....G.....',
  '....GGGGGGGG....',
  '...GG.GGGG.GG...',
  '..GGGGGGGGGGGG..',
  '..G.GGGGGGGG.G..',
  '..G.G......G.G..',
  '....GG....GG....',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
];
const invaderPalette: Record<string, string> = {
  'G': '#00e436',
  '.': '',
};
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    invaderGrid[y][x] = invaderPalette[invaderMap[y][x]] || '';
  }
}

// 5. 16x16 Magic Potion
const potionGrid = createEmptyGrid(16, 16);
const potionMap = [
  '......####......',
  '......#WW#......',
  '.....#TTTT#.....',
  '....#TTTTTT#....',
  '...#TTTTTTTT#...',
  '...#TTTTTTTT#...',
  '..#TTTTTTTTTT#..',
  '..#TTTCCCCPTT#..',
  '..#TTCCCCCCPT#..',
  '..#TCCCCCCCCPT#.',
  '..#TCCCCCCCCPT#.',
  '..#TCCCCCCCCPT#.',
  '..#TTCCCCCCPTT#.',
  '...#TTTCCCCPT#..',
  '....########....',
  '................',
];
const potionPalette: Record<string, string> = {
  '#': '#1d2b53',
  'W': '#ab5236',
  'T': '#83769c',
  'C': '#29adff',
  'P': '#7e2553',
  '.': '',
};
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    potionGrid[y][x] = potionPalette[potionMap[y][x]] || '';
  }
}

// 6. 16x16 Gold Coin
const coinGrid = createEmptyGrid(16, 16);
const coinMap = [
  '.....######.....',
  '..###YYYYYY###..',
  '.#YYYYGGGGYYYY#.',
  '#YYYGG....GGYYY#',
  '#YYGG......GGYY#',
  '#YYG..####..GYY#',
  '#YYG..#YY#..GYY#',
  '#YYG..####..GYY#',
  '#YYG..#YY#..GYY#',
  '#YYG..####..GYY#',
  '#YYGG......GGYY#',
  '#YYYGG....GGYYY#',
  '.#YYYYGGGGYYYY#.',
  '..###YYYYYY###..',
  '.....######.....',
  '................',
];
const coinPalette: Record<string, string> = {
  '#': '#b86f50',
  'Y': '#fee761',
  'G': '#feae34',
  '.': '',
};
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 16; x++) {
    coinGrid[y][x] = coinPalette[coinMap[y][x]] || '';
  }
}

// 7. 24x16 經典綠色遊戲圓角按鈕 (Green OK Button with rounded corners & shadow)
const greenButtonGrid = createEmptyGrid(24, 16);
const greenButtonMap = [
  '........................',
  '..####################..',
  '.#HHHHHHHHHHHHHHHHHHHH#.',
  '#HGGGGGGGGGGGGGGGGGGGG#B',
  '#HGG..GG.GG..GG..GGGGG#B',
  '#HGG.G.G.GG.G..GGGGGGG#B',
  '#HGG.G.G.GGG...GGGGGGG#B',
  '#HGG.G.G.GG.G..GGGGGGG#B',
  '#HGG..GG.GG..GG..GGGGG#B',
  '#HGGGGGGGGGGGGGGGGGGGG#B',
  '#HSSSSSSSSSSSSSSSSSSSS#B',
  '.#SSSSSSSSSSSSSSSSSSSS#B',
  '..####################BB',
  '...BBBBBBBBBBBBBBBBBBBBB',
  '...BBBBBBBBBBBBBBBBBBBBB',
  '........................',
];
const greenButtonPalette: Record<string, string> = {
  '#': '#0f380f',
  'H': '#a7f070', // Highlight
  'G': '#38b764', // Body
  'S': '#257179', // Bottom bevel
  'B': '#1a1c2c', // Block shadow
  '.': '',
};
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 24; x++) {
    greenButtonGrid[y][x] = greenButtonPalette[greenButtonMap[y][x]] || '';
  }
}

// 8. 24x16 金色 PLAY 遊戲圓角按鈕 (Gold PLAY Button)
const goldButtonGrid = createEmptyGrid(24, 16);
const goldButtonMap = [
  '........................',
  '..####################..',
  '.#HHHHHHHHHHHHHHHHHHHH#.',
  '#HYYYYYYYYYYYYYYYYYYYY#B',
  '#HYY...YY.YYY..YY.Y.YY#B',
  '#HYY.Y.Y.YY.Y..YY.Y.YY#B',
  '#HYY...Y.YY.YYYY...YYY#B',
  '#HYY.YYY.YY.Y..YY.YYYY#B',
  '#HYY.YYY...YY..YY.YYYY#B',
  '#HYYYYYYYYYYYYYYYYYYYY#B',
  '#HSSSSSSSSSSSSSSSSSSSS#B',
  '.#SSSSSSSSSSSSSSSSSSSS#B',
  '..####################BB',
  '...BBBBBBBBBBBBBBBBBBBBB',
  '...BBBBBBBBBBBBBBBBBBBBB',
  '........................',
];
const goldButtonPalette: Record<string, string> = {
  '#': '#733e39',
  'H': '#ffffff', // Highlight
  'Y': '#fee761', // Body
  'S': '#feae34', // Bottom bevel
  'B': '#262b44', // Block shadow
  '.': '',
};
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 24; x++) {
    goldButtonGrid[y][x] = goldButtonPalette[goldButtonMap[y][x]] || '';
  }
}

// 9. 24x16 紅色取消/戰鬥圓角按鈕 (Red Battle Button)
const redButtonGrid = createEmptyGrid(24, 16);
const redButtonMap = [
  '........................',
  '..####################..',
  '.#HHHHHHHHHHHHHHHHHHHH#.',
  '#HRRRRRRRRRRRRRRRRRRRR#B',
  '#HRR..RRR.RR.RRR.RRRRR#B',
  '#HRR.R.RR.RR.RRR.RRRRR#B',
  '#HRR..RRR.RR.RRR.RRRRR#B',
  '#HRR.R.RR.RR.RRR.RRRRR#B',
  '#HRR..RRR.RRR...RRRRRR#B',
  '#HRRRRRRRRRRRRRRRRRRRR#B',
  '#HSSSSSSSSSSSSSSSSSSSS#B',
  '.#SSSSSSSSSSSSSSSSSSSS#B',
  '..####################BB',
  '...BBBBBBBBBBBBBBBBBBBBB',
  '...BBBBBBBBBBBBBBBBBBBBB',
  '........................',
];
const redButtonPalette: Record<string, string> = {
  '#': '#3e2731',
  'H': '#ff77a8',
  'R': '#e43b44',
  'S': '#a22633',
  'B': '#181425',
  '.': '',
};
for (let y = 0; y < 16; y++) {
  for (let x = 0; x < 24; x++) {
    redButtonGrid[y][x] = redButtonPalette[redButtonMap[y][x]] || '';
  }
}

export const TEMPLATES: TemplateArt[] = [
  {
    id: 'green-btn',
    name: '綠色確認按鈕',
    category: '遊戲按鈕',
    width: 24,
    height: 16,
    data: greenButtonGrid,
  },
  {
    id: 'gold-btn',
    name: '金色 PLAY 按鈕',
    category: '遊戲按鈕',
    width: 24,
    height: 16,
    data: goldButtonGrid,
  },
  {
    id: 'red-btn',
    name: '紅色戰鬥按鈕',
    category: '遊戲按鈕',
    width: 24,
    height: 16,
    data: redButtonGrid,
  },
  {
    id: 'heart',
    name: '像素愛心',
    category: '圖標',
    width: 16,
    height: 16,
    data: heartGrid,
  },
  {
    id: 'mushroom',
    name: '復古香菇',
    category: '遊戲',
    width: 16,
    height: 16,
    data: mushroomGrid,
  },
  {
    id: 'sword',
    name: '冒險之劍',
    category: '武器',
    width: 16,
    height: 16,
    data: swordGrid,
  },
  {
    id: 'invader',
    name: '太空侵略者',
    category: '街機',
    width: 16,
    height: 16,
    data: invaderGrid,
  },
  {
    id: 'potion',
    name: '魔力藥水',
    category: '道具',
    width: 16,
    height: 16,
    data: potionGrid,
  },
  {
    id: 'coin',
    name: '閃耀金幣',
    category: '道具',
    width: 16,
    height: 16,
    data: coinGrid,
  },
];
