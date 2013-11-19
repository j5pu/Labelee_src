from django.conf.urls import *
from django.views.generic import TemplateView
from django.contrib import admin
from django.conf import settings
from django.contrib.auth.models import User

admin.autodiscover()
# admin.site.unregister(User)

# Tastypie
from tastypie.api import Api
from map_editor.api.resources import *
v1_api = Api()
v1_api.register(CustomUserResource())
v1_api.register(EnclosureResource())
v1_api.register(FloorResource())
v1_api.register(LabelCategoryResource())
v1_api.register(LabelResource())
v1_api.register(PointResource())
v1_api.register(QRCodeResource())
v1_api.register(ConnectionResource())
v1_api.register(RouteResource())
v1_api.register(StepResource())
v1_api.register(LogEntryResource())
v1_api.register(CouponForEnclosureResource())
v1_api.register(CouponForLabelResource())


urlpatterns = patterns('',
    # url(r'^$', TemplateView.as_view(template_name="index.html")),

    url(r'^$', 'map.views.qr_code_redirect'),
    url(r'^(\d{5})', 'map.views.show_map_by_id'),

    # APIS
    url(r'^api/', include(v1_api.urls)),
    url(r'^api-2/', include('map_editor.api_2.urls')),

    # APPS:
    url(r'^map/', include('map.urls')),
    url(r'^map-editor/', include('map_editor.urls')),
    url(r'^dashboard/', include('dashboard.urls')),
    url(r'^coupon/', include('coupon_manager.urls')),

    # ADMIN:
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),

    # LOGIN / LOGOUT
    (r'^accounts/login/$', 'django.contrib.auth.views.login'),
    (r'^accounts/logout/$', 'django.contrib.auth.views.logout', {'next_page': '/map-editor/'}),
    (r'^accounts/password/change/$', 'django.contrib.auth.views.password_change', {'post_change_redirect' : '/map-editor/'}),

    # Calculo de rutas
    url(r'^calculate-routes/(?P<enclosure_id>\d+)', 'route.calculateRoutes.calculate_routes'),
    url(r'^refresh-cache/(?P<enclosure_id>\d+)', 'map_editor.api_2.resources.enclosure.refresh_cache'),
    url(r'^qrDownload/(?P<enclosure_id>\d+)', 'map_editor.api_2.resources.enclosure.qrDownload'),
    url(r'^get-route/(?P<origin>\d+)_(?P<destiny>\d+)', 'route.services.get_route'),
    url(r'^get-closest-point/(?P<origin>\d+)_(?P<destiny_site_id>\d+)', 'route.services.get_closest_point'),

    # Para poder crear un superusuario en appfog
    # Allow for a superuser to be created if one does not exist.
    # You're basically asking to be hacked by leaving this uncommented.
    # url(r'^createuser/', 'views.createuser'),

    (r'^media/(?P<path>.*)$', 'django.views.static.serve', {
    'document_root': settings.MEDIA_ROOT}),

    (r'^static/(?P<path>.*)$', 'django.views.static.serve', {
        'document_root': settings.STATIC_ROOT}),

    (r'^sandbox/', include('sandbox.urls')),

    # I18N
    (r'^i18n/', include('django.conf.urls.i18n')),
    (r'^jsi18n/$', 'django.views.i18n.javascript_catalog'),

    (r'^analytics/services/users$', 'analytics.Services.Users.GetUserAnalytics'),

    (r'^log/mobile/$', 'log.views.mobile_logger'),
)


# if not settings.DEBUG:
# static files (images, css, javascript, etc.)
#     urlpatterns += patterns('',
#         (r'^media/(?P<path>.*)$', 'django.views.static.serve', {
#         'document_root': settings.MEDIA_ROOT}),
#
#         (r'^static/(?P<path>.*)$', 'django.views.static.serve', {
#             'document_root': settings.STATIC_ROOT}),
#
#         (r'^sandbox/', include('sandbox.urls')),
#     )
