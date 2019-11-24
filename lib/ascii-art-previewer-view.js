'use babel';

import { previewerURI, fullMapping } from "./ascii-art-previewer-constants";

export default class AsciiArtPreviewerView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('ascii-art-previewer');

    var bufferChangeSubscription = undefined;
    this.subscriptions = atom.workspace.getCenter().observeActivePaneItem(item => {
      if (item === undefined) return;

      var action = () => this.element.innerHTML = this.generatePreviewHTML(item);
      if (typeof item.onDidStopChanging === "function") {
        if (bufferChangeSubscription) bufferChangeSubscription.dispose();
        bufferChangeSubscription = item.onDidStopChanging(action);
      }

      action();
    });
  }

  generatePreviewHTML(item) {
    var innerHTML = "";

    if (!atom.workspace.isTextEditor(item)) {
      return '<div class="preview-error">Open a file to preview it as MIRC ASCII art.</div>';
    }

    var preview = this.generateASCIIPreview(item.getText());
    if (preview !== undefined)
      innerHTML = preview;
    else
      innerHTML = '<div class="preview-error">Open a well-structured ASCII to preview it as MIRC ASCII art.</div>';

    return innerHTML;
  }

  generateASCIIPreview(ascii) {
    var html = "";
    var regex = /\x03([0-9]{1,2}),([0-9]{1,2})([^\x03]+)/g;
    for (line of ascii.split("\n").filter((line) => !!line)) {
      var bgColor, textColor, text;
      var matchedLine = line.match(regex);
      if (matchedLine === null) return;
      for (span of matchedLine) {
        [_1, textColor, bgColor, text] = span.split(regex);
        bgColor = fullMapping[bgColor];
        textColor = fullMapping[textColor];
        html += `<span style="background-color: ${this.rgb2css(bgColor)}; color: ${this.rgb2css(textColor)};">${text}</span>`
      }
      html += "<br />";
    }

    return `<div class="ascii-preview">${html}</div>`;
  }

  rgb2css([r, g, b]) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  getTitle() {
    return 'ASCII Art Previewer';
  }

  getURI() {
    return previewerURI;
  }

  getDefaultLocation() {
    return "bottom";
  }

  getAllowedLocations() {
    return ["bottom"];
  }

  serialize() {
    return {
      deserializer: "ascii-art-previewer/AsciiArtPreviewerView"
    };
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
    this.subscriptions.dispose();
  }

  getElement() {
    return this.element;
  }
}
