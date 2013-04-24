//
//
// DEFINIR EVENTOS


//
// keyCodes (códigos de teclas pulsadas)
//
// var keyCodes = {
// 	// para al tenerla pulsada se dibuje con el ratón pasándolo sobre el mapa
// 	pressed_to_draw: 18,	// alt
// 	select_qr: 88,			// x
// 	select_passable: 48,	// 0
// 	select_not_passable: 49	// 1
// };


// shortcut.add("Ctrl+B",function() {
// 	alert("The bookmarks of your browser will show up after this alert...");
// },{
// 	'type':'keydown',
// 	'propagate':true,
// 	'target':document
// });


function addEvents(){

	//
	// GRID_SELECTOR
	elements.grid_selector.on('change', function(){
		loadGrid($(this).val());
	});
	//
	// CREATE / DELETE GRID
	elements.create_grid.on('click', createGrid);
	elements.delete_grid.on('click', deleteGrid);
	//
	// NUM_ROWS para GRID
	elements.num_rows.on('change', loadMap);

	//
	// SELECT CATEGORY
	elements.category_selector.on('change', setObjectSelector)
	//
	// SELECT OBJECT
	elements.object_selector.on('change', setObject)
	//
	// SHOW NEW OBJECT / OBJECT_CATEGORY FORM
	elements.new_object.on('click', function(){
		elements.form_object.root_node.show(400);
		elements.form_category.root_node.hide(400);
		var category = elements.category_selector.val();
		if(category)
			elements.form_object.category.val(category)
	});
	elements.new_category.on('click', function(){
		elements.form_object.root_node.hide(400);
		elements.form_category.root_node.show(400);
	});
	// CREATE OBJECT / OBJECT_TYPE
	elements.form_category.create.on('click', createObjectCategory);
	elements.form_object.create.on('click', createObject);


	//
	// IFRAME
	//
	// Se escucha el iframe 'upload_target'. Cada vez que se cambie su contenido
	// significa que se acaba de subir una imágen al servidor.
	//
	listenIframe(function(form_name){
		clearForm(form_name);
	});


	//
	// EVENTOS PARA PINTAR EN EL GRID
	//
	// Al hacer click sobre un bloque en el mapa éste se pintará
	//
	// elements.block.on('click', function(e){
		// if(painting_trace)
			// return;
// 		
		// e.preventDefault();
		// paintBlock($(this));
	// });

	// Pintar dejando pulsada alt y pasando el ratón por el mapa
	shortcut.add("alt+shift", function(){
		elements.block.on('mouseover', function(e){
			e.preventDefault();
			paintBlock($(this));
		});
	});

	shortcut.add("alt+shift", function(){
		elements.block.off('mouseover');
	},{'type':'keyup'});


	// Podemos pintar trazas sobre el mapa dejando pulsado el ratón y moviéndolo sobre él
	elements.block.on('mousedown', function(e){
		e.preventDefault();
		paintBlock($(this));
		elements.block.on('mouseover', function(){
			paintBlock($(this));
		});
	});
	elements.block.on('mouseup', function(){
		$('.block').off('mouseover');
	});


	//
	// Para elegir cosas a pintar
	//
	shortcut.add("Ctrl+x", function(){
		elements.obj_selector.val('label');
	});

	shortcut.add("Ctrl+0", function(){
		elements.obj_selector.val('erase');
	});

	shortcut.add("Ctrl+1", function(){
		elements.obj_selector.val('wall');
	});
}


function setBlockShadow()
{
	// Cambiamos el evento 'mouseover' del elemento para que haga esto:

	elements.block.on('mouseover', function(){
		$(this).css({'box-shadow': '1px 1px 7px'});
	});

}

