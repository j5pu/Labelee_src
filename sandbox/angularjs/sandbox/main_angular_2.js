
$(document).on('ready', function(){
});


function ListCtrl($scope, $http, $parse) {

	$scope.readAll = function()
	{
		// Trae toda la lista de lugares

		$http.get('/api/v1/' + $scope.resource)
			.success(function(data, status) {
				// $scope.status = status;
				// $scope.data = data;
				switch($scope.resource)
				{
					case 'enclosure':
						$scope.enclosures = data.objects;
						break;
					case 'map':
						$scope.floors = data.objects;
						break;
				}
				 // Show result from server in our <pre></pre> element
		});
	};

	//Sólo si
	return $scope.read();
}


function ElementCtrl($scope, $http, $element, $q)
{

	// Indica si tenemos abierto el formulario para editar el lugar
	$scope.editing = false;

	// A usar en la plantilla _/form_alert_box.html
	$scope.alert = {
		errors: false,
		success_msg: false
	};


	var readCreatedPlace = function()
	{
		// Devuelve el nuevo lugar creado

		// http://docs.angularjs.org/api/ng.$q
		var deferred = $q.defer();

		$http.get('/api/v1/enclosures/?name__iexact=' + $scope.place_name)
			.success(function(data, status) {
				deferred.resolve(data.objects[0]);
		});

		return deferred.promise;
	};


	$scope.create = function()
	{
		$http.post('/api/v1/enclosures/', {name: $scope.place_name})
			.success(function(data, status, headers, config) {

				readCreatedPlace().then(function(place){
					// Hasta que no se haya leído el nuevo lugar creado no podremos
					// insertarlo en $scope.enclosures y hacer lo demás..
					$scope.enclosures.push(place);
					$scope.alert.errors = false;
					$scope.alert.success_msg = 'Lugar <b>' + $scope.place_name +
						'</b> creado correctamente';
					$scope.place_name = '';
				});
			}).error(function(data, status, headers, config) {
				// $scope.status = status;
				$scope.errors = data.enclosures;
		});
	};

	$scope.update = function()
	{
		// Si se está editando el formulario entonces enviamos los datos
		if($scope.editing)
		{
			$http.put(
				'/api/v1/enclosures/' + $scope.enclosure.id,
				{name: $scope.place_name}
			).success(function(data, status) {

				$scope.enclosure.name = $scope.place_name;

				// Avisamos que hemos dejado de editar..
				$scope.editing = false;
			});
		}
		// Si no se está editando abrimos el formulario
		else
			$scope.editing = true;
	};

	$scope.del = function()
	{
		if(confirm("¿Seguro que desea eliminar el lugar? (también se perderán todos sus mapas)"))
		{
			$http['delete']('/api/v1/enclosures/' + $scope.enclosure.id).success(function(){

				var idx = $scope.enclosures.indexOf($scope.enclosure);
				if (idx !== -1) {
					//injected into repeater scope by fadey directive
					this.del(function() {
						$scope.items.splice(idx, 1);
					});
				}
				// var place_elem = angular.element(elem);
				// var jq_elem = $(place_elem);
				// jq_elem.fadeOut(300, function() { $(this).remove(); });
			});
		}
	};

	$scope.validate = function()
	{
		var url = '/dynamic-validator/enclosure/';
		url += $scope.editing ? $scope.enclosure.id : '';

		$http.post(url, {name: $scope.place_name}
		).success(function(data, status, headers, config) {
			// $scope.data = data;
			$scope.alert.errors = data.errors ? data.errors : false;
			$scope.alert.success_msg = false;
		}).error(function(data, status, headers, config) {
			// $scope.status = status;
			// $scope.errors = data.enclosures;
		});
	};
}


//
// DIRECTIVAS PROPIAS
//

myApp.directive('fadey', function() {
	return {
		restrict: 'A',
		link: function(scope, elm, attrs) {
			var duration = parseInt(attrs.fadey, 10);
			if (isNaN(duration)) {
				duration = 500;
			}

			scope.$watch('[create, editing]', function () {
				elm = $(elm);
				elm.hide();
				elm.fadeIn(duration);
			}, true);

			scope.del = function(complete) {
				elm.fadeOut(duration);
			};
		}
	};
});


myApp.directive('resource', function(){
	return {
		restrict: 'A',
		scope: { resource: '@'}
	};
});


myApp.directive('list', function(){
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			resource: '@',
			listName: '@'
		},
		template:
			'<div' +
				'resource="[[resource]]"' +
				'class="box box-0"' +
				'ng-controller="ListCtrl"' +
				'ng-transclude' +
			'></div>',
		link: function linkFn(scope, lelement, attrs){
			$parse(attrs.listName).assign(scope);
		}
	};
});