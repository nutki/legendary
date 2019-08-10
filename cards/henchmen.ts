"use strict";
addTemplates("HENCHMEN", "Legendary", [
// CARDNAME: Doombot Legion
// FIGHT: Look at the top two cards of your deck. KO one of them and put the other back.
// ATTACK: 3
makeHenchmenCard("Doombot Legion", 3, {
  fight: ev => lookAtDeckEv(ev, 2, () => selectCardAndKOEv(ev, playerState.revealed.deck))
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
  fight: ev => selectCardEv(ev, "Choose a card to KO", [...hqHeroes(), ...playerState.discard.deck], c => { KOEv(ev, c); hasRecruitIcon(c) && addRecruitEvent(ev, 1); }),
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
addTemplates("HENCHMEN", "Secret Wars Volume 2", [
// While in the Sewers, Rooftops or Bridge, this is in "wolf form" and gets +2 Attack.
// FIGHT: KO one of your Heroes.
// ATTACK: 3
makeHenchmenCard("Khonshu Guardians", 3, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  varDefense: c => c.printedDefense + (isLocation(c.location, 'SEWERS', 'ROOFTOPS', 'BRIDGE') ? 2 : 0),
}),
// FIGHT: KO one of your Heroes.
// {FATEFULRESURRECTION}
// ATTACK: 3
makeHenchmenCard("Magma Men", 3, {
  fight: [ ev => selectCardAndKOEv(ev, yourHeroes()), fatefulResurrectionEv ],
}),
// AMBUSH: This captures a Bystander.
// FIGHT: The next Hero you gain this turn has Wall-Crawl.
// ATTACK: 3
makeHenchmenCard("Spider-Infected", 3, {
  fight: ev => captureEv(ev, ev.source),
  ambush: ev => turnState.nextHeroRecruit = 'DECK',
}),
]);
addTemplates("HENCHMEN", "Civil War", [
// This gets +1 Attack for each other Mandroid in your Victory Pile.
// FIGHT: KO one of your Heroes.
// ATTACK: 2+
makeHenchmenCard("Mandroid", 2, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  varDefense: c => c.printedDefense + playerState.victory.count(isGroup("Mandroid")),
}),
// S.H.I.E.L.D. Clearance
// FIGHT: KO a card from your discard pile.
// ATTACK: 3*
makeHenchmenCard("Cape-Killers", 3, {
  fight: ev => selectCardAndKOEv(ev, playerState.discard.deck),
  ...shieldClearance,
}),
]);
addTemplates("HENCHMEN", "X-Men", [
// This Villain gets +1 Attack for each Bystander in the KO pile.
// FIGHT: KO one of your Heroes. Then KO a Bystander from the Bystander Stack.
// ATTACK: 1+
makeHenchmenCard("The Brood", 1, {
  fight: [ ev => selectCardAndKOEv(ev, yourHeroes()), ev => gameState.bystanders.withTop(c => KOEv(ev, c)) ],
  varDefense: c => c.printedDefense + gameState.ko.count(isBystander),
}),
// FIGHT: Reveal the top card of your deck. If it costs 0, KO it. Otherwise, you get +1 Recruit.
// ATTACK: 3
makeHenchmenCard("Hellfire Cult", 3, {
  fight: ev => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost === 0) ? cards.each(c => KOEv(ev, c)) : addRecruitEvent(ev, 1)),
}),
// FIGHT: KO one of your Heroes. Then, reveal the top card of the Villain Deck. If it's a Henchman Villain, play it.
// ATTACK: 3
makeHenchmenCard("Sapien League", 3, {
  fight: [ ev => selectCardAndKOEv(ev, yourHeroes()), ev => revealVillainDeckEv(ev, 1, cards => cards.limit(isHenchman).each(c => villainDrawEv(ev, c))) ],
}),
// AMBUSH: The Villain captures a Human Shield.
// FIGHT: KO one of your Heroes.
// ATTACK: 2*
makeHenchmenCard("Shi'ar Death Commandos", 2, {
  fight: ev => captureShieldEv(ev, ev.source),
  ambush: ev => selectCardAndKOEv(ev, yourHeroes()),
}),
// FIGHT: The next Hero you recruit this turn has {SOARING FLIGHT}.
// ATTACK: 3
makeHenchmenCard("Shi'ar Patrol Craft", 3, {
  fight: ev => turnState.nextHeroRecruit = "SOARING",
}),
]);
addTemplates("HENCHMEN", "World War Hulk", [
// FIGHT: {FEAST}. If Cytoplasm Spikes feasts on a non-grey Hero, you get +2 Recruit.
// ATTACK: 3
makeHenchmenCard("Cytoplasm Spikes", 3, {
  fight: ev => feastEv(ev, c => isNonGrayHero(c) && addRecruitEvent(ev, 2)),
}),
// FIGHT: If you {OUTWIT} these Death's Heads, KO one of your cards that costs 0.
// ATTACK: 3
makeHenchmenCard("Death's Heads", 3, {
  fight: ev => mayOutwitEv(ev, () => selectCardAndKOEv(ev, revealable().limit(c => c.cost === 0))),
}),
// FIGHT: Look at the top card of your deck. Put it back on the top or bottom. Then {FEAST}.
// ATTACK: 3
makeHenchmenCard("Sakaaran Hivelings", 3, {
  fight: [
    ev => lookAtDeckEv(ev, 1, () => selectCardOptEv(ev, "Choose a card to put on the bottom of your deck", playerState.revealed.deck, c => moveCardEv(ev, c, playerState.deck, true))),
    feastEv,
  ]
}),
]);
addTemplates("HENCHMEN", "Dimensions", [
// FIGHT: Reveal the top card of your deck. If it costs 0 Cost, KO it. Otherwise, draw it.
// ATTACK: 3
makeHenchmenCard("Circus of Crime", 3, {
  fight: ev => revealPlayerDeckEv(ev, 1, cards => {
    cards.limit(c => c.cost === 0).each(c => KOEv(ev, c));
    cards.limit(c => c.cost !== 0).each(c => drawCardEv(ev, c));
  }),
}),
// FIGHT: Reveal the top two cards of your deck. Put any that cost 2 Cost or less into your hand. Put the rest back in any order.
// ATTACK: 3
makeHenchmenCard("Spider-Slayer", 3, {
  fight: ev => revealPlayerDeckEv(ev, 2, cards => {
    cards.limit(c => c.cost <= 2).each(c => moveCardEv(ev, c, playerState.hand));
  }),
}),
]);
