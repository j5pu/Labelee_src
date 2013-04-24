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


function paintBlock(block)
{
	// Pinta objeto en un bloque del grid
	
	block.attr('data-object', object.id);
	
	
	// Tomamos la imágen del icono
	var icon = new Image();
	icon.src = object.img;
	// No hacemos nada mientras no esté la imágen del mapa cargada en el navegador
	icon.onload = function(){
		
		if(isBuilder())
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
			if(icon.width <= block_size)
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
				var transform_factor = icon.width / block_size;
	
				img.css({
					'transform': 'scale(' + transform_factor + ')'
				});
			}
		}
		
		icon = null;
	};
}


function isBuilder()
{
	// Nos indica si el objeto pertenece a la categoría 'builders'
	
	var category = elements.category_selector.find(':selected').text();
	return category === 'builders';
	
	
	// var is_builder = false;
// 	
	// $.ajax({
        // url: '/api/v1/object/?id=' + object.id + '&category__name=builders',
        // type: 'get',
        // headers: {'Content-Type': 'application/json'},
        // dataType: 'json',  // esto indica que la respuesta vendrá en formato json
        // async: false,
        // success: function(response){
        	// is_builder = response.objects.length > 0 ? true : false;
        // },
        // error: function(response){
			// var j = response;
        // }
    // });
//     
    // return is_builder;
	
}

