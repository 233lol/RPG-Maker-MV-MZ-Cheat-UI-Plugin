import { copyFileSync, readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, rmSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const destCss = resolve(root, 'cheat-engine/www/cheat/css');
const destFonts = resolve(root, 'cheat-engine/www/cheat/fonts');

// Vuetify CSS
const vuetifySrc = resolve(root, 'node_modules/vuetify/dist/vuetify.css');
const vuetifyDest = resolve(destCss, 'vuetify.css');
copyFileSync(vuetifySrc, vuetifyDest);
console.log(`Copied vuetify.css -> ${vuetifyDest}`);

// Material Design Icons CSS
const mdiSrc = resolve(root, 'node_modules/@mdi/font/css/materialdesignicons.css');
const mdiDest = resolve(destCss, 'materialdesignicons.css');
let mdiCss = readFileSync(mdiSrc, 'utf8');
// Strip non-woff2 font formats, keep only woff2
mdiCss = mdiCss.replace(
  /@font-face\s*\{[\s\S]*?\}/,
  (match) => {
    const woff2 = match.match(/url\([^)]*?\.woff2[^)]*\)\s*format\s*\([^)]*\)/);
    const family = match.match(/font-family\s*:\s*([^;]+);/);
    const fam = family ? family[1].trim() : '"Material Design Icons"';
    const url = woff2 ? woff2[0] : 'url("../fonts/materialdesignicons-webfont.woff2") format("woff2")';
    return '@font-face {\n  font-family: ' + fam + ';\n  src: ' + url + ';\n  font-weight: normal;\n  font-style: normal;\n}';
  }
);
writeFileSync(mdiDest, mdiCss);
console.log(`Copied materialdesignicons.css (woff2 only) -> ${mdiDest}`);

// Material Design Icons Fonts (woff2 only)
const mdiFontsSrc = resolve(root, 'node_modules/@mdi/font/fonts');
if (existsSync(mdiFontsSrc)) {
  if (!existsSync(destFonts)) mkdirSync(destFonts, { recursive: true });
  // Remove old non-woff2 mdi font files
  for (const file of readdirSync(destFonts)) {
    if (file.startsWith('materialdesignicons-webfont.') && extname(file) !== '.woff2') {
      rmSync(resolve(destFonts, file), { force: true });
    }
  }
  // Copy woff2 only
  for (const file of readdirSync(mdiFontsSrc)) {
    if (extname(file) === '.woff2') {
      copyFileSync(resolve(mdiFontsSrc, file), resolve(destFonts, file));
    }
  }
  console.log(`Copied .woff2 from @mdi/font/fonts -> ${destFonts}`);
}
