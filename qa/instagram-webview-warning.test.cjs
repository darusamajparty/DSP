const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.join(__dirname, "..");
const homeSource = fs.readFileSync(path.join(root, "components", "home-page.tsx"), "utf8");
const warningPath = path.join(root, "components", "instagram-warning-banner.tsx");
const englishSource = fs.readFileSync(
  path.join(root, "lib", "i18n", "dictionaries", "en.json"),
  "utf8",
);

test("landing page includes Instagram webview warning for membership card downloads", () => {
  assert.match(homeSource, /InstagramWarningBanner/);
  assert.match(englishSource, /open this website in Chrome or Safari/i);
  assert.ok(fs.existsSync(warningPath), "expected Instagram warning component");

  const warningSource = fs.readFileSync(warningPath, "utf8");
  assert.match(warningSource, /navigator\.userAgent/);
  assert.match(warningSource, /Instagram/i);
  assert.match(warningSource, /instagram-warning-banner/);
});
