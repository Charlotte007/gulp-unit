(function ($) {
	$(document).on('click', 'a#goon', function () {
		$("#ie-alert-overlay").hide();
		$("#ie-alert-panel").hide();
	});
	function initialize($obj, support, title, text) {
		var panel = "<span>" + title + "</span>" +
			"<p>" + text + "</p>" +
			"<div class='browser'>" +
			"<ul>" +
			"<li><a class='chrome' href='https://www.google.com/chrome/' target='_blank' rel='nofollow'></a></li>" +
			"<li><a class='firefox' href='http://www.mozilla.org/en-US/firefox/new/' target='_blank' rel='nofollow'></a></li>" +
			"<li><a class='ie9' href='https://support.microsoft.com/zh-cn/help/17621/internet-explorer-downloads' target='_blank' rel='nofollow'></a></li>" +
			"<li><a class='safari' href='https://support.apple.com/zh_CN/downloads/safari' target='_blank' rel='nofollow'></a></li>" +
			"<li><a class='opera' href='http://www.opera.com/download/' target='_blank' rel='nofollow'></a></li>" +
			"<ul>" +
			"</div>";
		var overlay = $("<div id='ie-alert-overlay'></div>");
		var iepanel = $("<div id='ie-alert-panel'>" + panel + "</div>");
		var docHeight = $(document).height();
		overlay.css("height", docHeight + "px");
		if (support === "ie9") { // ie9-
			if ($.browser.msie && parseInt($.browser.version, 10) < 10) {
				$obj.prepend(iepanel);
				$obj.prepend(overlay);
			}
			if ($.browser.msie && parseInt($.browser.version, 10) === 6) {
				$("#ie-alert-panel").css("background-position", "-626px -116px");
				$obj.css("margin", "0");
			}

		} else if (support === "ie8") { // ie8-
			if ($.browser.msie && parseInt($.browser.version, 10) < 9) {
				$obj.prepend(iepanel);
				$obj.prepend(overlay);
			}
			if ($.browser.msie && parseInt($.browser.version, 10) === 6) {
				$("#ie-alert-panel").css("background-position", "-626px -116px");
				$obj.css("margin", "0");
			}
		} else if (support === "ie7") { // ie7-
			if ($.browser.msie && parseInt($.browser.version, 10) < 8) {
				$obj.prepend(iepanel);
				$obj.prepend(overlay);
			}
			if ($.browser.msie && parseInt($.browser.version, 10) === 6) {
				$("#ie-alert-panel").css("background-position", "-626px -116px");
				$obj.css("margin", "0");
			}
		} else if (support === "ie6") { // ie6-
			if ($.browser.msie && parseInt($.browser.version, 10) < 7) {
				$obj.prepend(iepanel);
				$obj.prepend(overlay);
				$("#ie-alert-panel").css("background-position", "-626px -116px");
				$obj.css("margin", "0");
			}
		}
	};
	$.fn.iealert = function (options) {
		var defaults = {
			support: "ie7",
			title:'\u6e29\u99a8\u63d0\u793a\uff1a\u60a8\u4f7f\u7528\u7684\u6d4f\u89c8\u5668\u7248\u672c\u8fc7\u4f4e\uff0c\u8bf7\u5347\u7ea7\u6d4f\u89c8\u5668\uff01',
			text: "\u4e3a\u4e86\u66f4\u597d\u7684\u7f51\u7ad9\u6d4f\u89c8\u4f53\u9a8c\u002c\u6211\u4eec\u5f3a\u70c8\u5efa\u8bae\u60a8\u5347\u7ea7\u5230\u6700\u65b0\u7248\u672c\u7684\u0049\u006e\u0074\u0065\u0072\u006e\u0065\u0074\u0020\u0045\u0078\u0070\u006c\u006f\u0072\u0065\u0072\u6216\u9009\u62e9\u5176\u4ed6\u4e3b\u6d41\u6d4f\u89c8\u5668\u3002\u63a8\u8350\u4f7f\u7528\u4e0b\u5217\u4e3b\u6d41\u6d4f\u89c8\u5668\uff1a <br><br><a href='javascript:;' style='font-size:20px;' id='goon'>>>>\u7EE7\u7EED\u8BBF\u95EE</a>"
		};
		var option = $.extend(defaults, options);
		return this.each(function () {
			if ($.browser.msie) {
				var $this = $(this);
				initialize($this, option.support, option.title, option.text);
			}
		});
	};
})(jQuery);
$(document).ready(function () {$("body").iealert();});