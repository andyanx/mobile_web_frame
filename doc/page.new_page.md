#page.new_page( [options] )

@**return** {frame page类实例}

@**param** {json} options

>{json} **route** ： 页面的路由配置，基础是[backbone的route][1]

```javascript
options.route = { "index": "index"  }
```
也可以组建带参数的url hash
```javascript
options.route = { "last/:art_id": "last"  }    //能匹配 #last/1000 等url hash

options.route = { "cat/:cat_id/:art_id": "cat"  }    //能匹配 #cat/2/1000 等url hash
```

也可通过()设置非强制参数
```javascript
options.route = { "hot/(:is_big_img)": "hot"  }    //能匹配 #hot 和 #hot/true

options.route = { "cat/:cat_id/(:art_id)": "cat"  }    //能匹配 #cat/2/1000 和 #cat/2
```

url参数可在页面的 `page_init` `page_show` 等监听下接收到

```
//页面路由配置
options.route = { "last/:art_id": "last"  }

options.page_init = function(page_view , params)
{
	//params是一个数组，依次是url传递的参数
	var art_id = params[0]    //url的第一个参数，即art_id
}

return options

```

>{string}  **title** ： 路由到该页面时，浏览器的title显示

>{bool}  **dom_not_cache** [defalut false]： 当前页面返回上一页面后，是否把该页从dom remove掉

>{bool}  **ignore_exist** [defalut false]： 当路由到该页面已经存在时，是否忽略存在再另外新建一个页面

这里几个情况要说明一下：

1.一些静态的页面，创建了之后建议保留下来；需要每次动态获取数据的页面，可以设置成true

2.当路由到一个页面时，框架会自动判断是否已经存在，假如存在将不会重新创建一个新页面，除非 **ignore_exist为true**

3.路由到一个存在的页面时，**不会触发 page_init 监听**


>{emum} **transition_type** [ none , slide  , ~~slide reverse~~ , slideup , fade ] ：页面的转场效果 


[效果DEMO][1]

>{json} **events** ：页面的事件定义，语法 参考[backbone视图（view）的events][2] 


在page里，可以定义监听各种手势事件，底层依赖的是[hammer][3]

- **tap**  单击
- **doubletap**  双击
- **hold**  长按
- **touch** 接触屏幕
- **release** 离开屏幕
- **swipe, swipeup, swipedown, swipeleft, swiperight**   拨动和按方向拨动
- **pinch, pinchin, pinchout** 缩放，缩小，放大

```javascript
options.events = {
	'tap' : function(ev)
	{
		alert('tap')
	},
	'doubletap' : function(ev)
	{
		alert('doubletap')
	}
}
```

[DEMO][4]


>{function} **initialize** ： 如果定义了该函数，页面view创建时会调用

一般用作page框架render

>{function} **page_init** ： 如果定义了该函数，页面view创建时会调用

它的调用在initialize之后，一般用作异步获取数据等操作

>{function} **page_before_show** ： 如果定义了该函数，页面在进入可视区域前会调用

>{function} **page_show** ： 如果定义了该函数，页面在完全进入可视区域后会调用

它和 page_before_show 的调用时机差别，在于转场效果会占用一定的动画时间
假如没有转场效果，理论上 page_before_show 和 page_show 的调用时间一致


>{function} **page_before_hide** ： 如果定义了该函数，页面在退出可视区域前会调用

>{function} **page_hide** ： 如果定义了该函数，页面在完全退出可视区域后会调用

两个页面之间的切换，进场页面的 page_show 是呼应着退场页面的 page_hide 的

[DEMO][5]


>{function} **window_change** ： 如果定义了该函数，页面在屏幕范围大小变化时会调用

例如：手机横竖屏变化、某些浏览器导航条的折叠等，都会引发


###**page_view和参数的触发回调**

```javascript
options.page_init = function(page_view , params , state)
{
    console.log(page_view)        //页面view
    console.log(params)           //url hash参数
    console.log(state)            //页面间传递的参数
}
```

在 `page_init` `page_before_show` `page_show` `window_change` 的回调中，会带上参数，方便控制进行业务开发

  [1]: http://mansonchor.github.io/mobile_web_frame/demo/transition_type.html
  [2]: http://documentcloud.github.io/backbone/#View-extend
  [3]: http://eightmedia.github.io/hammer.js/
  [4]: http://mansonchor.github.io/mobile_web_frame/demo/events.html
  [5]: http://mansonchor.github.io/mobile_web_frame/demo/page_function.html