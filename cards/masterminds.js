"use strict";
addTemplates("MASTERMINDS", "Legendary", [
makeMastermindCard("Dr. Doom", 9, 5, "Doombot Legion", ev => {
  // Each player with exactly 6 cards in hand reveals a [Tech] Hero or puts 2 cards from their hand on top of their deck.
  eachPlayer(p => { if (p.hand.size === 6) revealOrEv(ev, Color.BLACK, () => { pickTopDeckEv(ev, p); pickTopDeckEv(ev, p); }, p); });
}, [
  // You may recruit a [Tech] or [Ranged] Hero from the HQ for free.
  [ "Dark Technology", ev => {
    selectCardEv(ev, HQCards().limit(Color.BLACK | Color.BLUE), sel => recruitForFreeEv(ev, sel));
  } ],
  // Choose one: each other player draws a card or each other player discards a card.
  [ "Monarch's Decree", ev => {
      chooseOneEv(ev, "Each other player",
      "draws a card", ev => eachOtherPlayerVM(p => pickDiscardEv(ev, p)),
      "discards a card", ev => eachOtherPlayerVM(p => drawEv(ev, 1, p))
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
  [ "Cruel Ruler", ev => selectCardEv(ev, CityCards().limit(isVillain), sel => defeatEv(ev, sel)) ],
  // KO up to four cards from your discard pile.
  [ "Maniacal Tyrant", ev => selectCardsOptEv(ev, 4, playerState.discard, sel => KOEv(ev, sel)) ], // TODO selectCardsOpt
  // Each other player KOs a Villain from their Victory Pile.
  [ "Vanishing Illusions", ev => eachOtherPlayerVM(p => selectCardEv(ev, p.victory.limit(isVillain), sel => KOEv(ev, sel), p)) ],
  // Each other player KOs two Bystanders from their Victory Pile.
  [ "Whispers and Lies", ev => eachOtherPlayerVM(p => selectCardsNEv(ev, 2, p.victory.limit(isBystander), sel => KOEv(ev, sel), p)) ],
]),
makeMastermindCard("Magneto", 8, 5, "Brotherhood", ev => {
// Each player reveals an X-Men Hero or discards down to four cards.
  eachPlayer(p => revealOrEv(ev, 'X-Men', () => selectCardsNEv(ev, p.hand.size - 4, p.hand, sel => discardEv(ev, sel), p), p));
}, [
  // Recruit an X-Men Hero from the HQ for free.
  [ "Bitter Captor", ev => selectCardEv(ev, HQCards().limit('X-Men'), sel => recruitForFreeEv(ev, sel)) ],
  // Each other player reveals an X-Men Hero or gains two Wounds.
  [ "Crushing Shockwave", ev => {
    eachOtherPlayerVM(p => revealOrEv(ev, 'X-Men', () => { gainWoundEv(ev, p); gainWoundEv(ev, p); }, p));
  } ],
  // Choose one of your X-Men Heroes. When you draw a new hand of cards at the end of this turn, add that Hero to your hand as a seventh card.
  [ "Electromagnetic Bubble", ev => {
    selectCardEv(ev, yourHeroes().limit('X-Men'), sel => addTurnTrigger("CLEANUP", u, ev => moveCardEv(ev, sel, playerState.hand))); // TODO move instance instead
  } ],
  // For each of your X-Men Heroes, rescue a Bystander.
  [ "Xavier's Nemesis", ev => {
    rescueEv(ev, youdHeroes().count("X-Men"));
  } ],
]),
makeMastermindCard("Red Skull", 7, 5, "HYDRA", ev => {
// Each player KOs a Hero from their hand.
  eachPlayer(p => selectCardEv(ev, p.hand.limit(isHero), sel => KOEv(ev, sel), p));
}, [
  // You get +4 Recruit.
  [ "Endless Resources", ev => addRecruitEvent(ev, 4) ],
  // Draw two cards. Then draw another card for each HYDRA Villain in your Victory Pile.
  [ "HYDRA Conspiracy", ev => drawEv(ev, 2 + playerState.victory.limit(isGroup("HYDRA"))) ],
  // You get +3 Attack.
  [ "Negablast Grenades", ev => addAttackEvent(ev, 3) ],
  // Look at the top three cards of your deck. KO one, discard one and put one back on top of your deck.
  [ "Ruthless Dictator", ev => {
    lookAtDeckEv(ev, 3, () => { selectCardEv(ev, playerState.revealed, sel => KOEv(ev, sel)); selectCardEv(ev, playerState.revealed, sel => discardEv(ev, sel)); });
  } ],
]),
]);
