

// Cambiamos los delimitadores en angularJS de {{var}} a [[var]] para que no se
// confunda con el sistema de plantillas de Django..
var myApp = angular.module('myApp', ['ngSanitize'],
	function($interpolateProvider) {
		$interpolateProvider.startSymbol('[[');
		$interpolateProvider.endSymbol(']]');
	}
// Le pasamos el token generado por django en {% csrf_token %} para
// poder hacer peticiones POST, PUT etc..
).config(function($httpProvider) {
	token = getCookie('csrftoken');
	// $httpProvider.defaults.headers.post['X-CSRFToken'] = $('input[name=csrfmiddlewaretoken]').val();
	$httpProvider.defaults.headers.post['X-CSRFToken'] = token;
});


//
// SERVICIOS
//

myApp.factory('PartialsService', function($rootScope) {

	// Servicio a aplicar en los controladores donde se quiera hacer referencia
	// a alguna plantilla usando ng-include

	var PARTIALS_PATH = '/templates/_partials/';

	$rootScope._form_alert_box = PARTIALS_PATH + '_form_alert_box.html';
	$rootScope._editable_place = PARTIALS_PATH + '_editable_place.html';
	$rootScope._editable_map = PARTIALS_PATH + '_editable_map.html';
	$rootScope._uploading_iframe = PARTIALS_PATH + '_uploading_iframe.html';
});


myApp.factory('ListService', function($http) {

	// Devuelve la lista de elementos para un recurso dado
	return {

		readAll: function(resource, list){

			// Trae toda la lista de elementos de un recurso dado y
			// la pasa al scope, por ejemplo:
			//
			//		resource = 'place'
			//		list = $scope.places

			$http.get('/api/v1/' + resource)
				.success(function(data, status) {
					// $scope.status = status;
					// $scope.data = data;
					list = data.objects;
			});
		}
	};
});


myApp.factory('CrudService', function($http) {

	var read_created_element = function(resource, element_name)
	{
		// Devuelve el nuevo elemento creado para el recurso

		// http://docs.angularjs.org/api/ng.$q
		var deferred = $q.defer();

		$http.get('/api/v1/' + resource + '/?name__iexact=' + element_name)
			.success(function(data, status) {
				deferred.resolve(data.objects[0]);
		});

		return deferred.promise;
	};

	return {

		// Devuelve un conjunto de 'CRUD operations' (Create, Read, Update, Delete)
		// sobre un recurso dado


		readAll: function(resource, list){

			// Trae toda la lista de elementos de un recurso dado y
			// la pasa al scope, por ejemplo:
			//
			//		resource = 'place'
			//		list = $scope.places

			$http.get('/api/v1/' + resource)
				.success(function(data, status) {
					// $scope.status = status;
					// $scope.data = data;
					list = data.objects;
			});
		},


		create: function(resource, element_data, list){

			// Crea un elemento en la lista perteneciente a un recurso dado
			//
			// args = {
			//		resource: 'place',
			//		element_data: {name: $scope.place_name},
			//		list: $scope.places,
			//		to_clean: $scope.place_name
			// }
			//

			$http.post('/api/v1/' + resource, element_data)
				.success(function(data, status, headers, config) {

					read_created_element().then(function(received_element){
						// Hasta que no se haya leído el nuevo elemento creado no podremos
						// insertarlo en list y hacer lo demás..
						list.push(received_element);
						$scope.alert.errors = false;
						to_clean = '';
					});
				}).error(function(data, status, headers, config) {
					// $scope.status = status;
					// $scope.errors = data.places;
			});
		},


		read: function(resource, element_id){

			// Trae toda la lista de elementos de un recurso dado y
			// la pasa al scope, por ejemplo:
			//
			//		resource = 'place'
			//		element = $scope.place

			$http.get('/api/v1/' + resource + '/' + element_id)
				.success(function(data, status) {
					return data.objects;
			});
		},


		update: function(resource, element, element_data, scope_fields){

			// e.g:
			//		resource: 'place'
			//		element = $scope.place
			//		element_data: {name: $scope.place_name},
			//		scope_fields = {
			//			place_name: [$scope.place.name, $scope.place_name],
			//			...
			//		}

			if($scope.editing)
			{
				// Si se está editando el formulario entonces enviamos los datos

				$http.put(
					'/api/v1/' + resource + '/' + element.id,
					element_data
				).success(function(data, status) {

					for (var key in scope_fields)
					{
						// $scope.place.name = $scope.place_name;
						scope_fields[key][0] = scope_fields[key][1];
					}

					// Avisamos que hemos dejado de editar..
					$scope.editing = false;
				});
			}
			// Si no se está editando abrimos el formulario
			else
				$scope.editing = true;
		},


		del: function(resource, element, list, del_msg_confirm){

			// element = $scope.place
			// list = $scope.places
			if(confirm(del_msg_confirm))
			{
				$http['delete']('/api/v1/' + resorce + '/' + element.id
					).success(function(){

						// var idx = $scope.places.indexOf($scope.place);
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
		},


		validate: function(resource, element, element_data){


			// element = $scope.place
			// element_data = {name: $scope.place_name}

			var url = '/dynamic-validator/' + resource + '/';
			url += $scope.editing ? element.id : '';

			$http.post(url, element_data
			).success(function(data, status, headers, config) {
				// $scope.data = data;
				$scope.alert.errors = data.errors ? data.errors : false;
			}).error(function(data, status, headers, config) {
				// $scope.status = status;
				// $scope.errors = data.places;
			});
		}
	};
});



function getCookie(name) {
	var cookieValue = null;
	if (document.cookie && document.cookie !== '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			var cookie = jQuery.trim(cookies[i]);
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) === (name + '=')) {
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}

	return cookieValue;
}
