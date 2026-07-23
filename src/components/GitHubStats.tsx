import data from "@/content/github-stats.json";

/**
 * GitHub statistics, rendered from a build-time snapshot.
 *
 * Everything here is static markup produced at build time by
 * scripts/fetch-github-stats.mjs. No network calls happen in the browser, so
 * the section cannot be taken down by a third-party service and needs no CSP
 * exemptions.
 *
 * The generation date is printed because the data is a snapshot: a reader
 * should be able to see how fresh it is rather than assume it is live.
 */

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

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid content-start gap-6 border-t border-rule-strong pt-6">
      <h3 className="label">{title}</h3>
      {children}
    </section>
  );
}

function Figure({ value, label }: { value: string; label: string }) {
  return (
    <div className="grid gap-1">
      <span className="text-2xl tabular-nums text-fg">{value}</span>
      <span className="mono text-micro uppercase tracking-[0.11em] text-fg-faint">
        {label}
      </span>
    </div>
  );
}

function Overview() {
  const s = data.stats;
  return (
    <Panel title="Overview">
      <div className="grid grid-cols-2 gap-6">
        <Figure value={nf.format(s.commits)} label="Commits" />
        <Figure value={nf.format(s.pullRequests)} label="Pull requests" />
        <Figure value={nf.format(s.issues)} label="Issues" />
        <Figure value={nf.format(s.reviews)} label="Reviews" />
        <Figure value={nf.format(s.publicRepos)} label="Repositories" />
        <Figure value={nf.format(s.stars)} label="Stars earned" />
      </div>
    </Panel>
  );
}

function Languages() {
  if (data.languages.length === 0) return null;

  return (
    <Panel title="Languages">
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {data.languages.map((lang) => (
          <span
            key={lang.name}
            style={{ width: `${lang.percent}%`, backgroundColor: lang.color }}
            title={`${lang.name} ${lang.percent}%`}
          />
        ))}
      </div>

      <ul className="grid gap-2">
        {data.languages.map((lang) => (
          <li key={lang.name} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-body text-fg">{lang.name}</span>
            <span className="mono ml-auto text-micro tabular-nums text-fg-faint">
              {lang.percent.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>

      <p className="mono text-micro text-fg-faint">
        By bytes of source across public repositories, forks excluded.
      </p>
    </Panel>
  );
}

function Streak() {
  const c = data.contributions;
  return (
    <Panel title="Streak">
      <div className="grid gap-6">
        <div className="grid gap-1">
          <span className="text-2xl tabular-nums text-fg">{nf.format(c.total)}</span>
          <span className="mono text-micro uppercase tracking-[0.11em] text-fg-faint">
            Total contributions
          </span>
        </div>

        <div className="grid gap-1">
          <span className="text-2xl tabular-nums text-[color:var(--signal)]">
            {nf.format(c.currentStreak.days)}
          </span>
          <span className="mono text-micro uppercase tracking-[0.11em] text-fg-faint">
            Current streak · {formatRange(c.currentStreak.start, c.currentStreak.end)}
          </span>
        </div>

        <div className="grid gap-1">
          <span className="text-2xl tabular-nums text-fg">
            {nf.format(c.longestStreak.days)}
          </span>
          <span className="mono text-micro uppercase tracking-[0.11em] text-fg-faint">
            Longest streak · {formatRange(c.longestStreak.start, c.longestStreak.end)}
          </span>
        </div>
      </div>
    </Panel>
  );
}

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const LEVEL_OPACITY = [0, 0.25, 0.45, 0.7, 1];

function Heatmap() {
  const days = data.contributions.calendar;
  if (days.length === 0) return null;

  // Pad the front so the first column starts on a Sunday and the grid reads as
  // real weeks rather than an arbitrary 7-row wrap.
  const offset = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  const columns = Math.ceil((offset + days.length) / 7);

  const width = columns * STEP - GAP;
  const height = 7 * STEP - GAP + 16;

  const months: { label: string; x: number }[] = [];
  let lastMonth = "";

  days.forEach((day, i) => {
    const month = day.date.slice(0, 7);
    if (month === lastMonth) return;
    lastMonth = month;
    const column = Math.floor((i + offset) / 7);
    const label = new Date(`${day.date}T00:00:00Z`).toLocaleDateString("en-GB", {
      month: "short",
      timeZone: "UTC",
    });
    if (months.length === 0 || column - months[months.length - 1].x / STEP >= 3) {
      months.push({ label, x: column * STEP });
    }
  });

  return (
    <section className="grid gap-4 border-t border-rule-strong pt-6 text-fg">
      <h3 className="label">Contributions, last 53 weeks</h3>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${nf.format(data.contributions.total)} contributions in total; the last 53 weeks are shown as a daily grid.`}
      >
        {months.map((month) => (
          <text
            key={`${month.label}-${month.x}`}
            x={month.x}
            y={9}
            className="mono"
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
              fill={day.level === 0 ? "currentColor" : "var(--signal)"}
              fillOpacity={day.level === 0 ? 0.08 : LEVEL_OPACITY[day.level]}
            >
              <title>{`${day.count} on ${day.date}`}</title>
            </rect>
          );
        })}
      </svg>

      <div className="mono flex items-center gap-2 text-micro text-fg-faint">
        <span>Less</span>
        {LEVEL_OPACITY.map((opacity, level) => (
          <svg key={level} width={CELL} height={CELL} aria-hidden="true">
            <rect
              width={CELL}
              height={CELL}
              rx={2}
              fill={level === 0 ? "currentColor" : "var(--signal)"}
              fillOpacity={level === 0 ? 0.08 : opacity}
            />
          </svg>
        ))}
        <span>More</span>
      </div>
    </section>
  );
}

export function GitHubStats() {
  if (!data.ok) return null;

  return (
    <div className="grid gap-12">
      <div className="grid gap-12 md:grid-cols-3 md:gap-8">
        <Overview />
        <Languages />
        <Streak />
      </div>

      <Heatmap />

      <p className="mono text-micro text-fg-faint">
        Built from the GitHub GraphQL API at deploy time and rendered as static
        markup. Snapshot taken {formatDate(data.generatedAt)}.
      </p>
    </div>
  );
}
