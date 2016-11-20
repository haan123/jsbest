import utils from '../utils/utils';
import DOM from '../utils/dom';
import _ from 'lodash';

const DUMP_SCRIPT = document.createElement("script");

class Process {
  constructor() {
    this.iframe = DOM.$('iframe');
    let context = this.context = this.iframe.contentWindow;

    this.errorTmpl = DOM.$('error-templ').innerHTML;
    this.reloadIframe(this._queueForIframe(this._initSuite.bind(this)));
  }

  bmSetup(code) {
    if( !this._iframeIsReady ) {
      this._queueForIframe(() => {
        Benchmark.prototype.setup = code;
      });
    } else {
      Benchmark.prototype.setup = code;
    }
  }

  reloadIframe() {
    this._iframeIsReady = false;
    this.iframe.src = '';

    this.iframe.onload = this._iframeLoaded.bind(this);
  }

  /**
   * @private
   */
  run() {
    let suite = this.suite;
    var stopped = !suite.running;
    suite.abort();
    suite.length = 0;

    if( !suite.benchmarks.length ) return;

    if (stopped) {
      suite.push.apply(suite, _.filter(suite.benchmarks, function(bench) {
        return bench.reset();
      }));

      suite.run({
        'async': true,
        'queued': true
      });
    }
  }

  /**
   * Remove bench
   *
   * @public
   * @param {String} name
   */
  removeSuite(name) {
    let suite = this.suite;
    let benches = suite.benchmarks;

    for( let i = 0, len = benches.length; i < len; i++ )  {
      let bench = suite[i];

      if( name === benches[i].name ) {
        if( bench && bench.name === name ) {
          suite.splice(i, 1);
        }

        benches.splice(i, 1);

        return true;
      }
    }

    return false;
  }

  /**
   * Add suite, queued if iframe not ready yet
   *
   * @param {String} name
   * @param {String} code
   */
  addSuite(name, code) {
    if( !this._iframeIsReady ) {
      this._queueForIframe(() => {
        this.suite.add(name, code);
      });
    } else {
      this.suite.add(name, code);
    }
  }

  /**
   * Refresh context for suites
   */
  refreshSuite() {
    let benches = this.suite ? this.suite.benchmarks : [];
    delete this.suite;

    let newSuite = this._initSuite();

    utils.forEach(benches, (bench) => {
      newSuite.add(bench.name, bench.fn);
    });
  }

  _initSuite() {
    let suite = this.suite = new Benchmark.Suite(new Date().getTime());
    suite.benchmarks = [];

    suite.on('add', (event) => {
      let bench = event.target;

      suite.benchmarks.push(bench);

      bench.on('start', this._start.bind(this));
      bench.on('start cycle', this._cycle.bind(this));
    })
    .on('start cycle', (event) => {
      let bench = event.target;
      let error = bench.error;

      if( error ) {
        let row = DOM.$('sample-' + bench.name);
        let rankCell = row.firstChild.nextSibling;

        this._render(bench, row, error);
        this._renderRankCell(rankCell, this.errorTmpl, 'alert', null, error);
      }
    })
    .on('complete', this._complete.bind(this));

    return suite;
  }

  _queueForIframe(fn) {
    let queue = this._iframeQueue || [];

    queue.push(fn);
    this._iframeQueue = queue;
  }

  _iframeLoaded() {
    let context = this.context;
    Benchmark = Benchmark.runInContext(context);
    context.Benchmark = Benchmark;

    context.document.head.appendChild(DUMP_SCRIPT);

    if( this._iframeQueue ) {
      utils.forEach(this._iframeQueue, (fn) => {
        fn();
      });

      delete this._iframeQueue;
    }
    
    this.refreshSuite();

    this._iframeIsReady = true;
  }

  /**
   * @private
   */
  _start() {}

  /**
   * @private
   */
  _cycle(event) {
    let bench = event.target;
    let error = bench.error;

    if ( !bench.aborted ) {
      this._status(bench);
    }
  }

  _status(bench) {
    const size = bench.stats.sample.length;
    const msg = '&times; ' + Benchmark.formatNumber(bench.count) + ' (' + size + ' sample' + (size == 1 ? '' : 's') + ')';

    DOM.$('sample-' + bench.name).lastChild.innerHTML = msg;
  }

  /**
   * Gets the Hz, i.e. operations per second, of `bench` adjusted for the
   * margin of error.
   *
   * @private
   * @param {Object} bench The benchmark object.
   * @returns {number} Returns the adjusted Hz.
   */
  _hz(bench) {
    return 1 / (bench.stats.mean + bench.stats.moe);
  }

  /**
   * Handle complete test
   *
   * @private
   */
  _complete() {
    let benches = this.suite.benchmarks;
    let sorted = this._sort(benches);
    let count = 0;

    let bound = this._getBoundBenches(sorted);

    // highlight result cells
    utils.forEach(sorted, (bench, index) => {
      let row = DOM.$('sample-' + bench.name);
      let nameCell = row.firstChild;
      let rankCell = nameCell.nextSibling;
      let rankClass = 'warning';
      let slower;

      this._render(bench, row, null);

      if( !bench.error ) {
        let fastestHz = this._hz(sorted[bound.fastest]),
            hz = this._hz(bench),
            percent = (1 - (hz / fastestHz)) * 100;

        if ( index === bound.fastest ) {
          rankClass = 'success';
          count++;
        } else {
          slower = isFinite(hz) ? Benchmark.formatNumber(percent < 1 ? percent.toFixed(2) : Math.round(percent)) : '';

          // mark slowest
          if ( index === bound.slowest ) {
            rankClass = 'alert';
          }

          count++;
        }

        this._renderRankCell(rankCell, count, rankClass, slower, null);
      }
    });
  }

  _render(bench, row, error) {
    var hz = bench.hz;

    let cell = row.lastChild;

    // reset title and class
    row.title = '';

    if (error) {
      row.title = bench.error;
      cell.innerHTML = '<small class="cell-ops__error">' + error + '</small>';
    } else {
      if (bench.cycles) {
        row.title = 'Ran ' + Benchmark.formatNumber(bench.count) + ' times in ' +
          bench.times.cycle.toFixed(3) + ' seconds.';

        cell.innerHTML = Benchmark.formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) + '<br><small>&plusmn;' + bench.stats.rme.toFixed(2) + '%</small>';
      }
    }
  }

  /**
   * Return fastest and slowest bench
   *
   * @private
   * @param {Object} benches
   *
   * @return {Object} obj
   */
  _getBoundBenches(benches) {
    let obj = {};
    let i = 0;
    let bench;

    while( (bench = benches[i]) ) {
      if( !bench.error ) {
        if( typeof obj.fastest !== 'number' ) obj.fastest = i;

        obj.slowest = i;
      }

      i++;
    }

    return obj;
  }

  /**
   * Sort benches
   * Referenced from filter method in benchmark library
   *
   * @private
   * @param {Object} benches
   * @return {Array} sorted
   */
  _sort(benches) {
    let sorted = benches.slice().sort(function(a, b) {
      a = a.stats; b = b.stats;
      return (a.mean + a.moe > b.mean + b.moe ? 1 : -1);
    });

    return sorted;
  }

  /**
   * Render rank cell
   *
   * @private
   * @param {Node} cell
   * @param {Number} rank
   * @param {String} className
   * @param {String} slower
   * @param {Boolean} error
   *
   */
  _renderRankCell(cell, rank, className, slower, error) {
    cell.innerHTML = '<span class="badge animated ' + className + '">' + rank + '</span>' + (!error && slower ? '<br><small>%' + slower + ' slower</small>' : '');

    // animate
    cell.firstChild.className += ' bounce-in';
  }
}

export default Process;
