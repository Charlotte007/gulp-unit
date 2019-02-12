# gulp-unit
gulp构建工具的日常维护
### 改动
+ package.json 根据项目放在不同文件夹下，减少不必要的下载
+ 移动端增加px2rem,和px2vw自动转化，默认使用vw（Android4.4 IOS8可兼容），也可可根据项目要求使用rem；使用px2rem时，['font', 'font-size', 'line-height', 'letter-spacing']这些属性不会被转化
+ 增加图片，背景图路径匹配
+ 增加空标签默认值填充
+ 增加开发环境可自定义端口，开启多任务
### 使用
+ 根据项目类型选择配置文件 /config (待改进)
+ cnpm/npm i/install        
+ gulp dev                  开发环境
+ gulp dev --port 4000      自定义端口，开启多任务
+ gulp build                生产环境
+ gulp module               打包模块

#### 新增多行文本溢出省略
`去掉 word-break: break-all;`对英文排版造成的影响<br>
`display: -webkit-box;`是兼容性较差，行内元素不要直接使用；首选 display: block/inline-block; 再调用`多行文本溢出省略`

```` css
@include ml(line-height,line)     // height: lineHeight * line   固定高度

@include mlmax(line-height,line)  // max-height: lineHeight * line  限制最大高度
````

#### 3d翻转兼容IE的翻转内容白屏
```` css
@mixin ieroll(){
    backface-visibility: hidden;
    transition: 0s\9; // IE过渡时间重置为零
    transition:transform ease .7s;
}
````
#### 移动端点击空白 IOS的兼容
```` css
html{
    cursor: pointer;
}
````

#### 响应式图片的模糊问题
```` css 
/* transform的导致模糊问题，计算量不是整数像素*/
@include clearimg1(); // 小图标

@include clearimg2(); // 大图

````
### img{max-width:100%;}处理

#### 微软雅黑字体说明（方正邮件回复）

如您在网站开发时需使用我司字体，且是调用形式使用。根据您的具体调用方式而定：如您从服务器或云端字库调用字体，则需获取官网授权后，方可使用；如您从客户端（PC中）调用字体，则无需授权即可使用。<br>

以上内容简单可解释为：主要看调用的字体源在哪，从本地端调用，网页中字体会因为本地端有没有这款字体而改变，就不要授权；如从服务器调用字体，网页中字体无论本地有没有这款字体，均可以显示出来，则需要授权。

#### 常用插件

UI框架:
+ [layui](http://www.layui.com/)
+ [bootstrap](https://github.com/twbs/bootstrap)

css3动画效果：
+ [css3动画库 animate.css](https://github.com/daneden/animate.css)
+ [按钮的鼠标效果 hover.css](http://ianlunn.github.io/Hover/)
+ [图文切换效果 ihover.css](http://gudh.github.io/ihover/dist/index.html)
+ [图文效果 HoverEffectIdeas](https://tympanus.net/Development/HoverEffectIdeas/)

轮播图：
+ [移动端响应式 swiper3.4.2](https://github.com/nolimits4web/swiper)
+ [兼容低版本多功能响应轮播 flexslide2.0](https://github.com/woocommerce/FlexSlider)
+ [bxslider-4](https://github.com/stevenwanderski/bxslider-4)
	
地址选择器：
+ [jquery.selectcity.js(最新数据+4级地址)](http://jquerywidget.com/jquery-citys/)
	
日期选择器：

+ [bootstrap-datepicker](https://uxsolutions.github.io/bootstrap-datepicker/)
+ [layui.laydate](http://www.layui.com/)
	
滚动效果：
+ [整屏滚动 fullpage.js](https://github.com/alvarotrigo/fullPage.js)
+ [滚动动效 wow + animate.css](https://github.com/matthieua/WOW)
+ [jquery懒加载插件 jquery_lazyload.js](https://github.com/tuupola/jquery_lazyload)
+ [seo友好的懒加载插件+响应式图片 lazysizes.js](https://github.com/aFarkas/lazysizes)
+ [滚动动效 scrollreveal](https://github.com/scrollreveal/scrollreveal)

瀑布流加载：

+ [masonry 响应式,无限加载,不同排序](https://github.com/desandro/masonry)
+ [isotope 过滤、排序、瀑布流](https://github.com/metafizzy/isotope)
+ [Wookmark-jQuery](https://github.com/germanysbestkeptsecret/Wookmark-jQuery)
+ [辅助:imagesloaded 图片加载回调 $.Deferred](https://github.com/desandro/imagesloaded)

弹窗：

+ [图片整屏弹窗PhotoSwipe.js](https://github.com/dimsemenov/PhotoSwipe)
+ [layui](http://layer.layui.com/)

视差效果：

+ [简单的视差滚动效果 parallax.js](https://github.com/pixelcog/parallax.js) [DEMO](http://www.jq22.com/yanshi178)

自定义滚动条：

+ [better-scroll](https://github.com/ustbhuangyi/better-scroll)
+ [perfect-scrollbar](https://github.com/utatti/perfect-scrollbar)

事件相关：

+ [滚轮滚动 jquery-mousewheel](https://github.com/jquery/jquery-mousewheel)
+ [多点触控，拖拽 hammer.js](https://github.com/hammerjs/hammer.js)

### 网站收藏
+  [效果网站 tympanus.net](https://tympanus.net/codrops/)
+  [banner效果 revolution](https://revolution.themepunch.com/examples/)

### 表单验证
+ http://validform.rjboy.cn/

### 搜索关键字高亮
+ [mark.js](https://github.com/julmot/mark.js)

### 源码解析
+ [underscore.js源码解析]
+ [loadsh源码解析]
+ [jquery源码解析]
+ [vue2.x源码解析]
+ [react源码解析]

### svg
+ 


### flex
+ 


### canvas
+ [canvas封装库：konva](https://github.com/konvajs/konva)
+ [canvas矢量图片：paper.js](https://github.com/paperjs/paper.js)
+ [canvas封装库：fabric.js](https://github.com/fabricjs/fabric.js)

### JS Drive Animation
+ [lottie-web + AE +　BodyMovin 骨络图动画](https://github.com/airbnb/lottie-web)
+ [Animate CC + CREATJS 流式动画]

### 小程序

### TODO
+ template 混合
+ pug
+ performace
+ common widget（response-nav，tab-footer，affix，iealert √）;

### 系统重装后如何提交到github
+ window中的凭证管理
+ githooks自动发布
+ jenkins自动化部署





