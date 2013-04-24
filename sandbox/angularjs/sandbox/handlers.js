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
}


function editPlace()
{

}