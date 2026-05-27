import Phaser from 'phaser';

export default class AttackHitbox extends Phaser.GameObjects.Rectangle {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, width, height, 0xff0000, 0); // Invisible by default
    scene.add.existing(this);
    scene.physics.add.existing(this, false);
    
    // Disable gravity on hitbox
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setActive(false);
    this.setVisible(false);
  }

  activate(x, y, w, h) {
    this.setPosition(x, y);
    this.body.setSize(w, h);
    this.setActive(true);
    // Can enable visibility in debug mode
    if (this.scene.physics.config.debug) {
      this.setVisible(true);
      this.setFillStyle(0xff0000, 0.4);
    }
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    this.body.reset(0, 0);
  }
}
