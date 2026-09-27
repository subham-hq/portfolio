"use client";

import Image from "next/image";
import { useState } from "react";
import { cx } from "@/lib/utils";

/**
 * CLICK-TO-LOAD VIDEO
 *
 * A plain <iframe src="youtube.com/embed/…"> is the expensive way to put a
 * demo on a page. It pulls roughly a megabyte of third-party JavaScript on
 * every single page load — for every visitor, whether or not anyone presses
 * play — and it contacts Google and writes storage before the reader has asked
 * for anything at all. On a site whose whole argument is that the engineering
 * is considered, that is a bad first impression hidden inside a convenience.
 *
 * So this renders a facade: a poster, a play control, and nothing else. The
 * iframe is created on the first click and not a moment earlier. The cost of
 * the video is paid by the people who want the video.
 *
 * Three details that matter:
 *
 *   · youtube-nocookie.com, not youtube.com. Same player, no tracking cookie
 *     until playback actually starts. The privacy page says the site sets no
 *     third-party cookies, and this is what keeps that sentence true.
 *   · The control is a real <button> with an accessible name, not a div with
 *     an onClick. A keyboard user reaches it with Tab and fires it with Enter.
 *   · `poster` is optional. Without one the facade draws itself from the
 *     design tokens rather than reaching out to i.ytimg.com for a thumbnail —
 *     which would mean widening img-src in the CSP to a host outside your
 *     control, to fetch an image you could have shipped yourself.
 *
 * CSP: playback needs `frame-src https://www.youtube-nocookie.com` in
 * public/_headers. Without it the click appears to do nothing and the only
 * evidence is a console warning.
 */

export interface VideoEmbedProps {
  /** YouTube video id — the part after `v=` or `youtu.be/`. */
  id: string;
  /** Used as the iframe title and the button's accessible name. */
  title: string;
  /** Optional local poster, e.g. "/postmark-demo-poster.jpg". Ship it in /public. */
  poster?: string;
  /** Short line under the play control: "2 min · architecture walkthrough". */
  caption?: string;
  className?: string;
}

export function VideoEmbed({ id, title, poster, caption, className }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);

  const src =
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` +
    "?autoplay=1&rel=0&modestbranding=1&playsinline=1";

  return (
    <figure className={cx("m-0", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-rule-strong bg-bg-sunken">
        {playing ? (
          <iframe
            src={src}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 size-full cursor-pointer"
          >
            {poster ? (
              <Image
                src={poster}
                alt=""
                fill
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            ) : (
              /* No poster shipped: draw one.
                 The first version of this was a bare grid at 60% opacity over
                 a near-black surface, which on a dark theme rendered as an
                 empty rectangle — a reader scrolling past read it as blank
                 space rather than as a video, which is a worse outcome than
                 any loading cost it saved. It now carries a visible frame, a
                 wash of the accent behind the control, and the title, so the
                 panel is legible as a video with or without artwork. */
              <>
                <span
                  aria-hidden="true"
                  className="grid-field absolute inset-0 opacity-100"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,color-mix(in_oklab,var(--signal)_16%,transparent),transparent_70%)]"
                />
              </>
            )}

            {/* Scrim. Keeps the play control legible over an arbitrary poster
                without dimming the whole frame to mush. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-bg-sunken/85 via-bg-sunken/25 to-transparent"
            />

            <span className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <span
                aria-hidden="true"
                className="flex size-16 items-center justify-center rounded-full border border-signal bg-bg/80 shadow-[0_0_0_1px_color-mix(in_oklab,var(--signal)_25%,transparent),0_18px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-bg sm:size-20"
              >
                {/* Optically centred: a triangle's visual centre sits left of
                    its bounding box, so the glyph is nudged right by 2px. */}
                <svg
                  viewBox="0 0 24 24"
                  className="ml-[2px] size-6 fill-signal sm:size-7"
                  role="presentation"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="mono text-micro uppercase tracking-[0.11em] text-signal">
                Watch the demo
              </span>
              {/* Without a poster the frame has nothing else in it, so the
                  title does the work of telling a reader what they would be
                  pressing play on. */}
              {!poster ? (
                <span className="prose-measure max-w-[36ch] text-body text-fg-muted">
                  {title}
                </span>
              ) : null}
            </span>
          </button>
        )}
      </div>

      {caption ? (
        <figcaption className="label mt-3">
          {caption}
          {!playing ? (
            <span className="text-fg-faint"> · loads only when you press play</span>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
