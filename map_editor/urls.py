from django.conf.urls import patterns, url


urlpatterns = patterns('map_editor.views',

	url(r'^$', 'index'),

	# places:

	# url(r'^maps/(.*)$', 'maps', name='maps'),
	url(r'^edit-map/(\d+)$', 'edit_map'),


)
