//Configuración de iconos
var	OriginIcon = L.AwesomeMarkers.icon({
        icon: 'star',
        color: 'blue',
        spin: true

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




//Carga de datos globales
var origin = {
    point:new PointResource().read(poi_id),
    floor:new FloorResource().read(floor_id),
    enclosure:new EnclosureResource().read(enclosure_id)
};


//Variables globales

var  mapH = $(document).height(),//Altura de la pantalla

    baseLayers={},
    floor_index = 0,
    totalPois=new L.LayerGroup(),
    originFloor,
    originPoint,

    floors = new FloorResource().readFromEnclosure(origin.enclosure.id);

//POIs de cada floor, separados para pintarlos por capas
for (var i in floors){
    floors[i].pois = new PointResource().readOnlyPois(floors[i].id);
}

var path=[],
    route = {},
    arrow = new L.polyline(path),
    arrowHead = new L.polylineDecorator(arrow);

function loadIcon(color) {
var icon= new L.AwesomeMarkers.icon({
        icon: 'bolt',
        color: color
    });
    return icon;
}
//Carga de planos
loopFloors(floor_index);


var name, img;
function loopFloors ()
{
    if(floor_index == floors.length)
    {
        loadPOIs();
        drawOrigin(origin);
        return;
    }

    name=floors[floor_index].name;
    img=floors[floor_index].img;
    var floorImg = new Image();
    floorImg.src = img;
    floorImg.onload = function () {
        var mapW = (floorImg.width / floorImg.height) * mapH;
        var bounds = new L.LatLngBounds(new L.LatLng(0, 0), new L.LatLng(mapH, mapW));

        floors[floor_index].scaleX= mapW/floors[floor_index].num_cols;
        floors[floor_index].scaleY= mapH/floors[floor_index].num_rows;
        floors[floor_index].bounds=bounds;
        floors[floor_index].photo = new L.imageOverlay(img, bounds);

        baseLayers[name] = new L.imageOverlay(img, bounds);

        floor_index++;
        loopFloors();
    };
}



//Carga de POIs

function loadPOIs()
{

    for (var fl in floors){
        floors[fl].layer=new L.LayerGroup();

        for (j=0; j<floors[fl].pois.length; j++) {
                if (floors[fl].pois[j].id===poi_id)
                    floors[fl].pois.splice(j, 1);
                var colorIcon = floors[fl].pois[j].label.category.color,
                    nameIcon =floors[fl].pois[j].label.name,
                    id= floors[fl].pois[j].id,
                    sX= floors[fl].scaleX,
                    sY= floors[fl].scaleY,
                    loc = [(floors[fl].pois[j].row)*sY+(sY),
                        floors[fl].pois[j].col*sX+(sY)],
                    category = floors[fl].pois[j].label.category.name;

                floors[fl].pois[j].marker = new L.Marker(new L.latLng(loc), {icon:loadIcon(colorIcon), title:nameIcon /*, color:colorIcon*/});
                //floors[fl].pois[j].marker.options.icon.options.className='awesome-marker';
            floors[fl].pois[j].marker.options.icon.options.color=colorIcon;
//IMPORTANTE- CAMBIO DE ICONOS DINÁMICO
// floors[fl].pois[j].marker.options.icon.options.icon='star';
                floors[fl].pois[j].marker.poid=id;
                floors[fl].pois[j].marker.psX=sX;
                floors[fl].pois[j].marker.psY=sY;
                floors[fl].pois[j].marker.loc=loc;

                floors[fl].pois[j].marker.bindPopup(nameIcon)
                    .on('click', function () {
                        map.removeLayer(searchMarker._markerLoc._circleLoc);
                        drawRoute(origin.point.id, originFloor.sX, originFloor.sY,this.poid, this.psX, this.psY);
                    });
                floors[fl].layer.addLayer(floors[fl].pois[j].marker);
                totalPois.addLayer(floors[fl].pois[j].marker);


        }
    }


    /*
    floors[1].layer.eachLayer(function (layer) {
        layer.setIcon(redMarker);
//        var destinyPoint= [layer._latlng.lat, layer._latlng.lng];
//        layer.on({
//           click: function(e){
//               drawRoute(origin.point.id, destinyPoint);
////                alert('Lat: '+layer._latlng.lat+', Lng: '+layer._latlng.lng);
//           }
//        });
    });

*/
    for(var i in totalPois._layers) {
//        console.log(i);
        totalPois._layers[i].title = totalPois._layers[i].options.title;
        	//value searched
        totalPois._layers[i].color = totalPois._layers[i].options.icon.options.color;

        //    loc = data[i].loc,		//position found
        //    marker = new L.Marker(new L.latLng(loc), {title: title} );//se property searched
        //marker.bindPopup('title: '+ title );
        //markersLayer.addLayer(marker);
    }

    for(i in floors) {
        if (origin.floor.id == floors[i].id) {
            originFloor = floors[i];
            originFloor.sX = floors[i].scaleX;
            originFloor.sY =floors[i].scaleY;

            originPoint = [((origin.point.row) * originFloor.scaleY)+originFloor.scaleY,
                (origin.point.col * originFloor.scaleX)+originFloor.scaleX];
            originMarker = new L.marker(originPoint, { bounceOnAdd: false,
                //bounceOnAddHeight: 20,
                icon: OriginIcon})
                .bindPopup("Estás aquí: " /*+ origin.point.description*/ + "(planta " + originFloor.name + "," + origin.enclosure.name+ ")");
            originMarker.addTo(floors[i].layer).openPopup();
            break;
        }
    }

    layersControl= new L.control.layers(null, null, {collapsed:false});

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
    markerLocation:false,
    minLength: 1,				//minimal text length for autocomplete
    textErr: 'Ningún resultado',
    layer: totalPois,
    //title: title,
    callTip: customTip,
    tooltipLimit: -1,			//limit max results to show in tooltip. -1 for no limit.
    delayType: 800	//with mobile device typing is more slow
};

function loadColor(){
    //TODO
}

//Configuración de los resultados de búsqueda en la lupa
function customTip(text, color)
{
    var tip = L.DomUtil.create('a', 'colortip');

    tip.href = "#"+text;
    tip.innerHTML = text;

    var subtip = L.DomUtil.create('em', 'subtip', tip);
    subtip.style.display = 'inline-block';
    subtip.style.float = 'right';
    subtip.style.width = '18px';
    subtip.style.height = '18px';
    //subtip.style.backgroundColor = colortext;
    subtip.style.backgroundColor = loadColor() || 'red';
    return tip;
}

var map = L.map('map', {
    crs: L.CRS.Simple,
    zoom: 0,
    zoomControl:false
    //layer: originFloor.layer
});

var searchMarker=new L.Control.Search(mobileOpts);

function drawOrigin(origin) {
    map.addControl(searchMarker);
    map.addControl(new L.Control.Zoom());

    layersControl.addTo(map);

    for(i in floors)
    {
        map.removeLayer(floors[i].layer);
    }


    for (i=(floors.length)-1; i>=0; i--)
    {
        layersControl.addBaseLayer(floors[i].photo,floors[i].name);

        if(origin.floor.id === floors[i].id)
            {
                map.addLayer(floors[i].photo);
                console.log("añade foto " + i);

                map.addLayer(floors[i].layer);
                console.log("añade iconos " + i);

                //originFloor = floors[i];
                map.setMaxBounds(floors[i].bounds);
                map.setView(floors[i].bounds.getCenter(),0);
                //break;
             }

        else {
            map.removeLayer(floors[i].layer);
            map.removeLayer(totalPois);

        }
    }


}



//EVENTOS - CAMBIO DE PLANTA

map.on('baselayerchange', function (e) {
    if(map.hasLayer(originFloor.layer)){
        map.removeLayer(originFloor.layer);
    }
    var floor_x;
    for (var i in floors){
        if (e.layer._url === floors[i].photo._url) {
            floor_x = floors[i];
            map.addLayer(searchMarker._markerLoc._circleLoc);

        } else {
            map.removeLayer(floors[i].layer);
            map.removeLayer(searchMarker._markerLoc._circleLoc);
        }
    }
    map.setView(originPoint, 0);
    map.addLayer(floor_x.layer);
    map.setMaxBounds(floor_x.bounds);
});


//Creamos la ruta uniendo los puntos del array "path"
function drawRoute(org, osX, osY, dst, sX, sY) {
    for (var i in floors){
        if(arrow[i]){
        floors[i].layer.removeLayer(arrow[i]);
        floors[i].layer.removeLayer(arrowHead[i]);
        }
    }

    path=[];
    subpath=[];

    route = new RouteResource().getRoute(org, dst);
    if(route){

            if (route.fields.origin.fields.floor===route.fields.destiny.fields.floor){
                for (var i in floors ) {
                    if(route.fields.origin.fields.floor == floors[i].id){

                    subpath[i]=[];
                    subpath[i].push([(route.fields.origin.fields.row)*osY+osY, route.fields.origin.fields.col*osX+osX]);
                    console.log ('planta: '+i);
                    for (var j in route.fields.steps ) {
                        subpath[i].push([(route.fields.steps[j].fields.row)*osY+osY, (route.fields.steps[j].fields.column)*osX+osX]);
                    }
                    arrow[i] = L.polyline(subpath[i],{color: 'orange'});
                    arrowHead[i] = L.polylineDecorator(arrow[i]);

//                        var arrowOffset = 0;
//                        anim = window.setInterval(function() {
//                        arrowHead[i].setPatterns([
//                        {offset: arrowOffset+'%', repeat: 0, symbol: new L.Symbol.ArrowHead({pixelSize: 15, polygon: false, pathOptions: {/*color:"orange",*/ stroke: true}})}
//                        ]);
//                        if(++arrowOffset > 100)
//                        arrowOffset = 0;
//                        }, 100);
                    }
                }

            }else{
                for (var i in route.fields.subroutes) {
                    if (route.fields.subroutes[i].floor.pk === route.fields.origin.fields.floor){
                        subpath[i]=[];
                        subpath[i].push([(route.fields.origin.fields.row)*osY+osY, route.fields.origin.fields.col*osX+osX]);
                        console.log ('planta: '+i);
                        for (var j in route.fields.subroutes[i].steps ) {
                            subpath[i].push([(route.fields.subroutes[i].steps[j].fields.row)*osY+osY, (route.fields.subroutes[i].steps[j].fields.column)*osX+osX]);
                        }
                        arrow[i] = L.polyline(subpath[i],{color: 'orange'});
                        arrowHead[i] = L.polylineDecorator(arrow[i]);

//                        var arrowOffset = 0;
//                        anim = window.setInterval(function() {
//                        arrowHead[i].setPatterns([
//                        {offset: arrowOffset+'%', repeat: 0, symbol: new L.Symbol.ArrowHead({pixelSize: 15, polygon: false, pathOptions: {/*color:"orange",*/ stroke: true}})}
//                        ]);
//                        if(++arrowOffset > 100)
//                        arrowOffset = 0;
//                        }, 100);

                    }
                    else {
                        subpath[i]=[];
                        console.log ('planta: '+i);
                        for (var j in route.fields.subroutes[i].steps ) {
                            subpath[i].push([(route.fields.subroutes[i].steps[j].fields.row)*sY+sY, (route.fields.subroutes[i].steps[j].fields.column)*sX+sX]);
                        }

                        arrow[i] = L.polyline(subpath[i],{color: 'orange'});
                        arrowHead[i] = L.polylineDecorator(arrow[i]);

                        var arrowOffset = 0;
                        anim = window.setInterval(function() {
                            arrowHead[i].setPatterns([
                                {offset: arrowOffset+'%', repeat: 0, symbol: new L.Symbol.ArrowHead({pixelSize: 15, polygon: false, pathOptions: {/*color:"orange",*/ stroke: true}})}
                            ]);
                            if(++arrowOffset > 100)
                                arrowOffset = 0;
                        }, 100);


                    }

                }

            }

        for(i in floors)
        {
            if(arrow[i]){
            floors[i].layer.addLayer(arrow[i]);
            floors[i].layer.addLayer(arrowHead[i]);
            //floors[i].fitBounds(arrow[i].getBounds());
            //map.setView(arrow[i].getCenter(), 0);
            }


//            if(route.fields.origin.fields.floor == floors[i].id)
//            {
//                floors[i].layer.addLayer(arrow);
//                floors[i].layer.addLayer(arrowHead);
//                //break;
//            }
//            else{
//                floors[i].layer.addLayer(arrow[i]);
//                floors[i].layer.addLayer(arrowHead[i]);
//
//            }
        }

    }else{
        alert('No existe esa ruta');
    }

}

