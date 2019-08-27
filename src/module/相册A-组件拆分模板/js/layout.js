$(function(){
    function isImgLanky($img, hwRate) {
        var img = new Image(),
            imgW, imgH;
        img.src = $img.attr('src');
        if (img.complete) {
            imgW = img.width;
            imgH = img.height;
            if (hwRate < imgH / imgW) {
                $img.addClass('lanky');
            }
        } else {
            img.onload = function () {
                imgW = img.width;
                imgH = img.height;
                if (hwRate < imgH / imgW) {
                    $img.addClass('lanky');
                }
            };
        }
    }
    function getSlide($imgTarget, $popupWrap, start) {
        start = start || 0;
        var $thumbs = $imgTarget.find('img');
        var slideLength = $thumbs.length;
        var $thumbSwiper = $popupWrap.find('.swiper-wrapper');
        var warpW = $(window).width() * 0.94;
        hwRate = $(window).height() * 0.8 / (warpW > 800 ? 800 : warpW);
        $thumbSwiper.html('');
        for (start = 0; start < slideLength; start++) {
            var $item = $('<li class="swiper-slide"><img src="' + $thumbs[start].src + '"></li>');
            isImgLanky($item.find('img').eq(0), hwRate);
            $thumbSwiper.append($item);
        }
        return start;
    }

    var copyOldLen = getSlide($('.albumA-list'), $('.albumA-wrap'));

    if (typeof Swiper != 'undefined') {
        var albumACopySwiper = new Swiper(".albumA-popupsw", {
            loop: false,
            observer: true,
            observeParents: true,
            prevButton: '.albumApop-prev',
            nextButton: '.albumApop-next',
            pagination: '.albumApop-pages'
        });
    }
    $('.albumA-list').on('click', 'li a', function () {
        var clickIndex = $(this).parent().index();
        var newLen = $('.albumA-list li').length;
        if (newLen > copyOldLen) {
            copyOldLen = getSlide($('.albumA-list'), $('.albumA-wrap'), copyOldLen);
        }
        albumACopySwiper.update && albumACopySwiper.update();
        $('.full-albumA-popup').stop().fadeIn();
        albumACopySwiper.slideTo && albumACopySwiper.slideTo(clickIndex, 0);
    });
    $('.full-albumA-popup').on('click', '.albumA-close', function () {
        $('.full-albumA-popup').stop().fadeOut();
    });
});