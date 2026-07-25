"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";

/**
 * AMBIENT AUDIO
 *
 * Plays a single looping track behind the site, behind a header toggle.
 *
 * ── On autoplay ────────────────────────────────────────────────────────────
 * It starts OFF, and that is not a compromise — every current browser blocks
 * audio until the user has interacted with the page, so sound-on-arrival is
 * not implementable by anyone, including the reference sites. They all ship a
 * toggle for exactly this reason.
 *
 * It is also the right call independently. The people this site is built for
 * will open it at a desk, often in an open-plan office, usually with several
 * tabs already going. Audio nobody asked for is the fastest way to lose them.
 *
 * ── Nothing downloads until it is wanted ───────────────────────────────────
 * The file is 3.4 MB. That would be, by a wide margin, the heaviest thing on
 * a site whose entire JavaScript budget is around 110 kB — so the <audio>
 * element is created in JavaScript and its `src` is not set until the moment
 * the toggle is first switched on. A visitor who never turns sound on never
 * requests a byte of it. That single decision is why shipping a real track
 * here costs nothing.
 *
 * ── The loop seam ──────────────────────────────────────────────────────────
 * `loop` on an <audio> element restarts an MP3 with a short gap, because the
 * encoder pads the start and end of the stream. On a five-minute ambient bed
 * that gap lands as an audible click, and the track's own ending is abrupt
 * against its beginning anyway. So the loop is handled manually: the volume
 * fades down over the last few seconds, the element seeks back to zero, and
 * it fades up again. The seam becomes a slow breath instead of a jump.
 */

const SRC = "/ambient.mp3";
const STORAGE_KEY = "ambient-audio";

/** Background level. High enough to hear over a quiet room, low enough that
 *  it never competes with anything the visitor is actually doing. */
const VOLUME = 0.3;

const FADE_IN = 2600;
const FADE_OUT = 900;

/** Seconds before the end at which the loop fade begins. */
const LOOP_FADE = 4;

export function AmbientAudio() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  const audio = useRef<HTMLAudioElement | null>(null);
  const fadeRaf = useRef(0);
  const looping = useRef(false);

  /** Tween the element volume. Cancels any tween already running, so rapid
   *  toggling cannot stack two fades fighting over the same value. */
  const fadeTo = useCallback((target: number, duration: number, onDone?: () => void) => {
    const element = audio.current;
    if (!element) return;

    cancelAnimationFrame(fadeRaf.current);

    const from = element.volume;
    const delta = target - from;
    if (Math.abs(delta) < 0.001 || duration <= 0) {
      element.volume = target;
      onDone?.();
      return;
    }

    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeInOutSine — a linear volume ramp is audible as a ramp; this is not.
      const eased = 0.5 - Math.cos(t * Math.PI) / 2;
      element.volume = Math.max(0, Math.min(1, from + delta * eased));

      if (t < 1) {
        fadeRaf.current = requestAnimationFrame(step);
      } else {
        onDone?.();
      }
    };

    fadeRaf.current = requestAnimationFrame(step);
  }, []);

  /** Create the element and attach the source. Called on first enable only. */
  const ensureAudio = useCallback((): HTMLAudioElement => {
    if (audio.current) return audio.current;

    const element = new Audio();
    element.src = SRC;
    element.preload = "auto";
    // Manual looping — see the note on the seam above.
    element.loop = false;
    element.volume = 0;

    // Handle the loop seam. `timeupdate` fires a few times a second, which is
    // ample resolution for a four-second fade.
    element.addEventListener("timeupdate", () => {
      if (!element.duration || looping.current) return;
      if (element.currentTime < element.duration - LOOP_FADE) return;

      looping.current = true;
      fadeTo(0, LOOP_FADE * 1000, () => {
        element.currentTime = 0;
        void element.play().catch(() => {});
        fadeTo(VOLUME, FADE_IN, () => {
          looping.current = false;
        });
      });
    });

    // If the file fails to load, fail quietly and reset the control rather
    // than leaving a toggle that claims to be playing silence.
    element.addEventListener("error", () => setEnabled(false));

    audio.current = element;
    return element;
  }, [fadeTo]);

  useEffect(() => {
    setReady(true);
    try {
      if (localStorage.getItem(STORAGE_KEY) === "on") setEnabled(true);
    } catch {
      // Storage blocked. Default to off, which is the safe direction.
    }
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (enabled) {
      const element = ensureAudio();
      element.volume = 0;

      void element
        .play()
        .then(() => fadeTo(VOLUME, FADE_IN))
        .catch(() => {
          // A returning visitor arrives with the preference already on, but
          // the browser will not start audio before they have interacted.
          // Rather than flipping the toggle off and contradicting their saved
          // choice, arm the next real gesture to start it.
          const start = () => {
            void element
              .play()
              .then(() => fadeTo(VOLUME, FADE_IN))
              .catch(() => {});
            window.removeEventListener("pointerdown", start);
            window.removeEventListener("keydown", start);
          };
          window.addEventListener("pointerdown", start, { once: true });
          window.addEventListener("keydown", start, { once: true });
        });

      return;
    }

    const element = audio.current;
    if (!element) return;

    fadeTo(0, FADE_OUT, () => {
      element.pause();
      looping.current = false;
    });
  }, [enabled, ready, ensureAudio, fadeTo]);

  // Duck to silence when the tab is hidden. Audio from a tab nobody is looking
  // at is the single most irritating thing a site can do.
  useEffect(() => {
    const onVisibility = () => {
      const element = audio.current;
      if (!element || !enabled || looping.current) return;

      if (document.hidden) {
        fadeTo(0, 400, () => element.pause());
      } else {
        void element
          .play()
          .then(() => fadeTo(VOLUME, 900))
          .catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled, fadeTo]);

  // Stop and release on unmount.
  useEffect(() => {
    return () => {
      cancelAnimationFrame(fadeRaf.current);
      const element = audio.current;
      if (element) {
        element.pause();
        element.src = "";
      }
      audio.current = null;
    };
  }, []);

  const toggle = useCallback(() => {
    setEnabled((value) => {
      const next = !value;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {
        // Not worth failing the interaction over.
      }
      return next;
    });
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Turn ambient sound off" : "Turn ambient sound on"}
      title={enabled ? "Sound on" : "Sound off"}
      className="tap mono inline-flex items-center gap-1.5 text-micro uppercase tracking-[0.11em] text-fg-faint transition-colors hover:text-fg"
    >
      <span className="hidden sm:inline">Sound</span>
      {/* Four bars that animate only while sound is playing, so the control
          shows its own state without needing a label change. */}
      <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={cx(
              "w-[2px] origin-bottom rounded-[1px] transition-colors",
              enabled ? "eq-bar bg-signal" : "bg-current",
            )}
            style={{
              height: enabled ? "100%" : "4px",
              animationDelay: `${bar * 0.16}s`,
            }}
          />
        ))}
      </span>
    </button>
  );
}
