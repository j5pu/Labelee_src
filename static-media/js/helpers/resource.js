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

		// xej: /api/v1/floor/?enclosure__id=1

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
        var element;
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
				element = data;
			},
			error : function(respuesta) {
				var i = 4;
			}
		});

        return element;
	};

	this.del = function(element_id, confirm_msg, callback) {
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
                if(callback)
				    callback(response);
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
            url : this.api1_url + '?enclosure__id=' + enclosure_id + '&order_by=-floor_number',
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

    this.readValidAsPois = function(enclosure_id){
        // /api-2/label-category/valid/16
        return ajaxGetElements(this.api2_url, 'valid/' + enclosure_id);
    };

    this.getForManagerIndex = function(enclosure_id)
    {
        // Nos da toda la lista de categorías a mostrar en el manager sobre ese recinto
        return ajaxGetElements(this.api2_url, 'manager/' + enclosure_id);
    };

    this.readForFloorEdit = function(enclosure_id)
    {
        // Lista de categorías a mostrar en la página de edición de planta
        return ajaxGetElements(this.api2_url, 'all/' + enclosure_id);
    };

    this.readCustom = function(enclosure_id)
    {
        // Lista de categorías a mostrar en la página de edición de planta
        return ajaxGetElements(this.api2_url, 'custom/' + enclosure_id);
    }
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


    this.countPois = function(enclosure_id)
    {
        // Lee todas las etiquetas que sean consideradas POIs, es decir, que
        // no sean bloqueantes ni intermedias

        // api-2/point/pois/enclosure/16/count
        var element;
        $.ajax({
            url : this.api2_url + 'pois/enclosure/' + enclosure_id + '/count',
            type : 'get',
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

    this.getForManagerIndex = function(enclosure_id)
    {
        // Nos da toda la info necesaria para cargar el index de map-editor
        if(enclosure_id)
            return ajaxGetElements(this.api2_url, 'manager/' + enclosure_id + '/');

        return ajaxGetElements(this.api2_url, 'manager/');
    }
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


function UserResource()
{
    Resource.call(this, 'user');
}


function QrCodeResource()
{
    Resource.call(this, 'qr-code');
}


function DashboardResource()
{
    this.dashboard_url = '/dashboard/';

    this._getScansUrl = function(enclosure_id)
    {
        return this.dashboard_url + 'scans/' + enclosure_id;
    };

    this._getDisplayedRoutesUrl = function(enclosure_id)
    {
        return this.dashboard_url + 'routes/' + enclosure_id;
    };

    this.getScansByCategory = function(enclosure_id)
    {
        // /dashboard/scans/(?P<enclosure_id>\d+)/by-category/
        return ajaxGetElements(this._getScansUrl(enclosure_id), '/by-category/');
    };

    this.getScansForTopPois = function(enclosure_id)
    {
        return ajaxGetElements(this._getScansUrl(enclosure_id), '/top-pois/');
    };

    this.getDisplayedRoutesByCategory = function(enclosure_id)
    {
        // /dashboard/scans/(?P<enclosure_id>\d+)/by-category/
        return ajaxGetElements(this._getDisplayedRoutesUrl(enclosure_id), '/by-category/');
    };

    this.getDisplayedRoutesForTopPois = function(enclosure_id)
    {
        return ajaxGetElements(this._getDisplayedRoutesUrl(enclosure_id), '/top-pois/');
    };
}


function CouponResource()
{
    this.coupons_url = '/coupon/';

    this.getManager = function()
    {
        // /coupon/manager/
        return ajaxGetElements(this.coupons_url, 'manager/');
    };

    this.getCoupon = function(label_id)
    {
        // /coupon/manager/label/<label_id>
        return ajaxGetElements(this.coupons_url, 'label/' + label_id);
    };
}


FloorResource.prototype = new Resource();
var floorResource = new FloorResource();
LabelResource.prototype = new Resource();
var labelResource = new LabelResource();
LabelCategoryResource.prototype = new Resource();
var labelCategoryResource = new LabelCategoryResource();
PointResource.prototype = new Resource();
var pointResource = new PointResource();
EnclosureResource.prototype = new Resource();
var enclosureResource = new EnclosureResource();
ConnectionResource.prototype = new Resource();
RouteResource.prototype = new Resource();
StepResource.prototype = new Resource();
UserResource.prototype = new Resource();
var userResource = new UserResource();
var qrCodeResource = new QrCodeResource();
var dashBoardResource = new DashboardResource();
var couponResource = new CouponResource();
