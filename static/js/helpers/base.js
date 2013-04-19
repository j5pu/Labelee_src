

function listenIframe(callback)
{
    // Cada cierto tiempo comprobamos si hay contenido en el <body> del iframe
    // con id 'upload_target',
    // ya que cada vez que se suba un archivo el contenido de este <body> será la respuesta del
    // servidor serializada en formato JSON. De esta forma podremos
    // saber cuándo ejecutar el callback una vez subido el archivo
    // sin tener que recargar la página

    setInterval(function(){
        var iframe_doc = window.frames["upload_target"].document;

        var iframe_body = $(iframe_doc).find('body');

        // Si el cuerpo está vacío salimos
        if(!iframe_body.text())
            return;

        // deserializamos lo devuelto por el HttpResponse de Django en el iframe_body
        var server_response = JSON.parse(iframe_body.text());
        var form_name = server_response.data.form;
        iframe_body.empty();

        callback(form_name);
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