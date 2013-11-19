from django.conf.urls import patterns, url
from dashboard import services
from dashboard.services import scans_by_category

urlpatterns = patterns('dashboard.views',

    url(r'^(?P<enclosure_id>\d+)$', 'index', name='dashboard__index'),
    url(r'^(?P<enclosure_id>\d+)/excel/', 'show_excel', name='dashboard__index'),

    # SERVICIOS
    url(r'^Services/CreateDisplayedRoute', 'saveRouteRequest'),
    url(r'^Services/SaveClickOnCategory', 'saveClickOnCategory'),
    url(r'^scans/(?P<enclosure_id>\d+)/by-category/', services.scans_by_category),
    url(r'^scans/(?P<enclosure_id>\d+)/top-pois/', services.top_scans_by_poi),
    url(r'^routes/(?P<enclosure_id>\d+)/by-category/', services.routes_by_category),
    url(r'^routes/(?P<enclosure_id>\d+)/top-pois/', services.top_routes_by_poi),
)
