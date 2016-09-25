import Promise from 'bluebird';

let utils = {};
let protoObj = Object.prototype;
let toString = protoObj.toString;

let _options = {
  type: 'GET',
  async: true
};
let risget = /^(?:GET|HEAD)$/;

utils.ajax = function(url, options) {
  return new Promise(function(resolve, reject) {
    if( typeof url === 'string' ) {
      options = utils.extend({}, _options, options);
    } else {
      options = utils.extend({}, _options, url);
      url = options.url;
    }

    options.type = options.type.toUpperCase();

    let data = options.data, params = [];
    if( data ) {
      if( typeof data === 'string' ) {
        params.push(data.trim());
      } else {
        for( let key in data ) {
          params.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key] || ''));
        }
      }

      params = params.join('&');
    }

    if( params.length ) {
      url += url.indexOf('?') < 0 ? '?' + params : params;
    }

    var xhr = new XMLHttpRequest();
    xhr.open(options.type, url, options.async);

    xhr.onload = function() {
      let status = this.status;

      if ( status >= 200 && status < 300 || status === 304 ) {
        try {
          resolve(JSON.parse(this.responseText));
        } catch(e) {
          resolve(this.responseText);
        }
      } else {
        reject(new Error(this.statusText));
      }
    };

    xhr.onerror = reject;
    xhr.onabort = reject;

    let isSend = !risget.test(options.type);
    try{
      xhr.send(isSend && options.data || null);
    } catch(e) {
      reject(e);
    }
  });
};

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
