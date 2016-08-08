import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

class Setup extends Base {
  constructor(_process, _case) {
    super({
      mid: 'setup',
      events: {
        'click': '_click'
      }
    });

    this.processList = DOM.$('process');
    this.process = _process;
    this.context = _process.context;
    this.case = _case;

    this.setupFormTempl = hogan.compile(DOM.$('setup-form-templ').innerHTML);
    this.setupUrlTempl = hogan.compile(DOM.$('setup-url-templ').innerHTML);
    this._id = 'setup';
    this.cache = this.setCacheItem('setup', {});

    this._initSetup();
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

  openSetup(edit) {
    let elem = this.cel;
    let item = edit ? elem : this.createSampleItem(elem);

    let editor = this.showForm(item, 'setup', {
      mode: "xml",
      htmlMode: true
    }, {
      type: edit || 'add',
      id: edit || 'add',
      urls: this.cache.urls || ''
    }, edit);

    editor.focus();
  }

  /**
   * Init setup from caches
   * @private
   */
  _initSetup() {
    let _case = this.case.getWorkingCase();

    if( !_case ) return;

    let setup = _case.setup;

    if( !setup.code ) return;

    this._save(setup);
  }

  /**
   * Store setup to current working case
   * @private
   *
   * @param {Object} data - { name: String, code: String }
   */
  _storeSetup(data) {
    let _case = this.case.getWorkingCase();

    _case.setup = data;

    this.case.setCaseItem(_case);
  }

  /**
   * Clear setup from current working case
   * @private
   *
   * @param  {String} name
   */
  _removeStoredSetup(name) {
    let _case = this.case.getWorkingCase();

    _case.setup = {};

    this.case.setCaseItem(_case);
  }

  /**
   * Remove url from current working case
   * @private
   *
   * @param  {String} id
   */
  _removeStoredUrl(id) {
    let _case = this.case.getWorkingCase();

    _case.setup.urls.splice(id, 1);

    this.case.setCaseItem(_case);
  }

  /**
   * Store url from current working case
   * @private
   *
   * @param  {Object} url
   */
  _StoredUrl(url) {
    let _case = this.case.getWorkingCase();
    let urls = _case.setup.urls;

    this.removeFromArray(url.id, urls);
    urls.push(url);

    this.case.setCaseItem(_case);
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
    }

    this.context.document.body.innerHTML = code;

    if( urls ) this._embedUrls(urls);

    this.renderSavedState('setup', item, code, 'setup', {
      handler: 'setup',
      name: 'Setup',
      id: 'setup',
      language: 'markup',
      urls: urls
    });

    if( item ) this._storeSetup(data);
  }

  /**
   * Add setup data
   */
  add(edit) {
    let editor = this.getEditor('setup-' + (edit || 'add'));
    let item = this.getItem(this.cel);

    this._save({
      code: editor.getValue().trim(),
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

    if( isAdd ) {
      item.parentNode.removeChild(item);
      this.revealAddButton('setup');
      this.cache.urls = [];
    } else {
      this._save({
        code: this.cache.code,
        urls: this.cache.urls
      }, item);
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

    let urlItem = DOM.toDOM(this.setupUrlTempl.render({
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
   * Remove setup
   *
   * @public
   */
  removeSetup() {
    let item = this.getItem(this.cel);
    let id = item.getAttribute('data-uid');
    this.remove('setup', id);

    this._removeStoredSetup(id);
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
