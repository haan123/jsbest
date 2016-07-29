import Sample from './modules/Sample';
import Process from './modules/Process';
import CodeMirror from 'codemirror';
import C from './utils/C';

let editorConfig = {
  lineNumbers: true,
  tabSize: 2,
  styleActiveLine: true,
  autoCloseBrackets: true,
  viewportMargin: Infinity
};

let caseCode = CodeMirror.fromTextArea(document.getElementById('case-code'), editorConfig);


let setup = CodeMirror.fromTextArea(document.getElementById('setup'), C('utils').extend({}, editorConfig, {
  mode : "xml",
  htmlMode: true,
  viewportMargin: Infinity,
  readOnly: "nocursor"
}));

let _process = new Process();
let _case = new Sample(_process, caseCode, setup);
