
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


function ajaxPostJSON(url, data, success)
{
    // Por defecto django protege el servidor contra ataques CRSF
    // https://docs.djangoproject.com/en/dev/ref/contrib/csrf/#ajax

    // DEPRECATED: Usaremos el $http.post de angularJS en lugar de esto

    var csrftoken = getCookie('csrftoken');

    $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type)) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });

    $.ajax({
        url: url,
        type: 'post',
        data: data,
        dataType: 'json',  // esto indica que la respuesta vendrá en formato json
        success: success
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

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}