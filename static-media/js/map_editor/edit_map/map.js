
//
// MAPA
//

var grid;
var grid_loaded = true;

var num_rows, num_cols;
var grid_height, grid_width;
var block_height, block_width;
var block_height_initial, block_width_initial;

var point_id;
var points_to_delete = [];


function loadEmptyGrid()
{
	// El número de columnas será el proporcional a las filas de manera que
	// salgan bloques cuadrados
	num_rows = parseInt(elements.num_rows.val(), 10);

	grid_height = resize(map_img.height, num_rows);
	block_height = grid_height / num_rows;

	// Crearemos tantas columnas como sean necesarias para que el bloque salga
	// lo más cuadrado posible
	grid_width = resize(map_img.width, block_height);
	num_cols = grid_width / block_height;
	block_width = grid_width / num_cols;

	drawGrid();
}


function drawGrid()
{
	block_height_initial = block_height;
	block_width_initial = block_width;

	// Damos propiedades css al grid, de manera que su imagen de fondo sea la del mapa
	elements.grid.css({
		'height': grid_height,
		'width': grid_width,
		'background-image': 'url("' + map.img + '")',
		'background-size': grid_width + 'px' + ' ' + grid_height + 'px'
	});

	elements.num_blocks.html((num_rows * num_cols) + ' bloques');

	// Crea todo el tablero #grid, donde el mapa es su imagen de fondo (background)
	var grid = elements.grid;

	// Limpiamos el grid si estaba creado
	if(grid)
		grid.empty();

	for(var row = 0; row < num_rows; row++)
	{
		// Crea fila
		grid.append('<div class="row"></div>');
		var current_row = grid.find('.row:last');

		current_row.attr('data-row', row);
		current_row.css({'height': block_height});

		for(var col = 0; col < num_cols; col++)
		{
			// Crea bloque
			current_row.append('<div class="block"></div>');
			current_block = current_row.find('.block:last');
			current_block.attr('data-col', col);
			current_block.css({
				'height': block_height,
				'width': block_width
			});
		}
	}

	// Cargamos los bloques creados en elements
	elements.block = $('.block');

	//
	// Procuramos que los bloques no se desencajen del grid creado
	//
	var first_block_vertical_position = grid.find('.row:first .block:first').position().top;
	var diff = first_block_vertical_position - 0;
	// Si hay diferencia entre la posición del primer bloque y el marco superior del grid,
	// entonces ajustamos esa diferencia:
	if(diff !== 0)
	{
		grid.find('.block').css({'bottom': diff + 'px'});
	}

    //
    // Vemos si el checkbox para ver la rejilla está activado
    toggleBlockBorders();

	//
	// Añadimos los eventos
	addGridEvents();

    //
    // Vaciamos la lista de puntos a eliminar
    points_to_delete = [];
}



function createGrid()
{
	//
	// 1. Creamos el grid
	var grid_data = {
		name: elements.grid_name.val(),
		num_rows: num_rows,
		num_cols: num_cols,
		map: map.resource_uri
	};

	var grid_obj = new Resource('grid').create(grid_data);

	//
	// 2. Creamos cada punto pintado para el grid
	var points_data = [];

	var point_resource = new PointResource();

	$('#grid .row').each(function(){
		var row = $(this).data('row');
		//Recorremos cada bloque de la fila
		$(this).find('.block').each(function(){
			var col = $(this).data('col');

			// Sólo guardaremos los bloques que aparecen pintados
			var block_obj = $(this).data('object');
			if (block_obj)
			{
				var point_data = {
					row: row,
					col: col,
					grid: grid_obj.resource_uri,
					object: block_obj
				};

				// point_resource.create(point_data);
				points_data.push(point_data);
			}
		});
	});

	//
	// 3. Enviamos los puntos al servidor
	point_resource.createPoints(points_data);

	//
	// 4. Seteamos el grid_selector y limpiamos el formulario
	setGridSelector();
	elements.grid_name.val('');
}



function updateGrid()
{
    //
    // 1. Creamos cada punto que no tenga la propiedad 'data-from-db'='y'
    var new_points = [];

    $('#grid .row').each(function(){
        var row = $(this).data('row');
        //Recorremos cada bloque de la fila
        $(this).find('.block').each(function(){

            var from_db = $(this).data('from-db');
            var block_obj = $(this).data('object');

            // Si no aparece pintado ni cargado desde BD saltamos a la siguiente iteración
            if(!from_db && !block_obj)
                return;

            var col = $(this).data('col');

            var point_data = {
                row: row,
                col: col,
                grid: grid.resource_uri,
                object: block_obj
            };

            // Guardaremos los bloques que aparecen pintados y no han sido cargados
            // desde la BD
            if(block_obj && !from_db)
            {
                new_points.push(point_data);

                // Ponemos el punto como traído desde la BD para no tener que volver
                // a leer todo el grid en caso de querer editar de nuevo
                $(this).attr('data-from-db', 'y');
            }
        });
    });

    //
    // 3. Enviamos al servidor primero los puntos a eliminar y luego los nuevos
    var pr = new PointResource();
    pr.deletePoints(points_to_delete);
    pr.createPoints(new_points);

    //
    // 4. Volvemos a cargar el grid editado
    loadSavedGrid();
}



function deleteGrid()
{
	var grid_id = elements.grid_selector.val();
	var confirm_msg = '¿Desea eliminar el grid? (se perderán todos sus points)';
	new Resource('grid').del(grid_id, confirm_msg);
	setGridSelector();
    loadEmptyGrid();
}


function loadSavedGrid()
{
    grid_loaded = false;

	var grid_id = elements.grid_selector.val();

    // Si no hemos elegido ningún grid entonces se creará uno vacío
	if(!grid_id)
	{
		loadEmptyGrid();
		return;
	}

	grid = new Resource('grid').read(grid_id);

	//
	// 1. Dibujamos el grid vacío y seteamos el campo de 'nro. de filas'
	num_rows = grid.num_rows;
	num_cols = grid.num_cols;
	grid_height = resize(map_img.height, num_rows);
	block_height = grid_height / num_rows;
	grid_width = resize(map_img.width, num_cols);
	block_width = grid_height / num_rows;

	drawGrid();

    elements.num_rows.val(num_rows);

	//
	// 2. Pintamos cada punto almacenado para ese grid (muros, POIs, etc)
	var points = new Resource('point').readAllFiltered('?grid__id=' + grid.id);

    // Estos son todos los posibles objetos que contiene el grid, para así evitar
    // llamar a BD cada vez que queramos pedir el objeto de un punto
	var objects = new ObjectResource().readFromGrid(grid.id)


	for(var i in points)
	{
		var point = points[i];
		var block = elements.grid.find('.row[data-row="' + point.row + '"]')
			.find('.block[data-col="' + point.col + '"]');

		object_loaded = objects[point.object];
        point_id = point.id;

		paintBlock(block, object_loaded);
	}

    // Como se terminaron de pintar todos los objetos traidos desde la BD..
    object_loaded = null;
    grid_loaded = true;

    // Quitamos el foco del selector de grids
    elements.grid_selector.blur();
}


function clearGrid()
{
	$('#grid').empty();
	drawGrid();
}


function resize(size, n)
{
	// Decrementamos 'size' hasta que sea múltiplo de n
	for(; size > 0; size--)
	{
		if(size % n === 0)
			return size;
	}
}


function getNumBlocks(size)
{
	// Obtenemos el número de bloques que caben en 'size', el cual puede
	// referirse al alto (height) o al ancho (width) del grid que los contiene.
	return (size / block_size) - 1;
}

