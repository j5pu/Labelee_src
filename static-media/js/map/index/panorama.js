var Panorama = {

    opened: false,
    point: null,
    resizing: false,

    init: function()
    {
/*
        $(document).on('click tap touch', function(ev){
            if(ev.target.tagName !== 'CANVAS')
                Panorama.close();
        });
*/
    },

    renderIcon: function(pointId)
    {
        return  '<button onclick="Panorama.show(this)" class="panorama"  id="' + pointId + '">' +
            '<i class="icon-camera"></i>' +
            '</button>'
    },

    bindShow: function(marker)
    {
        Panorama.marker = marker;
        $('.leaflet-popup-content button.panorama').on('click', function(e){
            e.preventDefault();
            Panorama.show();
        });
    },

    show: function()
    {
//        console.log('yaaa');
        Coupon.close();
        Panorama.opened = true;

        var newWidth=window.innerWidth*0.9,
            newHeight=newWidth*9/16;
        addSamplePano(Panorama.marker.panorama,{height: newHeight, ratio:9/16});
            //, minSpeed:30});
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
        Panorama.opened = false;

        Logger.log('panorama cerradoxxxxxx');
    }
};