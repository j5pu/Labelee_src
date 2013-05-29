
var Events = {

    grid: {
        _toggleBlockShadow: function()
        {
            // Cambiamos el evento 'mouseover' del elemento para que haga esto:

            // Si el bloque contiene un qr entonces no hacemos nada de esto
            if(Painter.current_hovered_block && Painter.current_hovered_block.data('qr'))
                return;

            $e.floor.blocks.on('mouseover', function(){
                $(this).css({'box-shadow': '1px 1px 10px'});
            });
            $e.floor.blocks.on('mouseleave', function(){
                $(this).css({'box-shadow': ''});
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


        _removeLabel: function()
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
            $e.floor.blocks.on('mousedown', function(e){
                e.preventDefault();
                Painter.paintLabel($(this));
                $e.floor.blocks.on('mouseover', function(){
                    Painter.painting_trace = true;
                    Painter.paintLabel($(this));
                });
            });
            $e.floor.blocks.on('mouseup', function(){
                $e.floor.blocks.off('mouseover');
                Painter.painting_trace = false;
                Events.grid.bind();
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
            self._assign_qr_by_right_click();
            self._paint_with_key_pressed();
            self._paint_with_mouse_pressed();
            self._removeLabel();
            self._toggleBlockShadow();
            self._toggleLabelInfo();
            self._showUpQRInfo();
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


        bind: function()
        {
            var self = this;
            self._assignQR();
            self._toggleLabels();
        }
    },


    bindAll: function(){
        var self = this;
        self.grid.bind();
        self.menu.bind();
        self.shortcuts.bind();
    }
};
