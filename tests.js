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

testExport();
