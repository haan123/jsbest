import Bench from './modules/Bench';
import Sample from './modules/Sample';
import Setup from './modules/Setup';
import Process from './modules/Process';

require.ensure([], function() {
  window.CodeMirror = require('codemirror');
  require("../../node_modules/codemirror/mode/javascript/javascript.js");
  require("../../node_modules/codemirror/mode/xml/xml.js");
  require("../../node_modules/codemirror/addon/edit/closebrackets.js");
});

require.ensure([], function() {
  require("chart.js");
});

let _process = new Process();
let _bench = new Bench();
let sample = new Sample(_process, _bench);
let setup = new Setup(_process, _bench);
