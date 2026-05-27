import { Jimp } from 'jimp';
import path from 'path';
import fs from 'fs';

const filesToProcess = [
  'hero_idle_ref.png',
  'hero_side_ref.png',
  'boss_ref.png',
  'boss_front_ref.png',
  'boss_back_ref.png',
  'boss_side_ref.png',
  'enemy_infantry_ref.png',
  'enemy_archer_ref.png',
  'enemy_spearman_ref.png',
  'enemy_swordsman_ref.png',
  'enemy_cavalry_ref.png',
  'boss_skill_effect_ref.png'
];

async function processImage(dirPath, filename) {
  const filePath = path.join(dirPath, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  console.log(`Processing: ${filename}...`);
  const image = await Jimp.read(filePath);
  
  // Sample top-left corner to get background color
  const bgHex = image.getPixelColor(0, 0);
  const bgR = (bgHex >> 24) & 0xff;
  const bgG = (bgHex >> 16) & 0xff;
  const bgB = (bgHex >> 8) & 0xff;
  console.log(`Detected background color: RGB(${bgR}, ${bgG}, ${bgB})`);

  const minThreshold = 25;
  const maxThreshold = 65;

  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const a = this.bitmap.data[idx + 3];

    if (a > 0) {
      // Calculate color distance
      const dist = Math.sqrt(
        Math.pow(r - bgR, 2) +
        Math.pow(g - bgG, 2) +
        Math.pow(b - bgB, 2)
      );

      if (dist <= minThreshold) {
        this.bitmap.data[idx + 3] = 0; // Make transparent
      } else if (dist < maxThreshold) {
        // Soft edge blending
        const factor = (dist - minThreshold) / (maxThreshold - minThreshold);
        this.bitmap.data[idx + 3] = Math.min(a, Math.round(factor * 255));
      }
    }
  });

  // Write processed image back
  await image.write(filePath);
  console.log(`Successfully transparentized: ${filename}`);
}

async function run() {
  const dirs = [
    './public/assets/lam_son_cropped_assets',
    '../frontend/public/game/assets/lam_son_cropped_assets'
  ];

  for (const dir of dirs) {
    console.log(`\n--- Processing directory: ${dir} ---`);
    for (const file of filesToProcess) {
      try {
        await processImage(dir, file);
      } catch (err) {
        console.error(`Error processing ${file} in ${dir}:`, err);
      }
    }
  }
  console.log('\nAll character backgrounds successfully removed from all directories!');
}

run();
