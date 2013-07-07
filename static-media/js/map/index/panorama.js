var Panorama = {

    resizing: false,
    opened: false,

    renderIcon: function(pointId)
    {
        return  '<button data-pan="' + pointId + '">' +
            '<i class="icon-camera"></i>' +
            '</button>'
    },

    bindShow: function()
    {

        $('.leaflet-popup-content button').on('click', function (e) {
            e.preventDefault();
            Panorama.opened = true;
            var point_id = $(this).data('pan');
            var point = new PointResource().read(point_id);

//            addSamplePano(point.panorama,{ratio:9/16});
            addSamplePano(point.panorama,{ratio:9/16, minSpeed:30});
//            addSamplePano(point.panorama,{height: 200, width: 4});
        });
    },

    resize: function()
    {
        if(!Panorama.opened)
            return;

        Panorama.resizing = true;

        $('.leaflet-popup-content button').trigger('click');

//        var newWidth=window.innerWidth * .85;
//        console.log(newWidth);
//        if(document.getElementsByTagName('canvas'))
//        //Panorama.bindShow();
//            $('canvas').trigger('click');
//        document.getElementsByTagName('canvas')[0].width = newWidth;

        Panorama.resizing = false;
    },

    close: function()
    {
        jQuery('body').find('img[id*=pano]').remove();
        jQuery('canvas').remove();
        jQuery('button#close').remove();
        Panorama.opened = false;
    }
};