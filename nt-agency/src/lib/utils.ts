/** Joins class names, skipping falsy values. */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Formats whole US dollars, e.g. 1800 -> "$1,800"; null -> "—". */
export function money(n: number | null | undefined) {
  if (n == null) return "—";
  return `$${n.toLocaleString("en-US")}`;
}

/** Up to two initials from a name, e.g. "Ayesha Rahman" -> "AR". */
export function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** "Good morning/afternoon/evening" for the current hour. */
export function greeting(date = new Date()) {
  const h = date.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}
