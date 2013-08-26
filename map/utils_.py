from django.http import HttpResponse
import simplejson
from map_editor.api.resources import *
from map_editor.api_2.resources.point import readOnlyPois
from map_editor.api_2.utils.label_category import read_only_valid_for_enclosure
from map_editor.models import Point
from utils.helpers import queryset_to_dict, t_obj_to_dict


def get_map_data(qr_type, poi_id):
    """
    Devuelve un diccionario con todos los datos necesarios a usar por el JS
    """
    response = {}

    qrPoint = Point.objects.get(pk=poi_id)
    response['qrPoint'] = {
        'point': t_obj_to_dict(PointResource(), qrPoint),
        'floor': t_obj_to_dict(FloorResource(), qrPoint.floor),
        'enclosure': t_obj_to_dict(EnclosureResource(), qrPoint.floor.enclosure),
        'label': t_obj_to_dict(LabelResource(), qrPoint.label),
        'labelCategory': queryset_to_dict([qrPoint.label.category])[0],
        # 'labelCategory': qrPoint.label.category
    }
    response['qrPoint']['isParking'] = qrPoint.label.category.name_en == FIXED_CATEGORIES[3]

    response['label_categories'] = queryset_to_dict(read_only_valid_for_enclosure(qrPoint.floor.enclosure.pk))

    response['floors'] = queryset_to_dict(qrPoint.floor.enclosure.floors.all())

    for floor in response['floors']:
        floor['pois'] = readOnlyPois(floor['id'])

    return response