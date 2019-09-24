// ### 响应式比例
/*
    1024/1200   = 0.85
    768/1200    = 0.64
    640/1200    = 0.53
*/
// ### 工具
var gulp = require('gulp');
var clean = require('gulp-clean');
var changed = require('gulp-changed');
var fs = require('fs');
var gulpif = require('gulp-if');
var concat = require('gulp-concat');

// ### 插件
var sass = require('gulp-sass'); // 输出模式 compact（单行空格）不习惯看node-sass
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnext = require('cssnext');
var precss = require('precss');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
var jshint = require('gulp-jshint'); //注意需要同时安装 jshint 和  gulp-jshiint
var uglify = require('gulp-uglify'); // js压缩
var imagemin = require('gulp-imagemin'); // 图片优化压缩
var pngquant = require('imagemin-pngquant'); // 图片深度压缩 imagemin依赖插件
var spritesmith = require('gulp.spritesmith');
var fileinclude = require('gulp-file-include'); // HTML代码组件化复用；位置/src/include
var cssBase64 = require('gulp-css-base64'); // base64

// ### 
var pug = require('gulp-pug'); // html-tempalte  需要对报错做进一步处理； 

// ### 路径替换
var replace = require('gulp-replace');

// ### 命令行传递参数
var minimist = require('minimist');

// ## 任务统计
// htmlinclude[copy,include]  images[min]  css[copy]    scss[sass,contact,sprite]     js[copy]   

/*
1、模块正常项目中使用 @include 引用方式 使用正常打包

2、模块是可以单独打包的 但是缺少  header footer 和依赖

3、文件打包的注释问题：scss 

4、模块分块打包的问题：
*/

/*
    规则：
    1、插件类的统一放在 各自页面使用的 plugin的目录
    2、放在 js/ 的所有文件都会打包合并到 layout.js文件中
    3、src/css 中的样式文件，会复制到 dist/css 中；src/sass中文件合并到 layout.css
*/
var config = {
    root: {
        src: "src",
        dist: "web",
    },
    imgPath: { // 图片替换
        imgsrc: 'dist/images/',
        bgurl: '../images/'
    },
    css: {
        src: 'src/css',
        dist: 'web/dist/css/',
        cssLink: 'dist/css/'
    },
    sass: { // 合并所有*.scss到 layout.css
        src: ['src/sass/*.scss', 'src/module/*/sass/*.scss', 'src/module/*/components/*/*.scss'],
        outputStyleAll: ['nested', 'expanded', 'compact', 'compressed'],
        outputStyle: 'compact', // dev build 使用去除注释；去除mixin的注释
        contactPath: '',
        filename: 'layout.css'
    },
    js: { // 合并所有*.js到 layout.js
        src: ['src/js/*.js', 'src/module/*/js/*.js', 'src/module/*/components/*/*.js'], // 插件使用plugin；js下所有文件参与打包
        dist: 'web/dist/js/',
        filename: 'layout.js',
        jsSrc: 'dist/js/',
        except: 'ckplayer|layui|datepicker|laypage' // 部分插件有自己目录结构 比如： ckplayer,layer,city 需要手动引入;
    },
    pug: {
        src: 'src/*.pug'
    },
    html: {
        src: 'src/*.html' // 默认静态页使用模板的方式； @@include
    },
    images: { // 未合并，需具体路径,并且添加 watch
        src: 'src/images/*.{png,jpg,gif,ico}',
        dist: 'web/dist/images'
    },
    sprite: {
        src: ['src/icon/*.{png,jpg,gif,ico}', 'src/module/*/icon/*.{png,jpg,gif,ico}'],
        dist: 'src', // sass文件打包到src
        config: { // 相对于./dist的路径
            imgName: 'images/sprite.png',
            cssName: 'sass/absprite.scss',
            padding: 10,
            algorithm: 'binary-tree', // 图标的排序方式
            cssTemplate: 'handlebarsStr.css.handlebars' // 模板
        }
    },
    // 模块相关  使用 readfiles 
    modulecss: {
        src: '/css',
        dist: 'web/'
    },
    modulesass: {
        src: 'src/module/*/sass/*.scss' // 公共样式的问题：reset.scss  + aamixin.scss
    },
    modulejs: {
        src: 'src/module/*/js/*.js',
        dist: 'web/'
    },
    modulehtml: {
        src: 'src/module/*/*.html', // 如何分离 对应文件 到对应的目录
        // dist: 'web/module/*/'
        dist: 'web/'
    },
    moduleimages: {
        src: 'src/module/*/images/*.{png,jpg,gif,ico}',
        dist: 'web/'
    },
    modulesprite: {
        src: 'src/module/*/icon/*.{png,jpg,gif,ico}',
        dist: 'src'
    },
}


var portOptions = {
    string: 'port',
    boolean: 'isroot',
    default: {
        port: '3000',
        isroot: true // 默认为 true，互斥需 --isroot false  注： --isroot 非空 都为true和默认值相同
    }
};

var portParams = minimist(process.argv.slice(2), portOptions);

config.modulePath = portParams.isroot ? '/' : ''; // 默认绝对路径，

var devTaskArr = [];
var buildTaskArr = [];
var moduleArr = [];

/**
 *  ### 公共函数  -- 文件复制功能
 * @param Sting taskName    任务名
 * @param Sting srcPath     资源路径
 * @param Sting destPath    打包路径
 * @param Object base       相对路径
 * @param Boolean ifAddMoudle  是否加入模块打包任务
 */
var copyCommon = function (taskName, srcPath, destPath, ifAddMoudle) {
    gulp.task(taskName, function () {
        return gulp.src(srcPath)
            .pipe(gulp.dest(destPath));
    });

    !ifAddMoudle && devTaskArr.push(taskName);
    !ifAddMoudle && buildTaskArr.push(taskName);
    ifAddMoudle && moduleArr.push(taskName);
}

/**
 * ### 任务分组
 * @param Sting     taskName    任务名
 * @param Function  taskFn      任务函数
 * @param Array     TaskEnvArr  任务组环境数组
 */
var setGulpTask = function (taskName, taskFn, TaskEnvArr) {
    gulp.task(taskName, taskFn);
    TaskEnvArr.push(taskName);
};
// ### copy:  Dev + Build  -- 自定义添加调用
copyCommon('cssframe', 'src/css/*', config.css.dist); // 复制UI css
copyCommon('jsPlugin', 'src/plugin/*', config.js.dist); // 复制插件 js  -> 统一到 seajs中
copyCommon('ckplayer', 'src/ckplayer/*', config.root.dist + "/dist/js/ckplayer");
copyCommon('googlemap', 'src/google/*', config.root.dist + "/googlemap");
copyCommon('fonts', 'src/fonts/*', config.root.dist + "/fonts");

// ### 环境区分 dev ：build
var cleanTask = function () {
    return gulp.src(config.root.dist, {
        read: false
    })
        .pipe(clean());
};

/**
 * ### html文件处理
 * @param {Sting} src       源文件路径
 * @param {Sting} dist      打包后路径
 * @param {Boolean} isDev   是否开发环境
 * @param {Sting} imgpath   统一替换后的路径
 * @returns  {Object}       
 */
var htmlIncludeTask = function (src, dist, isDev, imgpath, cssLink, jsSrc) { // 使用方法  @@include('include/header.html')
    imgpath = imgpath || config.imgPath.imgsrc;
    cssLink = cssLink || config.css.cssLink;
    jsSrc = jsSrc || config.js.jsSrc;
    return gulp.src(src)
        // .pipe(changed(config.root.dist))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file',
        }))
        .pipe(replace(/href=\"[\s\#]?\"/g, 'href="javascript:;"'))
        .pipe(replace(/src\s*=\s*"([\w\/]*\/)?((?:[^\.\/]+)\.(?:jpg|png|gif|ico))\"/g, 'src="' + imgpath + '$2"')) // img:src
        .pipe(replace(/src=\s*\"([\w\/]*\/)?((?!ckplayer|layui|datepicker|laypage)(?:[^\/]+)\.js(?:\?[\w\=]*)?)\"/g, 'src="' + jsSrc + '$2"')) // js: src 正向否定预查  插件自有结构除外： ckplayer|layui|datepicker|laypage
        .pipe(replace(/href=\s*\"([\w\/]*\/)?((?!ckplayer|layui|datepicker|laypage)(?:[^\/]+)\.css(?:\?[\w\=]*)?)\"/g, 'href="' + cssLink + '$2"')) // css： link   
        .pipe(gulpif(isDev, reload({
            stream: true
        })))
        .pipe(gulp.dest(dist));
}

/**
 * ### pug文件处理
 * @param {Sting} src       源文件路径
 * @param {Sting} dist      打包后路径
 * @param {Boolean} isDev   是否开发环境
 * @param {Sting} imgpath   统一替换后的路径
 * @returns  {Object}       
 */

var pugTask = function (src, dist, isDev, imgpath) {
    imgpath = imgpath || config.imgPath.imgsrc;
    return gulp.src(src)
        .pipe(pug({
            pretty: true
        }))
        .pipe(replace(/href=\"[\s\#]?\"/g, 'href="javascript:;"'))
        .pipe(replace(/src\s*=\s*"([\w\/]*\/)?((?:[^\.\/]+).(?:jpg|png|gif|ico))"/g, 'src="' + imgpath + '$2"'))
        .pipe(gulpif(isDev, reload({
            stream: true
        })))
        .pipe(gulp.dest(dist));
}

/**
 * ### 图片压缩拷贝
 * @param {Sting} src       源文件路径
 * @param {Sting} dist      打包后路径
 * @param {Boolean} isDev   是否开发环境
 * @returns
 */
var imagesTask = function (src, dist, isDev) {
    return gulp.src(src) // 图片未经合并，需要配合具体路径
        .pipe(changed(dist))
        .pipe(gulpif(!isDev, imagemin({
            progressive: true,
            use: [pngquant()]
        })))

        .pipe(gulpif(isDev, reload({
            stream: true
        })))
        .pipe(gulp.dest(dist));
}

/**
 * ### js文件合并压缩
 * @param {Sting} src           源文件路径
 * @param {Sting} dist          打包后路径
 * @param {Boolean} isDev       是否开发环境
 * @param {Boolean} isJsmin     是否开启压缩
 * @returns
 */
var jsTask = function (src, dist, isDev, isJsmin) {
    return gulp.src(src)
        .pipe(changed(dist))
        .pipe(jshint()) // 进行检查
        .pipe(jshint.reporter('default')) // 对代码进行报错提示
        .pipe(concat(config.js.filename)) // 合并src下所有  js/*.js
        .pipe(gulpif(isJsmin, uglify({
            mangle: false, // 类型：Boolean 默认：true 是否修改变量名
            compress: false, //类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'all' //保留所有注释
        })))

        .pipe(gulpif(isDev, reload({
            stream: true
        })))
        .pipe(gulp.dest(dist));
};

/**
 * ### 精灵图
 * @param {Sting} src       源文件路径
 * @param {Sting} dist      打包后路径
 * @param {Boolean} isDev   是否开发环境
 * @returns
 */
var spriteTask = function (src, dist, isDev) {
    return gulp.src(src)
        .pipe(spritesmith({
            imgName: config.sprite.config.imgName, // 生成的图片 (相对于dest的路径)
            cssName: config.sprite.config.cssName, // 生成的scss文件
            padding: config.sprite.config.padding, // 图标之间的距离
            algorithm: config.sprite.config.algorithm, // 图标的排序方式
            cssTemplate: config.sprite.config.cssTemplate // 模板
        }))

        .pipe(gulpif(isDev, reload({
            stream: true
        })))
        .pipe(gulp.dest(dist)) // 打包到src，作为源文件;
};

/**
 * ### Sass任务处理
 * @param {Sting} src           源文件路径
 * @param {Sting} dist          打包后路径
 * @param {Sting} style         样式打包形式
 * @param {Boolean} isDev       是否开发环境
 * @param {Boolean} isbase64    是否使用base64
 * @param {Sting} bgurl         替换后背景图路径     
 * @param {Boolean} isModule         模块生成环境
 */
var sassTask = function (src, dist, style, isDev, isbase64, bgurl, isModule) {
    bgurl = bgurl || config.imgPath.bgurl;
    var plugins = [cssnext, precss, autoprefixer({
        browsers: ['last 60 versions'],
        cascade: false
    })]; // 参数配置参考 <https://github.com/ai/browserslist>
    var style = style || config.sass.outputStyle;

    return gulp.src(src)
        .pipe(changed(dist))
        .pipe(sass({
            outputStyle: style
        }).on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(concat(config.sass.filename))
        .pipe(replace(/url\(["']?([\w\/\.]*\/)?((?:[^\.\/]+).(?:jpg|png|gif|ico))["']?\)/g, 'url(' + bgurl + '$2)'))
        .pipe(replace(/\@charset \"UTF-8\"\;/g, ''))
        .pipe(gulpif(isDev, replace(/\/\*\s?\{[^\}]*}\s?\*\//g, '')))  // dev 去除module注釋
        .pipe(gulpif(isModule, replace(/\n/g, '')))
        .pipe(gulpif(isModule, replace(/\@media/g, '\n@media'))) // \n 成为锚点
        .pipe(gulpif(isbase64, cssBase64())) // base64 only build
        .pipe(gulpif(isDev, reload({
            stream: true
        })))
        .pipe(gulp.dest(dist));
};

// 共用任务
setGulpTask('cleanall', cleanTask, []);

// 添加 开发任务
setGulpTask('htmlinclude:dev', function () {
    htmlIncludeTask(config.html.src, config.root.dist, true);
}, devTaskArr);

setGulpTask('pug:dev', function () {
    pugTask(config.pug.src, config.root.dist, true)
}, devTaskArr);

setGulpTask('images:dev', function () {
    imagesTask(config.images.src, config.images.dist, true)
}, devTaskArr);
setGulpTask('js:dev', function () {
    jsTask(config.js.src, config.js.dist, true)
}, devTaskArr);
setGulpTask('sprite:dev', function () {
    spriteTask(config.sprite.src, config.sprite.dist, true)
}, devTaskArr);
setGulpTask('sass:dev', function () {
    sassTask(config.sass.src, config.css.dist, false, true)
}, devTaskArr);

// 添加 生产任务
setGulpTask('htmlinclude', function () {
    htmlIncludeTask(config.html.src, config.root.dist)
}, buildTaskArr);
setGulpTask('images', function () {
    imagesTask(config.images.src, config.images.dist)
}, buildTaskArr);
setGulpTask('js', function () {
    jsTask(config.js.src, config.js.dist)
}, buildTaskArr);
setGulpTask('sprite', function () {
    spriteTask(config.sprite.src, config.sprite.dist)
}, buildTaskArr);
setGulpTask('sass', function () {
    sassTask(config.sass.src, config.css.dist, 'compressed', false, true) // 压缩css 转换华base64
}, buildTaskArr);

// ### 读取文件添加　模块任务
var moduleImgPath = [];
var moduleImgTask = [];
var modulePath = [];
readfiles = function () {
    var fileDirectory = "src/module/";
    var fileM = 'web/';
    if (fs.existsSync(fileDirectory)) {
        // 读取module目录
        fs.readdir(fileDirectory, function (err, files) {
            if (err) {
                console.error(err);
                return;
            }
            var testIndex = 0;
            // 模块分层执行
            files.forEach(function (filename, i) { //  return return false break continue

                if (filename.indexOf('.git') !== -1) return;
                // 模块文件
                var _moduleRoot = fileDirectory + filename; // "src/module/moduleA"
                var _moduleDist = fileM + filename + '/'; // web/moduleA
                var _subComRoot = _moduleRoot + '/components/';
                modulePath.push(_moduleDist);


                // ### 读取指定模块下的 
                // common copy: dev + build + build: 路径不同
                copyCommon('modulecssframe' + i, _moduleRoot + '/css/*', config.css.dist);
                copyCommon('jsPlugin' + i, _moduleRoot + '/plugin/*', config.js.dist);

                // dev:    fixup: img 不能通配符获取的问题
                setGulpTask('moduleimages_dev' + i, function () { // 需要base
                    imagesTask(_moduleRoot + '/images/*.{png,jpg,gif,ico}', config.images.dist, true)
                }, devTaskArr); // images:dev  static
                // img:add watch
                moduleImgPath.push(_moduleRoot + '/images/*.{png,jpg,gif,ico}');
                moduleImgTask.push('moduleimages_dev' + i);

                // build   fixup: img 不能通配符获取的问题
                setGulpTask('moduleimages_build' + i, function () {
                    imagesTask(_moduleRoot + '/images/*.{png,jpg,gif,ico}', config.images.dist)
                }, buildTaskArr); // images:  static + module

                // module build: copy html img sass js
                copyCommon('modulecssframe_md' + i, _moduleRoot + '/css/*', _moduleDist + 'res/webcss', true);
                copyCommon('jsPlugin_md' + i, _moduleRoot + '/plugin/*', _moduleDist + 'res/webjs', true);

                setGulpTask('modulehtmlinclude' + i, function () { // 替换html中src的路径
                    htmlIncludeTask(_moduleRoot + '/*.html', _moduleDist, false, config.modulePath + 'res/webimages/', config.modulePath + 'res/webcss/', config.modulePath + 'res/webjs/') // src, dist, isDev,imgpath
                }, moduleArr);

                setGulpTask('moduleimages' + i, function () {
                    imagesTask(_moduleRoot + '/images/*.{png,jpg,gif,ico}', _moduleDist + 'res/webimages', true)
                }, moduleArr);

                setGulpTask('modulesass' + i, function () { // 使用非压缩模式： 需要保留注释  只能采用单行模式，
                    sassTask([_moduleRoot + '/sass/*.scss', _moduleRoot + '/components/*/*.scss'], _moduleDist + 'res/webcss', 'compact', false, false, config.modulePath ? config.modulePath + 'res/webimages/' : '../webimages/', true) // src, dist, style, isDev, isbase64,bgurl isModule
                }, moduleArr);

                setGulpTask('modulejs' + i, function () {
                    jsTask([_moduleRoot + '/js/*.js', _moduleRoot + '/components/*/*.js'], _moduleDist + 'res/webjs')
                }, moduleArr);

                /** 
                * # 子组件 比如 关于我们A/componets/组件A/  *.js | *.css | *.html
                * # 合并到 layout.js , 合并到 layout.css 
                * # 任务： 
                * # 待解决： 
                *  + 打包如何形成一个完整的页面? 而且要保证目录一直，
                *      fixup：1、需要有个引入的页面，固定index.html
                *  + 模块下混合样式，以及js
                *  +  modulePath.push(_unitDist);目录中 文件打包出错
                *  + 优化组件的写法，一个组件包含 html + scss + js；需要优化
               */
            
                if (fs.existsSync(_subComRoot)) {
                    fs.readdirSync(_subComRoot, function (err, files) { // fixup：同步
                        files.forEach(function (subfile, j) {
                            var _unitRoot = _subComRoot + subfile; 
                            var _unitDist = fileM + filename + '-' + subfile + '/';

                            modulePath.push(_unitDist);

                            // copyCommon('modulecssframe_md_unit' + j, _moduleRoot + '/css/*', _unitDist + 'res/webcss', true);
                            // copyCommon('jsPlugin_md_unit' + j, _moduleRoot + '/plugin/*', _unitDist + 'res/webjs', true);

                            // 使用 /index.html 固定座封面引入页面
                            setGulpTask('modulehtmlinclude_unit' + j, function () { // 替换html中src的路径
                                htmlIncludeTask(_unitRoot + '/index.html', _unitDist, false, config.modulePath + 'res/webimages/', config.modulePath + 'res/webcss/', config.modulePath + 'res/webjs/')
                                // src, dist, isDev,imgpath
                            }, moduleArr);

                            setGulpTask('modulesass_unit' + j, function () { // 使用非压缩模式： 需要保留注释  只能采用单行模式，
                                sassTask(_unitRoot + '/*.scss', _unitDist + 'res/webcss', 'compact', false, false, config.modulePath ? config.modulePath + 'res/webimages/' : '../webimages/', true)
                                // src, dist, style, isDev, isbase64,bgurl isModule
                            }, moduleArr);

                            setGulpTask('modulejs_unit' + j, function () {
                                jsTask(_unitRoot + '/*.js', _unitDist + 'res/webjs')
                            }, moduleArr);
                        });
                    });
                }

            });
        });
    } else {
        console.error(fileDirectory + "  Not Found!");
    }
}

readfiles();
// ### 监听文件变动  //  
// fs.watch('src/module/', function (event, filename) {
//     console.log('event is: ' + event);
//     if (filename) {
//         console.log('filename provided: ' + filename);
//         moduleImgPath = [];
//         moduleImgTask = [];
//         modulePath = [];
//         readfiles();
//     } else {
//         console.log('filename not provided');
//     }
// });

// - 开发环境 -- 开发
gulp.task('dev', ['cleanall'], function () {
    gulp.start(devTaskArr);
    browserSync.init({
        server: {
            baseDir: config.root.dist
        },
        logLevel: "debug",
        logPrefix: "dev",
        browser: 'chrome',
        notify: false, // 开启静默模式
        port: portParams.port
    });

    gulp.watch(config.js.src, ['js:dev'])
	gulp.watch(['src/plugin/*.js'], ['jsPlugin']) // add： 添加插件监听
	
    gulp.watch(config.sass.src, ['sass:dev'])
    gulp.watch(config.html.src, ['htmlinclude:dev'])
    gulp.watch(['src/include/*.html', 'src/module/*/include/*.html'], ['htmlinclude:dev'])

    gulp.watch(config.pug.src, ['pug:dev'])
    gulp.watch(['src/include/*.pug', 'src/module/*/include/*.pug'], ['pug:dev'])

    gulp.watch(config.images.src, ['images:dev'])

    // watch module images   新增模块文件夹，需要 重新push moduleImgPath
    gulp.watch(moduleImgPath, moduleImgTask)
    gulp.watch(config.sprite.src, ['sprite:dev'])

});
// - 生成环境 -- 打包
gulp.task('build', ['cleanall'], function () {
    gulp.start(buildTaskArr);
});

// ---- 模块打包环境   gulp default
gulp.task('module', ['cleanall'], function () {
    gulp.start(moduleArr, function () {
        // 自动生成 cssJson cssTemplate；
        modulePath.forEach(function (path, index) {
            var cssJsonStr = ''; // json
            var cssTempStr = ''; // css
            // var testJsonArr = [];

            // 需要保留注释
            var data = (fs.readFileSync(path + 'res/webcss/layout.css')).toString();
            // cssTemplate  选择器去掉伪类，伪元素 
            // fixup: remove \)\s\{\s?|
            var pseudoReg = /(^\s*|[\:]{1,3}after|[\:]{1,3}before|\:active|\:focus|\:hover|\:link|\:visited|\:lang|\[type=\"[\w\-]*\"\]|\:first-letter|\:first-line|\:first-child|\:last-child|\:nth-child\([\w\+]*\)|(\s*$))/g; // 注意顺序

            // 思路： selector{}  拆成单项逐一匹配
            // fixup: selector:'@charset \"UTF-8\";\n@media (min-width: 1024px){.selector {}}';
            // fixup: 选择器单项；因为添加区间标题，导致样式同行；区间匹配不能与选择器样式匹配同行；属于嵌套关系

            // 錨點：@meida{} 區間的樣式換行
            var mediaMatchArr = data.split('\n');

            mediaMatchArr.forEach(function (item, index) { // .selector  @media() {} 

                // var mediaCssStr = item.replace(/\s*([^\{\)]*|@media\s?\(([^\(\)]*)\s?\)\s?\{\s?([^\{]*))\s?\{(.*)\}/g, function () { // .select {} | @media (min-width: ) {

                // 样式分区间添加标题;'
                // fixup: nth-child() 中的括號 [^\{\)]* => [^\{]*
                var mediaCssStr = item.replace(/\s*(\@media\s?\(([^\(\)]*)\s?\)\s?\{\s?([^\{]*)|[^\{]*)\s?\{(.*)\}/g, function () {
                    // item.replace(/\s*([^\{]*|@media\s?\(([^\(\)]*)\s?\)\s?\{\s?([^\{]*))\s?\{(.*)\}/g, function () { // .select {} |  .select:nth-child {}  | @media (min-width: ) {}
                    // 不可选择 替换伪类，伪元素
                    // m: .slector { ... }   media： @media (....) {...}
                    var blockName = '+ CssLg: 1200px及其以上\n+ CssMd: 1024px\n+ CssSm: 768px\n+ CssXs: 768px以下区间\n\n###编辑器快捷键\n+ F7:格式化 F11:全屏\n\n//### 手机端样式\n';


                    var testJsonArr = []; // 对应block
                    var blockCssJson = [];
                    if (arguments[3]) { // 匹配@media 区间名称; 匹配出 @media(..){ 匹配項 { } }
                        blockSlector = arguments[3]
                        blockName = '//### ' + arguments[2] + '\n';
                    }

                    // 每個區間的樣式： 沒有 @meida的區間 | 有meida的區間
                    // 一個選擇器對應一行樣式；.className {...}
                    var blockStyle = arguments[0].replace(/\}(?!\*)/g, '\}\n'); // class单行,方便匹配; 反向匹配; 锚点： \}(?!\*) 非注释的\}
                    // blockStyle 每個區間的樣式

                    // 样式每个区间  ((?:\)\s\{\s?)?[^\{\n)]*)
                    // fixup: @media 匹配的區間會帶有 ) {...
                    var itemStyle = blockStyle.replace(/((?:\)\s\{\s?)?[^\{\n]*)\s?\{(.*)\}/g, function () { // 锚点： \n 实现单行匹配

                        // if(arguments[1].indexOf('.fixbug')!==-1){
                        //     console.log('----');
                        //     console.log(arguments);
                        // }

                        var selector = arguments[1].replace(pseudoReg, '');

                        // selector && selectorStyle
                        var selectStyle = arguments[2].replace(/(\:[^\:\;]+\;)\s*\/\*\s?(\{[^\*]+)\*\//g, function () { // 锚点：\:attribute;/*...*/

                            var jsonItem = JSON.parse(arguments[2]); // 配置项
                            var jsonItemStr = JSON.stringify(jsonItem) + '\n';

                            jsonItem.selector = selector;
                            var selectorItemStr = JSON.stringify(jsonItem) + '\n';

                            // fixup: 同样的名称和变量名称，但是selector是不同的不能去重；去除名称变量相同的，合并selector
                            // fixup: nth-child的問題

                            // object to string 去重
                            var testindex = testJsonArr.indexOf(jsonItemStr);
                            if (testindex === -1) {
                                testJsonArr.push(jsonItemStr);
                                blockCssJson.push(selectorItemStr); // 字符串化
                            } else { // 合并重复项selector; // bug: 合併，select重複
                                blockCssJson[testindex] = blockCssJson[testindex].replace(/"selector":"([^"]+)"/, '"selector":"$1,' + jsonItem.selector + '"');
                                // console.log(blockCssJson[testindex]);
                            }

                            // 返回 selectStyle 参数化后
                            return arguments[1].replace(jsonItem.value, jsonItem.name);
                        });
                        // 需要保证匹配 === 替换;
                        return arguments[1] + '{' + selectStyle + '}'; // online
                    });

                    // 合并变量替换后的 css 
                    cssTempStr += itemStyle; // 返回的样式中 缺少
                    // 合并 去重后 添加区间名称的 json文件
                    cssJsonStr = cssJsonStr + blockName + '[\n' + blockCssJson.toString() + ']\n\n';
                });
            });
            // @media 标签多行css; 方便查看
            var mediaCssMl = cssTempStr.replace(/\@media/g, '\n\n@media');

            // 写入操作 
            fs.writeFile(path + 'cssTemplate.txt', mediaCssMl, function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log(path + "cssTemplate.txt 数据写入成功！");
            });
            fs.writeFile(path + 'cssJson.txt', cssJsonStr, function (err) {
                if (err) {
                    return console.error(err);
                }
                console.log(path + "cssJson.json 数据写入成功！");
            });
        });
    });
});

// 测试说明：
/*
    作为静态页
    1、sass文件打包  ok；   去除base 64;不开启压缩
    2、import  有备注版本 和 无备注版本？？     ---     使用时：压缩，去除所有注释；cms模块打包时: 放出注释

    3、 背景图的相对路径问题  (统一替换路径)    ---     对应已有的模块路径

        |- res          （已经固定）
            |- webcss/
            |- webimages/
            |- webjs/
        *.html

    4、开发环境：

    5、模块中的图片引用：

        背景图：使用相对路径已解决 （注意：模块中的背景图，不要放在 静态页中src/images）

        前景图： static:  dist/webimages/*.jpg  module:  res/webimages/*.jpg

    6、base64的转化问题：  -- 已修改


    作为模块：

    注意事项：

    1、单独插件 和 单独css 需要在 模板 和使用的静态页中使用； 可以考虑sea.js

    2、所有使用到第三方插件的；都必须添加上 插件是否存在的判断；
        （目前确认的 jq.js  swiper.3.js）===> swiper 统一使用 3.x的版本；统一之前的模块调用方式

    3、模块中禁止使用：（为保证单个模块的完整性；）
        重置样式  禁止混入

    4、注意sass的参数，@mixin参数的格式，决定匹配生成 cssTemplate cssJSon

    5、百度地图使用  html参数去优化； 需要处理一个 google地图版本

    6、通用的JS， placeholder.js  jquery.min.js 无需加密

    7、注意使用 padding margin 对  commonweb的影响
        css：   dist/css/*.css  res/webcss/*.css    排除 http://
        js：    dist/js/*.js    res/js/*.js         排除 http://

    9、变量参数的问题；

    待添加功能：
    1、常用的模块如，搜索模板页，网站地图模板页要混入；              --- 功能已添加，待混入
    2、支持多端口开启，支持自定义传参                              ---  已添加
    3、空属性值：  href=""                                       --- 已修改
    4、img  和 background-images 手动替换                        --- 已修改
    5、模块打包直接生成  cssJson 和 cssTemplate                   --- 已添加，可以自动生成
	6、是否引入  pug                                               --- 已添加pug，报错需要处理
    7、发现问题：  比如 linear-gradent是有问题的                  --- 没有值 会影响编译的,不能配置
    8、依赖的插件和js资源，没有批量替换    比如 city.js  map.js    datapicker
    9、swiper.3.x 响应的问题；  IE9+ 不能初始化
    10、分页的位置？ 需要统一调整； 手机端加载更多 和 PC端分页的切换；
    11、重复项合并selector                                        --- 已修改 -fixup
    12、:hover :after   选择器         --- banner B                -- 已优化

    13、注释的问题，                                                     ---  开发环境下 不需要注释，模块环境下需要
    14、针对模块 src/moudle/global 放置统一的地步
    15、相同参数去重，注意书写顺序，方便提供正确的 选择器，以方便后面提示           -- 已优化
    16、模块下添加 components 分拆为最小组件，可以单独打包                          --- 进行中
    17、bug： nth-child(odd) 这种类似的选择器参数以及选择器不能过滤参数             --- 进行中

    维护原则：
    1、 本地CMS源码必须保证为最新版本；方便对照CMS模块；
    2、 cms后台覆盖原则； 1260 > 1024 > 768 > m
    3、 约定全局主题色：@clcur @clrgbcur  @bgccur  @bgrgbcur @bdcur @bdrgbcur
    4、 下载中心A中的mixin.scss作为最全面的引入
    5、 因每个模块中使用 mixin.scss 的版本不同，所以不可统一替换 aamixin.scss 文件；防止宝座
    6、 栏目标题类的，间距类需要统一
    7、 sass 中禁止使用 \/* 注释 *\/   防止与 sass中配置参数冲突; 样式必须按照区间写！！！
    8、 建立模板的规则，先从栏目最多的去添加
    9、 使用seaJS加载，针对文件合并后，需要保证按需加载，否则会全部加载的;
*/