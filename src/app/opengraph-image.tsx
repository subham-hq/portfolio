import { ImageResponse } from "next/og";
import { bio, person } from "@/content/site";

export const dynamic = "force-static";
export const alt = `${person.name} — ${person.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Generated at build time from the same content module the pages read, so the
 * card can never drift out of sync with the copy.
 *
 * Satori — the renderer behind ImageResponse — requires an explicit `display`
 * on any element with more than one child, and it does not inherit flex the
 * way a browser does. Every node below therefore declares it, and interpolated
 * text is collapsed into a single template string rather than left as adjacent
 * children.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#080c0c",
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          fontSize: 20,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "#8a918e",
        }}
      >
        <div style={{ display: "flex" }}>{person.name}</div>
        <div style={{ display: "flex" }}>{person.location}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            lineHeight: 1.08,
            color: "#eceeeb",
            letterSpacing: -2,
            maxWidth: 940,
          }}
        >
          {bio.headline}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#46c9bd",
            marginTop: 32,
          }}
        >
          {`${person.role} · building toward ${person.target}`}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 20,
          color: "#8a918e",
          borderTop: "1px solid #232a29",
          paddingTop: 24,
        }}
      >
        subhambhattacharya.com
      </div>
    </div>,
    { ...size },
  );
}
