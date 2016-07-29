import Handler from '../utils/handler';
import C from '../utils/C';

const rt = /(\{([\w]+)\})/g;
class Sample extends Handler {
  constructor(process, caseCode, setup) {
    super({
      mid: 'case',
      events: {
        'click': '_click'
      }
    });

    this.caseCodeEditor = caseCode;
    this.setupEditor = setup;
    this.suite = process.suite;
    this.context = process.context

    this.nameField = C('dom').$('case-name');
    this.process = C('dom').$('process');
    this.template = C('dom').$('process-row-templ').innerHTML;
  }

  _click(e) {
    const type = this.cel.getAttribute('data-type');

    this[type]();
  }

  _exist(name) {
    const benches = this.suite.benchmarks;
    let i = benches.length - 1;

    do {
      if( benches[i].name === name ) return true;
    } while( i-- )

    return false;
  }

  setup() {
    let html = this.setupEditor.getValue();

    if( html ) {
      this.context.document.body.innerHTML += html;
      this.hasContext = true;
    } else {
      this.hasContext = false;
    }
  }

  /**
   * Add more sample
   *
   * @public
   */
  add() {

  }

  /**
   * Save sample
   *
   * @public
   */
  save() {
    const name = this.nameField.value;
    const code = this.caseCodeEditor.getValue();

    if( !name|| !code || this._exist(name) ) return;

    this.suite.add(name, code);

    this.renderRow({
      name: name
    });
  }

  run() {
    this.suite.run({
      'async': true,
      'queued': true
    });
  }

  renderRow(obj) {
    let row = C('dom').toDOM(this.template.replace(rt, (a, m, name) => {
      return obj[name];
    }));

    this.process.appendChild(row);
  }
}

export default Sample;
