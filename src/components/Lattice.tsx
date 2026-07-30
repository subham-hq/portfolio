"use client";

import { useFrame } from "@react-three/fiber";
import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { scroll } from "@/lib/scroll";

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
 * ── The scroll dissolve ────────────────────────────────────────────────────
 * As the reader leaves the first viewport the graph comes apart: edges fade
 * first, then the nodes push outward along their own radius, shrink, and go
 * out. What is left reads as part of the starfield behind the page.
 *
 * The intent is specific. The site opens on a system that is whole and
 * connected; scrolling takes it apart into its constituent points, which are
 * indistinguishable from the ambient field the rest of the page sits on. The
 * two signature elements become one thing rather than two unrelated effects.
 *
 * Driven by scroll position, not time — it tracks the reader exactly, runs
 * backwards when they scroll up, and holds still when they stop.
 *
 * Performance budget, because a 3D hero has to earn its place:
 *   · 2 draw calls total — one InstancedMesh for every node, one LineSegments
 *     for every edge.
 *   · Geometry and colours are built once and memoised; the per-frame cost is
 *     one group rotation and one damped vector, nothing allocated.
 *   · Every THREE object created here is disposed on unmount. R3F disposes
 *     what it creates from JSX, but geometry built imperatively is ours.
 */

/**
 * Full-size scene. This is what desktop renders, unchanged.
 *
 * `density` below scales it down for a small viewport — not for performance
 * (two draw calls is nothing anywhere) but for composition: 140 nodes inside a
 * 353x190 hero box reads as clutter rather than as a structure. Fewer nodes at
 * the same radius is the same object, legible at a smaller size.
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

function buildLattice(nodeCount: number, maxLinks: number) {
  const points: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  // Fibonacci sphere, then pulled inward by a seeded amount so the volume is
  // filled rather than only its shell. A hollow shell reads as a ball; a filled
  // volume reads as a structure.
  for (let i = 0; i < nodeCount; i++) {
    const y = 1 - (i / (nodeCount - 1)) * 2;
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
        if (++links >= maxLinks) break outer;
      }
    }
  }

  const edges = new THREE.BufferGeometry();
  edges.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

  return { points, edges };
}

export function Lattice({
  signal,
  ledger,
  /** 1 is the full scene. Lower values thin it out for a small viewport. */
  density = 1,
}: {
  signal: string;
  ledger: string;
  density?: number;
}) {
  const nodeCount = Math.max(40, Math.round(NODE_COUNT * density));
  const maxLinks = Math.max(60, Math.round(MAX_LINKS * density));

  const { points, edges } = useMemo(
    () => buildLattice(nodeCount, maxLinks),
    [nodeCount, maxLinks],
  );
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);

  // Reused across frames so the render loop allocates nothing.
  const damped = useRef(new THREE.Vector2());
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Materials are held by ref so the dissolve can write straight to them,
  // rather than re-rendering the component sixty times a second.
  const nodeMaterial = useRef<THREE.MeshStandardMaterial>(null);
  const edgeMaterial = useRef<THREE.LineBasicMaterial>(null);

  // Damped copy of scroll.heroExit. The raw value is already smooth, but a
  // second pass keeps the scatter from stuttering if a frame is dropped.
  const dissolve = useRef(0);
  const scatter = useMemo(() => new THREE.Vector3(), []);

  // A small share of nodes are tinted with the operations accent, so the two
  // threads of the story are present in the object itself rather than only in
  // the copy beside it.
  const colours = useMemo(() => {
    const primary = new THREE.Color(signal);
    const secondary = new THREE.Color(ledger);
    return Array.from({ length: nodeCount }, (_, i) =>
      seeded(i + 91) > 0.86 ? secondary : primary,
    );
  }, [signal, ledger, nodeCount]);

  /**
   * Instance matrices must be written after the ref is attached.
   *
   * This was previously done inside useMemo, which runs during render — before
   * React attaches refs — so `mesh.current` was null, the write silently did
   * nothing, and every instance kept the identity matrix. All 140 nodes
   * rendered stacked at the origin. useLayoutEffect is the correct hook: it
   * runs after commit and before paint, so there is no visible flash.
   */
  /**
   * Write every instance matrix for a given dissolve amount.
   *
   * At 0 the nodes sit exactly where the lattice put them. As it rises each
   * node travels outward along its own radius — so the structure expands from
   * its centre rather than drifting in one direction — and shrinks toward
   * nothing. The per-node offset means they do not all leave together.
   */
  const writeInstances = useCallback(
    (amount: number) => {
      const instanced = mesh.current;
      if (!instanced) return;

      for (let i = 0; i < points.length; i++) {
        const point = points[i]!;
        // Stagger: outer nodes begin leaving before inner ones.
        const stagger = 0.55 + seeded(i + 41) * 0.45;
        const local = Math.max(0, Math.min(1, (amount - (1 - stagger) * 0.35) / stagger));
        const push = local * local * 7.5;

        scatter.copy(point).normalize().multiplyScalar(push);
        dummy.position.copy(point).add(scatter);
        dummy.scale.setScalar((0.55 + seeded(i + 17) * 0.5) * (1 - local * 0.85));
        dummy.updateMatrix();
        instanced.setMatrixAt(i, dummy.matrix);
      }

      instanced.instanceMatrix.needsUpdate = true;
    },
    [points, dummy, scatter],
  );

  useLayoutEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;

    writeInstances(0);

    for (let i = 0; i < points.length; i++) {
      // setColorAt writes to instanceColor. Attaching a colour attribute to
      // the geometry instead would apply one colour to every instance — the
      // geometry is shared — and its length would not match the vertex count.
      instanced.setColorAt(i, colours[i] ?? colours[0]!);
    }
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;

    // The scatter takes nodes well outside the original bounds; without a
    // generous bounding sphere they would be culled mid-flight.
    instanced.boundingSphere = new THREE.Sphere(new THREE.Vector3(), RADIUS + 9);
  }, [points, colours, writeInstances]);

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

    // ── Scroll dissolve ──────────────────────────────────────────────────
    const targetDissolve = scroll.heroExit;
    dissolve.current += (targetDissolve - dissolve.current) * 0.12;

    // Skip the instance rewrite entirely once settled at either end. Below
    // 0.002 of change there is nothing to see, and this is 140 matrix writes.
    if (Math.abs(targetDissolve - dissolve.current) > 0.002 || dissolve.current > 0.001) {
      writeInstances(dissolve.current);
    }

    // Edges go first and go faster: the connections break before the nodes
    // scatter, which is what makes it read as a structure coming apart rather
    // than a group of dots moving.
    if (edgeMaterial.current) {
      edgeMaterial.current.opacity = 0.22 * Math.max(0, 1 - dissolve.current * 2.1);
    }
    if (nodeMaterial.current) {
      nodeMaterial.current.opacity = Math.max(0, 1 - dissolve.current * 1.25);
    }

    // Scroll speed spins the graph. Scrolling hard visibly drives the object,
    // which ties the page's motion to its centrepiece rather than leaving them
    // as two unrelated animations.
    node.rotation.y += scroll.velocity * step * 1.4;
  });

  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[6, 5, 6]} intensity={70} color={signal} distance={22} />
      <pointLight position={[-7, -4, -3]} intensity={45} color={ledger} distance={22} />

      <group ref={group}>
        <instancedMesh
          ref={mesh}
          args={[undefined, undefined, nodeCount]}
          frustumCulled={false}
        >
          <icosahedronGeometry args={[0.075, 1]} />
          <meshStandardMaterial roughness={0.28} metalness={0.08} toneMapped={false} />
        </instancedMesh>

        <lineSegments geometry={edges} frustumCulled={false}>
          <lineBasicMaterial
            ref={edgeMaterial}
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
