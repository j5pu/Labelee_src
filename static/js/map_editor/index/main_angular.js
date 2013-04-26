$(document).on('ready', function() {
});


function PlacesCtrl($scope, PartialService) {

	new PartialService();

	$scope.place_resource = new Resource('place');

	$scope.places = $scope.place_resource.readAll();

	$scope.createPlace = function() {
		var data = {
			name : $scope.place_name
		};

		$scope.place_resource.create(data)

		$scope.places = $scope.place_resource.readAll();
		
		$scope.place_name = '';
	};
}

function PlaceCtrl($scope) {
	$scope.editing = false;

	$scope.update = function() {
		if (!$scope.editing) {
			$scope.editing = true;
			return;
		} else {
			// Si ya se estaba editando cuando hemos invocado update() entonces
			// guardamos el nuevo nombre en la BD

			var data = {
				name : $scope.place_name
			}

			$scope.place_resource.update(data, $scope.place.id);

			$scope.editing = false;

			$scope.$parent.place.name = $scope.place_resource.read($scope.place.id).name;
		}
	};

	$scope.del = function() {

		var confirm_msg = '¿Seguro que desea eliminar el lugar? (también se perderán todos sus mapas)';

		$scope.place_resource.del($scope.place.id, confirm_msg);

		// Al ir en un ng-include el botón que llama a esta función,
		// tenemos que subir dos niveles para cambiar la lista $scope.places:
		//	- subir del $scope de la plantilla
		//	- del $scope del PlaceCtrl (controlador hijo) al $scope de PlacesCtrl (padre)
		$scope.$parent.$parent.places = $scope.place_resource.readAll();

	};
}

function MapsCtrl($scope, $element) {

	$scope.sending_img = false;
	
	$scope.map_resource = new Resource('map');
	
	$scope.createMap = function() {
		
		//
		// 1: Creamos el registro en B.D.
		var data = {
			name : $scope.map_name,
			place : $scope.place.resource_uri
		};
		
		var new_map = $scope.map_resource.create(data)
		
		//
		// 2: Una vez creado subimos la imágen para el nuevo mapa creado	
		var img_form = $($element).find('form').first();
		
		$scope.sending_img = true;
		
		$scope.map_resource.addImg(
			img_form, 
			new_map.id,
			function(server_response){
				// Una vez se sube la imágen se limpia el formulario y se actualiza
				// la lista de mapas para el lugar
				$scope.map_name = '';
				img_form.find('input[name="img"]').val('');
				$scope.$parent.$parent.place.maps = 
					$scope.map_resource.readAllFiltered('?place__id=' + $scope.place.id);
				
				$scope.sending_img = false;
				
				$scope.$apply();
			}
		);
		
		// $scope.$parent.$parent.place.maps = 
					// $scope.map_resource.readAllFiltered('?place__id=' + $scope.place.id);
		

		
	};

}

function MapCtrl($scope, $element) {

	$scope.editing = false;
	
	$scope.update = function() {
		var img = $($element).find('input[name="img"]');
		var img_val = img.val();
		
		if (!$scope.editing) {
			$scope.editing = true;
			img.val('');
			return;
		} else {
			// Si ya se estaba editando cuando hemos invocado update() entonces
			// guardamos el nuevo nombre en la BD

			var data = {
				name : $scope.map_name
			}

			$scope.map_resource.update(data, $scope.map.id);
			
			// Si se ha puesto una nueva imágen la subimos, eliminando la anterior
			if(img.val() !== '')
			{					
				var img_form = $($element).find('form');
				
				$scope.sending_img = true;
				
				$scope.map_resource.addImg(
					img_form, 
					$scope.map.id,
					function(server_response){
						// Una vez se sube la imágen se limpia el formulario y se actualiza
						// la lista de mapas para el lugar
						$scope.sending_img = false;						
					}
				);
			}

			$scope.editing = false;

			$scope.$parent.map.name = $scope.map_resource.read($scope.map.id).name;
		}
	};

	$scope.del = function() {

		var confirm_msg = '¿Seguro que desea eliminar el mapa? (también se perderán todos sus grids)';

		$scope.map_resource.del($scope.map.id, confirm_msg);

		$scope.$parent.$parent.place.maps = 
			$scope.map_resource.readAllFiltered('?place__id=' + $scope.place.id);
	};
}

//
//
//
//
// DEPRECATED
//
//
//

// function ListCtrl($scope, $http) {

// 	$scope.read = function()
// 	{
// 		// Trae toda la lista de lugares

// 		$http.get('/api/v1/places/')
// 			.success(function(data, status) {
// 				// $scope.status = status;
// 				// $scope.data = data;
// 				$scope.places = data.objects; // Show result from server in our <pre></pre> element
// 		});
// 	};

// 	return $scope.read();
// }

// function ElementCtrl(CrudService, $scope, $http, $element, $q)
// {

// 	// Indica si tenemos abierto el formulario para editar el elemento
// 	$scope.editing = false;

// 	// A usar en la plantilla _/form_alert_box.html
// 	$scope.alert = {
// 		errors: false,
// 		success_msg: 'Lugar <b>' + $scope.place_name + '</b> creado correctamente'
// 	};

// 	var del_confirm_msg = '¿Seguro que desea eliminar el lugar?' +
// 		'(también se perderán todos sus mapas)';

// 	// CrudService implemented
// 	var read_created = function()
// 	{
// 		// Devuelve el nuevo elemento creado

// 		// http://docs.angularjs.org/api/ng.$q
// 		var deferred = $q.defer();

// 		$http.get('/api/v1/places/?name__iexact=' + $scope.place_name)
// 			.success(function(data, status) {
// 				deferred.resolve(data.objects[0]);
// 		});

// 		return deferred.promise;
// 	};

// 	$scope.create = function()
// 	{
// 		$http.post('/api/v1/places/', {name: $scope.place_name})
// 			.success(function(data, status, headers, config) {

// 				read_created_place().then(function(place){
// 					// Hasta que no se haya leído el nuevo lugar creado no podremos
// 					// insertarlo en $scope.places y hacer lo demás..
// 					$scope.places.push(place);
// 					$scope.alert.errors = false;
// 					$scope.alert.success_msg = 'Lugar <b>' + $scope.place_name +
// 						'</b> creado correctamente';
// 					$scope.place_name = '';
// 				});
// 			}).error(function(data, status, headers, config) {
// 				// $scope.status = status;
// 				$scope.errors = data.places;
// 		});
// 	};

// 	$scope.update = function()
// 	{
// 		// Si se está editando el formulario entonces enviamos los datos
// 		if($scope.editing)
// 		{
// 			$http.put(
// 				'/api/v1/places/' + $scope.place.id,
// 				{name: $scope.place_name}
// 			).success(function(data, status) {

// 				$scope.place.name = $scope.place_name;

// 				// Avisamos que hemos dejado de editar..
// 				$scope.editing = false;
// 			});
// 		}
// 		// Si no se está editando abrimos el formulario
// 		else
// 			$scope.editing = true;
// 	};

// 	$scope.del = function()
// 	{
// 		if(confirm("¿Seguro que desea eliminar el lugar? (también se perderán todos sus mapas)"))
// 		{
// 			$http['delete']('/api/v1/places/' + $scope.place.id).success(function(){

// 				var idx = $scope.places.indexOf($scope.place);
// 				if (idx !== -1) {
// 					//injected into repeater scope by fadey directive
// 					this.del(function() {
// 						$scope.items.splice(idx, 1);
// 					});
// 				}
// 				// var place_elem = angular.element(elem);
// 				// var jq_elem = $(place_elem);
// 				// jq_elem.fadeOut(300, function() { $(this).remove(); });
// 			});
// 		}
// 	};

// 	$scope.validate = function()
// 	{
// 		var url = '/dynamic-validator/place/';
// 		url += $scope.editing ? $scope.place.id : '';

// 		$http.post(url, {name: $scope.place_name}
// 		).success(function(data, status, headers, config) {
// 			// $scope.data = data;
// 			$scope.alert.errors = data.errors ? data.errors : false;
// 			$scope.alert.success_msg = false;
// 		}).error(function(data, status, headers, config) {
// 			// $scope.status = status;
// 			// $scope.errors = data.places;
// 		});
// 	};
// }

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
// scope.$watch('[createPlace]', function () {
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