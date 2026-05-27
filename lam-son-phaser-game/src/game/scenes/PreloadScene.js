import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.createLoadingUI();

    const heroPath = 'assets/characters/hero';
    const enemyPath = 'assets/characters/enemies';
    const bossPath = 'assets/characters/boss';
    const effectPath = 'assets/effects';
    const bgPath = 'assets/backgrounds';
    const v = `?v=${Date.now()}`;

    // === MAP BACKGROUND ===
    this.load.image('map_bg', `${bgPath}/map_bg.png${v}`);

    // === HERO SPRITESHEET (4 cols x 4 rows, 256x256 per frame) ===
    this.load.spritesheet('hero', `${heroPath}/hero_spritesheet.png${v}`, {
      frameWidth: 256,
      frameHeight: 256
    });

    // === BOSS SPRITESHEET (4 cols x 4 rows, 256x256 per frame) ===
    this.load.spritesheet('boss', `${bossPath}/boss_spritesheet.png${v}`, {
      frameWidth: 256,
      frameHeight: 256
    });

    // === ENEMY SPRITESHEET (4 cols x 3 rows, 256x256 per frame) ===
    this.load.spritesheet('enemies', `${enemyPath}/enemy_spritesheet.png${v}`, {
      frameWidth: 256,
      frameHeight: 256
    });

    // === EFFECTS ===
    this.load.image('boss_skill_effect', `${effectPath}/boss_skill_effect_model.png${v}`);
  }

  createLoadingUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dark cinematic background
    const bg = this.add.graphics();
    bg.fillStyle(0x0c0504, 1);
    bg.fillRect(0, 0, width, height);

    // Loading title
    this.make.text({
      x: width / 2,
      y: height / 2 - 80,
      text: '⚔  LAM SƠN KHỞI NGHĨA  ⚔',
      style: {
        font: 'bold 28px "Outfit", sans-serif',
        fill: '#d97706'
      }
    }).setOrigin(0.5);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 40,
      text: 'ĐANG TẢI HÀO KHÍ LAM SƠN...',
      style: {
        font: '18px "Outfit", sans-serif',
        fill: '#f5f2eb'
      }
    }).setOrigin(0.5);

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x1a0f0d, 0.8);
    progressBox.fillRoundedRect(width / 2 - 200, height / 2 - 10, 400, 24, 6);

    const progressBar = this.add.graphics();

    const percentText = this.make.text({
      x: width / 2,
      y: height / 2 + 28,
      text: '0%',
      style: { font: '14px "Outfit", sans-serif', fill: '#d97706' }
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xd97706, 1);
      progressBar.fillRoundedRect(width / 2 - 196, height / 2 - 6, 392 * value, 16, 4);
      percentText.setText(`${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      loadingText.destroy();
      progressBar.destroy();
      progressBox.destroy();
      percentText.destroy();
    });
  }

  create() {
    // Fix AI-generated sprite sheets: remove checkerboard/solid background
    // frame sizes: hero & boss = 4 cols x 4 rows, enemies = 4 cols x 3 rows
    // Use actual image width / cols to detect real frame size dynamically
    const heroSrc   = this.textures.get('hero')?.source[0];
    const bossSrc   = this.textures.get('boss')?.source[0];
    const enemySrc  = this.textures.get('enemies')?.source[0];

    const heroFW   = heroSrc  ? Math.floor(heroSrc.width / 4)  : 256;
    const heroFH   = heroSrc  ? Math.floor(heroSrc.height / 4) : 256;
    const bossFW   = bossSrc  ? Math.floor(bossSrc.width / 4)  : 256;
    const bossFH   = bossSrc  ? Math.floor(bossSrc.height / 4) : 256;
    const enemyFW  = enemySrc ? Math.floor(enemySrc.width / 4) : 256;
    const enemyFH  = enemySrc ? Math.floor(enemySrc.height / 4): 256; // 1024x1024 = 4 rows, not 3!

    this.removeBackground('hero',   heroFW,  heroFH);
    this.removeBackground('boss',   bossFW,  bossFH);
    this.removeBackground('enemies', enemyFW, enemyFH);

    // Store computed frame sizes for animation creation
    this._frameSizes = { heroFW, heroFH, bossFW, bossFH, enemyFW, enemyFH };

    this.createAnimations();
    this.generateProceduralAssets();
    this.scene.start('MenuScene');
  }

  createAnimations() {
    // =====================
    //  HERO ANIMATIONS
    // =====================
    // Row 0: Idle (frames 0-3)
    if (!this.anims.exists('hero_idle')) {
      this.anims.create({
        key: 'hero_idle',
        frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
        frameRate: 6,
        repeat: -1
      });
    }
    // Row 1: Run (frames 4-7)
    if (!this.anims.exists('hero_run')) {
      this.anims.create({
        key: 'hero_run',
        frames: this.anims.generateFrameNumbers('hero', { start: 4, end: 7 }),
        frameRate: 10,
        repeat: -1
      });
    }
    // Row 2: Attack (frames 8-11)
    if (!this.anims.exists('hero_attack')) {
      this.anims.create({
        key: 'hero_attack',
        frames: this.anims.generateFrameNumbers('hero', { start: 8, end: 11 }),
        frameRate: 14,
        repeat: 0
      });
    }
    // Row 3: Hurt (12), Stagger (13), Fall (14), Dead (15)
    if (!this.anims.exists('hero_hurt')) {
      this.anims.create({
        key: 'hero_hurt',
        frames: this.anims.generateFrameNumbers('hero', { start: 12, end: 13 }),
        frameRate: 10,
        repeat: 0
      });
    }
    if (!this.anims.exists('hero_dead')) {
      this.anims.create({
        key: 'hero_dead',
        frames: this.anims.generateFrameNumbers('hero', { start: 14, end: 15 }),
        frameRate: 6,
        repeat: 0
      });
    }

    // =====================
    //  BOSS ANIMATIONS
    // =====================
    if (!this.anims.exists('boss_idle')) {
      this.anims.create({
        key: 'boss_idle',
        frames: this.anims.generateFrameNumbers('boss', { start: 0, end: 3 }),
        frameRate: 5,
        repeat: -1
      });
    }
    if (!this.anims.exists('boss_walk')) {
      this.anims.create({
        key: 'boss_walk',
        frames: this.anims.generateFrameNumbers('boss', { start: 4, end: 7 }),
        frameRate: 8,
        repeat: -1
      });
    }
    if (!this.anims.exists('boss_attack')) {
      this.anims.create({
        key: 'boss_attack',
        frames: this.anims.generateFrameNumbers('boss', { start: 8, end: 11 }),
        frameRate: 10,
        repeat: 0
      });
    }
    if (!this.anims.exists('boss_hurt')) {
      this.anims.create({
        key: 'boss_hurt',
        frames: this.anims.generateFrameNumbers('boss', { start: 12, end: 13 }),
        frameRate: 10,
        repeat: 0
      });
    }
    if (!this.anims.exists('boss_dead')) {
      this.anims.create({
        key: 'boss_dead',
        frames: this.anims.generateFrameNumbers('boss', { start: 14, end: 15 }),
        frameRate: 5,
        repeat: 0
      });
    }

    // =====================
    //  ENEMY ANIMATIONS
    //  Row 0: Infantry (frames 0-3)
    //  Row 1: Spearman (frames 4-7)
    //  Row 2: Archer   (frames 8-11)
    // =====================
    const enemyTypes = [
      { prefix: 'infantry', startFrame: 0 },
      { prefix: 'spearman', startFrame: 4 },
      { prefix: 'archer',   startFrame: 8 }
    ];

    enemyTypes.forEach(({ prefix, startFrame }) => {
      if (!this.anims.exists(`${prefix}_idle`)) {
        this.anims.create({
          key: `${prefix}_idle`,
          frames: this.anims.generateFrameNumbers('enemies', { start: startFrame, end: startFrame }),
          frameRate: 1,
          repeat: -1
        });
      }
      if (!this.anims.exists(`${prefix}_walk`)) {
        this.anims.create({
          key: `${prefix}_walk`,
          frames: this.anims.generateFrameNumbers('enemies', { start: startFrame + 1, end: startFrame + 1 }),
          frameRate: 8,
          repeat: -1
        });
      }
      if (!this.anims.exists(`${prefix}_attack`)) {
        this.anims.create({
          key: `${prefix}_attack`,
          frames: this.anims.generateFrameNumbers('enemies', { start: startFrame + 2, end: startFrame + 2 }),
          frameRate: 8,
          repeat: 0
        });
      }
      if (!this.anims.exists(`${prefix}_hurt`)) {
        this.anims.create({
          key: `${prefix}_hurt`,
          frames: this.anims.generateFrameNumbers('enemies', { start: startFrame + 3, end: startFrame + 3 }),
          frameRate: 8,
          repeat: 0
        });
      }
    });
  }

  // ─── Remove background from AI-generated spritesheets ───────────────────────
  // Uses a flood-fill (paint-bucket) algorithm starting from every frame edge.
  // This is much more accurate than global color matching:
  //   - Only removes pixels that are CONNECTED to the frame border
  //   - Never removes interior character pixels even if they match the bg color
  //   - Handles solid, gradient, and checkerboard AI backgrounds
  removeBackground(key, frameWidth, frameHeight) {
    try {
      const texture = this.textures.get(key);
      if (!texture || !texture.source[0]) return;

      const src   = texture.source[0];
      const origW = src.width;
      const origH = src.height;

      const canvas = document.createElement('canvas');
      canvas.width  = origW;
      canvas.height = origH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(src.image, 0, 0);

      const imgData = ctx.getImageData(0, 0, origW, origH);
      const d = imgData.data;

      // Helper to check if pixel index is a halo/grid pixel
      const isHaloColor = (idx) => {
        const r = d[idx];
        const g = d[idx + 1];
        const b = d[idx + 2];
        const a = d[idx + 3];

        if (a === 0) return true; // already transparent
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        const luma = r * 0.2126 + g * 0.7152 + b * 0.0722;

        // Faint border edge pixels
        if (a < 140) return true;
        // White/light-gray grid lines and ticks (often solid or semi-solid)
        if (max >= 180 && diff <= 35) return true;
        // Semi-transparent light halo pixels
        if (a < 254 && max >= 140 && diff <= 45) return true;
        // Match white/grey halo pixels (from test_bg_removal.js)
        if (diff <= 45 && luma >= 125) return true;
        if (luma >= 200) return true;
        
        return false;
      };


      const cols = Math.floor(origW / frameWidth);
      const rows = Math.floor(origH / frameHeight);

      // We process frame by frame to keep flood fill bound to each frame
      const visited = new Uint8Array(origW * origH);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const fx = col * frameWidth;
          const fy = row * frameHeight;

          const queue = [];
          
          // Seed the queue with:
          // 1. Any pixel on the frame boundary
          // 2. Any already-transparent pixel in this frame
          const enqueue = (px, py) => {
            if (px < fx || px >= fx + frameWidth) return;
            if (py < fy || py >= fy + frameHeight) return;
            const vi = py * origW + px;
            if (visited[vi]) return;

            const idx = vi * 4;
            const isSeed = d[idx + 3] === 0 || isHaloColor(idx);
            
            if (isSeed) {
              visited[vi] = 1;
              queue.push(px, py);
            }
          };

          // Seed all pixels in this frame that are already transparent or match halo profile
          for (let y = fy; y < fy + frameHeight; y++) {
            for (let x = fx; x < fx + frameWidth; x++) {
              const isBorder = (x === fx || x === fx + frameWidth - 1 || y === fy || y === fy + frameHeight - 1);
              const idx = (y * origW + x) * 4;
              if (isBorder || d[idx + 3] === 0) {
                enqueue(x, y);
              }
            }
          }

          // BFS flood-fill
          let qi = 0;
          while (qi < queue.length) {
            const px = queue[qi++];
            const py = queue[qi++];

            const idx = (py * origW + px) * 4;
            // Clear pixel (make fully transparent) if it matches halo/bg
            if (isHaloColor(idx)) {
              d[idx + 3] = 0;
            }

            // Check 4-connected neighbors
            const neighbors = [
              [px + 1, py],
              [px - 1, py],
              [px, py + 1],
              [px, py - 1]
            ];

            for (const [nx, ny] of neighbors) {
              if (nx >= fx && nx < fx + frameWidth && ny >= fy && ny < fy + frameHeight) {
                const nvi = ny * origW + nx;
                if (!visited[nvi]) {
                  const nidx = nvi * 4;
                  // If the neighbor is a halo color or transparent, we can expand through it
                  if (d[nidx + 3] === 0 || isHaloColor(nidx)) {
                    visited[nvi] = 1;
                    queue.push(nx, ny);
                  }
                }
              }
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      this.textures.remove(key);
      this.textures.addSpriteSheet(key, canvas, { frameWidth, frameHeight });
      console.log(`[PreloadScene] Cleaned background and halos for: ${key}`);
    } catch (e) {
      console.warn('removeBackground failed for', key, e);
    }
  }


  generateProceduralAssets() {
    // 3. HEALTH POTION PICKUP
    if (!this.textures.exists('health_potion')) {
      const canvas = document.createElement('canvas');
      canvas.width = 40;
      canvas.height = 48;
      const ctx = canvas.getContext('2d');

      ctx.shadowColor = 'rgba(239, 68, 68, 0.7)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.roundRect(10, 15, 20, 26, 7);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(13, 18, 14, 20, 5);
      ctx.fill();

      ctx.fillStyle = '#fca5a5';
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.roundRect(15, 20, 4, 14, 3);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.fillStyle = '#451a03';
      ctx.fillRect(14, 9, 12, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(12, 7, 16, 5);

      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(20, 29, 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(20, 24);
      ctx.lineTo(20, 34);
      ctx.moveTo(15, 29);
      ctx.lineTo(25, 29);
      ctx.stroke();

      this.textures.addCanvas('health_potion', canvas);
    }

    // 4. PROJECTILE ARROW
    if (!this.textures.exists('projectile_arrow')) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 8;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, 4); ctx.lineTo(26, 4); ctx.stroke();

      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(0, 4); ctx.lineTo(6, 0); ctx.lineTo(8, 4);
      ctx.moveTo(0, 4); ctx.lineTo(6, 8); ctx.lineTo(8, 4);
      ctx.fill();

      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(26, 1); ctx.lineTo(32, 4); ctx.lineTo(26, 7);
      ctx.closePath(); ctx.fill();

      this.textures.addCanvas('projectile_arrow', canvas);
    }

    // 5. BOSS FIREWAVE SKILL
    if (!this.textures.exists('effect_firewave')) {
      const canvas = document.createElement('canvas');
      canvas.width = 80;
      canvas.height = 40;
      const ctx = canvas.getContext('2d');

      const grad = ctx.createRadialGradient(40, 20, 2, 40, 20, 40);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#f59e0b');
      grad.addColorStop(0.7, '#d97706');
      grad.addColorStop(1, '#dc2626');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(40, 20, 20, -Math.PI / 2, Math.PI / 2, false);
      ctx.lineTo(20, 20);
      ctx.closePath();
      ctx.fill();

      this.textures.addCanvas('effect_firewave', canvas);
    }
  }
}
