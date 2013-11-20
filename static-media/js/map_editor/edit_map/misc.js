function drawCar(cell)
{
	// Pinta caracter en la celda 'cell' del grid
	var car = $('select[name=car]').val();
	cell.find('span').html(car);

	// También añadimos la clase 'focused' para establecer el foco ahí
	// a la hora de usar las flechas del teclado
	cell.addClass('focused');

	action.on('keydown', function(e){
		var keyCode = e.keyCode || e.which;

		// verificamos si fue una flecha del teclado la tecla que se pulsó
		if(keyCode < 37 && keyCode > 40)
			return;

		e.preventDefault();
		var row = cell.parent().attr('data-row');
		var col = cell.attr('data-col');

		var newCell;

		// analizamos qué flecha se pulsó en el teclado
		switch(keyCode)
		{
			// Si se pulsó la flecha izquierda..
			case 37:
			if (x > 0)
			{
				// quitamos el foco de la celda anterior
				cell.removeClass('focused');
				// ponemos el foco en la nueva celda
				col -= 1;
				var newCol = $('.row[data-col=' + col + ']');

				// ..demás código
			}
			break;
			case 38:
			break;
			case 39:
			break;
			case 40:
			break;
		}
	});
}