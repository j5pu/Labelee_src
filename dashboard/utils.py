# -*- coding: utf-8 -*-

from django.utils.translation import gettext
from map_editor.api_2.utils.label_category import getLabelCategories
from django.db.models import Count
from map_editor.models import LabelCategory
from map_editor.models import Label


def getLabelsForDashboard(enclosure_id):
    return Label.objects.filter(points__floor__enclosure_id=enclosure_id, category__is_dashboard_category=True).distinct()

def getChartSkeleton(chart_title):
    return [
        {
            'key': chart_title,
            'values': []
        }
        # {
        #     "label" : "Connections" ,
        #     "value" : 129.765957771107
        # },...
    ]


def getScansByCategory(enclosure_id):
    """
    Muestra el número de escaneos de QRs para todos los recintos del dueño o para uno dado
    """
    categories = LabelCategory.objects.filter(labels__points__floor__enclosure__id=enclosure_id).distinct()
    categories = categories.filter(is_dashboard_category=True)
    c = categories.annotate(num_shots=Count('labels__points__qr_shots'))

    chart = getChartSkeleton(gettext('Total de escaneos'))

    for category in c:
        cat = {
            'label': category.name,
            'color': category.color,
            'value': category.num_shots
        }
        chart[0]['values'].append(cat)

    return chart


def getTopScansByPoi(enclosure_id):
    labels = getLabelsForDashboard(enclosure_id)
    l = labels.annotate(num_shots=Count('points__qr_shots')) \
            .order_by('-num_shots')[:10]

    chart = getChartSkeleton(gettext('POIs más escaneados'))

    for label in l:
        lab = {
            'label': label.name,
            'color': label.category.color,
            'value': label.num_shots
        }
        chart[0]['values'].append(lab)

    return chart


def getRoutesByCategory(enclosure_id):
    categories = LabelCategory.objects.filter(labels__points__floor__enclosure__id=enclosure_id).distinct()
    categories = categories.filter(is_dashboard_category=True)
    c = categories.annotate(displayed_destination_count=Count('labels__points__displayed_destination'))

    chart = getChartSkeleton(gettext('Total de rutas'))

    for category in c:
        cat = {
            'label': category.name,
            'color': category.color,
            'value': category.displayed_destination_count
        }
        chart[0]['values'].append(cat)

    return chart


def getTopRoutesByPoi(enclosure_id):
    labels = getLabelsForDashboard(enclosure_id)
    l = labels.annotate(displayed_destination_count=Count('points__displayed_destination')) \
            .order_by('-displayed_destination_count')[:10]

    chart = getChartSkeleton(gettext('Rutas más solicitadas'))

    for label in l:
        lab = {
            'label': label.name,
            'color': label.category.color,
            'value': label.displayed_destination_count
        }
        chart[0]['values'].append(lab)

    return chart
