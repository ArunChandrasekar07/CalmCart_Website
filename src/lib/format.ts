export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const DAY = 86_400_000;

export function timeAgo(iso: string, now = Date.now()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export type DateGroup = "Today" | "Yesterday" | "This Week" | "Earlier";

export function dateGroup(iso: string, now = new Date()): DateGroup {
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const t = new Date(iso).getTime();
  if (t >= startToday) return "Today";
  if (t >= startToday - DAY) return "Yesterday";
  if (t >= startToday - 6 * DAY) return "This Week";
  return "Earlier";
}

export function clock(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function fullDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function pluralize(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

/** "/kg" → "per kg"; units that already read well pass through. */
export const unitLabel = (unit: string) => (unit.startsWith("/") ? `per ${unit.slice(1)}` : unit);
