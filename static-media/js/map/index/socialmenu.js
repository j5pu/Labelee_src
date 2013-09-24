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

        var menu = '';
        if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {

            menu = '<g:plus action="share"></g:plus>' + '<p align="center" id="socialsharing" ><button class="socialmenu" style=" left:0px; margin:0 -12px;" onclick="SocialMenu.fbs_click(' + pointId + ')" data-socialmenu="' + pointId + '">' +
                '<i class="icon-facebook-sign"></i>' +
                '</button>' +
                '<button class="socialmenu" style=" left:0px; margin:0 -12px;"  onclick="SocialMenu.twt_click(' + pointId + ')" data-socialmenu="' + pointId + '">' +
                '<i class="icon-twitter-sign"></i>' +
                '</button>' +
                '<button class="socialmenu" style=" left:0px; margin:0 -12px;" onclick="SocialMenu.whatsapp_click(' + pointId + ')" data-socialmenu="' + pointId + '">' +
                '<i class="icon-phone-sign"></i>' +
                '</button></p>';
        } else {
            menu = '<g:plus action="share"></g:plus>' + '<p align="center" id="socialsharing" ><button class="socialmenu" style=" left:0px; margin:0 -2px;" onclick="SocialMenu.fbs_click(' + pointId + ')" data-socialmenu="' + pointId + '">' +
                '<i class="icon-facebook-sign"></i>' +
                '</button>' +
                '<button class="socialmenu" style=" left:0px; margin:0 -2px;"  onclick="SocialMenu.twt_click(' + pointId + ')" data-socialmenu="' + pointId + '">' +
                '<i class="icon-twitter-sign"></i>' +
                '</button>' +
                '<button class="socialmenu" style=" left:0px; margin:0 -2px;" onclick="SocialMenu.google_click(' + pointId + ')" data-socialmenu="' + pointId + '">' +
                '<i class="icon-google-plus-sign"></i>' +
                '</button></p>';

        }
        return menu;
        /*+
         '<span id="route-button">GO!</span>'
         */
    },


    renderSocialPopup: function () {

    },

    resize: function () {
        if (!SocialMenu.opened)
            return;

        SocialMenu.resizing = true;

        $('.leaflet-popup-content button').trigger('click');

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
    whatsapp_click: function (point) {
        var information = SocialMenu.getShareInformation(point);
        window.location ='whatsapp://send?text=' + information[1] + encodeURIComponent(information[0]), 'sharer', 'toolbar=0,status=0,width=626,height=436';

    },


    getShareInformation: function (pointId) {

        var selectedPoi = null;
        var floor = -1
        var description = "";
        if (poi_id == pointId) {
            floor = floor_id;
            description = qrPoint.point.description;
        } else {
            for (var selectedFloor in floors) {
                for (var selectedPoi in floors[selectedFloor].pois) {


                    if (floors[selectedFloor].pois[selectedPoi].id == pointId) {
                        floor = floors[selectedFloor].id;
                        description = floors[selectedFloor].pois[selectedPoi].description;
                        break;
                    }
                }
            }
        }
        var enclosure = enclosure_id;
        url = SocialMenu.urlstring + enclosure + '_' + floor + '_' + pointId;
        urlTitle = 'Haz click en el siguiente enlace para ir a  ' + description + " ";
        var result = new Array();
        result[0] = url;
        result[1] = urlTitle;
        return result;
    }

};

