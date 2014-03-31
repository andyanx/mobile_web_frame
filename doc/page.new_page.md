#page.new_page( [options] )

**return** : frame page��ʵ��

----------

**options**
*type : json����*

>**title**
*type : string*
·�ɵ���ҳ��ʱ���������title��ʾ

----------
>**dom_not_cache(defalut : false)**
*type : bool*
��ǰҳ�淵����һҳ����Ƿ�Ѹ�ҳ��dom remove��


---------
>**ignore_exist(defalut : false)**
*type : bool*
��·�ɵ���ҳ���Ѿ�����ʱ���Ƿ���Դ����������½�һ��ҳ��


���Ｘ�����Ҫ˵��һ�£�
1.һЩ��̬��ҳ�棬������֮���鱣����������Ҫÿ�ζ�̬��ȡ���ݵ�ҳ�棬�������ó�true
2.��·�ɵ�һ��ҳ��ʱ����ܻ��Զ��ж��Ƿ��Ѿ����ڣ�������ڽ��������´���һ����ҳ�棬���� **ignore_existΪtrue**
3.·�ɵ�һ�����ڵ�ҳ��ʱ��**���ᴥ�� page_init ����**

----------
>**transition_type**
*type : emum( none , slide  , ~~slide reverse~~ , slideup , fade )*
ҳ���ת��Ч��

[Ч��DEMO][1]

----------
>**events**
*type : json*
ҳ����¼����壬�﷨ �ο�[backbone��ͼ��view����events][2]


��page����Զ���������������¼����ײ���������[hammer][3]

- **tap**  ����
- **doubletap**  ˫��
- **hold**  ����
- **touch** �Ӵ���Ļ
- **release** �뿪��Ļ
- **swipe, swipeup, swipedown, swipeleft, swiperight**   �����Ͱ����򲦶�
- **pinch, pinchin, pinchout** ���ţ���С���Ŵ�

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


----------
>**initialize**
*type : function*
��������˸ú�����ҳ��view����ʱ�����

һ������page���render

----------
>**page_init**
*type : function*
��������˸ú�����ҳ��view����ʱ�����

���ĵ�����initialize֮��һ�������첽��ȡ���ݵȲ���

----------
>**page_before_show**
*type : function*
��������˸ú�����ҳ���ڽ����������ǰ�����


----------
>**page_show**
*type : function*
��������˸ú�����ҳ������ȫ����������������

���� page_before_show �ĵ���ʱ���������ת��Ч����ռ��һ���Ķ���ʱ��
����û��ת��Ч���������� page_before_show �� page_show �ĵ���ʱ��һ��

----------
>**page_before_hide**
*type : function*
��������˸ú�����ҳ�����˳���������ǰ�����

----------
>**page_hide**
*type : function*
��������˸ú�����ҳ������ȫ�˳��������������

����ҳ��֮����л�������ҳ��� page_show �Ǻ�Ӧ���˳�ҳ��� page_hide ��

[DEMO][5]

----------
>**window_change**
*type : function*
��������˸ú�����ҳ������Ļ��Χ��С�仯ʱ�����

���磺�ֻ��������仯��ĳЩ��������������۵��ȣ���������


  [1]: http://my.poco.cn/hotbed/webapp_frame/demo/transition_type.html
  [2]: http://documentcloud.github.io/backbone/#View-extend
  [3]: http://eightmedia.github.io/hammer.js/
  [4]: http://my.poco.cn/hotbed/webapp_frame/demo/events.html
  [5]: http://my.poco.cn/hotbed/webapp_frame/demo/page_function.html