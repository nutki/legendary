// Base

const shieldAgentTemplate = makeHeroCard('Hero', 'S.H.I.E.L.D. Agent',   0, 1, u, Color.GRAY, "S.H.I.E.L.D.", "GN");
const shieldTrooperTemplate = makeHeroCard('Hero', 'S.H.I.E.L.D. Trooper', 0, u, 1, Color.GRAY, "S.H.I.E.L.D.", "GN");
const officerTemplate = makeHeroCard('Maria Hill', 'S.H.I.E.L.D. Officer', 3, 2, u, Color.GRAY, "S.H.I.E.L.D." ,"DN");
const twistTemplate = new Card("SCHEME TWIST", "Scheme Twist");
const strikeTemplate = new Card("MASTER STRIKE", "Master Strike");
const woundTemplate = makeWoundCard("Wound", function () {
  return !turnState.pastEvents.has(e => e.type === "FIGHT" || e.type === "RECRUIT");
}, function (ev) {
  playerState.hand.limit(isWound).forEach(function (w) { KOEv(ev, w); });
  addTurnSet('fightCost', () => true, () => ({ cond: () => false }));
  addTurnSet('recruitCost', () => true, () => ({ cond: () => false }));
});

// EXPANSION Villains

const madameHydraTemplate = makeHeroCard("Viper", "Madame HYDRA", 3, 2, u, Color.GRAY, "HYDRA", "D", [], { playCost: 1, playCostType: 'DISCARD', cardActions: [ dodge ] });
const hydraOperativeTemplate = makeHeroCard("Ally", "HYDRA Operative", 0, 1, u, Color.GRAY, "HYDRA", "GN");
const hydraSoldierTemplate = makeHeroCard("Ally", "HYDRA Soldier", 0, u, 1, Color.GRAY, "HYDRA", "GN");
const newRecruitsTemplate = makeHeroCard("Ally", "New Recruits", 2, u, 1, Color.GRAY, u, "D", [
  ev => returnToStackEv(ev, gameState.newRecruit),
  ev => drawEv(ev),
]);
const bindingsTemplate = makeWoundCard("Bindings", () => !turnState.pastEvents.has(e => e.type === "FIGHT" || e.type === "RECRUIT"), ev => {
  KOEv(ev, ev.source);
  playerState.hand.limit(isBindings).limit(c => c !== ev.source).each(w => gainEv(ev, w, playerState.right));
  addTurnSet('fightCost', () => true, () => ({ cond: () => false }));
  addTurnSet('recruitCost', () => true, () => ({ cond: () => false }));
}, "BINDINGS");

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

function makeAmbitionCard(name: string, defense: number, fight: Handler, starting: boolean = false) {
  const card = new Card('AMBITION', name);
  card.printedDefense = defense;
  card.fight = fight;
  if (starting) card.flags = "S";
  return card;
}
addTemplates("AMBITIONS", "Secret Wars Volume 1", [
// <i>Starting Ambition</i>
// Play a card from the Villain Deck. Keep this card in the Ambition Row.
// <i>(This card starts the game in the Ambition Row and cannot be discarded from the Ambition Row. You can use this card multiple times in the same turn.)</i>
makeAmbitionCard("Pure Evil", 5, ev => villainDrawEv(ev), true),
// Choose a class. Each other player reveals their hand and discards all cards of that class.
makeAmbitionCard("Crackdown", 7, ev => chooseClassEv(ev, col => eachOtherPlayer(p => p.hand.limit(col).each(c => discardEv(ev, c))))),
// Play two cards from the Villain Deck.
makeAmbitionCard("Tide of Destruction", 8, ev => { villainDrawEv(ev); villainDrawEv(ev); }),
// Put a Hero from the HQ on the bottom of the Hero Deck.
makeAmbitionCard("Abduction", 2, ev => selectCardEv(ev, "Choose a Hero", hqHeroes(), c => moveCardEv(ev, c, gameState.herodeck, true))),
// Put this card under a Villain in the Sewers or Bank. When that Villain escapes, this card becomes a Scheme Twist that takes effect immediately. If that Villain leaves the city another way, discard this.
makeAmbitionCard("Secret Plans", 4, ev => {/* TODO */}),
// Choose a class. Put all heroes of that class from the HQ on the bottom of the Hero Deck.
makeAmbitionCard("Wipe Out", 2, ev => chooseClassEv(ev, col => hqHeroes().limit(col).each(c => moveCardEv(ev, c, gameState.herodeck, true)))),
// The other player with the fewest Villains in their Victory Pile gains a Wound. <i>(You choose how to break a tie.)</i>
makeAmbitionCard("Crush the Weak", 3, ev => /* TODO only one */gameState.players.limit(p => p !== playerState).highest(p => -p.victory.count(isVillain)).each(p => gainWoundEv(ev, p))),
// Each other player that has exactly six cards reveals a [Tech] Hero or puts two cards from their hand on top of their deck.
makeAmbitionCard("Identity Theft", 4, ev => eachOtherPlayer(p => p.hand.size === 6 && revealOrEv(ev, Color.TECH, () => pickTopDeckEv(ev, 2, p), p))),
// Each other player reveals a [Ranged] Hero or gains a Wound to the bottom of their deck.
makeAmbitionCard("Wave of Punishment", 5, ev => eachOtherPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p))), // TODO bottom
// Put this card under the Mastermind card. That Mastermind gets +3 Attack until the start of your next turn. Then, discard this card.
makeAmbitionCard("Force Field", 3, ev => {/* TODO future statMod */}),
// Choose a Villain from the Escape Pile. It enters the city.
makeAmbitionCard("Breakout", 4, ev => selectCardEv(ev, "Choose a Villain", gameState.escaped.limit(isVillain), c => enterCityEv(ev, c))),
// Pick a random Mastermind Tactic from all the ones in players' Victory Piles. Shuffle it back into the Mastermind's Tactics.
makeAmbitionCard("Last-Minute Escape", 9, ev => selectCardEv(ev, "Choose a Tactic card", gameState.players.map(p => p.victory.limit(isTactic)).merge(), c => shuffleIntoEv(ev, c, c.mastermind.attachedDeck('TACTICS')))),
// Put this card under a Villain in the city. Until the start of your next turn, that Villain gets +3 Attack. Then, discard this card.
makeAmbitionCard("Empower", 3, ev => {/* TODO future statMod */}),
// Each other player reveals a [Covert] Hero or discards their hand and draws five cards.
makeAmbitionCard("Deceive", 4, ev => eachOtherPlayer(p => revealOrEv(ev, Color.RANGED, () => { discardHandEv(ev, p); drawEv(ev, 5, p); }, p))),
// Each other player puts a Wound from their discard pile on top of their deck.
makeAmbitionCard("Inflict Pain", 2, ev => eachOtherPlayer(p => selectCardEv(ev, "Choose a Wound", p.discard.limit(isWound), c => moveCardEv(ev, c, p.deck), p))),
// KO the Hero in the HQ space under the Bank. You get +Recruit equal to that Hero's printed Recruit.
makeAmbitionCard("Bank Robbery", 3, ev => withCity('BANK', bank => bank.below.limit(isHero).each(c => { KOEv(ev, c); addRecruitEvent(ev, c.printedRecruit || 0); }))),
// Each other player reveals a [Instinct] Hero or gains a Wound to the top of their deck.
makeAmbitionCard("Pressure Point", 6, ev => eachOtherPlayer(p => revealOrEv(ev, Color.INSTINCT, () => gainWoundEv(ev, p), p))), // TODO deck top
// Choose a number besides 0. Each other player reveals their hand and discards all cards of that cost.
makeAmbitionCard("Cleave", 6, ev => chooseCostEv(ev, n => eachOtherPlayer(p => p.hand.limit(c => c.cost === n).each(c => discardEv(ev, c))), 1)),
// Put this card on a Hero in the HQ. Players can't recruit that Hero until the start of your next turn. Then, discard this card.
makeAmbitionCard("Entrap", 1, ev => {/* TODO future statMod */}),
// This card becomes a Scheme Twist that takes effect immediately.
makeAmbitionCard("Insane Twist", 9, ev => playTwistEv(ev, ev.source)),
// A Villain in the city captures a Bystander.
makeAmbitionCard("Kidnap", 2, ev => selectCardEv(ev, "Choose a Villain", cityVillains(), c => captureEv(ev, c))),
// Reveal the top two cards of the Villain Deck. Play a Scheme Twist you revealed. Put the rest back on the top and/or bottom in any order.
makeAmbitionCard("Thirst for Power", 7, ev => investigateEv(ev, isTwist, gameState.villaindeck, c => playTwistEv(ev, c))), // TODO no modifier),
// Each other player chooses Recruit or Attack, then discard all their cards with that icon.
makeAmbitionCard("Painful Choice", 8, ev => {/* TODO */}),
// Each Villain on the Rooftops and Streets captures a Bystander.
makeAmbitionCard("Crime Surge", 3, ev => cityVillains().limit(c => isLocation(c.location, 'ROOFTOPS', 'STREETS')).each(c => captureEv(ev, c))),
// Add a random new Mastermind to the game with one Tactic.
makeAmbitionCard("Dark Apprentice", 10, ev => {/* TODO */}),
// Each other player KOs a Bystander from their Victory Pile or gains a Wound.
makeAmbitionCard("Collateral Damage", 4, ev => eachOtherPlayer(p => selectCardOrEv(ev, "Choose a Bystander to KO", p.victory.limit(isBystander), c => KOEv(ev, c), () => gainWoundEv(ev, p), p))),
// This card becomes a Master Strike that takes effect immediately.
makeAmbitionCard("Ruthless Strike", 4, ev => playStrikeEv(ev, ev.source)),
// Choose a 0-cost Hero from the KO pile for each other player. Those players gain those Heroes.
makeAmbitionCard("Infiltrate S.H.I.E.L.D.", 4, ev => {/* TODO */}),
// Reveal the top two cards of the Villain Deck. Play a Master Strike you revealed. Put the rest back on the top and/or bottom in any order.
makeAmbitionCard("Thirst for Vengeance", 6, ev => investigateEv(ev, isStrike, gameState.villaindeck, c => playStrikeEv(ev, c))), // TODO no modifier
// Each other player reveals a [Strength] Hero or gains a Wound.
makeAmbitionCard("Pummel", 4, ev => eachOtherPlayer(p => revealOrEv(ev, Color.STRENGTH, () => gainWoundEv(ev, p), p))),
]);

// EXPANSION Secret Wars Volume 2

addTemplates("AMBITIONS", "Secret Wars Volume 2", [
// Choose a class. Other players can't recruit heroes of that class until the start of your next turn. Then, discard this card.
makeAmbitionCard("Puzzle Trap", 6, ev => {/* TODO future statMod */}),
// {PATROL Rooftops}: If there's a Villain there, then all Villains everywhere get +1 Attack until the start of your next turn.
// Then, discard this card.
makeAmbitionCard("Seize the High Ground", 3, ev => {/* TODO future statMod */}),
// {PATROL Streets}: If there's a Villain there, then each Villain in the city captures a Bystander.
makeAmbitionCard("Hostage Situation", 2, ev => patrolCityForVillain('STREETS', () => cityVillains().each(c => captureEv(ev, c)))),
// {PATROL Bank}: If there's a Villain there, each other player reveals their hand and discards a card with a Recruit icon.
makeAmbitionCard("This is a Stickup", 4, ev => patrolCityForVillain('BANK', () => eachOtherPlayer(p => selectCardEv(ev, "Choose a card to discard", p.hand.limit(hasRecruitIcon), c => discardEv(ev, c), p)))), // TODO multiplayer reveal
// This ambition ascends to become a new 9 Attack Mastermind worth 5 VP. It gains the ability: "<b>Master Strike</b>: Each player reveals a [Ranged] Hero or gains a Wound."
makeAmbitionCard("Shadowy Disciple", 9, ev => ascendToMastermind(ev, ev => eachPlayer(p => revealOrEv(ev, Color.RANGED, () => gainWoundEv(ev, p), p)), 5)),
// {PATROL Bridge}: If there's a Villain there, each player gains a Wound.
makeAmbitionCard("Detonate the Bridge", 4, ev => patrolCityForVillain('BRIDGE', () => eachPlayer(p => gainWoundEv(ev, p)))),
// {PATROL Sewers}: If there's a Villain there, it escapes.
makeAmbitionCard("Short Escape Tunnels", 5, ev => patrolCityForVillain('SEWERS', c => villainEscapeEv(ev, c))),
// A Villain in the city <b>charges</b> two spaces.
makeAmbitionCard("Crazed Charge", 3, ev => villainChargeEv(ev, ev.source, 2)),
// Every other player reveals their hand and discards all their cards that cost 0.
makeAmbitionCard("Devastate S.H.I.E.L.D.", 7, ev => eachOtherPlayer(p => p.hand.limit(c => c.cost === 0).each(c => discardEv(ev, c)))),
// This card becomes a Master Strike that takes effect immediately. Then, this card becomes a Scheme Twist that takes effect immediately.
makeAmbitionCard("Rack and Ruin", 10, ev => { playStrikeEv(ev, ev.source); playTwistEv(ev, ev.source); }),
]);

// EXPANSION Civil War

const civilWarWounds: [number, Card][] =  [
// HEAL: You may discard a card and have each other player discard a card. If you do, KO this Wound.
[ 2, makeWoundCard("Blinding Flash", c => playerState.hand.count(i => i !== c) >= 2, ev => { eachPlayer(p => selectCardEv(ev, "Choose a card to discard", p.hand.limit(i => i !== ev.source), c => discardEv(ev, c), p)); KOEv(ev, ev.source); }) ],
// HEAL: You may spend 5 Attack. If you do, KO this Wound.
[ 2, makeWoundCard("Blunt Force Trauma", () => canPayCost(new Ev(u, 'EFFECT', {cost: {attack: 5}})), ev => playEvent(new Ev(ev, 'EFFECT', {func: ev => KOEv(ev, ev.what), what: ev.source, cost: {attack: 5}}))) ],
// HEAL: You may KO this Wound. If you do, gain another Wound.
[ 2, makeWoundCard("Corrosive Webbing", () => true, ev => { KOEv(ev, ev.source); gainWoundEv(ev); }) ],
// HEAL: You may KO a Hero that costs 1 or more from your hand or discard pile. If you do, KO this Wound.
[ 2, makeWoundCard("Fatal Blow", () => handOrDiscard().limit(isHero).has(c => c.cost >= 1), ev => { selectCardAndKOEv(ev, handOrDiscard().limit(isHero).limit(c => c.cost >= 1)); KOEv(ev, ev.source); }) ],
// HEAL: You may spend 5 Recruit. If you do, KO this Wound.
[ 2, makeWoundCard("Psychic Trauma", () => canPayCost(new Ev(u, 'EFFECT', {cost: {recruit: 5}})), ev => playEvent(new Ev(ev, 'EFFECT', {func: ev => KOEv(ev, ev.what), what: ev.source, cost: {recruit: 5}}))) ],
// HEAL: You may have the player on your left gain this Wound.
[ 3, makeWoundCard("Spreading Nanovirus", () => true, ev => gainEv(ev, ev.source, playerState.left)) ],
// HEAL: You may play a card from the Villain Deck. If you do, KO this Wound.
[ 2, makeWoundCard("Subdermal Tracker", () => true, ev => { villainDrawEv(ev); KOEv(ev, ev.source); }) ],
];

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

// EXPANSION X-Men

function makeHorrorCard(name: string, func: Handler, abilities?: { trigger?: Trigger }) {
  const card = new Card("HORROR", name);
  card.ambush = func;
  if (abilities) Object.assign(card, abilities);
  return card;
}

const horrorTemplates = [
// AMBUSH: Add a random new Mastermind to the game with one Tactic.
makeHorrorCard("The Apprentice Rises", ev => {/* TODO */}),
// Each non-Henchman Villain has +1 Attack.
makeHorrorCard("Army of Evil", ev => addStatMod('defense', c => isVillain(c) && !isHenchman(c), 1)),
// AMBUSH: Shuffle an additional Master Strike into the Villain Deck. Then, play another card from the Villain Deck.
makeHorrorCard("The Blood Thickens", ev => { gameState.villaindeck.addNewCard(strikeTemplate); gameState.villaindeck.shuffle(); }),
// Each players hand size is one less. (This applies when they draw a new hand.)
makeHorrorCard("Empire of Oppression", ev => gameState.endDrawAmount--),
// Whenever you complete a Scheme Twist, also play the Mastermind's Master Strike ability
makeHorrorCard("Endless Hatred", ev => gameState.triggers.push({ event: 'TWIST', after: ev => { gameState.ko.has(isStrike) || gameState.ko.addNewCard(strikeTemplate); gameState.ko.limit(isStrike).withFirst(c => playStrikeEv(ev, c))} })),
// The Mastermind has +2 Attack.
makeHorrorCard("Enraged Mastermind", ev => addStatMod('defense', isMastermind, 2)),
// After you defeat the Mastermind's four Tactics, you must still fight the Mastermind a fifth time to put the Mastermind card in your Victory Pile and win.
makeHorrorCard("Fight to the End", ev => addStatSet('isFightable', isMastermind, c => c.location === gameState.mastermind)),
// The Mastermind has +1 Attack for each Mastermind Tactic among all players' Victory Piles.
makeHorrorCard("Growing Thread", ev => addStatMod('defense', isMastermind, () => gameState.players.sum(p => p.victory.count(isTactic)))),
// Whenever you play a Henchman Villain from the Villain Deck, play another card from the Villain Deck.
makeHorrorCard("Legions upon Legions", ev => gameState.triggers.push({ event: 'VILLAINDRAW', after: ev => isHenchman(ev.parent.what) && villainDrawEv(ev) })),
// The Mastermind has +1 Attack.
makeHorrorCard("Manical Mastermind", ev => addStatMod('defense', isMastermind, 1)),
// Whenever you play a Bystander from the Villain Deck, play another card from the Villain Deck.
makeHorrorCard("Misery upon Misery", ev => gameState.triggers.push({ event: 'VILLAINDRAW', after: ev => isBystander(ev.parent.what) && villainDrawEv(ev) })),
// AMBUSH: Each player gains a Wound.
makeHorrorCard("Opening Salvo", ev => eachPlayer(p => gainWoundEv(ev, p))),
// Whenever you complete a Master Strike, play another card from the Villain Deck.
makeHorrorCard("Pain upon Pain", ev => gameState.triggers.push({ event: 'STRIKE', after: ev => villainDrawEv(ev) })),
// AMBUSH: Shuffle an additional Scheme Twist into the Villain Deck.
makeHorrorCard("The Plot Thickens", ev => { gameState.villaindeck.addNewCard(twistTemplate); gameState.villaindeck.shuffle(); }),
// Whenever you complete a Scheme Twist, play another card from the Villain Deck.
makeHorrorCard("Plots upon Plots", ev => gameState.triggers.push({ event: 'TWIST', after: ev => villainDrawEv(ev) })),
// AMBUSH: Put this into your discard pile. If this is in your hand at the start of your turn, the player on your left gains this card, then each player discards a card. TODO turn start trigger
makeHorrorCard("Psychic Infection", ev => moveCardEv(ev, ev.source, playerState.discard), { trigger: { event: 'TURN', match: (ev, source) => source.location === playerState.hand, after: ev => { gainEv(ev, ev.source, playerState.left); cont(ev, () => eachPlayer(p => pickDiscardEv(ev, 1, p))); }} }),
// This Horror Ascends to become a new 9-Attack "Master Plan" Token Mastermind worth 5 VP. It gains the ability "Master Strike: Each player reveals a Tech Hero or gains a Wound."
makeHorrorCard("Shadow of the Disciple", ev => ascendToMastermind(ev, ev => eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainWoundEv(ev, p), p)), 5)),
// AMBUSH: Play two cards from the Villain Deck.
makeHorrorCard("Surprise Assault", ev => { villainDrawEv(ev); villainDrawEv(ev); }),
// AMBUSH: Put this into your discard pile. If this is in your hand at the start of your turn, the player on your left gains this card and the player on your right gains a Wound.
makeHorrorCard("Viral Infection", ev => moveCardEv(ev, ev.source, playerState.discard), { trigger: { event: 'TURN', match: (ev, source) => source.location === playerState.hand, after: ev => { gainEv(ev, ev.source, playerState.left); gainWoundEv(ev, playerState.right); }} }),
// The Mastermind has +3 Attack.
makeHorrorCard("Tyrant Mastermind", ev => addStatMod('defense', isMastermind, 3)),
];
