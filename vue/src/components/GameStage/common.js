import Card from 'lib/game/model/Card.js';
import CardSVG from 'lib/view/CardSVG.js';
import createCardSvg from 'lib/view/createCardSvg.js';
import OrdinaryNormalDeck from 'lib/game/model/OrdinaryNormalDeck.js';
import {ref, computed, onMounted} from 'vue';

export const GAME_ACTION_EVENT_NAME = 'game-action';
export const STAGE_ACTION_EVENT_NAME = 'stage-action';
export const STAGE_MOUNTED_EVENT_NAME = 'stage-mounted';
export const stageEvents = [
    GAME_ACTION_EVENT_NAME,
    STAGE_ACTION_EVENT_NAME,
    STAGE_MOUNTED_EVENT_NAME
];

const observer = {id: null, userId: null, name: 'Spectator', position: null};
const players = ref([]);
const userId = ref(null);
const currentPlayer = computed(() => players.value.find(player => player.userId === userId.value) ?? observer);
const otherPlayers = computed(() => players.value.filter(player => player.id !== currentPlayer.value.id));
const getPlayerById = id => players.value.find(player => player.id === id);
const getPlayerByPosition = position => players.value[position];

export function usePlayers() {
    return {players, currentPlayer, userId, getPlayerById, getPlayerByPosition, otherPlayers};
}

export const stageActions = emit => {
    onMounted(() => emit(STAGE_MOUNTED_EVENT_NAME));
    return (actionName, actionData = null) => emit(STAGE_ACTION_EVENT_NAME, {actionName, actionData});
}

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

const cardMap = new Map();
export const getCardSvg = (card, config) => {
    const serializedCard = card.toString();
    const existingCard = cardMap.get(serializedCard);
    if (existingCard) return existingCard;
    card = card.constructor === String ? Card.fromString(serializedCard, config) : card;
    const cardSvg = new CardSVG(card, createCardSvg(card, OrdinaryNormalDeck.layout));
    Object.freeze(cardSvg);
    cardMap.set(serializedCard, cardSvg);
    return cardSvg;
};

export const clearCardSvgs = () => cardMap.clear();