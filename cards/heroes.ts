"use strict";
addHeroTemplates("Legendary", [
{
  name: "Black Widow",
  team: "Avengers",
// ATTACK: 2
// {POWER Covert} You may KO a card from your hand or discard pile. If you do, rescue a Bystander.
// COST: 3
  c1: makeHeroCard("Black Widow", "Dangerous Rescue", 3, u, 2, Color.COVERT, "Avengers", "GD", ev => { if (superPower(Color.COVERT)) KOHandOrDiscardEv(ev, undefined, () => rescueEv(ev)); }),
// Draw a card.
// {POWER Tech} Rescue a Bystander.
// COST: 2
  c2: makeHeroCard("Black Widow", "Mission Accomplished", 2, u, u, Color.TECH, "Avengers", "GD", [ ev => drawEv(ev, 1), ev => { if (superPower(Color.TECH)) rescueEv(ev); } ]),
// ATTACK: 0+
// You get +1 Attack for each Bystander in your Victory pile.
// COST: 4
  uc: makeHeroCard("Black Widow", "Covert Operation", 4, u, 0, Color.COVERT, "Avengers", "G", ev => addAttackEvent(ev, playerState.victory.count(isBystander))),
// ATTACK: 4
// Defeat a Villain or Mastermind that has a Bystander.
// COST: 7
  ra: makeHeroCard("Black Widow", "Silent Sniper", 7, u, 4, Color.COVERT, "Avengers", "G", ev => selectCardEv(ev, "Defeat an enemey", villainOrMastermind().limit(hasBystander), sel => defeatEv(ev, sel))),
},
{
  name: "Captain America",
  team: "Avengers",
// RECRUIT: 0+
// You get +1 Recruit for each color of Hero you have.
// COST: 3
  c1: makeHeroCard("Captain America", "Avengers Assemble!", 3, 0, u, Color.INSTINCT, "Avengers", "", ev => addRecruitEvent(ev, numColors())),
// ATTACK: 0+
// You get +1 Attack for each color of Hero you have.
// COST: 4
  c2: makeHeroCard("Captain America", "Perfect Teamwork", 4, u, 0, Color.STRENGTH, "Avengers", "", ev => addAttackEvent(ev, numColors())),
// ATTACK: 4
// If you would gain a Wound, you may reveal this card and draw a card instead.
// COST: 6
  uc: makeHeroCard("Captain America", "Diving Block", 6, u, 4, Color.TECH, "Avengers", "", [], { trigger: {
    event: "GAIN",
    match: (ev, source) => isWound(ev.what) && owner(source) === ev.who,
    replace: ev => selectCardOptEv(ev, "Reveal a card", [ ev.source ], () => drawEv(ev, 1, owner(ev.source)), () => doReplacing(ev), owner(ev.source))
  }}),
// ATTACK: 3+
// {TEAMPOWER Avengers} You get +3 Attack for each other Avengers Hero you played this turn.
// COST: 7
  ra: makeHeroCard("Captain America", "A Day Unlike Any Other", 7, u, 3, Color.COVERT, "Avengers", "", ev => addAttackEvent(ev, 3 * superPower("Avengers"))),
},
{
  name: "Cyclops",
  team: "X-Men",
// RECRUIT: 3
// To play this card, you must discard a card from your hand.
// COST: 2
  c1: makeHeroCard("Cyclops", "Determination", 2, 3, u, Color.STRENGTH, "X-Men", "D", [], { playCost: 1, playCostType: "DISCARD" }),
// ATTACK: 3
// To play this card, you must discard a card from your hand.
// COST: 3
  c2: makeHeroCard("Cyclops", "Optic Blast", 3, u, 3, Color.RANGED, "X-Men", "", [], { playCost: 1, playCostType: "DISCARD" }),
// ATTACK: 4
// If a card effect makes you discard this card, you may return this card to your hand.
// COST: 6
  uc: makeHeroCard("Cyclops", "Unending Energy", 6, u, 4, Color.RANGED, "X-Men", "", [], { trigger: {
    event: "DISCARD",
    match: (ev, source) => ev.what === source && ev.parent.getSource() instanceof Card,
    after: ev => {
      const who = owner(ev.source);
      chooseMayEv(ev, "Return to hand", () => moveCardEv(ev, ev.source, who.hand), who);
    }
  }}),
// ATTACK: 6+
// {TEAMPOWER X-Men} You get +2 Attack for each other X-Men Hero you played this turn.
// COST: 8
  ra: makeHeroCard("Cyclops", "X-Men United", 8, u, 6, Color.RANGED, "X-Men", "D", ev => addAttackEvent(ev, 2 * superPower("X-Men"))),
},
{
  name: "Deadpool",
  team: "(Unaffiliated)",
// RECRUIT: 2
// A Villain of your choice captures a Bystander.
// COST: 3
// FLAVOR: "Hey, Abomination makes a pretty good babysitter."
  c1: makeHeroCard("Deadpool", "Here, Hold This for a Second", 3, 2, u, Color.TECH, u, "GFD", ev => selectCardEv(ev, "Choose a Villain", villains(), sel => captureEv(ev, sel))),
// ATTACK: 2+
// You get +1 Attack for each other Hero with an odd-numbered Cost you played this turn.
// COST: 5
  c2: makeHeroCard("Deadpool", "Oddball", 5, u, 2, Color.COVERT, u, "GD", ev => addAttackEvent(ev, turnState.cardsPlayed.count(isCostOdd))),
// ATTACK: 2
// If this is the first Hero you played this turn, you may discard the rest of your hand and draw four cards.
// COST: 3
  uc: makeHeroCard("Deadpool", "Hey, Can I Get a Do-Over?", 3, u, 2, Color.INSTINCT, u, "GD", ev => { if (turnState.cardsPlayed.length === 0) chooseMayEv(
    ev, "Discard hand", () => { discardHandEv(ev); drawEv(ev, 4); }
  ); }),
// ATTACK: 6
// You may gain a Wound to your hand. Then each player passes a card from their hand to the player on their left.
// COST: 7
  ra: makeHeroCard("Deadpool", "Random Acts of Unkindness", 7, u, 6, Color.INSTINCT, u, "G", [
  ev => chooseMayEv(ev, "Gain a Wound", () => gainWoundToHandEv(ev)),
  ev => {
    let selected: {player: Player, card: Card}[] = [];
    eachPlayer(p => selectCardEv(ev, "Select a card to pass", p.hand.deck, sel => selected.push({ player: p, card: sel }), p));
    cont(ev, () => selected.forEach(i => moveCardEv(ev, i.card, i.player.left.hand)));
  }]),
},
{
  name: "Emma Frost",
  team: "X-Men",
// RECRUIT: 1
// Draw a card.
// COST: 3
// FLAVOR: A natural telepath, Emma knows what you're thinking before you do.
  c1: makeHeroCard("Emma Frost", "Mental Discipline", 3, 1, u, Color.RANGED, "X-Men", "F", ev => drawEv(ev, 1)),
// ATTACK: 2+
// {POWER Covert} You may play the top card of the Villain Deck. If you do, you get +2 Attack.
// COST: 4
// FLAVOR: Emma's days as a Villain are behind here...aren't they?
  c2: makeHeroCard("Emma Frost", "Shadowed Thoughts", 4, u, 2, Color.COVERT, "X-Men", "FD", ev => { if (superPower(Color.COVERT)) chooseMayEv(ev,
  "Play top card of the Villain Deck", () => { villainDrawEv(ev); addAttackEvent(ev, 2); }
  );}),
// ATTACK: 3
// Each player may reveal another X-Men Hero. Each player who does draws a card.
// COST: 5
  uc: makeHeroCard("Emma Frost", "Psychic Link", 5, u, 3, Color.INSTINCT, "X-Men", "", ev => eachPlayer(p => {
    revealAndEv(ev, c => isTeam("X-Men")(c) && c !== ev.getSource(), () => drawEv(ev, 1, p), p);
  })),
// RECRUIT: 0+
// ATTACK: 5
// Whenever you defeat a Villain or Mastermind this turn, you get +3 Recruit.
// COST: 7
// FLAVOR: A secondary mutation allows Emma Frost to transform into pure diamond.
  ra: makeHeroCard("Emma Frost", "Diamond Form", 7, 0, 5, Color.STRENGTH, "X-Men", "F", ev => addTurnTrigger("DEFEAT", undefined, () => addRecruitEvent(ev, 3))),
},
{
  name: "Gambit",
  team: "X-Men",
// ATTACK: 2
// Reveal the top card of your deck. If it's an X-Men Hero, draw it.
// COST: 4
  c1: makeHeroCard("Gambit", "Card Shark", 4, u, 2, Color.RANGED, "X-Men", "D", ev => drawIfEv(ev, isTeam("X-Men"))),
// Draw two cards. Then put a card from your hand on top of your deck.
// COST: 2
  c2: makeHeroCard("Gambit", "Stack the Deck", 2, u, u, Color.COVERT, "X-Men", "D", [ ev => drawEv(ev, 2), ev => pickTopDeckEv(ev) ]),
// RECRUIT: 2
// Reveal the top card of your deck. Discard it or put it back.
// {POWER Instinct} Do the same thing to each other player's deck.
// COST: 3
  uc: makeHeroCard("Gambit", "Hypnotic Charm", 3, 2, u, Color.INSTINCT, "X-Men", "D", ev => eachPlayer(p => {
    if (p === playerState || superPower(Color.INSTINCT)) lookAtDeckEv(ev, 1, () => {
      selectCardOptEv(ev, "Select a card to discard", p.revealed.deck, sel => discardEv(ev, sel));
    }, p, playerState);
  })),
// ATTACK: 4+
// Reveal the top card of your deck. You get + Attack equal to that card's cost.
// COST: 7
  ra: makeHeroCard("Gambit", "High Stakes Jackpot", 7, u, 4, Color.INSTINCT, "X-Men", "",
    ev => lookAtDeckEv(ev, 1, () => playerState.revealed.withLast(c => addAttackEvent(ev, c.cost)))
  ),
},
{
  name: "Hawkeye",
  team: "Avengers",
// ATTACK: 1
// Draw a card.
// COST: 3
// FLAVOR: Against robots, Hawkeye's first shot is a warning shot. In the face.
  c1: makeHeroCard("Hawkeye", "Quick Draw", 3, u, 1, Color.INSTINCT, "Avengers", "F", ev => drawEv(ev, 1)),
// ATTACK: 2+
// {TEAMPOWER Avengers} You get +1 Attack.
// COST: 4
// FLAVOR: "You line 'em up, and I'll knock 'em down..."
  c2: makeHeroCard("Hawkeye", "Team Player", 4, u, 2, Color.TECH, "Avengers", "FD", ev => { if (superPower("Avengers")) addAttackEvent(ev, 1); }),
// ATTACK: 3
// {POWER Tech} Choose one: each other player draws a card or each other player discards a card.
// COST: 5
  uc: makeHeroCard("Hawkeye", "Covering Fire", 5, u, 3, Color.TECH, "Avengers", "", ev => { if (superPower(Color.TECH)) chooseOneEv(ev, "Each other player",
    ["draws a card", () => eachOtherPlayer(p => drawEv(ev, 1, p))],
    ["discards a card", () => eachOtherPlayer(p => pickDiscardEv(ev, p))]
  );}),
// ATTACK: 5
// Whenever you defeat a Villain or Mastermind this turn, rescue three Bystanders.
// COST: 7
  ra: makeHeroCard("Hawkeye", "Impossible Trick Shot", 7, u, 5, Color.TECH, "Avengers", "", ev => addTurnTrigger("DEFEAT", undefined, () => rescueEv(ev, 3))),
},
{
  name: "Hulk",
  team: "Avengers",
// ATTACK: 2+
// {POWER Strength} You get +1 Attack.
// COST: 3
// FLAVOR: Don't make Hulk even mildly inconvenienced. You wouldn't like him when he's mildly inconvenienced...
  c1: makeHeroCard("Hulk", "Growing Anger", 3, u, 2, Color.STRENGTH, "Avengers", "FD", ev => { if (superPower(Color.STRENGTH)) addAttackEvent(ev, 1); }),
// ATTACK: 2+
// You may KO a Wound from your hand or discard pile. If you do, you get +2 Attack.
// COST: 4
  c2: makeHeroCard("Hulk", "Unstoppable Hulk", 4, u, 2, Color.INSTINCT, "Avengers", "D", ev => KOHandOrDiscardEv(ev, isWound, () => addAttackEvent(ev, 2))),
// ATTACK: 4
// Each player gains a Wound.
// COST: 5
// FLAVOR: Hulk's rages tear everything apart: Enemies. Friends. Pants.
  uc: makeHeroCard("Hulk", "Crazed Rampage", 5, u, 4, Color.STRENGTH, "Avengers", "F", ev => eachPlayer(p => gainWoundEv(ev, p))),
// ATTACK: 5+
// {POWER Strength} You get +5 Attack.
// COST: 8
// FLAVOR: "PUNY HUMANS! HULK IS THE STRONGEST ONE THERE IS!"
  ra: makeHeroCard("Hulk", "Hulk Smash!", 8, u, 5, Color.STRENGTH, "Avengers", "F", ev => { if (superPower(Color.STRENGTH)) addAttackEvent(ev, 5); }),
},
{
  name: "Iron Man",
  team: "Avengers",
// Draw a card.
// {POWER Tech} Draw another card.
// COST: 3
  c1: makeHeroCard("Iron Man", "Endless Invention", 3, u, u, Color.TECH, "Avengers", "", [ ev => drawEv(ev, 1), ev => { if (superPower(Color.TECH)) drawEv(ev, 1); } ]),
// ATTACK: 2+
// {POWER Ranged} You get +1 Attack.
// COST: 3
// FLAVOR: Repulsor ray technology has many peaceful applications. This is not one of them.
  c2: makeHeroCard("Iron Man", "Repulsor Rays", 3, u, 2, Color.RANGED, "Avengers", "FD", ev => { if (superPower(Color.RANGED)) addAttackEvent(ev, 1); }),
// ATTACK: 3+
// {POWER Tech} You get +1 Attack for each other [Tech] Hero you played this turn.
// COST: 5
  uc: makeHeroCard("Iron Man", "Arc Reactor", 5, u, 3, Color.TECH, "Avengers", "", ev => addAttackEvent(ev, superPower(Color.TECH))),
// Draw two cards.
// {POWER Tech} Draw two more cards.
// COST: 7
  ra: makeHeroCard("Iron Man", "Quantum Breakthrough", 7, u, u, Color.TECH, "Avengers", "", [ ev => drawEv(ev, 2), ev => { if (superPower(Color.TECH)) drawEv(ev, 2); } ]),
},
{
  name: "Nick Fury",
  team: "S.H.I.E.L.D.",
// You may KO a S.H.I.E.L.D. Hero from your hand or discard pile. If you do, you may gain a S.H.I.E.L.D. Officer to your hand.
// COST: 4
  c1: makeHeroCard("Nick Fury", "Battlefield Promotion", 4, u, u, Color.COVERT, "S.H.I.E.L.D.", "G", ev => KOHandOrDiscardEv(ev, "S.H.I.E.L.D.", () => gameState.officer.withTop(c => gainToHandEv(ev, c)))),
// ATTACK: 2+
// {POWER Tech} You get +1 Attack.
// COST: 3
// FLAVOR: Fury always budgets one extra prototype for his personal collection.
  c2: makeHeroCard("Nick Fury", "High-Tech Weaponry", 3, u, 2, Color.TECH, "S.H.I.E.L.D.", "GFD", ev => { if (superPower(Color.TECH)) addAttackEvent(ev, 1); }),
// ATTACK: 1+
// You get +1 Attack for each other S.H.I.E.L.D. Hero you played this turn.
// COST: 6
  uc: makeHeroCard("Nick Fury", "Legendary Commander", 6, u, 1, Color.STRENGTH, "S.H.I.E.L.D.", "G", ev => addAttackEvent(ev, superPower("S.H.I.E.L.D."))),
// Defeat any Villain or Mastermind whose Attack is less than the number of S.H.I.E.L.D. Heroes in the KO pile.
// COST: 8
  ra: makeHeroCard("Nick Fury", "Pure Fury", 8, u, u, Color.TECH, "S.H.I.E.L.D.", "G", ev => selectCardEv(ev, "Defeat a Villain", villainOrMastermind().limit(v => v.defense < gameState.ko.count("S.H.I.E.L.D.")), sel => defeatEv(ev, sel))),
},
{
  name: "Rogue",
  team: "X-Men",
// ATTACK: 1+
// {POWER Strength} You get +3 Attack.
// COST: 4
// FLAVOR: When Rogue steals super strength, enemies get super scared.
  c1: makeHeroCard("Rogue", "Borrowed Brawn", 4, u, 1, Color.STRENGTH, "X-Men", "F", ev => { if(superPower(Color.STRENGTH)) addAttackEvent(ev, 3); }),
// RECRUIT: 2+
// {POWER Covert} You may KO a card from your hand or discard pile. If you do, you get +1 Recruit.
// COST: 3
  c2: makeHeroCard("Rogue", "Energy Drain", 3, 2, u, Color.COVERT, "X-Men", "D", ev => { if(superPower(Color.COVERT)) KOHandOrDiscardEv(ev, undefined, () => addRecruitEvent(ev, 1)); }),
// Play this card as a copy of another Hero you played this turn. This card is both [Covert] and the color you copy.
// COST: 5
  uc: makeHeroCard("Rogue", "Copy Powers", 5, u, u, Color.COVERT, "X-Men", "", [], { copyPasteCard: true }),
// ATTACK: 4
// Each player discards the top card of their deck. Play a copy of each of those cards.
// COST: 8
  ra: makeHeroCard("Rogue", "Steal Abilities", 8, u, 4, Color.STRENGTH, "X-Men", "", ev => {
    let revealed: Card[] = [];
    eachPlayer(p => lookAtDeckEv(ev, 1, () => { revealed.push(p.revealed.top); discardEv(ev, p.revealed.top); }));
    let playOne = () => selectCardEv(ev, "Choose a card to copy", revealed, sel => {
      playCopyEv(ev, sel);
      revealed = revealed.limit(c => c !== sel);
      if (revealed.length > 0) cont(ev, playOne);
    });
    cont(ev, playOne);
  }),
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
    lookAtDeckEv(ev, 3, () => playerState.revealed.limit(c => c.cost <= 2).map(c => moveCardEv(ev, c, playerState.hand)));
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
    addTurnMod("defense", c => isVillain(c) && atLocation(c, "ROOFTOPS"), -2);
  }),
// ATTACK: 4
// You may move a Villain to a new city space. Rescue any Bystanders captured by that Villain. (If you move a Villain to a city space that already has Villain, swap them.)
// COST: 6
  uc: makeHeroCard("Storm", "Spinning Cyclone", 6, u, 4, Color.COVERT, "X-Men", "", ev => {
    selectCardOptEv(ev, "Choose a Villain to move", CityCards().limit(isVillain), v => {
      selectCardEv(ev, "Choose a new city space", gameState.city.limit(l => l !== v.location), dest => {
        swapCardsEv(ev, v.location, dest);
        v.captured.limit(isBystander).each(c => rescueEv(ev, c));
      });
    });
  }),
// ATTACK: 5
// Any Villain you fight on the Bridge this turn gets -2 Attack.
// {POWER Ranged} The Mastermind gets -2 Attack this turn.
// COST: 7
  ra: makeHeroCard("Storm", "Tidal Wave", 7, u, 5, Color.RANGED, "X-Men", "D", () => {
    addTurnMod("defense", c => isVillain(c) && atLocation(c, "BRIDGE"), -2);
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
  c1: makeHeroCard("Wolverine", "Healing Factor", 3, u, 2, Color.INSTINCT, "X-Men", "D", ev => KOHandOrDiscardEv(ev, isWound, () => drawEv(ev))),
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
  ra: makeHeroCard("Wolverine", "Berserker Rage", 8, u, 0, Color.INSTINCT, "X-Men", "", [ ev => drawEv(ev, 3), ev => addAttackEvent(ev, turnState.cardsDrawn) ]),
},
]);
addHeroTemplates("Dark City", [
{
  name: "Angel",
  team: "X-Men",
// RECRUIT: 2
// When a card effect causes you to discard this card, rescue a Bystander and draw two cards.
// COST: 4
  c1: makeHeroCard("Angel", "Diving Catch", 4, 2, u, Color.STRENGTH, "X-Men", "D", [], { trigger: {
    event: "DISCARD",
    match: (ev, source) => ev.what === source && ev.parent.getSource() instanceof Card,
    after: ev => { rescueByEv(ev, owner(ev.source)); drawEv(ev, 2, owner(ev.source)); }
  }}),
// Draw two cards, then discard a card.
// COST: 3
  c2: makeHeroCard("Angel", "High-Speed Chase", 3, u, u, Color.COVERT, "X-Men", "", [ ev => drawEv(ev, 2), ev => pickDiscardEv(ev) ]),
// ATTACK: 2+
// You may discard a card. You get + Attack equal to that card's Cost.
// COST: 5
  uc: makeHeroCard("Angel", "Drop Off a Friend", 5, u, 2, Color.INSTINCT, "X-Men", "D", ev => selectCardOptEv(ev, "Discard to gain Attack", playerState.hand.deck, c => { discardEv(ev, c); addAttackEvent(ev, c.cost); })),
// ATTACK: 4
// Discard any number of cards. Draw that many cards.
// COST: 7
  ra: makeHeroCard("Angel", "Strength of Spirit", 7, u, 4, Color.STRENGTH, "X-Men", "", ev => {
    let count = 0;
    selectObjectsAnyEv(ev, "Discard cards", playerState.hand.deck, c => { count++; discardEv(ev, c); });
    cont(ev, () => drawEv(ev, count));
  }),
},
{
  name: "Bishop",
  team: "X-Men",
// RECRUIT: 0+
// ATTACK: 2
// Whenever a card you own is KO'd this turn, you get +2 Recruit.
// COST: 3
  c1: makeHeroCard("Bishop", "Absorb Energies", 3, 0, 2, Color.COVERT, "X-Men", "D", ev => {
    addTurnTrigger("KO", (ev) => owner(ev.what) === playerState, ev => addRecruitEvent(ev, 2));
  }),
// Draw a card.
// {POWER Covert} You may KO a card from your hand or discard pile.
// COST: 2
// GUN: 1
  c2: makeHeroCard("Bishop", "Whatever the Cost", 2, u, u, Color.RANGED, "X-Men", "GD", [ ev => drawEv(ev, 1), ev => { if (superPower(Color.COVERT)) KOHandOrDiscardEv(ev); } ]),
// ATTACK: 3+
// {POWER Ranged Ranged} You get +3 Attack.
// COST: 5
// FLAVOR: Bishop absorbs energy, channeling it back into devastating blasts.
  uc: makeHeroCard("Bishop", "Concussive Blast", 5, u, 3, Color.RANGED, "X-Men", "F", ev => { if (superPower(Color.RANGED, Color.RANGED)) addAttackEvent(ev, 3); }),
// ATTACK: 4+
// Discard the top four cards of your deck. You get + Attack equal to those cards' printed Attack.
// {TEAMPOWER X-Men} KO any number of those cards.
// COST: 7
// GUN: 1
  ra: makeHeroCard("Bishop", "Firepower From the Future", 7, u, 4, Color.TECH, "X-Men", "G", ev => {
    lookAtDeckEv(ev, 4, () => {
      addAttackEvent(ev, playerState.revealed.deck.sum(c => c.printedAttack || 0));
      if (superPower("X-Men")) selectObjectsAnyEv(ev, "KO cards", playerState.revealed.deck, c => KOEv(ev, c));
      cont(ev, () => playerState.revealed.deck.each(c => discardEv(ev, c)));
    });
  }),
},
{
  name: "Blade",
  team: "Marvel Knights",
// RECRUIT: 0+
// ATTACK: 2
// Whenever you defeat a Villain in the Sewers or Rooftops this turn, you get +2 Recruit.
// COST: 4
  c1: makeHeroCard("Blade", "Night Hunter", 4, 0, 2, Color.STRENGTH, "Marvel Knights", "GD", ev => addTurnTrigger("DEFEAT", ev => isLocation(ev.where, "SEWERS", "ROOFTOPS"), ev => addRecruitEvent(ev, 2))),
// ATTACK: 2
// You may move a Villain to an adjacent city space. If another Villain is already there, swap them.
// COST: 3
  c2: makeHeroCard("Blade", "Stalk the Prey", 3, u, 2, Color.COVERT, "Marvel Knights", "GD", ev => {
    selectCardOptEv(ev, "Choose a Villain to move", CityCards().limit(isVillain), v => {
      selectCardEv(ev, "Choose a new city space", cityAdjecent(v.location), dest => swapCardsEv(ev, v.location, dest));
    });
  }),
// ATTACK: 3
// Whenever you defeat a Villain in the Sewers or Rooftops this turn, draw two cards.
// COST: 6
  uc: makeHeroCard("Blade", "Nowhere to Hide", 6, u, 3, Color.TECH, "Marvel Knights", "G", ev => addTurnTrigger("DEFEAT", ev => isLocation(ev.where, "SEWERS", "ROOFTOPS"), ev => drawEv(ev, 2))),
// ATTACK: 0+
// You get +1 Attack for each Villain in your Victory Pile.
// COST: 7
  ra: makeHeroCard("Blade", "Vampiric Surge", 7, u, 0, Color.INSTINCT, "Marvel Knights", "G", ev => addAttackEvent(ev, playerState.victory.count(isVillain))),
},
{
  name: "Cable",
  team: "X-Force",
// RECRUIT: 2
// When a Master Strike is played, before it takes effect, you may discard this card. If you do, draw three extra cards at the end of this turn.
// COST: 3
  c1: makeHeroCard("Cable", "Disaster Survivalist", 3, 2, u, Color.TECH, "X-Force", "D", [], { trigger: {
    event: "STRIKE",
    match: (ev, source: Card) => source.location === owner(source).hand,
    before: ev => chooseMayEv(ev, "Discard to draw three extra cards", () => { discardEv(ev, ev.source); addTurnTrigger("CLEANUP", undefined, tev => drawEv(tev, 3, owner(ev.source))); }, owner(ev.source))
  }}),
// ATTACK: 2+
// You get +2 Attack only when fighting Masterminds.
// COST: 4
// GUN: 1
  c2: makeHeroCard("Cable", "Strike at the Heart of Evil", 4, u, 2, Color.RANGED, "X-Force", "GD", ev => addAttackSpecialEv(ev, isMastermind, 2)),
// ATTACK: 3+
// <b>Teleport</b>
// {TEAMPOWER X-Force} You get +1 Attack for each other X-Force Hero you played this turn.
// COST: 6
// GUN: 1
  uc: makeHeroCard("Cable", "Rapid Response Force", 6, u, 3, Color.COVERT, "X-Force", "G", ev => addAttackEvent(ev, superPower("X-Force")), { teleport: true }),
// ATTACK: 5+
// KO any number of cards from your hand. You get +1 Attack for each card KO'd this way.
// COST: 8
// GUN: 1
  ra: makeHeroCard("Cable", "Army of One", 8, u, 5, Color.TECH, "X-Force", "G", ev => selectObjectsAnyEv(ev, "KO cards", playerState.hand.deck, c => { KOEv(ev, c); addAttackEvent(ev, 1); })),
},
{
  name: "Colossus",
  team: "X-Force",
// ATTACK: 3
// You gain a Wound.
// COST: 1
// FLAVOR: When enemies get charged by a huge steel titan, that tends to occupy their attention.
  c1: makeHeroCard("Colossus", "Draw Their Fire", 1, u, 3, Color.STRENGTH, "X-Force", "F", ev => gainWoundEv(ev)),
// RECRUIT: 2
// If you would gain a Wound, you may discard this card instead. If you do, draw two cards.
// COST: 3
  c2: makeHeroCard("Colossus", "Invulnerability", 3, 2, u, Color.STRENGTH, "X-Force", "D", [], { trigger: {
    event: "GAIN",
    match: (ev, source: Card) => isWound(ev.what) && ev.who === owner(source) && source.location === ev.who.hand,
    replace: ev => selectCardOptEv(ev, "Discard to draw 2 cards", [ev.source], () => {
      discardEv(ev, ev.source); drawEv(ev, 2, owner(ev.source));
    }, () => doReplacing(ev), owner(ev.source))
  }}),
// ATTACK: 4+
// {POWER Strength} You get +2 Attack.
// COST: 6
// FLAVOR: No one expects an enormous metal brawler to take the stealthy approach.
  uc: makeHeroCard("Colossus", "Silent Statue", 6, u, 4, Color.COVERT, "X-Force", "FD", ev => { if (superPower(Color.STRENGTH)) addAttackEvent(ev, 2); }),
// ATTACK: 6
// If another player would gain a Wound, you may reveal this card to gain that Wound and draw a card.
// COST: 8
  ra: makeHeroCard("Colossus", "Russian Heavy Tank", 8, u, 6, Color.STRENGTH, "X-Force", "", [], { trigger: {
    event: "GAIN",
    match: (ev, source) => isWound(ev.what) && ev.who !== owner(source),
    replace: ev => selectCardOptEv(ev, "Reveal a card", [ ev.source ], () => {
      gainEv(ev, ev.parent.what, owner(ev.source)); drawEv(ev, 1, owner(ev.source));
    }, () => doReplacing(ev), owner(ev.source))
  }}),
},
{
  name: "Daredevil",
  team: "Marvel Knights",
// RECRUIT: 2
// When you play Backflip, the next Hero you recruit this turn goes on top of your deck.
// COST: 3
  c1: makeHeroCard("Daredevil", "Backflip", 3, 2, u, Color.STRENGTH, "Marvel Knights", "D", ev => turnState.nextHeroRecruit = "DECK"),
// ATTACK: 2+
// Choose a number, then reveal the top card of your deck. If the card is that Cost, you get +2 Attack.
// COST: 4
  c2: makeHeroCard("Daredevil", "Radar Sense", 4, u, 2, Color.INSTINCT, "Marvel Knights", "D", ev => {
    chooseCostEv(ev, n => lookAtDeckEv(ev, 1, () => playerState.revealed.limit(c => c.cost === n).withFirst(c => addAttackEvent(ev, 2))));
  }),
// ATTACK: 4
// Choose a number, then reveal the top card of your deck. If the card is that Cost, draw it.
// COST: 6
  uc: makeHeroCard("Daredevil", "Blind Justice", 6, u, 4, Color.COVERT, "Marvel Knights", "", ev => chooseCostEv(ev, n => drawIfEv(ev, c => c.cost === n))),
// ATTACK: 7
// Choose a number, then reveal the top card of your deck. If the card is that Cost, draw it and repeat this process.
// COST: 8
  ra: makeHeroCard("Daredevil", "The Man Without Fear", 8, u, 7, Color.INSTINCT, "Marvel Knights", "", ev => {
    let f = () => chooseCostEv(ev, n => drawIfEv(ev, c => c.cost === n, f)); f();
  }),
},
{
  name: "Domino",
  team: "X-Force",
// RECRUIT: 0+
// ATTACK: 0+
// Draw a card.
// {TEAMPOWER X-Force} {VERSATILE 1}
// COST: 1
  c1: makeHeroCard("Domino", "Lucky Break", 1, 0, 0, Color.TECH, "X-Force", "G", [ ev => drawEv(ev, 1), ev => { if (superPower("X-Force")) versatileEv(ev, 1); } ]),
// RECRUIT: 0+
// ATTACK: 0+
// {VERSATILE 2}
// COST: 3
// FLAVOR: With Domino's mutant probability powers, every day is the luckiest day of her life.
  c2: makeHeroCard("Domino", "Ready for Anything", 3, 0, 0, Color.INSTINCT, "X-Force", "GFD", ev => versatileEv(ev, 2)),
// RECRUIT: 0+
// ATTACK: 0+
// You may discard a card from your hand. If that card had a Recruit icon, you get +4 Recruit. If that card had an Attack icon, you get +4 Attack.
// COST: 5
  uc: makeHeroCard("Domino", "Specialized Ammunition", 5, 0, 0, Color.TECH, "X-Force", "G", ev => selectCardOptEv(ev, "Choose a card to discard", playerState.hand.deck, sel => {
    discardEv(ev, sel);
    hasAttackIcon(sel) && addAttackEvent(ev, 4);
    hasRecruitIcon(sel) &&  addRecruitEvent(ev, 4);
  })),
// RECRUIT: 0+
// ATTACK: 0+
// {VERSATILE 5}
// {TEAMPOWER X-Force} This card and each other {VERSATILE} ability you use for the rest of this turn produces both Recruit and Attack.
// COST: 7
  ra: makeHeroCard("Domino", "Against All Odds", 7, 0, 0, Color.COVERT, "X-Force", "G", [ ev => { if (superPower("X-Force")) turnState.versatileBoth = true; }, ev => versatileEv(ev, 5)]),
},
{
  name: "Elektra",
  team: "Marvel Knights",
// ATTACK: 1+
// If this is the first card you played this turn, you get +1 Attack.
// COST: 1
  c1: makeHeroCard("Elektra", "First Strike", 1, u, 1, Color.COVERT, "Marvel Knights", "", ev => { if (turnState.cardsPlayed.size === 0) addAttackEvent(ev, 1); }),
// RECRUIT: 0+
// Draw a card.
// {POWER Covert} You get +2 Recruit.
// COST: 2
// FLAVOR: Zen is the absence of motion. Ninjitsu, the absence of stillness.
  c2: makeHeroCard("Elektra", "Ninjitsu", 2, 0, u, Color.INSTINCT, "Marvel Knights", "FD", [ ev => drawEv(ev, 1), ev => { if (superPower(Color.COVERT)) addRecruitEvent(ev, 2); } ]),
// ATTACK: 4+
// You get +1 Attack for each Hero you played this turn that costs 1 or 2.
// COST: 6
  uc: makeHeroCard("Elektra", "Sai Blades", 6, u, 4, Color.INSTINCT, "Marvel Knights", "D", ev => addAttackEvent(ev, turnState.cardsPlayed.count(c => c.cost === 1 || c.cost === 2))),
// RECRUIT: 5+
// When you play Silent Meditation, the next Hero you recruit this turn goes into your hand.
// {TEAMPOWER Marvel Knights} You get +2 Recruit.
// COST: 7
  ra: makeHeroCard("Elektra", "Silent Meditation", 7, 5, u, Color.INSTINCT, "Marvel Knights", "D", ev => {
    turnState.nextHeroRecruit = "HAND";
    if (superPower("Marvel Knights")) addRecruitEvent(ev, 2);
  }),
},
{
  name: "Forge",
  team: "X-Force",
// ATTACK: 2
// {POWER Tech} Any Villain you fight in the Sewers this turn gets -2 Attack.
// COST: 3
// GUN: 1
  c1: makeHeroCard("Forge", "Dirty Work", 3, u, 2, Color.TECH, "X-Force", "GD", ev => {
    if (superPower(Color.TECH)) addTurnMod("defense", c => isVillain(c) && atLocation(c, "SEWERS"), -2);
  }),
// RECRUIT: 2
// {POWER Tech} You may discard a card. If you do, draw two cards.
// COST: 4
// GUN: 1
  c2: makeHeroCard("Forge", "Reboot", 4, 2, u, Color.TECH, "X-Force", "GD", ev => {
    if (superPower(Color.TECH)) selectCardOptEv(ev, "Discard a card", playerState.hand.deck, c => { discardEv(ev, c); drawEv(ev, 2); });
  }),
// RECRUIT: 0+
// ATTACK: 0+
// {VERSATILE 3}
// COST: 5
// FLAVOR: When Forge can't find the turret remote, he just takes a couple of spoons and builds a new one.
  uc: makeHeroCard("Forge", "Overdrive", 5, 0, 0, Color.TECH, "X-Force", "F", ev => versatileEv(ev, 3)),
// ATTACK: 5
// {POWER Tech Tech} Defeat the Mastermind once for free.
// COST: 7
// FLAVOR: That's a BIG FREAKING GUN!!!!
// GUN: 1
  ra: makeHeroCard("Forge", "B.F.G.", 7, u, 5, Color.TECH, "X-Force", "GF", ev => {
    if (superPower(Color.TECH, Color.TECH)) selectCardEv(ev, "Defeat a mastermind", gameState.mastermind.deck, sel => defeatEv(ev, sel));
  }),
},
{
  name: "Ghost Rider",
  team: "Marvel Knights",
// ATTACK: 2+
// You may KO a Villain from your Victory Pile. If you do, you get +3 Attack.
// COST: 5
  c1: makeHeroCard("Ghost Rider", "Blazing Hellfire", 5, u, 2, Color.RANGED, "Marvel Knights", "D", ev => {
    selectCardOptEv(ev, "KO a Villain", playerState.victory.limit(isVillain), c => { KOEv(ev, c); addAttackEvent(ev, 3); });
  }),
// RECRUIT: 2+
// {TEAMPOWER Marvel Knights} You get +2 Recruit.
// COST: 3
// FLAVOR: Most motorcycles don't drive up walls. Most don't drive into your nightmares.
  c2: makeHeroCard("Ghost Rider", "Hell on Wheels", 3, 2, u, Color.TECH, "Marvel Knights", "FD", ev => { if (superPower("Marvel Knights")) addRecruitEvent(ev, 2); }),
// Draw a card.
// {POWER Strength} Defeat a Villain of 3 Attack or less for free.
// COST: 2
  uc: makeHeroCard("Ghost Rider", "Infernal Chains", 2, u, u, Color.STRENGTH, "Marvel Knights", "D", [ ev => drawEv(ev, 1), ev => {
    if (superPower(Color.STRENGTH)) selectCardEv(ev, "Defeat a Villain", villains().limit(c => c.defense <= 3), sel => defeatEv(ev, sel));
  }]),
// ATTACK: 3+
// Each player KOs a Villain from their Victory Pile. You get +1 Attack for each Villain KO'd this way.
// {TEAMPOWER Marvel Knights} Put one of those Villains into your Victory Pile.
// COST: 8
  ra: makeHeroCard("Ghost Rider", "Penance Stare", 8, u, 3, Color.RANGED, "Marvel Knights", "", ev => {
    let koed: Card[] = [];
    eachPlayer(p => selectCardEv(ev, "KO a Villain", p.victory.limit(isVillain), c => { KOEv(ev, c); koed.push(c); }, p));
    cont(ev, () => {
      addAttackEvent(ev, koed.length);
      if (superPower("Marvel Knights")) selectCardEv(ev, "Choose a Villain", koed, c => moveCardEv(ev, c, playerState.victory));
    });
  }),
},
{
  name: "Iceman",
  team: "X-Men",
// RECRUIT: 0+
// Draw a card.
// {POWER Ranged} You get +1 Recruit for each other [Ranged] Hero you played this turn.
// COST: 2
  c1: makeHeroCard("Iceman", "Deep Freeze", 2, 0, u, Color.RANGED, "X-Men", "D", [ ev => drawEv(ev, 1), ev => addRecruitEvent(ev, superPower(Color.RANGED)) ]),
// ATTACK: 2+
// {POWER Ranged} You get +1 Attack for each other [Ranged] Hero you played this turn.
// COST: 4
  c2: makeHeroCard("Iceman", "Ice Slide", 4, u, 2, Color.RANGED, "X-Men", "D", ev => addAttackEvent(ev, superPower(Color.RANGED))),
// ATTACK: 3
// {POWER Ranged} Draw a card for each [Ranged] Hero you played this turn.
// COST: 5
  uc: makeHeroCard("Iceman", "Frost Spike Armor", 5, u, 3, Color.STRENGTH, "X-Men", "", ev => drawEv(ev, superPower(Color.RANGED))),
// ATTACK: 7
// If a Villain, Master Strike, or Mastermind Tactic would cause you to gain any Wounds or discard any cards, you may reveal this card instead.
// COST: 8
  ra: makeHeroCard("Iceman", "Impenetrable Ice Wall", 8, u, 7, Color.RANGED, "X-Men", "", [], { triggers: [ {
    event: "GAIN",
    match: (ev, source) => isWound(ev.what) && owner(source) === ev.who && (isVillain(ev.getSource()) || isMastermind(ev.getSource()) || isTactic(ev.getSource())),
    replace: ev => revealOrEv(ev, c => c === ev.source, () => doReplacing(ev), owner(ev.source))
  }, {
    event: "DISCARD",
    match: (ev, source) => owner(source) === owner(ev.what) && (isVillain(ev.getSource()) || isMastermind(ev.getSource()) || isTactic(ev.getSource())),
    replace: ev => revealOrEv(ev, c => c === ev.source, () => doReplacing(ev), owner(ev.source))
  }]}),
},
{
  name: "Iron Fist",
  team: "Marvel Knights",
// RECRUIT: 0+
// You get +1 Recruit for each Hero with a different Cost you have.
// COST: 3
  c1: makeHeroCard("Iron Fist", "Focus Chi", 3, 0, u, Color.INSTINCT, "Marvel Knights", "", ev => addRecruitEvent(ev, yourHeroes().uniqueCount(c => c.cost))),
// ATTACK: 0+
// You get +1 Attack for each Hero with a different Cost you have.
// COST: 4
  c2: makeHeroCard("Iron Fist", "Wield the Iron Fist", 4, u, 0, Color.STRENGTH, "Marvel Knights", "", ev => addAttackEvent(ev, yourHeroes().uniqueCount(c => c.cost))),
// RECRUIT: 0+
// ATTACK: 0+
// Draw a card.
// {POWER Strength Strength} {VERSATILE 2}
// COST: 1
  uc: makeHeroCard("Iron Fist", "Ancient Legacy", 1, 0, 0, Color.STRENGTH, "Marvel Knights", "D", [ ev => drawEv(ev, 1), ev => { if (superPower(Color.STRENGTH, Color.STRENGTH)) versatileEv(ev, 2); } ]),
// ATTACK: 8
// Reveal cards from your deck until you have revealed two cards with the same Cost. Draw all the cards you revealed.
// COST: 9
  ra: makeHeroCard("Iron Fist", "Living Weapon", 9, u, 8, Color.STRENGTH, "Marvel Knights", "", ev => {
    let costs: boolean[] = [];
    let f = () => drawIfEv(ev, () => true, (c) => { let p = costs[c.cost]; costs[c.cost] = true; if (!p) f(); } );
    f();
  }),
},
{
  name: "Jean Grey",
  team: "X-Men",
// ATTACK: 2
// {TEAMPOWER X-Men} Rescue a Bystander.
// COST: 3
// FLAVOR: Amid violent chaos, a soundless voice leads to safety.
  c1: makeHeroCard("Jean Grey", "Psychic Search", 3, u, 2, Color.RANGED, "X-Men", "FD", ev => { if (superPower("X-Men")) rescueEv(ev); }),
// RECRUIT: 3+
// Whenever you rescue a Bystander this turn, you get +1 Recruit.
// COST: 5
  c2: makeHeroCard("Jean Grey", "Read Your Thoughts", 5, 3, u, Color.COVERT, "X-Men", "", ev => addTurnTrigger("RESCUE", ev => isBystander(ev.what), ev => addRecruitEvent(ev, 1))),
// ATTACK: 4
// Whenever you rescue a Bystander this turn, draw a card.
// COST: 6
  uc: makeHeroCard("Jean Grey", "Mind Over Matter", 6, u, 4, Color.COVERT, "X-Men", "", ev => addTurnTrigger("RESCUE", ev => isBystander(ev.what), ev => drawEv(ev))),
// ATTACK: 5+
// Whenever you rescue a Bystander this turn, you get +1 Attack.
// {TEAMPOWER X-Men} Rescue a Bystander for each other X-Men Hero you played this turn.
// COST: 7
  ra: makeHeroCard("Jean Grey", "Telekinetic Mastery", 7, u, 5, Color.RANGED, "X-Men", "", [
    ev => addTurnTrigger("RESCUE", ev => isBystander(ev.what), ev => addAttackEvent(ev, 1)),
    ev => cont(ev, () => rescueEv(ev, superPower("X-Men")))
   ]),
},
{
  name: "Nightcrawler",
  team: "X-Men",
// RECRUIT: 2
// <b>Teleport</b>
// COST: 3
// FLAVOR: "Now you see me..." BAMF!"
  c1: makeHeroCard("Nightcrawler", "Bamf!", 3, 2, u, Color.INSTINCT, "X-Men", "FD", [], { teleport: true }),
// ATTACK: 2
// <b>Teleport</b>
// COST: 4
// FLAVOR: Sometimes it is best to hide now and fight later.
  c2: makeHeroCard("Nightcrawler", "Blend Into Shadows", 4, u, 2, Color.COVERT, "X-Men", "FD", [], { teleport: true }),
// ATTACK: 3+
// {POWER Covert Instinct} You get +3 Attack.
// COST: 5
// FLAVOR: Chivalry wears blue fur.
  uc: makeHeroCard("Nightcrawler", "Swashbuckler", 5, u, 3, Color.INSTINCT, "X-Men", "F", ev => { if (superPower(Color.COVERT, Color.INSTINCT)) addAttackEvent(ev, 3); }),
// ATTACK: 5
// <b>Teleport</b>
// When you play or <b>Teleport</b> this card, you may also <b>Teleport</b> up to three other cards from your hand.
// COST: 7
  ra: makeHeroCard("Nightcrawler", "Along for the Ride", 7, u, 5, Color.COVERT, "X-Men", "", ev => {
    selectObjectsUpToEv(ev, "Teleport up to three cards", 3, playerState.hand.deck, c => teleportEv(ev, c))
  }, { teleport: true, trigger: {
    event: "TELEPORT",
    match: (ev, source) => ev.what === source,
    after: ev => selectObjectsUpToEv(ev, "Teleport up to three cards", 3, playerState.hand.deck, c => teleportEv(ev, c))
  } }),
},
{
  name: "Professor X",
  team: "X-Men",
// RECRUIT: 2
// You may put a Hero from the HQ on the bottom of the Hero Deck.
// {POWER Instinct} You may KO a card from your hand or discard pile.
// COST: 3
// FLAVOR: "What do they call you? Wheels?"
  c1: makeHeroCard("Professor X", "Class Dismissed", 3, 2, u, Color.INSTINCT, "X-Men", "FD", [
    ev => selectCardOptEv(ev, "Choose a Hero", HQCards().limit(isHero), c => moveCardEv(ev, c, gameState.herodeck, true)),
    ev => { if (superPower(Color.INSTINCT)) KOHandOrDiscardEv(ev, undefined); },
  ]),
// ATTACK: 1+
// {TEAMPOWER X-Men} You get +2 Attack.
// COST: 2
// FLAVOR: In a plane of pure mental energy, Xavier's body is as powerful as his mind.
  c2: makeHeroCard("Professor X", "Psionic Astral Form", 2, u, 1, Color.RANGED, "X-Men", "FD", ev => { if (superPower("X-Men")) addAttackEvent(ev, 2); }),
// ATTACK: 3
// Reveal the top card of the Villain Deck. If it's a Bystander, you may rescue it. If it's a Villain, you may fight it this turn.
// COST: 5
  uc: makeHeroCard("Professor X", "Telepathic Probe", 5, u, 3, Color.RANGED, "X-Men", "", ev => revealVillainDeckEv(ev, 1, r => {
    r.limit(isBystander).each(c => chooseMayEv(ev, "Rescue the bystander", () => rescueEv(ev, c)));
    r.limit(isVillain).each(c => {
      addTurnSet('isFightable', card => c === gameState.villaindeck.top && card === c, () => true);
    });
  })),
// ATTACK: 6
// Whenever you defeat a Villain this turn, you may gain it. It becomes a grey Hero with no text that gives + Attack equal to its Attack. (You still get its VP.)
// COST: 8
  ra: makeHeroCard("Professor X", "Mind Control", 8, u, 6, Color.COVERT, "X-Men", "", ev =>
    addTurnTrigger("DEFEAT", ev => isVillain(ev.what), ev => chooseMayEv(ev, "Gain villain as a Hero", () => {
      const target = ev.parent.what;
      const isTarget = (c: Card) => c === target;
      addStatSet('color', isTarget, () => Color.GRAY);
      addStatSet('isHero', isTarget, () => true);
      addStatSet('attack', isTarget, c => c.baseDefense);
      gainEv(ev, target);
    }))
  ),
},
{
  name: "Punisher",
  team: "Marvel Knights",
// Reveal the top card of your deck. If it costs 0, KO it.
// {POWER Tech} Draw a card.
// COST: 2
// FLAVOR: The Punisher always knows which cops are corrupt.
  c1: makeHeroCard("Punisher", "Boom Goes the Dynamite", 2, u, u, Color.TECH, "Marvel Knights", "GFD", [
    ev => lookAtDeckEv(ev, 1, () => playerState.revealed.limit(c => c.cost === 0).each(c => KOEv(ev, c))),
    ev => { if (superPower(Color.TECH)) drawEv(ev, 1); },
  ]),
// ATTACK: 2+
// Reveal the top card of the Villain Deck. If it's a Villain, you get + Attack equal to its printed VP.
// {POWER Tech Tech} You may defeat that Villain for free.
// COST: 5
  c2: makeHeroCard("Punisher", "Hail of Bullets", 5, u, 2, Color.TECH, "Marvel Knights", "GD", ev => {
    revealVillainDeckEv(ev, 1, r => r.limit(isVillain).each(c => {
      addAttackEvent(ev, c.printedVP);
      if (superPower(Color.TECH, Color.TECH)) chooseMayEv(ev, "Defeat the revealed villain", () => defeatEv(ev, c));
     }));
  }),
// RECRUIT: 2+
// {POWER Strength} Each other player reveals the top card of their deck. If that card costs 4 or more, discard it. You get +1 Recruit for each card discarded this way.
// COST: 3
  uc: makeHeroCard("Punisher", "Hostile Interrogation", 3, 2, u, Color.STRENGTH, "Marvel Knights", "GD", ev => { if (superPower(Color.STRENGTH)) {
    let count = 0;
    eachOtherPlayer(p => lookAtDeckEv(ev, 1, () => p.revealed.limit(c => c.cost >= 4).each(c => { discardEv(ev, c); count++; }), p));
    cont(ev, () => addRecruitEvent(ev, count));
  }}),
// ATTACK: 4+
// Reveal cards from the Hero Deck until you have revealed two cards with the same Cost. You get +1 Attack for each card revealed this way. Put them on the bottom of the Hero Deck in random order.
// COST: 8
  ra: makeHeroCard("Punisher", "The Punisher", 8, u, 4, Color.TECH, "Marvel Knights", "G", ev => {
    revealHeroDeckEv(ev, r => r.uniqueCount(c => c.cost) === r.size, r => addAttackEvent(ev, r.size), true, true);
  }),
},
{
  name: "Wolverine",
  team: "X-Force",
// ATTACK: 0+
// Draw a card.
// {POWER Instinct} You get +2 Attack.
// COST: 2
// FLAVOR: To avoid injury, it's best to keep a distance from Wolverine of at least 5,000 miles.
  c1: makeHeroCard("Wolverine", "Animal Instincts", 2, u, 0, Color.INSTINCT, "X-Force", "FD", [ ev => drawEv(ev, 1), ev => { if (superPower(Color.INSTINCT)) addAttackEvent(ev, 2); } ]),
// ATTACK: 2+
// If you drew any extra cards this turn, you get +2 Attack.
// COST: 4
  c2: makeHeroCard("Wolverine", "Sudden Ambush", 4, u, 2, Color.COVERT, "X-Force", "D", ev => {if (turnState.cardsDrawn > 0) addAttackEvent(ev, 2); }),
// Draw a card.
// You may KO a card from your hand or discard pile.
// COST: 4
  uc: makeHeroCard("Wolverine", "No Mercy", 4, u, u, Color.STRENGTH, "X-Force", "", [ ev => drawEv(ev, 1), ev => KOHandOrDiscardEv(ev, undefined) ]),
// ATTACK: 3
// Count the number of extra cards you drew this turn. Draw that many cards.
// COST: 7
  ra: makeHeroCard("Wolverine", "Reckless Abandon", 7, u, 3, Color.COVERT, "X-Force", "", ev => drawEv(ev, turnState.cardsDrawn)),
},
]);
addHeroTemplates("Fantastic Four", [
{
  name: "Human Torch",
  team: "Fantastic Four",
// RECRUIT: 2+
// You may KO a Wound from your hand or discard pile. If you do, you get +1 Recruit.
// COST: 3
// FLAVOR: The Fantastic Four has access to all sorts of communications; Johnny prefers his own methods.
  c1: makeHeroCard("Human Torch", "Call for Backup", 3, 2, u, Color.INSTINCT, "Fantastic Four", "FD", ev => KOHandOrDiscardEv(ev, isWound, () => addRecruitEvent(ev, 1))),
// ATTACK: 4
// You gain a Wound.
// COST: 4
// FLAVOR: "I like to know my limits. So I can break them."
  c2: makeHeroCard("Human Torch", "Hothead", 4, u, 4, Color.RANGED, "Fantastic Four", "F", ev => gainWoundEv(ev)),
// ATTACK: 4+
// {FOCUS 6} You get +4 Attack.
// COST: 6
  uc: makeHeroCard("Human Torch", "Flame On!", 6, u, 4, Color.RANGED, "Fantastic Four", "", ev => setFocusEv(ev, 6, ev => addAttackEvent(ev, 4))),
// ATTACK: 6+
// {TEAMPOWER Fantastic Four} You get +1 Attack for each city space that contains a Villain.
// COST: 8
  ra: makeHeroCard("Human Torch", "Nova Flame", 8, u, 6, Color.RANGED, "Fantastic Four", "", ev => superPower("Fantastic Four") && addAttackEvent(ev, CityCards().count(isVillain))),
},
{
  name: "Invisible Woman",
  team: "Fantastic Four",
// RECRUIT: 2
// {FOCUS 2} You may KO a card from your hand or discard pile.
// COST: 4
// FLAVOR: "Now you see it...Now you don't!"
  c1: makeHeroCard("Invisible Woman", "Disappearing Act", 4, 2, u, Color.COVERT, "Fantastic Four", "FD", ev => setFocusEv(ev, 2, ev => KOHandOrDiscardEv(ev, undefined))),
// ATTACK: 2+
// If you played any other cards that cost 4 this turn, you get +2 Attack.
// COST: 4
// FLAVOR: A family that plays together stays together.
  c2: makeHeroCard("Invisible Woman", "Four of a Kind", 4, u, 2, Color.RANGED, "Fantastic Four", "FD", ev => turnState.cardsPlayed.has(c => c.cost === 4) && addAttackEvent(ev, 2)),
// ATTACK: 2
// {FOCUS 2} Rescue a Bystander. You may only use this ability up to four times this turn.
// COST: 4
// FLAVOR: "If seeing is believing, you are not going to believe this."
  uc: makeHeroCard("Invisible Woman", "Unseen Rescue", 4, u, 2, Color.COVERT, "Fantastic Four", "FD", ev => setFocusEv(ev, 2, ev => rescueEv(ev), 4)),
// ATTACK: 5
// If an ambush effect would occur, you may reveal this card and draw two cards instead.
// COST: 7
  ra: makeHeroCard("Invisible Woman", "Invisible Barrier", 7, u, 5, Color.COVERT, "Fantastic Four", "", [], { trigger: {
    event: 'EFFECT',
    match: ev => ev.effectName == 'ambush',
    replace: ev => selectCardOptEv(ev, "Reveal a card", [ ev.source ], () => drawEv(ev, 2, owner(ev.source)), () => doReplacing(ev), owner(ev.source))
  }}),
},
{
  name: "Mr. Fantastic",
  team: "Fantastic Four",
// RECRUIT: 2
// {FOCUS 2} When you draw a new hand of cards at the end of this turn, draw an extra card.
// COST: 3
// FLAVOR: "I consider the laws of physics more like guidelines."
  c1: makeHeroCard("Mr. Fantastic", "Twisting Equations", 3, 2, u, Color.TECH, "Fantastic Four", "FD", ev => setFocusEv(ev, 2, ev => addEndDrawMod(1))),
// Draw two cards.
// COST: 5
// FLAVOR: Reed Richards has an idea for a new costume material, but it's a stretch.
  c2: makeHeroCard("Mr. Fantastic", "Unstable Molecules", 5, u, u, Color.TECH, "Fantastic Four", "F", ev => drawEv(ev, 2)),
// ATTACK: 1+
// {TEAMPOWER Fantastic Four} You get +1 Attack for each card in your hand.
// COST: 5
// FLAVOR: "Most of my career is thinking. Then there's this."
  uc: makeHeroCard("Mr. Fantastic", "One Gigantic Hand", 5, u, 1, Color.INSTINCT, "Fantastic Four", "F", ev => superPower("Fantastic Four") && addAttackEvent(ev, playerState.hand.size)),
// ATTACK: 4+
// If an Enemy you fight this turn would have a fight effect, you may cancel that effect instead.
// {FOCUS 1} You get +1 Attack usable only against the Mastermind.
// COST: 7
  ra: makeHeroCard("Mr. Fantastic", "Ultimate Nullifier", 7, u, 4, Color.TECH, "Fantastic Four", "", [
    ev => addTurnTrigger('EFFECT', ev => ev.effectName == 'fight', { replace: ev => chooseMayEv(ev, "Keep fight effect", () => doReplacing(ev)) }),
    ev => setFocusEv(ev, 1, ev => addAttackSpecialEv(ev, isMastermind, 1))
  ]),
},
{
  name: "Silver Surfer",
  team: "(Unaffiliated)",
// RECRUIT: 2
// {FOCUS 6} Defeat a Villain of 5 Attack or 6 Attack.
// COST: 4
// FLAVOR: "Master? Galactus had been my master! You - are but - a flea!"
// GUN: 1
  c1: makeHeroCard("Silver Surfer", "Epic Destiny", 4, 2, u, Color.STRENGTH, u, "GFD", ev => setFocusEv(ev, 6, ev => selectCardEv(ev, "Defeat villain", villains().limit(c => c.defense === 5 || c.defense === 6), (c) => defeatEv(ev, c)))),
// RECRUIT: 2
// {FOCUS 2} Draw a card.
// COST: 3
// FLAVOR: "Engage!"
  c2: makeHeroCard("Silver Surfer", "Warp Speed", 3, 2, u, Color.COVERT, u, "FD", ev => setFocusEv(ev, 2, ev => drawEv(ev, 1))),
// RECRUIT: 3
// ATTACK: 0+
// {FOCUS 9} You get +9 Attack.
// COST: 6
// FLAVOR: As a Herald, Surfer selected many planets for the Devourer of Worlds, until Earth taught him compassion.
  uc: makeHeroCard("Silver Surfer", "The Power Cosmic", 6, 3, 0, Color.RANGED, u, "F", ev => setFocusEv(ev, 9, ev => addAttackEvent(ev, 9))),
// Double the Recruit you have.
// COST: 7
// FLAVOR: Finding extra power is not a problem for the Silver Surfer. His power is immeasurable.
  ra: makeHeroCard("Silver Surfer", "Energy Surge", 7, u, u, Color.RANGED, u, "F", ev => doubleRecruitEv(ev)),
},
{
  name: "Thing",
  team: "Fantastic Four",
// RECRUIT: 2+
// {TEAMPOWER Fantastic Four} You get +2 Recruit.
// COST: 3
// FLAVOR: Yancy Street is Thing's turf. Trespass at your own risk.
  c1: makeHeroCard("Thing", "It Started on Yancy Street", 3, 2, u, Color.INSTINCT, "Fantastic Four", "FD", ev => superPower("Fantastic Four") && addRecruitEvent(ev, 2)),
// RECRUIT: 3
// ATTACK: 0+
// {FOCUS 3} You get +2 Attack.
// COST: 5
// FLAVOR: Recipe prep time: 3 seconds. Serves: 20
  c2: makeHeroCard("Thing", "Knuckle Sandwich", 5, 3, 0, Color.STRENGTH, "Fantastic Four", "FD", ev => setFocusEv(ev, 3, ev => addAttackEvent(ev, 2))),
// ATTACK: 4
// Whenever you defeat a Villain in the Bank this turn, rescue a Bystander.
// {FOCUS 1} Move a Villain to an adjacent city space. If another Villain is already there, swap them.
// COST: 6
  uc: makeHeroCard("Thing", "Crime Stopper", 6, u, 4, Color.STRENGTH, "Fantastic Four", "", [
    ev => addTurnTrigger('DEFEAT', c => isLocation(c.where, 'BANK'), ev => rescueEv(ev)),
    ev => setFocusEv(ev, 1, () => selectCardOptEv(ev, "Choose a Villain to move", CityCards().limit(isVillain), v => {
      selectCardEv(ev, "Choose a new city space", cityAdjecent(v.location), dest => swapCardsEv(ev, v.location, dest));
    })),
  ]),
// ATTACK: 5+
// {POWER Strength} You get +3 Attack for each other [Strength] card you played this turn.
// COST: 8
// FLAVOR: Thing doesn't wear a watch, but he's happy to tell you what time it is.
  ra: makeHeroCard("Thing", "It's Clobberin' Time!", 8, u, 5, Color.STRENGTH, "Fantastic Four", "F", ev => superPower(Color.STRENGTH) && addAttackEvent(ev, 3 * superPower(Color.STRENGTH))),
},
]);
addHeroTemplates("Paint the Town Red", [
{
  name: "Black Cat",
  team: "Spider Friends",
// RECRUIT: 2+
// {WALLCRAWL}
// You get another +1 Recruit usable only to recruit the Hero in the HQ Space under the Bank.
// COST: 4
  c1: makeHeroCard("Black Cat", "Casual Bank Robbery", 4, 2, u, Color.COVERT, "Spider Friends", "D",
    ev => addRecruitSpecialEv(ev, c => isLocation(c.location.below, 'BANK'), 1),
    { wallcrawl: true }
  ),
// ATTACK: 0+
// {WALLCRAWL}
// Reveal the top card of any player's deck. You get + Attack equal to that card's printed Recruit plus its printed Attack.
// COST: 1
// GUN: 1
  c2: makeHeroCard("Black Cat", "Pickpocket", 1, u, 0, Color.COVERT, "Spider Friends", "G",
    ev => choosePlayerEv(ev, p => lookAtDeckEv(ev, 1, () => p.revealed.withTop(card => {
        const amount = (card.printedAttack || 0) + (card.printedRecruit || 0);
        amount && addAttackEvent(ev, amount);
    }), p)),
    { wallcrawl: true }
  ),
// ATTACK: 3
// Each player reveals the top card of their deck. Choose any number of those cards to be discarded.
// COST: 5
// FLAVOR: Bad luck comes to all who cross Black Cat's path.
  uc: makeHeroCard("Black Cat", "Jinx", 5, u, 3, Color.INSTINCT, "Spider Friends", "F", ev => eachPlayer(p => {
    lookAtDeckEv(ev, 1, () => p.revealed.withTop(card => selectCardOptEv(ev, 'Discard a card from top of the deck', p.revealed.deck, c => discardEv(ev, c))))
  })),
// ATTACK: 5+
// Each other player reveals a [Covert] Hero or chooses a Bystander from their Victory Pile. You rescue those Bystanders.
// {TEAMPOWER Spider Friends} You get +1 Attack for each Bystander you rescued this turn.
// COST: 8
  ra: makeHeroCard("Black Cat", "Cat Burglar", 8, u, 5, Color.COVERT, "Spider Friends", "", [
    ev => eachOtherPlayer(p => {
      revealOrEv(ev, Color.COVERT, () => {
        selectCardEv(ev, `Select a Bystander for ${playerState.name} to rescue`, p.victory.deck, c => rescueEv(ev, c), p);
      }, p);
    }),
    ev => superPower("Spider Friends") && addAttackEvent(ev, turnState.bystandersRescued),
  ]),
},
{
  name: "Moon Knight",
  team: "Marvel Knights",
// RECRUIT: 2+
// {WALLCRAWL}
// {POWER Instinct} You get +1 Recruit.
// COST: 3
// FLAVOR: Criminals feel the cold light of the moon on their sins...but they never think to look up.
  c1: makeHeroCard("Moon Knight", "Climbing Claws", 3, 2, u, Color.TECH, "Marvel Knights", "FD", ev => superPower(Color.INSTINCT) && addRecruitEvent(ev, 1), { wallcrawl: true }),
// ATTACK: 2
// {WALLCRAWL}
// Whenever you defeat a Villain on the Rooftops this turn, you may KO one of your cards or a card from your discard pile.
// COST: 3
  c2: makeHeroCard("Moon Knight", "Lunar Communion", 3, u, 2, Color.INSTINCT, "Marvel Knights", "D",
    ev => addTurnTrigger('DEFEAT', ev => isLocation(ev.where, 'ROOFTOPS'), ev => selectCardAndKOEv(ev, [...handOrDiscard(), ...playerState.playArea.deck])),
    { wallcrawl: true }
  ),
// ATTACK: 3
// Reveal the top card of your deck. If it's [Instinct] or [Tech], draw it.
// COST: 5
// FLAVOR: Villains face the crescent moon's judgment. Then they get the crescent moon's judgment in their face.
  uc: makeHeroCard("Moon Knight", "Crescent Moon Darts", 5, u, 3, Color.TECH, "Marvel Knights", "F",
    ev => drawIfEv(ev, Color.INSTINCT | Color.TECH)
  ),
// ATTACK: 6
// Whenever you defeat a Villain on the Rooftops this turn, rescue Bystanders equal to that Villain's printed VP.
// {POWER Tech} You may move a Villain to the Rooftops. If another Villain is already there, swap them.
// COST: 8
  ra: makeHeroCard("Moon Knight", "Golden Ankh of Khonshu", 8, u, 6, Color.INSTINCT, "Marvel Knights", "", [
    ev => addTurnTrigger('DEFEAT', ev => isLocation(ev.where, 'ROOFTOPS'), ev => ev.parent.what.printedVP && rescueEv(ev, ev.parent.what.printedVP)),
    ev => superPower(Color.TECH) && withCity('ROOFTOPS', rooftops => selectCardOptEv(ev, "Move to Rooftops", villains().limit(c => c.location !== rooftops), c => swapCardsEv(ev, c.location, rooftops))),
  ]),
},
{
  name: "Scarlet Spider",
  team: "Spider Friends",
// RECRUIT: 1
// {WALLCRAWL}
// {TEAMPOWER Spider Friends} Draw a card.
// COST: 2
  c1: makeHeroCard("Scarlet Spider", "Flip Out", 2, 1, u, Color.STRENGTH, "Spider Friends", "D", ev => superPower("Spider Friends") && drawEv(ev, 1), { wallcrawl: true }),
// ATTACK: 1
// {WALLCRAWL}
// Draw a card.
// COST: 4
// FLAVOR: Predators who underestimate Scarlet Spider quickly find themselves the prey.
  c2: makeHeroCard("Scarlet Spider", "Perfect Hunter", 4, u, 1, Color.INSTINCT, "Spider Friends", "F", ev => drawEv(ev, 1), { wallcrawl: true }),
// ATTACK: 3+
// {WALLCRAWL}
// {POWER Instinct} You get +2 Attack.
// COST: 6
// FLAVOR: A life of chaos lends Scarlet Spider an unpredictability that opponents can't escape.
  uc: makeHeroCard("Scarlet Spider", "Leap From Above", 6, u, 3, Color.COVERT, "Spider Friends", "FD", ev => superPower(Color.INSTINCT) && addAttackEvent(ev, 2), { wallcrawl: true }),
// ATTACK: 5
// Whenever you put a card on top of your deck this turn, you may draw that card.
// COST: 7
// FLAVOR: Many people are allergic...to getting punched in the face by a truck.
  ra: makeHeroCard("Scarlet Spider", "Sting of the Spider", 7, u, 5, Color.STRENGTH, "Spider Friends", "F",
    ev => addTurnTrigger('MOVECARD', ev => ev.to === playerState.deck && !ev.bottom, ev => chooseMayEv(ev, 'Draw card put on top of the deck', () => drawEv(ev)))
  ),
},
{
  name: "Spider-Woman",
  team: "Spider Friends",
// ATTACK: 2
// {WALLCRAWL}
// Reveal the top card of your deck. If that card has an Attack icon, draw it.
// COST: 4
  c1: makeHeroCard("Spider-Woman", "Bioelectric Shock", 4, u, 2, Color.RANGED, "Spider Friends", "D",
    ev => drawIfEv(ev, hasAttackIcon),
    { wallcrawl: true }
  ),
// RECRUIT: 3
// To play this card, you must put a card from your hand on top of your deck.
// COST: 2
// FLAVOR: Et tu, Brute?
  c2: makeHeroCard("Spider-Woman", "Radioactive Spider", 2, 3, u, Color.STRENGTH, "Spider Friends", "FD", [], { playCost: 1, playCostType: 'TOPDECK' }),
// ATTACK: 3
// {WALLCRAWL}
// Reveal the top card of your deck. If that card has a Recruit icon, draw it.
// COST: 6
// FLAVOR: For prison psychologists, arachnophobia is a surprisingly common diagnosis.
  uc: makeHeroCard("Spider-Woman", "Venom Blast", 6, u, 3, Color.RANGED, "Spider Friends", "F",
    ev => drawIfEv(ev, hasRecruitIcon),
    { wallcrawl: true }
  ),
// Recruit a Hero from the HQ for free.
// {TEAMPOWER Spider Friends} Put that Hero on top of your deck.
// COST: 7
// FLAVOR: They'll follow her anywhere.
  ra: makeHeroCard("Spider-Woman", "Arachno-Pheromones", 7, u, u, Color.COVERT, "Spider Friends", "F",
    ev => selectCardEv(ev, 'Rectuit a Hero for free', HQCards().limit(isHero), c => {
      if (superPower("Spider Friends")) turnState.nextHeroRecruit = 'HAND';
      recruitForFreeEv(ev, c);
    }),
  ),
},
{
  name: "Symbiote Spider-Man",
  team: "Spider Friends",
// ATTACK: 1+
// {WALLCRAWL}
// Reveal the top card of your deck. If it costs 1 or 2, you get +2 Attack.
// COST: 2
  c1: makeHeroCard("Symbiote Spider-Man", "Dark Strength", 2, u, 1, Color.STRENGTH, "Spider Friends", "D",
    ev => lookAtDeckEv(ev, 1, () => playerState.revealed.has(c => c.cost === 1 || c.cost === 2) && addAttackEvent(ev, 2)),
    { wallcrawl: true }
  ),
// Reveal the top two cards of your deck. Put any that cost 2 or less into your hand. Put the rest back in any order.
// COST: 2
  c2: makeHeroCard("Symbiote Spider-Man", "Spider-Sense Tingling", 2, u, u, Color.INSTINCT, "Spider Friends", "D",
    ev => lookAtDeckEv(ev, 2, () => playerState.revealed.limit(c => c.cost === 2).each(c => moveCardEv(ev, c, playerState.hand)))
  ),
// ATTACK: 1+
// {WALLCRAWL}
// You get +1 Attack for each other Hero you played this turn that costs 1 or 2.
// COST: 2
  uc: makeHeroCard("Symbiote Spider-Man", "Shadowed Spider", 2, u, 1, Color.COVERT, "Spider Friends", "D",
    ev => addAttackEvent(ev, turnState.cardsPlayed.count(c => c.cost === 1 || c.cost === 2)),
    { wallcrawl: true }
  ),
// ATTACK: 4
// To play this card, you must put two cards from your hand on top of your deck.
// COST: 2
  ra: makeHeroCard("Symbiote Spider-Man", "Thwip!", 2, u, 4, Color.RANGED, "Spider Friends", "D", [], { playCost: 2, playCostType: 'TOPDECK' }),
},
]);
addHeroTemplates("Villains", [
{
  name: "Bullseye",
  team: "Crime Syndicate",
// ATTACK: 2
// {POWER Instinct} Draw a card.
// COST: 3
// FLAVOR: "And for my next trick..."
  c1: makeHeroCard("Bullseye", "Everything's A Weapon", 3, u, 2, Color.RANGED, "Crime Syndicate", "FD", ev => superPower(Color.INSTINCT) && drawEv(ev, 1)),
// RECRUIT: 0+
// {DODGE}
// Choose an Adversary Group. You get +1 Recruit for each Adversary in your Victory Pile from that Adversary Group.
// COST: 2
  c2: makeHeroCard("Bullseye", "Fulfill The Contract", 2, 0, u, Color.INSTINCT, "Crime Syndicate", "D", ev => {
    const groups = playerState.victory.limit(isVillain).unique(c => c.villainGroup);
    const f = (group: string) => addRecruitEvent(ev, playerState.victory.limit(isVillain).count(c => c.villainGroup === group));
    const options = groups.map(g => [g, () => f(g)] as [ string, () => void]);
    chooseOneEv(ev, "Choose an Adversary Group", ...options);
  }, { cardActions: [ dodge ] }),
// ATTACK: 3
// Choose an Adversary. It gets -1 Attack for each Adversary in your Victory Pile from that Adversary Group.
// COST: 6
  uc: makeHeroCard("Bullseye", "Specialist Assassin", 6, u, 3, Color.COVERT, "Crime Syndicate", "", ev => {
    const p = playerState;
    selectCardEv(ev, "Choose an Adversary", villains(), c => addStatMod('defense', v => v === c, () => -p.victory.limit(v => v.villainGroup === c.villainGroup)));
  }),
// ATTACK: 5+
// You get +5 Attack for each Commander Tactic in your Victory Pile.
// COST: 7
// GUN: 1
  ra: makeHeroCard("Bullseye", "Perfect Aim", 7, u, 5, Color.RANGED, "Crime Syndicate", "G", ev => {
    addAttackEvent(ev, 5 * playerState.victory.count(isTactic));
  }),
},
{
  name: "Dr. Octopus",
  team: "Sinister Six",
// RECRUIT: 2
// {POWER Tech} When you draw a new hand of cards at the end of this turn, draw an extra card.
// COST: 3
  c1: makeHeroCard("Dr. Octopus", "Brilliant Research", 3, 2, u, Color.TECH, "Sinister Six", "D", ev => {
    superPower(Color.TECH) && addEndDrawMod(1);
  }),
// ATTACK: 2
// Draw a card.
// COST: 5
// FLAVOR: "It worked! Hahahahaha!"
  c2: makeHeroCard("Dr. Octopus", "Crazed Experiments", 5, u, 2, Color.TECH, "Sinister Six", "FD", ev => drawEv(ev, 1)),
// ATTACK: 4+
// If this is the eighth card you played this turn, you get +2 Attack.
// COST: 6
// FLAVOR: If at first you don't succeed...
  uc: makeHeroCard("Dr. Octopus", "Eighth Time's a Charm", 6, u, 4, Color.STRENGTH, "Sinister Six", "FD", ev => {
    turnState.cardsPlayed.size === 7 && addAttackEvent(ev, 2);
  }),
// ATTACK: 0+
// Discard cards from the top of your deck until your deck runs out or you have discarded 8 cards (don't shuffle). Then you get +1 Attack for each card you discarded this turn.
// COST: 8
  ra: makeHeroCard("Dr. Octopus", "Octo-Pulverize", 8, u, 0, Color.TECH, "Sinister Six", "", ev => {
    repeat(8, () => playerState.deck.withTop(c => discardEv(ev, c)));
    cont(ev, () => addAttackEvent(ev, turnState.cardsDiscarded.size));
  }),
},
{
  name: "Electro",
  team: "Sinister Six",
// {DODGE}
// Reveal the top card of your deck. You may KO it.
// COST: 2
// FLAVOR: "I'm not really all that shocked to see you go"
  c1: makeHeroCard("Electro", "Electroshock Therapy", 2, u, u, Color.RANGED, "Sinister Six", "FD", ev => {
    lookAtDeckEv(ev, 1, () => playerState.revealed.withTop(c => chooseMayEv(ev, "KO revealed card", () => KOEv(ev, c))));
  }, { cardActions: [ dodge ] }),
// ATTACK: 0+
// {DODGE}
// You get +3 Attack usable only against Adversaries in the Bank.
// {POWER Ranged} Instead you may get +3 Attack usable only against the Commander.
// COST: 3
  c2: makeHeroCard("Electro", "Shocking Robbery", 3, u, 0, Color.RANGED, "Sinister Six", "", ev => {
    let cond = (c: Card) => isLocation(c.location, 'BANK');
    superPower(Color.RANGED) && chooseMayEv(ev, "Choose attack against the Commander", () => cond = isMastermind);
    cont(ev, () => addAttackSpecialEv(ev, cond, 3));
  }, { cardActions: [ dodge ] }),
// ATTACK: 2+
// You get +1 Attack for each card you discarded this turn.
// COST: 5
// FLAVOR: Unlimited Power!
  uc: makeHeroCard("Electro", "Supercharge", 5, u, 2, Color.INSTINCT, "Sinister Six", "FD", ev => addAttackEvent(ev, turnState.cardsDiscarded.size)),
// ATTACK: 4
// All Adversaries and the Commander get -1 Attack this turn.
// {TEAMPOWER Sinister Six, Sinister Six} Same Effect
// COST: 7
  ra: makeHeroCard("Electro", "Anti-Matter", 7, u, 4, Color.RANGED, "Sinister Six", "", ev => {
    addTurnMod('defense', c => isVillain(c) || isMastermind(c), superPower("Sinister Six", "Sinister Six") ? -2 : -1);
  }),
},
{
  name: "Enchantress",
  team: "Foes of Asgard",
// ATTACK: 2
// {POWER Ranged} Whenever you defeat an Adversary this turn, you gain a New Recruit.
// COST: 3
  c1: makeHeroCard("Enchantress", "Enchant the Senses", 3, u, 2, Color.RANGED, "Foes of Asgard", "D", ev => {
    superPower(Color.RANGED) && addTurnTrigger('DEFEAT', ev => isVillain(ev.what), () => gameState.newRecruit.withTop(c => gainEv(ev, c)));
  }),
// RECRUIT: 1+
// You may KO a card from your hand or discard pile. You get + Recruit equal to that card's Cost.
// COST: 4
  c2: makeHeroCard("Enchantress", "Soul Sacrifice", 4, 1, u, Color.COVERT, "Foes of Asgard", "", ev => KOHandOrDiscardEv(ev, undefined, c => addRecruitEvent(ev, c.cost))),
// RECRUIT: 3
// Choose an Adversary. You can spend any combination of Recruit and Attack to fight that Adversary this turn.
// {POWER Covert Covert} You can also spend any combination of Recruit and Attack to fight the Commander this turn.
// COST: 6
  uc: makeHeroCard("Enchantress", "Irresistible Bribe", 6, 3, u, Color.COVERT, "Foes of Asgard", "", [
    ev => selectCardEv(ev, "Choose an Adversary", villains(), c => addTurnSet('fightCost', v => v === c, (c, prev) => ({...prev, attack: 0, either: (prev.either || 0) + (prev.attack || 0)}))),
    ev => superPower(Color.COVERT, Color.COVERT) && addTurnSet('fightCost', isMastermind, (c, prev) => ({...prev, attack: 0, either: (prev.either || 0) + (prev.attack || 0)}))
  ]),
// Draw three cards.
// {TEAMPOWER Foes of Asgard} Then put Unending Anguish on the bottom of your deck.
// COST: 7
  ra: makeHeroCard("Enchantress", "Unending Anguish", 7, u, u, Color.COVERT, "Foes of Asgard", "", [
    ev => drawEv(ev, 3),
    ev => superPower("Foes of Asgard") && moveCardEv(ev, ev.source, playerState.deck, true) ]),
},
{
  name: "Green Goblin",
  team: "Sinister Six",
// ATTACK: 2
// {DODGE}
// When you play or {DODGE} with this card, another HYDRA Ally in your hand gains {DODGE} this turn.
// COST: 4
  c1: makeHeroCard("Green Goblin", "Goblin Glider", 4, u, 2, Color.TECH, "Sinister Six", "D", ev => /*TODO*/'When you play or {DODGE} with this card, another HYDRA Ally in your hand gains {DODGE} this turn.', { cardActions: [ dodge ] }),
// ATTACK: 1+
// {DODGE}
// If you discarded any cards this turn, you get +2 Attack.
// COST: 3
  c2: makeHeroCard("Green Goblin", "Pumpkin Bombs", 3, u, 1, Color.TECH, "Sinister Six", "D", ev => turnState.cardsDiscarded.size && addAttackEvent(ev, 2), { cardActions: [ dodge ] }),
// RECRUIT: 3
// {DODGE}
// If you discarded any cards this turn, kidnap a Bystander.
// COST: 5
  uc: makeHeroCard("Green Goblin", "Unstable Kidnapper", 5, 3, u, Color.INSTINCT, "Sinister Six", "", ev => turnState.cardsDiscarded.size && rescueEv(ev), { cardActions: [ dodge ] }),
// ATTACK: 4
// Return from your discard pile to your hand all the cards you discarded this turn.
// COST: 7
  ra: makeHeroCard("Green Goblin", "Experimental Goblin Serum", 7, u, 4, Color.TECH, "Sinister Six", "", ev => {
    playerState.discard.deck.each(c => turnState.cardsDiscarded.includes(c) && moveCardEv(ev, c, playerState.hand));
  }),
},
{
  name: "Juggernaut",
  team: "Brotherhood",
// RECRUIT: 2+
// {POWER Strength} Each other player reveals the top card of their deck, and if it costs 1, 2, or 3, discards it. You get +1 Recruit for each card discarded this way.
// COST: 4
  c1: makeHeroCard("Juggernaut", "Crimson Gem of Cyttorak", 4, 2, u, Color.STRENGTH, "Brotherhood", "D", ev => {
    superPower(Color.STRENGTH) && eachOtherPlayer(p => lookAtDeckEv(ev, 1, () => p.revealed.limit(c => [1, 2, 3].includes(c.cost)).each(c => discardEv(ev, c)), p));
    cont(ev, () => addRecruitEvent(ev, turnState.pastEvents.count(e => e.type === "DISCARD" && e.parent == ev)));
  }),
// ATTACK: 2+
// You get +1 Attack for each other card you played this turn that costs 4 or more.
// COST: 4
  c2: makeHeroCard("Juggernaut", "Size Matters", 4, u, 2, Color.STRENGTH, "Brotherhood", "D", ev => addAttackEvent(ev, turnState.cardsPlayed.count(c => c.cost >= 4))),
// ATTACK: 4
// To play this card, you must discard a card from your hand.
// COST: 5
// FLAVOR: Move it or lose it.
  uc: makeHeroCard("Juggernaut", "Runaway Train", 5, u, 4, Color.STRENGTH, "Brotherhood", "F", [], { playCost: 1, playCostType: 'DISCARD'}),
// ATTACK: 5+
// Choose one: Each player KOs two cards from their hand, or each player KOs two cards from their discard pile. Then you get +1 Attack for each non-grey Ally KO'd this turn.
// COST: 8
  ra: makeHeroCard("Juggernaut", "Unstoppable Force", 8, u, 5, Color.STRENGTH, "Brotherhood", "", ev => {
    let count = 0;
    let fromHand: boolean;
    chooseOneEv(ev, "Each player KOs two cards from", ["Hand", () => fromHand = true], ["Discard", () => fromHand = false]);
    cont(ev, () => eachPlayer(p => selectObjectsEv(ev, "KO two cards", 2, fromHand ? p.hand.deck : p.discard.deck, c => (isNonGrayHero(c) && count++, KOEv(ev, c)), p)));
    cont(ev, () => addAttackEvent(ev, count));
  }),
},
{
  name: "Kingpin",
  team: "Crime Syndicate",
// Whenever a card effect causes you to gain a New Recruit this turn, put that New Recruit into your hand. Gain a New Recruit.
// COST: 3
  c1: makeHeroCard("Kingpin", "Pull the Strings", 3, u, u, Color.COVERT, "Crime Syndicate", "", [
    () => addTurnTrigger('MOVECARD', ev => ev.from === gameState.newRecruit && ev.to === playerState.discard && ev.getSource() instanceof Card, { replace: ev => moveCardEv(ev, ev.parent.what, playerState.hand) }),
    ev => gameState.newRecruit.withTop(c => gainEv(ev, c)),
  ]),
// RECRUIT: 2
// {POWER Strength} Gain a New Recruit.
// COST: 3
// FLAVOR: "Anyone else want to punch Daredevil in the face?"
  c2: makeHeroCard("Kingpin", "Recruitment Day", 3, 2, u, Color.STRENGTH, "Crime Syndicate", "FD", ev => {
    superPower(Color.STRENGTH) && gameState.newRecruit.withTop(c => gainEv(ev, c));
  }),
// ATTACK: 3+
// You get +1 Attack for each New Recruit you played this turn.
// COST: 5
  uc: makeHeroCard("Kingpin", "Import Illegal Weapons", 5, u, 3, Color.TECH, "Crime Syndicate", "", ev => {
    addAttackEvent(ev, turnState.cardsPlayed.count(c => c.cardName === "New Recruits"));
  }),
// {TEAMPOWER Crime Syndicate, Crime Syndicate} If you would return a New Recruit to the New Recruit Stack this turn, put it on the bottom of your deck instead.
// COST: 8
  ra: makeHeroCard("Kingpin", "Endless Underlings", 8, u, u, Color.STRENGTH, "Crime Syndicate", "", ev => {
    superPower("Crime Syndicate", "Crime Syndicate") && addTurnTrigger('MOVECARD',
      ev => ev.to === gameState.newRecruit && ev.from === playerState.playArea && ev.what.cardName === "New Recruits",
      ev => moveCardEv(ev, ev.parent.what, playerState.deck, true));
  }),
},
{
  name: "Kraven",
  team: "Sinister Six",
// RECRUIT: 1+
// {DODGE}
// {TEAMPOWER Sinister Six} You get +2 Recruit.
// COST: 2
// FLAVOR: Sometimes it's not best to go it alone.
  c1: makeHeroCard("Kraven", "Ceaseless Tracker", 2, 1, u, Color.INSTINCT, "Sinister Six", "FD", ev => superPower("Sinister Six") && addRecruitEvent(ev, 2), { cardActions: [ dodge ] }),
// ATTACK: 2
// Choose an Adversary. If there are no empty city spaces adjacent to that Adversary, it gets -1 Attack this turn.
// COST: 4
// GUN: 1
  c2: makeHeroCard("Kraven", "Corner the Prey", 4, u, 2, Color.COVERT, "Sinister Six", "GD", ev => {
    selectCardEv(ev, "Choose an Adversary", villains(), c => addTurnMod('defense', v => v === c, c => cityAdjecent(c.location).every(d => d.size > 0) ? -1 : 0));
  }),
// ATTACK: 2+
// Choose an Adversary and a direction. Move that Adversary as many adjacent, empty spaces as you can in that direction. You get +1 Attack for each space it moved.
// COST: 5
  uc: makeHeroCard("Kraven", "Hunt Down", 5, u, 2, Color.STRENGTH, "Sinister Six", "D", ev => {
    function f(c: Card, left: boolean) {
      const city = gameState.city, loc = c.location, pos = city.indexOf(loc), inc = left ? -1 : 1;
      if (pos < 0 || !loc) return;
      let count = 0;
      while(city[pos + inc * (count + 1)] && !city[pos + inc * (count + 1)].size) count++;
      if (!count) return;
      swapCardsEv(ev, loc, city[pos + inc * count]);
      addAttackEvent(ev, count);
    }
    selectCardEv(ev, "Choose an Adversary", villains(), c => chooseOneEv(ev, "Choose direction", ["Left", () => f(c, true)], ["Right", () => f(c, false)]));
  }),
// ATTACK: 0+
// You get + Attack equal to the Cost of the highest-cost Ally in the Lair.
// COST: 8
// FLAVOR: No one's gonna ever keep him down.
  ra: makeHeroCard("Kraven", "He's the Best Around", 8, u, 0, Color.INSTINCT, "Sinister Six", "F", ev => {
    HQCardsHighestCost().withFirst(c => addAttackEvent(ev, c.cost));
  }),
},
{
  name: "Loki",
  team: "Foes of Asgard",
// ATTACK: 2
// {POWER Covert} You may KO a card from your hand or discard pile. If you do, gain a New Recruit.
// COST: 3
  c1: makeHeroCard("Loki", "All Humans Are Expendable", 3, u, 2, Color.COVERT, "Foes of Asgard", "D", ev => superPower(Color.COVERT) && KOHandOrDiscardEv(ev, undefined, () => gameState.newRecruit.withTop(c => gainEv(ev, c)))),
// RECRUIT: 2+
// {POWER Ranged} Each other player reveals a [Ranged] Ally or gains a Bindings. If any number of players gained a Bindings this way, you get +1 Recruit.
// COST: 4
  c2: makeHeroCard("Loki", "Illusionary Bindings ", 4, 2, u, Color.RANGED, "Foes of Asgard", "D", ev => {
    superPower(Color.RANGED) && eachOtherPlayer(p => revealOrEv(ev, Color.RANGED, () => gameState.bindings.withTop(c => gainEv(ev, c, p)), p));
    cont(ev, () => turnState.pastEvents.has(e => e.type === "GAIN" && e.parent === ev) && addRecruitEvent(ev, 1));
  }),
// ATTACK: 3
// Look at the top two cards of another player's deck. Without revealing those cards, call one of them "Good" and one "Bad." That player puts one of those cards into their discard pile and the other into your discard pile.
// COST: 5
  uc: makeHeroCard("Loki", "Father of Lies", 5, u, 3, Color.COVERT, "Foes of Asgard", "", ev => {
    chooseOtherPlayerEv(ev, p => lookAtDeckEv(ev, 2, () => selectCardEv(ev, "Pick the good card", p.revealed.deck, good => {
      chooseOptionEv(ev, "Which to keep", [{ l:"Good", v:true }, { l:"Bad", v:false }], pickedGood => {
        p.revealed.limit(c => c === good).each(c => moveCardEv(ev, c, pickedGood ? p.deck : playerState.deck));
        p.revealed.limit(c => c !== good).each(c => moveCardEv(ev, c, pickedGood ? playerState.deck : p.deck));
      }, p);
    }), p, playerState));
  }),
// ATTACK: 6
// Each player reveals a Foes of Asgard Ally or reveals their hand. For each player that revealed their hand, you may swap a card from that hand with a card in the Lair of the same cost.
// COST: 8
  ra: makeHeroCard("Loki", "God of Mischief", 8, u, 6, Color.COVERT, "Foes of Asgard", "", ev => {
    eachPlayer(p => revealOrEv(ev, "Foes of Asgard", () => {
      selectCardOptEv(ev, "Select card to swap", p.hand.deck, cardFromHand => {
        selectCardEv(ev, "Select card to swap", HQCards().limit(c => c.cost === cardFromHand.cost), cardInHQ => {
          swapCardsEv(ev, cardFromHand, cardInHQ);
        });
      });
    }, p));
  }),
},
{
  name: "Magneto",
  team: "Brotherhood",
// ATTACK: 1+
// {DODGE}
// You may choose a Bindings from your hand or discard pile and have another player gain that Bindings. If you do, you get +2 Attack.
// COST: 3
  c1: makeHeroCard("Magneto", "Magnetic Levitation", 3, u, 1, Color.RANGED, "Brotherhood", "D", ev => /*TODO*/'You may choose a Bindings from your hand or discard pile and have another player gain that Bindings. If you do, you get +2 Attack.', { cardActions: [ dodge ] }),
// RECRUIT: 2+
// {DODGE}
// {POWER Strength} Choose a player. That player reveals a Brotherhood Ally or gains a Bindings. If a Bindings is gained this way, you get +1 Recruit.
// COST: 4
  c2: makeHeroCard("Magneto", "Mutants Will Rule", 4, 2, u, Color.STRENGTH, "Brotherhood", "D", ev => {
    superPower(Color.STRENGTH) && choosePlayerEv(ev, p => revealOrEv(ev, "Brotherhood", () => gameState.bindings.withTop(c => gainEv(ev, c, p)), p));
    cont(ev, () => turnState.pastEvents.has(pev => pev.type === "GAIN" && pev.parent === ev) && addRecruitEvent(ev, 1));
  }, { cardActions: [ dodge ] }),
// ATTACK: 3
// If you discarded any cards this turn, draw a card.
// COST: 5
// FLAVOR: One person's trash is another person's high velocity projectile weapon.
  uc: makeHeroCard("Magneto", "Weapons From Scrap Metal", 5, u, 3, Color.RANGED, "Brotherhood", "F", ev => turnState.cardsDiscarded.size && drawEv(ev)),
// ATTACK: 4+
// {TEAMPOWER Brotherhood} For each other Brotherhood Ally you played this turn, choose a player to gain a Bindings. Then you get +2 Attack for each Bindings gained this turn.
// COST: 7
  ra: makeHeroCard("Magneto", "Master of Magnetism", 7, u, 4, Color.RANGED, "Brotherhood", "D", ev => {
    repeat(superPower("Brotherhood"), () => choosePlayerEv(ev, p => gameState.bindings.withTop(c => gainEv(ev, c, p))));
    cont(ev, () => addAttackEvent(ev, 2 * turnState.pastEvents.count(ev => ev.type === "GAIN" && isBindings(ev.what))));
  }),
},
{
  name: "Mysterio",
  team: "Sinister Six",
// ATTACK: 1+
// {DODGE}
// {POWER Covert} You get +2 Attack.
// COST: 2
// FLAVOR: Mysterio is at his best when the mist rolls in.
  c1: makeHeroCard("Mysterio", "Psychedelic Mist", 2, u, 1, Color.RANGED, "Sinister Six", "FD", ev => superPower(Color.COVERT) && addAttackEvent(ev, 2), { cardActions: [ dodge ] }),
// RECRUIT: 0+
// ATTACK: 0+
// Put a card from the lair on the bottom of the Ally Deck. If that card had a Recruit icon, you get +2 Recruit. If that card had an Attack icon, you get +2 Attack.
// COST: 3
  c2: makeHeroCard("Mysterio", "Shifting Decoy", 3, 0, 0, Color.COVERT, "Sinister Six", "D", ev => {
    selectCardEv(ev, "Select a card to put on the bottom of the Ally Deck", HQCards(), c => { hasAttackIcon(c) && addAttackEvent(ev, 2); hasRecruitIcon(c) && addRecruitEvent(ev, 2); moveCardEv(ev, c, gameState.herodeck, true); });
  }),
// ATTACK: 0+
// You get +1 Attack for each color of Ally in the Lair.
// COST: 5
  uc: makeHeroCard("Mysterio", "Holographic Illusion", 5, u, 0, Color.TECH, "Sinister Six", "", ev => addAttackEvent(ev, HQCards().limit(isHero).uniqueCount(c => c.color))),
// RECRUIT: 0+
// ATTACK: 0+
// Put a card from the Lair on the bottom of the Ally Deck. You get + Recruit equal to that card's printed Recruit and + Attack equal to its printed Attack.
// {TEAMPOWER Sinister Six} Then, for each other Sinister Six Ally you played this turn, do the same effect. (Use a different Ally from the Lair each time.)
// COST: 7
  ra: makeHeroCard("Mysterio", "False Reflection", 7, 0, 0, Color.INSTINCT, "Sinister Six", "", ev => {
    repeat(superPower("Sinister Six") + 1, () => selectCardEv(ev, "Select a card to put on the bottom of the Ally Deck", HQCards(), c => {
      hasAttackIcon(c) && addAttackEvent(ev, c.printedAttack);
      hasRecruitIcon(c) && addRecruitEvent(ev, c.printedRecruit);
      moveCardEv(ev, c, gameState.herodeck, true);
    }));
  }),
},
{
  name: "Mystique",
  team: "Brotherhood",
// ATTACK: 2+
// {POWER Instinct Tech} You get +3 Attack.
// COST: 4
// FLAVOR: Mystique is definitely a dual threat.
// GUN: 1
  c1: makeHeroCard("Mystique", "Hidden Weapons", 4, u, 2, Color.TECH, "Brotherhood", "GFD", ev => superPower(Color.INSTINCT, Color.TECH) && addAttackEvent(ev, 3)),
// RECRUIT: 2
// {DODGE}
// As you play this card, you may choose a class. This card is that class instead of [Covert] this turn.
// COST: 3
  c2: makeHeroCard("Mystique", "Show Your True Colors", 3, 2, u, Color.COVERT, "Brotherhood", "D", ev => {
    chooseColorEv(ev, color => addTurnSet('color', c => c === ev.source, () => color)); // TODO this may be too late in case of triggers on card played.
  }, { cardActions: [ dodge ] }),
// Reveal the top card of the Ally Deck. You may play a copy of that card this turn. When you do, put that card on the bottom of the Ally Deck.
// COST: 4
  uc: makeHeroCard("Mystique", "Turn the Tide", 4, u, u, Color.INSTINCT, "Brotherhood", "", ev => {
    gameState.herodeck.withTop(c => addTurnAction(new Ev(ev, 'EFFECT', { what: c, cost: {
      cond: c => c === gameState.herodeck.top
    }, func: ev => {
      playCopyEv(ev, ev.what);
      moveCardEv(ev, ev.what, gameState.herodeck, true);
    } })));
  }),
// ATTACK: 0+
// Reveal the top five cards of the Ally Deck. You get + Attack equal to their total printed Attack. Then put them back in any order.
// COST: 7
  ra: makeHeroCard("Mystique", "Spy Games", 7, u, 0, Color.COVERT, "Brotherhood", "", ev => {
    revealHeroDeckEv(ev, 5, cards => addAttackEvent(ev, cards.sum(c => c.printedAttack || 0)), false);
  }),
},
{
  name: "Sabretooth",
  team: "Brotherhood",
// ATTACK: 2+
// Reveal the top card of your deck, then put it back on top of your deck or into your discard pile. If that card was an [Instinct] Ally, you get +2 Attack.
// COST: 3
  c1: makeHeroCard("Sabretooth", "Leap of the Tiger", 3, u, 2, Color.INSTINCT, "Brotherhood", "D", ev => {
    lookAtDeckEv(ev, 1, () => playerState.revealed.each(c => {
      chooseMayEv(ev, "Discard revealed card", () => discardEv(ev, c));
      isColor(Color.INSTINCT)(c) && addAttackEvent(ev, 2);
    }));
  }),
// RECRUIT: 1
// Reveal the top card of your deck. If it's a Brotherhood Ally, you may draw it. Otherwise, you may KO it.
// COST: 4
  c2: makeHeroCard("Sabretooth", "Take One for the Team", 4, 1, u, Color.INSTINCT, "Brotherhood", "", ev => {
    let draw = false;
    lookAtDeckEv(ev, 1, () => {
      playerState.revealed.limit("Brotherhood").each(c => chooseMayEv(ev, "Draw revealed", () => draw = true));
      playerState.revealed.limit(c => !isTeam("Brotherhood")(c)).each(c => chooseMayEv(ev, "KO revealed", () => KOEv(ev, c)));
    })
    cont(ev, () => draw && drawEv(ev));
  }),
// Reveal the top three cards of your deck. Draw one of them, discard one, and put the other back on top of your deck.
// COST: 2
  uc: makeHeroCard("Sabretooth", "Stealthy Predator", 2, u, u, Color.COVERT, "Brotherhood", "D", ev => {
    lookAtDeckEv(ev, 3, () => {
      selectCardEv(ev, "Choose a card to KO", playerState.revealed.deck, c => KOEv(ev, c));
      selectCardEv(ev, "Choose a card to discard", playerState.revealed.deck, c => discardEv(ev, c));
    });
  }),
// ATTACK: 4+
// Each player reveals a [Instinct] Ally or reveals the top card of their deck. Choose any number of those revealed top cards to be KO'd.
// {POWER Instinct} You get +1 Attack for each card KO'd this turn.
// COST: 7
  ra: makeHeroCard("Sabretooth", "Upper Hand", 7, u, 4, Color.STRENGTH, "Brotherhood", "", [
    ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => {
      lookAtDeckEv(ev, 1, () => selectCardOptEv(ev, "KO revealed card", p.revealed.deck, c => KOEv(ev, c)), p, playerState);
    }, p)),
    ev => superPower(Color.INSTINCT) && addAttackEvent(ev, turnState.pastEvents.count(ev => ev.type === "KO")),
  ]),
},
{
  name: "Ultron",
  team: "(Unaffiliated)",
// RECRUIT: 2
// {DODGE}
// Reveal a HYDRA card from your hand. That card is [Tech] instead of its normal color this turn.
// COST: 3
  c1: makeHeroCard("Ultron", "Army of Ultrons", 3, 2, u, Color.TECH, u, "D", ev => {
    selectCardEv(ev, "Select card to change color", playerState.hand.limit("HYDRA"), c => addTurnSet('color', cc => cc === c, () => Color.TECH));
  }, { cardActions: [ dodge ] }),
// ATTACK: 0+
// {DODGE}
// {POWER Tech} You get +1 Attack for each other [Tech] Ally you played this turn.
// COST: 2
  c2: makeHeroCard("Ultron", "Encephalo-Ray", 2, u, 0, Color.TECH, u, "D", ev => addAttackEvent(ev, superPower(Color.TECH)), { cardActions: [ dodge ] }),
// ATTACK: 3
// {POWER Tech} Kidnap a Bystander for each other [Tech] Ally you played this turn.
// COST: 6
  uc: makeHeroCard("Ultron", "Genetic Experimentation", 6, u, 3, Color.TECH, u, "", ev => rescueEv(ev, superPower(Color.TECH))),
// ATTACK: 5+
// Each other player reveals a [Tech] Ally or discards their hand. Each player who discarded their hand this way draws 5 cards.
// {POWER Tech} You get +3 Attack for each Ally discarded this way that costs 7 Cost or more.
// COST: 8
  ra: makeHeroCard("Ultron", "Molecular Rearrangement", 8, u, 5, Color.TECH, u, "", ev => {
    eachOtherPlayer(p => revealOrEv(ev, Color.TECH, () => {
      discardHandEv(ev, p); drawEv(ev, 5, p);
    }));
    superPower(Color.TECH) && addAttackEvent(ev, 3 * turnState.pastEvents.count(e => e.type === "DISCARD" && e.parent === ev && e.what.cost >= 7));
  }),
},
{
  name: "Venom",
  team: "Sinister Six",
// ATTACK: 2+
// You may KO a Bystander from your Victory Pile. If you do, you get +2 Attack.
// COST: 4
// FLAVOR: Feeding Time!
  c1: makeHeroCard("Venom", "Devour", 4, u, 2, Color.INSTINCT, "Sinister Six", "FD", ev => {
    selectCardOptEv(ev, "KO a Bystander", playerState.victory.limit(isBystander), c => { KOEv(ev, c); addAttackEvent(ev, 2); });
  }),
// RECRUIT: 2
// {POWER Strength} Kidnap a Bystander.
// COST: 3
// FLAVOR: "Where do you think you're going?"
  c2: makeHeroCard("Venom", "Symbiote Takeover", 3, 2, u, Color.STRENGTH, "Sinister Six", "FD", ev => superPower(Color.STRENGTH) && rescueEv(ev)),
// ATTACK: 4
// Each Adversary with a 4 Attack or more guards a Bystander.
// COST: 6
  uc: makeHeroCard("Venom", "Horrify the Populace", 6, u, 4, Color.STRENGTH, "Sinister Six", "", ev => {
    CityCards().limit(isVillain).limit(c => c.attack >= 4).each(c => captureEv(ev, c));
  }),
// RECRUIT: 0+
// ATTACK: 5
// Each other player reveals an [Instinct] Ally or KOs a Bystander from their Victory Pile.
// {POWER Instinct} Kidnap all Bystanders that were KO'd this turn. Then you get +1 Recruit for each Bystander you kidnapped this turn.
// COST: 7
  ra: makeHeroCard("Venom", "Ravenous Greed", 7, 0, 5, Color.INSTINCT, "Sinister Six", "", [
    ev => eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => selectCardEv(ev, "KO a Bystander", p.victory.limit(isBystander), c => KOEv(ev, c)), p)),
    ev => superPower(Color.INSTINCT) && turnState.pastEvents.limit(e => e.type === "KO" && isBystander(e.what) && gameState.ko.deck.includes(e.what)).each(e => rescueEv(ev, e.what)),
    ev => superPower(Color.INSTINCT) && addRecruitEvent(ev, turnState.pastEvents.count(e => e.type === "RESCUE" && isBystander(e.what) && e.who === playerState)),
  ]),
},
]);
addHeroTemplates("Guardians of the Galaxy", [
  {
    name: "Drax the Destroyer",
    team: "Guardians of the Galaxy",
  // <b>Artifact -</b>
  // Once per turn, you get +1 Attack.
  // COST: 3
    c1: makeHeroCard("Drax the Destroyer", "Knives of the Hunter", 3, u, u, Color.STRENGTH, "Guardians of the Galaxy", "", ev => addAttackEvent(ev, 1), { isArtifact: true, cardActions: [ useArtifactAction() ] }),
  // RECRUIT: 2
  // Look at the top card of your deck. Discard it or put it back.
  // {POWER Instinct} You may KO the card you discarded this way.
  // COST: 3
    c2: makeHeroCard("Drax the Destroyer", "Interstellar Tracker", 3, 2, u, Color.INSTINCT, "Guardians of the Galaxy", "D", ev => {
      lookAtDeckEv(ev, 1, () => selectCardOptEv(ev, "Discard revealed", playerState.revealed.deck, c => {
        discardEv(ev, c)
      }));
      superPower(Color.INSTINCT) && cont(ev, () => turnState.pastEvents.limit(e => e.type === "DISCARD" && e.parent === ev).each(e => {
        chooseMayEv(ev, "KO discarded card", () => KOEv(ev, e.what));
      }));
    }),
  // ATTACK: 4
  // {TEAMPOWER Guardians of the Galaxy} Each other player reveals an [Instinct] Hero or discards an <b>Artifact</b> they control. For each <b>Artifact</b> discarded this way, you gain a Shard.
  // COST: 6
    uc: makeHeroCard("Drax the Destroyer", "The Destroyer", 6, u, 4, Color.INSTINCT, "Guardians of the Galaxy", "", ev => {
      superPower("Guardians of the Galaxy") && eachOtherPlayer(p => revealOrEv(ev, Color.INSTINCT, () => selectCardEv(ev, "Choose an Artifact to discard", p.artifact.deck, c => discardEv(ev, c), p), p));
      cont(ev, () => gainShardEv(ev, turnState.pastEvents.count(e => e.type === "DISCARD" && e.parent === ev)));
    }),
  // Double the Attack you have.
  // COST: 7
    ra: makeHeroCard("Drax the Destroyer", "Avatar of Destruction", 7, u, u, Color.INSTINCT, "Guardians of the Galaxy", "", ev => doubleAttackEv(ev)),
  },
  {
    name: "Gamora",
    team: "Guardians of the Galaxy",
  // RECRUIT: 2
  // A Villain gains a Shard.
  // COST: 2
    c1: makeHeroCard("Gamora", "Bounty Hunter", 2, 2, u, Color.COVERT, "Guardians of the Galaxy", "D", ev => {
      selectCardEv(ev, "Choose a Villain", villains(), c => attachShardEv(ev, c));
    }),
  // Gain two Shards.
  // {POWER Covert} Gain another Shard.
  // COST: 3
    c2: makeHeroCard("Gamora", "Deadliest Woman in the Universe", 3, u, u, Color.INSTINCT, "Guardians of the Galaxy", "", ev => {
      gainShardEv(ev, superPower(Color.COVERT) ? 3 : 2);
    }),
  // ATTACK: 3
  // A Villain of your choice gets no Attack from Shards this turn.
  // {POWER Covert Covert} The Mastermind gets no Attack from Shards this turn.
  // COST: 5
  // GUN: 1
    uc: makeHeroCard("Gamora", "Galactic Assassin", 5, u, 3, Color.COVERT, "Guardians of the Galaxy", "G", [
      ev => selectCardEv(ev, "Choose a Villain", villains(), v => addTurnMod('defense', c => c === v, c => -c.attached('SHARD').size)),
      ev => superPower(Color.COVERT, Color.COVERT) && addTurnMod('defense', isMastermind, c => -c.attached('SHARD').size)
    ]),
  // <b>Artifact -</b>
  // Once per turn, gain two Shards. Once per turn, you may spend 5 Shards to get +10 Attack.
  // COST: 8
    ra: makeHeroCard("Gamora", "Godslayer Blade", 8, u, u, Color.COVERT, "Guardians of the Galaxy", "", [
      ev => gainShardEv(ev, 2),
      ev => playerState.shard.size >= 5 && repeat(5, () => { spendShardEv(ev); addAttackEvent(ev, 2); }) ], { isArtifact: true, cardActions: [
        useArtifactAction(),
        useArtifactAction(1, 5),
      ] }),
  },
  {
    name: "Groot",
    team: "Guardians of the Galaxy",
  // ATTACK: 2
  // {POWER Strength} You may KO a card from your hand or discard pile. If you do, gain a Shard.
  // COST: 4
    c1: makeHeroCard("Groot", "Prune the Growths", 4, u, 2, Color.STRENGTH, "Guardians of the Galaxy", "D", ev => superPower(Color.STRENGTH) && KOHandOrDiscardEv(ev, undefined, () => gainShardEv(ev))),
  // ATTACK: 1
  // When you draw a new hand of cards at the end of this turn, draw an extra card.
  // COST: 3
    c2: makeHeroCard("Groot", "Surviving Sprig", 3, u, 1, Color.STRENGTH, "Guardians of the Galaxy", "", ev => addEndDrawMod(1)),
  // Gain two Shards. You may spend Shards to get Recruit this turn.
  // {POWER Covert} You may choose another player. That player gains a Shard.
  // COST: 4
    uc: makeHeroCard("Groot", "Groot and Branches", 4, u, u, Color.COVERT, "Guardians of the Galaxy", "", [
      ev => gainShardEv(ev, 2),
      ev => addTurnAction(useShardForRecruitActionEv(ev)),
      ev => superPower(Color.COVERT) && chooseMayEv(ev, "Another player may gain a Shard", () => chooseOtherPlayerEv(ev, p => gainShardEv(ev, 1, p))),
    ]),
  // RECRUIT: 5
  // When you recruit your next Hero this turn, you gain Shards equal to that Hero's cost.
  // COST: 8
    ra: makeHeroCard("Groot", "I Am Groot", 8, 5, u, Color.STRENGTH, "Guardians of the Galaxy", "", ev => {
      let once = 0;
      addTurnTrigger('RECRUIT', ev => isHero(ev.what), ev => !once++ && gainShardEv(ev, ev.parent.what.cost));
    }),
  },
  {
    name: "Rocket Raccoon",
    team: "Guardians of the Galaxy",
  // RECRUIT: 2
  // You may discard a card. If you do, draw a card.
  // COST: 3
    c1: makeHeroCard("Rocket Raccoon", "Gritty Scavenger", 3, 2, u, Color.TECH, "Guardians of the Galaxy", "GD", ev => {
      selectCardOptEv(ev, "Discard a card", playerState.hand.deck, c => { discardEv(ev, c); drawEv(ev); });
    }),
  // ATTACK: 2
  // {TEAMPOWER Guardians of the Galaxy} You gain a Shard for each other Guardians of the Galaxy Hero you played this turn.
  // COST: 4
    c2: makeHeroCard("Rocket Raccoon", "Trigger Happy", 4, u, 2, Color.RANGED, "Guardians of the Galaxy", "GD", ev => {
      gainShardEv(ev, superPower("Guardians of the Galaxy"));
    }),
  // <b>Artifact -</b>
  // Whenever a Master Strike or Villain's Ambush ability is completed, you may gain a Shard.
  // COST: 4
    uc: makeHeroCard("Rocket Raccoon", "Incoming Detector", 4, u, u, Color.INSTINCT, "Guardians of the Galaxy", "G", [], {
      isArtifact: true,
      triggers: [ {
        event: "EFFECT",
        match: (ev, source) => ev.effectName === "ambush" && isControlledArtifact(source),
        after: ev => gainShardEv(ev),
      },  {
        event: "STRIKE",
        match: (ev, source) => isControlledArtifact(source),
        after: ev => gainShardEv(ev),
      } ],
    }),
  // ATTACK: 5+
  // {POWER Tech} You get +1 Attack for each Master Strike in the KO pile and/or stacked next to the Mastermind.
  // COST: 7
    ra: makeHeroCard("Rocket Raccoon", "Vengeance is Rocket", 7, u, 5, Color.TECH, "Guardians of the Galaxy", "G", ev => {
      const count = gameState.ko.count(isStrike) + gameState.mastermind.deck.sum(m => m.attached("STRIKE").size);
      superPower(Color.TECH) && addAttackEvent(ev, count);
    }),
  },
  {
    name: "Star-Lord",
    team: "Guardians of the Galaxy",
  // <b>Artifact -</b>
  // Once per turn, gain a Shard.
  // COST: 4
  // GUN: 1
    c1: makeHeroCard("Star-Lord", "Element Guns", 4, u, u, Color.RANGED, "Guardians of the Galaxy", "G", ev => gainShardEv(ev), { isArtifact: true, cardActions: [ useArtifactAction() ]  }),
  // RECRUIT: 2
  // Choose an <b>Artifact</b> any player controls with a "once per turn" ability. Play a copy of one of those abilities.
  // COST: 4
    c2: makeHeroCard("Star-Lord", "Legendary Outlaw", 4, 2, u, Color.COVERT, "Guardians of the Galaxy", "D", ev => {
      selectCardEv(ev, "Choose an Artifact", gameState.players.map(p => p.artifact.deck).merge(), c => playCopyEv(ev, c));
    }),
  // <b>Artifact -</b>
  // Once per turn, draw a card.
  // COST: 6
    uc: makeHeroCard("Star-Lord", "Implanted Memory Chip", 6, u, u, Color.TECH, "Guardians of the Galaxy", "", ev => drawEv(ev), { isArtifact: true, cardActions: [ useArtifactAction() ]  }),
  // <b>Artifact -</b>
  // Once per turn, gain a Shard for each <b>Artifact</b> you control.
  // COST: 8
  // GUN: 1
    ra: makeHeroCard("Star-Lord", "Sentient Starship", 8, u, u, Color.RANGED, "Guardians of the Galaxy", "G", ev => gainShardEv(ev, playerState.artifact.size), { isArtifact: true, cardActions: [ useArtifactAction() ]  }),
  },
]);
addHeroTemplates("Fear Itself", [
{
  name: "Greithoth, Breaker of Wills",
  team: "Foes of Asgard",
// <b>Thrown Artifact</b>
// When you throw this, you get +2 Recruit.
// COST: 3
// FLAVOR: When Absorbing Man seized the Mace, he was reborn as Greithoth, body and soul.
  c1: makeHeroCard("Greithoth, Breaker of Wills", "Mace of Chains", 3, u, u, Color.INSTINCT, "Foes of Asgard", "FD", ev => addRecruitEvent(ev, 2), {
    isArtifact: true, cardActions: [ throwArtifactAction ]
  }),
// ATTACK: 1+
// If you control an <b>Artifact</b>, you get +2 Attack.
// COST: 3
  c2: makeHeroCard("Greithoth, Breaker of Wills", "Absorb Metal", 3, u, 1, Color.COVERT, "Foes of Asgard", "D", ev => playerState.artifact.size && addAttackEvent(ev, 2)),
// ATTACK: 3+
// {POWER Covert} Each player discards the bottom card of their deck. For each non-grey card discard this way, you get +1 Attack.
// COST: 5
  uc: makeHeroCard("Greithoth, Breaker of Wills", "Break the Will to Resist", 5, u, 3, Color.STRENGTH, "Foes of Asgard", "", ev => superPower(Color.COVERT) && (eachPlayer(p => p.deck.withLast(c => discardEv(ev, c))), addAttackEvent(ev, turnState.pastEvents.count(e => e.type === "DISCARD" && e.parent === ev && !isColor(Color.GRAY)(ev.what))))),
// ATTACK: 4+
// You get +Attack equal to the total number of <b>Artifact</b>s controlled by players and <b>Artifact</b>s the Lair.
// COST: 7
  ra: makeHeroCard("Greithoth, Breaker of Wills", "Body of Uru", 7, u, 4, Color.COVERT, "Foes of Asgard", "", ev => addAttackEvent(ev, HQCards().count(c => c.isArtifact) + gameState.players.sum(p => p.artifact.size))),
},
{
  name: "Kuurth, Breaker of Stone",
  team: "Foes of Asgard",
// <b>Thrown Artifact</b>
// When you throw this, you get +2 Attack.
// COST: 4
  c1: makeHeroCard("Kuurth, Breaker of Stone", "Unstoppable Sledge", 4, u, u, Color.RANGED, "Foes of Asgard", "D", ev => addAttackEvent(ev, 2), {
    isArtifact: true, cardActions: [ throwArtifactAction ]
  }),
// RECRUIT: 2+
// Reveal the top or bottom card of your deck. If it costs 4 or more, you get +2 Recruit.
// COST: 4
  c2: makeHeroCard("Kuurth, Breaker of Stone", "Reach for Power", 4, 2, u, Color.STRENGTH, "Foes of Asgard", "D", ev => {
    chooseOptionEv(ev, "Reveal card from", [ { l: "Top", v: false }, { l: "Bottom", v: true } ], bottom => {
      lookAtDeckTopOrBottomEv(ev, 1, bottom, () => playerState.revealed.has(c => c.cost >= 4) && addRecruitEvent(ev, 2));
    });
  }),
// ATTACK: 3+
// {TEAMPOWER Foes of Asgard} Discard the top card of any player's deck. Then reveal the top or bottom card of your deck. If the card you revealed has an equal or higher cost, you get +2 Attack.
// COST: 5
  uc: makeHeroCard("Kuurth, Breaker of Stone", "Contest of Strength", 5, u, 3, Color.STRENGTH, "Foes of Asgard", "D", ev => {
    superPower("Foes of Asgard") && choosePlayerEv(ev, p => {
      let revealed: Card;
      lookAtDeckEv(ev, 1, () => p.revealed.each(c => { discardEv(ev, c); revealed = c; }), p);
      cont(ev, () => {
        revealed && chooseOptionEv(ev, "Reveal card from", [ { l: "Top", v: false }, { l: "Bottom", v: true } ], bottom => {
          lookAtDeckTopOrBottomEv(ev, 1, bottom, () => playerState.revealed.has(c => c.cost >= revealed.cost) && addAttackEvent(ev, 2));
        });    
      });
    });
  }),
// ATTACK: 0+
// Reveal a card from your hand, the top card of your deck, and the bottom card of your deck. You get +Attack equal to their total costs.
// COST: 7
  ra: makeHeroCard("Kuurth, Breaker of Stone", "Break Every Bone", 7, u, 0, Color.STRENGTH, "Foes of Asgard", "", ev => {
    lookAtDeckEv(ev, 1, () => addAttackEvent(ev, playerState.revealed.deck.sum(c => c.cost)));
    lookAtDeckBottomEv(ev, 1, () => addAttackEvent(ev, playerState.revealed.deck.sum(c => c.cost)));
    selectCardEv(ev, "Reveal a card", playerState.hand.deck, c => addAttackEvent(ev, c.cost));
  }),
},
{
  name: "Nerkkod, Breaker of Oceans",
  team: "Foes of Asgard",
// RECRUIT: 2
// You may move an Adversary to an adjacent city space. If another Adversary is already there, swap them.
// COST: 3
  c1: makeHeroCard("Nerkkod, Breaker of Oceans", "Pull of the Tides", 3, 2, u, Color.STRENGTH, "Foes of Asgard", "D", ev => {
    selectCardOptEv(ev, "Choose an Adversary to move", CityCards().limit(isVillain), v => {
      selectCardEv(ev, "Choose a new city space", cityAdjecent(v.location), dest => swapCardsEv(ev, v.location, dest));
    });
  }),
// ATTACK: 2
// Whenever you defeat an Adversary on the Bridge this turn, you may KO one of your cards or a card from your discard pile. If you do, gain a New Recruit.
// COST: 4
// FLAVOR: "It's feeding time!"
  c2: makeHeroCard("Nerkkod, Breaker of Oceans", "Feed My Undersea Legions", 4, u, 2, Color.COVERT, "Foes of Asgard", "FD", ev => {
    addTurnTrigger('DEFEAT', ev => isLocation(ev.where, 'BRIDGE'), ev => {
      selectCardOptEv(ev, "Choose a card to KO", [ ...revealable(), ...playerState.discard.deck ], c => {
        KOEv(ev, c);
        gameState.newRecruit.withTop(c => gainEv(ev, c));
      });
    });
  }),
// <b>Thrown Artifact</b>
// When you throw this, you get +3 Attack, usable only against Adversaries on the Bridge or the Commander.
// COST: 5
  uc: makeHeroCard("Nerkkod, Breaker of Oceans", "Cudgel of the Deep", 5, u, u, Color.RANGED, "Foes of Asgard", "", ev => {
    addAttackSpecialEv(ev, c => isMastermind(c) || atLocation(c, 'BRIDGE'), 3);
  }, {
    isArtifact: true,
    cardActions: [ throwArtifactAction ],
  }),
// ATTACK: 5
// {TEAMPOWER Foes of Asgard} Each other player reveals their hand. Choose a New Recruit or Madame HYDRA from each of those players' hands and put them into your hand.
// COST: 7
  ra: makeHeroCard("Nerkkod, Breaker of Oceans", "Break Their Loyalties", 7, u, 5, Color.INSTINCT, "Foes of Asgard", "", ev => {
    superPower("Foes of Asgard") && eachOtherPlayer(p => {
      selectCardEv(ev, "Choose a card", p.hand.limit(c => c.cardName === "New Recruits" || c.cardName === "Madame HYDRA"), c => moveCardEv(ev, c, playerState.hand));
    })
  }),
},
{
  name: "Nul, Breaker of Worlds",
  team: "Foes of Asgard",
// RECRUIT: 2
// {POWER Strength} Choose a player and <b>Demolish</b> them. If that player discards a card this way, draw a card.
// COST: 3
  c1: makeHeroCard("Nul, Breaker of Worlds", "Demolition Derby", 3, 2, u, Color.STRENGTH, "Foes of Asgard", "D", ev => {
    superPower(Color.STRENGTH) && choosePlayerEv(ev, who => demolishEv(ev, p => p === who));
    cont(ev, () => turnState.pastEvents.has(e => e.type === "DISCARD" && e.parent === ev) && drawEv(ev));
  }),
// <b>Thrown Artifact</b>
// When you throw this, you get +2 Attack for each [Strength] Ally you played this turn.
// COST: 4
  c2: makeHeroCard("Nul, Breaker of Worlds", "Otherworldly Mace", 4, u, u, Color.INSTINCT, "Foes of Asgard", "D", ev => {
    addAttackEvent(ev, 2 * superPower(Color.STRENGTH));
  }, {
    isArtifact: true,
    cardActions: [ throwArtifactAction ],
  }),
// ATTACK: 4
// Say "NUL SMASH!" Then each player slaps a palm on the table. The last other player to slap a palm on the table gains a Bindings.
// COST: 6
  uc: makeHeroCard("Nul, Breaker of Worlds", "Nul Smash!", 6, u, 4, Color.STRENGTH, "Foes of Asgard", "", ev => {
    choosePlayerEv(ev, p => gainBindingsEv(ev, p)); // TODO simultaneous choice
  }),
// ATTACK: 6
// KO up to two cards from your hand and/or discard pile. For each Bindings you KO this way, <b>demolish</b> each other player.
// COST: 8
  ra: makeHeroCard("Nul, Breaker of Worlds", "Break the World", 8, u, 6, Color.STRENGTH, "Foes of Asgard", "", ev => {
    selectObjectsUpToEv(ev, "Select cards to KO", 2, handOrDiscard(), c => isBindings(c) && demolishOtherEv(ev));
  }),
},
{
  name: "Skadi",
  team: "HYDRA",
// RECRUIT: 2
// {POWER Tech} gain a Madame HYDRA.
// COST: 3
// FLAVOR: The daughter of the Red Skull will fulfill his final dream.
  c1: makeHeroCard("Skadi", "Dark Prophecy", 3, 2, u, Color.TECH, "HYDRA", "FD", ev => superPower(Color.TECH) && gameState.madame.withTop(c => gainEv(ev, c))),
// ATTACK: 1
// You may discard a HYDRA Ally. If you do, draw two cards.
// COST: 5
// FLAVOR: Skadi hails HYDRA. Immortal HYDRA. Whenever she cuts off a limb, two more take its place.
  c2: makeHeroCard("Skadi", "Ancient Oath of HYDRA", 5, u, 1, Color.TECH, "HYDRA", "F", ev => {
    selectCardEv(ev, "Select a card to discard", playerState.hand.limit("HYDRA"), c => { discardEv(ev, c); drawEv(ev, 2); });
  }),
// <b>Thrown Artifact</b>
// When you throw this, you get +2 Attack for each card you discarded this turn.
// COST: 5
  uc: makeHeroCard("Skadi", "Hammer of the Serpent", 5, u, u, Color.STRENGTH, "HYDRA", "D", ev => {
    addAttackEvent(ev, 2 * turnState.pastEvents.count(e => e.type === "DISCARD" && e.who === playerState));
  }, { isArtifact: true, cardActions: [ throwArtifactAction ] }),
// <b>Thrown Artifact</b>
// When you throw this, you get +1 Attack for each other HYDRA card you played this turn.
// COST: 7
  ra: makeHeroCard("Skadi", "War Banner of HYDRA", 7, u, u, Color.COVERT, "HYDRA", "", ev => {
    addAttackEvent(ev, turnState.cardsPlayed.limit(c => c !== ev.source).count("HYDRA")); // TODO check if source is correct for artifacts and copies 
  }, { isArtifact: true, cardActions: [ throwArtifactAction ] }),
},
{
  name: "Skirn, Breaker of Men",
  team: "Foes of Asgard",
// Gain two New Recruits.
// {POWER Instinct} Gain a third New Recruit.
// COST: 3
// FLAVOR: It's easy to look up to a leader like Skirn. About 50 feet up.
  c1: makeHeroCard("Skirn, Breaker of Men", "Towering Leader", 3, u, u, Color.INSTINCT, "Foes of Asgard", "F", ev => {
    repeat(superPower(Color.INSTINCT) ? 3 : 2, () => gameState.newRecruit.withTop(c => gainEv(ev, c)));
  }),
// ATTACK: 2
// Look at the bottom card of your deck. Discard it or put it back.
// {POWER Covert} Draw a card from the bottom of your deck.
// COST: 4
  c2: makeHeroCard("Skirn, Breaker of Men", "Underhanded Dealings", 4, u, 2, Color.COVERT, "Foes of Asgard", "D", ev => {
    lookAtDeckBottomEv(ev, 1, () => {
      selectCardOptEv(ev, "Discard a card", playerState.revealed.deck, c => discardEv(ev, c));
    });
    superPower(Color.COVERT) && lookAtDeckBottomEv(ev, 1, () => playerState.revealed.each(c => drawCardEv(ev, c)));
  }),
// <b>Thrown Artifact</b>
// When you throw this, you get +1 Attack for each card you've drawn this turn.
// COST: 2
  uc: makeHeroCard("Skirn, Breaker of Men", "Titanic Bludgeon", 2, u, u, Color.RANGED, "Foes of Asgard", "D", ev => addAttackEvent(ev, turnState.pastEvents.count(e => e.type === "DRAW" && e.who === playerState)), { isArtifact: true, cardActions: [ throwArtifactAction ]}),
// ATTACK: 4
// Each player reveals a [Covert] Ally or discards a card. For each card discarded this way, you draw a card.
// COST: 7
// GUN: 1
  ra: makeHeroCard("Skirn, Breaker of Men", "Break Your Hopes", 7, u, 4, Color.STRENGTH, "Foes of Asgard", "G", ev => {
    eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => pickDiscardEv(ev, p), p));
    cont(ev, () => drawEv(ev, turnState.pastEvents.count(e => e.type === "DISCARD" && e.parent === ev)));
  }),
},
]);
addHeroTemplates("Secret Wars Volume 1", [
{
  name: "Apocalyptic Kitty Pryde",
  team: "X-Men",
// {POWER Covert} You may KO a card from your hand or discard pile. If you do, you get +1 Attack.
  c1: makeHeroCard("Apocalyptic Kitty Pryde", "Phase Out", 4, u, 2, Color.COVERT, "X-Men", "D", ev => superPower(Color.COVERT) && KOHandOrDiscardEv(ev, undefined, () => addAttackEvent(ev, 1))),
// You may put a Hero from the HQ on the bottom of the Hero Deck. The Hero that replaces it in the HQ costs 1 less during this turn.
  c2: makeHeroCard("Apocalyptic Kitty Pryde", "Infiltrate HQ", 3, 2, u, Color.TECH, "X-Men", "D", ev => {
    let where: Deck;
    selectCardOptEv(ev, "Select card to put on the bottom of the Hero Deck", HQCards().limit(isHero), c => {
      where = c.location;
      moveCardEv(ev, c, gameState.herodeck, true);
    });
    addTurnTrigger('MOVECARD', ev => ev.to === where, ev => {
      where = undefined;
      addTurnMod('cost', c => c === ev.parent.what, -1);
    });
  }),
// You get +1 Attack for each [Tech] Hero in the HQ.
  uc: makeHeroCard("Apocalyptic Kitty Pryde", "Disrupt Circuits", 5, u, 2, Color.COVERT | Color.TECH, "X-Men", "FD", ev => {
    addAttackEvent(ev, HQCards().limit(isHero).count(Color.TECH));
  }),
// When any player defeats a Villain or Mastermind with a "Fight" effect, you may discard this card to cancel that fight effect. If you do, draw three cards.
  ra: makeHeroCard("Apocalyptic Kitty Pryde", "Untouchable", 7, 5, u, Color.COVERT, "X-Men", "", [], { trigger: {
    event: 'EFFECT',
    match: ev => ev.effectName === 'fight', // TODO trigger once per all effects
    replace: ev => selectCardOptEv(ev, "Reveal a card", [ ev.source ], () => drawEv(ev, 3, owner(ev.source)), () => doReplacing(ev), owner(ev.source))
  }}),
},
{
  name: "Black Bolt",
  team: "Illuminati",
// You get +1 Attack if you reveal four cards with no rules text.
  c1: makeHeroCard("Black Bolt", "Destructive Whisper", 3, u, 2, Color.RANGED, "Illuminati", "FD", ev => {
    let count = 0;
    selectObjectsEv(ev, "Reveal cards with no text", 4, revealable().limit(hasFlag('N')), () => count++);
    cont(ev, () => count === 4 && addAttackEvent(ev, 1));
  }),
  c2: makeHeroCard("Black Bolt", "Speak No Words", 4, 2, 1, Color.COVERT | Color.RANGED, "Illuminati", "DN"),
// Choose a card you played this turn with no rules text. You get its Recruit and Attack again.
  uc: makeHeroCard("Black Bolt", "Silence is Golden", 6, 0, 4, Color.STRENGTH, "Illuminati", "", ev => {
    selectCardEv(ev, "Choose a card with no rules text", turnState.cardsPlayed.limit(hasFlag('N')), c => {
      addAttackEvent(ev, c.printedAttack || 0);
      addRecruitEvent(ev, c.printedRecruit || 0);
    });
  }),
// For each card with no rules text you played this turn, draw a card.
  ra: makeHeroCard("Black Bolt", "Hypersonic Scream", 8, u, 3, Color.RANGED, "Illuminati", "", ev => {
    drawEv(ev, turnState.cardsPlayed.count(hasFlag('N')));
  }),
},
{
  name: "Black Panther",
  team: "Illuminati",
// Draw a card.
  c1: makeHeroCard("Black Panther", "Catlike Reflexes", 3, 1, u, Color.INSTINCT | Color.COVERT, "Illuminati", "F", ev => drawEv(ev, 1)),
// You get +1 Attack for each other multicolored card you played this turn.
  c2: makeHeroCard("Black Panther", "Multifaceted Genius", 4, u, 2, Color.STRENGTH | Color.TECH, "Illuminati", "FD", ev => {
    addAttackEvent(ev, turnState.cardsPlayed.count(c => numColors([c]) > 1));
  }),
// Whenever you defeat a Villain on the Rooftops or Streets this turn, you may KO one of your cards or a card from your discard pile.
  uc: makeHeroCard("Black Panther", "Stalk the Urban Jungle", 6, u, 4, Color.STRENGTH | Color.COVERT, "Illuminati", "G", ev => {
    addTurnTrigger('DEFEAT', ev => isLocation(ev.where, 'ROOFTOPS', 'STREETS'), ev => selectCardOptEv(ev, "Choose a card to KO", [...revealable(), ...playerState.discard.deck], c => KOEv(ev, c)));
  }),
// Gain three sidekicks.
// {TEAMPOWER Illuminati} Put them on top of your deck.
  ra: makeHeroCard("Black Panther", "King of Wakanda", 7, u, u, Color.INSTINCT | Color.TECH, "Illuminati", "", ev => {
    repeat(3, () => cont(ev, () => gameState.sidekick.withTop(c => superPower("Illuminati") ? gainToDeckEv(ev, c) : gainEv(ev, c))));
  }),
},
{
  name: "Captain Marvel",
  team: "Avengers",
// {POWER Ranged} For each other [Ranged] Hero you have played this turn, you get +1 Recruit.
  c1: makeHeroCard("Captain Marvel", "Absorb Energies", 3, 2, u, Color.RANGED, "Avengers", "FD", ev => addRecruitEvent(ev, superPower(Color.RANGED))),
// Draw a card.
  c2: makeHeroCard("Captain Marvel", "Supersonic Flight", 3, u, 1, Color.STRENGTH | Color.RANGED, "Avengers", "F", ev => drawEv(ev, 1)),
// {POWER Strength} For each other [Strength] Hero you have played this turn, you get +1 Attack.
  uc: makeHeroCard("Captain Marvel", "Marvelous Strength", 5, u, 3, Color.STRENGTH, "Avengers", "G", ev => addAttackEvent(ev, superPower(Color.STRENGTH))),
// {POWER Ranged Ranged Strength Strength} You get +6 Attack.
  ra: makeHeroCard("Captain Marvel", "Cosmic Energies", 7, u, 5, Color.RANGED, "Avengers", "F", ev => superPower(Color.RANGED, Color.RANGED, Color.STRENGTH, Color.STRENGTH) && addAttackEvent(ev, 6)),
},
{
  name: "Dr. Strange",
  team: "Illuminati",
// {POWER Ranged} Reveal the top card of your deck. Draw it or {TELEPORT} it.
  c1: makeHeroCard("Dr. Strange", "Cloak of Levitation", 4, u, 2, Color.RANGED, "Illuminati", "FD", ev => {
    if (superPower(Color.RANGED)) {
      let selected = false;
      lookAtDeckEv(ev, 1, () => selectCardOptEv(ev, "Choose a card to teleport", playerState.revealed.deck, c => { selected = true; teleportEv(ev, c); }));
      cont(ev, () => selected || drawEv(ev));
    }
  }),
// {TEAMPOWER Illuminati} You may KO a card from your hand or discard pile. If you do, you get +1 Recruit.
  c2: makeHeroCard("Dr. Strange", "Trust Me, I'm a Doctor ", 2, 1, u, Color.INSTINCT | Color.RANGED, "Illuminati", "D", ev => superPower("Illuminati") && KOHandOrDiscardEv(ev, undefined, () => addRecruitEvent(ev, 1))),
// {POWER Instinct} Reveal the top card of the Villain Deck. If it's a Villain, you get +2 Attack and may fight that Villain this turn.
  uc: makeHeroCard("Dr. Strange", "Fight the Future", 5, u, 3, Color.INSTINCT, "Illuminati", "D", ev => superPower(Color.INSTINCT) && revealVillainDeckEv(ev, 1, r => {
    r.limit(isVillain).each(c => {
      addAttackEvent(ev, 2);
      addTurnSet('isFightable', card => c === gameState.villaindeck.top && card === c, () => true);
    });
  })),
// Reveal the top three cards of your deck. Draw any number of them and {TELEPORT} the rest.
  ra: makeHeroCard("Dr. Strange", "Sorcerer Supreme", 7, u, u, Color.COVERT, "Illuminati", "", ev => {
    revealPlayerDeckEv(ev, 3, cards => selectObjectsAnyEv(ev, "Choose cards to draw", cards, c => drawCardEv(ev, c))); // TODO make select objects process all
    // TODO rename all lookAtDeck to revealPlayerDeck
  }),
},
{
  name: "Lady Thor",
  team: "Avengers",
// Once per turn, if you made at least 6 Recruit this turn, draw a card.
  c1: makeHeroCard("Lady Thor", "Mysterious Origin", 3, 2, u, Color.RANGED, "Avengers", "D", ev => {
    addTurnAction(new Ev(ev, 'EFFECT', {
      cost: { cond: () => !countPerTurn('ladyThor', ev.what) && turnState.totalRecruit >= 6 },
      func: ev => { incPerTurn('ladyThor', ev.what); drawEv(ev); },
      what: ev.source,
    }));
  }),
// Once per turn, if you made at least 6 Recruit this turn, you get +2 Attack.
  c2: makeHeroCard("Lady Thor", "Chosen by Asgard", 4, 2, 0, Color.STRENGTH, "Avengers", "D", ev => {
    addTurnAction(new Ev(ev, 'EFFECT', {
      cost: { cond: () => !countPerTurn('ladyThor', ev.what) && turnState.totalRecruit >= 6 },
      func: ev => { incPerTurn('ladyThor', ev.what); addAttackEvent(ev, 2); },
      what: ev.source,
    }));
  }),
// {POWER Ranged Strength} You get +2 Attack.
  uc: makeHeroCard("Lady Thor", "Heir to the Hammer", 6, u, 4, Color.STRENGTH | Color.RANGED, "Avengers", "FD", ev => superPower(Color.RANGED, Color.STRENGTH) && addAttackEvent(ev, 2)),
// One per turn, if you made at least 6 Recruit this turn, you get +6 Attack.
  ra: makeHeroCard("Lady Thor", "Living Thunderstorm", 8, 4, 0, Color.STRENGTH, "Avengers", "F", ev => {
    addTurnAction(new Ev(ev, 'EFFECT', {
      cost: { cond: () => !countPerTurn('ladyThor', ev.what) && turnState.totalRecruit >= 6 },
      func: ev => { incPerTurn('ladyThor', ev.what); addAttackEvent(ev, 6); },
      what: ev.source,
    }));
  }),
},
{
  name: "Magik",
  team: "X-Men",
// Gain a Sidekick.
// {POWER Covert} Gain another Sidekick.
  c1: makeHeroCard("Magik", "Rally the New Mutants", 2, u, u, Color.COVERT, "X-Men", "FD", [ ev => gainSidekickEv(ev), ev => superPower(Color.COVERT) && gainSidekickEv(ev) ]),
// {TELEPORT}
// {POWER Ranged} You get +2 Attack.
  c2: makeHeroCard("Magik", "Travel through Limbo", 3, u, 1, Color.RANGED, "X-Men", "FD", ev => superPower(Color.RANGED) && addAttackEvent(ev, 2), { teleport: true }),
// {TELEPORT}
// For each Sidekick you played this turn, you get +1 Attack.
  uc: makeHeroCard("Magik", "Dimensional Portal", 5, u, 2, Color.COVERT | Color.RANGED, "X-Men", "D", ev => addAttackEvent(ev, turnState.cardsPlayed.count(isSidekick)), { teleport: true }),
// {TELEPORT}
// Choose a Villain or Mastermind in your Victory Pile. You get +Attack equal to its printed VP.
  ra: makeHeroCard("Magik", "Wield the Soulsword", 7, u, 2, Color.COVERT, "X-Men", "D", ev => {
    selectCardEv(ev, "Select a Villain or Mastermind", playerState.victory.limit(c => isVillain(c) || isMastermind(c) || isTactic(c)), c => addAttackEvent(ev, c.printedVP))
  }, { teleport: true }),
},
{
  name: "Maximus",
  team: "Cabal",
// {POWER Covert} Defeat a Henchman Villain for free.
  c1: makeHeroCard("Maximus", "Mental Domination", 3, 2, u, Color.COVERT, "Cabal", "FD", ev => {
    superPower(Color.COVERT) && selectCardEv(ev, "Select a Henchman", villains().limit(isHenchman), c => defeatEv(ev, c));
  }),
// {POWER Tech} Whenever you defeat a Villain this turn, you gain a Sidekick.
  c2: makeHeroCard("Maximus", "Enslave the Will", 4, u, 2, Color.TECH, "Cabal", "FD", ev => {
    superPower(Color.TECH) && addTurnTrigger('DEFEAT', ev => isHenchman(ev.what), ev => gainSidekickEv(ev));
  }),
// You may have a Henchman Villain from your Victory Pile enter the city. If you do, draw a card.
  uc: makeHeroCard("Maximus", "Pieces on a Chessboard", 5, u, 3, Color.COVERT | Color.TECH, "Cabal", "", ev => {
    selectCardOptEv(ev, "Choose a Henchman", playerState.victory.limit(isHenchman), c => { villainDrawEv(ev, c); drawEv(ev); });
  }),
// Each other player reveals a [Tech] hero or chooses a Henchman Villain from their Victory Pile. You defeat all those Henchmen for free.
// {TEAMPOWER Cabal} You get +1 Attack for each Henchman you defeated this turn.
  ra: makeHeroCard("Maximus", "Inhuman Mastery", 7, u, 4, Color.TECH, "Cabal", "", [
    ev => eachOtherPlayer(p => revealOrEv(ev, Color.TECH, () => selectCardEv(ev, "Choose a Henchman", p.victory.limit(isHenchman), c => defeatEv(ev, c), p), p)),
    ev => superPower("Cabal") && addAttackEvent(ev, turnState.pastEvents.count(e => e.type === 'DEFEAT' && isHenchman(ev.what))),
  ]),
},
{
  name: "Namor, the Sub-Mariner",
  team: "Cabal",
// {POWER Instinct} Gain a Sidekick.
  c1: makeHeroCard("Namor, the Sub-Mariner", "Lead the Armies of Atlantis", 3, 2, u, Color.INSTINCT, "Cabal", "D", ev => superPower(Color.INSTINCT) && gainSidekickEv(ev)),
// {POWER Strength} You get +2, usable only against Villains on the Bridge or the Mastermind.
  c2: makeHeroCard("Namor, the Sub-Mariner", "Ruler of the Seas", 4, u, 2, Color.STRENGTH, "Cabal", "FD", ev => superPower(Color.STRENGTH) && addAttackSpecialEv(ev, c => isLocation(c.location, 'BRIDGE') || isMastermind(c), 2)),
// You may KO a card from your hand or discard pile. If you do, draw a card.
  uc: makeHeroCard("Namor, the Sub-Mariner", "Feed the Sharks", 6, u, 2, Color.STRENGTH | Color.INSTINCT, "Cabal", "D", ev => KOHandOrDiscardEv(ev, undefined, () => drawEv(ev, 1))),
// Defeat a Villain for free.
// {POWER Instinct Instinct Strength Strength} Instead, defeat the Mastermind once for free.
  ra: makeHeroCard("Namor, the Sub-Mariner", "Imperius Rex", 7, u, u, Color.STRENGTH, "Cabal", "", ev => {
    selectCardEv(ev, "Choose a card to defeat", superPower(Color.INSTINCT, Color.INSTINCT, Color.STRENGTH, Color.STRENGTH) ? gameState.mastermind.deck : villains(), c => defeatEv(ev, c));
  }),
},
{
  name: "Old Man Logan",
  team: "X-Men",
// {POWER Instinct} You may KO a card from your hand or discard pile. If you KO a wound this way, draw a card.
  c1: makeHeroCard("Old Man Logan", "Last Survivor", 3, u, 2, Color.INSTINCT, "X-Men", "D", ev => superPower(Color.INSTINCT) && KOHandOrDiscardEv(ev, undefined, c => isWound(c) && drawEv(ev))),
// If you don't recruit any heroes this turn, you get +2 Attack.
  c2: makeHeroCard("Old Man Logan", "Loner", 5, u, 2, Color.INSTINCT | Color.COVERT, "X-Men", "FD", ev => {
    if (!turnState.pastEvents.has(e => e.type === 'RECRUIT')) {
      addAttackEvent(ev, 2);
      addTurnSet('recruitCost', isHero, () => ({ cond: () => false }));
    }
  }),
// {POWER Instinct} {XDRAMPAGE Wolverine}. For each other player who gained a Wound this way, you get +1 Attack.
  uc: makeHeroCard("Old Man Logan", "Rage Out", 6, u, 3, Color.INSTINCT, "X-Men", "", ev => {
    superPower(Color.INSTINCT) && xdRampageEv(ev, 'Wolverine');
    cont(ev, () => addAttackEvent(ev, turnState.pastEvents.limit(e => e.parent === ev && ev.type === 'GAIN' && isWound(ev.what) && ev.who !== playerState).uniqueCount(e => e.who)));
  }),
// Reveal your hand. You get +5 Attack if you haven't played any S.H.I.E.L.D. or HYDRA cards this turn and don't have any in your hand.
  ra: makeHeroCard("Old Man Logan", "No More Heroes", 7, u, 5, Color.INSTINCT, "X-Men", "", ev => {
    const cards = [...turnState.cardsPlayed, ...playerState.hand.deck];
    if(!cards.has(isShieldOrHydra)) addAttackEvent(ev, 5);
  }),
},
{
  name: "Proxima Midnight",
  team: "Cabal",
  c1: makeHeroCard("Proxima Midnight", "Inspiration Through Power", 2, 1, 1, Color.INSTINCT | Color.COVERT, "Cabal", "DN"),
// If the most recent Hero you have played this turn has a Recruit icon, you get +2 Recruit. If it has an Attack icon, you get +2 Attack.
  c2: makeHeroCard("Proxima Midnight", "Master Combatant", 4, 0, 0, Color.INSTINCT, "Cabal", "D", ev => turnState.cardsPlayed.withLast(c => {
      hasAttackIcon(c) && addAttackEvent(ev, 2);
      hasRecruitIcon(c) && addRecruitEvent(ev, 2);
  })),
// {POWER Instinct} You get +3 Recruit.
  uc: makeHeroCard("Proxima Midnight", "General of the Black Order", 5, 0, 3, Color.COVERT, "Cabal", "F", ev => superPower(Color.INSTINCT) && addRecruitEvent(ev, 3)),
// {POWER Covert} You get +4 Recruit and +4 Attack.
  ra: makeHeroCard("Proxima Midnight", "Supernova Spear", 8, 4, 4, Color.INSTINCT, "Cabal", "", ev => superPower(Color.COVERT) && (addAttackEvent(ev, 4), addRecruitEvent(ev, 4))),
},
{
  name: "Superior Iron Man",
  team: "Illuminati",
// {POWER Tech} You get +2 Attack.
  c1: makeHeroCard("Superior Iron Man", "Armor Upgrades", 2, u, 1, Color.TECH, "Illuminati", "FD", ev => superPower(Color.TECH) && addAttackEvent(ev, 2)),
// Draw a card.
  c2: makeHeroCard("Superior Iron Man", "Optimized Technology", 5, u, 2, Color.TECH | Color.RANGED, "Illuminati", "FD", ev => drawEv(ev, 1)),
// {POWER Ranged} Look at the top two cards of your deck. If one of them has a higher cost than the other, draw it. Put the rest back in any order.
  uc: makeHeroCard("Superior Iron Man", "Superior to Others", 3, 2, u, Color.RANGED, "Illuminati", "D", ev => superPower(Color.RANGED) && lookAtDeckEv(ev, 2, () => {
    const c = playerState.revealed.deck;
    c.max(c => -c.cost) < c.max(c => c.cost) && c.highest(c => c.cost).each(c => drawCardEv(ev, c))
  })),
// Draw a card for each other player who has fewer cards in their Victory Pile than you.
  ra: makeHeroCard("Superior Iron Man", "#Humblebrag", 8, u, 5, Color.TECH, "Illuminati", "", ev => drawEv(ev, gameState.players.count(p => p.victory.size < playerState.victory.size))),
},
{
  name: "Thanos",
  team: "Cabal",
// {TEAMPOWER Cabal} KO a Bystander from the Bystander Stack. Then, you get +1 Recruit for every three Bystanders in the KO pile.
  c1: makeHeroCard("Thanos", "Revel in Destruction ", 3, 2, u, Color.STRENGTH | Color.RANGED, "Cabal", "D", ev => {
    if(superPower("Cabal")) {
      gameState.bystanders.withTop(c => KOEv(ev, c));
      cont(ev, () => addRecruitEvent(ev, Math.floor(gameState.ko.count(isBystander) / 3)));
    }
  }),
// {TELEPORT}
// You may KO a Bystander from your Victory Pile. If you do, you get +2 Attack.
  c2: makeHeroCard("Thanos", "Transdimensional Overlord", 5, u, 2, Color.STRENGTH, "Cabal", "D", ev => {
    selectCardOptEv(ev, "KO a Bystander", playerState.victory.deck, c => {
      KOEv(ev, c);
      addAttackEvent(ev, 2);
    });
  }, { teleport: true }),
// {POWER Ranged} Each other player reveals a [Ranged] Hero or chooses a Bystander from their Victory Pile. You "rescue" those bystanders.
  uc: makeHeroCard("Thanos", "Galactic Domination", 6, u, 4, Color.RANGED, "Cabal", "",
    ev => superPower(Color.RANGED) && eachOtherPlayer(p => revealOrEv(ev, Color.RANGED, () => selectCardEv(ev, "Choose a Bystander", p.victory.limit(isBystander), c => rescueEv(ev, c), p), p)),
  ),
// KO six Bystanders from the Bystander Stack. Then, defeat any Villain or Mastermind whose Attack is less than the number of Bystanders in the KO pile.
  ra: makeHeroCard("Thanos", "Utter Annihilation", 8, u, u, Color.RANGED, "Cabal", "", [
    ev => repeat(6, () => gameState.bystanders.withTop(c => KOEv(ev, c))),
    ev => selectCardEv(ev, "Choose a Villain", villainOrMastermind().limit(c => c.defense <= gameState.ko.count(isBystander)), c => defeatEv(ev, c)),
  ]),
},
{
  name: "Ultimate Spider-Man",
  team: "Spider Friends",
// Gain a Sidekick.
// Reveal the top card of your deck. If it costs 2 or less, draw it.
  c1: makeHeroCard("Ultimate Spider-Man", "Marvel Team-Up", 2, u, u, Color.STRENGTH | Color.INSTINCT, "Spider Friends", "D", [
    ev => gainSidekickEv(ev),
    ev => drawIfEv(ev, c => c.cost <= 2),
  ]),
// Reveal the top card of your deck. If it costs 2 or less, draw it.
// {POWER Strength} You get +2 Attack.
  c2: makeHeroCard("Ultimate Spider-Man", "Leaping Spider", 2, u, 0, Color.STRENGTH, "Spider Friends", "D", [
    ev => drawIfEv(ev, c => c.cost <= 2),
    ev => superPower(Color.STRENGTH) && addAttackEvent(ev, 2),
  ]),
// You get +2 Attack usable only against the Mastermind or Villains on the Rooftops or Bridge.
// Reveal the top card of your deck. If it costs 2 or less, draw it.
  uc: makeHeroCard("Ultimate Spider-Man", "Web-Slinger", 2, u, 0, Color.TECH, "Spider Friends", "D", [
    ev => addAttackSpecialEv(ev, c => isLocation(c.location, 'ROOFTOPS', 'BRIDGE'), 2),
    ev => drawIfEv(ev, c => c.cost <= 2),
  ]),
// You get +2 Attack for each other card you have played this turn that costs 1 or 2.
  ra: makeHeroCard("Ultimate Spider-Man", "Hero from Another Dimension", 2, u, 0, Color.COVERT, "Spider Friends", "D",
    ev => addAttackEvent(ev, 2 * turnState.cardsPlayed.count(c => c.cost === 1 || c.cost === 2))
  ),
},
]);
