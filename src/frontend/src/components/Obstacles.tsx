import { useBox } from "@react-three/cannon";
import type * as THREE from "three";

interface ObstacleProps {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  isStatic?: boolean;
}

function Obstacle({
  position,
  size,
  color,
  isStatic = true,
  id: _id,
}: ObstacleProps) {
  const [ref] = useBox<THREE.Mesh>(() => ({
    position,
    args: size,
    type: isStatic ? "Static" : "Dynamic",
    mass: isStatic ? 0 : 10,
    material: { friction: 0.3, restitution: 0.3 },
  }));

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={color}
        roughness={0.6}
        metalness={0.2}
        emissive={color}
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

// Seeded pseudo-random for consistent obstacle placement
function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const COLORS = [
  "#ff4500", // red-orange
  "#00bfff", // deep sky blue
  "#7cfc00", // lawn green
  "#ff69b4", // hot pink
  "#ffa500", // orange
  "#9370db", // medium purple
  "#20b2aa", // light sea green
  "#ff6347", // tomato
  "#4169e1", // royal blue
  "#32cd32", // lime green
];

// Generate obstacles with seeded random
const OBSTACLES: ObstacleProps[] = [];
let seed = 42;

// Regular crates (dynamic - can be pushed)
for (let i = 0; i < 12; i++) {
  seed++;
  const x = (seededRandom(seed) - 0.5) * 150;
  seed++;
  const z = (seededRandom(seed) - 0.5) * 150;
  // Avoid spawn area
  if (Math.abs(x) < 10 && Math.abs(z) < 10) {
    seed++;
  }
  seed++;
  const w = 2 + seededRandom(seed) * 2;
  seed++;
  const h = 1.5 + seededRandom(seed) * 2;
  seed++;
  const d = 2 + seededRandom(seed) * 2;
  const colorIdx = i % COLORS.length;

  OBSTACLES.push({
    id: `crate-${i}`,
    position: [x, h / 2, z] as [number, number, number],
    size: [w, h, d] as [number, number, number],
    color: COLORS[colorIdx],
    isStatic: false,
  });
}

// Tall pillars / trees (static)
for (let i = 0; i < 10; i++) {
  seed++;
  const x = (seededRandom(seed) - 0.5) * 160;
  seed++;
  const z = (seededRandom(seed) - 0.5) * 160;
  seed++;
  const h = 5 + seededRandom(seed) * 8;
  const colorIdx = (i + 3) % COLORS.length;

  OBSTACLES.push({
    id: `pillar-${i}`,
    position: [x, h / 2, z] as [number, number, number],
    size: [1.2, h, 1.2] as [number, number, number],
    color: COLORS[colorIdx],
    isStatic: true,
  });
}

// Large static walls/barriers
const WALLS: ObstacleProps[] = [
  {
    id: "wall-0",
    position: [30, 2, -40],
    size: [12, 4, 2],
    color: "#ff4500",
    isStatic: true,
  },
  {
    id: "wall-1",
    position: [-45, 2.5, 20],
    size: [2, 5, 15],
    color: "#00bfff",
    isStatic: true,
  },
  {
    id: "wall-2",
    position: [20, 1.5, 50],
    size: [8, 3, 2],
    color: "#7cfc00",
    isStatic: true,
  },
  {
    id: "wall-3",
    position: [-30, 2, -60],
    size: [2, 4, 20],
    color: "#ffa500",
    isStatic: true,
  },
  {
    id: "wall-4",
    position: [60, 3, 10],
    size: [2, 6, 20],
    color: "#9370db",
    isStatic: true,
  },
];

export function Obstacles() {
  return (
    <group>
      {OBSTACLES.map((obs) => (
        <Obstacle key={obs.id} {...obs} />
      ))}
      {WALLS.map((wall) => (
        <Obstacle key={wall.id} {...wall} />
      ))}
    </group>
  );
}
