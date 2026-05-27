export default class HealthSystem {
  constructor(entity, maxHealth, onDamage, onDeath) {
    this.entity = entity;
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.isInvincible = false;
    this.invincibleDuration = 600; // ms
    this.onDamage = onDamage;
    this.onDeath = onDeath;
  }

  takeDamage(amount, knockbackX = 0) {
    if (this.isInvincible || this.health <= 0) return false;

    this.health = Math.max(0, this.health - amount);
    
    if (this.invincibleDuration > 0) {
      this.isInvincible = true;
      this.entity.scene.time.delayedCall(this.invincibleDuration, () => {
        this.isInvincible = false;
      });
    }

    if (this.onDamage) {
      this.onDamage(amount, knockbackX);
    }

    if (this.health <= 0 && this.onDeath) {
      this.onDeath();
    }

    return true;
  }

  // Apply damage silently (no onDamage callback) — used by block mechanic
  _applyDamageOnly(amount) {
    if (this.health <= 0) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0 && this.onDeath) {
      this.onDeath();
    }
  }

  heal(amount) {
    if (this.health <= 0) return 0;
    const before = this.health;
    this.health = Math.min(this.maxHealth, this.health + amount);
    return this.health - before;
  }

  getPercent() {
    return this.health / this.maxHealth;
  }
}
