import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import UIScene from './scenes/UIScene.js';
import UIScene_Pause from './scenes/UIScene_Pause.js';
import GameOverScene from './scenes/GameOverScene.js';
import VictoryScene from './scenes/VictoryScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'phaser-game',
  backgroundColor: '#0a0504',

  // roundPixels: snaps sprite positions to whole pixels so there's no
  // sub-pixel blending artifact at integer positions (keeps edges crisp)
  // antialias: false ensures WebGL uses NEAREST filter (no blur on sprites)
  // DO NOT add pixelArt:true — it overrides texture filter AFTER removeBackground
  // processes alpha, causing transparent holes in run/attack animation frames.
  roundPixels: true,
  antialias: false,

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1200 },
      debug: false,
      fps: 60
    }
  },
  render: {
    powerPreference: 'high-performance',
    batchSize: 2048
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    GameScene,
    UIScene,
    UIScene_Pause,
    GameOverScene,
    VictoryScene
  ]
};
