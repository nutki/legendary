"use strict";
addHeroTemplates("Legendary", [
{
  name: "Black Widow",
  team: "Avengers",
// ATTACK: 2
// {POWER Covert} You may KO a card from your hand or discard pile. If you do, rescue a Bystander.
// COST: 3
  c1: makeHeroCard("Black Widow", "Dangerous Rescue", 3, u, 2, Color.COVERT, "Avengers", "GD", ev => { if (superPower(Color.COVERT)) KOHandOrDiscardEv(ev, undefined, ev => rescueEv(ev)); }),
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
  c1: makeHeroCard("Captain America", "Avengers Assemble!", 3, 0, u, Color.INSTINCT, "Avengers", "", ev => addRecruitEvent(ev, numColorsYouHave())),
// ATTACK: 0+
// You get +1 Attack for each color of Hero you have.
// COST: 4
  c2: makeHeroCard("Captain America", "Perfect Teamwork", 4, u, 0, Color.STRENGTH, "Avengers", "", ev => addAttackEvent(ev, numColorsYouHave())),
// ATTACK: 4
// If you would gain a Wound, you may reveal this card and draw a card instead.
// COST: 6
  uc: makeHeroCard("Captain America", "Diving Block", 6, u, 4, Color.TECH, "Avengers", "", [], { trigger: {
    event: "GAIN",
    match: (ev, source) => isWound(ev.what) && owner(<Card>source) === ev.who,
    replace: ev => selectCardOptEv(ev, "Reveal a card", [ ev.source ], () => drawEv(ev), () => pushEvents(ev.replacing), owner(ev.source))
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
  c1: makeHeroCard("Deadpool", "Here, Hold This for a Second", 3, 2, u, Color.TECH, undefined, "GFD", ev => selectCardEv(ev, "Choose a Villain", villains(), sel => captureEv(ev, sel))),
// ATTACK: 2+
// You get +1 Attack for each other Hero with an odd-numbered Cost you played this turn.
// COST: 5
  c2: makeHeroCard("Deadpool", "Oddball", 5, u, 2, Color.COVERT, undefined, "GD", ev => addAttackEvent(ev, turnState.cardsPlayed.limit(c => c.cost % 2 === 1).length)),
// ATTACK: 2
// If this is the first Hero you played this turn, you may discard the rest of your hand and draw four cards.
// COST: 3
  uc: makeHeroCard("Deadpool", "Hey, Can I Get a Do-Over?", 3, u, 2, Color.INSTINCT, undefined, "GD", ev => { if (turnState.cardsPlayed.length === 0) chooseMayEv(
    ev, "Discard hand", () => { discardHandEv(ev); drawEv(ev, 4); }
  ); }),
// ATTACK: 6
// You may gain a Wound to your hand. Then each player passes a card from their hand to the player on their left.
// COST: 7
  ra: makeHeroCard("Deadpool", "Random Acts of Unkindness", 7, u, 6, Color.INSTINCT, undefined, "G", [
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
  c2: makeHeroCard("Hulk", "Unstoppable Hulk", 4, u, 2, Color.INSTINCT, "Avengers", "D", ev => KOHandOrDiscardEv(ev, isWound, ev => addAttackEvent(ev, 2))),
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
  c1: makeHeroCard("Nick Fury", "Battlefield Promotion", 4, u, u, Color.COVERT, "S.H.I.E.L.D.", "G", ev => KOHandOrDiscardEv(ev, "S.H.I.E.L.D.", ev => { if (gameState.officer.top) gainToHandEv(ev, gameState.officer.top); })),
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
  c2: makeHeroCard("Rogue", "Energy Drain", 3, 2, u, Color.COVERT, "X-Men", "D", ev => { if(superPower(Color.COVERT)) KOHandOrDiscardEv(ev, undefined, ev => addRecruitEvent(ev, 1)); }),
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
  c1: makeHeroCard("Wolverine", "Healing Factor", 3, u, 2, Color.INSTINCT, "X-Men", "D", ev => KOHandOrDiscardEv(ev, isWound, ev => drawEv(ev))),
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
    }, () => pushEvents(ev.replacing), owner(ev.source))
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
    match: (ev, source) => isWound(ev.what) && ev.who !== owner(<Card>source),
    replace: ev => selectCardOptEv(ev, "Reveal a card", [ ev.source ], () => {
      gainEv(ev, ev.parent.what, owner(ev.source)); drawEv(ev, 1, owner(ev.source));
    }, () => pushEvents(ev.replacing), owner(ev.source))
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
    if (sel.printedAttack !== undefined) addAttackEvent(ev, 4);
    if (sel.printedRecruit !== undefined) addRecruitEvent(ev, 4);
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
    match: (ev, source) => isWound(ev.what) && owner(<Card>source) === ev.who && (isVillain(ev.getSource()) || isMastermind(ev.getSource()) || isTactic(ev.getSource())),
    replace: ev => revealOrEv(ev, c => c === ev.source, () => pushEvents(ev.replacing), owner(ev.source))
  }, {
    event: "DISCARD",
    match: (ev, source) => owner(<Card>source) === owner(ev.what) && (isVillain(ev.getSource()) || isMastermind(ev.getSource()) || isTactic(ev.getSource())),
    replace: ev => revealOrEv(ev, c => c === ev.source, () => pushEvents(ev.replacing), owner(ev.source))
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
