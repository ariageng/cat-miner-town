'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { MAIN_QUESTS } from '@/data/quests';
import { CheckCircle2, Gift, MessageCircle } from 'lucide-react';

export default function CatGuide() {
  const { questStep, completeQuest } = useGameStore();
  
  // Get current quest safely
  const currentQuest = MAIN_QUESTS[questStep] || MAIN_QUESTS[MAIN_QUESTS.length - 1];
  
  // Check if task is done
  const isTaskDone = currentQuest.isReady();

  // Handle quest completion
  const handleComplete = () => {
    if (isTaskDone) {
      if (currentQuest.reward) {
        useGameStore.setState(state => ({ gold: state.gold + currentQuest.reward! }));
      }
      completeQuest();
    }
  };

  return (
    <div className="absolute bottom-6 left-6 z-50 flex items-end gap-4 pointer-events-auto select-none" onMouseDown={e => e.stopPropagation()}>
      
      {/* 🐱 Cat Avatar */}
      <motion.div 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="w-24 h-24 relative cursor-pointer group"
        onClick={handleComplete} // Allow clicking the cat to complete if ready
      >
        <div className="w-full h-full bg-[#FFF8E7] rounded-full border-4 border-[#8B5E3C] shadow-[0_4px_0_rgba(0,0,0,0.2)] overflow-hidden relative flex items-center justify-center">
             {/* Replace with your image if available */}
             <img src="/my-cat-npc.png" alt="Cat Mayor" className="w-full h-full object-cover" /> 
        </div>
        
        {/* Notification Badge */}
        {isTaskDone && questStep < MAIN_QUESTS.length - 1 && (
             <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-1 -right-1 bg-green-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm z-10"
             >
                <Gift size={20} className="fill-current" />
             </motion.div>
        )}
      </motion.div>

      {/* 💬 Speech Bubble */}
      <AnimatePresence mode='wait'>
        <motion.div 
            key={questStep} 
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`
                relative bg-white/95 backdrop-blur-md px-6 py-5 rounded-3xl rounded-bl-none shadow-xl border-4 max-w-xs sm:max-w-md
                ${isTaskDone ? 'border-green-400 shadow-green-200' : 'border-[#8B5E3C] shadow-orange-200'}
            `}
        >
            {/* Quest Header */}
            <div className="text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                {isTaskDone ? (
                    <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 size={14} /> QUEST COMPLETE!
                    </span>
                ) : (
                    <span className="text-[#8B5E3C]/60 flex items-center gap-1">
                        <MessageCircle size={14} /> CURRENT GOAL: STEP {questStep + 1}
                    </span>
                )}
            </div>

            {/* Quest Text */}
            <p className="text-base font-bold text-slate-700 leading-snug mb-4">
                {currentQuest.text}
            </p>

            {/* Action Button */}
            {isTaskDone && questStep < MAIN_QUESTS.length - 1 ? (
                <button 
                    onClick={handleComplete}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-xl shadow-[0_4px_0_#15803d] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                    <Gift size={20} />
                    {currentQuest.buttonText || "Claim Reward"}
                </button>
            ) : (
                // Progress Bar (Fake or Real)
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: isTaskDone ? '100%' : '30%' }} 
                        className={`h-full rounded-full ${isTaskDone ? 'bg-green-500' : 'bg-orange-300'}`} 
                    />
                </div>
            )}
            
        </motion.div>
      </AnimatePresence>

    </div>
  );
}