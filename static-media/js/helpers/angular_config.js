

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

	var PARTIALS_PATH = '/static/partials/';

	$rootScope._form_alert_box = PARTIALS_PATH + '_form_alert_box.html';
	$rootScope._editable_enclosure = PARTIALS_PATH + '_editable_enclosure.html';
	$rootScope._editable_floor = PARTIALS_PATH + '_editable_floor.html';
	$rootScope._uploading_iframe = PARTIALS_PATH + '_uploading_iframe.html';
});


myApp.factory('ListService', function($http) {

	// Devuelve la lista de elementos para un recurso dado
	return {

		readAll: function(resource, list){

			// Trae toda la lista de elementos de un recurso dado y
			// la pasa al scope, por ejemplo:
			//
			//		resource = 'enclosure'
			//		list = $scope.enclosures

			$http.get('/api/v1/' + resource)
				.success(function(data, status) {
					// $scope.status = status;
					// $scope.data = data;
					list = data.objects;
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
