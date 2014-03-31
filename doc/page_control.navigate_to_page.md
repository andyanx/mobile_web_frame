#page_control.navigate_to_page( page , [state] , [replace] , [transition] )

**return** : none

----------

**page**  
*type��string*
Ҫ·�ɵ���ҳ�� hash

```javascript
page_control.navigate_to_page('last')    //·�ɵ�hash��Ӧ��last��ҳ��
page_control.navigate_to_page('last/1000')    //��������ҳ��·��
page_control.navigate_to_page('last/1000/big')
```

**state**  
*type��json*
Ҫ���ݸ�ҳ������ݣ������� `page_init` `page_show` �Ⱥ����յ�

```javascript
page_control.navigate_to_page('last' , { art_id : 1000 })    //·�ɵ�last�������ݲ���
```

```javascript
options.page_init = function(page_view , params , state)
{
	//state���� navigate ʱ���ݵĲ�������
	var art_id = state.art_id
}
```

����Ҫ������url hash������������

���������������ҳ���ִ��·��ʱ���ݲ�����`��Ӧ������ǿ������Ĵ���`����ֱ�Ӵ򿪶�Ӧҳ���ˢ��ҳ��ʱ��������û�а취���ݣ���Ϊ����ǰ������ҳ��֮���·�ɽ���

����ĳ��ҳ��Ĳ����Ǳ���ģ���ʹ��url hash�������ķ���


**replace**  
*type��bool*

����backbone��˵����To update the URL without creating an entry in the browser's history

ʵ��ʹ��ʱ��ȴ���滻����һ�ε��������ʷ

���� `�ò���������`



**transition**  
*type : emum( none , slide , ~~slide reverse~~ , slideup , fade )*

ǿ������ת��Ч��������Ŀ��ҳ���趨�� transition_type 
