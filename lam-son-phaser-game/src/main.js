import Phaser from 'phaser';
import { gameConfig } from './game/config.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new Phaser.Game(gameConfig);
  
  // Expose game instance for debugging or testing if needed
  window.phaserGameInstance = game;
});
