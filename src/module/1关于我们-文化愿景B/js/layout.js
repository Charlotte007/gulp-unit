
$(function(){

    if(typeof Swiper != 'undefined') {
        var newsSwiper = new Swiper('.culturalBbot-swiper', { 
			paginationClickable: true,
			loop:false,
			simulateTouch: false,
			slidesPerView: 3,
			spaceBetween:12,
			prevButton: '.culturalBbot-swiper-prev',
			nextButton: '.culturalBbot-swiper-next',
			// autoplay: 5000,
			//pagination: '.whydata-pagination',
			simulateTouch:false,
			autoplayDisableOnInteraction: false,
			breakpoints: {
				1023: {
					slidesPerView: 2.2,
					spaceBetween:10,
				},
				768: {
					slidesPerView: 2.2,
					spaceBetween:10,
				},
				640: {
					slidesPerView: 1.2,
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

