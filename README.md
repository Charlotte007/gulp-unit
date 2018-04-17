# gulp-unit
gulp构建工具的日常维护
#### 新增多行文本溢出省略
`去掉 word-break: break-all;`
@include ml(line-height,line)     // height: lineHeight * line   固定高度  

@include mlmax(line-height,line)  // max-height: lineHeight * line  限制最大高度

#### 3d翻转兼容IE的翻转空白
@mixin ieroll(){
    backface-visibility: hidden;
	transition: 0s\9;
    transition:all ease .7s;
}


