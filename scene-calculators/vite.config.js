import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@byko/lib-api-rest": path.resolve(__dirname, "__mocks__/@byko/lib-api-rest.ts"),
      "@byko/lib-api-products": path.resolve(__dirname, "__mocks__/@byko/lib-api-products.ts"),
      "@byko/component-button": path.resolve(__dirname, "__mocks__/@byko/component-button.tsx"),
      "@byko/component-input": path.resolve(__dirname, "__mocks__/@byko/component-input.tsx"),
      "@byko/component-card": path.resolve(__dirname, "__mocks__/@byko/component-card.tsx"),
      "@byko/component-page-container": path.resolve(__dirname, "__mocks__/@byko/component-page-container.tsx"),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
