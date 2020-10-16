'use babel';

import { Disposable } from 'atom';
import { fullMapping } from './ascii-art-previewer-constants';

const parsingRegex = /\x03([0-9]{1,2}),([0-9]{1,2})([^\x03\r]+)/g;

export function rgb2css([r, g, b]) {
  return `rgb(${r}, ${g}, ${b})`;
};

export function parseASCIIArt(ascii, onSpan, afterLine = () => {}) {
  for (line of ascii.split("\n").filter((line) => !!line)) {
    var bgColor, textColor, text;
    var matchedLine = line.match(parsingRegex);
    if (matchedLine === null) return;
    for (span of matchedLine) {
      [_1, textColor, bgColor, text] = span.split(parsingRegex);
      bgColor = fullMapping[bgColor];
      textColor = fullMapping[textColor];
      onSpan(text, textColor, bgColor);
    }
    afterLine();
  }

  return true;
};

export function getASCIIArtDimensions(ascii) {
  var lines = ascii.split("\n").filter((line) => !!line),
      height = lines.length,
      width = lines[0].match(parsingRegex).reduce((acc, str) => acc + str.split(parsingRegex)[3].length, 0);

  return [width, height];
};

export function addFontFixerElement() {
  const fixer = document.createElement('ascii-art-converter-font-fixer');
  fixer.innerHTML = 'regular';
  atom.views.getView(atom.workspace).appendChild(fixer);

  return new Disposable(() => fixer.remove());
}
