import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data) {
    const width  = this.cameras.main.width;
    const height = this.cameras.main.height;
    const score  = data?.score || 0;

    // ── Clean background with backdrop image ──
    if (this.textures.exists('map_bg')) {
      this.add.image(width / 2, height / 2, 'map_bg')
        .setDisplaySize(width, height)
        .setAlpha(0.3)
        .setDepth(-10);
    }

    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x050202, 0.88);
    overlay.fillRect(0, 0, width, height);

    // Animated ember particles
    for (let i = 0; i < 12; i++) {
      const ember = this.add.circle(
        Phaser.Math.Between(60, width - 60),
        Phaser.Math.Between(60, height - 60),
        Phaser.Math.FloatBetween(1.2, 2.8),
        0xef4444,
        Phaser.Math.FloatBetween(0.15, 0.4)
      ).setDepth(2);
      this.tweens.add({
        targets: ember,
        y: ember.y - Phaser.Math.Between(30, 80),
        alpha: 0,
        duration: Phaser.Math.Between(1800, 3200),
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500)
      });
    }

    // ── Main Card ──
    const cardW = 560;
    const cardH = 400;
    const cardX = width / 2 - cardW / 2;
    const cardY = height / 2 - cardH / 2;

    const card = this.add.graphics().setDepth(5);
    // Outer glow
    card.fillStyle(0x7f1d1d, 0.25);
    card.fillRoundedRect(cardX - 8, cardY - 8, cardW + 16, cardH + 16, 20);
    // Card background
    card.fillStyle(0x0f0808, 0.96);
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 16);
    // Red border
    card.lineStyle(2.5, 0xdc2626, 0.9);
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 16);
    // Inner accent line
    card.lineStyle(1, 0xef4444, 0.3);
    card.strokeRoundedRect(cardX + 6, cardY + 6, cardW - 12, cardH - 12, 12);

    // Top decorative divider
    const divLine = this.add.graphics().setDepth(6);
    divLine.lineStyle(1.5, 0xdc2626, 0.5);
    divLine.strokeLineShape(new Phaser.Geom.Line(
      width / 2 - 180, cardY + 70,
      width / 2 + 180, cardY + 70
    ));

    // ── Title ──
    const title = this.add.text(width / 2, cardY + 42, 'THẤT BẠI', {
      fontFamily: '"Cinzel Decorative", serif',
      fontSize: '52px',
      color: '#ef4444',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    title.setShadow(0, 4, '#7f1d1d', 16, true, true);

    // Pulsing title animation
    this.tweens.add({
      targets: title,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // ── Subtitle ──
    this.add.text(width / 2, cardY + 108, 'ANH HÙNG RÚT QUÂN ĐỂ TOÀN MẠNG', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '14px',
      color: '#9ca3af',
      letterSpacing: 3
    }).setOrigin(0.5).setDepth(6);

    // ── Divider ──
    const divLine2 = this.add.graphics().setDepth(6);
    divLine2.lineStyle(1, 0x44403c, 0.6);
    divLine2.strokeLineShape(new Phaser.Geom.Line(
      width / 2 - 220, cardY + 138,
      width / 2 + 220, cardY + 138
    ));

    // ── Score Box ──
    const scoreBox = this.add.graphics().setDepth(6);
    scoreBox.fillStyle(0x1c1917, 0.9);
    scoreBox.fillRoundedRect(width / 2 - 160, cardY + 155, 320, 72, 12);
    scoreBox.lineStyle(1.5, 0xd97706, 0.6);
    scoreBox.strokeRoundedRect(width / 2 - 160, cardY + 155, 320, 72, 12);

    this.add.text(width / 2, cardY + 178, 'CHIẾN TÍCH ĐẠT ĐƯỢC', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '12px',
      color: '#78716c',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(7);

    this.add.text(width / 2, cardY + 205, `${score.toLocaleString()}`, {
      fontFamily: '"Cinzel Decorative", serif',
      fontSize: '32px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(7);

    // ── Retry Button ──
    const btnY = cardY + cardH - 78;
    const btnW = 240;
    const btnH = 54;
    const btnX = width / 2 - btnW / 2;

    const retryBtn = this.add.graphics().setDepth(6);
    const drawRetry = (hovered = false) => {
      retryBtn.clear();
      retryBtn.fillStyle(hovered ? 0xb91c1c : 0x991b1b, 1);
      retryBtn.fillRoundedRect(btnX, btnY, btnW, btnH, 12);
      retryBtn.lineStyle(hovered ? 2.5 : 1.5, hovered ? 0xfde68a : 0xfbbf24, 1);
      retryBtn.strokeRoundedRect(btnX, btnY, btnW, btnH, 12);
      // Gloss
      retryBtn.fillStyle(0xfde68a, hovered ? 0.18 : 0.1);
      retryBtn.fillRoundedRect(btnX + 8, btnY + 6, btnW - 16, 14, 6);
    };
    drawRetry(false);

    const retryText = this.add.text(width / 2, btnY + btnH / 2, '↺  TAI THỬ SỨC', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(7);

    const retryZone = this.add.zone(width / 2, btnY + btnH / 2, btnW, btnH)
      .setInteractive({ useHandCursor: true }).setDepth(8);

    retryZone.on('pointerover', () => {
      drawRetry(true);
      retryText.setColor('#fcd34d');
      this.tweens.add({ targets: retryText, scaleX: 1.06, scaleY: 1.06, duration: 100 });
    });
    retryZone.on('pointerout', () => {
      drawRetry(false);
      retryText.setColor('#ffffff');
      this.tweens.add({ targets: retryText, scaleX: 1, scaleY: 1, duration: 100 });
    });
    retryZone.on('pointerdown', () => {
      // Proper cleanup to avoid lag
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(320, () => {
        // Ensure clean slate
        window.spawnDamageParticles = null;
        window.spawnJumpParticles = null;
        this.scene.start('GameScene');
      });
    });

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }
}
