import { usePlane } from "@react-three/cannon";
import { useRef } from "react";
import * as THREE from "three";

export function Ground() {
  const [ref] = usePlane<THREE.Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    type: "Static",
    material: { friction: 0.4, restitution: 0.1 },
  }));

  // Create checkerboard texture procedurally
  const texture = useRef<THREE.CanvasTexture | null>(null);
  if (!texture.current) {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    const tileSize = size / 16;
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 16; col++) {
        const isLight = (row + col) % 2 === 0;
        ctx.fillStyle = isLight ? "#0d1a2e" : "#0a1520";
        ctx.fillRect(col * tileSize, row * tileSize, tileSize, tileSize);
      }
    }

    // Grid lines
    ctx.strokeStyle = "rgba(255, 140, 40, 0.12)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 16; i++) {
      ctx.beginPath();
      ctx.moveTo(i * tileSize, 0);
      ctx.lineTo(i * tileSize, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * tileSize);
      ctx.lineTo(size, i * tileSize);
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
    texture.current = tex;
  }

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[400, 400]} />
      <meshStandardMaterial
        map={texture.current}
        roughness={0.9}
        metalness={0.05}
      />
    </mesh>
  );
}
