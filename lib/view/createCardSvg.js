export default function createCardSvg(card, layout) {
  const face = getElement('svg');
  face.setAttributeNS(null, 'viewBox', `0 0 ${layout.width} ${layout.height}`);
  addPips(face, card, layout);
  addSymbols(face, card, layout);
  const div = document.createElement('div');
  const back = document.createElement('div');
  back.classList.add('card-back');
  face.classList.add('card-face');
  div.appendChild(face);
  div.appendChild(back);
  addClass(div, card);
  return div;
}

function addClass(svg, card) {
  svg.classList.add('card');
  if (card.suit) {
    svg.classList.add(card.suit.name.toLowerCase());
    svg.classList.add(card.suit.color.toLowerCase());
  }
}

function addPips(svg, card, layout) {
  if (card.value) {
    const pip = getElement('text');
    pip.textContent = card.value;
    const pipYOffset = layout.pipSymbolSize + layout.margin / 2;
    const pipXOffset = layout.margin + (card.value > 9 ? 0 : layout.margin - 2);
    const textLength = card.value > 9 ? layout.pipSymbolSize : layout.pipSymbolSize / 2;
    pip.setAttribute('style', `font: ${layout.pipSymbolSize}px sans-serif`);
    pip.setAttribute('textLength', `${textLength}px`);
    pip.setAttribute('lengthAdjust', `spacingAndGlyphs`);
    pip.setAttribute('x', pipXOffset);
    pip.setAttribute('y', pipYOffset);
    svg.appendChild(pip);
    const pip2 = pip.cloneNode();
    pip2.textContent = (card.value + '').split('').reverse().join('');
    pip2.setAttribute('x', layout.width - (card.value > 9 ? layout.margin + layout.pipSymbolSize / 2 : layout.margin + layout.pipSymbolSize / 4));
    pip2.setAttribute('y', layout.height - pipYOffset);
    pip2.setAttribute('rotate', '180');
    svg.appendChild(pip2);
  }

  if (card.suit) {
    const suit = getElement('use');
    const suitYOffset = layout.margin * 1.5 + layout.pipSymbolSize;
    suit.setAttribute('href', `#${card.suit.symbol}`);
    suit.setAttribute('height', layout.pipSymbolSize);
    suit.setAttribute('width', layout.pipSymbolSize);
    suit.setAttribute('x', layout.margin);
    suit.setAttribute('y', suitYOffset);
    svg.appendChild(suit);
    const suit2 = suit.cloneNode();
    suit2.setAttribute('x', layout.width - layout.margin);
    suit2.setAttribute('y', layout.height - suitYOffset);
    suit2.setAttribute('transform', `rotate(180, ${suit2.getAttribute('x')}, ${suit2.getAttribute('y')})`);
    svg.appendChild(suit2);
  }
}

function addSymbols(svg, card, layout) {
  const symbolMap = layout.getSymbolMap(card.value);
  if (symbolMap) {
    applySymbolMap(svg, card, layout, symbolMap);
    return;
  }

  const value = '' + (card.value ?? '');
  const symbolSize = layout.getSymbolSize() * 4;
  const symbol = getElement('use');
  if (card.suit) {
    symbol.setAttribute('href', `#${card.suit.symbol}`);
    symbol.setAttribute('height', symbolSize);
    symbol.setAttribute('width', symbolSize);
    symbol.setAttribute('x', layout.width / 2 - symbolSize / 2);
    symbol.setAttribute('y', layout.height / 2 - symbolSize / 2);
    svg.appendChild(symbol);
  }

  if (value !== 'A') {
    symbol.setAttribute('opacity', 0.15);
    const pip = getElement('text');
    pip.textContent = value;
    const textSize = symbolSize / 2;
    pip.setAttribute('style', `font: ${textSize}px sans-serif`);
    pip.setAttribute('textLength', `${textSize / 2}px`);
    pip.setAttribute('lengthAdjust', `spacingAndGlyphs`);
    pip.setAttribute('x', layout.width / 2 - textSize / 4);
    pip.setAttribute('y', layout.height / 2 + textSize / 3);
    svg.appendChild(pip);
  }
}

function applySymbolMap(svg, card, layout, symbolMap) {
  const symbolSize = layout.getSymbolSize();
  const symbolArea = layout.getSymbolArea();
  for (const [x, y] of symbolMap) {
    const symbol = getElement('use');
    symbol.setAttribute('href', `#${card.suit.symbol}`);
    symbol.setAttribute('height', symbolSize);
    symbol.setAttribute('width', symbolSize);
    const offsetX = symbolArea.horizontalMargin - symbolSize / 2 + symbolArea.width * x / 100;
    const offsetY = symbolArea.verticalMargin + symbolSize / 2 + symbolArea.height * y / 100;
    symbol.setAttribute('x', offsetX);
    symbol.setAttribute('y', offsetY);
    if (y > 50) {
      symbol.setAttribute('transform', `rotate(180, ${symbolSize / 2 + offsetX}, ${symbolSize / 2 + offsetY})`);
    }
    svg.appendChild(symbol);
  }
}

function getElement(type) {
  return document.createElementNS('http://www.w3.org/2000/svg', type);
}