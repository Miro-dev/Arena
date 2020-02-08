// Agents are created here

const Paladin = require("./Classes/paladinClass").Paladin;
const Rogue = require("./Classes/rogueClass").Rogue;
const Fighter = require("./Classes/fighterClass").Fighter;

// Granis Darkhammer, Jorn the Redeemer, Sage Truthbearer, Malak the Avenger, Gavinrad the Dire, Morlune the Mighty,
//  Agamand the True, Ballador the Bright, Manadar the Healer, Zann the Defender, Arius the Seeker, Aurrius the Pure,
//  Karnwield the Seeker, Buzan the Fearless

// Tojara, Nikoro, Kajind, Mikasa, Samuro, Akinos, Mazuru, Yozshura, Daisho, Kigami, Arashicage, Moogul the Sly, Jubei

const Rogue1 = new Rogue("Artemis", 3, 6, 40);
const Rogue2 = new Rogue("Daisho", 4, 8, 80);
const Rogue3 = new Rogue("Mikino", 5, 10, 160);
const Rogue_1 = new Rogue("Zelar", 3, 6, 40);
const Rogue_2 = new Rogue("Borelius", 4, 8, 80);
const Rogue_3 = new Rogue("Miso", 5, 10, 160);

const Fighter1 = new Fighter("Peter", 4, 4, 70);
const Fighter2 = new Fighter("Benzen", 6, 6, 140);
const Fighter3 = new Fighter("Col. Gurax", 8, 8, 280);
const Fighter_1 = new Fighter("Bob", 4, 4, 70);
const Fighter_2 = new Fighter("Joshua", 6, 6, 140);
const Fighter_3 = new Fighter("Frederic", 8, 8, 280);

const Paladin1 = new Paladin("Bonhart", 6, 3, 100);
const Paladin2 = new Paladin("Aurrius the Pure", 8, 4, 200);
const Paladin3 = new Paladin("Tervel", 10, 5, 300);
const Paladin_1 = new Paladin("Mina", 6, 3, 100);
const Paladin_2 = new Paladin("Gabriel", 8, 4, 200);
const Paladin_3 = new Paladin("Pavel", 10, 5, 300);

// const Boss1 = new Boss("Mozgul", 18, 8, 400);
// const Boss2 = new Boss("Zerax", 8, 18, 200);

const Bandit1 = new Fighter("Samol", 3, 4, 60);
const Goblin1 = new Fighter("Tika", 2, 6, 20);

function createAgents() {
  // Creation will later be for the chosen fighters
  console.log("Agents created");
}

createAgents();

module.exports = {
  P1: Paladin1,
  P2: Paladin2,
  R1: Rogue1,
  R2: Rogue2,
  F1: Fighter1,
  F2: Fighter2,
  P_1: Paladin_1,
  P_2: Paladin_2,
  R_1: Rogue_1,
  R_2: Rogue_2,
  F_1: Fighter_1,
  F_2: Fighter_2,
  createAgents: createAgents
};
