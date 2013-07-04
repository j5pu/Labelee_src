var Panorama = {
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
            var point_id = $(this).data('pan');
            var point = new PointResource().read(point_id);
            addSamplePano(point.panorama,{ratio:9/16}
            );
        });
    }
};