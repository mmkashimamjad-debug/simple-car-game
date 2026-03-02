import { create } from "zustand";

export interface GameState {
  speed: number; // km/h
  distance: number; // meters from start
  bestDistance: number;
  carPosition: [number, number, number];
  carVelocity: [number, number, number];
  isResetting: boolean;

  setSpeed: (speed: number) => void;
  setDistance: (distance: number) => void;
  setBestDistance: (best: number) => void;
  setCarPosition: (pos: [number, number, number]) => void;
  setCarVelocity: (vel: [number, number, number]) => void;
  triggerReset: () => void;
  clearReset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  speed: 0,
  distance: 0,
  bestDistance: 0,
  carPosition: [0, 1, 0],
  carVelocity: [0, 0, 0],
  isResetting: false,

  setSpeed: (speed) => set({ speed }),
  setDistance: (distance) => set({ distance }),
  setBestDistance: (best) => set({ bestDistance: best }),
  setCarPosition: (pos) => set({ carPosition: pos }),
  setCarVelocity: (vel) => set({ carVelocity: vel }),
  triggerReset: () => set({ isResetting: true }),
  clearReset: () => set({ isResetting: false }),
}));
