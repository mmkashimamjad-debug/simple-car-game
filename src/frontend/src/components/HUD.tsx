import { useEffect, useRef } from "react";
import { useActor } from "../hooks/useActor";
import { touchControls } from "../hooks/useCarControls";
import { useGameStore } from "../store/gameStore";

interface HUDProps {
  onReset: () => void;
}

export function HUD({ onReset }: HUDProps) {
  const speed = useGameStore((s) => s.speed);
  const distance = useGameStore((s) => s.distance);
  const bestDistance = useGameStore((s) => s.bestDistance);
  const setBestDistance = useGameStore((s) => s.setBestDistance);
  const { actor } = useActor();
  const scoreSubmittedRef = useRef(false);

  // Load high score on mount
  useEffect(() => {
    if (!actor) return;
    (async () => {
      try {
        const score = await actor.getHighScore();
        setBestDistance(Number(score));
      } catch {
        // ignore
      }
    })();
  }, [actor, setBestDistance]);

  // Update best distance when current distance exceeds it
  useEffect(() => {
    if (distance > bestDistance && distance > 0) {
      setBestDistance(distance);
      scoreSubmittedRef.current = false;
    }
  }, [distance, bestDistance, setBestDistance]);

  // Submit score on reset
  const handleReset = async () => {
    if (actor && distance > 0 && !scoreSubmittedRef.current) {
      scoreSubmittedRef.current = true;
      try {
        await actor.submitScore(BigInt(distance));
      } catch {
        // ignore
      }
    }
    onReset();
  };

  // Touch control handlers
  const handleTouchStart =
    (dir: keyof typeof touchControls) => (e: React.TouchEvent) => {
      e.preventDefault();
      touchControls[dir] = true;
    };
  const handleTouchEnd =
    (dir: keyof typeof touchControls) => (e: React.TouchEvent) => {
      e.preventDefault();
      touchControls[dir] = false;
    };

  return (
    <div className="fixed inset-0 pointer-events-none z-10 select-none">
      {/* Top left - Speed */}
      <div className="absolute top-4 left-4 hud-panel rounded-xl p-4 pointer-events-none min-w-[120px]">
        <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-1">
          Speed
        </div>
        <div className="flex items-baseline gap-1">
          <span
            className="mono text-3xl font-bold"
            style={{ color: "var(--speed-color)" }}
          >
            {speed}
          </span>
          <span className="text-xs text-muted-foreground font-display">
            km/h
          </span>
        </div>
      </div>

      {/* Top right - Scores */}
      <div className="absolute top-4 right-4 hud-panel rounded-xl p-4 pointer-events-none min-w-[140px]">
        <div className="space-y-2">
          <div>
            <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-0.5">
              Distance
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="mono text-2xl font-bold"
                style={{ color: "var(--distance-color)" }}
              >
                {distance}
              </span>
              <span className="text-xs text-muted-foreground font-display">
                m
              </span>
            </div>
          </div>
          <div className="h-px bg-border" />
          <div>
            <div className="text-[10px] font-display uppercase tracking-widest text-muted-foreground mb-0.5">
              Best
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="mono text-xl font-semibold"
                style={{ color: "var(--best-color)" }}
              >
                {bestDistance}
              </span>
              <span className="text-xs text-muted-foreground font-display">
                m
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom center - Controls hint (desktop only) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hud-panel rounded-full px-5 py-2 pointer-events-none hidden md:flex items-center gap-4">
        <span className="text-xs font-display text-muted-foreground">
          <kbd className="mono text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border">
            WASD
          </kbd>{" "}
          or{" "}
          <kbd className="mono text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border">
            ↑↓←→
          </kbd>{" "}
          to drive
        </span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-xs font-display text-muted-foreground">
          <kbd className="mono text-[10px] bg-secondary px-1.5 py-0.5 rounded border border-border">
            R
          </kbd>{" "}
          to reset
        </span>
      </div>

      {/* Reset button (desktop) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto hidden md:block">
        <button
          type="button"
          onClick={handleReset}
          className="hud-panel rounded-full px-5 py-2 text-xs font-display uppercase tracking-wider text-foreground/70 hover:text-foreground transition-colors cursor-pointer"
        >
          ↺ Reset
        </button>
      </div>

      {/* Mobile D-pad controls */}
      <div className="md:hidden absolute bottom-8 left-4 pointer-events-auto">
        <MobileDpad
          handleTouchStart={handleTouchStart}
          handleTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Mobile gas/brake */}
      <div className="md:hidden absolute bottom-8 right-4 pointer-events-auto">
        <MobileGasBrake
          handleTouchStart={handleTouchStart}
          handleTouchEnd={handleTouchEnd}
        />
      </div>

      {/* Mobile reset */}
      <div className="md:hidden absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <button
          type="button"
          onClick={handleReset}
          className="hud-panel rounded-full px-4 py-2 text-xs font-display uppercase tracking-wider text-foreground/70"
        >
          ↺ Reset
        </button>
      </div>

      {/* Footer attribution */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto hidden md:block">
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors font-display"
        >
          © {new Date().getFullYear()} Built with ❤ using caffeine.ai
        </a>
      </div>
    </div>
  );
}

interface DpadHandlers {
  handleTouchStart: (
    dir: keyof typeof touchControls,
  ) => (e: React.TouchEvent) => void;
  handleTouchEnd: (
    dir: keyof typeof touchControls,
  ) => (e: React.TouchEvent) => void;
}

function MobileDpad({ handleTouchStart, handleTouchEnd }: DpadHandlers) {
  return (
    <div className="relative w-[120px] h-[120px]">
      {/* Left */}
      <button
        type="button"
        className="touch-btn absolute left-0 top-1/2 -translate-y-1/2 hud-panel rounded-xl w-10 h-10 flex items-center justify-center text-lg active:bg-primary/20"
        onTouchStart={handleTouchStart("left")}
        onTouchEnd={handleTouchEnd("left")}
        onTouchCancel={handleTouchEnd("left")}
      >
        ◀
      </button>
      {/* Right */}
      <button
        type="button"
        className="touch-btn absolute right-0 top-1/2 -translate-y-1/2 hud-panel rounded-xl w-10 h-10 flex items-center justify-center text-lg active:bg-primary/20"
        onTouchStart={handleTouchStart("right")}
        onTouchEnd={handleTouchEnd("right")}
        onTouchCancel={handleTouchEnd("right")}
      >
        ▶
      </button>
    </div>
  );
}

function MobileGasBrake({ handleTouchStart, handleTouchEnd }: DpadHandlers) {
  return (
    <div className="flex flex-col gap-3">
      {/* Forward (gas) */}
      <button
        type="button"
        className="touch-btn hud-panel rounded-xl w-14 h-14 flex items-center justify-center text-xl font-bold active:bg-primary/30"
        style={{ borderColor: "rgba(255,165,50,0.4)" }}
        onTouchStart={handleTouchStart("forward")}
        onTouchEnd={handleTouchEnd("forward")}
        onTouchCancel={handleTouchEnd("forward")}
      >
        <span style={{ color: "var(--speed-color)" }}>▲</span>
      </button>
      {/* Backward (brake) */}
      <button
        type="button"
        className="touch-btn hud-panel rounded-xl w-14 h-14 flex items-center justify-center text-xl font-bold active:bg-destructive/30"
        onTouchStart={handleTouchStart("backward")}
        onTouchEnd={handleTouchEnd("backward")}
        onTouchCancel={handleTouchEnd("backward")}
      >
        <span className="text-destructive">▼</span>
      </button>
    </div>
  );
}
