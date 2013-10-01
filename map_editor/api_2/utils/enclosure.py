# -*- coding: utf-8 -*-
from map_editor.api_2.utils.point import filterAsPois
from map_editor.models import Enclosure, Point
from utils.helpers import queryset_to_dict


def getEnclosureForManager(enclosure_id):
    """
    Muestra toda la info del recinto para el manager
    """
    enclosure = Enclosure.objects.get(id=enclosure_id)

    enclosure_dict = queryset_to_dict([enclosure])[0]

    enclosure_dict['floors'] = []
    for floor in enclosure.floors.all():
        floor_dict = queryset_to_dict([floor])[0]
        points = Point.objects.filter(floor__id=floor.id)
        floor_dict['poi_count'] = filterAsPois(points).count()
        enclosure_dict['floors'].append(floor_dict)

    enclosure_dict['poi_count'] = enclosure.count_pois()

    return enclosure_dict

