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

    var urlstring = location.origin + '/map/';
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

$(document).ready(function() {

	if (Modernizr.touch) {
       

			/* ok we have a touch device so we will grab the touch events now */
			$(".navi").click(function() {
				/* for the first ul which is our list of other items display it */
				$(".n1").show();
                $(".n2").show();
                $(".n3").show();
                $(".n4").show();
                //$(".n6").hide();
			});

			/* if the user touches the content of the page then hide all the nav items */
			$("#content").click(function() {
				$(".n1").hide();
                $(".n2").hide();
                $(".n3").hide();
                $(".n4").hide();
                //$(".n6").show();
            })
	}

});