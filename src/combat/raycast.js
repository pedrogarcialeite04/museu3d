export function raySphereT(ox, oy, oz, dx, dy, dz, cx, cy, cz, r) {
  const ocx = ox - cx;
  const ocy = oy - cy;
  const ocz = oz - cz;
  const b = ocx * dx + ocy * dy + ocz * dz;
  const c = ocx * ocx + ocy * ocy + ocz * ocz - r * r;
  const disc = b * b - c;
  if (disc < 0) return -1;
  const sq = Math.sqrt(disc);
  const t1 = -b - sq;
  if (t1 > 0) return t1;
  const t2 = -b + sq;
  return t2 > 0 ? t2 : -1;
}

export function rayAabbT(ox, oy, oz, dx, dy, dz, mn, mx) {
  let tmin = 0;
  let tmax = Infinity;
  if (Math.abs(dx) < 1e-8) {
    if (ox < mn.x || ox > mx.x) return -1;
  } else {
    const inv = 1 / dx;
    let t1 = (mn.x - ox) * inv;
    let t2 = (mx.x - ox) * inv;
    if (t1 > t2) {
      const t = t1;
      t1 = t2;
      t2 = t;
    }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return -1;
  }
  if (Math.abs(dy) < 1e-8) {
    if (oy < mn.y || oy > mx.y) return -1;
  } else {
    const inv = 1 / dy;
    let t1 = (mn.y - oy) * inv;
    let t2 = (mx.y - oy) * inv;
    if (t1 > t2) {
      const t = t1;
      t1 = t2;
      t2 = t;
    }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return -1;
  }
  if (Math.abs(dz) < 1e-8) {
    if (oz < mn.z || oz > mx.z) return -1;
  } else {
    const inv = 1 / dz;
    let t1 = (mn.z - oz) * inv;
    let t2 = (mx.z - oz) * inv;
    if (t1 > t2) {
      const t = t1;
      t1 = t2;
      t2 = t;
    }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return -1;
  }
  return tmin > 0 ? tmin : (tmax > 0 ? tmax : -1);
}
