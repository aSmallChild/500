<template>
    <svg width="0" height="0">
        <defs ref="svgDefs"></defs>
    </svg>
    <n-space justify="center" align="center" class="full-height">
        <n-button @click="newChannel">New</n-button>
        <n-input-group>
            <n-input placeholder="Code" v-model:value="channelName"/>
            <n-button @click="channelLogin">Join</n-button>
        </n-input-group>
        <card-group fan v-for="hand in hands" :cards="hand" :key="hand" @card-svg="onCardClicked" draggable-cards @card-drop="cardDropped($event, hand)"/>
        <card-group pile :cards="table" @card-svg="onCardClicked" draggable-cards @card-drop="cardDropped($event, table)"/>
    </n-space>
</template>

<script>
import {ref, onMounted, onUnmounted} from 'vue';
import CardGroup from '../vue/src/components/CardGroup.vue';
import DeckConfig from '../lib/game/model/DeckConfig.js';
import OrdinaryNormalDeck from '../lib/game/model/OrdinaryNormalDeck.js';
// import Client from '../lib/client/Client.js';
import Card from '../lib/game/model/Card.js';
import CardSVGBuilder from '../lib/view/CardSVGBuilder.js';
import CardSVG from '../lib/view/CardSVG.js';
import {useRoute} from 'vue-router';
import {NButton, NSpace, NInput, NInputGroup} from 'naive-ui';

export default {
    components: {
        CardGroup, NButton, NSpace, NInput, NInputGroup,
    },
    setup() {
        const route = useRoute();
        let config = null;
        const svgDefs = ref();
        const urlChannelName = ref(route.params.id);
        const channelName = ref(urlChannelName.value);
        const table = ref([]);
        const hands = ref([]);
        const client = Client.client;
        const cardMap = new Map();
        let channel = null;

        // const onCardClicked = card => channel.emit('card', card);
        const onCardClicked = card => card.flip();
        const cardDropped = ({cardId, onCard}, group) => {
            channel.emit('target', {cardId, onCardId: onCard?.card, target: hands.value.indexOf(group)});
        };

        const createNewCard = (serializedCard) => {
            const existingCard = cardMap.get(serializedCard);
            if (existingCard) return existingCard;
            const card = Card.fromString(serializedCard, config);
            const svg = CardSVGBuilder.getSVG(card, OrdinaryNormalDeck.layout);
            const cardSvg = new CardSVG(card, svg);
            Object.freeze(cardSvg);
            cardMap.set(card.toString(), cardSvg);
            return cardSvg;
        };

        const setGroupCards = (thisGroup, otherGroup) => {
            otherGroup.forEach((serializedCard, index) => {
                const cardSvg = createNewCard(serializedCard);
                if (thisGroup[index] === cardSvg) {
                    return;
                }
                thisGroup[index] = cardSvg;
            });
            if (thisGroup.length > otherGroup.length) {
                thisGroup.splice(otherGroup.length);
            }
        };
        const setCards = groups => {
            const [newTable, ...newHands] = groups;
            setGroupCards(table.value, newTable);
            newHands.forEach((hand, index) => {
                if (hands.value.length < index + 1) {
                    hands.value.push([]);
                }
                setGroupCards(hands.value[index], hand);
            });
        };

        const leaveChannel = () => {
            if (!channel) {
                return;
            }
            channel.leave();
            channel = null;
            table.value = [];
            hands.value = [];
        };

        const newChannel = async () => {
            try {
                leaveChannel();
                const [newChannel, response] = await client.requestNewChannel('doodle', 'password123');
                if (!newChannel) {
                    console.error(response.message);
                    return;
                }
                channel = newChannel;
                channelName.value = channel.name;
                joinChannel();
            } catch (err) {
                console.error(err);
            }
        };

        const channelLogin = async () => {
            try {
                leaveChannel();
                channel = client.getChannel(`doodle:${channelName.value}`, channelName.value);
                const response = await channel.login('password123');
                if (!response.success) {
                    console.error('Failed to login to channel');
                    return;
                }
                joinChannel();

            } catch (err) {
                console.error(err);
            }
        };

        const joinChannel = async () => {
            try {
                channel.on('cards', cards => setCards(cards));
                channel.on('config', newConfig => config = new DeckConfig(newConfig));
                await channel.join();
            } catch (err) {
                console.error(err);
            }
        };

        onMounted(async () => {
            svgDefs.value.innerHTML += OrdinaryNormalDeck.svgDefs;
            if (channelName.value) {
                channelLogin();
            }
        });
        onUnmounted(() => {
            leaveChannel();
        });

        return {
            svgDefs,
            table,
            hands,
            channelName,
            newChannel,
            channelLogin,
            onCardClicked,
            cardDropped,
        };
    },
};
</script>
