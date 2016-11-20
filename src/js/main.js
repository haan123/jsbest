import PopUp from './modules/PopUp';
import Bench from './modules/Bench';
import Sample from './modules/Sample';
import Setup from './modules/Setup';
import Github from './modules/Github';
import Process from './modules/Process';
import GA from './modules/GA';

require.ensure([], function() {
  window.CodeMirror = require('codemirror');
  require("../../node_modules/codemirror/mode/javascript/javascript.js");
  require("../../node_modules/codemirror/mode/xml/xml.js");
  require("../../node_modules/codemirror/addon/edit/closebrackets.js");
});

require.ensure([], function() {
  require("chart.js");
});

let _popup = new PopUp();
let _process = new Process();
let _bench = new Bench(_popup);
let _ga = new GA();

let github = new Github(_popup, _ga);
let setup = new Setup(_process, _bench, _popup);
let sample = new Sample(_process, _bench, _popup, github);

_bench.setup = setup;
_bench.sample = sample;
