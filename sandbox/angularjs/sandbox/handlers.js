//
// PLACE
//

function addPlace()
{
	var place_name = $('input[name=enclosure]').val();

	ajaxPostJSON(
		'/map-editor/enclosures/new',
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
				var template = $('#templates .enclosure');
				var context = {'[[place.name]]': place_name};
				var component = createComponent(template, context);
				$('#enclosures').prepend(component).show('slow');

			}
			else
				showErrors($('#enclosures'), data.errors);
		}
		);

	$('input[name=enclosure]').val('');
}


function removePlace()
{
	// Elimina un lugar de la BD
}


function editPlace()
{

}