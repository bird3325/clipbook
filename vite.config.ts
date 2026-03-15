import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import replace from '@rollup/plugin-replace';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['@google/generative-ai']
    },
    build: {
      rollupOptions: {
        plugins: [
          replace({
            preventAssignment: true,
            delimiters: ['', ''],
            values: {
              'https://cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js': '/js/pdfobject.min.js',
            },
          }),
        ],
        input: {
          popup: resolve(__dirname, 'popup.html'),
          main: resolve(__dirname, 'index.html'),
          content: resolve(__dirname, 'src/content/index.ts'),
          background: resolve(__dirname, 'src/background/index.ts'),
        },
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    }
  };
});
