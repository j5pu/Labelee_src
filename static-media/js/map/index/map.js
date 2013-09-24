/*(function () {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());*/

    var blinkingMode = null;
    function blinker(element, dst) {

    if (blinkingMode != null && element != null
        && element.parentElement.childNodes[1].innerHTML.trim()==blinkingMode
        && dst == prev_dest) {
        color = element.parentElement.style.backgroundColor;
        if (color == "red") {

            if (element.checked)
            {
            element.parentElement.style.backgroundColor = "darkorange";}
            else {

                element.parentElement.style.backgroundColor = "";
            }
        } else {

            element.parentElement.style.backgroundColor = "red";
        }
        window.setTimeout(function () {
            blinker(element, dst);
        }, 1000);
    } else {

        if (element != null) element.parentElement.style.backgroundColor = "";
    }
}


//
// VARIABLES GLOBALES
//

var Map = {};

//
//Configuración inicial del mapa
var map = L.map('map', {
    crs: L.CRS.Simple,
    zoom: 0,
    minZoom: 0,
    maxZoom: 3,
//Ojo, 'trackResize' desactiva la gestión 'orientationchange' automática
//    trackResize: false,
    zoomControl: false
    /*
     tapTolerance: 30,
     inertiaThreshold: 5,
     inertiaDeceleration: 2000,
     inertiaMaxSpeed: 1000
     */
});

var showOrigin = false;

//
//Configuración de iconos

//var txtIcon = L.divIcon({className: 'txt-icon'});
var carIcon = L.divIcon({className: 'my-div-icon car-icon'}),
    destIcon = L.divIcon({className: 'my-div-icon dest-icon'}),
    originIcon = L.divIcon({className: 'my-div-icon locate-icon'}),
    podometerIcon = L.divIcon({className: 'my-div-icon podo-icon'});
var txtIcon = new L.icon({
    iconUrl: '/media/texticon.png',
    iconRetinaUrl: '/media/texticon.png',
    iconSize: [1, 1],
    iconAnchor: [0, 0],
    //popupAnchor: [0,0],
    labelAnchor: [-12, 17]
});

//Carga de datos globales
var qrPoint = mapData.qrPoint;

var mapW = Math.min($(window).innerWidth(), $(window).innerHeight()),
//var mapH = $(document).height(),//Altura de la pantalla
//var mapW = window.innerWidth,//Anchura de la pantalla
    baseLayers = {},
    layersControl = new L.control.layers(null, null, {collapsed: false}),
    floor_loaded_index = 0,
    totalPois = new L.LayerGroup(),
    qrFloor,
    qrLoc,
    carLoc,
    prev_dest = null,
    carMarker,
    route = {},
    pathLine = {},
    arrowHead = [],
    arrowOffset = 0,
    qrMarker = new L.Marker(),
    destMarker = new L.Marker(),
    subpath = [],
    subarrow = [],
    floors_indexed = {},
    current_floor = null,
    floors = mapData.floors;

var label_categories = mapData.label_categories;
var layercategories_indexed = {};
var selected_category_index;

var label_categories_indexed = {};
for (var category_index in label_categories) {
    var category_name = label_categories[category_index].name;
    label_categories_indexed[category_name] = category_index;
    label_categories[category_index].layer = new L.LayerGroup();

    label_categories[category_index].layer.index = category_index;
    label_categories[category_index].layer.type = 1; // tipo 1 es para categorias

    layersControl.addOverlay(
        label_categories[category_index].layer,
        '<i class="icon-' + label_categories[category_index].icon + ' icon-white"></i>'
    );
}

//POIs de cada floor, separados para pintarlos por capas
for (var i in floors) {
    // Clonamos cada objeto label_categories para asignarlo a cada planta
    floors[i].categories = jQuery.extend(true, {}, label_categories);
    for (var category_index in floors[i].categories) {
        floors[i].categories[category_index] = [];
    }
}

// Indexamos la lista de plantas por su id
for (var i in floors) {
    floors_indexed[floors[i].id] = floors[i];
}

var floors_indexed_id_list = Object.keys(floors_indexed); //  ["60", "62", "67", "68"]


var loadedLabels = false;

var anim = null;
var flechita = null;


//=============== FIN DE VARIABLES GLOBALES ==================


function loadIcon(shape) {
    var icon = L.divIcon({
        className: "my-div-icon icon-white icon-" + shape
    });
    return icon;
}




//Carga de plantas
function loadFloors() {


    for (var floor_index in floors) {

        var img;
        var name = floors[floor_index].name;

        if (!Modernizr.svg) {

            img = floors[floor_index].imgB;

        }
        else {

            img = floors[floor_index].img || floors[floor_index].imgB;

        }

        var floorImg = new Image();
        floorImg.src = img;
        floorImg.onload = function (index) {
            var mapH = mapW;
            var bounds = new L.LatLngBounds(new L.LatLng(0, 0), new L.LatLng(mapH, mapW));

            floors[index].scaleX = mapW / floors[index].num_cols;
            floors[index].scaleY = mapH / floors[index].num_rows;
            floors[index].bounds = bounds;

            floors[index].photo = new L.LayerGroup();
            floors[index].img = new L.imageOverlay(img, bounds);
            floors[index].img.position = index;

            floors[index].photo.addLayer(floors[index].img);
            baseLayers[name] = floors[index].img;

            floor_loaded_index++;

            if (floor_loaded_index == floors.length) {

                loadPOIs();
                initMap(qrPoint);
                LocalStorageHandler.init();
                initSideMenu();
                $('div#cupones, div#header, span.locator, div#marquee').show();
                Coupon.init();
                $('div.splash').fadeOut(100);

                //
                // Habilitamos el uso de la brújula para orientar la flecha
/*
                Compass.init();

                pedometer_navigator = new PedometerNavigator($('span#navigator'));
                pedometer_navigator.init();
*/
            }
        }(floor_index);
    }
}

//Carga de POIs
function loadPOIs() {
    var layer_index = 1;
    for (var floor_index in floors) {
        floors[floor_index].layer = new L.layerGroup();

        for (var poi_index in floors[floor_index].pois) {

            var current_poi = floors[floor_index].pois[poi_index];

            if (current_poi.id === poi_id) {
                // Si es el último no hacemos nada. Si no, lo sacamos
                if (poi_index == floors[floor_index].pois.length - 1)
                    break;
                else
                    floors[floor_index].pois.splice(poi_index, 1);
            }
            var colorIcon = current_poi.label.category.color,
                nameIcon = current_poi.label.name,
                shapeIcon = current_poi.label.category.icon,
                id = current_poi.id,
                floorid = current_poi.floor,
                floorname = floors_indexed[floorid].name;


            var description = current_poi.description,
                panorama = current_poi.panorama,
                coupon = current_poi.coupon,
                sX = floors[floor_index].scaleX,
                sY = floors[floor_index].scaleY,
                loc = [(current_poi.row) * sY + (sY),
                    current_poi.col * sX + (sX)],
                center = [(current_poi.center_x) * sY + (sY),
                    current_poi.center_y * sX + (sX)],
                labelid = current_poi.label.id,
                category = current_poi.label.category.name,
                category_en = current_poi.label.category.name_en;

            var popupTitle = description;
            popupTitle += SocialMenu.renderIcon(id);

            current_poi.marker = new L.marker(center, {
                icon: loadIcon(shapeIcon)});

            current_poi.marker.poid = id;
            current_poi.marker.floorid = floorid;
            current_poi.marker.floorname = floorname;
            current_poi.marker.psX = sX;
            current_poi.marker.psY = sY;
            current_poi.marker.loc = loc;
            current_poi.marker.center = center;
            current_poi.marker.category = category;
            current_poi.marker.category_en = category_en;
            current_poi.marker.label = labelid;
            current_poi.marker.panorama = panorama;
            current_poi.marker.coupon = coupon;
            current_poi.marker.description = description;
            current_poi.marker.type = 2; // 2 significa de tipo marcador
            current_poi.marker.category_icon = shapeIcon;
            current_poi.marker.category_color = colorIcon;

            current_poi.marker.changeTitle = function () {
                this.popupTitle = gettext("Scan a QR code to get here:") + " " + this.description;
                this.popupTitle += SocialMenu.renderIcon(this.poid);
                this.bindPopup(this.popupTitle).openPopup();
                bindContent(this);
            };

            if (current_poi.marker.category == "Panoramas") {

                // Panorama buttons don't have popups: they show panoramas when clicked
                  current_poi.marker.on('click tap touchstart touch', function () {
                      if (Panorama.opened) {
                          Panorama.close();
                      }
                      Panorama.show(this);
                  });

            } else {

                current_poi.marker
                    .bindPopup(popupTitle)
                    .on('click tap touchstart touch', function () {
                        if (qr_type == 'dest')
                        {
                            if (this.poid == qrPoint.point.id)
                            {
                                this.changeTitle();
                            }
                        }
                        else
                        {
                            LocalStorageHandler.setPrevDest(this);
                            if (Panorama.opened) Panorama.close();

                            if (qrMarker) {
                                drawRoute(qrPoint.point.id, this.poid);
                            }

                            qrMarker.contentBinded = false;
                            bindContent(qrMarker);
                        }
                    });
            }

            var category_index = label_categories_indexed[current_poi.marker.category];

            if (category_index) {
                floors[floor_index].categories[category_index].push(current_poi.marker);
            }

            if (isPoiVisibleByDefault(current_poi.marker.category_en))
                floors[floor_index].layer.addLayer(current_poi.marker);
        }
    }

    qrFloor = floors_indexed[qrPoint.floor.id];
    qrFloor.sX = qrFloor.scaleX;
    qrFloor.sY = qrFloor.scaleY;

    qrLoc = [((qrPoint.point.row) * qrFloor.scaleY) - qrFloor.scaleY,
        (qrPoint.point.col * qrFloor.scaleX)];

    if (qr_type == 'origin') {
        var point_description = qrPoint.label.name_en == 'My car' ?
            qrPoint.label.name : qrPoint.point.description;

        var originLegend = gettext("You are right here:") + '<br>' + point_description;
        originLegend += SocialMenu.renderIcon(qrPoint.point.id);

        qrMarker = L.marker(qrLoc, {icon: originIcon})
            .bindPopup(originLegend)
            .on('click', function () {
                bindContent(this);
            });


        qrMarker.panorama = qrPoint.point.panorama;
        qrMarker.coupon = qrPoint.point.coupon;
    }
    else {
        var msg = gettext("Please, scan a QR code to get here:") + ' ';

        qrMarker = L.marker(qrLoc, {
            icon: destIcon}).bindPopup('<p style="width:16em;text-align:center;">'+msg + '<br>' + qrPoint.point.description + SocialMenu.renderIcon(qrPoint.point.id) +'<p>')
            .on('click', function () {
                LocalStorageHandler.setPrevDest(this);
                bindContent(this);
            });
    }

    qrMarker.addTo(qrFloor.layer);
}


//Localización del origen (QR) y carga del mapa
function initMap(qrPoint) {

    map.addControl(new L.Control.Zoom());
    layersControl.addTo(map);

    for (var floor_index in floors) {
        floors[floor_index].photo.floor_id = floors[floor_index].id;
        layersControl.addBaseLayer(floors[floor_index].photo, floors[floor_index].name);
    }

    qrFloor = floors_indexed[qrPoint.floor.id];
    current_floor = qrFloor;
    map.addLayer(qrFloor.photo);
    map.addLayer(qrFloor.layer);
    Map.reloadPois();

    map.setView(qrFloor.bounds.getCenter(), 0);
    bindContent(qrMarker);
    map.setMaxBounds(map.getBounds());
    $('input[type=radio].leaflet-control-layers-selector:checked').parent().css('background-color', 'darkorange');
    qrMarker.openPopup();
    qrMarker._bringToFront();

    if (qrPoint.point.coupon) {
        $('div.leaflet-popup-content-wrapper').addClass('withCoupon');
    }
    bindContent(qrMarker);

    if (map.hasLayer(destMarker)) {
        destMarker.openPopup();
        bindContent(destMarker);
        destMarker._bringToFront();
    }
    loadedLabels = true;

}


//EVENTOS - Añadir layer
map.on('layeradd', function (e) {
    // Si agregamos una categoría (tipo 1)
    if (e.layer.type && e.layer.type == 1 && loadedLabels)
        addCategory(e.layer.index);

    // Si agregamos un marker (tipo 2)
    if (current_floor && e.layer.type && e.layer.type == 2)
        setMarkerColor(e);
});
//EVENTOS - Quitar layer
map.on('layerremove', function (e) {
    if (e.layer._map)
        loadedLabels = false;

    // Si eliminamos una categoría (tipo 1)
    if (e.layer.type && e.layer.type == 1 && loadedLabels)
        removeCategory(e.layer.index);
});

//EVENTOS - CAMBIO DE PLANTA
map.on('baselayerchange', function (e) {
    loadedLabels = false;
    changeFloor(e);
    loadedLabels = true;
});

//EVENTOS - HACER ZOOM AL MAPA
map.on('zoomend', function (e) {
    if (map.hasLayer(qrMarker)) {
        qrMarker._bringToFront();
    }
    if (map.hasLayer(destMarker)) {
        destMarker._bringToFront();
    }
});



function setMarkerColor(eventparameter) {
    var shapeIcon = eventparameter.layer.category_icon;
    var colorIcon = eventparameter.layer.category_color;
    $('div.icon-' + shapeIcon).css({
        'background': colorIcon,
        'border-top-color': colorIcon
    });
}

function addCategory(category_index) {

    var checkboxes = $('input[type=checkbox].leaflet-control-layers-selector');

    if ((selected_category_index >= 0) &&
        selected_category_index != category_index) {
        map.removeLayer(label_categories[selected_category_index].layer);
    }
    checkboxes.prop('checked', false);
    checkboxes.parent().css('background', '#333');
    checkboxes.eq(category_index).prop('checked', true);
    if (!map.hasLayer(label_categories[category_index].layer))
        map.addLayer(label_categories[category_index].layer);
    checkboxes.eq(category_index).parent()
        .css('background', label_categories[category_index].color);

    selected_category_index = category_index;
}


function removeCategory(category_index) {
    $('input[type=checkbox].leaflet-control-layers-selector:eq(' + category_index + ')').css('background', '#333');
    selected_category_index = -1;
}


function changeFloor(e) {

    SocialMenu.close();

    //Cambiamos color de la planta actual a naranja
    $('input[type=radio].leaflet-control-layers-selector').parent().css('background-color', '#333');
    $('input[type=radio].leaflet-control-layers-selector:checked').parent().css('background-color', 'darkorange');


    // Eliminamos capas de la planta anterior
    map.removeLayer(current_floor.layer);

    // Añadimos capas de la planta actual
    current_floor = floors_indexed[e.layer.floor_id];
    map.addLayer(current_floor.layer);
    if (anim != null) {
        window.clearInterval(anim);
        anim = null;
    }
    if (arrowHead[current_floor.id]) {
        arrowAnim(arrowHead[current_floor.id], current_floor.id);
    }
    Map.reloadPois();

    if (map.hasLayer(qrMarker)) {
        qrMarker.openPopup();
        if (qrPoint.point.coupon) {
            $('div.leaflet-popup-content-wrapper').addClass('withCoupon');
        }
        bindContent(qrMarker);
        qrMarker._bringToFront();
    }
    if (map.hasLayer(destMarker)) {
        destMarker.openPopup();
        if (route.fields.destiny.fields.coupon) {
            $('div.leaflet-popup-content-wrapper').addClass('withCoupon');
        }
        bindContent(destMarker);
        destMarker._bringToFront();
    }
}


Map.reloadPois = function () {
    // Cargamos todos los POIs de las categorías para la planta actual
    for (var category_index in label_categories) {
        label_categories[category_index].layer.clearLayers();
        for (var layer_poi in current_floor.categories[category_index]) {
            label_categories[category_index].layer.addLayer(current_floor.categories[category_index][layer_poi]);
        }
    }
};


function drawRoute(org, dst) {
    //Creación de la ruta (con subrutas correspondientes), desde el origen hasta el POI destino

    for (var floor_id in arrowHead) {
        floors_indexed[floor_id].layer.removeLayer(arrowHead[floor_id]);
    }
    arrowHead = {};
    if (org != dst && dst != prev_dest) {
        prev_dest = dst;

        // Marcamos en el menú lateral el destino escogido
        $('.mm-submenu .destiny.selected').removeClass('selected');
        $('.mm-submenu .destiny[data-destiny-id=' + dst + ']').addClass('selected');

        route = routeResource.getRoute(org, dst);

        if (!route) {
            $('#scrollMenu .destiny.selected').removeClass('selected');
            alert(gettext('We are sorry, that route does not exist.'));
        }
        else {
            // Limpia la ruta anteriormente trazada
            for (var floor_index in pathLine) {
                floors_indexed[floor_index].layer.removeLayer(pathLine[floor_index]);
            }

            path = {};
            subPathLine = [];
            blinkingMode = null;

            //
            //MARKER DESTINO
            // Quitamos el marker destino si existe y creamos el nuevo para la ruta actual
            if (destMarker.floor_id) {
                floors_indexed[destMarker.floor_id].layer.removeLayer(destMarker);
            }

            var destLegend = route.fields.destiny.fields.description;
            destLegend += SocialMenu.renderIcon(dst);

            var dest_floor = floors_indexed[route.fields.destiny.fields.floor];
            destLoc = [
                (route.fields.destiny.fields.row) * dest_floor.scaleY + dest_floor.scaleY,
                route.fields.destiny.fields.col * dest_floor.scaleX + dest_floor.scaleX
            ];

            destMarker = L.marker(destLoc, { bounceOnAdd: false,
                icon: destIcon})
                .bindPopup(destLegend, {autoPanPadding: new L.Point(0, 10)})
                .on('click', function () {
                    bindContent(this);
                });

            destMarker.panorama = '/media/' + route.fields.destiny.fields.panorama;
            destMarker.floor_id = route.fields.destiny.fields.floor;

            floors_indexed[destMarker.floor_id].layer.addLayer(destMarker);


            if (qr_type != 'dest') {
                // Añadimos el pathline (polilínea naranja)
                for (var subroute_index in route.fields.subroutes) {
                    var floor_id = route.fields.subroutes[subroute_index].floor.pk;
                    path[floor_id] = [];
                    var osX = floors_indexed[floor_id].scaleX,
                        osY = floors_indexed[floor_id].scaleY;
                    //subpath[i].push([(route.fields.origin.fields.row) * osY + osY, route.fields.origin.fields.col * osX + osX]);
                    for (var step_index in route.fields.subroutes[subroute_index].steps) {
                        path[floor_id].push([(route.fields.subroutes[subroute_index].steps[step_index].fields.row) * osY + osY,
                            (route.fields.subroutes[subroute_index].steps[step_index].fields.column) * osX + osX]);
                    }
                    pathLine[floor_id] = L.polyline(path[floor_id], {color: 'orange', opacity: 0.8, weight: 2 });
                    arrowHead[floor_id] = L.polylineDecorator(pathLine[floor_id]);
                    floors_indexed[floor_id].layer.addLayer(pathLine[floor_id]);
                    floors_indexed[floor_id].layer.addLayer(arrowHead[floor_id]);
                }

                if(arrowHead[current_floor.id])
                {
                     arrowAnim(arrowHead[current_floor.id],current_floor.id);
                }

                // Parpadeo en el botón de la planta destino
                var floor_name = floors_indexed[route.fields.destiny.fields.floor].name;
                var check = floorChecks[floor_name];
                blinkingMode = floor_name;
                blinker(check, dst);

                qrMarker.openPopup();

                if (map.hasLayer(destMarker)) {
                    destMarker.openPopup();
                    if (route.fields.destiny.fields.coupon) {
                        $('div.leaflet-popup-content-wrapper').addClass('withCoupon');
                    }
                    bindContent(destMarker);
                    destMarker._bringToFront();
                }

                if (carMarker && map.hasLayer(carMarker)) {
                    map.removeLayer(carMarker);
                }

                // Creo un nuevo displayed route para que el dashboard pueda utilizar esta información
                try {
                    DisplayedRoutes.createDisplayedRoute(org, dst);
                } catch (Exception) {
                    console.log(Exception);
                }
            }
        }
    }
}


function isCategoryVisibleOnButtons(categ_name) {
    return categ_name !== "Parking" && categ_name !== "Blockers" &&
        categ_name !== "Connectors" && categ_name !== "Entrance" &&
        categ_name !== "Toilet";
}


function isPoiVisibleByDefault(categ_name) {
    return categ_name == "Connectors" || categ_name == "Toilet" || categ_name == "Entrance" || categ_name == "Panoramas";
}


Map.locateCar = function () {
    var miCoche = null;

    if(localStorage.getItem('miCoche'))
    {
        miCoche = JSON.parse(localStorage.getItem('miCoche'));
    }

    if (!miCoche || miCoche.dest.enclosure.id != enclosure_id) {
        alert('Please, scan the QR code at your parking place to' +
            ' locate your car.');
        return;
    }

    miCoche = miCoche.dest;

    if (current_floor.id != miCoche.floor.id) {
        var floor_to_show_name = floors_indexed[miCoche.floor.id].name;
        $('.leaflet-control-layers-base input[type=radio]')
            .eq(baseLayers[floor_to_show_name].position)
            .trigger('click');
    }

    if(!carMarker || !map.hasLayer(carMarker))
    {
        carLoc = [((miCoche.point.row) * current_floor.scaleY) + current_floor.scaleY,
            (miCoche.point.col * current_floor.scaleX) + current_floor.scaleX];
        carMarker = new L.marker(carLoc, {
            icon: carIcon})
            .bindPopup(gettext("My car"));
        carMarker.poid = miCoche.point.id;
        carMarker.floorid = miCoche.floor.id;
        carMarker.enclosureid = miCoche.enclosure.id;
        carMarker.description = gettext('My car');
        carMarker.title = carMarker.description;
        carMarker.on('click', function () {
            LocalStorageHandler.setPrevDest(this);
            if (Panorama.opened) Panorama.close();
            drawRoute(qrPoint.point.id, miCoche.point.id);
        });

        current_floor.layer.addLayer(carMarker);
    }

    carMarker.openPopup();
    carMarker._bringToFront();
    map.setView(carLoc, 0);
};


Map.locatePosition = function () {

    if (current_floor.id != qrFloor.id) {
        var floor_to_show_name = floors_indexed[qrFloor.id].name;
        $('.leaflet-control-layers-base input[type=radio]')
            .eq(baseLayers[floor_to_show_name].position)
            .trigger('click');
        map.setView(qrLoc, 0);
    }

    if (map.hasLayer(qrMarker)) {
        qrMarker.openPopup();
        if (qrPoint.point.coupon) {
            $('div.leaflet-popup-content-wrapper').addClass('withCoupon');
        }
        bindContent(qrMarker);
    }
    if (map.hasLayer(destMarker)) {
        destMarker.closePopup();
    }
};


Map.resize = function () {
//    Coupon.calculateCouponArea();

    Panorama.resize();
    HelpMenu.resize();
    ScrollMenu.init();
};


Map.events =
{
    locateCar: function () {
        $('span#myCar').on('click', Map.locateCar);
    },

    locatePosition: function () {
        $('span#location').on('click', Map.locatePosition);
    },

    resizeWindow: function () {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('orientationchange', Map.resize, false);
        }

        $(window).resize(Map.resize);
    },

    bindAll: function () {
        Map.events.locateCar();
        Map.events.locatePosition();
        Map.events.resizeWindow();
    }
};


function bindContent(marker) {
    if (!marker.contentBinded) {
        // Se bindea el contenido del popup abierto para el marker
        Panorama.bindShow(marker);
//        SocialMenu.bindShow(marker);
        Coupon.bindShowFromMarker();

        marker.contentBinded = true;
    }
}

//Función que gestiona la animación de la flecha
function arrowAnim(arrow, idFloor) {

    if (anim != null) {
        window.clearInterval(anim);

    }
    anim = window.setInterval(function () {

        setArrow(arrow, idFloor)
    }, 100);

}
var arrowsOffset = 0;
//Función que define la animación (en este caso, flecha azul) que marca la ruta
var setArrow = function (flecha, idFloor) {

    flecha.setPatterns([
        {offset: arrowsOffset + '%', repeat: 0, symbol: new L.Symbol.ArrowHead({pixelSize: 15, polygon: false, pathOptions: { stroke: true}})}
    ]);
    if (++arrowsOffset > 100)
        arrowsOffset = 0;
};




//MENU LATERAL
function initSideMenu()
{
    $('nav#menu-right').mmenu({
        dragOpen: false,
        slidingSubmenus: false,
        counters	: true,
        searchfield   : {
            add           : true,
            search        : true,
            placeholder   : "Busca tu destino...",
            noResults     : "Lo sentimos, no hay resultados.",
            showLinksOnly : true
        }
    });

    // Marcamos en el menú lateral el POI origen
    $('.mm-submenu .destiny[data-destiny-id=' + qrPoint.point.id + ']')
        .addClass('origin');

/*
    // Sombreado en la parte baja del menú
    if(androidversion >= 4.0 || device.Chrome()|| device.iOS())
    {
        $('div.help').css({'box-shadow': '0px -16px 43px 0px #F2EFE4'})
    }
*/
}


