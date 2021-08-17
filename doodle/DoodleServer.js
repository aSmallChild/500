import DeckConfig from '../src/game/model/DeckConfig.js';
import Deck from '../src/game/model/Deck.js';
import OrdinaryNormalDeck from '../src/game/model/OrdinaryNormalDeck.js';

export default class DoodleServer {
    constructor() {
        this.config = new DeckConfig(OrdinaryNormalDeck.config);
        this.clients = new Set();
        this.hands = [];
        this.table = [];
        this.clickedCardQueue = [];

        const cards = Deck.buildDeck(this.config);
        for (const card of cards) {
            this.table.push(card);
        }
        this.dealCards();
    }

    socketConnected(socket) {
        const client = socket.of('doodle');
        this.clients.add(client);
        client.on('open', () => this.clients.delete(client));
        client.on('close', () => this.clients.add(client));
        client.on('card', serializedCard => {
            // if (this.clickedCardQueue.length > 1) {
            //     console.log(`clicks waiting in queue: ${this.clickedCardQueue.length}`);
            //     return;
            // }
            // this.processQueue();
            // console.time('card');
            console.log(`Card: ${serializedCard}`);
            const [card, group] = this.takeCardFromGroup(serializedCard);
            this.placeCardSomewhereElse(card, group);
            this.announceCardPositions();
            // console.timeEnd('card');
        });
        client.emit('config', this.config);
        this.updateClientCardPositions(client);
    }

    processQueue() {
        while (this.clickedCardQueue.length) {
            console.time('card');
            const serializedCard = this.clickedCardQueue.shift();
            console.log(`Card: ${serializedCard}`);
            const [card, group] = this.takeCardFromGroup(serializedCard);
            this.placeCardSomewhereElse(card, group);
            this.announceCardPositions();
            console.timeEnd('card');
        }
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

    announceCardPositions() {
        const cards = this.serializeCards();
        for (const client of this.clients) {
            this.updateClientCardPositions(client, cards);
        }
    }

    updateClientCardPositions(client, cards = null) {
        cards = cards || this.serializeCards();
        client.emit('cards', cards);
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
