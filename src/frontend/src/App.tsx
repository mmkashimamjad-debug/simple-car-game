import { useCallback } from "react";
import { CarGame } from "./components/CarGame";
import { HUD } from "./components/HUD";
import { useGameStore } from "./store/gameStore";

export default function App() {
  const triggerReset = useGameStore((s) => s.triggerReset);

  const handleReset = useCallback(() => {
    triggerReset();
  }, [triggerReset]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      <CarGame />
      <HUD onReset={handleReset} />
    </div>
  );
}
