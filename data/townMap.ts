// data/townMap.ts

export const TOWN_BUILDINGS = [
  {
    id: 'mine',
    name: 'Deep Mines',
    emoji: '⛰️', 
    desc: 'Dig for ancient character blocks!',
    // 🔥 修改为 2行 x 3列 (更宽)
    size: { rows: 4, cols: 6 }, 
    // 可能需要重新微调 offset，先设为 0 看看效果
    offset: { x:60, y: 160 } 
  },
  {
    id: 'lab',
    name: 'Fusion Lab',
    emoji: '⚗️',
    desc: 'Combine characters.',
    // 🔥 修改为 2行 x 2列 (变大)
    size: { rows: 3, cols: 3 },
    offset: { x: 60, y: 100 }
  },
  {
    id: 'shop',
    name: 'Builder Shop',
    emoji: '🏪',
    desc: 'Expand your town.',
    size: { rows: 3, cols: 3 },
    offset: { x: 0, y: 0 }
  },
  {
    id: 'museum',
    name: 'Museum',
    emoji: '🏛️',
    desc: 'View collection.',
    size: { rows: 3, cols: 3 },
    offset: { x: 0, y: 100 }
  }
];