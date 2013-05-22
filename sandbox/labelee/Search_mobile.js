<script src="../leaflet-search.js"></script>
<script>

	var map = new L.Map('map', {zoom: 9, center: new L.latLng([41.575730,13.002411]),zoomControl: false });

	map.addLayer(new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'));	//base layer

	var jsonpurl = 'http://open.mapquestapi.com/nominatim/v1/search.php?q={s}'+
				   '&format=json&osm_type=N&limit=100&addressdetails=0',
		jsonpName = 'json_callback';
	//third party jsonp service
	
	function filterJSONCall(rawjson) {	//callback that remap fields name
		var json = {},
			key, loc, disp = [];
			
		for(var i in rawjson)
		{	
			disp = rawjson[i].display_name.split(',');	

			key = disp[0] +', '+ disp[1];
			
			loc = L.latLng( rawjson[i].lat, rawjson[i].lon );
			
			json[ key ]= loc;	//key,value format
		}
		
		return json;
	}
			
	var mobileOpts = {
		url: jsonpurl,
		jsonpParam: jsonpName,
		filterJSON: filterJSONCall,		
		text: 'Color...',
		autoType: false,
		tipAutoSubmit: true,
		autoCollapse: false,
		autoCollapseTime: 6000,
		animateLocation: true,
		markerLocation: true,
		delayType: 800	//with mobile device typing is more slow		
	};
	
	map.addControl( new L.Control.Search(mobileOpts) );
	//view source of search.php for more details
	
	map.addControl(new L.Control.Zoom());
	
</script>
