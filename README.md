# gulp-unit
gulp构建工具的日常维护
#### 新增多行文本溢出省略
`去掉 word-break: break-all;`对英文排版造成的影响<br>
`display: -webkit-box;`是兼容性较差，行内元素不要直接使用；首选 display: block/inline-block; 再调用`多行文本溢出省略`

```` css
@include ml(line-height,line)     // height: lineHeight * line   固定高度  <br>

@include mlmax(line-height,line)  // max-height: lineHeight * line  限制最大高度 <br>
````

#### 3d翻转兼容IE的翻转内容白屏
```` css
@mixin ieroll(){
    backface-visibility: hidden;
	transition: 0s\9; // IE过去时间重置为零
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