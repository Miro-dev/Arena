const Fighter = require("./fighterClass").Fighter;
const Logger = require("../../server").Logger;

class Rogue extends Fighter {
  constructor(name, str, agi, armor) {
    super(name, str, agi, armor);
    this.counterChance = 6;
    this.staminaSkillExpenditure = 13;
    // Skills <
    this.Crit = false;
    this.Counter = false;
    this.BlockJuke = false;
    this.GutHit = false;
    // Sills >
  }

  counter() {
    if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
      let chance = Math.floor(Math.random() * 10) + 1 + this.stanceStat.sum;
      Logger.push(
        `Chance Counter of ${this.name} = ${chance} Needs >=${this.counterChance}`
      );
      if (chance >= 6) {
        this.Counter = true;
      } else {
        this.Counter = false;
      }
    } else {
      this.Counter = false;
      Logger.push(this.name + " Not enough Stamina to Counter!");
    }
  }

  crit() {
    if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
      let chance = Math.floor(Math.random() * 10) + this.stanceStat.sum;
      Logger.push(
        `Chance Crit of ${this.name} = ${chance} Needs >=${this.counterChance}`
      );
      if (chance >= 6) {
        let dmg = ((this.agi * chance) / 2) * this.stance;
        Logger.push("Crit: " + dmg);
        this.Crit = dmg;
      } else {
        this.Crit = false;
      }
    } else {
      this.Crit = false;
      Logger.push(this.name + " Not enough Stamina to Crit!");
    }
  }

  blockJuke(opponent) {
    if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
      let chance = Math.floor(Math.random() * 10) + this.stanceStat.sum;
      let opponentBlock = opponent.Block.block;
      Logger.push(
        `Chance Block Juke of ${this.name} = ${chance} Needs >=6 and ${(this
          .Accuracy.accuracy +
          this.Quickness.quickness) *
          this.stance} > ${opponent.Block.block}`
      );
      if (
        chance >= 6 &&
        (this.Accuracy.accuracy + this.Quickness.quickness) * this.stance >
          opponent.Block.block
      ) {
        Logger.push(
          `Block Distortion! ${opponentBlock} => ${opponentBlock / 1.5}`
        );
        this.BlockJuke = true;
      } else {
        this.BlockJuke = false;
      }
    } else {
      this.BlockJuke = false;
      Logger.push(this.name + " Not enough Stamina to Block Juke!");
    }
  }

  gutHit(opponent) {
    if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
      if (this.BlockJuke || this.effects.hasOwnProperty("counter")) {
        let chance = Math.floor(Math.random() * 10) + this.stanceStat.sum;
        Logger.push(
          `Chance Gut Hit of ${this.name} = ${chance} Needs >=6 and ${this.BlockJuke} or ${this.Counter}`
        );
        if (chance >= 6) {
          this.GutHit = {
            dmg: this.Hit.dmg / 2,
            stamina: this.Hit.dmg * 3,
            turnsBase: 2
          };
        } else {
          this.GutHit = false;
          hits.hitEffect = {};
          hits.hitEffect.hit = hits.Hit;
          Logger.push(this.name + " No chance to GutHit!");
        }
      } else {
        this.GutHit = false;
        hits.hitEffect = {};
        hits.hitEffect.hit = hits.Hit;
        Logger.push(this.name + " No BlockJuke or Counter to GutHit!");
      }
    } else {
      this.GutHit = false;
      Logger.push(this.name + " Not enough Stamina to GutHit!");
    }
  }
}

module.exports = { Rogue: Rogue };
