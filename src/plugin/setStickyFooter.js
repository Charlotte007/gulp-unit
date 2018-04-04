
/*
    footer {
        width:100%; // position 
        visibility: 'hidden'; // 隐藏改变位置时，发生抖动，位置固定好之后会 显示 visible
    }
    为了计算的准确性，footer不能使用 margin来实现间隙，推荐使用padding，或者 prev 上一个元素实现间隙
    不要 使用 html.body{height:100%;}

    解决的痛点：
        1、 使用结构嵌套实现StickyFooter，响应式的footer高度不固定，会有错位
        2、 使用 flex布局，低版本不兼容的问题
        3、 使用clac计算， 低版本不兼容的问题， 而且CSS中不建议使用 clac / expression等计算属性
        4、 解决DOM动态变化的问题：display:none, remove, resize, loadMore, pullRefresh,tabclick,等导致 body的高度发生变化
       

		
	新的问题：
		
		如果页面的图片过多 就会 window.onload 就会很慢的，就会导致 footer很久才会显示出来 
		（极端情况下的： 网络就比较差的情况，）
		
*/
/*
    @ $footer   default: $('footer')  // JQ对象
    @ $tabsArr  // 选项卡等，会改变或者影响body高度的，所绑定的 JQ对象 // 默认只绑定了 click的事件，其他情况自行添加 
*/
setStickyFooter($('.footer'));
function setStickyFooter($footer, $tabsArr) { // loaded  MutationObserver resize  tabClick  loadMore Refresh
    var MutationObserver = (function () { // FF14+ ,Chrome26+ ,Opera15+ , IE11+, Safari6.1+
        var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
        for (var i = 0; i < prefixes.length; i++) {
            if (prefixes[i] + 'MutationObserver' in window) {
                return window[prefixes[i] + 'MutationObserver'];
            };
        };
        return false;
    }());
    // MutationObserver 相关
    var target = document.body;
    var observer;
    var config = {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true
    };

    if (MutationObserver) {
        observer = new MutationObserver(mutationObjectCallback); // callback  asyn
    };

    function mutationObjectCallback(mutationRecordsList) {
        stickyFooter();
    };

    function stickyFooter() {
        if (MutationObserver) {
            observer.disconnect();
        };
        var footerHeight = 0,
            footerTop = 0,
            $footer = $footer || $("footer");

        footerHeight = $footer.outerHeight(); // height + padding + border
        footerTop = ($(window).scrollTop() + $(window).height() - footerHeight) + "px";
        if (($(document.body).outerHeight()) < $(window).height()) {
            $footer.css({
                visibility: 'visible',
                position: "absolute",
                top: footerTop
            });
        } else {
            $footer.css({
                visibility: 'visible',
                position: "static"
            });
        };
        //reconnect
        if (MutationObserver) {
            observer.observe(target, config);
        };
    }

    // onload
    window.onload = function () {
        stickyFooter();
        if (MutationObserver) {
            observer.observe(target, config);
        } else {
            setInterval(stickyFooter, 500);
        };
    };
    // resize
    window.onresize = function () {
        stickyFooter();
    };
    // tabclick
    if (!!$tabsArr) {
        $tabsArr.click(stickyFooter);
    };
};
