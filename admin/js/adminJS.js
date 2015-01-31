var goods = [];

$(document).ready(function(){
	//создание и заполнение вкладок
	createTabs('1');
	function createTabs(activeTab){
		 vote('../../php/getShops.php',null,function () {
			for(var i in this){
				var classActive ='';
				var num = this[i][0];
				var name = this[i][1];	
				if(num==activeTab){
					classActive ='active';
				}		 	
				$('.nav-tabs').append('<li class="shop'+(parseInt(i)+1)+' '+classActive+'"><a href="#tab'+num+'"data-toggle="tab">'+name+'</a></li>');
				addTabContent(this[i][0],classActive,num,name);
			}
		});
	}
	//создание контента для каждой вкладки
	function addTabContent(shopNumber,classActive,num,name){
		vote('../../php/checkRemains.php',"shopNumber="+shopNumber,function(){
			goods = this;
			var list = '';	
			for(var i in this){
				list+='<tr><td>'+this[i]['name']+'</td><td>'+this[i]['quantity']+'</td><td>'+this[i]['unit']+'</td></tr>';
			}  
			$('.tab-content').append('<div class="tab-pane '+classActive+'" id="tab'+num+'"><h3>Залишки товару на складі магазину '+name+'</h3><table class="table table-bordered table-condensed"><thead><tr><th>Назва</th><th>Залишок</th><th>Од. вим.</th></thead><tbody>'+list+'</tbody></table></div>');
		});	
	}
	//кросбраузерный XmlHttp
	function getXmlHttp(){	
		var xmlhttp;
		try {
		xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
		try {
		  xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		} catch (E) {
		  xmlhttp = false;
		}
		}
		if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
		xmlhttp = new XMLHttpRequest();
		}
		return xmlhttp;
	}
	//Для запроса на сервер
	function vote(phpFile,param,callback) {
		var req = getXmlHttp();
		req.open('POST', phpFile, true); 	
		req.onreadystatechange = function() { 
			if (req.readyState == 4 && req.status == 200) {
					callback.call(JSON.parse(req.responseText));					
			}
		}
		req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		req.send(param); 
	}
	//кнопка "Вихід"
	$('.exit').click(function(){
		 window.location.href = "../store/login.html";
	});
	//заполнение модального окна
	$('.btn-block').click(function(){
		$('.list').empty();
	    //заполнение списка товаров используемых при создании Приходной Накладной
		for(var i in goods){
			$('.addItem').append('<option>'+goods[i]['name']+'</option>');
		}
		$('#modalWindow').modal();
	});
	//добавление наименований в накладную
	var addedItem = [];
	$('.add').click(function(){		
		var num = '';
		for(var i=0;i<10;i++){
			if($("li.shop"+i).hasClass("active")){
					num = i;
			}
		}
		var item = document.getElementById('selectedItem').value;
		var itemId = '';
		var quantity = document.getElementById('quantity').value;
		//проверка заполнения поля quantity
		if(quantity==''){
			document.getElementById('quantity').style.background = '#FDD3D3';
			document.getElementById('quantity').focus();
			return false;
		}else{
			document.getElementById('quantity').style.background = 'none';
		}
		//определить ед. измерения
		var unit = '';
		for(var i in goods){
			if(item==goods[i]['ingredient']){
				unit = goods[i]['unit'];
				itemId = goods[i]['id'];
				//в массив добавляем для создания Приходной накладной и отправки на сервер
				var copy = goods[i];
				copy['quantity'] = quantity;
				copy['shop'] = num;
				addedItem.push(copy);
			}
		}			
		$('.list').append('<tr><td>*</td><td>'+item+'</td><td>'+quantity+'</td><td>'+unit+'</td><td><div class="btn btn-danger pull-right delete" id ="'+itemId+'">Видалити</div></td></tr>');
		//обнулить к-ство
		document.getElementById('quantity').value = '';	
	});	
	//удалить добавленый ряд
	$(document).on('click','.delete',function(){
		//Поиск и удаление элемента из массива
		for(var i in addedItem){
			if(this.id==addedItem[i]['id']){
				addedItem.splice(i,1);
			}
		}
		$(this).parent().parent().remove();		
	});
	//создание html-стр для печати накладной
	$('.print').click(function(){
		console.log(addedItem);
		var date=new Date();
		var formatDate = date.getDate() + '/' +  (date.getMonth() + 1) + '/' +  date.getFullYear();
		var list = rows();
		var sum = 0;
		var worker = '';
		var win = window.open('','','left=50,top=50,width=800,height=640,toolbar=0,scrollbars=1,status=0');
		win.document.open();		
		win.document.writeln('<html><head><title>Друк накладної</title>'+
								'<link href="../css/bootstrap.min.css" rel="stylesheet" type="text/css"/>'+
								'<link href="../store/css/store_styles.css" rel="stylesheet" type="text/css"/>'+
								'</head><body>'+
								'<div class="btn-group buttons"> <div class="btn btn-primary" onclick="window.print();">Друк</div>'+
									'<div class="btn" onclick="window.close();">Закрити</div></div><hr>'+
									'<h4>Кавово-чайна компанія Anzavi</h4>'+
									'<h3>Прихідна накладна </h3>'+
									'<h5 class="date">Від '+formatDate+'</h5>'+
									'<table class="table table-bordered table-condensed">'+ 
										'<thead>'+
											'<tr>'+
											  '<th>№</th>'+
											  '<th>Назва</th>'+
											  '<th>К-сть</th>'+
											  '<th>Од. вим.</th>'+
											'</tr>'+
										'</thead>'+
										'<tbody class="listInvoice"> '+ list +  								
									'	</tbody>'+
									'</table>'+
								'<h5>Відповідальний '+worker+'</h5>'+	
								'</div></body></html>');
		//создание списка наименований для накладной
		function rows(){
			var str="";
			for(var i=0;i<addedItem.length;i++){
					str+=	'<tr><td>'+(i+1)+'</td><td>'
							+addedItem[i]['ingredient']+'</td><td>'
							+addedItem[i]['quantity']+'</td><td>'
							+addedItem[i]['unit']+'</td></tr>'	
			}	
			return str;			
		}		
	});
	
	$('.addToDatabase').click(function(){
			if(addedItem.length>0){
				//передача списка на сервер
				var products = JSON.stringify(addedItem);
				console.log(products);
				vote('php/addProducts.php',"products="+products,function(){
					$('#modalWindow').modal('hide');
					$('.nav-tabs').empty();
					$('.tab-content').empty();
					createTabs(addedItem[0]['shop']);
					addedItem = [];
				});
			}else{
				alert('Список товарів пустий!');
			}
		}
	);
});
	