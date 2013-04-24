
var places;

$(document).on('ready', function(){

	// una vez pulsamos en un botón de clase 'toggable' entonces se ejecuta el function(e)
	// $('.toggable').on('click', function(e){
		// e.preventDefault();
		// toggleTextBox($(this));
	// });

	Mustache.tags = ['[[', ']]'];

	// Obtenemos todos los lugares
	getPlaces();
	
    var template = $('#placesTpl').html();
    var html = Mustache.to_html(template, places);
    $('#places').append(html);

	addEvents();

});


function getPlaces()
{	
	$.ajax({
        url: '/api/v1/object/' + $(this).val(),
        type: 'get',
        headers: {'Content-Type': 'application/json'},
        dataType: 'json',
        async: false, // Así se espera a que responda el servidor y se ejecute el callback
        success: function(response){
			places = response;
        },
        error: function(response){
			var j = response;
        }
    });
}


function addEvents()
{
	// Lugares
	$('#add_place').on('click', createPlace);
	$('.place .icon-edit').on('click', updatePlace);
	$('.place .icon-remove').on('click', deletePlace);

	// Mapas
	$('.maps button').on('click', createMap);
	$('.map .icon-edit').on('click', updateMap);
	$('.map .icon-remove').on('click', deleteMap);
}


function progressHandlingFunction(e){
    if(e.lengthComputable){
        $('progress').attr({value:e.loaded,max:e.total});
    }
}

function addCRSFToken(component)
{
	var token = $('input name=[csrfmiddlewaretoken]').clone();
	component.prepend(token);
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

	var errorList = '<div class="errorList alert alert-error">' +
	'<a class="close" data-dismiss="alert">×</a>';
	for(var key in errors)
	{
		errorList += '<div class="error"><span class="field">' + key + ': </span><ul>';

		for(var i in errors[key])
			errorList += '<li>' + errors[key][i] + '</li>';
		errorList += '</ul></div>';

	}
	errorList += '</div>';

	// Limpiamos la lista de errores del componente por si ya tiene algo
	var el = component.find('.errorList');

	if(el.length)
		el.remove();

	component.prepend(errorList);

	component.find('.errorList').hide().fadeIn(1000);
}


function replaceAll(string, token, newtoken) {
	while(string.indexOf(token) != -1) {
		string = string.replace(token, newtoken);
	}
	return(string);
}


function createElement(template, context)
{
	// Crea un componente a partir de otro que actúa como plantilla, sobre
	// el cual se reemplaza cada clave por su respectivo valor en el diccionario 'context'

	// e.g.:
	//		component = $('#templates #place')
	//		values = {
	//			'[[place.name]]': 'Matadero',
	//			'[[place.owner]]': 'Fapencio'
	//		}

	var component = template.clone();

	var html_content = component.html();
	for(var key in context)
		html_content = replaceAll(html_content, key, context[key]);
	component.html(html_content);


	// Queremos sólo el hijo 'children()' del elemento de la plantilla..
	// Por ejemplo, si la plantilla es #place:
	//
	//		<div id="place">
	//			<div class="place element-box" data-id="[[place.id]]">

	return component.children();
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

function createPlace()
{
	var place_name = $('input[name=place]').val();

	ajaxPostJSON(
		'/map-editor/places/new',
		{'place_name': place_name},
		function(result){

			// result = {
			//		errors: <errores>,
			//		data: <datos>
			// }

			if(!result.errors)
			{
				var context = {
					'[[place.name]]': place_name,
					'[[place.id]]': result.data.id.toString()
				};

				addElement({
					base_element: '#place',
					context: context,
					put_after: $('#places #place_form')
				});

				// Si está el mensaje de error lo quitamos
				$('.errorList').hide();

				// Volvemos a asignar eventos sobre todo el documento, de manera que
				// también se pueda interactuar con el componente creado
				addEvents();
			}
			else
				showErrors($('#places'), result.errors);
		}
		);

	$('input[name=place]').val('');
}


function updatePlace()
{

}


function deletePlace()
{
	// Elimina un lugar de la BD
	var place = $(this).parents().eq(2);

	ajaxPostJSON(
		'/map-editor/places/delete',
		{'place_id': place.data('id')},
		function()
		{
			place.fadeOut(300, function() { $(this).remove(); });
		}
		);
}



function addElement(args)
{
	// Añade un elemento al DOM a partir de una plantilla y un contexto,
	// colocándolo justo después de 'element_before'

	var element_template = $('#templates ' + args['base_element']);

	var element = createElement(element_template, args['context']);

	args['put_after'].after(element);

	// escondemos y mostramos con un efecto chulo..
	element.hide().fadeIn(500);
}




//
// MAP
//
function createMap()
{
	var map_form = $(this).closest('.map_form');

	var map_name = $(this).siblings('input[name="map_name"]').val();
	var place_id = $(this).closest('.place').data('id');

	ajaxPostJSON(
		'/map-editor/maps/new',
		{
			'map_name': map_name,
			'place_id': place_id
		},
		function(result){

			// Una vez que el mapa se crea correctamente subimos su imágen
			if(!result.errors)
			{
				// Creamos el elemento mapa con el id devuelto en result.id
				var map_id = result.data.map_id;


				var file = map_form.find('input[name="map_img"]');

				uploadFile(file, map_form.siblings('.loading_wrapper'));
			}

		}
	);

}


function uploadFile(file, loading_wrapper)
{
	// Manda un archivo al servidor y coloca el mensaje de espera/confirmación
	// dentro del elemento del DOM dado (loading_wrapper)

	// Si el archivo no está cargado no se sube nada
	if(!file.val())
		return;

	var file_form = file.closest('form');

	file_form.submit();

	// Colocamos el mensaje de espera..
	loading_wrapper.append($('#ajax_loading')).show();
	// $('#ajax_loading').show();

	var iframe_content = $('#iframe_content').html();

	// Si hay un cambio en el iframe es que se terminó de subir,
	// ya que el HttpResponse le añadiría 'uploaded!' en el <body>
	$('#iframe_content').on('change', function(){
		loading_wrapper.empty().hide();

		// Volvemos a dejar el iframe como estaba antes de subir la imágen
		$('#iframe_content').empty();
	});
}


function updateMap()
{

}

function deleteMap()
{

}