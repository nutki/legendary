addTemplates("VILLAINS", "Legendary", [
{ name: "Brotherhood", cards: [
// You can't defeat Blob unless you have an X-Men Hero.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Brotherhood", "Blob", 4, 2, {
    fightCond: () => revealable().filter(isTeam("X-Men")).length > 0,
    // fightCond: () => revealable().has('X-Men')
    // fightCost: ev => revealEv(ev, revealable().filter(isTeam('X-Men'))), TODO
  })],
// AMBUSH: Each player KOs two Heroes from their discard pile.
// ESCAPE: Each player KOs two Heroes from their hand.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Brotherhood", "Juggernaut", 6, 4, {
    ambush: ev => eachPlayer(p => selectCardsNEv(ev, 2, p.discard, ev => KOEv(ev, ev.selected), p)),
    escape: ev => eachPlayer(p => selectCardsNEv(ev, 2, p.hand, ev => KOEv(ev, ev.selected), p)),
  })],
// ESCAPE: Mystique becomes a Scheme Twist that takes effect immediately.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Brotherhood", "Mystique", 5, 3, {
    escape: ev => playTwist(ev, ev.source),
  })],
// FIGHT: Each player reveals an X-Men Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Brotherhood", "Sabretooth", 5, 3, {
    fight: ev => eachPlayer(p => revealOrEv(ev, "X-Men", ev => gainWoundEv(ev, p), p)),
    escape: ev => eachPlayer(p => revealOrEv(ev, "X-Men", ev => gainWoundEv(ev, p), p)),
  })],
]},
{ name: "Enemies of Asgard", cards: [
// FIGHT: KO all your S.H.I.E.L.D. Heroes.
// ESCAPE: Each player KOs two of their Heroes.
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Enemies of Asgard", "Destroyer", 7, 5, {
    fight: ev => yourHeroes().filter(isTeam("S.H.I.E.L.D.")).forEach(c => KOEv(ev, c)),
    escape: ev => eachPlayer(p => selectCardsNEv(ev, 2, yourHeroes(p), ev => KOEv(ev, ev.selected), p)),
  })],
// FIGHT: Draw three cards
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Enemies of Asgard", "Enchantress", 6, 4, {
    fight: ev => drawEv(ev, 3),
  })],
// FIGHT: Each player reveals a [Ranged] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 4
// VP: 2
  [ 3, makeVillainCard("Enemies of Asgard", "Frost Giant", 4, 2, {
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, ev => gainWoundEv(ev, p), p)),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, ev => gainWoundEv(ev, p), p)),
  })],
// AMBUSH: Each player reveals a [Ranged] Hero or gains a Wound.
// FIGHT: Choose a player. That player KOs any number of Wounds from their hand and discard pile.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Enemies of Asgard", "Ymir, Frost Giant King", 6, 4, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, ev => gainWoundEv(ev, p), p)),
    fight: ev => selectPlayerEv(ev, pev => selectCardsOptEv(ev, handOrDiscard(ev.selected).filter(isWound), ev => KOEv(ev, ev.selected), ev.selected)), // TODO selectPlayer, TODO selectCardsOpt
  })],
]},
{ name: "HYDRA", cards: [
// FIGHT: Play the top two cards of the Villain Deck.
// ATTACK: 4
// VP: 3
  [ 3, makeVillainCard("HYDRA", "Endless Armies of HYDRA", 4, 3, {
    fight: ev => { drawVillain(ev); drawVillain(ev); },
  })],
// FIGHT: You may gain a S.H.I.E.L.D. Officer.
// ATTACK: 3
// VP: 1
  [ 3, makeVillainCard("HYDRA", "HYDRA Kidnappers", 3, 1, {
    fight: ev => chooseOneEv(ev, "Yes", ev => { if (gameState.officer.top) gainEv(ev, gameState.officer.top); }, "No", () => {}),
  })],
// Supreme HYDRA is worth +3 VP for each other HYDRA Villain in your Victory Pile.
// ATTACK: 6
// VP: 3*
  [ 1, makeVillainCard("HYDRA", "Supreme HYDRA", 6, 3, {
     varVP: c => 3 * p.location.filter(i => i !== c).fcount(isGroup("HYDRA")), 
  })],
// FIGHT: Each player without another HYDRA Villain in their Victory Pile gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("HYDRA", "Viper", 5, 3, {
    fight: ev => eachPlayer(p => { if (p.victory.fcount(c => c.group === "HYDRA") === 0) gainWoundEv(ev, p); }), // implement 'group' and isGroup
    escape: ev => eachPlayer(p => { if (p.victory.fcount(c => c.group === "HYDRA") === 0) gainWoundEv(ev, p); }),
  })],
]},
{ name: "Masters of Evil", cards: [
// FIGHT: For each of your Avengers Heroes, rescue a Bystander.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Masters of Evil", "Baron Zemo", 6, 4, {
    fight: ev => { let v = yourHeroes().filter(isTeam("Avengers")).length; for (let i = 0; i < v; i++) rescueEv(ev); },
  })],
// FIGHT: Each player reveals the top card of their deck. For each card, you choose to KO it or put it back.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Masters of Evil", "Melter", 5, 3, {
    fight: ev => eachPlayer(p => lookAtDeckEv(ev, 1, ev => selectCardOptEv(ev, p.revealed, ev => KOEv(ev, ev.selected)), p, playerState)),
  })],
// Ultron is worth +1 VP for each [Tech] Hero you have among all your cards at the end of the game.
// ESCAPE: Each player reveals a [Tech] Hero or gains a Wound.
// ATTACK: 6
// VP: 2+
  [ 2, makeVillainCard("Masters of Evil", "Ultron", 6, 2, {
    escape: ev => eachPlayer(p => revealOrEv(ev, isColor(Color.TECH), ev => gainWoundEv(ev, p), p)),
    varVP: c => { let who = c.location.owner; } // TODO
  })],
// FIGHT: If you fight Whirlwind on the Rooftops or Bridge, KO two of your Heroes.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Masters of Evil", "Whirlwind", 4, 2, {
    fight: ev => { if(ev.where === "ROOFTOPS" || ev.where === "BRIDGE") selectCardsNEv(ev, 2, yourHeroes(), ev => KOEv(ev, ev.selected)); },
  })],
]},
{ name: "Radiation", cards: [
// FIGHT: If you fight Abomination on the Streets or Bridge, rescue three Bystanders.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Radiation", "Abomination", 5, 3, {
    fight: ev => { if(ev.where === "STREETS" || ev.where === "BRIDGE") { rescueEv(ev); rescueEv(ev); rescueEv(ev); } },
  })],
// AMBUSH: Play the top card of the Villain Deck.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Radiation", "The Leader", 4, 2, {
    ambush: ev => villainDrawEv(ev),
  })],
// FIGHT: For each of your [Strength] Heroes, KO one of your Heroes.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Radiation", "Maestro", 6, 4, {
    fight: ev => selectCardsNEv(ev, yourHeroes().filter(isColor(Color.STRENGTH)), playerState.hand, ev => KOEv(ev, ev.selected)) // TODO selectCardsNEv
  })],
// FIGHT: Each player reveals a [Strength] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Radiation", "Zzzax", 5, 3, {
    fight: ev => eachPlayer(p => revealOrEv(ev, isColor(Color.STRENGTH), ev => gainWoundEv(ev, p), p)),
    escape: ev => eachPlayer(p => revealOrEv(ev, isColor(Color.STRENGTH), ev => gainWoundEv(ev, p), p)),
  })],
]},
{ name: "Skrulls", cards: [
// FIGHT: Choose a Hero in the HQ for each player. Each player gains that Hero.
// ATTACK: 8
// VP: 3
  [ 1, makeVillainCard("Skrulls", "Paibok the Power Skrull", 8, 3, {
    fight: ev => {
      let selected = {};
      eachPlayerEv(ev => selectCardEv(ev, HQCards().filter(c => !(c in selected)), sev => selected[ev.who] = sev.selected));
      eachPlayerEv(ev => gainEv(ev, selected[ev.who]));
    }
  })],
// AMBUSH: Put the highest-cost Hero from the HQ under this Villain. This Villain's Attack is equal to that Hero's Cost.
// FIGHT: Gain that Hero.
// ATTACK: *
// VP: 4
  [ 1, makeVillainCard("Skrulls", "Skrull Queen Veranke", 0, 4, {
    ambush: ev => selectCardEv(ev, HQCardsHighestCost(), sev => attachCardEv(sev, sev.selected, ev.source, "SKRULL_CAPTURE")),
    fight: ev => gainEv(ev, ev.source.attachedCards("SKRULL_CAPTURE").top),
    varDefense: c => { let v = c.attachedCards("SKRULL_CAPTURE").top; return v.top ? v.top.cost : 0; },
  })],
// AMBUSH: Put the rightmost Hero from the HQ under this Villain. This Villain's Attack is equal to that Hero's Cost.
// FIGHT: Gain that Hero
// ATTACK: *
// VP: 2
  [ 3, makeVillainCard("Skrulls", "Skrull Shapeshifters", 0, 2, {
    ambush: ev => {
      let hq = HQCards(); if (hq.length) attachCardEv(ev, hq[hq.length - 1], ev.source, "SKRULL_CAPTURE");
//    withLast(HQCards(), c => attachCardEv(ev, c, ev.source, "SKRULL_CAPTURE"));
    },
    fight: ev => gainEv(ev, ev.source.attachedCards("SKRULL_CAPTURE").top),
    varDefense: c => { let v = c.attachedCards("SKRULL_CAPTURE").top; return v.top ? v.top.cost : 0; }, // TODO varDefense
  })],
// FIGHT: Each player KOs one of their Heroes.
// ATTACK: 4
// VP: 2
  [ 3, makeVillainCard("Skrulls", "Super-Skrull", 4, 2, {
    fight: ev => eachPlayer(p => selectCardEv(ev, revealable(p), ev => KOEv(ev, ev.selected), p)),
  })],
]},
{ name: "Spider-Foes", cards: [
// FIGHT: When you draw a new hand of cards at the end of this turn, draw eight cards instead of six.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Spider-Foes", "Doctor Octopus", 4, 2, {
    fight: () => setEndDrawAmount(8),
  })],
// AMBUSH: Green Goblin captures a Bystander.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Spider-Foes", "Green Goblin", 6, 4, {
    ambush: ev => captureEv(ev, ev.source),
  })],
// FIGHT: If you fight the Lizard in the Sewers, each other player gains a Wound.
// ATTACK: 3
// VP: 2
  [ 2, makeVillainCard("Spider-Foes", "The Lizard", 3, 2, {
    fight: ev => { if(ev.where === "SEWERS") eachOtherPlayerVM(p => gainWoundEv(ev, p)); }, // TODO fight ev.where
  })],
// You can't defeat Venom unless you have a [Covert] Hero.
// ESCAPE: Each player gains a Wound.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Spider-Foes", "Venom", 5, 3, {
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
  })],
]},
]);
