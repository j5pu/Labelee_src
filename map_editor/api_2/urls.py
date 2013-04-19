from django.conf.urls import patterns, url


# /api-2/..

urlpatterns = patterns('map_editor.api_2',

	url(r'^place/(?P<pk>\d*)$', 'models.place'),
	url(r'^map/(?P<pk>\d*)$', 'models.map'),

	# /api-2/map/16/img
	url(r'^(?P<resource>.*)/(?P<id>\d*)/img$', 'services.views.img'),
)
