

function MainCtrl($scope, $rootScope, $element, UserService, FormService)
{

    $scope.sync_main = function() {
        $scope.manager = couponResource.getManager();
    };

    $scope.sync_main();

    $scope.search = function (row) {
        return !$scope.query ||
            row.label.name.toUpperCase().indexOf($scope.query.toUpperCase() || '') !== -1 ||
            row.enclosure.name.toUpperCase().indexOf($scope.query.toUpperCase() || '') !== -1;
    };

    $scope.search2 = function (row) {
        var undefined1 = typeof $scope.show_only_empty == 'undefined';
        var undefined2 = typeof $scope.show_only_unempty == 'undefined';
        var false1 = undefined1 || !$scope.show_only_empty;
        var false2 = undefined2 || !$scope.show_only_unempty;
        var both_false = false1 && false2;

        var only_empty = $scope.show_only_empty && !row.point.coupon;
        var only_unempty = $scope.show_only_unempty && row.point.coupon;

        return both_false || (only_empty || only_unempty);
    };


    $scope.$watch('show_only_empty', function(){
        if($scope.show_only_empty && $scope.show_only_unempty)
            $scope.show_only_unempty = false;
    });
    $scope.$watch('show_only_unempty', function(){
        if($scope.show_only_empty && $scope.show_only_unempty)
            $scope.show_only_empty = false;
    });
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

function CouponCtrl($scope, $rootScope, $element)
{
    $scope.sync_coupon = function() {
        $scope.coupon = couponResource.getCoupon($scope.coupon.label.id);

        replaceImg(
            $($element).find('.img_wrapper'),
            $scope.coupon.point.coupon
        );
    };

    $scope.show_update_form = function($event) {
        $($event.target).blur();
        $rootScope.$broadcast('show_update_form', $scope.coupon);
    };

    $scope.show_create_form = function($event) {
        $($event.target).blur();
        $rootScope.$broadcast('show_create_form', $scope.coupon);
    };

    $scope.$on('sync_coupon', function(ev, coupon){
        if($scope.coupon.id == coupon.id)
            $scope.sync_coupon();
    });
}


function FormsCtrl($scope, $rootScope)
{
    $scope.$on('show_update_form', function(ev, coupon){
        $scope.coupon = coupon;
        $scope.coupon_img = coupon.img;
        modalDialog = new ModalDialog('#coupon_update');
        modalDialog.open();
    });

    $scope.$on('show_create_form', function(ev, coupon){
        $scope.coupon = coupon;
        $scope.coupon_img = '';
        modalDialog = new ModalDialog('#coupon_create');
        modalDialog.open();
    });


    $scope.create = function() {

        // Si se ha puesto una nueva imágen la subimos, eliminando la anterior
        var img = $('#coupon_create input[name="coupon"]');
        if(img.val())
        {
            var img_form = $('#coupon_create').find('form');

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


    $scope.update = function(enclosure) {
        var img = $('#coupon_update input[name="coupon"]');

        // Si se ha puesto una nueva imágen la subimos, eliminando la anterior
        if(img.val())
        {
            var img_form = $('#coupon_update').find('form');

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
                    $rootScope.$broadcast('sync_coupon', $scope.coupon);
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
            $rootScope.$broadcast('sync_coupon', $scope.coupon);
        }
        modalDialog.close();
    };
}