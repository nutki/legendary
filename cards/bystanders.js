"use strict";
/* global isWound, isHero, yourHeroes, playerState, gameState */
addTemplates("BYSTANDERS", "Legendary", [{ card: [30, makeBystanderCard()] }]);
addTemplates("BYSTANDERS", "Dark City", [
    // RESCUE: draw a card.
    { card: [4, makeBystanderCard("News Reporter", ev => drawEv(ev))] },
    // RESCUE: you may KO a Wound from your hand or from any player's discard pile.
    { card: [3, makeBystanderCard("Paramedic", ev => selectCardOptEv(ev, "KO a Wound", gameState.players.map(p => p.discard).reduce((a, d) => a.concat(d), playerState.hand).limit(isWound), c => KOEv(ev, c)))] },
    // RESCUE: you may KO one of your Heroes or a Hero from your discard pile.
    { card: [4, makeBystanderCard("Radiation Scientist", ev => selectCardOptEv(ev, "KO your Hero", yourHeroes().concat(playerState.discard).limit(isHero), c => KOEv(ev, c)))] },
]);
