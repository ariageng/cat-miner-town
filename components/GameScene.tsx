'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { Pickaxe, Gem, Backpack, Volume2, Music, Music2 } from 'lucide-react'; // 引入新图标
import { BASIC_CHARS, CharData } from '@/data/characters';
import CraftingModal from './CraftingModal';
import { FlaskConical } from 'lucide-react'; // 确保引入了图标

export default function GameScene() {
  const { gold, addGold, addItem, inventory } = useGameStore();
  const [lastMined, setLastMined] = useState<CharData | null>(null);
  const [isCraftingOpen, setIsCraftingOpen] = useState(false);

  // 🎵 背景音乐状态
  const [isBgmPlaying, setIsBgmPlaying] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // 初始化 BGM
  useEffect(() => {
    // 创建音频对象
    bgmRef.current = new Audio('/bgm.mp3');
    bgmRef.current.loop = true;   // 循环播放
    bgmRef.current.volume = 0.2;  // 音量设低一点，不要盖过朗读声
    
    return () => {
      // 组件卸载时暂停
      if (bgmRef.current) {
        bgmRef.current.pause();
      }
    };
  }, []);

  // 开关背景音乐
  const toggleBgm = () => {
    if (!bgmRef.current) return;

    if (isBgmPlaying) {
      bgmRef.current.pause();
    } else {
      // 浏览器策略：必须有用户交互才能播放
      bgmRef.current.play().catch(e => console.log("BGM play failed:", e));
    }
    setIsBgmPlaying(!isBgmPlaying);
  };

  // 🔊 朗读汉字
  const speakChinese = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  // ⛏️ 挖矿音效
  const playMineSound = () => {
    try {
      const audio = new Audio('/mine.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const handleMine = () => {
    playMineSound();
    addGold(10);
    
    // 如果是第一次点击，且音乐没开，尝试自动播放音乐 (可选体验优化)
    if (!isBgmPlaying && bgmRef.current) {
        bgmRef.current.play().catch(() => {});
        setIsBgmPlaying(true);
    }

    const randomCharObj = BASIC_CHARS[Math.floor(Math.random() * BASIC_CHARS.length)];
    addItem(randomCharObj.char);
    setLastMined(randomCharObj);
    speakChinese(randomCharObj.char);
    
    setTimeout(() => setLastMined(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] font-sans text-slate-800 overflow-hidden relative select-none">
      
      {/* --- 顶部 UI 栏 --- */}
      <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
        <div className="flex gap-2">
            {/* 金币 */}
            <div className="bg-white/90 backdrop-blur border-2 border-orange-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-2">
            <div className="bg-yellow-400 p-1.5 rounded-full">
                <Gem size={16} className="text-white" />
            </div>
            <span className="font-bold text-orange-600">{gold}</span>
            </div>
        </div>
        
        <div className="flex gap-2">
             {/* 🎵 BGM 开关按钮 */}
            <button 
                onClick={toggleBgm}
                className={`transition-all border-2 rounded-xl px-3 py-2 shadow-sm flex items-center gap-2 ${
                    isBgmPlaying 
                    ? "bg-rose-100 border-rose-300 text-rose-600" 
                    : "bg-white/90 border-slate-200 text-slate-400"
                }`}
            >
                {isBgmPlaying ? <Music size={18} className="animate-pulse" /> : <Music2 size={18} />}
            </button>

            {/* 背包 */}
            <div className="bg-white/90 backdrop-blur border-2 border-blue-200 rounded-xl px-4 py-2 shadow-sm flex items-center gap-2">
            <Backpack size={16} className="text-blue-500" />
            <span className="text-sm font-bold text-blue-600">{inventory.length}</span>
            </div>
        </div>
      </div>

      {/* --- 游戏主舞台 --- */}
      <div className="flex flex-col items-center justify-center h-screen gap-6">
        
        <div className="text-center mt-10">
            <h1 className="text-4xl font-black text-amber-800 tracking-wider">Cat Miner</h1>
            <p className="text-amber-600/60 text-sm font-medium mt-1 flex items-center justify-center gap-1">
              <Volume2 size={12} /> Sound On
            </p>
        </div>

        <div className="relative group cursor-pointer mt-4" onClick={handleMine}>
          <AnimatePresence>
            {lastMined && (
                <motion.div 
                    key={lastMined.char + Date.now()}
                    initial={{ opacity: 0, scale: 0.5, y: 0 }}
                    animate={{ opacity: 1, scale: 1, y: -110 }}
                    exit={{ opacity: 0, y: -150 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-50"
                >
                    <div className="flex flex-col items-center bg-white/95 backdrop-blur shadow-xl rounded-2xl p-3 border-2 border-orange-100">
                      <span className="text-6xl font-black text-orange-600 drop-shadow-sm mb-1">
                        {lastMined.char}
                      </span>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg font-bold text-slate-600 bg-slate-100 px-3 py-0.5 rounded-full">
                          {lastMined.pinyin}
                        </span>
                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                          {lastMined.meaning}
                        </span>
                      </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="absolute -top-14 -left-6 text-7xl z-20 pointer-events-none filter drop-shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            🐱
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95, rotate: -2 }}
            className="w-52 h-52 bg-stone-100 rounded-3xl border-b-[12px] border-r-[12px] border-stone-300 shadow-xl flex items-center justify-center relative overflow-hidden active:border-b-4 active:border-r-4 active:translate-y-2 active:translate-x-2 transition-all z-10"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,#000_1px,transparent_1px)] bg-[length:12px_12px]"></div>
            <Pickaxe size={80} className="text-stone-300 opacity-80" />
            <span className="absolute bottom-6 text-sm text-stone-400 font-bold uppercase tracking-widest">Tap to Mine</span>
          </motion.div>
        </div>

        <div className="h-28 w-full max-w-md px-4 flex items-center justify-center gap-3 overflow-hidden mt-4">
          <AnimatePresence mode='popLayout'>
            {inventory.slice(-4).reverse().map((char, i) => {
               const charData = BASIC_CHARS.find(c => c.char === char);
               return (
                  <motion.div
                  key={`${char}-${i}`}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="w-16 h-20 bg-white border-2 border-stone-100 rounded-xl flex flex-col items-center justify-center shadow-sm shrink-0"
                  >
                  <span className="text-2xl font-bold text-slate-800">{char}</span>
                  <span className="text-xs text-slate-500 font-medium">{charData?.pinyin}</span>
                  </motion.div>
               );
            })}
          </AnimatePresence>
        </div>

      </div>

      {/* 底部功能按钮区 (放在屏幕右下角) */}
      <div className="absolute bottom-8 right-6 z-40">
        <button 
          onClick={() => setIsCraftingOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-full shadow-xl border-4 border-white active:scale-90 transition-all flex flex-col items-center justify-center gap-1 w-20 h-20"
        >
          <FlaskConical size={28} />
          <span className="text-[10px] font-bold uppercase">Craft</span>
        </button>
      </div>

      {/* 弹窗组件 */}
      <CraftingModal 
        isOpen={isCraftingOpen} 
        onClose={() => setIsCraftingOpen(false)} 
      />
      
    </div>
  );
}