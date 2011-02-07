// closure to protect global scope
// call with no argument to pollute or pass an object to export into it
this['git://github.com/oatkiller/testingjs.git'] = function (exportObj) {
	// define some utility functions

	// call fn, in scope, once for each element or property in obj, passing property, propertyName, and obj
	var map = function (obj,fn,scope) {
		// create an array to store the results
		var map = [];

		// if the obj that we are iterating is an array
		if (obj instanceof Array) {
			// loop over its numeric indicies
			for (var i = 0; i < obj.length; i++) {
				// store the result of calling the fn
				map.push(fn.call(scope,obj[i],i,obj));
			}
		} else {
			// loop of its named properties
			for (var propertyName in obj) {
				// only if the are on the object itself
				if (obj.hasOwnProperty(propertyName)) {
					// store the result of calling the fn
					map.push(fn.call(scope,obj[propertyName],propertyName,obj));
				}
			}
		}

		// return the map
		return map;
	};

	// return an object that inherits from prototype and has the properties in properties
	var createObject = function (prototype,properties) {
		// create an anonymous constructor
		var Constructor = function () {};

		// set its prototype to the passed prototype
		Constructor.prototype = prototype;

		// set the prototype's constructor property
		prototype.constructor = Constructor;

		// create a new object
		var obj = new Constructor();

		// loop over each property in properties, and assign these to the new object
		map(properties,function (property,propertyName) {
			this[propertyName] = property;
		},obj);

		// return newly created object
		return obj;
	};

	// if addDefaultListener is not false, a default listener will be added that logs test results to console.log
	var Runner = function (addDefaultListener) {
		this.listeners = [];
		// add the default listener, unless explicitly told not to
		addDefaultListener !== false && this.addListener(function (messageType,payload) {
			if (messageType !== 'report') {
				console.log(messageType,':',payload.should,payload.e ? payload.e : '');
			} else {
				console.log(messageType,': success: ',payload.successCount,' failure: ',payload.failureCount);
			}
		});
	};

	Runner.prototype = {
		constructor : Runner,
		successCount : 0,
		failureCount : 0,
		log : function (result,test,e) {
			// increment the successes or failures count
			result === 'success' ? this.successCount++ : this.failureCount++;

			// call the listeners
			map(this.listeners,function (listener) {
				listener.fn.call(listener.scope,result,createObject(test,{e : e}));
			},this);
		},
		// add a new listener
		addListener : function (fn,scope) {
			this.listeners.push({
				fn : fn,
				scope : scope
			});
		},
		// a function that logs a report
		report : function () {
			// call the listeners
			map(this.listeners,function (listener) {
				listener.fn.call(listener.scope,'report',{
					successCount : this.successCount,
					failureCount : this.failureCount
				});
			},this);

		}
	};

	var Assert = function (passed,message) {
		if (!passed) {
			throw new Error(message);
		}
	}

	var Test = function (config) {
		map(config,function (fn,should) {
			this.fn = fn;
			this.should = should;
		},this);
	};

	Test.prototype = {
		constructor : Test,
		run : function (scope) {
			this.fn.call(scope);
		}
	};

	var Suite = function (config) {
		// Create a tests array to hold tests that belong to this suite
		this.tests = [];

		// save a reference to the runner
		this.runner = config.runner;
		this.setUp = config.setUp;
		this.tearDown = config.tearDown;

		// delete the non-test properties from the config
		delete config.runner;
		delete config.setUp;
		delete config.tearDown;

		// add the rest of the config as tests
		this.addTests(config);
	};

	// Suite inherits from test
	Suite.prototype = createObject(Test.prototype,{
		addTests : function (config) {
			map(config,function (property,propertyName) {
				// define a new test config
				var testConfig = {};

				// set the test at the name
				testConfig[propertyName] = config[propertyName];

				// create and add the test
				this.tests.push(new Test(testConfig));
			},this);
		},
		// a method that runs all a Suite's tests
		run : function () {
			// loop over all of the numeric indicies of this.tests

			map(this.tests,function (test) {
				// run the setup
				this.setUp && this.setUp.call(this);
				
				// call test in this scope
				try {
					// run the test, passing this as a scope
					test.run(this);

					// log the success
					this.runner.log('success',test);
				} catch (e) {
					// log the failure
					this.runner.log('failure',test,e);
				} finally {
					// run the teardown
					this.tearDown && this.tearDown.call(this);
				}
			},this);

			this.runner.report();
		}
	});

	// if an export obj was provided, use that
	if (exportObj) {
		exportObj.Test = Test;
		exportObj.Suite = Suite;
		exportObj.Runner = Runner;
		exportObj.Assert = Assert;
	} else {
		// otherwise, export these to the global namespace
		this.Test = Test;
		this.Suite = Suite;
		this.Runner = Runner;
		this.Assert = Assert;
	}
};
