const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.join(process.cwd(), "components", "join-experience.tsx"),
  "utf8",
);

test("membership preview does not show a placeholder membership id", () => {
  assert.equal(source.includes("DSP-XX-NEW-00001"), false);
});

test("membership id panel renders only after a member exists", () => {
  assert.match(source, /\{member \? \(\s*<div className="card-id-panel">/);
});
