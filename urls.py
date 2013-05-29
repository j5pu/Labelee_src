from django.conf.urls.defaults import *
from django.views.generic import TemplateView
from django.contrib import admin
import settings

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

# Tastypie
from tastypie.api import Api
from map_editor.api.resources import *
v1_api = Api()
v1_api.register(UserResource())
v1_api.register(EnclosureResource())
v1_api.register(FloorResource())
v1_api.register(LabelCategoryResource())
v1_api.register(LabelResource())
v1_api.register(PointResource())
v1_api.register(QRCodeResource())
v1_api.register(ConnectionResource())
v1_api.register(RouteResource())
v1_api.register(StepResource())


urlpatterns = patterns('',
    url(r'^$', TemplateView.as_view(template_name="index.html")),
    
    # APIS
    url(r'^api/', include(v1_api.urls)),
    url(r'^api-2/', include('map_editor.api_2.urls')),
  
    # APPS:
    url(r'^map/', include('map.urls')),
    url(r'^map-editor/', include('map_editor.urls')),

    # ADMIN:
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    # Calculo de rutas
	url(r'^calculate-routes/(?P<enclosure_id>\d+)', 'route.calculateRoutes.calculate_routes'),
	url(r'^get-route/(?P<origin>\d+)_(?P<destiny>\d+)', 'route.services.get_route'),

    # Para poder crear un superusuario en appfog
    # Allow for a superuser to be created if one does not exist.
    # You're basically asking to be hacked by leaving this uncommented.
    # url(r'^createuser/', 'views.createuser'),
)


if settings.DEBUG:
    # static files (images, css, javascript, etc.)
    urlpatterns += patterns('',
        (r'^media/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': settings.MEDIA_ROOT}),

        (r'^static/(?P<path>.*)$', 'django.views.static.serve', {
            'document_root': settings.STATIC_ROOT}),

        (r'^sandbox/', include('sandbox.urls')),
    )
