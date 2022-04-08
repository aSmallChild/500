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
    const onCardContextMenu = event => event.detail.flip();

    const findCardHandAndIndex = cardSvg => {
        for (let i = 0; i < hands.length; i++) {
            const oldCardIndex = hands[i].indexOf(cardSvg);
            if (oldCardIndex >= 0) return [i, oldCardIndex];
        }
        return [];
    };

    const cardDropped = ({cardId, onCard}, hand, handIndex) => {
        const cardSvg = getCardSvg(cardId);
        const [oldHandIndex, oldCardIndex] = findCardHandAndIndex(cardSvg);
        moveCardByIndex(oldHandIndex, oldCardIndex, handIndex, hand.indexOf(onCard));
    };

    const moveCardByIndex = (oldHandIndex, oldCardIndex, newHandIndex, newCardIndex) => {
        const cardSvg = hands[oldHandIndex][oldCardIndex];
        const movingWithinSameHand = oldHandIndex === newHandIndex;
        if (oldHandIndex >= 0) {
            hands[oldHandIndex].splice(oldCardIndex, 1);

            if (movingWithinSameHand && newCardIndex > oldCardIndex) {
                newCardIndex--;
            }
        }

        newCardIndex++;
        hands[newHandIndex].splice(newCardIndex, 0, cardSvg);
        hands[newHandIndex] = hands[newHandIndex];
        if (!movingWithinSameHand) {
            hands[oldHandIndex] = hands[oldHandIndex];
        }
    }

    const getCardSvg = (serializedCard) => {
        const existingCard = cardMap.get(serializedCard);
        if (existingCard) return existingCard;
        const card = Card.fromString(serializedCard, config);
        const svg = CardSVGBuilder.getSVG(card, OrdinaryNormalDeck.layout);
        const cardSvg = new CardSVG(card, svg);
        cardMap.set(card.toString(), cardSvg);
        return cardSvg;
    };

    onMount(() => {
        svgDefs.innerHTML = OrdinaryNormalDeck.svgDefs;
        config = new DeckConfig(OrdinaryNormalDeck.config);
        hands = [[], ['HK', 'HQ', 'S10'], ['H2', 'H5', 'CA'], ['D2']].map(hand => hand.map(serializedCard => getCardSvg(serializedCard)));
    });
</script>

<svg width="0" height="0">
    <defs bind:this={svgDefs}></defs>
</svg>
<div>Length {hands.length}</div>
{#each hands as hand, i (i)}
    <CardGroup type="fan" cards={hand} draggableCards
               on:card-click={onCardClicked}
               on:card-contextmenu={onCardContextMenu}
               on:card-dropped={e => cardDropped(e.detail, hand, i)}
    />
{/each}

