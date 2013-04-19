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

		// Form para nuevo object_type
		form_category: {
			root_node: $('#category-form'),
			img_form: $('#category-form form'),
			img: $('#category-form input[name=img]'),
			name: $('#category-form input[name=name]'),
			create: $('#category-form button[name=create]')
		},

		// Form para nuevo object
		form_object: {
			root_node: $('#object-form'),
			img_form: $('#object-form form'),
			category: $('#object-form select[name=category]'),
			name: $('#object-form input[name=name]'),
			img: $('#object-form input[name=img]'),
			create: $('#object-form button[name=create]')
		},

		// Enlaces
		new_object: $('#new_object'),
		new_category: $('#new_category'),

		// Para elegir objeto/categoría
		object_selector: $('#choose-object select[name=object]'),
		category_selector: $('#choose-object select[name=category]'),

		// Sobre el grid
		num_rows: $('input[name="num_rows"]'),
		grid_name: $('input[name=grid_name]'),
		grid_selector: $('select[name=grid_selector]'),
		block: $('.block'),
		grid: $('#grid'),
		num_blocks: $('#num_blocks'),
		delete_grid: $('button[name=delete_grid]'),
		create_grid: $('button[name=create_grid]')
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








