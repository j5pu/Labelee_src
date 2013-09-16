var Panorama = {

    opened: false,
    point: null,
    resizing: false,

    init: function()
    {

        $(document).on('click', function(ev){
//        console.log(ev);
            if(ev.target.id !== 'canvasPan')
                Panorama.close();
        });

    },

    bindShow: function(marker)
    {
//        Panorama.marker = marker;
//        $('.leaflet-popup-content button.panorama').on('click', function(e){
//            e.preventDefault();
//            Panorama.show();
//        });
    },

    show: function(marker)
    {
//        console.log('yaaa');
        Coupon.close();
        Panorama.element = marker;
        Panorama.opened = true;

        var newWidth=window.innerWidth*0.9,
            newHeight=newWidth*9/16;

        var panoramaImage = marker.panorama; // marker.getAttribute('data-panorama')
        if (panoramaImage.indexOf("media") == -1) {
            panoramaImage = "/media/" + panoramaImage;
        }

        addSamplePano(panoramaImage,{height: newHeight, ratio:9/16, minSpeed:30});
    },

    resize: function()
    {
        if(!Panorama.opened)
            return;

        Panorama.resizing = true;
        Panorama.close();
        Panorama.show(Panorama.element);
        Panorama.resizing = false;
    },

    close: function()
    {
        jQuery('#canvasPan').remove();
        jQuery('button#close').remove();
        jQuery('div#page').find('img[id*=pano]').remove();
        clearInterval(ddpanoramas.timerId);
        Panorama.opened = false;

    }
};