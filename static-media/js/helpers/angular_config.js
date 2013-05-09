

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

/*myApp.factory('PartialsService', function($rootScope) {

	// Servicio a aplicar en los controladores donde se quiera hacer referencia
	// a alguna plantilla usando ng-include

	var PARTIALS_PATH = '/static/partials/';

	$rootScope._form_alert_box = PARTIALS_PATH + '_form_alert_box.html';
	$rootScope._editable_enclosure = PARTIALS_PATH + '_editable_enclosure.html';
	$rootScope._editable_floor = PARTIALS_PATH + '_editable_floor.html';
	$rootScope._uploading_iframe = PARTIALS_PATH + '_uploading_iframe.html';
});*/


//
//DIRECTIVAS
//

//<include src="{{ STATIC_URL }}partials/_editable_enclosure.html">
myApp.directive('include', function($parse){
    return {
        restrict: 'E',
        scope: {src: '@'},
        // En este caso fabricamos la plantilla como un string concatenado..
        template:
            '<div ng-include src="src"></div>',
        link: function(scope, element, attrs){
            scope = scope.$parent.$parent;

            var a = scope.enclosure.name;
//            scope.floor = scope.$parent.$parent.floor;
        }
    };
});


myApp.directive('zippy', function(){
    return {
        restrict: 'E',
        // Esto hace que el contenido Hello [[name]]! vaya a parar donde incluyamos
        // la directiva ng-transclude, en este caso en el body de nuestra plantilla
        transclude: true,
        scope: {title: '@title'},
        // En este caso fabricamos la plantilla como un string concatenado..
        template:
            '<div class="zippy {{state}}">' +
                '<div class="title" ng-click="toggle()">{{title}}</div>' +
                '<div class="body" ng-transclude></div>' +
                '</div>'

//        link: function(scope, element, attrs){
//            scope.leak = 'LEAKING';
//            scope.state = 'opened';
//            scope.toogle = function(){
//                scope.state = scope.state == 'opened' ? 'closed' : 'opened';
//            };
//        }
    };
});
