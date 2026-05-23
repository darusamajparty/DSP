import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dictionariesDir = path.join(root, "lib", "i18n", "dictionaries");
const locales = ["hi", "mr", "bn", "gu", "pa", "ta", "te", "kn", "ml", "ur"];
const protectedTerms = [
  "Daru Samaj Party",
  "DSP",
  "ACPs",
  "Alcohol Consuming Persons",
  "#DARUSAMAJPARTY",
  "darusamajparty@gmail.com",
  "darusamajparty.online",
  "Instagram",
  "Facebook",
  "YouTube",
];

function readJson(fileName) {
  const filePath = path.join(dictionariesDir, fileName);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function collectPaths(value, prefix = "") {
  if (!isObject(value)) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    collectPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function checkOverlayShape(base, overlay, locale, prefix = "") {
  const errors = [];
  if (!isObject(overlay)) return errors;

  for (const [key, value] of Object.entries(overlay)) {
    const pathName = prefix ? `${prefix}.${key}` : key;
    if (!(key in base)) {
      errors.push(`${locale}: extra key ${pathName}`);
      continue;
    }

    const baseValue = base[key];
    if (isObject(value)) {
      if (!isObject(baseValue)) {
        errors.push(`${locale}: ${pathName} should not be an object`);
      } else {
        errors.push(...checkOverlayShape(baseValue, value, locale, pathName));
      }
    }
  }

  return errors;
}

function checkProtectedTerms(locale, source) {
  const errors = [];
  for (const term of protectedTerms) {
    const escaped = JSON.stringify(term).slice(1, -1);
    if (source.toLowerCase().includes(escaped.toLowerCase()) && !source.includes(escaped)) {
      errors.push(`${locale}: protected term casing changed: ${term}`);
    }
  }
  return errors;
}

const errors = [];
const english = readJson("en.json");
const englishPaths = new Set(collectPaths(english));

if (!englishPaths.has("hero.title")) {
  errors.push("en: expected hero.title");
}

for (const locale of locales) {
  const fileName = `${locale}.json`;
  const filePath = path.join(dictionariesDir, fileName);
  if (!fs.existsSync(filePath)) {
    errors.push(`${locale}: missing ${fileName}`);
    continue;
  }

  const source = fs.readFileSync(filePath, "utf8");
  const overlay = JSON.parse(source);
  errors.push(...checkOverlayShape(english, overlay, locale));
  errors.push(...checkProtectedTerms(locale, source));
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log("Locale dictionaries are complete.");
