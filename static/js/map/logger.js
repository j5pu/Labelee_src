// Número de dedos tocando la pantalla a la vez
var n_touches;

var LOG = true;
var SCROLLING_LOG = false;
var ZOOMING_LOG = false;
var TOUCH_LOG = true;

// eventos que se han disparado al tocar la pantalla
var events = [];


function logEvent(event)
{
	if(!LOG)
		return;

	events.push(event);
}


function postEventLog()
{
	var json_cad = JSON.stringify(events);
	ajaxPostJSON(
		'/map/event-log',
		{'events': json_cad},
		function(){}
		);
}


function showEventLog()
{
	// Toma un array de eventos y sus respectivos datos, por ejemplo:
	//
	// [
	//		{
	//			event: 'scrollingStart',
	//			data: {
	//				map_pos: '125, 224',
	//				wrapper_size: '400x800'
	//			}
	//		},
	//	...
	// ]

	// Tomamos lo que hay en el servidor y mostramos los eventos

	ajaxGetJSON('/map/event-log', function(log_data){

		// Número de veces que el nombre del evento se repite de forma consecutiva
		var same_event_count = 1;

		for(var i in log_data)
		{

			var event_name = log_data[i].event;
			var event_data = log_data[i].data;

			var content = '<div>' +
			'<h3>' + event_name + '</h3><ul>';

			for(var key in event_data)
				content += '<li>' +
				'<b>' + key + ':</b> ' +
				// '<span class="event">' + key + ':</span> ' +
				event_data[key] +
				'</li>';

			content += '</ul></div>';

			$('#log').append(content);

			// si el nombre del evento es igual al anterior..
			var event_prev = log_data[i-1];
			if(i > 1 && event_prev.event == event_name)
			{
				var div_prev = $('#log div:last').prev();

				// Aumentamos el número de repeticiones en el anterior
				var title = '<h3>' + event_name + ' (x' + (++same_event_count) + ')</h3>';
				div_prev.find('h3').html(title);

				var event_table, column, columns;

				// Si es la primera repetición creamos la tabla
				if(same_event_count == 2)
				{
					// Quitamos el ul anterior
					div_prev.find('ul').remove();

					// Creamos una tabla sobre el div anterior
					div_prev.append('<div class="event-table"></div>');

					// A la table le añadimos las columnas, y a cada columna
					// su respectivo título (head)
					event_table = div_prev.find('.event-table');
					for(key in event_data)
					{
						event_table.append('<div class="column"></div>');
						column = event_table.find('.column').last();
						column.append('<div class="cell head">' + key + '</div>');
					}

					// Añadimos la primera fila de celdas con datos del evento previo
					columns = event_table.find('.column');
					column = columns.first();
					for(i in event_prev.data)
					{
						column.append('<div class="cell">' + event_prev.data[i] + '</div>');
						column = column.next();
					}

					// Fila con datos del evento actual
					column = columns.first();
					for(i in event_data)
					{
						column.append('<div class="cell">' + event_data[i] + '</div>');
						column = column.next();
					}
				}
				else
				{
					// Si es un tercer, cuarto.. n evento.. entonces sólo añadimos a la tabla ya creada..
					columns = event_table.find('.column');
					column = columns.first();
					for(i in event_data)
					{
						column.append('<div class="cell">' + event_data[i] + '</div>');
						column = column.next();
					}
				}


				$('#log div:last').remove();
			}
			else
			{
				same_event_count = 1;
			}
		}
	});
}


function showInfo(msg)
{
	info.html(msg);
	info.show();
}


// function logVar(v)
// {
// 	$('#info').html(v);
// 	$('#info').show();
// }





// function showInfo()
// {
// 	// Si no estamos depurando nada no mostramos nada
// 	if(!KEY_DEBUG && !TOUCH_DEBUG)
// 		return;

// 	if(KEY_DEBUG) showInfo_key();
// 	else if(TOUCH_DEBUG) showInfo_touch();
// 	$('#info').show();
// }


// function showInfo_key()
// {
// 	if(scrolling)
// 		$('#info').html(
// 			'SCROLLING..<br>' +
// 			// 'map: ' + map_width.toFixed(2) + 'x' + map_height.toFixed(2) + '<br>' +
// 			// 'window {h:' + $(window).height() + ', w:' + $(window).width() + '}<br>' +
// 			// 'map_wrapper: ' + $('#map_wrapper').width() + 'x' + $('#map_wrapper').height() + '<br>' +
// 			// 'map_i_pos: ' + map_left_initial + ', ' + map_top_initial + '<br>' +
// 			'map_pos: ' + map_left.toFixed(2) + ', ' + map_top.toFixed(2) + '<br>' +
// 			'map_pos_prev: ' + map_left_prev.toFixed(2) + ', ' + map_top_prev.toFixed(2) + '<br>' +
// 			'map_pos_new: ' + map_left_new.toFixed(2) + ', ' + map_top_new.toFixed(2) + '<br>' +
// 			// 'menu: ' + $('#menu').height() + 'x' + $('#menu').width() + '<br>' +
// 			// 'touch: ' + ev.gesture['center'].pageX + ' x ' + ev.gesture['center'].pageY + '<br>' +
// 			// 'delta: ' + ev.gesture['deltaX'] + ' x ' + ev.gesture['deltaY'] + '<br>'
// 			'delta: ' + delta_x + ' x ' + delta_y + '<br>'
// 			// 'screen: ' + screen.height + ' x ' + screen.width
// 			);
// 	if(zooming)
// 		$('#info').html(
// 			'ZOOMING..<br>' +
// 			'map: ' + map_width.toFixed(2) + 'x' + map_height.toFixed(2) + '<br>' +
// 			'map_prev: ' + map_height_prev.toFixed(2) + '<br>' +
// 			'map_pos: ' + map_left.toFixed(2) + ', ' + map_top.toFixed(2) + '<br>' +
// 			'map_pos_prev: ' + map_left_prev.toFixed(2) + ', ' + map_top_prev.toFixed(2) + '<br>' +
// 			'scale: ' + scale.toFixed(2) + '<br>' +
// 			// 'n_touches: ' + n_touches + '<br>' +
// 			'pixels: ' + pixels_x + 'x' + pixels_y
// 			);

// 	// si no se está haciendo nada es que se ha soltado el dedo (release)
// 	if(!scrolling && !zooming)
// 	{
// 		$('#info').html('RELEASED');
// 	}
// }