const esbuild = require('esbuild');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs');

// Get all TypeScript files
const entryPoints = glob.sync('src/**/*.ts');

// Build configuration
esbuild.build({
  entryPoints,
  outdir: 'dist',
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: false,
  minify: false,
  logLevel: 'info',
}).then(() => {
  console.log('✓ Build completed successfully');
}).catch((error) => {
  console.error('✗ Build failed:', error);
  process.exit(1);
});
