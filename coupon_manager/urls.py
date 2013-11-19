from django.conf.urls import patterns, url
import services

urlpatterns = patterns('coupon_manager.views',

    url(r'^$', 'index', name='coupon_manager__index'),

    # SERVICIOS
    url(r'^manager/(?P<enclosure_id>\d*)', services.manager),
    url(r'^site/(?P<site_id>\d*)', services.coupons_for_site),
    url(r'^enclosure/(?P<enclosure_id>\d*)', services.coupons_for_enclosure),
)