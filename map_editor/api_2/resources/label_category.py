# -*- coding: utf-8 -*-
from django.core.serializers import serialize
from django.db.models import Sum, Q
from django.http.response import HttpResponse
import simplejson
from map_editor.api_2.utils.label_category import getLabelCategoriesForManager, getLabelCategories
from map_editor.models import LabelCategory
from utils.helpers import to_dict, group_by_pk, queryset_to_dict


def read_only_valid_categories(request, enclosure_id):
    """
    Lee las categorías válidas para pois
    /api-2/label-category/valid/<enclosure_id>
    """

    label_categories = LabelCategory.objects.filter(
        Q(labels__points__floor__enclosure__id = enclosure_id)
        &
        Q(enclosure__id = enclosure_id)
    ).exclude(
        name_es = 'Bloqueantes'
    ).exclude(
        name_es = 'Aseos'
    ).exclude(
        name_es = 'Intermedias'
    ).exclude(
        name_es = 'Parquing'
    ).exclude(
        name_es = 'Pasillo Parking'
    ).annotate(total=Sum('id'))


    return HttpResponse(serialize('json', label_categories), mimetype='application/json')


def readForManager(request, enclosure_id):
    """
    Muestra la info de las categorías para el recinto dado

        /api-2/label-category/manager/<enclosure_id>
    """
    label_categories = getLabelCategoriesForManager(enclosure_id)
    return HttpResponse(simplejson.dumps(label_categories), mimetype='application/json')


def readAll(request, enclosure_id):
    """
    Devuelve la lista todas las categorías, tanto genéricas como personalizadas para el recinto

        /api-2/label-category/<enclosure_id>/all
    """
    categories_dict = []
    categories = getLabelCategories(enclosure_id)
    for category in categories:
        category_dict = queryset_to_dict([category])[0]
        category_dict['labels'] = queryset_to_dict(category.labels.all())
        categories_dict.append(category_dict)

    return HttpResponse(simplejson.dumps(categories_dict), mimetype='application/json')


def readCustom(request, enclosure_id):
    """
    Devuelve la lista de categorías personalizadas para el recinto

        /api-2/label-category/<enclosure_id>/custom
    """
    categories = LabelCategory.objects.filter(enclosure__id=enclosure_id)
    categories_dict = queryset_to_dict(categories)
    return HttpResponse(simplejson.dumps(categories_dict), mimetype='application/json')



