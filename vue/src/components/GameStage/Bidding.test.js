import {mount} from '@vue/test-utils';
import BiddingComponent from './Bidding.vue';
import BiddingStage from '../../../../lib/game/stage/Bidding.js';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import {STAGE_ACTION_EVENT_NAME, STAGE_ACTION_EVENT_HANDER, usePlayers} from './common.js';

const createPlayer = (name, id, position) => ({name, id, position, emit() {}});

describe('Bidding', async () => {
    let stageActionHandler, wrapper, stage, currentPlayer;

    beforeEach(() => {
        const {players, userId} = usePlayers();
        currentPlayer = createPlayer('carara', 'ccc', 1);
        players.value = [
            createPlayer('arara', 'aaa', 3),
            createPlayer('barara', 'bbb', 2),
            currentPlayer,
            createPlayer('darara', 'ddd', 0),
        ];
        userId.value = currentPlayer.id;
        wrapper = mount(BiddingComponent);
        const stageActionHandlers = wrapper.emitted()[STAGE_ACTION_EVENT_HANDER];
        expect(stageActionHandlers).to.have.length(1);
        [[stageActionHandler]] = stageActionHandlers;

        currentPlayer.emit = (event, data) => {
            try {
                if (event == 'stage:action') {
                    const {actionName, actionData} = data;
                    stageActionHandler(actionName, JSON.parse(JSON.stringify(actionData)));
                }
            }
            catch (err) {
                console.log('Error on event', event, JSON.stringify(data))
                console.error(err)
                console.error(err.stack)
            }
        };

        stage = new BiddingStage();

        stage.onStageComplete(dataForNextStage => {});
        stage.setDataStore({});
        stage.setPlayers(players.value);
        stage.setServer({emit: () => {}});
        stage.start({deckConfig: OrdinaryNormalDeck.config});
        // stage.onPlayerDisconnect(player)
        // stage.onObserverConnect(socket)
        // stage.onObserverDisconnect(socket)
        stage.onPlayerConnect(currentPlayer, currentPlayer);

        // todo catch emitted events from component, forward to stage
        // stage.onStageAction(player, socket, actionName, actionData)
    });

    test('renders', async () => {
        expect(wrapper).toBeTruthy();
        expect(wrapper.find('h2').text()).toContain('Players (4)');
    });

    test('emits stage event handler', async () => {
        // const wrapper = mount(BiddingComponent);
        // const [, emitButton] = wrapper.findAll('button');
        // await emitButton.trigger('click');
    });
});