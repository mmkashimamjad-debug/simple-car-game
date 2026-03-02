import { useEffect, useRef } from "react";

export interface CarControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  reset: boolean;
}

const controls: CarControls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  reset: false,
};

// Touch state (set from mobile D-pad)
export const touchControls = {
  forward: false,
  backward: false,
  left: false,
  right: false,
};

export function useCarControls(onReset: () => void) {
  const controlsRef = useRef<CarControls>({ ...controls });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          controlsRef.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          controlsRef.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          controlsRef.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          controlsRef.current.right = true;
          break;
        case "KeyR":
          controlsRef.current.reset = true;
          onReset();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          controlsRef.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          controlsRef.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          controlsRef.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          controlsRef.current.right = false;
          break;
        case "KeyR":
          controlsRef.current.reset = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onReset]);

  return controlsRef;
}
