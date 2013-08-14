var Floor = {

    // Imágen del plano para la planta
    img: new Image(),

    loading: false,
    updating: false,
    redrawing_grid: false,
    rows_changing: false,
    show_only_qrs: false,
    point_count: {
        to_save: 0,
        saved: 0,
        to_delete: 0,
        connectors: 0,
        total: 0
    },
    points_to_delete: [],
    painted_connectors: null,

    //Planta1_escalera_1
    connector_index: 1,


    init: function()
    {
        Floor._getData();
        Floor.img.src = Floor.data.img || Floor.data.imgB;
        Floor.img.onload = function(){

            //
            // Una vez cargada la imágen de su plano cargamos el grid y hacemos lo demás
            WaitingDialog.open(
                gettext('Loading floor grid') + '..',
                Floor.loadGrid
            );
        };
    },


    _getData: function()
    {
        Floor.data = floorResource.read(floor_id);
        Floor.enclosure = enclosureResource.readFromUri(Floor.data.enclosure);
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

        $e.floor.num_blocks.html((Floor.num_rows * Floor.num_cols) + ' ' + gettext('blocks'));

        // Limpiamos el grid si estaba creado
        $grid.empty();

        var gridHtml = '';
        for(var row = Floor.num_rows-1; row >= 0; row--)
        {
            // Crea fila
            gridHtml += '<div class="row" data-row="' + row +'" style="height: ' + Floor.block_height + 'px;">';

            for(var col = 0; col < Floor.num_cols; col++)
            {
                // Crea bloque
                gridHtml += '<div class="block" data-col="' + col +'" style="height: ' + Floor.block_height +
                    'px; width: ' + Floor.block_width + 'px;"></div>';
            }

            gridHtml += '</div>';
        }
        $grid.append(gridHtml);

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
        Menu.toggleBorders();


        //
        // Vaciamos la lista de puntos a eliminar
        Floor.points_to_delete = [];

        //
        // en la página seteamos el campo para el nro. de filas
        $e.floor.num_rows.val(Floor.num_rows);
    },


    update: function()
    {

        if(Floor.redrawing_grid)
            return;

        var new_points = [];
        var points_to_update = [];

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

                var descr = $(this).find('.descr input[type="text"]').val();
                var checked_qr = $(this).find('.qr input[type="checkbox"]').is(":checked");

                // Guardaremos aquellos bloques que:
                //      aparecen pintados y no han sido cargados desde la BD
                //      ||
                //      han sido cargados desde BD y se les modificó el QR

                var is_new = block_label && !from_db;
                var has_qr_modified =
                    from_db
                    &&
                    (
                        ($(this).data('qr-id') && !checked_qr)
                        ||
                        (!$(this).data('qr-id') && checked_qr)
                    );
                var has_descr_modified =
                    from_db && ($(this).data('saved-descr') != descr);

                var panorama_input = $(this).find('input[type=file]');
                var has_panorama_attached = from_db && (panorama_input.length > 0 && panorama_input.val() != "")

                var is_modified = has_qr_modified || has_descr_modified || has_panorama_attached;

                if(is_new)
                {
                    var new_point = {
                        description: descr,
                        row: row,
                        col: col,
                        floor: Floor.data.id,
                        label: block_label
                    };

                    new_points.push(new_point);
                }
                else if(is_modified)
                {
                    var point_to_update = {
                        id: $(this).data('point-id'),
                        description: descr,
                        qr: checked_qr
                    };

                    if(has_panorama_attached)
                        pointResource.addImg($(this).find('form'), $(this).data('point-id'), function(){});

                    points_to_update.push(point_to_update);
                }
            });
        });

        // Guardamos las filas y columnas
        Floor.data.num_rows = Floor.num_rows;
        Floor.data.num_cols = Floor.num_cols;
        var data = {
            num_rows: Floor.num_rows,
            num_cols: Floor.num_cols
        };
        floorResource.update(data, Floor.data.id);

        // Enviamos al servidor primero los puntos a eliminar y luego los nuevos
        var pr = new PointResource();
        pr.deletePoints(Floor.points_to_delete);
        pr.updatePoints(points_to_update);
        pr.createPoints(new_points);

        // Vaciamos la lista de puntos eliminados
        Floor.points_to_delete = [];

        // Recargamos el grid
        Floor.reloading = true;
        Floor.loadGrid();

        Painter.label_category = Painter.label_category_pre_update_floor;
    },


    findBlock: function(row, col)
    {
        return $e.floor.grid.find('.row[data-row="' + row + '"]')
            .find('.block[data-col="' + col + '"]');
    },


    _loopPointsEnd: function()
    {
        if(!Floor.reloading)
        {
            // Si no se está recargando la planta de haberle dado a guardar entonces conservamos
            // los valores
            Painter.label = null;
            Painter.label_prev = null;
            Painter.icon = null;
        }
        Floor.i = 0;

        //
        // Una vez cargados todos los puntos vamos con los QRs..
        Floor._loadQRs();
    },

    _loopPoints: function()
    {
        // Realiza una iteración para pintar en el plano un punto de la lista
        // cargada desde BD

        // Si ya no se está cargando el plano..
        if(!Floor.loading)
            return;

        // Si ya han sido pintados todos los puntos..
        var all_points_painted = !Floor.points || Floor.i >= Floor.points.length;
        if(all_points_painted)
        {
            Floor._loopPointsEnd();
            return;
        }


        //
        // Para pintar el punto, el pintor necesita:
        //      - bloque sobre el que pintar
        //      - etiqueta del punto a pintar
        //      - id en BD de dicho punto
        var point = Floor.points[Floor.i];
        var block = $e.floor.grid.find('.row[data-row="' + point.row + '"]')
            .find('.block[data-col="' + point.col + '"]');
        Painter.label = Floor.saved_labels[point.label];
        Painter.label_category = Floor.saved_labels[point.label].category;
        Painter.point_id = point.id;


        //PROVISI..
        Painter.point = point;

        // Para la siguiente iteración..
        Floor.i++;

        // Pintamos..
        Painter.paintLabel(block);
    },


    _loopQRsEnd: function()
    {
        // Esto es lo que se hace una vez cargado completamente el plano, con sus etiquetas
        // y sus QRs

        if(Floor.reloading)
        {
            Menu.setPointStats();
            Menu.toggleEraseMode();
            Floor.reloading = false;
//            alert('Plano actualizado');
        }

        $e.floor.labeled_blocks = $e.floor.grid.find('[data-label]');

        Menu.init();

        // Cargamos todos eventos
        Events.bindAll();

        Floor.loading = false;

        // Dibujamos todos los botones para subir archivo
        FileInput.draw();

        // Cerramos el mensaje de espera
        WaitingDialog.close();
    },


    _loopQRs: function()
    {
        // Itera por toda la lista de QRs

        if(Painter.i >= Menu.qr_list.length)
        {
            Floor._loopQRsEnd();
            return;
        }


        // Si no se cargó el icono del qr..
        if(!Painter.qr_icon)
        {
            // No hacemos lo demás hasta que se haya cargado el QR
            Painter.qr_icon = new Image();
            Painter.qr_icon.src = '/static/img/qr_code.png';
            Painter.qr_icon.onload = function()
            {
                Floor._loopQRs();
            };
        }
        else
        {
            //
            // Cuerpo
            Painter.qr = Menu.qr_list[Painter.i];
            Painter.block = Floor.findBlock(Painter.qr.point.row, Painter.qr.point.col);

            Painter.paintQR();

            // Dejamos a 'checked' el campo QR para el bloque
            Painter.checkQRForMenu(Painter.block);

            Painter.i++;
            Floor._loopQRs();
        }
    },


    _loopLabelsEnd: function()
    {
        // Iteraremos por cada punto, no pintando el siguiente hasta que se haya cargado
        // la imágen para la etiqueta del anterior
        //        http://www.bitstorm.org/weblog/2012-1/Deferred_and_promise_in_jQuery.html
        //        http://stackoverflow.com/a/14408887/1260374
        Floor.i = 0;
        Floor._loopPoints();
    },


    _loopLabels: function()
    {
        if(Label.i == Label.keys.length)
        {
            Floor._loopLabelsEnd();
            Label.i = 0;
            return;
        }

//        var label = Floor.saved_labels[Label.keys[Label.i]];

        // Si la etiqueta contiene imágen

        // NO ES NECESARIO IMAGEN PARA CADA ETIQUETA
//        if(label.img)
//        {
//            var img = new Image();
//            img.src = label.img;
//            img.onload = function(){
//                Floor.saved_labels[Label.keys[Label.i]].loaded_img = null;
//                Floor.saved_labels[Label.keys[Label.i]].loaded_img = img;
//                Label.i++;
//                Floor._loopLabels();
//            };
//        }
//        else
//        {
//            Floor.saved_labels[Label.keys[Label.i]].loaded_img = null;
            Label.i++;
            Floor._loopLabels();
//        }
    },


    _loadLabels: function()
    {
        // Obtenemos todas las etiquetas que contiene la planta a cargar, y así evitar
        // llamar a BD cada vez que queramos pedir la etiqueta de cada punto
        Floor.saved_labels = labelResource.readFromFloor(Floor.data.id);

        // Carga todas las imágenes para
        Label.i = 0;
        Label.keys = Object.keys(Floor.saved_labels);
        Floor._loopLabels();
    },


    _getPaintedLabels: function()
    {
        // Toma todas las etiquetas pintadas sobre el plano hasta el momento

        // painted_labels = {
        //      '/api/v1/label/5': {
        //              ..label
        //      },
        //      ...
        // }

        Floor.painted_labels = [];

        $e.floor.grid.find('.block[data-label]').each(function(){
            var block_label = $(this).data('label');

            if(Floor.painted_labels[block_label])
                return;

            Floor.painted_labels[block_label] = new LabelResource().readFromUri(block_label);
        });
    },


    _loadQRs: function()
    {
        // Pintamos los QRs de las etiquetas que lo contengan

        Painter.i = 0;
        Menu.qr_list = qrCodeResource.readAllFiltered('?point__floor__id=' + Floor.data.id);

        Floor._loopQRs();
    },


    loadSaved: function()
    {
        //
        //  1. Dibujamos el grid vacío con el nro. de filas y columnas almacenado en BD
        //  2. Pintamos cada etiqueta almacenada para la planta (muro, POI, etc)
        //  3. Pintamos los QRs de las etiquetas que lo contengan

        Floor.num_rows = Floor.data.num_rows;
        Floor.num_cols = Floor.data.num_cols;
        Floor.grid_height = resize(Floor.img.height, Floor.num_rows);
        Floor.block_height = Floor.grid_height / Floor.num_rows;
        Floor.grid_width = resize(Floor.img.width, Floor.num_cols);
        Floor.block_width = Floor.grid_height / Floor.num_rows;

        Floor._drawGrid();

        Floor._loadLabels();
    },


    loadEmpty: function()
    {
        Floor.loading = true;

        if(Floor.points)
            Floor.points = null;

        if(Floor.rows_changing)
            Floor.num_rows = parseInt($e.floor.num_rows.val(), 10);
        else
            Floor.num_rows = Floor.data.num_rows || parseInt($e.floor.num_rows.val(), 10);

        Floor.grid_height = resize(Floor.img.height, Floor.num_rows);
        Floor.block_height = Floor.grid_height / Floor.num_rows;

        // Crearemos tantas columnas como sean necesarias para que el bloque salga
        // lo más cuadrado posible
        Floor.grid_width = resize(Floor.img.width, Floor.block_height);
        Floor.num_cols = Floor.grid_width / Floor.block_height;
        Floor.block_width = Floor.grid_width / Floor.num_cols;

        Floor._drawGrid();

        Floor.painted_connectors = [];

        Menu.init();

        Events.bindAll();

        Floor.loading = false;
        Floor.reloading = false;
        Floor.rows_changing = false;

        WaitingDialog.close();
    },


    loadGrid: function()
    {
        Floor.loading = true;

        // Cargamos cada etiqueta almacenada para la planta (muro, POI, etc)
        if(Floor.show_only_qrs)
            Floor.points = pointResource.readQRsFromFloor(Floor.data.id);
        else
        {
            Floor.points = pointResource.readAllFiltered('?floor__id=' + Floor.data.id);
            Floor.painted_connectors = pointResource.readConnectionsFromFloor(Floor.data.id)
        }

        Floor.point_count.saved = 0;
        Floor.point_count.to_save = 0;
        Floor.point_count.to_delete = 0;
        Floor.point_count.connectors = 0;

        Floor.painted_connectors = [];
        Painter.erase_mode = false;

        if(Floor.hasPoints())
            Floor.loadSaved();
        else
            Floor.loadEmpty();
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
    },


    changeNumRows: function(ev)
    {
        // Si pulsamos alguna tecla que no sea intro no hacemos nada,
        // sólo comprobamos
        if($e.floor.num_rows.val() == Floor.data.num_rows ||
            $e.floor.num_rows.val() < 20)
        {
            $e.floor.change_num_rows.attr('disabled', 'disabled');
            return;
        }
        else
            $e.floor.change_num_rows.removeAttr('disabled');

        if(ev.keyCode && ev.keyCode != 13)
            return;

        // Si el número de filas no varia tampoco hacemos nada
        if($e.floor.num_rows.val() == Floor.data.num_rows)
            return;

        ev.preventDefault();

        Floor.rows_changing = true;

        if(Floor.hasPoints())
        {
            if(confirm(gettext('Changing number of rows will erase all points on the floor. Continue?')))
            {
                pointResource.deletePoints(Floor.points);
                Floor.reloading = true;
                WaitingDialog.open(
                    gettext('Redrawing grid') + '..',
                    Floor.loadEmpty
                );
            }
            else
            {
                $e.floor.num_rows.val(Floor.data.num_rows || 20);
                $e.floor.change_num_rows.attr('disabled', 'disabled');
            }
        }
        else
        {
            WaitingDialog.open(
                gettext('Redrawing grid') + '..',
                Floor.loadEmpty
            );
        }
    },

    hasPoints: function()
    {
        return Floor.points && Floor.points.length > 0 ;
    },

//    Si se ha pintado algun punto
    isPainted: function()
    {
        return Floor.point_count.to_save > 0 ;
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
