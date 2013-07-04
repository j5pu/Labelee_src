//Configuración de iconos
var OriginIcon = L.AwesomeMarkers.icon({
        icon: 'location-arrow',
        color: 'darkblue'
        //spin: true

    }),
    DestinyIcon = L.AwesomeMarkers.icon({
        icon: 'screenshot',
        color: 'red'
        //spin: true

    }),
    CarIcon = L.AwesomeMarkers.icon({
        icon: 'truck',
        color: 'cadetblue'
        //spin: true

    }),
    green = L.AwesomeMarkers.icon({
        icon: 'retweet',
        color: 'green'

    }),
    orange = L.AwesomeMarkers.icon({
        icon: 'gift',
        color: 'orange'

    }),
    purple = L.AwesomeMarkers.icon({
        icon: 'food',
        color: 'purple'

    }),
    blue = L.AwesomeMarkers.icon({
        icon: 'star',
        color: 'blue'

    }),
    red = L.AwesomeMarkers.icon({
        icon: 'coffee',
        color: 'red'
    });


var loadedLabels = false;

var anim = null;
var flechita = null;
/*var floorChecks = [];
//Parpadeo a la planta del POI destino
var blinkingMode = null;
function blinker(element) {
    if (blinkingMode != null) {
        var color = element.css('background-color');
        if (color == "rgb(255, 0, 0)") {
            element.css('background-color','');
        } else {
            element.css('background-color','rgb(255, 0, 0)');
        }
        window.setTimeout(function () {
            blinker(element);
        }, 1000);
    } else {
        element.css('background-color','');
    }
}*/


function loadIcon(color, shape) {
    var icon = new L.AwesomeMarkers.icon({
        icon: shape,
        color: color
    });
    return icon;
}

//Carga de datos globales
var qrPoint = {
    point: new PointResource().read(poi_id),
    floor: new FloorResource().read(floor_id),
    enclosure: new EnclosureResource().read(enclosure_id)
};
qrPoint.label = new LabelCategoryResource().readFromUri(qrPoint.point.label)
qrPoint.labelCategory = new LabelCategoryResource().readFromUri(qrPoint.label.category)
qrPoint.isParquing = function () {
    return this.labelCategory.name == 'Parquing';
};


var LocalStorageHandler = {

    init: function () {
        this.checkExpire();
        this.setValues();
    },

    checkExpire: function () {
        for (index = 0; index < localStorage.length; index++) {
            if(localStorage.key(index) != 'prevDest' && localStorage.key(index) != 'miCoche')
                continue;

            var obj = JSON.parse(localStorage.getItem(localStorage.key(index)));
            var delay = 86400000; // 24h
            var expired = new Date().getMilliseconds() > obj.prevDate + delay;
            if (obj && expired) {
                localStorage.removeItem(localStorage.key(index));
            }
        }
    },

    setValues: function () {
        if (qrPoint.isParquing()) {
            if (confirm(gettext('Do you want to remember your parking space?'))) {
                var miCoche = {
                    dest: qrPoint,
                prevDate: new Date().getTime()
                };
                localStorage.setItem('miCoche', JSON.stringify(miCoche));
            } else {
                localStorage.removeItem('miCoche')
            }
        }


        if (qr_type == 'dest') {
            var sharedDest = {
                dest: qrPoint,
                'prevDate': new Date().getTime(),
                'shooted_origin': false
            };

            localStorage.setItem('sharedDest', JSON.stringify(sharedDest));
        }
        else {
            var sharedDest = JSON.parse(localStorage.getItem('sharedDest'));
            if (sharedDest) {
                localStorage.removeItem('sharedDest');
                sharedDest.mesg = gettext('Do you still want to go to the previous destination?');
                sharedDest.with_predraw = true;

                localStorage.setItem('prevDest', JSON.stringify(sharedDest));
            }
        }
    },

    setSideMenu: function () {
        // MICOCHE
        var miCoche = JSON.parse(localStorage.getItem('miCoche'));
        if (miCoche) {
            if (qrPoint.enclosure.id != miCoche.dest.enclosure.id)
                return;

            $('#scrollMenu').prepend(
                '<li>' +
                    '<li class="Label mmenu-label">' + miCoche.dest.labelCategory.name + '</li>' +
                    '<li ' +
                    'onclick="' + "$('#menu-right').trigger( 'close' );" +
                    "preDrawRoute(" + qrPoint.point.id + ', ' + floor_id + ', ' + miCoche.dest.point.id + ', ' + miCoche.dest.floor.id + ');">' +
                    miCoche.dest.point.description +
                    '</li>' +
                    '</li>'
            );
            $('span#myCar').show();
        }

        var prevDest = JSON.parse(localStorage.getItem('prevDest'));
        if (prevDest) {
            var enclosure_dest_id = prevDest.with_predraw ? prevDest.dest.enclosure.id : prevDest.enclosureid;
            if (qrPoint.enclosure.id != enclosure_dest_id)
                return;

            var point_dest_id, floor_dest_id, description, func;
            if (prevDest.with_predraw) {
                point_dest_id = prevDest.dest.point.id;
                floor_dest_id = prevDest.dest.floor.id;
                description = prevDest.dest.point.description;
            }
            else {
                point_dest_id = prevDest.poid;
                floor_dest_id = prevDest.floorid;
                description = prevDest.description;
            }


            $('#scrollMenu').prepend(
                '<li>' +
                    '<li class="Label mmenu-label">' + gettext('PREVIOUS DESTINATION') + '</li>' +
                    '<li ' +
                    'onclick="' + "$('#menu-right').trigger( 'close' );" +
                    "preDrawRoute(" + qrPoint.point.id + ', ' + floor_id + ', ' + point_dest_id + ', ' + floor_dest_id + ');">' +
                    description +
                    '</li>' +
                    '</li>'
            );

        }
    },

    setPrevDest: function (marker) {
        var prevDest = {
            'prevDate': new Date().getTime(),
            'poid': marker.poid,
            'floorid': qrPoint.floor.id,
            'enclosureid': qrPoint.enclosure.id,
            'psX': marker.psX,
            'psY': marker.psY,
            'mesg': gettext('Do you still want to go to') + ' ' + marker.title + '?',
            'description': marker.title,
            'with_predraw': false
        };
        localStorage.setItem('prevDest', JSON.stringify(prevDest));
    },


    draw: function () {
        if (qr_type == 'origin') {
            // DESTINO PREVIO
            var prevDest = JSON.parse(localStorage.getItem('prevDest'));
            if (prevDest) {
                if (prevDest.with_predraw && prevDest.dest.enclosure.id == qrPoint.enclosure.id) {
                    if (prevDest.shooted_origin)
                        if (confirm(prevDest.mesg))
                            preDrawRoute(qrPoint.point.id, qrPoint.floor.id, prevDest.dest.point.id, prevDest.dest.floor.id);
                        else
                            localStorage.removeItem('prevDest');
                    else {
                        preDrawRoute(qrPoint.point.id, qrPoint.floor.id, prevDest.dest.point.id, prevDest.dest.floor.id);
                        prevDest.shooted_origin = true;
                        localStorage.setItem('prevDest', JSON.stringify(prevDest));
                    }
                }
                else if (prevDest.enclosureid == qrPoint.enclosure.id) {
                    if (confirm(prevDest.mesg))
                        drawRoute(qrPoint.point.id, qrFloor.sX, qrFloor.sY, prevDest.poid, prevDest.psX, prevDest.psY);
                    else
                        localStorage.removeItem('prevDest');
                }
            }

            this.setSideMenu();
        }
    }
};



//Variables globales
var mapH = $(document).height(),//Altura de la pantalla
    baseLayers = {},
    layersControl = new L.control.layers(null, null, {collapsed: false}),
    floor_index = 0,
    totalPois = new L.LayerGroup(),
    qrFloor,
    qrLoc,
    carLoc,
    carMarker,
    route = {},
    arrow = [],
    arrowHead = [],
    arrowOffset = 0,
    destMarker = new L.Marker(),
    subpath = [],
    subarrow = [],
    floors = new FloorResource().readFromEnclosure(qrPoint.enclosure.id);
//    labels = new LabelCategoryResource().readAllFiltered('?label__point__floor__enclosure__id=16');


//POIs de cada floor, separados para pintarlos por capas
for (var i in floors) {
    floors[i].pois = new PointResource().readOnlyPois(floors[i].id);
    floors[i].labels = new LabelCategoryResource().readValidAsPois(qrPoint.enclosure.id);
}

//Carga de planos

var name = null, img;
function loopFloors() {
    if (floor_index == floors.length) {
        loadPOIs();

        initMap(qrPoint);

        LocalStorageHandler.draw();
//       if(( ua.indexOf("Android") >= 0 ) && (androidversion >=3.0))

                //Coupon.init();

        // fin de loopFloors
        return;
    }

    name = floors[floor_index].name;
    img = floors[floor_index].img;
    var floorImg = new Image();
    floorImg.src = img;
    floorImg.onload = function () {
        var mapW = (floorImg.width / floorImg.height) * mapH;
        var bounds = new L.LatLngBounds(new L.LatLng(0, 0), new L.LatLng(mapH, mapW));

        floors[floor_index].scaleX = mapW / floors[floor_index].num_cols;
        floors[floor_index].scaleY = mapH / floors[floor_index].num_rows;
        floors[floor_index].bounds = bounds;
        floors[floor_index].photo = new L.imageOverlay(img, bounds);

        baseLayers[name] = new L.imageOverlay(img, bounds);

        floor_index++;
        loopFloors();
    };
}


//Carga de POIs
function loadPOIs() {
    for (var fl in floors) {
        for (var l in floors[fl].labels) {
            floors[fl].labels[l].layer = new L.LayerGroup();
        }

        floors[fl].layer = new L.LayerGroup();

        try {
            for (j = 0; j < floors[fl].pois.length; j++) {
                if (floors[fl].pois[j].id === poi_id) {
                    floors[fl].pois.splice(j, 1);
                    if (j == floors[fl].pois.length)
                        break;
                }
                var colorIcon = floors[fl].pois[j].label.category.color,
                    nameIcon = floors[fl].pois[j].label.name,
                    shapeIcon = floors[fl].pois[j].label.category.icon,
                    id = floors[fl].pois[j].id,
                    descriptionIcon = floors[fl].pois[j].description,
                    sX = floors[fl].scaleX,
                    sY = floors[fl].scaleY,
                    loc = [(floors[fl].pois[j].row) * sY + (sY),
                        floors[fl].pois[j].col * sX + (sY)],
                    enclosureid = qrPoint.enclosure.id,
                    labelid = floors[fl].pois[j].label.id,
                    category = floors[fl].pois[j].label.category.name;

                if (floors[fl].pois[j].panorama){
                    descriptionIcon = descriptionIcon +
                        '<button data-pan="' + id + '">' +
                        '<i class="icon-camera"></i>' +
                        '</button>';
                }


                floors[fl].pois[j].marker = new L.Marker(new L.latLng(loc), {icon: loadIcon(colorIcon, shapeIcon), title: floors[fl].pois[j].description});
                floors[fl].pois[j].marker.options.icon.options.color = colorIcon;
                floors[fl].pois[j].marker.poid = id;
                floors[fl].pois[j].marker.psX = sX;
                floors[fl].pois[j].marker.psY = sY;
                floors[fl].pois[j].marker.loc = loc;
                floors[fl].pois[j].marker.category = category;
                floors[fl].pois[j].marker.label = labelid;

                floors[fl].pois[j].marker.bindPopup(descriptionIcon)
                    .on('click', function () {
                        if (qr_type == 'dest') {
                            this.bindPopup(gettext("Scan a QR code to get here:") + " " + qrPoint.point.description).openPopup();
                            return;
                        }
                        LocalStorageHandler.setPrevDest(this);
                        drawRoute(qrPoint.point.id, qrFloor.sX, qrFloor.sY, this.poid, this.psX, this.psY);
                    });

                for (var l in floors[fl].labels) {
                    if (floors[fl].pois[j].marker.category === floors[fl].labels[l].fields.name)
                        floors[fl].labels[l].layer.addLayer(floors[fl].pois[j].marker);
                }

                if (floors[fl].pois[j].marker.category !== "Aristas" && floors[fl].pois[j].marker.category !== "Aseos")
                    totalPois.addLayer(floors[fl].pois[j].marker);
            }
        } catch (e) {

        }

        for (var la in floors[fl].labels) {
            if (floors[fl].labels[la].fields.name === "Aristas" || floors[fl].labels[la].fields.name === "Aseos") {
                floors[fl].layer.addLayer(floors[fl].labels[la].layer);
                floors[fl].labels.splice(la, 1);
            }
        }

    }


    for (var i in totalPois._layers) {
        totalPois._layers[i].title = totalPois._layers[i].options.title;	//value searched
        totalPois._layers[i].color = totalPois._layers[i].options.icon.options.color;
    }

    for (var i in floors) {
        if (qrPoint.floor.id == floors[i].id) {
            qrFloor = floors[i];
            qrFloor.sX = floors[i].scaleX;
            qrFloor.sY = floors[i].scaleY;
            qrFloor.layer = floors[i].layer;


            qrLoc = [((qrPoint.point.row) * qrFloor.scaleY) + qrFloor.scaleY,
                (qrPoint.point.col * qrFloor.scaleX) + qrFloor.scaleX];

            if (qr_type == 'origin') {
                var originLegend=gettext("You are right here:") + ' ' + qrPoint.point.description;

                if (qrPoint.point.panorama){
                    originLegend = originLegend +
                        '<button data-pan="' + qrPoint.point.id + '">' +
                        '<i class="icon-camera"></i>' +
                        '</button>';

                }

                qrMarker = new L.marker(qrLoc, { bounceOnAdd: false,
                    icon: OriginIcon})
                    .bindPopup(originLegend).on('click', function(){
                        console.log('click');
                    });

            }
            else {
                var msg = gettext("Please, scan a QR code to get here:") + ' ';
                qrMarker = new L.marker(qrLoc, { bounceOnAdd: false,
                    icon: DestinyIcon})
                    .bindPopup(msg + qrPoint.point.description +
                        " (floor " + qrFloor.name + "," + qrPoint.enclosure.name + ")"
                    );

                qrMarker
                    .on('click', function () {
                       if (qr_type == 'dest') {
                            this.bindPopup(msg + qrPoint.point.description).openPopup();
                            return;
                        }

                        LocalStorageHandler.setPrevDest(this);

                        drawRoute(qrPoint.point.id, qrFloor.sX, qrFloor.sY, this.poid, this.psX, this.psY);

                    });

            }

            qrMarker.addTo(floors[i].layer);

            break;
        }
    }

}

//Configuración inicial del mapa
var map = L.map('map', {
    crs: L.CRS.Simple,
    zoom: 0,
    minZoom: 0,
    maxZoom: 4,
    zoomControl: false,
    tapTolerance:30,
    inertiaThreshold: 5,
    inertiaDeceleration:2000,
    inertiaMaxSpeed:1000
});


//Localización del origen (QR) y carga del mapa
function initMap(qrPoint) {

    map.addControl(new L.Control.Zoom());
    layersControl.addTo(map);


    for (i = (floors.length) - 1; i >= 0; i--) {
        layersControl.addBaseLayer(floors[i].photo, floors[i].name);

        if (floors[i].id === qrPoint.floor.id) {
            qrFloor = floors[i];
            map.addLayer(qrFloor.photo);
            map.addLayer(qrFloor.layer);

            for (var l in floors[i].labels) {
                layersControl.addOverlay(floors[i].labels[l].layer, '<i class="icon-' + floors[i].labels[l].fields.icon + ' icon-white"></i>');
            }

            map.setMaxBounds(qrFloor.bounds);
            map.setView(qrLoc, 0);
        }
    }



    map.removeLayer(totalPois);
    map.addLayer(qrFloor.layer);
    qrMarker.openPopup();
    $('.leaflet-popup-content button').on('click', function (e) {
        e.preventDefault();
        var point_id = $(this).data('pan');
        var point = new PointResource().read(point_id);
        addSamplePano(point.panorama,{ratio:9/16}
        );
    });
    qrMarker._bringToFront();

    map.invalidateSize();

    loadedLabels = true;
}



//EVENTOS - Añadir layer
map.on('layeradd', function (e) {
    addCategory(e);
});

//EVENTOS - Añadir layer
map.on('layerremove', function (e) {
    removeCategory(e);
});
//EVENTOS - CAMBIO DE PLANTA
map.on('baselayerchange', function (e) {
    changeFloor(e);
});

// Sacar panorámica para el punto

function addCategory(e)
{
    for (var i in floors)
    {
        for (var l in floors[i].labels)
        {
            if (map.hasLayer(floors[i].labels[l].layer) &&
                $('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').is(':checked'))
            {
                $('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').css('background', floors[i].labels[l].fields.color);
            }
        }

    }

}

function removeCategory(e)
{
    if(e.layer._layers)
    {
        for (var i in floors)
        {
            for (var l in floors[i].labels)
            {
                if (!(jQuery('input[type=checkbox].leaflet-control-layers-selector:eq('+l+')').is(':checked')))
                {
                    jQuery('input[type=checkbox].leaflet-control-layers-selector:eq('+l+')').css('background', '#333');
                }

            }

        }
    }

}

var checked = [];

function changeFloor(e) {

      for (pos = 0; pos < $('input[type=checkbox].leaflet-control-layers-selector').length; pos++)
    {
        if ($('input[type=checkbox].leaflet-control-layers-selector:eq('+pos+')').is(':checked')){
            checked[pos] = true;
        }else{
            checked[pos] = false;
        }
    }

    var floor_x = {};
    for (var i in floors) {
        if ((e.layer && (e.layer._url === floors[i].photo._url)) || (e._url === floors[i].photo._url)) {
            floor_x = floors[i];

            for (var l in floors[i].labels)
            {
                layersControl.addOverlay(floor_x.labels[l].layer,   '<i class="icon-' +floors[i].labels[l].fields.icon +' icon-white"></i>');
                if (checked[l]===true)
                {
                    map.addLayer(floor_x.labels[l].layer);
                }
            }

            map.addLayer(floor_x.photo);
            map.addLayer(floor_x.layer);

            if (arrowHead[i] && subarrow[i]) {
                map.addLayer(arrowHead[i]);
                flechita = arrowHead[i];
                arrowAnim(flechita, floor_x.name);
                map.setView(arrow[i].getBounds().getCenter(), 0);

            } else {
                map.setView(floor_x.bounds.getCenter(), 0);
            }

        } else {
            map.removeLayer(floors[i].layer);

            for (var l in floors[i].labels) {
                layersControl.removeLayer(floors[i].labels[l].layer);
                map.removeLayer(floors[i].labels[l].layer);
            }

            if (arrowHead[i] != null)
                map.removeLayer(arrowHead[i]);
        }

    }

    for (var lab in floor_x.labels)
    {
        if (checked[lab]===true)
        {
            jQuery('input[type=checkbox].leaflet-control-layers-selector:eq('+lab+')').css('background', floor_x.labels[lab].fields.color);
            jQuery('input[type=checkbox].leaflet-control-layers-selector:eq('+lab+')').prop("checked", true);
        }
    }
    if (map.hasLayer(destMarker)) destMarker.openPopup();
}


$(function () {


    $('span#location').click(function () {
        for (pos = 0; pos < $('input[type=checkbox].leaflet-control-layers-selector').length; pos++)
        {
            if ($('input[type=checkbox].leaflet-control-layers-selector:eq('+pos+')').is(':checked')){
                checked[pos] = true;
            }else{
                checked[pos] = false;
            }
        }

        var floor_x = {};
        for (var i in floors) {
            if (floors[i].id === qrFloor.id) {
                floor_x = floors[i];
                for (var l in floors[i].labels)
                {
                    layersControl.addOverlay(floor_x.labels[l].layer,   '<i class="icon-' +floors[i].labels[l].fields.icon +' icon-white"></i>');
                    if (checked[l]===true)
                    {
                        map.addLayer(floor_x.labels[l].layer);
                    }
                }

                map.addLayer(floor_x.photo);
                map.addLayer(floor_x.layer);

                if (arrowHead[i] && subarrow[i]) {
                    map.addLayer(arrowHead[i]);
                    flechita = arrowHead[i];
                    arrowAnim(flechita, floor_x.name);
                    map.setView(arrow[i].getBounds().getCenter(), 0);

                } else {
                    map.setView(qrLoc, 0);
                }

            } else {
                map.removeLayer(floors[i].layer);
                map.removeLayer(floors[i].photo);


                for (var l in floors[i].labels) {
                    layersControl.removeLayer(floors[i].labels[l].layer);
                    map.removeLayer(floors[i].labels[l].layer);
                }

                if (arrowHead[i] != null)
                    map.removeLayer(arrowHead[i]);
            }

        }

        for (var lab in qrFloor.labels)
        {
            if (checked[lab]===true)
            {
                jQuery('input[type=checkbox].leaflet-control-layers-selector:eq('+lab+')').css('background', floor_x.labels[lab].fields.color);
                jQuery('input[type=checkbox].leaflet-control-layers-selector:eq('+lab+')').prop("checked", true);
            }
        }
        map.addLayer(qrFloor.photo);
        map.addLayer(qrFloor.layer);
        qrMarker._bringToFront();
        qrMarker.openPopup().on('click', function(){
            console.log('click');
        });
    });

    $('span#myCar').click(function () {
        var miCoche = JSON.parse(localStorage.getItem('miCoche')).dest;

            for (pos = 0; pos < $('input[type=checkbox].leaflet-control-layers-selector').length; pos++)
        {
            if ($('input[type=checkbox].leaflet-control-layers-selector:eq('+pos+')').is(':checked')){
                checked[pos] = true;
            }else{
                checked[pos] = false;
            }
        }

        var floor_x = {};
        for (var i in floors) {
            if (floors[i].id === miCoche.floor.id) {
                floor_x = floors[i];
                carLoc = [((miCoche.point.row) * floor_x.scaleY) + floor_x.scaleY,
                    (miCoche.point.col * floor_x.scaleX) + floor_x.scaleX];
                carMarker = new L.marker(carLoc, { bounceOnAdd: false,
                    icon: CarIcon})
                    .bindPopup(gettext("My car"));

                carMarker.on('click', function () {
                    LocalStorageHandler.setPrevDest(this);
                    drawRoute(qrPoint.point.id, qrFloor.sX, qrFloor.sY, miCoche.point.id, floor_x.scaleX, floor_x.scaleY);

                });
                floor_x.layer.addLayer(carMarker);
                for (var l in floors[i].labels)
                {
                    layersControl.addOverlay(floor_x.labels[l].layer,   '<i class="icon-' +floors[i].labels[l].fields.icon +' icon-white"></i>');
                    if (checked[l]===true)
                    {
                        map.addLayer(floor_x.labels[l].layer);
                    }
                }

                map.addLayer(floor_x.photo);
                map.addLayer(floor_x.layer);

                if (arrowHead[i] && subarrow[i]) {
                    map.addLayer(arrowHead[i]);
                    flechita = arrowHead[i];
                    arrowAnim(flechita, floor_x.name);
                    map.setView(arrow[i].getBounds().getCenter(), 0);

                } else {
                    map.setView(carLoc, 0);
                }

            } else {
                map.removeLayer(floors[i].layer);
                map.removeLayer(floors[i].photo);


                for (var l in floors[i].labels) {
                    layersControl.removeLayer(floors[i].labels[l].layer);
                    map.removeLayer(floors[i].labels[l].layer);
                }

                if (arrowHead[i] != null)
                    map.removeLayer(arrowHead[i]);
            }

        }

        for (var lab in floor_x.labels)
        {
            if (checked[lab]===true)
            {
                jQuery('input[type=checkbox].leaflet-control-layers-selector:eq('+lab+')').css('background', floor_x.labels[lab].fields.color);
                jQuery('input[type=checkbox].leaflet-control-layers-selector:eq('+lab+')').prop("checked", true);
            }
        }
        carMarker.openPopup();
        carMarker._bringToFront();
        map.setView(carLoc, 0);
    });

});


//Creación de las rutas (con subrutas correspondientes), desde el origen hasta el POI destino usando
// solamente el id de los puntos y las plantas
function preDrawRoute(origin, qrFloor, destination, destinationFloor) {
    var osX = 1;
    var osY = 1;
    var dsX = 1;
    var dsY = 1;
    for (var f in floors) {
        if (qrFloor === floors[f].id) {
            osX = floors[f].scaleX;
            osY = floors[f].scaleY;

        }
        if (destinationFloor === floors[f].id) {
            dsX = floors[f].scaleX;
            dsY = floors[f].scaleY;

        }
    }
    drawRoute(origin, osX, osY, destination, dsX, dsY);

}


//Creación de las rutas (con subrutas correspondientes), desde el origen hasta el POI destino
function drawRoute(org, osX, osY, dst, sX, sY) {
    for (var i in floors) {
        if (arrow[i]) {
            floors[i].layer.removeLayer(arrow[i]);
            map.removeLayer(arrowHead[i]);
        }
    }

    var check = null,
        destLegend;
    subpath = [];
    subarrow = [];
    blinkingMode = null;
    route = new RouteResource().getRoute(org, dst);

    if (route) {
//MARKER DESTINO
        for (var i in floors) {
            if (destMarker) {
                floors[i].layer.removeLayer(destMarker);
            }

        }
        destLegend=route.fields.destiny.fields.description;

        if (new PointResource().read(dst).panorama){
            destLegend = destLegend +
                '<button data-pan="' + dst + '">' +
                '<i class="icon-camera"></i>' +
                '</button>';

        }

        destLoc = [(route.fields.destiny.fields.row) * sY + sY, route.fields.destiny.fields.col * sX + sX];
        destMarker = L.marker(destLoc, { bounceOnAdd: false,
            icon: DestinyIcon})
            .bindPopup(destLegend).on('click', function(){
                $('.leaflet-popup-content button').on('click', function (e) {
                    e.preventDefault();
                    var point_id = $(this).data('pan');
                    var point = new PointResource().read(point_id);
                    addSamplePano(
                        point.panorama,
                        {width: $(window).width() * 0.7, height: $(window).height() * 0.4}
                    );
                });
            });


        for (var i in floors) {
            if (route.fields.destiny.fields.floor == floors[i].id) {
                floors[i].layer.addLayer(destMarker);
            }
        }
//CALCULO DE SUBRUTAS
        for (var i in route.fields.subroutes) {
            if (route.fields.subroutes[i].floor.pk === route.fields.origin.fields.floor) {
                subpath[i] = [];
                subpath[i].push([(route.fields.origin.fields.row) * osY + osY, route.fields.origin.fields.col * osX + osX]);
                for (var j in route.fields.subroutes[i].steps) {
                    subpath[i].push([(route.fields.subroutes[i].steps[j].fields.row) * osY + osY, (route.fields.subroutes[i].steps[j].fields.column) * osX + osX]);
                }

                for (var f in floors) {
                    if (route.fields.subroutes[i].floor.pk === floors[f].id) {
                        subarrow[f] = subpath[i];
                        break;
                    }
                }
                arrow[f] = L.polyline(subarrow[f], {color: 'orange', opacity: 0.8});
                arrowHead[f] = L.polylineDecorator(arrow[f]);
                map.addLayer(arrowHead[f]);
            }
            else {
                flag = true;
                subpath[i] = [];
                for (var j in route.fields.subroutes[i].steps) {
                    subpath[i].push([(route.fields.subroutes[i].steps[j].fields.row) * sY + sY, (route.fields.subroutes[i].steps[j].fields.column) * sX + sX]);
                }

                for (var f in floors) {
                    if (route.fields.subroutes[i].floor.pk === floors[f].id) {
                        subarrow[f] = subpath[i];
                        break;
                    }
                }
                arrow[f] = L.polyline(subarrow[f], {color: 'orange', opacity: 0.8});
                arrowHead[f] = L.polylineDecorator(arrow[f]);
                map.addLayer(arrowHead[f]);
            }
        }

        for (i in floors) {
            if (arrow[i] && subarrow[i]) {
                floors[i].layer.addLayer(arrow[i]);
                if (floors[i].id === route.fields.destiny.fields.floor) {
                        var check = floorChecks[floors[i].name];
                         blinkingMode = floors[i].name;
                         blinker(check);
                      map.addLayer(arrowHead[i]);
                    flechita = arrowHead[i];
                    arrowAnim(flechita, floors[i].name);

                }
            }
        }
       for (f in floors)
       {
           for (var l in floors[f].labels) {
                        if (jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').is(':checked')) {
                            checked[l] = true;
                        } else {
                            checked[l] = false;
                        }
                    }
       }
 //PINTADO DE CAPAS
        for (f in floors) {
            if (route.fields.origin.fields.floor !== route.fields.destiny.fields.floor) {
                if (route.fields.destiny.fields.floor === floors[f].id) {
                    map.removeLayer(floors[f].layer);


                    for (var l in floors[f].labels) {
                        layersControl.removeLayer(floors[f].labels[l].layer);
                        map.removeLayer(floors[f].labels[l].layer);
                    }

                     map.removeLayer(floors[f].photo);

                }else  if (route.fields.origin.fields.floor === floors[f].id) {
                   
                    for (var l in floors[f].labels) {
                       layersControl.addOverlay(floors[f].labels[l].layer, '<i class="icon-' + floors[i].labels[l].fields.icon + ' icon-white"></i>');
                        if (checked[l] === true) {
                            map.addLayer(floors[f].labels[l].layer);
                        }
                    }

                    for (var l in floors[f].labels) {
                        if (checked[l] === true) {
                            jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').css('background', floors[f].labels[l].fields.color);
                            jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').prop("checked", true);
                        }
                    }
                    map.addLayer(floors[f].layer);
                    map.addLayer(floors[f].photo);
                    map.addLayer(arrowHead[f]);
                    flechita = arrowHead[f];
                    arrowAnim(flechita, floors[f].name);
                    map.setView(arrow[f].getBounds().getCenter(), 0);
                    qrMarker.openPopup();

                }else
                {

                    for (var l in floors[f].labels) {
                        layersControl.removeLayer(floors[f].labels[l].layer);
                        map.removeLayer(floors[f].labels[l].layer);
                    }

                     map.removeLayer(floors[f].photo);
                }
//MONOPLANTA
            } else {
                if (route.fields.destiny.fields.floor !== floors[f].id) {
                    map.removeLayer(floors[f].layer);
                    map.removeLayer(floors[f].photo);
                    for (var l in floors[f].labels) {
                        map.removeLayer(floors[f].labels[l].layer);
                    }


                }
                else {
                    for (var l in floors[f].labels) {
                        if (jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').is(':checked')) {
                            checked[l] = true;
                        } else {
                            checked[l] = false;
                        }
                    }

                    map.addLayer(floors[f].layer);
                    map.addLayer(floors[f].photo);
                    map.setView(arrow[f].getBounds().getCenter(), 0);
                    map.addLayer(arrowHead[f]);
                    flechita = arrowHead[f];
                    arrowAnim(flechita, floors[f].name);
                    map.setView(arrow[f].getBounds().getCenter(),0);

                }
            }
        }

        if (map.hasLayer(destMarker))
        {
            destMarker.openPopup();
            $('.leaflet-popup-content button').on('click', function (e) {
                e.preventDefault();
                var point_id = $(this).data('pan');
                var point = new PointResource().read(point_id);
                addSamplePano(
                    point.panorama,
                    {width: $(window).width() * 0.7, height: $(window).height() * 0.4}
                );
            });
        }


    } else {
        alert(gettext('We are sorry, that route does not exist.'));
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
}
