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
  c.color = color || Color.GRAY;
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
function makeCardInstance(src) {
  let c = Object.create(src);
  c.id = (c.cardName || c.cardType) + '@' + gameState.nextId++;
  c.ctype = "I";
  return c;
}
function makeCardInPlay(c, where, bottom) {
  if (c.ctype !== 'I') throw TypeError("need card instance");
  let r = Object.create(c);
  r.instance = c;
  r.ctype = "P";
  r.location = where;
  if (bottom) where._putBottom(r);
  else where._put(r);
  return r;
}
function makeCardCopy(c) {
  if (c.ctype !== 'P') throw TypeError("need card in play");
  let i = c.copyOf || c.instance;
  let r = makeCardInPlay(i, undefined);
  r.copyOf = i;
  delete r.instance;
  // Artifact specials - choose which ability -- embed in artifact play effect
  return r;
}
function makeCardCopyPaste(c, p) {
  if (c.ctype !== 'P') throw TypeError("need card in play");
  if (p.ctype !== 'P') throw TypeError("need card in play");
  let i = c.copyOf || c.instance;
  let r = Object.create(i);
  r.instance = p.instance;
  r.ctype = "P";
  r.location = p.location;
  r.copyOf = i;
  r.color = r.color | p.color;
  // TODO: copy other tmp state (MOoT?)
  r.location.deck[r.location.deck.indexOf(p)] = r;
  return r;
  // Return to stack effects - trigger replace move to sidekick/new recruit stacks
}
function moveCard(c, where, bottom) {
  if (c.ctype !== 'P') throw TypeError("need card in play");
  if (!c.location) {
    TypeError("Moving card without location " + c);
    console.log(c);
  };
  c.location.remove(c);
  //TODO retain some properties of cards when moved to played?
  let r = makeCardInPlay(c.instance, where, bottom);
  if (c.attached) r.attached = c.attached;
  c.invalid = true;
}
function moveAll(from, to, bottom) {
  while (from.count) moveCard(from.top, to, bottom);
}
// Game primitives: Decks
let Deck = function(name, faceup) {
  this.id = name;
  this.deck = [];
  this.faceup = faceup === true;
  Deck.prototype.deckList.push(this);
};
Deck.prototype = {
  get count() { return this.deck.length; },
  addNewCard: function(c, n) { for (let i = 0; i < (n || 1); i++) makeCardInPlay(makeCardInstance(c), this); },
  _put: function(c) { this.deck.push(c); },
  _putBottom: function(c) { this.deck.unshift(c); },
  shuffle: function() { shuffleArray(this.deck, gameState.gameRand); },
  get bottom() { return this.deck[0]; },
  get top() { return this.deck[this.deck.length - 1]; },
  remove: function(c) { let p = this.deck.indexOf(c); if (p >= 0) this.deck.splice(p, 1); return p >= 0; },
  filter: function(c) { return filter(this.deck, c); },
  fcount: function(c) { return count(this.deck, c); },
  each: function(f) { this.deck.forEach(f); },
  withTop: function(f) { if (this.count !== 0) f(this.top); },
  attachedCards: function (name) { return attachedCards(name, this); },
  attachedCount: function (name) { return attachedCount(name, this); },
  deckList: [],
};

let Cards = function() {
  this.deck = [];
  for (let i = 0; i < arguments.length; i++) {
    let p = arguments[i];
    if (p instanceof "Deck" || p instanceof "Cards") p = p.deck;
    if (p.length) this.deck = this.deck.contcat(p);
  }
};
Cards.prototype = {
  get count() { return this.deck.length; },
  get bottom() { return this.deck[0]; },
  get top() { return this.deck[this.deck.length - 1]; },
  filter: function(c) { return filter(this.deck, c); },
  fcount: function(c) { return count(this.deck, c); },
  has: function(c) { return count(this.deck, c) !== 0; },
  each: function(f) { this.deck.forEach(f); },
  withTop: function(f) { if (this.count !== 0) f(this.top); }
};
let Event = function (ev, type, params) {
  this.parent = ev;
  this.type = type;
  if (typeof params === "function") {
    this.func = params;
  } else for (let i in params) {
    this[i] = params[i];
  }
  if (!this.func || typeof this.func !== "function") throw TypeError("No function in event");
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
function findVillainTemplate(name) { return findTemplate('VILLAIN', 'name')(name); }
function findMastermindTemplate(name) { return findTemplate('MASTERMINDS', 'cardName')(name); }
let u = undefined;
let sa = makeHeroCard('HERO', 'SHIELD AGENT',   0, 1, u);
let sb = makeHeroCard('HERO', 'SHIELD TROOPER', 0, u, 1);
let officerTemplate = makeHeroCard('MARIA HILL', 'SHIELD OFFICER', 3, 2, u);
let bystanderTemplates = [ makeBystanderCard() ];
let twistTemplate = new Card("SCHEME TWIST");
let strikeTemplate = new Card("MASTER STRIKE");
let woundTemplate = makeWoundCard(function (ev) {
  return !turnState.recruitedOrFought;
}, function (ev) {
  playerState.hand.filter(isWound).forEach(function (w) { KOEv(ev, w); });
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

let schemeTemplates = [
// The Legacy Virus
// Setup: 8 Twists. Wound stack holds 6 Wounds per player.
// Twist: Each player reveals a Tech Hero or gains a Wound.
// Evil Wins: If the Wound stack runs out.
makeSchemeCard('The Legacy Virus', { twists: 8, wounds: [ 6, 12, 18, 24, 30 ] }, function (ev) {
  eachPlayer(function (p) { revealOrEv(ev, Color.BLACK, function (ev) { gainWoundEv(ev, p); }, p); });
}, {
  event: "RUNOUT",
  match: function (ev) { return ev.what === "WOUNDS"; },
  after: evilWinsEv,
}),
// 
// Midtown Bank Robbery
// Setup: 8 Twists. 12 total Bystanders in the Villain Deck.
// Special Rules: Each Villain gets +1 Attack for each Bystander it has.
// Twist: Any Villain in the Bank captures 2 Bystanders. Then play the top card of the Villain Deck.
// Evil Wins: When 8 Bystanders are carried away by escaping Villains.
makeSchemeCard('Midtown Bank Robbery', { twists: 8, vd_bystanders: 12 }, function (ev) {
  let bank = gameState.cityByName.BANK;
  drawVillainEv(ev);
  if (!bank || !bank.top) return;
  captureBystanderEv(ev, bank.top);
  captureBystanderEv(ev, bank.top);
}, {
  event: "ESCAPE",
  after: function (ev) { if (gameState.escaped.filter(isBystander).length >= 8) evilWinsEv(ev); },
}, function () {
  addStatMod('defense', function (c) { return c.cardType === "VILLAIN" ? c.attachedCount('BYSTANDER') : 0; });
}),
// 
// Negative Zone Prison Breakout
// Setup: 8 Twists. Add an extra Henchman group to the Villain Deck.
// Twist: Play the top 2 cards of the Villain Deck.
// Evil Wins: If 12 Villains escape.
makeSchemeCard('Negative Zone Prison Breakout', { twists: 8, vd_henchmen: [ 1, 2, 2, 3, 3 ] }, function (ev) {
  drawVillainEv(ev);
  drawVillainEv(ev);
}, {
  event: "ESCAPE",
  after: function (ev) { if (gameState.escaped.filter(isVillain).length >= 12) evilWinsEv(ev); },
}),
// 
// Portals to Dark Dimension
// Setup: 7 Twists. Each Twist is a Dark Portal.
// Twist 1: Put the Dark Portal above the Mastermind. The Mastermind gets +1 Attack.
// Twists 2-6: Put the Dark Portal in the leftmost city space that doesn't yet have a Dark Portal. Villains in that city space get +1 Attack.
// Twist 7: Evil Wins!
makeSchemeCard('Portals to Dark Dimension', { twists: 7 }, function (ev, nr) {
  if (ev.nr < 7) {
    attachCardEv(ev, ev.twist, nr === 1 ? gameState.mastermind : gameState.city[ev.nr - 2], 'PORTAL');
  } else if (ev.nr === 7) {
    evilWinsEv(ev);
  }
}, [], function () {
  addStatMod('defense', function (c) { return c.location.attachedCount('PORTAL'); });
}),
// 
// Replace Earth's Leaders with Killbots
// Setup: 5 Twists. 3 additional Twists next to this Scheme. 18 total Bystanders in the Villain Deck.
// Special Rules: Bystanders in the Villain Deck count as Killbot Villains, with Attack equal to the number of Twists next to this Scheme.
// Twist: Put the Twist next to this Scheme.
// Evil Wins: If 5 "Killbots" escape.
makeSchemeCard("Replace Earth's Leaders with Killbots", { twists: 5, vd_bystanders: 18 }, function (ev) {
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
}, {
  event: "ESCAPE",
  after: function (ev) { if (gameState.escaped.filter(isBystander).length >= 5) evilWinsEv(ev); },
}, function () {
  gameState.scheme.cardsAttached('TWIST').addNewCard(twistTemplate, 3);
  addStatMod('defense', function (c) { return isBystander(c) ? gameState.scheme.attachedCount('TWIST') : whathere; });
  addStatSet('defense', function (c) { if (isBystander(c)) return function (c) { return gameState.scheme.attachedCount('TWIST'); }; });
  addStatSet('defense', isBystander, function (c) { return gameState.scheme.attachedCount('TWIST'); });
  addStatMod('isVillain', function (c) { return isBystander(c) ? true : whathere; });
}),
// 
// Secret Invasion of the Skrull Shapeshifters
// Setup: 8 Twists. 6 Heroes. Skrull Villain Group required. Shuffle 12 random Heroes from the Hero Deck into the Villain Deck.
// Special Rules: Heroes in the Villain Deck count as Skrull Villains with Attack equal to the Hero's Cost +2. If you defeat that Hero, you gain it.
// Twist: The highest-cost Hero from the HQ moves into the Sewers as a Skrull Villain, as above.
// Evil Wins: If 6 Heroes get into the Escaped Villains pile.
makeSchemeCard("Secret Invasion of the Skrull Shapeshifters", { twists: 8, heroes: 6 }, function (ev) {
  selectCardEv(ev, HQCardsHighestCost(), function (ev) { moveCardEv(ev, ev.seleced, gameState.cityEntry); });
}, {
  event: "ESCAPE",
  after: function (ev) { if (gameState.escaped.filter(isHero).length >= 6) evilWinsEv(ev); },
}, function () {
  addStatMod('defense', function (c) { return isHero(c) ? c.cost + 2 : whathere; });
  addStatMod('isVillain', function (c) { return isHero(c) ? true : whathere; });
  addStatMod('fight', function(c) { return function(ev) { gainEv(ev, ev.source); }; });
  for (let i = 0; i < 12; i++) moveCard(gameState.herodeck.top, gameState.villaindeck);
  // TODO require Skrulls
  gameState.villaindeck.shuffle();
}),
// 
// Super Hero Civil War
// Setup: For 2-3 players, use 8 Twists. For 4-5 players, use 5 Twists. If only 2 players, use only 4 Heroes in the Hero Deck.
// Twist: KO all the Heroes in the HQ.
// Evil Wins: If the Hero Deck runs out.
makeSchemeCard("Super Hero Civil War", { twists: [ 8, 8, 8, 5, 5 ], heroes: [ 3, 4, 5, 5, 5 ]}, function (ev) {
  HQCards().forEach(function(c) { KOEv(ev, c); });
}, {
  event: "RUNOUT",
  match: function (ev) { return ev.what === "HERO"; },
  after: evilWinsEv,
}),
// 
// Unleash the Power of the Cosmic Cube
// Setup: 8 Twists.
// Twist: Put the Twist next to this Scheme.
// Twist 5-6: Each player gains a Wound.
// Twist 7: Each player gains 3 Wounds.
// Twist 8: Evil Wins!
makeSchemeCard("Unleash the Power of the Cosmic Cube", { twists: 8 }, function (ev) {
  let nr = ev.nr;
  attachCardEv(ev, ev.twist, gameState.scheme, 'TWIST');
  if (nr === 5 || nr === 6) gameState.players.forEach(function (p) { gainWoundEv(ev, p); });  
  if (nr === 7) gameState.players.forEach(function (p) { gainWoundEv(ev, p); gainWoundEv(ev, p); gainWoundEv(ev, p); });  
  if (nr === 8) evilWinsEv(ev);
}),
];

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
    officers: 30,
    bystanders: 30,
  },
  triggers: [
    { // Replace HQ cards.
      event: "MOVECARD",
      match: function (ev) { return ev.from.isHQ; },
      after: function (ev) { if (gameState.herodeck.count) moveCardEv(ev, gameState.herodeck.top, ev.parent.from); else runOutEv(ev, "HERO"); },
    },
    { // Shift city on entry.
      event: "MOVECARD",
      match: function (ev) { return ev.to.isCity && ev.to.count; },
      before: function (ev) { let to = ev.parent.to; if (to.next) moveCardEv(ev, to.top, to.next); else event(ev, "ESCAPE", { what: to.top, func: villainEscape }); },
    },
    { // Win by defeating masterminds
      event: "DEFEAT",
      match: function (ev) { return ev.what.location === gameState.mastermind; },
      after: function (ev) { if (!gameState.evilWins && false /*TODO!gameState.mastermind.deck.some()*/) gameState.goodWins = true; },
    },
    { // Loss by villain deck
      event: "RUNOUT",
      match: function (ev) { return ev.what === "VILLAIN"; },
      after: function (ev) { if (!gameState.goodWins) gameState.evilWins = 'VILLAINDECK'; },
    },
  ],
  endDrawAmount: 6,
  modifiers: {},
  players: [ playerState ],
  advancedSolo: true,
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

// Init Scheme
gameState.scheme.addNewCard(schemeTemplates[0]);
if (gameState.scheme.top.triggers)
gameState.triggers = gameState.triggers.concat(gameState.scheme.top.triggers);
// Init starting decks
playerState.deck.addNewCard(sa, 8);
playerState.deck.addNewCard(sb, 4);
playerState.deck.shuffle();
// Init hero deck and populate initial HQ
let herocards = [ "Iron Man", "Hulk" ].map(findHeroTemplate);
for (let i = 0; i < herocards.length; i++) {
  gameState.herodeck.addNewCard(herocards[i].c1, 5);
  gameState.herodeck.addNewCard(herocards[i].c2, 5);
  gameState.herodeck.addNewCard(herocards[i].uc, 3);
  gameState.herodeck.addNewCard(herocards[i].ra);
}
gameState.herodeck.shuffle();
for (let i = 0; i < gameState.hq.length; i++) moveCard(gameState.herodeck.top, gameState.hq[i]);
// Init auxiliary decks
gameState.officer.addNewCard(officerTemplate, getParam('officers'));
gameState.bystanders.addNewCard(bystanderTemplates[0], 30);
gameState.wounds.addNewCard(woundTemplate, getParam('wounds'));
// TODO sidekicks
// Init villain deck
gameState.villaindeck.addNewCard(cardTemplates.HENCHMEN[0], 10);
gameState.villaindeck.addNewCard(cardTemplates.HENCHMEN[1], 10);
gameState.villaindeck.addNewCard(cardTemplates.HENCHMEN[2], 10);
gameState.villaindeck.addNewCard(cardTemplates.HENCHMEN[3], 10);
gameState.villaindeck.addNewCard(strikeTemplate, 5);
gameState.villaindeck.addNewCard(twistTemplate, getParam('twists'));
for (let i = 0; i < getParam('vd_bystanders'); i++)
  moveCard(gameState.bystanders.top, gameState.villaindeck);
gameState.villaindeck.shuffle();
// Init Mastermind
{
  let mastermind = findMastermindTemplate("Dr. Doom")
  gameState.mastermind.addNewCard(mastermind);
  let tactics = gameState.mastermind.top.attachedCards('TACTICS');
  mastermind.tacticsTemplates.forEach(function (c) { tactics.addNewCard(c); });
  tactics.shuffle();
}
// Draw initial hand
for (let i = 0; i < gameState.endDrawAmount; i++) {
  moveCard(playerState.deck.top, playerState.hand);
}
if (gameState.scheme.top.init) gameState.scheme.top.init();
}

// Card effects functions
function isWound(c) { return c.cardType === "WOUND"; }
function isHero(c) { return c.cardType === "HERO"; }
function isVillain(c) { return c.cardType === "VILLAIN"; }
function isMastermind(c) { return c.cardType === "MASTERMIND"; }
function isBystander(c) { return c.cardType === "BYSTANDER"; }
function isPlayable(c) { return c.isPlayable(); }
function isHealable(c) { return c.isHealable(); }
function isColor(col) { return function (c) { return c.isColor(col); }; }
function isTeam(team) { return function (c) { return c.isTeam(team); }; }
function isGroup(group) { return c => c.isGroup(group); }
function filter(cards, cond) {
  if (cards instanceof Deck) cards = cards.deck;
  if (cond === undefined) return cards;
  return cards.filter(typeof cond === "function" ? cond : typeof cond === "number" ? isColor(cond) : isTeam(cond));
}
function count(cards, cond) { return filter(cards, cond).length; }

function handOrDiscard(p) {
  p = p || playerState;
  return p.hand.deck.concat(playerState.discard.deck);
}
function owned(p) {
  p = p || playerState;
  let r = p.hand.deck.concat(playerState.discard.deck, playerState.deck.deck, playerState.revealed);
  return p === playerState ? r.concat(gameState.playArea) : r;
}
function HQCards() { return gameState.hq.map(e => e.top).filter(e => e !== undefined); }
function CityCards() { return gameState.city.map(e => e.top).filter(e => e !== undefined); }
function HQCardsHighestCost() {
  let all = HQCards();
  let maxCost = 0;
  all.forEach(function (c) { if (c.cost > maxCost) maxCost = c.cost; });
  return all.filter(function (c) { return c.cost === maxCost; });
}
function villainOrMastermind() {
  return CityCards().filter(isVillain).concat(gameState.mastermind.deck);
}
function villains() {
  return CityCards().filter(isVillain);
}
function hasBystander(c) { return c.attachedCount('BYSTANDER') > 0; }
function eachOtherPlayer(f) { let r = gameState.players.filter(function (e) { return e !== playerState; }); if (f) r.forEach(f); return r; }
function eachOtherPlayerVM(f) { return gameState.advancedSolo ? eachPlayer(f) : eachOtherPlayer(f); }
function eachPlayer(f) { if (f) gameState.players.forEach(f); return gameState.players; }
function eachPlayerEv(ev, f) { eachPlayer(p => pushEvents({type: "EFFECT", who:p, func:f, parent:ev})); }
function revealable(who) {
  who = who || playerState;
  // TODO: also artifacts and maybe MOoT
  if (who !== playerState) return who.hand.deck;
  return who.hand.deck.concat(gameState.playArea.deck);
}
function yourHeroes(who) { return filter(revealable(who), isHero); }
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

function addMod(modifiers, stat, cond, value) {
  if (!modifiers[stat]) modifiers[stat] = [];
  modifiers[stat].push({ cond: cond, value: value});
}
function addTurnMod(stat, cond, value) { addMod(turnState.modifiers, stat, cond, value); }
function addStatMod(stat, cond, value) { addMod(gameState.modifiers, stat, cond, value); }
function modifyStat(c, modifiers, value) {
  if (!modifiers) return value;
  modifiers.forEach(mod => {
    if(mod.cond(c)) {
      if (typeof mod.value === "number") value += mod.value;
      else value = mod.value(c, value);
    }
  });
  return value;
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
  return where.attached[name];
}
function attachedCount(name, where) {
  if (!(where instanceof Deck || where instanceof Card)) {
    console.log("Need deck or card to attach to");
  }
  if (!where.attached) return 0;
  if (!where.attached[name]) return 0;
  return where.attached[name].count;
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
  return eventQueue.shift() || {
    type:"TURN",
    recruit: 0,
    attack: 0,
    totalRecruit: 0,
    cardsPlayed: [],
    cardsDrawn: 0,
    modifiers: {},
    triggers: [],
    parent:gameState,
    func: playTurn
  };
}
function uiEvent() {
  joinQueue();
  return eventQueue[0] && eventQueue[0].ui;
}

function canRecruit(c) {
  return turnState.recruit >= c.cost;
}
function canFight(c) {
  if (c.fightCond && !c.figthCond(c)) return false;
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
    return playerState.hand.fcount(i => i !== c) >= val;
  throw TypeError(`unknown play cost: ${type}`);
}
function healCard(ev) {
  pushEvents({ type: "EFFECT", source: ev.what, parent: ev, func: ev.what.heal });
}
function getActions(ev) {
  let p = playerState.hand.filter(c => isPlayable(c) && canPlay(c)).map(e => (new Event(ev, "PLAY", { func: playCard, what: e })));
  p = p.concat(playerState.hand.filter(canHeal).map(e => (new Event(ev, "HEAL", { func: healCard, what: e }))));
  if (!turnState.noRecruitOrFight) {
  // TODO any deck with recruitable
  p = p.concat(HQCards().filter(canRecruit).map(d => (new Event(ev, "RECRUIT", { func: buyCard, what: d }))));
  // TODO any deck with fightable
  p = p.concat(CityCards().filter(canFight).map(d => (new Event(ev, "FIGHT", { func: villainFight, what: d }))));
  if (gameState.mastermind.count && gameState.mastermind.top.attached.TACTICS.count && canFight(gameState.mastermind.top))
    p.push((new Event(ev, "FIGHT", { func: villainFight, what: gameState.mastermind.top })));
  if (gameState.officer.count && canRecruit(gameState.officer.top))
    p.push((new Event(ev, "RECRUIT", { func: buyCard, what: gameState.officer.top })));
  }
  p = p.concat({type: "ENDOFTURN", parent:ev, confirm: p.length > 0, func: ev => ev.parent.endofturn = true});
  return p;
}

function addAttackEvent(ev, c) { event(ev, "ADDATTACK", { func: ev => turnState.attack += ev.amount, amount: c }); }
function addRecruitEvent(ev, c) { event(ev, "ADDRECRUIT", { func: ev => { turnState.recruit += ev.amount; turnState.totalRecruit += ev.amount; }, amount: c }); }
function moveCardEv(ev, what, where, bottom) {
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
  pushEvents({type:"RECRUIT", what:card, who:who, forFree:true, parent: ev});
}
function discardEv(ev, card) { event(ev, "DISCARD", { what: card, func: ev => moveCardEv(ev, ev.what, ev.what.location.owner.discard) }); }
function discardHandEv(ev, who) { (who || playerState).hand.forEach(c => discardEv(ev, c)); }
function drawIfEv(ev, cond, who) {
    let draw = false;
    lookAtDeckEv(ev, 1, () => draw = cond(playerState.revealed.top), who);
    cont(ev, () => { if (draw) drawEv(ev, 1, who); });
}
function KOEv(ev, card) { event(ev, "KO", { what: card, func: ev => moveCardEv(ev, ev.what, gameState.ko) }); }
function evilWinsEv(ev) { event(ev, "EVILWINS", () => { if (!gameState.goodWins && !gameState.evilWins) gameState.evilWins = 'SCHEME'; }); }
function runOutEv(ev, deck) { event(ev, "RUNOUT", { what: deck, func: () => {} }); }
function captureEv(ev, villain, what) {
  if (what) event(ev, "CAPTURE", { func: ev => attachCardEv(ev, ev.what, ev.villain, "BYSTANDER"), what: what, villain: villain });
  else cont(ev, () => {
    if (gameState.bystanders.top) event(ev, "CAPTURE", { func: ev => attachCardEv(ev, ev.what, ev.villain, "BYSTANDER"), what: gameState.bystanders.top, villain: villain });
    else runOutEv(ev, 'BYSTANDERS');
  });
}
function gainWoundEv(ev, who) {
  who = who || playerState;
  cont(ev, () => {
    if (gameState.wounds.top) gainEv(ev, gameState.wounds.top, who);
    else runOutEv(ev, "WOUNDS");
  });
}
function cont(ev, func) { event(ev, "EFFECT", func); }
function event(ev, name, params) { let nev = new Event(ev, name, params); pushEvents(nev); return nev; }
function selectObjectsMinMaxEv(ev, desc, min, max, objects, effect1, effect0, simple, who) {
  if (objects instanceof Deck || objects instanceof Cards) objects = objects.deck;
  who = who || playerState;
  if (objects.length === 0) {
    if (effect0) cont(ev, () => effect0());
  } else if (objects.length <= min && simple) {
    if (effect1) cont(ev, () => objects.forEach(effect1));
  } else {
    pushEvents({ type: "SELECTOBJECTS", parent:ev, desc: desc, min:min, max:max, options: objects, ui: true, agent: who, result1: effect1, result0: effect0});
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
    if (effect0) pushEvents({ type: "EFFECT", parent: ev, func: effect0 });
    return;
  }
  pushEvents({ type: "SELECTCARD1", parent:ev, options: cards, ui: true, agent: who, result1: {
    type: "EFFECT", parent: ev, func: effect1
  }});
}
function selectCardEv(ev, cards, effect, who) { selectCardOrEv(ev, cards, effect, undefined, who); }
function selectCardAndKOEv(ev, cards, who) { selectCardEv(ev, cards, ev => KOEv(ev, ev.selected), who); }
function selectCardOptEv(ev, cards, effect1, effect0, who) {
  if (cards instanceof Deck) cards = cards.deck;
  who = who || playerState;
  let newev = { type: "SELECTCARD01", parent:ev, options: cards, ui: true, agent: who };
  newev.result0 = { type: "EFFECT", parent: ev, func: effect0 || (() => {})};
  newev.result1 = { type: "EFFECT", parent: ev, func: effect1 };
  if (!cards.length) {
    if (effect0) pushEvents(newev.result0);
    return;
  }
  pushEvents(newev);
}
function revealOrEv(ev, cond, effect, who) {
  who = who || playerState;
  let cards = filter(revealable(who), cond);
  selectCardOptEv(ev, cards, () => {}, effect, who);
}
function revealAndEv(ev, cond, effect, who) {
  who = who || playerState;
  let cards = filter(revealable(who), cond);
  selectCardOptEv(ev, cards, effect, () => {}, who);
}
function chooseOneEv(ev, desc) {
  let a = arguments;
  let newev = { type: "SELECTEVENT", parent:ev, desc: desc, options: [], ui: true, agent: playerState };
  for (let i = 2; i < a.length; i += 2)
    newev.options.push({ type: "EFFECT", parent:ev, func: a[i+1], name: a[i] });
  pushEvents(newev);
}
function chooseMayEv(ev, desc, effect) {
  chooseOneEv(ev, desc, "Yes", effect, "No", () => {});
}
function selectPlayerEv(ev, f, who) {
  selectObjectEv(ev, "Choose a Player", gameState.players, f, who);
}
function pickDiscardEv(ev, who, agent) {
  who = who || playerState;
  agent = agent || who;
  selectCardEv(ev, who.hand, function (ev) { discardEv(ev, ev.selected); }, agent);
}
function pickTopDeckEv(ev, who, agent) {
  who = who || playerState;
  agent = agent || who;
  selectCardEv(ev, who.hand, function (ev) { moveCardEv(ev, ev.selected, who.deck); }, agent);
}
function lookAtDeckEv(ev, amount, action, who, agent) {
  who = who || playerState;
  agent = agent || who;
  for (let i = 0; i < amount; i++) cont(ev, ev => revealOne(ev, who));
  cont(ev, action);
  let cleanupRevealed = () => {
    if (who.revealed.count === 0) return;
    if (who.revealed.count === 1) moveCardEv(ev, who.revealed.top, who.deck);
    else selectCardEv(ev, who.revealed, ev => { moveCardEv(ev, ev.selected, who.deck); cleanupRevealed(); }, agent);
  };
  cont(ev, cleanupRevealed);
}
function revealOne(ev, who) {
  if (!who.deck.count && !who.discard.count) {
  } else if (!who.deck.count) {
    event(ev, "RESHUFFLE", reshufflePlayerDeck);
    pushEvents(ev);
  } else {
    moveCardEv(ev, who.deck.top, who.revealed);
  }
}
function KOHandOrDiscardEv(ev, filter, func) {
  let cards = handOrDiscard();
  if (filter) cards = cards.filter(filter);
  selectCardOptEv(ev, cards, ev => { KOEv(ev, ev.selected); cont(ev, func); });
}


function playCopyEv(ev, what) {
  pushEvents({ type: "PLAY", what: makeCardCopy(what), parent: ev });
}
function playCardDo(ev) {
  if (ev.what.playCostType === "DISCARD") pickDiscardEv(ev);
  if (ev.what.attack) addAttackEvent(ev, ev.what.attack);
  if (ev.what.recruit) addRecruitEvent(ev, ev.what.recruit);
  for (let i = 0; ev.what.effects && i < ev.what.effects.length; i++) {
    pushEvents( { type: "EFFECT", source: ev.what, parent: ev, func: ev.what.effects[i] } );
  }
  cont(ev, () => turnState.cardsPlayed.push(ev.what));
}
function playCard(ev) {
  if (!canPlay(ev.what)) return;
  if (ev.what.instance)
    moveCardEv(ev, ev.what, gameState.playArea);
  if (ev.what.copyPasteCard) {
    selectCardEv(ev, turnState.cardsPlayed, selectEv => {
      const target = selectEv.selected;
      console.log("COPYPASTE", ev.what, target);
      ev.what = makeCardCopyPaste(target, ev.what);
      console.log("RESULT", ev.what);
      if (canPlay(ev.what)) playCardDo(ev);
    }); // TODO if there are no cards played this prevents rogue copy powers play at all currently
  } else {
    playCardDo(ev);
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
  if (!ev.who.deck.count && !ev.who.discard.count) {
    runOutEv(ev, "DECK");
  } else if (!ev.who.deck.count) {
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
  pushEvents({ type: "EFFECT", source: gameState.scheme.top, parent: ev, func: gameState.scheme.top.twist, nr: ++gameState.twistCount, twist: ev.what });
  if (gameState.advancedSolo) 
    selectCardEv(ev, HQCards().filter(c => c.cost <= 6), function (ev) { moveCardEv(ev, ev.selected, gameState.herodeck, true); });
}
function villainDrawEv(ev) { event(ev, "VILLAINDRAW", villainDraw); }
function villainDraw(ev) {
  let c = gameState.villaindeck.top;
  if (!c) {
    runOutEv(ev, "VILLAIN");
  } else if (c.isVillain()) {
    moveCardEv(ev, c, gameState.cityEntry);
    if (c.ambush) pushEvents({ type: "EFFECT", source: c, parent: ev, func: c.ambush });
  } else if (c.cardType === "MASTER STRIKE") {
    textLog.log("Master Strike!");
    moveCardEv(ev, c, gameState.ko);
    pushEvents(gameState.mastermind.deck.map(function (m) { return {
      type: "EFFECT", source: m, parent: ev, func: m.strike
    }; }));
    if (gameState.advancedSolo) villainDrawEv(ev);
  } else if (c.cardType === "SCHEME TWIST") {
    textLog.log("Scheme Twist!");
    moveCardEv(ev, c, gameState.ko);
    playTwistEv(ev, c);
  } else if (c.cardType === "BYSTANDER") {
    let i = gameState.cityEntry;
    while (i && !i.count) i = i.next;
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
function villainEscape(ev) {
  let c = ev.what;
  let b = undefined;
  if (c.attachedCount('BYSTANDER')) b = c.attachedCards('BYSTANDER');
  if (b) {
    b.each(function (bc) { moveCardEv(ev, bc, gameState.escaped); });
    eachPlayer(function(p) { pickDiscardEv(ev, p); });
  }
  moveCardEv(ev, c, gameState.escaped);
  selectCardEv(ev, HQCards().filter(function (c) { return c.cost <= 6; }), function (ev) { KOEv(ev, ev.selected); });
  if (c.escape) pushEvents({ type: "EFFECT", source: c, parent: ev, func: c.escape });
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
  if (c.fight) pushEvents({ type: "EFFECT", source: c, parent: ev, func: c.fight });
}
function rescueEv(ev, what) {
  if (what && typeof what !== "number") event(ev, "RESCUE", { func: rescueBystander, what: what });
  else for (let i = 0; i < what; i++) cont(ev, () => {
    if (gameState.bystanders.top) event(ev, "RESCUE", { func: rescueBystander, what: gameState.bystanders.top });
    else runOutEv(ev, 'BYSTANDERS');
  });
}
function rescueBystander(ev) {
  let c = ev.what;
  moveCardEv(ev, c, playerState.victory);
  if (c.rescue) pushEvents({ type: "EFFECT", source: c, parent: ev, func: c.rescue });
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
      newev.push({type:"EFFECT", func:t.trigger.before, parent:ev, source:t.source });
  });
  newev.push(ev);
  triggers.forEach(function(t) {
    if (t.trigger.after)
      newev.push({type:"EFFECT", func:t.trigger.after, parent:ev, source:t.source });
  });
  triggers.forEach(function(t) {
    if (t.trigger.replace)
      newev = [{type:"EFFECT", func:t.trigger.replace, what:newev, parent:ev, source:t.source }];
  });
  return newev;
}
function playTurn(ev) {
  textLog.log("Turn Start");
  turnState = ev;
  villainDrawEv(ev);
  event(ev, "ACTIONS", ev => {
    if (!ev.endofturn) {
      pushEvents({type:"SELECTEVENT",parent:ev,options:getActions(ev),ui:true},ev);
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
  if (c.attached) for (let i in c.attached) if (c.attached[i].count) {
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
function displayDecks() {
  let divs = document.getElementsByClassName("deck");
  let divByName = {};
  for (let i = 0; i < divs.length; i++) {
    divByName[divs[i].id] = {
      div: divs[i],
      fanout: divs[i].getAttribute("data-fanout"),
      mode: divs[i].getAttribute("data-mode"),
    };
  }
  let list = Deck.prototype.deckList;
  for (let i = 0; i < list.length; i++) {
    let deck = list[i];
    let div = divByName[deck.id];
    if (!div) continue;
    if (div.mode === "IMG") {
      if (!deck.faceup) {
        div.div.innerHTML = deck.deck.map(makeDisplayBackImg).join('');
      } else if (div.fanout) {
        div.div.innerHTML = deck.deck.map(makeDisplayCardImg).join('');
      } else {
        div.div.innerHTML = deck.count ? makeDisplayCardImg(deck.top) : '';
      }
    } else {
      div.div.innerHTML = deck.id + ': ' + deck.deck.map(makeDisplayCard).join(' ');
    }
  }
}
function displayGame() {
  displayDecks();
  document.getElementById("recruit").innerHTML = turnState.recruit;
  document.getElementById("attack").innerHTML = turnState.attack;
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
      "SELECTCARD1": function () { ev.result1.selected = ev.options[0]; pushEvents(ev.result1); },
      "SELECTCARD01": function () { ev.result1.selected = ev.options[0]; pushEvents(ev.result1); },
    }[ev.type] || ev.func)();
    if (count < 500) setTimeout(makeAction, 200);
  }
  setTimeout(makeAction, 0);
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
  console.log(this.id, ev.target.id, clickActions);
  let node = ev.target;
  for (let node = ev.target; node; node = node.parentNode) {
    if (node.id) console.log(node.id);
    if (node.id && clickActions[node.id]) {
      clickActions[node.id]();
      return;
    }
  }
}
window.onclick = clickCard;
function mainLoop() {
  let extraActions = [];
  clickActions = {};
  while (undoLog.replaying) {
  let ev = popEvent();
  ({
    "SELECTEVENT": function () { pushEvents(ev.options[undoLog.readInt() - 1]); },
    "SELECTCARD1": function () { ev.result1.selected = ev.options[undoLog.readInt() - 1]; pushEvents(ev.result1); },
    "SELECTCARD01": function () {
      const v = undoLog.readInt();
      if (v) ev.result1.selected = ev.options[v - 1];
      pushEvents(v ? ev.result1 : ev.result0);
    },
  }[ev.type] || ev.func)(ev);
  }
  let ev = popEvent();
  while (!ev.ui) { ev.func(ev); ev = popEvent(); }
  displayGame();
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
      ev.options.map((option, i) => clickActions[option.id] = () => { ev.result1.selected = option; pushEvents(ev.result1); undoLog.write(i + 1); mainLoop(); });
    },
    "SELECTCARD01": function () {
      ev.options.map((option, i) => clickActions[option.id] = () => { ev.result1.selected = option; pushEvents(ev.result1); undoLog.write(i + 1); mainLoop(); });
      extraActions = [{name: "None", func: () => { pushEvents(ev.result0); undoLog.write(0); mainLoop(); }}];
    },
  }[ev.type])(ev);
  console.log("UI> " + ev.type, ev, clickActions, extraActions);
  extraActions.push({name: "Undo", func: () => { undoLog.undo(); startGame(); }});
  extraActions.push({name: "Restart", func: () => { undoLog.restart(); startGame(); }});
  extraActions.push({name: "New game", func: () => { undoLog.newGame(); startGame(); }});
  let extraActionsHTML = extraActions.map((action, i) => {
    const id = "!extraAction" + i;
    clickActions[id] = action.func;
    return `<span class="action${action.confirm === false ? " noconfirm" : ""}" id="${id}">${action.name}</span>`;
  }).join('<br>');
  document.getElementById("extraActions").innerHTML = extraActionsHTML;
  document.getElementById("logContainer").innerHTML = `${undoLog.toString()}<br>${textLog.text}`;
}
function startGame() {
  initGameState();
  mainLoop();
}
function startApp() {
  undoLog.init();
  startGame();
}
document.addEventListener('DOMContentLoaded', startApp, false);
/*
GUI:
Show played cards in UI
Use new object selects and implement UI handling for them
Implement cardlist instead of array
Show hidden events (make all event pass the main UI loop) / effect source

ENGINE:
Handle end game conditions
required villain/hero groups

other sets base functions: artifacts, special bystanders, sidekicks, divided cards
*/
