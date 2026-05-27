// -----------------------------------------------------------------------------
//  MovementConfig.cs
//  TacticalFPS.Player
//
//  ScriptableObject holding every tunable for the kinematic motor.
//  Defaults match Counter-Strike: Global Offensive (CS:GO) baseline values,
//  converted from Source's Hammer units to metric (1 u = 0.0254 m).
//
//  Reference table (Source u/s  →  Unity m/s):
//      sv_maxspeed              250 u/s   ≈ 6.350 m/s     (rifle run)
//      cl_walkspeed             130 u/s   ≈ 3.302 m/s     (shift)
//      cl_crouchspeed            85 u/s   ≈ 2.159 m/s
//      sv_accelerate            5.5       (unitless coeff)
//      sv_airaccelerate         12        (CS:GO)
//      sv_friction              5.2       (CS:GO)
//      sv_stopspeed              80 u/s   ≈ 2.032 m/s
//      sv_jump_impulse         301.993 u/s ≈ 7.6706 m/s
//      sv_gravity              800 u/s²  ≈ 20.32 m/s²
//      sv_air_max_wishspeed     30 u/s   ≈ 0.762 m/s
// -----------------------------------------------------------------------------

using UnityEngine;

namespace TacticalFPS.Player
{
    [CreateAssetMenu(
        fileName = "MovementConfig",
        menuName = "TacticalFPS/Movement Config",
        order    = 0)]
    public sealed class MovementConfig : ScriptableObject
    {
        // --------------------------------------------------------------------
        // Speed caps
        // --------------------------------------------------------------------

        [Header("Speed caps (m/s)")]
        [Tooltip("Run speed with rifle. Source default: 250 u/s.")]
        public float maxRunSpeed = 6.350f;

        [Tooltip("Walk speed (Shift). Source default: 130 u/s.")]
        public float maxWalkSpeed = 3.302f;

        [Tooltip("Crouch speed (Ctrl). Source default: 85 u/s.")]
        public float maxCrouchSpeed = 2.159f;

        [Tooltip("Per-tick wish-speed cap while airborne. THIS is the value that "
               + "controls bhop / strafe-jump gain. Source default: 30 u/s = 0.762 m/s.")]
        public float maxAirWishSpeed = 0.762f;

        // --------------------------------------------------------------------
        // Acceleration / friction
        // --------------------------------------------------------------------

        [Header("Acceleration")]
        [Tooltip("sv_accelerate. CS:GO = 5.5, CS:S = 10.")]
        public float groundAccelerate = 5.5f;

        [Tooltip("sv_airaccelerate. CS:GO = 12, CS:S = 100 (uncapped bhop).")]
        public float airAccelerate = 12f;

        [Header("Friction")]
        [Tooltip("sv_friction. CS:GO = 5.2, CS:S = 4.")]
        public float friction = 5.2f;

        [Tooltip("sv_stopspeed. Speed under which friction is computed against "
               + "stopSpeed instead of |velocity|, producing instant stop. "
               + "Source default: 80 u/s ≈ 2.032 m/s.")]
        public float stopSpeed = 2.032f;

        // --------------------------------------------------------------------
        // Jump / gravity
        // --------------------------------------------------------------------

        [Header("Jump & Gravity")]
        [Tooltip("Initial jump velocity. Source: sqrt(2 * 800 * 57) = 301.993 u/s ≈ 7.6706 m/s.")]
        public float jumpImpulse = 7.6706f;

        [Tooltip("sv_gravity. Source default: 800 u/s² ≈ 20.32 m/s².")]
        public float gravity = 20.32f;

        [Tooltip("If true, holding Space auto-jumps on landing (autohop).")]
        public bool autoBhop = true;

        // --------------------------------------------------------------------
        // Ground probe
        // --------------------------------------------------------------------

        [Header("Ground Detection")]
        [Tooltip("SphereCast radius for the ground probe (use ~95% of capsule radius).")]
        public float groundProbeRadius = 0.28f;

        [Tooltip("Extra downward distance probed beyond the sphere.")]
        public float groundProbeDistance = 0.18f;

        [Tooltip("Max walkable slope (degrees). Source default ≈ 45.57° (cos = 0.7).")]
        [Range(0f, 89f)]
        public float maxSlopeAngle = 45.57f;

        [Tooltip("Layers considered solid ground.")]
        public LayerMask groundMask = ~0;

        // --------------------------------------------------------------------
        // Counter-strafing
        // --------------------------------------------------------------------

        [Header("Counter-Strafing")]
        [Tooltip("When opposing strafe keys are held (A+D or W+S), zero the "
               + "velocity component along that axis instantly — guarantees "
               + "first-bullet accuracy on peeks.")]
        public bool perfectCounterStrafe = true;
    }
}
