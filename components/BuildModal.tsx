'use client';

import { useGameStore } from '@/store/gameStore';
import { X, ShoppingBag, Map as MapIcon, Hammer, Palette, Home, Cat } from 'lucide-react';
import { motion } from 'framer-motion';
import { SHOP_ITEMS, ShopItem } from '@/data/shopItems';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function BuildModal({ isOpen, onClose }: Props) {
  const { gold, mapLevel, enterPlacementMode, expandMap, placedBuildings, playSound } = useGameStore();

  if (!isOpen) return null;

  const handleBuy = (item: ShopItem) => {
    // 1. 扩建逻辑
    if (item.type === 'expansion') {
        const result = expandMap();
        if (!result.success) {
            playSound('fail');
            alert(result.msg); // 简单弹窗提示
        } else {
            onClose(); // 成功后关闭
        }
        return;
    }

    // 2. 建筑逻辑 -> 进入放置模式
    if (gold < item.price) {
        playSound('fail');
        alert("Not enough Gold!");
        return;
    }
    
    // 检查唯一建筑
    if (item.type === 'unique' && placedBuildings.some(b => b.typeId === item.id)) {
        playSound('fail');
        alert("You already own this!");
        return;
    }

    playSound('click');
    enterPlacementMode(item.id);
    onClose(); // 关闭商店，去地图上放
  };

  // 获取图标辅助函数
  const getIcon = (type: string) => {
    switch (type) {
        case 'decoration': return <Cat size={20} className="text-pink-500" />;
        case 'functional': return <Home size={20} className="text-orange-500" />;
        case 'unique': return <Palette size={20} className="text-purple-500" />;
        case 'expansion': return <MapIcon size={20} className="text-green-500" />;
        default: return <Hammer size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => e.stopPropagation()}>
      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="bg-[#FFF8E7] w-full max-w-3xl h-[80vh] rounded-3xl shadow-2xl border-4 border-[#8B5E3C] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-white p-5 flex items-center justify-between border-b-2 border-[#8B5E3C]/20">
             <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><ShoppingBag size={24} /></div>
                <div>
                    <h2 className="text-xl font-black text-slate-800 uppercase">Town Shop</h2>
                    <p className="text-xs text-slate-400 font-bold">Decorate & Expand</p>
                </div>
             </div>
             <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 transition-colors">
                <X size={20} />
             </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SHOP_ITEMS.map((item) => {
                // 计算当前扩建价格
                let displayPrice = item.price;
                let isMaxLevel = false;
                if (item.type === 'expansion' && item.tierPrices) {
                    if (mapLevel >= item.tierPrices.length) {
                        isMaxLevel = true;
                    } else {
                        displayPrice = item.tierPrices[mapLevel];
                    }
                }

                // 检查是否已拥有唯一建筑
                const isOwned = item.type === 'unique' && placedBuildings.some(b => b.typeId === item.id);

                return (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border-2 border-[#8B5E3C]/10 flex gap-4 hover:border-orange-300 transition-all shadow-sm">
                        {/* 图片占位 */}
                        <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center text-4xl shrink-0">
                            {/* 这里以后换成 <img src={`/shop/${item.id}.png`} /> */}
                            {item.id === 'cat_tree' && '🧶'}
                            {item.id === 'cat_statue' && '🗿'}
                            {item.id === 'cat_house' && '🏠'}
                            {item.id === 'art_lab' && '🎨'}
                            {item.id === 'expansion' && '🗺️'}
                        </div>
                        
                        <div className="flex flex-col flex-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-black text-slate-700">{item.name}</h3>
                                {getIcon(item.type)}
                            </div>
                            <p className="text-xs text-slate-400 font-bold mt-1 line-clamp-2">{item.description}</p>
                            <div className="mt-auto pt-3 flex items-center justify-between">
                                <div className="text-xs font-bold text-slate-400">
                                    {item.type === 'expansion' 
                                        ? `Current Level: ${mapLevel}/4`
                                        : `Size: ${item.size.rows}x${item.size.cols}`
                                    }
                                </div>
                                <button 
                                    onClick={() => handleBuy(item)}
                                    disabled={gold < displayPrice || isMaxLevel || isOwned}
                                    className={`
                                        px-4 py-1.5 rounded-lg text-sm font-black transition-all
                                        ${(gold < displayPrice || isMaxLevel || isOwned)
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            : 'bg-green-100 text-green-700 hover:bg-green-500 hover:text-white hover:shadow-lg'
                                        }
                                    `}
                                >
                                    {isMaxLevel ? 'MAX' : isOwned ? 'OWNED' : `$${displayPrice}`}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

      </motion.div>
    </div>
  );
}