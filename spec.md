# Simple Car Game

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- 3D car driving game ported from the provided Unity `SimpleCarController` script
- Car responds to W/S (forward/backward) and A/D (left/right turn) keyboard inputs
- Physics-based movement: addForce for acceleration, MoveRotation for steering
- Move speed: 15 units, turn speed: 60 degrees/s (matching Unity defaults)
- Third-person camera that follows the car
- Simple 3D scene: flat ground plane, some obstacles or scenery for context
- On-screen controls hint (WASD / Arrow keys)
- Score/distance tracker displayed as HUD
- Mobile virtual joystick support

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: minimal Motoko canister (no meaningful server state needed for a local car game)
2. Frontend:
   - Install / use `@react-three/fiber`, `@react-three/drei`, `@react-three/cannon`
   - `CarGame` scene component with Canvas
   - `Car` mesh component: box geometry, rigidbody physics via `@react-three/cannon`
   - `CarController` hook: reads keyboard input (useKeyboardControls or raw keydown), applies force + rotation
   - `FollowCamera` component: smooth third-person camera tracking
   - Ground plane with physics
   - Scattered obstacle boxes for visual interest
   - HUD overlay: speed indicator, distance traveled
   - Mobile: on-screen D-pad or virtual joystick
