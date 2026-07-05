import { copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const src = resolve(projectRoot, 'node_modules/vue/dist/vue.esm-browser.js');
const dest = resolve(projectRoot, 'cheat-engine/www/cheat/libs/vue.js');

copyFileSync(src, dest);
console.log(`Copied vue.esm-browser.js -> ${dest}`);
