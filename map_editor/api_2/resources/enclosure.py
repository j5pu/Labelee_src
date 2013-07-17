# -*- coding: utf-8 -*-
from django.db.models import Sum
from django.http import HttpResponse
import simplejson
from map_editor.models import Enclosure, LabelCategory, Point
from utils.helpers import *


def manager(request):
    """
    /api-2/enclosure/manager

    Devuelve toda la info de todos los recintos a mostrar en el manager para el usuario
    """
    enclosures = []
    enclosures_query = Enclosure.objects.filter(owner__id=request.user.id)

    for enclosure in enclosures_query:
        enclosure_dict = queryset_to_dict([enclosure])[0]

        enclosure_dict['floors'] = []
        for floor in enclosure.floors.all():
            floor_dict = queryset_to_dict([floor])[0]
            points = Point.objects.filter(floor__id=floor.id)
            floor_dict['poi_count'] = filterAsPois(points).count()
            enclosure_dict['floors'].append(floor_dict)

        enclosure_dict['poi_count'] = enclosure.count_pois()


        categories = LabelCategory.objects.filter(labels__points__floor__enclosure__id=enclosure.id)
        categories_valid_grouped = filterAsValidCategories(categories).distinct()
        enclosure_dict['label_categories'] = queryset_to_dict(categories_valid_grouped)

        for i in range(len(enclosure_dict['label_categories'])):
            enclosure_dict['label_categories'][i]['poi_count'] =\
                Point.objects\
                    .filter(floor__enclosure__id=enclosure_dict['id'])\
                    .filter(label__category__id=enclosure_dict['label_categories'][i]['id'])\
                    .count()


        enclosures.append(enclosure_dict)


    return HttpResponse(simplejson.dumps(enclosures), mimetype='application/json')