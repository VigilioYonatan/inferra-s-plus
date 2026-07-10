import fs from "fs";
import path from "path";
import { chromium } from "./inferra-project/apps/inferra-web/node_modules/@playwright/test/index.mjs";

const RAW_DARK = "C:/Users/Admin/.gemini/antigravity/brain/48413acc-6c56-4c02-9dbd-e519a50ac2f1/.user_uploaded/media_1794289824496_d349da77.png";
const RAW_LIGHT = "C:/Users/Admin/.gemini/antigravity/brain/48413acc-6c56-4c02-9dbd-e519a50ac2f1/.user_uploaded/media_1794289834081_9353dcd8.png";
const RAW_ICON_BLACK = "C:/Users/Admin/.gemini/antigravity/brain/48413acc-6c56-4c02-9dbd-e519a50ac2f1/.user_uploaded/media_1794289818292_83bc84ee.png";
const RAW_WIREFRAME = "C:/Users/Admin/.gemini/antigravity/brain/48413acc-6c56-4c02-9dbd-e519a50ac2f1/.user_uploaded/media_1794289811362_2ae75b92.png";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Create White icon mark from Black icon mark (preserve alpha, turn pixels to 255,255,255)
  const iconBlackB64 = fs.readFileSync(RAW_ICON_BLACK).toString("base64");
  const iconWhiteDataUrl = await page.evaluate(async (b64) => {
    const img = new Image();
    await new Promise(r => { img.onload = r; img.src = "data:image/png;base64," + b64; });
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, c.width, c.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i+3] > 0) {
        d[i] = 255;
        d[i+1] = 255;
        d[i+2] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return c.toDataURL("image/png");
  }, iconBlackB64);

  await browser.close();

  const iconWhiteBuffer = Buffer.from(iconWhiteDataUrl.replace(/^data:image\/png;base64,/, ""), "base64");

  const targets = [
    "inferra-project/apps/inferra-web/public/brand",
    "inferra-project/apps/inferra-web/public",
    "docs/assets",
    "inferra-project/docs/assets"
  ];

  for (const dir of targets) {
    fs.mkdirSync(dir, { recursive: true });
    // Full horizontal logos
    fs.copyFileSync(RAW_DARK, path.join(dir, "logo-dark.png"));
    fs.copyFileSync(RAW_LIGHT, path.join(dir, "logo-light.png"));
    // Icon marks
    fs.copyFileSync(RAW_ICON_BLACK, path.join(dir, "logo-icon-light.png"));
    fs.writeFileSync(path.join(dir, "logo-icon-dark.png"), iconWhiteBuffer);
    fs.copyFileSync(RAW_WIREFRAME, path.join(dir, "logo-wireframe.png"));
  }

  // Favicon SVG with Dark/Light Adaptive Squircle
  const iconDarkB64 = iconWhiteBuffer.toString("base64");
  const iconLightB64 = fs.readFileSync(RAW_ICON_BLACK).toString("base64");
  const darkBannerB64 = fs.readFileSync(RAW_DARK).toString("base64");
  const lightBannerB64 = fs.readFileSync(RAW_LIGHT).toString("base64");

  const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="sq-grad-dark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181B" />
      <stop offset="100%" stop-color="#09090B" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <rect class="bg-squircle" width="512" height="512" rx="128" fill="url(#sq-grad-dark)" stroke="#27272A" stroke-width="8" filter="url(#glow)"/>
  <image href="data:image/png;base64,${iconDarkB64}" x="76" y="76" width="360" height="360" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

  const logoDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 341" width="1024" height="341">
  <title>INFERЯA S+ Logo (Dark)</title>
  <image href="data:image/png;base64,${darkBannerB64}" x="0" y="0" width="1024" height="341" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

  const logoLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 341" width="1024" height="341">
  <title>INFERЯA S+ Logo (Light)</title>
  <image href="data:image/png;base64,${lightBannerB64}" x="0" y="0" width="1024" height="341" preserveAspectRatio="xMidYMid meet"/>
</svg>`;

  for (const dir of targets) {
    fs.writeFileSync(path.join(dir, "favicon.svg"), faviconSvg);
    fs.writeFileSync(path.join(dir, "logo-dark.svg"), logoDarkSvg);
    fs.writeFileSync(path.join(dir, "logo-light.svg"), logoLightSvg);
  }

  // Favicon ico
  fs.copyFileSync(path.join("inferra-project/apps/inferra-web/public/brand", "logo-icon-dark.png"), "inferra-project/apps/inferra-web/public/favicon.ico");

  console.log("Clean transparent brand assets established!");
}

main().catch(console.error);
