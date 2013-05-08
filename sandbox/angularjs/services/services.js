myApp.factory('UserService', function($rootScope) {
    $rootScope.name = 'anonymous33';
    // return {
    //     name: name,
    //     sayGoodNight: function(name){
    //         return 'good night!, silly ' + name + '!!';
    //     }
    // };
});


// myApp.factory('UserService2', function() {

//     return function(scope, resource){
//         scope.name = resource;
//         // name: 'anon99',
//         // sayGoodNight: function(name){
//         //     return 'good night!, silly ' + name + '!!';
//         // }
//     };
// });


function MyCtrl($scope) {

    // u = new UserService2($scope, 'enclosure');
	// $scope.user = UserService2;

    // $scope.name = UserService.name;
    $scope.name = 'Ramón';
    // $scope.sayGoodNight = UserService.sayGoodNight('Emilio');
}


// function ListCtrl($scope)
// {
//     $scope.enclosures = ['place1', 'place2', 'place3'];
// }




// myApp.directive('list', function(){
// 	return {
// 		restrict: 'E',
// 		transclude: true,
// 		scope: {
// 			resource: '@',
// 			listName: '@'
// 		},
// 		template:
// 			'<div' +
// 				'resource="[[resource]]"' +
// 				'class="box box-0"' +
// 				'ng-controller="ListCtrl"' +
// 				'ng-transclude' +
// 			'></div>',
// 		link: function linkFn(scope, lelement, attrs){
// 			//$parse(attrs.listName).assign(scope);
// 		}
// 	};
// });




// var deferred = $q.defer();

// $http.post('/api/v1/' + resource, element_data)
//     .success(function(data, status, headers, config) {

//         read_created_element().then(function(received_element){
//             // Hasta que no se haya leído el nuevo elemento creado no podremos
//             // insertarlo en list y hacer lo demás..
//             list.push(received_element);
//             $scope.alert.errors = false;
//             to_clean = '';
//         });

//         deferred.resolve();
//     }).error(function(data, status, headers, config) {
//         // $scope.status = status;
//         // $scope.errors = data.enclosures;
// });

// return deferred.promise;
