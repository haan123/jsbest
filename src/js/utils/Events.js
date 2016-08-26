import utils from './utils';

let _eData = new Map();
let _custom = new Map();
let expando = 'Ev' + 1*new Date();
let _id = 0;

class Events {
  constructor() {
  }

  on(elem, type, callback) {
    Events.bind(elem, type, callback);
  }

  off(elem, type, callback) {
    Event.unbind(elem, type, callback);
  }

  trigger(elem, type) {

  }

  /**
   * Binding events
   *
   *
   */
  static bind(elem, type, fn) {
    let guid = elem[expando];

    if( !guid ) {
      guid = elem[expando] = _id++;
      _eData.set(guid, { guid: guid });
    }

    let data = _eData.get(guid);
    let custom = _custom.get(type);
    fn.guid = guid;

    data.fn = fn;

    if( !custom || custom.setup(elem) === false ) {
      elem.addEventListener(type, fn, false);
    }

    return this;
  }

  static unbind(elem, type, callback) {
    elem.removeEventListener(type, callback, false);
  }

  static dispatch(elem, type) {

  }

  /**
   * Create new custom event
   */
  static customEvent(type, obj) {
    if( !obj.setup ) return;

    _custom.set(type, obj);
}

const SUPPORT_TOUCH = 'ontouchstart' in window;
const TOUCH_START = 'touchstart';
const TOUCH_END = 'touchend';
const TOUCH_MOVE = 'touchmove';

Events.customEvent('tap', {
  moveThreshold: 10,
  setup: (elem) => {
    Events.bind(elem, TOUCH_START, (e) => {
      let touch = e.touches[0];
      const startX = touch.pageX;
      const startY = touch.pageY;
      let handler = (e) => {
        let touch = e.touches[0];
        let isTapped = Math.abs(touch.pageY) - startY || Math.abs(touch.pageX) - startX;

        if( isTapped ) {
          Events.dispatch(elem);
        }
      };
      let clearHandler = (e) => {
        Events.unbind(elem, TOUCH_END, handler);
        Events.unbind(document, TOUCH_END, clearHandler);
      }

      Events.bind(elem, TOUCH_END, handler);
      Events.bind(document, TOUCH_END, clearHandler);
    });
  },

  teardown: (elem) => {

  }
});

export default Events;
