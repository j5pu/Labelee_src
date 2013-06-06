
var Events = {

    grid: {

        _toggleMousePointer: function()
        {
            $e.floor.grid.on('mouseover', function(){
                if(Painter.erase_mode)
                    $(this).css({'cursor': 'no-drop'});
                else
                    $(this).css({'cursor': 'default'});
            });
            $e.floor.grid.on('mouseleave', function(){
                $(this).css({'cursor': 'default'});
            });
        },


        _toggleBlockShadow: function()
        {
            // Cambiamos el evento 'mouseover' del elemento para que haga esto:

            // Si el bloque contiene un qr entonces no le sacamos la sombra
            var block_is_qr = Painter.current_hovered_block && Painter.current_hovered_block.data('qr');
            if(block_is_qr)
                return;

            $e.floor.blocks.on('mouseover', function(){
                $(this).css({'box-shadow': '1px 1px 10px'});
            });
            $e.floor.blocks.on('mouseleave', function(){
                $(this).css({'box-shadow': ''});
            });
        },


        _setHoveredBlock: function()
        {
            $e.floor.blocks.on('mouseover', function(){
                Painter.current_hovered_block = $(this);
                if(Painter.current_hovered_block.data('qr'))
                    Painter.current_hovered_block.is_qr = true;
            });
            $e.floor.blocks.on('mouseleave', function(){
                Painter.current_hovered_block = null;
            });
        },


        _toggleLabelInfo: function()
        {
            // Mostrar imágen de la etiqueta al sólo pasar el ratón sobre el bloque

            var block_is_qr = Painter.current_hovered_block && Painter.current_hovered_block.data('qr');
            if(block_is_qr || Floor.show_only_qrs)
                return;

            $e.floor.blocks.on('mouseover', Painter.showLabelInfo);
            $e.floor.blocks.on('mouseleave', Painter.hideLabelInfo);
        },


        _showUpQRInfo: function()
        {
            // Pone encima de lo demás la info del QR al pasarle el ratón
            if(!Floor.show_only_qrs)
                return;

            $e.floor.blocks.on('mouseover', function(){
                Label.info_hovered = true;
                Label.toggleHoverQRInfo($(this));
            });
            $e.floor.blocks.on('mouseleave', function(){
                Label.info_hovered = false;
                Label.toggleHoverQRInfo($(this));
            });
        },


        _assign_qr_by_right_click: function()
        {
            // No vamos a asignar un QR a un bloque que no tenga etiqueta..

            // Si la planta no tiene etiqueta no hay evento que asignar
            if(!$e.floor.labeled_blocks)
                return;

            $e.floor.labeled_blocks.on('contextmenu', function(e){
                e.preventDefault();
                Painter.assignQR();
                $e.floor.blocks.off('mouseover');
                Events.grid.bind();
            });
        },


        _remove_with_key_pressed: function()
        {
            //
            // Borrar etiquetas pulsando ALT
            Mousetrap.bind('alt', function(e){
                e.preventDefault();
//                Painter.hideLabelInfo();
                $e.floor.blocks.on('mousemove', function(e){
                    e.preventDefault();
                    $e.floor.blocks.off('mousemove');
                    Painter.clear($(this));
                });
                $e.floor.blocks.on('mouseover', function(e){
                    e.preventDefault();
                    Painter.clear($(this));
                });
            });

            Mousetrap.bind('alt', function(e){
                e.preventDefault();
                $e.floor.blocks.off('mouseover');
                Events.grid.bind();
            },'keyup');
        },


        _paint_with_mouse_pressed: function()
        {
            //
            // Pintar etiquetas dejando pulsado el botón izquierdo del ratón mientras lo movemos
            $e.floor.blocks.on('mousedown', function(e) {

                // Si se pulsó con el botón derecho no hacemos nada
                if(e.button == 2)
                    return;

                // Si hay un menú abierto y el bloque es distinto se cierra el menú
                if(Floor.current_menu_block)
                {
                    // Si se hace click en el input del descr..
                    if($(e.target).parent().hasClass('descr'))
                        return;

                    // Si se hace click dentro del menú || dentro del descr..
                    if($(e.target).parent().hasClass('menu')
                        ||
                        $(e.target).parent().parent().hasClass('menu'))
                        if($(e.target).parent()[0] != Floor.current_menu_block[0])
                        {
                            Floor.current_menu_block.find('.menu').hide();
                            Floor.current_menu_block = null;
                            return;
                        }
                        else
                            return;

                    // Si se hace click sobre otro bloque
                }

                e.preventDefault();


                // Si el bloque ya tiene etiqueta

                Painter.paintLabel($(this));
                Painter.painting_trace = true;
                $e.floor.blocks.on('mouseover', function(){
                    Painter.paintLabel($(this));
                });
            });
            $(document).on('mouseup', function(e){
                // Esperamos un poco a que suceda lo disparado por el mousedown
                if(!Painter.painting_trace)
                    // Si hay un menú abierto y el bloque es distinto se cierra el menú
                    if(Floor.current_menu_block)
                    {
                        if($(e.target).parent()[0] != Floor.current_menu_block[0])
                        {
//                                Floor.current_menu_block.find('.menu').hide();
//                                Floor.current_menu_block = null;
                            return;
                        }
                        else
                            return;
                    }
                    else
                        return;

                $e.floor.blocks.off('mouseover');
                Painter.painting_trace = false;
                Events.grid.bind();
            });
        },


        _showPointMenu: function(){
            // Mostramos una caja de texto para poder introducir la descripción del punto
            $e.floor.labeled_blocks.on('contextmenu', function(e){
                // Si se ha vuelto abrir el menú para otro bloque cerramos el actual
                if(Floor.current_menu_block && $(this)[0] != Floor.current_menu_block[0])
                    Floor.current_menu_block.find('.menu').hide();

                Floor.current_menu_block = $(this);
                e.preventDefault();

                Floor.current_menu_block.find('.menu').show();
            });
        },


        _paint_with_key_pressed: function()
        {
            //
            // Pintar etiquetas dejando pulsado cmd o ctrl y pasando el ratón por el grid
            Mousetrap.bind(['command', 'ctrl'], function(e){

                e.preventDefault();

                // Si se está cargando la imágen de un icono salimos..
                if(Painter.loading_icon)
                    return;

                // Para que no se muestren iconos de las etiquetas mientras pintamos..
//                Painter.hideLabelInfo();

                Painter.painting_trace = true;
                $e.floor.blocks.on('mousemove', function(e){
                    e.preventDefault();
                    $e.floor.blocks.off('mousemove');
                    Painter.paintLabel($(this));
                });
                $e.floor.blocks.on('mouseover', function(e){
                    e.preventDefault();
                    Painter.paintLabel($(this));
                });
            });
            Mousetrap.bind(['command', 'ctrl'], function(e){
                e.preventDefault();
                $e.floor.blocks.off('mouseover');
                $e.floor.blocks.off('mousemove');
                Events.grid.bind();
                Painter.painting_trace = false;
            },'keyup');
        },


        bind: function()
        {
            var self = this;
            $('#grid *').off();
//            self._assign_qr_by_right_click();
//            self._paint_with_key_pressed();
            self._paint_with_mouse_pressed();
//            self._remove_with_key_pressed();
            self._toggleBlockShadow();
            self._toggleLabelInfo();
            self._showUpQRInfo();
            self._setHoveredBlock();
            self._toggleMousePointer();
            self._showPointMenu();
        }
    },


    menu: {
        _toggleQRs: function()
        {
            // Mostrar o no los QRs
            $e.qr.toggle.on('change', Menu.toggleQRs);
        },


        _showQR: function()
        {
            // Muestra en el plano el QR sobre el que hacemos click en la lista

            var a = $e.qr.list.find('a');
            a.on('click', Menu.showQR)
        },


        _updateFloor: function()
        {
            // Actualizar planta
            $e.floor.update.on('click', Floor.update);
            $e.floor.clear.on('click', Floor.clear);
        },


        _changeNumRows: function()
        {
            // Campo para nro. de filas
            $e.floor.num_rows.on('change', Floor.loadEmpty);
        },


        _toggleBlockBorders: function()
        {
            // Ver rejilla
            $e.floor.toggle_border.on('change', Menu.toggleBorders);
        },


        _toggle_erase_mode: function()
        {
            $e.floor.toggle_erase_mode.on('change', Menu.toggleEraseMode)
        },


        _selectLabelCategory: function()
        {
            $e.category.selector.on('change', Menu.setLabelSelector);
        },


        _selectLabel: function()
        {
            $e.label.selector.on('change', Painter.setLabel);
        },


        _manageLabelCategory: function()
        {
            $e.category.new.on('click', LabelCategory.show_form_new);
            $e.category.edit.on('click', LabelCategory.update);
            $e.category.delete.on('click', LabelCategory.delete);
            $e.category.form.create.on('click', LabelCategory.create);
        },


        _manageLabel: function()
        {
            $e.label.new.on('click', Label.show_form_new);
            $e.label.edit.on('click', Label.update);
            $e.label.delete.on('click', Label.delete);
            $e.label.form.create.on('click', Label.create);
        },


        bind: function()
        {
            var self = this;
            $('#menu *').off();
            self._changeNumRows();
            self._manageLabel();
            self._manageLabelCategory();
            self._selectLabel();
            self._selectLabelCategory();
            self._toggleBlockBorders();
            self._toggleQRs();
            self._updateFloor();
            self._showQR();
            self._toggle_erase_mode();
        }
    },


    shortcuts: {
        _assignQR: function()
        {
            //
            // Asignar un QR a una etiqueta pulsando 'q' mientras está el ratón encima
            Mousetrap.bind('q', function(e){

                Painter.assignQR();

                e.preventDefault();
                $e.floor.blocks.off('mouseover');
                Events.bindGrid();
            },'keyup');
        },


        _toggleLabels: function()
        {
            // Esconde todas las etiquetas mientras se pulsa el atajo
            Mousetrap.bind('d', function(e){
                e.preventDefault();
                if(!Painter.current_hovered_block)
                    return;
                $e.floor.blocks.hide();
            });
            Mousetrap.bind('d', function(e){
                e.preventDefault();
//                if(!Painter.current_hovered_block)
//                    return;
                $e.floor.blocks.show();
            },'keyup');
        },


        _toggleEraseMode: function()
        {
            Mousetrap.bind('e', function(e){
                // Si el ratón no está sobre un bloque cuando se pulsa la e,
                // entonces no hacemos nada
                e.preventDefault();

                if(!Painter.current_hovered_block)
                    return;

                Painter.erase_mode = !Painter.erase_mode;

                $e.floor.toggle_erase_mode.prop('checked', Painter.erase_mode);

                $e.floor.grid.trigger('mouseover');
            });
        },


        bind: function()
        {
            var self = this;
            self._assignQR();
//            self._toggleLabels();
            self._toggleEraseMode();
        }
    },


    bindAll: function(){
        var self = this;
        self.grid.bind();
        self.menu.bind();
        self.shortcuts.bind();
    }
};
