import Sample from './modules/Sample';
import Setup from './modules/Setup';
import Process from './modules/Process';

require.ensure([], function() {
  window.CodeMirror = require('codemirror');
  require("../../node_modules/codemirror/mode/javascript/javascript.js");
  require("../../node_modules/codemirror/mode/xml/xml.js");
  require("../../node_modules/codemirror/addon/edit/closebrackets.js");
});

let _process = new Process();
let sample = new Sample(_process);
let setup = new Setup(_process);
