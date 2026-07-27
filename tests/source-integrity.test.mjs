import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pagePath = new URL("../app/page.tsx", import.meta.url);
const cssPath = new URL("../app/globals.css", import.meta.url);
const postsPath = new URL("../app/content/posts.ts", import.meta.url);

test("keeps generated truncation markers out of the source", async () => {
  const sources = await Promise.all([
    readFile(pagePath, "utf8"),
    readFile(cssPath, "utf8"),
    readFile(postsPath, "utf8"),
  ]);

  for (const source of sources) {
    assert.doesNotMatch(source, /tokens truncated/);
    assert.doesNotMatch(source, /…\d+\s+tokens/);
  }
});

test("releases scheduled posts by date and formats their real month", async () => {
  const page = await readFile(pagePath, "utf8");

  assert.match(page, /function isPostScheduled/);
  assert.match(page, /publishedAt}T03:00:00\.000Z/);
  assert.match(page, /const scheduled = isPostScheduled\(note\)/);
  assert.match(page, /"AGO"/);
  assert.match(page, /"AUG"/);
});

test("contains the complete latency article", async () => {
  const posts = await readFile(postsPath, "utf8");

  assert.match(posts, /O silêncio inventa histórias/);
  assert.match(posts, /Agentes tornam o problema mais complicado/);
  assert.match(posts, /Orçamentos de latência também são decisões de produto/);
  assert.match(posts, /Latency budgets are product decisions/);
});
