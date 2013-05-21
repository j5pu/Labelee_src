from django.conf.urls import patterns, url

urlpatterns = patterns('map.views',
    # url(r'^$', 'index', name='index'),
    url(r'^your-position/(\d{3})$', 'your_position'),
    url(r'^event-log$', 'event_log'),

    # map/origin/1_25_91234
    url(r'^origin/(?P<enclosure_id>\d+)_(?P<floor_id>\d+)_(?P<point_id>\d+)$', 'origin'),

    )
