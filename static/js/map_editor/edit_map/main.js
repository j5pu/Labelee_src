//
//
// MAIN

var map_img = new Image();
var map_src;

//
// Elementos del DOM
//
var elements;


$(document).on('ready', function(){

	elements = {
		num_rows: $('input[name="num_rows"]'),
		grid_selector: $('#menu select[name=grid_selector]'),
		obj_selector: $('#menu select[name=obj]'),
		save: $('#menu button[name=save]'),
		clear: $('#menu button[name=clear]'),
		delete: $('#menu button[name=delete]'),
		block: $('.block'),
		grid: $('#grid'),
		num_blocks: $('#num_blocks'),
		grid_name: $('#menu input[name=grid_name]')
	};


	map_src = $('#map_src').text();
	map_img.src = map_src;
	// No hacemos nada mientras no esté la imágen del mapa cargada en el navegador
	map_img.onload = function(){
		main();
	};
});


function main()
{

	loadMap();

	showMenu();
}








