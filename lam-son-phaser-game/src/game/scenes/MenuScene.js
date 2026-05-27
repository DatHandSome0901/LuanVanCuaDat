import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const width  = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.cameras.main.setBackgroundColor('#0a0503');
    this.createBackdrop(width, height);
    this.createTitle(width, height);
    this.createStoryPanel(width, height);
    this.createPlayButton(width, height);
    this.createControls(width, height);
    this.createCharacters(width, height);

    // Fade in
    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  createBackdrop(width, height) {
    if (this.textures.exists('map_bg')) {
      this.add.image(width / 2, height / 2, 'map_bg')
        .setDisplaySize(width, height)
        .setAlpha(0.9)
        .setDepth(-20);
    }

    // Dark cinematic vignette overlay
    const shade = this.add.graphics().setDepth(-15);
    shade.fillStyle(0x080402, 0.36);
    shade.fillRect(0, 0, width, height);

    // Atmospheric bottom glow (warm battlefield)
    const glow = this.add.graphics().setDepth(-14);
    glow.fillStyle(0xd97706, 0.10);
    glow.fillEllipse(width / 2, height - 60, 1000, 240);
    glow.fillStyle(0x991b1b, 0.14);
    glow.fillEllipse(width / 2, 110, 840, 240);

    // Animated ember/spark particles rising from bottom
    for (let i = 0; i < 22; i++) {
      const isGold = Math.random() > 0.5;
      const ember = this.add.circle(
        Phaser.Math.Between(60, width - 60),
        Phaser.Math.Between(200, height - 40),
        Phaser.Math.FloatBetween(1.2, 3.2),
        isGold ? 0xfbbf24 : 0xef4444,
        Phaser.Math.FloatBetween(0.14, 0.42)
      ).setDepth(-8);

      this.tweens.add({
        targets: ember,
        y: ember.y - Phaser.Math.Between(30, 80),
        alpha: 0,
        duration: Phaser.Math.Between(1400, 3000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 1800)
      });
    }
  }

  createTitle(width, height) {
    // Outer banner background with depth layered border
    const banner = this.add.graphics().setDepth(3);
    // Outer glow layer
    banner.fillStyle(0x7f1d1d, 0.22);
    banner.fillRoundedRect(width / 2 - 434, 46, 868, 128, 22);
    // Core dark banner
    banner.fillStyle(0x1a0805, 0.92);
    banner.fillRoundedRect(width / 2 - 428, 50, 856, 118, 18);
    // Gold outer border
    banner.lineStyle(2.5, 0xd97706, 0.95);
    banner.strokeRoundedRect(width / 2 - 428, 50, 856, 118, 18);
    // Inner gold accent
    banner.lineStyle(1, 0xfcd34d, 0.35);
    banner.strokeRoundedRect(width / 2 - 420, 57, 840, 104, 13);
    // Corner ornament dots
    banner.fillStyle(0xd97706, 0.9);
    banner.fillCircle(width / 2 - 418, 60, 5);
    banner.fillCircle(width / 2 + 418, 60, 5);
    banner.fillCircle(width / 2 - 418, 165, 5);
    banner.fillCircle(width / 2 + 418, 165, 5);

    const titleText = this.add.text(width / 2, 106, 'HÀO KHÍ LAM SƠN', {
      fontFamily: '"Cinzel Decorative", serif',
      fontSize: '58px',
      color: '#fcd34d',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(4);
    titleText.setShadow(0, 4, '#7f1d1d', 14, true, true);

    // Pulsing subtle glow on title
    this.tweens.add({
      targets: titleText,
      scaleX: 1.025,
      scaleY: 1.025,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Horizontal gold dividers flanking subtitle
    const subDiv = this.add.graphics().setDepth(4);
    subDiv.lineStyle(1, 0xd97706, 0.5);
    subDiv.strokeLineShape(new Phaser.Geom.Line(width / 2 - 240, 153, width / 2 - 20, 153));
    subDiv.strokeLineShape(new Phaser.Geom.Line(width / 2 + 20, 153, width / 2 + 240, 153));

    this.add.text(width / 2, 152, 'LÊ LỢI VÀ GƯƠM THẦN THUẬN THIÊN', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '13px',
      color: '#fbbf24',
      fontStyle: 'bold',
      letterSpacing: 5
    }).setOrigin(0.5).setDepth(4);
  }

  createStoryPanel(width, height) {
    const panelY = 190;
    const panelH = 148;

    const panel = this.add.graphics().setDepth(3);
    // Shadow
    panel.fillStyle(0x0a0403, 0.5);
    panel.fillRoundedRect(width / 2 - 432, panelY + 5, 864, panelH, 16);
    // Core panel
    panel.fillStyle(0x140a07, 0.90);
    panel.fillRoundedRect(width / 2 - 430, panelY, 860, panelH, 14);
    // Amber border
    panel.lineStyle(1.5, 0xd97706, 0.50);
    panel.strokeRoundedRect(width / 2 - 430, panelY, 860, panelH, 14);

    // Title label with gem diamond
    this.add.text(width / 2, panelY + 22, '◆  CỐT TRUYỆN  ◆', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '13px',
      color: '#fcd34d',
      fontStyle: 'bold',
      letterSpacing: 4
    }).setOrigin(0.5).setDepth(4);

    // Thin divider under label
    const storyDiv = this.add.graphics().setDepth(4);
    storyDiv.lineStyle(1, 0x44403c, 0.6);
    storyDiv.strokeLineShape(new Phaser.Geom.Line(width / 2 - 380, panelY + 38, width / 2 + 380, panelY + 38));

    this.add.text(width / 2, panelY + 82,
      'Năm 1418, nghĩa quân Lam Sơn dựng cờ khởi nghĩa giữa rừng núi Thanh Hóa.\n' +
      'Trong vai Lê Lợi, hãy vượt qua các toán quân Minh, gom bình máu và tiến vào ải Chi Lăng.\n' +
      'Khi Liễu Thăng xuất hiện, hãy lợi dụng khoảng trống trong đấu trường để né đòn, phản công và giành đại thắng.',
      {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '15px',
        color: '#d6d3d1',
        align: 'center',
        lineSpacing: 8
      }
    ).setOrigin(0.5).setDepth(4);
  }

  createPlayButton(width, height) {
    const buttonY = 392;
    const btnW = 300;
    const btnH = 62;

    const playBtnBox = this.add.graphics().setDepth(5);
    const drawButton = (hovered = false) => {
      playBtnBox.clear();
      // Outer glow when hovered
      if (hovered) {
        playBtnBox.fillStyle(0xb91c1c, 0.3);
        playBtnBox.fillRoundedRect(width / 2 - btnW / 2 - 6, buttonY - btnH / 2 - 6, btnW + 12, btnH + 12, 18);
      }
      playBtnBox.fillStyle(hovered ? 0xb91c1c : 0x991b1b, 0.98);
      playBtnBox.fillRoundedRect(width / 2 - btnW / 2, buttonY - btnH / 2, btnW, btnH, 13);
      playBtnBox.lineStyle(hovered ? 2.5 : 2, hovered ? 0xfde68a : 0xfbbf24, 1);
      playBtnBox.strokeRoundedRect(width / 2 - btnW / 2, buttonY - btnH / 2, btnW, btnH, 13);
      // Glossy highlight strip
      playBtnBox.fillStyle(0xfde68a, hovered ? 0.20 : 0.12);
      playBtnBox.fillRoundedRect(width / 2 - btnW / 2 + 10, buttonY - btnH / 2 + 7, btnW - 20, 14, 7);
    };
    drawButton(false);

    const playText = this.add.text(width / 2, buttonY, '⚔  XUẤT BINH', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(6);
    playText.setShadow(0, 2, '#7f1d1d', 6);

    const playZone = this.add.zone(width / 2, buttonY, btnW, btnH)
      .setInteractive({ useHandCursor: true }).setDepth(7);

    playZone.on('pointerover', () => {
      drawButton(true);
      playText.setColor('#fcd34d');
      this.tweens.add({ targets: playText, scaleX: 1.06, scaleY: 1.06, duration: 100 });
    });
    playZone.on('pointerout', () => {
      drawButton(false);
      playText.setColor('#ffffff');
      this.tweens.add({ targets: playText, scaleX: 1, scaleY: 1, duration: 100 });
    });
    playZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.time.delayedCall(370, () => {
        this.scene.start('GameScene');
      });
    });
  }

  createControls(width, height) {
    const panelY = 474;
    const panelH = 148;

    const panel = this.add.graphics().setDepth(3);
    // Shadow layer
    panel.fillStyle(0x080402, 0.5);
    panel.fillRoundedRect(width / 2 - 432, panelY + 5, 864, panelH, 16);
    // Core panel
    panel.fillStyle(0x0e0906, 0.90);
    panel.fillRoundedRect(width / 2 - 430, panelY, 860, panelH, 14);
    // Amber border
    panel.lineStyle(1.5, 0xd97706, 0.42);
    panel.strokeRoundedRect(width / 2 - 430, panelY, 860, panelH, 14);

    this.add.text(width / 2, panelY + 22, '◆  CHỈ HUY QUÂN LÍNH  ◆', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '13px',
      color: '#fcd34d',
      fontStyle: 'bold',
      letterSpacing: 3
    }).setOrigin(0.5).setDepth(4);

    // Divider
    const ctlDiv = this.add.graphics().setDepth(4);
    ctlDiv.lineStyle(1, 0x44403c, 0.55);
    ctlDiv.strokeLineShape(new Phaser.Geom.Line(width / 2 - 380, panelY + 38, width / 2 + 380, panelY + 38));

    // Vertical separator between columns
    ctlDiv.lineStyle(1, 0x44403c, 0.4);
    ctlDiv.strokeLineShape(new Phaser.Geom.Line(width / 2 + 10, panelY + 48, width / 2 + 10, panelY + panelH - 12));

    const left  = [
      ['A / D  hoặc  ← / →', 'Di chuyển'],
      ['SPACE', 'Nhảy'],
      ['E', 'Dùng bình máu']
    ];
    const right = [
      ['J', 'Tấn công kiếm'],
      ['K', 'Lướt Kiếm Thần'],
      ['ESC', 'Tạm dừng']
    ];

    this.drawControlRows(width / 2 - 390, panelY + 52, left);
    this.drawControlRows(width / 2 + 30,  panelY + 52, right);
  }

  drawControlRows(x, y, rows) {
    rows.forEach(([key, label], index) => {
      const rowY = y + index * 30;
      // Key badge
      const kb = this.add.graphics().setDepth(4);
      const kw = Math.max(key.length * 8.5, 40);
      kb.fillStyle(0x1c1917, 0.9);
      kb.fillRoundedRect(x, rowY - 2, kw, 22, 5);
      kb.lineStyle(1, 0xd97706, 0.7);
      kb.strokeRoundedRect(x, rowY - 2, kw, 22, 5);

      this.add.text(x + kw / 2, rowY + 9, key, {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '12px',
        color: '#fcd34d',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(5);

      this.add.text(x + kw + 12, rowY + 9, label, {
        fontFamily: '"Outfit", sans-serif',
        fontSize: '13px',
        color: '#d6d3d1'
      }).setOrigin(0, 0.5).setDepth(5);
    });
  }

  createCharacters(width, height) {
    // Left character (Lê Lợi hero) — bottom left corner
    if (this.textures.exists('hero')) {
      const heroSprite = this.add.sprite(148, height - 58, 'hero', 0)
        .setOrigin(0.5, 1)
        .setScale(0.82)
        .setDepth(8)
        .setAlpha(0);

      // Idle breathing animation
      this.tweens.add({
        targets: heroSprite,
        scaleY: 0.80,
        scaleX: 0.84,
        duration: 1600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.tweens.add({ targets: heroSprite, alpha: 1, duration: 600, delay: 200 });
    }

    // Right character (Liễu Thăng boss) — bottom right corner
    if (this.textures.exists('boss')) {
      const bossSprite = this.add.sprite(width - 148, height - 54, 'boss', 0)
        .setOrigin(0.5, 1)
        .setScale(0.86)
        .setFlipX(true)
        .setDepth(8)
        .setAlpha(0);

      this.tweens.add({
        targets: bossSprite,
        scaleY: 0.83,
        scaleX: 0.88,
        duration: 1800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      this.tweens.add({ targets: bossSprite, alpha: 1, duration: 600, delay: 350 });
    }
  }
}
