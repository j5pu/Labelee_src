
var Floor = {

    // Imágen del plano para la planta
    img: new Image(),

    loading: false,
    points_to_delete: [],


    init: function()
    {
        Floor._getData();
        Floor.img.src = Floor.data.img;
        Floor.img.onload = function(){

            //
            // Una vez cargada la imágen de su plano cargamos el grid y hacemos lo demás
            Floor.loadGrid();

            Menu.init();
        };
    },


    _getData: function()
    {
        Floor.data = new FloorResource().read(floor_id);
    },


    _drawGrid: function()
    {
        // Para recordar el tamaño anterior de bloque tras pintar sus bordes
        Floor.block_height_initial = Floor.block_height;
        Floor.block_width_initial = Floor.block_width;

        var $grid = $e.floor.grid;

        $grid.css({
            'height': Floor.grid_height,
            'width': Floor.grid_width,
            'background-image': 'url("' + Floor.data.img + '")',
            'background-size': Floor.grid_width + 'px' + ' ' + Floor.grid_height + 'px'
        });

        $e.floor.num_blocks.html((Floor.num_rows * Floor.num_cols) + ' bloques');

        // Limpiamos el grid si estaba creado
        $grid.empty();

        for(var row = 0; row < Floor.num_rows; row++)
        {
            // Crea fila
            $grid.append('<div class="row"></div>');
            var current_row = $grid.find('.row:last');

            current_row.attr('data-row', row);
            current_row.css({'height': Floor.block_height});

            for(var col = 0; col < Floor.num_cols; col++)
            {
                // Crea bloque
                current_row.append('<div class="block"></div>');
                var current_block = current_row.find('.block:last');
                current_block.attr('data-col', col);
                current_block.css({
                    'height': Floor.block_height,
                    'width': Floor.block_width
                });
            }
        }

        // Cargamos en el mapeador 'elements.js' los bloques creados
        $e.floor.blocks = $('.block');

        //
        // Procuramos que los bloques no se desencajen del grid creado
        //
        var first_block_vertical_position = $grid.find('.row:first .block:first').position().top;
        var diff = first_block_vertical_position - 0;
        // Si hay diferencia entre la posición del primer bloque y el marco superior del grid,
        // entonces ajustamos esa diferencia:
        if(diff !== 0)
        {
            $grid.find('.block').css({'bottom': diff + 'px'});
        }

        //
        // Vemos si el checkbox para ver la rejilla está activado
        Menu.toggleBlockBorders();

        //
        // Añadimos los eventos
        Events.bindGrid();

        //
        // Vaciamos la lista de puntos a eliminar
        Floor.points_to_delete = [];

        //
        // en la página seteamos el campo para el nro. de filas
        $e.floor.num_rows.val(Floor.num_rows);
    },


    update: function()
    {
        //
        // 1. Guardamos cada punto que no tenga la propiedad 'data-from-db'='y'
        var new_points = [];

        $('#grid .row').each(function(){
            var row = $(this).data('row');
            //Recorremos cada bloque de la fila
            $(this).find('.block').each(function(){

                var from_db = $(this).data('from-db');
                var block_label = $(this).data('label');

                // Si no aparece pintado ni cargado desde BD saltamos a la siguiente iteración
                if(!from_db && !block_label)
                    return;

                var col = $(this).data('col');

                var point_data = {
                    row: row,
                    col: col,
                    floor: Floor.data.resource_uri,
                    label: block_label
                };

                // Guardaremos los bloques que aparecen pintados y no han sido cargados
                // desde la BD
                if(block_label && !from_db)
                {
                    new_points.push(point_data);

                    // Ponemos el bloque como pintado desde la BD para no tener que volver
                    // a cargar todo el grid cada vez que guardemos
                    $(this).attr('data-from-db', 'y');
                }
            });
        });

        //
        // 2. Guardamos las filas y columnas para la planta
        Floor.data.num_rows = Floor.num_rows;
        Floor.data.num_cols = Floor.num_cols;
        new FloorResource().update(Floor.data, Floor.data.id);

        //
        // 3. Enviamos al servidor primero los puntos a eliminar y luego los nuevos
        var pr = new PointResource();
        pr.deletePoints(Floor.points_to_delete);
        pr.createPoints(new_points);

        //
        // 4. Volvemos a cargar el grid editado
//        loadSavedGrid();
    },


    _loadSaved: function()
    {
        //
        // 1. Dibujamos el grid vacío con el nro. de filas y columnas almacenado en BD
        Floor.num_rows = Floor.data.num_rows;
        Floor.num_cols = Floor.data.num_cols;
        Floor.grid_height = resize(Floor.img.height, Floor.num_rows);
        Floor.block_height = Floor.grid_height / Floor.num_rows;
        Floor.grid_width = resize(Floor.img.width, Floor.num_cols);
        Floor.block_width = Floor.grid_height / Floor.num_rows;

        Floor._drawGrid();


        //
        // 2. Pintamos cada etiqueta almacenada para la planta (muro, POI, etc)
        var points = new PointResource().readAllFiltered('?floor__id=' + Floor.data.id);

        // Obtenemos todas las etiquetas que contiene la planta a cargar, y así evitar
        // llamar a BD cada vez que queramos pedir la etiqueta de cada punto
        var saved_labels = new LabelResource().readFromFloor(Floor.data.id);

        for(var i in points)
        {
            var point = points[i];
            var block = $e.floor.grid.find('.row[data-row="' + point.row + '"]')
                .find('.block[data-col="' + point.col + '"]');

            Painter.label = saved_labels[point.label];
            Painter.point_id = point.id;

            Painter.paintLabel(block);
        }
    },


    loadEmpty: function()
    {
        Floor.num_rows = parseInt($e.floor.num_rows.val(), 10);
        Floor.grid_height = resize(Floor.img.height, Floor.num_rows);
        Floor.block_height = Floor.grid_height / Floor.num_rows;

        // Crearemos tantas columnas como sean necesarias para que el bloque salga
        // lo más cuadrado posible
        Floor.grid_width = resize(Floor.img.width, Floor.block_height);
        Floor.num_cols = Floor.grid_width / Floor.block_height;
        Floor.block_width = Floor.grid_width / Floor.num_cols;

        Floor._drawGrid();
    },


    loadGrid: function()
    {
        Floor.loading = true;

        // Si la planta no tiene todavía un número de filas entonces
        // 'tirará' de lo indicado en el formulario de la página
        if(Floor.data.num_rows)
            Floor._loadSaved();
        else
            Floor.loadEmpty();

        Floor.loading = false;
    },


    clearGrid: function()
    {
        // POR IMPLEMENTAR..

//        $('#grid').empty();
//        drawFloor();
//
//        var grid_id = elements.grid_selector.val();
//        var confirm_msg = '¿Desea eliminar el grid? (se perderán todos sus points)';
//        FloorResource().del(this.data., confirm_msg);
//        setGridSelector();
//        loadEmptyGrid();
    }
};



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

