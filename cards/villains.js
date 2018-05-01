addTemplates("VILLAINS", "Legendary", [
{ name: "Brotherhood", cards: [
// You can't defeat Blob unless you have an X-Men Hero.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Brotherhood", "Blob", 4, 2), {
  }],
// AMBUSH: Each player KOs two Heroes from their discard pile.
// ESCAPE: Each player KOs two Heroes from their hand.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Brotherhood", "Juggernaut", 6, 4), {
    ambush: ev => {},
    escape: ev => {},
  }],
// ESCAPE: Mystique becomes a Scheme Twist that takes effect immediately.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Brotherhood", "Mystique", 5, 3), {
    escape: ev => {},
  }],
// FIGHT: Each player reveals an X-Men Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Brotherhood", "Sabretooth", 5, 3), {
    fight: ev => {},
    escape: ev => {},
  }],
]},
{ name: "Enemies of Asgard", cards: [
// FIGHT: KO all your S.H.I.E.L.D. Heroes.
// ESCAPE: Each player KOs two of their Heroes.
// ATTACK: 7
// VP: 5
  [ 1, makeVillainCard("Enemies of Asgard", "Destroyer", 7, 5), {
    fight: ev => {},
    escape: ev => {},
  }],
// FIGHT: Draw three cards
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Enemies of Asgard", "Enchantress", 6, 4), {
    fight: ev => {},
  }],
// FIGHT: Each player reveals a [Ranged] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 4
// VP: 2
  [ 3, makeVillainCard("Enemies of Asgard", "Frost Giant", 4, 2), {
    fight: ev => {},
    escape: ev => {},
  }],
// AMBUSH: Each player reveals a [Ranged] Hero or gains a Wound.
// FIGHT: Choose a player. That player KOs any number of Wounds from their hand and discard pile.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Enemies of Asgard", "Ymir, Frost Giant King", 6, 4), {
    ambush: ev => {},
    fight: ev => {},
  }],
]},
{ name: "HYDRA", cards: [
// FIGHT: Play the top two cards of the Villain Deck.
// ATTACK: 4
// VP: 3
  [ 3, makeVillainCard("HYDRA", "Endless Armies of HYDRA", 4, 3), {
    fight: ev => {},
  }],
// FIGHT: You may gain a S.H.I.E.L.D. Officer.
// ATTACK: 3
// VP: 1
  [ 3, makeVillainCard("HYDRA", "HYDRA Kidnappers", 3, 1), {
    fight: ev => {},
  }],
// Supreme HYDRA is worth +3 VP for each other HYDRA Villain in your Victory Pile.
// ATTACK: 6
// VP: 3*
  [ 1, makeVillainCard("HYDRA", "Supreme HYDRA", 6, 3), {
  }],
// FIGHT: Each player without another HYDRA Villain in their Victory Pile gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 1, makeVillainCard("HYDRA", "Viper", 5, 3), {
    fight: ev => {},
    escape: ev => {},
  }],
]},
{ name: "Masters of Evil", cards: [
// FIGHT: For each of your Avengers Heroes, rescue a Bystander.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Masters of Evil", "Baron Zemo", 6, 4), {
    fight: ev => {},
  }],
// FIGHT: Each player reveals the top card of their deck. For each card, you choose to KO it or put it back.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Masters of Evil", "Melter", 5, 3), {
    fight: ev => {},
  }],
// Ultron is worth +1 VP for each [Tech] Hero you have among all your cards at the end of the game.
// ESCAPE: Each player reveals a [Tech] Hero or gains a Wound.
// ATTACK: 6
// VP: 2+
  [ 2, makeVillainCard("Masters of Evil", "Ultron", 6, 2), {
    escape: ev => {},
  }],
// FIGHT: If you fight Whirlwind on the Rooftops or Bridge, KO two of your Heroes.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Masters of Evil", "Whirlwind", 4, 2), {
    fight: ev => {},
  }],
]},
{ name: "Radiation", cards: [
// FIGHT: If you fight Abomination on the Streets or Bridge, rescue three Bystanders.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Radiation", "Abomination", 5, 3), {
    fight: ev => {},
  }],
// AMBUSH: Play the top card of the Villain Deck.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Radiation", "The Leader", 4, 2), {
    ambush: ev => {},
  }],
// FIGHT: For each of your [Strength] Heroes, KO one of your Heroes.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Radiation", "Maestro", 6, 4), {
    fight: ev => {},
  }],
// FIGHT: Each player reveals a [Strength] Hero or gains a Wound.
// ESCAPE: Same effect.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Radiation", "Zzzax", 5, 3), {
    fight: ev => {},
    escape: ev => {},
  }],
]},
{ name: "Skrulls", cards: [
// FIGHT: Choose a Hero in the HQ for each player. Each player gains that Hero.
// ATTACK: 8
// VP: 3
  [ 1, makeVillainCard("Skrulls", "Paibok the Power Skrull", 8, 3), {
    fight: ev => {},
  }],
// AMBUSH: Put the highest-cost Hero from the HQ under this Villain. This Villain's Attack is equal to that Hero's Cost.
// FIGHT: Gain that Hero.
// ATTACK: *
// VP: 4
  [ 1, makeVillainCard("Skrulls", "Skrull Queen Veranke", 0, 4), {
    ambush: ev => {},
    fight: ev => {},
  }],
// AMBUSH: Put the rightmost Hero from the HQ under this Villain. This Villain's Attack is equal to that Hero's Cost.
// FIGHT: Gain that Hero
// ATTACK: *
// VP: 2
  [ 3, makeVillainCard("Skrulls", "Skrull Shapeshifters", 0, 2), {
    ambush: ev => {},
    fight: ev => {},
  }],
// FIGHT: Each player KOs one of their Heroes.
// ATTACK: 4
// VP: 2
  [ 3, makeVillainCard("Skrulls", "Super-Skrull", 4, 2), {
    fight: ev => {},
  }],
]},
{ name: "Spider-Foes", cards: [
// FIGHT: When you draw a new hand of cards at the end of this turn, draw eight cards instead of six.
// ATTACK: 4
// VP: 2
  [ 2, makeVillainCard("Spider-Foes", "Doctor Octopus", 4, 2), {
    fight: ev => {},
  }],
// AMBUSH: Green Goblin captures a Bystander.
// ATTACK: 6
// VP: 4
  [ 2, makeVillainCard("Spider-Foes", "Green Goblin", 6, 4), {
    ambush: ev => {},
  }],
// FIGHT: If you fight the Lizard in the Sewers, each other player gains a Wound.
// ATTACK: 3
// VP: 2
  [ 2, makeVillainCard("Spider-Foes", "The Lizard", 3, 2), {
    fight: ev => {},
  }],
// You can't defeat Venom unless you have a [Covert] Hero.
// ESCAPE: Each player gains a Wound.
// ATTACK: 5
// VP: 3
  [ 2, makeVillainCard("Spider-Foes", "Venom", 5, 3), {
    escape: ev => {},
  }],
]},
]);
