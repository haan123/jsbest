import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';
import Promise from 'bluebird';

const SEPARATOR = ',';
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

    this.setTemplate(['benches', 'pop-save', 'pop-remove', 'pop-workspace']);

    this.isSearch = location.href.indexOf('/search') !== -1;

    this.getWorkingBench().then(([bench]) => {
      this._renderBenchName(bench.name);
    });
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
    this.getWorkingBench().then(([bench]) => {
      this.popup.modal({
        title: 'Save Bench',
        type: 'save'
      }, this.template('pop-save'));

      let field = DOM.$('bench-name');
      field.focus();
      field.value = bench.name;
    });

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

    if( !name ) return;

    this.getWorkingBench().then(([bench]) => {

      this.setBenchItem(bench, name, true);
      this._renderBenchName(name);
      this._clearUrlBench();
      this.popup.closeModal();
    });
  }

  /**
   * Add bench event handler
   * @public
   */
  addBench() {
    let name = DOM.$('bench-name').value.trim();

    this._clearUrlBench();

    let bench = this.setBenchItem(this._createBlankBench(), name, true);
    this._clearBenchItems();
    this._renderBenchName(bench.name);
    this.popup.closeModal();
  }

  /**
   * Show bench list
   * @public
   */
  showBenchList() {
    let benches = this._getBenches();
    let lists = [];
    let working = this._getWorkingId();

    utils.forEach(benches, (id) => {
      let bench = this.getBenchItem(id);
      let date = new Date(id);
      let isActive = working === id;
      let data = {
        id: id,
        name: bench.name,
        time: date.toLocaleString('en-US'),
        active: isActive
      };

      if( bench ) {
        if( isActive ) lists.unshift(data);
        else lists.push(data);
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
    this.getWorkingBench().then(([bench]) => {
      this.popup.modal({
        title: 'Remove Bench',
        name: bench.name,
        type: 'remove'
      }, this.template('pop-remove'));
    });
  }

  /**
   * Remove bench event handler
   * @public
   *
   */
  removeBench() {
    this._removeBenchItem(this._getWorkingId());

    this.getWorkingBench().then(([bench]) => {
      this._clearBenchItems();
      this._renderBenchItems();

      this._renderBenchName(bench.name);

      this.popup.closeModal();

      this._clearUrlBench();
    });
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
    return new Promise((resolve, reject) => {
      let bench = this._urlBench || this._getBenchFromUrl();

      if( bench ) {
        this._wid = this._createBenchId();
        this._urlBench = bench;
      } else {
        let id = this._getWorkingId();
        bench = this.getBenchItem(id);
      }

      if( !bench ) {
        bench = this.setBenchItem(this._createBlankBench());
      }

      resolve([bench, this._wid]);
    });
  }

  setWorkingBench(id) {
    let benches = this._getBenches();

    if( this.removeFromArray(id, benches) !== -1 ) {
      benches.push(id);
      this._saveBench(benches);

      this._wid = id;
    }
  }

  /**
   * Add/Update new jsbest local storage item
   * @public
   *
   * @param {Object} bench
   * @param {String} name
   * @param {Boolean} isAdd
   *
   * @return {Object} bench
   */
  setBenchItem(bench, name, isAdd) {
    let id = this._createBenchId();
    let benches = this._getBenches();
    let wid = this._getWorkingId(benches);

    bench.name = name || bench.name || 'Quick Bench';

    // only save bench if it is not shared bench or
    // when user saves shared bench from GUI
    if( !this._urlBench || (this._urlBench && isAdd) ) {
      if( !isAdd ) {
        this.removeFromArray(wid, benches);
        this._removeBenchItem(wid, true);
      }

      benches.push(id);
      this._saveBench(benches);
      localStorage.setItem(id, JSON.stringify(bench));
    }

    this._wid = id;

    return bench;
  }

  /**
   * Remove Bench item
   * @private
   *
   * @param {String} name
   */
  _removeBenchItem(id, isUpdate) {
    let benches = this._getBenches();
    this.removeFromArray(+id, benches);

    if( !isUpdate ) this._saveBench(benches);

    this._wid = benches[benches.length - 1];

    return localStorage.removeItem(id);
  }

  /**
   * Build share url from names
   *
   * @param {String/Array} names
   *
   * @return {String}
   */
  toUrl(ids) {
    return this.getWorkingBench().then(([bench]) => {
      ids = typeof ids === 'string' ? [ids] : ids;
      let arr = [];

      utils.forEach(bench.samples, (sample) => {
        if( ~ids.indexOf(sample.id) ) {
          arr.push(sample);
        }
      });

      bench.samples = arr;

      return ROOT_URL + '#/' + encodeURIComponent(JSON.stringify(bench));
    });
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

  _saveBench(benches) {
    localStorage.setItem(BENCHES_NAME, benches.join(SEPARATOR));
  }

  /**
   * Get benches ids from DB
   * @private
   *
   * @return {String}
   *
   */
  _getBenches() {
    let benches = localStorage.getItem(BENCHES_NAME) || '';
    return benches.split(SEPARATOR).map((id) => +id);
  }

  _getWorkingId(benches) {
    benches = benches || this._getBenches();
    let wid = benches[benches.length - 1];

    if( this._urlBench ) return this._wid;

    if( this._wid && this._wid !== wid ) {
      // handle case when user switch workspace in another tab
      if( benches.indexOf(this._wid) !== -1 ) {
        wid = this._wid;

      // handle case when current workspace has been changed or removed in another tab
      } else {
        this.popup.modal({
          title: 'Unrecognized Workspace'
        }, this.template('pop-workspace'));

        throw 'Unrecognized Workspace';
      }
    }

    this._wid = wid;

    return wid;
  }
}

export default Bench;
