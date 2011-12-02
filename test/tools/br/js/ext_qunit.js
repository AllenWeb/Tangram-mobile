/**
 * 重载QUnit部分接口实现批量执行控制功能
 */
(function() {
	if (!QUnit)
		return;

	function _ms(args /* name, testEnvironment */) {
		if (parent.brtest)
			parent.brtest.starttime = new Date().getTime();
	}

	function _d(args /* failures, total */) {
		if (parent && parent.brtest) {
			var pKiss = parent.brtest.kiss;
			var wbkiss = parent.brtest.kisses[pKiss];
			// var kissPath = pKiss.split('.').join('/') + '.js';
			// var KissCov = [0];
			// if (!!window._$jscoverage)//如果参数里有cov=true
			// KissCov = window._$jscoverage;
			parent.$(parent.brtest).trigger(
					'done',
					[ new Date().getTime(), args[0],
							window._$jscoverage || null ]);
		}
	}

	var s = QUnit.testStart, e = QUnit.testDone, ms = QUnit.moduleStart, me = QUnit.moduleEnd, d = QUnit.done;
	QUnit.testStart = function() {
		// mySetup();
		s.apply(this, arguments);
	};
	QUnit.testDone = function() {
		e.apply(this, arguments);
		// myTeardown();
	};
	QUnit.moduleStart = function() {

		//这行代码会导致某些浏览器出现处理上的异常……
//		if (window && window['baidu'])
//			return;
		/* 为批量执行等待import.php正确返回 */
		var h = setInterval(function() {
			if (window && window['baidu']) {
				clearInterval(h);

				_ms(arguments);
				ms.apply(this, arguments);

				start();
			}
		}, 20);
		stop();
	};
	QUnit.moduleEnd = function() {
		me.apply(this, arguments);
	};
	QUnit.done = function() {
		_d(arguments);
		d.apply(this, arguments);
	};
})();