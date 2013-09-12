var modalDialog;

//$(function() {
//    I18n.selectLang(lang_code);
//});


function EnclosureListCtrl($scope, $rootScope, UserService, FormService)
{
	$scope.enclosures = enclosureResource.getForManagerIndex();

    // Orden en que aparecerán los recintos
    $scope.reverse = false;

    $scope.show_create_enclosure_form = function($event) {
        $($event.target).blur();
        $rootScope.$broadcast('show_create_enclosure_form');
    };

    $scope.$on('sync_enclosureList', function() {
        $scope.enclosures = enclosureResource.getForManagerIndex();
        modalDialog.close();
    });
}


function EnclosureCtrl($scope, $rootScope, $element)
{
    $scope.hovered = false;

    $scope.show_edit_form = function($event)
    {
        $($event.target).blur();
        $rootScope.$broadcast('show_edit_form', $scope.enclosure);
    };

    $scope.calculateRoutes = function()
    {
        if(confirm(gettext('Previous routes will be removed for this enclosure. Do you want to continue?')))
            enclosureResource.calculateRoutes($scope.enclosure.id);
    };

    $scope.refreshCache = function()
    {
        enclosureResource.refreshCache($scope.enclosure.id);
    };

    $scope.$on('sync_enclosure', function(ev, enclosure) {
        if($scope.enclosure.id == enclosure.id)
        {
            $scope.enclosure = enclosureResource.getForManagerIndex($scope.enclosure.id);
            modalDialog.close();
        }
    });
}

function FloorListCtrl($scope, $rootScope)
{
	$scope.waiting_response = false;
    $scope.hovered = false;
    $scope.desc = true;

    $scope.show_create_floor_form = function($event) {
        $($event.target).blur();
        $rootScope.$broadcast('show_create_floor_form', $scope.enclosure);
    };
}

function FloorCtrl($scope, $rootScope, $element, UrlService)
{
    $scope.show_edit_floor_form = function($event) {
        $($event.target).blur();
        $rootScope.$broadcast('show_edit_floor_form', $scope.floor, $scope.enclosure);
    };
}


function CategoryListCtrl($scope, $rootScope)
{
    $scope.show_create_category_form = function() {
        $rootScope.$broadcast('show_create_category_form', $scope.enclosure);
    };
}

function CategoryCtrl($scope, $rootScope)
{
    $scope.show_edit_category_form = function() {
        $rootScope.$broadcast('show_edit_category_form', $scope.category, $scope.enclosure);
    };
}


function EnclosureFormsCtrl($scope, $rootScope, $element)
{
    $scope.create = function() {
        var data = {
            name: $scope.enclosure_name,
            owner: userResource.api1_url + user_id + '/',
            twitter_account : removeArroba($scope.twitter_account),
            url_enclosure : $scope.url_enclosure,
            url_dashboard : $scope.url_dashboard
        };
        var enclosure_created =  enclosureResource.create(data);

        //
        // Si se ha puesto una nueva imágen la subimos, eliminando la anterior
        var img = $($element).find('input[name="logo"]');
        if(img.val() !== '')
        {
            var img_form = $($element).find('form');

            $scope.waiting_response = true;

            enclosureResource.addImg(
                    img_form,
                    enclosure_created.id,
                    function(server_response){
                        // Una vez se sube la imágen se limpia el formulario y se actualiza
                        // la lista de plantas para el recinto
                        img_form.find('input[name="logo"]').val('');
                        img_form.find('.file-input-name').remove();
                        $scope.waiting_response = false;
                        $rootScope.$broadcast('sync_enclosureList', $scope.enclosure);
                    }
            );
        }
        else
            $rootScope.$broadcast('sync_enclosureList', $scope.enclosure);
    };



    $scope.update = function(enclosure) {
        var img = $($element).find('input[name="logo"]');
        var data = {
            name : $scope.enclosure_name,
            twitter_account : removeArroba($scope.twitter_account),
            url_enclosure : $scope.url_enclosure,
            url_dashboard : $scope.url_dashboard
        };
        enclosureResource.update(data, $scope.enclosure.id);

        // Si se ha puesto una nueva imágen la subimos, eliminando la anterior
        if(img.val() !== '')
        {
            var img_form = $($element).find('form');

            $scope.waiting_response = true;

            enclosureResource.addImg(
                    img_form,
                    $scope.enclosure.id,
                    function(server_response){
                        // Una vez se sube la imágen se limpia el formulario y se actualiza
                        // la lista de plantas para el recinto
                        img_form.find('input[name="logo"]').val('');
                        img_form.find('.file-input-name').remove();
                        $scope.waiting_response = false;
                        $rootScope.$broadcast('sync_enclosure', $scope.enclosure);
                    }
            );
        }
        else
            $rootScope.$broadcast('sync_enclosure', $scope.enclosure);
    };


    $scope.del = function() {
        var confirm_msg = gettext('Are you sure you want to remove this enclosure? (this will erase all their floors)');

        enclosureResource.del(
            $scope.enclosure.id,
            confirm_msg,
            function(){
                $rootScope.$broadcast('sync_enclosureList', $scope.enclosure);
            }
        );
    };


    $scope.$on('show_create_enclosure_form', function() {
        $scope.enclosure_name = '';
        $scope.twitter_account = '';
        $scope.url_enclosure = '';
        $scope.url_dashboard = '';
        $scope.logo = '';

        modalDialog = new ModalDialog('#enc_create');
        modalDialog.open();
    });


    $scope.$on('show_edit_form', function(ev, enclosure) {
        // Abre el diálogo con el formulario para la edición del recinto
        $scope.enclosure = enclosure;
        $scope.enclosure_name = enclosure.name;
        $scope.twitter_account = enclosure.twitter_account;
        $scope.logo = enclosure.logo;
        $scope.url_enclosure = enclosure.url_enclosure;
        $scope.url_dashboard = enclosure.url_dashboard;
        modalDialog = new ModalDialog('#enc_edit');
        modalDialog.open();
    });
}

function FloorFormsCtrl($scope, $rootScope, $element)
{
    $scope.create = function() {
        var img = $($element).find('input[name="img"]');
        if(!img.val())
        {
            alert(gettext('You must specify the floor image too'));
            return;
        }

        //
        // 1: Creamos el registro en B.D.
        var floor_data = {
            name : $scope.floor_name,
            floor_number : parseInt($scope.floor_number),
            enclosure : enclosureResource.api1_url + $scope.enclosure.id + '/'
        };

        var new_floor = floorResource.create(floor_data);

        //
        // 2: Una vez creado subimos la imágen para el nuevo mapa creado
        var img_form = $($element).find('form').first();

        $scope.waiting_response = true;

        floorResource.addImg(
            img_form,
            new_floor.id,
            function(server_response){
                // Una vez se sube la imágen se limpia el formulario y se actualiza
                // la lista de mapas para el lugar
                $scope.floor_name = '';
                $scope.floor_number = '';
                img_form.find('input[name="img"]').val('');
                img_form.find('.file-input-name').remove();
                $scope.waiting_response = false;

                // Anunciamos que se ha creado la planta
                $rootScope.$broadcast('sync_enclosure', $scope.enclosure);
            }
        );
    };


    $scope.update = function() {
        var img_form = $($element).find('form');
        var img = $($element).find('input[name="img"]');
        var imgB = $($element).find('input[name="img_b"]');

        var floor_data = {
            name : $scope.floor_name,
            floor_number : $scope.floor_number
        };

        floorResource.update(floor_data, $scope.floor.id);

        // Si se ha puesto una nueva imágen la subimos, eliminando la anterior
        if(img.val() !== '' || imgB.val() !== '')
        {
            $scope.waiting_response = true;

            floorResource.addImg(
                img_form,
                $scope.floor.id,
                function(server_response){
                    // Una vez se sube la imágen se limpia el formulario y se actualiza
                    // la lista de plantas para el recinto
                    img_form.find('input[name="img"]').val('');
                    img_form.find('input[name="imgB"]').val('');
                    img_form.find('.file-input-name').remove();
                    $scope.waiting_response = false;
                    $rootScope.$broadcast('sync_enclosure', $scope.enclosure);
                }
            );
        }
        else
            $rootScope.$broadcast('sync_enclosure', $scope.enclosure);
    };


    $scope.del = function() {
        var confirm_msg = gettext('Are you sure you want to remove this floor?');

        floorResource.del(
            $scope.floor.id,
            confirm_msg,
            function(){
                $rootScope.$broadcast('sync_enclosure', $scope.enclosure);
            }
        );
    };


    $scope.$on('show_create_floor_form', function(ev, enclosure) {
        $scope.enclosure = enclosure;
        $scope.floor_name = '';
        $scope.floor_number = '';
        $scope.floor_img = '';
        modalDialog = new ModalDialog('#floor_create');
        modalDialog.open();
    });


    $scope.$on('show_edit_floor_form', function(ev, floor, enclosure) {
        $scope.enclosure = enclosure;
        $scope.floor = floor;
        $scope.floor_name = floor.name;
        $scope.floor_number = floor.floor_number;
        $scope.floor_img = floor.img;
        modalDialog = new ModalDialog('#floor_edit');
        modalDialog.open();
    });
}


function removeArroba(twitterAccount)
{
    if (twitterAccount && twitterAccount.charAt(0)== "@")
        return twitterAccount.substr(1);

    return twitterAccount;
}






//function PoiListCtrl($scope, $rootScope)
//{
//    $scope.$on('show_poi_list', function(enclosure, category){
//        // Muestra los POIs de la categoría donde hacemos click
//
//        $scope.pois = pointResource.readAllFiltered(
//            '?floor__enclosure__id=' + enclosure.id + '&' +
//            'label__category__id=' + category.id
//        );
//
//        modalDialog = new ModalDialog('#category_POIs');
//        modalDialog.open();
//    });
//}



//
// DIRECTIVAS PROPIAS
//

// myApp.directive('fadey', function() {
// return {
// restrict: 'A',
// link: function(scope, elm, attrs) {
// var duration = parseInt(attrs.fadey, 10);
// if (isNaN(duration)) {
// duration = 500;
// }
//
// scope.$watch('[createEnclosure]', function () {
// elm = $(elm);
// elm.hide();
// elm.fadeIn(duration);
// }, true);
//
// scope.del = function(complete) {
// elm.fadeOut(duration);
// };
// }
// };
// });