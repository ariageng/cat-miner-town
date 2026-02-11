'use client';
import { useState, useEffect } from 'react'; // 🔥 1. 引入必要钩子
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { MAIN_QUESTS } from '@/data/quests';
import { CheckCircle2, Gift, MessageCircle, Sparkles } from 'lucide-react';

export default function CatGuide() {
  const { questStep, completeQuest } = useGameStore();
  
  // 🔥 2. 添加挂载状态检查
  const [isMounted, setIsMounted] = useState(false);

  // 🔥 3. 组件加载完毕后，将 isMounted 设为 true
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentQuest = MAIN_QUESTS[questStep] || MAIN_QUESTS[MAIN_QUESTS.length - 1];
  const isTaskDone = currentQuest.isReady();
  const isLastStep = questStep >= MAIN_QUESTS.length - 1;

  const handleComplete = () => {
    if (isTaskDone && !isLastStep) {
      if (currentQuest.reward) {
        useGameStore.setState(state => ({ gold: state.gold + currentQuest.reward! }));
      }
      completeQuest();
    }
  };

  // 🔥 4. 如果还没挂载（还在服务端），直接不渲染，防止报错
  if (!isMounted) return null;

  return (
    <div className="absolute bottom-6 left-6 z-50 flex items-end gap-5 pointer-events-auto select-none" onMouseDown={e => e.stopPropagation()}>
      
      {/* 🐱 猫咪头像 */}
      <motion.div 
        whileHover={{ scale: 1.05, rotate: 3 }}
        whileTap={{ scale: 0.95 }}
        className="w-24 h-24 relative cursor-pointer group shrink-0"
        onClick={handleComplete}
      >
        <div className="w-full h-full bg-[#FFF8E7] rounded-full border-[3px] border-orange-200 shadow-lg shadow-orange-100 overflow-hidden relative flex items-center justify-center">
             {/* 这里的图片路径如果你还没换，可以用 cat-face.png 或 emoji 代替 */}
             <img src="/my-cat-npc.png" alt="Cat Mayor" className="w-full h-full object-cover" /> 
        </div>
        
        {/* 可领奖提示标记 */}
        {isTaskDone && !isLastStep && (
             <motion.div 
                animate={{ y: [0, -6, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm z-10"
             >
                <Gift size={18} className="fill-current" />
             </motion.div>
        )}
      </motion.div>

      {/* 💬 对话气泡 */}
      <AnimatePresence mode='wait'>
        <motion.div 
            key={questStep} 
            initial={{ opacity: 0, x: -20, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
                relative bg-[#FFF8E7]/95 backdrop-blur-md px-6 py-5 rounded-3xl rounded-bl-none shadow-xl border-2 max-w-xs sm:max-w-[28rem]
                ${isTaskDone && !isLastStep
                    ? 'border-green-300 shadow-green-100/50' 
                    : 'border-orange-200/80 shadow-orange-100/50'
                }
            `}
        >
            {/* 任务标题头 */}
            <div className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                {isTaskDone && !isLastStep ? (
                    <span className="text-green-600 flex items-center gap-1">
                        <Sparkles size={14} /> QUEST COMPLETE!
                    </span>
                ) : (
                    <span className="text-orange-700/60 flex items-center gap-1">
                        <MessageCircle size={14} /> 
                        {isLastStep ? "FREE MODE" : `CURRENT GOAL: STEP ${questStep + 1}`}
                    </span>
                )}
            </div>

            {/* 任务文字内容 */}
            <p className="text-[15px] font-bold text-slate-700 leading-relaxed mb-5">
                {currentQuest.text}
            </p>

            {/* 按钮或进度条区域 */}
            <div className="relative">
                {isTaskDone && !isLastStep ? (
                    <button 
                        onClick={handleComplete}
                        className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-black py-3 rounded-2xl shadow-md shadow-green-200 active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center gap-2 animate-pulse"
                    >
                        <Gift size={20} />
                        {currentQuest.buttonText || "Claim Reward"}
                    </button>
                ) : (
                    <div className="w-full h-2.5 bg-orange-100/50 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: isLastStep ? '100%' : '30%' }} 
                            className={`h-full rounded-full ${isLastStep ? 'bg-gradient-to-r from-orange-300 to-orange-400' : 'bg-gradient-to-r from-orange-300 to-orange-400'}`} 
                        />
                    </div>
                )}
            </div>
            
            
        </motion.div>
      </AnimatePresence>

    </div>
  );
}