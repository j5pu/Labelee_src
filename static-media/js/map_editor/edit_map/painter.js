
var Painter = {
    painting_trace: false,
    point: null,
    label_category: null,
    loading_icon: false,
    erase_mode: false,
    showing_label_info: false,

    BLOCKERS_ID: 1,
    WALL_ID: 6,


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
            if(block.data('from-db'))
                Floor.point_count.to_delete++;
            else if(Painter.erase_mode)
                Floor.point_count.to_save--;

        if(block.data('connector-descr'))
        {
            var descr = block.data('connector-descr');

            var index = Floor.painted_connectors.indexOf(descr);
            Floor.painted_connectors.splice(index, 1);
        }

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

        if(!Painter.label || Painter.erase_mode)
        {
            if(Painter.erase_mode)
                Painter.clear(block);
            return;
        }


        // Si se está cargando el plano se pinta marcándola como cargada desde la BD
        if(Floor.loading)
        {
            block.attr('data-from-db', 'y');
            block.attr('data-point-id', Painter.point_id);
            block.attr('data-saved-descr', Painter.point.description);

            // Posición en el grid
            block.append(
                '<div class="label_pos">' +
                    Painter.point.row + ', ' +  Painter.point.col +
                '</div>'
            );

            Floor.point_count.saved++;
        }
        // Si no se está cargando el plano
        else
        {
            if(!block.data('label') || block.data('from-db'))
                Floor.point_count.to_save++;

            Painter.clear(block);

            Menu.setPointStats();
        }

        // Pintamos el menú que se mostrará para el bloque
        Painter._paintMenu(block);

        // Dejamos el bloque como pintado
        block.attr('data-label', Painter.label.resource_uri);

        // Si lo que se está pintando es una arista, añadimos al bloque la descripción para el punto:
        //      xej: Parquing_Escalera_4
        if(LabelCategory.isConnector(Painter.label.category))
            Painter.paintConnector(block);

        // Ponemos el bloque de un color según la categoría de la etiqueta..
        block.css({
            'background': Painter.label.category.color,
            'opacity': '0.5'
        });

        // Si la etiqueta tiene imágen se la añadimos escondida para que se muestre
        // sólo cuando se requiera
        if(!LabelCategory.isBlocker() && Painter.label.img)
        {
            block.append('<img class="label_img" src="' + Painter.label.img + '"/>');

            var img = block.find('img.label_img');
            var transform_factor = Painter.label.loaded_img.width / Floor.block_width;
            img.css({
                'margin-top': (Floor.block_height - img.height()) / 2 + 'px',
                'transform': 'scale(' + transform_factor + ')',
                'z-index': '1',
                'display': 'none'
            });
        }


        // Seguimos iterando mientras se esté cargando el plano
        if(Floor.loading)
            Floor._loopPoints();
    },


    togglePointMenu: function(e, block)
    {
        e.preventDefault();

        // Si se ha vuelto abrir el menú para otro bloque cerramos el actual
        if(Floor.current_menu_block && block[0] != Floor.current_menu_block[0])
            Floor.current_menu_block.find('.menu').hide();

        Floor.current_menu_block = block;

        //Ponemos el menú por delante de la demás info..
        block.find('> :not(.menu)').css({'z-index': 1});

        Floor.current_menu_block.find('.menu').show();
    },


    _paintMenu: function(block){
        // Pinta un menú con el checkbox para el QR aún sin setear conforme a lo que haya en BD

        // Si se trata de un bloqueante entonces no le pintamos el menú
        if(LabelCategory.isBlocker(Painter.label.category))
            return;

        var block_description = Floor.loading ? Painter.point.description : Painter.label.name;
//            img_btn_title = Painter.point.panorama ? gettext('Change panorama') : gettext('Add panorama')
        var block_menu =
            '<div class="menu">' +
                '<div class="descr">' +
                    'Descr: ' +
                    '<input type="text" ' +
                        'value="' + block_description + '" ' +
                        'placeholder="Descripción para el punto..">' +
                '</div>' +
//                    '<div class="panorama">' +
//                        '<input class="btn" ' +
//                            'type="file" ' +
//                            'name="img" ' +
//                            'title="' + img_btn_title + '"/>' +
//                    '</div>' +
                '<div class="qr">' +
                    '<input type="checkbox"/> QR' +
                '</div>' +
            '</div>';

        block.append(block_menu);
    },


    checkQRForMenu: function(block){
        block.find('.qr input[type="checkbox"]').prop('checked', true);
    },


    paintConnector: function(block)
    {
        var connector_descr;

        if(Floor.loading)
            connector_descr = Painter.point.description;
        else
        {
            // Pintamos la arista de manera que si hemos por ejemplo cargado
            // la escalera_2 y escalera_3, la nueva ocupe el hueco que quede libre
            // con escalera_1 y no escalera_4
            Floor.connector_index = 1;
            do
            {
                var valid_descr = true;
                connector_descr = Floor.data.name + '_' + Painter.label.name + '_' + Floor.connector_index;

                // Comparamos la descripción de la nueva arista. Si existe entre las
                // descripciones de las aristas ya cargadas desde BD entonces la aumentamos en
                // una unidad y volvemos a hacer la comparación
                for(var i in Floor.painted_connectors)
                {
                    if(Floor.painted_connectors[i] == connector_descr)
                    {
                        valid_descr = false;
                        Floor.connector_index++;
                        break;
                    }
                }
            }
            while(!valid_descr);
        }

        Floor.painted_connectors.push(connector_descr);

        block.attr('data-connector-descr', connector_descr);

        block.find('.descr input[type="text"]').attr('value', connector_descr);

        block.append(
            '<div class="connector_descr">' + connector_descr + '</div>'
        );

        block.find('.connector_descr').css({
            'bottom': '10px',
            'left': Floor.block_width * 2 + 'px'
        });
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
            block.attr('data-qr-id', Painter.qr.id);
            block.append(
                '<div class="qr_info">' + Painter.qr.id + '</div>'
            );

            var qr_info = block.find('.qr_info');
            var label_pos = block.find('.label_pos');
            qr_info.css({'top': Floor.block_height + 'px'});
            label_pos.css({'bottom': Floor.block_height + 'px'});
            if(Floor.show_only_qrs)
            {
                block.css({'background': 'black'});
                qr_info.show();
                label_pos.show();
            }
            else
            {
                qr_info.hide();
                label_pos.hide();
            }

            // Le damos un sombreado para saber que es QR
//            block.css({'box-shadow': 'inset 0px 0px 19px blue'});
        }
    },


    closeBlockMenu: function()
    {
        Floor.current_menu_block.find('.menu').hide();
        Floor.current_menu_block = null;
    },


    showLabelInfo: function()
    {
        Painter.current_hovered_block = $(this);

        // Se indica que se muestre info de la etiqueta si:
        //      - no se está pintando un trazo
        //      - el bloque tiene etiqueta
        //      - la etiqueta para el bloque no es una bloqueante
        Painter.showing_label_info = !Painter.painting_trace &&
            Painter.current_hovered_block.data('label') &&
            !Painter.isBlocker(Painter.current_hovered_block);

        if(!Painter.showing_label_info)
        {
            Painter.current_hovered_block = null;
            return;
        }


//        Painter.current_hovered_block.find('img').show();
//        Painter.current_hovered_block.find('div').show();

        Painter.current_hovered_block.find('.label_img').show();
//        Painter.current_hovered_block.find('.qr_info').show();
//        Painter.current_hovered_block.find('.label_pos').show();
//        Painter.current_hovered_block.find('.connector_descr').show();
    },


    isBlocker: function(block)
    {
        var label = block.data('label');
        if(!Floor.saved_labels || !Floor.saved_labels[label])
            return;
        var category = Floor.saved_labels[label].category;

        return LabelCategory.isBlocker(category);
    },


    hideLabelInfo: function(block){
        if(!Painter.showing_label_info)
        {
            Painter.current_hovered_block = null;
            return;
        }
        Painter.current_hovered_block.find('.label_img').hide();
//        Painter.current_hovered_block.find('.qr_info').hide();
//        Painter.current_hovered_block.find('.label_pos').hide();
//        Painter.current_hovered_block.find('.connector_descr').hide();
        Painter.current_hovered_block = null;
    },


    showLabelMenu: function(){
        Painter.current_menu_block = $(this);
    },


    hideLabelMenu: function(){

    },



    setLabel: function()
    {
        // Setea la etiqueta a pintar con la elegida en el selector

        var label_id;

        // si se le pasa una id de etiqueta entonces hay que sacar categoría y etiqueta
        if(arguments[0]){
            Painter.label_category = new LabelCategoryResource().read(arguments[0]);
            label_id = arguments[1];
        }
        else
            label_id = $e.label.selector.val();

        for(var i in Menu.labels)
        {
            var label = Menu.labels[i];
            if(label.id == label_id)
            {
                Painter.label = label;
                Painter.label.loaded_img = new Image();
                Painter.label.loaded_img.src = Painter.label.img;
                Painter.label.category = null;
                Painter.label.category = Painter.label_category;
                break;
            }
        }

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
