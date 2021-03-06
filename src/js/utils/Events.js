import utils from './utils';

let _events = new Map();
let _custom = new Map();
let expando = 'Ev' + 1*new Date();
let _guid = 0;
let _fid = 0;

let nativeBind = Function.prototype.bind;
let rnotwhite = (/\S+/g);
class _Event {
  constructor(event, config) {
    if( event && event.type ) {
      this._event = event;
      this.type = event.type;
      this.defaultPrevented = event.defaultPrevented;
      this.target = ( event.target && event.target.nodeType === 3 ) ? event.target.parentNode :	event.target;

      this.currentTarget = event.currentTarget;
    } else {
      this.type = event;
      this.defaultPrevented = false;
      this.propagationStopped = false;
    }
  }

  preventDefault() {
    if( this._event.preventDefault ) return this._event.preventDefault();
    this.defaultPrevented = true;
  }

  stopPropagation() {
    if( this._event.stopPropagation ) return this._event.stopPropagation();
    this.propagationStopped = true;
  }

  get(name) {
    if( this._event) return this._event[name];
  }

  static fix(event) {
    let e = new _Event(event);
    return e;
  }
}

let bindEvent = function(elem, type, fn, data) {
  let events = Events.getEventData(elem);

  if( !events ) {
    events = Events.setEventData(elem);
  }

  let custom = _custom.get(type);
  let handlers = events[type];
  fn.fid = _fid++;

  let handler = {
    el: elem,
    fn: fn
  };

  if( data ) handler.data = data;

  let eventHandler = function(event) {
    return Events.dispatch.apply(elem, arguments);
  };

  if( !handlers ) {
    handlers = events[type] = [];

    if( !custom || custom.setup(elem) === false ) {
      handler.eventHandler = eventHandler;
      elem.addEventListener(type, eventHandler, false);
    }
  }

  handlers.push(handler);
};

class Events {
  constructor() {}

  /**
   * Bind event
   *
   * @param {Node} elem
   * @param {String} types
   * @param {Object} data - optional
   * @param {Function} fn
   */
  on(elem, types, data, fn) {
    Events.bind.apply(this, arguments);
  }

  /**
   * Unbind event
   *
   * @param {Node} elem
   * @param {String} types
   * @param {Function} fn
   */
  off(elem, type, fn) {
    Events.unbind(elem, type, fn);
  }

  trigger(elem, type, data) {
    // Don't do events on text and comment nodes
		if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

    let event = new _Event(type);
    event.target = elem;

    let path = event.path = [elem], temp;
    for ( let cur = elem.parentNode; cur; cur = cur.parentNode ) {
      path.push(cur);
      temp = cur;
    }

    if( temp === elem.ownerDocument ) path.push(temp.defaultView);

    let i = 0;

    while( (cur = path[i++]) && !event.propagationStopped ) {
      Events.dispatch.call(cur, event, data);
    }
  }

  static getEventData(elem) {
    return _events.get(elem[expando]);
  }

  static setEventData(elem) {
    let guid = elem[expando] = _guid++;
    _events.set(guid, { guid: guid });

    return _events.get(guid);
  }

  /**
   *  Binding events
   *
   *  General:
   *  Events.bind(document, 'click', (e) => {});
   *
   *  Data passed:
   *  Events.bind(document, 'click', { name: value }, (e) => {
   *    let data = e.data;
   *  });
   *
   *  Chained call
   *  Events.bind(document, 'click', (e) => {}).bind('mouseover', (e) => {});
   *
   *  @param {Node} elem
   *  @param {String} type
   *  @param {Object?} data
   *  @param {Function} fn
   *
   * @return {Object} - chain object
   */
  static bind(...args) {
    let elem = this, types, fn, data;
    let nextContext = this;

    switch(args.length) {
      case 2: [types, fn] = args; break;
      case 3:
        if(elem.nodeType) [types, data, fn] = args;
        else [elem, types, fn] = args;
        break;
      default: [elem, types, data, fn] = args;
    }

    if( (elem.nodeType || elem === elem.window) && fn ) {
      types = types.trim().match(rnotwhite) || [''];
      let i = types.length;

      while( i-- ) bindEvent(elem, types[i], fn, data);
    }

    return { bind: nativeBind.call(Events.bind, elem) };
  }

  static unbind(elem, type, fn) {
    let events = Events.getEventData(elem);

    if( !events ) return;
    types = types.trim().match(rnotwhite) || [''];
    let t = types.length;

    while( t-- ) {
      let type = types[t];
      let fid = fn && fn.fid;
      let custom = _custom.get(type);
      let handlers = events[type] || [];

      let i = handlers.length;

      while( i-- ) {
        let handler = handlers[i];

        if( !fid || handler.fn.fid === fid ) {
          if( !custom || custom.teardown(elem) === false ) {
            elem.removeEventListener(type, handler.eventHandler, false);
          }

          handlers.splice(i, 1);
        }
      }

      if( !handlers.length ) delete events[type];
    }

    return { bind: nativeBind.call(Events.bind, elem) };
  }

  static dispatch(event) {
    event = _Event.fix(event);

    let events = Events.getEventData(this);

    if( !events ) return;

    let length = Math.max(0, arguments.length), i, args = [];
    let handlers = events[event.type];
    let handler;

    i = 0;
    while( (handler = handlers[i++]) ) {
      event.currentTarget = this;

      if( handler.data ) event.data = handler.data;
      handler.fn(event);
    }
  }

  static dispatchCustom(elem, type, event) {
    let origin = event.type;
    event.type = type;

    Events.dispatch.call(elem, event);

    event.type = origin;
  }

  /**
   * Create new custom event
   */
  static customEvent(type, obj) {
    if( !obj.setup ) return;

    _custom.set(type, obj);
  }
}

const SUPPORT_TOUCH = 'ontouchstart' in window;
const MOVE_THRESHOLD = 10;
let startX = 0, startY = 0, didScroll = false;

const globalTouchStart = function(e) {
  didScroll = false;
};

const globalTouchMove = function(e) {
  let touch = e.get('touches')[0];
  let didScroll = Math.abs(touch.pageY - startY) < MOVE_THRESHOLD ||        Math.abs(touch.pageX - startX) < MOVE_THRESHOLD;
};

const globalScroll = function(e) {
  if( !didScroll ) didScroll = true;
};

Events.bind(document, 'touchstart', globalTouchStart).bind('touchmove', globalTouchMove).bind('scroll', globalScroll);

Events.customEvent('tap', {
  setup: function(elem) {
    Events.bind(elem, 'touchstart', (event) => {

      let handler = (event) => {
        if( !didScroll ) {
          Events.dispatchCustom(elem, 'tap', event);
        }
      };

      let clearHandler = (e) => {
        Events.unbind(elem, 'touchend', handler);
        Events.unbind(document, 'touchend', clearHandler);
      };

      Events.bind(elem, 'touchend', handler);
      Events.bind(document, 'touchend', clearHandler);
    });
  },

  teardown: (elem) => {
    Events.unbind(elem, 'touchstart');
  }
});

export default Events;
