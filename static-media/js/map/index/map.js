//Configuración de iconos
var	OriginIcon = L.AwesomeMarkers.icon({
        icon: 'home',
        color: 'green'
    }),
    blueMarker = L.AwesomeMarkers.icon({
        icon: 'star',
        color: 'blue',
        spin: true

    }),
    redMarker = L.AwesomeMarkers.icon({
        icon: 'coffee',
        color: 'red'
    });


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

//Configuración de los resultados de búsqueda en la lupa
function customTip(text)
{
    var tip = L.DomUtil.create('a', 'colortip');

    tip.href = "#"+text;
    tip.innerHTML = text;

    var subtip = L.DomUtil.create('em', 'subtip', tip);
    subtip.style.display = 'inline-block';
    subtip.style.float = 'right';
    subtip.style.width = '18px';
    subtip.style.height = '18px';
    //subtip.style.backgroundColor = text;
    subtip.style.backgroundColor = 'red';
    return tip;
}







//Carga de datos globales
var origin = {
    point:new PointResource().read(poi_id),
    floor:new FloorResource().read(floor_id),
    enclosure:new EnclosureResource().read(enclosure_id)
}
var originFloor;
var originPoint;


//Altura de la pantalla
var  mapH = $(document).height();

//Plantas del enclosure asociado al QR
var floorsUris=[];
for (f=0; f<origin.enclosure.floors.length; f++){
    floorsUris.push(origin.enclosure.floors[f]);
}

var floors = [],
    uris=origin.enclosure.floors;
for (var i in uris) {
    floors.push(new FloorResource().readFromUri(uris[i]));
}

//POIs de cada floor, separados para pintarlos por capas
for (var i in floors){
    floors[i].pois = new PointResource().readOnlyPois(floors[i].id);
}


//Variables globales
var baseLayers={},
    floor_index = 0,
    totalPois=new L.LayerGroup();

var path=[];
var route = {};
var arrow = new L.polyline(path);
var arrowHead = new L.polylineDecorator(arrow);

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
var id;

function loadPOIs()
{

    for (var fl in floors){
        floors[fl].layer=new L.LayerGroup();

        for (j=0; j<floors[fl].pois.length; j++) {
                var colorIcon = floors[fl].pois[j].label.category.color,
                    nameIcon =floors[fl].pois[j].label.name,
                    id= floors[fl].pois[j].id,
                    sX= floors[fl].scaleX,
                    sY= floors[fl].scaleY,
                    loc = [(floors[fl].pois[j].row)*sY+(sY),
                        floors[fl].pois[j].col*sX+(sY)],
                    category = floors[fl].pois[j].label.category.name;

                floors[fl].pois[j].marker = new L.Marker(new L.latLng(loc), {icon:blueMarker, title:nameIcon});
                //floors[fl].pois[j].marker.options.icon.options.className='awesome-marker';
                floors[fl].pois[j].marker.options.icon.options.color=colorIcon;
                floors[fl].pois[j].marker.options.icon.options.icon='star';
                floors[fl].pois[j].marker.poid=id;
                floors[fl].pois[j].marker.psX=sX;
                floors[fl].pois[j].marker.psY=sY;
                floors[fl].pois[j].marker.loc=loc;

                floors[fl].pois[j].marker.bindPopup(nameIcon)
                    .on('click', function () {
                        console.log(this.poid);
                        drawRoute(origin.point.id, this.poid, this.psX, this.psY);
                    });
                floors[fl].layer.addLayer(floors[fl].pois[j].marker);
                totalPois.addLayer(floors[fl].pois[j].marker);


        }
    }


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

    for(var i in totalPois._layers) {
//        console.log(i);
        totalPois._layers[i].title = totalPois._layers[i].options.title;
        	//value searched
        //    loc = data[i].loc,		//position found
        //    marker = new L.Marker(new L.latLng(loc), {title: title} );//se property searched
        //marker.bindPopup('title: '+ title );
        //markersLayer.addLayer(marker);
    }

    for(i in floors) {
        if (origin.floor.id == floors[i].id) {
            originFloor = floors[i];
            originPoint = [(origin.point.row) * originFloor.scaleY,
                origin.point.col * originFloor.scaleX];
            originMarker = new L.marker(originPoint, { bounceOnAdd: false,
                //bounceOnAddHeight: 20,
                icon: OriginIcon})
                .bindPopup(origin.point.description + "-" + originFloor.name + "-" + origin.enclosure.name);
            originMarker.addTo(floors[i].layer).openPopup();
            break;
        }
    }

  layersControl= new L.control.layers(null, null, {collapsed:false});

}

var map = L.map('map', {
    crs: L.CRS.Simple,
    zoom: 0,
    zoomControl:false
    //layer: originFloor.layer
});


function drawOrigin(origin) {


    for(i in floors)
    {
        layersControl.addBaseLayer(floors[i].photo,floors[i].name);

    if(origin.floor.id == floors[i].id)
        {
            map.addLayer(floors[i].photo);
            map.addLayer(floors[i].layer);
            originFloor = floors[i];
            //break;
         }
    }

    map.setMaxBounds(originFloor.bounds);
    map.setView(originFloor.bounds.getCenter(),0);


    map.addControl( new L.Control.Search(mobileOpts) );
    map.addControl(new L.Control.Zoom());

    layersControl.addTo(map);

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

        } else {
            map.removeLayer(floors[i].layer);
        }

    }
    map.setView(originPoint, 0);
    map.addLayer(floor_x.layer);
    map.setMaxBounds(floor_x.bounds);
});



//Creamos la ruta uniendo los puntos del array "path"
function drawRoute(org, dst, sX, sY) {

    path=[];

    route = new RouteResource().getRoute(org, dst);
    if(route){

           path.push([(route.origin.row)*sY+sY, route.origin.col*sX+sX]);

            if (route.origin.floor===route.destiny.floor){
                for (var i in route.steps ) {
                    path.push([(route.steps[i].row)*sY+sY, (route.steps[i].column)*sX+sX]);
                }
            path.push([(route.destiny.row)*sY+sY, route.destiny.col*sX+sX]);
            }else{

            }
    console.log(path);
    map.removeLayer(arrow);
    map.removeLayer(arrowHead);
    arrow = L.polyline(path,{color: 'orange'}).redraw();
    arrowHead = L.polylineDecorator(arrow);

    var arrowOffset = 0;
    anim = window.setInterval(function() {
        arrowHead.setPatterns([
            {offset: arrowOffset+'%', repeat: 0, symbol: new L.Symbol.ArrowHead({pixelSize: 15, polygon: false, pathOptions: {/*color:"orange",*/ stroke: true}})}
        ])
        if(++arrowOffset > 100)
            arrowOffset = 0;
    }, 100);

   arrow.addTo(map);
   arrowHead.addTo(map);

    }else{
        alert('No existe esa ruta');
    }

}

