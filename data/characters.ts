// data/characters.ts
export interface CharData {
    char: string;
    pinyin: string;
    meaning: string;
  }
  
  // 基础字库 (之后可以无限添加)
  export const BASIC_CHARS: CharData[] = [
    { char: '木', pinyin: 'mù', meaning: 'Wood' },
    { char: '口', pinyin: 'kǒu', meaning: 'Mouth' },
    { char: '日', pinyin: 'rì', meaning: 'Sun' },
    { char: '月', pinyin: 'yuè', meaning: 'Moon' },
    { char: '田', pinyin: 'tián', meaning: 'Field' },
    { char: '人', pinyin: 'rén', meaning: 'Person' },
    { char: '水', pinyin: 'shuǐ', meaning: 'Water' },
  ];