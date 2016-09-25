import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';

const MODULE_NAME = '__SETUP__';

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

    this.bench = _bench;

    this.setTemplate(['setup-form', 'setup-url']);

    this.cache = this.setCacheItem(MODULE_NAME, {});

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

  getModuleName() {
    return MODULE_NAME;
  }

  openSetup(edit) {
    let elem = this.cel;
    let item = edit ? elem : this.createSampleItem(elem);
    let id = edit || 'add';

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
      urls: this.cache.urls || ''
    }, edit);

    this.getEditor('setup-html-' + id).focus();
  }

  /**
   * Init setup from caches
   * @private
   */
  _initSetup() {
    let _bench = this.bench.getWorkingBench();

    if( !_bench ) return;

    let setup = _bench.setup;

    if( !setup.code ) return;

    this._save(setup);
    this.cache = this.storeCache(setup.name, setup.code);;
  }

  /**
   * Store setup to current working bench
   * @private
   *
   * @param {Object} data - { name: String, code: String }
   */
  _storeSetup(data) {
    let _bench = this.bench.getWorkingBench();

    _bench.setup = data;

    this.bench.setBenchItem(_bench);
    this.storeCache(MODULE_NAME);
  }

  /**
   * Clear setup from current working bench
   * @private
   *
   * @param  {String} name
   */
  _removeStoredSetup(name) {
    let _bench = this.bench.getWorkingBench();

    _bench.setup = {};

    this.bench.setBenchItem(_bench);
    this.removeFromCache(name);
  }

  /**
   * Remove url from current working bench
   * @private
   *
   * @param  {String} id
   */
  _removeStoredUrl(id) {
    let _bench = this.bench.getWorkingBench();

    _bench.setup.urls.splice(id, 1);

    this.bench.setBenchItem(_bench);
  }

  /**
   * Store url from current working bench
   * @private
   *
   * @param  {Object} url
   */
  _StoredUrl(url) {
    let _bench = this.bench.getWorkingBench();
    let urls = _bench.setup.urls;

    this.removeFromArray(url.id, urls);
    urls.push(url);

    this.bench.setBenchItem(_bench);
  }

  /**
   * Save and render setup data
   * @param  {Object} data
   */
  _save(data, item) {
    let code = data.code;
    let urls = data.urls;

    if( !code ) return;

    if( !item  ) {
      item = this.createSampleItem(DOM.$('setup-add'));
      if( urls ) utils.forEach(urls, (url) => this._cachedUrl(url));
    } else {
      this._storeSetup(data);
    }

    this.process._queueForIframe(() => {
      this.context.document.body.innerHTML = code.html;
      if( urls ) this._embedUrls(urls);
    });

    this.process.reloadIframe();

    this.process.bmSetup(code.js);

    this.renderSavedState('setup', item, code, MODULE_NAME, {
      handler: 'setup',
      name: 'Setup',
      id: 'setup',
      urls: urls,
      prism: [{
        pid: 'setup-html',
        language: 'markup',
        code: code.html
      }, {
        pid: 'setup-js',
        language: 'javascript',
        code: code.js
      }]
    });
  }

  /**
   * Add setup data
   */
  add(edit) {
    let type = edit || 'add';
    let html = this.getEditor('setup-html-' + type);
    let js = this.getEditor('setup-js-' + type);
    let item = this.getItem(this.cel);

    this._save({
      code: {
        html: html.getValue().trim(),
        js: js.getValue().trim()
      },
      urls: this.cache.urls
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
    let code = this.cache.code;

    if( isAdd ) {
      item.parentNode.removeChild(item);
      this.revealAddButton('setup');
      this.cache.urls = [];
    } else {
      this.renderSavedState('setup', item, code, MODULE_NAME, {
        handler: 'setup',
        name: 'Setup',
        id: 'setup',
        urls: this.cache.urls,
        prism: [{
          pid: 'setup-html',
          language: 'markup',
          code: code.html
        }, {
          pid: 'setup-js',
          language: 'javascript',
          code: code.js
        }]
      });
    }
  }

  /**
   * Check existing url
   *
   * @private
   * @param {Object} urls
   * @param {String} url
   *
   * @return {Boolean}
   */
  _existUrl(urls, url) {
    let i = urls.length;

    while ( i-- ) {
      if( urls[i] === url ) return true;
    }

    return false;
  }

  /**
   * Add url handler
   *
   * @public
   */
  addUrl() {
    let elem = this.cel;
    let form = DOM.closest(elem, '.setup__form');
    let field = DOM.$('setup-url-field');
    let url = field.value;

    if( !url ) return;

    let obj = this._cachedUrl(url);

    if( !obj ) return;

    let urlItem = DOM.toDOM(this.template('setup-url').render({
      id: obj.id,
      url: url
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
   *
   * @return {Number}
   */
  _cachedUrl(url) {
    let cache = this.cache;
    url = typeof url === 'string' ? { url: url} : url;

    if( !cache.urls ) cache.urls = [];

    if( this._existUrl(cache.urls, url.url) ) return;
    url.id = cache.urls.length;

    cache.urls.push(url);

    return url;
  }

  /**
   * remove url handler
   *
   * @public
   */
  removeUrl() {
    let id = this.cel.getAttribute('data-url-id');
    // if( !id ) return;

    let setup = this.cel.parentNode;

    this.cache.urls.splice(id, 1);
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
      temp.src = urls[i].url;
      this.context.document.body.appendChild(temp);
    }
  }

  /**
   * Remove setup handler
   *
   * @public
   */
  removeSetup() {
    let item = this.getItem(this.cel);
    let id = item.getAttribute('data-uid');

    this.removeSetupView(item, id);

    this._removeStoredSetup(id);
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
