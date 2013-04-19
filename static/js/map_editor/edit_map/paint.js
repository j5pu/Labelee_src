//
//
// PINTAR BLOQUES O TRAZOS DE BLOQUES
//


var painting_trace = false;


function paintTrace()
{
	painting_trace = true;  // indicamos que se está pintando una traza
	stroke = [];  // traza de momento vacía

	// cada vez que se pase el ratón sobre un bloque se dibujará este y se guarda
	// en el array 'stroke' junto con los demás que forman la traza
	$('.block').on('mouseover', function(){
		// if(painting_trace)
		paintBlock($(this));
	});

	paint_actions.push(stroke);
}


function paintBlock(block)
{
	// Pinta objeto en un bloque del grid

	// var object_types = {
	//		"label": '',
	//		"wall": '',
	//		"erase": '',
	//		'bar': icons_path + 'bar.png',
	//		...


	var obj = elements.object_selector.val();
	block.attr('data-obj', obj);


	// Damos color de fondo o le adjuntamos una imágen según sea el caso..
	switch(obj)
	{
		case 'label':
			block.empty();
			block.css({'background': 'blue'});
			block.data('obj', 'label');
			break;
		case 'wall':
			block.empty();
			block.css({'background': 'red'});
			block.data('obj', 'wall');
			break;
		case 'erase':
			block.empty();
			block.css({'background': ''});
			break;

		// Si es algún icono..
		default:
			var icon_src = object_types[elements.object_selector.val()];

			displayIcon(block, icon_src);
	}

	block.css({
		'opacity': 0.5
	});

	// Guardamos el bloque pintado. Si se está pintando un trazo
	// var block_data = [
	// block.parent().attr('data-row'),
	// block.attr('data-col'),
	// block.attr('data-obj')
	// ];

	// if(painting_trace)
	// 	stroke.push(block_coords);
	// else
	// 	paint_actions.push(block_coords);
}


function displayIcon(block, icon_src)
{
	// Muestra una imágen sobre un bloque

	// Tomamos la medida del icono
	var icon = new Image();
	icon.src = icon_src;
	// No hacemos nada mientras no esté la imágen del mapa cargada en el navegador
	icon.onload = function(){

		// Si el icono es más pequeño que el bloque lo ponemos de fondo
		if(icon.width <= block_size)
		{
			block.css({
				'background': 'url(' + icon_src + ') no-repeat center'
				// 'background-size': icon_width + 'px auto'
			});
		}
		// Si el icono es más grande entonces lo añadimos en un <img>
		// y lo redimensionamos para que conserve su tamaño original
		else
		{
			block.append('<img src="' + icon_src + '"/>');

			var img = block.find('img');
			var transform_factor = icon.width / block_size;

			img.css({
				'transform': 'scale(' + transform_factor + ')'
			});
		}
	};
}
