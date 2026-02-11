'use client';
import { motion } from 'framer-motion';
import { TILE_WIDTH, TILE_HEIGHT } from './IsoTile';
import { TOWN_BUILDINGS } from '@/data/townMap';
import { SHOP_ITEMS } from '@/data/shopItems'; // 引入商店数据
import { useGameStore } from '@/store/gameStore';

interface Props {
  row: number;
  col: number;
  buildingId: string;
  onClick: () => void;
}

// 🎨 如果没有立绘，用这些 Emoji 代替
const BUILDING_ASSETS: Record<string, { emoji: string, scale: number, yOffset: number }> = {
  // 新商店物品
  'cat_tree':   { emoji: '🌳', scale: 2.5, yOffset: -20 },
  'cat_statue': { emoji: '🗿', scale: 2.5, yOffset: -20 },
  'cat_house':  { emoji: '🏡', scale: 3.5, yOffset: -30 },
  'art_lab':    { emoji: '🏯', scale: 4.0, yOffset: -40 }, // 写字楼用个城堡代替先
  // 也可以给旧建筑定义 Emoji，防止图片加载失败
  'mine':       { emoji: '⛏️', scale: 3, yOffset: -20 },
  'shop':       { emoji: '🏪', scale: 3, yOffset: -20 },
  'museum':     { emoji: '🏛️', scale: 3, yOffset: -20 },
  'lab':        { emoji: '⚗️', scale: 3, yOffset: -20 },
};

export default function IsoBuilding({ row, col, buildingId, onClick }: Props) {
  const { playSound } = useGameStore();

  // 1. 查找建筑数据 (先找初始地图的，再找商店的)
  // 必须合并查找，因为新建筑的数据在 SHOP_ITEMS 里
  const building = 
    TOWN_BUILDINGS.find(b => b.id === buildingId) || 
    SHOP_ITEMS.find(b => b.id === buildingId);

  if (!building) return null;

  // 2. 计算坐标
  // 注意：SHOP_ITEMS 里的 size 格式和 TOWN_BUILDINGS 是一样的，直接用
  const rows = building.size.rows;
  const cols = building.size.cols;
  
  const x = (col - row) * (TILE_WIDTH / 2);
  const y = (col + row) * (TILE_HEIGHT / 2);
  // zIndex 必须精细计算，防止遮挡关系错误
  const zIndex = (row + col) * 10 + 5; 

  // 3. 获取外观配置 (Emoji)
  const asset = BUILDING_ASSETS[buildingId];
  const useEmoji = !!asset; // 如果在列表里，就优先用 Emoji (方便测试)，或者你可以反过来，只在图片加载失败时用

  // 这里的宽度是为了点击区域
  const containerWidth = 100 + (cols - 1) * 20;

  return (
    <motion.div
      className="absolute flex justify-center items-center cursor-pointer pointer-events-auto"
      style={{
        left: x,
        top: y,
        zIndex: zIndex,
        width: containerWidth,
        transform: 'translate(-50%, -50%)', 
      }}
      initial={{ opacity: 0, scale: 0.5, y: -50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      
      onClick={(e) => {
        e.stopPropagation(); 
        onClick();
      }}
      onMouseEnter={() => playSound('hover')}
    >
      
      <div 
        className="relative group flex flex-col items-center"
        style={{
            // 如果是 Emoji，往上提一点，因为 Emoji 也是有基线的
            transform: `translate(0px, ${asset?.yOffset || 0}px)`
        }}
      >
          {/* 悬浮动效容器 */}
          <div 
            className="relative transition-transform duration-300 group-hover:-translate-y-2 group-hover:scale-110"
          >
             {/* 气泡提示 */}
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 border-2 border-orange-100">
                <span className="text-sm font-black text-slate-700">{building.name}</span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
             </div>

             {/* 🔥核心渲染逻辑：有图用图，没图用 Emoji */}
             {useEmoji ? (
                 <span 
                    className="drop-shadow-2xl filter" 
                    style={{ fontSize: `${asset.scale}rem`, lineHeight: 1 }}
                 >
                     {asset.emoji}
                 </span>
             ) : (
                 <img 
                    src={`/buildings/${building.id}.png`} 
                    alt={building.name}
                    className="w-full object-contain pixel-art"
                    style={{
                        height: `${80 + (rows - 1) * 40}px`,
                        filter: 'drop-shadow(0 4px 0 rgba(0,0,0,0.1))'
                    }}
                    // 如果图片加载失败，可以在这里处理，但现在我们直接由 useEmoji 变量控制
                 />
             )}
          </div>
      </div>
    </motion.div>
  );
}