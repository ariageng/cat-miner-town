'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { X, BookOpen, Lock } from 'lucide-react';
import { RECIPES } from '@/data/recipes';
import { BASIC_CHARS } from '@/data/characters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GalleryModal({ isOpen, onClose }: Props) {
  const { unlockedChars, inventory } = useGameStore();

  // 1. 整理所有可能获得的字 (基础字 + 配方里的结果字)
  const allChars = [
    ...BASIC_CHARS, 
    ...RECIPES.map(r => r.result)
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#FDF6E3] w-full max-w-lg h-[80vh] rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden relative flex flex-col"
      >
        {/* 标题栏 */}
        <div className="bg-amber-100 p-4 flex items-center justify-between border-b-2 border-amber-200 shrink-0">
          <div className="flex items-center gap-2 text-amber-900">
            <BookOpen size={24} />
            <h2 className="text-xl font-black uppercase tracking-wider">Collection</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-amber-200 rounded-full transition-colors">
            <X size={24} className="text-amber-800" />
          </button>
        </div>

        {/* 滚动内容区 */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          
          {/* 进度统计 */}
          <div className="mb-6 bg-white/50 p-4 rounded-xl flex justify-between items-center">
             <span className="text-sm font-bold text-slate-500 uppercase">Progress</span>
             <span className="text-xl font-black text-amber-600">
               {/* 计算解锁总数：基础字总是解锁的(简化逻辑) + 合成解锁的 */}
               {inventory.length > 0 ? unlockedChars.length + BASIC_CHARS.length : 0} / {allChars.length}
             </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {allChars.map((item, index) => {
              // 判断是否解锁: 基础字默认解锁，高级字看 unlockedChars
              const isBasic = BASIC_CHARS.some(b => b.char === item.char);
              const isUnlocked = isBasic || unlockedChars.includes(item.char);

              return (
                <div key={index} className="flex flex-col items-center gap-2">
                  <motion.div 
                    whileHover={isUnlocked ? { scale: 1.05 } : {}}
                    className={`w-20 h-24 rounded-xl border-2 flex flex-col items-center justify-center relative shadow-sm transition-all ${
                      isUnlocked 
                      ? "bg-white border-amber-100" 
                      : "bg-slate-200 border-slate-300 opacity-60"
                    }`}
                  >
                    {isUnlocked ? (
                      <>
                        <span className="text-3xl font-black text-slate-800 mb-1">{item.char}</span>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 rounded-full">{item.pinyin}</span>
                      </>
                    ) : (
                      <Lock size={20} className="text-slate-400" />
                    )}
                  </motion.div>
                  
                  {/* 解释文字 (解锁才显示) */}
                  <span className="text-[10px] font-bold text-slate-400 text-center leading-tight h-6 overflow-hidden w-full">
                    {isUnlocked ? item.meaning : "???"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </motion.div>
    </div>
  );
}