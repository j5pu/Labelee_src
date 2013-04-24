function Resource(resource_url) {

	//
	// Para realizar operaciones CRUD con cualquier recurso,
	// xej: /api/v1/place/
	//

	this.resource_url = resource_url;

	this.create = function(data) {
		$.ajax({
			url : this.resource_url,
			type : 'post',
			headers : {
				'Content-Type' : 'application/json'
			},
			data : JSON.stringify(data),
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

	this.read = function(element_id) {
		var element;
		$.ajax({
			url : this.resource_url + element_id,
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
			url : this.resource_url,
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
			url : this.resource_url + filter,
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
			url : this.resource_url + element_id + '/',
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
			url : this.resource_url + element_id + '/',
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