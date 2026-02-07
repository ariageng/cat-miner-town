'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { X, FlaskConical, Sparkles } from 'lucide-react';
import { CharData } from '@/data/characters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CraftingModal({ isOpen, onClose }: Props) {
  const { inventory, craft } = useGameStore();
  
  // 研究台上的两个插槽
  const [slot1, setSlot1] = useState<string | null>(null);
  const [slot2, setSlot2] = useState<string | null>(null);
  
  // 合成成功时的展示数据
  const [successResult, setSuccessResult] = useState<CharData | null>(null);
  const [errorShake, setErrorShake] = useState(0);

  // 把背包里的东西放到插槽上
  const handleSelectChar = (char: string) => {
    if (!slot1) setSlot1(char);
    else if (!slot2) setSlot2(char);
  };

  // 点击插槽把东西拿下来
  const clearSlot = (slotNum: 1 | 2) => {
    if (slotNum === 1) setSlot1(null);
    else setSlot2(null);
  };

  // 🔥 核心动作：点击合成按钮
  const handleCraft = () => {
    if (slot1 && slot2) {
      const result = craft(slot1, slot2);
      if (result) {
        // 成功！
        setSuccessResult(result);
        setSlot1(null);
        setSlot2(null);
        // 播放个成功音效 (可选)
      } else {
        // 失败：晃动一下
        setErrorShake(prev => prev + 1);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#FDF6E3] w-full max-w-md rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden relative"
      >
        {/* 关闭按钮 */}
        <button onClick={onClose} className="absolute top-4 right-4 text-amber-800 hover:bg-amber-100 p-1 rounded-full">
          <X size={24} />
        </button>

        {/* 标题 */}
        <div className="bg-amber-100 p-4 text-center border-b-2 border-amber-200">
          <h2 className="text-xl font-black text-amber-800 flex items-center justify-center gap-2">
            <FlaskConical /> Research Lab
          </h2>
        </div>

        <div className="p-6 flex flex-col gap-6 items-center">
          
          {/* --- 合成台 (两个框) --- */}
          <div className="flex items-center gap-4">
            {/* Slot 1 */}
            <motion.div 
              onClick={() => clearSlot(1)}
              animate={{ x: errorShake % 2 === 0 ? 0 : 10 }} // 错误时晃动
              className={`w-20 h-20 rounded-xl border-4 border-dashed flex items-center justify-center text-3xl font-bold cursor-pointer transition-all ${slot1 ? 'bg-white border-amber-400' : 'border-amber-200 bg-amber-50/50'}`}
            >
              {slot1}
            </motion.div>

            <span className="text-2xl font-black text-amber-300">+</span>

            {/* Slot 2 */}
            <motion.div 
              onClick={() => clearSlot(2)}
              animate={{ x: errorShake % 2 === 0 ? 0 : -10 }}
              className={`w-20 h-20 rounded-xl border-4 border-dashed flex items-center justify-center text-3xl font-bold cursor-pointer transition-all ${slot2 ? 'bg-white border-amber-400' : 'border-amber-200 bg-amber-50/50'}`}
            >
              {slot2}
            </motion.div>
          </div>

          {/* 合成按钮 */}
          <button 
            onClick={handleCraft}
            disabled={!slot1 || !slot2}
            className="bg-amber-500 text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Sparkles size={18} /> COMBINE
          </button>

          {/* 背包选择区 */}
          <div className="w-full bg-white/50 rounded-xl p-3 min-h-[100px]">
            <p className="text-xs font-bold text-amber-800/50 mb-2 uppercase">Select Ingredients:</p>
            <div className="flex flex-wrap gap-2">
              {inventory.map((char, i) => (
                <button 
                  key={i}
                  onClick={() => handleSelectChar(char)}
                  className="w-10 h-10 bg-white border border-amber-100 rounded-lg shadow-sm font-bold text-slate-700 hover:scale-110 active:scale-90 transition-transform"
                >
                  {char}
                </button>
              ))}
              {inventory.length === 0 && <span className="text-sm text-slate-400">Go mine some rocks first!</span>}
            </div>
          </div>
        </div>

        {/* --- 成功弹窗 (覆盖在上面) --- */}
        <AnimatePresence>
          {successResult && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-amber-500/95 flex flex-col items-center justify-center text-white z-10"
            >
              <h3 className="text-2xl font-bold mb-4">New Word Discovered!</h3>
              <div className="bg-white text-amber-600 w-32 h-32 rounded-3xl flex items-center justify-center text-6xl font-black shadow-2xl mb-4">
                {successResult.char}
              </div>
              <p className="text-2xl font-bold">{successResult.pinyin}</p>
              <p className="text-lg opacity-90">{successResult.meaning}</p>
              
              <button 
                onClick={() => setSuccessResult(null)}
                className="mt-8 bg-white text-amber-600 font-bold px-6 py-2 rounded-full shadow-lg"
              >
                Awesome!
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}