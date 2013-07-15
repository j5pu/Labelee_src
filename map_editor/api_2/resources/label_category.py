# -*- coding: utf-8 -*-
from django.core.serializers import serialize
from django.db.models import Sum
from django.http.response import HttpResponse
import simplejson
from map_editor.models import LabelCategory
from utils.helpers import to_dict, group_by_pk


def read_only_valid_categories(request, enclosure_id):
    """
    Lee las categorías válidas para pois
    """

    label_categories = LabelCategory.objects.filter(
        labels__points__floor__enclosure__id = enclosure_id
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
