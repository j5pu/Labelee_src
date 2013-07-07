var SocialMenu = {

    opened: false,
    urlstring: location.origin + '/map/dest/',

    renderIcon: function (pointId) {
        return '<button class="socialmenu" data-socialmenu="' + pointId + '">' +
            '<i class="icon-share-alt"></i>' +
            '</button>'
    },

    bindShow: function () {
        $('.leaflet-popup-content button.socialmenu').on('click', function () {
            // SocialMenu.marker.bindPopup(html).openPopup();
            if(SocialMenu.opened) SocialMenu.close();
            SocialMenu.opened = true;

            var point_id = $(this).data('socialmenu');
            SocialMenu.point = new PointResource().read(point_id);
            SocialMenu.floor = new FloorResource().readFromUri(SocialMenu.point.floor);
            SocialMenu.enclosure = enclosure_id;
            SocialMenu.url = SocialMenu.urlstring+ SocialMenu.enclosure+'_'+SocialMenu.floor.id+'_'+SocialMenu.point.id

            var html =  '<span id="social" >';
            html += '<ul class="navi">';
            html+= '<li id="n1" class="n1" style="left: 10px"><a class="mjn-tab1" href="#" title="{% trans "Compartir con" %} Facebook" onclick="fbs_click()"><span> <i class="icon-facebook-sign"></i></span></a> </li>';
            html+= ' <li id="n2" class="n2" style="left: 50px"><a class="mjn-tab2" href="#" title="{% trans "Compartir con" %} Twitter" onclick="twt_click()"><span>  <i class="icon-twitter-sign"></i></span></a> </li>';
            html+='<li id="n3" class="n3"  style="left: 90px"><a class="mjn-tab3" href="#" title="{% trans "Compartir con" %} Google"    onclick="SocialMenu.google_click()"><span>  <i class="icon-google-plus-sign"></i></span></a>  <button id="closeSocial" class="button" onclick="SocialMenu.close()">x</button> </li>'
            html+='   </li>   </ul>   </span>'

            $(this).parent().append(html);



    /*        $('button#close').css({


           })
                .on('click', function () {
                   SocialMenu.close();
               jQuery('canvas').remove();
                jQuery('body').find('.navi').remove();
              $(this).remove();
                })
              ;*/
        });
    },

    renderSocialPopup: function () {

    },

    resize: function () {
        if (!SocialMenu.opened)
            return;

        SocialMenu.resizing = true;

        $('.leaflet-popup-content button').trigger('click');

//        var newWidth=window.innerWidth * .85;
//        console.log(newWidth);
//        if(document.getElementsByTagName('canvas'))
//        //Panorama.bindShow();
//            $('canvas').trigger('click');
//        document.getElementsByTagName('canvas')[0].width = newWidth;

        SocialMenu.resizing = false;
    },

    close: function () {
        jQuery('#social').remove();
        jQuery('button#closeSocial').remove();
        SocialMenu.opened = false;
    },

    fbs_click: function() {



    },
    google_click: function() {

         window.open('https://plus.google.com/share?url=' + encodeURIComponent(SocialMenu.url), 'sharer', 'toolbar=0,status=0,width=626,height=436');
    }
};



function fbs_click() {
    u = get_url();
    if(u) return;
    t = document.title;
    window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(u) + '&t=' + encodeURIComponent(t), 'sharer', 'toolbar=0,status=0,width=626,height=436');

}

function twt_click() {
    u = get_url();
    if(u) return;
    t = document.title;
    window.open('http://twitter.com/share?url=' + encodeURIComponent(u) + '&t=' + encodeURIComponent(t), 'sharer', 'toolbar=0,status=0,width=626,height=436');

}

function google_click() {
    u = get_url();
    if(u) return;
    window.open('https://plus.google.com/share?url=' + encodeURIComponent(u), 'sharer', 'toolbar=0,status=0,width=626,height=436');

}

function mail_click() {
    var subject = "Labelee";
    var body = get_url();
    var uri = "mailto:?subject=";
    uri += encodeURIComponent(subject);
    uri += "&body=";
    uri += encodeURIComponent(body);
    window.open(uri);
}

/*function sms_click() {
    var body = get_url();
    var uri = "sms:?body=";
    uri += encodeURIComponent(body);
    alert(uri);
    window.open(uri);
}*/


function get_url() {


    var prevDest = JSON.parse(localStorage.getItem('prevDest'));
//    if(prevDest==null)
//    {   alert('Please select a destination to share.')
//        return true;
//    }
//    var result =confirm('Would you like to share the route to: '+ prevDest.description+ '?');
//    if(!result) return true;
    if (prevDest) {
        urlstring += 'dest/' + prevDest.enclosureid + '_' + prevDest.floorid + '_' + prevDest.poid;
        return urlstring;
    }
    //CAPADO HASTA QUE ACTIVEMOS LA LUPA DE BUSQUEDA
    /* else {
        for (var sfl in floors) {
            for (var poi in floors[sfl].pois) {
                if (searchMarker._markerLoc._circleLoc._latlng == floors[sfl].pois[poi].marker._latlng) {
                    urlstring += 'dest/' + qrPoint.enclosure.id + '_' + floors[sfl].id + '_' + floors[sfl].pois[poi].id;
                    return urlstring;
                }
            }
        }
    }*/

    return location.href;
}