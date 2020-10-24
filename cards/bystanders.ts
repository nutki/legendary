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
[ 3, makeBystanderCard("Engineer", ev => revealPlayerDeckEv(ev, 1, cards => cards.limit(c => !c.cost).each(c => KOEv(ev, c)), ev.who)) ],
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
[ 1, makeGainableCard(makeBystanderCard("Cypher"), u, u, Color.TECH, "X-Men", "D", ev => lookAtDeckEv(ev, 2, cards => {
  selectCardEv(ev, "Choose a card to draw", cards, c => drawCardEv(ev, c));
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
// 2+ Attack.
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
  playerState === ev.who && withCity('ROOFTOPS', d => isCityEmpty(d) && addRecruitEvent(ev, 1));
  playerState === ev.who && withCity('BRIDGE', d => isCityEmpty(d) && addRecruitEvent(ev, 1));
}) ],
// RESCUE: look at the top three cards of your deck. KO one, discard one, and put one back.
[ 1, makeBystanderCard("Triage Nurse", ev => lookAtThreeEv(ev, 'KO', 'DISCARD', undefined, ev.who)) ],
]);
addBystanderTemplates("Dimensions", [
// RESCUE: you may move a Villain to an adjacent city space. If another Villain is already there, swap them.
[ 1, makeBystanderCard("Bulldozer Driver", ev => {
  selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
    selectCardEv(ev, "Choose a new city space", gameState.city, dest => swapCardsEv(ev, v.location, dest), ev.who);
  }, () => {}, ev.who);
}) ],
// RESCUE: play a copy of one of your S.H.I.E.L.D. Heroes or HYDRA Allies.
[ 1, makeBystanderCard("Double Agent of S.H.I.E.L.D.", ev => {
  playerState === ev.who && selectCardEv(ev, "Choose a Hero to copy", yourHeroes().limit(isShieldOrHydra), c => playCopyEv(ev, c));
}) ],
// RESCUE: put any number of Heroes from the HQ on the bottom of the Hero Deck.
[ 1, makeBystanderCard("Forklift Driver", ev => {
  selectObjectsAnyEv(ev, "Choose Heroes to put on the bottom of the Hero Deck", hqHeroes(), c => moveCardEv(ev, c, gameState.herodeck, true), ev.who);
}) ],
// RESCUE: guess "zero" or "not zero." Then reveal the top card of your deck and check its cost. If you guessed right, draw that card.
[ 1, makeBystanderCard("Fortune Teller", ev => {
  chooseOptionEv(ev, "Guess", [{l:"Zero",v:true}, {l:"Not zero", v:false}], v => drawIfEv(ev, c => (c.cost === 0) === v, undefined, ev.who), ev.who);
}) ],
// This Bystander is worth +1 Victory Points for each Hero you have that costs 7 Cost or more among all your cards at the end of the game.
// VP: 1*
[ 1, makeBystanderCard("Photographer", () => {}, c => c.printedVP + owned(owner(c)).limit(isHero).count(c => c.printedCost >= 7)) ],
// RESCUE: say a Hero name. Then reveal the top three cards of your deck. Put one of those cards with that exact Hero name into your hand. Put the rest back in any order.
[ 1, makeBystanderCard("Stan Lee", ev => {
  const names = owned(ev.who).limit(isHero).unique(c => c.heroName).map(n => ({l:n, v:n}));
  chooseOptionEv(ev, "Choose a Hero name", names, n => revealPlayerDeckEv(ev, 3, cards => cards.limit(c => c.heroName === n).each(c => {
    moveCardEv(ev, c, playerState.hand);
  }), ev.who), ev.who);
}) ],
]);
addBystanderTemplates("Revelations", [
// RESCUE: each player reveals the top card of their deck. Judge one of those cards to be the "best in show." That player draws that card.
[ 1, makeBystanderCard("Dog Show Judge", ev => {
  const revealed: Card[] = [];
  eachPlayer(p => revealPlayerDeckEv(ev, 1, cards => cards.each(c => revealed.push(c)), p));
  cont(ev, () => selectCardEv(ev, "Choose a card for a player to draw", revealed, c => drawCardEv(ev, c, owner(c))));
}) ],
// RESCUE: reveal the top 3 cards of your deck. Draw each of them that has at least 10 words of rules text. Put the rest back in any order. (Numerals, icons, and punctuation don't count.)
[ 1, makeBystanderCard("Lawyer", ev => revealPlayerDeckEv(ev, 3, cards => {
  cards.limit(hasFlag("T")).each(c => drawCardEv(ev, c)); // TODO 10+ rule words flag
})) ],
// RESCUE: choose Recruit or Attack. Then {HYPERSPEED 3} for that icon.
[ 1, makeBystanderCard("Rocket Test Pilot", ev => hyperspeedEv(ev, 3, "CHOOSE")) ],
]);
addBystanderTemplates("Into the Cosmos", [
// RESCUE: gain a Shard.
[ 1, makeBystanderCard("Legendary Game Designer", ev => gainShardEv(ev, 1, ev.who)) ],
// RESCUE: each player with the most Victory Points draws a card. (Your VP includes this Bystander.)
[ 1, makeBystanderCard("Board Gamer", ev => {
  const maxVp = gameState.players.max(currentVP);
  eachPlayer(p => maxVp === currentVP(p) && drawEv(ev, 1, p));
}) ],
// RESCUE: choose one: Draw a card now, or draw an extra card when you draw a new hand of cards at the end of this turn.
[ 1, makeBystanderCard("Pizza Delivery Guy", ev => ev.who !== playerState ? drawEv(ev, 1, ev.who) :
  chooseOneEv(ev, "Choose one", ["Draw now", () => drawEv(ev)], ["Draw at the end of turn", () => addEndDrawMod(1)])
) ],
]);
