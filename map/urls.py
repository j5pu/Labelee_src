from django.conf.urls import patterns, url

urlpatterns = patterns('map.views',
    # url(r'^$', 'index', name='index'),
    url(r'^your-position/(\d{3})$', 'your_position'),
    url(r'^event-log$', 'event_log'),
)
