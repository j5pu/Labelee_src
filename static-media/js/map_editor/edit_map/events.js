
var Events = {

    _showLabelImg: function()
    {
        // Mostrar imágen de la etiqueta al sólo pasar el ratón sobre el bloque
        $e.floor.blocks.on('mouseover', Painter.showLabelInfo);
        $e.floor.blocks.on('mouseleave', Painter.hideLabelInfo);
    },


    _toggle_qrs: function()
    {
        $e.qr.highlight.on('change', Menu.toggleQRs);
    },


    _assign_qr_by_key: function()
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


    _assign_qr_by_right_click: function()
    {
        $e.floor.blocks.on('contextmenu', function(e){
            e.preventDefault();
            Painter.assignQR();
            $e.floor.blocks.off('mouseover');
            Events.bindGrid();
        });
    },

    _remove_label: function()
    {
        //
        // Borrar etiquetas pulsando ALT
        Mousetrap.bind('alt', function(e){
            e.preventDefault();
            $e.floor.blocks.on('mousemove', function(){
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
            Events.bindGrid();
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
            Painter.painting_trace = true;
            Events.bindGrid();
        });
    },


    _paint_with_key_pressed: function()
    {
        //
        // Pintar etiquetas dejando pulsado cmd o ctrl y pasando el ratón por el grid
        Mousetrap.bind(['command', 'ctrl'], function(){
            Painter.painting_trace = true;
            $e.floor.blocks.on('mousemove', function(){
                $e.floor.blocks.off('mousemove');
                Painter.paintLabel($(this));
            });
            $e.floor.blocks.on('mouseover', function(e){
                e.preventDefault();
                Painter.paintLabel($(this));
            });
        });
        Mousetrap.bind(['command', 'ctrl'], function(){
            $e.floor.blocks.off('mouseover');
            $e.floor.blocks.off('mousemove');
            Events.bindGrid();
            Painter.painting_trace = false;
        },'keyup');
    },

    
    bindGrid: function()
    {
        Events._paint_with_key_pressed();
//        Events._paint_with_mouse_pressed();
        Events._remove_label();
        Events._showLabelImg();
        Events._assign_qr_by_key();
        Events._assign_qr_by_right_click();
    },

    
    bindMenu: function()
    {
        // Guardar/limpiar planta
        $e.floor.update.on('click', Floor.update);
        $e.floor.clear.on('click', Floor.clear);

        // Campo para nro. de filas
        $e.floor.num_rows.on('change', Floor.drawEmpty);

        // Ver rejilla
        $e.floor.toggle_border.on('change', Menu.toggleBorders);

        // Selectores
        $e.category.selector.on('change', Menu.fillLabelSelector);
        $e.label.selector.on('change', Painter.setLabel);

        // LABEL
        $e.label.new.on('click', Label.show_form_new);
        $e.label.edit.on('click', Label.update);
        $e.label.delete.on('click', Label.delete);
        $e.label.form.create.on('click', Label.create);

        // LABEL_CATEGORY
        $e.category.new.on('click', LabelCategory.show_form_new);
        $e.category.edit.on('click', LabelCategory.update);
        $e.category.delete.on('click', LabelCategory.delete);
        $e.category.form.create.on('click', LabelCategory.create);

        Events._toggle_qrs();
    },


    bindAll: function(){
        this.bindGrid();
        this.bindMenu();
    },


    setBlockShadow: function()
    {
        // Cambiamos el evento 'mouseover' del elemento para que haga esto:

        $e.floor.blocks.on('mouseover', function(){
            $(this).css({'box-shadow': '1px 1px 7px'});
        });
    }
};





