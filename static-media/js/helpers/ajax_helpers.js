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


function ajaxSetup() {
	// Por defecto django protege el servidor contra ataques CRSF
	// https://docs.djangoproject.com/en/dev/ref/contrib/csrf/#ajax
	
	var csrftoken = getCookie('csrftoken');

	$.ajaxSetup({
		crossDomain : false, // obviates need for sameOrigin test
		beforeSend : function(xhr, settings) {
			if (!csrfSafeMethod(settings.type)) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		}
	});
}


function ajaxGetElements(prefix_url, sufix_url) {
    var elements;
    $.ajax({
        url : prefix_url + sufix_url,
        type : 'get',
        headers : {
            'Content-Type' : 'application/json'
        },
        dataType : 'json', // esto indica que la respuesta vendrá en formato json
        async : false,
        success : function(response) {
            elements = response;
        },
        error : function(response) {
            var j = response;
        }
    });
    return elements;
}
