import { useBox } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { touchControls } from "../hooks/useCarControls";
import { useGameStore } from "../store/gameStore";

const MOVE_SPEED = 15;
const TURN_SPEED = 60 * (Math.PI / 180); // degrees to radians per second
const CAR_START_POS: [number, number, number] = [0, 1.0, 0];

interface CarProps {
  controlsRef: React.RefObject<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    reset: boolean;
  }>;
}

function WheelMesh({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 12]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Hub cap */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.16, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.01, 8]} />
        <meshStandardMaterial color="#888" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

export function Car({ controlsRef }: CarProps) {
  const meshRef = useRef<THREE.Group>(null);
  const startPos = CAR_START_POS;

  const {
    setSpeed,
    setDistance,
    setCarPosition,
    setCarVelocity,
    isResetting,
    clearReset,
  } = useGameStore();

  const [physicsRef, api] = useBox<THREE.Group>(() => ({
    mass: 800,
    position: startPos,
    args: [1.8, 0.7, 3.8],
    linearDamping: 0.4,
    angularDamping: 0.95,
    material: { friction: 0.5, restitution: 0.1 },
    allowSleep: false,
  }));

  // Track position for distance calculation
  const posRef = useRef<THREE.Vector3>(new THREE.Vector3(...startPos));
  const velRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const rotRef = useRef<THREE.Quaternion>(new THREE.Quaternion());
  const maxDistRef = useRef(0);

  // Subscribe to physics position/velocity/rotation
  useEffect(() => {
    const unsubPos = api.position.subscribe((p) => {
      posRef.current.set(p[0], p[1], p[2]);
    });
    const unsubVel = api.velocity.subscribe((v) => {
      velRef.current.set(v[0], v[1], v[2]);
    });
    const unsubRot = api.quaternion.subscribe((q) => {
      rotRef.current.set(q[0], q[1], q[2], q[3]);
    });
    return () => {
      unsubPos();
      unsubVel();
      unsubRot();
    };
  }, [api]);

  // Handle reset
  useEffect(() => {
    if (isResetting) {
      api.position.set(...startPos);
      api.velocity.set(0, 0, 0);
      api.angularVelocity.set(0, 0, 0);
      api.rotation.set(0, 0, 0);
      maxDistRef.current = 0;
      clearReset();
    }
  }, [isResetting, api, startPos, clearReset]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Combine keyboard + touch inputs
    const forward = controls.forward || touchControls.forward;
    const backward = controls.backward || touchControls.backward;
    const left = controls.left || touchControls.left;
    const right = controls.right || touchControls.right;

    // Get car's forward direction from quaternion
    const carForward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      rotRef.current,
    );
    carForward.y = 0;
    carForward.normalize();

    // Apply force along forward axis (Unity: rb.AddForce(transform.forward * moveInput * moveSpeed))
    const moveInput = (forward ? 1 : 0) - (backward ? 1 : 0);
    if (moveInput !== 0) {
      const force = carForward
        .clone()
        .multiplyScalar(moveInput * MOVE_SPEED * 800);
      api.applyForce([force.x, force.y, force.z], [0, 0, 0]);
    }

    // Turning (Unity: rb.MoveRotation based on turn * turnSpeed * fixedDeltaTime)
    const turnInput = (right ? 1 : 0) - (left ? 1 : 0);
    const speed = velRef.current.length();

    if (turnInput !== 0 && speed > 0.5) {
      const turnAmount = turnInput * TURN_SPEED * delta;
      // Apply angular impulse around Y axis only
      api.applyTorque([0, -turnAmount * 5000, 0]);
    }

    // Update HUD state
    const speedKph = Math.round(speed * 3.6);
    setSpeed(speedKph);
    setCarVelocity([velRef.current.x, velRef.current.y, velRef.current.z]);

    // Distance from start
    const dx = posRef.current.x - startPos[0];
    const dz = posRef.current.z - startPos[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist > maxDistRef.current) {
      maxDistRef.current = dist;
    }
    setDistance(Math.round(maxDistRef.current));
    setCarPosition([posRef.current.x, posRef.current.y, posRef.current.z]);

    // Sync mesh to physics body
    if (meshRef.current && physicsRef.current) {
      meshRef.current.position.copy(
        (physicsRef.current as THREE.Group).position,
      );
      meshRef.current.quaternion.copy(
        (physicsRef.current as THREE.Group).quaternion,
      );
    }
  });

  return (
    <>
      {/* Invisible physics body */}
      <group ref={physicsRef} />

      {/* Visual car mesh */}
      <group ref={meshRef}>
        {/* Main body */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[1.8, 0.55, 3.8]} />
          <meshStandardMaterial
            color="#e8320a"
            roughness={0.3}
            metalness={0.5}
            emissive="#e8320a"
            emissiveIntensity={0.04}
          />
        </mesh>

        {/* Roof / cabin */}
        <mesh position={[0, 0.65, 0.1]} castShadow>
          <boxGeometry args={[1.5, 0.5, 1.8]} />
          <meshStandardMaterial
            color="#c02808"
            roughness={0.4}
            metalness={0.4}
          />
        </mesh>

        {/* Front bumper */}
        <mesh position={[0, 0.1, -1.95]} castShadow>
          <boxGeometry args={[1.6, 0.3, 0.15]} />
          <meshStandardMaterial color="#333" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* Rear bumper */}
        <mesh position={[0, 0.1, 1.95]} castShadow>
          <boxGeometry args={[1.6, 0.3, 0.15]} />
          <meshStandardMaterial color="#333" roughness={0.7} metalness={0.3} />
        </mesh>

        {/* Headlights */}
        <mesh position={[0.55, 0.2, -1.93]}>
          <boxGeometry args={[0.3, 0.2, 0.06]} />
          <meshStandardMaterial
            color="#fffbe8"
            emissive="#fffbe8"
            emissiveIntensity={1.5}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[-0.55, 0.2, -1.93]}>
          <boxGeometry args={[0.3, 0.2, 0.06]} />
          <meshStandardMaterial
            color="#fffbe8"
            emissive="#fffbe8"
            emissiveIntensity={1.5}
            roughness={0.1}
          />
        </mesh>

        {/* Tail lights */}
        <mesh position={[0.55, 0.2, 1.93]}>
          <boxGeometry args={[0.3, 0.2, 0.06]} />
          <meshStandardMaterial
            color="#ff1010"
            emissive="#ff1010"
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[-0.55, 0.2, 1.93]}>
          <boxGeometry args={[0.3, 0.2, 0.06]} />
          <meshStandardMaterial
            color="#ff1010"
            emissive="#ff1010"
            emissiveIntensity={1.2}
            roughness={0.1}
          />
        </mesh>

        {/* Windshield */}
        <mesh position={[0, 0.58, -0.88]}>
          <boxGeometry args={[1.42, 0.4, 0.05]} />
          <meshStandardMaterial
            color="#88aacc"
            roughness={0.05}
            metalness={0.1}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* 4 Wheels */}
        {/* Front left */}
        <WheelMesh position={[-1.0, -0.2, -1.3]} />
        {/* Front right */}
        <WheelMesh position={[1.0, -0.2, -1.3]} />
        {/* Rear left */}
        <WheelMesh position={[-1.0, -0.2, 1.3]} />
        {/* Rear right */}
        <WheelMesh position={[1.0, -0.2, 1.3]} />

        {/* Point light from headlights */}
        <pointLight
          position={[0, 0.2, -2.2]}
          intensity={15}
          distance={8}
          color="#fff5d6"
        />
      </group>
    </>
  );
}
