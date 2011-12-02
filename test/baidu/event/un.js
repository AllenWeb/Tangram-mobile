module("baidu.event.un");

test("取消注册unload事件", function() {
	stop();
	ua.importsrc('baidu.event.on', function() {
		expect(1);
		var handle_a = function() {
			ok(true, "check unload");
			start();
		};
		var div = document.body.appendChild(document.createElement('div'));
		baidu.event.on(div, "click", handle_a);
		ua.click(div);
		baidu.event.un(div, "click", handle_a);
		ua.click(div);
		document.body.removeChild(div);
	}, 'baidu.event.on', 'baidu.event.un');
});

/**
 * 跨frame on然后un
 */
test("window resize", function() {
	expect(1);
	ua.frameExt({
		onafterstart : function(f) {
			$(f).css('width', 200);
		},
		ontest : function(w, f) {
			var op = this;
			var fn = function() {
				ok(true, 'check resize');
			};
			baidu.on(w, 'resize', fn);
			$(f).css('width', 220);
			/* 貌似通过jquery触发窗体变化会存在延时 */
			setTimeout(function() {
				baidu.un(w, 'resize', fn);
				$(f).css('width', 240);
				setTimeout(op.finish, 100);
			}, 500);
		}
	});
});

//测试大小写在on中一并做了
//test("test case sensitive", function() {
//	// ok(false, 'TODO: 添加大小写敏感事件的on绑定和un取消用例,比如DOMMouseScroll');
//	expect(1);
//	var div = document.createElement('div');
//	document.body.appendChild(div);
//	var listener = function() {
//		ok(true, '用DOMNodeInserted测试大小写敏感事件的un取消');
//	};
//	baidu.on(div, 'DOMNodeInserted', listener);
//	var div1 = document.createElement('div');
//	div.appendChild(div1);
//	baidu.un(div, 'DOMNodeInserted', listener);
//	var div2 = document.createElement('div');
//	div.appendChild(div2);
//	$(div).remove();
//});
