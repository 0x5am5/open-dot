import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT || 3199);

/** E2E runs against `next dev` with its own data folder, so tests never touch .data/. */
export default defineConfig({
  testDir: "e2e",
  globalTeardown: "./e2e/teardown.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: `http://localhost:${PORT}`, trace: "retain-on-failure" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"], isMobile: false, viewport: { width: 1280, height: 800 } } }],
  webServer: {
    command: `next dev --port ${PORT}`,
    url: `http://localhost:${PORT}/settings`,
    timeout: 120_000,
    reuseExistingServer: false,
    // Empty values win over .env.local, so a developer's own local server doesn't leak into the tests.
    env: { DOTS_DATA_DIR: ".e2e-data", DOTS_LOCAL_BASE_URL: "", DOTS_LOCAL_API_KEY: "" },
  },
});
