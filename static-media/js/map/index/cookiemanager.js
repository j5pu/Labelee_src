var LocalStorageHandler = {

    init: function () {
        this.checkExpire();
        this.setValues();
        this.draw();
    },

    checkExpire: function () {
        for (index = 0; index < localStorage.length; index++) {
            if (localStorage.key(index) != 'prevDest' && localStorage.key(index) != 'miCoche')
                continue;

            var obj = JSON.parse(localStorage.getItem(localStorage.key(index)));
            var delay = 86400000; // 24h
            var expired = new Date().getMilliseconds() > obj.prevDate + delay;
            if (obj && expired) {
                localStorage.removeItem(localStorage.key(index));
            }
        }
    },

    setValues: function () {
        //
        // guarda parquing
        if (qrPoint.isParking) {
            if (confirm(gettext('Do you want to remember your parking space?'))) {
                var miCoche = {
                    dest: qrPoint,
                    prevDate: new Date().getTime()
                };
                LocalStorageHandler.setCookie('miCoche', JSON.stringify(miCoche));
            } else {
                localStorage.removeItem('miCoche')
            }
        }

        if (qr_type == 'dest') {
            // guarda destino compartido
            this.setSharedDest();
        }
        else {
            // guarda destino previo
            if (localStorage.getItem('sharedDest')) {
                var sharedDest = JSON.parse(localStorage.getItem('sharedDest'));
                if (sharedDest) {
                    localStorage.removeItem('sharedDest');
                    sharedDest.mesg = gettext('Do you still want to go to the previous destination?');

                    LocalStorageHandler.setCookie('prevDest', JSON.stringify(sharedDest));
                }
            }
        }




//        Convert a Date to a string when setting, and parse it when getting
//        localStorage.lastRead = (new Date()).toUTCString();
//        var lastRead = new Date(Date.parse(localStorage.lastRead));
    },

    setSideMenu: function () {


        if (localStorage.getItem('prevDest')) {
            var prevDest = JSON.parse(localStorage.getItem('prevDest'));
            if (prevDest) {
                if (qrPoint.enclosure.id != prevDest.enclosureid)
                    return;

                var point_dest_id = prevDest.poid,
                    floor_dest_id = prevDest.floorid,
                    description = prevDest.description_for_menu;

                /*                $('#scrollMenu').prepend(
                 '<li>'+
                 '<span style="background:red;"'+ 'onclick="' + "$('#menu-right').trigger( 'close' );" +
                 "showRouteFromMenu(" + qrPoint.point.id + ', ' + point_dest_id + ');">' +
                 gettext('PREVIOUS DESTINATION') +
                 '<i class="icon-screenshot"></i>'+' - '+
                 description+ '</span>'+
                 '</li>'
                 );*/

                $('ul#destList').append(
                    '<li>' +
                        '<a href="#" style="font-size:0.8rem; color:#333"' +
                        'onclick="' + "$('#menu-right').trigger( 'close' );" +
                        "showRouteFromMenu(" + qrPoint.point.id + ', ' + point_dest_id + ');">' +
                        description + "</a></li>"
                );
            }
        }

        // MICOCHE
        if (localStorage.getItem('miCoche')) {
            var miCoche = JSON.parse(localStorage.getItem('miCoche'));
            if (miCoche) {
                if (qrPoint.enclosure.id != miCoche.dest.enclosure.id)
                    return;

                $('#scrollMenu').prepend(
                    '<li>' +
                        '<span style="background:cadetblue;"' + 'onclick="' + "$('#menu-right').trigger( 'close' );" +
                        "showRouteFromMenu(" + qrPoint.point.id + ', ' + miCoche.dest.point.id + ');">' +
                        miCoche.dest.labelCategory.name +
                        '<i class="icon-automobile"></i>' + ' - ' +
                        miCoche.dest.point.description + '</span>' +
                        '</li>'

                    /*           '<li>' +
                     '<li class="Label mmenu-label">' + miCoche.dest.labelCategory.name + '</li>' +
                     '<li ' +
                     'onclick="' + "$('#menu-right').trigger( 'close' );" +
                     "showRouteFromMenu(" + qrPoint.point.id + ', ' + miCoche.dest.point.id + ');">' +
                     miCoche.dest.point.description +
                     '</li>' +
                     '</li>'
                     */
                );
            }
        }
        /*

         $('#scrollMenu').prepend(
         '<li    class="help" ' +
         'onclick="' + "$('#menu-right').trigger( 'close' );" + 'HelpMenu.show();">' +
         '<img src="/static/img/help_menu/logo_nuevo.png">' +
         '<button>?</button>' +
         '</li>'
         );*/
    },

    setPrevDest: function (marker) {
        var prevDest = {
            'prevDate': new Date().getTime(),
            'poid': marker.poid,
            'floorid': marker.floorid,
            'enclosureid': qrPoint.enclosure.id,
            'mesg': gettext('Do you still want to go to') + ' ' + marker.description + '?',
            'description': marker.title,
            'description_for_menu': marker.description
        };
        LocalStorageHandler.setCookie('prevDest', JSON.stringify(prevDest));
    },
    setPrevDestByPoi: function (pointid) {
        var poi = null;
        for (var floorIndex = 0, len = floors.length; floorIndex < len; ++floorIndex) {
            for (var poiIndex = 0; poiIndex < floors[floorIndex].pois.length; ++poiIndex) {
                if (floors[floorIndex].pois[poiIndex].id == pointid) {
                    poi = floors[floorIndex].pois[poiIndex];
                    break;
                }
            }

            if (poi != null) {
                break;
            }
        }
        if (poi != null) {
            var prevDest = {
                'prevDate': new Date().getTime(),
                'poid': poi.id,
                'floorid': poi.floor,
                'enclosureid': qrPoint.enclosure.id,
                'mesg': gettext('Do you still want to go to') + ' ' + poi.marker.description + '?',
                'description': poi.marker.title,
                'description_for_menu': poi.marker.description
            };
            LocalStorageHandler.setCookie('prevDest', JSON.stringify(prevDest));
        }
    },

    setSharedDest: function () {
        var sharedDest = {
            dest: qrPoint,
            'prevDate': new Date().getTime(),
            'shooted_origin': false
        };

        LocalStorageHandler.setCookie('sharedDest', JSON.stringify(sharedDest));
    },


    draw: function () {
        if (qr_type == 'origin') {
            // DESTINO PREVIO
            if (localStorage.getItem('prevDest')) {
                var prevDest = JSON.parse(localStorage.getItem('prevDest'));
                if (prevDest) {
                    if (prevDest.dest && prevDest.dest.enclosure.id == qrPoint.enclosure.id) {
                        if (prevDest.shooted_origin)
                            if (confirm(prevDest.mesg)) {
                                showOrigin = true;
                                drawRoute(qrPoint.point.id, prevDest.dest.point.id);
                            }
                            else
                                localStorage.removeItem('prevDest');
                        else {
                            showOrigin = true;
                            drawRoute(qrPoint.point.id, prevDest.dest.point.id);
                            prevDest.shooted_origin = true;
                            LocalStorageHandler.setCookie('prevDest', JSON.stringify(prevDest));
                        }
                    }
                    else if (prevDest.enclosureid == qrPoint.enclosure.id) {
                        if (confirm(prevDest.mesg)) {
                            showOrigin = true;
                            drawRoute(qrPoint.point.id, prevDest.poid);
                        }
                        else
                            localStorage.removeItem('prevDest');
                    }
                }
            }

            this.setSideMenu();
        }

    },

    setCookie: function (name, valor) {

        if (jQuery.cookie('cc_cookie_accept') == "cc_cookie_accept")
            localStorage.setItem(name, valor);

    },
    clearAll: function () {
        if (jQuery.cookie('cc_cookie_decline') == "cc_cookie_decline") {
            localStorage.clear();
            this.deleteallcookies();
        }
    },
    deleteallcookies: function () {

        var cookies = document.cookie.split(";");
        var path = window.location.pathname.split('/');

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT" + ";path=/";
            if (path[1]) {
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT" + ";path=/" + path[1];
            }
            if (path[2]) {
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT" + ";path=/" + path[1] + "/" + path[2];
            }
            if (path[3]) {
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT" + ";path=/" + path[1] + "/" + path[2] + "/" + path[3];
            }
        }
    },

    setFirstShoot: function () {
        if (!localStorage.getItem('first_shoot')) {
            var first_shoot = {
                time: new Date().getTime(),
                key: randString(8)
            };

            LocalStorageHandler.setCookie('first_shoot', JSON.stringify(first_shoot));
        }
    }
};
