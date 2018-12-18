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

// ### 路径替换
var replace = require('gulp-replace');

// ### 命令行传递参数
var minimist = require('minimist');

var portOptions = {
    string: 'port',
    default: { port: '3000' }
};
var portParams = minimist(process.argv.slice(2), portOptions);

// ### 计划  使用node可以直接把 css替换成 ===> cssJSon && cssTemplte;

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
    2、放在 js/ 的所有文件都会打包
*/
var config = {
    root: {
        src: "src",
        dist: "web",
    },
    imgPath:{ // 图片替换
        imgsrc:'dist/images/',
        bgurl:'../images/'
    },
    css: {
        src: 'src/css',
        dist: 'web/dist/css/'
    },
    sass: { // 合并所有*.scss到 layout.css
        src: ['src/sass/*.scss', 'src/module/*/sass/*.scss'],
        outputStyleAll: ['nested', 'expanded', 'compact', 'compressed'],
        outputStyle: 'compressed', // dev build 使用去除注释；去除mixin的注释
        contactPath: '',
        filename: 'layout.css'
    },
    js: { // 合并所有*.js到 layout.js
        src: ['src/js/*.js', 'src/module/*/js/*.js'], // 插件使用plugin；js下所有文件参与打包
        dist: 'web/dist/js/',
        filename: 'layout.js'
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

var devTaskArr = [];
var buildTaskArr = [];
var moduleArr = [];

/**
 *  ### 公共函数  -- 文件复制功能
 * @param Sting taskName    任务名
 * @param Sting srcPath     资源路径
 * @param Sting destPath    打包路径
 * @param Object base       相对路径
 * @param Boolean ifAddMoudle  是否加入 模块打包任务
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
copyCommon('jsPlugin', 'src/plugin/*', config.js.dist); // 复制插件 js
copyCommon('ckplayer', 'src/ckplayer/*', config.root.dist + "/ckplayer");
copyCommon('googlemap', 'src/google/*', config.root.dist + "/googlemap");
copyCommon('fonts', 'src/fonts/*', config.root.dist + "/fonts");

// ### 环境区分 dev ：build

var cleanTask = function () {
    return gulp.src(config.root.dist, {
            read: false
        })
        .pipe(clean());
};

var htmlIncludeTask = function (src, dist, isDev,imgpath) { // 使用方法  @@include('include/header.html')
    imgpath = imgpath || config.imgPath.imgsrc;

    return gulp.src(src)
        // .pipe(changed(config.root.dist))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(replace(/href=\"[\s\#]?\"/g, 'href="javascript:;"'))
        .pipe(replace(/src\s*=\s*"([\w\/]*\/)?((?:[^\.\/]+).(?:jpg|png|gif|ico))"/g, 'src="'+imgpath+'$2"'))
		
        .pipe(gulpif(isDev, reload({
            stream: true
        })))
		.pipe(gulp.dest(dist));
}
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

var jsTask = function (src, dist, isDev, isJsmin) {
    return gulp.src(src)
        .pipe(changed(dist))
        .pipe(jshint(isJsmin)) // 进行检查
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

var sassTask = function (src, dist, style, isDev, isbase64,bgurl) {
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
        .pipe(replace(/url\(["']?([\w\/\.]*\/)?((?:[^\.\/]+).(?:jpg|png|gif|ico))["']?\)/g, 'url('+bgurl+'$2)'))
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
    htmlIncludeTask(config.html.src, config.root.dist, true)
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
    sassTask(config.sass.src, config.css.dist,'', true,false) // src, dist, style, isDev, isbase64,bgurl
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

// ### 添加　模块任务
var moduleImgPath = [];
var moduleImgTask = [];
readfiles = function () {
    var fileDirectory = "src/module/";
    var fileM = 'web/';
    if (fs.existsSync(fileDirectory)) {

        fs.readdir(fileDirectory, function (err, files) {
            if (err) {
                console.error(err);
                return;
            }
            // 模块分层执行
            files.forEach(function (filename, i) {
                var _moduleRoot = fileDirectory + filename; // "src/module/moduleA"
                var _moduleDist = fileM + filename + '/'; // web/moduleA
                // common copy: dev + build + build: 路径不同
                copyCommon('modulecssframe' + i, _moduleRoot + '/css/*', config.css.dist);
                copyCommon('jsPlugin' + i, _moduleRoot + '/plugin/*', config.js.dist)

                // dev: 
                setGulpTask('moduleimages_dev' + i, function () { // 需要base
                    imagesTask(_moduleRoot + '/images/*.{png,jpg,gif,ico}', config.images.dist, true)
                }, devTaskArr); // images:dev  static
                // img:add watch
                moduleImgPath.push(_moduleRoot + '/images/*.{png,jpg,gif,ico}');
                moduleImgTask.push('moduleimages_dev' + i);

                // build
                setGulpTask('moduleimages_build' + i, function () {
                    imagesTask(_moduleRoot + '/images/*.{png,jpg,gif,ico}', config.images.dist)
                }, buildTaskArr); // images:  static + module

                // module build: copy html img sass js
                copyCommon('modulecssframe' + i, _moduleRoot + '/css/*', _moduleDist + 'res/webcss', true);
                copyCommon('jsPlugin' + i, _moduleRoot + '/plugin/*', _moduleDist + 'res/webjs', true)

                setGulpTask('modulehtmlinclude' + i, function () { // 替换html中src的路径
                    htmlIncludeTask(_moduleRoot + '/*.html', _moduleDist,false,'/res/webimages/')  // src, dist, isDev,imgpath
                }, moduleArr);

                setGulpTask('moduleimages' + i, function () {
                    imagesTask(_moduleRoot + '/images/*.{png,jpg,gif,ico}', _moduleDist + 'res/webimages')
                }, moduleArr);

                setGulpTask('modulesass' + i, function () { // 使用非压缩模式
                    sassTask(_moduleRoot + '/sass/*.scss', _moduleDist + 'res/webcss', 'expanded', false, false,'/res/webimages/') // src, dist, style, isDev, isbase64,bgurl
                }, moduleArr);

                setGulpTask('modulejs' + i, function () {
                    jsTask(_moduleRoot + '/js/*.js', _moduleDist + 'res/webjs')
                }, moduleArr);
            });
        });
    } else {
        console.error(fileDirectory + "  Not Found!");
    }
}
readfiles();

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
    gulp.watch(config.sass.src, ['sass:dev'])
    gulp.watch(config.html.src, ['htmlinclude:dev'])
    gulp.watch(['src/include/*.html', 'src/module/*/include/*.html'], ['htmlinclude:dev'])
    gulp.watch(config.images.src, ['images:dev'])
    // watch module images
    gulp.watch(moduleImgPath, moduleImgTask)
    gulp.watch(config.sprite.src, ['sprite:dev'])

});
// - 生成环境 -- 打包
gulp.task('build', ['cleanall'], function () {
    gulp.start(buildTaskArr);
});

// ---- 模块打包环境   gulp default
gulp.task('module', ['cleanall'], function () {
    gulp.start(moduleArr);
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


    6、base64的转化问题： 待解决

    作为模块：

    注意事项：

    1、单独插件 和 单独css 需要在 模板 和使用的静态页中使用； 可以考虑sea.js
    2、所有使用到第三方插件的；都必须添加上 插件是否存在的判断
        （目前确认的 jq.js  swiper.3.js）===> swiper 统一使用 3.x的版本；统一之前的模块调用方式
    3、模块中禁止使用：（为保证单个模块的完整性；）
        重置样式  禁止混入


    待添加功能：
    1、常用的模块如，搜索模板页，网站地图模板页要混入；        --- 功能已添加，待混入
    2、支持多端口开启，支持自定义传参                        ---  已添加
    3、空属性值：  href=""                              --- 已修改
    4、img  和 background-images 手动替换               --- 已修改

    5、模块打包直接生成  cssJson 和 cssTemplate            需要使用写入的操作

*/