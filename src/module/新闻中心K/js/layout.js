$(function(){

  //动画初始化
  // if (typeof WOW != 'undefined') {
  //   var wow = new WOW({
  //     boxClass: 'wow',
  //     animateClass: 'animated',
  //     offset: 0,
  //     mobile: false,
  //     live: true
  //   });
  //   wow.init();
  // }
// //  手机/电脑事件
//   productScreen();
//   function productScreen(){
//     var _winW = $(window).width();
//     var _overscroll = window.innerWidth - document.body.clientWidth;
//     if (_winW + _overscroll < 1024) {
//       //重置
//       $('.category-list').hide();
//       $('.category-active-name').removeClass('active');
//       //手机端二级分类展示/隐藏
//       $('.category-active-name').off('click').on('click',function(){
//         if ($(this).siblings('.category-list').is(':hidden')) {
//           $(this).siblings('.category-list').stop(true,true).slideDown(300);
//           $(this).addClass('active');
//         } else {
//           $(this).siblings('.category-list').stop(true,true).slideUp();
//           $(this).removeClass('active');
//         }
//       });
//     } else {
//       $('.category-list').show();
//     }
//   }
//   $(window).resize(productScreen);

});
