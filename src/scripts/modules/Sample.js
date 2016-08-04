import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

class Sample extends Base {
  constructor(process) {
    super({
      mid: 'sample',
      events: {
        'click': '_click'
      }
    });

    this.suite = process.suite;

    this.processList = DOM.$('process');
    this.process = process;

    this.rowTempl = hogan.compile(DOM.$('process-row-templ').innerHTML);
    this.sampleFormTempl = hogan.compile(DOM.$('sample-form-templ').innerHTML);
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
    this._remove('sample', id);

    this.process.removeBench(id);
  }

  /**
   * Show sample form
   *
   * @public
   */
  openSample(edit) {
    let elem = this.cel;
    let item = edit ? this.getItem(elem) : this.createSampleItem(elem);

    this.showForm(item, 'sample', {}, null, edit);

    if( edit === true ) {
      DOM.$('sample-name').value = item.getAttribute('data-uid');
    }
  }

  /**
   * Save sample, if data passed in from first initialize, create new div then render
   *
   * @public
   * @param {Object} data
   */
  save(data) {
    let item, name, code;

    if( data ) {
      item = this.createSampleItem(DOM.$('sample-add'));

      // handle data input from outside
      if( data.name ) {
        name = data.name;
        code = data.code;

      // get old data when user click cancel
      } else {
        name = item.getAttribute('data-uid');

        let cache =  this.getCacheItem(name);
        code = cache.code;
      }
    } else {
      item = this.getItem(this.cel);
      name = DOM.$('sample-name').value;
      code = this.sampleEditor.getValue().trim();
    }

    let oldId = item.getAttribute('data-uid');
    if( !name|| !code || (!oldId && this._exist(name)) ) return;

    this.suite.add(name, code);
    this.revealAddButton('sample');

    if( name !== oldId ) {
      this.removeFromCache(oldId);
      this.process.removeBench(oldId)
    }

    this.renderSavedState('sample', item, code, name, {
      handler: 'sample',
      name: 'Sample',
      id: name,
      language: 'javascript',
      sample: [{ id: name }]
    });

    if( data === 'cancel' ) return;

    this.renderRow({
      id: name,
      name: name
    }, oldId);
  }

  /**
   * Cancel edit
   *
   * @public
   */
  cancel() {
    let elem = this.cel;
    let item = this.getItem(elem);
    let isEdit = item.className.indexOf('sample-item--edit');

    if( !isEdit ) {
      item.parentNode.removeChild(item);
      this.revealAddButton('sample');
    } else {
      this.save('cancel');
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
