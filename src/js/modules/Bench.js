import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

const WORKING_NAME = 'working';
const BENCHES_NAME = 'benches';
const ROOT_URL = ~location.href.indexOf('haan123') ? 'https://haan123.github.io/jsbest/' : 'http://localhost:3000/';

class Bench extends Base {
  constructor(_popup) {
    super({
      mid: 'bench',
      events: {
        'click': '_click'
      }
    });

    this.popup = _popup;

    this.setTemplate(['benches', 'pop-save', 'pop-remove']);

    // get cached benches
    let benches;
    try {
      benches = this.benches = JSON.parse(localStorage.getItem('benches'));
    } catch(e) {}

    if( !benches ) this.benches = [];

    this.isSearch = location.href.indexOf('/search') !== -1;

    this._renderBenchName(this.getWorkingBench().name);
  }

  /**
   * Handle click for sample handler
   *
   * @private
   */
  _click(e) {
    e.preventDefault();
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
    if( this.isSearch ) return;

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
    }, this.template('pop-save'));

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
    }, this.template('pop-save'));

    DOM.$('bench-name').focus();
  }

  /**
   * Open share benches popup handler
   * @public
   */
  shareBenchesPopUp() {
    let elem = this.cel;

    this.popup.modal({
      title: 'Share Benches',
      type: 'share'
    }, this.template('pop-save'));

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

    this._clearUrlBench();

    this.setBenchItem(_bench, name);
    this._renderBenchName(name);
    this.popup.closeModal();
  }

  /**
   * Add bench event handler
   * @public
   */
  addBench() {
    let name = DOM.$('bench-name').value.trim();

    this._working = null;
    this._clearUrlBench();

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
    let benches = this.benches;
    let lists = [];

    utils.forEach(benches, (id) => {
      let bench = this.getBenchItem(id);
      let date = new Date(id);

      if( bench ) {
        lists.push({
          id: id,
          name: bench.name,
          time: date.toLocaleString('en-US')
        });
      }
    });

    this.popup.dropdown({
      className: 'bench-list',
      partial: this.template('benches'),
      data: {
        benches: lists
      }
    }, this.cel.parentNode);
  }

  _clearUrlBench() {
    delete this._urlBench;
    location.hash = '';
  }

  /**
   * Open bench handler
   * @public
   */
  openBench() {
    this._clearUrlBench();
    let id = this.cel.getAttribute('data-id');
    let bench = this.getBenchItem(id);

    // this.setBenchItem(bench, bench.name);
    this.setWorkingBench(+id);

    if( this.setup && this.sample ) {
      this._clearBenchItems();
      this._renderBenchItems();
      this._renderBenchName(bench.name);
    }
  }

  openBenchRedirect() {
    let id = this.cel.getAttribute('data-id');

    this.setWorkingBench(+id);
    location.href = ROOT_URL;
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
    }, this.template('pop-remove'));
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

    this._clearUrlBench();
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

      if( id === this.setup.getModuleName() ) {
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
    let working = this._urlBench || this._getBenchFromUrl();

    if( working ) {
      this._working = this._createBenchId();
      this._urlBench = working;
    } else {
      let id = this._working || (this._working = this.benches[this.benches.length - 1]);
      working = this.getBenchItem(id);
    }

    if( !working ) {
      working = this.setBenchItem(this._createBlankBench());
    }

    return working;
  }

  setWorkingBench(id) {
    let benches = this.benches;

    if( this.removeFromArray(id, benches) !== -1 ) {
      benches.push(id);
      localStorage.setItem(BENCHES_NAME, JSON.stringify(benches));

      this._working = id;
    }
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

    bench.name = name || bench.name || 'Quick Bench';

    if( !this._urlBench ) {
      this.removeFromArray(working, benches);
      this._removeBenchItem(working);
      benches.push(id);
      localStorage.setItem(BENCHES_NAME, JSON.stringify(benches));
      localStorage.setItem(id, JSON.stringify(bench));
    }

    this._working = id;

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

  /**
   * Build share url from names
   *
   * @param {String/Array} names
   *
   * @return {String}
   */
  toUrl(names) {
    let bench = this.getWorkingBench();
    names = typeof names === 'string' ? [names] : names;
    let arr = [];

    utils.forEach(bench.samples, (sample) => {
      if( ~names.indexOf(sample.name) ) {
        arr.push(sample);
      }
    });

    bench.samples = arr;

    return ROOT_URL + '#/' + encodeURIComponent(JSON.stringify(bench));
  }

  /**
   * Parse hash to json
   * @private
   *
   * @return {Object}
   */
  _getBenchFromUrl() {
    let bench;
    let hash = location.hash.substring(2);

    try {
      bench = JSON.parse(decodeURIComponent(hash));
    } catch(e) {}

    return bench;
  }
}

export default Bench;
