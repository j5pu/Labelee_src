
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
//            var block_is_qr = Painter.current_hovered_block && Painter.current_hovered_block.data('qr');
//            if(block_is_qr)
//                return;

            $e.floor.blocks.on('mouseover', function(){
//                $(this).css({'box-shadow': '1px 1px 10px'});

                if(Floor.current_hovered_block || $e.floor.toggle_border.is(':checked'))
                    return;

                Floor.block_height_prev = $(this).height();
                Floor.block_width_prev = $(this).width();

                Floor.border_size_prev = $e.floor.toggle_border.is(':checked') ? 1 : 0;
                Floor.border_size_new = 5;

                var new_height = Floor.block_height_prev - (Floor.border_size_new*2) + Floor.border_size_prev*2,
                    new_width = Floor.block_width_prev - (Floor.border_size_new*2) + Floor.border_size_prev*2;

                $(this).css({
                    'border': Floor.border_size_new + 'px solid black',
                    'height': new_height + 'px',
                    'width': new_width + 'px'
                });

                Floor.current_hovered_block = $(this);
            });
            $e.floor.blocks.on('mouseleave', function(){
//                $(this).css({'box-shadow': ''});

                if($e.floor.toggle_border.is(':checked'))
                    return;

                $(this).css({
                    'border': Floor.border_size_prev + 'px solid black',
                    'height': Floor.block_height_prev + 'px',
                    'width': Floor.block_width_prev + 'px'
                });

                Floor.current_hovered_block = null;
            });
        },


        _setHoveredBlock: function()
        {
            $e.floor.blocks.on('mouseover', function(){
                Painter.current_hovered_block = $(this);
                if(Painter.current_hovered_block.data('qr-id'))
                    Painter.current_hovered_block.is_qr = true;
            });
            $e.floor.blocks.on('mouseleave', function(){
                Painter.current_hovered_block = null;
            });
        },


        _toggleLabelInfo: function()
        {
            // Mostrar imágen de la etiqueta al sólo pasar el ratón sobre el bloque

//            var block_is_qr = Painter.current_hovered_block && Painter.current_hovered_block.data('qr');
//            if(block_is_qr || Floor.show_only_qrs)
//                return;

                $e.floor.blocks.on('mouseover', Painter.showLabelInfo);
                $e.floor.blocks.on('mouseleave', Painter.hideLabelInfo);
        },


        _showUpQRInfo: function()
        {
//            // Pone encima de lo demás la info del QR al pasarle el ratón
//            if(!Floor.show_only_qrs)
//                return;
//
//            $e.floor.blocks.on('mouseover', function(){
//                Label.info_hovered = true;
//                Label.toggleHoverQRInfo($(this));
//            });
//            $e.floor.blocks.on('mouseleave', function(){
//                Label.info_hovered = false;
//                Label.toggleHoverQRInfo($(this));
//            });
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
                    var target = $(e.target);

                    // Si se hace click en un bloque distinto al del menú, entonces lo cerramos
                    // antes de poder pintar
                    if(target.hasClass('block') && target[0] != Floor.current_menu_block[0])
                    {
                        Painter.closeBlockMenu();
                        return;
                    }

                    // Si se hace click dentro del menú..
                    if(target.closest('.menu')[0])
                        return;
                }

                e.preventDefault();

                // Si el bloque ya tiene etiqueta

                Painter.paintLabel($(this));
                Painter.painting_trace = true;
                $e.floor.blocks.on('mouseover', function(){
                    if(Painter.painting_trace)
                        Painter.paintLabel($(this));
                });
            });
            $(document).on('mouseup', function(e){
                if(!Painter.painting_trace)
                {
                    // Cerramos el menú del bloque si está abierto ..
                    if(Floor.current_menu_block && !$(e.target).closest('.menu')[0])
                        Painter.closeBlockMenu();
                    return;
                }

                Painter.painting_trace = false;
            });
        },


        _showPointMenu: function(){
            // Mostramos una caja de texto para poder introducir la descripción del punto
            $e.floor.labeled_blocks.on('contextmenu', function(e){
                Painter.togglePointMenu(e, $(this));
            });
        },


        bind: function()
        {
            var self = this;
            $('#grid *').off();
            self._paint_with_mouse_pressed();
            self._toggleBlockShadow();
            self._toggleLabelInfo();
            self._showUpQRInfo();
            self._setHoveredBlock();
            self._toggleMousePointer();
            if(Floor.data.num_rows )
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
            $e.floor.update.on('click', function(){
                waitingDialog('Actualizando planta..');

                setTimeout(Floor.update, 300);
            });
            $e.floor.clear.on('click', Floor.clear);
        },


        _changeNumRows: function()
        {
            // Campo para nro. de filas
            $e.floor.num_rows.on('change', function(){
                waitingDialog('Redibujando grid..')

                setTimeout(Floor.loadEmpty, 200);
            });
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
