// var icons_path = '/static/img/icons/';

var sending_img = false;


function setObject()
{
	// Seteamos el objeto a pintar (paint.js -> object)

	$.ajax({
        url: '/api/v1/object/' + elements.object_selector.val(),
        type: 'get',
        headers: {'Content-Type': 'application/json'},
        dataType: 'json',  // esto indica que la respuesta vendrá en formato json
        success: function(response){
            // object_to_paint es una variable global que usaremos cada vez que queramos
            // pintar un objeto
			object_to_paint = response;
            elements.object_selector.blur();
        },
        error: function(response){
			var j = response;
        }
    });
}


function setCategorySelector()
{
	// Recogemos de la B.D. todos los ObjectCategory y los metemos en el selector
	
	var categories = new Resource('object-category').readAll();
	
	var prompt_opt = 'Selecc. categoría';
	setSelector(elements.category_selector, categories, prompt_opt);
	setSelector(elements.form_object.category, categories, prompt_opt);
}


function setGridSelector()
{	
	var grids = new Resource('grid').readAllFiltered('?map__id=' + map.id);	
	setSelector(elements.grid_selector, grids, 'Selecc. grid');
}


function setObjectSelector()
{
	var category_id = elements.category_selector.val();
	var objects = new Resource('object').readAllFiltered('?category__id=' + category_id);
	setSelector(elements.object_selector, objects, 'Selecc. objeto');
}


function createObjectCategory()
{
	//
	// 1: Creamos el registro en B.D.
	var data = {'name': elements.form_category.name.val()};

	var objectCateg_resource = new Resource('object-category');
	var new_objectCateg = objectCateg_resource.create(data);

	// 2. Si se ha elegido una imágen la subimos
	var img_form = $(this).closest('form');
	
	if(!img_form.find('input[name=img]').val())
	{
		clearFormCateg();
		return;
	}
		
	
	sending_img = true;
	
	objectCateg_resource.addImg(
		img_form,
		new_objectCateg.id,
		function(server_response){
			clearFormCateg();
			sending_img = false;
		}
	);
}


function clearFormCateg()
{
	elements.form_category.name.val('');
	elements.form_category.img.val('');

	elements.form_category.root_node.hide(400);

	// volvemos a rellenar el selector con el nuevo dato
	setCategorySelector();
			
}


function createObject()
{
	//
	// 1. Creamos el registro en la BD
	var category_id = elements.form_object.category.val();
	var data = {
		'name': elements.form_object.name.val(),
		'category': '/api/v1/object-category/' + category_id + '/'
	};
	
	var object_resource = new Resource('object');
	var new_object = object_resource.create(data);

	//
	// 2. Subimos su imágen
	var img_form = $(this).closest('form');
	
	sending_img = true;
	
	object_resource.addImg(
		img_form,
		new_object.id,
		function(server_response){
			// Una vez que se sube la imágen al servidor hacemos lo siguiente..
			elements.form_object.name.val('');
			elements.form_object.img.val('');
			setObjectSelector();
			elements.form_object.root_node.hide(400);
			
			sending_img = false;
		}
	);
}


function showMenu()
{
	// Rellenamos los selectores

	setCategorySelector();
	setGridSelector();
}


function toggleBlockBorders()
{
	// Muestra o no los bordes del blocke según esté o no marcado el checkbox 'ver rejilla'
	if(elements.toggle_border.is(':checked'))
	{
		var i = elements.block.height() - 2;
		elements.block.css({
			'border': '1px solid black',
			'height': elements.block.height() - 2 + 'px',
			'width': elements.block.width() - 2 + 'px'
		});
	}
	else
	{
		elements.block.css({
			'border': '',
			'height': block_height_initial + 'px',
			'width': block_width_initial + 'px'
		});
	}
}
