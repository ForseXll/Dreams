import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:7777',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'pnpm --filter backend start',
      port: 4000,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'pnpm build && pnpm start',
      port: 7777,
      reuseExistingServer: true,
      timeout: 120000,
      env: {
        NEXT_PUBLIC_API_URL: 'http://localhost:4000',
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
