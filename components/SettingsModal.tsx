'use client';

import { useGameStore } from '@/store/gameStore';
import { X, Music, Volume2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: Props) {
  const { bgmVolume, setBgmVolume, sfxVolume, setSfxVolume } = useGameStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border-4 border-slate-200 p-6 relative"
      >
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-700 flex items-center gap-2">
                <Settings className="text-slate-400" /> Settings
            </h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500">
                <X size={18} />
            </button>
        </div>

        <div className="space-y-6">
            {/* BGM 控制 */}
            <div>
                <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
                    <span className="flex items-center gap-2"><Music size={16} /> Music (BGM)</span>
                    <span>{Math.round(bgmVolume * 100)}%</span>
                </div>
                <input 
                    type="range" min="0" max="1" step="0.05"
                    value={bgmVolume}
                    onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-400 hover:accent-orange-500"
                />
            </div>

            {/* 音效 控制 */}
            <div>
                <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
                    <span className="flex items-center gap-2"><Volume2 size={16} /> Sound Effects (SFX)</span>
                    <span>{Math.round(sfxVolume * 100)}%</span>
                </div>
                <input 
                    type="range" min="0" max="1" step="0.05"
                    value={sfxVolume}
                    onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                    className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-400 hover:accent-blue-500"
                />
            </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-300 font-bold">
            Cat Town v1.0.0
        </div>

      </motion.div>
    </div>
  );
}