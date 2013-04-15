var myApp = angular.module('myApp', [],
    function($interpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    }
);


myApp.controller('Demo', function($scope){

    $scope.leak = '###';

    $scope.email = 'eljefe@mundo.mu';

    $scope.devs = [
        'dev1@example.org',
        'dev2@example.org',
        'dev3@example.org',
        'dev4@example.org'
    ];
});


myApp.directive('demoGreet', function($parse){
    return {
        // Si queremos que se use como un atributo (A), como una clase (C),
        // o como un elemento (E):
            // <div demo-greet="name"></div>
            // <div class="demo-greet: name"></div>
            // <demo-greet demo-greet="name"></demo-greet> (esto último con IE sólo funciona a partir de la versión 9)
        restrict: 'ACE',
        // Como la plantilla es la misma sobre la que se llama a la directiva
        // usamos link
        link: function linkFn(scope, lelement, attrs){
            // $watch sirve para que la vista pueda 'observar' el modelo
            // no sólo al cargar la página

            // Sólo observa el ng-model='name':
            //
            // scope.$watch('name', function(name){
            //     $(lelement).text('Hello ' + name + '!');
            // });

            // Observa cualquier atributo que le pasemos
            scope.$watch(attrs.demoGreet, function(name){
                $(lelement).text('Hello ' + name + '!');
            });


            // Si hacemos click sobre el saludo poder meter en el input el valor 'abc'..

            // NON-Angular world (no se cambia el valor de input al hacer esto):
            //
            // $(lelement).on('click', function(){
            //     scope.name = 'abc';
            //     $(this).css({'background': 'aquamarine'});
            // });


            // Angular world:
            //     usamos $apply para poder interactuar con el scope
            $(lelement).on('click', function(){

                // Podemos jugar con jQuery sobre el elemento..
                $(this).css({'background': 'aquamarine'});


                // Sin parametrizar el elemento del scope al que queremos dar 'abc'
                //
                // scope.$apply(function(){
                //     scope.name = 'abc';
                // });


                // Parametrizándolo.. En lugar de ser sólo scope.name -> scope.[cualquiera]
                //
                // 1.   Llamamos a otro servicio, $parse, el cual obtendrá el elemento
                //      al que apunta el atributo de demo-greet
                // 2.   Si el elemento obtenido es asignable se le asignará al scope con un valor dado

                scope.$apply(function(){
                    $parse(attrs.demoGreet).assign(scope, 'abc');
                });

            });
        }
    };
});


myApp.directive('profile', function(){
    return {
        restrict: 'E',
        // Creamos un nuevo scope único para cada <profile>, por lo que si ponemos más abajo
        // $scope.leak = 'XXXX' no se cambiará en el $scope.leak de fuera, sino
        // que tendrá uno propio (se puede ver gráficamente con la extensión 'AngularJS Batarang' para chrome)
        //
        //scope: true,

        // Si aun teniendo un scope propio (podemos comprobarlo con el Batarang),
        // queremos acceder al objeto scope.email de fuera:
        scope: {
            email: '='
            // por lo que se lo pasaremos así: <profile email='email'></profile>
            //
            // Si ponemos <profile email='{{email}}'></profile> en la plantilla
            // se imprimirá '{{email}}' tal cual.
            // Vemos que scope.email es un string, por lo que si queremos que
            // esto funcione ponemos scope: {email: '@'} en lugar de '='
        },
        // Cuidadín al hacer referencia a un HTML sin usar el sistema de plantillas
        // de Django.. Tenemos que ubicarlo en un sitio donde podamos acceder (al igual que con img, js, css, etc)
        templateUrl: '/media/partials/profile.html',
        link: function(scope){
            scope.leak = 'XXXXX';
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
            '</div>',

        link: function(scope, element, attrs){
            scope.leak = 'LEAKING';
            scope.state = 'opened';
            scope.toogle = function(){
                scope.state = scope.state == 'opened' ? 'closed' : 'opened';
            };
        }
    };
});