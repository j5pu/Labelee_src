
var LabelCategory = {

    ids:{
        blocker: 1,
        connector: 3
    },

    isBlocker: function(label_category)
    {
        // Nos indica si la categoría es bloqueante

        var self = this;
        var cat_id;

        if(label_category)
        {
            cat_id = label_category.id;
            cat_name = label_category.name;
        }
        else if(Painter.label.category)
        {
            cat_id = Painter.label.category.id;
            cat_name = Painter.label.category.name;
        }

        // Nos aseguramos por el id o el nombre que es una bloqueante
        return cat_id == self.ids.blocker ||
            cat_name.toUpperCase() == 'BLOQUEANTES' ||
            cat_name.toUpperCase() == 'BLOCKERS';
    },


    isConnector: function(label_category)
    {
        // Nos indica si la categoría es arista
        if(!label_category.name_es)
            return false;

        return label_category.name_es.toUpperCase() === 'ARISTAS';
    },


    isGeneric: function(label_category)
    {
        return !label_category.enclosure;
    }
};



var Label = {

    // Para indicar que por defecto no se seleccione el muro al seleccionar la categoría 'Bloqueantes'
    skip_wall_by_default: false,
    // Para indicar si su información se muestra por encima de las demás
    info_hovered: false,

    show_form_new: function(ev){
        ev.preventDefault();
        $e.floor.poi_menu.hide(400);
        $e.label.form.root_node.show();
        $e.label.form.new_node.show(400);
        $e.label.form.edit_node.hide();

        var category = $e.label_category_selector.val();
        $e.label.form.category.val(category);
    },


    show_form_edit: function(ev){
        ev.preventDefault();
        $e.floor.poi_menu.hide(400);
        $e.label.form.root_node.show();
        $e.label.form.edit_node.show(400);
        $e.label.form.new_node.hide();

        var category = $e.label_category_selector.val();
        $e.label.form.category.val(category);
        $e.label.form.name.val(Painter.label.name);
    },


    create: function()
    {
        var category_id = $e.label.form.category.val();
        var data = {
            'name': $e.label.form.name.first().val(),
            'category': labelResource.api1_url + category_id + '/'
        };

        Menu.label_created = labelResource.create(data);

        Label._hide_form();
    },


    _hide_form: function()
    {
        // Limpiamos formulario
        $e.label.form.name.val('');

        // Recargamos selector de etiqueta y dejamos elegida la nueva
        Menu.setLabelSelector();

        // Escondemos el formulario para crear la etiqueta
        $e.label.form.root_node.hide(400);
        $e.floor.poi_menu.show(400);
    },


    update: function()
    {
        // Hay dos input para el nombre de la etiqueta, uno para crear y otro para editar
        var category_id = $e.label.form.category.val();
        var data = {
            'name': $e.label.form.name.last().val(),
            'category': labelResource.api1_url + category_id + '/'
        };

        Menu.label_updated = labelResource.update(data, Painter.label.id);

        Label._hide_form();
    },


    delete: function(ev)
    {
        ev.preventDefault();
        var label_id = $e.label.selector.val();
        var confirm_msg = gettext('Delete label') + ' ' + Painter.label.name + '? ' +
            gettext('(All their points will be deleted too)');
        // Elimina en cascada: etiqueta -> punto
        labelResource.del(
            label_id,
            confirm_msg,
            function(server_response){
                Menu.setLabelSelector();

                Floor.reloading = true;
                WaitingDialog.open(
                    gettext('Redrawing grid') + '..',
                    Floor.loadGrid
                );
            }
        );
    },


    isWall: function(label)
    {
        if(!label || !label.name)
            return false;

        return label.name.toUpperCase() === 'MURO' ||
            label.name.toUpperCase() === 'WALL' ||
            false;
    },


    toggleHoverQRInfo: function(block)
    {
//        var label_pos = block.find('.label_pos');
//        var qr_info = block.find('.qr_info');
//
//        var i1 = label_pos.css('z-index');
//        var i2 = qr_info.css('z-index');
//
//        if(Label.info_hovered)
//        {
//            label_pos.css({'z-index': i1+1});
//            qr_info.css({'z-index': i2+1});
//        }
//        else
//        {
//            label_pos.css({'z-index': i1-1});
//            qr_info.css({'z-index': i2-1});
//        }
    }
};



//
// MENU
//

var Menu = {
    waiting_response: false,

    init: function(){
        Menu.labels = labelResource.readGrouped();
        Menu._setSelectors();
        Menu.setQrList();
        Menu.setPointStats();

        if($e.floor.num_rows.val() == Floor.data.num_rows)
            $e.floor.change_num_rows.attr('disabled', 'disabled');
//        Events.menu.bind();
    },


    showQR: function(ev)
    {
        ev.preventDefault();
        var item = $(this);
        var row = item.data('point-row');
        var col = item.data('point-col');

        var block = Floor.findBlock(row, col);
        block.find('.qr_info').show();
        block.find('.label_pos').show();

        var offset_x = Floor.block_width * row;
        var offset_y = Floor.block_height * col;
        window.scrollTo(offset_x, offset_y);
    },


    setPointStats: function()
    {
        if(!Floor.hasPoints())
        {
            Floor.point_count.to_save = 0;
            Floor.point_count.saved = 0;
            Floor.point_count.to_delete = 0;
            Floor.point_count.total = 0;
        }
        $e.point_count.to_save.html(Floor.point_count.to_save);
        $e.point_count.saved.html(Floor.point_count.saved);
        $e.point_count.to_delete.html(Floor.point_count.to_delete);
        $e.point_count.total.html(Floor.point_count.total);
    },


    _setSelectors: function()
    {
        // Rellena el selector de categoría de etiqueta y deja el selector para label
        // sólo con la opción 'selecc. etiqueta', ya que de momento no se ha
        // elegido una categoría para la que mostrar sus posibles etiquetas
        this.setCategorySelector();
        this.setLabelSelector();
    },


    setQrList: function()
    {

        // Rellena la lista de QRs creados para la planta

        var list = $e.qr.list;

        if(list)
            list.empty();

        Menu.qr_list = new Resource('qr-code').readAllFiltered('?point__floor__id=' + Floor.data.id);
        for(var i in Menu.qr_list)
        {
            var qr = Menu.qr_list[i];
            var url_to_code = location.origin + '/map/origin/' + qr.code;
            list.append(
                '<li>' +
                    '<a href="#" class="point"' +
                    'data-point-row="' + qr.point.row + '"' +
                    'data-point-col="' + qr.point.col + '">' + qr.code + '</a>' + ' - ' +
                    '<a href="javascript:void(window.open(\''+ location.origin +'/api-2/url_to_qr/' + url_to_code +
                    '\',\'mywindowtitle\',\'width=250,height=250\'))">Preview</a>' + ' - ' +
                    '<a href="'+location.origin+'/api-2/url_to_qr/' + url_to_code + '" download="' + qr.code + '">' +
                    ' Download ' + '</a>' +
                '</li>'
            );
        }

        Menu.toggleQRs();
    },


    _fillConnectionsList: function()
    {
        // Rellena la lista de aristas para la planta
    },


    setCategorySelector: function()
    {
        // Recogemos de la B.D. todos los LabelCategory para el recinto del plano
        // y los metemos en el selector

        var prompt_opt = gettext('Select category');
        if(user_is_staff)
            Menu.categories = labelCategoryResource.readAll();
        else
            Menu.categories = labelCategoryResource.readForFloorEdit(Floor.enclosure.id);

        setSelector($e.label_category_selector, Menu.categories, prompt_opt);
        setSelector($e.label.form.category, Menu.categories, prompt_opt);
    },


    setLabelSelector: function()
    {
        var category_id = $e.label_category_selector.val();

        if(!category_id)
        {
            setSelector($e.label.selector, null, gettext('Select label'));
            $e.label.manage.root_node.hide();
            return;
        }

        Painter.label_category = labelCategoryResource.read(category_id);
        Menu.labels = labelResource.readAllFiltered('?category__id=' + category_id);

        setSelector($e.label.selector, Menu.labels, gettext('Select label'));

        if(Menu.label_created)
        {
            $e.label.selector.val(Menu.label_created.id);
            Menu.label_created = null;
        }
        else if(Menu.label_updated)
        {
            $e.label.selector.val(Menu.label_updated.id);
            Menu.label_updated = null;
        }
        else if(Painter.label)
            $e.label.selector.val(Painter.label.id);


        // Si no, en caso de haber elegido la categoría 'Bloqueantes' se selecciona muro
        if(LabelCategory.isBlocker(Painter.label_category))
            for(var i in Menu.labels)
            {
                var label = Menu.labels[i];
                if(Label.isWall(label))
                {
                    $e.label.selector.val(label.id);
                    break;
                }
            }

        // Se mostrará new/edit/delete sólo para etiquetas de categorías no genéricas,
        // a menos que seamos staff
        if(!LabelCategory.isGeneric(Painter.label_category))
            $e.label.manage.root_node.show();
        else
            if(user_is_staff)
                $e.label.manage.root_node.show();
            else
                $e.label.manage.root_node.hide();

        Painter.setLabel();
    },


    toggleBorders: function()
    {
        // Muestra o no los bordes del bloque según esté o no marcado el checkbox 'ver rejilla'
        if($e.floor.toggle_border.is(':checked'))
        {
            $e.floor.blocks.css({
                'border': '1px solid black',
                'height': $e.floor.blocks.height() - 2 + 'px',
                'width': $e.floor.blocks.width() - 2 + 'px'
            });
        }
        else
        {
            $e.floor.blocks.css({
                'border': '',
                'height': Floor.block_height_initial + 'px',
                'width': Floor.block_width_initial + 'px'
            });
        }
    },


    toggleEraseMode: function()
    {
        Painter.erase_mode = $e.floor.toggle_erase_mode.is(':checked');
    },


    toggleQRs: function()
    {

//        var not_qr_blocks = $e.floor.blocks.find(':not(.qr_info)').parent();
//        var qr_infos = $e.floor.blocks.find('.qr_info');


        if(Floor.loading)
            return;

        var checkbox = $e.qr.toggle;
        var checkbox_is_checked = $e.qr.toggle.is(':checked');

        checkbox.attr('checked', checkbox_is_checked);

        if(checkbox_is_checked &&
            !confirm('Se perderán los puntos que no se han guardado. ¿Desea continuar?'))
            return;

        Floor.show_only_qrs = checkbox_is_checked;

        Floor.reloading = true;

        Floor.loadGrid();
    }
};
