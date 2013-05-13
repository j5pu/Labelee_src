
var Events = {

    _bind_showLabelImg: function()
    {
        // Mostrar imágen de la etiqueta al sólo pasar el ratón sobre el bloque
        $e.floor.blocks.on('mouseover', function(){
            if(Painter.painting_trace)
                return;
            $(this).find('img').show();
        });
        $e.floor.blocks.on('mouseleave', function(){
            if(Painter.painting_trace)
                return;
            $(this).find('img').hide();
        });
    },
    
    bindGrid: function()
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
            Events._bind_showLabelImg();
            Painter.painting_trace = false;
        },'keyup');

        //
        // Pintar etiquetas dejando pulsado el botón izquierdo del ratón mientras lo movemos
        $e.floor.blocks.on('mousedown', function(e){
            e.preventDefault();
            Painter.paintLabel($(this));
            $e.floor.blocks.on('mouseover', function(){
                Painter.paintLabel($(this));
            });
        });
        $e.floor.blocks.on('mouseup', function(){
            $e.floor.blocks.off('mouseover');
        });

        Events._bind_showLabelImg();

        //
        // Borrar etiquetas pulsando ALT
        Mousetrap.bind('alt', function(e){
            e.preventDefault();
            $e.floor.blocks.on('mousemove', function(){
                $e.floor.blocks.off('mousemove');
                Painter.clearBlock($(this));
            });
            $e.floor.blocks.on('mouseover', function(e){
                e.preventDefault();
                Painter.clearBlock($(this));
            });
        });

        Mousetrap.bind('alt', function(e){
            e.preventDefault();
            $e.floor.blocks.off('mouseover');
        },'keyup');
    },

    
    bindMenu: function()
    {
        // Guardar/limpiar planta
        $e.floor.update.on('click', Floor.update);
        $e.floor.clear.on('click', Floor.clear);

        // Campo para nro. de filas
        $e.floor.num_rows.on('change', Floor.loadEmpty);

        // Ver rejilla
        $e.floor.toggle_border.on('change', Menu.toggleBlockBorders);

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





