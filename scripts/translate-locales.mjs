import fs from "node:fs";
import path from "node:path";
import { v3 as translateV3 } from "@google-cloud/translate";

const { TranslationServiceClient } = translateV3;
const root = process.cwd();
const dictionariesDir = path.join(root, "lib", "i18n", "dictionaries");
const protectedTerms = [
  "Daru Samaj Party",
  "DSP",
  "ACPs",
  "Alcohol Consuming Persons",
  "#DARUSAMAJPARTY",
  "darusamajparty@gmail.com",
  "darusamajparty.info",
  "Instagram",
  "Facebook",
  "YouTube",
];

function parseLocales() {
  const arg = process.argv.find((value) => value.startsWith("--locales="));
  return (arg?.split("=")[1] || "hi,mr,bn,gu,pa,ta,te,kn,ml,ur")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(dictionariesDir, fileName), "utf8"));
}

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function flattenStrings(value, prefix = "", rows = []) {
  if (typeof value === "string") {
    rows.push([prefix, value]);
    return rows;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => flattenStrings(item, `${prefix}.${index}`, rows));
    return rows;
  }
  if (isObject(value)) {
    Object.entries(value).forEach(([key, child]) =>
      flattenStrings(child, prefix ? `${prefix}.${key}` : key, rows),
    );
  }
  return rows;
}

function setPath(target, dottedPath, value) {
  const parts = dottedPath.split(".");
  let cursor = target;
  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    const nextIsIndex = /^\d+$/.test(parts[index + 1] || "");
    const key = /^\d+$/.test(part) ? Number(part) : part;
    if (isLast) {
      cursor[key] = value;
      return;
    }
    cursor[key] ??= nextIsIndex ? [] : {};
    cursor = cursor[key];
  });
}

function shouldSkip(value) {
  return protectedTerms.some((term) => value === term || value.includes(`@`) || value.includes(".info"));
}

async function main() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_TRANSLATE_LOCATION || "global";
  if (!projectId) {
    throw new Error("GOOGLE_CLOUD_PROJECT_ID is required to generate locale drafts.");
  }

  const client = new TranslationServiceClient();
  const parent = `projects/${projectId}/locations/${location}`;
  const english = readJson("en.json");
  const rows = flattenStrings(english).filter(([, value]) => !shouldSkip(value));

  for (const locale of parseLocales()) {
    const output = {};
    for (let index = 0; index < rows.length; index += 80) {
      const batch = rows.slice(index, index + 80);
      const [response] = await client.translateText({
        parent,
        contents: batch.map(([, value]) => value),
        mimeType: "text/plain",
        sourceLanguageCode: "en",
        targetLanguageCode: locale,
      });
      response.translations.forEach((translation, translationIndex) => {
        setPath(output, batch[translationIndex][0], translation.translatedText || batch[translationIndex][1]);
      });
    }

    fs.writeFileSync(
      path.join(dictionariesDir, `${locale}.json`),
      `${JSON.stringify(output, null, 2)}\n`,
      "utf8",
    );
    console.log(`Translated ${locale}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
