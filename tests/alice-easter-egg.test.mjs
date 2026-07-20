import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pagePath = new URL("../app/page.tsx", import.meta.url);
const cssPath = new URL("../app/globals.css", import.meta.url);

test("keeps the Alice reference hidden behind the terminal command", async () => {
  const page = await readFile(pagePath, "utf8");
  const css = await readFile(cssPath, "utf8");

  assert.match(page, /case "alice":/);
  assert.match(page, /SIGNAL A\.L\.I\.C\.E\. DETECTED/);
  assert.match(page, /A Little Interference Called Emotion\./);
  assert.match(page, /Manche Begegnungen klingen länger nach\./);
  assert.match(css, /\.site-shell\.alice-signal::after/);
  assert.match(css, /@keyframes alice-interference/);
});
