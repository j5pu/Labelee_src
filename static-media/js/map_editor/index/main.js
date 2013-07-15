var formDialog;

$(function() {
    I18n.selectLang(lang_code);


});


function EnclosureListCtrl($scope, $rootScope)
{
    $scope.$watch('enclosures', function(){FileInput.draw();});

	$scope.enclosures = enclosureResource.getForManagerIndex();

    // Orden en que aparecerán los recintos
    $scope.reverse = false;

    $scope.show_create_enclosure_form = function() {
        $rootScope.$broadcast('show_create_enclosure_form');
    };

    angular.forEach(
        [
            'enclosure_created', 'enclosure_updated', 'enclosure_deleted',
            'floor_created', 'floor_updated', 'floor_deleted'
        ],
        function(event){
            $scope.$on(event, function() {
                $scope.enclosures = enclosureResource.getForManagerIndex();
                formDialog.close();
        });
    });
}


function EnclosureCtrl($scope, $rootScope, $element)
{
    $scope.hovered = false;

    $scope.show_edit_form = function()
    {
        $rootScope.$broadcast('show_edit_form', $scope.enclosure);
    };

    $scope.calculateRoutes = function()
    {
        if(confirm(gettext('Previous routes will be removed for this enclosure. Do you want to continue?')))
            enclosureResource.calculateRoutes($scope.enclosure.id);
    };
}

function FloorListCtrl($scope, $rootScope)
{
	$scope.waiting_response = false;
    $scope.hovered = false;
    $scope.reverse = false;

    $scope.$watch('floors', function(){
        FileInput.draw();
    });

    $scope.show_create_floor_form = function() {
        $rootScope.$broadcast('show_create_floor_form', $scope.enclosure);
    };


}

function FloorCtrl($scope, $rootScope, $element)
{
    $scope.show_edit_floor_form = function() {
        $rootScope.$broadcast('show_edit_floor_form', $scope.floor);
    }
}


function CategoryListCtrl($scope, UrlService)
{

}


function EnclosureFormsCtrl($scope, $rootScope)
{
    $scope.create = function() {
        var data = {
            name: $scope.enclosure_name,
            owner: '/api/v1/user/1/'
        };

        var enclosure = enclosureResource.create(data);

        $scope.enclosure_name = '';

        setTimeout(function(){
            $('html, body').animate({
                scrollTop: $(document).height()
            }, 2000);
        }, 300);

//        http://stackoverflow.com/questions/14502006/scope-emit-and-on-angularjs/14502755#14502755
        $rootScope.$broadcast('enclosure_created', enclosure);
    };

    $scope.update = function(enclosure) {
        var data = {
            name : $scope.enclosure_name,
            twitter_account : $scope.twitter_account
        };

        enclosureResource.update(data, $scope.enclosure.id);

        $rootScope.$broadcast('enclosure_updated');
    };

    $scope.cancelUpdate = function() {
        formDialog.close();
    };

    $scope.del = function() {

        var confirm_msg = gettext('Are you sure you want to remove this enclosure? (this will erase all their floors)');

        enclosureResource.del(
            $scope.enclosure.id,
            confirm_msg,
            function(){
                $rootScope.$broadcast('enclosure_deleted');
            }
        );
    };

    $scope.$on('show_create_enclosure_form', function() {
        $scope.enclosure_name = '';
        formDialog = new FormDialog('#enc_create');
        formDialog.open();
    });

    $scope.$on('show_edit_form', function(ev, enclosure) {
        // Abre el diálogo con el formulario para la edición del recinto
        $scope.enclosure = enclosure;
        $scope.enclosure_name = enclosure.name;
        $scope.twitter_account = enclosure.twitter_account;
        formDialog = new FormDialog('#enc_edit');
        formDialog.open();
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
                $rootScope.$broadcast('floor_created');
            }
        );
    };


    $scope.update = function() {
        var img = $($element).find('input[name="img"]');

        var floor_data = {
            name : $scope.floor_name,
            floor_number : $scope.floor_number
        };

        floorResource.update(floor_data, $scope.floor.id);

        // Si se ha puesto una nueva imágen la subimos, eliminando la anterior
        if(img.val() !== '')
        {
            var img_form = $($element).find('form');

            $scope.waiting_response = true;

            floorResource.addImg(
                img_form,
                $scope.floor.id,
                function(server_response){
                    // Una vez se sube la imágen se limpia el formulario y se actualiza
                    // la lista de plantas para el recinto
                    img_form.find('input[name="img"]').val('');
                    img_form.find('.file-input-name').remove();
                    $scope.waiting_response = false;
                    $rootScope.$broadcast('floor_updated');
                }
            );
        }
        else
            $rootScope.$broadcast('floor_updated');
    };


    $scope.cancelUpdate = function() {
        formDialog.close();
    };


    $scope.del = function() {
        var confirm_msg = gettext('Are you sure you want to remove this floor?');

        floorResource.del(
            $scope.floor.id,
            confirm_msg,
            function(){
                $rootScope.$broadcast('floor_deleted');
            }
        );
    };


    $scope.$on('show_create_floor_form', function(ev, enclosure) {
        $scope.enclosure = enclosure;
        $scope.floor_name = '';
        $scope.floor_number = '';
        $scope.floor_img = '';
        formDialog = new FormDialog('#floor_create');
        formDialog.open();
    });


    $scope.$on('show_edit_floor_form', function(ev, floor) {
        $scope.floor = floor;
        $scope.floor_name = floor.name;
        $scope.floor_number = floor.floor_number;
        $scope.floor_img = floor.img;
        formDialog = new FormDialog('#floor_edit');
        formDialog.open();
    });
}



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