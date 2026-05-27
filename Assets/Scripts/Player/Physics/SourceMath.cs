// -----------------------------------------------------------------------------
//  SourceMath.cs
//  TacticalFPS.Player.Physics
//
//  Canonical Source Engine movement math, ported 1:1 from Valve's
//  CGameMovement (game/shared/gamemovement.cpp). Pure static, no allocations,
//  no Unity API dependencies beyond UnityEngine.Vector3.
//
//  Reference (sv_cheats community/leaked SDK):
//      Friction()       -> exact deceleration with sv_stopspeed dead-zone
//      Accelerate()     -> ground accel, addspeed clamp
//      AirAccelerate()  -> air accel with sv_air_max_wishspeed cap (= 30 u/s)
//                          THIS cap is what enables strafe-jump / bhop gain.
// -----------------------------------------------------------------------------

using UnityEngine;

namespace TacticalFPS.Player.Physics
{
    /// <summary>
    /// Stateless, allocation-free implementation of Source Engine movement math.
    /// All vectors are expected in world space, horizontal (XZ) planar math is
    /// the caller's responsibility (zero the Y component before passing in if
    /// you want pure horizontal acceleration / friction).
    /// </summary>
    public static class SourceMath
    {
        /// <summary>
        /// Applies non-linear ground friction. Below <paramref name="stopSpeed"/>
        /// the friction "control" term is clamped to stopSpeed, producing the
        /// signature Source dead-zone deceleration (instant stop at low speed).
        /// </summary>
        public static Vector3 ApplyFriction(Vector3 velocity, float friction, float stopSpeed, float deltaTime)
        {
            float speed = velocity.magnitude;
            if (speed < 1e-4f)
                return Vector3.zero;

            // Source: float control = (speed < stopspeed) ? stopspeed : speed;
            float control = speed < stopSpeed ? stopSpeed : speed;
            float drop    = control * friction * deltaTime;
            float newSpeed = speed - drop;
            if (newSpeed < 0f) newSpeed = 0f;
            if (newSpeed == speed) return velocity;

            return velocity * (newSpeed / speed);
        }

        /// <summary>
        /// Ground acceleration. Adds velocity along <paramref name="wishDir"/>
        /// until the projected speed reaches <paramref name="wishSpeed"/>.
        /// <paramref name="wishDir"/> MUST be normalized.
        /// </summary>
        public static Vector3 Accelerate(Vector3 velocity, Vector3 wishDir, float wishSpeed, float accel, float deltaTime)
        {
            float currentSpeed = Vector3.Dot(velocity, wishDir);
            float addSpeed     = wishSpeed - currentSpeed;
            if (addSpeed <= 0f) return velocity;

            float accelSpeed = accel * wishSpeed * deltaTime;
            if (accelSpeed > addSpeed) accelSpeed = addSpeed;

            return velocity + wishDir * accelSpeed;
        }

        /// <summary>
        /// Air acceleration — the canonical Source formula.
        ///
        /// Key detail (the bhop / strafe-jump trick):
        ///   * addSpeed is computed against a CAPPED wishSpeed (default 30 u/s
        ///     in Source, ~0.762 m/s here).
        ///   * accelSpeed is computed against the FULL (uncapped) wishSpeed.
        ///
        /// This asymmetry is what lets a player gain horizontal speed in the
        /// air by strafing — the velocity vector is rotated by a small amount
        /// each tick without exceeding the air speed cap directly.
        ///
        /// <paramref name="wishDir"/> MUST be normalized.
        /// </summary>
        public static Vector3 AirAccelerate(
            Vector3 velocity,
            Vector3 wishDir,
            float wishSpeed,
            float maxAirWishSpeed,
            float accel,
            float deltaTime)
        {
            float wishSpeedCapped = wishSpeed > maxAirWishSpeed ? maxAirWishSpeed : wishSpeed;

            float currentSpeed = Vector3.Dot(velocity, wishDir);
            float addSpeed     = wishSpeedCapped - currentSpeed;
            if (addSpeed <= 0f) return velocity;

            // NOTE: accel uses the FULL wishSpeed, not the capped one.
            float accelSpeed = accel * wishSpeed * deltaTime;
            if (accelSpeed > addSpeed) accelSpeed = addSpeed;

            return velocity + wishDir * accelSpeed;
        }
    }
}
