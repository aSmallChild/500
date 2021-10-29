const GAME_ACTION_EVENT_NAME = 'game-action';
const PLAYER_ACTION_EVENT_NAME = 'player-action';

export const common = {
    props: {
        players: Array,
        currentPlayer: Object,
    },
    emits: [
        GAME_ACTION_EVENT_NAME,
        PLAYER_ACTION_EVENT_NAME,
    ],
};

export const playerActions = emit => (actionName, actionData) => emit(PLAYER_ACTION_EVENT_NAME, {actionName, actionData});

export const gameActions = emit => {
    const gameAction = (actionName, actionData) => emit(PLAYER_ACTION_EVENT_NAME, {actionName, actionData});
    return {
        gameAction,
        giveAdmin(player) {
            gameAction('grant_admin', player.id);
        },
        kickPlayer(player) {
            gameAction('kick_player', player.id);
        },
    };
};