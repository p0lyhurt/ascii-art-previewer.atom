'use babel';

import { previewerURI } from "./ascii-art-previewer-constants";
import AsciiArtPreviewerView from './ascii-art-previewer-view';
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
        'ascii-art-previewer:toggle': () => this.toggle()
      }),

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
  }
};
