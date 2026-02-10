export interface Recipe {
  inputs: [string, string];
  result: {
    id: string;
    char: string;
    pinyin: string;
    meaning: string;
    name: string;
  };
}

export const RECIPES: Recipe[] = [
  // 使用部首的新配方
  { inputs: ['氵', '目'], result: { id: 'tear', char: '泪', pinyin: 'lèi', meaning: 'Tears', name: 'Tears' } }, // 泪 = 水 + 目
  { inputs: ['亻', '门'], result: { id: 'flash', char: '闪', pinyin: 'shǎn', meaning: 'Flash', name: 'Flash' } }, // 闪 = 人 + 门 (虽然实际是人进门，这里意会)
  { inputs: ['亻', '木'], result: { id: 'rest', char: '休', pinyin: 'xiū', meaning: 'Rest', name: 'Rest' } },
  { inputs: ['宀', '女'], result: { id: 'safe', char: '安', pinyin: 'ān', meaning: 'Safe', name: 'Safe' } }, // 安 = 宝盖 + 女
  { inputs: ['宀', '火'], result: { id: 'disaster', char: '灾', pinyin: 'zāi', meaning: 'Disaster', name: 'Disaster' } }, // 灾 = 宝盖 + 火
  { inputs: ['艹', '田'], result: { id: 'seedling', char: '苗', pinyin: 'miáo', meaning: 'Seedling', name: 'Seedling' } }, // 苗 = 草 + 田
  // --- 自然景观 ---
  { inputs: ['木', '木'], result: { id: 'forest', char: '林', pinyin: 'lín', meaning: 'Forest', name: 'Forest' } },
  { inputs: ['林', '木'], result: { id: 'jungle', char: '森', pinyin: 'sēn', meaning: 'Jungle', name: 'Jungle' } },
  { inputs: ['日', '月'], result: { id: 'bright', char: '明', pinyin: 'míng', meaning: 'Bright', name: 'Bright' } },
  { inputs: ['火', '火'], result: { id: 'blaze', char: '炎', pinyin: 'yán', meaning: 'Blaze', name: 'Blaze' } }, // 新
  { inputs: ['白', '水'], result: { id: 'spring', char: '泉', pinyin: 'quán', meaning: 'Spring', name: 'Spring' } }, // 新
  { inputs: ['小', '土'], result: { id: 'dust', char: '尘', pinyin: 'chén', meaning: 'Dust', name: 'Dust' } }, // 新

  // --- 人物活动 ---
  { inputs: ['人', '人'], result: { id: 'follow', char: '从', pinyin: 'cóng', meaning: 'Follow', name: 'Follow' } },
  { inputs: ['人', '木'], result: { id: 'rest', char: '休', pinyin: 'xiū', meaning: 'Rest', name: 'Rest' } },
  { inputs: ['人', '山'], result: { id: 'immortal', char: '仙', pinyin: 'xiān', meaning: 'Immortal', name: 'Fairy' } }, // 新
  { inputs: ['田', '力'], result: { id: 'man', char: '男', pinyin: 'nán', meaning: 'Man', name: 'Man' } }, // 新
  { inputs: ['女', '子'], result: { id: 'good', char: '好', pinyin: 'hǎo', meaning: 'Good', name: 'Good' } }, // 新

  // --- 身体与情感 ---
  { inputs: ['水', '目'], result: { id: 'tear', char: '泪', pinyin: 'lèi', meaning: 'Tears', name: 'Tears' } }, // 新
  { inputs: ['口', '口'], result: { id: 'return', char: '回', pinyin: 'huí', meaning: 'Return', name: 'Return' } },
  { inputs: ['木', '口'], result: { id: 'apricot', char: '杏', pinyin: 'xìng', meaning: 'Apricot', name: 'Apricot' } }, // 新

  // --- 门系列 ---
  { inputs: ['门', '口'], result: { id: 'ask', char: '问', pinyin: 'wèn', meaning: 'Ask', name: 'Ask' } }, // 新
  { inputs: ['门', '人'], result: { id: 'flash', char: '闪', pinyin: 'shǎn', meaning: 'Flash', name: 'Flash' } }, // 新
  { inputs: ['门', '日'], result: { id: 'room', char: '间', pinyin: 'jiān', meaning: 'Room', name: 'Room' } }, // 新

  // --- 其他 ---
  { inputs: ['夕', '夕'], result: { id: 'many', char: '多', pinyin: 'duō', meaning: 'Many', name: 'Many' } }, // 新
  { inputs: ['火', '山'], result: { id: 'volcano', char: '灿', pinyin: 'càn', meaning: 'Splendid', name: 'Splendid' } },
];