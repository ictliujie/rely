/*
 * multiple event rely management
 * 事件之间是扁平的关系，即and关系，无其他组合
 * 且这里不维护事件的会话，所有的事件在同一会话中
 * 有无会话，即看是点一次有效还是点过就有效
 * @author: dive
 * @email: liujiejunior@gmail.com
 * @date 2013-05-22
 */
RELY = (function(){
	//事件的状态
	var NOT_TRIGGER = 0,  //未触发
		HAS_TRIGGER = 1;  //已触发
	//事件的相关集合
	var eventSet = {}, //事件注册的集合
		relySet = {},  //依赖关系
		reverseRelySet = {};  //反向依赖
	//获得参数数据类型
	var getType = function(arg){
		//eg.[object String] return String
		return Object.prototype.toString.call(arg).slice(8, -1);
	};
	//注册事件
	var register = function(evt){
		//如果事件已经注册，则无需再注册
		if(!eventSet.hasOwnProperty(evt)){
			eventSet[evt] = NOT_TRIGGER;
		}
	};
	//触发事件
	var fire = function(evt){
		if(eventSet[evt]) return;		
		var targets = relySet[evt],
			i = j = 0,
			e = null;
		//console.log(evt + " has beed fired");
		document.write(evt + " has beed fired<br/>");
		eventSet[evt] = HAS_TRIGGER;
		if(!targets) return;
		for(; e=targets[i]; i++){
			var sl = reverseRelySet[e];
			for(j=0, l=sl.length; j<l; j++){
				if(!eventSet[sl[j]]){
					break;
				}
			}
			if(j >= sl.length && !eventSet[e]){
				fire(e);					
			}
		}			
	};
	//公共接口
	return {
		/**
		 * @description 声明依赖关系
		 * @param srcEvts 源事件，即被依赖事件，可以是单事件或者数组
		 * @param destEvt 目标事件，即依赖事件
		 */
		rely: function(srcEvts, destEvt){
			if(arguments.length < 2) return;
			register(destEvt);
			var tp = getType(srcEvts);
			if(tp == 'String'){
				register(srcEvts);
				if(!!relySet[srcEvts]){
					relySet[srcEvts].push(destEvt);
				}else{
					relySet[srcEvts] = [destEvt];
				}
				if(!!reverseRelySet[destEvt]){
					reverseRelySet[destEvt].push(srcEvts);
				}else{
					reverseRelySet[destEvt] = [srcEvts];
				}
			}else if(tp == 'Array'){
				for(var e in srcEvts){
					var se = srcEvts[e];
					register(se);
					if(!!relySet[se]){
						relySet[se].push(destEvt);
					}else{
						relySet[se] = [destEvt];
					}
				}				
				if(!!reverseRelySet[destEvt]){
					reverseRelySet[destEvt]= reverseRelySet[destEvt].concat(srcEvts);
				}else{
					reverseRelySet[destEvt] = srcEvts;
				}
			}
		},
		/**
		 * @description 输出事件evt的依赖列表，即促发evt之前需要促发的事件列表
		 * @param evt 目标事件，或许触发的事件
		 */
		relyList4E:function(evt){
			var tmpArray = reverseRelySet[evt];
			if(tmpArray){
				while(tmpArray.length){
					var relyE = tmpArray.pop();
					if(!reverseRelySet[relyE]){
						fire(relyE);
					}else{
						tmpArray = tmpArray.concat(reverseRelySet[relyE]);
					}
				}
			}		
		},
		/**
		 * @description 销毁对象，释放对象空间
		 */
		destroy: function(){
			for(var key in eventSet){
				delete eventSet[key];
			}
			for(var key in relySet){
				delete relySet[key];
			}
			for(var key in reverseRelySet){
				delete reverseRelySet[key];
			}
			//console.log(reverseRelySet);
		}
	}
})();