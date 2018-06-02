"use strict";
addTemplates("HENCHMEN", "Legendary", [
// CARDNAME: Doombot Legion
// FIGHT: Look at the top two cards of your deck. KO one of them and put the other back.
// ATTACK: 3
makeHenchmenCard("Doombot Legion", 3, {
  fight: ev => lookAtDeckEv(ev, 2, ev => selectCardAndKOEv(ev, playerState.revealed))
}),
// CARDNAME: Hand Ninjas
// FIGHT: You get +1 Recruit.
// ATTACK: 3
makeHenchmenCard("Hand Ninjas", 3, {
  fight: ev => addRecruitEvent(ev, 1)
}),
// CARDNAME: Savage Land Mutates
// FIGHT: When you draw a new hand of cards at the end of this turn, draw an extra card.
// ATTACK: 3
makeHenchmenCard("Savage Land Mutates", 3, {
  fight: () => addEndDrawMod(1)
}),
// CARDNAME: Sentinel
// FIGHT: KO one of your Heroes.
// ATTACK: 3
makeHenchmenCard("Sentinel", 3, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes())
}),
]);

addTemplates("HENCHMEN", "Dark City", [
// {BRIBE}
// FIGHT: KO one of your Heroes.
// ATTACK: 4*
makeHenchmenCard("Maggia Goons", 4, {
  bribe: true,
  fight: ev => selectCardAndKOEv(ev, yourHeroes())
}),
// FIGHT: Reveal a [Tech] Hero or KO one of your Heroes with an Attack icon.
// ATTACK: 3
makeHenchmenCard("Phalanx", 3, {
  fight: ev => revealOrEv(ev, Color.TECH, () => selectCardAndKOEv(ev, yourHeroes().limit(c => c.printedAttack !== undefined))),
}),
]);
