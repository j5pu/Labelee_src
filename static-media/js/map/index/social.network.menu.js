function fbs_click() {
    u = get_url();
    t = document.title;
    window.open('http://www.facebook.com/sharer.php?u=' + encodeURIComponent(u) + '&t=' + encodeURIComponent(t), 'sharer', 'toolbar=0,status=0,width=626,height=436');

}

function twt_click() {
    u = get_url();
    t = document.title;
    window.open('http://twitter.com/share?url=' + encodeURIComponent(u) + '&t=' + encodeURIComponent(t), 'sharer', 'toolbar=0,status=0,width=626,height=436');

}

function google_click() {
    u = get_url();
    window.open('https://plus.google.com/share?url=' + encodeURIComponent(u), 'sharer', 'toolbar=0,status=0,width=626,height=436');

}

function mail_click() {
    var subject = "Labelee";
    var body = get_url();
    var uri = "mailto:?subject=";
    uri += encodeURIComponent(subject);
    uri += "&body=";
    uri += encodeURIComponent(body);
    alert(uri);
    window.open(uri);
}

function sms_click() {
    var body = get_url();
    var uri = "sms:?body=";
    uri += encodeURIComponent(body);
    alert(uri);
    window.open(uri);
}


function get_url() {
    var urlstring = location.origin + '/map/';
    var prevDest = JSON.parse(localStorage.getItem('prevDest'));
    if (prevDest) {
        urlstring += 'dest/' + prevDest.enclosureid + '_' + prevDest.floorid + '_' + prevDest.poid;
        return urlstring;
    } else {
        for (var sfl in floors) {
            for (var poi in floors[sfl].pois) {
                if (searchMarker._markerLoc._circleLoc._latlng == floors[sfl].pois[poi].marker._latlng) {
                    urlstring += 'dest/' + qrPoint.enclosure.id + '_' + floors[sfl].id + '_' + floors[sfl].pois[poi].id;
                    return urlstring;
                }
            }
        }
    }

    return location.href;
}