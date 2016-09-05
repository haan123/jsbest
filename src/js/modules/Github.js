import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import hogan from 'hogan.js';

const config = {
  client_id: '11218ed60d09b213b537',
  api: 'https://api.github.com'
};

function encode(sand) {
  if( !this.id ) return;

  let accessToken = this._accessToken;
  let id = (1 * new Date()) + '';
  id = id.slice(-3) +  this.id;
  let length = id.length;

  let i = 0, len = sand.length;

  for( ; i < len; i++ ) {
    let c = +sand.charAt(i);
    let pos = id[c];
    let value = id[c + 1];

    accessToken = accessToken.substring(0, pos) + value + accessToken.substring(pos + 1, accessToken.length);
  }

  return accessToken;
}

class Github extends Base {
  constructor(_popup) {
    super({
      mid: 'github',
      events: {
        'click': '_click'
      }
    });

    this.popup = _popup;

    this.popGistChooseTempl = hogan.compile(DOM.$('pop-gist-choose-templ').innerHTML);
    this.gistIdFormTempl = hogan.compile(DOM.$('gist-id-form-templ').innerHTML);
    this.loginFormTempl = hogan.compile(DOM.$('login-form-templ').innerHTML);
    this.userMenuTempl = hogan.compile(DOM.$('user-menu-templ').innerHTML);

    this._user = this._getUser();

    if( this._user ) this.renderUser();
  }

  /**
   * Handle click for sample handler
   *
   * @private
   */
  _click(e) {
    const type = this.cel.getAttribute('data-type');
    if( !this[type]() ) e.preventDefault();
  }

  /**
   * Call api from path
   *
   * @param {String} path
   *
   * @return {Promise}
   */
  _api(path, params) {
    if( !this._accessToken ) return;
    let url = config.api + path + '?access_token=' + this._accessToken;

    let arr = [];
    for( let name in params ) {
      arr.push(name + '=' + params[name]);
    }

    if( arr.length ) {
      url += '&' + arr.join('&');
    }

    return utils.ajax(url);
  }

  userMenu() {
    if( this.popup.hasPopUp() ) return;

    this.popup.dropdown(this.cel.parentNode, DOM.toDOM(this.userMenuTempl.render(this._user)));
  }

  renderUser() {
    DOM.$('userMenu').style.display = 'inline-block';
  }

  signOut() {
    localStorage.removeItem('user');

    DOM.$('userMenu').style.display = 'none';

    delete this._user;
    delete this._accessToken;
  }

  signIn() {
    DOM.$('message').style.display = 'none';

    let accessToken = DOM.$('ace').value;

    if( !accessToken ) return;
    this._accessToken = accessToken;

    this._api('/user').then((user) => {
      this._user = {
        access_token: accessToken,
        avatar_url: user.avatar_url,
        name: user.name
      };

      localStorage.setItem('user', JSON.stringify(this._user));

      this.renderUser();
      this.popup.closeModal();
    }).catch((err) => {
      DOM.$('message').style.display = 'block';
    });
  }

  getUserGists(userName) {
    let url = config.api + '/users/' + userName + '/gists';

    return utils.ajax(url);
  }

  getGist(id) {
    let url = config.api + '/gists/' + id;

    return utils.ajax(url);
  }

  /**
   * Show gist popup
   *
   */
  gistPopup() {
    if( !this._user ) {
      this.popup.modal({
        title: 'Sign In'
      }, this.loginFormTempl);
    } else {
      this.popup.modal({
        title: 'Load Sample'
      }, this.popGistChooseTempl, true);
    }
  }

  openGistFromId() {
    this.popup.nextView(this.cel, {},this.gistIdFormTempl);

    let field = DOM.$('gist-id');

    this.on(field, 'keyup', (e) => {
      this.getGist(field.value).then((gist) => {
        this.status('success');
      }).catch((error) => {
        this.status('error');
      });
    });
  }

  loadGistFromId() {

  }

  /**
   * Get user
   *
   * @return {Object} user
   */
  _getUser() {
    let user = localStorage.getItem('user');

    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch(e) {}

    return user;
  }

}

export default Github;
