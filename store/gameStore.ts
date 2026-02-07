// store/gameStore.ts
import { create } from 'zustand';
import { RECIPES } from '@/data/recipes';
import { CharData } from '@/data/characters';

interface GameState {
  gold: number;
  inventory: string[]; 
  unlockedChars: string[]; // 新增：记录解锁了哪些高级字
  
  addGold: (amount: number) => void;
  addItem: (item: string) => void;
  
  // 🔥 新增：尝试合成功能
  // 返回合成结果(成功时) 或 null(失败时)
  craft: (char1: string, char2: string) => CharData | null;
}

export const useGameStore = create<GameState>((set, get) => ({
  gold: 0,
  inventory: [],
  unlockedChars: [],

  addGold: (amount) => set((state) => ({ gold: state.gold + amount })),
  addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),

  craft: (c1, c2) => {
    const state = get();
    
    // 1. 查找配方 (无视顺序，木+口 和 口+木 都可以)
    const recipe = RECIPES.find(r => 
      (r.inputs[0] === c1 && r.inputs[1] === c2) ||
      (r.inputs[0] === c2 && r.inputs[1] === c1)
    );

    if (recipe) {
      // ✅ 合成成功！
      
      // 从背包里删除这两个原料 (只删除一个)
      const newInventory = [...state.inventory];
      const idx1 = newInventory.indexOf(c1);
      if (idx1 > -1) newInventory.splice(idx1, 1);
      
      const idx2 = newInventory.indexOf(c2);
      if (idx2 > -1) newInventory.splice(idx2, 1);

      set({
        inventory: newInventory,
        unlockedChars: [...state.unlockedChars, recipe.result.char], // 记录成就
        gold: state.gold + 50 // 奖励金币
      });

      return recipe.result;
    }

    // ❌ 合成失败
    return null;
  }
}));