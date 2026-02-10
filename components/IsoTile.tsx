'use client';
import { motion } from 'framer-motion';

export const TILE_WIDTH = 100;  
export const TILE_HEIGHT = 50; 

interface Props {
  row: number;
  col: number;
  onHover?: () => void; // <--- 新增这行
}

export default function IsoTile({ row, col, onHover }: Props) {
  
  const x = (col - row) * (TILE_WIDTH / 2);
  const y = (col + row) * (TILE_HEIGHT / 2);
  const zIndex = (row + col) * 10;

  return (
    <motion.div
      onMouseEnter={onHover} //<--- 绑定到根 div 上
      className="absolute flex justify-center items-center select-none"
      style={{
        left: x,
        top: y,
        zIndex: zIndex,
        width: 120, // 图片尺寸
        height: 80,
        transform: 'translate(-50%, -50%)', // 居中
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (row + col) * 0.02 }}
    >
        {/* 简单的白砖 */}
        <img 
            src="/tile-white.svg" 
            alt="tile" 
            className="w-full h-full object-contain drop-shadow-sm opacity-90 hover:brightness-110 transition-all" 
            
        />
    </motion.div>
  );
}