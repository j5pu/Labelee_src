//
// EVENTOS
//

//
// Scrolling:
//		- debug (para depurar el scroll táctil):
//			s		->	comenzar scroll (dragstart)
//			flechas ->	mover scroll
//			r		->	finalizar scroll (dragend)
//		- keyboard:
//			flechas ->	realizar scroll una sola vez por cada pulsación
//		- touching


//
// Zooming:
//		- debug:
//			z		->	comenzar zoom
//			c		->	ampliar
//			x		->	reducir
//			r		->	finalizar zoom
//		- keyboard:
//			+		->	realizar ampliación una sola vez por cada pulsación
//			-		->	reducción
//		- touching
var zoomIntervalId;
var hold_button = false;
var double_tapping = false;

function addTouchEvents()
{
	addMapEvents();

	addButtonEvents();

}


function addTouchingDebugEvents()
{
	// Eventos de teclado para depurar cada acción táctil

	//
	// SCROLLING DEBUG
	shortcut.add("s", function(){

		scrollingStart();

		delta_x = 1;
		delta_x_prev = 1;
		delta_y = 1;
		delta_y_prev = 1;

		showInfo('SCROLLING..');
	});
	shortcut.add("Up", scrollMap);
	shortcut.add("Right", scrollMap);
	shortcut.add("Down", scrollMap);
	shortcut.add("Left", scrollMap);
	shortcut.add("q", function(){
		scrollingEnd();
	});


	//
	// ZOOMING DEBUG
	shortcut.add("z", function(){
		zoomingStart();
		push_zooming = true;

		showInfo('ZOOMING..');
	});
	shortcut.add("c", function(ev){
		scale += debug_scale_factor;
		resizeMap(ev);
	});
	shortcut.add("x", function(ev){
		scale -= debug_scale_factor;
		resizeMap(ev);
	});
	// Transformationend
	shortcut.add("a", function(ev){
		zoomingEnd();
	});


	//
	// Si soltamos los dedos de la pantalla..
	//
	shortcut.add("r", function(){
		// Cada vez que soltamos el dedo de la pantalla mandamos la info
		if(LOG)
			postEventLog();
	});

	// Para activar o no el logger
	shortcut.add("l", function(){
		LOG = LOG ? false : true;
	});
}


function addKeyboardEvents()
{
	// Eventos de teclado

}


function addMapEvents()
{
	// Establecemos eventos táctiles sobre el mapa

	map
	.hammer({prevent_default: true})

	// SCROLL
	.bind('dragstart', function(){

		if(zooming)
			return;

		scrollingStart();

		if(TOUCH_LOG)
		{
			logEvent({
				event: 'dragstart'
				// data: event_data
			});
		}
	})
	.bind('drag', function(ev){

		if(zooming)
			return;

		scrollMap(ev);

		if(TOUCH_LOG)
		{
			logEvent({
				event: 'drag'
				// data: event_data
			});
		}
	})
	.bind('dragend', function(){

		if(zooming)
			return;

		scrollingEnd();

		if(TOUCH_LOG)
		{
			logEvent({
				event: 'dragend'
				// data: event_data
			});
		}
	})

	// ZOOM
	.bind('transformstart', function(){

		if(scrolling)
			return;

		zoomingStart();

		if(TOUCH_LOG)
		{
			logEvent({
				event: 'transformstart'
				// data: event_data
			});
		}
	})
	.bind('transform', function(ev){

		if(scrolling)
			return;

		resizeMap(ev);

		if(TOUCH_LOG)
		{
			logEvent({
				event: 'transform'
				// data: event_data
			});
		}
	})
	.bind('transformend', function(){

		if(scrolling)
			return;

		zoomingEnd();

		if(TOUCH_LOG)
		{
			logEvent({
				event: 'transformend'
				// data: event_data
			});
		}
	})

	// doubletap zoom
	.bind('doubletap', function(ev){

		if(zooming)
			return;

		double_tapping = true;

		pushZoomIn(ev);

		double_tapping = false;

		if(TOUCH_LOG)
		{
			logEvent({
				event: 'transformstart'
				// data: event_data
			});
		}
	})

	.bind('release', function(){
		// if(zooming)
		// 	zoomingEnd();
		// if(scrolling)
		// 	scrollingEnd();

		// Cada vez que soltamos el dedo de la pantalla mandamos la info
		if(LOG)
			postEventLog();
	});
}


function pushZoomIn(ev)
{
	push_zooming = true;
	zoomingStart();
	scale += double_tapping ? scale * tapping_scale_factor : scale * button_scale_factor;
	resizeMap(ev);
	zoomingEnd();
}


function pushZoomOut(ev)
{
	push_zooming = true;
	zoomingStart();
	scale -= button_scale_factor;
	resizeMap(ev);
	zoomingEnd();
}


function addButtonEvents()
{
	// Eventos que se disparan al pulsar botones

	zoom_in_button
	.hammer({prevent_default: true})
	.bind('touch', pushZoomIn)
	.bind('hold', function(ev){
		hold_button = true;
		zoomIntervalId = setInterval(pushZoomIn(ev), 1000);
	})
	.bind('release', function(){
		if(hold_button)
			clearInterval(zoomIntervalId);
		hold_button = false;
	});

	zoom_out_button
	.hammer({prevent_default: true})
	.bind('touch', pushZoomOut)
	.bind('hold', function(ev){
		hold_button = true;
		zoomIntervalId = setInterval(pushZoomOut(ev), 1000);
	})
	.bind('release', function(){
		if(hold_button)
			clearInterval(zoomIntervalId);
		hold_button = false;
	});


	// $('#zoom-in').on('click', function(ev){
	// 	ev.preventDefault();

	// });

	// $('#zoom-out').on('click', function(ev){
	// 	ev.preventDefault();

	// });
}



//
// A realizar cuando empiece scroll/zoom o bien se deje de tocar el mapa
//

function scrollingStart()
{
	// if(scrolling)
	// 	return;

	scrolling = true;
	zooming = false;

	if(SCROLLING_LOG)
	{
		var event_data = {
			map_pos: map_left.toFixed(0) + ', ' + map_top.toFixed(0)
		};

		logEvent({
			event: 'scrollingStart',
			data: event_data
		});
	}
	// showInfo();
}


function scrollingEnd()
{
	// if(zooming)
	// 	return;

	fitMapPosition();

	scrolling = false;

	if(SCROLLING_LOG)
	{
		var event_data = {
			map_pos: map_left.toFixed(0) + ', ' + map_top.toFixed(0)
		};

		logEvent({
			event: 'scrollingEnd',
			data: event_data
		});
	}
	// showInfo();
}


function zoomingStart()
{
	// Si ya se está haciendo zoom no hacemos nada
	// if(zooming)
	// 	return;

	zooming = true;
	scrolling = false;

	//guardamos aquí los píxeles iniciales para el bloque
	pixels_x_initial = pixels_x;
	pixels_y_initial = pixels_y;


	if(ZOOMING_LOG)
	{
		var event_data = {
			map_size: map_width.toFixed(0) + 'x' + map_height.toFixed(0),
			map_pos: map_left.toFixed(0) + ', ' + map_top.toFixed(0),
			pixels: pixels_x.toFixed(0) + ', ' + pixels_y.toFixed(0)
		};

		logEvent({
			event: 'zoomingStart',
			data: event_data
		});
	}
}


function zoomingEnd()
{
	// if(scrolling)
	// 	return;

	map_height = map_height_new;
	map_width = map_width_new;

	zooming = false;

	if(push_zooming)
	{
		scale = 1;
		push_zooming = false;
	}

	fitMapPosition();

	if(ZOOMING_LOG)
	{
		var event_data = {
			map_size: map_width.toFixed(0) + 'x' + map_height.toFixed(0),
			map_pos: map_left.toFixed(0) + ', ' + map_top.toFixed(0)
		};

		logEvent({
			event: 'zoomingEnd',
			data: event_data
		});
	}
}



