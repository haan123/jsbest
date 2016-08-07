import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

const WORKING_NAME = 'working';
const CASES_NAME = 'cases';

class Case extends Base {
  constructor(process) {
    super({
      mid: 'case',
      events: {
        'click': '_click'
      }
    });

    // get cached cases
    try {
      this.cases = JSON.parse(localStorage.getItem('cases'));
    } catch(e) {}

    if( !this.cases ) {
      this.cases = [];
      localStorage.setItem(CASES_NAME, JSON.stringify(this.cases));
    }
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

  /**
   * Store case event handler
   * @public
   */
  saveCase() {
    let name = DOM.$('case-name');
    let _case = this.getWorkingCase();

    samples.push(data);

    this.setCaseItem(_case, name);
  }

  /**
   * Remove case event handler
   * @public
   *
   */
  removeCase() {
    let id = this.cel.getAttribute('data-uid');

    this._removeCaseItem(id);
  }


  /**
   * Get test case from local storage
   * @public
   *
   * @param  {String} name
   * @return {Object} _case
   */
  getCaseItem(name) {
    let _case;

    try {
      _case = JSON.parse(localStorage.getItem(name));
    } catch(e) {}

    return _case;
  }

  /**
   * Return lastest case
   * @public
   *
   * @return {Object}
   */
  getWorkingCase() {
    let name = this._working || (this._working = WORKING_NAME);
    let working = this.getCaseItem(name);

    if( !working ) {
      working = this.setCaseItem({ setup: {}, samples: []}, name);
    }

    return working;
  }

  /**
   * Add/Updage new jsbest local storage item
   * @public
   *
   * @param {Object} data
   */
  setCaseItem(data, name) {
    name = name || this._working;
    let cases = this.cases;

    this.removeFromArray(name, cases);
    this._removeCaseItem(name);
    cases.push(name);

    this._working = name;

    localStorage.setItem(CASES_NAME, JSON.stringify(cases));
    return localStorage.setItem(name, JSON.stringify(data));
  }

  /**
   * Remove Case item
   * @private
   *
   * @param {String} name
   */
  _removeCaseItem(name) {
    let cases = this.cases;
    this.removeFromArray(name, cases);

    localStorage.setItem(CASES_NAME, JSON.stringify(cases));
    return localStorage.removeItem(name);
  }
}

export default Case;
