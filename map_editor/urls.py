from django.conf.urls import patterns, url


urlpatterns = patterns('map_editor.views',

	url(r'^$', 'index', name='index'),

    # places:
    #	/new
    url(r'^places/(.*)$', 'places', name='places'),
    url(r'^maps/(.*)$', 'maps', name='maps'),

    # url(r'^maps/new$', 'new_map', name='new_map'),
    url(r'^edit-map/$', 'edit_map', name='edit_map'),
)
