// 单例: 弹窗；ajax jsonp
var getSingle = function(fn){
	var result;
	return function(){
		return result || (result= fn.apply(this,arguments)); // window  inner-arguments
	}
}

// 策略
var Validator = function(){
	this.cache = [];
};
Validator.prototype.add = function( dom, rules ){
	var self = this;
	for ( var i = 0, rule; rule = rules[ i++ ]; ){
		(function( rule ){
			var strategyAry = rule.strategy.split( ':' );
			var errorMsg = rule.errorMsg;
			self.cache.push(function(){
				var strategy = strategyAry.shift();
				strategyAry.unshift( dom.value );
				strategyAry.push( errorMsg );
				return strategies[ strategy ].apply( dom, strategyAry );
			});
		})( rule )
	}
};
Validator.prototype.start = function(){
	for ( var i = 0, validatorFunc; validatorFunc = this.cache[ i++ ]; ){
		var errorMsg = validatorFunc();
		if ( errorMsg ){
			return errorMsg;
		}
	}
};
