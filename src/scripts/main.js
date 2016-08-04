import Sample from './modules/Sample';
import Setup from './modules/Setup';
import Process from './modules/Process';

let _process = new Process();
new Sample(_process);
new Setup(_process);
