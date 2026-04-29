// filepath: lib/items.ts
export type ItemType = 
  | 'ammonia'
  | 'bile'
  | 'toxin'
  | 'dead_cell'
  | 'glucose'
  | 'urea'
  | 'bilirubin';

export interface ItemConfig {
  type: ItemType;
  name: string;
  emoji: string;
  description: string;
  points: number;
  color: string;
}

export interface GameItem {
  id: string;
  type: ItemType;
  x: number;
  y: number;
}

export const ITEM_CONFIGS: Record<ItemType, ItemConfig> = {
  ammonia: {
    type: 'ammonia',
    name: 'Ammonia',
    emoji: '☁️',
    description: 'Toxic waste from protein digestion',
    points: 10,
    color: 'bg-purple-400',
  },
  bile: {
    type: 'bile',
    name: 'Bile',
    emoji: '🟢',
    description: 'Digestive fluid produced by liver',
    points: 15,
    color: 'bg-green-500',
  },
  toxin: {
    type: 'toxin',
    name: 'Toxin',
    emoji: '☠️',
    description: 'Harmful substance to be processed',
    points: 20,
    color: 'bg-red-500',
  },
  dead_cell: {
    type: 'dead_cell',
    name: 'Dead Cell',
    emoji: '💀',
    description: 'Old cell debris for cleanup',
    points: 5,
    color: 'bg-gray-400',
  },
  glucose: {
    type: 'glucose',
    name: 'Glucose',
    emoji: '🍬',
    description: 'Energy source for the body',
    points: 25,
    color: 'bg-yellow-400',
  },
  urea: {
    type: 'urea',
    name: 'Urea',
    emoji: '💧',
    description: 'Waste product from ammonia detox',
    points: 30,
    color: 'bg-blue-400',
  },
  bilirubin: {
    type: 'bilirubin',
    name: 'Bilirubin',
    emoji: '🟡',
    description: 'Bile pigment from red blood cell breakdown',
    points: 20,
    color: 'bg-amber-500',
  },
};

export const SPAWNABLE_ITEMS: ItemType[] = [
  'ammonia',
  'bile',
  'toxin',
  'dead_cell',
  'glucose',
  'bilirubin',
];

export function createGameItem(type: ItemType, x: number, y: number): GameItem {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    x,
    y,
  };
}

export function getRandomSpawnableItem(): ItemType {
  const randomIndex = Math.floor(Math.random() * SPAWNABLE_ITEMS.length);
  return SPAWNABLE_ITEMS[randomIndex];
}