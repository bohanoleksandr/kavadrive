
//вывод списка магазинов
var req = getXmlHttp();

vote('../../php/getShops.php',function () {
	for(var i in this){
		$('#shopList').append('<option value="' + this[i][0] + '">' + this[i][1] + '</option>');
	}
});

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
//
function vote(phpFile, callback) {

	req.open('GET', phpFile, true);
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			if(req.status == 200) {
				callback.call(JSON.parse(req.responseText));
			}
		}
	}
	req.send(null);
}

//скрыть список магазинов, если это администратор
$(document).ready(function(){
	$('input:radio').click(function(){
		if($("input:radio:checked").val() == '2'){
			$('#shopList').hide();
		}else{
			$('#shopList').show();
		}
	});
});