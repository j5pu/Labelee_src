

$(document).on('ready', function(){

	// una vez pulsamos en un botón de clase 'toggable' entonces se ejecuta el function(e)
	$('.toggable').on('click', function(e){
		e.preventDefault();
		toggleTextBox($(this));
	});


	addEvents();

});


function addEvents()
{
	$('#add_place').on('click', addPlace);
	$('.place i .icon-edit').on('click', editPlace);
	$('.icon-remove').on('click', removePlace);

	// $('.add_map').on('click', addMap);
	// $('.map i .icon-edit').on('click', editMap);
	// $('.map i .icon-remove').on('click', removeMap);

}


function showErrors(component, errors)
{
	// Muestra los errores sobre en el componente elegido

	// errors = {
	//		name: ['Ya existe Place con este Name.']
	// }

	// Lo anterior generaría un div errorList:
	//
	//				<div class="errorList">
	//					<div class="error">
	//						name:
	//						<ul>
	//							<li>name</li>
	//						</ul>
	//					</div>
	//				</div>

	var errorList = '<div class="errorList">';
	for(var key in errors)
	{
		errorList += '<div class="error">' + key + ': <ul>';

		for(var i in errors[key])
			errorList += '<li>' + errors[key][i] + '</li>';
		errorList += '</ul></div>';

	}
	errorList += '</div>';

	// Limpiamos la lista de errores del componente por si ya tiene algo
	component.find('.errorList').empty();

	component.prepend(errorList).show('slow');
}


function replaceAll(string, token, newtoken) {
    while(string.indexOf(token) != -1) {
        string = string.replace(token, newtoken);
    }
    return(string);
}


function createComponent(template, context)
{
	// Crea un componente a partir de otro que actúa como plantilla, sobre
	// el cual se reemplaza cada clave por su respectivo valor en el diccionario 'context'

	// e.g.:
	//		component = $('#components .place')
	//		values = {
	//			'{{place.name}}': 'Matadero',
	//			'{{place.owner}}': 'Fapencio'
	//		}

	var component = template.clone();

	var html1 = template.html();
	var txt1 = template.text();

	var html_content = component.html();
	for(var key in context)
		html_content = replaceAll(html_content, key, context[key]);
	component.html(html_content);

	return component;
}


function toggleTextBox(element)
{
	// Mostramos el text box correspondiente con el botón a la derecha.
	// Una vez rellenamos el text box y volvemos a pulsar se añadirá a la base de datos

	var id = element.attr('id');
	var text_box;

	if(id === 'add_place')
	{
		text_box_content = '<input type="text" name="place_name" ' +
		'placeholder="Introd. nombre para el lugar"/>';

		$('#places').prepend(text_box_content);
		text_box = $('#places input[name=place_name]');
	}
	else if(id === 'add_map')
	{
		text_box_content = '<input type="text" name="map_name" ' +
		'placeholder="Introd. nombre para el mapa"/>';

		var place_block = element.parent();
		place_block.prepend(text_box_content);

		text_box = place_block.find('input[name=map_name]');
	}

	text_box.hide();
	text_box.show('slow');

	element.on('click', function(){
		save($(this).before());
	});

	// element.hide('slow', function(){});
}


function save(text_box)
{
	// Guardamos el contenido de text box en lugares o mapas según corresponda

	// si es place o map
	var text_box_type = text_box.attr('name') == 'place_name' ? 'place' : 'map';

	// nombre nuevo mapa o lugar introducido
	var text_box_value = text_box.val();

	$.ajax({
		url: 'map-editor/' + text_box_type + 's',
		type:  'post',
		// data:  { 'chart': chart },
		data: {'data': JSON.stringify(text_box_value) },
		dataType: 'json',  // esto indica que la respuesta vendrá en formato json
		// cache: false,
		// beforeSend: function () {
		// $("#chart_div").html("Procesando, espere por favor...");
		// },
		success: function(result) {
			refreshTable(result);
		}
	});
}




//
// PLACE
//

function addPlace()
{
	var place_name = $('input[name=place]').val();

	ajaxPostJSON(
		'/map-editor/places/new',
		{'place_name': place_name},
		function(data){

			// data = {
			//		errors: {
			//			name: ['Ya existe Place con este Name.']
			//		},
			//		valid: false
			// }
			if(data.valid)
			{
				var template = $('#templates .place');
				var context = {'[[place.name]]': place_name};
				var component = createComponent(template, context);
				$('#places').prepend(component).show('slow');

			}
			else
				showErrors($('#places'), data.errors);
		}
		);

	$('input[name=place]').val('');
}


function removePlace()
{
	// Elimina un lugar de la BD
	var place = $(this).parents().eq(2);

	ajaxPostJSON(
		'/map-editor/places/delete',
		{'place_id': place.data('id')},
		function()
		{
			place.remove().fadeOut(300, function() { $(this).remove(); });
		}
	);
}


function editPlace()
{

}