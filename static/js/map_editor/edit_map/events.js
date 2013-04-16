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
	// Eventos sobre los botones, selectores..
	//
	elements.grid_selector.on('change', function(){
		loadGrid($(this).val());
	});

	elements.save.on('click', saveGrid);
	elements.clear.on('click', clearGrid);
	elements.delete.on('click', deleteSavedGrids);

	elements.num_rows.on('change', loadMap);


	//
	// Eventos para pintar
	//

	// Al hacer click sobre un bloque en el mapa éste se pintará
	$('.block').on('click', function(){
		paintBlock($(this));
	});

	// Pintar dejando pulsada alt y pasando el ratón por el mapa
	shortcut.add("alt", function(){
		elements.block.on('mouseover', function(){
			paintBlock($(this));
		});
	});

	shortcut.add("alt", function(){
		$('.block').off('mouseover');
	},{'type':'keyup'});


	// Podemos pintar trazas sobre el mapa dejando pulsado el ratón y moviéndolo sobre él
	$('#grid').on('mousedown', function(e){
		e.preventDefault();
		paintTrace();
	});
	$('#grid').on('mouseup', function(){
		$('.block').off('mouseover');
		painting_trace = false;
	});


	//
	// Eventos para elegir cosas a pintar
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

	$('.block').on('mouseover', function(){
		$(this).css({'box-shadow': '1px 1px 7px'});
	});
}
