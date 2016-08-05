import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

class Setup extends Base {
  constructor(process) {
    super({
      mid: 'setup',
      events: {
        'click': '_click'
      }
    });

    this.processList = DOM.$('process');
    this.process = process;
    this.context = process.context;

    this.setupFormTempl = hogan.compile(DOM.$('setup-form-templ').innerHTML);
    this.setupUrlTempl = hogan.compile(DOM.$('setup-url-templ').innerHTML);
    this._id = 'setup';
    this.cache = this.setCacheItem(this._id);
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
      urls: this.cache.urls
    }, edit);

    editor.focus();
  }

  /**
   * Save and render setup data
   * @param  {Object} data
   */
  _save(data, item) {
    let code = data.code;
    let urls = data.urls;

    if( !item ) {
      item = this.createSampleItem(DOM.$('setup-add'));
      utils.forEach(urls, (url) => this._cachedUrl(url));
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
  }

  setup() {
    let editor = this.setupEditor;

    let item = this.getItem(this.cel);
    let code = editor.getValue().trim();
    let urls = this.cache.urls;

    if( !code ) {
      editor.focus();
      return;
    }

    this._save({
      code: code,
      urls: urls
    }, item);
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

    let id = this._cachedUrl(url);

    if( !id ) return;

    let urlItem = DOM.toDOM(this.setupUrlTempl.render({
      id: id - 1,
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

    return cache.urls.push(url);
  }

  /**
   * remove url handler
   *
   * @public
   */
  removeUrl() {
    let id = this.cel.getAttribute('data-url-id');
    let setup = this.cel.parentNode;
    let cache = this.getCacheItem(this._id);

    cache.urls.splice(id, 1);
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

    this.context.document.body.innerHTML = '';
  }

  /**
   * Edit setup code
   *
   * @public
   */
  editSetup() {
    this.openSetup.call(this, 'edit');
  }


  /**
   *  cancel edit/add setup
   *
   * @public
   */
  cancelSetup() {
    let elem = this.cel;
    let item = this.getItem(elem);
    let isAdd = ~item.className.indexOf(this.getStateClass('add'));

    if( isAdd ) {
      item.parentNode.removeChild(item);
      this.revealAddButton('setup');
    } else {
      this._save({
        code: this.cache.code,
        urls: this.cache.urls
      }, item);
    }
  }
}

export default Setup;
