import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig(({ mode }) => {
  const isLibrary = mode === 'library';

  return {
    plugins: [svelte()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@lib': path.resolve(__dirname, './src/lib')
      }
    },
    build: isLibrary
      ? {
          lib: {
            entry: path.resolve(__dirname, 'src/lib/index.ts'),
            name: 'UnlayerSvelte',
            fileName: (format) => `unlayer-svelte.${format === 'es' ? 'js' : 'umd.js'}`,
            formats: ['es', 'umd']
          },
          rollupOptions: {
            external: ['svelte'],
            output: {
              globals: {
                svelte: 'Svelte'
              }
            }
          },
          sourcemap: true,
          minify: true
        }
      : {
          outDir: 'dist-demo',
          minify: 'terser',
          terserOptions: {
            compress: {
              drop_console: true,
              drop_debugger: true
            }
          },
          rollupOptions: {
            output: {
              manualChunks: {
                'svelte': ['svelte']
              }
            }
          },
          chunkSizeWarningLimit: 1000
        }
  };
});