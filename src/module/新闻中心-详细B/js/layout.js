$(function () {
    function getFixeaderH($header) {
        var $pageHeader = $header || $('header ,.header');
        return $pageHeader.css('position') === 'fixed' ? $pageHeader.outerHeight() : 0;
    };
    function setdetailBShareFixed() {
        var $article = $('.newsdetailB-article');
        $share = $('.newsdetailB-bdshare');
        var _shareCssTop = getFixeaderH() + 76;
        var _shareCssBot = 55;
        var _shareTop = $article.length ? $article.offset().top - getFixeaderH() : 0;
        var _shareEnd = _shareTop + $article.outerHeight() - ($share.outerHeight() + _shareCssTop + _shareCssBot);
        var _scrTop = 0;
        $(window).resize(function () {
            _shareTop = $article.length ? $article.offset()- getFixeaderH().top : 0;
            _shareEnd = _shareTop + $article.outerHeight() - ($share.outerHeight() + _shareCssTop + _shareCssBot);
        });
        $(window).scroll(function () {
            if ($article.length && $(window).width() >= 1024) {
                _scrTop = $(window).scrollTop();
                if (_scrTop > _shareTop) {
                    $share.addClass('js-fixed-top').css({
                        'top': _shareCssTop,
                        'bottom': 'auto'
                    });
                    if (_scrTop >= _shareEnd) {
                        $share.addClass('js-absolute-bottom').css({
                            'top': 'auto',
                            'bottom': _shareCssBot
                        }).removeClass('js-fixed-top');
                    } else {
                        $share.removeClass('js-absolute-bottom');
                    }
                } else {
                    $share.removeClass('js-fixed-top');
                };
            }
        });
    };
    $(window).on('load', function () {
        setdetailBShareFixed();
    });
});