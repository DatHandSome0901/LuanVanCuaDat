export default class CombatSystem {
  constructor(entity) {
    this.entity = entity;
    this.lastAttackTime = 0;
    this.lastSkillTime = 0;
    
    // Config values
    this.attackCooldown = 350; // ms
    this.skillCooldown = 5000; // ms
    this.attackDamage = 45;
    this.skillDamage = 110;
  }

  canAttack(time) {
    return time - this.lastAttackTime >= this.attackCooldown;
  }

  canUseSkill(time) {
    return time - this.lastSkillTime >= this.skillCooldown;
  }

  useAttack(time) {
    if (!this.canAttack(time)) return false;
    this.lastAttackTime = time;
    return true;
  }

  useSkill(time) {
    if (!this.canUseSkill(time)) return false;
    this.lastSkillTime = time;
    return true;
  }

  getSkillCooldownProgress(time) {
    const elapsed = time - this.lastSkillTime;
    if (elapsed >= this.skillCooldown) return 1;
    return elapsed / this.skillCooldown;
  }
}
