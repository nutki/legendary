"use strict";
addTemplates("VILLAINS", "Legendary", [
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
     varVP: c => 3 * c.location.count(isGroup("HYDRA")), 
  })],
// FIGHT: Each player without another HYDRA Villain in their Victory Pile gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("HYDRA", "Viper", 5, 3, {
    fight: ev => eachPlayer(p => { if (p.victory.count(isGroup("HYDRA")) === 0) gainWoundEv(ev, p); }),
    escape: ev => eachPlayer(p => { if (p.victory.count(isGroup("HYDRA")) === 0) gainWoundEv(ev, p); }),
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
    varVP: c => 2 + owned(c.location.owner).count(Color.TECH)
  })],
// FIGHT: If you fight Whirlwind on the Rooftops or Bridge, KO two of your Heroes.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Masters of Evil", "Whirlwind", 4, 2, {
    fight: ev => { if(ev.where.id === "ROOFTOPS" || ev.where.id === "BRIDGE") selectObjectsEv(ev, "Choose Heroes to KO", 2, yourHeroes(), sel => KOEv(ev, sel)); },
  })],
]},
{ name: "Radiation", cards: [
// FIGHT: If you fight Abomination on the Streets or Bridge, rescue three Bystanders.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Radiation", "Abomination", 5, 3, {
    fight: ev => { if(ev.where.id === "STREETS" || ev.where.id === "BRIDGE") rescueEv(ev, 3); },
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
    fight: ev => { if(ev.where.id === "SEWERS") eachOtherPlayerVM(p => gainWoundEv(ev, p)); },
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
addTemplates("VILLAINS", "Dark City", [
{ name: " Emissaries of Evil", cards: [
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Villain, play it.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard(" Emissaries of Evil", "Egghead", 4, 2, {
    ambush: ev => revealVillainDeckEv(ev, 1, c => c.limit(isVillain).each(c => villainDrawEv(ev, c)))
  })],
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Scheme Twist, play it.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard(" Emissaries of Evil", "Electro", 6, 4, {
    ambush: ev => revealVillainDeckEv(ev, 1, c => c.limit(isTwist).each(c => playTwistEv(ev, c)))
  })],
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Bystander, Gladiator captures it.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard(" Emissaries of Evil", "Gladiator", 5, 3, {
    ambush: ev => revealVillainDeckEv(ev, 1, c => c.limit(isBystander).each(c => captureEv(ev, ev.source, c)))
  })],
// AMBUSH: Reveal the top card of the Villain Deck. If it's a Master Strike, each player gains a Wound.
// ESCAPE: Each player gains a Wound.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard(" Emissaries of Evil", "Rhino", 5, 3, {
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
    fight: ev => eachOtherPlayerVM(p => lookAtDeckEv(ev, 3, ev => p.hand.limit(c => c.cost >= 1).each(c => discardEv(ev, c)), p)), // TODO multiplayer reveal
    escape: ev => eachPlayer(p => lookAtDeckEv(ev, 3, ev => p.hand.limit(c => c.cost >= 1).each(c => discardEv(ev, c)), p)),
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
    ambush: ev => villainIn("BANK").withTop(c => { captureEv(ev, c); captureEv(ev, ev.source); }),
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
    ambush: ev => eachPlayer(p => selectCardEv(ev, "Choose a Bystander for Scalphunter", p.victory.deck, c => captureEv(ev, ev.source, c), p)),
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
    fightCond: () => revealable().limit(isHero).unique(c => c.cardName).size >= 4
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
    fight: ev => { if (ev.where.id === "SEWERS" || ev.where.id === "BANK") selectObjectsEv(ev, "KO two Heroes", 2, yourHeroes(), c => KOEv(ev, c)); },
  })],
// To fight Zero, you must also discard three cards that cost 0.
// ATTACK: 0*
// VP: 2
  [ 2, makeVillainCard("MLF", "Zero", 0, 2, {
    fightCond: () => playerState.hand.count(c => c.cost === 0) >= 3,
    fightCost: ev => selectObjectsEv(ev, "Discard three cards", 3, playerState.hand.deck, c => KOEv(ev, c))
  })],
]},
{ name: "Streets of New York", cards: [
// FIGHT: KO one of your Heroes with a Recruit icon and one of your Heroes with an Attack icon.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Streets of New York", "Bullseye", 6, 4, {
    fight: ev => { selectCardAndKOEv(ev, yourHeroes().limit(c => c.printedRecruit !== undefined)); selectCardAndKOEv(ev, yourHeroes().limit(c => c.printedAttack !== undefined)); },
  })],
// {BRIBE}
// FIGHT: KO one of your Heroes with a Recruit icon.
// ATTACK: 5*
// VP: 2
  [ 2, makeVillainCard("Streets of New York", "Hammerhead", 5, 2, {
    fight: ev => selectCardAndKOEv(ev, yourHeroes().limit(c => c.printedRecruit !== undefined)),
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
    escape: ev => eachPlayer(p => { if (p.victory.count(c => c.cardName === "Dracula") === 0) gainWoundEv(ev, p); }),
  })],
]},
]);
