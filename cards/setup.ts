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

// EXPANSION Civil War

const sidekickTemplate = makeHeroCard("Hero", "Sidekick", 2, u, u, Color.GRAY, u, "D", ev => {
  chooseMayEv(ev, "Return to Sidekick stack", () => returnToStackEv(ev, gameState.newRecruit) && drawEv(ev, 2));
});
