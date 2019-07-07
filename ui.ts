// GUI
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
  if (card.cardType === "TACTICS") return imageName("masterminds", card, card.mastermind.cardName);
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
  const r = `<div class="card"><img class="cardface" src="${name}"><div class="frame"></div></div>`;
  document.getElementById("source").innerHTML = r;
}
function clearSourceImg() {
  document.getElementById("source").innerHTML = sourceOrg;
}
function makeDisplayCardImg(c: Card, back: boolean = false, gone: boolean = false, id: boolean = true): string {
  const extraClasses = gone ? " gone" : "";
  const src = back ? 'images/back.jpg' : cardImageName(c);
  const hover = `onmouseover="setSourceImg('${src}')" onmouseleave="clearSourceImg()"`;
  let r = '';
  r += id ? `<div ${hover} class="card${extraClasses}" id="${c.id}">` : `<div ${hover} class="card${extraClasses}">`;
  r += `<img class="cardface" src="${src}">`
  if (isMastermind(c)) r += `<div class="count">${c.attached("TACTICS").size}</div>`;
  if (isScheme(c) && getSchemeCountdown() !== undefined)
    r += `<div class="count">${getSchemeCountdown()}</div>`;
  if (!back && c.defense !== c.printedDefense) r += `<div class="attackHint">${c.defense}</div>`
  if (c.captured.size > 0) r += `<div class="capturedHint">${c.captured.size}</div>`
  r += `<div class="frame"></div></div>`;
  return r;
}
function makeDisplayPlayAreaImg(c: Card): string {
  const gone = !playerState.playArea.deck.includes(c);;
  return makeDisplayCardImg(c, false, gone);
}
function displayDecks(): void {
  let divs = document.getElementsByClassName("deck");
  let list = Deck.deckList;
  let deckById:{[id: string]:Deck} = {};
  for (let i = 0; i < list.length; i++) deckById[list[i].id] = list[i];
  for (let i = 0; i < divs.length; i++) {
    let div = divs[i];
    let deck = deckById[div.getAttribute("data-id")];
    let fanout = div.getAttribute("data-fanout");
    let mode = div.getAttribute("data-mode");
    let count = div.getAttribute("data-count");
    let popup = div.getAttribute("data-popupid");
    let html = '';
    if (mode === "IMG") {
      if (deck.id === "PLAYAREA0") {
        html = playerState.artifact.deck.map(c => makeDisplayCardImg(c)) +
          turnState.cardsPlayed.filter(c => !playerState.artifact.has(v => v === c)).map(makeDisplayPlayAreaImg).join('');
      } else if (fanout) {
        html = deck.deck.map(c => makeDisplayCardImg(c, !deck.faceup)).reverse().join('');
      } else {
        html = deck.size ? makeDisplayCardImg(deck.top, !deck.faceup, false, popup === null) : '';
      }
      if (count === "1") {
      }
      if (count === "VP") {
        html += '<img class="vpcount" src="icons/VP.png">';
        html += '<div class="deckcount vpcount">' + currentVP(playerState) + '</div>';
      } else if (count) {
        html += `<div class="deckcount"><span class="name">${count}</span><br>${deck.size}</div>`;
      }
    } else {
      html = deck.id + makeDisplayAttached(deck) + ': ' + deck.deck.map(makeDisplayCard).join(' ');
    }
    div.innerHTML = html;
  }
}
function eventSource(ev: Ev): string {
  const s = ev.getSource();
  return s instanceof Card ? makeDisplayCardImg(s, false, false, false) : "";
}
let sourceOrg = "";
function displayGame(ev: Ev): void {
  const { recruit, recruitSpecial, attack, attackSpecial, soloVP, shard } = getDisplayInfo();
  displayDecks();
  document.getElementById("source").innerHTML = sourceOrg = eventSource(ev);
  document.getElementById("recruit").innerHTML = recruitSpecial ? `${recruit} <small>(${recruitSpecial})</small>` : `${recruit}`;
  document.getElementById("attack").innerHTML = attackSpecial ? `${attack} <small>(${attackSpecial})</small>` : `${attack}`;
  document.getElementById("shards").innerHTML = shard ? `${shard}` : '';
  document.getElementById("vp").innerHTML = `${soloVP}`;
}
function setMessage(msg: string): void {
  document.getElementById("message").innerHTML = msg;
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
}
