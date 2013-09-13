from django.conf.urls.defaults import *


urlpatterns = patterns(
    'map_editor.views',

    url(r'^$', 'index', name='map_editor__index'),
    url(r'^edit/(?P<pk>\d+)$', 'edit', name='map_editor__edit'),
    url(r'^edit/connections/(?P<enclosure_id>\d+)$', 'connections'),
    url(r'^help', 'help_page'),
)
