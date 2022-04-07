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
    let table = [];
    let hands = [];
    const cardMap = new Map();

    const onCardClicked = event => event.detail.flip();
    const cardDropped = ({cardId, onCard}, group) => {
        console.log(`card ${cardId} dropped on ${onCard.card.getName()} :: ${group.map(e => e.card.getName()).join(', ')}`);
        const existingCard = createNewCard(cardId);
        console.log(`existing card: ${existingCard?.card.getName()}`);
        setGroupCards(group, [...group, existingCard]);
        table = table;
        hands = hands;
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

    const setGroupCards = (groupCards, newCards) => {
        newCards.forEach((serializedCard, index) => {
            const cardSvg = typeof serializedCard === 'string' ? createNewCard(serializedCard) : serializedCard;
            if (groupCards[index] === cardSvg) {
                return;
            }
            groupCards[index] = cardSvg;
        });
        if (groupCards.length > newCards.length) {
            groupCards.splice(newCards.length);
        }
    };
    const setCards = ([newTable, ...newHands]) => {
        setGroupCards(table, newTable);
        newHands.forEach((hand, index) => {
            if (hands.length <= index) {
                hands[index] = [];
            }
            setGroupCards(hands[index], hand);
        });
        // hands = hands;
    };

    const reset = () => {
        table = [];
        hands = [];
    };

    onMount(() => {
        svgDefs.innerHTML = OrdinaryNormalDeck.svgDefs;
        config = new DeckConfig(OrdinaryNormalDeck.config);
        setCards([['HK', 'HQ', 'S10'], ['H2', 'H5', 'CA']]);
    });
</script>

<svg width="0" height="0">
    <defs bind:this={svgDefs}></defs>
</svg>
<div>Length {hands.length}</div>
{#each hands as hand, i (i)}
    <CardGroup type="fan" cards={hand} on:card-svg={onCardClicked} draggableCards on:card-dropped={e => cardDropped(e.detail, hand)}/>
{/each}
<CardGroup cards={table} on:card-svg={onCardClicked} draggableCards on:card-dropped={e => cardDropped(e.detail, table)}/>

