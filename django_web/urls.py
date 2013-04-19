from django.conf.urls import patterns, include, url
import settings
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from tastypie.api import Api
from map_editor.api.resources import *


v1_api = Api()
v1_api.register(UserResource())
v1_api.register(PlaceResource())
v1_api.register(MapResource())
v1_api.register(GridResource())
v1_api.register(ObjectCategoryResource())
v1_api.register(ObjectResource())
v1_api.register(PointResource())


urlpatterns = patterns('',

    (r'^api/', include(v1_api.urls)),
    # Examples:
    # url(r'^$', 'django_web.views.home', name='home'),
    # url(r'^django_web/', include('django_web.foo.urls')),


    url(r'^api-2/', include('map_editor.api_2.urls')),


    # APP: MAP
    url(r'^map/', include('map.urls')),


    # APP: MAP EDITOR
    url(r'^map-editor/', include('map_editor.urls')),


    # UTIL: DYNAMIC VALIDATOR
    # url(r'^dyn-validate/(?P<resource>.*)/(?P<pk>\d*)$', 'map_editor.views.dynamic_validator', name='map_editor.views.dynamic_validator'),
    # url(r'^dyn-validate/', include('map_editor.api.urls')),


    # url('routesFrom.php?id=' + r'^(\d{1,5})$'
    #     '&row=' + r'^(\d{1,5})$' + '&column=' + r'^(\d{1,5})$',
    #     'map.views.fuera', name='map.views.fuera'),

    # url(r'^routesFrom.php\?id=(\d{1,5})&row=(\d{1,5})&column=(\d{1,5})$',
    #     'map.views.fuera', name='map.views.fuera'),

    url(r'^.*id=([0-9]*)&row=([0-9]*)&column=([0-9]*)$',
        'map.views.fuera', name='map.views.fuera'),


    # url(r'^routes/([0-9]*)/([0-9]*)/([0-9]*)$',
    #     'map.views.fuera', name='map.views.fuera'),
    # url(r'^map-editor$', 'map_editor.views.index', name='index'),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),


    url(r'^sandbox/', include('sandbox.urls')),
    # url(r'^sandbox/ng_services', 'sandbox.views.ng_services'),

)

if settings.DEBUG:
    # static files (images, css, javascript, etc.)
    urlpatterns += patterns('',
        (r'^media/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': settings.MEDIA_ROOT}))

    urlpatterns += patterns('',
        (r'^static/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': settings.STATIC_ROOT}))
