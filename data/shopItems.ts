export interface ShopItem {
    id: string;
    name: string;
    type: 'decoration' | 'functional' | 'expansion' | 'unique';
    price: number;
    size: { rows: number; cols: number }; // 占地面积
    description: string;
    maxCount?: number; // 限制购买数量 (比如 Art Lab 只能买1个)
    tierPrices?: number[]; // 阶梯价格 (给扩建用地)
  }
  
  export const SHOP_ITEMS: ShopItem[] = [
    // 1. Cat Tree (装饰 1x1)
    {
      id: 'cat_tree',
      name: 'Cat Tree',
      type: 'decoration',
      price: 100,
      size: { rows: 1, cols: 1 },
      description: 'A simple play place for kitties.'
    },
    // 2. Cat Statue (装饰 1x1)
    {
      id: 'cat_statue',
      name: 'Cat Statue',
      type: 'decoration',
      price: 200,
      size: { rows: 1, cols: 1 },
      description: 'A golden statue honoring the Great Meow.'
    },
    // 3. Cat House (居民 2x2)
    {
      id: 'cat_house',
      name: 'Cat House',
      type: 'functional',
      price: 500,
      size: { rows: 2, cols: 2 },
      description: 'Comes with a new Cat Resident!'
    },
    // 4. Art Lab (写字楼 3x3, 唯一)
    {
      id: 'art_lab',
      name: 'Art Lab',
      type: 'unique',
      price: 100,
      size: { rows: 3, cols: 3 },
      description: 'Transmute ores by writing Hanzi!',
      maxCount: 1
    },
    // 5. Map Expansion (扩建)
    {
      id: 'expansion',
      name: 'Expand Land',
      type: 'expansion',
      price: 100, // 初始展示价格
      tierPrices: [100, 500, 2000, 10000], // 4次扩建的价格
      size: { rows: 0, cols: 0 },
      description: 'Expand the town borders.'
    }
  ];