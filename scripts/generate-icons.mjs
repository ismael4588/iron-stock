import { mkdir, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public", "icons");
const svg = join(iconsDir, "icon.svg");

await mkdir(iconsDir, { recursive: true });

for (const size of [192, 512]) {
  const buffer = await sharp(svg).resize(size, size).png().toBuffer();
  await writeFile(join(iconsDir, `icon-${size}.png`), buffer);
}

console.log("Generated PWA icons");
