import Phaser from 'phaser';
import Player from '../objects/Player.js';
import Enemy from '../objects/Enemy.js';
import Boss from '../objects/Boss.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init() {
    this.mapWidth = 3400; // Large side-scrolling boundary
    this.mapHeight = 720;
    this.playerScore = 0;
    this.bossActive = false;
    this.isGameOver = false;
    this.groundY = 620;
    this.bossTriggerX = 2280;
    this.bossSpawnX = 2650;
    this.potionCount = 1;
    this.maxPotions = 5;
    this.potionHealAmount = 80;
    this.storyTriggered = { intro: false, sneak: false, gate: false };

    // Virtual keys to map touch controls to keyboard actions on mobile
    this.virtualKeys = {
      left: false,
      right: false,
      up: false,
      J: false,
      K: false,
      S: false,
      E: false,
      E_justDown: false,
      esc_justDown: false
    };
  }

  create() {
    this.isGameOver = false;

    // *** CRITICAL: Expand physics world to full map size ***
    // Without this, player is blocked at x=canvas_width (1280px)!
    this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

    // 1. Create Parallax atmospheric background layers
    this.createBackground();

    // 2. Create platforms and ground
    this.createWorldPlatforms();

    // 3. Create Player (Lê Lợi)
    this.player = new Player(this, 150, 500);

    // Dynamic Character Shadows Layer
    this.shadowsGraphics = this.add.graphics();
    this.shadowsGraphics.setDepth(15);

    // 4. Create Groups
    this.enemies = this.physics.add.group({ runChildUpdate: false });
    this.projectiles = this.physics.add.group({ runChildUpdate: true });
    this.healthPotions = this.physics.add.group({ runChildUpdate: false });

    // 5. Register Keyboard Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.keys = this.input.keyboard.addKeys({
      J: Phaser.Input.Keyboard.KeyCodes.J,
      K: Phaser.Input.Keyboard.KeyCodes.K,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      E: Phaser.Input.Keyboard.KeyCodes.E,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      esc: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    // 6. Create Physics Colliders & Overlaps
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.enemies); // Automatic separation forces to prevent stacking!
    this.physics.add.collider(this.healthPotions, this.platforms);
    
    // Projectiles self-destruct on platform hits
    this.physics.add.collider(this.projectiles, this.platforms, (proj) => {
      if (proj.active) proj.destroy();
    });

    // Melee Player Sweep vs Enemies
    this.physics.add.overlap(this.player.meleeHitbox, this.enemies, (hitbox, enemy) => {
      if (hitbox.active && enemy.active) {
        const isSkill = this.player.isDashing;
        let dmg = isSkill ? this.player.combatSystem.skillDamage : this.player.combatSystem.attackDamage;
        const kbDir = this.player.flipX ? -1 : 1;
        
        // Stealth sneak attack: if enemy is NOT alert (not aggroed)
        const isSneak = !enemy.isGameOver && enemy !== this.boss && (!enemy.aggroUntil || enemy.aggroUntil < this.time.now);
        if (isSneak) {
          dmg *= 3;
          this.events.emit('spawnText', {
            x: enemy.x,
            y: enemy.y - 100,
            text: '⚡ HÀNH THÍCH (3x SÁT THƯƠNG)!',
            color: '#fbbf24'
          });
        }
        
        enemy.healthSystem.takeDamage(dmg, kbDir * 120);
      }
    });

    // Player vs Enemy Projectile (Arrow/Firewave)
    this.physics.add.overlap(this.player, this.projectiles, (player, proj) => {
      if (proj.active && !player.healthSystem.isInvincible && player.healthSystem.health > 0) {
        const dmg = proj.type === 'firewave' ? 15 : 12;
        const kbDir = proj.body.velocity.x > 0 ? 1 : -1;
        proj.destroy();
        player.healthSystem.takeDamage(dmg, kbDir * 150);
      }
    }, (_player, proj) => proj.active === true);

    // Player direct contact vs Enemy
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (enemy.active && !player.healthSystem.isInvincible && player.healthSystem.health > 0) {
        // Contact damage is blocked normally via handleDamage
        if (player.isBlocking) return; // Block handles it, skip double damage
        const isBoss = enemy === this.boss;
        const dmg = isBoss ? 10 : 8;
        const kbDir = player.x > enemy.x ? 1 : -1;
        player.healthSystem.takeDamage(dmg, kbDir * 160);
      }
    }, (_player, enemy) => enemy.active === true);

    // Player collects dropped potions into an inventory, then uses them with E.
    this.physics.add.overlap(this.player, this.healthPotions, (_player, potion) => {
      this.collectHealthPotion(potion);
    }, (_player, potion) => potion.active === true);

    // 7. Setup Camera — equivalent to Unity CinemachineVirtualCamera
    this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
    // Lerp 0.12 horizontal, 0.10 vertical: smooth follow without rubber-band jitter
    this.cameras.main.startFollow(this.player, true, 0.12, 0.10);
    // Deadzone: camera only moves when player leaves a 60px center zone.
    // This is the Phaser equivalent of Unity Cinemachine Deadzone — eliminates
    // micro-jitter caused by 1-pixel physics corrections each frame.
    this.cameras.main.setDeadzone(120, 80);

    // 8. Launch UI scene overlay
    this.scene.launch('UIScene', { 
      playerMaxHP: this.player.healthSystem.maxHealth, 
      score: this.playerScore,
      potionCount: this.potionCount,
      maxPotions: this.maxPotions
    });

    // 9. Spawn initial levels soldiers
    this.spawnCheckpointEnemies();
    this.spawnHealthPotion(2070, this.groundY - 72, false);

    // Procedural Particle Engines
    window.spawnDamageParticles = (x, y, color, count = 8) => {
      if (!this.sys.isActive()) return;
      for (let i = 0; i < count; i++) {
        const p = this.add.graphics();
        p.fillStyle(color, 1);
        p.fillCircle(0, 0, 3 + Math.random() * 3);
        p.setPosition(x, y);
        p.setDepth(45);

        const angle = Math.random() * Math.PI * 2;
        const speed = 70 + Math.random() * 160;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed - 60;

        this.tweens.add({
          targets: p,
          x: x + vx * 0.4,
          y: y + vy * 0.4 + 90,
          alpha: 0,
          scaleX: 0.1,
          scaleY: 0.1,
          duration: 350 + Math.random() * 250,
          onComplete: () => p.destroy()
        });
      }
    };

    window.spawnJumpParticles = (x, y) => {
      if (!this.sys.isActive()) return;
      for (let i = 0; i < 6; i++) {
        const p = this.add.graphics();
        p.fillStyle(0xfde68a, 0.4); // Golden warm sand dust
        p.fillCircle(0, 0, 4 + Math.random() * 4);
        p.setPosition(x + (Math.random() - 0.5) * 24, y);
        p.setDepth(40);

        this.tweens.add({
          targets: p,
          y: y - 12 - Math.random() * 15,
          alpha: 0,
          scaleX: 1.5,
          scaleY: 1.5,
          duration: 400,
          onComplete: () => p.destroy()
        });
      }
    };

    // 10. Listen to events from game objects
    this.registerGameEvents();
  }

  createBackground() {
    const W = this.mapWidth;
    const H = 720;

    if (this.textures.exists('map_bg')) {
      const viewW = this.cameras.main.width || 1280;
      this.add.image(viewW / 2, H / 2, 'map_bg')
        .setDisplaySize(viewW, H)
        .setScrollFactor(0)
        .setDepth(-25);

      const shade = this.add.graphics().setScrollFactor(0).setDepth(-24);
      shade.fillStyle(0x120806, 0.16);
      shade.fillRect(0, 0, viewW, H);
      shade.fillStyle(0x000000, 0.22);
      shade.fillRect(0, H - 110, viewW, 110);

      const glowG = this.add.graphics().setDepth(-5).setScrollFactor(1);
      glowG.fillStyle(0xd97706, 0.06);
      glowG.fillRect(0, 440, W, 180);

      this.mistGroup = [];
      for (let i = 0; i < 10; i++) {
        const mist = this.add.graphics().setDepth(-4);
        const mw = 360 + Math.random() * 260;
        const mh = 55 + Math.random() * 45;
        mist.fillStyle(0xd4a574, 0.035 + Math.random() * 0.03);
        mist.fillEllipse(mw / 2, mh / 2, mw, mh);
        mist.setScrollFactor(0.4);
        mist.setPosition(Math.random() * W, 380 + Math.random() * 170);
        this.mistGroup.push({ obj: mist, speed: 0.10 + Math.random() * 0.22 });
      }
      return;
    }

    // ── LAYER 1: Sky gradient (fixed, depth -20) ──────────────────────────────
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 1280; skyCanvas.height = H;
    const skyCtx = skyCanvas.getContext('2d');
    const skyGrad = skyCtx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0,   '#1a0a06');
    skyGrad.addColorStop(0.22,'#3d1108');
    skyGrad.addColorStop(0.48,'#7c2a0e');
    skyGrad.addColorStop(0.70,'#b45309');
    skyGrad.addColorStop(0.88,'#78350f');
    skyGrad.addColorStop(1,   '#1c0a05');
    skyCtx.fillStyle = skyGrad;
    skyCtx.fillRect(0, 0, 1280, H);

    // Scattered faint embers/sparks
    skyCtx.fillStyle = 'rgba(255,210,140,0.55)';
    [[120,45],[340,28],[580,18],[820,52],[1060,34],[210,72],[640,60],[950,22]]
      .forEach(([sx,sy]) => {
        skyCtx.beginPath();
        skyCtx.arc(sx, sy, 1.5, 0, Math.PI*2);
        skyCtx.fill();
      });

    const skyKey = 'bg_sky_proc';
    if (!this.textures.exists(skyKey)) this.textures.addCanvas(skyKey, skyCanvas);
    this.add.image(0, 0, skyKey)
      .setOrigin(0, 0).setDisplaySize(1280, H).setScrollFactor(0).setDepth(-20);

    // ── LAYER 2: Distant mountains (scroll 0.15) ───────────────────────────────
    const mtCanvas = document.createElement('canvas');
    mtCanvas.width = W; mtCanvas.height = H;
    const mtCtx = mtCanvas.getContext('2d');

    const drawMountainRange = (peaks, color, alpha) => {
      mtCtx.fillStyle = color;
      mtCtx.globalAlpha = alpha;
      mtCtx.beginPath();
      mtCtx.moveTo(peaks[0][0], H);
      peaks.forEach(([px, py]) => mtCtx.lineTo(px, py));
      mtCtx.lineTo(peaks[peaks.length-1][0], H);
      mtCtx.closePath();
      mtCtx.fill();
      mtCtx.globalAlpha = 1;
    };

    drawMountainRange([
      [0,430],[300,310],[620,355],[980,275],[1350,325],[1750,265],[2150,300],
      [2550,255],[2980,315],[3400,340]
    ], '#2d1409', 0.88);

    drawMountainRange([
      [0,490],[220,395],[480,362],[740,415],[1000,358],[1260,382],[1560,342],
      [1860,375],[2160,348],[2460,378],[2760,352],[3060,382],[3400,435]
    ], '#1e0c06', 0.92);

    const mtKey = 'bg_mountains_proc';
    if (!this.textures.exists(mtKey)) this.textures.addCanvas(mtKey, mtCanvas);
    this.add.image(0, 0, mtKey)
      .setOrigin(0, 0).setDisplaySize(W, H).setScrollFactor(0.15, 0).setDepth(-18);

    // ── LAYER 3: Forest tree silhouettes (scroll 0.35) ────────────────────────
    const fCanvas = document.createElement('canvas');
    fCanvas.width = W; fCanvas.height = H;
    const fCtx = fCanvas.getContext('2d');

    const treeGroups = [
      [0, 9, 120, 145, 205],
      [650, 11, 170, 165, 250],
      [1300, 10, 150, 155, 230],
      [2000, 13, 190, 175, 268],
      [2700, 11, 160, 160, 235],
      [3150, 9, 140, 148, 218],
    ];

    treeGroups.forEach(([bx, count, spread, minH, maxH]) => {
      for (let t = 0; t < count; t++) {
        const tx = bx + (t / count) * spread * 2 - spread;
        const th = minH + Math.abs(Math.sin(t * 1.7 + bx * 0.01)) * (maxH - minH);
        const tw = 30 + Math.abs(Math.sin(t * 2.3)) * 20;

        fCtx.globalAlpha = 0.90;
        fCtx.fillStyle = '#150d06';
        // Trunk
        fCtx.fillRect(tx - tw * 0.09, H - th * 0.32, tw * 0.18, th * 0.32);
        // Lower canopy
        fCtx.beginPath();
        fCtx.moveTo(tx - tw * 0.75, H - th * 0.30);
        fCtx.lineTo(tx, H - th);
        fCtx.lineTo(tx + tw * 0.75, H - th * 0.30);
        fCtx.closePath();
        fCtx.fill();
        // Upper canopy highlight
        fCtx.fillStyle = '#1f1009';
        fCtx.beginPath();
        fCtx.moveTo(tx - tw * 0.50, H - th * 0.60);
        fCtx.lineTo(tx, H - th * 1.04);
        fCtx.lineTo(tx + tw * 0.50, H - th * 0.60);
        fCtx.closePath();
        fCtx.fill();
        fCtx.globalAlpha = 1;
      }
    });

    const fKey = 'bg_forest_proc';
    if (!this.textures.exists(fKey)) this.textures.addCanvas(fKey, fCanvas);
    this.add.image(0, 0, fKey)
      .setOrigin(0, 0).setDisplaySize(W, H).setScrollFactor(0.35, 0).setDepth(-15);

    // ── LAYER 4: Ground warm ambient glow ────────────────────────────────────
    const glowG = this.add.graphics().setDepth(-5).setScrollFactor(1);
    glowG.fillStyle(0xd97706, 0.08);
    glowG.fillRect(0, 440, W, 180);

    // ── LAYER 5: Drifting mist plumes ────────────────────────────────────────
    this.mistGroup = [];
    for (let i = 0; i < 10; i++) {
      const mist = this.add.graphics().setDepth(-4);
      const mw = 360 + Math.random() * 260;
      const mh = 55 + Math.random() * 45;
      mist.fillStyle(0xd4a574, 0.045 + Math.random() * 0.04);
      mist.fillEllipse(mw / 2, mh / 2, mw, mh);
      mist.setScrollFactor(0.4);
      mist.setPosition(Math.random() * W, 380 + Math.random() * 170);
      this.mistGroup.push({ obj: mist, speed: 0.10 + Math.random() * 0.22 });
    }
  }


  createWorldPlatforms() {
    this.platforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    const addStaticPlatform = (x, y, w, h) => {
      const zone = this.add.zone(x, y, w, h);
      this.physics.add.existing(zone);
      zone.body.setAllowGravity(false);
      zone.body.setImmovable(true);
      zone.body.moves = false;
      zone.body.setSize(w, h);
      zone.body.updateFromGameObject();
      this.platforms.add(zone);
      return zone;
    };

    // ─── Main Ground ─────────────────────────────────────────────────────────
    const ground = this.add.graphics();
    
    // Draw soil base (dark dirt/earth colors)
    ground.fillStyle(0x271914, 1);
    ground.fillRect(0, 620, this.mapWidth, 100);
    
    // Draw soil texture details (horizontal lines, gravels)
    ground.fillStyle(0x3e2920, 1);
    for (let i = 0; i < 280; i++) {
      const rx = (i * 12.13) % this.mapWidth;
      const ry = 632 + ((i * 7.51) % 80);
      const rw = 2 + ((i * 3) % 6);
      const rh = 2 + ((i * 2) % 4);
      ground.fillRect(rx, ry, rw, rh);
    }
    
    // Draw grass layer base (dark forest green)
    ground.fillStyle(0x1e3a1e, 1);
    ground.fillRect(0, 620, this.mapWidth, 12);
    
    // Draw grass highlights (lighter green)
    ground.fillStyle(0x2d5a27, 1);
    ground.fillRect(0, 620, this.mapWidth, 4);

    // Procedural grass blades/tufts along the map ground
    ground.fillStyle(0x386b32, 1);
    for (let x = 0; x < this.mapWidth; x += 10) {
      const h = 5 + (Math.sin(x * 0.05) * 2) + ((x % 3) * 2); // blade height
      const skew = Math.sin(x * 0.1) * 3; // wind slant skew
      ground.beginPath();
      ground.moveTo(x - 2, 620);
      ground.lineTo(x + skew, 620 - h);
      ground.lineTo(x + 2, 620);
      ground.closePath();
      ground.fill();
    }
    
    // Draw additional light green grass tufts for depth
    ground.fillStyle(0x4c8a3e, 0.95);
    for (let x = 15; x < this.mapWidth; x += 28) {
      const h = 7 + ((x % 4) * 2);
      ground.beginPath();
      ground.moveTo(x - 1, 620);
      ground.lineTo(x - 3, 620 - h);
      ground.lineTo(x, 620);
      ground.lineTo(x + 3, 620 - h - 1);
      ground.lineTo(x + 1, 620);
      ground.closePath();
      ground.fill();
    }
    addStaticPlatform(this.mapWidth / 2, 670, this.mapWidth, 100);

    // ─── Platforms: Designed as a logical battlefield ─────────────────────────
    // The path rises in gentle steps from spawn (x=150) toward Chi Lang (x=2400+)
    // Each platform provides cover and a vantage point for archers/spearmen.
    // Gaps between platforms are jumpable (~2.5 sec at 260px/s run speed).
    const platforms = [
      // Parkour Zone 1
      { x: 580, y: 490, w: 180, h: 25 },
      // Parkour Zone 2
      { x: 1050, y: 460, w: 200, h: 25 },
      // Parkour Zone 3 (high platforms)
      { x: 1480, y: 490, w: 160, h: 25 },
      { x: 1680, y: 380, w: 160, h: 25 },
      { x: 1880, y: 490, w: 160, h: 25 }
    ];

    const drawPlatform = (lc) => {
      const g = this.add.graphics();
      // Drop shadow
      g.fillStyle(0x0c0606, 0.4);
      g.fillRect(lc.x - lc.w/2 - 3, lc.y + 5, lc.w + 6, lc.h);
      // Core stone block
      g.fillStyle(0x3d1f0e, 1);
      g.fillRoundedRect(lc.x - lc.w/2, lc.y, lc.w, lc.h, 5);
      // Stone texture lines
      g.fillStyle(0x2a1408, 0.6);
      for (let bx = lc.x - lc.w/2 + 30; bx < lc.x + lc.w/2 - 10; bx += 40) {
        g.fillRect(bx, lc.y + 2, 2, lc.h - 4);
      }
      // Golden top trim
      g.fillStyle(0xd97706, 0.9);
      g.fillRoundedRect(lc.x - lc.w/2, lc.y, lc.w, 5, 2);
      // Bright edge highlight
      g.fillStyle(0xfde68a, 0.55);
      g.fillRoundedRect(lc.x - lc.w/2 + 4, lc.y + 1, lc.w - 8, 2, 1);
      // Outline
      g.lineStyle(1.5, 0x92400e, 0.8);
      g.strokeRoundedRect(lc.x - lc.w/2, lc.y, lc.w, lc.h, 5);
      addStaticPlatform(lc.x, lc.y + lc.h / 2, lc.w, lc.h);
    };

    platforms.forEach(drawPlatform);

    // ─── Chi Lang Gate Marker ──────────────────────────────────────────────────
    const gate = this.add.graphics();
    gate.fillStyle(0x1c1917, 0.88);
    gate.fillRoundedRect(2180, 548, 180, 58, 8);
    gate.lineStyle(2.5, 0xd97706, 0.9);
    gate.strokeRoundedRect(2180, 548, 180, 58, 8);
    gate.fillStyle(0xd97706, 1);
    gate.fillRect(2194, 560, 152, 5);
    this.add.text(2270, 585, 'ẢI CHI LĂNG', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#fde68a',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(3);
  }

  spawnCheckpointEnemies() {
    // Spread enemies across 3 zones. 2 enemies guard each zone.
    // Infantry/Spearman on ground; archer on nearby platform to shoot downward.
    const spawns = [
      // Zone 1 – Lam Son outpost
      { x: 500,  y: this.groundY, type: 'enemy_infantry' },
      { x: 580,  y: 450, type: 'enemy_archer' },

      // Zone 2 – River crossing
      { x: 950,  y: this.groundY, type: 'enemy_spearman' },
      { x: 1150, y: this.groundY, type: 'enemy_infantry' },

      // Zone 3 – Mountain fort (before Chi Lang gate)
      { x: 1480, y: 450, type: 'enemy_archer' },
      { x: 1750, y: this.groundY, type: 'enemy_spearman' },
      { x: 1950, y: this.groundY, type: 'enemy_infantry' },
    ];

    spawns.forEach((s) => {
      const enemy = new Enemy(this, s.x, s.y, s.type);
      this.enemies.add(enemy);
      enemy.body.setAllowGravity(true);
      this.physics.add.collider(enemy, this.platforms);
    });
  }

  spawnHealthPotion(x, y, toss = true) {
    if (!this.healthPotions || !this.textures.exists('health_potion')) return null;

    const potion = this.healthPotions.create(x, y, 'health_potion');
    potion.setScale(0.92);
    potion.setDepth(27);
    potion.setData('collected', false);
    potion.body.setAllowGravity(true);
    potion.body.setSize(24, 28);
    potion.body.setOffset(8, 16);
    potion.body.setBounce(0.25);
    potion.body.setDragX(70);

    if (toss) {
      potion.setVelocity(Phaser.Math.Between(-70, 70), -260);
    }

    potion.once('destroy', () => this.tweens.killTweensOf(potion));
    this.tweens.add({
      targets: potion,
      scaleX: 1.05,
      scaleY: 1.05,
      yoyo: true,
      repeat: -1,
      duration: 620,
      ease: 'Sine.easeInOut'
    });

    return potion;
  }

  tryDropHealthPotion(x, y, chance = 0.42) {
    if (this.isGameOver || Math.random() > chance) return;
    this.spawnHealthPotion(x, y, true);
  }

  collectHealthPotion(potion) {
    if (!potion?.active || potion.getData('collected')) return;

    if (this.potionCount >= this.maxPotions) {
      const healed = this.player.healthSystem.heal(Math.floor(this.potionHealAmount * 0.6));
      if (healed > 0) {
        potion.setData('collected', true);
        potion.destroy();
        this.events.emit('healthChanged', this.player.healthSystem.health);
        this.events.emit('spawnText', {
          x: this.player.x,
          y: this.player.y - 72,
          text: `+${healed} MÁU`,
          color: '#22c55e'
        });
      } else {
        this.events.emit('spawnText', {
          x: this.player.x,
          y: this.player.y - 72,
          text: 'TÚI BÌNH ĐÃ ĐẦY',
          color: '#fbbf24'
        });
      }
      return;
    }

    potion.setData('collected', true);
    potion.destroy();
    this.potionCount += 1;
    this.events.emit('potionChanged', this.potionCount);
    this.events.emit('spawnText', {
      x: this.player.x,
      y: this.player.y - 72,
      text: '+1 BÌNH MÁU',
      color: '#22c55e'
    });
  }

  useHealthPotion() {
    if (!this.player?.active || this.player.healthSystem.health <= 0) return;

    if (this.potionCount <= 0) {
      this.events.emit('spawnText', {
        x: this.player.x,
        y: this.player.y - 72,
        text: 'HẾT BÌNH MÁU',
        color: '#f59e0b'
      });
      return;
    }

    const healed = this.player.healthSystem.heal(this.potionHealAmount);
    if (healed <= 0) {
      this.events.emit('spawnText', {
        x: this.player.x,
        y: this.player.y - 72,
        text: 'MÁU ĐÃ ĐẦY',
        color: '#fbbf24'
      });
      return;
    }

    this.potionCount -= 1;
    this.events.emit('healthChanged', this.player.healthSystem.health);
    this.events.emit('potionChanged', this.potionCount);
    this.events.emit('spawnText', {
      x: this.player.x,
      y: this.player.y - 72,
      text: `+${healed} MÁU`,
      color: '#22c55e'
    });

    if (typeof window.spawnDamageParticles === 'function') {
      window.spawnDamageParticles(this.player.x, this.player.y - 45, 0x22c55e, 12);
    }
  }

  registerGameEvents() {
    // Score additions
    this.events.on('scoreAdded', (amt) => {
      this.playerScore += amt;
      this.events.emit('scoreChanged', this.playerScore);
    });

    // Floating text feedback bridge
    this.events.on('spawnText', (data) => {
      this.scene.get('UIScene').showFloatingCombatText(data.x, data.y, data.text, data.color);
    });

    // Player Death transition
    this.events.on('playerKilled', () => {
      this.triggerGameOver();
    });

    // Boss Death transition
    this.events.on('bossKilled', () => {
      this.time.delayedCall(1500, () => {
        this.triggerVictory();
      });
    });
  }

  summonReinforcements() {
    // Summon helper guards on boss territory
    if (!this.bossActive) return;
    const soldiers = ['enemy_infantry'];
    
    soldiers.forEach((type, idx) => {
      const rx = this.player.x + (idx === 0 ? -120 : 120);
      if (rx > 2200 && rx < 3100) {
        const guard = new Enemy(this, rx, this.groundY - 10, type); // Spawn slightly above ground to let gravity land them
        this.enemies.add(guard);
        guard.body.setAllowGravity(true);
        this.physics.add.collider(guard, this.platforms);
      }
    });
  }

  triggerBossFight() {
    this.bossActive = true;
    this.boss = new Boss(this, this.bossSpawnX, this.groundY - 10); // Spawn slightly above ground
    this.enemies.add(this.boss);
    this.boss.body.setAllowGravity(true);
    this.physics.add.collider(this.boss, this.platforms);

    // Create a boss arena physical wall at x = 2240 to block the player from escaping back to the left!
    const wall = this.physics.add.staticSprite(2240, 310, null);
    wall.setSize(20, 620); // Height of wall 620, blocking the entire screen vertically
    wall.setVisible(false); // Invisible wall body
    this.physics.add.collider(this.player, wall);
    this.physics.add.collider(this.enemies, wall);

    // Draw a visual gate closing effect!
    const gateVisual = this.add.graphics();
    gateVisual.setDepth(18);
    gateVisual.fillStyle(0x3e1d11, 1); // Dark brown timber
    gateVisual.fillRect(2236, 120, 8, 500); // Draw vertical timber beam gate
    gateVisual.lineStyle(2, 0xd97706, 0.85);
    gateVisual.strokeRect(2236, 120, 8, 500);
    // Draw gate spikes/accents
    gateVisual.fillStyle(0x78350f, 1);
    for (let gy = 150; gy < 620; gy += 60) {
      gateVisual.fillRect(2232, gy, 16, 8);
    }
    
    // Slam shake & message
    this.cameras.main.shake(200, 0.005);
    this.events.emit('spawnText', {
      x: 2240, y: 500, text: 'ẢI CHI LĂNG ĐÃ ĐÓNG!', color: '#ef4444'
    });

    // Signal UI scene to show boss health bar
    this.events.emit('bossSpawned', { 
      maxHP: this.boss.healthSystem.maxHealth,
      currentHP: this.boss.healthSystem.health
    });
  }

  update(time, delta) {
    if (this.isGameOver) return;

    // Check Pause
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc) || (this.virtualKeys && this.virtualKeys.esc_justDown)) {
      if (this.virtualKeys) this.virtualKeys.esc_justDown = false;
      this.scene.pause();
      this.scene.launch('UIScene_Pause'); // Launch pause pop
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.E) || (this.virtualKeys && this.virtualKeys.E_justDown)) {
      if (this.virtualKeys) this.virtualKeys.E_justDown = false;
      this.useHealthPotion();
    }

    // Float mist — MUST use delta to prevent speed varying with frame rate
    // Unity equivalent: transform.Translate(direction * speed * Time.deltaTime)
    if (this.mistGroup) {
      const dt = delta / 1000; // Convert ms to seconds
      this.mistGroup.forEach((m) => {
        m.obj.x -= m.speed * dt * 60; // Normalize to 60fps equivalent
        if (m.obj.x < this.cameras.main.scrollX - 500) {
          m.obj.x = this.cameras.main.scrollX + 1300 + Math.random() * 200;
        }
      });
    }

    // Update Player controls
    if (this.player.active) {
      this.player.update(time, this.cursors, this.wasd, this.keys);
    }

    // Sync block shield to player position every frame
    if (this.player._blockShield) {
      const shield = this.player._blockShield;
      const dir = this.player.flipX ? -1 : 1;
      shield.setPosition(this.player.x + 36 * dir, this.player.y - 55);
    }

    // Update active enemies AI
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active && typeof enemy.update === 'function') {
        enemy.update(time, this.player);
      }
    });

    // Trigger boss battle when player crosses threshold boundary
    // Boss spawns at x=2200, player triggers at x=1980 (clear of last enemy)
    if (!this.bossActive && this.player.x > this.bossTriggerX) {
      this.triggerBossFight();
    }

    // Story progress checks
    if (this.player.active && this.storyTriggered) {
      if (!this.storyTriggered.intro && this.player.x > 220) {
        this.storyTriggered.intro = true;
        this.events.emit('storyTriggered', 'intro');
      }
      if (!this.storyTriggered.sneak && this.player.x > 880) {
        this.storyTriggered.sneak = true;
        this.events.emit('storyTriggered', 'sneak');
      }
      if (!this.storyTriggered.gate && this.player.x > 2180) {
        this.storyTriggered.gate = true;
        this.events.emit('storyTriggered', 'gate');
      }
    }

    // Dynamic ground shadows render
    this.drawCharacterShadows();
  }

  drawCharacterShadows() {
    if (!this.shadowsGraphics) return;
    this.shadowsGraphics.clear();

    // 1. Player dynamic height shadow
    if (this.player && this.player.active) {
      const dist = Math.max(0, this.groundY - this.player.y);
      const scale = Math.max(0.1, 1 - dist / 300);
      this.shadowsGraphics.fillStyle(0x000000, 0.35 * scale);
      this.shadowsGraphics.fillEllipse(this.player.x, this.groundY, 62 * scale, 13 * scale);
    }

    // 2. Enemies and Boss ground shadows
    this.enemies.getChildren().forEach((enemy) => {
      if (enemy.active) {
        const isBoss = enemy === this.boss;
        const sw = isBoss ? 110 : 48;
        const sh = isBoss ? 18 : 10;
        
        // Dynamic scaling if enemy rises or falls
        const dist = Math.max(0, this.groundY - enemy.y);
        const scale = Math.max(0.1, 1 - dist / 250);
        
        this.shadowsGraphics.fillStyle(0x000000, 0.35 * scale);
        this.shadowsGraphics.fillEllipse(enemy.x, this.groundY, sw * scale, sh * scale);
      }
    });
  }

  triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(520, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene', { score: this.playerScore });
    });
  }

  triggerVictory() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(520, () => {
      this.scene.stop('UIScene');
      this.scene.start('VictoryScene', { score: this.playerScore });
    });
  }

  // Proper cleanup to prevent lag and memory leaks on restart
  shutdown() {
    // Remove global particle function references
    window.spawnDamageParticles = null;
    window.spawnJumpParticles = null;
    // Cleanup event listeners to prevent duplicate subscriptions
    this.events.off('scoreAdded');
    this.events.off('spawnText');
    this.events.off('playerKilled');
    this.events.off('bossKilled');
    // Remove procedural background textures so they are rebuilt fresh on restart
    // (avoids "texture already exists" warnings and stale canvas refs)
    ['bg_sky_proc', 'bg_mountains_proc', 'bg_forest_proc'].forEach((key) => {
      if (this.textures.exists(key)) this.textures.remove(key);
    });
    // Stop all tweens and timers
    this.tweens.killAll();
    this.time.removeAllEvents();
  }
}
