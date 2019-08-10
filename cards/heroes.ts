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
  ra: makeHeroCard("Black Widow", "Silent Sniper", 7, u, 4, Color.COVERT, "Avengers", "G", ev => selectCardEv(ev, "Defeat an enemey", fightableCards().limit(hasBystander), sel => defeatEv(ev, sel))),
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
  c1: makeHeroCard("Deadpool", "Here, Hold This for a Second", 3, 2, u, Color.TECH, u, "GFD", ev => selectCardEv(ev, "Choose a Villain", cityVillains(), sel => captureEv(ev, sel))),
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
    ["discards a card", () => eachOtherPlayer(p => pickDiscardEv(ev, 1, p))]
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
  ra: makeHeroCard("Nick Fury", "Pure Fury", 8, u, u, Color.TECH, "S.H.I.E.L.D.", "G", ev => selectCardEv(ev, "Defeat a Villain", fightableCards().limit(v => v.defense < gameState.ko.count("S.H.I.E.L.D.")), sel => defeatEv(ev, sel))),
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
    selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
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
    selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
      selectCardEv(ev, "Choose a new city space", cityAdjacent(v.location), dest => swapCardsEv(ev, v.location, dest));
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
    if (superPower(Color.TECH, Color.TECH)) selectCardEv(ev, "Defeat a mastermind", fightableCards().limit(isMastermind), sel => defeatEv(ev, sel));
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
    ev => selectCardOptEv(ev, "Choose a Hero", hqHeroes(), c => moveCardEv(ev, c, gameState.herodeck, true)),
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
  ra: makeHeroCard("Human Torch", "Nova Flame", 8, u, 6, Color.RANGED, "Fantastic Four", "", ev => superPower("Fantastic Four") && addAttackEvent(ev, cityVillains().size)),
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
    event: 'CARDEFFECT',
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
    ev => addTurnTrigger('CARDEFFECT', ev => ev.effectName == 'fight', { replace: ev => chooseMayEv(ev, "Keep fight effect", () => doReplacing(ev)) }),
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
    ev => setFocusEv(ev, 1, () => selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
      selectCardEv(ev, "Choose a new city space", cityAdjacent(v.location), dest => swapCardsEv(ev, v.location, dest));
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
    ev => superPower(Color.TECH) && withCity('ROOFTOPS', rooftops => selectCardOptEv(ev, "Move to Rooftops", cityVillains().limit(c => c.location !== rooftops), c => swapCardsEv(ev, c.location, rooftops))),
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
    ev => selectCardEv(ev, 'Rectuit a Hero for free', hqHeroes(), c => {
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
  c1: makeHeroCard("Green Goblin", "Goblin Glider", 4, u, 2, Color.TECH, "Sinister Six", "D", ev => {
    selectCardEv(ev, "Choose an Ally to gain Dodge", playerState.hand.limit('HYDRA'), c => addTurnAction(dodge(c, ev)));
  }, { trigger: {
    event: 'DODGE',
    match: (ev, source) => source === ev.what,
    after: ev => selectCardEv(ev, "Choose an Ally to gain Dodge", playerState.hand.limit('HYDRA'), c => addTurnAction(dodge(c, ev))),
  }, cardActions: [ dodge ] }),
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
    selectCardEv(ev, "Choose an Adversary", villains(), c => addTurnMod('defense', v => v === c, c => cityAdjacent(c.location).every(d => d.size > 0) ? -1 : 0));
  }),
// ATTACK: 2+
// Choose an Adversary and a direction. Move that Adversary as many adjacent, empty spaces as you can in that direction. You get +1 Attack for each space it moved.
// COST: 5
  uc: makeHeroCard("Kraven", "Hunt Down", 5, u, 2, Color.STRENGTH, "Sinister Six", "D", ev => {
    function f(c: Card, dir: 'adjacentLeft' | 'adjacentRight') {
      let loc = c.location, count = 0;
      while(loc[dir] && loc[dir].isCity && !loc[dir].size) count++, loc = loc[dir];
      if (!count) return;
      swapCardsEv(ev, loc, c.location);
      addAttackEvent(ev, count);
    }
    selectCardEv(ev, "Choose an Adversary", villains(), c => chooseOneEv(ev, "Choose direction", ["Left", () => f(c, 'adjacentLeft')], ["Right", () => f(c, 'adjacentRight')]));
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
  c2: makeHeroCard("Loki", "Illusionary Bindings", 4, 2, u, Color.RANGED, "Foes of Asgard", "D", ev => {
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
        selectCardEv(ev, "Select card to swap", hqCards().limit(c => c.cost === cardFromHand.cost), cardInHQ => {
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
  c1: makeHeroCard("Magneto", "Magnetic Levitation", 3, u, 1, Color.RANGED, "Brotherhood", "D", ev => {
    gameState.players.size > 1 && selectCardOptEv(ev, "Choose a Bindings for another player to gain", handOrDiscard().limit(isBindings), c => {
      chooseOtherPlayerEv(ev, p => gainEv(ev, c, p));
      addAttackEvent(ev, 2);
    });
  }, { cardActions: [ dodge ] }),
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
    selectCardEv(ev, "Select a card to put on the bottom of the Ally Deck", hqCards(), c => { hasAttackIcon(c) && addAttackEvent(ev, 2); hasRecruitIcon(c) && addRecruitEvent(ev, 2); moveCardEv(ev, c, gameState.herodeck, true); });
  }),
// ATTACK: 0+
// You get +1 Attack for each color of Ally in the Lair.
// COST: 5
  uc: makeHeroCard("Mysterio", "Holographic Illusion", 5, u, 0, Color.TECH, "Sinister Six", "", ev => addAttackEvent(ev, hqHeroes().uniqueCount(c => c.color))),
// RECRUIT: 0+
// ATTACK: 0+
// Put a card from the Lair on the bottom of the Ally Deck. You get + Recruit equal to that card's printed Recruit and + Attack equal to its printed Attack.
// {TEAMPOWER Sinister Six} Then, for each other Sinister Six Ally you played this turn, do the same effect. (Use a different Ally from the Lair each time.)
// COST: 7
  ra: makeHeroCard("Mysterio", "False Reflection", 7, 0, 0, Color.INSTINCT, "Sinister Six", "", ev => {
    repeat(superPower("Sinister Six") + 1, () => selectCardEv(ev, "Select a card to put on the bottom of the Ally Deck", hqCards(), c => {
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
    chooseClassEv(ev, color => addTurnSet('color', c => c === ev.source, () => color)); // TODO this may be too late in case of triggers on card played.
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
    revealThreeEv(ev, 'DRAW', 'DISCARD');
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
    cityVillains().limit(c => c.attack >= 4).each(c => captureEv(ev, c));
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
      selectCardEv(ev, "Choose a Villain", cityVillains(), c => attachShardEv(ev, c));
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
        event: "CARDEFFECT",
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
      superPower(Color.TECH) && addAttackEvent(ev, strikerCount(false));
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
    ...thrownArtifact
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
  ra: makeHeroCard("Greithoth, Breaker of Wills", "Body of Uru", 7, u, 4, Color.COVERT, "Foes of Asgard", "", ev => addAttackEvent(ev, hqCards().count(c => c.isArtifact) + gameState.players.sum(p => p.artifact.size))),
},
{
  name: "Kuurth, Breaker of Stone",
  team: "Foes of Asgard",
// <b>Thrown Artifact</b>
// When you throw this, you get +2 Attack.
// COST: 4
  c1: makeHeroCard("Kuurth, Breaker of Stone", "Unstoppable Sledge", 4, u, u, Color.RANGED, "Foes of Asgard", "D", ev => addAttackEvent(ev, 2), {
    ...thrownArtifact
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
    selectCardOptEv(ev, "Choose an Adversary to move", cityVillains(), v => {
      selectCardEv(ev, "Choose a new city space", cityAdjacent(v.location), dest => swapCardsEv(ev, v.location, dest));
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
  }, { ...thrownArtifact }),
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
  c2: makeHeroCard("Nul, Breaker of Worlds", "Otherworldly Maul", 4, u, u, Color.INSTINCT, "Foes of Asgard", "D", ev => {
    addAttackEvent(ev, 2 * superPower(Color.STRENGTH));
  }, { ...thrownArtifact }),
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
  }, { ...thrownArtifact }),
// <b>Thrown Artifact</b>
// When you throw this, you get +1 Attack for each other HYDRA card you played this turn.
// COST: 7
  ra: makeHeroCard("Skadi", "War Banner of HYDRA", 7, u, u, Color.COVERT, "HYDRA", "", ev => {
    addAttackEvent(ev, turnState.cardsPlayed.limit(c => c !== ev.what).count("HYDRA"));
  }, { ...thrownArtifact }),
},
{
  name: "Skirn, Breaker of Men",
  team: "Foes of Asgard",
// Gain two New Recruits.
// {POWER Instinct} Gain a third New Recruit.
// COST: 3
// FLAVOR: It's easy to look up to a leader like Skirn. About 50 feet up.
  c1: makeHeroCard("Skirn, Breaker of Men", "Towering Leader", 3, u, u, Color.INSTINCT, "Foes of Asgard", "F", ev => {
    repeat(superPower(Color.INSTINCT) ? 3 : 2, () => cont(ev, () => gameState.newRecruit.withTop(c => gainEv(ev, c))));
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
  uc: makeHeroCard("Skirn, Breaker of Men", "Titanic Bludgeon", 2, u, u, Color.RANGED, "Foes of Asgard", "D", ev => addAttackEvent(ev, turnState.pastEvents.count(e => e.type === "DRAW" && e.who === playerState)), { ...thrownArtifact}),
// ATTACK: 4
// Each player reveals a [Covert] Ally or discards a card. For each card discarded this way, you draw a card.
// COST: 7
// GUN: 1
  ra: makeHeroCard("Skirn, Breaker of Men", "Break Your Hopes", 7, u, 4, Color.STRENGTH, "Foes of Asgard", "G", ev => {
    eachPlayer(p => revealOrEv(ev, Color.INSTINCT, () => pickDiscardEv(ev, 1, p), p));
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
    selectCardOptEv(ev, "Select card to put on the bottom of the Hero Deck", hqHeroes(), c => {
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
    addAttackEvent(ev, hqHeroes().count(Color.TECH));
  }),
// When any player defeats a Villain or Mastermind with a "Fight" effect, you may discard this card to cancel that fight effect. If you do, draw three cards.
  ra: makeHeroCard("Apocalyptic Kitty Pryde", "Untouchable", 7, 5, u, Color.COVERT, "X-Men", "", [], { trigger: {
    event: 'CARDEFFECT',
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
  c2: makeHeroCard("Dr. Strange", "Trust Me, I'm a Doctor", 2, 1, u, Color.INSTINCT | Color.RANGED, "Illuminati", "D", ev => superPower("Illuminati") && KOHandOrDiscardEv(ev, undefined, () => addRecruitEvent(ev, 1))),
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
    selectCardEv(ev, "Choose a card to defeat", fightableCards().limit(superPower(Color.INSTINCT, Color.INSTINCT, Color.STRENGTH, Color.STRENGTH) ? isMastermind : isVillain), c => defeatEv(ev, c));
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
  c1: makeHeroCard("Thanos", "Revel in Destruction", 3, 2, u, Color.STRENGTH | Color.RANGED, "Cabal", "D", ev => {
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
    ev => selectCardEv(ev, "Choose a Villain", fightableCards().limit(c => c.defense <= gameState.ko.count(isBystander)), c => defeatEv(ev, c)),
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
addHeroTemplates("Secret Wars Volume 2", [
{
  name: "Agent Venom",
  team: "Spider Friends",
// {SPECTRUM} You get +1 Recruit and +1 Attack.
// GUN: 1
  c1: makeHeroCard("Agent Venom", "Multi-Gun", 2, 1, 1, Color.TECH, "Spider Friends", "GFD", ev => spectrumPower() && (addAttackEvent(ev, 1), addRecruitEvent(ev, 1))),
// {WALLCRAWL}
// {PATROL Bank}: If it's empty, you get +2 Recruit. If it's not, you get +2 Attack.
  c2: makeHeroCard("Agent Venom", "Government Payroll", 3, 0, 0, Color.STRENGTH | Color.INSTINCT, "Spider Friends", "D", ev => patrolCity('BANK', () => addRecruitEvent(ev, 2), () => addAttackEvent(ev, 2)), { wallcrawl: true }),
// {WALLCRAWL}
// {PATROL Sewers}: If it's empty, draw a card.
  uc: makeHeroCard("Agent Venom", "Big Slimeportunity", 6, 2, 2, Color.INSTINCT, "Spider Friends", "FD", ev => patrolCity('SEWERS', () => drawEv(ev, 1)), { wallcrawl: true }),
// {WALLCRAWL}
// For each other card you played this turn with a Recruit icon, you get +1 Recruit.
// For each other card you played this turn with a Attack icon, you get +1 Attack.
// (If another card has both Recruit and Attack, you get both bonuses.)
  ra: makeHeroCard("Agent Venom", "Shapeshifting Symbiote", 7, 0, 0, Color.STRENGTH, "Spider Friends", "", [
    ev => addRecruitEvent(ev, turnState.cardsPlayed.count(hasRecruitIcon)),
    ev => addAttackEvent(ev, turnState.cardsPlayed.count(hasAttackIcon)) ], { wallcrawl: true }),
},
{
  name: "Arkon the Magnificent",
  team: "(Unaffiliated)",
// {WALLCRAWL}
// {PATROL Sewers}: If it's empty, you get +1 Recruit.
  c1: makeHeroCard("Arkon the Magnificent", "All-Terrain Barbarian", 3, 2, u, Color.STRENGTH | Color.COVERT, u, "FD", ev => patrolCity('SEWERS', () => addRecruitEvent(ev, 1)), { wallcrawl: true }),
// {SPECTRUM} Draw a card.
  c2: makeHeroCard("Arkon the Magnificent", "Quiver of Thunderbolts", 3, u, 2, Color.RANGED, u, "FD", ev => spectrumPower() && drawEv(ev, 1)),
// {PATROL two adjacent city spaces}:
// If they're both empty, you get +1 Attack.
  uc: makeHeroCard("Arkon the Magnificent", "Warlord of Open Spaces", 5, u, 3, Color.INSTINCT, u, "", ev => {
    selectCardEv(ev, 'Choose an empty city space', gameState.city.limit(d => !d.size), d => cityAdjacent(d).has(d => !d.size) && addAttackEvent(ev, 1))
  }),
// {PATROL Rooftops}: If it's empty, you get +4 Recruit and +4 Attack. If it's not, defeat the Villain there for free.
  ra: makeHeroCard("Arkon the Magnificent", "Lord of Dragons", 7, 0, 0, Color.INSTINCT, u, "",
    ev => patrolCity('ROOFTOPS', () => (addAttackEvent(ev, 4), addRecruitEvent(ev, 4)), c => isVillain(c) && defeatEv(ev, c))
  ),
},
{
  name: "Beast",
  team: "Illuminati",
// Reveal the top card of your deck. If it's [Tech] or [Strength], draw it.
  c1: makeHeroCard("Beast", "Balanced Attack", 3, u, 2, Color.STRENGTH | Color.TECH, "Illuminati", "FD", ev => drawIfEv(ev, Color.TECH | Color.STRENGTH)),
// {WALLCRAWL}
// {PATROL any city space}:
// If it's empty, then the hero in the HQ space under it costs 3 less this turn.
  c2: makeHeroCard("Beast", "Upside-down Thinking", 4, u, u, Color.STRENGTH | Color.TECH, "Illuminati", "", ev => {
    selectCardEv(ev, 'Choose an empty city space', gameState.city.limit(d => !d.size), d => {
      d.above && d.above.limit(isHero).withFirst(hero => addTurnMod('cost', c => c === hero, -3));
    })
  }, { wallcrawl: true }),
// For each other [Strength] card you played this turn, you get +1 Attack.
// For each other [Tech] card you played this turn, you get +1 Attack.
  uc: makeHeroCard("Beast", "Doctor of Beatdown", 6, u, 2, Color.STRENGTH | Color.TECH, "Illuminati", "D", ev => addAttackEvent(ev, turnState.cardsPlayed.count(Color.STRENGTH) + turnState.cardsPlayed.count(Color.TECH))),
// {POWER Strength Strength Tech Tech} Draw three cards.
  ra: makeHeroCard("Beast", "Multi-Variable Smackulus", 8, u, 4, Color.STRENGTH | Color.TECH, "Illuminati", "F", ev => superPower(Color.STRENGTH, Color.STRENGTH, Color.TECH, Color.TECH) && drawEv(ev, 3)),
},
{
  name: "Black Swan",
  team: "Cabal",
// {POWER Ranged} Reveal the top card of the Villain Deck. If it's a Scheme Twist, you get +2 Attack. Otherwise, put it back on the top or bottom.
  c1: makeHeroCard("Black Swan", "Apocalyptic Vision", 3, u, 2, Color.RANGED, "Cabal", "D", ev => superPower(Color.RANGED) && revealVillainDeckEv(ev, 1, cards => {
    cards.has(isTwist) ? addAttackEvent(ev, 2) : chooseMayEv(ev, "Put revealed on the bottom of the Villain Deck", () => cards.each(c => moveCardEv(ev, c, gameState.villaindeck, true)));
  })),
// {POWER Instinct} You may KO a card from your hand or discard pile. If you do, draw a card.
  c2: makeHeroCard("Black Swan", "Witness the End", 5, 2, u, Color.INSTINCT, "Cabal", "FD", ev => superPower(Color.INSTINCT) && KOHandOrDiscardEv(ev, undefined, () => drawEv(ev, 1))),
// Reveal the top three cards of the Villain Deck. Rescue any Bystanders you revealed, then put the rest back in any order.
  uc: makeHeroCard("Black Swan", "Dark Foretelling", 6, u, 4, Color.INSTINCT | Color.RANGED, "Cabal", "", ev => {
    revealVillainDeckEv(ev, 3, cards => cards.limit(isBystander).each(c => rescueEv(ev, c)), false);
  }),
// Reveal the top five cards of the Villain Deck. You get + Attack equal to the printed Victory Point of one of those cards. Put them back in any order.
// {TEAMPOWER Cabal} Instead, you get + Attack for two of those cards.
  ra: makeHeroCard("Black Swan", "Telepathic Control", 7, u, 0, Color.COVERT, "Cabal", "", ev => {
    revealVillainDeckEv(ev, 5, cards => selectObjectsEv(ev, "Select cards to gain Attack", superPower("Cabal") ? 2 : 1, cards, c => addAttackEvent(ev, c.vp)));
  }),
},
{
  name: "The Captain and the Devil",
  team: "Avengers",
// {SPECTRUM} you get +2 Recruit.
  c1: makeHeroCard("The Captain and the Devil", "Jurassic America", 2, 1, u, Color.STRENGTH | Color.TECH, "Avengers", "FD", ev => spectrumPower() && addRecruitEvent(ev, 2)),
// {SPECTRUM} You get +2 Attack.
  c2: makeHeroCard("The Captain and the Devil", "Patriotic Chomp", 4, u, 2, Color.INSTINCT, "Avengers", "FD", ev => spectrumPower() && addAttackEvent(ev, 2)),
// {PATROL Streets}: If it's empty, you may KO a card from your hand or discard pile.
  uc: makeHeroCard("The Captain and the Devil", "Feeding Grounds", 6, u, 3, Color.COVERT, "Avengers", "F", ev => patrolCity('STREETS', () => KOHandOrDiscardEv(ev, undefined))),
// Whenever you defeat a Villain this turn, each Villain and Mastermind adjacent to it gets -2 Attack this turn.
  ra: makeHeroCard("The Captain and the Devil", "Dino-Roar of Triumph", 8, u, 6, Color.RANGED, "Avengers", "D", ev => {
    addTurnTrigger('DEFEAT', undefined, ev => cityAdjacent(ev.parent.where).each(l => l.limit(isEnemy).each(v => addTurnMod('defense', c => v === c, -2))));
  }),
},
{
  name: "Captain Britain",
  team: "Illuminati",
// You get +1 Attack for each different team icon among your heroes.
  c1: makeHeroCard("Captain Britain", "Combined Strength", 4, u, 0, Color.STRENGTH, "Illuminati", "F", ev => {
    addAttackEvent(ev, yourHeroes().limit(c => c.team !== undefined).uniqueCount(c => c.team));
  }),
// You get +1 Recruit for each different team icon among your heroes.
  c2: makeHeroCard("Captain Britain", "Transatlantic Savior", 3, 0, u, Color.COVERT, "Illuminati", "", ev => {
    addRecruitEvent(ev, yourHeroes().limit(c => c.team !== undefined).uniqueCount(c => c.team));
  }),
// {PATROL Rooftops}: If it's empty, reveal the top two cards of your deck. If they have different team icons, draw them. Otherwise, put them back in any order.
  uc: makeHeroCard("Captain Britain", "Raise the Union Jack", 5, u, 2, Color.STRENGTH | Color.COVERT, "Illuminati", "D", ev => {
    patrolCity('ROOFTOPS', () => revealPlayerDeckEv(ev, 2, cards => {
      cards.limit(c => c.team !== undefined).uniqueCount(c => c.team) === 2 && cards.each(c => drawCardEv(ev, c));
    }));
  }),
// When you draw a new hand of cards at the end of this turn, draw three extra cards.
  ra: makeHeroCard("Captain Britain", "Lead the Captain Britain Corps", 7, u, u, Color.STRENGTH, "Illuminati", "", ev => addEndDrawMod(3)),
},
{
  name: "Corvus Glaive",
  team: "Cabal",
// KO a Bystander from the Bystander Deck. If it's a Special Bystander, you may use its Rescue effect.
  c1: makeHeroCard("Corvus Glaive", "Culling Blade", 3, u, 2, Color.INSTINCT, "Cabal", "FD", ev => gameState.bystanders.withTop(c => {
    KOEv(ev, c);
    c.rescue && chooseMayEv(ev, "Use rescue effect", () => pushEffects(ev, c, 'rescue', c.rescue, { who: playerState }));
  })),
// {PATROL Escape Pile}: If there are none Bystanders in it, you get +2 Attack. Otherwise, you get +2 Recruit.
  c2: makeHeroCard("Corvus Glaive", "Let None Escape You", 2, 0, 0, Color.STRENGTH | Color.INSTINCT, "Cabal", "FD", ev => {
    gameState.escaped.has(isBystander) ? addRecruitEvent(ev, 2) : addAttackEvent(ev, 2);
  }),
// {TEAMPOWER Cabal} KO a Bystander from the Bystander Stack. Then, you get +1 Attack for every four Bystanders in the KO Pile.
// GUN: 1
  uc: makeHeroCard("Corvus Glaive", "Rictus Grin", 6, u, 3, Color.STRENGTH, "Cabal", "G", ev => superPower("Cabal") && (gameState.bystanders.withTop(c => KOEv(ev, c)), addAttackEvent(ev, Math.floor(gameState.ko.count(isBystander)/4)))),
// {TEAMPOWER Cabal} You may KO a Bystander from the Escape Pile and from each player's Victory Pile. You get +1 Attack for each Bystander KO'd this way.
  ra: makeHeroCard("Corvus Glaive", "Atom-Splitting Glaive", 8, u, 6, Color.TECH, "Cabal", "", ev => {
    if (superPower("Cabal")) {
      selectCardOptEv(ev, "KO a Bystander", gameState.escaped.limit(isBystander), c => KOEv(ev, c));
      eachPlayer(p => selectCardOptEv(ev, "KO a Bystander", p.victory.limit(isBystander), c => KOEv(ev, c)));
      cont(ev, () => addAttackEvent(ev, turnState.pastEvents.count(e => e.type === "KO" && e.parent === ev && isBystander(ev.what))));
    }
  }),
},
{
  name: "Dr. Punisher, Soldier Supreme",
  team: "Marvel Knights",
// {PATROL Streets}: If it's empty, draw a card.
// GUN: 1
  c1: makeHeroCard("Dr. Punisher, Soldier Supreme", "Sweep the Streets of Trash", 2, 1, u, Color.TECH | Color.RANGED, "Marvel Knights", "GFD", ev => patrolCity('STREETS', () => drawEv(ev, 1))),
// {POWER Tech} Reveal the top card of your deck. If it costs 0, KO it and you get +1 Attack.
  c2: makeHeroCard("Dr. Punisher, Soldier Supreme", "You're a Slow Learner", 4, u, 2, Color.TECH, "Marvel Knights", "D", ev => superPower(Color.TECH) && revealPlayerDeckEv(ev, 1, cards => {
    cards.limit(c => c.cost === 0).each(c => (KOEv(ev, c), addAttackEvent(ev, 1)));
  })),
// Reveal the top card of the Villain Deck. If it's a Villain, you may fight it this turn.
// {POWER Ranged Ranged} You get +Attack equal to that Villain's printed VP value.
  uc: makeHeroCard("Dr. Punisher, Soldier Supreme", "Ice Magic", 3, u, 2, Color.RANGED, "Marvel Knights", "D", ev => {
    revealVillainDeckEv(ev, 1, r => {
      r.limit(isVillain).each(c => {
        addTurnSet('isFightable', card => c === gameState.villaindeck.top && card === c, () => true);
        superPower(Color.RANGED, Color.RANGED) && addAttackEvent(ev, c.printedVP || 0);
      });
    });
  }),
// {PATROL every city space}:
// For each space that's empty, you get +1 Attack.
// GUN: 1
  ra: makeHeroCard("Dr. Punisher, Soldier Supreme", "Calm Before the Storm", 7, u, 5, Color.RANGED, "Marvel Knights", "GF", ev => {
    addAttackEvent(ev, gameState.city.count(d => !d.size));
  }),
},
{
  name: "Elsa Bloodstone",
  team: "S.H.I.E.L.D.",
// {SPECTRUM} You may KO a card from your hand or discard pile. If you do, you get +1 Recruit.
  c1: makeHeroCard("Elsa Bloodstone", "Bloodstone Pendant", 5, 2, u, Color.INSTINCT, "S.H.I.E.L.D.", "D", ev => spectrumPower() && KOHandOrDiscardEv(ev, undefined, () => addRecruitEvent(ev, 1))),
// {PATROL Sewers}: If it's empty, rescue a Bystander.
// GUN: 1
  c2: makeHeroCard("Elsa Bloodstone", "Monster Hunter", 3, u, 2, Color.COVERT | Color.TECH, "S.H.I.E.L.D.", "GFD", ev => patrolCity('SEWERS', () => rescueEv(ev))),
// {WALLCRAWL}
// You get +1 Attack for each other S.H.I.E.L.D. Hero you played this turn.
// GUN: 1
  uc: makeHeroCard("Elsa Bloodstone", "Defend the S.H.I.E.L.D. Wall", 6, u, 0, Color.RANGED, "S.H.I.E.L.D.", "GF", ev => addAttackEvent(ev, turnState.cardsPlayed.count("S.H.I.E.L.D.")), { wallcrawl: true }),
// {SPECTRUM} You get +3 Attack.
  ra: makeHeroCard("Elsa Bloodstone", "Prodigy of Ulysses Bloodstone", 8, u, 6, Color.STRENGTH, "S.H.I.E.L.D.", "F", ev => spectrumPower() && addAttackEvent(ev, 3)),
},
{
  name: "Phoenix Force Cyclops",
  team: "X-Men",
// You may KO this card. If you do, you gain +2 Attack.
  c1: makeHeroCard("Phoenix Force Cyclops", "Burn Out", 4, u, 2, Color.RANGED, "X-Men", "FD", ev => chooseMayEv(ev, "KO this card", () => (KOEv(ev, ev.source), addAttackEvent(ev, 2)))),
// KO this card. Gain a hero from the S.H.I.E.L.D. Office stack or HQ that costs 4 or less and put it into your hand.
  c2: makeHeroCard("Phoenix Force Cyclops", "Reincarnate", 3, u, u, Color.COVERT, "X-Men", "", ev => {
    KOEv(ev, ev.source);
    selectCardEv(ev, "Choose a Hero to gain", [...hqHeroes(), gameState.officer.top].limit(c => c && c.cost <= 4), c => gainToHandEv(ev, c));
  }),
// Gain a Hero that was KO'd this turn.
  uc: makeHeroCard("Phoenix Force Cyclops", "Rise from the Ashes", 6, u, 3, Color.INSTINCT | Color.RANGED, "X-Men", "F", ev => {
    selectCardEv(ev, "Choose a Hero to gain", gameState.ko.limit(c => isHero(c) && turnState.pastEvents.has(e => e.type === "KO" && e.what === c)), c => gainEv(ev, c));
  }),
// KO up to three cards from your hand. Draw that many cards.
  ra: makeHeroCard("Phoenix Force Cyclops", "Destruction Is Creation", 8, u, 4, Color.RANGED, "X-Men", "", ev => {
    selectObjectsUpToEv(ev, "Choose cards to KO", 3, playerState.hand.deck, c => { KOEv(ev, c); drawEv(ev); });
  }),
},
{
  name: "Ruby Summers",
  team: "X-Men",
// When a card effect causes you to discard this card, if it is your turn, {TELEPORT} it instead. If it is not your turn, set it aside and add it to your hand at the end of this turn.
  c1: makeHeroCard("Ruby Summers", "Guerrilla Warfare", 3, u, 2, Color.RANGED, "X-Men", "FD", [], { trigger: {
    event: 'DISCARD',
    match: (ev, source) => ev.what === source && ev.parent.getSource() instanceof Card,
    replace: ev => {
      teleportEv(ev, ev.source);
      owner(ev.source) !== playerState && addTurnTrigger('CLEANUP', undefined, () => moveCardEv(ev, ev.source, owner(ev.source).hand));
    },
  }}),
// To play this card, you must discard a card from your hand.
  c2: makeHeroCard("Ruby Summers", "Heir to Legends", 5, 2, 2, Color.STRENGTH | Color.RANGED, "X-Men", "FD", [], { playCost: 1, playCostType: 'DISCARD' }),
// {TEAMPOWER X-Men} Whenever you defeat a villain or mastermind this turn, you get +2 Recruit.
  uc: makeHeroCard("Ruby Summers", "Form of Solid Ruby", 6, 0, 4, Color.STRENGTH, "X-Men", "FD", ev => superPower("X-Men") && addTurnTrigger('DEFEAT', ev => isEnemy(ev.what), () => addRecruitEvent(ev, 2))),
// To play this card, you must discard three cards from your hand.
  ra: makeHeroCard("Ruby Summers", "Extinction Blast", 8, u, 10, Color.RANGED, "X-Men", "", [], { playCost: 3, playCostType: 'DISCARD' }),
},
{
  name: "Shang-Chi",
  team: "Marvel Knights",
// {POWER Instinct} You may shuffle your discard pile into your deck.
  c1: makeHeroCard("Shang-Chi", "Shuffling Footwork", 3, 2, u, Color.INSTINCT, "Marvel Knights", "D", ev => superPower(Color.INSTINCT) && chooseMayEv(ev, "Shuffle discard into your deck", () => {
    playerState.discard.each(c => shuffleIntoEv(ev, c, playerState.deck));
  })),
// {WALLCRAWL}
// {PATROL Rooftops}: If it's empty, you get +1 Attack.
  c2: makeHeroCard("Shang-Chi", "Acrobatic Kung-Fu", 4, u, 2, Color.INSTINCT | Color.COVERT, "Marvel Knights", "D", ev => patrolCity('ROOFTOPS', () => addAttackEvent(ev, 1)), { wallcrawl: true }),
// {PATROL your discard pile}: If it's empty, you get +2 Attack.
  uc: makeHeroCard("Shang-Chi", "Seek the Empty Mind", 5, u, 3, Color.COVERT, "Marvel Knights", "D", ev => patrolDeck(playerState.discard, () => addAttackEvent(ev, 2))),
// {WALLCRAWL}
// Any time you are shuffling your deck with this card in it, you may set this card aside and put it on top of your deck at the end of the shuffle.
  ra: makeHeroCard("Shang-Chi", "Muscle Memory", 7, u, 5, Color.INSTINCT, "Marvel Knights", "", [], { trigger: {
    event: 'RESHUFFLE',
    match: (ev, source) => source.location === ev.where, // TODO make reshuffle a proper event and look for trigger cards in deck
    after: ev => chooseMayEv(ev, "Put Muscle Memory on the top of you deck", () => moveCardEv(ev, ev.source, owner(ev.source).deck)),
  }, wallcrawl: true }),
},
{
  name: "Silk",
  team: "Spider Friends",
// {SPECTRUM} Reveal the top card of your deck. If it costs 2 or less, draw it.
  c1: makeHeroCard("Silk", "Long-Range Spider-Sense", 2, u, 2, Color.RANGED, "Spider Friends", "FD", ev => spectrumPower() && drawIfEv(ev, c => c.cost <= 2)),
// {WALLCRAWL}
// {SPECTRUM} Draw a card.
  c2: makeHeroCard("Silk", "Cascading Maneuver", 2, u, 1, Color.STRENGTH | Color.INSTINCT, "Spider Friends", "D", ev => spectrumPower() && drawEv(ev, 1), { wallcrawl: true }),
// {TEAMPOWER Spider Friends} Reveal the top card of your deck. If it costs 0, KO it. If it costs 1 or 2, draw it.
  uc: makeHeroCard("Silk", "Silk Stalking", 2, u, 1, Color.COVERT, "Spider Friends", "D", ev => superPower("Spider Friends") && revealPlayerDeckEv(ev, 1, cards => {
    cards.limit(c => c.cost === 0).each(c => KOEv(ev, c));
    cards.limit(c => c.cost === 1 || c.cost === 2).each(c => drawCardEv(ev, c));
  })),
// {WALLCRAWL}
// {SPECTRUM} Reveal the top four cards of your deck. Put any combination of those cards with a total cost of 2 or less into your hand. But the rest back in any order.
  ra: makeHeroCard("Silk", "Borrowed Cloaking Device", 2, u, 1, Color.TECH, "Spider Friends", "D", ev => {
    const f = (cards: Card[], n: number) => selectCardOptEv(ev, `Choose card costing ${n} or less`, cards.limit(c => c.cost <= n), c => {
      moveCardEv(ev, c, playerState.hand);
      f(cards.limit(v => v !== c), n - c.cost);
    });
    spectrumPower() && revealPlayerDeckEv(ev, 4, cards => f(cards, 2));
  }, { wallcrawl: true }),
},
{
  name: "Soulsword Colossus",
  team: "X-Men",
// {POWER Covert} Once this turn, you may fight the top card of the Bystander Stack as if it were a 3 Attack Demon Villain with "Fight: KO one of your heroes."
  c1: makeHeroCard("Soulsword Colossus", "Invade the Inferno", 3, 2, u, Color.COVERT, "X-Men", "D", ev => {
    if (superPower(Color.COVERT)) {
      let once = false;
      const isDemon = (c: Card) => c === gameState.bystanders.top && !once;
      addTurnSet('isFightable', isDemon, () => true); // TODO make top of bystander stack card of interest
      villainify('Demon', isDemon, 3, ev => selectCardAndKOEv(ev, yourHeroes()));
      addTurnTrigger('FIGHT', ev => isDemon(ev.what), () => once = true);
    }
  }),
// If a player would gain a Wound, you may discard this card instead. If you do, draw two cards.
  c2: makeHeroCard("Soulsword Colossus", "Steel Interception", 4, u, 2, Color.STRENGTH | Color.COVERT, "X-Men", "D", [], { trigger: {
    event: "GAIN",
    match: (ev, source: Card) => isWound(ev.what) && source.location === ev.who.hand,
    replace: ev => selectCardOptEv(ev, "Discard to draw 2 cards", [ev.source], () => {
      discardEv(ev, ev.source); drawEv(ev, 2, owner(ev.source));
    }, () => doReplacing(ev), owner(ev.source))
  }}),
// {POWER Strength} {XDRAMPAGE Colossus}. You get +2 Attack if at least one other player didn't reveal a Colossus card.
  uc: makeHeroCard("Soulsword Colossus", "Possessed by the Soulsword", 6, u, 3, Color.STRENGTH, "X-Men", "D", ev => {
    let gainAttack = false;
    superPower(Color.STRENGTH) && xdRampageEv(ev, 'Colossus', p => gainAttack = gainAttack || p !== playerState);
    cont(ev, () => gainAttack && addAttackEvent(ev, 2));
  }),
// {TEAMPOWER X-Men} You may gain an X-Men Hero from the HQ or the KO pile to your hand.
  ra: makeHeroCard("Soulsword Colossus", "Rescue My Family from Hell", 7, u, 5, Color.INSTINCT, "X-Men", "F", ev => superPower("X-Men") && selectCardOptEv(ev, "Choose an X-Men to gain", [...hqHeroes(), ...gameState.ko.deck].limit("X-Men"), c => gainToHandEv(ev, c))),
},
{
  name: "Spider-Gwen",
  team: "Spider Friends",
// {PATROL Bridge}: If it's empty, reveal the top card of your deck. If that card costs 2 or less, draw it.
  c1: makeHeroCard("Spider-Gwen", "Fateful Bridge", 2, u, 2, Color.INSTINCT | Color.TECH, "Spider Friends", "D", ev => patrolCity('BRIDGE', () => drawIfEv(ev, c => c.cost <= 2))),
// {PATROL Rooftops}: If it's empty, rescue a Bystander, and then you get +1 Attack for every two Bystanders in your Victory Pile.
  c2: makeHeroCard("Spider-Gwen", "Save the Day", 2, u, 1, Color.TECH, "Spider Friends", "D", ev => patrolCity('ROOFTOPS', () => {
    rescueEv(ev);
    cont(ev, () => addAttackEvent(ev, Math.floor(playerState.victory.count(isBystander)/2)));
  })),
// {WALLCRAWL}
// {PATROL Bank}: If it's empty, you get +1 Attack.
// {PATROL your Victory Pile}: If it's empty, you get +1 Attack.
  uc: makeHeroCard("Spider-Gwen", "First Adventure", 2, u, 1, Color.STRENGTH, "Spider Friends", "D", [
    ev => patrolCity('BANK', () => addAttackEvent(ev, 1)),
    ev => patrolDeck(playerState.victory, () => addAttackEvent(ev, 1)),
  ], { wallcrawl: true }),
// {WALLCRAWL}
// Reveal the top three cards of your deck, then put them back in any order. You get +1 Attack for each card you revealed that costs 2 or less.
  ra: makeHeroCard("Spider-Gwen", "Intertwining Webs", 2, u, 0, Color.COVERT, "Spider Friends", "D", ev => revealPlayerDeckEv(ev, 3, cards => addAttackEvent(ev, cards.count(c => c.cost <= 2))), { wallcrawl: true }),
},
{
  name: "Time-Traveling Jean Grey",
  team: "X-Men",
// {POWER Covert} Choose a Villain on the Rooftops or Bridge. It gets -2 Attack this turn.
  c1: makeHeroCard("Time-Traveling Jean Grey", "Throw Over the Railing", 3, u, 2, Color.COVERT, "X-Men", "D", ev => {
    superPower(Color.COVERT) && selectCardEv(ev, "Choose a Villain", cityVillains().limit(c => isLocation(c.location, 'BRIDGE', 'ROOFTOPS')), c => addTurnMod('defense', v => c === v, -2));
  }),
// {PATROL Bridge}: If it's empty, then when you draw a new hand of cards at the end of this turn, draw an extra card.
  c2: makeHeroCard("Time-Traveling Jean Grey", "Bridge to a Better Future", 4, u, u, Color.INSTINCT, "X-Men", "", ev => patrolCity('BRIDGE', () => addEndDrawMod(1))),
// You may move a villain to an adjacent city space. If another Villain is already there, swap them.
  uc: makeHeroCard("Time-Traveling Jean Grey", "Telekinesis", 5, u, 3, Color.COVERT | Color.RANGED, "X-Men", "", ev => {
    selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
      selectCardEv(ev, "Choose a new city space", cityAdjacent(v.location), dest => swapCardsEv(ev, v.location, dest));
    });
  }),
// {TEAMPOWER X-Men} {PATROL any city space}: If it's empty, gain the hero in the HQ space under it. Put that hero on top of your deck.
  ra: makeHeroCard("Time-Traveling Jean Grey", "Change History", 7, u, 5, Color.COVERT, "X-Men", "", ev => superPower("X-Men") && selectCardEv(ev, 'Choose an empty city space', gameState.city.limit(d => !d.size), c => {
    c.above && c.above.limit(isHero).withFirst(c => gainToDeckEv(ev, c));
  })),
},
]);
addHeroTemplates("Captain America 75th Anniversary", [
{
  name: "Agent X-13",
  team: "S.H.I.E.L.D.",
// {TEAMPOWER S.H.I.E.L.D., S.H.I.E.L.D., S.H.I.E.L.D., S.H.I.E.L.D.} {OUTOFTIME}
// GUN: 1
  c1: makeHeroCard("Agent X-13", "Sniper Squad", 3, 1, 1, Color.RANGED, "S.H.I.E.L.D.", "G", ev => superPower("S.H.I.E.L.D.", "S.H.I.E.L.D.", "S.H.I.E.L.D.", "S.H.I.E.L.D.") && outOfTimeEv(ev)),
// You get +1 Attack for each other S.H.I.E.L.D. Hero you played this turn that costs 1 or more.
// GUN: 1
  c2: makeHeroCard("Agent X-13", "Paramilitary Ops", 4, u, 2, Color.TECH, "S.H.I.E.L.D.", "GFD", ev => addAttackEvent(ev, turnState.cardsPlayed.limit('S.H.I.E.L.D.').count(c => c.cost >= 1))),
// Choose one: Gain a S.H.I.E.L.D. Officer, or you get +2 Attack.
// {POWER Covert} {OUTOFTIME}.
  uc: makeHeroCard("Agent X-13", "Spy Network", 4, u, 0, Color.COVERT, "S.H.I.E.L.D.", "D", [ ev => {
    chooseOneEv(ev, "Choose one", ["Gain S.H.I.E.L.D. Officer", () => gameState.officer.withTop(c => gainEv(ev, c))],["Get +2 Attack", () => addAttackEvent(ev, 2)]);
  }, ev => superPower(Color.COVERT) && outOfTimeEv(ev) ]),
// KO up to two S.H.I.E.L.D. Heroes from your hand and/or discard pile.
// {SAVIOR} For each card KO'd this way, you get +1 Attack.
  ra: makeHeroCard("Agent X-13", "Mobilize for War", 7, u, 4, Color.INSTINCT, "S.H.I.E.L.D.", "", ev => {
    selectObjectsUpToEv(ev, "KO up to two S.H.I.E.L.D. Heroes", 2, handOrDiscard().limit('S.H.I.E.L.D.'), c => discardEv(ev, c));
    cont(ev, () => saviorPower() && addAttackEvent(ev, turnState.pastEvents.count(e => e.type === 'DISCARD' && e.parent === ev)));
  }),
},
{
  name: "Captain America (Falcon)",
  team: "Avengers",
// {POWER Instinct} Rescue a Bystander.
  c1: makeHeroCard("Captain America (Falcon)", "Aerial Catch", 3, 2, u, Color.INSTINCT, "Avengers", "FD", ev => superPower(Color.INSTINCT) && rescueEv(ev)),
// {SAVIOR} You get +2 Attack.
  c2: makeHeroCard("Captain America (Falcon)", "Winged Salvation", 4, u, 2, Color.RANGED, "Avengers", "FD", ev => saviorPower() && addAttackEvent(ev, 2)),
// Once per turn, if a player would gain a Wound, you may reveal this card and rescue a Bystander instead.
  uc: makeHeroCard("Captain America (Falcon)", "Flying Shield Block", 6, u, 4, Color.TECH, "Avengers", "", [], { trigger: {
    event: "GAIN",
    match: (ev, source) => isWound(ev.what) && owner(source) === ev.who && !turnState.pastEvents.has(e => e.type === 'RESCUE' && e.getSource() === source),
    replace: ev => selectCardOptEv(ev, "Reveal a card", [ ev.source ], () => rescueByEv(ev, owner(ev.source)), () => doReplacing(ev), owner(ev.source))
  }}),
// You get +2 Attack for each Hero Class you have.
// {SAVIOR} You get +2 Recruit for each Hero Class you have.
  ra: makeHeroCard("Captain America (Falcon)", "Star-Spangled Hero", 7, 0, 0, Color.COVERT, "Avengers", "D", [
    ev => addAttackEvent(ev, 2 * numClasses()),
    ev => saviorPower() && addRecruitEvent(ev, 2 * numClasses()),
  ]),
},
{
  name: "Captain America 1941",
  team: "Avengers",
// Draw a card.
// {POWER Strength} {OUTOFTIME}
  c1: makeHeroCard("Captain America 1941", "Devoted Patriot", 3, u, u, Color.STRENGTH, "Avengers", "FD", [ ev => drawEv(ev, 1), ev => superPower(Color.STRENGTH) && outOfTimeEv(ev) ]),
// You get +1 Attack for each Hero class you have.
// {OUTOFTIME}.
  c2: makeHeroCard("Captain America 1941", "Storm the Beachhead", 5, u, 0, Color.TECH, "Avengers", "", [ ev => addAttackEvent(ev, numClasses()), ev => outOfTimeEv(ev) ]),
// {TEAMPOWER Avengers} Rescue a Bystander
  uc: makeHeroCard("Captain America 1941", "Liberate the Prisoners", 6, u, 3, Color.COVERT, "Avengers", "F", ev => superPower("Avengers") && rescueEv(ev)),
// {SAVIOR} {OUTOFTIME}
  ra: makeHeroCard("Captain America 1941", "Punch Evil in the Face", 8, u, 5, Color.INSTINCT, "Avengers", "F", ev => saviorPower() && outOfTimeEv(ev)),
},
{
  name: "Steve Rogers, Director of S.H.I.E.L.D.",
  team: "S.H.I.E.L.D.",
// You get +1 Recruit for each Hero Class you have.
// {SAVIOR} You get +1 Attack for each Hero Class you have.
  c1: makeHeroCard("Steve Rogers, Director of S.H.I.E.L.D.", "International Strike Force", 3, u, u, Color.STRENGTH, "S.H.I.E.L.D.", "G", [
    ev => addRecruitEvent(ev, numClasses()),
    ev => saviorPower() && addAttackEvent(ev, numClasses()),
 ]),
// {TEAMPOWER S.H.I.E.L.D., S.H.I.E.L.D., S.H.I.E.L.D.} You may KO a S.H.I.E.L.D. Hero that you played this turn. If you do, rescue a Bystander.
  c2: makeHeroCard("Steve Rogers, Director of S.H.I.E.L.D.", "Reassign to Civilian Duty", 5, u, 2, Color.INSTINCT, "S.H.I.E.L.D.", "GFD", ev => {
    superPower("S.H.I.E.L.D.", "S.H.I.E.L.D.", "S.H.I.E.L.D.") && selectCardOptEv(ev, "KO a S.H.I.E.L.D. Hero", playerState.playArea.limit('S.H.I.E.L.D.'), c => {
      KOEv(ev, c); rescueEv(ev);
    });
  }),
// {SAVIOR} {OUTOFTIME}
  uc: makeHeroCard("Steve Rogers, Director of S.H.I.E.L.D.", "Shadow of Wars Past", 4, u, 2, Color.COVERT, "S.H.I.E.L.D.", "GFD", ev => saviorPower() && outOfTimeEv(ev)),
// Rescue a Bystander
// {SAVIOR} You get +3 Attack.
  ra: makeHeroCard("Steve Rogers, Director of S.H.I.E.L.D.", "Save the World", 8, u, 4, Color.TECH, "S.H.I.E.L.D.", "G", [ ev => rescueEv(ev), ev => saviorPower() && addAttackEvent(ev, 3) ]),
},
{
  name: "Winter Soldier",
  team: "(Unaffiliated)",
// {POWER Tech} {OUTOFTIME}.
  c1: makeHeroCard("Winter Soldier", "Bionic Arm", 3, u, 2, Color.STRENGTH, u, "FD", ev => superPower(Color.TECH) && outOfTimeEv(ev)),
// Draw a card.
// {POWER Tech} {OUTOFTIME}
// GUN: 1
  c2: makeHeroCard("Winter Soldier", "Sniper Nest", 4, 1, u, Color.TECH, u, "GF", [ ev => drawEv(ev, 1), ev => superPower(Color.TECH) && outOfTimeEv(ev) ]),
// If you played at least 7 other cards this turn you get +2 Attack.
// GUN: 1
  uc: makeHeroCard("Winter Soldier", "KGB Training", 5, u, 3, Color.COVERT, u, "GD", ev => turnState.cardsPlayed.size >= 7 && addAttackEvent(ev, 2)),
// A Hero in your hand gains {OUTOFTIME} this turn.
// {POWER Tech} Another Hero in your hand gains {OUTOFTIME} this turn.
  ra: makeHeroCard("Winter Soldier", "2>4", 7, u, 4, Color.TECH, u, "D", ev => {
    selectObjectsEv(ev, "Select a Hero", superPower(Color.TECH) ? 2 : 1, playerState.hand.limit(isHero), c => addTurnSet('effects', v => v === c, (c, prev) => addHandler(prev, outOfTimeEv)));
  }),
},
]);
addHeroTemplates("Civil War", [
{
  name: "Captain America, Secret Avenger",
  team: "Avengers",
// You get +1 Recruit for each Hero Class you have.
  c1: makeHeroCard("Captain America, Secret Avenger", "Bold Leadership", 2, 0, u, Color.COVERT, "Avengers", "FD", ev => addRecruitEvent(ev, numClasses())),
// DIVIDED: Inspire a Nation
// Gain a Sidekick.
// DIVIDED: Inspire a Man
  c2: makeDividedHeroCard(
    makeHeroCard("Captain America, Secret Avenger", "Inspire a Nation", 3, u, u, Color.STRENGTH, "Avengers", "", ev => gainSidekickEv(ev)),
    makeHeroCard("Captain America, Secret Avenger", "Inspire a Man", 3, u, 2, Color.INSTINCT, "Avengers", "DN"),
  ),
// You get +1 Attack for each Sidekick and other Avengers Hero you played this turn.
  uc: makeHeroCard("Captain America, Secret Avenger", "Secret Avengers Assemble!", 5, u, 2, Color.TECH, "Avengers", "D", ev => addAttackEvent(ev, turnState.cardsPlayed.count(c => isTeam("Avengers")(c) || isSidekick(c)))),
// Whenever you play a Sidekick or another Avengers Hero this turn set that card aside. At the end of your turn, put those cards on the bottom of your deck in random order before you draw your new hand.
  ra: makeHeroCard("Captain America, Secret Avenger", "Freedom Never Dies", 7, u, 5, Color.RANGED, "Avengers", "", ev => {
    addTurnTrigger('MOVECARD', ev => ev.from === playerState.playArea && (isSidekick(ev.what) || isTeam('Avengers')(ev.what)), { replace: () => {} });
    addTurnTrigger('PLAY', ev => isSidekick(ev.what) || isTeam('Avengers')(ev.what), ev => {
      attachCardEv(ev, ev.parent.what, playerState.deck, 'ASIDE');
    });
    addTurnTrigger('CLEANUP', undefined, { after: ev => {
      playerState.deck.attachedDeck('ASIDE').shuffle();
      playerState.deck.attached('ASIDE').each(c => moveCardEv(ev, c, playerState.deck, true));
    }})
  }),
},
{
  name: "Cloak & Dagger",
  team: "Avengers | Marvel Knights",
// DIVIDED: Above
// DIVIDED: Below
// You get +3 Recruit usable only to recruit Heroes in the HQ space under the Sewers.
  c1: makeDividedHeroCard(
    makeHeroCard("Cloak", "Above", 3, u, 2, Color.COVERT, "Avengers", "DN"),
    makeHeroCard("Dagger", "Below", 3, 0, u, Color.RANGED, "Marvel Knights", "", ev => addRecruitSpecialEv(ev, c => isLocation(c.location.below, 'SEWERS'), 3)),
  ),
// DIVIDED: Flee
// {PHASING}
// {POWER Covert} You get +1 Recruit.
// DIVIDED: Fight
// {PHASING}
// {POWER Ranged} You get +1 Attack.
  c2: makeDividedHeroCard(
    makeHeroCard("Cloak", "Flee", 4, 2, u, Color.COVERT, "Avengers", "D", ev => superPower(Color.COVERT) && addRecruitEvent(ev, 1), { cardActions: [ phasingActionEv ] }),
    makeHeroCard("Dagger", "Fight", 4, u, 2, Color.RANGED, "Marvel Knights", "D", ev => superPower(Color.RANGED) && addAttackEvent(ev, 1), { cardActions: [ phasingActionEv ] }),
  ),
// DIVIDED: Darkness
// {POWER Covert} Reveal the top card of your deck. If it costs 0, KO it.
// DIVIDED: Light
// {POWER Ranged} Reveal the top card of your deck. If it costs 1 or more, draw it.
  uc: makeDividedHeroCard(
    makeHeroCard("Cloak", "Darkness", 6, u, 3, Color.COVERT, "Avengers", "", ev => superPower(Color.COVERT) && revealPlayerDeckEv(ev, 1, cards => cards.limit(c => c.cost === 0).each(c => KOEv(ev, c)))),
    makeHeroCard("Dagger", "Light", 6, 3, u, Color.RANGED, "Marvel Knights", "", ev => superPower(Color.RANGED) && drawIfEv(ev, c => c.cost >= 1)),
  ),
// Whenever you play a <b>Divided</b> card this turn: play both sides as if they were two different cards.
  ra: makeHeroCard("Cloak & Dagger", "Penumbra", 7, u, 4, Color.RANGED, "Avengers", "", ev => turnState.playDividedBoth = true),
},
{
  name: "Daredevil",
  team: "Avengers | Marvel Knights",
// Look at the top two cards of your deck. Draw one and put the other back.
  c1: makeHeroCard("Daredevil", "Dual Existence", 2, u, u, Color.INSTINCT, "Avengers", "FD", ev => lookAtDeckEv(ev, 2, () => selectCardEv(ev, "Choose a card to draw", playerState.revealed.deck, c => drawCardEv(ev, c)))),
// Choose a number, then reveal the top card of your deck. If that card is that cost, gain a Sidekick.
  c2: makeHeroCard("Daredevil", "Roundhouse Side Kick", 4, u, 2, Color.COVERT, "Avengers", "FD", ev => {
    chooseCostEv(ev, n => revealPlayerDeckEv(ev, 1, () => playerState.revealed.has(c => c.cost === n) && gainSidekickEv(ev)));
  }),
// DIVIDED: Hidden Identity
// The next Hero you recruit this turn goes on top of your deck.
// DIVIDED: Revealed Identity
// You get +1 Attack for each different cost of Hero you have.
  uc: makeDividedHeroCard(
    makeHeroCard("Daredevil", "Hidden Identity", 6, 3, u, Color.INSTINCT, "Avengers", "", ev => turnState.nextHeroRecruit = 'DECK'),
    makeHeroCard("Iron Fist", "Revealed Identity", 6, u, 0, Color.STRENGTH, "Marvel Knights", "", ev => addAttackEvent(ev, yourHeroes().uniqueCount(c => c.cost))),
  ),
// {TEAMPOWER Avengers} Discard the top two cards of your deck. If they have different costs, you get +2 Attack, then repeat this process.
  ra: makeHeroCard("Daredevil", "Master of Martial Arts", 8, u, 4, Color.COVERT, "Avengers", "D", ev => { if (superPower("Avengers")) {
    const allCards = [...playerState.deck.deck, ...playerState.discard.deck];
    const infinite = allCards.uniqueCount(c => c.cost) === allCards.size;
    if (infinite) {
      addAttackEvent(ev, 888);
    } else {
      const f = () => {
        let again = false;
        revealPlayerDeckEv(ev, 2, cards => {
          cards.each(c => discardEv(ev, c));
          again = cards.max(c => c.cost) !== cards.max(c => -c.cost);
        });
        if (again) {
          addAttackEvent(ev, 2);
          f();
        }
      }
      f();
    }
  }}),
},
{
  name: "Falcon",
  team: "Avengers",
// Put a Hero from the HQ on the bottom of the Hero Deck.
// {POWER Tech} If that Hero had a Recruit icon, you get +1 Recruit.
  c1: makeHeroCard("Falcon", "Rapid Reinforcements", 3, 2, u, Color.TECH, "Avengers", "D", ev => {
    selectCardEv(ev, "Choose a Hero", hqHeroes(), c => {
      moveCardEv(ev, c, gameState.herodeck, true);
      superPower(Color.TECH) && hasRecruitIcon(c) && addRecruitEvent(ev, 1);
    });
  }),
// DIVIDED: Talk with Birds
// DIVHERO: Falcon
// DIVTEAM: Avengers
// {POWER Ranged} Gain a Sidekick.
// DIVIDED: Squawk Back
// DIVHERO: Redwing
// DIVTEAM: Avengers
// Look at the top three cards of your deck. Draw one. Put the rest back in any order.
  c2: makeDividedHeroCard(
    makeHeroCard("Falcon", "Talk with Birds", 4, u, 2, Color.RANGED, "Avengers", "D", ev => superPower(Color.RANGED) && gainSidekickEv(ev)),
    makeHeroCard("Redwing", "Squawk Back", 4, u, u, Color.INSTINCT, "Avengers", "", ev => lookAtDeckEv(ev, 3, () => selectCardEv(ev, "Choose a card to draw", playerState.revealed.deck, c => drawCardEv(ev, c)))),
  ),
// You get +1 Attack for each card in the HQ with an Attack icon.
  uc: makeHeroCard("Falcon", "Scout the Battlefield", 6, u, 0, Color.RANGED, "Avengers", "F", ev => addAttackEvent(ev, hqCards().count(hasAttackIcon))),
// {TEAMPOWER Avengers} You get +Attack equal to the printed Attack of a Hero in the HQ.
  ra: makeHeroCard("Falcon", "Fly in a Friend", 7, u, 4, Color.INSTINCT, "Avengers", "", ev => superPower("Avengers") && selectCardEv(ev, "Choose a Hero", hqHeroes(), c => addAttackEvent(ev, c.printedAttack || 0))),
},
{
  name: "Goliath",
  team: "Avengers",
// DIVIDED: Brilliant Biochemist
// {SIZECHANGING TECH}
// DIVIDED: Massive Warrior
// {SIZECHANGING STRENGTH}
  c1: makeDividedHeroCard(
    makeHeroCard("Goliath", "Brilliant Biochemist", 4, 2, u, Color.TECH, "Avengers", "D", [], { sizeChanging: Color.TECH }),
    makeHeroCard("Goliath", "Massive Warrior", 4, u, 2, Color.STRENGTH, "Avengers", "D", [], { sizeChanging: Color.STRENGTH }),
  ),
// {SIZECHANGING TECH}
// {POWER Tech} Draw a card
  c2: makeHeroCard("Goliath", "Growth Industry", 5, u, 2, Color.TECH, "Avengers", "FD", ev => superPower(Color.TECH) && drawEv(ev, 1), { sizeChanging: Color.TECH }),
// {SIZECHANGING STRENGTH}
// You get +1 for each other card you played this turn that costs 4 or more. TODO +1 what?
  uc: makeHeroCard("Goliath", "Being Big is Best", 6, u, 3, Color.STRENGTH, "Avengers", "", ev => addAttackEvent(ev, turnState.cardsPlayed.count(c => c.cost >= 4)), { sizeChanging: Color.STRENGTH }),
// {SIZECHANGING STRENGTH}
// You get +Attack equal to the cost of another card you played this turn.
  ra: makeHeroCard("Goliath", "Enormous Implications", 8, u, 0, Color.STRENGTH, "Avengers", "", ev => selectCardEv(ev, "Choose a Hero", turnState.cardsPlayed, c => addAttackEvent(ev, c.cost)), { sizeChanging: Color.STRENGTH }),
},
{
  name: "Hercules",
  team: "Avengers",
// {POWER Instinct} Whenever you defeat a Villain this turn, rescue a Bystander.
  c1: makeHeroCard("Hercules", "Crowd Favorite", 4, u, 2, Color.INSTINCT, "Avengers", "FD", ev => superPower(Color.INSTINCT) && addTurnTrigger('DEFEAT',
    ev => isVillain(ev.what),
    ev => rescueEv(ev),
  )),
// DIVIDED: Manly Dullard
// DIVHERO: Hercules
// DIVTEAM: Avengers
// To play this, you must discard a card from your hand.
// DIVIDED: Boy Genius
// DIVHERO: Amadeus Cho
// DIVTEAM: Unaffiliated
// Draw a card.
  c2: makeDividedHeroCard(
    makeHeroCard("Hercules", "Manly Dullard", 3, u, 3, Color.STRENGTH, "Avengers", "", [], { playCost: 1, playCostType: 'DISCARD'}),
    makeHeroCard("Amadeus Cho", "Boy Genius", 3, u, u, Color.TECH, u, "", ev => drawEv(ev, 1)),
  ),
// {POWER Strength} Reveal the top card of your deck. If it costs 0, KO it.
  uc: makeHeroCard("Hercules", "Prince of Power", 5, 3, u, Color.STRENGTH, "Avengers", "F", ev => superPower(Color.STRENGTH) && revealPlayerDeckEv(ev, 1, cards => cards.filter(c => c.cost === 0).each(c => KOEv(ev, c)))),
// Rescue a Bystander. Then, you get +1 Attack for each Bystander in your Victory Pile.
// {TEAMPOWER Avengers} You get +1 Recruit for each Bystander in your Victory Pile.
  ra: makeHeroCard("Hercules", "Son of Zeus", 7, 0, 0, Color.STRENGTH, "Avengers", "", [ ev => rescueEv(ev), ev => {
    const n = playerState.victory.count(isBystander);
    addAttackEvent(ev, n);
    superPower("Avengers") && addRecruitEvent(ev, n)
  } ]),
},
{
  name: "Hulkling",
  team: "Avengers",
// {SIZECHANGING STRENGTH}
// You may KO a Wound from your hand or discard pile. If you do, you get +1 Attack.
  c1: makeHeroCard("Hulkling", "Cellular Regeneration", 5, u, 2, Color.STRENGTH, "Avengers", "D", ev => KOHandOrDiscardEv(ev, isWound, () => addAttackEvent(ev, 1)), { sizeChanging: Color.STRENGTH }),
// DIVIDED: Half-Kree
// {SIZECHANGING STRENGTH}
// Gain a Wound.
// DIVIDED: Half-Skrull
// {SIZECHANGING COVERT}
  c2: makeDividedHeroCard(
    makeHeroCard("Hulkling", "Half-Kree", 4, 3, u, Color.STRENGTH, "Avengers", "", ev => gainWoundEv(ev), { sizeChanging: Color.STRENGTH }),
    makeHeroCard("Hulkling", "Half-Skrull", 4, u, 2, Color.COVERT, "Avengers", "D", [], { sizeChanging: Color.COVERT }),
  ),
// {SIZECHANGING COVERT}
// Play this card as a copy of another Hero you played this turn. This card is both [Covert] and the class and color you copy.
// GUN: 1
  uc: makeHeroCard("Hulkling", "Impersonate", 6, u, u, Color.COVERT, "Avengers", "G", [], { sizeChanging: Color.COVERT, copyPasteCard: true }),
// {SIZECHANGING COVERT}
// {POWER Covert} You get +4 Attack.
// GUN: 1
  ra: makeHeroCard("Hulkling", "Enormous Shapeshifter", 8, u, 4, Color.COVERT, "Avengers", "GF", ev => superPower(Color.COVERT) && addAttackEvent(ev, 4), { sizeChanging: Color.COVERT }),
},
{
  name: "Luke Cage",
  team: "Avengers",
// If any player would gain a Wound, you may discard this card instead. If you do, draw two cards.
  c1: makeHeroCard("Luke Cage", "Take a Bullet for the Team", 4, 1, 1, Color.STRENGTH, "Avengers", "", [], { trigger: {
    event: "GAIN",
    match: (ev, source: Card) => isWound(ev.what) && source.location === ev.who.hand,
    replace: ev => selectCardOptEv(ev, "Discard to draw 2 cards", [ev.source], () => {
      discardEv(ev, ev.source); drawEv(ev, 2, owner(ev.source));
    }, () => doReplacing(ev), owner(ev.source))
  }}),
// DIVIDED: Cautious
// DIVHERO: Luke Cage
// DIVTEAM: Avengers
// DIVIDED: Reckless
// DIVHERO: Jessica Jones
// DIVTEAM: Marvel Knights
// Gain a Wound.
  c2: makeDividedHeroCard(
    makeHeroCard("Luke Cage", "Cautious", 3, u, 2, Color.STRENGTH, "Avengers", "DN"),
    makeHeroCard("Jessica Jones", "Reckless", 3, u, 3, Color.INSTINCT, "Marvel Knights", "", ev => gainWoundEv(ev)),
  ),
// {POWER Instinct} Look at the top three cards of your deck. Discard them all or put them back in any order.
  uc: makeHeroCard("Luke Cage", "Sweet Christmas", 5, u, 3, Color.INSTINCT, "Avengers", "", ev => superPower(Color.INSTINCT) && lookAtDeckEv(ev, 3, () => chooseMayEv(ev, "Discard revealed cards", () => playerState.revealed.each(c => discardEv(ev, c))))),
// {TEAMPOWER Avengers} <b>Fortify</b> the Wound Stack. While it's fortified, players can't gain Wounds. At the beginning of your next turn, put this card in your discard pile.
  ra: makeHeroCard("Luke Cage", "Unbreakable Skin", 8, u, 6, Color.STRENGTH, "Avengers", "", ev => { if (superPower("Avengers")) {
    fortifyEv(ev, ev.source, gameState.wounds);
    addFutureTrigger(() => moveCardEv(ev, ev.source, playerState.discard), playerState);
  }}, { trigger : {
    event: 'GAIN',
    match: (ev: Ev, source: Card) => isWound(ev.what) && isFortifying(source, gameState.wounds),
    replace: ev => {},
  }}),
},
{
  name: "Patriot",
  team: "Avengers",
// You get +1 Attack for each Hero Name among your non-S.H.I.E.L.D. Heroes.
  c1: makeHeroCard("Patriot", "Intuitive Tactician", 3, u, 0, Color.INSTINCT, "Avengers", "F", ev => addAttackEvent(ev, numColors(yourHeroes().filter(c => !isTeam('S.H.I.E.L.D.')(c))))),
// You get +1 Recruit for each Hero Name among your non-S.H.I.E.L.D. Heroes.
  c2: makeHeroCard("Patriot", "New Generation of Heroes", 2, u, u, Color.STRENGTH, "Avengers", "D", ev => addRecruitEvent(ev, numColors(yourHeroes().filter(c => !isTeam('S.H.I.E.L.D.')(c))))),
// DIVIDED: Incredible Effort
// DIVHERO: Patriot
// DIVTEAM: Avengers
// {POWER Covert} You get +3 Attack
// DIVIDED: Effortless
// DIVHERO: Hawkeye
// DIVTEAM: Avengers
  uc: makeDividedHeroCard(
    makeHeroCard("Patriot", "Incredible Effort", 5, u, 1, Color.COVERT, "Avengers", "", ev => superPower(Color.COVERT) && addAttackEvent(ev, 3)),
    makeHeroCard("Hawkeye", "Effortless", 5, 3, u, Color.TECH, "Avengers", "FN"),
  ),
// Reveal the top three cards of your deck. If you revealed at least three different Hero Names this way, draw those three cards. Otherwise, put them back in any order.
  ra: makeHeroCard("Patriot", "Lead the Young Avengers", 8, u, 3, Color.TECH, "Avengers", "", ev => revealPlayerDeckEv(ev, 3, cards => {
    numHeroNames(cards) >= 3 && cards.each(c => drawCardEv(ev, c));
  })),
},
{
  name: "Peter Parker",
  team: "Avengers | Spider Friends",
// {POWER Tech} Reveal the top card of your deck. If it costs 2 or less, draw it.
  c1: makeHeroCard("Peter Parker", "Conflicted Loyalties", 2, 1, 1, Color.TECH, "Avengers", "FD", ev => superPower(Color.TECH) && drawIfEv(ev, c => c.cost <= 2)),
// Gain a Sidekick.
// {POWER Instinct} Put that Sidekick on top of your deck.
  c2: makeHeroCard("Peter Parker", "Spider-Man Unmasked", 2, u, 1, Color.INSTINCT, "Avengers", "FD", ev => gainSidekickEv(ev, superPower(Color.INSTINCT) ? 'DECK' : undefined)),
// DIVIDED: Protect My Family
// DIVHERO: Peter Parker
// DIVTEAM: Avengers
// Rescue a Bystander.
// DIVIDED: Hot Bowl of Soup
// DIVHERO: Aunt May
// DIVTEAM: Spider-Friends
// You may KO a Wound from your hand or discard pile.
  uc: makeDividedHeroCard(
    makeHeroCard("Peter Parker", "Protect My Family", 2, u, 1, Color.TECH, "Avengers", "D", ev => rescueEv(ev)),
    makeHeroCard("Aunt May", "Hot Bowl of Soup", 2, 1, u, Color.INSTINCT, "Spider Friends", "D", ev => KOHandOrDiscardEv(ev, isWound)),
  ),
// {POWER Instinct} You get +1 Attack for each extra card you've drawn this turn.
  ra: makeHeroCard("Peter Parker", "Reluctant Celebrity", 2, u, 2, Color.INSTINCT, "Avengers", "D", ev => superPower(Color.INSTINCT) && addAttackEvent(ev, turnState.cardsDrawn)),
},
{
  name: "Speedball",
  team: "New Warriors",
// {POWER Covert} If there are any Bystanders in the city or KO pile, you get +2 Attack.
  c1: makeHeroCard("Speedball", "Bounce Around", 4, u, 2, Color.COVERT, "New Warriors", "FD", ev => superPower(Color.COVERT) && gameState.ko.has(isBystander) && addAttackEvent(ev, 2)),
// {POWER Ranged} Reveal the top card of the Villain Deck. If it's a Villain, rescue a Bystander. Otherwise, KO a Bystander from the Bystander Deck.
  c2: makeHeroCard("Speedball", "Reckless Rescue Attempt", 3, 2, u, Color.RANGED, "New Warriors", "D", ev => superPower(Color.RANGED) && revealVillainDeckEv(ev, 1, c => {
    c.has(isVillain) ? rescueEv(ev) : gameState.bystanders.withTop(c => KOEv(ev, c));
  })),
// DIVIDED: Double Down
// DIVHERO: Speedball
// DIVTEAM: New Warriors
// Draw two cards.
// DIVIDED: Bubble Up
// DIVHERO: Namorita
// DIVTEAM: New Warriors
// You get +3 Attack usable only against Villains on the Bridge or against the Mastermind.
  uc: makeDividedHeroCard(
    makeHeroCard("Speedball", "Double Down", 5, u, u, Color.RANGED, "New Warriors", "", ev => drawEv(ev, 2)),
    makeHeroCard("Namorita", "Bubble Up", 5, u, 0, Color.COVERT, "New Warriors", "", ev => addAttackSpecialEv(ev, c => isLocation(c.location, 'BRIDGE') || isMastermind(c), 3)),
  ),
// If a Master Strike would occur, you may reveal this card to KO that Master Strike, cancel its effects, and draw a card.
  ra: makeHeroCard("Speedball", "Kinetic Force Field", 7, u, 5, Color.RANGED, "New Warriors", "", [], { trigger: {
    event: 'STRIKE',
    match: (ev, source: Card) => source.location === ev.who.hand,
    replace: ev => selectCardOptEv(ev, "Reveal to cancel Master Strike", [ev.source], () => {
      drawEv(ev, 1, owner(ev.source));
    }, () => doReplacing(ev), owner(ev.source))
  }}),
},
{
  name: "Stature",
  team: "Avengers",
// {SIZECHANGING TECH}
// Draw a card.
// {POWER Tech} You get +1 Attack.
  c1: makeHeroCard("Stature", "Shrink to Nothing", 2, u, 0, Color.TECH, "Avengers", "FD", [ ev => drawEv(ev, 1), ev => superPower(Color.TECH) && addAttackEvent(ev, 1) ], { sizeChanging: Color.TECH }),
// DIVIDED: Crush Ants
// DIVHERO: Stature
// DIVTEAM: Avengers
// {SIZECHANGING STRENGTH}
// {POWER Strength} Defeat a Villain that has 3 Attack or less.
// DIVIDED: Crush File Sizes
// DIVHERO: Iron Lad
// DIVTEAM: Avengers
// {SIZECHANGING TECH}
// {POWER Tech} Draw a card.
  c2: makeDividedHeroCard(
    makeHeroCard("Stature", "Crush Ants", 5, u, 2, Color.STRENGTH, "Avengers", "D", ev => superPower(Color.STRENGTH) && selectCardEv(ev, "Choose a Villain to defeat", villains().limit(c => c.defense <= 3), c => defeatEv(ev, c)), { sizeChanging: Color.STRENGTH }),
    makeHeroCard("Iron Lad", "Crush File Sizes", 5, 2, u, Color.TECH, "Avengers", "D", ev => superPower(Color.TECH) && drawEv(ev, 1), { sizeChanging: Color.TECH }),
  ),
// {SIZECHANGING STRENGTH}
// {POWER Strength} You get +1 Attack for each Villain in your Victory Pile that has a printed Attack 3 or less.
  uc: makeHeroCard("Stature", "Growing Confidence", 6, u, 2, Color.STRENGTH, "Avengers", "FD", ev => superPower(Color.STRENGTH) && addAttackEvent(ev, playerState.victory.limit(isVillain).count(c => c.defense <= 3)), { sizeChanging: Color.STRENGTH }),
// {SIZECHANGING STRENGTH}
// {POWER Strength} Defeat each Villain that has 4 Attack or less.
// GUN: 1
  ra: makeHeroCard("Stature", "Trample the Tiny", 8, u, 5, Color.STRENGTH, "Avengers", "G", ev => superPower(Color.STRENGTH) && villains().limit(c => c.defense <= 3).each(c => defeatEv(ev, c)), { sizeChanging: Color.STRENGTH }),
},
{
  name: "Storm & Black Panther",
  team: "X-Men | Avengers",
// DIVIDED: Gathering Rain Clouds
// DIVHERO: Storm
// DIVTEAM: X-Men
// {POWER Ranged} Draw a card.
// DIVIDED: Gathering Clues
// DIVHERO: Black Panther
// DIVTEAM: Avengers
// {POWER Instinct} Draw a card.
  c1: makeDividedHeroCard(
    makeHeroCard("Storm", "Gathering Rain Clouds", 2, 1, u, Color.RANGED, "X-Men", "D", ev => superPower(Color.RANGED) && drawEv(ev, 1)),
    makeHeroCard("Black Panther", "Gathering Clues", 2, u, 1, Color.INSTINCT, "Avengers", "D", ev => superPower(Color.INSTINCT) && drawEv(ev, 1)),
  ),
// DIVIDED: Lightning Strike
// DIVHERO: Storm
// DIVTEAM: X-Men
// Any Villain you fight on the Rooftops this turn gets -1 Attack.
// DIVIDED: Pouncing Strike
// DIVHERO: Black Panther
// DIVTEAM: Avengers
// You may move a Villain to an adjacent empty city space.
  c2: makeDividedHeroCard(
    makeHeroCard("Storm", "Lightning Strike", 3, u, 2, Color.RANGED, "X-Men", "D", ev => addTurnMod('defense', c => isLocation(c.location, 'ROOFTOPS'), -1)),
    makeHeroCard("Black Panther", "Pouncing Strike", 3, 2, u, Color.INSTINCT, "Avengers", "D", ev => {
      selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
        selectCardEv(ev, "Choose a new city space", cityAdjacent(v.location).limit(d => d.size === 0), dest => swapCardsEv(ev, v.location, dest));
      });
    }),
  ),
// DIVIDED: Tsunami of Water
// DIVHERO: Storm
// DIVTEAM: X-Men
// {POWER Ranged} You get +2 attack usable only against the Mastermind.
// DIVIDED: Tsunami of Justice
// DIVHERO: Black Panther
// DIVTEAM: Avengers
// {POWER Covert} You may KO a card from your hand or discard pile.
// GUN: 1
  uc: makeDividedHeroCard(
    makeHeroCard("Storm", "Tsunami of Water", 5, u, 3, Color.RANGED, "X-Men", "D", ev => superPower(Color.RANGED) && addAttackSpecialEv(ev, isMastermind, 2)),
    makeHeroCard("Black Panther", "Tsunami of Justice", 5, u, 3, Color.COVERT, "Avengers", "G", ev => superPower(Color.COVERT) && KOHandOrDiscardEv(ev, undefined)),
  ),
// Storm & Black Panther
// Reveal any number of multi-class cards from your hand. Gain that many sidekicks.
  ra: makeHeroCard("Storm & Black Panther", "King & Queen of Wakanda", 7, u, 5, Color.TECH, "Avengers", "", ev => repeat(playerState.hand.count(c => numClasses([c]) > 1), () => gainSidekickEv(ev))),
},
{
  name: "Tigra",
  team: "Avengers",
// DIVIDED: Friendship
// DIVHERO: Tigra
// DIVTEAM: Avengers
// {POWER Covert} Gain a Sidekick.
// DIVIDED: Ferocity
// DIVHERO: Tigra
// DIVTEAM: Avengers
// {POWER Instinct} Draw a card.
  c1: makeDividedHeroCard(
    makeHeroCard("Tigra", "Friendship", 2, 1, u, Color.COVERT, "Avengers", "D", ev => superPower(Color.COVERT) && gainSidekickEv(ev)),
    makeHeroCard("Tigra", "Ferocity", 2, u, 1, Color.INSTINCT, "Avengers", "D", ev => superPower(Color.INSTINCT) && drawEv(ev, 1)),
  ),
// Look at the top card of your deck. Discard it or put it back.
// {POWER Instinct Instinct} You may KO the card you discarded this way.
// GUN: 1
  c2: makeHeroCard("Tigra", "Supernatural Senses", 3, u, 2, Color.INSTINCT, "Avengers", "GD", ev => {
    let cards: Card[] = [];
    lookAtDeckEv(ev, 1, () => selectCardOptEv(ev, "Choose a card to discard", playerState.revealed.deck, c => cards.push(c)));
    cont(ev, () => cards.each(c => {
      discardEv(ev, c);
      superPower(Color.INSTINCT, Color.INSTINCT) && chooseMayEv(ev, "KO the card discarded", () => KOEv(ev, c));
    }));
  }),
// If an Ambush effect would occur, you may discard this card to cancel that effect and draw two cards.
  uc: makeHeroCard("Tigra", "Can't Surprise a Cat", 5, u, 2, Color.COVERT, "Avengers", "D", [], { trigger: {
    event: "CARDEFFECT",
    match: (ev, source: Card) => ev.effectName === 'ambush' && source.location === ev.who.hand,
    replace: ev => selectCardOptEv(ev, "Discard to draw 2 cards", [ev.source], () => {
      discardEv(ev, ev.source); drawEv(ev, 2, owner(ev.source));
    }, () => doReplacing(ev), owner(ev.source))
  }}),
// Recruit a Hero from the HQ for free.
// {TEAMPOWER Avengers} You get that Hero's printed Recruit and Attack.
  ra: makeHeroCard("Tigra", "Mystic Talisman", 7, 0, 0, Color.COVERT, "Avengers", "", ev => {
    selectCardEv(ev, "Choose a hero to recruit", hqHeroes(), c => {
      gainEv(ev, c);
      superPower("Avengers") && addAttackEvent(ev, c.printedAttack || 0);
      superPower("Avengers") && addRecruitEvent(ev, c.printedRecruit || 0);
    });
  }),
},
{
  name: "Vision",
  team: "Avengers",
// {PHASING}
// {POWER Ranged} You get +2 Attack.
  c1: makeHeroCard("Vision", "Solar Energy", 3, u, 1, Color.RANGED, "Avengers", "FD", ev => superPower(Color.RANGED) && addAttackEvent(ev, 2), { cardActions: [ phasingActionEv ] }),
// {PHASING}
// Choose a Hero Class. Reveal the top card of your deck. If it's the Hero class you named, then draw it.
  c2: makeHeroCard("Vision", "Through Solid Objects", 4, 2, u, Color.TECH, "Avengers", "D", ev => chooseClassEv(ev, col => drawIfEv(ev, col)), { cardActions: [ phasingActionEv ] }),
// DIVIDED: Lighter than Air
// DIVHERO: Vision
// DIVTEAM: Avengers
// {SIZECHANGING RANGED}
// {PHASING}
// DIVIDED: Harder than Diamond
// DIVHERO: Vision
// DIVTEAM: Avengers
// {SIZECHANGING TECH}
// {PHASING}
  uc: makeDividedHeroCard(
    makeHeroCard("Vision", "Lighter than Air", 6, 3, u, Color.RANGED, "Avengers", "", [], { sizeChanging: Color.RANGED, cardActions: [ phasingActionEv ] }),
    makeHeroCard("Vision", "Harder than Diamond", 6, u, 3, Color.TECH, "Avengers", "", [], { sizeChanging: Color.TECH, cardActions: [ phasingActionEv ] }),
  ),
// {PHASING}
// When you play this, you may swap a card from your hand with the top two cards of your deck.
// GUN: 1
  ra: makeHeroCard("Vision", "Insubstantial Accomplishments", 7, u, 4, Color.TECH, "Avengers", "G", ev => {
    selectCardOptEv(ev, "Choose a card to swap", playerState.hand.deck, c => {
      lookAtDeckEv(ev, 2, () => {
        playerState.revealed.each(c => moveCardEv(ev, c, playerState.hand));
        moveCardEv(ev, c, playerState.deck);
      })
    })
  }, { cardActions: [ phasingActionEv ] }),
},
{
  name: "Wiccan",
  team: "Avengers",
// {PHASING}
// Choose a number, and then reveal the top card of your deck. If that card is that cost, then you get +1 Attack.
  c1: makeHeroCard("Wiccan", "Astral Projection", 4, u, 2, Color.RANGED, "Avengers", "D", ev => chooseCostEv(ev, n => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost == n) && addAttackEvent(ev, 1))), { cardActions: [ phasingActionEv ] }),
// {PHASING}
// {POWER Covert} You get +2 Recruit.
  c2: makeHeroCard("Wiccan", "Sorcerous Illusions", 2, 1, u, Color.COVERT, "Avengers", "FD", ev => superPower(Color.COVERT) && addRecruitEvent(ev, 2), { cardActions: [ phasingActionEv ] }),
// DIVIDED: Supersonic Spells
// DIVHERO: Wiccan
// DIVTEAM: Avengers
// {POWER Ranged} Draw a card.
// DIVIDED: Supersonic Speed
// DIVHERO: Speed
// DIVTEAM: Avengers
// Draw a card.
// {POWER Covert} Draw another card.
  uc: makeDividedHeroCard(
    makeHeroCard("Wiccan", "Supersonic Spells", 4, u, 2, Color.RANGED, "Avengers", "D", ev => superPower(Color.RANGED) && drawEv(ev, 1)),
    makeHeroCard("Speed", "Supersonic Speed", 4, u, u, Color.COVERT, "Avengers", "", [ ev => drawEv(ev, 1), ev => superPower(Color.COVERT) && drawEv(ev, 1) ]),
  ),
// Choose a number, and then reveal the top card of your deck. If that card is that cost, draw it and draw another card.
  ra: makeHeroCard("Wiccan", "Clairvoyance", 7, u, 3, Color.RANGED, "Avengers", "", ev => chooseCostEv(ev, n => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost == n) && (cards.each(c => drawCardEv(ev, c)), drawEv(ev))))),
},
]);
addHeroTemplates("Deadpool", [
{
  name: "Bob, Agent of HYDRA",
  team: "HYDRA",
// {VIOLENCE} Draw a card.
// GUN: 1
  c1: makeHeroCard("Bob, Agent of HYDRA", "Bullets Flying, Bob Hiding", 3, 2.5, u, Color.COVERT, "HYDRA", "GFD", [], { excessiveViolence: ev => drawEv(ev, 1) }),
// Reveal the top card of your deck. If it's HYDRA or S.H.I.E.L.D., draw it.
// GUN: 1
  c2: makeHeroCard("Bob, Agent of HYDRA", "HYDRA Half-Wit", 2, u, 1.5, Color.TECH, "HYDRA", "GFD", ev => drawIfEv(ev, 'S.H.I.E.L.D.')),
// {POWER Covert} Look at the top card of another player's deck. Ask them a yes or no question about it. If they guess right, then they draw that card. If not, then you draw a card.
  uc: makeHeroCard("Bob, Agent of HYDRA", "How Do I Get Out of Here??", 6, u, 4, Color.COVERT, "HYDRA", "", ev => superPower(Color.COVERT) && chooseOtherPlayerEv(ev, p => {
    lookAtDeckEv(ev, 1, () => {
      p.revealed.each(c => chooseMayEv(ev, `Player ${p.name} draws this card`, () => drawCardEv(ev, c, p)));
    }, playerState, p);
  })),
// {VIOLENCE} KO up to two HYDRA and/or S.H.I.E.L.D. Heroes from your discard pile. Draw a card for each Hero KO'd this way.
// GUN: 1
  ra: makeHeroCard("Bob, Agent of HYDRA", "Epic Middle Manager", 8, u, 5, Color.COVERT, "HYDRA", "G", [], { excessiveViolence: ev => {
    selectObjectsUpToEv(ev, "Choose cards to KO", 2, playerState.discard.limit(isShieldOrHydra), c => { KOEv(ev, c); drawEv(ev); });
  } }),
},
{
  name: "Deadpool",
  team: "Mercs for Money",
// If you have a Wound in your hand or discard pile, KO it at you get +1 Attack. Otherwise, gain a Wound. These days, getting wounded mostly just pisses me off.
  c1: makeHeroCard("Deadpool", "It'll Grow Back", 4, u, 2.5, Color.INSTINCT, "Mercs for Money", "D", ev => {
    playerState.discard.has(isWound) ? addAttackEvent(ev, 1) : gainWoundEv(ev);
  }),
// If it's between 8 p.m. and midnight, you get +2 Attack. Otherwise, you get +2 Recruit.
// {POWER Tech} Screw it, just take both!
  c2: makeHeroCard("Deadpool", "Nighttime Is the Right Time", 3, 0, 0, Color.TECH, "Mercs for Money", "FD", ev => {
    superPower(Color.TECH) ? (addAttackEvent(ev, 2), addRecruitEvent(ev, 2)) : chooseOneEv(ev, "Is it between 8 p.m. and midnight?",
      ["Yes", () => addAttackEvent(ev, 2)],
      ["No", () => addRecruitEvent(ev, 2)],
    );
  }),
// You get +1/2 Attack for each other card with flavor text you played this turn. Now maybe you'll stop telling me to shut up.
  uc: makeHeroCard("Deadpool", "Running Commentary", 5, u, 3.5, Color.COVERT, "Mercs for Money", "FD", ev => {
    addAttackEvent(ev, turnState.cardsPlayed.count(hasFlag('F')) / 2);
  }),
// {VIOLENCE} Take another turn after this one. But don't use this ability more than once per game - trilogies are stupid.
  ra: makeHeroCard("Deadpool", "Deadpool Rage!", 7, u, 5, Color.STRENGTH, "Mercs for Money", "F", [], { excessiveViolence: ev => {
    gameState.extraTurn = true; // TODO once per game
  } }),
},
{
  name: "Slapstick",
  team: "Mercs for Money",
// {POWER Ranged} If any other players are taller than you, draw a card. If any other players are shorter than you, you get +1 Recruit. If both, get both!
  c1: makeHeroCard("Slapstick", "Napoleon Complex", 4, 2, u, Color.RANGED, "Mercs for Money", "FD", ev => {
    if (gameState.players.size > 1 && superPower(Color.RANGED)) {
      chooseMayEv(ev, "Are there taller players?", () => addAttackEvent(ev, 1));
      chooseMayEv(ev, "Are there shorter players?", () => addRecruitEvent(ev, 1));
    }
  }),
// {VIOLENCE} Rescue a Bystander.
  c2: makeHeroCard("Slapstick", "Saturday Morning Harpoons", 3, u, 2.5, Color.RANGED, "Mercs for Money", "FD", [], { excessiveViolence: ev => rescueEv(ev) }),
// {VIOLENCE} When you have a new hand of cards at the end of this turn, draw an extra card.
  uc: makeHeroCard("Slapstick", "Surprise Chainsaw", 6, u, 4.5, Color.STRENGTH, "Mercs for Money", "FD", [], { excessiveViolence: ev => addEndDrawMod(1) }),
// {VIOLENCE} Recruit a Hero from the HQ for free. Then, you may shuffle your discard pile into your deck.
  ra: makeHeroCard("Slapstick", "Electroplasmic Insanity", 8, u, 5, Color.RANGED, "Mercs for Money", "", [], { excessiveViolence: ev => {
    selectCardEv(ev, "Select a Hero to gain", hqHeroes(), c => recruitForFreeEv(ev, c));
    chooseMayEv(ev, "Shuffle discard into your deck?", () => shuffleIntoEv(ev, playerState.discard, playerState.deck));
  } }),
},
{
  name: "Solo",
  team: "Mercs for Money",
  c1: makeHeroCard("Solo", "Half-Cocked", 2, 1.5, 1.5, Color.TECH, "Mercs for Money", "FDN"),
// {VIOLENCE} You get +1 Recruit.
  c2: makeHeroCard("Solo", "Merc's Gotta Get Paid", 3, 0, 2.5, Color.INSTINCT, "Mercs for Money", "FD", [], { excessiveViolence: ev => addRecruitEvent(ev, 1) }),
// {POWER Tech} Does the top card of your deck have a gun in the art? If so, draw that gun!
  uc: makeHeroCard("Solo", "Guns on My Guns", 5, u, 3.5, Color.TECH, "Mercs for Money", "FD", ev => superPower(Color.TECH) && drawIfEv(ev, hasFlag("G"))),
// Choose a Villain. Cut its Attack in half this turn.
// {TEAMPOWER Mercs for Money} Cut the Mastermind's Attack in half for one fight this turn.
  ra: makeHeroCard("Solo", "Cut in Half", 7, u, 2.5, Color.INSTINCT, "Mercs for Money", "FD", ev => {
    selectCardEv(ev, "Choose a Villain", villains(), c => addTurnSet('defense', v => v === c, (c, n) => n / 2));
    if (superPower("Mercs for Money")) {
      let once = false;
      addTurnSet('defense', isMastermind, (c, n) => once ? n : n / 2);
      addTurnTrigger('FIGHT', ev => isMastermind(ev.what), () => once = true);
    }
  }),
},
{
  name: "Stingray",
  team: "Mercs for Money",
// Draw a card.
// You may move a Villain to an adjacent city space. If another Villain is already there, swap them.
  c1: makeHeroCard("Stingray", "Deck Chairs on the Titanic", 4, u, 1.5, Color.TECH, "Mercs for Money", "D", [ ev => drawEv(ev, 1), ev => {
    selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
      selectCardEv(ev, "Choose a new city space", cityAdjacent(v.location), dest => swapCardsEv(ev, v.location, dest));
    });
  } ]),
// Draw a card.
// {POWER Tech} You get +2 Attack, usable only against Villains in the Sewers or Bridge or the Mastermind.
  c2: makeHeroCard("Stingray", "Superpowered Swimsuit", 2, u, .5, Color.TECH, "Mercs for Money", "FD", [
    ev => drawEv(ev, 1),
    ev => superPower(Color.TECH) && addAttackSpecialEv(ev, c => isMastermind(c) || isLocation(c.location, 'SEWERS', 'BRIDGE'), 2),
  ]),
// {VIOLENCE} You may KO one of your cards or a card from your discard pile.
  uc: makeHeroCard("Stingray", "Sting of the Stingray's Sting", 5, 3, u, Color.RANGED, "Mercs for Money", "F", [], { excessiveViolence: ev => selectCardAndKOEv(ev, revealable().concat(playerState.discard.deck)) }),
// You may KO a card from your hand or discard pile.
// {TEAMPOWER Mercs for Money} You get 1/2 Attack for each Hero in the KO pile.
  ra: makeHeroCard("Stingray", "PhD in Oceanography", 8, u, 4, Color.TECH, "Mercs for Money", "D", [
    ev => KOHandOrDiscardEv(ev, undefined),
    ev => superPower("Mercs for Money") && addAttackEvent(ev, gameState.ko.count(isHero) / 2),
  ]),
},
]);
addHeroTemplates("Noir", [
{
  name: "Angel Noir",
  team: "X-Men",
// {POWER Instinct} You get +1 Attack.
// GUN: 1
  c1: makeHeroCard("Angel Noir", "Impetuous Dive", 3, u, 2, Color.INSTINCT, "X-Men", "GFD", ev => superPower(Color.INSTINCT) && addAttackEvent(ev, 1)),
// Choose a Hero Class. <b>Investigate</b> for a card of that Hero Class.
  c2: makeHeroCard("Angel Noir", "Multitalented", 4, 1, 1, Color.STRENGTH, "X-Men", "F", ev => chooseClassEv(ev, col => investigateEv(ev, col))),
// You get the printed Recruit and Attack of a Hero in the HQ. Then put that Hero on the bottom of the Hero Deck.
  uc: makeHeroCard("Angel Noir", "Identical Twin Brother", 5, 0, 0, Color.INSTINCT, "X-Men", "", ev => selectCardEv(ev, "Choose a Hero", hqHeroes(), c => {
    addAttackEvent(ev, c.printedAttack || 0);
    addRecruitEvent(ev, c.printedRecruit || 0);
    moveCardEv(ev, c, gameState.herodeck, true);
  })),
// <b>Investigate</b> the Hero Deck for any card and put that card in your hand.
  ra: makeHeroCard("Angel Noir", "Missing Person Case", 8, u, 3, Color.COVERT, "X-Men", "", ev => investigateEv(ev, u, gameState.herodeck, c => moveCardEv(ev, c, playerState.hand))),
},
{
  name: "Daredevil Noir",
  team: "Marvel Knights",
// The next Hero you recruit this turn goes on top of your deck.
  c1: makeHeroCard("Daredevil Noir", "Balancing Act", 3, 1, 1, Color.COVERT, "Marvel Knights", "F", ev => turnState.nextHeroRecruit = 'DECK'),
// Choose a number 1 or more. <b>Investigate</b> for a card of that cost.
// GUN: 1
  c2: makeHeroCard("Daredevil Noir", "Listen for Heartbeats", 4, u, 2, Color.INSTINCT, "Marvel Knights", "GFD", ev => chooseCostEv(ev, n => investigateEv(ev, c => c.cost === n), 1)),
// {POWER Covert} <b>Investigate</b> for a card that costs 0. KO that card.
  uc: makeHeroCard("Daredevil Noir", "Discover the Bodies", 5, 3, u, Color.COVERT, "Marvel Knights", "F", ev => superPower(Color.COVERT) && investigateEv(ev, c => c.cost === 0, playerState.deck, c => KOEv(ev, c))),
// Discard a card from the top or bottom of your deck. If it costs 0, you get +1 Attack and repeat this process. If your deck runs out, stop.
  ra: makeHeroCard("Daredevil Noir", "Hitting Rock Bottom", 7, u, 3, Color.INSTINCT, "Marvel Knights", "", ev => {
    const f = () => playerState.deck.size > 0 && chooseOptionEv(ev, "Reveal a card from", [{l:"Top",v:false},{l:"Bottom",v:true}], v => lookAtDeckTopOrBottomEv(ev, 1, v, () => playerState.revealed.each(c => {
      discardEv(ev, c);
      c.cost === 0 && (addAttackEvent(ev, 1), f());
    })));
  }),
},
{
  name: "Iron Man Noir",
  team: "Avengers",
// To play this, you must put another card from your hand on top of your deck.
// GUN: 1
  c1: makeHeroCard("Iron Man Noir", "Steam-Powered Arsenal", 3, u, 3, Color.RANGED, "Avengers", "GF", [], { playCost: 1, playCostType: 'TOPDECK' }),
// <b>Investigate</b> for a [Tech] card.
// GUN: 1
  c2: makeHeroCard("Iron Man Noir", "Mechanized Plate-Mail", 4, 2, u, Color.TECH, "Avengers", "GFD", ev => investigateEv(ev, Color.TECH)),
// {POWER Tech} You may use the "Fight" ability of a Villain worth 1 VP in your Victory Pile.
  uc: makeHeroCard("Iron Man Noir", "Learn from Enemies", 6, u, 3, Color.TECH, "Avengers", "", ev => superPower(Color.TECH) && selectCardOptEv(ev, "Choose a Villain", playerState.victory.limit(isVillain).limit(c => c.vp === 1), c => {
    pushEffects(ev, c, 'fight', c.fight);
  })),
// Whenever you <b>Investigate</b> this turn, look a three cards instead of two.
// Choose Recruit or Attack. <b>Investigate</b> for a card with that icon.
// GUN: 1
  ra: makeHeroCard("Iron Man Noir", "Adventurers Assemble!", 7, u, 4, Color.TECH, "Avengers", "G", [
    ev => turnState.investigateAmount = 3,
    ev => chooseOptionEv(ev, "Choose", [{l:"Recruit",v:hasRecruitIcon}, {l:"Attack",v:hasAttackIcon}], v => investigateEv(ev, v)),
  ]),
},
{
  name: "Luke Cage Noir",
  team: "Marvel Knights",
// <b>Investigate</b> for a card that costs 4 or more.
  c1: makeHeroCard("Luke Cage Noir", "Private Investigations", 4, u, 2, Color.COVERT, "Marvel Knights", "FD", ev => investigateEv(ev, c => c.cost >= 4)),
// You get +1 Recruit for each other card you played this turn that costs 4 or more.
  c2: makeHeroCard("Luke Cage Noir", "Follow Big Leads", 4, 2, u, Color.STRENGTH, "Marvel Knights", "FD", ev => addRecruitEvent(ev, turnState.cardsPlayed.count(c => c.cost >= 4))),
// Once per turn, if a player would gain a Wound, you may reveal this card and <b>Investigate</b> for any card instead.
  uc: makeHeroCard("Luke Cage Noir", "Unbreakable Cage", 6, u, 4, Color.STRENGTH, "Marvel Knights", "", [], { trigger: {
    event: "GAIN",
    match: (ev, source: Card) => isWound(ev.what) && source.location === ev.who.hand && !turnState.pastEvents.has(e => e.type === 'DRAW' && e.getSource() === source),
    replace: ev => selectCardOptEv(ev, "Reveal to Investigate", [ev.source], () => {
      investigateEv(ev, u, owner(ev.source).deck, c => drawCardEv(ev, c, owner(c)), owner(ev.source));
    }, () => doReplacing(ev), owner(ev.source))
  }}),
// You get +2 Attack for each other card you played this turn that costs 4 or more.
  ra: makeHeroCard("Luke Cage Noir", "Weight of the World", 8, u, 5, Color.STRENGTH, "Marvel Knights", "D", ev => addAttackEvent(ev, 2 * turnState.cardsPlayed.count(c => c.cost >= 4))),
},
{
  name: "Spider-Man Noir",
  team: "Spider Friends",
// <b>Investigate</b> for a card that costs 2 or less.
// GUN: 1
  c1: makeHeroCard("Spider-Man Noir", "Gumshoe's Revolver", 2, u, 1, Color.TECH, "Spider Friends", "GFD", ev => investigateEv(ev, c => c.cost <= 2)),
// {POWER Ranged} You get 2+ Attack.
  c2: makeHeroCard("Spider-Man Noir", "Webs of Darkness", 2, u, 1, Color.RANGED, "Spider Friends", "FD", ev => superPower(Color.RANGED) && addAttackEvent(ev, 2)),
// {POWER Instinct} <b>Investigate</b> the Bystander Stack for a Bystander and rescue it.
// TODO revealed bytstander deck
  uc: makeHeroCard("Spider-Man Noir", "Solve the Crime", 2, u, 2, Color.INSTINCT, "Spider Friends", "FD", ev => superPower(Color.INSTINCT) && investigateEv(ev, isBystander, gameState.bystanders, c => rescueEv(ev, c))),
// {TEAMPOWER Spider Friends} <b>Investigate</b> each player's deck for a card that costs 2 or less, play a copy of that card, then put it into their discard pile.
  ra: makeHeroCard("Spider-Man Noir", "Spider-Totem's Chosen", 2, u, 1, Color.STRENGTH, "Spider Friends", "D", ev => {
    if (superPower("Spider Friends")) eachPlayer(p => investigateEv(ev, c => c.cost <= 2, p.deck, c => {
      playCopyEv(ev, c);
      discardEv(ev, c);
    }))
  }),
},
]);
addHeroTemplates("X-Men", [
{
  name: "Aurora & Northstar",
  team: "X-Men",
// {SOARING FLIGHT}
// {LIGHTSHOW} Draw a card.
  c1: makeHeroCard("Aurora & Northstar", "Northern Lights", 3, u, 2, Color.COVERT, "X-Men", "D", [], { soaring: true, lightShow: ev => drawEv(ev, 1), cardActions: [ lightShowActionEv ] }),
// DIVIDED: Blazing Flare
// DIVHERO: Aurora
// {LIGHTSHOW} You get +2 Recruit.
// DIVIDED: Blazing Fists
// DIVHERO: Northstar
// {BERSERK}
  c2: makeDividedHeroCard(
    makeHeroCard("Aurora", "Blazing Flare", 4, 2, u, Color.RANGED, "X-Men", "D", [], { lightShow: ev => addRecruitEvent(ev, 2), cardActions: [ lightShowActionEv ] }),
    makeHeroCard("Northstar", "Blazing Fists", 4, u, 2, Color.STRENGTH, "X-Men", "D", ev => berserkEv(ev, 1)),
  ),
// {SOARING FLIGHT}
// {LIGHTSHOW} You get +3 Attack
  uc: makeHeroCard("Aurora & Northstar", "Twin Blast", 5, u, 2, Color.RANGED, "X-Men", "D", [], { soaring: true, lightShow: ev => addAttackEvent(ev, 3), cardActions: [ lightShowActionEv ] }),
// {SOARING FLIGHT}
// All Heroes you recruit this turn have {SOARING FLIGHT}.
// {LIGHTSHOW} You get +2 Attack for each <b>Lightshow</b> card you played this turn.
  ra: makeHeroCard("Aurora & Northstar", "Mach 10", 7, 4, 0, Color.INSTINCT, "X-Men", "D", ev => {
    turnState.nextHeroRecruit = 'SOARING';
    addTurnTrigger('GAIN', ev => ev.who === playerState && isHero(ev.what), () => turnState.nextHeroRecruit = 'SOARING');
  }, {
    soaring: true, lightShow: ev => addAttackEvent(ev, 2 * turnState.cardsPlayed.count(hasLightShow)), cardActions: [ lightShowActionEv ]
  }),
},
{
  name: "Banshee",
  team: "X-Men",
// Draw a card.
// PIERCING
// {XGENE [Covert]} You get +1 Piercing.
  c1: makeHeroCard("Banshee", "Sonar Detection", 2, u, u, Color.COVERT, "X-Men", "D", [ ev => drawEv(ev, 1), ev => xGenePower(Color.COVERT) && addPiercingEv(ev, 1) ]),
// {SOARING FLIGHT}
// PIERCING
// 2 Piercing
  c2: makeHeroCard("Banshee", "Speed of Sound", 3, u, u, Color.RANGED, "X-Men", "D", [], { soaring: true, printedPiercing: 2 }),
// PIERCING
// {POWER Ranged} You may have this card produce Piercing instead of Recruit.
// 0+ Piercing
  uc: makeHeroCard("Banshee", "Sonic Blastwave", 5, 3, u, Color.RANGED, "X-Men", "", [], {
    printedPiercing: 0,
    trigger: {
      event: 'ADDRECRUIT',
      match: (ev, source) => ev.getSource() === source && superPower(Color.RANGED) > 0,
      replace: ev => chooseOneEv(ev, "Produce Piercing instead", ["Yes", () => addPiercingEv(ev, ev.parent.amount)], ["No", () => doReplacing(ev)])
    }
  }),
// PIERCING
// {POWER Ranged Covert} You may use Attack as if it were Piercing this turn.
// 4 Piercing
  ra: makeHeroCard("Banshee", "Bone-Shattering Howl", 8, u, u, Color.RANGED, "X-Men", "", ev => superPower(Color.RANGED, Color.COVERT) && (turnState.piercingWithAttack = true), { printedPiercing: 4 }),
},
{
  name: "Beast",
  team: "X-Men",
// {XGENE [Tech]} Draw a card.
  c1: makeHeroCard("Beast", "Captivating Conundrum", 2, u, 1, Color.TECH, "X-Men", "D", ev => xGenePower(Color.TECH) && drawEv(ev, 1)),
// {BERSERK}
// {XGENE [Strength]} {BERSERK}
  c2: makeHeroCard("Beast", "Furry Fury", 4, u, 2, Color.STRENGTH, "X-Men", "D", [ ev => berserkEv(ev, 1), ev => xGenePower(Color.STRENGTH) && berserkEv(ev, 1) ]),
// Look at the top card of your deck. Discard it or put it back.
// {BERSERK}
  uc: makeHeroCard("Beast", "Calculated Rage", 5, u, 3, Color.TECH, "X-Men", "", [ ev => {
    lookAtDeckEv(ev, 1, () => selectCardOptEv(ev, "Discard a card", playerState.revealed.deck, c => discardEv(ev, c)));
  }, ev => berserkEv(ev, 1) ]),
// {BERSERK}
// {XGENE X-Men} You may return a 0-cost, 3-cost, and 4-cost card from your discard pile to your hand.
  ra: makeHeroCard("Beast", "Recursive Pummeling", 8, u, 3, Color.TECH, "X-Men", "", [ ev => berserkEv(ev, 1), ev => { if (xGenePower("X-Men")) {
    const f = (n: number) => selectCardOptEv(ev, "Choose a card to put in hand", playerState.discard.limit(c => c.cost === n), c => moveCardEv(ev, c, playerState.hand));
    f(0); f(3); f(4);
   }} ]),
},
{
  name: "Cannonball",
  team: "X-Men",
// {SOARING FLIGHT}
// {POWER Instinct} You get +2 Attack
  c1: makeHeroCard("Cannonball", "Kinetic Blast Field", 3, u, 1, Color.INSTINCT, "X-Men", "D", ev => superPower(Color.INSTINCT) && addAttackEvent(ev, 2), { soaring: true }),
// {SOARING FLIGHT}
// {POWER Strength} The next Hero you recruit this turn has {SOARING FLIGHT}.
  c2: makeHeroCard("Cannonball", "Carry to the Air", 4, 2, u, Color.STRENGTH, "X-Men", "D", ev => superPower(Color.STRENGTH) && (turnState.nextHeroRecruit = 'SOARING'), { soaring: true }),
// {SOARING FLIGHT}
// {POWER Strength} Return a S.H.I.E.L.D. Hero from your discard pile to your hand.
  uc: makeHeroCard("Cannonball", "Natural Leader", 6, u, 3, Color.STRENGTH, "X-Men", "", ev => superPower(Color.STRENGTH) && selectCardEv(ev, "Choose a card to put in your hand", playerState.discard.limit(isHero).limit('S.H.I.E.L.D.'), c => moveCardEv(ev, c, playerState.hand)), { soaring: true }),
// {SOARING FLIGHT}
// If you played at least 6 other cards this turn, you get +2 Attack.
// Attack: 4+
  ra: makeHeroCard("Cannonball", "Human Cannon", 8, u, 4, Color.STRENGTH, "X-Men", "D", ev => turnState.cardsPlayed.size >= 6 && addAttackEvent(ev, 2), { soaring: true }),
},
{
  name: "Colossus & Wolverine",
  team: "X-Men",
// DIVIDED: Reliable
// DIVHERO: Colossus
// DIVIDED: Unpredictable
// DIVHERO: Wolverine
// {BERSERK}, {BERSERK}
  c1: makeDividedHeroCard(
    makeHeroCard("Colossus", "Reliable", 3, 2, u, Color.STRENGTH, "X-Men", "DN"),
    makeHeroCard("Wolverine", "Unpredictable", 3, u, 1, Color.INSTINCT, "X-Men", "", ev => berserkEv(ev, 2)),
  ),
// {SOARING FLIGHT}
// {XGENE [Instinct]} {BERSERK}
  c2: makeHeroCard("Colossus & Wolverine", "Fastball Special", 4, u, 2, Color.STRENGTH, "X-Men", "D", ev => xGenePower(Color.INSTINCT) && berserkEv(ev, 1), { soaring: true }),
// {BERSERK}
// If you have a Wound in your hand or discard pile, KO it. Otherwise, gain a Wound.
  uc: makeHeroCard("Colossus & Wolverine", "Insane Disregard for Danger", 6, u, 4, Color.INSTINCT, "X-Men", "", [ ev => berserkEv(ev, 1), ev => selectCardOrEv(ev, "Choose a Wound", handOrDiscard().limit(isWound), c => KOEv(ev, c), () => gainWoundEv(ev)) ]),
// {BERSERK}, {BERSERK}, {BERSERK}
// Then, draw a card for each X-Men card you <b>Berserked</b>.
  ra: makeHeroCard("Colossus & Wolverine", "Uncanny X-Men", 7, u, 3, Color.STRENGTH, "X-Men", "", ev => {
    berserkEv(ev, 3);
    cont(ev, () => drawEv(ev, turnState.pastEvents.count(e => e.type === 'DISCARD' && e.parent === ev)));
  }),
},
{
  name: "Dazzler",
  team: "X-Men",
// PIERCING
// {LIGHTSHOW} You get +1 Piercing for each <b>Lightshow</b> card you played this turn.
// 0+ Piercing
  c1: makeHeroCard("Dazzler", "Convert Sound to Light", 3, 1, u, Color.INSTINCT, "X-Men", "", [], { lightShow: ev => addPiercingEv(ev, turnState.cardsPlayed.count(hasLightShow)), cardActions: [ lightShowActionEv ], printedPiercing: 0 }),
// {LIGHTSHOW} You get +2 Attack.
  c2: makeHeroCard("Dazzler", "Dazzling Glamour", 4, u, 2, Color.RANGED, "X-Men", "D", [], { lightShow: ev => addAttackEvent(ev, 2), cardActions: [ lightShowActionEv ] }),
// {LIGHTSHOW} When you draw a new hand of cards at the end of this turn, draw two extra cards.
  uc: makeHeroCard("Dazzler", "City-Wide Mega Concert", 5, u, 3, Color.TECH, "X-Men", "F", [], { lightShow: ev => addEndDrawMod(2), cardActions: [ lightShowActionEv ] }),
// {LIGHTSHOW} Put a Hero from the HQ on top of your deck.
  ra: makeHeroCard("Dazzler", "Inspire the World", 7, u, 5, Color.RANGED, "X-Men", "", [], { lightShow: ev => selectCardEv(ev, "Choose a Hero", hqHeroes(), c => moveCardEv(ev, c, playerState.deck)), cardActions: [ lightShowActionEv ] }),
},
{
  name: "Havok",
  team: "X-Men",
// {LIGHTSHOW} You get +3 Attack usable only against the Mastermind.
  c1: makeHeroCard("Havok", "Blinding Burst", 3, 2, u, Color.RANGED, "X-Men", "D", [], { lightShow: ev => addAttackSpecialEv(ev, isMastermind, 3), cardActions: [ lightShowActionEv ] }),
// To play this card, you must discard a card from your hand.
// {BERSERK}, {BERSERK}
  c2: makeHeroCard("Havok", "Unleash Havok", 4, u, 2, Color.RANGED, "X-Men", "D", ev => berserkEv(ev, 2), { playCost: 1, playCostType: 'DISCARD' }),
// {XGENE [Ranged]} You get +1 Attack for each [Ranged] card in your discard pile.
  uc: makeHeroCard("Havok", "Concussive Plasma", 5, u, 2, Color.RANGED, "X-Men", "D", ev => addAttackEvent(ev, xGenePower(Color.RANGED))),
// {BERSERK}
// {XGENE [Ranged]} You get the total printed Attack of all the [Ranged] cards in your discard pile.
  ra: makeHeroCard("Havok", "Radiation Focus Array", 7, u, 3, Color.TECH, "X-Men", "", [ ev => berserkEv(ev, 1), ev => xGenePower(Color.RANGED) && addAttackEvent(ev, playerState.discard.limit(Color.RANGED).sum(c => c.printedAttack || 0)) ]),
},
{
  name: "Jubilee",
  team: "X-Men",
// Draw a card.
// {LIGHTSHOW} You get +1 Recruit for each <b>Lightshow</b> card you played this turn.
  c1: makeHeroCard("Jubilee", "Light a Spark", 2, 0, u, Color.COVERT, "X-Men", "D", ev => drawEv(ev, 1), { lightShow: ev => addRecruitEvent(ev, turnState.cardsPlayed.count(hasLightShow)), cardActions: [ lightShowActionEv ] }),
// Draw a card.
// {LIGHTSHOW} You get +1 Attack for each <b>Lightshow</b> card you played this turn.
  c2: makeHeroCard("Jubilee", "Blasting Fireworks", 4, u, 1, Color.RANGED, "X-Men", "", ev => drawEv(ev, 1), { lightShow: ev => addAttackEvent(ev, turnState.cardsPlayed.count(hasLightShow)), cardActions: [ lightShowActionEv ] }),
// {LIGHTSHOW} Look at the top card of your deck. If it costs 0, KO it.
  uc: makeHeroCard("Jubilee", "Unexpected Explosion", 5, u, 3, Color.INSTINCT, "X-Men", "", [], { lightShow: ev => lookAtDeckEv(ev, 1, () => playerState.revealed.limit(c => c.cost === 0).each(c => KOEv(ev, c))), cardActions: [ lightShowActionEv ] }),
// {LIGHTSHOW} You get +1 Recruit and +1 Attack for each <b>Lightshow</b> card you played this turn.
  ra: makeHeroCard("Jubilee", "Prismatic Cascade", 7, 0, 5, Color.COVERT, "X-Men", "", [], { lightShow: ev => { const n = turnState.cardsPlayed.count(hasLightShow); addRecruitEvent(ev, n); addRecruitEvent(ev, n); }, cardActions: [ lightShowActionEv ] }),
},
{
  name: "Kitty Pryde",
  team: "X-Men",
// Put a card from the HQ on the bottom of the Hero deck. If that card had a Recruit icon, get +2 Recruit. If that card had an Attack icon, you get +2 Attack. (If both, get both.)
  c1: makeHeroCard("Kitty Pryde", "Intangible Qualities", 3, 0, 0, Color.INSTINCT, "X-Men", "D", ev => {
    selectCardEv(ev, "Choose a Hero", hqHeroes(), c => {
      hasAttackIcon(c) && addAttackEvent(ev, 2);
      hasRecruitIcon(c) && addRecruitEvent(ev, 2);
      moveCardEv(ev, c, gameState.herodeck, true);
    })
  }),
// {XGENE X-Men} Draw a card.
  c2: makeHeroCard("Kitty Pryde", "Going through a Phase", 4, 1, 1, Color.COVERT, "X-Men", "", ev => xGenePower("X-Men") && drawEv(ev, 1)),
// You get +1 Attack for each different cost among the Heroes in the HQ.
  uc: makeHeroCard("Kitty Pryde", "Ghost in the Machine", 6, u, 0, Color.TECH, "X-Men", "", ev => addAttackEvent(ev, hqHeroes().uniqueCount(c => c.cost))),
// {SOARING FLIGHT}
// Put a card from the HQ on the bottom of the Hero Deck. You get +Attack equal to its cost.
  ra: makeHeroCard("Kitty Pryde", "Lockheed, Kitty's Dragon", 8, u, 0, Color.RANGED, "X-Men", "", ev => selectCardEv(ev, "Choose a Hero", hqHeroes(), c => {
    addAttackEvent(ev, c.cost);
    moveCardEv(ev, c, gameState.herodeck, true);
  }), { soaring: true }),
},
{
  name: "Legion",
  team: "X-Men",
// DIVIDED: Bend Steel
// {BERSERK}
// DIVIDED: Bend Light
// {LIGHTSHOW} You get +2 Recruit.
  c1: makeDividedHeroCard(
    makeHeroCard("Legion", "Bend Steel", 2, u, 1, Color.STRENGTH, "X-Men", "D", ev => berserkEv(ev, 1)),
    makeHeroCard("Legion", "Bend Light", 2, 1, u, Color.COVERT, "X-Men", "D", [], { lightShow: ev => addRecruitEvent(ev, 2), cardActions: [ lightShowActionEv ] }),
  ),
// DIVIDED: Split Personality
// DIVIDED: Split Eardrums
// PIERCING
// 2 Piercing
  c2: makeDividedHeroCard(
    makeHeroCard("Legion", "Split Personality", 3, u, 2, Color.TECH, "X-Men", "DN"),
    makeHeroCard("Legion", "Split Eardrums", 3, u, u, Color.RANGED, "X-Men", "D", [], { printedPiercing: 2 }),
  ),
// DIVIDED: Channel Time
// Draw two cards.
// DIVIDED: Channel Fire
// You get +1 Attack for each different Hero Class in your discard pile.
  uc: makeDividedHeroCard(
    makeHeroCard("Legion", "Channel Time", 5, u, u, Color.INSTINCT, "X-Men", "", ev => drawEv(ev, 2)),
    makeHeroCard("Legion", "Channel Fire", 5, u, 0, Color.TECH, "X-Men", "", ev => addAttackEvent(ev, numClasses(playerState.discard.limit(isHero)))),
  ),
// {SOARING FLIGHT}
// Reveal the top three cards of the Hero Deck. You get their total printed Attack. Put them on the bottom of the Hero Deck.
  ra: makeHeroCard("Legion", "Maelstrom of Clashing Powers", 8, u, 3, Color.COVERT, "X-Men", "", ev => revealHeroDeckEv(ev, 3, cards => addAttackEvent(ev, cards.sum(c => c.printedAttack || 0)), false, true), { soaring: true }),
},
{
  name: "Longshot",
  team: "X-Men",
// To play this card, you must put a card from your hand on top of your deck.
  c1: makeHeroCard("Longshot", "Fortune Favors the Bold", 3, u, 3, Color.INSTINCT, "X-Men", "", [], { playCost: 1, playCostType: 'TOPDECK' }),
// {BERSERK}
// {POWER Tech} {BERSERK}
  c2: makeHeroCard("Longshot", "Flurry of Blades", 4, u, 2, Color.TECH, "X-Men", "FD", [ ev => berserkEv(ev, 1), ev => superPower(Color.TECH) && berserkEv(ev, 1) ]),
// Look at the top card of your deck. Discard it or put it back.
// {POWER Covert} You may KO the card you discarded this way.
  uc: makeHeroCard("Longshot", "Make My Own Luck", 6, u, 3, Color.COVERT, "X-Men", "", ev => {
    lookAtDeckEv(ev, 1, () => {
      selectCardOptEv(ev, "Choose a card to discard", playerState.revealed.deck, c => {
        discardEv(ev, c);
        superPower(Color.COVERT) && chooseMayEv(ev, "KO discarded", () => KOEv(ev, c));
      })
    });
  }),
// Reveal the top card of the Villain Deck. If it's a Villain, you may put it on the bottom of that Deck.
// {TEAMPOWER X-Men} You get +Attack equal to the printed Victory Points of the card you revealed.
  ra: makeHeroCard("Longshot", "Escape from Mojo World", 7, u, 5, Color.TECH, "X-Men", "", ev => {
    revealVillainDeckEv(ev, 1, cards => cards.limit(isVillain).each(c => {
      moveCardEv(ev, c, gameState.villaindeck, true);
      superPower("X-Men") && addAttackEvent(ev, c.vp);
    }), false, false);
  }),
},
{
  name: "Phoenix",
  team: "X-Men",
// KO this card.
// You may KO a card from your hand or discard pile.
  c1: makeHeroCard("Phoenix", "Life & Death Incarnate", 3, 3, u, Color.STRENGTH, "X-Men", "", [ ev => KOEv(ev, ev.source), ev => KOHandOrDiscardEv(ev, undefined) ]),
// {SOARING FLIGHT}
// PIERCING
// KO this card.
// 4 Piercing
  c2: makeHeroCard("Phoenix", "Obliterating Fire", 4, u, u, Color.RANGED, "X-Men", "", ev => KOEv(ev, ev.source), { soaring: true, printedPiercing: 4 }),
// Draw two cards.
// You may put a Hero that was KO'd this turn into your discard pile.
  uc: makeHeroCard("Phoenix", "Reincarnating Phoenix", 6, u, u, Color.COVERT, "X-Men", "", [ ev => drawEv(ev, 2), ev => selectCardOptEv(ev, "Choose a Hero", playerState.discard.limit(isHero).limit(c => turnState.pastEvents.has(e => e.type === 'KO' && e.what === c)), c => moveCardEv(ev, c, playerState.discard)) ]),
// {BERSERK}, {BERSERK}, {BERSERK}, {BERSERK}
// KO all the cards you <b>Berserked</b>. If this card makes at least 13 Attack, then the Phoenix Force becomes corrupted by power and devours the Earth. You win, Evil wins, and all other players lose.
  ra: makeHeroCard("Phoenix", "Driven Mad by Power", 9, u, 6, Color.STRENGTH, "X-Men", "", ev => {
    let n = 0;
    berserkEv(ev, 4, c => { KOEv(ev, c); n += c.printedAttack || 0; });
    cont(ev, () => n >= 13 && gameOverEv(ev, "LOSS", playerState));
  }),
},
{
  name: "Polaris",
  team: "X-Men",
// {SOARING FLIGHT}
// {POWER Covert} When you draw a new hand of cards at the end of this turn, draw an extra card.
  c1: makeHeroCard("Polaris", "Ride the Magnetic Waves", 3, 2, u, Color.COVERT, "X-Men", "D", ev => superPower(Color.COVERT) && addEndDrawMod(1), { soaring: true }),
// PIERCING
// {POWER Ranged} Draw a card.
// 2 Piercing
  c2: makeHeroCard("Polaris", "Electromagnetic Pulse", 4, u, u, Color.RANGED, "X-Men", "D", ev => superPower(Color.RANGED) && drawEv(ev, 1), { printedPiercing: 2 }),
// {SOARING FLIGHT}
// {POWER Covert} Look at the top two cards of your deck. You may KO one of them. Put the rest back in any order.
  uc: makeHeroCard("Polaris", "Subtle Attunement", 6, u, 2, Color.COVERT, "X-Men", "D", ev => superPower(Color.COVERT) && lookAtDeckEv(ev, 2, () => selectCardOptEv(ev, "Choose a card to KO", playerState.revealed.deck, c => KOEv(ev, c))), { soaring: true }),
// {SOARING FLIGHT}
// {XGENE X-Men} You can use Recruit as Attack this turn, and vice versa.
  ra: makeHeroCard("Polaris", "Reverse Polarity", 8, 4, u, Color.COVERT, "X-Men", "", ev => xGenePower("X-Men") && (turnState.attackWithRecruit = true, turnState.recruitWithAttack = true), { soaring: true }),
},
{
  name: "Psylocke",
  team: "X-Men",
// Draw a card.
// PIERCING
// {POWER Instinct} You get +1 Piercing.
// 0+ Piercing
  c1: makeHeroCard("Psylocke", "Psychic Knife", 2, u, u, Color.INSTINCT, "X-Men", "D", [ ev => drawEv(ev, 1), ev => superPower(Color.INSTINCT) && addPiercingEv(ev, 1) ], { printedPiercing: 0 }),
// Reveal the top card of the Hero Deck. You may recruit it this turn. If you do, draw a card.
  c2: makeHeroCard("Psylocke", "Precognition", 3, 2, u, Color.COVERT, "X-Men", "D", ev => revealHeroDeckEv(ev, 1, cards => cards.each(c => {
    addTurnSet('isFightable', v => v === c, () => true); // TODO isRecruitable
    addTurnTrigger('RECRUIT', ev => ev.what === c && ev.where === gameState.herodeck, () => drawEv(ev));
  }))),
// PIERCING
// {XGENE [Covert]} You get +1 Piercing.
// 2+ Piercing
  uc: makeHeroCard("Psylocke", "Butterfly Effect", 5, u, u, Color.COVERT, "X-Men", "FD", ev => xGenePower(Color.COVERT) && addPiercingEv(ev, 1), { printedPiercing: 2 }),
// PIERCING
// Reveal the top card of the Hero Deck. The player of your choice puts it in their hand.
// 3 Piercing
  ra: makeHeroCard("Psylocke", "Telepathic Ninjutsu", 7, u, u, Color.INSTINCT, "X-Men", "", ev => revealHeroDeckEv(ev, 1, cards => cards.each(c => {
    choosePlayerEv(ev, p => moveCardEv(ev, c, p.hand));
  })), { printedPiercing: 3 }),
},
{
  name: "X-23",
  team: "X-Men",
// {XGENE [Instinct]} Draw a card.
  c1: makeHeroCard("X-23", "Adamantium Footclaws", 3, u, 2, Color.TECH, "X-Men", "FD", ev => xGenePower(Color.INSTINCT) && drawEv(ev, 1)),
// {BERSERK}
// You may KO a Wound from your hand or discard pile.
  c2: makeHeroCard("X-23", "Healing Factor Genome", 4, u, 2, Color.INSTINCT, "X-Men", "D", [ ev => berserkEv(ev, 1), ev => KOHandOrDiscardEv(ev, isWound) ]),
// {BERSERK}
// {XGENE [Instinct]} You may KO a card from your hand or discard pile.
  uc: makeHeroCard("X-23", "Bioengineered Assassin", 6, u, 2, Color.COVERT, "X-Men", "D", [ ev => berserkEv(ev, 1), ev => xGenePower(Color.INSTINCT) && KOHandOrDiscardEv(ev, undefined) ]),
// {BERSERK}, {BERSERK}
// {XGENE [Instinct]} Count the [Instinct] cards in your discard pile. {BERSERK} that many times.
  ra: makeHeroCard("X-23", "Heir to Wolverine", 7, u, 3, Color.INSTINCT, "X-Men", "D", [ ev => berserkEv(ev, 2), ev => berserkEv(ev, xGenePower(Color.INSTINCT)) ]),
},
]);
addHeroTemplates("Spider-Man Homecoming", [
{
  name: "Happy Hogan",
  team: "(Unaffiliated)",
// {COORDINATE}
// KO all Wounds you gained this turn.
  c1: makeHeroCard("Happy Hogan", "Head of Security", 3, 2, u, Color.INSTINCT, u, "D", ev => {
    const w = turnState.pastEvents.limit(e => e.type === 'GAIN' && isWound(ev.what) && ev.who === playerState).map(e => e.what);
    handOrDiscard().limit(isWound).limit(c => w.includes(c)).each(c => KOEv(ev, c));
  }, { coordinate: true }),
// {POWER Instinct} {DANGERSENSE 2}. If this revealed any Master Strikes, KO those Strikes, then you may KO a card from your hand or discard pile.
  c2: makeHeroCard("Happy Hogan", "Watchful Eye", 4, u, 2, Color.INSTINCT, u, "D", ev => superPower(Color.INSTINCT) && dangerSenseEv(ev, 2, cards => {
    cards.has(isStrike) && selectCardOptEv(ev, "Choose a card to KO", handOrDiscard(), c => KOEv(ev, c));
    cards.limit(isStrike).each(c => KOEv(ev, c));
  })),
// {COORDINATE}
// {STRIKER 1}
  uc: makeHeroCard("Happy Hogan", "Loyal Friend", 5, u, 0, Color.TECH, u, "F", ev => strikerHeroEv(ev, 1), { coordinate: true }),
// {STRIKER 2}
  ra: makeHeroCard("Happy Hogan", "Asset Management", 5, u, 0, Color.INSTINCT, u, "FD", ev => strikerHeroEv(ev, 2)),
},
{
  name: "High-Tech Spider-Man",
  team: "Spider Friends",
// Reveal the top card of your deck. If it costs 2 or less, draw it.
// {POWER Covert} Draw a card.
  c1: makeHeroCard("High-Tech Spider-Man", "Advanced Targeting System", 2, u, u, Color.COVERT, "Spider Friends", "D", [ ev => drawIfEv(ev, c => c.cost <= 2), ev => superPower(Color.COVERT) && drawEv(ev, 1) ]),
// {WALLCRAWL}
// {DANGERSENSE 3}
  c2: makeHeroCard("High-Tech Spider-Man", "Recon Drone Connection", 2, u, 0, Color.TECH, "Spider Friends", "D", ev => dangerSenseEv(ev, 3), { wallcrawl: true }),
// {WALLCRAWL}
// {POWER Tech} Choose two Villains in adjacent city spaces. Each of them gets -1 Attack this turn.
  uc: makeHeroCard("High-Tech Spider-Man", "Spider-Grip", 2, u, 2, Color.TECH, "Spider Friends", "D", ev => superPower(Color.TECH) && selectCardEv(ev, "Choose a Villain", cityVillains(), c => {
    selectCardEv(ev, "Choose an adjecent space", cityAdjacent(c.location).limit(d => d.has(isVillain)), d => {
      [c, ...d.limit(isVillain)].each(c => addTurnMod('defense', v => v === c, -1));
    });
  }), { wallcrawl: true }),
// {WALLCRAWL}
// {COORDINATE}
// You get +3 Attack usable only against the Mastermind or Villains on the Rooftops or Streets.
  ra: makeHeroCard("High-Tech Spider-Man", "Friendly Neighborhood ...", 2, u, 0, Color.TECH, "Spider Friends", "D", ev => addAttackSpecialEv(ev, c => isMastermind(c) || isLocation(c.location, 'ROOFTOPS', 'STREETS'), 3), { wallcrawl: true, coordinate: true }),
},
{
  name: "Peter's Allies",
  team: "Spider Friends",
// You may choose a Villain or Mastermind. You can fight it using only Recruit this turn.
  c1: makeHeroCard("Peter's Allies", "Michelle", 3, 2, u, Color.COVERT, "Spider Friends", "D", ev => selectCardEv(ev, "Choose an Enemy", fightableCards().limit(isEnemy), c => {
    const a = fightActionEv(ev, c);
    a.cost.recruit = (a.cost.recruit || 0) + (a.cost.attack || 0) + (a.cost.either || 0);
    a.cost.attack = 0;
    a.cost.either = 0;
    addTurnAction(a);
  })),
// {COORDINATE}
// {POWER Covert} You get +2 Recruit
  c2: makeHeroCard("Peter's Allies", "Ned", 2, 1, u, Color.COVERT, "Spider Friends", "D", ev => superPower(Color.COVERT) && addRecruitEvent(ev, 2), { coordinate: true }),
// Whenever you {COORDINATE} a card to another player, you may reveal this to draw two cards instead of one.
  uc: makeHeroCard("Peter's Allies", "Liz", 6, 4, u, Color.INSTINCT, "Spider Friends", "", [], { trigger: {
    event: 'COORDINATE',
    match: (ev, source) => source.location === owner(ev.what).hand && owner(ev.what) === owner(source),
    after: ev => revealAndEv(ev, c => c === ev.source, () => drawEv(ev, 1, ev.parent.who)),
  }}),
// {COORDINATE}
// {TEAMPOWER Spider Friends} Each Villain gets -2 Attack this turn. The next time you fight the Mastermind this turn, it gets -2 Attack.
  ra: makeHeroCard("Peter's Allies", "May Parker", 7, 5, u, Color.COVERT, "Spider Friends", "D", ev => { if (superPower("Spider Friends")) {
    let once = false;
    addTurnSet('defense', isEnemy, (c, n) => isVillain(c) || !once ? -2 : 0);
    addTurnTrigger('FIGHT', ev => isMastermind(ev.what), () => once = true);
  }}, { coordinate: true }),
},
{
  name: "Peter Parker, Homecoming",
  team: "Spider Friends",
// {WALLCRAWL}
// {POWER Instinct} {DANGERSENSE 1}. If this revealed a Villain, you may fight it.
  c1: makeHeroCard("Peter Parker, Homecoming", "Avenger in Training", 2, u, 2, Color.INSTINCT, "Spider Friends", "D", ev => superPower(Color.INSTINCT) && dangerSenseEv(ev, 1, cards => {
    cards.limit(isVillain).each(c => {
      const a = fightActionEv(ev, c);
      if (canPayCost(a)) chooseMayEv(ev, "Fight revealed villain", () => playEvent(a));
    });
  }), { wallcrawl: true }),
// {DANGERSENSE 2}
// Reveal the top card of your deck. If it costs 2 or less, draw it.
  c2: makeHeroCard("Peter Parker, Homecoming", "Heightened Senses", 2, u, u, Color.COVERT, "Spider Friends", "D", [ ev => dangerSenseEv(ev, 2), ev => drawIfEv(ev, c => c.cost <= 2) ]),
// {WALLCRAWL}
// {POWER Tech} {DANGERSENSE 1}. If this revealed a Bystander, rescue it.
  uc: makeHeroCard("Peter Parker, Homecoming", "Homemade Web-Shooters", 2, u, 2, Color.TECH, "Spider Friends", "D", ev => superPower(Color.TECH) && dangerSenseEv(ev, 1, cards => {
    cards.limit(isBystander).each(c => rescueEv(ev, c));
  }), { wallcrawl: true }),
// {WALLCRAWL}
// {COORDINATE}
// {DANGERSENSE 4}
// If this revealed any Scheme Twists, you may shuffle the Villain Deck.
  ra: makeHeroCard("Peter Parker, Homecoming", "Something is Happening", 2, u, 0, Color.STRENGTH, "Spider Friends", "D", ev => dangerSenseEv(ev, 4, cards => {
    cards.has(isTwist) && chooseMayEv(ev, "Shuffle the Villain Deck", () => gameState.villaindeck.shuffle());
  }), { wallcrawl: true, coordinate: true }),
},
{
  name: "Tony Stark",
  team: "Avengers",
// {COORDINATE}
  c1: makeHeroCard("Tony Stark", "Genius, Billionaire ...", 2, 1, 1, Color.TECH, "Avengers", "FD", [], { coordinate: true }),
// {COORDINATE}
// {POWER Tech} {DANGERSENSE 2}
  c2: makeHeroCard("Tony Stark", "Stay Out of Trouble", 4, u, 2, Color.TECH, "Avengers", "FD", ev => superPower(Color.TECH) && dangerSenseEv(ev, 2), { coordinate: true }),
// {TEAMPOWER Avengers} {DANGERSENSE 1}. If this revealed a Villain, then Villains from that same Villain Group get -1 Attack this turn.
  uc: makeHeroCard("Tony Stark", "Little Grey Area", 5, u, 3, Color.RANGED, "Avengers", "", ev => superPower("Avengers") && dangerSenseEv(ev, 1, cards => {
    cards.limit(isVillain).each(c =>addTurnMod('defense', isGroup(c.villainGroup), -1));
  })),
// {COORDINATE}
// If another player accepts this {COORDINATE}, then at the end of this turn, move all cards that entered that player's Victory Pile this turn into your Victory Pile.
  ra: makeHeroCard("Tony Stark", "As Usual, I Did All the Work", 7, u, 5, Color.RANGED, "Avengers", "", [], { coordinate: true, trigger: {
    event: 'COORDINATE',
    match: (ev, source) => ev.what === source,
    after: ev => addTurnTrigger('CLEANUP', () => true, () => {
      turnState.pastEvents.limit(e => e.type === 'MOVECARD' && ev.to === playerState.victory && e.what.location === e.to).each(e => moveCardEv(ev, e.what, owner(ev.source).victory))
    }),
  } }),
},
]);
addHeroTemplates("Champions", [
{
  name: "Gwenpool",
  team: "Champions",
// {VERSATILE 1}
// {POWER Covert} Instead, {VERSATILE 3}.
  c1: makeHeroCard("Gwenpool", "Come On, Nobody Reads Card Names", 2, 0, 0, Color.COVERT, "Champions", "FD", ev => versatileEv(ev, superPower(Color.COVERT) ? 3 : 1)),
// Reveal the top card of the Bystander Deck. If it's a Special Bystander, rescue it. Otherwise, put it on the bottom of that deck.
  c2: makeHeroCard("Gwenpool", "I'll Rescue You If I Feel Like It", 3, u, 2, Color.INSTINCT, "Champions", "D", ev => gameState.bystanders.withTop(c => {
    c.rescue ? rescueEv(ev, c) : moveCardEv(ev, c, gameState.bystanders, true);
  })),
// {SIZECHANGING INSTINCT}
// {POWER Instinct} Draw a card.
// {CHEERING CROWDS}
  uc: makeHeroCard("Gwenpool", "I Heard Keywords Are Powerful", 6, u, 2, Color.INSTINCT, "Champions", "D", ev => superPower(Color.INSTINCT) && drawEv(ev, 1), { sizeChanging: Color.INSTINCT, cheeringCrowds: true }),
// <b>Demolish</b> each other player. For each player that discards a card this way, draw a card.
  ra: makeHeroCard("Gwenpool", "I'm the Best at Board Games", 7, u, 5, Color.INSTINCT, "Champions", "", ev => {
    demolishOtherEv(ev);
    cont(ev, () => drawEv(ev, turnState.pastEvents.count(e => e.type === 'DISCARD' && e.parent === ev)));
  }),
},
{
  name: "Ms. Marvel",
  team: "Champions",
// {SIZECHANGING COVERT}
// Draw a card.
// {POWER Covert} Rescue a Bystander.
  c1: makeHeroCard("Ms. Marvel", "Long Arm of the Law", 3, u, u, Color.COVERT, "Champions", "", [ ev => drawEv(ev, 1), ev => superPower(Color.COVERT) && rescueEv(ev) ], { sizeChanging: Color.COVERT }),
// {SIZECHANGING STRENGTH}
// {VERSATILE 2}
  c2: makeHeroCard("Ms. Marvel", "Big Impact", 4, 0, 0, Color.STRENGTH, "Champions", "D", ev => versatileEv(ev, 2), { sizeChanging: Color.STRENGTH }),
// {SIZECHANGING COVERT}
// {TEAMPOWER Champions} You may KO a card from your hand or discard pile.
// {CHEERING CROWDS}
  uc: makeHeroCard("Ms. Marvel", "Need to Stretch My Legs", 6, u, 2, Color.COVERT, "Champions", "D", ev => superPower("Champions") && KOHandOrDiscardEv(ev, undefined), { sizeChanging: Color.COVERT, cheeringCrowds: true }),
// {SIZECHANGING STRENGTH COVERT}
// {VERSATILE 4}
// {CHEERING CROWDS}
  ra: makeHeroCard("Ms. Marvel", "Rising Hope", 9, 0, 0, Color.STRENGTH, "Champions", "", ev => versatileEv(ev, 4), { sizeChanging: Color.STRENGTH | Color.COVERT, cheeringCrowds: true }),
},
{
  name: "Nova",
  team: "Champions",
// {VERSATILE 1}
// {TEAMPOWER Champions} Rescue a Bystander.
  c1: makeHeroCard("Nova", "Space Cop", 2, 0, 0, Color.STRENGTH, "Champions", "FD", [ ev => versatileEv(ev, 1), ev => superPower("Champions") && rescueEv(ev) ]),
// {VERSATILE 2}
// {CHEERING CROWDS}
  c2: makeHeroCard("Nova", "Interstellar Hero", 4, 0, 0, Color.RANGED, "Champions", "FD", ev => versatileEv(ev, 2), { cheeringCrowds: true }),
// {POWER Ranged} {VERSATILE 3}
  uc: makeHeroCard("Nova", "Holographic Projection", 5, 0, 2, Color.RANGED, "Champions", "FD", ev => superPower(Color.RANGED) && versatileEv(ev, 3)),
// {SIZECHANGING RANGED STRENGTH}
// For each other card you played this turn with a Recruit icon, you get +1 Recruit. For each other card you played this turn with an Attack icon, you get +1 Attack.
  ra: makeHeroCard("Nova", "Growing Nova Force", 9, 0, 0, Color.RANGED, "Champions", "", ev => {
    addRecruitEvent(ev, turnState.cardsPlayed.count(hasRecruitIcon));
    addAttackEvent(ev, turnState.cardsPlayed.count(hasAttackIcon));
  }, { sizeChanging: Color.RANGED | Color.STRENGTH }),
},
{
  name: "Totally Awesome Hulk",
  team: "Champions",
// {SIZECHANGING STRENGTH}
// {POWER Strength} The first time you defeat a Villain this turn, rescue a Bystander.
  c1: makeHeroCard("Totally Awesome Hulk", "Beloved Behemoth", 4, u, 2, Color.STRENGTH, "Champions", "D", ev => {
    let once = false;
    superPower(Color.STRENGTH) && addTurnTrigger('DEFEAT', ev => isVillain(ev.what) && !once, ev => { once = true; rescueEv(ev); });
  }, { sizeChanging: Color.STRENGTH }),
// {SIZECHANGING TECH}
// Draw a card.
// {CHEERING CROWDS}
  c2: makeHeroCard("Totally Awesome Hulk", "Incredible Mind, Awesome Body", 4, 1, u, Color.TECH, "Champions", "", ev => drawEv(ev, 1), { sizeChanging: Color.TECH, cheeringCrowds: true }),
// {SIZECHANGING STRENGTH}
// If you have a Wound in your hand or discard pile, KO it and you get +2 Attack. Otherwise, gain a Wound.
  uc: makeHeroCard("Totally Awesome Hulk", "Growing Pains", 5, u, 2, Color.STRENGTH, "Champions", "D", ev => {
    handOrDiscard().has(isWound) ? addAttackEvent(ev, 2) : gainWoundEv(ev);
  }, { sizeChanging: Color.STRENGTH }),
// {SIZECHANGING TECH STRENGTH}
// You get +1 Attack for each extra card you drew this turn.
  ra: makeHeroCard("Totally Awesome Hulk", "7th Smartest Man in the World", 9, u, 5, Color.TECH, "Champions", "", ev => {
    addAttackEvent(ev, turnState.cardsDrawn);
  }, { sizeChanging: Color.TECH | Color.STRENGTH }),
},
{
  name: "Viv Vision",
  team: "Champions",
// {POWER Tech} Whenever you recruit a Hero from the HQ this turn, rescue a Bystander.
  c1: makeHeroCard("Viv Vision", "Walking Wi-Fi", 3, 2, u, Color.TECH, "Champions", "D", ev => superPower(Color.TECH) && addTurnTrigger('RECRUIT', ev => ev.where.isHQ, ev => rescueEv(ev))),
// {SIZECHANGING TECH}
// {POWER Tech} When you draw a new hand of cards at the end of this turn, draw an extra card.
  c2: makeHeroCard("Viv Vision", "Expanding Neural Network", 4, u, 2, Color.TECH, "Champions", "D", ev => superPower(Color.TECH) && addEndDrawMod(1), { sizeChanging: Color.TECH }),
// {VERSATILE 3}
// {CHEERING CROWDS}
  uc: makeHeroCard("Viv Vision", "Crowdsourcing", 6, 0, 0, Color.RANGED, "Champions", "", ev => versatileEv(ev, 3), { cheeringCrowds: true }),
// {SIZECHANGING TECH RANGED}
// Whenever you recruit a Hero this turn, you get +2 Attack.
  ra: makeHeroCard("Viv Vision", "Alter Molecular Density", 9, 5, 0, Color.TECH, "Champions", "D", ev => addTurnTrigger('RECRUIT', () => true, ev => addAttackEvent(ev, 2)), { sizeChanging: Color.TECH | Color.RANGED }),
},
]);
addHeroTemplates("World War Hulk", [
{
  name: "Amadeus Cho",
  team: "Champions",
// {OUTWIT}: Draw a card.
  c1: makeHeroCard("Amadeus Cho", "Extrapolate", 2, 1, u, Color.INSTINCT, "Champions", "FD", ev => mayOutwitEv(ev, () => drawEv(ev, 1))),
// Draw a card.
// Then, if you drew two cards this turn, {TRANSFORM} this into Like Totally Smart Hulk.
// TRANSFORMED
// {OUTWIT}: You get +2 Attack.
  c2: makeTransformingHeroCard(
    makeHeroCard("Amadeus Cho", "Gamma-Draining Nanites", 3, u, u, Color.TECH, "Champions", "", [ ev => drawEv(ev, 1), ev => turnState.cardsDrawn >= 2 && transformHeroEv(ev, ev.source) ]),
    makeHeroCard("Amadeus Cho", "Like Totally Smart Hulk", 5, u, 2, Color.STRENGTH, "Champions", "FD", ev => mayOutwitEv(ev, () => addAttackEvent(ev, 2))),
  ),
// You get +1 Attack for each different cost of Hero you have.
// {OUTWIT}: Draw a card.
  uc: makeHeroCard("Amadeus Cho", "Renegade Genius", 6, u, 0, Color.TECH, "Champions", "", [ ev => addAttackEvent(ev, yourHeroes().uniqueCount(c => c.cost)), ev => mayOutwitEv(ev, () => drawEv(ev, 1)) ]),
// Whenever you use an {OUTWIT} ability this turn, you may use it an extra time.
// {OUTWIT}: Look at the top card of your deck. KO it or put it back.
  ra: makeHeroCard("Amadeus Cho", "Visualize The Variables", 8, u, 4, Color.TECH, "Champions", "", [
    () => addTurnTrigger('OUTWIT', () => true, ev => chooseMayEv(ev, "Use the ability an extra time", () => ev.parent.func(ev))),
    ev => mayOutwitEv(ev, () => lookAtDeckEv(ev, 1, () => selectCardOptEv(ev, "Choose a card to KO", playerState.revealed.deck, c => KOEv(ev, c)))) ]),
},
{
  name: "Bruce Banner",
  team: "Avengers",
// {OUTWIT}: When you draw a new hand of cards at the end of this turn, draw an extra card.
  c1: makeHeroCard("Bruce Banner", "Solve The Impossible", 2, u, 1, Color.TECH, "Avengers", "D", ev => mayOutwitEv(ev, () => addEndDrawMod(1))),
// {OUTWIT}: {TRANSFORM} this into Savage Hulk Unleashed.
// TRANSFORMED
// {SMASH 4}
  c2: makeTransformingHeroCard(
    makeHeroCard("Bruce Banner", "Gamma Bomb Disaster", 4, 2, u, Color.TECH, "Avengers", "D", ev => mayOutwitEv(ev, () => transformHeroEv(ev, ev.source))),
    makeHeroCard("Bruce Banner", "Savage Hulk Unleashed", 5, u, 0, Color.STRENGTH, "Avengers", "F", ev => smashEv(ev, 4)),
  ),
// {POWER Tech} Reveal the top card of your deck. If it costs 0, KO it.
  uc: makeHeroCard("Bruce Banner", "Dangerous Testing", 6, u, 3, Color.TECH, "Avengers", "F", ev => superPower(Color.TECH) && revealPlayerDeckEv(ev, 1, cards => cards.limit(c => c.cost === 0).each(c => KOEv(ev, c)))),
// {OUTWIT}: Look at the top three cards of your deck. Draw one of them, KO one, and put one back.
  ra: makeHeroCard("Bruce Banner", "Gamma Ray Experiment", 7, u, 4, Color.TECH, "Avengers", "", ev => mayOutwitEv(ev, () => lookAtThreeEv(ev, 'DRAW', 'KO'))),
},
{
  name: "Caiera",
  team: "Warbound",
// {OUTWIT}: Draw a card.
  c1: makeHeroCard("Caiera", "Shadow Queen", 2, u, 1, Color.COVERT, "Warbound", "FD", ev => mayOutwitEv(ev, () => drawEv(ev, 1))),
// {POWER Covert} {SMASH 2}
  c2: makeHeroCard("Caiera", "Shadowforged Blade", 4, u, 2, Color.COVERT, "Warbound", "FD", ev => superPower(Color.COVERT) && smashEv(ev, 2)),
// {OUTWIT}: You may KO a card from your hand or discard pile.
  uc: makeHeroCard("Caiera", "Focus The Old Power", 6, u, 2, Color.STRENGTH, "Warbound", "FD", ev => mayOutwitEv(ev, () => KOHandOrDiscardEv(ev, undefined))),
// Double the Recruit you have.
// If there are at least 3 Heroes per player in the KO pile, {TRANSFORM} this into Vengeful Destructor.
// TRANSFORMED
// Double the Attack you have.
  ra: makeTransformingHeroCard(
    makeHeroCard("Caiera", "Dutiful Protector", 7, u, u, Color.INSTINCT, "Warbound", "", [ ev => doubleRecruitEv(ev), ev => gameState.ko.count(isHero) >= 3 * gameState.players.size && transformHeroEv(ev, ev.source)]),
    makeHeroCard("Caiera", "Vengeful Destructor", 7, u, u, Color.STRENGTH, "Warbound", "F", ev => doubleAttackEv(ev)),
  ),
},
{
  name: "Gladiator Hulk",
  team: "Warbound",
// Draw a card.
// {SMASH 2}
  c1: makeHeroCard("Gladiator Hulk", "Don't Make Me Angry", 3, u, 0, Color.STRENGTH, "Warbound", "FD", [ ev => drawEv(ev, 1), ev => smashEv(ev, 2) ]),
// {SMASH 3}
// Then, if you discarded at least two cards this turn, {TRANSFORM} this into Hulk Is King and put it on top of your deck.
// TRANSFORMED
// When a card effect causes you to discard this card, you may return this card to your hand.
  c2: makeTransformingHeroCard(
    makeHeroCard("Gladiator Hulk", "Seize The Throne", 4, u, 0, Color.INSTINCT, "Warbound", "", [ ev => smashEv(ev, 3), ev => turnState.cardsDiscarded.size >= 2 && transformHeroEv(ev, ev.source, 'DECK') ]),
    makeHeroCard("Gladiator Hulk", "Hulk Is King", 5, u, 3, Color.STRENGTH, "Warbound", "", ev => [], { trigger: {
      event: 'DISCARD',
      match: (ev, source) => ev.what === source && ev.getSource() instanceof Card && owner(source) !== undefined,
      after: ev => chooseMayEv(ev, "Return to hand", () => moveCardEv(ev, ev.source, owner(ev.source).hand), owner(ev.source)),
    }}),
  ),
// {POWER Strength} {XDRAMPAGE Hulk}.
// If any players gained a Wound this way, you get {WOUNDED FURY}.
  uc: makeHeroCard("Gladiator Hulk", "The Green Scar", 5, u, 3, Color.STRENGTH, "Warbound", "", ev => {
    superPower(Color.STRENGTH) && xdRampageEv(ev, 'Hulk');
    cont(ev, () => turnState.pastEvents.has(e => e.type === 'GAIN' && isWound(e.what) && e.parent === ev) && woundedFuryEv(ev));
  }),
// You get double Attack from each Smash this turn.
// {SMASH 3}
  ra: makeHeroCard("Gladiator Hulk", "Double-Fisted Smashing", 8, u, 0, Color.STRENGTH, "Warbound", "", [ ev => turnState.smashMultiplier = 2, ev => smashEv(ev, 3) ]),
},
{
  name: "Hiroim",
  team: "Warbound",
// {POWER Covert} The first time you defeat a Villain this turn, rescue a Bystander.
  c1: makeHeroCard("Hiroim", "Seek Redemption", 3, u, 2, Color.COVERT, "Warbound", "D", ev => {
    let done = false;
    superPower(Color.COVERT) && addTurnTrigger('DEFEAT', ev => isVillain(ev.what) && !done, ev => {
      done = true;
      rescueEv(ev);
    })
  }),
// Draw a card.
// If there are at least two Bystanders in your Victory Pile, {TRANSFORM} this into Hiroim Redeemed.
// TRANSFORMED
// You get +1 Attack for every two Bystanders in your Victory Pile.
  c2: makeTransformingHeroCard(
    makeHeroCard("Hiroim", "Save from the Rubble", 4, 1, u, Color.COVERT, "Warbound", "", [ ev => drawEv(ev, 1), ev => playerState.victory.count(isBystander) >= 2 && transformHeroEv(ev, ev.source) ]),
    makeHeroCard("Hiroim", "Hiroim Redeemed", 5, u, 1, Color.STRENGTH, "Warbound", "F", ev => addAttackEvent(ev, Math.floor(playerState.victory.count(isBystander) / 2))),
  ),
// {TEAMPOWER Warbound} You may KO a 0-cost card from any player's discard pile. If you KO a Wound this way, rescue a Bystander.
  uc: makeHeroCard("Hiroim", "Mystic Shadow Priest", 6, u, 2, Color.COVERT, "Warbound", "D", ev => superPower("Warbound") && selectCardOptEv(ev, "Choose a card to KO", gameState.players.map(p => p.discard.limit(c => c.cost === 0)).merge(), c => {
    KOEv(ev, c);
    isWound(c) && rescueEv(ev);
  })),
// Choose one: Rescue three Bystanders, or defeat any Villain or Mastermind whose Attack is less than the number of Bystanders in your Victory Pile.
  ra: makeHeroCard("Hiroim", "Blade of the People", 7, u, u, Color.INSTINCT, "Warbound", "", ev => {
    chooseOneEv(ev, "Choose one",
      ["Rescue three Bystanders", () => rescueEv(ev, 3)],
      ["Defeat a Villain or Mastermind", () => selectCardEv(ev, "Choose a Villain or Mastermind to defeat", fightableCards().limit(c => c.defense < playerState.victory.count(isBystander)), c => defeatEv(ev, c))],
    );
  }),
},
{
  name: "Hulkbuster Iron Man",
  team: "Avengers",
// Draw a card.
// {POWER Tech} You get +2 Attack.
  c1: makeHeroCard("Hulkbuster Iron Man", "Pound for Pound", 2, u, 0, Color.STRENGTH, "Avengers", "FD", [ ev => drawEv(ev, 1), ev => superPower(Color.TECH) && addAttackEvent(ev, 2) ]),
// {OUTWIT}: {SMASH 2}
  c2: makeHeroCard("Hulkbuster Iron Man", "Attune Techtonic Transducer", 4, u, 2, Color.TECH, "Avengers", "FD", ev => mayOutwitEv(ev, () => smashEv(ev, 2))),
// {POWER Tech Strength} {TRANSFORM} this into Ultra-Massive Armor
// TRANSFORMED
// Draw two cards.
// {SMASH 2}
  uc: makeTransformingHeroCard(
    makeHeroCard("Hulkbuster Iron Man", "Build The Suit", 5, 3, u, Color.TECH, "Avengers", "F", ev => superPower(Color.TECH, Color.STRENGTH) && transformHeroEv(ev, ev.source)),
    makeHeroCard("Hulkbuster Iron Man", "Ultra-Massive Armor", 6, u, 0, Color.TECH, "Avengers", "FD", [ ev => drawEv(ev, 2), ev => smashEv(ev, 2) ]),
  ),
// You get +2 Attack for each other [Tech] and/or [Strength] card you played this turn.
  ra: makeHeroCard("Hulkbuster Iron Man", "Final Battle", 8, u, 5, Color.TECH, "Avengers", "D", ev => addAttackEvent(ev, 2 * turnState.cardsPlayed.count(c => isColor(Color.TECH)(c) || isColor(Color.STRENGTH)(c)))),
},
{
  name: "Joe Fixit, Grey Hulk",
  team: "Crime Syndicate",
// {POWER Strength} {SMASH 2}
  c1: makeHeroCard("Joe Fixit, Grey Hulk", "Carefully Considered Smashing", 3, 2, 0, Color.STRENGTH, "Crime Syndicate", "D", ev => superPower(Color.STRENGTH) && smashEv(ev, 2)),
// Choose a Villain. You can spend any combination of Recruit and Attack to fight it this turn.
  c2: makeHeroCard("Joe Fixit, Grey Hulk", "Threaten And Bribe", 4, 2, u, Color.COVERT, "Crime Syndicate", "D", ev => {
    selectCardEv(ev, "Choose a Villain", villains(), c => addTurnSet('fightCost', v => v === c, (c, prev) => ({...prev, attack: 0, either: (prev.either || 0) + (prev.attack || 0)})));
  }),
// When you defeat a Villain this turn that has 6 Attack or more, {TRANSFORM} this into Underworld Boss and put it on top of your deck.
// TRANSFORMED
// Choose a Villain in your Victory Pile, You get + Attack equal to it's printed VP.
  uc: makeTransformingHeroCard(
    makeHeroCard("Joe Fixit, Grey Hulk", "Ambitious Enforcer", 6, u, 3, Color.STRENGTH, "Crime Syndicate", "", ev => addTurnTrigger('DEFEAT', ev => isVillain(ev.what) && ev.what.defense >= 6, ev => transformHeroEv(ev, ev.source, 'DECK'))),
    makeHeroCard("Joe Fixit, Grey Hulk", "Underworld Boss", 6, u, 0, Color.INSTINCT, "Crime Syndicate", "F", ev => selectCardEv(ev, "Choose a Villain", playerState.victory.limit(isVillain), c => addAttackEvent(ev, c.printedVP || 0))),
  ),
// You can spend any combination of Recruit and Attack to fight the Mastermind this turn.
  ra: makeHeroCard("Joe Fixit, Grey Hulk", "Hulk Runs This Town", 7, u, 4, Color.COVERT, "Crime Syndicate", "", ev => {
    addTurnSet('fightCost', isMastermind, (c, prev) => ({...prev, attack: 0, either: (prev.either || 0) + (prev.attack || 0)}));
  }),
},
{
  name: "Korg",
  team: "Warbound",
// Draw a card.
// {POWER Strength} {SMASH 2}. If you {SMASH} a Wound this way, KO it.
  c1: makeHeroCard("Korg", "Nothing Beats Rock", 2, u, 0, Color.STRENGTH, "Warbound", "D", [ ev => drawEv(ev, 1), ev => superPower(Color.STRENGTH) && smashEv(ev, 2, c => isWound(c) && KOEv(ev, c))]),
// {OUTWIT}: Draw a card.
  c2: makeHeroCard("Korg", "Move Mountains", 4, u, 2, Color.STRENGTH, "Warbound", "FD", ev => mayOutwitEv(ev, () => drawEv(ev, 1))),
// {POWER Strength} {TRANSFORM} this into Lord of Granite.
// TRANSFORMED
// Draw a card.
// {SMASH 3}
  uc: makeTransformingHeroCard(
    makeHeroCard("Korg", "Forged By Fire", 3, 2, u, Color.STRENGTH, "Warbound", "FD", ev => superPower(Color.STRENGTH) && transformHeroEv(ev, ev.source)),
    makeHeroCard("Korg", "Lord of Granite", 5, u, 0, Color.COVERT, "Warbound", "F", [ ev => drawEv(ev, 1), ev => smashEv(ev, 3) ]),
  ),
// Put all cards from the HQ on the bottom of the Hero Deck in random order. You get their total printed Attack.
  ra: makeHeroCard("Korg", "Kronan Tactician", 8, u, 0, Color.STRENGTH, "Warbound", "", ev => hqCards().shuffled().each(c => { addAttackEvent(ev, c.printedAttack || 0); moveCardEv(ev, c, gameState.herodeck, true); })),
},
{
  name: "Miek, The Unhived",
  team: "Warbound",
// {SMASH 1}
  c1: makeHeroCard("Miek, The Unhived", "This Bug Smashes You", 3, u, 2, Color.INSTINCT, "Warbound", "D", ev => smashEv(ev, 1)),
// Look at the top card of your deck. Put it back on the top or bottom.
// {POWER Instinct} You may {FEAST}.
  c2: makeHeroCard("Miek, The Unhived", "Devouring Frenzy", 4, 2, u, Color.INSTINCT, "Warbound", "D", [
    ev => lookAtDeckEv(ev, 1, () => selectCardOptEv(ev, "Choose a card to put on the bottom of your deck", playerState.revealed.deck, c => moveCardEv(ev, c, playerState.deck, true))),
    ev => superPower(Color.INSTINCT) && chooseMayEv(ev, "Feast", () => feastEv(ev)),
  ]),
// Whenever a card is KO'd from your deck this turn, you may draw a card.
  uc: makeHeroCard("Miek, The Unhived", "Endless Appetite", 5, u, 3, Color.INSTINCT, "Warbound", "F", ev => addTurnTrigger('KO', ev => ev.where === playerState.deck, ev => drawEv(ev))),
// You may {FEAST}. Then, if a card with an Attack icon was KO'd from your deck this turn, {TRANSFORM} this into Hive King Miek.
// TRANSFORMED
// Look at the top three cards of your deck and put them back in any order. Then you may {FEAST}.
  ra: makeTransformingHeroCard(
    makeHeroCard("Miek, The Unhived", "Metamorphosis", 7, 5, u, Color.COVERT, "Warbound", "", [
      ev => chooseMayEv(ev, "Feast", () => feastEv(ev)),
      ev => turnState.pastEvents.has(e => e.type === 'KO' && ev.where === playerState.deck && hasAttackIcon(ev.what)) && transformHeroEv(ev, ev.source),
    ]),
    makeHeroCard("Miek, The Unhived", "Hive King Miek", 8, u, 6, Color.STRENGTH, "Warbound", "", [
      ev => lookAtDeckEv(ev, 3, () => {}),
      ev => chooseMayEv(ev, "Feast", () => feastEv(ev)),
    ]),
  ),
},
{
  name: "Namora",
  team: "Champions",
// Draw a card.
// {POWER Ranged} {SMASH 3}
  c1: makeHeroCard("Namora", "Crushing Tsunami", 3, u, 0, Color.RANGED, "Champions", "F", [ ev => drawEv(ev, 1), ev => superPower(Color.RANGED) && smashEv(ev, 3) ]),
// You get +1 Attack, usable only against Villains in the Sewers or Bridge or the Mastermind.
  c2: makeHeroCard("Namora", "Heart of the Ocean", 4, u, 2, Color.COVERT, "Champions", "D", ev => addAttackSpecialEv(ev, c => isMastermind(c) || isLocation(c.location, 'SEWERS', 'BRIDGE'), 1)),
// When you defeat a Villain in the Sewers or Bridge, {TRANSFORM} this into Master of Depths and put it on top of your deck.
// TRANSFORMED
// {SMASH 3}
// If you {SMASH} a 0-cost Hero this way, KO it.
  uc: makeTransformingHeroCard(
    makeHeroCard("Namora", "Herculean Effort", 5, 3, u, Color.RANGED, "Champions", "", ev => addTurnTrigger('DEFEAT', ev => isLocation(ev.where, 'SEWERS', 'BRIDGE') && isVillain(ev.what), ev => transformHeroEv(ev, ev.source, 'DECK'))),
    makeHeroCard("Namora", "Master of Depths", 6, u, 0, Color.STRENGTH, "Champions", "", ev => smashEv(ev, 3, c => c.cost === 0 && KOEv(ev, c))),
  ),
// {POWER Covert} If the Bridge is empty, you may move a Villain there from another city space. A Villain moved this way gets -3 Attack this turn.
  ra: makeHeroCard("Namora", "Turning The Tide", 7, u, 5, Color.COVERT, "Champions", "", ev => superPower(Color.COVERT) && withCity('BRIDGE', bridge => isCityEmpty(bridge) && selectCardOptEv(ev, "Choose a Villain to move to the Bridge", cityVillains(), c => {
    moveCardEv(ev, c, bridge);
    addTurnMod('defense', v => v === c, -3);
  }))),
},
{
  name: "No-Name, Brood Queen",
  team: "Warbound",
// If this is the first card you played this turn, draw a card.
  c1: makeHeroCard("No-Name, Brood Queen", "Surprise Attack", 2, u, 1, Color.COVERT, "Warbound", "FD", ev => turnState.cardsPlayed.size === 0 && drawEv(ev)),
// Look at the top card of your deck. Discard it or put it back.
// {POWER Covert} You may {FEAST}.
  c2: makeHeroCard("No-Name, Brood Queen", "Appetite for Destruction", 4, u, 2, Color.COVERT, "Warbound", "D", [
    ev => lookAtDeckEv(ev, 1, () => selectCardOptEv(ev, "Choose a card to discard", playerState.revealed.deck, c => discardEv(ev, c))),
    ev => superPower(Color.COVERT) && chooseMayEv(ev, "Feast", () => feastEv(ev))
  ]),
// You may {FEAST}. Then, if a non-grey Hero was KO'd from you deck this turn, {TRANSFORM} this into Torrent of Broodlings.
// TRANSFORMED
// Draw a card.
  uc: makeTransformingHeroCard(
    makeHeroCard("No-Name, Brood Queen", "Bursting With Life", 3, 2, u, Color.STRENGTH, "Warbound", "D", [
      ev => chooseMayEv(ev, "Feast", () => feastEv(ev)),
      ev => turnState.pastEvents.has(e => e.type === 'KO' && ev.where === playerState.deck && isNonGrayHero(ev.what)) && transformHeroEv(ev, ev.source),
    ]),
    makeHeroCard("No-Name, Brood Queen", "Torrent of Broodlings", 5, u, 2, Color.COVERT, "Warbound", "FD", ev => drawEv(ev, 1)),
  ),
// Look at the top card of your deck. Then {FEAST} up to three times. You get +2 Attack for each non-grey Hero that was KO'd from you deck this turn.
  ra: makeHeroCard("No-Name, Brood Queen", "World Spanning Hunger", 8, u, 4, Color.INSTINCT, "Warbound", "D", [
    ev => lookAtDeckEv(ev, 1, () => selectCardEv(ev, "Put the card back", playerState.revealed.deck, c => moveCardEv(ev, c, playerState.deck))),
    ev => chooseMayEv(ev, "Feast", () => { feastEv(ev); chooseMayEv(ev, "Feast again", () => { feastEv(ev); chooseMayEv(ev, "Feast again", () => feastEv(ev)); })}),
    ev => addAttackEvent(ev, 2 * turnState.pastEvents.count(e => e.type === 'KO' && ev.where === playerState.deck)),
  ]),
},
{
  name: "Rick Jones",
  team: "S.H.I.E.L.D.",
// {POWER Tech} Reveal the top card of your deck. If it's a S.H.I.E.L.D., draw it.
  c1: makeHeroCard("Rick Jones", "Hacktivist", 3, u, 2, Color.TECH, "S.H.I.E.L.D.", "FD", ev => superPower(Color.TECH) && drawIfEv(ev, 'S.H.I.E.L.D.')),
// Reveal the top card of your deck. If it costs 3 or more, {TRANSFORM} this into Captain Marvel.
// TRANSFORMED
// Reveal the top card of your deck. If it costs 3 or more, draw it.
  c2: makeTransformingHeroCard(
    makeHeroCard("Rick Jones", "Seek the Nega-Bands", 4, 2, u, Color.INSTINCT, "S.H.I.E.L.D.", "D", ev => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost >= 3) && transformHeroEv(ev, ev.source))),
    makeHeroCard("Rick Jones", "Captain Marvel", 5, u, 2, Color.RANGED, "S.H.I.E.L.D.", "FD", ev => drawIfEv(ev, c => c.cost >= 3)),
  ),
// If you have at least 5 Villains in your Victory Pile, {TRANSFORM} this into A-Bomb and put it on top of your deck.
// TRANSFORMED
// {SMASH 5}
  uc: makeTransformingHeroCard(
    makeHeroCard("Rick Jones", "Irradiated Blood", 5, u, 3, Color.TECH, "S.H.I.E.L.D.", "", ev => playerState.victory.count(isVillain) && transformHeroEv(ev, ev.source)),
    makeHeroCard("Rick Jones", "A-Bomb", 6, u, 0, Color.STRENGTH, "S.H.I.E.L.D.", "F", ev => smashEv(ev, 5)),
  ),
// If you defeat two Villains this turn, {TRANSFORM} this into The Destiny Force and put it on top of your deck.
// TRANSFORMED
// Count the number of different printed VP values in your Victory Pile. Draw that many cards.
  ra: makeTransformingHeroCard(
    makeHeroCard("Rick Jones", "Caught In Kree-Skrull War", 7, u, 4, Color.COVERT, "S.H.I.E.L.D.", "", ev => turnState.pastEvents.count(e => e.type === 'DEFEAT' && isVillain(e.what)) >= 2 && transformHeroEv(ev, ev.source, 'DECK')),
    makeHeroCard("Rick Jones", "The Destiny Force", 9, u, u, Color.RANGED, "S.H.I.E.L.D.", "", ev => drawEv(ev, playerState.victory.limit(c => c.printedVP !== undefined).uniqueCount(c => c.printedVP))),
  ),
},
{
  name: "Sentry",
  team: "Avengers",
// {TRANSFORM} this into Golden Guardian of Good and put it in your discard pile.
// TRANSFORMED
// You may {TRANSFORM} this into Agoraphobia and put it in your discard pile. If you do, you get +4 Attack.
  c1: makeTransformingHeroCard(
    makeHeroCard("Sentry", "Agoraphobia", 2, u, u, Color.COVERT, "Avengers", "FD", ev => transformHeroEv(ev, ev.source, 'DISCARD')),
    makeHeroCard("Sentry", "Golden Guardian of Good", 6, u, 0, Color.STRENGTH, "Avengers", "", ev => chooseMayEv(ev, "Transform back into Agoraphobia", () => { transformHeroEv(ev, ev.source, 'DISCARD'); addAttackEvent(ev, 4); })),
  ),
// You get +1 Attack for each card that <b>
// TRANSFORMED</b> this turn.
  c2: makeHeroCard("Sentry", "Rival Personalities", 4, u, 2, Color.STRENGTH, "Avengers", "D", ev => addAttackEvent(ev, turnState.pastEvents.count(e => e.type === 'TRANSFORM'))),
// Reveal the top card of your deck. If it costs 1 or more, {TRANSFORM} this into The Void Unchained and put it on top of your deck.
// TRANSFORMED
// Reveal the top card of your deck. If it costs 0, then {FEAST}. Otherwise, {TRANSFORM} this into Mournful Sentinel and put it in your discard pile.
  uc: makeTransformingHeroCard(
    makeHeroCard("Sentry", "Mournful Sentinel", 3, 2, u, Color.RANGED, "Avengers", "D", ev => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost >= 1) && transformHeroEv(ev, ev.source, 'DECK'))),
    makeHeroCard("Sentry", "The Void Unchained", 5, u, 3, Color.COVERT, "Avengers", "", ev => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost === 0) ? feastEv(ev) : transformHeroEv(ev, ev.source, 'DISCARD'))),
  ),
// Reveal the top five cards of the Hero Deck, gain their total printed Attack, and put them on the bottom of that deck. If this card makes 12 Attack or more, then {TRANSFORM} this card into The Void Mastermind and add it to the game at the start of the next turn with one random Tactic.
  ra: makeHeroCard("Sentry", "Vast Unstable Power", 8, u, 0, Color.RANGED, "Avengers", "D", ev => revealHeroDeckEv(ev, 5, cards => {
    const n = cards.sum(c => c.printedAttack || 0);
    addAttackEvent(ev, n);
    if (n > 12) {
      transformHeroEv(ev, ev.source);
      addFutureTrigger(ev => addMastermindEv(ev, 'The Void'));
    }
  }, false, true)),
},
{
  name: "She-Hulk",
  team: "Avengers",
// Once this turn, if you made at least 6 Recruit this turn, {TRANSFORM} this into Hurl Trucks.
// TRANSFORMED
// {SMASH 2}
// {SMASH 2}
  c1: makeTransformingHeroCard(
    makeHeroCard("She-Hulk", "Hurl Legal Objections", 3, 2, u, Color.INSTINCT, "Avengers", "D", ev => {
      let done = false;
      addTurnAction(new Ev(ev, 'EFFECT', {
        cost: { cond: () => !done && turnState.totalRecruit >= 6 },
        func: ev => { done = true; transformHeroEv(ev, ev.source); },
        what: ev.source,
        source: ev.source,
      }));  
    }),
    makeHeroCard("She-Hulk", "Hurl Trucks", 6, u, 2, Color.STRENGTH, "Avengers", "FD", [ ev => smashEv(ev, 2), ev => smashEv(ev, 2) ]),
  ),
// {OUTWIT}: Draw a card.
  c2: makeHeroCard("She-Hulk", "Window of Opportunity", 4, 2, u, Color.STRENGTH, "Avengers", "FD", ev => mayOutwitEv(ev, () => drawEv(ev, 1))),
// Once this turn, if you made at least 6 Recruit this turn, you may KO a card from your hand or discard pile.
  uc: makeHeroCard("She-Hulk", "Radioactive Riot", 6, u, 3, Color.STRENGTH, "Avengers", "", ev => {
    let done = false;
    addTurnAction(new Ev(ev, 'EFFECT', {
      cost: { cond: () => !done && turnState.totalRecruit >= 6 },
      func: ev => { done = true; selectCardAndKOEv(ev, handOrDiscard()); },
      what: ev.source,
    }));  
}),
// For every 2 Recruit you made this turn, Reveal the top card of the Hero Deck, put it on the bottom of that deck, and you get that card's printed Attack.
  ra: makeHeroCard("She-Hulk", "Jade Giantess", 8, 4, 0, Color.STRENGTH, "Avengers", "D", ev => {
    repeat(Math.floor(turnState.totalRecruit / 2), () => revealHeroDeckEv(ev, 1, cards => cards.each(c => { addAttackEvent(ev, c.printedAttack || 0); moveCardEv(ev, c, playerState.deck, true); }), false, true));
  }),
},
{
  name: "Skaar, Son of Hulk",
  team: "Avengers",
// {POWER Strength} {SMASH 3}
  c1: makeHeroCard("Skaar, Son of Hulk", "Anger Management", 3, u, 1, Color.STRENGTH, "Avengers", "F", ev => superPower(Color.STRENGTH) && smashEv(ev, 3)),
// {POWER Instinct} {WOUNDED FURY}
  c2: makeHeroCard("Skaar, Son of Hulk", "Scarred Past", 3, u, 2, Color.INSTINCT, "Avengers", "FD", ev => superPower(Color.INSTINCT) && woundedFuryEv(ev)),
// {POWER Instinct} You may gain a Wound. If you do, {TRANSFORM} this into Raging Savage.
// TRANSFORMED
// {WOUNDED FURY}
  uc: makeTransformingHeroCard(
    makeHeroCard("Skaar, Son of Hulk", "Mood Swings", 5, 3, u, Color.INSTINCT, "Avengers", "F", ev => superPower(Color.INSTINCT) && chooseMayEv(ev, "Gain a Wound and Transform", () => {
      gainWoundEv(ev);
      transformHeroEv(ev, ev.source);
    })),
    makeHeroCard("Skaar, Son of Hulk", "Raging Savage", 6, u, 3, Color.STRENGTH, "Avengers", "F", ev => woundedFuryEv(ev)),
  ),
// {WOUNDED FURY}
// Then, you may KO any number of Wounds from your hand and/or discard pile, then draw that many cards.
  ra: makeHeroCard("Skaar, Son of Hulk", "Planetary-Level Revenge", 8, u, 4, Color.STRENGTH, "Avengers", "", [ ev => woundedFuryEv(ev), ev => {
    let count = 0;
    selectObjectsAnyEv(ev, "Choose Wounds to KO", handOrDiscard(), c => { KOEv(ev, c); count++; });
    cont(ev, () => drawEv(ev, count));
  } ]),
},
]);
addHeroTemplates("Ant-Man", [
{
  name: "Ant-Man",
  team: "Avengers",
// {SIZECHANGING TECH}
// Draw a card.
  c1: makeHeroCard("Ant-Man", "Ride the Ants", 4, u, 1, Color.TECH, "Avengers", "F", ev => drawEv(ev, 1), { sizeChanging: Color.TECH }),
// {USIZECHANGING TECH 3}
// {POWER Tech} You may discard a card. If you do, draw a card.
  c2: makeHeroCard("Ant-Man", "Risky Science", 5, u, 2, Color.TECH, "Avengers", "D", ev => superPower(Color.TECH) && selectCardOptEv(ev, "Choose a card to discard", playerState.hand.deck, c => {
    discardEv(ev, c); drawEv(ev);
  }), { uSizeChanging: { color: Color.TECH, amount: 3 } }),
// {SIZECHANGING TECH}
// You get +1 Attack for each extra card you drew this turn.
  uc: makeHeroCard("Ant-Man", "Giant Ego", 6, u, 2, Color.STRENGTH, "Avengers", "D", ev => addAttackEvent(ev, pastEvents('DRAW').count(e => e.who === playerState)), { sizeChanging: Color.TECH }),
// {USIZECHANGING TECH 5}
// A hero in the HQ without <b>Size-Changing</b> abilities gain {SIZECHANGING TECH} this turn.
  ra: makeHeroCard("Ant-Man", "Pym Particles", 9, u, 5, Color.TECH, "Avengers", "", ev => selectCardEv(ev, "Choose a Hero", hqHeroes().limit(hasNoSizeChanging), c => {
    addTurnSet('sizeChanging', v => v === c, (c, n) => safeOr(n, Color.TECH));
  }), { uSizeChanging: { color: Color.TECH, amount: 5 } }),
},
{
  name: "Wasp",
  team: "Avengers",
// {USIZECHANGING COVERT 2}
// {POWER Covert} You get +2 Attack.
  c1: makeHeroCard("Wasp", "Bio-Electric Sting", 3, u, 1, Color.COVERT, "Avengers", "FD", ev => superPower(Color.COVERT) && addAttackEvent(ev, 2), { uSizeChanging: { color: Color.COVERT, amount: 2 } }),
// {SIZECHANGING COVERT}
// {POWER Covert} Draw a card.
  c2: makeHeroCard("Wasp", "Tiny Winged Justice", 4, 2, u, Color.COVERT, "Avengers", "FD", ev => superPower(Color.COVERT) && drawEv(ev, 1), { sizeChanging: Color.COVERT }),
// {SIZECHANGING COVERT}
// You get +1 Attack for each card you recruited this turn.
  uc: makeHeroCard("Wasp", "Swarm Tactics", 6, u, 2, Color.RANGED, "Avengers", "D", ev => addAttackEvent(ev, pastEvents('RECRUIT').size), { sizeChanging: Color.COVERT }),
// {USIZECHANGING COVERT 5}
// {TEAMPOWER Avengers} You get +1 Attack for each other Avengers card you played this turn.
  ra: makeHeroCard("Wasp", "Founding Avenger", 9, u, 4, Color.COVERT, "Avengers", "", ev => addAttackEvent(ev, superPower("Avengers")), { uSizeChanging: { color: Color.COVERT, amount: 5 } }),
},
{
  name: "Jocasta",
  team: "Avengers",
// {POWER Tech} You get <b>Empowered</b> by [Tech].
  c1: makeHeroCard("Jocasta", "Creation of Ultron", 3, u, 2, Color.TECH, "Avengers", "FD", ev => superPower(Color.TECH) && empowerEv(ev, Color.TECH)),
// If your discard pile is empty, you get +2 Recruit. Otherwise, shuffle your discard pile into your deck.
  c2: makeHeroCard("Jocasta", "Reprocess", 4, 2, u, Color.RANGED, "Avengers", "D", ev => {
    playerState.discard.size ? addRecruitEvent(ev, 2) : shuffleIntoEv(ev, playerState.discard, playerState.deck);
  }),
// {SIZECHANGING TECH}
// Draw two cards.
  uc: makeHeroCard("Jocasta", "Holographic Image Inducer", 6, u, u, Color.TECH, "Avengers", "F", ev => drawEv(ev, 2), { sizeChanging: Color.TECH }),
// If your discard pile is empty, you get +2 Attack. Otherwise shuffle your discard pile into your deck.
// GUN: 1
  ra: makeHeroCard("Jocasta", "Electromagnetic Eyebeams", 7, u, 5, Color.RANGED, "Avengers", "GD", ev => {
    playerState.discard.size ? addAttackEvent(ev, 2) : shuffleIntoEv(ev, playerState.discard, playerState.deck);
  }),
},
{
  name: "Wonder Man",
  team: "Avengers",
// Chose one: Draw a card, or you get <b>Empowered</b> by [Strength].
  c1: makeHeroCard("Wonder Man", "One-Hit Wonder", 2, u, 0, Color.STRENGTH, "Avengers", "FD", ev => chooseOneEv(ev, "Choose one",
    ['Draw a card', ev => drawEv(ev)],
    ['Get Empowered', ev => empowerEv(ev, Color.STRENGTH)],
  )),
// You may put a card from the HQ on the bottom of the Hero Deck.
// {POWER Ranged} You get <b>Empowered</b> by [Ranged].
  c2: makeHeroCard("Wonder Man", "Ionic Energy", 4, u, 2, Color.RANGED, "Avengers", "D", [
    ev => selectCardOptEv(ev, "Choose a card to put on the bottom of the Hero Deck", hqCards(), c => moveCardEv(ev, c, gameState.herodeck, true)),
    ev => superPower(Color.RANGED) && empowerEv(ev, Color.RANGED),
  ]),
// Put a card from the HQ on the bottom of the Hero Deck. If that card had a Recruit icon, you get +3 Recruit. If that card had an Attack icon, you get +3 Attack. (if both, get both).
  uc: makeHeroCard("Wonder Man", "Absorb Ambient Power", 5, 0, 0, Color.RANGED, "Avengers", "", ev => {
    selectCardEv(ev, "Choose a card to put on the bottom of the Hero Deck", hqCards(), c => {
      moveCardEv(ev, c, gameState.herodeck, true);
      hasRecruitIcon(c) && addRecruitEvent(ev, 3);
      hasAttackIcon(c) && addAttackEvent(ev, 3);
    });
  }),
// <b>Size-Changing</b> [Strength] // FIX
// Choose any number of cards from the HQ. Put them on the bottom of the Hero Deck. Then you get <b>Empowered</b> by [Ranged] and [Strength].
  ra: makeHeroCard("Wonder Man", "8th Wonder of the World", 8, u, 4, Color.STRENGTH, "Avengers", "", ev => {
    selectObjectsAnyEv(ev, "Choose any number of cards", hqCards(), c => moveCardEv(ev, c, gameState.herodeck, true));
    cont(ev, () => empowerEv(ev, Color.RANGED | Color.STRENGTH));
  }, { sizeChanging: Color.STRENGTH }),
},
{
  name: "Black Knight",
  team: "Avengers",
// You get <b>Empowered</b> by the color of your choice.
  c1: makeHeroCard("Black Knight", "Amulet of Avalon", 3, u, 0, Color.INSTINCT, "Avengers", "F", ev => chooseClassEv(ev, c => empowerEv(ev, c))), // TODO choose color
// {POWER Strength} Return a 0-cost card from your discard pile to your hand.
// GUN: 1
  c2: makeHeroCard("Black Knight", "Defend the Weak", 3, 2, u, Color.STRENGTH, "Avengers", "GD", ev => superPower(Color.STRENGTH) && selectCardEv(ev, "Choose a card to return to your hand", playerState.discard.limit(c => c.cost === 0), c => moveCardEv(ev, c, playerState.hand))),
// When a Master Strike is played, before it takes effect, you may discard this card. If you do, draw three extra cards at the end of this turn.
  uc: makeHeroCard("Black Knight", "Flying Steed", 6, u, 3, Color.COVERT, "Avengers", "", [], { trigger: {
    event: 'STRIKE',
    match: (ev, source) => source.location === owner(source).hand,
    before: ev => chooseMayEv(ev, "Discard Black Knight to draw extra cards", () => { discardEv(ev, ev.source); addEndDrawMod(3); })
  }}),
// You get + Attack equal to the printed Attack of a Villain in your Victory Pile. (Mastermind tactics aren't Villains).
  ra: makeHeroCard("Black Knight", "The Ebony Blade", 7, u, 0, Color.INSTINCT, "Avengers", "", ev => selectCardEv(ev, "Choose a Villain", playerState.victory.limit(isVillain), c => {
    addAttackEvent(ev, c.printedDefense);
  })),
},
]);
addHeroTemplates("Venom", [
{
  name: "Carnage",
  team: "Venomverse",
// {VIOLENCE} Draw a card.
  c1: makeHeroCard("Carnage", "Rending Claws", 3, u, 2, Color.INSTINCT, "Venomverse", "FD", [], { excessiveViolence: ev => drawEv(ev) }),
// {DIGEST 4} Draw two cards.
// {INDIGESTION} You get +2 Recruit.
  c2: makeHeroCard("Carnage", "Carnivore", 4, 0, u, Color.STRENGTH, "Venomverse", "FD", ev => digestEv(ev, 4, () => drawEv(ev, 2), () => addRecruitEvent(ev, 2))),
// {VIOLENCE} Reveal the top card of your deck. You may KO it.
  uc: makeHeroCard("Carnage", "Gruesome Feast", 6, u, 3, Color.COVERT, "Venomverse", "", [], { excessiveViolence: ev => revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c))) }),
// {VIOLENCE} Reveal the top card of your deck. If it costs 0, KO it and you may repeat this process.
  ra: makeHeroCard("Carnage", "Feast or Famine", 8, u, 6, Color.COVERT, "Venomverse", "", [], { excessiveViolence: ev => {
    const f = () => {
      let again = false;
      revealPlayerDeckEv(ev, 1, cards => cards.limit(c => c.cost === 0).each(c => {
        KOEv(ev, c);
        chooseMayEv(ev, "Repeat", () => again = true);
      }));
      cont(ev, () => again && f());
    };
    f();
  } }),
},
{
  name: "Venom",
  team: "Venomverse",
// {DIGEST 3} You get +2 Attack.
// {INDIGESTION} You get +2 Recruit.
// {POWER Instinct} Instead, you get both.
  c1: makeHeroCard("Venom", "Devouring Drool", 3, 0, 0, Color.INSTINCT, "Venomverse", "D", ev => digestEv(ev, 3, () => addAttackEvent(ev, 2), () => addRecruitEvent(ev, 2), superPower(Color.INSTINCT))),
// {VIOLENCE} You get +2 Recruit.
  c2: makeHeroCard("Venom", "Razor Teeth", 4, 0, 2, Color.STRENGTH, "Venomverse", "FD", [], { excessiveViolence: ev => addRecruitEvent(ev, 2) }),
// <b>Choose one</b>:
// - You get +1 Recruit for each other card you played this turn with a Recruit icon.
// - Or you get +1 Attack for each other card you played this turn with an Attack icon.
  uc: makeHeroCard("Venom", "Symbiotic Adaptation", 6, 0, 0, Color.INSTINCT, "Venomverse", "", ev => chooseOneEv(ev, "Choose one",
    ['Recruit', () => addRecruitEvent(ev, turnState.cardsPlayed.count(hasRecruitIcon))],
    ['Attack', () => addAttackEvent(ev, turnState.cardsPlayed.count(hasAttackIcon))],
  )),
// {DIGEST 8} KO a card from your Victory Pile. You get +6 Attack.
// {INDIGESTION} KO a card from your hand or discard pile. You get +6 Recruit.
// {TEAMPOWER Venomverse, Venomverse} Instead, do both.
  ra: makeHeroCard("Venom", "Insatiable Hunger", 8, 0, 0, Color.INSTINCT, "Venomverse", "", ev => digestEv(ev, 8, () => {
    selectCardAndKOEv(ev, playerState.victory.deck);
    addAttackEvent(ev, 6);
  }, () => {
    selectCardAndKOEv(ev, handOrDiscard());
    addRecruitEvent(ev, 6);
  }, superPower("Venomverse", "Venomverse"))),
},
{
  name: "Venom Rocket",
  team: "Venomverse",
// {DIGEST 3} You may discard a card. If you do, draw a card.
// GUN: 1
  c1: makeHeroCard("Venom Rocket", "Hungry for Action", 3, u, 2, Color.INSTINCT, "Venomverse", "GFD", ev => digestEv(ev, 3, () => {
    selectCardOptEv(ev, "Choose a card to discard", playerState.hand.deck, c => { discardEv(ev, c); drawEv(ev); });
  })),
// If a Master Strike or Villain that has an Ambush ability was played this turn, you get +1 Attack.
  c2: makeHeroCard("Venom Rocket", "Spring the Trap", 4, u, 2, Color.TECH, "Venomverse", "FD", ev => {
    (pastEvents('STRIKE').size || pastEvents('CARDEFFECT').has(e => e.effectName === 'ambush')) && addAttackEvent(ev, 1); // TODO has ambush
  }),
// {VIOLENCE} You may KO a card from your hand or discard pile.
  uc: makeHeroCard("Venom Rocket", "Serious Overkill", 5, u, 2, Color.RANGED, "Venomverse", "D", [], { excessiveViolence: ev => KOHandOrDiscardEv(ev) }),
// When a Master Strike is played, before it takes effect, you may put Ultimate Survivor from your hand on top of your deck. If you do, you may put any card from the HQ into your hand.
// GUN: 1
  ra: makeHeroCard("Venom Rocket", "Ultimate Survivor", 7, u, 5, Color.TECH, "Venomverse", "G", [], { trigger: {
    event: 'STRIKE',
    match: (ev, source) => owner(source) && source.location === owner(source).hand,
    before: ev => {
      chooseMayEv(ev, "Put Ultimate Survivor on the top of your deck", () => {
        moveCardEv(ev, ev.source, owner(ev.source).deck);
        selectCardOptEv(ev, "Choose a card", hqCards(), c => moveCardEv(ev, c, owner(ev.source).hand), () => {}, owner(ev.source));
      }, owner(ev.source));
    }
  }}),
},
{
  name: "Venomized Dr. Strange",
  team: "Venomverse",
// {DIGEST 2} Draw a card.
  c1: makeHeroCard("Venomized Dr. Strange", "Cauldron of the Cosmos", 2, 1, u, Color.RANGED, "Venomverse", "FD", ev => digestEv(ev, 2, () => drawEv(ev))),
// {POWER Ranged} Reveal the top card of your deck. If it costs 0, discard it and you get +2 Attack.
  c2: makeHeroCard("Venomized Dr. Strange", "See Future Timelines", 4, u, 2, Color.RANGED, "Venomverse", "D", ev => superPower(Color.RANGED) && revealPlayerDeckEv(ev, 1, cards => {
    cards.limit(c => c.cost === 0).each(c => { discardEv(ev, c); addAttackEvent(ev, 2); });
  })),
// If you played a 4-cost card and a 2-cost card this turn, you get +2 Attack.
  uc: makeHeroCard("Venomized Dr. Strange", "Complete the Grand Ritual", 6, u, 4, Color.INSTINCT, "Venomverse", "D", ev => {
    turnState.cardsPlayed.has(c => c.cost === 4) && turnState.cardsPlayed.has(c => c.cost === 2) && addAttackEvent(ev, 2);
  }),
// Reveal the top three cards of your deck. Draw one of them, discard one, and KO one.
// {TEAMPOWER Venomverse, Venomverse} Do this ability again.
  ra: makeHeroCard("Venomized Dr. Strange", "Crystal of Kadavus", 8, u, 4, Color.RANGED, "Venomverse", "", ev => {
    repeat(superPower("Venomverse", "Venomverse") ? 2 : 1, () => revealThreeEv(ev, 'DRAW', 'DISCARD', 'KO'));
  }),
},
{
  name: "Venompool",
  team: "Venomverse",
// {DIGEST 2} You get +2 Attack.
// {INDIGESTION} "Rescue" a Bystander.
// {POWER Strength} Instead, you get both.
  c1: makeHeroCard("Venompool", "Digest That Chimichanga", 2, u, 0, Color.STRENGTH, "Venomverse", "D", ev => digestEv(ev, 2, () => addAttackEvent(ev, 2), () => rescueEv(ev), superPower(Color.STRENGTH))),
// Draw two cards. But you can't draw any more cards until the end of this turn.
// GUN: 1
  c2: makeHeroCard("Venompool", "Shenanigans", 3, u, u, Color.TECH, "Venomverse", "GF", ev => {
    drawEv(ev, 2);
    cont(ev, () => addTurnTrigger('DRAW', ev => ev.who === playerState && ev.parent.type !== 'CLEANUP', { replace: () => {} }));
  }),
// Whenever you Rescue a Bystander this turn, do any "rescue" ability on it an extra time.
// {VIOLENCE} "Rescue" a Bystander.
  uc: makeHeroCard("Venompool", "Can I Get a Little Gratitude", 5, u, 3, Color.INSTINCT, "Venomverse", "", ev => {
    addTurnTrigger('RESCUE', ev => ev.who === playerState, ev => {
      const rescue = getModifiedStat(ev.parent.what, 'rescue', ev.parent.what.rescue);
      if (rescue) pushEv(ev, "EFFECT", { source: ev.parent.what, func: rescue, who: playerState });
    });
  }, { excessiveViolence: ev => rescueEv(ev) }),
// {DIGEST 7} You get +1 Attack for each two Bystanders in your Victory Pile.
// {INDIGESTION} "Rescue" two Bystanders.
// {TEAMPOWER Venomverse, Venomverse} Instead, do both (in order).
  ra: makeHeroCard("Venompool", "Play to the Crowd", 7, u, 4, Color.STRENGTH, "Venomverse", "", ev => digestEv(ev, 7, () => {
    addAttackEvent(ev, Math.floor(playerState.victory.count(isBystander) / 2));
  }, () => rescueEv(ev, 2), superPower("Venomverse", "Venomverse"))),
},
]);
addHeroTemplates("Dimensions", [
{
  name: "Howard the Duck",
  team: "(Unaffiliated)",
// Reveal the top card of the Bystander Deck. If it's a Special Bystander, rescue it. Otherwise, put it on the bottom of that deck.
// This is a copy of Gwenpool card effect
  c1: makeHeroCard("Howard the Duck", "Traveling Companion", 3, 2, u, Color.INSTINCT, u, "D", ev => gameState.bystanders.withTop(c => {
    c.rescue ? rescueEv(ev, c) : moveCardEv(ev, c, gameState.bystanders, true);
  })),
// Reveal the top card of your deck. If it costs 0 Cost or has no team icon, draw it.
  c2: makeHeroCard("Howard the Duck", "Rebel Without a Cause", 4, u, 2, Color.COVERT, u, "D", ev => drawIfEv(ev, c => c.cost === 0 || !c.team)),
// You get +1 Attack for each other Hero you played this turn with no team icon.
  uc: makeHeroCard("Howard the Duck", "Right Place, Wrong Time", 5, u, 3, Color.INSTINCT, u, "", ev => addAttackEvent(ev, turnState.cardsPlayed.count(c => !c.team))),
// Reveal the top three cards of your deck. Draw one of them, discard one, and KO one.
  ra: makeHeroCard("Howard the Duck", "Interplanetary Visitor", 7, u, 4, Color.TECH, u, "", ev => revealThreeEv(ev, 'DRAW', 'DISCARD', 'KO')),
},
{
  name: "Jessica Jones",
  team: "Marvel Knights",
// {SWITCHEROO 4}
  c1: makeHeroCard("Jessica Jones", "Alter Ego", 3, u, 2, Color.STRENGTH, "Marvel Knights", "FD", [], { cardActions: [ switcherooActionEv(4) ] }),
// {SWITCHEROO 5}
// <b>Investigate</b> for a card with an Attack icon.
  c2: makeHeroCard("Jessica Jones", "Alias Investigations", 4, u, 1, Color.COVERT, "Marvel Knights", "", ev => investigateEv(ev, hasAttackIcon), { cardActions: [ switcherooActionEv(5) ] }),
// {SWITCHEROO 6}
// <b>Investigate</b> for a card with a Recruit icon. You may draw that card or KO it.
  uc: makeHeroCard("Jessica Jones", "Crack the Case", 5, 3, u, Color.STRENGTH, "Marvel Knights", "", ev => investigateEv(ev, hasRecruitIcon, playerState.deck, c => {
    chooseOneEv(ev, "Choose", ["Draw", () => drawCardEv(ev, c)], ["KO", () => KOEv(ev, c)]);
  }), { cardActions: [ switcherooActionEv(6) ] }),
// {POWER Covert} <b>Investigate</b> the Villain Deck for a Villain. You may put it into your Victory Pile and do its Fight effect. Otherwise, put it back on the top or bottom of that deck.
  ra: makeHeroCard("Jessica Jones", "Uncover Hidden Evil", 7, u, 4, Color.COVERT, "Marvel Knights", "", ev => {
    superPower(Color.COVERT) && investigateEv(ev, isVillain, gameState.villaindeck, c => {
      chooseOneEv(ev, "Put the Villain",
        ["Your Victory Pile", () => {
          moveCardEv(ev, c, playerState.victory);
          pushEffects(ev, c, 'fight', c.fight); // TODO abstract this
        }],
        ["Top of the Villain Deck", () => moveCardEv(ev, c, gameState.villaindeck)],
        ["Bottom of the Villain Deck", () => moveCardEv(ev, c, gameState.villaindeck, true)],
      )
    });
  }),
},
{
  name: "Man-Thing",
  team: "(Unaffiliated)",
// {TELEPORT}
// You get +2 Attack, usable only against Villains in the Sewers or the Mastermind
  c1: makeHeroCard("Man-Thing", "Form from Ooze", 2, u, 0, Color.STRENGTH, u, "D", ev => addAttackSpecialEv(ev, c => isMastermind(c) || isLocation(c.location, 'SEWERS'), 2), { teleport: true }),
// Choose a Villain or Mastermind. If there are no other Villains adjacent to it, it gets -1 Attack this turn.
  c2: makeHeroCard("Man-Thing", "Burn the Fearful", 4, u, 2, Color.INSTINCT, u, "D", ev => {
    const cards = cityVillains().limit(c => !cityAdjacent(c.location).has(d => d.has(isVillain)));
    gameState.city[0].has(isVillain) || gameState.mastermind.each(c => cards.push(c));
    selectCardEv(ev, "Choose a Villain or Mastermind", cards, c => addTurnMod('defense', v => v === c, -1));
  }),
// {TELEPORT}
// You may move a Villain to another city space. If another Villain is already there, swap them.
  uc: makeHeroCard("Man-Thing", "Travel the Nexus of Realities", 5, 3, u, Color.COVERT, u, "", ev => {
    selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
      selectCardEv(ev, "Choose a new city space", gameState.city, dest => swapCardsEv(ev, v.location, dest));
    });
  }, { teleport: true }),
// {POWER Strength} You get +1 Attack for each empty city space.
  ra: makeHeroCard("Man-Thing", "Eternity of Solitude", 7, u, 5, Color.STRENGTH, u, "", ev => superPower(Color.STRENGTH) && addAttackEvent(ev, gameState.city.count(isCityEmpty))),
},
{
  name: "Ms. America",
  team: "Avengers",
// {TELEPORT}
// {POWER Strength} You get +2 Attack.
  c1: makeHeroCard("Ms. America", "Star Power", 3, u, 1, Color.STRENGTH, "Avengers", "FD", ev => superPower(Color.STRENGTH) && addAttackEvent(ev, 2), { teleport: true }),
// <b>Investigate</b> for an Avengers card and {TELEPORT} that card.
  c2: makeHeroCard("Ms. America", "Search Parallel Dimensions", 4, 2, u, Color.RANGED, "Avengers", "FD", ev => investigateEv(ev, 'Avengers', playerState.deck, c => teleportEv(ev, c))),
// {POWER Strength} Reveal the top card of your deck. KO it or {TELEPORT} it.
  uc: makeHeroCard("Ms. America", "Kick a Hole in Reality", 6, u, 3, Color.STRENGTH, "Avengers", "F", ev => superPower(Color.STRENGTH) && revealPlayerDeckEv(ev, 1, cards => cards.each(c => {
    chooseOneEv(ev, "Choose", ["KO", () => KOEv(ev, c)], ["Teleport", () => teleportEv(ev, c)]);
  }))),
// You get +1 Attack for each other card in your hand.
  ra: makeHeroCard("Ms. America", "Hyper-Cosmic Awareness", 7, u, 0, Color.COVERT, "Avengers", "F", ev => addAttackEvent(ev, playerState.hand.size)),
},
{
  name: "Squirrel Girl",
  team: "Avengers",
// {SWITCHEROO 3}
// <b>Investigate</b> for a card that costs 3 or less.
  c1: makeHeroCard("Squirrel Girl", "Find Tiny Friends", 2, u, u, Color.INSTINCT, "Avengers", "D", ev => investigateEv(ev, c => c.cost <= 3), { cardActions: [ switcherooActionEv(3) ] }),
// {SWITCHEROO 4}
// {POWER Instinct} You get +2 Attack.
  c2: makeHeroCard("Squirrel Girl", "Nut Punch", 3, u, 1, Color.INSTINCT, "Avengers", "FD", ev => superPower(Color.INSTINCT) && addAttackEvent(ev, 2), { cardActions: [ switcherooActionEv(4) ] }),
// {SWITCHEROO 5}
// You get +2 Attack if at least 2 cards entered the HQ this turn.
  uc: makeHeroCard("Squirrel Girl", "Squirrelgility", 4, u, 2, Color.COVERT, "Avengers", "D", ev => {
    pastEvents('MOVECARD').count(e => e.to.isHQ) >= 2 && addAttackEvent(ev, 2);
  }, { cardActions: [ switcherooActionEv(5) ] }),
// You may choose a number from 1 to 5. A Hero in your hand gains <b>Switcheroo</b> for that number.
// {POWER Instinct Instinct} You may choose a number from 1 to 8 instead.
  ra: makeHeroCard("Squirrel Girl", "Unbeatable Squirrel Girl", 8, u, 5, Color.INSTINCT, "Avengers", "", ev => {
    chooseNumberEv(ev, "Choose a number", 1, superPower(Color.INSTINCT, Color.INSTINCT) ? 8 : 5, n => {
      selectCardEv(ev, "Choose a Hero", playerState.hand.limit(isHero), c => {
        addTurnAction(switcherooActionEv(n)(c, ev));
      })
    });
  }),
},
]);
