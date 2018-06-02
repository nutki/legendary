"use strict";
addTemplates("SCHEMES", "Legendary", [
// SETUP: 8 Twists. Wound stack holds 6 Wounds per player.
// EVILWINS: If the Wound stack runs out.
makeSchemeCard("The Legacy Virus", { twists: 8, wounds: [ 6, 12, 18, 24, 30 ] }, ev => {
  // Twist: Each player reveals a [Tech] Hero or gains a Wound.
  eachPlayer(p => revealOrEv(ev, Color.BLACK, () => gainWoundEv(ev, p), p));
}, {
  event: "RUNOUT",
  match: ev => ev.what === "WOUNDS",
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
  after: ev => { if (gameState.escaped.count(isBystander) >= 8) evilWinsEv(ev); },
}, () => {
  addStatMod('defense', isVillain, c => c.captured.count(isBystander));
}),
// SETUP: 8 Twists. Add an extra Henchman group to the Villain Deck.
// EVILWINS: If 12 Villains escape.
makeSchemeCard("Negative Zone Prison Breakout", { twists: 8, vd_henchmen: [ 1, 2, 2, 3, 3 ]  }, ev => {
  // Twist: Play the top 2 cards of the Villain Deck.
  villainDrawEv(ev); villainDrawEv(ev);
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
}, {}, () => {
  addStatMod('defense', isEnemy, c => c.location.attached('DARK_PORTAL').size);
}),
// SETUP: 5 Twists. 3 additional Twists next to this Scheme. 18 total Bystanders in the Villain Deck.
// RULE: Bystanders in the Villain Deck count as Killbot Villains, with Attack equal to the number of Twists next to this Scheme.
// EVILWINS: If 5 "Killbots" escape.
makeSchemeCard("Replace Earth's Leaders with Killbots", { twists: 5, vd_bytstanders: 18 }, ev => {
  // Twist: Put the Twist next to this Scheme.
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
}, {
  event: "ESCAPE",
  after: ev => { if (gameState.escaped.count(isBystander) >= 5) evilWinsEv(ev); },
}, function () {
  gameState.scheme.attachedDeck('TWIST').addNewCard(twistTemplate, 3);
  // TODO implement these mods
  addStatSet('defense', isBystander, () => gameState.scheme.attached('TWIST').size);
  addStatSet('isVillain', isBystander, () => true);
  addStatSet('villainGroup', isHero, () => "Killbots");
}),
// SETUP: 8 Twists. 6 Heroes. Skrull Villain Group required. Shuffle 12 random Heroes from the Hero Deck into the Villain Deck.
// RULE: Heroes in the Villain Deck count as Skrull Villains with Attack equal to the Hero's Cost +2. If you defeat that Hero, you gain it.
// EVILWINS: If 6 Heroes get into the Escaped Villains pile.
makeSchemeCard("Secret Invasion of the Skrull Shapeshifters", { twists: 8, heroes: 6, required: { villains: "Skrulls" } }, ev => {
  // Twist: The highest-cost Hero from the HQ moves into the Sewers as a Skrull Villain, as above.
  withCity("SEWERS", d => selectCardEv(ev, "Choose a Hero to become a Skull", HQCardsHighestCost(), sel => moveCardEv(ev, sel, d)));
}, {
  event: "ESCAPE",
  after: ev => { if (gameState.escaped.count(isHero) >= 6) evilWinsEv(ev); },
}, function () {
  // TODO implement these mods
  addStatSet('defense', isHero, c => c.cost + 2);
  addStatSet('isVillain', isHero, () => true);
  addStatSet('villainGroup', isHero, () => "Skrulls");
  addStatSet('fight', isHero, () => ev => gainEv(ev, ev.source));
  repeat(12, () => moveCard(gameState.herodeck.top, gameState.villaindeck));
  // TODO require Skrulls
  gameState.villaindeck.shuffle();
}),
// SETUP: For 2-3 players, use 8 Twists. For 4-5 players, use 5 Twists. If only 2 players, use only 4 Heroes in the Hero Deck.
// EVILWINS: If the Hero Deck runs out.
makeSchemeCard("Super Hero Civil War", { twists: [ 8, 8, 8, 5, 5 ], heroes: [ 4, 4, 5, 5, 6 ]}, ev => {
  // Twist: KO all the Heroes in the HQ.
  HQCards().limit(isHero).each(c => KOEv(ev, c));
}, {
  event: "RUNOUT",
  match: ev => ev.what === "HERO",
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
makeSchemeCard("Capture Baby Hope", { twists: 8 }, ev => {
  // Twist: If a Villain has the baby, that Villain escapes. Otherwise, the baby is captured by the closest Villain to the Villain Deck. (If there are no Villains, do nothing.)
  const hope = ev.state.hope;
  const a = hope.location.attachedTo;
  if (a instanceof Card && isVillain(a)) {
    villainEscapeEv(ev, a);
    attachCardEv(ev, ev.twist, gameState.mastermind, "TWIST");
    attachCardEv(ev, hope, gameState.scheme, "BABYHOPE");
    cont(ev, () => { if (gameState.mastermind.attached("TWIST").size >= 3) evilWinsEv(ev); });
  } else CityCards().limit(isVillain).withLast(v => captureEv(ev, v, hope));
}, [], (s) => {
  const hopeTemplate = new Card("BABYHOPE");
  hopeTemplate.varVP = () => 6;
  s.hope = gameState.scheme.attachedDeck("BABYHOPE").addNewCard(hopeTemplate);
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
  before: ev => {
    ev.hq = ev.parent.what.location;
    ev.hq.explosion = (ev.hq.explosion || 0) + 1;
    if (ev.hq.explosion === 6) ev.hq.isHQ = false;
    if (!gameState.hq.has(l => l.isHQ)) evilWinsEv(ev);
  },
  after: ev => attachCardEv(ev, ev.parent.what, ev.state.hq, "EXPLOSION"),
}, {
  event: "RUNOUT",
  match: ev => ev.what === "HERO",
  after: evilWinsEv,
}]),
// SETUP: 8 Twists.
// EVILWINS: When the number of non grey Heroes in the KO pile is 3 times the number of players.
makeSchemeCard("Massive Earthquake Generator", { twists: 8 }, ev => {
  // Twist: Each player reveals a [Strength] Hero or KOs the top card of their deck.
  eachPlayer(p => revealOrEv(ev, Color.STRENGTH, ev => lookAtDeckEv(ev, 1, () => p.revealed.withLast(c => KOEv(ev, c)), p), p));
}, [{
  event: "KO",
  after: ev => { if (gameState.ko.count(c => isHero(c) && !isColor(Color.GRAY)(c)) >= 3 * gameState.players.size) evilWinsEv(ev); },
}]),
// SETUP: 8 Twists. Include 10 Maggia Goons as one of the Henchman Groups.
// RULE: Goons also have the ability "Ambush: Play another card from the Villain Deck."
// EVILWINS: When 5 Goons escape.
makeSchemeCard("Organized Crime Wave", { twists: 8 }, ev => {
  // Twist: Each Goon in the city escapes. Shuffle all Goons from each players' Victory Piles into the Villain Deck.
  CityCards().limit(ev.state.isGoon).each(c => villainEscapeEv(ev, c));
  eachPlayer(p => p.victory.limit(ev.state.isGoon)).each(c => moveCardEv(ev, c, gameState.villaindeck));
  cont(ev, () => gameState.villaindeck.shuffle());
}, {
  event: "ESCAPE",
  after: ev => { if (gameState.escaped.count(ev.state.isGoon) >= 5) evilWinsEv(ev); },
}, (s) => {
  s.isGoon = c => c.cardName === "Maggia Goons";
  addStatSet('ambush', s.isGoon, () => villainDrawEv);
  // TODO setup constraint = 10 goons
}),
// SETUP: 8 Twists. 24 Bystanders in the Hero Deck. (1 player: 12 Bystanders in the Hero Deck)
// RULE: You may spend 2 Recruit to rescue a Bystander from the HQ.
// EVILWINS: When the number of Bystanders KO'd and/or carried off is 4 times the number of players.
makeSchemeCard("Save Humanity", { twists: 8 }, ev => {
  // Twist: KO all Bystanders in the HQ. Then each player reveals an [Instinct] Hero or KOs a Bystander from their Victory Pile.
  HQCards().limit(isBystander).each(c => KOEv(ev, c));
  eachPlayer(p => revealOrEv(ev, Color.INSTINCT, ev => selectCardAndKOEv(ev, p.victory.limit(isBystander), p), p));
}, [{
  event: "MOVECARD",
  after: ev => { if (gameState.ko.count(isBystander) + gameState.escaped.count(isBystander) >= 4 * gameState.players.size) evilWinsEv(ev); }
}], () => {
  repeat(gameState.players.size === 1 ? 12 : 24, () => moveCard(gameState.bystanders.top, gameState.herodeck));
  gameState.specialActions = (ev) => {
    if (turnState.recruit < 2) return [];
    return HQCards().limit(isBystander).map(c => new Ev(ev, "EFFECT", ev => { turnState.recruit -= 2; rescueEv(ev, c); }));
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
  after: ev => { if (gameState.escaped.count(c => c.cardType === "SCHEME TWIST") >= 4) evilWinsEv(ev); },
}, {
  event: "DEFEAT",
  after: ev => {
    let twist = playerState.victory.limit(c => c.cardType === "SCHEME TWIST");
    if (twist.size) {
      twist.each(t => moveCardEv(ev, t, gameState.villaindeck));
      cont(ev, () => gameState.villaindeck.shuffle());
    }
  }
}], () => {
  addStatMod('defense', isVillain, c => c.captured.count(c => c.cardType === "SCHEME TWIST"));
}),
// SETUP: 8 Twists. Villain Deck includes 14 extra Jean Grey cards and no Bystanders.
// RULE: Each Jean Grey card counts as a "Goblin Queen" Villain. It's worth 4 VP. It has Attack equal to its Cost plus the number of Demon Goblins stacked next to the Scheme.
// EVILWINS: When 4 Goblin Queen cards escape.
makeSchemeCard("Transform Citizens Into Demons", { twists: 8, vd_bystanders: 0, heroes: [ 4, 6, 6, 6, 7 ] }, ev => {
  // Twist: Stack 5 Bystanders face down next to the Scheme. Bystanders stacked here are "Demon Goblin" Villains. They have 2 Attack. Players can fight these Demon Goblins to rescue them as Bystanders.
  repeat(5, () => cont(ev, () => gameState.bystanders.withTop(b => attachCardEv(ev, b, gameState.scheme, "GOBLIN"))));
}, [], (s) => {
  s.isGoblinQueen = c => c.heroName === "Jean Grey";
  // gameState.scheme.attachedDeck("GOBLIN").fightable = true; // TODO
  gameState.herodeck.limit(s.isGoblinQueen).each(c => moveCard(c, gameState.villaindeck));
  gameState.villaindeck.shuffle();
  addStatSet('defense', s.isGoblinQueen, c => c.cost + gameState.scheme.attached("GOBLIN").size);
  addStatSet('vp', s.isGoblinQueen, () => 4);
  addStatSet('defense', isBystander, () => 2);
  addStatSet('fight', isBystander, () => ev => rescueEv(ev, ev.source));
  addStatSet('isVillain', s.isGoblinQueen, () => true);
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
  after: ev => { if (gameState.escaped.count(c => isHero(c) && !isColor(Color.GRAY)(c)) >= 9) evilWinsEv(ev); },
}], () => {
  addStatMod('defense', isVillain, c => 2 * c.captured.count(isHero));
  addStatSet('capturable', isHero, () => true);
  addStatSet('rescue', isHero, () => ev => gainEv(ev, ev.source));
  // gameState.herodeck.limit(c => c.heroName === extraHero).each(c => moveCard(c, gameState.villaindeck)); // TODO extra hero
  gameState.villaindeck.shuffle();
}),
]);
