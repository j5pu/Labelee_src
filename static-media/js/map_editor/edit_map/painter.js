
var Painter = {
    painting_trace: false,
    point: null,
    label_category: null,
    loading_icon: false,


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

        if(block.data('label'))
            Floor.point_count.to_save--;

        if(block.data('connector-descr'))
            Floor.point_count.connectors--;

        // Limpiamos todo el contenido del bloque..
        block.empty();
        block.removeData('label');
        block.removeAttr('data-label');
        block.removeData('from-db');
        block.removeAttr('data-from-db');
        block.removeData('point-id');
        block.removeAttr('data-point-id');
        block.removeData('connector-descr');
        block.removeAttr('data-connector-descr');
        block.css({'background': ''});

        Menu.setPointStats();
    },


    paintLabel: function(block)
    {
        //
        // Pinta etiqueta sobre un bloque en el grid para el plano

//        if(!Painter.label || Painter.loading_icon)
//            return;


        // Si se está cargando el plano se pinta marcándola como cargada desde la BD
        if(Floor.loading)
        {
            block.attr('data-from-db', 'y');
            block.attr('data-point-id', Painter.point_id);
//            block.append(
//                '<div class="point_info">' +
//                    Painter.point.row + ', ' +  Painter.point.col +
//                '"</div>'
//            );

            Floor.point_count.saved++;
        }
        else
        {
            Painter.clear(block);
            Floor.point_count.to_save++;
        }

        // Dejamos el bloque como pintado
        block.attr('data-label', Painter.label.resource_uri);

        // Si lo que se está pintando es una arista, añadimos al bloque la descripción para el punto:
        //      xej: Parquing_Escalera_4
        if(LabelCategory.isConnector(Painter.label.category))
        {
            var connector_descr = Floor.data.name + '_' + Painter.label.name + '_' + ++Floor.point_count.connectors;
            block.attr('data-connector-descr', connector_descr);
            block.append(
                '<div class="connector_descr">' + connector_descr + '</div>'
            );
        }

        // Ponemos el bloque de un color según la categoría de la etiqueta..
        block.css({
            'background': Painter.label.category.color
//            'opacity': '0.5'
        });


        // Le añadimos la imágen para la etiqueta, escondida para que se muestre
        // sólo cuando se pase el ratón por encima de su bloque
        block.append('<img class="label_img" src="' + Painter.label.img + '"/>');

        var img = block.find('img.label_img');
        var transform_factor = Painter.label.loaded_img.width / Floor.block_width;
        img.css({
            'margin-top': (Floor.block_height - img.height()) / 2 + 'px',
            'transform': 'scale(' + transform_factor + ')',
            'z-index': '1',
            'display': 'none'
        });

        Menu.setPointStats();

        // Seguimos iterando mientras se esté cargando el plano
        if(Floor.loading)
            Floor._loopPoints();
    },


    paintQR: function()
    {
        // No hacemos lo demás hasta que se haya cargado el icono del QR
        if(!Painter.qr_icon)
        {
            Painter.qr_icon = new Image();
            Painter.qr_icon.src = '/static/img/qr_code.png'
            Painter.qr_icon.onload = function(){
                Painter.paintQR();
            };
        }
        else
        {
            // Según estemos pintando directamente o cargando desde BD
            var block = Painter.current_hovered_block || Painter.block;
            block.attr('data-qr', Painter.qr.id);
            block.append(
                '<div class="qr_info">' + Painter.qr.code + '</div>'
            );

            // Le damos un sombreado para saber que es QR
            block.css({'box-shadow': 'inset 0px 0px 19px blue'});
        }
    },


    showLabelInfo: function()
    {
        Painter.current_hovered_block = $(this);

        // Si:
        //      - se está pintando un trazo
        //      - se están pintando etiquetas bloqueantes
        //      - el bloque no tiene etiqueta
        if(Painter.painting_trace
            || (Painter.painting_trace && Painter.label_category.id === 1)
            || !Painter.current_hovered_block.data('label'))
        {
            Painter.current_hovered_block = null;
            return;
        }
//        Painter.current_hovered_block.find('img').show();
//        Painter.current_hovered_block.find('div').show();

        Painter.current_hovered_block.find('.point_info').show();

        Painter.current_hovered_block.find('.connector_descr').show();
    },


    hideLabelInfo: function(){
        if(Painter.painting_trace || !Painter.current_hovered_block)
            return;
        Painter.current_hovered_block.find('img').hide();
        Painter.current_hovered_block.find('.connector_descr').hide();
        Painter.current_hovered_block = null;
    },





    setLabel: function()
    {
        // Setea la etiqueta a pintar con la elegida en el selector

        Painter.label = new LabelResource().read($e.label.selector.val());

        $e.label.selector.blur();
        $e.category.selector.blur();
    },


    assignQR: function()
    {
        // Asigna un QR a una etiqueta del mapa

        // Si el pintor no está mostrando la imágen de la etiqueta de un bloque,
        // entonces no hacemos nada
        if(!Painter.current_hovered_block)
            return;
        // Si ya hay etiqueta para ese bloque tampoco hacemos nada
        else if(Painter.current_hovered_block.data('qr'))
            return;

        // Creamos el QR..
        //      qr_code = <enclosure>_<floor>_<poi>
        // xej: 1_3_233
        var point_id = Painter.current_hovered_block.data('point-id');
        var floor_id = Floor.data.id;
        var enclosure_id = new Resource('enclosure').readFromUri(Floor.data.enclosure).id;

        var qr_code = enclosure_id + '_' + floor_id + '_' + point_id;
        var point_uri = new PointResource().read(point_id).resource_uri;

        var data = {
            code: qr_code,
            point: point_uri
        };

        new Resource('qr-code').create(data);

        //
        // Pintamos el Qr encima de la etiqueta..
        Painter.paintQR();
        Painter.current_hovered_block = null;

        //
        // Una vez que se crea actualizamos la lista de QRs..
        Menu.setQrList();

    }
};
