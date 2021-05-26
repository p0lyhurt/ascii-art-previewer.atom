'use babel';

import { parseASCIIArt, getASCIIArtDimensions, rgb2css } from './ascii-art-previewer-utils';

const fs = require('fs');
const { dialog } = require('electron').remote;
const { shell } = require('electron');

export default class AsciiArtImageConverter {

  constructor() {}

  convertActivePane({scale, backgroundColor, characterMode}) {
    var editor = atom.workspace.getActiveTextEditor();

    if (!editor) return;
    var ascii = editor.getText();

    var [asciiWidth, asciiHeight] = getASCIIArtDimensions(ascii);

    var canvas = document.createElement('canvas');
    canvas.width = asciiWidth*scale;
    canvas.height = asciiHeight*2*scale;

    var ctx = canvas.getContext('2d');
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${this.fontSize(characterMode, scale)}px/normal MxPlus IBM BIOS-2y, AsciiArtConverterFace`;
    ctx.textBaseline = "middle";

    var lineIdx = 0, charIdx = 0;
    parseASCIIArt(ascii, (text, textColor, bgColor) => {
      var y = lineIdx * scale, x = charIdx * scale;

      ctx.fillStyle = rgb2css(bgColor);
      ctx.fillRect(x, y, text.length*scale, 2*scale);

      ctx.fillStyle = rgb2css(textColor);
      for (var i = 0; i < text.length; i++) {
        let char = text.charAt(i);
        if (char === "▄")
          ctx.fillRect(x + i*scale, y + scale, scale, scale);
        else
          ctx.fillText(char, x + i*scale + this.fillTextOffset(characterMode, scale), y + scale);
      }

      charIdx += text.length;
    }, () => {
      lineIdx += 2;
      charIdx = 0;
    });

    dialog.showSaveDialog({title: 'Save ASCII Art PNG', defaultPath: this.pngFilename(editor.getPath()), filters: [{name: 'PNG Image', extensions: ['png']}]}).then((result) => {
      var filename = result.filePath;

      if (!filename) return;

      var dataURL = canvas.toDataURL(),
          base64 = dataURL.replace('data:image/png;base64,', ''),
          buffer = Buffer.from(base64, 'base64');

      fs.writeFile(filename, buffer, (err) => {
        if (err) {
          atom.notifications.addError('PNG could not be saved to disk!', {dismissable: true, detail: err.toString()});
        } else {
          atom.notifications.addSuccess('PNG successfully saved to disk!', {
            dismissable: true,
            buttons: [
              {text: "Open in Atom", onDidClick: this.createSuccessCallback("open-atom", filename)},
              {text: "Open in OS", onDidClick: this.createSuccessCallback("open-os", filename)},
              {text: "Show in File Manager", onDidClick: this.createSuccessCallback("show-os", filename)},
            ]
          });
        }
      });
    });
  }

  fillTextOffset(mode, scale) {
    switch (mode) {
      case "full":
        return 0;
      case "minus-half":
        return Math.round(scale/8);
    }
  }

  fontSize(mode, scale) {
    switch (mode) {
      case "full":
        return scale*2;
      case "minus-half":
        return scale*2 - scale/2;
    }
  }

  createSuccessCallback(cmd, uri) {
    return function() {
      this.model.dismiss();

      switch (cmd) {
        case "open-atom":
          atom.workspace.open(uri);
          break;
        case "open-os":
          shell.openPath(uri);
          break;
        case "show-os":
          shell.showItemInFolder(uri);
          break;
      }
    };
  }

  pngFilename(filename) {
    if (!filename) return;

    return filename.split(/[\/\\]/).pop().replace(/\.[a-zA-Z0-9]+$/, ".png");
  }

};
