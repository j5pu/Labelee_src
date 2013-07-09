var Panorama = {

    resizing: false,
    opened: false,

    init: function()
    {
        $(document).on('click tap touch', function(ev){
            //alert('tap!!');
            if(ev.target.tagName !== 'CANVAS')
                Panorama.close();
        });
    },

    renderIcon: function(pointId)
    {
        return  '<button onclick="Panorama.show(this)" class="panorama"  id="' + pointId + '">' +
            '<i class="icon-camera"></i>' +
            '</button>'
    },

    bindShow: function()
    {

     /*   $('.leaflet-popup-content button.panorama').on('click', function (e) {
            e.preventDefault();
            Panorama.opened = true;
            var point_id = $(this).data('pan');
            var point = new PointResource().read(point_id);

//            addSamplePano(point.panorama,{ratio:9/16});
            addSamplePano(point.panorama,{ratio:9/16, minSpeed:30});
//            addSamplePano(point.panorama,{height: 200, width: 4});
        });*/
    },
     show: function(element)
    {
            Panorama.opened = true;
            var point_id = element.id;
            var point = new PointResource().read(point_id);
            var newWidth=window.innerWidth * 0.8,
                newHeight=newWidth*9/16;

//            addSamplePano(point.panorama,{ratio:9/16});
            addSamplePano(point.panorama,{height: newHeight, ratio:9/16, minSpeed:30});
    },

    resize: function()
    {
        if(!Panorama.opened)
            return;

        Panorama.resizing = true;

//        $('.leaflet-popup-content button.panorama').trigger('click');

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