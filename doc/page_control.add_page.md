#page_control.add_page( page_controler )

**return** : none

----------
**page_controler**  
*type��frame page��ģ��*

����Ĳ�����һ��seajsģ�飬���ģ��Ӧ�ñ�¶�����ӿ�

>**route**
*type : json*
ҳ���·�����ã�������[backbone��route][1]

```javascript
exports.route = { "index": "index"  }
```
Ҳ�����齨��������url hash
```javascript
exports.route = { "last/:art_id": "last"  }    //��ƥ�� #last/1000 ��url hash

exports.route = { "cat/:cat_id/:art_id": "cat"  }    //��ƥ�� #cat/2/1000 ��url hash
```

Ҳ��ͨ��()���÷�ǿ�Ʋ���
```javascript
exports.route = { "hot/(:is_big_img)": "hot"  }    //��ƥ�� #hot �� #hot/true

exports.route = { "cat/:cat_id/(:art_id)": "cat"  }    //��ƥ�� #cat/2/1000 �� #cat/2
```

url��������ҳ��� `page_init` `page_show` �ȼ����½��յ�

```
//ҳ��·������
exports.route = { "last/:art_id": "last"  }
exports.new_page_entity = function()
{
	options.page_init = function(page_view , params)
	{
        //params��һ�����飬������url���ݵĲ���
	    var art_id = params[0]    //url�ĵ�һ����������art_id
	}

	var page = require('page').new_page(options)
	return page     //���return  frame page��ʵ��
} 
```

----------

>**new_page_entity**
*type : function return��frame page��*
�����ҳ��ҵ������д������ݣ�**�÷���������returnһ��[frame page��ʵ��][2]**

 
����Ҫ���һ��ҳ�� index
```javascript
page_control.init( $('.page_container'),{
	default_index_route : "index"
})

var index_page = require('index')

page_control.add_page(index_page)
```

index.js�ļ����£�
```javascript
define(function(require, exports)
{
	var page_control = require('page_control')
	
	//ҳ��·������
	exports.route = { "index": "index"  }

	exports.new_page_entity = function()
	{
		//ҳ������
		var options = {
			transition_type : 'none'
		}
		
		options.initialize = function()
		{
			//ҳ���ʼ��
		}

		
		options.events = {
			...
			...
			...
		}
		     
		var page = require('page').new_page(options)
		
		return page		//���return  frame page��ʵ��
	}	
})
```

  [1]: http://www.css88.com/doc/backbone/#Router
  [2]: https://www.zybuluo.com/mansonchor/note/5894