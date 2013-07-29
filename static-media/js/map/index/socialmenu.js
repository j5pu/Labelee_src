/*
** Loads Facebook Javascript SDK. Currently interaction with Facebook is performed via URL
** If needed, we can go back to the complete API by uncommenting this block
** Watch out! Facebook div must be included in index.html as well
**


$(document).ready(function() {

    window.fbAsyncInit = function() {
    // init the FB JS SDK
    FB.init({
      appId      : SocialMenu.FACEBOOK_APP_ID              // App ID from the app dashboard
      //channelUrl : '//WWW.YOUR_DOMAIN.COM/channel.html', // Channel file for x-domain comms
      status     : true,                                 // Check Facebook Login status
      xfbml      : true                                  // Look for social plugins on the page
    });

    // Additional initialization code such as adding Event Listeners goes here
  };

  // Load the SDK asynchronously
  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/all.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));

});
*/

var SocialMenu = {

    opened: false,
    urlstring: location.origin + '/map/dest/',
    FACEBOOK_APP_ID: 151420028386535,

    renderIcon: function (pointId) {


        return '<g:plus action="share"></g:plus>' + '<p align="center" id="socialsharing" ><button class="socialmenu" style=" left:0px;" onclick="SocialMenu.fbs_click(' + pointId + ')" data-socialmenu="' + pointId + '">' +
            '<i class="icon-facebook-sign"></i>' +
            '</button>' +
            '<button class="socialmenu" style=" left:0px;"  onclick="SocialMenu.twt_click(' + pointId + ')" data-socialmenu="' + pointId + '">' +
            '<i class="icon-twitter-sign"></i>' +
            '</button>' +
            '<button class="socialmenu" style=" left:0px;" onclick="SocialMenu.google_click(' + pointId + ')" data-socialmenu="' + pointId + '">' +
            '<i class="icon-google-plus-sign"></i>' +
            '</button></p>'+
            '<span id="go-button">GO!</span>'

    },

    bindShow: function () {
        /* $('.leaflet-popup-content button.socialmenu').on('click', function () {
         // SocialMenu.marker.bindPopup(html).openPopup();
         if(SocialMenu.opened) SocialMenu.close();
         SocialMenu.opened = true;

         var point_id = $(this).data('socialmenu');
         SocialMenu.point = new PointResource().read(point_id);
         SocialMenu.floor = new FloorResource().readFromUri(SocialMenu.point.floor);
         SocialMenu.enclosure = enclosure_id;
         SocialMenu.url = SocialMenu.urlstring+ SocialMenu.enclosure+'_'+SocialMenu.floor.id+'_'+SocialMenu.point.id;
         SocialMenu.urlTitle =  'would you like to go to'+SocialMenu.point.description +'?';
         var html =  '<span id="social" >';
         html += '<ul class="navi">';
         html+= '<li id="n1" class="n1" style="left: 10px"><a class="mjn-tab1" href="#" title="{% trans "Compartir con" %} Facebook" onclick="SocialMenu.fbs_click()"><span> <i class="icon-facebook-sign"></i></span></a> </li>';
         html+= ' <li id="n2" class="n2" style="left: 50px"><a class="mjn-tab2" href="#" title="{% trans "Compartir con" %} Twitter" onclick="SocialMenu.twt_click()"><span>  <i class="icon-twitter-sign"></i></span></a> </li>';
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
        //  });
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

    fbs_click: function (point) {

        var information = SocialMenu.getShareInformation(point);

        window.open('https://www.facebook.com/dialog/feed?' +
            'app_id=' + SocialMenu.FACEBOOK_APP_ID +
            '&link=' + information[0] +
            '&picture=' + location.origin + '/media/labelee-square-logo.png' +
            '&caption=' + information[1] +
            '&name=Labelee' +
            '&redirect_uri=' + document.URL,
            'sharer', 'toolbar=0,status=0,width=900,height=436');

        // Uncomment to use Javascript SDK instead of URL call to API
/*        FB.ui({
            method: 'feed',
            link: information[0],
            picture: location.origin + '/media/labelee-square-logo.png',
            name: 'Labelee',
            caption: information[1]
            //description: '',
        }, function(response){});*/

    },
    google_click: function (point) {
        var information = SocialMenu.getShareInformation(point);

        // Not used at the moment !!!!
        // Schema properties necessary to customize Google+ share
        //$('#snippet_description').prop('content', information[1]);

        window.open('https://plus.google.com/share?url=' + encodeURIComponent(information[0]), 'sharer', 'toolbar=0,status=0,width=626,height=436');
    },
    twt_click: function (point) {
        var information = SocialMenu.getShareInformation(point);
        window.open('http://twitter.com/share?url=' + encodeURIComponent(information[0]) + '&text=' + encodeURIComponent(information[1]), 'sharer', 'toolbar=0,status=0,width=626,height=436');
    },

    getShareInformation: function (pointId) {

        var selectedPoi = null;
        var floor = -1
        var description="";
        if (poi_id == pointId) {
            floor = floor_id;
            description = qrPoint.point.description;
        } else {
            for (var selectedFloor in floors) {
                for (var selectedPoi in floors[selectedFloor].pois) {


                    if (floors[selectedFloor].pois[selectedPoi].id == pointId) {
                        floor = floors[selectedFloor].id;
                        description=floors[selectedFloor].pois[selectedPoi].description;
                        break;
                    }
                }
            }
        }
        var enclosure = enclosure_id;
        url = SocialMenu.urlstring + enclosure + '_' + floor + '_' + pointId;
        urlTitle = 'Click here to go to ' + description;
        var result = new Array();
        result[0] = url;
        result[1] = urlTitle;
        return result;
    }

};


/*
$(document).ready(function() {

	if (Modernizr.touch) {


			*/
/* ok we have a touch device so we will grab the touch events now *//*

			$(".navi").click(function() {
				*/
/* for the first ul which is our list of other items display it *//*

				$(".n1").show();
                $(".n2").show();
                $(".n3").show();
                $(".n4").show();
                //$(".n6").hide();
			});

			*/
/* if the user touches the content of the page then hide all the nav items *//*

			$("#content").click(function() {
				$(".n1").hide();
                $(".n2").hide();
                $(".n3").hide();
                $(".n4").hide();
                //$(".n6").show();
            })
	}

});
*/



