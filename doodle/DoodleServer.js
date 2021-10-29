import DeckConfig from '../src/game/model/DeckConfig.js';
import Deck from '../src/game/model/Deck.js';
import OrdinaryNormalDeck from '../src/game/model/OrdinaryNormalDeck.js';

export default class DoodleServer {
    constructor(channel) {
        this.config = new DeckConfig(OrdinaryNormalDeck.config);
        this.config.cardsPerHand = 8 + 6 * Math.random() >> 0;
        this.config.kittySize = 2 + 4 * Math.random() >> 0;
        this.config.totalHands = 2 + 4 * Math.random() >> 0;
        this.setChannel(channel);
        this.hands = [];
        this.table = [];

        const cards = Deck.buildDeck(this.config);
        for (const card of cards) {
            this.table.push(card);
        }
        this.dealCards();
    }

    setChannel(channel) {
        this.channel = channel;
        channel.onObserver(observer => {
            this.clientConnected(observer);
            observer.on('card', serializedCard => {
                const [card, group] = this.takeCardFromGroup(serializedCard);
                this.placeCardSomewhereElse(card, group);
                this.updateChannelCardPositions();
            });
        });
    }

    clientConnected(client) {
        client.emit('config', this.config);
        this.updateClientCardPositions(client);
    }

    takeCardFromGroup(serializedCard) {
        for (const group of [this.table, ...this.hands]) {
            const index = group.findIndex(card => card.toString() === serializedCard);
            if (index >= 0) {
                const card = group[index];
                group.splice(index, 1);
                return [card, group];
            }
        }
        return [null, null];
    }

    placeCardSomewhereElse(card, oldGroup) {
        const target = oldGroup !== this.table ? this.table : this.getSmallestHand();
        target.push(card);
    }

    getSmallestHand() {
        let smallestHand = null;
        for (const hand of this.hands) {
            if (!smallestHand || smallestHand.length > hand.length) {
                smallestHand = hand;
            }
        }
        return smallestHand;
    }

    updateChannelCardPositions() {
        this.channel.emit('cards', this.serializeCards());
    }

    updateClientCardPositions(client) {
        client.emit('cards', this.serializeCards());
    }

    serializeCards() {
        const newGroups = [];
        for (const group of [this.table, ...this.hands]) {
            const newGroup = [];
            for (const card of group) {
                newGroup.push(card.toString());
            }
            newGroups.push(newGroup);
        }
        return newGroups;
    }

    dealCards() {
        for (let i = 0; i < this.config.totalHands; i++) {
            const hand = [];
            for (let j = 0; j < this.config.cardsPerHand; j++) {
                hand.push(this.table.pop());
            }
            this.hands.push(hand);
        }
    }
}
