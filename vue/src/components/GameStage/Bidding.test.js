import {mount} from '@vue/test-utils';
import Bidding from './Bidding.vue';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';
import {STAGE_ACTION_EVENT_HANDER, usePlayers} from './common.js';

describe('Bidding', async () => {
    beforeEach(() => {
        const {players, userId} = usePlayers();
        players.value = [
            {name: 'arara', id: 'aaa', position: 3},
            {name: 'barara', id: 'bbb', position: 2},
            {name: 'carara', id: 'ccc', position: 1},
            {name: 'darara', id: 'ddd', position: 0},
        ];
        userId.value = 'ccc';
    });

    test('renders', async () => {
        const wrapper = mount(Bidding);
        expect(wrapper).toBeTruthy();
        expect(wrapper.find('h2').text()).toContain('Players (4)');
    });

    test('emits stage event handler', async () => {
        const wrapper = mount(Bidding);
        const stageEventHandlers = wrapper.emitted()[STAGE_ACTION_EVENT_HANDER];
        // const [, emitButton] = wrapper.findAll('button');
        // await emitButton.trigger('click');
        expect(stageEventHandlers).length(1);
        const [[handler]] = stageEventHandlers;
        handler('deck_config', OrdinaryNormalDeck.config);
        handler('current_bidder', 1);
    });
});