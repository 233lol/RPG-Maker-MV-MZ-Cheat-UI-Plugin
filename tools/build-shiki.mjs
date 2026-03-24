import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const entry = path.join(rootDir, "tools", "shiki.bundle.ts");
const outfile = path.join(
  rootDir,
  "cheat-engine",
  "www",
  "cheat",
  "libs",
  "shiki.bundle.mjs",
);

await build({
  entryPoints: [entry],
  outfile,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2020",
  minify: true,
  sourcemap: false,
  logLevel: "info",
});

console.log(`Wrote ${outfile}`);
