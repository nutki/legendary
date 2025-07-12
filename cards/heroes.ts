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
  uc: makeHeroCard("Captain America", "Diving Block", 6, u, 4, Color.TECH, "Avengers", "", [], { trigger:
    youMayRevealThisInsteadEv("GAIN", (ev, source) => isWound(ev.what) && owner(source) === ev.who, "draw a card", ev => drawEv(ev, 1, owner(ev.source)))
  }),
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
    if (p === playerState || superPower(Color.INSTINCT)) revealPlayerDeckEv(ev, 1, cards => {
      selectCardOptEv(ev, "Select a card to discard", cards, sel => discardEv(ev, sel));
    }, p, playerState);
  })),
// ATTACK: 4+
// Reveal the top card of your deck. You get + Attack equal to that card's cost.
// COST: 7
  ra: makeHeroCard("Gambit", "High Stakes Jackpot", 7, u, 4, Color.INSTINCT, "X-Men", "",
    ev => revealPlayerDeckEv(ev, 1, cards => cards.each(c => addAttackEvent(ev, c.cost)))
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
    eachPlayer(p => revealPlayerDeckEv(ev, 1, cards => cards.each(c => { isHero(c) && revealed.push(c); discardEv(ev, c); }), p));
    cont(ev, () => selectCardOrderEv(ev, "Choose a card to copy", revealed, c => playCopyEv(ev, c)));
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
    revealPlayerDeckEv(ev, 3, cards => cards.limit(c => c.cost <= 2).map(c => moveCardEv(ev, c, playerState.hand)));
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
  ra: makeHeroCard("Wolverine", "Berserker Rage", 8, u, 0, Color.INSTINCT, "X-Men", "", [ ev => drawEv(ev, 3), ev => superPower(Color.INSTINCT) && addAttackEvent(ev, cardsDrawn()) ]),
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
    revealPlayerDeckEv(ev, 4, cards => {
      addAttackEvent(ev, cards.sum(c => c.printedAttack || 0));
      cards.each(c => discardEv(ev, c));
      if (superPower("X-Men")) selectObjectsAnyEv(ev, "KO cards", [...cards], c => KOEv(ev, c));
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
  c1: makeHeroCard("Cable", "Disaster Survivalist", 3, 2, u, Color.TECH, "X-Force", "D", [], { trigger:
    youMayDiscardThisInsteadEv("STRIKE", () => true, "draw three extra cards", ev => {
      KOEv(ev, ev.what);
      owner(ev.source) === playerState ? addEndDrawMod(3) : addTurnTrigger("CLEANUP", undefined, tev => drawEv(tev, 3, owner(ev.source)));
    })
  }),
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
  c2: makeHeroCard("Colossus", "Invulnerability", 3, 2, u, Color.STRENGTH, "X-Force", "D", [], { trigger:
    youMayDiscardThisInsteadEv("GAIN", (ev, source) => isWound(ev.what) && ev.who === owner(source), "draw two cards", ev => drawEv(ev, 2, owner(ev.source)))
  }),
// ATTACK: 4+
// {POWER Strength} You get +2 Attack.
// COST: 6
// FLAVOR: No one expects an enormous metal brawler to take the stealthy approach.
  uc: makeHeroCard("Colossus", "Silent Statue", 6, u, 4, Color.COVERT, "X-Force", "FD", ev => { if (superPower(Color.STRENGTH)) addAttackEvent(ev, 2); }),
// ATTACK: 6
// If another player would gain a Wound, you may reveal this card to gain that Wound and draw a card.
// COST: 8
  ra: makeHeroCard("Colossus", "Russian Heavy Tank", 8, u, 6, Color.STRENGTH, "X-Force", "", [], { trigger:
    youMayRevealThisInsteadEv("GAIN", (ev, source) => isWound(ev.what) && ev.who !== owner(source), "draw a card", ev => {
      gainEv(ev, ev.parent.what, owner(ev.source)); drawEv(ev, 1, owner(ev.source));
    })
  }),
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
    chooseCostEv(ev, n => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost === n) && addAttackEvent(ev, 2)));
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
  ra: makeHeroCard("Iceman", "Impenetrable Ice Wall", 8, u, 7, Color.RANGED, "X-Men", "", [], { triggers: [
    youMayRevealThisInsteadEv("GAIN", (ev, source) => isWound(ev.what) && owner(source) === ev.who && (isVillain(ev.getSource()) || isMastermind(ev.getSource()) || isTactic(ev.getSource())),
      "prevent gaining a Wound", () => {}),
    youMayRevealThisInsteadEv("DISCARD", (ev, source) => owner(source) === owner(ev.what) && (isVillain(ev.getSource()) || isMastermind(ev.getSource()) || isTactic(ev.getSource())),
      "prevent gaining a Wound", () => {}),
  ]}),
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
      // TODO reveal until end of turn
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
    ev => revealPlayerDeckEv(ev, 1, cards => cards.limit(c => c.cost === 0).each(c => KOEv(ev, c))),
    ev => { if (superPower(Color.TECH)) drawEv(ev, 1); },
  ]),
// ATTACK: 2+
// Reveal the top card of the Villain Deck. If it's a Villain, you get + Attack equal to its printed VP.
// {POWER Tech Tech} You may defeat that Villain for free.
// COST: 5
  c2: makeHeroCard("Punisher", "Hail of Bullets", 5, u, 2, Color.TECH, "Marvel Knights", "GD", ev => {
    revealVillainDeckEv(ev, 1, r => r.limit(isVillain).each(c => {
      c.printedVP && addAttackEvent(ev, c.printedVP);
      if (superPower(Color.TECH, Color.TECH)) chooseMayEv(ev, "Defeat the revealed villain", () => defeatEv(ev, c));
     }));
  }),
// RECRUIT: 2+
// {POWER Strength} Each other player reveals the top card of their deck. If that card costs 4 or more, discard it. You get +1 Recruit for each card discarded this way.
// COST: 3
  uc: makeHeroCard("Punisher", "Hostile Interrogation", 3, 2, u, Color.STRENGTH, "Marvel Knights", "GD", ev => { if (superPower(Color.STRENGTH)) {
    let count = 0;
    eachOtherPlayer(p => revealPlayerDeckEv(ev, 1, cards => cards.limit(c => c.cost >= 4).each(c => { discardEv(ev, c); count++; }), p));
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
  c2: makeHeroCard("Wolverine", "Sudden Ambush", 4, u, 2, Color.COVERT, "X-Force", "D", ev => {if (cardsDrawn() > 0) addAttackEvent(ev, 2); }),
// Draw a card.
// You may KO a card from your hand or discard pile.
// COST: 4
  uc: makeHeroCard("Wolverine", "No Mercy", 4, u, u, Color.STRENGTH, "X-Force", "", [ ev => drawEv(ev, 1), ev => KOHandOrDiscardEv(ev, undefined) ]),
// ATTACK: 3
// Count the number of extra cards you drew this turn. Draw that many cards.
// COST: 7
  ra: makeHeroCard("Wolverine", "Reckless Abandon", 7, u, 3, Color.COVERT, "X-Force", "", ev => drawEv(ev, cardsDrawn())),
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
  ra: makeHeroCard("Invisible Woman", "Invisible Barrier", 7, u, 5, Color.COVERT, "Fantastic Four", "", [], { trigger:
    youMayRevealThisInsteadEv("CARDEFFECT", ev => ev.effectName == 'ambush', "draw two cards",  ev => drawEv(ev, 2, owner(ev.source)))
  }),
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
    ev => choosePlayerEv(ev, p => revealPlayerDeckEv(ev, 1, cards => cards.each(card => {
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
    revealPlayerDeckEv(ev, 1, cards => cards.each(card => selectCardOptEv(ev, 'Discard a card from top of the deck', [card], c => discardEv(ev, c))), p, playerState)
  })),
// ATTACK: 5+
// Each other player reveals a [Covert] Hero or chooses a Bystander from their Victory Pile. You rescue those Bystanders.
// {TEAMPOWER Spider Friends} You get +1 Attack for each Bystander you rescued this turn.
// COST: 8
  ra: makeHeroCard("Black Cat", "Cat Burglar", 8, u, 5, Color.COVERT, "Spider Friends", "", [
    ev => eachOtherPlayer(p => {
      revealOrEv(ev, Color.COVERT, () => {
        selectCardEv(ev, `Select a Bystander for ${playerState.name} to rescue`, p.victory.limit(isBystander), c => rescueEv(ev, c), p);
      }, p);
    }),
    ev => superPower("Spider Friends") && addAttackEvent(ev, pastEvents('RESCUE').count(ev => ev.who === playerState && isBystander(ev.what))),
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
      if (superPower("Spider Friends")) turnState.nextHeroRecruit = 'DECK';
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
    ev => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost === 1 || c.cost === 2) && addAttackEvent(ev, 2)),
    { wallcrawl: true }
  ),
// Reveal the top two cards of your deck. Put any that cost 2 or less into your hand. Put the rest back in any order.
// COST: 2
  c2: makeHeroCard("Symbiote Spider-Man", "Spider-Sense Tingling", 2, u, u, Color.INSTINCT, "Spider Friends", "D",
    ev => revealPlayerDeckEv(ev, 2, cards => cards.limit(c => c.cost === 2).each(c => moveCardEv(ev, c, playerState.hand)))
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
  c1: makeHeroCard("Bullseye", "Everything's a Weapon", 3, u, 2, Color.RANGED, "Crime Syndicate", "FD", ev => superPower(Color.INSTINCT) && drawEv(ev, 1)),
// RECRUIT: 0+
// {DODGE}
// Choose an Adversary Group. You get +1 Recruit for each Adversary in your Victory Pile from that Adversary Group.
// COST: 2
  c2: makeHeroCard("Bullseye", "Fulfill the Contract", 2, 0, u, Color.INSTINCT, "Crime Syndicate", "D", ev => {
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
    selectCardEv(ev, "Choose an Adversary", villains(), c => addStatMod('defense', v => v === c, () => -p.victory.count(v => v.villainGroup === c.villainGroup)));
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
    repeat(8, () => cont(ev, () => playerState.deck.withTop(c => discardEv(ev, c))));
    cont(ev, () => addAttackEvent(ev, cardsDiscarded()));
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
    revealPlayerDeckEv(ev, 1, cards => cards.each(c => chooseMayEv(ev, "KO revealed card", () => KOEv(ev, c))));
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
  uc: makeHeroCard("Electro", "Supercharge", 5, u, 2, Color.INSTINCT, "Sinister Six", "FD", ev => addAttackEvent(ev, cardsDiscarded())),
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
  c2: makeHeroCard("Green Goblin", "Pumpkin Bombs", 3, u, 1, Color.TECH, "Sinister Six", "D", ev => cardsDiscarded() && addAttackEvent(ev, 2), { cardActions: [ dodge ] }),
// RECRUIT: 3
// {DODGE}
// If you discarded any cards this turn, kidnap a Bystander.
// COST: 5
  uc: makeHeroCard("Green Goblin", "Unstable Kidnapper", 5, 3, u, Color.INSTINCT, "Sinister Six", "", ev => cardsDiscarded() && rescueEv(ev), { cardActions: [ dodge ] }),
// ATTACK: 4
// Return from your discard pile to your hand all the cards you discarded this turn.
// COST: 7
  ra: makeHeroCard("Green Goblin", "Experimental Goblin Serum", 7, u, 4, Color.TECH, "Sinister Six", "", ev => {
    playerState.discard.deck.each(c => pastEvents('DISCARD').has(e => e.what === c && e.who === playerState) && moveCardEv(ev, c, playerState.hand));
  }),
},
{
  name: "Juggernaut",
  team: "Brotherhood",
// RECRUIT: 2+
// {POWER Strength} Each other player reveals the top card of their deck, and if it costs 1, 2, or 3, discards it. You get +1 Recruit for each card discarded this way.
// COST: 4
  c1: makeHeroCard("Juggernaut", "Crimson Gem of Cyttorak", 4, 2, u, Color.STRENGTH, "Brotherhood", "D", ev => {
    superPower(Color.STRENGTH) && eachOtherPlayer(p => revealPlayerDeckEv(ev, 1, cards => cards.limit(c => [1, 2, 3].includes(c.cost)).each(c => discardEv(ev, c)), p));
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
// Gain three New Recruits.
// {TEAMPOWER Crime Syndicate, Crime Syndicate} If you would return a New Recruit to the New Recruit Stack this turn, put it on the bottom of your deck instead.
// COST: 8
  ra: makeHeroCard("Kingpin", "Endless Underlings", 8, u, u, Color.STRENGTH, "Crime Syndicate", "", [
  ev => repeat(3, () => cont(ev, () => gameState.newRecruit.withTop(c => gainEv(ev, c)))),
  ev => {
    superPower("Crime Syndicate", "Crime Syndicate") && addTurnTrigger('MOVECARD',
       ev => ev.to === gameState.newRecruit && ev.from === playerState.playArea && ev.what.cardName === "New Recruits",
      ev => moveCardEv(ev, ev.parent.what, playerState.deck, true));
  }]),
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
    chooseOtherPlayerEv(ev, p => lookAtDeckEv(ev, 2, cards => selectCardEv(ev, "Pick the good card", cards, good => {
      chooseOptionEv(ev, "Which to keep", [{ l:"Good", v:true }, { l:"Bad", v:false }], pickedGood => {
        cards.limit(c => c === good).each(c => moveCardEv(ev, c, pickedGood ? p.discard : playerState.discard));
        cards.limit(c => c !== good).each(c => moveCardEv(ev, c, pickedGood ? playerState.discard : p.discard));
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
  uc: makeHeroCard("Magneto", "Weapons From Scrap Metal", 5, u, 3, Color.RANGED, "Brotherhood", "F", ev => cardsDiscarded() && drawEv(ev)),
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
    repeat(superPower("Sinister Six") + 1, () => cont(ev, () => selectCardEv(ev, "Select a card to put on the bottom of the Ally Deck", hqCards(), c => {
      hasAttackIcon(c) && addAttackEvent(ev, c.printedAttack);
      hasRecruitIcon(c) && addRecruitEvent(ev, c.printedRecruit);
      moveCardEv(ev, c, gameState.herodeck, true);
    })));
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
    revealHeroDeckEv(ev, 1, cards => cards.each(c => addTurnAction(new Ev(ev, 'EFFECT', { what: c, cost: { // TODO make this card visible
      cond: c => c === gameState.herodeck.top
    }, func: ev => {
      playCopyEv(ev, ev.what);
      moveCardEv(ev, ev.what, gameState.herodeck, true);
    } }))));
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
    revealPlayerDeckEv(ev, 1, cards => cards.each(c => {
      chooseMayEv(ev, "Discard revealed card", () => discardEv(ev, c));
      isColor(Color.INSTINCT)(c) && addAttackEvent(ev, 2);
    }));
  }),
// RECRUIT: 1
// Reveal the top card of your deck. If it's a Brotherhood Ally, you may draw it. Otherwise, you may KO it.
// COST: 4
  c2: makeHeroCard("Sabretooth", "Take One for the Team", 4, 1, u, Color.INSTINCT, "Brotherhood", "", ev => {
    let draw = false;
    revealPlayerDeckEv(ev, 1, cards => {
      cards.limit("Brotherhood").each(c => chooseMayEv(ev, "Draw revealed", () => draw = true));
      cards.limit(c => !isTeam("Brotherhood")(c)).each(c => chooseMayEv(ev, "KO revealed", () => KOEv(ev, c)));
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
      revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "KO revealed card", cards, c => KOEv(ev, c)), p, playerState);
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
    }, p));
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
    cityVillains().limit(c => c.defense >= 4).each(c => captureEv(ev, c));
  }),
// RECRUIT: 0+
// ATTACK: 5
// Each other player reveals an [Instinct] Ally or KOs a Bystander from their Victory Pile.
// {POWER Instinct} Kidnap all Bystanders that were KO'd this turn. Then you get +1 Recruit for each Bystander you kidnapped this turn.
// COST: 7
  ra: makeHeroCard("Venom", "Ravenous Greed", 7, 0, 5, Color.INSTINCT, "Sinister Six", "", [
    ev => eachOtherPlayer(p => revealOrEv(ev, Color.INSTINCT, () => selectCardEv(ev, "KO a Bystander", p.victory.limit(isBystander), c => KOEv(ev, c), p), p)),
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
    c1: makeHeroCard("Drax the Destroyer", "Knives of the Hunter", 3, u, u, Color.STRENGTH, "Guardians of the Galaxy", "", ev => addAttackEvent(ev, 1), oncePerTurnArtifact()),
  // RECRUIT: 2
  // Look at the top card of your deck. Discard it or put it back.
  // {POWER Instinct} You may KO the card you discarded this way.
  // COST: 3
    c2: makeHeroCard("Drax the Destroyer", "Interstellar Tracker", 3, 2, u, Color.INSTINCT, "Guardians of the Galaxy", "D", ev => {
      lookAtDeckEv(ev, 1, cards => selectCardOptEv(ev, "Discard revealed", cards, c => {
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
      ev => playerState.shard.size >= 5 && repeat(5, () => { spendShardEv(ev); addAttackEvent(ev, 2); }) ], oncePerTurnArtifact([0, 5])),
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
        match: (ev, source) => ev.effectName === "ambush" && isControlledArtifact(source, true),
        after: ev => gainShardEv(ev, 1, owner(ev.source)),
      },  {
        event: "STRIKE",
        match: (ev, source) => isControlledArtifact(source, true),
        after: ev => gainShardEv(ev, 1, owner(ev.source)),
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
    c1: makeHeroCard("Star-Lord", "Element Guns", 4, u, u, Color.RANGED, "Guardians of the Galaxy", "G", ev => gainShardEv(ev), oncePerTurnArtifact()),
  // RECRUIT: 2
  // Choose an <b>Artifact</b> any player controls with a "once per turn" ability. Play a copy of one of those abilities.
  // COST: 4
    c2: makeHeroCard("Star-Lord", "Legendary Outlaw", 4, 2, u, Color.COVERT, "Guardians of the Galaxy", "D", ev => {
      selectCardEv(ev, "Choose an Artifact", gameState.players.flatMap(p => p.artifact.deck).limit(c => c.isOncePerTurnArtifact), c => playCardEffects(ev, c));
    }),
  // <b>Artifact -</b>
  // Once per turn, draw a card.
  // COST: 6
    uc: makeHeroCard("Star-Lord", "Implanted Memory Chip", 6, u, u, Color.TECH, "Guardians of the Galaxy", "", ev => drawEv(ev), oncePerTurnArtifact()),
  // <b>Artifact -</b>
  // Once per turn, gain a Shard for each <b>Artifact</b> you control.
  // COST: 8
  // GUN: 1
    ra: makeHeroCard("Star-Lord", "Sentient Starship", 8, u, u, Color.RANGED, "Guardians of the Galaxy", "G", ev => gainShardEv(ev, playerState.artifact.size), oncePerTurnArtifact()),
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
      revealPlayerDeckTopOrBottomEv(ev, 1, bottom, cards => cards.has(c => c.cost >= 4) && addRecruitEvent(ev, 2));
    });
  }),
// ATTACK: 3+
// {TEAMPOWER Foes of Asgard} Discard the top card of any player's deck. Then reveal the top or bottom card of your deck. If the card you revealed has an equal or higher cost, you get +2 Attack.
// COST: 5
  uc: makeHeroCard("Kuurth, Breaker of Stone", "Contest of Strength", 5, u, 3, Color.STRENGTH, "Foes of Asgard", "D", ev => {
    superPower("Foes of Asgard") && choosePlayerEv(ev, p => {
      let revealed: Card;
      revealPlayerDeckEv(ev, 1, cards => cards.each(c => { discardEv(ev, c); revealed = c; }), p);
      cont(ev, () => {
        revealed && chooseOptionEv(ev, "Reveal card from", [ { l: "Top", v: false }, { l: "Bottom", v: true } ], bottom => {
          revealPlayerDeckTopOrBottomEv(ev, 1, bottom, cards => cards.has(c => c.cost >= revealed.cost) && addAttackEvent(ev, 2));
        });    
      });
    });
  }),
// ATTACK: 0+
// Reveal a card from your hand, the top card of your deck, and the bottom card of your deck. You get +Attack equal to their total costs.
// COST: 7
  ra: makeHeroCard("Kuurth, Breaker of Stone", "Break Every Bone", 7, u, 0, Color.STRENGTH, "Foes of Asgard", "", ev => {
    revealPlayerDeckEv(ev, 1, cards => cards.each(c => addAttackEvent(ev, c.cost)));
    revealPlayerDeckBottomEv(ev, 1, cards => cards.each(c => addAttackEvent(ev, c.cost)));
    selectCardEv(ev, "Reveal a card", playerState.hand.deck, c => addAttackEvent(ev, c.cost)); // TODO mutliplayer reveal
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
    selectObjectsUpToEv(ev, "Select cards to KO", 2, handOrDiscard(), c => { KOEv(ev, c); isBindings(c) && demolishOtherEv(ev); });
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
    lookAtDeckBottomEv(ev, 1, cards => {
      selectCardOptEv(ev, "Discard a card", cards, c => discardEv(ev, c));
    });
    superPower(Color.COVERT) && playerState.deck.withBottom(c => drawCardEv(ev, c));
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
    eachPlayer(p => revealOrEv(ev, Color.COVERT, () => pickDiscardEv(ev, 1, p), p));
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
  ra: makeHeroCard("Apocalyptic Kitty Pryde", "Untouchable", 7, 5, u, Color.COVERT, "X-Men", "", [], { trigger:
    youMayDiscardThisInsteadEv("CARDEFFECT", ev => ev.effectName === 'fight', "draw three cards", ev => drawEv(ev, 3, owner(ev.source)))
  }),
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
    superPower(Color.RANGED) && revealPlayerDeckEv(ev, 1, cards => cards.each(c => {
      chooseOneEv(ev, "Choose one", ["Teleport revealed", () => teleportEv(ev, c)], ["Draw revealed", () => drawCardEv(ev, c)]);
    }));
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
    revealPlayerDeckEv(ev, 3, cards => {
      const selected = new Set<Card>();
      selectObjectsAnyEv(ev, "Choose cards to draw", cards, c => selected.add(c));
      cont(ev, () => cards.each(c => selected.has(c) ? drawCardEv(ev, c) : teleportEv(ev, c)));
    });
  }),
},
{
  name: "Lady Thor",
  team: "Avengers",
// Once per turn, if you made at least 6 Recruit this turn, draw a card.
  c1: makeHeroCard("Lady Thor", "Mysterious Origin", 3, 2, u, Color.RANGED, "Avengers", "D", ev => {
    addTurnAction(new Ev(ev, 'EFFECT', {
      cost: { cond: () => !countPerTurn('ladyThor', ev.source) && turnState.totalRecruit >= 6 },
      func: ev => { incPerTurn('ladyThor', ev.what); drawEv(ev); },
      what: ev.source,
    }));
  }),
// Once per turn, if you made at least 6 Recruit this turn, you get +2 Attack.
  c2: makeHeroCard("Lady Thor", "Chosen by Asgard", 4, 2, 0, Color.STRENGTH, "Avengers", "D", ev => {
    addTurnAction(new Ev(ev, 'EFFECT', {
      cost: { cond: () => !countPerTurn('ladyThor', ev.source) && turnState.totalRecruit >= 6 },
      func: ev => { incPerTurn('ladyThor', ev.what); addAttackEvent(ev, 2); },
      what: ev.source,
    }));
  }),
// {POWER Ranged Strength} You get +2 Attack.
  uc: makeHeroCard("Lady Thor", "Heir to the Hammer", 6, u, 4, Color.STRENGTH | Color.RANGED, "Avengers", "FD", ev => superPower(Color.RANGED, Color.STRENGTH) && addAttackEvent(ev, 2)),
// One per turn, if you made at least 6 Recruit this turn, you get +6 Attack.
  ra: makeHeroCard("Lady Thor", "Living Thunderstorm", 8, 4, 0, Color.STRENGTH, "Avengers", "F", ev => {
    addTurnAction(new Ev(ev, 'EFFECT', {
      cost: { cond: () => !countPerTurn('ladyThor', ev.source) && turnState.totalRecruit >= 6 },
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
    superPower(Color.TECH) && addTurnTrigger('DEFEAT', ev => isVillain(ev.what), ev => gainSidekickEv(ev));
  }),
// You may have a Henchman Villain from your Victory Pile enter the city. If you do, draw a card.
  uc: makeHeroCard("Maximus", "Pieces on a Chessboard", 5, u, 3, Color.COVERT | Color.TECH, "Cabal", "", ev => {
    selectCardOptEv(ev, "Choose a Henchman", playerState.victory.limit(isHenchman), c => { villainDrawEv(ev, c); drawEv(ev); });
  }),
// Each other player reveals a [Tech] hero or chooses a Henchman Villain from their Victory Pile. You defeat all those Henchmen for free.
// {TEAMPOWER Cabal} You get +1 Attack for each Henchman you defeated this turn.
  ra: makeHeroCard("Maximus", "Inhuman Mastery", 7, u, 4, Color.TECH, "Cabal", "", [
    ev => eachOtherPlayer(p => revealOrEv(ev, Color.TECH, () => selectCardEv(ev, "Choose a Henchman", p.victory.limit(isHenchman), c => defeatEv(ev, c), p), p)),
    ev => superPower("Cabal") && addAttackEvent(ev, pastEvents('DEFEAT').count(e => isHenchman(e.what))),
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
      chooseMayEv(ev, "Get +2 Attack", () => {
        addAttackEvent(ev, 2);
        forbidAction('RECRUIT');
      });
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
  uc: makeHeroCard("Superior Iron Man", "Superior to Others", 3, 2, u, Color.RANGED, "Illuminati", "D", ev => superPower(Color.RANGED) && lookAtDeckEv(ev, 2, c => {
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
    selectCardOptEv(ev, "KO a Bystander", playerState.victory.limit(isBystander), c => {
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
    ev => repeat(6, () => cont(ev, () => gameState.bystanders.withTop(c => KOEv(ev, c)))),
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
    revealVillainDeckEv(ev, 5, cards => selectObjectsEv(ev, "Select cards to gain Attack", superPower("Cabal") ? 2 : 1, cards, c => addAttackEvent(ev, c.vp)), false);
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
// {PATROL Escape Pile}: If there are Bystanders in it, you get +2 Attack. Otherwise, you get +2 Recruit.
  c2: makeHeroCard("Corvus Glaive", "Let None Escape You", 2, 0, 0, Color.STRENGTH | Color.INSTINCT, "Cabal", "FD", ev => {
    gameState.escaped.has(isBystander) ? addAttackEvent(ev, 2) : addRecruitEvent(ev, 2);
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
        // TODO reveal until end of turn
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
    match: (ev, source) => owner(source) && source.location === owner(source).deck, // TODO look for trigger cards in deck
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
      addTurnSet('isFightable', isDemon, () => true);
      villainify('Demon', isDemon, 3, ev => selectCardAndKOEv(ev, yourHeroes()));
      addTurnTrigger('FIGHT', ev => isDemon(ev.what), () => once = true);
    }
  }),
// If a player would gain a Wound, you may discard this card instead. If you do, draw two cards.
  c2: makeHeroCard("Soulsword Colossus", "Steel Interception", 4, u, 2, Color.STRENGTH | Color.COVERT, "X-Men", "D", [], { trigger:
    youMayDiscardThisInsteadEv("GAIN", ev => isWound(ev.what), "draw two cards", ev => drawEv(ev, 2, owner(ev.source)))
  }),
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
  uc: makeHeroCard("Captain America (Falcon)", "Flying Shield Block", 6, u, 4, Color.TECH, "Avengers", "", [], { trigger:
    youMayRevealThisInsteadEv("GAIN",
      (ev, source) => isWound(ev.what) && !turnState.pastEvents.has(e => e.type === 'RESCUE' && e.getSource() === source),
      "rescue a Bystander", ev => rescueByEv(ev, owner(ev.source)))
  }),
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
// {SAVIOR} Draw a card.
  uc: makeHeroCard("Captain America 1941", "Liberate the Prisoners", 6, u, 3, Color.COVERT, "Avengers", "F", [ ev => superPower("Avengers") && rescueEv(ev), ev => saviorPower() && drawEv(ev) ]),
// {SAVIOR} {OUTOFTIME}
  ra: makeHeroCard("Captain America 1941", "Punch Evil in the Face", 8, u, 5, Color.INSTINCT, "Avengers", "F", ev => saviorPower() && outOfTimeEv(ev)),
},
{
  name: "Steve Rogers, Director of S.H.I.E.L.D.",
  team: "S.H.I.E.L.D.",
// You get +1 Recruit for each Hero Class you have.
// {SAVIOR} You get +1 Attack for each Hero Class you have.
  c1: makeHeroCard("Steve Rogers, Director of S.H.I.E.L.D.", "International Strike Force", 3, 0, 0, Color.STRENGTH, "S.H.I.E.L.D.", "G", [
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
  c1: makeHeroCard("Daredevil", "Dual Existence", 2, u, u, Color.INSTINCT, "Avengers", "FD", ev => lookAtDeckEv(ev, 2, cards => selectCardEv(ev, "Choose a card to draw", cards, c => drawCardEv(ev, c)))),
// Choose a number, then reveal the top card of your deck. If that card is that cost, gain a Sidekick.
  c2: makeHeroCard("Daredevil", "Roundhouse Side Kick", 4, u, 2, Color.COVERT, "Avengers", "FD", ev => {
    chooseCostEv(ev, n => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost === n) && gainSidekickEv(ev)));
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
    makeHeroCard("Redwing", "Squawk Back", 4, u, u, Color.INSTINCT, "Avengers", "", ev => lookAtDeckEv(ev, 3, cards => selectCardEv(ev, "Choose a card to draw", cards, c => drawCardEv(ev, c)))),
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
// You get +1 Attack for each other card you played this turn that costs 4 or more.
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
  c1: makeHeroCard("Luke Cage", "Take a Bullet for the Team", 4, 1, 1, Color.STRENGTH, "Avengers", "", [], { trigger:
    youMayDiscardThisInsteadEv("GAIN", ev => isWound(ev.what), "draw two cards", ev => drawEv(ev, 2, owner(ev.source)))
  }),
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
  uc: makeHeroCard("Luke Cage", "Sweet Christmas", 5, u, 3, Color.INSTINCT, "Avengers", "", ev => superPower(Color.INSTINCT) && lookAtDeckEv(ev, 3, cards => chooseMayEv(ev, "Discard revealed cards", () => cards.each(c => discardEv(ev, c))))),
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
  c1: makeHeroCard("Patriot", "Intuitive Tactician", 3, u, 0, Color.INSTINCT, "Avengers", "F", ev => addAttackEvent(ev, numHeroNames(yourHeroes().filter(c => !isTeam('S.H.I.E.L.D.')(c))))),
// You get +1 Recruit for each Hero Name among your non-S.H.I.E.L.D. Heroes.
  c2: makeHeroCard("Patriot", "New Generation of Heroes", 2, u, u, Color.STRENGTH, "Avengers", "D", ev => addRecruitEvent(ev, numHeroNames(yourHeroes().filter(c => !isTeam('S.H.I.E.L.D.')(c))))),
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
  ra: makeHeroCard("Peter Parker", "Reluctant Celebrity", 2, u, 2, Color.INSTINCT, "Avengers", "D", ev => superPower(Color.INSTINCT) && addAttackEvent(ev, cardsDrawn())),
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
  ra: makeHeroCard("Speedball", "Kinetic Force Field", 7, u, 5, Color.RANGED, "New Warriors", "", [], { trigger:
    youMayRevealThisInsteadEv("STRIKE", () => true, "draw a card", ev => {
      KOEv(ev, ev.parent.what);
      drawEv(ev, 1, owner(ev.source));
    })
  }),
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
    let sel: Card[] = [];
    lookAtDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to discard", cards, c => { sel.push(c); discardEv(ev, c); }));
    cont(ev, () => sel.limit(c => c.location === playerState.discard).each(c => {
      superPower(Color.INSTINCT, Color.INSTINCT) && chooseMayEv(ev, "KO the card discarded", () => KOEv(ev, c));
    }));
  }),
// If an Ambush effect would occur, you may discard this card to cancel that effect and draw two cards.
  uc: makeHeroCard("Tigra", "Can't Surprise a Cat", 5, u, 2, Color.COVERT, "Avengers", "D", [], { trigger:
    youMayDiscardThisInsteadEv("CARDEFFECT", ev => ev.effectName === "ambush", "draw 2 cards", ev => drawEv(ev, 2, owner(ev.source)))
  }),
// Recruit a Hero from the HQ for free.
// {TEAMPOWER Avengers} You get that Hero's printed Recruit and Attack.
  ra: makeHeroCard("Tigra", "Mystic Talisman", 7, 0, 0, Color.COVERT, "Avengers", "", ev => {
    selectCardEv(ev, "Choose a hero to recruit", hqHeroes(), c => {
      recruitForFreeEv(ev, c);
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
      lookAtDeckEv(ev, 2, cards => {
        cards.each(c => moveCardEv(ev, c, playerState.hand));
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
    lookAtDeckEv(ev, 1, cards => {
      cards.each(c => {
        chooseOneEv(ev, `${p.name} guessed`, [
          "Correctly", () => drawCardEv(ev, c, p)
        ], [
          "Incorrectly", () => drawEv(ev, 1),
        ])
      });
    }, p, playerState);
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
    selectCardOrEv(ev, "Choose a Wound to KO", handOrDiscard().limit(isWound), c => {
      KOEv(ev, c);
      addAttackEvent(ev, 1);
    }, () => {
      gainWoundEv(ev);
    });
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
  uc: makeHeroCard("Stingray", "Sting of the Stingray's Sting", 5, 3, u, Color.RANGED, "Mercs for Money", "F", [], { excessiveViolence: ev => selectCardOptEv(ev, "Choose a card to KO", revealable().concat(playerState.discard.deck), c => KOEv(ev, c)) }),
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
    const f = () => chooseOptionEv(ev, "Reveal a card from", [{l:"Top",v:false},{l:"Bottom",v:true}], v => revealPlayerDeckTopOrBottomEv(ev, 1, v, cards => cards.each(c => {
      discardEv(ev, c);
      c.cost === 0 && playerState.deck.size > 0 && (addAttackEvent(ev, 1), f());
    })));
    f();
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
  uc: makeHeroCard("Luke Cage Noir", "Unbreakable Cage", 6, u, 4, Color.STRENGTH, "Marvel Knights", "", [], { trigger:
    youMayRevealThisInsteadEv("GAIN", (ev, source) => isWound(ev.what) && !turnState.pastEvents.has(e => e.type === 'DRAW' && e.getSource() === source),
    "Investigate for any card", ev => {
      investigateEv(ev, u, owner(ev.source).deck, c => drawCardEv(ev, c, owner(c)), owner(ev.source));
    })
  }),
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
  c1: makeHeroCard("Aurora & Northstar", "Northern Lights", 3, u, 2, Color.COVERT, "X-Men", "D", addLightShowActionEv, { soaring: true, lightShow: ev => drawEv(ev, 1) }),
// DIVIDED: Blazing Flare
// DIVHERO: Aurora
// {LIGHTSHOW} You get +2 Recruit.
// DIVIDED: Blazing Fists
// DIVHERO: Northstar
// {BERSERK}
  c2: makeDividedHeroCard(
    makeHeroCard("Aurora", "Blazing Flare", 4, 2, u, Color.RANGED, "X-Men", "D", addLightShowActionEv, { lightShow: ev => addRecruitEvent(ev, 2) }),
    makeHeroCard("Northstar", "Blazing Fists", 4, u, 2, Color.STRENGTH, "X-Men", "D", ev => berserkEv(ev, 1)),
  ),
// {SOARING FLIGHT}
// {LIGHTSHOW} You get +3 Attack
  uc: makeHeroCard("Aurora & Northstar", "Twin Blast", 5, u, 2, Color.RANGED, "X-Men", "D", addLightShowActionEv, { soaring: true, lightShow: ev => addAttackEvent(ev, 3) }),
// {SOARING FLIGHT}
// All Heroes you recruit this turn have {SOARING FLIGHT}.
// {LIGHTSHOW} You get +2 Attack for each <b>Lightshow</b> card you played this turn.
  ra: makeHeroCard("Aurora & Northstar", "Mach 10", 7, 4, 0, Color.INSTINCT, "X-Men", "D", [ev => {
    turnState.nextHeroRecruit = 'SOARING';
    addTurnTrigger('GAIN', ev => ev.who === playerState && isHero(ev.what), () => turnState.nextHeroRecruit = 'SOARING');
  }, addLightShowActionEv], {
    soaring: true, lightShow: ev => addAttackEvent(ev, 2 * lightShowCount()),
  }),
},
{
  name: "Banshee",
  team: "X-Men",
// Draw a card.
// PIERCING
// {XGENE [Covert]} You get +1 Piercing.
// +0+ Piercing
  c1: makeHeroCard("Banshee", "Sonar Detection", 2, u, u, Color.COVERT, "X-Men", "D", [ ev => drawEv(ev, 1), ev => xGenePower(Color.COVERT) && addPiercingEv(ev, 1) ],
  { printedPiercing: 0 }),
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
    lookAtDeckEv(ev, 1, cards => selectCardOptEv(ev, "Discard a card", cards, c => discardEv(ev, c)));
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
  c1: makeHeroCard("Dazzler", "Convert Sound to Light", 3, 1, u, Color.INSTINCT, "X-Men", "", addLightShowActionEv, { lightShow: ev => addPiercingEv(ev, lightShowCount()), printedPiercing: 0 }),
// {LIGHTSHOW} You get +2 Attack.
  c2: makeHeroCard("Dazzler", "Dazzling Glamour", 4, u, 2, Color.RANGED, "X-Men", "D", addLightShowActionEv, { lightShow: ev => addAttackEvent(ev, 2) }),
// {LIGHTSHOW} When you draw a new hand of cards at the end of this turn, draw two extra cards.
  uc: makeHeroCard("Dazzler", "City-Wide Mega Concert", 5, u, 3, Color.TECH, "X-Men", "F", addLightShowActionEv, { lightShow: ev => addEndDrawMod(2) }),
// {LIGHTSHOW} Put a Hero from the HQ on top of your deck.
  ra: makeHeroCard("Dazzler", "Inspire the World", 7, u, 5, Color.RANGED, "X-Men", "", addLightShowActionEv, { lightShow: ev => selectCardEv(ev, "Choose a Hero", hqHeroes(), c => moveCardEv(ev, c, playerState.deck)) }),
},
{
  name: "Havok",
  team: "X-Men",
// {LIGHTSHOW} You get +3 Attack usable only against the Mastermind.
  c1: makeHeroCard("Havok", "Blinding Burst", 3, 2, u, Color.RANGED, "X-Men", "D", addLightShowActionEv, { lightShow: ev => addAttackSpecialEv(ev, isMastermind, 3) }),
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
  c1: makeHeroCard("Jubilee", "Light a Spark", 2, 0, u, Color.COVERT, "X-Men", "D", [ev => drawEv(ev, 1), addLightShowActionEv], { lightShow: ev => addRecruitEvent(ev, lightShowCount()) }),
// Draw a card.
// {LIGHTSHOW} You get +1 Attack for each <b>Lightshow</b> card you played this turn.
  c2: makeHeroCard("Jubilee", "Blasting Fireworks", 4, u, 1, Color.RANGED, "X-Men", "", [ev => drawEv(ev, 1), addLightShowActionEv], { lightShow: ev => addAttackEvent(ev, lightShowCount()) }),
// {LIGHTSHOW} Look at the top card of your deck. If it costs 0, KO it.
  uc: makeHeroCard("Jubilee", "Unexpected Explosion", 5, u, 3, Color.INSTINCT, "X-Men", "", addLightShowActionEv, { lightShow: ev => lookAtDeckEv(ev, 1, cards => cards.limit(c => c.cost === 0).each(c => KOEv(ev, c))) }),
// {LIGHTSHOW} You get +1 Recruit and +1 Attack for each <b>Lightshow</b> card you played this turn.
  ra: makeHeroCard("Jubilee", "Prismatic Cascade", 7, 0, 5, Color.COVERT, "X-Men", "", addLightShowActionEv, { lightShow: ev => { const n = lightShowCount(); addRecruitEvent(ev, n); addRecruitEvent(ev, n); } }),
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
    makeHeroCard("Legion", "Bend Light", 2, 1, u, Color.COVERT, "X-Men", "D", addLightShowActionEv, { lightShow: ev => addRecruitEvent(ev, 2) }),
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
    lookAtDeckEv(ev, 1, cards => {
      selectCardOptEv(ev, "Choose a card to discard", cards, c => {
        discardEv(ev, c);
        superPower(Color.COVERT) && chooseMayEv(ev, "KO discarded", () => KOEv(ev, c));
      })
    });
  }),
// Reveal the top card of the Villain Deck. If it's a Villain, you may put it on the bottom of that Deck.
// {TEAMPOWER X-Men} You get +Attack equal to the printed Victory Points of the card you revealed.
  ra: makeHeroCard("Longshot", "Escape from Mojo World", 7, u, 5, Color.TECH, "X-Men", "", ev => {
    revealVillainDeckEv(ev, 1, cards => cards.each(c => {
      selectCardOptEv(ev, "Choose a card to put on bottom", cards.limit(isVillain), c => moveCardEv(ev, c, gameState.villaindeck, true));
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
  uc: makeHeroCard("Phoenix", "Reincarnating Phoenix", 6, u, u, Color.COVERT, "X-Men", "", [ ev => drawEv(ev, 2), ev => selectCardOptEv(ev, "Choose a Hero", gameState.ko.limit(isHero).limit(c => pastEvWhat('KO').has(is(c))), c => moveCardEv(ev, c, playerState.discard)) ]),
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
  uc: makeHeroCard("Polaris", "Subtle Attunement", 6, u, 2, Color.COVERT, "X-Men", "D", ev => superPower(Color.COVERT) && lookAtDeckEv(ev, 2, cards => selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c))), { soaring: true }),
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
    addTurnAction(recruitCardActionEv(ev, c)); // TODO reveal until end of turn
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
    const w = pastEvents('GAIN').limit(e => isWound(e.what) && e.who === playerState).map(e => e.what);
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
    a.desc = "Fight with Recruit";
    addTurnAction(a);
  })),
// {COORDINATE}
// {POWER Covert} You get +2 Recruit
  c2: makeHeroCard("Peter's Allies", "Ned", 2, 1, u, Color.COVERT, "Spider Friends", "D", ev => superPower(Color.COVERT) && addRecruitEvent(ev, 2), { coordinate: true }),
// Whenever you {COORDINATE} a card to another player, you may reveal this to draw two cards instead of one.
  uc: makeHeroCard("Peter's Allies", "Liz", 6, 4, u, Color.INSTINCT, "Spider Friends", "", [], { trigger: {
    event: 'COORDINATEDISCARD',
    match: (ev, source) => ev.who === owner(source) && source.location === owner(source).hand && playerState !== ev.who,
    after: ev => revealAndEv(ev, c => c === ev.source, () => drawEv(ev, 1, ev.parent.who)),
  }}),
// {COORDINATE}
// {TEAMPOWER Spider Friends} Each Villain gets -2 Attack this turn. The next time you fight the Mastermind this turn, it gets -2 Attack.
  ra: makeHeroCard("Peter's Allies", "May Parker", 7, 5, u, Color.COVERT, "Spider Friends", "D", ev => { if (superPower("Spider Friends")) {
    let once = false;
    addTurnMod('defense', isEnemy, c => (isVillain(c) || !once ? -2 : 0));
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
  ra: makeHeroCard("Tony Stark", "As Usual, I Did All the Work", 7, u, 5, Color.RANGED, "Avengers", "", ev => {
    const coordinateEvents = ancestorEvents(ev, 'COORDINATE');
    const coordinatingPlayer = coordinateEvents.size ? owner(coordinateEvents[0].what) : undefined;
    coordinatingPlayer && addTurnTrigger('CLEANUP', () => true, () => {
      turnState.pastEvents.limit(e => e.type === 'MOVECARD' && e.to === playerState.victory && e.what.location === e.to).each(e => moveCardEv(ev, e.what, coordinatingPlayer.victory))
    });
  }, { coordinate: true }),
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
    selectCardOrEv(ev, "Select a card to KO", handOrDiscard().limit(isWound), c => { KOEv(ev, c); addAttackEvent(ev, 2); }, () => gainWoundEv(ev));
  }, { sizeChanging: Color.STRENGTH }),
// {SIZECHANGING TECH STRENGTH}
// You get +1 Attack for each extra card you drew this turn.
  ra: makeHeroCard("Totally Awesome Hulk", "7th Smartest Man in the World", 9, u, 5, Color.TECH, "Champions", "", ev => {
    addAttackEvent(ev, cardsDrawn());
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
    makeHeroCard("Amadeus Cho", "Gamma-Draining Nanites", 3, u, u, Color.TECH, "Champions", "", [ ev => drawEv(ev, 1), ev => cardsDrawn() >= 2 && transformHeroEv(ev, ev.source) ]),
    makeHeroCard("Amadeus Cho", "Like Totally Smart Hulk", 5, u, 2, Color.STRENGTH, "Champions", "FD", ev => mayOutwitEv(ev, () => addAttackEvent(ev, 2))),
  ),
// You get +1 Attack for each different cost of Hero you have.
// {OUTWIT}: Draw a card.
  uc: makeHeroCard("Amadeus Cho", "Renegade Genius", 6, u, 0, Color.TECH, "Champions", "", [ ev => addAttackEvent(ev, yourHeroes().uniqueCount(c => c.cost)), ev => mayOutwitEv(ev, () => drawEv(ev, 1)) ]),
// Whenever you use an {OUTWIT} ability this turn, you may use it an extra time.
// {OUTWIT}: Look at the top card of your deck. KO it or put it back.
  ra: makeHeroCard("Amadeus Cho", "Visualize the Variables", 8, u, 4, Color.TECH, "Champions", "", [
    () => addTurnTrigger('OUTWIT', () => true, ev => chooseMayEv(ev, "Use the ability an extra time", () => ev.parent.func(ev))),
    ev => mayOutwitEv(ev, () => lookAtDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c)))) ]),
},
{
  name: "Bruce Banner",
  team: "Avengers",
// {OUTWIT}: When you draw a new hand of cards at the end of this turn, draw an extra card.
  c1: makeHeroCard("Bruce Banner", "Solve the Impossible", 2, u, 1, Color.TECH, "Avengers", "D", ev => mayOutwitEv(ev, () => addEndDrawMod(1))),
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
    makeHeroCard("Gladiator Hulk", "Seize The Throne", 4, u, 0, Color.INSTINCT, "Warbound", "", [ ev => smashEv(ev, 3), ev => cardsDiscarded() >= 2 && transformHeroEv(ev, ev.source, 'DECK') ]),
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
// {POWER Strength Strength} {TRANSFORM} this into Lord of Granite.
// TRANSFORMED
// Draw a card.
// {SMASH 3}
  uc: makeTransformingHeroCard(
    makeHeroCard("Korg", "Forged by Fire", 3, 2, u, Color.STRENGTH, "Warbound", "FD", ev => superPower(Color.STRENGTH, Color.STRENGTH) && transformHeroEv(ev, ev.source)),
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
    ev => lookAtDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to put on the bottom of your deck", cards, c => moveCardEv(ev, c, playerState.deck, true))),
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
      ev => pastEvents('KO').has(e => e.where === playerState.deck && hasAttackIcon(e.what)) && transformHeroEv(ev, ev.source),
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
    makeHeroCard("Namora", "Herculean Effort", 5, 3, u, Color.RANGED, "Champions", "", ev => addTurnTrigger('DEFEAT', ev2 => isLocation(ev2.where, 'SEWERS', 'BRIDGE') && isVillain(ev2.what), ev3 => transformHeroEv(ev3, ev.source, 'DECK'))),
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
    ev => lookAtDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to discard", cards, c => discardEv(ev, c))),
    ev => superPower(Color.COVERT) && chooseMayEv(ev, "Feast", () => feastEv(ev))
  ]),
// You may {FEAST}. Then, if a non-grey Hero was KO'd from you deck this turn, {TRANSFORM} this into Torrent of Broodlings.
// TRANSFORMED
// Draw a card.
  uc: makeTransformingHeroCard(
    makeHeroCard("No-Name, Brood Queen", "Bursting with Life", 3, 2, u, Color.STRENGTH, "Warbound", "D", [
      ev => chooseMayEv(ev, "Feast", () => feastEv(ev)),
      ev => pastEvents('KO').has(e => e.where === playerState.deck && isNonGrayHero(e.what)) && transformHeroEv(ev, ev.source),
    ]),
    makeHeroCard("No-Name, Brood Queen", "Torrent of Broodlings", 5, u, 2, Color.COVERT, "Warbound", "FD", ev => drawEv(ev, 1)),
  ),
// Look at the top card of your deck. Then {FEAST} up to three times. You get +2 Attack for each non-grey Hero that was KO'd from you deck this turn.
  ra: makeHeroCard("No-Name, Brood Queen", "World Spanning Hunger", 8, u, 4, Color.INSTINCT, "Warbound", "D", [
    ev => lookAtDeckEv(ev, 1, cards => selectCardEv(ev, "Put the card back", cards, c => {})),
    ev => chooseMayEv(ev, "Feast", () => { feastEv(ev); chooseMayEv(ev, "Feast again", () => { feastEv(ev); chooseMayEv(ev, "Feast again", () => feastEv(ev)); })}),
    ev => addAttackEvent(ev, 2 * pastEvents("KO").count(e => e.where === playerState.deck)),
  ]),
},
{
  name: "Rick Jones",
  team: "S.H.I.E.L.D.", // TODO multi team
// {POWER Tech} Reveal the top card of your deck. If it's a S.H.I.E.L.D., draw it.
  c1: makeHeroCard("Rick Jones", "Hacktivist", 3, u, 2, Color.TECH, "S.H.I.E.L.D.", "FD", ev => superPower(Color.TECH) && drawIfEv(ev, 'S.H.I.E.L.D.')),
// Reveal the top card of your deck. If it costs 3 or more, {TRANSFORM} this into Captain Marvel.
// TRANSFORMED
// Reveal the top card of your deck. If it costs 3 or more, draw it.
  c2: makeTransformingHeroCard(
    makeHeroCard("Rick Jones", "Seek the Nega-Bands", 4, 2, u, Color.INSTINCT, "S.H.I.E.L.D.", "D", ev => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost >= 3) && transformHeroEv(ev, ev.source))),
    makeHeroCard("Rick Jones", "Captain Marvel", 5, u, 2, Color.RANGED, "Avengers", "FD", ev => drawIfEv(ev, c => c.cost >= 3)),
  ),
// If you have at least 5 Villains in your Victory Pile, {TRANSFORM} this into A-Bomb and put it on top of your deck.
// TRANSFORMED
// {SMASH 5}
  uc: makeTransformingHeroCard(
    makeHeroCard("Rick Jones", "Irradiated Blood", 5, u, 3, Color.TECH, "S.H.I.E.L.D.", "", ev => playerState.victory.count(isVillain) >= 5 && transformHeroEv(ev, ev.source, 'DECK')),
    makeHeroCard("Rick Jones", "A-Bomb", 6, u, 0, Color.STRENGTH, "S.H.I.E.L.D.", "F", ev => smashEv(ev, 5)),
  ),
// If you defeat two Villains this turn, {TRANSFORM} this into The Destiny Force and put it on top of your deck.
// TRANSFORMED
// Count the number of different printed VP values in your Victory Pile. Draw that many cards.
  ra: makeTransformingHeroCard(
    makeHeroCard("Rick Jones", "Caught in Kree-Skrull War", 7, u, 4, Color.COVERT, "S.H.I.E.L.D.", "", ev => {
      const source = ev.source;
      addTurnTrigger('DEFEAT', ev => isVillain(ev.what), ev => {
        incPerTurn('TRANSFORM', source);
        if (countPerTurn('TRANSFORM', source) === 2) transformHeroEv(ev, source, 'DECK');
      });
    }),
    makeHeroCard("Rick Jones", "The Destiny Force", 9, u, u, Color.RANGED, "Avengers", "", ev => drawEv(ev, playerState.victory.limit(c => c.printedVP !== undefined).uniqueCount(c => c.printedVP))),
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
    makeHeroCard("Sentry", "Mournful Sentinel", 3, 2, u, Color.RANGED, "Avengers", "D", ev => revealPlayerDeckEv(ev, 1, cards => { cards.each(c => moveCardEv(ev, c, playerState.deck)); cards.has(c => c.cost >= 1) && transformHeroEv(ev, ev.source, 'DECK'); })),
    makeHeroCard("Sentry", "The Void Unchained", 5, u, 3, Color.COVERT, u, "", ev => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost === 0) ? feastEv(ev) : transformHeroEv(ev, ev.source, 'DISCARD'))),
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
    repeat(Math.floor(turnState.totalRecruit / 2), () => revealHeroDeckEv(ev, 1, cards => cards.each(c => { addAttackEvent(ev, c.printedAttack || 0); moveCardEv(ev, c, gameState.herodeck, true); }), false, true));
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
addHeroTemplates("Marvel Studios Phase 1", [
copyHeroTemplate("Black Widow"),
copyHeroTemplate("Captain America"),
copyHeroTemplate("Hawkeye"),
copyHeroTemplate("Hulk"),
copyHeroTemplate("Iron Man"),
copyHeroTemplate("Nick Fury"),
copyHeroTemplate("Thor"),
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
    addTurnSet('sizeChanging', v => v === c, () => Color.TECH);
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
    !playerState.discard.size ? addRecruitEvent(ev, 2) : shuffleIntoEv(ev, playerState.discard, playerState.deck);
  }),
// {SIZECHANGING TECH}
// Draw two cards.
  uc: makeHeroCard("Jocasta", "Holographic Image Inducer", 6, u, u, Color.TECH, "Avengers", "F", ev => drawEv(ev, 2), { sizeChanging: Color.TECH }),
// If your discard pile is empty, you get +2 Attack. Otherwise shuffle your discard pile into your deck.
// GUN: 1
  ra: makeHeroCard("Jocasta", "Electromagnetic Eyebeams", 7, u, 5, Color.RANGED, "Avengers", "GD", ev => {
    !playerState.discard.size ? addAttackEvent(ev, 2) : shuffleIntoEv(ev, playerState.discard, playerState.deck);
  }),
},
{
  name: "Wonder Man",
  team: "Avengers",
// Chose one: Draw a card, or you get <b>Empowered</b> by [Strength].
  c1: makeHeroCard("Wonder Man", "One-Hit Wonder", 2, u, 0, Color.STRENGTH, "Avengers", "FD", ev => chooseOneEv(ev, "Choose one",
    ['Draw a card', () => drawEv(ev)],
    ['Get Empowered', () => empowerEv(ev, Color.STRENGTH)],
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
    match: (ev, source) => owner(source) && source.location === owner(source).hand,
    before: ev => chooseMayEv(ev, "Discard Black Knight to draw extra cards", () => {
      discardEv(ev, ev.source);
      owner(ev.source) === playerState ? addEndDrawMod(3) : addTurnTrigger("CLEANUP", undefined, tev => drawEv(tev, 3, owner(ev.source)))
    })
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
    cont(ev, () => addTurnTrigger('DRAW', ev => ev.who === playerState && ancestorEvents(ev, 'CLEANUP').size === 0, { replace: () => {} }));
  }),
// Whenever you Rescue a Bystander this turn, do any "rescue" ability on it an extra time.
// {VIOLENCE} "Rescue" a Bystander.
  uc: makeHeroCard("Venompool", "Can I Get a Little Gratitude", 5, u, 3, Color.INSTINCT, "Venomverse", "", ev => {
    addTurnTrigger('RESCUE', ev => ev.who === playerState, ev => {
      const rescue = getModifiedStat(ev.parent.what, 'rescue', ev.parent.what.rescue); // TODO abstract this
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
          pushEffects(ev, c, 'fight', c.fight); // TODO abstract pushEffect use
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
    cityLeftmost().has(d => d.has(isVillain)) || gameState.mastermind.each(c => cards.push(c));
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
addHeroTemplates("Revelations", [
{
  name: "Captain Marvel, Agent of S.H.I.E.L.D.",
  team: "S.H.I.E.L.D.",
// {TEAMPOWER S.H.I.E.L.D., S.H.I.E.L.D., S.H.I.E.L.D., S.H.I.E.L.D.} Draw a card.
  c1: makeHeroCard("Captain Marvel, Agent of S.H.I.E.L.D.", "The Sword of S.H.I.E.L.D.", 3, 2, u, Color.STRENGTH, "S.H.I.E.L.D.", "FD", ev => superPower("S.H.I.E.L.D.", "S.H.I.E.L.D.", "S.H.I.E.L.D.", "S.H.I.E.L.D.") && drawEv(ev)),
// If you drew any extra cards this turn, you get +1 Attack.
  c2: makeHeroCard("Captain Marvel, Agent of S.H.I.E.L.D.", "Radiant Blast", 4, u, 2, Color.RANGED, "S.H.I.E.L.D.", "FD", ev => pastEvents('DRAW').has(e => e.who === playerState) && addAttackEvent(ev, 1)),
// {POWER Ranged} {LAST STAND}
  uc: makeHeroCard("Captain Marvel, Agent of S.H.I.E.L.D.", "Dominate the Battlefield", 6, u, 2, Color.RANGED, "S.H.I.E.L.D.", "FD", ev => superPower(Color.RANGED) && lastStandEv(ev)),
// Choose one: Draw three cards or {LAST STAND}.
// {POWER Strength Strength} Instead, do both.
  ra: makeHeroCard("Captain Marvel, Agent of S.H.I.E.L.D.", "Higher, Further, Faster", 7, u, 0, Color.STRENGTH, "S.H.I.E.L.D.", "", ev => {
    if (superPower(Color.STRENGTH, Color.STRENGTH)) { drawEv(ev, 3); lastStandEv(ev); } else {
      chooseOneEv(ev, "Choose one", ["Draw three cards", () => drawEv(ev, 3)], ["Last Stand", () => lastStandEv(ev)]);
    }
  }),
},
{
  name: "Darkhawk",
  team: "Avengers",
// {POWER Tech} Draw a card.
  c1: makeHeroCard("Darkhawk", "Balance the Darkforce", 3, 1, 1, Color.TECH, "Avengers", "F", ev => superPower(Color.TECH) && drawEv(ev)),
// Choose Recruit or Attack. Then {HYPERSPEED 4} for that icon.
  c2: makeHeroCard("Darkhawk", "Hawk Dive", 4, 0, 0, Color.COVERT, "Avengers", "F", ev => hyperspeedEv(ev, 4, 'CHOOSE')),
// If the most recent Hero you played this turn has a Recruit icon, you get +3 Recruit. If it has an Attack icon, you get +3 Attack. (If both, you get both.)
  uc: makeHeroCard("Darkhawk", "Travel to Nullspace", 6, 0, 0, Color.TECH, "Avengers", "", ev => turnState.cardsPlayed.withLast(c => {
    hasRecruitIcon(c) && addRecruitEvent(ev, 3);
    hasAttackIcon(c) && addAttackEvent(ev, 3);
  })),
// Whenever you Hyperspeed this turn, you get both Recruit from Recruit icons and Attack from Attack icons.
// {HYPERSPEED 7}
// {POWER Tech Tech} Instead, {HYPERSPEED 9}.
  ra: makeHeroCard("Darkhawk", "Warflight", 7, 0, 0, Color.TECH, "Avengers", "", [ ev => turnState.hyperspeedBoth = true, ev => hyperspeedEv(ev, superPower(Color.TECH, Color.TECH) ? 9 : 7) ]),
},
{
  name: "Hellcat",
  team: "Avengers",
// {POWER Instinct} Choose one - Draw a card or you get +1 Attack.
  c1: makeHeroCard("Hellcat", "Catlike Agility", 2, u, 1, Color.INSTINCT, "Avengers", "FD", ev => superPower(Color.INSTINCT) && chooseOneEv(ev, "Choose one", ["Draw a card", () => drawEv(ev)], ["+1 Attack", () => addAttackEvent(ev, 1)])),
// Reveal the top card of any deck. If it's not a Scheme Twist, you may put it on the bottom of that deck.
// {POWER Instinct} Choose one - Draw a card or you get +1 Recruit.
  c2: makeHeroCard("Hellcat", "Part-Time PI", 3, 2, u, Color.INSTINCT, "Avengers", "D", [ ev => {
    selectCardEv(ev, "Choose a deck", anyDeck(), d => {
      const f = (c: Card[]) => selectCardOptEv(ev, "Put on the bottom of the deck", c.limit(c => !isTwist(c)), c => {
        moveCardEv(ev, c, c.location, true);
      });
      if (d.owner && d === d.owner.deck) revealPlayerDeckEv(ev, 1, f, d.owner, playerState);
      else revealDeckEv(ev, d, 1, f);
      // TODO scheme decks
    });
  }, ev => superPower(Color.INSTINCT) && chooseOneEv(ev, "Choose one", ["Draw a card", () => drawEv(ev)], ["+1 Recruit", () => addRecruitEvent(ev, 1)]) ]),
// Guess Villain, Bystander, Strike, or Twist. Then reveal the top card of the Villain Deck. If you guessed right, you get +2 Attack.
// {TEAMPOWER Avengers} If it was a Villain, you may fight it this turn.
  uc: makeHeroCard("Hellcat", "Demon Sight", 5, u, 2, Color.COVERT, "Avengers", "D", ev => {
    chooseOptionEv(ev, "Guess", [
      {l:"Villain", v:isVillain},
      {l:"Bystander", v:isBystander},
      {l:"Strike", v:isStrike},
      {l:"Twist", v:isTwist},
    ], f => revealVillainDeckEv(ev, 1, cards => {
      cards.has(f) && addAttackEvent(ev, 2);
      superPower("Avengers") && cards.limit(isVillain).each(c => addTurnSet('isFightable', card => c === gameState.villaindeck.top && card === c, () => true));
    }));
  }),
// If a Master Strike or Scheme Twist would occur, you may discard this card from your hand instead. If you do, draw three cards, then shuffle that Strike or Twist back into the Villain Deck.
  ra: makeHeroCard("Hellcat", "Second Chance at Life", 8, u, 6, Color.INSTINCT, "Avengers", "", [], { triggers: [
    youMayDiscardThisInsteadEv("STRIKE", () => true, "draw three cards", ev => {
      drawEv(ev, 3, owner(ev.source));
      shuffleIntoEv(ev, ev.parent.what, gameState.villaindeck);
    }),
    youMayDiscardThisInsteadEv("TWIST", () => true, "draw three cards", ev => {
      drawEv(ev, 3, owner(ev.source));
      shuffleIntoEv(ev, ev.parent.what, gameState.villaindeck);
    }),
  ]}),
},
{
  name: "Photon",
  team: "Avengers",
// To play this, you must discard a card. Draw two cards.
  c1: makeHeroCard("Photon", "Infrared Conversation", 3, u, u, Color.RANGED, "Avengers", "F", ev => drawEv(ev, 2), { playCost: 1, playCostType: 'DISCARD' }),
// To play this, you must discard a card.
// {POWER Ranged} {HYPERSPEED 3}.
  c2: makeHeroCard("Photon", "Ultraviolet Radiation", 4, u, 3, Color.RANGED, "Avengers", "F", ev => superPower(Color.RANGED) && hyperspeedEv(ev, 3), { playCost: 1, playCostType: 'DISCARD' }),
// You get +1 Attack for each card you discarded from your hand this turn.
  uc: makeHeroCard("Photon", "Light the Way", 6, u, 3, Color.COVERT, "Avengers", "", ev => addAttackEvent(ev, pastEvents('DISCARD').count(e => e.where === playerState.hand))),
// {TEAMPOWER Avengers, Avengers} {LAST STAND}
  ra: makeHeroCard("Photon", "Coruscating Vengeance", 8, u, 6, Color.RANGED, "Avengers", "", ev => superPower("Avengers", "Avengers") && lastStandEv(ev)),
},
{
  name: "Quicksilver",
  team: "Avengers",
// {HYPERSPEED 3} for Recruit.
// {POWER Instinct} Instead, {HYPERSPEED 3} for Recruit and Attack.
  c1: makeHeroCard("Quicksilver", "Too Fast to See", 3, 0, 0, Color.INSTINCT, "Avengers", "", ev => hyperspeedEv(ev, 3, superPower(Color.INSTINCT) ? 'BOTH' : 'RECRUIT')),
// {POWER Strength} {HYPERSPEED 4}
  c2: makeHeroCard("Quicksilver", "Perpetual Motion", 4, u, 2, Color.STRENGTH, "Avengers", "FD", ev => superPower(Color.STRENGTH) && hyperspeedEv(ev, 4)),
// Look at the top card of your deck. Discard it or put it back.
// {POWER Instinct} You may KO the card you discarded this way.
  uc: makeHeroCard("Quicksilver", "Jittery Impatience", 6, 2, 2, Color.INSTINCT, "Avengers", "D", ev => { // Copied from Drax
    lookAtDeckEv(ev, 1, cards => selectCardOptEv(ev, "Discard revealed", cards, c => {
      discardEv(ev, c)
    }));
    superPower(Color.INSTINCT) && cont(ev, () => turnState.pastEvents.limit(e => e.type === "DISCARD" && e.parent === ev).each(e => {
      chooseMayEv(ev, "KO discarded card", () => KOEv(ev, e.what));
    }));
  }),
// <b>Hyperspeed</b> your entire remaining deck. (Don't reshuffle.)
// {TEAMPOWER Avengers, Avengers, Avengers, Avengers} Before you do that, put your discard pile on top of your deck.
  ra: makeHeroCard("Quicksilver", "Around the World Punch", 8, u, 0, Color.STRENGTH, "Avengers", "", [
    ev => superPower("Avengers", "Avengers", "Avengers", "Avengers") && shuffleIntoEv(ev, playerState.discard, playerState.deck),
    ev => hyperspeedEv(ev) ]),
},
{
  name: "Ronin",
  team: "Avengers",
// As you play this card, you may choose a color and/or a team icon. This card is that color and team icon this turn. (instead of [Covert] and Avengers)
  c1: makeHeroCard("Ronin", "Mysterious Identity", 3, u, 2, Color.COVERT, "Avengers", "D", ev => {
    chooseColorEv(ev, color => addTurnSet('color', c => c === ev.source, () => color)); // TODO this may be too late in case of triggers on card played.
    // TODO choose and modify team
  }),
// {HYPERSPEED 4}
// {POWER Ranged} Draw a card.
  c2: makeHeroCard("Ronin", "Storm of Arrows", 4, u, 0, Color.RANGED, "Avengers", "F", [ ev => hyperspeedEv(ev, 4), ev => superPower(Color.RANGED) && drawEv(ev) ]),
// {POWER Instinct} {DARK MEMORIES}
  uc: makeHeroCard("Ronin", "Haunted by Loss", 5, u, 2, Color.INSTINCT, "Avengers", "FD", ev => superPower(Color.INSTINCT) && darkMemoriesEv(ev)),
// {DARK MEMORIES}
// {POWER Strength} {DARK MEMORIES} again.
  ra: makeHeroCard("Ronin", "Brooding Fury", 7, u, 3, Color.STRENGTH, "Avengers", "", [ ev => darkMemoriesEv(ev), ev => superPower(Color.STRENGTH) && darkMemoriesEv(ev) ]),
},
{
  name: "Scarlet Witch",
  team: "Avengers",
// {POWER Ranged} Discard the top card of any player's deck. You may play a copy of that card this turn.
  c1: makeHeroCard("Scarlet Witch", "Hex Bolt", 2, u, 1, Color.RANGED, "Avengers", "FD", ev => superPower(Color.RANGED) && choosePlayerEv(ev, p => {
    revealPlayerDeckEv(ev, 1, cards => cards.each(c => {
      discardEv(ev, c);
      addTurnAction(new Ev(ev, 'EFFECT', { what: c, cost: {
        cond: c => c.location === p.discard && !countPerTurn('HEXBOLT', c)
      }, func: ev => {
        playCopyEv(ev, ev.what);
        incPerTurn('HEXBOLT', ev.what);
      } }));
    }), p);
  })),
// Reveal the top card of your deck. Discard it or put it back.
// {POWER Covert} {DARK MEMORIES}
  c2: makeHeroCard("Scarlet Witch", "Alter Reality", 3, 2, 0, Color.COVERT, "Avengers", "D", [ ev => {
    revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Discard revealed", cards, c => {
      discardEv(ev, c)
    }));
   }, ev => superPower(Color.COVERT) && darkMemoriesEv(ev) ]),
// Reveal the top card of the Hero Deck. You may play a copy of that card this turn. When you do, put that card on the bottom of the Hero Deck.
  uc: makeHeroCard("Scarlet Witch", "Chaos Magic", 4, u, u, Color.COVERT, "Avengers", "", ev => {
    revealHeroDeckEv(ev, 1, cards => cards.each(c => addTurnAction(new Ev(ev, 'EFFECT', { what: c, cost: { // TODO make this card visible
      cond: c => c === gameState.herodeck.top
    }, func: ev => {
      playCopyEv(ev, ev.what);
      moveCardEv(ev, ev.what, gameState.herodeck, true);
    } }))));
  }),
// Reveal the top three cards of the Hero Deck. Put one of them in your hand. Put the rest on the top or bottom of the Hero Deck in any order.
// {TEAMPOWER Avengers, Avengers, Avengers} {DARK MEMORIES}
  ra: makeHeroCard("Scarlet Witch", "Warp Time and Space", 7, u, 0, Color.COVERT, "Avengers", "", [ ev => {
    revealHeroDeckEv(ev, 3, cards => selectCardEv(ev, "Choose a card to put in your hand", cards, c => moveCardEv(ev, c, playerState.hand)), false, true);
  }, ev => superPower("Avengers", "Avengers", "Avengers") && darkMemoriesEv(ev) ]),
},
{
  name: "Speed",
  team: "Avengers",
// {HYPERSPEED 2}
// {POWER Instinct} Instead, {HYPERSPEED 6}
  c1: makeHeroCard("Speed", "Accelerate", 2, u, 0, Color.INSTINCT, "Avengers", "FD", ev => hyperspeedEv(ev, superPower(Color.INSTINCT) ? 6 : 2)),
// The next Hero you recruit this turn goes on top of your deck.
  c2: makeHeroCard("Speed", "Speedy Delivery", 4, 2, 1, Color.INSTINCT, "Avengers", "FD", ev => turnState.nextHeroRecruit = 'DECK'),
// Choose a Hero Class. ([Strength], [Instinct], [Covert], [Tech] or [Ranged] ) Reveal the top card of your deck. If it's the Hero Class you named, draw it. Otherwise, put it back on the top or bottom.
  uc: makeHeroCard("Speed", "Race to the Rescue", 5, u, 3, Color.COVERT, "Avengers", "", ev => chooseClassEv(ev, col => {
    revealPlayerDeckEv(ev, 1, cards => {
      cards.limit(col).each(c => drawCardEv(ev, c));
      cont(ev, () => cards.each(c => chooseOneEv(ev, "Put the card back", ["Top", () => {}], ["Bottom", () => moveCardEv(ev, c, playerState.deck, true)])));
    });
  })),
// Look at the top six cards of your deck, draw two of them, and put the rest back on the top or bottom in any order.
// {POWER Covert} {HYPERSPEED 6}
  ra: makeHeroCard("Speed", "Break the Sound Barrier", 8, u, 0, Color.COVERT, "Avengers", "", [ ev => revealPlayerDeckEv(ev, 6, cards => {
    selectObjectsEv(ev, "Choose cards to draw", 2, cards, c => drawCardEv(ev, c)); // TODO top or bottom cleanup
    cont(ev, () => chooseOneEv(ev, "Put the rest back", ["Top", () => {}], ["Bottom", () => {
      chooseOrderEv(ev, "Choose order", cards, c => moveCardEv(ev, c, playerState.deck));
    }]));
  }), ev => superPower(Color.COVERT) && hyperspeedEv(ev, 6) ]),
},
{
  name: "War Machine",
  team: "Avengers",
// {POWER Tech} You may fight a Henchman from your Victory Pile this turn. If you do, KO it and rescue a Bystander. (Do that Henchman's Fight effect too.)
  c1: makeHeroCard("War Machine", "Simulated Target Practice", 3, u, 2, Color.TECH, "Avengers", "D", ev => {
    let done = false;
    addTurnSet('isFightable', c => c.location === playerState.victory && isHenchman(c) && !done, () => true);
    addTurnTrigger('FIGHT', ev => ev.what.location === playerState.victory && isHenchman(ev.what) && !done, ev => {
      KOEv(ev, ev.parent.what);
      rescueEv(ev);
      done = true;
    });
  }),
// Whenever you defeat a Villain this turn, you get +1 Recruit.
// GUN: 1
  c2: makeHeroCard("War Machine", "Military-Industrial Complex", 4, 0, 2, Color.TECH, "Avengers", "GFD", ev => {
    addTurnTrigger('DEFEAT', ev => isVillain(ev.what), ev => addRecruitEvent(ev, 1));
  }),
// {HYPERSPEED 5}
// {POWER Ranged} You may KO a card from your discard pile.
// GUN: 1
  uc: makeHeroCard("War Machine", "Hypersonic Cannon", 5, u, 0, Color.RANGED, "Avengers", "GF", [ ev => hyperspeedEv(ev, 5), ev => superPower(Color.RANGED) && selectCardOptEv(ev, "Choose a card to KO", playerState.discard.deck, c => KOEv(ev, c)) ]),
// Whenever you defeat a Villain or Mastermind this turn, draw a card and rescue a Bystander.
// GUN: 1
  ra: makeHeroCard("War Machine", "Overwhelming Firepower", 8, u, 5, Color.TECH, "Avengers", "G", ev => {
    addTurnTrigger('DEFEAT', ev => isEnemy(ev.what), ev => { drawEv(ev); rescueEv(ev); });
  }),
},
]);
addHeroTemplates("S.H.I.E.L.D.", [
{
  name: "Agent Phil Coulson",
  team: "S.H.I.E.L.D.",
// {SHIELDLEVEL 3} When you draw a new hand of cards at the end of this turn, draw an extra card.
  c1: makeHeroCard("Agent Phil Coulson", "Impeccable Planning", 3, u, 2, Color.COVERT, "S.H.I.E.L.D.", "D", ev => shieldLevelPower(3) && addEndDrawMod(1)),
// Reveal the top card of the S.H.I.E.L.D. Officer Stack. Gain it or put it on the bottom of the stack.
// {POWER Covert} You may send it {UNDERCOVER}.
  c2: makeHeroCard("Agent Phil Coulson", "Build the Strike Team", 4, u, 2, Color.COVERT, "S.H.I.E.L.D.", "D", ev => {
    revealDeckEv(ev, gameState.officer, 1, cards => cards.each(c => {
      const maybeUndercover: [string, () => void][] = superPower(Color.COVERT) ? [["Undecover", () => sendUndercoverEv(ev, c)]] : [];
      chooseOneEv(ev, "Choose one", ["Gain", () => gainEv(ev, c)], ["Put on the bottom", () => moveCardEv(ev, c, gameState.officer, true)], ...maybeUndercover)
    }));
  }),
// Choose one:
// - Send a S.H.I.E.L.D. Hero from your hand {UNDERCOVER}.
// - Or you get +1 Attack for each 2 <b>S.H.I.E.L.D. Levels</b> you have.
  uc: makeHeroCard("Agent Phil Coulson", "Approve Orbital Strike", 6, u, 0, Color.TECH, "S.H.I.E.L.D.", "D", ev => {
    const attackAmount = Math.floor(shieldLevel()/2);
    chooseOneEv(ev, "Choose one",
      ["Send a Hero undercover", () => selectCardEv(ev, "Choose a Hero", playerState.hand.limit(isHero).limit("S.H.I.E.L.D."), c => sendUndercoverEv(ev, c))],
      [`Get +${attackAmount} attack`, () => addAttackEvent(ev, attackAmount)],
    );
  }),
// During any player's turn, when another S.H.I.E.L.D. Hero is put into the KO pile, you may discard this card to send that Hero {UNDERCOVER} in your Victory Pile instead. If you do, draw three cards.
// {SHIELDLEVEL 8} You get +4 Attack.
// GUN: 1
  ra: makeHeroCard("Agent Phil Coulson", "Fake But Inspiring Death", 8, u, 4, Color.COVERT, "S.H.I.E.L.D.", "G", ev => shieldLevelPower(8) && addAttackEvent(ev, 4), {
    trigger: youMayDiscardThisInsteadEv("KO", ev => isHero(ev.what) && isTeam('S.H.I.E.L.D.')(ev.what), "send the Hero undercover and draw three cards", ev => {
        sendUndercoverEv(ev, ev.parent.what, owner(ev.source));
        drawEv(ev, 3, owner(ev.source));
      }),
  }),
},
{
  name: "Quake",
  team: "S.H.I.E.L.D.",
// To play this, you must discard a S.H.I.E.L.D. Hero.
// {POWER Ranged} You may send the Hero you discarded {UNDERCOVER}.
  c1: makeHeroCard("Quake", "Going Underground", 3, 3, u, Color.RANGED, "S.H.I.E.L.D.", "", ev => superPower(Color.RANGED) && chooseMayEv(ev, "Send the discarded Hero undercover", () => {
    pastEvents("DISCARD").limit(e => e.parent == ev.parent).each(e => sendUndercoverEv(ev, e.what));
  }), { playCost: 1, playCostType: 'DISCARD', playCostLimit: c => isHero(c) && isTeam('S.H.I.E.L.D.')(c) }),
// {SHIELDLEVEL 2} You get +2 Attack.
// GUN: 1
  c2: makeHeroCard("Quake", "Aftershock", 4, u, 2, Color.RANGED, "S.H.I.E.L.D.", "GFD", ev => shieldLevelPower(2) && addAttackEvent(ev, 2)),
// Whenever you fight a Villain this turn, if its Attack is higher than your <b>S.H.I.E.L.D. Level</b>, you may send a S.H.I.E.L.D. Hero from the S.H.I.E.L.D. Officer Stack {UNDERCOVER}.
// {SHIELDLEVEL 4} You get +4 Attack
  uc: makeHeroCard("Quake", "Tectonic Wave", 6, u, 2, Color.COVERT, "S.H.I.E.L.D.", "D", [
    ev => addTurnTrigger('FIGHT', ev => isVillain(ev.what) && ev.what.defense > shieldLevel(), ev => chooseMayEv(ev, "Send a S.H.I.E.L.D. Officer undercover", () => {
      gameState.officer.withTop(c => sendUndercoverEv(ev, c));
    })),
    ev => shieldLevelPower(4) && addAttackEvent(ev, 4),
  ]),
// You may send a S.H.I.E.L.D. Hero from the S.H.I.E.L.D. Officer Stack {UNDERCOVER}.
// Then, for each <b>S.H.I.E.L.D. Level</b> you have up to 5, choose a Hero from the HQ. Put all those Heroes on the bottom of the Hero Deck and you get their total printed Attack.
  ra: makeHeroCard("Quake", "Roil the Earth", 7, u, 0, Color.RANGED, "S.H.I.E.L.D.", "", [ ev => chooseMayEv(ev, "Send a S.H.I.E.L.D. Officer undercover", () => {
    gameState.officer.withTop(c => sendUndercoverEv(ev, c));
  }), ev => {
    selectObjectsEv(ev, "Choose HQ Heroes", Math.min(shieldLevel(), 5), hqHeroes(), c => {
      c.printedAttack && addAttackEvent(ev, c.printedAttack);
      moveCardEv(ev, c, gameState.herodeck, true);
    });
  } ]),
},
{
  name: "Deathlok",
  team: "S.H.I.E.L.D.",
// Draw a card.
// {SHIELDLEVEL 1} You get +1 Attack.
// GUN: 1
  c1: makeHeroCard("Deathlok", "Authorize Lethal Force", 2, u, 0, Color.TECH, "S.H.I.E.L.D.", "GFD", [ ev => drawEv(ev), ev => shieldLevelPower(1) && addAttackEvent(ev, 1) ]),
// {POWER Tech} You may send a S.H.I.E.L.D. Hero {UNDERCOVER} from your discard pile or the KO pile.
  c2: makeHeroCard("Deathlok", "Reanimate Into Service", 4, u, 2, Color.TECH, "S.H.I.E.L.D.", "D", ev => 
    superPower(Color.TECH) && selectCardOptEv(ev, "Chose a Hero to send undercover", [...gameState.ko.deck, ...playerState.discard.deck].limit(isHero).limit('S.H.I.E.L.D.'), c => sendUndercoverEv(ev, c))),
// {SHIELDLEVEL 3} You get +3 Attack
// If your S.H.I.E.L.D. Level is less than 3, you may send a S.H.I.E.L.D. card from your discard pile {UNDERCOVER}.
// GUN: 1
  uc: makeHeroCard("Deathlok", "Headlok", 5, 3, 0, Color.STRENGTH, "S.H.I.E.L.D.", "GF", ev =>
    shieldLevelPower(3) ?
      addAttackEvent(ev, 3) :
      selectCardOptEv(ev, "Choose a Hero to send undercover", playerState.discard.limit(isHero).limit('S.H.I.E.L.D.'), c => sendUndercoverEv(ev, c))),
// You may send a S.H.I.E.L.D. Hero from your discard pile {UNDERCOVER}.
// {SHIELDLEVEL 3} You get the total printed Recruit of all the S.H.I.E.L.D. Heroes in your Victory Pile.
// GUN: 1
  ra: makeHeroCard("Deathlok", "Behind Enemy Lines", 8, 0, 5, Color.COVERT, "S.H.I.E.L.D.", "G", [ ev => {
    selectCardOptEv(ev, "Choose a Hero to send undercover", playerState.discard.limit(isHero).limit('S.H.I.E.L.D.'), c => sendUndercoverEv(ev, c))
  }, ev => shieldLevelPower(3) && addRecruitEvent(ev, playerState.victory.limit(isHero).limit('S.H.I.E.L.D.').sum(c => c.printedRecruit || 0))
  ]),
},
{
  name: "Mockingbird",
  team: "S.H.I.E.L.D.",
// Look at the top card of your deck. Discard it or put it back.
// {POWER Instinct} If that card was a S.H.I.E.L.D. Hero, you may send it {UNDERCOVER}.
// GUN: 1
  c1: makeHeroCard("Mockingbird", "Take Cover", 3, 2, u, Color.INSTINCT, "S.H.I.E.L.D.", "GD", ev => {
    lookAtDeckEv(ev, 1, cards => {
      superPower(Color.INSTINCT) && selectCardOptEv(ev, "Undercover revealed", cards.limit(isHero).limit('S.H.I.E.L.D.'), c => sendUndercoverEv(ev, c))
      cont(ev, () => selectCardOptEv(ev, "Discard revealed", cards, c => discardEv(ev, c)));
    });
  }),
// {SHIELDLEVEL 2} Draw a card.
  c2: makeHeroCard("Mockingbird", "Battle Staves", 4, u, 2, Color.INSTINCT, "S.H.I.E.L.D.", "FD", ev => shieldLevelPower(2) && drawEv(ev)),
// Choose one:
// - Send a card from the S.H.I.E.L.D. Officer Stack {UNDERCOVER}.
// - Or you get +1 Attack for each 2 <b>S.H.I.E.L.D. Levels</b> you have.
// GUN: 1
  uc: makeHeroCard("Mockingbird", "Spymaster", 5, u, 1, Color.COVERT, "S.H.I.E.L.D.", "GD", ev => {
    const attackAmount = Math.floor(shieldLevel()/2);
    chooseOneEv(ev, "Choose one",
      ["Send a S.H.I.E.L.D. Officer undercover", () => gameState.officer.withTop(c => sendUndercoverEv(ev, c))],
      [`Get +${attackAmount} Attack`, () => addAttackEvent(ev, attackAmount)]
    );
  }),
// Draw a card.
// Send two cards from the S.H.I.E.L.D. Officer Stack {UNDERCOVER}.
// Then you get +1 Recruit and +1 Attack for each 2 <b>S.H.I.E.L.D. Levels</b> you have.
  ra: makeHeroCard("Mockingbird", "Infinity Formula", 7, 0, 0, Color.TECH, "S.H.I.E.L.D.", "D", [
    ev => drawEv(ev),
    ev => gameState.officer.withTop(c => sendUndercoverEv(ev, c)),
    ev => gameState.officer.withTop(c => sendUndercoverEv(ev, c)),
    ev => {
      const amount = Math.floor(shieldLevel()/2);
      addRecruitEvent(ev, amount);
      addAttackEvent(ev, amount);
    },
  ]),
},
]);
addHeroTemplates("Heroes of Asgard", [
{
  name: "Thor",
  team: "Heroes of Asgard",
// If you are {WORTHY}, you get +2 Attack.
  c1: makeHeroCard("Thor", "Test of Virtue", 3, 2, 0, Color.RANGED, "Heroes of Asgard", "FD", ev => worthyPower() && addAttackEvent(ev, 2)),
// You get +1 Attack for each other card you played this turn that makes you {WORTHY}.
  c2: makeHeroCard("Thor", "Divine Lightning", 5, u, 3, Color.RANGED, "Heroes of Asgard", "F", ev => {
    addAttackEvent(ev, turnState.cardsPlayed.limit(isHero).count(c => c !== ev.source && c.cost >= 5));
  }),
// You cannot throw Mjolnir unless you are {WORTHY}.
// {THROWN ARTIFACT} When you throw this, you get +3 Attack, then you get +1 Attack for each [Ranged] Hero you played this turn.
  uc: makeHeroCard("Thor", "Mjolnir", 4, u, u, Color.STRENGTH, "Heroes of Asgard", "", ev => {
    addAttackEvent(ev, 3);
    addAttackEvent(ev, superPower(Color.RANGED));
  }, { ...thrownArtifact, throwCond: () => worthyPower() }),
// {TEAMPOWER Heroes of Asgard} Each player who is {WORTHY} draws a card. Each Villain that isn't worth at least 5VP gets -1 Attack this turn.
  ra: makeHeroCard("Thor", "Royal Decree", 8, u, 5, Color.RANGED, "Heroes of Asgard", "", ev => {
    if (superPower("Heroes of Asgard")) {
      eachPlayer(p => worthyPower(p) && drawEv(ev, 1, p));
      addTurnMod('defense', c => isVillain(c) && !(c.vp >= 5), -1);
    }
  }),
},
{
  name: "Beta Ray Bill",
  team: "Heroes of Asgard",
// To play this, you must discard a card.
// Then, if you are {WORTHY}, draw a card.
  c1: makeHeroCard("Beta Ray Bill", "Hope of the Korbinites", 1, 2, u, Color.STRENGTH, "Heroes of Asgard", "FD", ev => {
    worthyPower() && drawEv(ev);
  }, { playCost: 1, playCostType: 'DISCARD' }),
// You may discard a card. If you do, draw a card.
  c2: makeHeroCard("Beta Ray Bill", "Bio-Engineered Cyborg", 5, u, 3, Color.TECH, "Heroes of Asgard", "F", ev => {
    selectCardOptEv(ev, "Discard a card", playerState.hand.deck, c => { discardEv(ev, c); drawEv(ev); });
  }),
// You cannot throw Stormbreaker unless you are {WORTHY}.
// {THROWN ARTIFACT} To throw this, you must discard a card from your hand. Then you get +2 Attack for each card you discarded from your hand this turn.
  uc: makeHeroCard("Beta Ray Bill", "Stormbreaker", 4, u, u, Color.RANGED, "Heroes of Asgard", "D", ev => {
    if (playerState.hand.size) {
      pickDiscardEv(ev, 1);
      cont(ev, () => addAttackEvent(ev, 2 * pastEvents('DISCARD').count(e => e.where === playerState.hand)));
    }
  }, { ...thrownArtifact, throwCond: () => worthyPower() && playerState.hand.size > 0 }),
// You may discard a card. Then count the number of cards you discarded from your hand this turn. Draw that many cards.
// GUN: 1
  ra: makeHeroCard("Beta Ray Bill", "The Warship Skuttlebutt", 8, u, 4, Color.TECH, "Heroes of Asgard", "G", ev => {
    selectCardOptEv(ev, "Discard a card", playerState.hand.deck, c => discardEv(ev, c));
    cont(ev, () => drawEv(ev, pastEvents('DISCARD').count(e => e.where === playerState.hand)));
  }),
},
{
  name: "Valkyrie",
  team: "Heroes of Asgard",
// {THROWN ARTIFACT} When you throw this, you get {SEWERS CONQUEROR 2}.
  c1: makeHeroCard("Valkyrie", "Dragonfang", 3, u, u, Color.STRENGTH, "Heroes of Asgard", "FD", ev => heroConquerorEv(ev, 'SEWERS', 2), { ...thrownArtifact }),
// {ROOFTOPS CONQUEROR 1}
// When an Ambush ability is played, before it takes effect, you may discard this card. If you do, draw two extra cards at the end of this turn.
  c2: makeHeroCard("Valkyrie", "Flying Stallion", 4, u, 2, Color.INSTINCT, "Heroes of Asgard", "D", ev => heroConquerorEv(ev, 'ROOFTOPS', 1), { trigger: {
    event: 'CARDEFFECT',
    match: (ev, source: Card) => ev.effectName == 'ambush' && owner(source) && source.location === owner(source).hand,
    before: ev => chooseMayEv(ev, "Discard to draw two extra cards", () => {
      discardEv(ev, ev.source);
      owner(ev.source) === playerState ? addEndDrawMod(2) : addTurnTrigger("CLEANUP", undefined, tev => drawEv(tev, 2, owner(ev.source)));
    }, owner(ev.source))
  }}),
// {BRIDGE CONQUEROR 1}
// {TEAMPOWER Heroes of Asgard} The first time you defeat a Villain this turn, you may KO one of your cards or a card from your discard pile.
  uc: makeHeroCard("Valkyrie", "Usher to Valhalla", 6, u, 2, Color.COVERT, "Heroes of Asgard", "D", [
    ev => heroConquerorEv(ev, 'BRIDGE', 1),
    ev => superPower("Heroes of Asgard") && addTurnTrigger('DEFEAT',
      ev => isVillain(ev.what) && !pastEvents('DEFEAT').has(ev => isVillain(ev.what)),
      { after: ev => selectCardOptEv(ev, "Choose a card to KO", [...revealable(), ...playerState.discard.deck], c => KOEv(ev, c)) })
  ]),
// {STREETS CONQUEROR 1}
// [Instinct] : You get +1 Attack for every 4 Heroes in the KO pile.
  ra: makeHeroCard("Valkyrie", "Ride of the Valkyries", 7, u, 4, Color.INSTINCT, "Heroes of Asgard", "", [
    ev => heroConquerorEv(ev, 'STREETS', 1),
    ev => superPower(Color.INSTINCT) && addAttackEvent(ev, Math.floor(gameState.ko.count(isHero)/4))
  ]),
},
{
  name: "Lady Sif",
  team: "Heroes of Asgard",
// {THROWN ARTIFACT} When you throw this you get +1 Recruit and +1 Attack.
  c1: makeHeroCard("Lady Sif", "Dimensional Blade", 2, u, u, Color.INSTINCT, "Heroes of Asgard", "FD", ev => {
    addRecruitEvent(ev, 1);
    addAttackEvent(ev, 1);
  }, { ...thrownArtifact }),
// If you control any Artifacts, you get +2 Attack.
  c2: makeHeroCard("Lady Sif", "Weapons Master", 5, u, 2, Color.INSTINCT, "Heroes of Asgard", "FD", ev => playerState.artifact.size && addAttackEvent(ev, 2)),
// {THROWN ARTIFACT} You may throw this to get +1 Attack.
// During any player's turn, if a player would gain a Wound, you may throw this to prevent that Wound and draw two cards instead.
  uc: makeHeroCard("Lady Sif", "Winged Helm", 3, u, u, Color.STRENGTH, "Heroes of Asgard", "", ev => addAttackEvent(ev, 1), {
    ...thrownArtifact,
    trigger: {
      event: "GAIN",
      match: (ev, source: Card) => isWound(ev.what) && owner(source) && source.location === owner(source).artifact,
      replace: ev => selectCardOptEv(ev, "Throw to draw 2 cards", [ev.source], () => {
        pushEv(ev, 'THROWARTIFACT', { what: ev.source, func: ev => {
          moveCardEv(ev, ev.what, owner(ev.what).deck, true);
          drawEv(ev, 2, owner(ev.what));
        }});
      }, () => doReplacing(ev), owner(ev.source))
    }
  }),
// {THROWN ARTIFACT} When you throw this, you get +4 Attack and you may KO a card from your hand or discard pile.
  ra: makeHeroCard("Lady Sif", "Golden Apples of Idunn", 7, u, u, Color.COVERT, "Heroes of Asgard", "", ev => {
    addAttackEvent(ev, 4);
    KOHandOrDiscardEv(ev);
  }, { ...thrownArtifact }),
},
{
  name: "The Warriors Three",
  team: "Heroes of Asgard",
// You may move a Villain to an adjacent city space. If another Villain is already there, swap them.
// {POWER Covert} Draw a card.
  c1: makeHeroCard("The Warriors Three", "Fandral the Dashing", 3, u, 2, Color.INSTINCT, "Heroes of Asgard", "F", [
    ev => {
      selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
        selectCardEv(ev, "Choose a new city space", cityAdjacent(v.location), dest => swapCardsEv(ev, v.location, dest));
      });
    },
    ev => superPower(Color.COVERT) && drawEv(ev)
  ]),
// {POWER Strength} You may KO a card from your hand or discard pile.
  c2: makeHeroCard("The Warriors Three", "Hogun the Grim", 4, 2, u, Color.COVERT, "Heroes of Asgard", "FD", ev => superPower(Color.STRENGTH) && KOHandOrDiscardEv(ev, undefined)),
// {BRIDGE CONQUEROR 1}
// {POWER Instinct} Instead, {BRIDGE CONQUEROR 3}
  uc: makeHeroCard("The Warriors Three", "Volstagg the Valiant", 6, u, 3, Color.STRENGTH, "Heroes of Asgard", "F", ev => heroConquerorEv(ev, 'BRIDGE', superPower(Color.INSTINCT) ? 3 : 1)),
// If you played at least three other non-grey Heroes with different cad ames this turn, you get +3 Attack // FIX
// {TEAMPOWER Heroes of Asgard} {STREETS CONQUEROR 3}
  ra: makeHeroCard("The Warriors Three", "Three Stand as One", 8, u, 4, Color.STRENGTH, "Heroes of Asgard", "", [
    ev => turnState.cardsPlayed.limit(isNonGrayHero).uniqueCount(c => c.cardName) >= 3 && addAttackEvent(ev, 3),
    ev => superPower("Heroes of Asgard") && heroConquerorEv(ev, 'STREETS', 3)
  ]),
},
]);
addHeroTemplates("New Mutants", [
{
  name: "Sunspot",
  team: "X-Men",
// {MOONLIGHT} You may put a Hero from the HQ on the bottom of the Hero Deck.
// {SUNLIGHT} Draw a card.
  c1: makeHeroCard("Sunspot", "Absorb Radiation", 2, 1, u, Color.RANGED, "X-Men", "D", [
    ev => moonlightPower() && selectCardOptEv(ev, "Choose a Hero", hqHeroes(), c => moveCardEv(ev, c, gameState.herodeck, true)),
    ev => sunlightPower() && drawEv(ev),
  ]),
// {SUNLIGHT} You may put a card from your hand on the bottom of you deck. If you do, you get +2 Attack.
  c2: makeHeroCard("Sunspot", "Solar-Powered", 4, u, 2, Color.STRENGTH, "X-Men", "FD", ev => {
    sunlightPower() && selectCardOptEv(ev, "Choose a card", playerState.hand.deck, c => { moveCardEv(ev, c, playerState.deck, true); addAttackEvent(ev, 2); });
  }),
// To play this, you must put a card from your hand on the bottom of your deck.
// {SUNLIGHT} You get +1 Attack for each other X-Men card you played this turn.
  uc: makeHeroCard("Sunspot", "Thermokinetic Fury", 6, u, 4, Color.RANGED, "X-Men", "", ev => sunlightPower() && addAttackEvent(ev, superPower("X-Men")), {
    playCost: 1, playCostType: 'BOTTOMDECK',
  }),
// Choose any number of Heroes in the HQ. Put them on the bottom of the Hero Deck.
// {SUNLIGHT} You get +1 Attack for each Hero in the HQ with an even-numbered cost.
  ra: makeHeroCard("Sunspot", "Empyreal Force", 8, u, 3, Color.STRENGTH, "X-Men", "", [
    ev => selectObjectsAnyEv(ev, "Choose Heroes to put on the bottom of the deck", hqHeroes(), c => moveCardEv(ev, c, gameState.herodeck, true)),
    ev => sunlightPower() && addAttackEvent(ev, sunlightAmount()) ]),
},
{
  name: "Wolfsbane",
  team: "X-Men",
// {SUNLIGHT} You may put a Hero from the HQ on the bottom of the Hero Deck.
// {MOONLIGHT} Draw a card.
  c1: makeHeroCard("Wolfsbane", "Wolf Out", 3, 2, u, Color.INSTINCT, "X-Men", "D", [
    ev => sunlightPower() && selectCardOptEv(ev, "Choose a Hero", hqHeroes(), c => moveCardEv(ev, c, gameState.herodeck, true)),
    ev => moonlightPower() && drawEv(ev),
  ]),
// {MOONLIGHT} Look at the top two cards of your deck. Discard any number of them and put the rest back in any order.
  c2: makeHeroCard("Wolfsbane", "Night Vision", 3, u, 2, Color.STRENGTH, "X-Men", "D",
    ev => moonlightPower() &&
      lookAtDeckEv(ev, 2, cards => selectObjectsAnyEv(ev, "Choose cards to discard", cards, c => discardEv(ev, c)))),
// {MOONLIGHT} Look at the top card of your deck. KO it or put it back.
  uc: makeHeroCard("Wolfsbane", "Howl at the Moon", 5, u, 3, Color.COVERT, "X-Men", "F",
    ev => moonlightPower() &&
      lookAtDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c)))),
// Look at the top three cards of your deck. Discard any number of them and put the rest back in any order.
// {MOONLIGHT} You get the total printed Attack of all the cards you discarded from your deck this turn.
// GUN: 1
  ra: makeHeroCard("Wolfsbane", "Nocturnal Savagery", 7, u, 4, Color.INSTINCT, "X-Men", "G", [
    ev => lookAtDeckEv(ev, 3, cards => selectObjectsAnyEv(ev, "Choose cards to discard", cards, c => discardEv(ev, c))),
    ev => moonlightPower() && addAttackEvent(ev, pastEvents('DISCARD').limit(e => playerState.deck === e.where).sum(e => e.what.printedAttack || 0)),
  ]),
},
{
  name: "Mirage",
  team: "X-Men",
// When a card effect causes you to discard this card, set it aside. At the end of this turn, add it to your hand as an extra card.
  c1: makeHeroCard("Mirage", "Empathic Link", 3, 2, u, Color.INSTINCT, "X-Men", "D", u, { trigger: {
    event: 'DISCARD',
    match: (ev, source) => ev.what === source && ev.parent.getSource() instanceof Card,
    replace: ev => {
      const p = owner(ev.source);
      attachCardEv(ev, ev.source, p.deck, 'SETASIDE');
      addTurnTrigger('CLEANUP', undefined, () => moveCardEv(ev, ev.source, p.hand));
    },
  }}),
// {MOONLIGHT} You may discard a card. If you do, draw a card.
  c2: makeHeroCard("Mirage", "Dreams Made Real", 3, u, 2, Color.RANGED, "X-Men", "FD", ev => {
    moonlightPower() && selectCardOptEv(ev, "Discard a card", playerState.hand.deck, c => { discardEv(ev, c); drawEv(ev); });
  }),
// You may have a {WAKING NIGHTMARE}. You get +Attack equal to the cost of the card you discarded this way.
  uc: makeHeroCard("Mirage", "Nightmare Wolves", 6, u, 1, Color.COVERT, "X-Men", "", ev => wakingNightmareOptEv(ev, c => addAttackEvent(ev, c.cost))),
// Whenever a card effect causes you to discard a card from your hand this turn, you get +2 Attack.
// {MOONLIGHT} You may have a {WAKING NIGHTMARE}.
  ra: makeHeroCard("Mirage", "Haunted By the Demon Bear", 7, u, 4, Color.COVERT, "X-Men", "D", [
    ev => addTurnTrigger('DISCARD', e => e.where === playerState.hand && ev.getSource() instanceof Card, { after: ev => addAttackEvent(ev, 2) }),
    ev => moonlightPower() && wakingNightmareOptEv(ev)
  ]),
},
{
  name: "Warlock",
  team: "X-Men",
// Look at the top two cards of your deck. Draw one and discard the other.
  c1: makeHeroCard("Warlock", "Earthling Choices", 2, u, u, Color.TECH, "X-Men", "D", ev => lookAtDeckEv(ev, 2, cards => {
    selectCardEv(ev, "Choose a card to draw", cards, c => {
      drawCardEv(ev, c);
      cards.limit(c1 => c1 !== c).each(c => discardEv(ev, c));
    });
  })),
// {SUNLIGHT} You get +2 Recruit.
// {MOONLIGHT} You get +2 Attack.
// {POWER Tech} Instead, you get both.
  c2: makeHeroCard("Warlock", "Analyze Planetary Rotation", 3, 0, 0, Color.TECH, "X-Men", "D", [
    ev => (superPower(Color.TECH) || sunlightPower()) && addRecruitEvent(ev, 2),
    ev => (superPower(Color.TECH) || moonlightPower()) && addAttackEvent(ev, 2),
  ]),
// {POWER Tech} The first time you defeat a Villain this turn, you may KO one of your cards or a card from your discard pile.
  uc: makeHeroCard("Warlock", "Techno-Organic Adaptation", 6, u, 3, Color.COVERT, "X-Men", "",
  ev => superPower(Color.TECH) && addTurnTrigger('DEFEAT', ev => isVillain(ev.what) && !pastEvents('DEFEAT').has(e => isVillain(e.what)), { after: ev => {
    selectCardAndKOEv(ev, [...handOrDiscard(), ...playerState.playArea.deck]);
  } })),
// {SUNLIGHT} Draw 3 cards.
// {MOONLIGHT} You get +3 Recruit and +3 Attack.
// {TEAMPOWER X-Men, X-Men, X-Men, X-Men} Instead, you get both.
  ra: makeHeroCard("Warlock", "Nanite Shapeshifter", 7, 0, 0, Color.TECH, "X-Men", "", [
    ev => (superPower("X-Men", "X-Men", "X-Men", "X-Men") || sunlightPower()) && drawEv(ev, 3),
    ev => (superPower("X-Men", "X-Men", "X-Men", "X-Men") || moonlightPower()) && (addRecruitEvent(ev, 3), addAttackEvent(ev, 3)),
  ]),
},
{
  name: "Karma",
  team: "X-Men",
// {POWER Covert} Choose a Villain. You get +1 Attack for each Villain adjacent to it.
  c1: makeHeroCard("Karma", "Sow Rivalry", 3, u, 2, Color.COVERT, "X-Men", "FD", ev => superPower(Color.COVERT) && selectCardEv(ev, "Choose a Villain", villains(), c => {
    addAttackEvent(ev, cityAdjacent(c.location).sum(d => d.count(isVillain)));
  })),
// Guess a color. Then reveal the top card of the Hero Deck and put it back on the top or bottom of that deck. If you guessed right, you get +2 Attack.
  c2: makeHeroCard("Karma", "Temporary Possession", 4, u, 2, Color.COVERT, "X-Men", "D", ev => chooseColorEv(ev, color => {
    revealHeroDeckEv(ev, 1, cards => {
      cards.has(color) && addAttackEvent(ev, 2);
      selectCardOptEv(ev, "Put on bottom of the deck", cards, c => moveCardEv(ev, c, gameState.herodeck, true));
    });
  })),
// Reveal the top card of the Hero Deck. You may recruit it this turn. If you do, you may KO one of your cards or a card from your discard pile.
  uc: makeHeroCard("Karma", "Karmic Balance", 6, 4, u, Color.RANGED, "X-Men", "", ev => revealHeroDeckEv(ev, 1, cards => cards.each(c => {
    addTurnAction(recruitCardActionEv(ev, c)); // TODO reveal until end of turn
    addTurnTrigger('RECRUIT', ev => ev.what === c && ev.where === gameState.herodeck, () => selectCardAndKOEv(ev, [...handOrDiscard(), ...playerState.playArea.deck]));
  }))),
// {TEAMPOWER X-Men} Choose a Villain in the city. You get +Attack equal to its VP, usable only against other Villains or the Mastermind.
  ra: makeHeroCard("Karma", "Control Like a Puppet", 8, u, 5, Color.RANGED, "X-Men", "", ev => superPower("X-Men") && selectCardEv(ev, "Choose a Villain", cityVillains(), c => {
    c.vp && addAttackSpecialEv(ev, c1 => (isMastermind(c1) || isVillain(c1)) && c !== c1, c.vp);
  } )),
},
]);
addHeroTemplates("Into the Cosmos", [
{
  name: "Captain Mar-Vell",
  team: "Avengers",
// If you would get Attack from <b>Danger Sense</b> this turn, gain that many Shards instead.
// {DANGERSENSE 1}
// {POWER Ranged} Instead, same effect with {DANGERSENSE 2}
  c1: makeHeroCard("Captain Mar-Vell", "Cosmic Awareness", 2, u, 1, Color.RANGED, "Avengers", "D", [
    ev => addTurnTrigger('ADDATTACK', ev => ev.parent.type === 'DANGERSENSE', { replace: ev => gainShardEv(ev, ev.parent.amount) }),
    ev => dangerSenseEv(ev, superPower(Color.RANGED) ? 2 : 1),
  ]),
// If you gained any Shards this turn, draw a card.
  c2: makeHeroCard("Captain Mar-Vell", "Kree Genetics", 3, 2, u, Color.STRENGTH, "Avengers", "FD", ev => {
    pastEvents('MOVECARD').has(e => e.to === playerState.shard) && drawEv(ev);
  }),
// {TEAMPOWER Avengers} Reveal the top card of your deck. If it costs 1 or more, gain a Shard. If it costs 0, KO it.
  uc: makeHeroCard("Captain Mar-Vell", "Channel the Nega-Bands", 6, u, 2, Color.TECH, "Avengers", "D", ev => {
    superPower("Avengers") && revealPlayerDeckEv(ev, 1, cards => {
      cards.limit(c => !c.cost).each(c => KOEv(ev, c));
      cards.has(c => c.cost >= 1) && gainShardEv(ev);
    });
  }),
// {DANGERSENSE 4}
// If you gained any Shards this turn before playing this card, {DANGERSENSE 7} instead.
  ra: makeHeroCard("Captain Mar-Vell", "Protector of the Universe", 7, u, 3, Color.COVERT, "Avengers", "", ev => {
    dangerSenseEv(ev, pastEvents('MOVECARD').has(e => e.to === playerState.shard) ? 7 : 4);
  }),
},
{
  name: "Quasar",
  team: "Avengers",
// {POWER Covert} Whenever you recruit a Hero from the HQ this turn, gain a Shard.
  c1: makeHeroCard("Quasar", "Manipulate Gravitons", 3, 2, u, Color.COVERT, "Avengers", "D", ev => {
    superPower(Color.COVERT) && addTurnTrigger('RECRUIT', ev => ev.where.isHQ, { after: ev => gainShardEv(ev) });
  }),
// {BURN A SHARD}: You get +3 Attack
  c2: makeHeroCard("Quasar", "Cosmic Champion", 4, u, 2, Color.RANGED, "Avengers", "FD", ev => {
    setBurnShardEv(ev, 1, ev => addAttackEvent(ev, 3));
  }),
// Gain a Shard.
// {BURN 2 SHARDS}: You man KO a card from your hand or discard pile.
  uc: makeHeroCard("Quasar", "The Quantum Bands", 5, u, 1, Color.COVERT, "Avengers", "D", [
    ev => gainShardEv(ev),
    ev => setBurnShardEv(ev, 2, ev => KOHandOrDiscardEv(ev)),
  ]),
// Whenever you defeat a Villain or Mastermind this turn, gain a Shard.
// {BURN 4 SHARDS}: You get +7 Attack
  ra: makeHeroCard("Quasar", "The Star Brand", 7, u, 4, Color.STRENGTH, "Avengers", "", [
    ev => addTurnTrigger('DEFEAT', ev => isEnemy(ev.what), { after: ev => gainShardEv(ev) }),
    ev => setBurnShardEv(ev, 4, ev => addAttackEvent(ev, 7)),
  ]),
},
{
  name: "Adam Warlock",
  team: "Avengers",
// Gain a Shard.
// {BURN 2 SHARDS}: Halve the cost of a Hero in the HQ this turn. (Round the cost up.)
  c1: makeHeroCard("Adam Warlock", "Transmute Matter", 3, u, u, Color.COVERT, "Avengers", "D", [
    ev => gainShardEv(ev),
    ev => setBurnShardEv(ev, 2, ev => selectCardEv(ev, "Choose a Hero", hqHeroes(), c => {
      addTurnSet('cost', c1 => c1 === c, (c, v) => Math.ceil(v/2))
    })) ]),
// To play this, you must discard a card.
// When you draw a new hand of cards at the end of this turn, draw two extra cards.
  c2: makeHeroCard("Adam Warlock", "Regenerative Cocoon", 4, u, u, Color.STRENGTH, "Avengers", "", ev => addEndDrawMod(2), { playCost: 1, playCostType: 'DISCARD' }),
// Gain 2 Shards
// {POWER Covert} {BURN 4 SHARDS}: Defeat a Villain.
  uc: makeHeroCard("Adam Warlock", "Soulblast", 5, u, u, Color.COVERT, "Avengers", "FD", [
    ev => gainShardEv(ev, 2),
    ev => superPower(Color.COVERT) && setBurnShardEv(ev, 4, ev => selectCardEv(ev, "Choose a Villain", villains(), c => defeatEv(ev, c))),
  ]),
// Gain 4 Shards.
// {TEAMPOWER Avengers, Avengers} {BURN 8 SHARDS}: Defeat the Mastermind once. Then reveal the top card of the Villain Deck. If it's a Master Strike, then Adam Warlock is corrupted by power. At the start of next turn, add the Magus Mastermind to the game with one random Tactic. (If he has never been in this game.)
  ra: makeHeroCard("Adam Warlock", "Manifest the Soul Gem", 8, u, u, Color.RANGED, "Avengers", "", [
    ev => gainShardEv(ev, 4),
    ev => superPower("Avengers", "Avengers") && setBurnShardEv(ev, 8, ev => {
      withMastermind(ev, c => defeatEv(ev, c));
      revealVillainDeckEv(ev, 1, cards => cards.has(isStrike) && addFutureTrigger(ev => addMastermindEv(ev, "Magus")));
    }),
  ]),
},
{
  name: "Moondragon",
  team: "Avengers",
// When you draw a new hand of cards at the end of this turn, if you didn't fight anything this turn, draw an extra card.
  c1: makeHeroCard("Moondragon", "Peaceful Meditation", 3, 2, u, Color.COVERT, "Avengers", "D", ev => addTurnTrigger('CLEANUP', undefined, { before: ev => {
    pastEvents('FIGHT').size === 0 && addEndDrawMod(1);
  }})),
// {DANGERSENSE 2}
// {POWER Instinct} If this revealed any Scheme Twists, gain a Shard.
  c2: makeHeroCard("Moondragon", "Psionic Warning", 4, u, 1, Color.INSTINCT, "Avengers", "D", 
    ev => dangerSenseEv(ev, 2, cards => superPower(Color.INSTINCT) && cards.has(isTwist) && gainShardEv(ev))),
// {DANGERSENSE 4}
// {TEAMPOWER Avengers} If this revealed at least two Master Strikes, you may shuffle the Villain Deck.
  uc: makeHeroCard("Moondragon", "Psychokinetic Blast", 6, u, 1, Color.RANGED, "Avengers", "",
    ev => dangerSenseEv(ev, 4, cards => superPower("Avengers") && cards.count(isStrike) >= 2 && chooseMayEv(ev, "Shuffle the Villain Deck", () => gameState.villaindeck.shuffle()))),
// {DANGERSENSE 1}
// If this revealed a Scheme Twist, you get +3 Attack and you may shuffle the Villain Deck.
  ra: makeHeroCard("Moondragon", "Lunar Dragon Form", 8, u, 5, Color.STRENGTH, "Avengers", "", ev => dangerSenseEv(ev, 1, cards => { if (cards.has(isTwist)) {
    addAttackEvent(ev, 3);
    chooseMayEv(ev, "Shuffle the Villain Deck", () => gameState.villaindeck.shuffle());
  }})),
},
{
  name: "Nova",
  team: "Avengers",
// Draw a card.
// {POWER Tech} You get +1 Recruit or +1 Attack.
  c1: makeHeroCard("Nova", "Draw From the Worldmind", 2, 0, 0, Color.TECH, "Avengers", "FD", [
    ev => drawEv(ev),
    ev => superPower(Color.TECH) && chooseOneEv(ev, "Choose one", ["Recruit", () => addRecruitEvent(ev, 1)], ["Attack", () => addAttackEvent(ev, 1)])
  ]),
// Choose one: You get +2 Recruit, or you gain a Shard.
// {POWER Ranged} Instead, do both.
  c2: makeHeroCard("Nova", "Electromagnetic Wave", 3, 0, u, Color.RANGED, "Avengers", "FD", ev => {
    if (superPower(Color.RANGED)) {
      addRecruitEvent(ev, 2); gainShardEv(ev);
    } else {
      chooseOneEv(ev, "Choose One", ["+2 Recruit", () => addRecruitEvent(ev, 2)], ["Gain a Shard", () => gainShardEv(ev)]);
    }
  }),
// A Villain gains {COSMIC THREAT}[Tech] this turn. (It loses any previous Cosmic Threat abilities and penalties it had.)
// If there were no Villains in the city, draw two cards instead.
  uc: makeHeroCard("Nova", "Declare Galactic Threat", 6, u, u, Color.TECH, "Avengers", "", ev => {
    if(cityVillains().size === 0) {
      drawEv(ev, 2);
    } else {
      selectCardEv(ev, "Choose a Villain", villains(), c => giveCosmicThreat(c, Color.TECH));
    }
  }),
// Choose one: Draw three cards or a Mastermind gains {COSMIC THREAT}[Ranged] this turn. (It loses any previous Cosmic Threat abilities and penalties it had.)
  ra: makeHeroCard("Nova", "Mobilize the Nova Corps", 8, u, u, Color.RANGED, "Avengers", "", ev => {
    chooseOneEv(ev, "Choose one", ["Draw three cards", () => drawEv(ev, 3)], ["Mastermind gains Cosmic Threat", () => withMastermind(ev, c => giveCosmicThreat(c, Color.RANGED))]);
  }),
},
{
  name: "Yondu",
  team: "Guardians of the Galaxy",
// Gain a Shard.
// {POWER Ranged} <b>Burn any number of Shards</b>: Defeat a Villain with printed VP equal to the number of Shards you turned. (This can't affect a Villain with 0 VP or no printed VP.)
// GUN: 1
  c1: makeHeroCard("Yondu", "Whistling Arrow", 2, u, u, Color.RANGED, "Guardians of the Galaxy", "GD", [
    ev => gainShardEv(ev),
    ev => superPower(Color.RANGED) && setBurnShardEv(ev,
      () => villains().has(c => c.vp > 0 && c.vp <= playerState.shard.size),
      ev => selectCardEv(ev, "Choose a Villain", villains().limit(c => c.vp > 0 && c.vp <= playerState.shard.size), c => {
        repeat(c.vp, () => spendShardEv(ev));
        defeatEv(ev, c);
      }
    )),
  ]),
// {DANGERSENSE 2}
// {POWER Covert} If this revealed any Master Strikes, draw a card.
  c2: makeHeroCard("Yondu", "Interstellar Hunter", 3, u, 1, Color.COVERT, "Guardians of the Galaxy", "D", 
    ev => dangerSenseEv(ev, 2, cards => superPower(Color.COVERT) && cards.has(isStrike) && drawEv(ev))),
// {DANGERSENSE 3}
// {TEAMPOWER Guardians of the Galaxy} You may do the Fight effect of a Henchman Villain revealed this way. (Don't defeat it.)
  uc: makeHeroCard("Yondu", "Anticipate Their Movements", 5, u, 1, Color.INSTINCT, "Guardians of the Galaxy", "", 
    ev => dangerSenseEv(ev, 3, cards => superPower("Guardians of the Galaxy") && selectCardOptEv(ev, "Choose a Villain", cards.limit(isHenchmanVillain), c => {
      pushEffects(ev, c, 'fight', c.fight); // TODO abstract pushEffect use 
    }))),
// Choose one: Gain a Hero from the HQ for free, or gain a Shard for each empty city space.
// {TEAMPOWER Guardians of the Galaxy, Guardians of the Galaxy, Guardians of the Galaxy} Do both.
  ra: makeHeroCard("Yondu", "Space Pirate", 7, u, u, Color.TECH, "Guardians of the Galaxy", "", ev => {
    const heroForFree = () => selectCardEv(ev, "Choose a Hero to gain", hqHeroes(), c => gainEv(ev, c));
    const gainShards = () => gainShardEv(ev, gameState.city.count(isCityEmpty));
    if (superPower("Guardians of the Galaxy", "Guardians of the Galaxy", "Guardians of the Galaxy")) {
      heroForFree(); gainShards();
    } else {
      chooseOneEv(ev, "Choose one", ["Gain a Hero", heroForFree], ["Gain Shards", gainShards]);
    }
  }),
},
{
  name: "Phyla-Vell",
  team: "Guardians of the Galaxy",
// Gain a Shard.
// {POWER Instinct} Draw a card.
  c1: makeHeroCard("Phyla-Vell", "Channel Cosmic Power", 2, u, u, Color.INSTINCT, "Guardians of the Galaxy", "FD", [
    ev => gainShardEv(ev),
    ev => superPower(Color.INSTINCT) && drawEv(ev),
  ]),
// If you have at least 4 Shards, you get +2 Attack.
  c2: makeHeroCard("Phyla-Vell", "Quantum Sword", 4, u, 2, Color.INSTINCT, "Guardians of the Galaxy", "FD",
    ev => playerState.shard.size >= 4 && addAttackEvent(ev, 2)),
// If any player would gain a Wound, you may discard this card and gain 2 Shards instead.
  uc: makeHeroCard("Phyla-Vell", "Martyr", 3, u, 2, Color.STRENGTH, "Guardians of the Galaxy", "D", [], { trigger:
    youMayDiscardThisInsteadEv("GAIN", ev => isWound(ev.what), "gain two Shards", ev => gainShardEv(ev, 2, owner(ev.source)))
  }),
// You may KO a card from your hand or discard pile. If you do, gain 2 Shards.
// Then, if you have at least 8 Shards, you get +3 Attack.
  ra: makeHeroCard("Phyla-Vell", "Avatar of Oblivion", 8, u, 3, Color.INSTINCT, "Guardians of the Galaxy", "D", [
    ev => KOHandOrDiscardEv(ev, undefined, () => gainShardEv(ev, 2)),
    ev => playerState.shard.size >= 8 && addAttackEvent(ev, 3),
  ]),
},
{
  name: "Ronan the Accuser",
  team: "(Unaffiliated)",
// Gain a Shard.
// {BURN 2 SHARDS}: Draw two cards.
  c1: makeHeroCard("Ronan the Accuser", "Universal Weapon", 3, u, u, Color.TECH, u, "FD", [
    ev => gainShardEv(ev),
    ev => setBurnShardEv(ev, 2, ev => drawEv(ev, 2)),
  ]),
// Whenever you rescue a Bystander this turn, gain a Shard.
// {POWER Strength} Rescue a Bystander.
// GUN: 1
  c2: makeHeroCard("Ronan the Accuser", "Rally Kree Warriors", 4, 2, u, Color.STRENGTH, u, "GFD", [
    ev => addTurnTrigger('RESCUE', ev => isBystander(ev.what), ev => gainShardEv(ev)),
    ev => superPower(Color.STRENGTH) && rescueEv(ev),
  ]),
// {CONTEST OF CHAMPIONS}[Tech]. Each player that wins rescues a Bystander. If the Mastermind wins, it captures a Bystander.
  uc: makeHeroCard("Ronan the Accuser", "Accuse Enemies of the Empire", 6, u, 4, Color.STRENGTH, u, "", ev => {
    contestOfChampionsEv(ev, Color.TECH,
      p => rescueByEv(ev, p),
      () => {},
      () => withMastermind(ev, c => captureEv(ev, c)));
  }),
// {CONTEST OF CHAMPIONS}[Strength]. Each other player that loses must lose a Shard. Each player that wins gains 2 Shards. If the Mastermind wins, a Villain gains 2 Shards.
  ra: makeHeroCard("Ronan the Accuser", "Seek the Infinity Gems", 8, u, 4, Color.TECH, u, "D", ev => {
    contestOfChampionsEv(ev, Color.STRENGTH,
      p => gainShardEv(ev, 2, p),
      p => p !== playerState && spendShardEv(ev, p),
      () => selectCardEv(ev, "Choose a Villain", villains(), c => attachShardEv(ev, c, 2)));
  }),
},
{
  name: "Nebula",
  team: "Guardians of the Galaxy",
// Whenever you take any number of Shards from a Villain, Mastermind, or other player this turn, you may KO one of your cards or a card from your discard pile.
  c1: makeHeroCard("Nebula", "Ruthless Cyborg", 3, 2, u, Color.TECH, "Guardians of the Galaxy", "D", ev => {
    addTurnTrigger('MOVECARD', ev =>
      ev.to === playerState.shard && (ev.from.attachedTo instanceof Card && isEnemy(ev.from.attachedTo) ||
        gameState.players.has(p => p !== playerState && ev.from === p.shard)),
      ev => selectCardOptEv(ev, "Choose a card to KO", [...revealable(), ...playerState.discard.deck], c => KOEv(ev, c)));
  }),
// A Villain gains a Shard.
// {POWER Instinct Tech} Take a Shard from a Villain.
// GUN: 1
  c2: makeHeroCard("Nebula", "Galactic Rogue", 5, u, 3, Color.INSTINCT, "Guardians of the Galaxy", "GF", [ ev => {
    selectCardEv(ev, "Choose a Villain", villains(), c => attachShardEv(ev, c));
  }, ev => superPower(Color.INSTINCT, Color.TECH) && selectCardEv(ev, "Choose a Shard", villains().limit(c => c.attached('SHARD').size > 0), c => {
    c.attached('SHARD').withFirst(c => gainShardEv(ev, c));
  }) ]),
// {POWER Tech} Choose another player. Unless that player reveals a [Covert] Hero, take one of their Shards or "rescue" a Bystander from their Victory Pile.
  uc: makeHeroCard("Nebula", "Illusion Device", 4, u, 2, Color.TECH, "Guardians of the Galaxy", "D", ev => superPower(Color.TECH) && chooseOtherPlayerEv(ev, p => {
    revealOrEv(ev, Color.COVERT, () => chooseOneEv(ev, "Choose one",
      ["Take a Shard", () => p.shard.withFirst(c => gainShardEv(ev, c))],
      ["\"Rescue\" a Bystander", () => selectCardEv(ev, "Choose a Bystander", p.victory.limit(isBystander), c => rescueEv(ev, c))],
    ), p);
  })),
// Whenever you take any number of Shards from a Villain, Mastermind, or other player this turn, you get +3 Recruit.
  ra: makeHeroCard("Nebula", "Daring Raid", 7, 0, 5, Color.INSTINCT, "Guardians of the Galaxy", "", ev => {
    addTurnTrigger('MOVECARD', ev =>
      ev.to === playerState.shard && (ev.from.attachedTo instanceof Card && isEnemy(ev.from.attachedTo) ||
        gameState.players.has(p => p !== playerState && ev.from === p.shard)),
      ev => addRecruitEvent(ev, 3));
  }),
},
]);
addHeroTemplates("Realm of Kings", [
{
  name: "Black Bolt",
  team: "Inhumans",
// {WHEN RECRUITED} You may KO one of your cards with no rules text.
// {POWER Ranged} Gain the {THRONES FAVOR}. If you already have it, you may spend it to get +2 Recruit.
  c1: makeHeroCard("Black Bolt", "Break the Silence", 3, 2, u, Color.RANGED, "Inhumans", "D",
    ev => superPower(Color.RANGED) && thronesFavorGainOrMaySpendEv(ev, () => addRecruitEvent(ev, 2)),
    { whenRecruited: ev => selectCardOptEv(ev, "Choose a card to KO", revealable().limit(hasFlag("N")), c => KOEv(ev, c)) }),
  c2: makeHeroCard("Black Bolt", "Worldess Murmur", 5, 1, 3, Color.RANGED, "Inhumans", "N"),
// {TEAMPOWER Inhumans} Gain the {THRONES FAVOR}. If you already have it, you may spend it to reveal the top two cards of your deck. Put each of those cards with no rules text into your hand and put the rest back in any order.
  uc: makeHeroCard("Black Bolt", "Declaration of War", 4, u, 2, Color.TECH, "Inhumans", "D", ev => superPower("Inhumans") && thronesFavorGainOrMaySpendEv(ev, () => {
    revealPlayerDeckEv(ev, 2, cards => cards.limit(hasFlag("N")).each(c => moveCardEv(ev, c, playerState.hand)));
  })),
// Gain the {THRONES FAVOR}. If you already have it, you may spend it to choose "Speak" or "Don't Speak" then reveal the top 3 cards of your deck:
//     <b>Speak</b>: Put all of them with rules text into your hand.
//     <b>Don't Speak</b>: You may KO any number of them with no rules text.
// Put the rest back in any order.
  ra: makeHeroCard("Black Bolt", "The King's Speech", 8, u, 5, Color.RANGED, "Inhumans", "", ev => thronesFavorGainOrMaySpendEv(ev, () => {
    chooseOneEv(ev, "Choose", ["Speak", () => {
      revealPlayerDeckEv(ev, 3, cards => cards.limit(c => !hasFlag("N")(c)).each(c => moveCardEv(ev, c, playerState.hand)));
    }], ["Don't Speak", () => {
      revealPlayerDeckEv(ev, 3, cards => selectObjectsAnyEv(ev, "Choose cards to KO", cards.limit(hasFlag("N")), c => KOEv(ev, c)));
    }]);
  })),
},
{
  name: "Medusa",
  team: "Inhumans",
// {WHEN RECRUITED} Gain the {THRONES FAVOR}.
// Gain the {THRONES FAVOR}. If you already have it, you may spend it to get +2 Attack.
  c1: makeHeroCard("Medusa", "Queen of the Inhumans", 2, u, 1, Color.STRENGTH, "Inhumans", "D", ev => thronesFavorGainOrMaySpendEv(ev, ev => addAttackEvent(ev, 2)), {
    whenRecruited: thronesFavorGainEv
  }),
// {WHEN RECRUITED} Draw a card and gain the {THRONES FAVOR}.
// {POWER Instinct} Gain the {THRONES FAVOR}. If you already have it, you may spend it to draw a card.
  c2: makeHeroCard("Medusa", "Splitting Hairs", 3, u, 2, Color.INSTINCT, "Inhumans", "D", ev => superPower(Color.INSTINCT) && thronesFavorGainOrMaySpendEv(ev, ev => drawEv(ev)), {
    whenRecruited: ev => { drawEv(ev); thronesFavorGainEv(ev); }
  }),
// {WHEN RECRUITED} Gain the {THRONES FAVOR}.
// {TEAMPOWER Inhumans} Gain the {THRONES FAVOR}. If you already have it, you may spend it to KO one of your cards.
  uc: makeHeroCard("Medusa", "Royal Command", 5, u, 3, Color.INSTINCT, "Inhumans", "", ev => superPower("Inhumans") && thronesFavorGainOrMaySpendEv(ev, ev => selectCardAndKOEv(ev, revealable())), {
    whenRecruited: thronesFavorGainEv
  }),
// {WHEN RECRUITED} Draw two cards and gain the {THRONES FAVOR}.
// Gain the {THRONES FAVOR}. If you already have it, you may spend it to draw two cards.
  ra: makeHeroCard("Medusa", "Headstrong", 7, u, 4, Color.INSTINCT, "Inhumans", "", ev => thronesFavorGainOrMaySpendEv(ev, ev => drawEv(ev, 2)), {
    whenRecruited: ev => { drawEv(ev, 2); thronesFavorGainEv(ev); }
  }),
},
{
  name: "Crystal",
  team: "Inhumans",
// {POWER Strength Instinct Covert Ranged} You get +3 Attack
  c1: makeHeroCard("Crystal", "Earth, Air, Fire, and Water", 3, u, 2, Color.RANGED, "Inhumans", "FD", ev => superPower(Color.STRENGTH, Color.INSTINCT, Color.COVERT, Color.RANGED) && addAttackEvent(ev, 3)),
// Choose [Strength], [Instinct], [Covert], or [Ranged]. This card is only that Hero Class this turn.
// Draw a card.
  c2: makeHeroCard("Crystal", "Master the Four Elements", 4, 1, u, Color.INSTINCT, "Inhumans", "F", [
    ev => chooseClassEv(ev, color => {
      addTurnSet('color', c => c === ev.source, () => color); // TODO this may be too late in case of triggers on card played.
    }, color => [Color.STRENGTH, Color.INSTINCT, Color.COVERT, Color.RANGED].includes(color)),
    ev => drawEv(ev),
  ]),
// {WHEN RECRUITED} You may KO one of your cards that isn't [Strength], [Instinct], [Covert], or [Ranged].
// Gain the {THRONES FAVOR}. If you already have it, you may spend it make this card [Strength], [Instinct], [Covert], and [Ranged] this turn.
  uc: makeHeroCard("Crystal", "Elemental Princess", 6, u, 3, Color.COVERT, "Inhumans", "", ev => {
    thronesFavorGainOrMaySpendEv(ev, () => {
      addTurnSet('color', c => c === ev.source, () => Color.STRENGTH | Color.INSTINCT | Color.COVERT | Color.RANGED); // TODO this may be too late in case of triggers on card played.
    });
  }, {
    whenRecruited: ev => selectCardOptEv(ev, "Choose a card to KO", revealable().limit(c => !isColor(Color.STRENGTH | Color.INSTINCT | Color.COVERT | Color.RANGED)(c)), c => KOEv(ev, c)),
  }),
// {WHEN RECRUITED} You may gain a [Strength], [Instinct], [Covert], or [Ranged] Hero from the HQ that costs 4 or less. (after refilling the HQ)
// Reveal the top four cards of your deck. Put a [Strength] Hero, a [Instinct] Hero, a [Covert] Hero, and a [Ranged] Hero from among them into your hand. Put the rest back in any order.
  ra: makeHeroCard("Crystal", "Weave Four Into One", 8, u, 4, Color.STRENGTH, "Inhumans", "", ev => {
    revealPlayerDeckEv(ev, 4, cards => [Color.STRENGTH, Color.INSTINCT, Color.COVERT, Color.RANGED].each(color => {
      selectCardEv(ev, "Choose a Hero to put in hand", cards.limit(color), c => moveCardEv(ev, c, playerState.hand));
    }));
  }, {
    whenRecruited: ev => selectCardOptEv(ev, "Choose a Hero to gain", hqHeroes().limit(Color.STRENGTH | Color.INSTINCT | Color.COVERT | Color.RANGED), c => gainEv(ev, c)),
  }),
},
{
  name: "Karnak",
  team: "Inhumans",
// {WHEN RECRUITED} You get +1 Attack.
// {POWER Covert} When you draw a new hand of cards at the end of this turn, draw an extra card.
  c1: makeHeroCard("Karnak", "Brilliant Strategist", 2, u, 1, Color.COVERT, "Inhumans", "D", ev => superPower(Color.COVERT) && addEndDrawMod(1), { whenRecruited: ev => addAttackEvent(ev, 1) }),
// {WHEN RECRUITED} You get +2 Attack.
// Choose a Villain Group. You get +1 Recruit for each Villain in your Victory Pile from that Group.
  c2: makeHeroCard("Karnak", "Find Fatal Flaw", 4, 0, u, Color.INSTINCT, "Inhumans", "D", ev => {
    const groups = playerState.victory.limit(c => c.printedVillainGroup !== undefined).unique(c => c.printedVillainGroup).map(g => ({l:g, v:g}));
    chooseOptionEv(ev, "Choose a Villain Group", groups, g => addRecruitEvent(ev, playerState.victory.count(isGroup(g))))
  }, { whenRecruited: ev => addAttackEvent(ev, 2) }),
// {WHEN RECRUITED} You get +3 Attack.
// Choose a Villain Group. You get +1 Attack for each Villain in your Victory Pile from that Group.
  uc: makeHeroCard("Karnak", "Shatter the Weak Point", 5, u, 0, Color.STRENGTH, "Inhumans", "", ev => {
    const groups = playerState.victory.limit(c => c.printedVillainGroup !== undefined).unique(c => c.printedVillainGroup).map(g => ({l:g, v:g}));
    chooseOptionEv(ev, "Choose a Villain Group", groups, g => addAttackEvent(ev, playerState.victory.count(isGroup(g))))
  }, { whenRecruited: ev => addAttackEvent(ev, 3) }),
// {WHEN RECRUITED} You get +4 Attack.
// Whenever you play a card this turn, including this one, you may first use that card's "When Recruited" ability.
  ra: makeHeroCard("Karnak", "Seek the Center", 7, u, u, Color.COVERT, "Inhumans", "", ev => {
    chooseMayEv(ev, "Use this card's When Recruited", () => ev.source.whenRecruited(ev));
    addTurnTrigger('PLAY', ev => ev.what.whenRecruited !== undefined, { before: ev => {
      chooseMayEv(ev, "Use this card's When Recruited", () => ev.parent.what.whenRecruited(ev));
    }})
  }, { whenRecruited: ev => addAttackEvent(ev, 4) }),
},
{
  name: "Gorgon",
  team: "Inhumans",
// {WHEN RECRUITED} You may {TELEPORT} a 0-cost Hero from your hand.
// {POWER Covert} You may {TELEPORT} another card from your hand.
  c1: makeHeroCard("Gorgon", "Lockjaw, Inhuman's Best Friend", 3, 2, u, Color.COVERT, "Inhumans", "D", ev => {
    superPower(Color.COVERT) && selectCardOptEv(ev, "Choose a card to Teleport", playerState.hand.limit(c => c !== ev.source), c => teleportEv(ev, c));
  }, {
    whenRecruited: ev => selectCardOptEv(ev, "Choose a Hero to Teleport", playerState.hand.limit(isHero).limit(c => c.cost === 0), c => teleportEv(ev, c)),
  }),
// {WHEN RECRUITED} {SEWERS ABOMINATION} (after refilling HQ)
// {POWER Strength} {STREETS ABOMINATION}
  c2: makeHeroCard("Gorgon", "Stomping Shockwave", 5, u, 2, Color.STRENGTH, "Inhumans", "D", ev => superPower(Color.STRENGTH) && heroAbominationEv(ev, 'STREETS'), {
    whenRecruited: ev => heroAbominationEv(ev, 'SEWERS'),
  }),
// {WHEN RECRUITED} You may KO one of your cards with no Attack icon.
// {HIGHEST ABOMINATION}
  uc: makeHeroCard("Gorgon", "Trample Underhoof", 6, u, 1, Color.STRENGTH, "Inhumans", "", ev => heroHighestAbominationEv(ev), {
    whenRecruited: ev => selectCardOptEv(ev, "Choose a card to KO", revealable().limit(c => !hasAttackIcon(c)), c => KOEv(ev, c)),
  }),
// {WHEN RECRUITED} {BRIDGE ABOMINATION} (after refilling HQ)
// {TELEPORT}
// {TEAMPOWER Inhumans} {ROOFTOPS ABOMINATION}
// GUN: 1
  ra: makeHeroCard("Gorgon", "Lead the Inhuman Elite", 8, u, 4, Color.STRENGTH, "Inhumans", "G", ev => superPower("Inhumans") && heroAbominationEv(ev, 'ROOFTOPS'), {
    whenRecruited: ev => heroAbominationEv(ev, 'BRIDGE'),
    teleport: true,
  }),
},
]);
addHeroTemplates("Annihilation", [
{
  name: "Fantastic Four United",
  team: "Fantastic Four",
// {TEAMPOWER Fantastic Four} You get +1 Recruit.
// {FOCUS 3} You get +2 Attack.
  c1: makeHeroCard("Fantastic Four United", "Thing", 4, 2, 0, Color.STRENGTH, "Fantastic Four", "FD", [ ev => superPower("Fantastic Four") && addRecruitEvent(ev, 1), ev => setFocusEv(ev, 3, ev => addAttackEvent(ev, 2)) ]),
// {FOCUS 2} KO up to two Wounds from your hand and/or discard pile.
// {FOCUS 6} You get +6 Attack and gain a Wound.
  c2: makeHeroCard("Fantastic Four United", "Human Torch", 4, 2, 0, Color.RANGED, "Fantastic Four", "D", [
    ev => setFocusEv(ev, 2, ev => selectObjectsUpToEv(ev, "Select cards to KO", 2, handOrDiscard().filter(isWound), c => KOEv(ev, c))),
    ev => setFocusEv(ev, 6, ev => { addAttackEvent(ev, 6); gainWoundEv(ev); })
  ]),
// If you played any other cards that cost 4 this turn, you get +2 Recruit.
// {FOCUS 4} Rescue a Bystander, then you may KO a card from your hand or discard pile.
  uc: makeHeroCard("Fantastic Four United", "Invisible Woman", 4, 2, u, Color.COVERT, "Fantastic Four", "D", [
    ev => pastEvWhat('PLAY').has(c => c.cost === 4 && c !== ev.source) && addRecruitEvent(ev, 2),
    ev => setFocusEv(ev, 4, ev => { rescueEv(ev); KOHandOrDiscardEv(ev); })
  ]),
// Draw two cards.
// {FOCUS 5} You get +7 Attack usable only against the Mastermind.
// GUN: 1
  ra: makeHeroCard("Fantastic Four United", "Mr. Fantastic", 7, 2, 0, Color.TECH, "Fantastic Four", "GD", [
    ev => drawEv(ev, 2),
    ev => setFocusEv(ev, 5, ev => addAttackSpecialEv(ev, isMastermind, 7))
  ]),
},
{
  name: "Psi-Lord",
  team: "Fantastic Four",
// {FOCUS 2} Reveal the top card of the Villain Deck. If it's a Master Strike, you get +3 Attack, KO it, and replace it with the top card from the Bystander Stack.
// {POWER Instinct} {OUTOFTIME}
  c1: makeHeroCard("Psi-Lord", "Avert Future Tragedy", 3, 2, 0, Color.INSTINCT, "Fantastic Four", "D", [
    ev => setFocusEv(ev, 2, ev => revealVillainDeckEv(ev, 1, r => r.limit(isStrike).each(c => {
      addAttackEvent(ev, 3);
      KOEv(ev, c);
      gameState.bystanders.withTop(c => moveCardEv(ev, c, gameState.villaindeck));
    }))),
    ev => superPower(Color.INSTINCT) && outOfTimeEv(ev)
  ]),
// {FOCUS 1} Reveal the top card of the Villain Deck. If it's a Bystander, you get +2 Attack, rescue it, and shuffle the top card from the Bystander Stack into the Villain Deck.
// {POWER Covert} {OUTOFTIME}
  c2: makeHeroCard("Psi-Lord", "Interdimensional Rescue", 4, u, 2, Color.COVERT, "Fantastic Four", "D", [
    ev => setFocusEv(ev, 1, ev => revealVillainDeckEv(ev, 1, r => r.limit(isBystander).each(c => {
      addAttackEvent(ev, 2);
      rescueEv(ev, c);
      gameState.bystanders.withTop(c => shuffleIntoEv(ev, c, gameState.villaindeck));
    }))),
    ev => superPower(Color.COVERT) && outOfTimeEv(ev)
  ]),
// {FOCUS 1} Reveal the top card of the Villain Deck. If it's a Villain, you get +1 Attack and you may fight it this turn.
// {POWER Instinct Covert} {OUTOFTIME}
  uc: makeHeroCard("Psi-Lord", "Slip the Timestream", 6, 3, 0, Color.COVERT, "Fantastic Four", "", [
    ev => setFocusEv(ev, 1, ev => revealVillainDeckEv(ev, 1, r => r.limit(isVillain).each(c => {
      addAttackEvent(ev, 1);
      addTurnSet('isFightable', card => c === gameState.villaindeck.top && card === c, () => true);
    }))),
    ev => superPower(Color.INSTINCT, Color.COVERT) && outOfTimeEv(ev)
  ]),
// {FOCUS 3} Reveal the top card of the Villain Deck. If it's a Scheme Twist, you get +4 Attack and shuffle the Villain Deck.
// {TEAMPOWER Fantastic Four, Fantastic Four} {OUTOFTIME}
  ra: makeHeroCard("Psi-Lord", "Reshape Reality", 7, 3, 3, Color.INSTINCT, "Fantastic Four", "", [
    ev => setFocusEv(ev, 3, ev => {
      let wasTwist = false;
      revealVillainDeckEv(ev, 1, r => r.limit(isTwist).each(c => {
        addAttackEvent(ev, 4);
        wasTwist = true;
      }));
      cont(ev, () => wasTwist && gameState.villaindeck.shuffle());
    }),
    ev => superPower("Fantastic Four", "Fantastic Four") && outOfTimeEv(ev)
  ]),
},
{
  name: "Brainstorm",
  team: "Fantastic Four",
// Draw a card. Then put a card from your hand on top of your deck.
// {POWER Tech} {OUTOFTIME}
  c1: makeHeroCard("Brainstorm", "Time Loop Experiments", 2, 1, u, Color.TECH, "Fantastic Four", "FD", [
    ev => drawEv(ev),
    ev => pickTopDeckEv(ev),
    ev => superPower(Color.TECH) && outOfTimeEv(ev)
  ]),
// Reveal the top card of your deck. If it costs 2 or more, draw it. Otherwise, discard it or put it back.
// {POWER Ranged} {OUTOFTIME}
// GUN: 1
  c2: makeHeroCard("Brainstorm", "Borrow from the Future", 3, u, 1, Color.RANGED, "Fantastic Four", "GD", [
    ev => revealPlayerDeckEv(ev, 1, cards => cards.each(c => c.cost >= 2 ? drawCardEv(ev, c) : selectCardOptEv(ev, "Choose a card to discard", [c], c => discardEv(ev, c)))),
    ev => superPower(Color.RANGED) && outOfTimeEv(ev)
  ]),
// {TEAMPOWER Fantastic Four} You may look at the top two cards of your deck. If you do, KO one of them and put the other back.
  uc: makeHeroCard("Brainstorm", "Reprogram Doombot Legions", 6, u, 3, Color.TECH, "Fantastic Four", "",
    ev => superPower("Fantastic Four") && chooseMayEv(ev, "Look at the top two cards of your deck", () => {
      revealPlayerDeckEv(ev, 2, cards => selectCardAndKOEv(ev, cards));
    }),
  ),
// Use one of Dr. Doom's Mastermind Tactics. You can't use any of them more than once per game. If you have already used them all, get +4 Attack instead.
// (Take another turn; or draw three extra cards at end of turn; or you may recruit a [Tech] or [Ranged] Hero for free; or all other players draw a card or discard a card.)
  ra: makeHeroCard("Brainstorm", "Protégé of Dr. Doom", 8, u, 4, Color.TECH, "Fantastic Four", "",
    ev => {
      const options: [string, () => void][] = [];
      countPerGame('tactic1', ev.source) || options.push(["Take another turn", () => {
        incPerGame('tactic1', ev.source);
        gameState.extraTurn = true; // TODO multiplayer
      }]);
      countPerGame('tactic2', ev.source) || options.push(["Draw three extra cards at end of turn", () => {
        incPerGame('tactic2', ev.source);
        addEndDrawMod(3);
      }]);
      countPerGame('tactic3', ev.source) || options.push(["Recruit a [Tech] or [Ranged] Hero for free", () => {
        incPerGame('tactic3', ev.source);
        selectCardEv(ev, "Recruit a Hero for free", hqHeroes().limit(Color.TECH | Color.RANGED), sel => recruitForFreeEv(ev, sel));
      }]);
      countPerGame('tactic4', ev.source) || options.push(["All other players draw a card or discard a card", () => {
        incPerGame('tactic4', ev.source);
        chooseOneEv(ev, "Each other player",
          ["draws a card", () => eachOtherPlayerVM(p => drawEv(ev, 1, p))],
          ["discards a card", () => eachOtherPlayerVM(p => pickDiscardEv(ev, 1, p))]
        );
      }]);
      options.length ? chooseOneEv(ev, "Choose a Dr. Doom Tactic", ...options) : addAttackEvent(ev, 4);
    },
  ),
},
{
  name: "Heralds of Galactus",
  team: "(Unaffiliated)",
// {FOCUS 2} Draw a card, then you may move a Villain to an adjacent city space. If another Villain is already there, swap them.
  c1: makeHeroCard("Heralds of Galactus", "Silver Surfer", 4, 2, u, Color.RANGED, u, "D", ev =>
    setFocusEv(ev, 2, ev => {
      drawEv(ev);
      cont(ev, () => selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
        selectCardEv(ev, "Choose a new city space", cityAdjacent(v.location), dest => swapCardsEv(ev, v.location, dest));
      }));
    })
  ),
// This turn, your Heroes' Conqueror abilities also give Attack if those city spaces have been destroyed.
// {POWER Ranged} {BRIDGE CONQUEROR 2}
  c2: makeHeroCard("Heralds of Galactus", "Firelord", 3, u, 2, Color.RANGED, u, "FD", [
    ev => turnState.destroyedConqueror = true,
    ev => superPower(Color.RANGED) && heroConquerorEv(ev, 'BRIDGE', 2)
  ]),
// {FOCUS 4} {ROOFTOPS CONQUEROR 4}
// {FOCUS 11} Search the Hero Deck, HQ, or your deck or discard pile for "Galactus Hungers" and put it on top of your deck. Shuffle any deck you searched.
  uc: makeHeroCard("Heralds of Galactus", "Stardust", 6, 4, 0, Color.COVERT, u, "", [
    ev => setFocusEv(ev, 4, ev => heroConquerorEv(ev, 'ROOFTOPS', 4)),
    ev => setFocusEv(ev, 11, ev => {
      const isHungers = (c: Card) => c.cardName === "Galactus Hungers";
      const topDeck = (c: Card) => moveCardEv(ev, c, playerState.deck);
      playerState.discard.deck.filter(isHungers).each(topDeck);
      hqHeroes().filter(isHungers).each(topDeck);
      if (gameState.herodeck.has(isHungers)) {
        gameState.herodeck.deck.filter(isHungers).each(topDeck);
        gameState.herodeck.shuffle();
      }
      if (playerState.deck.has(isHungers)) {
        playerState.deck.deck.filter(isHungers).each(topDeck);
        playerState.deck.shuffle();
      }
    })
  ]),
// If you have played another Herald of Galactus this turn, destroy the leftmost city space, defeat any Villain there, and then you get +2 Attack for each destroyed city space. If this destroys the last city space, Galactus consumes the Earth. You Win, Evil Wins, and all other players lose.
  ra: makeHeroCard("Heralds of Galactus", "Galactus Hungers", 10, u, 8, Color.RANGED, u, "D",
    ev => turnState.cardsPlayed.has(c => c.heroName === "Heralds of Galactus") && withLeftmostCitySpace(ev, space => {
      destroyCity(space);
      space.deck.limit(isVillain).each(c => defeatEv(ev, c));
      addAttackEvent(ev, 2 * gameState.destroyedCitySpaces.length);
      if (!gameState.city.size) gameOverEv(ev, "LOSS", playerState);
    })
  ),
},
{
  name: "Super-Skrull",
  team: "(Unaffiliated)",
// {FOCUSA 2} When you draw a new hand of cards at the end of this turn, draw an extra card.
  c1: makeHeroCard("Super-Skrull", "Stretching Credibility", 3, u, 2, Color.INSTINCT, u, "FD", ev => setFocusWithAttackEv(ev, 2, ev => addEndDrawMod(1))),
// {POWER Strength} {SEWERS CONQUEROR 1}.
// {FOCUSA 3} You get +2 Recruit.
  c2: makeHeroCard("Super-Skrull", "Rock Solid", 4, 0, 2, Color.STRENGTH, u, "FD", [ ev => superPower(Color.STRENGTH) && heroConquerorEv(ev, 'SEWERS', 1), ev => setFocusWithAttackEv(ev, 3, ev => addRecruitEvent(ev, 2)) ]),
// {BANK CONQUEROR 1}
// {FOCUSA 3} You may KO a card from your hand or discard pile.
  uc: makeHeroCard("Super-Skrull", "Transparent Motives", 5, u, 2, Color.COVERT, u, "FD", [ ev => heroConquerorEv(ev, 'BANK', 1), ev => setFocusWithAttackEv(ev, 3, ev => KOHandOrDiscardEv(ev)) ]),
// {BRIDGE CONQUEROR 1}
// {STREETS CONQUEROR 1}
// You may gain a Wound. If you do, you get {ROOFTOPS CONQUEROR 4}.
  ra: makeHeroCard("Super-Skrull", "Put to the Torch", 7, u, 4, Color.RANGED, u, "", [ ev => heroConquerorEv(ev, 'BRIDGE', 1), ev => heroConquerorEv(ev, 'STREETS', 1),
    ev => chooseMayEv(ev, "Gain a Wound", () => {
      gainWoundEv(ev);
      heroConquerorEv(ev, 'ROOFTOPS', 4);
    })
  ]),
},
]);
addHeroTemplates("Messiah Complex", [
{
  name: "Multiple Man",
  team: "X-Factor",
// {TACTICAL FORMATION 444}: Draw a card.
// {POWER Instinct} {CLONE}
  c1: makeHeroCard("Multiple Man", "Me, Myself, and I", 4, 2, u, Color.INSTINCT, "X-Factor", "FD", [ ev => tacticalFormation('444') && drawEv(ev), ev => superPower(Color.INSTINCT) && cloneHeroEv(ev) ]),
// {INVESTIGATE} for a card that has the same card name as any of your cards. (You don't need to choose a specific card name before you Investigate.)
// {POWER Tech} {CLONE}
  c2: makeHeroCard("Multiple Man", "Finding Myself", 4, u, 1, Color.TECH, "X-Factor", "", [
    ev => investigateEv(ev, c => revealable().has(c2 => c2.cardName === c.cardName)),
    ev => superPower(Color.TECH) && cloneHeroEv(ev) ]),
// You get +1 Attack for each card name that you played at least twice this turn.
// {POWER Tech} {CLONE}
  c3: makeHeroCard("Multiple Man", "Perfect Match", 4, u, 1, Color.TECH, "X-Factor", "", [
    ev => addAttackEvent(ev, turnState.cardsPlayed.unique(c => c.cardName).count(cardName => [...turnState.cardsPlayed, ev.source].count(c => c.cardName === cardName) >= 2)),
    ev => superPower(Color.TECH) && cloneHeroEv(ev) ]),
// {TACTICAL FORMATION 44}: You may KO a card from your hand or discard pile.
// {TEAMPOWER X-Factor} {CLONE}
  ra: makeHeroCard("Multiple Man", "Reabsorb Duplicates", 4, u, 2, Color.INSTINCT, "X-Factor", "D", [ ev => tacticalFormation('44') && KOHandOrDiscardEv(ev, undefined), ev => superPower("X-Factor") && cloneHeroEv(ev) ]),
},
{
  name: "Shatterstar",
  team: "X-Force",
// {WHEN RECRUITED} [Instinct]: {CLONE}
// {POWER Instinct} You get another +2 Recruit usable only to recruit Heroes that cost 5 or more.
  c1: makeHeroCard("Shatterstar", "Strive for Greatness", 3, 2, u, Color.INSTINCT, "X-Force", "D",
    ev => superPower(Color.INSTINCT) && addRecruitSpecialEv(ev, c => isHero(c) && c.cost >= 5, 2),
    { whenRecruited: ev => superPower(Color.INSTINCT) && cloneHeroEv(ev) }),
// {WHEN RECRUITED} [Instinct]: {CLONE}
// {POWER Instinct} Draw a card.
  c2: makeHeroCard("Shatterstar", "Gladiator's Blades", 5, u, 2, Color.INSTINCT, "X-Force", "FD", ev => superPower(Color.INSTINCT) && drawEv(ev),
    { whenRecruited: ev => superPower(Color.INSTINCT) && cloneHeroEv(ev) }),
// {WHEN RECRUITED} [Ranged]: {CLONE}
// {TACTICAL FORMATION 55}: You get +1 Attack.
  c3: makeHeroCard("Shatterstar", "Bioelectric Surge", 5, u, 2, Color.RANGED, "X-Force", "D", ev => tacticalFormation('55') && addAttackEvent(ev, 1),
    { whenRecruited: ev => superPower(Color.RANGED) && cloneHeroEv(ev) }),
// {WHEN RECRUITED} X-Force: {CLONE}
// [Ranged] , [Instinct]: {SHATTER} the Mastermind.
  ra: makeHeroCard("Shatterstar", "Gene-Spliced Creation", 5, u, 2, Color.INSTINCT, "X-Force", "FD",
    ev => superPower(Color.RANGED, Color.INSTINCT) && shatterSelectEv(ev, gameState.mastermind.deck),
    { whenRecruited: ev => superPower("X-Force") && cloneHeroEv(ev) }),
},
{
  name: "Stepford Cuckoos",
  team: "X-Men",
// {WHEN RECRUITED} {CLONE}
// {POWER Tech} {INVESTIGATE} the Sidekick Stack for a card and put it in your discard pile.
  c1: makeHeroCard("Stepford Cuckoos", "Find Mutants with Cerebro", 2, u, 1, Color.TECH, "X-Men", "D",
    ev => superPower(Color.TECH) && investigateEv(ev, () => true, gameState.sidekick, c => moveCardEv(ev, c, playerState.discard)),
    { whenRecruited: ev => cloneHeroEv(ev) }),
// {WHEN RECRUITED} {CLONE}
// {TACTICAL FORMATION 22}: You get +1 Attack.
// <b>Tactical Formation 33: Investigate</b> for a card with an Attack icon.
  c2: makeHeroCard("Stepford Cuckoos", "Shared Thoughts", 2, u, 1, Color.COVERT, "X-Men", "D", [
    ev => tacticalFormation('22') && addAttackEvent(ev, 1),
    ev => tacticalFormation('33') && investigateEv(ev, hasAttackIcon)],
    { whenRecruited: ev => cloneHeroEv(ev) }),
// {WHEN RECRUITED} {CLONE}
// {TACTICAL FORMATION 22}: You get +1 Attack.
// {TACTICAL FORMATION 33}: Reveal the top card of the Villain Deck. If it's a Master Strike you get +1 Attack and you may shuffle the Villain Deck.
  c3: makeHeroCard("Stepford Cuckoos", "Telepathic Warning", 3, u, 2, Color.RANGED, "X-Men", "D", [
    ev => tacticalFormation('22') && addAttackEvent(ev, 1),
    ev => {
      let hasStrike = false;
      tacticalFormation('33') && revealVillainDeckEv(ev, 1, cards => (hasStrike = cards.has(isStrike)) && addAttackEvent(ev, 1));
      cont(ev, () => hasStrike && chooseMayEv(ev, "Shuffle the Villain Deck", () => gameState.villaindeck.shuffle()));
    } ], { whenRecruited: ev => cloneHeroEv(ev) }),
// {WHEN RECRUITED} {CLONE}
// {TACTICAL FORMATION 223}: Reveal the top card of the Villain Deck. If it's a Villain, you get +2 Attack and you may fight it this turn. If you fight it, put a card from the Bystander stack on top of the Villain Deck.
  ra: makeHeroCard("Stepford Cuckoos", "Mind Wipe", 3, u, 2, Color.RANGED, "X-Men", "D",
    ev => {
      if (tacticalFormation('223')) revealVillainDeckEv(ev, 1, r => {
        r.limit(isVillain).each(c => {
          addTurnSet('isFightable', card => c === gameState.villaindeck.top && card === c, () => true);
          addTurnTrigger('FIGHT', ev => ev.what === c, ev => gameState.bystanders.withTop(b => moveCardEv(ev, b, gameState.villaindeck)) );
          // TODO reveal until end of turn
          addAttackEvent(ev, 2);
        });
      });
    },
    { whenRecruited: ev => cloneHeroEv(ev) }),
},
{
  name: "M",
  team: "X-Factor",
// {WHEN RECRUITED} [Covert]: {CLONE}
// {INVESTIGATE} for a card that costs 3.
  c1: makeHeroCard("M", "Uncover Family Secrets", 3, 2, u, Color.COVERT, "X-Factor", "D",
    ev => investigateEv(ev, c => c.cost === 3), { whenRecruited: ev => superPower(Color.COVERT) && cloneHeroEv(ev) }),
// {WHEN RECRUITED} [Strength]: {CLONE}
// If you have a Wound in your hand or discard pile, KO it and you get +1 Attack. Otherwise, gain a Wound.
  c2: makeHeroCard("M", "Penance Form", 3, u, 2, Color.STRENGTH, "X-Factor", "D",
    ev => handOrDiscard().has(isWound) ? (KOHandOrDiscardEv(ev, isWound), addAttackEvent(ev, 1)) : gainWoundEv(ev),
    { whenRecruited: ev => superPower(Color.STRENGTH) && cloneHeroEv(ev) }),
// {WHEN RECRUITED} [Strength]: {CLONE}
// Draw a card.
// {TACTICAL FORMATION 333}: You get +2 Attack.
  c3: makeHeroCard("M", "Three Sisters Combined", 3, u, 0, Color.STRENGTH, "X-Factor", "D", [
    ev => drawEv(ev), ev => tacticalFormation('333') && addAttackEvent(ev, 2)
  ], { whenRecruited: ev => superPower(Color.STRENGTH) && cloneHeroEv(ev) }),
// {WHEN RECRUITED} X-Factor: {CLONE}
// {TACTICAL FORMATION 3333}: You get +3 Attack.
  ra: makeHeroCard("M", "Interweaving Powers", 3, u, 2, Color.COVERT, "X-Factor", "D",
    ev => tacticalFormation('3333') && addAttackEvent(ev, 3), { whenRecruited: ev => superPower("X-Factor") && cloneHeroEv(ev) }),
},
{
  name: "Strong Guy",
  team: "X-Factor",
// {INVESTIGATE} for a card that's [Strength] and/or X-Factor.
  c1: makeHeroCard("Strong Guy", "X-Factor Investigation", 4, 2, u, Color.STRENGTH, "X-Factor", "FD", ev => investigateEv(ev, c => isTeam("X-Factor")(c) || isColor(Color.STRENGTH)(c))),
// If any player would gain a Wound, you may discard this card instead. If you do, draw two cards.
  c2: makeHeroCard("Strong Guy", "Absorb Kinetic Energy", 5, u, 3, Color.STRENGTH, "X-Factor", "", [], { trigger:
    youMayDiscardThisInsteadEv("GAIN", ev => isWound(ev.what), "draw two cards", ev => drawEv(ev, 2, owner(ev.source)))
  }),
// {TACTICAL FORMATION 445}: You get +3 Attack.
  uc: makeHeroCard("Strong Guy", "Go Big", 4, u, 2, Color.STRENGTH, "X-Factor", "FD", ev => tacticalFormation('445') && addAttackEvent(ev, 3)),
// {INVESTIGATE} for one of these options, then a different option, then a third different option:
// <ul>
//     <li> A [Strength] card.</li>
//     <li> An X-Factor card.</li>
//     <li> A card that costs 4.</li>
//     <li> A card that costs 5.</li>
// </ul>
  ra: makeHeroCard("Strong Guy", "Treasure Hunt", 8, u, 3, Color.STRENGTH, "X-Factor", "", ev => {
    const options: [Filter<Card>, string][] = [
      [Color.STRENGTH, "A [Strength] card"],
      ["X-Factor", "An X-Factor card"],
      [(c: Card) => c.cost === 4, "A card that costs 4"],
      [(c: Card) => c.cost === 5, "A card that costs 5"],
    ];
    repeat(3, i => cont(ev, () => chooseOneEv(ev, "Investigate for a card", ...options.map(([match, text]) => [text, () => {
      investigateEv(ev, match);
      options.splice(options.findIndex(([,t]) => t === text), 1);
    }] as [string, () => void]))));
  }),
},
{
  name: "Warpath",
  team: "X-Force",
// Choose a number 1 or more. {INVESTIGATE} for a card of that cost.
  c1: makeHeroCard("Warpath", "Grim Tracker", 2, u, 1, Color.INSTINCT, "X-Force", "FD", ev => {
    chooseCostEv(ev, cost => investigateEv(ev, c => c.cost === cost), 1);
  }),
// When you draw a new hand of cards at the end of this turn, draw two extra cards.
  c2: makeHeroCard("Warpath", "Endless Endurance", 5, u, u, Color.STRENGTH, "X-Force", "", ev => addEndDrawMod(2)),
// Reveal the top card of your deck. If it costs 0, you may KO it.
// {TACTICAL FORMATION 225}: You get +3 Attack.
  uc: makeHeroCard("Warpath", "Dangerous Maneuver", 2, u, 0, Color.COVERT, "X-Force", "D", [
    ev => revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards.limit(c => c.cost === 0), c => KOEv(ev, c))),
    ev => tacticalFormation('225') && addAttackEvent(ev, 3) ]),
// Whenever you “reveal” or “look at” any number of cards from your deck this turn, you get +1 Attack. (Just drawing or discarding a card from your deck doesn’t count.)
// Choose a number 1 or more. {INVESTIGATE} for a card of that cost.
  ra: makeHeroCard("Warpath", "Superhuman Senses", 7, u, 3, Color.INSTINCT, "X-Force", "", [ ev => {
    addTurnTrigger('REVEAL', ev => ev.where === playerState.deck && ev.who === playerState, ev => addAttackEvent(ev, 1));
  }, ev => chooseCostEv(ev, cost => investigateEv(ev, c => c.cost === cost), 1) ]),
},
{
  name: "Siryn",
  team: "X-Factor",
// Choose a Hero Class. {INVESTIGATE} for a card of that Hero Class.
  c1: makeHeroCard("Siryn", "Echolocation", 2, u, 1, Color.COVERT, "X-Factor", "FD", ev => chooseClassEv(ev, color => investigateEv(ev, color))),
// {POWER Covert} {SHATTER} each Hero currently in the HQ whose printed cost is 2, 4, 6, and/or 8.
  c2: makeHeroCard("Siryn", "Hypnotic Call", 4, u, 2, Color.COVERT, "X-Factor", "D",
    ev => superPower(Color.COVERT) && shatterAllEv(ev, hqHeroes().limit(c => [2, 4, 6, 8].includes(c.cost)))),
// <b>Tactical Formation 246: Shatter</b> all Villains.
  uc: makeHeroCard("Siryn", "Three-Octave Arpeggio", 6, u, 4, Color.RANGED, "X-Factor", "FD",
    ev => tacticalFormation('246') && shatterAllEv(ev, fightableCards().limit(isVillain))),
// {SHATTER} the Mastermind. KO up to two cards from your hand and/or discard pile.
  ra: makeHeroCard("Siryn", "Splintering Shriek", 8, u, u, Color.COVERT, "X-Factor", "", [
    ev => shatterSelectEv(ev, gameState.mastermind.deck),
    ev => selectObjectsUpToEv(ev, "KO up to two cards", 2, handOrDiscard(), c => KOEv(ev, c)),
  ]),
},
{
  name: "Rictor",
  team: "X-Factor",
// {POWER Ranged} {SHATTER} a Villain in the Sewers.
  c1: makeHeroCard("Rictor", "Underground Cave-In", 3, u, 2, Color.RANGED, "X-Factor", "FD", ev => superPower(Color.RANGED) && shatterSelectEv(ev, villainIn('SEWERS'))),
// {INVESTIGATE} for a card that’s [Ranged] and/or [Instinct].
  c2: makeHeroCard("Rictor", "Unearth Tectonic Power", 5, u, 2, Color.INSTINCT, "X-Factor", "FD", ev => investigateEv(ev, Color.RANGED | Color.INSTINCT)),
// {POWER Ranged} {INVESTIGATE} for a card that costs 0, KO it or discard it.
  uc: makeHeroCard("Rictor", "Trace the Fault Lines", 4, 2, u, Color.RANGED, "X-Factor", "FD",
    ev => superPower(Color.RANGED) && investigateEv(ev, c => c.cost === 0, playerState.deck, c => selectCardOptEv(ev, "Choose a card to KO", [c], c => KOEv(ev, c), () => discardEv(ev, c)))),
// {SHATTER} the Mastermind or {SHATTER} all Heroes currently in the HQ.
  ra: makeHeroCard("Rictor", "Massive Earthquake", 7, u, u, Color.RANGED, "X-Factor", "", ev => {
    chooseOneEv(ev, "Choose a target", ["Mastermind", () => shatterSelectEv(ev, gameState.mastermind.deck)], ["Heroes in HQ", () => shatterAllEv(ev, hqHeroes())]);
  }),
},
]);
addHeroTemplates("Doctor Strange and the Shadows of Nightmare", [
{
  name: "Doctor Strange",
  team: "Avengers",
// {RITUAL ARTIFACT} If you drew a card, you may discard Wand of Watoomb to get +3 Attack.
  c1: makeHeroCard("Doctor Strange", "Wand of Watoomb", 3, u, u, Color.RANGED, "Avengers", "", ev => addAttackEvent(ev, 3), ritualArifact(() => cardsDrawn() > 0)),
// If you control an Artifact, draw a card.
  c2: makeHeroCard("Doctor Strange", "Keeper of the Sanctum", 4, u, 2, Color.INSTINCT, "Avengers", "FD", ev => {
    playerState.artifact.size && drawEv(ev);
  }),
// {RITUAL ARTIFACT} If you fought a Villain, you may discard Book Of Cagliostro to get +Recruit equal to that enemy’s VP.
  uc: makeHeroCard("Doctor Strange", "Book Of Cagliostro", 2, u, u, Color.INSTINCT, "Avengers", "D", ev => {
    const cards = pastEvents('FIGHT').map(ev => ev.what).limit(isVillain);
    selectCardEv(ev, "Choose a Villain to get Recruit", cards, c => addRecruitEvent(ev, c.vp));
  }, ritualArifact(() => pastEvents('FIGHT').map(ev => ev.what).has(isVillain))),
// {RITUAL ARTIFACT} If you played another Artifact or three other cards of the same Hero Class, you may discard the Eye of Agamotto to get +7 Attack.
  ra: makeHeroCard("Doctor Strange", "The Eye of Agamotto", 8, u, u, Color.RANGED, "Avengers", "", ev => addAttackEvent(ev, 7), ritualArifact(what => 
    turnState.cardsPlayed.has(c => c !== what && (c.isArtifact || classes.has(col => turnState.cardsPlayed.limit(col).count(isNot(what)) >= 3)))
  )),
},
{
  name: "Clea",
  team: "Marvel Knights",
// Draw a card. Then put a card from your hand on top of your deck.
  c1: makeHeroCard("Clea", "Prepare Dark Magic", 3, u, 2, Color.RANGED, "Marvel Knights", "FD", [
    ev => drawEv(ev),
    ev => pickTopDeckEv(ev),
  ]),
// You may make a {DEMONIC BARGAIN} to get +2 Recruit.
  c2: makeHeroCard("Clea", "Demonic Descendant", 4, 2, u, Color.COVERT, "Marvel Knights", "FD", ev => {
    chooseMayEv(ev, "Bargain", ev => demonicBargain(ev, ev => addRecruitEvent(ev, 2)));
  }),
// {POWER Ranged} You may choose a player to make a {DEMONIC BARGAIN} to KO up to one Hero of their choice from their hand or discard pile.
  uc: makeHeroCard("Clea", "Bind the Dark Dimension", 6, u, 3, Color.RANGED, "Marvel Knights", "", ev => {
    superPower(Color.RANGED) && chooseMayEv(ev, "Bargain", ev => choosePlayerEv(ev, p => {
      demonicBargain(ev, ev => KOHandOrDiscardEv(ev, isHero, undefined, p), p);
    }));
  }),
// {RITUAL ARTIFACT} If any cards were “revealed”, “looked at”, or “discarded” from any deck, you may discard the Purple Gem to get +6 Attack. (Just drawing or playing a card from a deck doesn’t count.)
  ra: makeHeroCard("Clea", "The Purple Gem", 7, u, u, Color.COVERT, "Marvel Knights", "", ev => addAttackEvent(ev, 6),
    ritualArifact(() => turnState.pastEvents.has(ev => ev.type === 'REVEAL' || ev.type === 'DISCARD'))),
},
{
  name: "Doctor Voodoo",
  team: "Avengers",
// You may discard an Artifact you control or three cards from your hand. If you do, KO a card from your hand or discard pile.
  c1: makeHeroCard("Doctor Voodoo", "Commune with the Spirit World", 3, 2, u, Color.COVERT, "Avengers", "D", ev => {
    const options: [string, () => void][] = [];
    playerState.artifact.size && options.push(["Discard an Artifact", () => {
      selectCardEv(ev, "Choose an Artifact to discard", playerState.artifact.deck, c => discardEv(ev, c)); cont(ev, () => KOHandOrDiscardEv(ev));
    }]);
    playerState.hand.size >= 3 && options.push(["Discard three cards", () => {
      selectObjectsEv(ev, "Choose three cards to discard", 3, playerState.hand.deck, c => discardEv(ev, c)); cont(ev, () => KOHandOrDiscardEv(ev));
    }]);
    if (options.length > 1) chooseOneEv(ev, "Choose a way to KO a card", ...options, ["Decline", () => {}]);
    else if (options.length) chooseMayEv(ev, ...options[0]);
  }),
// {RITUAL ARTIFACT} If you have at least three Hero Classes, you may discard Medallion of Many Loas to get +1 Attack for each Hero Class you have, including this one.
  c2: makeHeroCard("Doctor Voodoo", "Medallion of Many Loas", 4, u, u, Color.TECH, "Avengers", "F", ev => addAttackEvent(ev, numClasses()), ritualArifact(() => numClasses() >= 3)),
// {RITUAL ARTIFACT} If you recruited a Hero, you may discard Staff of Legba to get +Attack equal to that Hero’s cost.
  uc: makeHeroCard("Doctor Voodoo", "Staff of Legba", 5, u, u, Color.STRENGTH, "Avengers", "", ev => {
    selectCardEv(ev, "Choose a Hero to get Attack", pastEvents('RECRUIT').map(ev => ev.what), c => addAttackEvent(ev, c.cost));
  }, ritualArifact(() => pastEvents('RECRUIT').length > 0)),
// The first time that one of your Heroes or a Hero from your deck or discard pile is KO’d this turn, you get +4 Recruit or +4 Attack.
  ra: makeHeroCard("Doctor Voodoo", "Possessed by Brother’s Spirit", 7, 0, 4, Color.INSTINCT, "Avengers", "", ev => {
    let done = false;
    addTurnTrigger('KO', ev => isHero(ev.what) && (yourHeroesLocations().includes(ev.where) || ev.where == playerState.discard), ev => {
      if (!done) chooseOneEv(ev, "Choose a bonus", ["Recruit", () => addRecruitEvent(ev, 4)], ["Attack", () => addAttackEvent(ev, 4)]);
      done = true;
    });
  }),
},
{
  name: "The Ancient One",
  team: "(Unaffiliated)",
// You may have a Villain from the city enter the <b>Astral Plane</b>.
  c1: makeHeroCard("The Ancient One", "Astral Confrontation", 3, 2, u, Color.COVERT, u, "FD", ev => {
    selectCardOptEv(ev, "Choose a Villain to enter the Astral Plane", cityVillains(), c => moveCardEv(ev, c, gameState.astralPlane));
  }),
// Draw two cards.
  c2: makeHeroCard("The Ancient One", "Teachings of Kamar-Taj", 5, u, u, Color.INSTINCT, u, "F", ev => drawEv(ev, 2)),
// You may fight the Mastermind using only Recruit instead of Attack this turn.
// {POWER Covert} You get +3 Recruit.
  uc: makeHeroCard("The Ancient One", "War of the Mind", 6, 3, u, Color.COVERT, u, "", [ ev => {
    // Similar effect to "Peter's Allies": "Michelle", where it is handled differently (adds an extra fight action)
    // However this would be an issue when a new mastermind appears after the card was played.
    let enabled = false;
    addTurnAction(new Ev(ev, 'EFFECT', { func: () => enabled = !enabled, desc: "Switch Recruit and Attack for the Mastermind" }));
    addTurnSet('fightCost', isMastermind, (c, cost) => (enabled ? allRecruitFightCost(cost) : cost));
  }, ev => superPower(Color.COVERT) && addRecruitEvent(ev, 3) ]),
// {RITUAL ARTIFACT} If you fought a Villain or Mastermind, you may set aside the Orb of Agamotto to reveal the top four cards of your deck. KO up to one of them, put two of them in your hand, and put the rest back on top in any order. Then discard the Orb of Agamotto.
  ra: makeHeroCard("The Ancient One", "The Orb of Agamotto", 8, u, u, Color.INSTINCT, u, "", ev => revealPlayerDeckEv(ev, 4, cards => {
    let koed: Card | undefined = undefined;
    gameState.villaindeck
    selectCardOptEv(ev, "Choose a card to KO", cards, c => (KOEv(ev, c), koed = c));
    cont(ev, () => selectObjectsEv(ev, "Choose two cards to put in hand", 2, cards.filter(c => c !== koed), c => moveCardEv(ev, c, playerState.hand)));
  }), ritualArifact(() => pastEvents('FIGHT').map(ev => ev.what).has(isEnemy))),
},
{
  name: "The Vishanti",
  team: "(Unaffiliated)",
// You may KO a Wound from your hand or discard pile. If you do, draw a card.
  c1: makeHeroCard("The Vishanti", "Oshtur", 3, 2, u, Color.STRENGTH, u, "FD", ev => KOHandOrDiscardEv(ev, isWound, () => drawEv(ev))),
// You may make a {DEMONIC BARGAIN} to get +2 Attack.
  c2: makeHeroCard("The Vishanti", "Hoggoth", 5, u, 2, Color.INSTINCT, u, "FD", ev => {
    chooseMayEv(ev, "Bargain", ev => demonicBargain(ev, ev => addAttackEvent(ev, 2)));
  }),
// Reveal the top card of your deck. Discard it or put it back.
// {POWER Ranged} You may choose a player to make a {DEMONIC BARGAIN} to draw two extra cards at the end of this turn.
  uc: makeHeroCard("The Vishanti", "Agamotto", 4, u, 2, Color.RANGED, u, "D", [ ev => {
    revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to discard", cards, c => discardEv(ev, c)));
  }, ev => superPower(Color.RANGED) && chooseMayEv(ev, "Bargain", ev => choosePlayerEv(ev, p => {
    demonicBargain(ev, () => addTurnTrigger('CLEANUP', u, ev => drawEv(ev, 2, p)), p);
  })) ]),
// {RITUAL ARTIFACT} If any player gained a Wound, you may set aside the Book of the Vishanti to KO up to one Wound from any player’s discard pile, then draw three cards. Then discard the Book of the Vishanti. You can use this during any player’s turn.
  ra: makeHeroCard("The Vishanti", "The Book of the Vishanti", 7, u, u, Color.COVERT, u, "", ev => {
    const agent = owner(ev.what); // can be different that the current player
    selectCardOptEv(ev, "Choose a Wound to KO", gameState.players.map(p => p.discard.deck).merge().limit(isWound), c => KOEv(ev, c), undefined, agent);
    drawEv(ev, 3, agent);
  }, {
    ...ritualArifact(() => pastEvents('GAIN').map(ev => ev.what).has(isWound)),
    trigger: {
      event: 'GAIN',
      match: (ev, c) => isWound(ev.what) && isControlledArtifact(c, true) && playerState !== owner(c),
      after: ev => useRitualArtifactEv(ev, ev.source),
    }
  })
},
]);
addHeroTemplates("Marvel Studios' Guardians of the Galaxy", [
{
  name: "Star-Lord",
  team: "Guardians of the Galaxy",
// <b>Triggered Artifact</b> — The first time you play an Artifact each turn <i>(including this one)</i>, you get +1 Recruit.
  c1: makeHeroCard("Star-Lord", "Starship Sensors", 2, u, u, Color.TECH, "Guardians of the Galaxy", "D", ev => addRecruitEvent(ev, 1),
  triggeredArifact('PLAY', ev => isArtifact(ev.what) && !pastEvents('PLAY').has(ev => isArtifact(ev.what)), true)),  
// <b>Triggered Artifact</b> — The first time you play an Artifact each turn <i>(including this one)</i>, you get +1 Attack.
// GUN: 1
  c2: makeHeroCard("Star-Lord", "Borrowed Nova Blaster", 3, u, u, Color.RANGED, "Guardians of the Galaxy", "G", ev => addAttackEvent(ev, 1),
  triggeredArifact('PLAY', ev => isArtifact(ev.what) && !pastEvents('PLAY').has(ev => isArtifact(ev.what)), true)),
// <b>Triggered Artifact</b> — The first time you play an Artifact each turn <i>(including this one)</i>, draw a card.
// GUN: 1
  c3: makeHeroCard("Star-Lord", "Expandable Helmet", 5, u, u, Color.TECH, "Guardians of the Galaxy", "G", ev => drawEv(ev),
  triggeredArifact('PLAY', ev => isArtifact(ev.what) && !pastEvents('PLAY').has(ev => isArtifact(ev.what)), true)),
  uc: makeDividedHeroCard(
// DIVIDED: Give
// DIVHERO: Star-Lord
// You may discard an Artifact you control to get +1 Recruit.
    makeHeroCard("Star-Lord", "Give", 4, 2, u, Color.COVERT, "Guardians of the Galaxy", "D", ev => {
      selectCardOptEv(ev, "Choose an Artifact to discard", playerState.artifact.deck, c => { discardEv(ev, c); addRecruitEvent(ev, 1); });
    }),
// DIVIDED: Take
// DIVHERO: Yondu
// {TEAMPOWER Guardians of the Galaxy} Reveal the top card of your deck. If it's an Artifact, draw it.
    makeHeroCard("Yondu", "Take", 4, u, 2, Color.RANGED, "Guardians of the Galaxy", "D", ev => superPower("Guardians of the Galaxy") && revealPlayerDeckEv(ev, 1, cards => cards.has(isArtifact) && cards.each(c => drawCardEv(ev, c)))),
  ),
// You may discard an Artifact you control to get +1 Attack.
// GUN: 1
  u2: makeHeroCard("Star-Lord", "Don't Need That Stuff", 6, u, 3, Color.STRENGTH, "Guardians of the Galaxy", "GF", ev => {
    selectCardOptEv(ev, "Choose an Artifact to discard", playerState.artifact.deck, c => { discardEv(ev, c); addAttackEvent(ev, 1); });
  }),
// <b>Triggered Artifact</b> — The first time you play an Artifact each turn <i>(including this one)</i>, you get +3 Attack.
// GUN: 1
  ra: makeHeroCard("Star-Lord", "Hadron Enforcer", 8, u, u, Color.RANGED, "Guardians of the Galaxy", "G", ev => addAttackEvent(ev, 3),
  triggeredArifact('PLAY', ev => isArtifact(ev.what) && !pastEvents('PLAY').has(ev => isArtifact(ev.what)), true)),
},
{
  name: "Gamora",
  team: "Guardians of the Galaxy",
// If you control an Artifact, draw a card.
  c1: makeHeroCard("Gamora", "Sharpen Blades", 3, 2, u, Color.COVERT, "Guardians of the Galaxy", "FD", ev => playerState.artifact.size && drawEv(ev)),
// To play this, you must put a card from your hand on the bottom of your deck.
// Draw two cards.
  c2: makeHeroCard("Gamora", "Resourceful Fugitive", 4, u, u, Color.COVERT, "Guardians of the Galaxy", "", ev => drawEv(ev, 2), { playCost: 1, playCostType: 'BOTTOMDECK'}),
// <b>Triggered Artifact</b> — Whenever you draw a card during your turn, you get +1 Attack.
  c3: makeHeroCard("Gamora", "Retractable Sword", 5, u, u, Color.INSTINCT, "Guardians of the Galaxy", "",
    // TODO not in CLEANUP
    ev => addAttackEvent(ev, 1), triggeredArifact('DRAW', (ev, source) => ev.who === playerState)),
  uc: makeDividedHeroCard(
// DIVIDED: Forgive
// DIVHERO: Gamora
// {POWER Covert} Draw a card.
    makeHeroCard("Gamora", "Forgive", 2, 1, u, Color.COVERT, "Guardians of the Galaxy", "D", ev => superPower(Color.COVERT) && drawEv(ev)),
// DIVIDED: Resent
// DIVHERO: Nebula
// {POWER Instinct} You get +1 Attack.
    makeHeroCard("Nebula", "Resent", 2, u, 1, Color.INSTINCT, "Guardians of the Galaxy", "D", ev => superPower(Color.INSTINCT) && addAttackEvent(ev, 1)),
  ),
// If you drew at least two cards this turn, you may KO a card from your hand or discard pile.
// GUN: 1
  u2: makeHeroCard("Gamora", "Stolen Necroblaster", 6, u, 3, Color.RANGED, "Guardians of the Galaxy", "G", ev => pastEvents('DRAW').count(ev => ev.who === playerState) >= 2 && selectCardOptEv(ev, "Choose a card to KO", handOrDiscard(), c => KOEv(ev, c))),
// If you drew at least two cards this turn, you get +2 Attack.
  ra: makeHeroCard("Gamora", "Guardians Escape", 7, u, 5, Color.TECH, "Guardians of the Galaxy", "FD", ev => pastEvents('DRAW').count(ev => ev.who === playerState) >= 2 && addAttackEvent(ev, 2)),
},
{
  name: "Rocket & Groot",
  team: "Guardians of the Galaxy",
// {KINDNESS} Rescue a Bystander.
  c1: makeHeroCard("Rocket & Groot", "Baby Groot", 3, 2, u, Color.INSTINCT, "Guardians of the Galaxy", "FD", [], { excessiveKindness: ev => rescueEv(ev) }),
// DIVIDED: Passion
// DIVHERO: Rocket
// {VIOLENCE} Draw a card.
// DIVIDED: Compassion
// DIVHERO: Baby Groot
// {KINDNESS} Draw a card.
  c2: makeDividedHeroCard(
    makeHeroCard("Rocket", "Passion", 2, u, 1, Color.TECH, "Guardians of the Galaxy", "D", [], { excessiveViolence: ev => drawEv(ev) }),
    makeHeroCard("Baby Groot", "Compassion", 2, 1, u, Color.COVERT, "Guardians of the Galaxy", "D", [], { excessiveKindness: ev => drawEv(ev) }),
  ),
// DIVIDED: Don't Press This Button
// DIVHERO: Rocket
// {POWER Ranged} You get +1 Attack.
// DIVIDED: Press the Button
// DIVHERO: Baby Groot
// {POWER Tech} You may KO a card from your hand or discard pile.
  c3: makeDividedHeroCard(
    makeHeroCard("Rocket", "Don't Press This Button", 4, u, 2, Color.RANGED, "Guardians of the Galaxy", "D", ev => superPower(Color.RANGED) && addAttackEvent(ev, 1)),
    makeHeroCard("Baby Groot", "Press the Button", 4, 1, u, Color.TECH, "Guardians of the Galaxy", "", ev => superPower(Color.TECH) && KOHandOrDiscardEv(ev, undefined)),
  ),
// <b>Triggered Artifact</b> — Whenever you use <b>Excessive Violence</b>, draw a card.
  uc: makeHeroCard("Rocket & Groot", "Gravity Mines", 4, u, u, Color.TECH, "Guardians of the Galaxy", "F", ev => drawEv(ev),
    triggeredArifact('FIGHT', (ev, source) => ev.withViolence)),
// DIVIDED: Tricky
// DIVHERO: Rocket
// If you have at least five different card names, you get +2 Recruit.
// DIVIDED: Simple
// DIVHERO: Groot
  u2: makeDividedHeroCard(
    // TODO multiplayer reveal hand
    makeHeroCard("Rocket", "Tricky", 5, 2, u, Color.TECH, "Guardians of the Galaxy", "D", ev => revealableSplit().uniqueCount(c => c.cardName) >= 5 && addRecruitEvent(ev, 2)),
    makeHeroCard("Groot", "Simple", 5, u, 3, Color.STRENGTH, "Guardians of the Galaxy", "N"),
  ),
// Reveal your hand. You get +1 Attack for each different card name in your hand.
// <i>(Each Divided Card has two different card names.)</i>
  // TODO multiplayer reveal hand
  ra: makeHeroCard("Rocket & Groot", "We Are Groot", 7, u, 0, Color.STRENGTH, "Guardians of the Galaxy", "", ev => addAttackEvent(ev, splitDivided(playerState.hand.deck).uniqueCount(c => c.cardName))),
},
{
  name: "Drax",
  team: "Guardians of the Galaxy",
// {VIOLENCE} Look at the top two cards of your deck. Discard any number of them and put the rest back in any order.
  c1: makeHeroCard("Drax", "Nothing Goes Over My Head", 3, u, 2, Color.INSTINCT, "Guardians of the Galaxy", "D", [], { excessiveViolence: ev =>
    revealPlayerDeckEv(ev, 2, cards => selectObjectsAnyEv(ev, "Choose cards to discard", cards, c => discardEv(ev, c)))
   }),
// {VIOLENCE} You get +2 Recruit.
  c2: makeHeroCard("Drax", "Prison Riot", 5, 0, 3, Color.STRENGTH, "Guardians of the Galaxy", "FD", [], { excessiveViolence: ev => addRecruitEvent(ev, 2) }),
// DIVIDED: I Am Invisible
// DIVHERO: Drax - Guardians of the Glaxy
// {VIOLENCE} Reveal the top card of your deck. If it's [Strength] or [Instinct], draw it.
// DIVIDED: Xandar Is Invincible
// DIVHERO: Irani Rael - Unaffiliated
// If there are no Villains in the city, you get +1 Recruit.
  c3: makeDividedHeroCard(
    makeHeroCard("Drax", "I Am Invisible", 4, u, 2, Color.INSTINCT, "Guardians of the Galaxy", "D", [], { excessiveViolence: ev =>
      revealPlayerDeckEv(ev, 1, cards => cards.limit(Color.STRENGTH | Color.INSTINCT).each(c => drawCardEv(ev, c)))
     }),
    makeHeroCard("Irani Rael", "Xandar Is Invincible", 4, 2, u, Color.TECH, u, "D", ev =>
      cityVillains().size === 0 && addRecruitEvent(ev, 1)
    ),
  ),
// <b>Triggered Artifact</b> — Whenever you play another [Strength] or [Instinct] card, you get +1 Attack.
  uc: makeHeroCard("Drax", "Dual Knives", 4, u, u, Color.STRENGTH, "Guardians of the Galaxy", "F", ev => addAttackEvent(ev, 1),
  triggeredArifact('PLAY', (ev, source) => isColor(Color.STRENGTH | Color.INSTINCT)(ev.what))),
// DIVIDED: Remove His Spine
// DIVHERO: Drax - Guardians of the Glaxy
// {VIOLENCE} Reveal the top card of your deck. You may KO it.
// DIVIDED: Also Illegal
// DIVHERO: Rhomann Dey - Unaffiliated
// {POWER Instinct} You get +1 Recruit.
  u2: makeDividedHeroCard(
    makeHeroCard("Drax", "Remove His Spine", 6, u, 3, Color.STRENGTH, "Guardians of the Galaxy", "", [], { excessiveViolence: ev =>
      revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c)))
     }),
    makeHeroCard("Rhomann Dey", "Also Illegal", 6, 3, u, Color.INSTINCT, u, "", ev => superPower(Color.INSTINCT) && addRecruitEvent(ev, 1)),
  ),
// Double the Attack you have.
// {VIOLENCE} You may KO a Villain from your Victory Pile to do its Fight effect.
  ra: makeHeroCard("Drax", "Revenge For My Family", 8, u, u, Color.STRENGTH, "Guardians of the Galaxy", "", ev => doubleAttackEv(ev), { excessiveViolence: ev =>
    selectCardOptEv(ev, "Choose a Villain to KO", playerState.victory.limit(isVillain), c => {
      KOEv(ev, c);
      pushEffects(ev, c, 'fight', c.fight); // TODO abstract pushEffect use
    })
   }),
},
{
  name: "Mantis",
  team: "Guardians of the Galaxy",
// {KINDNESS} Put the Hero you recruited this way on the top of your deck.
  c1: makeHeroCard("Mantis", "Empathic Bond", 3, 2, u, Color.RANGED, "Guardians of the Galaxy", "FD", [], { excessiveKindness: ev => moveCardEv(ev, ev.what, playerState.deck) }),
// DIVIDED: Selfless
// DIVHERO: Mantis - Guardians of the Glaxy
// {POWER Instinct} Draw a card.
// Another player draws a card.
// DIVIDED: Selfish
// DIVHERO: Ego - Unaffiliated
// {POWER Ranged} Draw a card.
// Another player discards a card.
  c2: makeDividedHeroCard(
    makeHeroCard("Mantis", "Selfless", 4, 2, u, Color.INSTINCT, "Guardians of the Galaxy", "D", [
      ev => superPower(Color.INSTINCT) && drawEv(ev),
      ev => chooseOtherPlayerEv(ev, p => drawEv(ev, 1, p))
     ]),
    makeHeroCard("Ego", "Selfish", 4, u, 2, Color.RANGED, u, "D", [
      ev => superPower(Color.RANGED) && drawEv(ev),
      ev => chooseOtherPlayerEv(ev, p => pickDiscardEv(ev, 1, p))
    ]),
  ),
// {KINDNESS} You get +2 Attack.
  c3: makeHeroCard("Mantis", "Inspire Courage", 5, 3, 0, Color.INSTINCT, "Guardians of the Galaxy", "FD", [], { excessiveKindness: ev => addAttackEvent(ev, 2) }),
// {KINDNESS} You may KO one of your cards.
  uc: makeHeroCard("Mantis", "Sleep", 5, 2, u, Color.COVERT, "Guardians of the Galaxy", "FD", [], { excessiveKindness: ev => selectCardOptEv(ev, "Choose a card to KO", revealable(), c => KOEv(ev, c)) }),
// {KINDNESS} You get +Attack equal to the total of all the printed Recruit and Attack of the Hero you recruited this way.
  u2: makeHeroCard("Mantis", "Emotional Wave", 6, 3, 0, Color.RANGED, "Guardians of the Galaxy", "", [], { excessiveKindness: ev => addAttackEvent(ev, (ev.what.printedAttack || 0) + (ev.what.printedRecruit || 0)) }),
// {KINDNESS} You get +Attack equal to the cost of the Hero you recruited this way.
  ra: makeHeroCard("Mantis", "Discover the Dead", 7, u, u, Color.INSTINCT, "Guardians of the Galaxy", "F", [], { excessiveKindness: ev => addAttackEvent(ev, ev.what.cost) }),
},
]);
addHeroTemplates("Black Panther", [
{
  name: "King Black Panther",
  team: "Heroes of Wakanda",
// Heroes of Wakanda <b>Ambush</b>: Rescue a Bystander.
// ---
// Gain the {THRONES FAVOR}. If you already have it, you may spend it to get +2 Recruit.
  c1: makeHeroCard("King Black Panther", "Unseen Protector", 2, 1, u, Color.INSTINCT | Color.COVERT, "Heroes of Wakanda", "D",
    ev => thronesFavorGainOrMaySpendEv(ev, () => addRecruitEvent(ev, 2)), heroAmbush("Heroes of Wakanda", ev => rescueEv(ev))),
// [Instinct] <b>Ambush</b>: You get +2 Attack.
// ---
// {POWER Instinct} Gain the {THRONES FAVOR}. If you already have it, you may spend it to get +2 Attack.
  c2: makeHeroCard("King Black Panther", "Vibranium Claws", 4, u, 2, Color.INSTINCT | Color.TECH, "Heroes of Wakanda", "D",
    ev => superPower(Color.INSTINCT) && thronesFavorGainOrMaySpendEv(ev, () => addAttackEvent(ev, 2)), heroAmbush(Color.INSTINCT, ev => addAttackEvent(ev, 2)),
  ),
// [Covert] <b>Ambush</b>: Look at the top card of your deck. Draw or KO it.
// ---
// {POWER Covert} Gain the {THRONES FAVOR}. If you already have it, you may look at the top card of your deck. Draw or KO it.
  uc: makeHeroCard("King Black Panther", "Heart-Shaped Herb", 5, u, 3, Color.STRENGTH | Color.COVERT, "Heroes of Wakanda", "",
    ev => superPower(Color.COVERT) && thronesFavorGainOrMaySpendEv(ev, () => chooseMayEv(ev, "Look at the deck", () =>
      revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c), () => cards.each(c => drawCardEv(ev, c))))
    )),
    heroAmbush(Color.COVERT, ev => revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c), () => cards.each(c => drawCardEv(ev, c))))),
  ),
// Heroes of Wakanda <b>Ambush</b>: You get +1 Attack for each Hero Class you have.
// ---
// {TEAMPOWER Heroes of Wakanda} Gain the {THRONES FAVOR}. If you already have it, you may spend it to get +1 Recruit and +1 Attack for each Hero Class you have.
  ra: makeHeroCard("King Black Panther", "Unite the Tribes of Wakanda", 8, 0, 5, Color.STRENGTH | Color.RANGED, "Heroes of Wakanda", "", ev => {
    superPower("Heroes of Wakanda") && thronesFavorGainOrMaySpendEv(ev, () => { addRecruitEvent(ev, numClasses()); addAttackEvent(ev, numClasses()); });
  }, heroAmbush("Heroes of Wakanda", ev => addAttackEvent(ev, numClasses()))),
},
{
  name: "Queen Storm of Wakanda",
  team: "Heroes of Wakanda",
// You may move a Villain to an adjacent city space. If another Villain is already there, swap them.
// {POWER Covert} You get <b>Empowered</b> by [Covert].
  c1: makeHeroCard("Queen Storm of Wakanda", "Hurricane Winds", 3, 2, 0, Color.COVERT, "Heroes of Wakanda", "D", [ ev => {
    selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
      selectCardEv(ev, "Choose a new city space", cityAdjacent(v.location), dest => swapCardsEv(ev, v.location, dest));
    });
  }, ev => superPower(Color.COVERT) && empowerEv(ev, Color.COVERT) ]),
// [Ranged] <b>Ambush</b>: You get <b>Empowered</b> by [Ranged].
// ---
// {POWER Ranged} You get <b>Empowered</b> by [Ranged].
  c2: makeHeroCard("Queen Storm of Wakanda", "Torrential Downpour", 4, u, 2, Color.RANGED, "Heroes of Wakanda", "FD", ev => superPower(Color.RANGED) && empowerEv(ev, Color.RANGED),
    heroAmbush(Color.RANGED, ev => empowerEv(ev, Color.RANGED))),
// Wound Villains on the Rooftops and Bridge.
// {POWER Covert Ranged} Gain the {THRONES FAVOR}. If you already had it, you may spend it to Wound the Mastermind twice.
  uc: makeHeroCard("Queen Storm of Wakanda", "Forked Lightning", 6, u, 3, Color.COVERT | Color.RANGED, "Heroes of Wakanda", "", [
    ev => villainIn('ROOFTOPS', 'BRIDGE').each(c => woundEnemyEv(ev, c)),
    ev => superPower(Color.COVERT, Color.RANGED) && thronesFavorGainOrMaySpendEv(ev, () => withMastermind(ev, c => woundEnemyEv(ev, c, 2)))]),
// Choose up to three Heroes from the HQ. Put them on the bottom of the Hero Deck.
// {TEAMPOWER Heroes of Wakanda} Gain the {THRONES FAVOR}. If you already had it, you may spend it to get <b>Empowered</b> by [Covert], then get <b>Empowered</b> by [Ranged].
  ra: makeHeroCard("Queen Storm of Wakanda", "Thunderous Tempest", 8, u, 5, Color.RANGED, "Heroes of Wakanda", "", [
    ev => selectObjectsUpToEv(ev, "Choose Heroes to put on the bottom of the Hero Deck", 3, hqHeroes(), c => moveCardEv(ev, c, gameState.herodeck, true)),
    ev => superPower("Heroes of Wakanda") && thronesFavorGainOrMaySpendEv(ev, () => {
      empowerEv(ev, Color.COVERT);
      empowerEv(ev, Color.RANGED);
    }),
  ]),
},
{
  name: "General Okoye",
  team: "Heroes of Wakanda",
// [Instinct] <b>Ambush</b>: Draw a card.
// ---
// {POWER Instinct} You may draw a card and get +1 Attack. If you do, gain a Wound.
  c1: makeHeroCard("General Okoye", "To My Last Breath", 3, u, 2, Color.INSTINCT, "Heroes of Wakanda", "D",
    ev => superPower(Color.INSTINCT) && chooseMayEv(ev, "Activate superpower", () => { drawEv(ev); addAttackEvent(ev, 1); gainWoundEv(ev); }),
    heroAmbush(Color.INSTINCT, ev => drawEv(ev))
  ),
// You may gain a S.H.I.E.L.D. Officer.
// {POWER Strength} Instead, you may KO a S.H.I.E.L.D. Officer or Wound from your hand or discard pile to get +2 Attack.
  c2: makeHeroCard("General Okoye", "Lead the Dora Milaje", 4, u, 2, Color.STRENGTH | Color.INSTINCT, "Heroes of Wakanda", "D", [
    ev => chooseMayEv(ev, "Gain a S.H.I.E.L.D. Officer", () => gameState.officer.withTop(c => gainEv(ev, c))),
    ev => superPower(Color.STRENGTH) && selectCardOptEv(ev, "Choose a card to KO", handOrDiscard().limit(c => isWound(c) || isShieldOfficer(c)), c => {
      KOEv(ev, c);
      addAttackEvent(ev, 2);
    })
  ]),
// Once per turn, when a player gains a Wound, you may reveal this card to return that Wound to the Wound Stack, draw a card, and Wound a Villain.
  uc: makeHeroCard("General Okoye", "Sovereign Bodyguard", 5, u, 3, Color.STRENGTH, "Heroes of Wakanda", "", ev => [], { trigger:
    youMayRevealThisInsteadEv("GAIN", (ev, source) => isWound(ev.what) && !countPerTurn("onceperturntrigger", source),
    "draw and Wound a Villain",
    ev => {
      incPerTurn("onceperturntrigger", ev.source);
      returnToStackEv(ev, gameState.wounds, ev.parent.what);
      drawEv(ev, 1, owner(ev.source));
      selectCardEv(ev, "Choose a Villain to Wound", villains(), c => woundEnemyEv(ev, c, 1, owner(ev.source)), owner(ev.source));
    })
  }),
// {TEAMPOWER Heroes of Wakanda} You may KO a S.H.I.E.L.D. Hero or Wound from your hand or discard pile to get +2 Attack.
// GUN: 1
  ra: makeHeroCard("General Okoye", "Direct the Agents of Wakanda", 7, u, 4, Color.COVERT, "Heroes of Wakanda", "GD",
    ev => superPower("Heroes of Wakanda") && selectCardOptEv(ev, "Choose a card to KO", handOrDiscard().limit(c => isWound(c) || isTeam('S.H.I.E.L.D.')(c)), c => {
      KOEv(ev, c);
      addAttackEvent(ev, 2);
    })),
},
{
  name: "Princess Shuri",
  team: "Heroes of Wakanda",
// [Tech] <b>Ambush</b>: Draw a card.
// ---
// Draw a card.
// {POWER Tech} You get <b>Empowered</b> by [Tech].
  c1: makeHeroCard("Princess Shuri", "Vibranium Experiments", 2, u, 0, Color.TECH, "Heroes of Wakanda", "D", [
    ev => drawEv(ev),
    ev => superPower(Color.TECH) && empowerEv(ev, Color.TECH)
  ], heroAmbush(Color.TECH, ev => drawEv(ev))),
// You get <b>Empowered</b> by the color of your choice, getting Recruit instead of Attack.
  c2: makeHeroCard("Princess Shuri", "Kimoyo Beads", 4, 0, u, Color.TECH | Color.RANGED, "Heroes of Wakanda", "F", ev => chooseColorEv(ev, c => empowerRecruitEv(ev, c))),
// You may put a card from the HQ on the bottom of the Hero Deck.
// {POWER Tech} You get <b>Empowered</b> by the color of your choice.
  uc: makeHeroCard("Princess Shuri", "Shock Net", 6, u, 3, Color.RANGED, "Heroes of Wakanda", "", [ ev => {
    selectCardOptEv(ev, "Choose a card to put on the bottom of the Hero Deck", hqCards(), c => {
      moveCardEv(ev, c, gameState.herodeck, true);
    });
  }, ev => superPower(Color.TECH) && chooseColorEv(ev, c => empowerEv(ev, c)) ]),
// {TEAMPOWER Heroes of Wakanda} This turn, each card entering the HQ also has "<b>Ambush</b>: If you have any cards that share a color with this, you get +2 Attack."
  ra: makeHeroCard("Princess Shuri", "Become the Next Black Panther", 7, 3, 3, Color.INSTINCT, "Heroes of Wakanda", "D",
    ev => superPower("Heroes of Wakanda") && addTurnSet('heroAmbush', c => c.location.isHQ, (c, v) => combineHandlers(v,
      heroAmbush(c.color, ev => addAttackEvent(ev, 2)).heroAmbush
  ))),
},
{
  name: "White Wolf",
  team: "Heroes of Wakanda",
// [Tech] <b>Ambush</b>: Wound a Villain.
// ---
// {POWER Tech} Wound a Villain.
  c1: makeHeroCard("White Wolf", "Cloaking Tech Ambush", 4, u, 2, Color.TECH, "Heroes of Wakanda", "FD", ev => superPower(Color.TECH) &&
    selectCardOptEv(ev, "Choose a Villain to Wound", villains(), c => woundEnemyEv(ev, c)),
    heroAmbush(Color.TECH, ev => selectCardOptEv(ev, "Choose a Villain to Wound", villains(), c => woundEnemyEv(ev, c)))
  ),
// {POWER Covert} <b>Ambush</b>: Wound the Mastermind.
// ---
// {POWER Covert} If any Villain or Mastermind has any Wounds, you get +2 Recruit.
  c2: makeHeroCard("White Wolf", "Secret Assignment", 3, 2, u, Color.COVERT, "Heroes of Wakanda", "D",
    ev => superPower(Color.COVERT) && fightableCards().limit(isEnemy).has(c => c.attached('WOUND').size > 0) && addRecruitEvent(ev, 2),
    heroAmbush(Color.COVERT, ev => withMastermind(ev, c => woundEnemyEv(ev, c)))
  ),
// Heroes of Wakanda <b>Ambush</b>: You may KO one of your cards.
// ---
// {TEAMPOWER Heroes of Wakanda} If any Villain or Mastermind has any Wounds, you may KO a card from your hand or discard pile.
  uc: makeHeroCard("White Wolf", "Command the Hatut Zeraze", 5, u, 3, Color.COVERT | Color.TECH, "Heroes of Wakanda", "",
    ev => superPower("Heroes of Wakanda") && fightableCards().limit(isEnemy).has(c => c.attached('WOUND').size > 0) && selectCardOptEv(ev, "Choose a card to KO", handOrDiscard(), c => KOEv(ev, c)),
    heroAmbush("Heroes of Wakanda", ev => selectCardOptEv(ev, "Choose a card to KO", revealable(), c => KOEv(ev, c)))
  ),
// [Tech] <b>Ambush</b>: Wound each Villain and the Mastermind.
// ---
// If a Master Strike would occur, you may reveal this card to KO that Strike and Wound the Mastermind instead.
  ra: makeHeroCard("White Wolf", "Reflective Vibranium Armor", 7, u, 4, Color.TECH, "Heroes of Wakanda", "", [], {
    trigger: youMayRevealThisInsteadEv("STRIKE", () => true, "Wound the Mastermind", ev => {
        KOEv(ev, ev.parent.what);
        withMastermind(ev, c => woundEnemyEv(ev, c, 1, owner(ev.source)));
    }),
    ...heroAmbush(Color.TECH, ev => fightableCards().limit(isEnemy).each(c => woundEnemyEv(ev, c))),
  }),
},
]);
addHeroTemplates("Black Widow", [
{
  name: "Black Widow",
  team: "S.H.I.E.L.D.",
// {DODGE}
// When you {DODGE} with or play this card, you may also {DODGE} with another card from your hand.
  c1: makeHeroCard("Black Widow", "Evasive Acrobatics", 3, 2, u, Color.INSTINCT, "S.H.I.E.L.D.", "FD", ev => {
    selectCardOptEv(ev, "Choose a card to Dodge", playerState.hand.limit(c => c !== ev.source), c => dodgeCardEv(ev, c));
  }, { cardActions: [ dodge ], trigger: {
    event: "DODGE",
    match: (ev, source) => ev.what === source,
    before: ev => selectCardOptEv(ev, "Choose a card to Dodge", playerState.hand.limit(c => c !== ev.parent.what), c => dodgeCardEv(ev, c))
  }}),
// {DODGE}
// {DARK MEMORIES}
  c2: makeHeroCard("Black Widow", "Widow's Bite", 4, u, 1, Color.TECH, "S.H.I.E.L.D.", "F", ev => darkMemoriesEv(ev), { cardActions: [ dodge ] }),
// {DODGE}
// If you drew any cards this turn, you may send one of your other Heroes {UNDERCOVER}.
  uc: makeHeroCard("Black Widow", "Weave A Web of Spies", 5, u, 2, Color.COVERT, "S.H.I.E.L.D.", "D", ev => {
    pastEvents('DRAW').has(ev => ev.who === playerState) && selectCardOptEv(ev, "Choose a Hero to send Undercover", yourHeroes().limit(c => c !== ev.source), c => {
      sendUndercoverEv(ev, c);
    });
  }, { cardActions: [ dodge ] }),
// You may send one of your Heroes {UNDERCOVER}.
// You get +3 Attack if you have at least 4 Bystanders and/or Undercover Heroes in your Victory Pile.
  ra: makeHeroCard("Black Widow", "Infiltrate the Conspiracy", 7, u, 4, Color.RANGED, "S.H.I.E.L.D.", "", [
    ev => selectCardOptEv(ev, "Choose a Hero to send Undercover", yourHeroes(), c => sendUndercoverEv(ev, c)),
    ev => playerState.victory.count(c => isBystander(c) || isHero(c)) >= 4 && addAttackEvent(ev, 3),
  ]),
},
{
  name: "Yelena Belova",
  team: "S.H.I.E.L.D.",
// Send this {UNDERCOVER}.
  c1: makeHeroCard("Yelena Belova", "Strike and Fade", 2, u, 3, Color.COVERT, "S.H.I.E.L.D.", "FD", ev => sendUndercoverEv(ev)),
// {POWER Instinct} You may <b>Unleash</b> one of your Heroes from {UNDERCOVER}.
// GUN: 1
  c2: makeHeroCard("Yelena Belova", "Unveil Identity", 3, 2, u, Color.INSTINCT, "S.H.I.E.L.D.", "GFD", ev => superPower(Color.INSTINCT) && unleashFromUndercoverEv(ev)),
// {DODGE}
// When you {DODGE} with this card, you may <b>Unleash</b> one of your other Heroes from {UNDERCOVER}.
// When you play this card, send it {UNDERCOVER}.
  uc: makeHeroCard("Yelena Belova", "Twilight Ops", 6, u, 3, Color.TECH, "S.H.I.E.L.D.", "", ev => sendUndercoverEv(ev), {
    cardActions: [ dodge ],
    trigger: {
      event: "DODGE",
      match: (ev, source) => ev.what === source,
      after: ev => unleashFromUndercoverEv(ev),
    },
  }),
// You may <b>Unleash</b> one of your Heroes from {UNDERCOVER}.
// You may send a Hero from your discard pile {UNDERCOVER}.
  ra: makeHeroCard("Yelena Belova", "Destroy the Red Room", 8, u, 4, Color.TECH, "S.H.I.E.L.D.", "", [
    ev => unleashFromUndercoverEv(ev),
    ev => selectCardOptEv(ev, "Choose a Hero to send Undercover", playerState.discard.limit(isHero), c => sendUndercoverEv(ev, c)),
  ]),
},
{
  name: "Red Guardian",
  team: "(Unaffiliated)",
// <b>When Recruited</b>: Send this {UNDERCOVER}.
// When you fight a Villain, you may <b>Unleash</b> this card from {UNDERCOVER}.
// ---
// {POWER Covert} Draw a card.
  c1: makeHeroCard("Red Guardian", "Sleeper Agent", 3, 2, u, Color.COVERT, u, "D", ev => superPower(Color.COVERT) && drawEv(ev), {
    whenRecruited: whenRecruitedSendUndercover,
    trigger: {
      event: "FIGHT",
      match: (ev, source) => owner(source) === playerState && isVillain(ev.what),
      after: ev => unleashFromUndercoverEv(ev, c => c === ev.source, ev.parent.who),
    },
  }),
// <b>When Recruited</b>: Send this {UNDERCOVER}.
// When you recruit another [Covert] Hero, you may <b>Unleash</b> this card from {UNDERCOVER}.
// ---
// {POWER Covert} You get +2 Attack.
  c2: makeHeroCard("Red Guardian", "Magnetic Shield", 4, u, 2, Color.COVERT, u, "D", ev => superPower(Color.COVERT) && addAttackEvent(ev, 2), {
    whenRecruited: whenRecruitedSendUndercover,
    trigger: {
      event: "RECRUIT",
      match: (ev, source) => ev.what !== source && owner(source) === playerState && isHero(ev.what) && isColor(Color.COVERT)(ev.what),
      after: ev => unleashFromUndercoverEv(ev, c => c === ev.source, ev.parent.who),
    },
  }),
// <b>When Recruited</b>: Send this {UNDERCOVER}.
// When a Master Strike is completed or any player fights the Mastermind, you may <b>Unleash</b> this card from {UNDERCOVER}.
// ---
// {POWER Covert} You may send one of your other Heroes {UNDERCOVER}.
  uc: makeHeroCard("Red Guardian", "Death Was Only A Ruse", 6, u, 3, Color.STRENGTH, u, "",
    ev => superPower(Color.COVERT) && selectCardOptEv(ev, "Choose a Hero to send Undercover", yourHeroes().limit(c => c !== ev.source), c => sendUndercoverEv(ev, c)), {
    whenRecruited: whenRecruitedSendUndercover,
    triggers: [{
      event: "STRIKE",
      after: ev => unleashFromUndercoverEv(ev, c => c === ev.source, ev.parent.who),
    }, {
      event: "FIGHT",
      match: ev => isMastermind(ev.what),
      after: ev => unleashFromUndercoverEv(ev, c => c === ev.source, ev.parent.who),
    }],
  }),
// <b>When Recruited</b>: Send this {UNDERCOVER}.
// When a Scheme Twist is completed or you play your third [Covert] Hero in a turn, you may <b>Unleash</b> this card from {UNDERCOVER}.
// ---
// {POWER Covert} You get +2 Attack for each other [Covert] Hero you played this turn.
  ra: makeHeroCard("Red Guardian", "Champion of the Winter Guard", 8, u, 4, Color.COVERT, u, "D", ev => superPower(Color.COVERT) && addAttackEvent(ev, 2 * superPower(Color.COVERT)), {
    whenRecruited: whenRecruitedSendUndercover,
    triggers: [{
      event: "TWIST",
      after: ev => unleashFromUndercoverEv(ev, c => c === ev.source, ev.parent.who),
    }, {
      event: "PLAY",
      match: ev => [ev, ...pastEvents('PLAY')].count(e => e.who === playerState && isHero(ev.what) && isColor(Color.COVERT)(ev.what)) === 3,
      after: ev => unleashFromUndercoverEv(ev, c => c === ev.source, ev.parent.who),
    }],
  }),
},
{
  name: "White Tiger",
  team: "Marvel Knights",
// Reveal the top two cards of your deck. Draw one of them that cost 0 and discard the rest.
  c1: makeHeroCard("White Tiger", "Amulets of the Tiger God", 4, 2, u, Color.STRENGTH, "Marvel Knights", "FD", ev => {
    revealPlayerDeckEv(ev, 2, cards => {
      selectCardOptEv(ev, "Choose a card to draw", cards.limit(c => c.cost === 0), c => {
        drawCardEv(ev, c);
        cards.limit(isNot(c)).each(c => discardEv(ev, c));
      }, () => cards.each(c => discardEv(ev, c)));
    });
  }),
// {DODGE}
// {DARK MEMORIES}
// Once this turn, you may fight the top card of the Bystander Stack as if it were a 3 Attack "Hand Ninjas" Henchman Villain with "<b>Fight</b>: You get +1 Recruit. Rescue this as a Bystander."
  c2: makeHeroCard("White Tiger", "Dark Influence of the Hand", 3, u, 0, Color.RANGED, "Marvel Knights", "", [ ev => darkMemoriesEv(ev), ev => {
    let done = false;
    const cond: (c: Card) => boolean = c => !done && c === gameState.bystanders.top
    addTurnSet('isHenchman', cond, () => true);
    villainify("Hand Ninjas", cond, 3, ev => {
      addRecruitEvent(ev, 1);
      rescueEv(ev, ev.source);
      done = true;
    });
  } ], { cardActions: [ dodge ] }),
// Whenever you defeat a Henchman this turn, you may KO one of your cards.
  uc: makeHeroCard("White Tiger", "Camouflaged Huntress", 5, u, 3, Color.COVERT, "Marvel Knights", "F", ev => {
    addTurnTrigger('DEFEAT', ev => isHenchman(ev.what), () => selectCardOptEv(ev, "Choose a card to KO", revealable(), c => KOEv(ev, c)));
  }),
// {DARK MEMORIES}, drawing that many cards instead of gaining Attack.
  ra: makeHeroCard("White Tiger", "Shadowed Resurrection", 8, u, 3, Color.INSTINCT, "Marvel Knights", "", ev => drawEv(ev, darkMemoriesAmount())),
},
{
  name: "Falcon & Winter Soldier",
  team: "Avengers",
// DIVIDED: Attune
// DIVHERO: Falcon
// To play this side, you must discard a card.
// DIVIDED: Atone
// DIVHERO: Winter Soldier
// {DARK MEMORIES}
  c1: makeDividedHeroCard(
    makeHeroCard("Falcon", "Attune", 3, 3, u, Color.RANGED, "Avengers", "", [], { playCost: 1, playCostType: 'DISCARD' }),
    makeHeroCard("Winter Soldier", "Atone", 3, u, 0, Color.STRENGTH, "Avengers", "", ev => darkMemoriesEv(ev)),
  ),
// DIVIDED: Relocate
// DIVHERO: Falcon
// {DODGE}
// {POWER Instinct} You get +1 Attack.
// DIVIDED: Reload
// DIVHERO: Winter Soldier
// {POWER Tech} Draw a card.
  c2: makeDividedHeroCard(
    makeHeroCard("Falcon", "Relocate", 4, u, 2, Color.INSTINCT, "Avengers", "D", ev => superPower(Color.INSTINCT) && addAttackEvent(ev, 1), { cardActions: [ dodge ] }),
    makeHeroCard("Winter Soldier", "Reload", 4, u, 2, Color.TECH, "Avengers", "D", ev => superPower(Color.TECH) && drawEv(ev)),
  ),
// DIVIDED: New Wings
// DIVHERO: Falcon
// If you discarded any cards this turn, you get +4 Attack.
// DIVIDED: New Plan
// DIVHERO: Winter Soldier
// Draw two cards.
  uc: makeDividedHeroCard(
    makeHeroCard("Falcon", "New Wings", 5, u, 0, Color.TECH, "Avengers", "", ev => pastEvents('DISCARD').has(e => e.who === playerState) && addAttackEvent(ev, 4)),
    makeHeroCard("Winter Soldier", "New Plan", 5, u, u, Color.COVERT, "Avengers", "", ev => drawEv(ev, 2)),
  ),
// You get +1 Attack for each Hero Class you have.
// {TEAMPOWER Avengers} {DARK MEMORIES}
  ra: makeHeroCard("Falcon & Winter Soldier", "Captain America's Legacy", 7, u, 2, Color.STRENGTH, "Avengers", "D", [ ev => addAttackEvent(ev, numClasses()), ev => superPower("Avengers") && darkMemoriesEv(ev) ]),
},
]);
addHeroTemplates("Marvel Studios The Infinity Saga", [
{
  name: "Wanda & Vision",
  team: "Avengers",
// {PHASING}
// [Tech] {SACRIFICE}: You get +3 Recruit. You may KO a card from your hand or discard pile.
  c1: makeHeroCard("Wanda & Vision", "We Have to Destroy It", 1, 1, u, Color.TECH, "Avengers", "", ev => {
    sacrificeEv(ev, Color.TECH, () => {
      addRecruitEvent(ev, 3);
      selectCardOptEv(ev, "Choose a card to KO", handOrDiscard(), c => KOEv(ev, c));
    });
  }, { cardActions: [ phasingActionEv ] }),
// Reveal the top card of your deck. If it has an odd-numbered cost, draw it. (0 is even.)
  c2: makeHeroCard("Wanda & Vision", "Witchcraft", 3, u, 2, Color.COVERT, "Avengers", "D", ev => drawIfEv(ev, isCostOdd)),
// DIVIDED: Hold On
// DIVHERO: Wanda
// {POWER Covert} You get +2 Attack.
// DIVIDED: Let Go
// DIVHERO: Vision
// {PHASING}
// [Ranged] {SACRIFICE}: Draw 3 cards. You may KO a card from your hand or discard pile.
  c3: makeDividedHeroCard(
    makeHeroCard("Wanda", "Hold On", 3, u, 1, Color.COVERT, "Avengers", "D", ev => superPower(Color.COVERT) && addAttackEvent(ev, 2)),
    makeHeroCard("Vision", "Let Go", 3, 2, u, Color.RANGED, "Avengers", "D", ev => sacrificeEv(ev, Color.RANGED, ev => {
      drawEv(ev, 3);
      selectCardOptEv(ev, "Choose a card to KO", handOrDiscard(), c => KOEv(ev, c));
    }), { cardActions: [ phasingActionEv ] }),
  ),
// DIVIDED: Rage
// DIVHERO: Wanda
// If a Hero was put into the KO pile this turn, you get +2 Attack.
// DIVIDED: Grief
// DIVHERO: Vision
// {PHASING}
// If a Master Strike was completed this turn, you get +2 Recruit.
  uc: makeDividedHeroCard(
    makeHeroCard("Wanda", "Rage", 5, u, 2, Color.COVERT, "Avengers", "D", ev => pastEvents('MOVECARD').has(ev => ev.to === gameState.ko && isHero(ev.what)) && addAttackEvent(ev, 2)),
    makeHeroCard("Vision", "Grief", 5, 2, u, Color.TECH, "Avengers", "D", ev => pastEvents('STRIKE').size && addRecruitEvent(ev, 2), { cardActions: [ phasingActionEv ] }),
  ),
// DIVIDED: Magic
// DIVHERO: Wanda
// You get +1 Attack for each other Hero with an odd-numbered cost you played this turn.
// DIVIDED: Science
// DIVHERO: Vision
// {PHASING}
// {POWER Tech} You get +2 Attack.
  u2: makeDividedHeroCard(
    makeHeroCard("Wanda", "Magic", 5, u, 1, Color.RANGED, "Avengers", "", ev => addAttackEvent(ev, pastEvents('PLAY').count(ev => isCostOdd(ev.what)))),
    makeHeroCard("Vision", "Science", 5, u, 2, Color.TECH, "Avengers", "D", ev => superPower(Color.TECH) && addAttackEvent(ev, 2), { cardActions: [ phasingActionEv ] }),
  ),
// {PHASING}
// {POWER Ranged} Reveal the top five cards of the Hero Deck. You may put one of them with an odd-numbered cost into your hand. You may KO one of them. Put the rest back in any order.
  ra: makeHeroCard("Wanda & Vision", "Odd Couple", 7, u, 4, Color.RANGED, "Avengers", "", ev => superPower(Color.RANGED) && revealHeroDeckEv(ev, 5, cards => {
    selectCardEv(ev, "Choose a card to put in your hand", cards.limit(isCostOdd), c => moveCardEv(ev, c, playerState.hand));
  }, false), { cardActions: [ phasingActionEv ] }),
},
{
  name: "Black Panther",
  team: "Avengers",
// {POWER Covert} Draw a card.
  c1: makeHeroCard("Black Panther", "Wakanda Forever", 2, u, 1, Color.COVERT | Color.TECH, "Avengers", "FD", ev => superPower(Color.COVERT) && drawEv(ev)),
// If you have all five Hero Classes, you get +3 Attack.
  c2: makeHeroCard("Black Panther", "Avengers Reassembled", 3, u, 2, Color.INSTINCT | Color.COVERT, "Avengers", "FD", ev => numClasses() === 5 && addAttackEvent(ev, 3)),
// [Instinct] {SACRIFICE}: KO up to two cards from your hand and/or discard pile.
  c3: makeHeroCard("Black Panther", "Great Many Lives Lost", 4, 2, u, Color.STRENGTH | Color.INSTINCT, "Avengers", "FD", ev => sacrificeEv(ev, Color.INSTINCT, () => {
    selectObjectsUpToEv(ev, "Choose a card to KO", 2, handOrDiscard(), c => KOEv(ev, c));
  })),
// You get +1 Recruit for each other multicolored Hero you have.
// {POWER Strength} You may have this card make all Attack instead of Recruit.
  uc: makeHeroCard("Black Panther", "Council of War", 5, 3, 0, Color.STRENGTH | Color.COVERT, "Avengers", "", ev => {
    const amount = yourHeroes().count(isMuliColor) + ev.source.printedRecruit;
    superPower(Color.STRENGTH) ? chooseOneEv(ev, "Make", ["Attack", () => addAttackEvent(ev, amount)], ["Recruit", () => addRecruitEvent(ev, amount)]) :
      addRecruitEvent(ev, amount);
  }, { customRecruitAndAttack: true }),
// Reveal the top card of your deck. If it's multicolored, draw it. Otherwise, put it back or discard it.
// {POWER Tech} You may KO that card.
  u2: makeHeroCard("Black Panther", "Vibranium Nanites", 6, u, 3, Color.TECH | Color.RANGED, "Avengers", "", ev => revealPlayerDeckEv(ev, 1, cards => {
    selectCardOptEv(ev, "Choose a card to KO", superPower(Color.TECH) ? cards : [], c => KOEv(ev, c), () => {
      cards.limit(isMuliColor).each(c => drawCardEv(ev, c));
      selectCardOptEv(ev, "Choose a card to discard", cards.limit(c => !isMuliColor(c)), c => discardEv(ev, c));
    });
  })),
// You get +2 Attack for each Hero Class you have.
  ra: makeHeroCard("Black Panther", "Fateful Return", 8, u, 0, Color.INSTINCT | Color.TECH, "Avengers", "", ev => addAttackEvent(ev, 2 * numClasses())),
},
{
  name: "Doctor Strange",
  team: "Avengers",
// {PHASING}
// {POWER Ranged} You get +2 Recruit.
  c1: makeHeroCard("Doctor Strange", "Open Portals", 2, 1, u, Color.RANGED, "Avengers", "FD", ev => superPower(Color.RANGED) && addRecruitEvent(ev, 2), { cardActions: [ phasingActionEv ] }),
// {POWER Instinct} Reveal the top card of the Villain Deck. If it's a Villain, you get +2 Attack.
  c2: makeHeroCard("Doctor Strange", "Defend This Dimension", 3, u, 2, Color.INSTINCT, "Avengers", "FD", ev => superPower(Color.INSTINCT) && revealVillainDeckEv(ev, 1, cards => {
    cards.has(isVillain) && addAttackEvent(ev, 2);
  })),
// {PHASING}
// Choose a Hero Class. Reveal the top card of your deck. If it's the Hero Class you named, draw it.
  c3: makeHeroCard("Doctor Strange", "Sift Futures", 4, u, 2, Color.INSTINCT | Color.RANGED, "Avengers", "D", ev => {
    chooseClassEv(ev, c => drawIfEv(ev, c));
  }, { cardActions: [ phasingActionEv ] }),
// {PHASING}
// [Ranged] {SACRIFICE}: Take another turn after this one. Don't play a card from the Villain Deck at the start of that turn.
  uc: makeHeroCard("Doctor Strange", "Invoke the Time Stone", 5, 2, u, Color.RANGED, "Avengers", "D", ev => {
    sacrificeEv(ev, Color.RANGED, () => {
      gameState.extraTurn = true;
      addFutureTrigger(() => turnState.villainCardsToPlay > 0 && turnState.villainCardsToPlay--);
    });
  }, { cardActions: [ phasingActionEv ] }),
// {POWER Instinct} Reveal the top card of the Villain Deck. If it's a Master Strike, KO that Strike, you get +3 Attack, and put a card from the Bystander Deck on top of the Villain Deck.
  u2: makeHeroCard("Doctor Strange", "Bind Evil", 6, u, 4, Color.INSTINCT, "Avengers", "", ev => superPower(Color.INSTINCT) && revealVillainDeckEv(ev, 1, cards => {
    cards.limit(isStrike).each(c => {
      KOEv(ev, c);
      addAttackEvent(ev, 3);
      gameState.bystanders.withTop(c => moveCardEv(ev, c, gameState.villaindeck));
    });
  })),
// [Instinct] {SACRIFICE}: Guess the name of the top card of the Villain Deck, then reveal it. If you guessed right, draw six cards.
  ra: makeHeroCard("Doctor Strange", "1 In 14,000,065", 7, u, 5, Color.INSTINCT, "Avengers", "", ev => {
    const names = gameState.villaindeck.deck.unique(c => c.cardName).sort().map(c => ({l: c, v: c}));
    chooseOptionEv(ev, "Choose a card name", names, name => {
      revealVillainDeckEv(ev, 1, cards => cards.has(c => c.cardName === name) && drawEv(ev, 6));
    });
  }),
},
{
  name: "Bruce Banner",
  team: "Avengers",
// [Strength] {SACRIFICE}: You get +3 Attack. You may KO card from your hand or discard pile.
  c1: makeHeroCard("Bruce Banner", "Burst of Rage", 1, u, 1, Color.STRENGTH, "Avengers", "", ev => sacrificeEv(ev, Color.STRENGTH, () => {
    addAttackEvent(ev, 3);
    selectCardOptEv(ev, "Choose a card to KO", handOrDiscard(), c => KOEv(ev, c));
  })),
// {POWER Tech Strength} You get +2 Attack.
  c2: makeHeroCard("Bruce Banner", "Brains and Brawn", 3, u, 2, Color.STRENGTH | Color.TECH, "Avengers", "FD", ev => superPower(Color.TECH, Color.STRENGTH) && addAttackEvent(ev, 2)),
// You may KO a Wound from you hand or discard pile. If you do, you get +2 Recruit.
  c3: makeHeroCard("Bruce Banner", "Hulkbuster Armor", 4, 2, u, Color.TECH, "Avengers", "FD", ev => {
    selectCardOptEv(ev, "Choose a Wound to KO", handOrDiscard().limit(isWound), c => {
      KOEv(ev, c);
      addRecruitEvent(ev, 2);
    });
  }),
// {POWER Strength} You may gain a Wound. If you do, KO up to two other cards from your hand and/or discard pile.
  uc: makeHeroCard("Bruce Banner", "Hulk Gets Smashed", 5, u, 2, Color.STRENGTH, "Avengers", "D", ev => superPower(Color.STRENGTH) && gameState.wounds.withTop(c => { 
    gainEv(ev, c);
    selectObjectsUpToEv(ev, "Choose a card to KO", 2, handOrDiscard().limit(c1 => c1 !== c), c => KOEv(ev, c));
  })),
// {POWER Tech} You get +1 Attack for each Henchman in your Victory Pile.
  u2: makeHeroCard("Bruce Banner", "Crush Puny Weaklings", 6, u, 3, Color.TECH, "Avengers", "F", ev => superPower(Color.TECH) && addAttackEvent(ev, playerState.victory.count(isHenchman))),
// [Tech] {SACRIFICE}: Gain up to one other Hero from the KO pile. Then combine your deck and discard pile. Put all those cards that cost 0 into your discard pile.
// Shuffle the rest into a new deck.
  ra: makeHeroCard("Bruce Banner", "Reverse The Snap", 7, u, 5, Color.TECH, "Avengers", "", ev => sacrificeEv(ev, Color.TECH, () => {
    selectCardOptEv(ev, "Choose a Hero to gain", gameState.ko.limit(isHero), c => gainEv(ev, c));
    cont(ev, () => {
      playerState.deck.limit(c => c.cost === 0).each(c => moveCardEv(ev, c, playerState.discard));
      playerState.discard.limit(c => c.cost > 0).each(c => moveCardEv(ev, c, playerState.deck));
    });
    cont(ev, () => playerState.deck.shuffle());
  })),
},
{
  name: "Captain Marvel",
  team: "Avengers",
// Draw a card.
// {ENDGAME} This card makes Attack instead of Recruit.
  c1: makeHeroCard("Captain Marvel", "Infused By the Tesseract", 3, 1, 0, Color.RANGED, "Avengers", "F", [
    ev => isEndgame(ev.source) ? addAttackEvent(ev, ev.source.printedRecruit) : addRecruitEvent(ev, ev.source.printedRecruit),
    ev => drawEv(ev),
  ], { customRecruitAndAttack: true }),
// {POWER Strength} You get +2 Recruit.
// {ENDGAME} This card makes all Attack instead of Recruit.
  c2: makeHeroCard("Captain Marvel", "Return From the Stars", 4, 2, 0, Color.STRENGTH, "Avengers", "FD", ev => {
    const amount = ev.source.printedRecruit + superPower(Color.STRENGTH) ? 2 : 0;
    isEndgame(ev.source) ? addAttackEvent(ev, amount) : addRecruitEvent(ev, amount);
  }, { customRecruitAndAttack: true }),
// For the rest of this turn, it is the Endgame for your Hero cards.
// If it was already the Endgame, you get +2 Attack.
  c3: makeHeroCard("Captain Marvel", "Turning Point", 5, u, 2, Color.STRENGTH | Color.RANGED, "Avengers", "D", ev => {
    isEndgame(ev.source) && addAttackEvent(ev, 2);
    addTurnSet('isEndgame', isHero, () => true);
  }),
// Draw a card.
// If you had already drawn any cards this turn, draw two cards instead.
  uc: makeHeroCard("Captain Marvel", "Dawning Hope", 2, u, u, Color.RANGED, "Avengers", "D", ev => drawEv(ev, pastEvents('DRAW').has(e => e.who === playerState) ? 2 : 1)),
// {POWER Ranged} You get +2 Attack.
  u2: makeHeroCard("Captain Marvel", "Moment of Destiny", 6, u, 4, Color.STRENGTH, "Avengers", "FD", ev => superPower(Color.RANGED) && addAttackEvent(ev, 2)),
// You get +1 Attack for each other [Ranged] and/or [Strength] card you played this turn.
// {ENDGAME} Instead, you get +2 Attack for each.
  ra: makeHeroCard("Captain Marvel", "Time to End It", 8, u, 5, Color.RANGED, "Avengers", "D",
    ev => addAttackEvent(ev, pastEvents('PLAY').count(ev2 => ev.source !== ev2.what && isColor(Color.RANGED | Color.STRENGTH)(ev2.what)) * (isEndgame(ev.source) ? 2 : 1))
  ),
},
]);
addHeroTemplates("Midnight Sons", [
{
  name: "Blade, Daywalker",
  team: "Marvel Knights",
// {PATROL Rooftops}: If it's empty, draw a card.
// {PATROL Sewers}: If it's empty, you get +1 Recruit.
  c1: makeHeroCard("Blade, Daywalker", "Where Monsters Lurk", 4, 2, u, Color.STRENGTH, "Marvel Knights", "D", [
    ev => patrolCity('ROOFTOPS', () => drawEv(ev)),
    ev => patrolCity('SEWERS', () => addRecruitEvent(ev, 1)) ]),
// You may move a Villain to another city space. If another Villain is already there, swap them.
// {MOONLIGHT} You get +1 Attack.
  c2: makeHeroCard("Blade, Daywalker", "Ride By Moonlight", 5, u, 3, Color.TECH, "Marvel Knights", "", [
    ev => {
      selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
        selectCardEv(ev, "Choose a new city space", cityAdjacent(v.location), dest => swapCardsEv(ev, v.location, dest));
      });
    },
    ev => moonlightPower() && addAttackEvent(ev, 1) ]),
// {PATROL Rooftops}: If it's empty, reveal the top card of your deck. You may KO it.
// {PATROL Sewers}: If it's empty, reveal the bottom card of your deck. You may KO it.
  uc: makeHeroCard("Blade, Daywalker", "Hunt High and Low", 3, u, 2, Color.INSTINCT, "Marvel Knights", "D", [
    ev => patrolCity('ROOFTOPS', () => revealPlayerDeckEv(ev, 1, cards => {
      selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c));
    })),
    ev => patrolCity('SEWERS', () => revealPlayerDeckBottomEv(ev, 1, cards => {
      selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c));
    }))
  ]),
// {SUNLIGHT} You get +2 Attack and you may put a Hero from the HQ on the bottom of the Hero Deck.
// {MOONLIGHT} {BLOOD FRENZY}
  ra: makeHeroCard("Blade, Daywalker", "Creature of Dawn and Dask", 7, u, 4, Color.STRENGTH, "Marvel Knights", "D", [
    ev => sunlightPower() && addAttackEvent(ev, 2),
    ev => sunlightPower() && selectCardOptEv(ev, "Choose a Hero to put on the bottom of the Hero Deck", hqHeroes(), c => moveCardEv(ev, c, gameState.herodeck, true)),
    ev => moonlightPower() && bloodFrenzyEv(ev)
 ]),
},
{
  name: "Elsa Bloodstone",
  team: "Marvel Knights",
// {PATROL Streets}: If it's empty, you get +2 Recruit. If it's not, you get +2 Attack.
// {POWER Instinct} Instead, you get both.
  c1: makeHeroCard("Elsa Bloodstone", "Axe of the Slayer", 3, 0, 0, Color.INSTINCT, "Marvel Knights", "D",
    ev => patrolCity('STREETS', () => {
      addRecruitEvent(ev, 2);
      superPower(Color.INSTINCT) && addAttackEvent(ev, 2);
    }, () => {
      addAttackEvent(ev, 2);
      superPower(Color.INSTINCT) && addRecruitEvent(ev, 2);
    })),
// {PATROL Streets}: If it's empty, you get +1 Attack.
// {POWER Tech} You get +1 Attack.
// GUN: 1
  c2: makeHeroCard("Elsa Bloodstone", "Silver Bullets", 4, u, 2, Color.TECH, "Marvel Knights", "GFD", [ ev => patrolCity('STREETS', () => addAttackEvent(ev, 1)), ev => superPower(Color.TECH) && addAttackEvent(ev, 1) ]),
// You may have a Villain or Mastermind <b>Hunt for Victims</b>. If it KOs a Bystander this way, you may KO a Hero from your hand or discard pile.
// {POWER Tech} If a Bystander is KO'd this way, you may also rescue that Bystander instead of putting it in the KO pile.
  uc: makeHeroCard("Elsa Bloodstone", "Stalk the Night Stalkers", 6, u, 3, Color.TECH, "Marvel Knights", "",
    ev => selectCardOptEv(ev, "Choose a Villain to Hunt for Victims", fightableCards(), c => {
      huntForVictimsEv(ev, c, b => {
        selectCardOptEv(ev, "Choose a Hero to KO", handOrDiscard().limit(isHero), c => KOEv(ev, c));
        superPower(Color.TECH) && chooseMayEv(ev, "Rescue the Bystander", () => rescueEv(ev, b));
      });
    })),
// {PATROL any city space}: If it's empty, you get the printed Recruit and Attack of the Hero in the HQ space under that city space.
// {TEAMPOWER Marvel Knights, Marvel Knights} {BLOOD FRENZY}
// GUN: 1
  ra: makeHeroCard("Elsa Bloodstone", "Vengeance of the Bloodstone Gem", 8, 0, 4, Color.INSTINCT, "Marvel Knights", "G", [
    ev => selectCardEv(ev, "Choose a city space", gameState.city, c => patrolDeck(c, () => {
      const h = c.below?.top;
      h?.printedRecruit && addRecruitEvent(ev, h.printedRecruit);
      h?.printedAttack && addAttackEvent(ev, h.printedAttack);
    })),
    ev => superPower("Marvel Knights", "Marvel Knights") && bloodFrenzyEv(ev) ]),
},
{
  name: "Morbius",
  team: "Marvel Knights",
// {MOONLIGHT} {BLOOD FRENZY}, gaining Recrcuit instead of Attack.
  c1: makeHeroCard("Morbius", "Mesmerize", 3, 2, u, Color.COVERT, "Marvel Knights", "FD", ev => moonlightPower() && bloodFrenzyRecruitEv(ev)),
// {POWER Covert} {BLOOD FRENZY}
// TRANSFORMED by a blood transfusion from bats, Morbius the Living Vampire now has all vampiric strengths and only one desperate, thirsting weakness.
  c2: makeHeroCard("Morbius", "Insatiable Craving", 5, u, 2, Color.COVERT, "Marvel Knights", "D", ev => superPower(Color.COVERT) && bloodFrenzyEv(ev)),
// {SUNLIGHT} You may gain a Wound. If you do, you get +2 Attack.
// {MOONLIGHT} You may KO a Wound from your hand or discard pile. If you do, you get +2 Attack.
  uc: makeHeroCard("Morbius", "Scalded By Sunlight", 4, u, 2, Color.STRENGTH, "Marvel Knights", "D", [
    ev => sunlightPower() && chooseMayEv(ev, "Gain a Wound", () => { gainEv(ev, gameState.wounds.top); addAttackEvent(ev, 2); }),
    ev => moonlightPower() && KOHandOrDiscardEv(ev, isWound, () => addAttackEvent(ev, 2)) ]),
// {POWER Covert} {BLOOD FRENZY}, drawing that many cards instead of gaining Attack.
  ra: makeHeroCard("Morbius", "It's Morbin' Time!", 7, u, 3, Color.COVERT, "Marvel Knights", "", ev => superPower(Color.COVERT) && drawEv(ev, bloodFrenzyAmount())),
},
{
  name: "Werewolf by Night",
  team: "Marvel Knights",
// {SUNLIGHT} You get +1 Attack.
// {MOONLIGHT} Draw a card.
  c1: makeHeroCard("Werewolf by Night", "Starlit Path", 2, u, 1, Color.INSTINCT, "Marvel Knights", "FD", [
    ev => sunlightPower() && addAttackEvent(ev, 1), ev => moonlightPower() && drawEv(ev) ]),
// {SUNLIGHT} You may put a Hero from the HQ on the bottom of the Hero Deck.
// {MOONLIGHT} Whenever you defeat a Villain or Mastermind this turn, you may KO one of your Heroes.
  c2: makeHeroCard("Werewolf by Night", "Snarling Fangs", 3, u, 2, Color.STRENGTH, "Marvel Knights", "D", [
    ev => sunlightPower() && selectCardOptEv(ev, "Choose a Hero to put on the bottom of the Hero Deck", hqHeroes(), c => moveCardEv(ev, c, gameState.herodeck, true)),
    ev => moonlightPower() && addTurnTrigger('DEFEAT', ev => isEnemy(ev.what), () => {
        selectCardOptEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c));
    })]),
// {SUNLIGHT} You get +3 Recruit.
// {MOONLIGHT} {BLOOD FRENZY}
// {POWER Instinct} Instead, you get both.
  uc: makeHeroCard("Werewolf by Night", "Release the Beast", 5, 0, 0, Color.INSTINCT, "Marvel Knights", "", [
    ev => (superPower(Color.INSTINCT) || sunlightPower()) && addRecruitEvent(ev, 3),
    ev => (superPower(Color.INSTINCT) || moonlightPower()) && bloodFrenzyEv(ev),
  ]),
// {MOONLIGHT} Whenever you defeat a Villain or Mastermind this turn, you may rescue a Bystander or gain a Hero from the HQ or Sidekick Deck whose cost is less than that Enemy's Attack.
// {POWER Instinct} You get +2 Attack.
  ra: makeHeroCard("Werewolf by Night", "Track the Captives", 7, u, 5, Color.INSTINCT, "Marvel Knights", "D", [
    ev => moonlightPower() && addTurnTrigger('DEFEAT', ev => isEnemy(ev.what), ev => {
      const max = ev.parent.what.defense;
      const options: [string, (() => void)][] = [["Rescue a Bystander", () => rescueEv(ev)]];
      max >= 2 && options.push(["Gain a Sidekick", () => gainSidekickEv(ev)]);
      hqHeroes().has(c => c.cost < max) && options.push(["Gain a Hero", () => selectCardOptEv(ev, "Choose a Hero to gain", hqHeroes().limit(c => c.cost < max), c => gainEv(ev, c))]);
      options.push(["Decline", () => {}]);
      chooseOneEv(ev, "Choose Track the Captives bonus", ...options);
    }),
    ev => superPower(Color.INSTINCT) && addAttackEvent(ev, 2) ]),
},
{
  name: "Wong, Master of the Mystic Arts",
  team: "Marvel Knights",
// {PATROL Bridge}: If it's empty, draw a card.
  c1: makeHeroCard("Wong, Master of the Mystic Arts", "Bridge Between Dimensions", 2, u, 1, Color.RANGED, "Marvel Knights", "FD", ev => patrolCity('BRIDGE', () => drawEv(ev))),
// {SUNLIGHT} You get +1 Attack.
// {POWER Ranged} You get +1 Attack.
  c2: makeHeroCard("Wong, Master of the Mystic Arts", "Searing Shards of Sunlight", 4, u, 2, Color.RANGED, "Marvel Knights", "FD", [ ev => sunlightPower() && addAttackEvent(ev, 1), ev => superPower(Color.RANGED) && addAttackEvent(ev, 1) ]),
// {PATROL Bridge}: If it's empty, draw two cards. If it's not, you get +5 Attack usable only to fight Villains on the Bridge.
  uc: makeHeroCard("Wong, Master of the Mystic Arts", "Seal the Rift", 5, u, 0, Color.COVERT, "Marvel Knights", "",
    ev => patrolCity('BRIDGE', () => drawEv(ev, 2), () => addAttackSpecialEv(ev, c => isVillain(c) && isLocation(c.location, 'BRIDGE'), 5))),
// Once this turn, you may fight the top card of the Bystander Deck as if it were a 4 Attack "Darkhold Demon" Villain with
// "<b>Fight</b>: KO up to two of your Heroes. Rescue this card as a Bystander."
// {SUNLIGHT} You get +2 Attack.
  ra: makeHeroCard("Wong, Master of the Mystic Arts", "Face Your Demons", 8, u, 6, Color.RANGED, "Marvel Knights", "D", [
    ev => {
      let done = false;
      const cond: (c: Card) => boolean = c => !done && c === gameState.bystanders.top
      villainify("Darkhold Demon", cond, 4, ev => {
        selectObjectsEv(ev, "Choose a Hero to KO", 2, yourHeroes(), c => KOEv(ev, c));
        rescueEv(ev, ev.source);
        done = true;
      });
    },
    ev => sunlightPower() && addAttackEvent(ev, 2) ]),
},
]);
addHeroTemplates("Marvel Studios What If...?", [
{
  name: "Apocalyptic Black Widow",
  team: "Guardians of the Multiverse",
// If you have at least 4 Bystanders in your Victory Pile, you get +2 Recruit.
// GUN: 1
  c1: makeHeroCard("Apocalyptic Black Widow", "Humanity's Final Hope", 3, 2, u, Color.TECH, "Guardians of the Multiverse", "GFD",
    ev => playerState.victory.count(isBystander) >= 4 && addRecruitEvent(ev, 2)),
// Draw a card.
// You may have a Villain capture a Bystander.
// GUN: 1
  c2: makeHeroCard("Apocalyptic Black Widow", "Plant Hidden Asset", 4, 1, u, Color.COVERT, "Guardians of the Multiverse", "GF", [
    ev => drawEv(ev),
    ev => selectCardOptEv(ev, "Choose a Villain to capture a Bystander", villains(), v => captureEv(ev, v))
  ]),
// {POWER Tech} You get +2 Attack.
  c3: makeHeroCard("Apocalyptic Black Widow", "Precision Strike", 5, u, 3, Color.TECH, "Guardians of the Multiverse", "FD", ev => superPower(Color.TECH) && addAttackEvent(ev, 2)),
// Draw a card.
// {POWER Covert} {LIBERATE 3}
// GUN: 1
  uc: makeHeroCard("Apocalyptic Black Widow", "Relentless", 2, u, 0, Color.COVERT, "Guardians of the Multiverse", "GFD", [ ev => drawEv(ev), ev => superPower(Color.COVERT) && liberateEv(ev, 3) ]),
// {WHAT IF} {LIBERATE 4}
  u2: makeHeroCard("Apocalyptic Black Widow", "The Last Avenger", 6, u, 3, Color.TECH, "Guardians of the Multiverse", "F", ev => whatIfEv(ev, () => liberateEv(ev, 4))),
// <b>Liberate</b> equal to the number of Bystanders in your Victory Pile.
// GUN: 1
  ra: makeHeroCard("Apocalyptic Black Widow", "Time to Save the Multiverse", 8, u, 4, Color.COVERT, "Guardians of the Multiverse", "GF",
    ev => liberateEv(ev, playerState.victory.count(isBystander))),
},
{
  name: "Captain Carter",
  team: "Guardians of the Multiverse",
// {WHAT IF} You get +2 Recruit and +2 Attack.
  c1: makeHeroCard("Captain Carter", "Super Soldier Serum", 2, 0, 0, Color.STRENGTH, "Guardians of the Multiverse", "FD", ev => whatIfEv(ev, () => {
    addRecruitEvent(ev, 2);
    addAttackEvent(ev, 2);
  })),
// You get +1 Recruit for each different printed Recruit number among all your Heroes.
// <i>(1+ is the same printed number as 1.)</i>
  c2: makeHeroCard("Captain Carter", "Wartime Logistics", 3, 1, u, Color.INSTINCT, "Guardians of the Multiverse", "", ev => {
    addRecruitEvent(ev, yourHeroes().limit(c => c.printedRecruit !== undefined).uniqueCount(c => c.printedRecruit));
  }),
// You get +1 Attack for each different printed Attack number among all your Heroes.
// <i>(1+ is the same printed number as 1.)</i>
  c3: makeHeroCard("Captain Carter", "Coordinated Assault", 4, u, 1, Color.TECH, "Guardians of the Multiverse", "", ev => {
    addAttackEvent(ev, yourHeroes().limit(c => c.printedAttack !== undefined).uniqueCount(c => c.printedAttack));
  }),
// Once per turn, when a player gains a Wound, you may reveal this card to return that Wound to the Wound Stack. If you do, the player whose turn it is gets {LIBERATE 3}.
  uc: makeHeroCard("Captain Carter", "The Shield of Britain", 5, u, 3, Color.TECH, "Guardians of the Multiverse", "", [], { trigger:
    youMayRevealThisInsteadEv("GAIN", (ev, source) => isWound(ev.what) && !countPerTurn("onceperturntrigger", source), "return the Wound", ev => {
      incPerTurn("onceperturntrigger", ev.source);
      returnToStackEv(ev, gameState.wounds, ev.parent.what);
      liberateEv(ev, 3);
    })
  }),
// To play this, you must put another card from your hand on top of your deck.
  u2: makeHeroCard("Captain Carter", "Give Them All We've Got", 6, u, 5, Color.STRENGTH, "Guardians of the Multiverse", "F", [], { playCost: 1, playCostType: "TOPDECK" }),
// You get +1 Recruit for each different printed Recruit number among all your Heroes.
// You get +1 Attack for each different printed Attack number among all your Heroes.
// <i>(1+ is the same printed number as 1.)</i>
  ra: makeHeroCard("Captain Carter", "Icon of Hope", 8, 2, 4, Color.STRENGTH, "Guardians of the Multiverse", "D", [
    ev => addRecruitEvent(ev, yourHeroes().limit(c => c.printedRecruit !== undefined).uniqueCount(c => c.printedRecruit)),
    ev => addAttackEvent(ev, yourHeroes().limit(c => c.printedAttack !== undefined).uniqueCount(c => c.printedAttack))
  ]),
},
{
  name: "Doctor Strange Supreme",
  team: "Guardians of the Multiverse",
// [Instinct] {SOULBIND} You get +Recruit equal to that Villain's printed VP.
  c1: makeHeroCard("Doctor Strange Supreme", "Seize Infernal Power", 3, 2, u, Color.INSTINCT, "Guardians of the Multiverse", "FD", ev => {
    soulbindEv(ev, Color.INSTINCT, c => addRecruitEvent(ev, c.vp));
  }),
// [Ranged] {SOULBIND} You get +Attack equal to that Villain's printed VP.
  c2: makeHeroCard("Doctor Strange Supreme", "Summon Demon Minions", 4, u, 2, Color.RANGED, "Guardians of the Multiverse", "FD", ev => {
    soulbindEv(ev, Color.RANGED, c => addAttackEvent(ev, c.vp));
  }),
// {WHAT IF} You get +2 Attack and you may KO a Wound from your hand or from any player's discard pile.
  c3: makeHeroCard("Doctor Strange Supreme", "Wards of the Vishanti", 5, u, 3, Color.RANGED, "Guardians of the Multiverse", "D", ev => whatIfEv(ev, () => {
    addAttackEvent(ev, 2);
    selectCardOptEv(ev, "Choose a Wound to KO", [...playerState.hand.deck, ...gameState.players.flatMap(p => p.discard.deck)].limit(isWound), c => KOEv(ev, c));
  })),
// Draw a card.
// [Instinct] {SOULBIND a Bystander or Villain} You get +2 Attack. If it's a Special Bystander, you may do its Rescue effect.
  uc: makeHeroCard("Doctor Strange Supreme", "To Save Christine", 2, u, 0, Color.INSTINCT, "Guardians of the Multiverse", "D", [ ev => drawEv(ev), ev => {
    soulbindEv(ev, Color.INSTINCT, c => {
      addAttackEvent(ev, 2);
      isBystander(c) && chooseMayEv(ev, "Do the Bystander's Rescue effect", () => pushEffects(ev, c, 'rescue', c.rescue, { who: playerState }));
    }, c => isVillain(c) || isBystander(c));
  } ]),
// Reveal the top three cards of your deck. Draw one of them, KO one, and put one back.
  u2: makeHeroCard("Doctor Strange Supreme", "Break the Absolute Point in Time", 6, u, u, Color.INSTINCT, "Guardians of the Multiverse", "F", ev => {
    revealThreeEv(ev, 'DRAW', 'KO');
  }),
// [Instinct] {SOULBIND} Draw cards equal to that Villain's printed VP.
  ra: makeHeroCard("Doctor Strange Supreme", "Stygian Communion", 8, u, 3, Color.INSTINCT, "Guardians of the Multiverse", "F", ev => {
    soulbindEv(ev, Color.INSTINCT, c => drawEv(ev, c.vp));
  }),
},
{
  name: "Gamora, Destroyer of Thanos",
  team: "Guardians of the Multiverse",
// Draw a card.
// {POWER Covert} You get +2 Recruit.
  c1: makeHeroCard("Gamora, Destroyer of Thanos", "Assassin's Stealth", 2, 0, u, Color.COVERT, "Guardians of the Multiverse", "FD", [ ev => drawEv(ev), ev => superPower(Color.COVERT) && addRecruitEvent(ev, 2) ]),
// Draw two cards. Then put a card from your hand on top of your deck.
  c2: makeHeroCard("Gamora, Destroyer of Thanos", "Tactical Insight", 3, u, 1, Color.COVERT, "Guardians of the Multiverse", "F", [
    ev => drawEv(ev, 2),
    ev => selectCardEv(ev, "Choose a card to topdeck", playerState.hand.deck, c => moveCardEv(ev, c, playerState.deck, true)),
  ]),
// You get +1 Attack for each card you drew this turn.
  c3: makeHeroCard("Gamora, Destroyer of Thanos", "Wield the Blade of Thanos", 4, u, 1, Color.INSTINCT, "Guardians of the Multiverse", "F", ev => {
    addAttackEvent(ev, pastEvents('DRAW').count(e => e.who === playerState));
  }),
// {WHAT IF} Draw two cards.
  uc: makeHeroCard("Gamora, Destroyer of Thanos", "Titanicide", 5, u, 2, Color.COVERT, "Guardians of the Multiverse", "FD", ev => whatIfEv(ev, () => drawEv(ev, 2))),
// [Instinct] {SOULBIND} KO a card from your hand or discard pile.
  u2: makeHeroCard("Gamora, Destroyer of Thanos", "Destroy an Infinity Stone", 6, u, 3, Color.INSTINCT, "Guardians of the Multiverse", "F", ev => {
    soulbindEv(ev, Color.INSTINCT, c => selectCardEv(ev, "Choose a card to KO", handOrDiscard(), c => KOEv(ev, c)));
  }),
// Guardians of the Galaxy {SOULBIND six Villains} You get <b>+&infin;</b> Attack, usable only for a single fight.
  ra: makeHeroCard("Gamora, Destroyer of Thanos", "The Infinity Crusher", 8, u, 5, Color.TECH, "Guardians of the Multiverse", "F", ev => {
    soulbindEv(ev, "Guardians of the Galaxy", () => addAttackSpecialEv(ev, () => true, Infinity), u, 6);
  }),
},
{
  name: "Killmonger, Spec Ops",
  team: "Guardians of the Multiverse",
// You get +1 Recruit for each different Villain Group in your Victory Pile.
  c1: makeHeroCard("Killmonger, Spec Ops", "Hunt New Prey", 2, 1, u, Color.STRENGTH | Color.TECH, "Guardians of the Multiverse", "FD", ev => {
    addRecruitEvent(ev, playerState.victory.limit(c => !!c.villainGroup).uniqueCount(c => c.villainGroup));
  }),
// {POWER Tech Strength} You get +3 Attack.
  c2: makeHeroCard("Killmonger, Spec Ops", "No Matter the Price", 4, u, 2, Color.TECH, "Guardians of the Multiverse", "FD", ev => superPower(Color.TECH, Color.STRENGTH) && addAttackEvent(ev, 3)),
// {POWER Strength} You get +1 Attack for each different Villain Group in your Victory Pile.
  c3: makeHeroCard("Killmonger, Spec Ops", "Violence Leaves Scars", 5, u, 3, Color.STRENGTH, "Guardians of the Multiverse", "F", ev => {
    superPower(Color.STRENGTH) && addAttackEvent(ev, playerState.victory.limit(c => !!c.villainGroup).uniqueCount(c => c.villainGroup));
  }),
// {WHAT IF} {LIBERATE 3}
  uc: makeHeroCard("Killmonger, Spec Ops", "Hostage Rescue", 3, u, 2, Color.STRENGTH, "Guardians of the Multiverse", "FD", ev => whatIfEv(ev, () => liberateEv(ev, 3))),
// Each Villain worth 3 VP or more captures a Bystander.
// {POWER Tech} {LIBERATE 2}
  u2: makeHeroCard("Killmonger, Spec Ops", "Plot a Betrayal", 6, u, 4, Color.TECH, "Guardians of the Multiverse", "FD", [ ev => {
    villains().limit(c => c.vp >= 3).each(c => captureEv(ev, c));
  }, ev => superPower(Color.TECH) && liberateEv(ev, 2) ]),
// You get +1 Attack for each different Villain Group in your Victory Pile.
// {POWER Strength} {LIBERATE 2} for each Mastermind Tactic in your Victory Pile.
  ra: makeHeroCard("Killmonger, Spec Ops", "I'm the King, Baby!", 7, u, 4, Color.STRENGTH, "Guardians of the Multiverse", "D", [
    ev => addAttackEvent(ev, playerState.victory.limit(c => !!c.villainGroup).uniqueCount(c => c.villainGroup)),
    ev => superPower(Color.STRENGTH) && liberateEv(ev, 2 * playerState.victory.count(isTactic)) ]),
},
{
  name: "Party Thor",
  team: "Guardians of the Multiverse",
// To play this, you must put another card from your hand on top of your deck.
  c1: makeHeroCard("Party Thor", "Forecast Says Thunder", 2, 3, u, Color.RANGED, "Guardians of the Multiverse", "FD", [], { playCost: 1, playCostType: "TOPDECK" }),
// Whenever you recruit a Hero that costs 5 or more this turn, you get +3 Attack.
  c2: makeHeroCard("Party Thor", "Worthy Challenge", 3, u, 2, Color.STRENGTH, "Guardians of the Multiverse", "FD", ev => {
    addTurnTrigger('RECRUIT', ev => isHero(ev.what) && ev.what.cost >= 5, () => addAttackEvent(ev, 3));
  }),
// Whenever you recruit a Hero that costs 5 or more this turn, reveal the top card of your deck and you may KO it.
  c3: makeHeroCard("Party Thor", "Destructive Feast", 5, 3, u, Color.STRENGTH, "Guardians of the Multiverse", "", ev => {
    addTurnTrigger('RECRUIT', ev => isHero(ev.what) && ev.what.cost >= 5, () => {
      revealPlayerDeckEv(ev, 1, cards => {
        selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c));
      });
    });
  }),
// {POWER Ranged} {XDRAMPAGE Party}. If any players gained a Wound this way, you get +3 Attack.
  uc: makeHeroCard("Party Thor", "Asgardian Rager", 5, u, 3, Color.RANGED, "Guardians of the Multiverse", "", ev => {
    let wounded = false;
    superPower(Color.RANGED) && xdRampageEv(ev, "Party", () => wounded = true);
    cont(ev, () => wounded && addAttackEvent(ev, 3));
  }),
// {WHAT IF} You get +Attack equal to the cost of the Hero you revealed this way.
  u2: makeHeroCard("Party Thor", "Only Son", 6, u, 3, Color.STRENGTH, "Guardians of the Multiverse", "F", ev => whatIfEv(ev, c => addAttackEvent(ev, c.cost))),
// Whenever you recruit a Hero that costs 5 or more this turn, you get +Attack equal to that Hero's cost.
  ra: makeHeroCard("Party Thor", "Worthy of the Lightning", 7, 5, 0, Color.RANGED, "Guardians of the Multiverse", "", ev => {
    addTurnTrigger('RECRUIT', ev => isHero(ev.what) && ev.what.cost >= 5, ev => addAttackEvent(ev, ev.parent.what.cost));
  }),
},
{
  name: "Star-Lord T’Challa",
  team: "Guardians of the Multiverse",
// Choose one: You get <b>Empowered</b> by [Strength], or you get <b>Empowered</b> by [Covert].
// {POWER Strength Covert} Draw a card.
// GUN: 1
  c1: makeHeroCard("Star-Lord T’Challa", "Fight or Flight", 2, u, 0, Color.STRENGTH | Color.COVERT, "Guardians of the Multiverse", "GD", [ ev => {
    chooseOneEv(ev, "Choose a class to get Empowered by", ["Strength", () => empowerEv(ev, Color.STRENGTH)], ["Covert", () => empowerEv(ev, Color.COVERT)]);
  }, ev => superPower(Color.STRENGTH, Color.COVERT) && drawEv(ev) ]),
// {WHAT IF} You get +3 Recruit.
  c2: makeHeroCard("Star-Lord T’Challa", "Interstellar Adventures", 3, 2, u, Color.COVERT | Color.TECH, "Guardians of the Multiverse", "FD", ev => whatIfEv(ev, () => addRecruitEvent(ev, 3))),
// Look at the top two cards of your deck. Discard any number of them and put the rest back in any order.
// GUN: 1
  c3: makeHeroCard("Star-Lord T’Challa", "Plan the Heist", 4, u, 2, Color.INSTINCT | Color.COVERT, "Guardians of the Multiverse", "GD", ev => {
    revealPlayerDeckEv(ev, 2, cards => selectObjectsAnyEv(ev, "Choose cards to discard", cards, c => discardEv(ev, c)));
  }),
// {WHAT IF} You may KO a card from your hand or discard pile.
  uc: makeHeroCard("Star-Lord T’Challa", "Unexpected Exit", 5, u, 3, Color.STRENGTH | Color.INSTINCT, "Guardians of the Multiverse", "F", ev => whatIfEv(ev, () => KOHandOrDiscardEv(ev, undefined))),
// {WHAT IF} You get <b>Empowered</b> by the Hero Classes of the card you revealed this way.
// GUN: 1
  u2: makeHeroCard("Star-Lord T’Challa", "Cross the Multiverse", 6, u, 4, Color.STRENGTH | Color.RANGED, "Guardians of the Multiverse", "G", ev => whatIfEv(ev, c => empowerEv(ev, c.color))),
// Choose any number of Heroes in the HQ. Put them on the bottom of the Hero Deck.
// You get <b>Empowered</b> by multicolored cards.
  ra: makeHeroCard("Star-Lord T’Challa", "Colliding Dreams", 7, u, 4, Color.TECH | Color.RANGED, "Guardians of the Multiverse", "", [ ev => {
    selectObjectsAnyEv(ev, "Choose Heroes to put on the bottom of the Hero Deck", hqHeroes(), c => moveCardEv(ev, c, gameState.herodeck, true));
  }, ev => empowerEv(ev, isMuliColor) ]),
},
{
  name: "Uatu, The Watcher",
  team: "Guardians of the Multiverse",
// Draw a card. Then put a card from your hand on top of your deck.
// {POWER Covert} You get +1 Recruit.
  c1: makeHeroCard("Uatu, The Watcher", "Diverging Timestreams", 2, 1, u, Color.COVERT, "Guardians of the Multiverse", "FD", [
    ev => drawEv(ev),
    ev => selectCardEv(ev, "Choose a card to topdeck", playerState.hand.deck, c => moveCardEv(ev, c, playerState.deck)),
    ev => superPower(Color.COVERT) && addRecruitEvent(ev, 1) ]),
// {WHAT IF} You may KO a card from your hand or discard pile.
  c2: makeHeroCard("Uatu, The Watcher", "Another Dimension Crumbles", 3, 2, u, Color.COVERT, "Guardians of the Multiverse", "FD", ev => whatIfEv(ev, () => KOHandOrDiscardEv(ev, undefined))),
// {WHAT IF} You get +2 Attack.
  c3: makeHeroCard("Uatu, The Watcher", "Break the Oath", 4, u, 2, Color.RANGED, "Guardians of the Multiverse", "FD", ev => whatIfEv(ev, () => addAttackEvent(ev, 2))),
// {POWER Covert} Choose a Hero Name. You are <b>Empowered</b> by that Hero Name.
  uc: makeHeroCard("Uatu, The Watcher", "Anoint a Champion", 5, u, 2, Color.COVERT, "Guardians of the Multiverse", "FD", ev => {
    superPower(Color.COVERT) && chooseOptionEv(ev, "Choose a Hero Name", splitDivided(hqHeroes()).unique(c => c.heroName).map(v => ({l:v, v})), name => {
      empowerEv(ev, isHeroName(name));
    });
  }),
// [Ranged] {SOULBIND} You get +2 Attack and you may do that Villain's Fight effect.
  u2: makeHeroCard("Uatu, The Watcher", "History Repeats", 6, u, 3, Color.RANGED, "Guardians of the Multiverse", "FD", ev => {
    soulbindEv(ev, Color.RANGED, c => {
      addAttackEvent(ev, 2);
      chooseMayEv(ev, "Do the Villain's Fight effect", () => pushEffects(ev, c, 'fight', c.fight)); // TODO abstract push effect use
    });
  }),
// {WHAT IF} Choose a Team. (e.g. Guardians of the Multiverse, X-Men, Avengers) You are <b>Empowered</b> by that Team.
  ra: makeHeroCard("Uatu, The Watcher", "Convoke the Guardians", 7, u, 5, Color.RANGED, "Guardians of the Multiverse", "", ev => whatIfEv(ev, () => {
    chooseOptionEv(ev, "Choose a Team", splitDivided(hqHeroes()).unique(c => c.team).map(v => ({l:v, v})), team => empowerEv(ev, team)); // TODO divided check both sides for team
  })),
},
]);
addHeroTemplates("Ant-Man and the Wasp", [
{
  name: "Ant Army",
  team: "(Unaffiliated)",
// {SIZECHANGING INSTINCT}
// {ANTICS} You get +2 Attack.
  c1: makeHeroCard("Ant Army", "Antagonize", 2, u, 1, Color.INSTINCT, u, "FD", ev => anticsEv(ev, () => addAttackEvent(ev, 2)), { sizeChanging: Color.INSTINCT }),
// {SIZECHANGING TECH}
// {ANTICS} Draw a card.
  c2: makeHeroCard("Ant Army", "Anticipate", 4, 2, u, Color.TECH, u, "FD", ev => anticsEv(ev, () => drawEv(ev)), { sizeChanging: Color.TECH }),
// {HEIST} Draw a card.
  c3: makeHeroCard("Ant Army", "Up the Ante", 1, u, 1, Color.INSTINCT, u, "F", [], { heist: ev => drawEv(ev) }),
// {USIZECHANGING TECH 3}
// {POWER Tech} You get +3 Attack.
  uc: makeHeroCard("Ant Army", "Anti-Tank Weapons", 6, u, 2, Color.TECH, u, "FD", ev => superPower(Color.TECH) && addAttackEvent(ev, 3), { uSizeChanging: { color: Color.TECH, amount: 3 } }),
// {USIZECHANGING TECH 3}
// {ANTICS} You get +2 Recruit and +2 Attack.
  u2: makeHeroCard("Ant Army", "Antiproton Experiments", 5, 1, 1, Color.TECH, u, "FD", ev => anticsEv(ev, () => {
    addRecruitEvent(ev, 2);
    addAttackEvent(ev, 2);
  }), { uSizeChanging: { color: Color.TECH, amount: 3 } }),
// {USIZECHANGING TECH 5}
// {ANTICS} You get +2 Attack.
// {HEIST} You get +2 Attack. If the card revealed from the Villain Deck is a Scheme Twist, you get another +2 Attack and you may shuffle that deck.
  ra: makeHeroCard("Ant Army", "Revolutionary Anthem", 9, u, 4, Color.TECH, u, "D", ev => anticsEv(ev, () => addAttackEvent(ev, 2)), { uSizeChanging: { color: Color.TECH, amount: 5 }, heist: ev => {
    addAttackEvent(ev, 2);
    if (isTwist(ev.what)) {
      addAttackEvent(ev, 2);
      chooseMayEv(ev, "Shuffle the Villain Deck", () => gameState.villaindeck.shuffle());
    }
  }}),
},
{
  name: "Ant-Man",
  team: "Avengers",
// {SIZECHANGING COVERT}
// {ANTICS} You get +2 Recruit.
  c1: makeHeroCard("Ant-Man", "Hitch a Ride", 2, 1, u, Color.COVERT, "Avengers", "FD", ev => anticsEv(ev, () => addRecruitEvent(ev, 2)), { sizeChanging: Color.COVERT }),
// {SIZECHANGING STRENGTH}
// Reveal the top card of your deck. If it's [Strength] or has <b>Size-Changing</b>, draw it.
  c2: makeHeroCard("Ant-Man", "Look Out for the Little Guy!", 3, u, 1, Color.STRENGTH, "Avengers", "", ev => drawIfEv(ev, c => isColor(Color.STRENGTH)(c) || !!c.sizeChanging || !!c.uSizeChanging), { sizeChanging: Color.STRENGTH }),
// {SIZECHANGING COVERT}
// {POWER Covert} All Villains and the Mastermind get -1 Attack this turn.
  c3: makeHeroCard("Ant-Man", "Shrink Away", 4, u, 2, Color.COVERT, "Avengers", "FD", ev => superPower(Color.COVERT) && addTurnMod('defense', isEnemy, -1), { sizeChanging: Color.COVERT }),
// {USIZECHANGING STRENGTH 3}
// {ANTICS} You may KO a card from your hand or discard pile.
  uc: makeHeroCard("Ant-Man", "Bug Swarm", 5, 2, u, Color.STRENGTH, "Avengers", "FD", ev => anticsEv(ev, () => KOHandOrDiscardEv(ev, undefined)), { uSizeChanging: { color: Color.STRENGTH, amount: 3 } }),
// {USIZECHANGING COVERT 3}
// {HEIST} Draw two cards.
  u2: makeHeroCard("Ant-Man", "Tiny Little Risk", 6, u, 2, Color.COVERT, "Avengers", "FD", [], { uSizeChanging: { color: Color.COVERT, amount: 3 }, heist: ev => drawEv(ev, 2) }),
// {USIZECHANGING STRENGTH 5}
// You get +1 Attack for each card you played this turn that's [Strength] and/or has <b>Size-Changing</b>.
  ra: makeHeroCard("Ant-Man", "Giant-Man", 9, u, 6, Color.STRENGTH, "Avengers", "", ev => {
    addAttackEvent(ev, pastEvents('PLAY').count(ev => isColor(Color.STRENGTH)(ev.what) || !!ev.what.sizeChanging || !!ev.what.uSizeChanging)); // TODO -1 for self?
  }, { uSizeChanging: { color: Color.STRENGTH, amount: 5 } }),
},
{
  name: "Cassie Lang",
  team: "Avengers",
// {SIZECHANGING STRENGTH}
// {POWER Strength} You may defeat a Villain worth 2 VP or less.
  c1: makeHeroCard("Cassie Lang", "Colossal Stomp", 5, u, 2, Color.STRENGTH, "Avengers", "FD", ev => superPower(Color.STRENGTH) && selectCardOptEv(ev, 
    "Choose a Villain to defeat", villains().limit(c => c.vp <= 2), c => defeatEv(ev, c)
  ), { sizeChanging: Color.STRENGTH }),
// {SIZECHANGING STRENGTH}
// Choose a player. If that player reveals a card that costs 5 or more, that player draws a card.
  c2: makeHeroCard("Cassie Lang", "Giant Hug", 4, 2, u, Color.STRENGTH, "Avengers", "D", ev => {
    choosePlayerEv(ev, p => revealAndEv(ev, c => c.cost >= 5, () => drawEv(ev, 1, p), p));
  }, { sizeChanging: Color.STRENGTH }),
// {SIZECHANGING TECH}
// To play this, you must discard a card. Then, if you have a Villain in your Victory Pile worth 2 VP or less, draw a card.
  c3: makeHeroCard("Cassie Lang", "Start Small", 2, 2, u, Color.TECH, "Avengers", "D", ev => {
    playerState.victory.has(c => c.vp <= 2) && drawEv(ev);
  }, { sizeChanging: Color.TECH, playCost: 1, playCostType: "DISCARD" }),
// {USIZECHANGING STRENGTH 3}
// {POWER Strength} You may do the Fight effect of a Villain in your Victory Pile worth 2 VP or less.
  uc: makeHeroCard("Cassie Lang", "Learn from the Past", 6, u, 3, Color.STRENGTH, "Avengers", "D", ev => superPower(Color.STRENGTH) && selectCardOptEv(ev,
    "Choose a Villain to do the Fight effect", playerState.victory.limit(c => c.vp <= 2), c => pushEffects(ev, c, 'fight', c.fight)
  ), { uSizeChanging: { color: Color.STRENGTH, amount: 3 } }),
// {USIZECHANGING TECH 3}
// {POWER Tech} Reveal the top card of the Villain Deck. If it's a Bystander, rescue it. If it's a Villain worth 2 VP or less, you may fight it this turn. If you rescue or defeat that card, don't play a card from the Villain Deck next turn.
  u2: makeHeroCard("Cassie Lang", "Quantum Beacon", 5, u, 3, Color.TECH, "Avengers", "D", ev => superPower(Color.TECH) && revealVillainDeckEv(ev, 1, cards => cards.each(c => {
    if (isBystander(c)) {
      rescueEv(ev, c);
      addFutureTrigger(ev => turnState.villainCardsToPlay > 0 && turnState.villainCardsToPlay--); // TODO check if this refers to the current player next turn
    } else if (isVillain(c) && c.vp <= 2) {
      addTurnSet('isFightable', card => c === gameState.villaindeck.top && card === c, () => true);
      addTurnTrigger('FIGHT', ev => ev.what === c, ev => gameState.bystanders.withTop(b => moveCardEv(ev, b, gameState.villaindeck)) );
      addFutureTrigger(ev => turnState.villainCardsToPlay > 0 && turnState.villainCardsToPlay--);
    }
  })), { uSizeChanging: { color: Color.TECH, amount: 3 } }),
// {USIZECHANGING STRENGTH 5}
// You get +1 Attack for each Villain worth 2 VP or less in your Victory Pile.
  ra: makeHeroCard("Cassie Lang", "Inspire Revolution", 9, u, 5, Color.STRENGTH, "Avengers", "D", ev => addAttackEvent(ev,
    playerState.victory.count(c => c.vp <= 2)
  ), { uSizeChanging: { color: Color.STRENGTH, amount: 5 } }),
},
{
  name: "Freedom Fighters",
  team: "(Unaffiliated)",
// When you draw a new hand this turn, draw an extra card.
  c1: makeHeroCard("Freedom Fighters", "Mystics", 3, 1, u, Color.RANGED, u, "F", ev => addEndDrawMod(1)),
// {STREETS CONQUEROR 1}
// Draw a card.
  c2: makeHeroCard("Freedom Fighters", "Steel Warrior", 4, u, 1, Color.INSTINCT, u, "F", [ ev => heroConquerorEv(ev, 'STREETS', 1), ev => drawEv(ev) ]),
// {BRIDGE CONQUEROR 1}
// {POWER Ranged} You get +2 Attack.
  c3: makeHeroCard("Freedom Fighters", "Xolum", 5, u, 2, Color.RANGED, u, "FD", [ ev => heroConquerorEv(ev, 'BRIDGE', 1), ev => superPower(Color.RANGED) && addAttackEvent(ev, 2) ]),
// {POWER Ranged} Choose Recruit or Attack. Then {EXPLORE} You get the printed value of the icon you chose on the Found Hero.
  uc: makeHeroCard("Freedom Fighters", "Quaz", 6, 2, 2, Color.RANGED, u, "D", ev => superPower(Color.RANGED) &&
    chooseOptionEv(ev, "Choose an icon", [{l:"Recruit",v:hasRecruitIcon},{l:"Attack",v:hasAttackIcon}], f =>
      exploreEv(ev, c => f(c) && (f === hasRecruitIcon ? addRecruitEvent(ev, c.printedRecruit) : addAttackEvent(ev, c.printedAttack))))),
// Reveal the top card of your deck. If that card has any "holes" printed inside any of its icons <b>(0, 4, 6, 8, or 9)</b>, draw it.
// {POWER Instinct} You may KO the card you drew this way.
  u2: makeHeroCard("Freedom Fighters", "Veb", 2, u, 1, Color.INSTINCT, u, "D", ev => {
    drawIfEv(ev, c => [0, 4, 6, 8, 9].has(v => [c.printedAttack, c.printedRecruit, c.printedDefense].has(v)), c => {
      superPower(Color.INSTINCT) && selectCardOptEv(ev, "Choose a card to KO", [c], c => KOEv(ev, c));
    });
  }),
// {EXPLORE}
// {POWER Instinct} You may choose a player to gain the Found Hero.
  ra: makeHeroCard("Freedom Fighters", "Freedom Forever", 7, u, 5, Color.INSTINCT, u, "", ev => exploreEv(ev, c => {
    superPower(Color.INSTINCT) && selectCardOptEv(ev, "Choose a player to gain the Hero", gameState.players, p => gainEv(ev, c, p));
  })),
},
{
  name: "Janet Van Dyne",
  team: "(Unaffiliated)",
// {POWER Ranged} {EXPLORE} You get +Attack equal to the Found Hero's printed Attack.
  c1: makeHeroCard("Janet Van Dyne", "Prepare for War", 4, u, 2, Color.RANGED, u, "FD", ev => superPower(Color.RANGED) && exploreEv(ev, c => c.printedAttack && addAttackEvent(ev, c.printedAttack))),
// {POWER Covert}  {EXPLORE} You get +Recruit equal to the Found Hero's printed Recruit.
  c2: makeHeroCard("Janet Van Dyne", "Search for Peace", 3, 2, u, Color.COVERT, u, "FD", ev => superPower(Color.COVERT) && exploreEv(ev, c => c.printedRecruit && addRecruitEvent(ev, c.printedRecruit))),
// {SIZECHANGING COVERT}
// {POWER Covert} {EXPLORE} Then you get +1 Attack for each time you explored this turn.
  c3: makeHeroCard("Janet Van Dyne", "Wasp of Another Generation", 5, u, 2, Color.COVERT, u, "FD", ev => superPower(Color.COVERT) && exploreEv(ev, () => {
    addAttackEvent(ev, pastEvents('EXPLORE').size)
  }), { sizeChanging: Color.COVERT }),
// When you play this, put it on top of the Hero Deck or KO it.
  uc: makeHeroCard("Janet Van Dyne", "Quantum Contradiction", 6, 4, 4, Color.RANGED, u, "F", ev => {
    chooseOneEv(ev, "Choose one", ["KO", () => KOEv(ev, ev.source)], ["Put on top of the Hero Deck", () => isCopy(ev.source) || moveCardEv(ev, ev.source, gameState.herodeck)]);
  }),
// {USIZECHANGING COVERT 2}
// Draw a card.
// {POWER Covert Covert} You get +2 Attack.
  u2: makeHeroCard("Janet Van Dyne", "Subatomic Size", 2, u, 0, Color.COVERT, u, "D", [ ev => drawEv(ev), ev => superPower(Color.COVERT, Color.COVERT) && addAttackEvent(ev, 2) ], { uSizeChanging: { color: Color.COVERT, amount: 2 } }),
// {EXPLORE}
// {POWER Covert} You get +Recruit equal to the Found Hero's printed Recruit and +Attack equal to its printed Attack.
  ra: makeHeroCard("Janet Van Dyne", "Finally Found You", 8, 4, 4, Color.COVERT, u, "", ev => superPower(Color.COVERT) && exploreEv(ev, c => {
    c.printedRecruit && addRecruitEvent(ev, c.printedRecruit);
    c.printedAttack && addAttackEvent(ev, c.printedAttack);
  })),
},
{
  name: "Jentorra",
  team: "(Unaffiliated)",
// You may move a Villain to an adjacent city space. If another Villain is already there, swap them.
// {POWER Instinct} You get +2 Attack.
  c1: makeHeroCard("Jentorra", "Hit and Run", 3, 2, 0, Color.INSTINCT, u, "D", [ ev => {
    selectCardOptEv(ev, "Choose a Villain to move", cityVillains(), v => {
      selectCardEv(ev, "Choose a new city space", cityAdjacent(v.location), dest => swapCardsEv(ev, v.location, dest));
    });
  }, ev => superPower(Color.INSTINCT) && addAttackEvent(ev, 2) ]),
// {BRIDGE CONQUEROR 1}
// If there are no Villains on the Rooftops, draw a card.
  c2: makeHeroCard("Jentorra", "Take the High Ground", 2, u, 1, Color.STRENGTH, u, "D", [ ev => heroConquerorEv(ev, 'BRIDGE', 1), ev => {
    withCity('ROOFTOPS', d => isCityEmpty(d) && drawEv(ev));
  } ]),
// {POWER Strength} {SEWERS CONQUEROR 2}
  c3: makeHeroCard("Jentorra", "Unite the Oppressed", 4, u, 2, Color.STRENGTH, u, "FD", ev => superPower(Color.STRENGTH) && heroConquerorEv(ev, 'SEWERS', 2)),
// {POWER Instinct} {EXPLORE} If the Found Hero is [Instinct] or has no team icon, you get +2 Recruit.
  uc: makeHeroCard("Jentorra", "Find Your Courage", 5, 3, u, Color.INSTINCT, u, "FD", ev => superPower(Color.INSTINCT) && exploreEv(ev, c => {
    (isColor(Color.INSTINCT)(c) || !c.team) && addRecruitEvent(ev, 2);
  })),
// {POWER Strength} {EXPLORE} You get +Attack equal to the Found Hero's cost.
  u2: makeHeroCard("Jentorra", "Lead Powerful Allies", 6, u, 2, Color.STRENGTH, u, "FD", ev => superPower(Color.STRENGTH) && exploreEv(ev, c => {
    c.cost && addAttackEvent(ev, c.cost);
  })),
// {BRIDGE CONQUEROR 1}
// You get +1 Attack for each Villain worth 4 VP or more and each Mastermind Tactic in your Victory Pile.
  ra: makeHeroCard("Jentorra", "Conquer the Conqueror", 7, u, 5, Color.INSTINCT, u, "", [ ev => heroConquerorEv(ev, 'BRIDGE', 1), ev => {
    addAttackEvent(ev, playerState.victory.count(c => c.vp >= 4) + playerState.victory.count(isTactic));
  } ]),
},
{
  name: "Scott Lang, Cat Burglar",
  team: "Crime Syndicate",
// {HEIST} You get +2 Recruit.
  c1: makeHeroCard("Scott Lang, Cat Burglar", "Petty Larceny", 1, 1, u, Color.COVERT, "Crime Syndicate", "FD", [], { heist: ev => addRecruitEvent(ev, 2) }),
// {HEIST} You get +2 Attack.
  c2: makeHeroCard("Scott Lang, Cat Burglar", "Shocking Support", 4, u, 2, Color.RANGED, "Crime Syndicate", "FD", [], { heist: ev => addAttackEvent(ev, 2) }),
// {HEIST} You may move a Villain to an empty city space. If you do, KO one of your Heroes.
  c3: makeHeroCard("Scott Lang, Cat Burglar", "X-Con Security Van", 5, u, 2, Color.TECH, "Crime Syndicate", "D", [], { heist: ev => {
    villains().size && selectCardOptEv(ev, "Select empty city space", gameState.city.filter(isCityEmpty), dest => {
      selectCardOptEv(ev, "Choose a Villain to move", villains(), v => {
        swapCardsEv(ev, v, dest);
        selectCardEv(ev, "Choose a Hero to KO", yourHeroes(), c => KOEv(ev, c));
      });
    });
  } }),
// Whenever you gain a Wound this turn, return that Wound to the Wound Deck.
// {HEIST} Rescue a Bystander.
  uc: makeHeroCard("Scott Lang, Cat Burglar", "Anything for Cassie", 2, 1, 1, Color.INSTINCT, "Crime Syndicate", "D", ev => {
    addTurnTrigger('GAIN', ev => isWound(ev.what) && playerState === ev.who, () => {
      returnToStackEv(ev, gameState.wounds, ev.parent.what);
    })
  }, { heist: ev => rescueEv(ev) }),
// {HEIST} You get +1 Attack for each different cost of card you have.
  u2: makeHeroCard("Scott Lang, Cat Burglar", "Putting a Crew Together", 6, u, 3, Color.STRENGTH, "Crime Syndicate", "F", [], { heist: ev => {
    addAttackEvent(ev, revealable().uniqueCount(c => c.cost));
  } }),
// {HEIST} You get +4 Attack. If the card revealed from the Villain Deck is a Master Strike, KO it and put a card from the Bystander Deck on top of the Villain Deck.
  ra: makeHeroCard("Scott Lang, Cat Burglar", "The Big Score", 8, u, 4, Color.COVERT, "Crime Syndicate", "", [], { heist: ev => {
    addAttackEvent(ev, 4);
    isStrike(ev.what) && gameState.bystanders.withTop(c => {
      KOEv(ev, ev.what);
      moveCardEv(ev, c, gameState.villaindeck);
    });
  } }),
},
{
  name: "Wasp",
  team: "Avengers",
// {SIZECHANGING RANGED}
// {POWER Ranged} You get +1 Recruit and +1 Attack.
  c1: makeHeroCard("Wasp", "Flitting Sting", 3, 1, 1, Color.RANGED, "Avengers", "F", ev => superPower(Color.RANGED) && (addRecruitEvent(ev, 1), addAttackEvent(ev, 1)), { sizeChanging: Color.RANGED }),
// {SIZECHANGING TECH}
// You get +1 Recruit for each other card you have with a "+" symbol in its Recruit icon.
  c2: makeHeroCard("Wasp", "Master Physicist", 4, 2, u, Color.TECH, "Avengers", "D", ev => addRecruitEvent(ev, revealable().limit(isNot(ev.source)).count(hasFlag("R"))), { sizeChanging: Color.TECH }),
// {SIZECHANGING RANGED}
// You get +1 Attack for each other card you have with a "+" symbol in its Attack icon.
  c3: makeHeroCard("Wasp", "Positive Ions", 5, u, 2, Color.RANGED, "Avengers", "D", ev => addAttackEvent(ev, revealable().limit(isNot(ev.source)).count(hasFlag("A"))), { sizeChanging: Color.RANGED }),
// {SIZECHANGING RANGED}
// If this is the first card you played this turn, you get +1 Attack.
  uc: makeHeroCard("Wasp", "Follow My Lead", 2, u, 1, Color.RANGED, "Avengers", "D", ev => turnState.cardsPlayed.size === 0 && addAttackEvent(ev, 1), { sizeChanging: Color.RANGED }),
// {USIZECHANGING TECH 3}
// When you draw a new hand this turn, draw an extra card.
// {HEIST} You get +3 Attack.
  u2: makeHeroCard("Wasp", "Infiltrate", 6, u, 1, Color.TECH, "Avengers", "", ev => addEndDrawMod(1), { uSizeChanging: { color: Color.TECH, amount: 3 }, heist: ev => addAttackEvent(ev, 3) }),
// {USIZECHANGING RANGED 5}
// You get +1 Recruit for each other card you have with a "+" symbol in its Recruit icon.
// You get +1 Attack for each other card you have with a "+" symbol in its Attack icon.
  ra: makeHeroCard("Wasp", "Hope Returns", 9, 4, 4, Color.RANGED, "Avengers", "D", [ 
    ev => addRecruitEvent(ev, revealable().limit(isNot(ev.source)).count(hasFlag("R"))),
    ev => addAttackEvent(ev, revealable().limit(isNot(ev.source)).count(hasFlag("A"))),
   ], { uSizeChanging: { color: Color.RANGED, amount: 5 }}),
},
]);
addHeroTemplates("2099", [
{
  name: "Doctor Doom 2099",
  team: "(Unaffiliated)",
// {CYBER-MOD RANGED} You get +1 Attack.
// {CYBER-MOD RANGED RANGED RANGED} Instead you +3 Attack.
  c1: makeHeroCard("Doctor Doom 2099", "Doomblast", 3, u, 2, Color.RANGED, u, "FDA", ev => cyberModEv(ev, Color.RANGED, 1, n => addAttackEvent(ev, n >= 3 ? 3 : 1))),
// You may send this and a card from your hand or discard pile {UNDERCOVER}. If you do, you get +1 Recruit.
  c2: makeHeroCard("Doctor Doom 2099", "Subvert This New Future", 3, 2, u, Color.RANGED, u, "FDR", ev => {
    selectCardOptEv(ev, "Choose a card to send Undercover", handOrDiscard(), c => {
      sendUndercoverEv(ev, c);
      sendUndercoverEv(ev);
      addRecruitEvent(ev, 1);
    });
  }),
// {POWER Tech} You may look at the top three cards of your deck. If you do, send one of them {UNDERCOVER} and put the rest back in any order.
  uc: makeHeroCard("Doctor Doom 2099", "Flesh-Grafted Doombots", 6, u, 3, Color.TECH, u, "D", ev => superPower(Color.TECH) && revealPlayerDeckEv(ev, 3, cards => {
    selectCardOptEv(ev, "Choose a card to send Undercover", cards, c => sendUndercoverEv(ev, c));
  })),
// You may send a card from your hand or discard pile {UNDERCOVER}.
// {FATED FUTURE}
// {CYBER-MOD RANGED RANGED} If you haven't taken any extra turns this game, you may take another turn after this one. Don't play a card from the Villain Deck at the start of that turn.
  ra: makeHeroCard("Doctor Doom 2099", "Tear Through Time Itself", 8, u, 6, Color.RANGED, u, "D", [
    ev => selectCardOptEv(ev, "Choose a card to send Undercover", handOrDiscard(), c => sendUndercoverEv(ev, c)),
    ev => fatedFutureEv(ev), ev => cyberModEv(ev, Color.RANGED, 2, () => {
      gameState.extraTurn = true; // TODO once per game
      incPerGame('extraTurn', ev.source) || addFutureTrigger(ev => turnState.villainCardsToPlay > 0 && turnState.villainCardsToPlay--);
    }) ]),
},
{
  name: "Ghost Rider 2099",
  team: "Marvel Knights",
// {CYBER-MOD TECH} You get +1 Recruit.
// {CYBER-MOD TECH TECH} Draw a card.
  c1: makeHeroCard("Ghost Rider 2099", "Cyber-Specter", 3, 2, u, Color.TECH, "Marvel Knights", "FDR", [ ev => cyberModEv(ev, Color.TECH, 1, () => addRecruitEvent(ev, 1)), ev => cyberModEv(ev, Color.TECH, 2, () => drawEv(ev)) ]),
// You may send this and a card from the HQ {UNDERCOVER}. If you do, you get +2 Attack.
// {CYBER-MOD TECH TECH TECH} You get +2 Attack.
  c2: makeHeroCard("Ghost Rider 2099", "Hell Ride", 4, u, 2, Color.TECH, "Marvel Knights", "FDA", [ ev => {
    selectCardOptEv(ev, "Choose a card to send Undercover", hqHeroes(), c => {
      sendUndercoverEv(ev, c);
      sendUndercoverEv(ev);
      addAttackEvent(ev, 2);
    });
  }, ev => cyberModEv(ev, Color.TECH, 3, () => addAttackEvent(ev, 2)) ]),
// {TEAMPOWER Marvel Knights} You may KO a Henchman from your Victory Pile. If you do, you get +2 Attack and you may do that Henchman's Fight effect.
  uc: makeHeroCard("Ghost Rider 2099", "Death Beyond Death", 5, u, 3, Color.COVERT, "Marvel Knights", "DA", ev => superPower("Marvel Knights") && selectCardOptEv(ev, "Choose a Henchman to KO", playerState.victory.limit(isHenchman), c => {
    KOEv(ev, c);
    addAttackEvent(ev, 2);
    pushEffects(ev, c, 'fight', c.fight);
  })),
// You may send a card from the HQ {UNDERCOVER}.
// {CYBER-MOD TECH} {FATED FUTURE} and you get +1 Attack for each [Tech] card in your Victory Pile.
  ra: makeHeroCard("Ghost Rider 2099", "Infernal Chainsaw", 7, u, 4, Color.TECH, "Marvel Knights", "DA", [ ev => {
    selectCardOptEv(ev, "Choose a card to send Undercover", hqHeroes(), c => sendUndercoverEv(ev, c));
  }, ev => cyberModEv(ev, Color.TECH, 1, () => {
    fatedFutureEv(ev);
    addAttackEvent(ev, playerState.victory.count(Color.TECH));
  }) ]),
},
{
  name: "Hulk 2099",
  team: "Marvel Knights",
// <b>Cyber-Mod Wound</b>: You get +1 Attack.
// <b>Cyber-Mod 4 Wounds</b>: Instead you get +2 Attack.
  c1: makeHeroCard("Hulk 2099", "Rage Incarnate", 3, u, 2, Color.INSTINCT, "Marvel Knights", "FDA", ev => {
    cyberModEv(ev, isWound, 1, n => addAttackEvent(ev, n >= 4 ? 2 : 1));
  }),
// You may send a Wound from your hand or discard pile {UNDERCOVER}.
// {POWER Strength} You may send a Hero from your hand or discard pile {UNDERCOVER} instead.
  c2: makeHeroCard("Hulk 2099", "Push Pain Under the Surface", 4, 2, u, Color.STRENGTH, "Marvel Knights", "D", [ ev => {
    const options: Filter<Card> = superPower(Color.STRENGTH) ? c => isWound(c) || isHero(c): isWound;
    selectCardOptEv(ev, "Choose a Wound to send Undercover", handOrDiscard().limit(options), c => sendUndercoverEv(ev, c));
  }, ev => superPower(Color.STRENGTH) && 0/* TODO */ ]),
// To play this, you must discard two cards or gain a Wound.
// {POWER Tech} {FATED FUTURE}
  uc: makeHeroCard("Hulk 2099", "Massive Gamma Detonation", 6, u, 5, Color.TECH, "Marvel Knights", "FD", [ ev => {
    // TODO: this should be pay cost, what if no wounds left and no cards in hand
    gameState.wounds.size == 0 ? pickDiscardEv(ev, 2) :
    playerState.hand.size < 2 ? gainWoundEv(ev) : chooseOneEv(ev, "Choose one", ["Gain a Wound", () => gainWoundEv(ev)], ["Discard two cards", () => pickDiscardEv(ev, 2)]);
  }, ev => superPower(Color.TECH) && fatedFutureEv(ev) ]),
// For each player, either send a Wound from that player's discard pile {UNDERCOVER} into your own Victory Pile, or that player gains a Wound.
// <b>Cyber-Mod Wound</b>: You get +1 Attack for each Wound in your Victory Pile.
  ra: makeHeroCard("Hulk 2099", "Cataclysmic Frenzy", 8, u, 4, Color.STRENGTH, "Marvel Knights", "DA", [ ev => {
    eachPlayer(p => selectCardOptEv(ev, "Choose a Wound to send Undercover", p.discard.limit(isWound), c => {
      sendUndercoverEv(ev, c, playerState);
    }, () => gainWoundEv(ev, p)));
  }, ev => cyberModEv(ev, isWound, 1, n => addAttackEvent(ev, n)) ]),
},
{
  name: "Ravage 2099",
  team: "Marvel Knights",
// {POWER Instinct} Draw a card from the bottom of your deck.
  c1: makeHeroCard("Ravage 2099", "Down in the Dregs", 3, 2, u, Color.INSTINCT, "Marvel Knights", "FD", ev => superPower(Color.INSTINCT) && drawBottomEv(ev, 2)),
// {POWER Strength} You get +2 Attack and {FATED FUTURE}.
  c2: makeHeroCard("Ravage 2099", "Toxic Mutations", 5, u, 2, Color.STRENGTH, "Marvel Knights", "FDA", ev => {
    if (superPower(Color.STRENGTH)) { addAttackEvent(ev, 2); fatedFutureEv(ev); }
  }),
// Reveal the top two cards of the Villain Deck and put them back in any order. {FATED FUTURE}
  uc: makeHeroCard("Ravage 2099", "Detect Vibrations", 6, u, 4, Color.COVERT, "Marvel Knights", "FD", ev => {
    revealVillainDeckEv(ev, 2, () => {}, false);
  }),
// Reveal the top card of your deck. You get + Attack equal to that card's cost. Discard it or put it back.
// {TEAMPOWER Marvel Knights} Then do the same thing with the bottom card of your deck.
  ra: makeHeroCard("Ravage 2099", "Overhorns and Underhorns", 8, u, 3, Color.INSTINCT, "Marvel Knights", "DA", [ ev => {
    revealPlayerDeckEv(ev, 1, cards => {
      addAttackEvent(ev, cards.sum(c => c.cost));
      selectCardOptEv(ev, "Choose a card to discard", cards, c => discardEv(ev, c));
    });
  }, ev => superPower("Marvel Knights") && revealPlayerDeckBottomEv(ev, 1, cards => {
    addAttackEvent(ev, cards.sum(c => c.cost));
    selectCardOptEv(ev, "Choose a card to discard", cards, c => discardEv(ev, c));
  }) ]),
},
{
  name: "Spider-Man 2099",
  team: "Spider Friends",
// You may send this {UNDERCOVER}.
// {CYBER-MOD COVERT} Draw a card.
  c1: makeHeroCard("Spider-Man 2099", "Retractable Talons", 2, u, 1, Color.COVERT, "Spider Friends", "FD", [ ev => {
    chooseMayEv(ev, "Choose a card to send Undercover", c => sendUndercoverEv(ev));
  }, ev => cyberModEv(ev, Color.COVERT, 1, () => drawEv(ev)) ]),
// {CYBER-MOD COVERT COVERT} Draw a card.
  c2: makeHeroCard("Spider-Man 2099", "Venomous Fangs", 3, u, 2, Color.COVERT, "Spider Friends", "FD", ev => cyberModEv(ev, Color.COVERT, 2, () => drawEv(ev))),
// The next Hero you recruit this turn goes on top of your deck.
// {POWER Strength} {FATED FUTURE}
  uc: makeHeroCard("Spider-Man 2099", "Spider-Silk Webbing", 5, 3, u, Color.STRENGTH, "Spider Friends", "FD", [ ev => {
    turnState.nextHeroRecruit = 'DECK';
  }, ev => superPower(Color.STRENGTH) && fatedFutureEv(ev) ]),
// Reveal the top three cards of the Hero Deck. You may send one of them {UNDERCOVER}. Put the rest back in any order.
// {TEAMPOWER Spider Friends} You may play a copy of the card you sent {UNDERCOVER} this way.
  ra: makeHeroCard("Spider-Man 2099", "Spider-Sense Telepathy", 7, u, 5, Color.INSTINCT, "Spider Friends", "D", ev => {
    revealHeroDeckEv(ev, 3, cards => {
      selectCardOptEv(ev, "Choose a card to send Undercover", cards, c => {
        sendUndercoverEv(ev, c);
        superPower("Spider Friends") && playCopyEv(ev, c);
      });
    });
  }),
},
]);
addHeroTemplates("Weapon X", [
{
  name: "Fantomex",
  team: "X-Force",
// {WEAPON X SEQUENCE}
  c1: makeHeroCard("Fantomex", "Sentient Bullets", 1, u, 0, Color.RANGED, "X-Force", "FA", ev => weaponXSequenceEv(ev)),
// {WEAPON X SEQUENCE}, getting Recruit instead of Attack.
// If you got at least 3 Recruit this way, draw a card.
  c2: makeHeroCard("Fantomex", "Three Brains", 2, 0, u, Color.TECH, "X-Force", "FDR", ev => {
    const n = weaponXSequenceAmount();
    addRecruitEvent(ev, n);
    n >= 3 && drawEv(ev);
  }),
// {WEAPON X SEQUENCE}
// When you draw a new hand this turn, draw an extra card, then put a card from your hand on top of your deck.
  uc: makeHeroCard("Fantomex", "Misdirection", 3, u, 0, Color.COVERT, "X-Force", "A", [ ev => weaponXSequenceEv(ev), ev => {
    addEndDrawMod(1);
    addTurnTrigger('CLEANUP', () => true, () => {
      selectCardEv(ev, "Choose a card to put on top of your deck", playerState.hand.deck, c => {
        moveCardEv(ev, c, playerState.deck);
      });
    });
  }]),
// {WEAPON X SEQUENCE}
// {POWER Tech} You may KO one of your cards that has the same cost as any of your other cards.
  ra: makeHeroCard("Fantomex", "Weapon XIII", 4, u, 1, Color.TECH, "X-Force", "A", [ ev => weaponXSequenceEv(ev), ev => {
    superPower(Color.TECH) && selectCardOptEv(ev, "Choose a card to KO", revealable().limit(c => revealable().has(c2 => c2 !== c && c2.cost === c.cost)), c => {
      KOEv(ev, c);
    });
  }]),
},
{
  name: "Marrow",
  team: "X-Force",
// {TEAMPOWER X-Force} {BERSERK}
  c1: makeHeroCard("Marrow", "Bone Shards", 3, u, 2, Color.RANGED, "X-Force", "FDA", ev => superPower("X-Force") && berserkEv(ev, 1)),
// For all of your Heroes' {BERSERK} abilities this turn, you get the Berserked cards' printed Recruit just like you get their printed Attack.
// {POWER Strength} {BERSERK}
  c2: makeHeroCard("Marrow", "Hyper-Adaptive Skeleton", 2, 1, 1, Color.STRENGTH, "X-Force", "DRA", [ ev => turnState.recruitFromBerserk = true, ev => superPower(Color.STRENGTH) && berserkEv(ev, 1) ]),
// Draw two cards. Then put a card from your hand on top of your deck.
  uc: makeHeroCard("Marrow", "Osteogenesis", 6, 1, 2, Color.STRENGTH, "X-Force", "FD", [ ev => drawEv(ev, 2), ev => selectCardEv(ev, "Choose a card to put on top of your deck", playerState.hand.deck, c => moveCardEv(ev, c, playerState.deck)) ]),
// {WEAPON X SEQUENCE}
// Reveal the top six cards of your deck. Discard all the ones that cost 0 and put the rest back in any order.
  ra: makeHeroCard("Marrow", "Metabolic Overdrive", 7, u, 3, Color.COVERT, "X-Force", "A", [ ev => weaponXSequenceEv(ev), ev => {
    revealPlayerDeckEv(ev, 6, cards => cards.filter(c => c.cost === 0).each(c => discardEv(ev, c)));
  } ]),
},
{
  name: "Weapon H",
  team: "Avengers",
// You may have this card make all Recruit instead of Attack <i>(including the ability below)</i>.
// {POWER Instinct} You get +1 Attack.
  c1: makeHeroCard("Weapon H", "Evolving Abilities", 4, 0, 2, Color.INSTINCT, "Avengers", "DRA", ev => {
    chooseOneEv(ev, "Make", ["Recruit", () => {
      addRecruitEvent(ev, ev.source.printedAttack);
      superPower(Color.INSTINCT) && addRecruitEvent(ev, 1);
    }], ["Attack", () => {
      addAttackEvent(ev, ev.source.printedAttack);
      superPower(Color.INSTINCT) && addAttackEvent(ev, 1);
    }]);
  }, { customRecruitAndAttack: true }),
// Look at the top card of your deck.
// Discard it or put it back.
// {POWER Strength} {BERSERK}
  c2: makeHeroCard("Weapon H", "The Future of Warfare", 3, u, 2, Color.STRENGTH, "Avengers", "FDA", [ ev => {
    revealPlayerDeckEv(ev, 1, cards => {
      selectCardOptEv(ev, "Choose a card to discard", cards, c => discardEv(ev, c));
    });
  }, ev => superPower(Color.STRENGTH) && berserkEv(ev, 1) ]),
// {BERSERK}
// {POWER Strength} You may KO the card you Berserked.
  uc: makeHeroCard("Weapon H", "Slice and Smash", 5, u, 2, Color.STRENGTH, "Avengers", "FDA", ev => berserkEv(ev, 1, c => {
    superPower(Color.STRENGTH) ? selectCardOptEv(ev, "Choose a card to KO", [c], c => KOEv(ev, c), () => discardEv(ev, c)) : discardEv(ev, c);
  })),
// {WEAPON X SEQUENCE}
// {POWER Strength} Using the Wound Deck, {BERSERK}, {BERSERK}, {BERSERK}, {BERSERK}, {BERSERK}, {BERSERK}, putting those discarded Wounds on the bottom of the Wound Deck.
  ra: makeHeroCard("Weapon H", "Ultimate Killing Machine", 8, u, 4, Color.STRENGTH, "Avengers", "A", [
    ev => weaponXSequenceEv(ev),
    ev => superPower(Color.STRENGTH) && berserkWoundsEv(ev, 6)
  ]),
},
{
  name: "Weapon X (Wolverine)",
  team: "Marvel Knights",
// To play this, you must put another card from your hand on top of your deck.
// {WEAPON X SEQUENCE}
  c1: makeHeroCard("Weapon X (Wolverine)", "Infuse Skeleton with Adamantium", 5, u, 2, Color.TECH, "Marvel Knights", "FDA", ev => weaponXSequenceEv(ev), { playCost: 1, playCostType: 'TOPDECK' }),
// {BERSERK}
// {POWER Instinct} You may KO a Wound from your hand or discard pile. If you do, {BERSERK} again.
  c2: makeHeroCard("Weapon X (Wolverine)", "Raging Regeneration", 4, u, 2, Color.INSTINCT, "Marvel Knights", "FDA", [ ev => berserkEv(ev, 1),
    ev => superPower(Color.INSTINCT) && KOHandOrDiscardEv(ev, isWound, () => berserkEv(ev, 1)) ]),
// You may gain a Wound. If you do, {BERSERK}, {BERSERK}.
  uc: makeHeroCard("Weapon X (Wolverine)", "Violent Conditioning", 3, u, 2, Color.INSTINCT, "Marvel Knights", "FDA", ev => {
    chooseMayEv(ev, "Gain a Wound", () => {
      gainWoundEv(ev);
      berserkEv(ev, 2);
    });
  }),
// {WEAPON X SEQUENCE}
// {POWER Instinct} You may reveal cards from the Wound Deck until you reveal an Enraging Wound. Gain that Enraging Wound to your hand. Put the other revealed cards back on the bottom.
// If you gain a Wound this way, {BERSERK}.
  ra: makeHeroCard("Weapon X (Wolverine)", "Escape the Weapon X Lab", 6, u, 3, Color.INSTINCT, "Marvel Knights", "A", [
    ev => weaponXSequenceEv(ev),
    ev => superPower(Color.INSTINCT) && revealDeckEv(ev, gameState.wounds, cards => !cards.has(isEnragingWound), cards => {
      cards.limit(isEnragingWound).each(c => {
        gainToHandEv(ev, c);
        berserkEv(ev, 1);
      });
    }, false, true),
  ]),
},
]);
