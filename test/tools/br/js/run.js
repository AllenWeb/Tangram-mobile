function run(kiss, runnext) {

	window.document.title = kiss;
	var wb = window.brtest = window.brtest || {};

	if (wb.kisses && wb.kisses[kiss + '_error']) {
		$('div#id_runningarea').empty().css('display', 'block').append(
				wb.kisses[kiss + 'error']);
		return;
	}

	wb.timeout = wb.timeout || 20000;
	wb.breakOnError = /breakonerror=true/gi.test(location.search)
			|| $('input#id_control_breakonerror').attr('checked');
	wb.runnext = /batchrun=true/gi.test(location.search) || runnext
			|| $('input#id_control_runnext').attr('checked');
	wb.kiss = kiss;
	var cid = 'id_case_' + kiss.split('.').join('_');
	/* 只有参数有showsrconly的时候才显示div */
	if (/showsrconly=true/gi.test(location.search)) {
		var div = document.getElementById('id_testlist_srconly');
		div.style.display = 'block';
	}
	/* id中由于嵌入用例名称，可能存在导致通过id直接$无法正确获取元素的情况 */
	wb.kissnode = $(document.getElementById(cid));
	wb.kisses = wb.kisses || {};
	var wbkiss = wb.kisses[wb.kiss] = wb.kisses[wb.kiss] || '';

	/**
	 * 超时处理
	 */
	var toh, tohf = function() {
		if (!window.brtest.breakOnError)
			$(window.brtest.kisses[window.brtest.kiss]).trigger('done',
					[ new Date().getTime(), [ 1, 1, 'timeout' ], [ 0 ] ]);
	};

	/**
	 * 为当前用例绑定一个一次性事件
	 */
	$(wbkiss)
			.one('done', function(event, a, b, cov) {
				clearTimeout(toh);
				var wb = window.brtest, errornum = b[0], allnum = b[1];
				var kissPerc;
				if (!!cov)// 如果支持覆盖率
						kissPerc = calCov(cov);
					wb.kissnode.removeClass('running_case');
					/*
					 * ext_qunit.js的_d方法会触发done事件 top.$(wbkiss).trigger('done', [
					 * new Date().getTime(), args ]); new
					 * Date().getTime()指向a参数，args指向b参数
					 */
					wb.kisses[wb.kiss] = /*
											 * a + ',' + wb.starttime + ',' +
											 */errornum + ',' + allnum + ',' + kissPerc;

					if (errornum > 0) {
						wb.kissnode.addClass('fail_case');
						// wb.kisses[kiss + '_error'] =
						// window.frames[0].innerHTML;
				} else
					wb.kissnode.addClass('pass_case');

				if (wb.runnext
						&& (!wb.breakOnError || parseInt(wb.kisses[wb.kiss]
								.split(',')[0]) == 0)) {
					var nextA = wb.kissnode[0].nextSibling;
					if (nextA.tagName == 'A') {
						run(nextA.title, wb.runnext);
					} else {
						/* 隐藏执行区 */
						// $('div#id_runningarea').toggle();
						/**
						 * 提取参数中的信息
						 * 
						 * @param param
						 * @return
						 */
						var br__search = function(param) {
							var params = location.search.substring(1)
									.split(',');
							for ( var i = 0; i < params.length; i++) {
								var p = params[i];
								if (p.split('=')[0] == param)
									return p.split('=')[1];
							}
							return '';
						};

						/* ending 提交数据到后台 */
						var browser = br__search('browser');
						wb.kisses['config'] = location.search.substring(1);
						/**
						 * 启动时间，结束时间，校验点失败数，校验点总数
						 */
						$.ajax( {
							url : 'record.php',
							type : 'post',
							data : wb.kisses,
							success : function(msg) {
								// $('#id_testlist').hide();
							/* 展示报告区 */
							$('#id_reportarea').show().html(msg);
						},
						error : function(xhr, msg) {
							alert('fail' + msg);
						}
						});
					}
				}
			});
	toh = setTimeout(tohf, wb.timeout);

	/**
	 * 初始化执行区并通过嵌入iframe启动用例执行
	 */
	var url = 'run.php?case=' + kiss;
	// + (location.search.length > 0 ? '&' + location.search.substring(1)
	// : '');

	/**
	 * 覆盖率支持的处理，暂时使用jscoverage框架运行
	 */
	// var cov = false;
	if (top.document.title == 'JSCoverage') {
		url += (url.indexOf("?") > 0 ? '&' : '?') + 'cov=true';
	}

	/**
	 * 为发布版本提供支持，在需要执行发布版本时，release=true即可
	 */
	if (location.search.indexOf("release=true") > 0) {
		url += (url.indexOf("?") > 0 ? '&' : '?') + 'release=true';
	}

	var fdiv = 'id_div_frame_' + kiss.split('.').join('_');
	var fid = 'id_frame_' + kiss.split('.').join('_');
	wb.kissnode.addClass('running_case');
	if ($('input#id_control_hidelist').attr('checked'))
		$('div#id_testlist').css('display', 'none');
	/* 隐藏报告区 */
	$('div#id_reportarea').empty().hide();
	/* 展示执行区 */
	$('div#id_runningarea').empty().css('display', 'block').append(
			'<iframe id="' + fid + '" src="' + url
					+ '" class="runningframe"></iframe>');
};

function calCov(fileCC) {
	var lineNumber;
	var num_statements = 0;
	var num_executed = 0;
	var missing = [];
	var length = fileCC.length;
	var currentConditionalEnd = 0;
	var conditionals = null;
	if (fileCC.conditionals) {
		conditionals = fileCC.conditionals;
	}
	for (lineNumber = 0; lineNumber < length; lineNumber++) {
		var n = fileCC[lineNumber];

		if (lineNumber === currentConditionalEnd) {
			currentConditionalEnd = 0;
		} else if (currentConditionalEnd === 0 && conditionals
				&& conditionals[lineNumber]) {
			currentConditionalEnd = conditionals[lineNumber];
		}

		if (currentConditionalEnd !== 0) {
			continue;
		}

		if (n === undefined || n === null) {
			continue;
		}

		if (n === 0) {
			missing.push(lineNumber);
		} else {
			num_executed++;
		}
		num_statements++;
	}

	var percentage = (num_statements === 0 ? 0 : parseInt(100 * num_executed
			/ num_statements));
	return percentage + '%';

}

/**
 * 为批量运行提供入口，参数携带batchrun=true
 */
$(document).ready(
		function() {
			if (location.href.search("[?&,]batchrun=true") > 0
					|| $('input#id_control_runnext').attr('checked')) {
				run($('div#id_testlist a').attr('title'), true);
			}
		});
