import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";

const CAMERA_OFFSET = new THREE.Vector3(0, 4.5, 10);
const LOOK_AHEAD = 2.5;
const LERP_FACTOR = 0.08;
const LOOK_LERP = 0.1;

export function FollowCamera() {
  const { camera } = useThree();
  const carPosition = useGameStore((s) => s.carPosition);
  const carVelocity = useGameStore((s) => s.carVelocity);

  const targetPos = useRef(new THREE.Vector3(0, 4.5, 10));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const carPos = new THREE.Vector3(...carPosition);
    const carVel = new THREE.Vector3(...carVelocity);

    // Velocity direction for look-ahead
    const velDir = carVel.clone();
    velDir.y = 0;
    const speed = velDir.length();
    if (speed > 0.1) velDir.normalize();
    else velDir.set(0, 0, 0);

    // Camera sits behind the car in world space
    // We need the car's facing direction - approximate from velocity or use fixed offset
    // Build desired camera world position: offset behind car based on velocity direction
    let behindDir: THREE.Vector3;
    if (speed > 1) {
      behindDir = velDir.clone().negate();
    } else {
      behindDir = new THREE.Vector3(0, 0, 1);
    }

    const desired = carPos
      .clone()
      .add(behindDir.clone().multiplyScalar(CAMERA_OFFSET.z))
      .add(new THREE.Vector3(0, CAMERA_OFFSET.y, 0));

    // Lerp camera position
    targetPos.current.lerp(desired, LERP_FACTOR);
    camera.position.copy(targetPos.current);

    // Look at car with slight look-ahead based on velocity
    const lookTarget = carPos
      .clone()
      .add(velDir.clone().multiplyScalar(LOOK_AHEAD * Math.min(speed / 5, 1)));
    lookTarget.y += 0.5;

    currentLookAt.current.lerp(lookTarget, LOOK_LERP);
    camera.lookAt(currentLookAt.current);
  });

  return null;
}
