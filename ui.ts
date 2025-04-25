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
  if (card.instance?.divided) {
    const proto = Object.getPrototypeOf(card);
    return card.instance === proto ? 'rotate(90deg) scale(1.4,calc(1/1.4))' :
      `scaleX(2) translate(${proto === card.instance.divided.left ? '': '-'}25%)`;
  }
  return undefined;
}
function cardImageName(card: Card): string {
  if (card.instance && card.instance !== card.backSide) card = card.instance;
  if (card.cardType === "HERO" && card.isSidekick) return imageName("sidekicks", card);
  if (card.cardType === "HERO") return imageName("heroes", card, card.templateId?.replace(/@.*/, ""));
  if ((card.cardType === "VILLAIN" || card.cardType === "LOCATION") && card.isHenchman) return imageName("henchmen", card);
  if (card.cardType === "VILLAIN" || card.cardType === "VILLAINOUSWEAPON" || card.cardType === "LOCATION") return imageName("villains", card, card.printedVillainGroup);
  if (card.cardType === "MASTERMIND") return imageName("masterminds", card);
  if (card.cardType === "TACTICS") return imageName("masterminds", card, card.mastermindName);
  if (card.cardType === "SCHEME") return imageName("schemes", card);
  if (card.cardType === "BYSTANDER" && card.cardName !== "Bystander") return imageName("bystanders", card);
  if (card.cardType === "WOUND" && card.cardName !== "Wound") return imageName("wounds", card);
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
function setSourceImg(name: string) {
  const r = div("card", { id: "source2" }, img(name, "cardface"), div("frame"));
  positionCard(r, {size: 'large', x:7.5, y:0});
  document.getElementById("card-container").appendChild(r);
}
function clearSourceImg() {
  document.getElementById("source2").remove();
}
function makeDisplayPlayAreaImg(c: Card) {
  const gone = !playerState.playArea.deck.includes(c);;
  return makeDisplayCardImg(c, gone);
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
function getCountHints(deck: Deck): [number, number, string] {
  const result: [number, number, string] = [0, 0, deck.id];
  const c = deck.top;
  if (c && isMastermind(c)) result[0] = c.attached("TACTICS").size;
  let cnt = deck.size;
  if (c && c._attached) for (let i in c._attached) cnt += c._attached[i].deck.size;
  if (deck._attached) for (let i in deck._attached) cnt += deck._attached[i].deck.size;
  if (cnt > 0) result[1] = cnt - result[0] - (c ? 1 : 0);
  if (c && isScheme(c)) result[0] = getSchemeCountdown();
  return result
}
function makeDisplayCardImg(c: Card, gone: boolean = false, id: boolean = true, countHint: [number, number, string] = [0, 0, '']): HTMLDivElement {
  const faceUp = isFaceUp(c);
  const src = faceUp ? cardImageName(c) : 'images/back.jpg';
  const transform = faceUp ? cardImageTransform(c) : undefined;
  const options: {[key: string]: string} = {
    onmouseover: `setSourceImg('${src.replace(/'/g, "\\'")}')`,
    onmouseleave: "clearSourceImg()",
  };
  if (id) options.id = c.id;
  const d = div(gone ? "card gone" : "card", options, img(src, "cardface", transform));
  if (faceUp && c.defense !== c.printedDefense)
    d.appendChild(div("attackHint", {}, text(c.defense)));
  if (faceUp && c.printedCost !== undefined && effectiveCost(c) !== c.printedCost)
    d.appendChild(div("attackHint", {}, text(effectiveCost(c))));
  d.appendChild(div("frame"));
  if (countHint[0]) d.appendChild(div("count", {}, text(countHint[0])));
  if (countHint[1]) d.appendChild(div("capturedHint", { 'data-popup-id': countHint[2] }, text(countHint[1])));
  return d;
}
function positionCard(card: HTMLElement, {size, x, y, w, fan}: {size?: string, x: number, y: number, fan?: boolean, w?: number}, i: number = 0, t: number = 0): void {
  const spread = w > 1 && t ? Math.min(1, (w - 1) / (t - 1)) : 1;
  card.style.position = "absolute";
  card.style.top = y * 288 + (y >= 2 ? 60 : 0) + "px";
  card.style.left = (fan ? (x - 1 + ((w||1))/2) * 212: (x + i * spread) * 212) + "px";
  if (fan) {
    card.style.transform = `rotate(${(i - ((t||w||1) - 1)/2) * 3.5 * spread}deg)`;
    card.style.transformOrigin = "center 3000px";
  }
  if (size) card.classList.add(size);
}
const mainDecks = [
  { id: 'MASTERMIND', x: 0, y: 0, popupid2: 'popmastermind' },
  { id: 'BRIDGE', x: 1, y: 0, popupid2: 'popbridge' },
  { id: 'STREETS', x: 2, y: 0, popupid2: 'popstreets' },
  { id: 'ROOFTOPS', x: 3, y: 0, popupid2: 'poprooftops' },
  { id: 'BANK', x: 4, y: 0, popupid2: 'popbank' },
  { id: 'SEWERS', x: 5, y: 0, popupid2: 'popsewers' },
  { id: 'SCHEME', x: 6.5, y: 0, popupid2: 'popscheme' },
  { id: 'HQ1', x: 1, y: 1, popupid2: 'pophq1' },
  { id: 'HQ2', x: 2, y: 1, popupid2: 'pophq2' },
  { id: 'HQ3', x: 3, y: 1, popupid2: 'pophq3' },
  { id: 'HQ4', x: 4, y: 1, popupid2: 'pophq4' },
  { id: 'HQ5', x: 5, y: 1, popupid2: 'pophq5' },
  { id: 'SHIELDOFFICER', x: 0, y: 1, size: 'small', count: 'OFFICER', popupid: 'popofficers' },
  { id: 'SIDEKICK', x: .5, y: 1, size: 'small', count: 'SIDEKICK', popupid: 'popsidekicks' },
  { id: 'MADAME', x: 0, y: 1.5, size: 'small', popupid: 'popmadame' },
  { id: 'NEWRECRUIT', x: .5, y: 1.5, size: 'small', popupid: 'popnewrecruit' },
  { id: 'VILLAIN', x: 6, y: .5, size: 'small', count: 'VILLAIN', popupid: 'popvillains' },
  { id: 'ESCAPED', x: 6.5, y: 1, size: 'small', count: 'ESCAPED', popupid: 'popescaped' },
  { id: 'KO', x: 6, y: 0, size: 'small', count: 'KO', popupid: 'popko' },
  { id: 'WOUNDS', x: 6.5, y: 1.5, size: 'small', count: 'WOUNDS', popupid: 'popwounds' },
  { id: 'BINDINGS', x: 7, y: 1.5, size: 'small', count: 'BINDINGS', popupid: 'popbindings' },
  { id: 'BYSTANDERS', x: 6, y: 1.5, size: 'small', count: 'BYSTDR', popupid: 'popbystanders' },
  { id: 'HERO', x: 6, y: 1, size: 'small', count: 'HERO', popupid: 'popheroes' },
  { id: 'PLAYAREA0', x: 0, y: 2, w: 9, playerDeck: true },
  { id: 'HAND0', x: 1, y: 3, w: 8, fan: true, playerDeck: true },
  { id: 'DECK0', x: 0, y: 3, size: 'small', count: 'DECK', popupid: 'popdeck', playerDeck: true },
  { id: 'DISCARD0', x: .5, y: 3, size: 'small', count: 'DISCARD', popupid: 'popdiscard', playerDeck: true },
  { id: 'VICTORY0', x: 0, y: 3.5, size: 'small', count: 'VP', popupid: 'popvictory', playerDeck: true },
];
const popupDecks = [
  { id: 'DISCARD0', container: 'popdiscard' },
  { id: 'DECK0', container: 'popdeck' },
  { id: 'VICTORY0', container: 'popvictory' },
  { id: 'KO', container: 'popko' },
  { id: 'ESCAPED', container: 'popescaped' },
  { id: 'HERO', container: 'popheroes' },
  { id: 'VILLAIN', container: 'popvillains' },
  { id: 'BYSTANDERS', container: 'popbystanders' },
  { id: 'MASTERMIND', container: 'popmastermind' },
  { id: 'BRIDGE', container: 'popbridge' },
  { id: 'STREETS', container: 'popstreets' },
  { id: 'ROOFTOPS', container: 'poprooftops' },
  { id: 'BANK', container: 'popbank' },
  { id: 'SEWERS', container: 'popsewers' },
  { id: 'HQ1', container: 'pophq1' },
  { id: 'HQ2', container: 'pophq2' },
  { id: 'HQ3', container: 'pophq3' },
  { id: 'HQ4', container: 'pophq4' },
  { id: 'HQ5', container: 'pophq5' },
  { id: 'SCHEME', container: 'popscheme' },
  { id: 'WOUNDS', container: 'popwounds' },
  { id: 'BINDINGS', container: 'popbindings' },
  { id: 'SHIELDOFFICER', container: 'popofficers' },
  { id: 'SIDEKICK', container: 'popsidekicks' },
  { id: 'MADAME', container: 'popmadame' },
  { id: 'NEWRECRUIT', container: 'popnewrecruit' },
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

function displayDeck(deck: Deck, deckPos: typeof mainDecks[0], cardsContainer: HTMLElement): void {
  const d = div('deck', { id: deck.id, 'data-player-id': deckPos.playerDeck ? "1" : undefined });
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
    ...deck.deck.filter(c => !turnState.cardsPlayed.includes(c)).map(c => makeDisplayCardImg(c)),
  ] : deckPos.w > 1 ? deck.deck.map(card => makeDisplayCardImg(card)) :
  frontCard(deck) ? [ makeDisplayCardImg(frontCard(deck), false, !deckPos.popupid, deckPos.size === "small" ? [0, 0, ''] : getCountHints(deck)) ] : [];
  const n = cardDivs.size;
  cardDivs.forEach((cardDiv, i) => {
    cardsContainer.appendChild(cardDiv);
    cardDiv.setAttribute('data-deck-id', deck.id);
    if (deckPos.playerDeck) cardDiv.setAttribute('data-player-id', "1");
    positionCard(cardDiv, deckPos, i, n);
    topDiv = cardDiv;
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
      d1.appendChild(div("deckcount vpcount", {}, text(currentVP(playerState))));
    } else if(deckPos.count) d1.appendChild(div('deckcount', {}, span('name', {}, text(deckPos.count)), br(), text(deck.size)));
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
    cardDiv.setAttribute('data-deck-id', card.location.id);
    const shouldShowName = name && (i < flat.length - 1 ? name !== flat[i+1][1] && name : true);
    if (shouldShowName) {
      cardDiv.appendChild(div('deckname', {}, text(name)));
      cardDiv.classList.add('topCard');
    }
    container.appendChild(cardDiv);
    positionCard(cardDiv, { x: 0, y: 0 }, total - dist);
    dist = (i < flat.length - 1 && name !== flat[i+1][1]) || isFaceUp(card) ? dist + 1 : dist + .1;
  });
}
function displayDecks(ev?: Ev): void {
  let list = Deck.deckList;
  let deckById:{[id: string]:Deck} = {};
  for (let i = 0; i < list.length; i++) deckById[list[i].id] = list[i];
  const cardsContainer = document.getElementById("card-container");
  cardsContainer.innerHTML = '';
  const cityBg = img('images/cityscape.png');
  cityBg.style.position = 'absolute';
  cityBg.style.left = '211px';
  cityBg.style.width = '1055px';
  cityBg.style.height = '285px';
  cardsContainer.appendChild(cityBg);
  for (const deckPos of mainDecks) {
    if (deckPos.playerDeck) for (let i = 0; i < gameState.players.length; i++) {
      const deck = deckById[deckPos.id.replace(/0/, i.toString())];
      if (deck) displayDeck(deck, { ...deckPos, x: deckPos.x + (i - currenPlayer) * 10 }, cardsContainer);
    } else displayDeck(deckById[deckPos.id], deckPos, cardsContainer);
  }
  for (const popupDeck of popupDecks) {
    if (popupDeck.id.endsWith('0')) for (let i = 0; i < gameState.players.length; i++) {
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
function flattenCard(card: Card, name?: string): [Card, string | undefined][] {
  return [...(card._attached ? Object.entries(card._attached).reverse().flatMap(([n, c]) => flattenDeck(c, n)) : []), [card, name]];
}
function flattenDeck(deck: Deck, name?: string): [Card, string | undefined][] {
  return [...(deck._attached ? Object.entries(deck._attached).reverse().flatMap(([n, d]) => flattenDeck(d, n)) : []), ...deck.deck.flatMap((c, i) => flattenCard(c, name))];
}

function displayGame(ev: Ev): void {
  const { recruit, recruitSpecial, attack, attackSpecial, soloVP, shard } = getDisplayInfo();
  displayDecks(ev);
  document.getElementById("recruit").innerHTML = recruitSpecial ? `${recruit} <small>(${recruitSpecial})</small>` : `${recruit}`;
  document.getElementById("attack").innerHTML = attackSpecial ? `${attack} <small>(${attackSpecial})</small>` : `${attack}`;
  document.getElementById("shards").innerHTML = shard ? `${shard}` : '';
  if (uiConfig.usesShieldLevel) document.getElementById("shield-level").innerHTML = shieldLevel().toString();
  if (uiConfig.usesHydraLevel) document.getElementById("hydra-level").innerHTML = hydraLevel().toString();
  document.getElementById("vp").innerHTML = `${soloVP}`;
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
function makeSelects(id: string, templateType: 'HEROES' | 'VILLAINS' | 'HENCHMEN' | 'MASTERMINDS' | 'SCHEMES', name: string, values: string[]) {
  let selected = values.map((a, i) => {
    let e = document.getElementById(id + i);
    if (!e) return undefined;
    return (<HTMLSelectElement>e).value;
  });
  document.getElementById(id).innerHTML = values.map((heroName, i) => `<span><div>${name} ${i + 1}</div><div><select id="${id}${i}"></select></div></span>`).join('');
  values.forEach((name, i) => {
    makeOptions(id + i, templateType, selected[i], n => name === undefined || name.split('|').includes(n.templateId));
  });
}
function makeBystanderSelects(id: string, templateType: keyof Templates = 'BYSTANDERS') {
  const e = document.getElementById(id);
  cardTemplates[templateType].each(({set}) => {
    const i = document.createElement('input');
    i.setAttribute('data-set', set);
    i.type = "checkbox";
    e.appendChild(i);
    e.appendChild(document.createTextNode(set))
  });
}
function getBystanderSelects(id: string) {
  const r: string[] = [];
  [...document.getElementById(id).getElementsByTagName('input')].each(e => {
    if (e.checked) r.push(e.getAttribute('data-set'));
  })
  return r;
}
function setBysternderSelects(id: string, value: string[]) {
  [...document.getElementById(id).getElementsByTagName('input')].each(e => {
    e.checked = value.includes(e.getAttribute('data-set'));
  })
}
function getSelects(name: string, t: string[]): boolean {
  return t.map((old, i) => {
    const v = (<HTMLSelectElement>document.getElementById(name + i)).value;
    if (v === "") return false;
    t[i] = v;
    return true;
  }).every(v => v);
}
let globalFormSetup: Setup;
function setupChange(): void {
  const pel = <HTMLSelectElement>document.getElementById("setup_players");
  const sel = <HTMLSelectElement>document.getElementById("setup_scheme");
  const mel = <HTMLSelectElement>document.getElementById("setup_mastermind0");
  if (!sel.value || !mel.value) return;
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
  globalFormSetup = s1 && s2 && s3 ? tmp : undefined;
}
function setupInit(): void {
  makeBystanderSelects("setup_bystanders");
  makeBystanderSelects("setup_sidekicks", 'SIDEKICKS');
  makeBystanderSelects("setup_wounds", 'WOUNDS');
  [...document.getElementsByTagName("input"), ...document.getElementsByTagName("select")].each(i => i.addEventListener("change", setupChange));
  makeOptions("setup_scheme", "SCHEMES", "cardName", undefined);
  makeSelects("setup_mastermind", "MASTERMINDS", "Extra Mastermind", [ undefined ]);
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
function autoOpenPopupDecks() {
  getPopups().each(d => d.getElementsByClassName("select").length && togglePopup(d.id));
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
  openPopups.forEach((e, i) => {
    e.element.style.zIndex = (i + 1).toString();
    e.element.style.top = 40 + (i * 40) + "px";
  });
}
function initUI() {
  window.onclick = clickCard;
  document.getElementById("undo").onclick = () => { undoLog.undo(); startGame(); };
  document.getElementById("restart").onclick = () => { undoLog.restart(); startGame(); };
  document.getElementById("newGame").onclick = () => { undoLog.newGame(); startGame(); };
  document.getElementById("start").onclick = () => { if (globalFormSetup) {
    undoLog.init(globalFormSetup); startGame();
    document.getElementById("setupPage").classList.add("hidden");
    document.getElementById("boardPage").classList.remove("hidden");
  } };
  document.getElementById("nextPlayer").onclick = () => {
    if (currenPlayer < gameState.players.length - 1) {
      updatePlayerDecks(-10);
      currenPlayer++;
    }
  };
  document.getElementById("prevPlayer").onclick = () => {
    if (currenPlayer > 0) {
      updatePlayerDecks(10);
      currenPlayer--;
    }
  };
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
  window.addEventListener("resize", updateSize);
  updateSize();
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
  console.log(undoLog.toString());
  console.log(JSON.stringify(undoLog.gameSetup));
}
function setCurrentPlayer(n: number) {
  if (n !== currenPlayer) setTimeout(() => {
    updatePlayerDecks(10 * (currenPlayer - n));
    currenPlayer = n;
  }, 0);
}
