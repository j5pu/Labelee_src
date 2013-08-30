# -*- coding: utf-8 -*-

from django.http import HttpResponse
import simplejson
from dashboard.utils import *


def scans_by_category(request, enclosure_id):
    chart = getScansByCategory(enclosure_id)
    return HttpResponse(simplejson.dumps(chart), mimetype='application/json')


def top_scans_by_poi(request, enclosure_id):
    chart = getTopScansByPoi(enclosure_id)
    return HttpResponse(simplejson.dumps(chart), mimetype='application/json')


def routes_by_category(request, enclosure_id):
    chart = getRoutesByCategory(enclosure_id)
    return HttpResponse(simplejson.dumps(chart), mimetype='application/json')


def top_routes_by_poi(request, enclosure_id):
    chart = getTopRoutesByPoi(enclosure_id)
    return HttpResponse(simplejson.dumps(chart), mimetype='application/json')