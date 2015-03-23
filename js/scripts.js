var page = 1;

var shops = [];

var menu = {};
var customer = {
    id: null,
    phoneNumber: null,
    firstName: null,
    lastName: null
};
var order = {
    pos: null,
    content: {},
    sum: 0,
    visitTime: null,
    emptiness: true
};

var menuElems = [];

var map = null;

function Item(name, amount, price) {
    this.name = name;
    this.amount = amount;
    this.price = price;
}

function Shop (name, opening_time, closing_time, street, house_number, latitude, longitude, phone, town) {
    this.name = name;
    this.opening_time = opening_time;
    this.closing_time = closing_time;
    this.street = street;
    this.house_number = house_number;
    this.place = new google.maps.LatLng (latitude, longitude);
    this.phone = phone;
    this.round_the_clock = false;
    this.town = town
}

Parse.initialize("WeDR0ZQxPkgQD8eTeICgQqLGxPvUF64BXhoQkV5c", "W43O6W4YLG0VSDH9EDqLaSFxOCdCAr23ZFvjmvvD");
$(document).ready (receiptData(), preventSelection(document));

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-58458963-1', 'auto');
ga('send', 'pageview');

function receiptData () {
    $.ajax({
        url: 'php/getMenu.php',
        type: 'POST',
        cache: false,
        success: function(msg){
            var response=JSON.parse(msg);

            for(var i in response){
                var row = response[i];
                menu[row[0]] = new Item(row[1], row[2], row[3]);
                divForItem(row[0], row[1], row[2], row[3]);
                $(menuElems[row[0]]).appendTo ($('#menuList'));
            }
        }
    });

    $.ajax({
        url: 'php/authentication.php',
        type: 'POST',
        cache: false,
        success: function (msg){
            customer = JSON.parse(msg);
            if (customer['id']) {
                if (customer['firstName']) {
                    $('#customerId').html (customer['firstName'] + ' ' + customer['lastName']
                    + " <span id='customerExit'>(<span>вийти</span>)</span>");
                } else if (customer['phoneNumber']){
                    $('#customerId').html (customer['phoneNumber'] + " <span id='customerExit'>(<span>вийти</span>)</span>");
                } else {
                    $('#customerId').html (customer['mail'] + " <span id='customerExit'>(<span>вийти</span>)</span>");
                }
                $('#customerExit').css('display', 'inline');
            } else {
                $('#customerId').text ("");
            }
        }
    });

    $.ajax({
        url: 'php/getShops.php',
        type: 'POST',
        cache: false,
        success: function (msg) {
            var response = JSON.parse(msg);

            for (var r in response) {
                var row = response[r];
                shops[row[0]] = new Shop(row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8], row[9]);
                if (shops[row[0]].opening_time == null && shops[row[0]].closing_time == null) shops[row[0]].round_the_clock = true;
                if (shops[row[0]].opening_time == null) shops[row[0]].opening_time = "00:00:00";
                if (shops[row[0]].closing_time == null) shops[row[0]].closing_time = "24:00:00";
            }

            var rows = [];

            for (var i = 1; i < shops.length; ++i) {
                if (shops [i]) {
                    var shopNameTd = '<td><span id="td-' + i + '" class="shopNames">' + shops[i].name + '</span></td>';
                    var shopAddressTd = '<td>' + shops[i].street + ', ' + shops[i].house_number;
                    var phoneTd = '<td>' + shops[i].phone + '</td>';
                    rows[i] = '<tr>' + shopNameTd + shopAddressTd + phoneTd + '</tr>';

                    $(rows[i]).appendTo ($('tbody'));
                }
            }
        }
    });
}

function divForItem (id, name, amount, price){
    menuElems [id] = create("div", {Class:'menu_buttons not_pressed_button',id:'article-'+id,title:"Додати «" + name +
        "» до замовлення"},create("p",{},name),create("p", {class:'amount'},amount),
        create("p",{class:'price'},parseInt(price)+' грн'));
}

function create( name, attributes ) {
    var el = document.createElement( name );

    if ( typeof attributes == 'object' ) {
        for ( var i in attributes ) {
            el.setAttribute( i, attributes[i] );

            if ( i.toLowerCase() == 'class' ) {
                el.className = attributes[i]; // for IE compatibility

            } else if ( i.toLowerCase() == 'style' ) {
                el.style.cssText = attributes[i]; // for IE compatibility
            }
        }
    }
    for ( var j = 2; j < arguments.length; j++ ) {
        var val = arguments[j];
        if ( typeof val == 'string' ) val = document.createTextNode( val );
        el.appendChild( val );
    }
    return el;
}

function addDivSelectArticle (productId) {
    var bigDiv = '<div class="selected_articles" id="menu_content_article-' + productId + '">';
    var name = menu[productId].name;
    //var counter = '<div class="counter" id="counterOfProduct'+productId+'" title="Кількість замовлених «' +
    //    menu[productId].name + '»"> ' + order.content[productId] + '</div>';
    var counter = '<input class="counter" id="counterOfProduct' + productId + '" title="Кількість замовлених «' +
        menu[productId].name + '»" value="1">';
    var plus = '<div class="plus" id="plusProduct' + productId + '" title="Додати ще один «' + menu[productId].name +
        '» до замовлення"><strong> + </strong></div>';
    var minus = '<div class="minus" id="minusProduct' + productId + '" title="Зменшити на один «' + menu[productId].name +
        '»"><strong> - </strong></div>';
    var eliminator = '<div class="delete" id="deleteProduct'+productId+'" title="Прибрати «' + menu[productId].name +
        '» із замовлення"><strong> × </strong></div>';
    var divButtons = '<div class="orderList_buttons">' + counter + plus + minus + eliminator + '</div></div>';
    $('#selected_articles_list').append (bigDiv + name + divButtons);
}

function estimateSum(){
    order.emptiness = true;
    var tempSum = 0;
    for(var key in order.content)
    {
        tempSum  += parseFloat(menu[key].price)*order.content[key];
        order.emptiness = false;
    }
    order.sum = tempSum;
    document.getElementById('hrivnas').innerHTML = order.sum+" грн";
}

function updateQuantity(productId) {
    $('#counterOfProduct'+productId).val(order.content[productId]);
}

function removeArticleFromOrder (productId){
    var divToBeRemoved = document.getElementById ('menu_content_article-' + productId);
    divToBeRemoved.parentNode.removeChild(divToBeRemoved);
    delete order.content[productId];
}

function preventSelection(element){
    var preventSelection = false;

    function addHandler(element, event, handler){
        if (element.attachEvent)
            element.attachEvent('on' + event, handler);
        else
        if (element.addEventListener)
            element.addEventListener(event, handler, false);
    }
    function removeSelection(){
        if (window.getSelection) { window.getSelection().removeAllRanges(); }
        else if (document.selection && document.selection.clear)
            document.selection.clear();
    }
    function killCtrlA(event){
        var event = event || window.event;
        var sender = event.target || event.srcElement;

        if (sender.tagName.match(/INPUT|TEXTAREA/i))
            return;

        var key = event.keyCode || event.which;
        if (event.ctrlKey && key == 'A'.charCodeAt(0))  // 'A'.charCodeAt(0) можно заменить на 65
        {
            removeSelection();

            if (event.preventDefault)
                event.preventDefault();
            else
                event.returnValue = false;
        }
    }

    // не даем выделять текст мышкой
    addHandler(element, 'mousemove', function(){
        if(preventSelection)
            removeSelection();
    });
    addHandler(element, 'mousedown', function(event){
        var event = event || window.event;
        var sender = event.target || event.srcElement;
        preventSelection = !sender.tagName.match(/INPUT|TEXTAREA/i);
    });

    // борем dblclick
    // если вешать функцию не на событие dblclick, можно избежать
    // временное выделение текста в некоторых браузерах
    addHandler(element, 'mouseup', function(){
        if (preventSelection)
            removeSelection();
        preventSelection = false;
    });

    // борем ctrl+A
    // скорей всего это и не надо, к тому же есть подозрение
    // что в случае все же такой необходимости функцию нужно
    // вешать один раз и на document, а не на элемент
    addHandler(element, 'keydown', killCtrlA);
    addHandler(element, 'keyup', killCtrlA);
}

function rebuildPage (new_page) {
    page = new_page;
    $('.pages').hide();
    switch (new_page) {
        case 1:
            $('#left_pointer').css ('display', 'none');
            $('#right_pointer').css ('visibility', 'visible');
            $('#right_pointer').attr ('title', 'Перейти до авторизації');
            $('#menu_page').fadeIn('slow');
            $('#tip_text').text ("Зробіть замовлення");
            break;
        case 2:
            $('#left_pointer').css ('display', 'inline');
            $('#right_pointer').css ('visibility', 'visible');
            $('#left_pointer').attr ('title', 'Перейти до меню');
            $('#right_pointer').attr ('title', 'Перейти до списку кав’ярень');
            $('#authentication_page').fadeIn('slow');
            $('#phoneNumber').focus();
            $('#tip_text').text ("Вкажіть контактні дані");
            break;
        case 3:
            $('#left_pointer').css ('display', 'inline');
            $('#right_pointer').css ('visibility', 'visible');
            $('#left_pointer').attr ('title', 'Перейти до авторизації');
            $('#right_pointer').attr ('title', 'Перейти до карти');
            $('#contacts_page').fadeIn('slow');
            $('#tip_text').text ("Виберіть кав’ярню");
            break;
        case 4:
            $('#left_pointer').css ('display', 'inline');
            $('#right_pointer').css ('visibility', 'hidden');
            $('#left_pointer').attr ('title', 'Перейти до списку кав’ярень');
            $('#map_canvas').fadeIn();
            $('#tip_text').text ("Вкажіть своє розташування та оберіть кав’ярню на карті");
            if (!map) {
                initialize() ;
            } else {
                //mapReopen();
                shopWasChanged();
            }
            break;
        default:
            break;
    }
}

function delete_cookie ( cookie_name )
{
    var cookie_date = new Date();
    cookie_date.setTime ( cookie_date.getTime() - 1 );
    document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}

function preview (token){
    $.getJSON("//ulogin.ru/token.php?host=" +
        encodeURIComponent(location.toString()) + "&token=" + token + "&callback=?",
        function(data){
            data=$.parseJSON(data.toString());
            if(!data.error){
                $.post(
                    "php/uLogin.php",
                    {
                        identity: data['identity'],
                        network: data['network'],
                        first_name: data['first_name'],
                        last_name: data['last_name']
                    },
                    function(result){
                        customer = JSON.parse(result);
                        document.cookie = "userId=" + customer['id'];
                        $('#customerId').html (customer['firstName'] + ' ' + customer['lastName']
                            + " <span id='customerExit'>(<span>вийти</span>)</span>");
                        $("#customerExit").css ('display', 'inline');
                        if (order.emptiness) {
                            rebuildPage(1);
                        } else {
                            if (order.pos) {
                                rebuildPage(1);
                                $("#saveOrder").trigger('click');
                            } else {
                                rebuildPage(3);
                            }
                        }
                    }
                );
            }
        }
    );
}

function changePOS (shopId) {
    order.pos = shopId;
    $('#POS').html(shops[order.pos].name + ' (<span id="changePos">змінити</span>)');
    updateClock();
}


function checkMail (mail) {
    if (mail == "" || mail.indexOf('@', 1) == -1) {
        alert("Некоректний ввод");
        return false;
    } else {
        return true;
    }
}

function manualChangeOfQuantity (input){
    var itemId = parseInt(input.id.substr(16));
    var newValue = parseInt(input.value);
    if (typeof newValue == "number" && newValue > 0 && newValue < 100) {
        order.content[itemId] = newValue;
        updateQuantity(itemId);
        estimateSum();
    } else if (newValue == 0) {
        removeArticleFromOrder(itemId);
    } else {
        $(input).val(order.content[itemId]);
    }
    input.blur();
}

$(document).on('click', '#savePhone', function phone(){
    var phoneNum = $("#phoneNumber").val();
    var name = $("#optionName").val();
    var surname = $("#optionSurname").val();
    if (!phoneNum){
        alert ("Ви не вказали номер телефону!");
    } else {
        $.post(
            "php/phoneNumber.php",
            {
                phoneNumber: phoneNum,
                name: name,
                surname: surname,
                action: "enter"
            },
            function(result){
                customer = JSON.parse(result);
                document.cookie = "userId=" + customer['id'];
                if (customer.firstName) {
                    $("#customerId").html (customer.firstName + " " + customer.lastName
                    + " <span id='customerExit'>(<span>вийти</span>)</span>");
                } else {
                    $("#customerId").html (customer['phoneNumber'] + " <span id='customerExit'>(<span>вийти</span>)</span>");
                }
                $("#customerExit").css ('display', 'inline');
                if (order.emptiness) {
                    rebuildPage(1);
                } else {
                    if (order.pos) {
                        rebuildPage(1);
                        $("#saveOrder").trigger('click');
                    } else {
                        rebuildPage(3);
                    }
                }
            }
        );
    }
});

$(document).on('click', '#saveMail', function mail(){
    var mail = $("#mail").val();
    var name = $("#optionName").val();
    var surname = $("#optionSurname").val();
    if (!mail){
        alert ("Ви не вказали електронну пошту!");
    } else if (checkMail(mail)) {
        $.post(
            "php/mail.php",
            {
                mail: mail,
                name: name,
                surname: surname,
                action: "enter"
            },
            function(result){
                customer = JSON.parse(result);
                document.cookie = "userId=" + customer['id'];
                if (customer.firstName) {
                    $("#customerId").html (customer.firstName + " " + customer.lastName
                    + " <span id='customerExit'>(<span>вийти</span>)</span>");
                } else {
                    $("#customerId").html (customer['mail'] + " <span id='customerExit'>(<span>вийти</span>)</span>");
                }
                $("#customerExit").css ('display', 'inline');
                if (order.emptiness) {
                    rebuildPage(1);
                } else {
                    if (order.pos) {
                        rebuildPage(1);
                        $("#saveOrder").trigger('click');
                    } else {
                        rebuildPage(3);
                    }
                }
            }
        );
    }
});

$(document).on("click", 'div.menu_buttons', function(){
    $('#magicButton').css ('display', 'block');
    var articleId = parseInt(this.id.substr(8));
    if (!order.content[articleId]){
        order.content[articleId] = 1;
        addDivSelectArticle(articleId);
    } else if (order.content[articleId] < 99){
        order.content[articleId]++;
        updateQuantity(articleId);
    }
    estimateSum()
});

$(document).on('click', '.plus', function(){
    var productId = parseInt(this.id.substr(11));
    if (order.content[productId] < 99) order.content[productId]++;
    updateQuantity(productId);
    estimateSum();
});

$(document).on('click', '.minus', function(){
    var productId = parseInt(this.id.substr(12));
    order.content[productId]--;
    if(order.content[productId]){
        updateQuantity(productId);
    }else{
        removeArticleFromOrder(productId);
    }

    estimateSum();

    if (order.emptiness) {
        $('#magicButton').css ('display', 'none');
    }
});

$(document).on('click', '.delete', function(){
    var productId = parseInt(this.id.substring(13));
    removeArticleFromOrder(productId);
    estimateSum();
    if (order.emptiness) {
        $('#magicButton').css ('display', 'none');
    }
});

$(document).on('click', '#saveOrder', function submit(){
    if (!$(this).hasClass('make_new_order')) {
        if (!customer['id']){
            rebuildPage(2);
        } else if (!order.pos){
            rebuildPage(3);
        } else {
            order.visitTime = visitTime;
            $.post(
                "php/orderRecording.php",
                {
                    order: JSON.stringify(order),
                    customerId: customer ['id']
                },
                function(result){
                    if (result) {
                        $(".blocks").css ('display', 'none');
                        $("#saveOrder").addClass ('make_new_order');
                        $("#saveOrder").text ('Зробити нове замовлення');
                        var visitTimeMinutes = order.visitTime.getMinutes();
                        if (visitTimeMinutes < 10) {
                            visitTimeMinutes = '0' + visitTimeMinutes;
                        }
                        $("#thanks").html (
                            "Дякуємо!<br/></br>" +
                            "Замовлення № " + result + " прийнято на суму:" +
                            "<p class='important'>" + order.sum + " грн</p><br/>" +
                            "Заберіть його у кав’ярні:" +
                            "<p class='important'>" + shops[order.pos].name + " - " + shops[order.pos].street + ", "
                            + shops[order.pos].house_number + "</p><br/>" +
                            "Час візиту до кав’ярні:<p class='important'>" +
                            order.visitTime.getHours() + ":" + visitTimeMinutes + "<br/>" +
                            "<sub>" + order.visitTime.getDate() + " " + month_array[order.visitTime.getMonth()] + "</sub></p><br/>" +
                            "НОМЕР ЗАМОВЛЕННЯ:" + "<br/>" +
                            "<p id='order_id'>" + result + "</p>"
                        );
                        $('#thanks').css('display', 'block');
                    } else {
                        alert ("Вибачте, проводяться сервісні роботи\r\nСпробуйте замовити пізніше");
                    }
                }
            )
        }
    } else {
        $("#saveOrder").removeClass ('make_new_order');
        $("#saveOrder").text ('Замовити');
        $(".blocks").css ('display', 'block');
        $("#thanks").css ('display', 'none');
        $("#hrivnas").text ('0 грн');
        $("#magicButton").css ('display', 'none');
        order.content = {};
        updateClock();
        $(".selected_articles").remove();
    }
});

$(document).on ('click', '#POS', function (){
    rebuildPage(3);
});

$(document).on ('click', '#customerExit', function() {
    delete_cookie('userId');
    customer ['id'] = null;
    customer ['phoneNumber'] = null;
    customer ['firstName'] = null;
    customer ['lastName'] = null;
    $('#customerId').text ("");
    $('#customerExit').css ('display', 'none');
    rebuildPage(2);
});

$(function($){
    $("#phoneNumber").mask("+380 (99) 9999999");
});

document.onkeydown = function(e) {
    e = e || window.event;
    if (e.keyCode == 13) {
        return false;
    }
};

$(document).ready(function(){
    $("#phoneNumber").keypress(function(e){
        if(e.keyCode==13){
            $("#savePhone").trigger('click');
        }
    });
});

$(document).on ('click', '#authenticationLink', function() {
    rebuildPage(2);
});

$(document).on ('click', '#contactsLink', function() {
    rebuildPage(3);
});

$(document).on ('click', '#mapLink', function () {
    rebuildPage(4);
});

$(document).on ('click', '#right_pointer', function() {
    page += 1;
    rebuildPage(page);
});

$(document).on ('click', '#left_pointer', function() {
    page -= 1;
    rebuildPage(page);
});

$(document).on ('mousedown mouseup', '.plus, .minus, .delete, div.menu_buttons', function() {
    $(this).toggleClass ('pressed_button');
});

$(document).on ('mouseout', '.plus, .minus, .delete, div.menu_buttons', function() {
    $(this).removeClass ('pressed_button');
});

$(document).on ('click', '.shopNames', function() {
    changePOS(parseInt(this.id.substr(3)));

    if (order.emptiness) {
        rebuildPage(1);
    } else {
        if (customer['id']) {
            rebuildPage(1);
            $("#saveOrder").trigger('click');
        } else {
            rebuildPage(2);
        }
    }
});

$(document).on ('change', 'input:radio', function() {
    switch ($('input:radio:checked').prop('value')) {
        case 'phone':
            $('#inputPhoneBlock').fadeIn();
            $('#inputMailBlock').hide();
            $('#uLogin').hide();
            $('#inputNameBlock').hide();
            $('#inputPhoneBlock').after($('#inputNameBlock').fadeIn());
            $('#phoneNumber').focus();
            break;
        case 'mail':
            $('#inputPhoneBlock').hide();
            $('#inputMailBlock').fadeIn();
            $('#uLogin').hide();
            $('#inputNameBlock').hide();
            $('#inputMailBlock').after($('#inputNameBlock').fadeIn());
            $('#mail').focus();
            break;
        case 'socNetwork':
            $('#inputPhoneBlock').hide();
            $('#inputMailBlock').hide();
            $('#inputNameBlock').hide();
            $('#uLogin').fadeIn();
            break;
    }
});

$(document).on ('change', '#phoneNumber', function() {
    $.post(
        "php/phoneNumber.php",
        {
            phoneNumber: this.value,
            action: "check"
        },
        function(result){
            customer = JSON.parse(result);
            $("#optionName").val(customer.firstName);
            $("#optionSurname").val(customer.lastName);
        }
    );
});

$(document).on ('change', '#mail', function() {
    $.post(
        "php/mail.php",
        {
            mail: this.value,
            action: "check"
        },
        function(result){
            customer = JSON.parse(result);
            $("#optionName").val(customer.firstName);
            $("#optionSurname").val(customer.lastName);
        }
    );
});

$(document).ready (function(){
    $("#authentication_page").trigger('reset');
    $("#nav-trigger")[0].checked = false;
});

$(document).on ('focus', 'input.counter', function() {
    $(this).select();
});

$(document).on ('change', 'input.counter', function() {
    manualChangeOfQuantity(this);
});

$(document).on ('keyup', 'input.counter', function(e) {
    if (e.keyCode == 13) {
        manualChangeOfQuantity(this);
    }
});

//$(document).on ('click', '#site-wrap', function() {
//    $("#nav-trigger")[0].checked = false;
//});

$(document).on ('click', '#navigationMenu li', function() {
    switch (parseInt(this.id.substr(2))) {
        case 1:
            $("#nav-trigger")[0].checked = false;
            rebuildPage(2);
            break;
        case 2:
            //TODO
            break;
        case 3:
            //TODO
            break;
        case 4:
            $("#nav-trigger")[0].checked = false;
            rebuildPage(3);
            break;
        case 5:
            $("#nav-trigger")[0].checked = false;
            rebuildPage(4);
            break;
        default:
            break;
    }
});