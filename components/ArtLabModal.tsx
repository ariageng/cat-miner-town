'use client';

import { useState, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { X, RefreshCw, PenTool, Eraser } from 'lucide-react';
import { motion } from 'framer-motion';
import { BASIC_CHARS } from '@/data/characters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtLabModal({ isOpen, onClose }: Props) {
  const { inventory, transmuteItem, playSound } = useGameStore();
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [targetChar, setTargetChar] = useState<string>('水'); // 默认目标
  const [isDrawing, setIsDrawing] = useState(false);
  
  // 简单的画布模拟
  const canvasRef = useRef<HTMLDivElement>(null);
  const [inkPoints, setInkPoints] = useState<{x:number, y:number}[]>([]);

  if (!isOpen) return null;

  const handleDrawStart = () => setIsDrawing(true);
  const handleDrawEnd = () => setIsDrawing(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    setInkPoints(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };

  const handleTransmute = () => {
    if (!selectedMaterialId) return;
    if (inkPoints.length < 10) {
        alert("Please write something on the paper first!");
        return;
    }
    
    // 执行转换
    const result = transmuteItem(selectedMaterialId, targetChar);
    if (result.success) {
        setInkPoints([]); // 清空画布
        setSelectedMaterialId(null); // 清空选择
    } else {
        alert(result.msg);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl flex overflow-hidden border-4 border-purple-200"
      >
        {/* 左侧：控制区 */}
        <div className="w-1/3 bg-slate-50 p-6 border-r flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-black text-purple-600 flex items-center gap-2">
                    <PenTool /> Art Lab
                </h2>
                <p className="text-xs text-slate-400 mt-1">Transmute matter with calligraphy.</p>
            </div>

            {/* 1. 选择原材料 */}
            <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">1. Select Material</h3>
                <div className="grid grid-cols-4 gap-2">
                    {inventory.map((item, index) => (
                        <button
                            key={`${item.id}-${index}`}
                            onClick={() => setSelectedMaterialId(item.id)}
                            className={`aspect-square rounded-lg border-2 flex items-center justify-center text-xl font-serif transition-all
                                ${selectedMaterialId === item.id ? 'border-purple-500 bg-purple-100' : 'border-slate-200 bg-white'}
                            `}
                        >
                            {item.char}
                        </button>
                    ))}
                    {inventory.length === 0 && <span className="text-xs text-slate-400 col-span-4">No materials...</span>}
                </div>
            </div>

            {/* 2. 选择目标 */}
            <div className="flex-1">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">2. Target Element</h3>
                <div className="flex flex-wrap gap-2 h-32 overflow-y-auto content-start">
                    {/* 🔥 修复重点：这里改成了 !c.note，不再使用 disableTTS */}
                    {BASIC_CHARS.filter(c => !c.note).map(c => (
                        <button 
                            key={c.id} 
                            onClick={() => setTargetChar(c.char)}
                            className={`px-3 py-1 rounded-full text-sm font-bold border transition-all
                                ${targetChar === c.char ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-slate-600 border-slate-200'}
                            `}
                        >
                            {c.char}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* 右侧：绘图区 */}
        <div className="flex-1 bg-[#FFF8E7] p-8 flex flex-col items-center justify-center relative">
            <div className="absolute top-4 right-4 text-purple-300 pointer-events-none text-9xl font-serif opacity-20">
                {targetChar}
            </div>

            <div 
                ref={canvasRef}
                onMouseDown={handleDrawStart}
                onMouseUp={handleDrawEnd}
                onMouseLeave={handleDrawEnd}
                onMouseMove={handleMouseMove}
                className="w-full max-w-[400px] aspect-square bg-white shadow-xl border-4 border-slate-800 rounded-sm cursor-crosshair relative touch-none"
            >
                {/* 墨迹渲染 */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {inkPoints.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1e293b" />
                    ))}
                </svg>
                <div className="absolute bottom-2 right-2 text-xs text-slate-300 select-none">Draw Here</div>
            </div>

            <div className="flex gap-4 mt-8">
                <button onClick={() => setInkPoints([])} className="flex items-center gap-2 px-4 py-2 text-slate-500 hover:text-red-500 transition-colors">
                    <Eraser size={18} /> Clear
                </button>
                <button 
                    onClick={handleTransmute}
                    disabled={!selectedMaterialId}
                    className={`
                        px-8 py-3 rounded-full font-black text-lg flex items-center gap-2 shadow-xl transition-all
                        ${selectedMaterialId 
                            ? 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }
                    `}
                >
                    <RefreshCw size={20} /> Transmute
                </button>
            </div>
        </div>

        <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-red-50 text-slate-400 hover:text-red-500">
            <X />
        </button>
      </motion.div>
    </div>
  );
}