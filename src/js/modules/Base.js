import Handler from '../utils/handler';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';
import Events from '../utils/Events';

const MIN_LINE = '\n\n\n\n';
const SAMPLE_ITEM_CLASS = 'sample-item';
const rstateclass = new RegExp('(' + SAMPLE_ITEM_CLASS + '--)' + '[\\w]+', 'g');
const EDITOR_CONFIG = {
  lineNumbers: true,
  tabSize: 2,
  styleActiveLine: true,
  autoCloseBrackets: true,
  viewportMargin: Infinity,
  lineWrapping: true
};

let _cache = new Map();
let _processes = DOM.$('processes');
let docElem = document.documentElement;
let _fixing;

if( _processes ) {
  const PROCESSES_TOP = _processes.offsetTop;
  let _scroll = function(e) {
    if( docElem.clientWidth < 640 ) return;

    if( window.pageYOffset > PROCESSES_TOP ) {
      if( _fixing ) return;
      _processes.style.cssText = 'top: 1.5em;width:' + _processes.clientWidth + 'px;';
      _processes.className += ' fixed';
      _fixing = true;
    } else if( _fixing ) {
      _processes.removeAttribute('style');
      DOM.removeClass(_processes, 'fixed');
      _fixing = null;
    }
  };

  Events.bind(window, 'scroll', _scroll);
}

let e = DOM.$('saved-templ');
let savedTempl = e && hogan.compile(e.innerHTML);

e = DOM.$('loader-templ');
let loaderTempl = e && hogan.compile(e.innerHTML);

class Base extends Handler {
  constructor(obj) {
    super(obj);
    this._templates = {};
  }

  setTemplate(names=[]) {
    utils.forEach(names, (name) => {
      let templ = DOM.$(name + '-templ');

      if( !templ ) return;

      this._templates[name] = hogan.compile(templ.innerHTML);
    });
  }

  template(name) {
    return this._templates[name];
  }

  /**
   * Remove sample id from cache
   *
   * @param {String} id
   *
   * @return {Boolean}
   */
  removeFromCache(id) {
    return _cache.delete(id);
  }

  clearAllCacheItems() {
    _cache.clear();
  }

  /**
   * Remove item from array when name is matched
   * @private
   *
   * @param  {String} name
   * @param  {Array} arr
   */
  removeFromArray(name, arr) {
    let type = typeof arr[0];
    let i = type.toLowerCase() !== 'object' ? arr.indexOf(name) : utils.indexOf(arr, 'name', name);

    if( ~i ) return arr.splice(i, 1);

    return i;
  }

  /**
   * Remove cache item
   *
   * @param {String} id
   *
   * @return {Object}
   */
  getCacheItem(id) {
    return _cache.get(id);
  }

  /**
   *  Create new cache item
   *
   * @param {String} id
   *
   * @return {Object}
   */
  setCacheItem(id, obj={}) {
    _cache.set(id, obj);

    return _cache.get(id);
  }

  storeCache(id, code) {
    let cache = this.getCacheItem(id);
    this.setCacheItem(id, utils.extend(cache || {}, { code: code }));

    return cache;
  }

  showForm(elem, name, editors, obj, type) {
    let item = DOM.closest(elem, '.' + SAMPLE_ITEM_CLASS);
    let id = item.getAttribute('data-uid');
    type = type || 'add';

    item.innerHTML = this.template(name + '-form').render(obj);
    this._setStateClass(item, type);

    utils.forEach(editors, (editor) => {
      this._initEditor(editor.name + '-' + obj.id, editor.config, id, editor);
    });
  }

  getStateClass(name) {
    return SAMPLE_ITEM_CLASS + '--' + name;
  }

  /**
   * Switch between state classes
   *
   * @private
   * @param {String} name
   *
   * @return {String}
   */
  _setStateClass(item, name) {
    let className = item.className;

    if( rstateclass.test(className) ) {
      className = item.className.replace(rstateclass, '$1' + name);
    } else {
      className += ' ' + SAMPLE_ITEM_CLASS + '--' + name;
    }

    return (item.className = className);
  }

  /**
   * Init editor and assign it to class's property by name
   *
   * @private
   * @param name
   *
   * @return {Object} editor
   */
  _initEditor(name, config, id, options) {
    config = utils.extend({}, EDITOR_CONFIG, config || {});

    let cache = _cache.get(id);
    let ta = DOM.$(name + '-ta');
    let code = cache ? cache.code : '';

    if( typeof code !== 'string' ) {
      code = code[options.lang] || '';
    }

    ta.value = code;

    let editor = this[name + '-editor'] = CodeMirror.fromTextArea(ta, config);
    editor.setValue(ta.value + MIN_LINE);

    return editor;
  }

  /**
   * Return correspond editor type
   * @public
   *
   * @param  {String} name
   * @param  {String} type
   * @return {Object}
   */
  getEditor(name) {
    return this[name + '-editor'];
  }

  /**
   * Render saved state
   * @private
   * @param {String} id
   */
  renderSavedState(name, item, code, id, data) {
    let editor = this[name + 'Editor'];
    this.storeCache(id);

    if( editor ) editor.toTextArea();
    item.innerHTML = savedTempl.render(data);
    item.setAttribute('data-uid', id);

    // render uneditable state's code editor
    utils.forEach(data.prism, (config) => {
      this.toStaticCode(config.pid, config.code, config.language);
    });

    this._setStateClass(item, 'saved');

    delete this[name + 'Editor'];
  }

  /**
   * Get sample item node
   *
   * @private
   * @param {Node} elem
   *
   * @return {Node}
   */
  getItem(elem) {
    return DOM.closest(elem, '.' + SAMPLE_ITEM_CLASS);
  }

  /**
   * Disable edit actions from editor
   *
   * @param {String} id
   * @param {String} value
   * @param {String} lang
   */
  toStaticCode(id, code, lang) {
    let elem = DOM.$('static-' + id);

    if( !code ) {
      let pre = elem.parentNode;
      pre.parentNode.removeChild(pre);
    } else elem.innerHTML = this._highlight(code, lang);
  }

  /**
   * Highlight static code
   *
   * @private
   * @param {String} code
   * @param {String} lang
   * @return {String}
   */
  _highlight(code, lang='javascript') {
    const language = Prism.languages[lang.toLowerCase()] || Prism.languages.javascript;

    return Prism.highlight(code, language);
  }

  /**
   * remove sample/setup
   *
   * @private
   * @param {String} name
   */
  remove(item, name, id) {
    item.parentNode.removeChild(item);

    DOM.removeClass(item, this.getStateClass('saved'));

    this.removeFromCache(id);
    this.revealAddButton(name);
  }

  /**
   * Show and animate add button
   *
   * @private
   * @param {Param} name
   */
  revealAddButton(name) {
    let add = DOM.$(name + '-add');

    DOM.removeClass(add, 'pulse');
    add.className += ' pulse';
    add.style.display = 'block';
  }

  /**
   * Create sample item
   *
   * @private
   * @param {Node} elem - element which is inserted before it
   *
   * @return {Node} item
   */
  createSampleItem(elem) {
    if( !elem ) return;

    let item = document.createElement('div');
    item.className += SAMPLE_ITEM_CLASS;

    elem.parentNode.insertBefore(item, elem);
    elem.style.display = 'none';

    return item;
  }

  copy() {
    let succeed = false;

    try {
  	  succeed = document.execCommand("copy");
    } catch(e) {}

    return succeed;
  }

  isSearchPage() {
    return location.href.indexOf('/search') !== -1;
  }

  loader(options) {
    return {
      el: DOM.toDOM(loaderTempl.render({
        size: options.size
      })),

      start() {
        options.target.appendChild(this.el);
      },

      end() {
        options.target.removeChild(this.el);
      }
    };
  }
}

export default Base;
