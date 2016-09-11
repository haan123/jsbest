import PopUp from './modules/PopUp';
import Bench from './modules/Bench';
import Github from './modules/Github';

require.ensure([], function() {
});

let _popup = new PopUp();

let _bench = new Bench(_popup);
let github = new Github(_popup);
