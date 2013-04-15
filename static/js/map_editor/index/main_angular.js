
$(document).on('ready', function(){
});


function PlacesCtrl($scope, ListService, PartialService) {

	new PartialService();

	var placesPromise = new ListService('place').readAll();

	placesPromise.then(function(response){
		$scope.places = response.data.objects;
	});


}

function PlaceCtrl($scope, CrudService)
{


	new CrudService($scope, {
		resource: 'place',
		element: $scope.place,
		element_data: {name: $scope.place_name},
		list: $scope.places,
		// scope_fields: {
		// 	// place_name: ['aloh', 'hola']
		// 	place_name: [$scope.place.name, $scope.place_name]
		// },
		to_clean: $scope.place_name
	});
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


// //
// // DIRECTIVAS PROPIAS
// //

// myApp.directive('fadey', function() {
// 	return {
// 		restrict: 'A',
// 		link: function(scope, elm, attrs) {
// 			var duration = parseInt(attrs.fadey, 10);
// 			if (isNaN(duration)) {
// 				duration = 500;
// 			}

// 			scope.$watch('[create]', function () {
// 				elm = $(elm);
// 				elm.hide();
// 				elm.fadeIn(duration);
// 			}, true);

// 			scope.del = function(complete) {
// 				elm.fadeOut(duration);
// 			};
// 		}
// 	};
// });