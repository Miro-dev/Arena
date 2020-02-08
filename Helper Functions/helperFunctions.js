function roundToTwo(num) {
  // console.log("Num Rounded: " + num)
  return +(Math.round(num + "e+2") + "e-2");
}

function heal_Fighter(f1) {
  if (f1.Heal) {
    console.log(
      "Heal to " + f1.name + " + " + f1.str * f1.stance * 5 + " HP/Stamina"
    );
    f1.curStamina = {
      value: -Math.round(f1.baseStamina / f1.staminaSkillExpenditure),
      source: "Heal Spell"
    };
    f1.health = f1.str * f1.stance * 5;
    f1.stance += 0.5;
    f1.curStamina = { value: f1.str * f1.stance * 5, source: "Heal amount" };
  }
}

function conclusion(obj) {
  // Regain annotation:
  // 0 def
  // 1 hit
  // 2 both

  if (obj.operatorHS) {
    if (obj.operatorHS[0] == "*") {
      obj.hits.curStamina = {
        value: -Math.abs(obj.operatorHS[2] * obj.operatorHS[1]),
        source: obj.source
      };
    } else {
      obj.hits.curStamina = {
        value: -Math.abs(obj.operatorHS[2] / obj.operatorHS[1]),
        source: obj.source
      };
    }
  }

  if (obj.operatorDS) {
    if (obj.operatorDS[0] == "*") {
      obj.defs.curStamina = {
        value: -Math.abs(obj.operatorDS[2] * obj.operatorDS[1]),
        source: obj.source
      };
    } else {
      obj.defs.curStamina = {
        value: -Math.abs(obj.operatorDS[2] / obj.operatorDS[1]),
        source: obj.source
      };
    }
  }

  if (obj.operatorBH) {
    if (obj.operatorBH[0] == "*") {
      obj.defs.blockHealth -= Math.abs(obj.operatorBH[2] * obj.operatorBH[1]);
    } else {
      obj.defs.blockHealth -= Math.abs(obj.operatorBH[2] / obj.operatorBH[1]);
    }
  }

  if (obj.heal) {
    heal_Fighter(obj.heal);
  }

  if (obj.hit) {
    obj.defs.effects[Object.keys(obj.hits.hitEffect)] =
      obj.hits.hitEffect[Object.keys(obj.hits.hitEffect)];
    obj.defs.health = -Math.abs(obj.hit);
  }

  if (obj.regain == 2) {
    obj.hits.regainStance_Stamina();
    obj.defs.regainStance_Stamina();
  } else if (obj.regain == 1) {
    obj.hits.regainStance_Stamina();
  } else if (obj.regain == 0) {
    obj.defs.regainStance_Stamina();
  }

  if (obj.dir) {
    console.dir(obj.hits);
    console.dir(obj.defs);
  }
}

function blockShatter(defs, hitDMG) {
  let _break = false;
  console.log("Block Shatter Check.");
  let biggestToStamina = [0];
  let biggestToBlockHealth = [0];
  let biggestToHealth = [0];

  let dmgToRoll = defs.Block.block - hitDMG;
  if (dmgToRoll < 0) {
    console.log("Block Break! " + dmgToRoll);
    biggestToStamina.push(defs.Block.block / 2);
    biggestToBlockHealth.push(defs.Block.block);
    biggestToHealth.push(Math.abs(dmgToRoll));

    defs.effects.blockShatter = { turnsBase: 1 };
    _break = true;
  }

  let dmgToS = defs.curStamina - hitDMG / 2;
  if (dmgToS < 0) {
    console.log("Stamina Break! " + dmgToS);
    biggestToStamina.push(hitDMG / 2);
    if (dmgToRoll < 0) {
      biggestToBlockHealth.push(defs.Block.block);
    } else {
      biggestToBlockHealth.push(hitDMG);
    }
    biggestToHealth.push(Math.abs(dmgToS * 2));
    defs.effects.blockShatter = { turnsBase: 2 };
    _break = true;
  }

  let dmgToBH = defs.blockHealth - hitDMG;
  if (dmgToBH < 0) {
    console.log("Block health Break! " + dmgToBH);
    biggestToStamina.push(Math.abs(dmgToBH / 2));
    biggestToBlockHealth.push(hitDMG);
    biggestToHealth.push(Math.abs(dmgToBH));
    defs.effects.blockShatter = { turnsBase: 2 };
    _break = true;
  }

  console.log(
    `S ${Math.max(...biggestToStamina)} || BH ${Math.max(
      ...biggestToBlockHealth
    )} || H ${Math.max(...biggestToHealth)}`
  );
  defs.curStamina = {
    value: -Math.max(...biggestToStamina),
    source: "Block Shatter"
  };
  defs.blockHealth -= Math.max(...biggestToBlockHealth);
  defs.health = -Math.max(...biggestToHealth);

  return _break;
}

module.exports.heal_Fighter = heal_Fighter;
module.exports.conclusion = conclusion;
module.exports.blockShatter = blockShatter;
module.exports.roundToTwo = roundToTwo;
