from django.conf.urls.defaults import *
 
 
urlpatterns = patterns('map_editor.views',
 
	url(r'^$', 'index', name='map_editor__index'),
	url(r'^edit/(\d+)$', 'edit', name='map_editor__edit'),
)
