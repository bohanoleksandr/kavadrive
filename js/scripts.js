google.maps.visualRefresh = true;


var map = null;
var marker = null;
var selectedMarker = null;
var autoGeo = null;
var position = null;
var infoWindow = null;
var destination = null;
var destinationLat = null;
var destinationLng = null;
var origin = null;
var originLat = null;
var originLng = null;
var myMarker = null;
var myInfoWindow = null;
var directionsService = new google.maps.DirectionsService();
var directionsDisplay;
var newOrigin = null;
var newOriginLat = null;
var newOriginLng = null;
var image = {
    url: '../images/coffee_bean.png',
    size: new google.maps.Size(20, 32),
    origin: new google.maps.Point(0,0),
    anchor: new google.maps.Point(0, 32)
};

function initialize() {

	var mapOptions = {
		center: new google.maps.LatLng(49.234637,28.469639),
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

    var rendererOptions = {
        map: map,
        suppressMarkers: true,
        preserveViewport: true
    };

    var markers_info =
        [
            ['Anzavi №1', 49.235816, 28.472736],
            ['Anzavi №2', 49.234011, 28.449756],
            ['Anzavi №3', 49.249786, 28.539958],
            ['Anzavi №4', 49.224425, 28.411044]
        ];

    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    directionsDisplay.setMap (map);

    if(navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(function(pos)
            {
                autoGeo=1;
                position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
                createMyMarker(position);
                map.setCenter(position);
            },
            function() {handleNoGeolocation(true);}
        );

        if(autoGeo===undefined){
            position = new google.maps.LatLng(49.234637,28.469639);
            createMyMarker(position);
            map.setCenter(position);
        }
    } else {
        position = new google.maps.LatLng(49.234637,28.469639);
        createMyMarker(position);
        map.setCenter(position);
        handleNoGeolocation(false);
    }

	for (var i=0; i<markers_info.length; i++)
    {
        marker = new google.maps.Marker
        ({
            position: new google.maps.LatLng(markers_info[i][1],markers_info[i][2]),
            map: map,
            icon: image
        });
        showInfoMessage (marker, i);
    }

    function showInfoMessage (marker, num)
    {
        var message = [
            '<strong>Anzavi №1</strong><br/>вул.Чкалова, 26<br/>+38(0432)555007<br/>10:00 - 19:00<br/>',//<a href="index.html">Сформувати замовлення</a>',
            '<strong>Anzavi №2</strong><br/>вул.Хмельницьке_шосе, 2<br/>+38(0432)555008<br/>9:30 - 18:30<br/>',//<a href="index.html">Сформувати замовлення</a>',
            '<strong>Anzavi №3</strong><br/>вул.Ватутіна, 52<br/>+38(0432)555009<br/>Цілодобово<br/>',//<a href="index.html">Сформувати замовлення</a>',
            '<strong>Anzavi №4</strong><br/>пр.Юності, 22<br/>+38(0432)555010<br/>Цілодобово<br/>'//<a href="index.html">Сформувати замовлення</a>'
        ];

        google.maps.event.addListener(marker, 'click', function()   //описываем функцию при наведении на маркер
        {
            if (infoWindow) {
                infoWindow.close();
            }

            if (myInfoWindow) {
                myInfoWindow.close();
            }

            if (selectedMarker === marker){
                location.href = 'order.html';
            }

            infoWindow = new google.maps.InfoWindow({
                content: message[num]
            });

            infoWindow.open(marker.get('map'), marker);
            destinationLat = marker.getPosition().lat();
            destinationLng = marker.getPosition().lng();
            originLat = myMarker.getPosition().lat();
            originLng = myMarker.getPosition().lng();
            destination = new google.maps.LatLng(destinationLat,destinationLng);
            origin = new google.maps.LatLng(originLat,originLng);
            getRoute(origin, destination);
            selectedMarker = marker;
        });

        google.maps.event.addListener (marker, 'dblclick', function(){
            location.href = 'order.html';
        });
    }

    function getRoute(start, end)
    {
        var selectedMode = "DRIVING";
        var request =
        {
            origin: start,
            destination: end,
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

    function createMyMarker (position)
    {
        if(myMarker!==null)
        {
            myMarker.setMap(null);
        }

        myMarker = new google.maps.Marker({
            position: position,
            map: map,
            icon: "https://maps.google.com/mapfiles/kml/shapes/library_maps.png",
            draggable:true
        });

        myInfoWindow = new google.maps.InfoWindow({
            content: '<b>Ваше місцезнаходження</b><br/><sup>Ви можете перетягнути цей маркер</sup></sup><br/>'
        });

        google.maps.event.addListener(myMarker, 'dragend', function(){
            newOriginLat = myMarker.getPosition().lat();
            newOriginLng = myMarker.getPosition().lng();
            newOrigin = new google.maps.LatLng(newOriginLat,newOriginLng);
            getRoute (newOrigin,destination);
        });

        google.maps.event.addListener(myMarker, 'click', function() {
            if (infoWindow) {
                infoWindow.close();
            }

            myInfoWindow.open(myMarker.get('map'), myMarker);
        });
    }

}
			
google.maps.event.addDomListener(window, 'load', initialize);
			
Parse.initialize("WeDR0ZQxPkgQD8eTeICgQqLGxPvUF64BXhoQkV5c", "W43O6W4YLG0VSDH9EDqLaSFxOCdCAr23ZFvjmvvD");
		
var TestObject = Parse.Object.extend("TestObject");
var testObject = new TestObject();
  testObject.save({foo: "bar"}, {
  success: function(object) {
    $(".success").show();
  },
  error: function(model, error) {
    $(".error").show();
  }
});

$(document).ready(function(){
	$('.pull-me').click(function(){
		$('.panel').slideToggle('slow');
	});
})

