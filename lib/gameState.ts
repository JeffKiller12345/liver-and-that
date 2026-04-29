// filepath: lib/gameState.ts
import { GameItem, ItemType } from './items';

export interface GameState {
  score: number;
  health: number;
  brainMeter: number;
  abdomenFill: number;
  cirrhosisLevel: number;
  gameOver: boolean;
  activeItems: GameItem[];
  // Consequence stats for game over breakdown
  stats: {
    encephalopathyEvents: number;
    jaundiceEvents: number;
    toxinOverloads: number;
    sepsisWarnings: number;
    wrongMatches: number;
    correctMatches: number;
  };
}

export type GameAction =
  | { type: 'ADD_ITEM'; payload: GameItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_METER'; payload: { meter: 'health' | 'brainMeter' | 'abdomenFill' | 'cirrhosisLevel'; value: number } }
  | { type: 'ADD_SCORE'; payload: number }
  | { type: 'SET_GAME_OVER'; payload: boolean }
  | { type: 'TICK' }
  | { type: 'RESET' }
  | { type: 'JAUNDICE_EVENT' }
  | { type: 'TOXIN_OVERLOAD' }
  | { type: 'SEPSIS_WARNING' }
  | { type: 'WRONG_MATCH' }
  | { type: 'CORRECT_MATCH' }
  | { type: 'ENCEPHALOPATHY_EVENT' };

export const initialGameState: GameState = {
  score: 0,
  health: 100,
  brainMeter: 0,
  abdomenFill: 0,
  cirrhosisLevel: 0,
  gameOver: false,
  activeItems: [],
  stats: {
    encephalopathyEvents: 0,
    jaundiceEvents: 0,
    toxinOverloads: 0,
    sepsisWarnings: 0,
    wrongMatches: 0,
    correctMatches: 0,
  },
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        activeItems: [...state.activeItems, action.payload],
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        activeItems: state.activeItems.filter(item => item.id !== action.payload),
      };
    case 'UPDATE_METER':
      return {
        ...state,
        [action.payload.meter]: Math.max(0, Math.min(100, action.payload.value)),
      };
    case 'ADD_SCORE':
      return {
        ...state,
        score: state.score + action.payload,
      };
    case 'SET_GAME_OVER':
      return {
        ...state,
        gameOver: action.payload,
      };
    case 'TICK':
      // Increment cirrhosis by 0.5 every second
      return {
        ...state,
        cirrhosisLevel: Math.min(100, state.cirrhosisLevel + 0.5),
      };
    case 'JAUNDICE_EVENT':
      // Jaundice: increase bilirubin, turn skin yellow
      return {
        ...state,
        abdomenFill: Math.min(100, state.abdomenFill + 15),
        health: Math.max(0, state.health - 10),
        stats: {
          ...state.stats,
          jaundiceEvents: state.stats.jaundiceEvents + 1,
        },
      };
    case 'TOXIN_OVERLOAD':
      // Toxin overload: health drops, brain fog increases
      return {
        ...state,
        health: Math.max(0, state.health - 20),
        brainMeter: Math.min(100, state.brainMeter + 15),
        cirrhosisLevel: Math.min(100, state.cirrhosisLevel + 5),
        stats: {
          ...state.stats,
          toxinOverloads: state.stats.toxinOverloads + 1,
        },
      };
    case 'SEPSIS_WARNING':
      // Sepsis from bacteria: major health hit
      return {
        ...state,
        health: Math.max(0, state.health - 25),
        cirrhosisLevel: Math.min(100, state.cirrhosisLevel + 3),
        stats: {
          ...state.stats,
          sepsisWarnings: state.stats.sepsisWarnings + 1,
        },
      };
    case 'WRONG_MATCH':
      // Wrong match: health penalty
      return {
        ...state,
        health: Math.max(0, state.health - 15),
        stats: {
          ...state.stats,
          wrongMatches: state.stats.wrongMatches + 1,
        },
      };
    case 'CORRECT_MATCH':
      // Correct match: track stats
      return {
        ...state,
        stats: {
          ...state.stats,
          correctMatches: state.stats.correctMatches + 1,
        },
      };
    case 'ENCEPHALOPATHY_EVENT':
      // Encephalopathy from high brain meter
      return {
        ...state,
        stats: {
          ...state.stats,
          encephalopathyEvents: state.stats.encephalopathyEvents + 1,
        },
      };
    case 'RESET':
      return initialGameState;
    default:
      return state;
  }
}