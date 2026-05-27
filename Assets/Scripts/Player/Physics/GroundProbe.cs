// -----------------------------------------------------------------------------
//  GroundProbe.cs
//  TacticalFPS.Player.Physics
//
//  Zero-allocation ground detection using a pre-sized RaycastHit buffer
//  and Physics.SphereCastNonAlloc. Returns the lowest contact whose slope
//  is within the walkable threshold (matches Source's m_surfaceFriction
//  & stepheight semantics, without the step solver — that lives in the
//  Motor's collide-and-slide pass).
// -----------------------------------------------------------------------------

using UnityEngine;

namespace TacticalFPS.Player.Physics
{
    /// <summary>
    /// Snapshot of the ground state for the current tick.
    /// </summary>
    public struct GroundHit
    {
        public bool     Grounded;
        public Vector3  Normal;
        public Vector3  Point;
        public float    SlopeAngle;
        public Collider Collider;
    }

    /// <summary>
    /// Pooled spherecast-based ground sampler. NOT thread safe; one instance
    /// per motor. The internal buffer is pre-allocated, so Sample() does not
    /// allocate on the managed heap.
    /// </summary>
    public sealed class GroundProbe
    {
        // 4 hits is plenty for sane geometry; raise if you have crazy overlap.
        private readonly RaycastHit[] _hits = new RaycastHit[4];

        /// <summary>
        /// Casts a sphere downward from <paramref name="capsuleBottom"/> and
        /// returns the lowest walkable contact, if any.
        /// </summary>
        /// <param name="capsuleBottom">World position of the bottom hemisphere center.</param>
        /// <param name="probeRadius">Sphere radius (slightly smaller than capsule radius recommended).</param>
        /// <param name="probeDistance">Extra downward sweep distance.</param>
        /// <param name="maxSlopeAngle">Max walkable slope (deg).</param>
        /// <param name="mask">Ground layer mask.</param>
        public GroundHit Sample(
            Vector3   capsuleBottom,
            float     probeRadius,
            float     probeDistance,
            float     maxSlopeAngle,
            LayerMask mask)
        {
            GroundHit gh = default;

            int count = UnityEngine.Physics.SphereCastNonAlloc(
                origin:        capsuleBottom + Vector3.up * probeRadius,
                radius:        probeRadius * 0.95f,
                direction:     Vector3.down,
                results:       _hits,
                maxDistance:   probeRadius + probeDistance,
                layerMask:     mask,
                queryTriggerInteraction: QueryTriggerInteraction.Ignore);

            float bestY = float.PositiveInfinity;
            for (int i = 0; i < count; i++)
            {
                ref readonly RaycastHit h = ref _hits[i];

                // SphereCast returns distance == 0 for initial overlaps; ignore those
                // unless they actually have a surface normal (some configs do).
                if (h.normal.sqrMagnitude < 1e-6f) continue;

                float angle = Vector3.Angle(h.normal, Vector3.up);
                if (angle > maxSlopeAngle) continue;

                if (h.point.y < bestY)
                {
                    bestY = h.point.y;
                    gh.Grounded   = true;
                    gh.Normal     = h.normal;
                    gh.Point      = h.point;
                    gh.SlopeAngle = angle;
                    gh.Collider   = h.collider;
                }
            }

            return gh;
        }
    }
}
