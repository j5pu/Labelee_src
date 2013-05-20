from django.conf.urls.defaults import *

# /sandbox/..

urlpatterns = patterns('sandbox.views',

	# url(r'^angularjs/$', 'sandbox.ramon.views.angular', name='sandbox.views.angular'),

	url(r'^angular/services$', 'ng_services'),

	url(r'^angular/test$', 'test'),

	url(r'^angular/directives$', 'directives'),

	url(r'^vcap-info$', 'show_vinfo'),


	url(r'^tlouder$', 'tlouder'),
	url(r'^multix$', 'multix'),

)
