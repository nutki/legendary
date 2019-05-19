"use strict";
addTemplates("MASTERMINDS", "Legendary", [
makeMastermindCard("Dr. Doom", 9, 5, "Doombot Legion", ev => {
  // Each player with exactly 6 cards in hand reveals a [Tech] Hero or puts 2 cards from their hand on top of their deck.
  eachPlayer(p => { if (p.hand.size === 6) revealOrEv(ev, Color.BLACK, () => { pickTopDeckEv(ev, p); pickTopDeckEv(ev, p); }, p); });
}, [
  // You may recruit a [Tech] or [Ranged] Hero from the HQ for free.
  [ "Dark Technology", ev => {
    selectCardEv(ev, "Recruit a Hero for free", HQCards().limit(Color.BLACK | Color.BLUE), sel => recruitForFreeEv(ev, sel));
  } ],
  // Choose one: each other player draws a card or each other player discards a card.
  [ "Monarch's Decree", ev => {
      chooseOneEv(ev, "Each other player",
      ["draws a card", ev => eachOtherPlayerVM(p => drawEv(ev, 1, p))],
      ["discards a card", ev => eachOtherPlayerVM(p => pickDiscardEv(ev, p))]
      );
  } ],
  // Take another turn after this one.
  [ "Secrets of Time Travel", ev => {
    gameState.extraTurn = true; // TODO: multiplayer
  } ],
  // When you draw a new hand of cards at the end of this turn, draw three extra cards.
  [ "Treasures of Latveria", ev => addEndDrawMod(3) ],
]),
makeMastermindCard("Loki", 10, 5, "Enemies of Asgard", ev => {
// Each player reveals a [Strength] Hero or gains a Wound
  eachPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p));
}, [
  // Defeat a Villain in the City for free.
  [ "Cruel Ruler", ev => selectCardEv(ev, "Defeat a Villain", CityCards().limit(isVillain), sel => defeatEv(ev, sel)) ],
  // KO up to four cards from your discard pile.
  [ "Maniacal Tyrant", ev => selectObjectsUpToEv(ev, "KO up to 4 cards", 4, playerState.discard.deck, sel => KOEv(ev, sel)) ],
  // Each other player KOs a Villain from their Victory Pile.
  [ "Vanishing Illusions", ev => eachOtherPlayerVM(p => selectCardEv(ev, "KO a Villain", p.victory.limit(isVillain), sel => KOEv(ev, sel), p)) ],
  // Each other player KOs two Bystanders from their Victory Pile.
  [ "Whispers and Lies", ev => eachOtherPlayerVM(p => selectObjectsEv(ev, "KO 2 Bystanders", 2, p.victory.limit(isBystander), sel => KOEv(ev, sel), p)) ],
]),
makeMastermindCard("Magneto", 8, 5, "Brotherhood", ev => {
// Each player reveals an X-Men Hero or discards down to four cards.
  eachPlayer(p => revealOrEv(ev, 'X-Men', () => selectObjectsEv(ev, "Choose cards to discard", p.hand.size - 4, p.hand.deck, sel => discardEv(ev, sel), p), p));
}, [
  // Recruit an X-Men Hero from the HQ for free.
  [ "Bitter Captor", ev => selectCardEv(ev, "Recruit an X-Men for free", HQCards().limit('X-Men'), sel => recruitForFreeEv(ev, sel)) ],
  // Each other player reveals an X-Men Hero or gains two Wounds.
  [ "Crushing Shockwave", ev => {
    eachOtherPlayerVM(p => revealOrEv(ev, 'X-Men', () => { gainWoundEv(ev, p); gainWoundEv(ev, p); }, p));
  } ],
  // Choose one of your X-Men Heroes. When you draw a new hand of cards at the end of this turn, add that Hero to your hand as a seventh card.
  [ "Electromagnetic Bubble", ev => {
    selectCardEv(ev, "Choose an X-Men", yourHeroes().limit('X-Men'), sel => addTurnTrigger("CLEANUP", undefined, ev => moveCardEv(ev, sel, playerState.hand)));
  } ],
  // For each of your X-Men Heroes, rescue a Bystander.
  [ "Xavier's Nemesis", ev => {
    rescueEv(ev, yourHeroes().count("X-Men"));
  } ],
]),
makeMastermindCard("Red Skull", 7, 5, "HYDRA", ev => {
// Each player KOs a Hero from their hand.
  eachPlayer(p => selectCardAndKOEv(ev, p.hand.limit(isHero), p));
}, [
  // You get +4 Recruit.
  [ "Endless Resources", ev => addRecruitEvent(ev, 4) ],
  // Draw two cards. Then draw another card for each HYDRA Villain in your Victory Pile.
  [ "HYDRA Conspiracy", ev => drawEv(ev, 2 + playerState.victory.count(isGroup(ev.source.mastermind.leads))) ],
  // You get +3 Attack.
  [ "Negablast Grenades", ev => addAttackEvent(ev, 3) ],
  // Look at the top three cards of your deck. KO one, discard one and put one back on top of your deck.
  [ "Ruthless Dictator", ev => {
    lookAtDeckEv(ev, 3, () => { selectCardEv(ev, "Choose a card to KO", playerState.revealed.deck, sel => KOEv(ev, sel)); selectCardEv(ev, "Choose a card to discard", playerState.revealed.deck, sel => discardEv(ev, sel)); });
  } ],
]),
]);

addTemplates("MASTERMINDS", "Dark City", [
// Four Horsemen Villains get +2 Attack
// Apocalypse Wins: When Famine, Pestilence, War, and Death have escaped
makeMastermindCard("Apocalypse", 12, 6, "Four Horsemen", ev => {
// Each player reveals their hand and puts all their Heroes that cost 1 or more on top of their deck.
  // TODO multiplayer reveal?
  eachPlayer(p => p.hand.limit(c => c.cost >= 1).each(c => moveCardEv(ev, c, p.deck)));
}, [
  [ "Apocalyptic Destruction", ev => {
  // Each other player KOs two Heroes from their discard pile that each cost 1 or more.
    eachOtherPlayerVM(p => selectObjectsEv(ev, "KO two Heroes", 2, p.discard.limit(c => c.cost >= 1), c => KOEv(ev, c), p));
  } ],
  [ "The End of All Things", ev => {
  // Each other player reveals the top three cards of their deck, KOs each one of those cards that cost 1 or more, and puts the rest back in any order.
    eachOtherPlayerVM(p => lookAtDeckEv(ev, 3, ev => p.revealed.limit(c => c.cost >= 1).each(c => KOEv(ev, c)), p));
  } ],
  [ "Horsemen Are Drawing Nearer", ev => {
  // Each other player plays a Four Horsemen Villain from their Victory Pile as if playing it from the Villain Deck.
    // TODO multiplayer order?
    eachOtherPlayerVM(p => selectCardEv(ev, "Play a Villain", p.victory.limit(c => c.villainGroup == ev.source.mastermind.leads), c => villainDrawEv(ev, c), p));
  } ],
  [ "Immortal and Undefeated", ev => {
  // If this is not the final Tactic, rescue six Bystanders and shuffle this Tactic back into the other Tactics.
    if (!finalTactic(ev.source)) { rescueEv(ev, 6); shuffleIntoEv(ev, ev.source, ev.source.mastermind.attachedDeck("TACTICS")); }
  } ],
], { init: m => {
  const f = (c: Card) => c.villainGroup === m.leads;
  addStatMod('defense', f, 2);
  let groupSize = gameState.villaindeck.limit(f).uniqueCount(c => c.cardName);
  gameState.triggers.push({
    event: "ESCAPE",
    match: ev => ev.what.villainGroup === m.leads,
    after: ev => { if (gameState.escaped.limit(f).uniqueCount(c => c.cardName) === groupSize) evilWinsEv(ev, m) }
  })
}}),
// {BRIBE}
makeMastermindCard("Kingpin", 13, 6, "Streets of New York", ev => {
// Each player reveals a Marvel Knights Hero or discards their hand and draws 5 cards.
  eachPlayer(p => revealOrEv(ev, "Marvel Knights", () => { discardHandEv(ev, p); drawEv(ev, 5, p); }, p));
}, [
  [ "Call a Hit", ev => {
  // Choose a Hero from each player's discard pile and KO it.
    eachPlayer(p => selectCardAndKOEv(ev, p.discard.deck));
  } ],
  [ "Criminal Empire", ev => {
  // If this is not the final Tactic, reveal the top three cards of the Villain Deck. Play all the Villains you revealed. Put the rest back in random order.
    if (!finalTactic(ev.source)) revealVillainDeckEv(ev, 3, r => r.limit(isVillain).each(c => villainDrawEv(ev, c)));
  } ],
  [ "Dirty Cops", ev => {
  // Put a 0 Cost Hero from the KO pile on top of each other player's deck.
    eachOtherPlayerVM(p => selectCardEv(ev, `Choose a card to put on top of ${p.name}'s deck`, gameState.ko.limit(isHero).limit(c => !c.cost), c => moveCardEv(ev, c, p.deck)));
  } ],
  [ "Mob War", ev => {
  // Each other player plays a Henchman Villain from their Victory Pile as if playing it from the Villain Deck.
    eachOtherPlayerVM(p => selectCardEv(ev, "Choose a Henchman to play", p.victory.limit(isHenchman), c => villainDrawEv(ev, c), p));
  } ],
], { bribe: true }),
// Whenever a player gains a Wound, put it on top of that player's deck.
makeMastermindCard("Mephisto", 10, 6, "Underworld", ev => {
// Each player reveals a Marvel Knights Hero or gains a Wound.
  eachPlayer(p => revealOrEv(ev, "Marvel Knights", () => gainWoundEv(ev, p), p));
}, [
  [ "Damned If You Do...", ev => {
  // Each other player KOs a Bystander from their Victory Pile or gains a Wound.
    eachOtherPlayerVM(p => selectCardOptEv(ev, "Choose a Bystander to KO", p.victory.limit(isBystander), c => KOEv(ev, c), () => gainWoundEv(ev, p), p));
  } ],
  [ "Devilish Torment", ev => {
  // Each other player puts all 0 Cost cards from their discard pile on top of their deck in any order.
    const f = (p: Player) => selectCardEv(ev, "Put a card on top of your deck", p.discard.limit(c => !c.cost), c => { moveCardEv(ev, c, p.deck); cont(ev, () => f(p)); }, p);
    eachOtherPlayerVM(f);
  } ],
  [ "Pain Begets Pain", ev => {
  // Choose any number of Wounds from your hand and discard pile. The player to your right gains them.
    selectObjectsAnyEv(ev, `Choose Wounds for ${playerState.right.name} to gain`, handOrDiscard().limit(isWound), c => gainEv(ev, c, playerState.right));
  } ],
  [ "The Price of Failure", ev => {
  // Each other player without a Mastermind Tactic in their Victory Pile gains a Wound.
    eachOtherPlayerVM(p => { if (!p.victory.has(isTactic)) gainWoundEv(ev, p); });
  } ],
], { trigger: {
  event: "GAIN",
  match: ev => isWound(ev.what) && ev.where !== ev.who.deck,
  replace: (ev) => gainToDeckEv(ev, ev.parent.what, ev.parent.who)
}}),
// Mr. Sinister gets +1 Attack for each Bystander he has.
makeMastermindCard("Mr. Sinister", 8, 6, "Marauders", ev => {
// Mr. Sinister captures a Bystander. Then each player with exactly 6 cards reveals a [Covert] Hero or discards cards equal to the number of Bystanders Mr. Sinister has.
  let sinister = ev.source;
  captureEv(ev, sinister);
  cont(ev, () => eachPlayer(p => p.hand.size === 6 && revealOrEv(ev, Color.COVERT, () => selectObjectsEv(ev, "Select cards to discard", sinister.captured.count(isBystander), p.hand.deck, c => discardEv(ev, c)), p)));
}, [
  [ "Human Experimentation", ev => {
  // Mr. Sinister captures Bystanders equal to the number of Villains in the city.
    captureEv(ev, ev.source.mastermind, CityCards().count(isVillain));
  } ],
  [ "Master Geneticist", ev => {
  // Reveal the top seven cards of the Villain Deck. Mr. Sinister captures all of the Bystanders you revealed. Put the rest back in random order.
    revealVillainDeckEv(ev, 7, r => r.limit(isBystander).each(c => captureEv(ev, ev.source.mastermind, c)));
  } ],
  [ "Plans Within Plans", ev => {
  // Mr. Sinister captures a Bystander for each Mr. Sinister Tactic in players' Victory Piles, including this Tactic.
    captureEv(ev, ev.source.mastermind, gameState.players.sum(p => p.victory.count(c => ev.source.mastermind === c.mastermind)));
  } ],
  [ "Telepathic Manipulation", ev => {
  // Mr. Sinister captures a Bystander from each other player's Victory Pile.
    eachOtherPlayerVM(p => selectCardEv(ev, "Choose a Bystander", p.victory.limit(isBystander), c => captureEv(ev, ev.source.mastermind, c)));
  } ],
], {
  varDefense: c => c.printedDefense + c.captured.count(isBystander),
}),
// Stryfe gets +1 Attack for each Master Strike stacked next to him. Each player reveals an X-Force Hero or discards a card at random.
makeMastermindCard("Stryfe", 7, 6, "MLF", ev => {
// Stack this Master Strike next to Stryfe.
  attachCardEv(ev, ev.what, ev.source, "STRIKE");
  eachPlayer(p => revealOrEv(ev, "X-Force", () => p.deck.withRandom(c => discardEv(ev, c)), p));
}, [
  [ "Furious Wrath", ev => {
  // Reveal the top six cards of the Villain Deck. Play all the Master Strikes you revealed. Put the rest back in random order.
    revealVillainDeckEv(ev, 6, r => r.limit(isStrike).each(c => playStrikeEv(ev, c)));
  } ],
  [ "Psychic Torment", ev => {
  // Look at the top five cards of your deck. Put one into your hand and discard the rest.
    lookAtDeckEv(ev, 5, ev => {
      selectCardEv(ev, "Choose a card to put in your hand", playerState.revealed.deck, c => moveCardEv(ev, c, playerState.hand));
      cont(ev, () => playerState.revealed.each(c => discardEv(ev, c)));
    })
  } ],
  [ "Swift Vengeance", ev => {
  // A Wound from the Wound Stack becomes a Master Strike that takes effect immediately.
    gameState.wounds.withTop(c => playStrikeEv(ev, c));
  } ],
  [ "Tide of Retribution", ev => {
  // Each other player reveals an X-Force Hero or gains a Wound.
    eachOtherPlayerVM(p => revealOrEv(ev, "X-Force", () => gainWoundEv(ev, p), p));
  } ],
], {
  varDefense: c => c.printedDefense + c.attached("STRIKE").size,
}),
]);
