"use strict";
addTemplates("HENCHMEN", "Legendary", [
// CARDNAME: Doombot Legion
// FIGHT: Look at the top two cards of your deck. KO one of them and put the other back.
// ATTACK: 3
makeHenchmenCard("Doombot Legion", 3, {
  fight: ev => lookAtDeckEv(ev, 2, ev => selectCardAndKOEv(ev, playerState.revealed.deck))
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
  fight: ev => revealOrEv(ev, Color.TECH, () => selectCardAndKOEv(ev, yourHeroes().limit(hasAttackIcon))),
}),
]);
addTemplates("HENCHMEN", "Villains", [
// FIGHT: Draw a card.
// ATTACK: 3
makeHenchmenCard("Asgardian Warriors", 3, {
  fight: ev => drawEv(ev),
}),
// FIGHT: Gain a New Recruit.
// ATTACK: 3
makeHenchmenCard("Cops", 3, {
  fight: ev => gameState.newRecruit.withTop(c => gainEv(ev, c)),
}),
// FIGHT: KO one of your Allies for each other Multiple Man in your Victory Pile.
// ATTACK: 3
makeHenchmenCard("Multiple Man", 3, {
  fight: ev => repeat(playerState.victory.count(c => c.cardName === "Multiple Man" && c != ev.source), () => selectCardAndKOEv(ev, yourHeroes())),
}),
// FIGHT: Discard the top card of your deck. Then KO an Ally from your discard pile.
// ATTACK: 3
makeHenchmenCard("S.H.I.E.L.D. Assault Squad", 3, {
  fight: [
    ev => playerState.deck.withTop(c => discardEv(ev, c)),
    ev => selectCardAndKOEv(ev, playerState.discard.limit(isHero)),
  ],
}),
]);
addTemplates("HENCHMEN", "Secret Wars Volume 1", [
// AMBUSH: Rise of the Living Dead
// FIGHT: Reveal a [Covert] Hero or KO one of your Heroes with an Attack icon.
// ATTACK: 3
makeHenchmenCard("Ghost Racers", 3, {
  fight: ev => revealOrEv(ev, Color.COVERT, () => selectCardAndKOEv(ev, yourHeroes().limit(hasAttackIcon))),
  ambush: raiseOfTheLivingDead,
}),
// FIGHT: KO a Hero from your discard pile or the HQ. If that Hero has a Recruit icon, you get +1 Recruit.
// ATTACK: 3
makeHenchmenCard("M.O.D.O.K.s", 3, {
  fight: ev => selectCardEv(ev, "Choose a card to KO", [...HQCards().limit(isHero), ...playerState.discard.deck], c => { KOEv(ev, c); hasRecruitIcon(c) && addRecruitEvent(ev, 1); }),
}),
// FIGHT: Gain this as a Hero.
// ATTACK: 3
// GAINABLE
// TEAM: Avengers
// CLASS: [Strength]/[Ranged]
// RECRUIT: 2+
// {POWER Strength Ranged} You get +1 Recruit.
makeGainableCard(makeHenchmenCard("Thor Corps", 3, {}, u), 2, u, Color.STRENGTH | Color.RANGED, "Avengers", "D", ev => superPower(Color.STRENGTH, Color.RANGED) && addRecruitEvent(ev, 1)),
]);
