import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Signal market dashboard", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Signal — Smarter market decisions<\/title>/i);
  assert.match(html, /Good morning, Varun/i);
  assert.match(html, /AI DAILY BRIEF/i);
  assert.match(html, /Watchlist/i);
  assert.match(html, /NVDA/i);
});

test("uses local mock data during the design phase", async () => {
  const page = await import("node:fs/promises").then(({ readFile }) =>
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
  );

  assert.match(page, /const stocks = \[/);
  assert.match(page, /symbol: "NVDA"/);
  assert.match(page, /symbol: "MSFT"/);
  assert.doesNotMatch(page, /\bfetch\s*\(/);
});
