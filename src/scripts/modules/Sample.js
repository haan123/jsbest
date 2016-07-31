import Handler from '../utils/handler';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import CodeMirror from 'codemirror';
import Prism from 'prismjs';
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

class Sample extends Handler {
  constructor(process) {
    super({
      mid: 'sample',
      events: {
        'click': '_click'
      }
    });

    this.suite = process.suite;
    this.context = process.context;

    this.processList = DOM.$('process');
    this.process = process;

    this.rowTempl = hogan.compile(DOM.$('process-row-templ').innerHTML);
    this.sampleFormTempl = hogan.compile(DOM.$('sample-form-templ').innerHTML);
    this.savedTempl = hogan.compile(DOM.$('saved-templ').innerHTML);
    this.setupFormTempl = hogan.compile(DOM.$('setup-form-templ').innerHTML);
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

  openSetup(edit) {
    if( edit ) {}
    let elem = this.cel;
    let item = edit ? elem : document.createElement('div');

    if( !edit ) {
      item.className += 'sample-item';

      elem.parentNode.insertBefore(item, elem);
      elem.style.display = 'none';
    }

    let editor = this._showForm(item, 'setup', {
      mode: "xml",
      htmlMode: true
    });

    editor.focus();
  }

  _getStateClass(name) {
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

  _showForm(elem, name, config, obj) {
    let item = DOM.closest(elem, '.' + SAMPLE_ITEM_CLASS);
    let id = item.getAttribute('data-uid');

    item.innerHTML = this[name + 'FormTempl'].render(obj);
    this._setStateClass(item, 'add');

    return this._initEditor(name, config, id);
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

  setup() {
    let editor = this.setupEditor;
    let item = DOM.closest(this.cel, '.' + SAMPLE_ITEM_CLASS);
    let code = editor.getValue().trim();

    if( !code ) {
      editor.focus();
      return;
    }

    this.context.document.body.innerHTML = code;

    this._renderSavedState('setup', item, code, 'setup', {
      name: 'Setup',
      id: 'setup',
      language: 'markup'
    });
  }

  /**
   * Remove setup
   *
   * @public
   */
  removeSetup() {
    let id = DOM.closest(this.cel, '.' + SAMPLE_ITEM_CLASS);
    this._remove('setup', id);

    this.context.document.body.innerHTML = '';
  }

  /**
   * Edit setup code
   *
   * @public
   */
  editSetup() {
    this.openSetup.call(this, true);
  }


  /**
   *  cancel edit/add setup
   *
   * @public
   */
  cancelSetup() {

  }

  /**
   * Render saved state
   * @private
   * @param {String} id
   */
  _renderSavedState(name, item, value, id, data) {
    let editor = this[name + 'Editor'];

    _cache.set(id, {
      code: editor.getValue().trim()
    });

    editor.toTextArea();
    item.innerHTML = this.savedTempl.render(data);
    item.setAttribute('data-uid', id);

    // render uneditable state's code editor
    this._toStaticCode(id, value, data.language);

    this._setStateClass(item, 'saved');

    delete this[name + 'Editor'];
  }

  /**
   * Disable edit actions from editor

   * @private
   * @param {String} id
   * @param {String} value
   * @param {String} lang
   */
  _toStaticCode(id, value, lang) {
    let className = 'sample-item__static';

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
  _remove(name, id) {
    let item = DOM.closest(this.cel, '.' + SAMPLE_ITEM_CLASS);
    let cache = _cache.get(id);

    item.parentNode.removeChild(item);

    DOM.removeClass(item, this._getStateClass('saved'));

    _cache.delete(id);

    this._revealAddButton(name);
  }

  /**
   * Show and animate add button
   *
   * @private
   * @param {Param} name
   */
  _revealAddButton(name) {
    let add = DOM.$(name + '-add');

    DOM.removeClass(add, 'pulse');
    add.className += ' pulse';
    add.style.display = 'block';
  }

  /**
   * Edit sample
   *
   * @public
   */
  editSample() {

  }

  /**
   * Remove sample from process list
   *
   * @public
   */
  removeSample() {
    let item = DOM.closest(this.cel, '.' + SAMPLE_ITEM_CLASS);
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
  openSample() {
    let elem = this.cel;
    let item = document.createElement('div');
    item.className += 'sample-item';

    elem.parentNode.insertBefore(item, elem);
    elem.style.display = 'none';

    this._showForm(item, 'sample');
  }

  /**
   * Save sample
   *
   * @public
   */
  save() {
    const name = DOM.$('sample-name').value;
    const code = this.sampleEditor.getValue();

    if( !name|| !code || this._exist(name) ) return;
    let item = DOM.closest(this.cel, '.' + SAMPLE_ITEM_CLASS);

    this.suite.add(name, code);
    this._revealAddButton('sample');

    this._renderSavedState('sample', item, code, name, {
      name: 'Sample',
      id: name,
      language: 'javascript',
      sample: [{ id: name }]
    });

    this.renderRow({
      id: name,
      name: name
    });
  }

  run() {
    this.suite.run({
      'async': true,
      'queued': true
    });
  }

  renderRow(obj) {
    let row = DOM.toDOM(this.rowTempl.render(obj));

    this.processList.appendChild(row);
  }
}

export default Sample;
