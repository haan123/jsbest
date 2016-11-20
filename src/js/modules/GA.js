import utils from '../utils/utils';

const GITHUB_EVENT = {
  hitType: 'event',
  eventCategory: 'GitHub'
};

class GA {
  /**
   * Analytics for star/unstar a gist
   *
   * @param {String} label - Star/Unstar
   */
  ghStar(label) {
    this._github('star', label);
  }

  /**
   * Analytics for searching
   *
   * @param {String} label - User Name/ID
   */
  ghSearch(label) {
    this._github('search', label);
  }

  /**
   * Analytics for Authentication
   *
   * @param {String} label - Log In/Log Out
   */
  ghAuth(label) {
    this._github('authenticate', label);
  }

  _github(action, label, value) {
    let data = utils.extend({}, GITHUB_EVENT);

    if( action ) data.eventAction = action;
    if( label ) data.eventLabel = label;
    if( value ) data.eventValue = value;

    if( window.ga) ga('send', data);
  }
}

export default GA;
