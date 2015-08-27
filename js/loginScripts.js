var page = "store";
var currentShop = parseInt($.cookie("shop"));
var worker = parseInt($.cookie("worker"));
var shops = [];

$(document).ready (function() {
    if (window.document.URL.indexOf("admin") >= 0){
        page = "admin";
        worker = $.cookie("admin");
    }
    if (worker) {
        $.getScript("../js/storeScripts.js");
    }else{
        $("body").children().hide();
        $("div#authentication").show();
    }
    if (!currentShop) $("#shopName").text("Натисніть, щоб обрати кав’ярню");
});

$.post (
    "../php/getShops.php",
    function (data) {
        var response = JSON.parse(data);
        for (var r = 0; r < response.length; r++) {
            var shop = response[r];
            shops[shop[0]] = shop[1];
            $("select#shopList").append("<option value='" + shop[0] + "'>" + shop[1] + "</option>");
        }
        $("#shopName").text(shops[currentShop]);
    }
);

$(document).on ('click', 'button', function(){
    $("div.red-alert").hide();

    var usernameField = $('input[name="login"]');
    var username = usernameField.val();
    var passwordField = $('input[name="password"]');
    var password = passwordField.val();

    if (!currentShop){
        $("#shopName").css('color', '#C72929');
    }else{
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
                            window.location.reload();
                            break;
                        default:
                            break;
                    }
                }
            );
        }
    }
});

$(document).on ('change', 'select#shopList', function(){
    currentShop = parseInt(this.value);
    if (currentShop) {
        $.cookie('shop', currentShop, {"expires": 3600*24*365, "path": "/"});
        var shopNameDiv = $("#shopName");
        shopNameDiv.text(shops[this.value]);
        shopNameDiv.css('color', '#333');
    }
});

$(document).on ('click', 'select#shopList', function(){
    if ($(this).css('opacity') == '0'){
        $(this).css('opacity', '1').val(currentShop);
        $("#shopName").css('opacity', '0');
    } else {
        $(this).css('opacity', '0');
        $("#shopName").css('opacity', '1');
    }
});

$(document).on ('focusout', 'select#shopList', function(){
    $(this).css('opacity', '0');
    $("#shopName").css('opacity', '1');
});