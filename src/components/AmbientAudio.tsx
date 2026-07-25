"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "@/lib/utils";

/**
 * AMBIENT AUDIO
 *
 * A low, slowly-moving drone, synthesised in the browser with the Web Audio
 * API. There is no mp3: the whole thing is four oscillators and a filter, so
 * it costs zero bytes of transfer and cannot be a loading cost on a page that
 * is otherwise carefully budgeted. Writing the sound rather than shipping one
 * also happens to be the more interesting answer on an engineer's site.
 *
 * ── On autoplay ────────────────────────────────────────────────────────────
 * It starts OFF, and that is not a compromise — every current browser blocks
 * audio until the user has interacted with the page, so sound-on-arrival is
 * not implementable by anyone, including the reference sites. They all ship a
 * toggle for exactly this reason.
 *
 * It is also the right call independently. The people this site is built for
 * will open it at a desk, possibly in an open-plan office, often with several
 * tabs already going. Audio they did not ask for is the fastest way to make
 * someone close a tab. An obvious control they can choose to use is not.
 *
 * The preference persists, so a returning visitor who turned it on gets it
 * back on their next visit — that first gesture is enough for the browser.
 *
 * ── The sound ──────────────────────────────────────────────────────────────
 * A2 root with a fifth and an octave above it, slightly detuned so the tuning
 * beats very slowly against itself. A lowpass filter drifts on a ~40 second
 * LFO, which is what stops it reading as a flat test tone. Master gain sits at
 * 0.045: audible on speakers, never intrusive.
 */

const STORAGE_KEY = "ambient-audio";

/** Root, fifth, octave, and a distant shimmer. Detunes are in cents. */
const VOICES: { frequency: number; detune: number; gain: number }[] = [
  { frequency: 55, detune: 0, gain: 1 },
  { frequency: 82.41, detune: -4, gain: 0.55 },
  { frequency: 110, detune: 5, gain: 0.34 },
  { frequency: 164.81, detune: -7, gain: 0.14 },
];

const MASTER_GAIN = 0.045;
const FADE_IN = 2.2;
const FADE_OUT = 0.9;

interface Graph {
  context: AudioContext;
  master: GainNode;
  stop: () => void;
}

function buildGraph(): Graph | null {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;

  const context = new Ctor();

  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.7;
  filter.connect(master);

  // Slow filter sweep. Without it the drone is a static tone; with it the
  // texture opens and closes over about forty seconds.
  const lfo = context.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.025;
  const lfoDepth = context.createGain();
  lfoDepth.gain.value = 190;
  lfo.connect(lfoDepth);
  lfoDepth.connect(filter.frequency);
  lfo.start();

  const oscillators: OscillatorNode[] = [lfo];

  for (const voice of VOICES) {
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.value = voice.frequency;
    osc.detune.value = voice.detune;

    const gain = context.createGain();
    gain.gain.value = voice.gain;

    osc.connect(gain);
    gain.connect(filter);
    osc.start();
    oscillators.push(osc);
  }

  return {
    context,
    master,
    stop: () => {
      for (const osc of oscillators) {
        try {
          osc.stop();
        } catch {
          // Already stopped — nothing to do.
        }
      }
      void context.close();
    },
  };
}

export function AmbientAudio() {
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const graph = useRef<Graph | null>(null);

  useEffect(() => {
    setReady(true);
    try {
      if (localStorage.getItem(STORAGE_KEY) === "on") setEnabled(true);
    } catch {
      // Storage blocked. Default to off, which is the safe direction.
    }
  }, []);

  // Build, fade, and tear down in response to `enabled`.
  useEffect(() => {
    if (!ready) return;

    if (enabled) {
      if (!graph.current) graph.current = buildGraph();
      const g = graph.current;
      if (!g) return;

      // Safari suspends new contexts until a gesture resolves.
      void g.context.resume();

      const now = g.context.currentTime;
      g.master.gain.cancelScheduledValues(now);
      g.master.gain.setValueAtTime(g.master.gain.value, now);
      g.master.gain.linearRampToValueAtTime(MASTER_GAIN, now + FADE_IN);
      return;
    }

    const g = graph.current;
    if (!g) return;

    const now = g.context.currentTime;
    g.master.gain.cancelScheduledValues(now);
    g.master.gain.setValueAtTime(g.master.gain.value, now);
    g.master.gain.linearRampToValueAtTime(0, now + FADE_OUT);

    // Tear the graph down once silent, rather than leaving oscillators running
    // at zero gain for the rest of the session.
    const timer = setTimeout(
      () => {
        g.stop();
        graph.current = null;
      },
      FADE_OUT * 1000 + 120,
    );

    return () => clearTimeout(timer);
  }, [enabled, ready]);

  // Duck to silence when the tab is hidden. Audio from a tab nobody is looking
  // at is the single most irritating thing a site can do.
  useEffect(() => {
    const onVisibility = () => {
      const g = graph.current;
      if (!g) return;
      const now = g.context.currentTime;
      g.master.gain.cancelScheduledValues(now);
      g.master.gain.linearRampToValueAtTime(
        document.hidden ? 0 : enabled ? MASTER_GAIN : 0,
        now + 0.4,
      );
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [enabled]);

  // Stop the audio if the component ever unmounts.
  useEffect(() => {
    return () => {
      graph.current?.stop();
      graph.current = null;
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
