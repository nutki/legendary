"use strict";
addVillainTemplates("Legendary", [
{ name: "Brotherhood", cards: [
// You can't defeat Blob unless you have an X-Men Hero.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Brotherhood", "Blob", 4, 2, {
    fightCond: () => revealable().has("X-Men"),
    fightCost: ev => revealOrEv(ev, "X-Men", () => {}),
  })],
// AMBUSH: Each player KOs two Heroes from their discard pile.
// ESCAPE: Each player KOs two Heroes from their hand.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Brotherhood", "Juggernaut", 6, 4, {
    ambush: ev => eachPlayer(p => selectObjectsEv(ev, "KO two heroes from discard", 2, p.discard.limit(isHero), sel => KOEv(ev, sel), p)),
    escape: ev => eachPlayer(p => selectObjectsEv(ev, "KO two heroes from hand", 2, p.hand.limit(isHero), sel => KOEv(ev, sel), p)),
  })],
// ESCAPE: Mystique becomes a Scheme Twist that takes effect immediately.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Brotherhood", "Mystique", 5, 3, {
    escape: ev => playTwistEv(ev, ev.source),
  })],
// FIGHT: Each player reveals an X-Men Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Brotherhood", "Sabretooth", 5, 3, {
    fight: ev => eachPlayer(p => revealOrEv(ev, "X-Men", () => gainWoundEv(ev, p), p)),
    escape: ev => eachPlayer(p => revealOrEv(ev, "X-Men", () => gainWoundEv(ev, p), p)),
  })],
]},
{ name: "Enemies of Asgard", cards: [
// FIGHT: KO all your S.H.I.E.L.D. Heroes.
// ESCAPE: Each player KOs two of their Heroes.
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Enemies of Asgard", "Destroyer", 7, 5, {
    fight: ev => yourHeroes().limit("S.H.I.E.L.D.").forEach(c => KOEv(ev, c)),
    escape: ev => eachPlayer(p => selectObjectsEv(ev, "Choose Heroes to KO", 2, yourHeroes(p), sel => KOEv(ev, sel), p)),
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
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p)),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p)),
  })],
// AMBUSH: Each player reveals a [Ranged] Hero or gains a Wound.
// FIGHT: Choose a player. That player KOs any number of Wounds from their hand and discard pile.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Enemies of Asgard", "Ymir, Frost Giant King", 6, 4, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p)),
    fight: ev => selectPlayerEv(ev, psel => selectObjectsAnyEv(ev, "KO any Wounds", handOrDiscard(psel).limit(isWound), sel => KOEv(ev, sel), psel)),
  })],
]},
{ name: "HYDRA", cards: [
// FIGHT: Play the top two cards of the Villain Deck.
// ATTACK: 4
// VP: 3
  [ 3, makeVillainCard("HYDRA", "Endless Armies of HYDRA", 4, 3, {
    fight: ev => repeat(2, () => villainDrawEv(ev)),
  })],
// FIGHT: You may gain a S.H.I.E.L.D. Officer.
// ATTACK: 3
// VP: 1
  [ 3, makeVillainCard("HYDRA", "HYDRA Kidnappers", 3, 1, {
    fight: ev => gameState.officer.withTop(c => chooseMayEv(ev, "Gain S.H.I.E.L.D. Officer", ev => gainEv(ev, c))),
  })],
// Supreme HYDRA is worth +3 VP for each other HYDRA Villain in your Victory Pile.
// ATTACK: 6
// VP: 3*
  [ 1, makeVillainCard("HYDRA", "Supreme HYDRA", 6, 3, {
    varVP: c => 3 * owner(c).victory.count(isGroup("HYDRA")),
  })],
// FIGHT: Each player without another HYDRA Villain in their Victory Pile gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("HYDRA", "Viper", 5, 3, {
    fight: ev => eachPlayer(p => { if (!p.victory.has(isGroup("HYDRA"))) gainWoundEv(ev, p); }),
    escape: ev => eachPlayer(p => { if (!p.victory.has(isGroup("HYDRA"))) gainWoundEv(ev, p); }),
  })],
]},
{ name: "Masters of Evil", cards: [
// FIGHT: For each of your Avengers Heroes, rescue a Bystander.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Masters of Evil", "Baron Zemo", 6, 4, {
    fight: ev => rescueEv(ev, yourHeroes().limit("Avengers").length),
  })],
// FIGHT: Each player reveals the top card of their deck. For each card, you choose to KO it or put it back.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Masters of Evil", "Melter", 5, 3, {
    fight: ev => eachPlayer(p => lookAtDeckEv(ev, 1, ev => selectCardOptEv(ev, "Choose a card to KO", p.revealed.deck, sel => KOEv(ev, sel)), p, playerState)),
  })],
// Ultron is worth +1 VP for each [Tech] Hero you have among all your cards at the end of the game.
// ESCAPE: Each player reveals a [Tech] Hero or gains a Wound.
// ATTACK: 6
// VP: 2+
  [ 2, makeVillainCard("Masters of Evil", "Ultron", 6, 2, {
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainWoundEv(ev, p), p)),
    varVP: c => 2 + owned(owner(c)).count(Color.TECH)
  })],
// FIGHT: If you fight Whirlwind on the Rooftops or Bridge, KO two of your Heroes.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Masters of Evil", "Whirlwind", 4, 2, {
    fight: ev => { if(isLocation(ev.where, "ROOFTOPS", "BRIDGE")) selectObjectsEv(ev, "Choose Heroes to KO", 2, yourHeroes(), sel => KOEv(ev, sel)); },
  })],
]},
{ name: "Radiation", cards: [
// FIGHT: If you fight Abomination on the Streets or Bridge, rescue three Bystanders.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Radiation", "Abomination", 5, 3, {
    fight: ev => { if(isLocation(ev.where, "STREETS", "BRIDGE")) rescueEv(ev, 3); },
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
    fight: ev => selectObjectsEv(ev, "KO your heroes", yourHeroes().count(Color.STRENGTH), yourHeroes(), sel => KOEv(ev, sel))
  })],
// FIGHT: Each player reveals a [Strength] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Radiation", "Zzzax", 5, 3, {
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p)),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p)),
  })],
]},
{ name: "Skrulls", cards: [
// FIGHT: Choose a Hero in the HQ for each player. Each player gains that Hero.
// ATTACK: 8
// VP: 3
  [ 1, makeVillainCard("Skrulls", "Paibok the Power Skrull", 8, 3, {
    fight: ev => {
      let selected: Card[] = [];
      eachPlayerEv(ev, ev => selectCardEv(ev, `Choose a hero for ${ev.who.name} to gain`, HQCards().limit(c => !selected.includes(c)), sel => selected.push(sel)));
      eachPlayerEv(ev, ev => gainEv(ev, selected.shift()));
    }
  })],
// AMBUSH: Put the highest-cost Hero from the HQ under this Villain. This Villain's Attack is equal to that Hero's Cost.
// FIGHT: Gain that Hero.
// ATTACK: *
// VP: 4
  [ 1, makeVillainCard("Skrulls", "Skrull Queen Veranke", 0, 4, {
    ambush: ev => selectCardEv(ev, "Choose a highest-cost Hero", HQCardsHighestCost(), sel => attachCardEv(ev, sel, ev.source, "SKRULL_CAPTURE")),
    // ambush: ev => HQCards().withHighest(c => c.cost, c => attachCardEv(ev, c, ev.source, "SKRULL_CAPTURE")),
    fight: ev => ev.source.attached("SKRULL_CAPTURE").each(c => gainEv(ev, c)),
    varDefense: c => c.attached("SKRULL_CAPTURE").sum(c=> c.cost),
  })],
// AMBUSH: Put the rightmost Hero from the HQ under this Villain. This Villain's Attack is equal to that Hero's Cost.
// FIGHT: Gain that Hero
// ATTACK: *
// VP: 2
  [ 3, makeVillainCard("Skrulls", "Skrull Shapeshifters", 0, 2, {
    ambush: ev => HQCards().withLast(c => attachCardEv(ev, c, ev.source, "SKRULL_CAPTURE")),
    fight: ev => ev.source.attached("SKRULL_CAPTURE").each(c => gainEv(ev, c)),
    varDefense: c => c.attached("SKRULL_CAPTURE").sum(c => c.cost),
  })],
// FIGHT: Each player KOs one of their Heroes.
// ATTACK: 4
// VP: 2
  [ 3, makeVillainCard("Skrulls", "Super-Skrull", 4, 2, {
    fight: ev => eachPlayer(p => selectCardAndKOEv(ev, revealable(p), p)),
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
    fight: ev => { if(isLocation(ev.where, "SEWERS")) eachOtherPlayerVM(p => gainWoundEv(ev, p)); },
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
addVillainTemplates("Dark City", [
{ name: "Emissaries of Evil", cards: [
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Villain, play it.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Emissaries of Evil", "Egghead", 4, 2, {
    ambush: ev => revealVillainDeckEv(ev, 1, c => c.limit(isVillain).each(c => villainDrawEv(ev, c)))
  })],
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Scheme Twist, play it.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Emissaries of Evil", "Electro", 6, 4, {
    ambush: ev => revealVillainDeckEv(ev, 1, c => c.limit(isTwist).each(c => playTwistEv(ev, c)))
  })],
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Bystander, Gladiator captures it.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Emissaries of Evil", "Gladiator", 5, 3, {
    ambush: ev => revealVillainDeckEv(ev, 1, c => c.limit(isBystander).each(c => captureEv(ev, ev.source, c)))
  })],
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Master Strike, each player gains a Wound.
// ESCAPE: Each player gains a Wound.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Emissaries of Evil", "Rhino", 5, 3, {
    ambush: ev => revealVillainDeckEv(ev, 1, c => c.limit(isStrike).each(c => eachPlayer(p => gainWoundEv(ev, p)))),
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
  })],
]},
{ name: "Four Horsemen", cards: [
// FIGHT: Each other player reveals their hand and KOs one of their Heroes that costs 1 or more.
// ESCAPE: Each player does that same effect.
// ATTACK: 7
// VP: 5
  [ 2, makeVillainCard("Four Horsemen", "Death", 7, 5, {
    fight: ev => eachOtherPlayerVM(p => selectCardAndKOEv(ev, p.hand.limit(c => c.cost >= 1), p)), // TODO multiplayer reveal
    escape: ev => eachPlayer(p => selectCardAndKOEv(ev, p.hand.limit(c => c.cost >= 1), p)),
  })],
// FIGHT: Each other player reveals an [Instinct] Hero or discards a card.
// ESCAPE: Each player does that same effect.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Four Horsemen", "Famine", 4, 2, {
    fight: ev => eachOtherPlayerVM(p => revealOrEv(ev, Color.INSTINCT, () => pickDiscardEv(ev, p), p)),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => pickDiscardEv(ev, p), p)),
  })],
// FIGHT: Each other player reveals the top three cards of their deck, discards each of those cards that costs 1 or more, and puts the rest back in any order.
// ESCAPE: Each player does that same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Four Horsemen", "Pestilence", 5, 3, {
    fight: ev => eachOtherPlayerVM(p => lookAtDeckEv(ev, 3, ev => p.revealed.limit(c => c.cost >= 1).each(c => discardEv(ev, c)), p)), // TODO multiplayer reveal
    escape: ev => eachPlayer(p => lookAtDeckEv(ev, 3, ev => p.revealed.limit(c => c.cost >= 1).each(c => discardEv(ev, c)), p)),
  })],
// FIGHT: Each other player reveals an [Instinct] Hero or gains a Wound.
// ESCAPE: Each player does that same effect.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Four Horsemen", "War", 6, 4, {
    fight: ev => eachOtherPlayerVM(p => revealOrEv(ev, Color.INSTINCT, () => gainWoundEv(ev, p), p)),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainWoundEv(ev, p), p)),
  })],
]},
{ name: "Marauders", cards: [
// Blockbuster gets +2 Attack for each Bystander he has.
// AMBUSH: If there is a Villain in the Bank that Villain and Blockbuster each capture a Bystander.
// ATTACK: 4+
// VP: 2
  [ 2, makeVillainCard("Marauders", "Blockbuster", 4, 2, {
    ambush: ev => villainIn("BANK").withFirst(c => { captureEv(ev, c); captureEv(ev, ev.source); }),
    varDefense: c => c.printedDefense + 2 * c.captured.count(isBystander)
  })],
// Chimera gets +3 Attack for each Bystander she has.
// AMBUSH: Reveal the top three cards of the Villain Deck. Chimera captures all the Bystander cards you revealed. Put the rest back in random order.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("Marauders", "Chimera", 3, 3, {
    ambush: ev => revealVillainDeckEv(ev, 3, r => r.limit(isBystander).each(c => captureEv(ev, ev.source, c))),
    varDefense: c => c.printedDefense + 3 * c.captured.count(isBystander)
  })],
// Scalphunter gets +1 Attack for each Bystander he has.
// AMBUSH: Each player chooses a Bystander from their Victory Pile. Scalphunter captures those Bystanders.
// ATTACK: 4+
// VP: 2
  [ 2, makeVillainCard("Marauders", "Scalphunter", 4, 2, {
    ambush: ev => eachPlayer(p => selectCardEv(ev, "Choose a Bystander for Scalphunter", p.victory.deck.limit(isBystander), c => captureEv(ev, ev.source, c), p)),
    varDefense: c => c.printedDefense + c.captured.count(isBystander)
  })],
// FIGHT: Each player discards all the cards in their hand, then draws as many cards as they discarded.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Marauders", "Vertigo", 5, 3, {
    fight: ev => eachPlayer(p => { discardHandEv(ev, p); drawEv(ev, p.hand.size, p); }),
  })],
]},
{ name: "MLF", cards: [
// To fight Forearm, you must also reveal four Hero cards with different card names.
// ATTACK: 4*
// VP: 4
  [ 2, makeVillainCard("MLF", "Forearm", 4, 4, {
    fightCond: () => revealable().limit(isHero).uniqueCount(c => c.cardName) >= 4
    // fightCost: TODO multiplayer reveal
  })],
// ESCAPE: Reignfire becomes a Master Strike that takes effect immediately.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("MLF", "Reignfire", 6, 4, {
    escape: ev => playStrikeEv(ev, ev.source),
  })],
// FIGHT: If you fight Wildside in the Sewers or Bank, KO two of your Heroes.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("MLF", "Wildside", 5, 3, {
    fight: ev => {if (isLocation(ev.where, "SEWERS", "BANK")) selectObjectsEv(ev, "KO two Heroes", 2, yourHeroes(), c => KOEv(ev, c)); },
  })],
// To fight Zero, you must also discard three cards that cost 0.
// ATTACK: 0*
// VP: 2
  [ 2, makeVillainCard("MLF", "Zero", 0, 2, {
    fightCond: () => playerState.hand.count(c => c.cost === 0) >= 3,
    fightCost: ev => selectObjectsEv(ev, "Discard three cards", 3, playerState.hand.deck.filter(c => c.cost === 0), c => KOEv(ev, c))
  })],
]},
{ name: "Streets of New York", cards: [
// FIGHT: KO one of your Heroes with a Recruit icon and one of your Heroes with an Attack icon.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Streets of New York", "Bullseye", 6, 4, {
    fight: ev => { selectCardAndKOEv(ev, yourHeroes().limit(hasRecruitIcon)); selectCardAndKOEv(ev, yourHeroes().limit(hasAttackIcon)); },
  })],
// {BRIBE}
// FIGHT: KO one of your Heroes with a Recruit icon.
// ATTACK: 5*
// VP: 2
  [ 2, makeVillainCard("Streets of New York", "Hammerhead", 5, 2, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes().limit(hasRecruitIcon)),
    bribe: true,
  })],
// AMBUSH: Each player discards three cards, then draws two cards.
// {BRIBE}
// ATTACK: 11*
// VP: 5
  [ 2, makeVillainCard("Streets of New York", "Jigsaw", 11, 5, {
    ambush: ev => eachPlayer(p => { selectObjectsEv(ev, "Discard three cards", 3, p.hand.deck, c => discardEv(ev, c), p); drawEv(ev, 2, p); }),
    bribe: true,
  })],
// {BRIBE}
// ESCAPE: Each player reveals a [Strength] Hero or gains a Wound.
// ATTACK: 8*
// VP: 4
  [ 2, makeVillainCard("Streets of New York", "Tombstone", 8, 4, {
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p)),
    bribe: true,
  })],
]},
{ name: "Underworld", cards: [
// FIGHT: A card in your hand gains Teleport this turn.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Underworld", "Azazel", 4, 2, {
    fight: ev => selectCardEv(ev, "Give a card Teleport", playerState.hand.deck, c => addTurnSet('teleport', e => e === c, () => true)),
  })],
// AMBUSH: The player to your right reveals a Marvel Knights Hero or gains a Wound.
// FIGHT: Same effect.
// ESCAPE: Same effect.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Underworld", "Blackheart", 6, 4, {
    ambush: ev => revealOrEv(ev, "Marvel Knights", () => gainWoundEv(ev, playerState.right), playerState.right),
    fight: ev => revealOrEv(ev, "Marvel Knights", () => gainWoundEv(ev, playerState.right), playerState.right),
    escape: ev => revealOrEv(ev, "Marvel Knights", () => gainWoundEv(ev, playerState.right), playerState.right),
  })],
// AMBUSH: Dracula captures the top card of the Hero Deck. Dracula gets + Attack equal to that card's Cost.
// FIGHT: Gain that card.
// ATTACK: 3+
// VP: 4
  [ 2, makeVillainCard("Underworld", "Dracula", 3, 4, {
    ambush: ev => gameState.herodeck.withTop(c => attachCardEv(ev, c, ev.source, "DRACULA_CAPTURE")),
    fight: ev => ev.source.attached("DRACULA_CAPTURE").each(c => gainEv(ev, c)),
    varDefense: c => c.printedDefense + c.attached("DRACULA_CAPTURE").sum(c => c.cost),
  })],
// ESCAPE: Each player without Dracula in their Victory Pile gains a Wound.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Underworld", "Lilith, Daughter of Dracula", 5, 3, {
    escape: ev => eachPlayer(p => p.victory.has(c => c.cardName === "Dracula") || gainWoundEv(ev, p)),
  })],
]},
]);
addVillainTemplates("Fantastic Four", [
{ name: "Heralds of Galactus", cards: [
// Cosmic Threat: [Ranged]
// FIGHT: Each player reveals a [Ranged] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 9*
// VP: 4
  [ 2, makeVillainCard("Heralds of Galactus", "Firelord", 9, 4, {
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p)),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p)),
    cardActions: [ cosmicThreatAction(Color.RANGED) ],
  })],
// Cosmic Threat: [Instinct]
// AMBUSH: Put each non-[Instinct] Hero from the HQ on the bottom of the Hero Deck.
// ATTACK: 12*
// VP: 6
  [ 2, makeVillainCard("Heralds of Galactus", "Morg", 12, 6, {
    ambush: ev => HQCards().limit(c => isHero(c) && !isColor(Color.INSTINCT)(c)).each(c => moveCardEv(ev, c, gameState.herodeck, true)),
    cardActions: [ cosmicThreatAction(Color.INSTINCT) ],
  })],
// Cosmic Threat: [Covert]
// FIGHT: Choose one of your [Covert] Heroes. When you draw a new hand of cards at the end of this turn, add that Hero to your hand as a seventh card.
// ATTACK: 10*
// VP: 5
  [ 2, makeVillainCard("Heralds of Galactus", "Stardust", 10, 5, {
    fight: ev => selectCardEv(ev, "Choose a Covert hero", yourHeroes().limit(Color.COVERT), sel => addTurnTrigger("CLEANUP", undefined, ev => moveCardEv(ev, sel, playerState.hand))),
    cardActions: [ cosmicThreatAction(Color.COVERT) ],
  })],
// Cosmic Threat: [Strength]
// AMBUSH: For each [Strength] Hero in the HQ, Terrax captures a Bystander.
// ATTACK: 11*
// VP: 5
  [ 2, makeVillainCard("Heralds of Galactus", "Terrax the Tamer", 11, 5, {
    ambush: ev => captureEv(ev, ev.source, HQCards().count(Color.STRENGTH)),
    cardActions: [ cosmicThreatAction(Color.STRENGTH) ],
  })],
]},
{ name: "Subterranea", cards: [
// FIGHT: When you draw a new hand of cards at the end of this turn, draw two extra cards.
// Burrow
// ATTACK: 7
// VP: 4
  [ 2, makeVillainCard("Subterranea", "Giganto", 7, 4, {
    fight: [ ev => addEndDrawMod(2), burrowEv ],
  })],
// AMBUSH: Megataur captures two Bystanders.
// Burrow
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Subterranea", "Megataur", 6, 4, {
    fight: burrowEv,
    ambush: ev => captureEv(ev, ev.source, 2),
  })],
// FIGHT: KO one of your Heroes.
// Burrow
// ATTACK: 3
// VP: 2
  [ 2, makeVillainCard("Subterranea", "Moloids", 3, 2, {
    fight: [ ev => selectCardAndKOEv(ev, yourHeroes()), burrowEv ],
  })],
// AMBUSH: Any Villain in the Streets moves to the Bridge, pushing any Villain already there to escape.
// Burrow
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Subterranea", "Ra'ktar the Molan King", 4, 2, {
    fight: burrowEv,
    ambush: ev => villainIn('STREETS').each(c => withCity('BRIDGE', bridge => {
      bridge.limit(isVillain).each(c => villainEscapeEv(ev, c));
      moveCardEv(ev, c, bridge);
    })),
  })],
]},
]);
addVillainTemplates("Paint the Town Red", [
{ name: "Maximum Carnage", cards: [
// {FEAST}
// Whenever Carrion feasts on a Hero that costs 1 or more, put Carrion back in the city space where he was.
// ATTACK: 4
// VP: 3
  [ 2, makeVillainCard("Maximum Carnage", "Carrion", 4, 3, {
    fight: ev => feastEv(ev, c => isHero(c) && c.cost >= 1 && moveCardEv(ev, ev.source, ev.where))
  })],
// AMBUSH: Demogoblin captures a Bystander.
// {FEAST}
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Maximum Carnage", "Demogoblin", 5, 3, {
    fight: feastEv,
    ambush: ev => captureEv(ev, ev.source),
  })],
// Doppelganger's Attack is equal to the Cost of the Hero in the HQ space under him.
// {FEAST}
// ATTACK: *
// VP: 3
  [ 2, makeVillainCard("Maximum Carnage", "Doppelganger", u, 3, {
    fight: feastEv,
    varDefense: c => heroBelow(c).sum(c => c.cost),
  })],
// {FEAST}
// When Shriek feasts on a 0-cost Hero, each other player gains a Wound.
// ESCAPE: Each player gains a Wound.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Maximum Carnage", "Shriek", 6, 4, {
    fight: ev => feastEv(ev, c => isHero(c) && !c.cost && eachOtherPlayerVM(p => gainWoundEv(ev, p))),
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
  })],
]},
{ name: "Sinister Six", cards: [
// FIGHT: Copy the effects of the Hero in the HQ space under Chameleon, including its Recruit and Attack.
// ATTACK: 6
// VP: 2
  [ 1, makeVillainCard("Sinister Six", "Chameleon", 6, 2, {
    fight: ev => heroBelow(ev.source).withFirst(c => playCardEffects(ev, c)),
  })],
// AMBUSH: Each Sinister Six Villain captures a Bystander.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Sinister Six", "Hobgoblin", 5, 3, {
    ambush: ev => villains().filter(c => c.villainGroup === "Sinister Six").each(v => captureEv(ev, v)),
  })],
// Kraven's Attack is equal to the Cost of the highest-cost Hero in the HQ.
// ESCAPE: (After you do the normal escape KO) KO a Hero from the HQ with the highest cost.
// ATTACK: *
// VP: 4
  [ 1, makeVillainCard("Sinister Six", "Kraven the Hunter", u, 4, {
    escape: ev => selectCardEv(ev, "KO a Hero from HQ with the highest cost", HQCardsHighestCost(), c => KOEv(ev, c)),
    varDefense: c => HQCardsHighestCost().firstOnly().sum(c => c.cost)
  })],
// Sandman's Attack is twice the number of Villains in the city.
// ESCAPE: Each player reveals an [Instinct] Hero or gains a Wound.
// ATTACK: *
// VP: 4
  [ 1, makeVillainCard("Sinister Six", "Sandman", undefined, 4, {
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainWoundEv(ev, p), p)),
    varDefense: () => CityCards().limit(isVillain).size * 2
  })],
// AMBUSH: Each player reveals an [Instinct] Hero or discards a card.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Sinister Six", "Shocker", 5, 3, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => pickDiscardEv(ev, p), p)),
  })],
// AMBUSH: (After Vulture enters the city) If there is a Villain on the Rooftops or Bridge, swap Vulture with one of those Villains.
// ESCAPE: Each player reveals an [Instinct] Hero or gains a Wound.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Sinister Six", "Vulture", 4, 2, {
    ambush: ev => selectCardEv(ev, "Select Villains to swap Vulture with", CityCards().limit(c => isVillain(c) && isLocation(c.location, 'ROOFTOPS', 'BRIDGE')), c => swapCardsEv(ev, ev.source.location, c.location)),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainWoundEv(ev, p), p)),
  })],
]},
]);
addVillainTemplates("Villains", [
{ name: "Avengers", cards: [
// ATTACK: 3*
// VP: 2
// Elusive 4
  [ 2, makeVillainCard("Avengers", "Ant-Man", 3, 2, {
    fightCost: elusive(4),
  })],
// ATTACK: 4+
// VP: 5
// AMBUSH: Each player reveals three colors of Allies or gains a Bindings. (Grey is a color.)
// FIGHT: Same effect. Captain America gets +1 Attack for each color of Ally in the Lair.
// ESCAPE: Demolish each player.
  [ 1, makeVillainCard("Avengers", "Captain America", 4, 5, {
    ambush: ev => eachPlayer(p => numColors(yourHeroes(p)) >= 3 || gainBindingsEv(ev, p)),
    fight: ev => eachPlayer(p => numColors(yourHeroes(p)) >= 3 || gainBindingsEv(ev, p)),
    escape: demolishEv,
    varDefense: c => c.printedDefense + numColors(HQCards().limit(isHero)),
  })],
// ATTACK: 8
// VP: 6
// AMBUSH: Demolish each player twice.
// FIGHT: Same effect.
// ESCAPE: Same effect.
  [ 1, makeVillainCard("Avengers", "Hulk", 8, 6, {
    ambush: [ demolishEv, demolishEv ],
    fight: [ demolishEv, demolishEv ],
    escape: [ demolishEv, demolishEv ],
  })],
// ATTACK: 7
// VP: 5
// AMBUSH: Each player reveals a [Tech] Ally or gains a Bindings.
// FIGHT: Same effect.
// ESCAPE: Demolish each player.
  [ 1, makeVillainCard("Avengers", "Iron Man", 7, 5, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainBindingsEv(ev, p))),
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainBindingsEv(ev, p))),
    escape: demolishEv,
  })],
// ATTACK: 7
// VP: 5
// AMBUSH: KO each Ally from the Lair that costs 7 Cost or more.
// FIGHT: Same effect.
// ESCAPE: Demolish each player.
  [ 1, makeVillainCard("Avengers", "Thor", 7, 5, {
    ambush: ev => HQCards().limit(isHero).limit(c => c.cost >= 7).each(c => KOEv(ev, c)),
    fight: ev => HQCards().limit(isHero).limit(c => c.cost >= 7).each(c => KOEv(ev, c)),
    escape: demolishEv,
  })],
// ATTACK: 1*
// VP: 4
// Elusive 7
  [ 2, makeVillainCard("Avengers", "Wasp", 1, 4, {
    fightCond: elusive(7)
  })],
]},
{ name: "Defenders", cards: [
// ATTACK: 5
// VP: 3
// FIGHT: The next Ally you recruit this turn goes on top of your deck.
// ESCAPE: Each player reveals the top card of their deck and if it costs 1 Cost or more, discards it.
  [ 2, makeVillainCard("Defenders", "Daredevil", 5, 3, {
    fight: ev => turnState.nextHeroRecruit = "DECK",
  })],
// ATTACK: 3*
// VP: 2
// To fight Iron Fist, you must also reveal three Allies with different costs.
  [ 2, makeVillainCard("Defenders", "Iron Fist", 3, 2, {
  })],
// ATTACK: 6
// VP: 4
// AMBUSH: If any other Defenders Adversaries are in the city, each player gains a Bindings.
// FIGHT: Same Effect.
// ESCAPE: Same Effects.
  [ 2, makeVillainCard("Defenders", "Namor, The Sub-Mariner", 6, 4, {
    ambush: ev => CityCards().has(c => c.villainGroup === "Defenders" && c != ev.source) && eachPlayer(p => gainBindingsEv(ev, p)),
    fight: ev => CityCards().has(c => c.villainGroup === "Defenders" && c != ev.source) && eachPlayer(p => gainBindingsEv(ev, p)),
    escape: ev => CityCards().has(c => c.villainGroup === "Defenders" && c != ev.source) && eachPlayer(p => gainBindingsEv(ev, p)),
  })],
// ATTACK: 4
// VP: 2
// FIGHT: Each player reveals the top three cards of their deck. You choose which players discard them and which players put them back on top in the order of their choice.
  [ 2, makeVillainCard("Defenders", "Luke Cage", 4, 2, {
    fight: ev => eachPlayer(p => lookAtDeckEv(ev, 3, () => chooseMayEv(ev, "Discard revealed", () => p.revealed.deck.each(c => discardEv(ev, c))), p)),
  })],
]},
{ name: "Marvel Knights", cards: [
// ATTACK: 4
// VP: 2
// FIGHT: Each player draws a card.
  [ 2, makeVillainCard("Marvel Knights", "Black Panther", 4, 2, {
    fight: ev => eachPlayer(p => drawEv(ev, 1, p)),
  })],
// ATTACK: 4
// VP: 2
// FIGHT: KO one of your Allies. Then KO a Bindings from your hand or discard pile.
  [ 2, makeVillainCard("Marvel Knights", "Elektra", 4, 2, {
    fight: [ ev => selectCardAndKOEv(ev, yourHeroes()), ev => selectCardAndKOEv(ev, handOrDiscard().limit(isBindings))],
  })],
// ATTACK: 6
// VP: 4
// FIGHT: Reveal the top card of your deck. If it costs 0 Cost, KO it.
// ESCAPE: Each player reveals the top card of their deck and if it costs 1 Cost or more, KOs it.
  [ 2, makeVillainCard("Marvel Knights", "Punisher", 6, 4, {
    fight: ev => lookAtDeckEv(ev, 1, () => playerState.revealed.limit(c => !c.cost).each(c => KOEv(ev, c))),
    escape: ev => eachPlayer(p => lookAtDeckEv(ev, 1, () => p.revealed.limit(c => c.cost >= 1).each(c => KOEv(ev, c)), p)),
  })],
// ATTACK: 5
// VP: 3
// FIGHT: You may KO another Adversary from your Victory Pile. If you do, you get +3 Recruit.
// ESCAPE: Each player may KO an Adversary from their Victory Pile. Any player who does not do so gains a Bindings.
  [ 2, makeVillainCard("Marvel Knights", "Ghost Rider", 5, 3, {
    fight: ev => selectCardOptEv(ev, "KO an adversary", playerState.victory.limit(isVillain).limit(c => c !== ev.source), c => { KOEv(ev, c); addRecruitEvent(ev, 3); }),
    escape: ev => eachPlayer(p => selectCardOptEv(ev, "KO an adversary", p.victory.limit(isVillain), c => KOEv(ev, c), () => gainBindingsEv(ev, p), p)),
  })],
]},
{ name: "Spider Friends", cards: [
// ATTACK: 2*
// VP: 2
// Elusive 6.
// FIGHT: Each player reveals the top card of their deck. Choose any number of those cards to be discarded.
  [ 2, makeVillainCard("Spider Friends", "Black Cat", 2, 2, {
    fight: ev => eachPlayer(p => lookAtDeckEv(ev, 1, () => selectCardOptEv(ev, "Discard revealed", p.revealed.deck, c => discardEv(ev, c)), p)),
  })],
// ATTACK: 5
// VP: 3
// FIGHT: Reveal the top card of your deck. If it has a Recruit icon, KO it.
// ESCAPE: Each player reveals the top card of their deck, and if it has an Attack icon, KO it.
  [ 2, makeVillainCard("Spider Friends", "Firestar", 5, 3, {
    fight: ev => lookAtDeckEv(ev, 1, () => playerState.revealed.limit(hasRecruitIcon).each(c => KOEv(ev, c))),
    escape: ev => eachPlayer(p => lookAtDeckEv(ev, 1, () => p.revealed.limit(hasAttackIcon).each(c => KOEv(ev, c)), p)),
  })],
// ATTACK: 4
// VP: 2
// FIGHT: KO one of your Allies. Then, if you fought Moon Knight on the Rooftops, KO another of your Allies.
  [ 2, makeVillainCard("Spider Friends", "Moon Knight", 4, 2, {
    fight: [ ev => selectCardAndKOEv(ev, yourHeroes()), ev => isLocation(ev.where, 'ROOFTOPS') && selectCardAndKOEv(ev, yourHeroes()) ]
  })],
// ATTACK: 2
// VP: 3
// FIGHT: Reveal the top card of the Adversary Deck. If that card is worth 2 Victory Points or less, play it. If you play a card from the Adversary Deck this way, put Spider-Man back on top of the Adversary Deck.
// ESCAPE: Each player gains a Bindings.
  [ 2, makeVillainCard("Spider Friends", "Spider-Man", 2, 3, {
    fight: ev => revealVillainDeckEv(ev, 1, cards => cards.limit(c => c.vp <= 2).each(c => { villainDrawEv(ev, c); moveCardEv(ev, ev.source, gameState.villaindeck); })),
    escape: ev => eachPlayer(p => gainBindingsEv(ev, p)),
  })],
]},
{ name: "Uncanny Avengers", cards: [
// ATTACK: 4+
// VP: 2
// X-Treme Attack.
// AMBUSH: Each player who does not reveal a Ranged Ally discards two cards, then draws a card.
  [ 2, makeVillainCard("Uncanny Avengers", "Havok", 4, 2, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => { pickDiscardEv(ev, p); pickDiscardEv(ev, p); drawEv(ev, 2, p); })),
    varDefense: xTremeAttack,
    xTremeAttack: true,
  })],
// ATTACK: 4+
// VP: 2
// X-Treme Attack.
// FIGHT: Each other player discards the top card of their deck. Play a copy of one of those Allies.
  [ 2, makeVillainCard("Uncanny Avengers", "Rogue", 4, 2, {
    fight: ev => {
      let revealed: Card[] = [];
      eachPlayer(p => lookAtDeckEv(ev, 1, () => { p.revealed.limit(isHero).each(c => revealed.push(c)); discardEv(ev, p.revealed.top); }));
      repeat(gameState.players.size, () => selectCardEv(ev, "Choose a card to copy", revealed, sel => {
        playCopyEv(ev, sel);
        revealed = revealed.limit(c => c !== sel);
      }));
    },
    varDefense: xTremeAttack,
    xTremeAttack: true,
  })],
// ATTACK: 5
// VP: 3
// FIGHT: Reveal the top three cards of your deck. Put any that have odd-numbered costs into your hand and discard the rest. (0 is even.)
  [ 2, makeVillainCard("Uncanny Avengers", "Scarlet Witch", 5, 3, {
    fight: ev => lookAtDeckEv(ev, 3, () => playerState.revealed.each(c => isCostOdd(c) ? moveCardEv(ev, c, playerState.hand) : discardEv(ev, c))),
  })],
// ATTACK: 7+
// VP: 5
// X-Treme Attack.
// Wolverine gets +1 Attack for each card you've drawn this turn.
// ESCAPE: Each player reveals an [Instinct] Ally or gains a Bindings. Then shuffle Wolverine back into the Adversary deck.
  [ 2, makeVillainCard("Uncanny Avengers", "Wolverine", 7, 5, {
    varDefense: xTremeAttack,
    xTremeAttack: true,
    escape: ev => {
      eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainBindingsEv(ev, p)));
      shuffleIntoEv(ev, ev.source, gameState.villaindeck);
    },
  })],
]},
{ name: "Uncanny X-Men", cards: [
// ATTACK: 5+
// VP: 3
// X-Treme Attack.
// FIGHT: You may KO a Bindings from your hand or discard pile. If you don't, each other player gains a Bindings.
  [ 2, makeVillainCard("Uncanny X-Men", "Colossus", 5, 3, {
    fight: ev => selectCardOptEv(ev, "KO a Bindings", handOrDiscard(), c => KOEv(ev, c), () => eachOtherPlayerVM(p => gainBindingsEv(ev, p))),
    varDefense: xTremeAttack,
    xTremeAttack: true,
  })],
// ATTACK: 4+
// VP: 2
// X-Treme Attack.
// FIGHT: Choose an Ally you played this turn. When you draw a new hand of cards at the end of this turn, add that Ally to your new hand as an extra card.
  [ 2, makeVillainCard("Uncanny X-Men", "Nightcrawler", 4, 2, {
    fight: ev => selectCardEv(ev, "Choose an Ally played this turn", playerState.playArea.limit(isHero), sel => addTurnTrigger("CLEANUP", undefined, ev => moveCardEv(ev, sel, playerState.hand))),
    varDefense: xTremeAttack,
    xTremeAttack: true,
  })],
// ATTACK: 2*+
// VP: 2
// X-Treme Attack.
// Elusive 5
  [ 2, makeVillainCard("Uncanny X-Men", "Shadowcat", 2, 2, {
    fightCond: elusive(5),
    varDefense: xTremeAttack,
    xTremeAttack: true,
  })],
// ATTACK: 4+
// VP: 2
// X-Treme Attack.
// AMBUSH: (After Storm enters the city.) Move Storm to the Rooftops. If another Adversary is already there, swap them.
// FIGHT: If you fight Storm on the Rooftops, each other player gains a Bindings.
  [ 2, makeVillainCard("Uncanny X-Men", "Storm", 4, 2, {
    ambush: ev => withCity('ROOFTOPS', rooftops => swapCardsEv(ev, ev.source.location, rooftops)),
    fight: ev => isLocation(ev.where, 'ROOFTOPS') && eachOtherPlayerVM(p => gainBindingsEv(ev, p)),
    varDefense: xTremeAttack,
    xTremeAttack: true,
  })],
]},
{ name: "X-Men First Class", cards: [
// ATTACK: 4+
// VP: 2
// X-Treme Attack.
// FIGHT: Draws two cards, then discard a card.
  [ 2, makeVillainCard("X-Men First Class", "Angel", 4, 2, {
    fight: ev => { drawEv(ev, 2); pickDiscardEv(ev); },
    varDefense: xTremeAttack,
    xTremeAttack: true,
  })],
// ATTACK: 5+
// VP: 3
// X-Treme Attack.
// FIGHT: Draw a card for each [Ranged] Ally you played this turn.
  [ 2, makeVillainCard("X-Men First Class", "Iceman", 5, 3, {
    fight: ev => drawEv(ev, turnState.cardsPlayed.count(Color.RANGED)),
    xTremeAttack: true,
    varDefense: xTremeAttack,
  })],
// ATTACK: 6+
// VP: 4
// X-Treme Attack.
// AMBUSH: Jean Grey guards a Bystander for each Adversary in the city with X-Treme Attack (including Jean).
// FIGHT: You get +1 Recruit for each Bystander you kidnapped this turn.
  [ 1, makeVillainCard("X-Men First Class", "Jean Grey", 6, 4, {
    ambush: ev => captureEv(ev, ev.source, CityCards().count(c => c.xTremeAttack)),
    fight: ev => addRecruitEvent(ev, turnState.pastEvents.count(e => e.type === "RESCUE")),
    xTremeAttack: true,
    varDefense: xTremeAttack,
  })],
// ATTACK: 5+
// VP: 3
// X-Treme Attack.
// FIGHT: KO one of your Allies. Then KO another of your Allies if there are any other Adversaries in the city with X-Treme Attack.
  [ 2, makeVillainCard("X-Men First Class", "Beast", 5, 3, {
    fight: [
      ev => selectCardAndKOEv(ev, yourHeroes()),
      ev => CityCards().has(c => c.xTremeAttack && c !== ev.source) && selectCardAndKOEv(ev, yourHeroes()),
    ],
    xTremeAttack: true,
    varDefense: xTremeAttack,
  })],
// ATTACK: 6+
// VP: 4
// X-Treme Attack. To Fight Cyclops, you must also discard a card.
// ESCAPE: Each player reveals a Brotherhood Ally or discards a card.
  [ 1, makeVillainCard("X-Men First Class", "Cyclops", 6, 4, {
    fightCond: () => playerState.hand.size >= 1,
    fightCost: ev => pickDiscardEv(ev),
    xTremeAttack: true,
    varDefense: xTremeAttack,
  })],
]},
]);
addVillainTemplates("Guardians of the Galaxy", [
{ name: "Kree Starforce", cards: [
// Captain Atlas gets +1 Attack for each Shard on the Mastermind.
// ESCAPE: Each player loses a Shard. Each player that cannot do so gains a Wound.
// ATTACK: 6+
// VP: 4
  [ 1, makeVillainCard("Kree Starforce", "Captain Atlas", 6, 4, {
    escape: ev => eachPlayer(p => p.shard.size ? spendShardEv(ev, p) : gainWoundEv(ev, p)),
    varDefense: c => c.printedDefense + gameState.mastermind.deck.max(m => m.attached('SHARD').size),
  })],
// AMBUSH: Another Villain in the city gains two Shards.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Kree Starforce", "Demon Druid", 5, 3, {
    ambush: ev => selectCardEv(ev, "Choose a Villain", CityCards().limit(isVillain).limit(c => c !== ev.source), c => attachShardEv(ev, c, 2)),
  })],
// AMBUSH: Each Kree Villain in the city gains a Shard (including this Villain).
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Kree Starforce", "Dr. Minerva", 5, 3, {
    ambush: ev => CityCards().limit(isVillain).each(c => attachShardEv(ev, c)),
  })],
// AMBUSH: Each player may draw a card. Korath gains a Shard for each card drawn this way.
// ESCAPE: If Korath had any Shards, each player gains a Wound.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Kree Starforce", "Korath the Pursuer", 5, 3, {
    ambush: ev => {
      eachPlayer(p => chooseMayEv(ev, "Draw a card", () => drawEv(ev, 1, p)));
      cont(ev, () => attachShardEv(ev, ev.source, turnState.pastEvents.count(e => e.type === "DRAWONE" && e.parent === ev)));
    },
    escape: ev => turnState.pastEvents.has(e => e.type === "MOVECARD" && e.to === gameState.shard && ev.parent === e.parent) && eachPlayer(p => gainWoundEv(ev, p)),
  })],
// AMBUSH: Each player simultaneously points their finger to accuse another player. Each player who was accused the most gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Kree Starforce", "Ronan the Accuser", 7, 5, {
    ambush: ev => {
      const counts = new Map<Player, number>();
      gameState.players.each(p => counts.set(p, 0));
      eachPlayer(p => chooseOtherPlayerEv(ev, cp => counts.set(cp, counts.get(cp) + 1), p));
      cont(ev, () => {
        const max = [...counts.values()].max(v => v);
        gameState.players.limit(p => counts.get(p) === max).each(p => gainWoundEv(ev, p));
      });
    },
    escape: ev => {
      const counts = new Map<Player, number>();
      gameState.players.each(p => counts.set(p, 0));
      eachPlayer(p => chooseOtherPlayerEv(ev, cp => counts.set(cp, counts.get(cp) + 1), p));
      cont(ev, () => {
        const max = [...counts.values()].max(v => v);
        gameState.players.limit(p => counts.get(p) === max).each(p => gainWoundEv(ev, p));
      });
    },
  })],
// FIGHT: Put a Shard on each Hero in the HQ. When a player gains that Hero, they gain that Shard. If that Hero leaves the HQ some other way, return that Shard to the supply.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Kree Starforce", "Shatterax", 5, 3, {
    fight: ev => {
      if (!gameState.triggers.includes(extraShatteraxTriggers[0]))
        extraShatteraxTriggers.each(t => gameState.triggers.push(t));
      HQCards().limit(isHero).each(c => attachShardEv(ev, c));
    },
  })],
// AMBUSH: Supremor and the Mastermind each gain a Shard.
// ATTACK: 3
// VP: 2
  [ 2, makeVillainCard("Kree Starforce", "Supremor", 3, 2, {
    ambush: ev => { attachShardEv(ev, ev.source); gameState.mastermind.each(m => attachShardEv(ev, m)); },
  })],
]},
{ name: "Infinity Gems", cards: [
// AMBUSH: Mind Gem gains a Shard for each Scheme Twist in the KO pile and/or stacked next to the Scheme.
// FIGHT: Put this into your discard pile as an Artifact.
// Artifact - Once per turn, you get +2 Recruit.
// ATTACK: 6
// VP: 0
  [ 1, makeGainableCard(makeVillainCard("Infinity Gems", "Mind Gem", 6, u, {
    ambush: ev => attachShardEv(ev, ev.source, gameState.ko.count(isTwist) + gameState.scheme.attached("TWIST").size),
  }), u, u, 0, u, "D", ev => addRecruitEvent(ev, 2), { isArtifact: true }) ],
// AMBUSH: Power Gem gains a Shard for each Master Strike in the KO pile and/or stacked next to the Mastermind.
// FIGHT: Put this into your discard pile as an Artifact.
// Artifact - Once per turn, you get +2 Attack.
// ATTACK: 7
// VP: 0
  [ 1, makeGainableCard(makeVillainCard("Infinity Gems", "Power Gem", 7, u, {
    ambush: ev => attachShardEv(ev, ev.source, gameState.ko.count(isStrike) + gameState.mastermind.deck.sum(m => m.attached("STRIKE").size)),
  }), u, u, 0, u, "D", ev => addAttackEvent(ev, 2), { isArtifact: true }) ],
// AMBUSH: Reality Gem gains a Shard for each Infinity Gem Villain card in the city and/or Escape pile.
// FIGHT: Put this into your discard pile as an Artifact.
// Artifact - Before you play a card from the Villain Deck, you may first reveal the top card of the Villain Deck. If it's not a Scheme Twist, you may put it on the bottom of the Villain Deck. If you do, gain a Shard.
// ATTACK: 5
// VP: 0
  [ 2, makeGainableCard(makeVillainCard("Infinity Gems", "Reality Gem", 5, u, {
    ambush: ev => attachShardEv(ev, ev.source, CityCards().count(isGroup("Infinity Gems")) + gameState.escaped.count(isGroup("Infinity Gems"))),
  }), u, u, 0, u, "", [], { isArtifact: true, trigger: {
    event: "VILLAINDRAW",
    match: (ev, source) => owner(source) === playerState,
    before: ev => revealVillainDeckEv(ev, 1, cards => cards.limit(c => !isTwist(c)).each(c => chooseMayEv(ev, "Put on the bottom of the Villain Deck", () => { moveCardEv(ev, c, gameState.villaindeck, true); gainShardEv(ev); }))),
  } }) ],
// AMBUSH: Soul Gem gains a Shard for each Villain in the city.
// FIGHT: Put this into your discard pile as an Artifact.
// Artifact - Whenever you defeat a Villain, put a Shard on Soul Gem from the supply. Once per turn, you get + Attack equal to the number of Shards on Soul Gem.
// ATTACK: 6
// VP: 0
  [ 1, makeGainableCard(makeVillainCard("Infinity Gems", "Soul Gem", 6, u, {
    ambush: ev => attachShardEv(ev, ev.source, CityCards().count(isVillain)),
  }), u, u, 0, u, "", ev => addAttackEvent(ev, ev.source.attached('SHARD').size), { isArtifact: true, triggers: [{
    event: "MOVECARD",
    match: (ev, source) => ev.what === source,
    before: ev => ev.parent.what.attached('SHARD').each(c => moveCardEv(ev, c, gameState.shard)),
  }, {
    event: "DEFEAT",
    match: (ev, source) => owner(source) === playerState,
    after: ev => attachShardEv(ev, ev.source),
  }] }) ],
// AMBUSH: Space Gem gains a Shard for each empty space in the city.
// FIGHT: Put this into your discard pile as an Artifact.
// Artifact - Once per turn, you may move a Villain to another city space. If another Villain is already there, swap them. If you moved any Villains this way, gain a Shard.
// ATTACK: 5
// VP: 0
  [ 2, makeGainableCard(makeVillainCard("Infinity Gems", "Space Gem", 5, u, {
    ambush: ev => attachShardEv(ev, ev.source, gameState.city.count(l => l.size === 0)),
  }), u, u, 0, u, "", ev => {
    selectCardOptEv(ev, "Choose a Villain to move", CityCards().limit(isVillain), v => {
      selectCardEv(ev, "Choose a new city space", gameState.city.limit(l => l !== v.location), dest => swapCardsEv(ev, v.location, dest));
      gainShardEv(ev);
    });
  }, { isArtifact: true }) ],
// AMBUSH: Play another card from the Villain Deck. Time Gem gains Shards equal to that card's printed Victory Points.
// FIGHT: Put this into your discard pile as an Artifact.
// Artifact - When you play this Artifact, take another turn after this one. Use this ability only if this is the fist time any player has played the Time Gem this game.
// ATTACK: 6
// VP: 0
  [ 1, makeGainableCard(makeVillainCard("Infinity Gems", "Time Gem", 6, u, {
    ambush: ev => revealVillainDeckEv(ev, 1, cards => cards.each(c => {
      attachShardEv(ev, ev.source, c.vp);
      villainDrawEv(ev, c);
    })),
  }), u, u, 0, u, "", [], { isArtifact: true, trigger: {
    event: "PLAY",
    match: (ev, source) => ev.what === source,
    after: ev => gameState.extraTurn = true, // TODO mutliplayer, once per game
  }}) ],
]},
]);
