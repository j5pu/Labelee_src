

function MainCtrl($scope, $rootScope, $element, UserService, FormService)
{
    $scope.manager = couponResource.getManager();

    $scope.sync_main = function() {
        $scope.manager = couponResource.getManager();

        modalDialog.close();
    };
}


function CouponCtrl($scope, $element)
{
    $scope.sync_coupon = function() {
        $scope.coupon = couponResource.getCoupon($scope.coupon.label.id);

        $($element).find('img').attr('src', '');
        $($element).find('img').attr('src', $scope.coupon.point.coupon);
        modalDialog.close();
    };


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
                    $scope.sync_coupon();
                }
            );
        }
        else
            modalDialog.close();
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


    $scope.show_update_form = function($event) {
        $($event.target).blur();

        $scope.coupon_img = $scope.coupon.img;
        modalDialog = new ModalDialog('#coupon_update');
        modalDialog.open();
    };

    $scope.show_create_form = function($event) {
        $($event.target).blur();

        $scope.coupon_img = '';
        modalDialog = new ModalDialog('#coupon_create');
        modalDialog.open();
    };
}