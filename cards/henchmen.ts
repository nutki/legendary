"use strict";
addTemplates("HENCHMEN", "Legendary", [
// CARDNAME: Doombot Legion
// FIGHT: Look at the top two cards of your deck. KO one of them and put the other back.
// ATTACK: 3
makeHenchmenCard("Doombot Legion", 3, {
  fight: ev => lookAtDeckEv(ev, 2, cards => selectCardAndKOEv(ev, cards))
}),
// CARDNAME: Hand Ninjas
// FIGHT: You get +1 Recruit.
// ATTACK: 3
makeHenchmenCard("Hand Ninjas", 3, {
  fight: ev => addRecruitEvent(ev, 1)
}),
// CARDNAME: Savage Land Mutates
// FIGHT: When you draw a new hand of cards at the end of this turn, draw an extra card.
// ATTACK: 3
makeHenchmenCard("Savage Land Mutates", 3, {
  fight: () => addEndDrawMod(1)
}),
// CARDNAME: Sentinel
// FIGHT: KO one of your Heroes.
// ATTACK: 3
makeHenchmenCard("Sentinel", 3, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes())
}),
]);

addTemplates("HENCHMEN", "Dark City", [
// {BRIBE}
// FIGHT: KO one of your Heroes.
// ATTACK: 4*
makeHenchmenCard("Maggia Goons", 4, {
  bribe: true,
  fight: ev => selectCardAndKOEv(ev, yourHeroes())
}),
// FIGHT: Reveal a [Tech] Hero or KO one of your Heroes with an Attack icon.
// ATTACK: 3
makeHenchmenCard("Phalanx", 3, {
  fight: ev => revealOrEv(ev, Color.TECH, () => selectCardAndKOEv(ev, yourHeroes().limit(hasAttackIcon))),
}),
]);
addTemplates("HENCHMEN", "Villains", [
// FIGHT: Draw a card.
// ATTACK: 3
makeHenchmenCard("Asgardian Warriors", 3, {
  fight: ev => drawEv(ev),
}),
// FIGHT: Gain a New Recruit.
// ATTACK: 3
makeHenchmenCard("Cops", 3, {
  fight: ev => gameState.newRecruit.withTop(c => gainEv(ev, c)),
}),
// FIGHT: KO one of your Allies for each other Multiple Man in your Victory Pile.
// ATTACK: 3
makeHenchmenCard("Multiple Man", 3, {
  fight: ev => repeat(playerState.victory.count(c => c.cardName === "Multiple Man" && c != ev.source), () => selectCardAndKOEv(ev, yourHeroes())),
}),
// FIGHT: Discard the top card of your deck. Then KO an Ally from your discard pile.
// ATTACK: 3
makeHenchmenCard("S.H.I.E.L.D. Assault Squad", 3, {
  fight: [
    ev => withPlayerDeckTopEv(ev, c => discardEv(ev, c)),
    ev => selectCardAndKOEv(ev, playerState.discard.limit(isHero)),
  ],
}),
]);
addTemplates("HENCHMEN", "Secret Wars Volume 1", [
// AMBUSH: Rise of the Living Dead
// FIGHT: Reveal a [Covert] Hero or KO one of your Heroes with an Attack icon.
// ATTACK: 3
makeHenchmenCard("Ghost Racers", 3, {
  fight: ev => revealOrEv(ev, Color.COVERT, () => selectCardAndKOEv(ev, yourHeroes().limit(hasAttackIcon))),
  ambush: riseOfTheLivingDead,
}),
// FIGHT: KO a Hero from your discard pile or the HQ. If that Hero has a Recruit icon, you get +1 Recruit.
// ATTACK: 3
makeHenchmenCard("M.O.D.O.K.s", 3, {
  fight: ev => selectCardEv(ev, "Choose a card to KO", [...hqHeroes(), ...playerState.discard.deck], c => { KOEv(ev, c); hasRecruitIcon(c) && addRecruitEvent(ev, 1); }),
}),
// FIGHT: Gain this as a Hero.
// ATTACK: 3
// GAINABLE
// TEAM: Avengers
// CLASS: [Strength]/[Ranged]
// RECRUIT: 2+
// {POWER Strength Ranged} You get +1 Recruit.
makeGainableCard(makeHenchmenCard("Thor Corps", 3, {}, u), 2, u, Color.STRENGTH | Color.RANGED, "Avengers", "D", ev => superPower(Color.STRENGTH, Color.RANGED) && addRecruitEvent(ev, 1)),
]);
addTemplates("HENCHMEN", "Secret Wars Volume 2", [
// While in the Sewers, Rooftops or Bridge, this is in "wolf form" and gets +2 Attack.
// FIGHT: KO one of your Heroes.
// ATTACK: 3
makeHenchmenCard("Khonshu Guardians", 3, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  varDefense: c => c.printedDefense + (isLocation(c.location, 'SEWERS', 'ROOFTOPS', 'BRIDGE') ? 2 : 0),
}),
// FIGHT: KO one of your Heroes.
// {FATEFULRESURRECTION}
// ATTACK: 3
makeHenchmenCard("Magma Men", 3, {
  fight: [ ev => selectCardAndKOEv(ev, yourHeroes()), fatefulResurrectionEv ],
}),
// AMBUSH: This captures a Bystander.
// FIGHT: The next Hero you gain this turn has Wall-Crawl.
// ATTACK: 3
makeHenchmenCard("Spider-Infected", 3, {
  ambush: ev => captureEv(ev, ev.source),
  fight: ev => turnState.nextHeroRecruit = 'DECK',
}),
]);
addTemplates("HENCHMEN", "Civil War", [
// This gets +1 Attack for each other Mandroid in your Victory Pile.
// FIGHT: KO one of your Heroes.
// ATTACK: 2+
makeHenchmenCard("Mandroid", 2, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  varDefense: c => c.printedDefense + playerState.victory.count(isGroup("Mandroid")),
}),
// S.H.I.E.L.D. Clearance
// FIGHT: KO a card from your discard pile.
// ATTACK: 3*
makeHenchmenCard("Cape-Killers", 3, {
  fight: ev => selectCardAndKOEv(ev, playerState.discard.deck),
  ...shieldClearance,
}),
]);
addTemplates("HENCHMEN", "X-Men", [
// This Villain gets +1 Attack for each Bystander in the KO pile.
// FIGHT: KO one of your Heroes. Then KO a Bystander from the Bystander Stack.
// ATTACK: 1+
makeHenchmenCard("The Brood", 1, {
  fight: [ ev => selectCardAndKOEv(ev, yourHeroes()), ev => gameState.bystanders.withTop(c => KOEv(ev, c)) ],
  varDefense: c => c.printedDefense + gameState.ko.count(isBystander),
}),
// FIGHT: Reveal the top card of your deck. If it costs 0, KO it. Otherwise, you get +1 Recruit.
// ATTACK: 3
makeHenchmenCard("Hellfire Cult", 3, {
  fight: ev => revealPlayerDeckEv(ev, 1, cards => cards.has(c => c.cost === 0) ? cards.each(c => KOEv(ev, c)) : addRecruitEvent(ev, 1)),
}),
// FIGHT: KO one of your Heroes. Then, reveal the top card of the Villain Deck. If it's a Henchman Villain, play it.
// ATTACK: 3
makeHenchmenCard("Sapien League", 3, {
  fight: [ ev => selectCardAndKOEv(ev, yourHeroes()), ev => revealVillainDeckEv(ev, 1, cards => cards.limit(isHenchman).each(c => villainDrawEv(ev, c))) ],
}),
// AMBUSH: The Villain captures a Human Shield.
// FIGHT: KO one of your Heroes.
// ATTACK: 2*
makeHenchmenCard("Shi'ar Death Commandos", 2, {
  ambush: ev => captureShieldEv(ev, ev.source),
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
}),
// FIGHT: The next Hero you recruit this turn has {SOARING FLIGHT}.
// ATTACK: 3
makeHenchmenCard("Shi'ar Patrol Craft", 3, {
  fight: ev => turnState.nextHeroRecruit = "SOARING",
}),
]);
addTemplates("HENCHMEN", "World War Hulk", [
// FIGHT: {FEAST}. If Cytoplasm Spikes feasts on a non-grey Hero, you get +2 Recruit.
// ATTACK: 3
makeHenchmenCard("Cytoplasm Spikes", 3, {
  fight: ev => feastEv(ev, c => isNonGrayHero(c) && addRecruitEvent(ev, 2)),
}),
// FIGHT: If you {OUTWIT} these Death's Heads, KO one of your cards that costs 0.
// ATTACK: 3
makeHenchmenCard("Death's Heads", 3, {
  fight: ev => mayOutwitEv(ev, () => selectCardAndKOEv(ev, revealable().limit(c => c.cost === 0))),
}),
// FIGHT: Look at the top card of your deck. Put it back on the top or bottom. Then {FEAST}.
// ATTACK: 3
makeHenchmenCard("Sakaaran Hivelings", 3, {
  fight: [
    ev => lookAtDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to put on the bottom of your deck", cards, c => moveCardEv(ev, c, playerState.deck, true))),
    feastEv,
  ]
}),
]);
addHenchmenTemplates("Marvel Studios Phase 1", [
copyHenchmenTemplate("Doombot Legion", "Hammer Drone Army"),
copyHenchmenTemplate("Hand Ninjas", "HYDRA Pilots"),
copyHenchmenTemplate("Savage Land Mutates", "HYDRA Spies"),
copyHenchmenTemplate("Sentinel", "Ten Rings Fanatics"),
]);
addTemplates("HENCHMEN", "Dimensions", [
// FIGHT: Reveal the top card of your deck. If it costs 0 Cost, KO it. Otherwise, draw it.
// ATTACK: 3
makeHenchmenCard("Circus of Crime", 3, {
  fight: ev => revealPlayerDeckEv(ev, 1, cards => {
    cards.limit(c => c.cost === 0).each(c => KOEv(ev, c));
    cards.limit(c => c.cost !== 0).each(c => drawCardEv(ev, c));
  }),
}),
// FIGHT: Reveal the top two cards of your deck. Put any that cost 2 Cost or less into your hand. Put the rest back in any order.
// ATTACK: 3
makeHenchmenCard("Spider-Slayer", 3, {
  fight: ev => revealPlayerDeckEv(ev, 2, cards => {
    cards.limit(c => c.cost <= 2).each(c => moveCardEv(ev, c, playerState.hand));
  }),
}),
]);
addHenchmenTemplates("Revelations", [
// <b>Henchman Location</b>
// HYDRA Base gets +2 Attack while there's a Villain here.
// FIGHT: KO one of your Heroes.
makeHenchmenLocationCard("HYDRA Base", 2, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  varDefense: c => c.printedDefense + (c.location.attachedTo instanceof Deck && c.location.attachedTo.has(isVillain) ? 2 : 0)
}),
{name: "Mandarin's Rings", cards:[
// FIGHT: Draw a card.
// ATTACK: 3
[1, makeHenchmenCard("Daimonic, The White Light", 3, {
  fight: ev => drawEv(ev),
}, "Mandarin's Rings")],
// FIGHT: You may KO a card from your discard pile.
// ATTACK: 3
[1, makeHenchmenCard("Incandescence, The Flame Blast", 3, {
  fight: ev => selectCardOptEv(ev, "Choose a card to KO", playerState.discard.deck, c => KOEv(ev, c)),
}, "Mandarin's Rings")],
// FIGHT: You get +1 Recruit.
// ATTACK: 3
[1, makeHenchmenCard("Influence, The Impact Beam", 3, {
  fight: ev => addRecruitEvent(ev, 1),
}, "Mandarin's Rings")],
// FIGHT: Look at the top card of another player's deck. Say it is "Good" or "Bad." That player chooses to put it in your discard pile or their discard pile.
// ATTACK: 3
[1, makeHenchmenCard("Liar, The Mento-Intensifier", 3, {
  fight: ev => chooseOtherPlayerEv(ev, p => {
    lookAtDeckEv(ev, 1, cards => {
      cards.each(c => chooseOptionEv(ev, "Choose a player to gain the card", [
        {l:"You",v:p},
        {l:playerState.name, v:playerState},
      ], p => moveCardEv(ev, c, p.discard), p));
    }, p, playerState);
  }),
}, "Mandarin's Rings")],
// FIGHT: Reveal the top card of your deck. You may KO it.
// ATTACK: 3
[1, makeHenchmenCard("Lightning, The Electro-Blast", 3, {
  fight: ev => revealPlayerDeckEv(ev, 1, cards => selectCardOptEv(ev, "Choose a card to KO", cards, c => KOEv(ev, c))),
}, "Mandarin's Rings")],
// FIGHT: Reveal the top three cards of the Villain Deck. You may defeat a Villain you revealed worth 2VP or less. (Do its Fight effect.) Put the rest back in any order.
// ATTACK: 3
[1, makeHenchmenCard("Nightbringer, The Black Light", 3, {
  fight: ev => revealVillainDeckEv(ev, 3, cards => {
    selectCardOptEv(ev, "Choose a Villain to defeat", cards.limit(isVillain).limit(c => c.vp <= 2), c => defeatEv(ev, c))
  }, false),
}, "Mandarin's Rings")],
// FIGHT: You may choose a card from your hand or discard pile. The player on your right puts it in their hand.
// ATTACK: 3
[1, makeHenchmenCard("Remaker, The Matter Rearranger", 3, {
  fight: ev => selectCardOptEv(ev, `Choose a card to give to ${playerState.right.name}`, handOrDiscard(), c => {
    moveCardEv(ev, c, playerState.right.discard);
  }),
}, "Mandarin's Rings")],
// FIGHT: KO one of your Heroes.
// ATTACK: 3
[1, makeHenchmenCard("Spectral, The Disintegration Beam", 3, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
}, "Mandarin's Rings")],
// FIGHT: Reveal the top six cards of your deck. Discard all of them that cost 0, then put the rest back in any order.
// ATTACK: 3
[1, makeHenchmenCard("Spin, The Vortex Beam", 3, {
  fight: ev => revealPlayerDeckEv(ev, 6, cards => cards.limit(c => c.cost === 0).each(c => discardEv(ev, c))),
}, "Mandarin's Rings")],
// FIGHT: Choose a card you played this turn that costs 0. When you draw a new hand of cards at the end of this turn, add that card to your hand as an extra card.
// ATTACK: 3
[1, makeHenchmenCard("Zero, The Ice Blast", 3, {
  fight: ev => selectCardEv(ev, "Choose a card", playerState.playArea.limit(c => c.cost === 0), c => {
    addTurnTrigger("CLEANUP", undefined, ev => moveCardEv(ev, c, playerState.hand))
  }),
}, "Mandarin's Rings")],
]}
]);
addHenchmenTemplates("Into the Cosmos", [
// AMBUSH: (After this enters the city) If there's a Villain on the Bridge, that Villain and this Henchman each gain a Shard. Otherwise, move this to the Bridge.
// FIGHT: KO one of your Heroes.
// ATTACK: 3
makeHenchmenCard("Sidera Maris, Bridge Builders", 3, {
  ambush: ev => withCity('BRIDGE', bridge => {
    bridge.has(isVillain) && attachShardEv(ev, ev.source);
    bridge.limit(isVillain).each(c => attachShardEv(ev, c));
  }),
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
}),
// AMBUSH: Each Henchman Villain in the city gains a Shard. If Magus is the Mastermind, one Cosmic Wraith also gains a Shard.
// FIGHT: {BURN 2 SHARDS}: KO one of your Heroes.
// ATTACK: 2
makeHenchmenCard("Universal Church of Truth", 2, {
  ambush: ev => {
    cityVillains().limit(isHenchman).each(c => attachShardEv(ev, c));
    selectCardEv(ev, "Choose a Cosmic Wraith", villains().limit(isGroup("Cosmic Wraith")), c => attachShardEv(ev, c));
  },
  fight: ev => setBurnShardEv(ev, 2, ev => selectCardAndKOEv(ev, yourHeroes())),
}),
]);
addHenchmenTemplates("Messiah Complex", [
// AMBUSH: {CLONE}. When the cloned copy enters the city, shuffle a Bystander into the Villain Deck.
// FIGHT: {CLONE} the next Hero you recruit this turn that has printed cost 4 or less.
// ATTACK: 3
makeHenchmenCard("Mr. Sinister Clones", 3, {
  fight: ev => addTurnTrigger('RECRUIT', ev => ev.what.printedCost <= 4, ev => {
    cloneHeroEv(ev, ev.parent.what);
  }),
  ambush: ev => {
    cloningInProgress(ev) ? gameState.bystanders.withTop(c => shuffleIntoEv(ev, c, gameState.villaindeck)) : cloneVillainEv(ev);
  },
}),
// AMBUSH: If there are no other Sentinel Squard O*N*E*s in the city, {CLONE}.
// FIGHT: If there are no other Sentinel Squard O*N*E*s in the city, KO one of your Heroes and put this Villain on the bottom of the Villain Deck.
// ATTACK: 2
makeHenchmenCard("Sentinel Squad O*N*E*", 2, {
  fight: ev => {
    if (!cityVillains().limit(c => c !== ev.source).has(isGroup("Sentinel Squad O*N*E*"))) {
      selectCardAndKOEv(ev, yourHeroes());
      moveCardEv(ev, ev.source, gameState.villaindeck, true);
    }
  },
  ambush: ev => {
    cityVillains().limit(c => c !== ev.source).has(isGroup("Sentinel Squad O*N*E*")) || cloneVillainEv(ev);
  },
}),
]);
addHenchmenTemplates("Marvel Studios What If...?", [
// AMBUSH: Each player discards the top three cards of their deck.
// FIGHT: You may KO a grey Hero from your discard pile.
// ATTACK: 3
makeHenchmenCard("Giants of Jotunheim", 3, {
  ambush: ev => eachPlayer(p => repeat(3, () => withPlayerDeckTopEv(ev, c => discardEv(ev, c), p))),
  fight: ev => selectCardOptEv(ev, "Choose a grey Hero to KO", playerState.discard.limit(Color.GRAY), c => KOEv(ev, c)),
}),
{name: "Ultron Sentries", cards:[
// <b>Empowered</b> by [Covert]
// FIGHT: KO one of your Heroes.
// ATTACK: 2+
[2, makeHenchmenCard("Ultron Sentries", 2, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  varDefense: stableEmpowerVarDefense.get(Color.COVERT),
  variant: 'COVERT',
}, "Ultron Sentries")],
// <b>Empowered</b> by [Instinct]
// FIGHT: KO one of your Heroes.
// ATTACK: 2+
[2, makeHenchmenCard("Ultron Sentries", 2, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  varDefense: stableEmpowerVarDefense.get(Color.INSTINCT),
  variant: 'INSTINCT',
}, "Ultron Sentries")],
// <b>Empowered</b> by [Ranged]
// FIGHT: KO one of your Heroes.
// ATTACK: 2+
[2, makeHenchmenCard("Ultron Sentries", 2, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  varDefense: stableEmpowerVarDefense.get(Color.RANGED),
  variant: 'RANGED',
}, "Ultron Sentries")],
// <b>Empowered</b> by [Strength]
// FIGHT: KO one of your Heroes.
// ATTACK: 2+
[2, makeHenchmenCard("Ultron Sentries", 2, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  varDefense: stableEmpowerVarDefense.get(Color.STRENGTH),
  variant: 'STRENGTH',
}, "Ultron Sentries")],
// <b>Empowered</b> by [Tech]
// FIGHT: KO one of your Heroes.
// ATTACK: 2+
[2, makeHenchmenCard("Ultron Sentries", 2, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  varDefense: stableEmpowerVarDefense.get(Color.TECH),
  variant: 'TECH',
}, "Ultron Sentries")],
// AMBUSH: Another Villain captures a Bystander.
// FIGHT: {LIBERATE 3}. The next time you rescue a Bystander this turn <i>(including from this Henchman)</i>, KO one of your Heroes.
// ATTACK: 3
]},
makeHenchmenCard("Vibranium Liberator Drones", 3, {
  fight: ev => {
    liberateEv(ev, 3);
    addTurnTrigger('RESCUE', ev => ev.what === ev.source && ev.who === playerState, ev => selectCardAndKOEv(ev, yourHeroes()));
    // TODO allow ordering effects, so this can trigger if this henchman had a bystander
  },
  ambush: ev => selectCardEv(ev, "Choose a Villain", villains(), c => captureEv(ev, c)),
}),
]);
addHenchmenTemplates("Ant-Man and the Wasp", [
// FIGHT: Choose Recruit or Attack. Then {EXPLORE} If the Found Hero has the icon you chose, KO one of your Heroes.
// ATTACK: 3
makeHenchmenCard("Quantum Hound", 3, {
  fight: ev => chooseOptionEv(ev, "Choose an icon", [
    {l:"Recruit",v:hasRecruitIcon},
    {l:"Attack",v:hasAttackIcon}],v => exploreEv(ev, c => v(c) && selectCardAndKOEv(ev, yourHeroes()))),
}),
// {ROOFTOPS CONQUEROR 1}
// {STREETS CONQUEROR 1}
// FIGHT: KO one of your Heroes.
// ATTACK: 2+
makeHenchmenCard("Quantumnauts", 2, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  ...conquerorAbility(1, 'ROOFTOPS', 'STREETS'),
}),
{name: "Tardigrade", cards:[
// {USIZECHANGING COVERT 1}[Covert][Covert]
// FIGHT: KO one of your Heroes.
// ATTACK: 4*
[2, makeHenchmenCard("Tardigrade", 4, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  uSizeChanging: { amount: 3, color: Color.COVERT },
  variant: 'COVERT',
}, "Tardigrade")],
// {USIZECHANGING INSTINCT 1}[Instinct][Instinct]
// FIGHT: KO one of your Heroes.
// ATTACK: 4*
[2, makeHenchmenCard("Tardigrade", 4, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  uSizeChanging: { amount: 3, color: Color.INSTINCT },
  variant: 'INSTINCT',
}, "Tardigrade")],
// {USIZECHANGING RANGED 1}[Ranged][Ranged]
// FIGHT: KO one of your Heroes.
// ATTACK: 4*
[2, makeHenchmenCard("Tardigrade", 4, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  uSizeChanging: { amount: 3, color: Color.RANGED },
  variant: 'RANGED',
}, "Tardigrade")],
// {USIZECHANGING STRENGTH 1}[Strength][Strength]
// FIGHT: KO one of your Heroes.
// ATTACK: 4*
[2, makeHenchmenCard("Tardigrade", 4, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  uSizeChanging: { amount: 3, color: Color.STRENGTH },
  variant: 'STRENGTH',
}, "Tardigrade")],
// {USIZECHANGING TECH 1}[Tech][Tech]
// FIGHT: KO one of your Heroes.
// ATTACK: 4*
[2, makeHenchmenCard("Tardigrade", 4, {
  fight: ev => selectCardAndKOEv(ev, yourHeroes()),
  uSizeChanging: { amount: 3, color: Color.TECH },
  variant: 'TECH',
}, "Tardigrade")],
]}
]);
