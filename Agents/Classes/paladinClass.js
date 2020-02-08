const Fighter = require("./fighterClass").Fighter;
const Logger = require("../../server").Logger;

class Paladin extends Fighter {
  constructor(name, str, agi, armor) {
    super(name, str, agi, armor);
    this.blockChance = 2;
    this.blockMultiplier = 1.8;
    this.staminaSkillExpenditure = 7;
    // Skills <
    this.ShieldBash = false;
    this.ShieldDeflect = false;
    // Skills >
  }

  get stance() {
    return this.stanceStat.multiplier;
  }

  set stance(value) {
    // value is stance +- num
    let difference = Math.abs(value) - this.stance;
    if (difference < 0) {
      difference /= 2;
    }
    this.stanceStat.multiplier = this.stance + difference;
  }

  heal() {
    if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
      let chance = Math.floor(Math.random() * 10) + this.stanceStat.sum;
      Logger.push(`Chance Heal of ${this.name} = ${chance} Needs >=5`);
      if (chance >= 6) {
        this.Heal = true;
      } else {
        this.Heal = false;
      }
    } else {
      this.Heal = false;
      Logger.push(this.name + " Not enough Stamina to Heal!");
    }
  }

  shieldBash(opponent) {
    if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
      if (opponent.effects.hasOwnProperty("shieldDeflect")) {
        let chance = Math.floor(Math.random() * 10) + 1 + this.stanceStat.sum;
        Logger.push(`Chance Shield Bash of ${this.name} = ${chance} Needs >=5`);
        if (chance >= 5) {
          this.curStamina = -Math.round(this.baseStamina / 5);
          this.Hit.dmg /= 3;
          this.ShieldBash = { dmg: Math.round(this.Hit.dmg / 2), turnsBase: 2 };
        } else {
          this.ShieldBash = false;
          hits.hitEffect = {};
          hits.hitEffect.hit = hits.Hit;
        }
      } else {
        this.ShieldBash = false;
        hits.hitEffect = {};
        hits.hitEffect.hit = hits.Hit;
      }
    } else {
      this.ShieldBash = false;
      Logger.push(this.name + " Not enough Stamina to Shield Bash!");
    }
  }

  // Opponent Dependant <
  shieldDeflect(dmg, block) {
    if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
      let blockToDmg = block - dmg;
      let chance = Math.floor(Math.random() * 10) + 1 + this.stanceStat.sum;
      Logger.push(
        `Chance Shield Deflect of ${
          this.name
        } = ${chance} Needs >=7 BlockToDmg is with sign ${Math.sign(
          blockToDmg
        )}, and it is ${blockToDmg} > ${block / 2}`
      );
      if (
        chance >= 7 &&
        Math.sign(blockToDmg) !== -1 &&
        blockToDmg > block / 2
      ) {
        this.ShieldDeflect = { turnsBase: 1 };
      } else {
        this.ShieldDeflect = false;
      }
    } else {
      this.ShieldDeflect = false;
      Logger.push(this.name + " Not enough Stamina to Shield Deflect!");
    }
  }
  // Opponent Dependant >
}

module.exports = {
  Paladin: Paladin
};
