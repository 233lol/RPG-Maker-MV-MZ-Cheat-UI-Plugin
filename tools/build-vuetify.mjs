import * as esbuild from 'esbuild';

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
