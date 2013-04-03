
//
// MAPA
//


// var james = {
//     job: "programmer",
//     married: false,
//     speak: function( msg ) {
//         console.log("Hello, I am feeling "+msg);
//     }
// };


// Alto y ancho para cada bloque del grid (en píxeles)
var block_size;

// número de filas y columnas para el grid
var num_rows, num_cols;


function loadMap()
{

	// Dada la imagen para el mapa establecemos el alto y ancho para el grid
	map_img = $('#map_img');

	// dimensiones para el grid
	// block_size = $('#buttons input[name=block_size]').val();
	block_size = 10;
	var grid_height = resize(map_img.height());
	var grid_width = resize(map_img.width());

	// Esta variable contendrá todo el DOM para el grid
	var grid = $('#grid');
	// Damos propiedades css al grid, de manera que su imagen de fondo sea la del mapa
	grid.css({
		'height': grid_height,
		'width': grid_width,
		'background-image': 'url("' + map_img.attr('src') + '")'
	});


	// obtenemos el número de filas (num_rows) y columnas (num_cols)
	num_rows = getNumBlocks(grid_height);
	num_cols = getNumBlocks(grid_width);

	// Crea todo el tablero #grid, donde el mapa es su imagen de fondo (background)
	for(var row = 0; row <= num_rows; row++)
	{
		// Crea fila
		grid.append('<div class="row"></div>');
		var current_row = grid.find('.row').last();

		current_row.attr('data-row', row);
		current_row.css({'height': block_size});

		for(var col = 0; col <= num_cols; col++)
		{
			// Crea bloque
			current_row.append('<div class="block"></div>');
			current_block = current_row.find('.block').last();
			current_block.attr('data-col', col);
			current_block.attr('data-obj', 0);
			current_block.css({
				// 'background': backgrounds['0'],
				'height': block_size,
				'width': block_size
			});
		}
	}


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
	addDocumentEvents();
	addMapEvents();
}


function saveGrid()
{
	// Guarda los datos para el grid actual en localStorage

	var grid_name = prompt("Nombre para el nuevo grid");

	//.. ver si hay algún grid con el mismo nombre ya

	var grid_data = {
		grid_name: grid_name,
		block_size: block_size,
		blocks: []
	};

	// Recorremos filas del grid
	$('#grid .row').each(function(){
		var row = $(this).attr('data-row');
		//Recorremos cada bloque de la fila
		$(this).find('.block').each(function(){
			var col = $(this).attr('data-col');
			var block_type = $(this).attr('data-obj');

			// row, col, block_type
			var block_data = [row, col, block_type];
			grid_data['blocks'].push(block_data);
		});
	});

	// grids = [
	//			{
	//				grid_name: "grid uno",
	//				block_size: 10,
	//				blocks: [[0,0,1], [0,1,1], [0,2,x] ..]
	//			},
	//			...
	//			{
	//				grid_name: "otro",
	//				block_size: 10,
	//				blocks: [[0,0,1], [0,1,1], [0,2,x] ..]
	//			}
	// ]
	var grids;

	if (localStorage.grids)
	{
		grids = JSON.parse(localStorage.grids);
		grids.push(grid_data);

	}
	else
	{
		grids = [grid_data];
	}
	localStorage.grids = JSON.stringify(grids);

	setMapSelector();
}


function loadGrid(grid_name)
{
	// Carga un grid guardado
	if (!localStorage.grids)
	{
		return;
	}

	// grids = {
	//		grid_name1: {
	//			block_size: 10,
	//			blocks: [[0,0,1], [0,1,1], [0,2,x] ..]
	//		},
	//		...
	//		grid_nameN: {
	//			...
	//		}
	// }

	// sacamos el grid guardado
	var saved_grids = JSON.parse(localStorage.grids);
	var grid;
	for (var i in saved_grids) {
		if (saved_grids[i]['grid_name'] === grid_name)
		{
			grid = saved_grids[i];
		}
	}
	block_size = grid['block_size'];
	blocks = grid['blocks'];

	// volvemos a recontar las filas y columnas por si es un block_size diferente
	num_rows = (grid_height - factor) / block_size;
	num_cols = (grid_width - factor) / block_size;

	// vaciamos el grid actual
	grid = $('#grid');
	grid.empty();

	// sacamos el valor de la última fila y columna en el grid obtenido
	var final_row = blocks[blocks.length-1][0];
	var final_col = blocks[blocks.length-1][1];
	i = 0;
	for(var row = 0; row <= final_row; row++)
	{
		// Crea fila
		grid.append('<div class="row"></div>');
		var current_row = grid.find('.row').last();
		current_row.attr('data-row', row);
		current_row.css({'height': block_size});

		for(var col = 0; col <= final_col; col++)
		{
			// Crea bloque
			current_row.append('<div class="block"></div>');
			current_block = current_row.find('.block').last();

			current_block.attr('data-col', col);
			var block_type = blocks[i][2];  // [[0,0,x], [0,1,0], ..]
			current_block.attr('data-obj', block_type);
			current_block.css({
				'background': backgrounds[block_type],
				'height': block_size,
				'opacity': 0.5,
				'width': block_size
			});

			i++;  // incrementamos para pasar al siguiente bloque en blocks[]
		}
	}

	addGridEvents();
	addDocumentEvents();
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


function resize(size)
{
	// Decrementamos 'size' hasta que sea múltiplo de block_size
	// y así la suma del tamaño de los bloques sea igual al tamaño total del grid.
	for(; size > 0; size--)
	{
		if(size % block_size === 0)
			return size;
	}
}


function getNumBlocks(size)
{
	// Obtenemos el número de bloques que caben en 'size', el cual puede
	// referirse al alto (height) o al ancho (width) del grid que los contiene.
	return (size / block_size) - 1;
}
