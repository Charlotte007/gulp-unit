// 单例: 弹窗；ajax jsonp
var getSingle = function(fn){
	var result;
	return function(){
		return result || (result= fn.apply(this,arguments)); // window  inner-arguments
	}
}

// 策略：表单验证
var Validator = function(){
	this.cache = [];
};
Validator.prototype.add = function( dom, rules ){ // 收集
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
// 代理模式 proxy：保护代理（js难以实现）和虚拟代理（常用）








// 

function EvEmitter() {}

var proto = EvEmitter.prototype;

proto.on = function( eventName, listener ) {
  if ( !eventName || !listener ) {
	return;
  }
  // set events hash
  var events = this._events = this._events || {};
  // set listeners array
  var listeners = events[ eventName ] = events[ eventName ] || [];

  if ( listeners.indexOf( listener ) == -1 ) {
	listeners.push( listener );
  }
  return this;
};

proto.once = function( eventName, listener ) {
  if ( !eventName || !listener ) {
	return;
  }
  // add event
  this.on( eventName, listener );
  // set once flag
  // set onceEvents hash
  var onceEvents = this._onceEvents = this._onceEvents || {};
  // set onceListeners object
  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // set flag
  onceListeners[ listener ] = true;
  return this;
};

proto.off = function( eventName, listener ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
	return;
  }
  var index = listeners.indexOf( listener );
  if ( index != -1 ) {
	listeners.splice( index, 1 );
  }

  return this;
};

proto.emitEvent = function( eventName, args ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
	return;
  }
  // copy over to avoid interference if .off() in listener
  listeners = listeners.slice(0);
  args = args || [];
  // once stuff
  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  for ( var i=0; i < listeners.length; i++ ) {
	var listener = listeners[i]
	var isOnce = onceListeners && onceListeners[ listener ];
	if ( isOnce ) {
	  // remove listener
	  // remove before trigger to prevent recursion
	  this.off( eventName, listener );
	  // unset once flag
	  delete onceListeners[ listener ];
	}
	// trigger listener
	listener.apply( this, args );
  }

  return this;
};

proto.allOff = function() {
  delete this._events;
  delete this._onceEvents;
};

TargetFn.prototype = Object.create( EvEmitter.prototype );


