const test = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

test("locale dictionaries are complete and protected terms are preserved", () => {
  const result = spawnSync(process.execPath, ["scripts/check-locales.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Locale dictionaries are complete\./);
});
