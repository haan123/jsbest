import Handler from '../utils/handler';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

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

class Base extends Handler {
  constructor(obj) {
    super(obj);

    utils.Event.on(window, 'scroll', this._scroll.bind(this));

    this.savedTempl = hogan.compile(DOM.$('saved-templ').innerHTML);
    this.topBarHeight = DOM.$('top-bar').offsetHeight;
    this.processes = DOM.$('processes');
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

  /**
   * Event handler for scroll
   */
  _scroll(e) {
    let top = window.pageYOffset;
    let processes = this.processes;

    if( document.documentElement.clientWidth < 640 ) return;

    if( top > this.topBarHeight ) {
      if( this.fixing ) return;
      processes.style.top = '1.5em';
      processes.style.width = processes.clientWidth + 'px';
      processes.className += ' fixed';

      this.fixing = true;
    } else if( this.fixing ) {
      processes.removeAttribute('style');
      DOM.removeClass(processes, 'fixed');
      delete this.fixing;
    }
  }

  showForm(elem, name, config, obj, type) {
    let item = DOM.closest(elem, '.' + SAMPLE_ITEM_CLASS);
    let id = item.getAttribute('data-uid');

    item.innerHTML = this[name + 'FormTempl'].render(obj);
    this._setStateClass(item, type || 'add');

    return this._initEditor(name, config, id);
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
  _initEditor(name, config, id) {
    config = utils.extend({}, EDITOR_CONFIG, config || {});

    let cache = _cache.get(id);
    let ta = DOM.$(name + '-ta');
    ta.value = cache ? cache.code : '';

    let editor = this[name + 'Editor'] = CodeMirror.fromTextArea(ta, config);
    editor.setValue(ta.value + MIN_LINE);

    return editor;
  }

  /**
   * Render saved state
   * @private
   * @param {String} id
   */
  renderSavedState(name, item, value, id, data) {
    let editor = this[name + 'Editor'];
    let cache = this.getCacheItem(id);
    this.setCacheItem(id, utils.extend(cache || {}, { code: value }));

    editor && editor.toTextArea();
    item.innerHTML = this.savedTempl.render(data);
    item.setAttribute('data-uid', id);

    // render uneditable state's code editor
    this._toStaticCode(id, value, data.language);

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

   * @private
   * @param {String} id
   * @param {String} value
   * @param {String} lang
   */
  _toStaticCode(id, value, lang) {
    DOM.$('static-' + id).innerHTML = this._highlight(value, lang);
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
    const language = Prism.languages[lang];

    return Prism.highlight(code, language);
  }

  /**
   * remove sample/setup
   *
   * @private
   * @param {String} name
   */
  remove(name, id) {
    let item = this.getItem(this.cel);

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
    let item = document.createElement('div');
    item.className += 'sample-item';

    elem.parentNode.insertBefore(item, elem);
    elem.style.display = 'none';

    return item;
  }
}

export default Base;
