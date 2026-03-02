import { Physics } from "@react-three/cannon";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import * as THREE from "three";
import { useCarControls } from "../hooks/useCarControls";
import { useGameStore } from "../store/gameStore";
import { Car } from "./Car";
import { FollowCamera } from "./FollowCamera";
import { Ground } from "./Ground";
import { Obstacles } from "./Obstacles";

const SCENE_BG = new THREE.Color("#060914");

interface CarGameSceneProps {
  controlsRef: ReturnType<typeof useCarControls>;
}

function Scene({ controlsRef }: CarGameSceneProps) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} color="#b0c8ff" />
      <directionalLight
        position={[30, 50, 30]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={200}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        color="#fff8e8"
      />
      <directionalLight
        position={[-20, 30, -20]}
        intensity={0.4}
        color="#6080ff"
      />
      <hemisphereLight args={["#1a2080", "#080818", 0.5]} />

      <Physics
        gravity={[0, -25, 0]}
        defaultContactMaterial={{ friction: 0.4, restitution: 0.1 }}
        broadphase="SAP"
        allowSleep={false}
      >
        <Ground />
        <Car controlsRef={controlsRef} />
        <Obstacles />
      </Physics>

      <FollowCamera />
    </>
  );
}

export function CarGame() {
  const triggerReset = useGameStore((s) => s.triggerReset);

  const handleReset = () => {
    triggerReset();
  };

  const controlsRef = useCarControls(handleReset);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 4.5, 10], fov: 65, near: 0.1, far: 500 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        scene={{ background: SCENE_BG }}
      >
        <fog attach="fog" args={["#060a1a", 60, 200]} />

        <Suspense fallback={null}>
          <Scene controlsRef={controlsRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
