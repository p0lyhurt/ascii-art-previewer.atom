'use babel';

import { previewerURI } from './ascii-art-previewer-constants';
import { parseASCIIArt, rgb2css } from './ascii-art-previewer-utils';

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

    var result = parseASCIIArt(ascii, (text, textColor, bgColor) => {
      html += `<span style="background-color: ${rgb2css(bgColor)}; color: ${rgb2css(textColor)};">${text}</span>`
    }, () => html += "<br />");

    if (result) return `<div class="ascii-preview">${html}</div>`;
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
