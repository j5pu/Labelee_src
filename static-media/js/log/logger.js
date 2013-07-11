var Logger = {

    //
    // USO:
    //
    // 1. Definir qué cosas queremos registrar con Logger.log('cadena'), en lugar usar console.log
    // 2. Abrir página con URL ..../log/mobile
    // 3. Interactuar con el dispositivo
    // 4. Podemos ver las salidas en la página /log/mobile abierta

    url: '/log/mobile/',
    logs: [],
    renderedLogs: [],
    paused: false,

    initReceiver: function () {

        setInterval(this.getLogs, 1000);

        Mousetrap.bind('space', function () {
            Logger.togglePause();
        });

        $('#logs').on('scroll mousewheel', function (ev) {
            // Scroll:
            //      hacia arriba: se pausa
            //      hacia abajo más del alto del documento: quita pausa

            if (ev.originalEvent.wheelDelta >= 0)
                Logger.pause();
            else if (ev.pageY + $(window).height() >= $(document).height())
                Logger.resume();
        });
    },


    initSender: function()
    {
        $.ajax({
            url: this.url + '?init_sender=true',
            type: 'get',
            headers: {
                'Content-Type': 'application/json'
            },
            dataType: 'json', // esto indica que la respuesta vendrá en formato json
            async: false,
            success: function (response) {
                var i = response;
            },
            error: function (response) {
                var j = response;
            }
        });
    },


    pause: function () {
        if (!Logger.paused)
            $('#paused').fadeIn(200);

        Logger.paused = true;
    },

    resume: function () {
        if (Logger.paused)
            $('#paused').fadeOut(200);

        Logger.paused = false;
    },

    togglePause: function () {
        if (Logger.paused)
            Logger.resume();
        else
            Logger.pause();
    },

    log: function (log) {
        this.logs.push(log);
        this.postLogs();
    },

    postLogs: function () {
        $.ajax({
            url: this.url,
            type: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify(this.logs),
            dataType: 'json', // esto indica que la respuesta vendrá en formato json
            async: false,
            success: function (response) {
                var i = response;
            },
            error: function (response) {
                var j = response;
            }
        });
    },

    getLogs: function () {
        if (Logger.paused) return;

        $.ajax({
            url: Logger.url,
            type: 'get',
            headers: {
                'Content-Type': 'application/json'
            },
            dataType: 'json', // esto indica que la respuesta vendrá en formato json
            async: false,
            success: function (response) {
                Logger.logs = response;
                if(Logger.logs.length > Logger.renderedLogs.length ||
                    Logger.logs.length == 0)
                    Logger.renderLogs();
            },
            error: function (response) {
                var j = response;
            }
        });
    },

    renderLogs: function () {
        $('#logs').empty();

        var counter = 1;

        for (var i in this.logs) {
            var log = this.logs[i];
            var log_prev = this.logs[i - 1];
            var $counter = $('#logs').find('p:last .counter');

            if (i == 0)
                $('#logs').append('<p><span class="number">' + i + '</span>' + log + '</p>');
            else if (log === log_prev) {
                counter++;
                if($counter) $counter.remove();
                $('#logs').find('p:last').append('<span class="counter">' + counter + '</span>');
            }
            else {
                if(counter > 1)
                {
                    $counter.remove();
                    $('#logs').find('p:last').append('<span class="counter">' + counter + '</span>');
                    counter = 1;
                }

                $('#logs').append('<p>' + '<span>' + i + '</span>' + log + '</p>');
            }
        }

        this.renderedLogs = this.logs;

        window.scrollTo(0, document.body.scrollHeight);
    }
};
