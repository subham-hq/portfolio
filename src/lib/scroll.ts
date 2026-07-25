/**
 * SCROLL STORE
 *
 * A single mutable object holding the page's scroll state, written once per
 * frame by <ScrollDirector /> and read by everything that reacts to scrolling:
 * the WebGL lattice, the ambient canvas, and CSS through custom properties.
 *
 * Why a module-level object rather than context or state: the consumers are a
 * `useFrame` callback and two `requestAnimationFrame` loops. Routing 60 updates
 * a second through React would re-render the tree for values that never touch
 * the DOM directly. Reading a plain object costs nothing, and it means the
 * whole page shares one scroll listener and one rAF loop instead of five.
 *
 * Values are normalised so consumers never need to know about pixel heights.
 */
export const scroll = {
  /** Raw scroll offset in pixels. */
  y: 0,

  /** 0 at the top of the document, 1 at the bottom. */
  progress: 0,

  /** Signed, damped scroll speed, clamped to -1..1. Negative is upward. */
  velocity: 0,

  /** Absolute velocity, 0..1. Exposed separately because CSS `abs()` is not
   *  yet safe to rely on across the browsers this site supports. */
  speed: 0,

  /**
   * How far the reader has moved past the first viewport, 0..1.
   *
   * This is the value that drives the hero dissolve: at 0 the lattice is
   * whole, at 1 it has scattered into the starfield behind the page. It
   * saturates at one viewport height, so the effect completes exactly as the
   * hero leaves.
   */
  heroExit: 0,
};

export type ScrollState = typeof scroll;
