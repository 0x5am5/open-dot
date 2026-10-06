import http from "node:http";
import type { AddressInfo } from "node:net";
import { expect, test } from "@playwright/test";

// A stand-in for Ollama / LM Studio: lists one model, and only with the right key.
const KEY = "e2e-secret";
let server: http.Server;
let baseURL = "";

test.beforeAll(async () => {
  server = http.createServer((req, res) => {
    if (req.headers.authorization !== `Bearer ${KEY}`) return void res.writeHead(401).end();
    if (req.url !== "/v1/models") return void res.writeHead(404).end();
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ object: "list", data: [{ id: "e2e-model", object: "model", created: 0, owned_by: "e2e" }] }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`;
});

test.afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("adds a local model server in Settings, lists its models, then removes it", async ({ page }) => {
  await page.goto("/settings");
  const card = page.locator("#local-models");
  const url = card.getByLabel("Local server URL");
  const key = card.getByLabel("Local server API key");

  // A wrong key is caught before anything is saved.
  await url.fill(baseURL);
  await key.fill("wrong");
  await card.getByRole("button", { name: "Save" }).click();
  await expect(card).toContainText("didn't accept that key");

  // The right key connects, and the server's model reaches the picker.
  await key.fill(KEY);
  await card.getByRole("button", { name: "Save" }).click();
  await expect(card).toContainText("Connected · 1 model in the picker");
  await expect(url).toBeHidden();

  // Clean up: removing it puts the form back.
  await card.getByRole("button", { name: "Remove" }).click();
  await expect(card.getByLabel("Local server URL")).toBeVisible();
});
