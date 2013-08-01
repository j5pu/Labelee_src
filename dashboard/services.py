# -*- coding: utf-8 -*-


from django.http import HttpResponse
from django.utils.translation import gettext
import simplejson
from dashboard.models import Qr_shot
from dashboard.utils import getChartSkeleton
from map_editor.api_2.utils.label import getLabelsForDashboard
from map_editor.api_2.utils.label_category import getLabelCategories, filterAsValidCategories
from map_editor.models import LabelCategory
from django.db.models import Count


def scans_by_category(request, enclosure_id):
    """
    /dashboard/scans/(?P<enclosure_id>\d+)/by-category/

    Muestra el número de escaneos de QRs para todos los recintos del dueño o para uno dado
    """
    categories = getLabelCategories(enclosure_id)
    categories = filterAsValidCategories(categories).order_by('name')
    c = categories.annotate(num_shots=Count('labels__points__qr_shots'))

    response = getChartSkeleton(gettext('Total de escaneos'))

    for category in c:
        cat = {
            'label': category.name,
            'color': category.color,
            'value': category.num_shots
        }
        response[0]['values'].append(cat)

    return HttpResponse(simplejson.dumps(response), mimetype='application/json')


def top_scans_by_poi(request, enclosure_id):
    labels = getLabelsForDashboard(enclosure_id)
    l = labels.annotate(num_shots=Count('points__qr_shots'))\
        .order_by('-num_shots')[:10]

    response = getChartSkeleton(gettext('POIs más escaneados'))

    for label in l:
        lab = {
            'label': label.name,
            'color': label.category.color,
            'value': label.num_shots
        }
        response[0]['values'].append(lab)

    return HttpResponse(simplejson.dumps(response), mimetype='application/json')


def routes_by_category(request, enclosure_id):
    categories = getLabelCategories(enclosure_id)
    categories = filterAsValidCategories(categories).order_by('name')
    c = categories.annotate(displayed_destination_count=Count('labels__points__displayed_destination'))

    response = getChartSkeleton(gettext('Total de rutas'))

    for category in c:
        cat = {
            'label': category.name,
            'color': category.color,
            'value': category.displayed_destination_count
        }
        response[0]['values'].append(cat)

    return HttpResponse(simplejson.dumps(response), mimetype='application/json')


def top_routes_by_poi(request, enclosure_id):
    labels = getLabelsForDashboard(enclosure_id)
    l = labels.annotate(displayed_destination_count=Count('points__displayed_destination')) \
            .order_by('-displayed_destination_count')[:10]

    response = getChartSkeleton(gettext('Rutas más solicitadas'))

    for label in l:
        lab = {
            'label': label.name,
            'color': label.category.color,
            'value': label.displayed_destination_count
        }
        response[0]['values'].append(lab)

    return HttpResponse(simplejson.dumps(response), mimetype='application/json')