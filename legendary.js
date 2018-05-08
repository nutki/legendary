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
  get baseDefense() { return this.printedDefense; },
  get defense() {
    let value = getModifiedStat(this, "defense", this.baseDefense);
    return value < 0 ? 0 : value;
  },
  get vp() { return this.printedVP; },
  isPlayable: function () { return this.playable; },
  isHealable: function () { return this.cardType === "WOUND"; },
  isVillain: function () { return this.cardType === "VILLAIN"; },
  isColor: function(c) { return (this.color & c) !== 0; },
  isTeam: function(t) { return this.team === t; },
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
};
Color.COVERT = Color.RED;
Color.TECH = Color.BLACK;
Color.RANGED = Color.BLUE;
Color.STRENTH = Color.GREEN;
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
function makeCardCopy(c, where) {
  if (c.ctype !== 'P') throw TypeError("need card in play");
  let i = c.copyOf || c.instance;
  let r = makeCardInPlay(i, where);
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
  c.location.remove(c);
  if (!c.instance) return;
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
  attachedCards: function (name) { return attachedCards(name, this); },
  attachedCount: function (name) { return attachedCount(name, this); },
  deckList: [],
};

// Card definitions
let cardTemplates = {
  HEROES: [],
  HENCHMEN: [],
};
function addTemplates(type, set, templates) {
  templates.forEach(t => {
    t.set = set;
    cardTemplates[type].push(t);
  });
}
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

let mastermindTemplates = [
makeMastermindCard("Dr. Doom", 9, 5, "Doombot Legion",
  function (ev) {
    //Each player with exactly 6 cards in hand reveals a Tech Hero or puts 2 cards from their hand on top of their deck.
    eachPlayer(function(p) {
      if (p.hand.count === 6) {
        revealOrEv(ev, Color.BLACK, function (ev) { pickTopDeckEv(ev, p); pickTopDeckEv(ev, p); }, p);
      }
    });
  },
  [
    [ "Dark Technology", function (ev) { // You may recruit a Tech or Ranged Hero from the HQ for free.
      selectCardEv(ev, HQCards().filter(isColor(Color.BLACK | Color.BLUE)), function (ev) { gainEv(ev, ev.selected); });
    } ],
    [ "Monarch's Decree", function (ev) { // Choose one: each other player draws a card or each other player discards a card.
      chooseOneEv(ev, "Each other player draws a card", function (ev) {
        eachOtherPlayerVM(function(p) { pickDiscardEv(ev, p); });
      }, "Each other player discards a card", function (ev) {
        eachOtherPlayerVM(function(p) { drawEv(ev, p); });
      });
    } ],
    [ "Secrets of Time Travel", function (ev) { // Take another turn after this one.
      gameState.extraTurn = true; // TODO: multiplayer
    } ],
    [ "Treasures of Latveria", function (ev) { // When you draw a new hand of cards at the end of this turn, draw three extra cards.
      addEndDrawMod(3);
    } ],
  ]
),
];

let villainTemplates = [
{ name: 'Brotherhood', cards: [
// Brotherhood (Magneto always leads)
// Blob
// You can't defeat Blob unless you have an X-Men Hero.
// Attack: 4
// VP: 2
[ 2, makeVillainCard('Brotherhood', 'Blob', 4, 2, {
  fightCond: () => revealable().filter('X-Men').length > 0,
  fightCost: ev => revealEv(ev, revealable().filter('X-Men'))
}) ],
// 
// Juggernaut
// Ambush: Each player KOs two Heroes from their discard pile.
// Escape: Each player KOs two Heroes from their hand.
// Attack: 6
// VP: 4
[ 2, makeVillainCard('Brotherhood', 'Juggernaut', 6, 4, {
//  ambush: function (ev) { eachPlayer(function(p) { selectCardsEv(ev, p.discard, 2, function (ev) { KOEv(ev, ev.selected); }, p); }); },
//  escape: function (ev) { eachPlayer(function(p) { selectCardsEv(ev, p.hand, 2, function (ev) { KOEv(ev, ev.selected); }, p); });}

  ambush: ev => eachPlayer(p => selectCardsEv(ev, p.discard, 2, ev => KOEv(ev, ev.selected), p)),
  escape: ev => eachPlayer(p => selectCardsEv(ev, p.hand, 2, ev => KOEv(ev, ev.selected), p))
}) ],
// 
// Mystique
// Escape: Mystique becomes a Scheme Twist that takes effect immediately.
// Attack: 5
// VP: 3
[ 2, makeVillainCard('Brotherhood', 'Mystique', 5, 3, { escape: ev => playTwistEv(ev, ev.source) }) ],
// 
// Sabretooth
// Fight: Each player reveals an X-Men Hero or gains a Wound.
// Escape: Same effect.
// Attack: 5
// VP: 3
[ 2, makeVillainCard('Brotherhood', 'Sabretooth', 5, 3, { fight: function (ev) {
  eachPlayer(function(p) { revealOrEv(ev, 'X-Men', function (ev) { gainWoundEv(ev, p); }, p); });
}, escape: function (ev) {
  eachPlayer(function(p) { revealOrEv(ev, 'X-Men', function (ev) { gainWoundEv(ev, p); }, p); });
} }) ],
] },
];


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
  deck: new Deck('DECK0'),
  discard: new Deck('DISCARD0', true),
  hand: new Deck('HAND0', true),
  victory: new Deck('VICTORY0', true),
  revealed: new Deck('REVEALED0', true),
};
playerState.deck.owner = playerState.discard.owner = playerState.hand.owner = playerState.victory.owner = playerState.revealed.owner = playerState;
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
      before: function (ev) { let to = ev.parent.to; if (to.next) moveCardEv(ev, to.top, to.next); else pushEvents({ type: "ESCAPE", what: to.top, parent: ev }); },
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
let herocards = cardTemplates.HEROES;
for (let i = 0; i < herocards.length; i++) {
  if (herocards[i].name !== "Rogue" && herocards[i].name !== "Storm") continue;
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
gameState.mastermind.addNewCard(mastermindTemplates[0]);
let tactics = gameState.mastermind.top.attachedCards('TACTICS');
mastermindTemplates[0].tacticsTemplates.forEach(function (c) { tactics.addNewCard(c); });
tactics.shuffle();
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
function isPlayable(c) { return c.isPlayable(); }
function isHealable(c) { return c.isHealable(); }
function isColor(col) { return function (c) { return c.isColor(col); }; }
function isTeam(team) { return function (c) { return c.isTeam(team); }; }
function filter(cards, cond) {
  if (cards instanceof Deck) cards = cards.deck;
  if (cond === undefined) return cards;
  return cards.filter(typeof cond === "function" ? cond : typeof cond === "number" ? isColor(cond) : isTeam(cond));
}
function count(cards, cond) { return filter(cards, cond).length; }

function handOrDiscard() { return playerState.hand.deck.concat(playerState.discard.deck); }
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
function eachOtherPlayer(f) { let r = gameState.filter(function (e) { return e !== playerState; }); if (f) r.forEach(f); return r; }
function eachOtherPlayerVM(f) { return gameState.advancedSolo ? eachPlayer(f) : eachOtherPlayer(f); }
function eachPlayer(f) { if (f) gameState.players.forEach(f); return gameState.players; }
function revealable(who) {
  who = who || playerState;
  // TODO: also artifacts and maybe MOoT
  if (who !== playerState) return who.hand.deck;
  return who.hand.deck.concat(gameState.playArea.deck);
}
function yourHeroes(who) { return filter(revealable(who), isHero); }

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
  return eventQueue.shift();
}
function uiEvent() {
  joinQueue();
  return eventQueue[0] && eventQueue[0].ui;
}

function canRecruit(c) {
  return turnState.recruit >= c.cost;
}
function canFight(c) {
  let a = turnState.attack;
  if (c.bribe || turnState.attackWithRecruit) a += turnState.recruit;
  return a >= c.defense;
}
function canHeal(c) {
  if (!c.isHealable()) return false;
  return c.healCond ? c.healCond() : true;
}
function getActions(ev) {
  let p = playerState.hand.filter(isPlayable).map(function (e) { return {
    type: "PLAY",
    what: e,
    parent: ev,
  }; });
  p = p.concat(playerState.hand.filter(function(e) { return canHeal(e); }).map(function (e) { return {
    type: "HEAL",
    what: e,
    parent: ev,
  }; }));
  if (!turnState.noRecruitOrFight) {
  // TODO any deck with recruitable
  p = p.concat(gameState.hq.filter(function(d) { return d.count && canRecruit(d.top); }).map(function (d) { return {
    type: "RECRUIT",
    what: d.top,
    parent: ev,
  }; }));
  // TODO any deck with fightable
  p = p.concat(gameState.city.filter(function(d) { return d.count && canFight(d.top); }).map(function (d) { return {
    type: "FIGHT",
    what: d.top,
    parent: ev,
  }; }));
  if (gameState.mastermind.count && gameState.mastermind.top.attached.TACTICS.count && canFight(gameState.mastermind.top)) p.push({
    type: "FIGHT",
    what: gameState.mastermind.top,
    parent: ev,
  });
  if (gameState.officer.count && canRecruit(gameState.officer.top)) p = p.concat({
    type: "RECRUIT",
    what: gameState.officer.top,
    parent: ev,
  });
  }
  p = p.concat({type: "ENDOFTURN", parent:ev, confirm: p.length > 0});
  return p;
}

function addAttackEvent(ev, c) { pushEvents({ type: "ADDATTACK", source: ev.what, parent: ev, amount: c }); }
function addRecruitEvent(ev, c) { pushEvents({ type: "ADDRECRUIT", source: ev.what, parent: ev, amount: c }); }
function moveCardEv(ev, what, where, bottom) {
  pushEvents({ type:"MOVECARD", what:what, from:what.location, to:where, bottom:bottom, parent:ev }); 
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
function attachCardEv(ev, what, to, name) { moveCardEv(ev, what, to.attachedCards(name)); }
function gainEv(ev, card, who) {
  who = who || playerState;
  pushEvents({type:"GAIN", what:card, who:who, where: who.discard, parent: ev});
}
function gainToHandEv(ev, card, who) {
  who = who || playerState;
  pushEvents({type:"GAIN", what:card, who:who, where: who.hand, parent: ev});
}
function discardEv(ev, card) { pushEvents({ type: "DISCARD", parent: ev, what:card }); }
function drawEv(ev, amount, who) { pushEvents({ type: "DRAW", who: who || playerState, amount: amount || 1, parent: ev }); }
function drawIfEv(ev, cond, who) {
    let draw = false;
    lookAtDeckEv(ev, 1, () => draw = cond(playerState.revealed.top), who);
    cont(ev, () => { if (draw) drawEv(ev, 1, who); });
}
function KOEv(ev, card) { pushEvents({ type:"KO", parent: ev, what:card }); }
function evilWinsEv(ev) { pushEvents({ type:"EVILWINS", parent: ev }); }
function runOutEv(ev, deck) { pushEvents({ type:"RUNOUT", parent: ev, what: deck }); }
function villainDrawEv(ev) { pushEvents({ type:"VILLAINDRAW", parent: ev }); }
function playTwistEv(ev, what) { pushEvents({ type:"TWIST", parent: ev, what:what }); }
function rescueEv(ev, what) {
  if (what) pushEvents({ type: "RESCUE", parent: ev, what: what });
  else cont(ev, () => {
    if (gameState.bystanders.top) pushEvents({ type: "RESCUE", parent: ev, what: gameState.bystanders.top });
    else runOutEv(ev, 'BYSTANDERS');
  });
}
function gainWoundEv(ev, who) {
  cont(ev, () => {
    if (gameState.wounds.top) gainEv(ev, gameState.wounds.top, who);
    else runOutEv(ev, "WOUNDS");
  });
}
function cont(ev, func) { pushEvents({ type: "EFFECT", parent:ev, func:func}); }
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
function chooseOneEv(ev) {
  let a = arguments;
  let newev = { type: "SELECTONE", parent:ev, options: [], ui: true, agent: playerState };
  for (let i = 1; i < a.length; i += 2)
    newev.options.push({ type: "EFFECT", parent:ev, func: a[i+1], name: a[i] });
  pushEvents(newev);
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
function lookAtDeckEv(ev, amount, action, who) {
  who = who || playerState;
  for (let i = 0; i < amount; i++) cont(ev, ev => revealOne(ev, who));
  cont(ev, action);
  let cleanupRevealed = () => {
    if (who.revealed.count === 0) return;
    if (who.revealed.count === 1) moveCardEv(ev, who.revealed.top, who.deck);
    else selectCardEv(ev, who.revealed, ev => { moveCardEv(ev, ev.selected, who.deck); cleanupRevealed(); });
  };
  cont(ev, cleanupRevealed);
}
function revealOne(ev, who) {
  if (!who.deck.count && !who.discard.count) {
  } else if (!who.deck.count) {
    pushEvents({type: "RESHUFFLE", parent:ev}, ev);
  } else {
    moveCardEv(ev, who.deck.top, who.revealed);
  }
}
function KOHandOrDiscardEv(ev, filter, func) {
  let cards = handOrDiscard();
  if (filter) cards = cards.filter(filter);
  selectCardOptEv(ev, cards, ev => { KOEv(ev, ev.selected); cont(ev, func); })
}


function playCopyEv(ev, what) {
  pushEvents({ type: "PLAY", what: makeCardCopy(what, gameState.playArea), parent: ev });
}
function playCardDo(ev) {
  if (ev.what.attack) addAttackEvent(ev, ev.what.attack);
  if (ev.what.recruit) addRecruitEvent(ev, ev.what.recruit);
  for (let i = 0; ev.what.effects && i < ev.what.effects.length; i++) {
    pushEvents( { type: "EFFECT", source: ev.what, parent: ev, func: ev.what.effects[i] } );
  }
  cont(ev, () => turnState.cardsPlayed.push(ev.what));
}
// Play copy
// - actual card on cards played
// - nothing in play area
// Play copypaste
// - copypaste in cards played
// - copypaste in play area
// Play copy of copypaste
// - copypaste in cards played
// - nothing in play area
function playCard(ev) {
  // PAY PLAYCOST (discard or top deck 1-3 cards)
  if (ev.what.location !== gameState.playArea) // Make sure not to loose copy due to move
    moveCardEv(ev, ev.what, gameState.playArea);
  if (ev.what.copyPasteCard) {
    selectCardEv(ev, turnState.cardsPlayed, selectEv => {
      const target = selectEv.selected;
      console.log("COPYPASTE", ev.what, target);
      ev.what = makeCardCopyPaste(target, ev.what);
      console.log("RESULT", ev.what);
      playCardDo(ev);
    }); // TODO if there are no cards played this prevents rogue copy powers play at all currently
  } else {
    playCardDo(ev);
  }
}
function buyCard(ev) {
  // TODO: other pay options
  turnState.recruit -= ev.what.cost;
  turnState.recruitedOrFought = true;
  gainEv(ev, ev.what);
}
function gainCard(ev) {
  moveCardEv(ev, ev.what, ev.where);
}
function cleanUp(ev) {
  moveAll(playerState.hand, playerState.discard);
  moveAll(gameState.playArea, playerState.discard);
  let drawAmount = (turnState.endDrawAmount || gameState.endDrawAmount) + (turnState.endDrawMod || 0);
  drawEv(ev, drawAmount);
}
function drawOne(ev) {
  if (!ev.who.deck.count && !ev.who.discard.count) {
    runOutEv(ev, "DECK");
  } else if (!ev.who.deck.count) {
    pushEvents({type: "RESHUFFLE", parent:ev}, ev);
  } else {
    turnState.cardsDrawn++;
    moveCardEv(ev, ev.who.deck.top, ev.who.hand);
  }
}
function reshufflePlayerDeck() {
  moveAll(playerState.discard, playerState.deck);
  playerState.deck.shuffle();
}
function playTwist(ev) {
  pushEvents({ type: "EFFECT", source: gameState.scheme.top, parent: ev, func: gameState.scheme.top.twist, nr: ++gameState.twistCount, twist: ev.what });
  if (gameState.advancedSolo) 
    selectCardEv(ev, HQCards().filter(c => c.cost <= 6), function (ev) { moveCardEv(ev, ev.selected, gameState.herodeck, true); });
}
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
      // TODO select mastermind in case of multiple
      attachCardEv(ev, c, i.top, "BYSTANDER");
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
  pushEvents({ type: "DEFEAT", what: c, parent: ev });
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
function rescueBystander(ev) {
  let c = ev.what;
  moveCardEv(ev, c, playerState.victory);
  if (c.rescue) pushEvents({ type: "EFFECT", source: c, parent: ev, func: c.rescue });
}
function findTriggers(ev) {
  let tempTriggers = [];
  if (turnState.triggers) tempTriggers.concat(turnState.triggers);
  if (!tempTriggers.length) return gameState.triggers;
  return gameState.triggers.concat(tempTriggers);
}
function addTriggers(ev) {
  // TODO: more dynamic events (add generic { type:"TRIGGER", what:ev.type, when:"BEFORE" }), harder for replacement and steteful before/after triggers
  // TODO: order triggers
  let triggers = findTriggers(ev).filter(function(t){return t.event === ev.type && t.match(ev);});
  let newev = [];
  triggers.forEach(function(t) {
    if (t.before)
      newev.push({type:"EFFECT", func:t.before, parent:ev});
  });
  newev.push(ev);
  triggers.forEach(function(t) {
    if (t.after)
      newev.push({type:"EFFECT", func:t.after, parent:ev});
  });
  triggers.forEach(function(t) {
    if (t.replace)
      newev = [{type:"EFFECT", func:t.replace, what:newev, parent:ev }];
  });
  return newev;
}
function playGame() {
do {
  let ev = popEvent() || {
    type:"TURN",
    recruit: 0,
    attack: 0,
    totalRecruit: 0,
    cardsPlayed: [],
    cardsDrawn: 0,
    modifiers: {},
    parent:gameState
  };
  if (!undoLog.replaying) console.log(">>> " + ev.type, ev);
  ({
    "TURN": function() {
      textLog.log("Turn Start");
      turnState = ev;
      pushEvents({type:"VILLAINDRAW",parent:ev},{type:"ACTIONS",parent:ev},{type:"CLEANUP",parent:ev});
    },
    "ACTIONS": function () {
      if (!ev.endofturn) {
        pushEvents({type:"SELECTEVENT",parent:ev,options:getActions(ev),ui:true},ev);
      }
    },
    "ENDOFTURN": () => ev.parent.endofturn = true,
    "CLEANUP": cleanUp,
    "PLAY": playCard,
    "RECRUIT": buyCard,
    "GAIN": gainCard,
    "DRAW": function () { for (let i = 0; i < ev.amount; i++) pushEvents({type:"DRAWONE", who:ev.who, parent:ev.parent}); },
    "DRAWONE": drawOne,
    "RESHUFFLE": reshufflePlayerDeck,
    "ADDATTACK": function () { turnState.attack += ev.amount; },
    "ADDRECRUIT": function () { turnState.recruit += ev.amount; turnState.totalRecruit += ev.amount; },
    "MOVECARD": function () { moveCard(ev.what, ev.to, ev.bottom); },
    "EFFECT": ev.func,
    "VILLAINDRAW": villainDraw,
    "ESCAPE": villainEscape,
    "FIGHT": villainFight,
    "DEFEAT": villainDefeat,
    "DISCARD": function () { moveCardEv(ev, ev.what, ev.what.location.owner.discard); },
    "KO": function () { moveCardEv(ev, ev.what, gameState.ko); },
    "EVILWINS": function () { if (!gameState.goodWins) gameState.evilWins = 'SCHEME'; },
    "RUNOUT": () => {}, // Trigger only.
    "HEAL": function () { pushEvents({ type: "EFFECT", source: ev.what, parent: ev, func: ev.what.heal }); },
    "RESCUE": rescueBystander,
    "TWIST": playTwist,
  }[ev.type] || (() => console.log("Unknown event type", ev)))(ev);
} while (!uiEvent());
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
  let cards = document.getElementsByClassName("card");
  document.getElementById("recruit").innerHTML = turnState.recruit;
  document.getElementById("attack").innerHTML = turnState.attack;
}

// Main loop
function mainLoopAuto() {
  let count = 0;
  function makeAction() {
    count++;
    let ev = popEvent();
    ({
      "SELECTEVENT": function () { pushEvents(ev.options[0]); },
      "SELECTCARD1": function () { ev.result1.selected = ev.options[0]; pushEvents(ev.result1); },
      "SELECTCARD01": function () { ev.result1.selected = ev.options[0]; pushEvents(ev.result1); },
      "SELECTONE": function () { pushEvents(ev.options[0]); },
    }[ev.type] || function () {
      console.log("Unknown UI event type", ev);
    })();
    playGame();
    displayGame();
    if (count < 500) setTimeout(makeAction, 200);
  }
  playGame();
  displayGame();
  setTimeout(makeAction, 1000);
}

function getEventName(ev) {
  if (ev.type === "ENDOFTURN") return "End Turn";
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
  playGame();
  let ev = popEvent();
  ({
    "SELECTEVENT": function () { pushEvents(ev.options[undoLog.readInt() - 1]); },
    "SELECTCARD1": function () { ev.result1.selected = ev.options[undoLog.readInt() - 1]; pushEvents(ev.result1); },
    "SELECTCARD01": function () {
      const v = undoLog.readInt();
      if (v) ev.result1.selected = ev.options[v - 1];
      pushEvents(v ? ev.result1 : ev.result0);
    },
    "SELECTONE": function () { pushEvents(ev.options[0]); },
  }[ev.type] || function () {
    console.log("Unknown UI event type", ev);
  })();
  }
  playGame();
  displayGame();
  let ev = popEvent();
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
    "SELECTONE": function () { pushEvents(ev.options[0]); mainLoop(); },
  }[ev.type] || function () {
    console.log("Unknown UI event type", ev);
  })();
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
UI events description
Show hidden events (make all event pass the main UI loop) / effect source

ENGINE:
Merge chooseOne with selectevent
Handle end game conditions
required villain/hero groups

other sets base functions: artifacts, special bystanders, sidekicks, divided cards
*/
