
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
//        painting_trace = true;  // indicamos que se está pintando una traza
//        // stroke = [];  // traza de momento vacía
//        // cada vez que se pase el ratón sobre un bloque se dibujará este y se guarda
//        // en el array 'stroke' junto con los demás que forman la traza
//        elements.block.on('mouseover', paintBlock);

        // paint_actions.push(stroke);
    },


    clear: function(block)
    {
        // Si:
        //      - no se está cargando el plano desde la BD..
        //      &&
        //      -
        // Entonces:
        //      Insertamos el punto en la

        // Mientras se esté cargando el plano desde BD no se podrá limpiar bloques
        if(Floor.loading)
            return;

        // Si el bloque pintado aparece como cargado desde la BD (data-from-db)
        // entonces insertamos su punto en la lista de puntos a eliminar en BD
        if(block.data('from-db'))
            Floor.points_to_delete.push(block.data('point-id'));

        // Limpiamos todo el contenido del bloque..
        block.empty();
        block.removeData('label');
        block.removeAttr('data-label');
        block.removeData('from-db');
        block.removeAttr('data-from-db');
        block.removeData('point-id');
        block.removeAttr('data-point-id');
        block.css({'background': ''});
    },


    paint: function(block)
    {
        //
        // Pinta etiqueta sobre un bloque en el grid para el plano

        // Si:
        //      - el pintor no tiene etiqueta para pintar
        //      ||
        //      - el pintor está pintando puntos que no están viniendo desde la BD,
        //        sino pintados por el usuario
        // Entonces: no hacemos nada
        if(!Painter.label)
            return;

        // Si se está cargando el plano se pinta marcándola como cargada desde la BD
        if(Floor.loading)
        {
            block.attr('data-from-db', 'y');
            block.attr('data-point-id', Painter.point_id);

            // Dejamos el bloque como pintado
            block.attr('data-label', Painter.label.resource_uri);
        }
        else
        {
            // Si ya se cargó el grid desde la B.D. entonces vaciamos el bloque
            Painter.clear(block);

            // Dejamos el bloque como pintado
            block.attr('data-label', Painter.label.resource_uri);
        }


        //
        // Carga imágen de la etiqueta:
        // Si:
        //      - aún no se pintó ninguna etiqueta
        //      ||
        //      - no es la misma que se pintó antes
        // Entonces:
        //      cargamos su imágen ..
        // Si no:
        //      no hace falta esperar para volver a cargar la misma imágen
        if(!Painter.label_prev || Painter.label !== Painter.label_prev)
        {

            // Obtenemos la categoría
            if(Floor.loading)
                Painter.label_category = new LabelCategoryResource().readFromUri(Painter.label.category_uri);
            else
                Painter.label_category = new LabelCategoryResource().readFromUri(Painter.label.category);

            // Obtenemos la imágen del icono
            Painter.icon = new Image();
            Painter.icon.src = Painter.label.img;

            // No hacemos nada mientras no esté la imágen del mapa cargada en el navegador
            Painter.icon.onload = function(){

                Painter._draw(block);

                // Seguimos iterando mientras se esté cargando el plano
                if(Floor.loading)
                    Floor.loopPoints();
                else
                    Painter.label_prev = Painter.label;
            };
        }
        else
        {
            // Si la etiqueta es igual a la anterior entonces ya se puede pintar
            // sin tener que volver a cargar su imágen
            Painter._draw(block);

            if(Floor.loading)
                Floor.loopPoints();
        }
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
