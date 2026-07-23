export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

/** "2026-03" → "Mar 2026". "2018" → "2018". "present" → "Present". */
export function formatMonth(value: string): string {
  if (value === "present") return "Present";
  const [year, month] = value.split("-");
  if (!month) return year ?? value;
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : (year ?? value);
}

export function formatRange(start: string, end: string): string {
  return `${formatMonth(start)} — ${formatMonth(end)}`;
}

/** Whole months between two YYYY-MM values, inclusive of the start month. */
export function durationLabel(start: string, end: string): string {
  const parse = (v: string) => {
    if (v === "present") return new Date();
    const [y, m] = v.split("-").map(Number);
    return new Date(y ?? 1970, (m ?? 1) - 1, 1);
  };
  const a = parse(start);
  const b = parse(end);
  const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (months < 1) return "—";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${months} mo`;
  if (rest === 0) return `${years} yr`;
  return `${years} yr ${rest} mo`;
}
