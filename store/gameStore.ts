import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { RECIPES } from '@/data/recipes';
import { BASIC_CHARS } from '@/data/characters';
import { SHOP_ITEMS } from '@/data/shopItems';

// 🎒 物品接口
export interface Item {
  id: string;      // 唯一ID (wood-123456)
  baseId?: string; // 原始ID (wood)
  char: string;
  type: 'basic' | 'compound'; 
  name: string;
}

// 🏠 已放置建筑接口
export interface PlacedBuilding {
  id: string;
  typeId: string;
  row: number;
  col: number;
}

// 🐱 居民接口
export interface CatResident {
  id: string;
  name: string;
  skin: string;
}

interface GameState {
  // 🆔 身份与元数据 (为云端准备)
  userId: string;       
  lastSaveTime: number; 
  version: number;      

  // ☁️ 云端同步接口
  syncToCloud: () => Promise<void>;

  // --- 基础资源 ---
  gold: number;
  stamina: number;
  maxStamina: number;
  
  // --- 背包与图鉴 ---
  inventory: Item[];
  maxInventory: number;
  unlockedCollection: string[];

  // --- 任务进度 ---
  questStep: number;

  // --- 🎵 音频设置 ---
  bgmVolume: number;
  sfxVolume: number;
  setBgmVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;

  // --- 🏗️ 建造与地图系统 ---
  mapLevel: number;
  placedBuildings: PlacedBuilding[];
  residents: CatResident[];

  // --- 🏗️ 放置模式状态 ---
  isPlacementMode: boolean;
  placementItem: string | null;
  enterPlacementMode: (itemId: string) => void;
  cancelPlacement: () => void;
  confirmPlacement: (row: number, col: number) => { success: boolean; msg: string };

  // --- ✨ 功能 Actions ---
  regenerateStamina: () => void;
  mineItem: (item: Item) => { success: boolean; msg: string };
  sellItem: (index: number) => void;
  combineItems: (index1: number, index2: number) => { success: boolean; newItem?: Item };
  completeQuest: () => void;
  expandMap: () => { success: boolean; msg: string };
  transmuteItem: (costItemId: string, targetChar: string) => { success: boolean; msg: string; newItem?: Item };

  // --- 🔊 播放系统 ---
  playTTS: (text: string) => void;
  playSound: (type: 'coin' | 'mine' | 'success' | 'fail' | 'hover' | 'click' | 'build' | 'transmute') => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // ================= 初始状态 =================
      userId: `guest_${Math.floor(Math.random() * 1000000)}`, 
      lastSaveTime: Date.now(),
      version: 1,

      gold: 500,
      stamina: 100,
      maxStamina: 100,
      inventory: [],
      maxInventory: 10,
      unlockedCollection: [],
      questStep: 0,
      
      bgmVolume: 0.3, 
      sfxVolume: 0.3,

      mapLevel: 0,
      placedBuildings: [],
      residents: [],
      isPlacementMode: false,
      placementItem: null,

      // ================= ☁️ 云端同步模拟 =================
      syncToCloud: async () => {
        const state = get();
        console.log(`[Cloud Sync] Uploading save for User: ${state.userId}`);
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log("[Cloud Sync] ✅ Save successful!");
      },

      // ================= 设置 Actions =================
      setBgmVolume: (v) => set({ bgmVolume: v }),
      setSfxVolume: (v) => set({ sfxVolume: v }),

      // ================= 核心循环 Actions =================
      regenerateStamina: () => set((state) => ({
        stamina: Math.min(state.maxStamina, state.stamina + 1)
      })),

      completeQuest: () => set((state) => ({ 
        questStep: state.questStep + 1,
        lastSaveTime: Date.now()
      })),

      mineItem: (item) => {
        const state = get();
        if (state.stamina < 1) return { success: false, msg: "Not enough Energy! 💤" };
        if (state.inventory.length >= state.maxInventory) return { success: false, msg: "Backpack Full! 🎒" };

        const baseId = item.id.includes('-') ? item.id.split('-')[0] : item.id;

        set((state) => ({
          stamina: state.stamina - 1,
          inventory: [...state.inventory, { ...item, baseId }],
          unlockedCollection: state.unlockedCollection.includes(baseId) 
            ? state.unlockedCollection 
            : [...state.unlockedCollection, baseId],
          lastSaveTime: Date.now()
        }));
        return { success: true, msg: "" };
      },

      sellItem: (index) => set((state) => {
        const item = state.inventory[index];
        const price = item.type === 'basic' ? 1 : 5;
        const newInv = [...state.inventory];
        newInv.splice(index, 1);
        return { 
          gold: state.gold + price, 
          inventory: newInv,
          lastSaveTime: Date.now()
        };
      }),

      combineItems: (idx1, idx2) => {
        const state = get();
        const item1 = state.inventory[idx1];
        const item2 = state.inventory[idx2];
        
        const recipe = RECIPES.find(r => 
          (r.inputs[0] === item1.char && r.inputs[1] === item2.char) ||
          (r.inputs[0] === item2.char && r.inputs[1] === item1.char)
        );

        if (recipe) {
          const newInv = [...state.inventory];
          const removeIndices = [idx1, idx2].sort((a, b) => b - a);
          newInv.splice(removeIndices[0], 1);
          newInv.splice(removeIndices[1], 1);
          
          const baseId = recipe.result.id;
          const newItem: Item = { 
            id: `${baseId}-${Date.now()}`, 
            baseId: baseId,  
            char: recipe.result.char, 
            type: 'compound', 
            name: recipe.result.name 
          };
          
          newInv.push(newItem);

          const newCollection = state.unlockedCollection.includes(baseId)
            ? state.unlockedCollection
            : [...state.unlockedCollection, baseId];

          set({ 
            inventory: newInv, 
            unlockedCollection: newCollection,
            lastSaveTime: Date.now()
          });
          return { success: true, newItem };
        }
        return { success: false };
      },

      // ================= 🏗️ 建造系统 Actions =================
      enterPlacementMode: (itemId) => {
        set({ isPlacementMode: true, placementItem: itemId });
      },

      cancelPlacement: () => {
        set({ isPlacementMode: false, placementItem: null });
      },

      confirmPlacement: (row, col) => {
        const state = get();
        const itemId = state.placementItem;
        if (!itemId) return { success: false, msg: "Error" };

        const shopItem = SHOP_ITEMS.find(i => i.id === itemId);
        if (!shopItem) return { success: false, msg: "Item not found" };

        if (state.gold < shopItem.price) {
            return { success: false, msg: "Not enough Gold!" };
        }

        if (shopItem.type === 'unique') {
            const hasExisting = state.placedBuildings.some(b => b.typeId === itemId);
            if (hasExisting) return { success: false, msg: "You already have one!" };
        }

        const newBuilding: PlacedBuilding = {
            id: `${itemId}-${Date.now()}`,
            typeId: itemId,
            row,
            col
        };

        let newResidents = [...state.residents];
        if (itemId === 'cat_house') {
            newResidents.push({
                id: `cat-${Date.now()}`,
                name: 'Neighbor',
                skin: 'default'
            });
        }

        set({
            gold: state.gold - shopItem.price,
            placedBuildings: [...state.placedBuildings, newBuilding],
            residents: newResidents,
            isPlacementMode: false,
            placementItem: null,
            lastSaveTime: Date.now()
        });

        get().playSound('build');
        return { success: true, msg: "Built successfully!" };
      },

      expandMap: () => {
        const state = get();
        const expansionItem = SHOP_ITEMS.find(i => i.id === 'expansion');
        if (!expansionItem || !expansionItem.tierPrices) return { success: false, msg: "Error" };

        if (state.mapLevel >= 4) {
            return { success: false, msg: "Max expansion reached!" };
        }

        const cost = expansionItem.tierPrices[state.mapLevel];
        if (state.gold < cost) {
            return { success: false, msg: "Not enough Gold!" };
        }

        set({
            gold: state.gold - cost,
            mapLevel: state.mapLevel + 1,
            lastSaveTime: Date.now()
        });
        
        get().playSound('success');
        return { success: true, msg: "Town expanded!" };
      },

      transmuteItem: (costItemId, targetChar) => {
        const state = get();
        const costItemIndex = state.inventory.findIndex(i => i.id === costItemId);
        
        if (costItemIndex === -1) return { success: false, msg: "Material lost?" };

        const targetData = BASIC_CHARS.find(c => c.char === targetChar);
        if (!targetData) return { success: false, msg: "Unknown character" };

        const newInv = [...state.inventory];
        newInv.splice(costItemIndex, 1);

        const newItem: Item = {
            id: `${targetData.id}-${Date.now()}`,
            baseId: targetData.id,
            char: targetData.char,
            type: 'basic',
            name: targetData.meaning
        };

        newInv.push(newItem);
        set({ 
            inventory: newInv,
            lastSaveTime: Date.now()
        });
        
        get().playSound('transmute');
        return { success: true, msg: "Transmuted!", newItem };
      },

      // ================= 🔊 播放系统 =================
      playTTS: (text) => {
        // 🔥 修复：不再检查 disableTTS，因为该属性已废弃
        // 我们直接检查浏览器是否支持语音，并使用映射表
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const speakMap: Record<string, string> = {
            '氵': '水', '亻': '人', '扌': '手', '艹': '草', 
            '宀': '棉', '辶': '绰', '囗': '围'
          };
          // 如果在映射表里，读原字；否则读字本身
          const textToSpeak = speakMap[text] || text;
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = 'zh-CN';
          utterance.rate = 0.8;
          window.speechSynthesis.speak(utterance);
        }
      },

      playSound: (type) => {
        const state = get();
        if (state.sfxVolume === 0) return;

        const fileMap: Record<string, string> = {
          coin: '/coin.mp3',
          mine: '/mine.mp3',
          success: '/success.mp3',
          fail: '/fail.mp3',
          hover: '/hover.mp3',
          click: '/hover.mp3',
          build: '/success.mp3', 
          transmute: '/success.mp3'
        };

        const path = fileMap[type];
        if (!path) return;

        try {
            const audio = new Audio(path);
            audio.volume = state.sfxVolume;
            audio.currentTime = 0;
            audio.play().catch(() => {});
        } catch (e) {
            console.error(e);
        }
      }
    }),
    { 
      name: 'cat-town-save-v7',
      onRehydrateStorage: () => (state) => {
        if (state) {
            console.log(`[Save System] Loaded save for User: ${state.userId}`);
        }
      }
    }
  )
);