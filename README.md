# gulp-unit
gulp构建工具的日常维护
### TIPS
+ 后续不在维护，版本已过时，gulp于2019年停止更新，最终版本为4.0.2 ；
+ 若需要正常使用，gulp@3.9.1(global & local)，node版本推荐使用 11，否则可能会因为版本差异无法运行; 
+ 推荐使用`nvm`进行node版本管理
### 改动
+ package.json 根据项目放在不同文件夹下，减少不必要的下载
+ 移动端增加px2rem,和px2vw自动转化，默认使用vw（Android4.4 IOS8可兼容），也可可根据项目要求使用rem；使用px2rem时，['font', 'font-size', 'line-height', 'letter-spacing']这些属性不会被转化
+ 增加图片，背景图路径匹配
+ 增加空标签默认值填充
+ 增加开发环境可自定义端口，开启多任务
### 常见问题
+ 依赖安装完毕，无法运行gulp？
    + 项目本地环境和全局环境都需要安装 相同版本gulp
    + 使用 cmd 测试gulp是否是可识别命令
+ 安装依赖报错？
    + 注意node版本，推荐v11，可最大程度兼容所有依赖，本项目无.lock文件
    + 安装淘宝镜像 cnpm，通过cnpm安装
    + node-sass 可能被墙，可以使用dart-sass代替
    + 删除 node_modules， 多次重试安装
+ gulp命令无法运行
    + 环境变量中添加npm目录，注意结合自己电脑的文件目录，如 'C:\Users\Administrator\AppData\Roaming\npm' 
    + 实测中可能出现，git bash无法运行，但 '管理员-CMD'可运行，推荐直接使用后者

### 使用
+ 根据项目类型选择配置文件 /config (待改进)
+ cnpm/npm i/install        
+ gulp dev                  开发环境
+ gulp dev --port 4000      自定义端口，开启多任务
+ gulp build                生产环境
+ gulp module               打包模块
+ gulp module --isroot true|false     是否使用绝对路径打包，默认：true
+ gulp dev --css vw|rem		移动端自适应单位 vw | rem  （px会自动转换为vw|rem，pt会转换为px）
	+ vw： 后台编辑器字体过大，真机测试计算精度问题

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
+ [输入框效果 TextInputEffects](https://tympanus.net/Development/TextInputEffects/index2.html)

轮播图：
+ [移动端响应式 swiper3.4.2](https://github.com/nolimits4web/swiper)
+ [兼容低版本多功能响应轮播 flexslide2.0](https://github.com/woocommerce/FlexSlider)
+ [bxslider-4](https://github.com/stevenwanderski/bxslider-4)

3D轮播效果
+ 
	
自定义轮播效果：
+ [slideREVOLUTION](https://revolution.themepunch.com/)

地址选择器：
+ [jquery.selectcity.js(最新数据+4级地址)](http://jquerywidget.com/jquery-citys/)
+ [常用插件集 widget](https://jquerywidget.com)
	
日期选择器：
+ [bootstrap-datepicker](https://uxsolutions.github.io/bootstrap-datepicker/)
+ [layui.laydate](http://www.layui.com/)
	
滚动效果：
+ [整屏滚动 fullpage.js](https://github.com/alvarotrigo/fullPage.js)
+ [滚动动效 wow + animate.css](https://github.com/matthieua/WOW)
+ [jquery懒加载插件 jquery_lazyload.js](https://github.com/tuupola/jquery_lazyload)
+ [seo友好的懒加载插件+响应式图片 lazysizes.js](https://github.com/aFarkas/lazysizes)
+ [滚动动效排版 scrollreveal](https://github.com/scrollreveal/scrollreveal)
+ [滚动视差css3 skrollr](https://github.com/Prinzhorn/skrollr)
+ [window扩展平滑滚动 smoothscroll](https://github.com/iamdustan/smoothscroll)
+ [滚动节点 Waypoints](https://github.com/imakewebthings/waypoints)

瀑布流加载：
+ [masonry 响应式,无限加载,不同排序](https://github.com/desandro/masonry)
+ [isotope 过滤、排序、瀑布流](https://github.com/metafizzy/isotope)
+ [Wookmark-jQuery](https://github.com/germanysbestkeptsecret/Wookmark-jQuery)
+ [辅助:imagesloaded 图片加载回调 $.Deferred](https://github.com/desandro/imagesloaded)


弹窗：
+ [图片整屏弹窗PhotoSwipe.js](https://github.com/dimsemenov/PhotoSwipe)
+ [layui](http://layer.layui.com/)
+ [pc弹窗 手机上自由缩放]

翻书效果：
+ [翻书效果}(http://www.rohrbacher.de/90/)
+ [翻书H5]()

视频播放：
+ [ckplayerx](http://www.ckplayer.com/)
+ [video canvas 同步播放](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas)

创意网站：
+ [awwwards](https://www.awwwards.com/aristidebenoist/)

视差效果：
+ [简单的视差滚动效果 parallax.js](https://github.com/pixelcog/parallax.js) [DEMO](http://www.jq22.com/yanshi178)

自定义滚动条：
+ [better-scroll](https://github.com/ustbhuangyi/better-scroll)
+ [perfect-scrollbar](https://github.com/utatti/perfect-scrollbar)

正则表达式：
+ [正则教程](https://www.cnblogs.com/tsql/p/6386218.html)
+ [正则可视化 regexper](https://regexper.com/#%5E%5B%5Cu4e00-%5Cu9fa5%5D%7B0%2C%7D%24)

事件相关：
+ [滚轮滚动 jquery-mousewheel](https://github.com/jquery/jquery-mousewheel)
+ [多点触控，拖拽 hammer.js](https://github.com/hammerjs/hammer.js)

### 网站收藏
+  [效果网站 tympanus.net](https://tympanus.net/codrops/)
+  [banner效果 revolution](https://revolution.themepunch.com/examples/)

### 表单验证
+ [validform](http://validform.club/index.html)

### 搜索关键字高亮
+ [mark.js](https://github.com/julmot/mark.js)

### 源码解析
+ [underscore.js源码解析]
+ [loadsh源码解析]
+ [jquery源码解析]
+ [vue2.x源码解析]
+ [react源码解析]

### svg
+ [svg基础文档](http://know.webhek.com/svg/svg-polygon.html)

### flex
+ [flex的常见应用](https://magic-akari.github.io/solved-by-flexbox/)


### canvas
+ [canvas封装库：konva](https://github.com/konvajs/konva)
+ [canvas矢量图片：paper.js](https://github.com/paperjs/paper.js)
+ [canvas封装库：fabric.js](https://github.com/fabricjs/fabric.js)

### JS Drive Animation
+ [lottie-web + AE +　BodyMovin 骨络图动画](https://github.com/airbnb/lottie-web)
+ [Animate CC + CREATJS 流式动画]

### 小程序
+ [uni-app 小程序模板+vue框架 构建多端应用](https://uniapp.dcloud.io/)
+ [小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

### TODO
+ pug
+ performace
+ webpack4

### 系统重装后如何提交到github
+ window中的凭证管理
+ githooks自动发布
+ jenkins自动化部署

### 百度地图
+ [百度短码](https://dwz.cn/console/apidoc)
+ [二维码生成](https://github.com/davidshimjs/qrcodejs)
	+ 注意：字符串的长度问题，如果链接过长或者包含中文，推荐做短码处理，保证二维码正常
+ [移动端百度地图导航](http://lbsyun.baidu.com/index.php?title=webapi/direction-api-v2)
+ [定位](http://lbsyun.baidu.com/index.php?title=webapi/ip-api)

### 设计模式
+ [自定义事件-发布订阅模式]()
+ [js状态机-状态管理模式]()

### 算法
+ [常见排序算法 算法可视化](https://visualgo.net/zh)
+ [分治]()
+ [动态划分]()
+ [贪心]()
+ [回溯]()
+ [分支界限]()

### 分享平台
+ [国外AddThis](https://www.addthis.com/get/share/)
+ [国内bshare](http://www.bshare.cn/)
















