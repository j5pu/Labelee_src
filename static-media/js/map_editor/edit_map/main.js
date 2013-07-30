$(function(){



});

function FloorCtrl($scope, $rootScope)
{
    WaitingDialog.init();

    // mapeamos lo que nos interesa del DOM
    $e.init();

    //cargamos la planta
    Floor.init();
}

function PoisCtrl($scope, $rootScope)
{
    $scope.sync_categories = function(){
        if(user_is_staff)
            $scope.label_categories = labelCategoryResource.readAll();
        else
            $scope.label_categories = labelCategoryResource.readForFloorEdit(Floor.enclosure.id);

        Menu.label_categories = $scope.label_categories;
    };

    $scope.showUsedColors = function(){
        $('.cat_colors').empty();
        $('.cat_colors').append('<h4>' + gettext('Used colors') + ':' + '</h4>');
        $('.cat_colors').each(function(){
            for(var i in $scope.label_categories)
            {
                var category = $scope.label_categories[i];
                $(this).append('<p><span></span>' + category.name + '</p>');
                $(this).find('p').last().find('span').css({
                    'background-color': category.color
                });
            }
        });
    };


    $scope.show_create_category_form = function(){
        $scope.category_name = '';
        $scope.category_color = '';
        $scope.showUsedColors();
        modalDialog = new ModalDialog('#category_create');
        modalDialog.open();
    };


    $scope.show_update_category_form = function(){
        $scope.new_category_name = $scope.selected_category.name;
        $scope.new_category_color = $scope.selected_category.color;
        $scope.showUsedColors();
        modalDialog = new ModalDialog('#category_update');
        modalDialog.open();
    };

    $scope.closeModalDialog = function(){
        modalDialog.close();
    };


    $scope.createCategory = function()
    {
        if($('#input_color_create').css('background-color') == "rgba(0, 0, 0, 0)")
        {
            alert(gettext('Invalid color'));
            return;
        }

        if(!$scope.category_name || $scope.category_name.length < 4)
        {
            alert(gettext('You must specify a name with at least 4 characters'));
            return;
        }


        var data = {
            name: $scope.category_name,
            color: $scope.category_color
        };
        if(!user_is_staff)
            data.enclosure = enclosureResource.api1_url + Floor.enclosure.id + '/';



        var cat_created = labelCategoryResource.create(data);

        $scope.sync_categories();

        // La estructura de la categoría creada, devuelta por el servidor,
        // (cat_created) es distinta a la de la categoría del selector de categorías, por lo
        // tenemos que tomar aquella del selector cuyo id sea igual al de la
        // devuelta por el servidor para así setear el selector con la nueva
        $scope.selected_category = getFromList($scope.label_categories, cat_created.id);
        modalDialog.close();
    };


    $scope.updateCategory = function()
    {
        if($('#input_color_update').css('background-color') == "rgba(0, 0, 0, 0)")
        {
            alert(gettext('Invalid color'));
            return;
        }

        if(!$scope.category_name || $scope.category_name.length < 4)
        {
            alert(gettext('You must specify a name with at least 4 characters'));
            return;
        }

        var data = {
            name: $scope.new_category_name,
            color: $scope.new_category_color
        };

        var cat_updated = labelCategoryResource.update(data, $scope.selected_category.id);

        $scope.sync_categories();
        $scope.selected_category = getFromList($scope.label_categories, cat_updated.id);
        modalDialog.close();
    };


    $scope.delCategory = function()
    {
        labelCategoryResource.del(
            $scope.selected_category.id,
            gettext('Are you sure you want to remove this category?'),
            function(){
                $scope.sync_categories();

                WaitingDialog.open(
                    gettext('Redrawing grid') + '..',
                    function(){
                        Floor.loadGrid();
                        Painter.label = null;
                    }
                );

                modalDialog.close();
            }
        );
    };



    $scope.show_create_label_form = function(){
        $scope.label_name = '';
        modalDialog = new ModalDialog('#label_create');
        modalDialog.open();
    };


    $scope.show_update_label_form = function(){
        $scope.new_label_name = $scope.selected_label.name;
        modalDialog = new ModalDialog('#label_update');
        modalDialog.open();
    };


    $scope.createLabel = function()
    {
        var data = {
            name: $scope.label_name,
            category: labelCategoryResource.api1_url + $scope.selected_category.id + '/'
        };
        var label_created = labelResource.create(data);

        $scope.sync_labels(label_created);
    };


    $scope.updateLabel = function()
    {
        var data = {
            name: $scope.new_label_name,
            category: labelCategoryResource.api1_url + $scope.selected_category.id + '/'
        };
        var label_updated = labelResource.update(data, $scope.selected_label.id);

        $scope.sync_labels(label_updated);
    };


    $scope.delLabel = function()
    {
        labelResource.del(
            $scope.selected_label.id,
            gettext('Are you sure you want to remove this label?'),
            function(){
                $scope.sync_labels();
                Floor.reloading = true;
                WaitingDialog.open(
                    gettext('Redrawing grid') + '..',
                    function(){
                        Floor.loadGrid();
                        Painter.label = null;
                    }
                );

                modalDialog.close();
            }
        );
    };


    $scope.sync_labels = function(new_label)
    {
        var cat = $scope.selected_category;
        $scope.sync_categories();
        $scope.selected_category = getFromList($scope.label_categories, cat.id);

        // Según se venga de crear/editar o eliminar..
        if(new_label)
            $scope.selected_label = getFromList($scope.selected_category.labels, new_label.id);
        else
            $scope.selected_label = null;

        modalDialog.close();
    };



    //
    // MAIN
    $scope.sync_categories();

    //
    // WATCHERS
    $scope.$watch('selected_category', function(){
        $scope.can_edit_category = $scope.selected_category &&
            (user_is_staff || $scope.selected_category.enclosure);

        if(!$scope.selected_category)
            return;

        Painter.label_category = $scope.selected_category;
        Menu.labels = $scope.selected_category.labels;
        Painter.label = null;

        // Si no, en caso de haber elegido la categoría 'Bloqueantes' se selecciona muro
        if(LabelCategory.isBlocker(Painter.label_category))
        {
            $scope.selected_label = Menu.getWallLabel();
            Painter.label = $scope.selected_label;
        }


    });
    $scope.$watch('selected_label', function(){
        $scope.can_edit_label = $scope.selected_label && $scope.can_edit_category;
        Painter.label = $scope.selected_label;
    });
}


function getFromList(list, element_id)
{
    // Saca de la lista el elemento con la id dada.
    return $.grep(list, function(n, i){
        return n.id == element_id
    })[0];
}
