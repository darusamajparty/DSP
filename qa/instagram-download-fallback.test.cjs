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

test("Instagram fallback renders the generated card in-page instead of opening a generated URL", () => {
  assert.match(source, /cardSavePreviewUrl/);
  assert.match(source, /downloadInstagramFallback/);
  assert.match(source, /kind: "preview"/);
  const instagramBranch = source.indexOf("if (isInstagramInAppBrowser())");
  const previewReturn = source.indexOf('return { kind: "preview"', instagramBranch);
  const anchorClick = source.indexOf("link.click()", instagramBranch);
  assert.ok(instagramBranch > -1);
  assert.ok(previewReturn > instagramBranch);
  assert.ok(anchorClick > previewReturn);
});
