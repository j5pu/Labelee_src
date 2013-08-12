(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var blinkingMode = null;
function blinker(element) {
    if (blinkingMode != null && element != null && element.parentElement.innerText.trimLeft() == blinkingMode) {
        var color = element.style.background;
        if (color == "red") {
            element.style.background = "";
        } else {
            element.style.background = "red";
        }
        window.setTimeout(function () {
            blinker(element);
        }, 1000);
    } else {
        if (element != null) element.style.background = "";
    }
}


var Map = {};

var showOrigin = false;

//Configuración de iconos

//var txtIcon = L.divIcon({className: 'txt-icon'});
var carIcon = L.divIcon({className: 'my-div-icon car-icon'}),
    destIcon = L.divIcon({className: 'my-div-icon dest-icon'}),
    originIcon = L.divIcon({className: 'my-div-icon locate-icon'});
var txtIcon = new L.icon({
    iconUrl: '/media/texticon.png',
    iconRetinaUrl: '/media/texticon.png',
    iconSize: [1, 1],
    iconAnchor: [0, 0],
    //popupAnchor: [0,0],
    labelAnchor: [-12, 17]
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


function loadIcon(shape) {
    var icon = L.divIcon({
        className: "my-div-icon icon-white icon-"+ shape
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
qrPoint.isParking = function () {
    return this.labelCategory.name == 'Parking';
};


var LocalStorageHandler = {

    init: function () {
        this.checkExpire();
        this.setValues();
    },

    checkExpire: function () {
        for (index = 0; index < localStorage.length; index++) {
            if (localStorage.key(index) != 'prevDest' && localStorage.key(index) != 'miCoche')
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
        if (qrPoint.isParking()) {
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
            this.setSharedDest();
        }
        else {
            var sharedDest = JSON.parse(localStorage.getItem('sharedDest'));
            if (sharedDest) {
                localStorage.removeItem('sharedDest');
                sharedDest.mesg = gettext('Do you still want to go to the previous destination?');

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
        }

        var prevDest = JSON.parse(localStorage.getItem('prevDest'));
        if (prevDest) {
            if (qrPoint.enclosure.id != prevDest.enclosureid)
                return;

            var point_dest_id = prevDest.poid,
                floor_dest_id = prevDest.floorid,
                description = prevDest.description_for_menu;

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
            'floorid': marker.floorid,
            'enclosureid': qrPoint.enclosure.id,
            'mesg': gettext('Do you still want to go to') + ' ' + marker.description + '?',
            'description': marker.title,
            'description_for_menu': marker.description
        };
        localStorage.setItem('prevDest', JSON.stringify(prevDest));
    },
    setPrevDestByPoi: function (pointid) {
        var poi = null;
        for (var floorIndex = 0, len = floors.length; floorIndex < len; ++floorIndex) {
            for (var poiIndex = 0; poiIndex < floors[floorIndex].pois.length; ++poiIndex) {
                if (floors[floorIndex].pois[poiIndex].id == pointid) {
                    poi = floors[floorIndex].pois[poiIndex];
                    break;
                }
            }

            if (poi != null) {
                break;
            }
        }
        if (poi != null) {
            var prevDest = {
                'prevDate': new Date().getTime(),
                'poid': poi.id,
                'floorid': poi.floor,
                'enclosureid': qrPoint.enclosure.id,
                'mesg': gettext('Do you still want to go to') + ' ' + poi.marker.description + '?',
                'description': poi.marker.title,
                'description_for_menu': poi.marker.description
            };
            localStorage.setItem('prevDest', JSON.stringify(prevDest));
        }
    },

    setSharedDest: function () {
        var sharedDest = {
            dest: qrPoint,
            'prevDate': new Date().getTime(),
            'shooted_origin': false
        };

        localStorage.setItem('sharedDest', JSON.stringify(sharedDest));
    },


    draw: function () {
        if (qr_type == 'origin') {
            // DESTINO PREVIO
            var prevDest = JSON.parse(localStorage.getItem('prevDest'));
            if (prevDest) {
                if (prevDest.dest && prevDest.dest.enclosure.id == qrPoint.enclosure.id) {
                    if (prevDest.shooted_origin)
                        if (confirm(prevDest.mesg)) {
                            showOrigin = true;
                            preDrawRoute(qrPoint.point.id, qrPoint.floor.id, prevDest.dest.point.id, prevDest.dest.floor.id);
                        }
                        else
                            localStorage.removeItem('prevDest');
                    else {
                        showOrigin = true;
                        preDrawRoute(qrPoint.point.id, qrPoint.floor.id, prevDest.dest.point.id, prevDest.dest.floor.id);
                        prevDest.shooted_origin = true;
                        localStorage.setItem('prevDest', JSON.stringify(prevDest));
                    }
                }
                else if (prevDest.enclosureid == qrPoint.enclosure.id) {
                    if (confirm(prevDest.mesg)) {
                        showOrigin = true;
                        preDrawRoute(qrPoint.point.id, qrPoint.floor.id, prevDest.poid, prevDest.floorid);
                    }
                    else
                        localStorage.removeItem('prevDest');
                }
            }

            this.setSideMenu();
        }

    }
};


//Variables globales
var mapW = Math.min($(window).innerWidth(), $(window).innerHeight()),
//var mapH = $(document).height(),//Altura de la pantalla
//var mapW = window.innerWidth,//Anchura de la pantalla
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
    qrMarker = new L.Marker(),
    destMarker = new L.Marker(),
    subpath = [],
    subarrow = [],
    floors_indexed = {},
    current_floor = null,
    floors = floorResource.readFromEnclosure(qrPoint.enclosure.id);

    // Indexamos la lista de plantas por su id
    for(var i in floors)
    {
        floors_indexed[floors[i].id] = floors[i];
    }


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
        $('div#cupones, div#header, span.locator, div#marquee').show();
//recolocar controles
        $('span:has(i.icon-film)').css('left', '11px');
        $('span:has(i.icon-glass)').css('left', '11px');
        Coupon.init();




//       if(( ua.indexOf("Android") >= 0 ) && (androidversion >=3.0))

        //Coupon.init();

        // fin de loopFloors
        return;
    }

    name = floors[floor_index].name;

/*
   if (!Modernizr.svg) {
        img = floors[floor_index].imgB;
//       Logger.log('png');
    }

   else {
    img = floors[floor_index].img;
   }
*/
    img = floors[floor_index].imgB;
    //floors[floor_index].img||
    var floorImg = new Image();
    floorImg.src = img;
//    var solotxt="/media/img/enclosures/26/floors/solotextos.gif";

    floorImg.onload = function () {
//        var mapH = (floorImg.height / floorImg.width) * mapW;
        var mapH=mapW;
        var bounds = new L.LatLngBounds(new L.LatLng(0, 0), new L.LatLng(mapH, mapW));

        floors[floor_index].scaleX = mapW / floors[floor_index].num_cols;
        floors[floor_index].scaleY = mapH / floors[floor_index].num_rows;
        floors[floor_index].bounds = bounds;
//        floors[floor_index].photo= new L.imageOverlay(img, bounds);

        floors[floor_index].photo = new L.LayerGroup();
        floors[floor_index].img= new L.imageOverlay(img, bounds);
//        floors[floor_index].solotxt= new L.imageOverlay(solotxt, bounds);

        floors[floor_index].photo.addLayer(floors[floor_index].img);
//        floors[floor_index].photo.addLayer(floors[floor_index].solotxt);

/*
        var centerHeading = [(floors[floor_index].num_rows/4)*3 *floors[floor_index].scaleY + (floors[floor_index].scaleY),
            floors[floor_index].num_cols/3.5 * floors[floor_index].scaleX + (floors[floor_index].scaleX)];

        floors[floor_index].heading= new L.marker(centerHeading, {icon: txtIcon})
            .bindLabel('ALCALA MAGNA', { noHide: true })
            .addTo(floors[floor_index].photo)
            //.addTo(map)
            .showLabel();
*/



/*
        floors[floor_index].photo = new L.geoJson(mimapa, {
                style: function (feature) {
                    return feature.properties && feature.properties.style;
                }}
        );
*/
        baseLayers[name] = new L.imageOverlay(img, bounds);
/*
        baseLayers[name] = new L.geoJson(mimapa, {
                style: function (feature) {
                    return feature.properties && feature.properties.style;
                }}
        );
*/
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

        for (j = 0; j < floors[fl].pois.length; j++) {
            if (floors[fl].pois[j].id === poi_id) {
                // Si es el último no hacemos nada. Si no, lo sacamos
                if (j == floors[fl].pois.length-1)
                    break;
                else
                    floors[fl].pois.splice(j, 1);
            }
            var colorIcon = floors[fl].pois[j].label.category.color,
                nameIcon = floors[fl].pois[j].label.name,
                shapeIcon = floors[fl].pois[j].label.category.icon,
                id = floors[fl].pois[j].id,
                floorid = floors[fl].pois[j].floor;
            description = floors[fl].pois[j].description,
                panorama = floors[fl].pois[j].panorama,
                coupon = floors[fl].pois[j].coupon,
                sX = floors[fl].scaleX,
                sY = floors[fl].scaleY,
                loc = [(floors[fl].pois[j].row) * sY + (sY),
                    floors[fl].pois[j].col * sX +(sX)],
                center = [(floors[fl].pois[j].center_x) * sY + (sY),
                    floors[fl].pois[j].center_y * sX + (sX)],
                labelid = floors[fl].pois[j].label.id,
                category = floors[fl].pois[j].label.category.name,
                category_en = floors[fl].pois[j].label.category.name_en;

            var popupTitle = description;
            if (panorama) {
                popupTitle += Panorama.renderIcon(id);
            }
            popupTitle += SocialMenu.renderIcon(id);

            floors[fl].pois[j].marker =new L.marker(center, {
                icon: loadIcon(shapeIcon)});

            floors[fl].pois[j].marker.poid = id;
            floors[fl].pois[j].marker.floorid = floorid;
            floors[fl].pois[j].marker.psX = sX;
            floors[fl].pois[j].marker.psY = sY;
            floors[fl].pois[j].marker.loc = loc;
            floors[fl].pois[j].marker.center = center;
            floors[fl].pois[j].marker.category = category;
            floors[fl].pois[j].marker.category_en = category_en;
            floors[fl].pois[j].marker.label = labelid;
            floors[fl].pois[j].marker.panorama = panorama;
            floors[fl].pois[j].marker.coupon = coupon;
            floors[fl].pois[j].marker.description = description;

            floors[fl].pois[j].marker.changeTitle = function () {
                this.popupTitle = gettext("Scan a QR code to get here:") + " " + this.description + this.panoramaIcon + SocialMenu.renderIcon(this.poid);
                this.bindPopup(popupTitle).openPopup();
                bindContent(this);
            };


            floors[fl].pois[j].marker
                .bindPopup(popupTitle)
                .on('click tap touchstart touch', function () {
                    if (qr_type == 'dest') {
                        this.changeTitle();
                        return;
                    }

                    LocalStorageHandler.setPrevDest(this);
                    if (Panorama.opened) Panorama.close();
                    if (qrMarker)
                    {
                     preDrawRoute(qrPoint.point.id, qrFloor.id, this.poid, this.floorid);
                    }

                    qrMarker.contentBinded = false;
                    bindContent(qrMarker);
                });

            for (var l in floors[fl].labels) {
                if (floors[fl].pois[j].marker.category === floors[fl].labels[l].fields.name) {
                    floors[fl].labels[l].layer.addLayer(floors[fl].pois[j].marker);
                }
            }

            if (isCategoryVisibleOnButtons(floors[fl].pois[j].marker.category_en))
                totalPois.addLayer(floors[fl].pois[j].marker);

            if (isPoiVisibleByDefault(floors[fl].pois[j].marker.category_en))
               floors[fl].layer.addLayer(floors[fl].pois[j].marker);
        }


        // Cada label es un conjunto de POIs (restaurantes, cines..)
        for (var i = 0; i < floors[fl].labels.length;) {
            if (!isCategoryVisibleOnButtons(floors[fl].labels[i].fields.name)) {
                floors[fl].layer.addLayer(floors[fl].labels[i].layer);
                floors[fl].labels.splice(i--, 1);
            }
            else {
                i++;
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
                var point_description = qrPoint.label.name_en == 'My car' ?
                    qrPoint.label.name : qrPoint.point.description;

                var originLegend = gettext("You are right here:") + '<br>' + point_description;
                if (qrPoint.point.panorama)
                    originLegend = originLegend + Panorama.renderIcon(qrPoint.point.id);
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
                var photoIcon = qrPoint.point.panorama ? Panorama.renderIcon(qrPoint.point.id) : "";

                qrMarker = L.marker(qrLoc, {
                    icon: destIcon}).bindPopup(msg + '<br>'+ qrPoint.point.description + photoIcon + SocialMenu.renderIcon(qrPoint.point.id))
                    .on('click', function () {
                        LocalStorageHandler.setPrevDest(this);
                        bindContent(this);
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


//Localización del origen (QR) y carga del mapa
function initMap(qrPoint) {

    map.addControl(new L.Control.Zoom());
    layersControl.addTo(map);


    for (var i = 0; i<(floors.length); i++) {
        layersControl.addBaseLayer(floors[i].photo, floors[i].name);

        if (floors[i].id === qrPoint.floor.id) {
            qrFloor = floors[i];
            current_floor = floors[i];
            map.addLayer(qrFloor.photo);
            map.addLayer(qrFloor.layer);


            for (var txt in qrFloor.pois) {
                if (qrFloor.pois[txt].textMarker)   qrFloor.pois[txt].textMarker.addTo(map).showLabel();
            }

            for (var l in floors[i].labels) {
                layersControl.addOverlay(floors[i].labels[l].layer, '<i class="icon-' + floors[i].labels[l].fields.icon + ' icon-white"></i>');
            }


            map.setView(qrFloor.bounds.getCenter(), 0);
            bindContent(qrMarker);
            map.setMaxBounds(map.getBounds());
            qrMarker.openPopup();
            qrMarker._bringToFront();


            if (qrPoint.point.coupon) {
                $('div.leaflet-popup-content-wrapper').addClass('withCoupon');
            }
            bindContent(qrMarker);

            //loadHeadings(i);

        }
    }

    map.removeLayer(totalPois);
    //map.addLayer(qrFloor.layer);
    //qrMarker._bringToFront();

    if (map.hasLayer(destMarker)) {
        destMarker.openPopup();
        bindContent(destMarker);
    }
    loadedLabels = true;
//    map.invalidateSize();
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function drawHeadings(n){
    var descr = escapeHtml(floors[n].pois[p].description);
    L.marker(floors[n].pois[p].marker.center, {icon: txtIcon})
        .bindLabel(descr, { noHide: true })
        .addTo(floors[n].layer)
        .showLabel();
    var $myLabel = $('div.leaflet-label:contains(' + descr + ')');
    var $width = $myLabel.width();
    $myLabel.css('margin-left', -$width / 2);

    if (floors[n].pois[p].isVertical) {
        $myLabel.addClass('isVertical');
    }
}

function loadHeadings(n) {
    for (var p in floors[n].pois) {

        if (map.getZoom() < 2)
        {
            if (floors[n].pois[p].alwaysVisible)
            {
                var descr = escapeHtml(floors[n].pois[p].description);
                L.marker(floors[n].pois[p].marker.center, {icon: txtIcon})
                    .bindLabel(descr, { noHide: true })
                    .addTo(floors[n].layer)
                    .showLabel();
                var $myLabel = $('div.leaflet-label:contains(' + descr + ')');
                var $width = $myLabel.width();
                $myLabel.css('margin-left', -$width / 2);

                if (floors[n].pois[p].isVertical) {
                    $myLabel.addClass('isVertical');
                }

            }
        }
        else
        {
            var descr = escapeHtml(floors[n].pois[p].description);
            L.marker(floors[n].pois[p].marker.center, {icon: txtIcon})
                .bindLabel(descr, { noHide: true })
                .addTo(floors[n].layer)
                .showLabel();
            var $myLabel = $('div.leaflet-label:contains(' + descr + ')');
            var $width = $myLabel.width();
            $myLabel.css('margin-left', -$width / 2);

            if (floors[n].pois[p].isVertical) {
                $myLabel.addClass('isVertical');
            }

        }
    }

    var centerHeading = [(floors[n].num_rows/5)*4 *floors[n].scaleY + (floors[n].scaleY),
        floors[n].num_cols/5 * floors[n].scaleX + (floors[n].scaleX)];

    L.marker(centerHeading, {icon: txtIcon})
        .bindLabel('ALCALA MAGNA - Planta '+floors[n].name, { noHide: true })
        .addTo(floors[n].layer)
        .showLabel();

}

//EVENTOS - Añadir layer
map.on('layeradd', function (e) {
    addCategory(e);
});

//EVENTOS - Quitar layer
map.on('layerremove', function (e) {
    removeCategory(e);
});
//EVENTOS - CAMBIO DE PLANTA
map.on('baselayerchange', function (e) {
    changeFloor(e);
});


// Sacar panorámica para el punto
function setIconColor()
{
    for(var i in floors)
    {
        for(var kk in floors[i].pois)
        {
            var shapeIcon = floors[i].pois[kk].label.category.icon;
            var colorIcon = floors[i].pois[kk].label.category.color;
            $('div.icon-'+ shapeIcon).css({'background': colorIcon, 'border-top-color':colorIcon});
        }
    }

}

function addCategory(e) {

    var selected_category = e.layer.category;

    // Si había un selector antes del nuevo
    if($('input[type=checkbox].leaflet-control-layers-selector:checked').length == 2)
    {
        $('input[type=checkbox].leaflet-control-layers-selector').each(function(index){
            if($(this).is(':checked') && index != checked)
            {
                // desactivo todos y activo el seleccionado
                $('input[type=checkbox].leaflet-control-layers-selector').prop('checked', false);
                $('input[type=checkbox].leaflet-control-layers-selector').css('background', '#333');
                $(this).prop('checked', true);
                for(var i in floors)
                {
                    if(floors[0].labels && floors[0].labels[checked])
                        map.removeLayer(floors[i].labels[checked].layer);
                }
                checked = index;
                if(floors[0].labels && floors[0].labels[checked])
                    $('input[type=checkbox].leaflet-control-layers-selector:eq(' + checked + ')')
                        .css('background', floors[0].labels[checked].fields.color);
                return false;
            }
        });
    }
    else
    {
        $('input[type=checkbox].leaflet-control-layers-selector').each(function(index){
            if($(this).is(':checked'))
            {
                checked = index;
                if(floors[0].labels && floors[0].labels[checked])
                {
                    $('input[type=checkbox].leaflet-control-layers-selector:eq(' + checked + ')')
                        .css('background', floors[0].labels[checked].fields.color);
                }
                return false;
            }
        });
    }




    if(!selected_category)
        return;


    // Cada vez que añade una layer se dispara esto
    for (var i in floors) {
        var cats = $('input[type=checkbox].leaflet-control-layers-selector');
        cats.css('background', '#333');
        cats.prop('checked', false);

        for (var l in floors[i].labels) {
            var myCat = $('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')');
            var current_category = floors[i].labels[l].fields.name;

/*
            if (myCat.is(':checked'))
            {
                myCat.css('background', floors[i].labels[l].fields.color);
                myCat.prop('checked', true);
                checked = l;
                console.log('1 - ' + checked);
                break;
            }

*/
            if (current_category == selected_category)
            {
                myCat.css('background', floors[i].labels[l].fields.color);
                myCat.prop('checked', true);
                checked = l;
                checked_category = selected_category;
                break;
            }
            else
            {
                map.removeLayer(floors[i].labels[l].layer)
            }
        }
    }

    setIconColor();
}



function removeCategory(e) {
    if (e.layer._layers) {
        for (var i in floors) {
            for (var l in floors[i].labels) {
                if (!(jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').is(':checked'))) {
                    jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').css('background', '#333');
                }

            }

        }
    }

}

var checked;
var checked_category;

function changeFloor(e) {

    SocialMenu.close();

    var allUnchecked = true;
    for (pos = 0; pos < $('input[type=checkbox].leaflet-control-layers-selector').length; pos++) {
        if ($('input[type=checkbox].leaflet-control-layers-selector:eq(' + pos + ')').is(':checked')) {
            checked = pos;
            $('input[type=checkbox].leaflet-control-layers-selector:eq(' + pos + ')').prop('checked', false);
            allUnchecked = false;
        }
    }
    if(allUnchecked)
        checked = null;

    var floor_x = {};
    var key;
    for (var i in floors) {
        for (var k in floors[i].photo._layers){
            key=k;
            break;
        }
//        if ((e.layer && (e.layer._url === floors[i].photo._url)) || (e._url === floors[i].photo._url)) {
        if ((e.layer._layers[key] && (e.layer._layers[key]._url === floors[i].photo._layers[key]._url)) || (e._url === floors[i].photo._layers[key]._url)) {
            floor_x = floors[i];
            current_floor = floor_x;
            map.addLayer(floor_x.photo);
            map.addLayer(floor_x.layer);
            
            for (var l in floors[i].labels) {
                layersControl.addOverlay(floor_x.labels[l].layer, '<i class="icon-' + floors[i].labels[l].fields.icon + ' icon-white"></i>');
                if (checked == l) {
                    if (floor_x.labels[l].layer)
                        map.addLayer(floor_x.labels[l].layer);
                }
            }



            if (arrowHead[i] && subarrow[i]) {
                map.addLayer(arrowHead[i]);
                flechita = arrowHead[i];
                arrowAnim(flechita, floor_x.name);
                map.setView(arrow[i].getBounds().pad(15).getCenter(), 0);

            } else {
                map.setView(floor_x.bounds.getCenter(), 0);
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

        //loadHeadings(i);

    }

    for (var lab in floor_x.labels) {
        if (checked == lab) {
            $('input[type=checkbox].leaflet-control-layers-selector:eq(' + lab + ')').css('background', floor_x.labels[lab].fields.color);
            $('input[type=checkbox].leaflet-control-layers-selector:eq(' + lab + ')').prop("checked", true);
        }
    }


/*
    for (var p in floor_x.pois) {
        if (floor_x.pois[p].alwaysVisible) {
            L.marker(floor_x.pois[p].marker.center, {icon: txtIcon})
                .bindLabel(floor_x.pois[p].description, { noHide: true })
                .addTo(floor_x.layer)
                //.addTo(map)
                .showLabel();
            var $width=$('div.leaflet-label:contains(' + floor_x.pois[p].description + ')').width();
            $('div.leaflet-label:contains(' + floor_x.pois[p].description + ')').css('margin-left',-$width/2);
            if (floor_x.pois[p].isVertical) {
                $('div.leaflet-label:contains(' + floor_x.pois[p].description + ')').addClass('isVertical');
            }
        }
    }

    var centerHeading = [(floor_x.num_rows/4)*3 *floor_x.scaleY + (floor_x.scaleY),
        floor_x.num_cols/3.5 * floor_x.scaleX + (floor_x.scaleX)];
    L.marker(centerHeading, {icon: txtIcon})
        .bindLabel('ALCALA MAGNA', { noHide: true })
        .addTo(floor_x.layer)
        //.addTo(map)
        .showLabel();
*/

    if (map.hasLayer(qrMarker)) {
        qrMarker.openPopup();
        if (qrPoint.point.coupon) {
            $('div.leaflet-popup-content-wrapper').addClass('withCoupon');
        }
        bindContent(qrMarker);
    }
    if (map.hasLayer(destMarker)) {
        destMarker.openPopup();
        if (route.fields.destiny.fields.coupon) {
            $('div.leaflet-popup-content-wrapper').addClass('withCoupon');
        }
        bindContent(destMarker);
    }
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

    if (org == dst)
        return;


    ///

    route = new RouteResource().getRoute(org, dst);
    if (!route) {
        alert(gettext('We are sorry, that route does not exist.'));
        return;
    }

    for (pos = 0; pos < $('input[type=checkbox].leaflet-control-layers-selector').length; pos++) {
        if ($('input[type=checkbox].leaflet-control-layers-selector:eq(' + pos + ')').is(':checked')) {
            checked = pos;
            break;
        }
    }

    for (var i in floors) {
        if (arrow[i]) {
            floors[i].layer.removeLayer(arrow[i]);
            map.removeLayer(arrowHead[i]);
        }
        map.removeLayer(floors[i].layer);
    }

    var check = null,
        destLegend;
    subpath = [];
    subarrow = [];
    blinkingMode = null;

//MARKER DESTINO
    for (var i in floors) {
        if (destMarker) {
            floors[i].layer.removeLayer(destMarker);
        }
    }
    destLegend = route.fields.destiny.fields.description;

    if (route.fields.destiny.fields.panorama) {
        destLegend += Panorama.renderIcon(dst);
    }
    destLegend += SocialMenu.renderIcon(dst);

    destLoc = [(route.fields.destiny.fields.row) * sY + sY, route.fields.destiny.fields.col * sX + sX];

    destMarker = L.marker(destLoc, { bounceOnAdd: false,
        icon: destIcon})
        .bindPopup(destLegend, {autoPanPadding: new L.Point(0, 10)})
        .on('click', function () {
            bindContent(this);
        });

    destMarker.panorama = '/media/' + route.fields.destiny.fields.panorama;
    for (var i in floors) {
        if (route.fields.destiny.fields.floor == floors[i].id) {
            floors[i].layer.addLayer(destMarker);
        }
    }

    if (qr_type == 'dest')
        return;

//CALCULO DE SUBRUTAS
    for (var i in route.fields.subroutes) {
        if (route.fields.subroutes[i].floor.pk === route.fields.origin.fields.floor) {
            subpath[i] = [];
            //subpath[i].push([(route.fields.origin.fields.row) * osY + osY, route.fields.origin.fields.col * osX + osX]);
            for (var j in route.fields.subroutes[i].steps) {
                subpath[i].push([(route.fields.subroutes[i].steps[j].fields.row) * osY + osY, (route.fields.subroutes[i].steps[j].fields.column) * osX + osX]);
            }

            for (var f in floors) {
                if (route.fields.subroutes[i].floor.pk === floors[f].id) {
                    subarrow[f] = subpath[i];
                    break;
                }
            }
            arrow[f] = L.polyline(subarrow[f], {color: 'orange', opacity: 0.8, weight:2 });
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
            arrow[f] = L.polyline(subarrow[f], {color: 'orange', opacity: 0.8, weight:2});
            arrowHead[f] = L.polylineDecorator(arrow[f]);
            map.addLayer(arrowHead[f]);
        }
    }

    for (var i in floors) {
        if (arrow[i] && subarrow[i]) {
            floors[i].layer.addLayer(arrow[i]);
            if (floors[i].id === route.fields.destiny.fields.floor) {
                var check = floorChecks[floors[i].name];
                //$('div.leaflet-control-layers-base').find('span:contains("'+check+'")').addClass('blink');
                blinkingMode = floors[i].name;
                blinker(check);
                map.addLayer(arrowHead[i]);
                flechita = arrowHead[i];
                arrowAnim(flechita, floors[i].name);

            }
        }
    }
/*
    for (var f in floors) {
        for (var l in floors[f].labels) {
            if (jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').is(':checked')) {
                checked = l;
                break;
            }
        }
    }
*/
    var floorToShow = route.fields.destiny.fields.floor;
    var floorToHide = current_floor.id;
    current_floor = floors_indexed[floorToShow];
    if (showOrigin) {
        floorToShow = route.fields.origin.fields.floor;
        showOrigin = false;
    }

    //
    //PINTADO DE CAPAS
    //

    //
    // Eliminamos en la planta seleccionada (current_floor),
    // independientemente de que sea origen o no
    map.removeLayer(floors_indexed[floorToHide].layer);
    for (var l in floors_indexed[floorToHide].labels) {
        layersControl.removeLayer(floors_indexed[floorToHide].labels[l].layer);
        map.removeLayer(floors_indexed[floorToHide].labels[l].layer);
    }
    map.removeLayer(floors_indexed[floorToHide].photo);

    //
    // Añadimos en la planta a mostrar
    map.addLayer(floors_indexed[floorToShow].layer);
    map.addLayer(floors_indexed[floorToShow].photo);
    for (var l in floors_indexed[floorToShow].labels) {
        layersControl.addOverlay(floors_indexed[floorToShow].labels[l].layer, '<i class="icon-' + floors_indexed[floorToShow].labels[l].fields.icon + ' icon-white"></i>');
        if (checked == l) {
            map.addLayer(floors_indexed[floorToShow].labels[l].layer);
            $('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').css('background', floors_indexed[floorToShow].labels[l].fields.color);
        }
    }

    qrMarker.openPopup();






//    for (var f in floors) {
//        if (route.fields.origin.fields.floor !== route.fields.destiny.fields.floor) {
//
//            // Si la planta que tengo que ocultar es la current
//            if (floorToHide === floors[f].id) {
//                map.removeLayer(floors[f].layer);
//
//                for (var l in floors[f].labels) {
//                    layersControl.removeLayer(floors[f].labels[l].layer);
//                    map.removeLayer(floors[f].labels[l].layer);
//                }
//
//                map.removeLayer(floors[f].photo);
//
//            // Si la planta que tengo que mostrar es la current
//            } else if (floorToShow === floors[f].id) {
//                map.addLayer(floors[f].layer);
//                map.addLayer(floors[f].photo);
//
//                for (var l in floors[f].labels) {
//                    layersControl.addOverlay(floors[f].labels[l].layer, '<i class="icon-' + floors[f].labels[l].fields.icon + ' icon-white"></i>');
//                    if (checked == l) {
//                        map.addLayer(floors[f].labels[l].layer);
//                        $('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').css('background', floors[f].labels[l].fields.color);
//                    }
//                }
//
////                for (var l in floors[f].labels) {
////                    if (checked == l) {
////                        jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').css('background', floors[f].labels[l].fields.color);
////                        jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').prop("checked", true);
////                    }
////                }
//                map.addLayer(arrowHead[f]);
//                flechita = arrowHead[f];
//                arrowAnim(flechita, floors[f].name);
////                map.setView(arrow[f].getBounds().pad(15).getCenter(), 0);
//                qrMarker.openPopup();
//
//            // Si la planta actual (current) no es ni la que tengo que mostrar, ni la que tengo que ocultar
//            // Por ejemplo en ruta desde la -1 hasta la 1 pasando poor la 0
//            } else {
//
//                for (var l in floors[f].labels) {
//                    if(floors[f].labels[l].e)
//                    {
//                        layersControl.removeLayer(floors[f].labels[l].e);
//                        map.removeLayer(floors[f].labels[l].layer);
//                    }
//                }
//
//                map.removeLayer(floors[f].photo);
//            }
////MONOPLANTA
//        } else {
//            if (route.fields.destiny.fields.floor !== floors[f].id) {
//                map.removeLayer(floors[f].layer);
//                map.removeLayer(floors[f].photo);
//                for (var l in floors[f].labels) {
//                    layersControl.removeLayer(floors[f].labels[l].layer);
//                    map.removeLayer(floors[f].labels[l].layer);
//                }
//
//            }
//            else {
//
//                map.addLayer(floors[f].layer);
//                map.addLayer(floors[f].photo);
//
//                for (var l in floors[f].labels) {
//                    if ($('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').is(':checked')) {
//                        checked = l;
//                    }
//                }
//
//                for (var l in floors[f].labels) {
//                    layersControl.addOverlay(floors[f].labels[l].layer, '<i class="icon-' + floors[f].labels[l].fields.icon + ' icon-white"></i>');
//                    if (checked == l) {
//                        map.addLayer(floors[f].labels[l].layer);
//                        $('input[type=checkbox].leaflet-control-layers-selector:eq(' + l + ')').css('background', floors[f].labels[l].fields.color);
//                    }
//                }
//
//
////                map.setView(arrow[f].getBounds().pad(15).getCenter(), 0);
//                map.addLayer(arrowHead[f]);
//                flechita = arrowHead[f];
//                arrowAnim(flechita, floors[f].name);
////                map.setView(arrow[f].getBounds().pad(15).getCenter(), 0);
//            }
//        }
//    }

    if (map.hasLayer(destMarker)) {
        destMarker.openPopup();
        if (route.fields.destiny.fields.coupon) {
            $('div.leaflet-popup-content-wrapper').addClass('withCoupon');
        }
        bindContent(destMarker);
    }

    if (carMarker && map.hasLayer(carMarker)) {
        map.removeLayer(carMarker);
    }

    // Creo un nuevo displayed route para que el dashboard pueda utilizar esta información
    try {
        DisplayedRoutes.createDisplayedRoute(org, dst);
    } catch (Exception) {

    }

}


//Función que gestiona la animación de la flecha
function arrowAnim(arrow, idFloor) {
/*    if (anim != null) {
        window.clearInterval(anim);

    }
    anim = window.setInterval(function () {
        setArrow(arrow, idFloor)
    }, 100);*/
}

var arrowsOffset = 0;

//Función que define la animación (en este caso, flecha azul) que marca la ruta
var setArrow = function (flecha, idFloor) {
/*
    flecha.setPatterns([
        {offset: arrowsOffset + '%', repeat: 0, symbol: new L.Symbol.Dash({pixelSize: 0, pathOptions: { stroke: true, weight:10}})}
            //ArrowHead({pixelSize: 8, polygon: false, pathOptions: { stroke: true, weight:2}})}


    ]);
    if (++arrowsOffset > 100)
        arrowsOffset = 0;
*/
};
/*
var fps = 15;
//var fps = 0.001;
//var now;
//var then = Date.now();
//var interval = 10000000/fps;
//var delta;
function arrowAnim(arrow, idFloor) {
    (function anim(){
        setArrow(arrow, idFloor);
        setTimeout(function(){
        requestAnimationFrame(anim);
        }, 2000 / fps)
//        now = Date.now();
//        delta = now - then;
//
//        if (delta > interval) {
//            then = now - (delta % interval);
//        }
    })();
}*/



function isCategoryVisibleOnButtons(categ_name) {
    return (categ_name !== "Parquing" && categ_name !== "Parking") &&
        (categ_name !== "Bloqueantes" && categ_name !== "Blockers") &&
        (categ_name !== "Aristas" && categ_name !== "Connectors") &&
        (categ_name !== "Entrance") &&
        (categ_name !== "Aseos" && categ_name !== "Toilet");
}

function isPoiVisibleByDefault(categ_name) {
    return categ_name == "Connectors" || categ_name == "Toilet" || categ_name == "Entrance";
}


Map.locateCar = function () {
    var miCoche = JSON.parse(localStorage.getItem('miCoche'));

    if (!miCoche || miCoche.dest.enclosure.id != enclosure_id) {
        alert('Please, scan the QR code at your parking place to' +
            ' locate your car.');
        return;
    }

    miCoche = miCoche.dest;

    for (pos = 0; pos < $('input[type=checkbox].leaflet-control-layers-selector').length; pos++) {
        if ($('input[type=checkbox].leaflet-control-layers-selector:eq(' + pos + ')').is(':checked')) {
            checked = pos;
        }
    }

    var floor_x = {};
    for (var i in floors) {
        if (floors[i].id === miCoche.floor.id) {
            floor_x = floors[i];
            current_floor = floor_x;
            carLoc = [((miCoche.point.row) * floor_x.scaleY) + floor_x.scaleY,
                (miCoche.point.col * floor_x.scaleX) + floor_x.scaleX];
            carMarker = new L.marker(carLoc, {
                icon: carIcon})
                .bindPopup(gettext("My car"));
            carMarker.on('click', function () {
                LocalStorageHandler.setPrevDest(this);
                if (Panorama.opened) Panorama.close();
                drawRoute(qrPoint.point.id, qrFloor.sX, qrFloor.sY, miCoche.point.id, floor_x.scaleX, floor_x.scaleY);

            });
            floor_x.layer.addLayer(carMarker);
            for (var l in floors[i].labels) {
                layersControl.addOverlay(floor_x.labels[l].layer, '<i class="icon-' + floors[i].labels[l].fields.icon + ' icon-white"></i>');
                if (checked == l) {
                    map.addLayer(floor_x.labels[l].layer);
                }
            }

            map.addLayer(floor_x.photo);
            map.addLayer(floor_x.layer);

            if (arrowHead[i] && subarrow[i]) {
                map.addLayer(arrowHead[i]);
                flechita = arrowHead[i];
                arrowAnim(flechita, floor_x.name);
                map.setView(arrow[i].getBounds().pad(15).getCenter(), 0);

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

    for (var lab in floor_x.labels) {
        if (checked == lab) {
            jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + lab + ')').css('background', floor_x.labels[lab].fields.color);
            jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + lab + ')').prop("checked", true);
        }
    }
    carMarker.openPopup();
    carMarker._bringToFront();
    map.setView(carLoc, 0);
};


Map.locatePosition = function () {
    for (pos = 0; pos < $('input[type=checkbox].leaflet-control-layers-selector').length; pos++) {
        if ($('input[type=checkbox].leaflet-control-layers-selector:eq(' + pos + ')').is(':checked')) {
            checked = pos;
        }
    }

    var floor_x = {};
    for (var i in floors) {
        if (floors[i].id === qrFloor.id) {
            floor_x = floors[i];
            current_floor = floor_x;
        } else {
            map.removeLayer(floors[i].layer);
            map.removeLayer(floors[i].photo);

            for (var l in floors[i].labels) {
                layersControl.removeLayer(floors[i].labels[l].layer);
                map.removeLayer(floors[i].labels[l].layer);
            }

            if (arrowHead[i] != null)
                map.removeLayer(arrowHead[i]);

//            if(layersControl._overlaysList.childElementCount > 8)
//            {
//                for (var l=8;l<floors[i].labels.length-1; l++) {
//                    layersControl.removeLayer(floors[i].labels[l].layer);
//                }
//            }
        }
    }


    map.addLayer(floor_x.photo);
    map.addLayer(floor_x.layer);
    for (var l in floor_x.labels) {
        layersControl.addOverlay(floor_x.labels[l].layer, '<i class="icon-' + floor_x.labels[l].fields.icon + ' icon-white"></i>');
        if (checked == l) {
            map.addLayer(floor_x.labels[l].layer);
        }
    }
//    if (arrowHead[i] && subarrow[i]) {
//        map.addLayer(arrowHead[i]);
//        flechita = arrowHead[i];
//        arrowAnim(flechita, floor_x.name);
//        map.setView(arrow[i].getBounds().pad(15).getCenter(), 0);
//    } else {
//        map.setView(qrLoc, 0);
//    }


    for (var lab in qrFloor.labels) {
        if (checked == lab) {
            jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + lab + ')').css('background', floor_x.labels[lab].fields.color);
            jQuery('input[type=checkbox].leaflet-control-layers-selector:eq(' + lab + ')').prop("checked", true);
        }
    }
    map.addLayer(qrFloor.layer);
    qrMarker._bringToFront();
    qrMarker.openPopup();
    qrMarker.on('click', function () {
        bindContent(qrMarker);
    });
};


if (map.hasLayer(destMarker)) {
    destMarker.openPopup();
    if (route.fields.destiny.fields.coupon) {
        $('div.leaflet-popup-content-wrapper').addClass('withCoupon');
    }
    bindContent(destMarker);
}


Map.resize = function () {
    Coupon.calculateCouponArea();
    Panorama.resize();
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
    if (marker.contentBinded)
        if (marker.contentBinded)
            return;

    // Se bindea el contenido del popup abierto para el marker
    Panorama.bindShow(marker);
    SocialMenu.bindShow(marker);
    Coupon.bindShowFromMarker();

    marker.contentBinded = true;
}


/*
 var    drawnItems = new L.MarkerClusterGroup({
 disableClusteringAtZoom: 0
 }),
 */

//PRUEBA FONT-ICONS


/*
 markers = [];

// addMarker(new L.LatLng(300,300), {icon: "\ue002", color: "#ff0000"});
// addMarker(new L.LatLng(400,400), {icon: "\ue002", color: "#00ff00"});
// addMarker(new L.LatLng(350,350), {icon: "\ue002", color: "#0000ff"});
// addMarker(new L.LatLng(300,300), {icon: "\ue070", color: "#ff0000"});
// addMarker(new L.LatLng(400,400), {icon: "\ue025", color: "#00ff00"});
// addMarker(new L.LatLng(350,350), {icon: "\u2605", color: "#0000ff"});



 //addMarker(new L.LatLng(150, 150), {icon: "\ue002", color: "#8B668B", iconFont: 'iconic'}); // pin only display

// addMarker(new L.LatLng(250,250), {icon: "\uf030", color: "#990000", iconFont: 'awesome'}); //camera
// addMarker(new L.LatLng(200,200), {icon: "\uf06e", color: "#009900", iconFont: 'awesome'}); // eye open
// addMarker(new L.LatLng(100,300), {icon: "\uf005", color: "#000099", iconFont: 'awesome'}); // star

 addMarker(new L.LatLng(175,175), {icon: "\uf041", color: "#4F2F4F"}); // pin only


//map.addLayer(drawnItems);

// map.on("viewreset", function() {
// var zoom = map.getZoom(),
// size = computeSizeFromZoom();
// //console.log("resize, zoom " + zoom + " size " + size);
// for (var i = 0; i < markers.length; i++) {
// markers[i].setFontSize(size * 1.2);
// }
// });
//
// function computeSizeFromZoom() {
// var max = map.getMaxZoom(),
// zoom = map.getZoom(),
// diff = max - zoom,
// table = [2, 1, 0.5];
// return  (diff < table.length) ? table[diff] : 0.5;
// }



addMarker(new L.LatLng(175,175), {icon: "\uf041", color: "#4F2F4F"}); // pin only

 function addMarker(latLng, opts) {
 var icon = opts.icon || "\ue002",
 color = opts.color || "blue",
 font = opts.iconFont || "awesome",
 sz = 1;
// sz = computeSizeFromZoom();

 marker = new cilogi.L.Marker(latLng, {
 fontIconSize: sz *1.3,
 fontIconName: icon,
 fontIconColor: color,
 fontIconFont: font,
 opacity: 1
 });
 //    drawnItems.addLayer(marker);
 map.addLayer(marker);
 //    markers.push(marker);
 }

*/




//PRUEBA GEOJSON


/*
function onEachFeature(feature, layer) {
    var popupContent = "<p>I started out as a GeoJSON " +
        feature.geometry.type + ", but now I'm a Leaflet vector!</p>";

    if (feature.properties && feature.properties.popupContent) {
        popupContent += feature.properties.popupContent;
    }

    layer.bindPopup(popupContent);
}

*/



/*
L.geoJson(mimapa, {
        style: function (feature) {
            return feature.properties && feature.properties.style;
        }}
).addTo(map);
*/


/*

var micuad={"geometry": {"type": "Polygon", "coordinates": [
    [
        [157.5, 293],
        [157.5, 334.5],
        [213, 334.5],
        [213, 293],
        [157.5, 293]
    ]
]}, "type": "Feature"}

L.geoJson(micuad, {
        style: function (feature) {
            return feature.properties && feature.properties.style;
        }}
).addTo(map);

for (var i in micuad.geometry.coordinates) {
    for (var j in micuad.geometry.coordinates[i]) {
        for (var k in micuad.geometry.coordinates[i][j]) {
        micuad.geometry.coordinates[i][j][k] = micuad.geometry.coordinates[i][j][k] * floors[0].scaleY + (floors[0].scaleY);
    }
    }
}
*/

//L.marker([300, 300.57], {icon: carIcon}).addTo(map);




//PRUEBA PARA LOS LABELMARKERS
/*

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};
var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

L.geoJson(someGeojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
    }
}).addTo(map);
*/
