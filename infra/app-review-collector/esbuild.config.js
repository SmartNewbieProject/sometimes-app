import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.js',
  format: 'cjs',
  external: [
    '@aws-sdk/client-dynamodb',
    '@aws-sdk/client-ssm',
    '@aws-sdk/lib-dynamodb',
  ],
  minify: true,
  sourcemap: false,
});

console.log('Build complete: dist/index.js');
