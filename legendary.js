"use strict";

// Random Number Generator
function RNG(seed) {
  this.m = 0x100000000;
  this.a = 1103515245;
  this.c = 12345;
  this.state = seed === undefined ? Math.floor(Math.random() * (this.m-1)) : seed;
}
RNG.prototype.nextInt = function() {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
};
RNG.prototype.nextFloat = function() {
  return this.nextInt() / (this.m - 1);
};
RNG.prototype.nextRange = function(start, end) {
  let rangeSize = end - start;
  let randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
};
RNG.prototype.choice = function(array) {
  return array[this.nextRange(0, array.length)];
};
let shuffleArray = function(a, r) {
    let len = a.length;
    let i = len;
    while (i--) {
	let p = r.nextRange(0,len);
	let t = a[i];
	a[i] = a[p];
	a[p] = t;
    }
};

// Game primitives: Cards
let Card = function(t) {
  this.cardType = t;
};
Card.prototype = {
  get cost() { return this.printedCost || 0; },
  get attack() { return this.printedAttack; },
  get recruit() { return this.printedRecruit; },
  get baseDefense() {
    if (this.varDefense) return this.varDefense(this);
    return this.printedDefense;
  },
  get defense() {
    let value = getModifiedStat(this, "defense", this.baseDefense);
    return value < 0 ? 0 : value;
  },
  get vp() {
    if (this.varVP) return this.varVP(this);
    return this.printedVP;
  },
  isPlayable: function () { return this.playable; },
  isHealable: function () { return this.cardType === "WOUND"; },
  isVillain: function () { return this.cardType === "VILLAIN"; },
  isColor: function(c) { return (this.color & c) !== 0; },
  isTeam: function(t) { return this.team === t; },
  isGroup: function(t) { return this.villainGroup === t; },
  attachedCards: function (name) { return attachedCards(name, this); },
  attachedCount: function (name) { return attachedCount(name, this); },
};
let Color = {
  RED:1,
  YELLOW:2,
  BLACK:4,
  BLUE:8,
  GREEN:16,
  GRAY:32,
  MAX:32
};
Color.COVERT = Color.RED;
Color.TECH = Color.BLACK;
Color.RANGED = Color.BLUE;
Color.STRENGTH = Color.GREEN;
Color.INSTINCT = Color.YELLOW;
Color.BASIC = Color.GRAY;
function makeHeroCard(hero, name, cost, recruit, attack, color, team, flags, effects, abilities) {
  let c = new Card("HERO");
  c.printedCost = cost;
  c.printedRecruit = recruit;
  c.printedAttack = attack;
  c.cardName = name;
  c.heroName = hero;
  c.color = color;
  c.team = team;
  c.playable = true;
  c.flags = flags;
  c.effects = typeof effects === "function" ? [ effects ] : effects;
  if (abilities) for (let i in abilities) c[i] = abilities[i];
  return c;
}
function makeVillainCard(group, name, defense, vp, abilities) {
  let c = new Card("VILLAIN");
  c.printedDefense = defense;
  c.printedVP = vp;
  c.cardName = name;
  c.villainGroup = group;
  c.fightable = true;
  if (abilities) for (let i in abilities) c[i] = abilities[i];
  return c;
}
function makeMastermindCard(name, defense, vp, leads, strike, tactics, abilities) {
  let c = new Card("MASTERMIND");
  c.printedDefense = defense;
  c.printedVP = vp;
  c.cardName = name;
  c.leads = leads;
  c.fightable = true;
  c.strike = strike;
  c.tacticsTemplates = tactics.map(function (e) {
    let t = new Card("TACTICS");
    t.printedVP = vp;
    t.printedDefense = defense;
    t.cardName = e[0];
    t.fight = e[1];
    t.mastermind = c;
    return t;
  });
  if (abilities) for (let i in abilities) c[i] = abilities[i];
  return c;
}
function makeBystanderCard(name, rescue) {
  let c = new Card("BYSTANDER");
  c.printedVP = 1;
  c.cardName = name;
  c.rescue = rescue;
  return c;
}
function makeWoundCard(cond, heal, name) {
  let c = new Card("WOUND");
  c.heal = heal;
  c.healCond = cond;
  if (name) c.cardName = name;
  return c;
}
function makeHenchmenCard(name, defense, abilities) {
  return makeVillainCard(undefined, name, defense, 1, abilities);
}
function makeCardInPlay(c, where, bottom) {
  if (c.ctype === "P") throw TypeError("need card template");
  let r = Object.create(c);
  r.id = (r.cardName || r.cardType) + '@' + gameState.nextId++;
  r.instance = c;
  r.ctype = "P";
  if (bottom) where._putBottom(r);
  else where._put(r);
  return r;
}
function makeCardCopy(c) {
  if (c.ctype !== 'P') throw TypeError("need card in play");
  let r = Object.create(Object.getPrototypeOf(c));
  r.id = c.id + '@COPY@' + gameState.nextId++;
  r.ctype = "P";
  // Artifact specials - choose which ability -- embed in artifact play effect
  return r;
}
function makeCardCopyPaste(c, p) {
  if (c.ctype !== 'P') throw TypeError("need card in play");
  if (p.ctype !== 'P') throw TypeError("need card in play");
  let color = p.color | c.color;
  Object.setPrototypeOf(p, Object.getPrototypeOf(c));
  p.color = color;
  // TODO: copy other tmp state (MOoT?)
  // TODO: remove tmp state from result?
  // TODO Return to stack effects - trigger replace move to sidekick/new recruit stacks (they should check if the instance is correct)
  return p;
}
function moveCard(c, where, bottom) {
  // Card copies do not have a location and cannot be moved
  if (!c.instance) return;
  if (c.ctype !== 'P') throw TypeError("need card in play");
  if (!c.location) {
    TypeError("Moving card without location " + c);
    console.log(c);
  };
  c.location.remove(c);
  // Remove copy pasting
  if (Object.getPrototypeOf(c) !== c.instance) {
    delete c.color;
    Object.setPrototypeOf(c, c.instance);
  }
  // TODO remove other temp state? (depending on target?)
  if (bottom) where._putBottom(c);
  else where._put(c);
}
function moveAll(from, to, bottom) {
  while (from.size) moveCard(from.top, to, bottom);
}
// Game primitives: Decks
let Deck = function(name, faceup) {
  this.id = name;
  this.deck = [];
  this.faceup = faceup === true;
  Deck.prototype.deckList.push(this);
};
Deck.prototype = {
  get size() { return this.deck.length; },
  addNewCard: function(c, n) { let r = undefined; for (let i = 0; i < (n || 1); i++) r = makeCardInPlay(c, this); return r; },
  _put: function(c) { this.deck.push(c); c.location = this; },
  _putBottom: function(c) { this.deck.unshift(c); c.location = this; },
  shuffle: function() { shuffleArray(this.deck, gameState.gameRand); },
  get bottom() { return this.deck[0]; },
  get top() { return this.deck[this.deck.length - 1]; },
  get first() { return this.deck[0]; },
  get last() { return this.deck[this.deck.length - 1]; },
  remove: function(c) { let p = this.deck.indexOf(c); if (p >= 0) this.deck.splice(p, 1); return p >= 0; },
  limit: function(c) { return limit(this.deck, c); },
  count: function(c) { return count(this.deck, c); },
  has: function(c) { return count(this.deck, c) > 0; },
  each: function(f) { this.deck.forEach(f); },
  withTop: function(f) { if (this.size !== 0) f(this.top); },
  withFirst: function(f) { if (this.size !== 0) f(this.first); },
  withLast: function(f) { if (this.size !== 0) f(this.last); },
  attachedCards: function (name) { return attachedCards(name, this); },
  attachedCount: function (name) { return attachedCount(name, this); },
  deckList: [],
};

Array.prototype.count = function (f) { return count(this, f); };
Object.defineProperty(Array.prototype, 'size', { get: function() { return this.length; } });
Array.prototype.shuffle = function () { shuffleArray(this, gameState.gameRand); };
Array.prototype.limit = function (f) { return limit(this, f); };
Array.prototype.has = function (f) { return count(this, f) > 0; };
Array.prototype.each = function (f) { return this.forEach(f); };
Object.defineProperty(Array.prototype, 'first', { get: function() { return this[0]; }, set: function(v) { return this[0] = v; } });
Object.defineProperty(Array.prototype, 'last', { get: function() { return this[this.size-1]; }, set: function(v) { return this[this.size - 1] = v; } });
Array.prototype.withFirst = function (f) { if (this.size !== 0) f(this.first); };
Array.prototype.withLast = function (f) { if (this.size !== 0) f(this.last); };
function repeat(n, f) { for (let i = 0; i < n; i++) f(i); }

let Event = function (ev, type, params) {
  this.parent = ev;
  this.type = type;
  if (typeof params === "function") {
    this.func = params;
  } else for (let i in params) {
    this[i] = params[i];
  }
  if (!this.ui && (!this.func || typeof this.func !== "function")) throw TypeError("No function in event");
};
Event.prototype = {
  getSource: function () {
    for (let ev = this; ev; ev = ev.parent) {
      if (ev.source) return ev.source;
    }
    return undefined;
  },
};

// Card definitions
let cardTemplates = {
  HEROES: [],
  HENCHMEN: [],
  VILLAINS: [],
  MASTERMINDS: [],
  SCHEMES: [],
  BYSTANDERS: [],
};
function addTemplates(type, set, templates) {
  templates.forEach(t => {
    t.set = set;
    cardTemplates[type].push(t);
  });
}
function findTemplate(type, attr) { return name => cardTemplates[type].filter(t => t[attr] === name)[0]; }
function findHeroTemplate(name) { return findTemplate('HEROES', 'name')(name); }
function findHenchmanTemplate(name) { return findTemplate('HENCHMEN', 'cardName')(name); }
function findVillainTemplate(name) { return findTemplate('VILLAINS', 'name')(name); }
function findMastermindTemplate(name) { return findTemplate('MASTERMINDS', 'cardName')(name); }
function findSchemeTemplate(name) { return findTemplate('SCHEMES', 'cardName')(name); }
function findBystanderTemplate(name) { return findTemplate('BYSTANDERS', 'set')(name); }
let u = undefined;
let sa = makeHeroCard('HERO', 'SHIELD AGENT',   0, 1, u, Color.GRAY, "S.H.I.E.L.D.");
let sb = makeHeroCard('HERO', 'SHIELD TROOPER', 0, u, 1, Color.GRAY, "S.H.I.E.L.D.");
let officerTemplate = makeHeroCard('MARIA HILL', 'SHIELD OFFICER', 3, 2, u, Color.GRAY, "S.H.I.E.L.D.");
addTemplates("BYSTANDERS", "Legendary", [{ card: [ 30, makeBystanderCard() ] }]);
let twistTemplate = new Card("SCHEME TWIST");
let strikeTemplate = new Card("MASTER STRIKE");
let woundTemplate = makeWoundCard(function (ev) {
  return !turnState.recruitedOrFought;
}, function (ev) {
  playerState.hand.limit(isWound).forEach(function (w) { KOEv(ev, w); });
  turnState.noRecruitOrFight = true;
});

function makeSchemeCard(name, counts, effect, triggers, initfunc) {
  let c = new Card('SCHEME');
  c.cardName = name;
  c.params = counts;
  c.twist = effect;
  if (triggers) c.triggers = triggers instanceof Array ? triggers : [ triggers ];
  if (initfunc) c.init = initfunc;
  return c;
}

let eventQueue = [];
let eventQueueNew = [];
let turnState = undefined;
let playerState = undefined;
let gameState = undefined;
const undoLog = {
  actions: [],
  pos: 0,
  init: function () {
    this.pos = 0;
    this.fromString(localStorage.legendaryLog);
  },
  get replaying() { return this.pos < this.actions.length; },
  read: function() { return this.actions[this.pos++]; },
  readInt: function() { return parseInt(this.read()); },
  readInts: function() { return this.read().split(',').map(v => parseInt(v)); },
  write: function(v) {
    const strValue = v.toString();
    this.actions[this.pos++] = strValue;
    localStorage.legendaryLog = this.toString();
  },
  undo: function() { this.actions.pop(); this.pos = 0; },
  restart: function () { this.actions.splice(1); this.pos = 0; },
  newGame: function () { this.actions = []; this.pos = 0; },
  toString: function () {
    return this.actions.map(v => v.length === 1 ? v : `[${v}]`).join('');
  },
  fromString: function (input) {
    this.actions = [];
    if (input)
      this.actions = input.match(/\[.*?\]|./g).map(s => s.replace(/[\[\]]/g,''));
  },
};
const textLog = {
  text: "",
  log: function(s) { this.text += s + '<br>'; },
};

// State init
function initGameState() {
Deck.prototype.deckList = [];
textLog.text = "";
eventQueue = [];
eventQueueNew = [];
turnState = undefined;
playerState = {
  name: "Player 1",
  deck: new Deck('DECK0'),
  discard: new Deck('DISCARD0', true),
  hand: new Deck('HAND0', true),
  victory: new Deck('VICTORY0', true),
  revealed: new Deck('REVEALED0', true),
};
playerState.deck.owner = playerState.discard.owner = playerState.hand.owner = playerState.victory.owner = playerState.revealed.owner = playerState;
playerState.left = playerState.right = playerState;
gameState = {
  type: "STATE",
  nextId: 0,
  twistCount: 0,
  gameRand: undefined,
  playArea: new Deck('PLAYAREA', true),
  escaped: new Deck('ESCAPED'),
  villaindeck: new Deck('VILLAIN', true),
  mastermind: new Deck('MASTERMIND', true),
  ko: new Deck('KO', true),
  herodeck: new Deck('HERO'),
  officer: new Deck('SHIELDOFFICER', true),
  wounds: new Deck('WOUNDS', true),
  scheme: new Deck('SCHEME', true),
  bystanders: new Deck('BYSTANDERS', true),
  hq: [
    new Deck("HQ1", true),
    new Deck("HQ2", true),
    new Deck("HQ3", true),
    new Deck("HQ4", true),
    new Deck("HQ5", true),
  ],
  city: [
    new Deck("BRIDGE", true),
    new Deck("ROOFTOPS", true),
    new Deck("STREETS", true),
    new Deck("BANK", true),
    new Deck("SEWERS", true),
  ],
  params: {
    vd_henchmen: [ 0, 1, 1, 2, 2 ],
    vd_villain: [ 1, 2, 3, 3, 4 ],
    vd_bystanders: [ 1, 2, 8, 8, 12 ],
    heroes: [ 3, 5, 5, 5, 6 ],
    wounds: 30,
  },
  triggers: [
    { // Trigger RUNOUT events.
      event: "MOVECARD",
      match: ev => ["VILLAIN", "HERO", "WOUNDS", "BINDINGS"].includes(ev.from.id),
      after: ev => { if (!ev.parent.from.size) runOutEv(ev, ev.parent.from.id); },
    },
    { // Replace HQ cards.
      event: "MOVECARD",
      match: function (ev) { return ev.from.isHQ; },
      after: function (ev) { if (gameState.herodeck.size) moveCardEv(ev, gameState.herodeck.top, ev.parent.from); },
    },
    { // Shift city on entry.
      event: "MOVECARD",
      match: function (ev) { return ev.to.isCity && ev.to.size; },
      before: function (ev) { let to = ev.parent.to; if (to.next) moveCardEv(ev, to.top, to.next); else villainEscapeEv(ev, to.top); },
    },
    { // Win by defeating masterminds
      event: "DEFEAT",
      match: function (ev) { return ev.what.location === gameState.mastermind; },
      after: function (ev) { if (!gameState.mastermind.has(c => !c.tacticsTemplates || c.attachedCount("TACTICS"))) gameOverEv(ev, "WIN"); },
    },
    { // Loss by villain deck or hero deck running out
      event: "CLEANUP",
      match: () => true,
      after: ev => { if (!gameState.villaindeck.size || !gameState.herodeck.size) gameOverEv(ev, "DRAW"); },
    },
  ],
  endDrawAmount: 6,
  modifiers: {},
  players: [ playerState ],
  advancedSolo: true,
  villainsEscaped: 0,
  bystandersCarried: 0,
};
if (undoLog.replaying) {
  gameState.gameRand = new RNG(undoLog.readInt());
} else {
  gameState.gameRand = new RNG();
  undoLog.write(gameState.gameRand.state);
}
gameState.cityEntry = gameState.city[4];

for (let i = 0; i < 5; i++) {
  gameState.hq[i].below = gameState.city[i];
  gameState.city[i].above = gameState.hq[i];
  gameState.city[i].isCity = true;
  gameState.hq[i].isHQ = true;
  if (i) gameState.city[i].next = gameState.city[i - 1];
}

let gameSetup = {
/* S01M01
  scheme: "Portals to the Dark Dimension",
  mastermind: "Dr. Doom",
  henchmen: ["Hand Ninjas"],
  villains: ["Brotherhood"],
  heroes: [ "Black Widow", "Cyclops", "Gambit" ],

   S01M02
  scheme: "Unleash the Power of the Cosmic Cube",
  mastermind: "Red Skull",
  henchmen: ["Savage Land Mutates"],
  villains: ["Radiation"],
  heroes: [ "Black Widow", "Captain America", "Thor" ],

   S01M03
  scheme: "Midtown Bank Robbery",
  mastermind: "Loki",
  henchmen: ["Hand Ninjas"],
  villains: ["Brotherhood"],
  heroes: [ "Hawkeye", "Rogue", "Wolverine" ],

   S02M04
  scheme: "Unleash the Power of the Cosmic Cube",
  mastermind: "Dr. Doom",
  henchmen: ["Savage Land Mutates"],
  villains: ["Enemies of Asgard"],
  heroes: [ "Deadpool", "Iron Man", "Wolverine" ],
*/
  scheme: "Portals to the Dark Dimension",
  mastermind: "Dr. Doom",
  henchmen: ["Sentinel"],
  villains: ["Masters of Evil"],
  heroes: [ "Cyclops", "Gambit", "Hawkeye" ],
  bystanders: ["Legendary"],
  withOfficers: true,
  withWounds: true,
};
function getGameSetup(scheme, mastermind) {
  let setup = {
    scheme,
    mastermind,
    henchmen: [],
    villains: [],
    heroes: [],
    bystanders: undefined,
    withOfficers: undefined,
    withWounds: undefined,
  };
  return setup;
}
// Init Scheme
gameState.scheme.addNewCard(findSchemeTemplate(gameSetup.scheme));
if (gameState.scheme.top.triggers)
gameState.triggers = gameState.triggers.concat(gameState.scheme.top.triggers);
// Init starting decks
gameState.players.forEach(p => {
  p.deck.addNewCard(sa, 8);
  p.deck.addNewCard(sb, 4);
  p.deck.shuffle();
});
// Init hero deck and populate initial HQ
gameSetup.heroes.map(findHeroTemplate).forEach(h => {
  gameState.herodeck.addNewCard(h.c1, 5);
  gameState.herodeck.addNewCard(h.c2, 5);
  gameState.herodeck.addNewCard(h.uc, 3);
  gameState.herodeck.addNewCard(h.ra);
});
gameState.herodeck.shuffle();
gameState.hq.forEach(x => moveCard(gameState.herodeck.top, x));
// Init auxiliary decks
if (gameSetup.withOfficers) gameState.officer.addNewCard(officerTemplate, 30);
if (gameSetup.withWounds) gameState.wounds.addNewCard(woundTemplate, getParam('wounds'));
gameSetup.bystanders.map(findBystanderTemplate).forEach(c => gameState.bystanders.addNewCard(c.card[1], c.card[0]));
//// TODO sidekicks
// Init villain deck
gameSetup.henchmen.map(findHenchmanTemplate).forEach(h => gameState.villaindeck.addNewCard(h, 3));
gameSetup.villains.map(findVillainTemplate).forEach(v => v.cards.forEach(c => gameState.villaindeck.addNewCard(c[1], c[0])));
gameState.villaindeck.addNewCard(strikeTemplate, gameState.players.length === 1 && !gameState.advancedSolo ? 1 : 5);
gameState.villaindeck.addNewCard(twistTemplate, getParam('twists'));
for (let i = 0; i < getParam('vd_bystanders'); i++)
  moveCard(gameState.bystanders.top, gameState.villaindeck);
gameState.villaindeck.shuffle();
// Init Mastermind
{
  let mastermind = findMastermindTemplate(gameSetup.mastermind);
  gameState.mastermind.addNewCard(mastermind);
  let tactics = gameState.mastermind.top.attachedCards('TACTICS');
  mastermind.tacticsTemplates.forEach(function (c) { tactics.addNewCard(c); });
  tactics.shuffle();
}
// Draw initial hands
for (let i = 0; i < gameState.endDrawAmount; i++) gameState.players.forEach(p => moveCard(p.deck.top, p.hand));
if (gameState.scheme.top.init) gameState.scheme.top.init();
}

// Card effects functions
function isWound(c) { return c.cardType === "WOUND"; }
function isHero(c) { return c.cardType === "HERO"; }
function isVillain(c) { return c.cardType === "VILLAIN"; }
function isMastermind(c) { return c.cardType === "MASTERMIND"; }
function isEnemy(c) { return isVillain(c) || isMastermind(c); }
function isBystander(c) { return c.cardType === "BYSTANDER"; }
function isPlayable(c) { return c.isPlayable(); }
function isHealable(c) { return c.isHealable(); }
function isColor(col) { return function (c) { return c.isColor(col); }; }
function isTeam(team) { return function (c) { return c.isTeam(team); }; }
function isGroup(group) { return c => c.isGroup(group); }
function limit(cards, cond) {
  if (cards instanceof Deck) throw new TypeError();
  if (cond === undefined) return cards;
  return cards.filter(typeof cond === "function" ? cond : typeof cond === "number" ? isColor(cond) : isTeam(cond));
}
function count(cards, cond) { return limit(cards, cond).length; }

function handOrDiscard(p) {
  p = p || playerState;
  return p.hand.deck.concat(playerState.discard.deck);
}
function owned(p) {
  p = p || playerState;
  let r = p.hand.deck.concat(playerState.discard.deck, playerState.deck.deck, playerState.revealed.deck, playerState.victory.deck);
  return p === playerState ? r.concat(gameState.playArea.deck) : r;
}
function soloVP() {
  if (gameState.players.length > 1) return 0;
  return - gameState.villainsEscaped - 4 * gameState.bystandersCarried - 3 * gameState.twistCount;
}
function currentVP(p) {
  return owned(p).map(c => c.vp || 0).reduce((a, b) => a + b, 0) + soloVP();
}
function HQCards() { return gameState.hq.map(e => e.top).limit(e => e !== undefined); }
function CityCards() { return gameState.city.map(e => e.top).limit(e => e !== undefined); }
function HQCardsHighestCost() {
  let all = HQCards();
  let maxCost = 0;
  all.forEach(function (c) { if (c.cost > maxCost) maxCost = c.cost; });
  return all.limit(function (c) { return c.cost === maxCost; });
}
function villainOrMastermind() {
  return villains().concat(gameState.mastermind.deck);
}
function villains() {
  return CityCards().limit(isVillain);
}
function villainIn(where) {
  return CityCards().limit(isVillain).limit(c => c.location.id === where);
}
function hasBystander(c) { return c.attachedCount('BYSTANDER') > 0; }
function eachOtherPlayer(f) { let r = gameState.players.filter(function (e) { return e !== playerState; }); if (f) r.forEach(f); return r; }
function eachOtherPlayerVM(f) { return gameState.advancedSolo ? eachPlayer(f) : eachOtherPlayer(f); }
function eachPlayer(f) { if (f) gameState.players.forEach(f); return gameState.players; }
function eachPlayerEv(ev, f) { eachPlayer(p => event(ev, "EFFECT", { who:p, func:f })); }
function revealable(who = playerState) {
  // TODO: also artifacts and maybe MOoT
  if (who !== playerState) return who.hand.deck;
  return who.hand.deck.concat(gameState.playArea.deck);
}
function yourHeroes(who) { return revealable(who).limit(isHero); }
function numColorsYouHave() {
  let all = 0;
  let num = 0;
  yourHeroes(playerState).forEach(c => { all = all | c.color; });
  for (let i = 1; i <= Color.MAX; i *= 2) if (all & i) num++;
  return num;
}

function superPower(color) { return count(turnState.cardsPlayed, color); }
function addEndDrawMod(a) { turnState.endDrawMod = (turnState.endDrawMod || 0) + a; }
function setEndDrawAmount(a) { turnState.endDrawAmount = a; }

function addMod(modifiers, stat, cond, func) {
  if (!modifiers[stat]) modifiers[stat] = [];
  modifiers[stat].push({ cond, func });
}
function makeModFunc(value) {
  if (typeof value === "number") return v => v + value;
  return (c, v) => v + value(c);
}
function addTurnMod(stat, cond, value) { addMod(turnState.modifiers, stat, cond, makeModFunc(value)); }
function addStatMod(stat, cond, value) { addMod(gameState.modifiers, stat, cond, makeModFunc(value)); }
function addStatSet(stat, cond, func) { addMod(gameState.modifiers, stat, cond, func); }
function modifyStat(c, modifiers, value) {
  return (modifiers || []).filter(mod => mod.cond(c)).reduce((v, mod) => mod.func(c, v), value);
}
function getModifiedStat(c, stat, value) {
  return modifyStat(c, turnState.modifiers[stat], modifyStat(c, gameState.modifiers[stat], value));
}
// Game engine functions
function getParam(name) {
  let s = gameState.scheme.top;
  let r = name in s.params ? s.params[name] : gameState.params[name];
  return r instanceof Array ? r[gameState.players.length - 1] : r;
}
function attachedCards(name, where) {
  if (!(where instanceof Deck || where instanceof Card)) {
    console.log("Need deck or card to attach to");
  }
  if (!where.attached) where.attached = {};
  if (!where.attached[name])
    where.attached[name] = new Deck(where.id + '/' + name);
  where.attached[name].attachedTo = where;
  return where.attached[name];
}
function attachedCount(name, where) {
  if (!(where instanceof Deck || where instanceof Card)) {
    console.log("Need deck or card to attach to");
  }
  if (!where.attached) return 0;
  if (!where.attached[name]) return 0;
  return where.attached[name].size;
}
function pushEvents(ev) {
  let evs = ev instanceof Array ? ev : arguments;
  for (let i = 0; i < evs.length; i++) {
    eventQueueNew = eventQueueNew.concat(addTriggers(evs[i]));
  }
}
function joinQueue() {
  eventQueue = eventQueueNew.concat(eventQueue);
  eventQueueNew = [];
}
function popEvent() {
  joinQueue();
  return eventQueue.shift() || new Event(gameState, "TURN", {
    recruit: 0,
    attack: 0,
    totalRecruit: 0,
    cardsPlayed: [],
    cardsDrawn: 0,
    modifiers: {},
    triggers: [],
    func: playTurn
  });
}
function uiEvent() {
  joinQueue();
  return eventQueue[0] && eventQueue[0].ui;
}

function canRecruit(c) {
  return turnState.recruit >= c.cost;
}
function canFight(c) {
  if (c.fightCond && !c.fightCond(c)) return false;
  let a = turnState.attack;
  if (c.bribe || turnState.attackWithRecruit) a += turnState.recruit;
  return a >= c.defense;
}
function canHeal(c) {
  if (!c.isHealable()) return false;
  return c.healCond ? c.healCond() : true;
}
function canPlay(c) {
  let type = c.playCostType;
  let val = c.playCost;
  if (type === undefined) return true;
  if (type === "DISCARD" || type === "TOPDECK")
    return playerState.hand.count(i => i !== c) >= val;
  throw TypeError(`unknown play cost: ${type}`);
}
function healCard(ev) {
  event(ev, "EFFECT", { source: ev.what, func: ev.what.heal });
}
function getActions(ev) {
  let p = playerState.hand.limit(c => isPlayable(c) && canPlay(c)).map(e => (new Event(ev, "PLAY", { func: playCard, what: e })));
  p = p.concat(playerState.hand.limit(canHeal).map(e => (new Event(ev, "HEAL", { func: healCard, what: e }))));
  if (!turnState.noRecruitOrFight) {
  // TODO any deck with recruitable
  p = p.concat(HQCards().limit(canRecruit).map(d => (new Event(ev, "RECRUIT", { func: buyCard, what: d }))));
  // TODO any deck with fightable
  p = p.concat(CityCards().limit(canFight).map(d => (new Event(ev, "FIGHT", { func: villainFight, what: d }))));
  if (gameState.mastermind.size && gameState.mastermind.top.attached.TACTICS.size && canFight(gameState.mastermind.top))
    p.push((new Event(ev, "FIGHT", { func: villainFight, what: gameState.mastermind.top })));
  if (gameState.officer.size && canRecruit(gameState.officer.top))
    p.push((new Event(ev, "RECRUIT", { func: buyCard, what: gameState.officer.top })));
  }
  if (gameState.specialActions) p = p.concat(gameState.specialActions(ev));
  p = p.concat(new Event(ev, "ENDOFTURN", { confirm: p.length > 0, func: ev => ev.parent.endofturn = true }));
  return p;
}

function addAttackEvent(ev, c) { event(ev, "ADDATTACK", { func: ev => turnState.attack += ev.amount, amount: c }); }
function addRecruitEvent(ev, c) { event(ev, "ADDRECRUIT", { func: ev => { turnState.recruit += ev.amount; turnState.totalRecruit += ev.amount; }, amount: c }); }
function moveCardEv(ev, what, where, bottom) {
  if (!what.instance) return;
  event(ev, "MOVECARD", { func: ev => moveCard(ev.what, ev.to, ev.bottom), what: what, to: where, bottom: bottom, from: what.location });
}
// Swaps contents of 2 city spaces
function swapCardsEv(ev, where1, where2) {
  cont(ev, () => {
    const what1 = where1.top;
    const what2 = where2.top;
    if (what1) moveCard(what1, where2);
    if (what2) moveCard(what2, where1);
  });
}
function attachCardEv(ev, what, to, name) { console.log(`attaching as ${name} to `, to); moveCardEv(ev, what, to.attachedCards(name)); }
function recruitForFreeEv(ev, card, who) {
  who = who || playerState;
  event(ev, "RECRUIT", { func: buyCard, what: card, forFree: true });
}
function discardEv(ev, card) { event(ev, "DISCARD", { what: card, func: ev => moveCardEv(ev, ev.what, ev.what.location.owner.discard) }); }
function discardHandEv(ev, who) { (who || playerState).hand.each(c => discardEv(ev, c)); }
function drawIfEv(ev, cond, who) {
    let draw = false;
    who = who || playerState;
    lookAtDeckEv(ev, 1, () => draw = who.revealed.has(cond), who);
    cont(ev, () => { if (draw) drawEv(ev, 1, who); });
}
function KOEv(ev, card) { event(ev, "KO", { what: card, func: ev => moveCardEv(ev, ev.what, gameState.ko) }); }
function evilWinsEv(ev) { gameOverEv(ev, 'LOSS'); }
function gameOverEv(ev, result) {
  let desc = result === "LOSS" ? "Evil Wins" : result === "WIN" ? "Good Wins" : "Draw between Good and Evil";
  textLog.log("Game Over: " + desc);
  event(ev, "GAMEOVER", { ui: true, result: result, desc: desc });
}
function runOutEv(ev, deck) { event(ev, "RUNOUT", { what: deck, func: () => {} }); }
function captureEv(ev, villain, what) {
  if (what) event(ev, "CAPTURE", { func: ev => attachCardEv(ev, ev.what, ev.villain, "BYSTANDER"), what: what, villain: villain });
  else cont(ev, () => {
    if (gameState.bystanders.top) event(ev, "CAPTURE", { func: ev => attachCardEv(ev, ev.what, ev.villain, "BYSTANDER"), what: gameState.bystanders.top, villain: villain });
  });
}
function gainWoundEv(ev, who) {
  who = who || playerState;
  cont(ev, () => {
    if (gameState.wounds.top) gainEv(ev, gameState.wounds.top, who);
  });
}
function cont(ev, func) { event(ev, "EFFECT", func); }
function event(ev, name, params) { let nev = new Event(ev, name, params); pushEvents(nev); return nev; }
function selectObjectsMinMaxEv(ev, desc, min, max, objects, effect1, effect0, simple, who) {
  if (objects instanceof Deck) objects = objects.deck;
  who = who || playerState;
  if (objects.length === 0) {
    if (effect0) cont(ev, () => effect0());
  } else if (objects.length <= min && simple) {
    if (effect1) cont(ev, () => objects.forEach(effect1));
  } else {
    if (objects.length < min) min = objects.length;
    effect0 = effect0 || (() => {});
    effect1 = effect1 || (() => {});
    event(ev, "SELECTOBJECTS", { desc: desc, min:min, max:max, options: objects, ui: true, agent: who, result1: effect1, result0: effect0});
  }
}
function selectObjectsEv(ev, desc, num, objects, effect1, who) {
  selectObjectsMinMaxEv(ev, desc, num, num, objects, effect1, undefined, who);
}
function selectObjectsOptEv(ev, desc, num, objects, effect1, who) {
  selectObjectsMinMaxEv(ev, desc, 0, num, objects, effect1, undefined, who);
}
function selectObjectEv(ev, desc, objects, effect1, who) {
  selectObjectsMinMaxEv(ev, desc, 1, 1, objects, effect1, undefined, who);
}
function selectObjectOptEv(ev, desc, objects, effect1, who) {
  selectObjectsMinMaxEv(ev, desc, 0, 1, objects, effect1, undefined, who);
}

function selectCardOrEv(ev, cards, effect1, effect0, who) {
  if (cards instanceof Deck) cards = cards.deck;
  who = who || playerState;
  if (!cards.length) {
    if (effect0) effect0();
    return;
  }
  event(ev, "SELECTCARD1", { options: cards, ui: true, agent: who, result1: effect1 });
}
function selectCardEv(ev, cards, effect, who) { selectCardOrEv(ev, cards, effect, undefined, who); }
function selectCardAndKOEv(ev, cards, who) { selectCardEv(ev, cards, sel => KOEv(ev, sel), who); }
function selectCardOptEv(ev, cards, effect1, effect0, who) {
  if (cards instanceof Deck) cards = cards.deck;
  who = who || playerState;
  if (!cards.length) {
    if (effect0) effect0();
    return;
  }
  event(ev, "SELECTCARD01", { options: cards, ui: true, agent: who, result1: effect1, result0: effect0 || (() => {}) });
}
function revealOrEv(ev, cond, effect, who) {
  who = who || playerState;
  let cards = revealable(who).limit(cond);
  selectCardOptEv(ev, cards, () => {}, effect, who);
}
function revealAndEv(ev, cond, effect, who) {
  who = who || playerState;
  let cards = revealable(who).limit(cond);
  selectCardOptEv(ev, cards, effect, () => {}, who);
}
function chooseOneEv(ev, desc) {
  let a = arguments;
  let options = [];
  for (let i = 2; i < a.length; i += 2)
    options.push(new Event(ev, "EFFECT", { func: a[i+1], name: a[i] }));
  console.log(options);
  event(ev, "SELECTEVENT", { desc, options, ui: true, agent: playerState });
}
function chooseMayEv(ev, desc, effect, agent) {
  agent = agent || playerState;
  event(ev, "SELECTEVENT", { desc, options: [
      new Event(ev, "EFFECT", { func: effect, name: "Yes" }),
      new Event(ev, "EFFECT", { func: () => {}, name: "No" }),
  ], ui: true, agent });
}
function selectPlayerEv(ev, f, who) {
  if (gameState.players.length === 1) {
    f(playerState);
  } else selectObjectEv(ev, "Choose a Player", gameState.players, f, who); // TODO multiplayer
}
function pickDiscardEv(ev, who, agent) {
  who = who || playerState;
  agent = agent || who;
  selectCardEv(ev, who.hand, sel => discardEv(ev, sel), agent);
}
function pickTopDeckEv(ev, who, agent) {
  who = who || playerState;
  agent = agent || who;
  selectCardEv(ev, who.hand, sel => moveCardEv(ev, sel, who.deck), agent);
}
function lookAtDeckEv(ev, amount, action, who, agent) {
  who = who || playerState;
  agent = agent || who;
  for (let i = 0; i < amount; i++) cont(ev, ev => revealOne(ev, who));
  cont(ev, action);
  let cleanupRevealed = () => {
    if (who.revealed.size === 0) return;
    if (who.revealed.size === 1) moveCardEv(ev, who.revealed.top, who.deck);
    else selectCardEv(ev, who.revealed, sel => { moveCardEv(ev, sel, who.deck); cleanupRevealed(); }, agent);
  };
  cont(ev, cleanupRevealed);
}
function revealOne(ev, who) {
  if (!who.deck.size && !who.discard.size) {
  } else if (!who.deck.size) {
    event(ev, "RESHUFFLE", reshufflePlayerDeck);
    pushEvents(ev);
  } else {
    moveCardEv(ev, who.deck.top, who.revealed);
  }
}
function KOHandOrDiscardEv(ev, filter, func) {
  let cards = handOrDiscard();
  if (filter) cards = cards.limit(filter);
  selectCardOptEv(ev, cards, sel => { KOEv(ev, sel); cont(ev, func); });
}


function playCopyEv(ev, what) {
  event(ev, "PLAY", { func: playCard, what: makeCardCopy(what) });
}
function playCardEffects(ev, card) {
  card = card || ev.what;
  event(ev, "PLAYCARDEFFECTS", { source: card, func: ev => {
    if (card.playCostType === "DISCARD") pickDiscardEv(ev);
    if (card.attack) addAttackEvent(ev, card.attack);
    if (card.recruit) addRecruitEvent(ev, card.recruit);
    for (let i = 0; card.effects && i < card.effects.length; i++) {
      event(ev, "EFFECT",  { source: card, func: card.effects[i] } );
    }
    cont(ev, () => turnState.cardsPlayed.push(card));
  }});
}
function playCard(ev) {
  if (!canPlay(ev.what)) return;
  moveCardEv(ev, ev.what, gameState.playArea);
  if (ev.what.copyPasteCard) {
    selectCardEv(ev, turnState.cardsPlayed, target => {
      console.log("COPYPASTE", ev.what, target);
      makeCardCopyPaste(target, ev.what);
      console.log("RESULT", ev.what);
      if (canPlay(ev.what)) playCardEffects(ev);
    });
  } else {
    playCardEffects(ev);
  }
}
function buyCard(ev) {
  if (!ev.forFree) {
    // TODO: other pay options
    turnState.recruit -= ev.what.cost;
  }
  turnState.recruitedOrFought = true;
  gainEv(ev, ev.what);
}
function gainEv(ev, card, who) {
  who = who || playerState;
  event(ev, "GAIN", { func: ev => moveCardEv(ev, ev.what, ev.where), what: card, where: who.discard });
}
function gainToHandEv(ev, card, who) {
  who = who || playerState;
  event(ev, "GAIN", { func: ev => moveCardEv(ev, ev.what, ev.where), what: card, where: who.hand });;
}
function cleanUp(ev) {
  moveAll(playerState.hand, playerState.discard);
  moveAll(gameState.playArea, playerState.discard);
  let drawAmount = (turnState.endDrawAmount || gameState.endDrawAmount) + (turnState.endDrawMod || 0);
  drawEv(ev, drawAmount);
}
function drawEv(ev, amount, who) {
  for (let i = 0; i < (amount || 1); i++)
    event(ev, "DRAW", { func: drawOne, who: who || playerState});
}
function drawOne(ev) {
  if (!ev.who.deck.size && !ev.who.discard.size) {
  } else if (!ev.who.deck.size) {
    event(ev, "RESHUFFLE", reshufflePlayerDeck);
    pushEvents(ev);
  } else {
    turnState.cardsDrawn++;
    moveCardEv(ev, ev.who.deck.top, ev.who.hand);
  }
}
function reshufflePlayerDeck() {
  moveAll(playerState.discard, playerState.deck);
  playerState.deck.shuffle();
}
function playTwistEv(ev, what) { event(ev, "TWIST", { func: playTwist, what: what }); }
function playTwist(ev) {
  let e = event(ev, "EFFECT", { source: gameState.scheme.top, func: gameState.scheme.top.twist, nr: ++gameState.twistCount, twist: ev.what });
  cont(ev, () => {
    if (gameState.players.length === 1) selectCardEv(ev, HQCards().limit(c => c.cost <= 6), function (sel) {
      if (gameState.advancedSolo)
        moveCardEv(ev, sel, gameState.herodeck, true);
      else
        KOEv(ev, sel);
    });
    if (e.another) villainDrawEv(e);
  });
}
function villainDrawEv(ev) { event(ev, "VILLAINDRAW", villainDraw); }
function villainDraw(ev) {
  let c = gameState.villaindeck.top;
  if (!c) {
  } else if (c.isVillain()) {
    moveCardEv(ev, c, gameState.cityEntry);
    if (c.ambush) event(ev, "EFFECT", { source: c, func: c.ambush });
  } else if (c.cardType === "MASTER STRIKE") {
    textLog.log("Master Strike!");
    moveCardEv(ev, c, gameState.ko);
    // TODO mastermind order
    gameState.mastermind.each(m => event(ev, "EFFECT", { source: m, func: m.strike }));
    if (gameState.advancedSolo) villainDrawEv(ev);
  } else if (c.cardType === "SCHEME TWIST") {
    textLog.log("Scheme Twist!");
    moveCardEv(ev, c, gameState.ko);
    playTwistEv(ev, c);
  } else if (c.cardType === "BYSTANDER") {
    let i = gameState.cityEntry;
    while (i && !i.size) i = i.next;
    if (!i) i = gameState.mastermind;
    if (!i.top) { // no mastermind?
      moveCardEv(ev, c, gameState.ko);
    } else {
      captureEv(ev, i.top, c);
      // TODO select mastermind in case of multiple
    }
  } else {
    console.log("dont know what to do with", c);
  }
}
function villainEscapeEv(ev, what) { event(ev, "ESCAPE", { what, func: villainEscape }); }
function villainEscape(ev) {
  let c = ev.what;
  let b = undefined;
  if (c.attachedCount('BYSTANDER')) b = c.attachedCards('BYSTANDER');
  gameState.villainsEscaped++;
  if (b) {
    gameState.bystandersCarried += b.size;
    b.each(function (bc) { moveCardEv(ev, bc, gameState.escaped); });
    eachPlayer(function(p) { pickDiscardEv(ev, p); });
  }
  moveCardEv(ev, c, gameState.escaped);
  selectCardEv(ev, HQCards().limit(c => c.cost <= 6), s => KOEv(ev, s));
  if (c.escape) event(ev, "EFFECT", { source: c, func: c.escape });
}
function villainFight(ev) {
  // TODO Deal with extra costs
  let c = ev.what;
  turnState.attack -= c.defense; // Use attack first
  if (turnState.attack < 0) { // Asume bribe
    // TODO Ask for spilt (optional)
    turnState.recruit += turnState.attack;
    turnState.attack = 0;
  }
  turnState.recruitedOrFought = true;
  defeatEv(ev, c);
}
function defeatEv(ev, c) {
  event(ev, "DEFEAT", { func: villainDefeat, what: c, where: c.location });
}
function villainDefeat(ev) {
  let c = ev.what;
  let b = undefined;
  if (c.attachedCount('BYSTANDER')) b = c.attachedCards('BYSTANDER');
  if (c.cardType === "MASTERMIND") c = c.attached.TACTICS.top;
  // TODO choose move order
  if (b) b.each(function (bc) { rescueEv(ev, bc); });
  moveCardEv(ev, c, playerState.victory);
  if (c.fight) event(ev, "EFFECT", { source: c, func: c.fight });
}
function rescueEv(ev, what) {
  if (what && typeof what !== "number") event(ev, "RESCUE", { func: rescueBystander, what: what });
  else for (let i = 0; i < (what || 1); i++) cont(ev, () => {
    if (gameState.bystanders.top) event(ev, "RESCUE", { func: rescueBystander, what: gameState.bystanders.top });
  });
}
function rescueBystander(ev) {
  let c = ev.what;
  moveCardEv(ev, c, playerState.victory);
  if (c.rescue) event(ev, "EFFECT", { source: c, func: c.rescue });
}
function addTurnTrigger(type, match, f) {
  const trigger = typeof f === "function" ? { after: f } : f;
  trigger.type = type;
  trigger.match = match || (() => true);
  turnState.triggers.push(trigger);
}
function findTriggers(ev) {
  let triggers = [];
  let checkTrigger = source => t => {
    if(t.event === ev.type && t.match(ev, source)) triggers.push({trigger:t, source:source});
  };
  let checkCardTrigger = c => {
    if (c.trigger) checkTrigger(c)(c.trigger);
  };
  gameState.triggers.forEach(checkTrigger(gameState));
  turnState.triggers.forEach(checkTrigger(turnState));
  playerState.hand.each(checkCardTrigger);
  playerState.revealed.each(checkCardTrigger);
  gameState.playArea.each(checkCardTrigger);
  return triggers;
}
function addTriggers(ev) {
  // TODO: more dynamic events (add generic { type:"TRIGGER", what:ev.type, when:"BEFORE" }), harder for replacement and steteful before/after triggers
  // TODO: order triggers
  let triggers = findTriggers(ev);
  let newev = [];
  triggers.forEach(function(t) {
    if (t.trigger.before)
      newev.push(t.state = new Event(ev, "EFFECT", { func:t.trigger.before, source:t.source }));
  });
  newev.push(ev);
  triggers.forEach(function(t) {
    if (t.trigger.after)
      newev.push(new Event(ev, "EFFECT", { func: t.trigger.after, source: t.source, state: t.state }));
  });
  triggers.forEach(function(t) {
    if (t.trigger.replace)
      newev = [ new Event(ev, "EFFECT", { func:t.trigger.replace, what:newev, source:t.source })];
  });
  return newev;
}
function playTurn(ev) {
  textLog.log("Turn Start");
  turnState = ev;
  villainDrawEv(ev);
  event(ev, "ACTIONS", ev => {
    if (!ev.endofturn) {
      event(ev, "SELECTEVENT", { desc: "Play card or action", options: getActions(ev), ui: true });
      pushEvents(ev);
    }
  });
  event(ev, "CLEANUP", cleanUp);  
}

// GUI
function imageName(path, name, subname) {
  if (subname !== undefined) name += "_" + subname;
  name = name.toLowerCase().replace(/ /g, "_").replace(/[^a-z0-9_]/g, "");
  return "images/" + path + "/" + name + ".png";
}
function cardImageName(card) {
  if (card.cardType === "HERO") return imageName("heroes", card.heroName, card.cardName);
  if (card.cardType === "VILLAIN" && card.villainGroup === undefined) return imageName("henchmen", card.cardName);
  if (card.cardType === "VILLAIN") return imageName("villains", card.villainGroup, card.cardName);
  if (card.cardType === "MASTERMIND") return imageName("masterminds", card.cardName);
  if (card.cardType === "TACTICS") return imageName("masterminds", card.mastermind.cardName, card.cardName);
  if (card.cardType === "SCHEME") return imageName("schemes", card.cardName);
  return imageName("", card.cardType);
}
function makeDisplayCard(c) {
  let res = `<span class="card" id="${c.id}" >${c.id}</span>`;
  if (c.attached) for (let i in c.attached) if (c.attached[i].size) {
    res += ' [ ' + i + ': ' + c.attached[i].deck.map(makeDisplayCard).join(' ') + ' ]';
  }
  return res;
}
function makeDisplayCardImg(c) {
  return `<IMG class="card" id="${c.id}" src="${cardImageName(c)}">`;
}
function makeDisplayBackImg(c) {
  return `<IMG class="card" id="${c.id}" src="images/back.png">`;
}
function makeDisplayPlayAreaImg(c) {
  const gone = gameState.playArea.deck.includes(c) ? "" : " gone";
  return `<IMG class="card${gone}" id="${c.id}" src="${cardImageName(c)}">`;
}
function displayDecks() {
  let divs = document.getElementsByClassName("deck");
  let list = Deck.prototype.deckList;
  let deckById = {};
  for (let i = 0; i < list.length; i++) deckById[list[i].id] = list[i];
  for (let i = 0; i < divs.length; i++) {
    let div = divs[i];
    let deck = deckById[div.id];
    let fanout = div.getAttribute("data-fanout");
    let mode = div.getAttribute("data-mode");
    if (mode === "IMG") {
      if (deck.id === "PLAYAREA") {
        div.innerHTML = turnState.cardsPlayed.map(makeDisplayPlayAreaImg).join('');
      } else if (!deck.faceup) {
        div.innerHTML = deck.deck.map(makeDisplayBackImg).join('');
      } else if (fanout) {
        div.innerHTML = deck.deck.map(makeDisplayCardImg).join('');
      } else {
        div.innerHTML = deck.size ? makeDisplayCardImg(deck.top) : '';
      }
    } else {
      div.innerHTML = deck.id + ': ' + deck.deck.map(makeDisplayCard).join(' ');
    }
  }
}
function eventSource(ev) {
  const s = ev.getSource();
  return s instanceof Card ? `<IMG class="card" src="${cardImageName(s)}">` : "";
}

function displayGame(ev) {
  displayDecks();
  document.getElementById("source").innerHTML = eventSource(ev);
  document.getElementById("recruit").innerHTML = turnState.recruit;
  document.getElementById("attack").innerHTML = turnState.attack;
  document.getElementById("vp").innerHTML = currentVP();
}

// Main loop
function mainLoopAuto() {
  let count = 0;
  function makeAction() {
    count++;
    let ev = popEvent();
    while (!ev.ui) { ev.func(ev); ev = popEvent(); }
    displayGame();
    ({
      "SELECTEVENT": function () { pushEvents(ev.options[0]); },
      "SELECTCARD1": function () { ev.result1(ev.options[0]); },
      "SELECTCARD01": function () { ev.result1(ev.options[0]); },
    }[ev.type] || ev.func)();
    if (count < 500) setTimeout(makeAction, 200);
  }
  setTimeout(makeAction, 0);
}
function setMessage(msg) {
  document.getElementById("message").innerHTML = msg;
}

function getEventName(ev) {
  if (ev.type === "ENDOFTURN") return "End Turn";
  if (ev.name) return ev.name;
  if (ev.what) return `${ev.type} ${ev.what}`;
  console.log("Unknown option", ev);
  return "Unknown option";
}
let clickActions = {};
function clickCard(ev) {
  for (let node = ev.target; node; node = node.parentNode) {
    if (node.id) console.log(node.id);
    if (node.id && clickActions[node.id]) {
      clickActions[node.id]();
      return;
    }
  }
}
function mainLoop() {
  let extraActions = [];
  clickActions = {};
  while (undoLog.replaying) {
  let ev = popEvent();
  ({
    "SELECTEVENT": function () { pushEvents(ev.options[undoLog.readInt() - 1]); },
    "SELECTCARD1": function () { ev.result1(ev.options[undoLog.readInt() - 1]); },
    "SELECTCARD01": function () {
      const v = undoLog.readInt();
      v ? ev.result1(ev.options[v - 1]) : ev.result0();
    },
    "SELECTOBJECTS": () => {
      const v = undoLog.readInts();
      v.length ? v.forEach(o => ev.result1(ev.options[o])) : ev.result0();
    }
  }[ev.type] || ev.func)(ev);
  }
  let ev = popEvent();
  while (!ev.ui) { ev.func(ev); ev = popEvent(); }
  displayGame(ev);
  console.log(">>> " + ev.type, ev);
  ({
    "SELECTEVENT": function () {
      ev.options.map((option, i) => {
        if (option.what && !clickActions[option.what.id]) {
          clickActions[option.what.id] = () => { pushEvents(option); undoLog.write(i + 1); mainLoop(); };
        } else {;
          extraActions.push({name: getEventName(option), confirm: option.confirm, func: () => { pushEvents(option); undoLog.write(i + 1); mainLoop(); }});
        }
      });
    },
    "SELECTCARD1": function () {
      ev.options.map((option, i) => clickActions[option.id] = () => { ev.result1(option); undoLog.write(i + 1); mainLoop(); });
    },
    "SELECTCARD01": function () {
      ev.options.map((option, i) => clickActions[option.id] = () => { ev.result1(option); undoLog.write(i + 1); mainLoop(); });
      extraActions = [{name: "None", func: () => { ev.result0(); undoLog.write(0); mainLoop(); }}];
    },
    "SELECTOBJECTS": function () {
      let selected = ev.options.map(() => false);
      ev.options.map((option, i) => clickActions[option.id] = () => {
        selected[i] = !selected[i];
        let cl = document.getElementById(option.id).classList;
        if (selected[i]) cl.add('selected'); else cl.remove('selected');
      });
      extraActions.push({name: "Confirm", func: () => {
        let num = selected.count(s => s);
        if (num < ev.min || num > ev.max) { console.log(`${num} not in ${ev.min}-${ev.max}`); return; }
        let indexes = selected.map((s, i) => s ? i : undefined).filter(i => i);
        indexes.forEach(i => ev.result1(ev.options[i]));
        if (num === 0) ev.result(0);
        undoLog.write(indexes.join(',')); mainLoop();
      }});
    },
    "GAMEOVER": function () {
    }
  }[ev.type])(ev);
  setMessage(ev.desc || "");
  console.log("UI> " + ev.type, ev, clickActions, extraActions);
  let extraActionsHTML = extraActions.map((action, i) => {
    const id = "!extraAction" + i;
    clickActions[id] = action.func;
    return `<span class="action${action.confirm === false ? " noconfirm" : ""}" id="${id}">${action.name}</span>`;
  }).join('<br>');
  Object.keys(clickActions).map(v => document.getElementById(v)).filter(e => e).forEach(e => {
    e.classList.add("select");
  });
  document.getElementById("extraActions").innerHTML = extraActionsHTML;
  document.getElementById("logContainer").innerHTML = `${undoLog.toString()}<br>${textLog.text}`;
}
function startGame() {
  initGameState();
  mainLoop();
}
function startApp() {
  undoLog.init();
  window.onclick = clickCard;
  document.getElementById("undo").onclick = () => { undoLog.undo(); startGame(); };
  document.getElementById("restart").onclick = () => { undoLog.restart(); startGame(); };
  document.getElementById("newGame").onclick = () => { undoLog.newGame(); startGame(); };
  startGame();
}
document.addEventListener('DOMContentLoaded', startApp, false);
/*
GUI:
Use new object selects, add description of existing card selections
Show attached cards and deck counts
Show hidden events
Select setup screen

ENGINE:
Use deck.(locationN|n)ame instead of deck.id
required villain/hero groups

other sets base functions: artifacts, special bystanders, sidekicks, divided cards
*/
