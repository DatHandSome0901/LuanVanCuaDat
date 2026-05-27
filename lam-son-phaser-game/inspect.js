import { Jimp } from 'jimp';

async function run() {
  const filePath = 'd:/api_web_chatbot_historicalchatbot v2/lam-son-phaser-game/public/assets/characters/hero/hero_spritesheet.png';
  const image = await Jimp.read(filePath);
  const w = image.bitmap.width;
  const h = image.bitmap.height;
  
  console.log('Finding pixels on the boundary of transparency...');
  let count = 0;
  image.scan(1, 1, w - 2, h - 2, function (x, y, idx) {
    const a = this.bitmap.data[idx + 3];
    if (a > 0 && count < 30) {
      // Check if any neighbor is transparent
      let neighborTransparent = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nidx = ((y + dy) * w + (x + dx)) * 4;
          if (this.bitmap.data[nidx + 3] === 0) {
            neighborTransparent = true;
            break;
          }
        }
      }
      
      if (neighborTransparent) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];
        // If the color is white/light gray
        if (r > 200 && g > 200 && b > 200) {
          console.log(`Boundary pixel at (${x}, ${y}): RGBA(${r}, ${g}, ${b}, ${a})`);
          count++;
        }
      }
    }
  });
}

run().catch(console.error);
