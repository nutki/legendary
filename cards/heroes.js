/* global Color, u, turnState, playerState, gameState */
/* global isWound, handOrDiscard, CityCards, isMastermind, isVillain */

addTemplates("HEROES", "Legendary", [
{
  name: "Black Widow",
  team: "Avengers",
// ATTACK: 2
// {POWER Covert} You may KO a card from your hand or discard pile. If you do, rescue a Bystander.
// COST: 3
  c1: makeHeroCard("Black Widow", "Dangerous Rescue", 3, u, 2, Color.COVERT, "Avengers", "GD"),
// Draw a card.
// {POWER Tech} Rescue a Bystander.
// COST: 2
  c2: makeHeroCard("Black Widow", "Mission Accomplished", 2, u, u, Color.TECH, "Avengers", "GD"),
// ATTACK: 0+
// You get +1 Attack for each Bystander in your Victory pile.
// COST: 4
  uc: makeHeroCard("Black Widow", "Covert Operation", 4, u, 0, Color.COVERT, "Avengers", "G"),
// ATTACK: 4
// Defeat a Villain or Mastermind that has a Bystander.
// COST: 7
  ra: makeHeroCard("Black Widow", "Silent Sniper", 7, u, 4, Color.COVERT, "Avengers", "G"),
},
{
  name: "Captain America",
  team: "Avengers",
// RECRUIT: 0+
// You get +1 Recruit for each color of Hero you have.
// COST: 3
  c1: makeHeroCard("Captain America", "Avengers Assemble!", 3, 0, u, Color.INSTINCT, "Avengers", ""),
// ATTACK: 0+
// You get +1 Attack for each color of Hero you have.
// COST: 4
  c2: makeHeroCard("Captain America", "Perfect Teamwork", 4, u, 0, Color.STRENGTH, "Avengers", ""),
// ATTACK: 4
// If you would gain a Wound, you may reveal this card and draw a card instead.
// COST: 6
  uc: makeHeroCard("Captain America", "Diving Block", 6, u, 4, Color.TECH, "Avengers", ""),
// ATTACK: 3+
// {TEAMPOWER Avengers} You get +3 Attack for each other Avengers Hero you played this turn.
// COST: 7
  ra: makeHeroCard("Captain America", "A Day Unlike Any Other", 7, u, 3, Color.COVERT, "Avengers", ""),
},
{
  name: "Cyclops",
  team: "X-Men",
// RECRUIT: 3
// To play this card, you must discard a card from your hand.
// COST: 2
  c1: makeHeroCard("Cyclops", "Determination", 2, 3, u, Color.STRENGTH, "X-Men", "D"),
// ATTACK: 3
// To play this card, you must discard a card from your hand.
// COST: 3
  c2: makeHeroCard("Cyclops", "Optic Blast", 3, u, 3, Color.RANGED, "X-Men", ""),
// ATTACK: 4
// If a card effect makes you discard this card, you may return this card to your hand.
// COST: 6
  uc: makeHeroCard("Cyclops", "Unending Energy", 6, u, 4, Color.RANGED, "X-Men", ""),
// ATTACK: 6+
// {TEAMPOWER X-Men} You get +2 Attack for each other X-Men Hero you played this turn.
// COST: 8
  ra: makeHeroCard("Cyclops", "X-Men United", 8, u, 6, Color.RANGED, "X-Men", "D"),
},
{
  name: "Deadpool",
  team: "(Unaffiliated)",
// RECRUIT: 2
// A Villain of your choice captures a Bystander.
// COST: 3
// FLAVOR: "Hey, Abomination makes a pretty good babysitter."
  c1: makeHeroCard("Deadpool", "Here, Hold This for a Second", 3, 2, u, Color.TECH, u, "GFD"),
// ATTACK: 2+
// You get +1 Attack for each other Hero with an odd-numbered Cost you played this turn.
// COST: 5
  c2: makeHeroCard("Deadpool", "Oddball", 5, u, 2, Color.COVERT, u, "GD"),
// ATTACK: 2
// If this is the first Hero you played this turn, you may discard the rest of your hand and draw four cards.
// COST: 3
  uc: makeHeroCard("Deadpool", "Hey, Can I Get a Do-Over?", 3, u, 2, Color.INSTINCT, u, "GD"),
// ATTACK: 6
// You may gain a Wound to your hand. Then each player passes a card from their hand to the player on their left.
// COST: 7
  ra: makeHeroCard("Deadpool", "Random Acts of Unkindness", 7, u, 6, Color.INSTINCT, u, "G"),
},
{
  name: "Emma Frost",
  team: "X-Men",
// RECRUIT: 1
// Draw a card.
// COST: 3
// FLAVOR: A natural telepath, Emma knows what you're thinking before you do.
  c1: makeHeroCard("Emma Frost", "Mental Discipline", 3, 1, u, Color.RANGED, "X-Men", "F"),
// ATTACK: 2+
// {POWER Covert} You may play the top card of the Villain Deck. If you do, you get +2 Attack.
// COST: 4
// FLAVOR: Emma's days as a Villain are behind here...aren't they?
  c2: makeHeroCard("Emma Frost", "Shadowed Thoughts", 4, u, 2, Color.COVERT, "X-Men", "FD"),
// ATTACK: 3
// Each player may reveal another X-Men Hero. Each player who does draws a card.
// COST: 5
  uc: makeHeroCard("Emma Frost", "Psychic Link", 5, u, 3, Color.INSTINCT, "X-Men", ""),
// RECRUIT: 0+
// ATTACK: 5
// Whenever you defeat a Villain or Mastermind this turn, you get +3 Recruit.
// COST: 7
// FLAVOR: A secondary mutation allows Emma Frost to transform into pure diamond.
  ra: makeHeroCard("Emma Frost", "Diamond Form", 7, 0, 5, Color.STRENGTH, "X-Men", "F"),
},
{
  name: "Gambit",
  team: "X-Men",
// ATTACK: 2
// Reveal the top card of your deck. If it's an X-Men Hero, draw it.
// COST: 4
  c1: makeHeroCard("Gambit", "Card Shark", 4, u, 2, Color.RANGED, "X-Men", "D"),
// Draw two cards. Then put a card from your hand on top of your deck.
// COST: 2
  c2: makeHeroCard("Gambit", "Stack the Deck", 2, u, u, Color.COVERT, "X-Men", "D"),
// RECRUIT: 2
// Reveal the top card of your deck. Discard it or put it back.
// {POWER Instinct} Do the same thing to each other player's deck.
// COST: 3
  uc: makeHeroCard("Gambit", "Hypnotic Charm", 3, 2, u, Color.INSTINCT, "X-Men", "D"),
// ATTACK: 4+
// Reveal the top card of your deck. You get + Attack equal to that card's cost.
// COST: 7
  ra: makeHeroCard("Gambit", "High Stakes Jackpot", 7, u, 4, Color.INSTINCT, "X-Men", ""),
},
{
  name: "Hawkeye",
  team: "Avengers",
// ATTACK: 1
// Draw a card.
// COST: 3
// FLAVOR: Against robots, Hawkeye's first shot is a warning shot. In the face.
  c1: makeHeroCard("Hawkeye", "Quick Draw", 3, u, 1, Color.INSTINCT, "Avengers", "F"),
// ATTACK: 2+
// {TEAMPOWER Avengers} You get +1 Attack.
// COST: 4
// FLAVOR: "You line 'em up, and I'll knock 'em down..."
  c2: makeHeroCard("Hawkeye", "Team Player", 4, u, 2, Color.TECH, "Avengers", "FD"),
// ATTACK: 3
// {POWER Tech} Choose one: each other player draws a card or each other player discards a card.
// COST: 5
  uc: makeHeroCard("Hawkeye", "Covering Fire", 5, u, 3, Color.TECH, "Avengers", ""),
// ATTACK: 5
// Whenever you defeat a Villain or Mastermind this turn, rescue three Bystanders.
// COST: 7
  ra: makeHeroCard("Hawkeye", "Impossible Trick Shot", 7, u, 5, Color.TECH, "Avengers", ""),
},
{
  name: "Hulk",
  team: "Avengers",
// ATTACK: 2+
// {POWER Strength} You get +1 Attack.
// COST: 3
// FLAVOR: Don't make Hulk even mildly inconvenienced. You wouldn't like him when he's mildly inconvenienced...
  c1: makeHeroCard("Hulk", "Growing Anger", 3, u, 2, Color.STRENGTH, "Avengers", "FD"),
// ATTACK: 2+
// You may KO a Wound from your hand or discard pile. If you do, you get +2 Attack.
// COST: 4
  c2: makeHeroCard("Hulk", "Unstoppable Hulk", 4, u, 2, Color.INSTINCT, "Avengers", "D"),
// ATTACK: 4
// Each player gains a Wound.
// COST: 5
// FLAVOR: Hulk's rages tear everything apart: Enemies. Friends. Pants.
  uc: makeHeroCard("Hulk", "Crazed Rampage", 5, u, 4, Color.STRENGTH, "Avengers", "F"),
// ATTACK: 5+
// {POWER Strength} You get +5 Attack.
// COST: 8
// FLAVOR: "PUNY HUMANS! HULK IS THE STRONGEST ONE THERE IS!"
  ra: makeHeroCard("Hulk", "Hulk Smash!", 8, u, 5, Color.STRENGTH, "Avengers", "F"),
},
{
  name: "Iron Man",
  team: "Avengers",
// Draw a card.
// {POWER Tech} Draw another card.
// COST: 3
  c1: makeHeroCard("Iron Man", "Endless Invention", 3, u, u, Color.TECH, "Avengers", ""),
// ATTACK: 2+
// {POWER Ranged} You get +1 Attack.
// COST: 3
// FLAVOR: Repulsor ray technology has many peaceful applications. This is not one of them.
  c2: makeHeroCard("Iron Man", "Repulsor Rays", 3, u, 2, Color.RANGED, "Avengers", "FD"),
// ATTACK: 3+
// {POWER Tech} You get +1 Attack for each other [Tech] Hero you played this turn.
// COST: 5
  uc: makeHeroCard("Iron Man", "Arc Reactor", 5, u, 3, Color.TECH, "Avengers", ""),
// Draw two cards.
// {POWER Tech} Draw two more cards.
// COST: 7
  ra: makeHeroCard("Iron Man", "Quantum Breakthrough", 7, u, u, Color.TECH, "Avengers", ""),
},
{
  name: "Nick Fury",
  team: "S.H.I.E.L.D.",
// You may KO a S.H.I.E.L.D. Hero from your hand or discard pile. If you do, you may gain a S.H.I.E.L.D. Officer to your hand.
// COST: 4
  c1: makeHeroCard("Nick Fury", "Battlefield Promotion", 4, u, u, Color.COVERT, "S.H.I.E.L.D.", "G"),
// ATTACK: 2+
// {POWER Tech} You get +1 Attack.
// COST: 3
// FLAVOR: Fury always budgets one extra prototype for his personal collection.
  c2: makeHeroCard("Nick Fury", "High-Tech Weaponry", 3, u, 2, Color.TECH, "S.H.I.E.L.D.", "GFD"),
// ATTACK: 1+
// You get +1 Attack for each other S.H.I.E.L.D. Hero you played this turn.
// COST: 6
  uc: makeHeroCard("Nick Fury", "Legendary Commander", 6, u, 1, Color.STRENGTH, "S.H.I.E.L.D.", "G"),
// Defeat any Villain or Mastermind whose Attack is less than the number of S.H.I.E.L.D. Heroes in the KO pile.
// COST: 8
  ra: makeHeroCard("Nick Fury", "Pure Fury", 8, u, u, Color.TECH, "S.H.I.E.L.D.", "G"),
},
{
  name: "Rogue",
  team: "X-Men",
// ATTACK: 1+
// {POWER Strength} You get +3 Attack.
// COST: 4
// FLAVOR: When Rogue steals super strength, enemies get super scared.
  c1: makeHeroCard("Rogue", "Borrowed Brawn", 4, u, 1, Color.STRENGTH, "X-Men", "F"),
// RECRUIT: 2+
// {POWER Covert} You may KO a card from your hand or discard pile. If you do, you get +1 Recruit.
// COST: 3
  c2: makeHeroCard("Rogue", "Energy Drain", 3, 2, u, Color.COVERT, "X-Men", "D"),
// Play this card as a copy of another Hero you played this turn. This card is both [Covert] and the color you copy.
// COST: 5
  uc: makeHeroCard("Rogue", "Copy Powers", 5, u, u, Color.COVERT, "X-Men", ""),
// ATTACK: 4
// Each player discards the top card of their deck. Play a copy of each of those cards.
// COST: 8
  ra: makeHeroCard("Rogue", "Steal Abilities", 8, u, 4, Color.STRENGTH, "X-Men", ""),
},
{
  name: "Spider-Man",
  team: "Spider Friends",
// RECRUIT: 1
// Reveal the top card of your deck. If that card costs 2 or less, draw it.
// COST: 2
  c1: makeHeroCard("Spider-Man", "Astonishing Strength", 2, 1, u, Color.STRENGTH, "Spider Friends", "D", ev => drawIfEv(ev, c => c.cost <= 2)),
// ATTACK: 1
// Reveal the top card of your deck. If that card costs 2 or less, draw it.
// COST: 2
  c2: makeHeroCard("Spider-Man", "Great Responsibility", 2, u, 1, Color.INSTINCT, "Spider Friends", "D", ev => drawIfEv(ev, c => c.cost <= 2)),
// Rescue a Bystander.
// Reveal the top card of your deck. If that card costs 2 or less, draw it.
// COST: 2
  uc: makeHeroCard("Spider-Man", "Web-Shooters", 2, u, u, Color.TECH, "Spider Friends", "D", [ rescueEv, ev => drawIfEv(ev, c => c.cost <= 2) ]),
// Reveal the top three cards of your deck. Put any that cost 2 or less into your hand. Put the rest back in any order.
// COST: 2
  ra: makeHeroCard("Spider-Man", "The Amazing Spider-Man", 2, u, u, Color.COVERT, "Spider Friends", "D", ev => {
    lookAtDeckEv(ev, 3, () => playerState.revealed.filter(c => c.cost <= 2).map(c => moveCardEv(ev, c, playerState.hand)));
  }),
},
{
  name: "Storm",
  team: "X-Men",
// RECRUIT: 2
// {POWER Ranged} Draw a card.
// COST: 3
// FLAVOR: Two little raindrops. Then two billion.
  c1: makeHeroCard("Storm", "Gathering Stormclouds", 3, 2, u, Color.RANGED, "X-Men", "FD", ev => { if(superPower(Color.RANGED)) drawEv(ev); }),
// ATTACK: 2
// Any Villain you fight on the Rooftops this turn gets -2 Attack.
// COST: 4
  c2: makeHeroCard("Storm", "Lightning Bolt", 4, u, 2, Color.RANGED, "X-Men", "D", () => {
    addTurnMod("defense", c => isVillain(c) && c.location.id === "ROOFTOPS", -2);
  }),
// ATTACK: 4
// You may move a Villain to a new city space. Rescue any Bystanders captured by that Villain. (If you move a Villain to a city space that already has Villain, swap them.)
// COST: 6
  uc: makeHeroCard("Storm", "Spinning Cyclone", 6, u, 4, Color.COVERT, "X-Men", "", ev => {
    selectCardOptEv(ev, CityCards().filter(isVillain), ev => {
      let v = ev.selected;
      selectCardEv(ev, gameState.city.filter(l => l !== v.location), ev => {
        let dest = ev.selected;
        swapCardsEv(ev, v.location, dest);
        v.attachedCards('BYSTANDER').each(c => rescueEv(ev, c));
      });
    });
  }),
// ATTACK: 5
// Any Villain you fight on the Bridge this turn gets -2 Attack.
// {POWER Ranged} The Mastermind gets -2 Attack this turn.
// COST: 7
  ra: makeHeroCard("Storm", "Tidal Wave", 7, u, 5, Color.RANGED, "X-Men", "D", () => {
    addTurnMod("defense", c => isVillain(c) && c.location.id === "BRIDGE", -2);
    if (superPower(Color.RANGED)) addTurnMod("defense", isMastermind, -2);
  }),
},
{
  name: "Thor",
  team: "Avengers",
// RECRUIT: 2+
// {POWER Strength} You get +2 Recruit.
// COST: 3
// FLAVOR: "Whosoever holds the hammer, if he be worthy, shall possess the power of Thor."
  c1: makeHeroCard("Thor", "Odinson", 3, 2, u, Color.STRENGTH, "Avengers", "FD", ev => { if (superPower(Color.STRENGTH)) addRecruitEvent(ev, 2); }),
// RECRUIT: 2
// ATTACK: 0+
// If you made 8 or more Recruit this turn, you get +3 Attack.
// COST: 4
  c2: makeHeroCard("Thor", "Surge of Power", 4, 2, 0, Color.RANGED, "Avengers", "D", ev => { if (turnState.totalRecruit >= 8) addAttackEvent(ev, 3); }),
// ATTACK: 3+
// {POWER Ranged} You get +3 Attack.
// COST: 6
// FLAVOR: Lightning never strikes twice. Thor never needs to.
  uc: makeHeroCard("Thor", "Call Lightning", 6, u, 3, Color.RANGED, "Avengers", "F", ev => { if (superPower(Color.RANGED)) addAttackEvent(ev, 3); }),
// RECRUIT: 5
// ATTACK: 0+
// You can use Recruit as Attack this turn.
// COST: 8
// FLAVOR: They call him the God of Thunder. His enemies better start praying.
  ra: makeHeroCard("Thor", "God of Thunder", 8, 5, 0, Color.RANGED, "Avengers", "F", () => turnState.attackWithRecruit = true),
},
{
  name: "Wolverine",
  team: "X-Men",
// ATTACK: 2
// You may KO a Wound from your hand or discard pile. If you do, draw a card.
// COST: 3
  c1: makeHeroCard("Wolverine", "Healing Factor", 3, u, 2, Color.INSTINCT, "X-Men", "D",
    ev => selectCardOptEv(ev, handOrDiscard().filter(isWound), ev => { drawEv(ev); KOEv(ev, ev.selected); })
  ),
// ATTACK: 1
// {POWER Instinct} Draw a card.
// COST: 2
// FLAVOR: The only thing scarier than Wolverine tracking you is Wolverine finding you.
  c2: makeHeroCard("Wolverine", "Keen Senses", 2, u, 1, Color.INSTINCT, "X-Men", "FD", ev => { if (superPower(Color.INSTINCT)) drawEv(ev); }),
// ATTACK: 2
// {POWER Instinct} Draw two cards.
// COST: 5
// FLAVOR: Some villains get torn apart by guilt. Others get torn apart by Wolverine.
  uc: makeHeroCard("Wolverine", "Frenzied Slashing", 5, u, 2, Color.INSTINCT, "X-Men", "FD", ev => { if (superPower(Color.INSTINCT)) drawEv(ev, 2);}),
// ATTACK: 0+
// Draw three cards.
// {POWER Instinct} You get +1 Attack for each extra card you've drawn this turn.
// COST: 8
  ra: makeHeroCard("Wolverine", "Berserker Rage", 8, u, 0, Color.INSTINCT, "X-Men", "", ev => addAttackEvent(ev, turnState.cardsDrawn)),
},
]);
