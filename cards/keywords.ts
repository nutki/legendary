// EXPANSION Dark City

// {TELEPORT}: Instead of playing it, you may set aside a card with the keyword "Teleport". If you do, add it to your new hand at the end of your turn as an extra card.
function teleportEv(ev: Ev, what: Card): void {
  pushEv(ev, "TELEPORT", { func: teleportCard, what });
}
function teleportCard(ev: Ev): void {
  moveCardEv(ev, ev.what, playerState.teleported);
}

// {BRIBE}: You can fight villains with the keyword "Bribe" by spending any combination of Attack and/or Recruit. For example, you may play two S.H.I.E.L.D. Agents and two S.H.I.E.L.D. Troopers to fight the +4 Attack Maggia Goons."

// {VERSATILE}: When you play a card with the keyword "Versatile" you must first choose between Recruit and Fight. Once you have chosen, the card provides recruit or fight equal to the Versatile value. For example, Versatile 3 gives you +3 Recruit or +3 Attack.
function versatileEv(ev: Ev, a: number): void {
  if (turnState.versatileBoth) {
    addRecruitEvent(ev, a);
    addAttackEvent(ev, a);
  } else chooseOneEv(ev, "Versatile is", ["Recruit", ev => addRecruitEvent(ev, a)], ["Attack", ev => addAttackEvent(ev, a)]);
}

// EXPANSION Fantastic Four

// {FOCUS}: When you play a card with a Focus ability, you can pay the cost on the left side of the arrow to get the effect on right side of the arrow.
// You can use that Focus ability as many times as you want for the rest of the turn. You can even play more Heroes, recruit, fight, then use the Focus ability more.
// Note: You can use Focus abilities and still use the "Healing" ability on Wounds.

function focusActionEv(ev: Ev, recruit: number, effect: (ev: Ev) => void, limit?: number) {
  let func = effect;
  const cost: ActionCost = { recruit };
  const what = ev.source;
  if (limit) {
    cost.cond = () => countPerTurn('focus', what) < limit;
    func = ev => { incPerTurn('focus', what); effect(ev); };
  }
  return new Ev(ev, 'FOCUS', { what, func, cost });
}
function setFocusEv(ev: Ev, cost: number, f: Handler, limit?: number) {
  addTurnAction(focusActionEv(ev, cost, f, limit));
}


// {BURROW}: This means "Fight: If the Streets were empty, put this Villain back into the Streets." When you fight a Villain with Burrow, do all of that Villain's Fight effects. You rescue any Bystanders the Villain may have captured as normal. Then, if the "Streets" city space was empty, put that Villain back into the Streets space. If you fight a Villain with Burrow twice in a turn, you'll do that Villain's Fight effects twice. Cards that do something "when you defeat" a Villain still work if the Villain burrows to the Streets. When a Villain burrows to the Streets, it does not do any Ambush effects
// fight effect
function burrowEv(ev: Ev) {
  isLocation(ev.where, 'STREETS') || withCity('STREETS', streets => streets.size || moveCardEv(ev, ev.source, streets))
}

// {COSMIC_THREAT}: If an enemy has Cosmic Threat: Ranged, that means: "For each Ranged card you reveal, this Enemy gets -3 Attack this turn." (An asterisk next to an Enemy's Attack number is to remind you that their Attack can change. The asterisk doesn't mean anything else.)
// Galactus' Cosmic Threat means "Once per turn, choose Strength, Instinct, Covert, Tech or Ranged. For each card of that color you reveal, this Enemy gets -3 Attack for one fight this turn." If you try to fight Galactus a second time in the same turn, he will return to his full attack and you cannot use his Cosmic Threat ability a second time that turn.
// villain cardAction
const cosmicThreatAction = (color?: number) => (what: Card, ev: Ev) => {
  function doReveal(ev: Ev, color: number) {
    incPerTurn('cosmicThreat', what);
    let count = 0;
    selectObjectsAnyEv(ev, "Reveal cards", revealable().limit(color), () => count++);
    addTurnMod('defense', c => c === what, () => -3 * count);
    if (isMastermind(what)) addTurnTrigger('FIGHT', ev => ev.what === what, () => count = 0);
  }
  return new Ev(ev, 'COSMICTHREATREVEAL', {
    cost: {
      cond: c => !countPerTurn('cosmicThreat', c) && revealable().has(color || isNonGrayHero)
    },
    func: (ev) => {
      color ? doReveal(ev, color) : chooseColorEv(ev, color => doReveal(ev, color))
    },
    what,
  });
}

// EXPANSION Paint the Town Red

// {WALLCRAWL}: "When you recruit this Hero, you may put it on top of your deck."
// Remember: When you use Wall-Crawl to put a card on top of your deck, don't use any other abilities on that card until it gets drawn from your deck. If you "gain" a Hero through some special ability like Skrull Shapeshifters, you can't use Wall-Crawl because you didn't "recruit" that Hero.

// {FEAST}: "Fight: KO the top card of your deck."
// Carnage's Master Strike starts with "Feast on each player." That means each player does the "Feast" effect.
// Note that Carnage's Master Strike is the only effect that feasts on every player. The "Maximum Carnage" Villains and Carnage's Mastermind Tactic each feast on only one player.

// fight effect
function feastEv(ev: Ev, effect?: (c: Card) => void, who?: Player) {
  who = who || playerState;
  lookAtDeckEv(ev, 1, () => who.revealed.each(c => {
    KOEv(ev, c);
    effect && cont(ev, () => effect(c));
  }), who);
}
// EXPANSION Villains
// <b>Demolish</b>: Reveal the top card of the Ally (Hero) Deck, note its cost, and put it on the bottom of the Ally Deck. Each player reveals their hand and discards a card with that cost.
// fight effect
function demolishEv(ev: Ev, who: (p: Player) => boolean = () => true) {
  let cost: number;
  revealHeroDeckEv(ev, 1, c => c.withFirst(c => cost = c.cost), false, true);
  cont(ev, () => eachPlayer(p => {
    who(p) && cost !== undefined && selectCardEv(ev, "Discard a card", p.hand.limit(c => c.cost === cost), c => discardEv(ev, c), p)
  }));
}
// <b>Elusive</b>: "Elusive 6" means "You can only fight this Adversary if you have made at least 6 Recruit this turn." You don't have to spend that Recruit to fight this Adversary, you just have to have made that much Recruit this turn. You can still spend that Recruit on recruiting Allies (Heroes).
// fightCond
function elusive(n: number) {
  return () => turnState.totalRecruit >= n;
}
// <b>X-Treme Attack</b>: "This Adversary gets +1 Attack for each other Adversary in the city with X-Treme Attack."
// varDefense
function xTremeAttack(c: Card): number {
  return c.printedDefense + CityCards().limit(isVillain).count(cc => cc.xTremeAttack && cc !== c);
}
// {DODGE}: "During your turn, you may discard this card from your hand to draw another card." When you Dodge a card from your hand, ignore all the other text on that card. When you Dodge a card from your hand, you didn't "play" that card, so the Dodged card's Ally (Hero) Class/color doesn't help you use the Superpower abilities of other cards you play that turn. Some Allies in the Villains set count the number of cards you discarded this turn; this includes cards you discarded with Dodge.
// hero cardAction
function dodge(c: Card, ev: Ev) {
  return new Ev(ev, 'DODGE', { what: c, func: ev => { discardEv(ev, ev.what); drawEv(ev); }, cost: { cond: c => c.location === playerState.hand } });
}

// EXPANSION Guardians of the Galaxy

function isControlledArtifact(c: Card) {
  return c.location === playerState.artifact;
}
function useArtifactAction(i: number = 0, shardCost: number = 0) {
  return (c: Card, ev: Ev) => new Ev(ev, 'USEARTIFACT', { what: c, cost: { cond: c => {
    return isControlledArtifact(c) && !countPerTurn(`useArtifact${i}`, c) && playerState.shard.size >= shardCost;
  }}, func: ev => {
    incPerTurn(`useArtifact${i}`, ev.what);
    ev.what.artifactEffects[i](ev);
  }});
}
function playArtifact(ev: Ev) {
  if (isCopy(ev.source) || owner(ev.source) !== playerState) { // Chameleon does no make a copy, but the card played is not owned by the current player
    chooseOptionEv(ev, "Choose Effect", ev.source.artifactEffects.map((v, i) => ({ l: `Effect ${i+1}`, v })), f => f(ev), ev.who);
  } else {
    moveCardEv(ev, ev.source, playerState.artifact);
  }
}

function useShardActionEv(ev: Ev) {
  return new Ev(ev, 'USESHARD', {
    cost: { cond: () => playerState.shard.size > 0 },
    func: ev => { spendShardEv(ev); addAttackEvent(ev, 1); },
  })
}
function useShardForRecruitActionEv(ev: Ev) {
  return new Ev(ev, 'USESHARDFORRECRUIT', {
    cost: { cond: () => playerState.shard.size > 0 },
    func: ev => { spendShardEv(ev); addRecruitEvent(ev, 1); }
  })
}
function gainShardEv(ev: Ev, shard: (Card | number) = 1, who: Player = playerState) {
  if (typeof shard === "number") {
    repeat(shard, () => cont(ev, () => gameState.shard.withTop(c => moveCardEv(ev, c, who.shard))));
  } else {
    moveCardEv(ev, shard, who.shard);
  }
}
function attachShardEv(ev: Ev, to: Card, shard: (Card | number) = 1) {
  if (typeof shard !== "number") attachCardEv(ev, shard, to, "SHARD");
  else repeat(shard, () => cont(ev, () => gameState.shard.withTop(c => attachCardEv(ev, c, to, "SHARD"))));
}
function spendShardEv(ev: Ev, p: Player = playerState) {
  cont(ev, () => p.shard.withTop(c => moveCardEv(ev, c, gameState.shard)));
}
const extraShatteraxTriggers: Trigger[] = [{
  event: 'RECRUIT',
  match: ev => ev.what.location.attached('SHARD').size > 0,
  before: ev => ev.parent.what.location.attached('SHARD').each(c => gainShardEv(ev, c)),
}, {
  event: 'MOVECARD',
  match: ev => ev.what.location.attached('SHARD').size > 0,
  after: ev => ev.parent.what.location.attached('SHARD').each(c => moveCardEv(ev, c, gameState.shard)),
}];

// EXPANSION Fear Itself

const uruEnchantedTrigger: (amount: number | ((c: Card) => number)) => Trigger = amount => ({
  event: 'FIGHT',
  before: ev => {
    const size = gameState.villaindeck.size;
    const n = typeof amount === "function" ? amount(ev.parent.what) : amount;
    for (let i = n; size && i > 0; i -= size) {
      revealVillainDeckEv(ev, i, cards => {
        if (i == n) cards.each(c => pushEv(ev, 'URUENCHANTEDREVEAL', { what: c, func: () => {}}));
        addTurnMod('defense', c => c === ev.parent.what, cards.sum(c => c.vp));
      }, true, true);
    }
  },
});
function getFightEvent(ev: Ev) {
  for (let e = ev; e; e = e.parent) if (e.type === "FIGHT") return e;
  return undefined;
}
function uruEnchantedCards(ev: Ev) {
  return turnState.pastEvents.filter(e => e.type === 'URUENCHANTEDREVEAL' && getFightEvent(e) === getFightEvent(ev)).map(e => e.what);
}
const uruEnchantedFail = (ev: Ev) => {
  addTurnSet('fightCost', undefined, (c, prev) => ({ ...prev, cond: () => false }));
  pushEffects(ev, ev.what, 'fight', ev.what.fight);
};
function demolishOtherEv(ev: Ev) { demolishEv(ev, p => p !== playerState ); }
function throwArtifactAction(c: Card, ev: Ev) {
  return new Ev(ev, 'THROWARTIFACT', { what: c, cost: { cond: c => isControlledArtifact(c) }, func: ev => {
    moveCardEv(ev, ev.what, playerState.deck, true);
    cont(ev, () => ev.what.artifactEffects[0](ev));
  }});
}

// {RISEOFTHELIVINGDEAD}: "Each player checks the top card of their Victory Pile. If that card is a Villain with a 'Rise of the Living Dead' ability, that Villain reenters the city."
// (Mastermind Tactics never return this way.)
// If you put a Villain with Bystanders into your Victory Pile, you choose the order.
function selectCardOrderEv(ev: Ev, desc: string, cards: Card[], effect: (c: Card) => void, agent: Player = playerState) {
  const f: (rest: Card[]) => void = rest => rest.size && selectCardEv(ev, "Select order", rest, c => {
    effect(c);
    f(rest.limit(v => v !== c));
  }, agent);
  f(cards);
}
// Ambush effect
function raiseOfTheLivingDead(ev: Ev) {
  const cards = gameState.players.map(p => p.victory.top).limit(c => c && c.ambush === raiseOfTheLivingDead && isVillain(c));
  selectCardOrderEv(ev, "Choose a card to return to the city", cards, c => villainDrawEv(ev, c));
}

// {XDRAMPAGE}: "Cross-Dimensional (Character) Rampage" means "Each player reveals one of their (Character) Heroes or a (Character) card in their Victory pile or gains a Wound." (Character) cards include any card with "(Character)" in its card name or Hero name.
// "Hulk" cards additionally include "Maestro" and "Nul, Breaker of Worlds."
// "Wolverine" cards additionally include any card with "Weapon X" or "Old Man Logan".
function isCharacterName(name: string) {
  const names = [ name ];
  if (name === 'Hulk') names.push('Maestro', 'Nul, Breaker of Worlds');
  if (name === 'Wolverine') names.push('Weapon X', 'Old Man Logan');
  return (c: Card) => names.has(n => c.cardName.includes(n) || c.heroName && c.heroName.includes(n));
}
// generic effect
function xdRampageEv(ev: Ev, name: string) {
  eachPlayer(p => selectCardOptEv(ev, `Reveal a ${name} card`, [...revealable(p), ...p.victory.deck].limit(isCharacterName(name)), () => {}, () => gainWoundEv(ev, p), p))
}

function isSidekick(c: Card) { return c.cardName === 'Sidekick'; }
function gainSidekickEv(ev: Ev) { gameState.sidekick.withTop(c => gainEv(ev, c)); }
function recruitSidekickActionEv(ev: Ev, what: Card) {
  const cost = getRecruitCost(what);
  cost.cond = () => countPerTurn('recruitSidekick') === 0;
  return new Ev(ev, 'RECRUIT', { what, func: ev => { incPerTurn('recruitSidekick'); buyCard(ev); }, cost });
}
