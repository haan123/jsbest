import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

const WORKING_NAME = 'working';
const BENCHES_NAME = 'benches';

class Bench extends Base {
  constructor(process) {
    super({
      mid: 'bench',
      events: {
        'click': '_click'
      }
    });

    this.popBenchTempl = hogan.compile(DOM.$('pop-bench-templ').innerHTML);

    // get cached benches
    let benches;
    try {
      benches = this.benches = JSON.parse(localStorage.getItem('benches'));
    } catch(e) {}

    if( !benches ) this.benches = [];

    this._renderBenchName(this.getWorkingBench().name);
  }

  /**
   * Handle click for sample handler
   *
   * @private
   */
  _click(e) {
    const type = this.cel.getAttribute('data-type');

    this[type]();
  }

  closeDialog() {
    if( this.popup === 0 ) return this.popup++;

    if( this.popup && (this.eTarget.className === 'modal-overlay' || this.cel.tagName.toLowerCase() === 'button') ) {
      let modal = DOM.$('modal');

      DOM.removeClass(document.body, 'modal-open');
      modal.parentNode.style.display = 'none';
      modal.innerHTML = '';

      delete this.popup;
    }
  }

  _showDialog(elem, data) {
    let modal = DOM.$('modal');
    document.body.className += ' modal-open';

    modal.parentNode.style.display = 'block';
    modal.innerHTML = this.popBenchTempl.render(data);
    this.popup = 0;
  }

  /**
   * Render bench's name
   * @private
   *
   * @param {String} name
   */
  _renderBenchName(name) {
    DOM.$('bench-heading').innerHTML = name;
  }

  /**
   * Create bench's id
   * @private
   */
  _createBenchId() {
    return new Date().getTime();
  }

  /**
   * Open save bench popup handler
   * @public
   */
  saveBenchPopUp() {
    let elem = this.cel;

    this._showDialog(elem, {
      title: 'Save Bench',
      type: 'save'
    });

    DOM.$('bench-name').focus();
  }

  /**
   * Open new bench popup handler
   * @public
   */
  newBenchPopUp() {
    let elem = this.cel;

    this._showDialog(elem, {
      title: 'Add New Bench',
      type: 'add'
    });
  }

  /**
   * Store bench event handler
   * @public
   */
  saveBench() {
    let name = DOM.$('bench-name').value;
    let _bench = this.getWorkingBench();

    this.setBenchItem(_bench, name);

    this.closeDialog();
  }

  /**
   * Remove bench event handler
   * @public
   *
   */
  removeBench() {
    let id = this.cel.getAttribute('data-uid');

    this._removeBenchItem(id);
  }


  /**
   * Get test bench from local storage
   * @public
   *
   * @param  {String} name
   * @return {Object} _bench
   */
  getBenchItem(name) {
    let _bench;

    try {
      _bench = JSON.parse(localStorage.getItem(name));
    } catch(e) {}

    return _bench;
  }

  /**
   * Return lastest bench
   * @public
   *
   * @return {Object}
   */
  getWorkingBench() {
    let id = this._working || this.benches[this.benches.length - 1];
    let working = this.getBenchItem(id);

    if( !working ) {
      working = this.setBenchItem({ setup: {}, samples: []}, 'Quick Bench');
    }

    return working;
  }

  /**
   * Add/Updage new jsbest local storage item
   * @public
   *
   * @param {Object} bench
   *
   * @return {Object} bench
   */
  setBenchItem(bench, name) {
    let id = this._createBenchId();
    let working = this._working;
    let benches = this.benches;

    this.removeFromArray(working, benches);
    this._removeBenchItem(working);
    benches.push(id);

    this._working = id;
    bench.name = name;

    localStorage.setItem(BENCHES_NAME, JSON.stringify(benches));
    localStorage.setItem(id, JSON.stringify(bench));

    return bench;
  }

  /**
   * Remove Bench item
   * @private
   *
   * @param {String} name
   */
  _removeBenchItem(name) {
    let benches = this.benches;
    this.removeFromArray(name, benches);

    localStorage.setItem(BENCHES_NAME, JSON.stringify(benches));
    return localStorage.removeItem(name);
  }
}

export default Bench;
