import Phaser from 'phaser';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, type) {
    // Fallback to procedural textures if images aren't loaded
    const finalTexture = scene.textures.exists(texture) ? texture : `${type}_fallback`;
    super(scene, x, y, finalTexture);
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type; // 'arrow' or 'firewave'
    this.setDepth(25);
    
    if (type === 'arrow') {
      this.body.setAllowGravity(true);
      this.body.setGravityY(100);
      this.body.setSize(16, 4);
    } else { // 'firewave'
      const displayHeight = 58;
      this.setDisplaySize((this.width / this.height) * displayHeight, displayHeight);
      this.body.setAllowGravity(false);
      this.body.setSize(140, 38);
      this.body.setOffset(40, 34);
    }
  }

  fire(dir, speedX, speedY = 0) {
    this.setFlipX(dir < 0);
    this.body.setVelocityX(dir * speedX);
    this.body.setVelocityY(speedY);

    // Self destruct after 4 seconds
    this.scene.time.delayedCall(4000, () => {
      if (this.active) this.destroy();
    });
  }

  update() {
    if (!this.active) return;
    
    if (this.type === 'arrow' && this.body) {
      // Rotate arrow to align with trajectory velocity
      const angle = Math.atan2(this.body.velocity.y, this.body.velocity.x);
      this.setRotation(angle);
    }
  }
}
