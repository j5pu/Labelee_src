
var $e = {};
var Events = {};

function listenIframe(form, callback)
{
    // Cada cierto tiempo comprobamos si hay contenido en el <body> del iframe
    // con id 'upload_target',
    // ya que cada vez que se suba un archivo el contenido de este <body> será la respuesta del
    // servidor serializada en formato JSON. De esta forma podremos
    // saber cuándo ejecutar el callback una vez subido el archivo
    // sin tener que recargar la página
    
    // Una vez enviado, copiamos el html del form en una variable
    // para así sólo mostrar un icono animado de espera..
	// var form_html = form.html();
	// form.empty(); 
	// form.append('<img src="/static/img/ajax-loader.gif">');


    var id = setInterval(function(){
        var iframe_doc = window.frames["upload_target"].document;

        var iframe_body = $(iframe_doc).find('body');

        // Si el cuerpo está vacío salimos
        if(!iframe_body.text())
            return;

        // deserializamos lo devuelto por el HttpResponse de Django en el iframe_body
        var server_response = JSON.parse(iframe_body.text());
        // var form_name = server_response.data.form;
        iframe_body.empty();

		// ejecutamos el callback con la respuesta del servidor
        callback(server_response);
        
        // una vez ejecutado el callback paramos la escucha del iframe
        clearInterval(id);
        
        // volvemos a darle al form su html original antes de la llamada
        // form.html(form_html);
    }, 400);
}


function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


function setSelector(selector, data, prompt_opt)
{
	// Vacía el contenido del selector y lo popula poniendo primero
	// la opción 'prompt_opt' y luego rellenándolo con data
	// xej: 
	//		setSelector(elements.category_selector, categories, 'Selecc. categoría')
	
	selector.empty();
	
	selector.append('<option value="">' + prompt_opt + '</option>');
	for(var i in data)
	{
		var opt = '<option value="' + data[i].id + '">' + data[i].name + '</option>';
		selector.append(opt);		
	}
}


function divideInGroups(arr, group_size)
{
    // Divide el array 'arr' en grupos de tamaño 'group_size'
    //
    // xej en grupos de 2:
    //      [{point0}, {point1}, .., {point9}]
    //      => [ [{point0}, {point1}], [{point2}, {point3}], ..]
    var group_counter = 0;
    var GROUP_SIZE = group_size;

    var group = [];
    var groups = [];

    for(var i in arr)
    {
        if(group_counter >= GROUP_SIZE)
        {
            groups.push(group);
            group = [];
            group_counter = 0;
        }
        group.push(arr[i]);
        group_counter++;
    }

    // Añadimos también el último grupo
    if(group.length > 0)
        groups.push(group);

    return groups;
}
