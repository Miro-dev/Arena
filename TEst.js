let effects = {
    shieldBash: {dmg: 25, turnsBase: 2},
    counter: false,
    riposte: {asModifier: [-5, 1]}
}

let turn = 1
function forrr () {
    console.log(turn)
    for (let key in effects) {
        console.log(key)
        if (effects.hasOwnProperty(key)) {
            switch (key) {
                case "shieldBash":
                    // if (effects[key].turns) {
                    //     console.log(`${key} turns ${effects[key].turns}`)
                    //     if (effects[key].turns === 1) {
                    //         console.log(`Delete ${key}\n`)
                    //         delete effects[key]
                    //     } else {
                    //         console.log(`${key} Turns != to 0. Turn -1`)
                    //         effects[key].turns -=1;
                    //         console.log(effects[key].dmg)
                    //     }
                    // } else {
                    //     console.log(`${key} no Turns. Turn = 1`)
                    //     effects[key].turns = 1;
                    //     console.log(effects[key].turns)
                    //     console.log(`affected by ${key}`)
                    // }

                    if (effects[key].turns === undefined) {
                        // Initial Effect
                        effects[key].turns = effects[key].turnsBase
                        effects[key].turns -= 1
                        console.log("Initaial Eff")
                    } else if (effects[key].turns <= 0){
                        // Deleteion
                        console.log("Deletion")
                        delete effects[key]
                    } else if (effects[key].turns < effects[key].turnsBase) { // Add turnsBase to all Effects
                        // Standing Effect
                        console.log("Standing Effect")
                        effects[key].turns -= 1
                    }

                    break;
    
                // case "counter":
                //     effects[key].turns = 1;
                //     if (effects[key].turns === 0) {
                //         console.log(`Dwlete by ${key}`)
                //         delete effects[key]
                //     }
                //     effects[key].turns -=1;
                // console.log(`CCC affected by curEf`);
                //     break;
    
                // case "riposte":
                //     effects[key].turns = 1;
                //     if (effects[key].turns === 0) {
                //         console.log(`Dwlete by ${key}`)
                //         delete effects[key]
                //     }
                //     effects[key].turns -=1;
                //     console.log(`affected by ${key}`)
                //     break;
            
                default:
                    break;
            }
        }
    }
    console.log(effects)
    turn++
}

// forrr()

// forrr()

// forrr()

// let b = {ss: 2}
// let v = {ssss: 4}
// b.turn = 0
// console.log(v.turn)
// let c = undefined

// if (0 === undefined) {
//     console.log("Puh")
// }


// function roundToTwo(num) {    
//     return +(Math.round(num + "e+2")  + "e-2");
// }

// for (let key in effects) {

//     if (effects.hasOwnProperty(key)) {

//         let curEffect = effects[key];
//         console.log(key)
//         console.log(curEffect)

//         switch (key) {
//             case "dodge":
//                 console.log(key)
//                 console.log(effects.dodge)
//                 effects[key].turn = 1
//                 console.log(effects.dodge.turn)
//                 break;

//             default:
//                 break;
//         }
//     }
// }
// Testing Parry functinality
// function parryRoll () {
//     let parryChance = Math.round(((8 + 5) / (11 + 5)) * 10)
//     let max = 20
//     let min = 1
//     let parryR = 6
//     let riposteMargin = (max - parryChance)/2 + parryChance;
//     console.log(`needs more than ${parryChance} to Parry and more than ${riposteMargin} to Riposte. 
//     Gets ${parryR} for ${parryChance}/${riposteMargin}!`)
//     if (parryChance <= parryR || parryChance > 20) {      
//         if (parryR <= riposteMargin) {
//             // Parry + Riposte
//             return Parry = {parry: true, riposte: false, turnsBase: 1}
//         }
//         // Only Parry
//         return Parry = {parry: true, riposte: true, turnsBase: 1}
//     } else {
//         return Parry = {parry: false, riposte: false, turnsBase: 1}
//     }
// }

// console.log(parryRoll())

let b = {operator: ['*',2]}
console.log(b.operator[1])