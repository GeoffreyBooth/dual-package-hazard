import { run } from 'x-core/module';

import x1 from 'x-es-module-plugin';
import x2 from 'x-commonjs-plugin';

try {
	console.log('Running ES module plugin:');
	run(x1);
	console.log('Success');
} catch (exception) {
	console.error(exception);
}

try {
	console.log('Running CommonJS plugin:');
	run(x2);
	console.log('Success');
} catch (exception) {
	console.error(exception);
}
