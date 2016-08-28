import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

class Sample extends Base {
  constructor(_process, _bench, _popup) {
    super({
      mid: 'sample',
      events: {
        'click': '_click'
      }
    });

    this.bench = _bench;

    this.processList = DOM.$('process');
    this.process = _process;
    this.popup = _popup;

    this.rowTempl = hogan.compile(DOM.$('process-row-templ').innerHTML);
    this.sampleFormTempl = hogan.compile(DOM.$('sample-form-templ').innerHTML);
    this.popShareSampleTempl = hogan.compile(DOM.$('pop-share-sample-templ').innerHTML);
    this.popShareSamplesTempl = hogan.compile(DOM.$('pop-share-samples-templ').innerHTML);

    this._initSamples();
  }

  /**
   * Handle click for sample handler
   *
   * @private
   */
  _click(e) {console.log(e)
    const type = this.cel.getAttribute('data-type');
    if( !this[type]() ) e.preventDefault();
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
    return this.getCacheItem(name);
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

    this.removeSampleView(item, id);
    this._removeStoredSample(id);
  }

  /**
   * Remove sample item, sample row in process table from the view
   * @public
   *
   * @param {Node} item
   * @param {String} id
   */
  removeSampleView(item, id) {
    let row = DOM.$('sample-' + id);

    row.parentNode.removeChild(row);
    this.remove(item, 'sample', id);

    this.process.removeSuite(id);
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

    this.showForm(item, 'sample', [{
      name: 'sample'
    }], {
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
    let _bench = this.bench.getWorkingBench();

    if( !_bench ) return;

    let samples = _bench.samples;

    if( !samples.length ) return;

    utils.forEach(samples, (sample) => {
      this._save(sample);
    });
  }

  /**
   * Store sample to current working bench
   * @private
   *
   * @param {String} name
   * @param {Object} data - { name: String, code: String }
   */
  _storeSample(name, data) {
    let _bench = this.bench.getWorkingBench();
    let samples = _bench.samples;
    name = data.oldId || name;

    this.removeFromArray(name, samples);

    delete data.oldId;
    samples.push(data);

    this.bench.setBenchItem(_bench);
  }

  /**
   * Remove sample from current working bench
   * @private
   *
   * @param  {String} name
   */
  _removeStoredSample(name) {
    let _bench = this.bench.getWorkingBench();
    let samples = _bench.samples;

    this.removeFromArray(name, samples);

    this.bench.setBenchItem(_bench);
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
    } else {
      this._storeSample(name, data);
    }

    this.process.addSuite(name, code);
    this.revealAddButton('sample');

    this.renderSavedState('sample', item, code, name, {
      handler: 'sample',
      name: 'Sample',
      id: name,
      sample: [{ id: name }],
      prism: [{
        pid: name,
        language: 'javascript',
        code: code
      }]
    });

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

  _setSelectionRange(target) {
    let urlField = DOM.$(target);
    urlField.focus();
    urlField.setSelectionRange(0, urlField.value.length);
  }

  shareSamplePopUp() {
    let item = this.getItem(this.cel);
    let name = item.getAttribute('data-uid');
    let url = this.bench.toUrl(name);

    this.popup.modal({
      name: name,
      title: 'Share Sample',
      url: url
    }, this.popShareSampleTempl);

    this._setSelectionRange('share-sample');
  }

  shareSamplesPopUp() {
    let bench = this.bench.getWorkingBench();

    this.popup.modal({
      title: 'Share Samples',
      samples: bench.samples
    }, this.popShareSamplesTempl);
  }

  chooseShareSample() {
    let elem = this.cel;
    let target = elem.getAttribute('data-target');
    let urlField = DOM.$(target);
    let names = JSON.parse(urlField.getAttribute('data-names'));

    if( elem.checked ) {
      names.push(elem.value);
    } else {
      this.removeFromArray(elem.value, names);
    }

    let url = '';
    if( !names.length ) {
      urlField.value = '';
    } else {
      url = this.bench.toUrl(names);
    }

    urlField.setAttribute('data-names', JSON.stringify(names));
    urlField.value = url;
    this._setSelectionRange(target);

    // stop preventDefault
    return true;
  }

  copyUrlSample() {
    this._setSelectionRange(this.cel.getAttribute('data-target'));
    this.copy();
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
    this.process.removeSuite(oldId);

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
        sample: [{ id: name }],
        prism: [{
          pid: name,
          language: 'javascript',
          code: cache.code
        }]
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
