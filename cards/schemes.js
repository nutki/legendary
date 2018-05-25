"use strict";
/* global Color, gameState, isVillain, isBystander, HQCards, isHero, twistTemplate */
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
  let bank = gameState.cityByName('BANK'); // TODO
  if (bank && bank.top && isVillain(bank.top)) { captureEv(ev, bank.top); captureEv(ev, bank.top); }
  drawVillainEv(ev);
}, {
  event: "ESCAPE",
  after: ev => { if (gameState.escaped.count(isBystander) >= 8) evilWinsEv(ev); },
}, () => {
  addStatMod('defense', isVillain, c => c.attachedCount('BYSTANDER')); // TODO numerical mods with functions
}),
// SETUP: 8 Twists. Add an extra Henchman group to the Villain Deck.
// EVILWINS: If 12 Villains escape.
makeSchemeCard("Negative Zone Prison Breakout", { twists: 8, vd_henchmen: [ 1, 2, 2, 3, 3 ]  }, ev => {
  // Twist: Play the top 2 cards of the Villain Deck.
  drawVillainEv(ev); drawVillainEv(ev);
}),
// SETUP: 7 Twists. Each Twist is a Dark Portal.
makeSchemeCard("Portals to Dark Dimension", { twists: 7 }, ev => {
  if (ev.nr === 1) { // Twist 1 Put the Dark Portal above the Mastermind. The Mastermind gets +1 Attack.
    attachCardEv(ev, ev.twist, gameState.mastermind, 'DARK_PORTAL');
  } else if (ev.nr >= 2 && ev.nr <= 6) { // Twists 2-6 Put the Dark Portal in the leftmost city space that doesn't yet have a Dark Portal. Villains in that city space get +1 Attack.
    attachCardEv(ev, ev.twist, gameState.city[ev.nr - 2], 'DARK_PORTAL');
  } else if (ev.nr === 7) { // Twist 7 Evil Wins!
    evilWinsEv(ev);
  }
}, {}, () => {
  addStatMod('defense', isVillain, c => c.location.attachedCount('DARK_PORTAL'));
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
  gameState.scheme.cardsAttached('TWIST').addNewCard(twistTemplate, 3);
  // TODO implement these mods
  addStatMod('defense', isBystander, () => gameState.scheme.attachedCount('TWIST'));
  addStatMod('isVillain', isBystander, () => true);
  addStatMod('villainGroup', isHero, () => "Killbots");
}),
// SETUP: 8 Twists. 6 Heroes. Skrull Villain Group required. Shuffle 12 random Heroes from the Hero Deck into the Villain Deck.
// RULE: Heroes in the Villain Deck count as Skrull Villains with Attack equal to the Hero's Cost +2. If you defeat that Hero, you gain it.
// EVILWINS: If 6 Heroes get into the Escaped Villains pile.
makeSchemeCard("Secret Invasion of the Skrull Shapeshifters", { twists: 8, heroes: 6, required: { villains: "Skrulls" } }, ev => {
  // Twist: The highest-cost Hero from the HQ moves into the Sewers as a Skrull Villain, as above.
  selectCardEv(ev, HQCardsHighestCost(), sel => moveCardEv(ev, sel, gameState.cityByName('SEWERS')));
}, {
  event: "ESCAPE",
  after: ev => { if (gameState.escaped.count(isHero) >= 6) evilWinsEv(ev); },
}, function () {
  // TODO implement these mods
  addStatMod('defense', isHero, c => c.cost + 2);
  addStatMod('isVillain', isHero, () => true);
  addStatMod('villainGroup', isHero, () => "Skrulls");
  addStatMod('fight', isHero, () => ev => gainEv(ev, ev.source));
  for (let i = 0; i < 12; i++) moveCard(gameState.herodeck.top, gameState.villaindeck);
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
