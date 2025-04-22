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
  } else chooseOneEv(ev, "Versatile is", ["Recruit", () => addRecruitEvent(ev, a)], ["Attack", () => addAttackEvent(ev, a)]);
}

// EXPANSION Fantastic Four

// {FOCUS}: When you play a card with a Focus ability, you can pay the cost on the left side of the arrow to get the effect on right side of the arrow.
// You can use that Focus ability as many times as you want for the rest of the turn. You can even play more Heroes, recruit, fight, then use the Focus ability more.
// Note: You can use Focus abilities and still use the "Healing" ability on Wounds.

function focusActionEv(ev: Ev, cost: ActionCost, effect: (ev: Ev) => void, limit?: number) {
  let func = effect;
  const what = ev.source;
  if (limit) {
    cost.cond = () => countPerTurn('focus', what) < limit;
    func = ev => { incPerTurn('focus', what); effect(ev); };
  }
  return new Ev(ev, 'FOCUS', { what, func, cost });
}
function setFocusEv(ev: Ev, recruit: number, f: Handler, limit?: number) {
  addTurnAction(focusActionEv(ev, { recruit }, f, limit));
}


// {BURROW}: This means "Fight: If the Streets were empty, put this Villain back into the Streets." When you fight a Villain with Burrow, do all of that Villain's Fight effects. You rescue any Bystanders the Villain may have captured as normal. Then, if the "Streets" city space was empty, put that Villain back into the Streets space. If you fight a Villain with Burrow twice in a turn, you'll do that Villain's Fight effects twice. Cards that do something "when you defeat" a Villain still work if the Villain burrows to the Streets. When a Villain burrows to the Streets, it does not do any Ambush effects
// fight effect
function burrowEv(ev: Ev) {
  isLocation(ev.where, 'STREETS') || withCity('STREETS', streets => streets.size || moveCardEv(ev, ev.source, streets))
}

// {COSMIC_THREAT}: If an enemy has Cosmic Threat: Ranged, that means: "For each Ranged card you reveal, this Enemy gets -3 Attack this turn." (An asterisk next to an Enemy's Attack number is to remind you that their Attack can change. The asterisk doesn't mean anything else.)
// Galactus' Cosmic Threat means "Once per turn, choose Strength, Instinct, Covert, Tech or Ranged. For each card of that color you reveal, this Enemy gets -3 Attack for one fight this turn." If you try to fight Galactus a second time in the same turn, he will return to his full attack and you cannot use his Cosmic Threat ability a second time that turn.
// villain cardAction
const cosmicThreatAction = (what: Card, ev: Ev) => {
  if (!isFightable(what)) return noOpActionEv(ev);
  const color = getModifiedStat(what, 'cosmicThreat', 0) || what.cosmicThreat;
  if (!color) return noOpActionEv(ev);
  function doReveal(ev: Ev, color: Filter<Card>) {
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
      !(typeof color === "number") || classes.includes(color) ?
        doReveal(ev, color) : chooseClassEv(ev, color => doReveal(ev, color), c => (c & color) !== 0);
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
  revealPlayerDeckEv(ev, 1, cards => cards.each(c => {
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
  return c.printedDefense + cityVillains().count(cc => cc.xTremeAttack && cc !== c);
}
// {DODGE}: "During your turn, you may discard this card from your hand to draw another card." When you Dodge a card from your hand, ignore all the other text on that card. When you Dodge a card from your hand, you didn't "play" that card, so the Dodged card's Ally (Hero) Class/color doesn't help you use the Superpower abilities of other cards you play that turn. Some Allies in the Villains set count the number of cards you discarded this turn; this includes cards you discarded with Dodge.
// hero cardAction
function dodge(c: Card, ev: Ev) {
  return new Ev(ev, 'DODGE', { what: c, func: ev => { discardEv(ev, ev.what); drawEv(ev); }, cost: { cond: c => c.location === playerState.hand } });
}

// EXPANSION Guardians of the Galaxy

function isControlledArtifact(c: Card, anyPlayer: boolean = false) {
  if (anyPlayer) return gameState.players.has(p => p.artifact === c.location);
  return c.location === playerState.artifact;
}
function getArtifactEffects(c: Card) {
  return getModifiedStat(c, 'artifactEffects', c.artifactEffects);
}
function useArtifactAction(i: number = 0, shardCost: number = 0) {
  return (c: Card, ev: Ev) => new Ev(ev, 'USEARTIFACT', { what: c, source: c, cost: { cond: c => {
    return isControlledArtifact(c) && !countPerTurn(`useArtifact${i}`, c) && playerState.shard.size >= shardCost;
  }}, func: ev => {
    incPerTurn(`useArtifact${i}`, ev.what);
    getArtifactEffects(ev.what)[i](ev);
  }});
}
function playArtifact(ev: Ev) {
  if (ev.source.location !== playerState.playArea || isCopy(ev.source)) { // Chameleon and Star-Lord using playCardEffects outside of playCard
    const effects = getArtifactEffects(ev.source);
    if (effects.size !== 1)
      chooseOptionEv(ev, "Choose Effect", effects.map((v, i) => ({ l: `Effect ${i+1}`, v })), f => f(ev), ev.who);
    else effects[0](ev);
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
  match: (ev, source) => ev.what === source,
  before: ev => {
    const size = gameState.villaindeck.size;
    const n = typeof amount === "function" ? amount(ev.parent.what) : amount;
    let sum = 0;
    addTurnMod('defense', c => c === ev.parent.what, () => sum);
    for (let i = n; size && i > 0; i -= size) {
      revealVillainDeckEv(ev, i, cards => {
        if (i == n) cards.each(c => pushEv(ev, 'URUENCHANTEDREVEAL', { what: c, func: () => {}}));
        sum += cards.sum(c => c.vp);
      }, true, true);
    }
    cont(ev, () => ev.parent.cost = getFightCost(ev.parent.what));
    cont(ev, () => sum = 0);
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
  forbidAction('FIGHT');
  pushEffects(ev, ev.what, 'fight', ev.what.fight);
};
function demolishOtherEv(ev: Ev) { demolishEv(ev, p => p !== playerState ); }
function throwArtifactAction(c: Card, ev: Ev) {
  return new Ev(ev, 'THROWARTIFACT', { what: c, cost: { cond: c => isControlledArtifact(c) && (!c.throwCond || c.throwCond(c)) }, func: ev => {
    moveCardEv(ev, ev.what, playerState.deck, true);
    cont(ev, () => getArtifactEffects(ev.what)[0](ev));
  }});
}
const thrownArtifact = { isArtifact: true, cardActions: [ throwArtifactAction ]};

// {RISEOFTHELIVINGDEAD}: "Each player checks the top card of their Victory Pile. If that card is a Villain with a 'Rise of the Living Dead' ability, that Villain reenters the city."
// (Mastermind Tactics never return this way.)
// If you put a Villain with Bystanders into your Victory Pile, you choose the order.
function selectCardOrderEv(ev: Ev, desc: string, cards: Card[], effect: (c: Card) => void, agent: Player = playerState) {
  const f: (rest: Card[]) => void = rest => rest.size && selectCardEv(ev, desc || "Select order", rest, c => {
    effect(c);
    f(rest.limit(v => v !== c));
  }, agent);
  f(cards);
}
function hasRiseOfTheLivingDead(c: Card) {
  return getModifiedStat(c, 'riseOfTheLivingDead', c.riseOfTheLivingDead || c.ambush === riseOfTheLivingDead);
}
// Ambush effect
function riseOfTheLivingDead(ev: Ev) {
  if (ancestorEvents(ev).has(ev => ev.func === riseOfTheLivingDead)) return; // What If...? no chain reaction change.
  const cards = gameState.players.map(p => p.victory.top).limit(c => c && hasRiseOfTheLivingDead(c) && isVillain(c));
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
function xdRampageEv(ev: Ev, name: string | ((c: Card) => boolean), effect0?: (p: Player) => void) {
  eachPlayer(p => selectCardOptEv(ev, `Reveal a ${name} card`, [...revealable(p), ...p.victory.deck].limit(typeof(name) === "string" ? isCharacterName(name) : name), () => {}, () => {
    gainWoundEv(ev, p);
    effect0 && effect0(p);
  }, p))
}

function isSidekick(c: Card) { return c.isSidekick === true; }
function gainSidekickEv(ev: Ev, where: 'DECK' = undefined, p: Player = playerState) { cont(ev, () => gameState.sidekick.withTop(c => where === 'DECK' ? gainToDeckEv(ev, c, p) : gainEv(ev, c, p))); }
function recruitSidekickActionEv(ev: Ev, what: Card) {
  const cost = getRecruitCost(what, () => limitPerTurn(e => e.type === 'RECRUIT' && isSidekick(e.what)));
  return new Ev(ev, 'RECRUIT', { what, where: what.location, func: ev => buyCard(ev), cost });
}

function ascendToMastermind(ev: Ev, strike?: Handler, vp?: number) {
  if (strike) addStatSet('strike', c => c === ev.source, (c, prev) => combineHandlers(prev, strike));
  if (vp) addStatSet('vp', c => c === ev.source, () => vp);
  moveCardEv(ev, ev.source, gameState.mastermind);
}
function addFutureTrigger(effect: (ev: Ev) => void, p?: Player) {
  let done: boolean = false; // TODO maybe remove triggers instead
  gameState.triggers.push({
    event: 'TURNSTART',
    match: ev => !done && (!p || playerState === p),
    after: ev => (effect(ev), done = true),
  })
}

// {SPECTRUM} Some cards have abilities like "Spectrum: Draw a card." You can use a card's Spectrum abilities only if you have at least 3 classes of Hero.
// Grey S.H.I.E.L.D. Heroes, HYDRA Allies, New Recruits and Sidekicks don't have classes, so they don't help.
// You can count all the classes you have among cards you played this turn and cards in your hand.
function spectrumPower(p: Player = playerState) {
  const colors = [Color.COVERT, Color.INSTINCT, Color.TECH, Color.RANGED, Color.STRENGTH];
  return colors.count(color => yourHeroes(p).has(color)) >= 3;
}

// <b>Patrol</b>: Some cards have abilities like "Patrol the Sewers: If it's empty, rescue a Bystander." When you play that card, you can use that ability only if that city space has no cards in it.
// If that city space becomes empty later in the turn, it's too late to use the Patrol ability.
// This can also say "Fight: Patrol the Bank: If it's empty, you get +2 Recruit. If it's not, you get +2 Attack."
// Other cards let you patrol even stranger places, like the Escape Pile or a Victory Pile. Similarly, you can use those Patrol abilities if that place has no cards in it.
// If a Mastermind or Scheme causes a city space not to exist, you can't patrol that space.
function patrolDeck(where: Deck, effect0: () => void, effect1?: (c: Card) => void) {
  !where.size ? effect0() : effect1 && effect1(where.top);
}
function patrolCity(where: CityLocation, effect0: () => void, effect1?: (c: Card) => void) {
  withCity(where, d => patrolDeck(d, effect0, effect1));
}
function patrolCityForVillain(where: CityLocation, effect: (c: Card) => void) {
  withCity(where, d => d.limit(isVillain).withFirst(effect));
}
// <b>Circle of Kung-Fu (and Quack-Fu)</b>: "5th Circle of Kung-Fu" means "During your turn, this Villain has +5 Attack unless you reveal a Hero that costs 5 or more."
// Likewise, the 7th Circle gets +7 Attack unless you reveal a Hero that costs 7 or more, etc.
// If a Villain or Mastermind already has a Circle of Kung-Fu, and a Scheme gives them another one, only count the highest circle - don't add them up.
function nthCircleDefense(c: Card) {
  return (turnState.pastEvents.has(e => e.type === 'NTHCIRCLEREVEAL' && e.amount >= c.nthCircle) ? 0 : c.nthCircle);
}
const nthCircleRevealAction = (what: Card, ev: Ev) => {
  return new Ev(ev, 'NTHCIRCLEREVEAL', {
    what,
    amount: what.nthCircle,
    cost: { cond: c => revealable().has(c => c.cost >= ev.what.nthCircle) },
    func: ev => selectCardEv(ev, "Reveal a card", revealable().limit(c => c.cost >= ev.what.nthCircle), () => {}),
  })
}
function nthCircleParams(n: number) {
  return { printedNthCircle: n, cardActions: [ nthCircleRevealAction ] };
}

// <b>Fateful Resurrection</b>: On a Villain card, "Fight: Fateful Resurrection" means "Fight: Reveal the top card of the Villain Deck. If it's a Scheme Twist or Master Strike, this Villain reenters the city."
// If a Villain resurrects this way, you still rescue its Bystanders and do its other Fight effects.
// The Villain pushes into the Sewers and does any Ambush abilities as normal.
// If a Mastermind Tactic resurrects this way, shuffle it back into the other face down Tactics.
// If a Villain that has ascended to become a Mastermind resurrects this way, it stays a Mastermind and does not reenter the city.
function fatefulResurrectionAndEv(effect?: (ev: Ev) => void) {
  return (ev: Ev) => revealVillainDeckEv(ev, 1, cards => (cards.has(isTwist) || cards.has(isStrike)) && (villainDrawEv(ev, ev.source), effect && cont(ev, () => effect(ev))));
}
const fatefulResurrectionEv = fatefulResurrectionAndEv();
function fatefulResurrectionTacticEv(ev: Ev, effect: () => void) {
  revealVillainDeckEv(ev, 1, cards => (cards.has(isTwist) || cards.has(isStrike)) && (shuffleIntoEv(ev, ev.source, ev.source.mastermind.attachedDeck('TACTICS')), cont(ev, () => effect())));
}

// <b>Charge</b>: "Ambush: Charge one space" means "(After this Villain enters the Sewers,) it charges forward an extra space, pushing other Villains forward."
function villainChargeEv(ev: Ev, c: Card, n: number) {
  repeat(n, () => cont(ev, () => {
    c.location.next ? moveCardEv(ev, c, c.location.next) : villainEscapeEv(ev, c);
  }));
}
const chargeAmbushEffect = (n: number) => (ev: Ev) => villainChargeEv(ev, ev.source, n);

// <b>Man/Woman Out of Time</b>: "After you use this card's abilities, set it aside. At the beginning of your next turn, play this card a second time then discard it."
// The card is discarded the second time you play it, so you play the card only twice total.
// Play your returning Man Out of Time cards after the "Play a Villain Card" part of your turn and before you start playing out your hand.
// You "played" a Man Out of Time card on both the first turn you played it and the second turn when you replayed it, so it can help activate your Superpower Abilities on both turns.
function outOfTimeEv(ev: Ev, c: Card = ev.source) {
  moveCardEv(ev, c, playerState.outOfTime);
}
function playOutOfTimeEv(ev: Ev) {
  cont(ev, () => {
    selectCardOrderEv(ev, "Play Out of Time Heroes", playerState.outOfTime.deck, c => {
      pushEv(ev, "PLAY", { func: playCard, what: c });
      discardEv(ev, c);
    });
  });
}

// <b>Savior</b>: "Use this ability if you have at least 3 Bystanders in your Victory Pile."
// If you defeat a Villain with Bystanders, put those Bystanders into your Victory Pile before checking any Savior ability on that Villain.
// If a Hero card rescues a Bystander, that Bystander counts towards any Savior ability on that Hero.
function saviorPower(p: Player = playerState) {
  return p.victory.count(isBystander) >= 3;
}

// <b>Abomination</b>: "This Villain gets +Attack equal to the printed Attack of the Hero in the HQ space under this Villain's city space."
// "Ultimate Abomination" means "This Mastermind gets +Attack equal to the total printed Attack of all the Heroes in the HQ."
// An Abomination Villain's Attack can go up and down as the Villain moves through the city.
function abominationAmount(c: Card) {
  return (c.location.above ? c.location.above.limit(isHero).limit(hasAttackIcon).sum(c => c.printedAttack) || 0 : 0);
}
function abominationVarDefense(c: Card) {
  return c.printedDefense + abominationAmount(c);
}
function ultimateAbominationVarDefense(c: Card) {
  return c.printedDefense + (hqHeroes().limit(hasAttackIcon).sum(c => c.printedAttack) || 0);
}

// {PHASING}
// This keyword represents Heroes becoming insubstantial and moving through solid objects.
// * During your turn, if a card with Phasing is in your hand, you may swap it with the top card of your deck.
// * This lets you get a different card instead, save a crucial Phasing card for the next turn, or set up a combo that cares about the top card of your deck.
// * Swapping cards this way isn't "playing a card" or "drawing a card," so it doesn't count for other abilities that trigger on those things.
function phasingActionEv(c: Card, ev: Ev) {
  return new Ev(ev, 'EFFECT', { what: c, func: ev => swapCardsEv(ev, ev.what, playerState.deck), cost: { cond: c => c.location === playerState.hand } });
}

// <b>Fortify</b>
// This keyword represents Villains setting up nasty traps for the players.
// * Some Villains say things like "Escape: Fortify the Mastermind. While it's fortified, the Mastermind can't be fought."
// * Put this Villain on or near the specified place. While it's there, it has the listed effect. Any player can fight that Villain as normal to end that Fortify effect and put that Villain into their Victory Pile.
// * If a card would fortify a place, don't do anything if there's already a Villain fortifying that place.
function isFortifying(c: Card, d: Deck) {
  return d.attached('FORTIFY').includes(c);
}
function fortifyEv(ev: Ev, c: Card, d: Deck) {
  attachCardEv(ev, c, d, 'FORTIFY');
}
// {SHIELDCLEARANCE}
// This keyword represents pro-registration S.H.I.E.L.D. forces that can be only defeated with the help of S.H.I.E.L.D. information.
// * If a Villain says "S.H.I.E.L.D. Clearance," then you must discard a S.H.I.E.L.D. Hero as an additional cost to fight that Villain.
// * Likewise, if a Mastermind has "Double S.H.I.E.L.D. Clearance," then you must discard two S.H.I.E.L.D. Heroes each time you fight them.
// * If you are playing with HYDRA Heroes, you may discard them instead of S.H.I.E.L.D. Heroes.
function shieldClearanceCond(n: number) { return () => playerState.hand.limit(isHero).count('S.H.I.E.L.D.') >= n; }
function shieldClearanceCost(n: number) { return (ev: Ev) => selectObjectsEv(ev, "Discard S.H.I.E.L.D. Heros", n, playerState.hand.limit(isHero).limit('S.H.I.E.L.D.'), c => discardEv(ev, c)); }
const shieldClearance = { fightCond: shieldClearanceCond(1), fightCost: shieldClearanceCost(1) };

function villainify(name: string, c: Card | ((c: Card) => boolean), defense?: number | ((c: Card) => number), reward?: number | 'GAIN' | 'RESCUE' | ((ev: Ev) => void), t: "VILLAIN" | "LOCATION" = "VILLAIN") {
  const cond = c instanceof Card ? ((v: Card) => v === c) : c;
  addStatSet(t === "LOCATION" ? 'isLocation' : 'isVillain', cond, () => true);
  defense != undefined && addStatSet('defense', cond, typeof defense === "number" ? (() => defense) : defense);
  name && addStatSet('villainGroup', cond, () => name);
  if (typeof reward === "number") {
    addStatSet('vp', cond, () => reward);
  } else if (reward === "GAIN") {
    addStatSet('fight', cond, () => ev => gainEv(ev, ev.source));
  } else if (reward === "RESCUE") {
    addStatSet('fight', cond, () => ev => rescueEv(ev, ev.source));
  } else if (reward) {
    addStatSet('fight', cond, () => reward);
  }
}
function villainifyOfficer(ev: Ev, where?: Deck) {
  cont(ev, () => gameState.officer.withTop(c => { villainify(u, c, 3, 'GAIN'); enterCityEv(ev, c, where); }));
}
function villainifyOfficers(ev: Ev, n: number = 1, where?: Deck | Deck[]) {
  repeat(n + gameState.officer.attached('FORTIFY').size, i => villainifyOfficer(ev, where instanceof Array ? where[i] : where));
}
// <b>Excessive Violence</b>
// * Once per turn, you can spend one Attack point more than you need to fight a bad guy "using Excessive Violence." If you do, you get to use all the Excessive Violence abilities on Cards you've already played this turn.
// * If you've played multiple Heroes (even multiple copies of the same Hero) with the Excessive Violence keyword they would all trigger at the same time. And no, you don't get to save it for later. Stop trying to find loopholes. It's annoying.
// * If you fight with Excessive Violence, then draw or play more cards with Excessive Violence abilities later in the turn, it will be too late to use those abilities.
// * Some bad guys also have Excessive Violence abilities that let you do something awesome. If you spend one more attack point than you need to fight them, you can do that awesome thing!
function canFightWithViolence(c: Card) {
  if (turnState.pastEvents.has(e => e.type === 'FIGHT' && e.withViolence)) return false;
  // Check for artifacts triggering off violence
  if(playerState.artifact.has(c => c.trigger?.event === 'FIGHT')) return true;
  return turnState.cardsPlayed.has(c => c.excessiveViolence !== undefined) || c.excessiveViolence;
}
function playViolenceEv(ev: Ev) {
  const cards = turnState.cardsPlayed.limit(c => c.excessiveViolence !== undefined);
  if (ev.what.excessiveViolence) cards.push(ev.what);
  selectCardOrderEv(ev, "Choose Excessive Violence order", cards, c => {
    pushEv(ev, 'EFFECT', { source: c, func: c.excessiveViolence });
  });
}
// <b>Revenge</b>
// * For Villain groups that have the Revenge ability, each Villain gets +1 Attack for every Villain of that group in your Victory Pile.
// * Revenge is player specific. It will change based on the damage each player has caused to a Villain group. If you've KO'd 2 members of the Deadpool's 'Friends' Villain group then every other member of that group, that enters or is already in the city, will get +2 Attack during your turns. If another player has yet to KO'd a member of that group then the group doesn't gain any Attack. The more damage YOU do, the more that group hates YOU.
// * Revenge is not limited to just Villains either. Masterminds can also hold a grudge. Big surprise there.
function revengeVarDefense(c: Card) {
  return c.printedDefense + playerState.victory.limit(isVillain).count(c.leads ? leadBy(c) : isGroup(c.villainGroup));
}
function captureWitnessEv(ev: Ev, v: Card, n: number | Card = 1) {
  // TODO hidden witness
}

function captureShieldEv(ev: Ev, v: Card, n: number | Card = 1) {
  // TODO human shields
}
function xGenePower(c: Filter<Card>) { return playerState.discard.count(c); }
function berserkEv(ev: Ev, n: number, f?: (c: Card) => void) {
  repeat(n, () => {
    withPlayerDeckTopEv(ev, c => { addAttackEvent(ev, c.printedAttack || 0); f ? f(c) : discardEv(ev, c); });
  });
}
function addPiercingEv(ev: Ev, amount: number) {
  turnState.piercing += amount;
}
function lightShowActionEv(c: Card, ev: Ev) {
  return new Ev(ev, 'EFFECT', { cost: { cond: () => turnState.cardsPlayed.count(c => c.lightShow !== undefined) >= 2 }, source: c, func: c.lightShow });
}
function hasLightShow(c: Card) {
  return c.lightShow !== undefined;
}
function dominateEv(ev: Ev, villain: Card, hero: Card) {
  attachCardEv(ev, hero, villain, 'DOMINATED');
}
function _chooseForEachPlayerEv(ev: Ev, desc: string, players: Player[], cards: Card[], effect1: (p: Player, c: Card) => void, effect0: (c: Card) => void, agent: Player = playerState) {
  if (players.size > 0) {
    selectCardEv(ev, desc, cards, c => {
      choosePlayerLimitedEv(ev, p => {
        effect1(p, c);
        _chooseForEachPlayerEv(ev, desc, players.limit(v => v !== p), cards.limit(v => v !== c), effect1, effect0, agent);
      }, players, agent);
    }, agent);
  } else {
    cards.each(effect0)
  }
}
function chooseForEachPlayerEv(ev: Ev, desc: string, cards: Card[], effect1: (p: Player, c: Card) => void, effect0: (c: Card) => void = () => {}, agent: Player = playerState) {
  _chooseForEachPlayerEv(ev, desc, gameState.players, cards, effect1, effect0, agent);
}
function playHorrorEv(ev: Ev) {
  cont(ev, () => {
    gameState.horror.withTop(c => {
      moveCardEv(ev, c, gameState.horror, true);
      pushEffects(ev, c, undefined, c.ambush);
    })
  })
}
function addTrapAction(ev: Ev, desc: string, cond: (c: Card) => boolean, func: Handler) {
  addTurnAction(new Ev(ev, 'EFFECT', {
    what: ev.source,
    desc,
    cost: { cond: c => c.location === gameState.trap && cond(c) },
    func: ev => { func(ev); moveCardEv(ev, ev.what, playerState.victory); },
  }));
}
// Spider Man
function strikerCount(full: boolean = true) {
  let count = gameState.ko.count(isStrike) + gameState.mastermind.attached('STRIKE').count(isStrike);
  if (!full) return count;
  count += gameState.players.sum(p => p.victory.count(isStrike)); // Mysterio, Deathbird
  count += gameState.players.sum(p => p.deck.attached('BOUNTY').size); // Macho Gomez
  count += CityCards().count(isStrike); // Deathbird
  count += gameState.destroyedCitySpaces.sum(d => d.count(isStrike)); // Galactus
  return count;
}
function strikerHeroEv(ev: Ev, n: number = 1) {
  addAttackEvent(ev, n * strikerCount());
}
function strikerVarDefense(c: Card) {
  return c.printedDefense + strikerCount();
}
function dangerSenseEv(ev: Ev, amount: number, f?: (cards: Card[]) => void, helping?: (card: Card) => boolean) {
  pushEv(ev, 'DANGERSENSE', { amount, func: ev => {
    revealVillainDeckEv(ev, ev.amount, cards => {
      const amount = cards.count(isVillain)
      helping ? addTurnMod('defense', helping, amount) : addAttackEvent(ev, amount);
      f && f(cards);
    }, false, false);
  } });
}
// World War Hulk
function makeTransformingHeroCard(c1: Card, c2: Card) {
  c1.transformed = c2;
  c2.transformed = c1;
  c2.isTransformed = true;
  return c1;
}
function makeTransformingMastermindCard(c1: Card, name: string, defense: number, strike: Handler, abilities?: MastermindCardAbillities) {
  const c2 = makeMastermindCard(name, defense, c1.printedVP, c1.leads, strike, [], abilities);
  c2.backSide = c1;
  c1.backSide = c2;
  c2.isTransformed = true;
  return c1;
}
function transformMastermindEv(ev: Ev, c?: Card) {
  const m = c || (isTactic(ev.source) ? ev.source.mastermind : ev.source);
  cont(ev, () => {
    Object.setPrototypeOf(m, Object.getPrototypeOf(m.backSide));
  });
}
function transformSchemeEv(ev: Ev, c?: Card) {
  const s = c || ev.source;
  cont(ev, () => {
    Object.setPrototypeOf(s, Object.getPrototypeOf(s.backSide));
  });
}
function smashEv(ev: Ev, n: number, effect1?: (c: Card) => void) {
  selectCardOptEv(ev, "Select card to Smash", playerState.hand.deck, c => {
    discardEv(ev, c);
    addAttackEvent(ev, n * (turnState.smashMultiplier || 1));
    effect1 && effect1(c);
  });
}
function canOutwit(p: Player = playerState) {
  return yourHeroes(p).uniqueCount(c => c.cost) >= (gameState.outwitAmount ? gameState.outwitAmount() : 3);
}
function mayOutwitEv(ev: Ev, func: () => void) {
  canOutwit() && chooseMayEv(ev, "Use Outwit ability", () => pushEv(ev, 'OUTWIT', func));
}
function outwitOrEv(ev: Ev, func: () => void, p: Player = playerState) {
  canOutwit(p) ? chooseOneEv(ev, "Outwit", ["Yes", () => pushEv(ev, 'OUTWIT', () => {})], ["No", () => func()]) : func();
}
function woundedFuryEv(ev: Ev) {
  addAttackEvent(ev, playerState.discard.count(isWound));
}
function woundedFuryVarDefense(c: Card) {
  return c.printedDefense + playerState.discard.count(isWound);
}
function transformHeroEv(ev: Ev, what: Card, where: 'DECK' | 'DISCARD' | 'HAND' = 'HAND') {
  const to: Deck = where === 'DECK' ? playerState.deck : where === 'DISCARD' ? playerState.discard : playerState.hand;
  if (what.location !== gameState.transformed) {
    pushEv(ev, 'TRANSFORM', { what, to, func: ev => {
      moveCardEv(ev, ev.what, gameState.transformed);
      what.transformed && gameState.transformed.limit(c => c.cardName === what.transformed.cardName).withFirst(c => moveCardEv(ev, c, ev.to));
    } });
  }
}
function addMastermindEv(ev: Ev, name?: string) {
  // TODO add mastermind with one tactic
}
// EXPANSION: Marvel Studios Phase 1
function copyVillainTemplate(group: string, name: string, newName?: string) {
  const card = new Card('VILLAIN', name);
  Object.assign(card, findVillainTemplate(group).cards.find(([n, c]) => c.cardName === name)[1]);
  if (newName) card.cardName = newName;
  return card;
}
function copyHenchmenTemplate(name: string, newName: string) {
  const card = new Card('HENCHMEN', name);
  Object.assign(card, findHenchmanTemplate(name));
  card.cardName = newName;
  return card;
}
function copyHeroTemplate(name: string) {
  const t = {...findHeroTemplate(name)};
  for (const k of ['c1', 'c2', 'c3', 'uc', 'u2', 'ra'] as const) if (t[k]) {
    const card = t[k];
    const newCard = new Card('HERO', card.cardName);
    Object.assign(newCard, card);
    t[k] = newCard;
  }
  return t;
}
function copyMastermindTemplate(name: string) {
  const t = findMastermindTemplate(name);
  const newCard = new Card('MASTERMIND', t.cardName);
  Object.assign(newCard, t);
  newCard.tacticsTemplates = newCard.tacticsTemplates.map(t => {
    const newTactic = new Card('TACTIC', t.cardName);
    Object.assign(newTactic, t);
    return newTactic;
  });
  return newCard;
}
function copySchemeTemplate(name: string, newName?: string, params?: Pick<Card, 'params'>) {
  const card = new Card('SCHEME', name);
  Object.assign(card, findSchemeTemplate(name));
  if (newName) card.cardName = newName;
  if (params) Object.assign(card, params);
  return card;
}
// Ant Man
function empowerEv(ev: Ev, color: Filter<Card>) {
  addAttackEvent(ev, hqCards().count(color));
}
function empowerVarDefense(color: Filter<Card>, amount: number = 1) {
  return (c: Card) => (c.printedDefense || 0) + hqCards().count(color) * amount;
}
function getSizeChanging(c: Card) {
  return getModifiedStat(c, 'sizeChanging', c.sizeChanging);
}
function getUSizeChanging(c: Card) {
  return getModifiedStat(c, 'uSizeChanging', c.uSizeChanging);
}
function isSizeChanged(c: Card) {
  const color = getSizeChanging(c);
  return color && (superPower(color) > 0);
}
function hasNoSizeChanging(c: Card) {
  return !getSizeChanging(c) && !getUSizeChanging(c);
}
function uSizeChangingAmount(c: Card): number {
  const v = getUSizeChanging(c);
  if (!v) return 0;
  return Math.min(superPower(v.color), v.amount) * 2;
}
function chivalrousDuelSources() {
  const amounts = new Map<string, number>();
  pastEvents("ADDATTACK").each(ev => {
    const source = ev.getSource();
    if (ev.amount && source && source.heroName) {
      amounts.set(source.heroName, (amounts.get(source.heroName) || 0) + ev.amount);
    }
  });
  pastEvents("CHIVALROUSSPEND").each(ev => {
    amounts.set(ev.desc, amounts.get(ev.desc) - ev.amount);
  });
  return amounts;
}
function chivalrousMaxAttack() { return Math.max(...chivalrousDuelSources().values()); }
function chivalrousSpendEv(ev: Ev, amount: number) {
  const options = [...chivalrousDuelSources()].filter(([, v]) => v >= amount).map(([heroName]) => ({l: heroName, v: heroName}));
  chooseOptionEv(ev, "Choose a Hero to use for Chivalrous Duel", options, heroName => {
    pushEv(ev, "CHIVALROUSSPEND", { desc: heroName, amount, func: () => {} });
  });
}
// Venom
function digestEv(ev: Ev, amount: number, effect1: Handler, effect0?: Handler, doBoth?: number) {
  const hasDigest = playerState.victory.size >= amount;
  if (hasDigest || doBoth) effect1(ev);
  if (effect0 && (!hasDigest || doBoth)) effect0(ev);
}

function symbioteBondEv(ev: Ev, to: Card | Card[], what: Card | Card[], unbound?: Handler) {
  if (to instanceof Array) {
    selectCardEv(ev, "Choose a Villain to Bond with", to.limit(c => !isBonded(c)), c => symbioteBondEv(ev, c, what, unbound));
    return;
  }
  if (what instanceof Array) {
    selectCardEv(ev, 'Choose a Villain to Bond with', what.limit(c => !isBonded(c)), c => symbioteBondEv(ev, to, c, unbound));
    return;
  }
  if (isBonded(to) || isBonded(what)) return;
 // TODO symbiote bonding
}
function isBonded(c: Card) {
  return false;
}
function wasBonded(c: Card) {
  return false;
}
function poisonBondEv(ev: Ev, to: Card[]) {
  const cards = to.limit(c => c !== ev.source);
  if (wasBonded(ev.source) || cards.size === 0) {
    gainEv(ev, ev.source);
  } else {
    symbioteBondEv(ev, cards, ev.source);
  }
}
// Revelations
function switcherooActionEv(n: number) {
  return (c: Card, ev: Ev) => new Ev(ev, 'EFFECT', {
    what: c,
    desc: 'Switcheroo',
    source: c,
    cost: { cond: c => c.location === playerState.hand },
    func: ev => {
      moveCardEv(ev, ev.source, gameState.herodeck, true);
      selectCardOptEv(ev, "Choose a Hero", hqHeroes().limit(c => c.cost === n), c => moveCardEv(ev, c, playerState.hand));
    }
  })
}

function hyperspeedEv(ev: Ev, n: number = undefined, icon: 'ATTACK' | 'RECRUIT'| 'CHOOSE' | 'BOTH' = 'ATTACK') {
  if (icon === 'CHOOSE' && !turnState.hyperspeedBoth) {
    chooseOneEv(ev, "Choose", ["Attack", () => hyperspeedEv(ev, n, 'ATTACK')], ["Recruit", () => hyperspeedEv(ev, n, 'RECRUIT')]);
  } else {
    revealPlayerDeckEv(ev, n ? n : playerState.deck.size, cards => {
      (icon === 'ATTACK' || icon === 'BOTH' || turnState.hyperspeedBoth) && addAttackEvent(ev, cards.count(hasAttackIcon));
      (icon === 'RECRUIT' || icon === 'BOTH'  || turnState.hyperspeedBoth) && addRecruitEvent(ev, cards.count(hasRecruitIcon));
      cards.each(c => discardEv(ev, c));
    });
  }
}
const lastStandAmount = () => gameState.city.count(isCityEmpty);
function lastStandEv(ev: Ev) {
  addAttackEvent(ev, lastStandAmount());
}
function lastStandVarDefense(n: number = 1) {
  return (c: Card) => c.printedDefense + lastStandAmount() * n;
}
const darkMemoriesAmount = () => numClasses(playerState.discard.deck);
function darkMemoriesEv(ev: Ev) {
  addAttackEvent(ev, darkMemoriesAmount());
}
function darkMemoriesVarDefense(n: number = 1) {
  return (c: Card) => c.printedDefense + darkMemoriesAmount() * n;
}
function cityHasLocation(name: string) {
  const cityLocations = gameState.city.map(c => c.attached("LOCATION"));
  return cityLocations.some(locs => locs.some(loc => loc.cardName.includes(name)));
}
function cityAllLocations() {
  return gameState.city.map(c => c.attached("LOCATION")).merge();
}
function lethalLegionVarDefense(name: string) {
  return (c: Card) => c.printedDefense + (cityHasLocation(name) ? 3 : 0);
}
function fightVillainAtLocationEachOtherPlayerTrigger(effect: (ev: Ev, p: Player) => void): Trigger {
  return {
    event: 'FIGHT',
    match: (ev, source) => isVillain(ev.what) && ev.what.location === source.location.attachedTo,
    after: ev => eachOtherPlayerVM(p => effect(ev, p)),
  };
}
// S.H.I.E.L.D.
function sendUndercoverEv(ev: Ev, c: Card = ev.source, p?: Player) {
  addStatSet("vp", c1 => c1 === c && owner(c1) && c1.location === owner(c1).victory, () => 1);
  moveCardEv(ev, c, (p || owner(c) || playerState).victory);
}
function chooseUndercoverEv(ev: Ev, func: Handler | undefined = undefined, c: Card = ev.source) {
  chooseMayEv(ev, "Send Undercover", () => {
    sendUndercoverEv(ev, c);
    func && cont(ev, func);
  });
}
function isShieldOrHydraInAnyWay(c: Card) {
  if (isShieldOrHydra(c)) return true;
  const names = [c.cardName, c.heroName, c.mastermind && c.mastermind.cardName, c.villainGroup].filter(name => name);
  if (names.some(name => name.includes('S.H.I.E.L.D.'))) return true;
  if (names.some(name => name.includes('HYDRA') || name.includes("Hydra"))) return true;
  return false;
}
function isHydraInAnyWay(c: Card) {
  if (isTeam('HYDRA')(c)) return true;
  const names = [c.cardName, c.heroName, c.mastermind && c.mastermind.cardName, c.villainGroup].filter(name => name);
  if (names.some(name => name.includes('HYDRA') || name.includes("Hydra"))) return true;
  return false;
}
function shieldLevel() {
  return playerState.victory.count(isShieldOrHydraInAnyWay);
}
function hydraLevel() {
  return gameState.escaped.count(isShieldOrHydraInAnyWay);
}
const shieldLevelPower = (n: number) => shieldLevel() >= n;
const hydraLevelPower = (n: number) => hydraLevel() >= n;

// Heroes of Asgard
function worthyPower(p: Player = playerState) {
  return yourHeroes(p).has(c => c.cost >= 5);
}
function isConquering(...locations: CityLocation[]) {
  return locations.count(l => gameState.city.limit(d => d.id === l).has(c => c.has(isVillain)));
}
function isDestroyedConqueror(location: CityLocation) {
  return turnState.destroyedConqueror && gameState.destroyedCitySpaces.has(d => d.id === location);
}
function heroConquerorEv(ev: Ev, l: CityLocation, amount: number) {
  (isConquering(l) || isDestroyedConqueror(l)) && addAttackEvent(ev, amount);
}
function conquerorVarDefese(amount: number, ...l: CityLocation[]) {
  return (c: Card) => c.printedDefense + (isConquering(...l) * amount);
}
function conquerorAbility(amount: number, ...l: CityLocation[]) {
  return ({ conqueror: { amount, locations: l }});
}
const weaponsInTheCity = () => cityVillains().map(c => c.attached('WEAPONS')).merge();
const weaponsPlayersOwn = () => gameState.players.map(p => [...p.discard.limit(isVillainousWeapon), ...p.artifact.limit(isVillainousWeapon)]).merge();
const weaponsAnywhere = () => [...weaponsInTheCity(), ...weaponsPlayersOwn()];

// New Mutants
const sunlightAmount = () => hqHeroes().count(c => (c.printedCost % 2) === 0);
const moonlightAmount = () => hqHeroes().count(c => (c.printedCost % 2) === 1);
const sunlightPower = () => sunlightAmount() > moonlightAmount();
const moonlightPower = () => moonlightAmount() > sunlightAmount();

function wakingNightmareEv(ev: Ev, p: Player = playerState) {
  selectCardEv(ev, "Choose a card to discard", p.hand.limit(isNonGrayHero), c => {
    discardEv(ev, c);
    drawEv(ev, 1, p);
  }, p);
}
function wakingNightmareOptEv(ev: Ev, p: Player = playerState) {
  selectCardOptEv(ev, "Choose a card to discard", p.hand.limit(isNonGrayHero), c => {
    discardEv(ev, c);
    drawEv(ev, 1, p);
  }, () => {}, p);
}

// Into the Cosmos

function burnShardActionEv(ev: Ev, amount: number | (() => boolean), effect: (ev: Ev) => void) {
  const what = ev.source;
  const cond = typeof amount === "number" ? () => playerState.shard.size >= amount : amount;
  const cost: ActionCost = {
    cond: () => !countPerTurn('burn', what) && cond()
  };
  const func = (ev: Ev) => {
    incPerTurn('burn', what);
    if (typeof amount === "number") repeat(amount, () => spendShardEv(ev));
    effect(ev);
  };
  return new Ev(ev, 'EFFECT', { what, func, cost });
}
function setBurnShardEv(ev: Ev, cost: number | (() => boolean), f: Handler) {
  addTurnAction(burnShardActionEv(ev, cost, f));
}

function giveCosmicThreat(what: Card, color: number) {
  addTurnSet('cosmicThreat', c => c === what, () => color);
  addTurnSet('cardActions', c => c === what, (c, v) => v.includes(cosmicThreatAction) ? v : [ ...v, cosmicThreatAction ]);
}

function contestOfChampionsEv(ev: Ev, color: Filter<Card>, effect1: ((p: Player) => void), effect0: ((p: Player) => void), effectEvil: (() => void), evilCount: number = 2) {
  const champs = new Map<Player, Card>();
  eachPlayer(p => selectCardOptEv(ev, "Choose a Champion", p.hand.limit(isHero), c => {
    champs.set(p, c);
  }, () => revealPlayerDeckEv(ev, 1, cards => cards.each(c => {
    champs.set(p, c);
  }), p), p));
  revealHeroDeckEv(ev, evilCount, evilChamps => {
    const goodChamps = champs.values();
    const champValue = (c: Card) => c.cost * ([c].has(color) ? 2 : 1) +
      (gameState.contestOfCampionsEvilBonus && evilChamps.includes(c) ? gameState.contestOfCampionsEvilBonus : 0);
    const winningScore = [...goodChamps, ...evilChamps].max(champValue);
    eachPlayer(p => cont(ev, () => !(champs.get(p) && champValue(champs.get(p)) === winningScore) && effect0(p)));
    eachPlayer(p => cont(ev, () => champs.get(p) && champValue(champs.get(p)) === winningScore && effect1(p)));
    evilChamps.has(c => champValue(c) === winningScore) && cont(ev, effectEvil);
  }, false, true);
}

function celestialBoonActionEv(func: (ev: Ev) => void, cond?: (c: Card) => boolean) {
  return (c: Card, ev: Ev) => new Ev(ev, 'EFFECT', {
    desc: 'Celestial Boon',
    source: c,
    cost: { cond: c => c.location === playerState.hand && (!cond || cond(c)) && !countPerTurn('boon', c)},
    func: ev => { incPerTurn('boon', c); func(ev); },
  })
}

function isOtherPlayerVM(p: Player) { return gameState.advancedSolo || p !== playerState; }

// Realm of Kings
function thronesFavorGainEv(ev: Ev, who: Card | Player = playerState) {
  cont(ev, () => gameState.thronesFavorHolder = who);
}
function thronesFavorSpendEv(ev: Ev) {
  cont(ev, () => gameState.thronesFavorHolder = undefined);
}

function thronesFavorGainOrEv(ev: Ev, effect1: (ev: Ev) => void, who: Card | Player = playerState) {
  gameState.thronesFavorHolder === who ? effect1(ev) : thronesFavorGainEv(ev, who);
}
function thronesFavorGainOrSpendEv(ev: Ev, effect1: (ev: Ev) => void, who: Card) {
  thronesFavorGainOrEv(ev, ev => (thronesFavorSpendEv(ev), effect1(ev)), who);
}
function thronesFavorGainOrMaySpendEv(ev: Ev, effect1: (ev: Ev) => void, who: Player = playerState) {
  thronesFavorGainOrEv(ev, ev => chooseMayEv(ev, "Spend Throne's Favor", () => {
    thronesFavorSpendEv(ev);
    effect1(ev);
  }, who), who);
}
const mastermindHasThronesFavor = () => gameState.thronesFavorHolder instanceof Card && isMastermind(gameState.thronesFavorHolder);
function heroHighestAbominationEv(ev: Ev) {
  addAttackEvent(ev, hqHeroes().max(c => c.printedAttack) || 0);
}
function heroAbominationEv(ev: Ev, l: CityLocation) {
  addAttackEvent(ev, hqHeroes().limit(c => c.location.id === l).max(c => c.printedAttack) || 0);
}
function doubleAbominationVarDefense(c: Card) {
  return c.printedDefense + 2 * (c.location.above ? c.location.above.limit(isHero).limit(hasAttackIcon).sum(c => c.printedAttack) || 0 : 0);
}
// Annihilation
function hasMomentum(c: Card) {
  return turnState.pastEvents.has(ev => ev.type == 'MOVECARD' && ev.what == c && ev.to.isCity);
}
function momentumVarDefense(n: number) {
  return (c: Card) => c.printedDefense + (hasMomentum(c) ? n : 0);
}
function massMomentumVarDefense(n: number) {
  return (c: Card) => c.printedDefense + n * cityVillains().count(hasMomentum);
}
function setFocusWithAttackEv(ev: Ev, attack: number, f: Handler, limit?: number) {
  addTurnAction(focusActionEv(ev, { attack }, f, limit));
}
// EXPANSION Messiah Complex
function tacticalFormation(code: string) {
  const heroes = yourHeroes();
  return [...Array(10).keys()].every(n => heroes.count(c => c.cost === n) >= (code.split(n.toString()).length - 1));
}
function cloneHeroEv(ev: Ev, c: Card = ev.source) {
  const cardName = c.cardName;
  const hqOptions = hqHeroes().limit(c => c.cardName === cardName);
  if (hqOptions.size) {
    selectCardEv(ev, "Choose a Hero to Clone", hqOptions, c => gainEv(ev, c));
  } else {
    gameState.herodeck.limit(c => c.cardName === cardName).withFirst(c => gainEv(ev, c));
    cont(ev, () => gameState.herodeck.shuffle());
  }
}
function _cloneVillain(ev: Ev) {
  const cardName = ev.parent.source.cardName;
  gameState.villaindeck.limit(c => c.cardName === cardName).withFirst(c => enterCityEv(ev, c));
  cont(ev, () => gameState.villaindeck.shuffle());
}
function cloningInProgress(ev: Ev) {
  for (let e = ev; e; e = e.parent) if (e.func === _cloneVillain) return true;
  return false;
}

function cloneVillainEv(ev: Ev) {
  cloningInProgress(ev) || cont(ev, _cloneVillain);
}
function shatterSelectEv(ev: Ev, c: Card[]) {
  selectCardEv(ev, "Choose a card to shatter", c, c => shatterEv(ev, c));
}
function shatterAllEv(ev: Ev, c: Card[]) {
  c.each(c => shatterEv(ev, c));
}
const shatterAmount = (n: number) => -Math.floor(n / 2);
function shatterEv(ev: Ev, c: Card) {
  if (isHero(c)) {
    addTurnMod('cost', v => c === v, shatterAmount(c.cost));
  } else if (isVillain(c)) {
    addTurnMod('defense', v => c === v, shatterAmount(c.defense));
  } else if (isMastermind(c)) {
    let amount = shatterAmount(c.defense);
    addTurnMod('defense', v => c === v, () => amount);
    addTurnTrigger('FIGHT', ev => ev.what === c, () => amount = 0);
  }
}
function isPreying(c: Card) {
  return gameState.players.some(p => p.playArea.attachedDeck('PREYING') === c.location);
}
function finishThePreyEv(ev: Ev, card: Card) {
  eachPlayer(p => {
    if(card.location === p.playArea.attachedDeck('PREYING')) {
      pushEv(ev, "EFFECT", { source: card, who: p, func: card.finishThePrey });
      if (isMastermind(card)) moveCardEv(ev, card, gameState.mastermind);
      else enterSewersEv(ev, card, true);
    }
  });
}
function preyEv(ev: Ev, handScore: (p: Player) => number, immediateEffect?: (p: Player) => void, card: Card = ev.source) {
  choosePlayerLimitedEv(ev, p => {
    attachCardEv(ev, card, p.playArea, 'PREYING');
    const setupTrigger = () => {
      addTurnTrigger('CLEANUP', u, ev => finishThePreyEv(ev, card));
      if (isMastermind(card)) addTurnTrigger('DEFEAT', ev => ev.what === card, ev => {
        if (card.attached("TACTICS").size) moveCardEv(ev, card, gameState.mastermind);
      });
    }
    if (p == playerState) setupTrigger(); else addFutureTrigger(setupTrigger, p);
    immediateEffect && cont(ev, () => immediateEffect(p));
  }, gameState.players.highest(handScore), playerState);
}
// EXPANSION Doctor Strange and the Shadows of Nightmare
function useRitualArtifactAction(cond: (what: Card) => boolean, anyTurn: boolean = false) {
  return (c: Card, ev: Ev) => new Ev(ev, 'USEARTIFACT', {
    what: c, source: c,
    cost: { cond: c => isControlledArtifact(c, anyTurn) && cond(c) },
    func: ev => {
      const f = () => {
        getArtifactEffects(ev.what)[0](ev);
        discardEv(ev, ev.what);
      }
      playerState === owner(ev.what) ? f() : chooseMayEv(ev, "Use Ritual Artifact", f, owner(ev.what));
    }
  });
}

function ritualArifact(cond: (what: Card) => boolean, anyTurn: boolean = false) {
  return {
    isArtifact: true,
    cardActions: [useRitualArtifactAction(cond, anyTurn)],
  }
}
function demonicBargain(ev: Ev, effect: ((ev: Ev) => void) | [(ev: Ev) => void, (ev: Ev) => void], p: Player = playerState) {
  withPlayerDeckTopEv(ev, c => {
    discardEv(ev, c);
    c.cost > 0 && gainWoundEv(ev, p);
  }, p);
  cont(ev, () => {
    const gainCount = pastEvents('GAIN').count(ev2 => ev2.parent === ev);
    textLog.log(`Demonic Bargain: ${gainCount === 0 ? 'resisted' : 'corrupted'}`);
    const e = effect instanceof Array ? effect[gainCount] : effect;
    e(ev);
  });
}
function enterAstralPlaneEv(ev: Ev, c: Card) {
  moveCardEv(ev, c, gameState.astralPlane);
}
// Marvel Studios' Guardians of the Galaxy
function canRecruitWithKindness(c: Card) {
  if (turnState.pastEvents.has(e => e.type === 'RECRUIT' && e.withViolence)) return false;
  return turnState.cardsPlayed.has(c => c.excessiveKindness !== undefined);
}
function playKindnessEv(ev: Ev) {
  const cards = turnState.cardsPlayed.limit(c => c.excessiveKindness !== undefined);
  // TODO: it is not super clear but I guess kidness of the card just recruited should not trigger
  // if (ev.what.excessiveKindness) cards.push(ev.what);
  selectCardOrderEv(ev, "Choose Excessive Kindness order", cards, c => {
    pushEv(ev, 'EFFECT', { source: c, what: ev.what, func: c.excessiveKindness });
  });
}
function triggeredArifact(event: TriggerableEvType, cond: (ev: Ev, source: Card) => boolean, selfTrigger: boolean = false): HeroCardAbillities {
  return {
    isArtifact: true,
    trigger: {
      event,
      match: (ev, source) => owner(source) === playerState && (source.location === owner(source)?.artifact || (selfTrigger && ev.what === source)) && cond(ev, source),
      after: ev => getArtifactEffects(ev.source)[0](ev),
    }
  }
}
// <b>Command</b>:
// Some Villains say things like "Taserface gets +2 Attack while he Commands the Ravagers."
// * <b>A Villain "Commands" their group and gets these abilities as long as it's the leftmost Villain of that Villain Group in the city.</b>
// * If there's only one Villain of a Villain Group in the city, it still Commands that Villain Group.
function isCommanding(c: Card) {
  return cityVillains().limit(c2 => c2.villainGroup === c.villainGroup)[0] === c;
}
function commandingVarDefense(n: number, m: number = 0) {
  return (c: Card) => c.printedDefense + (isCommanding(c) ? n : m);
}
function wasCommanding(ev: Ev) {
  if (ev.parent.type !== 'DEFEAT') throw new Error("wasCommanding can only be used on DEFEAT events");
  return gameState.city.reduce(([commanding, passed], l) => [commanding && (passed || !l.has(isGroup(ev.parent.what.villainGroup))), passed || (l === ev.parent.where)], [true, false])[0];
}
// EXPANSION: Black Panther
function heroAmbush(cond: Filter<Card>, func: Handler): HeroCardAbillities {
  return {
    heroAmbush: ev => revealable().has(cond) && chooseMayEv(ev, "Use Hero Ambush", () => func(ev))
  }
}
function woundEnemyEv(ev: Ev, enemy: Card, amount: number = 1) {
  repeat(amount, () => cont(ev, () => {
    const options = [gameState.ko.limit(isWound), gameState.wounds.deck.firstOnly()].merge();
    selectCardEv(ev, "Choose a Wound", options, c => {
      attachCardEv(ev, c, enemy, 'WOUND');
    });
  }));
}
function payToWoundEv(effect?: Handler): Card['cardActions'][0] {
  return (c, ev) => new Ev(ev, "EFFECT", { what: c, cost: {cond: c => c.defense > 0 && isFightable(c), attack: c.defense}, func: ev => {
    woundEnemyEv(ev, ev.what);
    effect?.(ev);
  }})
}
function empowerRecruitEv(ev: Ev, color: number) {
  addRecruitEvent(ev, hqCards().count(color));
}
const stableEmpowerVarDefense = new Map([
  Color.COVERT, Color.INSTINCT, Color.RANGED, Color.STRENGTH, Color.TECH
].map(c => [c, empowerVarDefense(c)]));
function empoweringVillainGroup(g: string) {
  return empoweringVillains(villains().limit(isGroup(g)))
}
function empoweringVillains(cards: Card[]) {
  return [...stableEmpowerVarDefense.entries()].filter(([, f]) => cards.limit(c => c.varDefense === f)).reduce((acc, [c]) => acc | c, 0);
}
// EXPANSION: Black Widow
function dodgeCardEv(ev: Ev, c: Card) {
  pushEv(ev, 'DODGE', { what: c, func: ev => { discardEv(ev, ev.what); drawEv(ev); } });
}
function unleashFromUndercoverEv(ev: Ev, filter: Filter<Card> = () => true, p: Player = playerState) {
  selectCardOptEv(ev, "Choose a hero to unleash", p.victory.limit(isHero).limit(filter), c => moveCardEv(ev, c, p.hand), u, p);
}
function whenRecruitedSendUndercover(ev: Ev) {
  ev.source.location !== playerState.victory && sendUndercoverEv(ev, ev.source);
  // TODO possibly move to victory ealier as part of wall crawl / soaring resolution to match the rulebook (choice of destination when recruited)
  // this can be hacked by matching the whenRecruited field to this specific function
}
// EXPANSION: Marvel Studios The Infinity Saga
function isEndgame(c: Card) {
  return getModifiedStat(c, 'isEndgame', gameState.villaindeck.size <= 8 * gameState.players.size);
}
function endgameVarDefense(n: number) {
  return (c: Card) => c.printedDefense + (isEndgame(c) ? n : 0);
}
function sacrificeEv(ev: Ev, color: number, effect: Handler) {
  const what = ev.source;
  superPower(color) && chooseMayEv(ev, "Sacrifice", () => {
    KOEv(ev, what);
    pushEv(ev, 'EFFECT', effect);
  });
}
// EXPANSION: Midnight Sons
function bloodFrenzyAmount(p: Player = playerState) {
  return p.victory.deck.uniqueCount(c => c.vp);
}
function bloodFrenzyEv(ev: Ev) {
  addAttackEvent(ev, bloodFrenzyAmount());
}
function bloodFrenzyRecruitEv(ev: Ev) {
  addRecruitEvent(ev, bloodFrenzyAmount());
}
function bloodFrenzyVarDefense(n: number = 1) {
  return (c: Card) => c.printedDefense + bloodFrenzyAmount() * n;
}
// <b>Hunt for Victims</b>: Some sadistic Villains say "Ambush: Hunt for Victims."
// * This means <b>"KO a Bystander that is captured by any Enemy or from the Escape Pile. If you can't, then this captures a Bystander instead."</b>
// * If a player fights Lilith, and her Mastermind Tactic Hunts for Victims and captures a Bystander, the player doesn't immediately rescue that Bystander.
function huntForVictimsEv(ev: Ev, hunter: Card = ev.source, whenKOed?: (c: Card) => void) {
  selectCardOrEv(ev, "Choose a Victim", [...cityVillains().flatMap(c => c.captured.limit(isBystander)), ...gameState.escaped.limit(isBystander)], c => {
    KOEv(ev, c);
    whenKOed && cont(ev, () => whenKOed(c));
  }, () => {
    captureEv(ev, hunter);
  });
}
// <b>Haunt</b>: Zarathos and his Fallen can control Heroes' bodies like twisted puppets, saying things like "Ambush: This Villain Haunts the rightmost Hero in the HQ."
// * This means: <b>Tuck this Villain beneath that Hero, 'Haunting' it, so you can see the Villain's name. Players can't recruit the Haunted Hero while the Haunting Villain is under it.</b>
// * Instead, a player can spend Attack equal to the Haunted Hero's cost to "exorcise" that Haunted Hero. If a player does, they either KO the Haunted Hero or choose a player
// to gain it. Then the Haunting Villain enters the city, ignoring any Ambush effects it has.
// * While a Villain is Haunting a Hero, you can't fight the Haunting Villain itself – you have to spend Attack to exorcise the Haunted Hero first, driving the Haunting Villain
// into the city so you can finish it off there.
// * A Hero can't be Haunted by two Villains at once. Haunt abilities all say to Haunt an "unhaunted Hero."
// * Zarathos's Master Strikes and Mastermind Tactics can cause him to Haunt Heroes in the same way.
// Exorcizing that Hero drives Zarathos back to the Mastermind space.
// * A “Haunted Hero” is still a Hero, so it can still be affected by things that affect Heroes in the HQ. A Villain escaping the city that KOs a Hero from the HQ 
// (that costs 6 or less) can KO a Haunted Hero. Card effects that let you "gain a Hero from the HQ" or "Put a Hero from the HQ on the bottom of the Hero Deck" still
// work on Haunted Heroes. However, card effects that say "recruit a Hero from the HQ for free" don’t work on Haunted Heroes, since you can't recruit them.
// * If something causes a Haunted Hero to leave the HQ, then the Haunting Villain stays in that HQ space and Haunts the new Hero that arrives to refill that HQ space.
// * If an HQ space is "destroyed," KO any Haunted Hero there and the Haunting Villain there enters the city, ignoring any Ambush effects.
function hauntEv(ev: Ev, d: Card, c: Card = ev.source) {
  attachCardEv(ev, c, d.location, 'HAUNTED');
}
function unhauntedHQHeroes() {
  return hqHeroes().limit(c => !c.location.attached('HAUNTED').size);
}
function isHaunting(c: Card) {
  return c.location.attachedTo instanceof Deck && c.location.attachedTo.attached('HAUNTED').includes(c);
}
function returnFromHauntEv(ev: Ev, c: Card) {
  if (isMastermind(c)) moveCardEv(ev, c, gameState.mastermind);
  else enterCityEv(ev, c, u, u, true);
};
function exorciseCardActionEv(ev: Ev, c: Card) {
  return new Ev(ev, 'EFFECT', {
    what: c,
    where: c.location,
    cost: { attack: c.cost },
    func: ev => {
      console.log("Exorcise", ev.what);
      selectCardOrEv(ev, "Choose a player to gain the Haunted Hero", gameState.players, p => {
        gainEv(ev, c, p);
      }, () => {
        KOEv(ev, ev.what);
      });
      ev.where.attached('HAUNTED').each(c => returnFromHauntEv(ev, c));
    }
  });
}
// EXPANSION: What If...?
function whatIfEv(ev: Ev, effect: (c: Card) => void) {
  const classOptions = [{l:'Strength', v:Color.STRENGTH},
    {l:'Instinct', v:Color.INSTINCT},
    {l:'Covert', v:Color.COVERT},
    {l:'Tech', v:Color.TECH},
    {l:'Ranged', v:Color.RANGED}].filter(({v}) => playerState.deck.has(v));
  const nameOptions = splitDivided(playerState.deck.deck).unique(c => c.heroName).limit(n => !!n).sort().map(n => ({l:n, v:n}));
  const options = [...classOptions, ...nameOptions];
  chooseOptionEv<string | number>(ev, "What If...?", options, choice => {
    let c: Card;
    revealPlayerDeckEv(ev, 1, cards => {
      selectCardOptEv(ev, "Choose a card to discard", cards, c => discardEv(ev, c));
      const passed = typeof choice === 'string' ? splitDivided(cards).has(c => c.heroName === choice) : cards.has(choice); // TODO: abstract divided heroName checks
      if (passed) c = cards[0];
    });
    cont(ev, () => c && effect(c));
  });
}
function liberateEv(ev: Ev, n: number) {
 addAttackSpecialEv(ev, c => isMastermind(c) || c.captured.has(isBystander), n);
}
function soulbindEv(ev: Ev, cond: number | Affiliation, effect: (c: Card) => void, limit: Filter<Card> = isVillain, n: number = 1) {
  let bound: Card;
  if (cond && !superPower(cond)) return;
  if (n > 1) chooseMayEv(ev, "Use Soulbind", () => selectObjectsEv(ev, "Choose cards to Soulbind", n, playerState.victory.limit(limit), c => {
    bound = c;
    attachCardEv(ev, c, playerState.victory, 'SOULBIND');
  }));
  else selectCardOptEv(ev, "Choose a card to Soulbind", playerState.victory.limit(limit), c => {
    bound = c;
    attachCardEv(ev, c, playerState.victory, 'SOULBIND');
  });
  cont(ev, () => bound && effect(bound));
}
function soulBindSelfCardAction(effect: (ev: Ev) => void) {
  return (c: Card, ev: Ev) => new Ev(ev, 'EFFECT', {
    what: c,
    cost: { cond: c => c.location === playerState.victory },
    func: ev => {
      attachCardEv(ev, c, playerState.victory, 'SOULBIND');
      effect(ev);
    },
  });
}
function forceSoulbindEv(ev: Ev, cond: Filter<Card> = isVillain, p: Player = playerState, effect0?: () => void) {
  selectCardOrEv(ev, "Choose a card to Soulbind", p.victory.limit(cond), c => {
   attachCardEv(ev, c, playerState.victory, 'SOULBIND');
  }, effect0, p);
}
// EXPANSION: Ant-Man and the Wasp
function anticsEv(ev: Ev, effect: Handler) {
  if (revealable().count(c => c.cost === 1 || c.cost === 2 || !!getSizeChanging(c) || !!getUSizeChanging(c)) >= 3) {
    effect(ev);
  }
}
function exploreEv(ev: Ev, effect: (c: Card) => void) {
  pushEv(ev, 'EXPLORE', ev => selectCardEv(ev, "Choose a Hero to put on the bottom of the Hero Deck", hqHeroes(), c1 => {
    revealHeroDeckEv(ev, 2, cards => {
      selectCardEv(ev, "Choose a Hero to put in the HQ", cards, c2 => {
        swapCardsEv(ev, c1, c2);
        cont(ev, () => moveCardEv(ev, c1, gameState.herodeck, true));
        cont(ev, () => effect(c2));
      });
    }, false, true);
  }));
}
function heistAction(ev: Ev) {
  return new Ev(ev, 'HEIST', {
    desc: 'Attempt a Heist',
    func: ev => {
      revealVillainDeckEv(ev, 1, cards => cards.each(c => {
        const ourValue = yourHeroes().uniqueCount(c => c.cost);
        const theirValue = c.printedVP || 0;
        textLog.log(`Heist: Us ${ourValue} vs Them ${theirValue}`);
        if (theirValue > ourValue) {
          gainWoundEv(ev);
        } else if (theirValue < ourValue) {
          const cards = turnState.pastEvents.limit(ev => (ev.type === 'PLAY' || ev.type === 'DEFEAT') && !!ev.what.heist).map(ev => ev.what);
          if (gameState.scheme.top.heist) cards.push(gameState.scheme.top);
          selectCardOrderEv(ev, "Choose Heist order", cards, c1 => {
            pushEv(ev, 'EFFECT', { source: c1, what: c, func: c1.heist });
          });
        }
      }));
    }
  });
}
function canHeist() {
  return turnState.pastEvents.has(ev => (ev.type === 'PLAY' || ev.type === 'DEFEAT') && !!ev.what.heist) &&
    !turnState.pastEvents.has(ev => ev.type === 'HEIST');
}
function doubleCrossEv(ev: Ev, p: Player = playerState) {
  // TODO: multiplayer reveal
  const highestDoubles = p.hand.limit(c => p.hand.has(c1 => c !== c1 && c1.cost === c.cost)).highest(c => c.cost);
  pickDiscardEv(ev, 1, p, c => highestDoubles.includes(c));
}
function anyDeck() {
  // TODO this is not all decks
  return [...gameState.players.map(p => p.deck),
    gameState.villaindeck, gameState.herodeck, gameState.bystanders, gameState.sidekick, gameState.wounds, gameState.officer];
}
// Dr. Bill Foster riddle
function drBillFosterOptions(costs: number[] = playerState.hand.deck.map(c => c.cost)) {
  const options: [number, number, number][] = [];
  costs.sort((a, b) => b - a);
  for (let i = 0; i < costs.length;) {
    if (costs[i] === 0) break;
    for (let j = i + 1; j < costs.length;) {
      for (let k = j + 1; k < costs.length;) {
        if (costs[i] === costs[j] + costs[k]) options.push([costs[i], costs[j], costs[k]]);
        k++;
        while(k < costs.length && costs[k] === costs[k - 1]) k++;
      }
      j++;
      while(j < costs.length && costs[j] === costs[j - 1]) j++;
    }
    i++;
    while(i < costs.length && costs[i] === costs[i - 1]) i++;
  }
  return options;
}
// EXPANSION: 2099
// <b>Cyber-Mods for Heroes</b>: In 2099, weak organic flesh is quickly becoming obsolete. Desperate Heroes work with underground hacker-docs to augment their bodies with cybernetic enhancements, unleashing raw power. This is represented by the new Cyber-Mod keyword. Some Heroes say things like "{CYBER-MOD TECH} Draw a card."
// * <b>You may use a Cyber-Mod ability only if you have a card of the listed Hero Class in your Victory Pile.</b>
// * Likewise, you can use "Cyber-Mod [Ranged][Ranged][Ranged]: You get +2 Attack" only if you have at least 3 [Ranged] cards in your Victory Pile.
// * The Heroes that use Cyber-Mods have ways to send cards Undercover. This can help you put the right cards into your Victory Pile to activate your Cyber-Mods.
// * The cyber-tech that infused Hulk 2099 with gamma rays lets him push his pain under the surface, channeling it into ever more strength and rage. Accordingly, Hulk 2099 can send <i>Wounds</i> Undercover and use "Cyber-Mod Wound" abilities in the same way.
function cyberModEv(ev: Ev, limit: Filter<Card>, min: number, effect: (n: number) => void) {
  const amount = playerState.victory.count(limit);
  amount >= min && effect(amount);
}

// <b>Cyber-Mods for Enemies</b>: The corporations, bounty hunters, and enforcers of 2099 also enhance their abilities with deadly cybernetic tech, often scavenged from captured victims. Some enemies say things like "{CYBER-MOD COVERT COVERT COVERT} This gets +3 Attack.
// * <b>Villains and Masterminds use their Cyber-Mod abilities only while there are cards of the listed Hero Classes in the Escape Pile.</b>
// * Likewise, if a Villain says "<b>Fight — Cyber-Mod</b> [Tech]: KO one of your Heroes", use that ability only if there is a [Tech] card in the Escape Pile.
function cyberModEnemyAmount(limit: Filter<Card>) {
  return gameState.escaped.count(limit);
}
function cyberModEnemyEv(ev: Ev, limit: Filter<Card>, min: number, effect: (n: number) => void) {
  const amount = cyberModEnemyAmount(limit);
  amount >= min && effect(amount);
}
// {FATED FUTURE}: Marvel 2099 shows a chilling vision of what could come to pass if the characters of the Marvel Universe don't change Earth's fate.
// Sometimes fate can seem inevitable... until someone finds the courage to turn the future in a new direction. This is represented by the new Fated Future keyword.
// * <b>When you play a card with Fated Future, you may put it on the bottom of your deck.</b>
function fatedFutureEv(ev: Ev) {
  chooseMayEv(ev, "Put this card on the bottom of your deck", () => {
    moveCardEv(ev, ev.source, playerState.deck, true);
  })
}
// EXPANSION: Weapon X
// {WEAPON X SEQUENCE}: The lethal success of the Weapon Plus program comes from their relentless iteration on the science of death. From Weapon XII to Weapon XIII to Weapon XV, each of their sequence of killers is more deadly than the last.
// * On a Hero, "Weapon X Sequence" means <b>"you get + Attack equal to the longest sequence of different printed cost numbers on your cards."</b>
// * "Your cards" includes both cards you've played this turn and cards in your hand, so you can count both.
// * For example, say your cards have the costs 0,4,2,7,3,3. Then each time you played a card with the Weapon X Sequence ability, you would get +3 Attack, since your longest sequence of different cost numbers is 2-3-4.
// * Each number in the sequence must be one higher than the previous number. Your sequence can start with any number, including 0. You can't skip any number in the sequence. Having duplicates of the same cost doesn't help. If your costs are 0,0,0,4,4,6, then your longest sequence is 1 and you would get +1 Attack.
// * After you play a Weapon X Sequence card, if you draw more cards later in the turn that would have extended your sequence, it's too late to go back and get more Attack from the Weapon X Sequence you already played.
// * "Doubled Weapon X Sequence" means double the bonus.
// * Build your deck carefully to get long sequences!
function weaponXSequenceAmount(cards: Card[] = revealable()) {
  const costs = cards.unique(c => c.cost).sort((a, b) => a - b);
  let maxRun = 0, currentRun = 1;
  for (let i = 1; i < costs.length; i++) {
    if (costs[i] === costs[i - 1] + 1) currentRun++; else currentRun = 1;
    maxRun = Math.max(maxRun, currentRun);
  }
  return maxRun;
}
function weaponXSequenceEv(ev: Ev) {
  addAttackEvent(ev, weaponXSequenceAmount());
}
function berserkWoundsEv(ev: Ev, n: number) {
  repeat(n, () => {
    gameState.wounds.withTop(c => { addAttackEvent(ev, c.printedAttack || 0); moveCardEv(ev, c, gameState.wounds, true); });
  });
}
function isEnragingWound(c: Card) {
  return isWound(c) && c.heal === enragingWoundHeal;
}
// based on Uru Enchanted Weapons
const enemyBerserkTrigger: (amount: number | ((c: Card) => number)) => Trigger = amount => ({
  event: 'FIGHT',
  match: (ev, source) => ev.what === source,
  before: ev => {
    const n = typeof amount === "function" ? amount(ev.parent.what) : amount;
    let sum = 0;
    let cards: Card[] = [];
    addTurnMod('defense', c => c === ev.parent.what, () => sum);
    repeat(n, () => {
      withPlayerDeckTopEv(ev, c => {
        textLog.log(`Berserk: ${c.cardName}, +${c.printedAttack || 0} attack`);
        cards.push(c);
        discardEv(ev, c);
        sum += c.printedAttack || 0;
      });
    });
    cont(ev, () => {
      cards.each(c => pushEv(ev, 'URUENCHANTEDREVEAL', { what: c, func: () => {}}));
    })
    cont(ev, () => ev.parent.cost = getFightCost(ev.parent.what));
    cont(ev, () => sum = 0);
  },
});
function enemyBerserkCards(ev: Ev) {
  return turnState.pastEvents.filter(e => e.type === 'URUENCHANTEDREVEAL' && getFightEvent(e) === getFightEvent(ev)).map(e => e.what).limit(c => c.location === playerState.discard);
}
const enemyBerserkFail = (effect?: Handler) => (ev: Ev) => {
  forbidAction('FIGHT');
  effect?.(ev);
};
const weaponXSequenceVarDefense = (n: number = 1) => (c: Card) => c.printedDefense + n * weaponXSequenceAmount(hqHeroes());
