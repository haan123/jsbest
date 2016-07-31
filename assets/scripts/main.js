webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Sample = __webpack_require__(1);
	
	var _Sample2 = _interopRequireDefault(_Sample);
	
	var _Process = __webpack_require__(54);
	
	var _Process2 = _interopRequireDefault(_Process);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var _process = new _Process2.default();
	var _case = new _Sample2.default(_process);

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _classCallCheck2 = __webpack_require__(2);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(3);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _possibleConstructorReturn2 = __webpack_require__(7);
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = __webpack_require__(39);
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _handler = __webpack_require__(46);
	
	var _handler2 = _interopRequireDefault(_handler);
	
	var _utils = __webpack_require__(47);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _dom = __webpack_require__(48);
	
	var _dom2 = _interopRequireDefault(_dom);
	
	var _codemirror = __webpack_require__(49);
	
	var _codemirror2 = _interopRequireDefault(_codemirror);
	
	var _prismjs = __webpack_require__(50);
	
	var _prismjs2 = _interopRequireDefault(_prismjs);
	
	var _hogan = __webpack_require__(51);
	
	var _hogan2 = _interopRequireDefault(_hogan);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var MIN_LINE = '\n\n\n\n';
	var SAMPLE_ITEM_CLASS = 'sample-item';
	var rstateclass = new RegExp('(' + SAMPLE_ITEM_CLASS + '--)' + '[\\w]+', 'g');
	var EDITOR_CONFIG = {
	  lineNumbers: true,
	  tabSize: 2,
	  styleActiveLine: true,
	  autoCloseBrackets: true,
	  viewportMargin: Infinity,
	  lineWrapping: true
	};
	
	var _cache = new Map();
	
	var Sample = function (_Handler) {
	  (0, _inherits3.default)(Sample, _Handler);
	
	  function Sample(process) {
	    (0, _classCallCheck3.default)(this, Sample);
	
	    var _this = (0, _possibleConstructorReturn3.default)(this, Object.getPrototypeOf(Sample).call(this, {
	      mid: 'sample',
	      events: {
	        'click': '_click'
	      }
	    }));
	
	    _this.suite = process.suite;
	    _this.context = process.context;
	
	    _this.processList = _dom2.default.$('process');
	    _this.process = process;
	
	    _this.rowTempl = _hogan2.default.compile(_dom2.default.$('process-row-templ').innerHTML);
	    _this.sampleFormTempl = _hogan2.default.compile(_dom2.default.$('sample-form-templ').innerHTML);
	    _this.savedTempl = _hogan2.default.compile(_dom2.default.$('saved-templ').innerHTML);
	    _this.setupFormTempl = _hogan2.default.compile(_dom2.default.$('setup-form-templ').innerHTML);
	    return _this;
	  }
	
	  /**
	   * Handle click for sample handler
	   *
	   * @private
	   */
	
	
	  (0, _createClass3.default)(Sample, [{
	    key: '_click',
	    value: function _click(e) {
	      var type = this.cel.getAttribute('data-type');
	
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
	
	  }, {
	    key: '_exist',
	    value: function _exist(name) {
	      var benches = this.suite.benchmarks;
	
	      if (!benches.length) return;
	
	      var i = benches.length - 1;
	
	      do {
	        if (benches[i].name === name) return true;
	      } while (i--);
	
	      return false;
	    }
	  }, {
	    key: 'openSetup',
	    value: function openSetup(edit) {
	      if (edit) {}
	      var elem = this.cel;
	      var item = edit ? elem : document.createElement('div');
	
	      if (!edit) {
	        item.className += 'sample-item';
	
	        elem.parentNode.insertBefore(item, elem);
	        elem.style.display = 'none';
	      }
	
	      var editor = this._showForm(item, 'setup', {
	        mode: "xml",
	        htmlMode: true
	      });
	
	      editor.focus();
	    }
	  }, {
	    key: '_getStateClass',
	    value: function _getStateClass(name) {
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
	
	  }, {
	    key: '_setStateClass',
	    value: function _setStateClass(item, name) {
	      var className = item.className;
	
	      if (rstateclass.test(className)) {
	        className = item.className.replace(rstateclass, '$1' + name);
	      } else {
	        className += ' ' + SAMPLE_ITEM_CLASS + '--' + name;
	      }
	
	      return item.className = className;
	    }
	  }, {
	    key: '_showForm',
	    value: function _showForm(elem, name, config, obj) {
	      var item = _dom2.default.closest(elem, '.' + SAMPLE_ITEM_CLASS);
	      var id = item.getAttribute('data-uid');
	
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
	
	  }, {
	    key: '_initEditor',
	    value: function _initEditor(name, config, id) {
	      config = _utils2.default.extend({}, EDITOR_CONFIG, config || {});
	
	      var cache = _cache.get(id);
	      var ta = _dom2.default.$(name + '-ta');
	      ta.value = cache ? cache.code : '';
	
	      var editor = this[name + 'Editor'] = _codemirror2.default.fromTextArea(ta, config);
	      editor.setValue(ta.value + MIN_LINE);
	
	      return editor;
	    }
	  }, {
	    key: 'setup',
	    value: function setup() {
	      var editor = this.setupEditor;
	      var item = _dom2.default.closest(this.cel, '.' + SAMPLE_ITEM_CLASS);
	      var code = editor.getValue().trim();
	
	      if (!code) {
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
	
	  }, {
	    key: 'removeSetup',
	    value: function removeSetup() {
	      var id = _dom2.default.closest(this.cel, '.' + SAMPLE_ITEM_CLASS);
	      this._remove('setup', id);
	
	      this.context.document.body.innerHTML = '';
	    }
	
	    /**
	     * Edit setup code
	     *
	     * @public
	     */
	
	  }, {
	    key: 'editSetup',
	    value: function editSetup() {
	      this.openSetup.call(this, true);
	    }
	
	    /**
	     *  cancel edit/add setup
	     *
	     * @public
	     */
	
	  }, {
	    key: 'cancelSetup',
	    value: function cancelSetup() {}
	
	    /**
	     * Render saved state
	     * @private
	     * @param {String} id
	     */
	
	  }, {
	    key: '_renderSavedState',
	    value: function _renderSavedState(name, item, value, id, data) {
	      var editor = this[name + 'Editor'];
	
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
	
	  }, {
	    key: '_toStaticCode',
	    value: function _toStaticCode(id, value, lang) {
	      var className = 'sample-item__static';
	
	      _dom2.default.$('static-' + id).innerHTML = this._highlight(value, lang);
	    }
	
	    /**
	     * Highlight static code
	     *
	     * @private
	     * @param {String} code
	     * @param {String} lang
	     * @return {String}
	     */
	
	  }, {
	    key: '_highlight',
	    value: function _highlight(code) {
	      var lang = arguments.length <= 1 || arguments[1] === undefined ? 'javascript' : arguments[1];
	
	      var language = _prismjs2.default.languages[lang];
	
	      return _prismjs2.default.highlight(code, language);
	    }
	
	    /**
	     * remove sample/setup
	     *
	     * @private
	     * @param {String} name
	     */
	
	  }, {
	    key: '_remove',
	    value: function _remove(name, id) {
	      var item = _dom2.default.closest(this.cel, '.' + SAMPLE_ITEM_CLASS);
	      var cache = _cache.get(id);
	
	      item.parentNode.removeChild(item);
	
	      _dom2.default.removeClass(item, this._getStateClass('saved'));
	
	      _cache.delete(id);
	
	      this._revealAddButton(name);
	    }
	
	    /**
	     * Show and animate add button
	     *
	     * @private
	     * @param {Param} name
	     */
	
	  }, {
	    key: '_revealAddButton',
	    value: function _revealAddButton(name) {
	      var add = _dom2.default.$(name + '-add');
	
	      _dom2.default.removeClass(add, 'pulse');
	      add.className += ' pulse';
	      add.style.display = 'block';
	    }
	
	    /**
	     * Edit sample
	     *
	     * @public
	     */
	
	  }, {
	    key: 'editSample',
	    value: function editSample() {}
	
	    /**
	     * Remove sample from process list
	     *
	     * @public
	     */
	
	  }, {
	    key: 'removeSample',
	    value: function removeSample() {
	      var item = _dom2.default.closest(this.cel, '.' + SAMPLE_ITEM_CLASS);
	      var id = item.getAttribute('data-uid');
	      var row = _dom2.default.$('sample-' + id);
	
	      row.parentNode.removeChild(row);
	      this._remove('sample', id);
	
	      this.process.removeBench(id);
	    }
	
	    /**
	     * Show sample form
	     *
	     * @public
	     */
	
	  }, {
	    key: 'openSample',
	    value: function openSample() {
	      var elem = this.cel;
	      var item = document.createElement('div');
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
	
	  }, {
	    key: 'save',
	    value: function save() {
	      var name = _dom2.default.$('sample-name').value;
	      var code = this.sampleEditor.getValue();
	
	      if (!name || !code || this._exist(name)) return;
	      var item = _dom2.default.closest(this.cel, '.' + SAMPLE_ITEM_CLASS);
	
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
	  }, {
	    key: 'run',
	    value: function run() {
	      this.suite.run({
	        'async': true,
	        'queued': true
	      });
	    }
	  }, {
	    key: 'renderRow',
	    value: function renderRow(obj) {
	      var row = _dom2.default.toDOM(this.rowTempl.render(obj));
	
	      this.processList.appendChild(row);
	    }
	  }]);
	  return Sample;
	}(_handler2.default);
	
	exports.default = Sample;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	
	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _defineProperty = __webpack_require__(4);
	
	var _defineProperty2 = _interopRequireDefault(_defineProperty);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
	    }
	  }
	
	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(5), __esModule: true };

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(6);
	module.exports = function defineProperty(it, key, desc){
	  return $.setDesc(it, key, desc);
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	var $Object = Object;
	module.exports = {
	  create:     $Object.create,
	  getProto:   $Object.getPrototypeOf,
	  isEnum:     {}.propertyIsEnumerable,
	  getDesc:    $Object.getOwnPropertyDescriptor,
	  setDesc:    $Object.defineProperty,
	  setDescs:   $Object.defineProperties,
	  getKeys:    $Object.keys,
	  getNames:   $Object.getOwnPropertyNames,
	  getSymbols: $Object.getOwnPropertySymbols,
	  each:       [].forEach
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	exports.__esModule = true;
	
	var _typeof2 = __webpack_require__(8);
	
	var _typeof3 = _interopRequireDefault(_typeof2);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }
	
	  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Symbol = __webpack_require__(9)["default"];
	
	exports["default"] = function (obj) {
	  return obj && obj.constructor === _Symbol ? "symbol" : typeof obj;
	};
	
	exports.__esModule = true;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(10), __esModule: true };

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(11);
	__webpack_require__(38);
	module.exports = __webpack_require__(17).Symbol;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var $              = __webpack_require__(6)
	  , global         = __webpack_require__(12)
	  , has            = __webpack_require__(13)
	  , DESCRIPTORS    = __webpack_require__(14)
	  , $export        = __webpack_require__(16)
	  , redefine       = __webpack_require__(20)
	  , $fails         = __webpack_require__(15)
	  , shared         = __webpack_require__(23)
	  , setToStringTag = __webpack_require__(24)
	  , uid            = __webpack_require__(26)
	  , wks            = __webpack_require__(25)
	  , keyOf          = __webpack_require__(27)
	  , $names         = __webpack_require__(32)
	  , enumKeys       = __webpack_require__(33)
	  , isArray        = __webpack_require__(34)
	  , anObject       = __webpack_require__(35)
	  , toIObject      = __webpack_require__(28)
	  , createDesc     = __webpack_require__(22)
	  , getDesc        = $.getDesc
	  , setDesc        = $.setDesc
	  , _create        = $.create
	  , getNames       = $names.get
	  , $Symbol        = global.Symbol
	  , $JSON          = global.JSON
	  , _stringify     = $JSON && $JSON.stringify
	  , setter         = false
	  , HIDDEN         = wks('_hidden')
	  , isEnum         = $.isEnum
	  , SymbolRegistry = shared('symbol-registry')
	  , AllSymbols     = shared('symbols')
	  , useNative      = typeof $Symbol == 'function'
	  , ObjectProto    = Object.prototype;
	
	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function(){
	  return _create(setDesc({}, 'a', {
	    get: function(){ return setDesc(this, 'a', {value: 7}).a; }
	  })).a != 7;
	}) ? function(it, key, D){
	  var protoDesc = getDesc(ObjectProto, key);
	  if(protoDesc)delete ObjectProto[key];
	  setDesc(it, key, D);
	  if(protoDesc && it !== ObjectProto)setDesc(ObjectProto, key, protoDesc);
	} : setDesc;
	
	var wrap = function(tag){
	  var sym = AllSymbols[tag] = _create($Symbol.prototype);
	  sym._k = tag;
	  DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
	    configurable: true,
	    set: function(value){
	      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    }
	  });
	  return sym;
	};
	
	var isSymbol = function(it){
	  return typeof it == 'symbol';
	};
	
	var $defineProperty = function defineProperty(it, key, D){
	  if(D && has(AllSymbols, key)){
	    if(!D.enumerable){
	      if(!has(it, HIDDEN))setDesc(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
	      D = _create(D, {enumerable: createDesc(0, false)});
	    } return setSymbolDesc(it, key, D);
	  } return setDesc(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P){
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P))
	    , i    = 0
	    , l = keys.length
	    , key;
	  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P){
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key){
	  var E = isEnum.call(this, key);
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key]
	    ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
	  var D = getDesc(it = toIObject(it), key);
	  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN)result.push(key);
	  return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
	  var names  = getNames(toIObject(it))
	    , result = []
	    , i      = 0
	    , key;
	  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
	  return result;
	};
	var $stringify = function stringify(it){
	  if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
	  var args = [it]
	    , i    = 1
	    , $$   = arguments
	    , replacer, $replacer;
	  while($$.length > i)args.push($$[i++]);
	  replacer = args[1];
	  if(typeof replacer == 'function')$replacer = replacer;
	  if($replacer || !isArray(replacer))replacer = function(key, value){
	    if($replacer)value = $replacer.call(this, key, value);
	    if(!isSymbol(value))return value;
	  };
	  args[1] = replacer;
	  return _stringify.apply($JSON, args);
	};
	var buggyJSON = $fails(function(){
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
	});
	
	// 19.4.1.1 Symbol([description])
	if(!useNative){
	  $Symbol = function Symbol(){
	    if(isSymbol(this))throw TypeError('Symbol is not a constructor');
	    return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
	  };
	  redefine($Symbol.prototype, 'toString', function toString(){
	    return this._k;
	  });
	
	  isSymbol = function(it){
	    return it instanceof $Symbol;
	  };
	
	  $.create     = $create;
	  $.isEnum     = $propertyIsEnumerable;
	  $.getDesc    = $getOwnPropertyDescriptor;
	  $.setDesc    = $defineProperty;
	  $.setDescs   = $defineProperties;
	  $.getNames   = $names.get = $getOwnPropertyNames;
	  $.getSymbols = $getOwnPropertySymbols;
	
	  if(DESCRIPTORS && !__webpack_require__(37)){
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }
	}
	
	var symbolStatics = {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function(key){
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(key){
	    return keyOf(SymbolRegistry, key);
	  },
	  useSetter: function(){ setter = true; },
	  useSimple: function(){ setter = false; }
	};
	// 19.4.2.2 Symbol.hasInstance
	// 19.4.2.3 Symbol.isConcatSpreadable
	// 19.4.2.4 Symbol.iterator
	// 19.4.2.6 Symbol.match
	// 19.4.2.8 Symbol.replace
	// 19.4.2.9 Symbol.search
	// 19.4.2.10 Symbol.species
	// 19.4.2.11 Symbol.split
	// 19.4.2.12 Symbol.toPrimitive
	// 19.4.2.13 Symbol.toStringTag
	// 19.4.2.14 Symbol.unscopables
	$.each.call((
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
	  'species,split,toPrimitive,toStringTag,unscopables'
	).split(','), function(it){
	  var sym = wks(it);
	  symbolStatics[it] = useNative ? sym : wrap(sym);
	});
	
	setter = true;
	
	$export($export.G + $export.W, {Symbol: $Symbol});
	
	$export($export.S, 'Symbol', symbolStatics);
	
	$export($export.S + $export.F * !useNative, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});
	
	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!useNative || buggyJSON), 'JSON', {stringify: $stringify});
	
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);

/***/ },
/* 12 */
/***/ function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
	if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef

/***/ },
/* 13 */
/***/ function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function(it, key){
	  return hasOwnProperty.call(it, key);
	};

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(15)(function(){
	  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
	});

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = function(exec){
	  try {
	    return !!exec();
	  } catch(e){
	    return true;
	  }
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var global    = __webpack_require__(12)
	  , core      = __webpack_require__(17)
	  , ctx       = __webpack_require__(18)
	  , PROTOTYPE = 'prototype';
	
	var $export = function(type, name, source){
	  var IS_FORCED = type & $export.F
	    , IS_GLOBAL = type & $export.G
	    , IS_STATIC = type & $export.S
	    , IS_PROTO  = type & $export.P
	    , IS_BIND   = type & $export.B
	    , IS_WRAP   = type & $export.W
	    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
	    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
	    , key, own, out;
	  if(IS_GLOBAL)source = name;
	  for(key in source){
	    // contains in native
	    own = !IS_FORCED && target && key in target;
	    if(own && key in exports)continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function(C){
	      var F = function(param){
	        return this instanceof C ? new C(param) : C(param);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    if(IS_PROTO)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
	  }
	};
	// type bitmap
	$export.F = 1;  // forced
	$export.G = 2;  // global
	$export.S = 4;  // static
	$export.P = 8;  // proto
	$export.B = 16; // bind
	$export.W = 32; // wrap
	module.exports = $export;

/***/ },
/* 17 */
/***/ function(module, exports) {

	var core = module.exports = {version: '1.2.6'};
	if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(19);
	module.exports = function(fn, that, length){
	  aFunction(fn);
	  if(that === undefined)return fn;
	  switch(length){
	    case 1: return function(a){
	      return fn.call(that, a);
	    };
	    case 2: return function(a, b){
	      return fn.call(that, a, b);
	    };
	    case 3: return function(a, b, c){
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function(/* ...args */){
	    return fn.apply(that, arguments);
	  };
	};

/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = function(it){
	  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
	  return it;
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(21);

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var $          = __webpack_require__(6)
	  , createDesc = __webpack_require__(22);
	module.exports = __webpack_require__(14) ? function(object, key, value){
	  return $.setDesc(object, key, createDesc(1, value));
	} : function(object, key, value){
	  object[key] = value;
	  return object;
	};

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function(bitmap, value){
	  return {
	    enumerable  : !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable    : !(bitmap & 4),
	    value       : value
	  };
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var global = __webpack_require__(12)
	  , SHARED = '__core-js_shared__'
	  , store  = global[SHARED] || (global[SHARED] = {});
	module.exports = function(key){
	  return store[key] || (store[key] = {});
	};

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var def = __webpack_require__(6).setDesc
	  , has = __webpack_require__(13)
	  , TAG = __webpack_require__(25)('toStringTag');
	
	module.exports = function(it, tag, stat){
	  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var store  = __webpack_require__(23)('wks')
	  , uid    = __webpack_require__(26)
	  , Symbol = __webpack_require__(12).Symbol;
	module.exports = function(name){
	  return store[name] || (store[name] =
	    Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	var id = 0
	  , px = Math.random();
	module.exports = function(key){
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var $         = __webpack_require__(6)
	  , toIObject = __webpack_require__(28);
	module.exports = function(object, el){
	  var O      = toIObject(object)
	    , keys   = $.getKeys(O)
	    , length = keys.length
	    , index  = 0
	    , key;
	  while(length > index)if(O[key = keys[index++]] === el)return key;
	};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(29)
	  , defined = __webpack_require__(31);
	module.exports = function(it){
	  return IObject(defined(it));
	};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(30);
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};

/***/ },
/* 30 */
/***/ function(module, exports) {

	var toString = {}.toString;
	
	module.exports = function(it){
	  return toString.call(it).slice(8, -1);
	};

/***/ },
/* 31 */
/***/ function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function(it){
	  if(it == undefined)throw TypeError("Can't call method on  " + it);
	  return it;
	};

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(28)
	  , getNames  = __webpack_require__(6).getNames
	  , toString  = {}.toString;
	
	var windowNames = typeof window == 'object' && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];
	
	var getWindowNames = function(it){
	  try {
	    return getNames(it);
	  } catch(e){
	    return windowNames.slice();
	  }
	};
	
	module.exports.get = function getOwnPropertyNames(it){
	  if(windowNames && toString.call(it) == '[object Window]')return getWindowNames(it);
	  return getNames(toIObject(it));
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var $ = __webpack_require__(6);
	module.exports = function(it){
	  var keys       = $.getKeys(it)
	    , getSymbols = $.getSymbols;
	  if(getSymbols){
	    var symbols = getSymbols(it)
	      , isEnum  = $.isEnum
	      , i       = 0
	      , key;
	    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))keys.push(key);
	  }
	  return keys;
	};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(30);
	module.exports = Array.isArray || function(arg){
	  return cof(arg) == 'Array';
	};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(36);
	module.exports = function(it){
	  if(!isObject(it))throw TypeError(it + ' is not an object!');
	  return it;
	};

/***/ },
/* 36 */
/***/ function(module, exports) {

	module.exports = function(it){
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

/***/ },
/* 37 */
/***/ function(module, exports) {

	module.exports = true;

/***/ },
/* 38 */
/***/ function(module, exports) {



/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _Object$create = __webpack_require__(40)["default"];
	
	var _Object$setPrototypeOf = __webpack_require__(42)["default"];
	
	exports["default"] = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
	  }
	
	  subClass.prototype = _Object$create(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
	};
	
	exports.__esModule = true;

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(41), __esModule: true };

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var $ = __webpack_require__(6);
	module.exports = function create(P, D){
	  return $.create(P, D);
	};

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(43), __esModule: true };

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(44);
	module.exports = __webpack_require__(17).Object.setPrototypeOf;

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	// 19.1.3.19 Object.setPrototypeOf(O, proto)
	var $export = __webpack_require__(16);
	$export($export.S, 'Object', {setPrototypeOf: __webpack_require__(45).set});

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var getDesc  = __webpack_require__(6).getDesc
	  , isObject = __webpack_require__(36)
	  , anObject = __webpack_require__(35);
	var check = function(O, proto){
	  anObject(O);
	  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
	};
	module.exports = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function(test, buggy, set){
	      try {
	        set = __webpack_require__(18)(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch(e){ buggy = true; }
	      return function setPrototypeOf(O, proto){
	        check(O, proto);
	        if(buggy)O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _classCallCheck2 = __webpack_require__(2);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(3);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _utils = __webpack_require__(47);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _dom = __webpack_require__(48);
	
	var _dom2 = _interopRequireDefault(_dom);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// matches all handlers in element
	/**
	 * Base class for sub classes register all event handlers
	 * Supported Events:
	 * - click
	 * - mouserover
	 *
	 */
	var rjs = /js-([\w]+)/g;
	// store all handler ids
	var _hids = new WeakMap();
	
	var supportedEvents = [{
	  name: 'click',
	  fn: function fn(e, mod) {
	    var events = mod.events;
	
	    for (var type in events) {
	      var fn = mod[events[type]];
	
	      if (typeof fn === 'function') {
	        // set current element
	        mod.cel = this;
	        fn.call(mod, e);
	      }
	    }
	  }
	}, {
	  name: 'mouseover',
	  fn: function fn() {}
	}];
	
	// store all supported handler
	var handlers = {};
	
	function handler(e) {
	  var type = e.type;
	  var that = e.target;
	
	  _dom2.default.parents(that, function (parent) {
	    var className = parent.className;
	    var m = void 0,
	        mod = void 0;
	
	    while ((m = rjs.exec(className)) && (mod = modules.get(m[1]))) {
	      handlers[type].call(parent, e, mod);
	    }
	  });
	}
	
	// Use Map to store all module registered for performance
	// See - https://jsperf.com/es6-map-vs-object-properties/2
	var modules = new Map();
	
	var Handler = function () {
	  function Handler(settings) {
	    (0, _classCallCheck3.default)(this, Handler);
	
	    var mid = settings.mid;
	
	    if (modules.get(mid)) return this;
	    modules.set(mid, this);
	
	    this.mid = mid;
	    this.events = settings.events;
	  }
	
	  (0, _createClass3.default)(Handler, null, [{
	    key: 'setup',
	    value: function setup(context) {
	      // _hids.set(this, settings.hid);
	      _utils2.default.forEach(supportedEvents, function (obj) {
	        _utils2.default.Event.on(context || document, obj.name, handler);
	        handlers[obj.name] = obj.fn;
	      });
	    }
	  }]);
	  return Handler;
	}();
	
	Handler.setup();
	
	exports.default = Handler;

/***/ },
/* 47 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var utils = {};
	
	utils.extend = function (obj) {
	  var length = arguments.length,
	      src = void 0,
	      keys = void 0,
	      key = void 0;
	
	  if (length < 2) return obj;
	
	  for (var i = 1; i < length; i++) {
	    src = arguments[i];
	
	    if (src) {
	      keys = Object.keys(src);
	
	      for (var j = 0, len = keys.length; j < len; j++) {
	        key = keys[j];
	        obj[key] = src[key];
	      }
	    }
	  }
	
	  return obj;
	};
	
	/**
	 * Check function type
	 * @param {?} obj
	 * @return {Boolean}
	 */
	utils.isFunction = function (obj) {
	  return typeof obj == 'function' || false;
	};
	
	utils.forEach = function (obj, iteratee, context) {
	  var keys = Object.keys(obj);
	
	  for (var i = 0, length = keys.length; i < length; i++) {
	    iteratee.call(context, obj[keys[i]], keys[i], obj);
	  }
	};
	
	var escapeMap = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '"': '&quot;',
	  "'": '&#x27;',
	  '`': '&#x60;'
	};
	
	// Functions for escaping and unescaping strings to/from HTML interpolation.
	var createEscaper = function createEscaper(map) {
	  var escaper = function escaper(match) {
	    return map[match];
	  };
	  // Regexes for identifying a key that needs to be escaped
	  var source = '(?:' + Object.keys(map).join('|') + ')';
	  var testRegexp = RegExp(source);
	  var replaceRegexp = RegExp(source, 'g');
	  return function (string) {
	    string = string === null ? '' : '' + string;
	    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	  };
	};
	
	utils.escape = createEscaper(escapeMap);
	
	utils.Event = {
	  on: function on(el, name, callback) {
	    el.addEventListener(name, callback, false);
	  },
	  off: function off(el, name, callback) {
	    el.removeEventListener(name, callback, false);
	  }
	};
	
	exports.default = utils;

/***/ },
/* 48 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var DOM = {};
	
	/**
	 * Convert string html to DOM Element
	 * @param {String} str
	 * @return {Node}
	 */
	DOM.toDOM = function (div, tbody) {
	  return function (str) {
	    var el = div;
	    if (str.indexOf('tr')) el = tbody;
	
	    el.innerHTML = str.replace(/(^\s+|\s+$)/g, '');
	    return el.removeChild(el.firstChild);
	  };
	}(document.createElement('div'), document.createElement('tbody'));
	
	/**
	 * Get closest node that match selector
	 * @param {Node} el
	 * @param {String|Node} selector
	 * @return {Node}
	 */
	DOM.closest = function (el, selector) {
	  var cur = el,
	      matched = void 0;
	  var docElem = cur.ownerDocument.documentElement;
	
	  for (; cur && cur.nodeType === 1; cur = cur.parentNode) {
	    // using native matches, this function return true or false
	    // when selector matched
	    // supporting IE9+
	    if (docElem.matches.call(cur, selector)) {
	      matched = cur;
	      break;
	    }
	  }
	
	  return matched;
	};
	
	/**
	 * Loop through parent nodes of current el and call `callback` function
	 * @param {Node} el
	 * @param {Function} callback
	 * @return {Node} cur
	 */
	DOM.parents = function (el, callback) {
	  var cur = el;
	
	  do {
	    if (callback.call(el, cur)) break;
	    cur = cur.parentNode;
	  } while (cur && cur.nodeType === 1);
	
	  return cur;
	};
	
	/**
	 * Get element by id
	 * @param {String} id
	 * @return {Node}
	 */
	DOM.$ = function (id) {
	  return typeof id === 'string' ? document.getElementById(id) : id;
	};
	
	/**
	 * Remove element's class
	 * @param {Node} elem
	 * @return {String} newClass
	 */
	DOM.removeClass = function (elem, value) {
	  var curValue = elem.className.trim();
	  var rclass = new RegExp(' ' + value + ' ', 'g');
	  var current = (' ' + curValue + ' ').replace(rclass, ' ');
	
	  return elem.className = current.trim();
	};
	
	exports.default = DOM;

/***/ },
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _classCallCheck2 = __webpack_require__(2);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(3);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _utils = __webpack_require__(47);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _dom = __webpack_require__(48);
	
	var _dom2 = _interopRequireDefault(_dom);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Process = function () {
	  function Process() {
	    (0, _classCallCheck3.default)(this, Process);
	
	    this.context = _dom2.default.$('iframe').contentWindow;
	    this.context.document.head.appendChild(_dom2.default.toDOM('<script></script>'));
	    Benchmark = Benchmark.runInContext(this.context);
	    this.context.Benchmark = Benchmark;
	
	    this.initialize();
	  }
	
	  (0, _createClass3.default)(Process, [{
	    key: 'initialize',
	    value: function initialize() {
	      var _this = this;
	
	      var suite = this.suite = new Benchmark.Suite();
	      suite.benchmarks = [];
	
	      suite.on('add', function (event) {
	        var bench = event.target,
	            index = suite.benchmarks.length,
	            id = index + 1;
	
	        suite.benchmarks.push(bench);
	
	        bench.on('start', _this._start.bind(_this));
	        bench.on('start cycle', _this._cycle.bind(_this));
	      }).on('start cycle', function (event) {
	        console.log(event);
	      }).on('complete', function () {
	        var benches = Benchmark.filter(suite.benchmarks, 'successful'),
	            fastest = Benchmark.filter(benches, 'fastest')[0],
	            slowest = Benchmark.filter(benches, 'slowest')[0];
	
	        // highlight result cells
	        _utils2.default.forEach(benches, function (bench) {
	          var fastestHz = _this._hz(fastest),
	              hz = _this._hz(bench),
	              percent = (1 - hz / fastestHz) * 100,
	              text = 'fastest';
	
	          if (fastest.id === bench.id) {
	
	            // mark fastest
	          } else {
	            text = isFinite(hz) ? Benchmark.formatNumber(percent < 1 ? percent.toFixed(2) : Math.round(percent)) + '% slower' : '';
	
	            // mark slowest
	            if (slowest.id === bench.id) {}
	          }
	        });
	      });
	    }
	
	    /**
	     * Remove bench
	     *
	     * @public
	     * @param {String} name
	     */
	
	  }, {
	    key: 'removeBench',
	    value: function removeBench(name) {
	      var suite = this.suite;
	
	      for (var i = 0, len = suite.length; i < len; i++) {
	        var bench = suite[i];
	
	        if (bench.name == name) {
	          suite.splice(i, 1);
	          suite.benchmarks.splice(i, 1);
	        }
	      }
	    }
	
	    /**
	     * @private
	     */
	
	  }, {
	    key: '_cycle',
	    value: function _cycle(event) {
	      var bench = event.target;
	
	      if (!bench.aborted) {
	        this._status(bench);
	      }
	    }
	
	    /**
	     * @private
	     */
	
	  }, {
	    key: '_start',
	    value: function _start() {}
	  }, {
	    key: '_status',
	    value: function _status(bench) {
	      var size = bench.stats.sample.length;
	      var msg = '&times; ' + Benchmark.formatNumber(bench.count) + ' (' + size + ' sample' + (size == 1 ? '' : 's') + ')';
	
	      _dom2.default.$('sample-' + bench.name).lastChild.innerHTML = msg;
	    }
	
	    /**
	     * Gets the Hz, i.e. operations per second, of `bench` adjusted for the
	     * margin of error.
	     *
	     * @private
	     * @param {Object} bench The benchmark object.
	     * @returns {number} Returns the adjusted Hz.
	     */
	
	  }, {
	    key: '_hz',
	    value: function _hz(bench) {
	      return 1 / (bench.stats.mean + bench.stats.moe);
	    }
	  }, {
	    key: 'error',
	    value: function error(msg) {}
	  }]);
	  return Process;
	}();
	
	exports.default = Process;

/***/ }
]);
//# sourceMappingURL=main.js.map