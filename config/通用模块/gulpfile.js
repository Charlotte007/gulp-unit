var gulp = require('gulp');
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
var concat = require('gulp-concat'); // 同级目录文件合并
var fileSync = require('gulp-file-sync'); // 文件操作同步（增加、删除、更新）
var clean = require('gulp-clean'); // 文件清理
var cssBase64 = require('gulp-css-base64'); // base64

// 路径问题：
var rep = require('gulp-replace-image-src'); // 1、前景图路径


var modifyCssUrls = require('gulp-modify-css-urls'); // 背景图


// 默认使用vw转换，如果项目异常使用rem切换
// var cssunit = require('gulp-css-unit');// px2rem px2vw (使用 px2vw) 
// var px2rem = require('gulp-px2rem'); // px2rem (使用 px2rem)

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
var changed = require('gulp-changed');
var fs = require('fs');
// var path = require('path');

var config = {
    root: {
        src: "src",
        dist: "web",
    },
    css: {
        src: 'src/css',
        dist: 'web/dist/css/'
    },
    sass: {
        src: ['src/sass/*.scss', 'src/module/*/sass/*.scss'],
        outputStyleAll: ['nested', 'expanded', 'compact', 'compressed'],
        outputStyle: 'compressed', // dev build 使用去除注释；去除mixin的注释
        contactPath: '',
        filename: 'layout.css'
    },
    js: {
        src: ['src/js/*.js', 'src/module/*/js/*.js'], // 插件使用plugin；js下所有文件参与打包
        dist: 'web/dist/js/',
        filename: 'layout.js'
    },
    html: {
        src: 'src/*.html' // 默认静态页使用模板的方式； @@include
    },
    images: { // 未合并，需具体路径
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

// 开发环境任务组
var devTaskArr = [];
var buildTaskArr = [];
var moduleArr = [];
// 公共函数  -- 文件复制功能
/**
 * @param Sting taskName    任务名
 * @param Sting srcPath     资源路径
 * @param Sting destPath    打包路径
 */
var copyCommon = function (taskName, srcPath, destPath, base) {
    gulp.task(taskName, function () {
        return gulp.src(srcPath, base)
            .pipe(gulp.dest(destPath));
    });
    devTaskArr.push(taskName);
    buildTaskArr.push(taskName);
}
var copyCommon_module = function (taskName, srcPath, destPath, base) {
    gulp.task(taskName, function () {
        return gulp.src(srcPath, base)
            .pipe(gulp.dest(destPath));
    });
    moduleArr.push(taskName);
}


/**
 * @param Sting     taskName    任务名
 * @param Function  taskFn      任务函数
 * @param Array     TaskEnvArr  任务组环境数组
 */
var setGulpTask = function (taskName, taskFn, TaskEnvArr) {
    gulp.task(taskName, taskFn);
    TaskEnvArr.push(taskName);
};

// 针对图片添加
var addAllEnvCb_module = function (taskName, taskFn, cb) {
    gulp.task(taskName, taskFn);
    cb && cb();
};

// 调用添加复制功能  -- 可以自定义添加调用

// copy
copyCommon('cssframe', 'src/css/*', config.css.dist); // 复制UI css

// ???
// copyCommon('modulecssframe', 'src/module/**/css/*', config.css.dist); // web/webcss/

copyCommon('jsPlugin', 'src/plugin/*', config.js.dist); // 复制插件 js
// ???
// copyCommon('jsPlugin', 'src/plugin/*', config.js.dist); // 复制插件 js

copyCommon('ckplayer', 'src/ckplayer/*', config.root.dist + "/ckplayer");
copyCommon('googlemap', 'src/google/*', config.root.dist + "/googlemap");
copyCommon('fonts', 'src/fonts/*', config.root.dist + "/fonts");

// 任务函数
var cleanTask = function () {
    return gulp.src(config.root.dist, {
        read: false
    })
        .pipe(clean());
};
var htmlIncludeTask = function (src, dist) { // 使用方法  @@include('include/header.html')
    return gulp.src(src)
        // .pipe(changed(config.root.dist))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(dist));
}
var htmlIncludeTaskDev = function (src, dist) {
    return htmlIncludeTask(src, dist).pipe(reload({
        stream: true
    }));
};
var imagesTask = function (src, dist) {
    return gulp.src(src) // 图片未经合并，需要配合具体路径
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest(dist));
}
var imagesTaskDev = function (src, dist) {
    return gulp.src(src)            // 图片未经合并，需要配合具体路径
        .pipe(gulp.dest(dist))
        .pipe(reload({
            stream: true
        }));
};

var sassTask = function (src, dist, style) {
    var plugins = [cssnext, precss, autoprefixer({
        browsers: ['last 60 versions'],
        cascade: false
    })]; // 参数配置参考 <https://github.com/ai/browserslist>
    var style = style || config.sass.outputStyle;
    console.log(style);
    // var base64Fn = !nobase64 ? cssBase64() : {};
    // console.log(base64Fn);
    // console.log(typeof base64Fn);
    return gulp.src(src)
        .pipe(changed(dist))
        .pipe(sass({
            outputStyle: style
        }))
        .pipe(postcss(plugins))
        .pipe(concat(config.sass.filename))
        // .pipe(cssBase64())  // base64单独分离
        // .pipe(base64Fn)
        // .pipe(cssunit({ // default px2vw
        //     type     :    'px-to-vw',
        //     width    :    640
        // }))

        //.pipe(px2rem(px2remOptions, postCssOptions)) // px2rem
        .pipe(gulp.dest(dist));
};
var base64Task = function (src, dist) {
    return gulp.src(src)
        .pipe(cssBase64())  // base64单独分离
        .pipe(gulp.dest(dist));
};
var sassTaskDev = function (src, dist) {
    var plugins = [cssnext, precss, autoprefixer({
        browsers: ['last 60 version']
    })];
    return gulp.src(src)
        .pipe(changed(dist))
        .pipe(sass({
            outputStyle: config.sass.outputStyle
        }).on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(concat(config.sass.filename))
        // .pipe(cssunit({ // default px2vw
        //     type     :    'px-to-vw',
        //     width    :    640
        // }))
        // .pipe(px2rem(px2remOptions, postCssOptions)) // px2rem
        // .pipe(cssBase64())    //  背景图 拷贝的时机不对
        .pipe(gulp.dest(dist))
        .pipe(reload({
            stream: true
        }));
};
var jsTask = function (src, dist) {
    return gulp.src(src)
        .pipe(changed(dist))
        .pipe(jshint()) // 进行检查
        .pipe(jshint.reporter('default')) // 对代码进行报错提示
        .pipe(concat(config.js.filename)) // 所有文件合并 
        /*.pipe(uglify({
            mangle: false, // 类型：Boolean 默认：true 是否修改变量名
            compress: false, //类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'all' //保留所有注释
        }))*/
        .pipe(gulp.dest(dist));
};
var jsTaskDev = function (src, dist) {
    return jsTask(src, dist).pipe(reload({
        stream: true
    }));
};
var spriteTask = function (src, dist) {
    return gulp.src(src)
        .pipe(spritesmith({
            imgName: config.sprite.config.imgName, // 生成的图片 (相对于dest的路径)
            cssName: config.sprite.config.cssName, // 生成的scss文件
            padding: config.sprite.config.padding, // 图标之间的距离
            algorithm: config.sprite.config.algorithm, // 图标的排序方式
            cssTemplate: config.sprite.config.cssTemplate // 模板
        }))
        .pipe(gulp.dest(dist)); // 打包到src，作为源文件
};
var spriteTaskDev = function (src, dist) {
    return spriteTask(src, dist).pipe(reload({
        stream: true
    }));
}
// 共用任务
setGulpTask('cleanall', cleanTask, []);
// 开发任务
setGulpTask('htmlinclude:dev', function () {
    htmlIncludeTaskDev(config.html.src, config.root.dist)
}, devTaskArr);
setGulpTask('images:dev', function () {
    imagesTaskDev(config.images.src, config.images.dist)
}, devTaskArr);
setGulpTask('js:dev', function () {
    jsTaskDev(config.js.src, config.js.dist)
}, devTaskArr);
setGulpTask('sprite:dev', function () {
    spriteTaskDev(config.sprite.src, config.sprite.dist)
}, devTaskArr);
setGulpTask('sass:dev', function () {
    sassTaskDev(config.sass.src, config.css.dist)
}, devTaskArr);

// 生产任务
setGulpTask('htmlinclude', function () {
    htmlIncludeTask(config.html.src, config.root.dist)
}, buildTaskArr);
setGulpTask('images', function () {
    imagesTask(config.images.src, config.images.dist)
}, buildTaskArr);
setGulpTask('sprite', function () {
    spriteTask(config.sprite.src, config.sprite.dist)
}, buildTaskArr);
setGulpTask('sass', function () {
    sassTask(config.sass.src, config.css.dist)
}, buildTaskArr);


setGulpTask('js', function () {
    jsTask(config.js.src, config.js.dist)
}, buildTaskArr);


setGulpTask('base64', function () {
    base64Task('web/dist/css/*.css', config.css.dist)
}, buildTaskArr);

// ### 模块 生产环境 ==》 可以使用gulp代替


// ###　模块需要针对项目 一 一 合并
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
                var _moduleRoot = fileDirectory + filename; // 模块资源路径
                var _moduleDist = fileM + filename + '/';
                // common
                copyCommon_module('modulecssframe' + i, _moduleRoot + '/css/*', _moduleDist + 'res/webcss');
                copyCommon_module('jsPlugin' + i, _moduleRoot + '/plugin/*', _moduleDist + 'res/webjs')

                // dev
                addAllEnvCb_module('moduleimages_dev' + i, function () { // 需要base
                    imagesTaskDev(_moduleRoot + '/images/*.{png,jpg,gif,ico}', config.images.dist)
                }, function () {
                    devTaskArr.push('moduleimages_dev' + i);
                });// images:dev  static

                // build
                addAllEnvCb_module('moduleimages_build' + i, function () {
                    imagesTask(_moduleRoot + '/images/*.{png,jpg,gif,ico}', config.images.dist)
                }, function () {
                    buildTaskArr.push('moduleimages_build' + i);
                });// images:  static + module

                // module build
                setGulpTask('modulehtmlinclude' + i, function () {
                    htmlIncludeTask(_moduleRoot + '/*.html', _moduleDist).pipe(rep({
                        prependSrc: '/res/webimages/',
                        keepOrigin: false
                    })).pipe(gulp.dest(_moduleDist));
                }, moduleArr);

                setGulpTask('moduleimages' + i, function () {
                    imagesTask(_moduleRoot + '/images/*.{png,jpg,gif,ico}', _moduleDist + 'res/webimages')
                }, moduleArr);

                // setGulpTask('modulesprite', function () { // !! 相对路径；模块禁止使用 精灵图
                //     spriteTask(config.modulesprite.src, config.modulesprite.dist)
                // }, moduleArr);

                setGulpTask('modulesass' + i, function () { // 使用非压缩模式
                    sassTask(_moduleRoot + '/sass/*.scss', _moduleDist + 'res/webcss', 'expanded', true).pipe(modifyCssUrls({
                        modify: function (url, filePath) {  // ../images  ==> /res/webimages/
                            console.log(url, filePath);
                            // url.repace('../images/','/res/webimages/'); // 使用绝对路径；应为文件有可能在 html中，或者css中
                            return url.replace('../images/', '/res/webimages/');
                        },
                        prepend: '',
                        append: ''
                    })).pipe(gulp.dest(_moduleDist + 'res/webcss')); // 去除base64
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
        notify: false // 开启静默模式
    });
    gulp.watch(config.js.src, ['js:dev'])
    gulp.watch(config.sass.src, ['sass:dev'])
    gulp.watch(config.html.src, ['htmlinclude:dev'])
    gulp.watch(['src/include/*.html', 'src/module/*/include/*.html'], ['htmlinclude:dev'])
    gulp.watch(config.images.src, ['images:dev'])
    gulp.watch(config.sprite.src, ['sprite:dev'])

});
// - 生成环境 -- 打包
gulp.task('build', ['cleanall'], function () {
    gulp.start(buildTaskArr);
});

// - 模块 --开发环境 

//  ---- 模块开发环境 直接同步 gulp dev

// ---- 模块打包环境   gulp module
gulp.task('default', ['cleanall'], function () {
    gulp.start(moduleArr);
});

// 测试说明：
/*
    作为静态页
    1、sass文件打包  ok；   去除base 64;不开启压缩
    2、import  有备注版本 和 无备注版本？？
    3、 背景图的相对路径问题  (统一替换路径)
        |- res          （已经固定）
            |- webcss/
            |- webimages/
            |- webjs/
        *.html

    4、开发环境：
        .scss  自动

         indecude/ *.html   有问题；

    所以后面的项目统一下；
        |- dist
            |- webcss
            |- webimages
            |- webjs
        *.html

    5、模块中的图片引用：

        背景图：使用相对路径已解决 （注意：模块中的背景图，不要放在 静态页中src/images）

        前景图： static:  dist/webimages/*.jpg  module:  res/webimages/*.jpg

        (默认按照静态页中的使用；但是如何解决 模块中路径正确的问题？？？)

    6、base64的转化问题： 待解决

    作为模块：

    注意事项：
    1、单独插件 和 单独css 需要在 模板 和使用的静态页中使用； 可以考虑sea.js
    2、所有使用到第三方插件的；都必须添加上 插件是否存在的判断
        （目前确认的 jq.js  swiper.3.js）===> swiper 统一使用 3.x的版本；统一之前的模块调用方式

    3、模块中禁止使用：（为保证单个模块的完整性；）
        重置样式  禁止混入
		

*/