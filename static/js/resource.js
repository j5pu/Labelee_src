

// var r = new resource('place');

// r.getAll();

var API_URL = '/api/v1/';


var resource = function(resource){

    // CRUD

    this.create = function(data){

        // Por ejemplo una petición POST a '/api/v1/place'
        // data = {name: 'matadero'}
        myApp.run(function($http)
        {
            return $http.post(API_URL + resource, data).then(function(response){
                return response;
            });
        });
    };


    this.readAll = function(){
        myApp.run(function($http)
        {
            return $http.get(API_URL + resource).then(function(response){
                // config:
                // data:
                //      meta:
                //      objects:
                // headers:
                // status
                return response;
            });
        });
    };


    this.read = function(id, callback){

        // ANGULAR
        //
        // myApp.run(function($http)
        // {
        //     return $http.get(
        //         API_URL + resource + '/' + id
        //         ).then(function(response){
        //             return callback(response);
        //         }
        //     );
        // });


        // JQUERY
        //
        ajaxGetJSON(
            API_URL + resource + '/' + id,
            function(response){callback(response);}
        );
    };


    this.update = function(id, data, callback){

        // ANGULAR
        //
        // myApp.run(function($http)
        // {
        //     return $http.put(
        //         API_URL + resource + '/' + id,
        //         data
        //         ).then(function(response){
        //             return callback(response);
        //         }
        //     );
        // });

        // JQUERY
        //
        ajaxPutJSON(
            API_URL + resource + '/' + id,
            data,
            function(response){callback(response);}
        );
    };


    this.delete = function(id){
        myApp.run(function($http)
        {
            return $http['delete'](
                API_URL + resource + '/' + id
                ).then(function(response){
                    return response;
                }
            );
        });
    };

};

