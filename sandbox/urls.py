from django.conf.urls.defaults import *

# /sandbox/..

urlpatterns = patterns('sandbox.views',

	# /sandbox/ramon/angularjs/..

	# url(r'^angularjs/$', 'sandbox.ramon.views.angular', name='sandbox.views.angular'),

	url(r'^angular/services$', 'ng_services'),

	url(r'^angular/test$', 'test'),

	url(r'^angular/directives$', 'directives'),

	url(r'^vcap-info$', 'show_vinfo'),


	# url(r'^tlouder$', 'tlouder'),
	# url(r'^multix$', 'multix'),

	# url(r'^arista$', 'arista'),

	url(r'^imgloader$', 'imgLoader'),


	url(r'^i18n$', 'i18n'),
	url(r'^i18n-2$', 'i18n_2'),

	url(r'^db-log$', 'dblog'),

)
