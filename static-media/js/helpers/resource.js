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
		// xej para la planta con id 16:
		//		POST -> /api-2/floor/16/img

		var action_url = this.api2_url + element_id + '/img';
		form.attr('action', action_url);

		// mandamos el formulario, no sin antes agregarle el csrfmiddlewaretoken
		var token = $('input[name="csrfmiddlewaretoken"]').clone();
		form.append(token);
		form.submit();

		// dejamos escuchando al iframe con la respuesta del servidor
		listenIframe(form, callback);
	};


    this.delImg = function(element_id){

        //		DELETE -> /api-2/floor/16/img

        $.ajax({
            url : this.api2_url + element_id + '/img',
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
}

function FloorResource()
{
    Resource.call(this, 'floor');

    this.readFromEnclosure = function(enclosure_id) {

        var elements;
        $.ajax({
            url : this.api1_url + '?enclosure__id=' + enclosure_id + '&order_by=floor_number',
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


    this.del = function(floor_id, confirm_msg) {

        if (!confirm(confirm_msg))
            return;

        // Primero eliminamos todos los puntos para el plano, de forma que no
        // puedan quedar aristas sueltas
//        var filter = '?floor__id=' + floor_id;
//        var point_list = new PointResource().readAllFiltered(filter);
//        new PointResource().deletePoints(point_list);

        // Eliminamos la imágen para el plano
        //
        // POR CORREGIR
//        this.delImg(floor_id);

        // Eliminamos la planta
        $.ajax({
            url : this.api1_url + floor_id + '/',
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


    this.renderGrid = function(floor_id){
        // Obtenemos el código html del grid renderizado de lado del servidor para
        // el plano de la planta

        var gridHtml;
        $.ajax({
            url : this.api2_url + 'floor/' + floor_id + '/render-grid',
            type : 'get',
            headers : {
                'Content-Type' : 'application/json'
            },
            dataType : 'json', // esto indica que la respuesta vendrá en formato json
            async : false,
            success : function(response) {
                elements = response;
            },
            error : function(response) {
                var j = response;
            }
        });

        return elements;
    };
}

function LabelResource()
{
	Resource.call(this, 'label');

	this.readFromFloor = function(floor_id) {

		var elements;
		$.ajax({
			url : this.api2_url + 'floor/' + floor_id,
			type : 'get',
			headers : {
				'Content-Type' : 'application/json'
			},
			dataType : 'json', // esto indica que la respuesta vendrá en formato json
			async : false,
			success : function(response) {
				elements = response;
			},
			error : function(response) {
				var j = response;
			}
		});

		return elements;
	};

    this.readGrouped = function() {
        var elements;
        $.ajax({
            url : this.api2_url + 'read-grouped',
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
    }
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
        //      label: "/api/v1/object/1/"
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
	};


    this.updatePoints = function(points_data){
        // Divido los puntos en grupos de 500 y envío cada grupo
        // vía POST -> /api-2/point/update-from-list

        if(points_data.length === 0)
            return;

        var groups = divideInGroups(points_data, 500);

        for(var i in groups)
        {
            var data = groups[i];

            $.ajax({
                url : this.api2_url + 'update-from-list',
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
    };


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
    };


    this.readOnlyPois = function(floor_id)
    {
        // Lee todas las etiquetas que sean consideradas POIs, es decir, que
        // no sean bloqueantes ni intermedias

        // api-2/point/pois/1
        var element;
        $.ajax({
            url : this.api2_url + 'pois/' + floor_id,
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

    this.readConnectionsFromEnclosure = function(enclosure_id)
    {
        return this.readAllFiltered(
            '?label__category__name__icontains=arista' +
                '&floor__enclosure__id=' + enclosure_id +
                '&order_by=description'
        );
    };

    this.readConnectionsFromFloor = function(floor_id)
    {
        return this.readAllFiltered('?label__category__name__icontains=arista&floor__id=' + floor_id);
    };

    this.readQRsFromFloor = function(floor_id)
    {
        qr_codes = new Resource('qr-code').readAllFiltered('?point__floor__id=' + floor_id);

        points = [];
        for(i in qr_codes)
            points.push(qr_codes[i].point);

        return points;
    };
}


function EnclosureResource()
{
    Resource.call(this, 'enclosure');

    this.calculateRoutes = function(enclosure_id){
        $.ajax({
            url : '/calculate-routes/' + enclosure_id,
            type : 'get',
            headers : {
                'Content-Type' : 'application/json'
            },
            dataType : 'json', // esto indica que la respuesta vendrá en formato json
            async : false,
            success : function(response) {
                new_element = response;
            },
            error : function(response) {
                var j = response;
            }
        });
    };
}


function ConnectionResource()
{
    Resource.call(this, 'connection');

    this.readFromEnclosure = function(enclosure_id)
    {
        return this.readAllFiltered('?init__floor__enclosure__id=' + enclosure_id);
    };
}


function RouteResource()
{
    Resource.call(this, 'route');

    this.getRoute = function(origin, destiny)
    {
        var elements;
        $.ajax({
            url : '/get-route/' + origin + '_' + destiny,
            type : 'get',
            headers : {
                'Content-Type' : 'application/json'
            },
            dataType : 'json', // esto indica que la respuesta vendrá en formato json
            async : false,
            success : function(response) {
                elements = response;
            },
            error : function(response) {
                var j = response;
            }
        });

        return elements;
    };
}


function StepResource()
{
    Resource.call(this, 'step');
}


FloorResource.prototype = new Resource;
LabelResource.prototype = new Resource;
LabelCategoryResource.prototype = new Resource;
PointResource.prototype = new Resource;
EnclosureResource.prototype = new Resource;
ConnectionResource.prototype = new Resource;
RouteResource.prototype = new Resource;
StepResource.prototype = new Resource;
