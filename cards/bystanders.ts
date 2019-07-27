"use strict";
addBystanderTemplates("Legendary", [[ 30, makeBystanderCard("Bystander") ]]);
addBystanderTemplates("Dark City", [
// RESCUE: draw a card.
[ 4, makeBystanderCard("News Reporter", ev => drawEv(ev, 1, ev.who)) ],
// RESCUE: you may KO a Wound from your hand or from any player's discard pile.
[ 3, makeBystanderCard("Paramedic", ev => selectCardOptEv(ev, "KO a Wound", ev.who.hand.deck.concat(gameState.players.map(p => p.discard.deck).merge()).limit(isWound), c => KOEv(ev, c), undefined, ev.who)) ],
// RESCUE: you may KO one of your Heroes or a Hero from your discard pile.
[ 4, makeBystanderCard("Radiation Scientist", ev => selectCardOptEv(ev, "KO your Hero", yourHeroes(ev.who).concat(ev.who.discard.deck).limit(isHero), c => KOEv(ev, c), undefined, ev.who)) ],
]);
addBystanderTemplates("Villains", [
[ 30, makeBystanderCard("Bystander") ],
// RESCUE: draw an extra card when you draw a new hand at the end of your turn.
[ 3, makeBystanderCard("Computer Hacker", ev => playerState === ev.who ? addEndDrawMod(1) : addFutureTrigger(() => addEndDrawMod(1), ev.who)) ],
// RESCUE: reveal the top card of your deck. If it costs 0 - KO it.
[ 3, makeBystanderCard("Engineer", ev => lookAtDeckEv(ev, 1, () => ev.who.revealed.limit(c => !c.cost).each(c => KOEv(ev, c)), ev.who)) ],
// RESCUE: gain 1 recruit.
[ 3, makeBystanderCard("Public Speaker", ev => playerState === ev.who && addRecruitEvent(ev, 1)) ],
// RESCUE: kidnap another Bystander.
[ 3, makeBystanderCard("Rockstar", ev => rescueByEv(ev, ev.who)) ],
]);
addBystanderTemplates("Secret Wars Volume 1", [
// RESCUE: you get +2 Recruit, usable only to recruit Heroes in the HQ space under the Bank.
[ 3, makeBystanderCard("Banker", ev => playerState === ev.who && addRecruitSpecialEv(ev, c => isLocation(c.location.below, 'BANK'), 2)) ],
]);
addBystanderTemplates("Secret Wars Volume 2", [
// RESCUE: {PATROL Sewers}: If it's empty, you get +2 Recruit.
[ 3, makeBystanderCard("Alligator Trapper", ev => playerState === ev.who && patrolCity('SEWERS', () => addRecruitEvent(ev, 2))) ],
// RESCUE: this card becomes a Villain with 3 Attack and enters the city. It gains the ability: "<b>Fight</b>: KO one of your Heroes."
[ 4, makeBystanderCard("Shapeshifted Copycat", ev => {
  addStatSet('isVillain', c => c === ev.source, () => true);
  addStatSet('defense', c => c === ev.source, () => 3);
  addStatSet('fight', c => c === ev.source, () => ev => selectCardAndKOEv(ev, yourHeroes()));
  villainDrawEv(ev, ev.source);
}) ],
// RESCUE: a player of your choice gains a S.H.I.E.L.D. Officer.
[ 3, makeBystanderCard("Undercover Agent", ev => choosePlayerEv(ev, p => gameState.officer.withTop(c => gainEv(ev, c)))) ],
]);
addBystanderTemplates("Civil War", [
// RESCUE: gain a Sidekick.
[ 4, makeBystanderCard("Aspiring Hero", ev => gainSidekickEv(ev, undefined, ev.who)) ],
// RESCUE: reveal the top three cards of the Hero Deck. The player of your choice gains one of them that costs 3 or less. Put the rest back in any order.
[ 3, makeBystanderCard("Comic Shop Keeper", ev => revealHeroDeckEv(ev, 3, cards => {
  choosePlayerEv(ev, p => selectCardEv(ev, "Select a card for that player to gain", cards.limit(c => c.cost <= 3), c => gainEv(ev, c, p), ev.who), ev.who)
}, false, false)) ],
]);
addBystanderTemplates("Noir", [
// RESCUE: <b>Investigate</b> the Villain Deck for a Villain worth 1 VP and put it in your Victory Pile.
[ 1, makeBystanderCard("Detective Wolverine", ev => investigateEv(ev, c => isVillain(c) && c.vp === 1, gameState.villaindeck, c => {
  moveCardEv(ev, c, ev.who.victory);
}, ev.who)) ],
]);
addBystanderTemplates("X-Men", [
// TEAM: X-Men
// CLASS: [Tech]
// Look at the top two cards of your deck. Draw one and discard the other.
// COST: 2
[ 1, makeGainableCard(makeBystanderCard("Cypher"), u, u, Color.TECH, "X-Men", "D", ev => lookAtDeckEv(ev, 2, () => {
  selectCardEv(ev, "Choose a card to draw", playerState.revealed.deck, c => drawCardEv(ev, c));
  cont(ev, () => playerState.revealed.each(c => discardEv(ev, c)));
}), { printedCost: 2 }) ],
// CLASS: [Tech]
// {POWER Tech} You may KO a card from your hand or discard pile.
// RECRUIT: 2
// COST: 3
[ 1, makeGainableCard(makeBystanderCard("Heartless Computer Scientist"), 2, u, Color.TECH, u, "D", ev => superPower(Color.TECH) && KOHandOrDiscardEv(ev, undefined), { printedCost: 3 }) ],
// TEAM: X-Men
// CLASS: [Covert]
// Reveal the top card of the Hero Deck. You get +Attack equal to its printed Attack.
// ATTACKG: 0+
// COST: 3
[ 1, makeGainableCard(makeBystanderCard("Karma"), u, 0, Color.COVERT, "X-Men", "", ev => revealHeroDeckEv(ev, 1, cards => addAttackEvent(ev, cards.sum(c => c.printedAttack || 0))), { printedCost: 3 }) ],
// TEAM: X-Men
// CLASS: [Ranged]
// Teleport (Instead of playing this card, you may set it aside. At the end of the turn, add it to your hand as an extra card.)
// ATTACKG: 2
// COST: 4
[ 1, makeGainableCard(makeBystanderCard("Magik"), u, 2, Color.RANGED, "X-Men", "D", [], { teleport: true, printedCost: 4 }) ],
// TEAM: X-Men
// CLASS: [Ranged]
// Chose one: Draw a card or you get +2 Attack.
// ATTACKG: 0+
// COST: 3
[ 1, makeGainableCard(makeBystanderCard("Magma"), u, 0, Color.RANGED, "X-Men", "D", ev => chooseOneEv(ev, "Choose one", ["Draw a card", () => drawEv(ev)], ["Get +2 Attack", () => addAttackEvent(ev, 2)]), { printedCost: 3 }) ],
// CLASS: [Instinct]
// Draw a card.
// ATTACKG: 1
// COST: 3
[ 1, makeGainableCard(makeBystanderCard("Martial Arts Master"), u, 1, Color.INSTINCT, u, "", ev => drawEv(ev, 1), { printedCost: 3 }) ],
// TEAM: X-Men
// CLASS: [Covert]
// Draw a card.
// RECRUIT: 1
// COST: 3
[ 1, makeGainableCard(makeBystanderCard("Mirage"), 1, u, Color.COVERT, "X-Men", "", ev => drawEv(ev, 1), { printedCost: 3 }) ],
// TEAM: X-Men
// CLASS: [Strength]
// {POWER Strength} You get +1 Attack.
// 2+ Attack. FIX
// COST: 3
[ 1, makeGainableCard(makeBystanderCard("Sunspot"), u, 2, Color.STRENGTH, "X-Men", "D", ev => superPower(Color.STRENGTH) && addAttackEvent(ev, 1), { printedCost: 3 }) ],
// TEAM: X-Men
// CLASS: [Tech]
// {POWER Tech} Draw a card.
// ATTACKG: 2
// COST: 3
[ 1, makeGainableCard(makeBystanderCard("Warlock"), u, 2, Color.TECH, "X-Men", "D", ev => superPower(Color.TECH) && drawEv(ev, 1), { printedCost: 3 }) ],
// TEAM: X-Men
// CLASS: [Instinct]
// {BERSERK}, {BERSERK}, {BERSERK}
// ATTACKG: 0+
// COST: 3
[ 1, makeGainableCard(makeBystanderCard("Wolfsbane"), u, 0, Color.INSTINCT, "X-Men", "", ev => berserkEv(ev, 3), { printedCost: 3 }) ],
]);
addBystanderTemplates("Spider-Man Homecoming", [
// RESCUE: reveal the top two cards of your deck. Put any that cost 2 or less into your hand. Put the rest back in any order.
[ 1, makeBystanderCard("Damage Control", ev => revealPlayerDeckEv(ev, 2, cards => cards.limit(c => c.cost <= 2).each(c => moveCardEv(ev, c, ev.who.hand)), ev.who)) ],
]);
addBystanderTemplates("World War Hulk", [
// RESCUE: choose a Hero in the HQ that costs 4 or less. You get its printed Recruit and Attack.
[ 1, makeBystanderCard("Actor", ev => playerState === ev.who && selectCardEv(ev, "Choose a Hero", hqHeroes().limit(c => c.cost <= 4), c => {
  addAttackEvent(ev, c.printedAttack || 0);
  addRecruitEvent(ev, c.printedRecruit || 0);
})) ],
// RESCUE: each [Instinct] and/or [Covert] Hero currently in the HQ costs 1 less this turn.
[ 1, makeBystanderCard("Animal Trainer", ev => hqHeroes().limit(c => isColor(Color.INSTINCT)(c) || isColor(Color.COVERT)(c)).each(c => {
  addTurnMod('cost', v => v === c, -1);
})) ],
// RESCUE: you get +1 Recruit if the Rooftops are empty and +1 Recruit if the Bridge is empty.
[ 1, makeBystanderCard("Tourist Couple", ev => {
  withCity('ROOFTOPS', d => isCityEmpty(d) && addRecruitEvent(ev, 1));
  withCity('BRIDGE', d => isCityEmpty(d) && addRecruitEvent(ev, 1));
}) ],
// RESCUE: look at the top three cards of your deck. KO one, discard one, and put one back.
[ 1, makeBystanderCard("Triage Nurse", ev => lookAtDeckEv(ev, 3, () => {
  let card: Card;
  selectCardEv(ev, "Choose a card to KO", playerState.revealed.deck, c => { card = c; KOEv(ev, c); });
  cont(ev, () => selectCardEv(ev, "Choose a card to discard", playerState.revealed.limit(c => c !== card), c => discardEv(ev, c)));
})) ],
]);
