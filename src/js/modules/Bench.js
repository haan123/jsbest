import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

const WORKING_NAME = 'working';
const BENCHES_NAME = 'benches';

class Bench extends Base {
  constructor() {
    super({
      mid: 'bench',
      events: {
        'click': '_click'
      }
    });

    this.popBenchTempl = hogan.compile(DOM.$('pop-bench-templ').innerHTML);
    this.benchesTempl = hogan.compile(DOM.$('benches-templ').innerHTML);

    // get cached benches
    let benches;
    try {
      benches = this.benches = JSON.parse(localStorage.getItem('benches'));
    } catch(e) {}

    if( !benches ) this.benches = [];

    this._renderBenchName(this.getWorkingBench().name);
  }

  /**
   * Preference to Setup._initSetup
   * @private
   */
  _initSetup() {}
  /**
   * Preference to Sample._initSamples
   * @private
   */
  _initSamples() {}

  /**
   * Handle click for sample handler
   *
   * @private
   */
  _click(e) {
    const type = this.cel.getAttribute('data-type');

    this[type]();
  }

  closePopUp() {
    if( this.popup === 0 ) return this.popup++;

    // handle when popup is element node
    if( this.popupElem ) {
      this.popupElem.innerHTML = '';
      this.popupElem.style.display = 'none';

      delete this.popup;
      delete this.popupElem;

      return;
    }

    if( this.popup && (this.eTarget.className === 'modal-overlay' || this.cel.tagName.toLowerCase() === 'button') ) {
      let modal = DOM.$('modal');

      DOM.removeClass(document.body, 'modal-open');
      modal.parentNode.style.display = 'none';
      modal.innerHTML = '';

      delete this.popup;
    }
  }

  _showPopUp(elem, data) {
    if( this.popup ) this.closePopUp();

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
   * Create blank bench
   * @private
   */
  _createBlankBench() {
    return { setup: {}, samples: []};
  }



  /**
   * Open save bench popup handler
   * @public
   */
  saveBenchPopUp() {
    let elem = this.cel;
    let bench = this.getWorkingBench();

    this._showPopUp(elem, {
      title: 'Save Bench',
      type: 'save'
    });

    let field = DOM.$('bench-name');
    field.focus();
    field.value = bench.name;
  }

  /**
   * Open new bench popup handler
   * @public
   */
  newBenchPopUp() {
    let elem = this.cel;

    this._showPopUp(elem, {
      title: 'New Bench',
      type: 'add'
    });

    DOM.$('bench-name').focus();
  }

  /**
   * Save bench event handler
   * @public
   */
  saveBench() {
    let name = DOM.$('bench-name').value.trim();
    let _bench = this.getWorkingBench();

    if( !name ) return;

    this.setBenchItem(_bench, name);
    this._renderBenchName(name);
    this.closePopUp();
  }

  /**
   * Add bench event handler
   * @public
   */
  addBench() {
    let name = DOM.$('bench-name').value.trim();

    this._working = null;

    let bench = this.setBenchItem(this._createBlankBench(), name);
    this._clearBenchItems();
    this._renderBenchName(bench.name);
    this.closePopUp();
  }

  /**
   * Show bench list
   * @public
   */
  showBenchList() {
    if( this.popupElem ) return;

    let benches = this.benches;
    let lists = [];
    let elem = DOM.$('benches');

    utils.forEach(benches, (id) => {
      let bench = this.getBenchItem(id);
      let date = new Date(id);

      if( bench ) {
        lists.push({
          id: id,
          name: bench.name,
          time: date.toLocaleString()
        });
      }
    });

    elem.innerHTML = this.benchesTempl.render({
      benches: lists
    });
    elem.style.display = 'block';
    this.popup = 0;
    this.popupElem = elem;
  }

  /**
   * Open bench handler
   * @public
   */
  openBench() {
    let id = this.cel.getAttribute('data-id');
    let bench = this.getBenchItem(id);

    // this.setBenchItem(bench, bench.name);
    this._working = +id;

    this._clearBenchItems();
    this._renderBenchItems();
    this._renderBenchName(bench.name);
  }

  /**
   * Open remove bench popup handler
   * @public
   */
  removeBenchPopUp() {
    let elem = this.cel;

    this._showPopUp(elem, {
      title: 'Remove Bench',
      type: 'remove'
    });
  }

  /**
   * Remove bench event handler
   * @public
   *
   */
  removeBench() {
    this._removeBenchItem(this._working);
    this._clearBenchItems();
    this._renderBenchItems();

    this._renderBenchName(this.getWorkingBench().name);
    this.closePopUp();
  }

  /**
   * Render bench items
   * @private
   */
  _renderBenchItems() {
    this.setup._initSetup();
    this.sample._initSamples();
  }

  /**
   * Clear bench items
   * @private
   */
  _clearBenchItems() {
    let items = document.getElementsByClassName('sample-item');
    let item;

    utils.forEach(Array.from(items), (item) => {
      let id = item.getAttribute('data-uid');
      if( !id ) return;

      if( id === 'setup' ) {
        this.setup.removeSetupView(item, id);
      } else {
        this.sample.removeSampleView(item, id);
      }
    });
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
    let id = this._working || (this._working = this.benches[this.benches.length - 1]);
    let working = this.getBenchItem(id);

    if( !working ) {
      working = this.setBenchItem(this._createBlankBench());
    }

    return working;
  }

  /**
   * Add/Update new jsbest local storage item
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
    bench.name = name || bench.name || 'Quick Bench';

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

    this._working = benches[benches.length - 1];

    localStorage.setItem(BENCHES_NAME, JSON.stringify(benches));
    return localStorage.removeItem(name);
  }
}

export default Bench;
