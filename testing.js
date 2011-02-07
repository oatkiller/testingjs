// Closure to protect global scope
// Call with no argument to pollute or pass an object to export into it
this['git://github.com/oatkiller/testingjs.git'] = function (exportObj) {
	// Define some utility functions

	// Call fn, in scope, once for each element or property in obj, passing property, propertyName, and obj
	var map = function (obj,fn,scope) {
		// Create an array to store the results
		var map = [];

		// If the obj that we are iterating is an array
		if (obj instanceof Array) {
			// Loop over its numeric indicies
			for (var i = 0; i < obj.length; i++) {
				// Store the result of calling the fn
				map.push(fn.call(scope,obj[i],i,obj));
			}
		} else {
			// Loop of its named properties
			for (var propertyName in obj) {
				// Only if the are on the object itself
				if (obj.hasOwnProperty(propertyName)) {
					// Store the result of calling the fn
					map.push(fn.call(scope,obj[propertyName],propertyName,obj));
				}
			}
		}

		// Return the map
		return map;
	};

	// If addDefaultListener is not false, a default listener will be added that logs test results to console.log
	var Runner = function (addDefaultListener) {
		this.listeners = [];
		// Add the default listener, unless explicitly told not to
		addDefaultListener !== false && this.addListener(function (messageType,payload) {
			if (messageType !== 'report') {
				console.log(messageType,':',payload.assertionText,payload.error ? payload.error : '');
			} else {
				console.log(messageType,': success: ',payload.successCount,' failure: ',payload.failureCount);
			}
		});
	};

	Runner.prototype = {
		constructor : Runner,
		successCount : 0,
		failureCount : 0,
		log : function (result,test,error) {
			// Increment the successes or failures count
			result === 'success' ? this.successCount++ : this.failureCount++;

			// Call the listeners
			map(this.listeners,function (listener) {
				listener.handler.call(listener.scope,result,{testFn : test.testFn, assertionText : test.assertionText, error : error});
			},this);
		},
		// Add a new listener
		addListener : function (handler,scope) {
			this.listeners.push({
				handler : handler,
				scope : scope
			});
		},
		// A function that logs a report
		report : function () {
			// Call the listeners
			map(this.listeners,function (listener) {
				listener.handler.call(listener.scope,'report',{
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

	var Test = function (assertionText,testFn) {
		this.testFn = testFn;
		this.assertionText = assertionText;
	};

	Test.prototype = {
		constructor : Test,
		run : function (scope) {
			this.testFn.call(scope);
		}
	};

	var Suite = function (config) {
		// Create a tests array to hold tests that belong to this suite
		this.tests = [];

		// Save a reference to the runner
		this.runner = config.runner;
		this.setUp = config.setUp;
		this.tearDown = config.tearDown;

		// Delete the non-test properties from the config
		delete config.runner;
		delete config.setUp;
		delete config.tearDown;

		// Add the rest of the config as tests
		this.addTests(config);
	};

	// Suite inherits from test
	Suite.prototype = {
		constructor : Suite,
		addTests : function (config) {
			map(config,function (property,propertyName) {
				// create and add each Test
				this.tests.push(new Test(propertyName,config[propertyName]));
			},this);
		},
		// A method that runs all a Suite's tests
		run : function () {
			// Loop over all of the numeric indicies of this.tests

			map(this.tests,function (test) {
				// Run the setup
				this.setUp && this.setUp.call(this);
				
				// Call test in this scope
				try {
					// Run the test, passing this as a scope
					test.run(this);

					// Log the success
					this.runner.log('success',test);
				} catch (error) {
					// Log the failure
					this.runner.log('failure',test,error);
				} finally {
					// Run the teardown
					this.tearDown && this.tearDown.call(this);
				}
			},this);

			this.runner.report();
		}
	};

	// If an export obj was provided, use that
	if (exportObj) {
		exportObj.Test = Test;
		exportObj.Suite = Suite;
		exportObj.Runner = Runner;
		exportObj.Assert = Assert;
	} else {
		// Otherwise, export these to the global namespace
		this.Test = Test;
		this.Suite = Suite;
		this.Runner = Runner;
		this.Assert = Assert;
	}
};
