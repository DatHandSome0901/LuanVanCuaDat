import Phaser from 'phaser';
import HealthSystem from '../systems/HealthSystem.js';
import CombatSystem from '../systems/CombatSystem.js';
import AttackHitbox from './AttackHitbox.js';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'hero');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Size and display — scale so character is ~140px tall on screen
    this.setScale(0.60);
    this.setOrigin(0.5, 1);
    this.setDepth(30);
    // Physics body settings
    this.body.setCollideWorldBounds(true);
    // Body defined in ORIGINAL 256x256 px coords; physics scales with sprite
    // Narrower body to prevent snagging on platforms, vertical aligned to character visible area
    this.body.setSize(96, 190);
    this.body.setOffset(80, 58);
    // MaxVelocity prevents velocity from accumulating beyond intended speed
    this.body.setMaxVelocityX(320);
    // DragX: high drag value means character stops instantly when input is released
    this.body.setDragX(2400);

    // Systems
    this.healthSystem = new HealthSystem(
      this,
      200,
      (amt, kb) => this.handleDamage(amt, kb),
      () => this.handleDeath()
    );
    this.combatSystem = new CombatSystem(this);

    // State
    this.state = 'idle'; // 'idle', 'running', 'jumping', 'attacking', 'hurt', 'dead', 'blocking'
    this.isDashing = false;
    this.isBlocking = false;
    this.currentAnim = '';

    // Block shield visual
    this._blockShield = null;
    this._blockShieldTween = null;

    // Melee attack hitbox
    this.meleeHitbox = new AttackHitbox(scene, 0, 0, 56, 56);

    // Squash & Stretch
    this.baseScaleX = this.scaleX;
    this.baseScaleY = this.scaleY;
    this.squashX = 1;
    this.squashY = 1;
    this.wasAirborne = false;
    this._squashTween  = null;  // reference to active landing tween
    this._lastLandTime = -999;  // timestamp of last landing (for cooldown)
    this._lastAirVelY  = 0;     // last recorded Y velocity while airborne

    // Start idle animation
    this.playAnim('hero_idle');
  }

  playAnim(key) {
    if (this.currentAnim === key) return;
    this.currentAnim = key;
    this.play(key, true);
  }

  update(time, cursors, wasd, keys) {
    if (this.state === 'dead') return;

    const speed = 260;
    const jumpForce = -600;
    const vKeys = this.scene.virtualKeys || {};
    const isLeft   = cursors.left.isDown  || wasd.A.isDown || vKeys.left;
    const isRight  = cursors.right.isDown || wasd.D.isDown || vKeys.right;
    const isJump   = cursors.up.isDown || wasd.W.isDown || keys.space.isDown || vKeys.up;
    const isAttack = keys.J.isDown || vKeys.J;
    const isSkill  = keys.K.isDown || vKeys.K;
    const isBlock  = keys.S.isDown || vKeys.S;

    if (this.state === 'hurt' || this.isDashing) {
      this.updateSquashStretch(time);
      return;
    }

    // Block mechanic — cannot move while blocking, cancels attack state
    if (isBlock && this.state !== 'attacking' && this.body.blocked.down) {
      if (!this.isBlocking) {
        this.isBlocking = true;
        this.state = 'blocking';
        this.setVelocityX(0);
        this.playAnim('hero_idle');
        this._showBlockShield();
      } else {
        this.setVelocityX(0);
      }
      this.updateSquashStretch(time);
      return;
    }

    // Released block
    if (this.isBlocking) {
      this.isBlocking = false;
      this._hideBlockShield();
      if (this.state === 'blocking') {
        this.state = 'idle';
        this.currentAnim = '';
      }
    }

    // Movement
    if (isLeft) {
      this.setVelocityX(-speed);
      this.setFlipX(true);
    } else if (isRight) {
      this.setVelocityX(speed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    // Jump
    if (isJump && this.body.blocked.down) {
      this.isBlocking = false;
      this._hideBlockShield();
      this.setVelocityY(jumpForce);
      if (typeof window.spawnJumpParticles === 'function') {
        window.spawnJumpParticles(this.x, this.y + 24);
      }
    }

    // Attacks
    if (this.state !== 'attacking') {
      if (isAttack && this.combatSystem.useAttack(time)) {
        this.performAttack();
      } else if (isSkill && this.combatSystem.useSkill(time)) {
        this.performSkill();
      }
    }

    // Update animation based on state
    this.updateAnimState();
    this.updateSquashStretch(time);
  }

  updateAnimState() {
    if (this.state === 'attacking' || this.state === 'hurt' || this.state === 'dead' || this.state === 'blocking') return;

    const isMoving   = Math.abs(this.body.velocity.x) > 10;
    const isAirborne = !this.body.blocked.down;

    if (isAirborne) {
      this.playAnim('hero_run');
      this.state = 'jumping';
    } else if (isMoving) {
      this.playAnim('hero_run');
      this.state = 'running';
    } else {
      this.playAnim('hero_idle');
      this.state = 'idle';
    }
  }

  updateSquashStretch(time) {
    if (this.body.blocked.down) {
      if (this.wasAirborne) {
        this.wasAirborne = false;
        const landCooldown = 300; // ms — prevents physics flicker re-triggering squash
        const hadSignificantFall = this._lastAirVelY > 80; // only squash real jumps

        if (hadSignificantFall && (time - this._lastLandTime) > landCooldown) {
          this._lastLandTime = time;

          // Kill any existing squash tween FIRST to prevent multiple tweens
          // fighting each other (the root cause of landing jitter)
          if (this._squashTween) {
            this._squashTween.stop();
            this._squashTween = null;
          }

          // Reset squash multipliers immediately
          this.squashX = 1.25;
          this.squashY = 0.75;

          // Single tween springs back to neutral — only ONE tween active at a time
          this._squashTween = this.scene.tweens.add({
            targets: this,
            squashX: 1,
            squashY: 1,
            duration: 180,
            ease: 'Back.easeOut',
            onComplete: () => { this._squashTween = null; }
          });
        } else if (!hadSignificantFall) {
          // Micro-drop (walking off ledge) — just snap scale to base, no squash
          if (this._squashTween) { this._squashTween.stop(); this._squashTween = null; }
          this.squashX = 1;
          this.squashY = 1;
        }
      }
      this._lastAirVelY = 0; // reset air velocity tracker when on ground
    } else {
      this.wasAirborne = true;
      // Track maximum downward velocity while airborne
      if (this.body.velocity.y > this._lastAirVelY) {
        this._lastAirVelY = this.body.velocity.y;
      }
    }

    if (this.state === 'dead') return;

    const isAirborne = !this.body.blocked.down;
    let targetScaleX = this.baseScaleX * this.squashX;
    let targetScaleY = this.baseScaleY * this.squashY;

    if (isAirborne) {
      // Velocity-based vertical stretch in air
      const velY = this.body.velocity.y;
      const stretchFactor = Phaser.Math.Clamp(Math.abs(velY) / 1100, 0, 0.15);
      if (velY < 0) {
        targetScaleY *= (1 + stretchFactor);
        targetScaleX *= (1 - stretchFactor * 0.5);
      } else {
        targetScaleY *= (1 + stretchFactor * 0.22);
      }
    } else if (this.state === 'idle') {
      // Only idle gets gentle breathing — all other states keep exact base scale
      const breathScale = Math.sin(time * 0.005);
      targetScaleY *= (1 - breathScale * 0.012);
      targetScaleX *= (1 + breathScale * 0.012);
    }
    // running / attacking / blocking → no scale change (prevents jitter)

    this.scaleX = targetScaleX;
    this.scaleY = targetScaleY;
  }

  _showBlockShield() {
    if (this._blockShield) return;
    const g = this.scene.add.graphics();
    g.setDepth(32);
    // Outer golden shield arc
    g.lineStyle(4, 0xfbbf24, 0.9);
    const dir = this.flipX ? -1 : 1;
    g.beginPath();
    g.arc(0, 0, 38, -Math.PI * 0.6, Math.PI * 0.6, dir < 0);
    g.strokePath();
    // Inner blue glow arc
    g.lineStyle(2, 0x38bdf8, 0.7);
    g.beginPath();
    g.arc(0, 0, 30, -Math.PI * 0.5, Math.PI * 0.5, dir < 0);
    g.strokePath();
    this._blockShield = g;
    this._blockShieldTween = this.scene.tweens.add({
      targets: g,
      alpha: { from: 1, to: 0.6 },
      yoyo: true,
      repeat: -1,
      duration: 200
    });
    // Notify UIScene
    this.scene.events.emit('blockChanged', true);
  }

  _hideBlockShield() {
    if (!this._blockShield) return;
    if (this._blockShieldTween) {
      this._blockShieldTween.stop();
      this._blockShieldTween = null;
    }
    this._blockShield.destroy();
    this._blockShield = null;
    // Notify UIScene
    this.scene.events.emit('blockChanged', false);
  }

  performAttack() {
    this.state = 'attacking';
    this.setVelocityX(0);
    this.playAnim('hero_attack');

    const dir    = this.flipX ? -1 : 1;
    const rangeX = this.x + 60 * dir;
    const rangeY = this.y - 50;

    this.meleeHitbox.activate(rangeX, rangeY, 56, 56);

    // Slash visual effect
    const slash = this.scene.add.graphics();
    slash.setDepth(35);
    slash.lineStyle(5, 0x06b6d4, 0.95);
    slash.beginPath();
    if (dir > 0) {
      slash.arc(this.x + 20, this.y - 50, 44, -0.7, 0.7, false);
    } else {
      slash.arc(this.x - 20, this.y - 50, 44, Math.PI - 0.7, Math.PI + 0.7, false);
    }
    slash.stroke();

    // White inner slash
    slash.lineStyle(2, 0xffffff, 0.9);
    slash.beginPath();
    if (dir > 0) {
      slash.arc(this.x + 20, this.y - 50, 36, -0.5, 0.5, false);
    } else {
      slash.arc(this.x - 20, this.y - 50, 36, Math.PI - 0.5, Math.PI + 0.5, false);
    }
    slash.stroke();

    this.scene.tweens.add({
      targets: slash,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 180,
      onComplete: () => slash.destroy()
    });

    if (typeof window.spawnDamageParticles === 'function') {
      window.spawnDamageParticles(rangeX, rangeY, 0x38bdf8, 6);
      window.spawnDamageParticles(rangeX, rangeY, 0xffffff, 4);
    }

    // When attack anim finishes → back to idle
    this.once('animationcomplete-hero_attack', () => {
      this.meleeHitbox.deactivate();
      if (this.state === 'attacking') {
        this.state = 'idle';
        this.currentAnim = '';
        this.playAnim('hero_idle');
      }
    });

    // Safety fallback
    this.scene.time.delayedCall(500, () => {
      this.meleeHitbox.deactivate();
      if (this.state === 'attacking') {
        this.state = 'idle';
        this.currentAnim = '';
      }
    });
  }

  performSkill() {
    this.isDashing = true;
    this.healthSystem.isInvincible = true; // Invincibility during dash
    this.state = 'attacking';
    this.playAnim('hero_attack');

    const dir = this.flipX ? -1 : 1;
    this.body.setAllowGravity(false);
    this.setVelocityY(0);
    this.setVelocityX(dir * 800);

    this.meleeHitbox.activate(this.x + 50 * dir, this.y - 40, 90, 60);

    if (typeof window.spawnDamageParticles === 'function') {
      window.spawnDamageParticles(this.x, this.y - 40, 0x06b6d4, 15);
      window.spawnDamageParticles(this.x, this.y - 40, 0xffffff, 8);
    }

    this.scene.time.delayedCall(260, () => {
      this.isDashing = false;
      this.healthSystem.isInvincible = false; // Turn off invincibility
      this.body.setAllowGravity(true);
      this.setVelocityX(0);
      this.meleeHitbox.deactivate();
      this.state = 'idle';
      this.currentAnim = '';
      this.playAnim('hero_idle');
    });
  }

  handleDamage(amount, knockbackX) {
    if (this.state === 'dead') return;

    // Block reduces damage by 100% (absorbs completely) and prevents knockback
    if (this.isBlocking && this.body.blocked.down) {
      const reduced = 0;
      // Flash shield yellow on successful block
      if (this._blockShield) {
        this._blockShield.clear();
        const dir = this.flipX ? -1 : 1;
        this._blockShield.lineStyle(6, 0xfde68a, 1);
        this._blockShield.beginPath();
        this._blockShield.arc(0, 0, 40, -Math.PI * 0.65, Math.PI * 0.65, dir < 0);
        this._blockShield.strokePath();
        this.scene.time.delayedCall(180, () => {
          if (this._blockShield) {
            this._blockShield.clear();
            const d2 = this.flipX ? -1 : 1;
            this._blockShield.lineStyle(4, 0xfbbf24, 0.9);
            this._blockShield.beginPath();
            this._blockShield.arc(0, 0, 38, -Math.PI * 0.6, Math.PI * 0.6, d2 < 0);
            this._blockShield.strokePath();
          }
        });
      }
      this.scene.events.emit('spawnText', {
        x: this.x, y: this.y - 60, text: `ĐỠ HOÀN TOÀN!`, color: '#fbbf24'
      });
      if (typeof window.spawnDamageParticles === 'function') {
        window.spawnDamageParticles(this.x, this.y - 50, 0xfbbf24, 8);
      }
      // Since damage is 0, we don't apply damage to health system
      this.scene.cameras.main.shake(60, 0.001); // very light shake for impact feedback
      return;
    }

    this.isBlocking = false;
    this._hideBlockShield();
    this.state = 'hurt';
    this.playAnim('hero_hurt');
    this.setTint(0xef4444);
    this.setVelocityX(knockbackX);
    this.setVelocityY(-220);

    this.scene.cameras.main.shake(100, 0.005);
    if (typeof window.spawnDamageParticles === 'function') {
      window.spawnDamageParticles(this.x, this.y - 40, 0x991b1b, 12);
    }

    this.scene.events.emit('spawnText', {
      x: this.x, y: this.y - 60, text: `-${amount} MÁU`, color: '#ef4444'
    });

    this.scene.time.delayedCall(400, () => {
      this.clearTint();
      if (this.state === 'hurt') {
        this.state = 'idle';
        this.currentAnim = '';
        this.playAnim('hero_idle');
      }
    });

    this.scene.events.emit('healthChanged', this.healthSystem.health);
  }

  handleDeath() {
    this.state = 'dead';
    this.setVelocity(0, 0);
    this.body.setEnable(false);
    this.playAnim('hero_dead');

    this.scene.time.delayedCall(800, () => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 600,
        onComplete: () => {
          this.scene.events.emit('playerKilled');
        }
      });
    });
  }
}
