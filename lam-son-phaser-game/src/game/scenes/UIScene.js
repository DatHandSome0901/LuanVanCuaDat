import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
    this.textPool = [];
  }

  create(data) {
    this.textPool = [];

    // Register clean up of GameScene event listeners on shutdown
    this.events.once('shutdown', () => {
      const gameScene = this.scene.get('GameScene');
      if (gameScene) {
        gameScene.events.off('healthChanged');
        gameScene.events.off('scoreChanged');
        gameScene.events.off('potionChanged');
        gameScene.events.off('blockChanged');
        gameScene.events.off('bossSpawned');
        gameScene.events.off('bossHealthChanged');
      }
    });

    this.playerMaxHP = data.playerMaxHP;
    this.playerHP = data.playerMaxHP;
    this.scoreVal = data.score;
    this.bossMaxHP = 500;
    this.bossHP = 500;
    this.potionCount = data.potionCount || 0;
    this.maxPotions = data.maxPotions || 5;

    const width = this.cameras.main.width;

    // ── ROYAL VIETNAMESE GOLD-BRONZE & DARK CRIMSON HUD PANEL ──
    this.hudFrame = this.add.graphics();
    
    // Shadow layer
    this.hudFrame.fillStyle(0x0c0606, 0.45);
    this.hudFrame.fillRoundedRect(22, 22, 290, 52, 10);
    
    // Core Crimson panel
    this.hudFrame.fillStyle(0x450a0a, 0.88); // Royal dark red
    this.hudFrame.fillRoundedRect(20, 20, 286, 48, 8);
    
    // Gold frame border
    this.hudFrame.lineStyle(2.5, 0xd97706, 1);
    this.hudFrame.strokeRoundedRect(20, 20, 286, 48, 8);
    
    // Gold inner detail lines
    this.hudFrame.lineStyle(1, 0xfcd34d, 0.45);
    this.hudFrame.strokeRoundedRect(23, 23, 280, 42, 6);

    // HP Symbol (Gilded Heart)
    this.add.text(36, 32, '⚔️', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '20px',
      color: '#fcd34d'
    });

    // Draw Lê Lợi Health Tube Bar
    this.hpGraphics = this.add.graphics();
    this.drawPlayerHP();

    // Potion inventory panel
    this.potionGraphics = this.add.graphics();
    this.potionIcon = this.textures.exists('health_potion')
      ? this.add.image(43, 98, 'health_potion').setDisplaySize(20, 24)
      : this.add.text(34, 88, '+', { fontFamily: 'Outfit, sans-serif', fontSize: '18px', color: '#22c55e' });
    this.potionText = this.add.text(70, 91, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#e7e5e4',
      fontStyle: 'bold'
    });
    this.potionHint = this.add.text(205, 91, 'E', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#111827',
      fontStyle: 'bold',
      backgroundColor: '#fbbf24',
      padding: { x: 7, y: 3 }
    });
    this.drawPotionHUD();

    // Block indicator panel
    this._blockPanel = this.add.graphics();
    this._blockText = this.add.text(0, 0, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#e7e5e4',
      fontStyle: 'bold'
    });
    this._blockHint = this.add.text(0, 0, 'S', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#111827',
      fontStyle: 'bold',
      backgroundColor: '#38bdf8',
      padding: { x: 7, y: 3 }
    });
    this._isBlocking = false;
    this._drawBlockHUD(false);

    // Skill K indicator panel
    this._skillPanel = this.add.graphics();
    this._skillText = this.add.text(70, 175, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#e7e5e4',
      fontStyle: 'bold'
    });
    this._skillHint = this.add.text(205, 173, 'K', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '12px',
      color: '#111827',
      fontStyle: 'bold',
      backgroundColor: '#10b981',
      padding: { x: 7, y: 3 }
    });
    this.drawSkillHUD(1); // default to ready

    // ── ELEGANT ROYAL SCORE BOX (Top Right) ──
    this.scorePanel = this.add.graphics();
    this.scorePanel.fillStyle(0x450a0a, 0.88);
    this.scorePanel.fillRoundedRect(width - 230, 20, 210, 48, 8);
    
    this.scorePanel.lineStyle(2, 0xd97706, 1);
    this.scorePanel.strokeRoundedRect(width - 230, 20, 210, 48, 8);
    
    this.scorePanel.lineStyle(1, 0xfcd34d, 0.4);
    this.scorePanel.strokeRoundedRect(width - 227, 23, 204, 42, 6);

    this.scoreText = this.add.text(width - 125, 43, `CHIẾN TÍCH: ${this.scoreVal}`, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#fcd34d',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5);

    // ── BOSS HUD BAR (Hidden initially, Gold/Crimson themed) ──
    this.bossHUDContainer = this.add.container(0, 0).setVisible(false);
    this.bossHPBar = this.add.graphics();
    this.bossHUDContainer.add(this.bossHPBar);

    const bossLabel = this.add.text(width / 2, 45, 'ẢI CHI LĂNG - TƯỚNG GIẶC LIỄU THĂNG', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#fcd34d',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);
    
    // Text drop shadow for boss
    bossLabel.setShadow(1.5, 1.5, '#000000', 3);
    this.bossHUDContainer.add(bossLabel);

    // Listen to GameScene bridges
    const gameScene = this.scene.get('GameScene');
    
    gameScene.events.on('healthChanged', (newHP) => {
      this.playerHP = newHP;
      this.drawPlayerHP();
    });

    gameScene.events.on('scoreChanged', (newScore) => {
      this.scoreVal = newScore;
      this.scoreText.setText(`CHIẾN TÍCH: ${newScore}`);
    });

    gameScene.events.on('potionChanged', (newPotionCount) => {
      this.potionCount = newPotionCount;
      this.drawPotionHUD();
    });

    // Listen for block state changes
    gameScene.events.on('blockChanged', (isBlocking) => {
      this._isBlocking = isBlocking;
      this._drawBlockHUD(isBlocking);
    });

    gameScene.events.on('bossSpawned', (bossData) => {
      this.bossMaxHP = bossData.maxHP;
      this.bossHP = bossData.currentHP;
      this.bossHUDContainer.setVisible(true);
      this.drawBossHP();
      this.showBossWarningBanner();
    });

    gameScene.events.on('bossHealthChanged', (newBossHP) => {
      this.bossHP = newBossHP;
      this.drawBossHP();
    });

    gameScene.events.on('storyTriggered', (storyKey) => {
      this.showStoryDialogue(storyKey);
    });

    // ── VIRTUAL TOUCH CONTROLS FOR MOBILE DEVICES ──
    const isMobile = !this.sys.game.device.os.desktop || this.sys.game.device.input.touch;
    if (isMobile) {
      this.virtualKeysContainer = this.add.container(0, 0);

      // Helper to create a touch button
      const createTouchButton = (x, y, radius, label, keyName) => {
        const container = this.add.container(x, y);
        
        const bg = this.add.graphics();
        // Crimson semi-transparent base
        bg.fillStyle(0x7f1d1d, 0.55);
        bg.fillCircle(0, 0, radius);
        // Gold border
        bg.lineStyle(2, 0xd97706, 0.8);
        bg.strokeCircle(0, 0, radius);
        container.add(bg);

        const text = this.add.text(0, 0, label, {
          fontFamily: 'Outfit, sans-serif',
          fontSize: `${radius * 0.65}px`,
          color: '#fcd34d',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(text);

        const zone = this.add.zone(0, 0, radius * 2.2, radius * 2.2);
        zone.setInteractive({ useHandCursor: true });
        container.add(zone);

        zone.on('pointerdown', () => {
          bg.clear();
          // Bright gold fill on press
          bg.fillStyle(0xd97706, 0.85);
          bg.fillCircle(0, 0, radius);
          bg.lineStyle(2.5, 0xffffff, 1);
          bg.strokeCircle(0, 0, radius);
          text.setColor('#ffffff');

          const gScene = this.scene.get('GameScene');
          if (gScene && gScene.virtualKeys) {
            gScene.virtualKeys[keyName] = true;
            if (keyName === 'E') gScene.virtualKeys.E_justDown = true;
            if (keyName === 'esc') gScene.virtualKeys.esc_justDown = true;
          }
        });

        const release = () => {
          bg.clear();
          bg.fillStyle(0x7f1d1d, 0.55);
          bg.fillCircle(0, 0, radius);
          bg.lineStyle(2, 0xd97706, 0.8);
          bg.strokeCircle(0, 0, radius);
          text.setColor('#fcd34d');

          const gScene = this.scene.get('GameScene');
          if (gScene && gScene.virtualKeys) {
            gScene.virtualKeys[keyName] = false;
          }
        };

        zone.on('pointerup', release);
        zone.on('pointerout', release);

        return container;
      };

      const height = this.cameras.main.height;
      const width = this.cameras.main.width;

      // Left controls: Movement
      const leftBtn = createTouchButton(80, height - 90, 36, '◀', 'left');
      const rightBtn = createTouchButton(180, height - 90, 36, '▶', 'right');
      const jumpBtn = createTouchButton(width - 240, height - 90, 36, '▲', 'up'); // Jump button

      // Right controls: Actions
      const attackBtn = createTouchButton(width - 80, height - 90, 44, '⚔️', 'J'); // Main Attack
      const skillBtn = createTouchButton(width - 160, height - 160, 32, '⚡', 'K'); // Skill
      const blockBtn = createTouchButton(width - 70, height - 200, 32, '🛡️', 'S'); // Block
      const potionBtn = createTouchButton(width - 150, height - 70, 30, '🍶', 'E'); // Heal Potion
      const pauseBtn = createTouchButton(width - 280, 44, 20, '⏸️', 'esc'); // Pause

      this.virtualKeysContainer.add([leftBtn, rightBtn, jumpBtn, attackBtn, skillBtn, blockBtn, potionBtn, pauseBtn]);
    }
  }

  drawPlayerHP() {
    this.hpGraphics.clear();
    const hpRatio = Math.max(0, this.playerHP / this.playerMaxHP);
    
    // Gold bar frame background
    this.hpGraphics.fillStyle(0x1a0f0d, 1);
    this.hpGraphics.fillRoundedRect(72, 34, 216, 20, 5);
    
    this.hpGraphics.lineStyle(1.5, 0xd97706, 0.85);
    this.hpGraphics.strokeRoundedRect(72, 34, 216, 20, 5);

    // Blazing crimson/red HP tube (Shining Royal color)
    const barColor = hpRatio > 0.35 ? 0xdc2626 : 0xef4444; // Royal rich red
    this.hpGraphics.fillStyle(barColor, 1);
    if (hpRatio > 0) {
      this.hpGraphics.fillRoundedRect(74, 36, 212 * hpRatio, 16, 4);
      
      // Glossy highlighting top line
      this.hpGraphics.fillStyle(0xffffff, 0.25);
      this.hpGraphics.fillRoundedRect(76, 37, 208 * hpRatio, 4, 1);
    }
  }

  drawPotionHUD() {
    if (!this.potionGraphics || !this.potionText) return;
    this.potionGraphics.clear();
    this.potionGraphics.fillStyle(0x0c0606, 0.35);
    this.potionGraphics.fillRoundedRect(22, 80, 252, 38, 9);
    this.potionGraphics.fillStyle(0x1c1917, 0.86);
    this.potionGraphics.fillRoundedRect(20, 78, 248, 36, 8);
    this.potionGraphics.lineStyle(1.5, 0xd97706, 0.65);
    this.potionGraphics.strokeRoundedRect(20, 78, 248, 36, 8);

    this.potionText.setText(`BÌNH MÁU: ${this.potionCount}/${this.maxPotions}`);
    this.potionText.setColor(this.potionCount > 0 ? '#e7e5e4' : '#a8a29e');
    this.potionHint.setAlpha(this.potionCount > 0 ? 1 : 0.45);
  }

  _drawBlockHUD(isBlocking) {
    if (!this._blockPanel) return;
    this._blockPanel.clear();
    this._blockPanel.fillStyle(0x0c0606, 0.35);
    this._blockPanel.fillRoundedRect(22, 122, 252, 38, 9);
    this._blockPanel.fillStyle(isBlocking ? 0x0c2e44 : 0x1c1917, 0.88);
    this._blockPanel.fillRoundedRect(20, 120, 248, 36, 8);
    this._blockPanel.lineStyle(1.5, isBlocking ? 0x38bdf8 : 0x44403c, 0.75);
    this._blockPanel.strokeRoundedRect(20, 120, 248, 36, 8);

    if (isBlocking) {
      // Active shield glow
      this._blockPanel.lineStyle(2, 0x38bdf8, 0.4);
      this._blockPanel.strokeRoundedRect(18, 118, 252, 40, 10);
    }

    this._blockText.setPosition(70, 133);
    this._blockText.setText(isBlocking ? 'ĐỠ ĐÒN (không mất máu)' : 'ĐỠ ĐÒN: SẴN SÀNG');
    this._blockText.setColor(isBlocking ? '#38bdf8' : '#e7e5e4');
    this._blockHint.setPosition(205, 131);
    this._blockHint.setAlpha(1);
  }

  drawBossHP() {
    this.bossHPBar.clear();
    const width = this.cameras.main.width;
    const hpRatio = Math.max(0, this.bossHP / this.bossMaxHP);

    // Royal Crimson container frame
    this.bossHPBar.fillStyle(0x450a0a, 0.9);
    this.bossHPBar.fillRoundedRect(width / 2 - 250, 60, 500, 22, 6);
    this.bossHPBar.lineStyle(2, 0xd97706, 1);
    this.bossHPBar.strokeRoundedRect(width / 2 - 250, 60, 500, 22, 6);

    // Dynamic Blazing gold-crimson fill
    this.bossHPBar.fillStyle(0xdc2626, 0.95);
    if (hpRatio > 0) {
      this.bossHPBar.fillRoundedRect(width / 2 - 247, 63, 494 * hpRatio, 16, 4);
      
      // Royal golden gloss strip
      this.bossHPBar.fillStyle(0xfde68a, 0.3);
      this.bossHPBar.fillRoundedRect(width / 2 - 245, 64, 490 * hpRatio, 4, 1);
    }
  }

  getPooledText() {
    const slot = this.textPool.find(t => t.free);
    if (slot) {
      slot.free = false;
      slot.obj.setVisible(true).setAlpha(1);
      return slot.obj;
    }
    const t = this.add.text(0, 0, '', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    t.setOrigin(0.5).setDepth(60);
    this.textPool.push({ obj: t, free: false });
    return t;
  }

  showFloatingCombatText(x, y, text, color) {
    const fText = this.getPooledText();
    fText.setPosition(x, y).setText(text).setColor(color).setAlpha(1).setVisible(true);
    fText.setShadow(2, 2, 'rgba(0,0,0,0.95)', 4);
    
    const slot = this.textPool.find(t => t.obj === fText);
    
    this.tweens.add({
      targets: fText,
      y: y - 48,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        slot.free = true;
        fText.setVisible(false);
      }
    });
  }

  drawSkillHUD(progress) {
    if (!this._skillPanel || !this._skillText || !this._skillHint) return;
    this._skillPanel.clear();
    
    // Background shadow
    this._skillPanel.fillStyle(0x0c0606, 0.35);
    this._skillPanel.fillRoundedRect(22, 164, 252, 38, 9);
    
    // Core background (dark/crimson)
    const isReady = progress >= 1;
    this._skillPanel.fillStyle(isReady ? 0x064e3b : 0x1c1917, 0.88); // Dark green if ready, otherwise dark grey
    this._skillPanel.fillRoundedRect(20, 162, 248, 36, 8);
    
    // Draw cooldown fill progress bar inside
    if (!isReady && progress > 0) {
      this._skillPanel.fillStyle(0xd97706, 0.35); // amber progress fill
      this._skillPanel.fillRoundedRect(20, 162, 248 * progress, 36, 8);
    }

    // Border
    this._skillPanel.lineStyle(1.5, isReady ? 0x10b981 : 0x44403c, 0.75); // bright green border if ready
    this._skillPanel.strokeRoundedRect(20, 162, 248, 36, 8);
    
    if (isReady) {
      // Glow border if ready
      this._skillPanel.lineStyle(2, 0x10b981, 0.4);
      this._skillPanel.strokeRoundedRect(18, 160, 252, 40, 10);
      
      this._skillText.setText('LONG VÂN KIẾM: SẴN SÀNG');
      this._skillText.setColor('#10b981');
      this._skillHint.setBackgroundColor('#10b981');
      this._skillHint.setAlpha(1);
    } else {
      const remainingSec = Math.ceil((1 - progress) * 5); // skill cooldown is 5s
      this._skillText.setText(`LONG VÂN KIẾM: CHỜ ${remainingSec}s`);
      this._skillText.setColor('#a8a29e');
      this._skillHint.setBackgroundColor('#4b5563'); // grey hint if cooldown
      this._skillHint.setAlpha(0.45);
    }
  }

  showBossWarningBanner() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bannerContainer = this.add.container(0, 0);

    const bg = this.add.graphics();
    bg.fillStyle(0x7f1d1d, 0.85); // Dark red transparent banner
    bg.fillRect(0, height / 2 - 60, width, 120);
    bg.lineStyle(3, 0xd97706, 1); // Gold borders
    bg.beginPath();
    bg.moveTo(0, height / 2 - 60);
    bg.lineTo(width, height / 2 - 60);
    bg.moveTo(0, height / 2 + 60);
    bg.lineTo(width, height / 2 + 60);
    bg.strokePath();

    bannerContainer.add(bg);

    const title = this.add.text(width / 2, height / 2 - 20, '⚠️ NGUY HIỂM: CHI LĂNG ĐẠI CHIẾN! ⚠️', {
      fontFamily: 'Cinzel Decorative, Outfit, sans-serif',
      fontSize: '28px',
      color: '#fcd34d',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    title.setShadow(2, 2, '#000000', 4);

    const sub = this.add.text(width / 2, height / 2 + 20, 'TƯỚNG GIẶC LIỄU THĂNG XUẤT BINH - TIÊU DIỆT HẮN ĐỂ GIÀNH CHIẾN THẮNG!', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '14px',
      color: '#fca5a5',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    sub.setShadow(1, 1, '#000000', 2);

    bannerContainer.add(title);
    bannerContainer.add(sub);

    // Animate banner: slide in, shake, fade out
    bannerContainer.setAlpha(0);
    this.tweens.add({
      targets: bannerContainer,
      alpha: 1,
      duration: 300,
      onComplete: () => {
        // Shake camera slightly on boss spawn
        this.cameras.main.shake(400, 0.005);
        this.time.delayedCall(2200, () => {
          this.tweens.add({
            targets: bannerContainer,
            alpha: 0,
            duration: 400,
            onComplete: () => bannerContainer.destroy()
          });
        });
      }
    });
  }

  showStoryDialogue(storyKey) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Destroy any existing story box
    if (this._storyBox) {
      this._storyBox.destroy();
    }

    const storyTexts = {
      intro: {
        speaker: 'LÊ LỢI',
        text: 'Viện binh Liễu Thăng sắp tiến qua Ả Ải Chi Lăng. Ta phải dẫn quân chiếm lĩnh địa hình hiểm trở phía trước!'
      },
      sneak: {
        speaker: 'NGUYỄN XÍ',
        text: 'Quân Minh canh gác rất nghiêm ngặt! Hãy dùng khinh công nhảy lên các vách đá và tiếp cận sau lưng (Hành thích) để hạ gục nhanh chóng.'
      },
      gate: {
        speaker: 'LÊ LỢI',
        text: 'Ải Chi Lăng hiểm trở ở ngay trước mắt! Liễu Thăng, hôm nay sẽ là ngày đền tội của quân Minh viện binh!'
      }
    };

    const data = storyTexts[storyKey];
    if (!data) return;

    const container = this.add.container(0, 0);
    this._storyBox = container;

    // Dark crimson background box
    const bg = this.add.graphics();
    bg.fillStyle(0x0c0606, 0.45); // Shadow
    bg.fillRoundedRect(width / 2 - 352, height - 122, 704, 84, 10);
    bg.fillStyle(0x310808, 0.95); // Deep crimson
    bg.fillRoundedRect(width / 2 - 350, height - 120, 700, 80, 8);
    bg.lineStyle(2.5, 0xd97706, 1); // Gold borders
    bg.strokeRoundedRect(width / 2 - 350, height - 120, 700, 80, 8);
    bg.lineStyle(1, 0xfcd34d, 0.45); // Gold inner frame
    bg.strokeRoundedRect(width / 2 - 347, height - 117, 694, 74, 6);
    container.add(bg);

    // Speaker Name (Gold, Cinzel)
    const speakerText = this.add.text(width / 2 - 320, height - 110, data.speaker, {
      fontFamily: 'Cinzel Decorative, Outfit, sans-serif',
      fontSize: '14px',
      color: '#fcd34d',
      fontStyle: 'bold'
    });
    container.add(speakerText);

    // Dialogue Content
    const dialogueText = this.add.text(width / 2 - 320, height - 90, data.text, {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '13px',
      color: '#f3f4f6',
      wordWrap: { width: 640 }
    });
    container.add(dialogueText);

    // Animate box slide up
    container.setAlpha(0);
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 350,
      onComplete: () => {
        this.time.delayedCall(4500, () => {
          this.tweens.add({
            targets: container,
            alpha: 0,
            duration: 350,
            onComplete: () => {
              if (this._storyBox === container) {
                container.destroy();
                this._storyBox = null;
              }
            }
          });
        });
      }
    });
  }

  update(time, delta) {
    const gameScene = this.scene.get('GameScene');
    if (gameScene && gameScene.player && gameScene.player.active && gameScene.player.combatSystem) {
      const combat = gameScene.player.combatSystem;
      const progress = combat.getSkillCooldownProgress(time);
      this.drawSkillHUD(progress);
    }
  }
}


