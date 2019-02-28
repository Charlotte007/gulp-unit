// ### 工具
var gulp = require('gulp');
var clean = require('gulp-clean');
var changed = require('gulp-changed');
// var fs = require('fs');
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

// ###  移动端单位： 默认使用vw，可通过参数设置为rem
var cssunit = require('gulp-css-unit'); // px2rem px2vw (使用 px2vw) 
var px2rem = require('gulp-px2rem'); // px2rem (使用 px2rem)

// ### 命令行传递参数
var minimist = require('minimist');

// ### 命令行参数 port
var portOptions = {
    string: 'port',
    default: {
        port: '3000'
    }
};
var portParams = minimist(process.argv.slice(2), portOptions);



// css
var isRem = false;
var cssOptions = {
    string: 'css',
    default: {
        css: 'vw'
    } // vw : rem
};
var cssParams = minimist(process.argv.slice(2), cssOptions);

isRem = cssParams.css ==='rem'? true: false; // --css rem

var config = {
    root: {
        src: "src",
        dist: "web",
    },
    imgPath: { // 图片替换
        imgsrc: 'webimages/',
        bgurl: '../webimages/'
    },
    css: {
        src: 'src/css',
        dist: 'web/webcss'
    },
    sass: {
        src: 'src/sass/*.scss',
        outputStyleAll: ['nested', 'expanded', 'compact', 'compressed'],
        outputStyle: 'compressed',
        contactPath: '',
        filename: 'layout.css'
    },
    js: {
        src: 'src/js/*.js',
        dist: 'web/webjs',
        filename: 'layout.js'
    },
    html: {
        src: 'src/*.html'
    },
    images: {
        src: 'src/images/*.{png,jpg,gif,ico}',
        dist: 'web/webimages'
    },
    sprite: {
        src: 'src/icon/*.{png,jpg,gif,ico}',
        dist: 'src',
        config: { // 相对于dist的路径
            imgName: 'images/sprite.png',
            cssName: 'sass/absprite.scss',
            padding: 10,
            algorithm: 'binary-tree', // 图标的排序方式
            cssTemplate: 'handlebarsStr.css.handlebars' // 模板
        }
    }
}

// 开发环境任务组
var devTaskArr = [];
var buildTaskArr = [];
// 公共函数  -- 文件复制功能
/**
 * @param Sting taskName    任务名
 * @param Sting srcPath     资源路径
 * @param Sting destPath    打包路径
 */
var copyCommon = function (taskName, srcPath, destPath) {
    gulp.task(taskName, function () {
        return gulp.src(srcPath)
            .pipe(gulp.dest(destPath));
    });
    devTaskArr.push(taskName);
    buildTaskArr.push(taskName);
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
// 调用添加复制功能  -- 可以自定义添加调用
copyCommon('cssframe', 'src/css/*', config.css.dist); // 复制UI css
copyCommon('jsPlugin', 'src/plugin/*', config.js.dist); // 复制插件 js
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

var htmlIncludeTask = function (src, dist, isDev, imgpath) { // 使用方法  @@include('include/header.html')
    imgpath = imgpath || config.imgPath.imgsrc;
    return gulp.src(src)
        // .pipe(changed(config.root.dist))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(replace(/href=\"[\s\#]?\"/g, 'href="javascript:;"'))
        .pipe(replace(/src\s*=\s*"([\w\/]*\/)?((?:[^\.\/]+).(?:jpg|png|gif|ico))"/g, 'src="' + imgpath + '$2"'))
     
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


// ### gulp-px2rem Options
var px2remOptions = { // https://github.com/ggkovacs/node-px2rem
    rootValue: 64, // 相对 1rem = 16px
    unitPrecision: 5, // 精度
    propertyBlackList: ['font', 'font-size', 'line-height', 'letter-spacing'], // 不参与转化属性
    propertyWhiteList: [], // 参与转化属性
    replace: false, // 是否替换源文件？？
    mediaQuery: false, // 允许在媒体查询中转换px。
    minPx: 1 // 小于 1像素不参与转换
};
var postCssOptions = { // https://github.com/postcss/postcss
    map: false
};

var sassTask = function (src, dist, style, isDev, isbase64, bgurl) {
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
        .pipe(gulpif(isbase64, cssBase64())) // base64 only build
        .pipe(gulpif(isRem,px2rem(px2remOptions, postCssOptions)))
        .pipe(gulpif(!isRem, cssunit({ type: 'px-to-vw', width: 750 })))
		.pipe(replace(/(?<=[0-9%.]+)pt/g,'px'))   // pt防止转化; 防止其他 字符 转化 ; 建议 1px ,固定像素，使用pt-> px,而不是一味地使用vw
        .pipe(gulpif(isDev, reload({
            stream: true
        })))
		.pipe(gulp.dest(dist));
};



// 共用任务
setGulpTask('cleanall', cleanTask, []);
// 开发任务
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
    sassTask(config.sass.src, config.css.dist, false, true)
}, devTaskArr);

// 生产任务
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
setGulpTask('sass', function () { // src, dist, style, isDev, isbase64, bgurl
    sassTask(config.sass.src, config.css.dist, 'compressed', false, true) // 压缩css 转换华base64
}, buildTaskArr);

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
    gulp.watch('src/include/*.html', ['htmlinclude:dev'])
    gulp.watch(config.images.src, ['images:dev'])
    gulp.watch(config.sprite.src, ['sprite:dev'])

});
// - 生成环境 -- 打包
gulp.task('build', ['cleanall'], function () {
    gulp.start(buildTaskArr);
});