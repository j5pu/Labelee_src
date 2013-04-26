
//
// MAPA
//

var num_rows, num_cols;
var grid_height, grid_width;
var block_height, block_width;

var block_height_initial, block_width_initial; 


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
		var current_row = grid.find('.row').last();

		current_row.attr('data-row', row);
		current_row.css({'height': block_height});

		for(var col = 0; col < num_cols; col++)
		{
			// Crea bloque
			current_row.append('<div class="block"></div>');
			current_block = current_row.find('.block').last();
			current_block.attr('data-col', col);
			// current_block.attr('data-obj', 0);
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
	// Añadimos los eventos
	//
	addGridEvents();
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
	
	var point_resource = new Resource('point');

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

				point_resource.create(point_data);
			}
		});
	});

	//
	// 3. Seteamos el grid_selector y limpiamos el formulario
	setGridSelector();
	elements.grid_name.val('');
}


function deleteGrid()
{
	var grid_id = elements.grid_selector.val();
	var confirm_msg = '¿Desea eliminar el grid? (se perderán todos sus points)';
	new Resource('grid').del(grid_id, confirm_msg);
	setGridSelector();
}


function loadSavedGrid()
{

	var grid_id = elements.grid_selector.val();
	
	if(!grid_id)
	{
		loadEmptyGrid();
		return;		
	}
	
	
	var grid = new Resource('grid').read(grid_id);

	//
	// 1. Dibujamos el grid vacío
	num_rows = grid.num_rows;
	num_cols = grid.num_cols;
	grid_height = resize(map_img.height, num_rows);
	block_height = grid_height / num_rows;
	grid_width = resize(map_img.width, num_cols);
	block_width = grid_height / num_rows;

	drawGrid();

	//
	// 2. Pintamos cada punto almacenado para ese grid (muros, POIs, etc)
	var points = new Resource('point').readAllFiltered('?grid__id=' + grid.id);


	// Recogemos todos los objetos que hay en el grid
	// objects = {
	// 		'api/v1/object/1': {
	//			resource_uri: api/v1/object/1
	// 			category_id: 1
	//			category_name: builders
	// 			id: 1
	// 			img: "/media/img/objects/builders/wall.png"
	// 			name: "wall"
	// 			total: 6
	// 		}
	// }
	var objects = new ObjectResource().readFromGrid(grid.id)


	for(var i in points)
	{
		var point = points[i];
		var block = elements.grid.find('.row[data-row="' + point.row + '"]')
			.find('.block[data-col="' + point.col + '"]');

		object = objects[point.object];
		
		paintBlock(block, object);
	}
	
	
	// var point = points[0];
	// var block = elements.grid.find('.row[data-row="' + point.row + '"]')
		// .find('.block[data-col="' + point.col + '"]');
// 
	// object = objects[point.object];
// 	
	// paintBlock(block);
}


function setMapSelector()
{
	// Añade en el selector de grids todos los que tenemos guardados para ese mapa

	var select = $('#buttons select[name="grid_selector"]');

	if (!localStorage.grids)
	{
		select.hide();
		return;
	}

	select.empty();
	saved_grids = JSON.parse(localStorage.grids);

	for (var i in saved_grids)
	{
		var grid_name = saved_grids[i]['grid_name'];
		select.append('<option value="' + grid_name + '">' + grid_name + '</option>');
	}

	select.show();
// grids = [grid_data];
}


function clearGrid()
{
	$('#grid').empty();
	drawGrid();
}


function deleteSavedGrids()
{
	localStorage.clear();
	setGridSelector();
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

