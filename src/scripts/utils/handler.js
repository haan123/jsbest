/**
 * Base class for sub classes register all event handlers
 * Supported Events:
 * - click
 * - mouserover
 *
 */
import utils from './utils';
import DOM from './dom';

// matches all handlers in element
let rjs = /js-([\w]+)/g;
// store all handler ids
let _hids = new WeakMap();

let supportedEvents = [{
  name: 'click',
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
  name: 'mouseover',
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

class Handler {
  constructor(settings) {
    let mid = settings.mid;

    if( modules.get(mid) ) return this;
    modules.set(mid, this);

    this.mid = mid;
    this.events = settings.events;
  }

  static setup(context) {
    // _hids.set(this, settings.hid);
    utils.forEach(supportedEvents, (obj) => {
      utils.Event.on(context || document, obj.name, handler);
      handlers[obj.name] = obj.fn;
    });
  }
}

Handler.setup();

export default Handler;
