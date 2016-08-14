import utils from '../utils/utils';
import DOM from '../utils/dom';
import _ from 'lodash';

class Process {
  constructor() {
    this.iframe = DOM.$('iframe');
    let context = this.context = this.iframe.contentWindow;

    context.document.head.appendChild(DOM.toDOM('<script></script>'));
    Benchmark = Benchmark.runInContext(context);
    context.Benchmark = Benchmark;
    this.errorTmpl = DOM.$('error-templ').innerHTML;

    this.initialize();
  }

  initialize() {
    let suite = this.suite = new Benchmark.Suite();
    suite.benchmarks = [];

    suite.on('add', (event) => {
      let bench = event.target;

      suite.benchmarks.push(bench);

      bench.on('start', this._start.bind(this));
      bench.on('start cycle', this._cycle.bind(this));
    })
    .on('start cycle', (event) => {
    })
    .on('complete', this._complete.bind(this));
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
        return !bench.error && bench.reset();
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
  removeBench(name) {
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

  _start() {}

  /**
   * @private
   */
  _cycle(event) {
    var bench = event.target;

    if (!bench.aborted) {
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
      let error = bench.error;
      let slower;

      this._render(bench, row, error);

      if( !error ) {
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
      } else {
        rankClass = 'alert';
      }

      this._renderRankCell(rankCell, error ? this.errorTmpl : count, rankClass, slower, error);
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
