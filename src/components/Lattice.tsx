"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * HERO SCENE — "Lattice"
 *
 * A rotating three-dimensional graph: nodes connected to their nearest
 * neighbours, lit from two sides in the site's two accent colours.
 *
 * What it represents is deliberately general. A graph of connected nodes is the
 * shared shape of every system in this portfolio's story — services talking to
 * each other, a schema, a dependency graph, a network. It is about the
 * engineer, not about any single repository, so it stays correct when the
 * projects change.
 *
 * Performance budget, because a 3D hero has to earn its place:
 *   · 2 draw calls total — one InstancedMesh for every node, one LineSegments
 *     for every edge.
 *   · Geometry and colours are built once and memoised; the per-frame cost is
 *     one group rotation and one damped vector, nothing allocated.
 *   · Every THREE object created here is disposed on unmount. R3F disposes
 *     what it creates from JSX, but geometry built imperatively is ours.
 */

const NODE_COUNT = 140;
const RADIUS = 4.2;
const LINK_DISTANCE = 1.5;
const MAX_LINKS = 260;

/** Deterministic PRNG. Math.random() would give a different lattice on the
 *  server and the client and on every remount; this stays stable. */
function seeded(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function buildLattice() {
  const points: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  // Fibonacci sphere, then pulled inward by a seeded amount so the volume is
  // filled rather than only its shell. A hollow shell reads as a ball; a filled
  // volume reads as a structure.
  for (let i = 0; i < NODE_COUNT; i++) {
    const y = 1 - (i / (NODE_COUNT - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const depth = 0.45 + seeded(i) * 0.55;
    points.push(
      new THREE.Vector3(
        Math.cos(theta) * r * RADIUS * depth,
        y * RADIUS * depth,
        Math.sin(theta) * r * RADIUS * depth,
      ),
    );
  }

  const positions: number[] = [];
  let links = 0;
  outer: for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i]!;
      const b = points[j]!;
      if (a.distanceTo(b) < LINK_DISTANCE) {
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        if (++links >= MAX_LINKS) break outer;
      }
    }
  }

  const edges = new THREE.BufferGeometry();
  edges.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

  return { points, edges };
}

export function Lattice({ signal, ledger }: { signal: string; ledger: string }) {
  const { points, edges } = useMemo(buildLattice, []);
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);

  // Reused across frames so the render loop allocates nothing.
  const damped = useRef(new THREE.Vector2());
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // A small share of nodes are tinted with the operations accent, so the two
  // threads of the story are present in the object itself rather than only in
  // the copy beside it.
  const colours = useMemo(() => {
    const primary = new THREE.Color(signal);
    const secondary = new THREE.Color(ledger);
    return Array.from({ length: NODE_COUNT }, (_, i) =>
      seeded(i + 91) > 0.86 ? secondary : primary,
    );
  }, [signal, ledger]);

  /**
   * Instance matrices must be written after the ref is attached.
   *
   * This was previously done inside useMemo, which runs during render — before
   * React attaches refs — so `mesh.current` was null, the write silently did
   * nothing, and every instance kept the identity matrix. All 140 nodes
   * rendered stacked at the origin. useLayoutEffect is the correct hook: it
   * runs after commit and before paint, so there is no visible flash.
   */
  useLayoutEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;

    points.forEach((point, i) => {
      dummy.position.copy(point);
      dummy.scale.setScalar(0.55 + seeded(i + 17) * 0.5);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
      // setColorAt writes to instanceColor. Attaching a colour attribute to the
      // geometry instead would apply one colour to every instance — the
      // geometry is shared — and its length would not match the vertex count.
      instanced.setColorAt(i, colours[i] ?? colours[0]!);
    });
    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
    instanced.computeBoundingSphere();
  }, [points, dummy, colours]);

  // Geometry built imperatively is not owned by R3F, so we dispose it.
  useLayoutEffect(() => () => edges.dispose(), [edges]);

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;

    // delta-scaled so the rotation runs at the same real-world speed on a
    // 60Hz and a 120Hz display, and clamped so a backgrounded tab returning
    // with a large delta does not snap the scene through a half-turn.
    const step = Math.min(delta, 0.05);
    node.rotation.y += step * 0.09;

    // Damped pointer parallax. state.pointer is already normalised to -1..1,
    // so the previous multiply-then-divide by viewport width was a no-op.
    damped.current.x += (state.pointer.x * 0.22 - damped.current.x) * 0.045;
    damped.current.y += (state.pointer.y * 0.16 - damped.current.y) * 0.045;

    node.rotation.x = -damped.current.y;
    node.position.x = damped.current.x * 0.6;
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[6, 5, 6]} intensity={70} color={signal} distance={22} />
      <pointLight position={[-7, -4, -3]} intensity={45} color={ledger} distance={22} />

      <group ref={group}>
        <instancedMesh
          ref={mesh}
          args={[undefined, undefined, NODE_COUNT]}
          frustumCulled={false}
        >
          <icosahedronGeometry args={[0.075, 1]} />
          <meshStandardMaterial roughness={0.28} metalness={0.08} toneMapped={false} />
        </instancedMesh>

        <lineSegments geometry={edges} frustumCulled={false}>
          <lineBasicMaterial
            color={signal}
            transparent
            opacity={0.22}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>
      </group>
    </>
  );
}
