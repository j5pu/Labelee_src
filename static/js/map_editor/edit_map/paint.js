//
//
// PINTAR BLOQUES O TRAZOS DE BLOQUES
//


var painting_trace = false;

//
// Objeto a pintar en el mapa
	// category: "/api/v1/object-category/1/"
	// id: 1
	// img: "/media/img/objects/builders/wall.png"
	// name: "wall"
	// points: Array[0]
	// resource_uri: "/api/v1/object/1/"
var object;


function paintTrace()
{
	painting_trace = true;  // indicamos que se está pintando una traza
	// stroke = [];  // traza de momento vacía
	// cada vez que se pase el ratón sobre un bloque se dibujará este y se guarda
	// en el array 'stroke' junto con los demás que forman la traza
	elements.block.on('mouseover', paintBlock);

	// paint_actions.push(stroke);
}


function paintBlock(block, object)
{
	// Pinta objeto en un bloque del grid
	
	// Si el objeto no es cargado desde la base de datos, sino que seleccionado
	// desde el menú..
	if(!object.from_db)
		object = window.object;
	
	block.attr('data-object', object.resource_uri);
	
	
	// Tomamos la imágen del icono
	var icon = new Image();
	icon.src = object.img;
	// No hacemos nada mientras no esté la imágen del mapa cargada en el navegador
	icon.onload = function(){
		
		if(isBuilder(object))
		{
			// Si el objeto a pintar forma parte de la categoría 'builders' entonces
			// ocupará exactamente todo el espacio del bloque
			block.css({
				'background': 'url(' + object.img + ') no-repeat center',
				'background-size': block.width() + 'px auto'
			});
		}
		else
		{
			// Si el icono es más pequeño que el bloque lo ponemos de fondo
			if(icon.height <= block_height && icon.width <= block_width)
			{	
				block.css({
					'background': 'url(' + object.img + ') no-repeat center'
					// 'background-size': icon_width + 'px auto'
				});
			}
			// Si el icono es más grande entonces lo añadimos en un <img>
			// y lo redimensionamos para que conserve su tamaño original
			else
			{
				block.append('<img src="' + object.img + '"/>');
	
				var img = block.find('img');
				var transform_factor = icon.width / block_width;
	
				img.css({
					'transform': 'scale(' + transform_factor + ')',
					'z-index': '1'
				});
			}
		}
		
		icon = null;
	};
}


function isBuilder(object)
{
	// Nos indica si el objeto pertenece a la categoría 'builders'
	var category;
	
	// Si el objeto viene de cargarlo desde la base de datos..
	if(object.from_db)
		category = object.category_name
	else
		category = elements.category_selector.find(':selected').text();
		
	return category === 'builders';
	
}

