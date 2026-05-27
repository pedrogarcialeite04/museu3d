// -----------------------------------------------------------------------------
//  PlayerCamera.cs
//  TacticalFPS.Player
//
//  Minimal mouse-look camera. Yaw is applied to the body root (so wish-dir
//  reads correctly), pitch to the camera transform only. CS-style: no roll,
//  no smoothing, raw pixel-accurate input.
//
//  Sensitivity is interpreted as "Source units": with m_yaw = 0.022 (default),
//  multiplying by mouseDeltaPixels gives the Source feel 1:1 for any DPI.
// -----------------------------------------------------------------------------

using UnityEngine;

namespace TacticalFPS.Player
{
    [DefaultExecutionOrder(100)] // run AFTER motor input read in Update
    [AddComponentMenu("TacticalFPS/Player Camera")]
    public sealed class PlayerCamera : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Transform body;        // yaw target (player root)
        [SerializeField] private Transform cameraPivot; // pitch target (head)

        [Header("Sensitivity")]
        [Tooltip("Source 'sensitivity' value. Real angle delta = mouseDeltaPx * m_yaw * sensitivity.")]
        public float sensitivity = 2.0f;

        [Tooltip("Source's m_yaw — 0.022 deg/pixel matches CS:GO 1:1.")]
        public float mYaw = 0.022f;

        [Tooltip("Source's m_pitch — 0.022 deg/pixel matches CS:GO 1:1.")]
        public float mPitch = 0.022f;

        [Header("Pitch clamp")]
        public float minPitch = -89f;
        public float maxPitch =  89f;

        [Header("Cursor")]
        public bool lockCursorOnStart = true;

        private float _yaw;
        private float _pitch;

        private void Start()
        {
            if (body == null)        body = transform;
            if (cameraPivot == null) cameraPivot = transform;

            _yaw   = body.eulerAngles.y;
            _pitch = cameraPivot.localEulerAngles.x;
            if (_pitch > 180f) _pitch -= 360f;

            if (lockCursorOnStart)
            {
                Cursor.lockState = CursorLockMode.Locked;
                Cursor.visible   = false;
            }
        }

        private void Update()
        {
            float dx = Input.GetAxisRaw("Mouse X");
            float dy = Input.GetAxisRaw("Mouse Y");

            _yaw   += dx * mYaw   * sensitivity;
            _pitch -= dy * mPitch * sensitivity;
            if (_pitch < minPitch) _pitch = minPitch;
            if (_pitch > maxPitch) _pitch = maxPitch;

            body.rotation              = Quaternion.Euler(0f,    _yaw, 0f);
            cameraPivot.localRotation  = Quaternion.Euler(_pitch, 0f,   0f);

            if (Input.GetKeyDown(KeyCode.Escape))
            {
                Cursor.lockState = CursorLockMode.None;
                Cursor.visible   = true;
            }
        }
    }
}
