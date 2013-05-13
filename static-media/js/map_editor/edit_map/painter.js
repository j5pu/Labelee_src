
var Painter = {
    painting_trace: false,

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
//    var label_loaded;
//
//    // Proviene del grid_selector
//    var label_to_paint;
//    var label_painted_prev;
//    var icon;
//    var label_category;


    paintTrace: function()
    {
        // POR TERMINAR DE IMPLEMENTAR
        painting_trace = true;  // indicamos que se está pintando una traza
        // stroke = [];  // traza de momento vacía
        // cada vez que se pase el ratón sobre un bloque se dibujará este y se guarda
        // en el array 'stroke' junto con los demás que forman la traza
        elements.block.on('mouseover', paintBlock);

        // paint_actions.push(stroke);
    },


    clearBlock: function(block)
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
    },


    paintLabel: function(block)
    {
        //
        // Pinta etiqueta sobre un bloque en el grid para el plano

        // Si no hay objeto definido no hacemos nada
        if(!Painter.label)
            return;

        // Si se está cargando el plano se pinta marcándola como cargada desde la BD
        if(Floor.loading)
        {
            block.attr('data-from-db', 'y');
            block.attr('data-point-id', Painter.label.id);

            // Dejamos el bloque como pintado
            block.attr('data-label', Painter.label.resource_uri);
        }
        else
        {
            // Si ya se cargó el grid desde la B.D. entonces vaciamos el bloque
            Painter.clearBlock(block);

            // Dejamos el bloque como pintado
            block.attr('data-label', Painter.label.resource_uri);
        }


        // Si:
        //      - aún no se pintó ninguna etiqueta
        //      ||
        //      - no es la misma que se pintó antes
        // Entonces:
        //      cargamos su imágen ..
        if( !Painter.label_prev || Painter.label !== Painter.label_prev)
        {
            // Tomamos la imágen del icono
            Painter.icon = new Image();
            Painter.icon.src = Painter.label.img;

            // No hacemos nada mientras no esté la imágen del mapa cargada en el navegador
            Painter.icon.onload = function(){
                Painter.label_category = new LabelCategoryResource().readFromUri(Painter.label.category);
                Painter._draw(block);
            };
        }
        else
            Painter._draw(block);

        // Según estemos cargando o pintando bloque el previo tendrá uno u otro
        Painter.label_prev = Painter.label;
    },


    _draw: function(block)
    {
        // Ponemos el bloque de un color según la categoría de la etiqueta..
        block.css({'background': Painter.label_category.color});

        // Le añadimos la imágen para la etiqueta, escondida para que se muestre
        // sólo cuando se pase el ratón por encima de su bloque
        block.append('<img src="' + Painter.label.img + '"/>');
        var img = block.find('img');
        var transform_factor = Painter.icon.width / Floor.block_width;
        img.css({
            'margin-top': (Floor.block_height - img.height()) / 2 + 'px',
            'transform': 'scale(' + transform_factor + ')',
            'z-index': '1',
            'display': 'none'
        });
    },


    setLabel: function()
    {
        // Setea la etiqueta a pintar con la elegida en el selector

        Painter.label = new LabelResource().read($e.label.selector.val());
        $e.label.selector.blur();
    }
};
