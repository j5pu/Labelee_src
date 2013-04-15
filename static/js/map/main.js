//
// TAMAÑOS
//

// Ventana
var w_height, w_width;

// Pantalla
var screen_height, screen_width;

// Mapa
var map_height, map_width;
var map_height_initial, map_width_initial;
var map_height_prev, map_width_prev;
var map_height_new, map_width_new;

// Menú
var menu_size_factor = 0.15;

// Wrapper para el mapa
var map_wrapper_height, map_wrapper_width;


//
// ELEMENTOS DEL DOM
//
var map_wrapper, map, menu, info;


//
// POSICIÓN DEL MAPA (left, top)
//

// Posición del mapa con respecto al wrapper
var map_left, map_top;
// Posición inicial al cargar la página
var map_left_initial, map_top_initial;
// Última posición del mapa registrada mientras se realiza una acción:
//		* Scrolling
//		* Zooming
var map_left_prev, map_top_prev;
// Nueva posición
var map_left_new, map_top_new;


// Indicamos con esto si es está realizando:
// 		* Scrolling
//		* Zooming
var zooming = false;
var push_zooming = false;
var over_zoomed = false;
var over_reduced = false;

var scrolling = false;


// Orientación de la pantalla
var screen_orientation;

// Escala con la que se hace zoom
var scale = 1;
var debug_scale_factor = 0.1;
var button_scale_factor = 0.1;
var tapping_scale_factor = 0.3;
var scale_prev = 1;

// Factor de ampliación para la imagen del mapa (útil si la imagen es pequeña)
var factor = 3;

// número de píxeles a recorrer para pintar el punto en el mapa
var pixels_x, pixels_y;


// Posición al estar haciendo scrolling con respecto a donde empezamos a tocar
var delta_x, delta_y;
var delta_x_prev, delta_y_prev;

// Centro de donde se hizo pinch previamente
var pinch_center_prev = 0;
var pinch_center_new;


//-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-

window.onload = function(){

	var img = new Image();
	img.src = MAP_IMG;

	// No hacemos nada mientras no esté la imágen del mapa cargada en el navegador
	img.onload = function(){
		map_height = img.height * factor;
		map_width = img.width * factor;

		// Alto inicial del mapa al cargar la página, a tener en cuenta a la hora de
		// establecer el máximo para ampliar el mapa.
		map_height_initial = map_height;
		map_width_initial = map_width;
		// http://stackoverflow.com/questions/5230333/how-to-avoid-callback-chains
		// $(document).queue(removeNavBar).queue(main);
		main();
	};
};


function main()
{

	// Ejecutamos esto nada mas cargarse la página y la imagen del mapa
	map_wrapper = $('#map_wrapper');
	map = $('#map_wrapper #map');
	menu = $('#menu');
	zoom_in_button = $('#map_wrapper #zoom-in');
	zoom_out_button = $('#map_wrapper #zoom-out');
	info = $('#info');

	display();

	removeNavBar();

	centerMap();

	drawBlocks();

	addEvents();
}


function drawBlocks()
{
	// pintamos los bloques sobre el mapa
	var block = $('#position_block');
	map.prepend(block);
	block.css({
		'display': 'block',
		'height': BLOCK_SIZE + 'px',
		'width': BLOCK_SIZE + 'px',
		'background': 'green',
		'opacity': 0.5,
		'position': 'absolute',
		'left': pixels_x + 'px',
		'top': pixels_y + 'px',
		'z-index': 1
	});
}


function centerMap()
{
	// Centra el mapa en la posición donde se escanea la etiqueta

	pixels_x = POS_X * BLOCK_SIZE;
	pixels_y = POS_Y * BLOCK_SIZE;

	// según la orientación de la pantalla se moverá el mapa de una forma u otra
	if(screen_orientation == 'vertical')
	{
		map_left_new = pixels_x - (w_width/2);
		map_top_new = pixels_y - (w_height - menu.height())/2;
	}
	else
	{
		map_left_new = pixels_x - (w_width - menu.width())/2;
		map_top_new = pixels_y - (w_height/2);
	}

	// Usaremos valores negativos porque 'tiraremos' hacia arriba ('top')
	// y hacia la izquierda ('left') al centrar el mapa hacia nuestra posición
	map_left_new *= -1;
	map_top_new *= -1;

	map_left = parseInt(map.css('left'), 10);
	map_top = parseInt(map.css('top'), 10);

	moveMap();

	// Dejamos constancia de la posición inicial del mapa al cargar la página
	map_left_initial = map_left;
	map_top_initial = map_top;

	fitMapPosition();
}


function displayHorizontal()
{
	// Con el móvil en horizontal (apaisado)
	menu.css({
		'height': w_height + 200 + 'px',
		'width': w_width * menu_size_factor + 'px',
		'position': 'absolute',
		'top': '0',
		'right': '0'
	});

	map_wrapper.css({
		'height': w_height + 'px',
		'width': w_width - menu.width() + 'px'
	});

}


function displayVertical()
{
	// Con el móvil en vertical

	// establecemos dimensiones para el map_wrapper y el menu

	menu.css({
		'height': w_height * menu_size_factor + 'px',
		'width': w_width + 'px',
		'position': 'relative',
		'bottom': '0',
		'right': '0'
	});

	// según esté escondido o no el menú..
	map_wrapper_height = w_height - menu.height();
	map_wrapper_width = w_width;

	map_wrapper.css({
		'height': map_wrapper_height + 'px',
		// 'height': 'px',
		'width': w_width + 'px'
	});
}


function removeNavBar()
{
	// Quitamos la ventana del navegador

	// $('body').append(map);
	// window.scrollTo(0, 1);
	// $('body').remove(map);

	w_height = $(window).height();
	$('body').css('height', w_height + 100 + 'px');
	setTimeout(function(){
		window.scrollTo(0, 1000);
		window.scrollTo(0, 1);
		$('body').css('height', w_height + 'px');
	}, 1000);

	// next();
}


function display()
{
	// Muestra el contenido según sea la orientación de la pantalla

	w_height = $(window).height();
	w_width = $(window).width();

	screen_orientation = w_height > w_width ? 'vertical' : 'horizontal';

	if(screen_orientation == 'vertical')
		displayVertical();
	else
		displayHorizontal();

	// dibujamos el mapa
	map.css({
		'height': map_height + 'px',
		'width': map_width + 'px',
		'background-image': 'url("' + MAP_IMG + '")',
		'background-size': '100%'
	});

	map_wrapper.show();
	menu.show();
}


function addEvents()
{
	// Comprobamos si ha cambiado el tamaño de la ventana (girando el móvil por ejemplo)
	window.onresize = display;

	addTouchingDebugEvents();

	addTouchEvents();

	addKeyboardEvents();

	addButtonEvents();
}


function scrollMap(ev)
{
	if(zooming)
		return;

	if(typeof ev === "undefined")
		return;

	if(ev.type !== "keydown")
	{
		delta_x = ev.gesture['deltaX'];
		delta_y = ev.gesture['deltaY'];
	}
	else
	{
		switch(ev.keyCode)
		{
			case 37:  // Left
			delta_x -= 1;
			break;
			case 38:  // Up
			delta_y -= 1;
			break;
			case 39:  // Right
			delta_x += 1;
			break;
			case 40:  // Down
			delta_y += 1;
			break;
		}
	}

	map_left_new = map_left + delta_x;
	map_top_new = map_top + delta_y;

	moveMap();


	if(SCROLLING_LOG)
	{
		var event_data = {
			map_pos_new: map_left_new.toFixed(0) + ', ' + map_top_new.toFixed(0),
			delta: delta_x.toFixed(0) + ', ' + delta_y.toFixed(0)
		};

		logEvent({
			event: 'scrollingMap',
			data: event_data
		});
	}
}


function fitMapPosition()
{
	// Tras dejar de hacer scroll/zoom entonces se ajusta la posición sobre el wrapper

	// Si, tras hacer scroll/zoom, la posición del mapa está fuera del límite
	// del wrapper entonces se ajustará

	// ajustamos sobre el eje x (left)

	// var cad = map_left + ' > ' + map_left_new + '<br>' + map_top + ' > ' + map_top_new;
	if(map_left_new > 0)
		map_left_new = 0;
	else if(Math.abs(map_left_new) > map_width - map_wrapper_width)
		map_left_new = map_wrapper_width - map_width;

	// sobre el eje y (top)
	if(map_top_new > 0)
		map_top_new = 0;
	else if(Math.abs(map_top_new) > map_height - map_wrapper_height)
		map_top_new = map_wrapper_height - map_height;

	// cad += '<br>' + map_left + ' > ' + map_left_new + '<br>' + map_top + ' > ' + map_top_new;

	// info.html(cad);


	// map.css({
	// 	'transition': 'top 1s linear 2s, left 1s linear 2s'
	// });

	moveMap();

	// map.css({
	// 	'transition': ''
	// });

	map_left = map_left_new;
	map_top = map_top_new;
}


//nueva
function moveMap()
{
	// cambia las propiedades 'left' y 'top' de #map guardadas en las variables
	// map_left y map_top a las map_left_new y map_top_new

	map.css({
		'left': map_left_new + 'px',
		'top': map_top_new + 'px'
	});
}


function hideMenu()
{
	menu.hide();

	// Redimensionamos el map_wrapper
	if(screen_orientation == 'vertical')
		map_wrapper.css('height', w_height);
	else
		map_wrapper.css('width', w_width);
}


function showMenu()
{
	menu.show();

	// Redimensionamos el map_wrapper
	if(screen_orientation == 'vertical')
		map_wrapper.css('height', w_height - menu.height());
	else
		map_wrapper.css('width', w_width - menu.width());
}


function resizeMap(ev)
{
	if(scrolling)
		return;

	if(typeof ev === "undefined" || !zooming)
		return;

	var pinching = ev.type === "transform";
	if(pinching)
		scale = ev.gesture['scale'];

	var tapping = ev.type === "doubletap";

	// Tamaño nuevo del mapa
	map_height_new = map_height * scale;
	map_width_new = map_width * scale;

	// Si el alto para el mapa es menor que el del wrapper o se excede del original
	// entonces no hacemos nada
	over_reduced_height = map_height_new <= map_wrapper_height;
	over_reduced_width = map_width_new <= map_wrapper_width;
	over_zoomed = map_height_new > map_height_initial || map_width_new > map_width_initial;
	if(over_reduced_height)
	{
		map_height_new = map_wrapper_height;
		// damos un ancho proporcional con el nuevo alto
		map_width_new = (map_width * map_height_new) / map_height;
	}
	else if(over_reduced_width)
	{
		map_height_new = (map_height * map_width_new) / map_width;
		map_width_new = map_wrapper_width;
	}
	else if(over_zoomed)
	{
		map_height_new = map_height_initial;
		map_width_new = map_width_initial;
	}

	if(over_reduced_height || over_reduced_width || over_zoomed)
	{
		// Si estamos haciendo zoom pulsando teclas o botones..
		if(push_zooming)
			scale = scale_prev;

		// return;
	}



	// Diferencia entre el tamaño inicial y el obtenido al hacer zoom
	var map_height_diff = map_height_new - map_height;
	var map_width_diff = map_width_new - map_width;
	// Porcentaje de la posición sobre la pantalla del punto central donde se hace pinch
	var x_percent, y_percent;
	// Diferencia entre el top anterior y el obtenido al hacer zoom
	var map_top_diff, map_left_diff;


	// Si se está haciendo zoom-in (AMPLIAR)
	if(map_height_diff > 0)
	{
		// Si estamos haciendo 'pinch' con los deditos..
		if(pinching || tapping)
		{
			x_percent = (ev.gesture['center'].pageX * 100) / map_wrapper_width;
			y_percent = (ev.gesture['center'].pageY * 100) / map_wrapper_height;

			map_top_new = map_top - (map_height_diff * (y_percent/100));
			// map_top_new = map_top - (map_height_diff * (y_percent/100) - ev.gesture['deltaY']);
			map_left_new = map_left - (map_width_diff * (x_percent/100));
			// map_left_new = map_left - (map_width_diff * (x_percent/100) - ev.gesture['deltaX']);
		}
		else
		{
			map_top_new = map_top - map_height_diff/2;
			map_left_new = map_left - map_width_diff/2;
			// $('#info').hide();
		}

	}
	// Si se está haciendo zoom-out (REDUCIR)
	else
	{
		map_height_diff = map_height - map_height_new;
		map_width_diff = map_width - map_width_new;

		// map_top_diff = map_height_diff/2;
		// map_left_diff = map_width_diff/2;

		if(pinching || tapping)
		{
			x_percent = (ev.gesture['center'].pageX * 100) / map_wrapper_width;
			y_percent = (ev.gesture['center'].pageY * 100) / map_wrapper_height;
			map_top_new = map_top + (map_height_diff * (y_percent/100));
			// map_top_new = map_top + (map_height_diff * (y_percent/100) + ev.gesture['deltaY']);
			map_left_new = map_left + (map_width_diff * (x_percent/100));
			// map_left_new = map_left + (map_width_diff * (x_percent/100) - ev.gesture['deltaX']);

			// map_top_new = map_top + map_height_diff/2;
			// map_left_new = map_left + map_width_diff/2;
		}
		else
		{
			map_top_new = map_top + map_height_diff/2;
			map_left_new = map_left + map_width_diff/2;
		}
	}

	// Si la nueva proporción es correcta entonces redimensionamos
	map.css({
		'height': map_height_new + 'px',
		'width': map_width_new + 'px',
		'left': map_left_new + 'px',
		'top': map_top_new + 'px'
	});

	// Redibujamos los bloques sobre el mapa
	pixels_x = pixels_x_initial * (map_width_new / map_width);
	pixels_y = pixels_y_initial * (map_height_new / map_height);
	drawBlocks();

	// Movemos el mapa para que no se descuadre
	// moveMap();

	// Si estamos depurando con el teclado..
	if(push_zooming)
		scale_prev = scale;

	if(ZOOMING_LOG)
	{
		var event_data = {
			// map_size: map_width.toFixed(0) + 'x' + map_height.toFixed(0),
			// map_height_initial: map_height_initial.toFixed(0),
			// map_size_prev: map_width_prev.toFixed(0) + 'x' + map_height_prev.toFixed(1),
			map_size_new: map_width_new.toFixed(0) + 'x' + map_height_new.toFixed(0),
			// scale_prev: scale_prev.toFixed(1),
			scale: scale.toFixed(1),
			// map_pos: map_left.toFixed(0) + ', ' + map_top.toFixed(0),
			// map_pos_prev: map_left_prev.toFixed(1) + ', ' + map_top_prev.toFixed(1),
			map_pos_new: map_left_new.toFixed(0) + ', ' + map_top_new.toFixed(0),
			// map_pos_diff: map_left_diff.toFixed(0) + ', ' + map_top_diff.toFixed(0),
			pixels: pixels_x.toFixed(0) + ', ' + pixels_y.toFixed(0)
		};

		logEvent({
			event: 'resizeMap',
			data: event_data
		});
	}
}
