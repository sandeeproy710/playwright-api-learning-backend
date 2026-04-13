import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:4000',
    extraHTTPHeaders: {
      Accept: 'application/json'
    }
  }
});
