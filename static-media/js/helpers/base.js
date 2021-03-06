
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

    var group = [];
    var groups = [];

    for(var i in arr)
    {
        if(group_counter >= group_size)
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


// http://stackoverflow.com/a/6700/1260374
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


var WaitingDialog = {

    init: function(){
        var self = this;
        self.$e = $("#loadingScreen");
//        $('body').append('<div id="loadingScreen"></div>');
        self.$e.dialog({
            autoOpen: false,    // set this to false so we can manually open it
            dialogClass: "loadingScreenWindow",
            closeOnEscape: false,
            draggable: false,
            width: 460,
            minHeight: 50,
            modal: true,
            buttons: {},
            resizable: false,
            open: function() {
                // scrollbar fix for IE
                $('body').css('overflow','hidden');
            },
            close: function() {
                // reset overflow
                $('body').css('overflow','auto');
            }
        }); // end of dialog
    },

    open: function(msg, callback){
        var self = this;
        self.$e.html(msg);

// NO FUNCIONA
//        $(document).on("dialogopen", ".ui-dialog", function(event, ui) {
//            callback();
//        });
//        self.$e.on("dialogopen", function(){
//            callback();
//        });
        self.$e.dialog('open');


        var id = setInterval(function(){
            if(self.$e.dialog("isOpen"))
            {
                clearInterval(id);
                callback();
            }
        }, 200);
    },

    close: function(){
        var self = this;
        self.$e.dialog('close');
    }
};


function ModalDialog(node)
{
    // Elemento del DOM a insertar en el cuadro de diálogo
    this.node = node;

    $(node).dialog({
        autoOpen: false,    // set this to false so we can manually open it
        dialogClass: "formDialogWindow",
        closeOnEscape: false,
        draggable: false,
        width: 460,
        minHeight: 50,
        modal: true,
        buttons: {},
        resizable: false,
        open: function() {
            // scrollbar fix for IE
            $('body').css('overflow','hidden');
        },
        close: function() {
            // reset overflow
            $('body').css('overflow','auto');
        }
    }); // end of dialog

    this.open = function()
    {
        $(this.node).dialog('open');
    };

    this.close = function()
    {
        $(this.node).dialog('close');
    };

    this.isOpened = function()
    {
        $(this.node).dialog('isOpen');
    };
}


var ImgLoader = {

    // {
    //      '/media/img/label/kichi.png': (correspondiente objeto Image() cargado),
    //      ...
    // }

    imgs: {},
    i: 0,
    src_list: [],
    callback: null,

    load: function(src_list, callback){
        var self = this;

        if(src_list && callback)
        {
            self.src_list = src_list;
            self.callback = callback;
        }

        // Si se han cargardo todos los src ejecutamos el callback..
        if(self.i == self.src_list.length)
        {
            self.callback();
            self.i = 0;
            return;
        }

        if(self.src_list[self.i])
        {
            var img = new Image();
            img.src = self.src_list[self.i];
            img.onload = function(){
                self.imgs[self.src_list[self.i]] = img;
            };
        }
        else
            self.imgs[self.src_list[self.i]] = null;

        self.i++;

        // Cargamos el siguiente src..
        self.load();
    },

    get: function(img_src){
        return this.imgs[img_src]
    },

    push: function(img_src){
        this.src_list.push(img_src);
    }
};


var I18n = {
    selectLang: function(lang_code)
    {
        $('#choose-lang img').on('click', function(){
            $(this).parent().find('select').val($(this).attr('id'));
            $(this).parent().submit();
        });

        $('#' + lang_code).css({'display':'none'});
    }
};



/**
 * Function generates a random string for use in unique IDs, etc
 *
 * @param <int> n - The length of the string
 */
function randString(n)
{
    if(!n)
    {
        n = 5;
    }

    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for(var i=0; i < n; i++)
    {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}


var Spinner = {
    show: function(msg)
    {
        $.jqDialog.content(msg);
    },

    hide: function()
    {
        $('#jqDialog_box').hide();
    }
};


function resizeScreenListener(callback)
{
    // Detect whether device supports orientationchange event, otherwise fall back to
    // the resize event.
    // Executes callback param when event is fired.
    var supportsOrientationChange = "onorientationchange" in window,
        orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

    window.addEventListener(orientationEvent, function() {
        callback();
    }, false);
}

