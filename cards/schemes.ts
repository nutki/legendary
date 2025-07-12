"use strict";
addTemplates("SCHEMES", "Legendary", [
// SETUP: 8 Twists. Wound stack holds 6 Wounds per player.
// EVILWINS: If the Wound stack runs out.
makeSchemeCard("The Legacy Virus", { twists: 8, wounds: [ 6, 12, 18, 24, 30 ] }, ev => {
  // Twist: Each player reveals a [Tech] Hero or gains a Wound.
  eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainWoundEv(ev, p), p));
}, runOutProgressTrigger("WOUNDS"), () => gameState.schemeProgress = gameState.wounds.size),
// SETUP: 8 Twists. 12 total Bystanders in the Villain Deck.
// RULE: Each Villain gets +1 Attack for each Bystander it has.
// EVILWINS: When 8 Bystanders are carried away by escaping Villains.
makeSchemeCard("Midtown Bank Robbery", { twists: 8, vd_bystanders: 12 }, ev => {
  // Twist: Any Villain in the Bank captures 2 Bystanders. Then play the top card of the Villain Deck.
  villainIn('BANK').each(v => { captureEv(ev, v); captureEv(ev, v); });
  playAnotherEv(ev);
}, escapeProgressTrigger(isBystander), () => {
  addStatMod('defense', isVillain, c => c.captured.count(isBystander));
  setSchemeTarget(8);
}),
// SETUP: 8 Twists. Add an extra Henchman group to the Villain Deck.
// EVILWINS: If 12 Villains escape.
// (not anymore) Single player version based on https://boardgamegeek.com/thread/1567774/negative-zone-prison-break-out-advanced-solo
makeSchemeCard("Negative Zone Prison Breakout", { twists: 8, vd_henchmen: [ 2, 2, 2, 3, 3 ]  }, ev => {
  // Twist: Play the top 2 cards of the Villain Deck.
  villainDrawEv(ev); villainDrawEv(ev);
}, escapeProgressTrigger(isVillain), () => setSchemeTarget(12)),
// SETUP: 7 Twists. Each Twist is a Dark Portal.
makeSchemeCard("Portals to the Dark Dimension", { twists: 7 }, ev => {
  if (ev.nr === 1) { // Twist 1 Put the Dark Portal above the Mastermind. The Mastermind gets +1 Attack.
    attachCardEv(ev, ev.twist, gameState.mastermind, 'DARK_PORTAL');
  } else if (ev.nr >= 2 && ev.nr <= 6) { // Twists 2-6 Put the Dark Portal in the leftmost city space that doesn't yet have a Dark Portal. Villains in that city space get +1 Attack.
    attachCardEv(ev, ev.twist, gameState.city[ev.nr - 2], 'DARK_PORTAL');
  }
  // Twist 7 Evil Wins!
  schemeProgressEv(ev, ev.nr);
}, [], () => {
  addStatMod('defense', isEnemy, c => c.location.attached('DARK_PORTAL').size);
  setSchemeTarget(7);
}),
// SETUP: 5 Twists. 3 additional Twists next to this Scheme. 18 total Bystanders in the Villain Deck.
// RULE: Bystanders in the Villain Deck count as Killbot Villains, with Attack equal to the number of Twists next to this Scheme.
// EVILWINS: If 5 "Killbots" escape.
makeSchemeCard("Replace Earth's Leaders with Killbots", { twists: 5, vd_bystanders: 18 }, ev => {
  // Twist: Put the Twist next to this Scheme.
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
}, escapeProgressTrigger(isBystander), function () {
  let isKillbot = (c: Card) => isBystander(c) && (c.location && (c.location.isCity || c.location.id === "VILLAIN")); // TODO isCity => fightable?
  gameState.scheme.attachedDeck('TWIST').addNewCard(twistTemplate, 3);
  addStatSet('baseDefense', isKillbot, () => gameState.scheme.attached('TWIST').size);
  addStatSet('isVillain', isKillbot, () => true);
  addStatSet('villainGroup', isKillbot, () => "Killbots");
  setSchemeTarget(5);
}),
// SETUP: 8 Twists. 6 Heroes. Skrull Villain Group required. Shuffle 12 random Heroes from the Hero Deck into the Villain Deck.
// RULE: Heroes in the Villain Deck count as Skrull Villains with Attack equal to the Hero's Cost +2. If you defeat that Hero, you gain it.
// EVILWINS: If 6 Heroes get into the Escaped Villains pile.
makeSchemeCard("Secret Invasion of the Skrull Shapeshifters", { twists: 8, heroes: 6, required: { villains: "Skrulls" } }, ev => {
  // Twist: The highest-cost Hero from the HQ moves into the Sewers as a Skrull Villain, as above.
  withCity("SEWERS", d => selectCardEv(ev, "Choose a Hero to become a Skull", HQCardsHighestCost(), sel => moveCardEv(ev, sel, d)));
}, escapeProgressTrigger(isHero), function () {
  let isSkrull = (c: Card) => isHero(c) && (c.location && (c.location.isCity || c.location.id === "VILLAIN"));  // TODO isCity => fightable?
  addStatSet('baseDefense', isSkrull, c => c.cost + 2);
  addStatSet('isVillain', isSkrull, () => true);
  addStatSet('villainGroup', isSkrull, () => "Skrulls");
  addStatSet('fight', isSkrull, () => (ev: Ev) => gainEv(ev, ev.source));
  repeat(12, () => moveCard(gameState.herodeck.top, gameState.villaindeck));
  gameState.villaindeck.shuffle();
  setSchemeTarget(6);
}),
// SETUP: For 2-3 players, use 8 Twists. For 4-5 players, use 5 Twists. If only 2 players, use only 4 Heroes in the Hero Deck.
// EVILWINS: If the Hero Deck runs out.
// Single player based on https://boardgamegeek.com/thread/1127095/single-player-superhero-civil-war
makeSchemeCard("Super Hero Civil War", { twists: [ 8, 8, 8, 5, 5 ], heroes: [ 4, 4, 5, 5, 6 ]}, ev => {
  // Twist: KO all the Heroes in the HQ.
  hqHeroes().each(c => KOEv(ev, c));
}, runOutProgressTrigger("HERO"), () => gameState.schemeProgress = gameState.herodeck.size),
// SETUP: 8 Twists.
makeSchemeCard("Unleash the Power of the Cosmic Cube", { twists: 8 }, ev => {
  // Twist: Put the Twist next to this Scheme.
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  if (ev.nr >= 5 && ev.nr <= 6) { // Twist 5-6 Each player gains a Wound.
    gameState.players.forEach(p => gainWoundEv(ev, p));
  } else if (ev.nr === 7) { // Twist 7 Each player gains 3 Wounds.
    gameState.players.forEach(p => { gainWoundEv(ev, p); gainWoundEv(ev, p); gainWoundEv(ev, p); });
  } else if (ev.nr === 8) { // Twist 8 Evil Wins!
    evilWinsEv(ev);
  }
}),
]);

addTemplates("SCHEMES", "Dark City", [
// SETUP: 8 Twists. Put a token on this Scheme to represent the baby, Hope Summers.
// RULE: The Villain with the baby gets +4 Attack. If you defeat that Villain, rescue the baby to your Victory Pile (until the next Twist).
// The baby is worth 6 VP at the end of the game. If a Villain escapes with the baby, stack a Twist next to the Mastermind and return the baby to this Scheme card.
// EVILWINS: When there are 3 Twists stacked next to the Mastermind.
makeSchemeCard<{hope: Card}>("Capture Baby Hope", { twists: 8 }, ev => {
  // Twist: If a Villain has the baby, that Villain escapes. Otherwise, the baby is captured by the closest Villain to the Villain Deck. (If there are no Villains, do nothing.)
  const hope = ev.state.hope;
  const a = hope.location.attachedTo;
  if (a instanceof Card && isVillain(a)) {
    villainEscapeEv(ev, a);
    attachCardEv(ev, ev.twist, gameState.mastermind, "TWIST");
    attachCardEv(ev, hope, gameState.scheme, "BABYHOPE");
    cont(ev, () => schemeProgressEv(ev, gameState.mastermind.attached("TWIST").size));
  } else cityVillains().withLast(v => captureEv(ev, v, hope));
}, [], (s) => {
  const hopeTemplate = new Card("TOKEN", "Baby Hope");
  hopeTemplate.varVP = () => 6;
  hopeTemplate.set = "Dark City";
  s.hope = gameState.scheme.attachedDeck("BABYHOPE").addNewCard(hopeTemplate);
  addStatMod('defense', isVillain, v => v.captured.count(c => c.cardType === "BABYHOPE") * 4);
  setSchemeTarget(3);
}),
// SETUP: 8 Twists. 6 Heroes in the Hero Deck.
// RULE: Whenever a Hero is KO'd from the HQ, turn that Hero face down on that HQ space, representing an Explosion on the Helicarrier.
// When an HQ space has 6 Explosions, that space is Destroyed and can't hold Heroes anymore.
// EVILWINS: When all HQ spaces are Destroyed or the Hero Deck runs out.
makeSchemeCard("Detonate the Helicarrier", { twists: 8, heroes: 6 }, ev => {
  // Twist: Stack this Twist next to the Scheme. Then for each Twist in that stack, KO the leftmost Hero in the HQ and immediately refill that space.
  attachCardEv(ev, ev.twist, gameState.scheme, "TWIST");
  repeat(ev.nr, () => cont(ev, () => hqHeroes().withFirst(c => KOEv(ev, c))));
}, [{
  event: "KO",
  match: ev => ev.what.location.isHQ,
  replace: ev => {
    attachFaceDownCardEv(ev, ev.parent.what, ev.parent.what.location, "EXPLOSION");
    cont(ev, () => schemeProgressEv(ev, gameState.hq.count(d => d.attachedFaceDownDeck("EXPLOSION").size >= 6)));
  },
}, runOutProgressTrigger("HERO", false), {
  event: "MOVECARD",
  match: ev => ev.to.isHQ && ev.to.attachedFaceDownDeck("EXPLOSION").size >= 6,
  replace: () => {},
}], () => {
  setSchemeTarget(gameState.hq.size);
}),
// SETUP: 8 Twists.
// EVILWINS: When the number of non grey Heroes in the KO pile is 3 times the number of players.
makeSchemeCard("Massive Earthquake Generator", { twists: 8 }, ev => {
  // Twist: Each player reveals a [Strength] Hero or KOs the top card of their deck.
  eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => revealPlayerDeckEv(ev, 1, cards => cards.each(c => KOEv(ev, c)), p), p));
}, koProgressTrigger(isNonGrayHero), () => {
  setSchemeTarget(3, true);
}),
// SETUP: 8 Twists. Include 10 Maggia Goons as one of the Henchman Groups.
// RULE: Goons also have the ability "Ambush: Play another card from the Villain Deck."
// EVILWINS: When 5 Goons escape.
makeSchemeCard<{isGoon: (c: Card) => boolean}>("Organized Crime Wave", { twists: 8, solo_henchmen: [10], required: { henchmen: "Maggia Goons" } }, ev => {
  // Twist: Each Goon in the city escapes. Shuffle all Goons from each players' Victory Piles into the Villain Deck.
  cityVillains().limit(ev.state.isGoon).each(c => villainEscapeEv(ev, c));
  eachPlayer(p => p.victory.limit(ev.state.isGoon).each(c => moveCardEv(ev, c, gameState.villaindeck)));
  cont(ev, () => gameState.villaindeck.shuffle());
}, escapeProgressTrigger(c => c.cardName === "Maggia Goons"), (s) => {
  s.isGoon = c => c.cardName === "Maggia Goons";
  addStatSet('ambush', s.isGoon, () => villainDrawEv);
  setSchemeTarget(5);
}),
// SETUP: 8 Twists. 24 Bystanders in the Hero Deck. (1 player: 12 Bystanders in the Hero Deck)
// RULE: You may spend 2 Recruit to rescue a Bystander from the HQ.
// EVILWINS: When the number of Bystanders KO'd and/or carried off is 4 times the number of players.
makeSchemeCard("Save Humanity", { twists: 8 }, ev => {
  // Twist: KO all Bystanders in the HQ. Then each player reveals an [Instinct] Hero or KOs a Bystander from their Victory Pile.
  hqCards().limit(isBystander).each(c => KOEv(ev, c));
  eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => selectCardAndKOEv(ev, p.victory.limit(isBystander), p), p));
}, koOrEscapeProgressTrigger(isBystander), () => {
  setSchemeTarget(4, true);
  repeat(gameState.players.size === 1 ? 12 : 24, () => moveCard(gameState.bystanders.top, gameState.herodeck));
  gameState.herodeck.shuffle();
  gameState.specialActions = (ev) => {
    return hqCards().limit(isBystander).map(c => new Ev(ev, "PAYTORESCUE", { what: c, cost: { recruit: 2 }, func: ev => rescueEv(ev, ev.what) }));
  };
}),
// SETUP: 8 Twists representing Plutonium. Add an extra Villain Group.
// RULE: Each Villain gets +1 Attack for each Plutonium it has. When a Villain with any Plutonium is defeated, shuffle that Plutonium back into the Villain Deck.
// EVILWINS: When 4 Plutonium have been carried off by Villains.
makeSchemeCard("Steal the Weaponized Plutonium", { twists: 8, vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist: This Plutonium is captured by the closest Villain to the Villain Deck. If there are no Villains in the city, KO this Plutonium. Either way, play another card from the Villain Deck.
  cityVillains().withLast(v => captureEv(ev, v, ev.twist));
  villainDrawEv(ev);
}, [escapeProgressTrigger(isTwist), {
  event: "DEFEAT",
  before: ev => ev.parent.what.captured.limit(isTwist).each(c => shuffleIntoEv(ev, c, gameState.villaindeck)),
}], () => {
  addStatMod('defense', isVillain, c => c.captured.count(isTwist));
  setSchemeTarget(4);
}),
// SETUP: 8 Twists. Villain Deck includes 14 extra Jean Grey cards and no Bystanders.
// RULE: Each Jean Grey card counts as a "Goblin Queen" Villain. It's worth 4 VP. It has Attack equal to its Cost plus the number of Demon Goblins stacked next to the Scheme.
// EVILWINS: When 4 Goblin Queen cards escape.
makeSchemeCard("Transform Citizens Into Demons", { twists: 8, vd_bystanders: 0, heroes: [ 4, 6, 6, 6, 7 ], required: { heroes: "Jean Grey" } }, ev => {
  // Twist: Stack 5 Bystanders face down next to the Scheme. Bystanders stacked here are "Demon Goblin" Villains. They have 2 Attack. Players can fight these Demon Goblins to rescue them as Bystanders.
  repeat(5, () => cont(ev, () => gameState.bystanders.withTop(b => attachCardEv(ev, b, gameState.scheme, "GOBLIN"))));
}, escapeProgressTrigger(c => c.heroName === "Jean Grey"), () => {
  setSchemeTarget(4);
  const demonGoblins = gameState.scheme.attachedDeck("GOBLIN");
  const isGoblinQueen = (c: Card) => c.heroName === "Jean Grey";
  const isDemonGoblin = (c: Card) => c.location === demonGoblins;
  gameState.herodeck.limit(isGoblinQueen).each(c => moveCard(c, gameState.villaindeck));
  gameState.villaindeck.shuffle();
  addStatSet('baseDefense', isGoblinQueen, c => c.cost + demonGoblins.size);
  addStatSet('vp', isGoblinQueen, () => 4);
  addStatSet('baseDefense', isDemonGoblin, () => 2);
  addStatSet('fight', isDemonGoblin, () => ev => rescueEv(ev, ev.source));
  addStatSet('isVillain', isGoblinQueen, () => true);
  gameState.specialActions = (ev) => {
    const what = demonGoblins.top;
    return what ? [ fightActionEv(ev, what) ] : [];
  };
}),
// SETUP: 8 Twists. Villain Deck includes 14 cards for an extra Hero and no Bystanders.
// RULE: Whenever you play a Hero from the Villain Deck, that Hero is captured by the closest enemy to the Villain Deck.
// Each Villain gets +2 Attack for each Hero it has. When you fight an enemy, gain all the Heroes captured by that enemy.
// EVILWINS: 9 non grey Heroes are KO'd or carried off.
makeSchemeCard("X-Cutioner's Song", { twists: 8, vd_bystanders: 0, heroes: [ 4, 6, 6, 6, 7 ]  }, ev => {
  // Twist: KO all Heroes captured by enemies. Then play another card from the Villain Deck.
  fightableCards().each(e => e.captured.limit(isHero).each(h => KOEv(ev, h)));
  villainDrawEv(ev);
}, koProgressTrigger(isNonGrayHero), () => {
  setSchemeTarget(9);
  addStatMod('defense', isVillain, c => 2 * c.captured.count(isHero));
  // addStatSet('capturable', isHero, () => true); // Hardcoded
  addStatSet('rescue', isHero, () => ev => gainEv(ev, ev.source)); // TODO this should not be a rescue action
  gameState.herodeck.limit(c => c.heroName === extraHeroName()).each(c => moveCard(c, gameState.villaindeck));
  gameState.villaindeck.shuffle();
}),
]);

addTemplates("SCHEMES", "Fantastic Four", [
// SETUP: 6 Twists.
// EVILWINS: When the number of non-grey Heroes in the KO pile is six times the number of players.
makeSchemeCard("Bathe the Earth in Cosmic Rays", { twists: 6 }, ev => {
  // Twist: Each player in turn does the following: Reveal your hand. KO one of your non-grey Heroes. Choose a Hero from the HQ with the same or lower cost and put it into your hand.
  eachPlayer(p => selectCardEv(ev, "Select non-grey Hero", p.hand.limit(isNonGrayHero), c => {
    KOEv(ev, c);
    selectCardEv(ev, "Select hero to put in hand", hqHeroes().limit(h => h.cost <= c.cost), c => moveCardEv(ev, c, p.hand), p);
  }, p))
}, koProgressTrigger(isNonGrayHero), () => setSchemeTarget(6, true)),
// SETUP: 8 Twists.
// EVILWINS: When 20 non-grey Heroes are KO'd.
makeSchemeCard("Flood the Planet with Melted Glaciers", { twists: 8 }, ev => {
  // Twist: Stack the Twist next to the Scheme as "Rising Waters." Then KO each Hero from the HQ whose cost is less than or equal to the number of Rising Waters in that stack.
  attachCardEv(ev, ev.twist, gameState.scheme, "TWIST");
  cont(ev, () => {
    const waterLevel = gameState.scheme.attached("TWIST").size;
    hqHeroes().limit(c => c.cost <= waterLevel).each(c => KOEv(ev, c));
  });
}, koProgressTrigger(isNonGrayHero), () => setSchemeTarget(20)),
// SETUP: 7 Twists.
// RULE: To fight the Mastermind, you must also spend 1 Recruit or 1 Attack for each Force Field next to them.
makeSchemeCard("Invincible Force Field", { twists: 7 }, ev => {
  // Twist: Stack this Twist next to the Mastermind as a "Force Field."
  attachCardEv(ev, ev.twist, gameState.mastermind, "FORCEFIELD");
  // Twist 7 Evil Wins!
  schemeProgressEv(ev, ev.nr);
}, [], () => {
  addStatSet('fightCost', isMastermind, (c, { either, ...rest }) => ({ either: (either || 0) + c.location.attached("FORCEFIELD").size, ...rest}));
  setSchemeTarget(7);
}),
// SETUP: 8 Twists.
makeSchemeCard<{neg: boolean}>("Pull Reality Into the Negative Zone", { twists: 8 }, ev => {
  // Twist 2, 4, and 6 Until the next Twist, Enemies cost Recruit to fight and Heroes cost Attack to recruit.
  ev.state.neg = ev.nr === 2 || ev.nr === 4 || ev.nr === 6;
  // Twist 7 Evil Wins!
  schemeProgressEv(ev, ev.nr);
}, [], s => {
  setSchemeTarget(7);
  s.neg = false;
  addStatSet('fightCost', () => true, (c, base) => s.neg ? {
    ...base,
    attack: base.recruit,
    recruit: base.attack,
  } : base);
  addStatSet('recruitCost', () => true, (c, base) => s.neg ? {
    ...base,
    attack: base.recruit,
    recruit: base.attack,
  } : base);
}),
]);
addTemplates("SCHEMES", "Paint the Town Red", [
// SETUP: 8 Twists.
// EVILWINS: When 2 Villains with the same card name have escaped or the Villain Deck runs out.
makeSchemeCard("The Clone Saga", { twists: 8 }, ev => {
  // Twist: Each player reveals two non-grey Heroes with the same card name or discards down to 3 cards.
  // TODO: multiplayer reveal
  eachPlayer(p => revealOrEv(ev, c => revealable(p).limit(isNonGrayHero).count(cc => cc.cardName === c.cardName) >= 2, () => pickDiscardEv(ev, -3, p), p));
}, [
  {
    event: 'ESCAPE',
    after: ev => gameState.escaped.size > gameState.escaped.deck.uniqueCount(c => c.cardName) && evilWinsEv(ev),
  },
  runOutProgressTrigger("VILLAIN", false),
]),
// SETUP: 8 Twists. Add 6 extra Henchmen from a single Henchman Group to the Hero Deck.
// RULE: You can fight Villains in the HQ.
// EVILWINS: When there are 5 Villains in the HQ.
makeSchemeCard("Invade the Daily Bugle News HQ", { twists: 8, vd_henchmen: [2, 2, 2, 3, 3] }, ev => {
  // Twist: KO a Hero from the HQ. Put the highest-Attack Villain from the city into that HQ space.
  let space: Deck;
  addTurnTrigger('MOVECARD', ev2 => ev2.to === space && ev2.from === gameState.herodeck && ancestorEvents(ev2).includes(ev), { replace: ev => {
    selectCardOrEv(ev, "Choose a highest cost Villain", cityVillains().highest(c => c.defense), c => moveCardEv(ev, c, space), () => doReplacing(ev));
  }});
  selectCardEv(ev, "Select a Hero to KO", hqHeroes(), c => { KOEv(ev, c); space = c.location; });  
}, {
  event: 'MOVECARD',
  match: ev => ev.to.isHQ,
  after: ev => schemeProgressEv(ev, hqCards().count(isVillain)),
}, () => {
  setSchemeTarget(5);
  gameState.villaindeck.deck.filter(c => c.cardName === extraHenchmenName()).forEach((c, i) => moveCard(c, i < 6 ? gameState.herodeck : gameState.outOfGame));
  gameState.herodeck.shuffle();
  addStatSet('isFightable', c => isVillain(c) && c.location.isHQ, () => true);
}),
// SETUP: 8 Twists. Include Sinister Six as one of the Villain Groups.
// RULE: Sinister Six Villains get +3 Attack. All Hero cards have Wall-Crawl.
// EVILWINS: When 6 Sinister Six Villains have escaped or the Villain Deck runs out.
makeSchemeCard("Splice Humans with Spider DNA", { twists: 8, required: { villains: "Sinister Six" } }, ev => {
  // Twist: Each player puts a Sinister Six Villain from their Victory Pile on top of the Villain Deck. No matter how many players did so, play a single card from the Villain Deck.
  eachPlayer(p => selectCardEv(ev, "Choose Sinister Six Villain", p.victory.limit(c => c.villainGroup === "Sinister Six"), c => moveCardEv(ev, c, gameState.villaindeck), p));
  villainDrawEv(ev);
}, [
  escapeProgressTrigger(isGroup("Sinister Six")),
  runOutProgressTrigger("VILLAIN", false),
], () => {
  setSchemeTarget(6);
  addStatMod('defense', c => c.villainGroup === "Sinister Six", 3);
  addStatSet('wallcrawl', isHero, () => true);
}),
// SETUP: 7 Twists.
// RULE: Whenever you defeat a Villain, you may pay 1 Recruit. If you do, rescue a Bystander.
// You can't fight the Mastermind unless you have a Bystander in your Victory Pile for each Twist next to the Mastermind.
makeSchemeCard("Weave a Web of Lies", { twists: 7 }, ev => {
  // Twist: Stack this Twist next to the Mastermind.
  attachCardEv(ev, ev.twist, gameState.mastermind, "TWIST");
  // Twist 7 Evil Wins!
  schemeProgressEv(ev, ev.nr);
}, {
  event: 'DEFEAT',
  match: ev => isVillain(ev.what) && canPayCost(new Ev(ev, 'EFFECT', { func: rescueEv, cost: { recruit: 1 } })),
  after: ev => chooseMayEv(ev, "Pay 1 recruit to rescue a Bystander", () => pushEv(ev, 'EFFECT', { func: rescueEv, cost: { recruit: 1 } })),
}, () => {
  setSchemeTarget(7);
  addStatSet('fightCost', isMastermind, (c, prev: ActionCost) => ({
    ...prev,
    cond: c => (prev.cond ? prev.cond(c) : true) && playerState.victory.count(isBystander) >= gameState.mastermind.attached("TWIST").size,
  }));
}),
]);

addTemplates("SCHEMES", "Villains", [
// SETUP: 8 Twists. The Bindings stack holds 5 Bindings per player.
// EVILWINS: When the Bindings stack runs out.
makeSchemeCard("Build an Underground MegaVault Prison", { twists: 8, bindings: [ 5, 10, 15, 20, 25 ] }, ev => {
  // Twist: If there is an Adversary in the Sewers, each player gains a Bindings. Otherwise, reveal the top card of the Adversary Deck. If that card is an Adversary, it enters the Sewers.
  withCity('SEWERS', sewers => {
    sewers.has(isVillain) ? eachPlayer(p => gainBindingsEv(ev, p)) : revealVillainDeckEv(ev, 1, cards => cards.limit(isVillain).each(c => villainDrawEv(ev, c)));
  });
}, runOutProgressTrigger("BINDINGS"), () => gameState.schemeProgress = gameState.bindings.size),
// SETUP: 8 Twists. Stack 2 Cops per player next to this Plot.
// RULE: You can fight any Cop on top of Allies. If you do, the player of your choice gains that Ally.
// EVILWINS: When a Twist must put out a Cop, but the Cop Stack is already empty.
makeSchemeCard("Cage Villains in Power-Suppressing Cells", { twists: 8, vd_henchmen: [2, 2, 2, 3, 3], required: { henchmen: 'Cops' } }, ev => {
  // Twist: Each player returns all Cops from their Victory Pile to the Cop Stack. Then each player puts a non-grey Ally from their hand in front of them. Put a Cop from the Cop Stack on top of each of those Allies.
  const copStack = gameState.scheme.attachedDeck('COPS');
  eachPlayer(p => p.victory.limit(isGroup('Cops')).each(c => moveCardEv(ev, c, copStack)));
  eachPlayer(p => selectCardEv(ev, "Choose a non-grey Ally", p.hand.limit(isNonGrayHero), c => {
    schemeProgressEv(ev, copStack.size); 
    copStack.withTop(cop => {
      attachCardEv(ev, c, cop, "CAGED");
      attachCardEv(ev, cop, gameState.scheme, "ACTIVE_COP");
    });
  }, p));
}, [{
  event: 'DEFEAT',
  match: ev => ev.what.attached('CAGED').size > 0,
  after: ev => {
    const caged = ev.parent.what.attached('CAGED');
    caged.each(c => choosePlayerEv(ev, p => gainEv(ev, c, p)));
  },
}], () => {
  const avtiveCops = gameState.scheme.attachedDeck('ACTIVE_COP');
  const copStack = gameState.scheme.attachedDeck('COPS');
  gameState.villaindeck.limit(c => c.villainGroup === 'Cops').forEach((c, i) => moveCard(c, i < 2 * gameState.players.size ? copStack : gameState.outOfGame));
  gameState.schemeProgress = copStack.size + 1;
  gameState.specialActions = ev => avtiveCops.deck.map(c => fightActionEv(ev, c));
}),
// SETUP: 8 Twists. Put the Thor Adversary next to this Plot.
// RULE: Whenever Thor overruns, stack a Plot Twist from the KO pile next to this Plot as a "Triumph of Asgard."
// EVILWINS: When there are 3 Triumphs of Asgard next to this Plot.
makeSchemeCard<{thor: Card}>("Crown Thor King of Asgard", { twists: 8 }, ev => {
  // Twist: If Thor is in the city, he overruns. Otherwise, Thor enters the Bridge from wherever he is, and Thor guards 3 Bystanders.
  const thor = ev.state.thor;
  cityVillains().has(c => c === thor) ? villainEscapeEv(ev, thor) : villainDrawEv(ev, thor);
}, {
  event: "ESCAPE",
  match: ev => ev.what === gameState.schemeState.thor,
  after: ev => gameState.ko.limit(isTwist).withFirst(c => {
    attachCardEv(ev, c, gameState.scheme, "TWIST");
    cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached("TWIST").size));
  })
}, (s) => {
  const thorSpace = gameState.scheme.attachedDeck('THOR');
  gameState.villaindeck.limit(c => c.villainGroup === 'Avengers' && c.cardName === 'Thor').each(c => moveCard(c, thorSpace));
  if (!thorSpace.size) {
    thorSpace.addNewCard(findVillainTemplate('Avengers').cards.map(([, c]) => c).find(c => c.cardName === 'Thor'));
  }
  thorSpace.deck = thorSpace.deck.limit(c => c.cardName === 'Thor');
  s.thor = thorSpace.top;
  setSchemeTarget(3);
}),
// SETUP: 8 Twists.
// RULE: An Adversary gets +1 Attack for each Ally it has captured. When you fight that Adversary, gain those Allies.
// EVILWINS: When there are 11 Allies in the Overrun Pile.
makeSchemeCard("Crush HYDRA", { twists: 8 }, ev => {
  if (ev.nr <= 7) {
    // Twist 1-7 Each Adversary in the city captures a New Recruit, or if there are no more New Recruits, a Madame HYDRA.
    cityVillains().each(v => cont(ev, () => {
      (gameState.newRecruit.size ? gameState.newRecruit : gameState.madame).withTop(c => captureEv(ev, v, c));
    }));
  } else if (ev.nr === 8) {
    // Twist 8 Put all captured Allies from the city into the Overrun Pile.
    cityVillains().each(v => v.captured.limit(isHero).each(c => moveCardEv(ev, c, gameState.escaped)));
  }
}, escapeProgressTrigger(isHero), () => {
  addStatMod('defense', isVillain, c => c.captured.count(isHero));
  addStatSet('rescue', isHero, () => ev => gainEv(ev, ev.source)); // TODO this should not be a rescue action
  setSchemeTarget(11);
}),
// SETUP: 8 Twists. Stack 8 Bystanders next to this Plot as "Young Mutants."
// EVILWINS: When there are 8 Bystanders in the Overrun Pile.
makeSchemeCard("Graduation at Xavier's X-Academy", { twists: 8 }, ev => {
  // Twist: Put a Bystander from next to this Plot into the Overrun Pile.
  gameState.scheme.attachedDeck("MUTANTS").withTop(c => moveCardEv(ev, c, gameState.escaped));
}, escapeProgressTrigger(isBystander), () => {
  const mutantStack = gameState.scheme.attachedDeck("MUTANTS");
  repeat(8, () => gameState.bystanders.withTop(c => moveCard(c, mutantStack)));
  setSchemeTarget(8);
}),
// SETUP: 8 Twists, Stack 21 Bystanders next to this Plot as "Infiltrating Spies."
// RULE: When you recruit an Ally, kidnap any Bystander in that Lair space. When an Ally leaves the Lair in any other way, put any Bystander from that Lair space into the Overrun Pile.
// EVILWINS: When there are 12 Bystanders in the Overrun Pile.
makeSchemeCard("Infiltrate the Lair with Spies", { twists: 8 }, ev => {
  // Twist: Put all Bystanders from the Lair into the Overrun pile. Then put a Bystander from next to this Plot into each Lair space under the Bridge, Streets, and Sewers.
  gameState.hq.each(d => d.attached('SPIES').each(c => moveCardEv(ev, c, gameState.escaped)));
  const locations: CityLocation[] = ['BRIDGE', 'STREETS', 'SEWERS'];
  locations.each(l => withCity(l, d => cont(ev, () => gameState.scheme.attachedDeck("SPIES").withTop(c => attachCardEv(ev, c, d.above, "SPIES")))));
}, [escapeProgressTrigger(isBystander), {
  event: 'RECRUIT',
  match: ev => ev.what.location.attached('SPIES').size > 0,
  before: ev => ev.parent.what.location.attached('SPIES').each(c => rescueEv(ev, c)),
}, {
  event: 'MOVECARD',
  match: ev => ev.what.location.attached('SPIES').size > 0,
  after: ev => ev.parent.what.location.attached('SPIES').each(c => moveCardEv(ev, c, gameState.escaped)),
}], () => {
  setSchemeTarget(12);
  const spyStack = gameState.scheme.attachedDeck("SPIES");
  repeat(21, () => gameState.bystanders.withTop(c => moveCard(c, spyStack)));
}),
// SETUP: 8 Twists, Include 10 S.H.I.E.L.D. Assault Squads as one of the Backup Adversary groups.
// RULE: Assault Squads get +1 Attack for each War Machine Technology next to the Plot.
// EVILWINS: When there are 3 Assault Squads in the Overrun Pile.
makeSchemeCard("Mass Produce War Machine Armor", { twists: 8, solo_henchmen: [10], required: { henchmen: 'S.H.I.E.L.D. Assault Squad' } }, ev => {
  // Twist: Stack this Twist next to the Plot as "War Machine Technology." An Assault Squad from the current player's Victory Pile enters the Bridge.
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  selectCardEv(ev, "Select an Assault Squad", playerState.victory.limit(isGroup('S.H.I.E.L.D. Assault Squad')), c => villainDrawEv(ev, c));
}, escapeProgressTrigger(isGroup('S.H.I.E.L.D. Assault Squad')), () => {
  addStatMod('defense', isGroup('S.H.I.E.L.D. Assault Squad'), () => gameState.scheme.attached('TWIST').size);
  setSchemeTarget(3);
}),
// SETUP: 8 Twists.
// EVILWINS: When there are 3 Adversaries per player in the Overrun Pile.
makeSchemeCard("Resurrect Heroes with Norn Stones", { twists: 8 }, ev => {
  if (ev.nr <= 6) {
    // Twist 1-6 An Adversary from the current player's Victory Pile enters the Bridge. Then play the top card of the Adversary Deck.
    selectCardEv(ev, "Select an Adversary", playerState.victory.limit(isVillain), c => withCity('BRIDGE', bridge => enterCityEv(ev, c, bridge)));
    villainDrawEv(ev);
  } else if (ev.nr >= 7 && ev.nr <= 8) {
    // Twist 7-8 Each player puts an Adversary from their Victory Pile into the Overrun Pile.
    eachPlayer(p => selectCardEv(ev, "Select an Adversary", p.victory.limit(isVillain), c => moveCardEv(ev, c, gameState.escaped), p));
  }
}, escapeProgressTrigger(isVillain), () => setSchemeTarget(3, true)),
]);
addTemplates("SCHEMES", "Guardians of the Galaxy", [
// SETUP: 8 Twists. Always include the Infinity Gems Villain Group.
// EVILWINS: When 6 Infinity Gem Villains are in the city and/or the Escape Pile.
// EVILWINS: When a player controls 4 Infinity Gem Artifacts, that player is corrupted by power. That player wins, Evil wins, and all other players lose.
makeSchemeCard("Forge the Infinity Gauntlet", { twists: 8, required: { villains: "Infinity Gems"} }, ev => {
  // Twist: Starting to your left and going clockwise, the first player with an Infinity Gem Artifact card in play or in their discard pile chooses on of those Infinity Gems to enter the city. Then put a Shard on each Infinity Gem in the city.
  eachPlayer(p => selectCardEv(ev, "Choose an Infinity Gem", p.artifact.limit(isGroup("Infinity Gems")), c => enterCityEv(ev, c), p));
  cont(ev, () => cityVillains().limit(isGroup("Infinity Gems")).each(c => attachShardEv(ev, c)))
}, [{
  event: "MOVECARD",
  match: ev => ev.to === gameState.escaped || ev.to.isCity,
  after: ev => schemeProgressEv(ev, cityVillains().count(isGroup("Infinity Gems")) + gameState.escaped.count(isGroup("Infinity Gems")))
}, {
  event: "MOVECARD",
  match: ev => gameState.players.has(p => p.artifact === ev.to),
  after: ev => ev.parent.to.count(isGroup("Infinity Gems")) >= 4 && evilWinsEv(ev, ev.parent.to.owner),
}], () => setSchemeTarget(6)),
// SETUP: 8 Twists. Make a face down 'Nega-Bomb Deck' of 6 Bystanders.
// EVILWINS: When 16 non-grey Heroes are in the KO pile.
makeSchemeCard("Intergalactic Kree Nega-Bomb", { twists: 8 }, ev => {
  // Twist: Shuffle this Twist into the Nega-Bomb Deck. Then reveal a random card from that deck. If it's a Bystander, rescue it. If it's a Twist, KO it, KO all Heroes from the HQ, and each player gains a Wound.
  const negabomb = gameState.scheme.attachedDeck("NEGABOMB");
  shuffleIntoEv(ev, ev.twist, negabomb);
  revealDeckEv(ev, negabomb, 1, cards => {
    cards.limit(isBystander).each(c => rescueEv(ev, c));
    cards.limit(isTwist).each(c => {
      KOEv(ev, c);
      hqHeroes().each(c => KOEv(ev, c));
      eachPlayer(p => gainWoundEv(ev, p));
    });
  });
}, koProgressTrigger(isNonGrayHero), () => {
  setSchemeTarget(16);
  const negabomb = gameState.scheme.attachedDeck("NEGABOMB");
  repeat(6, () => gameState.bystanders.withTop(c => moveCard(c, negabomb)));
}),
// SETUP: 8 Twists. Always include Kree Starforce and Skrull Villain Groups.
// EVILWINS: When there are 4 Kree Conquests or 4 Skrull Conquests.
makeSchemeCard("The Kree-Skrull War", { twists: 8, vd_villain: [2, 2, 3, 3, 4], required: { villains: ['Kree Starforce', 'Skrulls']} }, ev => {
  const kLoc = gameState.mastermind;
  const sLoc = gameState.villaindeck;
  if (ev.nr <= 7) {
    // Twist 1-7 All Kree and Skrulls escape from the city. Then, if there are more Kree than Skrulls in the Escape Pile, stack this Twist next to the Mastermind as a Kree Conquest. If there are more Skrulls than Kree in the Escape Pile, stack this Twist next to the Villain Deck as a Skrull Conquest.
    cityVillains().limit(c => isGroup("Kree Starforce")(c) || isGroup("Skrull")(c)).each(c => villainEscapeEv(ev, c));
    cont(ev, () => {
      const k = gameState.escaped.count(isGroup("Kree Starforce"));
      const s = gameState.escaped.count(isGroup("Skrulls"));
      k > s && attachCardEv(ev, ev.twist, kLoc, "CONQUEST");
      s > k && attachCardEv(ev, ev.twist, sLoc, "CONQUEST");
    });
  } else if (ev.nr === 8) {
  // Twist 8 Stack this Twist on the side with the most Conquests.
    const kCount = kLoc.attached("CONQUEST").size;
    const sCount = sLoc.attached("CONQUEST").size;
    attachCardEv(ev, ev.twist, kCount > sCount ? kLoc : sLoc, "CONQUEST")
  }
  cont(ev, () => {
    const kCount = kLoc.attached("CONQUEST").size;
    const sCount = sLoc.attached("CONQUEST").size;
    schemeProgressEv(ev, Math.max(kCount, sCount));
  });
}, [], () => setSchemeTarget(4)),
// SETUP: 30 Shards in the supply. Twists equal to the number of players plus 5.
// RULE: During your turn, any number of times, you may spend 2 Recruit to gain one of the Mastermind's Shards.
// EVILWINS: When the Mastermind has 10 Shards or when there are no more Shards in the supply.
makeSchemeCard("Unite the Shards", { twists: [6, 7, 8, 9, 10], shards: 30 }, ev => {
  // Twist: Stack this Twist next to the Scheme. Then for each Twist in that stack, the Mastermind gains a Shard.
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  cont(ev, () => attachShardEv(ev, gameState.mastermind.top, gameState.scheme.attached('TWIST').size));
}, [{
  event: "MOVECARD",
  match: ev => ev.from === gameState.shard,
  after: ev => gameState.shard.size === 0 && evilWinsEv(ev),
}, {
  event: "MOVECARD",
  match: ev => ev.to.attachedTo && ev.to.attachedTo instanceof Card && isMastermind(ev.to.attachedTo),
  after: ev => schemeProgressEv(ev, 10 - ev.parent.to.size),
}], () => {
  gameState.schemeProgress = 10;
  gameState.specialActions = (ev: Ev) => [new Ev(ev, 'BUYSHARD', {
    cost: {
      recruit: 2,
      cond: () => gameState.mastermind.deck.sum(m => m.attached('SHARD').size) > 0,
    },
    func: ev => {
      gameState.mastermind.deck.map(m => m.attached('SHARD')).merge().withFirst(c => gainShardEv(ev, c));
    }
  })];
}),
]);
addTemplates("SCHEMES", "Fear Itself", [
// SETUP: 10 Twists.
// Earth's Fear Level starts at 8. The number of Allies in the Lair is always equal to the Fear Level.
// EVILWINS: When the Fear Level is 0.
makeSchemeCard("Fear Itself", { twists: 10 }, ev => {
  // Twist: KO an Ally from the Lair. The Fear Level goes down by 1.
  selectCardEv(ev, "Choose an Ally to KO", hqHeroes(), c => {
    for (let i = gameState.hq.indexOf(c.location); i < gameState.hq.size - 1; i++)
      swapCardsEv(ev, gameState.hq[i], gameState.hq[i + 1]);
  });
  cont(ev, () => gameState.hq.withLast(d => { destroyHQ(ev, d); d.each(c => KOEv(ev, c)); }));
  cont(ev, () => schemeProgressEv(ev, gameState.hq.size));
}, [], () => {
  const extraLair = ["HQ11", "HQ12", "HQ13"].map((n, i) => makeHQDeck(n, i + 5));
  gameState.hq = [...gameState.hq, ...extraLair];
  gameState.schemeProgress = 8;
}),
// SETUP: 6 Twists.
// RULE: While an Adversary is on the Rooftops, it gets +1 Attack for each StarkTech Defenses.
// EVILWINS: When there are 13 non-grey Allies in the KO pile.
makeSchemeCard("Last Stand at Avengers Tower", { twists: 6 }, ev => {
  // Twist: Stack this Twist above the Rooftops as StarkTech Defenses. If there is an Adversary on the Rooftops, choose 3 Allies from the Lair and KO them.
  withCity('ROOFTOPS', rooftops => {
    attachCardEv(ev, ev.twist, rooftops, "STARKTECH");
    rooftops.has(isVillain) && selectObjectsEv(ev, "Select Allies to KO", 3, hqHeroes() ,c => KOEv(ev, c));
  });
}, koProgressTrigger(isNonGrayHero), () => {
  addStatMod('defense', c => atLocation(c, 'ROOFTOPS'), c => c.location.attached('STARKTECH').size);
  setSchemeTarget(13);
}),
// SETUP: 2+ players only. 8 Twists. Shuffle a 'Betrayal Deck' of 3 Bindings per player and a 9th Twist.
// RULE: During your turn, you may reveal a Twist from your Betrayal Cards to become 'the Traitor'. If you do, each other player gains all the Bindings from their Betrayal Cards.
// During your turns, you may spend 4 Attack any number of times to play an additional card from the Adversary Deck.
// <b>When the players win</b>: The Traitor reveals themself and loses.
makeSchemeCard<{traitor: Player}>("The Traitor", { twists: 8 }, ev => {
  const betrayalDeck = gameState.scheme.attachedDeck('BETRAYAL');
  if (ev.nr <= 3 && !ev.state.traitor) {
    // Twist 1-3 If there is no revealed Traitor, each player puts a 'Betrayal Card' from the Betrayal Deck face down in front of them and looks at it.
    eachPlayer(p => cont(ev, () => betrayalDeck.withTop(c => attachCardEv(ev, c, p.deck, 'BETRAYAL'))));
  } else if (ev.nr === 8) {
    // Twist 8 Good wins! The Traitor reveals themself and also wins.
    evilWinsEv(ev, gameState.players.find(p => p.deck.attached('BETRAYAL').has(isTwist)));
  }
}, [], s => {
  const betrayalDeck = gameState.scheme.attachedDeck('BETRAYAL');
  betrayalDeck.addNewCard(twistTemplate);
  repeat(gameState.players.size * 3, () => gameState.bindings.top && moveCard(gameState.bindings.top, betrayalDeck));
  betrayalDeck.shuffle();
  gameState.specialActions = ev => {
    if (!s.traitor) {
      return playerState.deck.attached('BETRAYAL').limit(isTwist).map(c => new Ev(ev, 'BETRAY', { what: c, func: ev => {
        s.traitor = playerState;
        eachOtherPlayer(p => p.deck.attached('BETRAYAL').limit(isBindings).each(c => gainEv(ev, c, p)));
      }}));
    } else if (s.traitor === playerState) {
      return [ new Ev(ev, 'BETRAY', { cost: { attack: 4 }, func: ev => villainDrawEv(ev) })];
    }
    return [];
  }
}),
]);
addTemplates("SCHEMES", "Secret Wars Volume 1", [
// SETUP: 9 Twists. Put 10 extra Annihilation Wave Henchmen in that KO pile.
// EVILWINS: When there are 10 Annihilation Henchmen next to the Mastermind.
makeSchemeCard("Build an Army of Annihilation", { twists: 9, vd_henchmen: [ 2, 2, 2, 3, 3 ] }, ev => {
  // Twist: KO all Annihilation Henchmen from the players' Victory Piles. Stack this Twist next to the Scheme. Then, for each Twist in that stack, put an Annihilation Henchman from the KO pile next to the Mastermind. Players can fight those Henchmen.
  eachPlayer(p => p.victory.limit(isGroup(extraHenchmenName())).each(c => KOEv(ev, c)));
  attachCardEv(ev, ev.twist, gameState.scheme, "TWIST");
  cont(ev, () => {
    const w = gameState.ko.limit(isGroup(extraHenchmenName()));
    const n = gameState.scheme.attached('TWIST').size;
    w.forEach((c, i) => i < n && attachCardEv(ev, c, gameState.mastermind, 'WAVE'));
  });
  cont(ev, () => schemeProgressEv(ev, gameState.mastermind.attached('WAVE').size));
}, [], () => {
  setSchemeTarget(10);
  gameState.villaindeck.limit(isGroup(extraHenchmenName())).each(c => moveCard(c, gameState.ko));
  gameState.specialActions = ev => gameState.mastermind.attached('WAVE').map(c => fightActionEv(ev, c));
}),
// SETUP: 8 Twists. Add 10 Sidekicks to the Villain Deck.
// RULE: Sidekicks in the Villain Deck and city are Villains. Their Attack is 2 plus the number of Twists stacked next to this Scheme. When you defeat a Sidekick, gain it to the top of your deck.
// EVILWINS: When 4 Sidekicks escape.
makeSchemeCard("Corrupt the Next Generation of Heroes", { twists: 8 }, ev => {
  if (ev.nr <= 7) {
    // Twist 1-7 Each player returns a Sidekick from their discard pile to the Sidekick Stack. Then, two Sidekicks from the Sidekick Stack enter the city.
    eachPlayer(p => selectCardEv(ev, "Choose a Sidekick", p.discard.limit(isSidekick), c => moveCardEv(ev, c, gameState.sidekick, true), p));
    repeat(2, () => cont(ev, () => gameState.sidekick.withTop(c => villainDrawEv(ev, c))));
  } else if (ev.nr === 8) {
    // Twist 8 All Sidekicks in the city escape.
    cityVillains().limit(isSidekick).each(c => villainEscapeEv(ev, c));
  }
}, escapeProgressTrigger(isSidekick), () => {
  setSchemeTarget(4);
  addStatSet('baseDefense', isSidekick, c => c.cost + 2);
  addStatSet('isVillain', isSidekick, c => !owner(c));
  addStatSet('fight', isSidekick, () => (ev: Ev) => gainToDeckEv(ev, ev.source));
  repeat(10, () => gameState.sidekick.withTop(c => moveCard(c, gameState.villaindeck)));
  gameState.villaindeck.shuffle();
}),
// SETUP: 5 Twists. If playing solo, add an extra Villain Group.
// EVILWINS: When 8 Master Strikes have taken effect.
makeSchemeCard("Crush Them With My Bare Hands", { twists: 5, vd_villain: [ 2, 2, 3, 3, 4 ] }, ev => {
  // Twist: This Twist becomes a Master Strike that takes effect immediately.
  playStrikeEv(ev, ev.twist);
}, {
  event: 'STRIKE',
  after: ev => schemeProgressEv(ev, gameState.schemeProgress - 1),
}, () => gameState.schemeProgress = 8),
// SETUP: 8 Twists.
makeSchemeCard("Dark Alliance", { twists: 8, extra_masterminds: 1 }, ev => {
  if (ev.nr === 1) {
    // Twist 1 Add a random second Mastermind to the game with one Mastermind Tactic.
    gameState.scheme.attachedDeck('EXTRA_MASTERMIND').limit(isMastermind).each(m => {
      moveCardEv(ev, m, gameState.mastermind);
    });
  } else if (ev.nr >= 2 && ev.nr <= 4) {
    // Twist 2-4 If the second Mastermind is still in play, it gains another Mastermind Tactic.
    gameState.scheme.attachedDeck('EXTRA_MASTERMIND').limit(isTactic).each(c => {
      gameState.mastermind.limit(m => c.mastermind === m).withRandom(m => {
        shuffleIntoEv(ev, c, m.attachedDeck('TACTICS'));
      });
    });
  } else if (ev.nr >= 5 && ev.nr <= 6) {
    // Twist 5-6 Each Mastermind captures a Bystander.
    gameState.mastermind.each(m => captureEv(ev, m));
  } else if (ev.nr === 7) {
    // Twist 7 Evil Wins!
  }
  schemeProgressEv(ev, ev.nr);
}, [], () => {
  setSchemeTarget(7);
  gameState.mastermind.withTop(m => {
    moveCard(m, gameState.scheme.attachedDeck('EXTRA_MASTERMIND'));
    while(attachedCards('TACTICS', m).size > 1) {
      moveCard(attachedCards('TACTICS', m)[0], gameState.scheme.attachedDeck('EXTRA_MASTERMIND'));
    }
  })
}),
// SETUP: Add an extra Villain Group. Shuffle the Villain Deck, then split it as evenly as possible into a Villain Deck for each player. Then, shuffle 2 Twists into each player's Villain Deck.
// RULE: The normal city does not exist. Instead, each player has a different dimension in front of them with one city space. Villains and Bystanders from your Villain Deck enter your dimension. You can fight Villains in any dimension.
// EVILWINS: When the number of non-grey Heroes in the KO pile is 5 times the number of players.
makeSchemeCard<{cities: Deck[]}>("Fragmented Realities", { twists: [ 2, 4, 6, 8, 10 ], vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist: Play two card from your Villain Deck
  villainDrawEv(ev);
  villainDrawEv(ev);
}, [
  koProgressTrigger(isNonGrayHero),
  {
    event: 'TURNSTART',
    after: ev => {
      gameState.city = [gameState.schemeState.cities[playerState.nr]];
      gameState.cityEntry = gameState.city[0];
      swapDecks(gameState.villaindeck, gameState.villaindeck.attachedFaceDownDeck('REALITY' + playerState.nr));
    }
  },
  {
    event: 'CLEANUP',
    after: ev => swapDecks(gameState.villaindeck, gameState.villaindeck.attachedFaceDownDeck('REALITY' + playerState.nr)),
  }
], s => {
  const num = gameState.players.size;
  const vd = gameState.villaindeck;
  while(gameState.city.length) destroyCity(gameState.city[0], true);
  s.cities = gameState.players.map((p, i) => makeCityDeck('CITY' + i, i));
  gameState.city = [s.cities[0]];
  vd.limit(isTwist).forEach((c, i) => moveCard(c, vd.attachedFaceDownDeck('REALITY' + (i % num))));
  [...vd.deck].forEach((c, i) => moveCard(c, vd.attachedFaceDownDeck('REALITY' + (i % num))));
  setSchemeTarget(5, true);
}),
// SETUP: 8 Twists. Choose 3 other Masterminds, and shuffle their 12 Tactics into the Villain Deck. Those Tactics are "Tyrant Villains" with their printed Attack and no abilities.
// EVILWINS: When 5 Tyrant Villains escape.
makeSchemeCard("Master of Tyrants", { twists: 8, extra_masterminds: 3 }, ev => {
  if (ev.nr <= 7) {
    // Twist 1-7 Put this Twist under a Tyrant Villain as "Dark Power." It gets +2 Attack.
    selectCardEv(ev, 'Choose Tyrant Villain', cityVillains().limit(isTactic), c => attachCardEv(ev, ev.twist, c, 'DARK_POWER'));
  } else if (ev.nr === 8) {
    // Twist 8 All Tyrant Villains in the city escape.
    cityVillains().limit(isTactic).each(c => villainEscapeEv(ev, c));
  }
}, escapeProgressTrigger(isTactic), () => {
  setSchemeTarget(5);
  const tyrants = gameState.mastermind.deck.splice(1);
  const isTyrant = (c: Card) => tyrants.includes(c.mastermind);
  addStatMod('defense', isTyrant, c => c.attached('DARK_POWER').size * 2);
  addStatSet('isVillain', isTyrant, c => true);
  addStatSet('villainGroup', isTyrant, c => 'Tyrant Villain');
  addStatSet('fight', isTyrant, c => [] as Handler[]);
  tyrants.each(t => t.attached('TACTICS').each(c => moveCard(c, gameState.villaindeck)));
  gameState.villaindeck.shuffle();
}),
// SETUP: 10 Twists.
// RULE: When a player recruits a Hero with a Wound next to it, that player can either gain that Wound or pay 1 Recruit to return that Wound to the Wound Stack.
// EVILWINS: When the Wound Stack runs out.
makeSchemeCard("Pan-Dimensional Plague", { twists: 10 }, ev => {
  // Twist: KO all Wounds from next to the HQ. Then, put a Wound from the Wound Stack next to each Hero in the HQ.
  gameState.hq.each(d => d.attached('WOUNDS').each(c => KOEv(ev, c)));
  gameState.hq.each(d => cont(ev, () => {
    gameState.wounds.withTop(c => attachCardEv(ev, c, d, 'WOUNDS'));
  }));
}, [ runOutProgressTrigger("WOUNDS"), {
  event: 'RECRUIT',
  match: ev => ev.where.isHQ && ev.where.attached('WOUNDS').size > 0,
  after: ev => {
    const l = ev.parent.where;
    const a = new Ev(ev, 'EFFECT', { cost: { recruit: 1 }, func: ev => {
      l.attached('WOUNDS').each(c => moveCardEv(ev, c, gameState.wounds));
    }});
    canPayCost(a) && chooseMayEv(ev, 'Pay to return the Wound', () => playEvent(a));
    cont(ev, () => l.attached('WOUNDS').each(c => gainEv(ev, c)));
  },
} ], () => gameState.schemeProgress = gameState.wounds.size),
// SETUP: 8 Twists. Add an extra Villain Group. Put the Villain Deck on the Bank space.
// RULE: The Sewers and Bank do not exist, so the city is only 3 spaces. There is a parallel dimension with 3 city spaces above the main city. Whenever a Villain enters the city, the current player chooses which city it enters.
// EVILWINS: When 10 Villains escape.
makeSchemeCard("Smash Two Dimensions Together", { twists: 8 }, ev => {
  if (ev.nr <= 7) {
    // Twist 1-7 Play two cards from the Villain Deck.
    villainDrawEv(ev);
    villainDrawEv(ev);
  } else if (ev.nr === 8) {
    // Twist 8 All Villains in both dimensions escape.
    cityVillains().each(c => villainEscapeEv(ev, c));
  }
}, [escapeProgressTrigger(isVillain), {
  event: 'VILLAINDRAW',
  before: ev => {
    // TODO choice needs to be done later only in case of bystander or villain
    selectCardEv(ev, 'Choose a dimension', [gameState.city[2], gameState.city[5]], d => gameState.cityEntry = d);
  }
}], () => {
  const secondCity = [0, 1, 2].map(i => makeCityDeck('CITY' + i, [i, -1]));
  secondCity[2].next = secondCity[1];
  secondCity[1].next = secondCity[0];
  makeCityAdjacent(secondCity);
  destroyCity(gameState.city[4], true);
  destroyCity(gameState.city[3], true);
  gameState.city = gameState.city.concat(secondCity);
  gameState.cityEntry = gameState.city[2];
  setSchemeTarget(10);
}),
]);
addTemplates("SCHEMES", "Secret Wars Volume 2", [
// SETUP: 8 Twists. Add an extra Villain Group.
// EVILWINS: When the number of escaped Villains equals the number of players plus 6.
makeSchemeCard("Deadlands Hordes Charge the Wall", { twists: 8, vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist: Each Villain simultaneously charges two spaces. Play another card from the Villain Deck.
  cityVillains().each(c => villainChargeEv(ev, c, 2));
  villainDrawEv(ev);
}, escapeProgressTrigger(isVillain), () => setSchemeTarget(6 + gameState.players.size)),
// SETUP: 8 Twists.
// EVILWINS: When there are six Masterminds.
makeSchemeCard("Enthrone the Barons of Battleworld", { twists: 8 }, ev => {
  const ascend = (m: Card) => {
    moveCardEv(ev, m, gameState.mastermind);
    addStatSet('strike', c => c === m, () => ev => {
      eachPlayer(p => selectCardEv(ev, "Discard a card", p.hand.limit(c => c.cost === m.printedVP), c => discardEv(ev, c), p));
    })
    addStatMod('defense', is(m), 2);
  };
  if (ev.nr <= 7) {
    // Twist 1-7 The Villain in the city or Escape Pile with the highest printed Attack ascends to become a new Mastermind. It gets +2 Attack. It gains the ability "<b>Master Strike</b>: Each Player discards a card with cost equal to this Mastermind's printed VP." <i>(Keep them separate from any Villains who ascend through Escape effects.)</i>
    selectCardEv(ev, "Choose a Villain", [...cityVillains(), ...gameState.escaped.limit(isVillain)].highest(c => c.printedDefense), ascend);
  } else if (ev.nr === 8) {
    // Twist 8 The Villain in each player's Victory Pile with the highest printed Attack ascends the same way.
    eachPlayer(p => selectCardEv(ev, "Choose a Villain", p.victory.limit(isVillain).highest(c => c.printedDefense), ascend));
  }
}, [
  { event: 'DEFEAT', match: ev => isMastermind(ev.what), after: ev => schemeProgressEv(ev, fightableCards().count(isMastermind)) },
  { event: 'MOVECARD', match: ev => ev.to === gameState.mastermind, after: ev => schemeProgressEv(ev, fightableCards().count(isMastermind)) },
], () => {
  setSchemeTarget(6);
  gameState.schemeProgress = fightableCards().count(isMastermind);
}),
// SETUP: 8 Twists. (1 player: 4 Twists.)
// RULE: All Villains and Mastermind Tactics have "<b>Fight</b>: {FATEFULRESURRECTION}."
// EVILWINS: When the number of escaped Villains is 3 times the number of players.
makeSchemeCard("The Fountain of Eternal Life", { twists: [ 4, 8, 8, 8, 8 ] }, ev => {
  // Twist: A Villain from your Victory Pile enters the Sewers. Put this Twist on the bottom of the Villain Deck.
  selectCardEv(ev, "Choose a Villain", playerState.victory.limit(isVillain), c => villainDrawEv(ev, c));
  moveCardEv(ev, ev.twist, gameState.villaindeck, true);
}, escapeProgressTrigger(isVillain), () => {
  setSchemeTarget(3, true);
  addStatSet('fight', isVillain, (c, prev) => combineHandlers(prev, fatefulResurrectionEv));
  addStatSet('fight', isTactic, (c, prev) => combineHandlers(prev, ev => fatefulResurrectionTacticEv(ev, () => {})));
}),
// SETUP: 8 Twists.
makeSchemeCard<{schemeCopy: Card}>("The God-Emperor of Battleworld", { twists: 8 }, ev => {
  if (ev.nr === 1) {
    // Twist 1 This Scheme ascends to becomes (sic) a new 9-Attack "God-Emperor" Mastermind worth 9 VP. It has "<b>Master Strike</b>: Each player with exactly six cards in hand reveals a [Tech] Hero or puts two cards from their hand on top of their deck."
    gameState.outOfGame.addNewCard(gameState.scheme.top.instance);
    const scheme = ev.state.schemeCopy = gameState.outOfGame.deck.find(c => c.instance === gameState.scheme.top.instance);
    moveCardEv(ev, scheme, gameState.mastermind);
    addStatSet('strike', c => c === scheme, () => ev => {
      eachPlayer(p => p.hand.size === 6 && revealOrEv(ev, Color.TECH, () => {
        selectObjectsEv(ev, "Put two cards on top of your deck", 2, p.hand.deck, c => moveCardEv(ev, c, p.deck), p);
      }))
    });
    addStatSet('vp', c => c === scheme, () => 9);
    addStatSet('baseDefense', c => c === scheme, () => 9 + 2 * gameState.scheme.attached('TWIST').size);
  } else if (ev.nr >= 2 && ev.nr <= 6) {
    // Twist 2-6 Stack this Twist next to the Scheme. The God-Emperor gets another +2 Attack.
    attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  } else if (ev.nr === 7) {
    // Twist 7 If the God-Emperor lives, it KOs all other Masterminds.
    fightableCards().includes(ev.state.schemeCopy) && fightableCards().limit(isMastermind).limit(c => c !== ev.state.schemeCopy).each(c => KOEv(ev, c)); // TODO detach on KO
  }
  // Twist 8 Evil wins! <i>(If any Mastermind still lives.)</i>
  schemeProgressEv(ev, ev.nr);
}, [], () => setSchemeTarget(8)),
// SETUP: 10 Twists. Always include Khonshu Guardians. Add all fourteen cards for an extra Hero to the Villain Deck.
// RULE: Heroes in the Villain Deck are "Khonshu Guardian" Villains with Attack equal to their printed cost. While in the Sewers, Rooftops, or Bridge, they are in "wolf form" and have double their Attack. When you defeat one, gain it as a Hero.
// EVILWINS: When 7 Khonshu Guardians escape.
makeSchemeCard("The Mark of Khonshu", { twists: 10, heroes: [4, 6, 6, 6, 7], required: { henchmen: 'Khonshu Guardians' }}, ev => {
  // Twist: Play two cards from the Villain Deck.
  villainDrawEv(ev);
  villainDrawEv(ev);
}, escapeProgressTrigger(isGroup('Khonshu Guardians')), () => {
  setSchemeTarget(7);
  const isExtra = (c: Card) => c.heroName === extraHeroName();
  // Based on 'Secret Invasion of the Skrull Shapeshifters'
  addStatSet('baseDefense', isExtra, c => c.cost * (isLocation(c.location, 'SEWERS', 'ROOFTOPS', 'BRIDGE') ? 2 : 1));
  addStatSet('isVillain', isExtra, () => true);
  addStatSet('villainGroup', isExtra, () => "Khonshu Guardians");
  addStatSet('fight', isExtra, () => (ev: Ev) => gainEv(ev, ev.source));
  gameState.herodeck.limit(isExtra).each(c => moveCard(c, gameState.villaindeck));
  gameState.villaindeck.shuffle();
}),
// SETUP: 8 Twists.
// RULE: Villains and the Mastermind have the Circle of Kung-Fu matching the number of Twists stacked here.
// EVILWINS: When the number of escaped Villains is double the number of players.
makeSchemeCard("Master the Mysteries of Kung-Fu", { twists: 8 }, ev => {
  // Twist: Stack this Twist next to the Scheme.
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
}, escapeProgressTrigger(isVillain), () => {
  addStatSet('nthCircle', isEnemy, (c, prev) => Math.max(prev || 0, gameState.scheme.attached('TWIST').size));
  gameState.specialActions = ev => fightableCards().map(c => nthCircleRevealAction(c, ev));
  setSchemeTarget(2, true);
}),
// SETUP: 8 Twists.
makeSchemeCard("Secret Wars", { twists: 8 }, ev => {
  if (ev.nr <= 3) {
    // Twist 1-3 Add another random Mastermind to the game with one Tactic.
    addMastermindEv(ev)
  }
  // Twist 8 Evil wins!
  schemeProgressEv(ev, ev.nr);
}, [], () => setSchemeTarget(8)),
// SETUP: 6 Twists. Add 10 random Ambition cards to the Villain Deck.
// RULE: Ambition cards are Villains with their printed Attack. Add +1 Attack for each Twist stacked next to the Scheme. They are worth 4 VP. Whenever an Ambition Villain escapes, do its Ambition effect.
// EVILWINS: When 4 Ambition Villains escape.
makeSchemeCard("Sinister Ambitions", { twists: 6 }, ev => {
  if (ev.nr <= 5) {
    // Twist 1-5 Stack this Twist next to the Scheme. Play another card from the Villain Deck.
    attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
    villainDrawEv(ev);
  } else if (ev.nr === 6) {
    // Twist 6 Each Ambition Villain in the city escapes.
    cityVillains().limit(isGroup('Ambition')).each(c => villainEscapeEv(ev, c));
  }
}, escapeProgressTrigger(isGroup('Ambition')), () => {
  const isAmbition = (c: Card) => c.cardType === 'AMBITION';
  addStatMod('defense', isAmbition, c => c.printedDefense + gameState.scheme.attached('TWIST').size);
  addStatSet('isVillain', isAmbition, () => true);
  addStatSet('villainGroup', isAmbition, () => "Ambition");
  addStatSet('escape', isAmbition, c => c.fight); // TODO add ambitions
  setSchemeTarget(4);
}),
]);
addTemplates("SCHEMES", "Captain America 75th Anniversary", [
// SETUP: 7 Twists. Add 12 S.H.I.E.L.D. Officers to the Villain Deck.
// RULE: S.H.I.E.L.D. Officers in the Villain Deck are Villains. Their Attack is 3 plus the number of Twists stacked next to this Scheme. When you defeat a S.H.I.E.L.D. Officer, gain it as a Hero.
// EVILWINS: When 5 S.H.I.E.L.D. Officers escape.
makeSchemeCard("Brainwash the Military", { twists: 7 }, ev => {
  if (ev.nr <= 6) {
    // Twist 1-6 Stack this Twists next to the Scheme as a "Traitor Battalion." Play another card from the Villain Deck.
    attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
    villainDrawEv(ev);
  } else if (ev.nr === 7) {
    // Twist 7 All S.H.I.E.L.D. Officers in the city escape.
    cityVillains().limit(isShieldOfficer).each(c => villainEscapeEv(ev, c));
  }
}, escapeProgressTrigger(isShieldOfficer), () => {
  setSchemeTarget(5);
  repeat(12, () => moveCard(gameState.officer.top, gameState.villaindeck));
  villainify(u, isShieldOfficer, c => 3 + gameState.scheme.attached('TWIST').size, 'GAIN');
  gameState.villaindeck.shuffle();
}),
// SETUP: 7 Twists. Add an extra Villain Group.
// EVILWINS: When 3 capitals are conquered.
makeSchemeCard<{current: string, conquered: string[], city: Deck[]}>("Change the Outcome of WWII", { twists: 7, vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist: The Axis invades a new country. Put all Villains and Bystanders from the city on the bottom of the Villain Deck. The number of city spaces changes. Play 2 cards from the Villain Deck. If any Villains escape this country, stack a Twist next to the scheme as a "conquered capital."
  let size = 5;
  if (ev.nr === 1) {
    // Twist 1 Poland: 4 spaces.
    ev.state.current = 'Poland'; size = 4;
  } else if (ev.nr === 2) {
    // Twist 2 France: 3 spaces.
    ev.state.current = 'France'; size = 3;
  } else if (ev.nr === 3) {
    // Twist 3 USSR: 6 spaces.
    ev.state.current = 'USSR'; size = 6;
  } else if (ev.nr === 4) {
    // Twist 4 England: 3 spaces.
    ev.state.current = 'England'; size = 3;
  } else if (ev.nr === 5) {
    // Twist 5 USA: 5 spaces.
    ev.state.current = 'USA'; size = 5;
  } else if (ev.nr === 6) {
    // Twist 6 Australia: 2 spaces.
    ev.state.current = 'Australia'; size = 2;
  } else if (ev.nr === 7) {
    // Twist 7 Switzerland: 1 space.
    ev.state.current = 'Switzerland'; size = 1;
  }
  cityVillains().each(c => moveCardEv(ev, c, gameState.villaindeck, true)); // TODO detach cards on move
  cont(ev, () => CityCards().each(c => {})); // TODO handle other cards (Hyperion for now?)
  cont(ev, () => {
    ev.state.city.forEach((c, i) => c.cityPosition = i < 6 - size ? undefined : [i - 1, 0]);
    gameState.city = ev.state.city.slice(-size);
    makeCityAdjacent(gameState.city);
  });
  villainDrawEv(ev);
  villainDrawEv(ev);
}, {
  event: "ESCAPE",
  match: ev => isVillain(ev.what),
  after: ev => {
    const state:{current: string, conquered: string[]} = gameState.schemeState; 
    if(state.current && !state.conquered.includes(state.current)) {
      state.conquered.push(state.current);
      gameState.ko.limit(isTwist).withFirst(c => attachCardEv(ev, c, gameState.scheme, 'TWIST'));
      schemeProgressEv(ev, state.conquered.size);
    }
  }
}, s => {
  setSchemeTarget(3);
  const extraSpace = makeCityDeck('EXTRACITY', [-1, 0]);
  extraSpace.cityPosition = undefined;
  s.city = [extraSpace].concat(gameState.city);
  s.conquered = [];
}),
// SETUP: 9 Twists. 8 Heroes in Hero deck.
// RULE: Whenever a Hero is in the HQ whose Hero Name has been Purged from the Timestream, KO that Hero.
// EVILWINS: When the Hero Deck runs out.
makeSchemeCard("Go Back in Time to Slay Heroes' Ancestors", { twists: 9, heroes: 8 }, ev => {
  // Twist: Put a Hero form the HQ next to the Scheme, "Purged from the Timestream."
  selectCardEv(ev, "Select a Hero to purge from the Timestream", hqHeroes(), c => {
    attachCardEv(ev, c, gameState.scheme, 'PURGED');
    cont(ev, () => hqHeroes().limit(c => gameState.scheme.attached('PURGED').map(c => c.heroName).includes(c.heroName)).each(c => KOEv(ev, c)));
  });
}, [ runOutProgressTrigger("HERO"), {
  event: 'MOVECARD',
  match: ev => isHero(ev.what) && ev.to.isHQ && gameState.scheme.attached('PURGED').map(c => c.heroName).includes(ev.what.heroName),
  after: ev => KOEv(ev, ev.parent.what),
} ], () => {
  gameState.schemeProgress = gameState.herodeck.size;
}),
// SETUP: 6 Twists.
// RULE: Whenever you fight a Villain, you may pay 1 Recruit to look at one of the face-down Enigma Cards. When you fight the Mastermind, first guess the color of each Enigma card, and then reveal them. If you guessed them right, fight the Mastermind as normal. If not, your turn ends, and mix up the Enigma cards face-down.
makeSchemeCard("The Unbreakable Enigma Code", { twists: 6 }, ev => {
  if (ev.nr <= 5) {
    // Twist 1-5 Put a card from the Hero Deck face down next to the scheme as part of the "Enigma Code." Mix up those cards face-down.
    gameState.herodeck.withTop(c => attachCardEv(ev, c, gameState.scheme, 'CODE'));
    gameState.scheme.attachedDeck('DECODED').each(c => attachCardEv(ev, c, gameState.scheme, 'CODE'));
    cont(ev, () => gameState.scheme.attachedDeck('CODE').shuffle());
  }
  // Twist 6 Evil Wins!
  schemeProgressEv(ev, ev.nr);
}, [{
  event: 'FIGHT',
  match: ev => isVillain(ev.what),
  after: ev => {
    const action = new Ev(ev, 'EFFECT', { cost: { recruit: 1 }, func: ev => {
      gameState.scheme.attachedDeck('CODE').withTop(c => attachCardEv(ev, c, gameState.scheme, 'DECODED'));
    } });
    canPayCost(action) && chooseMayEv(ev, "Pay 1 Recruit to look at an Enigma Card", () => playEvent(action));
  }
}, {
  event: 'FIGHT',
  match: ev => isMastermind(ev.what),
  replace: ev => {
    let allGood = true;
    const decoded = gameState.scheme.attached('DECODED').size
    const codeLen = gameState.scheme.attached('CODE').size + decoded;
    gameState.scheme.attached('CODE').forEach((c, i) => {
      chooseOptionEv(ev, `Guess the color of Card ${i + 1 + decoded} of ${codeLen}`,
        [{l:'Green', v:Color.STRENGTH},
        {l:'Yellow', v:Color.INSTINCT},
        {l:'Red', v:Color.COVERT},
        {l:'Black', v:Color.TECH},
        {l:'Blue', v:Color.RANGED}], col => {
        allGood = allGood && c.isColor(col);
        textLog.log("Card " + (i + 1 + decoded) + ": ", c);
      });
      moveCardEv(ev, c, gameState.scheme.attachedDeck('DECODED'), true);
    });
    cont(ev, () => {
      textLog.log(`You guessed the Code ${allGood ? 'correctly' : 'incorrectly'}.`);
      if (allGood) {
        doReplacing(ev);
      } else {
        gameState.scheme.attachedDeck('DECODED').each(c => attachCardEv(ev, c, gameState.scheme, 'CODE'));
        cont(ev, () => {
          gameState.scheme.attachedDeck('CODE').shuffle();
          turnState.endofturn = true;
        });
      }
    });
  }
}], () => {
  setSchemeTarget(6);
  // Create Code decks to ensure the UI order
  gameState.scheme.attachedDeck('DECODED');
  gameState.scheme.attachedFaceDownDeck('CODE');
}),
]);
addTemplates("SCHEMES", "Civil War", [
// SETUP: 9 Twists. Hero Deck has 3 Heroes of one Team and 3 Heroes of another Team. (Avengers, X-Men, Spider-Friends, Marvel Knights, etc.)
makeSchemeCard("Avengers vs. X-Men", { twists: 9, heroes: 6 }, ev => {
  // Twist: 1-7 Each player reveals their hand. Each player that has cards of both those teams gains a Wound.
  eachPlayer(p => p.hand.limit(isNonGrayHero).uniqueCount(c => c.team) > 1 && gainWoundEv(ev, p));
  // TODO divided teams
  // Twist 8 Evil wins!
  schemeProgressEv(ev, ev.nr);
}, [], () => setSchemeTarget(8)),
// SETUP: 7 Twists.
// EVILWINS: When there are 7 Officers next to the Mastermind.
makeSchemeCard("Dark Reign of H.A.M.M.E.R. Officers", { twists: 7 }, ev => {
  // Twist: Stack this Twist next to the Scheme. Then, for each Twist in that stack, put a S.H.I.E.L.D. Officer next to the Mastermind as a 3 Attack Villain with S.H.I.E.L.D. Clearance. You can fight them to gain them as Heroes.
  attachCardEv(ev, ev.twist, gameState.scheme, "TWIST");
  cont(ev, () => villainifyOfficers(ev, gameState.scheme.attached('TWIST').size, gameState.mastermind.attachedDeck('OFFICER')));
}, {
  event: 'MOVECARD',
  match: ev => ev.to === gameState.mastermind.attachedDeck('OFFICER') || ev.from === gameState.mastermind.attachedDeck('OFFICER'),
  after: ev => schemeProgressEv(ev, gameState.mastermind.attachedDeck('OFFICER').size),
}, () => {
  setSchemeTarget(7);
  gameState.specialActions = ev => gameState.mastermind.attachedDeck('OFFICER').deck.map(c => fightActionEv(ev, c));
}),
// SETUP: 1 player: 4 Heroes in Hero Deck. 1-3 players: 9 Twists. 4-5 players: 6 Twists.
// EVILWINS: When the Hero Deck runs out.
makeSchemeCard("Epic Super Hero Civil War", { twists: [ 9, 9, 9, 6, 6 ] }, ev => {
  // Twist: Stack this Twist next to the Scheme. Then, for each Twist in that stack, KO a Hero from the HQ and immediately refill that HQ space.
  attachCardEv(ev, ev.twist, gameState.scheme, "TWIST");
  cont(ev, () => repeat(gameState.scheme.attached('TWIST').size, () => cont(ev, () => {
    selectCardAndKOEv(ev, hqHeroes());
  })));
}, runOutProgressTrigger('HERO'), () => gameState.schemeProgress = gameState.herodeck.size),
// SETUP: 11 Twists.
// EVILWINS: When 3 Bystanders are in the KO pile and/or Escape Pile.
makeSchemeCard<{schemeCopy:Card}>("Imprison Unregistered Superhumans", { twists: 11 }, ev => {
  const schemeCopy = ev.state.schemeCopy;
  if (ev.nr === 1 || ev.nr === 3 || ev.nr === 5 || ev.nr === 7 || ev.nr === 9) {
    // Twist 1, 3, 5, 7, 9 This Scheme fortifies the city space to its right starting with the Bridge. Villains in that space get +1 Attack.
    const where = schemeCopy.location.attachedTo;
    if (where && where instanceof Deck) {
      if (where.adjacentRight) fortifyEv(ev, schemeCopy, where.adjacentRight);
    } else {
      withCity('BRIDGE', bridge => fortifyEv(ev, schemeCopy, bridge));
    }
  } else {
    // If there's a Villain in that fortified city space, KO a bystander.
    gameState.city.each(d => isFortifying(schemeCopy, d) && d.has(isVillain) && gameState.bystanders.withTop(c => KOEv(ev, c)));
  }
}, koOrEscapeProgressTrigger(isBystander), s => {
  setSchemeTarget(3);
  gameState.outOfGame.addNewCard(gameState.scheme.top.instance);
  s.schemeCopy = gameState.outOfGame.deck.find(c => c.instance === gameState.scheme.top.instance);
  addStatMod('defense', c => isFortifying(s.schemeCopy, c) && isVillain(c), 1);
}),
// SETUP: 8 Twists.
// EVILWINS: When 15 Bystanders are in the KO pile and/or Escape Pile.
makeSchemeCard("Nitro the Supervillain Threatens Crowds", { twists: 8 }, ev => {
  // Twist: KO all Bystanders held by Villains. Then, the Villain with the highest Attack captures 3 Bystanders.
  villains().each(c => c.captured.limit(isBystander).each(c => KOEv(ev, c)));
  cont(ev, () => selectCardEv(ev, "Choose a Villain", cityVillains().highest(c => c.defense), c => captureEv(ev, c, 3)));
}, koOrEscapeProgressTrigger(isBystander), () => setSchemeTarget(15)),
// SETUP: 6 Twists. Add an extra Villain Group.
// EVILWINS: When there are 2 Villains per player in the Escape Pile.
makeSchemeCard("Predict Future Crime", { twists: 6, vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist: Reveal the top 3 cards of the Villain Deck. Play each Villain you revealed. Put the rest back in any order.
  revealVillainDeckEv(ev, 3, cards => selectCardOrderEv(ev, "Play Villain cards", cards.limit(isVillain), c => villainDrawEv(ev, c)), false, false);
}, escapeProgressTrigger(isVillain), () => setSchemeTarget(2, true)),
// SETUP: 6 Twists. 7 Heroes in Hero Deck.
// EVILWINS: When 5 Heroes are Unmasked.
makeSchemeCard("Reveal Heroes' Secret Identities", { twists: 6, heroes: 7 }, ev => {
  // Twist: Put a Hero from the HQ next to the Scheme as an "Unmasked" Hero. All cards with "Unmasked" Hero Names cost +1 Recruit to recruit. You can't Unmask a Hero Name that has already been Unmasked.
  selectCardEv(ev, "Choose a Hero to unmask", hqHeroes().limit(c => !gameState.scheme.attached('UNMASKED').has(m => m.heroName === c.heroName)), c => attachCardEv(ev, c, gameState.scheme, 'UNMASKED'));
  cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('UNMASKED').size));
  // TODO not heroName but templateName
}, [], () => {
  setSchemeTarget(5);
  addStatMod('cost', c => isHero(c) && gameState.scheme.attached('UNMASKED').has(m => m.heroName === c.heroName), 1);
}),
// SETUP: 10 Twists.
// EVILWINS: When there are 3 Western Victories or 3 Eastern Victories.
makeSchemeCard("United States Split by Civil War", { twists: 10 }, ev => {
  // Twist: If there is a Villain on the Streets or Bridge, put this Twist in a stack of "Western States Victories." Otherwise, if there is a Villain in the Sewers, put this Twist in a stack of "Eastern States Victories."
  const west = cityVillains().has(c => isLocation(c.location, 'BRIDGE', 'STREETS'));
  const east = cityVillains().has(c => isLocation(c.location, 'SEWERS'));
  if (west) attachCardEv(ev, ev.twist, gameState.scheme, 'WEST');
  else if (east) attachCardEv(ev, ev.twist, gameState.scheme, 'EAST');
  cont(ev, () => {
    const w = gameState.scheme.attached('WEST').size;
    const e = gameState.scheme.attached('EAST').size;
    schemeProgressEv(ev, Math.max(w, e));
  });
}, [], () => setSchemeTarget(3)),
]);
addTemplates("SCHEMES", "Deadpool", [
// SETUP: Use Deadpool as one of the Heroes. 2 players: Use 4 Heroes total. 1-3 players: 6 Twists. 4-5 Players: 5 Twists.
// EVILWINS: When the Hero Deck runs out.
makeSchemeCard("Deadpool Kills the Marvel Universe", { twists: [ 6, 6, 6, 5, 5 ], heroes: [ 3, 4, 5, 5, 6 ], required: { heroes: "Deadpool|Deadpool@Deadpool" } }, ev => {
  // Twist: Reveal cards from the Hero Deck until you reveal a Deadpool card. KO all the cards you revealed.
  revealHeroDeckEv(ev, c => !c.has(c => c.heroName === 'Deadpool'), cards => cards.each(c => KOEv(ev, c)));
}, runOutProgressTrigger("HERO"), () => gameState.schemeProgress = gameState.herodeck.size),
// SETUP: 6 Twists. 12 total Bystanders in the Villain Deck. All Bystanders represent "Chimichangas." <i>(They're Bystanders too.)</i> 3-5 players: Add a Villain Group.
// <b>Nobody Eats Just One Chimichanga!</b> Whenever you play a Chimichanga from the Villain Deck, play another card from the Villain Deck.
// EVILWINS: When 6 Chimichangas are in the Escape Pile.
makeSchemeCard("Deadpool Wants a Chimichanga", { twists: 6, vd_bystanders: 12, vd_villain: [ 1, 2, 4, 4, 5 ] }, ev => {
  // Twist: Put each Chimichanga from the city into the Escape Pile. Then, each player shuffles a Chimichanga from their Victory Pile back into the Villain Deck. Any player who cannot do so gains a Wound.
  CityCards().each(c => c.captured.limit(isBystander).each(c => moveCardEv(ev, c, gameState.escaped)));
  CityCards().limit(isBystander).each(c => moveCardEv(ev, c, gameState.escaped));
  cont(ev, () => eachPlayer(p => {
    selectCardOrEv(ev, "Choose a Chimichanga", p.victory.limit(isBystander), c => shuffleIntoEv(ev, c, gameState.villaindeck), () => gainWoundEv(ev, p), p);
  }));
}, [
  { event: 'VILLAINDRAW', after: ev => isBystander(ev.parent.what) && villainDrawEv(ev) },
  escapeProgressTrigger(isBystander)
], () => setSchemeTarget(6)),
// SETUP: Hey, writing these doesn't seem so tough. Use the best Hero in the game: Deadpool! Add 6 Twists of Lemon, shake vigorously, and I'll make it up as I go.
makeSchemeCard("Deadpool Writes a Scheme", { twists: 8 }, ev => {
  if (ev.nr === 1) {
    // Twist 1 Everybody draw 1 card. Wait, are these supposed to be bad?
    eachPlayer(p => drawEv(ev, 1, p));
  } else if (ev.nr === 2) {
    // Twist 2 Anyone without a Deadpool in hand is doing it wrong -- discard 2 cards.
    eachPlayer(p => p.hand.has(c => c.heroName === "Deadpool") || pickDiscardEv(ev, 2, p));
  } else if (ev.nr === 3) {
    // Twist 3 Play 3 cards from the Villain Deck. That sounds pretty bad, right?
    villainDrawEv(ev); villainDrawEv(ev); villainDrawEv(ev);
  } else if (ev.nr === 4) {
    // Twist 4 Each Villain captures 4 Bystanders. Hey, I'm not a balance expert.
    cityVillains().each(c => captureEv(ev, c, 4));
  } else if (ev.nr === 5) {
    // Twist 5 Each player gains 5 Wounds. Is that a good number?
    eachPlayer(p => repeat(4, () => gainWoundEv(ev, p)));
  }
  // Twist 6 Deadpool wins 6 times! Wow, I'm way better at this game than you.
  schemeProgressEv(ev, ev.nr);
}, [], () => setSchemeTarget(6)),
// SETUP: 6 Twists. Use at least 1 Mercs for Money Hero.
// RULE: All Villains have Revenge for their own Villain Groups. (If they already have Revenge, double it.)
// EVILWINS: When 3 Villains per player have escaped.
makeSchemeCard("Everybody Hates Deadpool", { twists: 6, required: { heroes: "Deadpool@Deadpool|Slapstick|Solo|Stingray"} }, ev => {
  // Twist: Everyone reveals their hand. Whoever reveals the fewest Mercs for Money cards (or tied for fewest) gains a Wound.
  const fewest = -gameState.players.max(p => -p.hand.count("Mercs for Money"));
  eachPlayer(p => p.hand.count("Mercs for Money") === fewest && gainWoundEv(ev, p));
}, escapeProgressTrigger(isVillain), () => {
  setSchemeTarget(3, true);
  addStatMod('defense', isVillain, c => playerState.victory.count(isGroup(c.villainGroup)));
}),
]);
addTemplates("SCHEMES", "Noir", [
// SETUP: 8 Twists.
// RULE: Whenever you defeat a Villain, you may pay 1 Attack extra to <b>Investigate</b> the Murder Suspects for a Bystander and rescue it.
makeSchemeCard<{names: string[]}>("Find the Split Personality Killer", { twists: 8 }, ev => {
  if (ev.nr <= 5) {
    // Twist 1-5 Shuffle 3 Bystanders from the Bystander Stack and the top card of the Hero Deck face down next to this Scheme as a deck of "Murder Suspects."
    repeat(3, () => cont(ev, () => gameState.bystanders.withTop(c => attachFaceDownCardEv(ev, c, gameState.scheme, 'SUSPECTS'))));
    cont(ev, () => gameState.herodeck.withTop(c => attachFaceDownCardEv(ev, c, gameState.scheme, 'SUSPECTS')));
  } else if (ev.nr === 6) {
    // Twist 6 Each player writes down their guess for which Hero Name is the Split Personality Killer. Reveal the entire Murder Suspects Deck. The Hero Name with the most cards in the Murder Suspect Deck (or tied for most) is the Split Personality Killer. Each player who guessed right wins. All other players lose.
    const suspects = gameState.scheme.attached('SUSPECTS');
    const killers = ev.state.names.highest(n => suspects.count(c => c.heroName === n));
    const winners: Player[] = [];
    eachPlayer(p => chooseOptionEv(ev, "Guess the Killer", ev.state.names.map(n => ({l:n, v:n})), v => killers.includes(v) && winners.push(p)));
    cont(ev, () => {
      gameOverEv(ev, winners.size ? "WIN" : "LOSS");
    });
  }
}, {
  event: 'DEFEAT',
  match: ev => isVillain(ev.what) && canPayCost(new Ev(ev, 'EFFECT', { func: () => {}, cost: { attack: 1 } })),
  after: ev => chooseMayEv(ev, "Pay 1 Attack to Investigate Murder Suspects", () => pushEv(ev, 'EFFECT', { func: ev => {
    investigateEv(ev, isBystander, gameState.scheme.attachedFaceDownDeck('SUSPECTS'), c => rescueEv(ev, c));
  }, cost: { attack: 1 } })),
}, s => {
  s.names = gameState.herodeck.deck.unique(c => c.heroName).limit(c => c !== undefined);
}),
// SETUP: 6 Twists.
// EVILWINS: When 6 Bystanders are in the Escape Pile.
makeSchemeCard("Silence the Witnesses", { twists: 6 }, ev => {
  // Twist: This Scheme captures 3 <b>Hidden Witnesses</b>. If it already had any <b>Hidden Witnesses</b>, put those into the Escape Pile.
  ev.source.attachedFaceDownDeck('WITNESS').each(c => moveCardEv(ev, c, gameState.escaped));
  captureWitnessEv(ev, ev.source, 3);
}, escapeProgressTrigger(isBystander), () => setSchemeTarget(6)),
// SETUP: 8 Twists. Add two extra Villain Groups. Split the Villain Deck into 5 shuffled decks, one above each city space.
// RULE: Each Villain Deck uses its own city of one city space. Each turn, you choose which Villain Deck plays a card.
// EVILWINS: When 8 Villains escape or all Villain Decks run out.
makeSchemeCard("Five Families of Crime", { twists: 8, vd_villain: [ 3, 4, 5, 5, 6 ] }, ev => { // TODO
  // Twist: Play two cards from a Villain Deck.
  villainDrawEv(ev); villainDrawEv(ev);
}, [
  escapeProgressTrigger(isVillain),
  {
    event: 'VILLAINDRAW',
    match: ev => !ev.what,
    before: ev => {
      gameState.villaindeck.each(c => moveCardEv(ev, c, gameState.cityEntry.attachedFaceDownDeck('FAMILY'), true));
      cont(ev, () => {
        gameState.city.has(d => d.attached('FAMILY').size > 0) || evilWinsEv(ev);
      });
      cont(ev, () => selectCardEv(ev, "Choose a family", gameState.city.limit(d => d.attached('FAMILY').size > 0), d => {
        d.attached('FAMILY').each(c => moveCardEv(ev, c, gameState.villaindeck, true));
        gameState.cityEntry = d;
      }));
    }
  },
  {
    event: 'CLEANUP',
    match: () => gameState.villaindeck.size === 0,
    before: ev => {
      gameState.city.limit(d => d.attached('FAMILY').size > 0).withFirst(d => {
        d.attached('FAMILY').each(c => moveCardEv(ev, c, gameState.villaindeck, true));
        gameState.cityEntry = d;
      });
    }
  }
], () => {
  setSchemeTarget(8);
  [...gameState.villaindeck.deck].forEach((c, i) => {
    const family = gameState.city[i % gameState.city.size].attachedFaceDownDeck('FAMILY');
    moveCard(c, family);
  });
  gameState.city.each(d => d.next = undefined);
}),
// SETUP: 8 Twists. Shuffle the Mastermind Tactics into the Villain Deck as Villains.
// RULE: If there are no Tactics in the city, you can win the game by fighting the Mastermind card.
// EVILWINS: When 2 Tactics escape.
makeSchemeCard("Hidden Heart of Darkness", { twists: 8 }, ev => {
  // Twist: Each player shuffles a Tactic from their victory pile into the Villain Deck. Any player who did so draws two cards. Then, <b>Investigate</b> the Villain Deck for a Tactic and that Tactic enters the city. Reveal all the cards you <b>Investigated</b>.
  eachPlayer(p => selectCardEv(ev, "Choose a Tactic", p.victory.limit(isTactic), c => {
    shuffleIntoEv(ev, c, gameState.villaindeck);
    drawEv(ev, 2, p);
  }, p));
  cont(ev, () => investigateEv(ev, isTactic, gameState.villaindeck, c => enterCityEv(ev, c)));
}, escapeProgressTrigger(isTactic), () => {
  setSchemeTarget(2);
  gameState.mastermind.each(m => {
    [...m.attached('TACTICS')].each(c => moveCard(c, gameState.villaindeck));
    addStatSet('isFightable', c => c === m, c => c.location === gameState.mastermind);
    addStatSet('fightCost', c => c === m, (c, cost: ActionCost) => ({ ...cost, cond: c => (!cost.cond || cost.cond(c)) && !cityVillains().has(isTactic) }));
  });
  addStatSet('isVillain', isTactic, () => true);
  gameState.villaindeck.shuffle();
}),
]);
addTemplates("SCHEMES", "X-Men", [
// SETUP: 8 Twists. Add 10 Brood as extra Henchmen. No Bystanders in Villain Deck.
// RULE: Cards are played from the Villain Deck face-down. You may spend 1 Attack to "scan" a face-down card in the city, turning it face-up and doing any Ambush effect, Twist, Trap, or Master Strike. If a face-down card would escape, scan it, and then it escapes if it's a Villain.
// EVILWINS: When 3 Villains per player have escaped.
makeSchemeCard<{hidden: Card}>("Alien Brood Encounters", { twists: 8, vd_bystanders: 0, vd_henchmen: [ 2, 2, 2, 3, 3 ], required: { henchmen: 'The Brood' } }, ev => {
  // Twist: The player on your right gains this Twist as a "Brood Infection." When drawn, they KO it and gain 2 Wounds.
  gainEv(ev, ev.twist, playerState.right);
}, [
  escapeProgressTrigger(isVillain), {
    event: 'MOVECARD',
    match: ev => ev.parent.type === 'DRAW' && isTwist(ev.what),
    after: ev => {
      KOEv(ev, ev.parent.what);
      gainWoundEv(ev, ev.parent.to.owner);
      gainWoundEv(ev, ev.parent.to.owner);
    },
  }, {
    event: 'VILLAINDRAW',
    match: ev => !ev.what,
    replace: ev => gameState.villaindeck.withTop(c => {
      const token = gameState.outOfGame.addNewCard(gameState.schemeState.hidden);
      moveCard(c, token.attachedFaceDownDeck('HIDDEN'));
      enterCityEv(ev, token);
    }),
  }
], s => {
  setSchemeTarget(3, true);
  const scan = (ev: Ev, c: Card) => {
    const where = c.location;
    where.remove(c);
    c.attached('HIDDEN').each(c => {
      isVillain(c) ? enterCityEv(ev, c, where) : villainDrawEv(ev, c)
    });
  };
  const tokenTemplate = new Card('TOKEN', 'Hidden');
  tokenTemplate.escape = ev => {
    const where = ev.source.location;
    where.remove(ev.source);
    ev.source.attached('HIDDEN').each(c => {
      isVillain(c) ? villainEscapeEv(ev, c) : villainDrawEv(ev, c)
    });
  }
  s.hidden = tokenTemplate;
  gameState.specialActions = ev => CityCards().limit(c => c.attached('HIDDEN').size > 0).map(c => {
    return new Ev(ev, 'EFFECT', { what: c, cost: { attack: 1 }, func: ev => scan(ev, ev.what) });
  });
}),
// SETUP: 11 Twists. 30 Wounds.
// RULE: At the start of your turn, for each Angry Mob in your hand, the player on your right gains a Wound and gains that Angry Mob.
// EVILWINS: When the Wound Stack or Villain Deck runs out.
makeSchemeCard("Anti-Mutant Hatred", { twists: 11, wounds: 30 }, ev => {
  // Twist: Put this Twist into your discard pile as an "Angry Mob."
  moveCardEv(ev, ev.twist, playerState.discard);
}, [ runOutProgressTrigger('WOUNDS'), runOutProgressTrigger('VILLAIN', false), {
  event: 'TURNSTART',
  match: ev => playerState.hand.has(isTwist),
  after: ev => playerState.hand.limit(isTwist).each(c => {
    gainWoundEv(ev, playerState.right);
    gainEv(ev, c, playerState.right);
  })
} ], () => gameState.schemeProgress = 30),
// SETUP: 10 Twists. Include Hellfire Club as one of the Villain Groups. Add 14 Jean Grey Hero cards to the Villain Deck.
// RULE: Jean Grey cards in the Villain Deck are Villains with attack equal to their cost, "Ambush: Play another Villain card" and "Fight: Gain this as a Hero."
// EVILWINS: When 5 Jean Grey cards have escaped.
// TODO can use any version of Jean Grey (Phoenix or Time travelling)
makeSchemeCard("The Dark Phoenix Saga", { twists: 10, heroes: [ 4, 6, 6, 6, 7 ], required: { heroes: "Jean Grey", villains: "Hellfire Club" } }, ev => {
  // Twist: Shuffle all Jean Grey cards from the KO pile and from all players' hands and discard piles into the Villain Deck.
  const isJeanGrey = (c: Card) => c.heroName === "Jean Grey";
  [...gameState.ko.deck, ...gameState.players.flatMap(p => handOrDiscard(p))].limit(isJeanGrey).each(c => shuffleIntoEv(ev, c, gameState.villaindeck));
}, escapeProgressTrigger(c => c.heroName === "Jean Grey"), () => {
  setSchemeTarget(5);
  const isJeanGrey = (c: Card) => c.heroName === "Jean Grey";
  gameState.herodeck.limit(isJeanGrey).each(c => moveCard(c, gameState.villaindeck));
  gameState.villaindeck.shuffle();
  villainify(u, isJeanGrey, c => c.cost, 'GAIN');
  addStatSet('ambush', isJeanGrey, () => ev => villainDrawEv(ev));
}),
// SETUP: 6 Twists
makeSchemeCard("Horror of Horrors", { twists: 6 }, ev => {
  if (ev.nr <= 5) {
    // Twist 1-5 Play a random Horror.
    playHorrorEv(ev);
  }
  // Twist 6 Evil wins!
  schemeProgressEv(ev, ev.nr);
}, [], () => setSchemeTarget(6)),
// SETUP: 9 Twists. Include 10 Sentinels as extra Henchmen (or substitute another Henchman group.)
// RULE: All Sentinels get +1 Attack for each Sentinel Upgrade next to the Scheme.
// EVILWINS: When 3 Sentinels have Escaped.
makeSchemeCard("Mutant-Hunting Super Sentinels", { twists: 9, vd_henchmen: [ 2, 2, 2, 3, 3 ], required: { henchmen: 'Sentinel' }}, ev => {
  // Twist: Stack this Twist next to the Scheme as a "Sentinel Upgrade." Shuffle all Sentinels from players' Victory Piles into the Villain Deck. Play another card from the Villain Deck.
  attachCardEv(ev, ev.twist, gameState.scheme, 'UPGRADE');
  gameState.players.each(p => p.victory.limit(c => c.cardName === "Sentinel").each(c => shuffleIntoEv(ev, c, gameState.villaindeck)));
  villainDrawEv(ev);
}, escapeProgressTrigger(c => c.cardName === "Sentinel"), () => {
  setSchemeTarget(3);
  addStatMod('defense', c => c.cardName === "Sentinel", () => gameState.scheme.attached('UPGRADE').size);
}),
// SETUP: 5 Twists
// EVILWINS: When the city is destroyed.
makeSchemeCard("Nuclear Armageddon", { twists: 5 }, ev => {
  // Twist: Destroy the city space closest to the Mastermind. Any Villain There escapes. Put this Twist there.
  // Copied from Galactus' master strike
  withLeftmostCitySpace(ev, space => {
    destroyCity(space);
    if (!gameState.city.size) evilWinsEv(ev);
    space.deck.limit(isVillain).each(c => villainEscapeEv(ev, c));
    moveCardEv(ev, ev.twist, space);
  });
}),
// SETUP: 11 Twists. 6 Wounds per player in Wound Stack.
// EVILWINS: When the Wound Stack or Villain Deck runs out.
// FAQ https://boardgamegeek.com/thread/1820963/televised-death-traps-timing
makeSchemeCard("Televised Deathtraps of Mojoworld", { twists: 11, wounds: [ 6, 12, 18, 24, 30 ] }, ev => {
  // Twist: Stack this Twist next to the Scheme as a "Deathtrap.' This turn, you may pay 1 Attack for each Deathtrap stacked there. If you don't, each player gains a Wound.
  attachCardEv(ev, ev.twist, gameState.scheme, 'DEATHTRAP');
  cont(ev, () => {
    const attack = gameState.scheme.attached('DEATHTRAP').size;
    let paid = false;
    addTurnAction(new Ev(ev, 'EFFECT', { what: gameState.scheme.top, cost: { attack }, func: ev => paid = true }))
    addTurnTrigger('CLEANUP', () => true, ev => paid || eachPlayer(p => gainWoundEv(ev, p)));
  });
}, [ runOutProgressTrigger('WOUNDS'), runOutProgressTrigger('VILLAIN', false)], () => gameState.schemeProgress = 6 * gameState.players.size),
// SETUP: 8 Twists.
// EVILWINS: When there are 5 Airborne Neurotoxins.
makeSchemeCard("X-Men Danger Room Goes Berserk", { twists: 8 }, ev => {
  // Twist: Trap! By End of Turn: You may pay 2 Recruit. If you do, shuffle this Twist back into the Villain Deck, then play a card from the Villain Deck. Or Suffer: Stack this Twist next to the scheme as an "Airborne Neurotoxin."
  let paid = false;
  const c = ev.twist;
  attachCardEv(ev, c, gameState.scheme, 'TRAP');
  addTurnAction(new Ev(ev, 'EFFECT', { what: c, cost: { recruit: 2 }, func: ev => {
    paid = true;
    shuffleIntoEv(ev, ev.what, gameState.villaindeck);
    villainDrawEv(ev);
  } }))
  addTurnTrigger('CLEANUP', () => !paid, ev => {
    attachCardEv(ev, c, gameState.scheme, 'TOXIN');
    cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('TOXIN').size));
  });
}, [], () => setSchemeTarget(5)),
]);
addTemplates("SCHEMES", "Spider-Man Homecoming", [
// SETUP: 8 Twists. Use at least one Spider Friends Hero.
// EVILWINS: When there have been 5 Villainous Interruptions.
makeSchemeCard("Distract the Hero", { twists: 8, required: { heroes: "%Spider Friends" } }, ev => {
  // Comunity ruling https://boardgamegeek.com/thread/2092842/distract-hero-what-does-it-mean-get-some-vp
  // Twist: If you get any Victory Points this turn, put this Twist on the bottom of the Villain Deck. Otherwise, stack this Twist next to the Scheme as a Villainous Interruption.
  let done = false;
  const twist = ev.twist;
  addTurnTrigger('MOVECARD', ev => ev.to === playerState.victory && ev.what.vp > 0, ev => {
    done = true;
    moveCardEv(ev, twist, gameState.villaindeck, true);
  })
  addTurnTrigger('CLEANUP', () => !done, ev => {
    attachCardEv(ev, twist, gameState.scheme, 'TWIST');
    cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('TWIST').size));
  })
}, [], () => setSchemeTarget(5)),
// SETUP: 8 Twists. Shuffle 18 Bystanders and 14 Wounds, then deal them evenly into eight decks. Put these decks in a row, as Floors of the Washington Monument.
// RULE: Whenever you fight a Villain, you may reveal any face-down card from any Floor. If it's a Bystander, rescue it. If it's a Wound, put it back face-up.
// EVILWINS: When 10 Bystanders are in the KO pile and/or Escape Pile, or all Floors are KO'd.
makeSchemeCard("Explosion at the Washington Monument", { twists: 8 }, ev => {
  // Twist: KO the topmost Floor of the Washington Monument. You gain one of the Wounds KO'd this way.
  if (ev.nr <= 8) {
    const d = gameState.scheme.attachedFaceDownDeck(`FLOOR${9-ev.nr}`);
    const cards = [...d.deck, ...d.attached('WOUNDS')];
    let gain : Card;
    cards.limit(isWound).withFirst(c => gain = c);
    cards.each(c => c === gain ? gainEv(ev, c) : KOEv(ev, c));
    if (ev.nr === 8) gameOverEv(ev, "LOSS");
  }
}, [ koOrEscapeProgressTrigger(isBystander), {
  event: 'FIGHT',
  match: ev => isVillain(ev.what),
  after: ev => {
    const cards: Card[] = [1, 2, 3, 4, 5, 6, 7, 8].map(i => gameState.scheme.attachedFaceDownDeck(`FLOOR${i}`)).limit(d => d.size > 0).map(d => d.top);
    selectCardOptEv(ev, "Choose a card to reveal", cards, c => {
      isBystander(c) ? rescueEv(ev, c) : attachCardEv(ev, c, c.location, 'WOUNDS');
    });
  }
}], () => {
  const floors: Deck[] = [];
  repeat(8, i => floors.push(gameState.scheme.attachedFaceDownDeck(`FLOOR${i+1}`)));
  repeat(18, () => gameState.bystanders.withTop(c => moveCard(c, floors[0])));
  repeat(14, () => gameState.wounds.withTop(c => moveCard(c, floors[0])));
  floors[0].shuffle();
  repeat(4, () => floors.each(d => floors[0].withTop(c => moveCard(c, d))));
  setSchemeTarget(10);
}),
// SETUP: 9 Twists. Put the Bystander Stack above the Sewers as the "Ferry."
// EVILWINS: When 7 Bystanders are in the KO pile and/or Escape Pile.
makeSchemeCard<{ferryPos: Deck}>("Ferry Disaster", { twists: 9 }, ev => {
  if (ev.nr <= 4) {
    // Twist 1-4 If there's a Villain in the city space below the Ferry, KO 2 Bystanders from the Ferry. Whether you KO'd or not, the Ferry moves one space left.
    if (ev.state.ferryPos.has(isVillain)) repeat(2, () => cont(ev, () => gameState.bystanders.withTop(c => KOEv(ev, c))));
    if (ev.state.ferryPos.adjacentLeft) ev.state.ferryPos = ev.state.ferryPos.adjacentLeft;
    gameState.bystanders.cityPosition = [4 - ev.nr, -1];
  } else if (ev.nr >= 5 && ev.nr <= 8) {
    // Twist 5-8 Same effect, but it moves right.
    if (ev.state.ferryPos.has(isVillain)) repeat(2, () => cont(ev, () => gameState.bystanders.withTop(c => KOEv(ev, c))));
    if (ev.state.ferryPos.adjacentRight) ev.state.ferryPos = ev.state.ferryPos.adjacentRight;
    gameState.bystanders.cityPosition = [ev.nr - 4, -1];
  } else if (ev.nr === 9) {
    // Twist 9 KO half the Bystanders from the Bystander deck, rounding up.
    repeat(Math.ceil(gameState.bystanders.size / 2), () => cont(ev, () => gameState.bystanders.withTop(c => KOEv(ev, c))));
  }
}, koOrEscapeProgressTrigger(isBystander), s => {
  setSchemeTarget(7);
  gameState.bystanders.cityPosition = [4, -1];
  withCity('SEWERS', sewers => s.ferryPos = sewers);
}),
// SETUP: 7 Twists. Add an extra Henchmen Group of 10 cards as Smugglers.
// RULE: Smugglers have Striker.
// EVILWINS: When 3 Villains per player have escaped or the Villain Deck runs out.
makeSchemeCard("Scavenge Alien Weaponry", { twists: 7, vd_henchmen: [2, 2, 2, 3, 3] }, ev => {
  // Twist: Play two cards from the Villain Deck.
  villainDrawEv(ev); villainDrawEv(ev);
}, [ runOutProgressTrigger('VILLAIN', false), escapeProgressTrigger(isVillain)], () => {
  addStatMod('defense', c => c.cardName === extraHenchmenName(), () => strikerCount());
}),
]);
addTemplates("SCHEMES", "Champions", [
// SETUP: 10 Twists. 6 Wounds per player in the Wound Stack. Shuffle 8 Monsters Unleashed Villains into a face-down "Monster Pit" deck.
// EVILWINS: When the Wound Stack or Monster Pit Deck runs out.
makeSchemeCard("Clash of the Monsters Unleashed", { twists: 10, wounds: [ 6, 12, 18, 24, 30 ], vd_villain: [ 2, 3, 4, 4, 5 ], required: { villains: "Monsters Unleashed" } }, ev => {
  if (ev.nr >= 3 && ev.nr <= 10) {
    // Twist 3-10 Each player chooses a Villain from their Victory Pile as their "Gladiator." Then the top card of the Monster Pit enteres the city. Each player whose Gladiator has a lower printed Attack than that Monster gains a Wound.
    gameState.scheme.attachedFaceDownDeck('PIT').withTop(c => {
      enterCityEv(ev, c);
      eachPlayer(p => p.victory.limit(isVillain).max(c => c.printedDefense) < c.printedDefense && gainWoundEv(ev, p));
    });
  }
  cont(ev, () => gameState.scheme.attached('PIT').size === 0 && evilWinsEv(ev));
}, runOutProgressTrigger('WOUNDS'), () => {
  gameState.schemeProgress = gameState.wounds.size;
  gameState.villaindeck.limit(isGroup("Monsters Unleashed")).each(c => moveCard(c, gameState.scheme.attachedFaceDownDeck('PIT')));
}),
// SETUP: 8 Twists. 7 Heroes. Sort the Hero Deck by Hero Class. [Strength] [Instinct] [Covert] [Tech] [Ranged] (If a card has multiple Classes, break ties at random.) Put these 5 smaller, shuffled Hero Decks beneath the 5 HQ Spaces.
// RULE: Whenever an HQ Space is empty, fill it with the top card of the Hero Deck below that space.
// EVILWINS: When all Hero Decks are gone.
makeSchemeCard<{decks: { col: number, d: Deck }[]}>("Divide and Conquer", { twists: 8, heroes: 7 }, ev => {
  if (ev.nr <= 3) {
    // Twist 1-3 KO all Heroes in the HQ.
    hqHeroes().each(c => KOEv(ev, c));
  } else if (ev.nr >= 4 && ev.nr <= 8) {
    // Twist 4-8 KO one of the Hero Decks.
    selectCardEv(ev, "Choose a deck to KO", gameState.hq.limit(d => d.attachedDeck('HEROES').size > 0), d => d.attached('HEROES').each(c => KOEv(ev, c)));
  }
}, [{
  event: 'MOVECARD',
  match: ev => ev.from === gameState.herodeck,
  after: ev => {
    const d = gameState.hq.map(d => d.attachedDeck('HEROES')).find(d => d.size > 0);
    d ? (gameState.herodeck = d) : evilWinsEv(ev);
  }
}, {
  event: 'MOVECARD',
  match: ev => ev.from === gameState.herodeck && ev.to.isHQ && ev.to.attachedDeck('HEROES') !== gameState.herodeck,
  replace: ev => {
    ev.parent.to.attachedDeck('HEROES').withTop(c => moveCardEv(ev, c, ev.parent.to));
  },
}, {
  event: 'MOVECARD',
  match: ev => ev.to === gameState.herodeck && ev.from !== gameState.herodeck,
  replace: ev => {
    const state: {decks: { col: number, d: Deck }[]} = gameState.schemeState;
    state.decks.limit(({col}) => isColor(col)(ev.parent.what)).withRandom(({d}) => d === ev.parent.to ? doReplacing(ev) : moveCardEv(ev, ev.parent.what, d, ev.parent.bottom));
  },
}], s => {
  const classes = [Color.STRENGTH, Color.INSTINCT, Color.COVERT, Color.TECH, Color.RANGED];
  s.decks = classes.map((col, i) => ({col, d:gameState.hq[i].attachedFaceDownDeck('HEROES')}));
  [...gameState.herodeck.deck].each(c => {
    s.decks.limit(({col}) => isColor(col)(c)).withRandom(({d}) => moveCard(c, d));
  })
  gameState.herodeck = gameState.hq.map(d => d.attachedDeck('HEROES')).find(d => d.size > 0);
  gameState.hq.each(d => d.attached('HEROES').size && moveCard(d.attachedDeck('HEROES').top, d));
  gameState.specialActions = ev => [
    new Ev(ev, "EFFECT", { desc: "Change default Hero deck", func: ev => {
      selectCardEv(ev, "Choose Hero deck", gameState.hq.limit(d => d.attachedDeck('HEROES').size > 0), d => gameState.herodeck = d.attachedDeck('HEROES'));
    }})
  ];
}),
// SETUP: 8 Twists. Add another Henchman Villain Group. No Bystanders in the Villain Deck.
// EVILWINS: When 8 Villains are in the Escape pile.
makeSchemeCard("Hypnotize Every Human", { twists: 8, vd_bystanders: 0, vd_henchmen: [ 2, 2, 2, 3, 3 ], }, ev => {
  if (ev.nr <= 6) {
    // Twist 1-6 Put a Bystander from the Bystander Stack above each city space as a facedown 2 Attack "Hypno-Thrall" Villain. They don't move. When you fight one, rescue it as a Bystander. You can't fight a Villain in a city space that has any Hypno-Thralls above it.
    gameState.city.each(d => cont(ev, () =>{
      gameState.bystanders.withTop(c => {
        villainify("Hypno-Thrall", c, 2, "RESCUE");
        attachCardEv(ev, c, d, 'THRALL');
      });
    }));
  } else if (ev.nr >= 7 && ev.nr <= 8) {
    // Twist 7-8 Each player puts a Villain from their Victory Pile into the Escape pile.
    eachPlayer(p => selectCardEv(ev, "Choose a Villain", p.victory.limit(isVillain), c => moveCardEv(ev, c, gameState.escaped), p));
  }
}, escapeProgressTrigger(isVillain), () => {
  setSchemeTarget(8);
  gameState.specialActions = ev => {
    return gameState.city.map(d => d.attached('THRALL').map(c => fightActionEv(ev, c))).merge();
  };
  addStatSet('fightCost', c => c.location.isCity && c.location.attached('THRALL').size > 0, (c, prev) => ({ ...prev, cond: () => false }));
}),
// SETUP: 8 Twists. The "Oxygen Level" starts at 8.
// EVILWINS: When 20 non-grey Heroes are KO'd.
makeSchemeCard("Steal All Oxygen on Earth", { twists: 8 }, ev => {
  // Twist: Stack this Twist next to the Scheme. The Oxygen Level decreases by 1. Then KO each Hero from the HQ whose cost is greater than the Oxygen Level.
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  const level = 8 - ev.nr;
  hqHeroes().limit(c => c.cost > level).each(c => KOEv(ev, c));
}, koProgressTrigger(isNonGrayHero), () => setSchemeTarget(20)),
]);
addTemplates("SCHEMES", "World War Hulk", [
// SETUP: 9 Twists. 7 Heroes.
// EVILWINS: When 25 non-grey Heroes are KO'd.
makeSchemeCard("Break the Planet Asunder", { twists: 9, heroes: 7 }, ev => {
  // Twist: Stack this Twist next to the Scheme as a "Tectonic Break." Then KO each Hero from the HQ whose printed Attack is less than the number of Tectonic Breaks (no printed Attack counts as 0).
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  cont(ev, () => {
    const n = gameState.scheme.attached('TWIST').size;
    hqHeroes().limit(c => !c.printedAttack || c.printedAttack < n).each(c => KOEv(ev, c));
  })
}, koProgressTrigger(isNonGrayHero), () => setSchemeTarget(25)),
// SETUP: 10 Twists. Shuffle together 20 Bystanders and 10 Cytoplasm Spike Henchmen as an "Infected Deck."
// EVILWINS: When the KO pile and Escape Pile combine to have 18 Bystanders and/or Spikes.
makeSchemeCard("Cytoplasm Spike Invasion", { twists: 10, vd_henchmen: [2, 2, 2, 3, 3], required: { henchmen: "Cytoplasm Spikes" } }, ev => {
  // Twist: Reveal the top three cards of the Infected Deck. KO all Bystanders you revealed. All Spikes you revealed enter the city.
  const infected = gameState.scheme.attachedFaceDownDeck('INFECTED');
  repeat(3, () => cont(ev, () => {
    infected.withTop(c => {
      isBystander(c) && KOEv(ev, c);
      c.cardName === "Cytoplasm Spikes" && enterCityEv(ev, c);
    })
  }));
}, koOrEscapeProgressTrigger(c => isBystander(c) || c.cardName == "Cytoplasm Spikes"), () => {
  setSchemeTarget(18);
  const infected = gameState.scheme.attachedFaceDownDeck('INFECTED');
  gameState.villaindeck.limit(c => c.cardName === "Cytoplasm Spikes").each(c => moveCard(c, infected));
  repeat(20, () => gameState.bystanders.withTop(c => moveCard(c, infected)));
  infected.shuffle();
}),
// SETUP: 10 Twists. 6 Wounds per player in Wound Stack. Use exactly two Heroes with "Hulk" in their Hero Names.
// EVILWINS: When the Wound Stack runs out.
makeSchemeCard("Fall of the Hulks", { twists: 10, wounds: [6, 12, 18, 24, 30], required: { heroes: [
  "Hulk|Hulkling|Totally Awesome Hulk|Gladiator Hulk|Hulkbuster Iron Man|Joe Fixit, Grey Hulk|She-Hulk|Skaar, Son of Hulk|Hulk@Marvel Studios Phase 1|Hulk 2099",
  "Hulk|Hulkling|Totally Awesome Hulk|Gladiator Hulk|Hulkbuster Iron Man|Joe Fixit, Grey Hulk|She-Hulk|Skaar, Son of Hulk|Hulk@Marvel Studios Phase 1|Hulk 2099"
]} }, ev => { // TODO use exactly two HULK
  if (ev.nr >= 3 && ev.nr <= 6) {
    // Twist 3-6 <b>Cross-Dimension Hulk Rampage</b>. FIX
    xdRampageEv(ev, 'Hulk');
  } else if (ev.nr >= 7 && ev.nr <= 10) {
    // Twist 7-10 Each player gains a Wound.
    eachPlayer(p => gainWoundEv(ev, p));
  }
}, runOutProgressTrigger('WOUNDS'), () => gameState.schemeProgress = gameState.wounds.size),
// SETUP: 6 Twists.
// EVILWINS: When 2 Villains per player have escaped or the Villain Deck runs out.
makeSchemeCard<{enabledUntil: Player}>("Gladiator Pits of Sakaar", { twists: 6 }, ev => {
  // Twist: Until the start of your next turn, each player can only play cards from a single Team of their choice during their turn. (e.g. S.H.I.E.L.D., Avengers, X-Men, Warbound, etc.)
  ev.state.enabledUntil = playerState;
}, [escapeProgressTrigger(isVillain), runOutProgressTrigger("VILLAIN", false), {
  event: "TURNSTART",
  match: ev => playerState === gameState.schemeState.enabledUntil,
  after: ev => {
    gameState.schemeState.enabledUntil = undefined;
  }
}, {
  event: "PLAY",
  match: ev => gameState.schemeState.enabledUntil && !pastEvents('PLAY').size,
  after: ev => {
    textLog.log(`${playerState.name} has chosen to play ${ev.parent.what.team} Heroes until the start of their next turn.`);
  }
}], s => {
  forbidAction('PLAY', c => s.enabledUntil && (!c.team || pastEvWhat('PLAY').has(c2 => !isTeam(c.team)(c2))), true);
}),
// SETUP: 7 Twists. Take 14 cards from an extra Hero with "Hulk" in its Hero Name. Put them in a face-up "Mutation Pile."
makeSchemeCard("Mutating Gamma Rays", { twists: 7, heroes: [ 4, 6, 6, 6, 7 ], required: { heroes: "Hulk|Hulkling|Totally Awesome Hulk|Gladiator Hulk|Hulkbuster Iron Man|Joe Fixit, Grey Hulk|She-Hulk|Skaar, Son of Hulk|Hulk@Marvel Studios Phase 1|Hulk 2099" } }, ev => {
  if (ev.nr <= 6) {
    // Twist 1-6 Each player in turn does the following: Put a non-grey Hero from your hand into the Mutation Pile. Then you may put a different card name with the same cost from the Mutation Pile into your discard pile.
    eachPlayer(p => cont(ev, () => {
      selectCardEv(ev, "Choose a Hero", p.hand.limit(isNonGrayHero), c => {
        const mutation = gameState.scheme.attachedDeck('MUTATION');
        moveCardEv(ev, c, mutation);
        selectCardOptEv(ev, "Choose a Hero to put in your discard", mutation.limit(v => c.cost === v.cost), c => {
          moveCardEv(ev, c, p.discard);
        }, () => {}, p);
      }, p);
    }));
  }
  // Twist 7 Evil Wins!
  schemeProgressEv(ev, ev.nr);
}, [], () => {
  const mutation = gameState.scheme.attachedDeck('MUTATION');
  gameState.herodeck.limit(c => c.heroName === extraHeroName()).each(c => moveCard(c, mutation));
  setSchemeTarget(7);
}),
// SETUP: 8 Twists. Take 14 cards from an extra Hero with "Hulk" in its Hero Name. Shuffle them into a "Hulk Deck."
// RULE: You may recruit the top card of the Prison Ship stack.
// EVILWINS: When there are 10 cards in the Prison Ship or the Hulk Deck runs out.
makeSchemeCard("Shoot Hulk into Space", { twists: 8, heroes: [ 4, 6, 6, 6, 7 ], required: { heroes: "Hulk|Hulkling|Totally Awesome Hulk|Gladiator Hulk|Hulkbuster Iron Man|Joe Fixit, Grey Hulk|She-Hulk|Skaar, Son of Hulk|Hulk@Marvel Studios Phase 1|Hulk 2099" } }, ev => {
  // Twist: Put 2 cards from the Hulk Deck into a face-up "Prison Ship" stack next to the S.H.I.E.L.D. Officer Stack.
  const hulkDeck = gameState.scheme.attachedDeck('HULK');
  const prison = gameState.officer.attachedDeck('PRISON');
  repeat(2, () => cont(ev, () => hulkDeck.withTop(c => moveCardEv(ev, c, prison))));
  cont(ev, () => {
    schemeProgressEv(ev, prison.size);
    hulkDeck.size === 0 && evilWinsEv(ev);
  });
}, [], () => {
  const hulkDeck = gameState.scheme.attachedFaceDownDeck('HULK');
  gameState.officer.attachedDeck('PRISON');
  gameState.herodeck.limit(isSetupHero()).each(c => moveCard(c, hulkDeck));
  gameState.specialActions = ev => gameState.officer.attachedDeck('PRISON').size ? [
    recruitCardActionEv(ev, gameState.officer.attachedDeck('PRISON').top)
  ] : [];
  setSchemeTarget(10);
}),
// SETUP: 11 Twists.
// RULE: To recruit a Hero in the HQ, you must also pay 1 Recruit for each Obedience Disk under it.
// EVILWINS: When each HQ space has 2 Obedience Disks.
makeSchemeCard("Subjugate with Obedience Disks", { twists: 11 }, ev => {
  // Twist: Put this Twist under an HQ space as an "Obedience Disk." No space can have two more Obedience Disks than any other space.
  const spaces = gameState.hq.highest(d => -d.attached('DISK').size);
  selectCardEv(ev, 'Choose an HQ space', spaces, d => attachCardEv(ev, ev.twist, d, 'DISK'));
  cont(ev, () => schemeProgressEv(ev, gameState.hq.sum(d => d.attached('DISK').size)));
}, [], () => {
  setSchemeTarget(gameState.hq.size * 2);
  addStatSet('recruitCost', c => c.location.isHQ, (c, p) => ({
    ...p, recruit: (p.recruit || 0) + c.location.attached('DISK').size,
  }));
}),
// SETUP: 9 Twists. Put three additional Masterminds out of play, "Lurking." Each of the four Masterminds has two random Tactics.
// RULE: When you defeat all of a Mastermind's Tactics, KO its face card and a random Lurking Mastermind enters play.
makeSchemeCard("World War Hulk", { twists: 9, extra_masterminds: 3 }, ev => {
  const lurking = gameState.scheme.attachedDeck('LURKING');
  if (ev.nr <= 8) {
    // Twist 1-8 Swap the current Mastermind with a random Lurking Mastermind.
    withMastermind(ev, m1 => lurking.withRandom(m2 => {
      moveCardEv(ev, m2, gameState.mastermind);
      moveCardEv(ev, m1, lurking);
    }));
  }
  // Twist 9 Evil Wins!
  schemeProgressEv(ev, ev.nr);
}, {
  event: 'DEFEAT',
  match: ev => isMastermind(ev.what) && ev.what.attached('TACTICS').size === 1,
  before: ev => gameState.scheme.attachedDeck('LURKING').withRandom(m => moveCardEv(ev, m, gameState.mastermind)),
  after: ev => KOEv(ev, ev.parent.what),
}, () => {
  setSchemeTarget(9);
  const lurking = gameState.scheme.attachedDeck('LURKING');
  [...gameState.mastermind.deck].forEach((m, i) => {
    m.attachedDeck('TACTICS').deck.splice(2);
    if (i > 0) moveCard(m, lurking);
  });
}),
]);
addTemplates("SCHEMES", "Marvel Studios Phase 1", [
copySchemeTemplate("Negative Zone Prison Breakout", "Asgard Under Siege"),
copySchemeTemplate("Midtown Bank Robbery", "Destroy the Cities of Earth!"),
copySchemeTemplate("Secret Invasion of the Skrull Shapeshifters", "Enslave Minds with the Chitauri Scepter", { params: { twists: 8, heroes: 6, required: { villains: "Chitauri" } } }),
copySchemeTemplate("Portals to the Dark Dimension", "Invade Asgard"),
copySchemeTemplate("The Legacy Virus", "Radioactive Palladium Poisoning"),
copySchemeTemplate("Replace Earth's Leaders with Killbots", "Replace Earth's Leaders with HYDRA"),
copySchemeTemplate("Super Hero Civil War"),
copySchemeTemplate("Unleash the Power of the Cosmic Cube"),
]);
addTemplates("SCHEMES", "Ant-Man", [
// SETUP: 11 Twists. 4-5 Players: Add another Hero.
// RULE: Evolved Ultrons have 4 Attack and are <b>Empowered</b> by each color in the Evolution pile. They're worth 6VP.
// EVILWINS: When 7 Evolved Ultrons are in the city and/or Escape Pile.
makeSchemeCard("Age of Ultron", { twists: 11, heroes: [ 3, 5, 5, 6, 7 ] }, ev => {
  // Twist: Put the top card of the Hero Deck next to the Scheme in an "Evolution" Pile. Then this Twist enters the city as an "Evolved Ultron" Villain.
  const evolution = gameState.scheme.attachedDeck('EVOLUTION');
  gameState.herodeck.withTop(c => moveCardEv(ev, c, evolution));
  villainify('Evolved Ultron', ev.twist, c => 4 + empowerVarDefense(evolution.deck.map(c => c.color).reduce((p, c) => p | c))(c), 6);
  enterCityEv(ev, ev.twist);
}, {
  event: "MOVECARD",
  match: ev => ev.to === gameState.escaped || ev.to.isCity || ev.from === gameState.escaped || ev.from.isCity,
  after: ev => schemeProgressEv(ev, [...cityVillains(), ...gameState.escaped.deck].count(c => isTwist(c) && isVillain(c))),
}, () => {
  setSchemeTarget(7);
}),
// SETUP: 9 Twists.
// EVILWINS: When 3 Villains per player have escaped.
makeSchemeCard("Pull Earth into Medieval Times", { twists: 9 }, ev => {
  if (ev.nr <= 6) {
    // Twist 1-6 Until the start of your next turn, all Villains and Mastermind everywhere have <b>Chivalrous Duel</b>.
    let enabled = true;
    addStatSet('chivalrousDuel', isEnemy, (c, p) => enabled || p);
    addFutureTrigger(() => enabled = false, playerState);
  } else if (ev.nr >= 7 && ev.nr <= 9) {
    // Twist 7-9 Each player puts a Villains from the Victory Pile into the Escape Pile.
    eachPlayer(p => selectCardEv(ev, "Choose a Villain", p.victory.limit(isVillain), c => moveCardEv(ev, c, gameState.escaped), p));
  }
}, escapeProgressTrigger(isVillain), () => {
  setSchemeTarget(3, true);
}),
// SETUP: Twists equal to the number of players plus 6.
// EVILWINS: When ther are 10 Giant Ants next to the Mastermind.
makeSchemeCard("Transform Commuters into Giant Ants", { twists: [7, 8, 9, 10, 11] }, ev => {
  // Twist: STack this Twist next to the Scheme. Then for each Twist in that stack, put a Bystander face down next to the Mastermind as a 2A "Giant Ant" Villain. When you fight one, rescue it as a Bystander. // FIX 2A STack
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  cont(ev, () => {
    const amount = gameState.scheme.attached('TWIST').size;
    repeat(amount, () => cont(ev, () => {
      gameState.bystanders.withTop(c => {
        villainify("Giant Ant", c, 2, "RESCUE");
        attachFaceDownCardEv(ev, c, gameState.mastermind, 'ANT');
      });
    }));
    cont(ev, () => schemeProgressEv(ev, gameState.mastermind.attached('ANT').size));
  });
}, [], () => {
  // TODO remake excessive violence to work here
  setSchemeTarget(10);
  gameState.specialActions = ev => gameState.mastermind.attached('ANT').map(c => fightActionEv(ev, c));
}),
// SETUP: 11 Twists. Add all 14 cards for and extra Hero the Villain Deck.
// RULE: Heroes in the Villain Deck are "Micro-Sized Villains with Attack equal to their printed cost. They have <b>Size-Changing</b> for their card color and no outher abilites while in the city. When you fight one, choose any player to gain it as a Hero.
// EVILWINS: When 3 Villains per player have escaped or the Villain Deck runs out.
makeSchemeCard("Trap Heroes in the Microverse", { twists: 11, heroes: [ 4, 6, 6, 6, 7 ] }, ev => {
  // Twist: Play two cards from the Villain Deck.
  villainDrawEv(ev); villainDrawEv(ev);
}, [ escapeProgressTrigger(isVillain), runOutProgressTrigger('VILLAIN', false) ], () => {
  setSchemeTarget(3, true);
  gameState.herodeck.limit(c => c.heroName === extraHeroName()).each(c => moveCard(c, gameState.villaindeck));
  gameState.villaindeck.shuffle();
  villainify("Giant Ant", c => c.heroName === extraHeroName(), c => c.printedCost, ev => choosePlayerEv(ev, p => gainEv(ev, ev.source, p)));
  addStatSet('sizeChanging', c => c.heroName === extraHeroName(), c => c.color);
}),
]);
addTemplates("SCHEMES", "Venom", [
// SETUP: 8 Twists. Add an extra Henchman Group.
// EVILWINS: When the Escape Pile has 3 cards per player, or the Villain Deck runs out.
makeSchemeCard("Invasion of the Venom Symbiotes", { twists: 8, vd_henchmen: [2, 2, 2, 3, 3] }, ev => {
  // Twist: This Twist enters the city as a 3 Attack "Symbiote" Villain worth 3VP with "<b>Ambush</b>: This <b>Symbiote Bonds</b> with another Villain in the city. Play another card from the Villain Deck."
  villainify('Symbiote', ev.twist, 3, 3);
  addStatSet('ambush', is(ev.twist), () => ev => symbioteBondEv(ev, "TO", cityVillains().limit(isNot(ev.source)), ev.source));
  enterCityEv(ev, ev.twist);
  villainDrawEv(ev);
}, escapeProgressTrigger(c => true), () => {
  setSchemeTarget(3, true);
}),
// SETUP: 10 Twists. Wound Stack has 6 Wounds per player.
// RULE: "Possessed Psychotics" have Attack equal to the number of Twists next to the Scheme. When you fight one, rescue it as a Bystander.
// EVILWINS: When there are 6 Bystanders in the Escape Pile or the Wound Stack runs out.
makeSchemeCard("Maximum Carnage", { twists: 10, wounds: [6, 12, 18, 24, 30] }, ev => {
  // Twist: Stack this Twist next to the Scheme. If the Streets are empty, put a Bystander there as a "Possessed Psychotic" Villain. If the Streets weren't empty, each player gains a Wound.
  attachCardEv(ev, ev.twist, gameState.scheme, "TWIST");
  withCity('STREETS', streets => isCityEmpty(streets) ? gameState.bystanders.withTop(c => {
    villainify('Possesed Psychotic', c, () => gameState.scheme.attached('TWIST').size, 'RESCUE');
    enterCityEv(ev, c, streets);
  }) : eachPlayer(p => gainWoundEv(ev, p)))
}, [
  escapeProgressTrigger(isBystander),
  runOutProgressTrigger('WOUNDS', false),
], () => {
  setSchemeTarget(6);
}),
// SETUP: 6 Twists. All Bystanders are also "Biochemists."
makeSchemeCard("Paralyzing Venom", { twists: 6 }, ev => {
  // Twist: Each player Kos a Biochemist from their Victory Pile or discards down to 4 cards in hand. // FIX Kos
  eachPlayer(p => selectCardOptEv(ev, "Choose a Biochemist", p.victory.limit(isBystander), c => KOEv(ev, c), () => pickDiscardEv(ev, -4, p), p));
  // Twist 6 Evil Wins!
  schemeProgressEv(ev, ev.nr)
}, [], () => setSchemeTarget(6)),
// SETUP: 11 Twists. Set aside a second "Drained" Mastermind and its 4 Tactics, out of play. Add its "Always Leads" Villains as an extra Villain Group.
// RULE: If Tactics or Master Strikes mention the Drained Mastermind, use the main Mastermind instead.
makeSchemeCard<{drained: Card}>("Symbiotic Absorption", { twists: 11, extra_masterminds: 1, vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  if (ev.nr <= 4) {
    // Twist 1-4 Shuffle one of the Drained Mastermind's Tactics into the main Mastermind's Tactics.
    withMastermind(ev, m => {
      ev.state.drained.attached('TACTICS').withRandom(c => {
        c.mastermind = m;
        shuffleIntoEv(ev, c, m.attachedDeck('TACTICS'));
      });
    }, true);
  } else if (ev.nr === 6 || ev.nr === 8 || ev.nr === 10) {
    // Twist 6, 8, 10 The Mastermind uses this Twist to copy the Master Strike ability of the Drained Mastermind.
    withMastermind(ev, m => pushEffects(ev, m, "strike", ev.state.drained.strike, { what: ev.what, nr: 0 }), true); // TODO abstract next to playStrike for better discoverability
  }
  // Twist 11 Evil Wins!
  schemeProgressEv(ev, ev.nr);
}, [], s => {
  setSchemeTarget(11);
  s.drained = gameState.mastermind.deck[1]; // TODO init extra masterminds attached to scheme already
  moveCard(s.drained, gameState.scheme.attachedDeck('DRAINED'));
}),
]);
addTemplates("SCHEMES", "Revelations", [
// SETUP: 11 Twists. Add an extra Villain Group.
// RULE: There are two extra "Low Tide" city spaces on the left side of the city, so the city has 7 spaces total.
// TRULE: The Low Tide, Bridge, and Streets city spaces no longer exist. The city has 3 spaces total. Put this Scheme on the Streets to mark the edge of the city. Villains in destroyed city spaces escape, starting from the left.
// BEVILWINS: When 3 Villains per player have escaped or the Villain Deck runs out.
makeTransformingSchemeCard<{city: Deck[]}>("Earthquake Drains the Ocean", "Tsunami Crushes the Coast", { twists: 11, vd_villain: [ 2, 3, 4, 4, 5 ] }, transformed => ev => {
  // Twist: The tide rushes in. This Scheme {TRANSFORM}.
  // Twist: The tide rushes out. This Scheme {TRANSFORM}, then play another card from the Villain Deck.
  let newCity = ev.state.city;
  if (!transformed) {
    const toRemove = gameState.city.filter(d => ["LOWTIDE1", "LOWTIDE2", "BRIDGE", "STREETS"].includes(d.id));
    newCity = gameState.city.filter(d => !["LOWTIDE1", "LOWTIDE2", "BRIDGE", "STREETS"].includes(d.id));
    toRemove.each(d => d.limit(isVillain).each(c => villainEscapeEv(ev, c)));
    gameState.city = newCity;
    cont(ev, () => toRemove.each(c => {})); // TODO handle other cards (Hyperion for now?, locations?)
  }
  transformSchemeEv(ev);
  cont(ev, () => {
    gameState.city = newCity;
    makeCityAdjacent(gameState.city);
  })
  transformed && villainDrawEv(ev);
}, escapeProgressTrigger(isVillain), (s) => {
  setSchemeTarget(3, true);
  s.city = [makeCityDeck("LOWTIDE1", -2), makeCityDeck("LOWTIDE2", -1), ...gameState.city];
  gameState.city = s.city;
  makeCityAdjacent(gameState.city);
}),
// SETUP: 8 Twists. Hero Deck is 4 X-Men Heroes and 2 non-X-Men Heroes. (Or substitute another team for all X-Men icons on both sides.) Add 14 Scarlet Witch Hero cards to the Villain Deck.
// RULE: Each Scarlet Witch in the city is a Villain with Attack equal to its cost +3. If you fight one, gain it as a Hero.
// TRULE: Each Scarlet Witch in the city is a Villain with Attack equal to its cost +4. If you fight one, gain it as a Hero.
// TEVILWINS: When the number of non-grey Heroes in the KO pile is ten plus double the number of players.
// 
makeTransformingSchemeCard<{xMen: string[]}>("House of M", "”No More Mutants”", { twists: 8, heroes: 7, required: { heroes: "Scarlet Witch" } }, transformed => ev => {
  // Twist: KO all non-X-Men Heroes from the HQ. If there are at least 2 Scarlet Witch cards in the city, this Scheme {TRANSFORM}. Otherwise play another card from the Villain Deck.
  // Twist: KO all X-Men Heroes from the HQ. Play another card from the Villain Deck.
  hqHeroes().limit(c => ev.state.xMen.includes(c.heroName) === transformed).each(c => KOEv(ev, c));
  !transformed && cityVillains().count(isGroup("Scarlet Witch")) >= 2 ? transformSchemeEv(ev) : villainDrawEv(ev);
}, koProgressTrigger(isNonGrayHero), s => {
  const isScarletWith = (c: Card) => c.heroName === "Scarlet Witch";
  s.xMen = gameState.gameSetup.heroes.slice(0, 4);
  gameState.herodeck.limit(isScarletWith).each(c => moveCard(c, gameState.villaindeck));
  gameState.villaindeck.shuffle();
  villainify("Scarlet Witch", isScarletWith, c => c.cost + (gameState.scheme.top.isTransformed ? 4 : 3), "GAIN");
  setSchemeTarget(10 + 2 * gameState.players.length);
}),

// SETUP: 30 Officers in the S.H.I.E.L.D. Officer stack. 1 player: 7 Twists. 2-3 players: 9 Twists. 4-5 players: 11 Twists.
// RULE: Officers stacked next to this Scheme are "Hydra Sympathizers." You may pay 3 Recruit to have the player of your choice gain one as a Hero.
// TRULE: Officers next to this Scheme are 3 Attack "Hydra Traitor" Villains. When you fight one, return it to the Officer Stack and KO one of your Heroes.
// TEVILWINS: When there are 15 Officers next to this Scheme or the S.H.I.E.L.D. Officer Stack runs out.
makeTransformingSchemeCard("Secret HYDRA Corruption", "Open HYDRA Revolution", { twists: [ 7, 9, 9, 11, 11 ] }, transformed => ev => {
  // Twist: For each Twist in the KO pile (including this one), put a card from the S.H.I.E.L.D. Officer stack next to this Scheme. Then this Scheme {TRANSFORM}.
  // Twist: For each Twist in the KO pile (including this one), put a card from the S.H.I.E.L.D. Officer stack next to this Scheme, Then if Evil hasn't won yet, this Scheme {TRANSFORM}.
  repeat(gameState.ko.count(isTwist), () => cont(ev, () => {
    gameState.officer.top ? attachCardEv(ev, gameState.officer.top, gameState.scheme, "HYDRA") : evilWinsEv(ev);
  }))
  cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached("HYDRA").size));
  transformSchemeEv(ev);
}, [
  runOutProgressTrigger("SHIELDOFFICER", false),
], () => {
  setSchemeTarget(15);
  villainify("Hydra Traitor", c => c.location?.id === "SCHEME/HYDRA" && gameState.scheme.top.isTransformed, 3, ev => {
    selectCardAndKOEv(ev, yourHeroes())
    returnToStackEv(ev, gameState.officer);
    cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached("HYDRA").size));
  });
  gameState.specialActions = ev => {
    const stack = gameState.scheme.attached("HYDRA");
    if (gameState.scheme.top.isTransformed) {
      return stack.map(c => fightActionEv(ev, c))
    } else {
      return stack.map(c => new Ev(ev, "EFFECT", {
        cost: { recruit: 3 },
        what: c,
        func: ev => {
          choosePlayerEv(ev, p => gainEv(ev, c, p));
          cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached("HYDRA").size));
        },
      }))
    }
  }
}),

// SETUP: 8 Twists.
// TRULE: This Scheme counts as a 19 Attack "Korvac" Villain worth 9VP. If you defeat Korvac, KO the Mastermind and all its Tactics.
makeTransformingSchemeCard("The Korvac Saga", "Korvac Revealed", { twists: 8 }, transformed => ev => {
  // Twist: Each player must discard down to four cards or KO a Bystander from their Victory Pile to "search for the Korvac Entity." This Scheme {TRANSFORM}.
  // <b>Twist: 2,4,6</b>: Each player discards an Avengers Hero or gains a Wound. This Scheme {TRANSFORM}.
  if (transformed && [2, 4, 6].includes(ev.nr)) {
    eachPlayer(p => selectCardOptEv(ev, "Choose a card to discard", p.hand.limit("Avengers"), c => discardEv(ev, c), () => gainWoundEv(ev, p), p));
  } else {
    eachPlayer(p => {
      selectCardOptEv(ev, "Choose a Bystander to KO", p.victory.limit(isBystander), c => KOEv(ev, c), () => pickDiscardEv(ev, -4, p));
    });
  }
  // Twist 8 Evil Wins!
  schemeProgressEv(ev, ev.nr);
  transformSchemeEv(ev);
}, [], () => {
  setSchemeTarget(8);
  const isKorvac = (c: Card) => gameState.scheme.has(c => c.isTransformed) && c.location === gameState.scheme;
  villainify("Korvac", isKorvac, 19, 9);
  addStatSet("fight", isKorvac, () => ev => {
    gameState.mastermind.each(c => c.attached("TACTICS").each(c => KOEv(ev, c)));
    gameState.mastermind.each(c => KOEv(ev, c));
  });
  gameState.specialActions = ev => gameState.scheme.limit(c => c.isTransformed).map(c => fightActionEv(ev, c));
}),
]);
addTemplates("SCHEMES", "S.H.I.E.L.D.", [
// SETUP: 7 Twists. Include either the "Hydra Elite" or "A.I.M., Hydra Offshoot" Villain Group, but not both.
// EVILWINS: When the <b>Hydra Level</b> is 11.
makeSchemeCard("S.H.I.E.L.D. vs. HYDRA War", { twists: 7, required: { villains: "Hydra Elite|A.I.M., Hydra Offshoot"} }, ev => { // TODO not both requried
  // Twist: Each player puts a card from the S.H.I.E.L.D. Officer Stack face up next to the Scheme as a 3 Attack "Double Agent" Villain. If any Double Agents were already there, put one into the Escape Pile and put the rest on the bottom of the S.H.I.E.L.D. Officer Stack. You can fight any Double Agent next to the Scheme to gain it or send it {UNDERCOVER}.
  const currentAgents = [...gameState.scheme.attached("DOUBLEAGENT")];
  eachPlayer(() => cont(ev, () => gameState.officer.withTop(c => {
    villainify("Double Agent", c, 3, ev => {
      chooseOneEv(ev, "Choose One", ["Gain", () => gainEv(ev, ev.source)], ["Send Undercover", () => sendUndercoverEv(ev)]);
    });
    attachCardEv(ev, c, gameState.scheme, "DOUBLEAGENT");
  })));
  cont(ev, () => selectCardEv(ev, "Choose a Double Agent to put into the Escape Pile", currentAgents, c => {
    moveCardEv(ev, c, gameState.escaped);
    currentAgents.each(c2 => c !== c2 && moveCardEv(ev, c2, gameState.officer, true));
  }));
}, escapeProgressTrigger(isShieldOrHydraInAnyWay), () => {
  setSchemeTarget(11);
  gameState.specialActions = ev => gameState.mastermind.attachedDeck('DOUBLEAGENT').deck.map(c => fightActionEv(ev, c));
}),
// SETUP: 11 Twists.
// -Say "I'd never abandon S.H.I.E.L.D.", and you can't fight this turn.
// -Or whisper "Hail Hydra", you can't recruit this turn, and a Villain captures a Bystander.
makeSchemeCard("Hail Hydra", { twists: 11 }, ev => {
  if (ev.nr <= 9) {
    // Twist 1-9 Choose one:
    chooseOneEv(ev, "Choose one", ["I'd never abandon S.H.I.E.L.D.", () => {
      forbidAction('FIGHT');
    }], ["Hail Hydra", () => {
      forbidAction('RECRUIT');
      selectCardEv(ev, "Choose a Villain", villains(), c => captureEv(ev, c));
    }]);
  }
  // Twist 10 Evil Wins!
  schemeProgressEv(ev, ev.nr);
}, [], () => {
  setSchemeTarget(10);
}),
// SETUP: 8 Twists. Add an extra Hero.
// EVILWINS: When there are 18 non-grey Heroes in the KO pile.
makeSchemeCard("Hydra Helicarriers Hunt Heroes", { twists: 8, heroes: [4, 6, 6, 6, 7] }, ev => {
  // Twist: Stack this Twist next to the Scheme. Then for each Twist stacked there, choose a different Hero Class ([Strength], [Instinct], [Covert], [Tech], [Ranged] ), to a maximum of 5. KO each Hero from the HQ that has any of those Hero Classes.
  attachCardEv(ev, ev.twist, gameState.scheme, "TWIST");
  let chosenClasses = 0;
  cont(ev, () => {
    const allClasses = [Color.COVERT, Color.INSTINCT, Color.TECH, Color.RANGED, Color.STRENGTH];
    const amount = gameState.scheme.attached('TWIST').size;
    if (amount >= allClasses.size) {
      chosenClasses = allClasses.reduce((p, c) => p | c, 0);
    } else {
      repeat(amount, () => chooseClassEv(ev, c => chosenClasses |= c, c => !(c && chosenClasses)));
    }
  });
  cont(ev, () => hqHeroes().limit(chosenClasses).each(c => KOEv(ev, c)));
}, [
  koProgressTrigger(isNonGrayHero),
], () => {
  setSchemeTarget(18);
}),
// SETUP: 11 Twists. Randomly pick 5 cards that cost 5 or less from an additional Hero. Shuffle them to form a "Dark Loyalty" deck.
// EVILWINS: When there are 6 Vicious Betrayals next to the Scheme.
makeSchemeCard("Secret Empire of Betrayal", { twists: 11, heroes: [4, 6, 6, 6, 7]  }, ev => {
  // Twist: Shuffle this Twist into the Dark Loyalty deck as a "Vicious Betrayal." Then reveal the top card of that deck. If it's a Hero, gain it. If it's a Vicious Betrayal, put it next to the Scheme and each other player gains a Wound.
  const darkStack = gameState.scheme.attachedDeck('DARK_LOYALTY');
  shuffleIntoEv(ev, ev.twist, darkStack);
  revealDeckEv(ev, darkStack, 1, cards => cards.each(c => {
    if (isTwist(c)) {
      attachCardEv(ev, c, gameState.scheme, "TWIST");
      eachOtherPlayer(p => gainWoundEv(ev, p));
      cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('TWIST').size));
    } else {
      gainEv(ev, c);
    }
  }));
}, [], () => {
  const darkStack = gameState.scheme.attachedFaceDownDeck('DARK_LOYALTY');
  gameState.herodeck.limit(isExtraHero).each(c => moveCard(c, darkStack));
  darkStack.deck = darkStack.deck.limit(c => c.printedCost <= 5);
  darkStack.shuffle();
  darkStack.deck.splice(5);
  setSchemeTarget(6);
}),
]);
addTemplates("SCHEMES", "Heroes of Asgard", [
// SETUP: 11 Twists.
// EVILWINS: When there are 5 Moral Failings.
makeSchemeCard("Asgardian Test of Worth", { twists: 11 }, ev => {
  if (ev.nr <= 7) {
    // Twist 1-7 Each player who is not {WORTHY} discards a card. Then, if at least half the players <i>(round up)</i> are not {WORTHY}, put this Twist next to the Scheme as a "Moral Failing."
    eachPlayer(p => worthyPower(p) || pickDiscardEv(ev, 1, p));
    if(gameState.players.count(worthyPower) <= Math.floor(gameState.players.size / 2))
      attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  } else if (ev.nr >= 8 && ev.nr <= 11) {
    // Twist 8-11 Put this Twist next to the Scheme as a "Moral Failing."
    attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  }
  cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('TWIST').size));
}, [], () => {
  setSchemeTarget(5);
}),
// SETUP: 10 Twists.
// RULE: Villains in city spaces with Eternal Darkness get +1 Attack. To recruit a Hero in an HQ space with Eternal Darkness, you must pay an extra 1 Recruit.
// EVILWINS: When all city spaces or all HQ spaces are covered in Eternal Darkness.
makeSchemeCard("The Dark World of Svartalfheim", { twists: 10 }, ev => {
  // Twist: Put this Twist next to a city space of HQ space that doesn't already have one, as "Eternal Darkness."
  const decks = [...gameState.hq, ...gameState.city].filter(d => !d.attached('DARKNESS').size);
  selectCardEv(ev, "Choose a location", decks, d => attachCardEv(ev, ev.twist, d, 'DARKNESS'));
  cont(ev, () => schemeProgressEv(ev, [gameState.hq, gameState.city].max(decks => decks.count(d => d.attached('DARKNESS').size > 0))));
}, [], () => {
  setSchemeTarget(5);
  addStatMod('defense', isVillain, c => c.location.attached('DARKNESS').size);
  addStatMod('cost', isHero, c => c.location.attached('DARKNESS').size)
}),
// SETUP: 11 Twists.
// EVILWINS: When there are 5 Guardians Defeated.
makeSchemeCard("Ragnarok, Twilight of the Gods", { twists: 11 }, ev => {
  // Twist: Choose a Villain from your Victory Pile worth at least 2VP to enter the city. Then, if the total Attack of Villains in the city is at least as high as the Guardian Attack listed below, put this Twist next to the Scheme as a "Guardian Defeated."
  selectCardEv(ev, "Choose a Villain to enter the city", playerState.victory.limit(isVillain).limit(c => c.vp >= 2), c => {
    enterCityEv(ev, c);
  });
  // Twist 1 Balder, 11 Attack    <b>Twist 5</b>: Heimdall, 12 Attack
  // Twist 2 Odin, 24 Attack        <b>Twist 6</b>: Frey, 7 Attack
  // Twist 3 Vidar, 19 Attack        <b>Twist 7</b>: Frigga, 8 Attack
  // Twist 4 Tyr, 16 Attack        <b>Twist 8-11</b>: Warriors of Valhalla, 6 Attack
  cont(ev, () => {
    const totalAttack = cityVillains().sum(c => c.defense);
    const guardianDefense = [ , 11, 24, 19, 16, 12, 7, 8, 6, 6, 6, 6 ][ev.nr];
    totalAttack >= guardianDefense && attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  });
  cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('TWIST').size));
}, [], () => {
  setSchemeTarget(5);
}),
// SETUP: 9 Twists.
// EVILWINS: When there are 5 Frost Giant Invaders in the city and/or Escape Pile.
makeSchemeCard("War of the Frost Giants", { twists: 9 }, ev => {
  // Twist 1-7 This Twist enters the city as a "Frost Giant Invader" Villain worth 6VP with 6 Attack and the ability "If you are not {WORTHY}, this gets +4 Attack."
  villainify("Frost Giant Invader", ev.twist, () => worthyPower() ? 6 : 10, 6);
  enterCityEv(ev, ev.twist);
  if (ev.nr >= 8 && ev.nr <= 9) {
    // Twist 8-9 Same effect, then a Frost Giant Invader from each player's Victory Pile enters the city.
    eachPlayer(p => selectCardEv(ev, "Choose a Frost Giant Invader", p.victory.limit(isGroup("Frost Giant Invader")), c => enterCityEv(ev, c), p));
  }
}, {
  event: "MOVECARD",
  match: ev => ev.to === gameState.escaped || ev.to.isCity || ev.from === gameState.escaped || ev.from.isCity,
  after: ev => schemeProgressEv(ev, [...cityVillains(), ...gameState.escaped.deck].count(isGroup("Frost Giant Invader"))),
}, () => {
  setSchemeTarget(5);
}),
]);
addTemplates("SCHEMES", "New Mutants", [
// SETUP: 8 Twists. Include Demons of Limbo as one of the Villain Groups. Put the Demon Bear Villain from that groups next to the Scheme.
// RULE: Whenever the Demon Bear escapes, stack a Twist next to the Scheme as a "Dream Horror."
// EVILWINS: When there are 3 Dream Horrors.
makeSchemeCard("The Demon Bear Saga", { twists: 8, required: { villains: "Demons of Limbo" } }, ev => {
  // Twist: If the Demon Bear is in the city, it escapes. Otherwise, the Demon Bear enters the city from wherever it is. If it was in a player's Victory Pile, that player rescues 4 Bystanders.
  const cards = [villains(), gameState.scheme.attached('BEAR'), gameState.players.map(p => p.victory.deck).merge(), gameState.escaped.deck, gameState.ko.deck].merge();
  cards.limit(c => c.cardName === "Demon Bear").withFirst(bear => {
    const where = bear.location;
    if (where.isCity) {
      villainEscapeEv(ev, bear);
    } else {
      if (owner(bear)) rescueByEv(ev, owner(bear), 4);
      enterCityEv(ev, bear);
    }
  });
}, {
  event: 'ESCAPE',
  match: ev => ev.what.cardName === "Demon Bear",
  after: ev => {
    gameState.ko.limit(isTwist).withFirst(c => attachCardEv(ev, c, gameState.scheme, 'TWIST'))
    cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('TWIST').size))
  }
}, () => {
  const bears = gameState.scheme.attachedDeck('BEAR')
  gameState.villaindeck.limit(c => c.cardName === "Demon Bear").each(c => moveCard(c, bears));
  setSchemeTarget(3);
}),
// SETUP: 11 Twists.
// <b>Twist 1,3,5,7</b>: {MOONLIGHT} Stack this Twist next to the Scheme as an "Altered Orbit."
// <b>Twist 2,4,6,8</b>: {SUNLIGHT} Same effect.
// <b>Twist 9,10,11</b>: Same effect.
// EVILWINS: When there are 4 Altered Orbits.
makeSchemeCard("Crash the Moon into the Sun", { twists: 11 }, ev => {
  if (sunlightPower() && [2, 4, 6, 8].includes(ev.nr) ||
      moonlightPower() && [1, 3, 5, 7].includes(ev.nr) ||
      [9, 10, 11].includes(ev.nr)) attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('TWIST').size));
}, [], () => {
  setSchemeTarget(4);
}),
// SETUP: 1 Twist, plus 2 Twists per player.
// RULE: On each of your turns, before you play other cards from your hand, you must play two randomly-selected cards from your hand for each Psychotic Break you have.
// EVILWINS: When a player has 3 Psychotic Breaks.
makeSchemeCard("Trapped in the Insane Asylum", { twists: [ 3, 5, 7, 9, 11 ] }, ev => {
  // Twist: You face a "Sanity Test": Either keep this Twist in front of you as a "Psychotic Break", or discard a card and pass this Twist to the PLayer on your left and that player faces a Sanity Test. // FIX PLayer
  const sanityTest = (p: Player = playerState) => {
    chooseOptionEv(ev, "Choose one",
      [{l:"Pass the Twist", v:() => { pickDiscardEv(ev, 1, p); sanityTest(p.left); }},
      {l:"Keep as Psychotic Break", v:() => attachCardEv(ev, ev.twist, p.deck, 'TWIST')}], f => f(), p);
  }
  sanityTest();
  cont(ev, () => schemeProgressEv(ev, gameState.players.max(p => p.deck.attached('TWIST').size)));
}, [], () => {
  setSchemeTarget(3);
  const needsInsanePlays = () => pastEvents('INSANEPLAY').size < 2 * playerState.deck.attached('TWIST').size;
  forbidAction('PLAY', () => needsInsanePlays(), true);
  gameState.specialActions = ev => needsInsanePlays ? [ new Ev(ev, 'INSANEPLAY', {
    desc: "Play a random card",
    cost: { cond: () => playerState.hand.has(c => (isHero(c) || isArtifact(c)) && canPlay(c)) },
    func: ev => {
      const playableCards = playerState.hand.limit(c => (isHero(c) || isArtifact(c)) && canPlay(c));
      playableCards.withRandom(c => pushEv(ev, 'PLAY', { func: playCard, what: c }));
    }
  })] : [];
}),
// SETUP: 9 Twists. Add an extra Villain Group.
// RULE: The Bank nd the Streets do not exist. Put the Villain Deck under the HQ as "Home Plate." The Sewers, Rooftops, and Bridge are First, Second, and Third Base.
// EVILWINS: When Evil has 4 "runs" <i>(Villains in the Escape Pile)</i> per player.
makeSchemeCard("Superhuman Baseball Game", { twists: 9, vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist: Play the top card of the Villain Deck. If it's a Bystander, rescue that "Cheering Fan." If it's a Master Strike, then after it resolves, any Villain on Third Base "Steals Home" and Escapes. If it's a Villain, it "Hits a Double," pushes to Second Base <i>(the Rooftops)</i> and you play the top card from the Villain Deck.
  const c = gameState.villaindeck.top;
  if (c) {
    if (isBystander(c)) rescueEv(ev, c);
    else {
      villainDrawEv(ev);
      if(isVillain(c)) {
        cont(ev, () => withCity('ROOFTOPS', rooftops => c.location.isCity && moveCardEv(ev, c, rooftops)));
        villainDrawEv(ev);
      } else if (isStrike(c)) {
        cont(ev, () => withCity('BRIDGE', bridge => bridge.limit(isVillain).each(c => villainEscapeEv(ev, c))));
      }
    }
  }
}, escapeProgressTrigger(isVillain), () => {
  setSchemeTarget(4);
  gameState.city.filter(d => d.id === "BANK" || d.id === "STREETS").forEach(d => destroyCity(d, true));
}),
]);
addTemplates("SCHEMES", "Into the Cosmos", [
// SETUP: 11 Twists. Add an extra Hero. Put 11 random cards from the Hero Deck face up in a "Contest Row."
// EVILWINS: When there are 6 Evil Triumphs.
makeSchemeCard("The Contest of Champions", { twists: 11, heroes: [ 4, 6, 6, 6, 7 ] }, ev => {
  const contestRow = gameState.scheme.attachedDeck("CONTEST");
  // Twist 1-4 KO the leftmost card in the Contest Row, then {CONTEST OF CHAMPIONS} for that cards color(s).
  // Each player that loses discards a card. If the Mastermind wins, put a Wound next to this Scheme as an "Evil Triumph."
  // Twist 5-8 Same effect, but in the Contest, Evil selects from 4 cards from the Hero Deck.
  // Twist 9-11 Same effect, but in the Contest, Evil selects from 6 cards from the Hero Deck.
  contestRow.withTop(c => {
    KOEv(ev, c);
    contestOfChampionsEv(ev, c.color, () => {}, p => {
      pickDiscardEv(ev, 1, p);
    }, () => {
      gameState.wounds.withTop(c => attachCardEv(ev, c, gameState.scheme, 'TRIUMPH'));
    }, ev.nr <= 4 ? 2 : ev.nr <= 8 ? 4 : 6);
  })
  cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('TRIUMPH').size));
}, [], () => {
  const contestRow = gameState.scheme.attachedDeck("CONTEST");
  repeat(11, () => gameState.herodeck.withTop(c => moveCard(c, contestRow)));
  setSchemeTarget(6);
}),
// SETUP: 14 Twists (using 3 Wounds to represent extra Scheme Twists). Put 14 Adam Warlock Hero cards in a face up stack, ordered from lowest-cost on top, to highest-cost on the bottom.
// EVILWINS: When there are 8 Souls Corruptions.
makeSchemeCard("Turn the Soul of Adam Warlock", { twists: 14, heroes: [ 4, 6, 6, 6, 7 ], required: { heroes: "Adam Warlock" } }, ev => {
  // Twist: Set aside the top card of the Adam Warlock stack.
  gameState.scheme.attachedDeck("ADAM").withTop(c => {
    attachCardEv(ev, c, gameState.scheme, "ADAMASIDE");
  });
  // This turn you may "Purify" it by spending Attack equal to double its cost.
  // If you do, choose a player to gain that card, then you rescue a Bystander, and you may KO one of your Heroes.
  // If you don't do this by the end of your turn, put that Adam Warlock card into a "Soul's Corruption" stack next to the Scheme.
}, {
  event: "CLEANUP",
  match: () => gameState.scheme.attached("ADAMASIDE").size > 0,
  before: ev => gameState.scheme.attached("ADAMASIDE").each(c => {
    attachCardEv(ev, c, gameState.scheme, "CORRUPTION");
    cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached("CORRUPTION").size));
  }),
}, () => {
  gameState.scheme.attachedDeck("ADAMASIDE");
  const adam = gameState.scheme.attachedDeck("ADAM");
  gameState.herodeck.limit(c => c.heroName === "Adam Warlock").sort((a, b) => b.cost - a.cost).each(c => moveCard(c, adam));
  setSchemeTarget(8);
  gameState.specialActions = ev => gameState.scheme.attached("ADAMASIDE").map(c => {
    return new Ev(ev, 'EFFECT', { what: c, cost: { attack: c.cost * 2 }, func: ev => {
      choosePlayerEv(ev, p => gainEv(ev, c, p));
      rescueEv(ev, 1);
      selectCardOptEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c));
    }});
  });
}),
// SETUP: 9 Twists. Exactly one Hero must be a Nova Hero. 1 player: 5 Heroes. Each player's starting deck adds 2 Wounds, 1 S.H.I.E.L.D. Officer, and a Nova card that costs 2.
// RULE: All S.H.I.E.L.D. Officers and a Nova Heroes count as "Nova Centurions."
// EVILWINS: When there are 5 KO'd Nova Centurions per player.
makeSchemeCard("Destroy the Nova Corps", { twists: 9, heroes: [ 5, 5, 5, 5, 6 ], required: { heroes: "Nova|Nova@Into the Cosmos" } }, ev => {
  if (ev.nr <= 5) {
    // Twist 1-5 Each player must reveal their hand and discard a Nova Centurion. Each player that discarded this way gains a Shard. Each player that didn't discard this way must KO a card from the S.H.I.E.L.D. Officer Stack.
    eachPlayer(p => selectCardOrEv(ev, "Choose a Centurion to discard",
      p.hand.limit(c => isShieldOfficer(c) || c.heroName === "Nova"),
      c => {
        discardEv(ev, c);
        gainShardEv(ev, 1, p);
      }, () => {
        gameState.officer.withTop(c => KOEv(ev, c));
      }, p));
  } else if (ev.nr >= 6 && ev.nr <= 9) {
    // Twist 6-9 Each player must KO a Nova Centurion from the S.H.I.E.L.D. Officer Stack or from their hand or discard pile.
    eachPlayer(p => cont(ev, () => {
      const centurions = handOrDiscard(p).limit(c => isShieldOfficer(c) || c.heroName === "Nova");
      const cards = gameState.officer.top ? [ gameState.officer.top, ...centurions ] : centurions;
      selectCardEv(ev, "Choose a Centurion to KO", cards, c => KOEv(ev, c), p)
    }));
  }
}, koProgressTrigger(c => isShieldOfficer(c) || c.heroName === "Nova"), () => {
  setSchemeTarget(5, true);
  eachPlayer(p => {
    gameState.wounds.withTop(c => moveCard(c, p.deck));
    gameState.wounds.withTop(c => moveCard(c, p.deck));
    gameState.officer.withTop(c => moveCard(c, p.deck));
    gameState.herodeck.limit(c => c.heroName === "Nova" && c.cost === 2).withRandom(c => moveCard(c, p.deck));
    p.deck.shuffle();
  })
}),
// SETUP: 11 Twists. Add an extra Hero.
// RULE: Each "Phalanx-Infected" Villain has Attack equal to its cost, +1 Attack for each two Phalanx Conquests. If you fight one, choose a player to gain it as a Hero.
// EVILWINS: When there are 6 Phalanx-Infected in the city and/or Escape Pile, or the Villain Deck runs out.
makeSchemeCard("Annihilation: Conquest", { twists: 11, heroes: [ 4, 6, 6, 6, 7 ] }, ev => {
  // Twist: Put this Twist next to the Scheme as a "Phalanx Conquest." The highest-cost Hero from the HQ enters the city as a "Phalanx-Infected" Villain.
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  selectCardEv(ev, "Choose a Hero to become Phalanx-Infected", hqHeroes().highest(c => c.cost), c => {
    villainify("Phalanx-Infected", c1 => c1 === c, c => c.cost + Math.floor(gameState.scheme.attached('TWIST').size/2), "GAIN");
    enterCityEv(ev, c);
  });
}, [{
  event: "MOVECARD",
  match: ev => ev.to === gameState.escaped || ev.to.isCity || ev.from === gameState.escaped || ev.from.isCity,
  after: ev => schemeProgressEv(ev, [...cityVillains(), ...gameState.escaped.deck].count(isGroup("Phalanx-Infected"))),
}, runOutProgressTrigger("VILLAIN", false)], () => {
  setSchemeTarget(6);
}),
]);
addTemplates("SCHEMES", "Realm of Kings", [
// SETUP: 11 Twists. Set aside two extra Heroes to get married. Prepare each Wedding Hero into a seperate 14-card stack, ordered by cost with the lowest cost on top.
// EVILWINS: When either Wedding Hero Stack is KO'd.
makeSchemeCard("Ruin the Perfect Wedding", { twists: 11, heroes: [ 5, 7, 7, 7, 8 ] }, ev => {
  const isle = [gameState.scheme, gameState.mastermind, ...gameState.city];
  const groomIdx = () => isle.findIndex(d => d.attached('GROOM').size > 0) || 0;
  const brideIdx = () => isle.findIndex(d => d.attached('BRIDE').size > 0) || 0;
  const groom = () => isle[groomIdx()]?.attachedDeck('GROOM');
  const bride = () => isle[brideIdx()]?.attachedDeck('BRIDE');
  if (ev.nr == 1) {
    // Twist 1 Put one Wedding Hero Stack above the rightmost city space "at the altar." Gain its top card.
    groom().withTop(c => gainEv(ev, c));
    cont(ev, () => groom().each(c => attachCardEv(ev, c, isle[6], 'GROOM')));
  } else if (ev.nr == 2) {
    // Twist 2 Put the other Wedding Hero Stack above the Mastermind space "at the door." Gain its top card.
    bride().withTop(c => gainEv(ev, c));
    cont(ev, () => bride().each(c => attachCardEv(ev, c, isle[1], 'BRIDE')));
  } else if (ev.nr >= 3 && ev.nr <= 7) {
    // Twist 3-7 Gain the top card of either Wedding Hero Stack. Then KO two cards from the top of each Wedding Hero Stack that has a Villain or Mastermind in the space immediately below it. Then the leftmost Hero Stack "walks down the aisle," moving one space to the right.
    chooseOptionEv(ev, "Choose side", [{l:"Groom", v:groom}, {l:"Bride", v:bride}], d => d().withTop(c => gainEv(ev, c)));
    [bride(), bride(), groom(), groom()].each(d => d?.attachedTo instanceof Deck && d.attachedTo.has(isEnemy) &&
      cont(ev, () => d.withTop(c => KOEv(ev, c))));
    cont(ev, () => bride().each(c => attachCardEv(ev, c, isle[brideIdx() + 1], 'BRIDE')));
  } else if (ev.nr >= 8 && ev.nr <= 11) {
    // Twist 8-11 KO two cards from the top of each Wedding Hero Stack.
    [bride(), bride(), groom(), groom()].each(d => cont(ev, () => d?.withTop(c => KOEv(ev, c))));
  }
  cont(ev, () => schemeProgressEv(ev, 14 - Math.min(groom()?.size || 0, bride()?.size || 0)));
}, [], () => {
  const bride = gameState.scheme.attachedDeck('BRIDE');
  const groom = gameState.scheme.attachedDeck('GROOM');
  gameState.herodeck.limit(c => c.heroName === extraHeroName(1)).each(c => moveCard(c, bride));
  gameState.herodeck.limit(c => c.heroName === extraHeroName(2)).each(c => moveCard(c, groom));
  bride.deck.sort((a, b) => b.cost - a.cost);
  groom.deck.sort((a, b) => b.cost - a.cost);
  setSchemeTarget(14);
}),
// SETUP: 11 Twists.
//  <b>If you pay</b>: You gain the {THRONES FAVOR}. You may KO one of your cards.
//  <b>If you don't pay by the end of turn</b>: Right after you draw a new hand, stack a card from the S.H.I.E.L.D. Officer Stack next to the Scheme as a "Victorious General." The Mastermind gains the {THRONES FAVOR}. If they aleady have it, you gain a Wound.
// EVILWINS: When there are 6 Victorious Generals.
makeSchemeCard<{ toPay: number[] }>("War of Kings", { twists: 11 }, ev => {
  if (ev.nr <= 11) {
    // Twist 1-8 Stack this Twist next to the Scheme as a "Battlefront." This turn, you may pay 1 Recruit per Battlefront to supply the war.
    // Twist 9-11 Same effect, but with two Victorious Generals.
    attachCardEv(ev, ev.twist, gameState.scheme, "TWIST");
    ev.state.toPay.push(ev.nr <= 8 ? 1 : 2);
  }
}, {
  event: 'CLEANUP',
  after: ev => {
    const state:{ toPay: number[] } = gameState.schemeState;
    state.toPay.each(amount => cont(ev, () => {
      repeat(amount, () => gameState.officer.withTop(c => attachCardEv(ev, c, gameState.scheme, 'GENERAL')));
      withMastermind(ev, mastermind => thronesFavorGainOrEv(ev, () => gainWoundEv(ev), mastermind));
      cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('GENERAL').size));
    }));
    state.toPay = [];
  }
}, s => {
  setSchemeTarget(6);
  gameState.specialActions = ev => {
    const recruit = gameState.scheme.attached("TWIST").size;
    return s.toPay.length ? [new Ev(ev, 'EFFECT', { what: ev.source, cost: { recruit }, desc: `Supply the war (${recruit} recruit)`, func: ev => {
      thronesFavorGainEv(ev);
      selectCardOptEv(ev, "Choose a card to KO", revealable(), c => KOEv(ev, c));
      s.toPay.pop();
      textLog.log(`${playerState.name} supplied the war`);
    } })] : [];
  }
  s.toPay = [];
}),
// SETUP: 10 Twists. Each player puts a small object above the sewers to represent themself.
// RULE: You can't fight Villains outside the city space where you are.
// (You can still recruit from all HQ spaces and fight the Mastermind.)
// During your turn, you can spend 1 Attack any number of times to move yourself one space left or right.
makeSchemeCard<{ locations: Map<Player, Deck>, tornado: Card }>("Tornado of Terrigen Mists", { twists: 10 }, ev => {
  const tornadoAt = ev.state.tornado && ev.state.tornado.location.attachedTo instanceof Deck ? ev.state.tornado.location.attachedTo : undefined;
  if (ev.nr === 1) {
    // Twist 1 Put this Tornado Scheme card above the Sewers.
    gameState.outOfGame.addNewCard(gameState.scheme.top.instance);
    ev.state.tornado = gameState.outOfGame.deck.find(c => c.instance === gameState.scheme.top.instance);
    withCity('SEWERS', sewers => attachCardEv(ev, ev.state.tornado, sewers, 'TORNADO'));
  } else if (ev.nr >= 2 && ev.nr <= 5) {
    // Twist 2-5 Each player in the Tornado space gains a Wound.
    // Then move this Tornado card and each Villain simultaneously one space to the left. (A Villain on the Bridge escapes.)
    eachPlayer(p => ev.state.locations.get(p) === tornadoAt && gainWoundEv(ev, p));
    gameState.city.each(d => d.limit(isVillain).each(c => {
      cont(ev, () => d.adjacentLeft ? moveCardEv(ev, c, d.adjacentLeft) : villainEscapeEv(ev, c));
    }));
    tornadoAt.adjacentLeft && attachCardEv(ev, ev.state.tornado, tornadoAt.adjacentLeft, 'TORNADO');
  } else if (ev.nr >= 6 && ev.nr <= 9) {
    // Twist 6-9 Same effect, but move them all to the right, if possible. (A Villain in the Sewers doesn't move.)
    eachPlayer(p => ev.state.locations.get(p) === tornadoAt && gainWoundEv(ev, p));
    let i = gameState.city.size - 1;
    while (i >= 0 && !isCityEmpty(gameState.city[i])) i--;
    [...Array(i).keys()].reverse().forEach(j => {
      cont(ev, () => gameState.city[j].limit(isVillain).each(c => moveCardEv(ev, c, gameState.city[j+1])));
    });
    tornadoAt.adjacentRight && attachCardEv(ev, ev.state.tornado, tornadoAt.adjacentRight, 'TORNADO');
  }
  // Twist 10 Evil Wins!
  schemeProgressEv(ev, ev.nr);
}, [], s => {
  const sewers = gameState.city.find(d => d.id === 'SEWERS');
  s.locations = new Map(gameState.players.map(p => [p, sewers]));
  forbidAction('FIGHT', c => isVillain(c) && c.location.isCity && s.locations.get(playerState) !== c.location, true);
  gameState.specialActions = (ev) => {
    return cityAdjacent(s.locations.get(playerState)).map(d => new Ev(ev, 'EFFECT', {
      desc: `Move to ${d.id.toLowerCase()}`,
      cost: { attack: 1 },
      func: ev => s.locations.set(playerState, d),
    }));
  }
  setSchemeTarget(10);
}),
// SETUP: Add Twists equal to the number of players plus 3. Add an extra Henchman Group of 10 cards as "Xerogen Experiments."
// RULE: All Xerogen Experiments also have {ABOMINATION}.
// EVILWINS: When there are 3 Villains per player in the Escape Pile or the Villain Deck runs out.
makeSchemeCard("Devolve with Xerogen Crystals", { twists: [4, 5, 6, 7, 8], vd_henchmen: [2, 2, 2, 3, 3] }, ev => {
  // Twist: Choose a Hero in the HQ that doesn't have a printed Attack of 2 or more.
  // Put it on the bottom of the Hero Deck. Then play two cards from the Villain Deck.
  selectCardEv(ev, "Choose a card to put on Hero Deck bottom", hqHeroes().limit(c => !(c.printedAttack >= 2)), c => moveCardEv(ev, c, gameState.herodeck, true));
  villainDrawEv(ev);
  villainDrawEv(ev);
}, [
  escapeProgressTrigger(isVillain),
  runOutProgressTrigger('VILLAIN', false),
], () => {
  setSchemeTarget(3, true);
  addStatMod('defense', c => c.cardName === extraHenchmenName(), abominationAmount);
}),
]);
addTemplates("SCHEMES", "Annihilation", [
// SETUP: 9 Twists.
// <b>Twist 1,3,5,7</b>: "Negative Pulse": This turn, Heroes in the HQ cost -1 Recruit and Villains and Masterminds get -1 Attack.
// <b>Twist 2,4,6,8</b>: "Positive Pulse": This turn, Heroes in the HQ cost +1 Recruit and Villains and Masterminds get +1 Attack.
makeSchemeCard<{ pulse: number }>("Pulse Waves From the Negative Zone", { twists: 9 }, ev => {
  if (ev.nr < 9) {
    // Twist: If the Twist number is odd, "Negative Pulse." If the Twist number is even, "Positive Pulse."
    gameState.schemeState.pulse = ev.nr % 2 === 1 ? -1 : 1;
  }
  // Twist 9 Evil wins!
  schemeProgressEv(ev, ev.nr);
}, [{
  event: 'CLEANUP',
  after: () => gameState.schemeState.pulse = 0,
}], s => {
  s.pulse = 0;
  addStatMod('cost', c => isHero(c) && c.location.isHQ, () => s.pulse);
  addStatMod('defense', isEnemy, () => s.pulse);
  setSchemeTarget(9);
}),
// SETUP: 6 Twists. Each player chooses a Hero to be part of the Hero Deck. Randomly select other Heroes up to the normal number of Heroes.
// Each player adds to their starting deck three non-rare cards with different names from the Hero they chose and three Wounds.
makeSchemeCard("Sneak Attack the Heroes' Homes", { twists: 6 }, ev => {
  if (ev.nr <= 5) {
    // Twist 1-5 Each player discards a non-grey Hero or gains a Wound.
    eachPlayer(p => selectCardOrEv(ev, "Choose a non-grey Hero to discard", p.hand.limit(isNonGrayHero), c => discardEv(ev, c), () => gainWoundEv(ev, p)));
  } 
  // Twist 6 Evil Wins
  schemeProgressEv(ev, ev.nr);
}, [], () => {
  eachPlayer(p => {
    repeat(3, () => gameState.wounds.withTop(c => moveCard(c, p.deck)));
    const chosenHeroCards = gameState.herodeck.limit(isSetupGroup('heroes', p.nr));
    const cardNameCounts = new Map<string, number>();
    chosenHeroCards.each(c => cardNameCounts.set(c.cardName, (cardNameCounts.get(c.cardName) || 0) + 1));
    const namesByRarity = [...cardNameCounts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name);
    const threeNonRare = namesByRarity.slice(0, -1).shuffled().slice(0, 3) // Remove rarest and take 3 at random
    threeNonRare.each(name => gameState.herodeck.limit(c => c.cardName === name).withFirst(c => moveCard(c, p.deck)));
    p.deck.shuffle();
  });
  gameState.herodeck.shuffle();
  setSchemeTarget(6);
}),
// SETUP: 11 Twists. Stack 11 Bystanders next to the Scheme face down as "Galactus Jurors."
// RULE: Each Twist gives you a challenge to achieve this turn. If you do it, you have convinced a Juror, and you rescue them. If you don't,
// put that Juror face up next to the Villain Deck, voting to condmen Humanity.
// <b>Twist 3,5,7</b>: "Question Witnesses": Recruit a Hero that costs 5 or more.
// <b>Twist 4,6,8</b>: "Introduce Evidence": Defeat Villain(s) worth 3VP or more.
// EVILWINS: When 6 Jurors vote to Condmen Humanity.
makeSchemeCard<{ condemnations: number }>("Put Humanity on Trial", { twists: 11 }, ev => {
  let done = false;
  const convinceJuror = () => {
    done = true;
    gameState.scheme.attachedDeck('JUROR').withTop(juror => {
      rescueEv(ev, juror);
      textLog.log(`You convinced the juror!`);
    });
  }
  if (ev.nr <= 2) {
    // Twist 1-2 "Opening Arguments": Discard three cards with different names.
    addTurnAction(new Ev(ev, 'EFFECT', {
      desc: "Discard three cards with different names",
      cost: { cond: () => playerState.hand.deck.uniqueCount(c => c.cardName) >= 3 && !done },
      func: ev => {
        const names = new Set<string>();
        repeat(3, () => cont(ev, () => selectCardEv(ev, "Choose a card to discard", playerState.hand.limit(c => !names.has(c.cardName)), c => {
          names.add(c.cardName);
          discardEv(ev, c);
        })));
        convinceJuror();
      }
    }));
  } else if (ev.nr === 3 || ev.nr === 5 || ev.nr === 7) {
    // Twist 3,5,7 "Question Witnesses": Recruit a Hero that costs 5 or more.
    addTurnTrigger('RECRUIT', ev => isHero(ev.what) && ev.what.cost >= 5, () => convinceJuror());
  } else if (ev.nr === 4 || ev.nr === 6 || ev.nr === 8) {
    // Twist 4,6,8 "Introduce Evidence": Defeat Villain(s) worth 3VP or more.
    let vp = 0;
    addTurnTrigger('DEFEAT', ev => isVillain(ev.what), ev => {
      vp += ev.parent.what.vp;
      if (vp >= 3) convinceJuror();
    });
  } else if (ev.nr >= 9 && ev.nr <= 11) {
    // Twist 9-11 "Closing Arguments": Defeat the Mastermind.
    addTurnTrigger('DEFEAT', ev => isMastermind(ev.what), () => convinceJuror());
  }
  addTurnTrigger('CLEANUP', () => true, ev => {
    gameState.scheme.attachedDeck('JUROR').withTop(juror => {
      if (!done) {
        KOEv(ev, juror);
        schemeProgressEv(ev, ++gameState.schemeState.condemnations);
        textLog.log(`Humanity is condemned!`);
      }
    });
  });
}, [], s => {
  setSchemeTarget(6);
  const jurors = gameState.scheme.attachedFaceDownDeck('JUROR');
  repeat(11, () => gameState.bystanders.withTop(c => moveCard(c, jurors)));
  s.condemnations = 0;
}),
// SETUP: 6 Twists. Add 4 extra Bystanders to the Villain Deck. Deal the shuffled Villain Deck into several "Dimension" decks where the first
// Dimension has 1 card, the next has 2 cards, then 3, 4, etc. <i>(The final Dimension might not have enough cards to reach its full number.)</i>
// RULE: Each turn, you choose which Dimension you play a card from. All players have "<b>Focus 1 Recruit</b>-&gt; Reveal the top card of any
// Dimension and put it back on the top or bottom of that deck." If a Dimension ever has no cards left, even in the middle of a card ability,
// it is destroyed. Mark it with a face up Wound.
// EVILWINS: When at least half of the original Dimensions are destroyed.
makeSchemeCard<{dimensions: Deck[], current: Deck, destroyed: string[]}>("Breach Parallel Dimensions", { twists: 6, vd_bystanders: [ 5, 8, 12, 12, 16] }, ev => {
  // Twist: Choose a Dimension and play two cards from it. <i>(It's ok if it only has 1.)</i>
  const state = ev.state;
  swapDecks(gameState.villaindeck, state.current);
  selectCardEv(ev, "Choose a Dimension", state.dimensions.limit(d => !state.destroyed.includes(d.id)), d => {
    swapDecks(d, gameState.villaindeck);
    state.current = d;
  });
  playAnotherEv(ev, 2);
}, [{
  event: 'TURNSTART',
  after: ev => {
    const state: {dimensions: Deck[], current: Deck, destroyed: string[]} = gameState.schemeState;
    swapDecks(state.current, gameState.villaindeck);
    selectCardEv(ev, "Choose a Dimension", state.dimensions.limit(d => !state.destroyed.includes(d.id)), d => {
      swapDecks(d, gameState.villaindeck);
      state.current = d;
    });
  }
}, {
  event: 'MOVECARD',
  match: (ev, source) => ev.from === gameState.villaindeck,
  after: ev => {
    if (gameState.villaindeck.size === 0) {
      const state: {dimensions: Deck[], current: Deck, destroyed: string[]} = gameState.schemeState;
      state.destroyed.push(state.current.id);
      gameState.wounds.withTop(c => attachCardEv(ev, c, state.current, 'DESTROYED'));
      selectCardEv(ev, "Current dimension was destroyed, choose another", state.dimensions.limit(d => !state.destroyed.includes(d.id)), d => {
        swapDecks(d, gameState.villaindeck);
        state.current = d;
      });
    }
  }
}], s => {
  gameState.specialActions = ev => {
    return [focusActionEv(ev, { recruit: 1 }, () => {
      const state: {dimensions: Deck[], current: Deck, destroyed: string[]} = gameState.schemeState;
      selectCardEv(ev, "Choose a Dimension", state.dimensions.limit(d => !state.destroyed.includes(d.id)).map(d => d === s.current ? gameState.villaindeck : d), d => {
        revealDeckEv(ev, d, 1, cards => selectCardEv(ev, "Choose a card to put on the bottom", cards, c => moveCardEv(ev, c, d, true)));
      });
    })];
  };
  const dimensions: Deck[] = [new Deck("DIMENSION_0")];
  dimensions[0].cityPosition = [0, -1];
  [...gameState.villaindeck.deck].forEach(c => {
    let last = dimensions[dimensions.length - 1];
    if (last.size === dimensions.length) {
      last = new Deck(`DIMENSION_${dimensions.length}`)
      last.cityPosition = [dimensions.length, -1];
      dimensions.push(last);
    }
    moveCard(c, last);
  });
  setSchemeTarget(dimensions.length);
  s.dimensions = dimensions;
  dimensions[0].each(c => moveCard(c, gameState.villaindeck));
  s.current = dimensions[0];
  s.destroyed = [];
}),
]);
addTemplates("SCHEMES", "Messiah Complex", [
// Veiled Scheme
// SETUP: 10 Twists
makeSchemeCard("Hack Cerebro Servers to...", { twists: 10 }, ev => {
  if (ev.nr <= 5) {
    // Twist 1-5 Put a card from the Bystander Stack next to this Scheme as a “Hacker.” KO a Hero from the HQ with cost equal to the number of Hackers.
    // If you KO'd a Hero this way, stack this Twist next to the Mastermind as “Stolen Cerebro Data.”
    gameState.bystanders.withTop(c => attachCardEv(ev, c, gameState.scheme, 'HACKER'));
    cont(ev, () => selectCardEv(ev, "Select a Hero to KO", hqHeroes().limit(c => c.cost === gameState.scheme.attached('HACKER').size), c => {
      KOEv(ev, c);
      attachCardEv(ev, ev.twist, gameState.mastermind, 'TWIST');
    }));
  } else if (ev.nr === 6) {
    // Twist 6 Put the Hackers on the bottom of the Bystander Stack. This Scheme {TRANSFORM} into a random Unveiled Scheme. Do its Twist effect.
    gameState.scheme.attachedDeck('HACKER').each(c => moveCardEv(ev, c, gameState.bystanders, true));
  }
  vailedSchemeProgressEv(ev);
}, [], () => {
  setSchemeTarget(6);
}),
// Veiled Scheme
// SETUP: 11 Twists
// RULE: Players may spend 3 Recruit or 3 Attack to gain a Kidnapped Mutant.
makeSchemeCard("Drain Mutants' Powers to...", { twists: 11 }, ev => {
  const kidnappedMutants = gameState.scheme.attachedFaceDownDeck('KIDNAPPED');
  if (ev.nr <= 6) {
    if (gameState.scheme.attachedFaceDownDeck('KIDNAPPED').size > 0) {
      kidnappedMutants.each(c => moveCardEv(ev, c, gameState.sidekick, true));
      attachCardEv(ev, ev.twist, gameState.mastermind, 'TWIST');
    }
    // Twist 1-6  Stack the top two cards of the Sidekick Stack face down next to the Scheme as “Kidnapped Mutants.”
    repeat(2, () => cont(ev, () => gameState.sidekick.withTop(c => attachFaceDownCardEv(ev, c, gameState.scheme, 'KIDNAPPED'))));
    // If there were any Kidnapped Mutants already there, put those on the bottom of the Sidekick Stack and put this Twist next to the Mastermind
    // as a “Drained Power.”
  } else if (ev.nr === 7) {
    // Twist 7 KO all Kidnapped Mutants. This Scheme {TRANSFORM} into a random Unveiled Scheme. Do its Twist effect.
    kidnappedMutants.each(c => KOEv(ev, c));
  }
  vailedSchemeProgressEv(ev);
}, [], () => {
  gameState.specialActions = ev => gameState.scheme.attachedFaceDownDeck('KIDNAPPED').deck.map(c =>
    [new Ev(ev, 'EFFECT', { desc: "Pay 3 recruit", cost: { recruit: 3 }, what: c, func: ev => gainEv(ev, c) }),
     new Ev(ev, 'EFFECT', { desc: "Pay 3 attack", cost: { attack: 3 }, what: c, func: ev => gainEv(ev, c) })]
  ).merge();
  setSchemeTarget(7);
}),
// Veiled Scheme
// SETUP: 9 Twists
makeSchemeCard("Hire Singularity Investigations to...", { twists: 9 }, ev => {
  if (ev.nr <= 4) {
    // Twist 1-4 If there are any “Singularity Investigators” in the city, stack this Twist next to the Mastermind as a “Dark Discovery.”
    cityVillains().has(c => c.cardName === "Singularity Investigator") && attachCardEv(ev, ev.twist, gameState.mastermind, 'TWIST');
    // Whether you did that or not, {INVESTIGATE} the Bystander Stack for a card and have it enter the city as a “Singularity Investigator” Villain.
    // It has 6 Attack and “<b>Fight</b>: Rescue this as a Bystander. Then KO one of your Heroes.
    // Then {INVESTIGATE} your deck for a card with a Recruit icon.”
    investigateEv(ev, u, gameState.bystanders, c => {
      villainify("Singularity Investigator", c1 => c1 === c, 6, ev => {
        rescueEv(ev, ev.source);
        selectCardAndKOEv(ev, yourHeroes());
        investigateEv(ev, hasRecruitIcon);
      });
      enterCityEv(ev, c);
    });
  } else if (ev.nr === 5) {
    // Twist 5 This Scheme {TRANSFORM} into a random Unveiled Scheme. Do its Twist effect.
  }
  vailedSchemeProgressEv(ev);
}, [], () => {
  setSchemeTarget(5);
}),
// Veiled Scheme
// SETUP: 8 Twists
makeSchemeCard("Raid Gene Banks to...", { twists: 8 }, ev => {
  if (ev.nr <= 3) {
    // Twist 1-3  If there is a Villain in the Bank, stack this Twist next to the Mastermind as a “Mutant Genome.”
    villainIn('BANK').each(c => attachCardEv(ev, ev.twist, gameState.mastermind, 'TWIST'));
    // Otherwise, move a Villain from another city space to the Bank.
    withCity('BANK', bank => {
      bank.size == 0 && selectCardEv(ev, "Choose a Villain to move to the Bank", cityVillains(), c => {
        moveCardEv(ev, c, bank);
      });
    });
  } else if (ev.nr === 4) {
    // Twist 4 This Scheme {TRANSFORM} into a random Unveiled Scheme. Do its Twist effect.
  }
  vailedSchemeProgressEv(ev);
}, [], () => {
  setSchemeTarget(4);
}),
]);
const unvailedSchemeTemplates: Card[] = [
// Unveiled Scheme
// <b>When revealed</b>: Twists stacked next to the Mastermind are “Manipulations.” Shuffle a random extra Hero into a face down “Mutant Messiah” stack.
// EVILWINS: When there are 3 cards in the Fallen Messiah stack or the Villain Deck runs out.
makeSchemeCard("...Control the Mutant Messiah", { }, ev => {
  // Twist: Add this Twist to the Manipulations. {INVESTIGATE} the Mutant Messiah stack for a card and set it aside.
  // This turn you may gain that card to the top of your deck by spending Recruit equal to its cost, +1 Recruit for each Manipulation.
  // If you don’t, then put that card into a “Fallen Messiah” stack next to the Scheme.
  attachCardEv(ev, ev.twist, gameState.mastermind, 'TWIST');
  investigateEv(ev, u, gameState.scheme.attachedDeck('MUTANTMESSIAH'), c => {
    attachCardEv(ev, c, gameState.scheme, 'ASIDE');
    addTurnTrigger('CLEANUP', u, ev => {
      if (c.location === gameState.scheme.attachedDeck('ASIDE')) {
        moveCardEv(ev, c, gameState.scheme.attachedDeck('FALLEN'));
        cont(ev, () => schemeProgressEv(ev, gameState.scheme.attachedDeck('FALLEN').size));
      }
    });
  });
}, [], () => {
  gameState.specialActions = ev => gameState.scheme.attachedDeck('ASIDE').deck.map(c => new Ev(ev, 'EFFECT', {
    what: c,
    cost: { recruit: c.cost + gameState.scheme.attached('TWIST').size },
    func: ev => gainToDeckEv(ev, c),
  }));
  availiableHeroTemplates().withRandom(heroTemplate => {
    const mutantMessiah = gameState.scheme.attachedFaceDownDeck('MUTANTMESSIAH');
    heroToCardTamplates(heroTemplate).each(([c, n]) => mutantMessiah.addNewCard(c, n));
    mutantMessiah.shuffle();
  });
  setSchemeTarget(3);
}),
// Unveiled Scheme
// <b>When revealed</b>: Shuffle a random additional Villain Group into the Villain Deck. Twists stacked next to the Mastermind are “Temporal Rifts.”
// EVILWINS: When there are 7 Temporal Rifts or the Villain Deck runs out.
makeSchemeCard("...Open Rifts to Future Timelines", { }, ev => {
  // Twist: Add this Twist to the Temporal Rifts. Then reveal and set aside cards from the Villain Deck equal to the number of Temporal Rifts.
  attachCardEv(ev, ev.twist, gameState.mastermind, 'TWIST');
  cont(ev, () => {
    revealVillainDeckEv(ev, gameState.mastermind.attached('TWIST').size, (cards) => {
      // Play a Henchman you revealed, then play the Villain you revealed that is worth the most VP.
      selectCardEv(ev, "Choose a Henchman to play", cards.limit(isHenchman), c => villainDrawEv(ev, c));
      cont(ev, () => selectCardEv(ev, "Choose a Villain to play", cards.limit(isVillain).highest(c => c.vp), c => villainDrawEv(ev, c)));
      // Shuffle the other set aside cards into the Villain Deck. (If the Villain Deck runs out during this, this doesn't end the game.)
    }, true);
  });
  cont(ev, () => gameState.villaindeck.shuffle());
  cont(ev, () => schemeProgressEv(ev, gameState.mastermind.attachedDeck('TWIST').size));
}, [
  runOutProgressTrigger('VILLAIN', false),
], () => {
  setSchemeTarget(7);
  availiableVillainTemplates().withRandom(({cards}) => {
    cards.each(([n, c]) => gameState.villaindeck.addNewCard(c, n));
    gameState.villaindeck.shuffle();
  });
}),
// Unveiled Scheme
// <b>When revealed</b>: Twists stacked next to the Mastermind are “Cloning Breakthroughs.”
// RULE: Each Evil Clone has Attack equal to its cost plus the number of Cloning Breakthroughs.
// It has “<b>Fight</b>: A player gains this as a Hero. KO one of your Heroes.”
// EVILWINS: When there are 7 Evil Clones in the city and/or Escape Pile, or the Villain Deck or Hero Deck runs out.
makeSchemeCard("...Reveal the Heroes' Evil Clones", { }, ev => {
  // Twist: Add this Twist to the Cloning Breakthroughs.
  attachCardEv(ev, ev.twist, gameState.mastermind, 'TWIST');
  // The top card of the Hero Deck enters the city as an “Evil Clone” Villain.
  gameState.herodeck.withTop(c => {
    const clones = [gameState.herodeck.limit(c2 => c2.cardName === c.cardName && c2 !== c).firstOnly(), [c]].merge();
    cont(ev, () => gameState.herodeck.shuffle());
    clones.each(c => cont(ev, () => {
      villainify("Evil Clone", c1 => c1 === c, c => c.cost + gameState.mastermind.attached('TWIST').size, ev => {
        gainEv(ev, ev.source);
        selectCardAndKOEv(ev, yourHeroes());
      });
      enterCityEv(ev, c);
    }));
  });
  // {CLONE} a copy of it from the Hero Deck as another Evil Clone.
}, [
  escapeOrCityProgressTrigger(c => c.villainGroup === "Evil Clone"),
  runOutProgressTrigger('VILLAIN', false),
  runOutProgressTrigger('HERO', false),
], () => {
  setSchemeTarget(7);
}),
// Unveiled Scheme
// <b>When revealed</b>:  Twists stacked next to the Mastermind are “Bioweapon Adaptations.”
// EVILWINS: When there are 15 non-grey Heroes in the KO pile or the Villain Deck or Hero Deck runs out.
makeSchemeCard("...Unleash an Anti-Mutant Bioweapon", { }, ev => {
  cont(ev, () => schemeProgressEv(ev, gameState.ko.count(isNonGrayHero)));
  // Twist: Add this Twist to the Bioweapon Adaptations.
  attachCardEv(ev, ev.twist, gameState.mastermind, 'TWIST');
  // Then for each card in that stack, choose a different number from 2-6. KO all Heroes from the HQ that have any of those costs.
  cont(ev, () => {
    const options = [2, 3, 4, 5, 6];
    const selected: number[] = [];
    gameState.mastermind.attachedDeck('TWIST').each(() => cont(ev, () => {
      options.length > 0 && chooseOptionEv(ev, "Choose a cost", options.filter(v => !selected.includes(v)).map(v => ({l:v.toString(), v})), v => selected.push(v));
    }));
    cont(ev, () => hqHeroes().each(c => selected.includes(c.cost) && KOEv(ev, c)));
  });
}, [
  koProgressTrigger(isNonGrayHero),
  runOutProgressTrigger('VILLAIN', false),
  runOutProgressTrigger('HERO', false),
], () => {
  setSchemeTarget(15);
}),
];
unvailedSchemeTemplates.forEach(c => c.set = "Messiah Complex");
addTemplates("SCHEMES", "Doctor Strange and the Shadows of Nightmare", [
// SETUP: 8 Twists.
// EVILWINS: When the number of Tormented Souls is four times the number of players.
makeSchemeCard("Claim Souls for Demons", { twists: 8 }, ev => {
  const sourceDeck = ev.nr <= 3 ? gameState.bystanders : gameState.officer;
  const nr = ev.nr;
  // Twist 1-3 Each player makes a {DEMONIC BARGAIN} to rescue a Bystander. If that Bargain wounds that player, stack that Bystander next to the Scheme as a “Tormented Soul” instead.
  // Twist 4-8 Each player makes a {DEMONIC BARGAIN} to gain a S.H.I.E.L.D. Officer. If that Bargain wounds that player, stack that Officer next to the Scheme as a “Tormented Soul” instead.
  ev.nr <= 8 && eachPlayerEv(ev, ({who:p}) => sourceDeck.withTop(c => {
    demonicBargain(ev, [() => nr <= 3 ? rescueByEv(ev, p, c) : gainEv(ev, c, p), () => attachCardEv(ev, c, gameState.scheme, 'SOUL')], p);
  }));
  cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('SOUL').size));
}, [], s => {
  setSchemeTarget(4, true);
}),
// SETUP: 7 Twists. Add an extra Villain Group.
// EVILWINS: When there are 3 Villains per player in the Escape Pile or the Villain Deck runs out.
makeSchemeCard("War for the Dream Dimension", { twists: 7, vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist: Reveal the top two cards of the Villain Deck. The Villain you revealed with the highest printed Attack enters the <b>Astral Plane</b>.
  // (It does not do any Ambush abilities.) If you revealed a second Villain this way, that Villain enters the city. Put the rest of the revealed
  // cards back in any order.
  revealVillainDeckEv(ev, 2, cards => {
    const highestAttack = cards.limit(isVillain).highest(c => c.printedAttack);
    let selected: Card | undefined = undefined;
    selectCardEv(ev, "Choose a Villain to enter the Astral Plane", highestAttack, c => {
      selected = c;
      enterAstralPlaneEv(ev, c);
    });
    cont(ev, () => cards.limit(isVillain).limit(c => c !== selected).each(c => enterCityEv(ev, c)));
  });
}, [
  escapeProgressTrigger(isVillain),
  runOutProgressTrigger('VILLAIN', false),
], s => {
  setSchemeTarget(3, true);
}),
// SETUP: 11 Twists, representing Cursed Pages of the Darkhold Tome. Add an extra Villain Group.
// RULE: Cursed Pages are Ritual Artifacts with “If you fought a Villain or Mastermind: You may discard this to get +3 Recruit.”
// EVILWINS: When the Mastermind has 7 Cursed Pages at the end of any player’s turn or the Villain Deck runs out.
makeSchemeCard("Cursed Pages of the Darkhold Tome", { twists: 11, vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist:  Put this Cursed Page next to the Mastermind, plus a Cursed Page from any player’s control or discard pile or the KO pile.
  // For this turn only, the first time you fight a Villain or Mastermind, put one of the Mastermind’s Cursed Pages into your discard pile.
  attachCardEv(ev, ev.twist, gameState.mastermind, 'CURSED_PAGE');
  cont(ev, () => {
    const allCards = [...gameState.players.map(p => p.artifact), ...gameState.players.map(p => p.discard), gameState.ko].flatMap(d => d.limit(isTwist));
    selectCardOptEv(ev, "Choose a Cursed Page to attach", allCards, c => attachCardEv(ev, c, gameState.mastermind, 'CURSED_PAGE'));
  });
  let done = false;
  addTurnTrigger('FIGHT', ev => isEnemy(ev.what), ev => {
    done || gameState.mastermind.attached('CURSED_PAGE').withFirst(c => moveCardEv(ev, c, playerState.discard));
    done = true;
  });
}, [
  { event: "CLEANUP", after: ev => schemeProgressEv(ev, gameState.mastermind.attached('CURSED_PAGE').size) },
  runOutProgressTrigger('VILLAIN', false),
], s => {
  setSchemeTarget(7);
  addStatSet('isArtifact', isTwist, () => true);
  addStatSet('effects', isTwist, () => [ playArtifact ]);
  addStatSet('cardActions', isTwist, () => [ useRitualArtifactAction(() => pastEvents('FIGHT').map(ev => ev.what).has(isEnemy)) ]);
  addStatSet('artifactEffects', isTwist, () => [ev => addRecruitEvent(ev, 3)]);
}),
// SETUP: 2 players: 9 Twists. 1 or 4 players: 10 Twists. 3 or 5 players: 11 Twists.
// EVILWINS: When the Mastermind has won 5 Duels.
makeSchemeCard("Duels of Science and Magic", { twists: [ 9, 10, 11, 10, 11] }, ev => {
  let failed = 0;
  if (ev.nr === 1 || ev.nr === 3 || ev.nr === 5) {
    // Twist 1, 3, and 5 “Duel of Science”: Each player reveals a [Tech] or [Ranged] Hero or discards down to 4 cards.
    // If at least half the players (round up) failed to reveal, put this Twist next to the Mastermind as a “Duel Won.”
    eachPlayer(p => revealOrEv(ev, c => c.color === Color.TECH || c.color === Color.RANGED, () => (failed++, pickDiscardEv(ev, -4, p)), p));
  } else if (ev.nr === 2 || ev.nr === 4 || ev.nr === 6) {
    // Twist 2, 4, and 6 “Duel of Magic”: Same effect, but with [Instinct] or [Covert].
    eachPlayer(p => revealOrEv(ev, c => c.color === Color.INSTINCT || c.color === Color.COVERT, () => (failed++, pickDiscardEv(ev, -4, p)), p));
  } else if (ev.nr >= 7 && ev.nr <= 11) {
    // Twist 7-11 “Duel of Science and Magic”: Same effect, but each player must reveal at least three of these colors: [Instinct], [Covert], [Tech], [Ranged].
    const colors = [Color.INSTINCT, Color.COVERT, Color.TECH, Color.RANGED];
    eachPlayer(p => {
      const pass = colors.count(color => yourHeroes(p).has(isColor(color))) >= 3;
      pass || (failed++, pickDiscardEv(ev, -4, p));
    })
  }
  cont(ev, () => failed >= gameState.players.length / 2 && attachCardEv(ev, ev.twist, gameState.mastermind, 'DUEL_WON'));
  cont(ev, () => schemeProgressEv(ev, gameState.mastermind.attached('DUEL_WON').size));
}, [], s => {
  setSchemeTarget(5);
}),
]);
addTemplates("SCHEMES", "Marvel Studios' Guardians of the Galaxy", [
// SETUP: 8 Twists. Add an extra Villain Group.
// RULE: Heroes that start in or enter the HQ are "Imprisoned" face down, can't be recruited, and cost 0. You can spend 1Attack each to flip them face up.
makeSchemeCard("Inescapable \"Kyln\" Space Prison", { twists: 8, vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist: Spend this amount this turn "for the escape plan" or else after you draw your new hand, gain a Wound then Imprison and mix up all Heroes in the HQ.
  // <b>Twist 1-3: 3</b> Attack (Quarnyx Battery)
  // <b>Twist 4-5: 5</b> Attack (Prison Control Device)
  // <b>Twist 6: 6</b> Recruit (That Guy's Leg)
  // <b>Twist 7: 7</b> Attack (Cassette Player)
  // Twist 8 Evil wins!
  if (ev.nr <= 7) {
    const cost: ActionCost = ev.nr <= 3 ? { attack: 3 } : ev.nr <= 5 ? { attack: 5 } : ev.nr <= 6 ? { recruit: 6 } : { attack: 7 };
    const desc = ev.nr <= 3 ? "Quarnyx Battery" : ev.nr <= 5 ? "Prison Control Device" : ev.nr <= 6 ? "That Guy's Leg" : "Cassette Player";
    let done = false;
    cost.cond = () => !done;
    addTurnAction(new Ev(ev, 'EFFECT', {
      desc: `Advance Escape Plan: ${desc}`,
      cost,
      func: ev => done = true,
    }));
    addTurnTrigger('CLEANUP', () => true, ev => {
      if (!done) {
        textLog.log(`You gain a Wound for failing to advance the Escape Plan!`);
        gainWoundEv(ev, playerState);
        gameState.hq.each(c => c.faceup = false);
        // TODO shuffle the Heroes in the HQ
      }
    });
  }
  schemeProgressEv(ev, ev.nr);
}, [{
  event: 'MOVECARD',
  match: ev => isHero(ev.what) && ev.to.isHQ && !ev.from.isHQ,
  before: ev => {
    ev.parent.to.faceup = false;
  },
}], () => {
  setSchemeTarget(8);
  forbidAction('RECRUIT', c => c.location.isHQ && !c.location.faceup, true);
  gameState.specialActions = ev => gameState.hq.map(d => new Ev(ev, 'EFFECT', {
    cost: { attack: 1, cond: () => !d.faceup },
    what: d.top,
    func: ev => { d.faceup = true; }
  }));
  addStatSet('cost', c => c.location.isHQ && !c.location.faceup, () => 0);
  gameState.hq.each(c => c.faceup = false);
}),
// SETUP: 11 Twists. Add an extra Villain Group.
// EVILWINS: When 3 Omnicraft escape.
makeSchemeCard("Provoke the Sovereign War Fleet", { twists: 11, vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist: This Twist enters the city as a 2 Attack "Sovereign Omnicraft" Villain worth 1VP with "<b>Fight</b>: You get +1 Recruit."
  villainify("Sovereign Omnicraft", c => c === ev.twist, 2, ev => addRecruitEvent(ev, 1));
  enterCityEv(ev, ev.twist);
  // Each player shuffles all Twists from their Victory Piles back into the Villain Deck. Play another card from the Villain Deck.
  gameState.players.flatMap(p => p.victory.limit(isTwist)).each(c => shuffleIntoEv(ev, c, gameState.villaindeck));
  villainDrawEv(ev);
}, [
  escapeProgressTrigger(c => c.villainGroup === "Sovereign Omnicraft"),
], () => {
  setSchemeTarget(3);
}),
// SETUP: 7 Twists. Use 7 Heroes including at least one Guardians of the Galaxy Hero. Use double the normal number of Villain and Henchman Groups,
// but use only half the cards from each of those groups, randomly & secretly. <i>(1 player: 2 Henchmen per group)</i>
// EVILWINS: When there are 32 non-grey Heroes in the KO pile.
makeSchemeCard("Star-Lord's Awesome Mix Tape", (p, v) => p === 'twists' || p === 'heroes' ? 7 : p === 'vd_henchmen' || p === 'vd_villain' ? v * 2 : p === 'solo_henchmen' ? 4 : v, ev => {
  // Twist: KO all Heroes from HQ. Villains in the Sewers and Bridge swap spaces. Likewise Villains in the Bank and Streets.
  hqHeroes().each(c => KOEv(ev, c));
  withCity('SEWERS', sewers => withCity('BRIDGE', bridge => swapCardsEv(ev, sewers, bridge)));
  withCity('BANK', bank => withCity('STREETS', streets => swapCardsEv(ev, bank, streets)));
}, [
  koProgressTrigger(isNonGrayHero),
], () => {
  setSchemeTarget(32);
  [...gameState.villaindeck.attached('WHATIF_SOLO_HENCHMEN')].each(c => moveCard(c, gameState.villaindeck));
  const groups = gameState.villaindeck.limit(c => c.printedVillainGroup !== undefined).unique(c => c.printedVillainGroup)
  groups.each(g => {
    const cards = gameState.villaindeck.limit(isGroup(g));
    const half = cards.slice(0, cards.length/2);
    half.each(c => moveCard(c, gameState.outOfGame));
  });
  if (gameState.advancedSolo === 'WHATIF') {
    gameState.villaindeck.shuffle();
    for (let i = 0; i < 2; i++) {
      const c = gameState.villaindeck.deck.find(isHenchman);
      c && moveCard(c, gameState.villaindeck.attachedDeck('WHATIF_SOLO_HENCHMEN'));
    }
  }
  gameState.villaindeck.shuffle();
}),
// SETUP: 9 Twists.
// EVILWINS: When there are 5 Tentacles.
makeSchemeCard("Unleash the Abilisk Space Monster", { twists: 9 }, ev => {
  if (ev.nr <= 8) {
    // Twist 1-8 Put this Twist next the the Scheme as an "Abilisk Tentacle" Villain worth 4VP. It captures a non-grey Hero from your discard pile.
    // Its Attack is 3 + the cost of that Hero. It has "<b>Fight</b>: KO one of your grey Heroes." A player of your choice gains the captured Hero."
    villainify("Abilisk Tentacle", c => c === ev.twist, c => 3 + c.attached('TENTACLECAPTURE').sum(c => c.cost), ev => {
      selectCardEv(ev, "Choose a grey Hero to KO", yourHeroes().limit(Color.GRAY), c => KOEv(ev, c));
      ev.source.attached('TENTACLECAPTURE').each(c => choosePlayerEv(ev, p => {
        gainEv(ev, c, p);
      }));
    });
    addStatSet('vp', is(ev.twist), () => 4);
    attachCardEv(ev, ev.twist, gameState.scheme, 'TENTACLE');
    selectCardEv(ev, "Choose a non-grey Hero to capture", playerState.discard.limit(isNonGrayHero), c => {
      attachCardEv(ev, c, ev.twist, 'TENTACLECAPTURE');
    });
    // 2+ players:The player on your right plays a Tentacle from their Victory Pile, capturing from them.
    if (gameState.players.size >= 2) {
      const p = playerState.right;
      selectCardEv(ev, "Choose tentacle", p.victory.limit(c => c.villainGroup === "Abilisk Tentacle"), c => {
        attachCardEv(ev, c, gameState.scheme, 'TENTACLE');
        selectCardEv(ev, "Choose a non-grey Hero to capture", p.discard.limit(isNonGrayHero), c2 => {
          attachCardEv(ev, c2, c, 'TENTACLECAPTURE');
        }, p);
      }, p);
    } else if (ev.nr === 9) {
      // Twist 9 Replay all the captured Tentacles.
      eachPlayer(p => p.victory.limit(c => c.villainGroup === "Abilisk Tentacle").each(c => {
        attachCardEv(ev, c, gameState.scheme, 'TENTACLE');
        selectCardEv(ev, "Choose a non-grey Hero to capture", p.discard.limit(isNonGrayHero), c2 => {
          attachCardEv(ev, c2, c, 'TENTACLECAPTURE');
        }, p);
      }));
    }
    cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('TENTACLE').size));
  }
}, [{
  event: 'MOVECARD',
  match: ev => ev.from.id === 'SCHEME/TENTACLE',
  after: ev => schemeProgressEv(ev, gameState.scheme.attached('TENTACLE').size),
}], () => {
  setSchemeTarget(5);
  gameState.specialActions = ev => gameState.scheme.attached('TENTACLE').map(c => fightActionEv(ev, c));
}),
]);
addTemplates("SCHEMES", "Black Panther", [
// SETUP: 6 Twists.
// RULE: Whenever you fight the Mastermind, you gain the {THRONES FAVOR}.
// EVILWINS: When the 5 Trides of Wakanda have been defeated.
makeSchemeCard("Seize the Wakandan Throne", { twists: 6 }, ev => {
  // Twist: If the Mastermind has the {THRONES FAVOR}, they spend it to stack this Twist next to the Scheme as a 'Tribe of Wkanda Defeated."
  if (mastermindHasThronesFavor()) {
    gameState.thronesFavorHolder = undefined;
    attachCardEv(ev, ev.twist, gameState.scheme, 'TRIBE');
    schemeProgressEv(ev, gameState.scheme.attached('TRIBE').size);
  } else {
  // Otherwise: The Mastermind gains the {THRONES FAVOR}, shuffle this Twist back into the Villain Deck, and then play a card from the Villain Deck.
    withMastermind(ev, c => {
      gameState.thronesFavorHolder = c;
    });
    shuffleIntoEv(ev, ev.twist, gameState.villaindeck);
    playAnotherEv(ev);
  }
}, [
  { event: 'FIGHT', match: ev => isMastermind(ev.what), after: ev => thronesFavorGainEv(ev) },
], () => {
  setSchemeTarget(5);
}),
// SETUP: Twists equal to 5 plus the number of players. 30 Wounds in the Wound Stack.
// RULE: Whenever you recruit a Hero <i>[or it leaves the HQ]</i>, pay 1 Recruit less for each Wound on it and choose players to gain those Wounds, dividing them as evenly as possible.
// Whenever a Wound is KO'd from anywhere, return it to the bottom of the Wound Stack.
// EVILWINS: When the Wound Stack or Villain Deck runs out.
makeSchemeCard("Poison Lakes with Nanite Microbots", { twists: [ 6, 7, 8, 9, 10 ], wounds: 30 }, ev => {
  // Twist: Stack this Twist next to the Scheme as an "Infected Nanite."
  attachCardEv(ev, ev.twist, gameState.scheme, 'INFECTED_NANITE');
  // Wound the Mastermind.
  withMastermind(ev, c => woundEnemyEv(ev, c));
  // Then for each Infected Nanite, Wound a Hero in the HQ, dividing these new Wounds as evenly as possible.
  cont(ev, () => {
    const wounds = gameState.scheme.attached('INFECTED_NANITE');
    distributeEvenlyEv(ev, () => "Wound a Hero in the HQ", wounds, hqHeroes(), (w, h) => woundEnemyEv(ev, h));
  });
}, [
  { event: 'KO', match: ev => isWound(ev.what), after: ev => returnToStackEv(ev, gameState.wounds, ev.parent.what) },
  {
    event: 'MOVECARD',
    match: ev => ev.what.location.isHQ && !ev.to.isHQ && ev.what.attached('WOUND').size > 0,
    before: ev => {
      distributeEvenlyEv(ev, w => `Choose a player to gain ${w.cardName}`, ev.parent.what.attached('WOUND'), gameState.players, (w, p) => gainEv(ev, w, p));
    },
  },
  runOutProgressTrigger('WOUNDS'),
  runOutProgressTrigger('VILLAIN', false),
], () => {
  addStatMod('cost', c => isHero(c), c => -c.attached('WOUND').size);
}),
// SETUP: 10 Twists, representing "Vibranium."
// RULE: A Villain holding Vibranium is <b>Empowered</b> by the colors of the Vibranium Attunement. When you defeat them, put the Vibranium in your Victory Pile, worth 3VP.
// EVILWINS: When 4 Vibranium are in the Escape Pile or the Villain Deck runs out.
makeSchemeCard("Plunder Wakanda's Vibranium", { twists: 10 }, ev => {
  // Twist: Put any Vibranium from the city into the Escape Pile.
  cityVillains().each(c => c.attached('VIBRANIUM').each(v => moveCardEv(ev, v, gameState.escaped)));
  // A Bystander enters the city as a 3 Attack "Smuggler" Villain with "Fight: Rescue this as a Bystander."
  cont(ev, () => gameState.bystanders.withTop(c => {
    villainify("Smuggler", c1 => c1 === c, 3, ev => rescueEv(ev, ev.source));
    enterCityEv(ev, c);
  }));
  // Then the highest Attack Villain captures this Twist.
  cont(ev, () => selectCardEv(ev, "Choose a Villain to capture this Twist", villains().highest(c => c.defense), c => attachCardEv(ev, ev.twist, c, 'VIBRANIUM')));
  // Put the top card of the Hero Deck next to the Scheme as a "Vibranium Attunement," putting any previous Attunement on the bottom of the Hero Deck.
  cont(ev, () => gameState.herodeck.withTop(c => {
    gameState.scheme.attachedDeck('VIBRANIUM_ATTUNEMENT').each(c => moveCardEv(ev, c, gameState.herodeck, true));
    attachCardEv(ev, c, gameState.scheme, 'VIBRANIUM_ATTUNEMENT');
  }));
}, [
  escapeProgressTrigger(isTwist),
  runOutProgressTrigger('VILLAIN', false),
  {
    event: 'DEFEAT',
    match: ev => ev.what.attached('VIBRANIUM').size > 0,
    after: ev => ev.parent.what.attached('VIBRANIUM').each(c => moveCardEv(ev, c, playerState.victory))
  }
], () => {
  setSchemeTarget(4);
  addStatMod('defense', c => isVillain(c) && c.attached('VIBRANIUM').size > 0, c => hqCards().count(gameState.scheme.attached('VIBRANIUM_ATTUNEMENT').sum(c => c.color)));
  addStatSet('vp', isTwist, () => 3);
}),
// SETUP: 11 Twists.
// <ul>
//     <li> <b>Fist</b>: "War" - Defeat a non-Henchman Villain or Mastermind Tactic.</li>
//     <li> <b>Palm</b>: "Diplomacy" - Play three Heroes that share a Hero Class.</li>
//     <li> <b>Two Fingers</b>: "Commerce" - Recruit two Heroes from the HQ.</li>
// </ul>
// EVILWINS: At 6 International Crises.
makeSchemeCard("Provoke Clash of Nations", { twists: 11 }, ev => {
  const twist = ev.twist;
  let resolveWar = false;
  let resolveDiplomacy = false;
  let resolveCommerce = false;
  const votes: string[] = [];
  if (ev.nr <= 8) {
    // Twist 1-8 Wihtout talking, all players simultaneously vote with a Fist, Palm, or 2 Fingers. Break ties at random.
    // Then only you discard your hand and draw six cards. You must do the voted task below by the end of this turn or stack this twist
    // next to the Mastermind as an "International Crisis"/
    eachPlayer(p => chooseOptionEv(ev, "Vote!", ['War', 'Diplomacy', 'Commerce'].map(v => ({l: v, v})), v => votes.push(v), p));
    cont(ev, () => {
      votes.highest(v => votes.count(v1 => v1 === v)).withRandom(v => {
        if(v === 'War') {
          resolveWar = true;
        } else if(v === 'Diplomacy') {
          resolveDiplomacy = true;
        } else if(v === 'Commerce') {
          resolveCommerce = true;
        }
        textLog.log(`You voted for ${v}!`);
      });
    });
    cont(ev, () => discardHandEv(ev));
    cont(ev, () => drawEv(ev, 6));
  } else if (ev.nr >= 9 && ev.nr <= 11) {
    // Twist 9-11 Do all three tasks this turn or add an International Crisis.
    resolveCommerce = resolveWar = resolveDiplomacy = true;
  }
  addTurnTrigger('CLEANUP', () => true, ev => {
    if (resolveWar) resolveWar = !(pastEvents('DEFEAT').count(ev => isVillain(ev.what) && !isHenchman(ev.what) || isTactic(ev.what)) > 0);
    if (resolveDiplomacy) resolveDiplomacy = !(classes.has(c => pastEvents('PLAY').limit(ev => isHero(ev.what)).count(ev => isColor(c)(ev.what)) >= 3));
    if (resolveCommerce) resolveCommerce = !(pastEvents('RECRUIT').limit(ev => isHero(ev.what) && ev.where.isHQ).size >= 2);
    if (resolveCommerce || resolveDiplomacy || resolveWar) {
      attachCardEv(ev, twist, gameState.mastermind, 'INTERNATIONAL_CRISIS');
      cont(ev, () => schemeProgressEv(ev, gameState.mastermind.attached('INTERNATIONAL_CRISIS').size));
    }
  });
}, [], () => {
  setSchemeTarget(6);
}),
]);
addTemplates("SCHEMES", "Black Widow", [
// SETUP: 7 Twists.
makeSchemeCard("Corrupt The Spy Agencies", { twists: 7 }, ev => {
  if (ev.nr <= 6) {
    // Twist 1-6 Each player sends one of their non-grey Heroes {UNDERCOVER}. Then each player may <b>Unleash</b> a Hero from {UNDERCOVER} with a lower cost
    // than the one that player just sent {UNDERCOVER}.
    eachPlayer(p => {
      selectCardEv(ev, "Choose a Hero to send undercover", yourHeroes(p).limit(isNonGrayHero), c => {
        sendUndercoverEv(ev, c);
        unleashFromUndercoverEv(ev, c1 => c1.cost < c.cost, p);
      }, p);
    })
  } else if (ev.nr === 7) {
    // Twist 7 Evil Wins!
  }
  schemeProgressEv(ev, ev.nr);
}, [], () => {
  setSchemeTarget(7);
}),
// SETUP: 8 Twists, minus 1 Twist per player. Add 8 S.H.I.E.L.D. Officers to the Villain Deck.
// RULE: Officers in the Villain Deck and city are "Black Widow Initiate" Villains with <b>3+</b> Attack and
// "<b>Dark Memories. Fight</b>: Gain this as an Officer <i>(without {DARK MEMORIES})</i> or send it {UNDERCOVER}."
makeSchemeCard("Train Black Widows in the Red Room", { twists: [7, 6, 5, 4, 3] }, ev => {
  gameState.officer.withTop(c => enterCityEv(ev, c));
  playAnotherEv(ev);
}, [
  escapeProgressTrigger(isGroup("Black Widow Initiate")),
], () => {
  const isInitiate = (c: Card) => isShieldOfficer(c) && (c.location?.isHQ || c.location == gameState.villaindeck);
  villainify("Black Widow Initiate", isInitiate, 3, ev => {
    chooseOneEv(ev, "Gain this",
      ["as an Officer", () => gainEv(ev, ev.source)],
      ["undercover", () => sendUndercoverEv(ev, ev.source)]);
  });
  addStatSet('baseDefense', isInitiate, darkMemoriesVarDefense(1));
  setSchemeTarget(3, true);
  repeat(8, () => gameState.officer.withTop(c => moveCard(c, gameState.villaindeck)));
  gameState.villaindeck.shuffle();
}),
// SETUP: 11 Twists, minus 1 Twist per player.
// EVILWINS: When there are four non-grey Heroes per player in the KO pile.
makeSchemeCard("Sniper Rifle Assassins", { twists: [10, 9, 8, 7, 6] }, ev => {
  // Twist: Each player must {DODGE} with a Hero from their hand, revealing the card they drew. KO each non-grey Hero drawn this way.
  eachPlayer(p => {
    selectCardEv(ev, "Choose a Hero to dodge", p.hand.limit(isHero), c => dodgeCardEv(ev, c), p);
  });
  addTurnTrigger('DRAW', fev => fev.parent === ev, ev => isNonGrayHero(ev.parent.what) && KOEv(ev, ev.parent.what)); // TODO add isChildOf
}, [
  koProgressTrigger(isNonGrayHero),
], () => {
  setSchemeTarget(4);
}),
// SETUP: 7 Twists. 6 Heroes.
// EVILWINS: When there are 5 pieces of Incriminating Evidence.
makeSchemeCard("Frame Heroes For Murder", { twists: 7, heroes: [6, 6, 6, 6, 6] }, ev => {
  if (ev.nr <= 6) {
    // Twist 1-6 Stack a card from the HQ next to the Scheme as "Incriminating Evidence" that has a different cost than any card already in that stack.
    selectCardEv(ev, "Choose a card to incriminate", hqCards().limit(c => !gameState.scheme.attached('EVIDENCE').unique(c => c.cost).includes(c.cost)), c => {
      attachCardEv(ev, c, gameState.scheme, 'EVIDENCE');
    });
  } else if (ev.nr === 7) {
    // Twist 7 Add any card from the HQ to the Incriminating Evidence.
    selectCardEv(ev, "Choose a card to incriminate", hqCards(), c => attachCardEv(ev, c, gameState.scheme, 'EVIDENCE'));
  }
  cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('EVIDENCE').size));
}, [], () => {
  setSchemeTarget(5);
}),
]);
addTemplates("SCHEMES", "Marvel Studios The Infinity Saga", [
// SETUP: 5 Twists.
// <b>Twist 1,3,5</b>: Choose 3 Heroes from the HQ and KO them.
// <b>Twist 2,4</b>: Deal the Hero Deck into two facedown piles (as equally as possible). KO one of them.
// EVILWINS: When the Hero Deck or Villain Deck runs out.
makeSchemeCard("Halve All Life In The Universe", { twists: 5 }, ev => {
  if (ev.nr === 1 || ev.nr === 3 || ev.nr === 5) {
    selectObjectsEv(ev, "Choose 3 Heroes to KO", 3, hqCards().limit(isHero), c => KOEv(ev, c));
  } else if (ev.nr === 2 || ev.nr === 4) {
    gameState.herodeck.deck.forEach((c, i) => i % 2 && KOEv(ev, c));
  }
}, [
  runOutProgressTrigger('HERO'),
  runOutProgressTrigger('VILLAIN', false),
], () => {
  setSchemeTarget(gameState.herodeck.size);
}),
// SETUP: Twists equal to the number of players plus 4.
// EVILWINS: When the Mastermind has sacrificed 5 Heroes for the Soul Stone.
makeSchemeCard("Sacrifice For The Soul Stone", { twists: [5, 6, 7, 8, 9] }, ev => {
  // Twist: You may KO one of your non-grey Heroes and one of your grey Heroes to "Sacrifice for the Soul Stone." If you do, draw three cards,
  // shuffle this Twist back into Villain Deck. If you don't stack a Hero from the HQ next to the Mastermind, "Sacrificed for the Soul Stone."
  selectCardOptEv(ev, "Choose a non-grey Hero to sacrifice", yourHeroes().has(isColor(Color.GRAY)) ? yourHeroes().limit(isNonGrayHero) : [], c => {
    selectCardEv(ev, "Choose a grey Hero to sacrifice", yourHeroes().limit(Color.GRAY), c2 => {
      KOEv(ev, c); KOEv(ev, c2);
      drawEv(ev, 3);
      shuffleIntoEv(ev, ev.twist, gameState.villaindeck);
    });
  }, () => {
    selectCardEv(ev, "Choose a hero", hqCards().limit(isHero), c => {
      attachCardEv(ev, c, gameState.mastermind, 'SOULSTONE');
    });
    cont(ev, () => schemeProgressEv(ev, gameState.mastermind.attached('SOULSTONE').size));
  });
}, [], () => {
  setSchemeTarget(5);
}),
// SETUP: 11 Twists. Use 4 Heroes in the Hero Deck, plus 4 other Heroes to make a "Past Hero Deck." Above the Board, make room for an alternate city called "The Past."
// It has the normal 5 spaces, from Sewers to Bridge. The Past has its own "Past HQ" filled by the "Past Hero Deck." To start, play as if "The Past" city, HQ, and Hero Deck don't exist.
makeSchemeCard<{
  deckPairs: [Deck, Deck][],
}>("The Time Heist", { twists: 11, heroes: 8 }, ev => {
  // <b>Twist 1,3,5,7,9</b>: Until the next Twist, move the Villain Deck next to "The Past," and play as if "The Past" city, HQ, and Hero Deck exist, while the normal
  // city, HQ, and Hero Deck don't exist. (Use the normal decks and spaces for everything except the city, HQ, and Hero Deck.)
  const swapDecks = (d1: Deck, d2: Deck) => {
    [d1.deck, d2.deck] = [d2.deck, d1.deck];
    [d1._attached, d2._attached] = [d2._attached, d1._attached];
    [d1.faceup, d2.faceup] = [d2.faceup, d1.faceup];
  };
  if (ev.nr <= 9) {
    gameState.schemeState.deckPairs.each((pair: [Deck, Deck]) => swapDecks(...pair));
  }
  schemeProgressEv(ev, ev.nr);
}, [], s => {
  const pastHeroes = gameState.herodeck.limit(c => c.heroName === extraHeroName(1) || c.heroName === extraHeroName(2) || c.heroName === extraHeroName(3) || c.heroName === extraHeroName(4));
  const pastHeroDeck = new Deck("HERO2", false);
  pastHeroDeck.cityPosition = [5, -1];
  s.deckPairs = [];
  s.deckPairs.push([gameState.herodeck, pastHeroDeck]);
  pastHeroes.each(c => moveCard(c, pastHeroDeck));
  gameState.city.each(c => s.deckPairs.push([c, makeCityDeck(c.id + "_ALT", [c.cityPosition[0], -2])]));
  gameState.hq.each(c => {
    const pastHQSpace = makeHQDeck(c.id + "_ALT", [c.cityPosition[0], -1]);
    s.deckPairs.push([c, pastHQSpace]);
    moveCard(pastHeroDeck.top, pastHQSpace);
  });
  setSchemeTarget(10);
}),

// SETUP: 11 Twists. The rightmost city space represents a TV show from the "50s." The space on its left is the "60s," then the "70s." The city is only those 3 soaces.
// The HQ is only 3 spaces beneath those. Move the Mastermind & Officer Deck to mark the city's left edge.
// EVILWINS: When all TV is destroyed.
makeSchemeCard("Warp Reality Into a TV Show", { twists: 11 }, ev => {
  if (ev.nr <= 4) {
    // Twist 1-4 Another TV show (city space) appears on the left side of the city, representing the 80s, 90s, 2000s, & 2010s. Another HQ space appears beneath it.
    const era = ["80s", "90s", "2000s", "2010s"][ev.nr - 1];
    gameState.city = [makeCityDeck("CITY_" + era, -ev.nr), ...gameState.city];
    gameState.hq = [makeHQDeck("HQ_" + era, -ev.nr), ...gameState.hq];
    gameState.city[0].above = gameState.hq[0];
    gameState.hq[0].below = gameState.city[0];
    makeCityAdjacent(gameState.city);
  } else if (ev.nr >= 5 && ev.nr <= 11) {
    // Twist 5-11 Destroy the rightmost TV show and the HQ space beneath it. KO any Hero in that HQ space. Push forward any Villain there.
    // Move the Villain Deck & Hero Deck to mark the city's right edge.
    gameState.city.withLast(d => {
      destroyCity(d);
      d.deck.each(c => d.next ? moveCardEv(ev, c, d.next) : villainEscapeEv(ev, c));
    });
    gameState.hq.withLast(d => {
      destroyHQ(ev, d);
      d.deck.each(c => KOEv(ev, c));
    });
  }
  schemeProgressEv(ev, ev.nr);
}, [], s => {
  setSchemeTarget(11);
}),
]);
addTemplates("SCHEMES", "Midnight Sons", [
// SETUP: 11 Twists. Add all 14 cards for any Blade Hero to the Villain Deck.
// RULE: Blade Hero cards in the Villain Deck and city are demonically possessed "Switchblade" Villains with Attack equal to their printed cost.
// Their only abilities are "{SUNLIGHT} To fight this, you must also spend <b>3 Recruit. Moonlight</b>: <b>Blood Frenzy. Fight</b>: Either KO this card
// or choose a player to gain it as a Hero."
// EVILWINS: When the Hero Deck or Villain Deck runs out.
makeSchemeCard("Midnight Massacre", { twists: 11, heroes: [ 4, 6, 6, 6, 7] }, ev => {
  // Twist: For each Switchblade Villain in the city and/or Escape Pile. KO the top three cards of the Hero Deck.
  const n = 3 * (cityVillains().count(isGroup("Switchblade")) + gameState.escaped.count(isGroup("Switchblade")));
  repeat(n, () => cont(ev, () => gameState.herodeck.withTop(c => KOEv(ev, c))));
  // No matter how many there were, play another card from the Villain Deck.
  playAnotherEv(ev);
}, [
  runOutProgressTrigger('HERO'),
  runOutProgressTrigger('VILLAIN', false),
], () => {
  const isExtra = (c: Card) => c.heroName === extraHeroName();
  villainify("Switchblade", isExtra, c => c.printedCost + (moonlightPower() ? bloodFrenzyAmount() : 0), ev => {
    chooseOneEv(ev, "Switchblade", ["KO", () => KOEv(ev, ev.source)], ["Gain as a Hero", () => gainEv(ev, ev.source)]);
  });
  addStatSet('fightCost', isExtra, (c, cost) => sunlightPower() ? { recruit: (cost.recruit || 0) + 3, ...cost} : cost);
  gameState.herodeck.limit(isExtra).each(c => moveCard(c, gameState.villaindeck));
  gameState.villaindeck.shuffle();
  setSchemeTarget(gameState.herodeck.size);
}),
// SETUP: 6 Twists, plus 1 per player. Add Lilin as an extra Villain Group. If using Lilith: Use 1 Twist total <i>[and still use and extra Villain Group]</i>.
// RULE: When 5 Bystanders are in the KO pile, shuffle all Twists from the KO pile back into the Villain Deck. Then this Scheme {TRANSFORM} into "Great Old One Chthon."
// <i>[Flip it over.]</i> then KO all other Masterminds and their remaining Tactics.
// EVILWINS: When there are 3 Villains per player in the Escape Pile or the Villain Deck runs out.
makeSchemeCard("Ritual Sacrifice To Summon Chthon", { twists: [ 7, 8, 9, 10, 11 ], vd_villain: [ 2, 3, 4, 4, 5 ], required: { villains: ["Lilin"] } }, ev => {
  if (ev.nr <= 4) {
    // Twist 1-4 A Villain or Mastermind <b>Hunts for Victims.</b>
    selectCardEv(ev, "Choose an enemy to hunt", fightableCards().limit(isEnemy), c => huntForVictimsEv(ev, c));
  } else if (ev.nr >= 5 && ev.nr <= 11) {
    // Twist 5-11 The Mastermind <b>Hunts for Victims.</b>
    selectCardEv(ev, "Choose an enemy to hunt", fightableCards().limit(isMastermind), c => huntForVictimsEv(ev, c));
  }
}, [
  runOutProgressTrigger('VILLAIN', false),
  escapeProgressTrigger(isVillain),
  { event: 'MOVECARD', match: ev => isBystander(ev.what) && ev.to === gameState.ko, after: ev => {
    if (gameState.ko.count(isBystander) >= 5 && !incPerGame('SUMMONCHTHON')) {
      gameState.ko.limit(isTwist).each(c => shuffleIntoEv(ev, c, gameState.villaindeck));
      // <b>Master Strike or Twist</b>: Destroy the current player. Shuffle this Strike or Twist back into the Villain Deck.
      // <b>Chthon Wins: When all players are destroyed.</b>
      // <i>[This card can only start the game as the Scheme on the other side.]</i>
      const chton = makeSchemeCard("Great Old One Chthon", {}, ev => {
        shuffleIntoEv(ev, ev.twist, gameState.villaindeck);
        gameState.players.length === 1 ? gameOverEv(ev, 'LOSS', ev.source) : destroyCurrentPlayer(ev);
      });
      chton.set = "Midnight Sons";
      chton.printedVP = 13;
      chton.isTransformed = true;
      chton.strike = chton.twist = ev => {
        shuffleIntoEv(ev, ev.twist || ev.what, gameState.villaindeck);
        gameState.players.length === 1 ? gameOverEv(ev, 'LOSS', ev.source) : destroyCurrentPlayer(ev);
      }
      Object.setPrototypeOf(ev.source, Object.getPrototypeOf(chton));
      // addStatSet('isMastermind', chton, () => true); TODO
    }
  }},
], () => {
  if (setupMastermindName() === "Lilith") {
    gameState.villaindeck.limit(isTwist).forEach((c, i) => i > 0 && moveCard(c, gameState.outOfGame));
    gameState.villaindeck.shuffle();
  }
  setSchemeTarget(3, true);
}),
// SETUP: 10 Twists. Add an extra Henchman Group of 10 cards as "Vampire Neonates." Put this Scheme above the Bank to mark it as the "Blood Bank."
// RULE: All "Vampire Neonates" also have {BLOOD FRENZY}. While in the Blood Bank, they instead have double {BLOOD FRENZY}.
// EVILWINS: When there are 5 Vampire Thralls or the Villain Deck runs out.
makeSchemeCard("Sire Vampires at the Blood Bank", { twists: 10, vd_henchmen: [ 2, 2, 2, 3, 3 ] }, ev => {
  // Twist:  If there is a Villain in the Blood Bank, stack a card from the Bystander Deck next to the Scheme as a "Vampire Thrall".
  villainIn('BANK').size ? gameState.bystanders.withTop(c => {
    attachCardEv(ev, c, gameState.scheme, 'VAMPIRE_THRALL');
    schemeProgressEv(ev, gameState.scheme.attached('VAMPIRE_THRALL').size);
  }) :
  // Otherwise, move a Villain from another city space to the Blood Bank.
  withCity('BANK', bank => {
    selectCardEv(ev, "Choose a Villain to move", cityVillains(), c => moveCardEv(ev, c, bank));
  });
  // Either way, play another card form the Villain Deck.
  playAnotherEv(ev);
}, [], () => {
  const isVampire = (c: Card) => c.villainGroup == extraHenchmenName();
  addStatMod('defense', isVampire, c => bloodFrenzyAmount() * (isLocation(c.location, 'BANK') ? 2 : 1));
  setSchemeTarget(5);
}),
// SETUP: 11 Twists. Add two extra Heroes.
makeSchemeCard("Wager at Blackjack For Heroes' Souls", { twists: 11, heroes: [5, 7, 7, 7, 8]  }, ev => {
  // Twist: Reveal cards from the Hero Deck, adding up their total cost until you choose to stop or your Total exceeds 21.
  // If your Total exceeds 21 you "bust" and the <b>Mastermind wins</b> the wager. If you didn't bust, then do the same thing for the Mastermind,
  // stopping as soon as their Total is at least 17. If their Total exceeds 21, then the "bust" and <b>you win</b> the wager.
  // If no one busts, then <b>you win</b> the wager if your Total is higher. If the Mastermind's Total is equal or higher: <b>they win.</b>
  const won = true;
  // <b>If you win</b>, you may gain one of the revealed Heroes that costs 6 or less.
  // <b>If the Mastermind wins,</b> stack one of the revelaed Heroes next to the Scheme as a "Wagered Soul."
  chooseOptionEv(ev, "Stop at", [18, 19, 20, 21].map(v => ({l:`${v}`,v})), ourStop => {
    revealHeroDeckEv(ev, cards => {
      const [ourSum, stopped] = cards.reduce<[number, boolean]>(([sum, stopped], c) => [stopped ? sum : sum + c.cost, stopped || sum >= ourStop], [0, false]);
      if (ourSum > 21) return false;
      if (!stopped) return true;
      const [theirSum, stopped2] = cards.reduce<[number, boolean]>(([sum, stopped], c) => [stopped ? sum : sum + c.cost, stopped || sum >= 17], [-ourSum, false]);
      return !stopped2;
    }, cards => {
      const [ourSum] = cards.reduce<[number, boolean]>(([sum, stopped], c) => [stopped ? sum : sum + c.cost, stopped || sum >= ourStop], [0, false]);
      textLog.log(`You stopped at ${ourSum}.`);
      const [theirSum] = cards.reduce<[number, boolean]>(([sum, stopped], c) => [stopped ? sum : sum + c.cost, stopped || sum >= 17], [-ourSum, false]);
      textLog.log(`The Mastermind stopped at ${theirSum}.`);
      if (ourSum > 21 || (theirSum < 21 && theirSum >= ourSum)) {
        textLog.log("The Mastermind wins the wager!");
        selectCardEv(ev, "Choose a Hero to wager", cards.limit(isHero), c => {
          attachCardEv(ev, c, gameState.scheme, 'WAGERED_SOUL');
        });
      } else {
        textLog.log("You win the wager!");
        selectCardOptEv(ev, "Choose a Hero to gain", cards.limit(c => c.cost <= 6), c => gainEv(ev, c));
      };
    }, true, true);
  });
  cont(ev, () => {
    schemeProgressEv(ev, gameState.scheme.attached('WAGERED_SOUL').size);
  });
  // Either way, put the rest of the revealed Heroes on the bottom of the Hero Deck in random order.
  // EVILWINS: When there are 4 Wagered Souls.
}, [], () => {
  setSchemeTarget(4);
}),
]);
addTemplates("SCHEMES", "Marvel Studios What If...?", [
// SETUP: (1-2 players: Use 3 Villain Groups.) Stack each Villain Group separately face down as its own "Reality." Add 2 Twists to each Reality.
// Shuffle together all the Henchmen, Master Strikes, and Bystanders for your player count and randomly distribute them amongst all the Realities,
// as evenly as possible. Shuffle each Reality separately.
// RULE: Each turn, you choose which Reality (Villain Deck) plays a card. They all play into the same city.
// EVILWINS: When all Realities have been destroyed.
makeSchemeCard<{realities: Deck[], current: Deck}>("Breach the Nexus of All Realities", { twists: [ 6, 6, 6, 6, 8 ], vd_villain: [ 3, 3, 3, 3, 4 ] }, ev => {
  // Twist: Stack this Twist next to this Reality as a "Dimensional Breach." If this was the second Breach for that Reality, destroy that Reality, KO'ing all its cards.
  attachCardEv(ev, ev.twist, gameState.villaindeck, 'DIMENSIONAL_BREACH');
  cont(ev, () => { if(gameState.villaindeck.attached('DIMENSIONAL_BREACH').size > 1) {
    gameState.villaindeck.each(c => KOEv(ev, c));
    gameState.villaindeck.attached('DIMENSIONAL_BREACH').each(c => KOEv(ev, c));
  }});
  cont(ev, () => {
    schemeProgressEv(ev, ev.state.realities.count(d => d.size === 0) - (gameState.villaindeck.size === 0 ? 0 : 1));
    (gameState.villaindeck.size === 0) && selectCardEv(ev, "Choose a new Reality", ev.state.realities.limit(d => d.size > 0), d => {
      d.each(c => moveCardEv(ev, c, gameState.villaindeck, true));
      d.attached('DIMENSIONAL_BREACH').each(c => attachCardEv(ev, c, gameState.villaindeck, 'DIMENSIONAL_BREACH'));
      ev.state.current = d;
    });
  });
}, [{
  event: 'TURNSTART',
  before: ev => {
    const state: {realities: Deck[], current: Deck} = gameState.schemeState;
    gameState.villaindeck.each(c => moveCardEv(ev, c, state.current, true));
    gameState.villaindeck.attached('DIMENSIONAL_BREACH').each(c => attachCardEv(ev, c, state.current, 'DIMENSIONAL_BREACH'));
    cont(ev, () => selectCardEv(ev, "Choose a Reality", state.realities.limit(d => d.size > 0), d => {
      d.each(c => moveCardEv(ev, c, gameState.villaindeck, true));
      d.attached('DIMENSIONAL_BREACH').each(c => attachCardEv(ev, c, gameState.villaindeck, 'DIMENSIONAL_BREACH'));
      state.current = d;
    }));
  }
}], s => {
  const twists = gameState.villaindeck.limit(isTwist);
  const groups = gameState.villaindeck.limit(c => !isHenchman(c) && !!c.villainGroup).unique(c => c.villainGroup);
  const realities = groups.map((g, i) => {
    const d = gameState.villaindeck.attachedDeck("REALITY_" + i);
    gameState.villaindeck.limit(isGroup(g)).each(c => moveCard(c, d));
    moveCard(twists[i*2], d);
    moveCard(twists[i*2+1], d);
    return d;
  });
  [...gameState.villaindeck.deck].forEach((c, i) => moveCard(c, realities[i % realities.length]));
  realities.forEach(r => r.shuffle());
  setSchemeTarget(realities.length);
  s.realities = realities;
  realities[0].each(c => moveCard(c, gameState.villaindeck));
  s.current = realities[0];
}),
// SETUP: 11 Twists.
// EVILWINS: When the Zoo has 5 Heroes.
makeSchemeCard("Collect an Interstellar Zoo", { twists: 11 }, ev => {
  // Twist: Each player reveals their hand. Starting with the current player, then clockwise, the first player to have one of this kind of Hero
  // in their hand or discard pile stacks it next to this Scheme, "stolen for the Zoo."
  if (ev.nr >= 1 && ev.nr <= 11) {
    // Twist 1 [Strength] <b>T2</b>: [Instinct] <b>T3</b>: [Covert] <b>T4</b>: [Tech] <b>T5</b>: [Ranged]
    // <b>T6</b>: 5-cost <b>T7</b>: 4-cost <b>T8</b>: 3-cost <b>T9</b>: 0-cost <b>T10</b>: Recruit icon. <b>T11</b>: Attack icon.
    const f: Filter<Card>[] = [, Color.STRENGTH, Color.INSTINCT, Color.COVERT, Color.TECH, Color.RANGED,
      c => c.cost === 5, c => c.cost === 4, c => c.cost === 3, c => c.cost === 0, hasRecruitIcon, hasAttackIcon];
    let done = false;
    eachPlayer(p => cont(ev, () => {
      !done && selectCardEv(ev, "Choose a Hero to steal", handOrDiscard(p).limit(f[ev.nr]), c => {
        attachCardEv(ev, c, gameState.scheme, 'STOLEN');
        done = true;
      }, p)
    }));
    cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('STOLEN').size));
  }
}),
// SETUP: 4 Twists. Include exactly one Villain Group with "{RISEOFTHELIVINGDEAD}." Add 8 random cards from an extra Hero to the Villain Deck.
// 1-2 players; Add 3 extra Bystanders.
// RULE: Hero cards from the Villain Deck are "Zombie" Villains with Attack equal to their cost +1, worth VP equal to their cost. They have "<b>Ambush</b>: {RISEOFTHELIVINGDEAD}.
// <b>Fight</b>: Play a copy of this card as a Hero, then put it into your Victory Pile as a Villain." <i>(It still has <b>Rise</b>.)</i>
// EVILWINS: When there are 3 Villains per player in the Escape pile or the Villain Deck runs out.
makeSchemeCard("Marvel Zombies", { twists: 4, heroes: [ 4, 6, 6, 6, 7 ], vd_bystanders: [ 4, 7, 8, 8, 12 ], required: { villains: "The Deadlands|Zombie Avengers" } }, ev => { // TODO required exactly one riseof
  // Twist: Each Villain in the city with "Rise of the Living Dead" escapes. Then play another card from the Villain Deck.
  cityVillains().limit(hasRiseOfTheLivingDead).each(c => villainEscapeEv(ev, c));
  playAnotherEv(ev);
}, [
  escapeProgressTrigger(isVillain),
  runOutProgressTrigger('VILLAIN', false),
], () => {
  const isZombie = (c: Card) => c.heroName === extraHeroName();
  gameState.herodeck.deck.filter(isZombie).forEach((c, i) => {
    moveCard(c, i < 8 ? gameState.villaindeck : gameState.outOfGame);
  });
  villainify("Zombie", isZombie, c => c.cost + 1, ev => playCopyEv(ev, ev.source));
  addStatSet('vp', isZombie, c => c.cost);
  addStatSet('ambush', isZombie, () => riseOfTheLivingDead);
  addStatSet('riseOfTheLivingDead', isZombie, () => true);
  gameState.villaindeck.shuffle();
  setSchemeTarget(3, true);
}),
// SETUP:  6 Twists. Always include the Party Thor Hero and Intergalactic Party Animals Villain Group.
// RULE: You can't fight or defeat Frigga.
// EVILWINS: When 5 Wreckages have been Discovered.
makeSchemeCard("Trash Earth with Hugest Party Ever", { twists: 8, required: { heroes: ["Party Thor"], villains: ["Intergalactic Party Animals"]} }, ev => {
  if (gameState.mastermind.has(c => c.cardName == "Frigga, Mother of Thor")) {
    // Twist: If Frigga, Mother of Thor, is in play, stack this Twist next to the Scheme as "Discovered Wreckage."
    attachCardEv(ev, ev.twist, gameState.scheme, 'WRECKAGE');
    cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('WRECKAGE').size));
  } else {
    // Otherwise: Search the Villain Deck for Frigga and she does her Ambush ability. Then shuffle this Twist back into the Villain Deck.
    gameState.villaindeck.limit(c => c.cardName == "Frigga, Mother of Thor").each(c => {
      pushEffects(ev, c, 'ambush', c.ambush);
    });
    cont(ev, () => shuffleIntoEv(ev, ev.twist, gameState.villaindeck));
  }
}, [], () => {
  setSchemeTarget(5);
  forbidAction('FIGHT', c => c.cardName === "Frigga, Mother of Thor");
}),
]);
addTemplates("SCHEMES", "Ant-Man and the Wasp", [
// SETUP: 11 Twists. Set aside all 14 cards of a random extra Hero that has any Size-Changing cards as "Shrink Tech."
// EVILWINS: When 8 Shrink Tech cards are Controlled by Arms Dealers.
makeSchemeCard("Auction Shrink Tech to Highest Bidder", { twists: 11, heroes: [ 4, 5, 5, 5, 6 ] }, ev => {
  // Twist: Stack this Twist next to the Scheme as a "Hostile Bid."
  attachCardEv(ev, ev.twist, gameState.scheme, 'HOSTILE BID');
  // Reveal a random Hero from the Shrink Tech. This turn you may recruit that Hero, but it costs 1 Recruit more for each Hostile Bid.
  gameState.scheme.attachedDeck('SHRINKTECH').withRandom(c => {
    // If you recruit it, either KO that Hero or choose any player to gain it.
    attachCardEv(ev, c, gameState.scheme, 'RECRUITABLE');
    addTurnAction(new Ev(ev, 'RECRUIT', { cost: getRecruitCost(c), what: c}));
    // If you don't recruit it by the end of this turn, stack it next to the Scheme as "Controlled by Arms Dealers."
    addTurnTrigger('CLEANUP', () => true, () => {
      if (c.location.attachedTo === gameState.scheme) {
        attachCardEv(ev, c, gameState.scheme, 'ARMS DEALERS');
        cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('ARMS DEALERS').size));
      }
    });
  });
}, [], () => {
  setSchemeTarget(8);
  // TODO not selectable but random with restriction
  const isShrinkTech = (c: Card) => c.heroName === extraHeroName();
  gameState.herodeck.deck.filter(isShrinkTech).forEach((c, i) => {
    moveCard(c, gameState.scheme.attachedDeck('SHRINKTECH'));
  });
}),
// SETUP: 5 Twists.
// RULE: During your turn, any number of times, you may spend 1 Attack to "Seal" an unsealed city space or unsealed Mastermind space by putting a card above it from the Wound Stack.
// EVILWINS: When 3 Escape Routes have been discovered.
makeSchemeCard("Escape an Imprisoning Dimension", { twists: 5 }, ev => {
  // Twist: If any city space with a Villain in it or the Mastermind space is not "sealed", stack this Twist next to the Mastermind as a "Discovered Escape Route."
  if ([...gameState.city.limit(d => d.has(isVillain)), gameState.mastermind].has(d => d.attached('SEAL').size === 0)) {
    attachCardEv(ev, ev.twist, gameState.mastermind, 'ESCAPE_ROUTE');
    cont(ev, () => schemeProgressEv(ev, gameState.mastermind.attached('ESCAPE_ROUTE').size));
  } else {
    // Otherwise, return 3 Seals from above spaces to the Wound Deck, shuffle this Twist into the Villain Deck, and play another card from the Villain Deck.
    selectObjectsEv(ev, "Choose 3 Seals to return", 3, [...gameState.city, gameState.mastermind].limit(d => d.attached('SEAL').size > 0), d => {
      d.attached('SEAL').each(c => returnToStackEv(ev, gameState.wounds, c));
    });
    shuffleIntoEv(ev, ev.twist, gameState.villaindeck);
    playAnotherEv(ev);
  }
}, [], () => {
  gameState.specialActions = ev => [...gameState.city, gameState.mastermind].map(d => new Ev(ev, 'EFFECT', {
    cost: { attack: 1, cond: () => d.attached('SEAL').size === 0 },
    desc: 'Seal',
    func: () => gameState.wounds.withTop(c => attachCardEv(ev, c, d, 'SEAL')),
  }));
  setSchemeTarget(3);
}),
// SETUP: 5 Twists.
// RULE: You have the ability "{HEIST} You get +1 Recruit. Shuffle a Secret from next to the Mastermind into the Villain Deck."
// EVILWINS: When the Mastermind has 5 Secrets.
makeSchemeCard("Safeguard Dark Secrets", { twists: 5 }, ev => {
  // Twist: Stack this Twist next to the Mastermind as a "Secret," then play another card from the Villain Deck.
  attachCardEv(ev, ev.twist, gameState.mastermind, 'SECRET');
  cont(ev, () => schemeProgressEv(ev, gameState.mastermind.attached('SECRET').size));
  playAnotherEv(ev);
}, [], () => {
  setSchemeTarget(5);
  gameState.scheme.top.heist = ev => {
    addRecruitEvent(ev, 1);
    gameState.mastermind.attached('SECRET').withFirst(c => shuffleIntoEv(ev, c, gameState.villaindeck));
  };
}),
// SETUP: 9 Twists. Set aside the "Quantum Realm" Villain Group as an extra group. Shuffle its Ambush Scheme into the Villain Deck.
// RULE: You may fight Villains on the Quantum Siphons. They get +1 Attack for each two Siphons.
// EVILWINS: When 4 Quantum Realm Villains have been KO'd or there are 9 Quantum Siphons.
makeSchemeCard("Siphon Energy from the Quantum Realm", { twists: 9, vd_villain: [ 2, 3, 4, 4, 5], required: { villains: ["Quantum Realm"]} }, ev => {
  // Twist: Stack this Twist next to the Mastermind as a "Quantum Siphon."
  attachCardEv(ev, ev.twist, gameState.mastermind, 'QUANTUM_SIPHON');
  cont(ev, () => gameState.mastermind.attached('QUANTUM_SIPHON').size >= 9 && evilWinsEv(ev));
  // Put a random set aside Quantum Realm Villain on the Siphons. Do its Ambush effect.
  // If there was already a Quantum Realm Villain on the Siphons, KO it.
  gameState.mastermind.attached('QUANTUM_REALM').each(c => KOEv(ev, c));
  gameState.outOfGame.attachedDeck('QUANTUM_REALM').withRandom(c => {
    attachCardEv(ev, c, gameState.mastermind, 'QUANTUM_REALM');
    pushEffects(ev, c, 'ambush', c.ambush);
  });
}, [
  koProgressTrigger(c => isGroup("Quantum Realm")(c)),
], () => {
  const isQuantum = (c: Card) => isVillain(c) && c.villainGroup === "Quantum Realm";
  gameState.villaindeck.limit(isQuantum).each(c => c.cardType === 'AMBUSH SCHEME' || moveCard(c, gameState.outOfGame.attachedDeck('QUANTUM_REALM')));
  addStatMod('defense', isQuantum, c => Math.floor(gameState.mastermind.attached('QUANTUM_SIPHON').size / 2));
  gameState.specialActions = ev => gameState.mastermind.attached('QUANTUM_REALM').map(c => fightActionEv(ev, c));
  setSchemeTarget(4);
}),
]);
addTemplates("SCHEMES", "2099", [
// SETUP: 11 Twists
// RULE: Once per turn, you may stack one of your non-grey Heroes next to this Scheme to earn "Ten Million Votes" for that Hero Name.
// If you do, you may also send one of your grey Heroes {UNDERCOVER} as "Secret Service."
// EVILWINS: When the Mastermind is elected President by having Forty Million more Votes than the highest-voted Hero Name.
makeSchemeCard<{ourVotes: number}>("Become President of the United States", { twists: 11 }, ev => {
  // Twist: If there's a Villain in the Bank or Streets, the Mastermind "vows to crush crime," and you stack this Twist next to the Mastermind as "Ten Million Votes."
  if (cityVillains().has(c => isLocation(c.location, 'BANK', 'STREETS'))) {
    attachCardEv(ev, ev.twist, gameState.mastermind, 'TEN_MILLION_VOTES');
  } else {
  // Otherwise, you may discard two cards to "counter negative advertising," shuffle this Twist back into the Villain Deck, and play another card from that deck.
  // If you don't discard, stack this Twist next to the Mastermind as "Ten Million Votes."
    if (playerState.hand.size >= 2) {
      chooseOneEv(ev, "", ["Discard 2 cards", () => {
        selectObjectsEv(ev, "Choose 2 cards to discard", 2, playerState.hand.deck, c => discardEv(ev, c));
        shuffleIntoEv(ev, ev.twist, gameState.villaindeck);
        playAnotherEv(ev);
      }], ["Don't discard", () => attachCardEv(ev, ev.twist, gameState.mastermind, 'TEN_MILLION_VOTES')]);
    } else attachCardEv(ev, ev.twist, gameState.mastermind, 'TEN_MILLION_VOTES');
  }
  cont(ev, () => schemeProgressEv(ev, (gameState.mastermind.attached('TEN_MILLION_VOTES').size - ev.state.ourVotes)));
}, [], (s) => {
  setSchemeTarget(4);
  gameState.specialActions = ev => [new Ev(ev, 'EFFECT', {
    cost: { cond: () => yourHeroes().has(isNonGrayHero) && !countPerTurn('VOTE') },
    desc: 'Stack a Hero for Ten Million Votes',
    func: () => {
      incPerTurn('VOTE');
      selectCardEv(ev, "Choose a Hero to stack", yourHeroes().limit(isNonGrayHero), c => attachCardEv(ev, c, gameState.scheme, 'TEN_MILLION_VOTES'));
      selectCardOptEv(ev, "Choose a Hero to send undercover", yourHeroes().limit(Color.GRAY), c => sendUndercoverEv(ev, c));
      cont(ev, () => {
        const ourVotes = gameState.scheme.attached('TEN_MILLION_VOTES');
        const candidates = gameState.scheme.attached('TEN_MILLION_VOTES').unique(c => c.heroName);
        const bestCandidate = candidates.max(name => ourVotes.limit(c => c.heroName === name).size)
        s.ourVotes = bestCandidate;
        schemeProgressEv(ev, (gameState.mastermind.attached('TEN_MILLION_VOTES').size - s.ourVotes));
      });
    }
  })]
}),
// SETUP: Add an extra Hero. 8 Twists, representing "Toxic Sludge."
// RULE: To recruit a Hero, you must also pay 2 Recruit for each Toxic Sludge under it. During your turn, if there is any Sludge under the HQ, you may
// "flush the Toxic Sludge into the river." If you do, then KO all the Sludge and the Heroes in those HQ spaces, and each player gains a Wound.
// EVILWINS: When the Hero Deck runs out or there are 8 Toxic Sludges under the HQ and/or in the river <i>(KO pile)</i>.
makeSchemeCard("Befoul Earth into a Polluted Wasteland", { twists: 8, heroes: [4, 6, 6, 6, 7] }, ev => {
  // Twist: Put this Toxic Sludge under an HQ space. No space can have two Sludges unless all spaces already have one.
  selectCardEv(ev, "Choose a Hero to put Sludge under", gameState.hq.limit(d => d.attached('SLUDGE').size === -gameState.hq.max(c => -c.attached('SLUDGE').size)), c => {
    attachCardEv(ev, ev.twist, c, 'SLUDGE');
  });
  cont(ev, () => schemeProgressEv(ev, gameState.hq.sum(d => d.attached('SLUDGE').size + gameState.ko.count(isTwist))));
}, [
  runOutProgressTrigger('HERO', false),
], () => {
  setSchemeTarget(8);
  gameState.specialActions = ev => [new Ev(ev, 'EFFECT', {
    cost: { cond: () => gameState.hq.has(d => d.attached('SLUDGE').size > 0) },
    desc: 'Flush the Toxic Sludge',
    func: ev => {
      gameState.hq.each(d => {
        d.attached('SLUDGE').size && d.limit(isHero).each(c => KOEv(ev, c));
        d.attached('SLUDGE').each(c => KOEv(ev, c));
      });
      eachPlayer(p => gainWoundEv(ev, p));
    },
  })];
  addStatSet('recruitCost', c => c.attached('SLUDGE').size > 0, (c, v) => ({ recruit: (v.recruit || 0) + c.location.attached('SLUDGE').size * 2, ...v}));
}),
// SETUP: 7 Twists, representing "Cyberspace."
// RULE: Enemies under any Cyberspace get +1 Attack for each Cyberspace on the board, and they can be fought with any combination of Recruit and Attack.
makeSchemeCard("Pull Reality into Cyberspace", { twists: 7 }, ev => {
  if (ev.nr <= 5) {
    // Twist 1-5 Put this Cyberspace above the rightmost city space that isn't yet under Cyberspace.
    gameState.city.limit(d => d.attached('CYBERSPACE').size === 0).withLast(d => {
      attachCardEv(ev, ev.twist, d, 'CYBERSPACE');
    });
  } else if (ev.nr === 6) {
    // Twist 6 Put this Cyberspace above the Mastermind.
    attachCardEv(ev, ev.twist, gameState.mastermind, 'CYBERSPACE');
  } else if (ev.nr === 7) {
    // Twist 7 Evil Wins!
  }
  schemeProgressEv(ev, ev.nr);
}, [], () => {
  setSchemeTarget(7);
  addStatMod('defense', c => c.attached('CYBERSPACE').size > 0, () => [gameState.mastermind, ...gameState.city].count(d => d.attached('CYBERSPACE').size > 0));
  addStatSet('fightCost', c => c.attached('CYBERSPACE').size > 0, (c, v) => ({
    either: (v.recruit || 0) + (v.attack || 0), recruit: 0, attack: 0, ...v
  }));
}),
// SETUP: Add an extra Hero. 11 Twists.
// {POWER Strength} <b>Green Globe</b>: Each player discards a card with a Recruit icon.
// {POWER Instinct} <b>Alchemax</b>: Each player discards a [Instinct] Hero or gains a Wound.
// {POWER Covert} <b>Public Eye</b>: Each player discards two cards, then draws a card.
// {POWER Tech} <b>D/MONIX</b>: Each player discards a card with an Attack icon.
// {POWER Ranged} <b>Stark-Fujikawa</b>: A Villain from your Victory Pile reenters the city.
// EVILWINS: When a single Mega-Corp has 3 Dominations.
makeSchemeCard("Subjugate Earth with Mega-Corporations", { twists: 8, heroes: [4, 6, 6, 6, 7] }, ev => {
  // Twist: Put the Hero from the HQ space under the Bank into a "Mega-Corp Domination" Stack matching its Hero Class <i>(off of the board)</i>.
  // Do the listed effect for that Mega-Corp.
  withCity('BANK', bank => bank.above.each(c => {
    const megaCorp = (corp: number) => {
      let corpNames = new Map([
        [Color.STRENGTH, "Green Globe"],
        [Color.INSTINCT, "Alchemax"],
        [Color.COVERT, "Public Eye"],
        [Color.TECH, "D/MONIX"],
        [Color.RANGED, "Stark-Fujikawa"],
      ]);
      attachCardEv(ev, c, gameState.scheme, corpNames.get(corp));
      cont(ev, () => schemeProgressEv(ev, [...corpNames.values()].max(n => gameState.scheme.attachedDeck(n).size)));
      if (corp == Color.STRENGTH) {
        eachPlayer(p => pickDiscardEv(ev, 1, p, hasRecruitIcon));
      } else if (corp == Color.INSTINCT) {
        eachPlayer(p => selectCardOrEv(ev, "Choose a Hero to discard", handOrDiscard(p).limit(Color.INSTINCT), c => discardEv(ev, c), () => gainWoundEv(ev, p)));
      } else if (corp == Color.COVERT) {
        eachPlayer(p => pickDiscardEv(ev, 2, p));
        eachPlayer(p => drawEv(ev, 1, p));
      } else if (corp == Color.TECH) {
        eachPlayer(p => pickDiscardEv(ev, 1, p, hasAttackIcon));
      } else if (corp == Color.RANGED) {
        selectCardEv(ev, "Choose a Villain to reenter the city", playerState.victory.limit(isVillain), c => enterCityEv(ev, c));
      }
    };
    isMuliColor(c) ? chooseClassEv(ev, megaCorp, c1 => (c1 & c.color) !== 0) : megaCorp(c.color);
  }));
}, [], () => {
  setSchemeTarget(3);
}),
]);
addTemplates("SCHEMES", "Weapon X", [
// SETUP: 8 Twists. Include exactly 1 Hero with Wolverine or Logan in its name.
makeSchemeCard("Condition Logan into Weapon X", { twists: 8, required: { heroes: "Wolverine|Wolverine@Dark City|Colossus & Wolverine|Weapon X (Wolverine)|Old Man Logan"} }, ev => { // TODO exactly one required
  if (ev.nr === 1 || ev.nr === 3 || ev.nr === 5) {
    // <b>Twist 1,3,5</b>: <i>"Induce Violent Rage"</i>: If you don't defeat an Enemy worth 2 VP or more this turn, then after you draw a new hand at
    // the end of this turn, each player discards down to four cards.
    addTurnTrigger('CLEANUP', () => true, () => {
      pastEvents('DEFEAT').has(ev => ev.what.vp >= 2) || eachPlayer(p => pickDiscardEv(ev, -4, p));
    });
  } else if (ev.nr === 2 || ev.nr === 4 || ev.nr === 6) {
    // <b>Twist 2,4,6</b>: <i>"Test the Subject's Healing Factor"</i>: Each player discards a [Strength] or [Instinct] Hero or gains a Wound.
    eachPlayer(p => selectCardOrEv(ev, "Choose a Hero to discard", p.hand.limit(Color.STRENGTH | Color.INSTINCT), c => discardEv(ev, c), () => gainWoundEv(ev, p)));
  } else if (ev.nr === 7) {
    // Twist 7 <i>"Unleash Weapon X"</i>: For each Wolverine and/or Logan Hero in the HQ, each player gains a Wound.
    const count = hqHeroes().limit(c => c.heroName.includes("Wolverine") || c.heroName.includes("Logan")).size;
    count && eachPlayer(p => repeat(count, () => gainWoundEv(ev, p)));
  } else if (ev.nr === 8) {
    // Twist 8 Evil Wins!
  }
  schemeProgressEv(ev, ev.nr);
}, [], () => {
  setSchemeTarget(8);
}),
// SETUP: Add an extra Hero. Don't use multiple Heroes that have the same Hero Name. 1 player: 8 Twists. 2-4 players: 10 Twists. 5 players: 11 Twists.
// Set aside a lowest-cost card for each Hero Name, face up, with 2 face up Bystanders under it as "Loved Ones."
// EVILWINS: When the Hero Deck runs out.
makeSchemeCard("Go After Heroes' Loved Ones", { twists: [ 8, 10, 10, 10, 11 ], heroes: [ 4, 6, 6, 6, 7] }, ev => {
  const effect = () => {
    hqHeroes().withFirst(c => {
      KOEv(ev, c);
      gameState.scheme.attached('HEROES').limit(c => c.heroName === c.heroName).map(c => c.attachedDeck('LOVED_ONES')).withFirst(lovedOnes => {
        lovedOnes.withFirst(c => KOEv(ev, c));
        eachPlayer(p => pickDiscardEv(ev, 1, p, c1 => c1.heroName === c.heroName));
        playerState.hand.has(c1 => c1.heroName === c.heroName) && berserkEv(ev, 1);
        cont(ev, () => {
          if (lovedOnes.size === 0) {
            gameState.herodeck.shuffle();
            gameState.herodeck.limit(c => c.heroName === c.heroName).each(c => KOEv(ev, c));
            hqHeroes().limit(c => c.heroName === c.heroName).each(c => KOEv(ev, c));
          }
        });
      });
    });
  }
  if (ev.nr <= 6) {
    // Twist 1-6 KO the Hero in the rightmost HQ space. KO one of that Hero Name's Loved Ones.
    // Each player discards a card of that Hero Name. If you discard a card this way during your turn, you {BERSERK}.
    // If that Hero Name has no more Loved Ones, that Hero is "Lost in Grief": KO all of that Hero Name from the HQ and Hero Deck, then shuffle it.
    cont(ev, effect);
  } else if (ev.nr >= 7 && ev.nr <= 11) {
    // Twist 7-11 Do that Twist effect twice.
    cont(ev, effect);
    cont(ev, effect);
  }
}, [
  runOutProgressTrigger('HERO', false),
], () => {
  setSchemeTarget(gameState.herodeck.size);
  const heroNames = gameState.herodeck.limit(isHero).unique(c => c.heroName);
  heroNames.forEach(h => {
    const c = gameState.herodeck.limit(c => c.heroName === h).highest(c => -c.cost)[0];
    moveCard(gameState.bystanders.top, c.attachedDeck('LOVED_ONES'));
    moveCard(gameState.bystanders.top, c.attachedDeck('LOVED_ONES'));
    moveCard(c, gameState.scheme.attachedDeck('HEREOS'));
  });
  gameState.herodeck.shuffle();
}),
// SETUP:  Twists equal to the number of players plus 4.
// RULE: Face down cards in your Victory Pile count as not being there at all until you count their VP at game end.
// EVILWINS: When there are 4 Total Memory Wipes.
makeSchemeCard("Wipe Heroes' Memories", { twists: [ 5, 6, 7, 8, 9 ] }, ev => {
  selectCardOrEv(ev, "Choose a Villain or Tactic to forget", playerState.victory.limit(c => isTactic(c) || isVillain(c)), c => {
    // Twist: You "forget your past": If you have any face up Villains or Tactics in your Victory Pile,
    // put one of them on the bottom of your Victory Pile face down, then shuffle this Twist back into the Villain Deck,
    // then play a card from the Villain Deck.
    attachCardEv(ev, c, playerState.victory, 'FORGOTTEN');
    shuffleIntoEv(ev, ev.twist, gameState.villaindeck);
    playAnotherEv(ev);
  }, () => {
    // If you didn't have any face up Villains or Tactics, then instead stack this Twist next to the Scheme as a "Total Memory Wipe."
    attachCardEv(ev, ev.twist, gameState.scheme, 'MEMORY_WIPE');
    cont(ev, () => schemeProgressEv(ev, gameState.scheme.attached('MEMORY_WIPE').size));
  });
}, [], () => {
  setSchemeTarget(4);
}),
]);
