import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import Promise from 'bluebird';

const MAXIMUM_FILE_SIZE = 2000;

class Sample extends Base {
  constructor(_process, _bench, _popup, github) {
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
    this.github = github;

    this.setTemplate(['process-row', 'sample-form', 'pop-share-sample', 'pop-share-samples', 'checkmark', 'cross', 'star']);

    this._initSamples();
  }

  /**
   * Handle click for sample handler
   *
   * @private
   */
  _click(e) {
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
  _exist(id) {
    return this.getCacheItem(id);
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
    let cache = this.getCacheItem(id);

    this.showForm(item, 'sample', [{
      name: 'sample'
    }], {
      type: edit || 'add',
      id: id
    }, edit);

    if( edit ) {
      DOM.$('sample-' + id + '-name').value = cache.name;
    }
  }

  /**
   * Init samples from caches
   * @private
   */
  _initSamples() {
    let isSearchPage = this.isSearchPage();

    let _bench = this.bench.getWorkingBench();

    if( !_bench ) return;

    let samples = _bench.samples;

    if( !samples.length ) return;

    let render = (sample) => {
      if( !isSearchPage ) {
        this._save(sample);
      }

      this.storeCache(sample.id, sample);
    };

    utils.forEach(samples, (sample) => {
      // Try to get code from raw url if its size > MAXIMUM_FILE_SIZE
      if( !sample.code && sample.raw_url ) {
        utils.ajax(sample.raw_url).then((code) => {
          sample.code = code;
          render(sample);
        });
      } else render(sample);
    });
  }

  /**
   * Store sample to current working bench
   * @private
   *
   * @param {String} name
   * @param {Object} data - { name: String, code: String }
   */
  _storeSample(id, data) {
    let _bench = this.bench.getWorkingBench();
    let samples = _bench.samples;
    id = data.oldId || id;

    this.removeFromArray(id, samples);

    delete data.oldId;
    samples.push(data);

    this.bench.setBenchItem(_bench);
    this.storeCache(id, data);
  }

  /**
   * Remove sample from current working bench
   * @private
   *
   * @param  {String} name
   */
  _removeStoredSample(id) {
    let _bench = this.bench.getWorkingBench();
    let samples = _bench.samples;

    this.removeFromArray(id, samples);

    this.bench.setBenchItem(_bench);
    this.removeFromCache(id);
  }

  /**
   * Save sample, if data passed in from first initialize, create new div then render
   *
   * @public
   * @param {Object} data
   */
  _save(data, item) {
    let id = data.id;
    let code = data.code;
    let oldId = data.oldId;

    if( !id || !code || (!oldId && this._exist(id)) ) return;

    if( !item ) {
      item = this.createSampleItem(DOM.$('sample-add'));
    } else {
      this._storeSample(id, data);
    }

    this.process.addSuite(id, code);
    this.revealAddButton('sample');

    this.renderSampleItem(data, item);

    this.renderRow({
      id: id,
      name: data.name
    }, oldId);
  }

  renderSampleItem(data, item) {
    let partials = {};

    if( data.owner ) {
      partials.star = this.template('star');
      this.toGistModel(data);
    }

    this.renderSavedState('sample', item, utils.extend({}, data, {
      handler: 'sample',
      name: 'Sample',
      sample: { id: data.name },
      prism: [{
        pid: data.name,
        language: 'javascript',
        code: data.code
      }]
    }), partials);
  }

  /**
   * Handler: star a gist
   */
  star() {
    this.github.star(this.cel.getAttribute('href'), this.cel.getAttribute('data-starred')).then(() => {
      let starHTML = this.template('star').render(this.github.toStarModel({
        starred: true,
        id: this.cel.getAttribute('data-id')
      }));

      let parent = this.cel.parentNode;
      parent.insertBefore(DOM.toDOM(starHTML), this.cel);
      parent.removeChild(this.cel);
    });
  }

  toGistModel(data, partials) {
    let owner = data.owner;

    owner.avatar_url = this.github.toAvatarUrl(owner.id);
    this.github.toStarModel(data);
  }


  /**
   * Handler: add/remove sample from github's gist
   */
  sampleGist() {
    let elem = this.cel;
    let data = JSON.parse(elem.getAttribute('data-sample-item'));
    let button = () => {
      let state = this._exist(data.name) ? 'Remove' : 'Add';

      let text = state + ' Sample';
      DOM.removeClass(elem, 'alert');

      elem.innerHTML = text;

      if( state === 'Remove' ) {
        elem.className += ' alert';
      }
    };

    // handle remove sample
    if( this._exist(data.name) ) {
      this._removeStoredSample(data.name);
      button();
    // handle add sample
    } else {
      let loader = this.loader({
        size: 'small',
        target: elem
      });

      loader.start();
      Promise.join(utils.ajax(this.github.toRawUrl(data)).then((code) => {
        if( data.size < MAXIMUM_FILE_SIZE ) {
          data.code = code;
        }

        return data;
      }), this.github.isStarred(data.gid), (data, starred) => {
        data.starred = starred;

        this._storeSample(data.id, data);

        button();
      });
    }
  }

  prepareSampleButtonForGist(file, gist) {
    let arr = file.raw_url.split('/');

    let data = {
      name: file.filename,
      gid: gist.id,
      id: arr[arr.length - 2],
      size: file.size,
      owner: {
        login: gist.owner.login,
        id: gist.owner.id
      }
    };

    let sample = {
      data: JSON.stringify(data),
      buttonText: 'Add'
    };

    if( this._exist(data.id) ) {
      sample.buttonClass = 'alert';
      sample.buttonText = 'Remove';
    }

    file.sample = sample;
  }

  add() {
    let item = this.getItem(this.cel);
    let name = DOM.$('sample-add-name').value;
    let code = this.getEditor('sample-add').getValue().trim();

    this._save({
      id: new Date().getTime() + '',
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
    }, this.template('pop-share-sample'));

    this._setSelectionRange('share-sample');
  }

  shareSamplesPopUp() {
    let bench = this.bench.getWorkingBench();

    this.popup.modal({
      title: 'Share Samples',
      samples: bench.samples
    }, this.template('pop-share-samples'));
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
    let id = item.getAttribute('data-uid');
    let cache = this.getCacheItem(id);

    if( isAdd ) {
      item.parentNode.removeChild(item);
      this.revealAddButton('sample');
    } else {
      this.renderSampleItem(cache, item);
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
    let row = DOM.toDOM(this.template('process-row').render(obj));

    if( oldId ) {
      let orow = DOM.$('sample-' + oldId);
      orow.parentNode.removeChild(orow);
    }

    this.processList.appendChild(row);
  }
}

export default Sample;
