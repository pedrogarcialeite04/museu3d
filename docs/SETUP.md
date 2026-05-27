# TacticalFPS — Movement Framework (Section 1)

High-fidelity, allocation-free character motor that replicates the
**Counter-Strike / Source Engine** mechanical feel inside Unity 2022.3+ LTS.

> Section 1 of the spec (Custom Kinematic Movement) is implemented in full.
> The original `readme.md` brief is truncated mid-code-block — Sections 2+
> (weapons, recoil, hitboxes, netcode, etc.) are not present in the source
> document and were not implemented.

---

## What's in the box

| File | Role |
|------|------|
| `Assets/Scripts/Player/Physics/SourceMath.cs`   | Canonical Source friction / accelerate / air-accelerate math. Pure static, zero alloc. |
| `Assets/Scripts/Player/Physics/GroundProbe.cs`  | SphereCast-based ground sampler with pre-allocated hit buffer. |
| `Assets/Scripts/Player/MovementConfig.cs`       | ScriptableObject holding every tunable, with CS:GO defaults. |
| `Assets/Scripts/Player/MovementInput.cs`        | `IMovementInputProvider` + struct snapshot + legacy-input implementation. |
| `Assets/Scripts/Player/PlayerMotor.cs`          | The motor itself. Rigidbody-driven, FixedUpdate tick, manual velocity. |
| `Assets/Scripts/Player/PlayerCamera.cs`         | Minimal CS-style mouse look (yaw on body, pitch on head). |
| `Assets/Scripts/Player/TacticalFPS.Player.asmdef` | Assembly definition (clean compile boundary, faster iteration). |

---

## Design rules followed

- **Zero allocations in Update / FixedUpdate.** All buffers (`RaycastHit[]`)
  are pre-sized at `Awake`. All hot-path types are structs. No LINQ, no
  closures, no boxing.
- **No generic Unity arcade physics.** `Rigidbody.useGravity = false`,
  `freezeRotation = true`, gravity applied manually, velocity driven by us.
- **Canonical Source Engine math.** `SourceMath.AirAccelerate` keeps the
  `sv_air_max_wishspeed = 30 u/s` cap that enables strafe-jump / bhop gain —
  *that* asymmetry (capped `addSpeed`, uncapped `accelSpeed`) is the trick.
- **Perfect counter-strafing.** Pressing A+D (or W+S) zeroes the velocity
  component along that axis instantly, granting first-bullet accuracy.
- **Deterministic.** All physics runs in `FixedUpdate` at the project's
  fixed timestep (set this to `0.015625` = 64 Hz tick for true CS feel).

---

## Project setup (5 minutes)

### 1. Unity project settings

- **Edit ▸ Project Settings ▸ Time ▸ Fixed Timestep** → `0.015625` (64 Hz, CS:GO MM tick).
- **Edit ▸ Project Settings ▸ Physics ▸ Default Contact Offset** → `0.01`.
- **Edit ▸ Project Settings ▸ Physics ▸ Default Solver Iterations** → `8`.
- Create a Physic Material `PlayerNoFriction` with **Dynamic Friction = 0**,
  **Static Friction = 0**, **Friction Combine = Minimum**. Friction is
  handled by `SourceMath`, the engine must not double-apply it.

### 2. Create the MovementConfig asset

`Assets ▸ Create ▸ TacticalFPS ▸ Movement Config` → name it `DefaultMovement`.
The default values already match CS:GO baseline (run = 6.350 m/s, gravity = 20.32 m/s², etc.).

### 3. Build the Player GameObject

```
Player                       (empty, layer = Player)
 ├── Rigidbody               (added automatically by PlayerMotor; mass = 80)
 ├── CapsuleCollider         (radius = 0.30, height = 1.80, center = (0, 0.9, 0),
 │                           material = PlayerNoFriction)
 ├── PlayerMotor             (config = DefaultMovement,
 │                           viewRoot = CameraPivot)
 ├── PlayerCamera            (body = Player, cameraPivot = CameraPivot)
 └── CameraPivot             (local pos = (0, 1.62, 0)  — Source eye height)
      └── Main Camera        (local pos = 0, FOV = 90)
```

### 4. Build a test scene

- Add a plane / large box scaled to `(50, 1, 50)` for ground.
- Set its layer to one included in `MovementConfig.groundMask`.
- Hit **Play**, lock cursor with click, fly around.

---

## Tuning crib sheet

| ConVar (Source)        | Field                       | CS:GO     | CS:S    |
|------------------------|-----------------------------|-----------|---------|
| `sv_accelerate`        | `groundAccelerate`          | **5.5**   | 10      |
| `sv_airaccelerate`     | `airAccelerate`             | **12**    | 100     |
| `sv_friction`          | `friction`                  | **5.2**   | 4       |
| `sv_stopspeed`         | `stopSpeed` (m/s)           | **2.032** | 2.032   |
| `sv_gravity`           | `gravity`   (m/s²)          | **20.32** | 20.32   |
| `sv_air_max_wishspeed` | `maxAirWishSpeed` (m/s)     | **0.762** | 0.762   |
| `cl_forwardspeed` cap  | `maxRunSpeed`   (m/s)       | **6.350** | 6.350   |
| Jump impulse           | `jumpImpulse`  (m/s)        | **7.6706**| 7.6706  |

> **For uncapped CS:S-style bhop** set `airAccelerate = 100` and increase
> `maxAirWishSpeed` to ~7.62 (300 u/s). Strafe gain becomes dramatic.

---

## Verifying the feel

A few quick smoke tests once you're in play mode:

1. **Counter-strafe.** Hold `A`, then tap-and-hold `D` simultaneously —
   horizontal velocity (`PlayerMotor.HorizontalSpeed`) should drop to ~0
   within a single fixed tick.
2. **Stop-speed dead-zone.** Walk forward, release `W` — the player should
   *not* drift visibly. The non-linear friction's `stopSpeed` floor causes
   instant stop below ~2 m/s.
3. **Strafe jump.** Jump forward, then in the air hold `W+D` and slowly
   sweep the mouse to the right. Speed should *increase* (visible on
   `HorizontalSpeed`) — that's the air-accel cap trick working.
4. **Slope handling.** Walk up a 30° ramp, you should keep full speed and
   not bounce. Walk into a 60° wall-ramp, you should slide off (above
   `maxSlopeAngle`).

---

## Extending the framework

The architecture is intentionally seamed for the rest of the spec:

- **Weapons & recoil** → consume `PlayerMotor.HorizontalSpeed` /
  `IsGrounded` to compute weapon inaccuracy (CS uses a fixed inaccuracy
  curve based on speed, jump state, crouch).
- **Hitboxes** → put them under `CameraPivot` so the head bone follows
  pitch; the body root follows yaw.
- **Netcode** → swap `LegacyMovementInput` for a snapshot-replaying
  provider; `SourceMath` is pure and deterministic so server-side
  re-simulation will match the client tick-for-tick at the same fixed dt.

---

## Compatibility notes

- The motor uses `Rigidbody.linearVelocity` on Unity 6 and falls back to
  `Rigidbody.velocity` on 2022.3 LTS via `#if UNITY_6000_0_OR_NEWER`.
- Uses the **legacy** `Input` class for zero external dependencies. To
  switch to the new Input System, implement `IMovementInputProvider`
  against `InputAction`s and call `PlayerMotor.SetInputProvider(...)`
  before `Start()`.
