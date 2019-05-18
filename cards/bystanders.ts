"use strict";
addBystanderTemplates("Legendary", [[ 30, makeBystanderCard() ]]);
addBystanderTemplates("Dark City", [
// RESCUE: draw a card.
[ 4, makeBystanderCard("News Reporter", ev => drawEv(ev, 1, ev.who)) ],
// RESCUE: you may KO a Wound from your hand or from any player's discard pile.
[ 3, makeBystanderCard("Paramedic", ev => selectCardOptEv(ev, "KO a Wound", ev.who.hand.deck.concat(gameState.players.map(p => p.discard.deck).merge()).limit(isWound), c => KOEv(ev, c), undefined, ev.who)) ],
// RESCUE: you may KO one of your Heroes or a Hero from your discard pile.
[ 4, makeBystanderCard("Radiation Scientist", ev => selectCardOptEv(ev, "KO your Hero", yourHeroes(ev.who).concat(ev.who.discard.deck).limit(isHero), c => KOEv(ev, c), undefined, ev.who)) ],
]);
