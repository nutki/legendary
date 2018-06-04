"use strict";
addTemplates("BYSTANDERS", "Legendary", [{ card: [ 30, makeBystanderCard() ] }]);
addTemplates("BYSTANDERS", "Dark City", [
// RESCUE: draw a card.
{ card: [ 4, makeBystanderCard("News Reporter", ev => drawEv(ev)) ] },
// RESCUE: you may KO a Wound from your hand or from any player's discard pile.
{ card: [ 3, makeBystanderCard("Paramedic", ev => selectCardOptEv(ev, "KO a Wound", playerState.hand.deck.concat(gameState.players.map(p => p.discard.deck).merge()).limit(isWound), c => KOEv(ev, c))) ] },
// RESCUE: you may KO one of your Heroes or a Hero from your discard pile.
{ card: [ 4, makeBystanderCard("Radiation Scientist", ev => selectCardOptEv(ev, "KO your Hero", yourHeroes().concat(playerState.discard.deck).limit(isHero), c => KOEv(ev, c))) ] },
]);