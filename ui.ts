// GUI
const uiConfig = {
  usesShieldLevel: false,
  usesHydraLevel: false,
}
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
  name = name.toLowerCase().replace(/ /g, "_").replace(/[^a-z0-9_]/g, "");
  if (card.set && card.set !== 'Legendary') path = card.set + '/' + path;
  return "images/" + path + "/" + name + ".jpg";
}
function cardImageName(card: Card): string {
  if (card.cardType === "HERO") return imageName("heroes", card, card.heroName);
  if (card.cardType === "VILLAIN" && card.isHenchman) return imageName("henchmen", card);
  if (card.cardType === "VILLAIN") return imageName("villains", card, card.villainGroup);
  if (card.cardType === "MASTERMIND") return imageName("masterminds", card);
  if (card.cardType === "TACTICS") return imageName("masterminds", card, card.mastermindName);
  if (card.cardType === "SCHEME") return imageName("schemes", card);
  if (card.cardType === "BYSTANDER" && card.set !== "Legendary") return imageName("bystanders", card); 
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
  positionCard(r, 'large', 7, 0);
  document.getElementById("card-container").appendChild(r);
}
function clearSourceImg() {
  document.getElementById("source2").remove();
}
function makeDisplayPlayAreaImg(c: Card) {
  const gone = !playerState.playArea.deck.includes(c);;
  return makeDisplayCardImg(c, gone);
}
function img(src: string, className?: string) {
  const e = document.createElement('img');
  e.setAttribute('class', className);
  e.setAttribute('src', src);
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
function makeDisplayCardImg(c: Card, gone: boolean = false, id: boolean = true): HTMLDivElement {
  const faceUp = isFaceUp(c);
  const src = faceUp ? cardImageName(c) : 'images/back.jpg';
  const options: {[key: string]: string} = {
    onmouseover: `setSourceImg('${src}')`,
    onmouseleave: "clearSourceImg()",
  };
  if (id) options.id = c.id;
  const d = div(gone ? "card gone" : "card", options, img(src, "cardface"));
  if (isMastermind(c)) d.appendChild(div("count", {}, text(c.attached("TACTICS").size)))
  if (isScheme(c) && getSchemeCountdown() !== undefined)
    d.appendChild(div("count", {}, text(getSchemeCountdown())))
  if (faceUp && c.defense !== c.printedDefense)
    d.appendChild(div("attackHint", {}, text(c.defense)));
  if (c.captured.size > 0) d.appendChild(div("capturedHint", {}, text(c.captured.size)));
  d.appendChild(div("frame"));
  return d;
}
function positionCard(card: HTMLElement, scale: string | undefined, x: number, y: number, i: number = 0) {
  card.style.position = "absolute";
  card.style.top = y * 288 + (y >= 2 ? 60 : 0) + "px";
  card.style.left = (x + i) * 212 + "px";
  if (scale) card.classList.add(scale);
}
const mainDecks = [
  { id: 'MASTERMIND', x: 0, y: 0 },
  { id: 'BRIDGE', x: 1, y: 0 },
  { id: 'STREETS', x: 2, y: 0 },
  { id: 'ROOFTOPS', x: 3, y: 0 },
  { id: 'BANK', x: 4, y: 0 },
  { id: 'SEWERS', x: 5, y: 0 },
  { id: 'SCHEME', x: 6, y: 0 },
  { id: 'HQ1', x: 1, y: 1 },
  { id: 'HQ2', x: 2, y: 1 },
  { id: 'HQ3', x: 3, y: 1 },
  { id: 'HQ4', x: 4, y: 1 },
  { id: 'HQ5', x: 5, y: 1 },
  { id: 'SHIELDOFFICER', x: 0, y: 1, size: 'small', count: 'OFFICER' },
  { id: 'SIDEKICK', x: .5, y: 1, size: 'small', count: 'SIDEKICK' },
  { id: 'MADAME', x: 0, y: 1.5, size: 'small' },
  { id: 'NEWRECRUIT', x: .5, y: 1.5, size: 'small' },
  { id: 'VILLAIN', x: 6, y: 1, size: 'small', count: 'VILLAIN' },
  { id: 'ESCAPED', x: 6.5, y: 1, size: 'small', count: 'ESCAPED', popupid: 'popescaped' },
  { id: 'KO', x: 6, y: 1.5, size: 'small', count: 'KO', popupid: 'popko' },
  { id: 'WOUNDS', x: 6.5, y: 1.5, size: 'small', count: 'WOUNDS' },
  { id: 'PLAYAREA0', x: 0, y: 2, w: 9 },
  { id: 'HAND0', x: 1, y: 3, w: 8 },
  { id: 'DECK0', x: 0, y: 3, size: 'small', count: 'DECK', popupid: 'popdeck'},
  { id: 'DISCARD0', x: .5, y: 3, size: 'small', count: 'DISCARD', popupid: 'popdiscard'},
  { id: 'VICTORY0', x: 0, y: 3.5, size: 'small', count: 'VP', popupid: 'popvictory'},
];
const popupDecks = [
  { id: 'DISCARD0', container: 'popdiscard' },
  { id: 'DECK0', container: 'popdeck' },
  { id: 'VICTORY0', container: 'popvictory' },
  { id: 'KO', container: 'popko' },
  { id: 'ESCAPED', container: 'popescaped' },
];
function displayDecks(ev: Ev): void {
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
    const deck = deckById[deckPos.id];
    const d = div('deck', { id: deck.id });
    let topDiv = d;
    positionCard(d, deckPos.size, deckPos.x, deckPos.y);
    cardsContainer.appendChild(d);
    const cardDivs = deck.id === "PLAYAREA0" ? [
      ...playerState.artifact.deck.map(c => makeDisplayCardImg(c)),
      ...turnState.cardsPlayed.filter(c => !playerState.artifact.has(v => v === c)).map(makeDisplayPlayAreaImg),
      ...deck.deck.filter(c => !turnState.cardsPlayed.includes(c)).map(c => makeDisplayCardImg(c)),
    ] : deckPos.w > 1 ? deck.deck.map(card => makeDisplayCardImg(card)) :
    deck.size ? [ makeDisplayCardImg(deck.top, false, !deckPos.popupid) ] : [];
    const n = cardDivs.size;
    const spread = deckPos.w > 1 && cardDivs.size ? Math.min(1, (deckPos.w - 1) / (n - 1)) : 0;
    cardDivs.forEach((cardDiv, i) => {
      cardsContainer.appendChild(cardDiv);
      cardDiv.setAttribute('data-deck-id', deck.id);
      positionCard(cardDiv, deckPos.size, deckPos.x, deckPos.y, i * spread);
      topDiv = cardDiv;
    });
    if (deckPos.popupid) topDiv.addEventListener("click", () => document.getElementById(deckPos.popupid).classList.toggle("hidden"));
    const d1 = div('deck-overlay', { 'data-deck-id': deck.id });
    positionCard(d1, deckPos.size, deckPos.x, deckPos.y);
    cardsContainer.appendChild(d1);
    if (deckPos.count) {
      if (deckPos.count === 'VP') {
        d1.appendChild(img("icons/VP.png", "vpcount"));
        d1.appendChild(div("deckcount vpcount", {}, text(currentVP(playerState))));
      } else if(deckPos.count) d1.appendChild(div('deckcount', {}, span('name', {}, text(deckPos.count)), br(), text(deck.size)));
    }
  }
  for (const popupDeck of popupDecks) {
    const container = document.getElementById(popupDeck.container);
    container.innerHTML = '';
    const deck = deckById[popupDeck.id];
    deck.deck.forEach((card, i) => {
      const cardDiv = makeDisplayCardImg(card);
      container.appendChild(cardDiv);
      positionCard(cardDiv, undefined, 0, 0, deck.deck.size - 1 - i);
    });
  }
  const s = ev.type === 'CONFIRM' && ev.what ? ev.what : ev.getSource();
  if (s instanceof Card) {
    const sDiv = makeDisplayCardImg(s, false, false);
    positionCard(sDiv, 'large', 7, 0);
    cardsContainer.appendChild(sDiv);
  }
  let divs = document.getElementsByClassName("text-deck");
  for (const div of divs) {
    let deck = deckById[div.getAttribute("data-id")];
    div.innerHTML = deck.id + makeDisplayAttached(deck) + ': ' + deck.deck.map(makeDisplayCard).join(' ');
  }
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
  document.getElementById("game-over-message").innerHTML = gameOverMsg;
}

// Game setup selection screen
function makeOptions(id: string, templateType: keyof Templates, nameProp: 'name' | 'cardName', current: string, f: (name: any) => boolean = () => true) {
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
    option.text = s[nameProp];
    option.value = s.templateId;
    if (current === s.templateId) option.selected = true;
    el.add(option);
  });
}
function makeSelects(id: string, templateType: keyof Templates, nameProp: 'name' | 'cardName', name: string, values: string[]) {
  let selected = values.map((a, i) => {
    let e = document.getElementById(id + i);
    if (!e) return undefined;
    return (<HTMLSelectElement>e).value;
  });
  document.getElementById(id).innerHTML = values.map((heroName, i) => `${name} ${i + 1}: <select id="${id}${i}"></select>`).join(' ');
  values.forEach((name, i) => {
    makeOptions(id + i, templateType, nameProp, selected[i], n => name === undefined || n.templateId === name);
  });
}
function makeBystanderSelects(id: string) {
  const e = document.getElementById(id);
  cardTemplates.BYSTANDERS.each(({set}) => {
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
  makeSelects("setup_heroes", "HEROES", "name", "Hero", tmp.heroes);
  makeSelects("setup_villains", "VILLAINS", "name", "Villains Group", tmp.villains);
  makeSelects("setup_henchmen", "HENCHMEN", "cardName", "Henchmen Group", tmp.henchmen);
  makeSelects("setup_mastermind", "MASTERMINDS", "cardName", "Mastermind", tmp.mastermind);
  const s1 = getSelects("setup_heroes", tmp.heroes);
  const s2 = getSelects("setup_villains", tmp.villains);
  const s3 = getSelects("setup_henchmen", tmp.henchmen);
  const s4 = getSelects("setup_mastermind", tmp.mastermind);
  tmp.bystanders = getBystanderSelects("setup_bystanders");
  tmp.withOfficers = (<HTMLInputElement>document.getElementById('withOfficers')).checked;
  tmp.withSidekicks = (<HTMLInputElement>document.getElementById('withSidekicks')).checked;
  tmp.withSpecialOfficers = (<HTMLInputElement>document.getElementById('withSpecialOfficers')).checked;
  tmp.withSpecialSidekicks = (<HTMLInputElement>document.getElementById('withSpecialSidekicks')).checked;
  tmp.withWounds = true;
  tmp.withBindings = true;
  tmp.withMadame = (<HTMLInputElement>document.getElementById('withMadame')).checked;
  tmp.withNewRecruits = (<HTMLInputElement>document.getElementById('withNewRecruits')).checked;
  tmp.handType = (<HTMLInputElement>document.getElementById('handType')).value === 'HYDRA' ? 'HYDRA' : 'SHIELD';
  tmp.cityType = (<HTMLInputElement>document.getElementById('cityType')).value === 'VILLAIN' ? 'VILLAIN' : 'HERO';
  tmp.withShards = true;
  globalFormSetup = s1 && s2 && s3 ? tmp : undefined;
}
function setupInit(): void {
  makeBystanderSelects("setup_bystanders");
  [...document.getElementsByTagName("input"), ...document.getElementsByTagName("select")].each(i => i.addEventListener("change", setupChange));
  makeOptions("setup_scheme", "SCHEMES", "cardName", undefined);
  makeSelects("setup_mastermind", "MASTERMINDS", "cardName", "Extra Mastermind", [ undefined ]);
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
  makeSelects("setup_heroes", "HEROES", "name", "Hero", tmp.heroes);
  makeSelects("setup_villains", "VILLAINS", "name", "Villains Group", tmp.villains);
  makeSelects("setup_henchmen", "HENCHMEN", "cardName", "Henchmen Group", tmp.henchmen);
  makeSelects("setup_mastermind", "MASTERMINDS", "cardName", "Mastermind", tmp.mastermind);
  chooseSelects("setup_heroes", s.heroes);
  chooseSelects("setup_villains", s.villains);
  chooseSelects("setup_henchmen", s.henchmen);
  chooseSelects("setup_mastermind", s.mastermind);
  (<HTMLInputElement>document.getElementById('withMadame')).checked = s.withMadame;
  (<HTMLInputElement>document.getElementById('withNewRecruits')).checked = s.withNewRecruits;
  (<HTMLInputElement>document.getElementById('withOfficers')).checked = s.withOfficers;
  (<HTMLInputElement>document.getElementById('withSidekicks')).checked = s.withSidekicks;
  (<HTMLInputElement>document.getElementById('withSpecialOfficers')).checked = s.withSpecialOfficers;
  (<HTMLInputElement>document.getElementById('withSpecialSidekicks')).checked = s.withSpecialSidekicks;
  (<HTMLSelectElement>document.getElementById('handType')).value = s.handType;
  (<HTMLSelectElement>document.getElementById('cityType')).value = s.cityType;
  setBysternderSelects("setup_bystanders", s.bystanders);
  globalFormSetup = s;
}
function getPopups() {
  const popups: HTMLElement[] = Array.prototype.slice.call(document.getElementsByClassName("popup"), 0);
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
  getPopups().each(d => d.getElementsByClassName("select").length && d.classList.remove("hidden"));
}
function initUI() {
  window.onclick = clickCard;
  getPopups().forEach(e => e.addEventListener("wheel", function(e) {
    this.scrollLeft += (e.deltaY * 10);
    e.preventDefault();
  }));
  getDecks().forEach(div => {
    let popup = div.getAttribute("data-popupid");
    if (popup) {
      let e = document.getElementById(popup);
      div.addEventListener("click", ev => e.classList.toggle("hidden"));
    }
  });
  document.getElementById("undo").onclick = () => { undoLog.undo(); startGame(); };
  document.getElementById("restart").onclick = () => { undoLog.restart(); startGame(); };
  document.getElementById("newGame").onclick = () => { undoLog.newGame(); startGame(); };
  document.getElementById("start").onclick = () => { if (globalFormSetup) { undoLog.init(globalFormSetup); startGame(); } };
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
