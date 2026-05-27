// -----------------------------------------------------------------------------
//  PlayerMotor.cs
//  TacticalFPS.Player
//
//  Custom kinematic-feeling character motor that replicates Counter-Strike
//  (Source Engine) movement.
//
//  Architectural choices:
//    * Rigidbody (non-kinematic) with useGravity = false and freezeRotation,
//      driving rb.linearVelocity (Unity 6) / rb.velocity (2022.3) manually.
//      This gives us:
//        - Correct collide-and-slide via the Unity solver (cheap, robust).
//        - Real interactions with other physics objects (grenades, ragdolls).
//        - Deterministic update at FixedUpdate cadence (Source tick model).
//    * Input is read in Update() and latched (JumpDown) so we never drop a
//      jump when the FixedUpdate cadence is slower than the render frame.
//    * Velocity math runs in FixedUpdate only — Update() does NO allocations
//      and NO physics work.
//    * All hot-path data (RaycastHit buffer, ground state, velocity) lives
//      on the instance; no closures, no LINQ, no boxing.
//
//  Public surface kept minimal on purpose. Hook into Velocity / IsGrounded
//  for HUD, viewmodel sway, weapon inaccuracy, footstep audio, etc.
// -----------------------------------------------------------------------------

using TacticalFPS.Player.Physics;
using UnityEngine;

namespace TacticalFPS.Player
{
    [RequireComponent(typeof(Rigidbody))]
    [RequireComponent(typeof(CapsuleCollider))]
    [DisallowMultipleComponent]
    [AddComponentMenu("TacticalFPS/Player Motor")]
    public sealed class PlayerMotor : MonoBehaviour
    {
        // --------------------------------------------------------------------
        // Inspector
        // --------------------------------------------------------------------

        [Header("Config")]
        [SerializeField] private MovementConfig config;

        [Tooltip("Transform used to derive wish-direction yaw (usually the "
               + "camera root rotating only on Y). Falls back to this.transform "
               + "if left empty.")]
        [SerializeField] private Transform viewRoot;

        // --------------------------------------------------------------------
        // Cached components
        // --------------------------------------------------------------------

        private Rigidbody       _rb;
        private CapsuleCollider _capsule;
        private GroundProbe     _groundProbe;
        private IMovementInputProvider _inputProvider;

        // --------------------------------------------------------------------
        // Runtime state (struct fields — no allocations)
        // --------------------------------------------------------------------

        private MovementInputSnapshot _input;
        private bool      _jumpQueued;
        private bool      _wasGroundedLastTick;
        private GroundHit _ground;
        private Vector3   _velocity;

        // --------------------------------------------------------------------
        // Public API
        // --------------------------------------------------------------------

        /// <summary>World-space velocity used by the motor this tick.</summary>
        public Vector3 Velocity   => _velocity;

        /// <summary>Horizontal speed (m/s) — useful for HUD / weapon inaccuracy.</summary>
        public float HorizontalSpeed => new Vector2(_velocity.x, _velocity.z).magnitude;

        public bool IsGrounded => _ground.Grounded;
        public Vector3 GroundNormal => _ground.Normal;

        /// <summary>Override the input source (network replay, AI, demos, etc.).</summary>
        public void SetInputProvider(IMovementInputProvider provider)
        {
            _inputProvider = provider ?? new LegacyMovementInput();
        }

        // --------------------------------------------------------------------
        // Unity lifecycle
        // --------------------------------------------------------------------

        private void Awake()
        {
            _rb      = GetComponent<Rigidbody>();
            _capsule = GetComponent<CapsuleCollider>();
            _groundProbe   = new GroundProbe();
            _inputProvider = new LegacyMovementInput();

            // Rigidbody setup — we drive velocity, engine handles collisions.
            _rb.useGravity              = false;
            _rb.freezeRotation          = true;
            _rb.interpolation           = RigidbodyInterpolation.Interpolate;
            _rb.collisionDetectionMode  = CollisionDetectionMode.ContinuousDynamic;

            if (viewRoot == null) viewRoot = transform;

            if (config == null)
            {
                Debug.LogError($"[{nameof(PlayerMotor)}] MovementConfig is not assigned on '{name}'. " +
                               "Create one via Assets > Create > TacticalFPS > Movement Config.", this);
                enabled = false;
            }
        }

        private void Update()
        {
            // Input reads at render rate; FixedUpdate consumes the latched snapshot.
            _input = _inputProvider.Read();
            if (_input.JumpDown) _jumpQueued = true;
        }

        private void FixedUpdate()
        {
            float dt = Time.fixedDeltaTime;

            // Drain the latched edge so we don't double-jump.
            MovementInputSnapshot input = _input;
            if (_jumpQueued) { input.JumpDown = true; _jumpQueued = false; }

            ProbeGround();

            float   maxSpeed   = ResolveMaxSpeed(input);
            Vector3 wishDir    = ComputeWishDir(input, out float wishMagnitude);
            float   wishSpeed  = wishMagnitude * maxSpeed;

            if (_ground.Grounded)
                GroundTick(input, wishDir, wishSpeed, dt);
            else
                AirTick(wishDir, wishSpeed, dt);

            // Gravity is applied AFTER friction/accel so the friction "control"
            // term never gets inflated by a previously-accumulated fall speed.
            if (!_ground.Grounded)
                _velocity.y -= config.gravity * dt;

            // Jump — late so we override any vertical velocity clamping above.
            bool canJump = _ground.Grounded || (config.autoBhop && input.JumpHeld && _wasGroundedLastTick);
            if (input.JumpDown && canJump)
            {
                _velocity.y      = config.jumpImpulse;
                _ground.Grounded = false;
            }

#if UNITY_6000_0_OR_NEWER
            _rb.linearVelocity = _velocity;
#else
            _rb.velocity = _velocity;
#endif
            _wasGroundedLastTick = _ground.Grounded;
        }

        // --------------------------------------------------------------------
        // Per-state ticks
        // --------------------------------------------------------------------

        private void GroundTick(in MovementInputSnapshot input, Vector3 wishDir, float wishSpeed, float dt)
        {
            // Stick to ground: discard residual downward velocity from the
            // previous airborne tick so friction is computed cleanly.
            if (_velocity.y < 0f) _velocity.y = 0f;

            // Perfect counter-strafe: zero velocity along the axis whose
            // opposing keys are both held this tick. This is the "first-bullet
            // accuracy" rule from the spec.
            if (config.perfectCounterStrafe)
            {
                if (input.OpposingStrafeX) CancelHorizontalVelocityAlong(viewRoot.right);
                if (input.OpposingStrafeZ) CancelHorizontalVelocityAlong(viewRoot.forward);
            }

            // Source applies friction EVERY ground tick (not only on no-input).
            // The non-linear stopSpeed dead-zone naturally produces the "slide
            // to a stop" feel without ever overshooting.
            _velocity = SourceMath.ApplyFriction(_velocity, config.friction, config.stopSpeed, dt);

            if (wishSpeed > 1e-4f)
                _velocity = SourceMath.Accelerate(_velocity, wishDir, wishSpeed, config.groundAccelerate, dt);

            // Slide along slopes — keeps speed magnitude on inclines without
            // launching the player into the air on downhill ramps.
            if (_ground.SlopeAngle > 0.1f)
                _velocity = Vector3.ProjectOnPlane(_velocity, _ground.Normal);
        }

        private void AirTick(Vector3 wishDir, float wishSpeed, float dt)
        {
            if (wishSpeed <= 1e-4f) return;

            _velocity = SourceMath.AirAccelerate(
                velocity:        _velocity,
                wishDir:         wishDir,
                wishSpeed:       wishSpeed,
                maxAirWishSpeed: config.maxAirWishSpeed,
                accel:           config.airAccelerate,
                deltaTime:       dt);
        }

        // --------------------------------------------------------------------
        // Helpers
        // --------------------------------------------------------------------

        private float ResolveMaxSpeed(in MovementInputSnapshot input)
        {
            if (input.CrouchHeld) return config.maxCrouchSpeed;
            if (input.WalkHeld)   return config.maxWalkSpeed;
            return config.maxRunSpeed;
        }

        /// <summary>
        /// Builds a horizontal, normalized wish-direction from yaw + input.
        /// Returns the original (pre-normalization) magnitude in [0, 1].
        /// </summary>
        private Vector3 ComputeWishDir(in MovementInputSnapshot input, out float magnitude)
        {
            Vector3 fwd   = viewRoot.forward;  fwd.y   = 0f;
            Vector3 right = viewRoot.right;    right.y = 0f;
            fwd.Normalize();
            right.Normalize();

            Vector3 wish = right * input.MoveX + fwd * input.MoveZ;
            magnitude = wish.magnitude;

            if (magnitude > 1f)
            {
                wish /= magnitude;
                magnitude = 1f;
            }
            else if (magnitude > 1e-4f)
            {
                wish /= magnitude;
            }
            else
            {
                wish = Vector3.zero;
                magnitude = 0f;
            }
            return wish;
        }

        private void CancelHorizontalVelocityAlong(Vector3 axis)
        {
            axis.y = 0f;
            float sqr = axis.sqrMagnitude;
            if (sqr < 1e-6f) return;
            axis /= Mathf.Sqrt(sqr);
            float along = Vector3.Dot(_velocity, axis);
            _velocity -= axis * along;
        }

        private void ProbeGround()
        {
            // Bottom hemisphere center, in world space.
            Vector3 bottom = transform.position
                           + _capsule.center
                           - Vector3.up * (_capsule.height * 0.5f - _capsule.radius);

            _ground = _groundProbe.Sample(
                capsuleBottom:  bottom,
                probeRadius:    config.groundProbeRadius,
                probeDistance:  config.groundProbeDistance,
                maxSlopeAngle:  config.maxSlopeAngle,
                mask:           config.groundMask);
        }

#if UNITY_EDITOR
        private void OnDrawGizmosSelected()
        {
            if (_capsule == null) _capsule = GetComponent<CapsuleCollider>();
            if (_capsule == null || config == null) return;

            Vector3 bottom = transform.position
                           + _capsule.center
                           - Vector3.up * (_capsule.height * 0.5f - _capsule.radius);

            Gizmos.color = _ground.Grounded ? Color.green : Color.red;
            Gizmos.DrawWireSphere(bottom + Vector3.down * config.groundProbeDistance, config.groundProbeRadius);
        }
#endif
    }
}
