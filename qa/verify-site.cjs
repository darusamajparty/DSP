const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

function readJpegDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf
    ) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  return null;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const errors = [];
  const baseUrl = process.env.QA_BASE_URL || "http://127.0.0.1:4174";

  const sampleImage = path.join(__dirname, "..", "public", "assets", "dsp-rally-poster.jpeg");

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  desktop.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  desktop.on("pageerror", (error) => errors.push(error.message));

  await desktop.goto(baseUrl, { waitUntil: "networkidle" });
  const desktopMetrics = await desktop.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    h1: document.querySelector("h1")?.textContent?.trim(),
    heroText: document.querySelector(".hero-copy p")?.textContent?.trim(),
    logoSrc: document.querySelector(".brand-mark img")?.getAttribute("src"),
    aboutText: document.querySelector("#about")?.textContent?.trim(),
    manifestoText: document.querySelector("#manifesto")?.textContent?.trim(),
    visionText: document.querySelector("#vision")?.textContent?.trim(),
    missionText: document.querySelector("#mission")?.textContent?.trim(),
    heroImageFit: getComputedStyle(document.querySelector(".hero-card img")).objectFit,
    sections: [...document.querySelectorAll("section[id]")].map((section) => section.id),
  }));

  await desktop.fill('input[name="name"]', "A very committed DSP member");
  await desktop.fill('input[name="email"]', "member@example.com");
  await desktop.fill('input[name="phone"]', "+91 98765 43210");
  await desktop.fill('input[name="state"]', "Maharashtra");
  await desktop.fill('input[name="district"]', "Mumbai Suburban");
  await desktop.fill('input[name="instagram"]', "@dsp_member");
  await desktop.setInputFiles('input[name="photo"]', sampleImage);
  await desktop.locator(".card-photo img").waitFor({ state: "visible" });
  const downloadPromise = desktop.waitForEvent("download");
  await desktop.click('button:has-text("Download JPG")');
  const download = await downloadPromise;
  const downloadPath = path.join(__dirname, "..", "assets", "membership-card-qa.jpg");
  await download.saveAs(downloadPath);
  const jpgDimensions = readJpegDimensions(downloadPath);
  await desktop.click('button:has-text("Generate Membership Card")');
  await desktop.waitForFunction(() => {
    const text = document.querySelector(".form-status")?.textContent || "";
    return (
      text.includes("Membership generated") ||
      text.includes("Only one membership submission is allowed") ||
      text.includes("Supabase server configuration is missing") ||
      text.includes("Could not")
    );
  });

  const formNote = await desktop.locator(".form-status").innerText();
  const cardText = await desktop.locator(".membership-card").innerText();
  const cardBox = await desktop.locator(".membership-card").boundingBox();
  const cardVisuals = await desktop.evaluate(() => ({
    premiumShell: Boolean(document.querySelector(".card-premium-shell")),
    idPanel: Boolean(document.querySelector(".card-id-panel")),
    qrMark: Boolean(document.querySelector(".card-qr-mark")),
    qrHref: document.querySelector(".card-qr-mark")?.getAttribute("href") || "",
    qrSrc: document.querySelector(".card-qr-mark img")?.getAttribute("src") || "",
    bottle: Boolean(document.querySelector(".card-whiskey-bottle")),
    logoWidth: Math.round(document.querySelector(".card-brand img")?.getBoundingClientRect().width || 0),
    dataRows: document.querySelectorAll(".card-data-row").length,
    idPanelGeometry: (() => {
      const card = document.querySelector(".membership-card")?.getBoundingClientRect();
      const panel = document.querySelector(".card-id-panel")?.getBoundingClientRect();
      if (!card || !panel) return null;
      return {
        topRatio: Number(((panel.top - card.top) / card.height).toFixed(2)),
        heightRatio: Number((panel.height / card.height).toFixed(2)),
      };
    })(),
  }));
  const submissionBlocked = !formNote.includes("Membership generated");
  await desktop.screenshot({ path: "assets/desktop-qa.png", fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 920 }, isMobile: true });
  await mobile.goto(baseUrl, { waitUntil: "networkidle" });
  const mobileMetrics = await mobile.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    h1: document.querySelector("h1")?.textContent?.trim(),
    heroText: document.querySelector(".hero-copy p")?.textContent?.trim(),
    logoSrc: document.querySelector(".brand-mark img")?.getAttribute("src"),
    aboutText: document.querySelector("#about")?.textContent?.trim(),
    manifestoText: document.querySelector("#manifesto")?.textContent?.trim(),
    visionText: document.querySelector("#vision")?.textContent?.trim(),
    missionText: document.querySelector("#mission")?.textContent?.trim(),
    heroImageFit: getComputedStyle(document.querySelector(".hero-card img")).objectFit,
  }));
  await mobile.screenshot({ path: "assets/mobile-qa.png", fullPage: true });

  async function inspectLocalizedRoute(route) {
    const page = await browser.newPage({ viewport: { width: 390, height: 920 }, isMobile: true });
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${route}: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`${route}: ${error.message}`));
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      h1: document.querySelector("h1")?.textContent?.trim() || "",
      body: document.body.textContent || "",
      languageSwitcher: Boolean(document.querySelector(".language-switcher select")),
      selectedLocale: document.querySelector(".language-switcher select")?.value || "",
      routeLang: document.querySelector("[lang]")?.getAttribute("lang") || "",
    }));
    await page.close();
    return {
      route,
      ...metrics,
      overflow: metrics.scrollWidth > metrics.clientWidth,
    };
  }

  const localizedRoutes = [
    await inspectLocalizedRoute("/hi"),
    await inspectLocalizedRoute("/mr"),
    await inspectLocalizedRoute("/ur"),
    await inspectLocalizedRoute("/hi/terms"),
    await inspectLocalizedRoute("/hi/privacy"),
  ];

  await browser.close();

  const result = {
    desktopMetrics,
    mobileMetrics,
    formNote,
    submissionBlocked,
    cardHasMembershipId: /DSP-[A-Z]{2}-[A-Z]{3}-\d{5}/.test(cardText),
    cardVisuals,
    cardAspectRatio: cardBox ? Number((cardBox.width / cardBox.height).toFixed(2)) : null,
    jpgDimensions,
    sampleImageExists: fs.existsSync(sampleImage),
    errors,
    desktopOverflow: desktopMetrics.scrollWidth > desktopMetrics.clientWidth,
    mobileOverflow: mobileMetrics.scrollWidth > mobileMetrics.clientWidth,
    localizedRoutes,
  };
  const unexpectedErrors = result.submissionBlocked
    ? errors.filter((error) => !error.includes("429"))
    : errors;

  console.log(JSON.stringify(result, null, 2));

  if (
    result.desktopOverflow ||
    result.mobileOverflow ||
    localizedRoutes.some(
      (route) =>
        route.overflow ||
        !route.h1 ||
        !route.languageSwitcher ||
        (route.route === "/hi" && route.selectedLocale !== "hi") ||
        (route.route === "/mr" && route.selectedLocale !== "mr") ||
        (route.route === "/ur" && route.selectedLocale !== "ur") ||
        (route.route.startsWith("/hi/") && route.selectedLocale !== "hi"),
    ) ||
    unexpectedErrors.length ||
    result.cardAspectRatio !== 0.8 ||
    !result.desktopMetrics.heroText.includes("The voice of ACP") ||
    result.desktopMetrics.logoSrc !== "/assets/dsp-logo.jpeg" ||
    result.mobileMetrics.logoSrc !== "/assets/dsp-logo.jpeg" ||
    !result.desktopMetrics.aboutText.includes("Responsible drinkers deserve dignity") ||
    !result.desktopMetrics.aboutText.includes("DSP - The Voice of Responsible Drinkers.") ||
    !result.desktopMetrics.manifestoText.includes("Dignity for Responsible Drinkers") ||
    !result.desktopMetrics.manifestoText.includes("Daru Samaj Party - The Voice of Responsible Drinkers.") ||
    !result.desktopMetrics.visionText.includes("dignity, fairness, and respect") ||
    !result.desktopMetrics.missionText.includes("practical alcohol policies") ||
    result.desktopMetrics.heroImageFit !== "contain" ||
    result.mobileMetrics.heroImageFit !== "contain" ||
    !result.cardVisuals.premiumShell ||
    !result.cardVisuals.idPanel ||
    !result.cardVisuals.qrMark ||
    result.cardVisuals.qrHref !== "https://darusamajparty.online" ||
    result.cardVisuals.qrSrc !== "/assets/dsp-website-qr.svg" ||
    !result.cardVisuals.bottle ||
    result.cardVisuals.logoWidth < 48 ||
    result.cardVisuals.dataRows !== 3 ||
    !result.cardVisuals.idPanelGeometry ||
    result.cardVisuals.idPanelGeometry.topRatio < 0.58 ||
    result.cardVisuals.idPanelGeometry.heightRatio > 0.24 ||
    (!result.submissionBlocked && !result.cardHasMembershipId) ||
    !result.jpgDimensions ||
    result.jpgDimensions.width !== 1080 ||
    result.jpgDimensions.height !== 1350 ||
    !result.sampleImageExists
  ) {
    process.exitCode = 1;
  }
})();
