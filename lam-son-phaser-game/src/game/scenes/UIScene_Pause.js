import Phaser from 'phaser';

export default class UIScene_Pause extends Phaser.Scene {
  constructor() {
    super('UIScene_Pause');
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Dark tint
    const tint = this.add.graphics();
    tint.fillStyle(0x000000, 0.7);
    tint.fillRect(0, 0, width, height);

    // Pause Dialog
    const dialog = this.add.graphics();
    dialog.fillStyle(0x1c1917, 0.95);
    dialog.fillRoundedRect(width / 2 - 180, height / 2 - 120, 360, 240, 12);
    dialog.lineStyle(2, 0xd97706, 0.75);
    dialog.strokeRoundedRect(width / 2 - 180, height / 2 - 120, 360, 240, 12);

    this.add.text(width / 2, height / 2 - 60, 'ĐÃ TẠM DỪNG', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '28px',
      color: '#fcd34d',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Resume button
    const resumeBtn = this.add.graphics();
    resumeBtn.fillStyle(0x991b1b, 1);
    resumeBtn.fillRoundedRect(width / 2 - 100, height / 2, 200, 44, 8);
    resumeBtn.lineStyle(1.5, 0xfbbf24, 0.8);
    resumeBtn.strokeRoundedRect(width / 2 - 100, height / 2, 200, 44, 8);

    const resumeText = this.add.text(width / 2, height / 2 + 22, 'TIẾP TỤC', {
      fontFamily: 'Outfit, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const resumeZone = this.add.zone(width / 2, height / 2 + 22, 200, 44)
      .setInteractive({ useHandCursor: true });

    resumeZone.on('pointerover', () => {
      resumeBtn.clear();
      resumeBtn.fillStyle(0xb91c1c, 1);
      resumeBtn.fillRoundedRect(width / 2 - 100, height / 2, 200, 44, 8);
      resumeBtn.lineStyle(2, 0xfcd34d, 1);
      resumeBtn.strokeRoundedRect(width / 2 - 100, height / 2, 200, 44, 8);
      resumeText.setColor('#fcd34d');
    });

    resumeZone.on('pointerout', () => {
      resumeBtn.clear();
      resumeBtn.fillStyle(0x991b1b, 1);
      resumeBtn.fillRoundedRect(width / 2 - 100, height / 2, 200, 44, 8);
      resumeBtn.lineStyle(1.5, 0xfbbf24, 0.8);
      resumeBtn.strokeRoundedRect(width / 2 - 100, height / 2, 200, 44, 8);
      resumeText.setColor('#ffffff');
    });

    resumeZone.on('pointerdown', () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });

    // ESC to resume hotkey
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.stop();
      this.scene.resume('GameScene');
    });
  }
}
