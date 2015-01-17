var page = 1;

var shops = [];
google.maps.visualRefresh = true;
var map = null;
var markers = [];
var selectedMarker = null;
var autoGeo = false;
var position = null;
var infoWindow = null;
var destination = null;
var myMarker = null;
var myInfoWindow = null;
var directionsService = new google.maps.DirectionsService();
var directionsDisplay;
var image = {
    url: '../images/coffee_bean.png',
    size: new google.maps.Size(20, 32),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(0, 32)
};
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
    visitTime: null
};

var menuElems = [];

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
$(document).ready (receiptData());

function receiptData () {
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

            initialize();
            preventSelection(document);
        }
    });

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
                $(menuElems[row[0]]).appendTo ($('ul'));
            }
        }
    });

    $.ajax({
        url: 'php/authentication.php',
        type: 'POST',
        cache: false,
        success: function (msg){
            customer = JSON.parse(msg);
            console.log (customer);
            if (customer['id']) {
                if (customer['firstName']) {
                    $('#customerId').html ("Ви авторизувалися як " + customer['firstName'] + ' ' + customer['lastName']
                        + " <span id='customerExit'>(вийти)</span>");
                } else {
                    $('#customerId').text("Ви авторизувалися як користувач із номером телефону" + customer['phoneNumber']
                        + " <span id='customerExit'>(вийти)</span>");
                }
                $('#customerExit').css('display', 'inline');
            } else {
                $('#customerId').text ("Ви не авторизовані");
            }
        }
    });
}

function initialize() {

    var mapOptions = {
        center: new google.maps.LatLng(49.0275,31.482778),
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var rendererOptions = {
        map: map,
        suppressMarkers: true,
        preserveViewport: true,
        polylineOptions: {
            strokeColor: "#792A26",
            strokeWeight: 4
        }
    };

    var bodyHeight = document.body.offsetHeight;

    console.log ('body ' + bodyHeight);

    var mapHeight = bodyHeight - 205;

    console.log (mapHeight);

    $("#map_canvas").css ('height', mapHeight);

    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    directionsDisplay.setMap (map);

    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(function(pos)
            {
                autoGeo = true;
                position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                createMyMarker();
                map.setCenter(position);
                map.setZoom (12);
                getRoute();
            },
            function() {handleNoGeolocation(true);}
        );

        if(!autoGeo){
            position = new google.maps.LatLng(49.233083,28.468217);
            createMyMarker();
            map.setCenter(position);
        }

    } else {
        position = new google.maps.LatLng(49.233083,28.468216);
        createMyMarker();
        map.setCenter(position);
        handleNoGeolocation(false);
    }

    for (var i = 1; i < shops.length; i++) {
        if (shops[i]) {
            markers[i] = new google.maps.Marker
            ({
                position: shops[i].place,
                map: map,
                icon: image
            });

            google.maps.event.addListener (markers[i], 'click', function () {

                if (selectedMarker === this) {
                    page = 2;
                    rebuild();
                } else {
                    selectShop(markers.indexOf(this));
                }
            });
        }
    }

    google.maps.event.addListener (map, 'click', function(event) {
        position = event.latLng;
        createMyMarker();
    });

}

function selectShop (id){
    var marker = markers[id];
    var shop = shops[id];
    var message = '<strong>' + shop.name + '</strong><br/>' + shop.street + ', ' + shop.house_number +
        '<br/>' + shop.phone + '<br/>Час роботи: ' + shop.opening_time.substring(0, 5) + ' - ' +
        shop.closing_time.substring(0, 5) + '<br/><a class="createOrderInfoMessage">Зробити замовлення</a>';
    var destinationLat = marker.getPosition().lat();
    var destinationLng = marker.getPosition().lng();
    destination = new google.maps.LatLng(destinationLat, destinationLng);

    if (myInfoWindow) {
        myInfoWindow.close();
    }

    if (infoWindow) {
        infoWindow.close();
    }

    infoWindow = new google.maps.InfoWindow({
        content: message
    });

    infoWindow.open(marker.get('map'), marker);

    $('.createOrderInfoMessage').on('click', function() {
        page = 2;
        rebuild();
    });

    selectedMarker = marker;
    order.pos = id;
    document.getElementById('POS').innerHTML = "Ви обрали кав’ярню " + shops[order.pos].name +
    ' (<span id="changePos">змінити</span>)';
    getRoute();
    updateClock();
}

function getRoute()
{
    var selectedMode = "DRIVING";
    var request =
    {
        origin: position,
        destination: destination,
        travelMode: google.maps.TravelMode[selectedMode],
        unitSystem: google.maps.UnitSystem.METRIC
    };
    if (destination) {
        directionsService.route(request, function(response, status)
        {
            if (status == google.maps.DirectionsStatus.OK)
            {
                directionsDisplay.setDirections(response);
            }
        });
    }
}

function createMyMarker ()
{
    if (myMarker) myMarker.setMap (null);

    myMarker = new google.maps.Marker({
        position: position,
        map: map,
        icon: "https://maps.google.com/mapfiles/kml/shapes/library_maps.png",
        draggable:true
    });

    myInfoWindow = new google.maps.InfoWindow({
        content: '<b>Ви тут</b>'
    });

    myInfoWindow.open (myMarker.get('map'), myMarker);

    getRoute();

    google.maps.event.addListener (myMarker, 'dragend', function(){
        var newOriginLat = myMarker.getPosition().lat();
        var newOriginLng = myMarker.getPosition().lng();
        position = new google.maps.LatLng(newOriginLat,newOriginLng);
        getRoute ();
    });

    google.maps.event.addListener(myMarker, 'click', function() {
        if (infoWindow) {
            infoWindow.close();
        }
        myInfoWindow.open(myMarker.get('map'), myMarker);
    });
}

function divForItem (id, name, amount, price){
    menuElems [id] = create("li",{},create("div", {Class:'menu_buttons',id:'article-'+id,title:"Додати «" + name +
        "» до замовлення"},create("p",{},name),create("p", {class:'amount'},amount),
    create("p",{class:'price'},parseInt(price)+' грн')));
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
    var bigDiv = '<div class="selected_articles">';
    var name = menu[productId].name;
    var counter = '<div class="counter" id="counterOfProduct'+productId+'" title="Кількість замовлених «' +
        menu[productId].name + '»">× ' + order.content[productId] + '</div>';
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
    var tempSum = 0;
    for(var key in order.content)
    {
        tempSum  += parseFloat(menu[key].price)*order.content[key];
    }
    order.sum = tempSum;
    document.getElementById('hrivnas').innerHTML = order.sum+" грн";
}

function updateQuantity(productId) {
    document.getElementById('counterOfProduct'+productId).innerHTML = "× " + order.content[productId];
}

function removeArticleFromOrder (productId){
    var divToBeRemoved = document.getElementById ('selected_article-'+productId);
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

function rebuild () {
    $('.pages').hide();
    switch (page) {
        case 1:
            $('#left_pointer').css ('display', 'none');
            $('#right_pointer').css ('visibility', 'visible');
            $('#right_pointer').attr ('title', 'Перейти до меню');
            $('#map_canvas').fadeIn();
            $('#tip_text').text ("Вкажіть своє розташування та оберіть кав’ярню на карті");
            break;
        case 2:
            $('#left_pointer').css ('display', 'inline');
            $('#right_pointer').css ('visibility', 'visible');
            $('#left_pointer').attr ('title', 'Перейти до карти');
            $('#right_pointer').attr ('title', 'Перейти до авторизації');
            $('#menu_page').fadeIn('slow');
            $('#tip_text').text ("Зробіть замовлення");
            break;
        case 3:
            $('#left_pointer').css ('display', 'inline');
            $('#right_pointer').css ('visibility', 'visible');
            $('#left_pointer').attr ('title', 'Перейти до меню');
            $('#right_pointer').attr ('title', 'Перейти до контактів');
            $('#authentication_page').fadeIn('slow');
            $('#tip_text').text ("Вкажіть контактні дані");
            break;
        case 4:
            $('#left_pointer').css ('display', 'inline');
            $('#right_pointer').css ('visibility', 'hidden');
            $('#left_pointer').attr ('title', 'Перейти до авторизації');
            $('#contacts_page').fadeIn('slow');
            $('#tip_text').text ("");
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

function preview(token){
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
                        console.log(customer);
                        document.cookie = "userId=" + customer['id'];
                        console.log (document.cookie);
                        $('#customerId').html ("Ви авторизувалися як " + customer['firstName'] + ' ' + customer['lastName']
                            + " <span id='customerExit'>(вийти)</span>");
                        $("#customerExit").css ('display', 'inline');
                        page = 2;
                        rebuild();
                    }
                );
            }
        }
    );
}

$(document).on('click', '#savePhone', function phone(){
    var phoneNum = $("#phoneNumber").val();
    if (!phoneNum){
        alert ("Ви не вказали номер телефону!");
    }else{
        $.post("php/phoneNumber.php", "phoneNum=" + phoneNum, function(result){
            customer = JSON.parse(result);
            console.log(customer);
            document.cookie = "userId=" + customer['id'];
            console.log (document.cookie);
            if (customer.firstName) {
                $("#customerId").html ("Ви авторизувалися як " + customer.firstName + " " + customer.lastName
                    + " <span id='customerExit'>(вийти)</span>");
            } else {
                $("#customerId").html ("Ви авторизувались як користувач із номером телефону" + customer['phoneNumber']
                    + " <span id='customerExit'>(вийти)</span>");
            }
            $("#customerExit").css ('display', 'inline');
            page = 2;
            rebuild();
        });
    }
});

$(document).on("click", 'div.menu_buttons', function(){
    $('#magicButton').css ('display', 'block');
    var articleId = parseInt(this.id.substr(8));
    if (order.content[articleId]){
        order.content[articleId]++;
        updateQuantity(articleId);
    }
    else{
        order.content[articleId] = 1;
        addDivSelectArticle(articleId);
    }
    estimateSum()
});

$(document).on('click', '.plus', function(){
    var productId = parseInt(this.id.substr(11));
    order.content[productId]++;
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
    var emptiness = true;
    for (var i in order.content) {
        emptiness = false;
    }
    if (emptiness) {
        $('#magicButton').css ('display', 'none');
    }
    estimateSum();
});

$(document).on('click', '.delete', function(){
    var productId = parseInt(this.id.substring(13));
    removeArticleFromOrder(productId);
    var emptiness = true;
    for (var i in order.content) {
        emptiness = false;
    }
    if (emptiness) {
        $('#magicButton').css ('display', 'none');
    }
    estimateSum();
});

$(document).on('click', '#saveOrder', function submit(){
    if (!$(this).hasClass('make_new_order')) {
        if (!customer['id']){
            page = 3;
            rebuild();
        } else if (!order.pos){
            page = 1;
            rebuild();
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

$(document).on ('click', '#changePos', function (){
    page = 1;
    rebuild();
});

$(document).on ('click', '#customerExit', function() {
    delete_cookie('userId');
    customer ['id'] = null;
    customer ['phoneNumber'] = null;
    customer ['firstName'] = null;
    customer ['lastName'] = null;
    $('#customerId').text ("Ви не авторизовані");
    $('#customerExit').css ('display', 'none');
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
    page = 3;
    rebuild();
});

$(document).on ('click', '#contactsLink', function() {
    page = 4;
    rebuild();
});

$(document).on ('click', '#right_pointer', function() {
    page += 1;
    rebuild();
});

$(document).on ('click', '#left_pointer', function() {
    page -= 1;
    rebuild();
});

$(document).on ('mousedown mouseup', '.plus, .minus, .delete, .pointers, div.menu_buttons', function() {
    $(this).toggleClass ('pressed_button');
});

$(document).on ('mouseout', '.plus, .minus, .delete, .pointers, div.menu_buttons', function() {
    $(this).removeClass ('pressed_button');
});

$(document).on ('click', '.shopNames', function() {
    var shopId = parseInt(this.id.substr(3));
    var shopCoords = shops[shopId].place;
    page = 1;
    map.setCenter (shopCoords);
    selectShop(shopId);
    rebuild();
});

$(window).resize (function() {
    var bodyHeight = document.body.offsetHeight;
    var mapHeight = bodyHeight - 205;
    console.log (mapHeight);
    $("#map_canvas").css ('height', mapHeight);
});