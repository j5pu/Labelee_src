$(function() {
    I18n.selectLang(lang_code);
});


function EnclosureListCtrl($scope, UrlService)
{
	$scope.enclosure_resource = new Resource('enclosure');

    $scope.$watch('enclosures', function(){FileInput.draw();});

	$scope.enclosures = $scope.enclosure_resource.readAll();

    // Orden en que aparecerán los recintos
    $scope.reverse = false;


    $scope.show_create_form = function() {
        $("#enc_create").dialog({
            autoOpen: false,    // set this to false so we can manually open it
            dialogClass: "loadingScreenWindow",
            closeOnEscape: false,
            draggable: false,
            width: 460,
            minHeight: 50,
            modal: true,
            buttons: {},
            resizable: false,
            open: function() {
                // scrollbar fix for IE
                $('body').css('overflow','hidden');
            },
            close: function() {
                // reset overflow
                $('body').css('overflow','auto');
            }
        }); // end of dialog
        $('#enc_create').dialog('open');
    };
}


function EnclosureCtrl($scope, $element)
{
	$scope.editing = false;
    $scope.hovered = false;

    $scope.poiCount = new PointResource().countPois($scope.enclosure.id);

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

function FloorListCtrl($scope, $element)
{
	$scope.waiting_response = false;
    $scope.hovered = false;
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
			floor_number : parseInt($scope.floor_number),
			enclosure : $scope.enclosure.resource_uri
		};
		
		var new_floor = $scope.floor_resource.create(floor_data);
		
		//
		// 2: Una vez creado subimos la imágen para el nuevo mapa creado	
		var img_form = $($element).find('form').first();
		
		$scope.waiting_response = true;
		
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
				
				$scope.waiting_response = false;
				
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
				
				$scope.waiting_response = true;
				
				$scope.floor_resource.addImg(
					img_form, 
					$scope.floor.id,
					function(server_response){
						// Una vez se sube la imágen se limpia el formulario y se actualiza
						// la lista de plantas para el recinto
						$scope.waiting_response = false;
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


function CategoriesCtrl($scope, UrlService)
{
    $scope.category_resource = new LabelCategoryResource();

    $scope.loadCategoryList = function() {
        var enclosure_id = $scope.$parent.$parent.enclosure.id;
        $scope.categories = $scope.category_resource.readAllFiltered('?label__point__floor__enclosure__id=' + enclosure_id);
    };

    $scope.loadCategoryList();
}


function EnclosureFormsCtrl($scope)
{
    $scope.create = function() {
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

function FloorFormsCtrl($scope)
{

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