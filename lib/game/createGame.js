import Game from './Game.js';
import Lobby from './stage/Lobby.js';
import Bidding from './stage/Bidding.js';
import Kitty from './stage/Kitty.js';
import Round from './stage/Round.js';

export default function createGame() {
    const gam = new Game([
        Lobby,
        Bidding,
        Kitty,
        Round,
    ]);
    gam.nextStage();
    return gam;
}