//
//
// MAIN

$(document).on('ready', function(){

	// Hasta que no esté cargada la imagen del mapa no podemos determinar sus
	// dimensiones y por tanto comenzar la ejecución del script
	$('#map_img').on('load', function(){
		main();
	});
});


function main()
{
	loadMap();

	setMapSelector();

	addEvents();
}








