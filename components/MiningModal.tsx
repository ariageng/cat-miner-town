'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, Item } from '@/store/gameStore';
import { Pickaxe, X, Volume2, Zap, AlertCircle } from 'lucide-react';

// ⛏️ 扩展后的矿池 (确保你之前已经更新过这个，这里只是简写，请保留你的完整列表)
const MINE_POOL = [
  { id: 'wood', char: '木', type: 'basic', name: 'Wood', pinyin: 'mù' },
  { id: 'water', char: '水', type: 'basic', name: 'Water', pinyin: 'shuǐ' },
  { id: 'earth', char: '土', type: 'basic', name: 'Earth', pinyin: 'tǔ' },
  { id: 'human', char: '人', type: 'basic', name: 'Person', pinyin: 'rén' },
  { id: 'mouth', char: '口', type: 'basic', name: 'Mouth', pinyin: 'kǒu' },
  { id: 'fire', char: '火', type: 'basic', name: 'Fire', pinyin: 'huǒ' },
  { id: 'sun', char: '日', type: 'basic', name: 'Sun', pinyin: 'rì' },
  { id: 'moon', char: '月', type: 'basic', name: 'Moon', pinyin: 'yuè' },
  { id: 'mountain', char: '山', type: 'basic', name: 'Mountain', pinyin: 'shān' },
  { id: 'eye', char: '目', type: 'basic', name: 'Eye', pinyin: 'mù' },
  { id: 'field', char: '田', type: 'basic', name: 'Field', pinyin: 'tián' },
  { id: 'power', char: '力', type: 'basic', name: 'Power', pinyin: 'lì' },
  { id: 'door', char: '门', type: 'basic', name: 'Door', pinyin: 'mén' },
  { id: 'white', char: '白', type: 'basic', name: 'White', pinyin: 'bái' },
  { id: 'sunset', char: '夕', type: 'basic', name: 'Sunset', pinyin: 'xī' },
  { id: 'woman', char: '女', type: 'basic', name: 'Woman', pinyin: 'nǚ' },
  { id: 'child', char: '子', type: 'basic', name: 'Child', pinyin: 'zǐ' },
  { id: 'small', char: '小', type: 'basic', name: 'Small', pinyin: 'xiǎo' },
  // 部首
  { id: 'rad_water', char: '氵', type: 'basic', name: 'Water Rad.', pinyin: 'shuǐ' },
  { id: 'rad_person', char: '亻', type: 'basic', name: 'Person Rad.', pinyin: 'rén' },
  { id: 'rad_hand', char: '扌', type: 'basic', name: 'Hand Rad.', pinyin: 'shǒu' },
  { id: 'rad_grass', char: '艹', type: 'basic', name: 'Grass Rad.', pinyin: 'cǎo' },
  { id: 'rad_roof', char: '宀', type: 'basic', name: 'Roof Rad.', pinyin: 'mián' },
] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiningModal({ isOpen, onClose }: Props) {
  // 🔥 这里 playSound 不会再报错了，因为我们在 GameState 接口里定义了它
  const { mineItem, stamina, inventory, playTTS, playSound } = useGameStore();
  
  const [lastMined, setLastMined] = useState<{char: string, pinyin: string, name: string} | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleMine = () => {
    if (stamina < 1) {
      triggerError("Not enough energy! 💤");
      return;
    }
    if (inventory.length >= 10) {
      triggerError("Backpack is full! 🎒");
      return;
    }

    const randomTemplate = MINE_POOL[Math.floor(Math.random() * MINE_POOL.length)];
    const newItem: Item = {
      id: `${randomTemplate.id}-${Date.now()}`,
      char: randomTemplate.char,
      type: 'basic',
      name: randomTemplate.name
    };

    const result = mineItem(newItem);

    if (result.success) {
      playSound('mine'); // 🔥 播放挖矿音效
      if (playTTS) playTTS(newItem.char);
      
      setLastMined({ 
        char: randomTemplate.char, 
        pinyin: randomTemplate.pinyin, 
        name: randomTemplate.name 
      });
      
      setTimeout(() => setLastMined(null), 1500);
    } else {
      triggerError(result.msg);
    }
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#FFF8E7] w-full max-w-md rounded-3xl shadow-2xl border-4 border-[#8B5E3C] relative flex flex-col overflow-hidden max-h-[90vh]"
      >
        <div className="bg-[#8B5E3C] p-4 flex justify-between items-center text-white">
            <div className="flex flex-col">
                <h2 className="text-xl font-black tracking-widest uppercase flex items-center gap-2">
                    <Pickaxe size={20} /> Deep Mines
                </h2>
                <div className="flex items-center gap-1 text-xs text-orange-200 font-bold mt-1">
                    <Zap size={12} className="fill-current" /> COST: 1 ENERGY
                </div>
            </div>
            <button onClick={onClose} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                <X size={20} />
            </button>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
            
            <AnimatePresence>
                {lastMined && (
                    <motion.div 
                        key="feedback"
                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                        animate={{ opacity: 1, y: -80, scale: 1 }}
                        exit={{ opacity: 0, y: -100 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                    >
                        <div className="bg-white px-6 py-4 rounded-2xl shadow-xl border-b-4 border-orange-200 flex flex-col items-center text-center">
                            <span className="text-6xl font-serif text-slate-800 mb-1">{lastMined.char}</span>
                            <span className="text-orange-500 font-bold">{lastMined.pinyin}</span>
                            <span className="text-slate-400 text-xs uppercase font-bold">{lastMined.name}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {errorMsg && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 z-30"
                    >
                        <AlertCircle size={16} /> {errorMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleMine}
                disabled={stamina < 1 || inventory.length >= 10}
                className={`
                    w-48 h-48 rounded-3xl shadow-[0_8px_0_rgba(0,0,0,0.2)] border-4 flex flex-col items-center justify-center transition-all relative
                    ${stamina < 1 || inventory.length >= 10 
                        ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed shadow-none translate-y-2' 
                        : 'bg-orange-400 border-orange-500 text-white hover:bg-orange-500 active:shadow-none active:translate-y-2'
                    }
                `}
            >
                <Pickaxe size={64} className="mb-2" />
                <span className="font-black text-xl uppercase tracking-wider">DIG!</span>
            </motion.button>
            
            <p className="mt-6 text-[#8B5E3C]/60 text-sm font-bold flex items-center gap-2">
                <Volume2 size={14} /> Auto-read enabled
            </p>
        </div>

        <div className="bg-white/50 border-t-2 border-[#8B5E3C]/20 p-4">
            <div className="flex justify-between items-center mb-2 text-xs font-bold text-[#8B5E3C]">
                <span>BACKPACK</span>
                <span className={inventory.length >= 10 ? 'text-red-500' : ''}>
                    {inventory.length} / 10
                </span>
            </div>
            
            <div className="flex justify-between gap-2">
                {Array.from({ length: 10 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`
                            h-8 flex-1 rounded-md border-2 flex items-center justify-center text-sm font-serif shadow-sm transition-all
                            ${inventory[i] 
                                ? 'bg-white border-orange-200 text-slate-700' 
                                : 'bg-slate-100/50 border-transparent'
                            }
                        `}
                    >
                        {inventory[i] ? inventory[i].char : ''}
                    </div>
                ))}
            </div>
        </div>

      </motion.div>
    </div>
  );
}