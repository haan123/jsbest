import utils from './utils';

let _events = new Map();
let _custom = new Map();
let expando = 'Ev' + 1*new Date();
let _guid = 0;
let _fid = 0;

let nativeBind = Function.prototype.bind;

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

class Events {
  constructor() {}

  on(elem, type, callback) {
    Events.bind(elem, type, callback);
  }

  off(elem, type, callback) {
    Events.unbind(elem, type, callback);
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
   * Binding events
   *
   *
   */
  static bind(elem, type, data, fn) {
    let isChain = this.isChain;

    if( isChain ) {
      if( !fn ) {
        [elem, type, fn, data] = [this.elem, elem, type, null];
      } else {
        [elem, type, data, fn] = [this.elem, elem, type, data];
      }
    } else if( !fn ) [fn, data] = [data, null];

    if( !fn ) return {
      bind: nativeBind.call(Events.bind, { isChain: true, elem: elem })
    };

    let events = Events.getEventData(elem);

    if( !events ) {
      events = this.setEventData(elem);
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

    return {
      bind: nativeBind.call(Events.bind, { isChain: true, elem: elem })
    };
  }

  static unbind(elem, type, fn) {
    let events = Events.getEventData(elem);

    if( !events ) return;

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

    return this;
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
