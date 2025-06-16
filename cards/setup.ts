// Base

const shieldAgentTemplate = makeHeroCard(u, 'S.H.I.E.L.D. Agent',   0, 1, u, Color.GRAY, "S.H.I.E.L.D.", "GN");
const shieldTrooperTemplate = makeHeroCard(u, 'S.H.I.E.L.D. Trooper', 0, u, 1, Color.GRAY, "S.H.I.E.L.D.", "GN");
const officerTemplate = makeHeroCard(u /*'Maria Hill'*/, 'S.H.I.E.L.D. Officer', 3, 2, u, Color.GRAY, "S.H.I.E.L.D." ,"GDN");
const twistTemplate = new Card("SCHEME TWIST", "Scheme Twist");
const strikeTemplate = new Card("MASTER STRIKE", "Master Strike");
addTemplatesWithCounts("WOUNDS", "Legendary", [[ 30,
makeWoundCard("Wound", function () {
  return !turnState.pastEvents.has(e => e.type === "FIGHT" || e.type === "RECRUIT");
}, function (ev) {
  playerState.hand.limit(isWound).forEach(function (w) { KOEv(ev, w); });
  forbidAction('FIGHT');
  forbidAction('RECRUIT');
}) ]]);

// EXPANSION Villains

const madameHydraTemplate = makeHeroCard(u/*"Viper"*/, "Madame HYDRA", 3, 2, u, Color.GRAY, "HYDRA", "D", [], { playCost: 1, playCostType: 'DISCARD', cardActions: [ dodge ] });
const hydraOperativeTemplate = makeHeroCard(u, "HYDRA Operative", 0, 1, u, Color.GRAY, "HYDRA", "GN");
const hydraSoldierTemplate = makeHeroCard(u, "HYDRA Soldier", 0, u, 1, Color.GRAY, "HYDRA", "GN");
const newRecruitsTemplate = makeHeroCard(u, "New Recruits", 2, u, 1, Color.GRAY, u, "D", [
  ev => returnToStackEv(ev, gameState.newRecruit),
  ev => drawEv(ev),
]);
const bindingsTemplate = makeWoundCard("Bindings", () => !turnState.pastEvents.has(e => e.type === "FIGHT" || e.type === "RECRUIT"), ev => {
  KOEv(ev, ev.source);
  playerState.hand.limit(isBindings).limit(c => c !== ev.source).each(w => gainEv(ev, w, playerState.right));
  forbidAction('FIGHT');
  forbidAction('RECRUIT');
}, "BINDINGS");
madameHydraTemplate.set = "Villains";
hydraOperativeTemplate.set = "Villains";
hydraSoldierTemplate.set = "Villains";
newRecruitsTemplate.set = "Villains";
bindingsTemplate.set = "Villains";

// EXPANSION Guardian of the Galaxy

function makeShardToken() {
  const c = new Card("SHARD", "Shard");
  c.set = "Guardians of the Galaxy";
  return c;
}
const shardTemplate = makeShardToken();

// EXPANSION Secret Wars Volume 1

addTemplatesWithCounts("SIDEKICKS", "Secret Wars Volume 1", [
[15, makeHeroCard(u, "Sidekick", 2, u, u, Color.GRAY, u, "D", ev => {
  chooseMayEv(ev, "Return to Sidekick stack", () => returnToStackEv(ev, gameState.sidekick) && drawEv(ev, 2));
})]]);

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
makeAmbitionCard("Thirst for Power", 7, ev => investigateEv(ev, isTwist, gameState.villaindeck, c => playTwistEv(ev, c))), // TODO almost investigate,
// Each other player chooses Recruit or Attack, then discard all their cards with that icon.
makeAmbitionCard("Painful Choice", 8, ev => {/* TODO */}),
// Each Villain on the Rooftops and Streets captures a Bystander.
makeAmbitionCard("Crime Surge", 3, ev => cityVillains().limit(c => isLocation(c.location, 'ROOFTOPS', 'STREETS')).each(c => captureEv(ev, c))),
// Add a random new Mastermind to the game with one Tactic.
makeAmbitionCard("Dark Apprentice", 10, ev => addMastermindEv(ev)),
// Each other player KOs a Bystander from their Victory Pile or gains a Wound.
makeAmbitionCard("Collateral Damage", 4, ev => eachOtherPlayer(p => selectCardOptEv(ev, "Choose a Bystander to KO", p.victory.limit(isBystander), c => KOEv(ev, c), () => gainWoundEv(ev, p), p))),
// This card becomes a Master Strike that takes effect immediately.
makeAmbitionCard("Ruthless Strike", 4, ev => playStrikeEv(ev, ev.source)),
// Choose a 0-cost Hero from the KO pile for each other player. Those players gain those Heroes.
makeAmbitionCard("Infiltrate S.H.I.E.L.D.", 4, ev => {/* TODO */}),
// Reveal the top two cards of the Villain Deck. Play a Master Strike you revealed. Put the rest back on the top and/or bottom in any order.
makeAmbitionCard("Thirst for Vengeance", 6, ev => investigateEv(ev, isStrike, gameState.villaindeck, c => playStrikeEv(ev, c))), // TODO almost investigate
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
makeAmbitionCard("Secret Escape Tunnels", 5, ev => patrolCityForVillain('SEWERS', c => villainEscapeEv(ev, c))),
// A Villain in the city <b>charges</b> two spaces.
makeAmbitionCard("Crazed Charge", 3, ev => villainChargeEv(ev, ev.source, 2)),
// Every other player reveals their hand and discards all their cards that cost 0.
makeAmbitionCard("Devastate S.H.I.E.L.D.", 7, ev => eachOtherPlayer(p => p.hand.limit(c => c.cost === 0).each(c => discardEv(ev, c)))),
// This card becomes a Master Strike that takes effect immediately. Then, this card becomes a Scheme Twist that takes effect immediately.
makeAmbitionCard("Rack and Ruin", 10, ev => { playStrikeEv(ev, ev.source); playTwistEv(ev, ev.source); }),
]);

// EXPANSION Civil War

addTemplatesWithCounts("WOUNDS", "Civil War", [
// HEAL: You may discard a card and have each other player discard a card. If you do, KO this Wound.
[ 2, makeWoundCard("Blinding Flash", c => playerState.hand.count(i => i !== c) >= 2, ev => { eachPlayer(p => selectCardEv(ev, "Choose a card to discard", p.hand.limit(i => i !== ev.source), c => discardEv(ev, c), p)); KOEv(ev, ev.source); }) ],
// HEAL: You may spend 5 Attack. If you do, KO this Wound.
[ 2, makeWoundCard("Blunt Force Trauma", () => canPayCost(new Ev(u, 'EFFECT', {func: () => {}, cost: {attack: 5}})), ev => playEvent(new Ev(ev, 'EFFECT', {func: ev => KOEv(ev, ev.what), what: ev.source, cost: {attack: 5}}))) ],
// HEAL: You may KO this Wound. If you do, gain another Wound.
[ 2, makeWoundCard("Corrosive Webbing", () => true, ev => { KOEv(ev, ev.source); gainWoundEv(ev); }) ],
// HEAL: You may KO a Hero that costs 1 or more from your hand or discard pile. If you do, KO this Wound.
[ 2, makeWoundCard("Fatal Blow", () => handOrDiscard().limit(isHero).has(c => c.cost >= 1), ev => { selectCardAndKOEv(ev, handOrDiscard().limit(isHero).limit(c => c.cost >= 1)); KOEv(ev, ev.source); }) ],
// HEAL: You may spend 5 Recruit. If you do, KO this Wound.
[ 2, makeWoundCard("Psychic Trauma", () => canPayCost(new Ev(u, 'EFFECT', {func: () => {}, cost: {recruit: 5}})), ev => playEvent(new Ev(ev, 'EFFECT', {func: ev => KOEv(ev, ev.what), what: ev.source, cost: {recruit: 5}}))) ],
// HEAL: You may have the player on your left gain this Wound.
[ 3, makeWoundCard("Spreading Nanovirus", () => true, ev => gainEv(ev, ev.source, playerState.left)) ],
// HEAL: You may play a card from the Villain Deck. If you do, KO this Wound.
[ 2, makeWoundCard("Subdermal Tracker", () => gameState.villaindeck.size > 0, ev => { villainDrawEv(ev); KOEv(ev, ev.source); }) ],
]);

addTemplatesWithCounts("SIDEKICKS", "Civil War", [
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
  lookAtDeckEv(ev, 3, cards => selectCardEv(ev, "Choose a card to draw", cards, c => drawCardEv(ev, c)));
}, ev => returnToStackEv(ev, gameState.sidekick) ]) ],
// Once this turn, if you made at least 6 Recruit, you get +2 Attack. Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Throg", 2, 2, 0, Color.STRENGTH, "Avengers", "FD", [ ev => {
  addTurnAction(new Ev(ev, 'EFFECT', {
    cost: { cond: () => !countPerTurn('Throg', ev.source) && turnState.totalRecruit >= 6 },
    func: ev => { incPerTurn('Throg', ev.what); addAttackEvent(ev, 2); },
    what: ev.source,
  }));
}, ev => returnToStackEv(ev, gameState.sidekick) ]) ],
// KO a card from your hand or discard pile. Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Zabu", 2, u, u, Color.INSTINCT, "Avengers", "FD", [ ev => KOHandOrDiscardEv(ev), ev => returnToStackEv(ev, gameState.sidekick) ]) ],
]);

// EXPANSION X-Men

function makeHorrorCard(name: string, func: Handler, abilities?: { trigger?: Trigger }) {
  const card = new Card("HORROR", name);
  card.ambush = func;
  if (abilities) Object.assign(card, abilities);
  return card;
}

const horrorTemplates = [
// AMBUSH: Add a random new Mastermind to the game with one Tactic.
makeHorrorCard("The Apprentice Rises", ev => addMastermindEv(ev)),
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
makeHorrorCard("Growing Threat", ev => addStatMod('defense', isMastermind, () => gameState.players.sum(p => p.victory.count(isTactic)))),
// Whenever you play a Henchman Villain from the Villain Deck, play another card from the Villain Deck.
makeHorrorCard("Legions upon Legions", ev => gameState.triggers.push({ event: 'VILLAINDRAW', after: ev => isHenchman(ev.parent.what) && villainDrawEv(ev) })),
// The Mastermind has +1 Attack.
makeHorrorCard("Maniacal Mastermind", ev => addStatMod('defense', isMastermind, 1)),
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
// AMBUSH: Put this into your discard pile. If this is in your hand at the start of your turn, the player on your left gains this card, then each player discards a card.
makeHorrorCard("Psychic Infection", ev => moveCardEv(ev, ev.source, playerState.discard), { trigger: { event: 'TURNSTART', match: (ev, source) => source.location === playerState.hand, after: ev => { gainEv(ev, ev.source, playerState.left); cont(ev, () => eachPlayer(p => pickDiscardEv(ev, 1, p))); }} }),
// This Horror Ascends to become a new 9-Attack "Master Plan" Token Mastermind worth 5 VP. It gains the ability "Master Strike: Each player reveals a Tech Hero or gains a Wound."
makeHorrorCard("Shadow of the Disciple", ev => ascendToMastermind(ev, ev => eachPlayer(p => revealOrEv(ev, Color.TECH, () => gainWoundEv(ev, p), p)), 5)),
// AMBUSH: Play two cards from the Villain Deck.
makeHorrorCard("Surprise Assault", ev => { villainDrawEv(ev); villainDrawEv(ev); }),
// AMBUSH: Put this into your discard pile. If this is in your hand at the start of your turn, the player on your left gains this card and the player on your right gains a Wound.
makeHorrorCard("Viral Infection", ev => moveCardEv(ev, ev.source, playerState.discard), { trigger: { event: 'TURNSTART', match: (ev, source) => source.location === playerState.hand, after: ev => { gainEv(ev, ev.source, playerState.left); gainWoundEv(ev, playerState.right); }} }),
// The Mastermind has +3 Attack.
makeHorrorCard("Tyrant Mastermind", ev => addStatMod('defense', isMastermind, 3)),
];
horrorTemplates.forEach(c => c.set = "X-Men");

// Expansion S.H.I.E.L.D.
const shieldOfficerTemplates: [number, Card][] = [
// You may send this Hero {UNDERCOVER}.
// GUN: 1
[ 2, makeHeroCard("S.H.I.E.L.D. Officer", "Dum Dum Dugan", 3, 2, 1, Color.STRENGTH, "S.H.I.E.L.D.", "GD", ev => chooseUndercoverEv(ev)) ],
// You may discard a card. If you do, draw  card.
// GUN: 1
[ 2, makeHeroCard("S.H.I.E.L.D. Officer", "G.W. Bridge", 3, 2, u, Color.STRENGTH, "S.H.I.E.L.D.", "GD", ev => selectCardOptEv(ev, "Choose a card to discard", playerState.hand.deck, c => {
  discardEv(ev, c);
  drawEv(ev);
})) ],
// You may send this Hero {UNDERCOVER}.
// If you do, KO another S.H.I.E.L.D. Hero from your hand.
[ 2, makeHeroCard("S.H.I.E.L.D. Officer", "Grant Ward", 3, 2, u, Color.TECH, "S.H.I.E.L.D.", "FD", ev => chooseUndercoverEv(ev, () => selectCardAndKOEv(ev, playerState.hand.limit('S.H.I.E.L.D.')))) ],
// Choose one:
// - You get +2 Recruit
// - Or you get +1 Attack and draw a card.
// GUN: 1
[ 2, makeHeroCard("S.H.I.E.L.D. Officer", "Leo Fitz & Jemma Simmons", 3, 0, 0, Color.TECH, "S.H.I.E.L.D.", "GD", ev => {
  chooseOptionEv(ev, "Choose one", [
    { l: "+2 Recruit", v: () => addRecruitEvent(ev, 2) },
    { l: "+1 Attack and draw", v: () => { addAttackEvent(ev, 1); drawEv(ev); } },
  ], f => f());
}) ],
// {TEAMPOWER S.H.I.E.L.D., S.H.I.E.L.D., S.H.I.E.L.D.} Draw a card.
[ 2, makeHeroCard("S.H.I.E.L.D. Officer", "Melinda May", 3, 2, u, Color.INSTINCT, "S.H.I.E.L.D.", "D", ev => superPower("S.H.I.E.L.D.", "S.H.I.E.L.D.", "S.H.I.E.L.D.") && drawEv(ev)) ],
// You may send this Hero {UNDERCOVER}. If you do, you get +1 Recruit
// GUN: 1
[ 2, makeHeroCard("S.H.I.E.L.D. Officer", "Sharon Carter", 3, 2, u, Color.COVERT, "S.H.I.E.L.D.", "GD", ev => chooseUndercoverEv(ev, () => addRecruitEvent(ev, 1))) ],
// {TEAMPOWER S.H.I.E.L.D., S.H.I.E.L.D., S.H.I.E.L.D.} You may send this Hero or a S.H.I.E.L.D. Hero from your hand {UNDERCOVER}.
[ 2, makeHeroCard("S.H.I.E.L.D. Officer", "Victoria Hand", 3, 2, u, Color.COVERT, "S.H.I.E.L.D.", "D", ev => {
  superPower("S.H.I.E.L.D.", "S.H.I.E.L.D.", "S.H.I.E.L.D.") && selectCardOptEv(ev, "Send Undercover", [ev.source, ...playerState.hand.limit('S.H.I.E.L.D.')], c => {
    sendUndercoverEv(ev, c);
  });
}) ],
// {TEAMPOWER S.H.I.E.L.D., S.H.I.E.L.D.} You may send this Hero {UNDERCOVER} or put it on top of your deck.
// GUN: 1
[ 2, makeHeroCard("S.H.I.E.L.D. Officer", "\"Yo-Yo\" Rodriguez", 3, 2, u, Color.RANGED, "S.H.I.E.L.D.", "GD", ev => {
  superPower("S.H.I.E.L.D.", "S.H.I.E.L.D.") && chooseOptionEv(ev, "Send this Hero", [
    { l: "Undercover", v: () => sendUndercoverEv(ev) },
    { l: "on top of your deck", v: () => moveCardEv(ev, ev.source, playerState.deck) },
  ], f => f());
}) ],
];
shieldOfficerTemplates.forEach(([n, c]) => c.set = "S.H.I.E.L.D.");

addTemplatesWithCounts("SIDEKICKS", "Messiah Complex", [
// Choose a team. {INVESTIGATE} for a card of that team.
// Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Layla Miller", 2, u, 1, Color.TECH, "X-Factor", "D", [ ev => {
  const teams = owned().unique(c => c.team).filter(Boolean).map(v => ({l:v, v}));
  chooseOptionEv(ev, "Choose a team", teams, t => investigateEv(ev, t));
}, ev => returnToStackEv(ev, gameState.sidekick) ]) ],
// If any player would gain a Wound, you may discard this card instead. If you do, draw two cards.
// Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Skids", 2, 3, u, Color.COVERT, "X-Men", "D", ev => returnToStackEv(ev, gameState.sidekick), { trigger:
  youMayDiscardThisInsteadEv("GAIN", ev => isWound(ev.what), "draw two cards", ev => drawEv(ev, 2, owner(ev.source)))
}) ],
// {SHATTER} a Villain.
// Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Rockslide", 2, u, u, Color.STRENGTH, "X-Men", "FD", [ ev => shatterSelectEv(ev, fightableCards().limit(isVillain)), ev => returnToStackEv(ev, gameState.sidekick) ]) ],
// If the most recent Hero you previously played this turn has a Recruit icon, you get +2 Recruit. If it has a Attack icon, you get +2 Attack. (If both, you get both.)
// Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Darwin", 2, 0, 0, Color.INSTINCT, "X-Factor", "D", [
  ev => turnState.cardsPlayed.withLast(c => hasRecruitIcon(c) && addRecruitEvent(ev, 2)),
  ev => turnState.cardsPlayed.withLast(c => hasAttackIcon(c) && addAttackEvent(ev, 2)),
  ev => returnToStackEv(ev, gameState.sidekick) ]
)],
// Choose one of her nicknames:
// <ul>
//     <li><b>“Time Bomb”</b>: You get +1 Attack and put this on top of your deck.</li>
//     <li><b>“Boomer”</b>: You get +3 Attack and put this on the bottom of the Sidekick Stack.</li>
//     <li><b>“Meltdown”</b>: You get +4 Attack, KO this, and gain a Wound.</li>
// </ul>
[ 2, makeHeroCard("Special Sidekick", "Boom-Boom", 2, u, 0, Color.RANGED, "X-Force", "DA", ev => {
  chooseOneEv(ev, "Choose a nickname",
    [ "Time Bomb", () => { addAttackEvent(ev, 1); moveCardEv(ev, ev.source, playerState.deck); }],
    [ "Boomer", () => { addAttackEvent(ev, 3); returnToStackEv(ev, gameState.sidekick); }],
    [ "Meltdown", () => { addAttackEvent(ev, 4); KOEv(ev, ev.source); gainWoundEv(ev); }]
  );
}) ],
// Play this card as a copy of another Hero you played this turn that costs 6 or less. This card is both [Tech] and the Hero Class you copy.
// Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Prodigy", 2, u, u, Color.TECH, "X-Men", "D", ev => returnToStackEv(ev, gameState.sidekick), {
  copyPasteCard: true,
  copyPasteLimit: c => c.cost <= 6,
  trigger: {
    event: 'PLAY',
    match: (ev, source) => ev.what === source,
    after: ev => moveCardEv(ev, ev.parent.what, gameState.sidekick, true)
  }
}) ],
// {INVESTIGATE} your deck for a card that costs 0. KO it or discard it.
// Put this on the bottom of the Sidekick Stack.
[ 2, makeHeroCard("Special Sidekick", "Rusty \"Firefist\" Collins", 2, u, 1, Color.RANGED, "X-Men", "D", [
  ev => investigateEv(ev, c => c.cost === 0, playerState.deck, c => selectCardOptEv(ev, "Choose a card to KO", [c], c => KOEv(ev, c), () => discardEv(ev, c))),
  ev => returnToStackEv(ev, gameState.sidekick)
]) ],
]);

type EnragingWoundAbillities = Pick<Card, 'playCost' | 'playCostType' | 'playCostLimit'>;
const enragingWoundHeal = (ev: Ev) => chooseMayEv(ev, `KO ${ev.source.cardName}`, () => KOEv(ev, ev.source));
function makeEnragingWoundCard(name: string, recruit: number, attack: number, event: TriggerableEvType, match: (ev: Ev, source: Card) => boolean, effect?: Handler, params?: EnragingWoundAbillities) {
  const c = makeWoundCard(name, () => false, enragingWoundHeal);
  c.printedRecruit = recruit;
  c.printedAttack = attack;
  c.trigger = { event, match: (ev, source) => (source.location === playerState.hand || source.location === playerState.playArea) && match(ev, source),
    after: ev => pushEv(ev, 'EFFECT', { what: ev.source, source: ev.source, func: healCard }) };
  if (effect) c.effects = [effect];
  if (params) Object.assign(c, params);
  return c;
}
addTemplatesWithCounts("WOUNDS", "Weapon X", [
// ATTACK: 2
// HEAL: When you defeat a Mastermind Tactic this turn, you may KO this Wound.
[ 1, makeEnragingWoundCard("Blazing Vengeance", u, 2, 'DEFEAT', ev => ev.what.attached("TACTICS").size > 0) ],
// ATTACK: 3
// To play this, you must put another card from your hand on top of your deck.
// HEAL: When you draw a card this turn <i>(including drawing this card but not including drawing a new hand at the end of your turn)</i>, you may KO this Wound.
[ 1, makeEnragingWoundCard("Broken Bones", u, 3, 'DRAW', (ev, c) => ev.who === owner(c) && ancestorEvents(ev, 'CLEANUP').size === 0, u, { playCost: 1, playCostType: 'TOPDECK' }) ],
// ATTACK: 2
// HEAL: When you play two cards of the same Hero Class this turn, you may KO this Wound.
[ 1, makeEnragingWoundCard("Concussion", u, 2, 'PLAY', ({what}) => pastEvents('PLAY').has(ev => (what.color & ~Color.GRAY) && isColor(what.color)(ev.what))) ],
// ATTACK: 3
// To play this, you must discard three cards, then draw a card.
// HEAL: When you use a Superpower Ability this turn, you may KO this Wound. <i>(e.g. "[Strength]: You get +1 Attack.")</i>
[ 1, makeEnragingWoundCard("Erratic Powers", u, 3, 'CLEANUP', ev => false, ev => drawEv(ev), { playCost: 3, playCostType: 'DISCARD' }) ], // TODO superpower trigger
// ATTACK: 2
// HEAL: When you defeat a Villain worth at least 2 VP this turn, you may KO this Wound.
[ 1, makeEnragingWoundCard("Insults and Injuries", u, 2, 'DEFEAT', ev => isVillain(ev.what) && ev.what.vp >= 2) ],
// ATTACK: 4
// To play this, you must gain a Wound to the top of your deck.
// HEAL: When you KO another Wound this turn, you may KO this Wound.
[ 1, makeEnragingWoundCard("Last Breath", u, 4, 'KO', (ev, c) => isWound(ev.what) && owner(ev.what) === owner(c), ev => gainWoundToDeckEv(ev)) ],
// ATTACK: 3
// To play this, you must discard a card.
// HEAL: When you discard a card this turn <i>(not including discarding to play this card or discarding at the end of your turn)</i> you may KO this Wound.
[ 1, makeEnragingWoundCard("Massive Blood Loss", u, 3, 'DISCARD', (ev, c) => ev.who === owner(c) && ev.getSource() !== c, u, { playCost: 1, playCostType: 'DISCARD' })],
// RECRUIT: 1
// ATTACK: 1
// HEAL: When you recruit two Heroes this turn, you may KO this Wound.
[ 1, makeEnragingWoundCard("Shell Shock", 1, 1, 'RECRUIT', ev => isHero(ev.what) && pastEvents('RECRUIT').has(ev => isHero(ev.what))) ],
// RECRUIT: 2
// HEAL: When you recruit a Hero that costs 7 or more this turn, you may KO this Wound.
[ 1, makeEnragingWoundCard("Sudden Terror", 2, u, 'RECRUIT', ev => ev.what.cost >= 7) ],
// ATTACK: 2
// HEAL: When you defeat a Henchman this turn, you may KO this Wound.
[ 1, makeEnragingWoundCard("Wild Rage", u, 2, 'DEFEAT', ev => isHenchman(ev.what)) ],
]);
