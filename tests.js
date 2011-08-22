if (typeof module !== 'undefined') {
	var Testing = require('./testing');
} else {
	var Testing = {};
	this['git://github.com/oatkiller/testingjs.git'](Testing);
}

var Runner = Testing.Runner;
var Test = Testing.Test;
var Assert = Testing.Assert;
var Suite = Testing.Suite;
var Resume = Testing.Resume;
var Wait = Testing.Wait;

var basicTest = function () {
	var runner = new Runner();
	var suite = new Suite({
		runner : runner,
		'1+1 should not equal 3' : function () {
			Assert(1+1!==3,'they did equal 3');
		},
		// this should fail
		'1+1 should equal 3' : function () {
			Assert(1+1===3,'they didnt equal 3');
		}
	});
	suite.run();
};
basicTest();

if (typeof module === 'undefined') {
	var testExport = function () {
		var testing = {};
		this['git://github.com/oatkiller/testingjs.git'](testing);

		var runner = new testing.Runner();
		var suite = new testing.Suite({
			runner : runner,
			'1+1 should not equal 3' : function () {
				testing.Assert(1+1!==3,'they did equal 3');
			},
			// this should fail
			'1+1 should equal 3' : function () {
				testing.Assert(1+1===3,'they didnt equal 3');
			}
		});
		suite.run();
	};
	testExport();
}

var testSetupAndTearDown = function () {
	// In this example, I'll test the methods of a class

	// A Widget class that has children
	var Widget = function () {
		this.children = [];
	};

	// a hasChildren method that will return true if the widget has children
	Widget.prototype.hasChildren = function () {
		return this.children.length > 0;
	};

	var runner = new Runner();

	var suite = new Suite({
		runner : runner,

		// define the optional setUp method
		// this will be run before each test
		setUp : function () {
			// we will use a new widget for each test
			this.widget = new Widget();
		},

		// define the optional tearDown method
		// this will be run after each test
		tearDown : function () {
			// destroy the widget that we just used
			delete this.widget;
		},
		'hasChildren should return true if a widget has 1 child' : function () {

			// add a child
			this.widget.children.push({});

			// test the method
			Assert(this.widget.hasChildren() === true,'hasChildren did not return true when widget had 1 child');
		},
		'hasChildren should return false if a widget has 0 children' : function () {
			// test the method
			Assert(this.widget.hasChildren() === false,'hasChildren returned true when widget had 0 children');
		}
	});
	suite.run();
};
testSetupAndTearDown();

var testWait = function () {
	var runner = new Runner();

	var suite = new Suite({
		runner : runner,

		'wait should not fail if resume is called' : function () {
			Wait(setTimeout(function () {
				Resume();
			},100),110);
		},

		'wait should assert false after default time if nothing happens' : function () {
			Wait(setTimeout(function () {
				Resume();
			},100),90);
		},

		'wait should not fail if resume is called try again' : function () {
			Wait(setTimeout(function () {
				Resume();
			},100),110);
		},

		'asserting false works too' : function () {
			Wait(setTimeout(function () {
				Assert(false,'asserted false');
			},100),110);
		},

		'wait should not fail if resume is called try again again' : function () {
			Wait(setTimeout(function () {
				Resume();
			},100),110);
		},

		'wait should fail if resume is not called in time try again' : function () {
			Wait(setTimeout(function () {
				Resume();
			},100),90);
		},

		'wait will cancel if resume is called' : function () {
			Wait(setTimeout(function () {
				Resume();
			},10),10000000);
		},

		'timeouts throw a timeout error' : function () {
			Wait(setTimeout(function () {
				// never gets called
				Resume();
			},10000000),1);
		}
	});
	suite.run();
};
testWait();

var testHelpers = function () {
	var runner = new Runner();

	var suite = new Suite({
		runner : runner,

		thisTotesDidnt : function () {
			Assert(false,'it ran, bro');
		},

		'this ran' : function () {
			Assert(1 === 1,'yeaaa!');
		}
	});
	suite.run();
};
testHelpers();
