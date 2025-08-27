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
  selectCardEv(ev, "Choose a card to draw", cards, c => {
    drawCardEv(ev, c);
    cards.limit(c1 => c1 !== c).each(c => discardEv(ev, c));
  });
}), { printedCost: 2 }) ],
// CLASS: [Tech]
// {POWER Tech} You may KO a card from your hand or discard pile.
// RECRUIT: 2
// COST: 3
[ 1, makeGainableCard(makeBystanderCard("Heartless Computer Scientist"), 2, u, Color.TECH, u, "D", ev => superPowerEv(ev, Color.TECH, () => KOHandOrDiscardEv(ev, undefined)), { printedCost: 3 }) ],
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
[ 1, makeGainableCard(makeBystanderCard("Sunspot"), u, 2, Color.STRENGTH, "X-Men", "D", ev => superPowerLikelyEv(ev, Color.STRENGTH, () => addAttackEvent(ev, 1)), { printedCost: 3 }) ],
// TEAM: X-Men
// CLASS: [Tech]
// {POWER Tech} Draw a card.
// ATTACKG: 2
// COST: 3
[ 1, makeGainableCard(makeBystanderCard("Warlock"), u, 2, Color.TECH, "X-Men", "D", ev => superPowerEv(ev, Color.TECH, () => drawEv(ev, 1)), { printedCost: 3 }) ],
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
addBystanderTemplates("Marvel Studios Phase 1", [
[ 30, makeBystanderCard("Bystander") ],
// RESCUE: you may KO a Wound from your hand or from any player's discard pile. "Dark City"/"Paramedic"
[ 3, makeBystanderCard("Happy Hogan", ev => selectCardOptEv(ev, "KO a Wound", ev.who.hand.deck.concat(gameState.players.map(p => p.discard.deck).merge()).limit(isWound), c => KOEv(ev, c), undefined, ev.who)) ],
// RESCUE: you may KO one of your Heroes or a Hero from your discard pile. "Dark City"/"Radiation Scientist"
[ 3, makeBystanderCard("Jane Foster", ev => selectCardOptEv(ev, "KO your Hero", yourHeroes(ev.who).concat(ev.who.discard.deck).limit(isHero), c => KOEv(ev, c), undefined, ev.who)) ],
// RESCUE: draw a card. "Dark City"/"News Reporter"
[ 3, makeBystanderCard("Peggy Carter", ev => drawEv(ev, 1, ev.who)) ],
// RESCUE: you get +2 Recruit, usable only to recruit Heroes in the HQ space under the Bank. "Secret Wars Volume 1"/"Banker"
[ 3, makeBystanderCard("Pepper Potts", ev => playerState === ev.who && addRecruitSpecialEv(ev, c => isLocation(c.location.below, 'BANK'), 2)) ],
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
  chooseOptionEv(ev, "Choose a Hero name", heroNameChoices(ev.who), n => revealPlayerDeckEv(ev, 3, cards => selectCardEv(ev, "Choose a card to put in hand", cards.limit(isHeroName(n)), c => {
    moveCardEv(ev, c, ev.who.hand);
  }), ev.who), ev.who);
}) ],
]);
addBystanderTemplates("Revelations", [
// RESCUE: each player reveals the top card of their deck. Judge one of those cards to be the "best in show." That player draws that card.
[ 1, makeBystanderCard("Dog Show Judge", ev => {
  revealEachPlayerDeckEv(ev, 1, cards => selectCardEv(ev, "Choose a card for a player to draw", cards.merge(), c => drawCardEv(ev, c, owner(c))));
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
addBystanderTemplates("Messiah Complex", [
// RESCUE: choose Recruit or Attack. {INVESTIGATE} for a card with that icon.
[ 1, makeBystanderCard("Private Investigator", ev => {
  chooseOptionEv(ev, "Choose an icon", [{l:"Recruit",v:hasRecruitIcon},{l:"Attack",v:hasAttackIcon}],
    cond => investigateEv(ev, cond, ev.who.deck, u, ev.who), ev.who);
}) ],
// RESCUE: {SHATTER} a Villain in the Bank or {SHATTER} a Hero in the HQ space under the Bank.
[ 1, makeBystanderCard("Opera Singer", ev => {
  const opts = [...villainIn('BANK'), ...hqHeroes().limit(c => isLocation(c.location.below, 'BANK'))];
  selectCardEv(ev, "Choose a card to shatter", opts, c => shatterEv(ev, c), ev.who);
}) ],
// RESCUE: {CLONE} the next Hero you recruit this turn that has printed cost 3 or less.
[ 1, makeBystanderCard("Cloning Technician", ev => {
  playerState === ev.who && addTurnTrigger('RECRUIT', (ev, source) => ev.what.printedCost <= 3 && !countPerTurn("onceperturntrigger", source), ev => {
    incPerTurn("onceperturntrigger", ev.source);
    cloneHeroEv(ev, ev.parent.what);
  });
}) ],
]);
addBystanderTemplates("Marvel Studios What If...?", [
[ 25, makeBystanderCard("Bystander") ],
// RESCUE: reveal the top card of the Villain Deck. If it's a Master Strike or Scheme Twist, you may shuffle that deck.
[ 1, makeBystanderCard("Happy Hogan", ev => {
  let shuffle: boolean = false;
  revealVillainDeckEv(ev, 1, cards => {
    (cards.has(isStrike) || cards.has(isTwist)) && chooseMayEv(ev, "Shuffle the Villain Deck?", () => shuffle = true, ev.who);
  });
  cont(ev, () => shuffle && gameState.villaindeck.shuffle());
}) ],
// RESCUE: reveal the top four cards of your deck. Draw each [Tech] and [Ranged] Hero you revealed. Put the rest back in any order.
[ 1, makeBystanderCard("Howard Stark", ev => {
  revealPlayerDeckEv(ev, 4, cards => {
    cards.limit(Color.TECH | Color.RANGED).each(c => drawCardEv(ev, c, ev.who));
  }, ev.who);
}) ],
// RESCUE: reveal the top four cards of the Bystander Deck. You may rescue a Special Bystander from among them, then put the rest back on the bottom of that deck.
[ 1, makeBystanderCard("Howard the Duck", ev => {
  revealDeckEv(ev, gameState.bystanders, 4, cards => {
    selectCardEv(ev, "Choose a Special Bystander", cards.limit(c => !!c.rescue), c => {
      rescueByEv(ev, ev.who, c);
    }, ev.who);
  }, false, true, ev.who);
}) ],
// RESCUE: you get +1 Recruit if the Bank is empty and +1 Recruit if the Rooftops are empty.
[ 1, makeBystanderCard("Pepper Potts", ev => {
  playerState === ev.who && withCity('ROOFTOPS', d => isCityEmpty(d) && addRecruitEvent(ev, 1));
  playerState === ev.who && withCity('BANK', d => isCityEmpty(d) && addRecruitEvent(ev, 1));
}) ],
// RESCUE: whichever player is a head <i>(has the most VP or tied for most)</i> may KO one of their cards.
[ 1, makeBystanderCard("Scott Lang's Head", ev => {
  gameState.players.highest(currentVP).each(p => selectCardOptEv(ev, "KO a card", revealable(p), c => KOEv(ev, c), undefined, p));
}) ],
]);
addBystanderTemplates("Ant-Man and the Wasp", [
// <b>Rescue</b>: Do some "close-up magic": Reveal the top two cards of your deck. The player on your left says one of those card names.
// <i>(In solo mode, say one yourself.)</i> Mix them up, reveal one, and say <i>"Is this your card?"</i> If it is, draw it. Put the rest back in any order.
[ 2, makeBystanderCard("Agent Jimmy Woo", ev => {
  revealPlayerDeckEv(ev, 2, cards => {
    const names = cards.map(c => c.cardName).map(n => ({l:n, v:n}));
    chooseOptionEv(ev, "Choose a card name", names, n => {
      cards.shuffled().firstOnly().filter(c => c.cardName === n).each(c => {
        drawCardEv(ev, c, ev.who);
      });
    }, ev.who.left);
  }, ev.who);
}) ],
// <b>Rescue</b>: You may return a card that costs 2 or less from your discard pile to your hand.
[ 2, makeBystanderCard("Maggie Lang", ev => {
  selectCardOptEv(ev, "Choose a card to return", ev.who.discard.limit(c => c.cost <= 2), c => moveCardEv(ev, c, ev.who.hand), () => {}, ev.who);
}) ],
// <b>Rescue</b>: You may defeat a Henchman.
[ 1, makeBystanderCard("Officer Jim Paxton", ev => {
  playerState === ev.who && selectCardOptEv(ev, "Choose a Henchman", fightableCards().limit(isHenchman), c => {
    defeatEv(ev, c);
  }, u, ev.who);
}) ],
// <b>Rescue</b>: You get +2 Recruit, usable only to recruit a Hero that costs 2 or less or a Hero with <b>Size-Changing</b>.
[ 2, makeBystanderCard("Young Cassie Lang", ev => {
  playerState === ev.who && addRecruitSpecialEv(ev, c => c.cost <= 2 || !hasNoSizeChanging(c), 2);
}) ],
]);
