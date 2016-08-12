import Handler from '../utils/handler';
import utils from '../utils/utils';
import DOM from '../utils/dom';

class Dialog extends Handler {
  constructor(process) {
    super({
      mid: 'dialog',
      events: {
        'click': '_click'
      }
    });
  }

  /**
   * Handle click for sample handler
   *
   * @private
   */
  _click(e) {
    const type = this.cel.getAttribute('data-type');

    this[type]();
  }

  open() {
    
  }

  close() {

  }

}

export default Dialog;
