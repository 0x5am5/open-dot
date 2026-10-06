import fs from "node:fs";

/** Remove the throwaway data folder the E2E server wrote to. */
export default function teardown() {
  fs.rmSync(".e2e-data", { recursive: true, force: true });
}
