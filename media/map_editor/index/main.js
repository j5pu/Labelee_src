

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
	$('#add_place').on('click', createPlace);
	$('.place .icon-edit').on('click', updatePlace);
	$('.place .icon-remove').on('click', deletePlace);

	$('.maps form submit').on('click', createMap);
	$('.map .icon-edit').on('click', updateMap);
	$('.map .icon-remove').on('click', deleteMap);


	//
	// IMAGE
	//

	// http://stackoverflow.com/questions/166221/how-can-i-upload-files-asynchronously-with-jquery

	$(':file').change(function(){
		var file = this.files[0];
		name = file.name;
		size = file.size;
		type = file.type;

		//your validation

	});


	$(':submit').click(function(){
    var formData = new FormData($('form')[0]);
    $.ajax({
        url: '/map-editor/maps/new',  //server script to process data
        type: 'POST',
        xhr: function() {  // custom xhr
            myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload){ // check if upload property exists
                myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // for handling the progress of the upload
            }
            return myXhr;
        },
        //Ajax events
        beforeSend: beforeSendHandler,
        success: completeHandler,
        error: errorHandler,
        // Form data
        data: formData,
        //Options to tell JQuery not to process data or worry about content-type
        cache: false,
        contentType: false,
        processData: false
    });
});

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
				var template = $('#templates #place');
				var context = {
					'[[place.name]]': place_name,
					'[[place.id]]': result.data.id.toString()
				};
				var component = createElement(template, context);

				// escondemos y mostramos con un efecto chulo..
				component.hide().fadeIn(500);

				$('#places #place_form').after(component);

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






//
// MAP
//
function createMap()
{
	$('.maps form').submit();
}


function updateMap()
{

}

function deleteMap()
{

}