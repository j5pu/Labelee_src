$(function() {
    I18n.selectLang(lang_code);
});


function EnclosuresCtrl($scope, UrlService)
{
	$scope.enclosure_resource = new Resource('enclosure');

    $scope.$watch('enclosures', function(){FileInput.draw();});

	$scope.enclosures = $scope.enclosure_resource.readAll();

	$scope.createEnclosure = function() {
		var data = {
			name: $scope.enclosure_name,
            owner: '/api/v1/user/1/'
		};

		$scope.enclosure_resource.create(data);
		$scope.enclosures = $scope.enclosure_resource.readAll();
		
		$scope.enclosure_name = '';

        setTimeout(function(){
            $('html, body').animate({
                scrollTop: $(document).height()
            }, 2000);
        }, 300);

	};
}


function EnclosureCtrl($scope, $element)
{
	$scope.editing = false;

	$scope.update = function() {
		if (!$scope.editing) {
			$scope.editing = true;
		} else {
			// Si ya se estaba editando cuando hemos invocado update() entonces
			// guardamos el nuevo nombre en la BD

			var data = {
				name : $scope.enclosure_name,
                twitter_account : $scope.twitter_account
			};

			var updated_enclosure = $scope.enclosure_resource.update(data, $scope.enclosure.id);

			$scope.editing = false;

			$scope.$parent.enclosure.name = updated_enclosure.name;
			$scope.$parent.enclosure.twitter_account = updated_enclosure.twitter_account;
		}
	};

    $scope.cancelUpdate = function() {
        $scope.editing = false;
    };

	$scope.del = function() {

		var confirm_msg = gettext('Are you sure you want to remove this enclosure? (this will erase all their floors)');

		$scope.enclosure_resource.del(
            $scope.enclosure.id,
            confirm_msg,
            function(){
                $($element).fadeOut(200);
            }
        );
	};


    $scope.calculateRoutes = function()
    {
        new EnclosureResource().calculateRoutes($scope.enclosure.id);
    };
}

function FloorsCtrl($scope, $element)
{
	$scope.sending_img = false;

    $scope.floor_resource = new FloorResource();

    $scope.$watch('floors', function(){
        FileInput.draw();
    });

    $scope.loadFloorList = function() {
        $scope.floors = $scope.floor_resource.readFromEnclosure($scope.enclosure.id);
    };

    $scope.loadFloorList();

	$scope.createFloor = function() {

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
			enclosure : $scope.enclosure.resource_uri
        };

        if($scope.floor_number)
            floor_data.floor_number = parseInt($scope.floor_number);

		var new_floor = $scope.floor_resource.create(floor_data);
		
		//
		// 2: Una vez creado subimos la imágen para el nuevo mapa creado	
		var img_form = $($element).find('form').first();
		
		$scope.sending_img = true;
		
		$scope.floor_resource.addImg(
			img_form, 
			new_floor.id,
			function(server_response){
				// Una vez se sube la imágen se limpia el formulario y se actualiza
				// la lista de mapas para el lugar
				$scope.floor_name = '';
				$scope.floor_number = '';
				img_form.find('input[name="img"]').val('');
                img_form.find('.file-input-name').remove();
				$scope.floors =
					$scope.floor_resource.readAllFiltered('?enclosure__id=' + $scope.enclosure.id + '&order_by=floor_number');
				
				$scope.sending_img = false;
				
				$scope.$apply();
			}
		);


	};
}

function FloorCtrl($scope, $element)
{
	$scope.editing = false;


	$scope.update = function() {
		var img = $($element).find('input[name="img"]');

		if (!$scope.editing)
			$scope.editing = true;
        else
        {
			// Si ya se estaba editando cuando hemos invocado update() entonces
			// guardamos el nuevo nombre en la BD

			var floor_data = {
				name : $scope.floor_name,
				floor_number : $scope.floor_number
			};

			$scope.floor_resource.update(floor_data, $scope.floor.id);
			
			// Si se ha puesto una nueva imágen la subimos, eliminando la anterior
			if(img.val() !== '')
			{					
				var img_form = $($element).find('form');
				
				$scope.sending_img = true;
				
				$scope.floor_resource.addImg(
					img_form, 
					$scope.floor.id,
					function(server_response){
						// Una vez se sube la imágen se limpia el formulario y se actualiza
						// la lista de plantas para el recinto
						$scope.sending_img = false;						
					}
				);
			}

			$scope.editing = false;
            $scope.loadFloorList();
		}

        FileInput.draw();
	};

    $scope.cancelUpdate = function() {
        $scope.editing = false;

        $scope.loadFloorList();
    };

	$scope.del = function() {

		var confirm_msg = gettext('Are you sure you want to remove this floor?');

		$scope.floor_resource.del(
            $scope.floor.id,
            confirm_msg,
            function(){
                $($element).fadeOut(200);
                setTimeout($scope.loadFloorList, 200);
            }
        );
	};
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