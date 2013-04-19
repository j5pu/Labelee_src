
//
// Usaremos este .js para realizar las llamadas AJAX vía jQuery


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



function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}


function ajaxSetup()
{
    var csrftoken = getCookie('csrftoken');

    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}



function ajaxPostJSON(url, data, success, error)
{
    // Por defecto django protege el servidor contra ataques CRSF
    // https://docs.djangoproject.com/en/dev/ref/contrib/csrf/#ajax

    ajaxSetup();

    $.ajax({
        url: url,
        type: 'post',
        data: data,
        dataType: 'json',  // esto indica que la respuesta vendrá en formato json
        success: success,
        error: error
    });
}


function ajaxPutJSON(url, data, success, error)
{
    ajaxSetup();


    // curl --dump-header - -H "Content-Type: application/json" -X PUT --data '{"name": "matashawerXXX"}' http://mnopi:1aragon1@localhost:8000/api/v1/place/80/

    // url: '/api/v1/place/80/',
    // type: 'PUT',
    // data: '{"name": "mataXYY"}',
    // headers: {'Content-Type': 'application/json'},

    $.ajax({
        url: '/api/v1/place/80/',
        type: 'PUT',
        data: '{"name": "mataXYY"}',
        headers: {'Content-Type': 'application/json'},
        dataType: 'json',  // esto indica que la respuesta vendrá en formato json
        success: function(data){
            var j = 1;
        },
        error: function (respuesta) {
            var i = 4;
        }
    });
}


function ajaxGetJSON(url, success)
{
    $.ajax({
        url: url,
        type: 'get',
        dataType: 'json',  // esto indica que la respuesta vendrá en formato json
        success: success
    });
}

