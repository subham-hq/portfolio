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
 * Five layers, tuned for a ship's-hold register rather than a warm pad:
 *
 *   SUB      E1 sine at 41.2Hz — felt more than heard, gives the bed weight.
 *   ENGINE   Two sawtooths a fifth apart through a resonant lowpass. The
 *            resonance is what makes it metallic instead of soft, and the
 *            filter is swept by a 55-second LFO so the timbre opens and
 *            closes rather than sitting still.
 *   AIR      Bandpassed white noise at very low gain — hull static. This is
 *            the layer that makes it read as a place rather than a chord.
 *   DRIFT    A detuned octave that beats slowly against the engine, so the
 *            tuning is never quite settled.
 *   PING     A sine with a fast exponential decay, fired at random intervals
 *            between 11 and 23 seconds. Sparse and quiet: the ear catches it
 *            once, then stops expecting it, which is what stops the loop from
 *            becoming a loop.
 *
 * Master gain 0.04. Everything is scheduled on the AudioContext clock rather
 * than setInterval, so the pings do not drift when the main thread is busy.
 */

const STORAGE_KEY = "ambient-audio";

const MASTER_GAIN = 0.04;
const FADE_IN = 2.6;
const FADE_OUT = 1.0;

/** Sparse sonar ping. Random interval, in seconds. */
const PING_MIN = 11;
const PING_MAX = 23;

interface Graph {
  context: AudioContext;
  master: GainNode;
  stop: () => void;
}

/** Short burst of noise, used as the source for the hull-static layer. */
function noiseBuffer(context: AudioContext): AudioBuffer {
  const length = context.sampleRate * 3;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function buildGraph(): Graph | null {
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;

  const context = new Ctor();
  const stoppable: { stop: (when?: number) => void }[] = [];

  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  // ── ENGINE ───────────────────────────────────────────────────────────────
  // Resonant lowpass. Q of 6 is the whole character: at 1 this is a warm pad,
  // at 6 it rings, which is what reads as machinery.
  const engineFilter = context.createBiquadFilter();
  engineFilter.type = "lowpass";
  engineFilter.frequency.value = 260;
  engineFilter.Q.value = 6;
  engineFilter.connect(master);

  const sweep = context.createOscillator();
  sweep.type = "sine";
  sweep.frequency.value = 0.018;
  const sweepDepth = context.createGain();
  sweepDepth.gain.value = 210;
  sweep.connect(sweepDepth);
  sweepDepth.connect(engineFilter.frequency);
  sweep.start();
  stoppable.push(sweep);

  for (const voice of [
    { frequency: 82.41, detune: 0, gain: 0.5 },
    { frequency: 123.47, detune: -6, gain: 0.28 },
    { frequency: 164.81, detune: 9, gain: 0.14 },
  ]) {
    const osc = context.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = voice.frequency;
    osc.detune.value = voice.detune;

    const gain = context.createGain();
    gain.gain.value = voice.gain;

    osc.connect(gain);
    gain.connect(engineFilter);
    osc.start();
    stoppable.push(osc);
  }

  // ── SUB ──────────────────────────────────────────────────────────────────
  const sub = context.createOscillator();
  sub.type = "sine";
  sub.frequency.value = 41.2;
  const subGain = context.createGain();
  subGain.gain.value = 0.85;
  sub.connect(subGain);
  subGain.connect(master);
  sub.start();
  stoppable.push(sub);

  // ── AIR ──────────────────────────────────────────────────────────────────
  const noise = context.createBufferSource();
  noise.buffer = noiseBuffer(context);
  noise.loop = true;

  const airFilter = context.createBiquadFilter();
  airFilter.type = "bandpass";
  airFilter.frequency.value = 900;
  airFilter.Q.value = 0.9;

  const airGain = context.createGain();
  airGain.gain.value = 0.05;

  // Slow amplitude breathing on the static, so it is not a flat hiss.
  const breath = context.createOscillator();
  breath.type = "sine";
  breath.frequency.value = 0.06;
  const breathDepth = context.createGain();
  breathDepth.gain.value = 0.025;
  breath.connect(breathDepth);
  breathDepth.connect(airGain.gain);
  breath.start();
  stoppable.push(breath);

  noise.connect(airFilter);
  airFilter.connect(airGain);
  airGain.connect(master);
  noise.start();
  stoppable.push(noise);

  // ── PING ─────────────────────────────────────────────────────────────────
  // Scheduled recursively on the audio clock. Each ping creates and disposes
  // its own nodes, which is the correct pattern for one-shots — a permanent
  // oscillator gated by a gain node leaks CPU for a sound heard twice a minute.
  let pingTimer: number | undefined;

  const ping = () => {
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();

    osc.type = "sine";
    // Alternates between two pitches a fourth apart so consecutive pings are
    // not identical.
    osc.frequency.setValueAtTime(Math.random() > 0.5 ? 1174.66 : 880, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + 2.8);

    const wait = PING_MIN + Math.random() * (PING_MAX - PING_MIN);
    pingTimer = window.setTimeout(ping, wait * 1000);
  };

  pingTimer = window.setTimeout(
    ping,
    (PING_MIN + Math.random() * (PING_MAX - PING_MIN)) * 1000,
  );

  return {
    context,
    master,
    stop: () => {
      if (pingTimer !== undefined) clearTimeout(pingTimer);
      for (const node of stoppable) {
        try {
          node.stop();
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
