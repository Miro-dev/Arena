// module.exports = testBlockShatter
// Edited From GitHub
// Mix in effects from HP and Stamina
// Fix does???Heal
// Fix str agi from states and effects
// Fix states changing
function testBlockShatter () {
    // Fix Block depletion after break to correspond to Block.block
    const PaladinTest = new Paladin("Test1", 11, 5, 0);
    const FighterTest = new Fighter("Test2", 11, 5, 0);
    return [PaladinTest.curStamina, PaladinTest.blockHealth, PaladinTest.health]
}

function roundToTwo(num) {    
    // console.log("Num Rounded: " + num)
    return +(Math.round(num + "e+2")  + "e-2");
}

class Fighter {
    constructor (name, strength, agility, defense, mastery, armor) {
        // Parry and Block may not be clean

        // Defense of Vulnaribilities - Linked with Defense, Armor Stat, Mastery
        this.Vulnaribilities
        this.Defense = defense
        this.Mastery = mastery

        // After Parry - effect = -Defense

        // Deflect = a mix between a Parry and Dodge ( attacker Out of Balance/2)

        // Attack Force to stop an Attack? Faint

        // Initiatitve - increases Attack, Speed / lowers Defense, Accuracy ( gets filled after 
        //      one NOT parried attack and stopped after parry, turns around after a riposte)

        this.Initiative = 100
        // Quickness *
        // Accuracy - vulnerability find (Crit)
        // Mastery - faint (block juke) / mistakes / parry / riposte
        // Opponent Knowledge
        // Defence
        // Attack
        // DMG = Force
        // Physical State - Out of Balance, Blinded, Crippled, Attacking (right after an attack), Defending (right after a defend)
        // Mental State - Shacken, Bashed, Dazed, Fear, Brave, Faithful, Rage, Calm

        // Action = Attack / Defense / Opponent Knowledge

        // First Action => Quickness + Opponent Knowledge ~ Who does the first action
        // Second Action => Quickness + Mastery + Opponent Knowledge ~ Defense - Block / Parry / Dodge || Attack - Fast / Medium / Slow
        // Third Action => Quickness + Mastery + Opponent Knowledge ~ Does he Continue / Stop / Change Action


        this.name = name

        this.armor = armor

        this.strength = strength
        this.agility = agility

        this.baseHealth = this.str*18 + this.agi*9;
        this.currentHealth = this.baseHealth

        this.blockMultiplier = 1.8
        this.blockChance = 3
        this.blockHealth = this.str*200

        this.baseStamina = this.str*120 + this.agi*50
        this.currentStamina = this.baseStamina
        this.staminaRegen = Math.round(this.agi*5 + this.str*2)

        this.stanceStat = { multiplier: 2, sum: 0}
        this.state = false

        this.effects = {}
        this.effects.state = ["Brave!", 0]

        this.hitEffect = {}

        this.Hit = false
        this.Dodge = false
        this.Block = false
        this.Parry = false
        this.Quickness = false
        this.Accuracy = 0
    }

    stanceSum (multiplier) {
        
        // console.log("StanceSum Multiplier: " + multiplier)
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
            this.stanceStat.sum += 1
        }

        if (this.stance < 0.5) {
            this.stanceStat.multiplier = 0.5;
        }

        if (this.stance > 2) {
            this.stanceStat.multiplier = 2;
        }

        if (multiplier < 1) {
            this.stanceStat.sum = -2
        } else if (multiplier >= 1 && multiplier <= 1.5) {
            this.stanceStat.sum = -1    
        } else if (multiplier > 1.5) {
            this.stanceStat.sum = 0    
        }
    }

    regainStance_Stamina () {
        if (this.stance != 2) {
            this.stance += 0.5
            if (this.stance > 2) {
                this.stanceStat.multiplier = 2;
            }
            console.log(this.name + " regained Stance!")
        }

        if (this.curStamina != this.baseStamina) {
            this.curStamina = this.staminaRegen
            if (this.effects.state == "Faithful!") {
                this.curStamina = this.staminaRegen
            }
        }
    }

    get health () {
        return this.currentHealth 
    }

    set health (value) {
        if (Math.sign(value) === -1) {
            value = Math.abs(value);
            if (this.armor < value) {
                let bleed = this.armor - value
                this.armor = 0
                this.currentHealth += bleed
                console.log("Damage done: " + bleed + " to " + this.name)
                this.curStamina = bleed*2
                this.stateRoll();
            } else {
                this.armor -= value
                console.log("Damage done to armor: " + value + " to " + this.name)
            }
        } else {
            let margin = this.currentHealth + value 
            if (margin > this.baseHealth) {
                let healMax =  Math.round(value - (this.baseHealth - this.currentHealth))
                this.currentHealth = this.baseHealth;
                this.currentHealth += Math.round(healMax/3);
                console.log("Max Heal! " + Math.round(healMax/3) + " out of " + value);
            } else {
                console.log("Health Restored: " + value)
                this.currentHealth += Math.round(value)
            }
        }
    }

    get curStamina () {
        return this.currentStamina
    }

    set curStamina (value) {
        value = Math.round(value)
        if (Math.sign(value) === -1) {
            this.currentStamina += value
            console.log(value + " Stamina Depleted from " + this.name)
            if (this.currentStamina < 0) {
                this.currentStamina = 0
            }
        } else {
            this.currentStamina += value
            console.log(value + " Stamina Regained to " + this.name)
            if (this.currentStamina > this.baseStamina) {
                this.currentStamina = this.baseStamina
            }
        }
        this.currentStamina = Math.round(this.currentStamina)
    }

    get agi () {
        // console.log(this.agility)
        return this.agility
    }

    set agi (value) {
        // console.log(value)
        this.agility += value
    }

    get str () {
        // console.log(this.agility)
        return this.strength
    }

    set str (value) {
        // console.log(value)
        this.strength += value
    }

    get stance () {
        return this.stanceStat.multiplier
    }

    set stance (value) {
        this.stanceStat.multiplier = value
    }

    accuracy () {
        let mix = Math.round(this.agi*this.str*this.stance/2);
        let max = Math.round(Math.round(mix*2));
        let min = mix;

        let accuracy = Math.floor(Math.random() * (max - min)) + min
        this.Accuracy = {accuracy: accuracy, max: max, min: min}
    }

    hitRoll () {
        let mix = Math.round((this.str*6 + this.agi*3)*this.stance);
        let max = Math.round(mix*1.2);
        let min = mix;

        let dmg = Math.floor(Math.random() * (max - min)) + min + this.stanceStat.sum
        if (this.curStamina - dmg > 0) {
            this.Hit = {dmg: dmg, max: max, min: min, turnsBase: 1}
        } else {
            console.log(this.name + " Not Enough Stamina to Hit!")
            this.Hit = {dmg: 0, max: max, min: min, turnsBase: 1}
        }
    }

    blockRoll () {
        let mix = Math.round((this.str*4 + this.agi*2)*this.blockMultiplier*this.stance);
        let max = Math.round(mix*1.5);
        let min = mix;
        
        let chance = Math.floor(Math.random() * 10) + 1 + this.stanceStat.sum
        let block = Math.floor(Math.random() * (max - min)) + min
        if (chance >= this.blockChance && this.blockHealth > 0) {
            this.Block = {block: block, max: max, min: min}
        } else if (chance >= 8 && this.blockHealth > 0){
            this.Block = {block: block, max: max, min: min}
            this.blockHealth = this.str*50
        } else {
            this.Block = {block: false, max: max, min: min}
            console.log("Block false from BlockRoll")
        }
        console.log(`Chance Block of ${this.name} = ${chance} Needs >=${this.blockChance}`)
    }
// Testing Parry functinality
    // Opponent Dependant <
    parryRoll (hits) {
        if (this.curStamina > this.baseStamina/8) {
            let parryChance = Math.round(((hits.agi + hits.str) / (this.str + this.agi)) * 10)
            let max = 20
            let min = 1
            let parryR = Math.floor(Math.random() * (max - min)) + min + this.stanceStat.sum*0.5
            let riposteMargin = (max - parryChance)/2 + parryChance;
            console.log(`${this.name} needs more than ${parryChance} to Parry and more than ${riposteMargin} to Riposte. 
            Gets ${parryR} for ${parryChance}/${riposteMargin}!`)
            if (parryChance <= parryR || parryChance > 20) {      
                if (parryR >= riposteMargin) {
                    // Parry + Riposte
                    this.Parry = {parry: true, riposte: true, turnsBase: 1}
                } else {
                    // Only Parry
                    this.Parry = {parry: true, riposte: false, turnsBase: 1}
                }
            } else {
                this.Parry = {parry: false, riposte: false, turnsBase: 1}
            }
        } else {
            this.Parry = {parry: false, riposte: false, turnsBase: 1}
            console.log(this.name + " Not Enough Stamina to Parry")
        }
    }

    deflectRoll (hits) {
        // Deflect works like opponent strikes with power and his power is used against him 
        // Connect Force with Deflect
        // Decisions when what Force to use!
        if (this.curStamina > this.baseStamina/6) {
            let deflectChance = Math.round(((hits.agi + hits.str) / (this.str + this.agi)) * 10)
            let max = 20
            let min = 1
            let parryR = Math.floor(Math.random() * (max - min)) + min + this.stanceStat.sum*0.5
            let riposteMargin = (max - parryChance)/2 + parryChance;
            console.log(`${this.name} needs more than ${parryChance} to Parry and more than ${riposteMargin} to Riposte. 
            Gets ${parryR} for ${parryChance}/${riposteMargin}!`)
            if (parryChance <= parryR || parryChance > 20) {      
                if (parryR >= riposteMargin) {
                    // Parry + Riposte
                    this.Parry = {parry: true, riposte: true, turnsBase: 1}
                } else {
                    // Only Parry
                    this.Parry = {parry: true, riposte: false, turnsBase: 1}
                }
            } else {
                this.Parry = {parry: false, riposte: false, turnsBase: 1}
            }
        } else {
            this.Parry = {parry: false, riposte: false, turnsBase: 1}
            console.log(this.name + " Not Enough Stamina to Parry")
        }
    }
    // Opponent Dependant >

    dodgeRoll () {
        let mix = Math.round(this.agi*3.5*this.stance);
        let max = Math.round(Math.round(mix*2));
        let min = mix;
        if (this.curStamina > this.baseStamina / 6) {

            let dodge = Math.round(Math.floor(Math.random() * (max - min)) + min + this.stanceStat.sum)
            
            this.Dodge = {dodge: dodge, max: max, min: min, turnsBase: 1}
        } else {
            console.log(this.name + " Not Enough Stamina to Dodge")
            this.Dodge = {dodge: 0, max: max, min: min, turnsBase: 1}
        }
    }

    quicknessRoll () {
        let max = Math.round(35 + this.agi*this.stance)
        let min = Math.round(1 + this.agi*this.stance)
        let quickness = Math.floor(Math.random() * (max - min)) + min + this.stanceStat.sum
        if (this.curStamina < quickness*2) {
            this.curStamina = -quickness
            quickness /= 2
        } else {
            this.curStamina = -quickness*2
        }

        this.Quickness = {quickness: quickness, max: max, min: min}
    }

    stateRoll () {
        if (this.currentHealth == this.baseHealth) {
            this.effects.state = "Brave!"
        } else if (this.currentHealth < this.baseHealth*0.4 && (this.effects.state[0] != "Rage!" && this.effects.state[0] != "Despair!")) {
            let chance = Math.floor(Math.random() * 11);
            if (chance >= 5) {
                this.effects.state = ["Rage!", 1]
            } else {
                this.effects.state = ["Despair!", 1]
            }
            // 0/1 means not triggered, 1/2 means it's triggered and it shouldn't change
        } else if (this.currentHealth < this.baseHealth*0.7 && (this.effects.state[0] != "Faithful!" && this.effects.state[0] != "Fearful!")) {
            let chance = Math.floor(Math.random() * 11);
            if (chance >= 5) {
                this.effects.state = ["Faithful!", 0]
            } else {
                this.effects.state = ["Fearful!", 0]
            }
            // 0 means not triggered, 1 means it's triggered and it shouldn't change
        }
    }

    doBeforeEffects () {
        if (this.currentStamina <= 0 && this.effects.state != "Faithful!") {
            this.effects.exhaust = {value: true, turnsBase: 3}
        }

        for (let key in this.effects){
            if (this.effects.hasOwnProperty(key)) {
                switch (key) {
                    case "state": 
                    console.log(`${this.name} is ${this.effects[key][0]}`)
                        if (this.effects[key][0] === "Faithful!" && this.effects[key][1] != 1){
                            console.log(`${this.name} became Faithful!`)
                            this.str = 2
                            this.agi = 2
                            this.effects[key][1] = 1

                        } else if (this.effects[key][0] === "Fearful!" && this.effects[key][1] != 1) {
                            console.log(`${this.name} became Fearful!`)
                            this.str = -2
                            this.agi = -2
                            this.effects[key][1] = 1
                        } else if (this.effects[key][0] === "Rage!" && this.effects[key][1] != 2) {
                            console.log(`${this.name} became Enraged!`)
                            this.str = 4
                            this.agi = 4
                            this.effects[key][1] = 2
                        } else if (this.effects[key][0] === "Despair!" && this.effects[key][1] != 2) {
                            console.log(`${this.name} became Desperate!`)
                            this.str = -2
                            this.agi = -2
                            this.effects[key][1] = 2
                        }

                        break;

                    case "shieldBash": 
                        if (this.effects[key].turns === undefined) {
                            // Initial Effect
                            console.log(`${this.name} affected by ${key} BE`)
                            this.effects[key].turns = this.effects[key].turnsBase
                            this.effects[key].turns -= 1
                            this.stance -= 1
                            this.str = -2 // Fix later with opponent str
                            this.agi = -2 // Fix later with opponent str
                        } else if (this.effects[key].turns <= 0){
                            // Deleteion
                            this.str = 2 // Fix later with opponent str
                            this.agi = 2 // Fix later with opponent str
                            delete this.effects[key]
                        } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                            // Standing Effect
                            if (this.stance > 1) {
                                this.stanceStat.multiplier = 1
                            }

                            this.effects[key].turns -= 1
                        }
                        break;

                    case "counter":
                        if (this.effects[key].turns === undefined) {
                            console.log(`${this.name} affected by ${key} BE`)
                            this.stance += 1
                            this.agi += Math.round(this.agi/5)
                        }

                        break;

                    // case "riposte":
                    //     if (this.effects[key].turns === undefined) {
                    //         // Initial Effect
                    //         this.effects[key].turns = this.effects[key].turnsBase

                    //         console.log(`${this.name} affected by ${key}`)
                    //         this.stance -= 0.5

                    //     } else if (this.effects[key].turns <= 0){
                    //         // Deleteion
                    //         delete this.effects[key]
                    //     } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                    //         // Standing Effect
                    //         console.log("Standing Effect " + key)
                    //     }
                
                    //     break;

                    case "hit":
                        if (this.effects[key].turns === undefined) {
                            // Initial Effect
                            this.stance -= 0.3
                            console.log(`${this.name} affected by ${key} BE`)
                            if (this.effects[key].dmg > this.baseHealth / 2) {
                                console.log(`${this.name} affected by ${key} Stun BE!`)
                                this.str = -1
                                this.agi = -1
                                this.stance -= 1
                                this.effects[key].turns = this.effects[key].stun = true
                            }

                        } else if (this.effects[key].turns <= 0){
                            // Deleteion
                            if (this.effects[key].stun == true) {
                                this.str = 1
                                this.agi = 1 
                            }
                            delete this.effects[key]
                        } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                            // Standing Effect
                            console.log("Standing Effect BE " + key)
                        }

                        break;

                    case "blockShatter":

                        if (this.effects[key].turns === undefined) {
                            // Initial Effect
                            this.effects[key].turns = this.effects[key].turnsBase
                            this.effects[key].turns -= 1

                            console.log(`${this.name} affected by ${key} BE.`)
                            this.stance -= 0.5
                            this.blockMultiplier -= 0.5
                            this.blockChance += 1

                        } else if (this.effects[key].turns <= 0){
                            // Deleteion
                            this.blockMultiplier += 0.5
                            this.blockChance -= 1

                            delete this.effects[key]
                        } else if (this.effects[key].turns < this.effects[key].turnsBase) {
                            // Standing Effect
                            this.effects[key].turns -= 1
                        }

                        break;

                    // case "dodge":
                    //     if (this.effects[key].turns === undefined) {
                    //         // Initial Effect
                    //         this.effects[key].turns = this.effects[key].turnsBase
                    //         this.effects[key].turns -= 1

                    //         console.log(`${this.name} affected by ${key} BE`)
                    //         this.stance -= 0.3
                    //         this.curStamina = -this.Hit.dmg/2

                    //     } else if (this.effects[key].turns <= 0){
                    //         // Deleteion
                    //         delete this.effects[key]
                    //     } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                    //         // Standing Effect
                    //         console.log("Standing Effect BE " + key)
                    //         this.effects[key].turns -= 1
                    //     }
                    //     break;

                    case "gutHit":
                        if (this.effects[key].turns === undefined) {
                            // Initial Effect
                            // this.effects[key].turns = this.effects[key].turnsBase

                            console.log(`${this.name} affected by ${key} BE`)
                            if (this.stance > 1) {
                                this.stanceStat.multiplier = 1
                            }
                            this.staminaRegen = 0

                            this.str = -2 // Fix later with opponent str
                            this.agi = -2 // Fix later with opponent str
                        // } else if (this.effects[key].turns <= 0){
                        //     // Deleteion
                        //     this.str += 2 // Fix later with opponent str
                        //     this.agi += 2 // Fix later with opponent str
                        //     delete this.effects[key]
                        } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                            // Standing Effect
                            console.log("Standing Effect BE " + key)
                            if (this.stance > 1) {
                                this.stanceStat.multiplier = 1
                            }
                        }

                        break;

                    case "exhaust":
                        if (this.effects[key].turns === undefined) {
                            // Initial Effect
                            this.effects[key].turns = this.effects[key].turnsBase
                            this.effects[key].turns -= 1

                            console.log(`${this.name} affected by ${key} BE`)
                            if (this.stance > 1) {
                                this.stanceStat.multiplier = 1
                            }
                            this.staminaRegen *=3

                        } else if (this.effects[key].turns <= 0){
                            // Deleteion
                            delete this.effects[key]
                            this.staminaRegen /=3
                        } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                            // Standing Effect
                            console.log("Standing Effect BE " + key)
                            if (this.stance > 1) {
                                this.stanceStat.multiplier = 1
                            }

                            this.effects[key].turns -= 1
                        }

                        break;
                
                    default:
                        break;
                }
            }
        }
    }

    doActions () {
        this.blockMultiplier = roundToTwo(this.blockMultiplier)
        this.stanceStat.multiplier = roundToTwo(this.stance)
        this.stanceSum(this.stance);
        this.quicknessRoll();
        this.accuracy();
        this.hitRoll();
        this.dodgeRoll();
        this.blockRoll();
    }

    doAfterEffects () {
        for (let key in this.effects){
            if (this.effects.hasOwnProperty(key)) {
                switch (key) {
                    case "shieldDeflect": 
                        if (this.effects[key].turns === undefined) {
                            // Initial Effect
                            console.log(`${this.name} affected by ${key} AE`)
                            this.effects[key].turns = this.effects[key].turnsBase
                            this.effects[key].turns -= 1
                            this.Dodge.dodge /= 2
                            this.Quickness.quickness /= 2
                        } else if (this.effects[key].turns <= 0){
                            // Deleteion
                            delete this.effects[key]
                        } else if (this.effects[key].turns < this.effects[key].value.turnsBase) { // Add turnsBase to all Effects
                            // Standing Effect
                            this.effects[key].turns -= 1
                        }

                        break;

                    case "parry": 
                        if (this.effects[key].turns === undefined) {
                            // Initial Effect
                            console.log(`${this.name} affected by ${key}`)
                            this.effects[key].turns = this.effects[key].turnsBase
                            this.effects[key].turns -= 1
                            this.Quickness.quickness = Math.round(this.Quickness.quickness/1.5)
                        } else if (this.effects[key].turns <= 0){
                            // Deleteion
                            delete this.effects[key]
                        } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                            // Standing Effect
                            this.effects[key].turns -= 1
                        }
                        break;


                    // case "counter":
                    //     if (this.effects[key].turns === undefined) {
                    //         // Initial Effect
                    //         console.log(`${this.name} affected by ${key} AE`)
                    //         this.effects[key].turns = this.effects[key].turnsBase
                    //         this.effects[key].turns -= 1
                    //         this.Dodge.dodge /= 2
                    //         this.Quickness.quickness /= 2
                    //     } else if (this.effects[key].turns <= 0){
                    //         // Deleteion
                    //         delete this.effects[key]
                    //     } else if (this.effects[key].turns < this.effects[key].value.turnsBase) { // Add turnsBase to all Effects
                    //         // Standing Effect
                    //         this.effects[key].turns -= 1
                    //     }

                    //     break;

                    case "riposte":
                        if (this.effects[key].turns === undefined) {
                            // Initial Effect
                            this.effects[key].turns = this.effects[key].turnsBase
                            this.effects[key].turns -= 1

                            console.log(`${this.name} affected by ${key} AE`)
                            this.Accuracy.accuracy *=2
                            this.Quickness.quickness *= 2

                        } else if (this.effects[key].turns <= 0){
                            // Deleteion
                            delete this.effects[key]
                        } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                            // Standing Effect
                            console.log("Standing Effect AE " + key)
                            this.effects[key].turns -= 1
                        }
                
                        break;;

                    // case "hit":
                    //     if (this.effects[key].turns === undefined) {
                    //         // Initial Effect
                    //         this.effects[key].turns = this.effects[key].turnsBase
                    //         this.effects[key].turns -= 1

                    //         console.log(`${this.name} affected by ${key} AE`)

                    //     } else if (this.effects[key].turns <= 0){
                    //         // Deleteion

                    //         delete this.effects[key]
                    //     } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                    //         // Standing Effect
                    //         console.log("Standing Effect AE " + key)
                    //         this.effects[key].turns -= 1
                    //     }

                    //     break;

                    // case "blockShatter":

                    //     if (this.effects[key].turns === undefined) {
                    //         // Initial Effect
                    //         this.effects[key].turns = this.effects[key].turnsBase
                    //         this.effects[key].turns -= 1

                    //         console.log(`${this.name} affected by ${key}.`)
                    //         this.stance -= roundToTwo(this.effects[key].value / 150)
                    //         this.blockMultiplier -= roundToTwo(this.effects[key].value / 100)
                    //         this.blockChance += 2

                    //     } else if (this.effects[key].turns <= 0){
                    //         // Deleteion
                    //         this.stance += roundToTwo(this.effects[key].value / 150) + roundToTwo(this.effects[key].value / 300)
                    //         this.blockMultiplier += roundToTwo(this.effects[key].value/ 100) + roundToTwo(this.effects[key].value / 150)
                    //         this.blockChance -= 1

                    //         delete this.effects[key]
                    //     } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                    //         // Standing Effect
                    //         console.log("Standing Effect " + key)
                    //         console.log(`${this.name} affected by ${key}.`)
                    //         this.stance -= roundToTwo(this.effects[key].value / 300)
                    //         this.blockMultiplier -= roundToTwo(this.effects[key].value / 150)
                    //         this.blockChance -= 1

                    //         this.effects[key].turns -= 1
                    //     }

                    //     break;

                    // case "dodge":
                    //     if (this.effects[key].turns === undefined) {
                    //         // Initial Effect
                    //         this.effects[key].turns = this.effects[key].turnsBase
                    //         this.effects[key].turns -= 1

                    //         console.log(`${this.name} affected by ${key}`)
                    //         this.stance -= 0.4

                    //     } else if (this.effects[key].turns <= 0){
                    //         // Deleteion
                    //         delete this.effects[key]
                    //     } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                    //         // Standing Effect
                    //         console.log("Standing Effect " + key)
                    //         this.effects[key].turns -= 1
                    //     }
                    //     break;

                    case "gutHit":
                        if (this.effects[key].turns === undefined) {
                            // Initial Effect
                            this.effects[key].turns = this.effects[key].turnsBase
                            this.effects[key].turns -= 1

                            console.log(`${this.name} affected by ${key} AE`)
                            this.Quickness.quickness /= 2
                            this.Dodge.dodge /= 2

                        } else if (this.effects[key].turns <= 0){
                            // Deleteion
                            this.str = 2
                            this.agi = 2
                            this.staminaRegen = Math.round(this.agi*5 + this.str*2)
                            delete this.effects[key]
                        } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                            // Standing Effect
                            console.log("Standing Effect " + key)
                            this.Quickness.quickness /= 2
                            this.Dodge.dodge = 0
                            this.str = 1 // Fix later with opponent str
                            this.agi = 1 // Fix later with opponent str

                            this.effects[key].turns -= 1
                        }

                        break;

                    // case "exhaust":
                    //     if (this.effects[key].turns === undefined) {
                    //         // Initial Effect
                    //         this.effects[key].turns = this.effects[key].turnsBase
                    //         this.effects[key].turns -= 1

                    //         console.log(`${this.name} affected by ${key}`)
                    //         this.stanceStat.multiplier = 1
                    //         this.curStamina = this.effects[key].value

                    //     } else if (this.effects[key].turns <= 0){
                    //         // Deleteion
                    //         delete this.effects[key]
                    //     } else if (this.effects[key].turns < this.effects[key].turnsBase) { // Add turnsBase to all Effects
                    //         // Standing Effect
                    //         console.log("Standing Effect " + key)
                    //         this.stanceStat.multiplier = 1

                    //         this.effects[key].turns -= 1
                    //     }

                    //     break;
                
                    default:
                        break;
                }
            }
        }
        this.blockMultiplier = roundToTwo(this.blockMultiplier)
        this.stanceStat.multiplier = roundToTwo(this.stance)
        this.stanceSum(this.stance);
    }
}

class Paladin extends Fighter {

    constructor(name, str, agi, armor) {
        super(name, str, agi, armor);
        this.blockChance = 2
        this.blockMultiplier = 1.8
        this.staminaSkillExpenditure = 7
        // Skills <
        this.ShieldBash = false;
        this.ShieldDeflect = false
        // Skills >
    }

    get stance () {
        return this.stanceStat.multiplier
    }

    set stance (value) {
        // value is stance +- num
        let difference = Math.abs(value) - this.stance
        if (difference < 0) {
            difference /= 2;
        }
        this.stanceStat.multiplier = this.stance + difference
    }

    heal () {
        if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
            let chance = Math.floor(Math.random()*10) + this.stanceStat.sum
            console.log(`Chance Heal of ${this.name} = ${chance} Needs >=5`)
            if (chance >= 6) {
                this.Heal = true;
            } else {
                this.Heal = false
            }
        } else {
            this.Heal = false
            console.log(this.name + " Not enough Stamina to Heal!")
        }
        
    }
    
    shieldBash (opponent) {
        if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
            if (opponent.effects.hasOwnProperty('shieldDeflect')) {
                let chance = Math.floor(Math.random() * 10) + 1 + this.stanceStat.sum
                console.log(`Chance Shield Bash of ${this.name} = ${chance} Needs >=5`)
                if (chance >= 5 ) {
                    this.curStamina = -Math.round(this.baseStamina/5)
                    this.Hit.dmg /= 3
                    this.ShieldBash = {dmg: Math.round(this.Hit.dmg/2), turnsBase: 2}
                } else {
                    this.ShieldBash = false
                    hits.hitEffect = {}
                    hits.hitEffect.hit = hits.Hit
                }
            } else {
                this.ShieldBash = false
                hits.hitEffect = {}
                hits.hitEffect.hit = hits.Hit
            }
        } else {
            this.ShieldBash = false
            console.log(this.name + " Not enough Stamina to Shield Bash!")
        }

    }

    // Opponent Dependant <
    shieldDeflect (dmg, block) {
        if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
            let blockToDmg = block - dmg
            let chance = Math.floor(Math.random() * 10) + 1 + this.stanceStat.sum
            console.log(`Chance Shield Deflect of ${this.name} = ${chance} Needs >=7 BlockToDmg is with sign ${Math.sign(blockToDmg)}, and it is ${blockToDmg} > ${block / 2}`)
            if (chance >= 7 && Math.sign(blockToDmg) !== -1 && blockToDmg > (block / 2)) {
                this.ShieldDeflect = {turnsBase: 1}
            } else {
                this.ShieldDeflect = false
            }
        } else {
            this.ShieldDeflect = false
            console.log(this.name + " Not enough Stamina to Shield Deflect!")
        }

    }
    // Opponent Dependant >
}

class Rogue extends Fighter {
    constructor(name, str, agi, armor) {
        super(name, str, agi, armor);
        this.counterChance = 6
        this.staminaSkillExpenditure = 7 // this will change according to skill used
        // Skills <
        this.Crit = false
        this.Counter = false
        this.BlockJuke = false
        this.GutHit = false
        // Sills >
    }

    counter () {
        if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
            let chance = Math.floor(Math.random() * 10) + 1 + this.stanceStat.sum
            console.log(`Chance Counter of ${this.name} = ${chance} Needs >=${this.counterChance}`)
            if (chance >= 6) {
                this.Counter = true
            } else {
                this.Counter = false
            }
        } else {
            this.Counter = false
            console.log(this.name + " Not enough Stamina to Counter!")
        }
    }

    crit () {
        if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
            let chance = Math.floor(Math.random()*10) + this.stanceStat.sum
            console.log(`Chance Crit of ${this.name} = ${chance} Needs >=${this.counterChance}`)
            if (chance >= 6) {
                let dmg = this.agi*chance/2*this.stance
                console.log("Crit: " + dmg)
                this.Crit = dmg
            } else {
                this.Crit = false
            }
        } else {
            this.Crit = false
            console.log(this.name + " Not enough Stamina to Crit!")
        }

    }

    blockJuke (opponent) {
        if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
            let chance = Math.floor(Math.random()*10) + this.stanceStat.sum
            let opponentBlock = opponent.Block.block
            console.log(`Chance Block Juke of ${this.name} = ${chance} Needs >=6 and ${(this.Accuracy.accuracy + this.Quickness.quickness)*this.stance} > ${opponent.Block.block}`)
            if (chance >= 6 && (this.Accuracy.accuracy + this.Quickness.quickness)*this.stance > opponent.Block.block) {
                console.log(`Block Distortion! ${opponentBlock} => ${opponentBlock/1.5}`)
                this.BlockJuke = true
            } else {
                this.BlockJuke = false
            }
        } else {
            this.BlockJuke = false
            console.log(this.name + " Not enough Stamina to Block Juke!")
        }

    }

    gutHit (opponent) {
        if (this.curStamina > this.baseStamina / this.staminaSkillExpenditure) {
            if (this.BlockJuke || opponent.effects.hasOwnProperty('counter')) {
                let chance = Math.floor(Math.random()*10) + this.stanceStat.sum
                console.log(`Chance Gut Hit of ${this.name} = ${chance} Needs >=6 and ${this.BlockJuke} or ${this.Counter}`)
                if (chance >= 6) {
                    this.GutHit = {dmg: this.Hit.dmg/2, stamina: this.Hit.dmg*3, turnsBase: 2}
                } else {
                    this.GutHit = false
                    hits.hitEffect = {}
                    hits.hitEffect.hit = hits.Hit
                }
            } else {
                this.GutHit = false
                hits.hitEffect = {}
                hits.hitEffect.hit = hits.Hit
            }
        } else {
            this.GutHit = false
            console.log(this.name + " Not enough Stamina to GutHit!")
        }

    }
}

class Boss extends Fighter {

    constructor(name, str, agi, armor) {
        super(name, str, agi, armor);
        this.counterChance = 6
        // Skills <
        this.Crit = false
        this.Counter = false
        this.BlockJuke = false
        this.GutHit = false
        // Skills >

        this.blockChance = 2
        this.blockMultiplier = 1.8
        // Skills <
        this.ShieldBash = false;
        this.ShieldDeflect = false
        // Skills >
    }

    counter () {
        let chance = Math.floor(Math.random() * 10) + 1 + this.stanceStat.sum
        console.log(`Chance Counter of ${this.name} = ${chance} Needs >=${this.counterChance}`)
        if (chance >= 6) {
            this.Counter = true
        } else {
            this.Counter = false
        }
    }

    crit () {
        let chance = Math.floor(Math.random()*10) + this.stanceStat.sum
        console.log(`Chance Crit of ${this.name} = ${chance} Needs >=${this.counterChance}`)
        if (chance >= 6) {
            let dmg = this.agi*chance/2*this.stance
            console.log("Crit: " + dmg)
            this.Crit = dmg
        } else {
            this.Crit = false
        }
    }

    blockJuke (opponent) {
        let chance = Math.floor(Math.random()*10) + this.stanceStat.sum
        let opponentBlock = opponent.Block.block
        console.log(`Chance Block Juke of ${this.name} = ${chance} Needs >=6 and ${(this.Accuracy.accuracy + this.Quickness.quickness)*this.stance} > ${opponent.Block.block}`)
        if (chance >= 6 && (this.Accuracy.accuracy + this.Quickness.quickness)*this.stance > opponent.Block.block) {
            console.log(`Block Distortion! ${opponentBlock} => ${opponentBlock/2}`)
            this.BlockJuke = true
        } else {
            this.BlockJuke = false
        }
    }

    gutHit () {
        if (this.BlockJuke || this.Counter) {
            let chance = Math.floor(Math.random()*10) + this.stanceStat.sum
            if (chance >= 6) {
                this.GutHit = {dmg: this.Hit.dmg/2, stamina: this.Hit.dmg/4, turnsBase: 3}
            } else {
                this.GutHit = false
            }
        } else {
            this.GutHit = false
        }
    }

    heal () {
        let chance = Math.floor(Math.random()*10) + this.stanceStat.sum
        console.log(`Chance Heal of ${this.name} = ${chance} Needs >=5`)
        if (chance >= 5) {
            this.health = this.str*chance;
            this.stance += 0.5;
            this.curStamina = this.str*chance;
        } else {
            this.Heal = false
        }
    }
    
    shieldBash (defs) {
        if (defs.effects.hasOwnProperty('shieldDeflect')) {
            let chance = Math.floor(Math.random() * 10) + 1 + this.stanceStat.sum
            console.log(`Chance Shield Bash of ${this.name} = ${chance} Needs >=7`)
            if (chance >= 7 ) {
                this.curStamina = -this.baseStamina/5
                this.Hit.dmg /= 3
                this.ShieldBash = {turnsBase: 2}
            } else {
                this.ShieldBash = false
            }
        } else {
            this.ShieldBash = false
        }
    }

    // Opponent Dependant <
    shieldDeflect (dmg, block) {
        let blockToDmg = block - dmg
        let chance = Math.floor(Math.random() * 10) + 1 + this.stanceStat.sum
        console.log(`Chance Shield Deflect of ${this.name} = ${chance} Needs >=7 and ${blockToDmg} < ${block / 2}`)
        if (chance >= 7 && Math.sign(blockToDmg) !== -1 && blockToDmg < (block / 2)) {
            this.ShieldDeflect = {turnsBase: 1}
            this.curStamina = -this.baseStamina/5
        } else {
            this.ShieldDeflect = false
        }
    }
    // Opponent Dependant >
}

const Paladin1 = new Paladin("Bonhart", 8, 4, 100);
const Paladin2 = new Paladin("Misha", 11, 5, 200);
const Paladin3 = new Paladin("Tervel", 14, 6, 300);
const Paladin1_1 = new Paladin("Mina", 8, 4, 100);
const Paladin2_2 = new Paladin("Gabriel", 11, 5, 200);
const Paladin3_3 = new Paladin("Pavel", 14, 6, 300);

const Rogue1 = new Rogue("Artemis", 4, 8, 40);
const Rogue2 = new Rogue("Salazar", 5, 11, 80);
const Rogue3 = new Rogue("Mikino", 6, 14, 160);
const Rogue1_1 = new Rogue("Zelar", 4, 8, 40);
const Rogue2_2 = new Rogue("Borelius", 5, 11, 80);
const Rogue3_2 = new Rogue("Miso", 6, 14, 160);

const Fighter1 = new Fighter("Peter", 6, 6, 70);
const Fighter2 = new Fighter("Benzen", 8, 8, 140);
const Fighter3 = new Fighter("Col. Gurax", 11, 11, 280);
const Fighter1_1 = new Fighter("Bob", 6, 6, 70);
const Fighter2_2 = new Fighter("Joshua", 8, 8, 140);
const Fighter3_3 = new Fighter("Frederic", 11, 11, 280);

const Boss1 = new Boss("Mozgul", 18, 8, 400);
const Boss2 = new Boss("Zerax", 8, 18, 200);

const Bandit1 = new Fighter("Samol", 3, 4, 60);
const Goblin1 = new Fighter("Tika", 2, 6, 20);

function battleHit(Fighter1, Fighter2) {
    
    Fighter1.doBeforeEffects();
    Fighter2.doBeforeEffects();

    Fighter1.doActions();
    Fighter2.doActions();

    Fighter1.doAfterEffects();
    Fighter2.doAfterEffects();

    if (Fighter1.Hit.dmg == 0 && Fighter2.Hit.dmg > 0) {
        defs = Fighter1
        hits = Fighter2
    } else if (Fighter2.Hit.dmg == 0 && Fighter1.Hit.dmg > 0) {
        defs = Fighter2
        hits = Fighter1
    } else if (Fighter2.Hit.dmg == 0 && Fighter1.Hit.dmg == 0) {
        Fighter2.regainStance_Stamina();
        Fighter1.regainStance_Stamina();
        Fighter1.curStamina = Fighter1.staminaRegen*3
        Fighter2.curStamina = Fighter2.staminaRegen*3
        console.log("Rest!")
        return
    } else if (Fighter1.Quickness.quickness > Fighter2.Quickness.quickness) {
        defs = Fighter2
        hits = Fighter1
    } else if (Fighter1.Quickness.quickness === Fighter2.Quickness.quickness) {
        console.log("Clash!")
        let dmgClash = Fighter1.Hit.dmg - Fighter2.Hit.dmg
        if (Math.sign(dmgClash) === -1) {
            Fighter1.health = dmgClash
            Fighter1.stance -=0.5
        } else if (dmgClash < 20 && dmgClash > 0) {
            console.log("Equal!")
        } else {
            Fighter2.health = -dmgClash
            Fighter2.stance -=0.5
        }
        return
    } else {
        defs = Fighter1
        hits = Fighter2
    }

    hits.hitEffect = {};
    defs.hitEffect = {};
    hits.hitEffect.hit = hits.Hit
    defs.hitEffect.hit = defs.Hit

    // console.dir(hits)
    // console.dir(defs)
    console.log(hits.name + " " + hits.Quickness.quickness + " ==> " + defs.Quickness.quickness + " " + defs.name)

    // Checks <
    defs.parryRoll(hits)

    let doesDefDodge = defs.Dodge.dodge > hits.Accuracy.accuracy
    let isHitsFast = hits.Quickness.quickness / 2 > defs.Quickness.quickness
    let hitsPercentHP = hits.basehealth * 0.5
    let defsPercentHP = defs.basehealth * 0.5
    let doesHitsHealFast = hits.baseHealth < hitsPercentHP && (hits instanceof Paladin || hits instanceof Boss)
    let doesDefsHealFast = hits.baseHealth < defsPercentHP && (hits instanceof Paladin || hits instanceof Boss)
    
    // Checks >

    // Instances <
    if (hits instanceof Rogue || hits instanceof Boss) {
        hits.blockJuke(defs)
        if (hits.BlockJuke) {
            defs.Block.block = defs.Block.block / 1.5
            // blockDmg = defs.Block.block - hits.hitEffect[Object.keys(hits.hitEffect)].dmg;
            // doesBlockShatter = Math.sign(blockDmg) !== 1
            defs.curStamina = -defs.baseStamina/defs.staminaSkillExpenditure
        }
        hits.crit();
        hits.gutHit(defs);
        if (hits.GutHit && hits.BlockJuke) {
            hits.hitEffect = {};
            hits.hitEffect.gutHit = hits.GutHit;
            hits.curStamina = -defs.baseStamina/defs.staminaSkillExpenditure/2
            defs.Block.block = 0
            console.log("Gut Hit! Block 0")
        } else if (hits.GutHit) {
            hits.hitEffect = {};
            hits.hitEffect.gutHit = hits.GutHit;
            hits.curStamina = -defs.baseStamina/defs.staminaSkillExpenditure/2
            // blockDmg = defs.Block.block - hits.hitEffect[Object.keys(hits.hitEffect)].dmg;
        }
    }

    if (defs instanceof Rogue || defs instanceof Boss) {
        defs.counter();
    }

    if (defs instanceof Paladin || defs instanceof Boss) {
        defs.shieldDeflect(hits.hitEffect[Object.keys(hits.hitEffect)].dmg, defs.Block.block);
        defs.heal();
    }

    if (hits instanceof Paladin || defs instanceof Boss) {
        hits.shieldBash(defs)
        if (hits.ShieldBash) {
            hits.hitEffect = {};
            hits.hitEffect.shieldBash = hits.ShieldBash;
            hits.curStamina = -defs.baseStamina/defs.staminaSkillExpenditure/2
        }
    }
    // Instances >
    let hitDMG = hits.hitEffect[Object.keys(hits.hitEffect)].dmg;

    // Logging Inital Info <
    console.log("After Checks\n")

    console.dir(hits)
    console.dir(defs)
    // Logging Inital Info >

    if (isHitsFast) {
        // hitDMG /= 2
        console.log("Fast Hit!")
        if (hits.Quickness.quickness / 3 > defs.Quickness.quickness) {
            
            console.log("Powerful Strike!")
        }

        if (doesHitsHealFast) {
            heal_Fighter(hits)
        } else if (defs.Block.block) {

            // From Hits Fast and not enough reaction time <
            defs.Block.block = Math.round(defs.Block.block/1.5)
            console.log(`Weak Block = ${defs.Block.block} Block vs ${hitDMG} dmg`)
            // From Hits Fast and not enough reaction time >

            if (blockShatter (defs, hitDMG)) {
                return
            } else if (defs.Parry.parry && Object.keys(hits.hitEffect) == "hit" && hits.BlockJuke == false) {
                console.log(`Fast hit Parry!`)
                hits.effects.parry = {turnsBase: 1};
                conclusion({defs: defs, hits: hits, operatorBH: ["/", 1.5, hitDMG] ,operatorDS: ["/", 1.5, defs.baseStamina/defs.staminaSkillExpenditure], operatorHS: ["*", 1, hitDMG], dir: true})
                // hits.curStamina = -hitDMG*2
                // defs.blockHealth = -hitDMG/1.5;
                return
            } else {
                console.log("Block Successful!")
                heal_Fighter(defs)
                console.log("After Block\n")
                conclusion({hits: hits, defs: defs, hitDMG: hitDMG, operatorBH: ["*", 1, hitDMG], regain: 2, dir: true})
            }

        } else {
            
            console.log("Fast Hit in for: " + hitDMG)
            console.log("After FastHit\n")
            conclusion({hits: hits, defs: defs, regain: 2, hit: hitDMG, dir: true})
            // defs.health = -Math.round(Math.abs(hitDMG));

            // defs.effects[Object.keys(hits.hitEffect)] = hits.hitEffect[Object.keys(hits.hitEffect)]

            // hits.regainStance_Stamina();
            // defs.regainStance_Stamina();
        }
        
    } else {

        console.log(`${defs.name} Dodging with ${defs.Dodge.dodge}/${defs.Dodge.max}&${defs.Dodge.min} vs ${hits.Accuracy.accuracy}/${hits.Accuracy.max}&${hits.Accuracy.min}`)

        if (doesDefDodge) {

            if (defs.Counter) {
                console.log("Counter hit!")
                console.log("After Counter\n")
                defs.effects.counter = {turnsBase: 1}
                conclusion({hits: hits, defs: defs, hitDMG: hitDMG, operatorHS: ["*", 1, hitDMG], operatorDS: ["*", 1, defs.baseStamina/defs.staminaSkillExpenditure], dir: true})
                // defs.curStamina = -defs.baseStamina/defs.staminaSkillExpenditure
                // console.dir(hits)
                // console.dir(defs)
            } else {
                console.log("Dodge!")
                console.log("After Dodge\n")
                conclusion({hits: hits, defs: defs, hitDMG: hitDMG, operatorHS: ["*", 1.5, hitDMG], operatorDS: ["*", 1, hitDMG], dir: true})
                // hits.curStamina = -hitDMG
                // defs.curStamina = -defs.baseStamina/defs.staminaSkillExpenditure
    
            }

        } else if (defs.Block.block) {
            console.log("Blocking with: " + defs.Block.block + " vs " + hitDMG)
            if (blockShatter (defs, hitDMG)) {
                return
            } else {
                if (defs.ShieldDeflect) {
                    console.log(`Shield Deflect!`)
                    console.log("After Shield Deflect\n")
                    hits.effects.shieldDeflect = defs.ShieldDeflect
                    conclusion({hits: hits, defs: defs, operatorHS: ["/", 2, hitDMG], operatorDS: ["*", 1, defs.baseStamina/defs.staminaSkillExpenditure], operatorBH: ["/", 2, hitDMG], dir: true})
                    // hits.curStamina = -hitDMG/2
                    // defs.curStamina = -defs.baseStamina/defs.staminaSkillExpenditure
                    // defs.blockHealth = -hitDMG/2;

                } else if (defs.Parry.parry && Object.keys(hits.hitEffect) == "hit" && hits.BlockJuke == false) {
                    console.log(`Parry!`)
                    // defs.health = -Math.abs(obj.blockDmg);
                    // defs.blockHealth = -hitDMG*1.5;
                    // hits.curStamina = -hitDMG
                    hits.effects.parry = {turnsBase: 1};

                    //   below is from block shatter
                    // hits.curStamina = -hitDMG
                    // defs.curStamina = -hitDMG/2
                    // defs.blockHealth = -hitDMG/2;

                    // defs.regainStance_Stamina();
                    if (defs.Parry.riposte) {
                        console.log(`Riposte!`)
                        console.log("After Riposte\n")
                        defs.effects.riposte = {turnsBase: defs.Parry.turnsBase}
                        // defs.curStamina = -hitDMG/2
                        // console.dir(hits)
                        // console.dir(defs)
                    }
                    conclusion({defs: defs, hits: hits, operatorBH: ["/", 1.5, hitDMG] ,operatorDS: ["/", 2, defs.baseStamina/defs.staminaSkillExpenditure], operatorHS: ["*", 1.5, hitDMG], dir: true, heal: defs})
                } else {
                    console.log("Block Successful!")
                    conclusion({hits: hits, defs: defs, operatorHS: ["/", 1, hitDMG], operatorDS: ["/", 2, hitDMG], operatorBH: ["/", 1, hitDMG], dir: true, regain: 2, heal: defs})
                    // hits.curStamina = -hitDMG
                    // defs.curStamina = -hitDMG/2
                    // defs.blockHealth = -hitDMG;

                    // hits.regainStance_Stamina();
                    // defs.regainStance_Stamina();
                }
            }
        } else {

            console.log("Direct Hit! " + Math.abs(hitDMG))
            conclusion({hits: hits, defs: defs, operatorHS: ["/", 1, hitDMG], dir: true, hit: hitDMG, regain: 0})
            // hits.curStamina = -hitDMG
            // defs.health = -Math.abs(hitDMG);
            // hits.regainStance_Stamina();

            // defs.effects[Object.keys(hits.hitEffect)] = hits.hitEffect[Object.keys(hits.hitEffect)]

            // console.log("After All\n")
            // console.dir(hits)
            // console.dir(defs)
        }
    }
}

let turn = 1
function battle (P1, P2) {

    if (P1.health > 0 && P2.health > 0) {
        battleHit(P1, P2);

        console.log(`${P1.name}- Health: ${P1.health}/${P1.baseHealth} & Armor: ${P1.armor} & Stamina: ${P1.curStamina}/${P1.baseStamina}`)
        console.log(`${P2.name}- Health: ${P2.health}/${P2.baseHealth} & Armor: ${P2.armor} & Stamina: ${P2.curStamina}/${P2.baseStamina}`)
        console.log(`\nTurn: ${turn} -------------------------------------\n`)

        turn++
    } else {
        console.log("Someone died!")
    }
}

// Helper functions <
function heal_Fighter(f1) {
    if (f1.Heal) {
        console.log("Heal to " + f1.name + " + " + f1.str*f1.stance*5 + " HP/Stamina")
        f1.curStamina = -Math.round(f1.baseStamina / f1.staminaSkillExpenditure)
        f1.health = f1.str*f1.stance*5;
        f1.stance += 0.5;
        f1.curStamina = f1.str*f1.stance*5;

    }
}

function conclusion (obj) {
    // Regain:
    // 0 def 
    // 1 hit
    // 2 both

    if (obj.operatorHS) {
        if (obj.operatorHS[0] == "*") {
            obj.hits.curStamina = -Math.abs(obj.operatorHS[2]*obj.operatorHS[1])
        } else {
            obj.hits.curStamina = -Math.abs(obj.operatorHS[2]/obj.operatorHS[1])
        }
    }

    if (obj.operatorDS) {
        if (obj.operatorDS[0] == "*") {
            obj.defs.curStamina = -Math.abs(obj.operatorDS[2]*obj.operatorDS[1])
        } else {
            obj.defs.curStamina = -Math.abs(obj.operatorDS[2]/obj.operatorDS[1])
        }
    }

    if (obj.operatorBH) {
        if (obj.operatorBH[0] == "*") {
            obj.defs.blockHealth -= Math.abs(obj.operatorBH[2]*obj.operatorBH[1])
        } else {
            obj.defs.blockHealth -= Math.abs(obj.operatorBH[2]/obj.operatorBH[1])
        }
    }


    if (obj.heal) {
        heal_Fighter(obj.heal)
    } 

    if (obj.hit) {
        obj.defs.effects[Object.keys(obj.hits.hitEffect)] = obj.hits.hitEffect[Object.keys(obj.hits.hitEffect)]
        obj.defs.health = -Math.abs(obj.hit)
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
        console.dir(obj.hits)
        console.dir(obj.defs)
    }
}

function blockShatter (defs, hitDMG) {
    let _break = false
    console.log("Block Shatter Check.")
    let biggestToStamina = [0]
    let biggestToBlockHealth = [0]
    let biggestToHealth = [0]

    let dmgToRoll = defs.Block.block - hitDMG
    if (dmgToRoll < 0) {
        console.log("Block Break! " + dmgToRoll)
        biggestToStamina.push(defs.Block.block/2) 
        biggestToBlockHealth.push(defs.Block.block)
        biggestToHealth.push(Math.abs(dmgToRoll))

        defs.effects.blockShatter = {turnsBase: 1}
        _break = true
    }
    
    let dmgToS = defs.curStamina - hitDMG/2
    if (dmgToS < 0) {
        console.log("Stamina Break! " + dmgToS)
        biggestToStamina.push(hitDMG / 2)
        if (dmgToRoll < 0) {
            biggestToBlockHealth.push(defs.Block.block)
        } else {
            biggestToBlockHealth.push(hitDMG)
        }
        biggestToHealth.push(Math.abs(dmgToS*2))
        defs.effects.blockShatter = {turnsBase: 2}
        _break = true
    }
    
    let dmgToBH = defs.blockHealth - hitDMG
    if (dmgToBH < 0) {
        console.log("Block health Break! " + dmgToBH)
        biggestToStamina.push(Math.abs(dmgToBH / 2))
        biggestToBlockHealth.push(hitDMG)
        biggestToHealth.push(Math.abs(dmgToBH))
        defs.effects.blockShatter = {turnsBase: 2}
        _break = true
    }

    console.log(`S ${Math.max(...biggestToStamina)} || BH ${Math.max(...biggestToBlockHealth)} || H ${Math.max(...biggestToHealth)}`)
    defs.curStamina = -Math.max(...biggestToStamina)
    defs.blockHealth -= Math.max(...biggestToBlockHealth)
    defs.health = -Math.max(...biggestToHealth)

    return _break
}

// Helper functins >

function battleTest (P1, P2) {
    let turn = 1
    while (P1.health > 0 && P2.health > 0) {
        battleHit(P1, P2);

        console.log(`${P1.name}- Health: ${P1.health}/${P1.baseHealth} & Armor: ${P1.armor} & Stamina: ${P1.curStamina}/${P1.baseStamina}`)
        console.log(`${P2.name}- Health: ${P2.health}/${P2.baseHealth} & Armor: ${P2.armor} & Stamina: ${P2.curStamina}/${P2.baseStamina}`)
        console.log(`\nTurn: ${turn} -------------------------------------\n`)

        turn++
    }
}

// battleTest (Rogue2, Paladin2);

// battle(Rogue2, Paladin2);

        // if ( P1.health < 0 && key != 0) {
        //     console.log("A new Challenger! \n" + key)
        //     switch (key) {
        //         case 1:
        //             P1 = Rogue3
        //             break;

        //         case 2:
        //             P1 = Paladin3
        //             break;

        //         case 3:
        //             P1 = Fighter3
        //             break;
            
        //         default:
        //             break;
        //     }
        //     turn = 0
        //     key--
        // }

        // In switch use [key]
