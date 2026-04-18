import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'VITE_MOCK=true npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
