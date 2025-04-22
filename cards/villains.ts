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
    fight: ev => eachPlayer(p => revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards, sel => KOEv(ev, sel)), p, playerState)),
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
    fight: ev => eachOtherPlayerVM(p => revealPlayerDeckEv(ev, 3, cards => cards.limit(c => c.cost >= 1).each(c => discardEv(ev, c)), p)),
    escape: ev => eachPlayer(p => revealPlayerDeckEv(ev, 3, cards => cards.limit(c => c.cost >= 1).each(c => discardEv(ev, c)), p)),
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
    // fightCost: // TODO multiplayer reveal
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
    cardActions: [ cosmicThreatAction ],
    cosmicThreat: Color.RANGED,
  })],
// Cosmic Threat: [Instinct]
// AMBUSH: Put each non-[Instinct] Hero from the HQ on the bottom of the Hero Deck.
// ATTACK: 12*
// VP: 6
  [ 2, makeVillainCard("Heralds of Galactus", "Morg", 12, 6, {
    ambush: ev => hqHeroes().limit(c => !isColor(Color.INSTINCT)(c)).each(c => moveCardEv(ev, c, gameState.herodeck, true)),
    cardActions: [ cosmicThreatAction ],
    cosmicThreat: Color.INSTINCT,
  })],
// Cosmic Threat: [Covert]
// FIGHT: Choose one of your [Covert] Heroes. When you draw a new hand of cards at the end of this turn, add that Hero to your hand as a seventh card.
// ATTACK: 10*
// VP: 5
  [ 2, makeVillainCard("Heralds of Galactus", "Stardust", 10, 5, {
    fight: ev => selectCardEv(ev, "Choose a Covert hero", yourHeroes().limit(Color.COVERT), sel => addTurnTrigger("CLEANUP", undefined, ev => moveCardEv(ev, sel, playerState.hand))),
    cardActions: [ cosmicThreatAction ],
    cosmicThreat: Color.COVERT,
  })],
// Cosmic Threat: [Strength]
// AMBUSH: For each [Strength] Hero in the HQ, Terrax captures a Bystander.
// ATTACK: 11*
// VP: 5
  [ 2, makeVillainCard("Heralds of Galactus", "Terrax the Tamer", 11, 5, {
    ambush: ev => captureEv(ev, ev.source, hqHeroes().count(Color.STRENGTH)),
    cardActions: [ cosmicThreatAction ],
    cosmicThreat: Color.STRENGTH,
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
    fight: ev => heroBelow(ev.where).withFirst(c => playCardEffects(ev, c)),
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
    fightCond: elusive(4),
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
    fight: ev => eachPlayer(p => revealPlayerDeckEv(ev, 3, cards => chooseMayEv(ev, "Discard revealed", () => cards.each(c => discardEv(ev, c))), p)),
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
    fight: ev => revealPlayerDeckEv(ev, 1, cards => cards.limit(c => !c.cost).each(c => KOEv(ev, c))),
    escape: ev => eachPlayer(p => revealPlayerDeckEv(ev, 1, cards => cards.limit(c => c.cost >= 1).each(c => KOEv(ev, c)), p)),
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
    fight: ev => eachPlayer(p => revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Discard revealed", cards, c => discardEv(ev, c)), p)),
  })],
// ATTACK: 5
// VP: 3
// FIGHT: Reveal the top card of your deck. If it has a Recruit icon, KO it.
// ESCAPE: Each player reveals the top card of their deck, and if it has an Attack icon, KO it.
  [ 2, makeVillainCard("Spider Friends", "Firestar", 5, 3, {
    fight: ev => revealPlayerDeckEv(ev, 1, cards => cards.limit(hasRecruitIcon).each(c => KOEv(ev, c))),
    escape: ev => eachPlayer(p => revealPlayerDeckEv(ev, 1, cards => cards.limit(hasAttackIcon).each(c => KOEv(ev, c)), p)),
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
    fight: ev => { // copied from Rogue Hero card
      let revealed: Card[] = [];
      eachPlayer(p => revealPlayerDeckEv(ev, 1, cards => cards.each(c => { isHero(c) && revealed.push(c); discardEv(ev, c); }), p));
      cont(ev, () => selectCardOrderEv(ev, "Choose a card to copy", revealed, c => playCopyEv(ev, c)));
    },
    varDefense: xTremeAttack,
    xTremeAttack: true,
  })],
// ATTACK: 5
// VP: 3
// FIGHT: Reveal the top three cards of your deck. Put any that have odd-numbered costs into your hand and discard the rest. (0 is even.)
  [ 2, makeVillainCard("Uncanny Avengers", "Scarlet Witch", 5, 3, {
    fight: ev => revealPlayerDeckEv(ev, 3, cards => cards.each(c => isCostOdd(c) ? moveCardEv(ev, c, playerState.hand) : discardEv(ev, c))),
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
    ambush: ev => attachShardEv(ev, ev.source, strikerCount(false)),
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
    match: (ev, source) => owner(source) === playerState && isControlledArtifact(source),
    before: ev => revealVillainDeckEv(ev, 1, cards => cards.limit(c => !isTwist(c)).each(c => chooseMayEv(ev, "Put on the bottom of the Villain Deck", () => { moveCardEv(ev, c, gameState.villaindeck, true); gainShardEv(ev); }))),
  } }) ],
// AMBUSH: Soul Gem gains a Shard for each Villain in the city.
// FIGHT: Put this into your discard pile as an Artifact.
// Artifact - Whenever you defeat a Villain, put a Shard on Soul Gem from the supply. Once per turn, you get + Attack equal to the number of Shards on Soul Gem.
// ATTACK: 6
// VP: 0
  [ 1, makeGainableCard(makeVillainCard("Infinity Gems", "Soul Gem", 6, u, {
    ambush: ev => attachShardEv(ev, ev.source, cityVillains().size),
  }), u, u, 0, u, "", ev => addAttackEvent(ev, ev.source.attached('SHARD').size), { isArtifact: true, cardActions: [ useArtifactAction() ], triggers: [{
    event: "MOVECARD",
    match: (ev, source) => ev.what === source && isControlledArtifact(source),
    before: ev => ev.parent.what.attached('SHARD').each(c => moveCardEv(ev, c, gameState.shard)),
  }, {
    event: "DEFEAT",
    match: (ev, source) => owner(source) === playerState && isControlledArtifact(source) && isVillain(ev.what),
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
    ambush: riseOfTheLivingDead,
    fight: ev => rescueEv(ev, yourHeroes().count("Avengers")),
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// ESCAPE: Loki ascends to become a new Mastermind. He gains the ability, <b>"Master Strike</b>: Each player reveals a [Strength]  Hero or gains a Wound."
// ATTACK: 8
// VP: 6
  [ 1, makeVillainCard("The Deadlands", "Zombie Loki", 8, 6, {
    ambush: riseOfTheLivingDead,
    escape: ascendToMastermind,
    strike: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p)),
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// FIGHT: KO one of your S.H.I.E.L.D. Heroes or HYDRA Allies.
// ATTACK: 4
// VP: 2
  [ 1, makeVillainCard("The Deadlands", "Zombie Madame Hydra", 4, 2, {
    ambush: riseOfTheLivingDead,
    fight: ev => selectCardAndKOEv(ev, yourHeroes().limit(isShieldOrHydra))
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// ESCAPE: Sinister ascends to become a new Mastermind. He gains the ability, "<b>Master Strike</b>: Sinister captures a Bystander. Then, each player with exactly 6 cards reveals a [Covert] Hero or discards cards equal to the number of Bystanders Sinister has."
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("The Deadlands", "Zombie Mr. Sinister", 7, 5, {
    ambush: riseOfTheLivingDead,
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
    ambush: riseOfTheLivingDead,
    fight: ev => selectCardAndKOEv(ev, yourHeroes().limit(hasRecruitIcon)),
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// ESCAPE: Shuffle this card into the Mastermind's face-down Tactics. It becomes a Mastermind Tactic that says "<b>Fight</b>: Draw two cards."
// ATTACK: 6
// VP: 6
  [ 1, makeVillainCard("The Deadlands", "Zombie Mysterio", 6, 6, {
    ambush: riseOfTheLivingDead,
    fight: ev => isMastermind(ev.parent.what) && drawEv(ev, 2),
    escape: ev => withMastermind(ev, m => shuffleIntoEv(ev, ev.source, m.attachedDeck('TACTICS')), true),
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// ESCAPE: Thanos ascends to become a new Mastermind. He gains the ability, "<b>Master Strike</b>: Each player reveals their hand and KOs one of their non-grey Heroes."
// ATTACK: 9
// VP: 6
  [ 1, makeVillainCard("The Deadlands", "Zombie Thanos", 9, 6, {
    ambush: riseOfTheLivingDead,
    escape: ascendToMastermind,
    strike: ev => eachPlayer(p => selectCardAndKOEv(ev, p.hand.limit(isNonGrayHero)))
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// You can't defeat Zombie Venom unless you have a [Covert] Hero.
// ESCAPE: Each player gains a Wound.
// ATTACK: 5*
// VP: 3
  [ 1, makeVillainCard("The Deadlands", "Zombie Venom", 5, 3, {
    ambush: riseOfTheLivingDead,
    fightCond: () => yourHeroes().has(Color.COVERT),
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
  })],
]},
{ name: "Domain of Apocalypse", cards: [
// FIGHT: Reveal the top card of your deck. Draw it or {TELEPORT} it.
// ATTACK: 5
// VP: 3
  [ 3, makeVillainCard("Domain of Apocalypse", "Apocalyptic Blink", 5, 3, {
    fight: ev => revealPlayerDeckEv(ev, 1, cards => cards.each(c => chooseOneEv(ev, "Choose one", ["Draw", () => drawCardEv(ev, c)], ["Teleport", () => teleportEv(ev, c)]))),
  })],
// FIGHT: Gain an X-Men Hero from the HQ for free.
// ESCAPE: Magneto ascends to become a new Mastermind. He gains the ability, "<b>Master Strike</b>: Each player reveals an X-Men Hero or discards down to four cards."
// ATTACK: 8
// VP: 6
  [ 1, makeVillainCard("Domain of Apocalypse", "Apocalyptic Magneto", 8, 6, {
    fight: ev => selectCardEv(ev, "Recruit a Hero for free", hqHeroes().limit("X-Men"), c => gainEv(ev, c)),
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
    escape: ev => withMastermind(ev, () => {}),
    trigger: {
      event: 'ESCAPE',
      match: (ev, source) => ev.what === source,
      before: ev => ev.state.captured = ev.parent.what.captured.limit(isBystander),
      after:  ev => {
        const cards = <Card[]>ev.state.captured;
        cards.size && withMastermind(ev, m => cards.each(c => captureEv(ev, m, c)));
      }
    }
  })],
// FIGHT: Reveal the top card of your deck. KO it or {TELEPORT} it.
// ESCAPE: Each player <b>Teleports</b> a random card from their hand.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Limbo", "Inferno Darkchilde", 5, 3, {
    fight: ev => revealPlayerDeckEv(ev, 1, cards => cards.each(c => chooseOneEv(ev, "Choose one", ["KO", () => KOEv(ev, c)], ["Teleport", () => teleportEv(ev, c)]))),
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
  [ 2, makeGainableCard(makeVillainCard("Manhattan (Earth-1610)", "Ultimate Captain America", 6, u, {}), u, 0, Color.STRENGTH, "Avengers", "", ev => addAttackEvent(ev, numColors()))],
// FIGHT: Gain this as a Hero.
// ATTACK: 4
// GAINABLE
// CLASS: [Ranged]
// {TELEPORT}
// RECRUIT: 2
  [ 2, makeGainableCard(makeVillainCard("Manhattan (Earth-1610)", "Ultimate Captain Marvel", 4, u, {}), 2, u, Color.RANGED, "Avengers", "D", [], { teleport: true })],
// FIGHT: Gain this as a Hero.
// ESCAPE: {XDRAMPAGE Thor}
// ATTACK: 7
// GAINABLE
// CLASS: [Ranged]
// {POWER Ranged} You get +3 Attack.
// ATTACKG: 3+
  [ 2, makeGainableCard(makeVillainCard("Manhattan (Earth-1610)", "Ultimate Thor", 7, u, {
    escape: ev => xdRampageEv(ev, 'Thor'),
  }), u, 3, Color.RANGED, "Avengers", "", ev => superPower(Color.RANGED) && addAttackEvent(ev, 3))],
// FIGHT: Gain this as a Hero.
// ATTACK: 5
// GAINABLE
// CLASS: [Covert]
// {POWER Covert} You get +2 Attack.
// ATTACKG: 2+
  [ 2, makeGainableCard(makeVillainCard("Manhattan (Earth-1610)", "Ultimate Wasp", 5, u, {}), u, 2, Color.COVERT, "Avengers", "D", ev => superPower(Color.COVERT) && addAttackEvent(ev, 2))],
]},
{ name: "Sentinel Territories", cards: [
// FIGHT: <i>Colossus changes the future:</i> Don't play a Villain card at the beginning of next turn.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Sentinel Territories", "Colossus of Future Past", 5, 3, {
    fight: ev => addFutureTrigger(ev => turnState.villainCardsToPlay > 0 && turnState.villainCardsToPlay--),
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
      addTurnSet('fight', c => c === ev.source, () => [] as Handler[]);
    }),
  })],
// FIGHT: <i>(After this goes to your Victory Pile.)</i> {PATROL Bank}: If it's empty, draw a card. If it's not empty, KO one of your Heroes.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Guardians of Knowhere", "Rocket Raccoon", 4, 2, {
    fight: ev => patrolCity('BANK', () => drawEv(ev), () => selectCardAndKOEv(ev, yourHeroes())),
  })],
]},
{ name: "K'un-Lun", cards: [
// {NTHCIRCLE 5}
// ESCAPE: Each player reveals a Hero that costs 5 or more, or they discard a card.
// ATTACK: 5+
// VP: 5
  [ 2, makeVillainCard("K'un-Lun", "Laughing Skull", 5, 5, {
    ...nthCircleParams(5),
    escape: ev => eachPlayer(p => revealOrEv(ev, c => c.cost >= 6, () => pickDiscardEv(ev, 1, p), p)),
  })],
// {NTHCIRCLE 6}
// ESCAPE: Each player reveals a Hero that costs 6 or more, or they gain a wound.
// ATTACK: 6+
// VP: 6
  [ 2, makeVillainCard("K'un-Lun", "Rand K'ai", 6, 6, {
    ...nthCircleParams(6),
    escape: ev => eachPlayer(p => revealOrEv(ev, c => c.cost >= 6, () => gainWoundEv(ev, p), p)),
  })],
// {NTHCIRCLE 3}
// FIGHT: For each of your Heroes that costs 3, KO one of your Heroes.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("K'un-Lun", "Razor Fist", 3, 3, {
    ...nthCircleParams(3),
    fight: ev => repeat(yourHeroes().count(c => c.cost === 3), () => selectCardAndKOEv(ev, yourHeroes())),
  })],
// {NTHCIRCLE 4}
// FIGHT: Draw a card for each of your Heroes that costs 4.
// ATTACK: 4+
// VP: 4
  [ 2, makeVillainCard("K'un-Lun", "Red Sai", 4, 4, {
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
  }), u, 2, Color.STRENGTH, "X-Men", "D", ev => superPower(Color.TECH) && drawEv(ev, 1))],
// FIGHT: Gain this as a Hero.
// ATTACKG: 4
// GAINABLE
// CLASS: [Ranged]
// <i>Spectrum:</i> You get +2 Attack.
// ATTACKG: 2+
  [ 3, makeGainableCard(makeVillainCard("X-Men '92", "'92 Jubilee", 4, u, {}), u, 2, Color.RANGED, "X-Men", "D", ev => spectrumPower() && addAttackEvent(ev, 2)) ],
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
  }), u, 2, Color.INSTINCT, "X-Men", "D", ev => superPower(Color.INSTINCT) && drawEv(ev, 2))],
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
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
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
    // TODO forify also prevent recruit
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
    escape: ev => fortifyEv(ev, ev.source, gameState.mastermind), // TODO fortify prevent fight
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
    fight: ev => eachPlayer(p => p.victory.has(isShieldOfficer) || gainWoundEv(ev, p)),
    escape: sameEffect,
    ...shieldClearance,
  })],
// S.H.I.E.L.D. Clearance
// ESCAPE: Fortify the S.H.I.E.L.D. Officer stack. While it's fortified, whenever any number of S.H.I.E.L.D. Officers become Villains, an extra one becomes a Villain.
// ATTACK: 6*
// VP: 5
  [ 2, makeVillainCard("S.H.I.E.L.D. Elite", "Sharon Carter, Agent 13", 6, 5, {
    escape: ev => fortifyEv(ev, ev.source, gameState.officer), // TODO fortify
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
    // TODO fortify
  })],
// ESCAPE: Fortify an HQ space. While its fortified, Heroes can't be gained from that space.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Superhuman Registration Act", "Ms. Marvel", 5, 3, {
    escape: ev => selectCardEv(ev, "Choose an HQ space", gameState.hq, d => fortifyEv(ev, ev.source, d)),
    // TODO fortify
  })],
// {SIZECHANGING STRENGTH}
// ESCAPE: Fortify the Villain Deck. When a Master Strike is completed from that deck, each player gains a Wound and She-Hulk enters the Sewers.
// ATTACK: 8*
// VP: 5
  [ 2, makeVillainCard("Superhuman Registration Act", "She-Hulk", 8, 5, {
    escape: ev => fortifyEv(ev, ev.source, gameState.villaindeck),
    // TODO fortify is Master Strike from Deck
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
    fight: ev => lookAtDeckEv(ev, 3, cards => selectCardAndKOEv(ev, cards)),
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
  }), u, 2, Color.INSTINCT, "X-Men", "D", ev => xGenePower(Color.INSTINCT) && (turnState.nextHeroRecruit = 'SOARING'))],
// FIGHT: Gain this as a Hero.
// ATTACK: 5
// GAINABLE
// CLASS: [Tech]
// {XGENE [Tech]} You may KO a card from your hand or discard pile.
// ATTACKG: 2
  [ 1, makeGainableCard(makeVillainCard("Shadow-X", "Dark Beast", 5, u, {
  }), u, 2, Color.TECH, "X-Men", "D", ev => xGenePower(Color.TECH) && KOHandOrDiscardEv(ev, undefined))],
// AMBUSH: Each player reveals a [Ranged] Hero or discards a card.
// FIGHT: Gain this as a Hero.
// ATTACK: 7
// GAINABLE
// CLASS: [Ranged]
// {XGENE [Ranged]} Return a [Ranged] Hero from your discard pile to your hand.
// ATTACKG: 3
  [ 1, makeGainableCard(makeVillainCard("Shadow-X", "Dark Cyclops", 7, u, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => pickDiscardEv(ev, 1, p))),
  }), u, 3, Color.RANGED, "X-Men", "", ev => xGenePower(Color.RANGED) && selectCardEv(ev, "Choose a Hero to put in your hand", playerState.discard.limit(isHero).limit(Color.RANGED), c => moveCardEv(ev, c, playerState.hand)))],
// FIGHT: Gain this as a Hero.
// ATTACK: 5
// GAINABLE
// CLASS: [Strength]
// {XGENE [Strength]} Draw a card.
// ATTACKG: 2
  [ 2, makeGainableCard(makeVillainCard("Shadow-X", "Dark Iceman", 5, u, {
  }), u, 2, Color.STRENGTH, "X-Men", "D", ev => xGenePower(Color.STRENGTH) && drawEv(ev, 1))],
// AMBUSH: Dark Marvel Girl Dominates each X-Men Hero that costs 4 or less from the HQ.
// FIGHT: Gain this as a Hero.
// ATTACK: 4+
// GAINABLE
// CLASS: [Covert]
// {XGENE [Covert]} Rescue a Bystander.
// ATTACKG: 2
  [ 1, makeGainableCard(makeVillainCard("Shadow-X", "Dark Marvel Girl", 4, u, {
    ambush: ev => hqHeroes().limit('X-Men').limit(c => c.cost <= 4).each(c => dominateEv(ev, ev.source, c)),
  }), u, 2, Color.COVERT, "X-Men", "D", ev => xGenePower(Color.COVERT) && rescueEv(ev))],
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
addVillainTemplates("Marvel Studios Phase 1", [
{ name: "Chitauri", cards: [
// {ROOFTOPS CONQUEROR 2}
// AMBUSH: Chitauri Soldier captures a Bystander.
// ATTACK: 3+
// VP: 2
  [ 2, makeVillainCard("Chitauri", "Chitauri Soldier", 3, 2, {
    ambush: ev => captureEv(ev, ev.source),
    ...conquerorAbility(2, 'ROOFTOPS'),
  })],
// {ROOFTOPS CONQUEROR 2}
// AMBUSH: (After this enters the city) If the rooftops are empty, reveal the top card of the villain deck.  If it's a villain, that villain enters the rooftops.
// ATTACK: 3+
// VP: 2
  [ 2, makeVillainCard("Chitauri", "Chitauri Commander", 3, 2, {
    ambush: ev => withCity('ROOFTOPS', rooftops => isCityEmpty(rooftops) && revealVillainDeckEv(ev, 1, cards => cards.limit(isVillain).each(c => {
      enterCityEv(ev, c);
    }))),
    ...conquerorAbility(2, 'ROOFTOPS'),
  })],
// {ROOFTOPS CONQUEROR 2}
// FIGHT: Each player with no Bystanders in their Victory Pile gains a wound.
// ESCAPE: Same effect.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("Chitauri", "Chitauri Leviathan", 5, 4, {
    fight: ev => eachPlayer(p => p.victory.has(isBystander) || gainWoundEv(ev, p)),
    escape: sameEffect,
    ...conquerorAbility(2, 'ROOFTOPS'),
  })],
// {ROOFTOPS CONQUEROR 2}
// AMBUSH: (After this enters the city) If the rooftops are empty, move this Villain there.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Chitauri", "Chitauri Chariot", 4, 3, {
    ambush: ev => withCity('ROOFTOPS', rooftops => isCityEmpty(rooftops) && moveCardEv(ev, ev.source, rooftops)),
    ...conquerorAbility(2, 'ROOFTOPS'),
  })],
]},
{ name: "Enemies of Asgard", cards: [
  [ 1, copyVillainTemplate("Enemies of Asgard", "Destroyer") ],
  [ 2, copyVillainTemplate("Enemies of Asgard", "Enchantress", "Enslaved Hawkeye") ],
  [ 3, copyVillainTemplate("Enemies of Asgard", "Frost Giant") ],
  [ 2, copyVillainTemplate("Enemies of Asgard", "Ymir, Frost Giant King", "Laufey, Frost Giant King")],
]},
{ name: "Gamma Hunters", cards: [
// AMBUSH: Each Player discards two cards, then draws a card.
// ESCAPE: Same Effect
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Gamma Hunters", "Sonic Cannon", 4, 2, {
    ambush: ev => eachPlayer(p => { pickDiscardEv(ev, 2, p); drawEv(ev); }),
    escape: sameEffect,
  })],
// AMBUSH: Each Player reveals their hand. Each player with any [Strength] cards must discard one of them or gain a wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Gamma Hunters", "Lt. Gen “Thunderbolt” Ross", 5, 3, {
    ambush: ev => eachPlayer(p => pickDiscardEv(ev, 1, p, Color.STRENGTH)),
    escape: sameEffect,
  })],
// {STREETS CONQUEROR 3}
// AMBUSH: (After this enters the city.) If the streets are empty, move another villain from any city space to the streets.
// ATTACK: 4+
// VP: 4
  [ 2, makeVillainCard("Gamma Hunters", "Abomination, Raging Monster", 4, 4, {
    ambush: ev => withCity('STREETS', streets => isCityEmpty(streets) && selectCardEv(ev, "Choose a Villain to move", cityVillains().limit(isNot(ev.source)), c => moveCardEv(ev, c, streets))),
    ...conquerorAbility(3, 'STREETS'),
  })],
// {STREETS CONQUEROR 2}
// FIGHT: KO one of your heroes.
// ATTACK: 3+
// VP: 2
  [ 2, makeVillainCard("Gamma Hunters", "Fighter Jet", 3, 2, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    ...conquerorAbility(2, 'STREETS'),
  })],
]},
{ name: "HYDRA", cards: [
  [ 3, copyVillainTemplate("HYDRA", "Endless Armies of HYDRA")],
  [ 3, copyVillainTemplate("HYDRA", "HYDRA Kidnappers", "HYDRA Motorcycle Squad")],
  [ 1, copyVillainTemplate("HYDRA", "Supreme HYDRA", "Arnim Zola")],
  [ 1, copyVillainTemplate("HYDRA", "Viper", "HYDRA Tank")],
]},
{ name: "Iron Foes", cards: [
// FIGHT: Look at the top three cards of your deck. KO one of them and put the rest back in any order.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Iron Foes", "Hammer Drone Marine", 4, 2, {
    fight: ev => revealPlayerDeckEv(ev, 3, cards => selectCardAndKOEv(ev, cards)),
  })],
// Raza gets +1 Attack for each Bystander he has.
// AMBUSH: Raza captures a Bystander from the Bystander stack and a random Bystander from each player’s Victory Pile.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Iron Foes", "Raza, Ten Rings Leader", 4, 3, {
    ambush: ev => {
      captureEv(ev, ev.source);
      eachPlayer(p => p.victory.limit(isBystander).withRandom(c => captureEv(ev, ev.source, c)));
    },
    varDefense: c => c.printedDefense + c.captured.count(isBystander),
  })],
// FIGHT: Each player reveals a [Tech] hero or gains a wound.
// ESCAPE:  Same effect.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Iron Foes", "Whiplash", 6, 4, {
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainWoundEv(ev, p))),
    escape: sameEffect,
  })],
// {BANK CONQUEROR 2}
// FIGHT: You get +2 Recruit usable only to recruit heroes in the HQ space under the bank.
// ATTACK: 3+
// VP: 2
  [ 2, makeVillainCard("Iron Foes", "Justin Hammer", 3, 2, {
    fight: ev => addRecruitSpecialEv(ev, c => isLocation(c.location.below, 'BANK'), 2),
    ...conquerorAbility(2, 'BANK'),
  })],
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
      addTurnSet('sizeChanging', v => v === c, () => Color.TECH);
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
    uSizeChanging: { color: Color.STRENGTH, amount: 6 },
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
  }), u, 0, Color.INSTINCT, "Venomverse", "", ev => addAttackEvent(ev, numColors()))],
// FIGHT: This <b>Symbiote Bonds</b> with a Villain in the Bank. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 3
// GAINABLE
// CLASS: [Tech]
// Draw a card.
// ATTACKG: 1
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Dr. Octopus", 3, u, {
    fight: ev => poisonBondEv(ev, cityVillains().limit(c => isLocation(c.location, 'BANK'))),
  }), u, 1, Color.TECH, "Venomverse", "", ev => drawEv(ev))],
// FIGHT: This <b>Symbiote Bonds</b> with a Henchman Villain in the city. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 5
// GAINABLE
// CLASS: [Strength]
// {POWER Strength} You get +2 Attack.
// ATTACKG: 2+
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Hulk", 5, u, {
    fight: ev => poisonBondEv(ev, cityVillains().limit(isHenchman)),
  }), u, 2, Color.STRENGTH, "Venomverse", "D", ev => superPower(Color.STRENGTH) && addAttackEvent(ev, 2))],
// FIGHT: This <b>Symbiote Bonds</b> with a Villain in the Streets. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 4
// GAINABLE
// CLASS: [Instinct]
// {POWER Instinct} Look at the top card of your deck. You may KO it.
// ATTACKG: 2
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Sabretooth", 4, u, {
    fight: ev => poisonBondEv(ev, cityVillains().limit(c => isLocation(c.location, 'STREETS'))),
  }), u, 2, Color.INSTINCT, "Venomverse", "D", ev => superPower(Color.INSTINCT) && lookAtDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c))))],
// FIGHT: This <b>Symbiote Bonds</b> with another Villain in the city with an odd-numbered Attack. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 3
// GAINABLE
// CLASS: [Covert]
// Reveal the top card of your deck. If it has an odd-numbered cost, draw it. (0 is even.)
// ATTACKG: 2
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Scarlet Witch", 3, u, {
    fight: ev => poisonBondEv(ev, cityVillains().limit(c => c.defense % 2 === 1)),
  }), u, 2, Color.COVERT, "Venomverse", "D", ev => drawIfEv(ev, isCostOdd))],
// FIGHT: This <b>Symbiote Bonds</b> with another Villain in the city. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 2
// GAINABLE
// CLASS: [Covert]
// Reveal the top card of your deck. If it costs 2 or less, draw it.
// ATTACK: 2
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Spider-Man", 2, u, {
    fight: ev => poisonBondEv(ev, cityVillains()),
  }), u, 2, Color.COVERT, "Venomverse", "D", ev => drawIfEv(ev, c => c.cost <= 2))],
// FIGHT: This <b>Symbiote Bonds</b> with a Villain on the Rooftops or Bridge. If already bonded or unable to bond, gain this as a Hero instead.
// ATTACK: 3
// GAINABLE
// CLASS: [Ranged]
// {POWER Ranged} You get +2 Attack usable only against the Mastermind.
// ATTACK: 2+
  [ 1, makeGainableCard(makeVillainCard("Poisons", "Poison Storm", 3, u, {
    fight: ev => poisonBondEv(ev, cityVillains().limit(c => isLocation(c.location, 'ROOFTOPS', 'BRIDGE'))),
  }), u, 2, Color.RANGED, "Venomverse", "D", ev => superPower(Color.RANGED) && addAttackSpecialEv(ev, isMastermind, 2))],
// AMBUSH: This Symbiote Bonds with the Mastermind. When you fight the Mastermind, defeat Symbiotic Armor and KO one of your Heroes instead of taking a Tactic.
// ATTACK: 1
// VP: 6
  [ 1, makeVillainCard("Poisons", "Symbiotic Armor", 1, 6, {
    ambush: ev => withMastermind(ev, m => symbioteBondEv(ev, m, ev.source, ev => selectCardAndKOEv(ev, yourHeroes()))),
  })],
]},
]);
addVillainTemplates("Revelations", [
{ name: "Army of Evil", cards: [
// AMBUSH: Each player reveals a [Ranged] Hero or discards a card.
// FIGHT: Draw two cards.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Army of Evil", "Blackout", 4, 2, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => pickDiscardEv(ev, 1, p))),
    fight: ev => drawEv(ev, 2),
  })],
// AMBUSH: All players reveal their hands. Unless all those revealed cards together include [Strength], [Instinct], [Covert], [Tech], and [Ranged] Heroes, each player gains a Wound.
// ESCAPE: Same Effect.
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Army of Evil", "Count Nefaria", 7, 5, {
    ambush: ev => [Color.STRENGTH, Color.INSTINCT, Color.COVERT, Color.RANGED, Color.TECH]
      .every(c => gameState.players.some(p => p.hand.has(c))) || eachPlayerEv(ev, () => gainWoundEv(ev)),
    escape: sameEffect,
  })],
// <b>Location</b>
// Whenever you fight a Villain here, each other player reveals a [Ranged] Hero or discards a card.
// FIGHT: Draw two cards.
// ATTACK: 7
// VP: 5
  [ 1, makeLocationCard("Army of Evil", "Dome of Darkforce", 7, 5, {
    fight: ev => drawEv(ev, 2),
    trigger: fightVillainAtLocationEachOtherPlayerTrigger(
      (ev, p) => revealOrEv(ev, Color.RANGED, () => pickDiscardEv(ev, 1, p), p)
    ),
  })],
// AMBUSH: Klaw captures a [Tech] or [Ranged] Hero that costs 5 or less from the HQ.
// FIGHT: Gain that Hero.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Army of Evil", "Klaw", 5, 3, {
    ambush: ev => selectCardEv(ev, "Choose a Hero", hqHeroes().limit(Color.TECH | Color.RANGED).limit(c => c.cost <= 5), c => attachCardEv(ev, c, ev.source, "GAIN_CAPTURE")),
    fight: ev => ev.source.attached("GAIN_CAPTURE").each(c => gainEv(ev, c)),
  })],
// While in the Bank or Streets, this card's name is "Dr. Calvin Zabo", and you must spend Recruit to fight him instead of Attack.
// FIGHT: KO one of your Heroes.
// ATTACK: 6*
// VP: 4
  [ 2, makeVillainCard("Army of Evil", "Mister Hyde", 6, 4, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varFightCost: (c, attack) => atLocation(c, "BANK", "STREETS") ? { recruit: attack } : { attack },
    // TODO var name?
  })],
]},
{ name: "Dark Avengers", cards: [
// {LAST STAND}
// FIGHT: KO one of your Heroes.
// ATTACK: 6+
// VP: 6
  [ 1, makeVillainCard("Dark Avengers", "Ares", 6, 6, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: lastStandVarDefense(),
  })],
// {LAST STAND}
// AMBUSH: If any other Dark Avengers are in the city, each player gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 3+
// VP: 3
  [ 1, makeVillainCard("Dark Avengers", "Captain Marvel (Noh-Varr)", 3, 3, {
    ambush: ev => CityCards().has(c => c.villainGroup === "Dark Avengers" && c !== ev.source) &&
      eachPlayer(p => cont(ev, () => gainWoundEv(ev, p))),
    escape: sameEffect,
    varDefense: lastStandVarDefense(),
  })],
// {LAST STAND}
// FIGHT: KO one of your Heroes. Then choose one:
// - Each other player Kos one of their Heroes.
// - Each other player gains a 0-cost Hero from the KO pile.
// ATTACK: 4+
// VP: 4
  [ 1, makeVillainCard("Dark Avengers", "Dark Hawkeye (Bullseye)", 4, 4, {
    fight: [
      ev => selectCardAndKOEv(ev, yourHeroes()),
      ev => chooseOneEv(ev, "Each other player",
        ["KOs one of their Heroes", () => eachOtherPlayerVM(p => selectCardAndKOEv(ev, yourHeroes(p), p))],
        ["gains a 0-cost Hero from the KO pile", () => eachOtherPlayerVM(p =>
          selectCardEv(ev, "Choose a Hero to gain", gameState.ko.limit(isHero).limit(c => c.cost === 0), c => gainEv(ev, c, p), p))]
      ),
    ],
    varDefense: lastStandVarDefense(),
  })],
// {LAST STAND}
// FIGHT: Each other player discards two cards then draws a card.
// ATTACK: 4+
// VP: 4
  [ 1, makeVillainCard("Dark Avengers", "Dark Ms. Marvel (Moonstone)", 4, 4, {
    fight: ev => eachOtherPlayerVM(p => cont(ev, () => {
      pickDiscardEv(ev, 2, p);
      cont(ev, () => drawEv(ev, 1, p));
    })),
    varDefense: lastStandVarDefense(),
  })],
// <b>Double Last Stand</b>
// FIGHT: Reveal the top two cards of your deck. KO one of them that costs 2 or less. Put the rest back in any order.
// ATTACK: 2+
// VP: 2
  [ 1, makeVillainCard("Dark Avengers", "Dark Spider-Man (Scorpion)", 2, 2, {
    fight: ev => revealPlayerDeckEv(ev, 2, cards => selectCardAndKOEv(ev, cards.limit(c => c.cost <= 2))),
    varDefense: lastStandVarDefense(2),
  })],
// {LAST STAND}
// AMBUSH: Each player reveals an [Instinct] Hero or gains a Wound.
// ESCAPE: Same effect, then shuffle Dark Wolverine back into the Villain Deck.
// ATTACK: 5+
// VP: 5
  [ 1, makeVillainCard("Dark Avengers", "Dark Wolverine (Daken)", 5, 5, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainWoundEv(ev, p), p)),
    escape: [
      ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainWoundEv(ev, p), p)),
      ev => shuffleIntoEv(ev, ev.source, gameState.villaindeck),
    ],
    varDefense: lastStandVarDefense(),
  })],
// While in the Bank or Streets, this card's name is "The Void", it gets +5 Attack, and it gets
// "<b>Fight</b>: KO up to two cards from your discard pile."
// ESCAPE: Each player gains a Wound.
// ATTACK: 7+
// VP: 5
  [ 1, makeVillainCard("Dark Avengers", "Sentry", 7, 5, {
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
    varDefense: c => c.printedDefense + (atLocation(c, "BANK", "STREETS") ? 5 : 0),
    fight: ev => atLocation(ev.source, "BANK", "STREETS") && selectObjectsUpToEv(ev, "Choose up to two cards to KO", 2, playerState.discard.deck, c => discardEv(ev, c)),
    // TODO var name and var fight?
  })],
// <b>Location</b>
// Villains here get {LAST STAND}. (Villains who already have it get the bonus again.)
// FIGHT: You gain the Hero in the HQ space under this.
// ATTACK: 8
// VP: 5
  [ 1, makeLocationCard("Dark Avengers", "Sentry's Watchtower", 8, 5, {
    fight: ev => selectCardEv(ev, "Choose a Hero to gain", hqHeroes().limit(c => c.location.below === ev.source.location.attachedTo), c => gainEv(ev, c)),
    modifiers: {
      defense: [{
        cond: isVillain,
        func: (c, v) => v + lastStandAmount()
      }]
    }
  })],
]},
{ name: "Hood's Gang", cards: [
// {DARK MEMORIES}
// AMBUSH: Each player that has any cards in their discard pile gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 3+
// VP: 2
  [ 2, makeVillainCard("Hood's Gang", "Cancer", 3, 2, {
    ambush: ev => eachPlayer(p => cont(ev, () => p.discard.deck.length && gainWoundEv(ev, p))),
    escape: sameEffect,
    varDefense: darkMemoriesVarDefense(),
  })],
// {DARK MEMORIES}
// FIGHT: Exchange a card you played this turn with a card in the HQ that has the same or lower cost. (The card you gained goes to your discard pile.)
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Hood's Gang", "Chemistro", 4, 3, {
    fight: ev => {
      const minCost = hqCards().highest(c => -c.cost);
      minCost.length && selectCardEv(ev, "Choose a card you played", playerState.playArea.deck.limit(c => c.cost >= minCost[0].cost), c1 => {
        selectCardEv(ev, "Choose a card to exchange", hqCards().limit(c => c.cost <= c1.cost), c2 => {
          swapCardsEv(ev, c1, c2);
          moveCardEv(ev, c2, playerState.discard);
        })
      });
    },
    varDefense: darkMemoriesVarDefense(),
  })],
// {DARK MEMORIES}
// AMBUSH: Guess Villain, Bystander, Strike, or Twist. Then reveal the top card of the Villain Deck. If you guessed wrong, play that card.
// FIGHT: KO one of your Heroes.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("Hood's Gang", "Madam Masque", 5, 4, {
    ambush: ev => {
      chooseOptionEv(ev, "Choose a card type", [
        { l: "Villain", v: isVillain },
        { l: "Bystander", v: isBystander },
        { l: "Strike", v: isStrike },
        { l: "Twist", v: isTwist },
      ], f => revealVillainDeckEv(ev, 1, cards => cards.limit(f).each(c => villainDrawEv(ev, c))));
    },
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: darkMemoriesVarDefense(),
  })],
// To fight The Brothers Grimm, you must also discard two identical cards.
// FIGHT: You may KO a card from your discard pile.
// ATTACK: 2*
// VP: 2
  [ 1, makeVillainCard("Hood's Gang", "The Brothers Grimm", 2, 2, {
    fight: ev => selectCardOptEv(ev, "Choose a card to KO", playerState.discard.deck, c => KOEv(ev, c)),
    fightCond: () => playerState.hand.has(c1 => playerState.hand.has(c2 => c1 !== c2 && c1.instance === c2.instance)),
    fightCost: ev => selectCardEv(ev, "Choose a card to discard", playerState.hand.limit(c1 => playerState.hand.has(c2 => c1 !== c2 && c1.instance === c2.instance)), c1 => {
      selectCardEv(ev, "Choose an identical card to discard", playerState.hand.limit(c => c.instance === c1.instance && c !== c1), c2 => {
        discardEv(ev, c1);
        discardEv(ev, c2);
      });
    }),
  })],
// <b>Location</b>
// Villains here get {DARK MEMORIES}. (Villains who already have it get the bonus again.)
// FIGHT: Take another turn after this one.
// ATTACK: 9
// VP: 5
  [ 1, makeLocationCard("Hood's Gang", "The Dark Dimension", 9, 5, {
    fight: ev => gameState.extraTurn = true,
    modifiers: {
      defense: [{
        cond: isVillain,
        func: (c, v) => v + darkMemoriesAmount()
      }]
    }
  })],
]},
{ name: "Lethal Legion", cards: [
// <b>Location</b>
// Whenever you fight a Villain here, each other player chooses a Bystander from their Victory Pile to be captured by Carnival of Wonders.
// ATTACK: 5
// VP: 3
  [ 1, makeLocationCard("Lethal Legion", "Carnival of Wonders", 5, 3, {
    trigger: fightVillainAtLocationEachOtherPlayerTrigger(
      (ev, p) => selectCardEv(ev, "Choose a Bystander for Carnival of Wonders", p.victory.limit(isBystander), c => {
        captureEv(ev, ev.source, c);
      }, p)
    )
  })],
// <b>Location</b>
// Whenever you fight a Villain here, each other player reveals a [Ranged] Hero or gains a Wound.
// ATTACK: 7
// VP: 5
  [ 1, makeLocationCard("Lethal Legion", "Laser Maze", 7, 5, {
    trigger: fightVillainAtLocationEachOtherPlayerTrigger(
      (ev, p) => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p),
    ),
  })],
// Living Laser gets +3 Attack while there's a "Maze" Location in the city.
// FIGHT: Each player reveals a [Ranged] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 6+
// VP: 5
  [ 1, makeVillainCard("Lethal Legion", "Living Laser", 6, 5, {
    fight: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p)),
    escape: sameEffect,
    varDefense: lethalLegionVarDefense("Maze")
  })],
// M'Baku gets +3 Attack while there's a "Cult" Location in the city.
// FIGHT: Each player reveals their hand and discards a [Tech] card.
// ESCAPE: Same effect.
// ATTACK: 5+
// VP: 4
  [ 1, makeVillainCard("Lethal Legion", "M'Baku", 5, 4, {
    fight: ev => eachPlayer(p => pickDiscardEv(ev, 1, p, Color.TECH)),
    escape: sameEffect,
    varDefense: lethalLegionVarDefense("Cult")
  })],
// Power Man gets +3 Attack while there's a "Prison" Location in the city.
// ESCAPE: Each player puts a Villain from their Victory Pile into the Escape Pile or gains a Wound.
// ATTACK: 5+
// VP: 4
  [ 1, makeVillainCard("Lethal Legion", "Power Man (Erik Josten)", 5, 4, {
    escape: ev => eachPlayer(p => selectCardOrEv(ev, "Choose a Villain", p.victory.limit(isVillain),
      c => moveCardEv(ev, c, gameState.escaped),
      () => gainWoundEv(ev, p),
      p),
    ),
    varDefense: lethalLegionVarDefense("Prison")
  })],
// Swordsman gets +3 Attack while there's a "Carnival" Location in the city.
// AMBUSH: Swordsman and each Location in the city each capture a Bystander.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Lethal Legion", "Swordsman", 4, 3, {
    ambush: ev => {
      captureEv(ev, ev.source);
      cityAllLocations().each(c => captureEv(ev, c));
    },
    varDefense: lethalLegionVarDefense("Carnival")
  })],
// <b>Location</b>
// Whenever you fight a Villain here, each other player puts a Villain from their Victory Pile into the Escape Pile or gains a Wound
// ATTACK: 6
// VP: 4
  [ 1, makeLocationCard("Lethal Legion", "\"The Raft\" Prison", 6, 4, {
    trigger: fightVillainAtLocationEachOtherPlayerTrigger(
      (ev, p) => selectCardOrEv(ev, "Choose a Villain", p.victory.limit(isVillain),
        c => moveCardEv(ev, c, gameState.escaped),
        () => gainWoundEv(ev, p),
        p),
    ),
  })],
// <b>Location</b>
// Whenever you fight a Villain here, each other player reveals their hand and discards a [Tech] card.
// ATTACK: 6
// VP: 4
  [ 1, makeLocationCard("Lethal Legion", "White Gorilla Cult", 6, 4, {
    trigger: fightVillainAtLocationEachOtherPlayerTrigger((ev, p) => pickDiscardEv(ev, 1, p, Color.TECH)),
  })],
]},
]);
addVillainTemplates("S.H.I.E.L.D.", [
{ name: "Hydra Elite", cards: [
// AMBUSH: Put a card from the S.H.I.E.L.D. Officer Stack into the Escape Pile. Then each player gains a Wound unless that player reveals at least as many S.H.I.E.L.D. Heroes as the <b>Hydra Level.</b>
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Hydra Elite", "Crossbones", 4, 2, {
    ambush: ev => {
      gameState.officer.withTop(c => moveCardEv(ev, c, gameState.escaped));
      cont(ev, () => eachPlayer(p => p.hand.limit(isHero).count('S.H.I.E.L.D.') >= hydraLevel())); // TODO mutli reveal
    },
  })],
// AMBUSH: Put a card from the S.H.I.E.L.D. Officer Stack into the Escape Pile. Then check the <b>Hydra Level.</b> You can't play Heroes of that cost this turn.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Hydra Elite", "Gorgon", 6, 4, {
    ambush: ev => {
      gameState.officer.withTop(c => moveCardEv(ev, c, gameState.escaped));
      cont(ev, () => {
        const cost = hydraLevel();
        forbidAction("PLAY", c => c.cost === cost);
      })
    },
  })],
// Growing man gets + Attack equal to the Mastermind's <b>Hydra Level.</b>
// AMBUSH: Put a card from the S.H.I.E.L.D. Officer Stack into the Escape Pile.
// ATTACK: 0+
// VP: 3
  [ 2, makeVillainCard("Hydra Elite", "Growing Man", 0, 3, {
    ambush: ev => {
      gameState.officer.withTop(c => moveCardEv(ev, c, gameState.escaped));
    },
    varDefense: c => c.printedDefense + hydraLevel(),
  })],
// AMBUSH: Put a card from the S.H.I.E.L.D. Officer Stack into the Escape Pile. Then each player reveals their hand and discards a card with cost equal to the <b>Hydra Level.</b>
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Hydra Elite", "Hive", 5, 3, {
    ambush: ev => {
      gameState.officer.withTop(c => moveCardEv(ev, c, gameState.escaped));
      cont(ev, () => eachPlayer(p => pickDiscardEv(ev, 1, p, c => c.cost === hydraLevel())));
    },
  })],
]},
{ name: "A.I.M., Hydra Offshoot", cards: [
// AMBUSH: Put a card from the S.H.I.E.L.D. Officer Stack into the Escape Pile. Then, for each 2 <b>Hydra Levels</b>, Heroes currently in the HQ cost 1 more recruit this turn.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("A.I.M., Hydra Offshoot", "Graviton", 6, 4, {
    ambush: ev => {
      gameState.officer.withTop(c => moveCardEv(ev, c, gameState.escaped));
      cont(ev, () => {
        const heroes = hqHeroes();
        const amount = Math.floor(hydraLevel()/2);
        addTurnMod('cost', c => heroes.includes(c), amount);
      });
    },
  })],
// Mentallo gets +1 Attack for each Officer he has.
// AMBUSH: Put a card from the S.H.I.E.L.D. Officer Stack into the Escape Pile. Then Mentallo captures a S.H.I.E.L.D. Officer for each 2 <b>Hydra Level.</b>
// FIGHT: Gain an Officer captured by Mentallo or send it <b>Undercover.</b> KO the rest.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("A.I.M., Hydra Offshoot", "Mentallo", 3, 3, {
    ambush: ev => {
      gameState.officer.withTop(c => moveCardEv(ev, c, gameState.escaped));
      cont(ev, () => {
        const amount = Math.floor(hydraLevel()/2);
        repeat(amount, () => cont(ev, () => gameState.officer.withTop(c => captureEv(ev, ev.source, c))));
      })
    },
    fight: ev => {
      selectCardEv(ev, "Choose an Officer", ev.source.captured.limit(isShieldOfficer), c => {
        chooseOneEv(ev, "Choose one", ["Gain", () => gainEv(ev, c)], ["Send Undercover", () => sendUndercoverEv(ev, c)]);
      });
      cont(ev, () => ev.source.captured.limit(isShieldOfficer).each(c => KOEv(ev, c)));
    },
    varDefense: c => c.printedDefense + c.captured.count(isShieldOfficer),
  })],
// AMBUSH: Put a card from the S.H.I.E.L.D. Officer Stack into the Escape Pile. Then each player reveals a random card from their hand. If the <b>Hydra Level</b> is higher than that card's cost, that player discards that card.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("A.I.M., Hydra Offshoot", "Superia", 5, 3, {
    ambush: ev => {
      gameState.officer.withTop(c => moveCardEv(ev, c, gameState.escaped));
      cont(ev, () => {
        const amount = Math.floor(hydraLevel()/2);
        eachPlayer(p => p.hand.withRandom(c => amount > c.cost && discardEv(ev, c))); // TODO multiplayer reveal
      })
    },
  })],
// AMBUSH: Put a card from the S.H.I.E.L.D. Officer Stack into the Escape Pile.
// FIGHT: Each player must reveal as many Hero colors (including grey) as the <b>Hydra Level</b> or gain a Wound.
// ESCAPE: Same effect.
// ATTACK: 3 (erratum, see FAQ, 3+ as printed)
// VP: 2 (erratum, see FAQ, 4 as printed)
  [ 2, makeVillainCard("A.I.M., Hydra Offshoot", "Taskmaster", 3, 2, {
    ambush: ev => {
      gameState.officer.withTop(c => moveCardEv(ev, c, gameState.escaped));
    },
    fight: ev => {
      eachPlayer(p => numColors(p.hand.deck) >= hydraLevel() || gainWoundEv(ev, p)); // TODO multiplayer reveal
    },
    escape: sameEffect,
  })],
]},
]);
addVillainTemplates("Heroes of Asgard", [
{ name: "Dark Council", cards: [
// Ulik gets +2 if you are not {WORTHY}.
// FIGHT: KO one of your Heroes.
// ATTACK: 3+
// VP: 2
  [ 2, makeVillainCard("Dark Council", "Ulik, the Troll", 3, 2, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: c => c.printedDefense + (worthyPower() ? 0 : 2),
  })],
// FIGHT: If you are {WORTHY}, you get +2 Recruit.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Dark Council", "Sindr, Fire Giant Queen", 5, 3, {
    fight: ev => worthyPower() && addRecruitEvent(ev, 2),
  })],
// The Mangog gets +1 Attack for each Villain in the Victory Pile of the player on your right.
// ESCAPE: Each player who is not {WORTHY} gains a Wound.
// ATTACK: 3+
// VP: 4
// FLAVOR: It is the coalesced hatred of a billion beings slain by Thor's father Odin.
  [ 1, makeVillainCard("Dark Council", "The Mangog", 3, 4, {
    escape: ev => eachPlayer(p => worthyPower(p) && gainWoundEv(ev, p)),
    varDefense: c => c.printedDefense + playerState.right.victory.count(isVillain),
  })],
// AMBUSH: Laufey captures The Casket of Eternal Winters from any Villain, Mastermind, player's control, or discard pile.
// ESCAPE: If Laufey holds The Casket of Ancient Winters, say "Fimbulwinter has come," and each player discards down to 3 cards.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("Dark Council", "Laufey, Father of Loki", 6, 4, {
    ambush: ev => {
      [
        ...villains().map(c => c.attached('WEAPON')),
        ...gameState.mastermind.deck.map(c => c.attached('WEAPON')),
        ...gameState.players.map(p => p.artifact.deck),
        ...gameState.players.map(p => p.discard.deck)
      ].merge().limit(c => c.cardName === "The Casket of Ancient Winters").each(c => {
        attachCardEv(ev, c, ev.source, 'WEAPON');
      });
    },
    escape: ev => {
      ev.source.attached('WEAPON').has(c => c.cardName === "The Casket of Ancient Winters") &&
        eachPlayer(p => pickDiscardEv(ev, -3, p));
    },
  })],
// {VILLAINOUS WEAPON}
// GAINABLE
// {ARTIFACT} Once per turn, if you are {WORTHY}, you get +2 Recruit.
// ATTACK: +4
  [ 1, makeGainableCard(makeVillainousWeaponCard("Dark Council", "The Casket of Ancient Winters", 4, {
  }), u, u, 0, u, "D", ev => worthyPower() && addRecruitEvent(ev, 2), { isArtifact: true, cardActions: [ useArtifactAction() ] })],
// {VILLAINOUS WEAPON}
// GAINABLE
// {THROWN ARTIFACT} When you throw this, you get +3 Attack.
// ATTACK: +3
// FLAVOR: Malekith eventually seized Jarnbjorn and cut off Thor's left arm.
  [ 1, makeGainableCard(makeVillainousWeaponCard("Dark Council", "Jarnbjorn, First Axe of Thor", 3, {
  }), u, u, 0, u, "F", ev => addAttackEvent(ev, 3), { ...thrownArtifact })],
]},
{ name: "Omens of Ragnarok", cards: [
// {BRIDGE CONQUEROR 3}
// FIGHT: KO one of your Heroes.
// ATTACK: 4+
// VP: 2
// FLAVOR: After a lifetime of evil, he redeemed himself with a final stand at the Bridge of Gjallerbru.
  [ 2, makeVillainCard("Omens of Ragnarok", "Skurge, the Executioner", 4, 2, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    ...conquerorAbility(3, 'BRIDGE'),
  })],
// {STREETS CONQUEROR 2}
// AMBUSH: The Fenris Wolf moves forward to the Rooftops, pushing other Villains forward as normal.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Omens of Ragnarok", "The Fenris Wolf", 4, 3, {
    ambush: ev => {
      withCity('ROOFTOPS', rooftops => {
        const c = ev.source;
        const move: () => void = () => cont(ev, () => c.location !== rooftops && c.location.next && (moveCardEv(ev, c, c.location.next), move()));
        move();
      })
    },
    ...conquerorAbility(2, 'STREETS')
  })],
// {SEWERS CONQUEROR 1}
// {BANK CONQUEROR 1}
// {ROOFTOPS CONQUEROR 1}
// {STREETS CONQUEROR 1}
// {BRIDGE CONQUEROR 1}
// FIGHT: Each Hero currently in the HQ costs 1 less this turn.
// ATTACK: 5+
// VP: 5
  [ 1, makeVillainCard("Omens of Ragnarok", "Jormungand, the World-Serpent", 5, 5, {
    fight: ev => {
      const cards = hqHeroes();
      addTurnMod('cost', c => cards.includes(c), -1);
    },
    ...conquerorAbility(1, 'SEWERS', 'BANK', 'ROOFTOPS', 'STREETS', 'BRIDGE'),
  })],
// FIGHT: Put this into your discard pile as a "Surtur's Crown" Artifact.
// ESCAPE: If Surtur was holding The Eternal Flame, say "Ragnarok has come," KO each Heroes of Asgard Hero from the HQ, and each player gains two Wounds.
// --
// {ARTIFACT} Once per turn, you get {SEWERS CONQUEROR 1}.
// ATTACK: 6
  [ 1, makeGainableCard(makeVillainCard("Omens of Ragnarok", "Surtur, Fire Giant King", 6, u, {
    escape: ev => {
      if (ev.source.attached('WEAPON').has(c => c.cardName === "The Eternal Flame")) {
        hqHeroes().limit('Heroes of Asgard').each(c => KOEv(ev, c));
        eachPlayer(p => (gainWoundEv(ev, p), gainWoundEv(ev, p)));
      }
    },
  }), u, u, 0, u, "", ev => heroConquerorEv(ev, 'SEWERS', 1), {
    isArtifact: true, cardActions: [ useArtifactAction() ]
  })],
// {VILLAINOUS WEAPON}
// AMBUSH: If Surtur is in the city, he captures The Eternal Flame. If a player controls "Surtur's Crown," that card enters the city as the Villain Surtur and captures The Eternal Flame.
// GAINABLE
// {ARTIFACT} Once per turn, return a 0-cost card from your discard pile to your hand.
// ATTACK: +4
  [ 1, makeGainableCard(makeVillainousWeaponCard("Omens of Ragnarok", "The Eternal Flame", 4, {
    ambush: ev => {
      cityVillains().limit(c => c.cardName === "Surtur, Fire Giant King").withFirst(c => {
        attachCardEv(ev, c, ev.source, 'WEAPON');
      });
      gameState.players.each(p => p.artifact.limit(c => c.cardName === "Surtur, Fire Giant King").withFirst(c => {
        enterCityEv(ev, c);
        attachCardEv(ev, c, ev.source, 'WEAPON');
      }));
    },
  }), u, u, 0, u, "", ev => selectCardEv(ev, "Choose a card to return to hand", playerState.discard.limit(c => c.cost === 0), c => moveCardEv(ev, c, playerState.hand)), { isArtifact: true, cardActions: [ useArtifactAction() ] })],
// {VILLAINOUS WEAPON}
// GAINABLE
// {ARTIFACT} Once per turn, you get {STREETS CONQUEROR 1}.
// ATTACK: +3
  [ 1, makeGainableCard(makeVillainousWeaponCard("Omens of Ragnarok", "The Hel-Crown", 3, {
  }), u, u, 0, u, "", ev => heroConquerorEv(ev, 'STREETS', 1), { isArtifact: true, cardActions: [ useArtifactAction() ] })],
]},
]);
addVillainTemplates("New Mutants", [
{ name: "Hellions", cards: [
// {MOONLIGHT} Catseye gets +2 Attack.
// FIGHT: KO one of your Heroes.
// ATTACK: 3+
// VP: 3
// FLAVOR: Transforming into various feline forms makes Catseye into Wolfsbane's natural enemy.
  [ 2, makeVillainCard("Hellions", "Catseye", 3, 3, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: c => c.printedDefense + (moonlightPower() ? 2 : 0),
  })],
// {SUNLIGHT} Thunderbird gets +2 Attack
// FIGHT: KO one of your Heroes.
// ATTACK: 4+
// VP: 4
// FLAVOR: He rises like the morning sun, growing beyond his bitterness to eventually join the X-Men.
  [ 2, makeVillainCard("Hellions", "Thunderbird", 4, 4, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: c => c.printedDefense + (sunlightPower() ? 2 : 0),
  })],
// AMBUSH: Reveal the top card of the Hero Deck. If it's [Tech], each player gains a Wound. If it's [Covert], you draw a card.
// FIGHT: Same effect.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
// FLAVOR: Her supernatural black tokens curse, while her red tokens bless.
  [ 1, makeVillainCard("Hellions", "Roulette", 5, 3, {
    ambush: ev => revealHeroDeckEv(ev, 1, cards => {
      cards.has(Color.TECH) && eachPlayer(p => gainWoundEv(ev, p));
      cards.has(Color.COVERT) && drawEv(ev);
    }),
    fight: sameEffect,
    escape: sameEffect,
  })],
// AMBUSH: Reveal the top card of the Villain Deck. If it's a...
// Bystander: Rescue it.
// Scheme Twist: Play it.
// Master Strike: Each player gains a Wound.
// Villain: Each player has a {WAKING NIGHTMARE}.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Hellions", "Tarot", 5, 3, {
    ambush: ev => revealVillainDeckEv(ev, 1, cards => {
      cards.limit(isBystander).each(c => rescueEv(ev, c));
      cards.limit(isTwist).each(c => playTwistEv(ev, c));
      cards.has(isStrike) && eachPlayer(p => gainWoundEv(ev, p));
      cards.has(isVillain) && eachPlayer(p => wakingNightmareEv(ev, p));
    }),
  })],
// AMBUSH: <i>(After this enters the Sewers)</i> Put Jetstream on the Bridge. If there's another Villain there, swap them.
// ESCAPE: Each player discards an X-Men Hero or gains a Wound.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("Hellions", "Jetstream", 6, 4, {
    ambush: ev => withCity('BRIDGE', bridge => swapCardsEv(ev, ev.source, bridge)),
    escape: ev => eachPlayer(p => selectCardOptEv(ev, "Choose a Hero to discard", p.hand.limit('X-Men'), c => discardEv(ev, c), () => gainWoundEv(ev, p), p)),
  })],
// During your turn, Empath gets +1 Attack for each grey Hero you have.
// AMBUSH: Each player reveals a [Covert] Hero or has a {WAKING NIGHTMARE}.
// ESCAPE: Same effect.
// ATTACK: 4+
// VP: 4
  [ 1, makeVillainCard("Hellions", "Empath", 4, 4, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.COVERT, () => wakingNightmareEv(ev, p), p)),
    escape: sameEffect,
    varDefense: c => c.printedDefense + yourHeroes().count(Color.GRAY),
  })],
]},
{ name: "Demons of Limbo", cards: [
// AMBUSH: Crotus captures a Bystander. Put an even-numbered Hero on the bottom of the Hero Deck.
// {MOONLIGHT} Crotus gets +4 Attack
// ATTACK: 3+
// VP: 3
// FLAVOR: Those who pick on little Crotus change their tune when night falls and his demonic army rises.
  [ 2, makeVillainCard("Demons of Limbo", "Crotus", 3, 3, {
    ambush: ev => {
      captureEv(ev, ev.source);
      selectCardEv(ev, "Choose a Hero to put on bottom of the deck", hqHeroes().limit(c => c.printedCost % 2 === 0), c => {
        moveCardEv(ev, c, gameState.herodeck, true);
      })
    },
    varDefense: c => c.printedDefense + (moonlightPower() ? 4 : 0),
  })],
// AMBUSH: Witchfire captures a Hero from the HQ with the lowest odd-numbered cost.
// {SUNLIGHT} Witchfire gets +2 Attack
// FIGHT: The player of your choice gains that Hero.
// ESCAPE: KO the captured Hero.
// ATTACK: 4+
// VP: 4
  [ 2, makeVillainCard("Demons of Limbo", "Witchfire", 4, 4, {
    ambush: ev => {
      const cards = hqHeroes().limit(c => c.printedCost % 2 == 1).highest(c => -c.printedCost);
      selectCardEv(ev, "Choose a hero", cards, c => attachCardEv(ev, c, ev.source, "WITCHFIRE_CAPTURE"))
    },
    fight: ev => ev.source.attached("WITCHFIRE_CAPTURE").each(c => choosePlayerEv(ev, p => gainEv(ev, c, p))),
    escape: ev => ev.source.attached("WITCHFIRE_CAPTURE").each(c => KOEv(ev, c)),
    varDefense: c => c.printedDefense + (sunlightPower() ? 2 : 0),
  })],
// {SUNLIGHT} To fight N'astirh, you must also spend 3 Recruit.
// {MOONLIGHT} N'astirh gets +3 Attack.
// FIGHT: KO one of your Heroes.
// ATTACK: 3+
// VP: 3
// FLAVOR: Weaving magic and technology makes N'astirh dangerously adaptable.
  [ 2, makeVillainCard("Demons of Limbo", "N'astirh", 3, 3, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varFightCost: (c, attack) => sunlightPower() ? { attack, recruit: 3 } : { attack },
    varDefense: c => c.printedDefense + (moonlightPower() ? 3 : 0)
  })],
// AMBUSH: Each player has a {WAKING NIGHTMARE}. The Demon Bear captures one of the Heroes discarded this way that has the lowest cost. The Demon Bear gets + Attack equal to that Hero's cost.
// FIGHT: The player of your choice gains that Hero.
// ESCAPE: KO the captured Hero.
// ATTACK: 5+
// VP: 5
  [ 1, makeVillainCard("Demons of Limbo", "Demon Bear", 5, 5, {
    ambush: ev => {
      eachPlayer(p => wakingNightmareEv(ev, p));
      cont(ev, () => {
        const cards = pastEvents('DISCARD').limit(e => e.getSource() === ev.source).map(e => e.what);
        selectCardEv(ev, "Choose a hero", cards, c => attachCardEv(ev, c, ev.source, "DEMON_BEAR_CAPTURE"));
      });
    },
    fight: ev => ev.source.attached("DEMON_BEAR_CAPTURE").each(c => choosePlayerEv(ev, p => gainEv(ev, c, p))),
    escape: ev => ev.source.attached("DEMON_BEAR_CAPTURE").each(c => KOEv(ev, c)),
    varDefense: c => c.printedDefense + c.attached("DEMON_BEAR_CAPTURE").sum(c => c.cost),
  })],
// AMBUSH: {SUNLIGHT} Each player reveals a [Strength] Hero or gains a Wound. {MOONLIGHT} Each player has a {WAKING NIGHTMARE}.
// ESCAPE: Same effect.
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Demons of Limbo", "S'ym", 7, 5, {
    ambush: ev => {
      sunlightPower() && eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p));
      moonlightPower() && eachPlayer(p => wakingNightmareEv(ev, p));
    },
    escape: sameEffect,
  })],
]},
]);
addVillainTemplates("Into the Cosmos", [
{ name: "Elders of the Universe", cards: [
// AMBUSH: {CONTEST OF CHAMPIONS}[Instinct]. Each player that loses must discard a card. If Evil wins, the Runner gains a Shard for each card discarded this way, and he pushes forward two extra spaces.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Elders of the Universe", "The Runner", 5, 3, {
    ambush: ev => contestOfChampionsEv(ev, Color.INSTINCT, () => {},
      p => pickDiscardEv(ev, 1, p),
      () => attachShardEv(ev, ev.source, pastEvents('DISCARD').count(e => e.getSource() === ev.source)) // TODO e.childOf(ev)
    ),
  })],
// AMBUSH: {CONTEST OF CHAMPIONS}[Tech]. Each player that loses must reveal their hand and trade a non-grey card from their hand with a card in the HQ that costs the same or less. If Evil wins, the Trader gains a Shard for each trade that occurred.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Elders of the Universe", "The Trader", 4, 2, {
    ambush: ev => {
      let trades = 0;
      contestOfChampionsEv(ev, Color.TECH, () => {},
        p => selectCardEv(ev, "Choose a Hero to trade", p.hand.limit(isNonGrayHero), c1 => {
          selectCardEv(ev, "Choose a Hero to trade for", hqHeroes().limit(c2 => c2.cost <= c1.cost), c2 => {
            swapCardsEv(ev, c1, c2);
            trades++;
          }, p);
        }, p),
        () => attachShardEv(ev, ev.source, trades))
      }
  })],
// AMBUSH: {CONTEST OF CHAMPIONS}[Strength]. Each player that loses must give this Villain one of their Shards or gain a Wound.
// FIGHT: KO one of your Heroes.
// ATTACK: 7
// VP: 5
  [ 2, makeVillainCard("Elders of the Universe", "The Champion of the Universe", 7, 5, {
    ambush: ev => contestOfChampionsEv(ev, Color.STRENGTH, () => {},
    p => {
      p.shard.size ? chooseOptionEv(ev, "Choose one", [
        {l:"Give a Shard", v:() => p.shard.withTop(c => attachShardEv(ev, ev.source, c))},
        {l:"Gain a Wound", v:() => gainWoundEv(ev, p)}], f => f(), p) : gainWoundEv(ev, p);
    }, () => {}),
    fight: ev => selectCardAndKOEv(ev, yourHeroes())
  })],
// AMBUSH: {CONTEST OF CHAMPIONS}[Covert]. Each player that loses gives the Collector one of these things that he doesn't have yet: A Shard, a Bystander from their Victory Pile, a [Strength] Hero, a [Instinct] Hero, a [Covert] Hero, a [Tech] Hero, or a [Ranged] Hero from hand or discard pile.
// FIGHT: The player of your choice gains one of the captured Heroes. Put the rest on the bottom of the Hero Deck.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Elders of the Universe", "The Collector", 6, 4, {
    ambush: ev => contestOfChampionsEv(ev, Color.COVERT, () => {},
    p => {
      const options = [];
      if (!ev.source.attached('SHARD').size && p.shard.size)
        options.push({l:"Give a Shard", v: () => p.shard.withTop(c => attachShardEv(ev, ev.source, c))});
      if (!ev.source.captured.has(isBystander) && p.victory.has(isBystander))
        options.push({l:"Give a Bystander", v: () => selectCardEv(ev, "Choose a Bystander", p.victory.limit(isBystander), c => captureEv(ev, ev.source, c), p)});
      let wantedColors = 0;
      for (const color of [Color.COVERT, Color.STRENGTH, Color.INSTINCT, Color.TECH, Color.RANGED])
        if (!ev.source.captured.has(color)) wantedColors |= color;
      if (p.hand.has(wantedColors) || p.discard.has(wantedColors))
        options.push({l:`Give a Hero`, v: () => {
          selectCardEv(ev, "Choose a Hero", [...p.hand.deck, ...p.discard.deck].limit(wantedColors), c => {
            captureEv(ev, ev.source, c);
          }, p);
        }});
      chooseOptionEv(ev, "Choose one", options, f => f(), p);
    }, () => {}),
    fight: ev => {
      choosePlayerEv(ev, p => {
        selectCardEv(ev, "Choose a Hero", ev.source.captured.limit(isHero), c => gainEv(ev, c, p));
      });
      cont(ev, () => ev.source.captured.limit(isHero).each(c => moveCardEv(ev, c, gameState.herodeck, true)));
    },
  })],
]},
{ name: "Celestials", cards: [
// {COSMIC THREAT}[Covert] or [Tech]
// FIGHT: Nezarr grants you a {CELESTIAL BOON}: For the rest of the game, while it's your turn, the Mastermind gets -Attack equal to a fifth of its printed Attack. (Round down the loss.)
// ESCAPE: The Mastermind gains Shards equal to a fifth of its printed Attack. (Rounded down.)
// ATTACK: 11*
// VP: 4
  [ 2, makeVillainCard("Celestials", "Nezarr, The Calculator", 11, 4, {
    fight: ev => {
      addStatMod('defense', isMastermind, c => ev.source.location === playerState.victory ? -Math.floor(c.printedDefense / 5) : 0); // TODO once per game
    },
    escape: ev => gameState.mastermind.each(c => attachShardEv(ev, c, Math.floor(c.printedAttack/5))),
    cosmicThreat: Color.COVERT | Color.TECH,
    cardActions: [ cosmicThreatAction ],
  })],
// {COSMIC THREAT}[Strength] or [Instinct]
// FIGHT: Gammenon grants you a {CELESTIAL BOON}: For the rest of the game, whenever you fight a Villain, rescue a Bystander.
// ESCAPE: Three Villains in the city each capture a Bystander.
// ATTACK: 10*
// VP: 3
  [ 2, makeVillainCard("Celestials", "Gammenon, The Gatherer", 10, 3, {
    escape: ev => selectObjectsEv(ev, "Choose 3 Villains", 3, cityVillains(), c => captureEv(ev, c)),
    cosmicThreat: Color.STRENGTH | Color.INSTINCT,
    cardActions: [ cosmicThreatAction ],
    trigger: {
      event: 'FIGHT',
      match: (ev, source) => isVillain(ev.what) && source.location === playerState.victory,
      after: ev => rescueEv(ev),
    },
  })],
// {COSMIC THREAT}[Tech] or [Ranged]
// FIGHT: Exitar grants you a {CELESTIAL BOON}: For the rest of the game, once during each of your turns, you may fight a Henchman from your Victory Pile. Spend the normal Attack then do the Henchman's Fight effect. KO it and rescue a Bystander.
// ESCAPE: KO 5 Henchman from the Villain Deck then shuffle it.
// ATTACK: 12*
// VP: 5
  [ 2, makeVillainCard("Celestials", "Exitar, The Exterminator", 12, 5, {
    escape: ev => revealVillainDeckEv(ev, () => false, cards => selectObjectsEv(ev, "Choose 5 Henchmen", 5, cards.limit(isHenchman), c => KOEv(ev, c))),
    cosmicThreat: Color.TECH | Color.RANGED,
    cardActions: [ cosmicThreatAction, celestialBoonActionEv(ev => {
      const cards = playerState.victory.limit(isHenchman).map(c => fightActionEv(u, c)).limit(ev => canPayCost(ev)).map(ev => ev.what);
      selectCardEv(ev, "Choose a Henchman", cards, c => {
        playEvent(fightActionEv(ev, c));
        KOEv(ev, c);
        rescueEv(ev);
      });
    }, () => {
      return playerState.victory.limit(isHenchman).map(c => fightActionEv(u, c)).has(ev => canPayCost(ev));
    }) ],
  })],
// {COSMIC THREAT}[Ranged] or [Strength]
// FIGHT: Arishem grants you a {CELESTIAL BOON}: For the rest of the game, once during each of your turns, you may put a card from the HQ on the bottom of the Hero Deck.
// ESCAPE: (After the normal Escape KO) Put each Hero that costs 5 or more from the HQ on the bottom of the Hero Deck.
// ATTACK: 13*
// VP: 5
  [ 1, makeVillainCard("Celestials", "Arishem, The Judge", 13, 5, {
    escape: ev => hqHeroes().limit(c => c.cost >= 5).each(c => moveCardEv(ev, c, gameState.herodeck, true)),
    cosmicThreat: Color.RANGED | Color.STRENGTH,
    cardActions: [ cosmicThreatAction, celestialBoonActionEv(ev => {
      selectCardEv(ev, "Choose a card to put on the bottom of the Hero Deck", hqCards(), c => {
        moveCardEv(ev, c, gameState.herodeck, true);
      });
    }) ],
  })],
// {COSMIC THREAT}[Instinct] or [Covert]
// FIGHT: Tiamut grants you a {CELESTIAL BOON}: Your hand size is one more for the rest of the game.
// ESCAPE: Each player's hand size is one less for the rest of the game.
// ATTACK: 14*
// VP: 6
  [ 1, makeVillainCard("Celestials", "Tiamut, The Dreaming Celestial", 14, 6, {
    escape: ev => gameState.endDrawAmount--,
    cosmicThreat: Color.INSTINCT | Color.COVERT,
    cardActions: [ cosmicThreatAction ],
    trigger: {
      event: "CLEANUP",
      before: ev => addEndDrawMod(1),
    }
  })],
]},
{ name: "From Beyond", cards: [
// {COSMIC THREAT}[Tech]
// FIGHT: KO one of your Heroes.
// ATTACK: 7*
// VP: 3
  [ 3, makeVillainCard("From Beyond", "The Mapmakers", 7, 3, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    cosmicThreat: Color.TECH,
    cardActions: [ cosmicThreatAction ],
  })],
// {COSMIC THREAT}[Ranged]
// AMBUSH: Create a "New Reality" space that stays above the Shaper of Worlds. It always contains a Hero, like an HQ space. Players can recruit from it.
// FIGHT: Choose a player to gain that Hero.
// ESCAPE: After the normal Escape KO, destroy the New Reality space and destroy an HQ space. KO those Heroes. (It doesn't refill. Any "Pocket Dimension" stays in play.)
// ATTACK: 10*
// VP: 5
  [ 2, makeVillainCard("From Beyond", "The Shaper of Worlds", 10, 5, {
    ambush: ev => gameState.herodeck.withTop(c => attachCardEv(ev, c, ev.source, 'NEWREALITY')),
    fight: ev => ev.source.attached('NEWREALITY').each(c => choosePlayerEv(ev, p => gainEv(ev, c))),
    escape: ev => {
      ev.source.attached('NEWREALITY').each(c => KOEv(ev, c));
      selectCardEv(ev, "Choose an HQ space", gameState.hq, d => {
        destroyHQ(ev, d);
        d.each(c => KOEv(ev, c));
      });
    },
    cosmicThreat: Color.RANGED,
    cardActions: [
      cosmicThreatAction,
      (c: Card, ev: Ev) => c.attached("NEWREALITY").size ?
        recruitCardActionEv(ev, c.attachedDeck("NEWREALITY").top) : noOpActionEv(ev),
    ],
    trigger: {
      event: "MOVECARD",
      match: (ev, source) => ev.from === source.attachedDeck('NEWREALITY'),
      after: ev => gameState.herodeck.withTop(c => moveCardEv(ev, c, ev.parent.from)),
    }
  })],
// {COSMIC THREAT}[Instinct]
// AMBUSH: Each player must reveal two cards with the same non-zero cost or gain a Wound.
// FIGHT: Reveal the top card of your deck. If it costs 0, KO it.
// ATTACK: 11*
// VP: 5
  [ 2, makeVillainCard("From Beyond", "Kubik", 11, 5, {
    ambush: ev => eachPlayer(p => {
      const cards = revealable(p).limit(c => c.cost > 0);
      cards.uniqueCount(c => c.cost) === cards.size && gainWoundEv(ev, p);
    }),
    fight: ev => revealPlayerDeckEv(ev, 1, cards => cards.limit(c => c.cost === 0).each(c => KOEv(ev, c))),
    cosmicThreat: Color.INSTINCT,
    cardActions: [ cosmicThreatAction ],
  })],
// {COSMIC THREAT}[Covert]
// FIGHT: Take another turn after this one. Don't play a card from the Villain Deck at the start of that turn. For the rest of the game, players take turns in the opposite order around the table.
// ATTACK: 13*
// VP: 6
  [ 1, makeVillainCard("From Beyond", "Kosmos", 13, 6, {
    fight: ev => {
      addFutureTrigger(ev => turnState.villainCardsToPlay > 0 && turnState.villainCardsToPlay--);
      gameState.reversePlayerOrder = true;
      gameState.extraTurn = true;
    },
    cosmicThreat: Color.COVERT,
    cardActions: [ cosmicThreatAction ],
  })],
]},
{ name: "Black Order of Thanos", cards: [
// AMBUSH: {DANGERSENSE 3}, helping all Black Order Villains and the Mastermind. Corvus Glaive captures a Bystander revealed this way.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("Black Order of Thanos", "Corvus Glaive", 5, 4, {
    ambush: ev => dangerSenseEv(ev, 3, cards => {
      selectCardEv(ev, "Choose a Bystander", cards.limit(isBystander), c => captureEv(ev, ev.source, c));
    }, c => isMastermind(c) || isVillain(c) && isGroup("Black Order of Thanos")(c)),
  })],
// AMBUSH: {DANGERSENSE 2}, helping all Black Order Villains and the Mastermind. Play a Master Strike revealed this way.
// FIGHT: KO one of your Heroes.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Black Order of Thanos", "Black Dwarf", 4, 3, {
    ambush: ev => dangerSenseEv(ev, 2, cards => {
      selectCardEv(ev, "Choose a Master Strike", cards.limit(isStrike), c => playStrikeEv(ev, c));
    }, c => isMastermind(c) || isVillain(c) && isGroup("Black Order of Thanos")(c)),
    fight: ev => selectCardAndKOEv(ev, yourHeroes())
  })],
// AMBUSH: {DANGERSENSE 1}, helping all Black Order Villains and the Mastermind. Play a Villain revealed this way.
// FIGHT: You may KO a card from your discard pile.
// ATTACK: 6+
// VP: 5
  [ 2, makeVillainCard("Black Order of Thanos", "Supergiant", 6, 5, {
    ambush: ev => dangerSenseEv(ev, 1, cards => {
      cards.limit(isVillain).each(c => villainDrawEv(ev, c));
    }, c => isMastermind(c) || isVillain(c) && isGroup("Black Order of Thanos")(c)),
    fight: ev => selectCardOptEv(ev, "Choose a card to KO", playerState.discard.deck, c => KOEv(ev, c)),
  })],
// AMBUSH: {DANGERSENSE 2}, helping all Black Order Villains and the Mastermind. Play a Scheme Twist revealed this way.
// ESCAPE: Each player reveals an [Instinct] Hero or gains a Wound.
// ATTACK: 7+
// VP: 5
  [ 1, makeVillainCard("Black Order of Thanos", "Proxima Midnight", 7, 5, {
    ambush: ev => dangerSenseEv(ev, 2, cards => {
      selectCardEv(ev, "Choose a Scheme Twist", cards.limit(isTwist), c => playTwistEv(ev, c));
    }, c => isMastermind(c) || isVillain(c) && isGroup("Black Order of Thanos")(c)),
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainWoundEv(ev, p), p)),
  })],
// AMBUSH: Choose Villain, Master Strike, or Scheme Twist. Then {DANGERSENSE 3}, helping all Black Order Villains and the Mastermind. Play all the cards you revealed this way of the type you chose.
// ATTACK: 6+
// VP: 5
  [ 1, makeVillainCard("Black Order of Thanos", "Ebony Maw", 6, 5, {
    ambush: ev => {
      chooseOptionEv(ev, "Choose one", [
        {l:"Villain", v: isVillain},
        {l:"Master Strike", v: isStrike},
        {l:"Scheme Twist", v: isTwist},
      ], f => dangerSenseEv(ev, 3, cards => {
          cards.limit(f).each(c => villainDrawEv(ev, c));
        }, c => isMastermind(c) || isVillain(c) && isGroup("Black Order of Thanos")(c)),
      );
    }
  })],
]},
]);
addVillainTemplates("Realm of Kings", [
{ name: "Inhuman Rebellion", cards: [
// {ABOMINATION}
// FIGHT: Rescue Bystanders equal to the printed Attack of the Hero in the HQ space under Lineage.
// ATTACK: 3+
// VP: 2
  [ 2, makeVillainCard("Inhuman Rebellion", "Lineage", 3, 2, {
    fight: ev => {},
  })],
// {ABOMINATION}
// FIGHT: Choose "Alpha" or "Omega." Then reveal the top card of your deck:
// <ul>
//     <li> <b>Alpha</b>: If that card costs 0, KO it.</li>
//     <li> <b>Omega</b>: If that card costs 1 or more, draw it.</li>
// </ul>
// ATTACK: 4+
// VP: 3
[ 2, makeVillainCard("Inhuman Rebellion", "Omega", 4, 3, {
    fight: ev => chooseOneEv(ev, "Choose", ["Alpha", () => {
      revealPlayerDeckEv(ev, 1, cards => cards.limit(c => c.cost === 0).each(c => KOEv(ev, c)));
    }], ["Omega", () => {
      revealPlayerDeckEv(ev, 1, cards => cards.limit(c => c.cost >= 1).each(c => drawCardEv(ev, c)));
    }]),
    varDefense: abominationVarDefense,
  })],
// {ABOMINATION}
// AMBUSH: Choose a Hero from the HQ that doesn't have a printed Attack of 2 or more. Put it on the bottom of the Hero Deck.
// FIGHT: Gain a Hero from the HQ with no Attack icon that costs 4 or less.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("Inhuman Rebellion", "Lash", 5, 4, {
    ambush: ev => selectCardEv(ev, "Choose a Hero to remove from HQ", hqHeroes().limit(c => !(c.printedAttack >= 2)), c => moveCardEv(ev, c, gameState.herodeck, true)),
    fight: ev => selectCardEv(ev, "Choose a Hero to gain", hqHeroes().limit(c => !hasAttackIcon(c)).limit(c => c.cost <= 4), c => gainEv(ev, c)),
    varDefense: abominationVarDefense,
  })],
// {DOUBLE ABOMINATION}
// AMBUSH: Choose a Hero from the HQ that doesn't have a printed Attack of 2 or more. Put it on the bottom of the Hero Deck. If there were no such Heroes, then each player gains a Wound instead.
// FIGHT: KO one of your Heroes with no Attack icon.
// ATTACK: 5+
// VP: 5
  [ 2, makeVillainCard("Inhuman Rebellion", "The Unspoken", 5, 5, {
    ambush: ev => selectCardEv(ev, "Choose a Hero to remove from HQ", hqHeroes().limit(c => !(c.printedAttack >= 2)), c => moveCardEv(ev, c, gameState.herodeck, true)),
    fight: ev => selectCardAndKOEv(ev, yourHeroes().limit(c => !hasAttackIcon(c))),
    varDefense: doubleAbominationVarDefense,
  })],
]},
{ name: "Shi'ar Imperial Elite", cards: [
// While the Mastermind has the {THRONES FAVOR}, you must spend Recruit to fight Plutonia instead of Attack.
// AMBUSH: The Mastermind gains the {THRONES FAVOR}.
// FIGHT: You gain the {THRONES FAVOR}. If you already have it, you get +2 Recruit.
// ATTACK: 4*
// VP: 2
  [ 2, makeVillainCard("Shi'ar Imperial Elite", "Plutonia", 4, 2, {
    ambush: ev => withMastermind(ev, c => thronesFavorGainEv(ev, c)),
    fight: ev => thronesFavorGainOrEv(ev, () => addRecruitEvent(ev, 2)),
    varFightCost: (c, attack) => mastermindHasThronesFavor() ? ({ recruit: attack }) : ({ attack }),
  })],
// While the Mastermind has the {THRONES FAVOR}, Starbolt gets +2 Attack.
// AMBUSH: The Mastermind gains the {THRONES FAVOR}.
// FIGHT: You gain the {THRONES FAVOR}. If you already have it, you may KO one of your Heroes.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Shi'ar Imperial Elite", "Starbolt", 4, 3, {
    ambush: ev => withMastermind(ev, c => thronesFavorGainEv(ev, c)),
    fight: ev => thronesFavorGainOrEv(ev, () => selectCardOptEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c))),
    varDefense: c => c.printedDefense + (mastermindHasThronesFavor() ? 2 : 0),
  })],
// AMBUSH: The Mastermind gains the {THRONES FAVOR}. If they already have it, each player discards a card.
// FIGHT: You gain the {THRONES FAVOR}. If you already have it, draw two cards.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Shi'ar Imperial Elite", "Mentor", 5, 3, {
    ambush: ev => withMastermind(ev, c => thronesFavorGainOrEv(ev, () => eachPlayer(p => pickDiscardEv(ev, 1, p)), c)),
    fight: ev => thronesFavorGainOrEv(ev, () => drawEv(ev, 2)),
  })],
// AMBUSH: The Mastermind gains the {THRONES FAVOR}. If they already have it, each player gains a Wound.
// FIGHT: You gain the {THRONES FAVOR}. If you already have it, you may KO a card from your discard pile.
// ATTACK: 7
// VP: 5
  [ 2, makeVillainCard("Shi'ar Imperial Elite", "Gladiator", 7, 5, {
    ambush: ev => withMastermind(ev, c => thronesFavorGainOrEv(ev, () => eachPlayer(p => gainWoundEv(ev, p)), c)),
    fight: ev => thronesFavorGainOrEv(ev, () => selectCardOptEv(ev, "Choose a card to KO", playerState.discard.deck, c => KOEv(ev, c))),
  })],
]},
]);
addVillainTemplates("Annihilation", [
{ name: "Annihilation Wave", cards: [
// {MOMENTUM 3}
// AMBUSH: Ravenous swaps places with an Annihilation Wave villain that isn't Weaponized Galactus.
// ESCAPE: Each player reveals a [Strength] Hero or gains a wound.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("Annihilation Wave", "Ravenous", 5, 4, {
    ambush: ev => {
      const cards = cityVillains().limit(c => isGroup("Annihilation Wave")(c) && c.cardName !== "Weaponized Galactus" && c !== ev.source);
      selectCardEv(ev, "Choose a villain to swap with", cards, c => swapCardsEv(ev, ev.source, c));
    },
    escape: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p)),
    varDefense: momentumVarDefense(3),
  })],
// {MOMENTUM 3}
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Villain, play it.
// FIGHT: KO one of your Heroes.
// ATTACK: 4+
// VP: 3
// FLAVOR: Eradica, Extermina, and Extirpia each lead a third of the Annihilation Wave as the royal consorts of Annihilus.
  [ 3, makeVillainCard("Annihilation Wave", "Queens of Annihilation", 4, 3, {
    ambush: ev => revealVillainDeckEv(ev, 1, cards => cards.each(c => villainDrawEv(ev, c))),
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: momentumVarDefense(3),
  })],
// {MOMENTUM 2}
// AMBUSH: A Henchmen Villain from your Victory Pile enters the city.
// ATTACK: 3+
// VP: 2
// FLAVOR: The Wave was alwyas advancing, always growing, always consuming.
  [ 2, makeVillainCard("Annihilation Wave", "Annihilation Armada", 3, 2, {
    ambush: ev => selectCardEv(ev, "Choose a henchman", playerState.victory.limit(isHenchman), c => enterCityEv(ev, c)),
    varDefense: momentumVarDefense(2),
  })],
// {MOMENTUM 9}
// AMBUSH: Weaponized Galactus swaps places with the leftmost Villain in the city.
// ESCAPE: Destroy the leftmost city space. If this destroys the last city space, Evil Wins. Otherwise, each player gains a Wound, and you shuffle Weaponized Galactus back into the Villain Deck. Any Villain from the destroyed city space escapes.
// ATTACK: 9+
// VP: 7
  [ 1, makeVillainCard("Annihilation Wave", "Weaponized Galactus", 9, 7, {
    ambush: ev => cityVillains().withFirst(c => swapCardsEv(ev, ev.source, c)), // TODO leftmost villain
    escape: ev => withLeftmostCitySpace(ev, space => {
      destroyCity(space);
      if (!gameState.city.size) evilWinsEv(ev);
      else eachPlayer(p => gainWoundEv(ev, p));
      shuffleIntoEv(ev, ev.source, gameState.villaindeck);
      space.deck.limit(isVillain).each(c => c !== ev.source && villainEscapeEv(ev, c));
    }),
    varDefense: momentumVarDefense(9),
  })],
]},
{ name: "Timelines of Kang", cards: [
// {STREETS CONQUEROR 3}
// FIGHT: Reveal a [Ranged] Hero or reveal the top card of the Villain Deck. If it's a Villain worth 4VP or less, defeat it<i>(do its Fight effect)</i> and put Immortus in its place.
// ESCAPE: Each player reveals a [Ranged] Hero or gains a Wound. Shuffle Immortus back into the Villain Deck.
// ATTACK: 5+
// VP: 5
  [ 2, makeVillainCard("Timelines of Kang", "Immortus", 5, 5, {
    fight: ev => {
      revealOrEv(ev, Color.RANGED, () =>
        revealVillainDeckEv(ev, 1, cards => cards.limit(c => c.vp <= 4).each(
          c => { defeatEv(ev, c); moveCardEv(ev, ev.source, gameState.villaindeck); }
        ))
      );
    },
    escape: ev => {
      eachPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p));
      shuffleIntoEv(ev, ev.source, gameState.villaindeck);
    },
    ...conquerorAbility(3, 'STREETS'),
  })],
// {BRIDGE CONQUEROR 3}
// AMBUSH: If the Bridge is empty, move a Villain to the Bridge.
// FIGHT: Send a [Strength] or [Ranged] Hero you played this turn as a <b>Man or Woman Out of Time</b>.
// ATTACK: 4+
// VP: 4
  [ 2, makeVillainCard("Timelines of Kang", "Pharaoh Rama-Tut", 4, 4, {
    ambush: ev => {
      withCity('BRIDGE', bridge => bridge.size || selectCardEv(ev, "Choose a villain", villains(), c => moveCardEv(ev, c, bridge)));
    },
    fight: ev => {
      selectCardEv(ev, "Choose an out of time hero", playerState.playArea.limit(isHero).limit(Color.STRENGTH | Color.RANGED), c => outOfTimeEv(ev, c));
    },
    ...conquerorAbility(3, 'BRIDGE'),
  })],
// {BANK CONQUEROR 2}
// AMBUSH: Reveal your hand and send your highest-cost Hero as a <b>Man or Woman Out of Time</b>.
// FIGHT: If you played a [Covert] Hero this turn, KO one of your Heroes.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Timelines of Kang", "Scarlet Centurion", 4, 3, {
    ambush: ev => selectCardEv(ev, "Choose a hero", playerState.hand.limit(isHero).highest(c => c.cost), c => outOfTimeEv(ev, c)),
    fight: ev => superPower(Color.COVERT) && selectCardAndKOEv(ev, yourHeroes()),
    ...conquerorAbility(2, 'BANK'),
  })],
// FIGHT: The player of your choice gains this as a Hero.
// ATTACK: 4
// GAINABLE
// CLASS: [Tech]
// {POWER Tech} {OUTOFTIME}
// ATTACKG: 2
  [ 2, makeGainableCard(makeVillainCard("Timelines of Kang", "Iron Lad", 4, u, {
    fight: ev => choosePlayerEv(ev, p => gainEv(ev, ev.source, p)),
  }), u, 2, Color.TECH, u, "D", ev => superPower(Color.TECH) && outOfTimeEv(ev))],
]},
]);
addVillainTemplates("Messiah Complex", [
{ name: "Reavers", cards: [
// AMBUSH: <b>Prey</b> on the fewest [Tech].
// <b>Finish the Prey</b>: KO one of that player's non-grey Heroes.
// FIGHT: KO one of your grey Heroes.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Reavers", "Donald Pierce", 6, 4, {
    ambush: ev => preyEv(ev, p => -p.hand.count(Color.TECH)),
    finishThePrey: ev => selectCardAndKOEv(ev, yourHeroes().limit(isNonGrayHero), ev.who),
    fight: ev => selectCardAndKOEv(ev, yourHeroes().limit(Color.GRAY)),
  })],
// AMBUSH: <b>Prey</b> on the fewest [Strength].
// <b>Finish the Prey</b>: That player gains a Wound to the top of their deck.
// FIGHT: Reveal the top card of your deck. KO it or draw it.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Reavers", "Bonebreaker", 5, 3, {
    ambush: ev => preyEv(ev, p => -p.hand.count(Color.STRENGTH)),
    finishThePrey: ev => gainWoundToDeckEv(ev, ev.who),
    fight: ev => revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c), () => cards.each(c => drawCardEv(ev, c))))
  })],
// AMBUSH: <b>Prey</b> on the fewest [Ranged]. Skullbuster captures one Bystander from the Bystander Stack and two Bystanders from that player's Victory Pile of their choice.
// <b>Finish the Prey</b>: KO the captured Bystanders, and each player discards a card.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Reavers", "Skullbuster", 5, 3, {
    ambush: ev => {
      preyEv(ev, p => -p.hand.count(Color.RANGED), p => {
        captureEv(ev, ev.source);
        selectObjectsEv(ev, "Choose two Bystanders to capture", 2, p.victory.limit(isBystander), c => captureEv(ev, ev.source, c));
      });
    },
    finishThePrey: ev => {
      ev.source.captured.limit(isBystander).each(c => KOEv(ev, c));
      eachPlayer(p => pickDiscardEv(ev, 1, p));
    }
  })],
// AMBUSH: <b>Prey</b> on the fewest [Covert].
// <b>Finish the Prey</b>: That player discards a card.
// FIGHT: Discard the top card of your deck. If it has a Recruit icon, you ger +1 Recruit and this Villain <b>Preys</b> on the fewest [Covert].
// ATTACK: 2
// VP: 2
  [ 2, makeVillainCard("Reavers", "Pretty Boy", 2, 2, {
    ambush: ev => preyEv(ev, p => -p.hand.count(Color.COVERT)),
    fight: ev => withPlayerDeckTopEv(ev, c => {
      discardEv(ev, c);
      if (hasRecruitIcon(c)) {
        addRecruitEvent(ev, 1);
        preyEv(ev, p => -p.hand.count(Color.COVERT));
      }
    }),
    finishThePrey: ev => pickDiscardEv(ev, 1, ev.who),
  })],
]},
{ name: "Purifiers", cards: [
// AMBUSH: <b>Prey</b> on the most [Covert]. {CLONE}.
// <b>Finish the Prey</b>: That player discards a [Covert] Hero. If they can't, they discard any non-grey Hero instead.
// ATTACK: 3
// VP: 2
  [ 1, makeVillainCard("Purifiers", "Predator X", 3, 2, {
    variant: 'COVERT',
    ambush: ev => {
      preyEv(ev, p => p.hand.count(Color.COVERT));
      cloneVillainEv(ev);
    },
    finishThePrey: ev => pickDiscardEv(ev, 1, ev.who, ev.who.hand.has(Color.COVERT) ? Color.COVERT : isNonGrayHero),
  })],
// AMBUSH: <b>Prey</b> on the most [Instinct]. {CLONE}.
// <b>Finish the Prey</b>: That player discards a [Instinct] Hero. If they can't, they discard any non-grey Hero instead.
// ATTACK: 3
// VP: 2
  [ 1, makeVillainCard("Purifiers", "Predator X", 3, 2, {
    variant: 'INSTINCT',
    ambush: ev => {
      preyEv(ev, p => p.hand.count(Color.INSTINCT)),
      cloneVillainEv(ev);
    },
    finishThePrey: ev => pickDiscardEv(ev, 1, ev.who, ev.who.hand.has(Color.INSTINCT) ? Color.INSTINCT : isNonGrayHero),
  })],
// AMBUSH: <b>Prey</b> on the most [Ranged]. {CLONE}.
// <b>Finish the Prey</b>: That player discards a [Ranged] Hero. If they can't, they discard any non-grey Hero instead.
// ATTACK: 3
// VP: 2
  [ 1, makeVillainCard("Purifiers", "Predator X", 3, 2, {
    variant: 'RANGED',
    ambush: ev => {
      preyEv(ev, p => p.hand.count(Color.RANGED)),
      cloneVillainEv(ev);
    },
    finishThePrey: ev => pickDiscardEv(ev, 1, ev.who, ev.who.hand.has(Color.RANGED) ? Color.RANGED : isNonGrayHero),
  })],
// AMBUSH: <b>Prey</b> on the most [Strength]. {CLONE}.
// <b>Finish the Prey</b>: That player discards a [Strength] Hero. If they can't, they discard any non-grey Hero instead.
// ATTACK: 3
// VP: 2
  [ 1, makeVillainCard("Purifiers", "Predator X", 3, 2, {
    variant: 'STRENGTH',
    ambush: ev => {
      preyEv(ev, p => p.hand.count(Color.STRENGTH)),
      cloneVillainEv(ev);
    },
    finishThePrey: ev => pickDiscardEv(ev, 1, ev.who, ev.who.hand.has(Color.STRENGTH) ? Color.STRENGTH : isNonGrayHero),
  })],
// AMBUSH: <b>Prey</b> on the most [Tech]. {CLONE}.
// <b>Finish the Prey</b>: That player discards a [Tech] Hero. If they can't, they discard any non-grey Hero instead.
// ATTACK: 3
// VP: 2
  [ 1, makeVillainCard("Purifiers", "Predator X", 3, 2, {
    variant: 'TECH',
    ambush: ev => {
      preyEv(ev, p => p.hand.count(Color.TECH)),
      cloneVillainEv(ev);
    },
    finishThePrey: ev => pickDiscardEv(ev, 1, ev.who, ev.who.hand.has(Color.TECH) ? Color.TECH : isNonGrayHero),
  })],
// AMBUSH: <b>Prey</b> on the most X-Men + X-Force + X-Factor + Brotherhood
// <b>Finish the Prey</b>: That player gains a Wound and KOs two Bystanders from their Victory Pile.
// FIGHT: Shuffle two cards from the Bystander Stack into the Villain Deck.
// ATTACK: 4
// VP: 2
  [ 1, makeVillainCard("Purifiers", "Leper Queen", 4, 2, {
    ambush: ev => preyEv(ev, p => Array<Affiliation>("X-Men", "X-Force", "X-Factor", "Brotherhood").sum(team => p.hand.count(team))),
    finishThePrey: ev => {
      gainWoundEv(ev, ev.who);
      selectObjectsEv(ev, "Choose cards to KO", 2, ev.who.victory.limit(isBystander), c => KOEv(ev, c), ev.who);
    },
    fight: ev => repeat(2, () => cont(ev, () => gameState.bystanders.withTop(c => shuffleIntoEv(ev, c, gameState.villaindeck)))),
  })],
// AMBUSH: <b>Prey</b> on the most X-Men + X-Force + X-Factor + Brotherhood. Stryker captures on Sidekick from the Sidekick Stack and two Sidekicks from that player's hand and/or discard pile of their choice.
// <b>Finish the Prey</b>: KO the captured Sidekicks.
// FIGHT: Gain the captured Sidekicks.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Purifiers", "Reverend William Stryker", 5, 3, {
    ambush: ev => preyEv(ev, p => Array<Affiliation>("X-Men", "X-Force", "X-Factor", "Brotherhood").sum(team => p.hand.count(team)), p => {
      gameState.sidekick.withTop(c => attachCardEv(ev, c, ev.source, 'GAIN_CAPTURE'));
      selectObjectsEv(ev, "Choose two Sidekicks to capture", 2, handOrDiscard().limit(isSidekick), c => attachCardEv(ev, c, ev.source, 'GAIN_CAPTURE'));
    }),
    finishThePrey: ev => ev.source.attachedDeck('GAIN_CAPTURE').limit(isSidekick).each(c => KOEv(ev, c)),
    fight: ev => ev.source.attachedDeck('GAIN_CAPTURE').limit(isSidekick).each(c => gainEv(ev, c)),
  })],
// AMBUSH: <b>Prey</b> on the most X-Men + X-Force + X-Factor + Brotherhood. Cameron Hodge captures one of that player's non-grey Heroes of their choice.
// <b>Finish the Prey</b>: KO the captured Hero.
// FIGHT: Choose a player to gain the captured Hero.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("Purifiers", "Cameron Hodge", 6, 4, {
    ambush: ev => preyEv(ev, p => Array<Affiliation>("X-Men", "X-Force", "X-Factor", "Brotherhood").sum(team => p.hand.count(team)), p => {
      selectCardEv(ev, "Choose a hero to capture", playerState.hand.limit(isNonGrayHero), c => attachCardEv(ev, c, ev.source, 'GAIN_CAPTURE'));
    }),
    finishThePrey: ev => ev.source.attachedDeck('GAIN_CAPTURE').limit(isNonGrayHero).each(c => KOEv(ev, c)),
    fight: ev => ev.source.attachedDeck('GAIN_CAPTURE').limit(isNonGrayHero).each(c => gainEv(ev, c)),
  })],
]},
{ name: "Acolytes", cards: [
// You may pay 2 Recruit any number of times to {SHATTER} Unuscione.
// AMBUSH: Unuscione captures a Bystander.
// ATTACK: 8*
// VP: 4
  [ 2, makeVillainCard("Acolytes", "Unuscione", 8, 4, {
    ambush: ev => captureEv(ev, ev.source),
    cardActions: [(c, ev) => new Ev(ev, "EFFECT", { cost: { recruit: 2 }, func: ev => shatterEv(ev, ev.source)})],
  })],
// You may {SHATTER} Tempo any number of times. Each time you do this, draw one fewer card when you draw a new hand of cards at the end of this turn.
// FIGHT: Draw two cards.
// ATTACK: 16*
// VP: 2
  [ 2, makeVillainCard("Acolytes", "Tempo", 16, 2, {
    fight: ev => drawEv(ev, 2),
    cardActions: [(c, ev) => new Ev(ev, "EFFECT", { func: ev => { shatterEv(ev, ev.source); addEndDrawMod(-1); }})],
  })],
// You may pay 1 Recruit any number of times to {SHATTER} Frenzy. Each time you do, reveal the top card of the Hero Deck and put it on the bottom of that deck. If it's [Strength], gain a Wound. If it's [Instinct], the player on your right gains a Wound.
// FIGHT: KO one of your Heroes.
// ATTACK: 12*
// VP: 3
  [ 2, makeVillainCard("Acolytes", "Frenzy", 12, 3, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    cardActions: [(c, ev) => new Ev(ev, "EFFECT", { cost: { recruit: 1 }, func: ev => {
      shatterEv(ev, ev.source);
      revealHeroDeckEv(ev, 1, cards => {
        cards.has(Color.STRENGTH) && gainWoundEv(ev);
        cards.has(Color.INSTINCT) && gainWoundEv(ev, playerState.right);
      }, false, true);
    }})],
  })],
// You may pay 1 Recruit any number of times to {SHATTER} Random. Each time you do, reveal the top card of the Hero Deck and put it on the bottom of that deck.
// If it's [Covert], [Tech], or [Ranged], Random then gets +Attack equal to that card's cost.
// ESCAPE: Each player discards a card at random.
// ATTACK: 10*
// VP: 4
  [ 2, makeVillainCard("Acolytes", "Random", 10, 4, {
    escape: ev => eachPlayer(p => p.hand.withRandom(c => discardEv(ev, c))),
    cardActions: [(c, ev) => new Ev(ev, "EFFECT", { cost: { recruit: 1 }, func: ev => {
      shatterEv(ev, ev.source);
      revealHeroDeckEv(ev, 1, cards => cards.limit(Color.COVERT | Color.TECH | Color.RANGED).each(c => {
        addTurnMod('defense', c => c === ev.source, c.cost); // TODO It is worded as it should be permanent
      }), false, true);
    }})],
  })],
]},
{ name: "Clan Yashida", cards: [
// <b>Chivalrous Duel</b>
// AMBUSH: The Villain in the city worth the most VP captures a Bystander.
// ATTACK: 3*
// VP: 3
  [ 2, makeVillainCard("Clan Yashida", "Silver Samurai", 3, 3, {
    chivalrousDuel: true,
    ambush: ev => selectCardEv(ev, "Choose a villain to capture a bystander", cityVillains().highest(c => c.vp), c => captureEv(ev, c)),
  })],
// <b>Chivalrous Duel</b>
// FIGHT: Gain this as a Hero.
// ATTACK: 3*
// GAINABLE
// TEAM: Crime Syndicate
// CLASS: [Instinct]
// {POWER Instinct} Draw a card.
// ATTACK: 2
  [ 2, makeGainableCard(makeVillainCard("Clan Yashida", "Scarlet Samurai", 3, u, {
    chivalrousDuel: true,
  }), u, 2, Color.INSTINCT, "Crime Syndicate", "D", ev => superPower(Color.INSTINCT) && drawEv(ev))],
// <b>Chivalrous Duel</b>
// AMBUSH: Lord Shingen captures a Bystander. Bystanders held by Lord Shingen are “Samurai Bodyguards.” You can’t fight Lord Shingen while he has
// any Bodyguards. You can fight them as if they were 3 Attack Villains with “<b>Chivalrous Duel</b>. <b>Fight</b>: Rescue this as a Bystander.”
// ATTACK: 4*
// VP: 5
  [ 2, makeVillainCard("Clan Yashida", "Lord Shingen", 4, 5, {
    chivalrousDuel: true,
    fightCond: c => !c.captured.has(isBystander),
    ambush: ev => {
      captureEv(ev, ev.source);
      const isBodyguard = (c: Card) => c.location === ev.source.attachedDeck('CAPTURE') && isBystander(c);
      addStatSet('defense', isBodyguard, () => 3);
      addStatSet('chivalrousDuel', isBodyguard, () => true);
      addStatSet('isVillain', isBodyguard, () => true);
      addStatSet('fight', isBodyguard, () => ev => rescueEv(ev, ev.source));
    },
  })],
// <b>Chivalrous Duel</b>
// AMBUSH: Choose a Hero Name. You can't play Heroes this turn unless they are that Hero Name or grey Heroes.
// FIGHT: KO one of your Heroes.
// ATTACK: 5*
// VP: 4
  [ 2, makeVillainCard("Clan Yashida", "Gorgon", 5, 4, {
    chivalrousDuel: true,
    ambush: ev => {
      const names = owned(ev.who).limit(isHero).unique(c => c.heroName).map(n => ({l:n, v:n}));
      chooseOptionEv(ev, "Choose a Hero Name", names, n => forbidAction('PLAY', c => c.heroName !== n && !isColor(Color.GRAY)(c)));
    },
    fight: ev => {},
  })],
]},
]);
addVillainTemplates("Doctor Strange and the Shadows of Nightmare", [
{ name: "Lords of the Netherworld", cards: [
// AMBUSH: Mindless Ones capture the rightmost Hero in the HQ that costs 4 or less.
// FIGHT: Choose a player to make a {DEMONIC BARGAIN} with the Lords of the Netherworld to gain that Hero.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Lords of the Netherworld", "Mindless Ones", 4, 2, {
    // TODO city rightmost
    ambush: ev => hqHeroes().limit(c => c.cost <= 4).withLast(c => attachCardEv(ev, c, ev.source, 'GAIN_CAPTURE')),
    fight: ev => ev.source.attached('GAIN_CAPTURE').each(c => choosePlayerEv(ev, p => demonicBargain(ev, ev => gainEv(ev, c), p))),
  })],
// FIGHT: Choose a player to make a {DEMONIC BARGAIN} with Baron Mordo to draw two extra cards at the end of this turn.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Lords of the Netherworld", "Baron Mordo", 5, 3, {
    fight: ev => choosePlayerEv(ev, p => demonicBargain(ev, ev => p === playerState ? addEndDrawMod(2) : addTurnTrigger('CLEANUP', u, ev => drawEv(ev, 2, p)), p)),
  })],
// FIGHT: Choose a player to make a {DEMONIC BARGAIN} with Satana Hellstrom to rescue three Bystanders.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Lords of the Netherworld", "Satana Hellstrom", 5, 3, {
    fight: ev => choosePlayerEv(ev, p => demonicBargain(ev, ev => rescueByEv(ev, p, 3), p)),
  })],
// AMBUSH: Choose a player to make a {DEMONIC BARGAIN} with Satannish to reveal the top card of the Hero Deck and gain it if it costs 4 or less.
// FIGHT: Same effect, but cost 6 or less.
// ESCAPE: Same effect, but cost 2 or less.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("Lords of the Netherworld", "Satannish", 6, 4, {
    ambush: ev => choosePlayerEv(ev, p => demonicBargain(ev, ev => {
      revealHeroDeckEv(ev, 1, cards => cards.limit(c => c.cost <= 4).each(c => gainEv(ev, c)));
    }, p)),
    fight: ev => choosePlayerEv(ev, p => demonicBargain(ev, ev => {
      revealHeroDeckEv(ev, 1, cards => cards.limit(c => c.cost <= 6).each(c => gainEv(ev, c)));
    }, p)),
    escape: ev => choosePlayerEv(ev, p => demonicBargain(ev, ev => {
      revealHeroDeckEv(ev, 1, cards => cards.limit(c => c.cost <= 2).each(c => gainEv(ev, c)));
    }, p)),
  })],
// AMBUSH: Choose a player to make a {DEMONIC BARGAIN} with Umar to KO a Hero of their choice from the HQ.
// FIGHT: Choose a player to make a {DEMONIC BARGAIN} with Umar to gain a Hero of their choice that costs 6 or less from the KO pile.
// ESCAPE: Same effect, but cost 0.
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Lords of the Netherworld", "Umar", 7, 5, {
    ambush: ev => choosePlayerEv(ev, p => demonicBargain(ev, ev => selectCardEv(ev, "Choose a Hero to KO", hqHeroes(), c => KOEv(ev, c), p), p)),
    fight: ev => choosePlayerEv(ev, p => demonicBargain(ev, ev => selectCardEv(ev, "Choose a Hero to gain", gameState.ko.limit(isHero).limit(c => c.cost <= 6), c => gainEv(ev, c), p), p)),
    escape: ev => choosePlayerEv(ev, p => demonicBargain(ev, ev => selectCardEv(ev, "Choose a Hero to gain", gameState.ko.limit(isHero).limit(c => c.cost === 0), c => gainEv(ev, c), p), p)),
  })],
]},
{ name: "Fear Lords", cards: [
// FIGHT: Draw two cards. Then, if Dreamstalker was in the city, it enters the <b>Astral Plane</b>.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Fear Lords", "Dreamstalker", 5, 3, {
    fight: ev => {
      drawEv(ev, 2);
      ev.where.isCity && enterAstralPlaneEv(ev, ev.source);
    },
  })],
// FIGHT: KO one of your Heroes. Then, if Nox was in the city, she enters the <b>Astral Plane</b> and captures a Bystander.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Fear Lords", "Nox", 4, 2, {
    fight: ev => {
      selectCardAndKOEv(ev, yourHeroes());
      ev.where.isCity && enterAstralPlaneEv(ev, ev.source);
      ev.where.isCity && captureEv(ev, ev.source);
    },
  })],
// AMBUSH: D’Spayre enters the <b>Astral Plane</b> and captures a Bystander.
// FIGHT: KO a Hero. Then, if D’Spayre was in the Astral Plane, he enters the city, ignoring his Ambush ability.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Fear Lords", "D'Spayre", 5, 3, {
    ambush: ev => {
      if (ev.where !== gameState.astralPlane) {
        enterAstralPlaneEv(ev, ev.source);
        captureEv(ev, ev.source);
      }
    },
    fight: ev => {
      selectCardAndKOEv(ev, yourHeroes());
      ev.where === gameState.astralPlane && enterCityEv(ev, ev.source);
    },
  })],
// FIGHT: Reveal the top card of the Hero Deck. You may spend Recruit equal to that card’s cost to have the player of your choice gain that Hero. If you don’t, the Lurking Unknown enters the <b>Astral Plane</b> (even if it was already there).
// ESCAPE: Reveal the top card of the Hero Deck. Each player reveals their hand and KOs a Hero with that cost.
// ATTACK: 2
// VP: 3
  [ 2, makeVillainCard("Fear Lords", "The Lurking Unknown", 2, 3, {
    fight: ev => revealHeroDeckEv(ev, 1, cards => cards.limit(isHero).each(c => {
      turnState.recruit >= c.cost ? chooseOneEv(ev, "Spend Recruit to have a player gain this Hero?", 
        [ "Yes", () => { choosePlayerEv(ev, p => gainEv(ev, c, p)), turnState.recruit -= c.cost } ],
        [ "No", () => enterAstralPlaneEv(ev, ev.source) ]
      ) : enterAstralPlaneEv(ev, ev.source);
    })),
    escape: ev => revealHeroDeckEv(ev, 1, cards => cards.withFirst(c => {
      eachPlayer(p => selectCardAndKOEv(ev, p.hand.limit(isHero).limit(h => h.cost === c.cost), p)); // TODO multiplayer reveal
    }))
  })],
]},
]);
addVillainTemplates("Marvel Studios' Guardians of the Galaxy", [
{ name: "Followers of Ronan", cards: [
// Exolon Monks get +2 Attack while another Villain is <b>Commanding</b> the Followers of Ronan.
// FIGHT: KO one of your Heroes.
// ATTACK: 3+
// VP: 2
  [ 1, makeVillainCard("Followers of Ronan", "Exolon Monks", 3, 2, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: commandingVarDefense(0, 2),
  })],
// Exolon Attendants get +2 Attack while another Villain is <b>Commanding</b> the Followers of Ronan.
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Villain, it enters an empty city space.
// ATTACK: 3+
// VP: 2
  [ 1, makeVillainCard("Followers of Ronan", "Exolon Attendants", 3, 2, {
    ambush: ev => revealVillainDeckEv(ev, 1, cards => {
      cards.limit(isVillain).each(c => selectCardEv(ev, "Select empty city space", gameState.city.limit(isCityEmpty), d => enterCityEv(ev, c, d)));
    }),
    varDefense: commandingVarDefense(0, 2),
  })],
// Sakaaran Mercenaries get +2 Attack while another Villain is <b>Commanding</b> the Followers of Ronan.
// AMBUSH: If another Villain is <b>Commanding</b> the Followers of Ronan, each player gains a Wound.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Followers of Ronan", "Sakaaran Mercenaries", 4, 3, {
    ambush: ev => isCommanding(ev.source) || eachPlayer(p => gainWoundEv(ev, p)),
    varDefense: commandingVarDefense(0, 2),
  })],
// Korath gets +2 Attack while he <b>Commands</b> the Followers of Ronan.
// AMBUSH: Each player may draw a card. For each player that did, reveal a card from the Villain deck. Play a Followers of Ronan card from among the cards you revealed this way. Put the rest back in any order.
// FIGHT: Same effect.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Followers of Ronan", "Korath the Pursuer", 4, 3, {
    ambush: ev => {
      let n = 0;
      eachPlayer(p => chooseMayEv(ev, "Draw a card?", () => {
        drawEv(ev, 1, p);
        n++;
      }, p));
      cont(ev, () => n && revealVillainDeckEv(ev, n, cards => {
        selectCardEv(ev, "Choose a card to play", cards.limit(isVillain).limit(isGroup("Followers of Ronan")), c => villainDrawEv(ev, c));
      }));
    },
    fight: sameEffect,
    varDefense: commandingVarDefense(2),
  })],
// Nebula gets +2 Attack while she <b>Commands</b> the Followers of Ronan.
// AMBUSH: Nebula captures a {VILLAINOUS WEAPON} from another Villain in the city or captures an Artifact from a player's control as a {VILLAINOUS WEAPON}. If it doesn't already give a {VILLAINOUS WEAPON} bonus, it gives +2 Attack.
// FIGHT: Same effect.
// ATTACK: 4+
// VP: 4
  [ 1, makeVillainCard("Followers of Ronan", "Nebula", 4, 4, {
    ambush: ev => {
      const options = [...cityVillains().flatMap(v => v.attached('WEAPON')), ...gameState.players.flatMap(p => p.artifact.deck)];
      selectCardEv(ev, "Choose a weapon to capture", options, c => {
        if (!isVillainousWeapon(c)) {
          const thisCard = (c2: Card) => c2 === c;
          addStatSet('isVillainousWeapon', thisCard, () => true);
          addStatSet('defense', thisCard, () => 2);
        }
        attachCardEv(ev, c, ev.source, 'WEAPON');
      });
    },
    varDefense: commandingVarDefense(2),
  })],
// {VILLAINOUS WEAPON}
// AMBUSH: If Korath is in the city, he captures this.
// GAINABLE
// <b>Triggered Artifact</b> - Whenever you play a card that costs 6 or more, you get +1 Attack.
// ATTACK: +3
// FLAVOR: Art contains a gun.
  [ 1, makeGainableCard(makeVillainousWeaponCard("Followers of Ronan", "Korath's Disrupter Rifle", 3, {
    ambush: ev => cityVillains().limit(c => c.cardName === "Korath the Pursuer").firstOnly().each(c => attachCardEv(ev, ev.source, c, 'WEAPON')),
  }), u, u, Color.GRAY, u, "G", ev => addAttackEvent(ev, 1), triggeredArifact('PLAY', ev => ev.what.cost >= 6))],
// {VILLAINOUS WEAPON}
// AMBUSH: If a Follower of Ronan captures this, each player gains a Wound.
// GAINABLE
// <b>Triggered Artifact</b> - Whenever you defeat a Villain, you get +1 Recruit.
// ATTACK: +4
  [ 1, makeGainableCard(makeVillainousWeaponCard("Followers of Ronan", "\"The Dark Aster\" Flagship", 4, {
    ambush: ev => ev.where?.has(isGroup("Followers of Ronan")) && eachPlayer(p => gainWoundEv(ev, p)),
  }), u, u, Color.GRAY, u, "", ev => addRecruitEvent(ev, 1), triggeredArifact('DEFEAT', ev => isVillain(ev.what)))],
// {VILLAINOUS WEAPON}
// AMBUSH: Put all Heroes from the HQ on the bottom of the Hero Deck.
// GAINABLE
// <b>Triggered Artifact</b> - When you fight the Mastermind, take another turn after this one. Don't play a card from the Villain Deck at the start of that turn. This ability can only be used once per game.
// ATTACK: +6
  [ 1, makeGainableCard(makeVillainousWeaponCard("Followers of Ronan", "The Orb", 6, {
    ambush: ev => hqHeroes().each(c => moveCardEv(ev, c, gameState.herodeck, true)),
  }), u, u, Color.GRAY, u, "", ev => {
    // This is Kang the Conqueror's tactic ability
    if (!incPerGame('extra-turn', ev.source)) {
      addFutureTrigger(ev => turnState.villainCardsToPlay > 0 && turnState.villainCardsToPlay--);
      gameState.extraTurn = true;
    }
}, triggeredArifact('FIGHT', ev => isMastermind(ev.what)))],
]},
{ name: "Ravagers", cards: [
// Gef gets +2 Attack while he <b>Commands</b> the Ravagers.
// AMBUSH: Swap Gef with the leftmost Ravager in the city.
// '<i>Fight<b>: If Gef was </b></i><b>Commanding</b> the Ravagers, draw a card.
// ATTACK: 3+
// VP: 3
  [ 1, makeVillainCard("Ravagers", "Gef", 3, 3, {
    ambush: ev => cityVillains().filter(c => isGroup("Ravagers")(c) && c !== ev.source).withFirst(c => swapCardsEv(ev, ev.source, c)),
    fight: ev => wasCommanding(ev) && drawEv(ev),
    varDefense: commandingVarDefense(2),
  })],
// Tullik gets +2 Attack while he <b>Commands</b> the Ravagers.
// AMBUSH: Swap Tullik with the leftmost Ravager in the city.
// '<i>Fight<b>: If Tullik was </b></i><b>Commanding</b> the Ravagers, KO one of your Heroes.
// ATTACK: 3+
// VP: 3
  [ 1, makeVillainCard("Ravagers", "Tullik", 3, 3, {
    ambush: ev => cityVillains().filter(c => isGroup("Ravagers")(c) && c !== ev.source).withFirst(c => swapCardsEv(ev, ev.source, c)),
    fight: ev => wasCommanding(ev) && selectCardAndKOEv(ev, yourHeroes()),
    varDefense: commandingVarDefense(2),
  })],
// Kraglin gets +2 Attack while he <b>Commands</b> the Ravagers.
// AMBUSH: Swap Kraglin with the leftmost Ravager in the city.
// '<i>Fight<b>: If Kraglin was </b></i><b>Commanding</b> the Ravagers, draw two cards.
// ATTACK: 4+
// VP: 4
  [ 1, makeVillainCard("Ravagers", "Kraglin Obfonteri", 4, 4, {
    ambush: ev => cityVillains().filter(c => isGroup("Ravagers")(c) && c !== ev.source).withFirst(c => swapCardsEv(ev, ev.source, c)),
    fight: ev => wasCommanding(ev) && drawEv(ev, 2),
    varDefense: commandingVarDefense(2),
  })],
// Taserface gets +2 Attack while he <b>Commands</b> the Ravagers.
// AMBUSH: Swap Taserface with the leftmost Ravager in the city.
// '<i>Fight<b>: If Taserface was </b></i><b>Commanding</b> the Ravagers, you get +2 Recruit.
// ATTACK: 4+
// VP: 4
  [ 1, makeVillainCard("Ravagers", "Taserface", 4, 4, {
    ambush: ev => cityVillains().filter(c => isGroup("Ravagers")(c) && c !== ev.source).withFirst(c => swapCardsEv(ev, ev.source, c)),
    fight: ev => wasCommanding(ev) && addRecruitEvent(ev, 2),
    varDefense: commandingVarDefense(2),
  })],
// Yondu gets +2 Attack while he <b>Commands</b> the Ravagers.
// AMBUSH: Swap Yondu with the leftmost Ravager in the city.
// '<i>Fight<b>: If Yondu was </b></i><b>Commanding</b> the Ravagers, KO up to two of your Heroes.
// ATTACK: 5+
// VP: 5
  [ 1, makeVillainCard("Ravagers", "Yondu Udonta", 5, 5, {
    ambush: ev => cityVillains().filter(isGroup("Ravagers")).withFirst(c => c !== ev.source && swapCardsEv(ev, ev.source, c)),
    fight: ev => wasCommanding(ev) && selectObjectsUpToEv(ev, "Choose cards to KO", 2, yourHeroes(), c => KOEv(ev, c)),
    varDefense: commandingVarDefense(2),
  })],
// {VILLAINOUS WEAPON}
// AMBUSH: Play another card from the Villain Deck.
// GAINABLE
// <b>Triggered Artifact</b> - When you play a [Strength] or [Instinct] card, you may get +2 Attack. If you do, shuffle this into the Villain Deck.
// ATTACK: +2
  [ 1, makeGainableCard(makeVillainousWeaponCard("Ravagers", "Scavanged Blade", 2, {
    ambush: ev =>  playAnotherEv(ev),
  }), u, u, Color.GRAY, u, "D", ev => chooseMayEv(ev, "Get +2 Attack?", () => {
    addAttackEvent(ev, 2);
    isCopy(ev.source) || shuffleIntoEv(ev, ev.source, gameState.villaindeck);
  }), triggeredArifact('PLAY', ev => isColor(Color.STRENGTH | Color.INSTINCT)(ev.what)))],
// {VILLAINOUS WEAPON}
// AMBUSH: If a Ravager captures this, that Ravager swaps spaces with the leftmost Ravager in the city.
// GAINABLE
// <b>Triggered Artifact</b> - Whenever you play a [Tech] card, you get +1 Attack.
// ATTACK: +3
  [ 1, makeGainableCard(makeVillainousWeaponCard("Ravagers", "Ravager Starship \"Eclector\"", 3, {
    ambush: ev => ev.where && ev.where.limit(isGroup("Ravagers")).withFirst(c2 => cityVillains().filter(c => isGroup("Ravagers")(c) && c !== c2).withFirst(c => swapCardsEv(ev, c2, c))),
  }), u, u, Color.GRAY, u, "", ev => addAttackEvent(ev, 1), triggeredArifact('PLAY', ev => isColor(Color.TECH)(ev.what)))],
// {VILLAINOUS WEAPON}
// AMBUSH: If Yondu is in the city, he captures this. If he is in any player's Victory Pile, he enters an empty city space, then ca[tures this.
// GAINABLE
// <b>Triggered Artifact</b> - Whenever you play a [Covert] or [Ranged] card, you get +1 Attack.
// ATTACK: +4
  [ 1, makeGainableCard(makeVillainousWeaponCard("Ravagers", "Yaka Arrow", 4, {
    ambush: ev => {
      gameState.players.flatMap(p => p.victory.limit(c => c.cardName === "Yondu Udonta")).withFirst(c => {
        selectCardEv(ev, "Select empty city space", gameState.city.limit(isCityEmpty), d => enterCityEv(ev, c, d))
      });
      cont(ev, () => cityVillains().limit(c => c.cardName === "Yondu Udonta").withFirst(c => attachCardEv(ev, ev.source, c, 'WEAPON')));
    },
  }), u, u, Color.GRAY, u, "", ev => addAttackEvent(ev, 1), triggeredArifact('PLAY', ev => isColor(Color.COVERT | Color.RANGED)(ev.what)))],
]},
]);
addVillainTemplates("Black Panther", [
{ name: "Killmonger's League", cards: [
// AMBUSH: Each player reveals a [Instinct] Hero or gains a Wound that was on a Mastermind or Villain.
// While Preyy has more than 0 Attack, you cannot fight him. Instead, you may spend Attack equal to his Attack to Wound him and draw a card.
// ATTACK: 3*
// VP: 2
  [ 2, makeVillainCard("Killmonger's League", "Preyy", 3, 2, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => {
      selectCardEv(ev, "Choose a Wound to gain", fightableCards().limit(isEnemy).flatMap(c => c.attached('WOUND')), c => gainEv(ev, c, p), p);
    }, p)),
    fightCond: c => c.defense <= 0,
    cardActions: [payToWoundEv(ev => drawEv(ev))]
  })],
// AMBUSH: Return a Wound from the Mastermind and from each Villain to the Wound Stack.
// While Malice has more than 0 Attack, you cannot fight her. Instead, you may spend Attack equal to her Attack to Wound her and rescue a Bystander.
// ATTACK: 4*
// VP: 2
  [ 2, makeVillainCard("Killmonger's League", "Malice", 4, 2, {
    ambush: ev => {
      selectCardEv(ev, "Choose a Wound to return", fightableCards().limit(isEnemy).flatMap(c => c.attached('WOUND')), c => returnToStackEv(ev, gameState.wounds, c));
    },
    fightCond: c => c.defense <= 0,
    cardActions: [payToWoundEv(ev => rescueEv(ev))],
  })],
// AMBUSH: A Villain from your Victory Pile enters the city. Wound that Villain. Then Wound Baron Macabre a number of times equal to that Villain's VP.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Killmonger's League", "Baron Macabre", 5, 3, {
    ambush: ev => {
      selectCardEv(ev, "Choose a Villain to enter the city", playerState.victory.limit(isVillain), c => {
        enterCityEv(ev, c);
        woundEnemyEv(ev, c);
        woundEnemyEv(ev, ev.source, c.vp);
      });
    },
  })],
// AMBUSH: Wound Venomm. Each player may discard a card to Wound Venomm again.
// ESCAPE: Choose which players gain each of Venomm's Wounds, dividing them as evenly as possible.
// ATTACK: 9
// VP: 4
  [ 2, makeVillainCard("Killmonger's League", "Venomm", 9, 4, {
    ambush: ev => {
      woundEnemyEv(ev, ev.source);
      eachPlayer(p => chooseMayEv(ev, "Discard a card to Wound Venomm?", () => {
        pickDiscardEv(ev, 1, p);
        woundEnemyEv(ev, ev.source);
      }, p));
    },
    escape: ev => {
      const wounds = ev.source.attached('WOUND');
      distributeEvenlyEv(ev, c => `Choose a player to gain ${c.cardName}`, wounds, gameState.players, (c, p) => gainEv(ev, c, p));
    },
  })],
]},
{ name: "Enemies of Wakanda", cards: [
// <b>Empowered</b> by [Tech].
// FIGHT: You get +1 Recruit for each [Tech] Hero in the HQ.
// ATTACK: 3+
// VP: 2
// FLAVOR: A brilliant physicist and biochemist, Nightshade has created a cast array of advanced weaponry and experimental serums.
  [ 2, makeVillainCard("Enemies of Wakanda", "Nightshade", 3, 2, {
    fight: ev => addRecruitEvent(ev, hqHeroes().count(Color.TECH)),
    varDefense: stableEmpowerVarDefense.get(Color.TECH),
  })],
// <b>Empowered</b> by [Strength].
// FIGHT: KO one of your Heroes.
// ATTACK: 4+
// VP: 3
// FLAVOR: Infusing himself with vast amounts of raw Vibranium, Jakarra's blood flows with pure power.
  [ 2, makeVillainCard("Enemies of Wakanda", "Jakarra", 4, 3, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: stableEmpowerVarDefense.get(Color.STRENGTH),
  })],
// <b>Empowered</b> by [Ranged].
// AMBUSH: Put a Hero from the HQ that isn't <b>Empowering</b> any Enemies of Wakanda on the bottom of the Hero Deck.
// FIGHT: Same effect. <i>[Tetu isn't in the city.]</i>
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Enemies of Wakanda", "Tetu", 4, 3, {
    ambush: ev => hqHeroes().limit(c => !isColor(empoweringVillainGroup(ev.source.villainGroup))).each(c => moveCardEv(ev, c, gameState.herodeck, true)),
    fight: sameEffect,
    varDefense: stableEmpowerVarDefense.get(Color.RANGED),
  })],
// <b>Empowered</b> by [Instinct].
// AMBUSH: Zenzi captures a Bystander for each [Instinct] Hero in the HQ.
// ATTACK: 5+
// VP: 4
// FLAVOR: With wide-ranging empathic powers, Zenzi rallies thousands to her cause.
  [ 1, makeVillainCard("Enemies of Wakanda", "Zenzi", 5, 4, {
    ambush: ev => captureEv(ev, ev.source, hqHeroes().count(Color.INSTINCT)),
    varDefense: stableEmpowerVarDefense.get(Color.INSTINCT),
  })],
// <b>Empowered</b> by [Covert].
// ESCAPE: Reverend Achebe becomes a Scheme Twist that takes effect immediately.
// ATTACK: 6+
// VP: 5
// FLAVOR: An insane genius, schemer, and ventriloquist, Achebe works to turn Wakanda against Black Panther.
  [ 1, makeVillainCard("Enemies of Wakanda", "Reverend Achebe", 6, 5, {
    escape: ev => playTwistEv(ev, ev.source),
    varDefense: stableEmpowerVarDefense.get(Color.COVERT),
  })],
]},
]);
addVillainTemplates("Black Widow", [
{ name: "Taskmaster's Thunderbolts", cards: [
// AMBUSH: Jester captures a Bystander.
// FIGHT: Reveal the top four cards of the Villain Deck. Play all the Henchmen you find. Put the rest back in any order.
// ATTACK: 2
// VP: 2
  [ 2, makeVillainCard("Taskmaster's Thunderbolts", "Jester", 2, 2, {
    ambush: ev => captureEv(ev, ev.source),
    fight: ev => revealVillainDeckEv(ev, 4, cards => {
      chooseOrderEv(ev, "Choose order to play Henchmen", cards.filter(isHenchman), c => villainDrawEv(ev, c));
    }),
  })],
// AMBUSH: Choose a Henchman from a player's Victory Pile to enter the city.
// ATTACK: 3
// VP: 2
// FLAVOR: Get in her way and you'll be the one getting played.
  [ 2, makeVillainCard("Taskmaster's Thunderbolts", "Joystick", 3, 2, {
    ambush: ev => selectCardEv(ev, "Choose a Henchman to enter the city", gameState.players.flatMap(p => p.victory.limit(isHenchman)), c => enterCityEv(ev, c)),
  })],
// FIGHT: Choose a Henchman from any player's Victory Pile to enter the city.
// ESCAPE: Each player with fewer than two Henchmen in their Victory Pile gains a Wound.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Taskmaster's Thunderbolts", "Jack O'Lantern", 4, 2, {
    fight: ev => selectCardEv(ev, "Choose a Henchman to enter the city", gameState.players.flatMap(p => p.victory.limit(isHenchman)), c => enterCityEv(ev, c)),
    escape: ev => eachPlayer(p => p.victory.count(isHenchman) < 2 && gainWoundEv(ev, p)),
  })],
// AMBUSH: Choose Recruit or Attack, then reveal the top card of the Hero Deck. If it has that icon, Bullseye captures it and gets +Attack equal to that Hero's cost.
// FIGHT: The player of your chose gains the captured Hero.
// ESCAPE: KO that Hero.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Taskmaster's Thunderbolts", "Bullseye", 4, 3, {
    ambush: ev => chooseOptionEv(ev, "Choose an icon", [ {l: "Recruit", v: hasRecruitIcon}, {l: "Attack", v: hasAttackIcon}], f => revealHeroDeckEv(ev, 1, cards => cards.limit(f).each(c => {
      attachCardEv(ev, c, ev.source, 'BULLSEYE_CAPTURE');
    }))),
    fight: ev => ev.source.attached('BULLSEYE_CAPTURE').each(c => gainEv(ev, c)),
    escape: ev => ev.source.attached('BULLSEYE_CAPTURE').each(c => KOEv(ev, c)),
    varDefense: c => c.printedDefense + c.attached('BULLSEYE_CAPTURE').sum(c => c.cost),
  })],
]},
{ name: "Elite Assassins", cards: [
// {DARK MEMORIES}
// AMBUSH: Each player reveals a [Ranged] Hero or gains a Wound.
// FIGHT: You may send a Herofro your discard pile {UNDERCOVER}.
// ATTACK: 3+
// VP: 2
  [ 2, makeVillainCard("Elite Assassins", "Blue Talon", 3, 2, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p)),
    fight: ev => selectCardOptEv(ev, "Choose a Hero to send Undercover", playerState.discard.limit(isHero), c => sendUndercoverEv(ev, c)),
    varDefense: darkMemoriesVarDefense()
  })],
// {DARK MEMORIES}
// AMBUSH: Each player must send one of their non-grey Heroes {UNDERCOVER}.
// FIGHT: Each player may <b>Unleash</b> one of their Heroes from {UNDERCOVER}.
// ATTACK: 4+
// VP: 2
  [ 2, makeVillainCard("Elite Assassins", "Iron Maiden", 4, 2, {
    ambush: ev => eachPlayer(p => selectCardEv(ev, "Choose a Hero to send Undercover", yourHeroes(p).limit(isNonGrayHero), c => sendUndercoverEv(ev, c), p)),
    fight: ev => eachPlayer(p => unleashFromUndercoverEv(ev, () => true, p)),
    varDefense: darkMemoriesVarDefense()
  })],
// AMBUSH: Each player discards a non-grey Hero. Then each player draws a card.
// FIGHT: You may send one of your Heroes {UNDERCOVER}.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Elite Assassins", "Snapdragon", 4, 2, {
    ambush: ev => {
      eachPlayer(p => selectCardEv(ev, "Choose a Hero to discard", p.hand.limit(isNonGrayHero), c => discardEv(ev, c), p));
      eachPlayer(p => drawEv(ev, 1, p));
    },
    fight: ev => selectCardOptEv(ev, "Choose a Hero to send Undercover", yourHeroes(), c => sendUndercoverEv(ev, c)),
  })],
// AMBUSH: Each player discards a card that costs 0.
// FIGHT: You get +3 Recruit.
// ATTACK: 6
// VP: 3
  [ 2, makeVillainCard("Elite Assassins", "Black Lotus", 6, 3, {
    ambush: ev => eachPlayer(p => selectCardEv(ev, "Choose a card to discard", p.hand.limit(c => c.cost === 0), c => discardEv(ev, c), p)),
    fight: ev => addRecruitEvent(ev, 3),
  })],
]},
]);
addVillainTemplates("Marvel Studios The Infinity Saga", [
{ name: "Children of Thanos", cards: [
// <b>Endgame: +3</b> Attack
// AMBUSH: It is the Endgame this turn. If it was already the Endgame, each player reveals a [Instinct] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 7+
// VP: 5
  [ 1, makeVillainCard("Children of Thanos", "Proxima Midnight", 7, 5, {
    ambush: ev => {
      isEndgame(ev.source) && eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainWoundEv(ev, p), p));
      addTurnSet('isEndgame', () => true, () => true);
    },
    escape: sameEffect,
    varDefense: endgameVarDefense(3),
  })],
// <b>Endgame: +3</b> Attack
// AMBUSH: It is the Endgame this turn. If it was already the Endgame, each player Kos a Bystander from their Victory Pile or gains a Wound.
// ATTACK: 6+
// VP: 5
  [ 1, makeVillainCard("Children of Thanos", "Corvus Glaive", 6, 5, {
    ambush: ev => {
      isEndgame(ev.source) && eachPlayer(p => selectCardOrEv(ev, "Choose a Bystander to KO", p.victory.limit(isBystander), c => KOEv(ev, c), () => gainWoundEv(ev, p), p));
      addTurnSet('isEndgame', () => true, () => true);
    },
    varDefense: endgameVarDefense(3),
  })],
// <b>Endgame: +3</b> Attack
// AMBUSH: It is the Endgame this turn. If it was already the Endgame, each player reveals a Hero that costs 6 or more or gains a Wound.
// ATTACK: 6+
// VP: 5
  [ 1, makeVillainCard("Children of Thanos", "Cull Obsidian", 6, 5, {
    ambush: ev => {
      isEndgame(ev.source) && eachPlayer(p => revealOrEv(ev, c => c.cost >= 6, () => gainWoundEv(ev, p), p));
      addTurnSet('isEndgame', () => true, () => true);
    },
    varDefense: endgameVarDefense(3),
  })],
// <b>Endgame: +2</b> Attack
// AMBUSH: Chitauri Gorilla captures a Bystander.
// ATTACK: 5+
// VP: 4
  [ 1, makeVillainCard("Children of Thanos", "Chitauri Gorilla", 5, 4, {
    ambush: ev => captureEv(ev, ev.source),
    varDefense: endgameVarDefense(2),
  })],
// <b>Endgame: +2</b> Attack
// FIGHT: KO one of your Heroes. Then choose any number of Heroes from the HQ. Put them on the bottom of the Hero Deck.
// ATTACK: 5+
// VP: 4
  [ 1, makeVillainCard("Children of Thanos", "Outrider Threshers", 5, 4, {
    fight: ev => {
      selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c));
      selectObjectsAnyEv(ev, "Choose Heroes to put on the bottom of the Hero Deck", hqHeroes(), c => moveCardEv(ev, c, gameState.herodeck, true));
    },
    varDefense: endgameVarDefense(2),
  })],
// <b>Endgame: +2</b> Attack
// FIGHT: KO one of your Heroes. Then reveal the top card of the Villain Deck. If it's a Children of Thanos Villain, Endless Armies of Chitauri renenters the Sewers.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Children of Thanos", "Endless Armies of Chitauri", 4, 3, {
    fight: ev => {
      selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c));
      revealVillainDeckEv(ev, 1, cards => {
        cards.has(isGroup("Children of Thanos")) && enterSewersEv(ev, ev.source);
      });
    },
    varDefense: endgameVarDefense(2),
  })],
// <b>Endgame: +2</b> Attack
// FIGHT: You may KO a card from your discard pile.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Children of Thanos", "Outriders", 4, 3, {
    fight: ev => selectCardOptEv(ev, "Choose a card to KO", playerState.discard.deck, c => KOEv(ev, c)),
    varDefense: endgameVarDefense(2),
  })],
// <b>Endgame: +2</b> Attack
// AMBUSH: A Villain worth 2VP, 3VP, or 4VP from any player's Victory pile enters the city.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Children of Thanos", "Outrider Dropship", 4, 3, {
    ambush: ev => selectCardEv(ev, "Choose a Villain to enter the city", gameState.players.flatMap(p => p.victory.limit(c => [2, 3, 4].includes(c.vp))), c => enterCityEv(ev, c)),
    varDefense: endgameVarDefense(2),
  })],
]},
{ name: "Infinity Stones", cards: [
// The Power Stone gets +1 Attack for each other Infinity Stone in the city and/or Escape Pile.
// AMBUSH: Each player without an Infinity Stone in their Victory Pile gains a Wound.
// FIGHT: KO one of your Heroes. Then KO a Wound from your hand or discard pile.
// ATTACK: 6+
// VP: 5
  [ 1, makeVillainCard("Infinity Stones", "The Power Stone", 6, 5, {
    ambush: ev => eachPlayer(p => p.victory.has(isGroup("Infinity Stones")) || gainWoundEv(ev, p)),
    fight: ev => {
      selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c));
      selectCardEv(ev, "Choose a Wound to KO", handOrDiscard().limit(isWound), c => KOEv(ev, c));
    },
    varDefense: c => c.printedDefense + [...cityVillains(), ...gameState.escaped.limit(isVillain)].count(isGroup("Infinity Stones")),
  })],
// The Space Stone gets +1 Attack for each empty space in the city.
// AMBUSH: The Space Stone captures three Bystanders. Then move an Infinity Stone from any city space to the Bridge. If there's already a Villain there, swap them.
// FIGHT: Move and/or swap any number of Villains to other city spaces.
// ATTACK: 5+
// VP: 5
  [ 1, makeVillainCard("Infinity Stones", "The Space Stone", 5, 5, {
    ambush: ev => {
      captureEv(ev, ev.source, 3);
      withCity('BRIDGE', bridge => {
        selectCardEv(ev, "Choose an Infinity Stone to move", cityVillains().filter(isGroup("Infinity Stones")), c => swapCardsEv(ev, c, bridge));
      });
    },
    fight: ev => {
      const f = () => selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), c => {
        selectCardEv(ev, "Choose a city space to move to", gameState.city, d => {
          swapCardsEv(ev, c, d);
          f();
        });
      });
      f();
    },
    varDefense: c => c.printedDefense + gameState.city.count(isCityEmpty),
  })],
// The Reality Stone gets +1 Attack for each Master Strike in the KO pile and/or stacked next to the Mastermind.
// AMBUSH: Reveal the top three cards of the villain Deck. Play a Master strike from among them. Put the rest back in any order.
// FIGHT: Same effect, but KO the Master Strike instead of playing it. Then, whether you KO or not, put a card from the Bystander Deck on top of the Villain Deck.
// ATTACK: 5+
// VP: 5
  [ 1, makeVillainCard("Infinity Stones", "The Reality Stone", 5, 5, {
    ambush: ev => revealVillainDeckEv(ev, 3, cards => {
      cards.limit(isStrike).withFirst(c => villainDrawEv(ev, c));
    }, false),
    fight: ev => revealVillainDeckEv(ev, 3, cards => {
      cards.limit(isStrike).withFirst(c => KOEv(ev, c));
      cont(ev, () => gameState.bystanders.withTop(c => moveCardEv(ev, c, gameState.villaindeck)));
    }, false),
    varDefense: c => c.printedDefense + gameState.ko.count(isStrike) + gameState.mastermind.attached('STRIKE').size,
  })],
// The Soul Stone gets +1 Attack for each other Villain in the city.
// AMBUSH: Each player without an Infinity Stone in their Victory Pile KOs a non0grey Hero from their discard pile.
// FIGHT: Reveal the top two cards of your deck. KO one of them and draw the other.
// ATTACK: 5+
// VP: 5
  [ 1, makeVillainCard("Infinity Stones", "The Soul Stone", 5, 5, {
    ambush: ev => eachPlayer(p => p.victory.has(isGroup("Infinity Stones")) || selectCardEv(ev, "Choose a Hero to KO", p.discard.limit(isNonGrayHero), c => KOEv(ev, c), p)),
    fight: ev => revealPlayerDeckEv(ev, 2, cards => selectCardEv(ev, "Choose a card to KO", cards, c => {
      KOEv(ev, c);
      cards.filter(c2 => c !== c2).each(c2 => drawCardEv(ev, c2));
    })),
    varDefense: c => c.printedDefense + cityVillains().count(c1 => c !== c1),
  })],
// <b>Endgame: +4</b> Attack
// AMBUSH: Play another card from the Villain Deck.
// FIGHT: Take another turn after this one. Don't play a card from the Villain Deck at the start of that turn.
// ATTACK: 5+
// VP: 5
  [ 1, makeVillainCard("Infinity Stones", "The Time Stone", 5, 5, {
    ambush: ev => playAnotherEv(ev),
    fight: ev => {
      addFutureTrigger(ev => turnState.villainCardsToPlay > 0 && turnState.villainCardsToPlay--);
      gameState.extraTurn = true;
    },
    varDefense: endgameVarDefense(4),
  })],
// The Mind Stone gets +Attack equal to the highest cost of Hero in the HQ.
// AMBUSH: All Heroes currently in the HQ cost 2 more this turn.
// FIGHT: Gain a Hero form the HQ.
// ATTACK: 1+
// VP: 5
  [ 1, makeVillainCard("Infinity Stones", "The Mind Stone", 1, 5, {
    ambush: ev => hqHeroes().each(c => addTurnMod('cost', c1 => c1 === c, 2)),
    fight: ev => selectCardEv(ev, "Choose a Hero to gain", hqHeroes(), c => gainEv(ev, c)),
    varDefense: c => c.printedDefense + hqHeroes().max(c => c.cost),
  })],
// AMBUSH: If the Soul Stone is in the city or Escape Pile, each player discards a card. If it's in a player's Victory Pile, that player draws two cards.
// FIGHT: Each player KOs one their Heroes.
// (This card counts as "an Infinity Stone.")
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Infinity Stones", "Stonekeeper", 5, 3, {
    ambush: ev => {
      [...cityVillains(), ...gameState.escaped.deck].has(c => c.cardName === "The Soul Stone") && eachPlayer(p => pickDiscardEv(ev, 1, p));
      eachPlayer(p => p.victory.has(c => c.cardName === "The Soul Stone") && drawEv(ev, 2, p));
    },
    fight: ev => eachPlayer(p => selectCardEv(ev, "Choose a Hero to KO", yourHeroes(p), c => KOEv(ev, c), p)),
  })],
// AMBUSH: Nebula captures a Hero from the Officer Deck or HQ that costs 4 or less.
// FIGHT: Either KO that Hero or choose a player to gain it.
// (This card counts as "an Infinity Stone.")
// ATTACK: 4
// VP: 2
  [ 1, makeVillainCard("Infinity Stones", "Nebula, Stone Seeker", 4, 2, {
    ambush: ev => selectCardEv(ev, "Choose a Hero to capture", [gameState.officer.top, ...hqHeroes().limit(c => c.cost <= 4)], c => attachCardEv(ev, c, ev.source, 'NEBULA_CAPTURE')),
    fight: ev => {
      ev.source.attached('NEBULA_CAPTURE').each(c => selectCardOptEv(ev, "Choose a player to gain the captured Hero", gameState.players, p => gainEv(ev, c, p), () => KOEv(ev, c)));
    },
  })],
]},
]);
addVillainTemplates("Midnight Sons", [
{ name: "Fallen", cards: [
// AMBUSH: <b>Haunt</b> the leftmost unhaunted Hero in the HQ.
// FIGHT: Rescue a Bystander.
// ATTACK: 3
// VP: 2
  [ 2, makeVillainCard("Fallen", "Atrocity", 3, 2, {
    ambush: ev => selectCardEv(ev, "Choose a Hero to haunt", unhauntedHQHeroes().firstOnly(), c => hauntEv(ev, c)),
    fight: ev => rescueEv(ev),
  })],
// AMBUSH: <b>Haunt</b> an unhaunted Hero in the HQ that costs 3 or less.
// FIGHT: Reveal the top card of your deck. If it costs 3 or less, draw it.
// ATTACK: 4
// VP: 3
  [ 3, makeVillainCard("Fallen", "Patriarch", 4, 3, {
    ambush: ev => selectCardEv(ev, "Choose a Hero to haunt", unhauntedHQHeroes().limit(c => c.cost <= 3), c => hauntEv(ev, c)),
    fight: ev => drawIfEv(ev, c => c.cost <= 3),
  })],
// {BLOOD FRENZY}
// AMBUSH: <b>Haunt</b> the rightmost unhaunted Hero in the HQ.
// FIGHT: KO one of your Heroes.
// ATTACK: 3+
// VP: 4
  [ 2, makeVillainCard("Fallen", "Metarchus", 3, 4, {
    ambush: ev => selectCardEv(ev, "Choose a Hero to haunt", unhauntedHQHeroes().lastOnly(), c => hauntEv(ev, c)),
    fight: ev => selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c)),
    varDefense: bloodFrenzyVarDefense(),
  })],
// {BLOOD FRENZY}
// FIGHT: KO up to two cards from your discard pile.
// ESCAPE: Salomé ascends to become an additional Mastermind. She gains the ability "<b>Master Strike</b>: Each player discards a Marvel Knights Hero or gains a Wound."
// ATTACK: 6+
// VP: 5
  [ 1, makeVillainCard("Fallen", "Salomé, Sorceress Supreme", 6, 5, {
    fight: ev => selectObjectsEv(ev, "Choose cards to KO", 2, playerState.discard.deck, c => KOEv(ev, c)),
    escape: ascendToMastermind,
    varDefense: bloodFrenzyVarDefense(),
    strike: ev => eachPlayer(p => selectCardOrEv(ev, "Choose a Hero to discard", p.hand.limit("Marvel Knights"), c => discardEv(ev, c), () => gainWoundEv(ev, p), p)),
  })],
]},
{ name: "Lilin", cards: [
// AMBUSH: <b>Hunt for Victims.</b> Then each player reveals a random card from their hand. If that card costs less than the number of Bystanders in the KO pile,
// that player discards that card.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Lilin", "Outcast", 4, 2, {
    ambush: ev => {
      huntForVictimsEv(ev);
      cont(ev, () => eachPlayer(p => {
        p.hand.withRandom(c => (c.cost < gameState.ko.count(isBystander)) && discardEv(ev, c));
      }));
    },
  })],
// Meatmarket gets +1 Attack for each Bystander in the KO pile.
// AMBUSH: <b>Hunt for Victims</b>
// FIGHT: You may KO a card from your discard pile.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("Lilin", "Meatmarket", 3, 3, {
    ambush: ev => huntForVictimsEv(ev),
    fight: ev => selectCardOptEv(ev, "Choose a card to KO", playerState.discard.deck, c => KOEv(ev, c)),
  })],
// Skinner gets +2 Attack if there are at least four Bystanders in the KO pile.
// AMBUSH: <b>Hunt for Victims</b>
// FIGHT: KO one of your Heroes.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("Lilin", "Skinner", 5, 4, {
    ambush: ev => huntForVictimsEv(ev),
    fight: ev => selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c)),
    varDefense: c => c.printedDefense + (gameState.ko.count(isBystander) >= 4 ? 2 : 0),
  })],
// {MOONLIGHT} Sister Nil gets +2 Attack.
// AMBUSH: <b>Hunt for Victims.</b> Then each player reveals more non-grey Heroes than the number of Bystanders in the KO pile or gains a Wound.
// ESCAPE: Each player discards a Hero with an odd-numbered cost.
// ATTACK: 5+
// VP: 4
  [ 1, makeVillainCard("Lilin", "Sister Nil", 5, 4, {
    ambush: ev => {
      huntForVictimsEv(ev);
      cont(ev, () => eachPlayer(p => {
        if (p.hand.count(isNonGrayHero) < gameState.ko.count(isBystander)) gainWoundEv(ev, p);
      }));
    },
    escape: ev => eachPlayer(p => selectCardEv(ev, "Choose a Hero to discard", p.hand.limit(isHero).limit(isCostOdd), c => discardEv(ev, c), p)),
    varDefense: c => c.printedDefense + (moonlightPower() ? 2 : 0),
  })],
// {MOONLIGHT} Blackout gets +1 Attack for each Bystander in the KO pile.
// AMBUSH: <b>Hunt for Victims.</b> If it's Moonlight, <b>Hunt for Victims</b> again.
// ESCAPE: <i>[After the normal Escape KO]</i> If it's Moonlight, each player gains a Wound.
// ATTACK: 7+
// VP: 5
  [ 1, makeVillainCard("Lilin", "Blackout", 7, 5, {
    ambush: ev => {
      huntForVictimsEv(ev);
      if (moonlightPower()) huntForVictimsEv(ev);
    },
    escape: ev => moonlightPower() && eachPlayer(p => gainWoundEv(ev, p)),
    varDefense: c => c.printedDefense + (moonlightPower() ? gameState.ko.count(isBystander) : 0),
  })],
]},
]);
addVillainTemplates("Marvel Studios What If...?", [
{ name: "Black Order Guards", cards: [
// <b>Empowered</b> by cards that cost 5 or more.
// AMBUSH: For each Hero in the HQ that costs 5 or more, Corvus Glaive captures a Bystander.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("Black Order Guards", "Corvus Glaive", 3, 3, {
    ambush: ev => captureEv(ev, ev.source, hqHeroes().count(c => c.cost >= 5)),
    varDefense: empowerVarDefense(c => c.cost >= 5),
  })],
// <b>Empowered</b> by cards that cost 5 or more.
// FIGHT: For each Hero in the HQ that costs 5 or more, you get +1 Recruit.
// ATTACK: 2+
// VP: 2
  [ 3, makeVillainCard("Black Order Guards", "Cull Obsidian", 2, 2, {
    fight: ev => addRecruitEvent(ev, hqHeroes().count(c => c.cost >= 5)),
    varDefense: empowerVarDefense(c => c.cost >= 5),
  })],
// <b>Empowered</b> by cards that cost 5 or more.
// AMBUSH: Each player discards a card that costs 5 or more.
// ESCAPE: Ebony Maw ascends to become a new Mastermind. He gains the ability "<b>Master Strike</b>: Repeat his Ambush effect."
// ATTACK: 7+
// VP: 6
  [ 1, makeVillainCard("Black Order Guards", "Ebony Maw", 7, 6, {
    ambush: ev => eachPlayer(p => pickDiscardEv(ev, 1, p, c => c.cost >= 5)), // TODO: multiplayer reveal hand
    strike: ev => eachPlayer(p => pickDiscardEv(ev, 1, p, c => c.cost >= 5)),
    escape: ascendToMastermind,
    varDefense: empowerVarDefense(c => c.cost >= 5),
  })],
// <b>Empowered</b> by cards that cost 5 or more.
// AMBUSH: Each player discards a card that costs 5 or more or gains a Wound.
// FIGHT: KO one of your Heroes.
// ATTACK: 4+
// VP: 4
  [ 2, makeVillainCard("Black Order Guards", "Proxima Midnight", 4, 4, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, c => c.cost >= 5, () => gainWoundEv(ev, p), p)),
    fight: ev => selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c)),
    varDefense: empowerVarDefense(c => c.cost >= 5),
  })],
]},
{ name: "Intergalactic Party Animals", cards: [
// Captain Marvel gets +1 Attack for each other Intergalactic Party Animal in the city and/or Escape Pile.
// AMBUSH: Each player reveals a [Strength] Hero or gains a Wound.
// ESCAPE: Captain Marvel ascends to become a new Mastermind. She gains the ability "<b>Master Strike</b>: Repeat her Ambush effect."
// ATTACK: 7+
// VP: 5
  [ 1, makeVillainCard("Intergalactic Party Animals", "Captain Marvel, End of the Party", 7, 5, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p)),
    strike: ev => eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p)),
    escape: ascendToMastermind,
    varDefense: c => c.printedDefense + [...cityVillains(), ...gameState.escaped.deck].count(c1 => c1 !== c && isGroup(c.villainGroup)(c1)),
  })],
// During your turn, you may discard a card that costs 5 or more to "hide the party" and shuffle Frigga into the Villain Deck. If you do, you may KO one of your Heroes,
// then you must play a card from the Villain Deck.
// AMBUSH: Frigga ascends to become a new Mastermind. She gains the ability "<b>Master Strike</b>: If there are any Intergalactic Party Animals in the city, each player
// discards a card."
// ATTACK: 12
// VP: 6
  [ 1, makeVillainCard("Intergalactic Party Animals", "Frigga, Mother of Thor", 12, 6, {
    ambush: ascendToMastermind,
    cardActions: [(c, ev) => {
      return new Ev(ev, 'EFFECT', { desc: "Hide the party", cost: { cond: () => playerState.hand.has(c => c.cost >= 5) }, func: ev => {
        selectCardEv(ev, "Choose a card to discard", playerState.hand.limit(c => c.cost >= 5), c => {
          discardEv(ev, c);
          shuffleIntoEv(ev, ev.source, gameState.villaindeck);
          selectCardOptEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c));
          playAnotherEv(ev);
        });
      }});
    }]
  })],
// Party Korath gets +1 Attack for each Bystander held among all Intergalactic Party Animals.
// AMBUSH: Each player may draw a card. Korath captures a Bystander for each card drawn this way.
// ATTACK: 4+
// VP: 2
  [ 1, makeVillainCard("Intergalactic Party Animals", "Party Korath", 4, 2, {
    ambush: ev => eachPlayer(p => chooseMayEv(ev, "Draw a card?", () => (drawEv(ev, 1, p), captureEv(ev, ev.source)))),
    varDefense: c => c.printedDefense + villains().limit(isGroup(c.villainGroup)).sum(c => c.captured.size),
  })],
// FIGHT: KO one of your Heroes.
// ESCAPE: {XDRAMPAGE Party}
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Intergalactic Party Animals", "Party Korg", 5, 3, {
    fight: ev => selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c)),
    escape: ev => xdRampageEv(ev, "Party"),
  })],
// FIGHT: You get +1 Recruit for each Intergalactic Party Animal in your Victory Pile <i>(including this one)</i>.
// ATTACK: 4
// VP: 2
  [ 1, makeVillainCard("Intergalactic Party Animals", "Party Kraglin", 4, 2, {
    fight: ev => addRecruitEvent(ev, playerState.victory.count(isGroup(ev.source.villainGroup))),
  })],
// AMBUSH: If there are any other Intergalactic Party Animals in the city, each player discards a card.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Intergalactic Party Animals", "Party Nebula", 5, 3, {
    ambush: ev => cityVillains().has(c => c !== ev.source && isGroup(c.villainGroup)(c)) && eachPlayer(p => pickDiscardEv(ev, 1, p)),
    escape: sameEffect,
  })],
// AMBUSH: Party Skrull captures the highest-cost Hero from all the HQ spaces under Intergalactic Party Animals. Party Skrull gets +Attack equal to that Hero's Cost.
// FIGHT: Either KO that Hero or choose a player to gain it.
// ATTACK: 2+
// VP: 3
  [ 1, makeVillainCard("Intergalactic Party Animals", "Party Skrull", 2, 3, {
    ambush: ev => selectCardEv(ev, "Choose a hero for Party Skrull to capture", hqHeroes().limit(c => c.location.above?.has(isGroup(c.villainGroup))).highest(c => c.cost), c => {
      attachCardEv(ev, c, ev.source, 'PARTY_SKRULL_CAPTURE');
    }),
    fight: ev => ev.source.attached('PARTY_SKRULL_CAPTURE').each(c => selectCardOptEv(ev, "Choose a player to gain the captured Hero", gameState.players,
      p => gainEv(ev, c, p), () => KOEv(ev, c))),
  })],
// AMBUSH: {XDRAMPAGE Party}
// FIGHT: You may KO a grey Hero from your discard pile.
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("Intergalactic Party Animals", "Party Surtur", 6, 4, {
    ambush: ev => xdRampageEv(ev, "Party"),
    fight: ev => selectCardOptEv(ev, "Choose a grey Hero to KO", playerState.discard.deck.limit(isHero).limit(Color.GRAY), c => KOEv(ev, c)),
  })],
]},
{ name: "Rival Overlords", cards: [
// Arnim Zola gets -2 Attack for each other Rival Overlord that's in the city or a Mastermind.
// FIGHT: During one of your turns, you may <b>Soulbind Arnim Zola</b> to give a Mastermind -2 Attack for one fight.
// ATTACK: 5*
// VP: 2
  [ 1, makeVillainCard("Rival Overlords", "Arnim Zola, Hydra Scientist", 5, 2, {
    fight: ev => {},
    cardActions: [soulBindSelfCardAction(ev => {
        withMastermind(ev, c => {
          const cond = is(c);
          let once = false;
          addTurnMod('defense', cond, () => -2);
          addTurnTrigger('FIGHT', ev => cond(ev.what), () => once = true);
        });
      })],
    varDefense: c => c.printedDefense - 2 * fightableCards().count(c1 => c !== c1 && isGroup(c.villainGroup)(c1)),
  })],
// Dormammu gets -2 Attack for each other Rival Overlord that's in the city or a Mastermind.
// ESCAPE: Dormammu ascends to become a new Mastermind. He gains the ability
// "<b>Master Strike</b>: Each player reveals the top of their deck. If it costs 1 or more, that player gains a Wound."
// ATTACK: 11*
// VP: 6
  [ 1, makeVillainCard("Rival Overlords", "Dormammu", 11, 6, {
    escape: ascendToMastermind,
    varDefense: c => c.printedDefense - 2 * fightableCards().count(c1 => c !== c1 && isGroup(c.villainGroup)(c1)),
    strike: ev => eachPlayer(p => revealPlayerDeckEv(ev, 1, cards => {
      cards.has(c => c.cost >= 1) && gainWoundEv(ev, p);
    }, p)),
  })],
// Ego gets -2 Attack for each other Rival Overlord that's in the city or a Mastermind.
// ESCAPE: Ego ascends to become a new Mastermind. He gains the ability
// "<b>Master Strike</b>: Reveal the top card of the Villain Deck. If it's a Master Strike, play it."
// ATTACK: 10*
// VP: 5
  [ 1, makeVillainCard("Rival Overlords", "Ego", 10, 5, {
    varDefense: c => c.printedDefense - 2 * fightableCards().count(c1 => c !== c1 && isGroup(c.villainGroup)(c1)),
    strike: ev => revealVillainDeckEv(ev, 1, cards => cards.has(isStrike) && villainDrawEv(ev)),
    escape: ascendToMastermind,
  })],
// Loki gets -2 Attack for each other Rival Overlord that's in the city or a Mastermind.
// ESCAPE: Loki ascends to become a new Mastermind. He gains the ability
// "<b>Master Strike</b>: Each player discards a [Ranged] Hero or KOs one of their non-grey Heroes."
// ATTACK: 9*
// VP: 5
  [ 1, makeVillainCard("Rival Overlords", "Loki", 9, 5, {
    escape: ascendToMastermind,
    strike: ev => eachPlayer(p => selectCardOptEv(ev, "Choose a Hero to discard", p.hand.limit(Color.RANGED), c => discardEv(ev, c),
      () => selectCardEv(ev, "Choose a Hero to KO", p.hand.limit(isNonGrayHero), c => KOEv(ev, c), p))),
    varDefense: c => c.printedDefense - 2 * fightableCards().count(c1 => c !== c1 && isGroup(c.villainGroup)(c1)),
  })],
// Red Skull gets -2 Attack for each other Rival Overlord that's in the city or a Mastermind.
// ESCAPE: Red Skull ascends to become a new Mastermind. He gains the ability "<b>Master Strike</b>: Each player reveals a [Covert] Hero or discards down to 4 cards."
// ATTACK: 8*
// VP: 4
  [ 1, makeVillainCard("Rival Overlords", "Red Skull, Hydra Occultist", 8, 4, {
    escape: ascendToMastermind,
    strike: ev => eachPlayer(p => revealOrEv(ev, Color.COVERT, () => pickDiscardEv(ev, -4, p), p)),
    varDefense: c => c.printedDefense - 2 * fightableCards().count(c1 => c !== c1 && isGroup(c.villainGroup)(c1)),
  })],
// Thanos gets -2 Attack for each other Rival Overlord that's in the city or a Mastermind.
// ESCAPE: Thanos ascends to become a new Mastermind. He gains the ability "<b>Master Strike</b>: Each player discards half of their cards <i>(round down the discards)</i>."
// ATTACK: 12*
// VP: 6
  [ 1, makeVillainCard("Rival Overlords", "Thanos", 12, 6, {
    escape: ascendToMastermind,
    strike: ev => eachPlayer(p => pickDiscardEv(ev, Math.floor(p.hand.size / 2), p)),
    varDefense: c => c.printedDefense - 2 * fightableCards().count(c1 => c !== c1 && isGroup(c.villainGroup)(c1)),
  })],
// Ulysses Klaue gets -2 Attack for each other Rival Overlord that's in the city or a Mastermind.
// AMBUSH: A Villain in the city with an "ascend" ability ascends to become a new Mastermind.
// FIGHT: KO one of your Heroes.
// ATTACK: 6*
// VP: 2
  [ 1, makeVillainCard("Rival Overlords", "Ulysses Klaue", 6, 2, {
    ambush: ev => selectCardEv(ev, "Choose a Villain to ascend", cityVillains().filter(c => c.escape === ascendToMastermind), c => {
      pushEffects(ev, c, 'escape', c.escape);
    }),
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    varDefense: c => c.printedDefense - 2 * fightableCards().count(c1 => c !== c1 && isGroup(c.villainGroup)(c1)),
  })],
// Yondu gets -2 Attack for each other Rival Overlord that's in the city or a Mastermind.
// AMBUSH: Yondu captures a Bystander.
// FIGHT: Each player KOs one of their Heroes.
// ATTACK: 7*
// VP: 3
  [ 1, makeVillainCard("Rival Overlords", "Yondu", 7, 3, {
    ambush: ev => captureEv(ev, ev.source),
    fight: ev => eachPlayer(p => selectCardEv(ev, "Choose a Hero to KO", yourHeroes(p), c => KOEv(ev, c), p)),
    varDefense: c => c.printedDefense - 2 * fightableCards().count(c1 => c !== c1 && isGroup(c.villainGroup)(c1)),
  })],
]},
{ name: "Strange’s Demons", cards: [
// AMBUSH: {XDRAMPAGE Demon} Then each player must <b>Soulbind a Strange's Demon Villain</b>.
// ESCAPE: Demon Champion of Hydra ascends to become a new Mastermind. It gains the ability "<b>Master Strike</b>: Repeat its Ambush effect."
// ATTACK: 8
// VP: 6
  [ 1, makeVillainCard("Strange’s Demons", "Demon Champion of Hydra", 8, 6, {
    ambush: ev => { xdRampageEv(ev, "Demon"); eachPlayer(p => forceSoulbindEv(ev, isGroup(ev.source.villainGroup), p)); },
    strike: ev => { xdRampageEv(ev, "Demon"); eachPlayer(p => forceSoulbindEv(ev, isGroup(ev.source.villainGroup), p)); },
    escape: ascendToMastermind,
  })],
// FIGHT: {SOULBIND another Villain} You get +Recruit equal to that Villain's VP.
// ESCAPE: {XDRAMPAGE Demon}
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("Strange’s Demons", "Demon Dragon", 6, 4, {
    fight: ev => soulbindEv(ev, 0, c => addRecruitEvent(ev, c.vp), c => isNot(ev.source)(c) && isVillain(c)),
    escape: ev => xdRampageEv(ev, "Demon"),
  })],
// AMBUSH: Each player must <b>Soulbind a Strange's Demon Villain</b> or discard a card.
// ESCAPE: Demonbound Doctor Strange ascends to become a new Mastermind. He gains the ability "<b>Master Strike</b>: Repeat his Ambush effect."
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Strange’s Demons", "Demonbound Doctor Strange", 7, 5, {
    ambush: ev => eachPlayer(p => forceSoulbindEv(ev, isGroup(ev.source.villainGroup), p, () => pickDiscardEv(ev, 1, p))),
    strike: ev => eachPlayer(p => forceSoulbindEv(ev, isGroup(ev.source.villainGroup), p, () => pickDiscardEv(ev, 1, p))),
    escape: ascendToMastermind,
  })],
// FIGHT: {SOULBIND a Henchman} Draw two cards. You may do that Henchman's Fight effect.
// ATTACK: 4
// VP: 2
  [ 1, makeVillainCard("Strange’s Demons", "Moose Demon", 4, 2, {
    fight: ev => soulbindEv(ev, 0, c => {
      drawEv(ev, 2);
      chooseMayEv(ev, "Do the Henchman's Fight effect?", () => pushEffects(ev, c, 'fight', c.fight));
    }, isHenchman),
  })],
// FIGHT: {SOULBIND a Bystander} Draw two cards. Then if it's a Special Bystander, you may do its Rescue effect.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Strange’s Demons", "Skull Demon", 5, 3, {
    fight: ev => soulbindEv(ev, 0, c => {
      drawEv(ev, 2);
      chooseMayEv(ev, "Do the Bystander's Rescue effect?", () => pushEffects(ev, c, 'rescue', c.rescue));
    }, isBystander),
  })],
// FIGHT: {SOULBIND two other Villains} KO up to two cards from your discard pile.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Strange’s Demons", "Two-Headed Ram Demon", 5, 3, {
    fight: ev => soulbindEv(ev, 0, () => {
      selectObjectsEv(ev, "Choose cards to KO", 2, playerState.discard.deck, c => KOEv(ev, c));
    }, c => isVillain(c) && isNot(ev.source)(c), 2)
  })],
// FIGHT: {SOULBIND another Villain} KO one of your Heroes.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Strange’s Demons", "Wolf Demon", 4, 2, {
    fight: ev => soulbindEv(ev, 0, () => selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c)), c => isNot(ev.source)(c) && isVillain(c)),
  })],
]},
{ name: "Zombie Avengers", cards: [
// AMBUSH: {RISEOFTHELIVINGDEAD}
// Zombie Captain America gets -1 Attack for each Hero Class you have.
// ESCAPE: Each player reveals three Hero Classes or gains a Wound.
// ATTACK: 8*
// VP: 4
  [ 1, makeVillainCard("Zombie Avengers", "Zombie Captain America", 8, 4, {
    ambush: riseOfTheLivingDead,
    escape: ev => eachPlayer(p => numClasses(yourHeroes(p)) >= 3 || gainWoundEv(ev, p)),
    varDefense: c => c.printedDefense - numClasses(),
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// FIGHT: Look at the top three cards of your deck. Draw one of them, KO one, and put one back.
// ESCAPE: {XDRAMPAGE Zombie}
// ATTACK: 6
// VP: 4
  [ 1, makeVillainCard("Zombie Avengers", "Zombie Doctor Strange", 6, 4, {
    ambush: riseOfTheLivingDead,
    fight: ev => lookAtThreeEv(ev, 'DRAW', 'KO'),
    escape: ev => xdRampageEv(ev, "Zombie"),
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// FIGHT: Each player draws a card.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Zombie Avengers", "Zombie Hawkeye", 5, 3, {
    ambush: riseOfTheLivingDead,
    fight: ev => eachPlayer(p => drawEv(ev, 1, p)),
  })],
// AMBUSH: Each player reveals a [Tech] card or gains a Wound. Then {RISEOFTHELIVINGDEAD}.
// ESCAPE: Zombie Iron Man ascends to become a new Mastermind. He gains the ability "<b>Master Strike</b>: Repeat his Ambush effect."
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Zombie Avengers", "Zombie Iron Man", 7, 5, {
    ambush: ev => {
      eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainWoundEv(ev, p), p));
      cont(ev, riseOfTheLivingDead);
    },
    riseOfTheLivingDead: true,
    escape: ascendToMastermind,
    strike: ev => {
      eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainWoundEv(ev, p), p));
      cont(ev, riseOfTheLivingDead);
    },
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// While in the Sewers, Rooftops, or Bridge, Zombie Wasp is "giant size" and gets +2 Attack.
// FIGHT: KO one of your Heroes.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Zombie Avengers", "Zombie Wasp", 4, 3, {
    ambush: riseOfTheLivingDead,
    fight: ev => selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c)),
    varDefense: c => c.printedDefense + (villainIn('SEWERS', 'ROOFTOPS', 'BRIDGE').includes(c) ? 2 : 0),
  })],
// AMBUSH: {RISEOFTHELIVINGDEAD}
// FIGHT: Look at the top two cards of your deck. Draw one of them and put the other back.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Zombie Avengers", "Zombie Wong", 4, 2, {
    ambush: riseOfTheLivingDead,
    fight: ev => revealPlayerDeckEv(ev, 2, cards => {
      selectCardEv(ev, "Choose a card to draw", cards, c => drawEv(ev, 1, playerState));
    }),
  })],
]},
]);
addVillainTemplates("Ant-Man and the Wasp", [
{ name: "Armada of Kang", cards: [
// AMBUSH: If the Bridge is empty, move a Villain to the Bridge. Choose an unused Henchman Group and stack Henchmen from it next to this Scheme equal to the number of players.
// <b>Special Rules</b>: Players may fight Henchmen stacked here. While here, those Henchmen also have "{BRIDGE CONQUEROR 1}." If you defeat the last Henchman here, defeat this Scheme.
// <b>Twist</b>: Stack another of those Henchmen next to this Scheme <i>(from a Victory Pile if necessary)</i>. Then, if there are two more Henchmen here than the number
// of players: Each player gains a Wound, 3 of those Henchmen enter the city, and you KO this Scheme and the rest of those Henchmen.
// VP: 4
  [ 1, makeAmbushSchemeCard("Armada of Kang", "Build a Conquering Army", 4, {
    ambush: ev => {
      withCity('BRIDGE', d => isCityEmpty(d) && selectCardEv(ev, "Choose a Villain to move to the Bridge", villains(), c => moveCardEv(ev, c, d)));
      const extraHenchmen = gameState.outOfGame.attachedDeck('CONQUERING_ARMY_HENCHMEN');
      const henchmen = ev.source.attachedDeck('HENCHMEN');
      availiableHenchmenTemplates().withRandom(h => { // TODO - not random
        h instanceof Card ? extraHenchmen.addNewCard(h, 10) : h.cards.each(([n, c]) => extraHenchmen.addNewCard(c, n));
      })
      extraHenchmen.shuffle();
      extraHenchmen.deck.forEach((c, i) => i < gameState.players.length && moveCard(c, henchmen));
      addStatSet('conqueror', c => c.location === henchmen, (c, v) => ({ amount: 1, locations: [...v.locations, 'BRIDGE'] })); // TODO this works as currently there are no Henchmen with conqueror != 1
    },
    triggers: [{
      event: 'DEFEAT',
      match: (ev, source) => ev.where === source.attachedDeck('HENCHMEN') && source.attachedDeck('HENCHMEN').size === 0,
      after: ev => defeatEv(ev, ev.source),
    }],
    twist: ev => {
      const henchmen = ev.source.attachedDeck('HENCHMEN');
      const extraHenchmen = gameState.outOfGame.attachedDeck('CONQUERING_ARMY_HENCHMEN');
      extraHenchmen.size ? extraHenchmen.withTop(c => moveCardEv(ev, c, henchmen)) :
      selectCardEv(ev, "Choose a Henchman to stack", gameState.players.flatMap(p => p.victory.limit(c => henchmen.has(isGroup(c.villainGroup)))) , c => {
        moveCardEv(ev, c, henchmen);
      });
      cont(ev, () => {
        if (ev.source.attached('HENCHMEN').size >= gameState.players.length + 2) {
          eachPlayer(p => gainWoundEv(ev, p));
          selectObjectsEv(ev, "Choose Henchmen to enter the city", 3, ev.source.attached('HENCHMEN'), c => {
            enterCityEv(ev, c);
          });
          cont(ev, () => {
            ev.source.attached('HENCHMEN').each(c => KOEv(ev, c));
            KOEv(ev, ev.source);
          });
        }
      });
    }
  })],
// {STREETS CONQUEROR 2}
// AMBUSH: Each player reveals a [Ranged] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Armada of Kang", "City Defense System", 4, 3, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p)),
    escape: sameEffect,
    ...conquerorAbility(2, 'STREETS'),
  })],
// {STREETS CONQUEROR 2}
// AMBUSH: Put this Energy Shield above the Mastermind space. While it's there, you can't fight the Mastermind. <i>(You can still fight the Energy Shield.)</i>
// ATTACK: 5+
// VP: 4
  [ 1, makeVillainCard("Armada of Kang", "Energy Shield", 5, 4, {
    ambush: ev => {
      attachCardEv(ev, ev.source, gameState.mastermind, 'ENERGY_SHIELD');
      addStatSet('fightCost', c => c.location === gameState.mastermind && gameState.mastermind.attached('ENERGY_SHIELD').size > 0, (c, v) => ({cond: () => false, ...v}));
    },
    ...conquerorAbility(2, 'STREETS'),
  })],
// AMBUSH: You may say "<i>I'm sure we can trust Lord Krylar...</i>" If you do: Draw a card, reveal it, and if it has an odd-numbered cost,
// Lord Krylar {DOUBLE-CROSSES} each player.
// FIGHT: Same effect.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Armada of Kang", "Lord Krylar's Yacht", 5, 3, {
    ambush: ev => chooseMayEv(ev, "Say 'I'm sure we can trust Lord Krylar...'", () => revealPlayerDeckEv(ev, 1, cards => cards.each(c => {
      drawCardEv(ev, c);
      isCostOdd(c) && eachPlayer(p => doubleCrossEv(ev, p));
    }))),
    fight: sameEffect,
    escape: sameEffect,
  })],
// {USIZECHANGING RANGED 1}[Ranged][Ranged][Ranged]
// AMBUSH: M.O.D.O.K. {DOUBLE-CROSSES} each player.
// FIGHT: Each player KOs one of their Heroes.
// ATTACK: 8*
// VP: 5
// FLAVOR: Mechanized Organism Designed Only for KOing.
  [ 1, makeVillainCard("Armada of Kang", "M.O.D.O.K.", 8, 5, {
    ambush: ev => {},
    fight: ev => {},
    uSizeChanging: { color: Color.RANGED, amount: 4 },
  })],
// {ROOFTOPS CONQUEROR 2}
// AMBUSH: <i>(After this enters the city)</i> If other Villains or the Mastermind have Conqueror abilities naming any empty city spaces,
// Pursuit Craft moves to one of those city spaces.
// ATTACK: 5+
// VP: 4
  [ 1, makeVillainCard("Armada of Kang", "Pursuit Craft", 5, 4, {
    ambush: ev => selectCardEv(ev, "Choose a city space", gameState.city.limit(d => isCityEmpty(d) && fightableCards().has(c => c.getConqueror()?.locations?.has(l => isLocation(d, l)))), d => {
      moveCardEv(ev, ev.source, d);
    }),
    ...conquerorAbility(2, 'ROOFTOPS'),
  })],
// {ROOFTOPS CONQUEROR 2}
// {STREETS CONQUEROR 2}
// FIGHT: KO two of your Heroes.
// ATTACK: 4+
// VP: 4
// FLAVOR: No emotion displayed. No mercy granted.
  [ 1, makeVillainCard("Armada of Kang", "Quantumnaut Elite", 4, 4, {
    fight: ev => selectObjectsEv(ev, "Choose Heroes to KO", 2, yourHeroes(), c => KOEv(ev, c)),
    ...conquerorAbility(2, 'ROOFTOPS', 'STREETS'),
  })],
// {ROOFTOPS CONQUEROR 2}
// AMBUSH: A Villain worth 2 VP or 3 VP from any player's Victory Pile enters the city.
// ATTACK: 4+
// VP: 3
  [ 1, makeVillainCard("Armada of Kang", "Troop Ships of Kang", 4, 3, {
    ambush: ev => selectCardEv(ev, "Choose a Villain to enter the city", gameState.players.flatMap(p => p.victory.limit(c => c.vp === 2 || c.vp === 3)), c => enterCityEv(ev, c)),
    ...conquerorAbility(2, 'ROOFTOPS'),
  })],
]},
{ name: "Cross Technologies", cards: [
// While the back side of a Mastermind card is face up, this Villain gets +2 Attack and "<b>Escape</b>: Each player discards a card."
// FIGHT: KO one of your Heroes.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("Cross Technologies", "Cross' Security Detail", 5, 4, {
    fight: ev => selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c)),
    escape: ev => gameState.mastermind.has(c => c.isTransformed || c.epic) && eachPlayer(p => pickDiscardEv(ev, 1, p)),
    varDefense: c => c.printedDefense + (gameState.mastermind.has(c => c.isTransformed || c.epic) ? 2 : 0),
  })],
// FIGHT: You get +2 Recruit, usable only to recruit Heroes with an Attack icon.
// ATTACK: 4
// VP: 2
// FLAVOR: Just imagine what Hydra could do with shrinking technology...
  [ 2, makeVillainCard("Cross Technologies", "Hydra Arms Dealer", 4, 2, {
    fight: ev => addRecruitSpecialEv(ev, c => hasAttackIcon(c) && isHero(c), 2),
  })],
// {SIZECHANGING TECH}
// FIGHT: A Hero in the HQ loses all <b>Size-Changing</b> abilities, then gains {SIZECHANGING TECH} this turn.
// ATTACK: 6*
// VP: 3
  [ 2, makeVillainCard("Cross Technologies", "Shrinksperiments", 6, 3, {
    fight: ev => selectCardEv(ev, "Choose a Hero to gain Size-Changing Tech", hqHeroes(), c => {
      addTurnSet('sizeChanging', is(c), () => Color.TECH);
      addTurnSet('uSizeChanging', is(c), (() => undefined) as () => undefined);
    }),
    sizeChanging: Color.TECH,
  })],
// AMBUSH: This Scheme captures Bystanders equal to the number of players plus 1, as "Pym Tech Scientists."
// <b>Special Rules</b>: Once per turn, you may pay 3 Recruit or discard a card with <b>Size-Changing</b>. If you do, rescue a Pym Tech Scientist and draw a card.
// If you rescue the last Scientist, defeat this Scheme.
// <b>Twist</b>: This captures another Pym Tech Scientist. Then, if it has 3 or more Scientists, each player discards a card.
// VP: 2
  [ 1, makeAmbushSchemeCard("Cross Technologies", "Take Over Pym Technologies", 2, {
    ambush: ev => {
      captureEv(ev, ev.source, gameState.players.length + 1);
    },
    cardActions: [
      (c: Card, ev: Ev) => new Ev(ev, 'EFFECT', { cost: { recruit: 3 }, desc: "Rescue Scientist with 3 Recruit", func: ev => {
        selectCardEv(ev, "Choose a Scientist to rescue", c.captured, c => rescueEv(ev, c));
        drawEv(ev);
        cont(ev, () => c.captured.size === 0 && defeatEv(ev, c));
      }}),
      (c: Card, ev: Ev) => new Ev(ev, 'EFFECT', { cost: { cond: () => playerState.hand.has(c => !hasNoSizeChanging(c))}, desc: "Rescue scientist with discard", func: ev => {
        selectCardEv(ev, "Choose a card to discard", playerState.hand.limit(c => !hasNoSizeChanging(c)), c => discardEv(ev, c));
        selectCardEv(ev, "Choose a Scientist to rescue", c.captured, c => rescueEv(ev, c));
        drawEv(ev);
        cont(ev, () => c.captured.size === 0 && defeatEv(ev, c));
      }})
    ],
    twist: ev => {
      captureEv(ev, ev.source);
      cont(ev, () => ev.source.captured.size >= 3 && eachPlayer(p => pickDiscardEv(ev, 1, p)));
    }
  })],
// {USIZECHANGING INSTINCT 1}[Instinct][Instinct][Instinct]
// AMBUSH: Each player reveals a [Instinct] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 9*
// VP: 5
  [ 1, makeVillainCard("Cross Technologies", "Yellowjacket Prototype", 9, 5, {
    ambush: ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainWoundEv(ev, p), p)),
    escape: sameEffect,
    uSizeChanging: { color: Color.INSTINCT, amount: 4 },
  })],
]},
{ name: "Ghost Chasers", cards: [
// FIGHT: {HEIST} You may KO up to two of your Heroes.
// ATTACK: 5
// VP: 3
// FLAVOR: "We traffic in stolen technology." — Uzman
// "And we have killed many, many people." — Anitolov<i></span></i>
  [ 1, makeVillainCard("Ghost Chasers", "Anitolov", 5, 3, {
    fight: ev => {/* Heist */},
    heist: ev => selectObjectsUpToEv(ev, "Choose Heroes to KO", 2, yourHeroes(), c => KOEv(ev, c)),
  })],
// AMBUSH: Corrupted Government Agents <b>Double-Cross</b> each player.
// FIGHT: You may look at the top three cards of any deck and put them back in any order.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Ghost Chasers", "Corrupted Government Agents", 5, 3, {
    ambush: ev => eachPlayer(p => doubleCrossEv(ev, p)),
    fight: ev => selectCardEv(ev, "Choose a deck to look at", anyDeck(), d => {
      if (gameState.players.has(p => p.deck === d)) revealPlayerDeckEv(ev, 3, () => {}, d.owner, playerState);
      else revealDeckEv(ev, d, 3, () => {}, false, false);
    }),
  })],
// To fight Dr. Bill Foster, you must solve a math equation: Discard three cards such that the costs of two of them add up to the cost of the third. They can't all cost 0.
// ESCAPE: Each player discards a card that costs 0.
// ATTACK: 0*
// VP: 4
  [ 1, makeVillainCard("Ghost Chasers", "Dr. Bill Foster", 0, 4, {
    escape: ev => eachPlayer(p => pickDiscardEv(ev, 1, p, c => c.cost === 0)),
    fightCond: () => drBillFosterOptions().length > 0,
    fightCost: ev => {
      const costs = drBillFosterOptions();
      selectCardEv(ev, "Choose a card to discard (sum)", playerState.hand.limit(c => costs.has(v => c.cost === v[0])), c1 => {
        const costs2 = costs.filter(v => c1.cost === v[0]);
        selectCardEv(ev, "Choose second card to discard", playerState.hand.limit(c => costs2.has(v => c.cost === v[1] || c.cost === v[2])), c2 => {
          selectCardEv(ev, "Choose third card to discard", playerState.hand.limit(c => c.cost === c1.cost - c2.cost), c3 => {
            discardEv(ev, c1);
            discardEv(ev, c2);
            discardEv(ev, c3);
          });
        });
      });
    },
  })],
// {SIZECHANGING STRENGTH}
// AMBUSH: Goliath {DOUBLE-CROSSES} each player.
// FIGHT: Goliath topples over, crushing another Villain: You may defeat a Villain that has 4 Attack or less in an adjacent city space.
// ATTACK: 8*
// VP: 5
  [ 1, makeVillainCard("Ghost Chasers", "Goliath", 8, 5, {
    ambush: ev => eachPlayer(p => doubleCrossEv(ev, p)),
    fight: ev => selectCardEv(ev, "Choose a villain to crush", cityAdjacent(ev.source.location).flatMap(d => d.limit(isVillain)), c => defeatEv(ev, c)),
    sizeChanging: Color.STRENGTH,
  })],
// AMBUSH: Stack 2 cards from the Wound Deck next to this Scheme as "Dangerous Stunts."
// <b>Twist</b>: If there is a Villain in the Streets: Add 2 Dangerous Stunts. Then if there are at least 5 Stunts, there is a "car crash": Each player gains one of
// the Stunts as a Wound. KO the rest of the Stunts and this Scheme.
// Otherwise: Return a Dangerous Stunt to the Wound Deck. If there are still Stunts here, move a Villain to the Streets. If there aren't any Stunts, defeat this Scheme.
// VP: 3
  [ 1, makeAmbushSchemeCard("Ghost Chasers", "High-Speed Car Chase", 3, {
    ambush: ev => {
      repeat(2, () => cont(ev, () => gameState.wounds.withTop(c => attachCardEv(ev, c, ev.source, 'DANGEROUS_STUNT'))));
    },
    twist: ev => {
      withCity('STREETS', d => { isCityEmpty(d) ?
        repeat(2, () => cont(ev, () => gameState.wounds.withTop(c => attachCardEv(ev, c, ev.source, 'DANGEROUS_STUNT')))) : (
          ev.source.attachedDeck('DANGEROUS_STUNTS').withTop(c => returnToStackEv(ev, gameState.wounds, c))
        )});
      cont(ev, () => {
        const stunts = ev.source.attachedDeck('DANGEROUS_STUNTS');
        if (stunts.size >= 5) {
          eachPlayer(p => cont(ev, () => stunts.withTop(c => gainEv(ev, c, p))));
          cont(ev, () => {
            stunts.each(c => KOEv(ev, c));
            KOEv(ev, ev.source);
          });
        } else if (stunts.size === 0) {
          defeatEv(ev, ev.source);
        } else {
          withCity('STREETS', d => isCityEmpty(d) && selectCardEv(ev, "Choose a Villain to move to the Streets", villains(), c => moveCardEv(ev, c, d)));
        }
      });
    },
  })],
// AMBUSH: Sonny Burch {DOUBLE-CROSSES} each player.
// FIGHT: {HEIST} You may choose a player to gain a [Tech] or [Ranged] Hero from the HQ.
// ATTACK: 6
// VP: 4
// FLAVOR: "Quantum energy is the future. It's the next gold rush."
  [ 1, makeVillainCard("Ghost Chasers", "Sonny Burch", 6, 4, {
    ambush: ev => eachPlayer(p => doubleCrossEv(ev, p)),
    fight: ev => {/* Heist */},
    heist: ev => selectCardEv(ev, "Choose a Hero to gain", hqHeroes().limit(Color.TECH | Color.RANGED), c => {
      choosePlayerEv(ev, p => gainEv(ev, c, p));
    }),
  })],
// FIGHT: {HEIST} You get +2 Recruit.
// ATTACK: 4
// VP: 2
// FLAVOR: Whether expensive goons or cheap goons, you get what you pay for.
  [ 1, makeVillainCard("Ghost Chasers", "Sonny Burch's Goons", 4, 2, {
    fight: ev => {/* Heist */},
    heist: ev => addRecruitEvent(ev, 2),
  })],
// FIGHT: Look at the top card of the Hero Deck and claim a Hero Class it has. Choose another player to guess "Truth" or "Lie."
// If they guessed right, they either KO that Hero or choose a player to gain it. If they guessed wrong, you decide what to do with that Hero instead.
// <i>(In solo, you just decide.)</i>
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Ghost Chasers", "Uzman, With Truth Serum", 5, 3, {
    fight: ev => revealHeroDeckEv(ev, 1, cards => cards.each(c => {
      if (gameState.players.length === 1) selectCardOptEv(ev, "Choose who to give the Hero to", gameState.players, p2 => gainEv(ev, c, p2), () => KOEv(ev, c));
      else chooseClassEv(ev, color => {
        chooseOtherPlayerEv(ev, p => {
          chooseOptionEv(ev, "Truth or Lie?", [{l:"Truth", v:true}, {l:"Lie",v:false}], v => {
            const decider = isColor(color)(c) === v ? p : playerState;
            selectCardOptEv(ev, "Choose who to give the Hero to", gameState.players, p2 => gainEv(ev, c, p2), () => KOEv(ev, c), decider);
          });
        });
      })
    })),
  })],
]},
{ name: "Quantum Realm", cards: [
// AMBUSH: Any number of times this turn, you may pay 2 Recruit to "buy a refreshment" and KO a Wound from your hand or from any player's discard pile.
// FIGHT: Same effect.
// ATTACK: 4
// VP: 2
  [ 1, makeVillainCard("Quantum Realm", "Axian Bartender", 4, 2, {
    ambush: ev => {
      addTurnAction(new Ev(ev, 'EFFECT', { desc: "Buy a refreshment", cost: { recruit: 2 }, func: () => {
        selectCardEv(ev, "Choose a Wound to KO", [...gameState.players.flatMap(p => p.discard.limit(isWound)),...playerState.hand.limit(isWound)], c => KOEv(ev, c));
      }}));
    },
    fight: sameEffect,
  })],
// FIGHT: {EXPLORE} The Found Hero costs 2 less to recruit this turn.
// ATTACK: 4
// VP: 2
// FLAVOR: No detail escapes those eyes.
  [ 1, makeVillainCard("Quantum Realm", "Axian Maitre d'", 4, 2, {
    fight: ev => exploreEv(ev, c => addTurnMod('cost', is(c), () => -2)),
  })],
// {USIZECHANGING TECH 1}[Tech][Tech][Tech]
// FIGHT: KO one of your Heroes.
// ATTACK: 7*
// VP: 4
// FLAVOR: In the Quantum Realm, nutrients eat you!
  [ 1, makeVillainCard("Quantum Realm", "Hungering Energy", 7, 4, {
    fight: ev => selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c)),
    uSizeChanging: { color: Color.TECH, amount: 4 },
  })],
// {USIZECHANGING COVERT 1}[Covert][Covert][Covert]
// FIGHT: Choose a player to "eat the appetizer" and KO a card of their choice from their discard pile.
// ATTACK: 6*
// VP: 3
  [ 1, makeVillainCard("Quantum Realm", "Lord Krylar's Appetizer", 6, 3, {
    fight: ev => choosePlayerEv(ev, p => {
      selectCardEv(ev, "Choose a card to KO", p.discard.deck, c => KOEv(ev, c), p);
    }),
    uSizeChanging: { color: Color.COVERT, amount: 4 },
  })],
// FIGHT: {EXPLORE} You get + Recruit equal to the Found Hero's printed Recruit.
// ATTACK: 5
// VP: 3
// FLAVOR: Lord Krylar's network of informants could find anyone in the Quantum Realm.
  [ 1, makeVillainCard("Quantum Realm", "Lord Krylar's Valet", 5, 3, {
    fight: ev => exploreEv(ev, c => addRecruitEvent(ev, c.printedRecruit)),
  })],
// AMBUSH: Each player puts a non-grey Hero from their hand or discard pile next to this Scheme as a "Quantum Duplicate." Then do the Twist effect below.
// <b>Twist</b>: The top card of the Hero Deck becomes another Quantum Duplicate. Each player reveals their hand and discards all cards that have the same name
// as any Quantum Duplicate.
// <b>Special Rules</b>: Players may spend Attack equal to a Quantum Duplicate's printed cost to KO that Hero or choose a player to gain it.
// When there are no more Quantum Duplicates, defeat this Scheme.
// VP: 2
  [ 1, makeAmbushSchemeCard("Quantum Realm", "Quantumania", 2, {
    ambush: ev => {
      eachPlayer(p => selectCardEv(ev, "Choose a Hero to make a Quantum Duplicate", handOrDiscard(p).limit(isNonGrayHero), c => attachCardEv(ev, c, ev.source, 'QUANTUM_DUPLICATE')));
      addStatSet('cardActions', is(ev.source), () => ev.source.attachedDeck('QUANTUM_DUPLICATES').deck.map(c => (source, ev) => new Ev(ev, 'EFFECT', {
        what: c,
        cost: { attack: c.printedCost },
        func: ev => {
          selectCardOptEv(ev, "Choose a player to gain the Hero", gameState.players, p => gainEv(ev, c, p), () => KOEv(ev, c));
          cont(ev, () => source.attachedDeck('QUANTUM_DUPLICATES').size === 0 && defeatEv(ev, source));
        },
      })));
      gameState.herodeck.withTop(c => attachCardEv(ev, c, ev.source, 'QUANTUM_DUPLICATE'));
      cont(ev, () => eachPlayer(p => {
        p.hand.limit(c => ev.source.attached('QUANTUM_DUPLICATES').has(c2 => c.cardName === c2.cardName)).each(c => discardEv(ev, c));
      }));
    },
    twist: ev => {
      gameState.herodeck.withTop(c => attachCardEv(ev, c, ev.source, 'QUANTUM_DUPLICATE'));
      cont(ev, () => eachPlayer(p => {
        p.hand.limit(c => ev.source.attached('QUANTUM_DUPLICATES').has(c2 => c.cardName === c2.cardName)).each(c => discardEv(ev, c));
      }));
    }
  })],
// {USIZECHANGING TECH 1}[Tech][Tech][Tech]
// AMBUSH: Quantumoeba "eats" a Henchman from any player's Victory Pile, capturing it and gaining its printed Attack.
// FIGHT: Put the eaten Henchman in your Victory Pile and do its Fight effect.
// ATTACK: 8*
// VP: 5
  [ 1, makeVillainCard("Quantum Realm", "Quantumoeba", 8, 5, {
    ambush: ev => selectCardEv(ev, "Choose a Henchman to eat", gameState.players.flatMap(p => p.victory.limit(isHenchman)), c => {
      attachCardEv(ev, c, ev.source, 'EATEN');
      addStatMod('defense', is(ev.source), () => c.printedAttack);
    }),
    fight: ev => {
      ev.source.attached('EATEN').each(c => {
        moveCardEv(ev, c, playerState.victory);
        pushEffects(ev, c, 'fight', c.fight);
      });
    },
    uSizeChanging: { color: Color.TECH, amount: 4 },
  })],
// FIGHT: {EXPLORE} If you recruit the Found Hero this turn, set it aside. When you draw a new hand this turn, add that card to your hand.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("Quantum Realm", "Sky Manta", 5, 3, {
    fight: ev => exploreEv(ev, c => {
      addTurnSet('soaring', is(c), () => true); // TODO technically this is not "soaring", but same effect and currently no card effect cares about soaring
    }),
  })],
]},
]);
addVillainTemplates("2099", [
{ name: "Alchemax Enforcers", cards: [
// {CYBER-MOD TECH} Cyber-Nostra gets +1 Attack for each [Tech] card in the Escape Pile.
// AMBUSH: Put the top card of the Hero Deck into the Escape Pile.
// FIGHT: {CYBER-MOD TECH} KO one of your Heroes.
// ATTACK: 3+
// VP: 2
  [ 3, makeVillainCard("Alchemax Enforcers", "Cyber-Nostra", 3, 2, {
    ambush: ev => gameState.herodeck.withTop(c => moveCardEv(ev, c, gameState.escaped)),
    fight: ev => cyberModEnemyEv(ev, Color.TECH, 1, () => selectCardAndKOEv(ev, yourHeroes())),
    varDefense: c => c.printedDefense + cyberModEnemyAmount(Color.TECH),
  })],
// Jigsaw 2099 gets +1 Attack for each Bystander he has.
// AMBUSH: Put the top card of the Hero Deck into the Escape Pile.
// FIGHT: KO one of your Heroes. {CYBER-MOD STRENGTH} If Jigsaw 2099 had no Bystanders, he reenters the city and captures a Bystander for each [Strength] card in the Escape Pile.
// ESCAPE: {CYBER-MOD STRENGTH} Each player gains a Wound.
// ATTACK: 6+
// VP: 5
  [ 1, makeVillainCard("Alchemax Enforcers", "Jigsaw 2099", 6, 5, {
    ambush: ev => gameState.herodeck.withTop(c => moveCardEv(ev, c, gameState.escaped)),
    fight: ev => {
      selectCardAndKOEv(ev, yourHeroes());
      cyberModEnemyEv(ev, Color.STRENGTH, 1, n => {
        if (!ev.source.captured.has(isBystander)) {
          enterCityEv(ev, ev.source);
          captureEv(ev, ev.source, n);
        }
      });
    },
    escape: ev => cyberModEnemyEv(ev, Color.STRENGTH, 1, () => eachPlayer(p => gainWoundEv(ev, p))),
    varDefense: c => c.printedDefense + c.captured.count(isBystander),
  })],
// AMBUSH: Put the top card of the Hero Deck into the Escape Pile. Venture captures a Bystander. {CYBER-MOD RANGED} Venture also captures a non-grey Hero from your discard pile.
// FIGHT: Either KO that captured Hero or choose a player to gain it.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Alchemax Enforcers", "Venture", 5, 3, {
    ambush: ev => {
      gameState.herodeck.withTop(c => moveCardEv(ev, c, gameState.escaped));
      captureEv(ev, ev.source);
      selectCardEv(ev, "Choose a Hero to capture", yourHeroes().limit(isNonGrayHero), c => attachCardEv(ev, c, ev.source, 'VENTURE_CAPTURED'));
    },
    fight: ev => {
      ev.source.attached('VENTURE_CAPTURED').each(c => {
        selectCardOptEv(ev, "Choose a player to gain the Hero", gameState.players, p => gainEv(ev, c, p), () => KOEv(ev, c));
      });
    },
  })],
// {CYBER-MOD INSTINCT} Whackoid gets +1 Attack.
// {CYBER-MOD COVERT COVERT COVERT} Whackoid gets +3 Attack.
// AMBUSH: Put the top card of the Hero Deck into the Escape Pile. Whackoid captures all Bystanders from other Villains in the city.
// If he captures any Bystanders this way, each player gains a Wound.
// ATTACK: 4+
// VP: 3
  [ 2, makeVillainCard("Alchemax Enforcers", "Whackoid", 4, 3, {
    ambush: ev => {
      gameState.herodeck.withTop(c => moveCardEv(ev, c, gameState.escaped));
      const toCapture = cityVillains().flatMap(c => c.captured.limit(isBystander));
      toCapture.each(c => captureEv(ev, ev.source, c));
      toCapture.size > 0 && eachPlayer(p => gainWoundEv(ev, p));
    },
    varDefense: c => c.printedDefense + (cyberModEnemyAmount(Color.INSTINCT) ? 1 : 0) + (cyberModEnemyAmount(Color.COVERT) >= 3 ? 3 : 0),
  })],
]},
{ name: "False Aesir of Alchemax", cards: [
// <b>Uru-Enchanted Weapon</b>
// AMBUSH: Heimdall 2099 captures a Bystander.
// <b>Fight or Fail</b>: If the <i>(Rainbow)</i> Bridge is empty and Heimdall's <b>Uru-Enchanted Weapon</b> revealed a Villain, that Villain enters the Bridge.
// When a Villain enters this way, shuffle a card from the Bystander Deck into the Villain Deck.
// ATTACK: 3+
// VP: 2
  [ 2, makeVillainCard("False Aesir of Alchemax", "Heimdall 2099", 3, 2, {
    ambush: ev => captureEv(ev, ev.source),
    trigger: uruEnchantedTrigger(1),
    fightFail: uruEnchantedFail,
    fight: ev => {
      withCity('BRIDGE', rainbowBridge => {
        isCityEmpty(rainbowBridge) && uruEnchantedCards(ev).limit(isVillain).each(c => {
          enterCityEv(ev, c);
          gameState.bystanders.withTop(b => shuffleIntoEv(ev, b, gameState.villaindeck));
        });
      });
    }
  })],
// <b>2 Uru-Enchanted Weapons</b>
// <b>Fight or Fail</b>: A Henchman Villain from any player's Victory Pile enters the city.
// ESCAPE: Each player KOs two Henchmen from their Victory Pile or gains a Wound.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("False Aesir of Alchemax", "Hela 2099", 3, 3, {
    escape: ev => {
      eachPlayer(p => {
        const options = p.victory.limit(isHenchman);
        if (options.size <= 2) gainWoundEv(ev, p);
        else chooseOneEv(ev, "", ["Gain a Wound", () => gainWoundEv(ev, p)], ["KO 2 Henchmen", () =>
          selectObjectsEv(ev, "Choose Henchmen to KO", 2, options, c => KOEv(ev, c))]);
      });
    },
    trigger: uruEnchantedTrigger(2),
    fightFail: uruEnchantedFail,
    fight: ev => {
      selectCardEv(ev, "Choose a Henchman to enter the city", gameState.players.flatMap(p => p.victory.limit(isHenchman)), c => enterCityEv(ev, c));
    },
  })],
// <b>2 Uru-Enchanted Weapons</b>
// AMBUSH: Shuffle a Master Strike from the KO pile back into the Villain Deck.
// <b>Fight or Fail</b>: If his <b>Uru-Enchanted Weapon</b> revealed any Master Strikes, play one of them.
// ESCAPE: Search the Villain Deck for a Master Strike, shuffle the Villain Deck, and play that Master Strike.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("False Aesir of Alchemax", "Loki 2099", 3, 3, {
    ambush: ev => gameState.ko.limit(isStrike).withFirst(c => shuffleIntoEv(ev, c, gameState.villaindeck)),
    escape: ev => {
      gameState.villaindeck.limit(isStrike).withFirst(c => playStrikeEv(ev, c));
      gameState.villaindeck.shuffle();
    },
    trigger: uruEnchantedTrigger(2),
    fightFail: uruEnchantedFail,
    fight: ev => uruEnchantedCards(ev).limit(isStrike).withFirst(c => playStrikeEv(ev, c)),
  })],
// <b>Uru-Enchanted Weapon</b>
// AMBUSH: Each player discards a card that costs 5 or more or gains a Wound.
// <b>Fight or Fail</b>: Put a card that costs 5 or more from your discard pile on the bottom of your deck.
// ESCAPE: Repeat the Ambush effect.
// ATTACK: 5+
// VP: 4
  [ 2, makeVillainCard("False Aesir of Alchemax", "Thor 2099", 5, 4, {
    ambush: ev => eachPlayer(p => selectCardOptEv(ev, "Choose a card to discard", p.hand.limit(c => c.cost >= 5), c => discardEv(ev, c), () => gainWoundEv(ev, p))),
    fight: ev => {
      selectCardEv(ev, "Choose a card to put on the bottom of your deck", playerState.discard.limit(c => c.cost >= 5), c => moveCardEv(ev, c, playerState.deck, true));
    },
    escape: ev => eachPlayer(p => selectCardOptEv(ev, "Choose a card to discard", p.hand.limit(c => c.cost >= 5), c => discardEv(ev, c), () => gainWoundEv(ev, p))),
    trigger: uruEnchantedTrigger(1),
    fightFail: uruEnchantedFail,
  })],
]},
]);
addVillainTemplates("Weapon X", [
{ name: "Berserkers", cards: [
// {BERSERK}, {BERSERK}
// FIGHT: KO one your Heroes. If any of the cards you Berserked were [Instinct] or [Tech], shuffle Cyber into the Villain Deck, then play another card from the Villain Deck.
// FAIL: Each player discards a [Instinct] or [Tech] Hero or gains a Wound.
// ESCAPE: Do the Fail effect.
// ATTACK: 5+
// VP: 5
  [ 1, makeVillainCard("Berserkers", "Cyber", 5, 5, {
    fight: ev => {
      selectCardAndKOEv(ev, yourHeroes());
      if (enemyBerserkCards(ev).has(Color.INSTINCT | Color.TECH)) {
        shuffleIntoEv(ev, ev.source, gameState.villaindeck);
        playAnotherEv(ev);
      }
    },
    fightFail: enemyBerserkFail(ev => eachPlayer(p => selectCardOrEv(ev, "Choose a Hero to discard", p.hand.limit(Color.INSTINCT | Color.TECH), c => discardEv(ev, c), () => gainWoundEv(ev, p)))),
    escape: ev => eachPlayer(p => selectCardOrEv(ev, "Choose a Hero to discard", p.hand.limit(Color.INSTINCT | Color.TECH), c => discardEv(ev, c), () => gainWoundEv(ev, p))),
    trigger: enemyBerserkTrigger(2),
  })],
// {BERSERK}, {BERSERK}
// FIGHT: Choose a player to gain this as a Hero.
// FAIL: KO a non-grey Hero from your discard pile.
// ESCAPE: Each player discards a non-grey Hero.
// ATTACK: 3+
// GAINABLE
// TEAM: X-Force
// CLASS: [Instinct]
// {POWER Instinct} {BERSERK}, {BERSERK}
// ATTACKG: 2+
  [ 3, makeGainableCard(makeVillainCard("Berserkers", "Feral", 3, u, {
    fight: ev => choosePlayerEv(ev, p => gainEv(ev, ev.source, p)),
    fightFail: ev => selectCardEv(ev, "Choose a Hero to KO", playerState.discard.limit(isNonGrayHero), c => KOEv(ev, c)),
    escape: ev => eachPlayer(p => pickDiscardEv(ev, 1, p, isNonGrayHero)),
    trigger: enemyBerserkTrigger(2),
  }), u, 2, Color.INSTINCT, "X-Force", "D", ev => superPower(Color.INSTINCT) && berserkEv(ev, 2))],
// {BERSERK}
// AMBUSH: Choose a card named "Feral" from any player's discard pile to enter the city as a Villain.
// FIGHT: Draw the card you Berserked.
// FAIL: When you draw a new hand at the end of this turn, discard a card.
// ATTACK: 3+
// VP: 2
  [ 2, makeVillainCard("Berserkers", "Thornn", 3, 2, {
    ambush: ev => selectCardEv(ev, "Choose a card to enter the city", gameState.players.flatMap(p => p.discard.limit(c => c.cardName === "Feral")), c => enterCityEv(ev, c)),
    fight: ev => enemyBerserkCards(ev).each(c => drawCardEv(ev, c)),
    fightFail: enemyBerserkFail(ev => addTurnTrigger('CLEANUP', () => true, () => pickDiscardEv(ev, 1))),
    trigger: enemyBerserkTrigger(1),
  })],
// {BERSERK}, {BERSERK}, {BERSERK}
// FIGHT: KO one of the cards you Berserked this way that costs 0.
// FAIL: KO a card discarded by Wild Child's Berserking that costs 1 or more. <i>(You can't KO cards you shuffled into your deck during the Berserking.)</i>
// ATTACK: 3+
// VP: 4
  [ 2, makeVillainCard("Berserkers", "Wild Child", 3, 4, {
    fight: ev => selectCardEv(ev, "Choose a card to KO", enemyBerserkCards(ev).limit(c => c.cost === 0), c => KOEv(ev, c)),
    fightFail: ev => selectCardEv(ev, "Choose a card to KO", enemyBerserkCards(ev).limit(c => c.cost > 0), c => KOEv(ev, c)),
    trigger: enemyBerserkTrigger(3),
  })],
]},
{ name: "Weapon Plus", cards: [
// {WEAPON X SEQUENCE}
// {BERSERK}
// FIGHT: KO one of your Heroes.
// FAIL: You gain a Wound.
// ATTACK: 3+
// VP: 4
  [ 1, makeVillainCard("Weapon Plus", "Daken", 3, 4, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes()),
    fightFail: ev => gainWoundEv(ev, playerState),
    trigger: enemyBerserkTrigger(1),
    varDefense: weaponXSequenceVarDefense(1),
  })],
// {WEAPON X SEQUENCE}
// AMBUSH: Reveal the top 3 cards of the Hero Deck. Huntsman captures each that costs 4 or less. Put the rest on the bottom of the Hero Deck.
// FIGHT: If Huntsman has any captured Heroes, choose a player to gain one of them and return Huntsman to his city space with the rest of them <i>(Ignore his Ambush.)</i>
// ATTACK: 2+
// VP: 2
  [ 1, makeVillainCard("Weapon Plus", "Huntsman (Weapon XII)", 2, 2, {
    ambush: ev => revealHeroDeckEv(ev, 3, cards => {
      cards.limit(c => c.cost <= 4).each(c => attachCardEv(ev, c, ev.source, 'HUNTSMAN_CAPTURED'));
    }),
    fight: ev => {
      selectCardOrEv(ev, "Choose a Hero to gain", ev.source.attached('HUNTSMAN_CAPTURED'), c => {
        choosePlayerEv(ev, p => gainEv(ev, c, p));
      }, () => {
        enterCityEv(ev, ev.source, u, u, true);
      });
    },
    varDefense: weaponXSequenceVarDefense(1),
  })],
// {WEAPON X SEQUENCE}
// FIGHT: Reveal the top card of the Hero Deck as "Nuke's Adrenaline Pill":
// {POWER Covert} "Rage" — Each other player gains a Wound.
// {POWER Instinct} "Balance" — Draw a card.
// {POWER Ranged} "Relax" — You get +2 Recruit.
// ESCAPE: Each player gains a Wound.
// ATTACK: 2+
// VP: 2
  [ 2, makeVillainCard("Weapon Plus", "Nuke (Weapon VII)", 2, 2, {
    fight: ev => revealHeroDeckEv(ev, 1, cards => cards.each(c => {
      isColor(Color.COVERT)(c) && eachOtherPlayerVM(p => gainWoundEv(ev, p));
      isColor(Color.INSTINCT)(c) && drawEv(ev);
      isColor(Color.RANGED)(c) && addRecruitEvent(ev, 2);
    })),
    escape: ev => eachPlayer(p => gainWoundEv(ev, p)),
    varDefense: weaponXSequenceVarDefense(1),
  })],
// {WEAPON X SEQUENCE}
// AMBUSH: Skinless Man captures a Bystander of your choice from your Victory Pile. If you don't have one, gain a Wound and he captures one from the Bystander Deck.
// ATTACK: 3+
// VP: 3
  [ 1, makeVillainCard("Weapon Plus", "Skinless Man (Weapon III)", 3, 3, {
    ambush: ev => selectCardOptEv(ev, "Choose a Bystander to capture", playerState.victory.limit(isBystander), c => captureEv(ev, ev.source, c), () => {
      gainWoundEv(ev, playerState);
      captureEv(ev, ev.source);
    }),
    varDefense: weaponXSequenceVarDefense(1),
  })],
// {WEAPON X SEQUENCE}
// FIGHT: Reveal the top card of the Hero Deck as her "Personality":
// {POWER Strength} "Typhoid" — Put a card from your discard pile on top of the deck of the player to your left.
// {POWER Instinct} "Mary" — Rescue a Bystander.
// {POWER Covert} "Bloody Mary" — Each other player gains a Wound.
// {POWER Tech} "Mutant Zero" — KO one of your cards that costs 0.
// {POWER Ranged} "Walker" — Put a card you played this turn on top of your deck.
// ATTACK: 3+
// VP: 3
  [ 2, makeVillainCard("Weapon Plus", "Typhoid Mary (Weapon IX)", 3, 3, {
    fight: ev => revealHeroDeckEv(ev, 1, cards => cards.each(c => {
      isColor(Color.STRENGTH)(c) && selectCardEv(ev, "Choose a card to put on top of the deck", playerState.discard.deck, c2 => moveCardEv(ev, c2, playerState.left.deck));
      isColor(Color.INSTINCT)(c) && rescueEv(ev);
      isColor(Color.COVERT)(c) && eachOtherPlayerVM(p => gainWoundEv(ev, p));
      isColor(Color.TECH)(c) && selectCardAndKOEv(ev, revealable().limit(c => c.cost === 0));
      isColor(Color.RANGED)(c) && selectCardEv(ev, "Choose a card to put on top of your deck", playerState.playArea.deck, c2 => moveCardEv(ev, c2, playerState.deck));
    })),
    varDefense: weaponXSequenceVarDefense(1),
  })],
// <b>Doubled Weapon X Sequence</b>
// AMBUSH: Each player discards a non-grey Hero.
// FIGHT: Each player KOs one of their grey Heroes.
// ESCAPE: Each player KOs one of their non-grey Heroes.
// ATTACK: 4+
// VP: 6
  [ 1, makeVillainCard("Weapon Plus", "Ultimaton (Weapon XV)", 4, 6, {
    ambush: ev => eachPlayer(p => pickDiscardEv(ev, 1, p, isNonGrayHero)),
    fight: ev => eachPlayer(p => selectCardAndKOEv(ev, p.discard.limit(Color.GRAY), p)),
    escape: ev => eachPlayer(p => selectCardAndKOEv(ev, p.discard.limit(isNonGrayHero), p)),
    varDefense: weaponXSequenceVarDefense(2),
  })],
]},
]);
