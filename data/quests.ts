// data/quests.ts
import { useGameStore } from "@/store/gameStore";

export interface Quest {
  id: number;
  text: string;        
  buttonText?: string; 
  reward?: number;     
  isReady: () => boolean; 
}

export const MAIN_QUESTS: Quest[] = [
  {
    id: 0,
    text: "Welcome to Cat Town! I'm the Mayor. See that [Hanzi Mine]? Go dig up a character for me!",
    buttonText: "I got one! (+10 Gold)",
    reward: 10,
    // Condition: Inventory has at least 1 item
    isReady: () => useGameStore.getState().inventory.length >= 1
  },
  {
    id: 1,
    text: "Great job! Mining costs Energy ⚡. Now, try to fill your backpack to the max! (10/10)",
    buttonText: "Backpack Full! (+20 Gold)",
    reward: 20,
    // Condition: Backpack is full
    isReady: () => useGameStore.getState().inventory.length >= 10
  },
  {
    id: 2,
    text: "Oh no, it's too heavy! Go to the [Lab] -> [Market] tab to sell some basic characters for Gold.",
    buttonText: "Sold it! (+15 Gold)",
    reward: 15,
    // Condition: Backpack is no longer full (implies they sold something)
    isReady: () => useGameStore.getState().inventory.length < 10
  },
  {
    id: 3,
    text: "Now for the magic! Go to the [Lab], select two characters to COMBINE them! (Hint: 木 + 木 = ?)",
    buttonText: "Success! (+50 Gold)",
    reward: 50,
    // Condition: Inventory has a compound character
    isReady: () => useGameStore.getState().inventory.some(item => item.type === 'compound')
  },
  {
    id: 4,
    text: "Awesome! New characters are recorded in the [Museum]. Go check your collection progress!",
    buttonText: "Checked! (+30 Gold)",
    reward: 30,
    // Condition: Auto-complete (just a tutorial step)
    isReady: () => true 
  },
  {
    id: 5,
    text: "You are a pro miner now! Your ultimate goal is to collect ALL characters in the Museum. Good luck!",
    buttonText: "Let's go!",
    reward: 0,
    isReady: () => false // Endless loop
  }
];