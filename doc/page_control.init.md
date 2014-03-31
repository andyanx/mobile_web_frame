#page_control.init( container , [options] )

**return** : none


----------

**container**  
*type��dom | zepto����*
����ҳ������� 


**options**
*type : json����*

>**default_index_route**
*type : string*
�����ν���Ӧ��û��ָ��·�ɵ�ַʱ��Ĭ���Զ�·�ɵ��õ�ַ

----------
>**default_title**
*type : string*
�������title��ʾ��ҳ��û���ض�titleʱ��Ĭ����ʾ�İ�

----------
>**before_route**
*type : function*
�ڿ�����·����Ӧ֮ǰ����

----------
>**after_route**
*type : function*
�ڿ�����·����Ӧ֮�󴥷�

����ʾ��
``` javascript
var $ = require('zepto')
var page_control = require('page_control')

page_control.init( $('.page_container') ,
{
	default_title : "xxxxx",
	default_index_route : "index",
	before_route : function()
	{
		alert('before_route ')
	},
	after_route : function()
	{
		alert('after_route ')
	}
})
```