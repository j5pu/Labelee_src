var SocialMenu = {

    resizing: false,
    opened: false,

    renderIcon: function(pointId)
    {
        return  '<button data-socialmenu="' + pointId + '">' +
            '<i class="icon-share-alt"></i>' +
            '</button>'
    },

    bindShow: function()
    {
       alert('hola');
    },

    resize: function()
    {
        if(!SocialMenu.opened)
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

    close: function()
    {
        jQuery('canvas').remove();
        jQuery('button#close').remove();
        SocialMenu.opened = false;
    }
};