// data/recipes.ts
import { CharData } from './characters';

export interface Recipe {
  inputs: [string, string]; // 需要哪两个字
  result: CharData;         // 合成出什么
}

// 📖 合成配方书
export const RECIPES: Recipe[] = [
  {
    inputs: ['木', '木'],
    result: { char: '林', pinyin: 'lín', meaning: 'Forest (Two trees)' }
  },
  {
    inputs: ['日', '月'],
    result: { char: '明', pinyin: 'míng', meaning: 'Bright (Sun + Moon)' }
  },
  {
    inputs: ['人', '人'],
    result: { char: '从', pinyin: 'cóng', meaning: 'Follow (Person behind person)' }
  },
  {
    inputs: ['口', '口'],
    result: { char: '回', pinyin: 'huí', meaning: 'Return (Mouth in mouth)' } // 简化逻辑，方便游戏性
  },
  {
    inputs: ['女', '子'], // 注意：你需要确保你的挖矿能挖到 '女' 和 '子'
    result: { char: '好', pinyin: 'hǎo', meaning: 'Good (Woman + Child)' }
  }
];