;


//Obtener variables de la URL
var variableArray = window.location.search.substring(1).split('-'), //quita el '&' y divide params separados por '-'
    building=variableArray[0],
    floor=variableArray[1],
    point=parseInt(variableArray[2]);


var STATIC_URL = "{{ STATIC_URL }}/labelee/";

var map_img = new Image(),
//mapJson = "parquing_grid.json",
//rutaJson= "parquing_route.json";


    mapJson = STATIC_URL + "plantaB_grid.json",
    rutaJson= STATIC_URL + "plantaB_route.json";

/*
 // Crear mapas base
 var base = {
 "Planta2": L.imageOverlay('{{ STATIC_URL }}labelee/34.jpg', bounds),
 "Planta1": L.imageOverlay('{{ STATIC_URL }}labelee/28.jpg', bounds),
 "Planta0": L.imageOverlay('{{ STATIC_URL }}labelee/29.jpg', bounds),
 "Parquing":L.imageOverlay('{{ STATIC_URL }}labelee/27.jpg', bounds),
 };


 // Crear map overlays
 var overlays = {

 'POIs_1': L.layerGroup([
 L.cartoDB('http://thematicmapping.cartodb.com/api/v2/sql?q=SELECT * FROM nz_tour', {
 pointToLayer: function(feature, latlng) {
 return L.marker(latlng, {
 icon: L.icon({
 iconSize: [27, 27],
 iconAnchor: [13, 27],
 popupAnchor:  [1, -24],
 iconUrl: 'icons/' + feature.properties.icon + '.png'
 })
 })
 },
 onEachFeature: function(feature, layer) {
 layer.bindPopup('<strong>' + feature.properties.name + '</strong><br>' + (feature.properties.description ? feature.properties.description : ''));
 }
 }),
 L.geoJson(roads, {
 style: {
 color: '#333',
 weight: 1.5,
 opacity: 1
 }
 })
 ])

 };

 */


drawMap(mapJson,rutaJson);

function drawMap (mapJson, rutaJson)  {

    $.getJSON(mapJson,function(data){
        map_img.src = STATIC_URL + data.map;

        map_img.onload = function(){

            var	mapH = $(document).height(),
                mapW = (map_img.width/map_img.height)*mapH,


                rows= data.num_rows,
                scaleX = mapW/data.num_cols,
                scaleY = mapH/rows,
                offsetX = scaleX/2,
                offsetY = scaleY/2,


                bounds = new L.LatLngBounds(new L.LatLng(0, 0), new L.LatLng(mapH, mapW));

            var pois_1 = new L.LayerGroup();

            var	greenMarker = L.AwesomeMarkers.icon({
                    icon: 'home',
                    color: 'green'
                }),
                blueMarker = L.AwesomeMarkers.icon({
                    icon: 'star',
                    color: 'blue'
                }),
                redMarker = L.AwesomeMarkers.icon({
                    icon: 'coffee',
                    color: 'red'
                });

            /*				originMarker = L.marker(originPoint, { bounceOnAdd: true,
             //bounceOnAddHeight: 20,
             icon: greenMarker})
             .addTo(map)
             .bindPopup("¡Estás justo aquí!");
             //.openPopup();


             //map.setView(originPoint, 1);

             var destinyPoint = [(rs-data.destiny.row)*sY-sY, data.destiny.col*sX+sX],

             redMarker = L.AwesomeMarkers.icon({
             icon: 'coffee',
             color: 'red'
             }),

             destinyMarker= L.marker(destinyPoint, { bounceOnAdd: false,bounceOnAddHeight: 4,  icon: redMarker})
             .addTo(map)
             //.bindPopup("Cineteca")
             .on('click', function () {
             drawRoute(originPoint, destinyPoint, data);
             //this.openPopup();
             this.bounce(1000, -10);
             });
             */



            L.marker([75, 100], {icon:redMarker}).bindPopup('POI_1.2').addTo(pois_1);
            L.marker([150, 300],{icon:redMarker}).bindPopup('Hola').openPopup().addTo(pois_1);
            L.marker([50, 150],{icon:redMarker}).bindPopup('POI_1.4').addTo(pois_1);


            var planta0 = new L.imageOverlay('{{ STATIC_URL }}labelee/34.jpg', bounds),
                parquing = new L.imageOverlay('{{ STATIC_URL }}labelee/28.jpg',bounds),
                planta1 = new L.imageOverlay('{{ STATIC_URL }}labelee/29.jpg',bounds),
                planta2 = new L.imageOverlay('{{ STATIC_URL }}labelee/27.jpg',bounds);


            var map = L.map('map', {
                center: bounds.getCenter(),
                crs: L.CRS.Simple,
                zoom: 0,
                zoomControl:false,
                maxBounds: bounds,
                layers: [planta2, planta1,planta0,pois_1]
            });

            var baseLayers = {
                "Planta2": planta2,
                "Planta1": planta1,
                "Planta0": planta0,
                "Parquing":parquing
            };

            var overlays = {
                "POIs1": pois_1
            };


            var originMarker = L.marker([200, 400], { bounceOnAdd:false, icon: greenMarker})
                .addTo(map);
            //.bindPopup('¡Hola!')
            //.openPopup()
            //.addTo(pois_1)
            //    .on('click', function () {
            //this.openPopup();
            //this.bounce(1000, -10);
            //    });
            var hover_bubble = new L.Rrose({ offset: new L.Point(0,-25), closeButton: false, autoPan: false })
                .setContent('Estás justo aquí')
                .setLatLng(originMarker.getLatLng())
                .openOn(map);

            L.control.layers(baseLayers, overlays).addTo(map);

            parquing.addTo(map);



//pois de muestra para rellenar el mapa
            var pois = [
                {"col":600, "row": 50, "description":"ocio1"},
                {"col":500, "row": 100, "description":"acceso1"},
                {"col":500, "row": 150, "description":"ocio2"},
                {"col":400, "row": 150, "description":"comida"},
                {"col":600, "row": 50, "description":"aseos"},
                {"col":500, "row": 100, "description":"ocio3"},
                {"col":400, "row": 150, "description":"acceso2"},
                {"col":300, "row": 200, "description":"tienda1"},
                {"col":200, "row": 150, "description":"tienda2"},
                {"col":100, "row": 200, "description":"aseos"},
            ];


            var markersLayer = new L.LayerGroup();	//esta capa contiene los pois buscados
            map.addLayer(markersLayer);

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



            var mobileOpts = {
                //url: jsonpurl,
                //jsonpParam: jsonpName,
                //filterJSON: filterJSONCall,
                text: 'Destino...',
                autoType: false,
                tipAutoSubmit: true,
                autoCollapse: true,
                autoCollapseTime: 6000,
                animateLocation: true,
                markerLocation: true,
                textErr: 'No hay ningún sitio',
                layer: markersLayer,
                callTip: customTip,
                delayType: 800	//with mobile device typing is more slow
            };

            //map.addControl( new L.Control.Search({layer: markersLayer}) );  //inizializa el control 'search' lupa

            ////////////rellena el mapa con marcadores de los pois de muestra
            for(i in pois) {
                var description = pois[i].description,	//valor buscado
                    loc = [pois[i].col,	pois[i].row],	//posición encontrada
                    marker = new L.Marker(new L.latLng(loc), {title: description, icon: blueMarker} );//propiedad buscada
                marker.bindPopup('descripción: '+ description );
                markersLayer.addLayer(marker);
            }



            map.addControl( new L.Control.Search(mobileOpts) );
            map.addControl(new L.Control.Zoom());
        }//image.onload

    }); //getJSon
} //drawMap

