from django.conf.urls import patterns, url

# /sandbox/..

urlpatterns = patterns('sandbox.views',

	# /sandbox/ramon/angularjs/..

	# url(r'^angularjs/$', 'sandbox.ramon.views.angular', name='sandbox.views.angular'),

	url(r'^angular/services$', 'ng_services'),
)
