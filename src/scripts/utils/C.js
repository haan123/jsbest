let utils = {};

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
  let keys = Object.keys(obj);

  for (let i = 0, length = keys.length; i < length; i++) {
    iteratee.call(context, obj[keys[i]], keys[i], obj);
  }
};

let Event = {
  on: function(el, name, callback) {
    el.addEventListener(name, callback, false);
  },
  off: function(el, name, callback) {
    el.removeEventListener(name, callback, false);
  },
};

let DOM = {};

/**
 * Convert string html to DOM Element
 * @param {String} str
 * @return {Node}
 */
DOM.toDOM = (function(div, tbody) {
  return function(str) {
    let el = div;
    if( str.indexOf('tr') ) el = tbody;

    el.innerHTML = str.replace(/(^\s+|\s+$)/g, '');
    return el.removeChild(el.firstChild);
  };
})(document.createElement('div'), document.createElement('tbody'));

/**
 * Get closest node that match selector
 * @param {Node} el
 * @param {String|Node} selector
 * @return {Node}
 */
DOM.closest = function(el, selector) {
  let cur = el, matched;

  for ( ; cur && cur.nodeType === 1; cur = cur.parentNode ) {
    // using native matches, this function return true or false
    // when selector matched
    // supporting IE9+
    if ( matches.call( cur, selectors ) ) {
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
DOM.parents = function(el, callback) {
  let cur = el;

  do {
    if( callback.call(el, cur) ) break;
    cur = cur.parentNode;
  } while(cur && cur.nodeType === 1);

  return cur;
};

DOM.$ = function(id) {
  return typeof id === 'string' ? document.getElementById(id) : id;
}

/**
 * Return component from name
 *
 * @public
 * @param {String} name
 * @return {Object}
 */
function C(name) {
  const fn = C[name];
  return fn ? fn() : name;
}

C.dom = function() {
  return DOM;
};

C.utils = function() {
  return utils;
}

C.event = function() {
  return Event;
}

export default C;
