
var LabelCategory = {

    ids:{
        blocker: 1,
        connector: 3
    },

    show_form_new: function(ev)
    {
        ev.preventDefault();
        $e.floor.poi_menu.hide(400);
        $e.label.form.root_node.hide(400);
        $e.category.form.root_node.show(400);
    },


    show_form_update: function(){
        // implementar
    },


    create: function()
    {
        //
        // 1: Creamos el registro en B.D.
        var data = {
            'name': $e.category.form.name.val(),
            'color': $e.category.form.color.val()
        };

        Menu.category_created = new LabelCategoryResource().create(data);

        // 2. Si se ha elegido una imágen la subimos
        var img_form = $(this).closest('form');

        if(!img_form.find('input[name=img]').val())
        {
            LabelCategory._post_create();
            return;
        }

        Menu.sending_img = true;

        new LabelCategoryResource().addImg(
            img_form,
            Menu.category_created.id,
            function(server_response){
                LabelCategory._post_create();
                Menu.sending_img = false;
            }
        );
    },


    // Una vez la categoría está creada se hace esto también:
    _post_create: function()
    {
        $e.category.form.name.val('');
        $e.category.form.img.val('');
        $e.category.form.color.val('');
        $e.category.form.root_node.hide(400);
        $e.floor.poi_menu.show(400);

        // volvemos a rellenar el selector con el nuevo dato
        Menu.setCategorySelector();

        Menu.category_created = null;
    },


    update: function()
    {

    },


    delete: function(ev)
    {
        ev.preventDefault();
        var category_id = $e.category.selector.val();
        var confirm_msg = gettext('Delete category? (all its labels will be removed)');

        // Eliminación en cascada: categoría -> etiqueta -> punto
        new LabelCategoryResource().del(category_id, confirm_msg);

        Menu.setCategorySelector();

        // Recargamos el grid para evitar que la próxima vez que guardemos
        // intente guardar puntos de una etiqueta que no existe
        Floor.reloading = true;
        Floor.loadGrid();
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
        $e.label.form.root_node.show(400);
        $e.category.form.root_node.hide(400);
        var category = $e.category.selector.val();
        if(category)
            $e.label.form.category.val(category);
    },


    show_form_update: function(){
        // implementar
    },


    create: function()
    {
        //
        // 1. Creamos el registro en la BD
        var category_id = $e.label.form.category.val();
        var data = {
            'name': $e.label.form.name.val(),
            'category': '/api/v1/label-category/' + category_id + '/'
        };

        var label_resource = new Resource('label');
        Menu.label_created = label_resource.create(data);

        //
        // 2. Si se indicó una imágen la subimos..
        var img_form = $(this).closest('form');

        if(!img_form.find('input[name=img]').val())
        {
            Label._post_create();
            return;
        }

        Menu.sending_img = true;

        label_resource.addImg(
            img_form,
            Menu.label_created.id,
            function(server_response){
                // Una vez que se sube la imágen al servidor..
                Label._post_create();
                Menu.sending_img = false;
            }
        );
    },


    _post_create: function()
    {
        // Limpiamos formulario
        $e.label.form.name.val('');
        $e.label.form.img.val('');

        // Recargamos selector de etiqueta y dejamos elegida la nueva
        Menu.setLabelSelector();

        // Escondemos el formulario para crear la etiqueta
        $e.label.form.root_node.hide(400);
        $e.floor.poi_menu.show(400);

        Menu.label_created = null;
    },


    update: function()
    {

    },


    delete: function(ev)
    {
        ev.preventDefault();
        var label_id = $e.label.selector.val();
        var confirm_msg = gettext('Delete label?');
        // Elimina en cascada: etiqueta -> punto
        new LabelResource().del(label_id, confirm_msg);
        Menu.setLabelSelector();

        Floor.reloading = true;
        Floor.loadGrid();
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
    sending_img: false,

    init: function(){
        Menu.labels = new LabelResource().readGrouped();
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
            list.append(
                '<li>' +
                    '<a href="#" ' +
                    'data-point-row="' + qr.point.row + '"' +
                    'data-point-col="' + qr.point.col + '">' + qr.code + '</a>' +
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
        // Recogemos de la B.D. todos los LabelCategory y los metemos en el selector

        Menu.categories = new LabelCategoryResource().readAll();
        var prompt_opt = gettext('Select category');
        setSelector($e.category.selector, Menu.categories, prompt_opt);
        setSelector($e.label.form.category, Menu.categories, prompt_opt);

        // Si se viene de crear una categoría se elije esa
        if(Menu.category_created)
        {
            $e.category.selector.val(Menu.category_created.id);
            $e.label.form.category.val(Menu.category_created.id);
        }

        Menu.setLabelSelector();
    },


    setLabelSelector: function()
    {
        var category_id = $e.category.selector.val();

        if(!category_id)
        {
            setSelector($e.label.selector, null, gettext('Select label'));
            return;
        }

        Painter.label_category = new LabelCategoryResource().read(category_id);
        Menu.labels = new LabelResource().readAllFiltered('?category__id=' + category_id);

        setSelector($e.label.selector, Menu.labels, gettext('Select label'));

        // Si se viene de crear una etiqueta se elije esa
        if(Menu.label_created)
            $e.label.selector.val(Menu.label_created.id);

        // Si no, en caso de haber elegido la categoría 'Bloqueantes' se selecciona muro
        else if(LabelCategory.isBlocker(Painter.label_category))
            for(var i in Menu.labels)
            {
                var label = Menu.labels[i];
                if(Label.isWall(label))
                {
                    $e.label.selector.val(label.id);
                    break;
                }
            }

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
    },

    // Inits jQuery sliders
    _initSliders: function()
    {
        $e.floor.slider_canny.slider({
            range: true,
            min: 0,
            max: 1000,
            values: [100, 300]
        });

        $e.floor.slider_threshold.slider({
            min: 0,
            max: 500,
            value: 50
        });

        $e.floor.slider_line_length.slider({
            min: 0,
            max: 200,
            value: 10
        });

        $e.floor.slider_gap.slider({
            min: 0,
            max: 100,
            value: 10
        });

    },

    // Sets jQuery tooltips
    _initTooltips: function()
    {
        $( document ).tooltip();
    }
};
