import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Small loading text or light asset if needed
    const progress = this.add.graphics();
    this.load.on('progress', (value) => {
      progress.clear();
      progress.fillStyle(0xd97706, 1);
      progress.fillRect(440, 350, 400 * value, 20);
    });
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
