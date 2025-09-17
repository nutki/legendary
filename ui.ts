// GUI
const uiConfig = {
  usesShieldLevel: false,
  usesHydraLevel: false,
}
let currenPlayer = 0;
function setUiConfig(setup: Setup) {
  uiConfig.usesShieldLevel =
    setup.heroes.some(h => ['Agent Phil Coulson', 'Quake', 'Deathlok', 'Mockingbird'].includes(h));
  document.getElementById("shield-level").style.display = uiConfig.usesShieldLevel ? 'inline-block' : 'none';
  uiConfig.usesHydraLevel =
    setup.villains.some(v=> ['Hydra Elite', 'A.I.M., Hydra Offshoot'].includes(v)) ||
    setup.mastermind.includes('Hydra High Council');
  document.getElementById("hydra-level").style.display = uiConfig.usesHydraLevel ? 'inline-block' : 'none';
}
function imageName(path: string, card: Card, subname?: string): string {
  let name = card.cardName;
  if (!name) name = subname;
  else if (subname !== undefined) name = subname + "_" + name;
  if (card.variant) name = name + "_" + card.variant;
  name = name.toLowerCase().replace(/ /g, "_").replace(/[^a-z0-9_]/g, "");
  const set = (card.set || 'Legendary').toLowerCase().replace(/ /g, "_").replace(/[^a-z0-9_]/g, "");
  return "images/" + set + '/' + path + "/" + name + ".jpg";
}
function cardImageTransform(card: Card): string {
  const proto = Object.getPrototypeOf(card);
  if (card.dividedParent) {
    return `scaleX(2) translate(${proto === card.dividedParent.divided.left ? '': '-'}25%)`;
  } else if (card.divided) {
    return 'rotate(90deg) scale(1.4,calc(1/1.4))';
  }
  return undefined;
}
function cardImageName(card: Card): string {
  if (card.instance && card.instance !== card.backSide) card = card.instance;
  if (card.dividedParent) card = card.dividedParent;
  if (card.cardType === "HERO" && card.isSidekick) return imageName("sidekicks", card);
  if (card.cardType === "HERO") return imageName("heroes", card, card.templateId?.replace(/@.*/, ""));
  if ((card.cardType === "VILLAIN" || card.cardType === "LOCATION") && card.isHenchman) return imageName("henchmen", card);
  if (card.cardType === "VILLAIN" || card.cardType === "VILLAINOUSWEAPON" || card.cardType === "LOCATION" || card.cardType === "AMBUSH SCHEME" || card.cardType === "TRAP") return imageName("villains", card, card.printedVillainGroup);
  if (card.cardType === "MASTERMIND") return imageName("masterminds", card);
  if (card.cardType === "TACTICS") return imageName("masterminds", card, card.mastermindName);
  if (card.cardType === "SCHEME") return imageName("schemes", card);
  if (card.cardType === "BYSTANDER" && card.cardName !== "Bystander") return imageName("bystanders", card);
  if (card.cardType === "WOUND" && card.cardName !== "Wound") return imageName("wounds", card);
  if (card.cardType === "TOKEN") return imageName("tokens", card);
  if (card.cardType === "HORROR") return imageName("horrors", card);
  return imageName("", card);
}
function makeDisplayAttached(c: Deck | Card) {
  let res = '';
  if (c._attached) for (let i in c._attached) if (c._attached[i].size) {
    res += ' [ ' + i + ': ' + c._attached[i].deck.map(makeDisplayCard).join(' ') + ' ]';
  }
  return res;
}

function makeDisplayCard(c: Card): string {
  let res = `<span class="card" id="${c.id}" >${c.id}</span>`;
  return res + makeDisplayAttached(c);
}
function setSourceImg(name: string, transform?: string) {
  const r = div("card", { id: "source2" }, makeCardFace(name, transform), div("frame"));
  positionCard(r, {size: 'large', x:7.5, y:0});
  document.getElementById("card-container").appendChild(r);
}
function clearSourceImg() {
  document.getElementById("source2")?.remove();
}
function makeDisplayPlayAreaImg(c: Card) {
  const gone = !playerState.playArea.deck.has(c2 => c2.id === c.id);
  return makeDisplayCardImg(c, gone);
}
function makeCardFace(src: string, transform?: string) {
  const i = img(src, "cardface", transform);
  const placeholder = img('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM0NV39HwAD0gIWu1P/WwAAAABJRU5ErkJggg==', "cardface", transform);
  i.onload = () => { placeholder.style.display = 'none'; };
  i.onerror = () => { i.setAttribute('src', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO87eLyHwAFyQJkk9PiMAAAAABJRU5ErkJggg=='); };
  return div("cardfacecontainer", {}, placeholder, i);
}
function img(src: string, className?: string, transform?: string) {
  const e = document.createElement('img');
  e.setAttribute('class', className);
  e.setAttribute('src', src);
  if (transform) e.setAttribute('style', `transform: ${transform}`);
  return e;
}
function div(className: string, options?: {[key: string]: string}, ...children: Node[]) {
  const e = document.createElement('div');
  e.setAttribute("class", className);
  for (const key in options) e.setAttribute(key, options[key]);
  for (const child of children) child && e.appendChild(child);
  return e;
}
function span(className: string, options?: {[key: string]: string}, ...children: Node[]) {
  const e = document.createElement('span');
  e.setAttribute("class", className);
  for (const key in options) e.setAttribute(key, options[key]);
  for (const child of children) child && e.appendChild(child);
  return e;
}
function br() { return document.createElement('br'); }
function text(value: string | number) { return document.createTextNode(value.toString()); }
function getCountHints(deck: Deck, small: boolean): [number, number, string] {
  const result: [number, number, string] = [0, 0, deck.id];
  const c = deck.top;
  if (c && isMastermind(c)) result[0] = c.attached("TACTICS").size;
  let cnt = small ? 0 : deck.size;
  for (const c of deck.deck) gameState.thronesFavorHolder instanceof Card && gameState.thronesFavorHolder === c && cnt++;
  if (c && c._attached) for (let i in c._attached) if (i !== 'SHARD') cnt += c._attached[i].deck.size;
  if (deck._attached) for (let i in deck._attached) cnt += deck._attached[i].deck.size;
  if (cnt > 0) result[1] = cnt - result[0] - (c && !small? 1 : 0);
  if (c && isScheme(c)) result[0] = getSchemeCountdown();
  return result
}
function makeDisplayCardActions(id: string): HTMLDivElement {
  const container = div("cardactions");
  const actionsDiv = div("actions");
  const actions = clickActions[id];
  if (typeof actions === "object") for (const { func, desc } of actions) {
    const a = div("action", {}, text(desc || 'Action'));
    a.addEventListener("click", () => func());
    actionsDiv.appendChild(a);
  }
  container.appendChild(actionsDiv);
  return container;
}
function makeDisplayCardImg(c: Card, gone: boolean = false, id: boolean = true, countHint: [number, number, string] = [0, 0, '']): HTMLDivElement {
  const faceUp = gone || isFaceUp(c);
  const src = faceUp ? cardImageName(c) : 'images/back.jpg';
  const transform = faceUp ? cardImageTransform(c) : undefined;
  const options: {[key: string]: string} = faceUp && c.divided ? {} : {
   onmouseover: `setSourceImg('${src.replace(/'/g, "\\'")}'${transform ? `, '${transform}'` : ''})`,
   onmouseleave: "clearSourceImg()",
  };
  if (id) options['data-card-id'] = c.id;
  const d = div(gone ? "card gone" : "card", options, makeCardFace(src, transform));
  if (faceUp && c.defense !== c.printedDefense)
    d.appendChild(div("attackHint", {}, text(c.defense)));
  if (faceUp && c.printedCost !== undefined && effectiveCost(c) !== c.printedCost)
    d.appendChild(div("attackHint", {}, text(effectiveCost(c))));
  d.appendChild(div("frame"));
  if (countHint[0]) d.appendChild(div("count", {}, text(countHint[0])));
  if (countHint[1]) d.appendChild(div("capturedHint", { 'data-popup-id': countHint[2] }, text(countHint[1])));
  if (c.attached("SHARD").size) {
    d.appendChild(div("shardHint", {}, text(c.attached("SHARD").size)));
  }
  if (faceUp && c.divided) {
    d.appendChild(div("dividedtop", {
      style: 'width: 100%; height: 50%; top: 0;position: absolute',
      onmouseover: `setSourceImg('${src.replace(/'/g, "\\'")}', "scaleX(2) translate(25%)")`,
      onmouseleave: "clearSourceImg()",
    }));
    d.appendChild(div("dividedbottom", {
      style: 'width: 100%; height: 50%; bottom: 0;position: absolute',
      onmouseover: `setSourceImg('${src.replace(/'/g, "\\'")}', "scaleX(2) translate(-25%)")`,
      onmouseleave: "clearSourceImg()",
    }));
  }
  return d;
}
function positionCard(card: HTMLElement, {size, x, y, w, fan}: {size?: string | number, x: number, y: number, fan?: boolean, w?: number}, i: number = 0, t: number = 0): void {
  const spread = w > 1 && t ? Math.min(1, (w - 1) / (t - 1)) : 1;
  card.style.position = "absolute";
  card.style.top = y * 288 + (y >= 2 ? 60 : 0) + "px";
  card.style.left = (fan ? (x - 1 + ((w||1))/2) * 212: (x + i * spread) * 212) + "px";
  if (fan) {
    card.style.transform = `rotate(${(i - ((t||w||1) - 1)/2) * 3.5 * spread}deg)`;
    card.style.transformOrigin = "center 3000px";
  }
  if (typeof(size) === "string") card.classList.add(size);
  if (typeof(size) === "number") {
    card.style.transform = `scale(${size})`;
    card.style.transformOrigin = "top left";
  }
}
type DeckPos = {
  id: string;
  x: number;
  y: number;
  popupid?: string;
  popupid2?: string;
  size?: 'small' | number;
  count?: string;
  countWhenEmpty?: boolean; // whether to show count when deck is empty
  playerDeck?: boolean;
  w?: number; // width in cards
  fan?: boolean; // fan out cards
}
const mainDecks: DeckPos[] = [
  { id: 'MASTERMIND', x: 0, y: 0, popupid2: 'popmastermind' },
  { id: 'SCHEME', x: 6.5, y: 0, popupid2: 'popscheme' },
  { id: 'SHIELDOFFICER', x: 0, y: 1, size: 'small', count: 'OFFICER', popupid: 'popofficers' },
  { id: 'SIDEKICK', x: .5, y: 1, size: 'small', count: 'SIDEKICK', popupid: 'popsidekicks' },
  { id: 'MADAME', x: 0, y: 1.5, size: 'small', popupid: 'popmadame' },
  { id: 'NEWRECRUIT', x: .5, y: 1.5, size: 'small', popupid: 'popnewrecruit' },
  { id: 'VILLAIN', x: 6, y: .5, size: 'small', count: 'VILLAIN', popupid: 'popvillains' },
  { id: 'ESCAPED', x: 6.5, y: 1, size: 'small', count: 'ESCAPED', popupid: 'popescaped' },
  { id: 'KO', x: 6, y: 0, size: 'small', count: 'KO', popupid: 'popko' },
  { id: 'ASTRALPLANE', x: 7, y: 1, size: 'small', popupid: 'popastralplane' },
  { id: 'WOUNDS', x: 6.5, y: 1.5, size: 'small', count: 'WOUNDS', popupid: 'popwounds' },
  { id: 'BINDINGS', x: 7, y: 1.5, size: 'small', count: 'BINDINGS', popupid: 'popbindings', countWhenEmpty: false },
  { id: 'BYSTANDERS', x: 6, y: 1.5, size: 'small', count: 'BYSTDR', popupid: 'popbystanders' },
  { id: 'HERO', x: 6, y: 1, size: 'small', count: 'HERO', popupid: 'popheroes' },
  { id: 'PLAYAREA0', x: 0, y: 2, w: 9, playerDeck: true },
  { id: 'HAND0', x: 1, y: 3, w: 8, fan: true, playerDeck: true },
  { id: 'DECK0', x: 0, y: 3, size: 'small', count: 'DECK', popupid: 'popdeck', playerDeck: true },
  { id: 'DISCARD0', x: .5, y: 3, size: 'small', count: 'DISCARD', popupid: 'popdiscard', playerDeck: true },
  { id: 'VICTORY0', x: 0, y: 3.5, size: 'small', count: 'VP', popupid: 'popvictory', playerDeck: true },
  { id: 'SPECIAL0', x: 0.5, y: 3.5, size: 'small', playerDeck: true },
  { id: 'OUTOFTIME0', x: 8, y: 3.5, size: 'small', count: 'OUTOFTIME', popupid: 'popoutoftime', playerDeck: true, countWhenEmpty: false },
];
function updatePlayerDecks(n: number): void {
  document.querySelectorAll<HTMLElement>(`div[data-player-id="1"]`).forEach(d => {
    d.style.left = (parseFloat(d.style.left) + n * 212) + "px";
  });
}

function frontCard(deck: Deck): Card | undefined {
  if (deck.top) return deck.top;
  if (deck._attached) for (let i in deck._attached) if (deck._attached[i].deck.size) return deck._attached[i].deck[0];
  return undefined;
}

function setBackgroundForId(id: string, d: HTMLDivElement): void {
  const pos = ["BRIDGE", "STREETS", "ROOFTOPS", "BANK", "SEWERS"].indexOf(id);
  if (pos < 0) {
    d.style.border = "1px solid white";
    const nameBadge = div("nameBadge", {}, text(id));
    d.appendChild(nameBadge);
  } else {
    d.style.backgroundImage = `url('images/cityscape.png')`;
    d.style.backgroundPositionX = `${pos * 25}%`;
    d.style.backgroundSize = `500% 100%`;
  }
}

function displayDeck(deck: Deck, deckPos: typeof mainDecks[0], cardsContainer: HTMLElement): void {
  const d = div('deck', { id: deck.id, 'data-player-id': deckPos.playerDeck ? "1" : undefined });
  if (deck.cityPosition && !deck.isInactive) setBackgroundForId(deck.id, d);
  const playerNr = deckPos.playerDeck ? deck.id.slice(-1) : '';
  let topDiv = d;
  positionCard(d, deckPos);
  cardsContainer.appendChild(d);
  const cardDivs = deck.id.startsWith('PLAYAREA') ? playerState.nr !== parseInt(deck.id.slice(-1)) ? [
    ...gameState.players[parseInt(deck.id.slice(-1))].artifact.deck.map(c => makeDisplayCardImg(c)),
    ...deck.deck.map(c => makeDisplayCardImg(c)),
  ] : [
    ...playerState.artifact.deck.map(c => makeDisplayCardImg(c)),
    ...turnState.cardsPlayed.filter(c => !playerState.artifact.has(v => v === c)).map(makeDisplayPlayAreaImg),
    ...deck.deck.filter(c => !turnState.cardsPlayed.has(c2 => c2.id === c.id)).map(c => makeDisplayCardImg(c)),
  ] : deckPos.w > 1 ? deck.deck.map(card => makeDisplayCardImg(card)) :
  frontCard(deck) ? [ makeDisplayCardImg(frontCard(deck), deck.isInactive, true, getCountHints(deck, deckPos.size === "small")) ] : [];
  const n = cardDivs.size;
  cardDivs.forEach((cardDiv, i) => {
    cardsContainer.appendChild(cardDiv);
    cardDiv.setAttribute('data-deck-id', deck.id);
    if (deckPos.playerDeck) cardDiv.setAttribute('data-player-id', "1");
    positionCard(cardDiv, deckPos, i, n);
    topDiv = cardDiv;
    if (currentClickActions === cardDiv.getAttribute('data-card-id')) {
      const actions = makeDisplayCardActions(cardDiv.getAttribute('data-card-id'));
      cardsContainer.appendChild(actions);
      positionCard(actions, deckPos, i, n);
      if (deckPos.playerDeck) actions.setAttribute('data-player-id', "1");
    }
  });
  if (deckPos.popupid) topDiv.addEventListener("click", () => togglePopup(deckPos.popupid + playerNr));
  topDiv.querySelectorAll('.count, .capturedHint').forEach(e => {
    deckPos.popupid2 && e.addEventListener("click", () => togglePopup(deckPos.popupid2));
  });
  const d1 = div('deck-overlay', { 'data-deck-id': deck.id, 'data-player-id': deckPos.playerDeck ? "1" : undefined });
  positionCard(d1, deckPos);
  cardsContainer.appendChild(d1);
  if (deckPos.count) {
    if (deckPos.count === 'VP') {
      d1.appendChild(img("icons/VP.png", "vpcount"));
      d1.appendChild(div("deckcount vpcount", {}, text(currentVP(gameState.players[parseInt(deck.id.slice(-1))]))));
    } else if(deckPos.count && (deck.size || deckPos.countWhenEmpty !== false)) d1.appendChild(div('deckcount', {}, span('name', {}, text(deckPos.count)), br(), text(deck.size)));
  }
}
function displayPopupDeck(deck: Deck, name: string, cardsContainer: HTMLElement): void {
  const container = div('cards');
  const closeButton = div('popupclose', {}, text('X'));
  closeButton.addEventListener("click", function(e) {
    this.parentElement.classList.add("hidden");
  });
  container.addEventListener("wheel", function(e) {
    this.scrollBy({ left: e.deltaY * 5, behavior: 'smooth' });
    e.preventDefault();
  });
  cardsContainer.appendChild(div('popup hidden', { id: name, 'data-popup-id': deck.id }, container, div('popupname', {}, text(deck.id)), closeButton));
  let dist = 0;
  let total = 0;
  const flat = flattenDeck(deck);
  for (let i = 0; i < flat.size - 1; i++) {
    total += (flat[i][1] !== flat[i+1][1]) || isFaceUp(flat[i][0]) ? 1 : .1;
  }
  flat.forEach(([card, name], i) => {
    const cardDiv = makeDisplayCardImg(card);
    if (card.location) cardDiv.setAttribute('data-deck-id', card.location.id);
    const shouldShowName = name && (i < flat.length - 1 ? name !== flat[i+1][1] && name : true);
    if (shouldShowName) {
      cardDiv.appendChild(div('deckname', {}, text(name)));
      cardDiv.classList.add('topCard');
    }
    container.appendChild(cardDiv);
    positionCard(cardDiv, { x: 0, y: 0 }, total - dist);
    if (currentClickActions === cardDiv.getAttribute('data-card-id')) {
      const actions = makeDisplayCardActions(cardDiv.getAttribute('data-card-id'));
      container.appendChild(actions);
      positionCard(actions, { x: 0, y: 0 }, total - dist);
    }
    dist = (i < flat.length - 1 && name !== flat[i+1][1]) || isFaceUp(card) ? dist + 1 : dist + .1;
  });
}
const thronesFavor = new Card('TOKEN', "Throne's Favor");
thronesFavor.set = 'Black Panther';
function displayPlayerSpecial(p: Player, deckPos: typeof mainDecks[0], cardsContainer: HTMLElement): void {
  if (gameState.thronesFavorHolder === p) {
    const d = makeDisplayCardImg(thronesFavor, false, false);
    d.setAttribute('data-player-id', "1")
    positionCard(d, deckPos);
    cardsContainer.appendChild(d);
  }
  if (p.shard.size) {
    const d = div("deck-overlay", { 'data-player-id': '1' });
    d.appendChild(div("shardHint", {}, text(p.shard.size)));
    positionCard(d, deckPos);
    cardsContainer.appendChild(d);
  }
}
function arrangeCityDecks(cityDecks: DeckPos[]) {
  const minX = cityDecks.reduce((min, d) => Math.min(min, d.x), 0);
  const maxX = cityDecks.reduce((max, d) => Math.max(max, d.x), 4);
  const minY = cityDecks.reduce((min, d) => Math.min(min, d.y), 0);
  const maxY = cityDecks.reduce((max, d) => Math.max(max, d.y), 1);
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const scale = Math.min(5 / width, 2 / height);
  const offsetX = (5 - width * scale) / 2;
  const offsetY = (2 - height * scale) / 2;
  cityDecks.forEach(d => {
    d.x = (d.x - minX) * scale + 1 + offsetX;
    d.y = (d.y - minY) * scale + offsetY;
    d.size = scale;
  });
}
function displayDecks(ev?: Ev): void {
  let list = Deck.deckList;
  let deckById:{[id: string]:Deck} = {};
  for (let i = 0; i < list.length; i++) deckById[list[i].id] = list[i];
  const cardsContainer = document.getElementById("card-container");
  cardsContainer.innerHTML = '';
  const hasAttached = (d: Deck) => d._attached && Object.values(d._attached).some(a => a.size > 0);
  const cityDecks: DeckPos[] = list.filter(d => d.cityPosition && (!d.isInactive || d.size || hasAttached(d))).map(({id, cityPosition: [x, y]}) => ({
    id, x, y, popupid2: 'pop' + id,
  }));
  arrangeCityDecks(cityDecks);
  const allDecks = [...mainDecks, ...cityDecks];
  for (const deckPos of allDecks) {
    if (deckPos.playerDeck) for (let i = 0; i < gameState.players.length; i++) {
      if (deckPos.id === 'SPECIAL0') {
        displayPlayerSpecial(gameState.players[i], {...deckPos, x: deckPos.x + (i - currenPlayer) * 10 }, cardsContainer);
        continue;
      }
      const deck = deckById[deckPos.id.replace(/0/, i.toString())];
      if (deck) displayDeck(deck, { ...deckPos, x: deckPos.x + (i - currenPlayer) * 10 }, cardsContainer);
    } else displayDeck(deckById[deckPos.id], deckPos, cardsContainer);
  }
  const popupDecks = allDecks.map(d => ({ id: d.id, container: d.popupid2 || d.popupid, playerDeck: d.playerDeck })).filter(d => d.container);
  for (const popupDeck of popupDecks) {
    if (popupDeck.playerDeck) for (let i = 0; i < gameState.players.length; i++) {
      const deck = deckById[popupDeck.id.replace(/0/, i.toString())];
      displayPopupDeck(deck, popupDeck.container + i, cardsContainer);
    } else {
      displayPopupDeck(deckById[popupDeck.id], popupDeck.container, cardsContainer);
    }
  }
  const s = ev ? ev.type === 'CONFIRM' && ev.what ? ev.what : ev.getSource() : undefined;
  if (s instanceof Card) {
    const sDiv = makeDisplayCardImg(s, false, false);
    positionCard(sDiv, { size: 'large', x: 7.5, y: 0 });
    cardsContainer.appendChild(sDiv);
  }
  let divs = document.getElementsByClassName("text-deck");
  for (const div of divs) {
    let deck = deckById[div.getAttribute("data-id")];
    div.innerHTML = deck ? deck.id + makeDisplayAttached(deck) + ': ' + deck.deck.map(makeDisplayCard).join(' ') : 'Not found';
  }
}
function maybeFavor(c: Card): [Card, string | undefined][] {
  return gameState.thronesFavorHolder === c ? [[thronesFavor, 'THONE\'S FAVOR']] : [];
}
function flattenCard(card: Card, name?: string): [Card, string | undefined][] {
  return [...(card._attached ? Object.entries(card._attached).reverse().flatMap(([n, c]) => n === "SHARD" ? [] : flattenDeck(c, n)) : []), ...maybeFavor(card), [card, name]];
}
function flattenDeck(deck: Deck, name?: string): [Card, string | undefined][] {
  return [...(deck._attached ? Object.entries(deck._attached).reverse().flatMap(([n, d]) => flattenDeck(d, n)) : []), ...deck.deck.flatMap((c, i) => flattenCard(c, name))];
}

const half = '<span class="fraction"><span class="numerator">1</span><span class="slash">/</span><span class="denominator">2</span></span>';
const star = '<span class="numberstar">&#x1F7B8;</span>';
function formatNumber(n: number): string {
  const hasHalf = n - Math.floor(n) === .5;
  if (hasHalf) n -= .5 * Math.sign(n);
  const nDigits = n.toString().length + (hasHalf ? 1 : 0);
  const size = ['size1', 'size1', 'size2', 'size3'][Math.min(nDigits - 1, 3)];
  return `<span class="${size}">${n}${hasHalf ? half : ''}</span>`;
}
function displayGame(ev?: Ev): void {
  const { recruit, recruitSpecial, attack, attackSpecial, soloVP, shard, piercing, numPlayers } = getDisplayInfo();
  displayDecks(ev);
  document.getElementById("prevPlayer").style.visibility = numPlayers > 1 ? 'visible' : 'hidden';
  document.getElementById("nextPlayer").style.visibility = numPlayers > 1 ? 'visible' : 'hidden';
  if (undoLog.canUndo()) document.getElementById("undo").classList.remove("disabled");
  else document.getElementById("undo").classList.add("disabled");
  document.getElementById("recruit").innerHTML = formatNumber(recruit);
  document.getElementById("attack").innerHTML = formatNumber(attack);
  if (attackSpecial) {
    document.getElementById("attackspecial").style.display = 'inline-block';
    document.getElementById("attackspecial").innerHTML = `<small>${formatNumber(attackSpecial)}${star}</small>`;
  } else document.getElementById("attackspecial").style.display = 'none';
  if (recruitSpecial) {
    document.getElementById("recruitspecial").style.display = 'inline-block';
    document.getElementById("recruitspecial").innerHTML = `<small>${formatNumber(recruitSpecial)}${star}</small>`;
  } else document.getElementById("recruitspecial").style.display = 'none';
  if (shard) {
    document.getElementById("shards").innerHTML = `${shard}`;
    document.getElementById("shards").style.display = 'inline-block';
  } else document.getElementById("shards").style.display = 'none';
  if (uiConfig.usesShieldLevel) document.getElementById("shield-level").innerHTML = shieldLevel().toString();
  if (uiConfig.usesHydraLevel) document.getElementById("hydra-level").innerHTML = hydraLevel().toString();
  if (piercing) {
    document.getElementById("piercing").innerHTML = `${piercing}`;
    document.getElementById("piercing").style.display = 'inline-block';
  } else document.getElementById("piercing").style.display = 'none';
  if (soloVP !== undefined) {
    document.getElementById("vp").style.display = 'inline-block';
    document.getElementById("vp").innerHTML = `${soloVP}`;
  } else document.getElementById("vp").style.display = 'none';
  Object.keys(clickActions).flatMap(v => [...document.querySelectorAll(`[data-card-id="${CSS.escape(v)}"]`)]).forEach(e => {
    e.classList.add("select");
    if (e.closest('.popup')) {
      const popupId = e.closest('.popup').getAttribute('data-popup-id');
      popupId && document.querySelectorAll(`.capturedHint[data-popup-id="${popupId}"]`).forEach(h => h.classList.add("select"));
    }
    if (ev?.desc) {
      if (/\bKO\b/.test(ev.desc)) e.classList.add("selectko");
      if ((/\bdiscard\b/i).test(ev.desc) && !(/\bfrom discard\b/i).test(ev.desc)) e.classList.add("selectdiscard");
      if ((/\brecruit\b/i).test(ev.desc)) e.classList.add("selectrecruit");
      if ((/\bdefeat\b/i).test(ev.desc)) e.classList.add("selectdefeat");
    }
  });
  for (const deckDiv of document.querySelectorAll('.deck-overlay, .popup .topCard')) {
    const id = deckDiv.getAttribute('data-deck-id');
    if (clickActions[id]) deckDiv.classList.add("select");
  }
}
function setMessage(msg: string, gameOverMsg: string): void {
  document.getElementById("message").innerHTML = msg;
  document.getElementById("game-over-message").innerHTML = gameOverMsg || '';
  console.log(msg, gameOverMsg);
}

// Game setup selection screen
function makeOptions(id: string, templateType: 'HEROES' | 'VILLAINS' | 'HENCHMEN' | 'MASTERMINDS' | 'SCHEMES', current: string, f: (name: any) => boolean = () => true) {
  const values = cardTemplates[templateType].filter(f);
  const el = <HTMLSelectElement>document.getElementById(id);
  el.addEventListener("change", setupChange);
  if (values.length !== 1) el.add(document.createElement("option"));
  let set = "Legendary";
  values.forEach(s => {
    if (s.set !== set) {
      set = s.set;
      const option = document.createElement("option");
      option.text = `---- ${set} ----`;
      option.disabled = true;
      el.add(option);
    }
    const option = document.createElement("option");
    option.text = s instanceof Card ? s.cardName : s.name;
    option.value = s.templateId;
    if (current === s.templateId) option.selected = true;
    el.add(option);
  });
}
function selectRandom(id: string) {
  const e = <HTMLSelectElement>document.getElementById(id);
  const options = [...e.options].filter(o => !o.disabled).map(o => o.value);
  if (options.length) e.value = options[Math.floor(Math.random() * options.length)];
  setupChange.call(e);
}
function makeSelects(id: string, templateType: 'HEROES' | 'VILLAINS' | 'HENCHMEN' | 'MASTERMINDS' | 'SCHEMES', name: string, values: string[]) {
  let selected = values.map((a, i) => {
    let e = document.getElementById(id + i);
    if (!e) return undefined;
    return (<HTMLSelectElement>e).value;
  });
  document.getElementById(id).innerHTML = values.map((heroName, i) => `<span><div>${name} ${i + 1}</div><div><select id="${id}${i}"></select></span><button id="${id}${i}_rand">?</button></div></span>`).join('');
  values.forEach((name, i) => {
    document.getElementById(id + i + '_rand').addEventListener("click", () => selectRandom(id + i));
    makeOptions(id + i, templateType, selected[i], n => name === undefined || name.split('|').includes(n.templateId));
  });
}
function makeBystanderSelects(id: string, templateType: keyof Templates = 'BYSTANDERS') {
  const e = document.getElementById(id);
  const sets = ['ALL', ...cardTemplates[templateType].unique(({set}) => set)];
  sets.each((set) => {
    const i = document.createElement('input');
    if (set === 'ALL') {
      i.onclick = () => e.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(cb => cb.checked = i.checked);
    } else {
      i.setAttribute('data-set', set);
    }
    i.type = "checkbox";
    const l = document.createElement('label');
    l.classList.add('multiselectlabel');
    l.appendChild(i);
    l.appendChild(document.createTextNode(set))
    e.appendChild(l);
  });
}
function checkAllBystanderSelects(id: string) {
  const inputs = document.querySelectorAll<HTMLInputElement>(`#${id} input[data-set]`);
  const allChecked = Array.from(inputs).every(input => input.checked);
  const allInput = document.querySelector<HTMLInputElement>(`#${id} input:not([data-set])`);
  if (allInput) allInput.checked = allChecked;
}
function getBystanderSelects(id: string) {
  const r: string[] = [];
  [...document.getElementById(id).getElementsByTagName('input')].each(e => {
    if (e.checked && e.getAttribute('data-set')) r.push(e.getAttribute('data-set'));
  })
  return r;
}
function setBysternderSelects(id: string, value: string[]) {
  [...document.getElementById(id).getElementsByTagName('input')].each(e => {
    e.checked = value.includes(e.getAttribute('data-set'));
  })
  checkAllBystanderSelects(id);
}
function getSelects(name: string, t: string[]): boolean {
  const n = t.map((old, i) => t[i] = (<HTMLSelectElement>document.getElementById(name + i)).value);
  return n.every(v => v) && n.uniqueCount(v => v) === n.length;
}
let globalFormSetup: Setup;
function setupChange(): void {
  if (/\d+$/.test(this.id)) {
    const prefix = this.id.replace(/\d+$/, '');
    const currentValue = this.value;
    const selects = document.querySelectorAll<HTMLSelectElement>(`select[id^="${prefix}"]`);
    selects.forEach(select => {
      if (select !== this && select.value === currentValue) {
        select.value = '';
      }
    });
  }
  if (this.type === "checkbox") {
    checkAllBystanderSelects("setup_bystanders");
    checkAllBystanderSelects("setup_sidekicks");
    checkAllBystanderSelects("setup_wounds");
  }
  const pel = <HTMLSelectElement>document.getElementById("setup_players");
  const sel = <HTMLSelectElement>document.getElementById("setup_scheme");
  const mel = <HTMLSelectElement>document.getElementById("setup_mastermind0");
  if (!sel.value || !mel.value) {
    globalFormSetup = undefined;
    document.getElementById("start").classList.add("disabled");
    return;
  };
  const tmp = getGameSetup(sel.value, mel.value, parseInt(pel.value));  
  makeSelects("setup_heroes", "HEROES", "Hero", tmp.heroes);
  makeSelects("setup_villains", "VILLAINS", "Villains Group", tmp.villains);
  makeSelects("setup_henchmen", "HENCHMEN", "Henchmen Group", tmp.henchmen);
  makeSelects("setup_mastermind", "MASTERMINDS", "Mastermind", tmp.mastermind);
  const s1 = getSelects("setup_heroes", tmp.heroes);
  const s2 = getSelects("setup_villains", tmp.villains);
  const s3 = getSelects("setup_henchmen", tmp.henchmen);
  const s4 = getSelects("setup_mastermind", tmp.mastermind);
  tmp.bystanders = getBystanderSelects("setup_bystanders");
  tmp.withOfficers = (<HTMLInputElement>document.getElementById('withOfficers')).checked;
  tmp.sidekicks = getBystanderSelects("setup_sidekicks");
  tmp.withSpecialOfficers = (<HTMLInputElement>document.getElementById('withSpecialOfficers')).checked;
  tmp.wounds = getBystanderSelects("setup_wounds");
  tmp.withBindings = (<HTMLInputElement>document.getElementById('withBindings')).checked;
  tmp.withMadame = (<HTMLInputElement>document.getElementById('withMadame')).checked;
  tmp.withNewRecruits = (<HTMLInputElement>document.getElementById('withNewRecruits')).checked;
  tmp.handType = (<HTMLInputElement>document.getElementById('handType')).value === 'HYDRA' ? 'HYDRA' : 'SHIELD';
  tmp.cityType = (<HTMLInputElement>document.getElementById('cityType')).value === 'VILLAIN' ? 'VILLAIN' : 'HERO';
  tmp.withShards = true;
  tmp.withFinalBlow = (<HTMLInputElement>document.getElementById('withFinalBlow')).checked;
  globalFormSetup = s1 && s2 && s3 && s4 && tmp.bystanders.length ? tmp : undefined;
  if (globalFormSetup) document.getElementById("start").classList.remove("disabled");
  else document.getElementById("start").classList.add("disabled");
}
function makeLikelySkips(): void {
  const options: [LikelyChoice, string][] = [
    ['SUPERPOWER', 'Always confirm Superpower use'],
    ['OUTWIT', 'Always confirm Outwit use'],
    ['STRIKEORDER', 'Always chose strike ability order with multiple masterminds'],
    ['DEFEATORDER', 'Always chose defeat/rescue ability order'],
  ];
  const el = document.getElementById("likelySkips");
  options.map(([v, t]) => {
    const i = document.createElement('input');
    i.type = "checkbox";
    i.id = `likely_${v}`;
    i.checked = likelyConfig.includes(v);
    i.addEventListener("change", function() {
      if (this.checked) likelyConfig.push(v);
      else if (likelyConfig.includes(v)) likelyConfig.splice(likelyConfig.indexOf(v), 1);
      saveLikelyConfig();
    });
    const l = document.createElement('label');
    l.classList.add('multiselectlabel');
    l.appendChild(i);
    l.appendChild(document.createTextNode(t));
    el.appendChild(l);
  });
}
function setupInit(): void {
  makeBystanderSelects("setup_bystanders");
  makeBystanderSelects("setup_sidekicks", 'SIDEKICKS');
  makeBystanderSelects("setup_wounds", 'WOUNDS');
  [...document.getElementsByTagName("input"), ...document.getElementsByTagName("select")].each(i => i.addEventListener("change", setupChange));
  makeOptions("setup_scheme", "SCHEMES", "cardName", undefined);
  document.getElementById("setup_scheme_rand").addEventListener("click", () => selectRandom("setup_scheme"));
  makeSelects("setup_mastermind", "MASTERMINDS", "Extra Mastermind", [ undefined ]);
  makeLikelySkips();
}
function chooseSelects(name: string, values: string[]): void {
  values.forEach((v, i) => {
    const el = <HTMLSelectElement>document.getElementById(name + i);
    el.value = v;
  });
}
function setupSet(s: Setup): void {
  const pel = <HTMLSelectElement>document.getElementById("setup_players");
  const sel = <HTMLSelectElement>document.getElementById("setup_scheme");
  const mel = <HTMLSelectElement>document.getElementById("setup_mastermind0");
  pel.value = s.numPlayers.toString();
  sel.value = s.scheme;
  mel.value = s.mastermind[0];
  const tmp = getGameSetup(s.scheme, s.mastermind[0], s.numPlayers);
  makeSelects("setup_heroes", "HEROES", "Hero", tmp.heroes);
  makeSelects("setup_villains", "VILLAINS", "Villains Group", tmp.villains);
  makeSelects("setup_henchmen", "HENCHMEN", "Henchmen Group", tmp.henchmen);
  makeSelects("setup_mastermind", "MASTERMINDS", "Mastermind", tmp.mastermind);
  chooseSelects("setup_heroes", s.heroes);
  chooseSelects("setup_villains", s.villains);
  chooseSelects("setup_henchmen", s.henchmen);
  chooseSelects("setup_mastermind", s.mastermind);
  (<HTMLInputElement>document.getElementById('withBindings')).checked = s.withBindings;
  (<HTMLInputElement>document.getElementById('withMadame')).checked = s.withMadame;
  (<HTMLInputElement>document.getElementById('withNewRecruits')).checked = s.withNewRecruits;
  (<HTMLInputElement>document.getElementById('withOfficers')).checked = s.withOfficers;
  (<HTMLInputElement>document.getElementById('withSpecialOfficers')).checked = s.withSpecialOfficers;
  (<HTMLSelectElement>document.getElementById('handType')).value = s.handType;
  (<HTMLSelectElement>document.getElementById('cityType')).value = s.cityType;
  (<HTMLInputElement>document.getElementById('withFinalBlow')).checked = s.withFinalBlow;
  setBysternderSelects("setup_bystanders", s.bystanders);
  setBysternderSelects("setup_sidekicks", s.sidekicks);
  setBysternderSelects("setup_wounds", s.wounds);
  globalFormSetup = s;
}
function getPopups() {
  const popups: HTMLElement[] = Array.prototype.slice.call(document.getElementsByClassName("popup"), 0);
  return popups;
}
function getPopupCards() {
  const popups: HTMLElement[] = Array.prototype.slice.call(document.querySelectorAll(".popup .cards"), 0);
  return popups;
}
function getDecks() {
  const decks: HTMLElement[] = Array.prototype.slice.call(document.getElementsByClassName("deck"), 0);
  return decks;
}
function closePopupDecks() {
  getPopups().each(d => d.classList.add("hidden"));
}
function autoOpenPopupDecks(cardSelect: boolean) {
  const topLevelSelects = [...document.querySelectorAll<HTMLSelectElement>(".select:not(.popup .select)")].map(e => e.getAttribute("data-card-id"));
  const idToDeck = new Map<string, Deck>(Deck.deckList.map(d => [d.id, d]));
  getPopups().each(d => {
    const deck = idToDeck.get(d.getAttribute("data-popup-id"));
    const localSelects = [...d.getElementsByClassName("select")].map(e => e.getAttribute("data-card-id"));
    (cardSelect && localSelects.some(e => !topLevelSelects.includes(e)) || deck?.revealedCards?.sum(c => c.length)) && togglePopup(d.id);
  });
}
function autoOpenMultiClickActionPopup() {
  const topLevelSelects = [...document.querySelectorAll<HTMLSelectElement>(".select:not(.popup .select)")].map(e => e.getAttribute("data-card-id"));
  if (topLevelSelects.includes(currentClickActions)) return;
  getPopups().each(d => {
    const localSelects = [...d.getElementsByClassName("select")].map(e => e.getAttribute("data-card-id"));
    localSelects.includes(currentClickActions) && togglePopup(d.id);
  });
}
function togglePopup(id: string) {
  const popup = document.getElementById(id);
  let openPopups = [...document.querySelectorAll<HTMLElement>(".popup:not(.hidden)")].map(e => {
    const style = window.getComputedStyle(e);
    return ({ element: e, zIndex: parseInt(style.zIndex || "0", 10), top: parseInt(style.top || "0", 10) });
  });
  openPopups.sort((a, b) => a.zIndex - b.zIndex);
  const open = openPopups.some(e => e.element === popup);
  if (open) {
    const top = openPopups.findIndex(e => e.element === popup) == openPopups.length - 1;;
    openPopups = openPopups.filter(e => e.element !== popup);
    if (!top) {
      openPopups.push({ element: popup, zIndex: 0, top: 0 });
    } else popup.classList.add("hidden");
  } else {
    openPopups.push({ element: popup, zIndex: 0, top: 0 });
    popup.classList.remove("hidden");
    if (openPopups.length > 5) {
      openPopups[0].element.classList.add("hidden");
      openPopups.shift();
    }
  }
  const dist = 160 / (openPopups.length - 1 || 1);
  openPopups.forEach((e, i) => {
    e.element.style.zIndex = (i + 1).toString();
    e.element.style.top = 40 + (i * dist) + "px";
  });
}
let fullControl = false;
let fullControlShift = false;
function getFullControl() {
  return fullControl !== fullControlShift;
}
function initUI() {
  window.addEventListener('click', function(e) {
    clickCard(e);
  });
  window.addEventListener('touchend', function(e) {
   if (clickCard(e)) e.preventDefault();
  }, {passive: false});
  document.getElementById("undo").onclick = () => { if (undoLog.canUndo()) { undoLog.undo(); startGame(); } };
  document.getElementById("start").onclick = () => { if (globalFormSetup) {
    undoLog.init(globalFormSetup); startGame();
    document.getElementById("setupPage").classList.add("hidden");
    document.getElementById("boardPage").classList.remove("hidden");
  } };
  const nextPlayerAction = () => {
    if (currenPlayer < gameState.players.length - 1) {
      updatePlayerDecks(-10);
      currenPlayer++;
    }
  };
  document.getElementById("nextPlayer").onclick = nextPlayerAction;
  const prevPlayerAction = () => {
    if (currenPlayer > 0) {
      updatePlayerDecks(10);
      currenPlayer--;
    }
  };
  document.getElementById("prevPlayer").onclick = prevPlayerAction;
  document.getElementById("setupPage").classList.add("hidden");
  document.getElementById("setup").onclick = () => {
    document.getElementById("setupPage").classList.remove("hidden");
    document.getElementById("boardPage").classList.add("hidden");
  };
  document.getElementById("board").onclick = () => {
    document.getElementById("setupPage").classList.add("hidden");
    document.getElementById("boardPage").classList.remove("hidden");
  };
  document.getElementById("errorUndo").onclick = () => { undoLog.undo(); startGame(); closeError(); };
  document.getElementById("errorReset").onclick = () => { undoLog.restart(); startGame(); closeError(); };
  document.getElementById("errorClearSetup").onclick = () => { undoLog.init(exampleGameSetup); startGame(); closeError(); };
  const updateSize = () => {
    const viewportHeight = document.documentElement.clientHeight;
    const viewportWidth = document.documentElement.clientWidth;
    const scale = Math.min(viewportWidth / 2200, viewportHeight / 1250);
    document.getElementById("scalable-contents").style.transform = `scale(${scale})`;
    document.getElementById("scalable-container").style.height = `${scale * 1250}px`;
  }
  document.getElementById("errorReport").onclick = document.getElementById("issueReport").onclick = () => window.open(reportUrl(), '_blank');
  const updateFullControlDisplay = () => {
    const state = getFullControl();
    document.getElementById("fullControl").innerText = `Full Control: ${state ? "On" : "Off"}`;
    const cl = document.getElementById("fullControl").classList;
    if (state) cl.add("noconfirm"); else cl.remove("noconfirm");
  };
  document.getElementById("fullControl").onclick = () => {
    fullControl = !fullControl;
    updateFullControlDisplay();
  };
  // track Control key state
  window.addEventListener("keydown", (e) => {
    if (e.key === "Control" && !fullControlShift) {
      fullControlShift = true;
      updateFullControlDisplay();
    } else if (e.key === "ArrowLeft") prevPlayerAction();
    else if (e.key === "ArrowRight") nextPlayerAction();
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "Control" && fullControlShift) {
      fullControlShift = false;
      updateFullControlDisplay();
    }
  });
  // reset if window loses focus so state doesn't get stuck
  window.addEventListener("blur", () => {
    if (fullControlShift) {
      fullControlShift = false;
      updateFullControlDisplay();
    }
  });

  window.addEventListener("resize", updateSize);
  updateSize();
}
function reportUrl() {
  const body = ["<Describe issue details here>", "", "Please keep the debug information below:", "Version: " + (window as any).legendaryVersion, undoLog.toString(), JSON.stringify(undoLog.gameSetup)].join("\n");
  return 'https://github.com/nutki/legendary/issues/new?body=' + encodeURIComponent(body);
}
function showSetup() {
  document.getElementById("setupPage").classList.remove("hidden");
  document.getElementById("boardPage").classList.add("hidden");
}
function closeError() {
  document.getElementById("errorModalOverlay").style.display = "none";
}
window.onerror = (msg) => {
  document.getElementById("errorModalOverlay").style.display = "block";
  document.getElementById("errorMessage").innerHTML = msg.toString();
}
function setCurrentPlayer(n: number) {
  if (n !== currenPlayer) setTimeout(() => {
    updatePlayerDecks(10 * (currenPlayer - n));
    currenPlayer = n;
  }, 0);
}
function renderTextLog(contents: (string|Card)[]): void {
  const container = document.getElementById("logContainer");
  document.getElementById("logContainer").innerHTML = '';
  contents.forEach(c => container.appendChild(c instanceof Card ? div("logcard", {
    onmouseover: `setSourceImg('${cardImageName(c).replace(/'/g, "\\'")}')`,
    onmouseleave: `clearSourceImg()`,
  }, text(c.cardName)) : c === '\n' ? document.createElement('br') : text(c)));
}
