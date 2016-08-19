import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

const WORKING_NAME = 'working';
const BENCHES_NAME = 'benches';

class Bench extends Base {
  constructor(_popup) {
    super({
      mid: 'bench',
      events: {
        'click': '_click'
      }
    });

    this.popup = _popup;
    this.popBenchTempl = hogan.compile(DOM.$('pop-bench-templ').innerHTML);
    this.benchesTempl = hogan.compile(DOM.$('benches-templ').innerHTML);
    this.popSaveTempl = hogan.compile(DOM.$('pop-save-templ').innerHTML);
    this.popRemoveTempl = hogan.compile(DOM.$('pop-remove-templ').innerHTML);

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

    this.popup.modal({
      title: 'Save Bench',
      type: 'save'
    }, this.popSaveTempl);

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

    this.popup.modal({
      title: 'New Bench',
      type: 'add'
    }, this.popSaveTempl);

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
    this.popup.close();
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
    this.popup.closeModal();
  }

  /**
   * Show bench list
   * @public
   */
  showBenchList() {
    if( this.popup.hasPopUp() ) return;

    let benches = this.benches;
    let lists = [];

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

    this.popup.dropdown(this.cel.parentNode, DOM.toDOM(this.benchesTempl.render({
      benches: lists
    })));
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
    let bench = this.getWorkingBench();

    this.popup.modal({
      title: 'Remove Bench',
      name: bench.name,
      type: 'remove'
    }, this.popRemoveTempl);
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
    this.popup.closeModal();
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
