

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

myApp.factory('UrlService', function($rootScope) {

	// Servicio a aplicar en los controladores donde se quiera hacer referencia
	// a alguna plantilla usando ng-include

	var MAP_EDITOR_URL = '/map-editor/';
    var STATIC_URL = '/static/';

    $rootScope.urls = {
        map_editor: {
            index: MAP_EDITOR_URL,
            edit: MAP_EDITOR_URL + 'edit'
        },
        static: {
            img: STATIC_URL + 'img'
        }
    };
});


//
//DIRECTIVAS
//

//<include src="{{ STATIC_URL }}partials/_enclosure.html">
myApp.directive('include', function(){
    return {
        restrict: 'E',
        scope: {src: '@'},
        template: '<div ng-include src="src"></div>',
        link: function(scope){
           var i = 2;
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
