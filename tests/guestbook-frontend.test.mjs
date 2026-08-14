import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const clientPath = new URL("../app/guestbook/guestbook-client.tsx", import.meta.url);
const pagePath = new URL("../app/guestbook/page.tsx", import.meta.url);
const cssPath = new URL("../app/guestbook/guestbook.module.css", import.meta.url);

test("guestbook renders the accessible form and character counter", async () => {
  const client = await readFile(clientPath, "utf8");
  assert.match(client, /<form[^>]*onSubmit=/);
  assert.match(client, /htmlFor="guestbook-name"/);
  assert.match(client, /htmlFor="guestbook-message"/);
  assert.match(client, /Array\.from\(message\)\.length/);
  assert.match(client, /aria-live="polite"/);
});

test("guestbook exposes loading, success, error and empty states", async () => {
  const client = await readFile(clientPath, "utf8");
  assert.match(client, /Leaving your trace\.\.\./);
  assert.match(client, /Trace received\. It'll appear here after approval\./);
  assert.match(client, /Your trace didn't make it into the log\./);
  assert.match(client, /No traces yet\./);
  assert.match(client, /Be the first person to leave one\./);
});

test("guestbook keeps UGC links safe and administrative content out of public metadata", async () => {
  const [client, page] = await Promise.all([readFile(clientPath, "utf8"), readFile(pagePath, "utf8")]);
  assert.match(client, /nofollow ugc noopener noreferrer/);
  assert.match(page, /alternates: \{ canonical: "\/guestbook" \}/);
});

test("guestbook is responsive and respects reduced motion", async () => {
  const css = await readFile(cssPath, "utf8");
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /font-size: 16px/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
