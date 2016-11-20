import PopUp from './modules/PopUp';
import Bench from './modules/Bench';
import Sample from './modules/Sample';
import Github from './modules/Github';
import GA from './modules/GA';

require.ensure([], function() {
});

let _popup = new PopUp();
let _ga = new GA();

let _bench = new Bench(_popup);

let github = new Github(_popup, _ga);
github.sample = new Sample(null, _bench, _popup, github);
