const test = require("node:test");
const assert = require("node:assert/strict");
const {
  getRetryAfterSeconds,
  isWithinSubmitWindow,
} = require("../lib/submission-rate-limit.js");

test("blocks another submission inside the one-minute IP window", () => {
  const now = new Date("2026-05-22T12:00:30.000Z");
  const firstSubmit = new Date("2026-05-22T12:00:00.000Z");

  assert.equal(isWithinSubmitWindow(firstSubmit, now), true);
  assert.equal(getRetryAfterSeconds(firstSubmit, now), 30);
});

test("allows another submission once the one-minute IP window has passed", () => {
  const now = new Date("2026-05-22T12:01:00.000Z");
  const firstSubmit = new Date("2026-05-22T12:00:00.000Z");

  assert.equal(isWithinSubmitWindow(firstSubmit, now), false);
  assert.equal(getRetryAfterSeconds(firstSubmit, now), 0);
});
