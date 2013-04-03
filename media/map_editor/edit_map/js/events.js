//
//
// DEFINIR EVENTOS


//
// keyCodes (códigos de teclas pulsadas)
//
var keyCodes = {
	// para al tenerla pulsada se dibuje con el ratón pasándolo sobre el mapa
	pressed_to_draw: 18,	// alt
	select_qr: 88,			// x
	select_passable: 48,	// 0
	select_not_passable: 49	// 1
};


// shortcut.add("Ctrl+B",function() {
// 	alert("The bookmarks of your browser will show up after this alert...");
// },{
// 	'type':'keydown',
// 	'propagate':true,
// 	'target':document
// });

function addButtonsEvents()
{
	$('#buttons select[name=grid_selector]').on('change', function(){
		loadGrid($(this).val());
	});
	$('#buttons button[name=save]').on('click', saveGrid);
	$('#buttons button[name=clear]').on('click', clearGrid);
	$('#buttons button[name=delete]').on('click', deleteSavedGrids);
}


function addEvents()
{
	addButtonsEvents();
}


function addDocumentEvents()
{
	//
	// Eventos sobre todo el documento
	//
	$(document).on('keydown', function(e){
		var keyCode = e.keyCode || e.which;

		// comprobamos si la tecla pulsada es alguna dentro de keyCodes
		var exists = false;

		// http://stackoverflow.com/a/1078132
		$.each(keyCodes, function(key, val) {
			if(val === keyCode)
			{
				exists = true;
				return;  // se sale del loop
			}
		});
		if(!exists)
			return;

		e.preventDefault();
		switch(keyCode)
		{
			case keyCodes['pressed_to_draw']:
			$('.block').on('mouseover', function(){
				paintBlock($(this));
			});
			break;

			case keyCodes['select_qr']:
			$('select[name=obj]').val(block_types['qr']);
			break;

			case keyCodes['select_passable']:
			$('select[name=obj]').val(block_types['passable']);
			break;

			case keyCodes['select_not_passable']:
			$('select[name=obj]').val(block_types['not_passable']);
			break;
		}
	});

	$(document).on('keyup', function(e){
		var keyCode = e.keyCode || e.which;
		if(keyCode === keyCodes['pressed_to_draw'])
		{
			e.preventDefault();
			$('.block').off('mouseover');
		}
	});
}


function addMapEvents()
{
	//
	// Eventos sobre el mapa
	//

	// Al hacer click sobre un bloque en el mapa éste se pintará
	$('.block').on('click', function(){
		paintBlock($(this));
	});

	// Podemos pintar trazas sobre el mapa dejando pulsado el ratón y moviéndolo sobre él
	$('#grid').on('mousedown', function(e){
		e.preventDefault();
		paintTrace();
	});
	$('#grid').on('mouseup', function(){
		$('.block').off('mouseover');
	});
}