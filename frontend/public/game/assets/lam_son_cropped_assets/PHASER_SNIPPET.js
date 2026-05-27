// PreloadScene.js - ví dụ load asset crop thô
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload() {
    this.load.image("hero_idle_ref", "/assets/characters/hero/hero_idle_ref.png");
    this.load.image("enemy_infantry_ref", "/assets/characters/enemies/enemy_infantry_ref.png");
    this.load.image("enemy_archer_ref", "/assets/characters/enemies/enemy_archer_ref.png");
    this.load.image("enemy_spearman_ref", "/assets/characters/enemies/enemy_spearman_ref.png");
    this.load.image("enemy_swordsman_ref", "/assets/characters/enemies/enemy_swordsman_ref.png");
    this.load.image("enemy_cavalry_ref", "/assets/characters/enemies/enemy_cavalry_ref.png");
    this.load.image("boss_ref", "/assets/characters/boss/boss_ref.png");
    this.load.image("boss_skill_effect_ref", "/assets/effects/boss_skill_effect_ref.png");
  }

  create() {
    this.scene.start("GameScene");
  }
}

// GameScene.js - ví dụ dùng ảnh thay placeholder
// this.player = this.physics.add.sprite(200, 520, "hero_idle_ref").setScale(0.45);
// this.enemy = this.physics.add.sprite(800, 540, "enemy_infantry_ref").setScale(0.45);
// this.boss = this.physics.add.sprite(1600, 470, "boss_ref").setScale(0.65);
