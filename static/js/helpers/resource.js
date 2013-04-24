function Resource(resource_name) {

	//
	// Para realizar operaciones CRUD con cualquier recurso,
	// xej: /api/v1/place/
	//
	
	this.api1_url = '/api/v1/' + resource_name + '/';
	this.api2_url = '/api-2/' + resource_name + '/';


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

	this.update = function(data, element_id) {
		$.ajax({
			url : this.api1_url + element_id + '/',
			type : 'PUT',
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