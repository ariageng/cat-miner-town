'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { X, Coins, Sparkles, Plus, FlaskConical, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CraftingModal({ isOpen, onClose }: Props) {
  const { inventory, sellItem, combineItems, playTTS, playSound } = useGameStore();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<'market' | 'lab'>('market'); // 'market' 或 'lab'
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]); // 存的是背包里的索引(index)
  const [resultMsg, setResultMsg] = useState<{success: boolean, char?: string, name?: string} | null>(null);

  if (!isOpen) return null;

  // --- 🛒 市场逻辑 ---
  const handleSell = (index: number) => {
    // 🔥 新增：播放金币音效
    playSound('coin');
    sellItem(index);
    // 如果正在选中的东西被卖了，清理一下选择状态
    if (selectedIndices.includes(index)) {
      setSelectedIndices(prev => prev.filter(i => i !== index));
    }
  };

  // --- ⚗️ 实验室逻辑 ---
  const toggleSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      // 如果已选，取消选择
      setSelectedIndices(prev => prev.filter(i => i !== index));
    } else {
      // 如果未选，且没满2个，添加选择
      if (selectedIndices.length < 2) {
        setSelectedIndices(prev => [...prev, index]);
      }
    }
  };

  const handleCombine = () => {
    if (selectedIndices.length !== 2) return;
    
    // 调用 Store 的合成逻辑
    const result = combineItems(selectedIndices[0], selectedIndices[1]);
    
    if (result.success && result.newItem) {
      // 成功！
      setResultMsg({ success: true, char: result.newItem.char, name: result.newItem.name });
      playTTS(result.newItem.char); // 朗读
    } else {
      // 失败
      playSound('fail');
      setResultMsg({ success: false });
    }
    
    // 稍微延迟后清空状态
    setSelectedIndices([]); 
    setTimeout(() => setResultMsg(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="bg-[#FFF8E7] w-full max-w-2xl h-[650px] rounded-3xl shadow-2xl border-4 border-[#8B5E3C] flex flex-col overflow-hidden relative"
      >
        
        {/* --- 顶部 Tab 切换 --- */}
        <div className="flex border-b-2 border-[#8B5E3C]/20 bg-white">
            <button 
                onClick={() => setActiveTab('market')}
                className={`flex-1 p-4 font-black text-lg flex items-center justify-center gap-2 transition-colors relative
                    ${activeTab === 'market' ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:bg-slate-50'}`}
            >
                <Coins size={20} /> Market
                {activeTab === 'market' && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500"></div>}
            </button>
            <button 
                onClick={() => { setActiveTab('lab'); setSelectedIndices([]); }}
                className={`flex-1 p-4 font-black text-lg flex items-center justify-center gap-2 transition-colors relative
                    ${activeTab === 'lab' ? 'text-purple-600 bg-purple-50' : 'text-slate-400 hover:bg-slate-50'}`}
            >
                <FlaskConical size={20} /> Lab
                {activeTab === 'lab' && <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500"></div>}
            </button>
            
            {/* 关闭按钮 */}
            <button onClick={onClose} className="px-6 border-l-2 border-[#8B5E3C]/20 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <X />
            </button>
        </div>

        {/* --- 内容区域 --- */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#FFF8E7]">
            
            {/* ================= 🛒 市场模式 (卖东西) ================= */}
            {activeTab === 'market' && (
                <div className="flex flex-col h-full">
                    <div className="mb-4 text-center text-[#8B5E3C]/60 font-bold text-sm uppercase tracking-widest">
                        Sell duplicate items for Gold
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-20">
                        {inventory.length === 0 && (
                            <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center">
                                <span className="text-4xl mb-2">🕸️</span>
                                Backpack is empty
                            </div>
                        )}
                        
                        {inventory.map((item, index) => (
                            <motion.div 
                                layout
                                key={`${item.id}-${index}`} 
                                className="bg-white p-3 rounded-2xl shadow-sm border-2 border-[#8B5E3C]/10 flex flex-col items-center gap-3 group hover:border-green-300 transition-all"
                            >
                                <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-3xl font-serif text-slate-700">
                                    {item.char}
                                </div>
                                <div className="w-full">
                                    <div className="flex justify-between text-xs text-slate-400 font-bold mb-1 px-1">
                                        <span>{item.name}</span>
                                        <span className="text-orange-400">{item.type === 'basic' ? 'Basic' : 'Rare'}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleSell(index)}
                                        className="w-full py-2 bg-green-100 text-green-700 text-sm font-black rounded-xl hover:bg-green-500 hover:text-white hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1"
                                    >
                                        <Coins size={14} /> ${item.type === 'basic' ? 1 : 5}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* ================= ⚗️ 实验室模式 (合成) ================= */}
            {activeTab === 'lab' && (
                <div className="flex flex-col h-full">
                    
                    {/* 1. 合成台显示区 */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl border-4 border-purple-100 mb-8 relative overflow-hidden min-h-[200px] flex flex-col items-center justify-center">
                         
                         {/* 背景装饰 */}
                         <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,#9333ea_1px,transparent_1px)] bg-[length:10px_10px]"></div>

                         <div className="flex items-center gap-2 sm:gap-6 relative z-10">
                            {/* 插槽 1 */}
                            <SlotBox item={selectedIndices[0] !== undefined ? inventory[selectedIndices[0]] : null} />
                            
                            <Plus size={32} className="text-purple-300" />
                            
                            {/* 插槽 2 */}
                            <SlotBox item={selectedIndices[1] !== undefined ? inventory[selectedIndices[1]] : null} />
                            
                            <ArrowRight size={32} className="text-purple-300" />

                            {/* 结果预览 (问号) */}
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-dashed border-purple-200 bg-purple-50 flex items-center justify-center">
                                <Sparkles className="text-purple-300 animate-pulse" />
                            </div>
                         </div>
                         
                         <button 
                            disabled={selectedIndices.length !== 2}
                            onClick={handleCombine}
                            className={`
                                mt-8 px-10 py-3 rounded-full font-black text-lg shadow-xl transition-all flex items-center gap-2 z-10
                                ${selectedIndices.length === 2 
                                    ? 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105 hover:shadow-purple-500/30 cursor-pointer' 
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }
                            `}
                         >
                            <FlaskConical size={20} />
                            COMBINE
                         </button>

                         {/* ✨ 结果反馈遮罩 (合成成功/失败时显示) */}
                         <AnimatePresence>
                            {resultMsg && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-4"
                                >
                                    {resultMsg.success ? (
                                        <>
                                            <motion.div 
                                                initial={{ scale: 0.5, rotate: -180 }} 
                                                animate={{ scale: 1, rotate: 0 }}
                                                className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-3xl flex items-center justify-center text-6xl font-serif text-white shadow-2xl mb-4"
                                            >
                                                {resultMsg.char}
                                            </motion.div>
                                            <h3 className="text-2xl font-black text-slate-800">Success!</h3>
                                            <p className="text-purple-500 font-bold text-lg">New Character: {resultMsg.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <motion.div 
                                                initial={{ x: -10 }} animate={{ x: [0, -10, 10, -10, 10, 0] }}
                                                className="text-6xl mb-2"
                                            >
                                                💥
                                            </motion.div>
                                            <h3 className="text-xl font-bold text-slate-500">Fusion Failed</h3>
                                            <p className="text-sm text-slate-400">These items cannot be combined.</p>
                                        </>
                                    )}
                                </motion.div>
                            )}
                         </AnimatePresence>
                    </div>

                    {/* 2. 物品选择区 */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-3 px-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select 2 Items</span>
                            <span className="text-xs font-bold text-purple-600">{selectedIndices.length}/2 Selected</span>
                        </div>
                        
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 overflow-y-auto pb-4">
                            {inventory.map((item, index) => {
                                const isSelected = selectedIndices.includes(index);
                                const isDisabled = !isSelected && selectedIndices.length >= 2;

                                return (
                                    <button 
                                        key={`${item.id}-${index}-select`}
                                        onClick={() => toggleSelection(index)}
                                        disabled={isDisabled}
                                        className={`
                                            aspect-square rounded-2xl border-b-4 flex items-center justify-center text-2xl font-serif transition-all relative
                                            ${isSelected 
                                                ? 'bg-purple-500 border-purple-700 text-white translate-y-1 border-b-0 shadow-inner' 
                                                : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:-translate-y-1'
                                            }
                                            ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        {item.char}
                                        {isSelected && (
                                            <div className="absolute top-1 right-1 w-3 h-3 bg-white rounded-full text-purple-500 flex items-center justify-center text-[8px] font-bold">✓</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
}

// 辅助组件：显示插槽的小方块
function SlotBox({ item }: { item: any }) {
    return (
        <div className={`
            w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 flex items-center justify-center text-4xl font-serif transition-all shadow-sm
            ${item 
                ? 'bg-white border-purple-400 text-slate-800' 
                : 'bg-slate-100 border-slate-200 border-dashed text-slate-300'
            }
        `}>
            {item ? item.char : '?'}
        </div>
    );
}