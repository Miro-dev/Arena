// Here the actions take place for now and the main battle() function

const Rogue = require("./Agents/Classes/rogueClass").Rogue;
const Paladin = require("./Agents/Classes/paladinClass").Paladin;

const Logger = require("./server").Logger;

const helperFunctions = require("./Helper Functions/helperFunctions");

const heal_Fighter = helperFunctions.heal_Fighter;
const conclusion = helperFunctions.conclusion;
const blockShatter = helperFunctions.blockShatter;

// const roundToTwo = require('./Helper Functions/helperFunctions')

// module.exports = testBlockShatter
// Edited From GitHub
// Mix in effects from HP and Stamina
// Fix does???Heal
// Fix str agi from states and effects
// Fix states changing

// function testBlockShatter () {
//     // Fix Block depletion after break to correspond to Block.block
//     const PaladinTest = new Paladin("Test1", 11, 5, 0);
//     const FighterTest = new Fighter("Test2", 11, 5, 0);
//     return [PaladinTest.curStamina, PaladinTest.blockHealth, PaladinTest.health]
// }

// Make str and agi bigger values

function battleHit(Fighter1, Fighter2) {
  Fighter1.doBeforeEffects();
  Fighter2.doBeforeEffects();

  Fighter1.doActions();
  Fighter2.doActions();

  Fighter1.doAfterEffects();
  Fighter2.doAfterEffects();

  if (Fighter1.Hit.dmg == 0 && Fighter2.Hit.dmg > 0) {
    defs = Fighter1;
    hits = Fighter2;
  } else if (Fighter2.Hit.dmg == 0 && Fighter1.Hit.dmg > 0) {
    defs = Fighter2;
    hits = Fighter1;
  } else if (Fighter2.Hit.dmg == 0 && Fighter1.Hit.dmg == 0) {
    Fighter2.regainStance_Stamina();
    Fighter1.regainStance_Stamina();
    Fighter1.curStamina = {
      value: Fighter1.staminaRegen * 3,
      source: "Regen Rest"
    };
    Fighter2.curStamina = {
      value: Fighter2.staminaRegen * 3,
      source: "Regen Rest"
    };
    Logger.push("Rest!");
    return;
  } else if (Fighter1.Quickness.quickness > Fighter2.Quickness.quickness) {
    defs = Fighter2;
    hits = Fighter1;
  } else if (Fighter1.Quickness.quickness === Fighter2.Quickness.quickness) {
    Logger.push("Clash!");
    let dmgClash = Fighter1.Hit.dmg - Fighter2.Hit.dmg;
    if (Math.sign(dmgClash) === -1) {
      Fighter1.health = dmgClash;
      Fighter1.stance -= 0.5;
    } else if (dmgClash < 20 && dmgClash > 0) {
      Logger.push("Equal!");
    } else {
      Fighter2.health = -dmgClash;
      Fighter2.stance -= 0.5;
    }
    return;
  } else {
    defs = Fighter1;
    hits = Fighter2;
  }

  hits.hitEffect = {};
  defs.hitEffect = {};
  hits.hitEffect.hit = hits.Hit;
  defs.hitEffect.hit = defs.Hit;

  Logger.push(
    hits.name +
      " " +
      hits.Quickness.quickness +
      " ==> " +
      defs.Quickness.quickness +
      " " +
      defs.name
  );

  // Checks <
  defs.parryRoll(hits);

  let doesDefDodge = defs.Dodge.dodge > hits.Accuracy.accuracy;
  let isHitsFast = hits.Quickness.quickness / 2 > defs.Quickness.quickness;
  let hitsPercentHP = hits.basehealth * 0.5;
  let defsPercentHP = defs.basehealth * 0.5;
  let doesHitsHealFast =
    hits.baseHealth < hitsPercentHP && hits instanceof Paladin;
  // Checks >

  // Instances <
  if (hits instanceof Rogue) {
    hits.blockJuke(defs);
    if (hits.BlockJuke) {
      defs.Block.block = defs.Block.block / 1.5;
      // blockDmg = defs.Block.block - hits.hitEffect[Object.keys(hits.hitEffect)].dmg;
      // doesBlockShatter = Math.sign(blockDmg) !== 1
      defs.curStamina = {
        value: -defs.baseStamina / defs.staminaSkillExpenditure,
        source: "BlockJuke"
      };
    }
    hits.crit();
    hits.gutHit(defs);
    if (hits.GutHit && hits.BlockJuke) {
      hits.hitEffect = {};
      hits.hitEffect.gutHit = hits.GutHit;
      hits.curStamina = {
        value: -defs.baseStamina / defs.staminaSkillExpenditure / 2,
        source: "GutHit"
      };
      defs.Block.block = 0;
      Logger.push("Gut Hit! Block 0");
    }
  }

  if (defs instanceof Rogue) {
    defs.counter();
  }

  if (defs instanceof Paladin) {
    defs.shieldDeflect(
      hits.hitEffect[Object.keys(hits.hitEffect)].dmg,
      defs.Block.block
    );
    defs.heal();
  }

  if (hits instanceof Paladin) {
    hits.shieldBash(defs);
    if (hits.ShieldBash) {
      hits.hitEffect = {};
      hits.hitEffect.shieldBash = hits.ShieldBash;
      hits.curStamina = {
        value: -defs.baseStamina / defs.staminaSkillExpenditure / 2,
        source: "ShieldBash"
      };
    }
  }
  // Instances >

  let hitDMG = hits.hitEffect[Object.keys(hits.hitEffect)].dmg;

  // Logging Inital Info <
  Logger.push("After Checks\n");

  console.dir(hits);
  console.dir(defs);
  // Logging Inital Info >

  if (isHitsFast) {
    // hitDMG /= 2
    Logger.push("Fast Hit!");
    // if (hits.Quickness.quickness / 3 > defs.Quickness.quickness) {

    //     Logger.push("Powerful Strike!")
    // }

    if (doesHitsHealFast) {
      heal_Fighter(hits);
    } else if (defs.Block.block) {
      // From Hits Fast and not enough reaction time <
      defs.Block.block = Math.round(defs.Block.block / 1.2);
      Logger.push(`Weak Block = ${defs.Block.block} Block vs ${hitDMG} dmg`);
      // From Hits Fast and not enough reaction time >

      if (blockShatter(defs, hitDMG)) {
        return;
      } else if (
        defs.Parry.parry &&
        Object.keys(hits.hitEffect) == "hit" &&
        hits.BlockJuke == false
      ) {
        Logger.push(`Fast hit Parry!`);
        hits.effects.parry = { turnsBase: 1 };
        conclusion({
          defs: defs,
          hits: hits,
          operatorBH: ["/", 1.5, hitDMG],
          operatorDS: [
            "/",
            1.5,
            defs.baseStamina / defs.staminaSkillExpenditure
          ],
          operatorHS: ["*", 1, hitDMG],
          dir: true,
          source: "Fast Block Success!"
        });
        // hits.curStamina = -hitDMG*2
        // defs.blockHealth = -hitDMG/1.5;
        return;
      } else {
        Logger.push("Block Successful!");
        heal_Fighter(defs);
        Logger.push("After Block\n");
        conclusion({
          hits: hits,
          defs: defs,
          hitDMG: hitDMG,
          operatorBH: ["*", 1, hitDMG],
          regain: 2,
          dir: true,
          source: "Fast Block Success!"
        });
      }
    } else {
      Logger.push("Fast Hit in for: " + hitDMG);
      Logger.push("After FastHit\n");
      conclusion({
        hits: hits,
        defs: defs,
        regain: 2,
        hit: hitDMG,
        dir: true,
        source: "Fast Hit!"
      });
      // defs.health = -Math.round(Math.abs(hitDMG));

      // defs.effects[Object.keys(hits.hitEffect)] = hits.hitEffect[Object.keys(hits.hitEffect)]

      // hits.regainStance_Stamina();
      // defs.regainStance_Stamina();
    }
  } else {
    Logger.push(
      `${defs.name} Dodging with ${defs.Dodge.dodge}/${defs.Dodge.max}&${defs.Dodge.min} vs ${hits.Accuracy.accuracy}/${hits.Accuracy.max}&${hits.Accuracy.min}`
    );

    if (doesDefDodge) {
      if (defs.Counter) {
        Logger.push("Counter hit!");
        Logger.push("After Counter\n");
        defs.effects.counter = { turnsBase: 1 };
        conclusion({
          hits: hits,
          defs: defs,
          hitDMG: hitDMG,
          operatorHS: ["*", 1, hitDMG],
          operatorDS: ["*", 1, defs.baseStamina / defs.staminaSkillExpenditure],
          dir: true,
          source: "Counter!"
        });
        // defs.curStamina = -defs.baseStamina/defs.staminaSkillExpenditure
        // console.dir(hits)
        // console.dir(defs)
      } else {
        Logger.push("Dodge!");
        Logger.push("After Dodge\n");
        conclusion({
          hits: hits,
          defs: defs,
          hitDMG: hitDMG,
          operatorHS: ["*", 1.5, hitDMG],
          operatorDS: ["*", 1, hitDMG],
          dir: true,
          source: "Dodge!"
        });
        // hits.curStamina = -hitDMG
        // defs.curStamina = -defs.baseStamina/defs.staminaSkillExpenditure
      }
    } else if (defs.Block.block) {
      Logger.push("Blocking with: " + defs.Block.block + " vs " + hitDMG);
      if (blockShatter(defs, hitDMG)) {
        return;
      } else {
        if (defs.ShieldDeflect) {
          Logger.push(`Shield Deflect!`);
          Logger.push("After Shield Deflect\n");
          hits.effects.shieldDeflect = defs.ShieldDeflect;
          conclusion({
            hits: hits,
            defs: defs,
            operatorHS: ["/", 2, hitDMG],
            operatorDS: [
              "*",
              1,
              defs.baseStamina / defs.staminaSkillExpenditure
            ],
            operatorBH: ["/", 2, hitDMG],
            dir: true,
            source: "Shield Deflect!"
          });
          // hits.curStamina = -hitDMG/2
          // defs.curStamina = -defs.baseStamina/defs.staminaSkillExpenditure
          // defs.blockHealth = -hitDMG/2;
        } else if (
          defs.Parry.parry &&
          Object.keys(hits.hitEffect) == "hit" &&
          hits.BlockJuke == false
        ) {
          Logger.push(`Parry!`);
          // defs.health = -Math.abs(obj.blockDmg);
          // defs.blockHealth = -hitDMG*1.5;
          // hits.curStamina = -hitDMG
          hits.effects.parry = { turnsBase: 1 };

          //   below is from block shatter
          // hits.curStamina = -hitDMG
          // defs.curStamina = -hitDMG/2
          // defs.blockHealth = -hitDMG/2;

          // defs.regainStance_Stamina();
          if (defs.Parry.riposte) {
            Logger.push(`Riposte!`);
            Logger.push("After Riposte\n");
            defs.effects.riposte = { turnsBase: defs.Parry.turnsBase };
            // defs.curStamina = -hitDMG/2
            // console.dir(hits)
            // console.dir(defs)
          }
          conclusion({
            defs: defs,
            hits: hits,
            operatorBH: ["/", 1.5, hitDMG],
            operatorDS: [
              "/",
              2,
              defs.baseStamina / defs.staminaSkillExpenditure
            ],
            operatorHS: ["*", 1.5, hitDMG],
            dir: true,
            heal: defs,
            source: "Riposte!"
          });
        } else {
          Logger.push("Block Successful!");
          conclusion({
            hits: hits,
            defs: defs,
            operatorHS: ["/", 1, hitDMG],
            operatorDS: ["/", 2, hitDMG],
            operatorBH: ["/", 1, hitDMG],
            dir: true,
            regain: 2,
            heal: defs,
            source: "Block Success!"
          });
          // hits.curStamina = -hitDMG
          // defs.curStamina = -hitDMG/2
          // defs.blockHealth = -hitDMG;

          // hits.regainStance_Stamina();
          // defs.regainStance_Stamina();
        }
      }
    } else {
      Logger.push("Direct Hit! " + Math.abs(hitDMG));
      conclusion({
        hits: hits,
        defs: defs,
        operatorHS: ["/", 1, hitDMG],
        dir: true,
        hit: hitDMG,
        regain: 0
      });
      // hits.curStamina = -hitDMG
      // defs.health = -Math.abs(hitDMG);
      // hits.regainStance_Stamina();

      // defs.effects[Object.keys(hits.hitEffect)] = hits.hitEffect[Object.keys(hits.hitEffect)]

      // Logger.push("After All\n")
      // console.dir(hits)
      // console.dir(defs)
    }
  }
}

let turn = 1;
function battle(P1, P2) {
  Logger.clearLog();
  console.log(Logger.getLog() + " Log From FS2");

  if (P1.health > 0 && P2.health > 0) {
    battleHit(P1, P2);

    Logger.push(
      `${P1.name}- Health: ${P1.health}/${P1.baseHealth} & Armor: ${P1.armor} & Stamina: ${P1.curStamina}/${P1.baseStamina} & Stance: ${P1.stance}`
    );
    Logger.push(
      `${P2.name}- Health: ${P2.health}/${P2.baseHealth} & Armor: ${P2.armor} & Stamina: ${P2.curStamina}/${P2.baseStamina} & Stance: ${P2.stance}`
    );
    Logger.push(`\nTurn: ${turn} -------------------------------------\n`);

    turn++;
    console.log("From battle from FS2 " + Logger);
    module.exports.Logger = Logger;
  } else {
    Logger.push("Someone died!");
    module.exports.Logger = Logger;
  }
}

module.exports.battle = battle;
