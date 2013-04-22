// var icons_path = '/static/img/icons/';

var object_types = {
	"label": '',
	"wall": '',
	"erase": ''
	// 'bar': icons_path + 'bar.png',
	// 'cine': icons_path + 'cine.png',
	// 'informacion': icons_path + 'informacion.png',
	// 'restaurante': icons_path + 'restaurante_.png',
	// 'supermercado': icons_path + 'supermercado.png',
	// 'tienda': icons_path + 'tienda.png'
};


function setCategorySelector()
{
	// Recogemos de la B.D. todos los object_types

	$.ajax({
        url: '/api/v1/object-category/',
        type: 'get',
        headers: {'Content-Type': 'application/json'},
        dataType: 'json',  // esto indica que la respuesta vendrá en formato json
        success: function(response){
			for(var i in response.objects){
				var id = response.objects[i].id;
				var name = response.objects[i].name;
				var el = '<option value="' + id + '">' + name + '</option>';
				elements.category_selector.append(el);
				elements.form_object.category.append(el);
			}
        },
        error: function(response){
			var j = response;
        }
    });

	// for(var key in object_types)
	// 	elements.obj_selector.append('<option value="' + key + '">' + key + '</option>');


}


function setObjectSelector()
{
	var category_id = elements.category_selector.val();

	// Pedimos sólo los objetos
	$.ajax({
        url: '/api/v1/object/?category__id=' + category_id,
        type: 'get',
        headers: {'Content-Type': 'application/json'},
        dataType: 'json',  // esto indica que la respuesta vendrá en formato json
        success: function(response){
        	// Limpiamos el selector de objetos
        	elements.object_selector.children().not('.prompt_option').remove();
        	
        	// Agregamos los objetos para la categoría seleccionada
			for(var i in response.objects){
				var id = response.objects[i].id;
				var name = response.objects[i].name;
				var el = '<option value="' + id + '">' + name + '</option>';
				elements.object_selector.append(el);
			}
        },
        error: function(response){
			var j = response;
        }
    });
}


function createObjectCategory()
{

	//
	// 1: Creamos el registro en B.D.

	var data = {'name': elements.form_category.name.val()};

	$.ajax({
        url: '/api/v1/object-category/',
        type: 'post',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify(data),
        dataType: 'json',  // esto indica que la respuesta vendrá en formato json
        success: function(response){

			//
			// 2: Una vez creado subimos su imágen

			// definimos la URL donde se mandará el formulario, xej para el id 16:
			//		POST -> /api-2/object-type/16/img

			var action_url = '/api-2/object-category/' + response.id + '/img';
			elements.form_category.img_form.attr('action', action_url);

			// mandamos el formulario
			elements.form_category.img_form.submit();
        },
        error: function(response){
			var j = response;
        }
    });
}


function createObject()
{
	// Creamos primero registro en en la B.D para el objeto

	var category_id = elements.form_object.category.val();
	var data = {
		'name': elements.form_object.name.val(),
		'category': '/api/v1/object-category/' + category_id + '/'
	};

	$.ajax({
        url: '/api/v1/object/',
        type: 'post',
        headers: {'Content-Type': 'application/json'},
        data: JSON.stringify(data),
        dataType: 'json',  // esto indica que la respuesta vendrá en formato json
        success: function(response){

			//
			// 2: Una vez creado el objeto subimos su imágen

			// definimos la URL donde se mandará el formulario, xej para el id 16:
			//		POST -> /api-2/object/16/img

			var action_url = '/api-2/object/' + response.id + '/img';
			elements.form_object.img_form.attr('action', action_url);

			// mandamos el formulario
			elements.form_object.img_form.submit();
        },
        error: function(response){
			var j = response;
        }
    });
}



function showMenu()
{

	// Rellenamos los selectores

	setCategorySelector();

}


function clearForm(form_name)
{
	// Esto se ejecuta como callback tras haber subido el archivo, de manera
	// que el formulario se vuelva a recargar con todo en blanco

	switch(form_name)
	{
		case 'object-category':
			elements.form_category.name.val('');
			elements.form_category.img.val('');

			elements.form_category.root_node.hide(400);

			// volvemos a rellenar el selector con el nuevo dato
			setCategorySelector();
			break;
			
		case 'object':
			elements.form_object.name.val('');
			elements.form_object.img.val('');

			elements.form_object.root_node.hide(400);
			break;
	}

}