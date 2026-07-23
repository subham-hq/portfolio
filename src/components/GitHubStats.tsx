import raw from "@/content/github-stats.json";

/**
 * GitHub statistics, rendered from a build-time snapshot.
 *
 * scripts/fetch-github-stats.mjs writes src/content/github-stats.json before
 * `next build`, so everything below is static markup. No browser fetch, no
 * third-party image host, no CSP exemption, nothing that can be down.
 *
 * Two exports, because the /github page frames the graph and the cards as
 * separate sections:
 *   GitHubStatPanels    — the three-card grid
 *   ContributionHeatmap — the calendar on its own
 *
 * Neither renders its own heading or outer frame; the page's <Section>
 * supplies those.
 */

type Language = { name: string; color: string; percent: number };
type Day = { date: string; count: number; level: number };
type Streak = { days: number; start: string | null; end: string | null };

type Snapshot = {
  ok: boolean;
  generatedAt: string | null;
  login: string;
  stats: {
    followers: number;
    publicRepos: number;
    stars: number;
    commits: number;
    pullRequests: number;
    issues: number;
    reviews: number;
  };
  languages: Language[];
  contributions: {
    total: number;
    currentStreak: Streak;
    longestStreak: Streak;
    calendar: Day[];
  };
};

// Declared rather than inferred. Inferring from the JSON ties the types to
// whatever that file happens to contain — an empty fallback snapshot gives
// `never[]` for the arrays and the component stops compiling.
const data = raw as unknown as Snapshot;

/** The site's teal. Swap for a CSS variable if one is defined for it — this is
 *  the only colour the component hardcodes. */
const ACCENT = "#0F7A72";

const nf = new Intl.NumberFormat("en-US");

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRange(start: string | null, end: string | null) {
  if (!start || !end) return "—";
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const from = new Date(start).toLocaleDateString("en-GB", opts);
  const to = new Date(end).toLocaleDateString("en-GB", opts);
  return from === to ? from : `${from} – ${to}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-rule py-2 last:border-b-0">
      <span className="text-fg-muted">{label}</span>
      <span className="mono tabular-nums">{value}</span>
    </div>
  );
}

function Activity() {
  const s = data.stats;
  return (
    <li className="surface p-6">
      <p className="label mb-4">Activity</p>
      <div className="text-sm">
        <Row label="Commits" value={nf.format(s.commits)} />
        <Row label="Pull requests" value={nf.format(s.pullRequests)} />
        <Row label="Issues" value={nf.format(s.issues)} />
        <Row label="Reviews" value={nf.format(s.reviews)} />
        <Row label="Stars earned" value={nf.format(s.stars)} />
      </div>
    </li>
  );
}

function Languages() {
  return (
    <li className="surface p-6">
      <p className="label mb-4">Languages</p>

      {data.languages.length === 0 ? (
        <p className="text-sm text-fg-muted">No language data in this snapshot.</p>
      ) : (
        <>
          <div className="mb-4 flex h-2 w-full overflow-hidden rounded-full">
            {data.languages.map((lang) => (
              <span
                key={lang.name}
                style={{ width: `${lang.percent}%`, backgroundColor: lang.color }}
                title={`${lang.name} ${lang.percent}%`}
              />
            ))}
          </div>

          <div className="text-sm">
            {data.languages.map((lang) => (
              <div
                key={lang.name}
                className="flex items-baseline gap-3 border-b border-rule py-2 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="text-fg-muted">{lang.name}</span>
                <span className="mono ml-auto tabular-nums">
                  {lang.percent.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </li>
  );
}

function Streak() {
  const c = data.contributions;
  return (
    <li className="surface p-6">
      <p className="label mb-4">Streak</p>

      <div className="grid gap-6">
        <div>
          <p className="mono text-3xl tabular-nums">{nf.format(c.total)}</p>
          <p className="label mt-1">Total contributions</p>
        </div>

        <div>
          <p className="mono text-3xl tabular-nums" style={{ color: ACCENT }}>
            {nf.format(c.currentStreak.days)}
          </p>
          <p className="label mt-1">
            Current · {formatRange(c.currentStreak.start, c.currentStreak.end)}
          </p>
        </div>

        <div>
          <p className="mono text-3xl tabular-nums">
            {nf.format(c.longestStreak.days)}
          </p>
          <p className="label mt-1">
            Longest · {formatRange(c.longestStreak.start, c.longestStreak.end)}
          </p>
        </div>
      </div>
    </li>
  );
}

export function GitHubStatPanels() {
  if (!data.ok) return null;

  return (
    <>
      <ul className="grid gap-px bg-rule lg:grid-cols-3">
        <Activity />
        <Languages />
        <Streak />
      </ul>
      <p className="label mt-6">
        Queried from the GitHub GraphQL API at deploy time and rendered as static
        markup. Snapshot taken {formatDate(data.generatedAt)}.
      </p>
    </>
  );
}

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const LEVEL_OPACITY = [0, 0.25, 0.45, 0.7, 1];

export function ContributionHeatmap() {
  const days = data.contributions.calendar;
  const first = days[0];
  if (!first) return null;

  // Pad the front so the first column starts on a Sunday and the grid reads as
  // real weeks rather than an arbitrary 7-row wrap.
  const offset = new Date(`${first.date}T00:00:00Z`).getUTCDay();
  const columns = Math.ceil((offset + days.length) / 7);

  const width = columns * STEP - GAP;
  const height = 7 * STEP - GAP + 16;

  // Labels are spaced by column rather than placed at every month boundary, so
  // a short month never collides with its neighbour.
  const months: { label: string; x: number }[] = [];
  let lastMonth = "";
  let lastColumn = Number.NEGATIVE_INFINITY;

  days.forEach((day, i) => {
    const month = day.date.slice(0, 7);
    if (month === lastMonth) return;
    lastMonth = month;

    const column = Math.floor((i + offset) / 7);
    if (column - lastColumn < 3) return;
    lastColumn = column;

    months.push({
      label: new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-GB", {
        month: "short",
        timeZone: "UTC",
      }),
      x: column * STEP,
    });
  });

  return (
    <>
      <div className="overflow-x-auto rounded-sm border border-rule p-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="h-auto w-full min-w-[640px]"
          role="img"
          aria-label={`${nf.format(data.contributions.total)} contributions in total. The last 53 weeks are shown as a grid of days.`}
        >
          {months.map((month) => (
            <text
              key={`${month.label}-${month.x}`}
              x={month.x}
              y={9}
              fontSize="9"
              fill="currentColor"
              fillOpacity={0.5}
            >
              {month.label}
            </text>
          ))}

          {days.map((day, i) => {
            const index = i + offset;
            return (
              <rect
                key={day.date}
                x={Math.floor(index / 7) * STEP}
                y={(index % 7) * STEP + 16}
                width={CELL}
                height={CELL}
                rx={2}
                fill={day.level === 0 ? "currentColor" : ACCENT}
                fillOpacity={day.level === 0 ? 0.08 : (LEVEL_OPACITY[day.level] ?? 1)}
              >
                <title>{`${day.count} on ${day.date}`}</title>
              </rect>
            );
          })}
        </svg>
      </div>

      <div className="label mt-4 flex items-center gap-2">
        <span>Less</span>
        {LEVEL_OPACITY.map((opacity, level) => (
          <svg key={level} width={CELL} height={CELL} aria-hidden="true">
            <rect
              width={CELL}
              height={CELL}
              rx={2}
              fill={level === 0 ? "currentColor" : ACCENT}
              fillOpacity={level === 0 ? 0.08 : opacity}
            />
          </svg>
        ))}
        <span>More</span>
      </div>
    </>
  );
}
