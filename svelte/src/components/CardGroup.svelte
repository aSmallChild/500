<script>
    import {createEventDispatcher} from 'svelte';

    const dispatch = createEventDispatcher();

    let root;
    export let cards = [];
    export let type = '';
    export let animate = true;
    export let draggableCards = false;

    const findCardBySvg = svg => cards.find(card => card.svg === svg);
    const findCardByElement = ele => {
        if (ele === root) return;
        return findCardBySvg(ele) || cards.find(card => card.svg.contains(ele));
    };
    const getCardsAlreadyPlaced = () => {
        // note: there may be cards inside this component that don't belong here, the parent component is responsible for moving these
        // we don't know the order that each card will be moved in, it could be handled after this is run
        // and if we get rid of it here without knowing where to move it to, it will break animations
        // so cards that are still in this component that aren't in the prop are welcome to stay
        if (!root.children) {
            return [];
        }
        const cardsAlreadyHere = [];
        try {
            for (const svg of root.children) {
                if (findCardBySvg(svg)) {
                    cardsAlreadyHere.push(svg);
                }
            }
        } catch (err) {
            console.error(err);
            console.error(root);
        }
        return cardsAlreadyHere;
    };
    const onDragStart = event => {
        const cardSvg = findCardByElement(event.target);
        if (!cardSvg) return;
        event.dataTransfer.dropEffect = 'move';
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('cardId', cardSvg.card);
        event.dataTransfer.setData('text/plain', cardSvg.card.getName());
    };
    const onDrop = event => {
        const cardId = event.dataTransfer.getData('cardId');
        if (!cardId) return;
        const onCard = findCardByElement(event.target);
        if (onCard && onCard.card.toString() === cardId) return;
        dispatch('card-dropped', {cardId, onCard});
    };
    const onClick = event => {
        const cardSvg = findCardByElement(event.target);
        if (!cardSvg) return;
        dispatch('card-click', cardSvg);
    };
    const onContextMenu = event => {
        const cardSvg = findCardByElement(event.target);
        if (!cardSvg) return;
        dispatch('card-contextmenu', cardSvg);
    };
    const placeCards = async () => {
        const cardsAlreadyHere = getCardsAlreadyPlaced();
        const callbacks = [];
        for (let i = 0; i < cards.length; i++) {
            const cardSvg = cards[i];
            if (draggableCards) {
                cardSvg.svg.setAttribute('draggable', true);
            } else {
                cardSvg.svg.removeAttribute('draggable');
            }
            if (cardsAlreadyHere[i] === cardSvg.svg) continue;
            callbacks.push(cardSvg.animateTo(() => {
                if (!i) return root.prepend(cardSvg.svg);
                if (i >= cards.length - 1) return root.append(cardSvg.svg);
                const previousCard = cards[i - 1].svg;
                if (!previousCard?.parentNode) return root.append(cardSvg.svg);
                previousCard.parentNode.insertBefore(cardSvg.svg, previousCard.nextSibling);
            }));
        }
        if (!callbacks.length) return;

        await new Promise(resolve => setTimeout(() => {
            callbacks.forEach(callback => callback());
            resolve();
        }));
    };

    $: root && cards.length && placeCards();
</script>

<div bind:this={root} class:fan={type=='fan'} class:animate-cards={animate}
     on:click|preventDefault={onClick}
     on:contextmenu|preventDefault={onContextMenu}
     on:drop|preventDefault={onDrop}
     on:dragstart={onDragStart}
     on:dragover|preventDefault
     on:dragenter|preventDefault></div>