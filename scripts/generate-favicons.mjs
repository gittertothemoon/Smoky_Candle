import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const LOGO = join(ROOT, "public", "images", "logo.png");
const PUBLIC = join(ROOT, "public");
const APP = join(ROOT, "src", "app");

async function pngBuffer(size) {
  return sharp(LOGO)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

function buildIco(pngs) {
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  const dataChunks = [];
  let offset = 6 + 16 * count;

  for (const { size, buf } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    dirEntries.push(entry);
    dataChunks.push(buf);
    offset += buf.length;
  }

  return Buffer.concat([header, ...dirEntries, ...dataChunks]);
}

async function main() {
  const sizes = [16, 32, 48];
  const pngs = await Promise.all(
    sizes.map(async (size) => ({ size, buf: await pngBuffer(size) }))
  );

  const ico = buildIco(pngs);
  writeFileSync(join(PUBLIC, "favicon.ico"), ico);
  writeFileSync(join(APP, "favicon.ico"), ico);
  console.log("✓ favicon.ico (16/32/48)");

  writeFileSync(join(PUBLIC, "favicon-16x16.png"), pngs[0].buf);
  console.log("✓ favicon-16x16.png");

  writeFileSync(join(PUBLIC, "favicon-32x32.png"), pngs[1].buf);
  console.log("✓ favicon-32x32.png");

  const apple = await pngBuffer(180);
  writeFileSync(join(PUBLIC, "apple-touch-icon.png"), apple);
  console.log("✓ apple-touch-icon.png (180x180)");

  const png192 = await pngBuffer(192);
  writeFileSync(join(PUBLIC, "android-chrome-192x192.png"), png192);
  console.log("✓ android-chrome-192x192.png");

  const png512 = await pngBuffer(512);
  writeFileSync(join(PUBLIC, "android-chrome-512x512.png"), png512);
  console.log("✓ android-chrome-512x512.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
