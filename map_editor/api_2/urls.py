from django.conf.urls import patterns, url


# /api-2/..

urlpatterns = patterns('map_editor.api_2',

	url(r'^place/(?P<pk>\d*)$', 'models.place'),
	url(r'^map/(?P<pk>\d*)$', 'models.map'),

	# /api-2/map/16/img
	url(r'^(?P<resource>.*)/(?P<id>\d*)/img$', 'services.views.img'),
	
	# /api-2/object/grid/1
	url(r'^object/grid/(?P<grid_id>\d+)$', 'resources.object.read_from_grid'),
	
	
	
	
	# 	/api-2/grid/1/point/object/*/*..
		#'(?P<related_resources>(?:\w+/)+)$', 'services.views.get_related'),
	# http://stackoverflow.com/questions/2360179/django-urls-how-to-pass-a-list-of-items-via-clean-urls/2360415#2360415

)