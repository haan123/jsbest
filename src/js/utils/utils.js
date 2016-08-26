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

utils.indexOf = function(arr, key, value) {
  for( let i = 0, len = arr.length; i < len; i++ ) {
    let _val = arr[i][key];
    if( _val && _val === value ) {
      return i;
    }
  }

  return -1;
};

export default utils;
