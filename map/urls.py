from django.conf.urls import patterns, url

urlpatterns = patterns('map.views',

    url(r'^(?P<qr_type>.+)/((?P<enclosure_id>\d+)_(?P<floor_id>\d+)_(?P<poi_id>\d+))*$', 'show_map'),

)
