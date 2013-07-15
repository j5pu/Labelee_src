# -*- coding: utf-8 -*-
from django.db.models import Sum
from django.http import HttpResponse
import simplejson
from map_editor.models import Enclosure, LabelCategory
from utils.helpers import queryset_to_dict, group_by_pk, filterAsValidCategories


def manager(request):
    """
    Devuelve toda la info de cada recinto a mostrar en el manager
    """
    enclosures = []
    enclosures_query = Enclosure.objects.filter(owner__id=request.user.id)

    for enclosure in enclosures_query:
        enclosure_dict = queryset_to_dict([enclosure])[0]

        enclosure_dict['floors'] = []
        for floor in enclosure.floors.all():
            floor_dict = queryset_to_dict([floor])[0]
            enclosure_dict['floors'].append(floor_dict)

        enclosure_dict['poi_count'] = enclosure.count_pois()

        categories = LabelCategory.objects.filter(labels__points__floor__enclosure__id=enclosure.id)
        categories_valid_grouped = filterAsValidCategories(categories).annotate(total=Sum('id'))

        enclosure_dict['label_categories'] = queryset_to_dict(categories_valid_grouped)


        enclosures.append(enclosure_dict)


    return HttpResponse(simplejson.dumps(enclosures), mimetype='application/json')