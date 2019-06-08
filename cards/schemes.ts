"use strict";
addTemplates("SCHEMES", "Legendary", [
// SETUP: 8 Twists. Wound stack holds 6 Wounds per player.
// EVILWINS: If the Wound stack runs out.
makeSchemeCard("The Legacy Virus", { twists: 8, wounds: [ 6, 12, 18, 24, 30 ] }, ev => {
  // Twist: Each player reveals a [Tech] Hero or gains a Wound.
  eachPlayer(p => revealOrEv(ev, Color.BLACK, () => gainWoundEv(ev, p), p));
}, {
  event: "RUNOUT",
  match: ev => ev.deckName === "WOUNDS",
  after: evilWinsEv,
}),
// SETUP: 8 Twists. 12 total Bystanders in the Villain Deck.
// RULE: Each Villain gets +1 Attack for each Bystander it has.
// EVILWINS: When 8 Bystanders are carried away by escaping Villains.
makeSchemeCard("Midtown Bank Robbery", { twists: 8, vd_bystanders: 12 }, ev => {
  // Twist: Any Villain in the Bank captures 2 Bystanders. Then play the top card of the Villain Deck.
  villainIn('BANK').each(v => { captureEv(ev, v); captureEv(ev, v); });
  ev.another = true;
}, {
  event: "ESCAPE",
  after: ev => schemeProgressEv(ev, 8 - gameState.escaped.count(isBystander)),
}, () => {
  addStatMod('defense', isVillain, c => c.captured.count(isBystander));
  gameState.schemeProgress = 8;
}),
// SETUP: 8 Twists. Add an extra Henchman group to the Villain Deck.
// EVILWINS: If 12 Villains escape.
// Single player version based on https://boardgamegeek.com/thread/1567774/negative-zone-prison-break-out-advanced-solo
makeSchemeCard("Negative Zone Prison Breakout", { twists: 8, vd_henchmen_counts: [ [10], [10, 10], [10, 10], [10, 10, 10], [10, 10, 10] ], vd_villain: [ 2, 2, 3, 3, 4 ]  }, ev => {
  // Twist: Play the top 2 cards of the Villain Deck.
  villainDrawEv(ev); villainDrawEv(ev);
}, {
  event: "ESCAPE",
  after: ev => schemeProgressEv(ev, (gameState.players.length === 1 ? 8 : 12) - gameState.escaped.count(isVillain)),
}),
// SETUP: 7 Twists. Each Twist is a Dark Portal.
makeSchemeCard("Portals to the Dark Dimension", { twists: 7 }, ev => {
  if (ev.nr === 1) { // Twist 1 Put the Dark Portal above the Mastermind. The Mastermind gets +1 Attack.
    attachCardEv(ev, ev.twist, gameState.mastermind, 'DARK_PORTAL');
  } else if (ev.nr >= 2 && ev.nr <= 6) { // Twists 2-6 Put the Dark Portal in the leftmost city space that doesn't yet have a Dark Portal. Villains in that city space get +1 Attack.
    attachCardEv(ev, ev.twist, gameState.city[ev.nr - 2], 'DARK_PORTAL');
  } else if (ev.nr === 7) { // Twist 7 Evil Wins!
    evilWinsEv(ev);
  }
}, [], () => {
  addStatMod('defense', isEnemy, c => c.location.attached('DARK_PORTAL').size);
}),
// SETUP: 5 Twists. 3 additional Twists next to this Scheme. 18 total Bystanders in the Villain Deck.
// RULE: Bystanders in the Villain Deck count as Killbot Villains, with Attack equal to the number of Twists next to this Scheme.
// EVILWINS: If 5 "Killbots" escape.
makeSchemeCard("Replace Earth's Leaders with Killbots", { twists: 5, vd_bystanders: 18 }, ev => {
  // Twist: Put the Twist next to this Scheme.
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
}, {
  event: "ESCAPE",
  after: ev => schemeProgressEv(ev, 5 - gameState.escaped.count(isBystander)),
}, function () {
  let isKillbot = (c: Card) => isBystander(c) && (c.location && (c.location.isCity || c.location.id === "VILLAIN")); // TODO isCity => fightable?
  gameState.scheme.attachedDeck('TWIST').addNewCard(twistTemplate, 3);
  addStatSet('defense', isKillbot, () => gameState.scheme.attached('TWIST').size);
  addStatSet('isVillain', isKillbot, () => true);
  addStatSet('villainGroup', isKillbot, () => "Killbots");
  gameState.schemeProgress = 5;
}),
// SETUP: 8 Twists. 6 Heroes. Skrull Villain Group required. Shuffle 12 random Heroes from the Hero Deck into the Villain Deck.
// RULE: Heroes in the Villain Deck count as Skrull Villains with Attack equal to the Hero's Cost +2. If you defeat that Hero, you gain it.
// EVILWINS: If 6 Heroes get into the Escaped Villains pile.
makeSchemeCard("Secret Invasion of the Skrull Shapeshifters", { twists: 8, heroes: 6, required: { villains: "Skrulls" } }, ev => {
  // Twist: The highest-cost Hero from the HQ moves into the Sewers as a Skrull Villain, as above.
  withCity("SEWERS", d => selectCardEv(ev, "Choose a Hero to become a Skull", HQCardsHighestCost(), sel => moveCardEv(ev, sel, d)));
}, {
  event: "ESCAPE",
  after: ev => schemeProgressEv(ev, 6 - gameState.escaped.count(isHero)),
}, function () {
  let isSkrull = (c: Card) => isHero(c) && (c.location && (c.location.isCity || c.location.id === "VILLAIN"));  // TODO isCity => fightable?
  addStatSet('defense', isSkrull, c => c.cost + 2);
  addStatSet('isVillain', isSkrull, () => true);
  addStatSet('villainGroup', isSkrull, () => "Skrulls");
  addStatSet('fight', isSkrull, () => (ev: Ev) => gainEv(ev, ev.source));
  repeat(12, () => moveCard(gameState.herodeck.top, gameState.villaindeck));
  // TODO require Skrulls
  gameState.villaindeck.shuffle();
  gameState.schemeProgress = 6;
}),
// SETUP: For 2-3 players, use 8 Twists. For 4-5 players, use 5 Twists. If only 2 players, use only 4 Heroes in the Hero Deck.
// EVILWINS: If the Hero Deck runs out.
// Single player based on https://boardgamegeek.com/thread/1127095/single-player-superhero-civil-war
makeSchemeCard("Super Hero Civil War", { twists: [ 8, 8, 8, 5, 5 ], heroes: [ 4, 4, 5, 5, 6 ]}, ev => {
  // Twist: KO all the Heroes in the HQ.
  HQCards().limit(isHero).each(c => KOEv(ev, c));
}, {
  event: "RUNOUT",
  match: ev => ev.deckName === "HERO",
  after: evilWinsEv,
}),
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
    cont(ev, () => schemeProgressEv(ev, 3 - gameState.mastermind.attached("TWIST").size));
  } else CityCards().limit(isVillain).withLast(v => captureEv(ev, v, hope));
}, [], (s) => {
  const hopeTemplate = new Card("BABYHOPE");
  hopeTemplate.varVP = () => 6;
  hopeTemplate.set = "Dark City";
  s.hope = gameState.scheme.attachedDeck("BABYHOPE").addNewCard(hopeTemplate);
  addStatMod('defense', isVillain, v => v.captured.count(c => c.cardType === "BABYHOPE") * 4);
  gameState.schemeProgress = 3;
}),
// SETUP: 8 Twists. 6 Heroes in the Hero Deck.
// RULE: Whenever a Hero is KO'd from the HQ, turn that Hero face down on that HQ space, representing an Explosion on the Helicarrier.
// When an HQ space has 6 Explosions, that space is Destroyed and can't hold Heroes anymore.
// EVILWINS: When all HQ spaces are Destroyed or the Hero Deck runs out.
makeSchemeCard("Detonate the Helicarrier", { twists: 8, heroes: 6 }, ev => {
  // Twist: Stack this Twist next to the Scheme. Then for each Twist in that stack, KO the leftmost Hero in the HQ and immediately refill that space.
  attachCardEv(ev, ev.twist, gameState.scheme, "TWIST");
  repeat(ev.nr, () => cont(ev, () => HQCards().limit(isHero).withFirst(c => KOEv(ev, c))));
}, [{
  event: "KO",
  match: ev => ev.what.location.isHQ,
  replace: ev => {
    attachCardEv(ev, ev.parent.what, ev.parent.what.location, "EXPLOSION");
    cont(ev, () => schemeProgressEv(ev, gameState.hq.count(d => d.attachedDeck("EXPLOSION").size < 6)));
  },
}, {
  event: "RUNOUT",
  match: ev => ev.deckName === "HERO",
  after: evilWinsEv,
}, {
  event: "MOVECARD",
  match: ev => ev.to.isHQ && ev.to.attachedDeck("EXPLOSION").size >= 6,
  replace: () => {},
}], () => {
  gameState.schemeProgress = gameState.hq.size;
}),
// SETUP: 8 Twists.
// EVILWINS: When the number of non grey Heroes in the KO pile is 3 times the number of players.
makeSchemeCard("Massive Earthquake Generator", { twists: 8 }, ev => {
  // Twist: Each player reveals a [Strength] Hero or KOs the top card of their deck.
  eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => lookAtDeckEv(ev, 1, () => p.revealed.withLast(c => KOEv(ev, c)), p), p));
}, [{
  event: "KO",
  after: ev => schemeProgressEv(ev, 3 * gameState.players.size - gameState.ko.count(c => isHero(c) && !isColor(Color.GRAY)(c))),
}], () => {
  gameState.schemeProgress = gameState.players.size * 3;
}),
// SETUP: 8 Twists. Include 10 Maggia Goons as one of the Henchman Groups.
// RULE: Goons also have the ability "Ambush: Play another card from the Villain Deck."
// EVILWINS: When 5 Goons escape.
makeSchemeCard<{isGoon: (c: Card) => boolean}>("Organized Crime Wave", { twists: 8, vd_henchmen_counts: [[10], [10], [10], [10, 10], [10, 10]], required: { henchmen: "Maggia Goons" } }, ev => {
  // Twist: Each Goon in the city escapes. Shuffle all Goons from each players' Victory Piles into the Villain Deck.
  CityCards().limit(ev.state.isGoon).each(c => villainEscapeEv(ev, c));
  eachPlayer(p => p.victory.limit(ev.state.isGoon).each(c => moveCardEv(ev, c, gameState.villaindeck)));
  cont(ev, () => gameState.villaindeck.shuffle());
}, {
  event: "ESCAPE",
  after: ev => schemeProgressEv(ev, 5 - gameState.escaped.count(gameState.schemeState.isGoon)),
}, (s) => {
  s.isGoon = c => c.cardName === "Maggia Goons";
  addStatSet('ambush', s.isGoon, () => villainDrawEv);
  gameState.schemeProgress = 5;
}),
// SETUP: 8 Twists. 24 Bystanders in the Hero Deck. (1 player: 12 Bystanders in the Hero Deck)
// RULE: You may spend 2 Recruit to rescue a Bystander from the HQ.
// EVILWINS: When the number of Bystanders KO'd and/or carried off is 4 times the number of players.
makeSchemeCard("Save Humanity", { twists: 8 }, ev => {
  // Twist: KO all Bystanders in the HQ. Then each player reveals an [Instinct] Hero or KOs a Bystander from their Victory Pile.
  HQCards().limit(isBystander).each(c => KOEv(ev, c));
  eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => selectCardAndKOEv(ev, p.victory.limit(isBystander), p), p));
}, [{
  event: "MOVECARD",
  after: ev => schemeProgressEv(ev, 4 * gameState.players.size - gameState.ko.count(isBystander) - gameState.escaped.count(isBystander))
}], () => {
  gameState.schemeProgress = 4 * gameState.players.size;
  repeat(gameState.players.size === 1 ? 12 : 24, () => moveCard(gameState.bystanders.top, gameState.herodeck));
  gameState.herodeck.shuffle();
  gameState.specialActions = (ev) => {
    if (turnState.recruit < 2) return [];
    return HQCards().limit(isBystander).map(c => new Ev(ev, "PAYTORESCUE", { what: c, func: ev => { turnState.recruit -= 2; rescueEv(ev, ev.what); }}));
  };
}),
// SETUP: 8 Twists representing Plutonium. Add an extra Villain Group.
// RULE: Each Villain gets +1 Attack for each Plutonium it has. When a Villain with any Plutonium is defeated, shuffle that Plutonium back into the Villain Deck.
// EVILWINS: When 4 Plutonium have been carried off by Villains.
makeSchemeCard("Steal the Weaponized Plutonium", { twists: 8, vd_villain: [ 2, 3, 4, 4, 5 ] }, ev => {
  // Twist: This Plutonium is captured by the closest Villain to the Villain Deck. If there are no Villains in the city, KO this Plutonium. Either way, play another card from the Villain Deck.
  CityCards().limit(isVillain).withLast(v => captureEv(ev, v, ev.twist));
  villainDrawEv(ev);
}, [{
  event: "ESCAPE",
  after: ev => schemeProgressEv(ev, 4 - gameState.escaped.count(isTwist)),
}, {
  event: "DEFEAT",
  before: ev => ev.parent.what.captured.limit(isTwist).each(c => shuffleIntoEv(ev, c, gameState.villaindeck)),
}], () => {
  addStatMod('defense', isVillain, c => c.captured.count(isTwist));
  gameState.schemeProgress = 4;
}),
// SETUP: 8 Twists. Villain Deck includes 14 extra Jean Grey cards and no Bystanders.
// RULE: Each Jean Grey card counts as a "Goblin Queen" Villain. It's worth 4 VP. It has Attack equal to its Cost plus the number of Demon Goblins stacked next to the Scheme.
// EVILWINS: When 4 Goblin Queen cards escape.
makeSchemeCard<{isGoblinQueen: (c: Card) => boolean}>("Transform Citizens Into Demons", { twists: 8, vd_bystanders: 0, heroes: [ 4, 6, 6, 6, 7 ], required: { heroes: "Jean Grey" } }, ev => {
  // Twist: Stack 5 Bystanders face down next to the Scheme. Bystanders stacked here are "Demon Goblin" Villains. They have 2 Attack. Players can fight these Demon Goblins to rescue them as Bystanders.
  repeat(5, () => cont(ev, () => gameState.bystanders.withTop(b => attachCardEv(ev, b, gameState.scheme, "GOBLIN"))));
}, [{
  event: "ESCAPE",
  after: ev => schemeProgressEv(ev, 4 - gameState.escaped.count(gameState.schemeState.isGoblinQueen)),
}], (s) => {
  const demonGoblins = gameState.scheme.attachedDeck("GOBLIN");
  s.isGoblinQueen = c => c.heroName === "Jean Grey";
  const isDemonGoblin = (c: Card) => c.location === demonGoblins;
  gameState.herodeck.limit(s.isGoblinQueen).each(c => moveCard(c, gameState.villaindeck));
  gameState.villaindeck.shuffle();
  addStatSet('defense', s.isGoblinQueen, c => c.cost + demonGoblins.size);
  addStatSet('vp', s.isGoblinQueen, () => 4);
  addStatSet('defense', isDemonGoblin, () => 2);
  addStatSet('fight', isDemonGoblin, () => ev => rescueEv(ev, ev.source));
  addStatSet('isVillain', s.isGoblinQueen, () => true);
  gameState.schemeProgress = 4;
  gameState.specialActions = (ev) => {
    const what = demonGoblins.top;
    return what && canFight(what) ? [ new Ev(ev, "FIGHT", { func: villainFight, what }) ] : [];
  };
}),
// SETUP: 8 Twists. Villain Deck includes 14 cards for an extra Hero and no Bystanders.
// RULE: Whenever you play a Hero from the Villain Deck, that Hero is captured by the closest enemy to the Villain Deck.
// Each Villain gets +2 Attack for each Hero it has. When you fight an enemy, gain all the Heroes captured by that enemy.
// EVILWINS: 9 non grey Heroes are KO'd or carried off.
makeSchemeCard("X-Cutioner's Song", { twists: 8, vd_bystanders: 0, heroes: [ 4, 6, 6, 6, 7 ]  }, ev => {
  // Twist: KO all Heroes captured by enemies. Then play another card from the Villain Deck.
  villainOrMastermind().each(e => e.captured.limit(isHero).each(h => KOEv(ev, h)));
  villainDrawEv(ev);
}, [{
  event: "ESCAPE",
  after: ev => schemeProgressEv(ev, 9 - gameState.escaped.count(c => isHero(c) && !isColor(Color.GRAY)(c))),
}], () => {
  addStatMod('defense', isVillain, c => 2 * c.captured.count(isHero));
  // addStatSet('capturable', isHero, () => true); // Hardcoded
  addStatSet('rescue', isHero, () => ev => gainEv(ev, ev.source)); // TODO this should not be a rescue action
  gameState.herodeck.limit(c => c.heroName === extraHeroName()).each(c => moveCard(c, gameState.villaindeck));
  gameState.villaindeck.shuffle();
  gameState.schemeProgress = 9;
}),
]);

addTemplates("SCHEMES", "Fantastic Four", [
// SETUP: 6 Twists.
// EVILWINS: When the number of non-grey Heroes in the KO pile is six times the number of players.
makeSchemeCard("Bathe the Earth in Cosmic Rays", { twists: 6 }, ev => {
  // Twist: Each player in turn does the following: Reveal your hand. KO one of your non-grey Heroes. Choose a Hero from the HQ with the same or lower cost and put it into your hand.
  eachPlayer(p => selectCardEv(ev, "Select non-grey Hero", p.hand.limit(isNonGrayHero), c => {
    KOEv(ev, c);
    selectCardEv(ev, "Select hero to put in hand", HQCards().limit(h => h.cost <= c.cost), c => moveCardEv(ev, c, p.hand), p);
  }, p))
}, [{
  event: "MOVECARD",
  match: ev => ev.to === gameState.ko,
  after: ev => schemeProgressEv(ev, 6 * gameState.players.size - gameState.ko.count(isNonGrayHero)),
}]),
// SETUP: 8 Twists.
// EVILWINS: When 20 non-grey Heroes are KO'd.
makeSchemeCard("Flood the Planet with Melted Glaciers", { twists: 8 }, ev => {
  // Twist: Stack the Twist next to the Scheme as "Rising Waters." Then KO each Hero from the HQ whose cost is less than or equal to the number of Rising Waters in that stack.
  attachCardEv(ev, ev.twist, gameState.scheme, "WATERS");
  cont(ev, () => {
    const waterLevel = gameState.scheme.attached("WATERS").size;
    HQCards().limit(isHero).limit(c => c.cost <= waterLevel).each(c => KOEv(ev, c));
  });
}, [{
  event: "MOVECARD",
  match: ev => ev.to === gameState.ko,
  after: ev => schemeProgressEv(ev, 20 - gameState.ko.count(isNonGrayHero)),
}]),
// SETUP: 7 Twists.
// RULE: To fight the Mastermind, you must also spend 1 Recruit or 1 Attack for each Force Field next to them.
makeSchemeCard("Invincible Force Field", { twists: 7 }, ev => {
  // Twist: Stack this Twist next to the Mastermind as a "Force Field."
  attachCardEv(ev, ev.twist, gameState.mastermind, "FORCEFIELD");
  // Twist 7 Evil Wins!
  schemeProgressEv(ev, 7 - ev.nr);
}, [], () => {
  addStatSet('fightCost', isMastermind, (c, { either, ...rest }) => ({ either: either + gameState.scheme.attached("FORCEFIELD").size, ...rest}));
}),
// SETUP: 8 Twists.
makeSchemeCard<{neg: boolean}>("Pull Reality Into the Negative Zone", { twists: 8 }, ev => {
  // Twist 2, 4, and 6 Until the next Twist, Enemies cost Recruit to fight and Heroes cost Attack to recruit.
  ev.state.neg = ev.nr === 2 || ev.nr === 4 || ev.nr === 6;
  // Twist 7 Evil Wins!
  schemeProgressEv(ev, 7 - ev.nr);
}, [], s => {
  s.neg = false;
  addStatSet('fightCost', undefined, (c, base) => s.neg ? {
    either: base.either,
    attack: base.recruit,
    rectuit: base.attack,
  } : base);
  addStatSet('recruitCost', undefined, (c, base) => s.neg ? {
    either: base.either,
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
  {
    event: 'RUNOUT',
    match: ev => ev.deckName === 'VILLAIN',
    after: ev => evilWinsEv(ev),
  },
]),
// SETUP: 8 Twists. Add 6 extra Henchmen from a single Henchman Group to the Hero Deck.
// RULE: You can fight Villains in the HQ.
// EVILWINS: When there are 5 Villains in the HQ.
makeSchemeCard("Invade the Daily Bugle News HQ", { twists: 8, vd_henchmen_counts: [[3, 6], [10, 6], [10, 6], [10, 10, 6], [10, 10, 6]] }, ev => {
  // Twist: KO a Hero from the HQ. Put the highest-Attack Villain from the city into that HQ space.
  let space: Deck;
  addTurnTrigger('MOVECARD', ev => space && ev.to === space && ev.from === gameState.herodeck, { replace: ev => {
    selectCardEv(ev, "", CityCards().limit(isVillain), c => moveCardEv(ev, c, space)); // TODO highest attack
  }});
  selectCardEv(ev, "Select a Hero to KO", HQCards().limit(isHero), c => { KOEv(ev, c); space = c.location; });  
  cont(ev, () => space = undefined);
}, {
  event: 'MOVECARD',
  match: ev => ev.to.isHQ,
  after: ev => schemeProgressEv(ev, 5 - CityCards().count(isVillain)),
}, () => {
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
  {
    event: 'ESCAPE',
    after: ev => schemeProgressEv(ev, 6 - gameState.escaped.count(c => c.villainGroup === "Sinister Six")),
  },
  {
    event: 'RUNOUT',
    match: ev => ev.deckName === 'VILLAIN',
    after: ev => evilWinsEv(ev),
  },
], () => {
  addStatMod('defense', c => c.villainGroup === "Sinister Six", 3);
//  addStatSet('wallcrawl', isHero, () => true); TODO
}),
// SETUP: 7 Twists.
// RULE: Whenever you defeat a Villain, you may pay 1 Recruit. If you do, rescue a Bystander.
// You can't fight the Mastermind unless you have a Bystander in your Victory Pile for each Twist next to the Mastermind.
makeSchemeCard("Weave a Web of Lies", { twists: 7 }, ev => {
  // Twist: Stack this Twist next to the Mastermind.
  attachCardEv(ev, ev.source, gameState.mastermind, "TWIST");
  // Twist 7 Evil Wins!
  schemeProgressEv(ev, 7 - ev.nr);
}, {
  event: 'DEFEAT',
  match: ev => isVillain(ev.what) && canPayCost(new Ev(ev, 'EFFECT', { func: rescueEv, cost: { recruit: 1 } })),
  after: ev => chooseMayEv(ev, "Pay 1 recruit to rescue a Bystander", () => pushEv(ev, 'EFFECT', { func: rescueEv, cost: { recruit: 1 } })),
}, () => {
  addStatSet('fightCost', isMastermind, (c, prev) => ({
    ...prev,
    cond: c => (prev.cond ? prev.cond(c) : true) && playerState.victory.count(isBystander) >= gameState.mastermind.attached("TWIST").size,
  }));
}),
]);
