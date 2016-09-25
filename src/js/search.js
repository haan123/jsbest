import PopUp from './modules/PopUp';
import Bench from './modules/Bench';
import Sample from './modules/Sample';
import Github from './modules/Github';

require.ensure([], function() {
});

let _popup = new PopUp();

let _bench = new Bench(_popup);

let github = new Github(_popup);
github.sample = new Sample(null, _bench, _popup);
