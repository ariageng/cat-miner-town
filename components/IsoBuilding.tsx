'use client';

import { motion } from 'framer-motion';
import { TOWN_BUILDINGS } from '@/data/townMap';
import { TILE_WIDTH, TILE_HEIGHT } from './IsoTile';
import { useGameStore } from '@/store/gameStore'; // 🔥 1. 引入 store

interface Props {
  row: number;
  col: number;
  buildingId: string;
  onClick: () => void;
}

export default function IsoBuilding({ row, col, buildingId, onClick }: Props) {
  const { playSound } = useGameStore(); // 🔥 2. 获取 playSound
  
  const building = TOWN_BUILDINGS.find(b => b.id === buildingId);
  if (!building) return null;

  // 1. 基础坐标
  const rows = building.size.rows;
  const cols = building.size.cols;
  const centerR = row + (rows - 1) / 2;
  const centerC = col + (cols - 1) / 2;
  const x = (centerC - centerR) * (TILE_WIDTH / 2);
  const y = (centerC + centerR) * (TILE_HEIGHT / 2);

  // 2. 🔥 智能层级 (Smart Z-Index)
  // 以前是粗暴的 +20，现在我们根据建筑“脚底板”所在的格子精确计算
  // 建筑 Z = (最前排的行 + 最前排的列) * 10 + 1(稍微高一点点)
  // 这样它会被前一行的地砖 (Z+10) 遮挡，从而产生“陷在环境里”的感觉
  const zIndex = (row + rows - 1 + col + cols - 1) * 10 + 5;

  // 3. 图片宽度
  const imgWidth = 140 + (cols - 1) * 50 + (rows - 1) * 50;

  return (
    <motion.div
      className="absolute flex flex-col items-center justify-end cursor-pointer pointer-events-auto"
      style={{
        left: x,
        top: y,
        zIndex: zIndex,
        width: 0, 
        height: 0,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2 + (row + col) * 0.05 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}

      // 🔥 3. 直接使用 playSound('hover')
      onMouseEnter={() => playSound('hover')}
    >
      <div 
        className="relative group flex flex-col items-center"
        style={{
            transform: `translate(${building.offset?.x || 0}px, ${building.offset?.y || 0}px)`
        }}
      >

          {/* 建筑图片 */}
          <div 
            className="relative transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-105"
            style={{ marginBottom: '15px' }}
          >
            <img 
                src={`/buildings/${buildingId}.png`} 
                alt={building.name}
                className="object-contain filter drop-shadow-xl max-w-none h-auto"
                style={{ width: `${imgWidth}px` }}
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = "text-4xl animate-bounce";
                    fallback.innerHTML = building.emoji; 
                    e.currentTarget.parentElement?.appendChild(fallback);
                }}
            />
            
            {/* 标签 */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
                {building.name}
            </div>
          </div>
      </div>
    </motion.div>
  );
}