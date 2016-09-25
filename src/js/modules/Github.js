import Base from './Base';
import utils from '../utils/utils';
import DOM from '../utils/dom';

const config = {
  client_id: '11218ed60d09b213b537',
  api: 'https://api.github.com'
};

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

    this.popup = _popup;

    this.setTemplate(['login-form', 'user-menu', 'passcode-form', 'search-item', 'code']);

    this._user = this._getUser();

    let isSearch = this.isSearchPage();
    if( isSearch ) this._authenticate();

    if( this._user ) this.renderUser();
    if( isSearch ) this.initSearch();

    if( isSearch) this.search('@haan123');
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
      this._api(path).then((gists) => {
        let templ = this.template('search-item');

        utils.forEach(gists, (gist) => {
          let arr = [];
          utils.forEach(gist.files, (file) => {
            // create new sample object to add to sample list
            this.sample.prepareSampleButtonForGist(file);

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
  star() {
    let url = this.cel.getAttribute('href');

    this._api('put', url).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });
  }

  viewCode() {
    let elem = this.cel;
    let url = elem.getAttribute('data-raw');

    utils.ajax(url).then((code) => {
      let id = 1*(new Date());
      let lang = elem.getAttribute('data-language');

      let html = DOM.toDOM(this.template('code').render({
        language: lang,
        id: id
      }));

      elem.parentNode.insertBefore(html, elem);
      elem.parentNode.removeChild(elem);

      this.toStaticCode(id, code, lang);
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
    if( !this._accessToken ) return;
    let options = {};
    if( type[0] === '/' ) {
      path = type;
      params = path;
    } else {
      options.type = type;
    }

    options.url = config.api + path + '?access_token=' + this._accessToken;

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
    if( this.popup.hasPopUp() ) return;

    this.popup.dropdown(this.cel.parentNode, DOM.toDOM(this.template('user-menu').render(this._user)));
  }

  renderUser() {
    DOM.$('userMenu').style.display = 'inline-block';
  }

  signOut() {
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

      this.popup.nextView(this.cel, {
        ptype: 'set',
        pbutton: 'Secure My Token'
      }, this.template('passcode-form'));

      this.renderUser();
    }).catch((err) => {
      DOM.$('message').style.display = 'block';
    });
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

    this._accessToken = encoded[0];

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
      this.popup.closeModal();
    }).catch(() => {
      delete this._accessToken;
      DOM.$('message').style.display = 'block';
    });
  }

  _authenticate() {
    this._accessToken = 'f7c8a4c66fbd3e0384baf80ff398e452cb4f79e0';
    return true;

    let user = this._user;
    let needPasscode = user && user.hasPasscode;

    if( this._accessToken ) return true;

    if( needPasscode ) {
      this.enterPasscodeModal();
    } else {
      this.enterAccessTokenModal(true);
    }

    return false;
  }

  enterPasscodeModal() {
    this.popup.modal({
      title: 'Enter Passcode',
      ptype: 'enter',
      pbutton: 'Done'
    }, this.template('passcode-form'));
  }

  enterAccessTokenModal(isStack) {
    this.popup.modal({
      title: 'Enter Personal Access Token',
      ptype: 'enter',
      pbutton: 'Done'
    }, this.template('login-form'), isStack);
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
