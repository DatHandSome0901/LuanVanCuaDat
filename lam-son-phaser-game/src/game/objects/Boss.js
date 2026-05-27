import Phaser from 'phaser';
import HealthSystem from '../systems/HealthSystem.js';
import Projectile from './Projectile.js';

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(0.68);
    this.setOrigin(0.5, 1);
    this.setDepth(32);
    this.body.setCollideWorldBounds(true);
    this.body.setAllowGravity(true); // Let gravity land them naturally
    this.body.setSize(100, 200);
    this.body.setOffset(78, 50);

    // Systems
    this.healthSystem = new HealthSystem(
      this,
      250,
      (amt) => this.handleDamage(amt),
      () => this.handleDeath()
    );

    // AI Config
    this.speed = 150; // Increased from 92
    this.detectionRange = 1200; // Increased from 760
    this.attackRange = 112;
    this.lastAttackTime = 0;
    this.lastSkillTime = 0;
    this.attackCooldown = 1800;
    this.skillCooldown = 5800;
    this.aggroUntil = 0;

    // Boss state flags
    this.isPhase2   = false;
    this.isCasting  = false;
    this.isAttacking = false;
    this.currentAnim = '';

    // Squash & Stretch
    this.baseScaleX = this.scaleX;
    this.baseScaleY = this.scaleY;
    this.squashX = 1;
    this.squashY = 1;

    this.playAnim('boss_idle');
  }

  playAnim(key) {
    if (this.currentAnim === key) return;
    this.currentAnim = key;
    this.play(key, true);
  }

  faceDirection(dir) {
    this.setFlipX(dir < 0);
  }

  update(time, player) {
    this.updateBreathing(time);

    if (!this.active || this.healthSystem.health <= 0 || this.isCasting || this.isAttacking) return;
    if (!player || !player.active || player.healthSystem?.health <= 0) {
      this.setVelocityX(0);
      this.playAnim('boss_idle');
      return;
    }

    const dx   = player.x - this.x;
    const dist = Math.abs(dx);
    const dir  = dx > 0 ? 1 : -1;
    // Boss always chases player within detection range (no vertical restriction)
    const canSeePlayer = dist < this.detectionRange;
    const isAggro = canSeePlayer || time < this.aggroUntil;

    if (canSeePlayer) {
      this.aggroUntil = time + 9000; // Stay aggressive 9s
    }

    if (isAggro) {
      this.faceDirection(dir);

      // Skill priority
      if (time - this.lastSkillTime > this.skillCooldown && dist > 150) {
        this.castFirewave(time, dir);
        return;
      }

      // Chase & melee
      const canAttackNow = time - this.lastAttackTime >= this.attackCooldown;
      if (dist > this.attackRange || (!canAttackNow && dist > this.attackRange * 0.55)) {
        this.setVelocityX(dir * this.speed);
        this.playAnim('boss_walk');
      } else if (canAttackNow) {
        this.setVelocityX(0);
        this.playAnim('boss_idle');
        this.executeAttack(time, dir, player);
      } else {
        this.setVelocityX(0);
        this.playAnim('boss_idle');
      }
    } else {
      this.setVelocityX(0);
      this.playAnim('boss_idle');
    }
  }



  updateBreathing(time) {
    // Gentle idle breathing scale modulation
    if (!this.isAttacking && !this.isCasting) {
      const breathScale = Math.sin(time * 0.003);
      this.scaleY = this.baseScaleY * this.squashY * (1 - breathScale * 0.015);
      this.scaleX = this.baseScaleX * this.squashX * (1 + breathScale * 0.015);
    }
  }

  executeAttack(time, dir, player) {
    if (time - this.lastAttackTime < this.attackCooldown) return;
    this.lastAttackTime = time;
    this.isAttacking = true;
    this.setVelocityX(0);
    this.faceDirection(dir);

    this.playAnim('boss_attack');

    // Lunge forward
    this.scene.tweens.add({
      targets: this,
      x: this.x + 46 * dir,
      duration: 200,
      yoyo: true,
      ease: 'Cubic.easeOut'
    });

    this.scene.time.delayedCall(170, () => {
      if (!this.active || !player.active) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (dist < 150) {
        const dmg = this.isPhase2 ? 12 : 8;
        player.healthSystem.takeDamage(dmg, dir * 280);
      }
    });

    this.once('animationcomplete-boss_attack', () => {
      this.isAttacking = false;
      this.currentAnim = '';
      this.playAnim('boss_idle');
    });

    // Safety fallback
    this.scene.time.delayedCall(900, () => {
      if (this.isAttacking) {
        this.isAttacking = false;
        this.currentAnim = '';
        this.playAnim('boss_idle');
      }
    });
  }

  castFirewave(time, dir) {
    this.lastSkillTime = time;
    this.isCasting = true;
    this.setVelocityX(0);
    this.faceDirection(dir);

    this.playAnim('boss_attack');
    this.setTint(this.isPhase2 ? 0xa855f7 : 0xf97316);

    this.scene.time.delayedCall(600, () => {
      if (!this.active) return;
      this.clearTint();
      this.isCasting = false;
      this.currentAnim = '';
      this.playAnim('boss_idle');

      // Fire projectile
      const wave = new Projectile(this.scene, this.x + 30 * dir, this.y - 50, 'boss_skill_effect', 'firewave');
      this.scene.projectiles.add(wave);
      const speed = this.isPhase2 ? 460 : 320;
      wave.fire(dir, speed, 0);

      this.scene.cameras.main.shake(120, 0.003);
    });
  }

  handleDamage(amount) {
    this.aggroUntil = this.scene.time.now + 9000;
    this.playAnim('boss_hurt');
    this.setTint(0xef4444);
    this.scene.time.delayedCall(120, () => {
      if (this.active) {
        this.clearTint();
        this.currentAnim = '';
        this.playAnim(this.isAttacking ? 'boss_attack' : 'boss_idle');
      }
    });

    if (typeof window.spawnDamageParticles === 'function') {
      window.spawnDamageParticles(this.x, this.y - 60, 0xef4444, 10);
      if (this.isPhase2) {
        window.spawnDamageParticles(this.x, this.y - 60, 0xa855f7, 8);
      }
    }

    this.scene.events.emit('spawnText', {
      x: this.x, y: this.y - 80, text: `-${amount}`, color: '#f59e0b'
    });

    this.scene.events.emit('bossHealthChanged', this.healthSystem.health);

    if (!this.isPhase2 && this.healthSystem.health < this.healthSystem.maxHealth * 0.5) {
      this.triggerPhase2();
    }
  }

  triggerPhase2() {
    this.isPhase2 = true;
    this.speed = 200; // Increased from 118
    this.attackCooldown = 1100;

    // Grow larger in Phase 2
    const p2Scale = 0.88;
    this.setScale(p2Scale);
    this.baseScaleX = this.scaleX;
    this.baseScaleY = this.scaleY;

    this.scene.events.emit('spawnText', {
      x: this.x, y: this.y - 80, text: 'LIỄU THĂNG NỔI GIẬN - PHASE 2!', color: '#a855f7'
    });

    this.scene.cameras.main.shake(300, 0.008);

    if (typeof this.scene.summonReinforcements === 'function') {
      this.scene.summonReinforcements();
    }
  }

  handleDeath() {
    this.setVelocity(0, 0);
    this.body.setEnable(false);
    this.playAnim('boss_dead');

    if (typeof window.spawnDamageParticles === 'function') {
      window.spawnDamageParticles(this.x, this.y - 60, 0xdc2626, 30);
      window.spawnDamageParticles(this.x, this.y - 60, 0xfbbf24, 20);
    }

    this.scene.time.delayedCall(1000, () => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 800,
        onComplete: () => {
          this.scene.events.emit('scoreAdded', 1000);
          this.scene.events.emit('bossKilled');
          this.destroy();
        }
      });
    });
  }
}
