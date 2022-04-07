<script>
    import {onMount} from 'svelte';

    import CardGroup from '../components/CardGroup.svelte';
    import DeckConfig from '../../../lib/game/model/DeckConfig.js';
    import OrdinaryNormalDeck from '../../../lib/game/model/OrdinaryNormalDeck.js';
    import Card from '../../../lib/game/model/Card.js';
    import CardSVGBuilder from '../../../lib/view/CardSVGBuilder.js';
    import CardSVG from '../../../lib/view/CardSVG.js';

    let svgDefs;
    let config = null;
    let hands = [];
    const cardMap = new Map();

    const onCardClicked = event => event.detail.flip();
    const cardDropped = ({cardId, onCard}, hand, handIndex) => {
        const cardSvg = getCardSvg(cardId);
        let onCardIndex = hand.indexOf(onCard);
        console.log(`card ${cardSvg?.card.getName()} dropped on ${onCard?.card.getName() ?? `hand ${handIndex}`} :: ${hand.map(e => e.card.getName()).join(', ')}`);

        for (let i = 0; i < hands.length; i++) {
            const oldCardIndex = hands[i].indexOf(cardSvg);
            if (oldCardIndex < 0) continue;

            hands[i].splice(oldCardIndex, 1);
            if (i === handIndex) {
                if (onCardIndex > oldCardIndex) {
                    onCardIndex--;
                }
                continue;
            }

            hands[i] = hands[i];
        }

        if (onCardIndex >= 0) {
            console.log('placing at index', onCardIndex + 1);
            hand.splice(onCardIndex + 1, 0, cardSvg);
        } else {
            console.log('adding to the end');
            hand.push(cardSvg);
        }

        hands[handIndex] = hand;
    };

    const getCardSvg = (serializedCard) => {
        const existingCard = cardMap.get(serializedCard);
        if (existingCard) return existingCard;
        const card = Card.fromString(serializedCard, config);
        const svg = CardSVGBuilder.getSVG(card, OrdinaryNormalDeck.layout);
        const cardSvg = new CardSVG(card, svg);
        // Object.freeze(cardSvg);
        cardMap.set(card.toString(), cardSvg);
        return cardSvg;
    };

    const setCards = (newHands) => {
        newHands.forEach((hand, index) => {
            if (hands.length <= index) {
                hands.push([]);
            }
            hands[index] = hand;
        });
    };

    onMount(() => {
        svgDefs.innerHTML = OrdinaryNormalDeck.svgDefs;
        config = new DeckConfig(OrdinaryNormalDeck.config);
        setCards([[], ['HK', 'HQ', 'S10'], ['H2', 'H5', 'CA'], ['D2']].map(hand => hand.map(serializedCard => getCardSvg(serializedCard))));
    });
</script>

<svg width="0" height="0">
    <defs bind:this={svgDefs}></defs>
</svg>
<div>Length {hands.length}</div>
{#each hands as hand, i (i)}
    <CardGroup type="fan" cards={hand} on:card-svg={onCardClicked} draggableCards on:card-dropped={e => cardDropped(e.detail, hand, i)}/>
{/each}

