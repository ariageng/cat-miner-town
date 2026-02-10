export interface CharData {
  id: string;
  char: string;
  pinyin: string;
  meaning: string;
  type?: 'basic' | 'compound';
  note?: string; // 🔥 新增：用于博物馆显示的额外注释
}

export const BASIC_CHARS: CharData[] = [
  // --- 💧 部首 (现在有了读音和注释) ---
  { 
    id: 'rad_water', char: '氵', pinyin: 'shuǐ', meaning: 'Water', type: 'basic', 
    note: 'Form of "水" (Water)' // ✨ 注释：水的部首形态
  },
  { 
    id: 'rad_person', char: '亻', pinyin: 'rén', meaning: 'Person', type: 'basic', 
    note: 'Form of "人" (Person)' 
  },
  { 
    id: 'rad_hand', char: '扌', pinyin: 'shǒu', meaning: 'Hand', type: 'basic', 
    note: 'Form of "手" (Hand)' 
  },
  { 
    id: 'rad_grass', char: '艹', pinyin: 'cǎo', meaning: 'Grass', type: 'basic', 
    note: 'Radical for plants' 
  },
  { 
    id: 'rad_roof', char: '宀', pinyin: 'mián', meaning: 'Roof', type: 'basic', 
    note: 'Radical for house/roof' 
  },
  { 
    id: 'rad_walk', char: '辶', pinyin: 'chuò', meaning: 'Walk', type: 'basic', 
    note: 'Radical for movement' 
  },

  // --- 🌲 基础汉字 (保持不变) ---
  { id: 'wood', char: '木', pinyin: 'mù', meaning: 'Wood', type: 'basic' },
  { id: 'fire', char: '火', pinyin: 'huǒ', meaning: 'Fire', type: 'basic' },
  { id: 'earth', char: '土', pinyin: 'tǔ', meaning: 'Earth', type: 'basic' },
  { id: 'human', char: '人', pinyin: 'rén', meaning: 'Person', type: 'basic' },
  { id: 'mouth', char: '口', pinyin: 'kǒu', meaning: 'Mouth', type: 'basic' },
  { id: 'sun', char: '日', pinyin: 'rì', meaning: 'Sun', type: 'basic' },
  { id: 'moon', char: '月', pinyin: 'yuè', meaning: 'Moon', type: 'basic' },
  { id: 'mountain', char: '山', pinyin: 'shān', meaning: 'Mountain', type: 'basic' },
  { id: 'eye', char: '目', pinyin: 'mù', meaning: 'Eye', type: 'basic' },
  { id: 'field', char: '田', pinyin: 'tián', meaning: 'Field', type: 'basic' },
  { id: 'door', char: '门', pinyin: 'mén', meaning: 'Door', type: 'basic' },
  { id: 'small', char: '小', pinyin: 'xiǎo', meaning: 'Small', type: 'basic' },
];