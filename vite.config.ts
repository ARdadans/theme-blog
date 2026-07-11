import { defineConfig } from 'vite';
import bloggerPlugin from './plugins/vite-plugin-blogger';

export default defineConfig({
  build: {
    outDir: '.temp-build',
    emptyOutDir: true,
    minify: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: 'src/js/main.ts',
        series: 'src/js/series.ts',
        homepage: 'src/js/homepage.ts',
      },
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css';
          }
          return assetInfo.name || '[name].[ext]';
        }
      }
    }
  },
  plugins: [
    bloggerPlugin({
      template: 'src/theme.xml',
      output: 'dist/theme.xml',
    }),
  ],
});
