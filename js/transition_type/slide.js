define(function(require, exports)
{
	var $ = require('zepto')
	var page_control = require('page_control')
	
	function new_page_entity()
	{
		var options = {
			route : { "slide": "slide"  },
			transition_type : 'slide'
		}

		options.initialize = function()
		{
			this.$el.css('background','blue')

			this.$el.html('<span>返回</span>')
		}

		
		options.events = {
			'tap span' : function(ev)
			{
				page_control.back()
			}
		}
		
		return options
	}	
	
	return new_page_entity
})