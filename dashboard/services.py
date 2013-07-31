# -*- coding: utf-8 -*-


from django.http import HttpResponse
from django.utils.translation import gettext
import simplejson
from dashboard.models import Qr_shot
from map_editor.api_2.utils.label_category import getLabelCategories
from map_editor.models import LabelCategory
from django.db.models import Count



def scans_by_category(request, enclosure_id):
    """
    services/graph/(?P<enclosure_id>\d+)/shots/category/

    Muestra el número de escaneos de QRs para todos los recintos del dueño o para uno dado
    """
    categories = getLabelCategories(enclosure_id)
    c = categories.annotate(num_shots=Count('labels__points__qr_shots'))

    response = [
        {
            'key': gettext('Total de escaneos'),
            'values': []
        }
        # {
        #     "label" : "Connections" ,
        #     "value" : 129.765957771107
        # },...
    ]

    for category in c:
        cat = {
            'label': category.name,
            'color': category.color,
            'value': category.num_shots
        }
        response[0]['values'].append(cat)

    return HttpResponse(simplejson.dumps(response), mimetype='application/json')


def top_scans_by_poi(request, enclosure_id):
    pass