addTemplates("HEROES", "Legendary", [
{
  name:'Thor',
  team:'Avengers',
  c1:makeHeroCard('THOR', 'ODINSON', 3, 2, u, Color.GREEN, 'AVENGERS', function (ev) { if (superPower(Color.GREEN)) addRecruitEvent(ev, 2); }),
  c2:makeHeroCard('THOR', 'SURGE OF POWER', 4, 2, 0, Color.BLUE, 'AVENGERS', function (ev) { if (turnState.totalRecruit >= 8) addAttackEvent(ev, 3); }),
//  c2:makeHeroCard('THOR', 'SURGE OF POWER', 4, 2, 0, Color.BLUE, 'AVENGERS', ev => ifEv(ev => turnState.totalRecruit >= 8, ev => addAttackEvent(ev, 3))),
  uc:makeHeroCard('THOR', 'CALL LIGHTNING', 6, u, 3, Color.BLUE, 'AVENGERS', function (ev) { if (superPower(Color.BLUE)) addAttackEvent(ev, 3); }),
  ra:makeHeroCard('THOR', 'GOD OF THUNDER', 8, 5, 0, Color.BLUE, 'AVENGERS', function (ev) { turnState.attackWithRecruit = true; }),
},
{
  name:'Wolverine',
  team:'X-Men',
  c1:makeHeroCard('Wolverine', 'Healing Factor', 3, u, 2, Color.YELLOW, 'X-Men', function (ev) {
    selectCardOptEv(ev, handOrDiscard().filter(isWound), function (ev) { drawEv(ev); KOEv(ev, ev.selected); });
  }),
  c2:makeHeroCard('Wolverine', 'Keen Senses', 2, u, 1, Color.YELLOW, 'X-Men', function (ev) { if (superPower(Color.YELLOW)) drawEv(ev); }),
  uc:makeHeroCard('Wolverine', 'Frenzied Slashing', 5, u, 2, Color.YELLOW, 'X-Men', function (ev) { if (superPower(Color.YELLOW)) drawEv(ev, 2);}),
  ra:makeHeroCard('Wolverine', 'Berserker Rage', 8, u, 0, Color.YELLOW, 'X-Men', [ function (ev) { drawEv(ev, 3); }, function (ev) { addAttackEvent(ev, turnState.cardsDrawn); } ]),
},
]);
