
$(function(){

    if(typeof Swiper != 'undefined') {
        var newsSwiper = new Swiper('.culturalDbot-swiper', { 
			paginationClickable: true,
			loop:false,
			simulateTouch: false,
			slidesPerView: 3,
			spaceBetween:12,
			prevButton: '.culturalDbot-swiper-prev',
			nextButton: '.culturalDbot-swiper-next',
			// autoplay: 5000,
			//pagination: '.whydata-pagination',
			simulateTouch:false,
			autoplayDisableOnInteraction: false,
			breakpoints: {
				1023: {
					slidesPerView: 2.5,
					spaceBetween:10,
				},
				768: {
					slidesPerView: 2.2,
					spaceBetween:10,
				},
				640: {
					slidesPerView: 1.1,
					spaceBetween:10,
				},
            },
            onInit:function(swiper){
                if($(window).width() >= 1024){
                    if(swiper.slides.length > 3){
                        swiper.prevButton.show();
                        swiper.nextButton.show();
                    }
                }
            }
		});
    }

});

