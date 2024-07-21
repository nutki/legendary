// Random Number Generator
class RNG {
  m: number
  a: number
  c: number
  state: number
constructor(seed?: number) {
  this.m = 0x100000000;
  this.a = 1103515245;
  this.c = 12345;
  this.state = seed === undefined ? Math.floor(Math.random() * (this.m-1)) : seed;
}
nextInt(): number {
  this.state = (this.a * this.state + this.c) % this.m;
  return this.state;
};
nextFloat(): number {
  return this.nextInt() / (this.m - 1);
};
nextRange(start: number, end: number): number {
  let rangeSize = end - start;
  let randomUnder1 = this.nextInt() / this.m;
  return start + Math.floor(randomUnder1 * rangeSize);
};
choice<T>(array: T[]): T {
  return array[this.nextRange(0, array.length)];
};
}
function shuffleArray<T>(a: T[], r: RNG): void {
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
  color: number
  printedAttack: number
  printedRecruit: number
  printedDefense: number
  printedVP: number
  printedCost: number
  printedPiercing: number
  playCostType?: "DISCARD" | "TOPDECK" | "BOTTOMDECK"
  playCost?: number
  playCostLimit?: (c: Card) => boolean;
  fightCond?: (c?: Card) => boolean
  fightCost?: (ev: Ev) => void
  fightFail?: (ev: Ev) => void
  healCond?: (c: Card) => boolean
  instance: Card
  _attached: {[name: string]:Deck}
  tacticsTemplates?: Card[]
  triggers: Trigger[]
  trigger: Trigger
  init?: (state: any) => void
  twist?: (ev: Ev) => void
  required?: { heroes?: string, villains?: string, henchmen?:string }
  bribe?: boolean
  ambush?: Handler | Handler[]
  fight?: Handler | Handler[]
  escape?: Handler | Handler[]
  varVP?: (c: Card) => number
  varDefense?: (c: Card) => number
  varFightCost?: (c: Card, attack: number) => ActionCost;
  rescue?: (ev: Ev) => void
  heal?: (ev: Ev) => void
  effects?: ((ev: Ev) => void)[]
  strike?: (ev: Ev) => void
  copyPasteCard?: boolean
  heroName?: string
  printedVillainGroup?: string
  leads?: string
  cardName?: string
  mastermind?: Card
  isHenchman?: boolean
  teleport?: boolean
  soaring?: boolean
  wallcrawl?: boolean
  team: Affiliation
  flags?: string
  params?: SetupParams
  set?: string
  templateId?: string
  cardActions?: ((c: Card, ev: Ev) => Ev)[]
  xTremeAttack?: boolean
  isArtifact?: boolean
  artifactEffects?: ((ev: Ev) => void)[]
  throwCond?: (c: Card) => boolean;
  gainable?: boolean
  printedNthCircle?: number
  sizeChanging?: number
  divided?: { left: Card, right: Card }
  excessiveViolence?: Handler
  lightShow?: Handler
  trapCond?: (ev: Ev) => boolean
  trapPenalty?: Handler
  epic?: boolean
  coordinate?: boolean
  transformed?: Card
  isTransformed?: boolean
  backSide?: Card
  uSizeChanging?: { color: number, amount: number }
  chivalrousDuel?: boolean;
  modifiers?: Modifiers;
  isAdaptingMastermind?: boolean;
  cosmicThreat?: Filter<Card>;
  mastermindName?: string;
  whenRecruited?: Handler;
}
interface VillainCardAbillities {
  ambush?: Handler | Handler[]
  fight?: Handler | Handler[]
  escape?: Handler | Handler[]
  strike?: Handler | Handler[]
  varVP?: (c: Card) => number
  varDefense?: (c: Card) => number
  varFightCost?: (c: Card, attack: number) => ActionCost;
  fightCond?: (c?: Card) => boolean
  fightCost?: (ev: Ev) => void
  fightFail?: (ev: Ev) => void
  bribe?: boolean
  isHenchman?: boolean
  trigger?: Trigger
  triggers?: Trigger[]
  cardActions?: ((c: Card, ev: Ev) => Ev)[]
  xTremeAttack?: boolean
  printedNthCircle?: number
  sizeChanging?: number
  excessiveViolence?: Handler
  uSizeChanging?: { color: number, amount: number }
  chivalrousDuel?: boolean
  modifiers?: Modifiers;
  cosmicThreat?: Filter<Card>;
}
interface MastermindCardAbillities {
  varDefense?: (c: Card) => number  
  fightFail?: (ev: Ev) => void
  bribe?: boolean
  init?: (c: Card) => void
  trigger?: Trigger
  triggers?: Trigger[]
  cardActions?: ((c: Card, ev: Ev) => Ev)[]
  fightCond?: (c?: Card) => boolean
  fightCost?: (ev: Ev) => void
  escape?: Handler | Handler[] // King Hyperion
  printedNthCircle?: number
  sizeChanging?: number
  chivalrousDuel?: boolean
  cosmicThreat?: Filter<Card>;
}
interface VillainousWeaponCardAbillities {
  ambush?: Handler | Handler[];
}
interface TacticsCardAbillities {
  fight?: Handler | Handler[];
  trigger?: Trigger;
  printedDefense?: number;
}
interface HeroCardAbillities {
  trigger?: Trigger
  triggers?: Trigger[]
  playCost?: number
  playCostType?: 'TOPDECK' | 'DISCARD' | 'BOTTOMDECK';
  playCostLimit?: (c: Card) => boolean;
  copyPasteCard?: boolean
  teleport?: boolean
  soaring?: boolean
  wallcrawl?: boolean
  cardActions?: ((c: Card, ev: Ev) => Ev)[]
  isArtifact?: boolean
  throwCond?: (c: Card) => boolean;
  sizeChanging?: number
  uSizeChanging?: { color: number, amount: number }
  excessiveViolence?: Handler
  printedPiercing?: number
  lightShow?: Handler
  coordinate?: boolean
  cheeringCrowds?: boolean
  whenRecruited?: Handler;
}
class Card {
  constructor (t: string, n: string) {
    this.cardType = t;
    this.cardName = n;
  }
  get cost() { return getModifiedStat(this, 'cost', (this.gainable ? this.printedDefense : this.printedCost) || 0); }
  get attack() { return getModifiedStat(this, 'attack', this.printedAttack); }
  get recruit() { return this.printedRecruit; }
  get baseDefense() {
    if (this.varDefense) return this.varDefense(this);
    return this.printedDefense;
  }
  get defense() {
    let value = getModifiedStat(this, "defense", this.baseDefense);
    if (value === undefined) return value;
    value += this.attached('SHARD').size;
    if (this.nthCircle) value += nthCircleDefense(this);
    value += this.attached('WEAPON').sum(c => this.defense);
    if (isSizeChanged(this)) value -= 2;
    if (value < 0) value = 0;
    value -= uSizeChangingAmount(this); // Only this can make the attack negative
    return value;
  }
  get vp() {
    const baseVP = (this.varVP ? this.varVP(this) : this.printedVP) || 0;
    return getModifiedStat(this, 'vp', baseVP);
  }
  get villainGroup() {
   return getModifiedStat(this, "villainGroup", this.printedVillainGroup)
  }
  isHealable() { return this.cardType === "WOUND"; }
  isColor(c: number) { return (getModifiedStat(this, 'color', this.color) & c) !== 0; }
  isTeam(t: Affiliation) { return this.divided ? this.divided.left.team === t || this.divided.right.team === t : this.team === t; }
  isGroup(t: string) { return this.villainGroup === t; }
  hasTeleport() { return getModifiedStat(this, "teleport", this.teleport); }
  hasWallCrawl() { return getModifiedStat(this, "wallcrawl", this.wallcrawl); }
  get nthCircle() { return getModifiedStat(this, "nthCircle", this.printedNthCircle || 0); }
  attachedDeck(name: string) { return attachedDeck(name, this); }
  attached(name: string) { return attachedCards(name, this); }
  get captured() { return this.attached('CAPTURED'); }
};
let Color = {
  COVERT:1,
  INSTINCT:2,
  TECH:4,
  RANGED:8,
  STRENGTH:16,
  GRAY:32,
};
function makeHeroCard(hero: string, name: string, cost: number, recruit: number, attack: number, color: number, team: Affiliation, flags?: string, effects?: ((ev: Ev) => void) | (((ev: Ev) => void)[]), abilities?: HeroCardAbillities) {
  let c = new Card("HERO", name);
  c.printedCost = cost;
  c.printedRecruit = recruit;
  c.printedAttack = attack;
  c.heroName = hero;
  c.color = color;
  c.team = team;
  c.flags = flags;
  c.effects = typeof effects === "function" ? [ effects ] : effects;
  if (abilities) {
    Object.assign(c, abilities);
    if (abilities.isArtifact) {
      c.artifactEffects = c.effects;
      c.effects = [ playArtifact ];
    }
  }
  return c;
}
function makeGainableCard(c: Card, recruit: number, attack: number, color: number, team: Affiliation, flags?: string, effects?: ((ev: Ev) => void) | (((ev: Ev) => void)[]), abilities?: HeroCardAbillities & { printedCost?: number }) {
  c.gainable = true;
  c.printedRecruit = recruit;
  c.printedAttack = attack;
  c.heroName = c.cardName;
  c.color = color;
  c.team = team;
  c.flags = flags;
  c.printedVP = undefined;
  if ((c.cardType === "VILLAIN" || c.cardType === "TACTIC") && !c.fight) c.fight = ev => gainEv(ev, ev.source);
  if (c.cardType === "BYSTANDER" && !c.rescue) c.rescue = ev => gainEv(ev, ev.source);
  c.effects = typeof effects === "function" ? [ effects ] : effects;
  if (abilities) {
    Object.assign(c, abilities);
    if (abilities.isArtifact) {
      c.artifactEffects = c.effects;
      c.effects = [ playArtifact ];
    }
  }
  return c;
}
function makeDividedHeroCard(c1: Card, c2: Card) {
  let c = new Card("HERO", `${c1.cardName} / ${c2.cardName}`);
  const sumPrintedStat = (a: number, b: number) => a === undefined ? b : a + (b || 0);
  const orStat = (a: number, b: number) => a === undefined ? b : a | (b || 0);
  const mergeArrayStat = <T>(a: T[], b: T[]) => a === undefined ? b : b === undefined ? a : [...a, ...b].unique(a => a);
  c.divided = { left: c1, right: c2 };
  c.printedRecruit = sumPrintedStat(c1.printedRecruit, c2.printedRecruit);
  c.printedAttack = sumPrintedStat(c1.printedAttack, c2.printedAttack);
  c.printedCost = c1.printedCost;
  c.color = c1.color | c2.color;
  c.heroName; // TODO handle in ???
  c.flags = c1.flags;
  c.effects = c1.effects ? c2.effects ? c1.effects.concat(c2.effects) : c1.effects : undefined;
  c.sizeChanging = orStat(c1.sizeChanging, c2.sizeChanging); // TODO this works differently in Champions
  c.cardActions = mergeArrayStat(c1.cardActions, c2.cardActions);
  // TODO handle flags
  // TODO handle costs
  return c;
}
const sameEffect: Handler = () => { throw Error('Unresolved sameEffect') };
function makeVillainCard(group: string, name: string, defense: number, vp: number, abilities: VillainCardAbillities) {
  let c = new Card("VILLAIN", name);
  c.printedDefense = defense;
  c.printedVP = vp;
  c.printedVillainGroup = group;
  if (abilities) Object.assign(c, abilities);
  if (c.fight === sameEffect) c.fight = c.ambush;
  if (c.escape === sameEffect) c.escape = c.fight || c.ambush;
  return c;
}
function makeLocationCard(group: string, name: string, defense: number, vp: number, abilities: VillainCardAbillities) {
  let c = new Card("LOCATION", name);
  c.printedDefense = defense;
  c.printedVP = vp;
  c.printedVillainGroup = group;
  if (abilities) Object.assign(c, abilities);
  return c;
}
function makeVillainousWeaponCard(group: string, name: string, defense: number, abilities: VillainousWeaponCardAbillities) {
  const c = new Card("VILLAINOUSWEAPON", name);
  c.printedDefense = defense;
  c.printedVillainGroup = group;
  if (abilities) Object.assign(c, abilities);
  return c;
}
function makeTacticsCard(name: string, abilities: TacticsCardAbillities = {}) {
  const t = new Card("TACTICS", name);
  if (abilities) Object.assign(t, abilities);
  return t;
}
function makeEpicMastermindCard(name: string | [string, string], defense: [number, number], vp: number, leads: string, strike: (ev: Ev) => void, tactics: ([string, (ev: Ev) => void]| Card)[], abilities?: MastermindCardAbillities | ((epic: boolean) => MastermindCardAbillities)) {
  const m1 = makeMastermindCard(typeof name === "string" ? name : name[0],
    defense[0], vp, leads, strike, tactics, abilities instanceof Function ? abilities(false) : abilities);
  const m2 = makeMastermindCard(typeof name === "string" ? "Epic " + name : name[1],
    defense[1], vp, leads, strike, [], abilities instanceof Function ? abilities(true) : abilities);
  m2.epic = true;
  // Epic masterminds use unchanged defense on tactics (may be relevant for some schemes).
  m2.tacticsTemplates = m1.tacticsTemplates;
  return [m1, m2];
}
function makeMastermindCard(name: string, defense: number, vp: number, leads: string, strike: (ev: Ev) => void, tactics: ([string, (ev: Ev) => void]| Card)[], abilities?: MastermindCardAbillities) {
  let c = new Card("MASTERMIND", name);
  c.printedDefense = defense;
  c.printedVP = vp;
  c.leads = leads;
  c.strike = strike;
  c.tacticsTemplates = tactics.map(function (e) {
    const t = e instanceof Card ? e : makeTacticsCard(e[0], { fight: e[1] });
    t.printedVP = vp;
    t.mastermindName = name;
    if (t.printedDefense === undefined)
      t.printedDefense = defense;
    return t;
  });
  if (abilities) Object.assign(c, abilities);
  return c;
}
function makeAdaptingMastermindCard(name: string, vp: number, leads: string, tactics: Card[]) {
  let c = new Card("MASTERMIND", name);
  c.printedVP = vp;
  c.leads = leads;
  c.isAdaptingMastermind = true;
  tactics.each(c => {
    c.mastermindName = name;
    c.printedVP = vp;
    c.leads = leads;
    c.isAdaptingMastermind = true;
  });
  c.tacticsTemplates = tactics;
  return c;
}
function makeAdaptingTacticsCard(name: string, defense: number, strike: Handler, fight: Handler, abilities?: MastermindCardAbillities) {
  const c = makeTacticsCard(name);
  c.printedDefense = defense;
  c.strike = strike;
  c.fight = fight;
  abilities && Object.assign(c, abilities);
  return c;
}
function makeBystanderCard(name: string, rescue?: (ev: Ev) => void, vp?: (c: Card) => number) {
  let c = new Card("BYSTANDER", name);
  c.printedVP = 1;
  c.rescue = rescue;
  if (vp) c.varVP = vp;
  return c;
}
function makeWoundCard(name: string, cond: (c: Card) => boolean, heal: (ev: Ev) => void, customType?: string) {
  let c = new Card(customType || "WOUND", name);
  c.heal = heal;
  c.healCond = cond;
  if (name) c.cardName = name;
  return c;
}
function makeHenchmenCard(name: string, defense: number, abilities: VillainCardAbillities, group: string = name) {
  abilities.isHenchman = true;
  return makeVillainCard(group, name, defense, 1, abilities);
}
function makeHenchmenLocationCard(name: string, defense: number, abilities: VillainCardAbillities, group: string = name) {
  abilities.isHenchman = true;
  return makeLocationCard(group, name, defense, 1, abilities);
}
function makeTrapCard(group: string, name: string, vp: number, ambush: Handler, cond: (ev: Ev) => boolean, penalty: Handler) {
  let c = new Card("TRAP", name);
  c.printedVillainGroup = group;
  c.ambush = ambush;
  c.trapCond = cond;
  c.trapPenalty = penalty;
  c.printedVP = vp;
  return c;
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
  return p;
}
function makeCardDividedChoice(c: Card, rightSide: boolean) {
  if (c.ctype !== 'P') throw TypeError("need card in play");
  Object.setPrototypeOf(c, Object.getPrototypeOf(rightSide ? c.divided.right : c.divided.left));
}
function moveCard(c: Card, where: Deck, bottom?: boolean): void {
  // Card copies do not have a location and cannot be moved
  if (!c.instance) return;
  if (c.ctype !== 'P') throw TypeError("need card in play");
  if (!c.location) {
    TypeError("Moving card without location " + c);
  };
  c.location.remove(c);
  if (c.location.revealedCards) {
    for (const revealed of c.location.revealedCards) {
      const pos = revealed.indexOf(c);
      if (pos >=0) revealed.splice(pos, 1);
    }
  }
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
type Affiliation =
'Avengers' |
'Brotherhood' |
'Cabal' |
'Crime Syndicate' |
'Fantastic Four' |
'Foes of Asgard' |
'Heroes of Asgard' |
'Guardians of the Galaxy' |
'HYDRA' |
'Illuminati' |
'Inhumans' |
'Marvel Knights' |
'Mercs for Money' |
'New Warriors' |
'S.H.I.E.L.D.' |
'Sinister Six' |
'Spider Friends' |
'X-Force' |
'X-Men' |
'Champions' |
'Warbound' |
'Venomverse';
type Filter<T> = number | Affiliation | ((c: T) => boolean)
class Deck {
  id: string
  owner: Player
  _attached: {[name: string]:Deck}
  deck: Card[]
  revealedCards?: Card[][];
  faceup: boolean
  isHQ?: boolean
  isCity?: boolean
  isDestoryed?: boolean
  next?: Deck
  below?: Deck
  above?: Deck
  adjacentLeft?: Deck
  adjacentRight?: Deck
  attachedTo?: Deck | Card
  constructor(name: string, faceup?: boolean) {
  this.id = name;
  this.deck = [];
  this.faceup = faceup === true;
  Deck.deckList.push(this);
  }
  get size(): number { return this.deck.length; }
  addNewCard(c: Card, n?: number): Card { let r = undefined; for (let i = 0; i < (n || 1); i++) r = makeCardInPlay(c, this); return r; }
  _put(c: Card) { this.deck.push(c); c.location = this; }
  _putBottom(c: Card) { this.deck.unshift(c); c.location = this; }
  shuffle() { shuffleArray(this.deck, gameState.gameRand); }
  get bottom(): Card { return this.deck[0]; }
  get top(): Card { return this.deck[this.deck.length - 1]; }
  get first(): Card { return this.deck[0]; }
  get last(): Card { return this.deck[this.deck.length - 1]; }
  remove(c: Card): boolean { let p = this.deck.indexOf(c); if (p >= 0) this.deck.splice(p, 1); return p >= 0; }
  limit(c: Filter<Card>): Card[] { return limit(this.deck, c); }
  count(c: Filter<Card>): number { return count(this.deck, c); }
  has(c: Filter<Card>) { return count(this.deck, c) > 0; }
  each(f: (c: Card) => void) { this.deck.forEach(f); }
  withTop(f: (c: Card) => void) { if (this.size !== 0) f(this.top); }
  withBottom(f: (c: Card) => void) { if (this.size !== 0) f(this.bottom); }
  withFirst(f: (c: Card) => void) { if (this.size !== 0) f(this.first); }
  withLast(f: (c: Card) => void) { if (this.size !== 0) f(this.last); }
  withRandom(f: (c: Card) => void) {if (this.size !== 0) f(this.deck[gameState.gameRand.nextRange(0, this.size)]); }
  attachedDeck(name: string): Deck { return attachedDeck(name, this); }
  attached(name: string): Card[] { return attachedCards(name, this); }
  registerRevealed(cards: Card[]) {
    this.revealedCards = this.revealedCards || [];
    this.revealedCards.push(cards);
  }
  clearRevealed(cards: Card[]) {
    if (this.revealedCards) {
      this.revealedCards = this.revealedCards.filter(e => e !== cards);
      if (!this.revealedCards.length) this.revealedCards = undefined;
    }
  }
  static deckList: Deck[] = []
};

interface Array<T> {
  size: number
  count: (f: Filter<T>) => number
  limit: (f: Filter<T>) => T[]
  uniqueCount: <U>(f: (c: T) => U) => number
  unique: <U>(f: (c: T) => U) => U[]
  has: (f: Filter<T>) => boolean
  each: (f: (c: T) => void) => void
  sum: (f: (c: T) => number) => number
  max: (f: (c: T) => number) => number
  highest: (f: (c: T) => number) => T[]
  merge: () => T
  withFirst: (f: (c: T) => void) => void
  withLast: (f: (c: T) => void) => void
  withRandom: (f: (c: T) => void) => void
  firstOnly: () => T[]
  shuffled: () => T[]
}
Array.prototype.count = function (f) { return count(this, f); };
Object.defineProperty(Array.prototype, 'size', { get: function() { return this.length; } });
Array.prototype.shuffled = function () { const r = [...this]; shuffleArray(r, gameState.gameRand); return r; };
Array.prototype.limit = function (f) { return limit(this, f); };
Array.prototype.has = function (f) { return count(this, f) > 0; };
Array.prototype.each = function <T, U>(this: Array<T>, f: (e: T, i: number) => U) { return this.forEach(f); };
Array.prototype.sum = function (this: Array<number>, f) { return this.map(f).reduce((a, v) => a + v, 0); };
Array.prototype.max = function (this: Array<number>, f) { return this.map(f).reduce((a, v) => v === undefined ? a : a === undefined ? v : Math.max(a, v), undefined); };
Array.prototype.highest = function <T>(this: Array<T>, f: (c: T) => number) { return this.filter(a => f(a) === this.max(f)); };
Array.prototype.merge = function <T>(this: Array<T>) { return this.reduce((a, v) => a.concat(v), []); };
Array.prototype.uniqueCount = function <T, U>(this: Array<T>, f: (c: T) => U) { let m = new Set<U>(); this.forEach(e => m.add(f(e))); return m.size; }
Array.prototype.unique = function <T, U>(this: Array<T>, f: (c: T) => U) { let m = new Set<U>(); this.forEach(e => m.add(f(e))); return [...m.keys()]; }
Object.defineProperty(Array.prototype, 'first', { get: function() { return this[0]; }, set: function(v) { return this[0] = v; } });
Object.defineProperty(Array.prototype, 'last', { get: function() { return this[this.size-1]; }, set: function(v) { return this[this.size - 1] = v; } });
Array.prototype.withFirst = function (f) { if (this.size !== 0) f(this.first); };
Array.prototype.withLast = function (f) { if (this.size !== 0) f(this.last); };
Array.prototype.withRandom = function (f) { if (this.size !== 0) f(this[this.size === 1 ? 0 : gameState.gameRand.nextRange(0, this.size)]); };
Array.prototype.firstOnly = function () { return this.length ? [ this[0] ] : [] };
function repeat(n: number, f: (i: number) => void) { for (let i = 0; i < n; i++) f(i); }

type Option = Card | Ev;
type EvType =
// Basic actions
'RECRUIT' |
'FIGHT' |
'PLAY' |
'HEAL' |
'ENDOFTURN' |
// Basic effects
'KO' |
'RESCUE' |
'DISCARD' |
'GAIN' |
'STRIKE' |
'TWIST' |
'DEFEAT' |
'ESCAPE' |
'ADDATTACK' |
'ADDRECRUIT' |
'CAPTURE' |
'VILLAINDRAW' |
'DRAWCARDS' |
'DRAW' |
'PLAYCARDEFFECTS' |
'RESHUFFLE' |
'CARDEFFECT' |
// UI
'SELECTEVENT' |
'SELECTCARD1' |
'SELECTCARD01' |
'SELECTOBJECTS' |
'CONFIRM' |
// Expansion actions
'TELEPORT' |
'FOCUS' |
'DODGE' |
'COSMICTHREATREVEAL' |
'USESHARDFORRECRUIT' |
'USESHARD' |
'USEARTIFACT' |
'THROWARTIFACT' |
// Expansion effects
'URUENCHANTEDREVEAL' |
'NTHCIRCLEREVEAL' |
'COORDINATE' |
'OUTWIT' |
'TRANSFORM' |
'DANGERSENSE' |
// Special
'STATE' |
'TURN' |
'ACTIONS' |
'CLEANUP' |
'GAMEOVER' |
'EFFECT' |
'MOVECARD' |
'NOOP' |
'TURNSTART' |
'CHIVALROUSSPEND' |
// Scheme Actions
'PAYTORESCUE' |
'BETRAY' |
'BUYSHARD' |
'INSANEPLAY' |
undefined;
type TriggerableEvType =
// Basic actions
'RECRUIT' | 'FIGHT' | 'PLAY' |
// Basic effects
'KO' | 'RESCUE' | 'DISCARD' | 'GAIN' | 'STRIKE' | 'TWIST' | 'DEFEAT' | 'ESCAPE' | 'ADDRECRUIT' | 'VILLAINDRAW' | 'DRAW' | 'DRAWCARDS' | 'RESHUFFLE' | 'CARDEFFECT' |
'ADDATTACK' |
// Expansion actions
'TELEPORT' | 'DODGE' |
// Expansion effects
'COORDINATE' | 'OUTWIT' |
// Special
'CLEANUP' | 'MOVECARD' | 'TURNSTART';
interface Ev<TSchemeState = any> {
  type: EvType
  desc?: string
  parent: Ev
  source?: Card
  func?: (ev: Ev) => void
  what?: Card
  from?: Deck
  to?: Deck
  where?: Deck
  who?: Player
  amount?: number
  bottom?: boolean
  villain?: Card
  result?: "WIN" | "LOSS" | "DRAW"
  agent?: Player
  endofturn?: boolean
  replacing?: Ev[]
  // ui events
  options?: Option[]
  min?: number
  max?: number
  ui?: boolean
  result0?: () => void
  result1?: (c: Card) => void
  confirm?: boolean
  // Twist EFFECT
  twist?: Card
  nr?: number
  another?: boolean
  state?: TSchemeState
  cost?: ActionCost
  effectName?: EffectStat
  failFunc?: (ev: Ev) => void
  withViolence?: boolean
  id: number
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
  villain?: Card
  source?: Card | Ev
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
  replacing?: Ev[]
  confirm?: boolean
  cost?: ActionCost
  effectName?: EffectStat
  failFunc?: (ev: Ev) => void
  withViolence?: boolean
  actionFilters?: ((ev: Ev) => boolean)[]
}
class Ev implements EvParams {
  constructor (ev: Ev, type: EvType, params: EvParams | ((ev: Ev) => void)) {
  this.parent = ev;
  this.type = type;
  if (typeof params === "function") {
    this.func = params;
  } else Object.assign(this, params);
  if (!this.ui && (!this.func || typeof this.func !== "function")) throw TypeError("No function in event");
  }
  getSource() {
    for (let ev: Ev = this; ev; ev = ev.parent) {
      if (ev.source) return ev.source;
    }
    return undefined;
  }
  toString() {
    const evList = new Array<Ev>();
    for (let e: Ev<any> = this; e; e = e.parent) evList.unshift(e);
    let r = evList.map(e => `${e.type} ${e.id}`).join(' => ');
    if (this.what) r += ` (${this.what.id})`;
    return r;
  }
  setId() {
    const id = Ev.nextId.get(this.type) || 0;
    this.id = id;
    Ev.nextId.set(this.type, id + 1);
  }
  static nextId = new Map<string, number>();
};

interface Templates {
  [s: string]: {
    set?: string
    templateId?: string
    name?: string
    cardName?: string
  }[]
  HEROES: {
    set?: string
    templateId?: string
    team: string
    name: string
    c1: Card
    c2: Card
    uc: Card
    ra: Card
  }[]
  HENCHMEN: (Card | {
    set?: string;
    templateId?: string;
    cards: [number, Card][];
  })[]
  VILLAINS: {
    set?: string
    templateId?: string
    name: string
    cards: [number, Card][]
  }[]
  MASTERMINDS: Card[]
  SCHEMES: Card[]
  BYSTANDERS: {
    set?: string
    templateId?: string
    cards: [number, Card][]
  }[]
  AMBITIONS: Card[]
}
// Card definitions
let cardTemplates: Templates = {
  HEROES: [],
  HENCHMEN: [],
  VILLAINS: [],
  MASTERMINDS: [],
  SCHEMES: [],
  BYSTANDERS: [],
  AMBITIONS: [],
};
function addTemplates(type: 'HENCHMEN' | 'SCHEMES' | 'MASTERMINDS' | 'AMBITIONS', set: string, templates: Card[]) {
  templates.forEach(t => {
    t.set = set;
    t.templateId = t.cardName;
    if (t.tacticsTemplates) t.tacticsTemplates.forEach(tt => tt.set = set);
    cardTemplates[type].push(t);
  });
}
function addHeroTemplates(set: string, templates: Templates['HEROES']) {
  templates.forEach(t => {
    t.set = t.c1.set = t.c2.set = t.uc.set = t.ra.set = set;
    t.templateId = t.name;
    if (findHeroTemplate(t.templateId)) t.templateId += '@' + set;
    cardTemplates.HEROES.push(t);
  });
}
function addVillainTemplates(set: string, templates: Templates['VILLAINS']) {
  templates.forEach(t => {
    t.set = set;
    t.templateId = t.name;
    t.cards.forEach(c => c[1].set = set);
    cardTemplates.VILLAINS.push(t);
  });
}
function addBystanderTemplates(set: string, cards: [number, Card][]) {
  cards.forEach(c => c[1].set = set);
  cardTemplates.BYSTANDERS.push({
    templateId: set,
    set,
    cards,
  });
}
function addHenchmenTemplates(set: string, templates: Templates['HENCHMEN']) {
  templates.forEach(t => {
    t.set = set;
    if (t instanceof Card) {
      t.templateId = t.cardName;
    } else {
      t.templateId = t.cards[0][1].printedVillainGroup;
      t.cards.forEach(c => c[1].set = set);
    }
    cardTemplates.HENCHMEN.push(t);
  });
}
function findHeroTemplate(name: string) { return cardTemplates.HEROES.filter(t => t.templateId === name)[0]; }
function findHenchmanTemplate(name: string) { return cardTemplates.HENCHMEN.filter(t => t.templateId === name)[0]; }
function findVillainTemplate(name: string) { return cardTemplates.VILLAINS.filter(t => t.templateId === name)[0]; }
function findMastermindTemplate(name: string): Card { return cardTemplates.MASTERMINDS.filter(t => t.templateId === name)[0]; }
function findSchemeTemplate(name: string): Card { return cardTemplates.SCHEMES.filter(t => t.templateId === name)[0]; }
function findBystanderTemplate(name: string) { return cardTemplates.BYSTANDERS.filter(t => t.templateId === name)[0]; }
const u: undefined = undefined;

function makeSchemeCard<T = void>(name: string, counts: SetupParams, effect: (ev: Ev<T>) => void, triggers?: Trigger[] | Trigger, initfunc?: (state?: T) => void) {
  let c = new Card('SCHEME', name);
  c.params = counts;
  c.twist = effect;
  if (triggers) c.triggers = triggers instanceof Array ? triggers : [ triggers ];
  if (initfunc) c.init = initfunc;
  return c;
}
function makeTransformingSchemeCard<T = void>(name: string, transName: string, counts: SetupParams, effect: (transformed: boolean) => (ev: Ev<T>) => void, triggers?: Trigger[] | Trigger, initfunc?: (state?: T) => void) {
  const c1 = makeSchemeCard(name, counts, effect(false), triggers, initfunc);
  const c2 = makeSchemeCard(transName, counts, effect(true), triggers);
  c1.backSide = c2;
  c2.backSide = c1;
  c2.isTransformed = true;
  return c1;
}

interface Player {
  nr: number
  name: string
  deck: Deck
  discard: Deck
  victory: Deck
  playArea: Deck
  teleported: Deck
  artifact: Deck
  shard: Deck
  left: Player
  right: Player
  hand: Deck
  outOfTime: Deck
}
interface Turn extends Ev {
  recruit: number
  attack: number
  attackWithRecruit: boolean
  totalRecruit: number
  totalAttack: number
  attackSpecial: { amount: number, cond: (c: Card) => boolean }[]
  recruitSpecial: { amount: number, cond: (c: Card) => boolean }[]
  cardsDrawn: number
  cardsDiscarded: Card[]
  pastEvents: Ev[]
  bystandersRescued: number
  endDrawMod: number
  endDrawAmount: number
  cardsPlayed: Card[]
  modifiers: Modifiers
  triggers: Trigger[]
  versatileBoth?: boolean
  nextHeroRecruit?: "HAND" | "DECK" | "SOARING"
  turnActions?: Ev[]
  perTurn?: Map<string, number>
  playDividedBoth?: boolean
  investigateAmount?: number
  piercing: number
  recruitWithAttack: boolean
  piercingWithAttack: boolean
  smashMultiplier?: number
  hyperspeedBoth?: boolean
  actionFilters: ((ev: Ev) => boolean)[]
  destroyedConqueror?: boolean
}
interface Trigger {
  event: TriggerableEvType
  match?: (e: Ev, s?: Card) => boolean
  after?: (e: Ev) => void
  replace?: (e: Ev) => void
  before?: (e: Ev) => void
}
type CityLocation = "SEWERS" | "STREETS" | "BANK" | "ROOFTOPS" | "BRIDGE";
interface SetupParams {
  vd_henchmen_counts?: number[][]
  vd_villain?: number[] | number,
  vd_bystanders?: number[] | number,
  heroes?: number[] | number,
  wounds?: number[] | number,
  twists?: number[] | number,
  bindings?: number[] | number,
  shards?: number[] | number,
  required?: { heroes?: string | string[], villains?: string | string[], henchmen?:string | string[] },
  extra_masterminds?: number[] | number,
}
interface Game {
  gameRand: RNG
  nextId: number
  twistCount: number
  escaped: Deck
  villaindeck: Deck
  mastermind: Deck
  ko: Deck
  herodeck: Deck
  officer: Deck
  sidekick: Deck
  madame: Deck
  newRecruit: Deck
  wounds: Deck
  bindings: Deck
  scheme: Deck
  bystanders: Deck
  hq: Deck[]
  city: Deck[]
  shard: Deck
  horror: Deck
  trap: Deck
  transformed: Deck
  triggers: Trigger[]
  endDrawAmount: number
  modifiers: Modifiers
  players: Player[]
  advancedSolo: boolean
  villainsEscaped: number
  bystandersCarried: number
  cityEntry: Deck
  specialActions?: (ev: Ev) => Ev[]
  extraTurn?: boolean
  perGame?: Map<string, number>
  schemeState: any
  schemeProgress?: number
  schemeTarget?: number
  gameSetup: Setup
  turnNum: number
  strikeCount: number
  outwitAmount?: () => number
  reversePlayerOrder?: boolean // TODO revese player order
  destroyedCitySpaces: Deck[]
  actionFilters: ((ev: Ev) => boolean)[];
  contestOfCampionsEvilBonus?: number;
  thronesFavorHolder: Player | Card | undefined;
}
let eventQueue: Ev[] = [];
let eventQueueNew: Ev[] = [];
let turnState: Turn = undefined;
let playerState: Player = undefined;
let gameState: Game = undefined;
interface UndoLog {
  actions: string[]
  pos: number
  gameSetup?: Setup
  init: (setup?: Setup) => void
  replaying: boolean
  read: () => string
  readInt: () => number
  readInts: () => number[]
  write: (w: any) => void
  undo: () => void
  restart: () => void
  newGame: () => void
  toString: () => string
  fromString: (s: string) => void
}
const exampleGameSetup: Setup = {
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

   S01M04
  scheme: "Unleash the Power of the Cosmic Cube",
  mastermind: "Dr. Doom",
  henchmen: ["Savage Land Mutates"],
  villains: ["Enemies of Asgard"],
  heroes: [ "Deadpool", "Iron Man", "Wolverine" ],

   S01M05
  scheme: "Portals to the Dark Dimension",
  mastermind: "Dr. Doom",
  henchmen: ["Sentinel"],
  villains: ["Masters of Evil"],
  heroes: [ "Cyclops", "Gambit", "Hawkeye" ],

   S01M06  
  scheme: "Secret Invasion of the Skrull Shapeshifters",
  mastermind: "Red Skull",
  henchmen: ["Hand Ninjas"],
  villains: ["Skrulls"],
  heroes: [ "Cyclops", "Gambit", "Hawkeye", "Rogue", "Black Widow" ],

   S01M07
  scheme: "Unleash the Power of the Cosmic Cube",
  mastermind: "Loki",
  henchmen: ["Savage Land Mutates"],
  villains: ["Brotherhood"],

   S01M08
  scheme: "Replace Earth's Leaders with Killbots",
  mastermind: "Red Skull",
  henchmen: ["Sentinel"],
  villains: ["Radiation"],

   S01M09
  scheme: "Secret Invasion of the Skrull Shapeshifters",
  mastermind: "Loki",
  henchmen: ["Sentinel"],
  villains: ["Skrulls"],
  heroes: [ "Black Widow", "Deadpool", "Iron Man", "Spider-Man", "Thor" ],
*/
  scheme: "Midtown Bank Robbery",
  mastermind: [ "Magneto" ],
  henchmen: ["Sentinel"],
  villains: ["Skrulls"],
  heroes: [ "Black Widow", "Deadpool", "Wolverine" ],
  bystanders: ["Legendary"],
  withOfficers: true,
  withSpecialOfficers: true,
  withSidekicks: true,
  withSpecialSidekicks: true,
  withWounds: true,
  withMadame: true,
  withNewRecruits: true,
  withBindings: true,
  handType: 'SHIELD',
  cityType: 'VILLAIN',
  withShards: true,
  numPlayers: 1,
};
const undoLog: UndoLog = {
  actions: [],
  pos: 0,
  gameSetup: exampleGameSetup,
  init: function (this: UndoLog, gameSetup?: Setup) {
    this.pos = 0;
    if (gameSetup) {
      this.actions = [];
      this.gameSetup = gameSetup;
      localStorage.setItem('legendarySetup', JSON.stringify(gameSetup));
    } else {
      this.fromString(localStorage.getItem('legendaryLog'));
      this.gameSetup = JSON.parse(localStorage.getItem('legendarySetup'));
    }
  },
  get replaying() { return this.pos < this.actions.length; },
  read: function(this: UndoLog) { return this.actions[this.pos++]; },
  readInt: function(this: UndoLog) { return parseInt(this.read()); },
  readInts: function(this: UndoLog) {
    const v = this.read();
    return v.length ? v.split(',').map(v => parseInt(v)) : [];
  },
  write: function(this: UndoLog, v) {
    const strValue = v.toString();
    this.actions[this.pos++] = strValue;
    localStorage.setItem('legendaryLog', this.toString());
  },
  undo: function(this: UndoLog) { this.actions.pop(); this.pos = 0; },
  restart: function (this: UndoLog) { this.actions.splice(1); this.pos = 0; },
  newGame: function (this: UndoLog) { this.actions = []; this.pos = 0; },
  toString: function (this: UndoLog) {
    return this.actions.map(v => v.length === 1 ? v : `[${v}]`).join('');
  },
  fromString: function (this: UndoLog, input) {
    this.actions = [];
    if (input)
      this.actions = input.match(/\[.*?\]|./g).map(s => s.replace(/[\[\]]/g,''));
  },
};
const textLog = {
  text: "",
  log: function(s: string): void { this.text += s + '<br>'; },
};

interface Setup {
  numPlayers: number,
  scheme: string,
  mastermind: string[]
  henchmen: string[]
  villains: string[]
  heroes: string[]
  bystanders: string[]
  withOfficers: boolean
  withSidekicks: boolean
  withSpecialSidekicks: boolean;
  withSpecialOfficers: boolean;
  withWounds: boolean
  withNewRecruits: boolean
  withMadame: boolean
  withBindings: boolean
  handType: 'SHIELD' | 'HYDRA'
  cityType: 'VILLAIN' | 'HERO'
  withShards: boolean
}
function extraHeroName(n: number = 1) {
  const h = gameState.gameSetup.heroes;
  return h[h.length - n];
}
function extraHenchmenName(n: number = 1) {
  const h = gameState.gameSetup.henchmen;
  return h[h.length - n];
}
function getParam(name: Exclude<keyof SetupParams, 'required' | 'vd_henchmen_counts'>, s: Card = gameState.scheme.top, numPlayers: number = gameState.players.length): number {
  let defaults: SetupParams = {
    vd_villain: [ 1, 2, 3, 3, 4 ],
    vd_bystanders: [ 1, 2, 8, 8, 12 ],
    heroes: [ 3, 5, 5, 5, 6 ],
    wounds: 30,
    bindings: 30,
    shards: 60,
    extra_masterminds: 0,
  };
  let r = name in s.params ? s.params[name] : defaults[name];
  return r instanceof Array ? r[numPlayers - 1] : r;
}
function getHenchmenCounts(s: Card = gameState.scheme.top, numPlayers: number = gameState.players.length) {
  return (s.params.vd_henchmen_counts || [[3], [10], [10], [10, 10], [10, 10]])[numPlayers - 1]
}
function getGameSetup(schemeName: string, mastermindName: string, numPlayers: number = 1): Setup {
  let scheme = findSchemeTemplate(schemeName);
  let mastermind = findMastermindTemplate(mastermindName);
  let setup: Setup = {
    numPlayers,
    scheme: schemeName,
    mastermind: [],
    henchmen: [],
    villains: [],
    heroes: [],
    bystanders: undefined,
    withOfficers: undefined,
    withSidekicks: undefined,
    withSpecialOfficers: undefined,
    withSpecialSidekicks: undefined,
    withWounds: undefined,
    withNewRecruits: undefined,
    withMadame: undefined,
    withBindings: undefined,
    withShards: undefined,
    handType: 'SHIELD',
    cityType: 'VILLAIN',
  };
  function setRequired(t: "henchmen" | "villains" | "heroes", names: string | string[]) {
    const a = setup[t];
    for(let name of names instanceof Array ? names : [names]) {
      if (!a.includes(name)) {
        const pos = a.findIndex(v => v === undefined);
        if (pos >= 0) a[pos] = name;
      }
    }
  }
  setup.heroes = Array(getParam('heroes', scheme, numPlayers)).fill(undefined);
  setup.villains = Array(getParam('vd_villain', scheme, numPlayers)).fill(undefined);
  setup.henchmen = Array(getHenchmenCounts(scheme, numPlayers).length).fill(undefined);
  setup.mastermind = Array(1 + getParam('extra_masterminds', scheme, numPlayers)).fill(undefined);
  if (numPlayers > 1) {
    const leads = mastermind.leads;
    if (findVillainTemplate(leads)) setRequired('villains', leads);
    if (findHenchmanTemplate(leads)) setRequired('henchmen', leads);
  }
  const schemeReq = scheme.params.required;
  if (schemeReq) {
    if (schemeReq.heroes) setRequired('heroes', schemeReq.heroes);
    if (schemeReq.villains) setRequired('villains', schemeReq.villains);
    if (schemeReq.henchmen) setRequired('henchmen', schemeReq.henchmen);
  }
  return setup;
}
// State init
function initGameState(gameSetup: Setup) {
Deck.deckList = [];
textLog.text = "";
eventQueue = [];
eventQueueNew = [];
turnState = undefined;
playerState = {
  nr: 0,
  name: "Player 1",
  deck: new Deck('DECK0'),
  discard: new Deck('DISCARD0', true),
  hand: new Deck('HAND0', true),
  victory: new Deck('VICTORY0', true),
  playArea: new Deck('PLAYAREA0', true),
  teleported: new Deck('TELEPORT0', true),
  artifact: new Deck('ARTIFACT0', true),
  shard: new Deck('SHARD0', true),
  outOfTime: new Deck('OUTOFTIME0', true),
  left: undefined,
  right: undefined,
};
playerState.deck.owner = playerState.discard.owner = playerState.hand.owner = playerState.victory.owner = playerState;
playerState.playArea.owner = playerState;
playerState.artifact.owner = playerState.shard.owner = playerState.teleported.owner = playerState;
playerState.outOfTime.owner = playerState;
playerState.left = playerState.right = playerState;
gameState = {
  nextId: 0,
  twistCount: 0,
  gameRand: undefined,
  escaped: new Deck('ESCAPED', true),
  villaindeck: new Deck('VILLAIN'),
  mastermind: new Deck('MASTERMIND', true),
  ko: new Deck('KO', true),
  herodeck: new Deck('HERO'),
  officer: new Deck('SHIELDOFFICER', true),
  sidekick: new Deck('SIDEKICK', true),
  madame: new Deck('MADAME', true),
  newRecruit: new Deck('NEWRECRUIT', true),
  wounds: new Deck('WOUNDS', true),
  bindings: new Deck('BINDINGS', true),
  scheme: new Deck('SCHEME', true),
  bystanders: new Deck('BYSTANDERS', true),
  shard: new Deck('SHARD', true),
  trap: new Deck('TRAP', true),
  horror: new Deck('HORROR'),
  transformed: new Deck('TRANSFORMED', true),
  hq: [
    new Deck("HQ1", true),
    new Deck("HQ2", true),
    new Deck("HQ3", true),
    new Deck("HQ4", true),
    new Deck("HQ5", true),
  ],
  city: [
    new Deck("BRIDGE", true),
    new Deck("STREETS", true),
    new Deck("ROOFTOPS", true),
    new Deck("BANK", true),
    new Deck("SEWERS", true),
  ],
  cityEntry: undefined,
  triggers: [
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
      match: ev => isMastermind(ev.what),
      after: ev => fightableCards().has(isMastermind) || gameOverEv(ev, "WIN"),
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
  gameSetup,
  turnNum: 0,
  strikeCount: 0,
  destroyedCitySpaces: [],
  actionFilters: [],
  thronesFavorHolder: undefined,
};
if (undoLog.replaying) {
  gameState.gameRand = new RNG(undoLog.readInt());
} else {
  gameState.gameRand = new RNG();
  undoLog.write(gameState.gameRand.state);
}
if (gameSetup.cityType === 'VILLAIN') gameState.city = gameState.city.reverse();
gameState.cityEntry = gameState.city[4];

for (let i = 0; i < 5; i++) {
  gameState.hq[i].below = gameState.city[i];
  gameState.city[i].above = gameState.hq[i];
  gameState.city[i].isCity = true;
  gameState.hq[i].isHQ = true;
  if (i) gameState.city[i].next = gameState.city[i - 1];
}
makeCityAdjacent(gameState.city);

// Init Scheme
gameState.scheme.addNewCard(findSchemeTemplate(gameSetup.scheme));
if (gameState.scheme.top.triggers)
gameState.triggers = gameState.triggers.concat(gameState.scheme.top.triggers);
// Init starting decks
const handCards = {
  SHIELD: [ shieldAgentTemplate, shieldTrooperTemplate ],
  HYDRA: [ hydraOperativeTemplate, hydraSoldierTemplate ],
}[gameSetup.handType];
gameState.players.forEach(p => {
  p.deck.addNewCard(handCards[0], 8);
  p.deck.addNewCard(handCards[1], 4);
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
// Init auxiliary decks
if (gameSetup.withOfficers) gameState.officer.addNewCard(officerTemplate, 30);
if (gameSetup.withSpecialOfficers) {
  shieldOfficerTemplates.each(([n, c]) => gameState.officer.addNewCard(c, n));
  gameState.officer.faceup = false;
  gameState.officer.shuffle();
}
if (gameSetup.withSidekicks) gameState.sidekick.addNewCard(sidekickTemplate, 15);
if (gameSetup.withSpecialSidekicks) {
  specialSidekickTemplates.each(([n, c]) => gameState.sidekick.addNewCard(c, n));
  gameState.sidekick.faceup = false;
  gameState.sidekick.shuffle();
}
if (gameSetup.withWounds) gameState.wounds.addNewCard(woundTemplate, getParam('wounds'));
if (gameSetup.withMadame) gameState.madame.addNewCard(madameHydraTemplate, 12);
if (gameSetup.withNewRecruits) gameState.newRecruit.addNewCard(newRecruitsTemplate, 15);
if (gameSetup.withBindings) gameState.bindings.addNewCard(bindingsTemplate, getParam('bindings'));
if (gameSetup.withShards) gameState.shard.addNewCard(shardTemplate, getParam('shards'));
gameSetup.bystanders.map(findBystanderTemplate).forEach(t => t.cards.forEach(c => gameState.bystanders.addNewCard(c[1], c[0])));
if (gameSetup.bystanders.has(b => b !== 'Legendary')) {
  gameState.bystanders.faceup = false;
  gameState.bystanders.shuffle();
}
// Init villain deck
function getHenchmenTemplates(template: Card | { cards: [number, Card][]}, groupNr: number): Card[] {
  const count = getHenchmenCounts()[groupNr];
  if (template instanceof Card) return Array(count).fill(template);
  const cards = template.cards.map(([n, c]) => Array(n).fill(c)).merge();
  if (count === cards.length) return cards;
  return cards.shuffled().slice(0, count);
}
gameSetup.henchmen.map(findHenchmanTemplate).forEach((h, i) => getHenchmenTemplates(h, i).forEach(c => gameState.villaindeck.addNewCard(c)));
gameSetup.villains.map(findVillainTemplate).forEach(v => v.cards.forEach(c => gameState.villaindeck.addNewCard(c[1], c[0])));
gameState.villaindeck.addNewCard(strikeTemplate, gameState.players.length === 1 && !gameState.advancedSolo ? 1 : 5);
gameState.villaindeck.addNewCard(twistTemplate, getParam('twists'));
for (let i = 0; i < getParam('vd_bystanders'); i++)
  moveCard(gameState.bystanders.top, gameState.villaindeck);
gameState.villaindeck.shuffle();
// Init Mastermind
gameSetup.mastermind.forEach((m, i) => {
  let mastermind = gameState.mastermind.addNewCard(findMastermindTemplate(m));
  let tactics = mastermind.attachedDeck('TACTICS');
  mastermind.tacticsTemplates.forEach(function (c) { tactics.addNewCard(c); });
  tactics.shuffle();
  tactics.each(t => t.mastermind = mastermind);
    if (i === 0 && gameState.players.size === 1 &&
      !gameSetup.villains.includes(mastermind.leads) &&
      !gameSetup.henchmen.includes(mastermind.leads)) mastermind.leads = gameSetup.villains[0];
});
if (gameState.mastermind.top.init) gameState.mastermind.top.init(gameState.mastermind.top);
if (gameState.mastermind.top.isAdaptingMastermind) adaptMastermind(gameState.mastermind.top);
if (gameState.scheme.top.init) gameState.scheme.top.init(gameState.schemeState);
// Draw initial hands
for (let i = 0; i < gameState.endDrawAmount; i++) gameState.players.forEach(p => moveCard(p.deck.top, p.hand));
// Populate HQ
gameState.hq.forEach(x => moveCard(gameState.herodeck.top, x));
Ev.nextId = new Map();
}

// Card effects functions
function isWound(c: Card): boolean { return c.cardType === "WOUND"; }
function isHero(c: Card): boolean { return getModifiedStat(c, 'isHero', c.cardType === "HERO" || (c.gainable && owner(c) !== undefined && !c.isArtifact)); }
function isNonGrayHero(c: Card) { return isHero(c) && !isColor(Color.GRAY)(c); }
function isVillain(c: Card): boolean { return getModifiedStat(c, 'isVillain', c.cardType === "VILLAIN" && (!c.gainable || !owner(c))); }
function isMastermind(c: Card): boolean { return c.cardType === "MASTERMIND" || c.location === gameState.mastermind; }
function isTactic(c: Card): boolean { return getModifiedStat(c, 'isTactic', c.cardType === "TACTICS"); }
function finalTactic(c: Card): boolean { return c.mastermind.attached("TACTICS").size === 0; }
function isStrike(c: Card): boolean { return c.cardType === "MASTER STRIKE"; }
function isTwist(c: Card): boolean { return c.cardType === "SCHEME TWIST"; }
function isScheme(c: Card): boolean { return c.cardType === "SCHEME"; }
function isHenchman(c: Card): boolean { return c.isHenchman === true; }
function isEnemy(c: Card): boolean { return isVillain(c) || isMastermind(c); }
function isBystander(c: Card): boolean { return c.cardType === "BYSTANDER" && (!c.gainable || !owner(c)); }
function isHealable(c: Card): boolean { return c.isHealable(); }
function isColor(col: number): (c: Card) => boolean { return function (c) { return c.isColor(col); }; }
function isTeam(team: Affiliation): (c: Card) => boolean { return function (c) { return c.isTeam(team); }; }
function isGroup(group: string): (c: Card) => boolean { return c => c.isGroup(group); }
function isBindings(c: Card): boolean { return c.cardType === "BINDINGS"; }
function isArtifact(c: Card): boolean { return getModifiedStat(c, 'isArtifact', c.isArtifact); }
function hasRecruitIcon(c: Card) { return c.printedRecruit !== undefined; }
function hasAttackIcon(c: Card) { return c.printedAttack !== undefined; }
function hasFlag(flag: 'N' | 'D' | 'G' | 'F' | 'T') { return (c: Card) => c.flags && c.flags.includes(flag); }
function isShieldOrHydra(c: Card) { return isTeam("S.H.I.E.L.D.")(c) || isTeam("HYDRA")(c); }
function isCostOdd(c: Card) { return c.cost % 2 === 1; }
function isTrap(c: Card) { return c.cardType === "TRAP"; }
function isRevelationsLocation(c: Card): boolean { return getModifiedStat(c, 'isLocation', c.cardType === "LOCATION"); }
function isShieldOfficer(c: Card) { return [ c.heroName, c.cardName ].includes('S.H.I.E.L.D. Officer'); }
function isVillainousWeapon(c: Card): boolean { return getModifiedStat(c, 'isVillainousWeapon', c.cardType === "VILLAINOUSWEAPON")}
function getCardActions(c: Card) { return getModifiedStat(c, 'cardActions', c.cardActions || [])}
function isFightable(c: Card): boolean {
  const res = isVillain(c) ?
    c.location.isCity || c.location === gameState.mastermind :
    isMastermind(c) ?
      c.location === gameState.mastermind && c.attachedDeck('TACTICS').size > 0 :
      false;
  return getModifiedStat(c, 'isFightable', res);
}
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
function owner(c: Card): Player {
  return c.location.owner;
}
function owned(p: Player = playerState): Card[] {
  return [
    ...p.hand.deck,
    ...p.discard.deck,
    ...p.deck.deck,
    ...p.victory.deck,
    ...p.teleported.deck,
    ...p.playArea.deck,
  ];
}
function soloVP(): number {
  return gameState.players.sum(currentVP) - gameState.villainsEscaped - 4 * gameState.bystandersCarried - 3 * gameState.twistCount;
}
function currentVP(p?: Player): number {
  return owned(p).sum(c => c.vp || 0);
}
function fightableCards(): Card[] {
  return [...CityCards(), ...hqCards(), gameState.villaindeck.top, ...gameState.mastermind.deck, gameState.bystanders.top].filter(c => c && isFightable(c));
}
function heroBelow(c: Card) {
  return c.location && c.location.above ? c.location.above.limit(isHero) : [];
}
function hqCards(): Card[] { return gameState.hq.map(e => e.top).limit(e => e !== undefined); }
function hqHeroes() { return hqCards().limit(isHero); }
function CityCards(): Card[] { return gameState.city.map(e => e.top).limit(e => e !== undefined); }
function cityAdjacent(l: Deck): Deck[] {
  return [l.adjacentLeft, l.adjacentRight].limit(d => d && d.isCity);
}
function makeCityAdjacent(city: Deck[], s: number = 0, e: number = city.length) {
  for (let i = s; i < e; i++) {
    if (i > s) city[i].adjacentLeft = city[i - 1];
    if (i < e - 1) city[i].adjacentRight = city[i + 1];
  }
}
function destroyCity(space: Deck) {
  gameState.city = gameState.city.filter(d => d !== space);
  gameState.destroyedCitySpaces.push(space);
  gameState.city.forEach(d => {
    if (d.next === space) d.next = space.next;
    if (d.adjacentLeft === space) d.adjacentLeft = space.adjacentLeft;
    if (d.adjacentRight === space) d.adjacentRight = space.adjacentRight;
  });
  gameState.hq.forEach(d => {
    if (d.below === space) d.below = undefined;
  });
  space.isCity = false;
  space.isDestoryed = true;
}
function destroyHQ(space: Deck) {
  gameState.hq = gameState.hq.filter(d => d !== space);
  gameState.city.forEach(d => {
    if (d.above === space) d.above = undefined;
  });
  space.isHQ = false;
}
function HQCardsHighestCost(): Card[] {
  return hqHeroes().highest(c => c.cost);
}
function villains(): Card[] {
  return fightableCards().limit(isVillain);
}
function cityVillains(): Card[] {
  return CityCards().limit(isVillain);
}
function villainIn(...where: CityLocation[]): Card[] {
  return cityVillains().limit(c => where.has(l => l === c.location.id));
}
function withCity(where: CityLocation, f: (d: Deck) => void) {
  gameState.city.limit(e => e.id === where).each(f);
}
function cityLeftmost() {
  return gameState.city.limit(d => d.adjacentLeft === undefined);
}
function withLeftmostCitySpace(ev: Ev, f: (d: Deck) => void) {
  const spaces = cityLeftmost();
  spaces.size === 1 ? cont(ev, () => f(spaces[0])) : selectCardEv(ev, "Choose a leftmost city space", spaces, f);
}
function isCityEmpty(d: Deck) {
  return d.size === 0;
}
function isLocation(where: Deck, ...locations: CityLocation[]) {
  return where ? locations.some(l => where.id === l) : false;
}
function atLocation(what: Card, ...locations: CityLocation[]) {
  return locations.some(l => what.location.id === l);
}
function hasBystander(c: Card): boolean { return c.captured.has(isBystander); }
function eachOtherPlayer<T>(f: (p: Player) => T): T[] { return gameState.players.filter(e => e !== playerState).map(f); }
function eachOtherPlayerVM<T>(f: (p: Player) => T): T[] { return gameState.advancedSolo ? eachPlayer(f) : eachOtherPlayer(f); }
function eachPlayer<T>(f?: (p: Player) => T): T[] { return gameState.players.map(f); } // TODO starting from left
function eachPlayerEv(ev: Ev, f: (p: Ev) => void): void { eachPlayer(p => pushEv(ev, "EFFECT", { who:p, func:f })); }
function revealable(who = playerState) {
  return [...who.hand.deck, ...who.playArea.deck, ...who.artifact.deck];
}
function yourHeroes(who?: Player) { return revealable(who).limit(isHero); }
function numColors(heroes: Card[] = yourHeroes()) {
  const colors = [Color.COVERT, Color.INSTINCT, Color.TECH, Color.RANGED, Color.STRENGTH, Color.GRAY];
  return colors.count(color => heroes.some(hero => hero.isColor(color)));
}
const classes = [Color.COVERT, Color.INSTINCT, Color.TECH, Color.RANGED, Color.STRENGTH];
function numClasses(heroes: Card[] = yourHeroes()) {
  return classes.count(color => heroes.some(hero => hero.isColor(color)));
}
function sharesColor(c1: Card) {
  const colors = [Color.COVERT, Color.INSTINCT, Color.TECH, Color.RANGED, Color.STRENGTH, Color.GRAY];
  return (c2: Card) => colors.has(color => c1.isColor(color) && c2.isColor(color));
}
function numHeroNames(heroes: Card[]) {
  return heroes.limit(isHero).uniqueCount(c => c.heroName || c.cardName);
  // TODO CW
}

function superPower(...f: (number | Affiliation)[]): number {
  if (f.length > 1) return f.count(c => superPower(c) < f.count(e => c === e)) === 0 ? 1 : 0;
  return count(turnState.cardsPlayed, f[0]);
}
function addEndDrawMod(a: number): void { turnState.endDrawMod = (turnState.endDrawMod || 0) + a; }
function setEndDrawAmount(a: number): void { turnState.endDrawAmount = a; }

interface ModifiableStats {
  defense?: number
  vp?: number
  isHero?: boolean
  isVillain?: boolean
  isTactic?: boolean
  villainGroup?: string
  fight?: Handler | Handler[]
  ambush?: Handler | Handler[]
  capturable?: boolean
  rescue?: Handler
  escape?: Handler | Handler[]
  teleport?: boolean
  color?: number
  attack?: number
  isFightable?: boolean
  fightCost?: ActionCost
  recruitCost?: ActionCost
  cost?: number
  wallcrawl?: boolean
  strike?: Handler | Handler[]
  nthCircle?: number
  sizeChanging?: number
  effects?: Handler[]
  chivalrousDuel?: boolean
  isLocation?: boolean
  isVillainousWeapon?: boolean;
  isArtifact?: boolean;
  cardActions?: ((c: Card, ev: Ev) => Ev)[];
  artifactEffects?: ((ev: Ev) => void)[];
  cosmicThreat?: number;
}

function safePlus(a: number, b: number) {
  return a === undefined ? b === undefined ? undefined : b : a + (b || 0);
}
function safeOr(a: number, b: number) {
  return a === undefined ? b === undefined ? undefined : b : a | (b || 0);
}

type NumericStat = 'defense' | 'vp' | 'cost';
type EffectStat = 'fight' | 'ambush' | 'rescue' | 'escape' | 'strike';
type Modifier<T> = {cond: (c: Card) => boolean, func: (c: Card, v?: T) => T};
type Modifiers = {[stat in keyof ModifiableStats]:Modifier<ModifiableStats[stat]>[]};
function addMod<T extends keyof ModifiableStats>(modifiers: Modifiers, stat: T, cond: (c: Card) => boolean, func: (c: Card, v?: ModifiableStats[T]) => ModifiableStats[T]) {
  if (!modifiers[stat]) modifiers[stat] = [];
  (<Modifier<ModifiableStats[T]>[]>(modifiers[stat])).push({ cond, func });
}
function makeModFunc(value: number | ((c: Card) => number)): (c: Card, v?: number) => number {
  if (typeof value === "number") return (c, v) => v + value;
  return (c, v) => v + value(c);
}
function addTurnMod(stat: NumericStat, cond: (c: Card) => boolean, value: number | ((c: Card) => number)) { addMod(turnState.modifiers, stat, cond, makeModFunc(value)); }
function addStatMod(stat: NumericStat, cond: (c: Card) => boolean, value: number | ((c: Card) => number)) { addMod(gameState.modifiers, stat, cond, makeModFunc(value)); }
function addStatSet<T extends keyof ModifiableStats>(stat: T, cond: (c: Card) => boolean, func: (c: Card, v?: ModifiableStats[T]) => ModifiableStats[T]) { addMod(gameState.modifiers, stat, cond, func); }
function addTurnSet<T extends keyof ModifiableStats>(stat: T, cond: (c: Card) => boolean, func: (c: Card, v?: ModifiableStats[T]) => ModifiableStats[T]) { addMod(turnState.modifiers, stat, cond, func); }
function modifyStat<T>(c: Card, modifiers: Modifier<T>[], value: T): T {
  return (modifiers || []).filter(mod => mod.cond(c)).reduce((v, mod) => mod.func(c, v), value);
}
function getModifiedStat<T extends keyof ModifiableStats>(c: Card, stat: T, value: ModifiableStats[T]): ModifiableStats[T] {
  const fortifyModifiers = c.location.attached("FORTIFY").map(c => c.modifiers && c.modifiers[stat]).filter(m => m);
  const locationModifiers = c.location.attached("LOCATION").map(c => c.modifiers && c.modifiers[stat]).filter(m => m);
  for (const mod of fortifyModifiers) value = modifyStat(c, mod, value);
  for (const mod of locationModifiers) value = modifyStat(c, mod, value);
  return modifyStat(c, turnState && turnState.modifiers[stat], modifyStat(c, gameState.modifiers[stat], value));
}
function combineHandlers(prev: Handler | Handler[], h: Handler) {
  if (!prev) return h;
  if (prev instanceof Array) return prev.includes(h) ? prev : [...prev, h];
  return prev === h ? prev : [prev, h];
}
function addHandler(prev: Handler[], h: Handler) {
  return prev ? [...prev, h] : [h];
}
function forbidAction(action: 'FIGHT' | 'RECRUIT' | 'PLAY', limit?: (c: Card) => boolean, forever?: boolean) {
  (forever ? gameState : turnState).actionFilters.push(ev => !(ev.type === action && (!limit || limit(ev.what))));
}
// Game engine functions
function attachedDeck(name: string, where: Deck | Card) {
  if (!where._attached) where._attached = {};
  if (!where._attached[name])
    where._attached[name] = new Deck(where.id + '/' + name);
  where._attached[name].attachedTo = where;
  return where._attached[name];
}
function attachedCards(name: string, where: Deck | Card) {
  if (!where._attached) return [];
  if (!where._attached[name]) return [];
  return where._attached[name].deck;
}
function pushEvents(ev: Ev, withTriggers: boolean = true): void {
  eventQueueNew = eventQueueNew.concat(withTriggers ? addTriggers(ev) : ev);
}
function joinQueue(): void {
  eventQueue = eventQueueNew.concat(eventQueue);
  eventQueueNew = [];
}
function popEvent(): Ev {
  joinQueue();
  return eventQueue.shift() || new Ev(undefined, "TURN", <EvParams>{
    recruit: 0,
    attack: 0,
    piercing: 0,
    recruitSpecial: [],
    attackSpecial: [],
    totalAttach: 0,
    totalRecruit: 0,
    cardsPlayed: [],
    cardsDrawn: 0,
    cardsDiscarded: [],
    pastEvents: [],
    bystandersRescued: 0,
    modifiers: {},
    triggers: [],
    actionFilters: [],
    func: playTurn
  });
}
function uiEvent(): boolean {
  joinQueue();
  return eventQueue[0] && eventQueue[0].ui;
}

interface ActionCost {
  recruit?: number;
  attack?: number;
  either?: number;
  cond?: (c: Card) => boolean;
  piercing?: number;
  recruitBonus?: number;
  attackBonus?: number;
}
function getRecruitCost(c: Card, cond?: (c: Card) => boolean): ActionCost {
  let recruit = c.cost;
  if (isSizeChanged(c)) recruit = Math.max(0, recruit - 2);
  // TODO fix double size changing from champions
  recruit -= uSizeChangingAmount(c);
  const recruitBonus = Math.max(-recruit, 0);
  recruit = Math.max(recruit, 0);
  return getModifiedStat(c, 'recruitCost', { recruit, cond, recruitBonus });
}
function defaultFightCost(c: Card, attack: number): ActionCost {
  const attackBonus = Math.max(-attack, 0);
  attack = Math.max(attack, 0);
  return c.bribe ? { either: attack, cond: c.fightCond, attackBonus } : { attack, cond: c.fightCond, attackBonus };
}
function getFightCost(c: Card): ActionCost {
  let attack = c.defense;
  const costFunc = c.varFightCost || defaultFightCost;
  return getModifiedStat(c, 'fightCost', costFunc(c, attack));
}
function canPayCost(action: Ev) {
  const cost = action.cost;
  if (!cost) return true;
  if (cost.cond && !cost.cond(action.what)) return false;
  let usableRecruit = turnState.recruit;
  let usableAttack = turnState.attack;
  const requiredRecruit = turnState.recruitWithAttack ? 0 : (cost.recruit || 0);
  const requiredAttack = turnState.attackWithRecruit ? 0 : (cost.attack || 0);
  const requiredTotal = (cost.either || 0) + (cost.recruit || 0) + (cost.attack || 0);
  if (action.type === 'RECRUIT')
    usableRecruit += turnState.recruitSpecial.limit(a => a.cond(action.what)).sum(a => a.amount);
  if (action.type === 'FIGHT')
    usableAttack += turnState.attackSpecial.limit(a => a.cond(action.what)).sum(a => a.amount);
  if (action.type === 'FIGHT' && action.what.chivalrousDuel) {
    usableAttack = Math.min(usableAttack, chivalrousMaxAttack());
  }
  if (cost.piercing) { // simplified calculation assumes cost.attack and cost.recruit is zero
    let usablePiercing = turnState.piercing;
    if (turnState.piercingWithAttack) usablePiercing += usableAttack;
    return usablePiercing >= cost.piercing;
  }
  return usableRecruit >= requiredRecruit && usableAttack >= requiredAttack &&
    usableRecruit + usableAttack >= requiredTotal;
}
function payCost(action: Ev, resolve: (r: boolean) => void) {
  function payMin(a: { amount: number }, amount: number) {
    const n = Math.min(a.amount, amount);
    a.amount -= n;
    return n;
  }
  const cost = action.cost;
  if (!cost) return resolve(true);
  if (cost.piercing) {
    // assuming attack and recruit to pay are zero
    let piercingToPay = cost.piercing;
    if (turnState.piercingWithAttack) {
      if (action.type === 'FIGHT') turnState.attackSpecial.limit(a => a.cond(action.what)).each(a => piercingToPay -= payMin(a, attackToPay));
      const attackAmount = Math.min(piercingToPay, turnState.attack);
      turnState.attack -= attackAmount;
      piercingToPay -= attackAmount;
    }
    const piercingAmount = Math.min(piercingToPay, turnState.piercing);
    turnState.piercing -= piercingAmount;
    piercingToPay -= piercingAmount;
    return resolve(piercingToPay === 0);
  }
  cost.recruitBonus && addRecruitEvent(action, cost.recruitBonus);
  cost.attackBonus && addAttackEvent(action, cost.attackBonus);
  let attackToPay = cost.attack || 0;
  let recruitToPay = cost.recruit || 0;
  let eitherToPay = cost.either || 0;
  if (turnState.attackWithRecruit) { eitherToPay += attackToPay;  attackToPay = 0; }
  if (turnState.recruitWithAttack) { eitherToPay += recruitToPay; recruitToPay = 0; }
  if (attackToPay && action.type === 'FIGHT' && action.what.chivalrousDuel) {
    chivalrousSpendEv(action, attackToPay);
  }
  if (action.type === 'FIGHT') turnState.attackSpecial.limit(a => a.cond(action.what)).each(a => {
    attackToPay -= payMin(a, attackToPay);
    eitherToPay -= payMin(a, eitherToPay);
  });
  if (action.type === 'RECRUIT') turnState.recruitSpecial.limit(a => a.cond(action.what)).each(a => {
    recruitToPay -= payMin(a, recruitToPay);
    eitherToPay -= payMin(a, eitherToPay);
  });
  turnState.recruit -= recruitToPay;
  turnState.attack -= attackToPay;
  if (turnState.attack < 0 || turnState.recruit < 0) {
    if (turnState.attack > turnState.recruit) turnState.attack -= eitherToPay; else turnState.recruit -= eitherToPay;
    turnState.attack = Math.max(turnState.attack, 0);
    turnState.recruit = Math.max(turnState.recruit, 0);
    return resolve(false);
  }
  if (!eitherToPay) return resolve(true);
  if (turnState.recruit + turnState.attack < eitherToPay) {
    turnState.attack = turnState.recruit = 0;
    return resolve(false);
  }
  if (!turnState.recruit) { turnState.attack -= eitherToPay; return resolve(true); }
  if (!turnState.attack) { turnState.recruit -= eitherToPay; return resolve(true); }
  const maxAttack = Math.min(eitherToPay, turnState.attack);
  const minAttack = Math.max(eitherToPay - turnState.recruit, 0);
  chooseNumberEv(action, "Spend attack", minAttack, maxAttack, (amount) => {
    turnState.attack -= amount;
    turnState.recruit -= eitherToPay - amount;
    resolve(true);
  });
}
function noOpActionEv(ev: Ev) {
  return new Ev(ev, 'NOOP', { func: () => {}, cost: { cond: () => false }});
}
function recruitCardActionEv(ev: Ev, c: Card) {
  return new Ev(ev, 'RECRUIT', { what: c, func: buyCard, where: c.location, cost: getRecruitCost(c) });
}
function fightActionEv(ev: Ev, what: Card, withViolence?: boolean) {
  const cost = getFightCost(what);
  if (withViolence) cost.attack++;
  return new Ev(ev, 'FIGHT', { what, func: villainFight, cost, failFunc: what.fightFail, withViolence });
}
function fightPiercingActionEv(ev: Ev, what: Card) {
  return new Ev(ev, 'FIGHT', { what, func: villainFight, cost: { piercing: what.vp, cond: c => c.vp > 0 } }); // TODO some fight limitations may apply (for example wound healing)
}
function countPerGame(key: string, c?: Card) {
  if (c) key += '-' + c.id;
  if (!gameState.perGame) return 0;
  return gameState.perGame.get(key) || 0;
}
function incPerGame(key: string, c?: Card) {
  const prev = countPerTurn(key, c);
  if (c) key += '-' + c.id;
  if (!gameState.perGame) gameState.perGame = new Map();
  gameState.perGame.set(key, prev + 1);
  return prev;
}
function countPerTurn(key: string, c?: Card) {
  if (c) key += '-' + c.id;
  if (!turnState.perTurn) return 0;
  return turnState.perTurn.get(key) || 0;
}
function incPerTurn(key: string, c?: Card) {
  const prev = countPerTurn(key, c);
  if (c) key += '-' + c.id;
  if (!turnState.perTurn) turnState.perTurn = new Map();
  turnState.perTurn.set(key, prev + 1);
  return prev;
}
function limitPerTurn(f: (ev: Ev) => boolean, n: number = 1) {
  return turnState.pastEvents.count(f) < n;
}
function pastEvents(t: EvType) {
  return turnState.pastEvents.limit(e => e.type === t);
}
function pastEvWhat(t: EvType) {
  return pastEvents(t).map(e => e.what);
}
function canHeal(c: Card): boolean {
  if (!c.isHealable()) return false;
  return c.healCond ? c.healCond(c) : true;
}
function canPlay(c: Card): boolean {
  if (c.divided) return canPlay(c.divided.left) || canPlay(c.divided.right);
  let type = c.playCostType;
  let val = c.playCost;
  const filter = c.playCostLimit;
  if (type === undefined) return true;
  if (type === "DISCARD" || type === "TOPDECK" || type === "BOTTOMDECK")
    return playerState.hand.count(i => i !== c && (!filter || filter(c))) >= val;
  throw TypeError(`unknown play cost: ${type}`);
}
function healCard(ev: Ev): void {
  pushEv(ev, "EFFECT", { source: ev.what, func: ev.what.heal });
}
function addTurnAction(action: Ev) {
  if (!turnState.turnActions) turnState.turnActions = [];
  turnState.turnActions.push(action);
}
function getActions(ev: Ev): Ev[] {
  let p = playerState.hand.limit(c => (isHero(c) || isArtifact(c)) && canPlay(c)).map(e => (new Ev(ev, "PLAY", { func: playCard, what: e })));
  p = p.concat(playerState.hand.deck.limit(c => c.hasTeleport()).map(e => (new Ev(ev, "TELEPORT", { func: teleportCard, what: e }))));
  p = p.concat(playerState.hand.limit(canHeal).map(e => (new Ev(ev, "HEAL", { func: healCard, what: e }))));
  // TODO any deck with recruitable
  p = p.concat(hqHeroes().map(d => recruitCardActionEv(ev, d)));
  // TODO any deck with fightable
  fightableCards().map(d => {
    p.push(fightActionEv(ev, d));
    if (canFightWithViolence(d)) p.push(fightActionEv(ev, d, true));
    if (turnState.piercing || turnState.piercingWithAttack) p.push(fightPiercingActionEv(ev, d));
  });
  gameState.officer.withTop(c => p.push(recruitCardActionEv(ev, c)));
  gameState.sidekick.withTop(c => p.push(recruitSidekickActionEv(ev, c)));
  gameState.madame.withTop(c => p.push(recruitCardActionEv(ev, c)));
  gameState.newRecruit.withTop(c => p.push(recruitCardActionEv(ev, c)));
  if (gameState.specialActions) p = p.concat(gameState.specialActions(ev));
  if (turnState.turnActions) p = p.concat(turnState.turnActions);
  fightableCards().each(c => getCardActions(c).each(a => p.push(a(c, ev))));
  p.push(useShardActionEv(ev));
  playerState.artifact.each(c => getCardActions(c).each(a => p.push(a(c, ev))));
  playerState.hand.each(c => getCardActions(c).each(a => p.push(a(c, ev))));
  playerState.victory.each(c => getCardActions(c).each(a => p.push(a(c, ev))));
  p = p.filter(canPayCost);
  p = turnState.actionFilters.reduce((p, f) => p.filter(f), p);
  if (gameState.actionFilters) p = gameState.actionFilters.reduce((p, f) => p.filter(f), p);
  p = p.concat(new Ev(ev, "ENDOFTURN", { confirm: p.length > 0, func: ev => ev.parent.endofturn = true }));
  return p;
}

function addAttackEvent(ev: Ev, c: number): void { pushEv(ev, "ADDATTACK", { func: ev => { turnState.attack += ev.amount; turnState.totalAttack += ev.amount; }, amount: c }); }
function addRecruitEvent(ev: Ev, c: number): void { pushEv(ev, "ADDRECRUIT", { func: ev => { turnState.recruit += ev.amount; turnState.totalRecruit += ev.amount; }, amount: c }); }
function addAttackSpecialEv(ev: Ev, cond: (c: Card) => boolean, amount: number) {
  cont(ev, () => {
    turnState.attackSpecial.push({ cond, amount });
    turnState.totalAttack += amount;
  });
}
function addRecruitSpecialEv(ev: Ev, cond: (c: Card) => boolean, amount: number) {
  cont(ev, () => {
    turnState.recruitSpecial.push({ cond, amount });
    turnState.totalRecruit += amount;
  });
}
function doubleRecruitEv(ev: Ev) {
  addRecruitEvent(ev, turnState.recruit);
  turnState.recruitSpecial.each(r => addRecruitSpecialEv(ev, r.cond, r.amount));
}
function doubleAttackEv(ev: Ev) {
  addAttackEvent(ev, turnState.attack);
  turnState.attackSpecial.each(r => addAttackSpecialEv(ev, r.cond, r.amount));
}
function moveCardEv(ev: Ev, what: Card, where: Deck, bottom?: boolean): void {
  if (!what.instance) return;
  pushEv(ev, "MOVECARD", { func: ev => moveCard(ev.what, ev.to, ev.bottom), what: what, to: where, bottom: bottom, from: what.location });
}
function shuffleIntoEv(ev: Ev, what: Card | Deck, where: Deck): void {
  const cards = what instanceof Card ? [ what ] : [ ...what.deck ];
  cont(ev, () => cards.each(c => moveCard(c, where)));
  cont(ev, () => where.shuffle());
}
// Swaps contents of 2 city spaces
function swapCardsEv(ev: Ev, p1: (Card | Deck), p2: (Card | Deck)) {
  cont(ev, () => {
    const where1 = p1 instanceof Deck ? p1 : p1.location;
    const what1 = p1 instanceof Deck ? p1.top : p1;
    const where2 = p2 instanceof Deck ? p2 : p2.location;
    const what2 = p2 instanceof Deck ? p2.top : p2;
    if (what1) moveCard(what1, where2);
    if (what2) moveCard(what2, where1);
  });
}
function swapDecks(d1: Deck, d2: Deck) {
  const tmp = d1.deck;
  d1.deck = d2.deck;
  d2.deck = tmp;
}
function attachCardEv(ev: Ev, what: Card, to: (Card | Deck), name: string) { moveCardEv(ev, what, to.attachedDeck(name)); }
function recruitForFreeEv(ev: Ev, card: Card, who?: Player): void {
  who = who || playerState;
  pushEv(ev, "RECRUIT", { func: buyCard, what: card, where: card.location });
}
function discardEv(ev: Ev, card: Card) { pushEv(ev, "DISCARD", { what: card, who: owner(card), where: card.location, func: ev => (turnState.cardsDiscarded.push(ev.what), moveCardEv(ev, ev.what, ev.who.discard)) }); }
function discardHandEv(ev: Ev, who?: Player) { (who || playerState).hand.each(c => discardEv(ev, c)); }
function discardDeckEv(ev: Ev, who: Player = playerState) { who.deck.each(c => discardEv(ev, c)); }
function drawIfEv(ev: Ev, cond: Filter<Card>, func?: (c?: Card) => void, who?: Player) {
    let c: Card[] = [];
    who = who || playerState;
    revealPlayerDeckEv(ev, 1, cards => c = cards.limit(cond), who);
    cont(ev, () => { c.each(c => { drawCardEv(ev, c, who); func && func(c); }) } );
}
function KOEv(ev: Ev, card: Card): void { pushEv(ev, "KO", { what: card, where: card.location, func: ev => moveCardEv(ev, ev.what, gameState.ko) }); }
function evilWinsEv(ev: Ev, mastermind?: Card | Player): void { gameOverEv(ev, 'LOSS', mastermind); }
function gameOverEv(ev: Ev, result: "WIN" | "LOSS" | "DRAW", mastermind?: Card | Player) {
  const winnerName = mastermind instanceof Card ? mastermind.cardName : mastermind ? `Evil ${mastermind.name}` : "Evil";
  let desc = result === "LOSS" ? `${winnerName} Wins` : result === "WIN" ? "Good Wins" : "Draw between Good and Evil";
  textLog.log("Game Over: " + desc);
  pushEv(ev, "GAMEOVER", { ui: true, result, desc });
}
function schemeProgressEv(ev: Ev, amount: number) {
  cont(ev, () => {
    if (amount < 0) amount = 0;
    gameState.schemeProgress = amount;
    if (getSchemeCountdown() <= 0) evilWinsEv(ev);
  });
}
function getSchemeCountdown() {
  if (gameState.schemeTarget) {
    return gameState.schemeTarget - (gameState.schemeProgress || 0);
  } else {
    return gameState.schemeProgress;
  }
}
function setSchemeTarget(n: number, perPlayer: boolean = false) {
  gameState.schemeTarget = perPlayer ? gameState.players.size * n : n;
}
function _ProgressTrigger(f: Filter<Card>, escaped: boolean, ko: boolean): Trigger {
  return ({
    event: "MOVECARD",
    match: ev => escaped && ev.to === gameState.escaped || ko && ev.to === gameState.ko,
    after: ev => schemeProgressEv(ev, (escaped ? gameState.escaped.count(f) : 0) + (ko ? gameState.ko.count(f) : 0)),
  });
}
function escapeProgressTrigger(f: Filter<Card>) { return _ProgressTrigger(f, true, false); }
function koProgressTrigger(f: Filter<Card>) { return _ProgressTrigger(f, false, true); }
function koOrEscapeProgressTrigger(f: Filter<Card>) { return _ProgressTrigger(f, true, true); }
function runOutProgressTrigger(d: "VILLAIN" | "HERO" | "WOUNDS" | "BINDINGS", useProgress: boolean = true): Trigger {
  return ({
    event: "MOVECARD",
    match: ev => ev.from.id === d || ev.to.id === d,
    after: useProgress ? ev => schemeProgressEv(ev, ev.parent.from.size) : ev => ev.parent.from.size || evilWinsEv(ev),
  })
}
function captureEv(ev: Ev, villain: Card, what: Card | number = 1) {
  if (typeof what !== "number") what && pushEv(ev, "CAPTURE", { func: ev => attachCardEv(ev, ev.what, ev.villain, "CAPTURED"), what: what, villain: villain });
  else for (let i = 0; i < what; i++) cont(ev, () => {
    if (gameState.bystanders.top) pushEv(ev, "CAPTURE", { func: ev => attachCardEv(ev, ev.what, ev.villain, "CAPTURED"), what: gameState.bystanders.top, villain: villain });
  });
}
function gainWoundEv(ev: Ev, who?: Player): void {
  who = who || playerState;
  cont(ev, () => {
    if (gameState.wounds.top) gainEv(ev, gameState.wounds.top, who);
  });
}
function gainBindingsEv(ev: Ev, who: Player = playerState): void {
  cont(ev, () => gameState.bindings.withTop(c => gainEv(ev, c, who)));
}
function gainWoundToHandEv(ev: Ev, who: Player = playerState): void {
  cont(ev, () => gameState.wounds.withTop(c => gainToHandEv(ev, c, who)));
}
function gainWoundToDeckEv(ev: Ev, who: Player = playerState): void {
  cont(ev, () => gameState.wounds.withTop(c => gainToDeckEv(ev, c, who)));
}
function cont(ev: Ev, func: (ev: Ev) => void): void { pushEv(ev, "EFFECT", func); }
function pushEv(ev: Ev, name: EvType, params: EvParams | ((ev: Ev) => void)): Ev { let nev = new Ev(ev, name, params); pushEvents(nev); return nev; }
type Handler = (ev: Ev) => void;
function pushEffects(ev: Ev, c: Card, effectName: EffectStat, effects: Handler | Handler[], params: EvParams = {}) {
  effects = getModifiedStat(c, effectName, effects);
  function f(e: Handler): void {
    let p = { source: c, func: e, effectName };
    if (params) Object.assign(p, params);
    pushEv(ev, "EFFECT", p);
  }
  if (!effects) return;
  confirmEv(ev, `${c.cardName}: ${effectName}!`, c);
  pushEv(ev, 'CARDEFFECT', { effectName, source: c, func: () => {
    if (!(effects instanceof Array)) f(effects); else effects.forEach(f);
  }});
}
function confirmEv(ev: Ev, desc: string, what?: Card) {
  pushEv(ev, "CONFIRM", { desc, what, ui: true });
}
function selectObjectsMinMaxEv<T>(ev: Ev, desc: string, min: number, max: number, objects: T[], effect1: (o: T) => void, effect0?: () => void, simple?: boolean, who: Player = playerState) {
  if (objects.length === 0 || max === 0) {
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
// function selectObjectEv<T>(ev: Ev, desc: string, objects: T[], effect1: (o: T) => void, who?: Player) {
//   selectObjectsMinMaxEv(ev, desc, 1, 1, objects, effect1, undefined, false, who);
// }
// function selectObjectOptEv<T>(ev: Ev, desc: string, objects: T[], effect1: (o: T) => void, who?: Player) {
//   selectObjectsMinMaxEv(ev, desc, 0, 1, objects, effect1, undefined, false, who);
// }

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
function chooseOneEv(ev: Ev, desc: string, ...a: [string, () => void][]): void {
  let options = a.map(o => new Ev(ev, "EFFECT", { func: o[1], desc: o[0] }));
  if (!options.length) return;
  pushEv(ev, "SELECTEVENT", { desc, options, ui: true, agent: playerState });
}
function chooseOptionEv<T>(ev: Ev, desc: string, choices: { l: string, v: T }[], effect: (v: T) => void, agent: Player = playerState) {
  let options = choices.map(o => new Ev(ev, "EFFECT", { func: () => effect(o.v), desc: o.l }));
  if (!options.length) return;
  pushEv(ev, "SELECTEVENT", { desc, options, ui: true, agent });
}
function chooseMayEv(ev: Ev, desc: string, effect: (ev: Ev) => void, agent?: Player) {
  agent = agent || playerState;
  pushEv(ev, "SELECTEVENT", { desc, options: [
      new Ev(ev, "EFFECT", { func: effect, desc: "Yes" }),
      new Ev(ev, "EFFECT", { func: () => {}, desc: "No" }),
  ], ui: true, agent });
}
function chooseCostEv(ev: Ev, effect: (n: number) => void, min: number = 0, agent: Player = playerState) {
  chooseNumberEv(ev, "Choose cost", min, 9, effect, agent);
}
function chooseNumberEv(ev: Ev, desc: string, min: number, max: number, effect: (n: number) => void, agent: Player = playerState) {
  let options: Ev[] = [];
  for (let i = min; i <= max; i++) options.push(new Ev(ev, "EFFECT", { func: () => effect(i), desc: `${i}` }));
  pushEv(ev, "SELECTEVENT", { desc, ui: true, agent, options });
}
function _choosePlayerEv(ev: Ev, effect: (p: Player) => void, list: Player[], agent: Player) {
  pushEv(ev, "SELECTEVENT", { desc: "Choose a player", ui: true, agent, options: list.map(p => new Ev(ev, "EFFECT", {
    func: () => effect(p),
    desc: p.name,
  })) });
}
function choosePlayerEv(ev: Ev, effect: (p: Player) => void, agent: Player = playerState) {
  gameState.players.size === 1 ? cont(ev, () => effect(gameState.players[0])) :
  _choosePlayerEv(ev, effect, gameState.players, agent);
}
function chooseOtherPlayerEv(ev: Ev, effect: (p: Player) => void, agent: Player = playerState) {
  gameState.players.length > 1 && _choosePlayerEv(ev, effect, gameState.players.limit(p => p !== agent), agent);
}
function chooseClassEv(ev: Ev, f: ((color: number) => void), limit?: (color: number) => boolean) {
  chooseOptionEv(ev, "Choose a Hero Class",
    [{l:'Strength', v:Color.STRENGTH},
    {l:'Instinct', v:Color.INSTINCT},
    {l:'Covert', v:Color.COVERT},
    {l:'Tech', v:Color.TECH},
    {l:'Ranged', v:Color.RANGED}].filter(o => !limit || limit(o.v)),
    f
  );
}
function chooseColorEv(ev: Ev, f: ((color: number) => void), limit?: (color: number) => boolean) {
  chooseOptionEv(ev, "Choose a Hero color",
    [{l:'Gray', v:Color.GRAY},
    {l:'Strength', v:Color.STRENGTH},
    {l:'Instinct', v:Color.INSTINCT},
    {l:'Covert', v:Color.COVERT},
    {l:'Tech', v:Color.TECH},
    {l:'Ranged', v:Color.RANGED}].filter(o => !limit || limit(o.v)),
    f
  );
}
function withMastermind(ev: Ev, effect: (m: Card) => void, real: boolean = false) {
  const options = fightableCards().limit(real ? (c => isMastermind(c) && !isVillain(c)) : isMastermind);
  options.size === 1 ? cont(ev, () => effect(options[0])) : selectCardEv(ev, "Choose Mastermind", options, effect);
}
function pickDiscardEv(ev: Ev, n: number = 1, who: Player = playerState, cond: Filter<Card> = undefined) {
  // TODO multiplayer: pickDiscardEv show hand when condition present (and cards.size < n depending on card wording)
  repeat(n < 0 ? who.hand.size + n : n, () => cont(ev, () => selectCardEv(ev, "Choose a card to discard", who.hand.limit(cond), sel => discardEv(ev, sel), who)));
}
function pickTopDeckEv(ev: Ev, n: number = 1, who: Player = playerState, cond: Filter<Card> = undefined, bottom: boolean = false) {
  repeat(n < 0 ? who.hand.size + n : n, () => cont(ev, () => selectCardEv(ev, `Choose a card to put on ${bottom ? "bottom" : "top"} of your deck`, who.hand.limit(cond), sel => moveCardEv(ev, sel, who.deck, bottom), who)));
}
function cleanupRevealed (ev: Ev, src: Card[], dst: Deck, bottom: boolean = false, agent: Player = playerState) {
  if (src.size === 0) return;
  if (src.size === 1) moveCardEv(ev, src[0], dst, bottom);
  else selectCardEv(ev, "Choose a card to put back", src, sel => { moveCardEv(ev, sel, dst, bottom); cleanupRevealed(ev, src, dst, bottom, agent); }, agent);
};
function revealDeckEv(ev: Ev, src: Deck, amount: number | ((c: Card[]) => boolean), action: (c: Card[]) => void, random: boolean = true, bottom: boolean = false, agent: Player = playerState) {
  if (amount === 0) return;
  const cards: Card[] = [];
  cont(ev, () => {
    for(let i = 0; typeof amount === "number" ? i < amount : amount(cards); i++) {
      const c = src.deck[src.deck.size - i - 1];
      if (!c) break;
      cards.push(c);
    }
    src.registerRevealed(cards);
  });
  cont(ev, () => action(cards));
  if (random) cont(ev, () => cards.shuffled().each(c => moveCard(c, src)));
  else cont(ev, () => cleanupRevealed(ev, cards, src, bottom, agent));
  cont(ev, () => src.clearRevealed(cards));
}
function revealVillainDeckEv(ev: Ev, amount: number | ((c: Card[]) => boolean), action: (c: Card[]) => void, random: boolean = true, bottom: boolean = false, agent: Player = playerState) {
  revealDeckEv(ev, gameState.villaindeck, amount, action, random, bottom, agent);
}
function revealHeroDeckEv(ev: Ev, amount: number | ((c: Card[]) => boolean), action: (c: Card[]) => void, random: boolean = true, bottom: boolean = false, agent: Player = playerState) {
  revealDeckEv(ev, gameState.herodeck, amount, action, random, bottom, agent);
}
function revealPlayerDeckEv(ev: Ev, amount: number, action: (cards: Card[]) => void, who?: Player, agent?: Player) {
  lookAtDeckEv(ev, amount, action, who, agent);
}
type RevealThreeAction = 'KO' | 'DISCARD' | 'DRAW';
function revealThreeEv(ev: Ev, a1: RevealThreeAction, a2: RevealThreeAction, a3?: RevealThreeAction, who?: Player) {
  const actions = {
    KO: { desc: "KO", handler: KOEv },
    DISCARD: { desc: "Discard", handler: discardEv },
    DRAW: { desc: "Draw", handler: drawCardEv },
  }
  revealPlayerDeckEv(ev, 3, cards => {
    selectCardEv(ev, `Choose a card to ${actions[a1].desc}`, cards, c1 => {
      actions[a1].handler(ev, c1);
      selectCardEv(ev, `Choose a card to ${actions[a2].desc}`, cards.limit(c => c !== c1), c2 => {
        actions[a2].handler(ev, c2);
        a3 && selectCardEv(ev, `Choose a card to ${actions[a3].desc}`, cards.limit(c => c !== c1 && c !== c2), c3 => {
          actions[a3].handler(ev, c3);
        }, who);
      }, who);
    }, who);
  }, who);
}
function lookAtThreeEv(ev: Ev, a1: RevealThreeAction, a2: RevealThreeAction, a3?: RevealThreeAction, who?: Player) {
  revealThreeEv(ev, a1, a2, a3, who);
}
function revealPlayerDeckTopOrBottomEv(ev: Ev, amount: number, bottom: boolean, action: (cards: Card[]) => void, who?: Player, agent?: Player) {
  who = who || playerState;
  agent = agent || who;
  let cards: Card[] = [];
  if (playerState.deck.size < amount) pushEv(ev, 'RESHUFFLE', reshufflePlayerDeck);
  cont(ev, () => {
    cards = playerState.deck.deck.slice(0, amount);
    playerState.deck.registerRevealed(cards);
  })
  cont(ev, () => action(cards));
  cont(ev, () => cleanupRevealed(ev, cards, who.deck, bottom, agent));
  cont(ev, () => playerState.deck.clearRevealed(cards));
}
function lookAtDeckEv(ev: Ev, amount: number, action: (cards: Card[]) => void, who?: Player, agent?: Player) {
  revealPlayerDeckTopOrBottomEv(ev, amount, false, action, who, agent);
}
function lookAtDeckBottomEv(ev: Ev, amount: number, action: (cards: Card[]) => void, who?: Player, agent?: Player) {
  revealPlayerDeckTopOrBottomEv(ev, amount, true, action, who, agent);
}
function revealPlayerDeckBottomEv(ev: Ev, amount: number, action: (cards: Card[]) => void, who?: Player, agent?: Player) {
  revealPlayerDeckTopOrBottomEv(ev, amount, true, action, who, agent);
}

function cleanupRevealedTopOrBottom(ev: Ev, src: Card[], dst: Deck, agent: Player) {
  if (src.size === 0) return;
  selectCardOptEv(ev, "Choose a card to put back on the bottom", src,
    sel => { moveCardEv(ev, sel, dst, true); cleanupRevealedTopOrBottom(ev, src, dst, agent); },
    () => cleanupRevealed(ev, src, dst, false, agent), agent);
};
function investigateEv(ev: Ev, f: Filter<Card>, src: Deck = playerState.deck, action: (c: Card) => void = c => drawCardEv(ev, c), agent: Player = playerState, reveal: boolean = false) {
  let cards: Card[] = [];
  const amount = turnState.investigateAmount || 2;
  if (src === playerState.deck && playerState.deck.size < amount) pushEv(ev, 'RESHUFFLE', reshufflePlayerDeck);
  cont(ev, () => {
    cards = src.deck.slice(0, amount);
    src.registerRevealed(cards);
  })
  cont(ev, () => selectCardEv(ev, "Choose a card", cards.limit(f), action, agent));
  cont(ev, () => cleanupRevealedTopOrBottom(ev, cards, src, agent));
  cont(ev, () => src.clearRevealed(cards));
}
function isFaceUp(c: Card) {
  const d = c.location;
  if (!d || d.faceup) return true;
  if (d.revealedCards && d.revealedCards.some(cards => cards.includes(c))) return true;
  return false;
}
function KOHandOrDiscardEv(ev: Ev, filter?: Filter<Card>, func?: (c: Card) => void) {
  let cards = handOrDiscard();
  if (filter) cards = cards.limit(filter);
  selectCardOptEv(ev, "Choose a card to KO", cards, sel => { KOEv(ev, sel); func && cont(ev, () => func(sel)); });
}

function isCopy(c: Card) {
  return !c.instance || Object.getPrototypeOf(c) !== c.instance; // TODO could be also transformed or dual
}
function returnToStackEv(ev: Ev, deck: Deck) {
  const c = ev.source;
  // Cannot return copies or copyPaste cards
  if (isCopy(c)) return false;
  moveCardEv(ev, c, deck, true);
  return true;
}
function playCopyEv(ev: Ev, what: Card) {
  pushEv(ev, "PLAY", { func: playCard, what: makeCardCopy(what) });
}
function playCardEffects(ev: Ev, card: Card) {
  if (card.attack) addAttackEvent(ev, card.attack);
  if (card.recruit) addRecruitEvent(ev, card.recruit);
  const effects = getModifiedStat(card, "effects", card.effects);
  for (let i = 0; effects && i < effects.length; i++) {
    pushEv(ev, "EFFECT",  { source: card, func: effects[i] } );
  }
}
function playCard2(ev: Ev) {
  const card = ev.what;
  pushEv(ev, "PLAYCARDEFFECTS", { source: card, func: ev => {
    if (card.playCostType === "DISCARD") pickDiscardEv(ev, card.playCost, playerState, card.playCostLimit);
    if (card.playCostType === "TOPDECK") pickTopDeckEv(ev, card.playCost, playerState, card.playCostLimit);
    if (card.playCostType === "BOTTOMDECK") pickTopDeckEv(ev, card.playCost, playerState, card.playCostLimit, true);
    playCardEffects(ev, card);
    cont(ev, () => turnState.cardsPlayed.push(card));
  }});
}
function playCard1(ev: Ev) {
  const d = ev.what.divided;
  if (d) {
    const playBoth = turnState.playDividedBoth;
    chooseOptionEv(ev, "Choose side to play", [{l:d.left.cardName, v:false}, {l:d.right.cardName, v:true}], v => {
      if (canPlay(ev.what)) {
        makeCardDividedChoice(ev.what, v);
        playCard2(ev);
      }
      if (playBoth) {
        playCopyEv(ev, v ? ev.what.divided.left : ev.what.divided.right);
      }
    });
  } else playCard2(ev);
}
function playCard(ev: Ev): void {
  if (!canPlay(ev.what)) return;
  moveCardEv(ev, ev.what, playerState.playArea);
  if (ev.what.copyPasteCard) {
    selectCardEv(ev, "Choose a card to copy", turnState.cardsPlayed, target => {
      makeCardCopyPaste(target, ev.what);
      if (canPlay(ev.what)) playCard1(ev);
    });
  } else {
    playCard1(ev);
  }
}
function buyCard(ev: Ev): void {
  textLog.log(`Recruited ${ev.what.cardName || ev.what.id}`);
  let where = turnState.nextHeroRecruit;
  ev.what.whenRecruited && ev.what.whenRecruited(ev);
  turnState.nextHeroRecruit = undefined;
  if (where === "HAND") gainToHandEv(ev, ev.what);
  else if (where === "DECK") gainToDeckEv(ev, ev.what);
  else if (where === "SOARING" || ev.what.soaring) gainSoaringEv(ev, ev.what);
  else if (ev.what.hasWallCrawl()) gainToDeckEv(ev, ev.what);
  else gainEv(ev, ev.what);
}
function gainEv(ev: Ev, card: Card, who?: Player) {
  who = who || playerState;
  pushEv(ev, "GAIN", { func: ev => moveCardEv(ev, ev.what, ev.where), what: card, who, where: who.discard });
}
function gainToHandEv(ev: Ev, card: Card, who?: Player) {
  who = who || playerState;
  pushEv(ev, "GAIN", { func: ev => moveCardEv(ev, ev.what, ev.where), what: card, who, where: who.hand });;
}
function gainToDeckEv(ev: Ev, card: Card, who?: Player) {
  who = who || playerState;
  pushEv(ev, "GAIN", { func: ev => moveCardEv(ev, ev.what, ev.where), what: card, who, where: who.deck });;
}
function gainSoaringEv(ev: Ev, card: Card, who?: Player) {
  who = who || playerState;
  pushEv(ev, "GAIN", { func: ev => moveCardEv(ev, ev.what, ev.where), what: card, who, where: who.teleported });;
}
function gainOutOfTimeEv(ev: Ev, card: Card, who?: Player) {
  who = who || playerState;
  pushEv(ev, "GAIN", { func: ev => moveCardEv(ev, ev.what, ev.where), what: card, who, where: who.outOfTime });;
}
function cleanUp(ev: Ev): void {
  moveAll(playerState.hand, playerState.discard);
  moveAll(playerState.playArea, playerState.discard);
  moveAll(playerState.teleported, playerState.hand);
  let drawAmount = (turnState.endDrawAmount || gameState.endDrawAmount) + (turnState.endDrawMod || 0);
  drawEv(ev, drawAmount);
}
function drawCardEv(ev: Ev, what: Card, who: Player = playerState) {
  pushEv(ev, "DRAW", { func: ev => {
    turnState.cardsDrawn++;
    moveCardEv(ev, ev.what, ev.who.hand);
  }, what, who });
}
function drawEv(ev: Ev, amount: number = 1, who: Player = playerState) {
  if (amount > 0) pushEv(ev, "DRAWCARDS", { who, amount, func: ev => {
    for (let i = 0; i < ev.amount; i++)
      pushEv(ev, "DRAW", { func: drawOne, who: ev.who });
  }});
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
  for(const c of playerState.discard.deck.shuffled()) moveCard(c, playerState.deck, true);
}
function playTwistEv(ev: Ev, what: Card) { pushEv(ev, "TWIST", { func: playTwist, what: what }); }
function playTwist(ev: Ev): void {
  moveCardEv(ev, ev.what, gameState.ko);
  confirmEv(ev, 'Scheme Twist!', gameState.scheme.top);
  let e = pushEv(ev, "EFFECT", { source: gameState.scheme.top, func: gameState.scheme.top.twist, nr: ++gameState.twistCount, twist: ev.what, state: gameState.schemeState });
  cont(ev, () => {
    if (gameState.players.length === 1) {
      if (gameState.advancedSolo) selectCardEv(ev, "Choose a card to put on the bottom of the Hero deck", hqHeroes().limit(c => c.cost <= 6), sel => moveCardEv(ev, sel, gameState.herodeck, true));
      else selectCardAndKOEv(ev, hqHeroes().limit(c => c.cost <= 6));
    }
    if (e.another) villainDrawEv(e);
  });
}
function playStrikeEv(ev: Ev, what: Card) { pushEv(ev, "STRIKE", { func: playStrike, what: what }); }
function playStrike(ev: Ev) {
  moveCardEv(ev, ev.what, gameState.ko);
  // TODO mastermind order
  const nr = ++gameState.strikeCount;
  fightableCards().limit(isMastermind).each(m => {
    pushEffects(ev, m, "strike", m.strike, { what: ev.what, nr });
    m.isAdaptingMastermind && adaptMastermindEv(ev, m);
  });
  if (gameState.advancedSolo) villainDrawEv(ev);
}
function playLocationEv(ev: Ev, what: Card) { pushEv(ev, "EFFECT", { what, func: ev => {
  // TODO Locations
  // check if space in the city
  // if not ko the cheapest
  // attach
  // * add locations to fightable
} }); }

function playVillainousWeapon(ev: Ev, what: Card) {
  function putIntoCity() {
    let i = gameState.cityEntry;
    while (i && !i.has(isVillain)) i = i.next;
    if (i) {
      attachCardEv(ev, what, i, 'WEAPON');
    } else {
      KOEv(ev, what);
    }
  }
  if (what.ambush) {
    pushEffects(ev, what, 'ambush', what.ambush);
    cont(ev, () => what.location.attachedTo instanceof Card || putIntoCity());
  } else {
    putIntoCity();
  }
}
function adaptMastermind(mastermind: Card) {
  const tactics = mastermind.attachedDeck("TACTICS");
  const mastermindLocation = mastermind.location;
  if (!tactics.size) {
    mastermind.location.remove(mastermind);
    return;
  }
  const mastermindPos = mastermindLocation.deck.indexOf(mastermind);
  tactics.shuffle();
  const newMastermind = makeCardCopy(tactics.top);
  newMastermind._attached = mastermind._attached;
  newMastermind.location = mastermindLocation;
  mastermindLocation.deck[mastermindPos] = newMastermind;
}
function adaptMastermindEv(ev: Ev, what: Card) { pushEv(ev, "EFFECT", { func: () => adaptMastermind(what) }); }

function villainDrawEv(ev: Ev, what?: Card): void { pushEv(ev, "VILLAINDRAW", { func: villainDraw, what }); }
function villainDraw(ev: Ev): void {
  let c = ev.what || gameState.villaindeck.top;
  if (!c) return; // Villain decks runs out
  textLog.log(ev.what ? `Playing villain card: ${c.cardName || c.id}` : `Drawn from villain deck: ${c.cardName || c.id}`);
  ev.what = c;
  if (!c) {
  } else if (isVillain(c)) {
    moveCardEv(ev, c, gameState.cityEntry);
    pushEffects(ev, c, 'ambush', c.ambush);
  } else if (isRevelationsLocation(c)) {
    playLocationEv(ev, c);
  } else if (isVillainousWeapon(c)) {
    playVillainousWeapon(ev, c)
  } else if (c.cardType === "MASTER STRIKE") {
    playStrikeEv(ev, c);
  } else if (c.cardType === "SCHEME TWIST") {
    playTwistEv(ev, c);
  } else if (c.cardType === "BYSTANDER" || c.cardType === "HERO") { // only X-Cutioner's Song puts non villain heroes in the Villain Deck
    let i = gameState.cityEntry;
    while (i && !i.has(isVillain)) i = i.next;
    if (i) {
      captureEv(ev, i.top, c);
    } else if (fightableCards().has(isMastermind)) {
      withMastermind(ev, m => captureEv(ev, m, c));
    } else { // no mastermind?
      moveCardEv(ev, c, gameState.ko);
    }
  } else {
    throw Error("dont know what to do with: " + c.id);
  }
}
function enterCityEv(ev: Ev, c: Card, d?: Deck | undefined, extraEffects?: () => void) {
  moveCardEv(ev, c, d || gameState.cityEntry);
  extraEffects?.();
  pushEffects(ev, c, 'ambush', c.ambush);
}
function villainEscapeEv(ev: Ev, what: Card) { pushEv(ev, "ESCAPE", { what, func: villainEscape }); }
function villainEscape(ev: Ev): void {
  let c = ev.what;
  let b = c.captured;
  gameState.villainsEscaped++;
  // Handle GotG shards
  c.attached('SHARD').withFirst(c => withMastermind(ev, m => attachShardEv(ev, m, c)));
  cont(ev, () => c.attached('SHARD').each(c => moveCardEv(ev, c, gameState.shard)));
  c.attached('WEAPON').each(c => withMastermind(ev, m => attachCardEv(ev, c, m, 'WEAPON')));
  b.each(function (bc) { moveCardEv(ev, bc, gameState.escaped); });
  gameState.bystandersCarried += b.count(isBystander);
  if (b.has(isBystander)) eachPlayer(p => pickDiscardEv(ev, 1, p));
  moveCardEv(ev, c, gameState.escaped);
  selectCardAndKOEv(ev, hqHeroes().limit(c => c.cost <= 6));
  pushEffects(ev, c, "escape", c.escape);
}
function villainFight(ev: Ev): void {
  const c = ev.what;
  textLog.log(`Fought ${c.cardName || c.id}`);
  if (c.fightCost) cont(ev, c.fightCost);
  defeatEv(ev, c);
  if (ev.withViolence) playViolenceEv(ev);
}
function defeatEv(ev: Ev, c: Card) {
  pushEv(ev, "DEFEAT", { func: villainDefeat, what: c, where: c.location });
}
function villainDefeat(ev: Ev): void {
  let c = ev.what;
  let b = c.captured;
  c.attached("TACTICS").withLast(t => c = t);
  // TODO according to https://boardgamegeek.com/article/19007319#19007319 defeat triggers would happen here
  // TODO choose move order
  // TODO all the move effects should happen first
  // Handle GotG shards
  ev.what.attached('SHARD').withFirst(c => gainShardEv(ev, c));
  cont(ev, () => ev.what.attached('SHARD').each(c => moveCardEv(ev, c, gameState.shard)));
  ev.what.attached('WEAPON').each(c => gainEv(ev, c));
  b.each(bc => rescueEv(ev, bc));
  // TODO fight effect should be first
  moveCardEv(ev, c, playerState.victory);
  pushEffects(ev, c, "fight", c.fight, { where: ev.where });
  if (ev.what.isAdaptingMastermind) adaptMastermindEv(ev, ev.what);
}
function rescueByEv(ev: Ev, who: Player, what: Card | number = 1): void {
  if (typeof what !== "number") what && pushEv(ev, "RESCUE", { func: rescueBystander, what, who });
  else for (let i = 0; i < what; i++) cont(ev, () => {
    if (gameState.bystanders.top) pushEv(ev, "RESCUE", { func: rescueBystander, what: gameState.bystanders.top, who });
  });
}
function rescueEv(ev: Ev, what?: Card | number): void {
  rescueByEv(ev, playerState, what);
}
function rescueBystander(ev: Ev): void {
  let c = ev.what;
  if (isBystander(c)) turnState.bystandersRescued++;
  moveCardEv(ev, c, playerState.victory);
  const rescue = getModifiedStat(c, 'rescue', c.rescue);
  if (rescue) pushEv(ev, "EFFECT", { source: c, func: rescue, who: ev.who });
}
function addTurnTrigger(type: TriggerableEvType, match: (ev: Ev, source: Card) => boolean, f: { replace?: Handler, before?: Handler, after?: Handler } | ((ev: Ev) => void)) {
  const trigger: Trigger = typeof f === "function" ? { event: type, match, after: f } : { event: type, match, ...f };
  turnState.triggers.push(trigger);
}
function findTriggers(ev: Ev): {trigger: Trigger, source: Card|Ev, state?: object}[] {
  let triggers:{trigger: Trigger, source: Card|Ev}[] = [];
  let checkTrigger = (source?: Card) => (t: Trigger) => {
    if(t.event === ev.type && (!t.match || t.match(ev, source))) triggers.push({trigger:t, source:source});
  };
  let checkCardTrigger = (c: Card) => {
    if (c.trigger) checkTrigger(c)(c.trigger);
    if (c.triggers) c.triggers.forEach(t => checkTrigger(c)(t))
  };
  gameState.triggers.forEach(checkTrigger());
  turnState.triggers.forEach(checkTrigger());
  gameState.mastermind.each(checkCardTrigger);
  CityCards().each(checkCardTrigger);
  hqCards().each(checkCardTrigger);
  // TODO check other active locations (villain/hero deck top for example)
  gameState.players.each(p => {
    p.artifact.each(checkCardTrigger);
    p.hand.each(checkCardTrigger);
    p.playArea.each(checkCardTrigger);
    p.victory.each(checkCardTrigger);
  });
  return triggers;
}
function addTriggers(ev: Ev): Ev[] {
  // TODO: more dynamic events (add generic { type:"TRIGGER", what:ev.type, when:"BEFORE" }), harder for replacement and steteful before/after triggers - not sure what I meant here anymore
  // TODO: order triggers
  let triggers = findTriggers(ev);
  let newev: Ev[] = [];
  triggers.forEach(function(t) {
    if (t.trigger.before) {
      let state = t.trigger.after ? <object>{} : undefined;
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
      newev = [ new Ev(ev, "EFFECT", { func:t.trigger.replace, replacing: newev, source:t.source })];
  });
  return newev;
}
function doReplacing(ev: Ev) {
  ev.replacing.each(e => pushEvents(e, false));
}
function playTurn(ev: Turn) {
  gameState.turnNum++;
  textLog.log(`>>>> Turn ${gameState.turnNum}`);
  turnState = ev;
  pushEv(ev, "TURNSTART", () => {});
  villainDrawEv(ev);
  playOutOfTimeEv(ev);
  pushEv(ev, "ACTIONS", ev => {
    if (!ev.endofturn) {
      pushEv(ev, "SELECTEVENT", { desc: "Play card or action", options: getActions(ev), ui: true });
      pushEvents(ev);
    } else {
      pushEv(ev, "CLEANUP", cleanUp);
    }
  });
}


function getDisplayInfo() {
  return ({
    attack: turnState.attack,
    attackSpecial: turnState.attackSpecial.sum(c => c.amount),
    recruit: turnState.recruit,
    recruitSpecial: turnState.recruitSpecial.sum(c => c.amount),
    shard: playerState.shard.size,
    soloVP: soloVP(),
  });
}

// Main loop
function getEventName(ev: Ev): string {
  if (ev.type === "ENDOFTURN") return "End Turn";
  if (ev.desc) return ev.desc;
  if (ev.what) return `${ev.type} ${ev.what.cardName}`;
  return ev.type;
}
let clickActions: {[id: string]:(() => void)} = {};
function clickCard(ev: MouseEvent): void {
  for (let node = <Element>ev.target; node; node = <Element>node.parentNode) {
    const id = node.id || (node.getAttribute && node.getAttribute('data-id'));
    const deckId = node.getAttribute && node.getAttribute('data-deck-id');
    console.log(id, node);
    if (id && clickActions[id]) {
      clickActions[id]();
      return;
    }
    if (clickActions[deckId]) {
      clickActions[deckId]();
      return;
    }
  }
}
function playEvent(ev: Ev) {
  ev.setId();
  if(!undoLog.replaying) console.log(ev.toString());
  payCost(ev, res => {
    res && ev.func(ev);
    !res && ev.failFunc && ev.failFunc(ev);
    turnState.pastEvents.push(ev);
  });
}
function mainLoop(): void {
  let extraActions: { name: string, confirm?: boolean, func: () => void }[] = [];
  clickActions = {};
  while (undoLog.replaying) {
  let ev = popEvent();
  ((<{[t: string]: (ev: Ev) => void}>{
    "SELECTEVENT": () => pushEvents((<Ev[]>ev.options)[undoLog.readInt() - 1]),
    "SELECTCARD1": () => ev.result1((<Card[]>ev.options)[undoLog.readInt() - 1]),
    "SELECTCARD01": function () {
      const v = undoLog.readInt();
      v ? ev.result1((<Card[]>ev.options)[v - 1]) : ev.result0();
    },
    "SELECTOBJECTS": () => {
      const v = undoLog.readInts();
      v.length ? v.forEach(o => ev.result1((<Card[]>ev.options)[o])) : ev.result0();
    },
    "CONFIRM": () => {},
  })[ev.type] || playEvent)(ev);
  }
  let ev = popEvent();
  while (!ev.ui) { playEvent(ev); ev = popEvent(); }
  displayGame(ev);
  ((<{[t: string]: (ev: Ev) => void}>{
    "SELECTEVENT": function () {
      (<Ev[]>ev.options).map((option, i) => {
        if (option.what && !clickActions[option.what.id]) {
          clickActions[option.what.id] = () => { pushEvents(option); undoLog.write(i + 1); mainLoop(); };
        } else {;
          extraActions.push({name: getEventName(option), confirm: option.confirm, func: () => { pushEvents(option); undoLog.write(i + 1); mainLoop(); }});
        }
      });
    },
    "SELECTCARD1": function () {
      (<Card[]>ev.options).map((option, i) => clickActions[option.id] = () => { ev.result1(option); undoLog.write(i + 1); mainLoop(); });
    },
    "SELECTCARD01": function () {
      (<Card[]>ev.options).map((option, i) => clickActions[option.id] = () => { ev.result1(option); undoLog.write(i + 1); mainLoop(); });
      extraActions = [{name: "None", func: () => { ev.result0(); undoLog.write(0); mainLoop(); }}];
    },
    "SELECTOBJECTS": function () {
      let selected = ev.options.map(() => false);
      let options = <Card[]>ev.options;
      options.map((option, i) => clickActions[option.id] = () => {
        selected[i] = !selected[i];
        let cl = document.getElementById(option.id).classList;
        if (selected[i]) cl.add('selected'); else cl.remove('selected');
      });
      extraActions.push({name: "Confirm", func: () => {
        let num = selected.count(s => s);
        if (num < ev.min || num > ev.max) return;
        let indexes = selected.map((s, i) => s ? i : -1).filter(i => i >= 0);
        indexes.forEach(i => ev.result1(options[i]));
        if (num === 0) ev.result0();
        undoLog.write(indexes.join(',')); mainLoop();
      }});
    },
    "GAMEOVER": function () {
    },
    "CONFIRM": function () {
      extraActions.push({ name: "OK", func: () => mainLoop() });
    },
  })[ev.type])(ev);
  setMessage(ev.desc || "", ev.type !== "GAMEOVER" ? "" : ev.result === "WIN" ? "Good Wins" : ev.result === "LOSS" ? "Evil Wins" : "Drawn Game");
  let extraActionsHTML = extraActions.map((action, i) => {
    const id = "!extraAction" + i;
    clickActions[id] = action.func;
    return `<span class="action${action.confirm === false ? " noconfirm" : ""}" id="${id}">${action.name}</span>`;
  }).join('');
  Object.keys(clickActions).map(v => document.getElementById(v)).filter(e => e).forEach(e => {
    e.classList.add("select");
    if (ev.desc) {
      if (/\bKO\b/.test(ev.desc)) e.classList.add("selectko");
      if ((/\bdiscard\b/i).test(ev.desc) && !(/\bfrom discard\b/i).test(ev.desc)) e.classList.add("selectdiscard");
      if ((/\brecruit\b/i).test(ev.desc)) e.classList.add("selectrecruit");
      if ((/\bdefeat\b/i).test(ev.desc)) e.classList.add("selectdefeat");
    }
  });
  for (const deckDiv of document.getElementsByClassName('deck-overlay')) {
    const id = deckDiv.getAttribute('data-deck-id');
    if (clickActions[id]) deckDiv.classList.add("select");
  }
  document.getElementById("extraActions").innerHTML = extraActionsHTML;
  document.getElementById("logContainer").innerHTML = textLog.text;
  closePopupDecks();
  autoOpenPopupDecks();
  setTimeout(() => {
    const log = document.getElementById("logContainer");
    log.scrollTop = log.scrollHeight;
  }, 100);
}
function startGame(): void {
  initGameState(undoLog.gameSetup);
  setUiConfig(gameState.gameSetup);
  mainLoop();
}
function startApp(): void {
  const lastSetup: Setup = JSON.parse(localStorage.getItem('legendarySetup')) || exampleGameSetup;
  setupInit();
  setupSet(lastSetup);
  undoLog.init();
  initUI();
  startGame();
}
document.addEventListener('DOMContentLoaded', startApp, false);
/*
GUI:
TODO Show revealed cards when no action taken
TODO Select setup screen
TODO show multiple actions (play/teleport)
TODO multiplayer play areas
TODO idicators of actionable locations in hidden decks
TODO "scenarios"
TODO top villain deck card select (prof x uncommon)
TODO !attached cards view

ENGINE:
TODO eliminate count per turn in favor of pastevents or closures
TODO replace totalRecruit/Attack, bystandersRescued, cardsDrawn and cardsDiscarded with pastEvents (cardsPlayed also?)
TODO remodel triggers to attach on resolution not queuing?
TODO count escape pile conditions properly (do not count cards temporarly in the escape pile).
TODO set location of copies (to avoid null pointers in many places)
TODO Use deck.(locationN|n)ame instead of deck.id
TODO revealed without moving decks?
TODO SW1 fight card placement order
TODO SW1 render city dynamically
TODO SW1 make cardAction allow functions returning multiple actions
TODO SW2 make scheme card position independent
TODO Noir hidden witness removal and fight limitation (human shields at the same time) (also return them with Card.captured)
TODO X-Men rework extra masterminds
TODO Homecoming striker
TODO Homecoming coordinate
TODO Champions multiple size-changing
TODO Champions cheering crowds
TODO heroName fixes (setup option vs heroName, divided names, transformed names?, gray card names, gainable and other hero names)
TODO many fortify effects
TODO venom Bonding

https://boardgamegeek.com/thread/1817207/edge-cases-so-many

*/
