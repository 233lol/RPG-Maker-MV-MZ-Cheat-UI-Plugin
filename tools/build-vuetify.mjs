import * as esbuild from 'esbuild';
import { copyFileSync, rmSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

await esbuild.build({
  entryPoints: ['tools/vuetify-entry.js'],
  bundle: true,
  format: 'esm',
  outfile: 'cheat-engine/www/cheat/libs/vuetify.js',
  platform: 'browser',
  target: 'es2020',
  minify: false,
  plugins: [
    {
      name: 'vue-external',
      setup(build) {
        build.onResolve({ filter: /^vue$/ }, () => ({
          path: './vue.js',
          external: true,
        }));
      },
    },
  ],
});

console.log('Vuetify 3 ESM bundle built successfully.');

// Remove CSS emitted alongside JS (it's a subset; full CSS comes from vendor:assets)
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const libsCss = resolve(root, 'cheat-engine/www/cheat/libs/vuetify.css');
if (existsSync(libsCss)) {
  rmSync(libsCss);
}
