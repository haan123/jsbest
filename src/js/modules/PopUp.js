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
    this.dropdownTempl = hogan.compile(DOM.$('dropdown-templ').innerHTML);

    this._views = [];
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
   *  Show modal dialog
   *
   * @param {Object} data
   * @param {Object} partial
   * @param {Boolean} isStack - if true, render stack layout, can be navigated to next view or previous view
   */
  modal(data, partial, isStack) {
    if( this._modal ) this.close();

    if( isStack ) data.type = 'stack';

    let modal = DOM.$('modal');
    document.body.className += ' modal-open';

    modal.parentNode.style.display = 'block';
    modal.innerHTML = this.popBenchTempl.render(data, { content: partial});
    this._modal = 0;

    this.setCurrentView(data, partial);
  }

  /**
   * Show dropdown list
   * @public
   */
  dropdown(config, target) {
    if( this.hasPopUp() ) return;

    let render = (data) => {
      drop.innerHTML = config.partial.render(data);
    };

    let drop = DOM.toDOM(this.dropdownTempl.render({
      className: config.className
    }));

    target.appendChild(drop);

    this._dropdown = drop;
    this._modal = 0;

    if( typeof config.data === 'function' ) config.data(render);
    else render(config.data);
  }

  closeModal() {
    let modal = DOM.$('modal');

    DOM.removeClass(document.body, 'modal-open');
    modal.parentNode.style.display = 'none';
    modal.innerHTML = '';

    delete this._modal;
  }

  closeDropdown() {
    if( this._modal === 0 ) return this._modal++;

    if( this._dropdown ) {

      this._dropdown.parentNode.removeChild(this._dropdown);

      delete this._dropdown;
      delete this._modal;
    }
  }

  setCurrentView(data, partial) {
    this._currentView = { data: data, partial: partial };
  }

  renderView(elem, data, partial) {
    let container = DOM.closest(elem, '.pop-bench--stack');

    if( !container ) return;

    let content = DOM.children(container, '.pop-bench__content');

    content.innerHTML = partial.render(data);
    DOM.removeClass(container, 'sub-view');

    if( this._views.length ) container.className += ' sub-view';

    this.setCurrentView(data, partial);
  }

  /**
   *  Navigate to next modal view
   */
  nextView(elem, data, partial) {
    this._views.push(this._currentView);

    this.renderView(elem, data, partial);
    this.setCurrentView(data, partial);
  }

  prevView(elem) {
    let view = this._views.shift();
    if( !view || view.length <= 1 ) return;
    let data = view.data, partial = view.partial;
    elem = elem.target || elem;

    this.renderView(elem, data, partial);
    this.setCurrentView(data, partial);
  }

  /**
   * Close all popup
   * @public
   */
  close(e) {
    if( this._modal === 0 ) return this._modal++;

    // handle when popup is element node
    if( this._dropdown ) {

      this.closeDropdown();
    } else if( e.target.className === 'modal-overlay' || this.cel.tagName.toLowerCase() === 'button' ) {
      this.closeModal();
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
