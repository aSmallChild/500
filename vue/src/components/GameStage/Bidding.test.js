import {mount} from '@vue/test-utils';
import Bidding from './Bidding.vue';

describe('Bidding', async () => {
    test('renders', async () => {
        const wrapper = mount(Bidding, {
            props: {
                players: [],
                currentPlayer: {name: 'Dog'},
            },
        });
        expect(wrapper).toBeTruthy();
        expect(wrapper.find('h2').text()).toContain('Players (0)');
    });
});