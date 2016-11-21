import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import Promise from 'bluebird';

const MAXIMUM_FILE_SIZE = 2000;
const REG_URL = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b(?:[-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/g;

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
    this.bench.getWorkingBench().then(([bench]) => {
      let isSearchPage = this.isSearchPage();

      let samples = bench.samples;

      if( !samples.length ) return;

      utils.forEach(samples, (sample) => {
        this.storeCache(sample.id, sample);

        if( !isSearchPage ) {
          this._save(sample, null, true);
        }
      });
    });

  }

  /**
   * Store sample to current working bench
   * @private
   *
   * @param {String} name
   * @param {Object} data - { name: String, code: String }
   */
  _storeSample(data) {
    if( !data.owner && (!data.name || !data.code) ) return;

    return this.bench.getWorkingBench().then(([bench]) => {
      let samples = bench.samples;

      this.removeFromArray(data.id, samples);
      samples.push(data);

      this.bench.setBenchItem(bench);
      this.storeCache(data.id, data);
    });
  }

  /**
   * Remove sample from current working bench
   * @private
   *
   * @param  {String} name
   */
  _removeStoredSample(id) {
    return this.bench.getWorkingBench().then(([bench]) => {
      let samples = bench.samples;

      this.removeFromArray(id, samples);

      this.bench.setBenchItem(bench);
      this.removeFromCache(id);
    });
  }

  /**
   * Save sample, if data passed in from first initialize, create new div then render
   *
   * @public
   * @param {Object} data
   */
  _save(data, item, fromDB) {
    let id = data.id;

    if( !item ) item = this.createSampleItem(DOM.$('sample-add'));

    this.renderSampleItem(data, item).then((code) => {
      if( data.owner ) {
        this.github.isStarred(data.gid).then((starred) => {
          let button = document.getElementById('star-' + data.id);
          let parent = button.parentNode;

          parent.insertBefore(DOM.toDOM(this.template('star').render(utils.extend({}, data, { starred: starred }))), button);
          parent.removeChild(button);
        });
      }

      code = data.code || code;

      if( !fromDB ) this._storeSample(data);
      this.process.addSuite(data.id, code);
      this.renderRow(data);
    });

    this.revealAddButton('sample');
  }

  renderSampleItem(data, item) {
    let partials = {};

    let config = {
      handler: 'sample',
      name: 'Sample',
      sample: { name: data.name },
      prism: [{
        id: data.id,
        language: 'javascript',
        raw_url: this.github.toRawUrl(data),
        code: data.code
      }],
      hasOwner: !!data.owner
    }, ownerModel;

    if( config.hasOwner ) {
      partials.star = this.template('star');
      ownerModel = this.toOwnerModel(data);

      config.description = data.description.replace(REG_URL, (link) => {
        return `<a href="${link}" target="_blank">${link}</a>`;
      });
    }

    return this.renderSavedState('sample', item, utils.extend({}, data, ownerModel, config), partials);
  }

  /**
   * Handler: star a gist
   */
  star() {
    let id = this.cel.getAttribute('data-id');
    let cache = this.getCacheItem(id);
    let starred = +this.cel.getAttribute('data-starred');

    this.github.star(this.cel.getAttribute('data-url'), starred, this.cel).then(() => {
      let parent = this.cel.parentNode;
      parent.insertBefore(DOM.toDOM(this.template('star').render(utils.extend({}, cache, {
        starred: starred ? 0 : 1
      }))), this.cel);
      parent.removeChild(this.cel);
    });
  }

  toOwnerModel(data) {
    let _owner = {};

    _owner.avatar_url = this.github.toAvatarUrl(data.owner.id);

    return { owner: utils.extend({}, data.owner, _owner) };
  }


  /**
   * Handler: add/remove sample from github's gist
   */
  sampleGist() {
    let elem = this.cel;
    let data = JSON.parse(elem.getAttribute('data-sample-item'));
    let button = () => {
      let state = this._exist(data.id) ? 'Remove' : 'Add';

      DOM.removeClass(elem, 'alert');

      elem.innerHTML = state + ' Sample';

      if( state === 'Remove' ) {
        elem.className += ' alert';
      }
    };

    // handle remove sample
    if( this._exist(data.id) ) {
      this._removeStoredSample(data.id).then(button);
    // handle add sample
    } else {
      this._storeSample(data).then(button);
    }
  }

  prepareSampleButtonForGist(file, gist) {
    let arr = file.raw_url.split('/');

    let data = {
      name: file.filename,
      gid: gist.id,
      id: arr[arr.length - 2],
      description: gist.description,
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

    if( !code || !name ) return;

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
    let id = item.getAttribute('data-uid');
    this.bench.toUrl(id).then((url) => {
      this.popup.modal({
        title: 'Share Sample',
        url: url
      }, this.template('pop-share-sample'));

      this._setSelectionRange('share-sample');
    });
  }

  shareSamplesPopUp() {
    this.bench.getWorkingBench().then(([bench]) => {
      this.popup.modal({
        title: 'Share Samples',
        samples: bench.samples
      }, this.template('pop-share-samples'));
    });
  }

  chooseShareSample() {
    let elem = this.cel;
    let target = elem.getAttribute('data-target');
    let urlField = DOM.$(target);
    let ids = JSON.parse(urlField.getAttribute('data-ids'));

    if( elem.checked ) {
      ids.push(elem.value);
    } else {
      this.removeFromArray(elem.value, ids);
    }

    if( !ids.length ) {
      urlField.value = '';
    } else {
      this.bench.toUrl(ids).then((url) => {
        urlField.value = url;
      });
    }

    urlField.setAttribute('data-ids', JSON.stringify(ids));
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
    let id = item.getAttribute('data-uid');
    let name = DOM.$('sample-' + id + '-name').value;
    let code = this.getEditor('sample-' +  id).getValue().trim();

    if( !name || !code ) return;

    this.removeFromCache(id);
    this.process.removeSuite(id);

    this._save({ id: id, name: name, code: code }, item);
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

  renderRow(data) {
    let row = DOM.toDOM(this.template('process-row').render(data));

    let orow = DOM.$('sample-' + data.id);
    if( orow ) orow.parentNode.removeChild(orow);

    this.processList.appendChild(row);
  }
}

export default Sample;
