Role: Senior Game Developer & Physics Engineer (Unity/C#).
Task: Implement a high-fidelity competitive tactical FPS framework in Unity 2022.3+ LTS replicating the exact mechanical feel of Counter-Strike (Source Engine physics).
Constraints: Zero allocations in Update(). No generic arcade physics. Maximum mathematical precision. Clean code architecture.

---

## 1. CUSTOM KINEMATIC MOVEMENT (Source Engine Feel)
Do not use generic Unity physics. Implement a Rigidbody-based or custom Kinematic character controller handling velocity vectors manually.

### Specifications:
- **Friction & Acceleration:** Implement non-linear acceleration. Apply dynamic ground friction that scales based on current velocity when no input is detected.
- **Perfect Counter-Strafing:** Instant deceleration and velocity vector reset to 0 when opposing keys (e.g., A and D) are pressed, granting immediate shooting accuracy.
- **AirAccelerate (Bunnyhopping/Strafing):** Implement the exact Source Engine formula:
  
```csharp
  float wishspeed = wishdir.magnitude * maxSpeed;
  wishdir.Normalize();
  float currentspeed = Vector3.Dot(velocity, wishdir);
  float addspeed = wishspeed - currentspeed;
  if (addspeed <= 0) return;
  float accelspeed = airAcceleration * wishspeed * Time.deltaTime;
  if (accelspeed > addspeed) accelspeed = addspeed;
  velocity += accelspeed * wishdir;