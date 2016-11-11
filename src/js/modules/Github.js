import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';
import Promise from 'bluebird';

const config = {
  client_id: '11218ed60d09b213b537',
  api: 'https://api.github.com',
  raw_url: 'https://gist.githubusercontent.com',
  avatar: 'https://avatars.githubusercontent.com/u'
};

// need to add `.` because github does not allow personal access token to be embed in public repository
const PUBLIC_ACCESS_TOKEN = '5.25977683e0305126aa92929bc7bb6ead4f47d2f';
const PAT = 'passcode_access_token';

function makeSand(secret) {
  return (1 * new Date()).toString().slice(-3) + secret;
}

function makeId(sand, seq, pos) {
  sand = sand.split('');
  sand.splice(pos, 0, (seq.length + 1) + seq);

  return sand.join('');
}

function parseId(id, pos) {
  id = id.split('');
  let seq = id.splice(pos, +id[pos]).join('');

  return [id.join(''), seq.slice(1)];
}

function encode(secret, token, sand) {
  let newToken = token.split('');
  let arr = secret.split('');
  let seq = '.';

  utils.forEach(arr, (n) => {
    let p = parseInt(n) + parseInt(sand[n]);
    let s = Math.floor(Math.random() * (token.length - p));

    newToken.splice(s + p, 0, p);
    seq += ('0' + s).slice(-2);
  });

  newToken.push(seq);
  return newToken.join('');
}

function decode(secret, token, sand, seq) {
  let ret = token.split('');

  let arr = secret.split('');
  let i = arr.length;

  while( i-- ) {
    let n = +secret[i];
    let s = +seq.slice(2*i, 2*i + 2);
    let p = n + parseInt(sand[n]);

    ret.splice(s + p, p.toString().length);
  }

  return ret.join('');
}

const rqualifier = /[@#]([\w-]+)/;

class Github extends Base {
  constructor(_popup) {
    super({
      mid: 'github',
      events: {
        'click': '_click'
      }
    });

    this._publicAccessToken = PUBLIC_ACCESS_TOKEN.replace('.', '');

    this.popup = _popup;

    this.setTemplate(['login-form', 'user-menu', 'passcode-form', 'search-item', 'code', 'passcode-setting']);

    this._user = this._getUser();

    if( this._user ) {
      this._api('/user', {
        access_token: this._user.access_token
      }).then((user) => {
        this._accessToken = this._user.access_token;
      });
    }

    let isSearch = this.isSearchPage();

    if( this._user ) this.renderUser();
    if( isSearch ) this.initSearch();
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

  initSearch() {
    let field = this.searchField = DOM.$('search');
    field.focus();

    this.on(field, 'keyup', (e) => {
      let keyCode = e.get('keyCode');

      if( keyCode === 13 ) {
        this.search(field.value.trim());
      }
    });
  }

  search(value) {
    let results = DOM.$('search-results');
    let qualifier = value[0];
    let m = value.match(rqualifier);

    results.innerHTML = '';

    if( m ) {
      let path = '/gists';

      if( qualifier === '@' ) path = '/users/' + m[1] + path;
      else if( qualifier === '#' ) path = path + '/' + m[1];

      this._api(path).then(([gists]) => {
        let templ = this.template('search-item');

        gists = utils.isArray(gists) ? gists : [gists];

        utils.forEach(gists, (gist) => {
          let arr = [];

          utils.forEach(gist.files, (file) => {
            // create new sample object to add to sample list
            this.sample.prepareSampleButtonForGist(file, gist);

            arr.push(file);
          });

          gist.files = arr;
          gist.name = arr[0].filename;

          let item = templ.render(gist);
          results.appendChild(DOM.toDOM(item));
        });
      });
    }
  }

  /**
   * Handler: star gist
   */
  star(url, starred, elem) {
    if( !this._authenticate({
      scopes: 'gist'
    }) ) throw 'Not Athenticated';

    this.loader({
      target: elem,
      fullFill: true,
      indicator: 'secondary',
      options: ['small', 'inline']
    }).start();

    let method = 'PUT';
    if( starred ) method = 'DELETE';

    return this._api(method, url);
  }

  isStarred(id) {
    return this._api('/gists/' + id + '/star').then(() => {
      return 1;
    }).catch((err) => {
      return 0;
    });
  }

  viewCode() {
    let elem = this.cel;
    let url = elem.getAttribute('data-raw');

    this.loader({ target: elem, fullFill: true }).start();

    utils.ajax(url).then(([code]) => {
      let config = {
        code: code,
        id: 1*(new Date()),
        language: elem.getAttribute('data-language')
      };

      let html = DOM.toDOM(this.template('code').render(config));

      elem.parentNode.insertBefore(html, elem);
      elem.parentNode.removeChild(elem);

      this.toStaticCode(config);
    });
  }

  /**
   * Call api from path
   *
   * @param {String} path
   *
   * @return {Promise}
   */
  _api(type, path, params) {
    let options = {};
    if( type[0] === '/' ) {
      params = path;
      path = type;
    } else {
      options.type = type;
    }

    options.url = config.api + path;
    let token;

    if( params && params.access_token ) {
      token = (params && params.access_token) || this._accessToken;

      delete params.access_token;
    } else token = this._accessToken || this._publicAccessToken;

    if( token ) {
      options.url += '?access_token=' + token;
    }

    let arr = [];
    for( let name in params ) {
      arr.push(name + '=' + params[name]);
    }

    if( arr.length ) {
      options.url += '&' + arr.join('&');
    }

    return utils.ajax(options);
  }

  userMenu() {
    this.popup.dropdown({
      className: 'user-menu',
      partial: this.template('user-menu'),
      data: this._user
    }, this.cel.parentNode);
  }

  renderUser() {
    DOM.$('userMenu').style.display = 'inline-block';
  }

  signOut() {
    DOM.$('userMenu').style.display = 'none';

    delete this._user;
    delete this._accessToken;

    localStorage.removeItem('user');
  }

  auth() {
    DOM.$('message').style.display = 'none';

    let accessToken = DOM.$('ace').value;
    let requredScopes = this.cel.getAttribute('data-scope');

    if( !accessToken ) return;
    this._accessToken = accessToken;

    this._api('/user').then(([user, xhr]) => {
      let scopes = xhr.getResponseHeader('X-OAuth-Scopes');
      if( scopes.indexOf(requredScopes) < 0 ) {
        return Promise.reject();
      }

      this._user = {
        access_token: accessToken,
        avatar_url: user.avatar_url,
        name: user.name,
        scopes: scopes
      };

      localStorage.setItem('user', JSON.stringify(this._user));

      if( this.cel.getAttribute('data-stack') === 'true' ) {
        this.enterPasscodeView();
      } else this.popup.closeModal();

      this.renderUser();
    }).catch((err) => {
      DOM.$('message').style.display = 'block';
      console.log(this._accessToken);
      delete this._accessToken;
    });
  }

  passcodeSetting() {
    if( !this._authenticate() ) return;

    this.popup.modal({
      title: 'Passcode Setting'
    }, this.template('passcode-setting'), true);
  }

  setPasscode() {
    let secret = DOM.$('passcode').value;
    let n = Math.abs(+secret);
    let user = this._user;

    if( n !== n || secret.length > 5 || !user ) return;

    let sand = makeSand(secret);
    let encoded = encode(secret.slice(1), this._accessToken, sand).split('.');

    user.access_token = encoded[0];
    user.id = makeId(sand, encoded[1], +secret[0]);
    user.hasPasscode = true;

    localStorage.setItem('user', JSON.stringify(user));

    this.popup.closeModal();
  }

  enterPasscode() {
    let secret = DOM.$('passcode').value;
    let n = Math.abs(+secret);
    let user = this._user;

    if( n !== n || (secret.length / 5) !== 1 || !user ) return;

    let arr = parseId(user.id, +secret[0]);
    let token = decode(secret.slice(1), user.access_token, arr[0], arr[1]);

    this._accessToken = token;

    this._api('/user').then(() => {
      sessionStorage.setItem(PAT, token);

      this.popup.closeModal();
    }).catch(() => {
      delete this._accessToken;
      DOM.$('message').style.display = 'block';
    });
  }

  turnOffPasscode() {
    let user = this._user;

    user.access_token = this._accessToken;
    delete user.hasPasscode;

    localStorage.setItem('user', JSON.stringify(user));

    this.popup.closeModal();
  }

  enterPasscodeModal() {
    this.popup.modal({
      title: 'Passcode',
      ptype: 'enter',
      pbutton: 'Done'
    }, this.template('passcode-form'));
  }

  enterPasscodeView() {
    this.popup.nextView(this.cel, {
      ptype: 'set',
      pbutton: 'Secure My Token'
    }, this.template('passcode-form'));
  }

  enterAccessTokenModal(isStack, data) {
    this.popup.modal(utils.extend({
      title: 'Authentication',
      ptype: 'enter',
      pbutton: 'Done',
      stack: isStack
    }, data), this.template('login-form'), isStack);
  }

  toAvatarUrl(id) {
    return `${config.avatar}/${id}?v=3`;
  }

  toRawUrl(data) {
    if( !data.owner ) return '';

    return `${config.raw_url}/${data.owner.login}/${data.gid}/raw/${data.id}/${data.name}`;
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

  _authenticate(data) {
    if( this._accessToken ) return true;

    let user = this._user;
    let needPasscode = user && user.hasPasscode;

    if( needPasscode ) {
      let passcodeAccessToken = sessionStorage.getItem(PAT);
      if( passcodeAccessToken ) {
          this._accessToken = passcodeAccessToken;
          return true;
      }

      this.enterPasscodeModal();
    } else this.enterAccessTokenModal(true, data);

    return false;
  }

}

export default Github;
