import Handler from '../utils/handler';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

class PopUp extends Handler {
  constructor(process) {
    super({
      mid: 'popup',
      events: {
        'click': '_click'
      }
    });

    this.popBenchTempl = hogan.compile(DOM.$('pop-bench-templ').innerHTML);
  }

  /**
   * Handle click for sample handler
   *
   * @private
   */
  _click(e) {
    const type = this.cel.getAttribute('data-type');

    this[type](e);
  }

  /**
   * Show modal dialog
   * @public
   */
  modal(data, partial) {
    if( this._modal ) this.close();

    let modal = DOM.$('modal');
    document.body.className += ' modal-open';

    modal.parentNode.style.display = 'block';
    modal.innerHTML = this.popBenchTempl.render(data, { content: partial});
    this._modal = 0;
  }

  /**
   * Show dropdown list
   * @public
   */
  dropdown(target, dropdown) {
    target.appendChild(dropdown);
    this._modal = 0;
    this._dropdown = dropdown;
  }

  /**
   * Close all popup
   * @public
   */
  close(e) {
    if( this._modal === 0 ) return this._modal++;

    // handle when popup is element node
    if( this._dropdown ) {
      this._dropdown.parentNode.removeChild(this._dropdown);

      delete this._dropdown;
      delete this._modal;
    } else if( e.target.className === 'modal-overlay' || this.cel.tagName.toLowerCase() === 'button' ) {
      let modal = DOM.$('modal');

      DOM.removeClass(document.body, 'modal-open');
      modal.parentNode.style.display = 'none';
      modal.innerHTML = '';

      delete this._modal;
    }
  }

  /**
   * Check if pop up is showing
   * @public
   */
  hasPopUp() {
    return this._modal || this._dropdown;
  }

}

export default PopUp;
