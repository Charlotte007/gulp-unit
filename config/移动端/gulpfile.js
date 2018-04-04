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
// 辅助工具
// var requireDir = require('require-dir')
// requireDir('./', {
//     recurse: true
// })
// var config = require('./config'); // 配置参数  ,运行一遍就被删了0.0，why？
var changed = require('gulp-changed');
var path = require('path');
var config = {
    root: {
        src: "src",
        dist: "web",
    },
    css: {
        src: 'src/css',
        dist: 'web/webcss'
    },
    sass: {
        src: 'src/sass/*.scss',
        outputStyleAll: ['nested', 'expanded', 'compact', 'compressed'],
        outputStyle: 'compact',
        contactPath: '',
        filename: 'layout.css'
    },
    js: {
        src: 'src/js/*.js',
        dist: 'web/webjs'
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
  
copyCommon('ckplayer', 'src/ckplayer/*', config.root.dist+"/ckplayer");
copyCommon('googlemap', 'src/google/*', config.root.dist+"/googlemap");
copyCommon('fonts', 'src/fonts/*', config.root.dist + "/fonts");
// 任务函数
var cleanTask = function () {
    return gulp.src(config.root.dist, {
            read: false
        })
        .pipe(clean());
};
var htmlIncludeTask = function () { // 使用方法  @@include('include/header.html')
    return gulp.src(config.html.src)
        // .pipe(changed(config.root.dist))
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(config.root.dist));
}
var htmlIncludeTaskDev = function () {
    return htmlIncludeTask().pipe(reload({
        stream: true
    }));
};
var imagesTask = function () {
    return gulp.src(config.images.src)
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest(config.images.dist));
}
var imagesTaskDev = function () {
    return gulp.src(config.images.src)
        .pipe(gulp.dest(config.images.dist))
        .pipe(reload({
            stream: true
        }));
};
var sassTask = function () {
    var plugins = [cssnext, precss, autoprefixer({
        browsers: ['last 60 versions'],
        cascade: false
    })]; // 参数配置参考 <https://github.com/ai/browserslist>
    return gulp.src(config.sass.src)
        .pipe(changed(config.css.dist))
        .pipe(sass({
            outputStyle: config.sass.outputStyle
        }))
        .pipe(postcss(plugins))
        .pipe(concat(config.sass.filename))
        .pipe(cssBase64())
        .pipe(gulp.dest(config.css.dist));
};
var sassTaskDev = function () {
    var plugins = [cssnext, precss, autoprefixer({
        browsers: ['last 60 version']
    })];
    return gulp.src(config.sass.src)
        .pipe(changed(config.css.dist))
        .pipe(sass({
            outputStyle: config.sass.outputStyle
        }).on('error', sass.logError))
        .pipe(postcss(plugins))
        .pipe(concat(config.sass.filename))
        // .pipe(cssBase64())    //  背景图 拷贝的时机不对
        .pipe(gulp.dest(config.css.dist))
        .pipe(reload({
            stream: true
        }));
};
var jsTask = function () {
    return gulp.src(config.js.src)
        .pipe(jshint()) // 进行检查
        .pipe(jshint.reporter('default')) // 对代码进行报错提示
        /*.pipe(uglify({
            mangle: false, // 类型：Boolean 默认：true 是否修改变量名
            compress: false, //类型：Boolean 默认：true 是否完全压缩
            preserveComments: 'all' //保留所有注释
        }))*/
        .pipe(gulp.dest(config.js.dist));
};
var jsTaskDev = function () {
    return jsTask().pipe(reload({
        stream: true
    }));
};
var spriteTask = function () {
    return gulp.src(config.sprite.src)
        .pipe(spritesmith({
            imgName: config.sprite.config.imgName, // 生成的图片 (相对于dest的路径)
            cssName: config.sprite.config.cssName, // 生成的scss文件
            padding: config.sprite.config.padding, // 图标之间的距离
            algorithm: config.sprite.config.algorithm, // 图标的排序方式
            cssTemplate: config.sprite.config.cssTemplate // 模板
        }))
        .pipe(gulp.dest(config.sprite.dist));
};
var spriteTaskDev = function () {
    return spriteTask().pipe(reload({
        stream: true
    }));
}
// 共用任务
setGulpTask('cleanall', cleanTask, []);
// 开发任务
setGulpTask('htmlinclude:dev', htmlIncludeTaskDev, devTaskArr);
setGulpTask('images:dev', imagesTaskDev, devTaskArr);
setGulpTask('js:dev', jsTaskDev, devTaskArr);
setGulpTask('sprite:dev', spriteTaskDev, devTaskArr);
setGulpTask('sass:dev', sassTaskDev, devTaskArr);

// 生产任务
setGulpTask('htmlinclude', htmlIncludeTask, buildTaskArr);
setGulpTask('images', imagesTask, buildTaskArr);
setGulpTask('sprite', spriteTask, buildTaskArr);
setGulpTask('sass', sassTask, buildTaskArr);
setGulpTask('js', jsTask, buildTaskArr);
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
    gulp.watch('src/include/*.html', ['htmlinclude:dev'])
    gulp.watch(config.images.src, ['images:dev'])
    gulp.watch(config.sprite.src, ['sprite:dev'])

});
// - 生成环境 -- 打包
gulp.task('build', ['cleanall'], function () {
    gulp.start(buildTaskArr);
});