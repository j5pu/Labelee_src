              <script type="text/javascript">
              var rrose_map = L.map('rrose_map').setView([0.0, 0.0], 2);
              L.tileLayer('images/tiles/{z}/{x}/{y}.png', {
                  minZoom: 1,
                  maxZoom: 4
              }).addTo(rrose_map);
              
              var rrose_geoj = new L.GeoJSON( graticule, {
                  style: function(feature){ return feature.properties.style },
              onEachFeature: function(feature,layer){
                      layer.on('click',function(e) {
                          rrose_map.closePopup();
                          return true;
                          });
                
                    layer.on('mouseover', function(e){
                    var hover_bubble = new L.Rrose({ offset: new L.Point(0,-10), closeButton: false, autoPan: false })
                      .setContent(feature.properties.name)
                      .setLatLng(e.latlng)
                      .openOn(rrose_map);
                      });

                    layer.on('mouseout', function(e){ rrose_map.closePopup() });
                    }
              }).addTo(rrose_map);
              </script>