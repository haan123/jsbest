import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';

class Setup extends Base {
  constructor(_process, _bench) {
    super({
      mid: 'setup',
      events: {
        'click': '_click'
      }
    });

    this.processList = DOM.$('process');
    this.context = _process.context;
    this.process = _process;

    this._id = 'setup';
    this.bench = _bench;

    this.setTemplate(['setup-form', 'setup-url']);

    this._initSetup();
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

  openSetup(edit) {
    let elem = this.cel;
    let item = edit ? elem : this.createSampleItem(elem);
    let id = edit || 'add';
    let cache = this.getCacheItem(this._id);

    if( !this._urls ) {
      this._urls = cache.urls ? cache.urls.slice(0) : [];
    }

    this.showForm(item, 'setup', [{
      name: 'setup-html',
      lang: 'html',
      config: {
        mode: "xml",
        htmlMode: true
      }
    }, {
      name: 'setup-js',
      lang: 'js'
    }], {
      type: edit || 'add',
      id: id,
      urls: this._toUrlModel(cache.urls)
    }, edit, { urls: this.template('setup-url') });

    this.getEditor('setup-html-' + id).focus();
  }

  /**
   * Init setup from caches
   * @private
   */
  _initSetup() {
    this.bench.getWorkingBench().then(([bench]) => {
      if( !bench.setup ) return;

      this.storeCache(this._id, bench.setup);
      this._save(bench.setup, null, true);
    });

  }

  /**
   * Store setup to current working bench
   * @private
   *
   * @param {Object} data - { name: String, code: String }
   */
  _storeSetup(data) {
    this.bench.getWorkingBench().then(([bench]) => {
      bench.setup = data;

      this.bench.setBenchItem(bench);
      this.storeCache(this._id, data);
    });
  }

  /**
   * Clear setup from current working bench
   * @private
   *
   * @param  {String} name
   */
  _removeStoredSetup(id) {
    this.bench.getWorkingBench().then(([bench]) => {
      bench.setup = {};

      this.bench.setBenchItem(bench);
      this.storeCache(this._id, bench.setup);
    });
  }

  /**
   * Remove url from current working bench
   * @private
   *
   * @param  {String} id
   */
  _removeStoredUrl(id) {
    this.bench.getWorkingBench().then(([bench]) => {
      bench.setup.urls.splice(id, 1);

      this.bench.setBenchItem(bench);
    });
  }

  /**
   * Store url from current working bench
   * @private
   *
   * @param  {Object} url`
   */
  _StoredUrl(url) {
    this.bench.getWorkingBench().then(([bench]) => {
      let urls = bench.setup.urls;

      this.removeFromArray(url.id, urls);
      urls.push(url);

      this.bench.setBenchItem(bench);
    });
  }

  _toUrlModel(urls=[]) {
    return urls.map((url) => {
      return {url};
    });
  }

  /**
   * Save and render setup data
   * @param  {Object} data
   */
  _save(data, item, fromDB) {
    let code = data.code;
    let urls = data.urls;

    if( !fromDB ) this._storeSetup(data);

    if( !code || (!code.html && !code.js && !urls) ) return;

    if( !item  ) {
      item = this.createSampleItem(DOM.$('setup-add'));
      if( urls ) utils.forEach(urls, (url) => this._cachedUrl(url));
    }

    this.process._queueForIframe(() => {
      this.context.document.body.innerHTML = code.html;
      if( urls ) this._embedUrls(urls);
    });

    this.process.reloadIframe();

    this.process.bmSetup(code.js);

    this.renderSetup(data, item).then(() => {
    });
  }

  renderSetup(data, item) {
    let config = utils.extend({}, data, {
      id: 'setup',
      handler: 'setup',
      name: 'Setup',
      urls: this._toUrlModel(data.urls),
      prism: [{
        id: 'setup-html',
        language: 'markup',
        code: data.code.html
      }, {
        id: 'setup-js',
        language: 'javascript',
        code: data.code.js
      }]
    });

    return this.renderSavedState('setup', item, config);
  }

  /**
   * Add setup data
   */
  add(edit) {
    let type = edit || 'add';
    let html = this.getEditor('setup-html-' + type).getValue().trim();
    let js = this.getEditor('setup-js-' + type).getValue().trim();
    let item = this.getItem(this.cel);
    let cache = this.getCacheItem(this._id);
    let data = { code: {} };

    if( !html && !js && !this._urls.length ) {
      if( edit ) this.removeSetup(item);
      return;
    }

    cache.urls = this._urls;
    delete this._urls;

    this._save({
      code: {
        html: html,
        js: js
      },
      urls: cache.urls
    }, item);
  }

  /**
   * Edit setup data
   */
  edit() {
    this.add.call(this, 'edit');
  }

  /**
   *  cancel edit/add setup
   *
   * @public
   */
  cancel() {
    let elem = this.cel;
    let item = this.getItem(elem);
    let isAdd = ~item.className.indexOf(this.getStateClass('add'));
    let cache = this.getCacheItem(this._id);
    let code = cache.code;

    delete this._urls;

    if( isAdd ) {
      item.parentNode.removeChild(item);
      this.revealAddButton('setup');
      delete cache.urls;
    } else {
      this.renderSetup(cache, item);
    }
  }

  /**
   * Add url handler
   *
   * @public
   */
  addUrl() {
    let cache = this.getCacheItem(this._id);
    let elem = this.cel;
    let form = DOM.closest(elem, '.setup__form');
    let field = DOM.$('setup-url-field');
    let url = field.value;

    if( !url ) return;

    if( this._urls.indexOf(url) < 0 ) {
      this._urls.push(url);
    }

    let urlItem = DOM.toDOM(this.template('setup-url').render({
      urls: {url}
    }));

    form.insertBefore(urlItem, elem.parentNode.nextSibling);
    field.value = '';
    field.focus();
  }

  /**
   * Cache url
   *
   * @private
   * @param {String} url
   */
  _cachedUrl(url) {
    let cache = this.getCacheItem(this._id);

    if( !cache.urls ) cache.urls = [];

    if( cache.urls.indexOf(url) !== -1 ) return;

    cache.urls.push(url);
  }

  /**
   * remove url handler
   *
   * @public
   */
  removeUrl() {
    let cache = this.getCacheItem(this._id);
    let url = this.cel.getAttribute('data-url');
    let setup = this.cel.parentNode;
    let idx = this._urls.indexOf(url);

    if( idx !== -1 ) {
      this._urls.splice(idx, 1);
    }

    setup.parentNode.removeChild(setup);
  }

  /**
   * Embed external libraries to iframe
   *
   * @private
   * @param {Array} urls
   */
  _embedUrls(urls) {
    if( !urls.length ) return '';
    let script = document.createElement('script');

    for( let i = 0, len = urls.length; i < len; i++ ) {
      let temp = script.cloneNode(true);
      temp.src = urls[i];
      this.context.document.body.appendChild(temp);
    }
  }

  /**
   * Remove setup handler
   *
   * @public
   */
  removeSetup(item) {
    item = item || this.getItem(this.cel);
    let id = item.getAttribute('data-uid');

    this.removeSetupView(item, id);

    this._removeStoredSetup(id);

    this.process.reloadIframe();
  }

  /**
   * Remove set item, setup iframe from the view
   * @public
   *
   * @param {Node} item
   * @param {String} id
   */
  removeSetupView(item, id) {
    this.remove(item, 'setup', id);
    this.context.document.body.innerHTML = '';
    this.cache = {};
  }

  /**
   * Edit setup code
   *
   * @public
   */
  editSetup() {
    this.openSetup.call(this, 'edit');
  }
}

export default Setup;
