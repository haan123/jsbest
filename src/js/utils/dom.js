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

let docElem = document.documentElement;
let matches = docElem.matches ||
                docElem.webkitMatchesSelector ||
                docElem.mozMatchesSelector ||
                docElem.oMatchesSelector ||
                docElem.msMatchesSelector;

function traverse(el, selector, method) {
  let cur = el;

  for ( ; cur; cur = cur[method] ) {
    // using native matches, this function return true or false
    // when selector matched
    // supporting IE9+
    if ( cur.nodeType === 1 && matches.call( cur, selector ) ) {
      return cur;
    }
  }
}

DOM.closest = function(el, selector) {
  return traverse(el, selector, 'parentNode');
};

DOM.children = function(el, selector) {
  return traverse(el.firstChild, selector, 'nextSibling');
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


/**
 * Get element by id
 * @param {String} id
 * @return {Node}
 */
DOM.$ = function(id) {
  return typeof id === 'string' ? document.getElementById(id) : id;
};

/**
 * Remove element's class
 * @param {Node} elem
 * @return {String} newClass
 */
DOM.removeClass = function(elem, value) {
  let curValue = elem.className.trim();
  const rclass = new RegExp(' ' + value + ' ', 'g');
  const current = (' ' + curValue + ' ').replace(rclass, ' ');

  return (elem.className = current.trim());
};

export default DOM;
