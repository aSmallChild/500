<template>
    <div>
        <svg width="0" height="0">
            <defs ref="svgDefs"></defs>
        </svg>
        <div style="text-align: center;">
            <v-btn color="secondary" @click="newChannel">New</v-btn>
            Name: <input v-model="channelName"/>
            <v-btn color="secondary" @click="channelLogin">Join</v-btn>
        </div>
        <card-group fan v-for="hand in hands" :cards="hand" :key="hand" @card="onCardClicked" draggable-cards @card-drop="cardDropped($event, hand)"/>
        <card-group pile :cards="table" @card="onCardClicked" draggable-cards @card-drop="cardDropped($event, table)"/>
    </div>
</template>

<script>
import {ref, onMounted, onUnmounted} from 'vue';
import CardGroup from '../vue/components/CardGroup.vue';
import DeckConfig from '../src/game/model/DeckConfig.js';
import OrdinaryNormalDeck from '../src/game/model/OrdinaryNormalDeck.js';
import Client from '../src/client/Client.js';
import Card from '../src/game/model/Card.js';
import CardSVGBuilder from '../src/view/CardSVGBuilder.js';
import CardSVG from '../src/view/CardSVG.js';

export default {
    components: {
        CardGroup,
    },
    setup() {
        let config = null;
        const svgDefs = ref();
        const channelName = ref('');
        const table = ref([]);
        const hands = ref([]);
        const client = Client.client;
        const cardMap = new Map();
        let channel = null;

        const onCardClicked = card => channel.emit('card', card);
        const cardDropped = ({cardId, onCard}, group) => {
            channel.emit('target', {cardId, onCardId: onCard?.card, target: hands.value.indexOf(group)});
        }

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
        });
        onUnmounted(() => {
            leaveChannel();
        });

        return {
            createNewCard,
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
