'use client';

import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Gem, Backpack, Settings, Plus, Minus, Zap } from 'lucide-react';
import { INITIAL_MAP_LAYOUT } from '@/data/gridMap';
import IsoTile from './IsoTile';
import CatGuide from './CatGuide';
import IsoBuilding from './IsoBuilding';

// 引入弹窗
import MiningModal from './MiningModal';
import CraftingModal from './CraftingModal';
import GalleryModal from './GalleryModal';
import BuildModal from './BuildModal';
import SettingsModal from './SettingsModal';
import ArtLabModal from './ArtLabModal'; // 🔥 新引入写字楼弹窗

export default function GameScene() {
  const { 
    gold, inventory, stamina, maxStamina, regenerateStamina, bgmVolume,
    mapLevel, placedBuildings, residents, // 获取建造与地图数据
    isPlacementMode, placementItem, cancelPlacement, confirmPlacement, // 获取放置模式相关状态
    playSound
  } = useGameStore(); 
  
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  // 🎥 视口控制
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // 🎵 BGM 逻辑
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // 🖱️ 放置模式下的鼠标悬停格子坐标
  const [hoverTile, setHoverTile] = useState<{row: number, col: number} | null>(null);

  useEffect(() => {
    const timer = setInterval(() => regenerateStamina(), 3000);
    return () => clearInterval(timer);
  }, [regenerateStamina]);

  // 初始化 BGM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      bgmRef.current = new Audio('/bgm.mp3'); 
      bgmRef.current.loop = true;
    }
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  // 🔥 监听全局音量变化，实时调整 BGM 音量
  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = bgmVolume;
      if (bgmVolume > 0 && bgmRef.current.paused) {
         bgmRef.current.play().catch(() => {});
      }
      if (bgmVolume === 0) {
          bgmRef.current.pause();
      }
    }
  }, [bgmVolume]);

  // --- 🗺️ 动态地图计算 ---
  // 基础地图大小加上扩建等级 (每次四周扩1圈，所以尺寸+2)
  const baseRows = INITIAL_MAP_LAYOUT.length;
  const baseCols = INITIAL_MAP_LAYOUT[0]?.length || 10;
  const currentRows = baseRows + mapLevel * 2;
  const currentCols = baseCols + mapLevel * 2;
  // 原始建筑的坐标偏移量
  const offset = mapLevel;

  // --- 🖱️ 拖拽与放置逻辑 ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只响应左键

    // 🔥 如果在放置模式且鼠标在一个格子上，点击就是放置建筑
    if (isPlacementMode && hoverTile) {
        const result = confirmPlacement(hoverTile.row, hoverTile.col);
        if (!result.success) {
            playSound('fail');
            alert(result.msg);
        }
        return;
    }

    // 否则执行拖拽地图
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    setPosition(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    const scaleAmount = -e.deltaY * 0.001;
    setZoom(z => Math.min(Math.max(0.5, z + scaleAmount), 2.5));
  };

  // ================= 渲染函数 =================

  // 1. 渲染动态地图格子
  const renderTiles = () => {
    const tiles = [];
    for (let r = 0; r < currentRows; r++) {
        for (let c = 0; c < currentCols; c++) {
            tiles.push(
                <IsoTile 
                    key={`tile-${r}-${c}`} 
                    row={r} 
                    col={c} 
                    // 传递给 IsoTile，让它在被 Hover 时告诉我们坐标
                    onHover={() => setHoverTile({row: r, col: c})} 
                />
            );
        }
    }
    return tiles;
  };

  // 2. 渲染静态和动态建筑
  const renderBuildings = () => {
    const buildings = [];

    // ① 原有的主线建筑（带有偏移量，使其永远在地图中心）
    INITIAL_MAP_LAYOUT.forEach((rowArray, r) => {
        rowArray.forEach((content, c) => {
            if (typeof content === 'string' && content !== '') {
                buildings.push(
                    <IsoBuilding
                        key={`init-bldg-${r}-${c}`}
                        row={r + offset} 
                        col={c + offset}
                        buildingId={content}
                        onClick={() => setActiveFeature(content)}
                    />
                );
            }
        });
    });

    // ② 玩家放置的建筑
    placedBuildings.forEach((b) => {
        buildings.push(
            <IsoBuilding
                key={b.id}
                row={b.row}
                col={b.col}
                buildingId={b.typeId}
                onClick={() => {
                    // 如果是写字楼，打开写字板；否则播放音效
                    if (b.typeId === 'art_lab') {
                        setActiveFeature('art_lab');
                    } else {
                        playSound('click');
                    }
                }}
            />
        );
    });

    // ③ 放置模式下的“幽灵建筑”预览
    if (isPlacementMode && placementItem && hoverTile) {
        buildings.push(
            <div 
                key="ghost-building" 
                className="pointer-events-none opacity-50 grayscale transition-all duration-75"
                style={{ zIndex: 9999 }} // 永远在最上层
            >
                <IsoBuilding
                    row={hoverTile.row}
                    col={hoverTile.col}
                    buildingId={placementItem}
                    onClick={() => {}}
                />
            </div>
        );
    }

    return buildings;
  };

  // 3. 渲染猫咪居民
  const renderResidents = () => {
    // 假设格子宽120，高60。如果你的 IsoTile 定义不同，请同步修改。
    const tw = 120; 
    const th = 60;

    return residents.map((cat, i) => {
        // 让猫在初始建筑周围随机位置（伪随机）
        const randomR = 5 + offset + Math.sin(i) * 2;
        const randomC = 5 + offset + Math.cos(i) * 2;
        const x = (randomC - randomR) * (tw / 2);
        const y = (randomC + randomR) * (th / 2);

        return (
            <div 
                key={cat.id}
                className="absolute w-8 h-8 pointer-events-none z-[50]"
                style={{
                    left: x, top: y,
                    transform: 'translate(-50%, -100%)',
                    animation: `bounce 2s infinite ${i * 0.2}s` // 错开动画时间
                }}
            >
                <span className="text-3xl drop-shadow-md">🐱</span>
            </div>
        );
    });
  };

  return (
    <div 
      className="w-screen h-screen bg-[#FFF8E7] overflow-hidden relative font-sans cursor-move active:cursor-grabbing text-slate-800 select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      
      {/* 背景 */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#A8A29E_1px,transparent_1px)] bg-[length:24px_24px] z-0"></div>
      
      {/* 放置模式提示条 */}
      {isPlacementMode && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl z-[60] flex items-center gap-4 animate-bounce pointer-events-auto cursor-default">
              <span className="font-bold">Placement Mode: Click grid to build</span>
              <button 
                onClick={(e) => { e.stopPropagation(); cancelPlacement(); }} 
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full text-xs font-black shadow-sm active:scale-95 transition-all"
              >
                CANCEL
              </button>
          </div>
      )}

      {/* 标题 */}
      <div className="absolute top-24 left-0 w-full text-center z-0 pointer-events-none transition-opacity duration-300" style={{ opacity: Math.max(0, 1.5 - zoom) }}>
          <h1 className="text-6xl font-black text-[#8B5E3C] tracking-tight drop-shadow-sm mb-2">
            Cat Town
          </h1>
          <div className="flex justify-center gap-2">
             <span className="text-3xl animate-bounce delay-75">🐱</span>
             <span className="bg-[#8B5E3C]/10 text-[#8B5E3C] px-3 py-1 rounded-full text-sm font-bold">
                Level 1 Miner
             </span>
          </div>
      </div>

      {/* --- 💎 UI 层 --- */}
      <div className="absolute top-6 left-6 right-6 flex justify-between z-50 pointer-events-auto cursor-default" onMouseDown={(e) => e.stopPropagation()}>
        
        {/* 左侧 */}
        <div className="flex flex-col gap-3">
            <div className="bg-white border-b-4 border-orange-200 rounded-2xl px-5 py-2 flex items-center gap-3 shadow-sm hover:scale-105 transition-transform w-fit select-none">
                <div className="bg-orange-400 p-1.5 rounded-full"><Gem size={18} className="text-white" /></div>
                <span className="font-black text-orange-900 text-xl">{gold}</span>
            </div>
            <div className="bg-white border-b-4 border-yellow-200 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm min-w-[160px] hover:scale-105 transition-transform select-none">
                <div className="bg-yellow-400 p-1.5 rounded-full"><Zap size={18} className="text-white fill-current" /></div>
                <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold text-yellow-800 mb-1">
                        <span>ENERGY</span>
                        <span>{stamina}/{maxStamina}</span>
                    </div>
                    <div className="w-24 h-3 bg-yellow-100 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 transition-all duration-500 ease-out" style={{ width: `${(stamina / maxStamina) * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* 右侧 */}
        <div className="flex gap-3 h-14 items-start">
             <button 
                onClick={() => setActiveFeature('settings')}
                className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center border-b-4 border-slate-200 shadow-sm active:border-b-0 active:translate-y-1 transition-all text-slate-500 hover:bg-slate-50"
             >
                <Settings size={24} />
             </button>
            
            <div className={`bg-white border-b-4 rounded-2xl px-5 h-14 flex items-center gap-3 shadow-sm transition-colors select-none ${inventory.length >= 10 ? 'border-red-200 bg-red-50' : 'border-blue-200'}`}>
                <Backpack size={20} className={inventory.length >= 10 ? 'text-red-500 animate-bounce' : 'text-blue-500'} />
                <span className={`font-black text-xl ${inventory.length >= 10 ? 'text-red-900' : 'text-blue-900'}`}>
                    {inventory.length}/10
                </span>
            </div>
        </div>
      </div>

      {/* 缩放按钮 */}
      <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-50 pointer-events-auto cursor-default" onMouseDown={(e) => e.stopPropagation()}>
        <button onClick={() => setZoom(z => Math.min(z + 0.2, 2.5))} className="w-12 h-12 bg-white rounded-2xl shadow-sm border-b-4 border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all"><Plus size={24} /></button>
        <button onClick={() => setZoom(1)} className="w-12 h-12 bg-white rounded-2xl shadow-sm border-b-4 border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all"><span className="text-xs font-black">1x</span></button>
        <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))} className="w-12 h-12 bg-white rounded-2xl shadow-sm border-b-4 border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:border-b-0 active:translate-y-1 transition-all"><Minus size={24} /></button>
      </div>

      {/* 地图层 */}
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-75 ease-out z-10" style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})` }}>
        <div className="relative">
            {renderTiles()}
            {renderBuildings()}
            {renderResidents()}
        </div>
      </div>

      <CatGuide />

      {/* 弹窗层 */}
      <MiningModal isOpen={activeFeature === 'mine'} onClose={() => setActiveFeature(null)} />
      <CraftingModal isOpen={activeFeature === 'lab'} onClose={() => setActiveFeature(null)} />
      <GalleryModal isOpen={activeFeature === 'museum'} onClose={() => setActiveFeature(null)} />
      <BuildModal isOpen={activeFeature === 'shop'} onClose={() => setActiveFeature(null)} />
      <SettingsModal isOpen={activeFeature === 'settings'} onClose={() => setActiveFeature(null)} />
      
      {/* 🔥 Art Lab (写字楼) 弹窗 */}
      <ArtLabModal isOpen={activeFeature === 'art_lab'} onClose={() => setActiveFeature(null)} />
      
    </div>
  );
}