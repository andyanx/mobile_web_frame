define("frame/page",["ua",'base_package'],function(require, exports)
{
	var $ = require('zepto')
	var ua = require('ua')
	
	//add by manson 2013.5.19底层事件绑定调整
	require('hammer')($)
	$(document.body).hammer({ swipe_velocity : 0.2 })

	
	exports.new_page = function(options)
	{
		var Backbone = require('backbone')

		var options = options || {}
		var page_view_class = Backbone.View.extend
		({
			tagName :  "div",
			className : "apps_page",
			title : options.title,
			manual_title : options.manual_title,
			dom_not_cache : options.dom_not_cache,
			transition_type : options.transition_type,
			ignore_exist : options.ignore_exist || false,
			without_his : options.without_his || false,
			events : options.events,
			render : options.render,
			page_show : options.page_show,
			page_before_show : options.page_before_show,
			page_back_show : options.page_back_show,
			page_init : options.page_init,
			window_change : options.window_change,
			page_before_hide : options.page_before_hide,
			page_hide : options.page_hide,
			page_lock : false,
			initialize : function()
			{
				//转场防事件穿透遮罩层  add by manson 2014.3.5
				this.$el.append('<div class="tran_cover"></div>')
				
				if(typeof(options.initialize)=="function")
				{
					options.initialize.call(this)
				}
			},
			open_cover : function()
			{
				this.$_('.tran_cover').show()
			},
			close_cover : function()
			{
				var that = this
				setTimeout(function(){
					that.$_('.tran_cover').hide()
				},300)
				
			},
			$_ : function(selector)
			{
				return this.$el.find(selector)
			}
		})


		return new page_view_class
	}
})

/**
  *	 页面导航 + 转场控制
  */
define("frame/page_control",['base_package',"ua","frame_package"],function(require, exports){	
	
	var Backbone = require('backbone')
	var $ = require('zepto')
	var ua = require('ua')
	var page_class = require('page')
	
	var zIndex = 10000
	var PAGE_HIS_BUFF = new Array()
	var _MOVE = null
	var _ORIGINAL_CONTAINER
	var _LAST_PAGE_VIEW = null
	var _PAGE_PARAMS_ARR = new Array()
	var _TEMP_STATE = {}
	var TO_PAGE_VIEW = {}
	var FROM_PAGE_VIEW = {}
	var DEFAULT_INDEX_ROUTE
	var DEFAULT_TITLE
	var BEFORE_ROUTE
	var AFTER_ROUTE
	var IS_BACKWARD = null
	var NAVIGATE_WIHTOUT_HIS = null
	var NAVIGATE_CUSTOM_TANSITION = null
	var PAGE_IS_TRANSIT = false
	var ANDROID_NO_TRANSITION = true   			//android是否转场动画
	

	function IS_FUNCTION(judge_obj)
	{
		return typeof(judge_obj)=="function"
	}

	function SEARCH_PAGE_IN_BUFF(url_hash)
	{
		var search_page_view = false

		$(PAGE_HIS_BUFF).each(function(index , buff_obj)
		{
			for (key in buff_obj)
			{
				if(key==url_hash)
				{
					search_page_view = buff_obj[key]

					return false
				}
			}
		})

		return search_page_view
	}

	//路由配置
	var app_route_class = Backbone.Router.extend()
	
	var APP_ROUTE = new app_route_class
	
	exports.init = function(original_container,options)
	{
		var that = this
		var options = options || {}
		DEFAULT_INDEX_ROUTE = options.default_index_route || ""
		DEFAULT_TITLE = options.default_title || ""
		BEFORE_ROUTE = options.before_route || ""
		AFTER_ROUTE = options.after_route || ""

		_ORIGINAL_CONTAINER = original_container;
		
		if(DEFAULT_INDEX_ROUTE)
		{
			//匹配修正跳转链接 没有带hash的情况  add by manson 2013.6.28
			APP_ROUTE.route("" , "" , function()
			{
				that.navigate_to_page(DEFAULT_INDEX_ROUTE , {} , true)
			})
		}
	}
	

	exports.route_start = function()
	{
		//Backbone.history.start({ pushState:true , root: "/hotbed/bsz_frame/"})
		Backbone.history.start()
	}
	
	exports.navigate_to_page = function( page , state , replace , transition )
	{
		if(PAGE_IS_TRANSIT) return

		_TEMP_STATE = state

		_MOVE = "forward"
		
		var replace = (replace==null) ? false : replace
		var trigger = (trigger==null) ? true: trigger

		NAVIGATE_WIHTOUT_HIS = replace
		NAVIGATE_CUSTOM_TANSITION = (transition==null) ? false : transition

		APP_ROUTE.navigate(page ,{trigger: true, replace: replace} )
	}

	exports.back = function()
	{
		if(PAGE_IS_TRANSIT) return

		if(PAGE_HIS_BUFF.length <= 1 )
		{
			if(DEFAULT_INDEX_ROUTE!="")
			{
				this.navigate_to_page(DEFAULT_INDEX_ROUTE)

				setTimeout(function()
				{
					FROM_PAGE_VIEW.remove()
				},1000)
			}

			return false
		}
		
		_MOVE = "backward"
		
		window.history.back()
	}
	

	exports.page_history = function()
	{
		return PAGE_HIS_BUFF
	}

	exports.window_change_page_triger = function()
	{
		if(IS_FUNCTION(TO_PAGE_VIEW.window_change))
		{
			TO_PAGE_VIEW.window_change.call(this,TO_PAGE_VIEW);
		}
	}

	//返回当前页面view
	exports.return_current_page_view = function()
	{
		return TO_PAGE_VIEW
	}
	
	//返回转场状态
	exports.page_transit_status = function()
	{
		return PAGE_IS_TRANSIT
	}

	exports.add_page = function(page_controller_arr)
	{
		var that = this
		
		$(page_controller_arr).each(function(i , page_entity)
		{
			if(!IS_FUNCTION(page_entity)) return true

			var page_options = page_entity()

			var route = page_options.route || false

			if(route)
			{
				for (key in route)
				{
					APP_ROUTE.route(key , route[key] , function(params,params_2,params_3)
					{
						trriger_page_route(page_options,page_entity,params,params_2,params_3)
					})
				}
			}
		})
	}

	function get_current_url()
	{
		return window.location.href
	}

	function get_obj_key_value(obj)
	{
		var key,value
		for(key in obj)
		{
			key = key
			value = obj[key]
		}

		return { key : key , value : value }
	}


	function new_page_entity(page_entity)
	{
		var page_options = page_entity({ custom_tansition : NAVIGATE_CUSTOM_TANSITION , without_his : NAVIGATE_WIHTOUT_HIS })
		var new_page_view = page_class.new_page(page_options)

		return new_page_view
	}

	function trriger_page_route(page_options,page_entity,params,params_2,params_3)
	{
		var that = this

		//修正兼容用浏览器前进后退的情况  add by manson 2013.7.23
		if(PAGE_IS_TRANSIT) return

		_PAGE_PARAMS_ARR = []
		_PAGE_PARAMS_ARR.push(params)
		_PAGE_PARAMS_ARR.push(params_2)
		_PAGE_PARAMS_ARR.push(params_3)

		var url_hash = get_current_url()
		
		if(IS_FUNCTION(BEFORE_ROUTE))
		{
			BEFORE_ROUTE.call(that)
		}
		
		var have_exist = false
		var have_exist = $(_ORIGINAL_CONTAINER).find('[page-url="'+url_hash+'"]').length
		
		IS_BACKWARD = check_route_is_backward()


		//前进操作
		if(!IS_BACKWARD)
		{
			if(have_exist && !page_options.ignore_exist)
			{
				var exist_view = $(_ORIGINAL_CONTAINER).find('[page-url="'+url_hash+'"]').data('page-view')
				
				if(exist_view)
				{
					exist_view.$el.css({'top' : "0px"})

					_transit_page(_LAST_PAGE_VIEW , exist_view , exist_view.transition_type , false)
				}
				else
				{
					var new_page_view = new_page_entity(page_entity)
					
					create_page(new_page_view,false)
				}
			}
			else
			{
				var new_page_view = new_page_entity(page_entity)

				create_page(new_page_view,false)
			}
		}
		//后退操作
		else
		{
			PAGE_HIS_BUFF.pop()

			if(have_exist)
			{
				//var exist_buff = PAGE_HIS_BUFF[PAGE_HIS_BUFF.length - 1]
				//var exist_view = get_obj_key_value(exist_buff).value

				var exist_view = $(_ORIGINAL_CONTAINER).find('[page-url="'+url_hash+'"]').data('page-view')
				
				//console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>' , exist_view)

				_transit_page(_LAST_PAGE_VIEW , exist_view , _LAST_PAGE_VIEW.transition_type , true)

				setTimeout(function(){ exist_view.$el.css({'top' : "0px"}) },10)
			}
			else
			{
				var new_page_view = new_page_entity(page_entity)

				create_page(new_page_view,true)
			}
		}


		if(IS_FUNCTION(AFTER_ROUTE))
		{
			AFTER_ROUTE.call(that)
		}
	}


	function create_page(page_obj , is_back)
	{
		var that = this
		var page_view = page_obj

		var url_hash = get_current_url()

		page_view.$el.attr('page-url',url_hash)
		page_view.$el.data('page-view',page_view)

		
		//新建页面
		page_view.$el.css({
			'visibility':'hidden',
			'top' : "0px",
			'zIndex' : zIndex
		})
		
		zIndex++

		$(_ORIGINAL_CONTAINER).prepend(page_view.$el)

		//page_init		
		if(IS_FUNCTION(page_view.page_init))
		{
			page_view.page_init.call(that , page_view,_PAGE_PARAMS_ARR,_TEMP_STATE)
		}

		var transition_type = page_view.transition_type
		_transit_page(_LAST_PAGE_VIEW , page_view , transition_type , is_back)
	}

	function _transit_page(from_view , page_view , transition_type , is_back)
	{
		var url_hash = get_current_url()

		//转场处理
		_start_page_transition(from_view , page_view , transition_type , is_back)

		
		//页面历史记录处理
		if(!is_back)
		{
			var buff_obj = {}
			buff_obj[url_hash] = page_view

			if(page_view.without_his)
			{
				//特殊路由
				PAGE_HIS_BUFF[PAGE_HIS_BUFF.length - 1] = buff_obj
			}
			else
			{
				PAGE_HIS_BUFF.push(buff_obj)
			}
		}
		
		_LAST_PAGE_VIEW = TO_PAGE_VIEW
	}


	function check_route_is_backward()
	{
		var url_hash = location.href

		var history_length = PAGE_HIS_BUFF.length


		if(history_length > 1)
		{
			var last_two_buff = PAGE_HIS_BUFF[history_length-2]
			
			var result = false
			for(key in last_two_buff)
			{
				if(_MOVE!="forward" && key==url_hash)
				{
					result = true
				}
			}

			return result
		}
		else
		{
			return false
		}
		
	}
	
	function _start_page_transition(from_page_view,to_page_view,transition_type,is_back)
	{
		var that = this
		var __slide_transition_time = '400ms'
		var __slideup_transition_time = '400ms'
		var __fade_transition_time = '400ms'
		var __ease_timingfunction = 'ease'
	
		var to_page_element_keyframe,from_page_element_keyframe

		TO_PAGE_VIEW = to_page_view
		FROM_PAGE_VIEW = from_page_view
		
		//android低版本系统忽略转场动画
		if( ANDROID_NO_TRANSITION && ua.isAndroid)
		{
			transition_type = "none"
		}
		

		//页面即将进入转场前触发   add by manson 2013.5.30
		if(IS_FUNCTION(to_page_view.page_before_show))
		{
			to_page_view.page_before_show.call(that,to_page_view,_PAGE_PARAMS_ARR,_TEMP_STATE)
		}
		
		
		from_page_view && from_page_view.open_cover()

		//上一页面即将离开转场前触发   add by manson 2013.7.31
		if(from_page_view && IS_FUNCTION(from_page_view.page_before_hide))
		{
			from_page_view.page_before_hide.call(that,from_page_view);
		}
		
		switch(transition_type)
		{
			case "slide" :
				
				if(!is_back)
				{
					to_page_element_keyframe = 'slideinfromright'
					from_page_element_keyframe = 'slideoutfromleft'
				}
				else
				{
					to_page_element_keyframe = 'slideinfromleft'
					from_page_element_keyframe = 'slideoutfromright'
				}

				animation_timing_function = __ease_timingfunction
				animation_duration = __slide_transition_time

				break
			case "slide_reverse" :
				
				if(!is_back)
				{
					to_page_element_keyframe = 'slideinfromleft'
					from_page_element_keyframe = 'slideoutfromright'
				}
				else
				{
					to_page_element_keyframe = 'slideinfromleft'
					from_page_element_keyframe = 'slideoutfromright'
				}

				animation_timing_function = __ease_timingfunction
				animation_duration = __slide_transition_time

				break;
			case "slideup" :
				
				if(!is_back)
				{
					to_page_element_keyframe = 'slideupinfrombottom'
					from_page_element_keyframe = 'slideupoutfromtop'
				}
				else
				{
					to_page_element_keyframe = 'slideupinfromtop'
					from_page_element_keyframe = 'slideupoutfrombottom'
				}

				animation_timing_function = __ease_timingfunction
				animation_duration = __slideup_transition_time

				break
			case "fade" :
				
				to_page_element_keyframe = 'fadein'
				from_page_element_keyframe = 'fadeout'

				animation_timing_function = __ease_timingfunction
				animation_duration = __fade_transition_time

				break
			
			default :

				to_page_element_keyframe = 'none'
				from_page_element_keyframe = 'none'
				
				animation_timing_function = __ease_timingfunction
				animation_duration = '10ms';
				break
		}
		
		//正在转场
		PAGE_IS_TRANSIT = true
		
		if(to_page_element_keyframe)
		{
			var to_page_element = TO_PAGE_VIEW.el

			//进场页面
			to_page_element.style.webkitAnimationDuration = animation_duration
			to_page_element.style.webkitAnimationTimingFunction = animation_timing_function
			to_page_element.style.visibility = 'visible'
			to_page_element.style.webkitAnimationName = to_page_element_keyframe
			

			//退场页面
			if(FROM_PAGE_VIEW)
			{
				var from_page_element = FROM_PAGE_VIEW.el

				from_page_element.style.webkitAnimationDuration = animation_duration
				from_page_element.style.webkitAnimationTimingFunction = animation_timing_function
				from_page_element.style.webkitAnimationName = from_page_element_keyframe
			}
			else
			{
				PAGE_IS_TRANSIT = false
			}
			

			setTimeout(function()
			{
				TO_PAGE_VIEW.close_cover()

				if(IS_FUNCTION(TO_PAGE_VIEW.page_back_show) && IS_BACKWARD)
				{
					TO_PAGE_VIEW.page_back_show.call(that,TO_PAGE_VIEW,_PAGE_PARAMS_ARR,_TEMP_STATE);
				}

				if(IS_FUNCTION(TO_PAGE_VIEW.page_show))
				{
					TO_PAGE_VIEW.page_show.call(that,TO_PAGE_VIEW,_PAGE_PARAMS_ARR,_TEMP_STATE);
				}

				__tansition_end_page_dom_control()
				
			},parseInt(animation_duration))
		}
	}

	function __tansition_end_page_dom_control()
	{
		PAGE_IS_TRANSIT = false

		var that = this

		var from_page_element = FROM_PAGE_VIEW && FROM_PAGE_VIEW.el
		var to_page_element = TO_PAGE_VIEW.el
		
		//页面转换动态改变title   add by manson 2013.11.15
		if(TO_PAGE_VIEW.manual_title!=true)
		{
			if(TO_PAGE_VIEW.title)
			{
				document.title = TO_PAGE_VIEW.title
			}
			else
			{
				document.title = DEFAULT_TITLE
			}
		}
			
		if(from_page_element)
		{
			$(from_page_element).css({'top' : "-3000px"});
			
			if( IS_FUNCTION(FROM_PAGE_VIEW.page_hide) )
			{
				FROM_PAGE_VIEW.page_hide.call(that)
			}
			
			//移除页面
			if(FROM_PAGE_VIEW.dom_not_cache==true && IS_BACKWARD)
			{
				FROM_PAGE_VIEW && FROM_PAGE_VIEW.remove()
			}
			
			if(TO_PAGE_VIEW.without_his)
			{
				FROM_PAGE_VIEW && FROM_PAGE_VIEW.remove()
			}
		}
		
		_MOVE = null
		IS_BACKWARD = null
	}
})



define("frame/view_scroll",["base_package","ua"],function(require, exports){

	var $ = require('zepto')
	var ua = require('ua')
	

	//lazyload属性暂时统一用 lazyload_src，不做传参，模板需按格式整合  add by manson 2013.10.23
	function lazyload_control(scroll_view_obj)
	{
		var trigger_range = 200			//触发lazyload的增加范围

		var that = this
		var cur_scroll_y = Math.abs(that.y)
		var scroll_view_height = $(scroll_view_obj).height()

		$(scroll_view_obj).find('[lazyload_src]').each(function(i,img_obj)
		{
			var jq_img_obj = $(img_obj)
			
			var position = jq_img_obj.position()
			var position_top = position.top
			var img_height = jq_img_obj.height()
			
			//console.log(position_top)

			if(position_top + img_height > 0 && position_top < scroll_view_height + trigger_range)
			{
				var img_url = jq_img_obj.attr('lazyload_src')
				jq_img_obj.attr('src',img_url).removeAttr('lazyload_src')
			}
		})
	}


	exports.new_scroll = function(scroll_view_obj,options)
	{
		var that = this
		that.options = options
		var options = that.options || {}
		var view_height = options.view_height || "100%"
        var use_lazyload = options.use_lazyload || false
        var bounce = options.bounce || false

        var scroll_end = options.scroll_end || function(){}
		var scroll_start = options.scroll_start || function(){}
        var scroll_move = options.scroll_move || function(){}
        var scroll_refresh = options.scroll_refresh || function(){}
        
        var top_offset = options.top_offset?options.top_offset : 0
        var hideScrollbar = options.hideScrollbar==null ? true : options.hideScrollbar

		$(scroll_view_obj).css('height' , view_height+'px')

		
		//针对高版本系统ios
		if( ua.ios_version<"6" || ua.isAndroid || true )
		{
			var iscroll_class = require('iScroll')

			$(scroll_view_obj).css({'position':'relative'})
			
			var myScroll = new iscroll_class($(scroll_view_obj)[0],
            {
				checkDOMChanges : true,
				bounce : bounce,
				hideScrollbar : hideScrollbar,
                useTransform: true,
				useTransition : false,
                topOffset : top_offset,
                zoom: false,
				onScrollEnd : function()
				{
				    if(typeof scroll_end == 'function')
                    {
                        scroll_end.call(this,scroll_view_obj)
                    }
				    
					if(use_lazyload)
					{
						lazyload_control.call(this,scroll_view_obj)
					}
				},
				onScrollStart : function()
				{
					
					if(typeof scroll_start == 'function')
                    {
                        scroll_start.call(this,scroll_view_obj)
                    }
				},
				onScrollMove : function()
				{
                    
				    if(typeof scroll_move == 'function')
                    {
                        scroll_move.call(this,scroll_view_obj)
                    }
				},
				onRefresh : function ()
				{
				    if(typeof scroll_refresh == 'function')
                    {
                        scroll_refresh.call(this,scroll_view_obj)
                    }
				}
			})		  	
	  			
		}
		else
		{
			$(scroll_view_obj).addClass('touch_scroll_css')
		}

		//返回的对象
		var scroll_obj = {}

		scroll_obj.scroll_to = function(top)
		{
			if(myScroll)
			{
				myScroll.scrollTo(0,top,0)
			}
			else
			{
				scroll_view_obj[0].scrollTop = top
			}
		}
		
		scroll_obj.trigger_scrollend = function()
		{
			if(myScroll)
			{
				myScroll.options.onScrollEnd()
			}
		}
        
        scroll_obj.refresh = function()
        {
            if(myScroll)
			{
				myScroll.refresh()
			}
        }

		return scroll_obj
	}
})

if(typeof(process_add)=="function")
{
	process_add()
}