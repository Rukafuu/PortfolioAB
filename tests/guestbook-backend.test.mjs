import assert from "node:assert/strict";
import test from "node:test";
import {
  GUESTBOOK_MESSAGE_MAX,
  GUESTBOOK_RATE_LIMIT,
  filterApprovedEntries,
  isGuestbookRateLimited,
  validateGuestbookSubmission,
  verifyTurnstileToken,
} from "../lib/guestbook.ts";

const validSubmission = {
  name: "Ada Lovelace",
  message: "A thoughtful corner of the web.",
  url: "github.com/ada",
  turnstileToken: "verified-token",
  company: "",
};

test("accepts and normalizes a valid guestbook submission", () => {
  const result = validateGuestbookSubmission(validSubmission);
  assert.equal(result.ok, true);
  assert.equal(result.value.url, "https://github.com/ada");
});

test("rejects an empty name", () => {
  const result = validateGuestbookSubmission({ ...validSubmission, name: "  " });
  assert.equal(result.ok, false);
  assert.equal(result.fields.name, "Name is required.");
});

test("rejects an empty message", () => {
  const result = validateGuestbookSubmission({ ...validSubmission, message: "" });
  assert.equal(result.ok, false);
  assert.equal(result.fields.message, "Message is required.");
});

test("rejects an oversized message", () => {
  const result = validateGuestbookSubmission({ ...validSubmission, message: "a".repeat(GUESTBOOK_MESSAGE_MAX + 1) });
  assert.equal(result.ok, false);
  assert.match(result.fields.message, /characters or fewer/);
});

test("rejects unsafe and invalid visitor URLs", () => {
  for (const url of ["javascript:alert(1)", "http://localhost/admin", "https://user:pass@example.com"]) {
    const result = validateGuestbookSubmission({ ...validSubmission, url });
    assert.equal(result.ok, false, url);
    assert.ok(result.fields.url, url);
  }
});

test("rejects HTML and XSS-shaped plain text", () => {
  const result = validateGuestbookSubmission({ ...validSubmission, message: "nice <script>alert(1)</script>" });
  assert.equal(result.ok, false);
  assert.equal(result.fields.message, "Use plain text only.");
});

test("enforces the rate limit threshold", () => {
  assert.equal(isGuestbookRateLimited(GUESTBOOK_RATE_LIMIT - 1), false);
  assert.equal(isGuestbookRateLimited(GUESTBOOK_RATE_LIMIT), true);
});

test("rejects an invalid Turnstile result", async () => {
  const fakeFetch = async () => new Response(JSON.stringify({ success: false }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
  assert.equal(await verifyTurnstileToken("invalid", "secret", "203.0.113.10", fakeFetch), false);
});

test("public filtering keeps approved entries only", () => {
  const entries = [
    { id: 1, status: "pending" },
    { id: 2, status: "approved" },
    { id: 3, status: "rejected" },
  ];
  assert.deepEqual(filterApprovedEntries(entries), [{ id: 2, status: "approved" }]);
});
