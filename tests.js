var basicTest = function () {
	this['git://github.com/oatkiller/testingjs.git']();
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

	this['git://github.com/oatkiller/testingjs.git']();

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
