import Phaser from 'phaser';
import HealthSystem from '../systems/HealthSystem.js';
import Projectile from './Projectile.js';

// ── Enemy type config ──────────────────────────────────────────────────────────
const ENEMY_CONFIG = {
  enemy_infantry: {
    frameOffset: 0,
    scale: 0.54,
    hp: 35,
    speed: 145,
    attackRange: 78,
    attackCooldown: 1100,
    detectionRange: 1400,
    bodyW: 52, bodyH: 160, bodyOffX: 102, bodyOffY: 72,
    scoreValue: 100,
    dropChance: 0.42
  },
  enemy_spearman: {
    frameOffset: 4,
    scale: 0.56,
    hp: 50,
    speed: 155,
    attackRange: 110,    // Spearman has longer reach
    attackCooldown: 1300,
    detectionRange: 1400,
    bodyW: 50, bodyH: 165, bodyOffX: 102, bodyOffY: 68,
    scoreValue: 150,
    dropChance: 0.48
  },
  enemy_archer: {
    frameOffset: 8,
    scale: 0.52,
    hp: 30,
    speed: 115,
    attackRange: 340,
    attackCooldown: 2000,
    detectionRange: 1500,
    bodyW: 48, bodyH: 155, bodyOffX: 102, bodyOffY: 74,
    scoreValue: 100,
    dropChance: 0.36
  }
};

// ── Shared group-flanking state (all enemies read/write this) ─────────────────
// Tracks how many enemies are currently approaching from each side
let _flankCountLeft  = 0;
let _flankCountRight = 0;

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, 'enemies');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.type = type;
    const cfg = ENEMY_CONFIG[type] || ENEMY_CONFIG.enemy_infantry;

    this.setScale(cfg.scale);
    this.setOrigin(0.5, 1);
    this.setDepth(28);
    this.body.setCollideWorldBounds(true);
    this.body.setAllowGravity(true);
    this.body.setSize(95, 190);
    this.body.setOffset(80, 55);
    this.body.setMaxVelocityX(cfg.speed * 1.1);
    this.body.setDragX(1800);

    // AI config
    this.speed          = cfg.speed;
    this.detectionRange = cfg.detectionRange;
    this.attackRange    = cfg.attackRange;
    this.lastAttackTime = 0;
    this.attackCooldown = cfg.attackCooldown;
    this.frameOffset    = cfg.frameOffset;
    this.scoreValue     = cfg.scoreValue;
    this.dropChance     = cfg.dropChance ?? 0.4;
    this.aggroUntil     = 0;
    this.hasWarned      = false;

    // Flanking: which side this enemy approaches from
    // Assigned dynamically when aggro starts
    this._flankSide     = 0;  // -1 = approach from left, 1 = from right, 0 = unset

    // Tactical stagger: slight delay before engaging to prevent all attacking at once
    this._engageDelay   = Phaser.Math.Between(0, 800); // ms random delay
    this._lastEngageTime = 0;

    // Patrol
    this.patrolDirection = 1;
    this.patrolWidth     = 120;
    this.spawnX          = x;

    // Health
    this.healthSystem = new HealthSystem(
      this,
      cfg.hp,
      (amt) => this.handleDamage(amt),
      () => this.handleDeath()
    );

    // Animation state
    this.currentAnim = '';
    this.isAttacking = false;

    // Squash & Stretch
    this.baseScaleX = this.scaleX;
    this.baseScaleY = this.scaleY;
    this.squashX = 1;
    this.squashY = 1;

    this.playAnim('idle');
  }

  // ── Play a type-prefixed animation ─────────────────────────────────────────
  playAnim(action) {
    const prefix = this.type.replace('enemy_', '');
    const key = `${prefix}_${action}`;
    if (this.currentAnim === key) return;
    this.currentAnim = key;
    if (this.scene.anims.exists(key)) {
      this.play(key, true);
    }
  }

  faceDirection(dir) {
    this.setFlipX(dir < 0);
  }

  // ── Assign flanking side when this enemy first gets aggro ──────────────────
  _assignFlankSide(playerDir) {
    if (this._flankSide !== 0) return; // already assigned

    // Prefer the less-occupied flank for smarter surrounding
    if (_flankCountLeft <= _flankCountRight) {
      this._flankSide = -1; // approach from left (enemy comes from right of player)
      _flankCountLeft++;
    } else {
      this._flankSide = 1;  // approach from right
      _flankCountRight++;
    }
  }

  _releaseFlankSide() {
    if (this._flankSide === -1) _flankCountLeft  = Math.max(0, _flankCountLeft  - 1);
    if (this._flankSide ===  1) _flankCountRight = Math.max(0, _flankCountRight - 1);
    this._flankSide = 0;
  }

  // ── Main update ────────────────────────────────────────────────────────────
  update(time, player) {
    if (this.active && this.healthSystem.health > 0 && !this.isAttacking) {
      this.updateBreathing(time);
    }

    if (!this.active || this.healthSystem.health <= 0 || this.isAttacking) return;
    if (!player || !player.active || player.healthSystem?.health <= 0) {
      this._releaseFlankSide();
      this.setVelocityX(0);
      this.playAnim('idle');
      return;
    }

    const dx   = player.x - this.x;
    const dist = Math.abs(dx);
    const dir  = dx > 0 ? 1 : -1;

    const dy   = Math.abs(player.y - this.y);
    
    // ── Detection: Stealth & Front View Cone ──────────────────────
    const isPlayerInFront = this.flipX ? (dx < 0) : (dx > 0);
    const canSeePlayer = dist < this.detectionRange && (dy < 80) && (time < this.aggroUntil || isPlayerInFront);
    const isAggro = canSeePlayer || time < this.aggroUntil;

    if (canSeePlayer) {
      this.aggroUntil = time + 8000;

      if (!this.hasWarned) {
        this.hasWarned = true;
        this._assignFlankSide(dir);
        this.scene.events.emit('spawnText', {
          x: this.x,
          y: this.y - 78,
          text: 'PHÁT HIỆN!',
          color: '#ef4444'
        });
      }
    }

    if (!isAggro) {
      this._releaseFlankSide();
      // Patrol when not aggro
      if (this.x > this.spawnX + this.patrolWidth) this.patrolDirection = -1;
      else if (this.x < this.spawnX - this.patrolWidth) this.patrolDirection = 1;
      this.setVelocityX(this.patrolDirection * (this.speed * 0.42));
      this.faceDirection(this.patrolDirection);
      this.playAnim('walk');
      return;
    }

    // ── AGGRO AI ──────────────────────────────────────────────────────────────
    this.faceDirection(dir);

    if (this.type === 'enemy_archer') {
      this._archerBehavior(time, player, dist, dir);
    } else {
      this._meleeBehavior(time, player, dist, dir);
    }
  }

  // ── Archer: maintains distance, repositions smartly ──────────────────────
  _archerBehavior(time, player, dist, dir) {
    const minDist = 160; // minimum comfortable distance (back away if closer)
    const optDist = 260; // optimal shooting distance

    if (dist > this.attackRange) {
      // Close in to shooting range
      this.setVelocityX(dir * this.speed * 0.88);
      this.playAnim('walk');
    } else if (dist < minDist) {
      // Too close — retreat
      this.setVelocityX(-dir * this.speed * 0.75);
      this.playAnim('walk');
    } else if (dist >= minDist && dist <= this.attackRange) {
      // In range: strafe sideways slightly (makes archer harder to hit)
      const strafeDir = (Math.sin(time * 0.002) > 0) ? 1 : -1;
      this.setVelocityX(strafeDir * this.speed * 0.3);
      this.tryAttack(time, player);
      if (Math.abs(this.body.velocity.x) < 15) this.playAnim('idle');
    }
  }

  // ── Melee: flanking, staggered engagement ────────────────────────────────
  _meleeBehavior(time, player, dist, dir) {
    const canAttackNow = time - this.lastAttackTime >= this.attackCooldown;

    // Stagger: don't engage until this enemy's individual delay expires
    const engageReady = (time - this._lastEngageTime) > this._engageDelay || this._lastEngageTime === 0;

    // Flanking offset: enemies approach from slightly different x positions
    // to surround the player instead of all stacking at the same spot.
    // _flankSide determines which direction this enemy approaches from.
    const flankOffset = this._flankSide !== 0
      ? this._flankSide * (this.attackRange * 0.7)  // approach from assigned side
      : (Math.sign(this.x - player.x) * this.attackRange * 0.8); // fallback: stay on current side

    // Target x: where this enemy wants to stand (in front of player from their flank side)
    const targetX    = player.x + flankOffset;

    if (dist > this.attackRange) {
      // ── Chase phase: move toward flanking spot ──────────────────────────
      const chaseDir = targetX > this.x ? 1 : -1;
      const speed = engageReady ? this.speed : this.speed * 0.55;
      this.setVelocityX(chaseDir * speed);
      this.faceDirection(dir);       // always face the player
      this.playAnim('walk');

      if (this._lastEngageTime === 0) this._lastEngageTime = time;

    } else if (canAttackNow) {
      // ── In range and ready: attack ──────────────────────────────────────
      if (!engageReady) {
        // Wait: idle in position while stagger delay clears
        this.setVelocityX(0);
        this.playAnim('idle');
      } else {
        this.setVelocityX(0);
        this.tryAttack(time, player);
      }

    } else {
      // ── Cooldown or not ready: shuffle in place ──────────────────────────
      const jitter = Math.sin(time * 0.004 + this.spawnX) * 0.3;
      this.setVelocityX(jitter * this.speed * 0.4);
      this.faceDirection(dir);
      if (Math.abs(jitter * this.speed * 0.4) > 15) {
        this.playAnim('walk');
      } else {
        this.playAnim('idle');
      }
    }
  }

  // ── Breathing idle animation ────────────────────────────────────────────
  updateBreathing(time) {
    if (this.isAttacking) return;
    const isMoving = Math.abs(this.body.velocity.x) > 8;
    if (isMoving) {
      this.scaleX = this.baseScaleX * this.squashX;
      this.scaleY = this.baseScaleY * this.squashY;
      return;
    }
    const breathOffset = this.spawnX % 100;
    const breath = Math.sin(time * 0.004 + breathOffset);
    this.scaleY = this.baseScaleY * this.squashY * (1 - breath * 0.012);
    this.scaleX = this.baseScaleX * this.squashX * (1 + breath * 0.010);
  }

  tryAttack(time, player) {
    if (time - this.lastAttackTime < this.attackCooldown) return;
    this.lastAttackTime = time;

    const dir = player.x > this.x ? 1 : -1;
    this.faceDirection(dir);
    if (this.type === 'enemy_archer') {
      this.shootArrow(dir);
    } else {
      this.meleeStrike(dir, player);
    }
  }

  shootArrow(dir) {
    this.isAttacking = true;
    this.setVelocityX(0);
    this.faceDirection(dir);
    this.playAnim('attack');

    const arrow = new Projectile(this.scene, this.x + 25 * dir, this.y - 55, 'projectile_arrow', 'arrow');
    this.scene.projectiles.add(arrow);
    arrow.fire(dir, 360, -60);

    this.once(`animationcomplete-archer_attack`, () => {
      this.isAttacking = false;
      this.currentAnim = '';
      this.playAnim('idle');
    });

    this.scene.time.delayedCall(600, () => {
      if (this.isAttacking) {
        this.isAttacking = false;
        this.currentAnim = '';
        this.playAnim('idle');
      }
    });
  }

  meleeStrike(dir, player) {
    this.isAttacking = true;
    this.setVelocityX(0);
    this.faceDirection(dir);
    this.playAnim('attack');

    // Lunge forward
    this.scene.tweens.add({
      targets: this,
      x: this.x + 30 * dir,
      yoyo: true,
      duration: 130
    });

    this.scene.time.delayedCall(120, () => {
      if (!this.active || !player.active) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (dist < 120) {
        player.healthSystem.takeDamage(12, dir * 180);
      }
    });

    this.scene.time.delayedCall(260, () => {
      if (!this.active) return;
      this.setVelocityX(0);
    });

    const prefix = this.type.replace('enemy_', '');
    this.once(`animationcomplete-${prefix}_attack`, () => {
      this.isAttacking = false;
      this.currentAnim = '';
      this.playAnim('idle');
    });

    this.scene.time.delayedCall(500, () => {
      if (this.isAttacking) {
        this.isAttacking = false;
        this.currentAnim = '';
        this.playAnim('idle');
      }
    });
  }

  handleDamage(amount) {
    this.aggroUntil = this.scene.time.now + 8000;
    this.hasWarned = true;
    this.playAnim('hurt');
    this.setTint(0xef4444);

    // "Call for help" — nearby idle enemies aggro when this one is hit
    if (this.scene.enemies) {
      this.scene.enemies.getChildren().forEach((other) => {
        if (other !== this && other.active && other.hasWarned === false) {
          const nearbyDist = Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y);
          if (nearbyDist < 400) {
            // Wake up nearby allies
            other.aggroUntil = this.scene.time.now + 6000;
            other.hasWarned = true;
          }
        }
      });
    }

    this.scene.time.delayedCall(120, () => {
      if (this.active) {
        this.clearTint();
        this.currentAnim = '';
        this.playAnim('idle');
      }
    });

    if (typeof window.spawnDamageParticles === 'function') {
      window.spawnDamageParticles(this.x, this.y - 40, 0xef4444, 5);
    }

    this.scene.events.emit('spawnText', {
      x: this.x, y: this.y - 50, text: `-${amount}`, color: '#fbbf24'
    });
  }

  handleDeath() {
    this._releaseFlankSide();
    this.setVelocity(0, 0);
    this.body.setEnable(false);
    this.isAttacking = false;
    this.playAnim('hurt');

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y + 10,
      duration: 700,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        if (typeof this.scene.tryDropHealthPotion === 'function') {
          this.scene.tryDropHealthPotion(this.x, this.y - 24, this.dropChance);
        }
        this.scene.events.emit('scoreAdded', this.scoreValue);
        this.destroy();
      }
    });
  }
}
