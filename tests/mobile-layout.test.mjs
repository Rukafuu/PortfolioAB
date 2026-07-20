import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const cssPath = new URL("../app/globals.css", import.meta.url);
const layoutPath = new URL("../app/layout.tsx", import.meta.url);

test("declares an iOS-safe viewport", async () => {
  const layout = await readFile(layoutPath, "utf8");
  assert.match(layout, /viewportFit:\s*"cover"/);
  assert.match(layout, /width:\s*"device-width"/);
  assert.match(layout, /initialScale:\s*1/);
});

test("keeps mobile overlays and controls inside iPhone safe areas", async () => {
  const css = await readFile(cssPath, "utf8");
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /@media \(max-width: 430px\)/);
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /max-height:\s*calc\(100dvh - 20px\)/);
  assert.match(css, /\.terminal-output input\s*\{\s*font-size:\s*16px/);
  assert.match(css, /\.back-actions\s*\{\s*flex-direction:\s*column/);
  assert.match(css, /touch-action:\s*manipulation/);
});
