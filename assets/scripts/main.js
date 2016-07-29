webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Sample = __webpack_require__(55);
	
	var _Sample2 = _interopRequireDefault(_Sample);
	
	var _Process = __webpack_require__(48);
	
	var _Process2 = _interopRequireDefault(_Process);
	
	var _codemirror = __webpack_require__(49);
	
	var _codemirror2 = _interopRequireDefault(_codemirror);
	
	var _C = __webpack_require__(47);
	
	var _C2 = _interopRequireDefault(_C);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var editorConfig = {
	  lineNumbers: true,
	  tabSize: 2,
	  styleActiveLine: true,
	  autoCloseBrackets: true,
	  viewportMargin: Infinity
	};
	
	var caseCode = _codemirror2.default.fromTextArea(document.getElementById('case-code'), editorConfig);
	
	var setup = _codemirror2.default.fromTextArea(document.getElementById('setup'), (0, _C2.default)('utils').extend({}, editorConfig, {
	  mode: "xml",
	  htmlMode: true,
	  viewportMargin: Infinity,
	  readOnly: "nocursor"
	}));
	
	var _process = new _Process2.default();
	var _case = new _Sample2.default(_process, caseCode, setup);

/***/ },
/* 1 */,
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
/* 6 */,
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
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */,
/* 35 */,
/* 36 */,
/* 37 */,
/* 38 */,
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
	
	var _C = __webpack_require__(47);
	
	var _C2 = _interopRequireDefault(_C);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// matches all handlers in element
	var rjs = /js-([\w]+)/g;
	// store all handler ids
	/**
	 * Base class for sub classes register all event handlers
	 * Supported Events:
	 * - click
	 * - mouserover
	 *
	 */
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
	
	  (0, _C2.default)('dom').parents(that, function (parent) {
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
	      (0, _C2.default)('utils').forEach(supportedEvents, function (obj) {
	        (0, _C2.default)('event').on(context || document, obj.name, handler);
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
	
	var Event = {
	  on: function on(el, name, callback) {
	    el.addEventListener(name, callback, false);
	  },
	  off: function off(el, name, callback) {
	    el.removeEventListener(name, callback, false);
	  }
	};
	
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
	
	  for (; cur && cur.nodeType === 1; cur = cur.parentNode) {
	    // using native matches, this function return true or false
	    // when selector matched
	    // supporting IE9+
	    if (matches.call(cur, selectors)) {
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
	
	DOM.$ = function (id) {
	  return typeof id === 'string' ? document.getElementById(id) : id;
	};
	
	/**
	 * Return component from name
	 *
	 * @public
	 * @param {String} name
	 * @return {Object}
	 */
	function C(name) {
	  var fn = C[name];
	  return fn ? fn() : name;
	}
	
	C.dom = function () {
	  return DOM;
	};
	
	C.utils = function () {
	  return utils;
	};
	
	C.event = function () {
	  return Event;
	};
	
	exports.default = C;

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _classCallCheck2 = __webpack_require__(2);
	
	var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);
	
	var _createClass2 = __webpack_require__(3);
	
	var _createClass3 = _interopRequireDefault(_createClass2);
	
	var _C = __webpack_require__(47);
	
	var _C2 = _interopRequireDefault(_C);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var $ = (0, _C2.default)('dom').$;
	
	var Process = function () {
	  function Process() {
	    (0, _classCallCheck3.default)(this, Process);
	
	    this.context = (0, _C2.default)('dom').$('iframe').contentWindow;
	    this.context.document.body.innerHTML = '<script></script>';
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
	        (0, _C2.default)('utils').forEach(benches, function (bench) {
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
	
	      $('sample-' + bench.name).lastChild.innerHTML = msg;
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

/***/ },
/* 49 */,
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
	
	var _handler = __webpack_require__(46);
	
	var _handler2 = _interopRequireDefault(_handler);
	
	var _C = __webpack_require__(47);
	
	var _C2 = _interopRequireDefault(_C);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	var rt = /(\{([\w]+)\})/g;
	
	var Sample = function (_Handler) {
	  (0, _inherits3.default)(Sample, _Handler);
	
	  function Sample(process, caseCode, setup) {
	    (0, _classCallCheck3.default)(this, Sample);
	
	    var _this = (0, _possibleConstructorReturn3.default)(this, Object.getPrototypeOf(Sample).call(this, {
	      mid: 'case',
	      events: {
	        'click': '_click'
	      }
	    }));
	
	    _this.caseCodeEditor = caseCode;
	    _this.setupEditor = setup;
	    _this.suite = process.suite;
	    _this.context = process.context;
	
	    _this.nameField = (0, _C2.default)('dom').$('case-name');
	    _this.process = (0, _C2.default)('dom').$('process');
	    _this.template = (0, _C2.default)('dom').$('process-row-templ').innerHTML;
	    return _this;
	  }
	
	  (0, _createClass3.default)(Sample, [{
	    key: '_click',
	    value: function _click(e) {
	      var type = this.cel.getAttribute('data-type');
	
	      this[type]();
	    }
	  }, {
	    key: '_exist',
	    value: function _exist(name) {
	      var benches = this.suite.benchmarks;
	      var i = benches.length - 1;
	
	      do {
	        if (benches[i].name === name) return true;
	      } while (i--);
	
	      return false;
	    }
	  }, {
	    key: 'setup',
	    value: function setup() {
	      var html = this.setupEditor.getValue();
	
	      if (html) {
	        this.context.document.body.innerHTML += html;
	        this.hasContext = true;
	      } else {
	        this.hasContext = false;
	      }
	    }
	
	    /**
	     * Add more sample
	     *
	     * @public
	     */
	
	  }, {
	    key: 'add',
	    value: function add() {}
	
	    /**
	     * Save sample
	     *
	     * @public
	     */
	
	  }, {
	    key: 'save',
	    value: function save() {
	      var name = this.nameField.value;
	      var code = this.caseCodeEditor.getValue();
	
	      if (!name || !code || this._exist(name)) return;
	
	      this.suite.add(name, code);
	
	      this.renderRow({
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
	      var row = (0, _C2.default)('dom').toDOM(this.template.replace(rt, function (a, m, name) {
	        return obj[name];
	      }));
	
	      this.process.appendChild(row);
	    }
	  }]);
	  return Sample;
	}(_handler2.default);
	
	exports.default = Sample;

/***/ }
]);
//# sourceMappingURL=main.js.map