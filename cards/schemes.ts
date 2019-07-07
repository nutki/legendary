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
  ev.another = true;
}, escapeProgressTrigger(isBystander), () => {
  addStatMod('defense', isVillain, c => c.captured.count(isBystander));
  setSchemeTarget(8);
}),
// SETUP: 8 Twists. Add an extra Henchman group to the Villain Deck.
// EVILWINS: If 12 Villains escape.
// Single player version based on https://boardgamegeek.com/thread/1567774/negative-zone-prison-break-out-advanced-solo
makeSchemeCard("Negative Zone Prison Breakout", { twists: 8, vd_henchmen_counts: [ [10], [10, 10], [10, 10], [10, 10, 10], [10, 10, 10] ], vd_villain: [ 2, 2, 3, 3, 4 ]  }, ev => {
  // Twist: Play the top 2 cards of the Villain Deck.
  villainDrawEv(ev); villainDrawEv(ev);
}, escapeProgressTrigger(isVillain), () => setSchemeTarget(gameState.players.length === 1 ? 8 : 12)),
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
  addStatSet('defense', isKillbot, () => gameState.scheme.attached('TWIST').size);
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
  addStatSet('defense', isSkrull, c => c.cost + 2);
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
  const hopeTemplate = new Card("BABYHOPE", "Baby Hope");
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
    attachCardEv(ev, ev.parent.what, ev.parent.what.location, "EXPLOSION");
    cont(ev, () => schemeProgressEv(ev, gameState.hq.count(d => d.attachedDeck("EXPLOSION").size >= 6)));
  },
}, runOutProgressTrigger("HERO", false), {
  event: "MOVECARD",
  match: ev => ev.to.isHQ && ev.to.attachedDeck("EXPLOSION").size >= 6,
  replace: () => {},
}], () => {
  setSchemeTarget(gameState.hq.size);
}),
// SETUP: 8 Twists.
// EVILWINS: When the number of non grey Heroes in the KO pile is 3 times the number of players.
makeSchemeCard("Massive Earthquake Generator", { twists: 8 }, ev => {
  // Twist: Each player reveals a [Strength] Hero or KOs the top card of their deck.
  eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => lookAtDeckEv(ev, 1, () => p.revealed.withLast(c => KOEv(ev, c)), p), p));
}, koProgressTrigger(isNonGrayHero), () => {
  setSchemeTarget(3, true);
}),
// SETUP: 8 Twists. Include 10 Maggia Goons as one of the Henchman Groups.
// RULE: Goons also have the ability "Ambush: Play another card from the Villain Deck."
// EVILWINS: When 5 Goons escape.
makeSchemeCard<{isGoon: (c: Card) => boolean}>("Organized Crime Wave", { twists: 8, vd_henchmen_counts: [[10], [10], [10], [10, 10], [10, 10]], required: { henchmen: "Maggia Goons" } }, ev => {
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
  addStatSet('defense', isGoblinQueen, c => c.cost + demonGoblins.size);
  addStatSet('vp', isGoblinQueen, () => 4);
  addStatSet('defense', isDemonGoblin, () => 2);
  addStatSet('fight', isDemonGoblin, () => ev => rescueEv(ev, ev.source));
  addStatSet('isVillain', isGoblinQueen, () => true);
  gameState.specialActions = (ev) => {
    const what = demonGoblins.top;
    return what && [ fightActionEv(ev, what) ];
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
}, escapeProgressTrigger(isNonGrayHero), () => {
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
  addStatSet('fightCost', isMastermind, (c, { either, ...rest }) => ({ either: either + c.location.attached("FORCEFIELD").size, ...rest}));
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
  addStatSet('fightCost', undefined, (c, base) => s.neg ? {
    ...base,
    attack: base.recruit,
    rectuit: base.attack,
  } : base);
  addStatSet('recruitCost', undefined, (c, base) => s.neg ? {
    ...base,
    attack: base.recruit,
    rectuit: base.attack,
  } : base);
}),
]);
addTemplates("SCHEMES", "Paint the Town Red", [
// SETUP: 8 Twists.
// EVILWINS: When 2 Villains with the same card name have escaped or the Villain Deck runs out.
makeSchemeCard("The Clone Saga", { twists: 8 }, ev => {
  // Twist: Each player reveals two non-grey Heroes with the same card name or discards down to 3 cards.
  // TODO multiplayer reveal
  eachPlayer(p => revealOrEv(ev, c => p.hand.deck.count(cc => cc.cardName === c.cardName) >= 2, () => selectObjectsEv(ev, "Choose cards to discard", p.hand.size - 3, p.hand.deck, sel => discardEv(ev, sel), p), p));
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
makeSchemeCard("Invade the Daily Bugle News HQ", { twists: 8, vd_henchmen_counts: [[3, 6], [10, 6], [10, 6], [10, 10, 6], [10, 10, 6]] }, ev => {
  // Twist: KO a Hero from the HQ. Put the highest-Attack Villain from the city into that HQ space.
  let space: Deck;
  addTurnTrigger('MOVECARD', ev => space && ev.to === space && ev.from === gameState.herodeck, { replace: ev => {
    selectCardEv(ev, "Choose a highest cost Villain", cityVillains().highest(c => c.defense), c => moveCardEv(ev, c, space));
  }});
  selectCardEv(ev, "Select a Hero to KO", hqHeroes(), c => { KOEv(ev, c); space = c.location; });  
  cont(ev, () => space = undefined);
}, {
  event: 'MOVECARD',
  match: ev => ev.to.isHQ,
  after: ev => schemeProgressEv(ev, hqCards().count(isVillain)),
}, () => {
  setSchemeTarget(5);
  gameState.villaindeck.deck.filter(c => c.cardName === extraHenchmenName()).each(c => moveCard(c, gameState.herodeck));
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
  attachCardEv(ev, ev.source, gameState.mastermind, "TWIST");
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
makeSchemeCard("Cage Villains in Power-Suppressing Cells", { twists: 8, vd_henchmen_counts: [[3, 2], [10, 4], [10, 6], [10, 10, 8], [10, 10, 10]], required: { henchmen: 'Cops' } }, ev => {
  // Twist: Each player returns all Cops from their Victory Pile to the Cop Stack. Then each player puts a non-grey Ally from their hand in front of them. Put a Cop from the Cop Stack on top of each of those Allies.
  const copStack = gameState.scheme.attachedDeck('COPS');
  eachPlayer(p => p.victory.each(c => moveCardEv(ev, c, copStack)));
  eachPlayer(p => selectCardEv(ev, "Choose a non-grey Ally", p.hand.deck, c => {
    schemeProgressEv(ev, copStack.size); 
    copStack.withTop(cop => {
      attachCardEv(ev, c, cop, "CAGED");
      attachCardEv(ev, cop, p.deck, "COPS");
    });
  }, p));
}, [], () => {
  const copStack = gameState.scheme.attachedDeck('COPS');
  gameState.villaindeck.limit(c => c.villainGroup === 'Cops').each(c => moveCard(c, copStack));
  gameState.schemeProgress = copStack.size + 1;
  gameState.specialActions = ev => playerState.deck.attached('COPS').map(c => fightActionEv(ev, c));
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
  locations.each(l => withCity(l, d => cont(ev, () => gameState.scheme.attachedDeck("SPIES").withTop(c => attachCardEv(ev, c, d.below, "SPIES")))));
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
makeSchemeCard("Mass Produce War Machine Armor", { twists: 8, vd_henchmen_counts: [[10], [10], [10], [10, 10], [10, 10]], required: { henchmen: 'S.H.I.E.L.D. Assault Squad' } }, ev => {
  // Twist: Stack this Twist next to the Plot as "War Machine Technology." An Assault Squad from the current player's Victory Pile enters the Bridge.
  attachCardEv(ev, ev.source, gameState.scheme, 'TWIST');
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
    selectCardEv(ev, "Select an Adversary", playerState.victory.limit(isVillain), c => villainDrawEv(ev, c));
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
  eachPlayer(p => selectCardEv(ev, "Choose an Infinity Gem", p.artifact.limit(isGroup("Infinity Gems")), c => villainDrawEv(ev, c), p));
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
  shuffleIntoEv(ev, ev.source, negabomb);
  revealDeckEv(ev, negabomb, 1, cards => {
    cards.limit(isBystander).each(c => rescueEv(ev, c));
    cards.limit(isTwist).each(c => {
      KOEv(ev, c);
      hqHeroes().each(c => KOEv(ev, c));
      eachPlayer(p => gainWoundEv(ev, p));
    });
  });
}, escapeProgressTrigger(isNonGrayHero), () => {
  setSchemeTarget(16);
  const negabomb = gameState.scheme.attachedDeck("NEGABOMB");
  repeat(6, () => gameState.bystanders.withTop(c => moveCard(c, negabomb)));
}),
// SETUP: 8 Twists. Always include Kree Starforce and Skrull Villain Groups.
// EVILWINS: When there are 4 Kree Conquests or 4 Skrull Conquests.
makeSchemeCard("The Kree-Skrull War", { twists: 8, vd_villain: [2, 2, 3, 3, 4], required: { villains: ['Kree Starforce', 'Skrull']} }, ev => {
  const kLoc = gameState.mastermind;
  const sLoc = gameState.villaindeck;
  if (ev.nr <= 7) {
    // Twist 1-7 All Kree and Skrulls escape from the city. Then, if there are more Kree than Skrulls in the Escape Pile, stack this Twist next to the Mastermind as a Kree Conquest. If there are more Skrulls than Kree in the Escape Pile, stack this Twist next to the Villain Deck as a Skrull Conquest.
    cityVillains().limit(c => isGroup("Kree Starforce")(c) || isGroup("Skrull")(c)).each(c => villainEscapeEv(ev, c));
    cont(ev, () => {
      const k = gameState.escaped.count(isGroup("Kree Starforce"));
      const s = gameState.escaped.count(isGroup("Skrull"));
      k > s && attachCardEv(ev, ev.source, kLoc, "CONQUEST");
      s > k && attachCardEv(ev, ev.source, sLoc, "CONQUEST");
    });
  } else if (ev.nr === 8) {
  // Twist 8 Stack this Twist on the side with the most Conquests.
    const kCount = kLoc.attached("CONQUEST").size;
    const sCount = sLoc.attached("CONQUEST").size;
    attachCardEv(ev, ev.source, kCount > sCount ? kLoc : sLoc, "CONQUEST")
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
  attachCardEv(ev, ev.source, gameState.scheme, 'TWIST');
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
  cont(ev, () => gameState.hq.withLast(d => { destroyHQ(d); d.each(c => KOEv(ev, c)); }));
  cont(ev, () => schemeProgressEv(ev, gameState.hq.size));
}, [], () => {
  const extraLair = [new Deck("HQ11", true), new Deck("HQ12", true), new Deck("HQ13", true)];
  extraLair.each(d => d.isHQ = true);
  gameState.hq = [...gameState.hq, ...extraLair];
  gameState.schemeProgress = 8;
}),
// SETUP: 6 Twists.
// RULE: While an Adversary is on the Rooftops, it gets +1 Attack for each StarkTech Defenses.
// EVILWINS: When there are 13 non-grey Allies in the KO pile.
makeSchemeCard("Last Stand at Avengers Tower", { twists: 6 }, ev => {
  // Twist: Stack this Twist above the Rooftops as StarkTech Defenses. If there is an Adversary on the Rooftops, choose 3 Allies from the Lair and KO them.
  withCity('ROOFTOPS', rooftops => rooftops.has(isVillain) && selectObjectsEv(ev, "Select Allies to KO", 3, hqHeroes() ,c => KOEv(ev, c)))
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
makeSchemeCard("Build an Army of Annihilation", { twists: 9, vd_henchmen_counts: [ [3, 10], [10, 10], [10, 10], [10, 10, 10], [10, 10, 10]], required: { henchmen: 'Annihilation Wave' } }, ev => {
  // Twist: KO all Annihilation Henchmen from the players' Victory Piles. Stack this Twist next to the Scheme. Then, for each Twist in that stack, put an Annihilation Henchman from the KO pile next to the Mastermind. Players can fight those Henchmen.
  eachPlayer(p => p.victory.limit(c => c.cardName === 'Annihilation Wave').each(c => KOEv(ev, c)));
  attachCardEv(ev, ev.source, gameState.scheme, "TWIST");
  cont(ev, () => {
    const w = gameState.ko.limit(c => c.cardName === 'Annihilation Wave');
    const n = gameState.scheme.attached('TWIST').size;
    w.forEach((c, i) => i < n && attachCardEv(ev, c, gameState.mastermind, 'WAVE'));
  });
  cont(ev, () => schemeProgressEv(ev, gameState.mastermind.attached('WAVE').size));
}, [], () => {
  setSchemeTarget(10);
  gameState.villaindeck.limit(c => c.cardName === 'Annihilation Wave').each(c => moveCard(c, gameState.ko));
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
  addStatSet('defense', isSidekick, c => c.cost + 2);
  addStatSet('isVillain', isSidekick, c => !owner(c));
  addStatSet('fight', isSidekick, () => (ev: Ev) => gainToDeckEv(ev, ev.source));
  repeat(10, () => gameState.sidekick.withTop(c => moveCard(c, gameState.villaindeck)));
}),
// SETUP: 5 Twists. If playing solo, add an extra Villain Group.
// EVILWINS: When 8 Master Strikes have taken effect.
makeSchemeCard("Crush Them With My Bare Hands", { twists: 5, vd_villain: [ 2, 2, 3, 3, 4 ] }, ev => {
  // Twist: This Twist becomes a Master Strike that takes effect immediately.
  playStrikeEv(ev, ev.source);
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
makeSchemeCard("Fragmented Realities", { twists: [ 2, 4, 6, 8, 10 ], vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist: Play two card from your Villain Deck
  villainDrawEv(ev);
  villainDrawEv(ev);
}, [
  koProgressTrigger(isNonGrayHero),
  {
    event: 'VILLAINDRAW', // TODO turn start
    before: ev => {
      gameState.cityEntry = gameState.city[playerState.nr];
      swapDecks(gameState.villaindeck, gameState.villaindeck.attachedDeck('REALITY' + playerState.nr));
    }
  },
  {
    event: 'CLEANUP',
    after: ev => swapDecks(gameState.villaindeck, gameState.villaindeck.attachedDeck('REALITY' + playerState.nr)),
  }
], () => {
  const num = gameState.players.size;
  const vd = gameState.villaindeck;
  while(gameState.city.length) destroyCity(gameState.city[0]);
  gameState.city = gameState.players.map((p, i) => {
    const l = new Deck('CITY' + i, true);
    l.isCity = true;
    return l;
  });
  vd.limit(isTwist).forEach((c, i) => moveCard(c, vd.attachedDeck('REALITY' + (i % num))));
  vd.deck.forEach((c, i) => moveCard(c, vd.attachedDeck('REALITY' + (i % num))));
  swapDecks(vd, vd.attachedDeck('REALITY0'));
  setSchemeTarget(5, true);
}),
// SETUP: 8 Twists. Choose 3 other Masterminds, and shuffle their 12 Tactics into the Villain Deck. Those Tactics are "Tyrant Villains" with their printed Attack and no abilities.
// EVILWINS: When 5 Tyrant Villains escape.
makeSchemeCard("Master of Tyrants", { twists: 8, extra_masterminds: 3 }, ev => {
  if (ev.nr <= 7) {
    // Twist 1-7 Put this Twist under a Tyrant Villain as "Dark Power." It gets +2 Attack.
    selectCardEv(ev, 'Choose Tyrant Villain', cityVillains().limit(isTactic), c => attachCardEv(ev, ev.source, c, 'DARK_POWER'));
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
  addStatSet('fight', isTyrant, c => []);
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
  const secondCity = [0, 1, 2].map(i => {
    const l = new Deck('CITY' + i, true);
    l.isCity = true;
    return l;
  });
  secondCity[2].next = secondCity[1];
  secondCity[1].next = secondCity[0];
  makeCityAdjacent(secondCity);
  destroyCity(gameState.city[4]);
  destroyCity(gameState.city[3]);
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
  };
  if (ev.nr <= 7) {
    // Twist 1-7 The Villain in the city or Escape Pile with the highest printed Attack ascends to become a new Mastermind. It gets +2 Attack. It gains the ability "<b>Master Strike</b>: Each Player discards a card with cost equal to this Mastermind's printed VP." <i>(Keep them separate from any Villains who ascend through Escape effects.)</i>
    selectCardEv(ev, "Choose a Villain", gameState.escaped.limit(isVillain).highest(c => c.printedAttack), ascend);
  } else if (ev.nr === 8) {
    // Twist 8 The Villain in each player's Victory Pile with the highest printed Attack ascends the same way.
    eachPlayer(p => selectCardEv(ev, "Choose a Villain", p.victory.limit(isVillain).highest(c => c.printedAttack), ascend));
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
  moveCardEv(ev, ev.source, gameState.villaindeck, true);
}, escapeProgressTrigger(isVillain), () => {
  setSchemeTarget(3, true);
  addStatSet('fight', isVillain, (c, prev) => combineHandlers(prev, fatefulResurrectionEv));
  addStatSet('fight', isTactic, (c, prev) => combineHandlers(prev, ev => fatefulResurrectionTacticEv(ev, () => {})));
}),
// SETUP: 8 Twists.
makeSchemeCard("The God-Emperor of Battleworld", { twists: 8 }, ev => {
  if (ev.nr === 1) {
    // Twist 1 This Scheme ascends to becomes (sic) a new 9-Attack "God-Emperor" Mastermind worth 9 VP. It has "<b>Master Strike</b>: Each player with exactly six cards in hand reveals a [Tech] Hero or puts two cards from their hand on top of their deck."
    moveCardEv(ev, ev.source, gameState.mastermind);
    addStatSet('strike', c => c === ev.source, () => ev => {
      eachPlayer(p => p.hand.size === 6 && revealOrEv(ev, Color.TECH, () => {
        selectObjectsEv(ev, "Put two cards on top of your deck", 2, p.hand.deck, c => moveCardEv(ev, c, p.deck), p);
      }))
    });
    addStatSet('vp', c => c === ev.source, () => 9);
    addStatSet('defense', c => c === ev.source, () => 9 + 2 * gameState.scheme.attached('TWIST').size);
  } else if (ev.nr >= 2 && ev.nr <= 6) {
    // Twist 2-6 Stack this Twist next to the Scheme. The God-Emperor gets another +2 Attack.
    attachCardEv(ev, ev.source, gameState.scheme, 'TWIST');
  } else if (ev.nr === 7) {
    // Twist 7 If the God-Emperor lives, it KOs all other Masterminds.
    fightableCards().includes(ev.source) && fightableCards().limit(isMastermind).limit(c => c !== ev.source).each(c => KOEv(ev, c)); // TODO detach on KO
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
  addStatSet('defense', isExtra, c => c.cost * (isLocation(c.location, 'SEWERS', 'ROOFTOPS', 'BRIDGE') ? 2 : 1));
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
  attachCardEv(ev, ev.source, gameState.scheme, 'TWIST');
}, escapeProgressTrigger(isVillain), () => {
  addStatSet('nthCircle', isEnemy, (c, prev) => Math.max(prev || 0, gameState.scheme.attached('TWIST').size));
  gameState.specialActions = ev => fightableCards().map(c => nthCircleRevealAction(c, ev));
  setSchemeTarget(2, true);
}),
// SETUP: 8 Twists.
makeSchemeCard("Secret Wars", { twists: 8, extra_masterminds: 3 }, ev => {
  if (ev.nr <= 3) {
    // Twist 1-3 Add another random Mastermind to the game with one Tactic.
    gameState.scheme.attached('EXTRAMASTERMINDS').withRandom(m => moveCardEv(ev, m, gameState.mastermind));
  }
  // Twist 8 Evil wins!
  schemeProgressEv(ev, ev.nr);
}, [], () => {
  setSchemeTarget(8);
  while(gameState.mastermind.size > 1) gameState.mastermind.withTop(m => {
    moveCard(m, gameState.scheme.attachedDeck('EXTRAMASTERMINDS'));
    while (m.attached('TACTICS').size > 1) m.attached('TACTICS').withFirst(c => moveCard(c, gameState.scheme.attachedDeck('EXTRATACTICS')));
  });
}),
// SETUP: 6 Twists. Add 10 random Ambition cards to the Villain Deck.
// RULE: Ambition cards are Villains with their printed Attack. Add +1 Attack for each Twist stacked next to the Scheme. They are worth 4 VP. Whenever an Ambition Villain escapes, do its Ambition effect.
// EVILWINS: When 4 Ambition Villains escape.
makeSchemeCard("Sinister Ambitions", { twists: 6 }, ev => {
  if (ev.nr <= 5) {
    // Twist 1-5 Stack this Twist next to the Scheme. Play another card from the Villain Deck.
    attachCardEv(ev, ev.source, gameState.scheme, 'TWIST');
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
    attachCardEv(ev, ev.source, gameState.scheme, 'TWIST');
    villainDrawEv(ev);
  } else if (ev.nr === 7) {
    // Twist 7 All S.H.I.E.L.D. Officers in the city escape.
    cityVillains().limit(c => c.cardName === 'S.H.I.E.L.D. Officer').each(c => villainEscapeEv(ev, c));
  }
}, escapeProgressTrigger(c => c.cardName === 'S.H.I.E.L.D. Officer'), () => {
  setSchemeTarget(5);
  const isOfficer = (c: Card) => c.cardName === 'S.H.I.E.L.D. Officer';
  repeat(12, () => moveCard(gameState.officer.top, gameState.villaindeck));
  addStatMod('defense', isOfficer, c => 3 + gameState.scheme.attached('TWIST').size);
  addStatSet('isVillain', isOfficer, () => true);
  addStatSet('fight', isOfficer, () => (ev: Ev) => gainEv(ev, ev.source));
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
    gameState.city === ev.state.city.slice(-size);
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
  const extraSpace = new Deck("EXTRACITY", true);
  s.city = [extraSpace].concat(gameState.city);
}),
// SETUP: 9 Twists. 8 Heroes in Hero deck.
// RULE: Whenever a Hero is in the HQ whose Hero Name has been Purged from the Timestream, KO that Hero.
// EVILWINS: When the Hero Deck runs out.
makeSchemeCard("Go Back in Time to Slay Heroes' Ancestors", { twists: 9, heroes: 8 }, ev => {
  // Twist: Put a Hero form the HQ next to the Scheme, "Purged from the Timestream."
  selectCardEv(ev, "Select a Hero to purge from the Timestream", hqHeroes(), c => {
    attachCardEv(ev, c, gameState.scheme, 'PURGED');
    cont(ev, () => hqHeroes().each(c => gameState.scheme.attached('PURGED').map(c => c.heroName).includes(c.heroName)));
  });
}, [ runOutProgressTrigger("HERO"), {
  event: 'MOVECARD',
  match: ev => isHero(ev.what) && ev.to.isCity && gameState.scheme.attached('PURGED').map(c => c.heroName).includes(ev.what.heroName),
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
    gameState.scheme.attachedDeck('CODE').shuffle();
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
    gameState.scheme.attachedDeck('CODE').each(c => {
      chooseColorEv(ev, col => allGood = allGood && c.isColor(col));
      attachCardEv(ev, c, gameState.scheme, 'DECODED');
    });
    cont(ev, () => {
      if (allGood) {
        doReplacing(ev);
      } else {
        gameState.scheme.attachedDeck('DECODED').each(c => attachCardEv(ev, c, gameState.scheme, 'CODE'));
        gameState.scheme.attachedDeck('CODE').shuffle();
        turnState.endofturn = true;
      }
    });
  }
}], () => {
  setSchemeTarget(6);
}),
]);
