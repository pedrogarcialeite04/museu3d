// -----------------------------------------------------------------------------
//  MovementInput.cs
//  TacticalFPS.Player
//
//  Allocation-free input abstraction.
//
//  Why an interface + struct snapshot?
//    * The Motor consumes one struct per tick. No allocations, no GC pressure.
//    * Swap LegacyMovementInput for a NewInputSystemMovementInput / replay
//      provider / bot AI / netcode replay without touching the Motor.
//    * Opposing-key detection (A+D, W+S) is exposed explicitly so the Motor
//      can do perfect counter-strafing without re-reading raw keys.
// -----------------------------------------------------------------------------

using UnityEngine;

namespace TacticalFPS.Player
{
    /// <summary>
    /// Per-tick input snapshot. POD struct, safe to copy.
    /// MoveX / MoveZ are already zero when opposing keys cancel each other —
    /// use <see cref="OpposingStrafeX"/> / <see cref="OpposingStrafeZ"/> if
    /// you need to know the cancellation happened.
    /// </summary>
    public struct MovementInputSnapshot
    {
        public float MoveX;             // -1 = A,  +1 = D,  0 = none or A+D
        public float MoveZ;             // -1 = S,  +1 = W,  0 = none or W+S
        public bool  JumpHeld;
        public bool  JumpDown;          // edge: pressed this Update
        public bool  CrouchHeld;
        public bool  WalkHeld;
        public bool  OpposingStrafeX;   // A AND D held at the same time
        public bool  OpposingStrafeZ;   // W AND S held at the same time
    }

    /// <summary>
    /// Pluggable input source. Implement to bridge the new Input System,
    /// network replays, AI, demo playback, etc.
    /// </summary>
    public interface IMovementInputProvider
    {
        MovementInputSnapshot Read();
    }

    /// <summary>
    /// Default provider using UnityEngine.Input (legacy input manager).
    /// Zero allocations. Bindings:
    ///   WASD          — move
    ///   Space         — jump
    ///   LeftControl   — crouch
    ///   LeftShift     — walk
    /// </summary>
    public sealed class LegacyMovementInput : IMovementInputProvider
    {
        public MovementInputSnapshot Read()
        {
            bool a = Input.GetKey(KeyCode.A);
            bool d = Input.GetKey(KeyCode.D);
            bool w = Input.GetKey(KeyCode.W);
            bool s = Input.GetKey(KeyCode.S);

            return new MovementInputSnapshot
            {
                MoveX           = (d ? 1f : 0f) - (a ? 1f : 0f),
                MoveZ           = (w ? 1f : 0f) - (s ? 1f : 0f),
                JumpHeld        = Input.GetKey(KeyCode.Space),
                JumpDown        = Input.GetKeyDown(KeyCode.Space),
                CrouchHeld      = Input.GetKey(KeyCode.LeftControl),
                WalkHeld        = Input.GetKey(KeyCode.LeftShift),
                OpposingStrafeX = a && d,
                OpposingStrafeZ = w && s,
            };
        }
    }
}
