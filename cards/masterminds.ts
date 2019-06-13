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
  replace: (ev) => gainToDeckEv(ev, ev.parent.what, ev.parent.who) // TODO this retriggers events on GAIN, maybe replace by modify: Ev => Ev
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
addTemplates("MASTERMINDS", "Fantastic Four", [
// Cosmic Threat: [Strength] [Instinct] [Covert] [Tech] [Ranged]
// Galactus Wins: When the city is destroyed.
makeMastermindCard("Galactus", 20, 7, "Heralds of Galactus", ev => {
// Destroy the city space closest to Galactus. Any Villain there escapes. Put this Master Strike there.
    const space = gameState.city[0];
    destroyCity(space);
    if (!gameState.city.size) evilWinsEv(ev, ev.source);
    space.deck.limit(isVillain).each(c => villainEscapeEv(ev, c));
    moveCardEv(ev, ev.source, space);
}, [
  [ "Cosmic Entity", ev => {
  // Choose [Strength], [Instinct], [Covert], [Tech] or [Ranged]. Each player reveals any number of cards of that class, then draws that many cards.
    chooseColorEv(ev, color => eachPlayer(p => {
      let count = 0;
      selectObjectsAnyEv(ev, "Reveal cards", revealable(p).limit(color), () => count++, p);
      drawEv(ev, count, p);
    }))
  } ],
  [ "Force of Eternity", ev => {
  // When you draw a new hand of cards at the end of this turn, draw six extra cards, then discard six cards.
    addEndDrawMod(6);
    addTurnTrigger("CLEANUP", undefined, ev => selectObjectsEv(ev, "Discard 6 cards", 6, playerState.hand.deck, c => discardEv(ev, c)));
  } ],
  [ "Panicked Mobs", ev => {
  // Choose [Strength], [Instinct], [Covert], [Tech] or [Ranged]. Each player reveals any number of cards of that class, then rescues that many Bystanders.
    chooseColorEv(ev, color => eachPlayer(p => {
      selectObjectsAnyEv(ev, "Reveal cards", revealable(p).limit(color), () => rescueByEv(ev, p), p);
    }))
  } ],
  [ "Sunder the Earth", ev => {
  // Each other player KOs all Heroes from their discard pile with the same card name as a Hero in the HQ.
    const hqNames = HQCards().limit(isHero).map(c => c.cardName);
    eachOtherPlayerVM(p => p.discard.limit(isHero).limit(c => hqNames.includes(c.cardName)).each(c => KOEv(ev, c)));
  } ],
]),
// Mole Man gets +1 Attack for each Subterranea Villain that has escaped.
makeMastermindCard("Mole Man", 7, 6, "Subterranea", ev => {
// All Subterranea Villains in the city escape. If any Villains escaped this way, each player gains a Wound.
  const villains = CityCards().limit(c => c.villainGroup === ev.source.leads);
  villains.each(c => villainEscapeEv(ev, c));
  villains.size && eachPlayer(p => gainWoundEv(ev, p));
}, [
  [ "Dig to Freedom", ev => {
  // Each other player chooses a Subterranea Villain in their Victory Pile and puts it into the Escaped Villains pile.
      eachOtherPlayerVM(p => selectCardEv(ev, "Choose a villain", p.victory.limit(c => c.villainGroup === ev.source.mastermind.leads), c => moveCardEv(ev, c, gameState.escaped), p))
  } ],
  [ "Master of Monsters", ev => {
  // If this is not the final Tactic, reveal the top six cards of the Villain Deck. Play all the Subterranea Villains you revealed. Put the rest on the bottom of the Villain Deck in random order.
    finalTactic(ev.source) || revealVillainDeckEv(ev, 6, r => r.limit(c => c.villainGroup === ev.source.mastermind.leads).each(c => villainDrawEv(ev, c)), true, true)
  } ],
  [ "Secret Tunnel", ev => {
  // You get +6 Attack usable only against Villains in the Streets.
    addAttackSpecialEv(ev, c => isVillain(c) && isLocation(c.location, 'STREETS'), 6);
  } ],
  [ "Underground Riches", ev => {
  // You get +6 Recruit usable only to recruit Heroes in the HQ space under the Streets.
    addRecruitSpecialEv(ev, c => c.location.below && isLocation(c.location.below, 'STREETS'), 6);
  } ],
], {
  varDefense: c => c.printedDefense + gameState.escaped.count(v => v.villainGroup === c.leads),
}),
]);
addTemplates("MASTERMINDS", "Paint the Town Red", [
makeMastermindCard("Carnage", 9, 6, "Maximum Carnage", ev => {
// Feast on each player. Whenever this Master Strike feasts on a player's 0-cost Hero, that player gains a Wound.
  eachPlayer(p => feastEv(ev, c => isHero(c) && !c.cost && gainWoundEv(ev, p), p));
}, [
  [ "Drooling Jaws", ev => {
  // Each player reveals the top card of their deck. Then Carnage feasts on the player of your choice.
  } ],
// {FEAST}
// If Carnage feasts on a 0-cost Hero this way, repeat this process.
  [ "Endless Hunger", ev => {
    function f() { feastEv(ev, c => isHero(c) && !c.cost && f()); };
    f();
  } ],
// {FEAST}
// You get + Recruit equal to the Cost of the card Carnage feasts on.
  [ "Feed Me", ev => {
    feastEv(ev, c => addRecruitEvent(ev, c.cost))
  } ],
// {FEAST}
// If Carnage feasts on a 0-cost Hero this way, each other player KOs a Bystander from their Victory Pile.
  [ "Om Nom Nom", ev => {
    feastEv(ev, c => isHero(c) && !c.cost && eachOtherPlayerVM(p => selectCardAndKOEv(ev, p.victory.limit(isBystander), p)))
  } ],
]),
makeMastermindCard("Mysterio", 8, 6, "Sinister Six", ev => {
// Shuffle this Master Strike into Mysterio's face down Mastermind Tactics. That card becomes a Mastermind Tactic worth 6 VP.
  addStatSet('vp', c => c === ev.source, () => 6);
  addStatSet('isTactic', c => c === ev.source, () => true);
  shuffleIntoEv(ev, ev.source, ev.source.attachedDeck("TACTICS"));
}, [
  [ "Blurring Images", ev => {
  // You get +1 Recruit for each Mastermind Tactic Mysterio has left after this one.
    addRecruitEvent(ev, ev.source.mastermind.attachedDeck("TACTICS").size);
  } ],
  [ "Captive Audience", ev => {
  // Rescue a Bystander for each Mastermind Tactic Mysterio has left after this one.
    rescueEv(ev, ev.source.mastermind.attachedDeck("TACTICS").size);
  } ],
  [ "Master of Illusions", ev => {
  // If this is not the final Tactic, shuffle a Master Strike Tactic from each other player's Victory Pile back into Mysterio's Mastermind Tactics.
    finalTactic(ev.source) || eachOtherPlayerVM(p => selectCardEv(ev, "Choose Master Strike to shuffle back", p.victory.limit(c => isTactic(c) && isStrike(c)), c => {
      shuffleIntoEv(ev, ev.source, ev.source.mastermind.attachedDeck("TACTICS"));  
    }, p));
  } ],
  [ "Mists of Deception", ev => {
  // If this is not the final Tactic, reveal the top five cards of the Villain Deck. Play all the Master Strikes you revealed. Put the rest on the bottom of that deck in random order.
    finalTactic(ev.source) || revealVillainDeckEv(ev, 5, revealed => revealed.limit(isStrike).each(c => playStrikeEv(ev, c)), true, true);
  } ],
]),
]);
addTemplates("MASTERMINDS", "Villains", [
makeMastermindCard("Dr. Strange", 8, 6, "Defenders", ev => {
// Command Strike: Reveal the top three cards of the Adversary Deck. Put the Adversary you revealed with the highest printed Attack on top of that deck. Then play a Plot Twist from among the cards you revealed. Then put the rest of those cards on the bottom of that deck in random order.
  revealVillainDeckEv(ev, 3, cards => {
    const max = cards.limit(isVillain).max(c => c.printedDefense);
    selectCardEv(ev, "Select card to put on to of the Villain deck", cards.limit(c => isVillain(c) && c.defense === max), c => moveCardEv(ev, c, gameState.villaindeck));
    cards.limit(isStrike).withFirst(c => villainDrawEv(ev, c));
  }, true, true);
// 
}, [
  [ "Book of the Vishanti", ev => {
  // Each other player reveals a [Covert] Ally or discards all the cards in their hand, then draws as many cards as they discarded.
    eachPlayer(p => revealOrEv(ev, Color.COVERT, () => { discardHandEv(ev, p); drawEv(ev, p.hand.size, p); }, p));
  } ],
  [ "Crimson Bands of Cyttorak", ev => {
  // Each other player reveals their hand, then gains a Bindings for each non-grey Ally that player has.
    eachPlayer(p => repeat(yourHeroes(p).count(isNonGrayHero), () => gainBindingsEv(ev, p)));
  } ],
  [ "Eye of Agamotto", ev => {
  // Reveal cards from the Ally Deck equal to the number of players. Put one of those cards into each player's discard pile.
    revealHeroDeckEv(ev, gameState.players.size, cards => {
      const selected: Card[] = [];
      eachPlayer(p => cont(ev, () => {
        selectCardEv(ev, `Select card for ${p.name} to gain`, cards.limit(c => !selected.includes(c)), c => { selected.push(c); gainEv(ev, c, p); });
      }))
    });
  } ],
  [ "Winds of Watoomb", ev => {
  // After you draw a new hand of cards at the end of this turn, each player simultaneously passes a non-grey Ally from their hand to the hand of the player on their left.
    addTurnTrigger("CLEANUP", u, () => {
      let selected: { p: Player, c: Card}[] = [];
      eachPlayer(p => selectCardEv(ev, "Select a card to pass", p.hand.deck, c => selected.push({ p, c }), p));
      cont(ev, () => selected.each(({ p, c }) => moveCardEv(ev, c, p.left.hand)));
    });
  } ],
]),
makeMastermindCard("Nick Fury", 9, 6, "Avengers", ev => {
// Stack this Strike next to Nick Fury. Then demolish each player once for each Strike stacked here.
  attachCardEv(ev, ev.what, ev.source, "STRIKE");
  repeat(ev.source.attached("STRIKE").size, () => demolishEv(ev));
}, [
  [ "Bounty on Fury's Head", ev => {
  // KO any number of your Hydra Allies. For each Ally you KO'd this way, you may gain a Madame HYDRA.
    selectObjectsAnyEv(ev, "KO HYDRA Allies", yourHeroes().limit("HYDRA"), c => KOEv(ev, c));
    cont(ev, () => repeat(turnState.pastEvents.count(e => e.type === "KO" && e.parent === ev), () => chooseMayEv(ev, "Gain Madame HYDRA", () => gameState.madame.withTop(c => gainEv(ev, c)))));
  } ],
  [ "Purge Hydra", ev => {
  // Each other player reveals their hand and discards two Hydra Allies.
    eachPlayer(p => selectObjectsEv(ev, "Discard 2 HYDRA Allies", 2, p.hand.limit("HYDRA"), c => discardEv(ev, c), p));
  } ],
  [ "The Avengers Initiative", ev => {
  // Each other player reveals a [Tech] Ally or chooses an Avengers Adversary from their Victory Pile and it enters the Bridge.
    withCity("BRIDGE", bridge => eachOtherPlayerVM(p => revealOrEv(ev, Color.TECH, () => selectCardEv(ev, "Select an Adversary", p.victory.limit(c => c.villainGroup === "Avengers"), c => moveCardEv(ev, c, bridge)), p)));
  } ],
  [ "Total Fury", ev => {
  // Defeat an Adversary whose Attack is less than the number of Hydra Allies in the KO pile.
    selectCardEv(ev, "Defeat an Adversary", villains().limit(c => c.defense < gameState.ko.count("HYDRA")), c => defeatEv(ev, c));
  } ],
]),
// Odin gets +1 Attack for each Asgardian Warrior in the city and in the Overrun Pile.
makeMastermindCard("Odin", 10, 6, "Asgardian Warriors", ev => {
// Each player puts an Asgardian Warrior from their Victory Pile into an empty city space. Any player who cannot do so gains a Bindings.
  eachPlayer(p => selectCardOrEv(ev, "Select an Asgardian Warrior", p.victory.limit(c => gameState.city.has(d => !d.size) && c.villainGroup === ev.source.leads), c => {
    selectCardEv(ev, "Select an empty city space", gameState.city.limit(d => !d.size), d => moveCardEv(ev, c, d), p);
  }, () => gainBindingsEv(ev, p), p));
}, [
  [ "Divine Justice", ev => {
  // Each other player with a Bindings in their discard pile gains another Bindings.
    eachOtherPlayerVM(p => p.discard.has(isBindings) && gainBindingsEv(ev, p));
  } ],
  [ "Might of Valhalla", ev => {
  // Draw a card for each Asgardian Warrior in your Victory Pile.
    drawEv(ev, playerState.victory.count(c => c.villainGroup === ev.source.mastermind.leads));
  } ],
  [ "Riches of Asgard", ev => {
  // You get +1 Recruit for each Asgardian Warrior in your Victory Pile.
    addRecruitEvent(ev, playerState.victory.count(c => c.villainGroup === ev.source.mastermind.leads));
  } ],
  [ "Ride of the Valkyries", ev => {
  // Each other player reveals a Foes of Asgard Ally or discards a card for each Asgardian Warrior in the Overrun Pile.
    eachOtherPlayerVM(p => revealOrEv(ev, "Foes of Asgard", () => repeat(gameState.escaped.count(c => c.villainGroup === ev.source.mastermind.leads), () => pickDiscardEv(ev, p)), p));
  } ],
], {
  varDefense: c => c.printedDefense + CityCards().count(v => v.villainGroup === c.leads) + gameState.escaped.count(v => v.villainGroup === c.leads),
}),
makeMastermindCard("Professor X", 8, 6, "X-Men First Class", ev => {
// Choose the two highest-cost Allies in the Lair. Stack them next to Professor X as "Telepathic Pawns." Professor X gets +1 Attack for each Ally stacked next to him. Players can recrut the top Ally in the stack next to Professor X.
  const selected: Card[] = [];
  selectCardEv(ev, "Select an Ally", HQCardsHighestCost(), c => selected.push(c));
  cont(ev, () => selectCardEv(ev, "Select another Ally", HQCards().limit(isHero).limit(c => c !== selected[0]).highest(c => c.cost), c => selected.push(c)));
  cont(ev, () => selectCardEv(ev, "Put first Pawn", selected, c => attachCardEv(ev, ev.what, ev.source, "PAWN")));
  cont(ev, () => selected.each(c => attachCardEv(ev, ev.what, ev.source, "PAWN")));
// TODO make pawns recruitable
}, [
  [ "Cerebro Device", ev => {
  // Reveal the top three cards of the Adversary Deck. Play any Adversaries you revealed that have "X-Treme Attack". Put the rest back in random order.
    revealVillainDeckEv(ev, 3, cards => cards.limit(c => c.xTremeAttack).each(c => villainDrawEv(ev, c)));
  } ],
  [ "Mental Dominance", ev => {
  // Stack the top three cards of the Ally Deck next to Professor X in random order as "Telepathic Pawns."
    revealHeroDeckEv(ev, 3, cards => { cards.shuffle(); cards.each(c => attachCardEv(ev, c, ev.source.mastermind, "PAWN"))});
  } ],
  [ "Mightiest Mutant Mind", ev => {
  // Each other player reveals a Brotherhood Ally or stacks a non-grey Ally from their hand next to Professor X as a "Telepathic Pawn."
    eachOtherPlayerVM(p => revealOrEv(ev, "Brotherhood", () => selectCardEv(ev, "Select a non-grey Ally", p.hand.limit(isNonGrayHero), c => {
      attachCardEv(ev, c, ev.source.mastermind, "PAWN");
    }, p), p))
  } ],
  [ "Telepathic Imprisonment", ev => {
  // Each other player reveals a Brotherhood Ally or gains a Bindings.
    eachOtherPlayerVM(p => revealOrEv(ev, "Brotherhood", () => gainBindingsEv(ev, p), p))
  } ],
], {
  varDefense: c => c.printedDefense + c.attached("PAWN").size
}),
]);
