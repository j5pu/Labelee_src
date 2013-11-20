//
// SERVICIOS
//

myApp.factory('PartialService', function($rootScope){

	// Servicio a aplicar en los controladores donde se quiera hacer referencia
	// a alguna plantilla usando ng-include

	var PARTIALS_PATH = '/static/partials/';

	return function(){
		$rootScope._form_alert_box = PARTIALS_PATH + '_form_alert_box.html';
		$rootScope._editable_enclosure = PARTIALS_PATH + '_editable_enclosure.html';
		$rootScope._editable_floor = PARTIALS_PATH + '_editable_floor.html';
		$rootScope._uploading_iframe = PARTIALS_PATH + '_uploading_iframe.html';
	};
});



myApp.factory('ListService', function($http, $q) {

	// Devuelve la lista de elementos para un recurso dado xej. 'enclosure'
	return function(resource){

		this.readAll = function(){

			// Trae toda la lista de elementos de un recurso dado

			// $http ya de por sí puede devolver una promesa
			// http://stackoverflow.com/questions/11850025/recommended-way-of-getting-data-from-the-server

			return $http.get('/api/v1/' + resource + '/').then(function(response){
				return response;
			});
		};
	};
});



myApp.factory('CrudService', function($http) {

	// Devuelve un conjunto de 'CRUD operations' (Create, Read, Update, Delete)
	// sobre un recurso dado

	return function(scope, args){

		// scope = $scope
		// resource = 'enclosure'
		// element = $scope.enclosure
		// element_data = {name: $scope.place_name},
		// list = $scope.enclosures;
		// scope_fields = {
		//		place_name: [$scope.enclosure.name, $scope.place_name],
		//		...
		// }
		// to_clean = $scope.place_name


		// Indica si tenemos abierto el formulario para editar el elemento
		scope.editing = false;

		// A usar en la plantilla form_alert_box.html
		scope.alert = {
			errors: false,
			success_msg: false
		};


		scope.create = function(success_msg){

			// Crea un elemento en la lista perteneciente al recurso

			$http.post('/api/v1/' + resource, element_data).then(function(response){
				list.push(response);
				$scope.alert.errors = false;
				$scope.alert.success_msg = success_msg;
				to_clean = '';
			});
		};


		scope.read = function(){

			return $http.get('/api/v1/' + resource + '/' + element.id).then(function(response){
				return response;
			});
		};


		scope.update = function(){

			if($scope.editing)
			{
				// Si se está editando el formulario entonces enviamos los datos

				$http.put(
					'/api/v1/' + resource + '/' + element.id,
					element_data
				).then(function(response){

					for (var key in scope_fields)
					{
						// $scope.enclosure.name = $scope.place_name;
						scope_fields[key][0] = scope_fields[key][1];
					}

					// Avisamos que hemos dejado de editar..
					$scope.editing = false;
				});
			}
			// Si no se está editando abrimos el formulario
			else
				$scope.editing = true;
		};


		scope.del = function(del_msg_confirm){

			if(confirm(del_msg_confirm))
			{
				$http['delete']('/api/v1/' + resource + '/' + element.id
				).then(function(response){

						// var idx = $scope.enclosures.indexOf($scope.enclosure);
						var idx = list.indexOf(element);
						if (idx !== -1) {
							//injected into repeater scope by fadey directive
							//
							// this.del(function() {
							//	$scope.items.splice(idx, 1);
							// });

							list.splice(idx, 1);
						}
						// var place_elem = angular.element(elem);
						// var jq_elem = $(place_elem);
						// jq_elem.fadeOut(300, function() { $(this).remove(); });
				});
			}
		};


		scope.validate = function(){

			var url = '/dyn-validator/' + resource + '/';
			url += $scope.editing ? element.id : '';

			$http.post(url, element_data
			).then(function(response){
				$scope.alert.errors = data.errors ? data.errors : false;
			});
		};
	};
});



// this.read_created_element = function(resource, element_name)
// {
// 	// Devuelve el nuevo elemento creado para el recurso

// 	// http://docs.angularjs.org/api/ng.$q
// 	// var deferred = $q.defer();

// 	return $http.get('/api/v1/' + resource + '/?name__iexact=' + element_data.name)
// 		.then(function(response) {
// 			return response;
// 	});

// 	// deferred.resolve(data.objects[0]);
// 	// return deferred.promise;
// };
