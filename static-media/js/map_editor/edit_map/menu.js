
var LabelCategory = {

    show_form_new: function()
    {
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

        var labelCateg = new LabelCategoryResource().create(data);

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
            labelCateg.id,
            function(server_response){
                LabelCategory._post_create();
                Menu.sending_img = false;
            }
        );

        $e.category.selector.val(labelCateg.id);
    },


    // Una vez la categoría está creada se hace esto también:
    _post_create: function()
    {
        Menu.clearFormCateg();
    },


    update: function()
    {

    },


    delete: function()
    {
        var category_id = $e.category.selector.val();
        var confirm_msg = '¿Eliminar categoría? (se eliminarán todas sus etiquetas)';
        new LabelCategoryResource().del(category_id, confirm_msg);
        Menu.fillCategorySelector();
    }
};



var Label = {

    show_form_new: function(){
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
        var label = label_resource.create(data);

        //
        // 2. Subimos su imágen
        var img_form = $(this).closest('form');

        if(!img_form.find('input[name=img]').val())
        {
            Label._post_create(label);
            return;
        }

        Menu.sending_img = true;

        label_resource.addImg(
            img_form,
            label.id,
            function(server_response){
                // Una vez que se sube la imágen al servidor..
                Label._post_create();
                Menu.sending_img = false;
            }
        );
    },


    _post_create: function(label)
    {
        // Limpiamos formulario
        $e.label.form.name.val('');
        $e.label.form.img.val('');

        // Recargamos selector de etiqueta y dejamos elegida la nueva
        Menu.fillLabelSelector();
        $e.label.selector.val(label);

        // Escondemos el formulario para crear la etiqueta
        $e.label.form.root_node.hide(400);
    },


    update: function()
    {

    },


    delete: function()
    {
        var label_id = $e.label.selector.val();
        var confirm_msg = '¿Eliminar etiqueta?';
        new LabelResource().del(label_id, confirm_msg);
        Menu.fillLabelSelector();
    }
};



//
// MENU
//

var Menu = {
    sending_img: false,

    init: function(){
       this._fillSelectors();
       Events.bindMenu();
    },


    _fillSelectors: function()
    {
        this.fillCategorySelector();
        this.fillLabelSelector();
    },


    fillCategorySelector: function()
    {
        // Recogemos de la B.D. todos los LabelCategory y los metemos en el selector

        var categories = new LabelCategoryResource().readAll();
        var prompt_opt = 'Selecc. categoría';
        setSelector($e.category.selector, categories, prompt_opt);
        setSelector($e.label.form.category, categories, prompt_opt);
    },


    fillLabelSelector: function()
    {
        var category_id = $e.category.selector.val();

        if(category_id)
            var labels = new LabelResource().readAllFiltered('?category__id=' + category_id);

        setSelector($e.label.selector, labels, 'Selecc. etiqueta');
    },


    clearFormCateg: function()
    {
        $e.category.form.name.val('');
        $e.category.form.img.val('');

        $e.category.form.root_node.hide(400);

        // volvemos a rellenar el selector con el nuevo dato
        Menu.fillCategorySelector();
    },


    toggleBlockBorders: function()
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
    }
};
