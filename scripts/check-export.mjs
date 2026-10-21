/**
 * Checks that the export in out/ holds byte-identical copies of the files in public/.
 * Run it after pnpm build. It exits 1 and names the first mismatch.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["index.html", "CNAME", "2026", "static"];

function filesUnder(path) {
  if (!statSync(path).isDirectory()) return [path];
  return readdirSync(path)
    .sort()
    .flatMap((name) => filesUnder(join(path, name)));
}

function fail(message) {
  console.error(`check:export failed: ${message}`);
  process.exit(1);
}

let count = 0;
for (const root of roots) {
  const source = join("public", root);
  let sources;
  try {
    sources = filesUnder(source);
  } catch {
    fail(`${source} does not exist`);
  }
  for (const file of sources) {
    const copy = join("out", file.slice("public/".length));
    let bytes;
    try {
      bytes = readFileSync(copy);
    } catch {
      fail(`${copy} is missing`);
    }
    if (!bytes.equals(readFileSync(file))) fail(`${copy} differs from ${file}`);
    count += 1;
  }
}
console.log(`check:export passed: ${count} files are byte-identical.`);
