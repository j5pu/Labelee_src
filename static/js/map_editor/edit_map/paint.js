//
//
// PINTAR BLOQUES O TRAZOS DE BLOQUES


// tipos de bloque a poder pintar
var block_types = {
	qr: 'x',
	passable: '0',
	not_passable: '1',
	node: 'n'
};

// fondo pintado para cada tipo de bloque
var backgrounds = {
	'0': '',
	'1': 'red',
	'x': 'blue',
	'n': 'orange'
};


function paintTrace()
{
	painting_trace = true;  // indicamos que se está pintando una traza
	stroke = [];  // traza de momento vacía

	// cada vez que se pase el ratón sobre un bloque se dibujará este y se guarda
	// en el array 'stroke' junto con los demás que forman la traza
	$('.block').on('mouseover', function(){
		paintBlock($(this));
	});

	paint_actions.push(stroke);
}


function paintBlock(block)
{
	// Pinta objeto en la celda 'cell' del grid
	// Si el objeto es 0 entonces se deja la celda vacía (zona transitable)
	var obj = $('#buttons select[name=obj]').val();
	block.attr('data-obj', obj);
	block.css({
		'background': backgrounds[obj],
		'opacity': 0.5
	});

	// Guardamos el bloque pintado. Si se está pintando un trazo
	var block_data = [
	block.parent().attr('data-row'),
	block.attr('data-col'),
	block.attr('data-obj')
	];

	if(painting_trace)
		stroke.push(block_coords);
	else
		paint_actions.push(block_coords);
}