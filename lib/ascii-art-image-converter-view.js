'use babel';

import { CompositeDisposable } from 'atom';

export default class AsciiArtImageConverterView {

  constructor(converter) {
    this.converter = converter;

    this.element = document.createElement('div');
    this.element.classList.add('ascii-art-image-converter-modal');
    this.element.innerHTML = this.renderView();

    this.subscriptions = new CompositeDisposable(
      atom.commands.add('.ascii-art-image-converter-modal', {
        'core:cancel': () => {
          this.destroy();
        },
        'core:confirm': () => {
          var scale = Number(this.getFormValue('ascii-art-image-converter-scale')),
              bgColor = this.getFormValue('ascii-art-image-converter-bgcolor'),
              charMode = this.getFormValue('ascii-art-image-converter-charmode', {radio: true});
          this.converter.convertActivePane({scale: scale, backgroundColor: bgColor, characterMode: charMode});
          this.destroy();
        }
      })
    );
  }

  getElement() {
    return this.element;
  }

  destroy() {
    this.subscriptions.dispose();
    atom.workspace.panelForItem(this.converter).destroy();
  }

  getFormValue(cls, {radio = false} = {}) {
    var elements = this.element.getElementsByClassName(cls);

    if (radio) {
      for (var i = 0; i < elements.length; i++) {
        var elem = elements.item(i);
        if (elem.checked) return elem.value;
      }
    } else return elements.item(0).value;
  }

  getDefault(name) {
    return atom.config.get('ascii-art-previewer.converterDefaults')[name];
  }

  get defaultScale() {
    return this.getDefault("defaultScale");
  }

  get defaultCharacterMode() {
    return this.getDefault("defaultCharacterMode");
  }

  get defaultBackgroundColor() {
    return this.getDefault("defaultBackgroundColor");
  }

  renderView() {
    return `
      <p>Adjust the following settings, then press [Enter] to generate PNG:</p>

      <label for="ascii-art-image-converter-scale">Scale:</label>
      <input type="number" value="${this.defaultScale}" class="ascii-art-image-converter-scale input-number" id="ascii-art-image-converter-scale" />

      <label for="ascii-art-image-converter-bgcolor">Background:</label>
      <input type="color" value="${this.defaultBackgroundColor.toHexString()}" class="ascii-art-image-converter-bgcolor" id="ascii-art-image-converter-bgcolor" />

      <div>
        <p>Character mode:</p>

        <div>
          <input type="radio" class="ascii-art-image-converter-charmode input-radio" id="ascii-art-image-converter-charmode-full" name="ascii-art-image-converter-charmode" value="full" ${this.defaultCharacterMode === 'full' ? 'checked' : ''}/>
          <label for="ascii-art-image-converter-charmode-full">Full</label>
        </div>

        <div>
          <input type="radio" class="ascii-art-image-converter-charmode input-radio" id="ascii-art-image-converter-charmode-minus-half" name="ascii-art-image-converter-charmode" value="minus-half" ${this.defaultCharacterMode === 'minus-half' ? 'checked' : ''} />
          <label for="ascii-art-image-converter-charmode-minus-half">Minus-half</label>
        </div>
      </div>
    `;
  }

};
