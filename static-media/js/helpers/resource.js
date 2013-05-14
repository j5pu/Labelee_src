function Resource(resource_name) {

	//
	// Para realizar operaciones CRUD con cualquier recurso,
	// xej: /api/v1/enclosure/
	//

	ajaxSetup();

	this.resource_name = resource_name;

	this.api1_url = '/api/v1/' + this.resource_name + '/';
	this.api2_url = '/api-2/' + this.resource_name + '/';


	this.create = function(data) {
		var new_element;

		$.ajax({
			url : this.api1_url,
			type : 'post',
			headers : {
				'Content-Type' : 'application/json'
			},
			data : JSON.stringify(data),
			dataType : 'json', // esto indica que la respuesta vendrá en formato json
			async : false,
			success : function(response) {
				new_element = response;
			},
			error : function(response) {
				var j = response;
			}
		});

		return new_element;
	};

	this.read = function(element_id) {
		var element;
		$.ajax({
			url : this.api1_url + element_id,
			type : 'get',
			headers : {
				'Content-Type' : 'application/json'
			},
			dataType : 'json', // esto indica que la respuesta vendrá en formato json
			async : false,
			success : function(response) {
				element = response;
			},
			error : function(response) {
				var j = response;
			}
		});

		return element;
	};

	this.readAll = function() {
		var elements;
		$.ajax({
			url : this.api1_url,
			type : 'get',
			headers : {
				'Content-Type' : 'application/json'
			},
			dataType : 'json', // esto indica que la respuesta vendrá en formato json
			async : false,
			success : function(response) {
				elements = response.objects;
			},
			error : function(response) {
				var j = response;
			}
		});

		return elements;
	};

	this.readAllFiltered = function(filter) {

		// xej: /api/v1/map/?place__id=1

		var elements;
		$.ajax({
			url : this.api1_url + filter,
			type : 'get',
			headers : {
				'Content-Type' : 'application/json'
			},
			dataType : 'json', // esto indica que la respuesta vendrá en formato json
			async : false,
			success : function(response) {
				elements = response.objects;
			},
			error : function(response) {
				var j = response;
			}
		});

		return elements;
	};


	this.readFromUri = function(uri) {

		// xej: uri = /api/v1/object/1/

		var element;
		$.ajax({
			url : uri,
			type : 'get',
			headers : {
				'Content-Type' : 'application/json'
			},
			dataType : 'json', // esto indica que la respuesta vendrá en formato json
			async : false,
			success : function(response) {
				element = response;
			},
			error : function(response) {
				var j = response;
			}
		});

		return element;
	};


	this.update = function(data, element_id) {
		$.ajax({
			url : this.api1_url + element_id + '/',
			type : 'put',
			data : JSON.stringify(data),
			headers : {
				'Content-Type' : 'application/json'
			},
			dataType : 'json', // esto indica que la respuesta vendrá en formato json
			async : false,
			success : function(data) {
				var j = 1;
			},
			error : function(respuesta) {
				var i = 4;
			}
		});
	};

	this.del = function(element_id, confirm_msg) {
		if (!confirm(confirm_msg))
			return;

		$.ajax({
			url : this.api1_url + element_id + '/',
			type : 'delete',
			headers : {
				'Content-Type' : 'application/json'
			},
			dataType : 'json', // esto indica que la respuesta vendrá en formato json
			async : false,
			success : function(response) {
				var i = response;
			},
			error : function(response) {
				var j = response;
			}
		});
	};


	this.addImg = function(form, element_id, callback){

		// definimos la URL donde se mandará el formulario con la imágen,
		// xej para el mapa con id 16:
		//		POST -> /api-2/map/16/img

		var action_url = this.api2_url + element_id + '/img';
		form.attr('action', action_url);

		// mandamos el formulario, no sin antes agregarle el csrfmiddlewaretoken
		var token = $('input[name="csrfmiddlewaretoken"]').clone();
		form.append(token);
		form.submit();

		// dejamos escuchando al iframe con la respuesta del servidor
		listenIframe(form, callback);
	};
}


function FloorResource()
{
    Resource.call(this, 'floor');
}

function LabelResource()
{
	Resource.call(this, 'label');

	this.readFromFloor = function(floor_id) {

		// Para obtener todos los objetos de un grid, agrupados por id:
		// 		uri = /api-2/object/grid/4
        //
        // -> objects = {
        // 		'api/v1/object/1': {
        //			category_id: 1
        //			category_name: builder
	    //			id: 1
	    //			img: "img/objects/builders/wall.png"
	    //			name: "wall"
	    //			total: 6
	    //			resource_uri: api/v1/object/1
	    //			from_db: True
        // 		},
        //      ..
        //   }

		var element;
		$.ajax({
			url : this.api2_url + 'floor/' + floor_id,
			type : 'get',
			headers : {
				'Content-Type' : 'application/json'
			},
			dataType : 'json', // esto indica que la respuesta vendrá en formato json
			async : false,
			success : function(response) {
				element = response;
			},
			error : function(response) {
				var j = response;
			}
		});

		return element;
	};
}


function LabelCategoryResource()
{
    Resource.call(this, 'label-category');
}


function PointResource()
{
	Resource.call(this, 'point');

	this.createPoints = function(points_data){
        // Divido los puntos en grupos de 500 y envío cada grupo
        // vía POST -> /api-2/point/create-from-list
        //
        // point0 = {
        //      row: 12,
        //      col: 33,
        //      grid: "/api/v1/grid/35/",
        //      object: "/api/v1/object/1/"
        // }
        //
        // points_data = [{point0}, {point1}..]

        if(points_data.length === 0)
            return;

        var groups = divideInGroups(points_data, 500)

        //
        // Vamos iterando sobre cada grupo y lo enviamos al web service
		for(var i in groups)
		{
			var data = groups[i];

			$.ajax({
				url : this.api2_url + 'create-from-list',
				type : 'post',
				headers : {
					'Content-Type' : 'application/json'
				},
				data : JSON.stringify(data),
				dataType : 'json', // esto indica que la respuesta vendrá en formato json
				async : false,
				success : function(response) {
					new_element = response;
				},
				error : function(response) {
					var j = response;
				}
			});
		}
	}


    this.deletePoints = function(points_data){
        // Divido los puntos en grupos de 500 y envío cada grupo
        // vía POST -> /api-2/point/delete-from-list

        if(points_data.length === 0)
            return;

        var groups = divideInGroups(points_data, 500);

        for(var i in groups)
        {
            var data = groups[i];

            $.ajax({
                url : this.api2_url + 'delete-from-list',
                type : 'post',
                headers : {
                    'Content-Type' : 'application/json'
                },
                data : JSON.stringify(data),
                dataType : 'json', // esto indica que la respuesta vendrá en formato json
                async : false,
                success : function(response) {
                    new_element = response;
                },
                error : function(response) {
                    var j = response;
                }
            });
        }
    }
}


LabelResource.prototype = new Resource;
LabelCategoryResource.prototype = new Resource;
PointResource.prototype = new Resource;
