$(function () {
    Connections.init();
});


var Connections = {

    init: function()
    {
        // Mapeamos el DOM
        Connections.$e.init();
        Connections.cargarAristas();
        Connections.cargarConnections();
        // Aplicamos el fitro a cada selector
        Connections.$e.aristas.select1.filterByText(Connections.$e.aristas.textbox1, true);
        Connections.$e.aristas.select2.filterByText(Connections.$e.aristas.textbox2, true);

        Connections.Events.agregaTodos();

        // Cargamos la lista de aristas

    },

    cargarAristas: function()
    {
        // Carga todas las etiquetas de categoría 'aristas' de todos los sitios
        Connections.listaAristas = new PointResource().readConnectionsFromEnclosure(Connections.enclosure_id);

//        col: 1
//        description: A0-P0
//        floor: "/api/v1/floor/1/"
//        id: 151
//        label: "/api/v1/label/3/"
//        qr_code: "/api/v1/qr-code/5/"
//        resource_uri: "/api/v1/point/151/"
//        row: 1
        for(var i in Connections.listaAristas)
        {
            var arista = Connections.listaAristas[i];
            var descripcion = arista.description || arista.resource_uri;
            Connections.$e.aristas.select1.append('<option class="opciones" value="' + arista.resource_uri + '">' + descripcion + '</option>');
            Connections.$e.aristas.select2.append('<option class="opciones" value="' + arista.resource_uri + '">' + descripcion + '</option>');

        }
    },


    cargarConnections: function()
    {
        // Traemos todas las connections que hay en BD
        var connections = new ConnectionResource().readFromEnclosure(Connections.enclosure_id);

        if(connections.length == 0)
        {
            Connections.$e.lista_connections[0].innerHTML = gettext('No saved connections at the moment for this enclosure');
            return;
        }

        // Vaciamos lo que haya dentro de <div id="lista_connections">
        Connections.$e.lista_connections[0].innerHTML = '';

        // Creamos cada <li> para su connection
        for(var i in connections)
        {
            var connection = connections[i];
            var init = connection.init;
            var end = connection.end;
            var text = ' <span class="connector">' + init.description + '</span>' +
                '<i class="icon-arrow-right icon-white"></i>' +
                '<span class="connector">' + end.description + '</span>';

            //create new li element
            var elementoli = document.createElement("li");
            elementoli.setAttribute("class", "li");
            elementoli.innerHTML =
                '<button class="btn eliminar_connection" data-connection-id="' + connection.id + '">' +
                    '<i class="icon-remove"></i>' +
                '</button>' +
                text;

            Connections.$e.lista_connections[0].appendChild(elementoli);
        }

        // Volvemos a mapear todos los elementos y asignamos eventos esta vez sólo
        // para eliminar, ya que si no se iría acumulando en los demás,
        // por ejemplo "Guardar connection", duplicando siempre los eventos
        Connections.$e.init();
        Connections.Events._eliminaConnection();
    },


    guardarConnections: function () {
        var a = Connections.$e.aristas.select1[0].options;
        var a1 = a[Connections.$e.aristas.select1[0].selectedIndex];
        var a2 = Connections.$e.aristas.select2[0].options[Connections.$e.aristas.select2[0].selectedIndex];

        var data = {
            init: a1.value,
            end: a2.value
        };

        new ConnectionResource().create(data);

        Connections.cargarConnections();
    },


    eliminaConnection: function () {
        var button = $(this);
        var connection_id = button.data('connection-id');

        new ConnectionResource().del(connection_id, gettext('Delete connection?'));

        Connections.cargarConnections();
    }
};


Connections.$e = {
    init: function () {
        this.aristas = {
            textbox1: $('#textbox1'),
            textbox2: $('#textbox2'),
            select1: $('#select1'),
            select2: $('#select2')
        };

        this.guardarConnection = $('input.btn');

        this.lista_connections = $('#lista_connections');

        this.eliminar_connection = $('.eliminar_connection');
    }
}


/*var Aristas = {
    Events: {},
    $e: {}
}*/


Connections.Events = {

    _guardaConnection: function () {
        Connections.$e.guardarConnection.on('click', Connections.guardarConnections);
    },


    _eliminaConnection: function () {
        Connections.$e.eliminar_connection.on('click', Connections.eliminaConnection);

    },

    agregaTodos: function () {
        Connections.Events._guardaConnection();
//        Connections.Events._eliminaConnection();
    }

};


