const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const source = fs.readFileSync(
  path.join(__dirname, "..", "components", "join-experience.tsx"),
  "utf8",
);

test("membership JPG export handles Instagram in-app browsers without relying only on anchor download", () => {
  assert.match(source, /isInstagramInAppBrowser/);
  assert.match(source, /navigator\.share/);
  assert.match(source, /navigator\.canShare/);
  assert.match(source, /canvas\.toBlob/);
});
