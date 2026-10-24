/**
 * Number and name formats for the week page, ported from the Python pipeline's Jinja filters.
 * The JSON holds raw numbers, so the page formats them the same way the old templates did.
 */

/* Shortest two-decimal form: 106.8 for 106.80, 21 for 21.0. */
export function num(x: number): string {
  return (Math.round(x * 100) / 100).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

/* A signed gap. The minus is U+2212, so it has the width of the plus sign in tabular figures. */
export function gap(x: number): string {
  return x >= 0 ? `+${num(x)}` : `−${num(-x)}`;
}

/* First initial, a dot, then the rest: "C. McCaffrey". A one-word name, such as a defense, stays whole. */
export function shortName(name: string): string {
  const space = name.indexOf(" ");
  if (space < 0) return name;
  return `${name[0]}. ${name.slice(space + 1)}`;
}

/* A whole count with a comma between each group of three digits: 48,213. The locale is fixed, so the static build and the browser agree. */
export function thousands(x: number): string {
  return x.toLocaleString("en-US");
}
