webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Sample = __webpack_require__(1);
	
	var _Sample2 = _interopRequireDefault(_Sample);
	
	var _Setup = __webpack_require__(55);
	
	var _Setup2 = _interopRequireDefault(_Setup);
	
	var _Process = __webpack_require__(56);
	
	var _Process2 = _interopRequireDefault(_Process);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var _process = new _Process2.default();
	new _Sample2.default(_process);
	new _Setup2.default(_process);

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
	
	var _Base2 = __webpack_require__(46);
	
	var _Base3 = _interopRequireDefault(_Base2);
	
	var _utils = __webpack_require__(48);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _dom = __webpack_require__(49);
	
	var _dom2 = _interopRequireDefault(_dom);
	
	var _hogan = __webpack_require__(52);
	
	var _hogan2 = _interopRequireDefault(_hogan);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Sample = function (_Base) {
	  (0, _inherits3.default)(Sample, _Base);
	
	  function Sample(process) {
	    (0, _classCallCheck3.default)(this, Sample);
	
	    var _this = (0, _possibleConstructorReturn3.default)(this, Object.getPrototypeOf(Sample).call(this, {
	      mid: 'sample',
	      events: {
	        'click': '_click'
	      }
	    }));
	
	    _this.suite = process.suite;
	
	    _this.processList = _dom2.default.$('process');
	    _this.process = process;
	
	    _this.rowTempl = _hogan2.default.compile(_dom2.default.$('process-row-templ').innerHTML);
	    _this.sampleFormTempl = _hogan2.default.compile(_dom2.default.$('sample-form-templ').innerHTML);
	
	    _this._save({
	      name: 'test',
	      code: '/o/.test("o")'
	    });
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
	
	    /**
	     * Get process item row
	     *
	     * @private
	     * @param {Node} elem
	     *
	     * @return {Node}
	     */
	
	  }, {
	    key: '_getItemRow',
	    value: function _getItemRow(elem, id) {
	      return _dom2.default.$('samle-' + id);
	    }
	
	    /**
	     * Edit sample
	     *
	     * @public
	     */
	
	  }, {
	    key: 'editSample',
	    value: function editSample() {
	      this.openSample.call(this, 'edit');
	    }
	
	    /**
	     * Remove sample from process list
	     *
	     * @public
	     */
	
	  }, {
	    key: 'removeSample',
	    value: function removeSample() {
	      var item = this.getItem(this.cel);
	      var id = item.getAttribute('data-uid');
	      var row = _dom2.default.$('sample-' + id);
	
	      row.parentNode.removeChild(row);
	      this.remove('sample', id);
	
	      this.process.removeBench(id);
	    }
	
	    /**
	     * Show sample form
	     *
	     * @public
	     */
	
	  }, {
	    key: 'openSample',
	    value: function openSample(edit) {
	      var elem = this.cel;
	      var item = edit ? this.getItem(elem) : this.createSampleItem(elem);
	
	      this.showForm(item, 'sample', {}, {
	        type: edit || 'add'
	      }, edit);
	
	      if (edit) {
	        _dom2.default.$('sample-name').value = item.getAttribute('data-uid');
	      }
	    }
	
	    /**
	     * Save sample, if data passed in from first initialize, create new div then render
	     *
	     * @public
	     * @param {Object} data
	     */
	
	  }, {
	    key: '_save',
	    value: function _save(data, item) {
	      var name = data.name;
	      var code = data.code;
	      var oldId = data.oldId;
	
	      if (!name || !code || !oldId && this._exist(name)) return;
	
	      if (!item) {
	        item = this.createSampleItem(_dom2.default.$('sample-add'));
	      }
	
	      this.suite.add(name, code);
	      this.revealAddButton('sample');
	
	      this.renderSavedState('sample', item, code, name, {
	        handler: 'sample',
	        name: 'Sample',
	        id: name,
	        language: 'javascript',
	        sample: [{ id: name }]
	      });
	
	      this.renderRow({
	        id: name,
	        name: name
	      }, oldId);
	    }
	  }, {
	    key: 'add',
	    value: function add() {
	      var item = this.getItem(this.cel);
	      var name = _dom2.default.$('sample-name').value;
	      var code = this.sampleEditor.getValue().trim();
	
	      this._save({
	        name: name,
	        code: code
	      }, item);
	    }
	  }, {
	    key: 'edit',
	    value: function edit() {
	      var item = this.getItem(this.cel);
	      var name = _dom2.default.$('sample-name').value;
	      var code = this.sampleEditor.getValue().trim();
	
	      var oldId = item.getAttribute('data-uid');
	
	      if (!name || !code) return;
	      if (name !== oldId && this._exist(name)) {
	        return;
	      }
	
	      this.removeFromCache(oldId);
	      this.process.removeBench(oldId);
	
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
	
	  }, {
	    key: 'cancel',
	    value: function cancel() {
	      var elem = this.cel;
	      var item = this.getItem(elem);
	      var isAdd = ~item.className.indexOf(this.getStateClass('add'));
	      var name = item.getAttribute('data-uid');
	      var cache = this.getCacheItem(name);
	
	      if (isAdd) {
	        item.parentNode.removeChild(item);
	        this.revealAddButton('sample');
	      } else {
	        this.renderSavedState('sample', item, cache.code, name, {
	          handler: 'sample',
	          name: 'Sample',
	          id: name,
	          language: 'javascript',
	          sample: [{ id: name }]
	        });
	      }
	    }
	
	    /**
	     * Run benchmark
	     *
	     * @public
	     */
	
	  }, {
	    key: 'run',
	    value: function run() {
	      this.process.run();
	    }
	  }, {
	    key: 'renderRow',
	    value: function renderRow(obj, oldId) {
	      var row = _dom2.default.toDOM(this.rowTempl.render(obj));
	
	      if (oldId) {
	        var orow = _dom2.default.$('sample-' + oldId);
	        orow.parentNode.removeChild(orow);
	      }
	
	      this.processList.appendChild(row);
	    }
	  }]);
	  return Sample;
	}(_Base3.default);
	
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
	
	var _possibleConstructorReturn2 = __webpack_require__(7);
	
	var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);
	
	var _inherits2 = __webpack_require__(39);
	
	var _inherits3 = _interopRequireDefault(_inherits2);
	
	var _handler = __webpack_require__(47);
	
	var _handler2 = _interopRequireDefault(_handler);
	
	var _utils = __webpack_require__(48);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _dom = __webpack_require__(49);
	
	var _dom2 = _interopRequireDefault(_dom);
	
	var _codemirror = __webpack_require__(50);
	
	var _codemirror2 = _interopRequireDefault(_codemirror);
	
	var _prismjs = __webpack_require__(51);
	
	var _prismjs2 = _interopRequireDefault(_prismjs);
	
	var _hogan = __webpack_require__(52);
	
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
	
	var Base = function (_Handler) {
	  (0, _inherits3.default)(Base, _Handler);
	
	  function Base(obj) {
	    (0, _classCallCheck3.default)(this, Base);
	
	    var _this = (0, _possibleConstructorReturn3.default)(this, Object.getPrototypeOf(Base).call(this, obj));
	
	    _utils2.default.Event.on(window, 'scroll', _this._scroll.bind(_this));
	
	    _this.savedTempl = _hogan2.default.compile(_dom2.default.$('saved-templ').innerHTML);
	    _this.topBarHeight = _dom2.default.$('top-bar').offsetHeight;
	    _this.processes = _dom2.default.$('processes');
	    return _this;
	  }
	
	  /**
	   * Remove sample id from cache
	   *
	   * @param {String} id
	   *
	   * @return {Boolean}
	   */
	
	
	  (0, _createClass3.default)(Base, [{
	    key: 'removeFromCache',
	    value: function removeFromCache(id) {
	      return _cache.delete(id);
	    }
	
	    /**
	     * Remove cache item
	     *
	     * @param {String} id
	     *
	     * @return {Object}
	     */
	
	  }, {
	    key: 'getCacheItem',
	    value: function getCacheItem(id) {
	      return _cache.get(id);
	    }
	
	    /**
	     *  Create new cache item
	     *
	     * @param {String} id
	     *
	     * @return {Object}
	     */
	
	  }, {
	    key: 'setCacheItem',
	    value: function setCacheItem(id) {
	      var obj = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      _cache.set(id, obj);
	
	      return _cache.get(id);
	    }
	
	    /**
	     * Event handler for scroll
	     */
	
	  }, {
	    key: '_scroll',
	    value: function _scroll(e) {
	      var top = window.pageYOffset;
	      var processes = this.processes;
	
	      if (document.documentElement.clientWidth < 640) return;
	
	      if (top > this.topBarHeight) {
	        if (this.fixing) return;
	        processes.style.top = '1.5em';
	        processes.style.width = processes.clientWidth + 'px';
	        processes.className += ' fixed';
	
	        this.fixing = true;
	      } else if (this.fixing) {
	        processes.removeAttribute('style');
	        _dom2.default.removeClass(processes, 'fixed');
	        delete this.fixing;
	      }
	    }
	  }, {
	    key: 'showForm',
	    value: function showForm(elem, name, config, obj, type) {
	      var item = _dom2.default.closest(elem, '.' + SAMPLE_ITEM_CLASS);
	      var id = item.getAttribute('data-uid');
	
	      item.innerHTML = this[name + 'FormTempl'].render(obj);
	      this._setStateClass(item, type || 'add');
	
	      return this._initEditor(name, config, id);
	    }
	  }, {
	    key: 'getStateClass',
	    value: function getStateClass(name) {
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
	
	    /**
	     * Render saved state
	     * @private
	     * @param {String} id
	     */
	
	  }, {
	    key: 'renderSavedState',
	    value: function renderSavedState(name, item, value, id, data) {
	      var editor = this[name + 'Editor'];
	      var cache = this.getCacheItem(id);
	      this.setCacheItem(id, _utils2.default.extend(cache || {}, { code: value }));
	
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
	
	  }, {
	    key: 'getItem',
	    value: function getItem(elem) {
	      return _dom2.default.closest(elem, '.' + SAMPLE_ITEM_CLASS);
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
	    key: 'remove',
	    value: function remove(name, id) {
	      var item = this.getItem(this.cel);
	      var cache = _cache.get(id);
	
	      item.parentNode.removeChild(item);
	
	      _dom2.default.removeClass(item, this.getStateClass('saved'));
	
	      this.removeFromCache(id);
	
	      this.revealAddButton(name);
	    }
	
	    /**
	     * Show and animate add button
	     *
	     * @private
	     * @param {Param} name
	     */
	
	  }, {
	    key: 'revealAddButton',
	    value: function revealAddButton(name) {
	      var add = _dom2.default.$(name + '-add');
	
	      _dom2.default.removeClass(add, 'pulse');
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
	
	  }, {
	    key: 'createSampleItem',
	    value: function createSampleItem(elem) {
	      var item = document.createElement('div');
	      item.className += 'sample-item';
	
	      elem.parentNode.insertBefore(item, elem);
	      elem.style.display = 'none';
	
	      return item;
	    }
	  }]);
	  return Base;
	}(_handler2.default);
	
	exports.default = Base;

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _classCallCheck2 = __webpack_require__(2);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(3);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _utils = __webpack_require__(48);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _dom = __webpack_require__(49);
	
	var _dom2 = _interopRequireDefault(_dom);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// matches all handlers in element
	/**
	 * Author: An Ha (haan.an@yahoo.com.vn)
	 *
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
/* 48 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var utils = {};
	var protoObj = Object.prototype;
	var toString = protoObj.toString;
	
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
	  var i = 0,
	      length = void 0;
	
	  if (this.isArray(obj)) {
	    length = obj.length;
	
	    for (; i < length; i++) {
	      iteratee.call(context, obj[i], i, obj);
	    }
	  } else {
	    var keys = Object.keys(obj);
	    length = keys.length;
	
	    for (; i < length; i++) {
	      iteratee.call(context, obj[keys[i]], keys[i], obj);
	    }
	  }
	};
	
	utils.isArray = function (obj) {
	  return toString.call(obj) === '[object Array]';
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
/* 49 */
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
	
	var docElem = document.documentElement;
	var matches = docElem.matches || docElem.webkitMatchesSelector || docElem.mozMatchesSelector || docElem.oMatchesSelector || docElem.msMatchesSelector;
	
	DOM.closest = function (el, selector) {
	  var cur = el,
	      matched = void 0;
	  var docElem = cur.ownerDocument.documentElement;
	
	  for (; cur && cur.nodeType === 1; cur = cur.parentNode) {
	    // using native matches, this function return true or false
	    // when selector matched
	    // supporting IE9+
	    if (matches.call(cur, selector)) {
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
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */
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
	
	var _Base2 = __webpack_require__(46);
	
	var _Base3 = _interopRequireDefault(_Base2);
	
	var _utils = __webpack_require__(48);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _dom = __webpack_require__(49);
	
	var _dom2 = _interopRequireDefault(_dom);
	
	var _hogan = __webpack_require__(52);
	
	var _hogan2 = _interopRequireDefault(_hogan);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Setup = function (_Base) {
	  (0, _inherits3.default)(Setup, _Base);
	
	  function Setup(process) {
	    (0, _classCallCheck3.default)(this, Setup);
	
	    var _this = (0, _possibleConstructorReturn3.default)(this, Object.getPrototypeOf(Setup).call(this, {
	      mid: 'setup',
	      events: {
	        'click': '_click'
	      }
	    }));
	
	    _this.processList = _dom2.default.$('process');
	    _this.process = process;
	    _this.context = process.context;
	
	    _this.setupFormTempl = _hogan2.default.compile(_dom2.default.$('setup-form-templ').innerHTML);
	    _this.setupUrlTempl = _hogan2.default.compile(_dom2.default.$('setup-url-templ').innerHTML);
	    _this._id = 'setup';
	    _this.cache = _this.setCacheItem(_this._id);
	    return _this;
	  }
	
	  /**
	   * Handle click for sample handler
	   *
	   * @private
	   */
	
	
	  (0, _createClass3.default)(Setup, [{
	    key: '_click',
	    value: function _click(e) {
	      var type = this.cel.getAttribute('data-type');
	
	      this[type]();
	    }
	  }, {
	    key: 'openSetup',
	    value: function openSetup(edit) {
	      var elem = this.cel;
	      var item = edit ? elem : this.createSampleItem(elem);
	
	      var editor = this.showForm(item, 'setup', {
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
	
	  }, {
	    key: '_save',
	    value: function _save(data, item) {
	      var _this2 = this;
	
	      var code = data.code;
	      var urls = data.urls;
	
	      if (!item) {
	        item = this.createSampleItem(_dom2.default.$('setup-add'));
	        _utils2.default.forEach(urls, function (url) {
	          return _this2._cachedUrl(url);
	        });
	      }
	
	      this.context.document.body.innerHTML = code;
	
	      if (urls) this._embedUrls(urls);
	
	      this.renderSavedState('setup', item, code, 'setup', {
	        handler: 'setup',
	        name: 'Setup',
	        id: 'setup',
	        language: 'markup',
	        urls: urls
	      });
	    }
	  }, {
	    key: 'setup',
	    value: function setup() {
	      var editor = this.setupEditor;
	
	      var item = this.getItem(this.cel);
	      var code = editor.getValue().trim();
	      var urls = this.cache.urls;
	
	      if (!code) {
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
	
	  }, {
	    key: '_existUrl',
	    value: function _existUrl(urls, url) {
	      var i = urls.length;
	
	      while (i--) {
	        if (urls[i] === url) return true;
	      }
	
	      return false;
	    }
	
	    /**
	     * Add url handler
	     *
	     * @public
	     */
	
	  }, {
	    key: 'addUrl',
	    value: function addUrl() {
	      var elem = this.cel;
	      var form = _dom2.default.closest(elem, '.setup__form');
	      var field = _dom2.default.$('setup-url-field');
	      var url = field.value;
	
	      if (!url) return;
	
	      var id = this._cachedUrl(url);
	
	      if (!id) return;
	
	      var urlItem = _dom2.default.toDOM(this.setupUrlTempl.render({
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
	
	  }, {
	    key: '_cachedUrl',
	    value: function _cachedUrl(url) {
	      var cache = this.cache;
	      url = typeof url === 'string' ? { url: url } : url;
	
	      if (!cache.urls) cache.urls = [];
	
	      if (this._existUrl(cache.urls, url.url)) return;
	
	      return cache.urls.push(url);
	    }
	
	    /**
	     * remove url handler
	     *
	     * @public
	     */
	
	  }, {
	    key: 'removeUrl',
	    value: function removeUrl() {
	      var id = this.cel.getAttribute('data-url-id');
	      var setup = this.cel.parentNode;
	      var cache = this.getCacheItem(this._id);
	
	      cache.urls.splice(id, 1);
	      setup.parentNode.removeChild(setup);
	    }
	
	    /**
	     * Embed external libraries to iframe
	     *
	     * @private
	     * @param {Array} urls
	     */
	
	  }, {
	    key: '_embedUrls',
	    value: function _embedUrls(urls) {
	      if (!urls.length) return '';
	      var script = document.createElement('script');
	
	      for (var i = 0, len = urls.length; i < len; i++) {
	        var temp = script.cloneNode(true);
	        temp.src = urls[i].url;
	        this.context.document.body.appendChild(temp);
	      }
	    }
	
	    /**
	     * Remove setup
	     *
	     * @public
	     */
	
	  }, {
	    key: 'removeSetup',
	    value: function removeSetup() {
	      var item = this.getItem(this.cel);
	      var id = item.getAttribute('data-uid');
	      this.remove('setup', id);
	
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
	      this.openSetup.call(this, 'edit');
	    }
	
	    /**
	     *  cancel edit/add setup
	     *
	     * @public
	     */
	
	  }, {
	    key: 'cancelSetup',
	    value: function cancelSetup() {
	      var elem = this.cel;
	      var item = this.getItem(elem);
	      var isAdd = ~item.className.indexOf(this.getStateClass('add'));
	
	      if (isAdd) {
	        item.parentNode.removeChild(item);
	        this.revealAddButton('setup');
	      } else {
	        this._save({
	          code: this.cache.code,
	          urls: this.cache.urls
	        }, item);
	      }
	    }
	  }]);
	  return Setup;
	}(_Base3.default);
	
	exports.default = Setup;

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _classCallCheck2 = __webpack_require__(2);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(3);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _utils = __webpack_require__(48);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _dom = __webpack_require__(49);
	
	var _dom2 = _interopRequireDefault(_dom);
	
	var _lodash = __webpack_require__(57);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var Process = function () {
	  function Process() {
	    (0, _classCallCheck3.default)(this, Process);
	
	    this.context = _dom2.default.$('iframe').contentWindow;
	    this.context.document.head.appendChild(_dom2.default.toDOM('<script></script>'));
	    Benchmark = Benchmark.runInContext(this.context);
	    this.context.Benchmark = Benchmark;
	    this.errorTmpl = _dom2.default.$('error-templ').innerHTML;
	
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
	      }).on('start cycle', function (event) {}).on('complete', this._complete.bind(this));
	    }
	
	    /**
	     * @private
	     */
	
	  }, {
	    key: 'run',
	    value: function run() {
	      var suite = this.suite;
	      var stopped = !suite.running;
	      suite.abort();
	      suite.length = 0;
	
	      if (!suite.benchmarks.length) return;
	
	      if (stopped) {
	        suite.push.apply(suite, _lodash2.default.filter(suite.benchmarks, function (bench) {
	          return !bench.error && bench.reset();
	        }));
	
	        suite.run({
	          'async': true,
	          'queued': true
	        });
	      }
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
	      var benches = suite.benchmarks;
	
	      for (var i = 0, len = benches.length; i < len; i++) {
	        var bench = suite[i];
	
	        if (name === benches[i].name) {
	          if (bench && bench.name === name) {
	            suite.splice(i, 1);
	          }
	
	          benches.splice(i, 1);
	
	          return true;
	        }
	      }
	
	      return false;
	    }
	  }, {
	    key: '_start',
	    value: function _start() {}
	
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
	
	    /**
	     * Handle complete test
	     *
	     * @private
	     */
	
	  }, {
	    key: '_complete',
	    value: function _complete() {
	      var _this2 = this;
	
	      var benches = this.suite.benchmarks;
	      var sorted = this._sort(benches);
	      var count = 0;
	
	      var bound = this._getBoundBenches(sorted);
	
	      // highlight result cells
	      _utils2.default.forEach(sorted, function (bench, index) {
	        var row = _dom2.default.$('sample-' + bench.name);
	        var nameCell = row.firstChild;
	        var rankCell = nameCell.nextSibling;
	        var rankClass = 'warning';
	        var error = bench.error;
	        var slower = void 0;
	
	        _this2._render(bench, row, error);
	
	        if (!error) {
	          var fastestHz = _this2._hz(sorted[bound.fastest]),
	              hz = _this2._hz(bench),
	              percent = (1 - hz / fastestHz) * 100;
	
	          if (index === bound.fastest) {
	            rankClass = 'success';
	            count++;
	          } else {
	            slower = isFinite(hz) ? Benchmark.formatNumber(percent < 1 ? percent.toFixed(2) : Math.round(percent)) : '';
	
	            // mark slowest
	            if (index === bound.slowest) {
	              rankClass = 'alert';
	            }
	
	            count++;
	          }
	        } else {
	          rankClass = 'alert';
	        }
	
	        _this2._renderRankCell(rankCell, error ? _this2.errorTmpl : count, rankClass, slower, error);
	      });
	    }
	  }, {
	    key: '_render',
	    value: function _render(bench, row, error) {
	      var parsed,
	          hz = bench.hz;
	
	      var cell = row.lastChild;
	
	      // reset title and class
	      row.title = '';
	
	      if (error) {
	        row.title = bench.error;
	        cell.innerHTML = '<small class="cell-ops__error">' + error + '</small>';
	      } else {
	        if (bench.cycles) {
	          row.title = 'Ran ' + Benchmark.formatNumber(bench.count) + ' times in ' + bench.times.cycle.toFixed(3) + ' seconds.';
	
	          cell.innerHTML = Benchmark.formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) + '<br><small>&plusmn;' + bench.stats.rme.toFixed(2) + '%</small>';
	        }
	      }
	    }
	
	    /**
	     * Return fastest and slowest bench
	     *
	     * @private
	     * @param {Object} benches
	     *
	     * @return {Object} obj
	     */
	
	  }, {
	    key: '_getBoundBenches',
	    value: function _getBoundBenches(benches) {
	      var obj = {};
	      var i = 0;
	      var bench = void 0;
	
	      while (bench = benches[i]) {
	        if (!bench.error) {
	          if (typeof obj.fastest !== 'number') obj.fastest = i;
	
	          obj.slowest = i;
	        }
	
	        i++;
	      }
	
	      return obj;
	    }
	
	    /**
	     * Sort benches
	     * Referenced from filter method in benchmark library
	     *
	     * @private
	     * @param {Object} benches
	     * @return {Array} sorted
	     */
	
	  }, {
	    key: '_sort',
	    value: function _sort(benches) {
	      var sorted = benches.slice().sort(function (a, b) {
	        a = a.stats;b = b.stats;
	        return a.mean + a.moe > b.mean + b.moe ? 1 : -1;
	      });
	
	      return sorted;
	    }
	
	    /**
	     * Render rank cell
	     *
	     * @private
	     * @param {Node} cell
	     * @param {Number} rank
	     * @param {String} className
	     * @param {String} slower
	     * @param {Boolean} error
	     *
	     */
	
	  }, {
	    key: '_renderRankCell',
	    value: function _renderRankCell(cell, rank, className, slower, error) {
	      cell.innerHTML = '<span class="badge animated ' + className + '">' + rank + '</span>' + (!error && slower ? '<br><small>%' + slower + ' slower</small>' : '');
	
	      // animate
	      cell.firstChild.className += ' bounce-in';
	    }
	  }]);
	  return Process;
	}();
	
	exports.default = Process;

/***/ }
]);
//# sourceMappingURL=main.js.map