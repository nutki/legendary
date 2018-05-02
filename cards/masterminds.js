addTemplates("MASTERMINDS", "Legendary", [
makeMastermindCard("Dr. Doom", 9, 5, "Doombot Legion", ev => {
// Each player with exactly 6 cards in hand reveals a [Tech] Hero or puts 2 cards from their hand on top of their deck.
}, [
  [ "Dark Technology", ev => {
  // You may recruit a [Tech] or [Ranged] Hero from the HQ for free.
  } ],
  [ "Monarch's Decree", ev => {
  // Choose one: each other player draws a card or each other player discards a card.
  } ],
  [ "Secrets of Time Travel", ev => {
  // Take another turn after this one.
  } ],
  [ "Treasures of Latveria", ev => {
  // When you draw a new hand of cards at the end of this turn, draw three extra cards.
  } ],
},
makeMastermindCard("Loki", 10, 5, "Enemies of Asgard", ev => {
// Each player reveals a [Strength] Hero or gains a Wound
}, [
  [ "Cruel Ruler", ev => {
  // Defeat a Villain in the City for free.
  } ],
  [ "Maniacal Tyrant", ev => {
  // KO up to four cards from your discard pile.
  } ],
  [ "Vanishing Illusions", ev => {
  // Each other player KOs a Villain from their Victory Pile.
  } ],
  [ "Whispers and Lies", ev => {
  // Each other player KOs two Bystanders from their Victory Pile.
  } ],
},
makeMastermindCard("Magneto", 8, 5, "Brotherhood", ev => {
// Each player reveals an X-Men Hero or discards down to four cards.
}, [
  [ "Bitter Captor", ev => {
  // Recruit an X-Men Hero from the HQ for free.
  } ],
  [ "Crushing Shockwave", ev => {
  // Each other player reveals an X-Men Hero or gains two Wounds.
  } ],
  [ "Electromagnetic Bubble", ev => {
  // Choose one of your X-Men Heroes. When you draw a new hand of cards at the end of this turn, add that Hero to your hand as a seventh card.
  } ],
  [ "Xavier's Nemesis", ev => {
  // For each of your X-Men Heroes, rescue a Bystander.
  } ],
},
makeMastermindCard("Red Skull", 7, 5, "HYDRA", ev => {
// Each player KOs a Hero from their hand.
}, [
  [ "Endless Resources", ev => {
  // You get +4 Recruit.
  } ],
  [ "HYDRA Conspiracy", ev => {
  // Draw two cards. Then draw another card for each HYDRA Villain in your Victory Pile.
  } ],
  [ "Negablast Grenades", ev => {
  // You get +3 Attack.
  } ],
  [ "Ruthless Dictator", ev => {
  // Look at the top three cards of your deck. KO one, discard one and put one back on top of your deck.
  } ],
},
]);
