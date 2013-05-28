//Configuración de iconos
var	greenMarker = L.AwesomeMarkers.icon({
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

//Configuración de la lupa
var mobileOpts = {
    //url: jsonpurl,
    //jsonpParam: jsonpName,
    //filterJSON: filterJSONCall,
    text: 'Destino...',
    autoType: true,
    autoCollapse: true,
    autoCollapseTime: 6000,
    animateLocation: true,
    tipAutoSubmit: true,  		//auto map panTo when click on tooltip
    autoResize: true,			//autoresize on input change

    markerLocation: false,
    minLength: 1,				//minimal text length for autocomplete

    textErr: 'No hay ningún sitio',
    //layer: markersLayer,
    callTip: customTip,
    tooltipLimit: -1,			//limit max results to show in tooltip. -1 for no limit.
    delayType: 800	//with mobile device typing is more slow
};


var originFloor;
//Configuración del mapa
var map = L.map('map', {
    crs: L.CRS.Simple,
    zoom: 0,
    zoomControl:false
});


//Carga de datos globales
var origin = {
    point:new QRCodeResource().read(qr_code_id).point,
    floor:new FloorResource().read(floor_id),
    enclosure:new EnclosureResource().read(enclosure_id)
}


var    mapH = $(document).height();

///////////////////////////////////////////////
//pinta en el mapa la posición inicial Origin

//Cálculos restantes
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

/*
//POIs de todas las floors, para la búsqueda de la LUPA
var poisTot = [];
for (p=0; p<poisFloors.length; p++){
    for (j=0; j<poisFloors[p].length; j++){
    poisTot.push(poisFloors[p][j].fields);
    }
}
*/




var baseLayers={};
var overlays = {};
var floor_index = 0;


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
                var loc = [(floors[fl].pois[j].row)*floors[fl].scaleY+(floors[fl].scaleY/2),
                            floors[fl].pois[j].col*floors[fl].scaleX+(floors[fl].scaleY/2)],	//posición de los marcadores
                    colorIcon = floors[fl].pois[j].label.category.color,
                    catIcon = floors[fl].pois[j].label.category.name;
                floors[fl].pois[j].marker = new L.Marker(new L.latLng(loc), {icon:blueMarker});
                //floors[fl].pois[j].marker.options.icon.options.className='awesome-marker';
                floors[fl].pois[j].marker.options.icon.options.color=colorIcon;

                floors[fl].pois[j].marker.options.icon.options.icon='star';
                //
                        //cambiar {icon: por categoría, sacar Cat y Color de pois[j].label}
                floors[fl].pois[j].marker.bindPopup('descripción: ' + floors[fl].pois[j].description +" " + floors[fl].pois[j].label.category.name);
                floors[fl].layer.addLayer(floors[fl].pois[j].marker);


        }
        overlays["POIs de "+ floors[fl].name]=floors[fl].layer;
    }
    floors[1].layer.eachLayer(function (layer) {
//        layer.on({
//           click: function(e){
                layer.setIcon(redMarker);
//                alert('Lat: '+layer._latlng.lat+', Lng: '+layer._latlng.lng);
//            }
//        });
    });

        layersControl= new L.control.layers(baseLayers, overlays, {collapsed:false});

}


function drawOrigin(origin)
{
    for(i in floors){
        layersControl.removeLayer(floors[i].layer);
        layersControl.removeLayer(floors[i].photo);
    }

    for(i in floors)
        if(origin.floor.id == floors[i].id)
        {
            originFloor = floors[i];
            break;
         }

    map.setMaxBounds(originFloor.bounds);
    map.setView(originFloor.bounds.getCenter(),0);
    //map.setView(originPoint, 0);


    map.addControl( new L.Control.Search(mobileOpts) );
    map.addControl(new L.Control.Zoom());


    map.addLayer(originFloor.photo);
    map.addLayer(originFloor.layer);
    var originPoint = [(origin.point.row)*originFloor.scaleY,
            origin.point.col*originFloor.scaleX],
        originMarker = new L.marker(originPoint, { bounceOnAdd: false,
            //bounceOnAddHeight: 20,
            icon: greenMarker}).bindPopup("Estás justo aquí: "+ origin.point.description+ ","+"</br>"+"en " + originFloor.name +" de " + origin.enclosure.name);
    originMarker.addTo(map).openPopup();

   /*for (i in floors[0].layer._layers){
        floors[0].layer._layers[i].options.icon.options.color ="red";
        floors[0].layer._layers[i].options.icon.options.icon ="coffee";
    }
   */


    layersControl.addBaseLayer(originFloor.photo, "Bienvenido a "+ origin.enclosure.name+","+"</br>"+ "estás en " + originFloor.name);
    layersControl.addOverlay(originFloor.layer, "POIs de "+ originFloor.name);
    layersControl.addOverlay(originMarker,"<img src='/static/css/map/index/images/logo.png' /> <span class='my-layer-item'>Estás en </span>" + originFloor.name+","+"<br>"+"localizado vía QR en "+origin.point.description);

    layersControl.addTo(map);

}


// Para segunda parte:
//  - click sobre poi
//  - buscar destino
//    routeJson= RouteResource().read() + plantaB_route.json";



map.on('baselayerchange', function (e) {
    if(map.hasLayer(originFloor.layer)){
        map.removeLayer(originFloor.layer);
        layersControl.removeLayer(originFloor.layer, "POIs de "+ originFloor.name);
        layersControl.removeLayer(originFloor.photo, originFloor.name);
    }
    for (var i=0; i<floors.length; i++){

        if (e.layer._url === floors[i].photo._url) {
            map.addLayer(floors[i].layer);
            layersControl.addOverlay(floors[i].layer, "POIs de " + floors[i].name);
            map.setView(floors[i].bounds.getCenter(), 0);
            map.setMaxBounds(floors[i].bounds);

        } else {
            layersControl.removeLayer(floors[i].layer, "POIs de " + floors[i].name);
            if (map.hasLayer(floors[i].layer))
                map.removeLayer(floors[i].layer);
        }

    }
});

