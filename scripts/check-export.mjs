/**
 * Checks that out/ holds a byte-identical copy of every file under public/.
 * Run it after pnpm build. It exits 1 and names the first mismatch.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

function filesUnder(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => (a.name < b.name ? -1 : 1))
    .flatMap((entry) =>
      entry.isDirectory() ? filesUnder(join(dir, entry.name)) : [join(dir, entry.name)],
    );
}

function fail(message) {
  console.error(`check:export failed: ${message}`);
  process.exit(1);
}

let sources;
try {
  sources = filesUnder("public");
} catch {
  fail("public does not exist");
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
}
console.log(`check:export passed: ${sources.length} files are byte-identical.`);
