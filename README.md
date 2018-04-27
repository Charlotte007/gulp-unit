# gulp-unit
gulp构建工具的日常维护
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
    transition:all ease .7s;
}
````
#### 移动端点击空白 IOS的兼容
```` css
html{
    cursor； pointer;
}
````

#### 响应式图片的模糊问题
```` css
@include clearimg1(); // 小图标

@include clearimg2(); // 大图

````

#### 微软雅黑字体说明（方正邮件回复）

如您在网站开发时需使用我司字体，且是调用形式使用。根据您的具体调用方式而定：如您从服务器或云端字库调用字体，则需获取官网授权后，方可使用；如您从客户端（PC中）调用字体，则无需授权即可使用。<br>

以上内容简单可解释为：主要看调用的字体源在哪，从本地端调用，网页中字体会因为本地端有没有这款字体而改变，就不要授权；如从服务器调用字体，网页中字体无论本地有没有这款字体，均可以显示出来，则需要授权。

