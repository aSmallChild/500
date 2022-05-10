import {mount} from '@vue/test-utils';
import {GameAction} from '../../../../lib/game/GameAction.js';
import BiddingComponent from './Bidding.vue';
import BiddingStage from '../../../../lib/game/stage/Bidding.js';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import {STAGE_ACTION_EVENT_NAME, STAGE_ACTION_EVENT_HANDER, usePlayers} from './common.js';

const createPlayer = (name, id, position) => ({userId: id, name, id, position, emit() {}});

describe('Bidding', async () => {
    let stageActionHandler, wrapper, stage, currentPlayer, players, getPlayerByPosition;
    const forwardEventToStage = event => {
        let [{actionName, actionData}] = event;
        actionData = JSON.parse(JSON.stringify(actionData));
        stage.onStageAction(currentPlayer.value, currentPlayer.value, actionName, actionData);
    }
    const forwardEventToComponent = (event, data) => {
        try {
            if (event == 'stage:action') {
                let {actionName, actionData} = data;
                actionData = JSON.parse(JSON.stringify(actionData));
                stageActionHandler(actionName, actionData);
            }
        } catch (err) {
            console.error('Error on event', event, JSON.stringify(data));
            console.error(err);
            console.error(err.stack);
            throw err;
        }
    }

    beforeEach(() => {
        const p = usePlayers();
        getPlayerByPosition = p.getPlayerByPosition;
        currentPlayer = p.currentPlayer;
        players = [
            createPlayer('darara', 'ddd', 0),
            createPlayer('carara', 'ccc', 1),
            createPlayer('barara', 'bbb', 2),
            createPlayer('arara', 'aaa', 3),
        ];
        p.players.value = players;
        p.userId.value = 'ccc';

        wrapper = mount(BiddingComponent);
        const stageActionHandlers = wrapper.emitted()[STAGE_ACTION_EVENT_HANDER];
        expect(stageActionHandlers).to.have.length(1);
        [[stageActionHandler]] = stageActionHandlers;

        currentPlayer.value.emit = (event, data) => forwardEventToComponent(event, data);

        stage = new BiddingStage();
        stage.onStageComplete(dataForNextStage => {});
        stage.setDataStore({});
        stage.setPlayers(players);
        stage.setServer(currentPlayer.value);
        stage.start({deckConfig: OrdinaryNormalDeck.config});
        stage.onPlayerConnect(currentPlayer.value, currentPlayer.value);
    });

    test('renders', async () => {
        expect(wrapper).toBeTruthy();
        expect(wrapper.find('[data-test="player-heading"]').text()).toContain('Players (4)');
    });
    test('place bid', async () => {
        let currentBidder;
        const setCurrentBidder = async () => {
            currentBidder = getPlayerByPosition(stage.currentBidderPosition);
            await wrapper.vm.$nextTick();
        };
        await setCurrentBidder();
        stage.onStageAction(currentBidder, currentBidder, GameAction.PLACE_BID, '6S:40');
        await setCurrentBidder();
        expect(currentBidder).toStrictEqual(currentPlayer.value);

        const bidSelector = wrapper.findComponent({name: 'BidSelector'});
        const bidButton = bidSelector.find('[data-test="place-bid-button"]');
        expect(bidButton.text()).toContain('Place Bid');
        await bidButton.trigger('click');
        expect(wrapper.emitted()[STAGE_ACTION_EVENT_NAME]).to.have.length(1);
        forwardEventToStage(wrapper.emitted()[STAGE_ACTION_EVENT_NAME][0]);
        expect(bidSelector.find('[data-test="bid-error"]').text()).to.equal('');
    });
});