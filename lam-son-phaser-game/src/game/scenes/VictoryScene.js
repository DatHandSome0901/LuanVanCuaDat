import Phaser from 'phaser';

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(data) {
    const width  = this.cameras.main.width;
    const height = this.cameras.main.height;
    const score  = data?.score || 0;

    // ── Background ──
    if (this.textures.exists('map_bg')) {
      this.add.image(width / 2, height / 2, 'map_bg')
        .setDisplaySize(width, height)
        .setAlpha(0.35)
        .setDepth(-10);
    }

    // Dark golden overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x050300, 0.85);
    overlay.fillRect(0, 0, width, height);

    // Animated gold embers rising
    for (let i = 0; i < 18; i++) {
      const ember = this.add.circle(
        Phaser.Math.Between(60, width - 60),
        Phaser.Math.Between(60, height - 60),
        Phaser.Math.FloatBetween(1.2, 3.0),
        0xfbbf24,
        Phaser.Math.FloatBetween(0.18, 0.5)
      ).setDepth(2);
      this.tweens.add({
        targets: ember,
        y: ember.y - Phaser.Math.Between(40, 100),
        alpha: 0,
        duration: Phaser.Math.Between(1600, 3000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500)
      });
    }

    // ── Main Card ──
    const cardW = 600;
    const cardH = 440;
    const cardX = width / 2 - cardW / 2;
    const cardY = height / 2 - cardH / 2;

    const card = this.add.graphics().setDepth(5);
    // Outer golden glow
    card.fillStyle(0xd97706, 0.18);
    card.fillRoundedRect(cardX - 10, cardY - 10, cardW + 20, cardH + 20, 22);
    // Card body
    card.fillStyle(0x0d0a04, 0.97);
    card.fillRoundedRect(cardX, cardY, cardW, cardH, 18);
    // Gold border
    card.lineStyle(3, 0xd97706, 0.95);
    card.strokeRoundedRect(cardX, cardY, cardW, cardH, 18);
    // Inner gold accent
    card.lineStyle(1, 0xfcd34d, 0.3);
    card.strokeRoundedRect(cardX + 7, cardY + 7, cardW - 14, cardH - 14, 13);

    // Top decorative corner ornaments
    const orn = this.add.graphics().setDepth(6);
    orn.fillStyle(0xd97706, 0.8);
    orn.fillCircle(cardX + 18, cardY + 18, 5);
    orn.fillCircle(cardX + cardW - 18, cardY + 18, 5);
    orn.fillCircle(cardX + 18, cardY + cardH - 18, 5);
    orn.fillCircle(cardX + cardW - 18, cardY + cardH - 18, 5);

    // ── Title ──
    const title = this.add.text(width / 2, cardY + 50, 'ĐẠI THẮNG', {
      fontFamily: '"Cinzel Decorative", serif',
      fontSize: '56px',
      color: '#fbbf24',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(6);
    title.setShadow(0, 5, '#92400e', 18, true, true);

    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Divider line
    const topLine = this.add.graphics().setDepth(6);
    topLine.lineStyle(2, 0xd97706, 0.55);
    topLine.strokeLineShape(new Phaser.Geom.Line(
      width / 2 - 200, cardY + 82,
      width / 2 + 200, cardY + 82
    ));

    // ── Battle subtitle ──
    this.add.text(width / 2, cardY + 107, 'CHI LĂNG ĐẠI BẠI — LIỄU THĂNG ĐẦU RƠI', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '14px',
      color: '#fde68a',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5).setDepth(6);

    this.add.text(width / 2, cardY + 135, 'Nghĩa quân Lam Sơn toàn thắng giặc ngoại xâm!', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '14px',
      color: '#a8a29e'
    }).setOrigin(0.5).setDepth(6);

    // Divider
    const midLine = this.add.graphics().setDepth(6);
    midLine.lineStyle(1, 0x44403c, 0.55);
    midLine.strokeLineShape(new Phaser.Geom.Line(
      width / 2 - 240, cardY + 162,
      width / 2 + 240, cardY + 162
    ));

    // ── Score Box ──
    const scoreBox = this.add.graphics().setDepth(6);
    scoreBox.fillStyle(0x1c1610, 0.9);
    scoreBox.fillRoundedRect(width / 2 - 170, cardY + 178, 340, 80, 12);
    scoreBox.lineStyle(2, 0xd97706, 0.7);
    scoreBox.strokeRoundedRect(width / 2 - 170, cardY + 178, 340, 80, 12);
    // Gold gloss
    scoreBox.fillStyle(0xfde68a, 0.08);
    scoreBox.fillRoundedRect(width / 2 - 162, cardY + 184, 324, 18, 7);

    this.add.text(width / 2, cardY + 202, 'TỔNG CHIẾN TÍCH', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '12px',
      color: '#a16207',
      letterSpacing: 3
    }).setOrigin(0.5).setDepth(7);

    this.add.text(width / 2, cardY + 230, `${score.toLocaleString()}`, {
      fontFamily: '"Cinzel Decorative", serif',
      fontSize: '34px',
      color: '#f59e0b',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(7);

    // ── Replay Button ──
    const btnY = cardY + cardH - 80;
    const btnW = 250;
    const btnH = 54;
    const btnX = width / 2 - btnW / 2;

    const replayBtn = this.add.graphics().setDepth(6);
    const drawReplay = (hovered = false) => {
      replayBtn.clear();
      replayBtn.fillStyle(hovered ? 0x92400e : 0x78350f, 1);
      replayBtn.fillRoundedRect(btnX, btnY, btnW, btnH, 12);
      replayBtn.lineStyle(hovered ? 2.5 : 1.5, hovered ? 0xfde68a : 0xfbbf24, 1);
      replayBtn.strokeRoundedRect(btnX, btnY, btnW, btnH, 12);
      replayBtn.fillStyle(0xfde68a, hovered ? 0.2 : 0.1);
      replayBtn.fillRoundedRect(btnX + 8, btnY + 6, btnW - 16, 14, 6);
    };
    drawReplay(false);

    const replayText = this.add.text(width / 2, btnY + btnH / 2, '⚔  TÁI CHIẾN', {
      fontFamily: '"Outfit", sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(7);

    const replayZone = this.add.zone(width / 2, btnY + btnH / 2, btnW, btnH)
      .setInteractive({ useHandCursor: true }).setDepth(8);

    replayZone.on('pointerover', () => {
      drawReplay(true);
      replayText.setColor('#fcd34d');
      this.tweens.add({ targets: replayText, scaleX: 1.06, scaleY: 1.06, duration: 100 });
    });
    replayZone.on('pointerout', () => {
      drawReplay(false);
      replayText.setColor('#ffffff');
      this.tweens.add({ targets: replayText, scaleX: 1, scaleY: 1, duration: 100 });
    });
    replayZone.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.time.delayedCall(320, () => {
        // Proper cleanup to avoid lag on restart
        window.spawnDamageParticles = null;
        window.spawnJumpParticles = null;
        this.scene.start('GameScene');
      });
    });

    // Fade in
    this.cameras.main.fadeIn(400, 0, 0, 0);
  }
}
