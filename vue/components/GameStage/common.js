const GAME_ACTION_EVENT_NAME = 'game-action';
const STAGE_ACTION_EVENT_NAME = 'stage-action';
export const GAME_ACTION_EVENT_HANDER = 'game-action-handler';
export const STAGE_ACTION_EVENT_HANDER = 'stage-action-handler';

export const common = {
    props: {
        players: Array,
        currentPlayer: Object,
    },
    emits: [
        GAME_ACTION_EVENT_NAME,
        STAGE_ACTION_EVENT_NAME,
        GAME_ACTION_EVENT_HANDER,
        STAGE_ACTION_EVENT_HANDER,
    ],
};

export const stageActions = emit => (actionName, actionData) => emit(STAGE_ACTION_EVENT_NAME, {actionName, actionData});

export const gameActions = emit => {
    const gameAction = (actionName, actionData) => emit(GAME_ACTION_EVENT_NAME, {actionName, actionData});
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