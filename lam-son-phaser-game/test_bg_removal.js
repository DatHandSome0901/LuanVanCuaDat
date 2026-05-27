import { Jimp } from 'jimp';

async function processImage() {
  const filePath = 'd:/api_web_chatbot_historicalchatbot v2/lam-son-phaser-game/public/assets/characters/hero/hero_spritesheet.png';
  const outPath = 'd:/api_web_chatbot_historicalchatbot v2/lam-son-phaser-game/public/assets/characters/hero/hero_spritesheet_clean.png';
  
  const image = await Jimp.read(filePath);
  const origW = image.bitmap.width;
  const origH = image.bitmap.height;
  
  const frameWidth = 256;
  const frameHeight = 256;
  
  const d = image.bitmap.data;
  
  const getRGB = (px, py) => {
    const i = (py * origW + px) * 4;
    return [d[i], d[i+1], d[i+2], d[i+3]];
  };
  
  const cols = Math.floor(origW / frameWidth);
  const rows = Math.floor(origH / frameHeight);
  
  const visited = new Uint8Array(origW * origH);
  
  const isBg = (px, py) => {
    const [r, g, b, a] = getRGB(px, py);
    if (a === 0) return true;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const luma = r * 0.2126 + g * 0.7152 + b * 0.0722;
    
    // Match white/grey halo pixels
    if ((max - min) <= 45 && luma >= 130) return true;
    if (luma >= 210) return true;
    
    return false;
  };
  
  let clearedCount = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const fx = col * frameWidth;
      const fy = row * frameHeight;
      
      const queue = [];
      const enqueue = (px, py) => {
        if (px < fx || px >= fx + frameWidth) return;
        if (py < fy || py >= fy + frameHeight) return;
        const vi = py * origW + px;
        if (visited[vi]) return;
        if (!isBg(px, py)) return;
        visited[vi] = 1;
        queue.push(px, py);
      };
      
      // Seed border
      for (let x = fx; x < fx + frameWidth; x++) {
        enqueue(x, fy);
        enqueue(x, fy + frameHeight - 1);
      }
      for (let y = fy; y < fy + frameHeight; y++) {
        enqueue(fx, y);
        enqueue(fx + frameWidth - 1, y);
      }
      
      let qi = 0;
      while (qi < queue.length) {
        const px = queue[qi++];
        const py = queue[qi++];
        
        const idx = (py * origW + px) * 4;
        if (d[idx + 3] !== 0) {
          d[idx + 3] = 0; // Make transparent
          clearedCount++;
        }
        
        enqueue(px + 1, py);
        enqueue(px - 1, py);
        enqueue(px, py + 1);
        enqueue(px, py - 1);
      }
    }
  }
  
  console.log(`Cleared ${clearedCount} halo/background pixels.`);
  await image.write(outPath);
  console.log('Saved cleaned image to hero_spritesheet_clean.png');
}

processImage().catch(console.error);
