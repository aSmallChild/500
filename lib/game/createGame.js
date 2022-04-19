import Game from './Game.js';
import Lobby from './stage/Lobby.js';
import Bidding from './stage/Bidding.js';
import Kitty from './stage/Kitty.js';

export default function createGame() {
    const gam = new Game([
        Lobby,
        Bidding,
        Kitty,
    ]);
    gam.nextStage();
    return gam;
}