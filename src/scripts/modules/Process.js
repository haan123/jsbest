import C from '../utils/C';

const $ = C('dom').$;

class Process {
  constructor() {
    this.context = C('dom').$('iframe').contentWindow;
    this.context.document.body.innerHTML = '<script></script>';
    Benchmark = Benchmark.runInContext(this.context);
    this.context.Benchmark = Benchmark;

    this.initialize();
  }

  initialize() {
    let suite = this.suite = new Benchmark.Suite;
    suite.benchmarks = [];

    suite.on('add', (event) => {
      let bench = event.target,
          index = suite.benchmarks.length,
          id = index + 1;

      suite.benchmarks.push(bench);

      bench.on('start', this._start.bind(this));
      bench.on('start cycle', this._cycle.bind(this));
    })
    .on('start cycle', (event) => {
      console.log(event)
    })
    .on('complete', () => {
      let benches = Benchmark.filter(suite.benchmarks, 'successful'),
          fastest = Benchmark.filter(benches, 'fastest')[0],
          slowest = Benchmark.filter(benches, 'slowest')[0];

      // highlight result cells
      C('utils').forEach(benches, (bench) => {
        let fastestHz = this._hz(fastest),
            hz = this._hz(bench),
            percent = (1 - (hz / fastestHz)) * 100,
            text = 'fastest';

        if ( fastest.id === bench.id ) {

          // mark fastest
        } else {
          text = isFinite(hz)
            ? Benchmark.formatNumber(percent < 1 ? percent.toFixed(2) : Math.round(percent)) + '% slower'
            : '';

          // mark slowest
          if (slowest.id === bench.id ) {

          }
        }
      });
    });
  }

  /**
   * @private
   */
  _cycle(event) {
    var bench = event.target;

    if (!bench.aborted) {
      this._status(bench);
    }
  }

  /**
   * @private
   */
  _start() {

  }

  _status(bench) {
    const size = bench.stats.sample.length;
    const msg = '&times; ' + Benchmark.formatNumber(bench.count) + ' (' + size + ' sample' + (size == 1 ? '' : 's') + ')';

    $('sample-' + bench.name).lastChild.innerHTML = msg;
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

  error(msg) {

  }
}

export default Process;
