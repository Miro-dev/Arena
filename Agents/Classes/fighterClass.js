const Logger = require("../../server").Logger;
const roundToTwo = require("../../Helper Functions/helperFunctions").roundToTwo;

// TO BE DONE < --------------------------------------------------------------------

// Parry and Block may not be clean

// Defense of Vulnaribilities - Linked with Defense, Armor Stat, Mastery

// After Parry - effect = -Defense

// Deflect = a mix between a Parry and Dodge ( attacker Out of Balance/2)

// Attack Force to stop an Attack? Faint
// Types of attack - Powerful F3 Q3 / Medium F+2 Q-2 / Fast F+1 Q-1 / Fast Safe Probing / Faint / Block Distortion / Directed Vulnaribility Hunt

// Initiatitve - increases Attack, Speed / lowers Defense, Accuracy ( gets filled after
//      one NOT parried attack and stopped after parry, turns around after a riposte)

// Quickness *
// Accuracy - vulnerability find (Crit)
// Mastery - faint (block juke) / mistakes / parry / riposte
// Opponent Knowledge
// Defence Stat
// Attack Stat
// DMG = Force
// Physical State - Out of Balance, Blinded, Crippled, Attacking (right after an attack), Defending (right after a defend)
// Mental State - Shacken, Bashed, Dazed, Fear, Brave Heart, Faithful, Rage, Calm, Iron Heart, Despair

// Action = Attack / Defense / Opponent Knowledge

// First Action => Quickness + Opponent Knowledge + Mastery ~ Who does the first action
// Second Action => Quickness + Mastery + Opponent Knowledge ~ Defense - Block / Parry / Dodge || Attack - Fast / Medium / Slow
// Third Action => Quickness + Mastery + Opponent Knowledge ~ Does he Continue / Stop / Change Action

// Implementation of combos: continuation of an attack or action after successful defend action

// TO BE DONE > --------------------------------------------------------------------

class Fighter {
  constructor(name, strength, agility, armor) {
    this.Vulnaribilities = 20;
    this.Defense = 40;
    this.Defense = 30;
    this.Mastery = 60;

    this.Initiative = 100;

    this.name = name;

    this.armor = armor;

    this.strength = strength;
    this.agility = agility;

    this.baseHealth = this.str * 18 + this.agi * 9;
    this.currentHealth = this.baseHealth;

    this.blockMultiplier = 1.8;
    this.blockChance = 3;
    this.blockHealth = this.str * 200;

    this.baseStamina = this.str * 120 + this.agi * 90;
    this.currentStamina = this.baseStamina;
    this.staminaRegen = Math.round(this.agi * 10 + this.str * 10);

    this.staminaSkillExpenditure = 10; // this will change according to skill used

    this.stanceStat = { multiplier: 2, sum: 0 };
    this.state = false;

    this.effects = {};
    this.effects.state = ["Brave!", 0];

    this.hitEffect = {};

    this.Hit = false;
    this.Dodge = false;
    this.Block = false;
    this.Parry = false;
    this.Quickness = false;
    this.Accuracy = 0;
  }

  stanceSum(multiplier) {
    // Logger.push("StanceSum Multiplier: " + multiplier)
    // if (multiplier <= 0.5) {
    //     this.stanceStat.sum = -3
    // } else if (multiplier > 0.5 && multiplier <= 0.7) {
    //     this.stanceStat.sum = -2
    // } else if (multiplier > 0.7 && multiplier <= 0.9) {
    //     this.stanceStat.sum = -1
    // } else if (multiplier > 0.9 && multiplier <= 1.1) {
    //     this.stanceStat.sum = 0
    // } else if (multiplier > 1.1 && multiplier <= 1.3) {
    //     this.stanceStat.sum = 1
    // } else if (multiplier > 1.3 && multiplier <= 1.5) {
    //     this.stanceStat.sum = 2
    // } else if (multiplier > 1.7 && multiplier <= 2) {
    //     this.stanceStat.sum = 3
    // }
    if (this.effects.state == "Faithful!") {
      this.stanceStat.sum += 1;
    }

    if (this.stance < 0.5) {
      this.stanceStat.multiplier = 0.5;
    }

    if (this.stance > 2) {
      this.stanceStat.multiplier = 2;
    }

    if (multiplier < 1) {
      this.stanceStat.sum = -2;
    } else if (multiplier >= 1 && multiplier <= 1.5) {
      this.stanceStat.sum = -1;
    } else if (multiplier > 1.5) {
      this.stanceStat.sum = 0;
    }
  }

  regainStance_Stamina() {
    // Needs separation of StaneRegen and StaminaRegen
    if (this.stance != 2) {
      this.stance += 0.5;
      if (this.stance > 2) {
        this.stanceStat.multiplier = 2;
      }
      Logger.push(this.name + " regained Stance!");
    }

    if (this.curStamina != this.baseStamina) {
      this.curStamina = { value: this.staminaRegen, source: "Regen" };
      if (this.effects.state == "Faithful!") {
        // Why is this here?!
        this.curStamina = {
          value: this.staminaRegen,
          source: "Regen Faithful"
        };
      }
    }
  }

  get health() {
    return this.currentHealth;
  }

  set health(value) {
    if (Math.sign(value) === -1) {
      value = Math.abs(value);
      if (this.armor < value) {
        let bleed = this.armor - value;
        this.armor = 0;
        this.currentHealth += bleed;
        Logger.push("Damage done: " + bleed + " to " + this.name);
        this.curStamina = { value: bleed * 2, source: "DMG from Health" };
        this.stateRoll();
      } else {
        this.armor -= value;
        Logger.push("Damage done to armor: " + value + " to " + this.name);
      }
    } else {
      let margin = this.currentHealth + value;
      if (margin > this.baseHealth) {
        let healMax = Math.round(
          value - (this.baseHealth - this.currentHealth)
        );
        this.currentHealth = this.baseHealth;
        this.currentHealth += Math.round(healMax / 3);
        Logger.push(
          "Max Heal! " + Math.round(healMax / 3) + " out of " + value
        );
      } else {
        Logger.push("Health Restored: " + value);
        this.currentHealth += Math.round(value);
      }
    }
  }

  get curStamina() {
    return this.currentStamina;
  }

  set curStamina(valueObj) {
    let value = valueObj.value;
    value = Math.round(value);
    if (Math.sign(value) === -1) {
      this.currentStamina += value;
      Logger.push(
        `${value} Stamina Depleted from ${this.name} due to ${valueObj.source}.`
      );
      if (this.currentStamina < 0) {
        this.currentStamina = 0;
      }
    } else {
      this.currentStamina += value;
      Logger.push(value + " Stamina Regained to " + this.name);
      if (this.currentStamina > this.baseStamina) {
        this.currentStamina = this.baseStamina;
      }
    }
    this.currentStamina = Math.round(this.currentStamina);
  }

  get agi() {
    // Logger.push(this.agility)
    return this.agility;
  }

  set agi(value) {
    // Logger.push(value)
    this.agility += value;
  }

  get str() {
    // Logger.push(this.agility)
    return this.strength;
  }

  set str(value) {
    // Logger.push(value)
    this.strength += value;
  }

  get stance() {
    return this.stanceStat.multiplier;
  }

  set stance(value) {
    this.stanceStat.multiplier = value;
  }

  accuracy() {
    let mix = Math.round((this.agi * this.str * this.stance) / 2);
    let max = Math.round(Math.round(mix * 2));
    let min = mix;

    let accuracy = Math.floor(Math.random() * (max - min)) + min;
    this.Accuracy = { accuracy: accuracy, max: max, min: min };
  }

  hitRoll() {
    let mix = Math.round((this.str * 6 + this.agi * 3) * this.stance);
    let max = Math.round(mix * 1.2);
    let min = mix;

    let dmg =
      Math.floor(Math.random() * (max - min)) + min + this.stanceStat.sum;
    if (this.curStamina - dmg > 0) {
      this.Hit = { dmg: dmg, max: max, min: min, turnsBase: 1 };
    } else {
      Logger.push(this.name + " Not Enough Stamina to Hit!");
      this.Hit = { dmg: 0, max: max, min: min, turnsBase: 1 };
    }
  }

  blockRoll() {
    let mix = Math.round(
      (this.str * 4 + this.agi * 2) * this.blockMultiplier * this.stance
    );
    let max = Math.round(mix * 1.5);
    let min = mix;

    let chance = Math.floor(Math.random() * 10) + 1 + this.stanceStat.sum;
    let block = Math.floor(Math.random() * (max - min)) + min;
    if (chance >= this.blockChance && this.blockHealth > 0) {
      this.Block = { block: block, max: max, min: min };
    } else if (chance >= 8 && this.blockHealth > 0) {
      this.Block = { block: block, max: max, min: min };
      this.blockHealth = this.str * 50;
    } else {
      this.Block = { block: false, max: max, min: min };
      Logger.push("Block false from BlockRoll of " + this.name);
    }
    Logger.push(
      `Chance Block of ${this.name} = ${chance} Needs >=${this.blockChance}`
    );
  }
  // Testing Parry functinality
  // Opponent Dependant <
  parryRoll(hits) {
    if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
      let parryChance = Math.round(
        ((hits.agi + hits.str) / (this.str + this.agi)) * 10
      );
      let max = 20;
      let min = 1;
      let parryR =
        Math.floor(Math.random() * (max - min)) +
        min +
        this.stanceStat.sum * 0.5;
      let riposteMargin = (max - parryChance) / 2 + parryChance;
      Logger.push(`${this.name} needs more than ${parryChance} to Parry and more than ${riposteMargin} to Riposte. 
            Gets ${parryR} for ${parryChance}/${riposteMargin}!`);
      if (parryChance <= parryR || parryChance > 20) {
        if (parryR >= riposteMargin) {
          // Parry + Riposte
          this.Parry = { parry: true, riposte: true, turnsBase: 1 };
        } else {
          // Only Parry
          this.Parry = { parry: true, riposte: false, turnsBase: 1 };
        }
      } else {
        this.Parry = { parry: false, riposte: false, turnsBase: 1 };
      }
    } else {
      this.Parry = { parry: false, riposte: false, turnsBase: 1 };
      Logger.push(this.name + " Not Enough Stamina to Parry");
    }
  }

  deflectRoll(hits) {
    // Deflect works like opponent strikes with power and his power is used against him
    // Connect Force with Deflect
    // Decisions when what Force to use!
    if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
      let deflectChance = Math.round(
        ((hits.agi + hits.str) / (this.str + this.agi)) * 10
      );
      let max = 20;
      let min = 1;
      let parryR =
        Math.floor(Math.random() * (max - min)) +
        min +
        this.stanceStat.sum * 0.5;
      let riposteMargin = (max - parryChance) / 2 + parryChance;
      Logger.push(`${this.name} needs more than ${parryChance} to Parry and more than ${riposteMargin} to Riposte. 
            Gets ${parryR} for ${parryChance}/${riposteMargin}!`);
      if (parryChance <= parryR || parryChance > 20) {
        if (parryR >= riposteMargin) {
          // Parry + Riposte
          this.Parry = { parry: true, riposte: true, turnsBase: 1 };
        } else {
          // Only Parry
          this.Parry = { parry: true, riposte: false, turnsBase: 1 };
        }
      } else {
        this.Parry = { parry: false, riposte: false, turnsBase: 1 };
      }
    } else {
      this.Parry = { parry: false, riposte: false, turnsBase: 1 };
      Logger.push(this.name + " Not Enough Stamina to Parry");
    }
  }
  // Opponent Dependant >

  dodgeRoll() {
    let mix = Math.round(this.agi * 3.5 * this.stance);
    let max = Math.round(Math.round(mix * 2));
    let min = mix;
    if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
      let dodge = Math.round(
        Math.floor(Math.random() * (max - min)) + min + this.stanceStat.sum
      );

      this.Dodge = { dodge: dodge, max: max, min: min, turnsBase: 1 };
    } else {
      Logger.push(this.name + " Not Enough Stamina to Dodge");
      this.Dodge = { dodge: 0, max: max, min: min, turnsBase: 1 };
    }
  }

  quicknessRoll() {
    let max = Math.round(35 + this.agi * this.stance);
    let min = Math.round(1 + this.agi * this.stance);
    let quickness =
      Math.floor(Math.random() * (max - min)) + min + this.stanceStat.sum;
    if (this.curStamina < quickness * 2) {
      this.curStamina = { value: -quickness, source: "Quickness low Stamina" };
      quickness /= 2;
    } else {
      this.curStamina = { value: -quickness * 2, source: "Quickness" };
    }

    this.Quickness = { quickness: quickness, max: max, min: min };
  }

  stateRoll() {
    if (this.currentHealth == this.baseHealth) {
      this.effects.state = "Brave!";
    } else if (
      this.currentHealth < this.baseHealth * 0.4 &&
      this.effects.state[0] != "Rage!" &&
      this.effects.state[0] != "Despair!"
    ) {
      let chance = Math.floor(Math.random() * 11);
      if (chance >= 5) {
        this.effects.state = ["Rage!", 1];
      } else {
        this.effects.state = ["Despair!", 1];
      }
      // 0/1 means not triggered, 1/2 means it's triggered and it shouldn't change
    } else if (
      this.currentHealth < this.baseHealth * 0.7 &&
      this.effects.state[0] != "Faithful!" &&
      this.effects.state[0] != "Fearful!"
    ) {
      let chance = Math.floor(Math.random() * 11);
      if (chance >= 5) {
        this.effects.state = ["Faithful!", 0];
      } else {
        this.effects.state = ["Fearful!", 0];
      }
      // 0 means not triggered, 1 means it's triggered and it shouldn't change
    }
  }

  doBeforeEffects() {
    console.log(Logger + " Log From fighterClass");
    if (this.currentStamina <= 0 && this.effects.state != "Faithful!") {
      this.effects.exhaust = { value: true, turnsBase: 3 };
    }

    for (let key in this.effects) {
      if (this.effects.hasOwnProperty(key)) {
        switch (key) {
          case "state":
            Logger.push(`${this.name} is ${this.effects[key][0]}`);
            if (
              this.effects[key][0] === "Faithful!" &&
              this.effects[key][1] != 1
            ) {
              Logger.push(`${this.name} became Faithful!`);
              this.str = 2;
              this.agi = 2;
              this.effects[key][1] = 1;
            } else if (
              this.effects[key][0] === "Fearful!" &&
              this.effects[key][1] != 1
            ) {
              Logger.push(`${this.name} became Fearful!`);
              this.str = -2;
              this.agi = -2;
              this.effects[key][1] = 1;
            } else if (
              this.effects[key][0] === "Rage!" &&
              this.effects[key][1] != 2
            ) {
              Logger.push(`${this.name} became Enraged!`);
              this.str = 4;
              this.agi = 4;
              this.effects[key][1] = 2;
            } else if (
              this.effects[key][0] === "Despair!" &&
              this.effects[key][1] != 2
            ) {
              Logger.push(`${this.name} became Desperate!`);
              this.str = -2;
              this.agi = -2;
              this.effects[key][1] = 2;
            }

            break;

          case "shieldBash":
            if (this.effects[key].turns === undefined) {
              // Initial Effect
              Logger.push(`${this.name} affected by ${key} BeforeEffects`);
              this.effects[key].turns = this.effects[key].turnsBase;
              this.effects[key].turns -= 1;
              this.stance -= 1;
              this.str = -2; // Fix later with opponent str
              this.agi = -2; // Fix later with opponent str
            } else if (this.effects[key].turns <= 0) {
              // Deleteion
              this.str = 2; // Fix later with opponent str
              this.agi = 2; // Fix later with opponent str
              delete this.effects[key];
            } else if (this.effects[key].turns < this.effects[key].turnsBase) {
              // Add turnsBase to all Effects
              // Standing Effect
              if (this.stance > 1) {
                this.stanceStat.multiplier = 1;
              }

              this.effects[key].turns -= 1;
            }
            break;

          // case "riposte":
          //     if (this.effects[key].turns === undefined) {
          //         // Initial Effect
          //         this.effects[key].turns = this.effects[key].turnsBase

          //         Logger.push(`${this.name} affected by ${key}`)
          //         this.stance -= 0.5

          //     } else if (this.effects[key].turns <= 0){
          //         // Deleteion
          //         delete this.effects[key]
          //     } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
          //         // Standing Effect
          //         Logger.push("Standing Effect " + key)
          //     }

          //     break;

          case "hit":
            if (this.effects[key].turns === undefined) {
              // Initial Effect
              this.stance -= 0.3;
              Logger.push(`${this.name} affected by ${key} BeforeEffects`);
              if (this.effects[key].dmg > this.baseHealth / 2) {
                Logger.push(
                  `${this.name} affected by ${key} Stun BeforeEffects!`
                );
                this.str = -1;
                this.agi = -1;
                this.stance -= 1;
                this.effects[key].turns = this.effects[key].stun = true;
              }
            } else if (this.effects[key].turns <= 0) {
              // Deleteion
              if (this.effects[key].stun == true) {
                this.str = 1;
                this.agi = 1;
              }
              delete this.effects[key];
            } else if (this.effects[key].turns < this.effects[key].turnsBase) {
              // Add turnsBase to all Effects
              // Standing Effect
              Logger.push("Standing Effect BeforeEffects " + key);
            }

            break;

          case "blockShatter":
            if (this.effects[key].turns === undefined) {
              // Initial Effect
              this.effects[key].turns = this.effects[key].turnsBase;
              this.effects[key].turns -= 1;

              Logger.push(`${this.name} affected by ${key} BeforeEffects.`);
              this.stance -= 0.5;
              this.blockMultiplier -= 0.5;
              this.blockChance += 1;
            } else if (this.effects[key].turns <= 0) {
              // Deleteion
              this.blockMultiplier += 0.5;
              this.blockChance -= 1;

              delete this.effects[key];
            } else if (this.effects[key].turns < this.effects[key].turnsBase) {
              // Standing Effect
              this.effects[key].turns -= 1;
            }

            break;

          // case "dodge":
          //     if (this.effects[key].turns === undefined) {
          //         // Initial Effect
          //         this.effects[key].turns = this.effects[key].turnsBase
          //         this.effects[key].turns -= 1

          //         Logger.push(`${this.name} affected by ${key} BeforeEffects`)
          //         this.stance -= 0.3
          //         this.curStamina = -this.Hit.dmg/2

          //     } else if (this.effects[key].turns <= 0){
          //         // Deleteion
          //         delete this.effects[key]
          //     } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
          //         // Standing Effect
          //         Logger.push("Standing Effect BeforeEffects " + key)
          //         this.effects[key].turns -= 1
          //     }
          //     break;

          case "gutHit":
            if (this.effects[key].turns === undefined) {
              // Initial Effect
              // this.effects[key].turns = this.effects[key].turnsBase

              Logger.push(`${this.name} affected by ${key} BeforeEffects`);
              if (this.stance > 1) {
                this.stanceStat.multiplier = 1;
              }
              this.staminaRegen = 0;

              this.str = -2; // Fix later with opponent str
              this.agi = -2; // Fix later with opponent str
              // } else if (this.effects[key].turns <= 0){
              //     // Deleteion
              //     this.str += 2 // Fix later with opponent str
              //     this.agi += 2 // Fix later with opponent str
              //     delete this.effects[key]
            } else if (this.effects[key].turns < this.effects[key].turnsBase) {
              // Add turnsBase to all Effects
              // Standing Effect
              Logger.push("Standing Effect BeforeEffects " + key);
              if (this.stance > 1) {
                this.stanceStat.multiplier = 1;
              }
            }

            break;

          case "exhaust":
            if (this.effects[key].turns === undefined) {
              // Initial Effect
              this.effects[key].turns = this.effects[key].turnsBase;
              this.effects[key].turns -= 1;

              Logger.push(`${this.name} affected by ${key} BeforeEffects`);
              if (this.stance > 1) {
                this.stanceStat.multiplier = 1;
              }
              this.staminaRegen *= 3;
            } else if (this.effects[key].turns <= 0) {
              // Deleteion
              delete this.effects[key];
              this.staminaRegen /= 3;
            } else if (this.effects[key].turns < this.effects[key].turnsBase) {
              // Add turnsBase to all Effects
              // Standing Effect
              Logger.push("Standing Effect BeforeEffects " + key);
              if (this.stance > 1) {
                this.stanceStat.multiplier = 1;
              }

              this.effects[key].turns -= 1;
            }

            break;

          default:
            break;
        }
      }
    }
  }

  doActions() {
    this.blockMultiplier = roundToTwo(this.blockMultiplier);
    this.stanceStat.multiplier = roundToTwo(this.stance);
    this.stanceSum(this.stance);
    this.quicknessRoll();
    this.accuracy();
    this.hitRoll();
    this.dodgeRoll();
    this.blockRoll();
  }

  doAfterEffects() {
    for (let key in this.effects) {
      if (this.effects.hasOwnProperty(key)) {
        switch (key) {
          case "shieldDeflect":
            if (this.effects[key].turns === undefined) {
              // Initial Effect
              Logger.push(`${this.name} affected by ${key} AfterEffects`);
              this.effects[key].turns = this.effects[key].turnsBase;
              this.effects[key].turns -= 1;
              this.Dodge.dodge /= 2;
              this.Quickness.quickness /= 2;
            } else if (this.effects[key].turns <= 0) {
              // Deleteion
              delete this.effects[key];
            } else if (
              this.effects[key].turns < this.effects[key].value.turnsBase
            ) {
              // Add turnsBase to all Effects
              // Standing Effect
              this.effects[key].turns -= 1;
            }

            break;

          case "parry":
            if (this.effects[key].turns === undefined) {
              // Initial Effect
              Logger.push(`${this.name} affected by ${key}`);
              this.effects[key].turns = this.effects[key].turnsBase;
              this.effects[key].turns -= 1;
              this.Quickness.quickness = Math.round(
                this.Quickness.quickness / 1.5
              );
            } else if (this.effects[key].turns <= 0) {
              // Deleteion
              delete this.effects[key];
            } else if (this.effects[key].turns < this.effects[key].turnsBase) {
              // Add turnsBase to all Effects
              // Standing Effect
              this.effects[key].turns -= 1;
            }
            break;

          case "riposte":
            if (this.effects[key].turns === undefined) {
              // Initial Effect
              this.effects[key].turns = this.effects[key].turnsBase;
              this.effects[key].turns -= 1;

              Logger.push(`${this.name} affected by ${key} AfterEffects`);
              this.Accuracy.accuracy *= 2;
              this.Quickness.quickness *= 2;
            } else if (this.effects[key].turns <= 0) {
              // Deleteion
              delete this.effects[key];
            } else if (this.effects[key].turns < this.effects[key].turnsBase) {
              // Add turnsBase to all Effects
              // Standing Effect
              Logger.push("Standing Effect AfterEffects " + key);
              this.effects[key].turns -= 1;
            }

            break;

          case "gutHit":
            if (this.effects[key].turns === undefined) {
              // Initial Effect
              this.effects[key].turns = this.effects[key].turnsBase;
              this.effects[key].turns -= 1;

              Logger.push(`${this.name} affected by ${key} AfterEffects`);
              this.Quickness.quickness /= 2;
              this.Dodge.dodge /= 2;
            } else if (this.effects[key].turns <= 0) {
              // Deleteion
              this.str = 2;
              this.agi = 2;
              this.staminaRegen = Math.round(this.agi * 5 + this.str * 2);
              delete this.effects[key];
            } else if (this.effects[key].turns < this.effects[key].turnsBase) {
              // Add turnsBase to all Effects
              // Standing Effect
              Logger.push("Standing Effect " + key);
              this.Quickness.quickness /= 2;
              this.Dodge.dodge = 0;
              this.str = 1; // Fix later with opponent str
              this.agi = 1; // Fix later with opponent str

              this.effects[key].turns -= 1;
            }

            break;

          case "counter":
            if (this.effects[key].turns === undefined) {
              // Initial Effect
              this.effects[key].turns = this.effects[key].turnsBase;
              this.effects[key].turns -= 1;

              Logger.push(`${this.name} affected by ${key} AfterEffects`);
              this.Accuracy.accuracy *= 2;
              this.Quickness.quickness *= 2;
              Logger.push(`${this.name} dmg + ${this.Hit.dmg / 2}`);
              this.Hit.dmg *= 1.5;
            } else if (this.effects[key].turns <= 0) {
              // Deleteion
              delete this.effects[key];
            } else if (this.effects[key].turns < this.effects[key].turnsBase) {
              // Add turnsBase to all Effects
              // Standing Effect
              Logger.push("Standing Effect AfterEffects " + key);
              this.effects[key].turns -= 1;
            }

            break;

          default:
            break;
        }
      }
    }
    this.blockMultiplier = roundToTwo(this.blockMultiplier);
    this.stanceStat.multiplier = roundToTwo(this.stance);
    this.stanceSum(this.stance);
  }
}
module.exports.Fighter = Fighter;
module.exports.logArray = Logger;
