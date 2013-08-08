

function MainCtrl($scope, $rootScope, $element, UserService, FormService)
{

    $scope.sync_main = function() {
        $scope.manager = couponResource.getManager();
    };

    $scope.sync_main();

    $scope.search_enclosure = function (row) {
        return !$scope.query_enclosure ||
            row.name.toUpperCase().indexOf($scope.query_enclosure.toUpperCase() || '') !== -1;
    };


//    $scope.$watch('query_coupon', function(){
//        $scope.$broadcast('search_coupon', $scope.query_coupon)
//    });
    $scope.$watch('show_only_empty', function(){
        if($scope.show_only_empty && $scope.show_only_unempty)
            $scope.show_only_unempty = false;
    });
    $scope.$watch('show_only_unempty', function(){
        if($scope.show_only_empty && $scope.show_only_unempty)
            $scope.show_only_empty = false;
    });


    $scope.$on('sync_main', $scope.sync_main);
}

function replaceImg(wrapper, img_src)
{
    //    <div class="img_wrapper">
    //        <img ng-show="coupon.point.coupon" ng-src="[[coupon.point.coupon]]">
    //    </div>
    wrapper.find('img').remove();
    img = new Image();
    img.src = img_src;
    wrapper.append(img);
}


function CouponLabelCtrl($scope, $rootScope, $element)
{
    $scope.sync_coupon = function() {

    };

    $scope.show_create_form = function($event) {
        $($event.target).blur();
        $rootScope.$broadcast('show_create_form_label', $scope.coupon);
    };
    $scope.show_update_form = function($event) {
        $($event.target).blur();
        $rootScope.$broadcast('show_update_form_label', $scope.coupon);
    };

    $scope.$on('sync_coupon_label', function(ev, coupon){
        if($scope.coupon.label.id == coupon.label.id)
        {
            $scope.coupon = coupon;
            replaceImg(
                $($element).find('.img_wrapper'),
                $scope.coupon.point.coupon
            );
        }
    });

}


function CouponEnclosureCtrl($scope, $rootScope, $element)
{

    $scope.show_update_form = function($event) {
        $($event.target).blur();
        $rootScope.$broadcast('show_update_form_enclosure', $scope.enclosure, $scope.coupon);
    };

    $scope.$on('sync_coupon_enclosure', function(ev, coupon){

        if($scope.coupon.id == coupon.id)
        {
            $scope.coupon = coupon;
            replaceImg(
                $($element).find('.img_wrapper'),
                $scope.coupon.img
            );
        }
    });
}


function FormsLabelCtrl($scope, $rootScope)
{
    $scope.$on('show_create_form_label', function(ev, coupon){
        // Para añadir la imágen al cupón
        $scope.coupon = coupon;
        $scope.coupon_img = '';
        modalDialog = new ModalDialog('#coupon_create_label');
        modalDialog.open();
    });
    $scope.$on('show_update_form_label', function(ev, coupon){
        $scope.coupon = coupon;
        $scope.coupon_img = coupon.img;
        modalDialog = new ModalDialog('#coupon_update_label');
        modalDialog.open();
    });

    $scope.create = function() {

        // Si se ha puesto una nueva imágen la subimos, eliminando la anterior
        var img = $('#coupon_create_label input[name="coupon"]');
        if(img.val())
        {
            var img_form = $('#coupon_create_label').find('form');

            $scope.waiting_response = true;

            pointResource.addImg(
                img_form,
                $scope.coupon.point.id,
                function(server_response){
                    // Una vez se sube la imágen se limpia el formulario y se actualiza
                    // la lista de plantas para el recinto
                    img_form.find('input[name="coupon_img"]').val('');
                    img_form.find('.file-input-name').remove();
                    $scope.waiting_response = false;
                    $scope.sync_main();
                    modalDialog.close();
                    $scope.$apply();
                }
            );
        }
        else
            modalDialog.close();
    };


    $scope.update = function() {
        var img = $('#coupon_update_label input[name="coupon"]');

        // Si se ha puesto una nueva imágen la subimos, eliminando la anterior
        if(img.val())
        {
            var img_form = $('#coupon_update_label').find('form');

            $scope.waiting_response = true;

            pointResource.addImg(
                img_form,
                $scope.coupon.point.id,
                function(server_response){
                    // Una vez se sube la imágen se limpia el formulario y se actualiza
                    // la lista de plantas para el recinto
                    img_form.find('input[name="new_coupon_img"]').val('');
                    img_form.find('.file-input-name').remove();
                    $scope.waiting_response = false;
                    $rootScope.$broadcast('sync_coupon_label', $scope.coupon);
                    modalDialog.close();
                }
            );
        }
        else
            modalDialog.close();
    };


    $scope.del = function() {
        var confirm_msg = gettext('Are you sure you want to remove this coupon?');
        if(confirm(confirm_msg))
        {
            pointResource.delImg($scope.coupon.point.id, 'coupon');
            $scope.coupon.point.coupon = null;
            $rootScope.$broadcast('sync_coupon_label', $scope.coupon);
        }
        modalDialog.close();
    };
}

function FormsEnclosureCtrl($scope, $rootScope)
{
    $scope.$on('show_create_form_enclosure', function(ev, enclosure){
        // Para añadir el cupón
        $scope.enclosure = enclosure;
        $scope.coupon_name = '';
        $scope.coupon_img = '';
        modalDialog = new ModalDialog('#coupon_create_enclosure');
        modalDialog.open();
    });
    $scope.$on('show_update_form_enclosure', function(ev, enclosure, coupon){
        $scope.enclosure = enclosure;
        $scope.coupon = coupon;
        $scope.coupon_name = coupon.name;
        $scope.coupon_img = coupon.img;
        modalDialog = new ModalDialog('#coupon_update_enclosure');
        modalDialog.open();
    });

    $scope.create = function() {
        var img = $('#coupon_create_enclosure input[name="img"]');

        if(!img.val())
        {
            alert(gettext('You must specify the coupon image'));
            return;
        }

        var data = {
            name: $scope.coupon_name,
            enclosure: enclosureResource.api1_url + $scope.enclosure.id + '/'
        };
        var created_coupon = couponResource.create(data);


        var img_form = $('#coupon_create_enclosure').find('form');

        $scope.waiting_response = true;

        couponResource.addImg(
            img_form,
            created_coupon.id,
            function(server_response){
                // Una vez se sube la imágen se limpia el formulario y se actualiza
                // la lista de plantas para el recinto
                img_form.find('input[name="img"]').val('');
                img_form.find('.file-input-name').remove();
                $scope.waiting_response = false;
                $scope.sync_main();
                modalDialog.close();
                $scope.$apply();
            }
        );
    };


    $scope.update = function() {
        var img = $('#coupon_update_enclosure input[name="img"]');

        var data = {
            name: $scope.coupon_name
        };
        updated_coupon = couponResource.update(data, $scope.coupon.id);

        var img_form = $('#coupon_update_enclosure').find('form');

        $scope.waiting_response = true;

        couponResource.addImg(
            img_form,
            $scope.coupon.id,
            function(server_response){
                // Una vez se sube la imágen se limpia el formulario y se actualiza
                // la lista de plantas para el recinto
                img_form.find('input[name="img"]').val('');
                img_form.find('.file-input-name').remove();
                $scope.waiting_response = false;
                updated_coupon = couponResource.read(updated_coupon.id);
                $rootScope.$broadcast('sync_coupon_enclosure', updated_coupon);
                modalDialog.close();
                $scope.$apply();
            }
        );
    };


    $scope.del = function() {
        var confirm_msg = gettext('Are you sure you want to remove this coupon?');
        couponResource.del(
            $scope.coupon.id,
            confirm_msg,
            function(){
                $scope.sync_main();
                modalDialog.close();
            }
        );
    };
}


function EnclosureCtrl($scope, $rootScope)
{
    $scope.filter_coupon = function (row) {
        var undefined1 = typeof $scope.show_only_empty == 'undefined';
        var undefined2 = typeof $scope.show_only_unempty == 'undefined';
        var false1 = undefined1 || !$scope.show_only_empty;
        var false2 = undefined2 || !$scope.show_only_unempty;
        var both_false = false1 && false2;

        var only_empty = $scope.show_only_empty && (!row.point || !row.point.coupon);
        var only_unempty = $scope.show_only_unempty && (row.point && row.point.coupon);

        return both_false || (only_empty || only_unempty);
    };

    $scope.search_coupon = function (row) {
        return !$scope.query_coupon ||
            row.label.name.toUpperCase().indexOf($scope.query_coupon.toUpperCase() || '') !== -1;
    };

    $scope.show_create_form_enclosure = function($event) {
        $($event.target).blur();
        $rootScope.$broadcast('show_create_form_enclosure', $scope.enclosure);
    }
}