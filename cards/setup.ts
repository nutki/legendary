// Base

const shieldAgentTemplate = makeHeroCard('Hero', 'S.H.I.E.L.D. Agent',   0, 1, u, Color.GRAY, "S.H.I.E.L.D.", "GN");
const shieldTrooperTemplate = makeHeroCard('Hero', 'S.H.I.E.L.D. Trooper', 0, u, 1, Color.GRAY, "S.H.I.E.L.D.", "GN");
const officerTemplate = makeHeroCard('Maria Hill', 'S.H.I.E.L.D. Officer', 3, 2, u, Color.GRAY, "S.H.I.E.L.D." ,"DN");
const twistTemplate = new Card("SCHEME TWIST", "Scheme Twist");
const strikeTemplate = new Card("MASTER STRIKE", "Master Strike");
const woundTemplate = makeWoundCard(function () {
  return !turnState.pastEvents.has(e => e.type === "FIGHT" || e.type === "RECRUIT");
}, function (ev) {
  playerState.hand.limit(isWound).forEach(function (w) { KOEv(ev, w); });
  addTurnSet('fightCost', () => true, () => ({ cond: () => false }));
  addTurnSet('recruitCost', () => true, () => ({ cond: () => false }));
}, "Wound");

// EXPANSION Villains

const madameHydraTemplate = makeHeroCard("Viper", "Madame HYDRA", 3, 2, u, Color.GRAY, "HYDRA", "D", [], { playCost: 1, playCostType: 'DISCARD', cardActions: [ dodge ] });
const hydraOperativeTemplate = makeHeroCard("Ally", "HYDRA Operative", 0, 1, u, Color.GRAY, "HYDRA", "GN");
const hydraSoldierTemplate = makeHeroCard("Ally", "HYDRA Soldier", 0, u, 1, Color.GRAY, "HYDRA", "GN");
const newRecruitsTemplate = makeHeroCard("Ally", "New Recruits", 2, u, 1, Color.GRAY, u, "D", [
  ev => returnToStackEv(ev, gameState.newRecruit),
  ev => drawEv(ev),
]);
const bindingsTemplate = makeWoundCard(() => !turnState.pastEvents.has(e => e.type === "FIGHT" || e.type === "RECRUIT"), ev => {
  KOEv(ev, ev.source);
  playerState.hand.limit(isBindings).limit(c => c !== ev.source).each(w => gainEv(ev, w, playerState.right));
  addTurnSet('fightCost', () => true, () => ({ cond: () => false }));
  addTurnSet('recruitCost', () => true, () => ({ cond: () => false }));
}, "Bindings", "BINDINGS");

// EXPANSION Guardian of the Galaxy

function makeShardToken() {
  const c = new Card("SHARD", "Shard");
  c.set = "Guardians of the Galaxy";
  return c;
}
const shardTemplate = makeShardToken();

// EXPANSION Secret Wars Volume 1

const sidekickTemplate = makeHeroCard("Hero", "Sidekick", 2, u, u, Color.GRAY, u, "D", ev => {
  chooseMayEv(ev, "Return to Sidekick stack", () => returnToStackEv(ev, gameState.sidekick) && drawEv(ev, 2));
});

// TODO SW1&2 Ambitions

// EXPANSION Civil War

// TODO CW Gravious Wounds

const specialSidekickTemplates: [number, Card][] = [
// Draw a card.
// Put this on the bottom of the Sidekick Stack.
[ 3, makeHeroCard("Special Sidekick", "Hairball", 2, u, 1, Color.COVERT, "Avengers", "FD", [ ev => drawEv(ev, 1), ev => returnToStackEv(ev, gameState.sidekick) ]) ],
// {POWER Ranged} You get +1 Attack. Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Lockheed", 2, u, 2, Color.RANGED, "Avengers", "FD", [ ev => superPower(Color.RANGED) && addAttackEvent(ev, 1), ev => returnToStackEv(ev, gameState.sidekick) ]) ],
// {PHASING}
// Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Lockjaw", 2, u, 2, Color.RANGED, "Avengers", "FD", ev => returnToStackEv(ev, gameState.sidekick), { cardActions: [ phasingActionEv ] }) ],
// Rescue a Bystander.
// Draw a card.
// Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Ms. Lion", 2, u, u, Color.COVERT, "Avengers", "FD", [ ev => rescueEv(ev), ev => drawEv(ev, 1), ev => returnToStackEv(ev, gameState.sidekick) ]) ],
// Look at the top three cards of your deck. Draw one. Put the rest back in any order. Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Redwing", 2, u, u, Color.INSTINCT, "Avengers", "FD", [ ev => {
  lookAtDeckEv(ev, 3, () => selectCardEv(ev, "Choose a card to draw", playerState.revealed.deck, c => drawCardEv(ev, c)));
}, ev => returnToStackEv(ev, gameState.sidekick) ]) ],
// Once this turn, if you made at least 6 Recruit, you get +2 Attack. Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Throg", 2, 2, 0, Color.STRENGTH, "Avengers", "FD", [ ev => {
  addTurnAction(new Ev(ev, 'EFFECT', {
    cost: { cond: () => !countPerTurn('Throg', ev.what) && turnState.totalRecruit >= 6 },
    func: ev => { incPerTurn('Throg', ev.what); addAttackEvent(ev, 2); },
    what: ev.source,
  }));
}, ev => returnToStackEv(ev, gameState.sidekick) ]) ],
// KO a card from your hand or discard pile. Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Zabu", 2, u, u, Color.INSTINCT, "Avengers", "FD", [ ev => KOHandOrDiscardEv(ev), ev => returnToStackEv(ev, gameState.sidekick) ]) ],
];
