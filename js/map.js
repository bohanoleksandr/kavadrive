google.maps.visualRefresh = true;
var autoGeo = false;
var directionsService = new google.maps.DirectionsService();
var directionsDisplay;
var markers = [];
var infoWindow = null;
var infoMessages = [];
var client_location = null;
var myMarker = null;
//var myInfoWindow = null;

var image = {
    url: '../images/coffee_bean.png',
    size: new google.maps.Size(20, 32),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(0, 32)
};

function initialize() {

    var mapOptions = {
        center: new google.maps.LatLng(49.233083,28.468217),
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
    var mapHeight = bodyHeight - 110;
    $("#map_canvas").css ('height', mapHeight);

    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    directionsDisplay.setMap (map);

    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(function(pos)
            {
                autoGeo = true;
                client_location = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                createMyMarker();
                map.setCenter(client_location);
                map.setZoom (12);
                getRoute();
            },
            function() {handleNoGeolocation(true);}
        );

        if(!autoGeo){
            client_location = new google.maps.LatLng(49.233083,28.468217);
            createMyMarker();
            map.setCenter(client_location);
        }

    } else {
        client_location = new google.maps.LatLng(49.233083,28.468216);
        createMyMarker();
        map.setCenter(client_location);
        handleNoGeolocation(false);
    }

    for (var i = 1; i < shops.length; i++) {
        if (shops[i]) {
            var makeAnOrder = null;
            var press = null;
            switch (currentLang) {
                case "ukr":
                    makeAnOrder = "Зробити замовлення";
                    press = "Натисніть, щоб обрати кав’ярню ";
                    break;
                case "eng":
                    makeAnOrder = "Make an order";
                    press = "Press to choose the cafe ";
                    break;
                case "rus":
                    makeAnOrder = "Сделать заказ";
                    press = "Нажмите, чтобы выбрать кафе ";
                    break;
                default:
                    break;
            }

            markers[i] = new google.maps.Marker
            ({
                position: shops[i].place,
                map: map,
                icon: image,
                title: press + '"' + shops[i]['name'] + '"'
            });

            google.maps.event.addListener (markers[i], 'click', function () {
                if (markers.indexOf(this) == order.pos) {
                    rebuildPage(1);
                } else {
                    changePOS(markers.indexOf(this));
                    shopWasChanged();
                }
            });



            infoMessages[i] = '<b>' + shops[i].name + '</b><br/><a class="createOrderInfoMessage">' + makeAnOrder + '</a>'
                //+ '<br/>Час роботи: ' + shops[i].opening_time.substring(0, 5) + ' - ' + shops[i].closing_time.substring(0, 5)
                + '<br/>' + $("div#shop" + i + " li.timeShop").text()
                + '<br/>' + shops[i].phone + '<br/>' + shops[i].street + ', ' + shops[i].house_number;
        }
    }

    google.maps.event.addListener (map, 'click', function(event) {
        client_location = event.latLng;
        createMyMarker();
    });

}

function getRoute()
{
    var selectedMode = "DRIVING";

    if (order.pos) {
        var request =
        {
            origin: client_location,
            destination: shops[order.pos].place,
            travelMode: google.maps.TravelMode[selectedMode],
            unitSystem: google.maps.UnitSystem.METRIC
        };
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
        position: client_location,
        map: map,
        icon: "https://maps.google.com/mapfiles/kml/shapes/library_maps.png",
        draggable:true
    });

    if (infoWindow) infoWindow.close();

    var youAreHere = null;
    switch (currentLang) {
        case "ukr":
            youAreHere = "<b>Ви тут</b>";
            break;
        case "eng":
            youAreHere = "<b>You are here</b>";
            break;
        case "rus":
            youAreHere = "<b>Вы здесь</b>";
            break;
        default:
            break;
    }

    infoWindow = new google.maps.InfoWindow({
        content: youAreHere
    });

    infoWindow.open (map, myMarker);

    getRoute();

    google.maps.event.addListener (myMarker, 'dragend', function(){
        var newOriginLat = myMarker.getPosition().lat();
        var newOriginLng = myMarker.getPosition().lng();
        client_location = new google.maps.LatLng(newOriginLat,newOriginLng);
        getRoute ();
    });

    google.maps.event.addListener(myMarker, 'click', function() {
        if (infoWindow.map) infoWindow.close();
        createMyMarker();
    });
}

function shopWasChanged (){
    if(infoWindow) infoWindow.close();
    infoWindow = new google.maps.InfoWindow({
        content: infoMessages[order.pos]
    });
    infoWindow.open(map, markers[order.pos]);
    $('.createOrderInfoMessage').on('click', function() {
        rebuildPage(1);
    });
    getRoute();
}

$(window).resize (function() {
    var bodyHeight = document.body.offsetHeight;
    var mapHeight = bodyHeight - 110;
    $("#map_canvas").css ('height', mapHeight);
});