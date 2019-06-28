"use strict";
addBystanderTemplates("Legendary", [[ 30, makeBystanderCard("Bystander") ]]);
addBystanderTemplates("Dark City", [
// RESCUE: draw a card.
[ 4, makeBystanderCard("News Reporter", ev => drawEv(ev, 1, ev.who)) ],
// RESCUE: you may KO a Wound from your hand or from any player's discard pile.
[ 3, makeBystanderCard("Paramedic", ev => selectCardOptEv(ev, "KO a Wound", ev.who.hand.deck.concat(gameState.players.map(p => p.discard.deck).merge()).limit(isWound), c => KOEv(ev, c), undefined, ev.who)) ],
// RESCUE: you may KO one of your Heroes or a Hero from your discard pile.
[ 4, makeBystanderCard("Radiation Scientist", ev => selectCardOptEv(ev, "KO your Hero", yourHeroes(ev.who).concat(ev.who.discard.deck).limit(isHero), c => KOEv(ev, c), undefined, ev.who)) ],
]);
addBystanderTemplates("Villains", [
[ 30, makeBystanderCard("Bystander") ],
// RESCUE: draw an extra card when you draw a new hand at the end of your turn.
[ 3, makeBystanderCard("Computer Hacker", ev => playerState === ev.who && addEndDrawMod(1)) ], // TODO this could be done in muliplayer if endDrawMod moved to playerState
// RESCUE: reveal the top card of your deck. If it costs 0 - KO it.
[ 3, makeBystanderCard("Engineer", ev => lookAtDeckEv(ev, 1, () => ev.who.revealed.limit(c => !c.cost).each(c => KOEv(ev, c)), ev.who)) ],
// RESCUE: gain 1 recruit.
[ 3, makeBystanderCard("Public Speaker", ev => playerState === ev.who && addRecruitEvent(ev, 1)) ],
// RESCUE: kidnap another Bystander.
[ 3, makeBystanderCard("Rockstar", ev => rescueByEv(ev, ev.who)) ],
]);
addBystanderTemplates("Secret Wars Volume 1", [
// RESCUE: you get +2 Recruit, usable only to recruit Heroes in the HQ space under the Bank.
[ 3, makeBystanderCard("Banker", ev => playerState === ev.who && addRecruitSpecialEv(ev, c => isLocation(c.location.below, 'BANK'), 2)) ],
]);
