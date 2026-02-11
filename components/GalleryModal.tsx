'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { X, BookOpen, Lock, Volume2, Trophy } from 'lucide-react';
import { RECIPES } from '@/data/recipes';
import { BASIC_CHARS } from '@/data/characters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function GalleryModal({ isOpen, onClose }: Props) {
  const { unlockedCollection, playTTS } = useGameStore();

  // 1. 整理所有图鉴
  // 我们在这里做了数据标准化：把 recipe 的 name 统一赋给 meaning
  const allCollection = [
    ...BASIC_CHARS, 
    ...RECIPES.map(r => ({
      ...r.result,
      pinyin: (r.result as any).pinyin || '???',
      // 🔥 关键点：这里已经把 name 塞进 meaning 了
      meaning: (r.result as any).meaning || r.result.name, 
      note: undefined
    }))
  ];

  if (!isOpen) return null;

  // 计算解锁数量
  const unlockedCount = allCollection.filter(item => {
    return unlockedCollection.some(uId => 
      uId === item.id || uId.startsWith(item.id + '-')
    );
  }).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#FFF8E7] w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl border-4 border-[#8B5E3C] overflow-hidden relative flex flex-col"
      >
        {/* 标题 */}
        <div className="bg-white p-5 flex items-center justify-between border-b-2 border-[#8B5E3C]/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                <BookOpen size={24} />
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-wider">Museum Collection</h2>
                <p className="text-xs text-slate-400 font-bold">Click cards to listen</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FFF8E7]">
          
          {/* 进度条 */}
          <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-[#8B5E3C]/10 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <Trophy className="text-yellow-500" size={20} />
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Collection Progress</span>
             </div>
             <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-[#8B5E3C]">{unlockedCount}</span>
                <span className="text-lg font-bold text-slate-300">/</span>
                <span className="text-lg font-bold text-slate-400">{allCollection.length}</span>
             </div>
          </div>

          {/* 网格 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-10">
            {allCollection.map((item, index) => {
              const isUnlocked = unlockedCollection.some(uId => 
                  uId === item.id || uId.startsWith(item.id + '-')
              );

              return (
                <div key={`${item.id}-${index}`} className="flex flex-col group">
                  <motion.button 
                    disabled={!isUnlocked}
                    onClick={() => playTTS(item.char)}
                    whileHover={isUnlocked ? { y: -5, scale: 1.02 } : {}}
                    whileTap={isUnlocked ? { scale: 0.95 } : {}}
                    className={`
                      relative aspect-[3/4] rounded-2xl border-2 flex flex-col items-center justify-center shadow-sm transition-all duration-300 overflow-hidden
                      ${isUnlocked 
                        ? "bg-white border-orange-200 hover:border-orange-400 hover:shadow-lg cursor-pointer" 
                        : "bg-slate-200/50 border-slate-200 opacity-80 cursor-not-allowed"
                      }
                    `}
                  >
                    {isUnlocked ? (
                      <>
                        <span className="absolute -bottom-4 -right-4 text-9xl font-serif text-orange-50 opacity-50 select-none pointer-events-none">
                            {item.char}
                        </span>

                        <div className="relative z-10 flex flex-col items-center">
                            <span className="text-5xl font-black text-slate-800 mb-2 font-serif">{item.char}</span>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-white bg-orange-400 px-2 py-0.5 rounded-full shadow-sm">
                                    {item.pinyin}
                                </span>
                                {/* 🔥 修复重点：只使用 item.meaning，因为我们已经把 name 映射到这里了 */}
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1 px-2 text-center">
                                    {item.meaning}
                                </span>
                                {item.note && (
                                    <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 mt-1 max-w-[80px] text-center leading-tight">
                                        {item.note}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="absolute top-2 right-2 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Volume2 size={16} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-slate-300">
                        <Lock size={32} className="mb-2" />
                        <span className="text-xs font-bold uppercase tracking-widest">Locked</span>
                      </div>
                    )}
                  </motion.button>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}