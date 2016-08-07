let utils = {};
let protoObj = Object.prototype;
let toString = protoObj.toString;

utils.extend = function(obj) {
  let length = arguments.length,
    src, keys, key;

  if( length < 2 ) return obj;

  for ( let i = 1; i < length; i++ ) {
    src = arguments[i];

    if( src ) {
      keys = Object.keys(src);

      for( let j = 0, len = keys.length; j < len; j++ ) {
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
utils.isFunction = function(obj) {
  return typeof obj == 'function' || false;
};

utils.forEach = function(obj, iteratee, context) {
  let i = 0, length;

  if( this.isArray(obj) ) {
    length = obj.length;

    for (; i < length; i++) {
      iteratee.call(context, obj[i], i, obj);
    }
  } else {
    let keys = Object.keys(obj);
    length = keys.length;

    for (; i < length; i++) {
      iteratee.call(context, obj[keys[i]], keys[i], obj);
    }
  }
};

utils.isArray = function(obj) {
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
var createEscaper = function(map) {
  var escaper = function(match) {
    return map[match];
  };
  // Regexes for identifying a key that needs to be escaped
  var source = '(?:' + Object.keys(map).join('|') + ')';
  var testRegexp = RegExp(source);
  var replaceRegexp = RegExp(source, 'g');
  return function(string) {
    string = string === null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  };
};

utils.escape = createEscaper(escapeMap);

utils.Event = {
  on: function(el, name, callback) {
    el.addEventListener(name, callback, false);
  },
  off: function(el, name, callback) {
    el.removeEventListener(name, callback, false);
  },
};

export default utils;
