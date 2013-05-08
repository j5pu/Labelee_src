
//
//
// PINTAR BLOQUES O TRAZOS DE BLOQUES
//

var painting_trace = false;

//
// Objeto a pintar en el mapa
//    {
//        category: "/api/v1/object-category/1/"
//        id: 1
//        img: "/media/img/objects/builders/wall.png"
//        name: "wall"
//        points: Array[0]
//        resource_uri: "/api/v1/object/1/"
//    }
var object_loaded;

// Proviene del grid_selector
var object_to_paint;
var object_painted_prev;
var icon;
var category;


function paintTrace()
{
	painting_trace = true;  // indicamos que se está pintando una traza
	// stroke = [];  // traza de momento vacía
	// cada vez que se pase el ratón sobre un bloque se dibujará este y se guarda
	// en el array 'stroke' junto con los demás que forman la traza
	elements.block.on('mouseover', paintBlock);

	// paint_actions.push(stroke);
}


function clearBlock(block)
{
    // Si:
    //      - no se está cargando el grid desde la BD..
    //      - el bloque aparece como cargado desde la BD (data-from-db)
    // Entonces:
    //      Insertamos el punto en la lista de puntos a eliminar en la BD para el grid

    if(block.data('from-db'))
    {
        var point_data = {
            id: block.data('point-id')
//            row: block.parent().data('row'),
//            col: block.data('col'),
//            grid: grid.resource_uri,
//            object: block.data('object')
//            resource_uri: '/api/v1/point/' + block.data('point-id') + '/'
        };

        points_to_delete.push(point_data);
    }

    // Si estamos pintando y no cargando entonces limpiamos el bloque..
    block.empty();
    block.removeAttr('data-object');
    block.removeAttr('data-from-db');
    block.removeAttr('data-point-id');
    block.css({'background': ''});
}


function paintBlock(block, object)
{
	// Pinta objeto en un bloque del grid
    //

    // Si no hay objeto definido no hacemos nada
    if(!object_to_paint && !object_loaded)
        return;

    if(grid_loaded)
    {
        // Si ya se cargó el grid desde la B.D. entonces vaciamos el bloque
        clearBlock(block);

        // Dejamos el bloque como pintado
        block.attr('data-object', object_to_paint.resource_uri);
    }
    else
    {
        // Si se está trayendo de BD sólo lo indicamos así, sin limpiar nada
        block.attr('data-from-db', 'y');
        block.attr('data-point-id', point_id);

        // Dejamos el bloque como pintado
        block.attr('data-object', object_loaded.resource_uri);
    }


    // Si es el primer objeto en pintarse o no es el mismo que el que se pintó antes,
    // entonces cargamos la imágen ..
    if( !object_painted_prev
        ||
        object_loaded && (object_loaded.id !== object_painted_prev.id)
        ||
        !object_loaded && (object_to_paint.id !== object_painted_prev.id)
    )
    {
        // Tomamos la imágen del icono
        icon = new Image();
        icon.src = object.img;
        // No hacemos nada mientras no esté la imágen del mapa cargada en el navegador
        icon.onload = function(){
            drawIcon(block);
        };
    }
    else
        drawIcon(block);

    // Según estemos cargando o pintando bloque el previo tendrá uno u otro
    object_painted_prev = object_loaded ? object_loaded : object_to_paint;
}


function drawIcon(block)
{
    var object = object_loaded ? object_loaded : object_to_paint;

    // Evitamos que se dibuje un objeto vacío en el bloque
    if(!object)
        return;

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
                'margin-top': (block_height - img.height()) / 2 + 'px',
                'transform': 'scale(' + transform_factor + ')',
                'z-index': '1'
            });
        }
    }

}


function isBuilder(object)
{
	// Nos indica si el objeto pertenece a la categoría 'builders'

	// Si el objeto viene de cargarlo desde la base de datos..
	if(object_loaded)
		category = object.category_name
	else
		category = elements.category_selector.find(':selected').text();
		
	return category === 'builders';
	
}

