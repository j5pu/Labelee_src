var demoApp = angular.module('demoApp', [],
    function($interpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    }
);

var SimpleController = function($scope) {

    $scope.customers = [
        {name: 'John Smith', city:'Phoenix'},
        {name: 'Chuck Norris', city:'Ohio'},
        {name: 'John Cobra', city:'Valencia'},
        {name: 'King Kong', city:'Washington'}
    ];
};

demoApp.controller('SimpleController', SimpleController);

// Tenemos varias formas de definir controladores:
//
//    var controllers = {};
//    controllers.SimpleController = function($scope){...};
//    controllers.Controller2 = function($scope){...};
//    demoApp.controller(controllers);
//
//    demoApp.controller('SimpleController', SimpleController);
//
//    function SimpleController($scope) {...}


//demoApp.config(function ($routeProvider)
//{
//    $routeProvider
//        .when('/',
//            {
//                controller: 'SimpleController',
//                templateUrl: 'View1.html'
//            })
//        .when('/partial2',
//            {
//                controller: 'SimpleController',
//                templateUrl: 'View2.html'
//            })
//        .otherwise({redirectTo: '/'});
//});