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
    escape: sameEffect,
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
    escape: sameEffect,
  })],
// AMBUSH: Each player reveals a [Ranged] Hero or gains a Wound.
// FIGHT: Choose a player. That player KOs any number of Wounds from their hand and discard pile.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Enemies of Asgard", "Ymir, Frost Giant King", 6, 4, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p)),
    fight: ev => choosePlayerEv(ev, psel => selectObjectsAnyEv(ev, "KO any Wounds", handOrDiscard(psel).limit(isWound), sel => KOEv(ev, sel), psel)),
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
    escape: sameEffect,
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
    escape: sameEffect,
  })],
]},
{ name: "Skrulls", cards: [
// FIGHT: Choose a Hero in the HQ for each player. Each player gains that Hero.
// ATTACK: 8
// VP: 3
  [ 1, makeVillainCard("Skrulls", "Paibok the Power Skrull", 8, 3, {
    fight: ev => {
      let selected: Card[] = [];
      eachPlayerEv(ev, ev => selectCardEv(ev, `Choose a hero for ${ev.who.name} to gain`, hqHeroes().limit(c => !selected.includes(c)), sel => selected.push(sel)));
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
    ambush: ev => hqHeroes().withLast(c => attachCardEv(ev, c, ev.source, "SKRULL_CAPTURE")),
    fight: ev => ev.source.attached("SKRULL_CAPTURE").each(c => gainEv(ev, c)),
    varDefense: c => c.attached("SKRULL_CAPTURE").sum(c => c.cost),
  })],
// FIGHT: Each player KOs one of their Heroes.
// ATTACK: 4
// VP: 2
  [ 3, makeVillainCard("Skrulls", "Super-Skrull", 4, 2, {
    fight: ev => eachPlayer(p => selectCardAndKOEv(ev, yourHeroes(p), p)),
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
    fight: ev => eachOtherPlayerVM(p => revealOrEv(ev, Color.INSTINCT, () => pickDiscardEv(ev, 1, p), p)),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => pickDiscardEv(ev, 1, p), p)),
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
    fight: sameEffect,
    escape: sameEffect,
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
    escape: sameEffect,
    cardActions: [ cosmicThreatAction(Color.RANGED) ],
  })],
// Cosmic Threat: [Instinct]
// AMBUSH: Put each non-[Instinct] Hero from the HQ on the bottom of the Hero Deck.
// ATTACK: 12*
// VP: 6
  [ 2, makeVillainCard("Heralds of Galactus", "Morg", 12, 6, {
    ambush: ev => hqHeroes().limit(c => !isColor(Color.INSTINCT)(c)).each(c => moveCardEv(ev, c, gameState.herodeck, true)),
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
    ambush: ev => captureEv(ev, ev.source, hqHeroes().count(Color.STRENGTH)),
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
    ambush: ev => cityVillains().filter(c => c.villainGroup === "Sinister Six").each(v => captureEv(ev, v)),
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
    varDefense: () => cityVillains().size * 2
  })],
// AMBUSH: Each player reveals an [Instinct] Hero or discards a card.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Sinister Six", "Shocker", 5, 3, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => pickDiscardEv(ev, 1, p), p)),
  })],
// AMBUSH: (After Vulture enters the city) If there is a Villain on the Rooftops or Bridge, swap Vulture with one of those Villains.
// ESCAPE: Each player reveals an [Instinct] Hero or gains a Wound.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Sinister Six", "Vulture", 4, 2, {
    ambush: ev => selectCardEv(ev, "Select Villains to swap Vulture with", villainIn('ROOFTOPS', 'BRIDGE'), c => swapCardsEv(ev, ev.source.location, c.location)),
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
    fight: sameEffect,
    escape: demolishEv,
    varDefense: c => c.printedDefense + numColors(hqHeroes()),
  })],
// ATTACK: 8
// VP: 6
// AMBUSH: Demolish each player twice.
// FIGHT: Same effect.
// ESCAPE: Same effect.
  [ 1, makeVillainCard("Avengers", "Hulk", 8, 6, {
    ambush: [ demolishEv, demolishEv ],
    fight: sameEffect,
    escape: sameEffect,
  })],
// ATTACK: 7
// VP: 5
// AMBUSH: Each player reveals a [Tech] Ally or gains a Bindings.
// FIGHT: Same effect.
// ESCAPE: Demolish each player.
  [ 1, makeVillainCard("Avengers", "Iron Man", 7, 5, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainBindingsEv(ev, p))),
    fight: sameEffect,
    escape: demolishEv,
  })],
// ATTACK: 7
// VP: 5
// AMBUSH: KO each Ally from the Lair that costs 7 Cost or more.
// FIGHT: Same effect.
// ESCAPE: Demolish each player.
  [ 1, makeVillainCard("Avengers", "Thor", 7, 5, {
    ambush: ev => hqHeroes().limit(c => c.cost >= 7).each(c => KOEv(ev, c)),
    fight: sameEffect,
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
    ambush: ev => cityVillains().has(c => c.villainGroup === "Defenders" && c != ev.source) && eachPlayer(p => gainBindingsEv(ev, p)),
    fight: ev => cityVillains().has(c => c.villainGroup === "Defenders" && c != ev.source) && eachPlayer(p => gainBindingsEv(ev, p)),
    escape: ev => cityVillains().has(c => c.villainGroup === "Defenders" && c != ev.source) && eachPlayer(p => gainBindingsEv(ev, p)),
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
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => { pickDiscardEv(ev, 2, p); drawEv(ev, 2, p); })),
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
    ambush: ev => captureEv(ev, ev.source, cityVillains().count(c => c.xTremeAttack)),
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
      ev => cityVillains().has(c => c.xTremeAttack && c !== ev.source) && selectCardAndKOEv(ev, yourHeroes()),
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
    ambush: ev => selectCardEv(ev, "Choose a Villain", cityVillains().limit(c => c !== ev.source), c => attachShardEv(ev, c, 2)),
  })],
// AMBUSH: Each Kree Villain in the city gains a Shard (including this Villain).
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Kree Starforce", "Dr. Minerva", 5, 3, {
    ambush: ev => cityVillains().each(c => attachShardEv(ev, c)),
  })],
// AMBUSH: Each player may draw a card. Korath gains a Shard for each card drawn this way.
// ESCAPE: If Korath had any Shards, each player gains a Wound.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Kree Starforce", "Korath the Pursuer", 5, 3, {
    ambush: ev => {
      eachPlayer(p => chooseMayEv(ev, "Draw a card", () => drawEv(ev, 1, p)));
      cont(ev, () => attachShardEv(ev, ev.source, turnState.pastEvents.count(e => e.type === "DRAW" && e.parent === ev)));
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
    escape: sameEffect,
  })],
// FIGHT: Put a Shard on each Hero in the HQ. When a player gains that Hero, they gain that Shard. If that Hero leaves the HQ some other way, return that Shard to the supply.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Kree Starforce", "Shatterax", 5, 3, {
    fight: ev => {
      if (!gameState.triggers.includes(extraShatteraxTriggers[0]))
        extraShatteraxTriggers.each(t => gameState.triggers.push(t));
      hqHeroes().each(c => attachShardEv(ev, c));
    },
  })],
// AMBUSH: Supremor and the Mastermind each gain a Shard.
// ATTACK: 3
// VP: 2
  [ 2, makeVillainCard("Kree Starforce", "Supremor", 3, 2, {
    ambush: ev => { attachShardEv(ev, ev.source); withMastermind(ev, m => attachShardEv(ev, m)); },
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
  }), u, u, 0, u, "D", ev => addRecruitEvent(ev, 2), { isArtifact: true, cardActions: [ useArtifactAction() ] }) ],
// AMBUSH: Power Gem gains a Shard for each Master Strike in the KO pile and/or stacked next to the Mastermind.
// FIGHT: Put this into your discard pile as an Artifact.
// Artifact - Once per turn, you get +2 Attack.
// ATTACK: 7
// VP: 0
  [ 1, makeGainableCard(makeVillainCard("Infinity Gems", "Power Gem", 7, u, {
    ambush: ev => attachShardEv(ev, ev.source, gameState.ko.count(isStrike) + gameState.mastermind.deck.sum(m => m.attached("STRIKE").size)),
  }), u, u, 0, u, "D", ev => addAttackEvent(ev, 2), { isArtifact: true, cardActions: [ useArtifactAction() ] }) ],
// AMBUSH: Reality Gem gains a Shard for each Infinity Gem Villain card in the city and/or Escape pile.
// FIGHT: Put this into your discard pile as an Artifact.
// Artifact - Before you play a card from the Villain Deck, you may first reveal the top card of the Villain Deck. If it's not a Scheme Twist, you may put it on the bottom of the Villain Deck. If you do, gain a Shard.
// ATTACK: 5
// VP: 0
  [ 2, makeGainableCard(makeVillainCard("Infinity Gems", "Reality Gem", 5, u, {
    ambush: ev => attachShardEv(ev, ev.source, cityVillains().count(isGroup("Infinity Gems")) + gameState.escaped.count(isGroup("Infinity Gems"))),
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
    ambush: ev => attachShardEv(ev, ev.source, cityVillains().size),
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
    selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
      selectCardEv(ev, "Choose a new city space", gameState.city.limit(l => l !== v.location), dest => swapCardsEv(ev, v.location, dest));
      gainShardEv(ev);
    });
  }, { isArtifact: true, cardActions: [ useArtifactAction() ]}) ],
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
addVillainTemplates("Fear Itself", [
{ name: "The Mighty", cards: [
// 2 Uru-Enchanted Weapons
// Fight or Fail: If her Uru-Enchanted Weapons revealed any Bystanders, kidnap them.
// ATTACK: 3*
// VP: 4
  [ 1, makeVillainCard("The Mighty", "Black Widow", 3, 4, {
    fightFail: uruEnchantedFail,
    trigger: uruEnchantedTrigger(2),
    fight: ev => uruEnchantedCards(ev).limit(isBystander).each(c => rescueEv(ev, c)),
  })],
// Uru-Enchanted Weapon
// AMBUSH: Reveal the top three cards of the Adversary Deck. Put the Adversary you revealed with the highest printed VP on top of that deck. Put the rest on the bottom of that deck in random order.
// Fight or Fail: You get +2 Recruit.
// ATTACK: 5*
// VP: 4
  [ 1, makeVillainCard("The Mighty", "Dr. Strange", 5, 4, {
    ambush: ev => revealVillainDeckEv(ev, 3, cards => selectCardEv(ev, "Choose an Adversary to put on top of the deck", cards.limit(isVillain).highest(c => c.printedVP), c => moveCardEv(ev, c, gameState.villaindeck)), true, true),
    fightFail: uruEnchantedFail,
    trigger: uruEnchantedTrigger(1),
    fight: ev => addRecruitEvent(ev, 2),
  })],
// Uru-Enchanted Weapon
// Fight or Fail: Choose one: Each other player draws a card, or each other player discards a card.
// ATTACK: 3*
// VP: 2
  [ 1, makeVillainCard("The Mighty", "Hawkeye", 3, 2, {
    fightFail: uruEnchantedFail,
    trigger: uruEnchantedTrigger(1),
    fight: ev => chooseOptionEv(ev, "Choose one", [{ l: "Each other player draws a card", v: true }, { l: "Each other player discards a card", v: false }], r => eachOtherPlayerVM(p => r ? drawEv(ev, 1, p) : pickDiscardEv(ev, 1, p))),
  })],
// Uru-Enchanted Weapon
// If his Uru-Enchanted Weapon revealed an Adversary, KO one of your Allies.
// ATTACK: 3*
// VP: 2
  [ 1, makeVillainCard("The Mighty", "Iron Fist", 3, 2, {
    fightFail: uruEnchantedFail,
    trigger: uruEnchantedTrigger(1),
    fight: ev => uruEnchantedCards(ev).has(isVillain) && selectCardAndKOEv(ev, yourHeroes()),
  })],
// Uru-Enchanted Weapon
// Fight or Fail: If her Uru-Enchanted Weapon revealed a Command Strike or Plot Twist, play it.
// ESCAPE: Each player reveals a [Ranged] Ally or gains a Bindings.
// ATTACK: 4*
// VP: 3
  [ 1, makeVillainCard("The Mighty", "Ms. Marvel", 4, 3, {
    fightFail: uruEnchantedFail,
    trigger: uruEnchantedTrigger(1),
    fight: ev => uruEnchantedCards(ev).limit(c => isStrike(c) || isTwist(c)).each(c => villainDrawEv(ev, c)),
    escape: ev => revealOrEv(ev, Color.RANGED, () => gainBindingsEv(ev)),
  })],
// Uru-Enchanted Weapon
// Fight or Fail: If her Uru-Enchanted Weapon revealed an Adversary, put that Adversary into your Victory Pile.
// ATTACK: 4*
// VP: 2
  [ 1, makeVillainCard("The Mighty", "Red She-Hulk", 4, 2, {
    fightFail: uruEnchantedFail,
    trigger: uruEnchantedTrigger(1),
    fight: ev => uruEnchantedCards(ev).limit(isVillain).each(c => moveCardEv(ev, c, playerState.victory)),
  })],
// 2 Uru-Enchanted Weapons
// Fight or Fail: Play all the cards revealed by his Uru-Enchanted Weapon that are worth 2 VP or less.
// ESCAPE: Each player gains a Bindings.
// ATTACK: 2*
// VP: 3
  [ 1, makeVillainCard("The Mighty", "Spider-Man", 2, 3, {
    fightFail: uruEnchantedFail,
    trigger: uruEnchantedTrigger(2),
    fight: ev => uruEnchantedCards(ev).limit(c => c.vp <= 2).each(c => villainDrawEv(ev, c)),
    escape: ev => eachPlayer(p => gainBindingsEv(ev, p)),
  })],
// 2 Uru-Enchanted Weapons
// Fight or Fail: Draw two cards.
// ESCAPE: Each player reveals an [Instinct] Ally or gains a Bindings. Then put Wolverine on top of the Adversary Deck.
// ATTACK: 5*
// VP: 6
  [ 1, makeVillainCard("The Mighty", "Wolverine", 5, 6, {
    fightFail: uruEnchantedFail,
    trigger: uruEnchantedTrigger(2),
    fight: ev => drawEv(ev, 2),
    escape: ev => {
      eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainBindingsEv(ev, p), p));
      moveCardEv(ev, ev.source, gameState.villaindeck);
    },
  })],
]},
]);
addVillainTemplates("Secret Wars Volume 1", [
{ name: "The Deadlands", cards: [
// AMBUSH: {RISEOFTHELIVINGDEAD}
// FIGHT: For each of your Avengers Heroes, rescue a Bystander.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("The Deadlands", "Zombie Baron Zemo", 6, 4, {
    ambush: raiseOfTheLivingDead,
    fight: ev => rescueEv(ev, yourHeroes().count("Avengers")),
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// ESCAPE: Loki ascends to become a new Mastermind. He gains the ability, <b>"Master Strike</b>: Each player reveals a [Strength]  Hero or gains a Wound."
// ATTACK: 8
// VP: 6
  [ 1, makeVillainCard("The Deadlands", "Zombie Loki", 8, 6, {
    ambush: raiseOfTheLivingDead,
    escape: ascendToMastermind,
    strike: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p)),
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// FIGHT: KO one of your S.H.I.E.L.D. Heroes or HYDRA Allies.
// ATTACK: 4
// VP: 2
  [ 1, makeVillainCard("The Deadlands", "Zombie Madame Hydra", 4, 2, {
    ambush: raiseOfTheLivingDead,
    fight: ev => selectCardAndKOEv(ev, yourHeroes().limit(isShieldOrHydra))
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// ESCAPE: Sinister ascends to become a new Mastermind. He gains the ability, "<b>Master Strike</b>: Sinister captures a Bystander. Then, each player with exactly 6 cards reveals a [Covert] Hero or discards cards equal to the number of Bystanders Sinister has."
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("The Deadlands", "Zombie Mr. Sinister", 7, 5, {
    ambush: raiseOfTheLivingDead,
    escape: ascendToMastermind,
    strike: [
      ev => captureEv(ev, ev.source),
      ev => eachPlayer(p => p.hand.size === 6 && selectObjectsEv(ev, "Choose cards to discard", ev.source.captured.count(isBystander), p.hand.deck, c => discardEv(ev, c))),
    ]
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// FIGHT: KO one of your heroes with a Recruit icon.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("The Deadlands", "Zombie M.O.D.O.K.", 5, 3, {
    ambush: raiseOfTheLivingDead,
    fight: ev => selectCardAndKOEv(ev, yourHeroes().limit(hasRecruitIcon)),
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// ESCAPE: Shuffle this card into the Mastermind's face-down Tactics. It becomes a Mastermind Tactic that says "<b>Fight</b>: Draw two cards."
// ATTACK: 6
// VP: 6
  [ 1, makeVillainCard("The Deadlands", "Zombie Mysterio", 6, 6, {
    ambush: raiseOfTheLivingDead,
    fight: ev => isMastermind(ev.parent.what) && drawEv(ev, 2),
    escape: ev => withMastermind(ev, m => shuffleIntoEv(ev, ev.source, m.attachedDeck('TACTICS')), true),
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// ESCAPE: Thanos ascends to become a new Mastermind. He gains the ability, "<b>Master Strike</b>: Each player reveals their hand and KOs one of their non-grey Heroes."
// ATTACK: 9
// VP: 6
  [ 1, makeVillainCard("The Deadlands", "Zombie Thanos", 9, 6, {
    ambush: raiseOfTheLivingDead,
    escape: ascendToMastermind,
    strike: ev => eachPlayer(p => selectCardAndKOEv(ev, p.hand.limit(isNonGrayHero)))
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// You can't defeat Zombie Venom unless you have a [Covert] Hero.
// ESCAPE: Each player gains a Wound.
// ATTACK: 5*
// VP: 3
  [ 1, makeVillainCard("The Deadlands", "Zombie Venom", 5, 3, {
    ambush: raiseOfTheLivingDead,
    fightCond: () => yourHeroes().has(Color.COVERT),
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
  })],
]},
{ name: "Domain of Apocalypse", cards: [
// FIGHT: Reveal the top card of your deck. Draw it or {TELEPORT} it.
// ATTACK: 5
// VP: 3
  [ 3, makeVillainCard("Domain of Apocalypse", "Apocalyptic Blink", 5, 3, {
    fight: ev => revealPlayerDeckEv(ev, 1, cards => cards.each(c => chooseOneEv(ev, "Choose one", ["Draw", ev => drawCardEv(ev, c)], ["Teleport", ev => teleportEv(ev, c)]))),
  })],
// FIGHT: Gain an X-Men Hero from the HQ for free.
// ESCAPE: Magneto ascends to become a new Mastermind. He gains the ability, "<b>Master Strike</b>: Each player reveals an X-Men Hero or discards down to four cards."
// ATTACK: 8
// VP: 6
  [ 1, makeVillainCard("Domain of Apocalypse", "Apocalyptic Magneto", 8, 6, {
    fight: ev => {},
    escape: ascendToMastermind,
    strike: ev => eachPlayer(p => revealOrEv(ev, "X-Men", () => pickDiscardEv(ev, -4, p), p)),
  })],
// FIGHT: Reveal the top card of the Hero deck. The player of your choice gains it.
// ESCAPE: Reveal the top card of the Hero deck. Each player reveals their hand and discards a card of that class.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Domain of Apocalypse", "Apocalyptic Rogue", 6, 4, {
    fight: ev => revealHeroDeckEv(ev, 1, cards => cards.each(c => choosePlayerEv(ev, p => gainEv(ev, c, p)))),
    escape: ev => revealHeroDeckEv(ev, 1, cards => cards.each(c => eachPlayer(p => selectCardEv(ev, "Choose a card to discard", p.hand.limit(sharesColor(c)), c => discardEv(ev, c), p)))),
  })],
// FIGHT: KO one of your heroes.
// ESCAPE: {XDRAMPAGE Wolverine}
// ATTACK: 7
// VP: 5
  [ 2, makeVillainCard("Domain of Apocalypse", "Apocalyptic Weapon X", 7, 5, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    escape: ev => xdRampageEv(ev, 'Wolverine'),
  })],
]},
{ name: "Limbo", cards: [
// AMBUSH: The Mastermind captures a Bystander.
// FIGHT: KO one of your Heroes.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Limbo", "Inferno Colossus", 5, 3, {
    ambush: ev => withMastermind(ev, m => captureEv(ev, m)),
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  })],
// AMBUSH: Inferno Cyclops captures a Bystander.
// ESCAPE: The Mastermind captures all the Bystanders this Villain had.
// <i>(Players still discard for the Bystander being carried away.)</i>
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Limbo", "Inferno Cyclops", 6, 4, {
    ambush: ev => captureEv(ev, ev.source),
    escape: ev => withMastermind(ev, m => {}), // TODO SW1 escaping locations
  })],
// FIGHT: Reveal the top card of your deck. KO it or {TELEPORT} it.
// ESCAPE: Each player <b>Teleports</b> a random card from their hand.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Limbo", "Inferno Darkchilde", 5, 3, {
    fight: ev => revealPlayerDeckEv(ev, 1, cards => cards.each(c => chooseOneEv(ev, "Choose one", ["KO", ev => KOEv(ev, c)], ["Teleport", ev => teleportEv(ev, c)]))),
    escape: ev => eachPlayer(p => p.hand.withRandom(c => teleportEv(ev, c))),
  })],
// FIGHT: Up to two cards in your hand that have a Recruit icon gain {TELEPORT} this turn.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Limbo", "Inferno Nightcrawler", 4, 2, {
    fight: ev => selectObjectsUpToEv(ev, "Give Teleport", 2, playerState.hand.limit(hasRecruitIcon), c => {
      addTurnSet('teleport', v => c === v, () => true);
    }),
  })],
]},
{ name: "Manhattan (Earth-1610)", cards: [
// FIGHT: Gain this as a Hero.
// ATTACK: 6
// GAINABLE
// CLASS: [Strength]
// You get +1 Attack for each color of Hero you have
// ATTACKG: 0+
  [ 2, makeGainableCard(makeVillainCard("Manhattan (Earth-1610)", "Ultimate Captain America", 6, u, {}), u, 0, Color.STRENGTH, u, "", ev => addAttackEvent(ev, numColors()))],
// FIGHT: Gain this as a Hero.
// ATTACK: 4
// GAINABLE
// CLASS: [Ranged]
// {TELEPORT}
// RECRUIT: 2
  [ 2, makeGainableCard(makeVillainCard("Manhattan (Earth-1610)", "Ultimate Captain Marvel", 4, u, {}), 2, u, Color.RANGED, u, "D", [], { teleport: true })],
// FIGHT: Gain this as a Hero.
// ESCAPE: {XDRAMPAGE Thor}
// ATTACK: 7
// GAINABLE
// CLASS: [Ranged]
// {POWER Ranged} You get +3 Attack.
// ATTACKG: 3+
  [ 2, makeGainableCard(makeVillainCard("Manhattan (Earth-1610)", "Ultimate Thor", 7, u, {
    escape: ev => xdRampageEv(ev, 'Thor'),
  }), u, 3, Color.RANGED, u, "", ev => superPower(Color.RANGED) && addAttackEvent(ev, 3))],
// FIGHT: Gain this as a Hero.
// ATTACK: 5
// GAINABLE
// CLASS: [Covert]
// {POWER Covert} You get +2 Attack.
// ATTACKG: 2+
  [ 2, makeGainableCard(makeVillainCard("Manhattan (Earth-1610)", "Ultimate Wasp", 5, u, {}), u, 2, Color.COVERT, u, "D", ev => superPower(Color.COVERT) && addAttackEvent(ev, 2))],
]},
{ name: "Sentinel Territories", cards: [
// FIGHT: <i>Colossus changes the future:</i> Don't play a Villain card at the beginning of next turn.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Sentinel Territories", "Colossus of Future Past", 5, 3, {
    fight: ev => addFutureTrigger(ev => {
      addTurnTrigger('VILLAINDRAW', (ev, source) => countPerTurn('futureChange', source) === 0, { replace: ev => incPerTurn('futureChange', ev.source) });
    }),
  })],
// FIGHT: You get +1 Recruit. Then, <i>Kate Pryde alters the future:</i> At the beginning of the next player's turn, that player gets +1 Recruit.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Sentinel Territories", "Kate Pryde of Future Past", 4, 2, {
    fight: [
      ev => addRecruitEvent(ev, 1),
      ev => addFutureTrigger(ev => addRecruitEvent(ev, 1)),
    ]
  })],
// FIGHT: <i>Rachel Summers alters the future:</i> During the next player's turn, all Villains and the Mastermind get -1 Attack.
// ESCAPE: This turn, All Villains and the Mastermind get +1 Attack.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Sentinel Territories", "Rachel Summers of Future Past", 6, 4, {
    fight: ev => addFutureTrigger(ev => addTurnMod('defense', c => isVillain(c) || isMastermind(c), -1)),
    escape: ev => addTurnMod('defense', c => isVillain(c) || isMastermind(c), -1),
  })],
// FIGHT: <i>Wolverine alters the future:</i> At the start of the next player's turn, you draw a card, and that player draws a card.
// ESCAPE: {XDRAMPAGE Wolverine}
// ATTACK: 7
// VP: 5
  [ 2, makeVillainCard("Sentinel Territories", "Wolverine of Future Past", 7, 5, {
    fight: ev => addFutureTrigger(ev => {
      drawEv(ev, 1, owner(ev.source));
      drawEv(ev);
    }),
    escape: ev => xdRampageEv(ev, 'Wolverine'),
  })],
]},
{ name: "Wasteland", cards: [
// FIGHT: {XDRAMPAGE Hulk}
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 3, makeVillainCard("Wasteland", "The Hulk Gang", 5, 3, {
    fight: ev => xdRampageEv(ev, 'Hulk'),
    escape: sameEffect,
  })],
// ESCAPE: Kingpin ascends to become a new Mastermind. He gains the ability, "<b>Master Strike</b>: Each player reveals an [Instinct] Hero or discards their hand and draws 5 cards."
// ATTACK: 11*
// {BRIBE}
// VP: 6
  [ 1, makeVillainCard("Wasteland", "Wasteland Kingpin", 11, 6, {
    escape: ascendToMastermind,
    strike: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => { discardHandEv(ev, p); drawEv(ev, 5, p); })),
    bribe: true,
  })],
// AMBUSH: Wasteland Hawkeye captures a Bystander.
// FIGHT: Choose one: Each other player draws a card, or each other player discards a card.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Wasteland", "Wasteland Hawkeye", 6, 4, {
    ambush: ev => captureEv(ev, ev.source),
    fight: ev => chooseOneEv(ev, "Each other player", ["draws a card", () => eachOtherPlayerVM(p => drawEv(ev, 1, p))], ["discards a card", () => eachOtherPlayerVM(p => pickDiscardEv(ev, 1, p))]),
  })],
// FIGHT: Reveal the top card of your deck. If it costs 2 or less, KO it.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Wasteland", "Wasteland Spider-Girl", 4, 2, {
    fight: ev => revealPlayerDeckEv(ev, 1, cards => cards.limit(c => c.cost <= 2).each(c => KOEv(ev, c))),
  })],
]},
]);
addVillainTemplates("Secret Wars Volume 2", [
{ name: "Deadpool's Secret Secret Wars", cards: [
// {NTHCIRCLE 5}
// FIGHT: {FATEFULRESURRECTION}
// ESCAPE: Deadpool ascends to become a new Mastermind. He gains the ability, "<b>Master Strike</b>: Each player reveals a Hero with an odd-numbered cost or gains a Wound." <i>(0 is even).</i>
// ATTACK: 5+
// VP: 5
  [ 1, makeVillainCard("Deadpool's Secret Secret Wars", "Deadpool", 5, 5, {
    ...nthCircleParams(5),
    fight: fatefulResurrectionEv,
    escape: ascendToMastermind,
    strike: ev => eachPlayer(p => revealOrEv(ev, isCostOdd, () => gainWoundEv(ev, p), p)),
  })],
// You can't fight Doop if there is a Villain in an adjacent city space.
// ATTACK: 2*
// VP: 2
  [ 2, makeVillainCard("Deadpool's Secret Secret Wars", "Doop", 2, 2, {
    fightCond: c => !cityAdjacent(c.location).has(d => d.has(isVillain)),
  })],
// AMBUSH: Howard the Duck captures <i>(the heart of)</i> a Bystander.
// {NTHCIRCLE 7}
// ATTACK: 1+
// VP: 4
  [ 2, makeVillainCard("Deadpool's Secret Secret Wars", "Howard the Duck", 1, 4, {
    ...nthCircleParams(7),
    ambush: ev => captureEv(ev, ev.source),
  })],
// FIGHT: {SPECTRUM}: KO one of your Heroes.
// ATTACK: 4
// VP: 2
  [ 3, makeVillainCard("Deadpool's Secret Secret Wars", "Pink Sphinx", 4, 2, {
    fight: ev => spectrumPower() && selectCardAndKOEv(ev, yourHeroes()),
  })],
]},
{ name: "Guardians of Knowhere", cards: [
// FIGHT: {FATEFULRESURRECTION}
// ESCAPE: Angela ascends to become a new Mastermind. She gains the ability, "<b>Master Strike</b>: Each player KOs a Hero from their discard pile that costs 1 or more."
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Guardians of Knowhere", "Angela", 7, 5, {
    fight: fatefulResurrectionEv,
    escape: ascendToMastermind,
    strike: ev => eachPlayer(p => selectCardAndKOEv(ev, p.discard.limit(isHero).limit(c => c.cost >= 1), p)),
  })],
// FIGHT: Reveal the top card of your deck. KO it or put it back. <b>Fateful Resurrection.</b>
// ATTACK: 5
// VP: 4
  [ 2, makeVillainCard("Guardians of Knowhere", "Drax the Destroyer", 5, 4, {
    fight: [ ev => {
      revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "KO a card", cards, c => KOEv(ev, c)));
    }, fatefulResurrectionEv ],
  })],
// AMBUSH: {CHARGE} one space.
// FIGHT: <i>(After this goes to your victory pile.)</i> {PATROL Sewers}: If it's empty, each other player gains a Wound.
// ESCAPE: Each player gains a Wound.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("Guardians of Knowhere", "Gamora", 6, 4, {
    ambush: chargeAmbushEffect(1),
    fight: ev => patrolCity('SEWERS', () => eachOtherPlayerVM(p => gainWoundEv(ev, p))),
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
  })],
// FIGHT: <b>Fateful Resurrection.</b> If Groot resurrects this way, then he becomes Tiny Dancing Groot with Attack 1 and no abilities for the rest of the turn.
// ATTACK: 5
// VP: 4
  [ 2, makeVillainCard("Guardians of Knowhere", "Groot", 5, 4, {
    fight: fatefulResurrectionAndEv(ev => {
      addTurnSet('defense', c => c === ev.source, () => 1);
      addTurnSet('fight', c => c === ev.source, () => []);
    }),
  })],
// FIGHT: <i>(After this goes to your Victory Pile.)</i> {PATROL Bank}: If it's empty, draw a card. If it's not empty, KO one of your Heroes.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Guardians of Knowhere", "Rocket Raccoon", 4, 2, {
    fight: ev => patrolCity('BANK', () => drawEv(ev), () => selectCardAndKOEv(ev, yourHeroes())),
  })],
]},
{ name: "K'un-lun", cards: [
// {NTHCIRCLE 5}
// ESCAPE: Each player reveals a Hero that costs 5 or more, or they discard a card.
// ATTACK: 5+
// VP: 5
  [ 2, makeVillainCard("K'un-lun", "Laughing Skull", 5, 5, {
    ...nthCircleParams(5),
    escape: ev => eachPlayer(p => revealOrEv(ev, c => c.cost >= 6, () => pickDiscardEv(ev, 1, p), p)),
  })],
// {NTHCIRCLE 6}
// ESCAPE: Each player reveals a Hero that costs 6 or more, or they gain a wound.
// ATTACK: 6+
// VP: 6
  [ 2, makeVillainCard("K'un-lun", "Rand K'ai", 6, 6, {
    ...nthCircleParams(6),
    escape: ev => eachPlayer(p => revealOrEv(ev, c => c.cost >= 6, () => gainWoundEv(ev, p), p)),
  })],
// {NTHCIRCLE 3}
// FIGHT: For each of your Heroes that costs 3, KO one of your Heroes.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("K'un-lun", "Razor Fist", 3, 3, {
    ...nthCircleParams(3),
    fight: ev => repeat(yourHeroes().count(c => c.cost === 3), () => selectCardAndKOEv(ev, yourHeroes())),
  })],
// {NTHCIRCLE 4}
// FIGHT: Draw a card for each of your Heroes that costs 4.
// ATTACK: 4+
// VP: 4
  [ 2, makeVillainCard("K'un-lun", "Red Sai", 4, 4, {
    ...nthCircleParams(4),
    fight: ev => drawEv(ev, yourHeroes().count(c => c.cost === 4)),
  })],
]},
{ name: "Monster Metropolis", cards: [
// FIGHT: KO a card from your discard pile. {FATEFULRESURRECTION}
// ATTACK: 4
// VP: 3
  [ 2, makeVillainCard("Monster Metropolis", "Bug, Shiklah's Dragon", 4, 3, {
    fight: [ ev => selectCardAndKOEv(ev, playerState.discard.deck), fatefulResurrectionEv ],
  })],
// FIGHT: {FATEFULRESURRECTION}. Then, {XDRAMPAGE Deadpool}
// ESCAPE: {XDRAMPAGE Deadpool}
// ATTACK: 5
// VP: 5
  [ 2, makeVillainCard("Monster Metropolis", "Ghost Deadpool", 5, 5, {
    fight: [ fatefulResurrectionEv, ev => xdRampageEv(ev, 'Deadpool')],
    escape: ev => xdRampageEv(ev, 'Deadpool'),
  })],
// AMBUSH: Each Monster Metropolis Villain captures a Bystander.
// FIGHT: {FATEFULRESURRECTION}
// ATTACK: 5
// VP: 4
  [ 2, makeVillainCard("Monster Metropolis", "Man-Thing", 5, 4, {
    ambush: ev => cityVillains().limit(isGroup("Monster Metropolis")).each(c => captureEv(ev, c)),
    fight: fatefulResurrectionEv,
  })],
// AMBUSH: {CHARGE} two spaces.
// When in the Sewers, Rooftops or Bridge, he is in "wolf form" and gets +3 Attack.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("Monster Metropolis", "Marcus Symbiote Centaur", 3, 3, {
    ambush: chargeAmbushEffect(2),
    varDefense: c => c.printedDefense + (isLocation(c.location, 'SEWERS', 'ROOFTOPS', 'BRIDGE') ? 3 : 0),
  })],
]},
{ name: "Utopolis", cards: [
// AMBUSH: {CHARGE} one space.
// FIGHT: {SPECTRUM}: KO a card from your discard pile.
// ESCAPE: Each player who doesn't have {SPECTRUM} discards a card.
// ATTACK: 6
// VP: 4
  [ 3, makeVillainCard("Utopolis", "Doctor Spectrum", 6, 4, {
    ambush: chargeAmbushEffect(1),
    fight: ev => spectrumPower() && selectCardAndKOEv(ev, playerState.discard.deck),
    escape: ev => eachPlayer(p => spectrumPower(p) || pickDiscardEv(ev, 1, p)),
  })],
// While in the Sewers, Rooftops or Bridge, Nighthawk gains +4 Attack.
// ESCAPE: Nighthawk becomes a Scheme Twist that takes effect immediately.
// ATTACK: 4+
// VP: 4
  [ 2, makeVillainCard("Utopolis", "Nighthawk", 4, 4, {
    escape: ev => playTwistEv(ev, ev.source),
    varDefense: c => c.printedDefense + (isLocation(c.location, 'SEWERS', 'ROOFTOPS', 'BRIDGE') ? 4 : 0)
  })],
// AMBUSH: {CHARGE} one space.
// ESCAPE: Warrior Woman ascends to become a new Mastermind. She gains the ability, "<b>Master Strike</b>: {PATROL Bank}: If there's a Villain there, each player discards a card with a Recruit icon."
// ATTACK: 8
// VP: 6
  [ 1, makeVillainCard("Utopolis", "Warrior Woman", 8, 6, {
    ambush: chargeAmbushEffect(1),
    escape: ascendToMastermind,
    strike: ev => patrolCityForVillain('BANK', () => eachPlayer(p => selectCardEv(ev, "Choose a card to discard", p.hand.limit(hasRecruitIcon), c => discardEv(ev, c), p))),
  })],
// AMBUSH: {CHARGE} three spaces.
// FIGHT: <i>(After he goes to your victory pile.)</i> {PATROL Bridge}: If there's a Villain there, each other player gains a Wound.
// ESCAPE: Each player gains a Wound.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Utopolis", "Whizzer", 5, 3, {
    ambush: chargeAmbushEffect(3),
    fight: ev => patrolCityForVillain('BRIDGE', () => eachOtherPlayerVM(p => gainWoundEv(ev, p))),
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
  })],
]},
{ name: "X-Men '92", cards: [
// AMBUSH: Charge one space.
// FIGHT: Gain this as a Hero.
// ATTACK: 5
// GAINABLE
// CLASS: [Strength]
// {POWER Tech} Draw a card.
// ATTACKG: 2
  [ 2, makeGainableCard(makeVillainCard("X-Men '92", "'92 Beast", 5, u, {
    ambush: chargeAmbushEffect(1),
  }), u, 2, Color.STRENGTH, u, "D", ev => superPower(Color.TECH) && drawEv(ev, 1))],
// FIGHT: Gain this as a Hero.
// ATTACKG: 4
// GAINABLE
// CLASS: [Ranged]
// <i>Spectrum:</i> You get +2 Attack.
// ATTACKG: 2+
  [ 3, makeGainableCard(makeVillainCard("X-Men '92", "'92 Jubilee", 4, u, {}), u, 2, Color.RANGED, u, "D", ev => spectrumPower() && addAttackEvent(ev, 2)) ],
// ESCAPE: '92 Professor X ascends to become a new Mastermind. He gains the ability, "<b>Master Strike</b>: Stack the two heroes from the HQ with the highest cost next to '92 Professor X. He gets +1 Attack for each Hero stacked there. Players can recruit the top card of the stack."
// ATTACK: 8+
// VP: 6
  [ 1, makeVillainCard("X-Men '92", "'92 Professor X", 8, 6, {
    escape: ascendToMastermind,
    strike: ev => {
      // Copied from Villains' Professor X Mastermind
      const selected: Card[] = [];
      selectCardEv(ev, "Select an Ally", HQCardsHighestCost(), c => selected.push(c));
      cont(ev, () => selectCardEv(ev, "Select another Ally", hqHeroes().limit(c => !selected.includes(c)).highest(c => c.cost), c => selected.push(c)));
      cont(ev, () => selectCardEv(ev, "Put first Pawn", selected, c => attachCardEv(ev, c, ev.source, "PAWN")));
      cont(ev, () => selected.each(c => attachCardEv(ev, c, ev.source, "PAWN")));
    },
    cardActions: [ (c: Card, ev: Ev) => c.attached("PAWN").size ? recruitCardActionEv(ev, c.attachedDeck("PAWN").top) : noOpActionEv(ev) ],
  })],
// FIGHT: Gain this as a Hero.
// ESCAPE: {XDRAMPAGE Wolverine}
// ATTACK: 7
// GAINABLE
// CLASS: [Instinct]
// {POWER Instinct} Draw two cards.
// ATTACKG: 2
  [ 2, makeGainableCard(makeVillainCard("X-Men '92", "'92 Wolverine", 7, u, {
    escape: ev => xdRampageEv(ev, 'Wolverine'),
  }), u, 2, Color.INSTINCT, u, "D", ev => superPower(Color.INSTINCT) && drawEv(ev, 2))],
]},
]);
addVillainTemplates("Captain America 75th Anniversary", [
{ name: "Zola's Creations", cards: [
// Abomination
// FIGHT: You get +1 Recruit for each Hero Class you have.
// ATTACK: 6+
// VP: 5
  [ 2, makeVillainCard("Zola's Creations", "Captain Zolandia", 6, 5, {
    fight: ev => addRecruitEvent(ev, numClasses()),
    varDefense: abominationVarDefense,
  })],
// Abomination
// FIGHT: KO one of your Heroes.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Zola's Creations", "Doughboy", 4, 3, {
    fight: ev => selectCardAndKOEv(ev, playerState.hand.deck),
    varDefense: abominationVarDefense,
  })],
// Abomination
// FIGHT: If you fought Man-Fish in the Sewers or Bridge, then each other player gains a Wound.
// ESCAPE: Each player gains a Wound.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("Zola's Creations", "Man-Fish", 5, 4, {
    fight: ev => isLocation(ev.where, 'BRIDGE', 'SEWERS') && eachOtherPlayerVM(p => gainWoundEv(ev, p)),
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
    varDefense: abominationVarDefense,
  })],
// To fight Primus, you must also discard a card that costs 2, 3, 5, or 7.
// ESCAPE: each player discards a Hero that costs 2, 3, 5, or 7.
// ATTACK: 3*
// VP: 3
  [ 2, makeVillainCard("Zola's Creations", "Primus", 3, 3, {
    fightCond: c => playerState.hand.has(c => [2, 3, 5, 7].includes(c.cost)),
    fightCost: ev => selectCardEv(ev, "Discard a card", playerState.hand.limit(c => [2, 3, 5, 7].includes(c.cost)), c => discardEv(ev, c)),
    escape: ev => eachPlayer(p => selectCardEv(ev, "Discard a card", p.hand.limit(isHero).limit(c => [2, 3, 5, 7].includes(c.cost)), c => discardEv(ev, c), p)),
  })],
]},
{ name: "Masters of Evil (WWII)", cards: [
// AMBUSH: Black Knight captures a Bystander.
// FIGHT: Savior: KO one of your Heroes.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Masters of Evil (WWII)", "Black Knight", 4, 2, {
    ambush: ev => captureEv(ev, ev.source),
    fight: ev => saviorPower() && selectCardAndKOEv(ev, playerState.hand.limit(isHero)),
  })],
// AMBUSH: Executioner captures a Bystander
// FIGHT: Savior: Draw a card.
// ESCAPE: KO a Bystander from each player's Victory Pile.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Masters of Evil (WWII)", "Executioner", 6, 4, {
    ambush: ev => captureEv(ev, ev.source),
    fight: ev => saviorPower() && drawEv(ev),
    escape: ev => eachPlayer(p => selectCardAndKOEv(ev, p.victory.limit(isBystander))),
  })],
// AMBUSH: Melter captures a Bystander.
// FIGHT: Savior: Each player reveals the top card of their deck. For each card, you choose to KO it or put it back.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Masters of Evil (WWII)", "Melter (WWII)", 5, 3, {
    ambush: ev => captureEv(ev, ev.source),
    fight: ev => saviorPower() && eachPlayer(p => revealPlayerDeckEv(ev, 1, cards => {
      selectCardOptEv(ev, "KO a card", cards, c => KOEv(ev, c));
    }, p)),
  })],
// AMBUSH: Radioactive Man captures a Bystander.
// FIGHT: Each player who is not a Savior gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Masters of Evil (WWII)", "Radioactive Man", 5, 3, {
    ambush: ev => captureEv(ev, ev.source),
    fight: ev => eachPlayer(p => saviorPower() || gainWoundEv(ev, p)),
    escape: sameEffect,
  })],
]},
]);
addVillainTemplates("Civil War", [
{ name: "CSA Special Marshals", cards: [
// FIGHT: KO one of your heroes with a Recruit icon.
// ESCAPE: Each player KOs one of their Heroes that has printed Attack of 2 or more.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("CSA Special Marshals", "Bullseye", 6, 4, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes().limit(hasRecruitIcon)),
    escape: ev => eachPlayer(p => selectCardAndKOEv(ev, yourHeroes(p).limit(c => c.printedAttack >= 2))),
  })],
// FIGHT: Each other player discards two cards, and then draws a card.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("CSA Special Marshals", "Moonstone", 4, 2, {
    fight: ev => eachOtherPlayerVM(p => { pickDiscardEv(ev, 2, p); drawEv(ev, 1, p); }),
  })],
// Penance gets +1 Attack for each Villain in your Victory Pile.
// ATTACK: 2+
// VP: 3
  [ 2, makeVillainCard("CSA Special Marshals", "Penance", 2, 3, {
    varDefense: c => c.printedDefense + playerState.victory.count(isVillain),
  })],
// {SIZECHANGING COVERT}
// ESCAPE: Fortify the Bystander Stack. While it's fortified, if a Bystander would be rescued from there, KO that Bystander instead.
// ATTACK: 7*
// VP: 4
  [ 2, makeVillainCard("CSA Special Marshals", "Venom", 7, 4, {
    escape: ev => fortifyEv(ev, ev.source, gameState.bystanders),
    trigger: {
      event: 'RESCUE',
      match: (ev, source) => isFortifying(source, gameState.bystanders) && !ev.what,
      replace: ev => gameState.bystanders.withTop(c => KOEv(ev, c)),
    },
    sizeChanging: Color.COVERT,
  })],
]},
{ name: "Great Lakes Avengers", cards: [
// {SIZECHANGING STRENGTH}
// FIGHT: Each player reveals a Strength Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 7*
// VP: 4
  [ 2, makeVillainCard("Great Lakes Avengers", "Big Bertha", 7, 4, {
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p)),
    escape: sameEffect,
    sizeChanging: Color.STRENGTH,
  })],
// {SIZECHANGING COVERT}
// FIGHT: KO a card from your discard pile.
// ATTACK: 5*
// VP: 2
  [ 2, makeVillainCard("Great Lakes Avengers", "Flatman", 5, 2, {
    fight: ev => selectCardAndKOEv(ev, playerState.discard.deck),
    sizeChanging: Color.COVERT,
  })],
// FIGHT: Reveal the top card of the Villain Deck. If it's a Villain or Bystander, Mr. Immortal reenters the Sewers.
// ATTACK: 2
// VP: 2
  [ 2, makeVillainCard("Great Lakes Avengers", "Mr. Immortal", 2, 2, {
    fight: ev => revealVillainDeckEv(ev, 1, cards => (cards.has(isBystander) || cards.has(isVillain)) && withCity('SEWERS', sewers => enterCityEv(ev, ev.source, sewers))),
  })],
// You can't fight Squirrel Girl if you played more than one card this turn.
// ESCAPE: Fortify the Sidekick Stack. While it's fortified, Sidekicks can't be recruited or gained.
// ATTACK: 3*
// VP: 2
  [ 2, makeVillainCard("Great Lakes Avengers", "Squirrel Girl", 3, 2, {
    escape: ev => fortifyEv(ev, ev.source, gameState.sidekick),
    trigger: { event: 'GAIN', match: (ev, source) => isFortifying(source, gameState.sidekick) && isSidekick(ev.what), replace: () => {}},
    fightCond: c => turnState.cardsPlayed.size <= 1,
  })],
]},
{ name: "Heroes for Hire", cards: [
// {BRIBE}
// ESCAPE: Fortify the Mastermind. While it's fortified, the Mastermind can't be fought.
// ATTACK: 9*
// VP: 5
  [ 2, makeVillainCard("Heroes for Hire", "Colleen Wing", 9, 5, {
    escape: ev => fortifyEv(ev, ev.source, gameState.mastermind), // TODO prevent fight and maybe recruit (see squirrel girl)
    bribe: true,
  })],
// {BRIBE}
// FIGHT: KO one of your Heroes.
// ATTACK: 5*
// VP: 3
  [ 2, makeVillainCard("Heroes for Hire", "Humbug", 5, 3, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    bribe: true,
  })],
// {BRIBE}
// FIGHT: If you have any cards in your discard pile, then shuffle them into your deck, and Shang-Chi reenters the Sewers.
// ATTACK: 3*
// VP: 2
  [ 2, makeVillainCard("Heroes for Hire", "Shang-Chi", 3, 2, {
    fight: ev => { if (playerState.discard.size) {
      shuffleIntoEv(ev, playerState.discard, playerState.deck);
      withCity('SEWERS', sewers => enterCityEv(ev, ev.source, sewers));
    } },
    bribe: true,
  })],
// {BRIBE}
// FIGHT: Each player discards two cards or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 7*
// VP: 5
  [ 2, makeVillainCard("Heroes for Hire", "Tarantula", 7, 5, {
    fight: ev => eachPlayer(p => p.hand.size < 2 ? gainWoundEv(ev, p) : chooseOptionEv(ev, "Choose one",
      [ {l:"Gain a Wound", v: () => gainWoundEv(ev, p)},
        {l:"Discard two cards", v:() => pickDiscardEv(ev, 2, p)}], f => f(), p)),
    escape: sameEffect,
    bribe: true,
  })],
]},
{ name: "Registration Enforcers", cards: [
// FIGHT: If you fight Blade in the Sewers or Rooftops, you get +2 Recruit.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Registration Enforcers", "Blade", 4, 2, {
    fight: ev => isLocation(ev.where, 'ROOFTOPS', 'SEWERS') && addRecruitEvent(ev, 2),
  })],
// FIGHT: Each player swaps a card from their hand with the top card of their deck.
// ESCAPE: Each player swaps their hand with the top four cards of their deck.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Registration Enforcers", "Captain Marvel", 6, 4, {
    fight: ev => eachPlayer(p => selectCardEv(ev, "Choose a card to swap", p.hand.deck, c => swapCardsEv(ev, c, p.deck), p)),
    escape: ev => eachPlayer(p => {/*TODO swap hand with top*/}),
  })],
// AMBUSH: Each player reveals a card that costs 5 or discards down to 5 cards.
// FIGHT: Same effect.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 5
  [ 2, makeVillainCard("Registration Enforcers", "Deadpool", 5, 5, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, c => c.cost === 5, () => pickDiscardEv(ev, -5, p), p)),
    fight: sameEffect,
    escape: sameEffect,
  })],
// {SIZECHANGING INSTINCT}
// FIGHT: KO one of your Heroes.
// ATTACK: 6*
// VP: 3
  [ 2, makeVillainCard("Registration Enforcers", "Micromax", 6, 3, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    sizeChanging: Color.INSTINCT,
  })],
]},
{ name: "S.H.I.E.L.D. Elite", cards: [
// S.H.I.E.L.D. Clearance
// AMBUSH: A S.H.I.E.L.D. Officer enters the city as a 3 Attack Villain. When you fight it, gain it as a Hero.
// ATTACK: 1*
// VP: 2
  [ 2, makeVillainCard("S.H.I.E.L.D. Elite", "Agent Eric Marshall", 1, 2, {
    ambush: ev => villainifyOfficers(ev),
    ...shieldClearance,
  })],
// S.H.I.E.L.D. Clearance
// FIGHT: A S.H.I.E.L.D. Officer enters the city as a 3 Attack Villain. When you fight it, gain it as a Hero.
// ATTACK: 2*
// VP: 2
  [ 2, makeVillainCard("S.H.I.E.L.D. Elite", "Agent Gabe Jones", 2, 2, {
    fight: ev => villainifyOfficers(ev),
    ...shieldClearance,
  })],
// S.H.I.E.L.D. Clearance
// FIGHT: Each player with no S.H.I.E.L.D. Officers in their discard pile gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 4*
// VP: 3
  [ 2, makeVillainCard("S.H.I.E.L.D. Elite", "Dum Dum Dugan", 4, 3, {
    fight: ev => eachPlayer(p => p.victory.has(c => c.cardName === 'S.H.I.E.L.D. Officer') || gainWoundEv(ev, p)),
    escape: sameEffect,
    ...shieldClearance,
  })],
// S.H.I.E.L.D. Clearance
// ESCAPE: Fortify the S.H.I.E.L.D. Officer stack. While it's fortified, whenever any number of S.H.I.E.L.D. Officers become Villains, an extra one becomes a Villain.
// ATTACK: 6*
// VP: 5
  [ 2, makeVillainCard("S.H.I.E.L.D. Elite", "Sharon Carter, Agent 13", 6, 5, {
    escape: ev => fortifyEv(ev, ev.source, gameState.officer), // TODO
    ...shieldClearance,
  })],
]},
{ name: "Superhuman Registration Act", cards: [
// AMBUSH: Fortify your deck. While Iron Spider fortifies a players deck, that player draws one fewer card at the end of their turn.
// FIGHT: Reveal the top card of the Villain Deck. If that card is worth 2 VP or less, Iron Spider fortifies the deck of the player on your left.
// ATTACK: 2
// VP: 3
  [ 2, makeVillainCard("Superhuman Registration Act", "Iron Spider", 2, 3, {
    ambush: ev => fortifyEv(ev, ev.source, playerState.deck),
    fight: ev => revealVillainDeckEv(ev, 1, cards => cards.has(c => c.vp <= 2) && fortifyEv(ev, ev.source, playerState.left.deck)),
    // TODO
  })],
// ESCAPE: Fortify an HQ space. While its fortified, Heroes can't be gained from that space.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Superhuman Registration Act", "Ms. Marvel", 5, 3, {
    escape: ev => selectCardEv(ev, "Choose an HQ space", gameState.hq, d => fortifyEv(ev, ev.source, d)),
    // TODO
  })],
// {SIZECHANGING STRENGTH}
// ESCAPE: Fortify the Villain Deck. When a Master Strike is completed from that deck, each player gains a Wound and She-Hulk enters the Sewers.
// ATTACK: 8*
// VP: 5
  [ 2, makeVillainCard("Superhuman Registration Act", "She-Hulk", 8, 5, {
    escape: ev => fortifyEv(ev, ev.source, gameState.villaindeck),
    trigger: { event: 'STRIKE', match: (ev, source) => isFortifying(source, gameState.villaindeck), after: ev => {
      eachPlayer(p => gainWoundEv(ev, p));
      withCity('SEWERS', sewers => enterCityEv(ev, ev.source, sewers));
    }},
    sizeChanging: Color.STRENGTH,
  })],
// {SIZECHANGING TECH}
// ESCAPE: Fortify the Hero Deck. While it's fortified, whenever a Hero in the HQ costs 7 or more, KO that Hero.
// ATTACK: 7*
// VP: 4
  [ 2, makeVillainCard("Superhuman Registration Act", "Yellowjacket", 7, 4, {
    escape: ev => {
      fortifyEv(ev, ev.source, gameState.herodeck);
      hqHeroes().limit(c => c.cost >= 7).each(c => KOEv(ev, c));
    },
    trigger: {
      event: 'MOVECARD',
      match: (ev, source) => isFortifying(source, gameState.herodeck) && ev.to.isHQ && isHero(ev.what) && ev.what.cost >= 7,
      after: ev => KOEv(ev, ev.parent.what),
    },
    sizeChanging: Color.TECH,
  })],
]},
{ name: "Thunderbolts", cards: [
// FIGHT: Look at the top three cards of your deck. KO one and put the rest back in any order.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Thunderbolts", "Fixer", 4, 2, {
    fight: ev => lookAtDeckEv(ev, 3, () => selectCardAndKOEv(ev, playerState.revealed.deck)),
  })],
// FIGHT: Each player reveals a Tech Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Thunderbolts", "Mach-IV", 5, 3, {
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainWoundEv(ev, p), p)),
    escape: sameEffect,
  })],
// ESCAPE: Fortify the Wound Stack. While it's fortified, whenever a player gains a Wound, that player gains an extra Wound.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Thunderbolts", "Radioactive Man", 6, 4, {
    escape: ev => fortifyEv(ev, ev.source, gameState.wounds),
    trigger: {
      event: 'GAIN',
      match: (ev, source) => isFortifying(source, gameState.wounds) && isWound(ev.what) && ev.getSource() !== source,
      after: ev => gainWoundEv(ev, ev.parent.who),
    }
  })],
// FIGHT: Each player without another Thunderbolts Villain in their Victory Pile gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Thunderbolts", "Songbird", 5, 3, {
    fight: ev => eachPlayer(p => p.victory.limit(c => c !== ev.source).has(isGroup('Thunderbolts')) || gainWoundEv(ev, p)),
    escape: sameEffect,
  })],
]},
]);
addVillainTemplates("Deadpool", [
{ name: "Deadpool's \"Friends\"", cards: [
// {REVENGE Deadpool's "Friends"}
// To fight Blind Al, you also gotta drop a Deuce <i>(discard a card with a "2" printed anywhere on it)</i>. Deuce is her dog, obviously.
// ESCAPE: Everybody drop a Deuce.
// ATTACK: 2+
// VP: 3
  [ 2, makeVillainCard("Deadpool's \"Friends\"", "Blind Al and Deuce", 2, 3, {
    escape: ev => eachPlayer(p => selectCardEv(ev, "Choose a card to discard", p.hand.limit(hasFlag('D')), c => discardEv(ev, c), p)),
    fightCond: c => playerState.hand.has(hasFlag('D')),
    fightCost: ev => selectCardEv(ev, "Choose a card to discard", playerState.hand.limit(hasFlag('D')), c => discardEv(ev, c)),
    varDefense: revengeVarDefense,
  })],
// {REVENGE Deadpool's "Friends"}
// FIGHT: {VIOLENCE} Gain the Hero from the HQ with the lowest cost <i>(or tied for lowest)</i>.
// ESCAPE: Each player gains a Wound.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("Deadpool's \"Friends\"", "Sluggo", 5, 4, {
    excessiveViolence: ev => selectCardEv(ev, "Choose a Hero to gain", hqHeroes().highest(c => -c.cost), c => gainEv(ev, c)),
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
    varDefense: revengeVarDefense,
  })],
// AMBUSH: Taskmaster captures a Bystander.
// During your turn, Taskmaster gets + Attack equal to the cost of the highest-cost Hero you played this turn.
// ATTACK: 3+
// VP: 4
// FLAVOR: They call it Photographic Reflexes: I can copy any fighting move I've ever seen. And I've seen Howard the Duck."
  [ 2, makeVillainCard("Deadpool's \"Friends\"", "Taskmaster", 3, 4, {
    ambush: ev => captureEv(ev, ev.source),
    varDefense: c => c.printedDefense + turnState.cardsPlayed.max(c => c.cost),
  })],
// {REVENGE Deadpool's "Friends"}
// AMBUSH: Each player simultaneously passes a card from their hand to the player on their left.
// FIGHT: Same effect.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Deadpool's \"Friends\"", "Weasel", 4, 3, {
    ambush: ev => {
      const s = new Map<Player, Card>();
      eachPlayer(p => selectCardEv(ev, "Choose a card", p.hand.deck, c => s.set(p.left, c)));
      cont(ev, () => eachPlayer(p => gainEv(ev, s.get(p), p)));
    },
    fight: sameEffect,
    varDefense: revengeVarDefense,
  })],
]},
{ name: "Evil Deadpool Corpse", cards: [
// {REVENGE Evil Deadpool Corpse}
// FIGHT: Excessive Violence: KO one of your Heroes. Remind them that if they were better at hero-ing, these accidents wouldn't happen.
// ATTACK: 4+
// VP: 3
// FLAVOR: Destructive Engine of Assassination Despite Panpygoptosis Obsessed with Opponent Liquidation.
  [ 2, makeVillainCard("Evil Deadpool Corpse", "D.E.A.D.P.O.O.L.", 4, 3, {
    excessiveViolence: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: revengeVarDefense,
  })],
// {REVENGE Evil Deadpool Corpse}
// ESCAPE: Old West Shootout. Each player reveals the top card of their deck. KO the card with the highest cost (or tied for highest.)
// ATTACK: 5+
// VP: 4
// FLAVOR: If you're going to lose an 8-coster, distract the other players and cheat, varmint!
  [ 2, makeVillainCard("Evil Deadpool Corpse", "The Deadpool Kid", 5, 4, {
    escape: ev => {
      const s: Card[] = [];
      eachPlayer(p => revealPlayerDeckEv(ev, 1, cards => cards.each(c => s.push(c)), p));
      cont(ev, () => s.highest(c => c.cost).each(c => KOEv(ev, c)));
    },
    varDefense: revengeVarDefense,
  })],
// {REVENGE Evil Deadpool Corpse}
// FIGHT: Excessive Violence: Draw a card for each "Ultimate" in the HQ. You know, those totally kickass cards that cost 7 or more.
// ESCAPE: KO all Ultimates from the HQ.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("Evil Deadpool Corpse", "Ultimate Deadpool", 5, 4, {
    excessiveViolence: ev => drawEv(ev, hqHeroes().count(c => c.cost >=7)),
    escape: ev => hqHeroes().limit(c => c.cost >= 7).each(c => KOEv(ev, c)),
    varDefense: revengeVarDefense,
  })],
// {REVENGE Evil Deadpool Corpse}
// AMBUSH: Each player reveals a card with an odd-numbered cost or gains a Wound. Ya know, the number 0 is pretty weird, but it's not odd.
// FIGHT: Same effect.
// ESCAPE: Same effect. Then, shuffle me back into the Villain Deck so I can kick your ass again!
// ATTACK: 7+
// VP: 6
  [ 2, makeVillainCard("Evil Deadpool Corpse", "Wolverinepool", 7, 6, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, isCostOdd, () => gainWoundEv(ev, p), p)),
    fight: sameEffect,
    escape: ev => {
      eachPlayer(p => revealOrEv(ev, isCostOdd, () => gainWoundEv(ev, p), p));
      shuffleIntoEv(ev, ev.source, gameState.villaindeck);
    },
    varDefense: revengeVarDefense,
  })],
]},
]);
addVillainTemplates("Noir", [
{ name: "Goblin's Freak Show", cards: [
// AMBUSH: The Vulture captures 2 <b>Hidden Witnesses</b>.
// FIGHT: Each other player KOs a Bystander from their Victory Pile or gains a Wound.
// ESCAPE: Each player gains a Wound.
// ATTACK: 5*
// VP: 3
  [ 2, makeVillainCard("Goblin's Freak Show", "Vulture, Carnival Cannibal", 5, 3, {
    ambush: ev => captureWitnessEv(ev, ev.source, 2),
    fight: ev => eachOtherPlayerVM(p => selectCardOptEv(ev, "Choose a Bystander", p.victory.limit(isBystander), c => KOEv(ev, c), () => gainWoundEv(ev, p), p)),
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
  })],
// AMBUSH: Chameleon captures a <b>Hidden Witness</b>.
// FIGHT: Reveal the top card of the Villain Deck. If it's a Villain, it enters the city space where the Chameleon was.
// ATTACK: 4*
// VP: 2
  [ 2, makeVillainCard("Goblin's Freak Show", "The Chameleon", 4, 2, {
    ambush: ev => captureWitnessEv(ev, ev.source),
    fight: ev => revealVillainDeckEv(ev, 1, cards => cards.limit(isVillain).each(c => enterCityEv(ev, c, ev.where))),
  })],
// AMBUSH: For each Hero in the HQ that costs 7 or more, Kraven captures a <b>Hidden Witness</b>. Kraven's Attack is equal to the cost of the highest-cost card in the HQ.
// ATTACK: *
// VP: 3
  [ 1, makeVillainCard("Goblin's Freak Show", "Kraven, Animal Trainer", 0, 3, {
    ambush: ev => captureWitnessEv(ev, ev.source, hqHeroes().count(c => c.cost >= 7)),
    varDefense: c => hqHeroes().max(c => c.cost) || 0,
  })],
// AMBUSH: Each other player reveals a Strength Hero or Ox captures a random Bystander from their Victory Pile as a <b>Hidden Witness</b>.
// ATTACK: 5*
// VP: 3
  [ 1, makeVillainCard("Goblin's Freak Show", "Ox", 5, 3, {
    ambush: ev => eachOtherPlayerVM(p => revealOrEv(ev, Color.STRENGTH, () => p.victory.limit(isBystander).withRandom(c => captureWitnessEv(ev, ev.source, c)), p)),
  })],
// AMBUSH: Each Goblin's Freak Show Villain captures a <b>Hidden Witness</b>.
// ATTACK: 4*
// VP: 2
  [ 1, makeVillainCard("Goblin's Freak Show", "Montana", 4, 2, {
    ambush: ev => cityVillains().limit(isGroup(ev.source.villainGroup)).each(c => captureWitnessEv(ev, c)),
  })],
// AMBUSH: Fancy Dan captures 3 <b>Hidden Witnesses</b>.
// FIGHT: KO one of your Heroes.
// ATTACK: 1*
// VP: 2
  [ 1, makeVillainCard("Goblin's Freak Show", "Fancy Dan", 1, 2, {
    ambush: ev => captureWitnessEv(ev, ev.source, 3),
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  })],
]},
{ name: "X-Men Noir", cards: [
// FIGHT: <b>Investigate</b> for a card with a Recruit icon.
// ATTACK: 4
// VP: 2
  [ 1, makeVillainCard("X-Men Noir", "Bobby \"Iceman\" Drake", 4, 2, {
    fight: ev => investigateEv(ev, hasRecruitIcon),
  })],
// FIGHT: <b>Investigate</b> for a Hero that costs 0 and KO it.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("X-Men Noir", "Comrade Rasputin, Steel Wall", 5, 3, {
    fight: ev => investigateEv(ev, c => isHero(c) && c.cost === 0, playerState.deck, c => KOEv(ev, c)),
  })],
// FIGHT: <b>Investigate</b> for any card that's Tech or Strength.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("X-Men Noir", "Henry \"Beast\" McCoy", 5, 3, {
    fight: ev => investigateEv(ev, Color.TECH | Color.STRENGTH),
  })],
// FIGHT: When you draw a new hand of cards at the end of your turn, <b>Investigate</b> for an extra card.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("X-Men Noir", "Jean Grey Noir", 5, 3, {
    fight: ev => addTurnTrigger('CLEANUP', u, ev => investigateEv(ev, u)),
  })],
// ESCAPE: Each player <b>Investigates</b> their deck for a card that costs 1 or more and KOs it. Players reveal the cards they investigated.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("X-Men Noir", "Scott \"Cyclops\" Summers", 6, 4, {
    escape: ev => {},
  })],
// ESCAPE: <b>Investigate</b> the Villain Deck for a Scheme Twist and play it. Reveal all the cards you <b>Investigated</b>.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("X-Men Noir", "Warden Emma Frost", 6, 4, {
    escape: ev => investigateEv(ev, isScheme, gameState.villaindeck, c => villainDrawEv(ev, c), playerState, true),
  })],
// FIGHT: KO a Hero from the HQ. <b>Investigate</b> the Hero Deck for a card to put in that emptied HQ space.
// ATTACK: 4
// VP: 2
  [ 1, makeVillainCard("X-Men Noir", "Ororo Munroe, Storm-Tossed", 4, 2, {
    fight: ev => {
      selectCardEv(ev, "Choose a Hero", hqHeroes(), c => {
        const l = c.location;
        let on = true;
        addTurnTrigger('MOVECARD', ev => ev.to === c.location && on, { replace: () => {}});
        KOEv(ev, c);
        cont(ev, () => on = false);
        investigateEv(ev, u, gameState.herodeck, h => moveCardEv(ev, h, l));
      });
    },
  })],
]},
]);
addVillainTemplates("X-Men", [
{ name: "Dark Descendants", cards: [
// FIGHT: KO one of your Heroes.
// ESCAPE: The Mastermind Dominates the top card of the Hero Deck.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Dark Descendants", "Fatale", 5, 3, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    escape: ev => gameState.herodeck.withTop(c => withMastermind(ev, m => dominateEv(ev, m, c))),
  })],
// FIGHT: Gain this as a Hero.
// ESCAPE: Havok becomes a Hero Dominated by the Mastermind.
// ATTACK: 6
// GAINABLE
// TEAM: X-Men
// CLASS: [Ranged]
// {XGENE [Ranged]} You get +2 Attack.
// ATTACKG: 2+
  [ 2, makeGainableCard(makeVillainCard("Dark Descendants", "Havok, Brainwashed", 6, u, {
    escape: ev => withMastermind(ev, m => dominateEv(ev, m, ev.source)),
  }), u, 2, Color.RANGED, "X-Men", "D", ev => xGenePower(Color.RANGED) && addAttackEvent(ev, 2))],
// AMBUSH: Each player reveals their hand and chooses one of their non-grey Heroes. Nemesis Dominates those Heroes.
// ATTACK: 5
// VP: 5
  [ 1, makeVillainCard("Dark Descendants", "Nemesis", 5, 5, {
    ambush: ev => eachPlayer(p => selectCardEv(ev, "Choose a Hero", p.hand.limit(isNonGrayHero), c => dominateEv(ev, ev.source, c), p)),
  })],
// SUBNAME: Psychic Subjugation
// TRAP
  [ 1, makeTrapCard("Dark Descendants", "Psychic Subjugation", 3, u,
    // Recruit the left-most and right-most Heroes in the HQ.
    ev => {
      const left = turnState.pastEvents.has(e => e.type === 'RECRUIT' && e.where === gameState.hq[0]);
      const right = turnState.pastEvents.has(e => e.type === 'RECRUIT' && e.where === gameState.hq[gameState.hq.size - 1]);
      return left && right;
    },
    // Each of those Heroes you didn't recruit enters the city as a Villain with Attack equal to that Hero's cost. When you fight one, you gain it.
    ev => {
      const left = turnState.pastEvents.has(e => e.type === 'RECRUIT' && e.where === gameState.hq[0]);
      const right = turnState.pastEvents.has(e => e.type === 'RECRUIT' && e.where === gameState.hq[gameState.hq.size - 1]);
      hqHeroes().limit(c => c.location === gameState.hq[0] && left || c.location === gameState.hq[gameState.hq.size - 1] && right).each(c => {
        villainify(u, c, c.cost, 'GAIN');
        enterCityEv(ev, c);
      });
    },
  )],
// AMBUSH: Random Dominates the top card of the Hero Deck. Then, each player reveals their hand and chooses one of their Heroes with that same cost. Random Dominates those Heroes.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Dark Descendants", "Random", 4, 3, {
    ambush: ev => gameState.herodeck.withTop(c => {
      dominateEv(ev, ev.source, c);
      eachPlayer(p => selectCardEv(ev, "Choose a Hero", p.hand.limit(v => v.cost === c.cost), c => dominateEv(ev, ev.source, c), p));
    }),
  })],
]},
{ name: "Hellfire Club", cards: [
// SUBNAME: Corrupt the Phoenix Force
// TRAP
  [ 1, makeTrapCard("Hellfire Club", "Corrupt the Phoenix Force", 3, u,
    // Have no Hellfire Villains in the city.
    ev => !cityVillains().has(isGroup("Hellfire Club")),
    // This Trap becomes a 6 Attack "Phoenix Force" Token Villain taht enters the city and Dominates all the Heroes in the HQ that cost 6 or less.
    ev => {
      villainify('Phoenix Force', ev.source, 6, 'GAIN');
      enterCityEv(ev, ev.source);
      cont(ev, () => hqHeroes().limit(c => c.cost <= 6).each(c => dominateEv(ev, ev.source, c)))
    },
  )],
// AMBUSH: Each player chooses an X-Men Hero from their discard pile. Emma Frost Dominates those Heroes.
// ATTACK: 4+
// VP: 4
  [ 2, makeVillainCard("Hellfire Club", "Emma Frost (White Queen)", 4, 4, {
    ambush: ev => eachPlayer(p => selectCardEv(ev, "Choose a Hero", p.discard.limit("X-Men"), c => dominateEv(ev, ev.source, c), p)),
  })],
// AMBUSH: Heroes cost 1 more to recruit this turn.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
// FLAVOR: Increasing his opponents' mass to 20,000 pounds puts a real weight on their shoulders.
  [ 2, makeVillainCard("Hellfire Club", "Harry Leland (Black Bishop)", 5, 3, {
    ambush: ev => addTurnMod('cost', isHero, 1),
    escape: sameEffect,
  })],
// AMBUSH: The Villain ascends to become a new Mastermind. He gains the ability "Master Strike: Each player simultaneously reveals a non-grey Hero. Mastermind dominates the revealed Hero with the highest cost (and tied for highest.)
// ATTACK: 8+
// VP: 6
  [ 1, makeVillainCard("Hellfire Club", "Mastermind (Jason Wyngarde)", 8, 6, {
    ambush: ev => ascendToMastermind(ev),
    strike: ev => {
      let cards: Card[] = [];
      eachPlayer(p => selectCardEv(ev, "Choose a Hero", p.hand.limit(isNonGrayHero), c => cards.push(c), p));
      cont(ev, () => cards.highest(c => c.cost).each(c => dominateEv(ev, ev.source, c)));
    }
  })],
// Sebastian Shaw has +1 Attack for each card you've played from your hand this turn.
// ESCAPE: Each player gains a Wound.
// ATTACK: 3+
// VP: 4
  [ 2, makeVillainCard("Hellfire Club", "Sebastian Shaw (Black King)", 3, 4, {
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
    varDefense: c => c.printedDefense + turnState.cardsPlayed.size,
  })],
]},
{ name: "Mojoverse", cards: [
// SUBNAME: Mindwarping TV Broadcast
// TRAP
  [ 1, makeTrapCard("Mojoverse", "Mindwarping TV Broadcast", 3,
    // A Villain captures a Bystander.
    ev => selectCardEv(ev, "Choose a Villain", cityVillains(), c => captureEv(ev, c)),
    // Have no Bystanders in the city captured by Villains.
    () => !cityVillains().has(c => c.captured.has(isBystander)),
    // After you draw your new hand at end of turn, each player discards down to four cards in hand.
    ev => pickDiscardEv(ev, -4),
  )],
// AMBUSH: Minor Domo captures 2 <b>Human Shields</b>.
// ESCAPE: Each player simultaneously reveals a card from their hand. Whoever revealed the lowest cost card (or tied for lowest) gains a Wound.
// 2* Attack
// VP: 2
  [ 2, makeVillainCard("Mojoverse", "Minor Domo", 2, 2, {
    ambush: ev => captureShieldEv(ev, ev.source, 2),
    escape: ev => {
      let cards: Card[] = [];
      eachPlayer(p => selectCardEv(ev, "Choose a card", p.hand.deck, c => cards.push(c), p));
      cont(ev, () => cards.highest(c => -c.cost).each(c => gainWoundEv(ev, owner(c))));
    },
  })],
// AMBUSH: Major Domo captures a <b>Human Shield</b>.
// ESCAPE: Each player simultaneously reveals a card from their hand. Whoever reveals the highest-costing card (or tied for highest) gains a Wound.
// 4* Attack
// VP: 3
  [ 2, makeVillainCard("Mojoverse", "Major Domo", 4 , 3, {
    ambush: ev => captureShieldEv(ev, ev.source),
    escape: ev => {
      let cards: Card[] = [];
      eachPlayer(p => selectCardEv(ev, "Choose a card", p.hand.deck, c => cards.push(c), p));
      cont(ev, () => cards.highest(c => -c.cost).each(c => gainWoundEv(ev, owner(c))));
    },
  })],
// AMBUSH: Each player reveals a [Covert] Hero or discards their hand. Each player who discarded their hand this way draws 5 cards.
// ESCAPE: Same effect.
// ATTACKG: 6
// VP: 4
  [ 1, makeVillainCard("Mojoverse", "Spiral", 6, 4, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.COVERT, () => { discardHandEv(ev, p); drawEv(ev, 5, p); })),
    escape: sameEffect,
  })],
// AMBUSH: These Warwolves capture a <b>Human Shield</b>.
// FIGHT: KO one of your Heroes.
// 3* Attack
// VP: 2
  [ 2, makeVillainCard("Mojoverse", "Warwolves", 3, 2, {
    ambush: ev => captureShieldEv(ev, ev.source),
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  })],
]},
{ name: "Murderworld", cards: [
// SUBNAME: Animatronic Killer Clowns
// TRAP
  [ 2, makeTrapCard("Murderworld", "Animatronic Killer Clowns", 2, u,
    // Recruit two Heroes.
    ev => turnState.pastEvents.count(e => e.type === 'RECRUIT') >= 2,
    // This Trap enters the city as a 3 Attack "Animatronic Killer Clown" Token Villain that captures a <b>Human Shield</b>.
    ev => {
      villainify('Animatronic Killer Clown', ev.source, 3);
      enterCityEv(ev, ev.source);
      cont(ev, () => captureShieldEv(ev, ev.source));
    },
  )],
// SUBNAME: Guillotine Rollercoaster
// TRAP
  [ 1, makeTrapCard("Murderworld", "Guillotine Rollercoaster", 3, u,
    // Have at least four different costs of Heroes in the HQ.
    ev => hqHeroes().uniqueCount(c => c.cost) >= 4,
    // After you draw your new hand at the end of this turn, each palyer reveals their hand and discards each card with the same cost as the cards in the HQ.
    ev => {
      const hqCosts = hqHeroes().unique(c => c.cost);
      eachPlayer(p => p.hand.limit(c => hqCosts.includes(c.cost)).each(c => discardEv(ev, c)));
    },
  )],
// AMBUSH: Miss Locke captures 2 <b>Human Shields</b>. Then reveal the top card of the Villain Deck. If it's a Trap or Master Strike, play it.
// ATTACK: 2*
// VP: 2
  [ 2, makeVillainCard("Murderworld", "Miss Locke", 2, 2, {
    ambush: ev => {
      captureShieldEv(ev, ev.source, 2);
      revealVillainDeckEv(ev, 1, cards => cards.limit(c => isStrike(c) || isTrap(c)).each(c => villainDrawEv(ev, c)));
    },
  })],
// SUBNAME: Monstrous Pinball Machine
// TRAP
  [ 1, makeTrapCard("Murderworld", "Monstrous Pinball Machine", 3,
    ev => {
      addTurnAction(new Ev(ev, 'EFFECT', { what: ev.source, func: ev => {
        gameState.herodeck.withTop(c => {
          const fail = () => {
            KOEv(ev, c);
            addFutureTrigger(ev => { villainDrawEv(ev); villainDrawEv(ev); })
          };
          const success = () => {
            gainEv(ev, c);
            moveCardEv(ev, ev.source, playerState.victory);
          };
          const actions = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
            return n >= c.cost ?
              new Ev(ev, 'RECRUIT', { what: c, func: success, cost: { recruit: n }}) :
              new Ev(ev, 'EFFECT', { what: c, func: fail, cost: { recruit: n }});
          }).filter(ev => canPayCost(ev));
          const options = actions.map(a => ({l:a.cost.recruit.toString(), v:a}));
          chooseOptionEv(ev, "Choose amount to pay", options, a => playEvent(a));
        });
      }}));
    },
    // Pay any amount of Recruit. Then you must reveal the top card of the Hero Deck. If you paid enough, recruit that Hero and put this Trap in your Victory Pile.
    ev => false,
    // KO that Hero. Play two extra cards from the Villain Deck next turn.
    ev => {
      gameState.herodeck.withTop(c => KOEv(ev, c));
      addFutureTrigger(ev => { villainDrawEv(ev); villainDrawEv(ev); })
    },
  )],
// SUBNAME: Sulfuric Acid Water Slide
// TRAP
  [ 2, makeTrapCard("Murderworld", "Sulfuric Acid Water Slide", 2,
    // Play another card from the Villain Deck.
    ev => villainDrawEv(ev),
    // Have no Villains in the Sewers.
    () => !gameState.city.limit(d => isLocation(d, 'SEWERS')).has(d => d.has(isVillain)),
    // Each player gains a Wound.
    ev => eachPlayer(p => gainWoundEv(ev, p)),
  )],
]},
{ name: "Shadow-X", cards: [
// SUBNAME: Betrayal of the Shadow
// VP: 4
// TRAP
  [ 1, makeTrapCard("Shadow-X", "Betrayal of the Shadow", 4,
    ev => {
      addTurnAction(new Ev(ev, 'EFFECT', { what: ev.source, cost: { recruit: 6 }, func: ev => {
        moveCardEv(ev, ev.what, playerState.victory);
      }}));
    },
    // You may pay 6 Recruit.
    ev => false,
    // Each player reveals their hand. Then, each player chooses a Shadow-X card from their hand or discard pile to enter the city as a Villain.
    ev => eachPlayer(p => selectCardEv(ev, "Choose a Villain", [...p.hand.deck, ...p.victory.deck].limit(isGroup("Shadow-X")), c => enterCityEv(ev, c), p)),
  )],
// FIGHT: Gain this as a Hero.
// ATTACK: 4
// GAINABLE
// CLASS: [Instinct]
// {XGENE [Instinct]} The next Hero you recruit from the HQ has Soaring Flight.
// ATTACKG: 2
  [ 2, makeGainableCard(makeVillainCard("Shadow-X", "Dark Angel", 4, u, {
  }), u, 2, Color.INSTINCT, u, "D", ev => xGenePower(Color.INSTINCT) && (turnState.nextHeroRecruit = 'SOARING'))],
// FIGHT: Gain this as a Hero.
// ATTACK: 5
// GAINABLE
// CLASS: [Tech]
// {XGENE [Tech]} You may KO a card from your hand or discard pile.
// ATTACKG: 2
  [ 1, makeGainableCard(makeVillainCard("Shadow-X", "Dark Beast", 5, u, {
  }), u, 2, Color.TECH, u, "D", ev => xGenePower(Color.TECH) && KOHandOrDiscardEv(ev, undefined))],
// AMBUSH: Each player reveals a [Ranged] Hero or discards a card.
// FIGHT: Gain this as a Hero.
// ATTACK: 7
// GAINABLE
// CLASS: [Ranged]
// {XGENE [Ranged]} Return a [Ranged] Hero from your discard pile to your hand.
// ATTACKG: 3
  [ 1, makeGainableCard(makeVillainCard("Shadow-X", "Dark Cyclops", 7, u, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => pickDiscardEv(ev, 1, p))),
  }), u, 3, Color.RANGED, u, "", ev => xGenePower(Color.RANGED) && selectCardEv(ev, "Choose a Hero to put in your hand", playerState.discard.limit(isHero).limit(Color.RANGED), c => moveCardEv(ev, c, playerState.hand)))],
// FIGHT: Gain this as a Hero.
// ATTACK: 5
// GAINABLE
// CLASS: [Strength]
// {XGENE [Strength]} Draw a card.
// ATTACKG: 2
  [ 2, makeGainableCard(makeVillainCard("Shadow-X", "Dark Iceman", 5, u, {
  }), u, 2, Color.STRENGTH, u, "D", ev => xGenePower(Color.STRENGTH) && drawEv(ev, 1))],
// AMBUSH: Dark Marvel Girl Dominates each X-Men Hero that costs 4 or less from the HQ.
// FIGHT: Gain this as a Hero.
// ATTACK: 4+
// GAINABLE
// CLASS: [Covert]
// {XGENE [Covert]} Rescue a Bystander.
// ATTACKG: 2
  [ 1, makeGainableCard(makeVillainCard("Shadow-X", "Dark Marvel Girl", 4, u, {
    ambush: ev => hqHeroes().limit('X-Men').limit(c => c.cost <= 4).each(c => dominateEv(ev, ev.source, c)),
  }), u, 2, Color.COVERT, u, "D", ev => xGenePower(Color.COVERT) && rescueEv(ev))],
]},
{ name: "Shi'ar Imperial Guard", cards: [
// FIGHT: If you fought Blackthorn in the Sewers or Streets, each other player gains a Wound.
// ESCAPE: Each player gains a Wound.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Shi'ar Imperial Guard", "Blackthorn", 5, 3, {
    fight: ev => isLocation(ev.where, 'SEWERS', 'STREETS') && eachOtherPlayerVM(p => gainWoundEv(ev, p)),
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
  })],
// AMBUSH: Each player discards an X-Men Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Shi'ar Imperial Guard", "Gladiator", 7, 5, {
    ambush: ev => eachPlayer(p => selectCardOptEv(ev, "Choose a Hero to discard", p.hand.limit('X-Men'), c => discardEv(ev, c), () => gainWoundEv(ev, p), p)),
    escape: sameEffect,
  })],
// AMBUSH: Each player discards the top four cards of their deck and chooses one of those cards that costs 1 to 4. Oracle Dominates those Heroes.
// ATTACK: 4+
// VP: 4
  [ 2, makeVillainCard("Shi'ar Imperial Guard", "Oracle", 4, 4, {
    ambush: ev => eachPlayer(p => revealPlayerDeckEv(ev, 4, cards => {
      cards.each(c => discardEv(ev, c));
      selectCardEv(ev, "Choose a card", cards.limit(c => c.cost >= 1 && c.cost <= 4), c => dominateEv(ev, ev.source, c));
    }, p)),
  })],
// SUBNAME: Shi'ar Trial by Combat
// TRAP
  [ 1, makeTrapCard("Shi'ar Imperial Guard", "Shi'ar Trial by Combat", 2,
    // If the Bridge is empty, reveal the top card of the Villain Deck. If it's a Villain, put it on the Bridge.
    ev => withCity('BRIDGE', bridge => bridge.size || revealVillainDeckEv(ev, 1, cards => cards.limit(isVillain).each(c => enterCityEv(ev, c, bridge)))),
    // Have no Villains on the Bridge.
    ev => !gameState.city.limit(d => isLocation(d, 'BRIDGE')).has(d => d.has(isVillain)),
    // After you draw a new hand at end of turn, each player KOs a non-grey Hero from their discard pile.
    ev => eachPlayer(p => selectCardAndKOEv(ev, p.discard.limit(isNonGrayHero), p)),
  )],
// AMBUSH: Each player reveals a [Strength] Hero or discards a card.
// FIGHT: KO a card from your discard pile.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Shi'ar Imperial Guard", "Smasher", 5, 3, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => pickDiscardEv(ev, 1, p), p)),
    fight: ev => selectCardAndKOEv(ev, playerState.discard.deck),
  })],
]},
{ name: "Sisterhood of Mutants", cards: [
// FIGHT: KO one of your Heroes.
// ESCAPE: Each player reveals an [Instinct] Hero or gains a Wound.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Sisterhood of Mutants", "Lady Deathstrike", 6, 4, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainWoundEv(ev, p), p)),
  })],
// AMBUSH: This Villain ascends to become a new Mastermind. She gains the ability "Master Strike: Each player simultaneously reveals a non-grey Hero. Lady Mastermind Dominates the revealed Hero with the lowest cost (and tied for lowest.)
// ATTACK: 7+
// VP: 5
  [ 1, makeVillainCard("Sisterhood of Mutants", "Lady Mastermind", 7, 5, {
    ambush: ev => ascendToMastermind(ev),
    strike: ev => {
      let cards: Card[] = [];
      eachPlayer(p => selectCardEv(ev, "Choose a Hero", p.hand.limit(isNonGrayHero), c => cards.push(c), p));
      cont(ev, () => cards.highest(c => -c.cost).each(c => dominateEv(ev, ev.source, c)));
    }
  })],
// SUBNAME: Resurrect Madelyne Pryor
// TRAP
  [ 1, makeTrapCard("Sisterhood of Mutants", "Resurrect Madelyne Pryor", 0,
    ev => {
      addTurnAction(new Ev(ev, 'EFFECT', { what: ev.source, cost: { recruit: 3 }, func: ev => {
        shuffleIntoEv(ev, ev.what, gameState.villaindeck);
        villainDrawEv(ev);
      }}));
    },
    // You may pay 3 Recruit. If you do, shuffle this Trap back into the Villain Deck, then play a card from the Villain Deck.
    ev => false,
    // This Trap becomes a Scheme Twist that takes effect immediately.
    ev => playTwistEv(ev, ev.source),
  )],
// AMBUSH: Selene Dominates all of the 0-cost Heroes from the KO pile.
// FIGHT: KO all the Heroes Dominated by Selene.
// ESCAPE: Put one Hero Dominated by Selene into each player's discard pile.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("Sisterhood of Mutants", "Selene", 3, 3, {
    ambush: ev => gameState.ko.limit(isHero).limit(c => c.cost === 0).each(c => dominateEv(ev, ev.source, c)),
    fight: ev => ev.source.attached('DOMINATED').each(c => KOEv(ev, c)),
    escape: ev => chooseForEachPlayerEv(ev, "Choose a Hero", ev.source.attached('DOMINATED'), (p, c) => moveCardEv(ev, c, p.discard)),
  })],
// AMBUSH: Each player reveals their hand and chooses a 3-cost Hero from it. Typhoid Mary Dominates those Heroes.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("Sisterhood of Mutants", "Typhoid Mary", 3, 3, {
    ambush: ev => eachPlayer(p => selectCardEv(ev, "Choose a 3-cost Hero", p.hand.limit(isHero).limit(c => c.cost === 3), c => dominateEv(ev, ev.source, c), p)),
  })],
]},
]);
addVillainTemplates("Spider-Man Homecoming", [
{ name: "Salvagers", cards: [
// {STRIKER 1}
// FIGHT: KO one of your 0-cost Heroes.
// ESCAPE: The current player reveals a Ranged Hero or gains a 0-cost Hero from the KO pile.
// ATTACK: 4+
// VP: 4
  [ 2, makeVillainCard("Salvagers", "Hybrid Alien Tech", 4, 4, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes().limit(c => c.cost === 0)),
    escape: ev => revealOrEv(ev, Color.RANGED, () => selectCardEv(ev, "Choose a 0-cost Hero", gameState.ko.limit(isHero).limit(c => c.cost === 0), c => gainEv(ev, c))),
    varDefense: strikerVarDefense,
  })],
// {STRIKER 1}
// ESCAPE: Each player reveals an Instinct Hero or discards a card.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("Salvagers", "Shocker #1", 3, 3, {
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => pickDiscardEv(ev, 1, p))),
    varDefense: strikerVarDefense,
  })],
// AMBUSH: Each player reveals their hand and discards all cards with the same card name as a card in the HQ.
// ESCAPE: <i>(After the normal HQ KO for this escaping)</i> Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Salvagers", "Shocker #2", 5, 3, {
    ambush: ev => eachPlayer(p => p.hand.limit(c => hqHeroes().map(c => c.cardName).includes(c.cardName)).each(c =>discardEv(ev, c))),
    escape: sameEffect,
  })],
// FIGHT: You get +1 Recruit for each Tech Hero in the HQ.
// ESCAPE: Each player reveals a Tech Hero or gains a Wound.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Salvagers", "Tinkerer", 4, 2, {
    fight: ev => addRecruitEvent(ev, hqHeroes().count(Color.TECH)),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainWoundEv(ev, p), p)),
  })],
]},
{ name: "Vulture Tech", cards: [
// {STRIKER 1}
// FIGHT: KO one of your Heroes with a Recruit icon.
// ESCAPE: Each player discards a card with a Recruit icon.
// ATTACK: 4+
// VP: 4
  [ 2, makeVillainCard("Vulture Tech", "Chitauri Weapon Assault", 4, 4, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes().limit(hasRecruitIcon)),
    escape: ev => eachPlayer(p => selectCardEv(ev, "Choose a card to discard", p.hand.limit(hasRecruitIcon), c => discardEv(ev, c), p)),
    varDefense: strikerVarDefense,
  })],
// {STRIKER 1}
// FIGHT: Danger Sense 3
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("Vulture Tech", "High Tech Helmet", 3, 3, {
    fight: ev => dangerSenseEv(ev, 3),
    varDefense: strikerVarDefense,
  })],
// {STRIKER 1}
// FIGHT: The next Hero you gain this turn has Wall Crawl.
// VP: 2
// ATTACK: 2+
  [ 2, makeVillainCard("Vulture Tech", "Razor Talons", 2, 2, {
    fight: ev => turnState.nextHeroRecruit = 'DECK',
    varDefense: strikerVarDefense,
  })],
// {STRIKER 1}
// AMBUSH: Turbine Powered captures a Bystander. Then move this Villain to the Rooftops. If there's already a Villain there, swap them.
// ATTACK: 5+
// VP: 5
  [ 2, makeVillainCard("Vulture Tech", "Turbine Powered", 5, 5, {
    ambush: ev => {
      captureEv(ev, ev.source);
      withCity('ROOFTOPS', rooftops => ev.source.location !== rooftops && swapCardsEv(ev, ev.source, rooftops));
    },
    varDefense: strikerVarDefense,
  })],
]},
]);
addVillainTemplates("Champions", [
{ name: "Monsters Unleashed", cards: [
// AMBUSH: Goom captures a Bystander.
// FIGHT: KO one of your Heroes.
// VP: 4
// ATTACK: 6
  [ 1, makeVillainCard("Monsters Unleashed", "Goom", 6, 4, {
    ambush: ev => captureEv(ev, ev.source),
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  })],
// {SIZECHANGING STRENGTH COVERT}
// FIGHT: Two Bystanders from the Bystander Stack enter the city as 3 Attack "Splintered Half-Groot" Villains. When you fight one, rescue it as a Bystander.
// ATTACK: 6*
// VP: 2
  [ 1, makeVillainCard("Monsters Unleashed", "Groot from Planet X", 6, 2, {
    fight: ev => repeat(2, () => cont(ev, () => gameState.bystanders.withTop(c => {
      villainify("Splintered Half-Groot", c, 3, "RESCUE");
      enterCityEv(ev, c);
    }))),
    sizeChanging: Color.STRENGTH | Color.COVERT,
  })],
// {SIZECHANGING STRENGTH INSTINCT}
// FIGHT: When you draw a new hand of cards at the end of this turn, draw an extra card.
// ATTACK: 5*
// VP: 2
  [ 1, makeVillainCard("Monsters Unleashed", "Monsteroso", 5, 2, {
    fight: ev => addEndDrawMod(1),
    sizeChanging: Color.STRENGTH | Color.INSTINCT,
  })],
// You can't fight Orrgo unless you have already defeated another Villain this turn.
// ATTACK: 2*
// VP: 2
  [ 1, makeVillainCard("Monsters Unleashed", "Orrgo", 2, 2, {
    fightCond: c => turnState.pastEvents.has(e => e.type === 'DEFEAT' && isVillain(e.what)),
  })],
// {SIZECHANGING TECH RANGED}
// FIGHT: A Hero in the HQ gains {SIZECHANGING TECH RANGED} Recruit this turn.
// ATTACK: 7*
// VP: 3
  [ 1, makeVillainCard("Monsters Unleashed", "Sporr", 7, 3, {
    fight: ev => selectCardEv(ev, "Choose a Hero", hqHeroes(), c => addTurnSet('sizeChanging', v => v == c, (c, prev) => safeOr(prev, Color.TECH | Color.RANGED))),
    sizeChanging: Color.TECH | Color.RANGED,
  })],
// {SIZECHANGING STRENGTH INSTINCT COVERT TECH RANGED}
// FIGHT: All Heroes currently in the HQ cost 1 less this turn.
// ATTACK: 12*
// VP: 5
  [ 1, makeVillainCard("Monsters Unleashed", "Tim Boo Ba", 12, 5, {
    fight: ev => hqHeroes().each(c => addTurnMod('cost', v => v === c, -1)),
    sizeChanging: Color.STRENGTH | Color.INSTINCT | Color.COVERT | Color.TECH | Color.RANGED,
  })],
// {SIZECHANGING COVERT TECH}
// AMBUSH: Trull captures a Bystander. Then <b>Demolish</b> each player.
// ATTACK: 8*
// VP: 4
// FLAVOR: Why yes, that is an alien entity possessing the world's most terrifying steam shovel.
  [ 1, makeVillainCard("Monsters Unleashed", "Trull the Unhuman", 8, 4, {
    ambush: [ ev => captureEv(ev, ev.source), ev => demolishEv(ev) ],
    sizeChanging: Color.COVERT | Color.TECH,
  })],
// {SIZECHANGING RANGED INSTINCT}
// ESCAPE: <b>Demolish</b> each player.
// ATTACK: 9*
// VP: 5
  [ 1, makeVillainCard("Monsters Unleashed", "Zzutak", 9, 5, {
    escape: ev => demolishEv(ev),
    sizeChanging: Color.RANGED | Color.INSTINCT,
  })],
]},
{ name: "Wrecking Crew", cards: [
// AMBUSH: Bulldozer moves an extra space forward. If this pushes any Villains forward, <b>Demolish</b> each player.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Wrecking Crew", "Bulldozer", 4, 2, {
    ambush: ev => {
      ev.source.location.next ? moveCardEv(ev, ev.source, ev.source.location.next) : villainEscapeEv(ev, ev.source);
      ev.source.location.next && ev.source.location.next.has(isVillain) && demolishEv(ev);
    },
  })],
// FIGHT: KO one of your Heroes.
// ESCAPE: <b>Demolish</b> each player.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Wrecking Crew", "Piledriver", 6, 4, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    escape: ev => demolishEv(ev),
  })],
// FIGHT: If you fight Thunderball in the Sewers or Bank, <b>Demolish</b> each other player.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Wrecking Crew", "Thunderball", 5, 3, {
    fight: ev => isLocation(ev.where, 'SEWERS', 'BANK') && demolishEv(ev)
  })],
// AMBUSH: For each Wrecking Crew Villain in the city, (including this one), <b>Demolish</b> each player.
// ATTACK: 7
// VP: 5
  [ 2, makeVillainCard("Wrecking Crew", "The Wrecker", 7, 5, {
    ambush: ev => cityVillains().limit(isGroup("Wrecking Crew")).each(() => demolishEv(ev)),
  })],
]},
]);
addVillainTemplates("World War Hulk", [
{ name: "Aspects of the Void", cards: [
// FIGHT: Each player simultaneously puts a card from their discard pile into the discard pile of the player to their right.
// ESCAPE: Same effect.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Aspects of the Void", "Black Anti-Hurricane", 6, 4, {
    fight: ev => {
      const cards = new Map<Player, Card>();
      eachPlayer(p => selectCardEv(ev, "Chooose a card", p.discard.deck, c => cards.set(p.right, c)));
      cont(ev, () => { for(let [p, c] of cards) moveCardEv(ev, c, p.discard); })
    },
    escape: sameEffect,
  })],
// FIGHT: {FEAST}. If Demonform feasts on a non-grey Hero, gain a Hero from the HQ of that cost or less.
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Aspects of the Void", "Demonform", 7, 5, {
    fight: ev => feastEv(ev, c => isNonGrayHero(c) && selectCardEv(ev, "Choose a Hero to gain", hqHeroes().limit(v => v.cost <= c.cost), c => gainEv(ev, c))),
  })],
// {WOUNDED FURY}
// AMBUSH: Infini-Tendrils captures a Bystander.
// ATTACK: 6+
// VP: 3
  [ 2, makeVillainCard("Aspects of the Void", "Infini-Tendrils", 6, 3, {
    ambush: ev => captureEv(ev, ev.source),
    varDefense: woundedFuryVarDefense,
  })],
// SUBNAME: Psychotic Break
// TRAP
  [ 1, makeTrapCard("Aspects of the Void", "Psychotic Break", 2,
    // Play another card from the Villain Deck.
    ev => villainDrawEv(ev),
    // Defeat a Villain.
    ev => pastEvWhat('DEFEAT').has(isVillain),
    // <i>(After you draw your new hand)</i> Psychotic Break becomes a Master Strike that takes effect immediately.
    ev => playStrikeEv(ev, ev.source),
  )],
// FIGHT: You get +2 Recruit.
// ATTACK: 5
// VP: 3
// FLAVOR: Some briefly think the Shadow Man is the heroic Sentry. The thought doesn't last long.
  [ 2, makeVillainCard("Aspects of the Void", "Shadow Man", 5, 3, {
    fight: ev => addRecruitEvent(ev, 2),
  })],
]},
{ name: "Code Red", cards: [
// SUBNAME: Caught Red-Handed
// TRAP
  [ 1, makeTrapCard("Code Red", "Caught Red-Handed", 3, u,
    // Recruit a [Covert] Hero or recruit any two Heroes.
    ev => pastEvWhat('RECRUIT').has(Color.COVERT) || pastEvents('RECRUIT').size >= 2,
    // <i>(After you draw your new hand)</i> Each player reveals a [Covert] Hero or gains a Wound.
    ev => eachPlayer(p => revealOrEv(ev, Color.COVERT, () => gainWoundEv(ev, p), p)),
  )],
// FIGHT: Choose a [Covert] Hero in the HQ. It costs 2 less this turn.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Code Red", "Crimson Dynamo", 4, 2, {
    fight: ev => selectCardEv(ev, "Choose a Hero", hqHeroes().limit(Color.COVERT), c => addTurnMod('cost', v => v === c, -2)),
  })],
// FIGHT: If you played a [Covert] Hero this turn, KO one of your Heroes.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Code Red", "Elektra, Red Blades", 5, 3, {
    fight: ev => turnState.cardsPlayed.has(Color.COVERT) && selectCardAndKOEv(ev, yourHeroes()),
  })],
// FIGHT: Reveal the top card of your deck. If it costs 0, KO it. If it's [Covert], draw it.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("Code Red", "Punisher, Red Dot Sniper", 6, 4, {
    fight: ev => revealPlayerDeckEv(ev, 1, cards => {
      cards.each(c => c.cost === 0 ? KOEv(ev, c) : isColor(Color.COVERT)(c) && drawCardEv(ev, c));
    }),
  })],
// {WOUNDED FURY}
// FIGHT: Each player reveals a [Covert] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 6+
// VP: 5
  [ 1, makeVillainCard("Code Red", "Red She-Hulk", 6, 5, {
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.COVERT, () => gainWoundEv(ev, p), p)),
    escape: sameEffect,
    varDefense: woundedFuryVarDefense,
  })],
// Thundra gets +2 Attack if there are any number of [Covert] Heroes in the HQ.
// AMBUSH: Put each non-[Covert] Hero from the HQ on the bottom of the Hero Deck.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Code Red", "Thundra", 4, 3, {
    ambush: ev => selectCardOrderEv(ev, "Put a Hero on the bottom of the Hero deck", hqHeroes().limit(Color.COVERT), c => moveCardEv(ev, c, gameState.herodeck, true)),
    varDefense: c => c.printedDefense + (hqHeroes().has(Color.COVERT) ? 2 : 0),
  })],
]},
{ name: "Illuminati", cards: [
// During your turn, any number of times, you may discard a card that has no rules text to give Black Bolt -2 Attack this turn.
// ESCAPE: Each player discards a card with no rules text.
// ATTACK: 13*
// VP: 5
  [ 2, makeVillainCard("Illuminati", "Black Bolt", 13, 5, {
    escape: ev => {},
    varDefense: c => c.printedDefense - 2 * pastEvents('DISCARD').count(e => e.source === c),
    cardActions: [ (c, ev) => new Ev(ev, 'EFFECT', ev => {
      selectCardEv(ev, "Discard a card with no rules text", playerState.hand.limit(hasFlag('N')), c => discardEv(ev, c));
    })],
  })],
// AMBUSH: Each player who can't {OUTWIT} Dr. Strange discards a card.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Illuminati", "Dr. Strange", 5, 3, {
    ambush: ev => eachPlayer(p => outwitOrEv(ev, () => pickDiscardEv(ev, 1, p), p)),
  })],
// This Villain gets +1 Attack for each Bystander in the city.
// AMBUSH: This Villain captures 3 Bystanders.
// ATTACK: 5+
// VP: 3
  [ 1, makeVillainCard("Illuminati", "Dr. Strange, Possessed by Zom", 5, 3, {
    ambush: ev => captureEv(ev, ev.source, 3),
    varDefense: c => c.printedDefense + CityCards().sum(c => c.captured.count(isBystander)), // TODO count city bystanders
  })],
// SUBNAME: Enchain the Hulk
// TRAP
  [ 1, makeTrapCard("Illuminati", "Enchain the Hulk", 4,
    ev => {
      addTrapAction(ev, 'Discard two Heroes', c => classes.has(col => playerState.hand.count(col) >= 2), ev => {
        chooseClassEv(ev, col => {
          selectObjectsEv(ev, 'Choose Heroes to discard', 2, playerState.hand.limit(col), c => discardEv(ev, c));
        }, col => playerState.hand.count(col) >= 2);
      });
    },
    // Discard two cards of the same Hero Class or recruit two cards of the same Hero Class. ([Strength], [Instinct], [Covert], [Tech], [Ranged], but not grey)
    ev => classes.has(col => pastEvWhat('RECRUIT').count(col) >= 2),
    // <i>(After you draw your new hand)</i> {XDRAMPAGE Hulk}
    ev => xdRampageEv(ev, 'Hulk'),
  )],
// Hulkbuster Iron Man gets +3 Attack unless you {OUTWIT} him.
// ESCAPE: {XDRAMPAGE Illuminati}
// ATTACK: 6+
// VP: 4
  [ 2, makeVillainCard("Illuminati", "Hulkbuster Iron Man", 6, 4, {
    escape: ev => xdRampageEv,
    varDefense: c => c.printedDefense + (pastEvents('OUTWIT').has(e => e.getSource() === c) ? 0 : 3),
    cardActions: [ (c, ev) => new Ev(ev, 'EFFECT', { cost: { cond: c => canOutwit() && !pastEvents('OUTWIT').has(e => e.getSource() === c)}, what: c, func: ev => {
      outwitOrEv(ev, () => {});
    }}) ]
  })],
]},
{ name: "Intelligencia", cards: [
// SUBNAME: Battle of Wits
// TRAP
  [ 2, makeTrapCard("Intelligencia", "Battle of Wits", 3,
    // {OUTWIT} this trap.
    ev => addTrapAction(ev, 'Outwit this trap', c => canOutwit(), ev => outwitOrEv(ev, () => {})),
    ev => false,
    // <i>(After you draw your new turn)</i> Each player discards down to 4 cards.
    ev => eachPlayer(p => pickDiscardEv(ev, -4, p)),
  )],
// {WOUNDED FURY}
// AMBUSH: Each player who can't {OUTWIT} Cosmic Hulk Robot gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("Intelligencia", "Cosmic Hulk Robot", 5, 4, {
    ambush: ev => eachPlayer(p => outwitOrEv(ev, () => gainWoundEv(ev, p), p)),
    escape: sameEffect,
    varDefense: woundedFuryVarDefense,
  })],
// Doc Samson has +4 Attack unless you {OUTWIT} him.
// FIGHT: KO one of your Heroes.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Intelligencia", "Doc Samson", 4, 3, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: c => c.printedDefense + (pastEvents('OUTWIT').has(e => e.getSource() === c) ? 0 : 4),
    cardActions: [ (c, ev) => new Ev(ev, 'EFFECT', { cost: { cond: c => canOutwit() && !pastEvents('OUTWIT').has(e => e.getSource() === c)}, what: c, func: ev => {
      outwitOrEv(ev, () => {});
    }}) ]
  })],
// AMBUSH: If you can't {OUTWIT} the Leader, play the top card of the Villain Deck.
// FIGHT: Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Intelligencia", "The Leader, Gamma Fiend", 5, 3, {
    ambush: ev => outwitOrEv(ev, () => villainDrawEv(ev)),
    fight: sameEffect,
  })],
]},
{ name: "Sakaar Imperial Guard", cards: [
// SUBNAME: Gladiators' Colosseum
// TRAP
  [ 1, makeTrapCard("Sakaar Imperial Guard", "Gladiators' Colosseum", 4, u,
    // Only play cards from a single Team of your choice this turn (e.g. S.H.I.E.L.D., AVENGERS, X-MEN, WARBOUND, etc.)
    ev => turnState.cardsPlayed.uniqueCount(c => c.team) <= 1, // TODO team => teams
    // <i>(After you draw your new hand)</i> Each player reveals their hand, chooses a Team, and discards all cards that don't belong to that Team.
    // TODO could be simplified affiliations.filter(a => p.hand.has(a))
    ev => eachPlayer(p => chooseOptionEv(ev, "Choose a team", p.hand.deck.unique(c => c.team).map(t => ({l:t, v:t})), v => {
      p.hand.limit(c => !isTeam(v)(c)).each(c => discardEv(ev, c));
    }, p)),
  )],
// FIGHT: Look at the top three cards of your deck. Put them back in any order. Then {FEAST}.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Sakaar Imperial Guard", "Great Devil Corker", 6, 4, {
    fight: [ ev => lookAtDeckEv(ev, 3, () => {}), feastEv ],
  })],
// During your turn, Headman Charr gets +1 Attack for each Villain in your Victory Pile.
// ESCAPE: Each player gains a Wound.
// ATTACK: 2+
// VP: 2
  [ 2, makeVillainCard("Sakaar Imperial Guard", "Headman Charr", 2, 2, {
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
    varDefense: c => c.printedDefense + playerState.victory.count(isVillain),
  })],
// FIGHT: If you {OUTWIT} Lieutenant Caiera draw two cards.
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Sakaar Imperial Guard", "Lieutenant Caiera", 7, 5, {
    fight: ev => mayOutwitEv(ev, () => drawEv(ev, 2)),
  })],
// Primus Vand gets +1 Attack for each Villain next to him.
// FIGHT: KO one of your Heroes.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("Sakaar Imperial Guard", "Primus Vand", 3, 3, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: c => c.printedDefense + cityAdjacent(c.location).count(d => d.has(isVillain)),
  })],
]},
{ name: "U-Foes", cards: [
// FIGHT: Each player reveals a [Strength] Hero of KO's a Hero that costs 1 or more from their discard pile.
// ESCAPE: Same effect.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("U-Foes", "Ironclad", 6, 4, {
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => selectCardAndKOEv(ev, p.victory.limit(isHero).limit(c => c.cost >= 1), p), p)),
    escape: sameEffect,
  })],
// FIGHT: Each player reveals a [Covert] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("U-Foes", "Vapor", 4, 2, {
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.COVERT, () => gainWoundEv(ev, p), p)),
    escape: sameEffect,
  })],
// FIGHT: Each player who reveals an [Instinct] Hero draws a card.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("U-Foes", "Vector", 4, 2, {
    fight: ev => eachPlayer(p => revealAndEv(ev, Color.INSTINCT, () => drawEv(ev, 1, p), p)),
  })],
// SUBNAME: Unidentified Flying U-Foes
// TRAP
  [ 1, makeTrapCard("U-Foes", "Unidentified Flying U-Foes", 3,
    ev => {
      addTrapAction(ev, 'Discard a [Tech] Hero', c => playerState.hand.limit(isHero).has(Color.TECH), ev => {
        selectCardEv(ev, 'Select a Hero to discard', playerState.hand.limit(isHero).limit(Color.TECH), c => discardEv(ev, c));
      });
      addTrapAction(ev, 'Discard 3 cards', c => playerState.hand.size >= 3, ev => {
        selectObjectsEv(ev, 'Select cards to discard', 3, playerState.hand.deck, c => discardEv(ev, c));
      });
    },
    // Discard a [Tech] Hero or discard three cards.
    ev => false,
    // Play two extra cards from the Villain Deck next turn.
    ev => addFutureTrigger(ev => { villainDrawEv(ev); villainDrawEv(ev); }),
  )],
// FIGHT: Each player who reveals a [Ranged] Hero may KO a card from their discard pile.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("U-Foes", "X-Ray", 5, 3, {
    fight: ev => eachPlayer(p => revealAndEv(ev, Color.RANGED, () => selectCardAndKOEv(ev, p.discard.deck, p), p)),
  })],
]},
{ name: "Warbound", cards: [
// FIGHT: Draw a card. Another player of your choice also draws a card.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Warbound", "Elloe Kaifi", 5, 3, {
    fight: ev => {
      drawEv(ev);
      chooseOtherPlayerEv(ev, p => drawEv(ev, 1, p));
    },
  })],
// FIGHT: KO a card from the HQ. Each player reveals their hand and KO's a card with that same cost.
// ESCAPE: Same effect.
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Warbound", "Hiroim", 7, 5, {
    fight: ev => selectCardEv(ev, 'Choose a card to KO', hqCards(), c => {
      KOEv(ev, c);
      eachPlayer(p => selectCardAndKOEv(ev, p.hand.limit(v => v.cost === c.cost), p));
    }),
    escape: sameEffect,
  })],
// AMBUSH: KO a Hero from the HQ. Each player reveals their hand and discards a card with that same cost.
// ESCAPE: Same effect.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("Warbound", "Korg", 6, 4, {
    fight: ev => selectCardEv(ev, 'Choose a card to KO', hqCards(), c => {
      discardEv(ev, c);
      eachPlayer(p => selectCardAndKOEv(ev, p.hand.limit(v => v.cost === c.cost), p));
    }),
    escape: sameEffect,
  })],
// FIGHT: Look at the top two cards of your deck. Put them back on the top and/or bottom. Then {FEAST}.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Warbound", "Miek The Unhived", 5, 3, {
    fight: [ ev => investigateEv(ev, c => false), feastEv ], // TODO almost investigate
  })],
// {WOUNDED FURY}
// Fight<b></b>: Feast<b>. If this feasts on a non-grey Hero, draw two cards.</b> // FIX
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Warbound", "No-Name, Brood Queen", 4, 3, {
    fight: ev => feastEv(ev, c => isNonGrayHero(c) && drawEv(ev, 2)),
    varDefense: woundedFuryVarDefense,
  })],
// SUBNAME: Warbound Rescue
// TRAP
  [ 1, makeTrapCard("Warbound", "Warbound Rescue", 7,
    ev => addTrapAction(ev,
      'Put Warbound and Henchman into the city',
      c => playerState.victory.has(isHenchman) && playerState.victory.has(isGroup("Warbound")),
      ev => {
        selectCardEv(ev, 'Choose a Villain', playerState.victory.limit(isGroup('Warbound')), c => enterCityEv(ev, c));
        selectCardEv(ev, 'Choose a Henchman', playerState.victory.limit(isHenchman), c => enterCityEv(ev, c))
      }),
    // Put a Warbound Villain and Henchman Villain from your Victory Pile back into the city.
    ev => false,
    // Each player gains a Wound.
    ev => eachPlayer(p => gainWoundEv(ev, p)),
  )],
]},
]);
addVillainTemplates("Ant-Man", [
{ name: "Ultron's Legacy", cards: [
// {USIZECHANGING TECH 3}
// FIGHT: KO one of your Heroes.
// ATTACK: 3*
// VP: 2
  [ 1, makeVillainCard("Ultron's Legacy", "Ultron Roboticks", 3, 2, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    uSizeChanging: { color: Color.TECH, amount: 3 },
  })],
// <b>Empowered</b> by [Ranged]
// FIGHT: KO one of your Heroes.
// ATTACK: 3+
// VP: 2
  [ 1, makeVillainCard("Ultron's Legacy", "Original Ultron-1", 3, 2, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: empowerVarDefense(Color.RANGED),
  })],
// <b>Empowered</b> by [Tech]
// FIGHT: Draw a card.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Ultron's Legacy", "Legions of Ultron", 4, 3, {
    fight: ev => drawEv(ev),
    varDefense: empowerVarDefense(Color.TECH),
  })],
// <b>Empowered</b> by [Instinct]
// FIGHT: KO a card from your discard pile.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Ultron's Legacy", "Alkhema", 4, 3, {
    fight: ev => selectCardAndKOEv(ev, playerState.discard.deck),
    varDefense: empowerVarDefense(Color.INSTINCT),
  })],
// {USIZECHANGING TECH 5}
// FIGHT: A Hero in the HQ with no <b>Size-Changing</b> abilites gains {SIZECHANGING TECH} this turn.
// ATTACK: 6*
// VP: 3
  [ 1, makeVillainCard("Ultron's Legacy", "Ultron-Pym", 6, 3, {
    fight: ev => selectCardEv(ev, "Choose a Hero", hqHeroes().limit(hasNoSizeChanging), c => {
      addTurnSet('sizeChanging', v => v === c, (c, p) => safeOr(p, Color.TECH));
    }),
    uSizeChanging: { color: Color.TECH, amount: 5 },
  })],
// <b>Double Empowered</b> by [Tech]
// AMBUSH: Put all non-[Tech] Heroes from the HQ on the bottom of the Hero Deck.
// ATTACK: 5+
// VP: 5
  [ 1, makeVillainCard("Ultron's Legacy", "Future Ultron Prime", 5, 5, {
    ambush: ev => hqHeroes().limit(c => !isColor(Color.TECH)(c)).each(c => moveCardEv(ev, c, gameState.herodeck, true)),
    varDefense: empowerVarDefense(Color.TECH, 2),
  })],
// <b>Empowered</b> by [Strength]
// FIGHT: Each player reveals a [Strength] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5+
// VP: 4
  [ 1, makeVillainCard("Ultron's Legacy", "Brutish Ultron-14", 5, 4, {
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p)),
    escape: sameEffect,
    varDefense: empowerVarDefense(Color.STRENGTH),
  })],
// <b>Empowered</b> by [Covert]
// AMBUSH: Crimson Cowl captures a Bystander.
// ATTACK: 5+
// VP: 4
  [ 1, makeVillainCard("Ultron's Legacy", "Crimson Cowl", 5, 4, {
    ambush: ev => captureEv(ev, ev.source),
    varDefense: empowerVarDefense(Color.COVERT),
  })],
]},
{ name: "Queen's Vengeance", cards: [
// {USIZECHANGING RANGED 5}
// FIGHT: Reveal the top card of your deck. You may KO it.
// ATTACK: 5*
// VP: 2
  [ 1, makeVillainCard("Queen's Vengeance", "Daystar", 5, 2, {
    fight: ev => revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c))),
    uSizeChanging: { color: Color.RANGED, amount: 5 },
  })],
// <b>Chivalrous Duel</b>
// FIGHT: KO one of your Heroes.
// ATTACK: 3*
// VP: 3
  [ 1, makeVillainCard("Queen's Vengeance", "Blackbird", 3, 3, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    chivalrousDuel: true,
  })],
// {USIZECHANGING STRENGTH 5}
// FIGHT: KO one of your Heroes.
// ATTACK: 7*
// VP: 4
  [ 1, makeVillainCard("Queen's Vengeance", "Gigantus", 7, 4, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    uSizeChanging: { color: Color.STRENGTH, amount: 5 },
  })],
// <b>Chivalrous Duel</b>
// ESCAPE: Each player reveals a [Tech] Hero or gains a Wound.
// ATTACK: 4*
// VP: 4
  [ 1, makeVillainCard("Queen's Vengeance", "Iron Knight", 4, 4, {
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainWoundEv(ev, p), p)),
    chivalrousDuel: true,
  })],
// <b>Chivalrous Duel</b>
// FIGHT: You get +1 Recruit for each color of Hero you have (including grey).
// ATTACK: 5*
// VP: 5
  [ 1, makeVillainCard("Queen's Vengeance", "Yoeman America", 5, 5, {
    fight: ev => addRecruitEvent(ev, numColors()),
    chivalrousDuel: true,
  })],
// <b>Chivalrous Duel</b>
// FIGHT: KO a card from your discard pile.
// ATTACK: 3*
// VP: 3
  [ 1, makeVillainCard("Queen's Vengeance", "Star-Knight", 3, 3, {
    fight: ev => selectCardAndKOEv(ev, playerState.discard.deck),
    chivalrousDuel: true,
  })],
// {USIZECHANGING COVERT 4}
// FIGHT: Reveal a [Covert] Hero or play another card from the Villain Deck.
// ATTACK: 3*
// VP: 2
  [ 1, makeVillainCard("Queen's Vengeance", "Pixie", 3, 2, {
    fight: ev => revealOrEv(ev, Color.COVERT, () => villainDrawEv(ev)),
    uSizeChanging: { color: Color.COVERT, amount: 4 },
  })],
// FIGHT: Choose a card in your discard pile. The player to your right gains it.
// ESCAPE: Each player simultaneously does that same effect.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Queen's Vengeance", "Mordred the Evil", 5, 3, {
    fight: ev => selectCardEv(ev, "Choose a card", playerState.discard.deck, c => gainEv(ev, c, playerState.right)),
    escape: ev => {
      const cards = new Map<Player, Card>();
      eachPlayer(p => selectCardEv(ev, "Choose a card", p.discard.deck, c => cards.set(p.right, c)));
      cont(ev, () => cards.forEach((c, p) => gainEv(ev, c, p)));
    },
  })],
]},
]);
addVillainTemplates("Venom", [
{ name: "Life Foundation", cards: [
// AMBUSH: Reveal the top three cards of the Villain Deck. A Villain you revealed <b>Symbiote Bonds</b> with Agony. Put the rest back in any order.
// ESCAPE: Each player reveals a [Covert]  Hero or gains a Wound.
// ATTACK: 3
// VP: 3
  [ 1, makeVillainCard("Life Foundation", "Agony", 3, 3, {
    ambush: ev => revealVillainDeckEv(ev, 3, cards => symbioteBondEv(ev, ev.source, cards), false, false),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.COVERT, () => gainWoundEv(ev, p), p)),
  })],
// FIGHT: Each [Instinct] and [Tech] Hero currently in the HQ costs 1 less this turn.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Life Foundation", "Dr. Carlton Drake", 5, 3, {
    fight: ev => {
      const cards = hqHeroes().limit(Color.INSTINCT | Color.TECH);
      addTurnMod('cost', c => cards.includes(c), -1);
    },
  })],
// AMBUSH: A Henchman Villain from your Victory Pile <b>Symbiote Bonds</b> with Lasher.
// ATTACK: 2
// VP: 2
  [ 2, makeVillainCard("Life Foundation", "Lasher", 2, 2, {
    ambush: ev => symbioteBondEv(ev, ev.source, playerState.victory.limit(isHenchman)),
  })],
// AMBUSH: A Villain from the Escape Pile or your Victory Pile <b>Symbiote Bonds</b> with Phage.
// ATTACK: 3
// VP: 3
  [ 1, makeVillainCard("Life Foundation", "Phage", 3, 3, {
    ambush: ev => symbioteBondEv(ev, ev.source, [...gameState.escaped.deck, ...playerState.victory.deck].limit(isVillain)),
  })],
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Villain, it <b>Symbiote Bonds</b> with Riot.
// FIGHT: KO one of your Heroes.
// ATTACK: 2
// VP: 2
  [ 2, makeVillainCard("Life Foundation", "Riot", 2, 2, {
    ambush: ev => revealVillainDeckEv(ev, 1, cards => cards.limit(isVillain).each(c => symbioteBondEv(ev, ev.source, c))),
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  })],
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Henchman or Life Foundation Villain, it <b>Symbiote Bonds</b> with Scream.
// ATTACK: 4
// VP: 4
  [ 1, makeVillainCard("Life Foundation", "Scream", 4, 4, {
    ambush: ev => revealVillainDeckEv(ev, 1, cards => cards.limit(c => isHenchman(c) || isGroup("Life Foundation")(c)).each(c => symbioteBondEv(ev, ev.source, c))),
  })],
]},
{ name: "Poisons", cards: [
// FIGHT: This <b>Symbiote Bonds</b> with another Villain in the city. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 4
// GAINABLE
// CLASS: [Instinct]
// You get +1 Attack for each color of Hero you have. (including [Instinct] and grey)
// ATTACKG: 0+
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Captain America", 4, u, {
    fight: ev => poisonBondEv(ev, cityVillains()),
  }), u, 0, Color.INSTINCT, u, "", ev => addAttackEvent(ev, numColors()))],
// FIGHT: This <b>Symbiote Bonds</b> with a Villain in the Bank. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 3
// GAINABLE
// CLASS: [Tech]
// Draw a card.
// ATTACKG: 1
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Dr. Octopus", 3, u, {
    fight: ev => poisonBondEv(ev, cityVillains().limit(c => isLocation(c.location, 'BANK'))),
  }), u, 1, Color.TECH, u, "", ev => drawEv(ev))],
// FIGHT: This <b>Symbiote Bonds</b> with a Henchman Villain in the city. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 5
// GAINABLE
// CLASS: [Strength]
// {POWER Strength} You get +2 Attack.
// ATTACKG: 2+
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Hulk", 5, u, {
    fight: ev => poisonBondEv(ev, cityVillains().limit(isHenchman)),
  }), u, 2, Color.STRENGTH, u, "D", ev => superPower(Color.STRENGTH) && addAttackEvent(ev, 2))],
// FIGHT: This <b>Symbiote Bonds</b> with a Villain in the Streets. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 4
// GAINABLE
// CLASS: [Instinct]
// {POWER Instinct} Look at the top card of your deck. You may KO it.
// ATTACKG: 2
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Sabretooth", 4, u, {
    fight: ev => poisonBondEv(ev, cityVillains().limit(c => isLocation(c.location, 'STREETS'))),
  }), u, 2, Color.INSTINCT, u, "D", ev => superPower(Color.INSTINCT) && lookAtDeckEv(ev, 1, () => selectCardOptEv(ev, "Choose a card to KO", playerState.revealed.deck, c => KOEv(ev, c))))],
// FIGHT: This <b>Symbiote Bonds</b> with another Villain in the city with an odd-numbered Attack. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 3
// GAINABLE
// CLASS: [Covert]
// Reveal the top card of your deck. If it has an odd-numbered cost, draw it. (0 is even.)
// ATTACKG: 2
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Scarlet Witch", 3, u, {
    fight: ev => poisonBondEv(ev, cityVillains().limit(c => c.defense % 2 === 1)),
  }), u, 2, Color.COVERT, u, "D", ev => drawIfEv(ev, isCostOdd))],
// FIGHT: This <b>Symbiote Bonds</b> with another Villain in the city. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 2
// GAINABLE
// CLASS: [Covert]
// Reveal the top card of your deck. If it costs 2 or less, draw it.
// ATTACK: 2
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Spider-Man", 2, u, {
    fight: ev => poisonBondEv(ev, cityVillains()),
  }), u, 2, Color.COVERT, u, "D", ev => drawIfEv(ev, c => c.cost <= 2))],
// FIGHT: This <b>Symbiote Bonds</b> with a Villain on the Rooftops or Bridge. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 3
// GAINABLE
// CLASS: [Ranged]
// {POWER Ranged} You get +2 Attack usable only against the Mastermind.
// ATTACK: 2+
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Storm", 3, u, {
    fight: ev => poisonBondEv(ev, cityVillains().limit(c => isLocation(c.location, 'ROOFTOPS', 'BRIDGE'))),
  }), u, 2, Color.RANGED, u, "D", ev => superPower(Color.RANGED) && addAttackSpecialEv(ev, isMastermind, 2))],
// AMBUSH: This Symbiote Bonds with the Mastermind. When you fight the Mastermind, defeat Symbiotic Armor and KO one of your Heroes instead of taking a Tactic.
// ATTACK: 1
// VP: 6
  [ 1, makeVillainCard("Poisons", "Symbiotic Armor", 1, 6, {
    ambush: ev => withMastermind(ev, m => symbioteBondEv(ev, m, ev.source, ev => selectCardAndKOEv(ev, yourHeroes()))),
  })],
]},
]);
