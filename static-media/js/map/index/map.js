//Configuración de iconos
var OriginIcon = L.AwesomeMarkers.icon({
        icon: 'star',
        color: 'blue',
        spin: true

    }),
    DestinyIcon = L.AwesomeMarkers.icon({
        icon: 'star',
        color: 'darkred',
        spin: true

    }),
    cadetblue = L.AwesomeMarkers.icon({
        icon: 'retweet',
        color: 'cadetblue'

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

var anim = null;
var flechita = null;

function loadIcon(color) {
    var icon = new L.AwesomeMarkers.icon({
        icon: 'bolt',
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


if (qrPoint.isParquing()) {
    if (confirm('¿Desea recordar su plaza?')) {
        var miCoche = {
            dest: qrPoint,
            prevDate: new Date().getMilliseconds()
        };
        localStorage.setItem('miCoche', JSON.stringify(miCoche));
    } else {
        localStorage.removeItem('miCoche')

    }
}


$(function () {
    if (localStorage.getItem('miCoche')) {
        var miCoche = JSON.parse(localStorage.getItem('miCoche'));

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
    }
});


//Variables globales
var mapH = $(document).height(),//Altura de la pantalla
    baseLayers = {},
    layersControl = new L.control.layers(null, null, {collapsed: false}),
    floor_index = 0,
    totalPois = new L.LayerGroup(),
    qrFloor,
    qrLoc,
    route = {},
    arrow = [],
    arrowHead = [],
    arrowOffset = 0,
    subpath = [],
    subarrow = [],
    floors = new FloorResource().readFromEnclosure(qrPoint.enclosure.id);

//POIs de cada floor, separados para pintarlos por capas
for (var i in floors) {
    floors[i].pois = new PointResource().readOnlyPois(floors[i].id);
}

function checkLocalStorage() {
    for (index = 0; index < localStorage.length; index++) {
        var obj = JSON.parse(localStorage.getItem(localStorage.key(index)));
        var delay = 86400000; // 24h
        var expired = new Date().getMilliseconds() > obj.prevDate + delay;
        if (obj && expired) {
            localStorage.removeItem(localStorage.key(index));
        }
    }
}
checkLocalStorage();

//Carga de planos
loopFloors(floor_index);

var name=null, img;
function loopFloors() {
    if (floor_index == floors.length) {
        loadPOIs();

        initMap(qrPoint);

        var prevDest = JSON.parse(localStorage.getItem('prevDest'));
        if (qr_type == 'origin' && prevDest)
            if(confirm(prevDest.mesg))
                drawRoute(qrPoint.point.id, qrFloor.sX, qrFloor.sY, prevDest.poid, prevDest.psX, prevDest.psY);
            else
                localStorage.removeItem('prevDest');



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
        floors[fl].layer = new L.LayerGroup();

        for (j = 0; j < floors[fl].pois.length; j++) {
            if (floors[fl].pois[j].id === poi_id)
                floors[fl].pois.splice(j, 1);
            var colorIcon = floors[fl].pois[j].label.category.color,
                nameIcon = floors[fl].pois[j].label.name,
                id = floors[fl].pois[j].id,
                descriptionIcon = floors[fl].pois[j].description,
                sX = floors[fl].scaleX,
                sY = floors[fl].scaleY,
                loc = [(floors[fl].pois[j].row) * sY + (sY),
                    floors[fl].pois[j].col * sX + (sY)],
                category = floors[fl].pois[j].label.category.name;

            floors[fl].pois[j].marker = new L.Marker(new L.latLng(loc), {icon: loadIcon(colorIcon), title: descriptionIcon /*, color:colorIcon*/});
            floors[fl].pois[j].marker.options.icon.options.color = colorIcon;

//IMPORTANTE- CAMBIO DE ICONOS DINÁMICO
// floors[fl].pois[j].marker.options.icon.options.icon='star';
            floors[fl].pois[j].marker.poid = id;
            floors[fl].pois[j].marker.psX = sX;
            floors[fl].pois[j].marker.psY = sY;
            floors[fl].pois[j].marker.loc = loc;

            floors[fl].pois[j].marker.bindPopup(descriptionIcon)
                .on('click', function () {

                    if(searchMarker._markerLoc)
                        map.removeLayer(searchMarker._markerLoc._circleLoc);

                    if(localStorage.getItem('prevDest'))
                        localStorage.removeItem('prevDest');

                    if(qr_type == 'dest')
                    {
                        this.bindPopup("Escanea un QR para llegar hasta " + qrPoint.point.description).openPopup();
                        return;
                    }

                    drawRoute(qrPoint.point.id, qrFloor.sX, qrFloor.sY, this.poid, this.psX, this.psY);

                    var prevDest = {
                        'prevDate': new Date().getTime(),
                        'poid': this.poid,
                        'psX': this.psX,
                        'psY': this.psY,
                        'mesg': '¿Todavía quieres ir a ' + this.title + '?'
                    };
                    localStorage.setItem('prevDest', JSON.stringify(prevDest));
                });
            floors[fl].layer.addLayer(floors[fl].pois[j].marker);
            totalPois.addLayer(floors[fl].pois[j].marker);
        }
    }

    for (var i in totalPois._layers) {
        totalPois._layers[i].title = totalPois._layers[i].options.title;	//value searched
        totalPois._layers[i].color = totalPois._layers[i].options.icon.options.color;
    }

    for (i in floors) {
        if (qrPoint.floor.id == floors[i].id) {
            qrFloor = floors[i];
            qrFloor.sX = floors[i].scaleX;
            qrFloor.sY = floors[i].scaleY;
            qrFloor.layer = floors[i].layer;


            qrLoc = [((qrPoint.point.row) * qrFloor.scaleY) + qrFloor.scaleY,
                (qrPoint.point.col * qrFloor.scaleX) + qrFloor.scaleX];

            if(qr_type == 'origin')
            {
                qrMarker = new L.marker(qrLoc, { bounceOnAdd: false,
                    //bounceOnAddHeight: 20,
                    icon: OriginIcon})
                    .bindPopup("Estás aquí: " + qrPoint.point.description +
                        " (planta " + qrFloor.name + "," + qrPoint.enclosure.name + ")"
                    ).openPopup();
            }
            else
            {
                qrMarker = new L.marker(qrLoc, { bounceOnAdd: false,
                    //bounceOnAddHeight: 20,
                    icon: DestinyIcon})
                    .bindPopup("Escanea un QR para llegar hasta aquí: " + qrPoint.point.description +
                        " (planta " + qrFloor.name + "," + qrPoint.enclosure.name + ")"
                    ).openPopup();

                var sharedDest = {
                    'prevDate': new Date().getTime(),
                    'poid': qrPoint.point.id,
                    'psX': this.psX,
                    'psY': this.psY
                };

                localStorage.setItem('sharedDest', JSON.stringify(sharedDest));
            }
            qrMarker.addTo(floors[i].layer).openPopup();
            break;
        }
    }

}


//Configuración de la lupa
var mobileOpts = {
    text: 'Buscar',
    autoType: true,
    autoCollapse: true,
    autoCollapseTime: 4000,
    animateLocation: true,
    tipAutoSubmit: true,  		//auto map panTo when click on tooltip
    autoResize: true,			//autoresize on input change
    markerLocation: false,
    minLength: 1,				//minimal text length for autocomplete
    textErr: 'Ningún resultado',
    layer: totalPois,
    initial: false,
    //title: title,
    callTip: customTip,
    tooltipLimit: -1,			//limit max results to show in tooltip. -1 for no limit.
    delayType: 800	//with mobile device typing is more slow
};

function loadColor() {
    //¡¡POR HACER!!
}

//Configuración de los resultados de búsqueda en la lupa
function customTip(text, color) {
    var tip = L.DomUtil.create('a', 'colortip');
    tip.href = "#" + text;
    tip.innerHTML = text;

    var subtip = L.DomUtil.create('em', 'subtip', tip);
    subtip.style.display = 'inline-block';
    subtip.style.float = 'right';
    subtip.style.width = '18px';
    subtip.style.height = '18px';
    subtip.style.backgroundColor = loadColor() || 'red';
    return tip;
}

//Configuración inicial del mapa
var map = L.map('map', {
    crs: L.CRS.Simple,
    zoom: 0,
    zoomControl: false
    //layer: qrFloor.layer
});


//Localización del origen (QR) y carga del mapa
var searchMarker = new L.Control.Search(mobileOpts);

function initMap(qrPoint) {

    map.addControl(searchMarker);
    map.addControl(new L.Control.Zoom());
    layersControl.addTo(map);

    for (i = (floors.length) - 1; i >= 0; i--) {
        layersControl.addBaseLayer(floors[i].photo, floors[i].name);

        if (floors[i].id === qrPoint.floor.id) {
            qrFloor = floors[i];
            map.addLayer(qrFloor.photo);
            map.addLayer(floors[i].layer);
            map.setMaxBounds(qrFloor.bounds);
            map.setView(qrLoc, 0);
        }
    }

    for (i in floors) {
        map.removeLayer(floors[i].layer);
    }

    map.removeLayer(totalPois);
    map.addLayer(qrFloor.layer);
    qrMarker._bringToFront();

    map.invalidateSize();
}


//EVENTOS - CAMBIO DE PLANTA
map.on('baselayerchange', function (e) {
    if (map.hasLayer(qrFloor.layer)) {
        map.removeLayer(qrFloor.layer);
    }
    map.removeLayer(searchMarker._markerLoc._circleLoc);

    var floor_x;

    for (var i in floors) {
        if ((e.layer && (e.layer._url === floors[i].photo._url)) || (e._url === floors[i].photo._url)) {
            floor_x = floors[i];
            map.addLayer(searchMarker._markerLoc._circleLoc);
            map.addLayer(floor_x.photo);
            if (arrowHead[i] && subarrow[i]) {
                map.fitBounds(arrow[i].getBounds());
//                map.panTo(arrow[i].getBounds().getCenter(), 0);
                map.addLayer(arrowHead[i]);
                flechita = arrowHead[i];
                arrowAnim(flechita, floor_x.name);
                map.setZoom(0);

            } else {
                map.setView(qrFloor.bounds.getCenter(), 0);
            }

        } else {
            map.removeLayer(floors[i].layer);
            map.removeLayer(searchMarker._markerLoc._circleLoc);
            if (arrowHead[i] != null)
                map.removeLayer(arrowHead[i]);

        }

    }
    map.addLayer(floor_x.layer);
    //map.setMaxBounds(floor_x.bounds);
    //map.setView(qrPoint, 0);
});


function drawLocator() {
//    for (var i in floors)
//    {
//        for (var j in floors[i])
//        if floors[i].pois[j].la
//    }
}

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
    subpath = [];
    subarrow = [];
    blinkingMode = null;
    route = new RouteResource().getRoute(org, dst);
    if (route) {

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
                    if (route.fields.origin.fields.floor !== route.fields.destiny.fields.floor) {
                        var check = floorChecks[floors[i].name];
                        blinkingMode = floors[i].name;
                        blinker(check);
                    }
                    map.addLayer(arrowHead[i]);
                    flechita = arrowHead[i];
                    arrowAnim(flechita, floors[i].name);
                    /*
                     map.fitBounds(arrow[i].getBounds());
                     map.setZoom(0);
                     */

                }
            }
        }

        for (f in floors) {
            if (route.fields.origin.fields.floor !== route.fields.destiny.fields.floor) {
                if (route.fields.destiny.fields.floor === floors[f].id) {
                    map.removeLayer(floors[f].layer);
                    map.removeLayer(floors[f].photo);

                }

                if (route.fields.origin.fields.floor === floors[f].id) {
                    map.addLayer(floors[f].layer);
                    map.addLayer(floors[f].photo);
                    map.fitBounds(arrow[f].getBounds());
//                    map.panTo(arrow[i].getBounds().getCenter(), 0);
                    map.addLayer(arrowHead[f]);
                    flechita = arrowHead[f];
                    arrowAnim(flechita, floors[f].name);
                    map.setZoom(0);

                }

            } else {
                if (route.fields.destiny.fields.floor !== floors[f].id) {
                    map.removeLayer(floors[f].layer);
                    map.removeLayer(floors[f].photo);

                }
                else {
                    map.addLayer(floors[f].layer);
                    map.addLayer(floors[f].photo);
                    map.fitBounds(arrow[f].getBounds());
                    //                    map.panTo(arrow[i].getBounds().getCenter(), 0);
                    map.addLayer(arrowHead[f]);
                    flechita = arrowHead[f];
                    arrowAnim(flechita, floors[f].name);
                    map.setZoom(0);


                }
            }
        }

    } else {
        alert('No existe esa ruta');
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
////Función que define la animación (en este caso, flecha azul) que marca la ruta
var setArrow = function (flecha, idFloor) {

    flecha.setPatterns([
        {offset: arrowsOffset + '%', repeat: 0, symbol: new L.Symbol.ArrowHead({pixelSize: 15, polygon: false, pathOptions: { stroke: true}})}
    ]);
    if (++arrowsOffset > 100)
        arrowsOffset = 0;
}

