"use strict";

// Random Number Generator
interface RNG {
  nextInt: () => number
  nextFloat: () => number
  nextRange: (start: number, end: number) => number
  choice: (a: any[]) => any
  state: number
}
function RNG(seed?: number) {
  this.m = 0x100000000;
  this.a = 1103515245;
  this.c = 12345;
  this.state = seed === undefined ? Math.floor(Math.random() * (this.m-1)) : seed;
}
RNG.prototype.nextInt = function(): number {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
};
RNG.prototype.nextFloat = function(): number {
  return this.nextInt() / (this.m - 1);
};
RNG.prototype.nextRange = function(start: number, end: number) {
  let rangeSize = end - start;
  let randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
};
RNG.prototype.choice = function(array: any[]): any {
  return array[this.nextRange(0, array.length)];
};
let shuffleArray = function(a: any[], r: RNG): void {
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
interface Card {
  id: string
  constructor: (name: string) => Card
  ctype: string
  cardType: string
  location: Deck
  cost: number
  color: number
  attack: number
  printedAttack: number
  recruit: number
  defense: number
  vp?: number
  isPlayable?: () => boolean
  canPlay?: () => boolean
  playCostType?: string
  playCost?: number
  fightCond?: (c?: Card) => boolean
  isHealable: () => boolean
  healCond: () => boolean
  isGroup: (name: String) => boolean
  isColor: (col: number) => boolean
  isTeam: (name: String) => boolean
  isVillain: () => boolean
  instance: Card
  captured: Card[]
  attached: (name: string) => Card[]
  attachedDeck: (name: string) => Deck
  _attached: {[name: string]:Deck}
  tacticsTemplates?: Card[]
  triggers: Trigger[]
  trigger: Trigger
  init?: (state: any) => void
  twist?: (ev: Ev) => void
  params?: {[param: string]:(number[] | number)}
  bribe?: boolean
  ambush?: (ev: Ev) => void
  fight?: (ev: Ev) => void
  escape?: (ev: Ev) => void
  varVP?: (c: Card) => number
  varDefense?: (c: Card) => number
  rescue?: (ev: Ev) => void
  heal?: (ev: Ev) => void
  effects?: ((ev: Ev) => void)[]
  strike?: (ev: Ev) => void
  copyPasteCard?: boolean
  heroName?: string
  villainGroup?: string
  cardName?: string
  mastermind?: Card
}
interface VillainCardAbillities {
  ambush?: (ev: Ev) => void
  fight?: (ev: Ev) => void
  escape?: (ev: Ev) => void
  varVP?: (c: Card) => number
  varDefense?: (c: Card) => number
  fightCond?: (c?: Card) => boolean
  bribe?: boolean
}
interface MastermindCardAbillities {
}
interface HeroCardAbillities {
  trigger?: Trigger
  playCost?: number
  playCostType?: string
  copyPasteCard?: boolean
}
let Card = function(t: string) {
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
  attachedDeck: function (name) { return attachedDeck(name, this); },
  attached: function (name) { return attachedCards(name, this); },
  get captured() { return this.attached('CAPTURED'); },
};
let Color = {
  RED:1,
  COVERT:1,
  YELLOW:2,
  INSTINCT:2,
  BLACK:4,
  TECH:4,
  BLUE:8,
  RANGED:8,
  GREEN:16,
  STRENGTH:16,
  BASIC:32,
  GRAY:32,
  MAX:32
};
function makeHeroCard(hero: string, name: string, cost: number, recruit: number, attack: number, color: number, team: string, flags?: string, effects?: ((ev: Ev) => void) | (((ev: Ev) => void)[]), abilities?: HeroCardAbillities) {
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
function makeVillainCard(group: string, name: string, defense: number, vp: number, abilities: VillainCardAbillities) {
  let c = new Card("VILLAIN");
  c.printedDefense = defense;
  c.printedVP = vp;
  c.cardName = name;
  c.villainGroup = group;
  c.fightable = true;
  if (abilities) for (let i in abilities) c[i] = abilities[i];
  return c;
}
function makeMastermindCard(name: string, defense: number, vp: number, leads: string, strike: (ev: Ev) => void, tactics: [string, (ev: Ev) => void][], abilities?: MastermindCardAbillities) {
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
function makeBystanderCard(name?: string, rescue?: (ev: Ev) => void) {
  let c = new Card("BYSTANDER");
  c.printedVP = 1;
  c.cardName = name;
  c.rescue = rescue;
  return c;
}
function makeWoundCard(cond: (c: Card) => boolean, heal: (ev: Ev) => void, name?: string) {
  let c = new Card("WOUND");
  c.heal = heal;
  c.healCond = cond;
  if (name) c.cardName = name;
  return c;
}
function makeHenchmenCard(name: string, defense: number, abilities: VillainCardAbillities) {
  return makeVillainCard(undefined, name, defense, 1, abilities);
}
function makeCardInPlay(c: Card, where: Deck, bottom?: boolean) {
  if (c.ctype === "P") throw TypeError("need card template");
  let r = Object.create(c);
  r.id = (r.cardName || r.cardType) + '@' + gameState.nextId++;
  r.instance = c;
  r.ctype = "P";
  if (bottom) where._putBottom(r);
  else where._put(r);
  return r;
}
function makeCardCopy(c: Card): Card {
  if (c.ctype !== 'P') throw TypeError("need card in play");
  let r = Object.create(Object.getPrototypeOf(c));
  r.id = c.id + '@COPY@' + gameState.nextId++;
  r.ctype = "P";
  // Artifact specials - choose which ability -- embed in artifact play effect
  return r;
}
function makeCardCopyPaste(c: Card, p: Card): Card {
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
function moveCard(c: Card, where: Deck, bottom?: boolean): void {
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
function moveAll(from: Deck, to: Deck, bottom?: boolean): void {
  while (from.size) moveCard(from.top, to, bottom);
}
// Game primitives: Decks
type Filter<T> = number | string | ((c: T) => boolean)
interface Deck {
  id: string
  owner: Player
  constructor: (name: string, faceup?: boolean) => Deck
  size: number
  addNewCard: (c: Card, n?: number) => Card
  shuffle: () => void
  bottom: Card
  top: Card
  first: Card
  last: Card
  remove: (c: Card) => boolean
  limit: (f: Filter<Card>) => Card[]
  count: (f: Filter<Card>) => number
  has: (f: Filter<Card>) => boolean
  each: (f: (c: Card) => void) => void
  withTop: (f: (c: Card) => void) => void
  withFirst: (f: (c: Card) => void) => void
  withLast: (f: (c: Card) => void) => void
  attachedDeck: (name: string) => Deck
  attached: (name: string) => Card[]
  _attached: {[name: string]:Deck}
  deck: Card[]
  faceup: boolean
  _put: (c: Card) => void
  _putBottom: (c: Card) => void
  isHQ?: boolean
  isCity?: boolean
  next?: Deck
  below?: Deck
  above?: Deck
  attachedTo?: Deck | Card
}
let Deck = function(name: string, faceup?: boolean) {
  this.id = name;
  this.deck = [];
  this.faceup = faceup === true;
  Deck.prototype.deckList.push(this);
};
Deck.prototype = {
  get size() { return this.deck.length; },
  addNewCard: function(c: Card, n: number): Card { let r = undefined; for (let i = 0; i < (n || 1); i++) r = makeCardInPlay(c, this); return r; },
  _put: function(c: Card) { this.deck.push(c); c.location = this; },
  _putBottom: function(c: Card) { this.deck.unshift(c); c.location = this; },
  shuffle: function() { shuffleArray(this.deck, gameState.gameRand); },
  get bottom() { return this.deck[0]; },
  get top() { return this.deck[this.deck.length - 1]; },
  get first() { return this.deck[0]; },
  get last() { return this.deck[this.deck.length - 1]; },
  remove: function(c: Card): boolean { let p = this.deck.indexOf(c); if (p >= 0) this.deck.splice(p, 1); return p >= 0; },
  limit: function(c: Filter<Card>): Card[] { return limit(this.deck, c); },
  count: function(c: Filter<Card>): number { return count(this.deck, c); },
  has: function(c: Filter<Card>) { return count(this.deck, c) > 0; },
  each: function(f: (c: Card) => void) { this.deck.forEach(f); },
  withTop: function(f: (c: Card) => void) { if (this.size !== 0) f(this.top); },
  withFirst: function(f: (c: Card) => void) { if (this.size !== 0) f(this.first); },
  withLast: function(f: (c: Card) => void) { if (this.size !== 0) f(this.last); },
  attachedDeck: function (name: string): Deck { return attachedDeck(name, this); },
  attached: function (name: string): Card[] { return attachedCards(name, this); },
  deckList: [],
};

interface Array<T> {
  size: number
  count: (f: Filter<T>) => number
  limit: (f: Filter<T>) => T[]
  has: (f: Filter<T>) => boolean
  each: (f: (c: T) => void) => void
  withTop: (f: (c: T) => void) => void
  withFirst: (f: (c: T) => void) => void
  withLast: (f: (c: T) => void) => void
  shuffle: () => void
}
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
function repeat(n: number, f: (i: number) => void) { for (let i = 0; i < n; i++) f(i); }

interface Ev {
  type: string
  desc?: string
  parent: Ev
  getSource: () => Card
  source?: Card
  func?: (ev: Ev) => void
  what?: Card
  from?: Deck
  to?: Deck
  where?: Deck
  who?: Player
  amount?: number
  bottom?: boolean
  forFree?: boolean
  villain?: Card
  result?: "WIN" | "LOSS" | "DRAW"
  agent?: Player
  endofturn?: boolean
  replacing?: Ev[]
  // ui events
  options?: any[]
  min?: number
  max?: number
  ui?: boolean
  result0?: () => void
  result1?: (c: any) => void
  confirm?: boolean
  // RUNOUT
  deckName?: string
  // Twist EFFECT
  twist?: Card
  nr?: number
  another?: boolean
  state?: any
}
interface EvParams {
  where?: Deck
  func?: (ev: Ev) => void
  what?: Card
  from?: Deck
  to?: Deck
  who?: Player  
  twist?: Card
  nr?: number
  deckName?: string
  amount?: number
  bottom?: boolean
  forFree?: boolean
  villain?: Card
  source?: Card
  ui?: boolean
  min?: number
  max?: number
  result?: "WIN" | "LOSS" | "DRAW"
  desc?: string
  options?: any[]
  agent?: Player
  state?: any
  result0?: () => void
  result1?: (c: any) => void
}
let Ev = function (ev, type, params) {
  this.parent = ev;
  this.type = type;
  if (typeof params === "function") {
    this.func = params;
  } else for (let i in params) {
    this[i] = params[i];
  }
  if (!this.ui && (!this.func || typeof this.func !== "function")) throw TypeError("No function in event");
};
Ev.prototype = {
  getSource: function () {
    for (let ev = this; ev; ev = ev.parent) {
      if (ev.source) return ev.source;
    }
    return undefined;
  },
};

// Card definitions
let cardTemplates: {[type: string]:any[]} = {
  HEROES: [],
  HENCHMEN: [],
  VILLAINS: [],
  MASTERMINDS: [],
  SCHEMES: [],
  BYSTANDERS: [],
};
function addTemplates(type: string, set: string, templates: any[]) {
  templates.forEach(t => {
    t.set = set;
    cardTemplates[type].push(t);
  });
}
function findTemplate(type: string, attr: string): (name: string) => any { return name => cardTemplates[type].filter(t => t[attr] === name)[0]; }
function findHeroTemplate(name: string) { return findTemplate('HEROES', 'name')(name); }
function findHenchmanTemplate(name: string) { return findTemplate('HENCHMEN', 'cardName')(name); }
function findVillainTemplate(name: string) { return findTemplate('VILLAINS', 'name')(name); }
function findMastermindTemplate(name: string): Card { return findTemplate('MASTERMINDS', 'cardName')(name); }
function findSchemeTemplate(name: string): Card { return findTemplate('SCHEMES', 'cardName')(name); }
function findBystanderTemplate(name: string) { return findTemplate('BYSTANDERS', 'set')(name); }
let u: number = undefined;
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

function makeSchemeCard(name: string, counts, effect: (ev: Ev) => void, triggers?: Trigger[] | Trigger, initfunc?: (state?: any) => void) {
  let c = new Card('SCHEME');
  c.cardName = name;
  c.params = counts;
  c.twist = effect;
  if (triggers) c.triggers = triggers instanceof Array ? triggers : [ triggers ];
  if (initfunc) c.init = initfunc;
  return c;
}

interface Player {
  name: string
  deck: Deck
  discard: Deck
  victory: Deck
  revealed: Deck
  left: Player
  right: Player
  hand: Deck
}
interface Turn extends Ev {
  recruit: number
  attack: number
  attackWithRecruit: boolean
  recruitedOrFought: boolean
  noRecruitOrFight: boolean
  totalRecruit: number
  cardsDrawn: number
  endDrawMod: number
  endDrawAmount: number
  cardsPlayed: Card[]
  modifiers: Modifiers<any>
  triggers: Trigger[]
  endofturn?: boolean
}
interface Trigger {
  event: string
  match?: (e: Ev, s?: Card | Ev) => boolean
  after?: (e: Ev) => void
  replace?: (e: Ev) => void
  before?: (e: Ev) => void
}
interface Game extends Ev {
  gameRand: RNG
  nextId: number
  twistCount: number
  playArea: Deck
  escaped: Deck
  villaindeck: Deck
  mastermind: Deck
  ko: Deck
  herodeck: Deck
  officer: Deck
  wounds: Deck
  scheme: Deck
  bystanders: Deck
  hq: Deck[]
  city: Deck[]
  params: { [name: string]: number[] | number }
  triggers: Trigger[]
  endDrawAmount: number
  modifiers: Modifiers<any>
  players: Player[]
  advancedSolo: boolean
  villainsEscaped: number
  bystandersCarried: number
  cityEntry: Deck
  specialActions?: (ev: Ev) => Ev[]
  extraTurn?: boolean
  schemeState: any
}
let eventQueue: Ev[] = [];
let eventQueueNew: Ev[] = [];
let turnState: Turn = undefined;
let playerState: Player = undefined;
let gameState: Game = undefined;
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
  left: undefined,
  right: undefined,
};
playerState.deck.owner = playerState.discard.owner = playerState.hand.owner = playerState.victory.owner = playerState.revealed.owner = playerState;
playerState.left = playerState.right = playerState;
gameState = {
  type: "STATE",
  parent: undefined,
  getSource: undefined,
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
  cityEntry: undefined,
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
      match: function (ev) { return ev.to.isCity && ev.to.size > 0; },
      before: function (ev) { let to = ev.parent.to; if (to.next) moveCardEv(ev, to.top, to.next); else villainEscapeEv(ev, to.top); },
    },
    { // Win by defeating masterminds
      event: "DEFEAT",
      match: function (ev) { return ev.what.location === gameState.mastermind; },
      after: function (ev) { if (!gameState.mastermind.has(c => !c.tacticsTemplates || c.attached("TACTICS").size > 0)) gameOverEv(ev, "WIN"); },
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
  schemeState: {},
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
  let tactics = gameState.mastermind.top.attachedDeck('TACTICS');
  mastermind.tacticsTemplates.forEach(function (c) { tactics.addNewCard(c); });
  tactics.shuffle();
}
// Draw initial hands
for (let i = 0; i < gameState.endDrawAmount; i++) gameState.players.forEach(p => moveCard(p.deck.top, p.hand));
if (gameState.scheme.top.init) gameState.scheme.top.init(gameState.schemeState);
}

// Card effects functions
function isWound(c: Card): boolean { return c.cardType === "WOUND"; }
function isHero(c: Card): boolean { return c.cardType === "HERO"; }
function isVillain(c: Card): boolean { return c.cardType === "VILLAIN"; }
function isMastermind(c: Card): boolean { return c.cardType === "MASTERMIND"; }
function isEnemy(c: Card): boolean { return isVillain(c) || isMastermind(c); }
function isBystander(c: Card): boolean { return c.cardType === "BYSTANDER"; }
function isPlayable(c: Card): boolean { return c.isPlayable(); }
function isHealable(c: Card): boolean { return c.isHealable(); }
function isColor(col: number): (c: Card) => boolean { return function (c) { return c.isColor(col); }; }
function isTeam(team: string): (c: Card) => boolean { return function (c) { return c.isTeam(team); }; }
function isGroup(group: string): (c: Card) => boolean { return c => c.isGroup(group); }
function limit(cards: Card[], cond: Filter<Card>): Card[] {
  if (cards instanceof Deck) throw new TypeError();
  if (cond === undefined) return cards;
  return cards.filter(typeof cond === "function" ? cond : typeof cond === "number" ? isColor(cond) : isTeam(cond));
}
function count(cards: Card[], cond: Filter<Card>): number { return limit(cards, cond).length; }

function handOrDiscard(p?: Player): Card[] {
  p = p || playerState;
  return p.hand.deck.concat(playerState.discard.deck);
}
function owned(p: Player): Card[] {
  p = p || playerState;
  let r = p.hand.deck.concat(playerState.discard.deck, playerState.deck.deck, playerState.revealed.deck, playerState.victory.deck);
  return p === playerState ? r.concat(gameState.playArea.deck) : r;
}
function soloVP(): number {
  if (gameState.players.length > 1) return 0;
  return - gameState.villainsEscaped - 4 * gameState.bystandersCarried - 3 * gameState.twistCount;
}
function currentVP(p?: Player): number {
  return owned(p).map(c => c.vp || 0).reduce((a, b) => a + b, 0) + soloVP();
}
function HQCards(): Card[] { return gameState.hq.map(e => e.top).limit(e => e !== undefined); }
function CityCards(): Card[] { return gameState.city.map(e => e.top).limit(e => e !== undefined); }
function HQCardsHighestCost(): Card[] {
  let all = HQCards();
  let maxCost = 0;
  all.forEach(function (c) { if (c.cost > maxCost) maxCost = c.cost; });
  return all.limit(function (c) { return c.cost === maxCost; });
}
function villainOrMastermind(): Card[] {
  return villains().concat(gameState.mastermind.deck);
}
function villains(): Card[] {
  return CityCards().limit(isVillain);
}
function villainIn(where: string): Card[] {
  return CityCards().limit(isVillain).limit(c => c.location.id === where);
}
function withCity(where: string, f: (d: Deck) => void) {
  gameState.city.limit(e => e.id === where).each(f);
}
function hasBystander(c: Card): boolean { return c.captured.has(isBystander); }
function eachOtherPlayer(f: (p: Player) => void) { let r = gameState.players.filter(function (e) { return e !== playerState; }); if (f) r.forEach(f); return r; }
function eachOtherPlayerVM(f: (p: Player) => void ) { return gameState.advancedSolo ? eachPlayer(f) : eachOtherPlayer(f); }
function eachPlayer(f: (p: Player) => void) { if (f) gameState.players.forEach(f); return gameState.players; }
function eachPlayerEv(ev: Ev, f: (p: Ev) => void) { eachPlayer(p => pushEv(ev, "EFFECT", { who:p, func:f })); }
function revealable(who = playerState) {
  // TODO: also artifacts and maybe MOoT
  if (who !== playerState) return who.hand.deck;
  return who.hand.deck.concat(gameState.playArea.deck);
}
function yourHeroes(who?: Player) { return revealable(who).limit(isHero); }
function numColorsYouHave() {
  let all = 0;
  let num = 0;
  yourHeroes(playerState).forEach(c => { all = all | c.color; });
  for (let i = 1; i <= Color.MAX; i *= 2) if (all & i) num++;
  return num;
}

function superPower(color: number | string): number { return count(turnState.cardsPlayed, color); }
function addEndDrawMod(a: number): void { turnState.endDrawMod = (turnState.endDrawMod || 0) + a; }
function setEndDrawAmount(a: number): void { turnState.endDrawAmount = a; }

type Modifier<T> = {cond: (c: Card) => boolean, func: (c: Card, v?: T) => T};
type Modifiers<T> = {[stat: string]:Modifier<T>[]};
function addMod<T>(modifiers: Modifiers<T>, stat: string, cond: (c: Card) => boolean, func: (c: Card, v?: T) => T) {
  if (!modifiers[stat]) modifiers[stat] = [];
  modifiers[stat].push({ cond, func });
}
function makeModFunc(value: number | ((c: Card) => number)): (c: Card, v?: number) => number {
  if (typeof value === "number") return (c, v) => v + value;
  return (c, v) => v + value(c);
}
function addTurnMod(stat: string, cond: (c: Card) => boolean, value: number | ((c: Card, v?: number) => number)) { addMod(turnState.modifiers, stat, cond, makeModFunc(value)); }
function addStatMod(stat: string, cond: (c: Card) => boolean, value: number | ((c: Card, v?: number) => number)) { addMod(gameState.modifiers, stat, cond, makeModFunc(value)); }
function addStatSet<T>(stat: string, cond: (c: Card) => boolean, func: (c: Card, v?: T) => T) { addMod(gameState.modifiers, stat, cond, func); }
function modifyStat<T>(c: Card, modifiers: Modifier<T>[], value: T): T {
  return (modifiers || []).filter(mod => mod.cond(c)).reduce((v, mod) => mod.func(c, v), value);
}
function getModifiedStat<T>(c: Card, stat: string, value: T): T {
  return modifyStat(c, turnState.modifiers[stat], modifyStat(c, gameState.modifiers[stat], value));
}
// Game engine functions
function getParam(name: string): number {
  let s = gameState.scheme.top;
  let r = name in s.params ? s.params[name] : gameState.params[name];
  return r instanceof Array ? r[gameState.players.length - 1] : r;
}
function attachedDeck(name: string, where: Deck | Card) {
  if (!(where instanceof Deck || where instanceof Card)) {
    console.log("Need deck or card to attach to");
  }
  if (!where._attached) where._attached = {};
  if (!where._attached[name])
    where._attached[name] = new Deck(where.id + '/' + name);
  where._attached[name].attachedTo = where;
  return where._attached[name];
}
function attachedCards(name: string, where: Deck | Card) {
  if (!(where instanceof Deck || where instanceof Card)) {
    console.log("Need deck or card to attach to");
  }
  if (!where._attached) return [];
  if (!where._attached[name]) return [];
  return where._attached[name].deck;
}
function pushEvents(ev: Ev | Ev[]): void {
  let evs = ev instanceof Array ? ev : arguments;
  for (let i = 0; i < evs.length; i++) {
    eventQueueNew = eventQueueNew.concat(addTriggers(evs[i]));
  }
}
function joinQueue(): void {
  eventQueue = eventQueueNew.concat(eventQueue);
  eventQueueNew = [];
}
function popEvent(): Ev {
  joinQueue();
  return eventQueue.shift() || new Ev(gameState, "TURN", {
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
function uiEvent(): boolean {
  joinQueue();
  return eventQueue[0] && eventQueue[0].ui;
}

function canRecruit(c: Card): boolean {
  return turnState.recruit >= c.cost;
}
function canFight(c: Card): boolean {
  if (c.fightCond && !c.fightCond(c)) return false;
  let a = turnState.attack;
  if (c.bribe || turnState.attackWithRecruit) a += turnState.recruit;
  return a >= c.defense;
}
function canHeal(c: Card): boolean {
  if (!c.isHealable()) return false;
  return c.healCond ? c.healCond() : true;
}
function canPlay(c: Card): boolean {
  let type = c.playCostType;
  let val = c.playCost;
  if (type === undefined) return true;
  if (type === "DISCARD" || type === "TOPDECK")
    return playerState.hand.count(i => i !== c) >= val;
  throw TypeError(`unknown play cost: ${type}`);
}
function healCard(ev: Ev): void {
  pushEv(ev, "EFFECT", { source: ev.what, func: ev.what.heal });
}
function getActions(ev: Ev): Ev[] {
  let p = playerState.hand.limit(c => isPlayable(c) && canPlay(c)).map(e => (new Ev(ev, "PLAY", { func: playCard, what: e })));
  p = p.concat(playerState.hand.limit(canHeal).map(e => (new Ev(ev, "HEAL", { func: healCard, what: e }))));
  if (!turnState.noRecruitOrFight) {
  // TODO any deck with recruitable
  p = p.concat(HQCards().limit(canRecruit).map(d => (new Ev(ev, "RECRUIT", { func: buyCard, what: d }))));
  // TODO any deck with fightable
  p = p.concat(CityCards().limit(canFight).map(d => (new Ev(ev, "FIGHT", { func: villainFight, what: d }))));
  if (gameState.mastermind.size && gameState.mastermind.top.attached('TACTICS').size && canFight(gameState.mastermind.top))
    p.push((new Ev(ev, "FIGHT", { func: villainFight, what: gameState.mastermind.top })));
  if (gameState.officer.size && canRecruit(gameState.officer.top))
    p.push((new Ev(ev, "RECRUIT", { func: buyCard, what: gameState.officer.top })));
  }
  if (gameState.specialActions) p = p.concat(gameState.specialActions(ev));
  p = p.concat(new Ev(ev, "ENDOFTURN", { confirm: p.length > 0, func: ev => ev.parent.endofturn = true }));
  return p;
}

function addAttackEvent(ev: Ev, c: number): void { pushEv(ev, "ADDATTACK", { func: ev => turnState.attack += ev.amount, amount: c }); }
function addRecruitEvent(ev: Ev, c: number): void { pushEv(ev, "ADDRECRUIT", { func: ev => { turnState.recruit += ev.amount; turnState.totalRecruit += ev.amount; }, amount: c }); }
function moveCardEv(ev: Ev, what: Card, where: Deck, bottom?: boolean): void {
  if (!what.instance) return;
  pushEv(ev, "MOVECARD", { func: ev => moveCard(ev.what, ev.to, ev.bottom), what: what, to: where, bottom: bottom, from: what.location });
}
// Swaps contents of 2 city spaces
function swapCardsEv(ev: Ev, where1: Deck, where2: Deck) {
  cont(ev, () => {
    const what1 = where1.top;
    const what2 = where2.top;
    if (what1) moveCard(what1, where2);
    if (what2) moveCard(what2, where1);
  });
}
function attachCardEv(ev: Ev, what: Card, to: (Card | Deck), name: string) { console.log(`attaching as ${name} to `, to); moveCardEv(ev, what, to.attachedDeck(name)); }
function recruitForFreeEv(ev: Ev, card: Card, who?: Player): void {
  who = who || playerState;
  pushEv(ev, "RECRUIT", { func: buyCard, what: card, forFree: true });
}
function discardEv(ev: Ev, card: Card) { pushEv(ev, "DISCARD", { what: card, func: ev => moveCardEv(ev, ev.what, ev.what.location.owner.discard) }); }
function discardHandEv(ev: Ev, who?: Player) { (who || playerState).hand.each(c => discardEv(ev, c)); }
function drawIfEv(ev: Ev, cond: Filter<Card>, who?: Player) {
    let draw = false;
    who = who || playerState;
    lookAtDeckEv(ev, 1, () => draw = who.revealed.has(cond), who);
    cont(ev, () => { if (draw) drawEv(ev, 1, who); });
}
function KOEv(ev: Ev, card: Card): void { pushEv(ev, "KO", { what: card, func: ev => moveCardEv(ev, ev.what, gameState.ko) }); }
function evilWinsEv(ev: Ev): void { gameOverEv(ev, 'LOSS'); }
function gameOverEv(ev: Ev, result: "WIN" | "LOSS" | "DRAW") {
  let desc = result === "LOSS" ? "Evil Wins" : result === "WIN" ? "Good Wins" : "Draw between Good and Evil";
  textLog.log("Game Over: " + desc);
  pushEv(ev, "GAMEOVER", { ui: true, result: result, desc: desc });
}
function runOutEv(ev: Ev, deck: string) { pushEv(ev, "RUNOUT", { deckName: deck, func: () => {} }); }
function captureEv(ev: Ev, villain: Card, what?: Card) {
  if (what) pushEv(ev, "CAPTURE", { func: ev => attachCardEv(ev, ev.what, ev.villain, "CAPTURED"), what: what, villain: villain });
  else cont(ev, () => {
    if (gameState.bystanders.top) pushEv(ev, "CAPTURE", { func: ev => attachCardEv(ev, ev.what, ev.villain, "CAPTURED"), what: gameState.bystanders.top, villain: villain });
  });
}
function gainWoundEv(ev: Ev, who?: Player): void {
  who = who || playerState;
  cont(ev, () => {
    if (gameState.wounds.top) gainEv(ev, gameState.wounds.top, who);
  });
}
function cont(ev: Ev, func: (ev: Ev) => void): void { pushEv(ev, "EFFECT", func); }
function pushEv(ev: Ev, name: string, params: EvParams | ((ev: Ev) => void)): Ev { let nev = new Ev(ev, name, params); pushEvents(nev); return nev; }
function selectObjectsMinMaxEv<T>(ev: Ev, desc: string, min: number, max: number, objects: T[], effect1: (o: T) => void, effect0?: () => void, simple?: boolean, who: Player = playerState) {
  if (objects.length === 0) {
    if (effect0) cont(ev, () => effect0());
  } else if (objects.length <= min && simple) {
    if (effect1) cont(ev, () => objects.forEach(effect1));
  } else {
    if (objects.length < min) min = objects.length;
    if (max === undefined || max > objects.length) max = objects.length;
    effect0 = effect0 || (() => {});
    effect1 = effect1 || (() => {});
    pushEv(ev, "SELECTOBJECTS", { desc: desc, min:min, max:max, options: objects, ui: true, agent: who, result1: effect1, result0: effect0});
  }
}
function selectObjectsEv<T>(ev: Ev, desc: string, num: number, objects: T[], effect1: (o: T) => void, who?: Player) {
  selectObjectsMinMaxEv(ev, desc, num, num, objects, effect1, undefined, false, who);
}
function selectObjectsUpToEv<T>(ev: Ev, desc: string, num: number, objects: T[], effect1: (o: T) => void, who?: Player) {
  selectObjectsMinMaxEv(ev, desc, 0, num, objects, effect1, undefined, false, who);
}
function selectObjectsAnyEv<T>(ev: Ev, desc: string, objects: T[], effect1: (o: T) => void, who?: Player) {
  selectObjectsMinMaxEv<T>(ev, desc, 0, undefined, objects, effect1, undefined, false, who);
}
function selectObjectEv<T>(ev: Ev, desc: string, objects: T[], effect1: (o: T) => void, who?: Player) {
  selectObjectsMinMaxEv(ev, desc, 1, 1, objects, effect1, undefined, false, who);
}
function selectObjectOptEv<T>(ev: Ev, desc: string, objects: T[], effect1: (o: T) => void, who?: Player) {
  selectObjectsMinMaxEv(ev, desc, 0, 1, objects, effect1, undefined, false, who);
}

function selectCardOrEv<T>(ev: Ev, desc: string, cards: T[], effect1: (c: T) => void, effect0: () => void, who?: Player) {
  who = who || playerState;
  if (!cards.length) {
    if (effect0) effect0();
    return;
  }
  pushEv(ev, "SELECTCARD1", { options: cards, desc, ui: true, agent: who, result1: effect1 });
}
function selectCardEv<T>(ev: Ev, desc: string, cards: T[], effect: (c: T) => void, who?: Player) { selectCardOrEv(ev, desc, cards, effect, undefined, who); }
function selectCardAndKOEv(ev: Ev, cards: Card[], who?: Player) { selectCardEv(ev, "Choose a card to KO", cards, sel => KOEv(ev, sel), who); }
function selectCardOptEv<T>(ev: Ev, desc: string, cards: T[], effect1: (c: T) => void, effect0?: () => void, who?: Player) {
  who = who || playerState;
  if (!cards.length) {
    if (effect0) effect0();
    return;
  }
  pushEv(ev, "SELECTCARD01", { options: cards, desc, ui: true, agent: who, result1: effect1, result0: effect0 || (() => {}) });
}
function revealOrEv(ev: Ev, cond: Filter<Card>, effect: () => void, who?: Player) {
  who = who || playerState;
  let cards = revealable(who).limit(cond);
  selectCardOptEv(ev, "Reveal a card", cards, () => {}, effect, who);
}
function revealAndEv(ev: Ev, cond: Filter<Card>, effect: () => void, who?: Player) {
  who = who || playerState;
  let cards = revealable(who).limit(cond);
  selectCardOptEv(ev, "Reveal a card", cards, effect, () => {}, who);
}
function chooseOneEv(ev: Ev, desc: string, ...a: (string | ((ev: Ev) => void))[]): void {
  let options = [];
  for (let i = 0; i < a.length; i += 2)
    options.push(new Ev(ev, "EFFECT", { func: a[i+1], desc: a[i] }));
  console.log(options);
  pushEv(ev, "SELECTEVENT", { desc, options, ui: true, agent: playerState });
}
function chooseMayEv(ev: Ev, desc: string, effect: (ev: Ev) => void, agent?: Player) {
  agent = agent || playerState;
  pushEv(ev, "SELECTEVENT", { desc, options: [
      new Ev(ev, "EFFECT", { func: effect, desc: "Yes" }),
      new Ev(ev, "EFFECT", { func: () => {}, desc: "No" }),
  ], ui: true, agent });
}
function selectPlayerEv(ev: Ev, f: (p: Player) => void, who?: Player) {
  if (gameState.players.length === 1) {
    f(playerState);
  } else selectObjectEv(ev, "Choose a Player", gameState.players, f, who); // TODO multiplayer
}
function pickDiscardEv(ev: Ev, who?: Player, agent?: Player) {
  who = who || playerState;
  agent = agent || who;
  selectCardEv(ev, "Choose a card to discard", who.hand.deck, sel => discardEv(ev, sel), agent);
}
function pickTopDeckEv(ev: Ev, who?: Player, agent?: Player) {
  who = who || playerState;
  agent = agent || who;
  const name = agent === who ? "your" : who.name + "'s";
  selectCardEv(ev, `Choose a card to put on top of ${name} deck`, who.hand.deck, sel => moveCardEv(ev, sel, who.deck), agent);
}
function lookAtDeckEv(ev: Ev, amount: number, action: (ev: Ev) => void, who?: Player, agent?: Player) {
  who = who || playerState;
  agent = agent || who;
  for (let i = 0; i < amount; i++) cont(ev, ev => revealOne(ev, who));
  cont(ev, action);
  let cleanupRevealed = () => {
    if (who.revealed.size === 0) return;
    if (who.revealed.size === 1) moveCardEv(ev, who.revealed.top, who.deck);
    else selectCardEv(ev, "Choose a card to put back", who.revealed.deck, sel => { moveCardEv(ev, sel, who.deck); cleanupRevealed(); }, agent);
  };
  cont(ev, cleanupRevealed);
}
function revealOne(ev: Ev, who: Player) {
  if (!who.deck.size && !who.discard.size) {
  } else if (!who.deck.size) {
    pushEv(ev, "RESHUFFLE", reshufflePlayerDeck);
    pushEvents(ev);
  } else {
    moveCardEv(ev, who.deck.top, who.revealed);
  }
}
function KOHandOrDiscardEv(ev: Ev, filter: Filter<Card>, func: (ev: Ev) => void) {
  let cards = handOrDiscard();
  if (filter) cards = cards.limit(filter);
  selectCardOptEv(ev, "Choose a card to KO", cards, sel => { KOEv(ev, sel); cont(ev, func); });
}


function playCopyEv(ev: Ev, what: Card) {
  pushEv(ev, "PLAY", { func: playCard, what: makeCardCopy(what) });
}
function playCardEffects(ev: Ev, card?: Card) {
  card = card || ev.what;
  pushEv(ev, "PLAYCARDEFFECTS", { source: card, func: ev => {
    if (card.playCostType === "DISCARD") pickDiscardEv(ev);
    if (card.attack) addAttackEvent(ev, card.attack);
    if (card.recruit) addRecruitEvent(ev, card.recruit);
    for (let i = 0; card.effects && i < card.effects.length; i++) {
      pushEv(ev, "EFFECT",  { source: card, func: card.effects[i] } );
    }
    cont(ev, () => turnState.cardsPlayed.push(card));
  }});
}
function playCard(ev: Ev): void {
  if (!canPlay(ev.what)) return;
  moveCardEv(ev, ev.what, gameState.playArea);
  if (ev.what.copyPasteCard) {
    selectCardEv(ev, "Choose a card to copy", turnState.cardsPlayed, target => {
      console.log("COPYPASTE", ev.what, target);
      makeCardCopyPaste(target, ev.what);
      console.log("RESULT", ev.what);
      if (canPlay(ev.what)) playCardEffects(ev);
    });
  } else {
    playCardEffects(ev);
  }
}
function buyCard(ev: Ev): void {
  if (!ev.forFree) {
    // TODO: other pay options
    turnState.recruit -= ev.what.cost;
  }
  turnState.recruitedOrFought = true;
  gainEv(ev, ev.what);
}
function gainEv(ev: Ev, card: Card, who?: Player) {
  who = who || playerState;
  pushEv(ev, "GAIN", { func: ev => moveCardEv(ev, ev.what, ev.where), what: card, where: who.discard });
}
function gainToHandEv(ev: Ev, card: Card, who?: Player) {
  who = who || playerState;
  pushEv(ev, "GAIN", { func: ev => moveCardEv(ev, ev.what, ev.where), what: card, where: who.hand });;
}
function cleanUp(ev: Ev): void {
  moveAll(playerState.hand, playerState.discard);
  moveAll(gameState.playArea, playerState.discard);
  let drawAmount = (turnState.endDrawAmount || gameState.endDrawAmount) + (turnState.endDrawMod || 0);
  drawEv(ev, drawAmount);
}
function drawEv(ev: Ev, amount?: number, who?: Player) {
  for (let i = 0; i < (amount || 1); i++)
    pushEv(ev, "DRAW", { func: drawOne, who: who || playerState});
}
function drawOne(ev: Ev): void {
  if (!ev.who.deck.size && !ev.who.discard.size) {
  } else if (!ev.who.deck.size) {
    pushEv(ev, "RESHUFFLE", reshufflePlayerDeck);
    pushEvents(ev);
  } else {
    turnState.cardsDrawn++;
    moveCardEv(ev, ev.who.deck.top, ev.who.hand);
  }
}
function reshufflePlayerDeck(): void {
  moveAll(playerState.discard, playerState.deck);
  playerState.deck.shuffle();
}
function playTwistEv(ev: Ev, what: Card) { pushEv(ev, "TWIST", { func: playTwist, what: what }); }
function playTwist(ev: Ev): void {
  let e = pushEv(ev, "EFFECT", { source: gameState.scheme.top, func: gameState.scheme.top.twist, nr: ++gameState.twistCount, twist: ev.what, state: gameState.schemeState });
  cont(ev, () => {
    if (gameState.players.length === 1) {
      if (gameState.advancedSolo) selectCardEv(ev, "Choose a card to put on the bottom of the Hero deck", HQCards().limit(c => c.cost <= 6), sel => moveCardEv(ev, sel, gameState.herodeck, true));
      else selectCardAndKOEv(ev, HQCards().limit(c => c.cost <= 6));
    }
    if (e.another) villainDrawEv(e);
  });
}
function villainDrawEv(ev: Ev): void { pushEv(ev, "VILLAINDRAW", villainDraw); }
function villainDraw(ev: Ev): void {
  let c = gameState.villaindeck.top;
  if (!c) {
  } else if (c.isVillain()) {
    moveCardEv(ev, c, gameState.cityEntry);
    if (c.ambush) pushEv(ev, "EFFECT", { source: c, func: c.ambush });
  } else if (c.cardType === "MASTER STRIKE") {
    textLog.log("Master Strike!");
    moveCardEv(ev, c, gameState.ko);
    // TODO mastermind order
    gameState.mastermind.each(m => pushEv(ev, "EFFECT", { source: m, func: m.strike }));
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
function villainEscapeEv(ev: Ev, what: Card) { pushEv(ev, "ESCAPE", { what, func: villainEscape }); }
function villainEscape(ev: Ev): void {
  let c = ev.what;
  let b = c.captured;
  gameState.villainsEscaped++;
  b.each(function (bc) { moveCardEv(ev, bc, gameState.escaped); });
  gameState.bystandersCarried += b.count(isBystander);
  if (b.has(isBystander)) eachPlayer(p => pickDiscardEv(ev, p));
  moveCardEv(ev, c, gameState.escaped);
  selectCardAndKOEv(ev, HQCards().limit(c => c.cost <= 6));
  if (c.escape) pushEv(ev, "EFFECT", { source: c, func: c.escape });
}
function villainFight(ev: Ev): void {
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
function defeatEv(ev: Ev, c: Card) {
  pushEv(ev, "DEFEAT", { func: villainDefeat, what: c });
}
function villainDefeat(ev: Ev): void {
  let c = ev.what;
  let deckName = c.location.id;
  let b = c.captured;
  c.attached("TACTICS").withLast(t => c = t);
  // TODO according to https://boardgamegeek.com/article/19007319#19007319 defeat triggers would happen here
  // TODO choose move order
  // TODO all the move effects should happen first
  b.each(bc => rescueEv(ev, bc));
  // TODO fight effect should be first
  moveCardEv(ev, c, playerState.victory);
  if (c.fight) pushEv(ev, "EFFECT", { source: c, func: c.fight, deckName });
}
function rescueEv(ev: Ev, what?: Card | number): void {
  if (what && typeof what !== "number") pushEv(ev, "RESCUE", { func: rescueBystander, what: what });
  else for (let i = 0; i < (what || 1); i++) cont(ev, () => {
    if (gameState.bystanders.top) pushEv(ev, "RESCUE", { func: rescueBystander, what: gameState.bystanders.top });
  });
}
function rescueBystander(ev: Ev): void {
  let c = ev.what;
  moveCardEv(ev, c, playerState.victory);
  if (c.rescue) pushEv(ev, "EFFECT", { source: c, func: c.rescue });
}
function addTurnTrigger(type: string, match: () => boolean, f: Trigger | ((ev: Ev) => void)) {
  const trigger: Trigger = typeof f === "function" ? { event: type, after: f } : f;
  trigger.event = type;
  trigger.match = match || (() => true);
  turnState.triggers.push(trigger);
}
function findTriggers(ev: Ev): {trigger: Trigger, source: Card|Ev, state?: {}}[] {
  let triggers:{trigger: Trigger, source: Card|Ev}[] = [];
  let checkTrigger = (source: Ev | Card) => (t: Trigger) => {
    if(t.event === ev.type && t.match(ev, source)) triggers.push({trigger:t, source:source});
  };
  let checkCardTrigger = (c: Card) => {
    if (c.trigger) checkTrigger(c)(c.trigger);
  };
  gameState.triggers.forEach(checkTrigger(gameState));
  turnState.triggers.forEach(checkTrigger(turnState));
  playerState.hand.each(checkCardTrigger);
  playerState.revealed.each(checkCardTrigger);
  gameState.playArea.each(checkCardTrigger);
  return triggers;
}
function addTriggers(ev: Ev): Ev[] {
  // TODO: more dynamic events (add generic { type:"TRIGGER", what:ev.type, when:"BEFORE" }), harder for replacement and steteful before/after triggers - not sure what I meant here anymore
  // TODO: order triggers
  let triggers = findTriggers(ev);
  let newev = [];
  triggers.forEach(function(t) {
    if (t.trigger.before) {
      let state = t.trigger.after ? {} : undefined;
      t.state = state;
      newev.push(new Ev(ev, "EFFECT", { func:t.trigger.before, source:t.source, state }));
    }
  });
  newev.push(ev);
  triggers.forEach(function(t) {
    if (t.trigger.after)
      newev.push(new Ev(ev, "EFFECT", { func: t.trigger.after, source: t.source, state: t.state }));
  });
  triggers.forEach(function(t) {
    if (t.trigger.replace)
      newev = [ new Ev(ev, "EFFECT", { func:t.trigger.replace, replacing:newev, source:t.source })];
  });
  return newev;
}
function playTurn(ev: Turn) {
  textLog.log("Turn Start");
  turnState = ev;
  villainDrawEv(ev);
  pushEv(ev, "ACTIONS", ev => {
    if (!ev.endofturn) {
      pushEv(ev, "SELECTEVENT", { desc: "Play card or action", options: getActions(ev), ui: true });
      pushEvents(ev);
    }
  });
  pushEv(ev, "CLEANUP", cleanUp);  
}

// GUI
function imageName(path: string, name: string, subname?: string): string {
  if (subname !== undefined) name += "_" + subname;
  name = name.toLowerCase().replace(/ /g, "_").replace(/[^a-z0-9_]/g, "");
  return "images/" + path + "/" + name + ".png";
}
function cardImageName(card: Card): string {
  if (card.cardType === "HERO") return imageName("heroes", card.heroName, card.cardName);
  if (card.cardType === "VILLAIN" && card.villainGroup === undefined) return imageName("henchmen", card.cardName);
  if (card.cardType === "VILLAIN") return imageName("villains", card.villainGroup, card.cardName);
  if (card.cardType === "MASTERMIND") return imageName("masterminds", card.cardName);
  if (card.cardType === "TACTICS") return imageName("masterminds", card.mastermind.cardName, card.cardName);
  if (card.cardType === "SCHEME") return imageName("schemes", card.cardName);
  return imageName("", card.cardType);
}
function makeDisplayCard(c: Card): string {
  let res = `<span class="card" id="${c.id}" >${c.id}</span>`;
  if (c._attached) for (let i in c._attached) if (c._attached[i].size) {
    res += ' [ ' + i + ': ' + c._attached[i].deck.map(makeDisplayCard).join(' ') + ' ]';
  }
  return res;
}
function makeDisplayCardImg(c: Card): string {
  return `<IMG class="card" id="${c.id}" src="${cardImageName(c)}">`;
}
function makeDisplayBackImg(c: Card): string {
  return `<IMG class="card" id="${c.id}" src="images/back.png">`;
}
function makeDisplayPlayAreaImg(c: Card): string {
  const gone = gameState.playArea.deck.includes(c) ? "" : " gone";
  return `<IMG class="card${gone}" id="${c.id}" src="${cardImageName(c)}">`;
}
function displayDecks(): void {
  let divs = document.getElementsByClassName("deck");
  let list = Deck.prototype.deckList;
  let deckById:{[id: string]:Deck} = {};
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
function eventSource(ev: Ev): string {
  const s = ev.getSource();
  return s instanceof Card ? `<IMG class="card" src="${cardImageName(s)}">` : "";
}

function displayGame(ev: Ev): void {
  displayDecks();
  document.getElementById("source").innerHTML = eventSource(ev);
  document.getElementById("recruit").innerHTML = turnState.recruit.toString();
  document.getElementById("attack").innerHTML = turnState.attack.toString();
  document.getElementById("vp").innerHTML = currentVP().toString();
}

// Main loop
function mainLoopAuto(): void {
  let count = 0;
  function makeAction(): void {
    count++;
    let ev = popEvent();
    while (!ev.ui) { ev.func(ev); ev = popEvent(); }
    displayGame(ev);
    ({
      "SELECTEVENT": function () { pushEvents(ev.options[0]); },
      "SELECTCARD1": function () { ev.result1(ev.options[0]); },
      "SELECTCARD01": function () { ev.result1(ev.options[0]); },
    }[ev.type] || ev.func)();
    if (count < 500) setTimeout(makeAction, 200);
  }
  setTimeout(makeAction, 0);
}
function setMessage(msg: string): void {
  document.getElementById("message").innerHTML = msg;
}

function getEventName(ev: Ev): string {
  if (ev.type === "ENDOFTURN") return "End Turn";
  if (ev.desc) return ev.desc;
  if (ev.what) return `${ev.type} ${ev.what}`;
  console.log("Unknown option", ev);
  return "Unknown option";
}
let clickActions: {[id: string]:(() => void)} = {};
function clickCard(ev): void {
  for (let node = ev.target; node; node = node.parentNode) {
    if (node.id) console.log(node.id);
    if (node.id && clickActions[node.id]) {
      clickActions[node.id]();
      return;
    }
  }
}
function mainLoop(): void {
  let extraActions: { name: string, confirm?: boolean, func: () => void }[] = [];
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
        if (num === 0) ev.result0();
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
    if (ev.desc) {
      if (/\bKO\b/.test(ev.desc)) e.classList.add("selectko");
      if ((/\bdiscard\b/i).test(ev.desc)) e.classList.add("selectdiscard");
      if ((/\brecruit\b/i).test(ev.desc)) e.classList.add("selectrecruit");
      if ((/\bdefeat\b/i).test(ev.desc)) e.classList.add("selectdefeat");
    }
  });
  document.getElementById("extraActions").innerHTML = extraActionsHTML;
  document.getElementById("logContainer").innerHTML = `${undoLog.toString()}<br>${textLog.text}`;
}
function startGame(): void {
  initGameState();
  mainLoop();
}
function startApp(): void {
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
Show attached cards and deck counts
Show hidden events
Select setup screen

ENGINE:
Use deck.(locationN|n)ame instead of deck.id
required villain/hero groups

other sets base functions: artifacts, special bystanders, sidekicks, divided cards
*/
