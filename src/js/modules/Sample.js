import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

class Sample extends Base {
  constructor(_process, _case) {
    super({
      mid: 'sample',
      events: {
        'click': '_click'
      }
    });

    this.suite = _process.suite;
    this.case = _case;

    this.processList = DOM.$('process');
    this.process = _process;

    this.rowTempl = hogan.compile(DOM.$('process-row-templ').innerHTML);
    this.sampleFormTempl = hogan.compile(DOM.$('sample-form-templ').innerHTML);

    this._initSamples();
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

  /**
   * Check the existance of samples
   *
   * @private
   * @param {String} name
   *
   * @return {Boolean}
   */
  _exist(name) {
    const benches = this.suite.benchmarks;

    if( !benches.length ) return;

    let i = benches.length - 1;

    do {
      if( benches[i].name === name ) return true;
    } while( i-- );

    return false;
  }

  /**
   * Get process item row
   *
   * @private
   * @param {Node} elem
   *
   * @return {Node}
   */
  _getItemRow(elem, id) {
    return DOM.$('samle-' + id);
  }

  /**
   * Edit sample
   *
   * @public
   */
  editSample() {
    this.openSample.call(this, 'edit');
  }

  /**
   * Remove sample from process list
   *
   * @public
   */
  removeSample() {
    let item = this.getItem(this.cel);
    let id = item.getAttribute('data-uid');
    let row = DOM.$('sample-' + id);

    row.parentNode.removeChild(row);
    this.remove('sample', id);

    this.process.removeBench(id);
    this._removeStoredSample(id);
  }

  /**
   * Show sample form
   *
   * @public
   */
  openSample(edit) {
    let elem = this.cel;
    let item = edit ? this.getItem(elem) : this.createSampleItem(elem);
    let id = edit ? item.getAttribute('data-uid') : 'add';

    this.showForm(item, 'sample', {}, {
      type: edit || 'add',
      id: id
    }, edit);

    if( edit ) {
      DOM.$('sample-' + id + '-name').value = item.getAttribute('data-uid');
    }
  }

  /**
   * Init samples from caches
   * @private
   */
  _initSamples() {
    let _case = this.case.getWorkingCase();

    if( !_case ) return;

    let samples = _case.samples;

    if( !samples.length ) return;

    utils.forEach(samples, (sample) => {
      this._save(sample);
    });
  }

  /**
   * Store sample to current working case
   * @private
   *
   * @param {String} name
   * @param {Object} data - { name: String, code: String }
   */
  _storeSample(name, data) {
    let _case = this.case.getWorkingCase();
    let samples = _case.samples;
    name = data.oldId || name;

    this.removeFromArray(name, samples);

    delete data.oldId;
    samples.push(data);

    this.case.setCaseItem(_case);
  }

  /**
   * Remove sample from current working case
   * @private
   *
   * @param  {String} name
   */
  _removeStoredSample(name) {
    let _case = this.case.getWorkingCase();
    let samples = _case.samples;

    this.removeFromArray(name, samples);

    this.case.setCaseItem(_case);
  }

  /**
   * Save sample, if data passed in from first initialize, create new div then render
   *
   * @public
   * @param {Object} data
   */
  _save(data, item) {
    let name = data.name;
    let code = data.code;
    let oldId = data.oldId;

    if( !name|| !code || (!oldId && this._exist(name)) ) return;

    if( !item ) {
      item = this.createSampleItem(DOM.$('sample-add'));
    }

    this.suite.add(name, code);
    this.revealAddButton('sample');

    this.renderSavedState('sample', item, code, name, {
      handler: 'sample',
      name: 'Sample',
      id: name,
      language: 'javascript',
      sample: [{ id: name }]
    });

    if( item) this._storeSample(name, data);

    this.renderRow({
      id: name,
      name: name
    }, oldId);
  }

  add() {
    let item = this.getItem(this.cel);
    let name = DOM.$('sample-add-name').value;
    let code = this.getEditor('sample-add').getValue().trim();

    this._save({
      name: name,
      code: code
    }, item);
  }

  edit() {
    let item = this.getItem(this.cel);
    let oldId = item.getAttribute('data-uid');
    let name = DOM.$('sample-' + oldId + '-name').value;
    let code = this.getEditor('sample-' +  oldId).getValue().trim();

    if( !name || !code ) return;
    if( name !== oldId && this._exist(name) ) {
      return;
    }

    this.removeFromCache(oldId);
    this.process.removeBench(oldId);

    this._save({
      oldId: oldId,
      name: name,
      code: code
    }, item);
  }

  /**
   * Cancel edit
   *
   * @public
   */
  cancel() {
    let elem = this.cel;
    let item = this.getItem(elem);
    let isAdd = ~item.className.indexOf(this.getStateClass('add'));
    let name = item.getAttribute('data-uid');
    let cache = this.getCacheItem(name);

    if( isAdd ) {
      item.parentNode.removeChild(item);
      this.revealAddButton('sample');
    } else {
      this.renderSavedState('sample', item, cache.code, name, {
        handler: 'sample',
        name: 'Sample',
        id: name,
        language: 'javascript',
        sample: [{ id: name }]
      });
    }

  }

  /**
   * Run benchmark
   *
   * @public
   */
  run() {
    this.process.run();
  }

  renderRow(obj, oldId) {
    let row = DOM.toDOM(this.rowTempl.render(obj));

    if( oldId ) {
      let orow = DOM.$('sample-' + oldId);
      orow.parentNode.removeChild(orow);
    }

    this.processList.appendChild(row);
  }
}

export default Sample;