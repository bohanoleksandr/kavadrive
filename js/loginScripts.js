var shops = [];

$.post (
    "../../php/getShops.php",
    function (data) {
        shops = JSON.parse(data);
    }
);

$(document).on ('click', 'input[type="submit"]', function(){
    $("div#authentication div").hide();

    var usernameField = $('input[name="login"]');
    var username = usernameField.val();
    var passwordField = $('input[name="password"]');
    var password = passwordField.val();
    var page = "store";
    if (window.document.URL.indexOf("admin") >= 0) page = "admin";

    if (!username) {
        usernameField. next().show();
        usernameField.css('box-shadow', '0px 0px 4px #C72929');
    } else {
        usernameField.css('box-shadow', 'none');
    }
    if (!password) {
        passwordField.next().show();
        passwordField.css('box-shadow', '0px 0px 4px #C72929');
    } else {
        passwordField.css('box-shadow', 'none');
    }

    if (username && password) {
        $.post (
            "../../php/workerAuth.php",
            {
                username: username,
                password: password,
                page: page
            },
            function (answer) {
                switch (parseInt(answer)) {
                    case 0:
                        $("#wrongAuth").show();
                        break;
                    case -1:
                        $("#noRights").show();
                        break;
                    case 1:
                        document.location.href = "index.html";
                        break;
                    default:
                        break;
                }
            }
        );
    }
});






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