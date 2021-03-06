/**
 * Author: An Ha (haan.an@yahoo.com.vn)
 *
 * Base class for sub classes register all event handlers
 * Supported Events:
 * - click
 * - mouserover
 *
 */
import utils from './utils';
import Events from './Events';
import DOM from './dom';

// matches all handlers in element
let rjs = /js-([\w]+)/g;
const SUPPORT_TOUCH = 'ontouchstart' in window;
const TOUCH_START = SUPPORT_TOUCH ? "touchstart" : "mousedown";
const TOUCH_END = SUPPORT_TOUCH ? "touchend" : "mouseup";

let supportedEvents = [{
  type: 'click',
  touchType: 'tap',
  fn: function(e, mod) {
    let events = mod.events;

    for( let type in events ) {
      let fn = mod[events[type]];

      if( typeof fn === 'function' ) {
        // set current element
        mod.cel = this;
        fn.call(mod, e);
      }
    }
  }
}, {
  type: 'mouseover',
  touchType: 'mouseover',
  fn: function() {}
}];

// store all supported handler
let handlers = {};

function handler(e) {
  let type = e.type;
  let that = e.target;

  DOM.parents(that, function(parent) {
    let className = parent.className;
    let m, mod;

    while( (m = rjs.exec(className)) && (mod = modules.get(m[1])) ) {
      handlers[type].call(parent, e, mod);
    }
  });

}

// Use Map to store all module registered for performance
// See - https://jsperf.com/es6-map-vs-object-properties/2
let modules = new Map();

class Handler extends Events {
  constructor(settings) {
    super();

    let mid = settings.mid;

    if( modules.get(mid) ) return this;
    modules.set(mid, this);

    this.mid = mid;
    this.events = settings.events;
  }

  static setup(context) {
    let event = new Events();
    // _hids.set(this, settings.hid);
    utils.forEach(supportedEvents, (obj) => {
      let type = SUPPORT_TOUCH ? obj.touchType : obj.type;

      event.on(context || document, type, handler);
      handlers[type] = obj.fn;
    });
  }
}

Handler.setup();

export default Handler;
