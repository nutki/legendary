"use strict";
addTemplates("MASTERMINDS", "Legendary", [
makeMastermindCard("Dr. Doom", 9, 5, "Doombot Legion", ev => {
  // Each player with exactly 6 cards in hand reveals a [Tech] Hero or puts 2 cards from their hand on top of their deck.
  eachPlayer(p => { if (p.hand.size === 6) revealOrEv(ev, Color.TECH, () => { pickTopDeckEv(ev, 2, p); }, p); });
}, [
  // You may recruit a [Tech] or [Ranged] Hero from the HQ for free.
  [ "Dark Technology", ev => {
    selectCardEv(ev, "Recruit a Hero for free", hqHeroes().limit(Color.TECH | Color.RANGED), sel => recruitForFreeEv(ev, sel));
  } ],
  // Choose one: each other player draws a card or each other player discards a card.
  [ "Monarch's Decree", ev => {
      chooseOneEv(ev, "Each other player",
      ["draws a card", ev => eachOtherPlayerVM(p => drawEv(ev, 1, p))],
      ["discards a card", ev => eachOtherPlayerVM(p => pickDiscardEv(ev, 1, p))]
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
  [ "Cruel Ruler", ev => selectCardEv(ev, "Defeat a Villain", cityVillains(), sel => defeatEv(ev, sel)) ],
  // KO up to four cards from your discard pile.
  [ "Maniacal Tyrant", ev => selectObjectsUpToEv(ev, "KO up to 4 cards", 4, playerState.discard.deck, sel => KOEv(ev, sel)) ],
  // Each other player KOs a Villain from their Victory Pile.
  [ "Vanishing Illusions", ev => eachOtherPlayerVM(p => selectCardEv(ev, "KO a Villain", p.victory.limit(isVillain), sel => KOEv(ev, sel), p)) ],
  // Each other player KOs two Bystanders from their Victory Pile.
  [ "Whispers and Lies", ev => eachOtherPlayerVM(p => selectObjectsEv(ev, "KO 2 Bystanders", 2, p.victory.limit(isBystander), sel => KOEv(ev, sel), p)) ],
]),
makeMastermindCard("Magneto", 8, 5, "Brotherhood", ev => {
// Each player reveals an X-Men Hero or discards down to four cards.
  eachPlayer(p => revealOrEv(ev, 'X-Men', () => pickDiscardEv(ev, -4, p), p));
}, [
  // Recruit an X-Men Hero from the HQ for free.
  [ "Bitter Captor", ev => selectCardEv(ev, "Recruit an X-Men for free", hqHeroes().limit('X-Men'), sel => recruitForFreeEv(ev, sel)) ],
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
    captureEv(ev, ev.source.mastermind, cityVillains().size);
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
    chooseClassEv(ev, color => eachPlayer(p => {
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
    chooseClassEv(ev, color => eachPlayer(p => {
      selectObjectsAnyEv(ev, "Reveal cards", revealable(p).limit(color), () => rescueByEv(ev, p), p);
    }))
  } ],
  [ "Sunder the Earth", ev => {
  // Each other player KOs all Heroes from their discard pile with the same card name as a Hero in the HQ.
    const hqNames = hqHeroes().map(c => c.cardName);
    eachOtherPlayerVM(p => p.discard.limit(isHero).limit(c => hqNames.includes(c.cardName)).each(c => KOEv(ev, c)));
  } ],
]),
// Mole Man gets +1 Attack for each Subterranea Villain that has escaped.
makeMastermindCard("Mole Man", 7, 6, "Subterranea", ev => {
// All Subterranea Villains in the city escape. If any Villains escaped this way, each player gains a Wound.
  const villains = cityVillains().limit(isGroup(ev.source.leads));
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
    eachOtherPlayerVM(p => revealOrEv(ev, "Foes of Asgard", () => pickDiscardEv(ev, gameState.escaped.count(c => c.villainGroup === ev.source.mastermind.leads), p), p));
  } ],
], {
  varDefense: c => c.printedDefense + cityVillains().count(isGroup(c.leads)) + gameState.escaped.count(isGroup(c.leads)),
}),
makeMastermindCard("Professor X", 8, 6, "X-Men First Class", ev => {
// Choose the two highest-cost Allies in the Lair. Stack them next to Professor X as "Telepathic Pawns." Professor X gets +1 Attack for each Ally stacked next to him. Players can recrut the top Ally in the stack next to Professor X.
  const selected: Card[] = [];
  selectCardEv(ev, "Select an Ally", HQCardsHighestCost(), c => selected.push(c));
  cont(ev, () => selectCardEv(ev, "Select another Ally", hqHeroes().limit(c => !selected.includes(c)).highest(c => c.cost), c => selected.push(c)));
  cont(ev, () => selectCardEv(ev, "Put first Pawn", selected, c => attachCardEv(ev, c, ev.source, "PAWN")));
  cont(ev, () => selected.each(c => attachCardEv(ev, c, ev.source, "PAWN")));
}, [
  [ "Cerebro Device", ev => {
  // Reveal the top three cards of the Adversary Deck. Play any Adversaries you revealed that have "X-Treme Attack". Put the rest back in random order.
    revealVillainDeckEv(ev, 3, cards => cards.limit(c => c.xTremeAttack).each(c => villainDrawEv(ev, c)));
  } ],
  [ "Mental Dominance", ev => {
  // Stack the top three cards of the Ally Deck next to Professor X in random order as "Telepathic Pawns."
    revealHeroDeckEv(ev, 3, cards => cards.shuffled().each(c => attachCardEv(ev, c, ev.source.mastermind, "PAWN")));
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
  varDefense: c => c.printedDefense + c.attached("PAWN").size,
  cardActions: [ (c: Card, ev: Ev) => c.attached("PAWN").size ? recruitCardActionEv(ev, c.attachedDeck("PAWN").top) : noOpActionEv(ev) ],
}),
]);
addTemplates("MASTERMINDS", "Guardians of the Galaxy", [
makeMastermindCard("Supreme Intelligence of the Kree", 9, 6, "Kree Starforce", ev => {
// The Supreme Intelligence gains a Shard. Then each player reveals their hand and discards each with cost equal to, and cost one higher than, the number of Shards on the Supreme Intelligence.
  attachShardEv(ev, ev.source);
  cont(ev, () => {
    const count = ev.source.attached('SHARD').size;
    eachPlayer(p => p.hand.limit(c => c.cost === count || c.cost === count + 1).each(c => discardEv(ev, c)));
  })
}, [
  [ "Combined Knowledge of All Kree", ev => {
  // The Supreme Intelligence gains a Shard for each Kree Villain in the city and/or the Escape Pile.
    attachShardEv(ev, ev.source.mastermind, cityVillains().count(isGroup(ev.source.mastermind.leads)) + gameState.escaped.count(isGroup(ev.source.mastermind.leads)));
  } ],
  [ "Cosmic Omniscience", ev => {
  // The Supreme Intelligence gains a Shard for each Master Strike in the KO pile.
    attachShardEv(ev, ev.source.mastermind, gameState.ko.count(isStrike));
  } ],
  [ "Countermeasure Protocols", ev => {
  // The Supreme Intelligence gains a Shard for each Mastermind Tactic (including this one) in any player's Victory Pile.
    attachShardEv(ev, ev.source.mastermind, gameState.players.sum(p => p.victory.count(c => c.mastermind === ev.source.mastermind)));
  } ],
  [ "Guide Kree Evolution", ev => {
  // The Supreme Intelligence and Kree Villains in the city each gain a Shard.
    attachShardEv(ev, ev.source.mastermind);
    cityVillains().limit(isGroup(ev.source.mastermind.leads)).each(c => attachShardEv(ev, c));
  } ],
]),
// Thanos gets -2 Attack for each Infinity Gem Artifact card controlled by any player.
makeMastermindCard("Thanos", 24, 7, "Infinity Gems", ev => {
// Each player reveals their hand and puts one of their non-grey Heroes next to Thanos in a "Bound Souls" pile.
  eachPlayer(p => selectCardEv(ev, "Select a non-grey Hero", p.hand.deck, c => attachCardEv(ev, c, ev.source, 'SOULS'), p));
}, [
  [ "Centuries of Envy", ev => {
  // Each other player discards an Infinity Gem Artifact card they control.
    eachOtherPlayerVM(p => selectCardEv(ev, "Select an Infinity Gem", p.artifact.limit(isGroup("Inifinity Gems")), c => discardEv(ev, c), p));
  } ],
  [ "God of Death", ev => {
  // Each other player reveals their hand and gains a Wound for each card that player has with the same card name as any card in Thanos' Bound Souls pile.
    const names = ev.source.mastermind.attached('SOULS').unique(c => c.cardName);
    eachOtherPlayerVM(p => p.hand.limit(c => names.includes(c.cardName)).each(() => gainWoundEv(ev, p)));
  } ],
  [ "Keeper of Souls", ev => {
  // Gain a Hero from Thanos' Bound Souls pile. Then each other player puts a non-grey Hero from their discard pile into Thanos' Bound Souls pile.
    selectCardEv(ev, "Choose a Hero", ev.source.mastermind.attached('SOULS'), c => gainEv(ev, c));
    cont(ev, () => eachOtherPlayerVM(p => selectCardEv(ev, "Select a non-grey Hero", p.discard.deck, c => attachCardEv(ev, c, ev.source, 'SOULS'), p)));
  } ],
  [ "The Mad Titan", ev => {
  // Each other player reveals their hand and discards all cards with the same card name as any card in Thanos' Bound Souls pile.
    const names = ev.source.mastermind.attached('SOULS').unique(c => c.cardName);
    eachOtherPlayerVM(p => p.hand.limit(c => names.includes(c.cardName)).each(c => discardEv(ev, c)));
  } ],
], {
  varDefense: c => c.printedDefense - 2 * (gameState.players.sum(p => p.artifact.count(isGroup("Infinity Gems"))) + playerState.victory.count(isGroup(c.leads)))
}),
]);
addTemplates("MASTERMINDS", "Fear Itself", [
makeMastermindCard("Uru-Enchanted Iron Man", 7, 6, "The Mighty.", ev => {
// Demolish each player. Then stack this Strike next to Iron Man. Uru-Enchanted Iron Man has an Uru-Enchanted Weapon for each Strike stacked here.
  demolishEv(ev);
  attachCardEv(ev, ev.what, ev.source, "STRIKE");
}, [
  [ "Armor of the Destroyer", ev => {
  // For each [Tech] Ally you have, demolish each other player.
    repeat(yourHeroes().count(Color.TECH), () => demolishOtherEv(ev));
  } ],
  [ "Pepper Potts in Rescue Armor", ev => {
  // A Bystander from the Bystander Stack becomes a Command Strike that takes effect immediately.
    gameState.bystanders.withTop(c => playStrikeEv(ev, c));
  } ],
  [ "Quantum Inventions", ev => {
  // Draw two cards. Then, if you reveal a [Tech] card, draw two more cards.
    drawEv(ev, 2);
    revealAndEv(ev, Color.TECH, () => drawEv(ev, 2));
  } ],
  [ "Repulsor Coils", ev => {
  // Each other player reveals a [Tech] ally or gains a Bindings.
    eachOtherPlayerVM(p => revealOrEv(ev, Color.TECH, () => gainBindingsEv(ev)));
  } ],
], {
  trigger: uruEnchantedTrigger(c => c.attached("STRIKE").size),
  fightFail: uruEnchantedFail,
}),
]);
addTemplates("MASTERMINDS", "Secret Wars Volume 1", [
// Bystanders captured by Madelyne are "Demon Goblin" Villains with 2 Attack. You can fight them to rescue them as Bystanders. You can't fight her while she has any Demon Goblins.
makeMastermindCard("Madelyne Pryor, Goblin Queen", 10, 6, "Limbo", ev => {
// Madelyne captures 4 Bystanders. If she already had any Bystanders before that, then each player gains a Wound.
  captureEv(ev, ev.source, 4);
  ev.source.captured.has(isBystander) && eachPlayer(p => gainWoundEv(ev, p));
}, [
  [ "City of Demon Goblins", ev => {
  // Madelyne captures five Bystanders.
    captureEv(ev, ev.source, 5);
  } ],
  [ "Corrupted Clone of Jean Grey", ev => {
  // Each other player reveals an X-Men Hero or gains a Wound.
    eachOtherPlayerVM(p => revealOrEv(ev, "X-Men", () => gainWoundEv(ev, p), p))
  } ],
  [ "Everyone's a Demon on the Inside", ev => {
  // Madelyne captures a Bystander from each other player's Victory Pile.
    eachOtherPlayerVM(p => selectCardEv(ev, "Choose a Bystander", p.victory.limit(isBystander), c => captureEv(ev, ev.source, c)));
  } ],
  [ "Gather the Harvest", ev => {
  // For each Limbo Villain in the city and/or Escape Pile, Madelyne captures a Bystander.
    captureEv(ev, ev.source, [...cityVillains(), ...gameState.escaped.deck].count(isGroup(ev.source.leads)));
  } ],
], {
  fightCond: c => !c.captured.has(isBystander),
  init: m => {
    const isDemonGoblin = (c: Card) => c.location.attachedTo === m && isBystander(c);
    addStatSet('isVillain', isDemonGoblin, () => true);
    addStatSet('villainGroup', isDemonGoblin, () => "Demon Goblin");
    addStatSet('defense', isDemonGoblin, () => 2);
  },
  cardActions: [(m, ev) => {
    const goblins = m.captured.limit(isBystander);
    return goblins.map(c => fightActionEv(ev, c))[0]; // TODO SW1 allow returning array 
  }],
}),
// You can't fight Nimrod unless you made at least 6 Recruit this turn.
makeMastermindCard("Nimrod, Super Sentinel", 6, 6, "Sentinel Territories", ev => {
// Each player who does not reveal a [Tech] Hero must choose Recruit or Attack, then discard all their cards with that icon.
  eachPlayer(p => revealOrEv(ev, Color.TECH, () => chooseOptionEv(ev, "Choose", [{l:"Recruit", v:hasRecruitIcon}, {l:"Attack", v:hasAttackIcon}], f => p.hand.limit(f).each(c => discardEv(ev, c)), p), p));
}, [
  [ "Adapt and Destroy", ev => {
  // Choose Recruit or Attack. Each other player reveals their hand and discards a card with that icon.
    chooseOptionEv(ev, "Choose", [{l:"Recruit", v:hasRecruitIcon}, {l:"Attack", v:hasAttackIcon}], f => {
      eachOtherPlayerVM(p => selectCardEv(ev, "Discard a card", p.hand.limit(f), c => discardEv(ev, c)));
    });
  } ],
  [ "Detect Mutation", ev => {
  // Choose Recruit or Attack. Then, reveal the top card of your deck. If that card has that icon, draw it and repeat this process.
    const rep = () => chooseOptionEv(ev, "Choose", [{l:"Recruit", v:hasRecruitIcon}, {l:"Attack", v:hasAttackIcon}], f => {
      revealPlayerDeckEv(ev, 1, cards => cards.limit(f).each(c => { drawCardEv(ev, c); cont(ev, rep); }));
    });
    rep();
  } ],
  [ "Scatter the Mutants", ev => {
  // Choose Recruit or Attack. Put all Heroes from the HQ with that icon on the bottom of the Hero Deck.
    chooseOptionEv(ev, "Choose", [{l:"Recruit", v:hasRecruitIcon}, {l:"Attack", v:hasAttackIcon}], f => {
      hqHeroes().limit(f).each(c => moveCardEv(ev, c, gameState.herodeck, true));
    });
  } ],
  [ "Teleport and Incarcerate", ev => {
  // Choose Recruit or Attack. Then, reveal the top card of that Hero Deck. If that card has that icon, gain that card, and Teleport it.
    chooseOptionEv(ev, "Choose", [{l:"Recruit", v:hasRecruitIcon}, {l:"Attack", v:hasAttackIcon}], f => {
      revealHeroDeckEv(ev, 1, cards => cards.limit(f).each(c => { gainEv(ev, c); teleportEv(ev, c); }));
    });
  } ],
], {
  fightCond: c => turnState.totalRecruit >= 6
}),
// Wasteland Hulk gets +3 Attack for each of his Mastermind Tactics among all players' Victory Piles.
makeMastermindCard("Wasteland Hulk", 7, 6, "Wasteland", ev => {
// Cross-Dimensional Hulk Rampage
  xdRampageEv(ev, 'Hulk');
}, [
  [ "Brutal Beating", ev => {
  // Each other player counts the number of Wounds in their discard pile, then discards that many cards.
    eachOtherPlayerVM(p => selectObjectsEv(ev, "Choose cards to discard", p.discard.count(isWound), p.hand.deck, c => discardEv(ev, c)));
  } ],
  [ "Memories of Pain", ev => {
  // Each other player puts two Wounds from their discard pile on top of their deck.
    eachOtherPlayerVM(p => selectObjectsEv(ev, "Put two Wounds on top of your deck", 2, p.discard.limit(isWound), c => moveCardEv(ev, c, p.deck), p));
  } ],
  [ "Radioactive Regeneration", ev => {
  // KO up to two Wounds from your hand and/or discard pile.
    selectObjectsUpToEv(ev, "KO up to two Wounds", 2, handOrDiscard().limit(isWound), c => KOEv(ev, c));
  } ],
  [ "Revert to Bruce Banner", ev => {
  // You gain a [Tech] Hero from the HQ for free.
    selectCardEv(ev, "Choose a Hero to gain", hqHeroes().limit(Color.TECH), c => gainEv(ev, c));
  } ],
], {
  varDefense: m => m.printedDefense + 3 * gameState.players.sum(p => p.victory.limit(isTactic).count(c => c.mastermind === m)),
}),
// Zombie Green Goblin gets +1 Attack for each Hero in the KO pile that costs 7 or more.
makeMastermindCard("Zombie Green Goblin", 11, 6, "The Deadlands", ev => {
// Rise of the Living Dead. KO each Hero in the HQ that costs 7 or more. Then, each player discards a card for each Hero in the KO pile that costs 7 or more.
  raiseOfTheLivingDead(ev);
  hqHeroes().limit(c => c.cost >= 7).each(c => KOEv(ev, c));
  cont(ev, () => eachPlayer(p => selectObjectsEv(ev, "Choose cards to discard", gameState.ko.limit(isHero).count(c => c.cost >= 7), p.hand.deck, c => discardEv(ev, c), p)));
}, [
  [ "Army of Cadavers", ev => {
  // Rise of the Living Dead (this effect never makes Mastermind Tactics return.) Then, each other player discards a card for each Villain in the city that has "Rise of the Living Dead."
    raiseOfTheLivingDead(ev);
    cont(ev, () => eachOtherPlayerVM(p => selectObjectsEv(ev, "Choose cards to discard", cityVillains().count(c => c.ambush === raiseOfTheLivingDead), p.hand.deck, c => discardEv(ev, c), p)));
  } ],
  [ "The Hungry Dead", ev => {
  // Rise of the Living Dead (this effect never makes Mastermind Tactics return.) Then, each other player gains a Wound if there are any Villains in the city with "Rise of the Living Dead".
    raiseOfTheLivingDead(ev);
    cont(ev, () => cityVillains().has(c => c.ambush === raiseOfTheLivingDead) && eachOtherPlayerVM(p => gainWoundEv(ev, p)));
  } ],
  [ "Love To Have You For Dinner", ev => {
  // Rise of the Living Dead (this effect never makes Mastermind Tactics return.) Then, reveal the top 5 cards of the Hero Deck. KO all those Heroes that cost 7 or more. Put the rest on the bottom of the Hero Deck in random order.
    raiseOfTheLivingDead(ev);
    revealHeroDeckEv(ev, 5, cards => cards.limit(c => c.cost >= 7).each(c => KOEv(ev, c)), true, true);
  } ],
  [ "Reign of Terror", ev => {
  // Rise of the Living Dead (this effect never makes Mastermind Tactics return.) Then, put all Heroes from the HQ that cost 6 or less on the bottom of the Hero Deck.
    raiseOfTheLivingDead(ev);
    cont(ev, () => hqHeroes().limit(c => c.cost <= 6).each(c => moveCardEv(ev, c, gameState.herodeck, true)));
  } ],
], {
  varDefense: c => c.printedDefense + gameState.ko.limit(isHero).count(c => c.cost >= 7),
}),
]);
addTemplates("MASTERMINDS", "Secret Wars Volume 2", [
// 7th Circle of Kung-Fu
makeMastermindCard("Immortal Emperor Zheng-Zhu", 7, 5, "K'un-Lun", ev => {
// Each player reveals a Hero that costs 7 or more, or they discard down to 3 cards.
  eachPlayer(p => revealOrEv(ev, c => c.cost >= 7, () => pickDiscardEv(ev, -3, p), p));
}, [
  [ "Ultimate Kung-Fu Mastery", ev => {
  // Each other player reveals a card with "Circle of Kung-Fu" from their Victory Pile or gains a Wound.
    eachOtherPlayerVM(p => selectCardOptEv(ev, "Reveal a card with 'Circle of Kung-Fu'", p.victory.limit(c => c.nthCircle > 0), () => {}, () => gainWoundEv(ev, p), p));
  } ],
  [ "Emperor's Justice", ev => {
  // Each other player reveals a Marvel Knight Hero or gains a Wound.
    eachOtherPlayerVM(p => revealOrEv(ev, "Marvel Knights", () => gainWoundEv(ev, p), p));
  } ],
  [ "Humble the Pretenders", ev => {
  // Each other player reveals a Marvel Knight Hero or discards a card that costs less than 7.
    eachOtherPlayerVM(p => revealOrEv(ev, "Marvel Knights", () => selectCardEv(ev, "Discard a card", p.hand.limit(c => c.cost < 7), c => discardEv(ev, c), p), p));
  } ],
  [ "Imperial Edict", ev => {
  // Choose any number of Heroes from the HQ. Put them on the bottom of the Hero Deck in random order.
    const cards: Card[] = [];
    selectObjectsAnyEv(ev, "Put Heroes on the bottom of the Hero Deck", hqHeroes(), c => cards.push(c));
    cont(ev, () => cards.shuffled().each(c => moveCardEv(ev, c, gameState.herodeck, true)));
  } ],
], {
  ...nthCircleParams(7),
}),
// Escape: Each player gains a wound. Put King Hyperion on the Mastermind space.
makeMastermindCard("King Hyperion", 12, 6, "Utopolis", ev => {
// King Hyperion enters the city if he was not already there. Then, he <b>charges</b> three spaces.
  enterCityEv(ev, ev.source);
  cont(ev, () => villainChargeEv(ev, ev.source, 3));
}, [
  [ "Worshipped by Millions", ev => {
  // If King Hyperion is in the city, put him back on the Mastermind space and shuffle this Tactic back into his Tactics. If you do, rescue six Bystanders.
    if (!ev.source.mastermind.location.isCity) return;
    moveCardEv(ev, ev.source.mastermind, gameState.mastermind);
    shuffleIntoEv(ev, ev.source, ev.source.mastermind.attachedDeck("TACTICS"));
    rescueEv(ev, 6);
  } ],
  [ "Royal Treasury", ev => {
  // If King Hyperion is in the city, put him back on the Mastermind space and shuffle this Tactic back into his Tactics. If you do, you get +5 Recruit.
    if (!ev.source.mastermind.location.isCity) return;
    moveCardEv(ev, ev.source.mastermind, gameState.mastermind);
    shuffleIntoEv(ev, ev.source, ev.source.mastermind.attachedDeck("TACTICS"));
    addRecruitEvent(ev, 5);
  } ],
  [ "Monarch of Utopolis", ev => {
  // If King Hyperion is in the city, put him back on the Mastermind space and shuffle this Tactic back into his Tactics. If you do, when you drew a new hand of cards at the end of this turn, draw three extra cards.
    if (!ev.source.mastermind.location.isCity) return;
    moveCardEv(ev, ev.source.mastermind, gameState.mastermind);
    shuffleIntoEv(ev, ev.source, ev.source.mastermind.attachedDeck("TACTICS"));
    addEndDrawMod(3);
  } ],
  [ "Rule with an Iron Fist", ev => {
  // If King Hyperion is in the city, put him back on the Mastermind space and shuffle this Tactic back into his Tactics. If you do, you may defeat a Villain in the city for free.
    if (!ev.source.mastermind.location.isCity) return;
    moveCardEv(ev, ev.source.mastermind, gameState.mastermind);
    shuffleIntoEv(ev, ev.source, ev.source.mastermind.attachedDeck("TACTICS"));
    selectCardOptEv(ev, "Choose a Villain to defeat", cityVillains(), c => defeatEv(ev, c));
  } ],
], {
  escape: ev => {
    eachPlayer(p => gainWoundEv(ev, p));
    moveCardEv(ev, ev.source, gameState.mastermind);
  }
}),
makeMastermindCard("Shiklah, the Demon Bride", 9, 6, "Monster Metropolis", ev => {
// Reveal the top three cards of the Villain Deck. Put all the Scheme Twists you revealed on top of the Villain Deck. Put the rest on the bottom of that deck in random order.
}, [
  [ "Enslavement Beam", ev => {
  // {FATEFULRESURRECTION}. If she resurrects, rescue four bystanders.
    fatefulResurrectionTacticEv(ev, () => rescueEv(ev, 4));
  } ],
// GAINABLE
// TEAM: (Unaffiliated)
// CLASS: [Covert]
// You get +1 Attack for each Hero with an odd-numbered cost you played this turn. <i>(0 is even.)</i>
// ATTACK: 5+
  makeGainableCard(makeTacticsCard("Shiklah's Husband, Deadpool"), u, 5, Color.COVERT, u, "", ev => addAttackEvent(ev, turnState.cardsPlayed.count(isCostOdd))),
  [ "Drain Life", ev => {
  // {FATEFULRESURRECTION}. If she resurrects, defeat a Villain in the city for free.
    fatefulResurrectionTacticEv(ev, () => selectCardEv(ev, "Select a Villain to defeat", cityVillains(), c => defeatEv(ev, c)));
  } ],
  [ "Infernal Power", ev => {
  // {FATEFULRESURRECTION}. If she resurrects, draw two cards.
    fatefulResurrectionTacticEv(ev, () => drawEv(ev, 2));
  } ],
]),
// Spider-Queen gets +1 Attack for each Bystander in the Escape pile.
makeMastermindCard("Spider-Queen", 8, 6, "Spider-Infected", ev => {
// Each player puts a Spider-Infected from their Victory Pile into an empty city space. Any player who cannot do so gains a Wound.
  eachPlayer(p => selectCardOrEv(ev, "Select a Villain to put in the city", p.victory.limit(isGroup(ev.source.leads)), c => {
    selectCardOrEv(ev, "Select an empty city space", gameState.city.limit(d => !d.size), d => {
      moveCardEv(ev, c, d);
    }, () => gainWoundEv(ev, p), p);
  }, () => gainWoundEv(ev, p), p));
}, [
  [ "Sonic Scream", ev => {
  // Reveal the top eight cards of the Villain Deck. Put all the Bystanders you revealed into the Escape pile. Put the rest on the bottom of the Villain Deck in random orders.
    revealVillainDeckEv(ev, 8, cards => cards.limit(isBystander).each(c => moveCardEv(ev, c, gameState.escaped)), true, true);
  } ],
  [ "Infect the Entire City", ev => {
  // Put a Bystander from the Bystander Deck into the Escape Pile. Then, each Spider-Infected in the city captures a Bystander.
    gameState.bystanders.withTop(c => moveCardEv(ev, c, gameState.escaped));
    cont(ev, () => cityVillains().limit(isGroup(ev.source.mastermind.leads)).each(c => captureEv(ev, c)));
  } ],
  [ "Control Arachnid Genes", ev => {
  // You may gain a Spider-Friend Hero from the HQ.
    selectCardOptEv(ev, "Gain a Spider-Friend", hqHeroes().limit("Spider Friends"), c => gainEv(ev, c));
  } ],
  [ "Web the Skyscrapers", ev => {
  // Each other player reveals a Spider-Friend Hero or puts a Bystander from their Victory Pile into the Escape pile.
    eachOtherPlayerVM(p => revealOrEv(ev, "Spider Friends", () => selectCardEv(ev, "Put a Bystander into the Escape pile", p.victory.limit(isBystander), c => moveCardEv(ev, c, gameState.escaped)), p));
  } ],
], {
  varDefense: c => c.printedDefense + gameState.escaped.count(isBystander)
}),
]);
addTemplates("MASTERMINDS", "Captain America 75th Anniversary", [
// Ultimate Abomination
makeMastermindCard("Arnim Zola", 6, 6, "Zola's Creations", ev => {
// For each Hero in the HQ that has less than 2 printed Attack, put that Hero on the bottom of the Hero Deck, and each player discards a card of that Hero's cost.
  hqHeroes().limit(c => (c.printedAttack || 0) < 2).each(c => {
    moveCardEv(ev, c, gameState.herodeck, true);
    eachPlayer(p => selectCardEv(ev, "Discard a card", p.hand.limit(v => v.cost === c.cost), c => discardEv(ev, c), p));
  })
}, [
  [ "Dominate the Weak", ev => {
  // The player of your choice gains a Hero from the HQ that has less than 2 printed Attack.
    choosePlayerEv(ev, p => selectCardEv(ev, `Select a card for ${p.name} to gain`, hqHeroes().limit(c => (c.printedAttack || 0) < 2), c => gainEv(ev, c, p)));
  } ],
  [ "Computer-Uploaded Genius", ev => {
  // Each other player reveals a [Tech] Hero or discards a card.
    eachOtherPlayerVM(p => revealOrEv(ev, Color.TECH, () => pickDiscardEv(ev, 1, p), p));
  } ],
  [ "Pet Projects", ev => {
  // Each other player reveals a Zola's Creations Villain from their Victory Pile or gains a Wound.
    eachOtherPlayerVM(p => selectCardOrEv(ev, "Select a card", p.victory.limit(isGroup(ev.source.mastermind.leads)), () => {}, () => gainWoundEv(ev, p), p));
  } ],
  [ "Crush Pacifist Resistance", ev => {
  // KO up to two of your Heroes that have less than 2 printed Attack.
    selectObjectsUpToEv(ev, "Choose up to two of your Heros", 2, yourHeroes().limit(c => (c.printedAttack || 0) < 2), c => KOEv(ev, c));
  } ],
], {
  varDefense: ultimateAbominationVarDefense
}),
// Whenever you fight a Villain, you may use 2 Recruit to rescue a Bystander. Baron Zemo gets +9 Attack unless you are a Savior.
makeMastermindCard("Baron Heinrich Zemo", 9, 6, "Masters of Evil (WWII)", ev => {
// Each player KOs a Bystander from their Victory Pile. Any player who cannot do so gains a Wound.
  eachPlayer(p => selectCardOrEv(ev, "Choose a Bystander to KO", p.victory.limit(isBystander), c => KOEv(ev, c), () => gainWoundEv(ev, p), p));
}, [
  [ "Fallen Idols", ev => {
  // Each other player that is not a Savior discards a card.
    eachOtherPlayerVM(p => saviorPower(p) || pickDiscardEv(ev, 1, p));
  } ],
  [ "Finding Zemo", ev => {
  // Reveal the top five cards of the Villain Deck. If you revealed any Bystanders, KO them and each other player gains a Wound. Put the rest back in random order.
    revealVillainDeckEv(ev, 5, cards => {
      cards.limit(isBystander).each(c => KOEv(ev, c));
      cards.has(isBystander) && eachOtherPlayerVM(p => gainWoundEv(ev, p));
    });
  } ],
  [ "Hatred for the Avengers", ev => {
  // For each of your Avengers Heroes, rescue a Bystander.
    rescueEv(ev, yourHeroes().count("Avengers"));
  } ],
  [ "Prisoners of War", ev => {
  // Each other player reveals an Avengers Hero or chooses a Bystander from their Victory Pile, and you rescue that Bystander.
    eachOtherPlayerVM(p => revealOrEv(ev, "Avengers", () => selectCardEv(ev, "Choose a Bystander", p.victory.limit(isBystander), c => rescueEv(ev, c), p), p));
  } ],
], {
  varDefense: c => c.printedDefense + (saviorPower() ? 0 : 9),
  triggers: [ {
    event: 'FIGHT',
    match: ev => isVillain(ev.what),
    after: ev => {
      const action = new Ev(ev, 'EFFECT', { cost: { recruit: 2 }, func: ev => rescueEv(ev) });
      canPayCost(action) && chooseMayEv(ev, "Rescue a Bystander for 2 Recruit", () => playEvent(action));
    }
  } ],
}),
]);
addTemplates("MASTERMINDS", "Civil War", [
makeMastermindCard("Authoritarian Iron Man", 12, 6, "Superhuman Registration Act", ev => {
// Authoritarian Iron Man fortifies the next city space to his right, starting with the Bridge. You can't fight him while there's a Villain in that space.
// Villains in that space get +3 Attack.
  const d = ev.source.location.isCity ? ev.source.location.adjacentRight && fortifyEv(ev, ev.source, ev.source.location.adjacentRight) :
    withCity('BRIDGE', d => fortifyEv(ev, ev.source, d));
}, [
  [ "Armada of Armors", ev => {
  // You get +6 Recruit usable only to recruit Ranged and/or Tech Heroes.
    addRecruitSpecialEv(ev, isColor(Color.RANGED | Color.TECH), 6);
  } ],
  [ "Freeze Domestic Assets", ev => {
  // Each other player reveals their hand and discards all their cards with Recruit icons.
    eachOtherPlayerVM(p => p.hand.limit(hasRecruitIcon).each(c => discardEv(ev, c)))
  } ],
  [ "Man the Fortifications", ev => {
  // Reveal the top card of the Villain Deck. If it's a Villain, it enters the city space that Authoritarian Iron Man is fortifying.
    revealVillainDeckEv(ev, 1, c => c.limit(isVillain).each(c => {
      gameState.city.limit(d => isFortifying(ev.source.mastermind, d)).each(d => enterCityEv(ev, c, d));
    }))
  } ],
  [ "Recall to Service", ev => {
  // The Villain with the highest printed Attack in the Escape Pile enters the city space that Authoritarian Iron Man is fortifying.
    selectCardEv(ev, 'Select a Villain', gameState.escaped.limit(isVillain).highest(c => c.printedDefense), c => {
      gameState.city.limit(d => isFortifying(ev.source.mastermind, d)).each(d => enterCityEv(ev, c, d));
    });
  } ],
], { init: m => {
  addStatMod('defense', c => isVillain(c) && isFortifying(m, c.location), 3);
}}),
// Baron Zemo gets -1 Attack for each Villain in your Victory Pile.
makeMastermindCard("Baron Helmut Zemo", 16, 6, "Thunderbolts", ev => {
// Each player KOs a Villain from their Victory Pile. Any player who cannot do so gains a Wound.
}, [
  [ "Blasted Henchmen!", ev => {
  // Each other player reveals a Tech Hero or KOs a Villain from their Victory Pile.
    eachOtherPlayerVM(p => revealOrEv(ev, Color.TECH, () => selectCardAndKOEv(ev, p.victory.limit(isVillain), p), p))
  } ],
  [ "Cursed Dynasty", ev => {
  // When you draw a new hand of cards at the end of this turn, draw two extra cards.
    addEndDrawMod(2);
  } ],
  [ "Endless Minions", ev => {
  // Each other player reveals a Tech Hero or chooses a Villain from their Victory Pile and it enters the city.
    eachOtherPlayerVM(p => revealOrEv(ev, Color.TECH, () => selectCardEv(ev, "Choose a Villain to enter the city", p.victory.limit(isVillain), c => villainDrawEv(ev, c), p), p));
  } ],
  [ "Revenge for My Father", ev => {
  // Each other player reveals their hand. Each player who revealed an Avengers Hero gains a Wound.
    eachOtherPlayerVM(p => p.hand.has('Avengers') && gainWoundEv(ev, p));
  } ],
], {
  varDefense: c => c.printedDefense - playerState.victory.count(isVillain),
}),
// Double S.H.I.E.L.D. Clearance. You can't fight Maria Hill while there are any S.H.I.E.L.D. Elite or Officers in the city.
makeMastermindCard("Maria Hill, Director of S.H.I.E.L.D.", 7, 6, "S.H.I.E.L.D. Elite.", ev => {
// Two S.H.I.E.L.D. Officers enter the city as 3 Attack Villains. When you fight them, gain them as Heroes.
  villainifyOfficers(ev, 2);
}, [
  [ "Crash the Helicarrier", ev => {
  // KO any number of your S.H.I.E.L.D. Heroes.
    selectObjectsAnyEv(ev, 'Choose cards to KO', yourHeroes().limit('S.H.I.E.L.D.'), c => KOEv(ev, c));
  } ],
  [ "Declare Martial Law", ev => {
  // Put a S.H.I.E.L.D. Officer into each empty city space as 3 Attack Villains. When you fight them, gain them as Heroes.
    const spaces = gameState.city.limit(d => !d.size);
    villainifyOfficers(ev, spaces.size, spaces);
  } ],
  [ "Evacuation Code Epsilon", ev => {
  // Each other player reveals their hand and discards a S.H.I.E.L.D. card.
    eachOtherPlayerVM(p => selectCardEv(ev, "Discard a S.H.I.E.L.D. card", p.hand.limit('S.H.I.E.L.D.'), c => discardEv(ev, c), p));
  } ],
  [ "Rapid Response Team", ev => {
  // Two S.H.I.E.L.D. Officers enter the city as 3 Attack Villains. When you fight them, gain them as Heroes.
    villainifyOfficers(ev, 2);
  } ],
], {
  fightCond: c => shieldClearanceCond(2)() && !cityVillains().has(isGroup(c.leads)) && !cityVillains().has(c => c.cardName === 'S.H.I.E.L.D. Officer'),
  fightCost: shieldClearanceCost(2),
}),
// {BRIBE}
makeMastermindCard("Misty Knight", 14, 6, "Heroes for Hire", ev => {
// Each player reveals 4 cards with Recruit icons or gains a Wound.
  eachPlayer(p => yourHeroes(p).count(hasRecruitIcon) >=4 || gainWoundEv(ev, p)); // TODO multiplayer reveal
}, [
  [ "Bionic Repulsor Field", ev => {
  // Each other player reveals a Marvel Knight Hero or puts two cards from their hand on top of the deck.
    eachOtherPlayerVM(p => revealOrEv(ev, 'Marvel Knights', () => selectObjectsEv(ev, "Put 2 cards on top of your deck", 2, p.hand.deck, c => moveCardEv(ev, c, p.deck))));
  } ],
  [ "Cyborg Detective", ev => {
  // Reveal the top three cards of the Villain Deck. Put them back in any order.
    revealVillainDeckEv(ev, 3, () => {}, false, false);
  } ],
  [ "Trusted Bodyguard", ev => {
  // Going clockwise, the fist other player with Colleen Wing in their Victory Pile rescues 5 Bystanders and returns Colleen Wing to play fortifying Misty Knight.
    gameState.players.map(p => p.victory.limit(c => c.cardName === "Colleen Wing")).merge().withFirst(c => {
      rescueByEv(ev, owner(c), 5);
      fortifyEv(ev, c, gameState.mastermind);
    });
  } ],
  [ "Vibranium Cyber Arm", ev => {
  // Each other player reveals a Marvel Knight Hero or gains a Wound.
    eachOtherPlayerVM(p => revealOrEv(ev, 'Marvel Knights', () => gainWoundEv(ev, p), p));
  } ],
], { bribe: true }),
// Ragnarok gets +2 Attack for each Hero Class among Heroes in the HQ.
makeMastermindCard("Ragnarok", 6, 6, "Registration Enforcers", ev => {
// Each player says "zero" or "not zero." Then, each player discards all their cards with that cost.
  eachPlayer(p => chooseOptionEv(ev, "Choose", [{l:"Zero",v:true}, {l:"Not zero",v:false}], v => {
    p.hand.limit(c => (c.cost === 0) === v).each(c => discardEv(ev, c));
  }, p))
}, [
  [ "Electrical Charge", ev => {
  // Count how many Ranged Heroes you have. Draw that many cards.
    drawEv(ev, yourHeroes().count(Color.RANGED));
  } ],
  [ "God of Cyborg Thunder", ev => {
  // You can spend Recruit as Attack this turn.
    turnState.attackWithRecruit = true;
  } ],
  [ "Hammer Goliath", ev => {
  // KO each Hero from the HQ that costs 7 or more.
    hqHeroes().limit(c => c.cost >= 7).each(c => KOEv(ev, c));
  } ],
  [ "Unnatural Storm Clouds", ev => {
  // Put all Heroes from the HQ on the bottom of the Hero Deck in random order.
    hqHeroes().shuffled().each(c => moveCardEv(ev, c, gameState.herodeck, true));
  } ],
], {
  varDefense: c => c.baseDefense + 2 * numClasses(hqHeroes()),
}),
]);
addTemplates("MASTERMINDS", "Deadpool", [
// {REVENGE Mastermind Tactics}
makeMastermindCard("Evil Deadpool", 11, 6, "Evil Deadpool Corpse", ev => {
// Without talking, each player simultaneously discards a card. Whoever discards the lowest-costing card <i>(or tied for lowest)</i> gains a Wound.
  const s: Card[] = [];
  eachPlayer(p => selectCardEv(ev, "Discard a card", p.hand.deck, c => s.push(c), p));
  cont(ev, () => s.highest(c => -c.cost).each(c => { discardEv(ev, c); gainWoundEv(ev, owner(c)); }));
}, [
  [ "Evil Even Oddball", ev => {
  // Each other player reveals their hand. Whoever has the fewest cards with odd-numbered costs (or tied for fewest) gains a Wound.
    const lowest = -gameState.players.max(p => -p.hand.count(isCostOdd));
    eachOtherPlayerVM(p => p.hand.count(isCostOdd) === lowest && gainWoundEv(ev, p));
  } ],
  [ "Hyper-Insane Healing Factor", ev => {
  // If this is not the final Tactic, you get +6 Recruit and shuffle this Tactic back into the other Tactics.
    if (!finalTactic(ev.source)) { addRecruitEvent(ev, 6); shuffleIntoEv(ev, ev.source, ev.source.mastermind.attachedDeck("TACTICS")); }
  } ],
  [ "Of Course it's Corpse", ev => {
  // The other player with the fewest Evil Deadpool Corpse Villains in their Victory Pile (or tied for fewest) gains a Wound.
    const lowest = -gameState.players.max(p => -p.victory.count(isGroup(ev.source.mastermind.leads)));
    eachOtherPlayerVM(p => p.victory.count(isGroup(ev.source.mastermind.leads)) === lowest && gainWoundEv(ev, p));
  } ],
  [ "Stitched from Dead (Pool) Parts", ev => {
  // Each other player discards the top card of their deck. Whoever discards the lowest-costing card (or tied for lowest) gains a Wound.
    const s: Card[] = [];
    eachPlayer(p => revealPlayerDeckEv(ev, 1, c => c.each(c => s.push(c)), p));
    cont(ev, () => s.highest(c => -c.cost).each(c => { discardEv(ev, c); gainWoundEv(ev, owner(c)); }));
  } ],
], {
  varDefense: c => c.printedDefense + playerState.victory.count(isTactic),
}),
// {REVENGE Deadpool's "Friends"}
makeMastermindCard("Macho Gomez", 9, 6, "Deadpool's \"Friends\"", ev => {
// Put this Strike in front of you as a "Bounty on Your Head." Then, each player gains a Wound for each Bounty on them. Any number of times during your turn, you may pay 1 Recruit to move a Bounty from you to the player on your left.
  attachCardEv(ev, ev.source, playerState.deck, 'BOUNTY');
  cont(ev, () => eachPlayer(p => repeat(p.deck.attached('BOUNTY').size, () => gainWoundEv(ev, p))));
}, [
  [ "Bounty Payout", ev => {
  // You get +1 Recruit for each "Bounty on Your Head" on other players.
    addRecruitEvent(ev, gameState.players.limit(p => p != playerState).sum(p => p.deck.attached('BOUNTY').size));
  } ],
  [ "Interstellar Assassin", ev => {
  // Each other player with at least one "Bounty on Your Head" discards down to 4 cards.
    eachOtherPlayerVM(p => p.deck.attached('BOUNTY').size >= 0 && pickDiscardEv(ev, -4, p));
  } ],
  [ "Renegotiate the Contract", ev => {
  // Redistribute the "Bounty on Your Head" cards among any number of players.
    playerState.deck.attached('BOUNTY').each(c => choosePlayerEv(ev, p => attachCardEv(ev, c, p.deck, 'BOUNTY')));
  } ],
  [ "Super Macho Man", ev => {
  // Rescue a Bystander for each "Bounty on Your Head" on other players.
    rescueEv(ev, gameState.players.limit(p => p != playerState).sum(p => p.deck.attached('BOUNTY').size));
  } ],
], {
  varDefense: revengeVarDefense,
  cardActions: [ (c, ev) => playerState.deck.attached('BOUNTY').size ? new Ev(ev, 'EFFECT', { cost: { recruit: 1 }, func: ev => {
    attachCardEv(ev, ev.what, playerState.left.deck, 'BOUNTY');
  }, what: playerState.deck.attached('BOUNTY')[0] }) : noOpActionEv(ev) ]
}),
]);
addTemplates("MASTERMINDS", "Noir", [
// Charles Xavier gets +1 Attack for each Bystander in the HQ and city.
makeMastermindCard("Charles Xavier", 8, 6, "X-Men Noir", ev => {
// Four Heroes in the HQ capture <b>Hidden Witnesses</b>.
  selectObjectsEv(ev, "Choose four Heroes", 4, hqHeroes(), c => captureWitnessEv(ev, c));
}, [
  [ "X-Con Men", ev => {
  // Each other player reveals an X-Men Hero or gains a Wound.
    eachOtherPlayerVM(p => revealOrEv(ev, 'X-Men', () => gainWoundEv(ev, p), p))
  } ],
  [ "Commit to the Asylum", ev => {
  // Each other player <b>Investigates</b> their deck for a card with an Attack icon and KOs it. Players reveal all the cards they investigated.
    eachOtherPlayerVM(p => investigateEv(ev, hasAttackIcon, p.deck, c => KOEv(ev, c), p, true))
  } ],
  [ "Master Manipulator", ev => {
  // <b>Investigate</b> the Hero Deck for an X-Men card and put it into your discard pile.
    investigateEv(ev, 'X-Men', gameState.herodeck, c => moveCardEv(ev, c, playerState.discard));
  } ],
  [ "Corrupt Weak Minds", ev => {
  // Each other player puts a random Bystander from their Victory Pile onto a Hero in the HQ as a <b>Hidden Witness</b>.
    eachOtherPlayerVM(p => p.victory.limit(isBystander).withRandom(b => selectCardEv(ev, "Choose a Hero", hqHeroes(), c => captureWitnessEv(ev, c, b), p)));
  } ],
], {
  varDefense: c => c.printedDefense + [...hqCards(), ...CityCards()].sum(c => (isBystander(c) ? 1 : 0) + c.captured.count(isBystander))
}),
// START: The Goblin captures 2 <b>Hidden Witnesses</b>.
makeMastermindCard("The Goblin, Underworld Boss", 10, 6, "Goblin's Freak Show", ev => {
// Two random Bystanders from each player's Victory Pile become <b>Hidden Witnesses</b> held by The Goblin. Any player who didn't have two Bystanders gains a Wound instead.
  eachPlayer(p => p.victory.count(isBystander) >= 2 ? repeat(2, () => {
    p.victory.limit(isBystander).withRandom(c => captureWitnessEv(ev, ev.source, c));
  }) : gainWoundEv(ev, p));
}, [
  [ "Sinister Dreams", ev => {
  // Each other player reveals a Sinister Six or Spider-Friends Hero or gains a Wound.
    eachOtherPlayerVM(p => revealOrEv(ev, c => isTeam('Sinister Six')(c) || isTeam('Spider Friends')(c), () => gainWoundEv(ev, p), p));
  } ],
  [ "Blackmail the Judges", ev => {
  // For each Goblin's Freak Show Villain in the city, The Goblin captures 2 <b>Hidden Witnesses</b>.
    captureWitnessEv(ev, ev.source.mastermind, 2 * cityVillains().count(isGroup(ev.source.mastermind.leads)));
  } ],
  [ "Carnival of Carnage", ev => {
  // For each Goblin's Freak Show Villain in the city, each other player discards a card.
    eachOtherPlayerVM(p => pickDiscardEv(ev, cityVillains().count(isGroup(ev.source.mastermind.leads)), p));
  } ],
  [ "Blind Loyalty", ev => {
  // <b>Investigate</b> the Villain Deck for a Goblin's Freak Show Villain and put it into your Victory Pile.
    investigateEv(ev, isGroup(ev.source.mastermind.leads), gameState.villaindeck, c => moveCardEv(ev, c, playerState.victory));
  } ],
], {
  init: c => repeat(2, () => gameState.bystanders.size && moveCard(gameState.bystanders.top, c.attachedDeck('WITNESS')))
}),
]);
addTemplates("MASTERMINDS", "X-Men", [
// START: Arcade captures 5 <b>Human Shields</b>.
// EPICNAME: Arcade
// START: Arcade captures 8 <b>Human Shields</b>. Play a random Horror.
...makeEpicMastermindCard("Arcade", [ 3, 4 ], 5, "Murderworld", ev => {
// Arcade captures a random Bystander from each player's Victory Pile as a <b>Human Shield</b>. Each player who didn't have a Bystander gains a Wound instead.
// Arcade captures two random Bystanders from each player's Victory Pile as a <b>Human Shield</b>. Each player who didn't have two Bystanders gains a Wound instead.
  eachPlayer(p => {
    p.victory.count(isBystander) < (ev.source.epic ? 2 : 1) && gainWoundEv(ev, p);
    repeat(ev.source.epic ? 2 : 1, () => cont(ev, () => p.victory.limit(isBystander).withRandom(c => captureShieldEv(ev, ev.source, c))));
  })
}, [
  [ "I Love a Parade!", ev => {
  // Arcade captures two <b>Human Shields</b>. Play an extra card from the Villain Deck next turn.
    captureShieldEv(ev, ev.source.mastermind, 2); villainDrawEv(ev);
  } ],
  [ "I Need an Audience", ev => {
  // Arcade captures <b>Human Shields</b> equal to the number of Villains in the city.
    captureShieldEv(ev, ev.source.mastermind, cityVillains().size);
  } ],
  [ "Roulette Wheel of Death", ev => {
  // Arcade captures a random Bystander as a <b>Human Shield</b> from each of these places: The Bystander Stack, the Escape Pile, each city space, and each other player's Victory Pile.
    gameState.bystanders.withRandom(c => captureShieldEv(ev, ev.source.mastermind, c));
    gameState.ko.limit(isBystander).withRandom(c => captureShieldEv(ev, ev.source.mastermind, c));
    gameState.city.each(d => d.limit(isVillain).each(c => c.captured.limit(isBystander).withRandom(c => captureShieldEv(ev, ev.source.mastermind, c))));
    eachOtherPlayerVM(p => p.victory.limit(isBystander).withRandom(c => captureShieldEv(ev, ev.source.mastermind, c)));
  } ],
  [ "Welcome to my Theme Park!", ev => {
  // Arcade and each Murderworld Villain in the city capture two <b>Human Shields</b>.
    captureShieldEv(ev, ev.source.mastermind, 2);
    cityVillains().limit(isGroup(ev.source.mastermind.leads)).each(c => captureShieldEv(ev, c));
  } ],
], {
  init: c => addFutureTrigger(ev => {
    captureShieldEv(ev, c, c.epic ? 8 : 5);
    ev.source.epic && playHorrorEv(ev);
  }),
}),
// Dark Phoenix Wins: When the Hero Deck is empty.
// EPICNAME: Dark Phoenix
// Dark Phoenix Wins: When the Hero Deck is empty.
...makeEpicMastermindCard("Dark Phoenix", [ 13, 15 ], 7, "Hellfire Club", ev => {
// KO the top card of the Hero Deck and each card in the Hero Deck that shares a color with it. Shuffle the Hero Deck.
// KO the top card of the Hero Deck and each card in the Hero Deck that shares a color with it. Shuffle the Hero Deck. Then, each player plays a Hellfire Club card from their victory Pile. Next, play a random Horror.
  gameState.herodeck.withTop(c => {
    gameState.herodeck.limit(sharesColor(c)).each(c => KOEv(ev, c));
  });
  ev.source.epic && cont(ev, () => {
    eachPlayer(p => selectCardEv(ev, "Choose a Villain to play", p.victory.limit(isGroup(ev.source.leads)), c => villainDrawEv(ev, c), p));
    playHorrorEv(ev);
  });
}, [
  [ "Burn the World to Ashes", ev => {
  // Each other player discards each card from their hand that has the same name as any card in the KO pile.
    const koNames = gameState.ko.deck.unique(c => c.cardName);
    eachOtherPlayerVM(p => p.hand.limit(c => koNames.includes(c.cardName)).each(c => discardEv(ev, c)));
  } ],
  [ "Consume an Entire Galaxy", ev => {
  // Each other player chooses a card from their discard pile that costs 1 or more and KOs it.
    eachOtherPlayerVM(p => selectCardAndKOEv(ev, p.discard.limit(c => c.cost >= 1), p));
  } ],
  [ "Fiery Reincarnation", ev => {
  // Gain a Hero from the KO pile that costs 7 or more.
    selectCardEv(ev, "Choose a Hero to gain", gameState.ko.limit(c => c.cost >= 7), c => gainEv(ev, c));
  } ],
  [ "Worship Me as a God", ev => {
  // Each other player gains two 0-cost cards from the KO pile.
    eachOtherPlayerVM(p => cont(ev, () => selectObjectsEv(ev, "Choose 2 cards to gain", 2, gameState.ko.limit(c => c.cost === 0), c => gainEv(ev, c))));
  } ],
], {
  trigger: { event: 'MOVECARD', match: ev => ev.from === gameState.herodeck, after: ev => gameState.herodeck.size || gameOverEv(ev, 'LOSS', ev.source) }
}),
// Deathbird gets +1 Attack for each Shi'ar Villain in the city and Escape Pile.
// EPICNAME: Deathbird
// Deathbird gets +2 Attack for each Shi'ar Villain in the city and Escape Pile.
...makeEpicMastermindCard("Deathbird", [ 8, 8 ], 6, "Shi'ar Imperial Guard and a Shi'ar Henchmen Group.", ev => { // TODO double leads
// If there are already any Shi'ar Villains in the city, each player gains a Wound. Then this strike enters the city as a Shi'ar Battle Cruiser Token Villain with 7 Attack worth 5 VP.
// If there are already any Shi'ar Villains in the city, play a random Horror. Then this strike enters the city as a Shi'ar Battle Cruiser Token Villain with 9 Attack worth 6 VP.
  cityVillains().has(isGroup(ev.source.leads)) && (ev.source.epic ? playHorrorEv(ev) : eachPlayer(p => gainWoundEv(ev, p)));
  villainify("Shi'ar Battle Cruiser", ev.what, ev.source.epic ? 9 : 7, ev.source.epic ? 6 : 5);
  enterCityEv(ev, ev.what);
}, [
  [ "Shi'ar Elite Bodyguards", ev => {
  // Rescue 4 Bystanders. This Tactic enters the city as a Villain whose only ability is "<b>Escape</b>: Shuffle this card back into Deathbird's Mastermind Tactics as another Tactic."
    rescueEv(ev, 4);
    addStatSet('isVillain', c => c === ev.source, () => true);
    addStatSet('escape', c => c === ev.source, () => ev => shuffleIntoEv(ev, ev.source, ev.source.mastermind.attachedDeck('TACTICS')));
    enterCityEv(ev, ev.source);
  } ],
  [ "Shi'ar Extermination Legion", ev => {
  // Rescue 4 Bystanders. This Tactic enters the city as a Villain whose only ability is: "<b>Escape</b>: Each player discards two cards."
    rescueEv(ev, 4);
    addStatSet('isVillain', c => c === ev.source, () => true);
    addStatSet('escape', c => c === ev.source, () => ev => eachPlayer(p => pickDiscardEv(ev, 2, p)));
    enterCityEv(ev, ev.source);
  } ],
  [ "Shi'ar Hovertake Battalion", ev => {
  // Rescue 4 Bystanders. This Tactic enters the city as a Villain whose only ability is: "<b>Escape</b>: Each player gains a Wound."
    rescueEv(ev, 4);
    addStatSet('isVillain', c => c === ev.source, () => true);
    addStatSet('escape', c => c === ev.source, () => ev => eachPlayer(p => gainWoundEv(ev, p)));
    enterCityEv(ev, ev.source);
  } ],
  [ "Shi'ar Master Spies", ev => {
  // Rescue 4 Bystanders. This Tactic enters the city as a Villain whose only ability is "<b>Escape</b>: This card becomes a Scheme Twist that takes effect immediately."
    rescueEv(ev, 4);
    addStatSet('isVillain', c => c === ev.source, () => true);
    addStatSet('escape', c => c === ev.source, () => ev => playTwistEv(ev, ev.source));
    enterCityEv(ev, ev.source);
  } ],
], {
  varDefense: c => c.printedDefense + (c.epic ? 2 : 1) * gameState.escaped.count(isGroup(c.leads))
}),
// START: Mojo captures 3 <b>Human Shields</b>. All Bystanders in Victory Piles are worth 3 VP.
// EPICNAME: Mojo
// START: Mojo captures 6 <b>Human Shields</b>. Play a random Horror. All Bystanders in Victory Piles are worth 4 VP.
...makeEpicMastermindCard("Mojo", [ 6, 7 ], 5, "Mojoverse", ev => {
// Mojo captures a <b>Human Shield</b>. Each player reveals a [Tech] Hero or discards a card at random.
// Mojo and each Mojoverse Villain capture a <b>Human Shield</b>. Each player reveals a [Tech] Hero or discards down to 4 cards each.
  captureShieldEv(ev, ev.source);
  ev.source.epic && cityVillains().limit(isGroup(ev.source.leads)).each(c => captureShieldEv(ev, c));
  eachPlayer(p => revealOrEv(ev, Color.TECH, ev.source.epic ? () => pickDiscardEv(ev, -4, p) : () => p.hand.deck.withRandom(c => discardEv(ev, c)), p));
}, [
  [ "Billions of TV Viewers", ev => {
  // Each player reveals a [Tech] Hero or chooses a random Bystander from their Victory Pile. Mojo captures those Bystanders as <b>Human Shields</b>.
    eachOtherPlayerVM(p => revealOrEv(ev, Color.TECH, () => p.victory.limit(isBystander).withRandom(c => captureShieldEv(ev, ev.source.mastermind, c)), p));
  } ],
  [ "Brain-Melting TV Marathon", ev => {
  // Each other player without a Mojo Tactic in their Victory Pile gains a Wound.
    eachOtherPlayerVM(p => p.victory.limit(isTactic).has(c => c.mastermind === ev.source.mastermind) || gainWoundEv(ev, p));
  } ],
  [ "Cross-Dimensional Marketing", ev => {
  // You get +1 Recruit for each Bystander in your Victory Pile. Mojo captures a <b>Human Shield</b>.
    addRecruitEvent(ev, playerState.victory.count(isBystander));
    captureShieldEv(ev, ev.source.mastermind);
  } ],
  [ "Mojo Branding Opportunity", ev => {
  // Draw a card for each Mojoverse Villain in your Victory Pile. Mojo captures a <b>Human Shield</b>.
    drawEv(ev, playerState.victory.count(isGroup(ev.source.mastermind.leads)));
    captureShieldEv(ev, ev.source.mastermind);
  } ],
], {
  init: c => {
    addFutureTrigger(ev => captureShieldEv(ev, c, c.epic ? 6 : 3));
    c.epic && addFutureTrigger(ev => playHorrorEv(ev));
    addStatSet('vp', c => isBystander(c) && c.location.owner && c.location === c.location.owner.victory, () => c.epic ? 4 : 3);
  }
}),
// Each player's hand size is 1 less.
// EPICNAME: Onslaught
// Each player's hand size is 1 less.
...makeEpicMastermindCard("Onslaught", [ 10, 12 ], 7, "Dark Descendants", ev => {
// KO all Heroes Dominated by Onslaught. Then each player reveals their hand and chooses one of their non-grey Heroes. Onslaught Dominates those Heroes.
// KO all Heroes Dominated by Onslaught. Then each player reveals their hand and chooses two of their non-grey Heroes. Onslaught Dominates those Heroes. Then play a random Horror.
  ev.source.attached('DOMINATED').each(c => KOEv(ev, c));
  eachPlayer(p => ev.source.epic ?
    selectObjectsEv(ev, "Choose two Heroes", 2, p.hand.limit(isNonGrayHero), c => dominateEv(ev, ev.source, c), p) :
    selectCardEv(ev, "Choose a Hero", p.hand.limit(isNonGrayHero), c => dominateEv(ev, ev.source, c), p))
  ev.source.epic && playHorrorEv(ev);
}, [
  [ "Godlike Psionic Entity", ev => {
  // Onslaught Dominates all five Heroes from the HQ.
    hqHeroes().each(c => dominateEv(ev, ev.source.mastermind, c));
  } ],
  [ "Sins of X-Men Past", ev => {
  // Each other player reveals the top six cards of their deck and chooses an X-Men Hero revealed this way. Onslaught Dominates those Heroes. Put the rest back in random order.
    eachOtherPlayerVM(p => revealPlayerDeckEv(ev, 6, cards => selectCardEv(ev, "Choose an X-Men Hero", cards.limit('X-Men'), c => dominateEv(ev, ev.source.mastermind, c), p), p)); // TODO random
  } ],
  [ "Xavier and Magneto Combined", ev => {
  // Reveal the top three cards of the Hero Deck. Onslaught Dominates all the X-Men and Brotherhood Heroes you revealed. Put the rest back in random order.
    revealHeroDeckEv(ev, 3, cards => cards.limit(c => isTeam('X-Men')(c) || isTeam('Brotherhood')(c)).each(c => dominateEv(ev, ev.source.mastermind, c)));
  } ],
  [ "Worldwide Mental Control", ev => {
  // Onslaught Dominates four 0-cost Heroes from the KO pile. The next time a player fights Onslaught, KO those 0-cost Heroes.
    gameState.ko.limit(isHero).limit(c => c.cost === 0).each(c => dominateEv(ev, ev.source.mastermind, c));
  } ],
], {
  init: () => {
    gameState.endDrawAmount--;
  },
  trigger: {
    event: 'DEFEAT',
    match: (ev, source) => ev.what === source,
    before: ev => ev.parent.what.attached('DOMINATED').limit(c => c.cost === 0).each(c => KOEv(ev, c)),
  }
}),
// EPICNAME: Shadow King
// START: Play two random Horrors.
...makeEpicMastermindCard("Shadow King", [ 7, 9 ], 6, "Shadow-X", ev => {
// KO all Heroes Dominated by Shadow King. Then each player chooses a non-grey Hero from their discard pile. Shadow King Dominates those Heroes.
// KO all Heroes Dominated by Shadow King. Then each player chooses a non-grey Hero from their discard pile. Shadow King Dominates those Heroes.
  ev.source.attached('DOMINATED').each(c => KOEv(ev, c));
  eachPlayer(p => selectCardEv(ev, "Choose a Hero", p.discard.limit(isNonGrayHero), c => dominateEv(ev, ev.source, c), p));
}, [
  [ "Fiend of the Astral Plane", ev => {
  // Each other player reveals their hand and shuffles two cards with Recruit icons from their hand back into their deck.
    eachOtherPlayerVM(p => selectObjectsEv(ev, "Choose two cards", 2, p.hand.limit(hasRecruitIcon), c => shuffleIntoEv(ev, c, p.deck), p));
  } ],
  [ "Poison their Minds", ev => {
  // Each other player reveals their hand and chooses one of their non-grey Heroes. Shadow King Dominates those Heroes.
    eachOtherPlayerVM(p => selectCardEv(ev, "Select a Hero", p.hand.limit(isNonGrayHero), c => dominateEv(ev, ev.source.mastermind, c), p));
  } ],
  [ "Psychic Seduction", ev => {
  // Shadow King Dominates each Hero that costs 5 or less from the HQ.
    hqHeroes().limit(c => c.cost <= 5).each(c => dominateEv(ev, ev.source.mastermind, c));
  } ],
  [ "Telepathic Betrayal", ev => {
  // If the "Betrayal of the Shadow" Trap is in any Victory Pile or the KO pile, put it on top of the Villain Deck.
    [gameState.ko, ...gameState.players.map(p => p.victory)].each(d => d.limit(c => c.cardName === "Betrayal of the Shadow").each(c => moveCardEv(ev, c, gameState.villaindeck)));
  } ],
], {
  init: c => {
    c.epic && addFutureTrigger(ev => (playHorrorEv(ev), playHorrorEv(ev)));
  }
}),
]);
addTemplates("MASTERMINDS", "Spider-Man Homecoming", [
// {STRIKER 2}
// EPICNAME: Adrian Toomes
// {STRIKER 3}
...makeEpicMastermindCard("Adrian Toomes", [ 5, 5 ], 6, "Salvagers", ev => {
// Starting from the Sewers, each Villain in the city uses its "Escape" ability.
// Starting from the Sewers, each Villain in the city uses its "Ambush" ability, then its "Escape" ability.
  gameState.city.reverse().each(d => d.limit(isVillain).each(c => { // TODO reverse 
    ev.source.epic && pushEffects(ev, c, 'ambush', c.ambush);
    pushEffects(ev, c, 'escape', c.escape);
  }));
}, [
  [ "Don't Interfere", ev => {
  // {DANGERSENSE 4}. If this revealed any Bystanders, rescue them.
    dangerSenseEv(ev, 4, cards => cards.limit(isBystander).each(c => rescueEv(ev, c)));
  } ],
  [ "More Harm than Good", ev => {
  // Each other player discards a Spider Friends Hero or gains a Wound.
    eachOtherPlayerVM(p => selectCardOptEv(ev, "Choose a card to discard", p.hand.limit('Spider Friends'), c => discardEv(ev, c), () => gainWoundEv(ev, p), p));
  } ],
  [ "Take Everything", ev => {
  // You may put a card from your discard pile on top of your deck.
    selectCardOptEv(ev, "Choose a card to put on to of your deck", playerState.discard.deck, c => moveCardEv(ev, c, playerState.deck));
  } ],
  [ "The World's Changed", ev => {
  // {DANGERSENSE 3}. Put all Henchmen Villains revealed this way into your Victory Pile, then do their "Fight" abilities.
    dangerSenseEv(ev, 3, cards => cards.limit(isHenchman).each(c => {
      moveCardEv(ev, c, playerState.victory);
      pushEffects(ev, c, 'fight', c.fight, { where: gameState.villaindeck });
    }))
  } ],
], {
  varDefense: c => c.printedDefense + (c.epic ? 3 : 2) * strikerCount()
}),
// {STRIKER 1}
// EPICNAME: Vulture
// {STRIKER 1}
...makeEpicMastermindCard("Vulture", [ 8, 10 ], 6, "Vulture Tech", ev => {
// Put a Wound from the Wound Stack below each HQ space as a "Winged Assault." Whenever a player gains or KOs a Hero from the HQ, the player on their right gains one of the Wounds below that HQ space.
// Put a Wound from the Wound Stack or KO pile below each HQ space as a "Winged Assault." Whenever a player gains or KOs a Hero from the HQ, the player on their right gains one of the Wounds below that HQ space, putting it on top of their deck.
}, [
  [ "Bird of Prey", ev => {
  // Each other player discards a Spider Friends Hero or discards two cards.
    eachOtherPlayerVM(p => selectCardOptEv(ev, "Choose a card to discard", p.hand.limit('Spider Friends'), c => discardEv(ev, c), () => pickDiscardEv(ev, 2, p), p));
  } ],
  [ "Lurking Shadow", ev => {
  // {DANGERSENSE 2}. If the Rooftops are empty, a Villain you revealed enters the Rooftops.
    dangerSenseEv(ev, 2, cards => {
      withCity('ROOFTOPS', rooftops => rooftops.size || selectCardEv(ev, "Choose a Villain", cards.limit(isVillain), c => enterCityEv(ev, c, rooftops)));
    })
  } ],
  [ "Mid Air Heist", ev => {
  // You get +5 Recruit usable only to recruit [Tech] Heroes.
    addRecruitSpecialEv(ev, isColor(Color.TECH), 5);
  } ],
  [ "Winged Assault", ev => {
  // Put two "Winged Assault" Wounds from under the HQ into each other player's discard pile.
    let w = gameState.hq.map(c => c.attached('WINGED_ASSAULT')).merge();
    eachOtherPlayerVM(p => cont(ev, () => selectObjectsEv(ev, `Choose Wound for ${p.name} to gain`, 2, w, c => (moveCardEv(ev, c, p.discard), w = w.limit(v => v !== c)))));
  } ],
], {
  varDefense: strikerVarDefense,
  triggers: [{
    event: 'GAIN',
    match: ev => ev.what.location.isHQ && ev.what.location.attached('WINGED_ASSAULT').size > 0,
    after: ev => ev.parent.what.location.attached('WINGED_ASSAULT').withFirst(c => gainWoundEv(ev, ev.parent.who.right)),
  }, {
    event: 'KO',
    match: ev => ev.what.location.isHQ && ev.what.location.attached('WINGED_ASSAULT').size > 0,
    after: ev => ev.parent.what.location.attached('WINGED_ASSAULT').withFirst(c => gainWoundEv(ev, playerState.right)),
  }]
}),
]);
addTemplates("MASTERMINDS", "Champions", [
// {SIZECHANGING STRENGTH INSTINCT COVERT TECH RANGED}
// EPICNAME: Fin Fang Foom
// {SIZECHANGING STRENGTH INSTINCT COVERT TECH RANGED}
...makeEpicMastermindCard("Fin Fang Foom", [ 20, 24 ], 7, "Monsters Unleashed", ev => {
// <b>Demolish</b> each player, then do it again for each Monsters Unleashed Villain in the city and Escape Pile.
// <b>Demolish</b> each player, then do it again for each Monsters Unleashed Villain in the city and Escape Pile. KO all the Heroes <b>Demolished</b> this way.
  repeat(1 + [...cityVillains(), ...gameState.escaped.deck].count(isGroup(ev.source.leads)), () => demolishEv(ev));
  ev.source.epic && cont(ev, () => turnState.pastEvents.limit(e => e.type === 'DISCARD' && e.parent === ev).each(e => KOEv(ev, e.what)));
}, [
  [ "Alien Dragon Technology", ev => {
  // A Hero in the HQ gets {SIZECHANGING STRENGTH INSTINCT COVERT TECH RANGED} this turn.
    selectCardEv(ev, "Choose a Hero to gain Size-Changing", hqHeroes(), c => addTurnSet('sizeChanging', v => v === c, (c, prev) => safeOr(prev, Color.STRENGTH | Color.INSTINCT | Color.COVERT | Color.TECH | Color.RANGED)));
  } ],
  [ "Flammable Acid Breath", ev => {
  // KO the top card of the Hero Deck. Then each other player KOs a Hero of that Hero class from their discard pile ([Strength] [Instinct] [Covert] [Tech] [Ranged] ).
    revealHeroDeckEv(ev, 1, cards => cards.each(c => {
      KOEv(ev, c);
      eachOtherPlayerVM(p => selectCardAndKOEv(ev, p.discard.limit(sharesColor(c)), p));
    }));
  } ],
  [ "Multipronged Assault", ev => {
  // Each other player reveals at least 3 Hero Classes ([Strength] [Instinct] [Covert] [Tech] [Ranged] ) or gains a Wound.
    eachOtherPlayerVM(p => numClasses(yourHeroes(p)) >= 3 || gainWoundEv(ev, p)); // TODO multiplayer reveal
  } ],
  [ "Supersonic Dive Attack", ev => {
  // KO the top card of the Hero Deck. Then each other player reveals their hand and discards a Hero of that Hero Class ([Strength] [Instinct] [Covert] [Tech] [Ranged] ).
    revealHeroDeckEv(ev, 1, cards => cards.each(c => {
      KOEv(ev, c);
      eachOtherPlayerVM(p => selectCardEv(ev, "Choose a Hero to discard", p.hand.limit(isHero).limit(sharesColor(c)), c => discardEv(ev, c), p)); // TODO multiplayer reveal
    }));
  } ],
], {
  sizeChanging: Color.STRENGTH | Color.INSTINCT | Color.COVERT | Color.TECH | Color.RANGED,
}),
// EPICNAME: Pagliacci
...makeEpicMastermindCard("Pagliacci", [ 9, 11 ], 6, "Wrecking Crew", ev => {
// NR[1, 5] This card becomes a Scheme Twist that takes effect immediately.|NR[2, 3, 4] <b>Demolish</b> each player.
// NR[1, 3, 5] This card becomes a Scheme Twist that takes effect immediately.|NR[2, 4] <b>Demolish</b> each player.
  if (ev.nr <= 5) (ev.source.epic ? [1, 3, 5] : [1, 5]).includes(ev.nr) ? playTwistEv(ev, ev.source) : demolishEv(ev);
}, [
  [ "Commedia Dell'Morte", ev => {
  // Each other player may gain two Wounds. <b>Demolish</b> each of those players who does not.
    const players = new Set<Player>();
    eachOtherPlayerVM(p => cont(ev, () => gameState.wounds.size >= 2 && chooseMayEv(ev, "Gain two Wounds", () => { gainWoundEv(ev, p); gainWoundEv(ev, p); players.add(p)}, p)));
    cont(ev, () => demolishEv(ev, p => !players.has(p)));
  } ],
  [ "Creative Assassin", ev => {
  // You get {VERSATILE 3}.
    versatileEv(ev, 3);
  } ],
  [ "Insane Clown Has a Posse", ev => {
  // Each other player may KO a Wrecking Crew Villain from their Victory Pile. <b>Demolish</b> each of those players who does not.
    const players = new Set<Player>();
    eachOtherPlayerVM(p => selectCardOptEv(ev, "Choose a Villain to KO", p.victory.limit(isGroup(ev.source.mastermind.leads)), c => KOEv(ev, c), () => players.add(p), p));
    cont(ev, () => demolishEv(ev, p => players.has(p)));
  } ],
  [ "Jester of a Twisted Opera", ev => {
  // Each other player may KO a card from their discard pile that costs 1 or more. <b>Demolish</b> each of those players who does not.
    const players = new Set<Player>();
    eachOtherPlayerVM(p => selectCardOptEv(ev, "Choose a card to KO", p.discard.limit(c => c.cost >= 1), c => KOEv(ev, c), () => players.add(p), p));
    cont(ev, () => demolishEv(ev, p => players.has(p)));
  } ],
]),
]);
addTemplates("MASTERMINDS", "World War Hulk", [
// START: Stack 8 Bystanders next to General Ross as "Helicopter" Villains with 2 Attack. You can fight them to rescue them as Bystanders. You can't fight General Ross while he has any Helicopters.
// TRANSNAME: Red Hulk
// {WOUNDED FURY}
// You can't fight Helicopters, and they don't stop you from fighting Red Hulk.
makeTransformingMastermindCard(makeMastermindCard("General Ross", 6, 6, "Code Red", ev => {
//  General Ross {TRANSFORM} then {XDRAMPAGE Hulk}.
  transformMastermindEv(ev);
  xdRampageEv(ev, 'Hulk');
}, [
// This Mastermind {TRANSFORM}.
  [ "Bust You Down to Private", ev => {
  // Each other player puts a non-grey Hero from their hand on the bottom of the Hero Deck, then puts a 0-cost Hero from the KO pile into their hand.
    eachOtherPlayerVM(p => {
      selectCardEv(ev, "Choose a Hero", p.hand.limit(isNonGrayHero), c => moveCardEv(ev, c, gameState.herodeck, true));
      selectCardEv(ev, "Choose a Hero", gameState.ko.limit(isHero).limit(c => c.cost === 0), c => moveCardEv(ev, c, p.hand));
    })
    transformMastermindEv(ev);
  } ],
// This Mastermind {TRANSFORM}.
  [ "Call Out the Army", ev => {
  // Put 3 Bystanders from the Bystander Stack next to this Mastermind as "Helicopters."
    repeat(3, () => cont(ev, () => gameState.bystanders.withTop(c => {
      villainify("Helicopter", c, 2, "RESCUE");
      moveCardEv(ev, c, ev.source.mastermind.attachedDeck("HELICOPTERS"));
    })));
    transformMastermindEv(ev);
  } ],
// This Mastermind {TRANSFORM}.
  [ "Personal Arsenal", ev => {
  // For each Master Strike in the KO pile, put a Bystander from the Bystander Stack next to the Mastermind as a "Helicopter."
    repeat(gameState.ko.count(isStrike), () => cont(ev, () => gameState.bystanders.withTop(c => {
      villainify("Helicopter", c, 2, "RESCUE");
      moveCardEv(ev, c, ev.source.mastermind.attachedDeck("HELICOPTERS"));
    })));
    transformMastermindEv(ev);
  } ],
// This Mastermind {TRANSFORM}.
  [ "Urban Warfare", ev => {
  // Put a random Bystander next to the Mastermind as a "Helicopter" from each of these places: The Bystander Stack, the Escape Pile, each city space, and each other player's Victory Pile.
    const cards = new Array<Card>();
    [ gameState.bystanders.deck, gameState.escaped.deck, ...gameState.players.map(p => p.victory.deck) ].each(d => d.withRandom(c => cards.push(c)));
    // TODO bystanders in city
    cont(ev, () => cards.each(c => {
      villainify("Helicopter", c, 2, "RESCUE");
      moveCardEv(ev, c, ev.source.mastermind.attachedDeck("HELICOPTERS"));
    }));
    transformMastermindEv(ev);
  } ],
], {
  init: m => {
    repeat(8, () => gameState.bystanders.withTop(c => {
      villainify("Helicopter", c, 2, "RESCUE");
      moveCard(c, m.attachedDeck("HELICOPTERS"));
    }));
  },
  fightCond: c => c.attachedDeck("HELICOPTERS").size === 0,
  cardActions: [
    (c, ev) => c.attached("HELICOPTERS").size ? fightActionEv(ev, c.attached("HELICOPTERS")[0]) : noOpActionEv(ev), // TODO cardAction array return
  ],
}), "Red Hulk", 9, ev => {
// Red Hulk {TRANSFORM}, then stack a random Bystander from each player's Victory Pile next to this as a Helicopter. Each player who didn't have a Bystander gains a Wound instead.
  transformMastermindEv(ev);
  eachPlayer(p => {
    p.victory.limit(isBystander).withRandom(c => {
      villainify("Helicopter", c, 2, "RESCUE");
      attachCardEv(ev, c, ev.source, "HELICOPTERS");
    });
    p.victory.has(isBystander) || gainWoundEv(ev, p);
  })
}, {
  varDefense: woundedFuryVarDefense,
}),
// This Mastermind gets +4 Attack unless you {OUTWIT} them.
// TRANSNAME: Illuminati, Open Warfare
// Whenever a card effect causes a player to draw any number of cards, that player must then also discard a card.
makeTransformingMastermindCard(makeMastermindCard("Illuminati, Secret Society", 11, 7, "Illuminati", ev => {
// Each player reveals their hand and discards two cards that each cost between 1 and 4. The Illuminati {TRANSFORM}.
  eachPlayer(p => pickDiscardEv(ev, 2, p, c => c.cost >= 1 && c.cost <= 4));
  transformMastermindEv(ev);
}, [
// The Illuminati {TRANSFORM}.
  [ "Black Bolt's Omni-Shout", ev => {
  // Each other player reveals their hand and discards two cards with no rules text.
    eachOtherPlayerVM(p => pickDiscardEv(ev, 2, p, hasFlag("N")));
    transformMastermindEv(ev);
  } ],
// The Illuminati {TRANSFORM}.
  [ "Dr. Strange's Orb of Agamotto", ev => {
  // Each other player reveals their hand and discards a [Ranged] or [Instinct] Hero.
    eachOtherPlayerVM(p => pickDiscardEv(ev, 1, p, isColor(Color.RANGED | Color.INSTINCT)));
    transformMastermindEv(ev);
  } ],
// The Illuminati {TRANSFORM}.
  [ "Hulkbuster's Hammer Fist", ev => {
  // Each other player reveals their hand and KOs a [Tech] or [Strength] Hero from their hand or discard pile.
    eachOtherPlayerVM(p => selectCardAndKOEv(ev, handOrDiscard(p).limit(Color.TECH | Color.STRENGTH), p));
    transformMastermindEv(ev);
  } ],
// The Illuminati {TRANSFORM}.
  [ "Zom's Manacles of Living Bondage", ev => {
  // Each other player reveals a [Covert] Hero or gains a Wound.
    eachOtherPlayerVM(p => revealOrEv(ev, Color.COVERT, () => gainWoundEv(ev, p), p));
    transformMastermindEv(ev);
  } ],
], {
  cardActions: [ (c, ev) => new Ev(ev, 'EFFECT', { cost: { cond: c => canOutwit() && !pastEvents('OUTWIT').has(e => e.getSource() === c)}, what: c, func: ev => {
    outwitOrEv(ev, () => {});
  }}) ],
  varDefense: c => c.printedDefense + (pastEvents('OUTWIT').has(e => e.getSource() === c) ? 0 : 4),  
}), "Illuminati, Open Warfare", 13, ev => {
// Each player reveals their hand and discards two cards that each cost between 5 and 8. The Illuminati {TRANSFORM}.
  eachPlayer(p => pickDiscardEv(ev, 2, p, c => c.cost >= 5 && c.cost <= 8));
  transformMastermindEv(ev);
}, {
  trigger: {
    event: 'DRAW', // TODO draw N
    after: ev => pickDiscardEv(ev, 1, ev.parent.who),
  }
}),
// King Hulk gets +1 Attack for each Warbound Villain in the city and in the Escape Pile.
// TRANSNAME: King Hulk, Worldbreaker
// {WOUNDED FURY}
makeTransformingMastermindCard(makeMastermindCard("King Hulk, Sakaarson", 9, 6, "Warbound", ev => {
// Each player KO's a Warbound Villain from their Victory Pile or gains a Wound. King Hulk {TRANSFORM}.
  eachPlayer(p => selectCardOptEv(ev, "Choose a Villain to KO", p.victory.limit(isGroup(ev.source.leads)), c => KOEv(ev, c), () => gainWoundEv(ev, p), p));
  transformMastermindEv(ev);
}, [
// King Hulk {TRANSFORM}.
  [ "Fury of the Green Scar", ev => {
  // Each other player reveals their hand and discards a Hero that isn't grey and isn't [Strength].
    eachOtherPlayerVM(p => pickDiscardEv(ev, 1, p, c => isNonGrayHero(c) && !isColor(Color.STRENGTH)(c)));
    transformMastermindEv(ev);
  } ],
// King Hulk {TRANSFORM}.
  [ "Oath of the Warbound", ev => {
  // The Villain in the Escape Pile with the highest printed Attack enters the Sewers.
    selectCardEv(ev, "Choose a Villain", gameState.escaped.limit(isVillain).highest(c => c.printedDefense), c => enterCityEv(ev, c));
    transformMastermindEv(ev);
  } ],
// King Hulk {TRANSFORM}.
  [ "Revenge from the Stars", ev => {
  // After you put this in your Victory Pile, {XDRAMPAGE Hulk}.
    xdRampageEv(ev, 'Hulk');
    transformMastermindEv(ev);
  } ],
// King Hulk {TRANSFORM}.
  [ "Rule By the Strongest", ev => {
  // You get +1 Recruit for each of your [Strength] Heroes.
    addRecruitEvent(ev, yourHeroes().count(Color.STRENGTH));
    transformMastermindEv(ev);
  } ],
], {
  varDefense: c => c.printedDefense + cityVillains().count(isGroup(c.leads)) + gameState.escaped.count(isGroup(c.leads)),
}), "King Hulk, Worldbreaker", 10, ev => {
// Each player reveals their hand, then KO's a card from their hand or discard pile that has the same card name as a card in the HQ. King Hulk {TRANSFORM}.
  const names = hqCards().map(c => c.cardName);
  eachPlayer(p => selectCardAndKOEv(ev, handOrDiscard(p).limit(c => names.includes(c.cardName)), p)); // multiplayer reveal
  transformMastermindEv(ev);
}, {
  varDefense: woundedFuryVarDefense,
}),
// All cards' {OUTWIT} abilities require four different costs instead of three.
// TRANSNAME: M.O.D.O.K., Network Nightmare
// You can only fight M.O.D.O.K with Recruit, not Attack. // TODO
makeTransformingMastermindCard(makeMastermindCard("M.O.D.O.K.", 9, 6, "Intelligencia", ev => {
// Each player who can't {OUTWIT} M.O.D.O.K. gains a Wound, then M.O.D.O.K. {TRANSFORM}.
  eachPlayer(p => outwitOrEv(ev, () => gainWoundEv(ev, p), p));
  transformMastermindEv(ev);
}, [
// M.O.D.O.K. {TRANSFORM}.
  [ "Brain Scramble", ev => {
  // Each other player discards their hand, then draws as many cards as they discarded.
    eachOtherPlayerVM(p => { discardHandEv(ev, p); drawEv(ev, p.hand.size, p); })
    transformMastermindEv(ev);
  } ],
// M.O.D.O.K. {TRANSFORM}.
  [ "Designed Only For...K.O.ING", ev => {
  // Reveal the top three cards of your deck. KO one of them, draw one, and discard one.
   // TODO
    transformMastermindEv(ev);
  } ],
// M.O.D.O.K. {TRANSFORM}.
  [ "Don't Get a Big head About It", ev => {
  // Draw a card for each Intelligencia Villain in your Victory Pile.
    drawEv(ev, playerState.victory.count(isGroup(ev.source.mastermind.leads)));
    transformMastermindEv(ev);
  } ],
// M.O.D.O.K. {TRANSFORM}.
  [ "Redundancy Algorithim", ev => {
  // Each other player reveals their hand and discards two cards that hand the same cost. // FIX
    eachOtherPlayerVM(p => {
      const costs = p.hand.deck.unique(c => c.cost).limit(cost => p.hand.count(c => c.cost === cost) > 1);
      selectCardEv(ev, "Choose a card to discard", p.hand.limit(c => costs.includes(c.cost)), c => {
        cont(ev, () => selectCardEv(ev, "Choose a card to discard", p.hand.limit(v => v !== c && v.cost === c.cost), v => {
          discardEv(ev, c);
          discardEv(ev, v);
        }, p));
      }, p);
    });
    transformMastermindEv(ev);
  } ],
], {
  init: c => gameState.outwitAmount = 4, // TODO only on non-transformed side
}), "M.O.D.O.K., Network Nightmare", 8, ev => {
// Each player who can't {OUTWIT} M.O.D.O.K. KO's a non-grey Hero from their discard pile. M.O.D.O.K. {TRANSFORM}.
  eachPlayer(p => outwitOrEv(ev, () => selectCardAndKOEv(ev, p.discard.limit(isNonGrayHero), p), p));
  transformMastermindEv(ev);
}),
// You can't fight the Red King while any Villains are in the city.
// TRANSNAME: The Red King, Power Armored
makeTransformingMastermindCard(makeMastermindCard("The Red King", 7, 6, "Sakaar Imperial Guard", ev => {
// The Red King {TRANSFORM}, then each player reveals a [Tech] card or gains a Wound.
  transformMastermindEv(ev);
  eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainWoundEv(ev, p), p));
}, [
// The Red King {TRANSFORM}.
  [ "Haughty Spite", ev => {
  // Each other player without a Red King Tactic in their Victory Pile gains a Wound.
    eachOtherPlayerVM(p => p.victory.has(c => isTactic(c) && c.mastermind === ev.source.mastermind) || gainWoundEv(ev, p));
    transformMastermindEv(ev);
  } ],
// The Red King {TRANSFORM}.
  [ "Royal Bodyguard", ev => {
  // Reveal cards from the Villain Deck until you reveal a Sakaar Imperial Guard. If you find one, play it. Either way, shuffle all the other revealed cards back into the Villain Deck.
    revealVillainDeckEv(ev, cards => !cards.has(isGroup(ev.source.mastermind.leads)), cards => {
      cards.limit(c => !isGroup(ev.source.mastermind.leads)(c)).each(c => shuffleIntoEv(ev, c, gameState.villaindeck)); 
      cards.limit(isGroup(ev.source.mastermind.leads)).each(c => villainDrawEv(ev, c));
    });
    transformMastermindEv(ev);
  } ],
// The Red King {TRANSFORM}.
  [ "Treasury of Sakaar", ev => {
  // You get +1 Recruit for each Sakaar Imperial Guard and Red King Tactic in your Victory Pile, including this one.
    addRecruitEvent(ev, playerState.victory.count(c => isGroup(ev.source.mastermind.leads)(c) || isTactic(c) && c.mastermind === ev.source.mastermind));
    transformMastermindEv(ev);
  } ],
// The Red King {TRANSFORM}.
  [ "Vast Armies of Sakaar", ev => {
  // If this is not the final Tactic, reveal the top three cards of the Villain Deck. Play all the Villains you revealed. Put the rest back in random order.
    finalTactic(ev.source) || revealVillainDeckEv(ev, 3, cards => {
      selectCardOrderEv(ev, 'Choose a Villain', cards.limit(isVillain), c => enterCityEv(ev, c));
    }, true, false);
    transformMastermindEv(ev);
  } ],
], {
  fightCond: c => cityVillains().size > 0,
}), "The Red King, Power Armored", 10, ev => {
// The Red King {TRANSFORM} then play another card from the Villain Deck.
  transformMastermindEv(ev);
  villainDrawEv(ev);
}),
// START: Shuffle 2 Wounds into each player's deck before drawing starting hands.
makeTransformingMastermindCard(makeMastermindCard("The Sentry", 10, 6, "Aspects of the Void", ev => {
// The Sentry {TRANSFORM}, then {XDRAMPAGE Void}.
  transformMastermindEv(ev);
  xdRampageEv(ev, 'Void');
}, [
// This Mastermind {TRANSFORM}.
  [ "Pacifying Light", ev => {
  // Each other player reveals their hand and discard two cards with Recruit icons.
    eachOtherPlayerVM(p => pickDiscardEv(ev, 2, p, hasRecruitIcon));
    transformMastermindEv(ev);
  } ],
// This Mastermind {TRANSFORM}.
  [ "Power of a Million Exploding Suns", ev => {
  // Put all Heroes from the HQ on the bottom of the Hero Deck. Each other player reveals their hand and discards each card with the same card name as any of those cards.
    const names = hqHeroes().unique(c => c.cardName);
    hqHeroes().each(c => moveCardEv(ev, c, gameState.herodeck, true));
    eachOtherPlayerVM(p => p.hand.limit(c => names.includes(c.cardName)).each(c => discardEv(ev, c)));
    transformMastermindEv(ev);
  } ],
// This Mastermind {TRANSFORM}.
  [ "Reflexive Teleportation", ev => {
  // Choose one of your Heroes that costs 5 or less. When you draw a new hand of cards at the end of this turn, add that Hero to your hand as an extra card.
    selectCardEv(ev, "Choose a Hero", yourHeroes().limit(c => c.cost <= 5), sel => addTurnTrigger("CLEANUP", undefined, ev => moveCardEv(ev, sel, playerState.hand)));
    transformMastermindEv(ev);
  } ],
// This Mastermind {TRANSFORM}.
  [ "Repressed Darkness", ev => {
  // Each other player reveals a [Ranged] Hero or plays an Aspects of the Void Villain from their Victory Pile as if playing it from the Villain Deck.
    eachOtherPlayerVM(p => revealOrEv(ev, Color.RANGED, () => selectCardEv(ev, "Choose a Villain", p.victory.limit(isGroup(ev.source.mastermind.leads)), c => enterCityEv(ev, c)), p));
    transformMastermindEv(ev);
  } ],
// TRANSNAME: The Void
// {WOUNDED FURY}
// The Void {TRANSFORM}.
], {
  init: c => {
    eachPlayer(p => repeat(2, () => gameState.wounds.withTop(c => moveCard(c, p.deck))));
    eachPlayer(p => p.deck.shuffle());
  },
}), "The Void", 11, ev => {
// {FEAST} on each player. If this feasts on a player's grey Hero, that player gains a Wound.
  eachPlayer(p => feastEv(ev, c => isColor(Color.GRAY)(c) && gainWoundEv(ev, p), p));
  transformMastermindEv(ev);
}, {
  varDefense: woundedFuryVarDefense,
}),
]);
