from django.conf.urls import patterns, url


urlpatterns = patterns('map_editor.api_2',

	url(r'^place/(?P<pk>\d*)$', 'models.place'),
	url(r'^map/(?P<pk>\d*)$', 'models.map'),

)
