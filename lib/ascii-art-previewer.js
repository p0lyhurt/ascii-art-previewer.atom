'use babel';

import { previewerURI } from "./ascii-art-previewer-constants";
import { addFontFixerElement } from './ascii-art-previewer-utils';
import AsciiArtPreviewerView from './ascii-art-previewer-view';
import AsciiArtImageConverter from './ascii-art-image-converter';
import AsciiArtImageConverterView from './ascii-art-image-converter-view';
import { CompositeDisposable, Disposable } from 'atom';

export default {
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === previewerURI) {
          return new AsciiArtPreviewerView();
        }
      }),

      atom.commands.add('atom-workspace', {
        'ascii-art-previewer:toggle': () => this.toggle(),
        'ascii-art-previewer:open-convert-modal': () => this.openConvertModal()
      }),

      atom.views.addViewProvider(AsciiArtImageConverter,
        (converter) => (new AsciiArtImageConverterView(converter)).getElement()
      ),

      addFontFixerElement(),

      // Destroy any ActiveEditorInfoViews when the package is deactivated.
      new Disposable(() => {
        atom.workspace.getPaneItems().forEach(item => {
          if (item instanceof AsciiArtPreviewerView) {
            item.destroy();
          }
        });
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  deserializeAsciiArtPreviewerView(serialized) {
    return new AsciiArtPreviewerView();
  },

  toggle() {
    atom.workspace.toggle(previewerURI);
  },

  openConvertModal() {
    atom.workspace.addModalPanel({
      item: new AsciiArtImageConverter(),
      autoFocus: true,
      visible: false
    }).show();
  }
};
